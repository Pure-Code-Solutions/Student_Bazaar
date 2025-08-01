
import { pool } from "../data/pool.js";

export const renderInbox = async (req, res) => {
    const userID = req.user.userID; //HARDCORDE FOR NOW DKPOWF{I;w}
    
    const conversationID =  1; //HARDCORDE FOR NOW DKPOWF{I;w}
    const messages = await getMessagesWithParticipant(conversationID, userID);;
    const conversations = await getAllConversations(userID);
    console.log(messages);
    console.log(conversations);
    res.render("inbox", {userID, messages: messages, conversations: conversations, activeSection: 'messages'});

    
};

export const renderConversation = async (req, res) => {
    const userID = req.user.userID; //HARDCORDE FOR NOW DKPOWF{I;w}
    const conversations = [];
    const conversationID = 1;
    const messages = await getMessagesWithParticipant(conversationID, userID);


    console.log(messages);
    res.render("inbox", {userID, messages: messages,   conversations: conversations,  activeSection: 'api'});
}


async function sendMessage(conversationID, userID, message) {
    //
    await pool.query(`
        INSERT INTO message (conversationID, sender_userID, message, created_at)
        VALUES (${conversationID}, ${userID}, ${message}, NOW())
        `);
};

async function createConversation( userID, recipientID)
{
    const  records = await pool.query(`
        INSERT INTO conversation (creator_userID)
        VALUES (${userID})
        RETURNING conversationID;
        `);

    const conversationID = records[0].conversationID;

    await pool.query(`
        INSERT INTO conversation_recipient (conversationID, recipient_userID) 
        VALUES (${conversationID}, ${userID}), (${conversationID}, ${recipientID});
        `);
    
}


async function getAllConversations(userID)
{
    //Finds the store_name and userID for inbox view in client side
    const [records] = await pool.query(`
        SELECT DISTINCT u.userID, sp.store_name, cr.conversationID
        FROM conversation_recipient cr
        JOIN conversation_recipient cr2 ON cr.conversationID = cr2.conversationID
        JOIN \`user\` u ON cr2.recipient_userID = u.userID
        JOIN seller_profile sp ON sp.sellerID = u.userID
        WHERE cr.recipient_userID = ${userID}
          AND cr2.recipient_userID != ${userID}
        ORDER BY cr.conversationID DESC;
      `);  

    return records[0];
}

async function getMessagesWithParticipant(conversationID, recipientID)
{
    //Get all the messages within the same conversation
    const [records] = await pool.query(`
        SELECT DISTINCT  u.userID, sp.store_name, m.message, m.sender_userID, m.created_at
        FROM conversation_recipient cr
        JOIN \`user\` u ON cr.recipient_userID = u.userID
        JOIN seller_profile sp ON sp.sellerID = u.userID
        JOIN message m ON m.conversationID = ${conversationID}
        WHERE cr.conversationID = ${conversationID}
        ORDER BY m.created_at ASC;
        `);
    return records;
}

async function getUserConversationID(userID, recipientID)
{
    const records = await pool.query(`
        SELECT c.conversationID
        FROM conversation c
        JOIN conversation_recipient cr ON cr.recipient_userID = ${recipientID}
        WHERE c.creator_userID = ${userID};
        `);
}

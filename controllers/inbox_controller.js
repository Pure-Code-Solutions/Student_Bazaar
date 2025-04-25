
import { pool } from "../data/pool.js";

export const renderInbox = async (req, res) => {
    res.render("conversation");

    
};


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
        SELECT DISTINCT  u.userID, sp.store_name, m.message, m.sender_userID
        FROM conversation_recipient cr
        JOIN \`user\` u ON cr.recipient_userID = u.userID
        JOIN seller_profile sp ON sp.sellerID = u.userID
        JOIN message m ON m.conversationID = ${conversationID}
        WHERE cr.conversationID = ${conversationID};
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

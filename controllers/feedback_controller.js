import { pool } from "../data/pool.js";
import { queryItemByID } from "../controllers/shop_controller.js";
export const renderFeedbackForm  = async (req, res) => {
    const itemID = req.params.itemID;
    const item = await queryItemByID(itemID);
    console.log(item);
    res.send('Reviewing for ItemID: ' + itemID);
};


export const submitFeedback = async (req, res) => {
    const customerID = 777; //Hardcoded for now
    const {itemID, sellerID, number_rating, feedback} = body.req;
   // await insertFeedback(itemID, customerID, sellerID, number_rating, feedback); 
    res.send("Successfully submitted feedback");
}

async function insertFeedback(itemID, customerID, sellerID, number_rating, feedback) {
    await pool.query(`
        INSERT INTO feedback
        (itemID, customerID, sellerID, number_rating, feedback)
        VALUES( ?, ?, ?, ?, ?);
    `, [itemID, customerID, sellerID, number_rating, feedback]);
}


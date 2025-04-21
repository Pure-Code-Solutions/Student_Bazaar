import { pool } from "../data/pool.js";

export const renderAccount = async (req, res) => {

    res.render("user-account-dashboard", { activeSection: "dashboard"});
};

export const renderOrders = async (req, res) => {
    const userID = 777; // Hardcoded for now
    const orders = await queryUserOrders(userID);
    const groupedOrders = await sortOrderByPurchaseDate(orders);
    //console.log(groupedOrders);
    
    res.render("user-account-dashboard", { activeSection: "orders", groupedOrders });
};





export const renderSelling = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "selling" });
};

export const renderWatchlist = async (req, res) => {
    const userID = 777; //HARDCODED FOR NOW :)
    const watchlist = await queryWatchlist(userID);
    
    //console.log(watchlist);
    res.render("user-account-dashboard", {activeSection:"watchlist", watchlist })
};

export const renderFeedback = async (req, res) => {
    res.render("user-account-dashboard");
};





export const submitFeedback = async (req, res) => {
    const { sellerID, itemID, feedback, number_rating} = req.body;
    const userID = 777; // Hardcoded for now

    await insertFeedback(userID, sellerID, itemID, number_rating, feedback);

    res.json({ success: true, message: "Feedback submitted successfully" });
}

//Returns all order history from most recent to oldest
export async function queryUserOrders(userID) {
    const [record] = await pool.query(`
    SELECT 
    o.orderID,
    o.purchase_date,
    i.itemID,
    i.sellerID,
    i.name AS item_name,
    sp.store_name,
    oi.itemID,
    oi.quantity,
    oi.price_at_purchase
    FROM \`order\` o
    JOIN order_item oi ON o.orderID = oi.orderID
    JOIN item i ON oi.itemID = i.itemID
    JOIN seller_profile sp ON i.sellerID = sp.sellerID
    WHERE o.userID = ?
    ORDER BY o.purchase_date DESC;

    `, [userID]);
    //console.log(record);
    return record;
}

async function sortOrderByPurchaseDate(orders)
{
    const grouped = {};
    orders.forEach(row => {
    const date = row.purchase_date;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push({
        orderID: row.orderID,
        itemID: row.itemID,
        item_name: row.item_name,
        sellerID: row.sellerID,
        quantity: row.quantity,
        store_name: row.store_name,
        price_at_purchase: row.price_at_purchase
    });
    });
    const groupedOrders = Object.entries(grouped).map(([purchase_date, orders]) => ({
        purchase_date,
        orders
      }));

    return groupedOrders;
}

async function insertFeedback(customerID, sellerID, itemID, number_rating, feedback) {
    const [rows] = await pool.query(`
        INSERT INTO feedback (customerID, sellerID, itemID, number_rating, feedback)
        VALUES (?, ?, ?, ?, ?);
    `, [customerID, sellerID, itemID, number_rating, feedback]);
}

async function queryWatchlist(userID) {
    const [records] = await pool.query(`
        SELECT watchlist.watchlistID,item.name, item.price, item.itemID, item.sellerID
        FROM watchlist
        LEFT JOIN item ON watchlist.itemID = item.itemID
        WHERE watchlist.userID = ?;
        `, [userID]);

    return records;
}
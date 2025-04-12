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

//Returns all order history from most recent to oldest
export async function queryUserOrders(userID) {
    const [record] = await pool.query(`
    SELECT 
    o.orderID,
    o.purchase_date,
    i.itemID,
    i.name AS item_name,
    oi.itemID,
    oi.quantity,
    oi.price_at_purchase
    FROM \`order\` o
    JOIN order_item oi ON o.orderID = oi.orderID
    JOIN item i ON oi.itemID = i.itemID
    WHERE o.userID = ?
    ORDER BY o.purchase_date DESC;;

    `, [userID]);

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
        quantity: row.quantity,
        price_at_purchase: row.price_at_purchase
    });
    });
    const groupedOrders = Object.entries(grouped).map(([purchase_date, orders]) => ({
        purchase_date,
        orders
      }));

    return groupedOrders;
}
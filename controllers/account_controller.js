export const renderAccount = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "dashboard" });
};

export const renderOrders = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "orders" });
};

export const renderSelling = async (req, res) => {
    res.render("user-account-dashboard", { activeSection: "selling" });
};

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
    WHERE o.userID = 777;

    `, [userID]);

    return record;
}
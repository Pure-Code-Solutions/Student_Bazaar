import { pool } from "../data/pool.js";
import { removeItemFromWatchlist } from "./shop_controller.js";

export const renderAccount = async (req, res) => {
  console.log("req.user:", req.user);
  if (!req.user) {
    return res.status(401).send("Unauthorized");
  }

  const userID = req.user.userID;
  const { profilePicture, name, email } = await getUserProfilePicture(userID);

  console.log("Final profilePicture URL:", profilePicture);

  res.render("user-account-dashboard", {
    activeSection: "dashboard", profilePicture,name, email
  });
};

export const renderOrders = async (req, res) => {

  const userID = req.user.userID; // Hardcoded for now
  const orders = await queryUserOrders(userID);
  const groupedOrders = await sortOrderByPurchaseDate(orders);

  const { profilePicture, name, email } = await getUserProfilePicture(userID);

  res.render("user-account-dashboard", {
    activeSection: "orders",
    groupedOrders,
    profilePicture,
    name,
    email
  });
};



export const renderSelling = async (req, res) => {
  const { profilePicture, name, email } = await getUserProfilePicture(userID);
    res.render("user-account-dashboard", { activeSection: "selling", profilePicture,name, email });

}

export const renderListing = async (req, res) => {
  const userID = req.user.userID; // Hardcoded for now
    const listings = await queryListings(req.user.userID); // Hardcoded for now
    const { profilePicture, name, email } = await getUserProfilePicture(userID);
    res.render("user-account-dashboard", { activeSection: "listing", listings, profilePicture,name, email });

  res.render("user-account-dashboard", {
    activeSection: "listing",
    listings,
    profilePicture,
    name,
    email
  });
};



export const renderWatchlist = async (req, res) => {

  const userID = req.user.userID;
  const watchlist = await queryWatchlist(userID);
  const { profilePicture, name, email } = await getUserProfilePicture(userID);

  res.render("user-account-dashboard", {
    activeSection: "watchlist",
    watchlist,
    profilePicture,
    name,
    email
  });

};

export const postWatchlist = async (req, res) => {
  const { itemID } = req.body;
  const userID = req.user.userID;
  console.log(itemID);
  await removeItemFromWatchlist(userID, itemID);
  res.sendStatus(200);
};

export const renderFeedback = async (req, res) => {
  res.render("user-account-dashboard");
};

export const submitFeedback = async (req, res) => {
  const { sellerID, itemID, feedback, number_rating } = req.body;
  const userID = req.user.userID;
  await insertFeedback(userID, sellerID, itemID, number_rating, feedback);
  res.json({ success: true, message: "Feedback submitted successfully" });
};

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

  return record;
}

async function sortOrderByPurchaseDate(orders) {
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
    SELECT watchlist.watchlistID,item.name, item.price, item.itemID, item.sellerID, sp.store_name
    FROM watchlist
    LEFT JOIN item ON watchlist.itemID = item.itemID
    LEFT JOIN seller_profile sp ON  sp.sellerID= item.sellerID
    WHERE watchlist.userID = ?;
  `, [userID]);

  return records;
}

async function queryListings(userID) {
  const [records] = await pool.query(`
    SELECT item.name, item.price, item.itemID, item.sellerID, sp.store_name, item.imageUrl
    FROM item
    LEFT JOIN seller_profile sp ON sp.sellerID = item.sellerID
    WHERE sp.sellerID = ?;
  `, [userID]);

  return records;
}

async function getUserProfilePicture(userID) {
  const [rows] = await pool.query(`
    SELECT profilePicture, first_name AS name, email
    FROM user
    WHERE userID = ?
  `, [userID]);

  const row = rows[0] || {};

  return {
    profilePicture: row.profilePicture || 'https://studentbazaar-bucket.s3.us-west-2.amazonaws.com/defaults/defaultAvatar.png',
    name: row.name || 'Unknown User',
    email: row.email || 'unknown@example.com'
  };
}

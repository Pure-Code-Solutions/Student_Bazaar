import { pool } from "../data/pool.js";
export const renderSellerProfile = async (req, res) => {
  const sellerID = req.params.sellerID;
  const shop = await querySellerShop(sellerID);
  const feedback = await queryFeedback(sellerID);
  const overallRating = await getOverallRating(sellerID);
  const seller = await getSellerProfile(sellerID);

  console.log(feedback);
  //console.log(overallRating);

  res.render('public-profile', {seller, shop, feedback, overallRating});
};

async function querySellerShop(sellerID) {
  const [records] = await pool.query(`
      SELECT * FROM item 
      WHERE sellerID = ?;
    `, [sellerID]);
    return records;
}

async function queryFeedback(sellerID) {
  const [records] = await pool.query(`
      SELECT fd.itemID, fd.number_rating, fd.feedback, u.first_name
      FROM feedback fd
      LEFT JOIN user u ON fd.customerID = u.userID
      WHERE sellerID = ?
    `, [sellerID]);
    return records;
}

async function getRatingSum(sellerID) {
  const [records] = await pool.query(`
      SELECT SUM(feedback.number_rating) AS totalRating
      FROM feedback
      WHERE sellerID = ?;
    `, [sellerID]);
  
  return records[0].totalRating;
}

async function getRatingCount(sellerID) {
  const [records] = await pool.query(`
    SELECT COUNT(feedback.number_rating) AS ratingCount
    FROM feedback
    WHERE sellerID = ?;
    `, [sellerID]);
  
  return records[0].ratingCount;
}

async function getOverallRating(sellerID) {
  const ratingCount = await getRatingCount(sellerID); // Total number of ratings
  const ratingSum = await getRatingSum(sellerID); // Sum of all ratings

  if (ratingCount === 0) {
    return 0; // Avoid division by zero if there are no ratings
  }

  const maxRating = 5; // Maximum possible rating
  const averageRating = ratingSum / ratingCount; // Calculate the average rating
  const percentage = (averageRating / maxRating) * 100; // Calculate the percentage

  return Math.round(percentage); // Return the percentage rounded to the nearest whole number


}

async function getSellerProfile(sellerID) {
  const [records] = await pool.query(`
      SELECT * FROM seller_profile 
      WHERE sellerID = ?;
    `, [sellerID]);
    return records[0];
}
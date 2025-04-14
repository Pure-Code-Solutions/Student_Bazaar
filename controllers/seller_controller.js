import { pool } from "../data/pool.js";
export const renderSellerProfile = async (req, res) => {
  const sellerID = req.params.sellerID;
  const shop = await querySellerShop(sellerID);
  const overallRating = await getOverallRating(sellerID);
  //console.log(shop);
  console.log(overallRating);
  res.send('SellerID: ' + sellerID);
  //res.render('SELLERPAGE', (shop));
};

async function querySellerShop(sellerID) {
  const [records] = await pool.query(`
      SELECT * FROM item 
      WHERE sellerID = ?;
    `, [sellerID]);
    return records[0];
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
  const ratingCount = await getRatingCount(sellerID);
  const ratingSum = await getRatingSum(sellerID);
  const total = ratingCount * 5;
  const overallRating = Math.round(ratingSum/total);
  return overallRating;


}
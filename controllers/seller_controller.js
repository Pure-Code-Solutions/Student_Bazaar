import { pool } from "../data/pool.js";
export const renderSellerProfile = async (req, res) => {
  const sellerID = req.params.sellerID;
  const shop = await querySellerShop(sellerID);
  console.log(shop);
  res.send('SellerID: ' + sellerID);
};

async function querySellerShop(sellerID) {
  const [records] = await pool.query(`
       SELECT * FROM item 
      WHERE sellerID = ?;
    `, sellerID);
    return records;
}
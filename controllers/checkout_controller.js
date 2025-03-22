import { pool } from "../data/pool.js";
export const renderCart = async (req, res) => {
    let cart = await queryItemByID(777);
    console.log(cart);
    console.log(await queryItemByID(777));
    res.render("cart", {cart: cart});
}

//Uses userID to find all items in the cart
const queryItemByID = async (userID) => {
    const [records] = await pool.query(`
        SELECT * FROM cart 
        JOIN cart_item ON cart.cartID = cart_item.cartID
        JOIN item ON cart_item.itemID = item.itemID
        WHERE cart.userID = ?;
    `, [userID]);
    return records;
}
import { pool } from "../data/pool.js";
import { getCartID } from "./shop_controller.js";

export const renderCart = async (req, res) => {
    let cart = await queryCartItems(777);
    const userID = 777; // Hardcoded for now
    const cartID = await getCartID(userID);


    res.render("cart", {cart: cart});
}


export const renderCheckout = async (req, res) => {
    const section = req.params.section || 'shipping-section';
    let cart = await queryCartItems(777);
    const userID = 777; // Hardcoded for now
    let userAddress = await getUserAddress(userID);
    const cartID = await getCartID(userID);

    //console.log(userAddress);
    res.render("checkout", {cart: cart, userAddress, activeSection: section});
}

export const submitAddress = async(req, res) => {
    const  address  = req.body;
    const userID = 777; // Hardcoded for now

    await insertUserAddress(userID, address.country, address.city, address.zip, address.street, address.premise, address.state);

   // console.log(req.body);
    //res.json({ success: true, message: "Address updated successfully" });
}

export const updateItemFromCart = async (req, res) => {
    const { itemID } = req.body;
    const userID = 777; // Hardcoded for now
    const cartID = await getCartID(userID);

    //console.log("Update Cart Request:", { itemID, cartID, body: req.body });

    if (req.body.incrementItem) {

        await incrementItemQuantity(itemID, cartID);
    } else if (req.body.decrementItem) {
 
        if (await getItemQuantity(itemID, cartID) > 1) {
            await decrementItemQuantity(itemID, cartID);
        } else {
            await removeItemFromCart(itemID, cartID);
        }
        res.json({ success: true });
    } else if (req.body.removeItem) {
        console.log("Removing item from cart");
        await removeItemFromCart(itemID, cartID);

    } 


};



async function insertUserAddress(userID, country, city, zip, street, premise, state) {
    console.log(userID + " " + country + " " + city);
    const [rows] = await pool.query(`
        UPDATE studentbazaardb.user_address
        SET country = ?, city = ?, postal_code = ?, street = ?, premise = ?, state = ?
        WHERE userID = '777'`, [country, city, zip, street, premise, state]);
    
    
};

async function getItemQuantity(itemID, cartID) {
    const [records] = await pool.query(`
        SELECT quantity FROM cart_item
        WHERE itemID = ? AND cartID = ?;
    `, [itemID, cartID]);
    //console.log("quantity: ", records[0].quantity);
    
    return records[0].quantity;
}

//Uses userID to find all items in the cart
const queryCartItems = async (userID) => {
    const [records] = await pool.query(`
        SELECT * FROM cart 
        JOIN cart_item ON cart.cartID = cart_item.cartID
        JOIN item ON cart_item.itemID = item.itemID
        WHERE cart.userID = ?;
    `, [userID]);
    return records;
}



async function removeItemFromCart(itemID, cartID) {   
    await pool.query(`
        DELETE FROM cart_item
        WHERE itemID = ? AND cartID =  ?;
    `, [itemID, cartID]);
};


async function decrementItemQuantity (itemID, cartID) {
    
    await pool.query(`
        UPDATE cart_item
        SET quantity = quantity - 1
        WHERE itemID = ? AND cartID =  ?;
    `, [itemID, cartID]);

}

async function incrementItemQuantity (itemID, cartID) {
    await pool.query(`
        UPDATE cart_item
        SET quantity = quantity + 1
        WHERE itemID = ? AND cartID =  ?;
    `, [itemID, cartID]);

}

async function getUserAddress (userID) {
    const [records] = await pool.query(`
        SELECT * FROM user_address
        WHERE userID = ?;
        `, [userID]);
    return records[0];
}
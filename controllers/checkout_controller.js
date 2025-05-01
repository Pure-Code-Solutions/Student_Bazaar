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
    console.log(cart);
    //console.log(cart);
    res.render("checkout", {cart: cart, userAddress, activeSection: section});
}

export const submitAddress = async(req, res) => {
    const  address  = req.body;
    const userID = 777; // Hardcoded for now

    await insertUserAddress(userID, address.country, address.city, address.zip, address.street, address.premise, address.state);

   // console.log(req.body);
    //res.json({ success: true, message: "Address updated successfully" });
}

export const submitOrder = async (req, res) => {
    const userID = 777; // Hardcoded for now
    const cart = await queryCartItems(userID);

    //console.log("Cart: ", cart);
    //console.log("Address ID: ", addressID);

    await insertAllOrderItems(cart);

}

export const updateItemFromCart = async (req, res) => {
    const { itemID, incrementItem, decrementItem, removeItem } = req.body;
    const userID = 777; // Hardcoded for now
    const cartID = await getCartID(userID);

    try {
        if (incrementItem) {
            await incrementItemQuantity(itemID, cartID);
            updateNumberOfItemsInCart(userID, res);
        } else if (decrementItem) {
            if (await getItemQuantity(itemID, cartID) > 1) {
                await decrementItemQuantity(itemID, cartID);
            } else {
                await removeItemFromCart(itemID, cartID);
            }
            updateNumberOfItemsInCart(userID, res);
        } else if (removeItem) {
            await removeItemFromCart(itemID, cartID);
            updateNumberOfItemsInCart(userID, res);
        }
        // Do something, then send a success response
        res.sendStatus(200);
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }


};



async function insertUserAddress(userID, country, city, zip, street, premise, state) {
    console.log(userID + " " + country + " " + city);
    const [rows] = await pool.query(`
        UPDATE user_address
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



export async function removeItemFromCart(itemID, cartID) {   
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
    console.log("User Address: ", records[0]);
    return records[0];
}

async function getItemID (cartID) {
    const [records] = await pool.query(`
        SELECT itemID FROM cart_item
        WHERE cartID = ?;
    `, [cartID]);
    return records[0].itemID;
}

async function insertOrder (userID,  addressID, itemID, quantity, price_at_purchase) {
    const total_price = parseFloat((quantity * price_at_purchase).toFixed(2));
    //Inserts new record in order table
    const [order] = await pool.query(`
        INSERT INTO \`order\` (userID, user_addressID, total_price)
        VALUES (?, ?, ?);
    `, [userID, addressID, total_price]);
    
    const orderID = order.insertId;
    //Insert  record in order_item table
    await pool.query(`
        INSERT INTO order_item (orderID, itemID, quantity, price_at_purchase)
        VALUES(?, ?, ?, ?);`, [orderID, itemID, quantity, price_at_purchase]);
    
}

//Insert each cart item into order
async function insertAllOrderItems (cart) {

    for (let i = 0; i < cart.length; i++) {
        const userID = 777; // Hardcoded for now
        const userAddress = await getUserAddress(userID);
        const addressID = userAddress.user_addressID;

        const cartID = cart[i].cartID;
        const itemID = cart[i].itemID;
        const quantity = cart[i].quantity;
        const price_at_purchase = cart[i].price;
        console.log("addressID: ", addressID);
        

        await insertOrder(userID, addressID, itemID, quantity, price_at_purchase);
        await removeItemFromCart(itemID, cartID);
    }
}


export async function getCartItemCount(userID) {
    const [records] = await pool.query(`
        SELECT SUM(cart_item.quantity) AS totalQuantity
        FROM cart_item
        JOIN cart ON cart_item.cartID = cart.cartID
        WHERE cart.userID = ?;
    `, [userID]);
    return records[0].totalQuantity || 0;
}

export async function updateNumberOfItemsInCart(userID, res) {
    try {
        const cartCount = await getCartItemCount(userID);
        res.locals.user = {
            cartCount: cartCount || 0,
        };
    } catch (error) {
        console.error('Error fetching cart count:', error);
        res.locals.user = { cartCount: 0 };
    }
}
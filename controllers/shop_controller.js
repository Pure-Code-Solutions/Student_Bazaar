//Handles the request and response of the shop page item page
import { pool } from "../data/pool.js";
import { LocalStorage } from "node-localstorage";

const localStorage = new LocalStorage('./scratch');



export const renderShop = async (req, res) => {
     //console.log(await queryItems());
     const limit = 6;  // Number of records per page
     const page = parseInt(req.query.page) || 1;  // Get page number from query string
     const offset = (page - 1) * limit;  // Calculate the offset

     const { category } = req.params;
     const query = req.query.query;
    
 
     //const products = await queryItems(offset, limit);

    let numberOfPages = 0;
    //if query is undefined, then set number of pages to 0
    if(req.query.page == undefined)
    {
        let numberOfPages = 0;
    } else {

        let numberOfPages = Math.ceil(await getNumberOfPages(category)/limit);
    }
    let products = await queryLikeTitles(query, offset, limit);

    //let products = await queryItems(offset, limit);
    

    

    res.render("shop", { 
        query,
        category:  [], 
        products, 
        prices:[],  // Ensure prices is an array, even if empty
        subcategories:  null,  // Ensure subcategories is an array
        numberOfPages: numberOfPages, 
        page 
    });
}

export const renderCategories = async (req, res) => {
    res.render("categories");
}

export const renderShopByCategory = async (req, res) => {


    //Get all query parameters
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;  // Get page number from query string
    const minPrice = parseInt(req.query.minPrice) || 0;
    const maxPrice = parseInt(req.query.maxPrice) || 1000000;

    const limit = 6;  // Number of records per page
    const offset = (page - 1) * limit;  // Calculate the offset

    //Parse tags into an array
    let tags;
    tags = req.query.tags ? req.query.tags.split('|') : []; // Parse tags into an array
    let { category } = req.params;

  
    // Append additional tags based on the category
   //tags.push(category);


    const numberOfPages = Math.ceil(await getNumberOfPages(category,((tags)), minPrice, maxPrice)/limit);
    let products = await queryItemsByFilters(category, tags, minPrice, maxPrice, offset, limit);


   //console.log(products);
    const tagData = {category: category, subcategories: await queryTags(category)};
   // console.log(tagData);


    //const categoryData = subcategories.find(c => c.category === category);


    res.render("shop", {query, category,products, subcategories:tagData, numberOfPages, page});
}


export const renderItemDetail = async (req, res) => 
{

    const item = await queryItemByID(itemID);
    console.log(item);
    res.render("product-detail", {item});
 }


async function getNumberOfPages(category, tags, minPrice, maxPrice) {
 // Ensure tags is an array
 if (typeof tags === "string") {
    tags = tags.split("|");
}
tags = tags || []; // Default to an empty array if tags is null or undefined

const placeholders = tags.map(() => "?").join(",");
let count = [{ total_rows: 0 }];

if (tags.length > 0) {
    [count] = await pool.query(`
        SELECT COUNT(DISTINCT item.itemID) AS total_rows
        FROM item
        JOIN item_tag ON item.itemID = item_tag.itemID
        JOIN tag ON item_tag.tagID = tag.tagID
        JOIN category ON item.categoryID = category.categoryID
        WHERE 
            (${category ? "category.name = ?" : "1=1"}) -- Match category by name
            AND tag.name IN (${placeholders}) -- Match any of the tags
            AND item.price BETWEEN ? AND ?;
    `, [
        ...(category ? [category] : []), // Add category name to query parameters if it exists
        ...tags, // Add tags to query parameters
        minPrice,
        maxPrice,
    ]);
} else {
    [count] = await pool.query(`
        SELECT COUNT(*) AS total_rows
        FROM item
        JOIN category ON item.categoryID = category.categoryID
        WHERE 
            (${category ? "category.name = ?" : "1=1"}) -- Match category by name
            AND item.price BETWEEN ? AND ?;
    `, [
        ...(category ? [category] : []),
        minPrice,
        maxPrice,
    ]);
}

return count[0].total_rows;
}

export const postAddToCart = async (req, res) => {
    //Post request made when add cart button is clicked
    const { itemID } = req.body;
    const userID = 777; // Hardcoded user ID for now


    const cartID = await getCartID(userID);
    await insertItemToCart(itemID, cartID);
    //res.redirect("/cart");
}

async function queryItems(offset, limit)
{
    const [records] = await pool.query(`
        SELECT 
        item.*,                         
        seller_profile.store_name AS seller_name,  
        GROUP_CONCAT(tag.name SEPARATOR ', ') AS tags
        FROM item
        JOIN seller_profile ON item.sellerID = seller_profile.sellerID
        JOIN item_tag ON item.itemID = item_tag.itemID
        JOIN tag ON item_tag.tagID = tag.tagID
        GROUP BY item.itemID, seller_profile.store_name
        LIMIT ${limit} OFFSET ${offset};
    `);


    return records;

}

async function queryItemsByFilters(category, tags, minPrice, maxPrice, offset, limit) {
     
        // Ensure `tags` is an array
    if (typeof tags === "string") {
        tags = tags.split("|");
    }
    tags = tags || []; // Default to an empty array if tags is null or undefined

    // Prepare placeholders for tags
    const placeholders = tags.map(() => "?").join(",");

    const query = `
        SELECT item.*,                         
            seller_profile.store_name AS seller_name,  
            GROUP_CONCAT(DISTINCT tag.name SEPARATOR ', ') AS tags
        FROM item
        JOIN seller_profile ON item.sellerID = seller_profile.sellerID
        JOIN item_tag ON item.itemID = item_tag.itemID
        JOIN tag ON item_tag.tagID = tag.tagID
        JOIN category ON item.categoryID = category.categoryID
        WHERE 
            (${category ? "category.name = ?" : "1=1"}) -- Match category by name
            ${tags.length > 0 ? `AND (tag.name IN (${placeholders}))` : ""} -- Match any of the tags (union)
            AND item.price BETWEEN ? AND ?
        GROUP BY item.itemID, seller_profile.store_name
        LIMIT ${limit} OFFSET ${offset};
    `;

    const queryParams = [
        ...(category ? [category] : []), // Add category name to query parameters if it exists
        ...tags, // Add tags to query parameters
        minPrice,
        maxPrice,
    ];

    const [records] = await pool.query(query, queryParams);

    return records;
}

async function queryLikeTitles(value, offset, limit) 
{   
    const [records] = await pool.query(`
        SELECT 
        item.*,                         
        seller_profile.store_name AS seller_name,  
        GROUP_CONCAT(tag.name SEPARATOR ', ') AS tags
        FROM item
        JOIN seller_profile ON item.sellerID = seller_profile.sellerID
        JOIN item_tag ON item.itemID = item_tag.itemID
        JOIN tag ON item_tag.tagID = tag.tagID
        WHERE item.name LIKE '%${value}%'
        GROUP BY item.itemID, seller_profile.store_name
        LIMIT ${limit} OFFSET ${offset};
    `);

    return records;
}

async function queryItemByID(itemID)
{
    const [records] = await pool.query(`
        SELECT 
        item.*,                         
        seller_profile.store_name AS seller_name,  
        GROUP_CONCAT(tag.name SEPARATOR ', ') AS tags
        FROM item
        JOIN seller_profile ON item.sellerID = seller_profile.sellerID
        JOIN item_tag ON item.itemID = item_tag.itemID
        JOIN tag ON item_tag.tagID = tag.tagID
        WHERE item.itemID = ${itemID}
        GROUP BY item.itemID, seller_profile.store_name;
    `);

    return records[0];
}

//Insert items into cart
async function insertItemToCart(itemID, cartID) {
    const [existingItem] = await pool.query(`
        SELECT quantity FROM cart_item WHERE cartID = ? AND itemID = ?;
    `, [cartID, itemID]);

    if (existingItem.length > 0) {
        // Update the quantity if the item already exists in the cart
        await pool.query(`
            UPDATE cart_item SET quantity = quantity + 1 WHERE cartID = ? AND itemID = ?;
        `, [cartID, itemID]);
    } else {
        // Insert the item if it does not exist in the cart
        await pool.query(`
            INSERT INTO cart_item (cartID, itemID, quantity)
            VALUES (?, ?, 1);
        `, [cartID, itemID]);
    }
}

export async function getCartID(userID){
    const [records] = await pool.query(`
        SELECT cartID FROM cart WHERE userID = ?;
    `, userID);

    return records[0].cartID;
}
export async function queryCategoryAndTags() {
    const [records] = await pool.query(`
        SELECT 
            c.name AS category, 
            GROUP_CONCAT(t.name SEPARATOR ', ') AS tags
        FROM category_tag ct
        JOIN category c ON ct.categoryID = c.categoryID
        JOIN tag t ON ct.tagID = t.tagID
        GROUP BY c.name
        ORDER BY c.name;
    `);

    return records.map(record => ({
        category: record.category,
        tags: record.tags ? record.tags.split(', ') : []
    }));
}


export async function queryTags(category) {
    const [records] = await pool.query(`
        SELECT 
            t.name AS tag
        FROM category_tag ct
        JOIN category c ON ct.categoryID = c.categoryID
        JOIN tag t ON ct.tagID = t.tagID
        WHERE c.name = ?
        ORDER BY t.name;
    `, category);

    return records.map(r => r.tag);
}

export async function queryCategories() {
    const [records] = await pool.query(`
        SELECT name FROM category;
    `);

    return records.map(r => r.name);
}
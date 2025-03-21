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
    //console.log(await queryItems());

    const limit = 6;  // Number of records per page
    const page = parseInt(req.query.page) || 1;  // Get page number from query string
    const offset = (page - 1) * limit;  // Calculate the offset


    const query = req.query.query;
    let tags;
    tags = req.query.tags ? req.query.tags.split('|') : []; // Parse tags into an array
    let { category } = req.params;

    //console.log(tags);


    // Append additional tags based on the category
    if (category) {
        tags.push(category);
    }
    const numberOfPages = Math.ceil(await getNumberOfPages(tags)/limit);
    let products = await queryItemsByTags(tags, offset, limit);



    //console.log(products);
    const subcategories = [
        { category: "Textbooks", subcategories: ["Science", "Mathematics", "Engineering", "Arts", "Business", "Law", "Government", "Biology", "Chemistry"] },
        { category: "Electronics", subcategories: ["Laptops", "Tablets", "Smartphones", "Monitors", "Printers", "Headphones"] },
        { category: "Stationery", subcategories: ["Notebooks", "Pens", "Highlighters", "Planners", "Study Supplies", "Art Supplies"] },
        { category: "Campus-Gear", subcategories: ["Backpacks", "University Hoodies", "T-Shirts", "Water Bottles", "Keychains"] },
        { category: "Tech-Accessories", subcategories: ["Headphones", "Chargers", "Laptop Sleeves", "USB Drives", "Screen Protectors"] },
        { category: "Lab-Equipment", subcategories: ["Medical Tools", "Microscopes", "Multimeters", "Beakers", "Circuit Kits"] }
    ];

    
    const prices = [
        { range: "Under $25", min: 0, max: 25 },
        { range: "$25 - $50", min: 25, max: 50 },
        { range: "$50 - $100", min: 50, max: 100 },
        { range: "$100 - $200", min: 100, max: 200 },
        { range: "$200+", min: 200, max: null }
    ];

    const categoryData = subcategories.find(c => c.category === category);

    if (!categoryData) {
        return res.status(404).send("Category not found");
    }
    res.render("shop", {query, category,products, prices, subcategories: categoryData, numberOfPages, page});
}


export const renderItemDetail = async (req, res) => 
{
    const  itemID  = req.params.item;
    const item = await queryItemByID(itemID);

    res.render("product-detail", {item});
 }


async function getNumberOfPages(tags) {
    // Ensure tags is an array
    if (typeof tags === "string") {
        tags = tags.split("|");
    }
    tags = tags || []; // Default to an empty array if tags is null or undefined

    const placeholders = tags.map(() => "?").join(",");
    let count = [{ total_rows: 0 }];

    if (tags.length > 0) {
        [count] = await pool.query(`
            SELECT COUNT(*) AS total_rows FROM (
                SELECT item.itemID
                FROM item
                JOIN item_tag ON item.itemID = item_tag.itemID
                JOIN tag ON item_tag.tagID = tag.tagID
                WHERE tag.name IN (${placeholders})
                GROUP BY item.itemID
                HAVING COUNT(DISTINCT tag.name) = ?
            ) AS matched_items;
        `, [...tags, tags.length]); // Pass tags and their count to the query
    } else {
        [count] = await pool.query(`
            SELECT COUNT(*) AS total_rows FROM item;
        `);
    }

    return count[0].total_rows;
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

async function queryItemsByTags(tags, offset, limit)
{
    

    const placeholders =  tags.map(() => "?").join(",");
    console.log("Placeholders:", placeholders);
    const [records] = await pool.query(`
        SELECT item.*,                         
        seller_profile.store_name AS seller_name,  
        GROUP_CONCAT(tag.name SEPARATOR ', ') AS tags
        FROM item
        JOIN seller_profile ON item.sellerID = seller_profile.sellerID
        JOIN item_tag ON item.itemID = item_tag.itemID
        JOIN tag ON item_tag.tagID = tag.tagID
        WHERE tag.name IN (${placeholders})
        GROUP BY item.itemID, seller_profile.store_name
        HAVING COUNT(DISTINCT tag.name) = ?
        LIMIT ${limit} OFFSET ${offset};
    `, [...tags, tags.length]); // Pass tags and their count to the query

    console.log(records);
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
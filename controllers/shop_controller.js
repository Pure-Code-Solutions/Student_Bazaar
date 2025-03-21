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

    console.log("query:" + query);  
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

    const { category } = req.params;
    const query = req.query.query;
    const numberOfPages = Math.ceil(await getNumberOfPages(category)/limit);
    let products = await queryItemsByCategory(category, offset, limit);


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

    const tempItem =  getObjectByKey(tempProducts, 'id', itemID);
    res.render("product-detail", {item:tempItem});
 }

function getObjectByKey(list, key, value) {
    for (let i = 0; i < list.length; i++) {
        if (list[i][key] === value) {
        return list[i];
        }
    }
    return undefined;
    }

async function getNumberOfPages(category) {
    let count = [{total_rows: 0}];
    //Based count on whether category is defined
    if(category)
     {
        [count] = await pool.query(`
            SELECT COUNT(*) AS total_rows FROM item
            JOIN item_tag ON item.itemID = item_tag.itemID
            JOIN tag ON item_tag.tagID = tag.tagID
            WHERE tag.name = (?);
            `, category);
    } else {
         [count] = await pool.query(`
            SELECT COUNT(*) AS total_rows FROM item;`);
    }
    console.log("category: " + category);
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

async function queryItemsByCategory(category, offset, limit)
{

    const [records] = await pool.query(`
        SELECT DISTINCT item.*,                         
        seller_profile.store_name AS seller_name,  
        GROUP_CONCAT(tag.name SEPARATOR ', ') AS tags
        FROM item
        JOIN seller_profile ON item.sellerID = seller_profile.sellerID
        JOIN item_tag ON item.itemID = item_tag.itemID
        JOIN tag ON item_tag.tagID = tag.tagID
        WHERE tag.name = (?)
        GROUP BY item.itemID, seller_profile.store_name 
        LIMIT ${limit} OFFSET ${offset};
    `, category);

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
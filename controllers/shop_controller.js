//Handles the request and response of the shop page item page
import { pool } from "../data/pool.js";
import { LocalStorage } from "node-localstorage";

const localStorage = new LocalStorage('./scratch');


localStorage.setItem("cursor", 1);
const tempProducts = [
    { id: "1", name: "Scientific Calculator", price: "24.99", number_stars: 2 },
    { id: "2", name: "Wireless Mouse", price: "19.99", number_stars: 3 },
    { id: "3", name: "Laptop Stand", price: "35.00", number_stars: 4 },
    { id: "4", name: "Noise-Canceling Headphones", price: "89.99", number_stars: 5},
    { id: "5", name: "Graph Paper Notebook", price: "7.99", number_stars: 5},
    { id: "6", name: "Mechanical Keyboard", price: "49.99", number_stars: 5 },
    { id: "7", name: "USB Flash Drive (64GB)", price: "12.99", number_stars: 1 },
    { id: "8", name: "Ergonomic Backpack", price: "59.99", number_stars: 5 },
    { id: "9", name: "Adjustable Desk Lamp", price: "29.99", number_stars: 5 },
    { id: "10", name: "Reusable Smart Notebook", price: "38.99", number_stars:4 },
    { id: "11", name: "Portable Power Bank", price: "34.99", number_stars: 5 },
    { id: "12", name: "Desk Organizer Set", price: "22.99", number_stars: 5 }
];
export const renderShop = async (req, res) => {
    let empty = [{}];
    const query = req.query.query;
    console.log("query: ", query);
    res.render("shop", { 
        query,
        category:  [], 
        products:[], 
        prices:[],  // Ensure prices is an array, even if empty
        subcategories:  null,  // Ensure subcategories is an array
        numberOfPages: 0, 
        page: 0 
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

    //console.log(localStorage.getItem("cursor"));
    const products = await queryItems(offset, limit);

    const { category } = req.params;
    const query = req.query.query;
    //console.log("tags: " + subcategory + "prices: " + pricesParam);



    //console.log(products);
    const subcategories = [
        { category: "Textbooks", subcategories: ["Science", "Mathematics", "Engineering", "Arts", "Business", "Law", "Government", "Biology", "Chemistry"] },
        { category: "Electronics", subcategories: ["Laptops", "Tablets", "Smartphones", "Monitors", "Printers", "Headphones"] },
        { category: "Stationery", subcategories: ["Notebooks", "Pens", "Highlighters", "Planners", "Study Supplies", "Art Supplies"] },
        { category: "Campus-Gear", subcategories: ["Backpacks", "University Hoodies", "T-Shirts", "Water Bottles", "Keychains"] },
        { category: "Tech-Accessories", subcategories: ["Headphones", "Chargers", "Laptop Sleeves", "USB Drives", "Screen Protectors"] },
        { category: "Lab-Equipment", subcategories: ["Medical Tools", "Microscopes", "Multimeters", "Beakers", "Circuit Kits"] }
    ];
    const  relevant_courses = [
        {subject:"Math"},
        {subject:"Science"}, 
        {subject: "Language"}
    ]
    
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
    res.render("shop", {query, category,products, prices, subcategories: categoryData, numberOfPages: Math.ceil(await getNumberOfPages()/6), page});
}


export const renderItemDetail = async (req, res) => 
{
    const  itemID  = req.params.item;
    console.log("itemID: ", itemID);
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

async function getNumberOfPages() {
    const [count] = await pool.query(`SELECT COUNT(*) AS total_rows FROM item`);
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

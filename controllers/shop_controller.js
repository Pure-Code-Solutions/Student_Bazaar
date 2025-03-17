//Handles the request and response of the shop page item page
//import { connection } from "../data/pool.js";


const tempNumberOfPages = 3;
export const renderShop = async (req, res) => {

    res.render("shop", {products});
}

export const renderCategories = async (req, res) => {
    res.render("categories");
}

export const renderShopByCategory = async (req, res) => {

    const { category } = req.params;
    const { subcategory} = req.query;
    console.log("tags: ",subcategory);
    const page = parseInt(req.query.page) || 1;
    const tempLimit = 4; //Items per page
    const offset = (page - 1) * tempLimit;
    const products = await fetchProductsFromDB(tempLimit, offset);
    //console.log(products);
    const subcategories = [
        { category: "Textbooks", subcategories: ["Science", "Mathematics", "Engineering", "Arts", "Business", "Law"] },
        { category: "Electronics", subcategories: ["Laptops", "Tablets", "Smartphones", "Monitors", "Printers"] },
        { category: "Stationery", subcategories: ["Notebooks", "Pens", "Highlighters", "Planners", "Study Supplies"] },
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
    res.render("shop", {category,products, prices, subcategories: categoryData, numberOfPages: tempNumberOfPages, page});
}


async function fetchProductsFromDB(limit, offset)
{
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


    return tempProducts.slice(offset, limit+offset);
}

//Handles the request and response of the shop page item page
//import { connection } from "../data/pool.js";

export const renderShop = async (req, res) => {
    const products = [{
        name: "Notebook 1",
        price: "1000"
    }]
    res.render("shop", {products});
}

export const renderCategories = async (req, res) => {
    res.render("categories");
}

export const renderShopByCategory = async (req, res) => {
    const { category } = req.params;
    const products = [{
        name: "Notebook 1",
        price: "1000"
    }];
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
    res.render("shop", {category, products, prices, subcategories: categoryData});
}


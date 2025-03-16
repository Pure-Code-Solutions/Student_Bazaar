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


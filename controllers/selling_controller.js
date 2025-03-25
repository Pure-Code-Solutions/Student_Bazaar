import { queryCategoryAndTags } from "./shop_controller.js";

export const renderCreateListing = async (req, res) => {
    const categories = await queryCategoryAndTags();

    res.render("add-new-listing", {categories: categories});
};
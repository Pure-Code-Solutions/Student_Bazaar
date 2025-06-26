import { pool } from "../data/pool.js";
import { queryCategoryAndTags } from "./shop_controller.js";

export const renderCreateListing = async (req, res) => {
    const categories = await queryCategoryAndTags();

    res.render("add-new-listing", {categories: categories});
};

export const postListing = async (req, res) => {

	const imageUrl = req.body.imageUrl || null;

    const { category, tags, title, price, description, condition } = req.body;


    console.log('Category:', category);
    console.log('Tags:', tags); // This will be an array of selected tags
    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Condition:', condition);

    // Process the data (e.g., save to the database)
    if (!Array.isArray(tags)) {
        return res.status(400).send('Tags must be an array');
    }

	
    await createListing(req.user.userID, title, category, tags, price, description, imageUrl);//Hardcoded for now
	res.status(201).json({ message: 'Item listed successfully' });
}



async function createListing(sellerID, name, categoryName, tags, price, description, imageUrl = null) {

    const [categoryResult] = await pool.query(`
        SELECT categoryID FROM category WHERE name = ?;
    `, [categoryName]);

    if (categoryResult.length === 0) {
        throw new Error('Category not found');
    }
    console.log('Category Result:', categoryResult);
    const categoryID = categoryResult[0].categoryID;

    const [itemResult] = await pool.query(`

        INSERT INTO item (sellerID, name, price, categoryID, description)
        VALUES (?, ?, ?, ?);
    `, [sellerID, name, price, categoryID,  description]);



    const itemID = itemResult.insertId;

    for (const tagName of tags) {
        const [tagResult] = await pool.query(`
            SELECT tagID FROM tag WHERE name = ?;
        `, [tagName]);

        if (tagResult.length === 0) {
            throw new Error(`Tag not found: ${tagName}`);
        }

        const tagID = tagResult[0].tagID;

        await pool.query(`
            INSERT INTO item_tag (itemID, tagID)
            VALUES (?, ?);
        `, [itemID, tagID]);
    }
}
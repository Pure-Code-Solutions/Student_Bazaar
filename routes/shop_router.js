import Router from "express";
import {renderCategories, renderShop, renderItemDetail, renderShopByCategory, postAddToCart } from "../controllers/shop_controller.js";
export const shopRouter = Router();

//Direct to shop page and item page
shopRouter.use((req, res, next) => {
    res.locals.user = {
        cartCount: 10,
      };
      next();
});
shopRouter.get("/shop", renderShop);
shopRouter.get("/shop/:category", renderShopByCategory);
shopRouter.post("/shop", postAddToCart);
shopRouter.get("/categories", renderCategories);
shopRouter.get("/item/:item", renderItemDetail);
shopRouter.post("/item", postAddToCart);
shopRouter.get("/sidebar",  
    async (req, res) => {
    res.render("sidebar");
} )
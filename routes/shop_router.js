import Router from "express";
import {renderCategories, renderShop, renderItemDetail, renderShopByCategory, postItemDetail, postAddToCart } from "../controllers/shop_controller.js";
export const shopRouter = Router();


shopRouter.get("/shop", renderShop);
shopRouter.get("/shop/:category", renderShopByCategory);
///shopRouter.post("/shop", postAddToCart);
shopRouter.get("/categories", renderCategories);
shopRouter.get("/item/:item", renderItemDetail);
shopRouter.post("/item/:item", postItemDetail);

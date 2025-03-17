import Router from "express";
import { renderCategories, renderShop, renderShopByCategory } from "../controllers/shop_controller.js";
export const shopRouter = Router();

//Direct to shop page and item page
shopRouter.get("/shop", renderShop);
shopRouter.get("/shop/:category", renderShopByCategory);
shopRouter.get("/categories", renderCategories);
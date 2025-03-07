import Router from "express";
import { renderShop } from "../controllers/shop_controller.js";
export const shopRouter = Router();

//Direct to shop page and item page
shopRouter.get("/shop", renderShop);
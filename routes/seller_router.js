import Router from "express";
import { renderSellerProfile } from "../controllers/seller_controller.js";

export const sellerRouter = Router();


sellerRouter.get("/:sellerID", renderSellerProfile);
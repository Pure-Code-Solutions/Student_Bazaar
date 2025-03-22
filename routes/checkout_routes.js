import Router from "express";
import {renderCart } from "../controllers/checkout_controller.js";
export const checkoutRouter = Router();


checkoutRouter.get("/cart", renderCart);

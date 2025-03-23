import Router from "express";
import {updateItemFromCart, renderCart } from "../controllers/checkout_controller.js";
export const checkoutRouter = Router();

checkoutRouter.use((req, res, next) => {
    res.locals.user = {
        cartCount: 10,
      };
      next();
});
 
checkoutRouter.get("/cart", renderCart);
checkoutRouter.post("/cart", updateItemFromCart);

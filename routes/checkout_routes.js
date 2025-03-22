import Router from "express";
import {renderCart } from "../controllers/checkout_controller.js";
export const checkoutRouter = Router();

checkoutRouter.use((req, res, next) => {
    res.locals.user = {
        cartCount: 10,
      };
      next();
});
 
checkoutRouter.get("/cart", renderCart);

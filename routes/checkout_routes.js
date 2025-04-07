import Router from "express";
import {updateItemFromCart, renderCart, renderCheckout, submitAddress, submitOrder } from "../controllers/checkout_controller.js";
import { check } from "express-validator";
export const checkoutRouter = Router();

checkoutRouter.use((req, res, next) => {
    res.locals.user = {
        cartCount: 10,
      };
      next();
});
 
checkoutRouter.get("/cart", renderCart);
checkoutRouter.post("/cart", updateItemFromCart);
checkoutRouter.get("/checkout", renderCheckout);
checkoutRouter.get("/checkout/:section", (req, res, next) => {
    if (req.params.section) {
        // Add logic to handle specific sections if needed
        return renderCheckout(req, res, next);
    }
    next();
});
checkoutRouter.post("/checkout/shipping-section", submitAddress);
checkoutRouter.post("/checkout/review-section", submitOrder);
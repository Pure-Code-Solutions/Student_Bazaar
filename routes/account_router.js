import Router from "express";
import { renderAccount, renderOrders, renderSelling } from "../controllers/account_controller.js";
import { render } from "ejs";
export const accountRouter = Router();

accountRouter.use((req, res, next) => {
    res.locals.user = {
        cartCount: 10,
      };
      next();
});

accountRouter.get("/account/dashboard", renderAccount);
accountRouter.get("/account/orders", renderOrders);
accountRouter.get("/account/selling", renderSelling);
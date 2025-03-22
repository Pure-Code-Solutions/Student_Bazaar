import Router from "express";
import { renderAccount } from "../controllers/account_controller.js";
export const accountRouter = Router();

accountRouter.use((req, res, next) => {
    res.locals.user = {
        cartCount: 10,
      };
      next();
});

accountRouter.get("/account", renderAccount);
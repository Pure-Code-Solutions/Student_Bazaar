import Router from "express";
import { renderAccount, renderOrders, renderSelling, renderWatchlist } from "../controllers/account_controller.js";
import { render } from "ejs";
import { pool } from "../data/pool.js";
export const accountRouter = Router();



accountRouter.get("/account", (req, res) => {
  res.redirect("/account/dashboard");
});
accountRouter.get("/dashboard", renderAccount);
accountRouter.get("/orders", renderOrders);
accountRouter.get("/selling", renderSelling);
accountRouter.get("/watchlist", renderWatchlist);
accountRouter.get("/feedback");

import Router from "express";
import { postWatchlist, renderAccount, renderOrders, renderListing, renderWatchlist, submitFeedback } from "../controllers/account_controller.js";

import { render } from "ejs";
import { pool } from "../data/pool.js";
export const accountRouter = Router();



accountRouter.get("/account", (req, res) => {
  res.redirect("/account/dashboard");
});
accountRouter.get("/dashboard", renderAccount);
accountRouter.get("/orders", renderOrders);
accountRouter.post("/orders", submitFeedback);
accountRouter.get("/listing", renderListing);
accountRouter.get("/watchlist", renderWatchlist);
accountRouter.post("/watchlist", postWatchlist);


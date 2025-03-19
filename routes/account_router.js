import Router from "express";
import { renderAccount } from "../controllers/account_controller.js";
export const accountRouter = Router();


accountRouter.get("/account", renderAccount);
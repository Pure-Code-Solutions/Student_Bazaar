import Router from "express";
import { postListing, renderCreateListing } from "../controllers/selling_controller.js";
export const sellingRouter = Router();

sellingRouter.get("/list", renderCreateListing);
sellingRouter.post("/list", postListing);
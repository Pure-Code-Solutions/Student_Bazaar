import Router from "express";
import { renderCreateListing } from "../controllers/selling_controller.js";
export const sellingRouter = Router();

sellingRouter.get("/list", renderCreateListing);
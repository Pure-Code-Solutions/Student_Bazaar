import Router from "express";
import { renderLanding } from "../controllers/home_controller.js";
export const homeRouter = Router();


homeRouter.get("/", renderLanding);
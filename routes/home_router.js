import Router from "express";
import { renderLanding } from "../controllers/home_controller.js";
export const homeRouter = Router();

//Direct to landing and about page
homeRouter.get("/", renderLanding);
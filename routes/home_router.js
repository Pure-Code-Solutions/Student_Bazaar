import Router from "express";
import { renderLanding } from "../controllers/home_controller.js";
export const homeRouter = Router();

//Direct to landing and about page
homeRouter.use((req, res, next) => {
    res.locals.user = {
        cartCount: 10,
      };
      next();
});
homeRouter.get("/", renderLanding);
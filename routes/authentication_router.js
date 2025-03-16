import Router from "express";
import { renderLogin, renderRegister } from "../controllers/authentication_controller.js";
export const authenticationRouter = Router();


authenticationRouter.get("/login", renderLogin);
authenticationRouter.get("/register", renderRegister);
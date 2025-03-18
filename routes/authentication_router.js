import Router from "express";
import {postRegister, renderRegister, renderSignin, postRegister } from "../controllers/authentication_controller.js";
export const authenticationRouter = Router();


authenticationRouter.get("/signin", renderSignin);
authenticationRouter.get("/register", renderRegister);
authenticationRouter.post("/register", postRegister);
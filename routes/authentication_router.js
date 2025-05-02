import Router from "express";
import {
  renderRegister,
  renderSignin,
  postRegister,
  getAuthenticateGoogle,
  getGoogleCallback
} from "../controllers/authentication_controller.js";

export const authenticationRouter = Router();

authenticationRouter.get("/signin", renderSignin);
authenticationRouter.get("/register", renderRegister);
authenticationRouter.post("/register", postRegister);
authenticationRouter.get("/auth/google", getAuthenticateGoogle);
authenticationRouter.get("/auth/google/callback", getGoogleCallback);
import Router from "express";
import { renderRegister, renderSignin, postRegister } from "../controllers/authentication_controller.js";
export const authenticationRouter = Router();

authenticationRouter.use((req, res, next) => {
    res.locals.user = {
        cartCount: 10,
      };
      next();
});
authenticationRouter.get("/signin", renderSignin);
authenticationRouter.get("/register", renderRegister);
authenticationRouter.post("/register", postRegister);

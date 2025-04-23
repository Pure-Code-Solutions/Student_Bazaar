import Router from "express";
import { renderInbox } from "../controllers/inbox_controller.js";
export const inboxRouter = Router();


inboxRouter.get("/", renderInbox);
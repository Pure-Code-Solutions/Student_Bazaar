import Router from "express";
import { renderInbox, renderConversation } from "../controllers/inbox_controller.js";
export const inboxRouter = Router();


inboxRouter.get("/", renderInbox);
inboxRouter.get ("/conversaton", renderConversation);
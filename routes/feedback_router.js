import Router from "express";
import { renderFeedbackForm } from "../controllers/feedback_controller.js";
import { submitFeedback } from "../controllers/account_controller.js";
export const feedbackRouter = Router();


feedbackRouter.get("/:itemID", renderFeedbackForm);
feedbackRouter.post("/:item", submitFeedback);
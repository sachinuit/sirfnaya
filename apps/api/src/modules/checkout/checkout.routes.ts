import { Router } from "express";
import { checkoutController } from "./checkout.controller.js";
import { authenticate } from "../../middleware/index.js";

const router = Router();

router.post("/create-session", authenticate, checkoutController.createSession);

export { router as checkoutRouter };

import { Router } from "express";
import { settingsController } from "./settings.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

router.get("/", settingsController.get);
router.put("/", authenticate, authorize("ADMIN"), settingsController.update);

export { router as settingsRouter };

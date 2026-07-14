import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", adminController.dashboard);

export { router as adminRouter };

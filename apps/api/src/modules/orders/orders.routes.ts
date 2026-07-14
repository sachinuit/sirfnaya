import { Router } from "express";
import { ordersController } from "./orders.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

router.get("/", authenticate, ordersController.list);
router.get("/:id", authenticate, ordersController.getById);
router.put("/:id/status", authenticate, authorize("ADMIN"), ordersController.updateStatus);

export { router as orderRouter };

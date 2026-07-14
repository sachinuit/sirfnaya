import { Router } from "express";
import { couponsController } from "./coupons.controller.js";
import { authenticate, authorize, validate } from "../../middleware/index.js";
import { createCouponSchema, applyCouponSchema } from "@repo/types";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), couponsController.list);
router.post("/", authenticate, authorize("ADMIN"), validate(createCouponSchema), couponsController.create);
router.post("/validate", authenticate, validate(applyCouponSchema), couponsController.validate);
router.put("/:id", authenticate, authorize("ADMIN"), couponsController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), couponsController.delete);

export { router as couponRouter };

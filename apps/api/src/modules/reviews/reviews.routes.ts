import { Router } from "express";
import { reviewsController } from "./reviews.controller.js";
import { authenticate, validate } from "../../middleware/index.js";
import { createReviewSchema } from "@repo/types";

const router = Router();

router.get("/product/:productId", reviewsController.getByProduct);
router.post("/", authenticate, validate(createReviewSchema), reviewsController.create);

export { router as reviewRouter };

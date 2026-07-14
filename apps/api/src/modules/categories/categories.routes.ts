import { Router } from "express";
import { categoriesController } from "./categories.controller.js";
import { authenticate, authorize, validate } from "../../middleware/index.js";
import { createCategorySchema } from "@repo/types";

const router = Router();

router.get("/", categoriesController.list);
router.get("/:slug", categoriesController.getBySlug);
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    validate(createCategorySchema),
    categoriesController.create
);

export { router as categoryRouter };

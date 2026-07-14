import { Router } from "express";
import { productsController } from "./products.controller.js";
import { authenticate, authorize, validate } from "../../middleware/index.js";
import { productQuerySchema, createProductSchema, updateProductSchema } from "@repo/types";

const router = Router();

router.get("/", validate(productQuerySchema, "query"), productsController.list);
router.get("/featured", productsController.featured);
router.get("/brands", productsController.brands);
router.get("/by-id/:id", productsController.getById);
router.get("/:slug", productsController.getBySlug);

router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SELLER"),
    validate(createProductSchema),
    productsController.create
);

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "SELLER"),
    validate(updateProductSchema),
    productsController.update
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "SELLER"),
    productsController.delete
);

export { router as productRouter };

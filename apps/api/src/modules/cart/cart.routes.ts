import { Router } from "express";
import { cartController } from "./cart.controller.js";
import { authenticate, validate } from "../../middleware/index.js";
import { addToCartSchema, updateCartItemSchema } from "@repo/types";

const router = Router();

router.use(authenticate);

router.get("/", cartController.getCart);
router.get("/count", cartController.getCount);
router.post("/", validate(addToCartSchema), cartController.addItem);
router.put("/:id", validate(updateCartItemSchema), cartController.updateItem);
router.delete("/:id", cartController.removeItem);
router.delete("/", cartController.clearCart);

export { router as cartRouter };

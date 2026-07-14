import { Router } from "express";
import { usersController } from "./users.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), usersController.list);
router.get("/profile", authenticate, usersController.getProfile);
router.put("/profile", authenticate, usersController.updateProfile);
router.get("/:id", authenticate, authorize("ADMIN"), usersController.getById);

export { router as userRouter };

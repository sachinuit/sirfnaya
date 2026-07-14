import { Router } from "express";
import { uploadController } from "./upload.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";
import { upload } from "../../middleware/upload.js";

const router = Router();

router.post("/image", authenticate, authorize("ADMIN", "SELLER"), upload.single("image"), uploadController.uploadImage);
router.delete("/image", authenticate, authorize("ADMIN", "SELLER"), uploadController.deleteImage);

export { router as uploadRouter };

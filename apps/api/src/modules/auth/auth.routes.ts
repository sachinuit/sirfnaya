import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate, validate } from "../../middleware/index.js";
import { registerSchema, loginSchema } from "@repo/types";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/firebase", authController.firebaseLogin);
router.post("/refresh", authController.refresh);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.get("/fix-admin", authController.fixAdmin);

export { router as authRouter };

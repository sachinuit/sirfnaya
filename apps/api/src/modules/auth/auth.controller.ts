import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { emailService } from "../email/email.service.js";

export const authController = {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    message: result.message,
                },
            });
            emailService.sendWelcomeEmail(req.body.email, req.body.name).catch(console.error);
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/",
            } as any);

            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
                path: "/",
            } as any);

            res.status(200).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ success: false, error: "No refresh token" });
                return;
            }

            const tokens = await authService.refresh(refreshToken);

            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/",
            } as any);

            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
                path: "/",
            } as any);

            res.status(200).json({
                success: true,
                data: { accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    },

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.getMe(req.user!.userId);
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    },

    async logout(_req: Request, res: Response) {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "lax" as const,
        };
        res.clearCookie("refreshToken", { ...cookieOptions, path: "/" } as any);
        res.clearCookie("accessToken", { ...cookieOptions, path: "/" } as any);
        res.status(200).json({ success: true, message: "Logged out" });
    },

    async firebaseLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                res.status(400).json({ success: false, error: "Missing Firebase token" });
                return;
            }

            const result = await authService.loginWithFirebase(idToken);

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/",
            } as any);

            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
                path: "/",
            } as any);

            res.status(200).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ success: false, error: "Email is required" });
                return;
            }
            const result = await authService.forgotPassword(email);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, token, newPassword } = req.body;
            if (!email || !token || !newPassword) {
                res.status(400).json({ success: false, error: "Email, token, and new password are required" });
                return;
            }
            const result = await authService.resetPassword(email, token, newPassword);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({ success: false, error: "Email and OTP are required" });
                return;
            }
            const result = await authService.verifyEmail(email, otp);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    async resendVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ success: false, error: "Email is required" });
                return;
            }
            const result = await authService.resendVerification(email);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    async fixAdmin(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.fixAdminAccount();
            res.status(200).json({
                success: true,
                message: "Admin Fixed",
                credentials: result
            });
        } catch (error) {
            next(error);
        }
    }
};

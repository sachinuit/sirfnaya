import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "@repo/db";
import { db } from "../../config/database.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../middleware/index.js";
import { emailService } from "../email/email.service.js";
import type { RegisterInput, LoginInput, JwtPayload } from "@repo/types";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTokens(payload: Omit<JwtPayload, "iat" | "exp">) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRY as any,
    });
    return { accessToken, refreshToken };
}

function sanitizeUser(user: typeof users.$inferSelect) {
    const { passwordHash, ...safe } = user;
    return safe;
}

export const authService = {
    async register(input: RegisterInput) {
        const existing = await db.query.users.findFirst({
            where: eq(users.email, input.email),
        });

        if (existing && existing.emailVerified) {
            throw ApiError.conflict("Email is already registered");
        }

        const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        let user;

        if (existing && !existing.emailVerified) {
            await db
                .update(users)
                .set({ name: input.name, passwordHash, otpCode: otp, otpExpiresAt, updatedAt: new Date() })
                .where(eq(users.id, existing.id));
            user = await db.query.users.findFirst({ where: eq(users.id, existing.id) });
        } else {
            await db
                .insert(users)
                .values({
                    id: uuidv4(),
                    name: input.name,
                    email: input.email,
                    passwordHash,
                    otpCode: otp,
                    otpExpiresAt,
                });

            user = await db.query.users.findFirst({
                where: eq(users.email, input.email),
            });
        }

        emailService.sendVerificationEmail(input.email, input.name, otp).catch(console.error);

        return {
            user: sanitizeUser(user!),
            message: "Registration successful. Please check your email to verify your account.",
        };
    },

    async login(input: LoginInput) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, input.email),
        });

        if (!user) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        if (!user.passwordHash) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        const isValid = await bcrypt.compare(input.password, user.passwordHash);

        if (!isValid) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        if (!user.emailVerified) {
            throw ApiError.forbidden("Please verify your email address before logging in.");
        }

        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role as JwtPayload["role"],
        });

        return {
            user: sanitizeUser(user),
            ...tokens,
        };
    },

    async refresh(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;

            const user = await db.query.users.findFirst({
                where: eq(users.id, decoded.userId),
            });

            if (!user) {
                throw ApiError.unauthorized("User no longer exists");
            }

            const tokens = generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role as JwtPayload["role"],
            });

            return tokens;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw ApiError.unauthorized("Invalid refresh token");
        }
    },

    async getMe(userId: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw ApiError.notFound("User not found");
        }

        return sanitizeUser(user);
    },

    async loginWithFirebase(idToken: string) {
        const { firebaseAdmin, isFirebaseInitialized, missingKeys } = await import("../../config/firebase.js");

        if (!isFirebaseInitialized) {
            console.error(`Firebase not initialized. Missing: ${missingKeys?.join(", ")}`);
            throw ApiError.internal(`Firebase configuration error. Missing vars: ${missingKeys?.join(", ")}`);
        }

        let decodedToken;
        try {
            decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        } catch (error: any) {
            throw ApiError.unauthorized(`Invalid Firebase token: ${error.message}`);
        }

        const { email, uid, name, picture } = decodedToken;

        if (!email) {
            throw ApiError.unauthorized("Invalid Firebase token payload: Email missing");
        }

        let user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

            const id = uuidv4();
            await db
                .insert(users)
                .values({
                    id,
                    name: name || "Firebase User",
                    email,
                    passwordHash,
                    authProvider: "FIREBASE",
                    googleId: uid,
                    image: picture,
                    emailVerified: true,
                    role: "USER"
                });

            user = await db.query.users.findFirst({
                where: eq(users.id, id),
            });
        } else if (!user.googleId && user.authProvider !== "FIREBASE") {
            await db
                .update(users)
                .set({
                    googleId: uid,
                    authProvider: "FIREBASE",
                    image: picture || user.image,
                    emailVerified: true
                })
                .where(eq(users.id, user.id));
        }

        const tokens = generateTokens({
            userId: user!.id,
            email: user!.email,
            role: user!.role as JwtPayload["role"],
        });

        return {
            user: sanitizeUser(user!),
            ...tokens,
        };
    },

    async forgotPassword(email: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
            return { message: "If an account with that email exists, we've sent a reset link." };
        }

        const resetToken = jwt.sign(
            { userId: user.id, email: user.email, purpose: "password-reset" },
            env.JWT_SECRET + user.passwordHash,
            { expiresIn: "1h" }
        );

        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

        await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

        return { message: "If an account with that email exists, we've sent a reset link." };
    },

    async resetPassword(email: string, token: string, newPassword: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
            throw ApiError.badRequest("Invalid or expired reset link");
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET + user.passwordHash) as any;
            if (decoded.purpose !== "password-reset" || decoded.userId !== user.id) {
                throw new Error("Invalid token");
            }
        } catch {
            throw ApiError.badRequest("Invalid or expired reset link");
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await db
            .update(users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(users.id, user.id));

        return { message: "Password reset successfully. You can now log in with your new password." };
    },

    async verifyEmail(email: string, otp: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw ApiError.badRequest("Invalid email or OTP code");
        }

        if (user.emailVerified) {
            return { message: "Email is already verified." };
        }

        if (!user.otpCode || user.otpCode !== otp) {
            throw ApiError.badRequest("Invalid OTP code");
        }

        if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
            throw ApiError.badRequest("OTP code has expired. Please request a new one.");
        }

        await db
            .update(users)
            .set({ emailVerified: true, otpCode: null, otpExpiresAt: null, updatedAt: new Date() })
            .where(eq(users.id, user.id));

        return { message: "Email verified successfully!" };
    },

    async resendVerification(email: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            return { message: "If an account exists, a verification email has been sent." };
        }

        if (user.emailVerified) {
            return { message: "Email is already verified." };
        }

        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await db
            .update(users)
            .set({ otpCode: otp, otpExpiresAt })
            .where(eq(users.id, user.id));

        await emailService.sendVerificationEmail(user.email, user.name, otp);

        return { message: "Verification email sent." };
    },

    async fixAdminAccount() {
        const email = "admin@sirfnaya.com";
        const password = "Admin123!";
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        let user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (user) {
            await db
                .update(users)
                .set({
                    passwordHash,
                    emailVerified: true,
                    role: "ADMIN",
                    authProvider: "EMAIL"
                })
                .where(eq(users.id, user.id));
        } else {
            const id = uuidv4();
            await db
                .insert(users)
                .values({
                    id,
                    name: "Admin User",
                    email,
                    passwordHash,
                    emailVerified: true,
                    role: "ADMIN",
                    authProvider: "EMAIL"
                });
        }

        return { email, password };
    }
};

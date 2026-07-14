import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../../config/database.js";
import { users } from "@repo/db";
import { ApiError } from "../../middleware/index.js";

const SALT_ROUNDS = 12;

function sanitizeUser(user: any) {
    const { passwordHash, otpCode, otpExpiresAt, ...safe } = user;
    return safe;
}

export const usersController = {
    async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const allUsers = await db.query.users.findMany({
                orderBy: (users: any, { desc }: any) => [desc(users.createdAt)],
            });
            res.status(200).json({ success: true, data: allUsers.map(sanitizeUser) });
        } catch (error) {
            next(error);
        }
    },

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.id, req.user!.userId),
            });

            if (!user) {
                throw ApiError.notFound("User not found");
            }

            res.status(200).json({ success: true, data: sanitizeUser(user) });
        } catch (error) {
            next(error);
        }
    },

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, image, password } = req.body;
            const updateData: any = {};

            if (name) updateData.name = name;
            if (image !== undefined) updateData.image = image;
            if (password) updateData.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

            await db
                .update(users)
                .set(updateData)
                .where(eq(users.id, req.user!.userId));

            const user = await db.query.users.findFirst({
                where: eq(users.id, req.user!.userId),
            });

            res.status(200).json({ success: true, data: sanitizeUser(user) });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.id, req.params.id as string),
            });

            if (!user) {
                throw ApiError.notFound("User not found");
            }

            res.status(200).json({ success: true, data: sanitizeUser(user) });
        } catch (error) {
            next(error);
        }
    },
};

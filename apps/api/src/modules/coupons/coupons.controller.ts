import type { Request, Response, NextFunction } from "express";
import { eq, and, lte, gte } from "drizzle-orm";
import { db } from "../../config/database.js";
import { coupons } from "@repo/db";
import { ApiError } from "../../middleware/index.js";
import { v4 as uuidv4 } from "uuid";

export const couponsController = {
    async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const data = await db.query.coupons.findMany({
                orderBy: (coupons: any, { desc }: any) => [desc(coupons.createdAt)],
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { code, discountPercent, maxUses, expiresAt } = req.body;

            const existing = await db.query.coupons.findFirst({
                where: eq(coupons.code, code),
            });

            if (existing) {
                throw ApiError.conflict("Coupon code already exists");
            }

            const id = uuidv4();
            await db.insert(coupons).values({
                id,
                code,
                discountPercent,
                maxUses: maxUses || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            });

            const coupon = await db.query.coupons.findFirst({
                where: eq(coupons.id, id),
            });

            res.status(201).json({ success: true, data: coupon });
        } catch (error) {
            next(error);
        }
    },

    async validate(req: Request, res: Response, next: NextFunction) {
        try {
            const { code } = req.body;

            const coupon = await db.query.coupons.findFirst({
                where: eq(coupons.code, code),
            });

            if (!coupon) {
                throw ApiError.notFound("Invalid coupon code");
            }

            if (!coupon.isActive) {
                throw ApiError.badRequest("This coupon is no longer active");
            }

            if (coupon.expiresAt && new Date() > coupon.expiresAt) {
                throw ApiError.badRequest("This coupon has expired");
            }

            if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
                throw ApiError.badRequest("This coupon has reached its usage limit");
            }

            res.status(200).json({
                success: true,
                data: coupon,
            });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { discountPercent, maxUses, expiresAt, isActive } = req.body;

            const existing = await db.query.coupons.findFirst({
                where: eq(coupons.id, id),
            });

            if (!existing) {
                throw ApiError.notFound("Coupon not found");
            }

            const updateData: any = {};
            if (discountPercent !== undefined) updateData.discountPercent = discountPercent;
            if (maxUses !== undefined) updateData.maxUses = maxUses;
            if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
            if (isActive !== undefined) updateData.isActive = isActive;

            await db.update(coupons).set(updateData).where(eq(coupons.id, id));

            const updated = await db.query.coupons.findFirst({
                where: eq(coupons.id, id),
            });

            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const existing = await db.query.coupons.findFirst({
                where: eq(coupons.id, id),
            });

            if (!existing) {
                throw ApiError.notFound("Coupon not found");
            }

            await db.delete(coupons).where(eq(coupons.id, id));
            res.status(200).json({ success: true, message: "Coupon deleted" });
        } catch (error) {
            next(error);
        }
    },
};

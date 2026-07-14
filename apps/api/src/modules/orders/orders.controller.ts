import type { Request, Response, NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { orders } from "@repo/db";
import { ApiError } from "../../middleware/index.js";

export const ordersController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const isAdmin = req.user?.role === "ADMIN";
            const where = isAdmin ? undefined : eq(orders.userId, req.user!.userId);

            const data = await db.query.orders.findMany({
                where,
                with: {
                    items: true,
                },
                orderBy: [desc(orders.createdAt)],
            });

            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const order = await db.query.orders.findFirst({
                where: eq(orders.id, id),
                with: {
                    items: true,
                },
            });

            if (!order) {
                throw ApiError.notFound("Order not found");
            }

            if (req.user?.role !== "ADMIN" && order.userId !== req.user?.userId) {
                throw ApiError.forbidden("You do not have permission to view this order");
            }

            res.status(200).json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    },

    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const { status } = req.body;

            const order = await db.query.orders.findFirst({
                where: eq(orders.id, id),
            });

            if (!order) {
                throw ApiError.notFound("Order not found");
            }

            await db.update(orders).set({ status }).where(eq(orders.id, id));

            const updated = await db.query.orders.findFirst({
                where: eq(orders.id, id),
                with: { items: true },
            });

            res.status(200).json({ success: true, data: updated });
        } catch (error) {
            next(error);
        }
    },
};

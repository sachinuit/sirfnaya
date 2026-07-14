import type { Request, Response, NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { productReviews, products } from "@repo/db";
import { ApiError } from "../../middleware/index.js";
import { v4 as uuidv4 } from "uuid";

export const reviewsController = {
    async getByProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;

            const product = await db.query.products.findFirst({
                where: eq(products.id, productId),
            });

            if (!product) {
                throw ApiError.notFound("Product not found");
            }

            const data = await db.query.productReviews.findMany({
                where: eq(productReviews.productId, productId),
                with: {
                    user: true,
                },
                orderBy: [desc(productReviews.createdAt)],
            });

            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId, rating, comment } = req.body;
            const userId = req.user!.userId;

            const product = await db.query.products.findFirst({
                where: eq(products.id, productId),
            });

            if (!product) {
                throw ApiError.notFound("Product not found");
            }

            const existing = await db.query.productReviews.findFirst({
                where: (reviews: any) => eq(reviews.userId, userId),
            });

            if (existing) {
                throw ApiError.conflict("You have already reviewed this product");
            }

            const id = uuidv4();
            await db.insert(productReviews).values({
                id,
                productId,
                userId,
                rating,
                comment,
            });

            const review = await db.query.productReviews.findFirst({
                where: eq(productReviews.id, id),
                with: { user: true },
            });

            res.status(201).json({ success: true, data: review });
        } catch (error) {
            next(error);
        }
    },
};

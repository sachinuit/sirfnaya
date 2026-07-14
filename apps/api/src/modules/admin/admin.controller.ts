import type { Request, Response, NextFunction } from "express";
import { count } from "drizzle-orm";
import { db } from "../../config/database.js";
import { users, products, orders, categories } from "@repo/db";

export const adminController = {
    async dashboard(_req: Request, res: Response, next: NextFunction) {
        try {
            const [userCount] = await db.select({ count: count() }).from(users);
            const [productCount] = await db.select({ count: count() }).from(products);
            const [orderCount] = await db.select({ count: count() }).from(orders);
            const [categoryCount] = await db.select({ count: count() }).from(categories);

            const recentOrders = await db.query.orders.findMany({
                with: { items: true },
                orderBy: (orders: any, { desc }: any) => [desc(orders.createdAt)],
                limit: 10,
            });

            res.status(200).json({
                success: true,
                data: {
                    stats: {
                        users: userCount.count,
                        products: productCount.count,
                        orders: orderCount.count,
                        categories: categoryCount.count,
                    },
                    recentOrders,
                },
            });
        } catch (error) {
            next(error);
        }
    },
};

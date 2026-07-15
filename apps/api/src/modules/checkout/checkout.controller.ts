import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "@repo/types";
import { createCheckoutSessionSchema } from "@repo/types";
import { inArray } from "drizzle-orm";
import { db } from "../../config/database.js";
import { products } from "@repo/db";
import { ApiError } from "../../middleware/index.js";
import { env } from "../../config/env.js";
import { stripe } from "../../config/stripe.js";

export const checkoutController = {
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            if (!stripe) {
                throw ApiError.badRequest("Payment service is not configured");
            }
            const body = createCheckoutSessionSchema.parse(req.body);
            const { items, shippingAddress } = body;
            const user = req.user as JwtPayload;

            const productIds = items.map((i: any) => i.productId);
            const dbProducts = await db.query.products.findMany({
                where: inArray(products.id, productIds),
                with: { images: true },
            });

            const productMap = new Map(dbProducts.map((p) => [p.id, p]));

            const lineItems: any[] = [];
            for (const item of items) {
                const product = productMap.get(item.productId);
                if (!product) {
                    throw ApiError.notFound(`Product with ID ${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw ApiError.badRequest(`Not enough stock for ${product.name}`);
                }

                const price = Number(product.price);
                const imageUrls = product.images.map((img) => img.url);

                lineItems.push({
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: product.name,
                            images: imageUrls.slice(0, 8),
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: item.quantity,
                });
            }

            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: lineItems,
                success_url: `${env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${env.FRONTEND_URL}/checkout/cancel`,
                customer_email: user.email,
                metadata: {
                    userId: user.userId,
                    shippingAddress: JSON.stringify(shippingAddress).slice(0, 500),
                    items: JSON.stringify(
                        items.map((item: any) => ({
                            pid: item.productId,
                            qty: item.quantity,
                            price: productMap.get(item.productId)!.price,
                        }))
                    ).slice(0, 500),
                },
            });

            res.status(200).json({
                data: {
                    url: session.url,
                    sessionId: session.id,
                },
            });
        } catch (error: any) {
            if (error?.type?.startsWith?.("Stripe") || error?.statusCode) {
                return next(ApiError.badRequest(error.message || "Payment processing failed"));
            }
            next(error);
        }
    },
};

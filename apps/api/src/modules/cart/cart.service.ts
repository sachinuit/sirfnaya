import { eq, and } from "drizzle-orm";
import { cartItems, products } from "@repo/db";
import { db } from "../../config/database.js";
import { ApiError } from "../../middleware/index.js";
import type { AddToCartInput, UpdateCartItemInput } from "@repo/types";
import { v4 as uuidv4 } from "uuid";

export const cartService = {
    async getCart(userId: string) {
        return db.query.cartItems.findMany({
            where: eq(cartItems.userId, userId),
            with: {
                product: {
                    with: { images: true },
                },
            },
            orderBy: (cartItems: any, { desc }: any) => [desc(cartItems.createdAt)],
        });
    },

    async addItem(userId: string, input: AddToCartInput) {
        const product = await db.query.products.findFirst({
            where: eq(products.id, input.productId),
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }
        if (product.stock < input.quantity) {
            throw ApiError.badRequest(`Only ${product.stock} items available in stock`);
        }

        const existing = await db.query.cartItems.findFirst({
            where: and(
                eq(cartItems.userId, userId),
                eq(cartItems.productId, input.productId)
            ),
        });

        if (existing) {
            const newQuantity = existing.quantity + input.quantity;
            if (newQuantity > product.stock) {
                throw ApiError.badRequest(`Cannot add more. Only ${product.stock} available.`);
            }

            await db
                .update(cartItems)
                .set({ quantity: newQuantity })
                .where(eq(cartItems.id, existing.id));

            return await db.query.cartItems.findFirst({
                where: eq(cartItems.id, existing.id),
            });
        }

        const id = uuidv4();
        await db
            .insert(cartItems)
            .values({
                id,
                userId,
                productId: input.productId,
                quantity: input.quantity,
            });

        return await db.query.cartItems.findFirst({
            where: eq(cartItems.id, id),
        });
    },

    async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
        const item = await db.query.cartItems.findFirst({
            where: and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)),
        });

        if (!item) {
            throw ApiError.notFound("Cart item not found");
        }

        const product = await db.query.products.findFirst({
            where: eq(products.id, item.productId),
        });

        if (product && input.quantity > product.stock) {
            throw ApiError.badRequest(`Only ${product.stock} items available`);
        }

        await db
            .update(cartItems)
            .set({ quantity: input.quantity })
            .where(eq(cartItems.id, itemId));

        return await db.query.cartItems.findFirst({
            where: eq(cartItems.id, itemId),
        });
    },

    async removeItem(userId: string, itemId: string) {
        const item = await db.query.cartItems.findFirst({
            where: and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)),
        });

        if (!item) {
            throw ApiError.notFound("Cart item not found");
        }

        await db.delete(cartItems).where(eq(cartItems.id, itemId));
        return { message: "Item removed from cart" };
    },

    async clearCart(userId: string) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
        return { message: "Cart cleared" };
    },

    async getCount(userId: string) {
        const items = await db.query.cartItems.findMany({
            where: eq(cartItems.userId, userId),
            columns: { quantity: true },
        });
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },
};

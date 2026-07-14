import type { Request, Response } from "express";
import { Router } from "express";
import { eq, sql, inArray } from "drizzle-orm";
import { db } from "../../config/database.js";
import { orders, orderItems, products } from "@repo/db";
import { env } from "../../config/env.js";
import { stripe } from "../../config/stripe.js";
import { emailService } from "../email/email.service.js";
import { v4 as uuidv4 } from "uuid";

export const webhookRouter = Router();

webhookRouter.post("/", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
        console.error("Webhook: Missing stripe-signature header");
        res.status(400).json({ error: "Missing stripe-signature header" });
        return;
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).json({ error: `Webhook Error: ${err.message}` });
        return;
    }

    console.log(`Webhook received: ${event.type}`);

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutComplete(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook handler error:", error);
        res.status(200).json({ received: true, error: "Handler failed" });
    }
});

async function handleCheckoutComplete(session: any) {
    const userId = session.metadata?.userId;
    const shippingAddressRaw = session.metadata?.shippingAddress;
    const itemsRaw = session.metadata?.items;

    if (!userId || !itemsRaw) {
        console.error("Webhook: Missing userId or items in session metadata");
        return;
    }

    let shippingAddress;
    let items: Array<{ pid: string; qty: number; price: string }>;

    try {
        shippingAddress = shippingAddressRaw ? JSON.parse(shippingAddressRaw) : null;
        items = JSON.parse(itemsRaw);
    } catch {
        console.error("Webhook: Failed to parse metadata JSON");
        return;
    }

    const existingOrder = await db.query.orders.findFirst({
        where: eq(orders.stripeSessionId, session.id),
    });

    if (existingOrder) {
        console.log(`Order already exists for session ${session.id}, skipping`);
        return;
    }

    const productIds = items.map((i) => i.pid);
    const dbProducts = await db.query.products.findMany({
        where: inArray(products.id, productIds),
        with: { images: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    const totalAmount = (session.amount_total / 100).toFixed(2);

    const orderId = uuidv4();
    await db
        .insert(orders)
        .values({
            id: orderId,
            userId,
            stripeSessionId: session.id,
            total: totalAmount,
            status: "PAID",
            shippingAddress,
        });

    const orderItemsData = items.map((item) => {
        const product = productMap.get(item.pid);
        return {
            id: uuidv4(),
            orderId,
            productId: item.pid,
            productName: product?.name || "Unknown Product",
            productImage: product?.images[0]?.url || "",
            quantity: item.qty,
            price: item.price,
        };
    });

    await db.insert(orderItems).values(orderItemsData);

    for (const item of items) {
        await db
            .update(products)
            .set({
                stock: sql`${products.stock} - ${item.qty}`,
            })
            .where(eq(products.id, item.pid));
    }

    console.log(`Order ${orderId} created with ${items.length} items`);

    const customerEmail = session.customer_email || session.customer_details?.email;
    if (customerEmail) {
        emailService
            .sendOrderConfirmationEmail(customerEmail, orderId, Number(totalAmount))
            .catch((err: unknown) => console.error("Email send failed:", err));
    }
}

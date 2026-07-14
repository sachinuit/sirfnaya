import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/index.js";
import { sanitize } from "./middleware/sanitize.js";

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());

// Stripe webhook must use raw body for signature verification
app.use("/api/webhook/stripe", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use(sanitize);

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", (await import("./modules/auth/auth.routes.js")).authRouter);
app.use("/api/users", (await import("./modules/users/users.routes.js")).userRouter);
app.use("/api/products", (await import("./modules/products/products.routes.js")).productRouter);
app.use("/api/categories", (await import("./modules/categories/categories.routes.js")).categoryRouter);
app.use("/api/orders", (await import("./modules/orders/orders.routes.js")).orderRouter);
app.use("/api/cart", (await import("./modules/cart/cart.routes.js")).cartRouter);
app.use("/api/reviews", (await import("./modules/reviews/reviews.routes.js")).reviewRouter);
app.use("/api/coupons", (await import("./modules/coupons/coupons.routes.js")).couponRouter);
app.use("/api/settings", (await import("./modules/settings/settings.routes.js")).settingsRouter);
app.use("/api/upload", (await import("./modules/upload/upload.routes.js")).uploadRouter);
app.use("/api/admin", (await import("./modules/admin/admin.routes.js")).adminRouter);
app.use("/api/checkout", (await import("./modules/checkout/checkout.routes.js")).checkoutRouter);
app.use("/api/webhook/stripe", (await import("./modules/checkout/webhook.controller.js")).webhookRouter);

app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

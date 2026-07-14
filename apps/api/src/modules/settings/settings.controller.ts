import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../config/database.js";
import { settings } from "@repo/db";
import { v4 as uuidv4 } from "uuid";

export const settingsController = {
    async get(_req: Request, res: Response, next: NextFunction) {
        try {
            let setting = await db.query.settings.findFirst();

            if (!setting) {
                const id = uuidv4();
                await db.insert(settings).values({
                    id,
                    storeName: "SirfNaya",
                    storeEmail: "admin@sirfnaya.com",
                    currency: "INR",
                });
                setting = await db.query.settings.findFirst();
            }

            res.status(200).json({ success: true, data: setting });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            let setting = await db.query.settings.findFirst();

            if (!setting) {
                const id = uuidv4();
                await db.insert(settings).values({
                    id,
                    ...req.body,
                    storeName: req.body.storeName || "SirfNaya",
                    storeEmail: req.body.storeEmail || "admin@sirfnaya.com",
                    currency: req.body.currency || "INR",
                });
            } else {
                await db
                    .update(settings)
                    .set({ ...req.body, updatedAt: new Date() })
                    .where(eq(settings.id, setting.id));
            }

            setting = await db.query.settings.findFirst();
            res.status(200).json({ success: true, data: setting });
        } catch (error) {
            next(error);
        }
    },
};

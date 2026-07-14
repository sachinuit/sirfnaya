import type { Request, Response, NextFunction } from "express";
import { cartService } from "./cart.service.js";

export const cartController = {
    async getCart(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.getCart(req.user!.userId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async addItem(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.addItem(req.user!.userId, req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async updateItem(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.updateItem(
                req.user!.userId,
                req.params.id as string,
                req.body
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async removeItem(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.removeItem(req.user!.userId, req.params.id as string);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    },

    async clearCart(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.clearCart(req.user!.userId);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    },

    async getCount(req: Request, res: Response, next: NextFunction) {
        try {
            const count = await cartService.getCount(req.user!.userId);
            res.status(200).json({ success: true, data: { count } });
        } catch (error) {
            next(error);
        }
    },
};

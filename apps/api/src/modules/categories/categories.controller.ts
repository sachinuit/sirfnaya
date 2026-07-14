import type { Request, Response, NextFunction } from "express";
import { categoriesService } from "./categories.service.js";

export const categoriesController = {
    async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const data = await categoriesService.list();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async getBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const slug = req.params.slug as string;
            const data = await categoriesService.getBySlug(slug);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await categoriesService.create(req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
};

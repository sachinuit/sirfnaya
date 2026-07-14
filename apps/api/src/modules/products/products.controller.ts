import type { Request, Response, NextFunction } from "express";
import { productsService } from "./products.service.js";

export const productsController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await productsService.list(req.query as any);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    },

    async featured(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.getFeatured();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async brands(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.getBrands();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async getBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const slug = req.params.slug as string;
            const data = await productsService.getBySlug(slug);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.create(req.body, req.user!.userId);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await productsService.update(id, req.body, req.user?.userId, req.user?.role);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await productsService.getById(id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await productsService.delete(id, req.user?.userId, req.user?.role);
            res.status(200).json({ success: true, message: "Product deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
};

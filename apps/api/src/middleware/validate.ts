import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiError } from "./errorHandler.js";

export function validate(schema: z.ZodSchema, source: "body" | "query" | "params" = "body") {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                const errors = result.error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw ApiError.badRequest(`Validation failed: ${errors}`);
            }

            if (source === "body") {
                req.body = result.data;
            } else {
                Object.defineProperty(req, source, {
                    value: result.data,
                    writable: true,
                    configurable: true,
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    };
}

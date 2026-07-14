import type { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = "ApiError";
    }

    static badRequest(message: string) {
        return new ApiError(400, message);
    }

    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message);
    }

    static forbidden(message = "Forbidden") {
        return new ApiError(403, message);
    }

    static notFound(message = "Resource not found") {
        return new ApiError(404, message);
    }

    static conflict(message: string) {
        return new ApiError(409, message);
    }

    static internal(message = "Internal server error") {
        return new ApiError(500, message);
    }
}

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error(`[ERROR] ${err.message}`, err.stack);

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }

    const statusCode = 500;
    const message = err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
    });
}

import type { Request, Response, NextFunction } from "express";
import { cloudinary } from "../../config/cloudinary.js";
import { ApiError } from "../../middleware/index.js";

export const uploadController = {
    async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                throw ApiError.badRequest("No image file provided");
            }

            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataUri = `data:${req.file.mimetype};base64,${b64}`;

            const result = await cloudinary.uploader.upload(dataUri, {
                folder: "sirfnaya",
            });

            res.status(200).json({
                success: true,
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteImage(req: Request, res: Response, next: NextFunction) {
        try {
            const { publicId } = req.body;

            if (!publicId) {
                throw ApiError.badRequest("publicId is required");
            }

            await cloudinary.uploader.destroy(publicId);

            res.status(200).json({
                success: true,
                message: "Image deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    },
};

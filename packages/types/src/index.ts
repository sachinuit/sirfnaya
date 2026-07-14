import { z } from "zod";

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const productQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sort: z.enum(["price_asc", "price_desc", "newest", "rating", "name"]).default("newest"),
    brand: z.string().optional(),
    featured: z.coerce.boolean().optional(),
    sellerId: z.string().optional(),
});

export const createProductSchema = z.object({
    name: z.string().min(1).max(500),
    slug: z.string().min(1).max(500),
    description: z.string().min(1),
    shortDescription: z.string().max(500).optional(),
    price: z.coerce.number().positive(),
    compareAtPrice: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().nonnegative().default(0),
    sku: z.string().max(100).optional(),
    brand: z.string().max(255).optional(),
    categoryId: z.string().min(1),
    isFeatured: z.boolean().default(false),
    specifications: z.string().optional(),
    images: z.array(z.string().url()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const addToCartSchema = z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive().max(99).default(1),
});

export const updateCartItemSchema = z.object({
    quantity: z.coerce.number().int().positive().max(99),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const createCategorySchema = z.object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    description: z.string().optional(),
    image: z.string().url().optional(),
    parentId: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export type UserRole = "USER" | "SELLER" | "ADMIN";

export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export const shippingAddressSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    zip: z.string().min(1, "ZIP code is required"),
    country: z.string().default("IN"),
});

export const createCheckoutSessionSchema = z.object({
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive()
    })).min(1, "Cart cannot be empty"),
    shippingAddress: shippingAddressSchema,
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;

export const settingsSchema = z.object({
    id: z.string().optional(),
    storeName: z.string().min(1, "Store name is required"),
    storeEmail: z.string().email("Invalid email address"),
    storeUrl: z.string().optional(),
    currency: z.string().min(1, "Currency is required"),
    taxRate: z.coerce.number().min(0),
    shippingFee: z.coerce.number().min(0),
    freeShippingThreshold: z.coerce.number().min(0).optional(),
    lowStockThreshold: z.coerce.number().int().min(0),
});

export const updateSettingsSchema = settingsSchema.omit({ id: true });

export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    image: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const createReviewSchema = z.object({
    productId: z.string().min(1),
    rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review must be under 1000 characters"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const createCouponSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters").max(50).toUpperCase(),
    discountPercent: z.coerce.number().int().min(1, "Must be at least 1%").max(100, "Cannot exceed 100%"),
    maxUses: z.coerce.number().int().positive("Must have at least 1 use").optional(),
    expiresAt: z.string().optional(),
});

export const applyCouponSchema = z.object({
    code: z.string().min(1, "Coupon code is required").toUpperCase(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

export const toggleWishlistSchema = z.object({
    productId: z.string().min(1, "Invalid product ID"),
});

export type ToggleWishlistInput = z.infer<typeof toggleWishlistSchema>;

export const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
    message: z.string().min(20, "Message must be at least 20 characters").max(2000),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

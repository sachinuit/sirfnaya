import { eq, ilike, and, or, desc, asc, sql, count } from "drizzle-orm";
import { db } from "../../config/database.js";
import { redis } from "../../config/redis.js";
import { products, categories, productImages } from "@repo/db";
import { ApiError } from "../../middleware/index.js";
import type { ProductQuery, CreateProductInput, UpdateProductInput } from "@repo/types";
import { v4 as uuidv4 } from "uuid";

export const productsService = {
    async list(query: ProductQuery) {
        const { page = 1, limit = 10, category, search, minPrice, maxPrice, sort, brand, featured, sellerId } = query;
        const offset = (page - 1) * limit;

        const whereConditions = [];

        if (sellerId) {
            whereConditions.push(eq(products.sellerId, sellerId));
        }

        if (search) {
            whereConditions.push(
                or(
                    ilike(products.name, `%${search}%`),
                    ilike(products.description, `%${search}%`),
                    ilike(products.brand, `%${search}%`)
                )
            );
        }

        if (category) {
            const categoryRecord = await db.query.categories.findFirst({
                where: eq(categories.slug, category),
            });

            if (categoryRecord) {
                whereConditions.push(eq(products.categoryId, categoryRecord.id));
            } else {
                return {
                    data: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0,
                        hasNext: false,
                        hasPrev: false,
                    },
                };
            }
        }

        if (brand) {
            whereConditions.push(eq(products.brand, brand));
        }

        if (featured !== undefined) {
            whereConditions.push(eq(products.isFeatured, String(featured) === "true"));
        }

        if (minPrice !== undefined) {
            whereConditions.push(sql`${products.price} >= ${minPrice}`);
        }

        if (maxPrice !== undefined) {
            whereConditions.push(sql`${products.price} <= ${maxPrice}`);
        }

        let orderBy = desc(products.createdAt);
        switch (sort) {
            case "price_asc":
                orderBy = asc(products.price);
                break;
            case "price_desc":
                orderBy = desc(products.price);
                break;
            case "rating":
                orderBy = desc(products.rating);
                break;
            case "newest":
            default:
                orderBy = desc(products.createdAt);
                break;
        }

        const [totalResult] = await db
            .select({ count: count() })
            .from(products)
            .where(and(...whereConditions));

        const total = totalResult?.count || 0;
        const totalPages = Math.ceil(total / limit);

        const data = await db.query.products.findMany({
            where: and(...whereConditions),
            limit,
            offset,
            orderBy: [orderBy],
            with: {
                category: true,
                images: true,
            },
        });

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    },

    async getBySlug(slug: string) {
        const product = await db.query.products.findFirst({
            where: eq(products.slug, slug),
            with: {
                category: true,
                images: true,
                reviews: {
                    with: {
                        user: true
                    },
                }
            },
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        return product;
    },

    async create(input: CreateProductInput, sellerId: string) {
        const existing = await db.query.products.findFirst({
            where: eq(products.slug, input.slug)
        });

        if (existing) {
            throw ApiError.conflict("Product with this slug already exists");
        }

        const { images, price, compareAtPrice, ...rest } = input;
        const id = uuidv4();

        await db
            .insert(products)
            .values({
                id,
                ...rest,
                price: String(price),
                compareAtPrice: compareAtPrice ? String(compareAtPrice) : null,
                sellerId,
                stock: input.stock ?? 0,
                rating: "0",
                reviewCount: 0,
            });

        if (images && images.length > 0) {
            await db.insert(productImages).values(
                images.map((url, index) => ({
                    id: uuidv4(),
                    productId: id,
                    url,
                    isPrimary: index === 0,
                    sortOrder: index,
                }))
            );
        }

        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
            with: { images: true }
        });

        if (!product) {
            throw new ApiError(500, "Failed to create product");
        }

        if (redis) {
            try {
                await redis.incr("products:version");
            } catch (err) {
                console.warn("Redis incr error:", err);
            }
        }

        return product;
    },

    async update(id: string, input: UpdateProductInput, userId?: string, userRole?: string) {
        const product = await db.query.products.findFirst({
            where: eq(products.id, id)
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        if (userRole !== "ADMIN" && userId && product.sellerId !== userId) {
            throw ApiError.forbidden("You do not have permission to update this product");
        }

        const { images, price, compareAtPrice, ...rest } = input;

        const updateData: any = { ...rest, updatedAt: new Date() };
        if (price !== undefined) updateData.price = String(price);
        if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice ? String(compareAtPrice) : null;

        await db
            .update(products)
            .set(updateData)
            .where(eq(products.id, id));

        if (redis) {
            try {
                await Promise.all([
                    redis.del(`products:slug:${product.slug}`),
                    redis.del(`products:id:${id}`),
                    redis.incr("products:version")
                ]);
            } catch (err) {
                console.warn("Redis invalidation error:", err);
            }
        }

        return await db.query.products.findFirst({
            where: eq(products.id, id),
            with: { images: true }
        });
    },

    async getById(id: string) {
        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
            with: {
                category: true,
                images: true,
            },
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        return product;
    },

    async delete(id: string, userId?: string, userRole?: string) {
        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
        });

        if (!product) {
            throw ApiError.notFound("Product not found");
        }

        if (userRole !== "ADMIN" && userId && product.sellerId !== userId) {
            throw ApiError.forbidden("You do not have permission to delete this product");
        }

        await db.delete(products).where(eq(products.id, id));

        if (redis) {
            try {
                await Promise.all([
                    redis.del(`products:slug:${product.slug}`),
                    redis.del(`products:id:${id}`),
                    redis.incr("products:version")
                ]);
            } catch (err) {
                console.warn("Redis invalidation error:", err);
            }
        }

        return { deleted: true };
    },

    async getBrands() {
        const brands = await db
            .selectDistinct({ brand: products.brand })
            .from(products)
            .orderBy(products.brand);

        return brands.map(b => b.brand).filter(Boolean) as string[];
    },

    async getFeatured(limit = 8) {
        const data = await db.query.products.findMany({
            where: eq(products.isFeatured, true),
            limit,
            with: {
                images: true,
                category: true
            }
        });

        return data;
    },
};

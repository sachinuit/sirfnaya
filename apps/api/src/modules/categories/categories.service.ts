import { eq } from "drizzle-orm";
import { categories } from "@repo/db";
import { db } from "../../config/database.js";
import { ApiError } from "../../middleware/index.js";
import type { CreateCategoryInput } from "@repo/types";
import { v4 as uuidv4 } from "uuid";

export const categoriesService = {
    async list() {
        return db.query.categories.findMany({
            with: { children: true },
            orderBy: (categories: any, { asc }: any) => [asc(categories.name)],
        });
    },

    async getBySlug(slug: string) {
        const category = await db.query.categories.findFirst({
            where: eq(categories.slug, slug),
            with: {
                children: true,
            },
        });

        if (!category) {
            throw ApiError.notFound("Category not found");
        }

        return category;
    },

    async create(input: CreateCategoryInput) {
        const existing = await db.query.categories.findFirst({
            where: eq(categories.slug, input.slug),
        });
        if (existing) {
            throw ApiError.conflict("A category with this slug already exists");
        }

        const id = uuidv4();
        await db
            .insert(categories)
            .values({ ...input, id });

        return await db.query.categories.findFirst({
            where: eq(categories.id, id),
        });
    },
};

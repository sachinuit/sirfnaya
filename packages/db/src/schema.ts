import {
    mysqlTable,
    varchar,
    text,
    int,
    decimal,
    boolean,
    timestamp,
    uniqueIndex,
    index,
    json,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash"),
    image: text("image"),
    role: varchar("role", { length: 20 }).default("USER").notNull(),
    authProvider: varchar("auth_provider", { length: 20 }).default("EMAIL"),
    googleId: varchar("google_id", { length: 255 }).unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    otpCode: varchar("otp_code", { length: 6 }),
    otpExpiresAt: timestamp("otp_expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    products: many(products),
    cartItems: many(cartItems),
    wishlists: many(wishlists),
    orders: many(orders),
    reviews: many(productReviews),
    addresses: many(addresses),
}));

export const categories = mysqlTable(
    "categories",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }).notNull().unique(),
        description: text("description"),
        image: text("image"),
        parentId: varchar("parent_id", { length: 36 }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("categories_slug_idx").on(table.slug),
    ]
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
        relationName: "categoryParent",
    }),
    children: many(categories, { relationName: "categoryParent" }),
    products: many(products),
}));

export const products = mysqlTable(
    "products",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        name: varchar("name", { length: 500 }).notNull(),
        slug: varchar("slug", { length: 500 }).notNull().unique(),
        description: text("description").notNull(),
        shortDescription: varchar("short_description", { length: 500 }),
        price: decimal("price", { precision: 10, scale: 2 }).notNull(),
        compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
        stock: int("stock").default(0).notNull(),
        sku: varchar("sku", { length: 100 }),
        brand: varchar("brand", { length: 255 }),
        categoryId: varchar("category_id", { length: 36 })
            .references(() => categories.id, { onDelete: "set null" }),
        sellerId: varchar("seller_id", { length: 36 })
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        isFeatured: boolean("is_featured").default(false).notNull(),
        isArchived: boolean("is_archived").default(false).notNull(),
        rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
        reviewCount: int("review_count").default(0).notNull(),
        specifications: text("specifications"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("products_slug_idx").on(table.slug),
        index("products_category_idx").on(table.categoryId),
        index("products_price_idx").on(table.price),
        index("products_created_at_idx").on(table.createdAt),
        index("products_seller_idx").on(table.sellerId),
        index("products_featured_idx").on(table.isFeatured),
    ]
);

export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
    seller: one(users, {
        fields: [products.sellerId],
        references: [users.id],
    }),
    images: many(productImages),
    reviews: many(productReviews),
    cartItems: many(cartItems),
    wishlists: many(wishlists),
    orderItems: many(orderItems),
}));

export const productImages = mysqlTable("product_images", {
    id: varchar("id", { length: 36 }).primaryKey(),
    productId: varchar("product_id", { length: 36 })
        .references(() => products.id, { onDelete: "cascade" })
        .notNull(),
    url: text("url").notNull(),
    publicId: varchar("public_id", { length: 500 }),
    altText: varchar("alt_text", { length: 255 }),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: int("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
    product: one(products, {
        fields: [productImages.productId],
        references: [products.id],
    }),
}));

export const productReviews = mysqlTable(
    "product_reviews",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        productId: varchar("product_id", { length: 36 })
            .references(() => products.id, { onDelete: "cascade" })
            .notNull(),
        userId: varchar("user_id", { length: 36 })
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        rating: int("rating").notNull(),
        title: varchar("title", { length: 255 }),
        comment: text("comment"),
        isVerifiedPurchase: boolean("is_verified_purchase").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        index("reviews_product_idx").on(table.productId),
        index("reviews_user_idx").on(table.userId),
    ]
);

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
    product: one(products, {
        fields: [productReviews.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [productReviews.userId],
        references: [users.id],
    }),
}));

export const cartItems = mysqlTable(
    "cart_items",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        userId: varchar("user_id", { length: 36 })
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        productId: varchar("product_id", { length: 36 })
            .references(() => products.id, { onDelete: "cascade" })
            .notNull(),
        quantity: int("quantity").default(1).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("cart_items_user_product_idx").on(table.userId, table.productId),
    ]
);

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    user: one(users, {
        fields: [cartItems.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [cartItems.productId],
        references: [products.id],
    }),
}));

export const wishlists = mysqlTable(
    "wishlists",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        userId: varchar("user_id", { length: 36 })
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        productId: varchar("product_id", { length: 36 })
            .references(() => products.id, { onDelete: "cascade" })
            .notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("wishlists_user_product_idx").on(table.userId, table.productId),
    ]
);

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
    user: one(users, {
        fields: [wishlists.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [wishlists.productId],
        references: [products.id],
    }),
}));

export const orders = mysqlTable("orders", {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    stripeSessionId: varchar("stripe_session_id", { length: 500 }).unique(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 })
        .default("PENDING")
        .notNull(),
    shippingAddress: json("shipping_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("orders_user_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
]);

export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    items: many(orderItems),
}));

export const orderItems = mysqlTable("order_items", {
    id: varchar("id", { length: 36 }).primaryKey(),
    orderId: varchar("order_id", { length: 36 })
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 36 })
        .notNull()
        .references(() => products.id),
    productName: text("product_name").notNull(),
    productImage: text("product_image"),
    quantity: int("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }),
}));

export const coupons = mysqlTable("coupons", {
    id: varchar("id", { length: 36 }).primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    discountPercent: int("discount_percent").notNull(),
    maxUses: int("max_uses"),
    usesCount: int("uses_count").default(0).notNull(),
    minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
    expiresAt: timestamp("expires_at"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addresses = mysqlTable(
    "addresses",
    {
        id: varchar("id", { length: 36 }).primaryKey(),
        userId: varchar("user_id", { length: 36 })
            .references(() => users.id, { onDelete: "cascade" })
            .notNull(),
        label: varchar("label", { length: 100 }),
        fullName: varchar("full_name", { length: 255 }).notNull(),
        line1: varchar("line1", { length: 500 }).notNull(),
        line2: varchar("line2", { length: 500 }),
        city: varchar("city", { length: 255 }).notNull(),
        state: varchar("state", { length: 255 }),
        postalCode: varchar("postal_code", { length: 20 }).notNull(),
        country: varchar("country", { length: 100 }).notNull(),
        phone: varchar("phone", { length: 20 }),
        isDefault: boolean("is_default").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        index("addresses_user_idx").on(table.userId),
    ]
);

export const addressesRelations = relations(addresses, ({ one }) => ({
    user: one(users, {
        fields: [addresses.userId],
        references: [users.id],
    }),
}));

export const settings = mysqlTable("settings", {
    id: varchar("id", { length: 36 }).primaryKey(),
    storeName: varchar("store_name", { length: 255 }).default("SirfNaya").notNull(),
    storeEmail: varchar("store_email", { length: 255 }).notNull(),
    storeUrl: varchar("store_url", { length: 255 }),
    currency: varchar("currency", { length: 10 }).default("INR").notNull(),
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0").notNull(),
    shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).default("0").notNull(),
    freeShippingThreshold: decimal("free_shipping_threshold", { precision: 10, scale: 2 }),
    lowStockThreshold: int("low_stock_threshold").default(10).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

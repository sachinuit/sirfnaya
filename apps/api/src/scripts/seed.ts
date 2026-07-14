import "dotenv/config";
import { createDb, users, categories, products, productImages, settings } from "@repo/db";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}

const db = createDb(databaseUrl);

async function seed() {
    console.log("Seeding database...");

    const adminId = uuidv4();
    const sellerId = uuidv4();
    const userId = uuidv4();

    await db.insert(users).values([
        {
            id: adminId,
            name: "Admin User",
            email: "admin@sirfnaya.com",
            passwordHash: await bcrypt.hash("Admin123!", 12),
            role: "ADMIN",
            emailVerified: true,
            authProvider: "EMAIL",
        },
        {
            id: sellerId,
            name: "Seller User",
            email: "seller@sirfnaya.com",
            passwordHash: await bcrypt.hash("Seller123!", 12),
            role: "SELLER",
            emailVerified: true,
            authProvider: "EMAIL",
        },
        {
            id: userId,
            name: "Test User",
            email: "user@sirfnaya.com",
            passwordHash: await bcrypt.hash("User123!", 12),
            role: "USER",
            emailVerified: true,
            authProvider: "EMAIL",
        },
    ]);

    const catElectronics = uuidv4();
    const catClothing = uuidv4();
    const catHomeKitchen = uuidv4();
    const catBooks = uuidv4();
    const catSports = uuidv4();

    await db.insert(categories).values([
        { id: catElectronics, name: "Electronics", slug: "electronics", description: "Electronic devices and accessories" },
        { id: catClothing, name: "Clothing", slug: "clothing", description: "Fashion and apparel" },
        { id: catHomeKitchen, name: "Home & Kitchen", slug: "home-kitchen", description: "Home improvement and kitchen essentials" },
        { id: catBooks, name: "Books", slug: "books", description: "Books and educational materials" },
        { id: catSports, name: "Sports", slug: "sports", description: "Sports equipment and gear" },
    ]);

    const prod1 = uuidv4();
    const prod2 = uuidv4();
    const prod3 = uuidv4();

    await db.insert(products).values([
        {
            id: prod1,
            name: "Wireless Bluetooth Headphones",
            slug: "wireless-bluetooth-headphones",
            description: "Premium wireless Bluetooth headphones with noise cancellation.",
            price: "7999.00",
            compareAtPrice: "9999.00",
            stock: 50,
            sku: "WBH-001",
            brand: "TechPro",
            categoryId: catElectronics,
            sellerId: sellerId,
            isFeatured: true,
            rating: "4.5",
            reviewCount: 128,
        },
        {
            id: prod2,
            name: "Smart Watch Pro",
            slug: "smart-watch-pro",
            description: "Advanced smartwatch with health monitoring and GPS.",
            price: "12999.00",
            compareAtPrice: "15999.00",
            stock: 30,
            sku: "SWP-001",
            brand: "TechPro",
            categoryId: catElectronics,
            sellerId: sellerId,
            isFeatured: true,
            rating: "4.3",
            reviewCount: 85,
        },
        {
            id: prod3,
            name: "Cotton Casual T-Shirt",
            slug: "cotton-casual-tshirt",
            description: "Comfortable 100% organic cotton t-shirt.",
            price: "999.00",
            compareAtPrice: "1499.00",
            stock: 200,
            sku: "CCT-001",
            brand: "ComfortWear",
            categoryId: catClothing,
            sellerId: sellerId,
            isFeatured: false,
            rating: "4.1",
            reviewCount: 312,
        },
    ]);

    await db.insert(productImages).values([
        { id: uuidv4(), productId: prod1, url: "https://placehold.co/600x400", isPrimary: true, sortOrder: 0 },
        { id: uuidv4(), productId: prod2, url: "https://placehold.co/600x400", isPrimary: true, sortOrder: 0 },
        { id: uuidv4(), productId: prod3, url: "https://placehold.co/600x400", isPrimary: true, sortOrder: 0 },
    ]);

    await db.insert(settings).values([
        {
            id: uuidv4(),
            storeName: "SirfNaya",
            storeEmail: "admin@sirfnaya.com",
            storeUrl: "https://sirfnaya.com",
            currency: "INR",
            taxRate: "18.00",
            shippingFee: "0.00",
            freeShippingThreshold: "999.00",
            lowStockThreshold: 10,
        },
    ]);

    console.log("Seed complete!");
    console.log("Admin: admin@sirfnaya.com / Admin123!");
    console.log("Seller: seller@sirfnaya.com / Seller123!");
    console.log("User: user@sirfnaya.com / User123!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});

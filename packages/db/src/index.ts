import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema.js";

export function createDb(databaseUrl: string) {
    const pool = mysql.createPool(databaseUrl);
    return drizzle(pool, { schema, mode: "default" });
}

export type Database = ReturnType<typeof createDb>;

export * from "./schema.js";

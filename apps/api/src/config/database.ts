import { createDb, type Database } from "@repo/db";
import { env } from "./env.js";

export const db: Database = createDb(env.DATABASE_URL);
import { Redis } from "@upstash/redis";
import { env } from "./env.js";

export const redis =
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
            url: env.UPSTASH_REDIS_REST_URL,
            token: env.UPSTASH_REDIS_REST_TOKEN,
        })
        : null;

if (!redis) {
    console.warn(
        "Redis is not configured. Caching will be disabled. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env"
    );
}

import { redis } from "../config/redis.js";

export const CacheService = {
    generateKey(...parts: string[]): string {
        return parts.join(":");
    },

    async remember<T>(key: string, fetcher: () => Promise<T>, ttl = 300): Promise<T> {
        if (redis) {
            try {
                const cached = await redis.get(key);
                if (cached) {
                    return cached as T;
                }
            } catch (err) {
                console.warn("Cache get error:", err);
            }
        }

        const data = await fetcher();

        if (redis) {
            try {
                await redis.setex(key, ttl, JSON.stringify(data));
            } catch (err) {
                console.warn("Cache set error:", err);
            }
        }

        return data;
    },

    async invalidatePattern(pattern: string) {
        if (redis) {
            try {
                const keys = await redis.keys(pattern);
                if (keys.length > 0) {
                    await redis.del(...keys);
                }
            } catch (err) {
                console.warn("Cache invalidation error:", err);
            }
        }
    },
};

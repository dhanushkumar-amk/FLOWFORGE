import { redis } from "../config/redis";
import { logger } from "./logger";

export class CacheManager {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.warn("Cache get failed", {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      logger.warn("Cache set failed", {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.warn("Cache delete failed", {
        key,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      let cursor = "0";

      do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;

        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== "0");
    } catch (error) {
      logger.warn("Cache pattern delete failed", {
        pattern,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

export const cache = new CacheManager();

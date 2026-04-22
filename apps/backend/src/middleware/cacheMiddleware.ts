import type { Request, RequestHandler, Response } from "express";
import { cache } from "../utils/cache";
import { CACHE_KEYS } from "../utils/cacheKeys";

type CacheKeyFactory = (req: Request) => string;

const defaultKeyFactory: CacheKeyFactory = (req) => CACHE_KEYS.route(req.originalUrl);

export const cacheMiddleware =
  (ttlSeconds: number, keyFactory: CacheKeyFactory = defaultKeyFactory): RequestHandler =>
  async (req, res, next) => {
    if (req.method !== "GET") {
      next();
      return;
    }

    const key = keyFactory(req);
    const cached = await cache.get<unknown>(key);

    if (cached !== null) {
      res.status(200).json(cached);
      return;
    }

    const originalJson = res.json.bind(res);

    res.json = ((body: unknown): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void cache.set(key, body, ttlSeconds);
      }

      return originalJson(body);
    }) as Response["json"];

    next();
  };

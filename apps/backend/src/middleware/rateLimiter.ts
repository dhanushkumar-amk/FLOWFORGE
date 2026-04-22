/**
 * Rate Limiter Middleware
 *
 * Factory that creates Express middleware using DistributedTokenBucket (Redis)
 * for multi-instance-safe rate limiting.
 *
 * Falls back gracefully if Redis is unavailable (allows request, logs warning).
 *
 * Usage:
 *   router.use(createRateLimiter({ capacity: 100, refillRate: 100/60 }))
 */

import type { NextFunction, Request, Response } from 'express';
import { redis } from '../config/redis';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { DistributedTokenBucket } from '../utils/dsa/distributedTokenBucket';

// ─── Pre-built limiters ───────────────────────────────────────────────────────

/**
 * Global limiter: 100 req/min per IP
 * refillRate = 100/60 ≈ 1.67 tokens/sec
 */
export const globalRateLimiter = createRateLimiter({
  capacity: 100,
  refillRate: 100 / 60,
  keyFn: (req) => `ip:${req.ip}`,
});

/**
 * Auth limiter: 10 req/min per IP (stricter on sign-in/sign-up)
 */
export const authRateLimiter = createRateLimiter({
  capacity: 10,
  refillRate: 10 / 60,
  keyFn: (req) => `auth:ip:${req.ip}`,
});

/**
 * Workflow execution: 10 per hour per workspace
 */
export const executionRateLimiter = createRateLimiter({
  capacity: 10,
  refillRate: 10 / 3600,
  keyFn: (req) => `exec:ws:${req.params.wsId ?? 'unknown'}`,
});

/**
 * AI generation: 20 per day per user
 */
export const aiRateLimiter = createRateLimiter({
  capacity: 20,
  refillRate: 20 / 86400,
  keyFn: (req) => {
    const userId = (req as Request & { auth?: { userId?: string } }).auth?.userId ?? req.ip ?? 'anonymous';
    return `ai:user:${userId}`;
  },
});

// ─── Factory ──────────────────────────────────────────────────────────────────

export interface RateLimiterOptions {
  capacity: number;
  refillRate: number;
  keyFn?: (req: Request) => string;
  keyPrefix?: string;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const bucket = new DistributedTokenBucket(redis, {
    capacity: options.capacity,
    refillRate: options.refillRate,
    keyPrefix: options.keyPrefix ?? 'ratelimit',
  });

  const keyFn = options.keyFn ?? ((req) => `ip:${req.ip ?? 'unknown'}`);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = keyFn(req);
      const result = await bucket.consume(identifier);

      // Set standard rate-limit headers
      res.setHeader('X-RateLimit-Limit', options.capacity);
      res.setHeader('X-RateLimit-Remaining', result.remaining);

      if (!result.allowed) {
        res.setHeader('Retry-After', Math.ceil(result.resetInMs / 1000));
        next(new AppError('Too Many Requests', 429));
        return;
      }

      next();
    } catch (err) {
      // Redis error — fail open (don't block user traffic)
      logger.warn('Rate limiter Redis error — allowing request', {
        error: err instanceof Error ? err.message : String(err),
      });
      next();
    }
  };
}

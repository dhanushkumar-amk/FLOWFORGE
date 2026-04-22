/**
 * Distributed Token Bucket Rate Limiter (Redis-backed)
 *
 * Same token bucket algorithm as TokenBucket, but state is stored in Redis
 * so it works correctly across multiple backend instances.
 *
 * Uses Redis MULTI/EXEC (optimistic concurrency) for atomic updates.
 *
 * Key pattern: ratelimit:{userId}:{route}
 *
 * Time Complexity:  O(1) per consume() — one Redis round-trip
 * Space Complexity: O(K) where K = number of unique user+route combinations
 */

import type { Redis } from 'ioredis';

export interface DistributedBucketOptions {
  capacity: number;   // max tokens
  refillRate: number; // tokens per second
  keyPrefix?: string; // redis key namespace (default: 'ratelimit')
}

export interface DistributedConsumeResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number; // ms until 1 more token is available
}

export class DistributedTokenBucket {
  private readonly capacity: number;
  private readonly refillRate: number;
  private readonly keyPrefix: string;
  private readonly redis: Redis;

  constructor(redis: Redis, options: DistributedBucketOptions) {
    this.redis = redis;
    this.capacity = options.capacity;
    this.refillRate = options.refillRate;
    this.keyPrefix = options.keyPrefix ?? 'ratelimit';
  }

  /**
   * Attempt to consume 1 token for a given identifier (e.g. userId:route).
   */
  async consume(identifier: string, requested = 1): Promise<DistributedConsumeResult> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();

    // Retry loop for optimistic concurrency (WATCH/MULTI/EXEC)
    for (let attempt = 0; attempt < 5; attempt++) {
      await this.redis.watch(key);

      const raw = await this.redis.get(key);
      const state = raw
        ? (JSON.parse(raw) as { tokens: number; lastRefill: number })
        : { tokens: this.capacity, lastRefill: now };

      // Refill
      const elapsedSeconds = (now - state.lastRefill) / 1000;
      const tokensToAdd = elapsedSeconds * this.refillRate;
      const tokens = Math.min(this.capacity, state.tokens + tokensToAdd);

      const allowed = tokens >= requested;
      const newTokens = allowed ? tokens - requested : tokens;

      const newState = JSON.stringify({ tokens: newTokens, lastRefill: now });

      // TTL: expire after enough time for a full refill
      const ttlSeconds = Math.ceil(this.capacity / this.refillRate) + 60;

      const multi = this.redis.multi();
      multi.set(key, newState, 'EX', ttlSeconds);

      const results = await multi.exec();

      // null result means WATCH detected a concurrent write — retry
      if (results === null) continue;

      const remaining = Math.floor(newTokens);
      const deficit = requested - tokens;
      const resetInMs = deficit > 0 ? Math.ceil((deficit / this.refillRate) * 1000) : 0;

      return { allowed, remaining, resetInMs };
    }

    // Fallback — allow request after max retries to avoid starving the caller
    return { allowed: true, remaining: 0, resetInMs: 0 };
  }

  /** Delete all rate limit keys matching a pattern (e.g. for testing) */
  async reset(identifier: string): Promise<void> {
    const key = `${this.keyPrefix}:${identifier}`;
    await this.redis.del(key);
  }
}

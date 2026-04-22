/**
 * Token Bucket Rate Limiter (In-Memory)
 *
 * Algorithm:
 *   Tokens accumulate at `refillRate` tokens/second up to `capacity`.
 *   Each request consumes 1 token (or more if specified).
 *   If not enough tokens: request is rejected.
 *
 * Time Complexity:  O(1) per consume() call
 * Space Complexity: O(1) per bucket instance
 *
 * Used in FlowForge for per-user in-process rate limiting.
 * For multi-instance deployments, use DistributedTokenBucket instead.
 */

export interface TokenBucketStatus {
  tokens: number;
  capacity: number;
  refillRate: number;    // tokens per second
  nextRefillMs: number;  // ms until at least 1 token is added
}

export interface TokenBucketOptions {
  capacity: number;    // max tokens the bucket can hold
  refillRate: number;  // tokens added per second
}

export class TokenBucket {
  private tokens: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens/second
  private lastRefill: number;          // unix ms

  constructor({ capacity, refillRate }: TokenBucketOptions) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity; // start full
    this.lastRefill = Date.now();
  }

  /**
   * Attempt to consume `requested` tokens.
   * Returns true if allowed, false if rate-limited.
   */
  consume(requested = 1): boolean {
    this.refill();

    if (this.tokens >= requested) {
      this.tokens -= requested;
      return true;
    }
    return false;
  }

  getStatus(): TokenBucketStatus {
    this.refill();
    const tokensNeeded = 1;
    const deficit = tokensNeeded - this.tokens;
    const nextRefillMs = deficit > 0 ? Math.ceil((deficit / this.refillRate) * 1000) : 0;

    return {
      tokens: Math.floor(this.tokens),
      capacity: this.capacity,
      refillRate: this.refillRate,
      nextRefillMs,
    };
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

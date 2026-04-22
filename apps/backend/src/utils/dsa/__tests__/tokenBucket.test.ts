import { TokenBucket } from '../tokenBucket';

describe('TokenBucket', () => {
  test('full bucket allows requests', () => {
    const bucket = new TokenBucket({ capacity: 10, refillRate: 1 });
    for (let i = 0; i < 10; i++) {
      expect(bucket.consume()).toBe(true);
    }
  });

  test('empty bucket blocks requests', () => {
    const bucket = new TokenBucket({ capacity: 3, refillRate: 1 });
    bucket.consume();
    bucket.consume();
    bucket.consume();
    // Now empty
    expect(bucket.consume()).toBe(false);
  });

  test('bucket refills over time', async () => {
    const bucket = new TokenBucket({ capacity: 5, refillRate: 100 }); // 100 tokens/sec
    // Drain completely
    for (let i = 0; i < 5; i++) bucket.consume();
    expect(bucket.consume()).toBe(false);

    // Wait 50ms → should get 5 tokens back (100 tokens/sec * 0.05s = 5)
    await new Promise((r) => setTimeout(r, 55));
    expect(bucket.consume()).toBe(true);
  });

  test('getStatus returns correct fields', () => {
    const bucket = new TokenBucket({ capacity: 10, refillRate: 2 });
    bucket.consume();
    const status = bucket.getStatus();

    expect(status).toHaveProperty('tokens');
    expect(status).toHaveProperty('capacity', 10);
    expect(status).toHaveProperty('refillRate', 2);
    expect(status).toHaveProperty('nextRefillMs');
    expect(status.tokens).toBeLessThanOrEqual(10);
  });

  test('does not exceed capacity on refill', async () => {
    const bucket = new TokenBucket({ capacity: 5, refillRate: 100 });
    // Wait long enough to have "overflowed" if not capped
    await new Promise((r) => setTimeout(r, 200));
    const status = bucket.getStatus();
    expect(status.tokens).toBeLessThanOrEqual(5);
  });

  test('consume multiple tokens at once', () => {
    const bucket = new TokenBucket({ capacity: 10, refillRate: 1 });
    expect(bucket.consume(5)).toBe(true);
    expect(bucket.consume(5)).toBe(true);
    expect(bucket.consume(1)).toBe(false); // empty now
  });
});

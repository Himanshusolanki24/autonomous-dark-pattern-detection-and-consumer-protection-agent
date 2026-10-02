// =============================================================================
// lib/security/rate-limit.ts
// Per-user sliding-window rate limiter. In-process for the MVP; swap the store
// for Redis when REDIS_URL is set for horizontal deployments.
// =============================================================================

import { RateLimitError } from "./errors";

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  agentStart: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
  scanner: { limit: 30, windowMs: 60 * 60 * 1000 }, // 30/hour
  approval: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20/hour
};

interface Bucket {
  timestamps: number[];
}

const store = new Map<string, Map<string, Bucket>>();

function prune() {
  const now = Date.now();
  for (const [bucketName, users] of store) {
    for (const [userId, bucket] of users) {
      const windowMs = DEFAULT_RATE_LIMITS[bucketName]?.windowMs ?? 60_000;
      bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
      if (bucket.timestamps.length === 0) users.delete(userId);
    }
    if (users.size === 0) store.delete(bucketName);
  }
}

setInterval(prune, 5 * 60 * 1000).unref();

/**
 * Records an attempt for `key` in `bucketName`. Throws RateLimitError (429)
 * when the window is full.
 */
export function checkRateLimit(key: string, bucketName: string): void {
  const cfg = DEFAULT_RATE_LIMITS[bucketName] ?? { limit: 60, windowMs: 60_000 };
  const now = Date.now();

  let buckets = store.get(bucketName);
  if (!buckets) {
    buckets = new Map();
    store.set(bucketName, buckets);
  }
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < cfg.windowMs);

  if (bucket.timestamps.length >= cfg.limit) {
    throw new RateLimitError();
  }

  bucket.timestamps.push(now);
}

export function rateLimitHeaders(used: number, limit: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit - used)),
  };
}
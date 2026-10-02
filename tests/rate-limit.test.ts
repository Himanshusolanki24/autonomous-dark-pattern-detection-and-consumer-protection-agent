import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, DEFAULT_RATE_LIMITS } from "@/server/security/rate-limit";
import { RateLimitError } from "@/server/security/errors";

describe("checkRateLimit", () => {
  beforeEach(() => {
    // isolate each test with unique keys
  });

  it("allows requests under the limit", () => {
    const cfg = DEFAULT_RATE_LIMITS.agentStart;
    for (let i = 0; i < cfg.limit; i++) {
      expect(() => checkRateLimit(`user-a-${Date.now()}`, "agentStart")).not.toThrow();
    }
  });

  it("throws 429 once the window is full", () => {
    const key = `burst-${Date.now()}`;
    const cfg = DEFAULT_RATE_LIMITS.agentStart;
    for (let i = 0; i < cfg.limit; i++) {
      checkRateLimit(key, "agentStart");
    }
    expect(() => checkRateLimit(key, "agentStart")).toThrow(RateLimitError);
  });

  it("scopes buckets per user", () => {
    const a = `uA-${Date.now()}`;
    const b = `uB-${Date.now()}`;
    const cfg = DEFAULT_RATE_LIMITS.scanner;
    for (let i = 0; i < cfg.limit; i++) {
      checkRateLimit(a, "scanner");
    }
    // user B is untouched
    expect(() => checkRateLimit(b, "scanner")).not.toThrow();
    expect(() => checkRateLimit(a, "scanner")).toThrow(RateLimitError);
  });
});
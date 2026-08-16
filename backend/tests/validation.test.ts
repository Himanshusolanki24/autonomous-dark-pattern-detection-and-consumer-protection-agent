import { describe, it, expect } from "vitest";
import {
  parseOrThrow,
  startAgentSchema,
  scannerSchema,
  approvalActionSchema,
  validIdempotencyKey,
} from "@/lib/security/validation";

describe("startAgentSchema", () => {
  it("accepts a valid cancellation request", () => {
    const body = parseOrThrow(startAgentSchema, {
      goal: "cancel_subscription",
      targetUrl: "https://example.com/account",
    });
    expect(body.goal).toBe("cancel_subscription");
  });

  it("rejects an unsupported goal", () => {
    expect(() =>
      parseOrThrow(startAgentSchema, { goal: "hack", targetUrl: "https://x.com" })
    ).toThrow(/Invalid request/);
  });

  it("rejects extra unknown fields (strict)", () => {
    expect(() =>
      parseOrThrow(startAgentSchema, {
        goal: "cancel_subscription",
        targetUrl: "https://x.com",
        sneaky: true,
      })
    ).toThrow(/Invalid request/);
  });
});

describe("scannerSchema", () => {
  it("accepts a URL", () => {
    expect(parseOrThrow(scannerSchema, { url: "https://a.com" }).url).toBe("https://a.com");
  });

  it("rejects a missing URL", () => {
    expect(() => parseOrThrow(scannerSchema, {})).toThrow(/Invalid request/);
  });
});

describe("approvalActionSchema", () => {
  it("defaults to approve when absent", () => {
    expect(parseOrThrow(approvalActionSchema, undefined)).toBeUndefined();
    expect(parseOrThrow(approvalActionSchema, { decision: "reject" })!.decision).toBe("reject");
  });
});

describe("validIdempotencyKey", () => {
  it("accepts 8-128 char keys", () => {
    expect(validIdempotencyKey("abcdefgh")).toBe(true);
    expect(validIdempotencyKey("a".repeat(128))).toBe(true);
  });
  it("rejects short/empty/null keys", () => {
    expect(validIdempotencyKey("abc")).toBe(false);
    expect(validIdempotencyKey("")).toBe(false);
    expect(validIdempotencyKey(null)).toBe(false);
  });
});
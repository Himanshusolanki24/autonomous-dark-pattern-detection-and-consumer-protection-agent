// =============================================================================
// lib/security/validation.ts
// Zod schemas for every API surface. Never trust raw JSON.
// =============================================================================

import { z } from "zod";
import { ValidationError } from "./errors";

export const goalSchema = z.enum(["cancel_subscription", "detect_dark_patterns"]);

export const targetUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048);

export const startAgentSchema = z
  .object({
    goal: goalSchema,
    targetUrl: targetUrlSchema,
  })
  .strict();

export const scannerSchema = z
  .object({
    url: targetUrlSchema,
  })
  .strict();

export const approvalActionSchema = z
  .object({
    decision: z.enum(["approve", "reject"]).default("approve"),
  })
  .strict()
  .optional();

export const profilePatchSchema = z
  .object({
    full_name: z.string().trim().max(120).optional(),
    avatar_url: z
      .string()
      .trim()
      .url()
      .max(2048)
      .optional()
      .or(z.literal("").transform(() => null)),
  })
  .strict()
  .refine((v) => v.full_name !== undefined || v.avatar_url !== undefined, {
    message: "Nothing to update",
  });

export const activityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().trim().max(100).optional(),
  status: z.string().trim().max(50).optional(),
  agent: z.string().trim().max(50).optional(),
  date: z.string().trim().max(30).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

/** Validate an unknown value against a schema, throwing ValidationError. */
export function parseOrThrow<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
  what = "request"
): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new ValidationError(
      `Invalid ${what}: ${first?.path?.join(".") || first?.message || "unknown field"}`
    );
  }
  return result.data;
}

/** Lightweight positive-integer idempotency key check. */
export function validIdempotencyKey(value: string | null): value is string {
  return !!value && value.length >= 8 && value.length <= 128;
}
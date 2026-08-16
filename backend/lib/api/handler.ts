// =============================================================================
// lib/api/handler.ts
// Wraps route handlers so typed errors map to clean JSON responses and the
// server never leaks stack traces.
// =============================================================================

import { NextResponse } from "next/server";
import { AppError, errorBody } from "@/lib/security/errors";
import { logEvent } from "@/lib/security/audit";

export interface ApiContext {
  params: Promise<Record<string, string>>;
  requestId?: string;
}

export type ApiHandler = (req: Request, ctx: ApiContext) => Promise<NextResponse>;

export function api(handler: ApiHandler): ApiHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AppError) {
        return NextResponse.json(errorBody(err), { status: err.status });
      }
      logEvent({ requestId: ctx?.requestId ?? "unknown" }, "unhandled_api_error", {
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json(errorBody(err), { status: 500 });
    }
  };
}

export function jsonOk(data: unknown, init: ResponseInit = {}): NextResponse {
  return NextResponse.json(data, init);
}
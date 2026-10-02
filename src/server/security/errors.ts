// =============================================================================
// lib/security/errors.ts
// Typed application errors mapped to HTTP status codes.
// Stack traces are never returned to clients.
// =============================================================================

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly expose: boolean;

  constructor(message: string, status = 500, code = "INTERNAL_ERROR", expose = false) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.expose = expose;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHENTICATED", true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You are not allowed to perform this action") {
    super(message, 403, "FORBIDDEN", true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND", true);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request") {
    super(message, 422, "INVALID_REQUEST", true);
  }
}

export class AgentError extends AppError {
  constructor(message = "Agent operation failed") {
    super(message, 500, "AGENT_ERROR", true);
  }
}

export class BrowserAutomationError extends AppError {
  constructor(message = "Browser automation failed") {
    super(message, 500, "BROWSER_ERROR", true);
  }
}

export class VerificationError extends AppError {
  constructor(message = "Outcome could not be verified") {
    super(message, 500, "VERIFICATION_ERROR", true);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMITED", true);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource state conflict") {
    super(message, 409, "CONFLICT", true);
  }
}

/** JSON body sent to clients. Never includes the error stack. */
export function errorBody(err: unknown): { error: { code: string; message: string } } {
  if (err instanceof AppError && err.expose) {
    return { error: { code: err.code, message: err.message } };
  }
  return {
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
  };
}
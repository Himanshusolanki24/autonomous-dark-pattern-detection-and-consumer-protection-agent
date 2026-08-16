"use client";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      `Unable to reach the API at ${BACKEND_URL}. Is the backend running?`,
      0,
      "NETWORK_ERROR"
    );
  }

  let text = "";
  try {
    text = await res.text();
  } catch {
    text = "";
  }

  let body: { error?: { code?: unknown; message?: unknown } } | null = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    const rawCode = body?.error?.code;
    const rawMessage = body?.error?.message;
    const code = typeof rawCode === "string" ? rawCode : undefined;
    const message =
      typeof rawMessage === "string" && rawMessage.length > 0
        ? rawMessage
        : `${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, code);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined, headers }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};

export function isUnauthed(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}
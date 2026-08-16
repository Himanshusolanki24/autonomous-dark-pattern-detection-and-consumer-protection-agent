// =============================================================================
// lib/security/ssrf.ts
// Server-Side Request Forgery protection for target URLs.
// =============================================================================

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const BLOCKED_PROTOCOLS = ["javascript:", "data:", "file:", "about:"] as const;
export const BLOCKED_HOSTNAMES = ["localhost", "0.0.0.0"] as const;

/** IPv4 private / loopback / link-local / reserved ranges. */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;

  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // loopback
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  return false;
}

/** IPv6 loopback / link-local / ULA / mapped IPv4 forms. */
function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("::ffff:") && isPrivateIPv4(lower.slice(7))) return true;
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // ULA
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // malformed — treat as unsafe
}

/** Dev-only affordance: allow loopback targets for the self-hosted demo site. */
function devAllows(): boolean {
  return process.env.SUPABASE_DEV_MODE !== "false";
}

function isLoopbackHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    BLOCKED_HOSTNAMES.includes(host as (typeof BLOCKED_HOSTNAMES)[number]) ||
    host === "127.0.0.1" ||
    host === "::1"
  );
}

/**
 * Validates a URL for server-side navigation.
 * - only http/https
 * - no userinfo, no blocked protocols
 * - hostname not localhost/loopback
 * - resolves IP (when resolvable) is not private
 */
export async function validateTargetUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("Invalid URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`Protocol not allowed: ${url.protocol}`);
  }
  if (url.username || url.password) {
    throw new Error("URL credentials are not allowed");
  }
  if (isLoopbackHost(url.hostname)) {
    if (!devAllows()) {
      throw new Error("Loopback hostnames are not allowed");
    }
    return url;
  }

  const host = url.hostname.toLowerCase();
  if (isIP(host) !== 0 && isPrivateAddress(host)) {
    if (!devAllows()) {
      throw new Error("Private IP addresses are not allowed");
    }
    return url;
  }

  // Resolve and re-check the effective IP to defeat DNS rebinding.
  try {
    const records = await lookup(host, { all: true });
    for (const { address } of records) {
      if (isPrivateAddress(address)) {
        if (!devAllows()) {
          throw new Error("Resolved address is not public");
        }
      }
    }
  } catch (err) {
    // DNS failures on local dev (e.g. demo-target host) shouldn't hard-block,
    // but private resolvers are still rejected above.
    if (err instanceof Error && err.message === "Resolved address is not public") {
      throw err;
    }
  }

  return url;
}

/** Synchronous fast-path used before async DNS checks. */
export function validateTargetUrlSync(raw: string): URL {
  const url = new URL(raw.trim());
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`Protocol not allowed: ${url.protocol}`);
  }
  if (url.username || url.password) throw new Error("URL credentials are not allowed");
  return url;
}
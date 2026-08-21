import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Resolve project root — works in both local dev and Vercel build.
const __root =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Keep Playwright out of the serverless bundle — the worker runs on the
  // dedicated agent environment, not inside the bundled server runtime.
  serverExternalPackages: ["playwright"],
  // Pin the tracing root so Next does not walk up to the parent folder.
  outputFileTracingRoot: __root,
};

export default nextConfig;

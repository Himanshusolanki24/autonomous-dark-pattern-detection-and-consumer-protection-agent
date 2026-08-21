import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Resolve project root — works in both local dev and Vercel build.
const __root =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the app root so Next does not walk up to the parent folder.
  turbopack: {
    root: __root,
  },
  outputFileTracingRoot: __root,
};

export default nextConfig;

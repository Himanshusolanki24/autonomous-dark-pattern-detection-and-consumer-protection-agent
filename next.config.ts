import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// Resolve project root — works in both local dev and Vercel build.
const __root =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Don't let next dev write AI assistant instruction files into the repo.
  agentRules: false,
  // Playwright drives a real browser for the agent, and the neural detector runs
  // a native ONNX runtime; keep them out of the bundle.
  serverExternalPackages: [
    "playwright",
    "@sparticuz/chromium",
    "neo4j-driver",
    "@huggingface/transformers",
    "onnxruntime-node",
  ],
  // Pin the app root so Next does not walk up to the parent folder.
  turbopack: {
    root: __root,
  },
  outputFileTracingRoot: __root,
};

export default nextConfig;

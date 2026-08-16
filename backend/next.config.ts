import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Playwright out of the serverless bundle — the worker runs on the
  // dedicated agent environment, not inside the bundled server runtime.
  serverExternalPackages: ["playwright"],
  // This project is intentionally not inside the git repo root; pin the
  // tracing root so Next does not walk up to the parent folder.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

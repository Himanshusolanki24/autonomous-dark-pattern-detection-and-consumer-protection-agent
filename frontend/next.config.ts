import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The parent folder ("Nsut ") is outside this repo and the home directory
  // holds a stray node_modules/package-lock.json; pin the app root so Next
  // does not walk up and mis-detect the workspace root.
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

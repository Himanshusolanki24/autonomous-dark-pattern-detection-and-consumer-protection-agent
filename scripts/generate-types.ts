#!/usr/bin/env tsx
// =============================================================================
// scripts/generate-types.ts
// Regenerates src/types/database.ts from the live Supabase database.
//
// Run: npm run db:types
// =============================================================================

import "dotenv/config";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

let projectId: string;
try {
  const hostname = new URL(url).hostname;
  projectId = hostname.split(".")[0];
} catch {
  projectId = url.replace(/^https?:\/\//, "").split("/")[0].split(".")[0];
}

const outputPath = resolve(process.cwd(), "src/types/database.ts");

execSync(
  `npx supabase gen types typescript --project-id "${projectId}" > "${outputPath}"`,
  { stdio: "inherit" }
);

console.log("src/types/database.ts regenerated.");
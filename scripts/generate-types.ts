#!/usr/bin/env tsx
// =============================================================================
// scripts/generate-types.ts
// Regenerates types/database.ts from the live Supabase database.
//
// Run: npm run db:types
// =============================================================================

import "dotenv/config";
import { execSync } from "node:child_process";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

execSync(
  `npx supabase gen types typescript --project-id "${url.replace(/^https?:\/\//, "")}" > types/database.ts`,
  { stdio: "inherit" }
);

console.log("types/database.ts regenerated.");
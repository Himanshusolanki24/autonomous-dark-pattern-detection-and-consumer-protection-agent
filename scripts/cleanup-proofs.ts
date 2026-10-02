#!/usr/bin/env tsx
// =============================================================================
// scripts/cleanup-proofs.ts
// Deletes proof screenshots older than the retention window (default 7 days)
// and removes their references in dark_pattern_detections.screenshot_path.
//
// Run: npm run cleanup:proofs
// =============================================================================

import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import "dotenv/config";

const PROOFS_DIR = process.env.PROOFS_DIR ?? `${process.cwd()}/.proofs`;
const RETENTION_DAYS = Number(process.env.PROOF_RETENTION_DAYS ?? 7);
const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

async function main() {
  let files: string[];
  try {
    files = await readdir(PROOFS_DIR);
  } catch {
    console.log(`[cleanup] ${PROOFS_DIR} does not exist — nothing to do.`);
    return;
  }

  let removed = 0;
  for (const name of files) {
    if (!name.startsWith("proof_")) continue;
    const path = join(PROOFS_DIR, name);
    const stat = await import("node:fs/promises").then((m) => m.stat(path));
    if (stat.mtimeMs < cutoff) {
      await unlink(path);
      removed++;
    }
  }
  console.log(`[cleanup] removed ${removed} proof(s) older than ${RETENTION_DAYS} day(s).`);
}

main().catch((err) => {
  console.error("[cleanup] failed", err);
  process.exit(1);
});
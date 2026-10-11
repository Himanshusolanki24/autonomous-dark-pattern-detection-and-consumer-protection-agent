#!/usr/bin/env tsx
// =============================================================================
// scripts/seed-graph.ts
// Creates the Neo4j constraints and loads the pattern taxonomy + the heuristic
// indicator phrases. Safe to re-run.
//
// Run: npm run graph:seed
// =============================================================================

import { config } from "dotenv";
config({ path: ".env.local" });
config();

async function main() {
  // Imported after dotenv so the driver sees NEO4J_*.
  const { seedGraph, closeGraph } = await import("@/server/graph/neo4j");
  const { SEED_INDICATORS } = await import("@/server/detection/classifier");
  if (!process.env.NEO4J_URI) {
    console.error("[graph:seed] NEO4J_URI is not set — nothing to do.");
    process.exit(1);
  }
  const ok = await seedGraph(SEED_INDICATORS);
  await closeGraph();
  console.log(ok ? "[graph:seed] Graph seeded." : "[graph:seed] Failed — see the warning above.");
  process.exit(ok ? 0 : 1);
}

main();

"use client";

import { api } from "@/lib/api";
import type { DarkPattern, RiskOverview } from "@/lib/types";
import { PATTERN_TYPE_MAP } from "@/lib/services/agentService";

export interface ScanProgress {
  label: string;
  status: "done" | "running" | "pending";
}

export interface ScanResult {
  url: string;
  risk: RiskOverview;
  patterns: DarkPattern[];
}

interface BackendScanDetection {
  patternType: string;
  severity: DarkPattern["severity"];
  confidence: number;
  explanation: string;
  elementText: string | null;
}

interface BackendScan {
  url: string;
  title: string;
  overallRisk: string;
  patternsDetected: number;
  detections: BackendScanDetection[];
}

export async function scanUrl(url: string): Promise<ScanResult> {
  const res = await api.post<BackendScan>("/api/scanner/analyze", { url });

  const patterns: DarkPattern[] = res.detections.map((d, i) => ({
    id: `scan_${i}`,
    type: PATTERN_TYPE_MAP[d.patternType] ?? "hard-to-cancel",
    severity: d.severity,
    confidence: d.confidence,
    element: d.elementText ?? "Detected element",
    explanation: d.explanation,
    whyItMatters:
      "This pattern was flagged automatically. Review the evidence before proceeding.",
  }));

  const overall = mapRisk(res.overallRisk);
  const risk: RiskOverview = {
    overall,
    totalPatterns: patterns.length,
    critical: patterns.filter((p) => p.severity === "critical").length,
    warnings:
      patterns.filter((p) => p.severity === "high").length +
      patterns.filter((p) => p.severity === "medium").length,
  };

  return { url: res.url, risk, patterns };
}

function mapRisk(level: string): RiskOverview["overall"] {
  if (level === "critical" || level === "high" || level === "medium" || level === "low") {
    return level;
  }
  return "medium";
}
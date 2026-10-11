"use client";

import { api } from "@/lib/api";
import type { DarkPattern, RiskOverview } from "@/lib/types";
import { PATTERN_TYPE_MAP } from "@/lib/services/agentService";

export interface ScanProgress {
  label: string;
  status: "done" | "running" | "pending";
}

export interface ElementPosition {
  role: string;
  text: string;
  box: { x: number; y: number; width: number; height: number } | null;
}

export interface PerceptionData {
  url: string;
  title: string;
  visibleText: string;
  elements: ElementPosition[];
}

export interface ScanResult {
  url: string;
  risk: RiskOverview;
  patterns: DarkPattern[];
  perception: PerceptionData;
}

interface BackendScanDetection {
  patternType: string;
  severity: DarkPattern["severity"];
  confidence: number;
  explanation: string;
  elementText: string | null;
  elementRole: string | null;
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
    feedback: d.elementText ? { patternType: d.patternType, evidence: d.elementText } : undefined,
  }));

const perception: PerceptionData = {
    url: res.url,
    title: res.title,
    visibleText: res.detections.length > 0 ? res.detections[0]?.elementText ?? "" : "",
    elements: (() => {
      if (res.detections.length > 0 && res.detections[0]?.elementText) {
        const mapped = res.detections.map((d) => {
          if (d.elementText) {
            return { role: d.elementRole ?? "text", text: d.elementText, box: null };
          }
          return null;
        });
        const filtered = mapped.filter((e) => e != null);
        return filtered as ElementPosition[];
      }
      return [];
    })(),
  };

  const overall = mapRisk(res.overallRisk);
  const risk: RiskOverview = {
    overall,
    totalPatterns: patterns.length,
    critical: patterns.filter((p) => p.severity === "critical").length,
    warnings:
      patterns.filter((p) => p.severity === "high").length +
      patterns.filter((p) => p.severity === "medium").length,
  };

  return { url: res.url, risk, patterns, perception };
}

function mapRisk(level: string): RiskOverview["overall"] {
  if (level === "critical" || level === "high" || level === "medium" || level === "low") {
    return level;
  }
  return "medium";
}
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { PerceptionData, ElementPosition } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

function ElementHighlightSlot({
  element,
  isActive,
}: {
  element: ElementPosition;
  isActive: boolean;
}) {
  if (!element.box) return null;

  const percent = (v: number) => Math.max(0, Math.min(100, v));

  return (
    <motion.div
      className="absolute select-none pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-200"
      style={{
        left: percent(element.box.x) + "%",
        top: percent(element.box.y) + "%",
        width: element.box.width > 0 ? percent(element.box.width) + "%" : "100%",
        height: element.box.height > 0 ? percent(element.box.height) + "%" : "100%",
      }}
    />
  );
}

function ElementMarker({
  element,
  isActive,
}: {
  element: ElementPosition;
  isActive: boolean;
}) {
  if (!element.box) return null;

  const percent = (v: number) => Math.max(0, Math.min(100, v));

  return (
    <motion.div
      className="absolute rounded-border border-2 border-amber-500/50 bg-amber-500/10 backdrop-blur-sm pointer-events-none"
      style={{
        left: percent(element.box.x) + "%",
        top: percent(element.box.y) + "%",
        width: element.box.width > 0 ? percent(element.box.width) + "%" : "100%",
        height: element.box.height > 0 ? percent(element.box.height) + "%" : "100%",
      }}
    />
  );
}

export function LiveWebsitePanel({
  url,
  perception,
  highlightedElementIndex,
  onElementHover,
  onElementClick,
}: {
  url: string;
  perception: PerceptionData | undefined;
  highlightedElementIndex?: number;
  onElementHover?: (element: ElementPosition) => void;
  onElementClick?: (element: ElementPosition) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setShowPreview(true);
  }, [perception]);

  if (!showPreview || !perception) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-zinc-500">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8 text-zinc-300 mb-2"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="6" width="20" height="14" rx="2" ry="2" />
          <path d="M6 2L3 6l3 6l3-6l3 6" />
        </svg>
        <span>Enter a URL to see the browser preview</span>
      </div>
    );
  }

  const hostname = hostnameOf(url);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="font-medium text-zinc-800">LIVE WEBSITE</h3>
        <Lock className="h-4 w-4 text-emerald-500" />
        <span className="text-sm text-zinc-500">{hostname}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">URL</span>
        <span className="font-mono text-zinc-800 truncate w-64">{url}</span>
      </div>

      <div className="relative rounded-xl border border-border bg-zinc-50 overflow-hidden">
        <div
          className="relative min-h-[300px] bg-zinc-100 overflow-hidden"
          style={{ backgroundImage: perception.url ? `url(${perception.url})` : undefined }}
        >
          {perception.elements.map((element, i) => {
            const isHighlighted = highlightedElementIndex === i;

            return (
              <motion.div
                key={i}
                whileHover={{ scale: isHighlighted ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <ElementHighlightSlot
                  element={element}
                  isActive={isHighlighted}
                />
                <ElementMarker element={element} isActive={isHighlighted} />
                <span
                  className="absolute text-[8px] text-zinc-400 transition-opacity duration-200"
                  style={{ opacity: isHighlighted ? 1 : 0.5 }}
                >
                  {element.text.slice(0, 30)}{element.text.length > 30 && "..."}
                </span>
              </motion.div>
            );
          })}

          {perception.elements.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-zinc-500">
              No interactive elements detected
            </p>
          )}
        </div>
      </div>

      {highlightedElementIndex !== undefined && perception?.elements.length > 0 && (
        <p className="text-xs text-zinc-500">
          Click an element above to view evidence
        </p>
      )}
    </div>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
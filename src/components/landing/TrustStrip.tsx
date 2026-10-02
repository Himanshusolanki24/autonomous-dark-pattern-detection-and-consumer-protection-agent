"use client";

import { TRUST_CATEGORIES } from "./constants";

export function TrustStrip() {
  return (
    <section
      className="border-y border-border bg-surface/60"
      aria-label="Coverage areas"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <p className="shrink-0 text-[12px] font-medium text-zinc-400 sm:text-[13px]">
            Built for the decisions users make every day
          </p>
          <div className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <ul
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start"
            aria-label="Supported contexts"
          >
            {TRUST_CATEGORIES.map((cat) => (
              <li
                key={cat.label}
                className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 transition-colors hover:text-zinc-700"
              >
                <span aria-hidden="true">{cat.icon}</span>
                {cat.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

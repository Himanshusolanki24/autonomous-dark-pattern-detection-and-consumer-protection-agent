"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Play, Search, Shield } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/navigation";
import { useAgentStore } from "@/stores/agent-store";
import { cn } from "@/lib/utils";

const STATUS = {
  idle: {
    label: "Agent idle",
    hint: "Nothing running",
    dot: "bg-zinc-400",
    card: "border-border bg-zinc-50/80",
  },
  running: {
    label: "Agent working",
    hint: "Live session in progress",
    dot: "bg-emerald-500 animate-dot-pulse",
    card: "border-emerald-200/70 bg-success-soft",
  },
  blocked: {
    label: "Approval needed",
    hint: "Waiting on your decision",
    dot: "bg-amber-500 animate-dot-pulse",
    card: "border-amber-200/80 bg-warning-soft",
  },
  completed: {
    label: "Case closed",
    hint: "Last run finished cleanly",
    dot: "bg-emerald-500",
    card: "border-emerald-200/70 bg-success-soft",
  },
  failed: {
    label: "Run stopped",
    hint: "Last run did not finish",
    dot: "bg-red-500",
    card: "border-red-200/70 bg-danger-soft",
  },
} as const;

export function Sidebar({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  const status = useAgentStore((s) => s.status);
  const s = STATUS[status] ?? STATUS.idle;

  return (
    <aside
      className="glass relative hidden w-[252px] shrink-0 flex-col border-r border-border/80 md:flex"
      aria-label="Primary navigation"
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 px-5 pb-5 pt-6 focus-visible:outline-none"
        aria-label="TrapKiller home"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_8px_18px_-8px_rgba(79,70,229,0.8)]">
          <Shield className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-marker" />
        </span>
        <span className="min-w-0">
          <span className="font-display block text-[17px] font-bold leading-none tracking-tight">TrapKiller</span>
          <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
            Evidence lab
          </span>
        </span>
      </Link>

      <button
        type="button"
        onClick={onSearch}
        className="mx-3 mb-5 flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2 text-[12.5px] text-zinc-500 shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        Jump to…
        <kbd className="ml-auto rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] text-zinc-500">
          ⌘K
        </kbd>
      </button>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.title} className={cn(i > 0 && "mt-6")}>
            <p className="eyebrow px-3 pb-2 text-[9.5px]">{section.title}</p>
            <ul role="list" aria-label={section.title} className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors focus-visible:outline-none",
                        active ? "font-semibold text-blue-700" : "text-zinc-600 hover:text-foreground"
                      )}
                    >
                      {active && (
                        // One shared pill that glides to whichever page is open.
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl border border-blue-100 bg-brand-soft"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          "relative h-4 w-4 shrink-0 transition-colors",
                          active ? "text-brand" : "text-zinc-400 group-hover:text-zinc-600"
                        )}
                        aria-hidden="true"
                      />
                      <span className="relative truncate">{item.label}</span>
                      {item.href === "/agent" && status === "blocked" && (
                        <span
                          className="relative ml-auto h-1.5 w-1.5 rounded-full bg-amber-500 animate-dot-pulse"
                          aria-label="Approval needed"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn("m-3 rounded-2xl border p-3.5 transition-colors", s.card)} role="status">
        <p className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.dot)} aria-hidden="true" />
          {s.label}
        </p>
        <p className="mt-0.5 pl-3.5 text-[11px] leading-snug text-zinc-500">{s.hint}</p>
        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2.5">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-blue-700 hover:underline focus-visible:outline-none"
          >
            <Play className="h-3 w-3" aria-hidden="true" />
            Watch a demo
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-0.5 font-mono text-[9.5px] uppercase tracking-wider text-zinc-500 hover:text-foreground"
          >
            demo@trapkiller.dev
            <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Search, Shield } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/navigation";
import { useAgentStore } from "@/stores/agent-store";
import { cn } from "@/lib/utils";

const STATUS = {
  idle: { label: "Agent is idle", dot: "bg-white/30" },
  running: { label: "Agent is working", dot: "bg-emerald-400 animate-dot-pulse" },
  blocked: { label: "Waiting for your approval", dot: "bg-marker animate-dot-pulse" },
  completed: { label: "Last case closed", dot: "bg-emerald-400" },
  failed: { label: "Last case stopped", dot: "bg-red-400" },
} as const;

export function Sidebar({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  const status = useAgentStore((s) => s.status);
  const s = STATUS[status] ?? STATUS.idle;

  return (
    <aside
      className="hidden w-[236px] shrink-0 flex-col bg-foreground text-white md:flex"
      aria-label="Primary navigation"
    >
      <Link href="/" className="flex items-center gap-2.5 px-5 pb-5 pt-6 focus-visible:outline-none">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marker text-foreground">
          <Shield className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <span className="font-display text-[18px] font-bold">TrapKiller</span>
      </Link>

      <button
        type="button"
        onClick={onSearch}
        className="mx-3 mb-4 flex items-center gap-2 rounded-lg bg-white/[0.06] px-3 py-2 text-[13px] text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker"
      >
        <Search className="h-3.5 w-3.5" aria-hidden="true" />
        Jump to…
        <kbd className="ml-auto rounded bg-white/10 px-1.5 py-0.5 font-sans text-[10px]">⌘K</kbd>
      </button>

      <nav className="flex-1 overflow-y-auto px-3">
        {NAV_SECTIONS.map((section, i) => (
          <ul
            key={section.title}
            role="list"
            aria-label={section.title}
            className={cn("space-y-0.5", i > 0 && "mt-3 border-t border-white/10 pt-3")}
          >
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker",
                      active ? "text-white" : "text-white/55 hover:text-white"
                    )}
                  >
                    {active && (
                      // One shared highlight that glides to whichever page is open.
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-lg bg-white/[0.09]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      >
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-marker" />
                      </motion.span>
                    )}
                    <item.icon className={cn("relative h-4 w-4 shrink-0", active && "text-marker")} aria-hidden="true" />
                    <span className="relative truncate">{item.label}</span>
                    {item.href === "/agent" && status === "blocked" && (
                      <span className="relative ml-auto h-2 w-2 rounded-full bg-marker" aria-label="Approval needed" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </nav>

      <div className="m-3 rounded-xl bg-white/[0.06] p-3.5" role="status">
        <p className="flex items-center gap-2 text-[12.5px] text-white/80">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)} aria-hidden="true" />
          {s.label}
        </p>
        <Link
          href="/demo"
          className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-marker hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker"
        >
          <Play className="h-3 w-3" aria-hidden="true" />
          Watch a demo run
        </Link>
      </div>
    </aside>
  );
}

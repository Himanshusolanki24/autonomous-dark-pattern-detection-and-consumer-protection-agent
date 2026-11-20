"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import { Command, Menu, Plus, Shield } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NAV_SECTIONS } from "@/lib/navigation";
import { useAgentStore } from "@/stores/agent-store";
import { cn } from "@/lib/utils";

// Lazy load heavy modals - only loaded when triggered
const CommandPalette = lazy(() =>
  import("@/components/layout/CommandPalette").then((mod) => ({ default: mod.CommandPalette }))
);
const ApprovalModal = lazy(() =>
  import("@/components/agent/ApprovalModal").then((mod) => ({ default: mod.ApprovalModal }))
);

const STATUS_CHIP = {
  idle: { label: "Idle", dot: "bg-zinc-400" },
  running: { label: "Agent working", dot: "bg-emerald-500 animate-dot-pulse" },
  blocked: { label: "Approval needed", dot: "bg-amber-500 animate-dot-pulse" },
  completed: { label: "Case closed", dot: "bg-emerald-500" },
  failed: { label: "Stopped", dot: "bg-red-500" },
} as const;

function usePageTitle(pathname: string) {
  const match = NAV_SECTIONS.flatMap((s) => s.items).find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`)
  );
  if (match) return match.label;
  if (pathname.startsWith("/demo")) return "Demo run";
  return "TrapKiller";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();
  const status = useAgentStore((s) => s.status);
  const chip = STATUS_CHIP[status] ?? STATUS_CHIP.idle;
  const title = usePageTitle(pathname);

  // ⌘K / Ctrl+K opens the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={200}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar onSearch={() => setPaletteOpen(true)} />
          <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

          <div className="relative flex min-w-0 flex-1 flex-col">
            {/* Ambient wash behind the content, never interactive. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand-soft/50 via-transparent to-transparent"
            />

            <header className="glass relative z-20 flex h-[58px] shrink-0 items-center gap-3 border-b border-border/80 px-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="-ml-1 rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 items-center gap-2.5">
                <Shield className="hidden h-4 w-4 text-brand sm:block" aria-hidden="true" />
                <span className="hidden text-[13px] text-zinc-400 sm:inline">/</span>
                <span className="truncate font-display text-[15px] font-semibold">{title}</span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-[11.5px] font-medium text-zinc-600 sm:flex">
                  <span className={cn("h-1.5 w-1.5 rounded-full", chip.dot)} aria-hidden="true" />
                  {chip.label}
                </span>

                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="flex h-8 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[12px] text-zinc-500 transition-colors hover:border-border-strong hover:text-foreground"
                  aria-label="Open command palette"
                >
                  <Command className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] text-zinc-500 sm:inline">
                    ⌘K
                  </kbd>
                </button>

                <Link
                  href="/scanner"
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-3 text-[12px] font-semibold text-white transition-transform active:scale-[0.97]"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">New scan</span>
                </Link>
              </div>
            </header>

            <main id="main-content" tabIndex={-1} className="relative z-10 flex-1 overflow-y-auto focus:outline-none">
              {/* Keyed by route: each page settles in. Enter-only, so navigation never waits on an exit. */}
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.8 }}
                className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-7 lg:px-10 lg:py-10"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>

        <Suspense fallback={null}>
          <ApprovalModal />
        </Suspense>
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </Suspense>
      </TooltipProvider>
    </MotionConfig>
  );
}

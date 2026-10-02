"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import { Menu, Shield } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ApprovalModal } from "@/components/agent/ApprovalModal";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const pathname = usePathname();

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
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar onSearch={() => setPaletteOpen(true)} />
          <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-foreground px-4 text-white md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="-ml-1 rounded-lg p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Shield className="h-4 w-4 text-marker" aria-hidden="true" />
              <span className="font-display text-[17px] font-bold">TrapKiller</span>
            </header>

            <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto focus:outline-none">
              {/* Keyed by route: each page settles in. Enter-only, so navigation never waits on an exit. */}
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.8 }}
                className="mx-auto w-full max-w-[1240px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>

        <ApprovalModal />
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </TooltipProvider>
    </MotionConfig>
  );
}

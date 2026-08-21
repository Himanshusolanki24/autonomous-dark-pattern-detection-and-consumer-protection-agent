"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ApprovalModal } from "@/components/agent/ApprovalModal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K command palette
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
    <TooltipProvider delayDuration={200}>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="skip-link focus:block"
      >
        Skip to main content
      </a>

      <div className="flex h-screen overflow-hidden bg-zinc-50">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />

        {/* Mobile nav drawer */}
        <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Main workspace */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar onMenu={() => setMobileOpen(true)} />
          <main
            id="main-content"
            tabIndex={-1}
            className={cn(
              "flex-1 overflow-y-auto focus:outline-none",
              collapsed && "max-w-none"
            )}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Global overlays — always rendered outside the scroll container */}
      <ApprovalModal />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </TooltipProvider>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronsLeft, ChevronsRight, Play } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/navigation";
import { useAgentStore } from "@/stores/agent-store";
import { AgentStatus } from "@/components/agent/AgentStatus";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const status = useAgentStore((s) => s.status);

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-60"
      )}
      aria-label="Primary navigation"
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft">
          <ShieldCheck className="h-4.5 w-4.5 text-brand" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">TrapKiller</p>
            <p className="truncate text-[10px] leading-tight text-muted-foreground">
              AI agent control center
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-brand-soft text-brand"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      )}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand"
                        />
                      )}
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-brand"
                            : "text-zinc-400 group-hover:text-zinc-600"
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <Link
          href="/demo"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50",
            collapsed && "justify-center"
          )}
        >
          <Play className="h-4 w-4" />
          {!collapsed && <span>Live Demo</span>}
        </Link>
      </div>

      <div className="space-y-3 border-t border-border p-3">
        {!collapsed && (
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Agent status
          </p>
        )}
        <AgentStatus status={status} className={cn(collapsed && "hidden")} />
        {collapsed && (
          <span className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-dot-pulse" />
          </span>
        )}

        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-1.5 py-1.5",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">Aarav Kapoor</p>
              <p className="truncate text-[10px] text-muted-foreground">
                aarav@trapkiller.app
              </p>
            </div>
          )}
        </div>

        <button
            onClick={onToggle}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-zinc-50 hover:text-zinc-800",
              collapsed && "justify-center"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="h-3.5 w-3.5" />
            ) : (
              <>
                <ChevronsLeft className="h-3.5 w-3.5" />
                <span>Collapse</span>
              </>
            )}
          </button>
      </div>
    </aside>
  );
}
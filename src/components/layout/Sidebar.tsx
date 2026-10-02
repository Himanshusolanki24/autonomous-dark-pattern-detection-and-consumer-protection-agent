"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ChevronsLeft,
  ChevronsRight,
  Play,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { NAV_SECTIONS } from "@/lib/navigation";
import { useAgentStore } from "@/stores/agent-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  idle: "bg-zinc-300",
  running: "bg-emerald-500",
  blocked: "bg-amber-500",
  completed: "bg-emerald-500",
  failed: "bg-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  idle: "Agent idle",
  running: "Agent running",
  blocked: "Approval required",
  completed: "Session complete",
  failed: "Session failed",
};

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const status = useAgentStore((s) => s.status);
  const isRunning = status === "running";
  const isBlocked = status === "blocked";

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out md:flex",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
      aria-label="Primary navigation"
    >
      {/* ── Brand header ─────────────────────────── */}
      <div className={cn(
        "flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-3",
        collapsed && "justify-center px-0"
      )}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground shadow-sm">
          <Shield className="h-4 w-4 text-white" strokeWidth={2} aria-hidden="true" />
        </span>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="min-w-0 overflow-hidden"
            >
              <p className="truncate text-[13px] font-semibold leading-tight tracking-tight">TrapKiller</p>
              <p className="truncate text-[10px] leading-tight text-zinc-400">AI control center</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ───────────────────────────── */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5" role="list">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                const navItem = (
                  <Link
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      collapsed && "justify-center",
                      active
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-zinc-700" : "text-zinc-400 group-hover:text-zinc-600"
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {/* Approval badge on tasks */}
                    {!collapsed && item.href === "/tasks" && isBlocked && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                        !
                      </span>
                    )}
                  </Link>
                );

                return (
                  <li key={item.href} role="listitem">
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      navItem
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Demo link ────────────────────────────── */}
      <div className={cn("border-t border-border px-2 py-2")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/demo"
                className="flex h-9 w-full items-center justify-center rounded-lg text-amber-600 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Live Demo</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/demo"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] font-semibold text-amber-700 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Play className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Live Demo</span>
            <ChevronRight className="ml-auto h-3 w-3 text-amber-400" aria-hidden="true" />
          </Link>
        )}
      </div>

      {/* ── Agent status + profile ────────────────── */}
      <div className="space-y-1 border-t border-border p-2">
        {/* Agent status pill */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center py-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    STATUS_COLOR[status] ?? "bg-zinc-300",
                    (isRunning || isBlocked) && "animate-dot-pulse"
                  )}
                  aria-hidden="true"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">{STATUS_LABEL[status] ?? "Unknown"}</TooltipContent>
          </Tooltip>
        ) : (
          <div className={cn(
            "flex items-center gap-2 rounded-lg border px-2.5 py-2",
            status === "blocked"
              ? "border-amber-200 bg-amber-50"
              : status === "running"
                ? "border-emerald-200 bg-emerald-50"
                : "border-border bg-zinc-50"
          )}>
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                STATUS_COLOR[status] ?? "bg-zinc-300",
                (isRunning || isBlocked) && "animate-dot-pulse"
              )}
              aria-hidden="true"
            />
            <span className={cn(
              "text-[11px] font-medium",
              status === "blocked" ? "text-amber-700"
              : status === "running" ? "text-emerald-700"
              : "text-zinc-500"
            )}>
              {STATUS_LABEL[status] ?? "Unknown"}
            </span>
          </div>
        )}

        {/* User profile */}
        <div className={cn(
          "flex items-center gap-2.5 rounded-lg px-1.5 py-1.5",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-zinc-200 text-[11px] font-semibold text-zinc-600">
              TK
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-zinc-700">Demo User</p>
              <p className="truncate text-[10px] text-zinc-400">dev mode</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              className="ml-auto rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
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

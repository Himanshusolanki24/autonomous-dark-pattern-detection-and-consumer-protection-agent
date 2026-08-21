"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ShieldCheck,
  Menu,
  ShieldAlert,
  Command,
  Settings,
  LogOut,
} from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { pageTitle } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const AGENT_STATUS_DISPLAY: Record<
  string,
  { label: string; dotClass: string; pillClass: string }
> = {
  idle:      { label: "Agent Ready",     dotClass: "bg-zinc-300",                      pillClass: "border-zinc-200 bg-zinc-50 text-zinc-500" },
  running:   { label: "Agent Running",   dotClass: "bg-emerald-500 animate-dot-pulse", pillClass: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  blocked:   { label: "Approval Needed", dotClass: "bg-amber-500 animate-dot-pulse",   pillClass: "border-amber-200 bg-amber-50 text-amber-700" },
  completed: { label: "Session Done",    dotClass: "bg-emerald-500",                   pillClass: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  failed:    { label: "Session Failed",  dotClass: "bg-red-500",                       pillClass: "border-red-200 bg-red-50 text-red-700" },
};

export function Topbar({
  onMenu,
}: {
  onMenu?: () => void;
}) {
  const status = useAgentStore((s) => s.status);
  const approvalRequired = useAgentStore((s) => s.approvalRequired);
  const isBlocked = status === "blocked";
  const pathname = usePathname();
  const { title, description } = pageTitle(pathname);

  const agentDisplay =
    AGENT_STATUS_DISPLAY[status] ?? AGENT_STATUS_DISPLAY.idle;

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-sm"
      role="banner"
    >
      {/* Mobile hamburger */}
      {onMenu && (
        <button
          onClick={onMenu}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4.5 w-4.5" aria-hidden="true" />
        </button>
      )}

      {/* Page title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[13px] font-semibold leading-none text-zinc-900">
          {title}
        </h1>
        <p className="hidden truncate text-[11px] leading-none text-zinc-400 mt-0.5 sm:block">
          {description}
        </p>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">

        {/* Agent status pill — compact, always visible on sm+ */}
        <div
          className={cn(
            "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:inline-flex",
            agentDisplay.pillClass
          )}
          role="status"
          aria-label={`Agent status: ${agentDisplay.label}`}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full shrink-0", agentDisplay.dotClass)}
            aria-hidden="true"
          />
          {agentDisplay.label}
        </div>

        {/* Protection badge — large screens only */}
        <div className="hidden items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 lg:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
          Protected
        </div>

        {/* Approval required — prominent alert when blocked */}
        {isBlocked && (
          <Link
            href="/agent"
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Agent is paused — approval required. Click to review."
          >
            <ShieldAlert
              className="h-3.5 w-3.5 shrink-0 animate-dot-pulse"
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Approval Required</span>
          </Link>
        )}

        {/* ⌘K keyboard hint — large screens */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="hidden cursor-pointer items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-1 text-[10px] text-zinc-400 xl:flex"
              role="button"
              tabIndex={0}
              aria-label="Open command palette (⌘K)"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  document.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
                  );
                }
              }}
            >
              <Command className="h-3 w-3" aria-hidden="true" />K
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            Command palette (⌘K)
          </TooltipContent>
        </Tooltip>

        {/* Notification bell */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={
                approvalRequired
                  ? "1 notification — approval required"
                  : "No new notifications"
              }
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {approvalRequired && (
                <span
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500"
                  aria-hidden="true"
                />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            {approvalRequired ? "Approval required" : "No new notifications"}
          </TooltipContent>
        </Tooltip>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Open profile menu"
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-zinc-200 text-[10px] font-bold text-zinc-600">
                  TK
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 text-sm">
            <DropdownMenuLabel className="pb-1">
              <p className="text-[13px] font-semibold text-zinc-900">Demo User</p>
              <p className="text-[11px] font-normal text-zinc-400">dev mode</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/security" className="flex items-center gap-2 cursor-pointer">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                Security &amp; Privacy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-zinc-500 cursor-pointer"
              onClick={() => {
                // Dev mode: no-op (no real auth session to clear)
              }}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ShieldCheck, Menu } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { AgentStatus } from "@/components/agent/AgentStatus";
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

export function Topbar({
  title,
  description,
  onMenu,
}: {
  title?: string;
  description?: string;
  onMenu?: () => void;
}) {
  const status = useAgentStore((s) => s.status);
  const pathname = usePathname();
  const { title: t, description: d } = pageTitle(pathname);
  const label = title ?? t;
  const sub = description ?? d;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-sm">
      {onMenu && (
        <button
          onClick={onMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
      )}

      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold leading-tight sm:text-base">
          {label}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{sub}</p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <AgentStatus status={status} className="hidden sm:inline-flex" />

        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 lg:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          Protected
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>No new notifications</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-zinc-100"
              aria-label="Profile menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback>AK</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="text-xs font-semibold text-foreground">Aarav Kapoor</p>
              <p className="text-[11px] font-normal text-muted-foreground">
                aarav@trapkiller.app
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/security">Security &amp; Privacy</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, Shield, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/navigation";
import { useAgentStore } from "@/stores/agent-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const STATUS = {
  idle: { label: "Agent idle", dot: "bg-zinc-400" },
  running: { label: "Agent working", dot: "bg-emerald-500 animate-dot-pulse" },
  blocked: { label: "Approval needed", dot: "bg-amber-500 animate-dot-pulse" },
  completed: { label: "Case closed", dot: "bg-emerald-500" },
  failed: { label: "Run stopped", dot: "bg-red-500" },
} as const;

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const status = useAgentStore((s) => s.status);
  const s = STATUS[status] ?? STATUS.idle;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-surface md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex h-[58px] items-center justify-between border-b border-border px-4">
              <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                  <Shield className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span>
                  <span className="font-display block text-[15px] font-bold leading-none">TrapKiller</span>
                  <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
                    Evidence lab
                  </span>
                </span>
              </Link>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="eyebrow mb-2 px-3 text-[9.5px]">{section.title}</p>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] transition-colors",
                              active
                                ? "border border-blue-100 bg-brand-soft font-semibold text-blue-700"
                                : "text-zinc-600 hover:bg-zinc-100"
                            )}
                            aria-current={active ? "page" : undefined}
                          >
                            <item.icon className={cn("h-4 w-4", active ? "text-brand" : "text-zinc-400")} />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <Link
                href="/demo"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-xl border border-amber-200/70 bg-warning-soft px-3 py-2 text-[13.5px] font-semibold text-amber-800"
              >
                <Play className="h-4 w-4" />
                Watch a demo run
              </Link>
            </nav>

            <div className="space-y-3 border-t border-border p-4">
              <p className="flex items-center gap-2 text-[12px] font-medium text-zinc-600">
                <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden="true" />
                {s.label}
              </p>
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-brand-soft text-[10px] font-semibold text-blue-700">
                    TK
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">Demo workspace</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">demo@trapkiller.dev</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

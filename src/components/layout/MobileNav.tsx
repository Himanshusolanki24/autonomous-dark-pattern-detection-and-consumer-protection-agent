"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/navigation";
import { useAgentStore } from "@/stores/agent-store";
import { AgentStatus } from "@/components/agent/AgentStatus";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const status = useAgentStore((s) => s.status);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">TrapKiller</p>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    AI agent control center
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {section.title}
                  </p>
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
                              "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                              active
                                ? "bg-brand-soft text-brand"
                                : "text-zinc-600 hover:bg-zinc-100"
                            )}
                            aria-current={active ? "page" : undefined}
                          >
                            <item.icon className="h-4 w-4" />
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
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
              >
                <Play className="h-4 w-4" />
                Live Demo
              </Link>
            </nav>

            <div className="space-y-3 border-t border-border p-3">
              <AgentStatus status={status} />
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>AK</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">Aarav Kapoor</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    aarav@trapkiller.app
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
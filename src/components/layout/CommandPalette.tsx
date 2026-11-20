"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Bot, CornerDownLeft, Search } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PaletteItem {
  href: string;
  label: string;
  section: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ACTIONS: PaletteItem[] = [
  {
    href: "/demo",
    label: "Run the live demo",
    section: "Action",
    description: "Walk through a full cancellation",
    icon: Bot,
  },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const handleOpenChange = (v: boolean) => {
    setActive(0);
    if (!v) setQuery("");
    onOpenChange(v);
  };

  const items: PaletteItem[] = [
    ...NAV_SECTIONS.flatMap((s) =>
      s.items.map((i) => ({ ...i, section: s.title }))
    ),
    ...ACTIONS,
  ];

  const q = query.trim().toLowerCase();
  const filtered = items.filter(
    (i) =>
      i.label.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.section.toLowerCase().includes(q)
  );

  // Reset the highlight whenever the query changes so the first match is selected.
  const updateQuery = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  const select = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="top-[12%] max-w-[520px] overflow-hidden rounded-2xl p-0 shadow-lift" hideClose>
        <DialogTitle className="sr-only">Command palette</DialogTitle>

        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Jump to a page or action…"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-zinc-400 focus:outline-none"
            aria-label="Command palette search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={filtered[active] ? `palette-${filtered[active].href}` : undefined}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && filtered[active]) {
                e.preventDefault();
                select(filtered[active].href);
              }
            }}
          />
          <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] text-zinc-500">
            esc
          </kbd>
        </div>

        <div id="palette-results" className="max-h-[344px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches for “{query}”.
            </p>
          )}

          {filtered.map((item, i) => (
            <button
              key={item.href}
              id={`palette-${item.href}`}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => select(item.href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                i === active ? "bg-brand-soft" : "hover:bg-zinc-50"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                  i === active
                    ? "border-blue-100 bg-surface text-brand"
                    : "border-border bg-surface text-zinc-400"
                )}
              >
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-[13.5px]",
                    i === active ? "font-semibold text-blue-700" : "text-zinc-700"
                  )}
                >
                  {item.label}
                </span>
                {item.description && (
                  <span className="block truncate text-[11.5px] text-zinc-500">{item.description}</span>
                )}
              </span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400 sm:block">
                {item.section}
              </span>
              {i === active && <CornerDownLeft className="h-3 w-3 shrink-0 text-blue-400" aria-hidden="true" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-border bg-zinc-50/70 px-4 py-2 text-[10.5px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" aria-hidden="true" />
            <ArrowDown className="h-3 w-3" aria-hidden="true" />
            navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
            open
          </span>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">
            TrapKiller
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

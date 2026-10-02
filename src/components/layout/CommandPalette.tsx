"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, Bot, ScanSearch } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PaletteItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleOpenChange = (v: boolean) => {
    if (!v) setQuery("");
    onOpenChange(v);
  };

  const items: PaletteItem[] = [
    ...NAV_SECTIONS.flatMap((s) => s.items),
    { href: "/demo", label: "Run live demo journey", icon: Bot },
  ];

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const select = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="top-[15%] max-w-md p-0" hideClose>
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a page or action…"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-zinc-400"
            aria-label="Command palette search"
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) select(filtered[0].href);
            }}
          />
          <kbd className="rounded border border-border bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-400">
            esc
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for “{query}”.
            </p>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.href}
              onClick={() => select(item.href)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                i === 0 ? "bg-brand-soft text-brand" : "text-zinc-700 hover:bg-zinc-100"
              )}
            >
              {item.label === "Run live demo journey" ? (
                <Bot className="h-4 w-4 text-amber-600" />
              ) : item.label.includes("Scanner") ? (
                <ScanSearch className="h-4 w-4" />
              ) : (
                <item.icon className="h-4 w-4 text-zinc-400" />
              )}
              <span className="flex-1">{item.label}</span>
              <CornerDownLeft className="h-3 w-3 text-zinc-300" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
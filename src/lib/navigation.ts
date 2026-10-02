import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Bot,
  ScanSearch,
  ListChecks,
  History,
  ShieldCheck,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutGrid, description: "Command center" },
      { href: "/agent", label: "Agent", icon: Bot, description: "Live agent panel" },
      { href: "/scanner", label: "Dark Pattern Scanner", icon: ScanSearch, description: "Analyze a webpage" },
      { href: "/tasks", label: "Cancellation Tasks", icon: ListChecks, description: "Manage cancellations" },
      { href: "/activity", label: "Activity", icon: History, description: "Audit log" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/security", label: "Security & Privacy", icon: ShieldCheck, description: "Privacy by design" },
      { href: "/settings", label: "Settings", icon: Settings, description: "Preferences" },
    ],
  },
];

export function pageTitle(href: string): { title: string; description: string } {
  for (const section of NAV_SECTIONS) {
    const item = section.items.find((i) => i.href === href);
    if (item) return { title: item.label, description: item.description };
  }
  if (href === "/demo")
    return { title: "Live Demo", description: "Deterministic cancellation journey" };
  return { title: "Overview", description: "Command center" };
}
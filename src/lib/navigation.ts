import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Bot,
  ScanSearch,
  ListChecks,
  History,
  ShieldCheck,
  Settings,
  Network,
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
      { href: "/scanner", label: "Scan a page", icon: ScanSearch, description: "Analyze a webpage" },
      { href: "/tasks", label: "Cancellations", icon: ListChecks, description: "Manage cancellations" },
      { href: "/activity", label: "Activity", icon: History, description: "Audit log" },
      { href: "/graph", label: "Knowledge graph", icon: Network, description: "What the agents remember" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/security", label: "Privacy & safety", icon: ShieldCheck, description: "Privacy by design" },
      { href: "/settings", label: "Settings", icon: Settings, description: "Preferences" },
    ],
  },
];

import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "TrapKiller — AI agent control center",
  description:
    "Monitor your AI agent as it detects dark patterns and navigates subscription cancellation flows.",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
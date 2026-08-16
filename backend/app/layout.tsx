// =============================================================================
// app/layout.tsx
// Backend root layout. The user-facing UI lives in the frontend app; this app
// hosts the API, auth callback, demo target and a minimal status page.
// =============================================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TrapKiller API",
  description: "Dark Pattern Trap Killer — backend control plane.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0b0f14", color: "#e6edf3" }}>
        {children}
      </body>
    </html>
  );
}
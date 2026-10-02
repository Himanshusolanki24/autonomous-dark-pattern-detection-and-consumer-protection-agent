import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrapKiller — AI Consumer Protection Agent",
  description:
    "TrapKiller is an AI browser agent that detects potential deceptive patterns on websites, explains the evidence, and helps you navigate manipulative web experiences while keeping you in control.",
  keywords: [
    "dark patterns",
    "AI agent",
    "consumer protection",
    "subscription cancellation",
    "confirmshaming",
    "roach motel",
    "forced continuity",
    "web safety",
    "TrapKiller",
  ],
  openGraph: {
    title: "TrapKiller — AI Consumer Protection Agent",
    description:
      "Detect potential deceptive patterns. See the evidence. Navigate the web with more control.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "TrapKiller — AI Consumer Protection Agent",
    description:
      "An AI agent that detects potential deceptive patterns and keeps you in control of every consequential action.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000")
  ),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {/* Accessibility skip link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}

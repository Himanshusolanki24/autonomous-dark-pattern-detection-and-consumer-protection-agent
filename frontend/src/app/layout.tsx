import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dark Pattern Trap Killer — AI That Fights Back",
  description:
    "An AI agent that detects dark patterns, navigates subscription cancellation mazes, and keeps users in control of every irreversible action.",
  keywords: [
    "dark patterns",
    "AI agent",
    "subscription cancellation",
    "consumer protection",
    "confirmshaming",
    "roach motel",
  ],
  openGraph: {
    title: "Dark Pattern Trap Killer — AI That Fights Back",
    description:
      "Detect dark patterns, navigate painful cancellation flows, and keep control of every irreversible action.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Dark Pattern Trap Killer — AI That Fights Back",
    description:
      "An AI agent that detects dark patterns and navigates subscription cancellation mazes — keeping you in control.",
  },
  metadataBase: new URL("https://trapkiller.local"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
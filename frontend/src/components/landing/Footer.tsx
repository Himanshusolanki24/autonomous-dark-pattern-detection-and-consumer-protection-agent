import Link from "next/link";
import { ShieldCheck, ExternalLink } from "lucide-react";

const LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#safety" },
  { label: "Live Demo", href: "/demo" },
  { label: "GitHub", href: "https://github.com", external: true },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft">
                <ShieldCheck className="h-4.5 w-4.5 text-brand" />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                Dark Pattern Trap Killer
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">AI that works for the user.</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Built for Ascendant Agents 2026 · D&apos;Code NSUT</p>
          <p>
            The web is designed to trap you.{" "}
            <span className="font-medium text-zinc-700">
              Your AI agent fights back.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
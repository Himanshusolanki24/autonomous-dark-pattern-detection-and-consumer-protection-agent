import Link from "next/link";
import { Shield, ExternalLink } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Detection", href: "#detection" },
      { label: "Human Control", href: "#human-control" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    heading: "Use",
    links: [
      { label: "Live Demo", href: "/demo" },
      { label: "Agent", href: "/agent" },
      { label: "Scanner", href: "/scanner" },
    ],
  },
  {
    heading: "Info",
    links: [
      { label: "GitHub", href: "https://github.com", external: true },
      { label: "Privacy", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[auto_1fr]">

          {/* Brand block */}
          <div className="lg:max-w-[200px]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                <Shield className="h-4 w-4 text-white" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                TrapKiller
              </span>
            </div>
            <p className="mt-3 text-[12px] leading-5 text-zinc-500">
              An AI agent that helps protect users from deceptive web interfaces.
            </p>
            <p className="mt-2 text-[11px] text-zinc-400">
              Built for Ascendant Agents 2026
            </p>
          </div>

          {/* Links grid */}
          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_LINKS.map((group) => (
              <div key={group.heading}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  {group.heading}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-[13px] text-zinc-500 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-[12px] text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 TrapKiller · D&apos;Code NSUT Hackathon</p>
          <p>
            Don&apos;t let the interface decide for you.{" "}
            <span className="font-medium text-zinc-600">Stay in control.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

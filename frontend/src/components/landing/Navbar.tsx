"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Shield, ArrowRight } from "lucide-react";
import { LANDING_NAV } from "./constants";
import { cn } from "@/lib/utils";

function TrapKillerLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
      aria-label="TrapKiller — home"
    >
      {/* Logo mark: a shield with a subtle cut */}
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-white shadow-sm transition-transform group-hover:scale-[1.04]">
        <Shield className="h-4 w-4 fill-white/10 stroke-white" strokeWidth={2} />
        {/* kill mark */}
        <span className="absolute top-[10px] left-[14px] h-[10px] w-[1.5px] rotate-[-35deg] rounded-full bg-white/80" />
        <span className="absolute top-[10px] left-[14px] h-[10px] w-[1.5px] rotate-[35deg] rounded-full bg-white/80" />
      </span>
      <span className="text-sm font-semibold tracking-tight text-foreground">TrapKiller</span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-border/60 bg-background/90 shadow-[0_1px_16px_rgba(0,0,0,0.05)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
      role="banner"
    >
      <nav
        className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        <TrapKillerLogo />

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 md:flex" role="list">
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              role="listitem"
              className="rounded-md px-3 py-2 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA group */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/demo"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Sign In
          </Link>
          <Link
            href="/demo"
            className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-[13px] font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="space-y-0.5 px-4 py-3">
              {LANDING_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-border">
                <Link
                  href="/demo"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/demo"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-white"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

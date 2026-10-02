"use client";

import { SECURITY_ITEMS } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SecuritySection() {
  return (
    <section
      id="security"
      className="border-y border-border bg-zinc-50/50 scroll-mt-20"
      aria-labelledby="security-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <SectionHeading
          eyebrow="Security"
          title={
            <span id="security-heading">
              Automation with{" "}
              <span className="text-brand">guardrails.</span>
            </span>
          }
          sub={
            <>
              TrapKiller is designed for the real web. These are the actual
              security mechanisms in the system — no invented certifications,
              no marketing claims.
            </>
          }
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: i * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm",
                    item.tone
                  )}
                  aria-hidden="true"
                >
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-5 text-zinc-500">
                    {item.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Honest footer note */}
        <Reveal delay={0.15}>
          <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-zinc-200 bg-white px-5 py-4">
            <p className="text-[12px] leading-6 text-zinc-500 text-center">
              <strong className="font-semibold text-zinc-700">Honest note:</strong>{" "}
              TrapKiller is a hackathon project. It has security design and measures
              described above. It has not been audited, certified, or deployed to
              production. Use with appropriate judgment.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

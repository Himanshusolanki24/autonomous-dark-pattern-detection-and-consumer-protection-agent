"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Network, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { forceLayout } from "@/lib/graph-layout";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/case";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types & look ──────────────────────────────────────────────────────────────

type Props = Record<string, unknown>;
interface GNode { id: string; label: string; props: Props }
interface GLink { source: string; target: string; type: string; props: Props }
interface Snapshot { status: "ok" | "off" | "down"; nodes: GNode[]; links: GLink[] }

const W = 1000;
const H = 640;

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

/** One entry per node label in the graph: colour, legend name, and how to title a node. */
const KINDS: Record<string, { color: string; ring: string; plural: string; name: (p: Props) => string }> = {
  Site: { color: "#151a2d", ring: "#151a2d", plural: "Sites", name: (p) => str(p.host) },
  Pattern: { color: "#2f3f95", ring: "#2f3f95", plural: "Dark patterns", name: (p) => str(p.label ?? p.type) },
  Indicator: { color: "#ffe15a", ring: "#b89400", plural: "Evidence phrases", name: (p) => `“${str(p.phrase)}”` },
  Run: { color: "#1f8a5b", ring: "#1f8a5b", plural: "Agent runs", name: (p) => `Run · ${str(p.status)}` },
  Action: { color: "#d9831f", ring: "#d9831f", plural: "Clicks", name: (p) => `Click “${str(p.label)}”` },
};
const OTHER = { color: "#9aa0a6", ring: "#6f7581", plural: "Other", name: (p: Props) => str(Object.values(p)[0]) };
const kind = (label: string) => KINDS[label] ?? OTHER;

const REL_TEXT: Record<string, string> = {
  EXHIBITS: "exhibits",
  SHOWS: "shows",
  INDICATES: "indicates",
  ON: "ran on",
  TOOK: "took step",
  POLICY: "learned click",
};

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// ── Label placement ───────────────────────────────────────────────────────────

interface Box { x: number; y: number; w: number; h: number }
interface Label { key: string; text: string; x: number; y: number; anchor: "middle" | "start" | "end"; cls: string }

const hit = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
/** Rough width of 11px label text — close enough to keep labels off each other. */
const textWidth = (text: string, px = 6.1) => text.length * px + 6;

/** Where a label may sit around a node, in order of preference: below, above, right, left. */
function spots(x: number, y: number, r: number, w: number): { box: Box; x: number; y: number; anchor: Label["anchor"] }[] {
  return [
    { box: { x: x - w / 2, y: y + r + 3, w, h: 14 }, x, y: y + r + 13, anchor: "middle" },
    { box: { x: x - w / 2, y: y - r - 17, w, h: 14 }, x, y: y - r - 6, anchor: "middle" },
    { box: { x: x + r + 4, y: y - 7, w, h: 14 }, x: x + r + 6, y: y + 4, anchor: "start" },
    { box: { x: x - r - 4 - w, y: y - 7, w, h: 14 }, x: x - r - 6, y: y + 4, anchor: "end" },
  ];
}

// ── Details panel ─────────────────────────────────────────────────────────────

function Details({
  node,
  links,
  byId,
  onSelect,
}: {
  node: GNode;
  links: GLink[];
  byId: Map<string, GNode>;
  onSelect: (id: string) => void;
}) {
  const k = kind(node.label);
  const connections = links
    .filter((l) => l.source === node.id || l.target === node.id)
    .map((l) => ({ link: l, out: l.source === node.id, other: byId.get(l.source === node.id ? l.target : l.source) }))
    .filter((c): c is typeof c & { other: GNode } => Boolean(c.other));

  return (
    <div className="space-y-4">
      <div>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: k.color, boxShadow: `0 0 0 1px ${k.ring}` }} />
          {node.label}
        </span>
        <h3 className="mt-1 break-words text-[18px] font-bold leading-snug text-foreground">{k.name(node.props)}</h3>
      </div>

      <dl className="space-y-2">
        {Object.entries(node.props).map(([key, value]) => (
          <div key={key}>
            <dt className="text-[11px] font-medium text-zinc-400">{key}</dt>
            <dd className="break-words text-[13px] leading-5 text-zinc-700">{str(value)}</dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="mb-2 text-[12px] font-medium text-zinc-400">
          {connections.length} connection{connections.length === 1 ? "" : "s"}
        </p>
        <ul className="space-y-1.5">
          {connections.map(({ link, out, other }, i) => (
            <li key={i}>
              <button
                onClick={() => onSelect(other.id)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span className="font-mono text-[10px] text-zinc-400">
                  {out ? "→" : "←"} {REL_TEXT[link.type] ?? link.type.toLowerCase()}
                </span>
                <span className="block break-words text-[13px] font-medium leading-5 text-zinc-800">
                  {clip(kind(other.label).name(other.props), 80)}
                </span>
                {Object.entries(link.props)
                  .filter(([key]) => key !== "lastSeen")
                  .map(([key, value]) => (
                    <span key={key} className="block break-words text-[11px] leading-4 text-zinc-500">
                      {key}: {clip(str(value), 90)}
                    </span>
                  ))}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GraphPage() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<Snapshot>("/api/graph")
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const { nodes, links, pos, byId, degree, counts } = useMemo(() => {
    const all = data?.nodes ?? [];
    const counts = new Map<string, number>();
    for (const n of all) counts.set(n.label, (counts.get(n.label) ?? 0) + 1);
    const nodes = all.filter((n) => !hidden.has(n.label));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const links = (data?.links ?? []).filter((l) => byId.has(l.source) && byId.has(l.target));
    const degree = new Map<string, number>();
    for (const l of links) {
      degree.set(l.source, (degree.get(l.source) ?? 0) + 1);
      degree.set(l.target, (degree.get(l.target) ?? 0) + 1);
    }
    return { nodes, links, byId, degree, counts, pos: forceLayout(nodes.map((n) => n.id), links, W, H) };
  }, [data, hidden]);

  const active = hovered ?? selected;
  const near = useMemo(() => {
    const s = new Set<string>();
    if (!active) return s;
    s.add(active);
    for (const l of links) {
      if (l.source === active) s.add(l.target);
      if (l.target === active) s.add(l.source);
    }
    return s;
  }, [active, links]);

  const selectedNode = selected ? byId.get(selected) : undefined;
  const radius = useCallback((id: string) => 7 + Math.min(11, Math.sqrt(degree.get(id) ?? 0) * 3), [degree]);

  // Place labels one at a time, most important first, and never on top of a
  // node or another label. A label with no free spot is left out — its text is
  // still in the side panel and the node's tooltip.
  const labels = useMemo(() => {
    const out: Label[] = [];
    const taken: Box[] = nodes
      .filter((n) => !active || near.has(n.id))
      .map((n) => {
        const p = pos.get(n.id)!;
        const r = radius(n.id) + 2;
        return { x: p.x - r, y: p.y - r, w: r * 2, h: r * 2 };
      });
    const labelBoxes: Box[] = [];
    const inside = (b: Box) => b.x >= 2 && b.y >= 2 && b.x + b.w <= W - 2 && b.y + b.h <= H - 2;
    const rank = (n: GNode) => (n.id === active ? 0 : n.label === "Site" ? 1 : n.label === "Pattern" ? 2 : 3);

    const wanted = nodes
      .filter((n) => (active ? near.has(n.id) : n.label === "Site" || n.label === "Pattern"))
      .sort((a, b) => rank(a) - rank(b));
    for (const n of wanted) {
      const p = pos.get(n.id)!;
      const text = clip(kind(n.label).name(n.props), 28);
      const options = spots(p.x, p.y, radius(n.id), textWidth(text)).filter((s) => inside(s.box));
      const spot =
        options.find((s) => !taken.some((t) => hit(s.box, t))) ??
        // The hovered node and sites always get a name, even in a crowd: let
        // it cross a node (the white outline keeps it readable), never a label.
        (rank(n) <= 1 ? options.find((s) => !labelBoxes.some((t) => hit(s.box, t))) : undefined);
      if (!spot) continue;
      labelBoxes.push(spot.box);
      taken.push(spot.box);
      out.push({
        key: n.id,
        text,
        x: spot.x,
        y: spot.y,
        anchor: spot.anchor,
        cls: n.label === "Indicator" ? "fill-zinc-600 text-[11px]" : "fill-zinc-800 text-[11px] font-medium",
      });
    }

    // Relationship names on the highlighted links, only where there is room.
    links.forEach((l, i) => {
      if (!active || (l.source !== active && l.target !== active)) return;
      const a = pos.get(l.source)!;
      const b = pos.get(l.target)!;
      const text = REL_TEXT[l.type] ?? l.type.toLowerCase();
      const w = textWidth(text, 6.4);
      const box = { x: (a.x + b.x) / 2 - w / 2, y: (a.y + b.y) / 2 - 8, w, h: 14 };
      if (!inside(box) || taken.some((t) => hit(box, t))) return;
      taken.push(box);
      out.push({ key: `l${i}`, text, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 3, anchor: "middle", cls: "fill-brand font-mono text-[10px]" });
    });
    return out;
  }, [nodes, links, pos, active, near, radius]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge graph"
        lede="Everything the agents have verified and remembered: the sites they visited, the dark patterns found there, the exact words that proved it, and the clicks that worked."
      >
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </PageHeader>

      {error ? (
        <Empty title="Couldn't load the graph" body={error} />
      ) : data === null ? (
        <Skeleton className="h-[520px] w-full rounded-2xl" />
      ) : data.status === "off" ? (
        <Empty
          title="The knowledge graph is switched off"
          body="Set NEO4J_URI, NEO4J_USERNAME and NEO4J_PASSWORD in .env.local, run npm run graph:seed, then restart the server."
        />
      ) : data.status === "down" ? (
        <Empty
          title="Can't reach Neo4j"
          body="The database didn't answer. A free Aura instance pauses when unused — resume it at console.neo4j.io, then refresh."
        />
      ) : data.nodes.length === 0 ? (
        <Empty title="The graph is empty" body="Run npm run graph:seed, then scan a page or start an agent run." />
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {/* Legend doubles as a filter */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/70 px-4 py-2.5">
              {[...counts.entries()].map(([label, count]) => {
                const k = kind(label);
                const on = !hidden.has(label);
                return (
                  <button
                    key={label}
                    aria-pressed={on}
                    onClick={() => {
                      setSelected(null);
                      setHidden((prev) => {
                        const next = new Set(prev);
                        if (next.has(label)) next.delete(label);
                        else next.add(label);
                        return next;
                      });
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      on ? "border-zinc-200 bg-white text-zinc-700" : "border-transparent bg-transparent text-zinc-400 line-through"
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: on ? k.color : "transparent", boxShadow: `0 0 0 1px ${k.ring}` }}
                    />
                    {k.plural}
                    <span className="tabular-nums text-zinc-400">{count}</span>
                  </button>
                );
              })}
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="block h-auto w-full"
              role="group"
              aria-label={`Knowledge graph with ${nodes.length} nodes and ${links.length} relationships`}
              onClick={() => setSelected(null)}
            >
              {links.map((l, i) => {
                const a = pos.get(l.source)!;
                const b = pos.get(l.target)!;
                const lit = active !== null && (l.source === active || l.target === active);
                return (
                  <g key={i} opacity={active && !lit ? 0.12 : 1}>
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={lit ? "#2f3f95" : "#c9cdc7"}
                      strokeWidth={lit ? 1.8 : 1}
                    />
                  </g>
                );
              })}

              {nodes.map((n) => {
                const p = pos.get(n.id)!;
                const k = kind(n.label);
                const r = radius(n.id);
                const dim = active !== null && !near.has(n.id);
                const title = k.name(n.props);
                return (
                  <g
                    key={n.id}
                    transform={`translate(${p.x} ${p.y})`}
                    opacity={dim ? 0.18 : 1}
                    className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-[3px]"
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.label}: ${title}`}
                    aria-pressed={selected === n.id}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(n.id)}
                    onBlur={() => setHovered(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(n.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(n.id);
                      }
                    }}
                  >
                    {selected === n.id && <circle r={r + 5} fill="none" stroke="#2f3f95" strokeWidth={2} />}
                    <title>{title}</title>
                    <circle r={r} fill={k.color} stroke={k.ring} strokeWidth={1.5} />
                  </g>
                );
              })}

              {/* Labels sit on top of everything and never catch the pointer. */}
              <g className="pointer-events-none" aria-hidden="true">
                {labels.map((l) => (
                  <text
                    key={l.key}
                    x={l.x}
                    y={l.y}
                    textAnchor={l.anchor}
                    className={l.cls}
                    style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}
                  >
                    {l.text}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-4 lg:max-h-[690px] lg:overflow-y-auto" aria-live="polite">
            {selectedNode ? (
              <Details node={selectedNode} links={links} byId={byId} onSelect={setSelected} />
            ) : (
              <div className="space-y-3 text-[13px] leading-5 text-zinc-600">
                <p className="text-[15px] font-semibold text-foreground">
                  {nodes.length} nodes · {links.length} relationships
                </p>
                <p>Select a node to see its details and what it is connected to. Hover to trace its links.</p>
                <p>
                  A <b className="font-semibold text-zinc-800">site</b> exhibits <b className="font-semibold text-zinc-800">dark patterns</b>.
                  Each finding is backed by an <b className="font-semibold text-zinc-800">evidence phrase</b> quoted from the page.
                  An <b className="font-semibold text-zinc-800">agent run</b> records the <b className="font-semibold text-zinc-800">clicks</b> it
                  made, so later runs can reuse the ones that led to a verified result.
                </p>
                <p className="text-[12px] text-zinc-400">Use the legend to hide a type of node.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm" aria-hidden="true">
        <Network className="h-5 w-5 text-zinc-300" />
      </span>
      <div>
        <p className="text-sm font-semibold text-zinc-700">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-[12px] leading-5 text-zinc-400">{body}</p>
      </div>
    </div>
  );
}

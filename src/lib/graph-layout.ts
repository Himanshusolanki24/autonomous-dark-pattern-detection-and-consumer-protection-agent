// Force-directed layout (Fruchterman–Reingold), computed once — no animation
// loop. ponytail: O(n²) per iteration, fine to a few hundred nodes; swap for
// d3-force with a quadtree if the graph outgrows that.

export interface Point {
  x: number;
  y: number;
}

export function forceLayout(
  ids: string[],
  links: { source: string; target: string }[],
  width: number,
  height: number,
  iterations = 300,
  /** Drawn radius of a node, so the layout can keep circles from overlapping. */
  radius: (id: string) => number = () => 9
): Map<string, Point> {
  const n = ids.length;
  const pos = new Map<string, Point>();
  if (n === 0) return pos;
  const cx = width / 2;
  const cy = height / 2;
  // Room for the label under a node at the edge of the canvas.
  const pad = 70;
  const k = Math.sqrt((width * height) / n) * 0.6;

  // Deterministic start: a golden-angle spiral, so the same graph always
  // lays out the same way.
  ids.forEach((id, i) => {
    const r = (Math.min(width, height) / 2 - pad) * Math.sqrt((i + 0.5) / n);
    const a = i * 2.399963;
    pos.set(id, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  });
  const edges = links.filter((l) => pos.has(l.source) && pos.has(l.target) && l.source !== l.target);
  const linked = new Set(edges.flatMap((e) => [e.source, e.target]));

  for (let it = 0; it < iterations; it++) {
    const temp = (width / 10) * (1 - it / iterations);
    const disp = new Map<string, Point>(ids.map((id) => [id, { x: 0, y: 0 }]));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pos.get(ids[i])!;
        const b = pos.get(ids[j])!;
        const dx = a.x - b.x || 0.01;
        const dy = a.y - b.y || 0.01;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const f = (k * k) / dist / dist;
        const da = disp.get(ids[i])!;
        const db = disp.get(ids[j])!;
        da.x += dx * f;
        da.y += dy * f;
        db.x -= dx * f;
        db.y -= dy * f;
      }
    }
    for (const e of edges) {
      const a = pos.get(e.source)!;
      const b = pos.get(e.target)!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const f = Math.hypot(dx, dy) / k;
      const da = disp.get(e.source)!;
      const db = disp.get(e.target)!;
      da.x -= dx * f;
      da.y -= dy * f;
      db.x += dx * f;
      db.y += dy * f;
    }
    for (const id of ids) {
      const p = pos.get(id)!;
      const d = disp.get(id)!;
      // Gravity holds the graph together. Unlinked nodes have no edge pulling
      // them in, so they get more of it or they pile up against the borders.
      const g = linked.has(id) ? 0.9 : 1.5;
      d.x += (cx - p.x) * g;
      d.y += (cy - p.y) * g;
      const len = Math.max(0.01, Math.hypot(d.x, d.y));
      const step = Math.min(len, temp);
      p.x += (d.x / len) * step;
      p.y += (d.y / len) * step;
    }
  }

  // Fit the result to the canvas. Scaling at the end (rather than clamping
  // every step) keeps clusters from being flattened against the borders.
  const xs = ids.map((id) => pos.get(id)!.x);
  const ys = ids.map((id) => pos.get(id)!.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  for (const p of pos.values()) {
    p.x = maxX > minX ? pad + ((p.x - minX) / (maxX - minX)) * (width - 2 * pad) : cx;
    p.y = maxY > minY ? pad + ((p.y - minY) / (maxY - minY)) * (height - 2 * pad) : cy;
  }

  // Forces alone let a busy hub's neighbours pile on top of it. Push apart any
  // two circles that still touch, a little each round, until none do.
  const gap = 6;
  for (let round = 0; round < 80; round++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pos.get(ids[i])!;
        const b = pos.get(ids[j])!;
        const dx = a.x - b.x || 0.01 * (i - j);
        const dy = a.y - b.y || 0.01;
        const dist = Math.hypot(dx, dy);
        const min = radius(ids[i]) + radius(ids[j]) + gap;
        if (dist >= min) continue;
        const push = (min - dist) / 2 / dist;
        a.x += dx * push;
        a.y += dy * push;
        b.x -= dx * push;
        b.y -= dy * push;
        moved = true;
      }
    }
    for (const p of pos.values()) {
      p.x = Math.min(width - pad, Math.max(pad, p.x));
      p.y = Math.min(height - pad, Math.max(pad, p.y));
    }
    if (!moved) break;
  }
  return pos;
}

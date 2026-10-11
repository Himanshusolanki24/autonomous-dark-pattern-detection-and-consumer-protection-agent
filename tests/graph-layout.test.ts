import { describe, it, expect } from "vitest";
import { forceLayout } from "@/lib/graph-layout";

describe("forceLayout", () => {
  const ids = ["a", "b", "c", "d", "e", "lonely"];
  const links = [
    { source: "a", target: "b" },
    { source: "a", target: "c" },
    { source: "d", target: "e" },
    { source: "a", target: "missing" },
  ];
  const pos = forceLayout(ids, links, 1000, 640);

  it("places every node inside the canvas", () => {
    expect(pos.size).toBe(ids.length);
    for (const p of pos.values()) {
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
      expect(p.x).toBeGreaterThanOrEqual(70);
      expect(p.x).toBeLessThanOrEqual(930);
      expect(p.y).toBeGreaterThanOrEqual(70);
      expect(p.y).toBeLessThanOrEqual(570);
    }
  });

  it("keeps nodes apart and linked nodes closer than unlinked ones", () => {
    const d = (x: string, y: string) =>
      Math.hypot(pos.get(x)!.x - pos.get(y)!.x, pos.get(x)!.y - pos.get(y)!.y);
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) expect(d(ids[i], ids[j])).toBeGreaterThan(20);
    expect(d("a", "b")).toBeLessThan(d("a", "d"));
  });

  it("handles an empty graph", () => {
    expect(forceLayout([], [], 100, 100).size).toBe(0);
  });
});

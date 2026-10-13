// =============================================================================
// lib/supabase/dev-store.ts
// In-memory stand-in for Supabase so the app runs end-to-end with no external
// services (no Supabase project, no env vars). Wired in server.ts / admin.ts
// when NEXT_PUBLIC_SUPABASE_URL is absent. Not a full Postgres replacement —
// enough of the query-builder surface the app actually uses.
// =============================================================================

import { randomUUID } from "node:crypto";

type Row = Record<string, unknown>;
type Filter = { op: "eq" | "in" | "lt" | "gte"; col: string; value: unknown };

export const DEV_USER_ID = "dev_user_001";
export const DEV_USER_EMAIL = "demo@trapkiller.dev";

const tables = new Map<string, Row[]>();

function rows(table: string): Row[] {
  if (!tables.has(table)) tables.set(table, []);
  return tables.get(table)!;
}

class Builder {
  private insertValue: Row | Row[] | null = null;
  private updateValue: Row | null = null;
  private filters: Filter[] = [];
  private orders: { col: string; asc: boolean }[] = [];
  private limitN: number | null = null;
  private cols: string[] | null = null;

  constructor(private table: string) {}

  select(cols: string) {
    this.cols = cols
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    return this;
  }

  insert(value: Row | Row[]) {
    this.insertValue = structuredClone(value);
    return this;
  }

  update(value: Row) {
    this.updateValue = { ...value };
    return this;
  }

  eq(col: string, value: unknown) {
    this.filters.push({ op: "eq", col, value });
    return this;
  }

  in(col: string, values: unknown[]) {
    this.filters.push({ op: "in", col, value: values });
    return this;
  }

  lt(col: string, value: unknown) {
    this.filters.push({ op: "lt", col, value });
    return this;
  }

  gte(col: string, value: unknown) {
    this.filters.push({ op: "gte", col, value });
    return this;
  }

  order(col: string, opts: { ascending?: boolean }) {
    this.orders.push({ col, asc: opts?.ascending ?? true });
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  single() {
    return this.finalize("single");
  }

  maybeSingle() {
    return this.finalize("maybeSingle");
  }

  then(onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) {
    return Promise.resolve(this.finalize("list")).then(onFulfilled, onRejected);
  }

  private matches(row: Row): boolean {
    for (const f of this.filters) {
      const v = row[f.col] as unknown;
      if (f.op === "eq" && v !== f.value) return false;
      if (f.op === "in" && !(f.value as unknown[]).includes(v)) return false;
      if (f.op === "lt" && !((v as number | string) < (f.value as number | string))) return false;
      if (f.op === "gte" && !((v as number | string) >= (f.value as number | string))) return false;
    }
    return true;
  }

  private project(rows: Row[]): Row[] {
    const cols = this.cols;
    if (!cols) return rows;
    if (cols.includes("*")) return rows;
    return rows.map((r) => {
      const out: Row = {};
      for (const c of cols) out[c] = r[c];
      return out;
    });
  }

  private finalize(mode: "single" | "maybeSingle" | "list") {
    const error: unknown = null;

    if (this.insertValue) {
      const inserted = (Array.isArray(this.insertValue)
        ? this.insertValue
        : [this.insertValue]
      ).map((r) => {
        const row = { ...r };
        if (!row.id) row.id = `${this.table}_${randomUUID().slice(0, 18)}`;
        if (!row.created_at) row.created_at = new Date().toISOString();
        rows(this.table).push(row);
        return row;
      });
      const projected = this.project(inserted);
      return applyMode(projected, mode, error);
    }

    if (this.updateValue) {
      const updated = rows(this.table)
        .filter((r) => this.matches(r))
        .map((r) => {
          const next = { ...r, ...this.updateValue! };
          if (!next.updated_at) next.updated_at = new Date().toISOString();
          return next;
        });
      for (const r of updated) Object.assign(rows(this.table).find((x) => x.id === r.id)!, r);
      return applyMode(this.project(updated), mode, error);
    }

    let out = rows(this.table).filter((r) => this.matches(r));
    for (const o of this.orders) {
      out = [...out].sort((a, b) => {
        const va = a[o.col] as string;
        const vb = b[o.col] as string;
        return o.asc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    if (this.limitN !== null) out = out.slice(0, this.limitN);
    return applyMode(this.project(out), mode, error);
  }
}

function applyMode(data: Row[], mode: string, error: unknown) {
  if (mode === "maybeSingle") {
    return data.length === 1 ? { data: data[0], error } : { data: null, error };
  }
  if (mode === "single") {
    return data.length === 1
      ? { data: data[0], error }
      : { data: null, error: new Error("more than one row returned") };
  }
  return { data, error };
}

export function createDevClient(): unknown {
  return {
    from: (table: string) => new Builder(table),
  };
}
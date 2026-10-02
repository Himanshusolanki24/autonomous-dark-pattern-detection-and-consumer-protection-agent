import { describe, it, expect } from "vitest";
import { transitionApproval } from "@/server/db/approvals";
import { ConflictError, NotFoundError } from "@/server/security/errors";

function pendingApproval(overrides = {}) {
  return {
    id: "a1",
    user_id: "u1",
    session_id: "s1",
    task_id: "t1",
    status: "pending",
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    ...overrides,
  };
}

function adminStub(rows: Record<string, unknown[]>) {
  const calls: string[] = [];
  const q = (table: string) => {
    const state = { filters: {} as Record<string, unknown>, orderBy: [] as unknown[] };
    return {
      select() {
        return {
          eq(col: string, val: unknown) {
            state.filters[col] = val;
            return this;
          },
          order() {
            return this;
          },
          limit() {
            return this;
          },
          maybeSingle: async () => {
            const list = rows[table] ?? [];
            const match = list.find((r) =>
              Object.entries(state.filters).every(([c, v]) => (r as Record<string, unknown>)[c] === v)
            );
            calls.push(`select:${table}`);
            return { data: match ?? null, error: null };
          },
        };
      },
      update(data: Record<string, unknown>) {
        return {
          eq(col: string, val: unknown) {
            calls.push(`update:${table}:${JSON.stringify(data)}`);
            const row = (rows[table] ?? []).find((r) => (r as Record<string, unknown>)[col] === val);
            if (row) Object.assign(row, data);
            return Promise.resolve({ data: null, error: null });
          },
        };
      },
    };
  };
  return {
    from(table: string) {
      return q(table) as never;
    },
    q,
    calls,
  };
}

describe("transitionApproval", () => {
  it("approves a valid pending approval owned by the caller", async () => {
    const approval = pendingApproval();
    const admin = adminStub({
      agent_approvals: [approval],
      agent_sessions: [{ id: "s1", user_id: "u1", status: "approval_required" }],
    });

    const result = await transitionApproval(admin as never, "a1", "u1", "approved");
    expect(result.sessionId).toBe("s1");
    expect(approval.status).toBe("approved");
    expect((approval as { responded_at?: string }).responded_at).toBeTruthy();
    expect(admin.calls.some((c) => c.startsWith("update:agent_sessions"))).toBe(true);
  });

  it("rejects approvals that do not belong to the caller", async () => {
    const admin = adminStub({
      agent_approvals: [pendingApproval()],
      agent_sessions: [{ id: "s1", user_id: "u1", status: "approval_required" }],
    });
    await expect(transitionApproval(admin as never, "a1", "attacker", "approved")).rejects.toThrow(
      NotFoundError
    );
  });

  it("refuses a non-pending approval", async () => {
    const admin = adminStub({
      agent_approvals: [pendingApproval({ status: "approved" })],
      agent_sessions: [{ id: "s1", user_id: "u1", status: "approval_required" }],
    });
    await expect(transitionApproval(admin as never, "a1", "u1", "approved")).rejects.toThrow(
      ConflictError
    );
  });

  it("expires and refuses an expired approval", async () => {
    const expired = pendingApproval({ expires_at: new Date(Date.now() - 1000).toISOString() });
    const admin = adminStub({
      agent_approvals: [expired],
      agent_sessions: [{ id: "s1", user_id: "u1", status: "approval_required" }],
    });
    await expect(transitionApproval(admin as never, "a1", "u1", "approved")).rejects.toThrow(
      ConflictError
    );
    expect(expired.status).toBe("expired");
  });

  it("refuses when the session is not paused for approval", async () => {
    const admin = adminStub({
      agent_approvals: [pendingApproval()],
      agent_sessions: [{ id: "s1", user_id: "u1", status: "running" }],
    });
    await expect(transitionApproval(admin as never, "a1", "u1", "approved")).rejects.toThrow(
      ConflictError
    );
  });
});
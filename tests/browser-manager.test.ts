import { describe, it, expect, vi } from "vitest";
import { BrowserManager } from "@/server/browser/manager";
import type { Browser, BrowserContext, Page } from "playwright";

describe("BrowserManager retry & acquisition ladder", () => {
  it("falls back to local launcher when cloud is disabled", async () => {
    const mockPage = {
      setDefaultNavigationTimeout: vi.fn(),
      setDefaultTimeout: vi.fn(),
    } as unknown as Page;

    const mockContext = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as BrowserContext;

    const mockBrowser = {
      newContext: vi.fn().mockResolvedValue(mockContext),
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as Browser;

    const manager = new BrowserManager({
      launch: vi.fn().mockResolvedValue(mockBrowser),
    });

    const session = await manager.createSession("test-s1", "http://localhost:3000/demo-target");
    expect(session.via).toBe("local");
    expect(session.sessionId).toBe("test-s1");
    expect(session.page).toBe(mockPage);

    await manager.destroySession("test-s1");
  });

  it("handles multiple concurrent createSession calls idempotently", async () => {
    const mockPage = {
      setDefaultNavigationTimeout: vi.fn(),
      setDefaultTimeout: vi.fn(),
    } as unknown as Page;

    const mockContext = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(undefined),
    } as unknown as BrowserContext;

    const mockBrowser = {
      newContext: vi.fn().mockResolvedValue(mockContext),
    } as unknown as Browser;

    const manager = new BrowserManager({
      launch: vi.fn().mockResolvedValue(mockBrowser),
    });

    const [s1, s2] = await Promise.all([
      manager.createSession("s-concurrent"),
      manager.createSession("s-concurrent"),
    ]);

    expect(s1).toBe(s2);
    expect(manager.getSession("s-concurrent")).toBe(s1);

    await manager.destroySession("s-concurrent");
  });
});

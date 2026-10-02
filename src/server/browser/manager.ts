// =============================================================================
// lib/browser/manager.ts
// Playwright lifecycle manager. One chromium instance; one isolated context per
// agent session (users never share auth state). Sessions are destroyed after
// completion and guarded by hard timeouts.
// =============================================================================

import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { SESSION_TIMEOUT_MS } from "@/types/agent";

export interface BrowserSessionHandle {
  sessionId: string;
  context: BrowserContext;
  page: Page;
}

interface BrowserManagerOptions {
  launch?: () => Promise<Browser>;
  sessionTimeoutMs?: number;
  navigationTimeoutMs?: number;
  actionTimeoutMs?: number;
  maxPages?: number;
}

class BrowserManager {
  private browser: Browser | null = null;
  private sessions = new Map<string, BrowserSessionHandle>();
  private timeouts = new Map<string, NodeJS.Timeout>();
  private readonly opts: Required<Omit<BrowserManagerOptions, "launch">>;
  private readonly launcher: () => Promise<Browser>;
  private launching: Promise<Browser> | null = null;

  constructor(options: BrowserManagerOptions = {}) {
    this.launcher =
      options.launch ??
      (() =>
        chromium.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        }));
    this.opts = {
      sessionTimeoutMs: options.sessionTimeoutMs ?? SESSION_TIMEOUT_MS,
      navigationTimeoutMs: options.navigationTimeoutMs ?? 30_000,
      actionTimeoutMs: options.actionTimeoutMs ?? 10_000,
      maxPages: options.maxPages ?? 1,
    };
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser) return this.browser;
    if (!this.launching) {
      this.launching = this.launcher().then((b) => {
        this.browser = b;
        this.launching = null;
        return b;
      });
    }
    return this.launching;
  }

  /** Create an isolated context for a session (no shared cookies/auth). */
  async createSession(sessionId: string): Promise<BrowserSessionHandle> {
    const existing = this.sessions.get(sessionId);
    if (existing) return existing;

    const browser = await this.getBrowser();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(this.opts.navigationTimeoutMs);
    page.setDefaultTimeout(this.opts.actionTimeoutMs);

    const handle = { sessionId, context, page };
    this.sessions.set(sessionId, handle);

    const timer = setTimeout(() => {
      void this.destroySession(sessionId, "session_timeout");
    }, this.opts.sessionTimeoutMs);
    timer.unref?.();
    this.timeouts.set(sessionId, timer);

    return handle;
  }

  getSession(sessionId: string): BrowserSessionHandle | null {
    return this.sessions.get(sessionId) ?? null;
  }

  /**
   * One-off screenshot of a URL in a throwaway context. Used by the live page
   * preview so sites that block iframe embedding (X-Frame-Options) still render.
   */
  async screenshot(url: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    });
    try {
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(this.opts.navigationTimeoutMs);
      try {
        await page.goto(url, { waitUntil: "load", timeout: 20_000 });
      } catch {
        // Render whatever loaded even if the navigation didn't fully settle.
      }
      // Let SPA content hydrate, then settle network (lazy images, fonts).
      await page.waitForTimeout(2000);
      try {
        await page.waitForLoadState("networkidle", { timeout: 6_000 });
      } catch {
        // networkidle can never fire on sites with long-poll/analytics — fine.
      }
      return await page.screenshot({ type: "png", fullPage: true });
    } finally {
      await context.close().catch(() => {});
    }
  }

  /** Destroy the context. Cookies are never persisted to shared storage. */
  async destroySession(sessionId: string, reason = "completed"): Promise<void> {
    const handle = this.sessions.get(sessionId);
    const timer = this.timeouts.get(sessionId);
    if (timer) clearTimeout(timer);
    this.timeouts.delete(sessionId);
    this.sessions.delete(sessionId);

    if (!handle) {
      console.debug(`[browser] no session ${sessionId} to destroy (${reason})`);
      return;
    }
    try {
      await handle.context.close();
    } catch {
      // already closed
    }
  }

  /** Hard stop used by the stop endpoint / failure paths. */
  async killSession(sessionId: string): Promise<void> {
    await this.destroySession(sessionId, "terminated");
  }
}

/** Singleton shared across the worker process. */
export const browserManager = new BrowserManager();

export { BrowserManager };
export type { BrowserManagerOptions };
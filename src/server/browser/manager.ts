// =============================================================================
// lib/browser/manager.ts
// Playwright lifecycle manager. One chromium instance; one isolated context per
// agent session (users never share auth state). Sessions are destroyed after
// completion and guarded by hard timeouts.
// =============================================================================

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Browser, BrowserContext, Page } from "playwright";
import { SESSION_TIMEOUT_MS } from "@/types/agent";
import { BrowserAutomationError } from "@/server/security/errors";

/**
 * Playwright is imported on first launch, not at module load: on Linux its
 * import calls os.homedir(), which throws in a serverless sandbox with no HOME
 * and took down every route that imports this file. On Vercel there is also no
 * `playwright install`, so the packaged serverless Chromium is used instead.
 */
async function launchChromium(): Promise<Browser> {
  process.env.XDG_CACHE_HOME ??= "/tmp/.cache";
  // Playwright requires browsers.json by a runtime path the build can't trace,
  // so Vercel left it out. Naming it by a literal path here makes the build ship it.
  readFileSync(join(process.cwd(), "node_modules/playwright-core/browsers.json"));
  const { chromium } = await import("playwright");
  if (process.env.VERCEL) {
    try {
      const { default: serverless } = await import("@sparticuz/chromium");
      return await chromium.launch({
        headless: true,
        // A literal path, so the build ships the compressed browser in bin/.
        executablePath: await serverless.executablePath(
          join(process.cwd(), "node_modules/@sparticuz/chromium/bin")
        ),
        // Playwright gives every session its own context and closes it after;
        // in --single-process mode that takes the whole browser down.
        args: serverless.args.filter((a) => a !== "--single-process"),
      });
    } catch (err) {
      // First line only: the rest is Playwright's call log.
      const reason = (err as Error).message.split("\n")[0];
      console.error("[browser] serverless chromium failed to launch:", (err as Error).message);
      throw new BrowserAutomationError(`The browser couldn't start: ${reason}`);
    }
  }
  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

export interface BrowserSessionHandle {
  sessionId: string;
  context: BrowserContext;
  page: Page;
}

/** How long a preview screenshot is reused. */
const SHOT_TTL_MS = 60_000;

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
  private shots = new Map<string, { at: number; shot: Promise<Buffer> }>();
  private waiting = new Map<string, (shot: Buffer) => void>();

  constructor(options: BrowserManagerOptions = {}) {
    this.launcher = options.launch ?? launchChromium;
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
      this.launching = this.launcher()
        .then((b) => {
          this.browser = b;
          return b;
        })
        // Also clear on failure, or one failed launch poisons every later run.
        .finally(() => {
          this.launching = null;
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
   * Recent shots are reused: the preview asks for the same URL several times.
   */
  screenshot(url: string): Promise<Buffer> {
    const hit = this.shots.get(url);
    if (hit && Date.now() - hit.at < SHOT_TTL_MS) return hit.shot;
    // Whichever comes first wins: our own render, or a shot from an agent or
    // scanner session that is loading this same page right now (captureShot).
    const fromSession = new Promise<Buffer>((resolve) => this.waiting.set(url, resolve));
    // Caching the promise also shares one render between simultaneous requests.
    const shot = Promise.race([fromSession, this.renderShot(url)]);
    this.shots.set(url, { at: Date.now(), shot });
    const settled = () => this.waiting.delete(url);
    shot.then(settled, () => {
      settled();
      this.shots.delete(url);
    });
    // ponytail: tiny in-memory cache, oldest out. Use a real cache if previews go multi-instance.
    if (this.shots.size > 30) this.shots.delete(this.shots.keys().next().value!);
    return shot;
  }

  /**
   * Screenshot a page a session already has open and file it under the given
   * URLs, so the preview shows it without loading the site a second time.
   */
  async captureShot(page: Page, ...urls: string[]): Promise<void> {
    try {
      // Bounded wait for images and styles; the session's own work comes first.
      await page.waitForLoadState("load", { timeout: 1_200 }).catch(() => {});
      const buf = await page.screenshot({ type: "jpeg", quality: 72 });
      for (const raw of new Set(urls)) {
        let url: string;
        try {
          url = new URL(raw).toString();
        } catch {
          continue;
        }
        this.waiting.get(url)?.(buf);
        this.shots.set(url, { at: Date.now(), shot: Promise.resolve(buf) });
      }
    } catch {
      // A preview is a nicety — never fail a run or a scan over it.
    }
  }

  private async renderShot(url: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    });
    try {
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(this.opts.navigationTimeoutMs);
      // Video and audio are never visible in a still image; skip downloading them.
      await page.route("**/*", (route) =>
        route.request().resourceType() === "media" ? route.abort() : route.continue()
      );
      try {
        // Don't wait for every ad and tracker ("load"): the DOM is enough to start.
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10_000 });
      } catch {
        // Render whatever loaded even if the navigation didn't fully settle.
      }
      // Give styles, images and client rendering a short, bounded window.
      await page.waitForLoadState("load", { timeout: 2_500 }).catch(() => {});
      await page.waitForTimeout(400);
      // The first screen as JPEG: far smaller and faster than a full-page PNG.
      return await page.screenshot({ type: "jpeg", quality: 72 });
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
// =============================================================================
// lib/queue/runner.ts
// In-process async job queue for agent runs. For the MVP this runs inside the
// Next.js server; swap `enqueue` for BullMQ/Redis when REDIS_URL is present for
// horizontal deployments (see docs/deployment.md).
// =============================================================================

type Job = () => Promise<void>;

interface QueueState {
  jobs: Job[];
  running: number;
  idleResolvers: Array<() => void>;
}

const MAX_CONCURRENCY = 2;

class JobQueue {
  private state: QueueState = { jobs: [], running: 0, idleResolvers: [] };

  enqueue(job: Job): void {
    this.state.jobs.push(job);
    this.pump();
  }

  private pump(): void {
    while (this.state.running < MAX_CONCURRENCY && this.state.jobs.length > 0) {
      const job = this.state.jobs.shift()!;
      this.state.running++;
      void job()
        .catch((err) => console.error("[queue] job failed", err))
        .finally(() => {
          this.state.running--;
          this.pump();
          this.resolveIdle();
        });
    }
  }

  private resolveIdle(): void {
    if (this.state.running === 0 && this.state.jobs.length === 0) {
      this.state.idleResolvers.forEach((r) => r());
      this.state.idleResolvers = [];
    }
  }

  /** Test hook — resolves when the queue drains. */
  async drain(): Promise<void> {
    if (this.state.running === 0 && this.state.jobs.length === 0) return;
    await new Promise<void>((resolve) => this.state.idleResolvers.push(resolve));
  }
}

export const jobQueue = new JobQueue();
export { JobQueue };
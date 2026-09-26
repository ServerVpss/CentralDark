/**
 * cronTickLoop — sidecar cron tick loop.
 *
 * Runs alongside ClaudeTranscriptWatcher. Every TICK_MS (60s) it reads the cron store,
 * fires any due active jobs via the provided spawn callback, then advances nextFireAt.
 *
 * Skip-if-stale: jobs overdue by >CRON_STALE_MS (5 min) are silently skipped and logged.
 * This handles the "laptop closed = missed fires" case without a catch-up storm.
 *
 * Jobs MUST spawn into a valid workspace cwd (CLAUDE.md rule: cwd outside workspace =
 * invisible pane). The workspacePath field on the job enforces this.
 */
import { shouldFireJob, nextCronAfter, CRON_STALE_MS } from '@overclock-app/core';
export const CRON_TICK_MS = 60_000; // 1 minute
export class CronTickLoop {
    deps;
    timer = null;
    running = false;
    constructor(deps) {
        this.deps = deps;
    }
    /** Start the tick loop. Idempotent — safe to call more than once. */
    start() {
        if (this.timer != null)
            return;
        this.timer = setInterval(() => {
            void this.tick().catch((err) => {
                process.stderr.write(`[cron] tick error: ${err instanceof Error ? err.message : String(err)}\n`);
            });
        }, CRON_TICK_MS);
        if (typeof this.timer.unref === 'function') {
            this.timer.unref();
        }
    }
    /** Stop the tick loop. */
    stop() {
        if (this.timer != null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    /** Fire one tick: scan jobs, fire due ones, advance nextFireAt. Exported for testing. */
    async tick() {
        if (this.running)
            return; // prevent overlapping ticks
        this.running = true;
        try {
            const now = Date.now();
            const jobs = await this.deps.cronStore.readCronsFile();
            for (const job of jobs) {
                if (shouldFireJob(job, now)) {
                    process.stderr.write(`[cron] firing job "${job.name}" (id=${job.id})\n`);
                    let paneId = null;
                    let lastError;
                    try {
                        paneId = await this.deps.fireJob({ job });
                    }
                    catch (err) {
                        lastError = err instanceof Error ? err.message : String(err);
                        process.stderr.write(`[cron] job "${job.name}" fire error: ${lastError}\n`);
                    }
                    const nextFireAt = nextCronAfter(job.schedule, now) ?? undefined;
                    await this.deps.cronStore.mutateCronsFile((crons) => {
                        const idx = crons.findIndex((j) => j.id === job.id);
                        if (idx === -1)
                            return;
                        crons[idx] = {
                            ...crons[idx],
                            lastFiredAt: now,
                            updatedAt: now,
                            ...(nextFireAt !== undefined ? { nextFireAt } : {}),
                            ...(lastError !== undefined ? { lastError } : { lastError: undefined }),
                        };
                    });
                }
                else if (job.status === 'active' && job.nextFireAt != null) {
                    const overdueMs = now - job.nextFireAt;
                    if (overdueMs > CRON_STALE_MS) {
                        // Stale — advance silently (skip-if-stale per spec)
                        process.stderr.write(`[cron] skipping stale job "${job.name}" (overdue ${Math.round(overdueMs / 1000)}s)\n`);
                        const nextFireAt = nextCronAfter(job.schedule, now) ?? undefined;
                        await this.deps.cronStore.mutateCronsFile((crons) => {
                            const idx = crons.findIndex((j) => j.id === job.id);
                            if (idx === -1)
                                return;
                            crons[idx] = {
                                ...crons[idx],
                                updatedAt: now,
                                ...(nextFireAt !== undefined ? { nextFireAt } : {}),
                            };
                        });
                    }
                }
            }
        }
        finally {
            this.running = false;
        }
    }
}
//# sourceMappingURL=cronTickLoop.js.map
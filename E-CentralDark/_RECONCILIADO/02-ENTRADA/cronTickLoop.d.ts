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
import type { CronStore, CronJob } from '@overclock-app/core';
export declare const CRON_TICK_MS = 60000;
export interface CronFireArgs {
    job: CronJob;
}
export interface CronTickLoopDeps {
    cronStore: CronStore;
    /**
     * Called for each due job. Returns the paneId of the spawned pane (or null on failure).
     * The tick loop advances nextFireAt regardless of outcome; lastError is recorded on null.
     */
    fireJob: (args: CronFireArgs) => Promise<string | null>;
}
export declare class CronTickLoop {
    private readonly deps;
    private timer;
    private running;
    constructor(deps: CronTickLoopDeps);
    /** Start the tick loop. Idempotent — safe to call more than once. */
    start(): void;
    /** Stop the tick loop. */
    stop(): void;
    /** Fire one tick: scan jobs, fire due ones, advance nextFireAt. Exported for testing. */
    tick(): Promise<void>;
}
//# sourceMappingURL=cronTickLoop.d.ts.map
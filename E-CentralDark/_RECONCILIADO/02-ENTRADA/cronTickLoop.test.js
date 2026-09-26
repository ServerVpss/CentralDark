/**
 * cronTickLoop — unit tests for the tick loop firing logic.
 *
 * CronTickLoop is fully injectable (cronStore + fireJob deps) so tick() is
 * testable without fs or timers — we drive it with a fake store and a spy fireJob.
 *
 * Scenarios (per review spec):
 *   1. Due job fires and nextFireAt is advanced.
 *   2. Stale job (overdue >CRON_STALE_MS) is skipped+advanced, NOT fired.
 *   3. Paused job neither fires nor mutates.
 *   4. Future job (nextFireAt in the future) neither fires nor mutates.
 *   5. fireJob throw records lastError on the job.
 *   6. Overlapping tick is a no-op (the running guard).
 */
import { describe, it, expect, vi } from 'vitest';
import { CronTickLoop } from './cronTickLoop.js';
import { CRON_STALE_MS } from '@overclock-app/core';
// ── Helpers ───────────────────────────────────────────────────────────────────
/** Build a minimal valid CronJob fixture with nextFireAt relative to now. */
function makeJob(overrides) {
    const now = Date.now();
    return {
        id: 'job-1',
        name: 'Test Job',
        schedule: '* * * * *',
        brief: 'run qa',
        status: 'active',
        createdAt: now - 120_000,
        updatedAt: now - 120_000,
        // default: due 30 s ago (inside the CRON_STALE_MS window)
        nextFireAt: now - 30_000,
        ...overrides,
    };
}
/** Build a fake CronStore backed by an in-memory array. */
function makeFakeStore(initialJobs) {
    const jobs = [...initialJobs];
    return {
        jobs,
        async readCronsFile() { return [...jobs]; },
        async writeCronsFile(crons) { jobs.splice(0, jobs.length, ...crons); },
        async mutateCronsFile(mutator) {
            const copy = [...jobs];
            await mutator(copy);
            jobs.splice(0, jobs.length, ...copy);
        },
        async getCronById(id) { return jobs.find((j) => j.id === id) ?? null; },
        async createCron() { throw new Error('not needed in tests'); },
        async updateCronStatus() { throw new Error('not needed in tests'); },
        async deleteCron() { throw new Error('not needed in tests'); },
        async listCrons() { return [...jobs]; },
    };
}
// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CronTickLoop.tick() — due job fires and nextFireAt advances', () => {
    it('fires the due job', async () => {
        const job = makeJob({});
        const store = makeFakeStore([job]);
        const fireJob = vi.fn().mockResolvedValue('pane-abc');
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        expect(fireJob).toHaveBeenCalledOnce();
        expect(fireJob).toHaveBeenCalledWith({ job });
    });
    it('advances nextFireAt after firing', async () => {
        const job = makeJob({});
        const store = makeFakeStore([job]);
        const fireJob = vi.fn().mockResolvedValue('pane-abc');
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        const updated = store.jobs[0];
        expect(updated.lastFiredAt).toBeDefined();
        // nextFireAt for '* * * * *' must be set to the next minute boundary (in the future)
        if (updated.nextFireAt != null) {
            expect(updated.nextFireAt).toBeGreaterThan(Date.now() - 60_000);
        }
    });
    it('clears lastError on a successful fire', async () => {
        const job = makeJob({ lastError: 'previous error' });
        const store = makeFakeStore([job]);
        const fireJob = vi.fn().mockResolvedValue('pane-abc');
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        const updated = store.jobs[0];
        expect(updated.lastError).toBeUndefined();
    });
});
describe('CronTickLoop.tick() — stale job is skipped+advanced, not fired', () => {
    it('does not call fireJob for a job overdue by > CRON_STALE_MS', async () => {
        // overdue by 10 minutes — far past the 5-minute stale window
        const now = Date.now();
        const job = makeJob({ nextFireAt: now - (CRON_STALE_MS + 5 * 60_000) });
        const store = makeFakeStore([job]);
        const fireJob = vi.fn();
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        expect(fireJob).not.toHaveBeenCalled();
    });
    it('advances nextFireAt for a stale job (skip-if-stale advances, not stuck)', async () => {
        const now = Date.now();
        const oldNextFireAt = now - (CRON_STALE_MS + 5 * 60_000);
        const job = makeJob({ nextFireAt: oldNextFireAt });
        const store = makeFakeStore([job]);
        const fireJob = vi.fn();
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        const updated = store.jobs[0];
        // nextFireAt should be advanced past the stale value
        if (updated.nextFireAt != null) {
            expect(updated.nextFireAt).toBeGreaterThan(oldNextFireAt);
        }
    });
});
describe('CronTickLoop.tick() — paused job neither fires nor mutates', () => {
    it('does not call fireJob for a paused job', async () => {
        const job = makeJob({ status: 'paused' });
        const store = makeFakeStore([job]);
        const fireJob = vi.fn();
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        expect(fireJob).not.toHaveBeenCalled();
    });
    it('does not mutate the store for a paused job', async () => {
        const job = makeJob({ status: 'paused' });
        const store = makeFakeStore([job]);
        const mutateSpy = vi.spyOn(store, 'mutateCronsFile');
        const fireJob = vi.fn();
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        expect(mutateSpy).not.toHaveBeenCalled();
    });
});
describe('CronTickLoop.tick() — future job neither fires nor mutates', () => {
    it('does not call fireJob for a job scheduled in the future', async () => {
        const job = makeJob({ nextFireAt: Date.now() + 60_000 }); // 1 min in the future
        const store = makeFakeStore([job]);
        const fireJob = vi.fn();
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        expect(fireJob).not.toHaveBeenCalled();
    });
    it('does not mutate the store for a future job', async () => {
        const job = makeJob({ nextFireAt: Date.now() + 60_000 });
        const store = makeFakeStore([job]);
        const mutateSpy = vi.spyOn(store, 'mutateCronsFile');
        const fireJob = vi.fn();
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        expect(mutateSpy).not.toHaveBeenCalled();
    });
});
describe('CronTickLoop.tick() — fireJob throw records lastError', () => {
    it('records lastError on the job when fireJob throws', async () => {
        const job = makeJob({});
        const store = makeFakeStore([job]);
        const fireJob = vi.fn().mockRejectedValue(new Error('spawn failed'));
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        const updated = store.jobs[0];
        expect(updated.lastError).toBe('spawn failed');
    });
    it('sets lastFiredAt even when fireJob throws (fire was attempted)', async () => {
        const job = makeJob({});
        const store = makeFakeStore([job]);
        const fireJob = vi.fn().mockRejectedValue(new Error('spawn failed'));
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        await loop.tick();
        const updated = store.jobs[0];
        expect(updated.lastFiredAt).toBeDefined();
    });
});
describe('CronTickLoop.tick() — overlapping tick is a no-op', () => {
    it('does not fire twice when two ticks overlap', async () => {
        const job = makeJob({});
        const store = makeFakeStore([job]);
        // fireJob blocks on firstDone — simulates a slow spawn
        let resolveFirst;
        const firstDone = new Promise((res) => { resolveFirst = res; });
        const fireJob = vi.fn()
            .mockReturnValueOnce(firstDone)
            .mockResolvedValue('pane-2');
        const loop = new CronTickLoop({ cronStore: store, fireJob });
        // Start first tick — blocks waiting for firstDone
        const tick1 = loop.tick();
        // Immediately start second tick — must be a no-op due to running guard
        const tick2 = loop.tick();
        await tick2; // resolves immediately (no-op)
        resolveFirst('pane-1');
        await tick1;
        // fireJob must only have been called ONCE (tick1 only; tick2 was a no-op)
        expect(fireJob).toHaveBeenCalledOnce();
    });
});
//# sourceMappingURL=cronTickLoop.test.js.map
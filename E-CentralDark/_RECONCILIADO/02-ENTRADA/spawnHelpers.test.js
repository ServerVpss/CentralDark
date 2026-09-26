/**
 * spawnHelpers — sidecar-level wiring tests for writeDangerousCommandGate.
 *
 * This test file closes the coverage gap called out in the portability-backlog
 * review: dangerousCommand.test.ts:17 previously claimed "wiring into the
 * PreToolUse hook is tested via spawnHelpers" but no such test existed.
 *
 * What this covers (the seam the review demanded):
 *  (a) writeDangerousCommandGate writes a gate .mjs to disk — the file exists
 *      and contains the expected gate source (OPT-IN payload).
 *  (b) blockMode=false (warn-only) vs blockMode=true (hard block) are reflected
 *      in the written source — the runtime behaviour differs at the seam.
 *  (c) permanentAllowlist is serialised into the written source.
 *  (d) The OPT-IN ABSOLUTE contract: WorkspaceConfigStore.get() returns
 *      dangerousCommandGate=null by default (no workspace.json) — confirming
 *      the guard `dcCfg !== null` in core.ts correctly skips the hook push
 *      for any workspace that has not opted in.
 *
 * What is intentionally NOT tested here (integration-only surface):
 *  - The full core.ts buildSpawnConfig closure that calls workspaceConfigStore.get()
 *    and conditionally calls writeDangerousCommandGate — that branch requires
 *    standing up the full sidecar HTTP server + pane spawn pipeline.
 *  - The runtime node execution of the gate .mjs (subprocess I/O).
 *
 * OPT-IN ABSOLUTE RULE: absent workspace config => no gate hook is pushed.
 * That invariant is asserted by (d) combined with the guard comment in core.ts.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeDangerousCommandGate, writeHandoffEnforcementHooks, paneIdNumber, nextPaneId, paneFilesDir } from './spawnHelpers.js';
import { WorkspaceConfigStore } from '@overclock-app/core';
// ── Helpers ───────────────────────────────────────────────────────────────────
function makeTmpDir() {
    const dir = join(tmpdir(), `spawn-helpers-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(dir, { recursive: true });
    return dir;
}
let tmpDirs = [];
beforeEach(() => { tmpDirs = []; });
afterEach(() => {
    for (const d of tmpDirs) {
        try {
            rmSync(d, { recursive: true, force: true });
        }
        catch { /* ignore */ }
    }
});
function tmpDir() {
    const d = makeTmpDir();
    tmpDirs.push(d);
    return d;
}
// ── (a) writeDangerousCommandGate writes the gate .mjs to disk ───────────────
describe('writeDangerousCommandGate — file is written to disk', () => {
    it('returns a path to a file that exists after the call', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-test-1', [], false);
        expect(existsSync(path)).toBe(true);
    });
    it('gate file lands in gateDir with the expected name pattern', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-abc', [], false);
        expect(path).toContain(dir);
        expect(path).toMatch(/dangerous-cmd-gate-pane-abc\.mjs$/);
    });
    it('gate file is non-empty', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-test-2', [], false);
        const source = readFileSync(path, 'utf8');
        expect(source.length).toBeGreaterThan(0);
    });
});
// ── (b) blockMode reflected in generated source ───────────────────────────────
describe('writeDangerousCommandGate — blockMode is serialised into the gate source', () => {
    it('blockMode=false embeds const BLOCK_MODE = false in source (warn-only)', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-warn', [], false);
        const source = readFileSync(path, 'utf8');
        // The comment line encodes blockMode=false; the constant also encodes it
        expect(source).toContain('blockMode=false');
        expect(source).toContain('const BLOCK_MODE = false');
    });
    it('blockMode=true embeds const BLOCK_MODE = true in source (hard block)', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-block', [], true);
        const source = readFileSync(path, 'utf8');
        // The comment line encodes blockMode=true; the constant also encodes it
        expect(source).toContain('blockMode=true');
        expect(source).toContain('const BLOCK_MODE = true');
    });
    it('warn-only source exits 0 on match (process.exit(0) branch visible)', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-warn-exit', [], false);
        const source = readFileSync(path, 'utf8');
        // The gate must contain process.exit(0) after the warning branch
        expect(source).toContain('process.exit(0)');
    });
    it('hard-block source exits 2 on match (process.exit(2) branch visible)', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-block-exit', [], true);
        const source = readFileSync(path, 'utf8');
        expect(source).toContain('process.exit(2)');
    });
});
// ── (c) permanentAllowlist is serialised into the gate source ─────────────────
describe('writeDangerousCommandGate — permanentAllowlist is serialised', () => {
    it('empty allowlist produces empty Set literal in source', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-noallowlist', [], false);
        const source = readFileSync(path, 'utf8');
        expect(source).toContain('new Set([])');
    });
    it('non-empty allowlist entries appear in source', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-allowlist', ['recursive delete', 'SQL DROP'], false);
        const source = readFileSync(path, 'utf8');
        expect(source).toContain('recursive delete');
        expect(source).toContain('SQL DROP');
    });
    it('allowlist is JSON-serialised (not a template string injection)', () => {
        const dir = tmpDir();
        const path = writeDangerousCommandGate(dir, 'pane-json', ['fork bomb'], false);
        const source = readFileSync(path, 'utf8');
        // Must appear as JSON, not raw string
        expect(source).toContain(JSON.stringify(['fork bomb']));
    });
});
// ── (d) OPT-IN ABSOLUTE: dangerousCommandGate defaults to null ───────────────
//
// This block closes the core safety contract: the guard in core.ts
//   if (dcCfg !== null && dcCfg !== undefined) { preHooks.push(...) }
// is only effective when the store actually returns null by default.
// If WorkspaceConfigStore.get() ever changed to return a non-null default,
// the hook would be pushed for ALL panes (regression).
//
// These tests assert the store contract at the consuming seam.
describe('WorkspaceConfigStore — dangerousCommandGate is null by default (OPT-IN ABSOLUTE)', () => {
    it('absent workspace.json => dangerousCommandGate is null', () => {
        const dir = tmpDir();
        // No .overclock-app/workspace.json written — pure default path
        const store = new WorkspaceConfigStore();
        const cfg = store.get(dir);
        expect(cfg.dangerousCommandGate).toBeNull();
    });
    it('workspace.json without dangerousCommandGate field => null', () => {
        const dir = tmpDir();
        mkdirSync(join(dir, '.overclock-app'), { recursive: true });
        // Write a config that does NOT mention dangerousCommandGate
        writeFileSync(join(dir, '.overclock-app', 'workspace.json'), JSON.stringify({ accessMode: 'write_external' }), 'utf-8');
        const store = new WorkspaceConfigStore();
        const cfg = store.get(dir);
        // The field is absent from JSON — store must NOT invent a non-null value
        expect(cfg.dangerousCommandGate).toBeNull();
    });
    it('null config => writeDangerousCommandGate is NOT called (guard contract)', () => {
        // This test verifies the critical conditional: when dcCfg is null, the hook
        // must NOT be pushed. We simulate the guard logic extracted as a pure function.
        const dir = tmpDir();
        const store = new WorkspaceConfigStore();
        const cfg = store.get(dir);
        const dcCfg = cfg.dangerousCommandGate;
        // Simulate the core.ts guard: only push if non-null
        const preHooks = [];
        if (dcCfg !== null && dcCfg !== undefined) {
            const dcBlockMode = dcCfg.blockMode === true;
            const dcAllowlist = Array.isArray(dcCfg.allowlist) ? dcCfg.allowlist : [];
            preHooks.push(writeDangerousCommandGate(dir, 'test-pane', dcAllowlist, dcBlockMode));
        }
        // No hook must have been pushed — avulso/cinema/squad panes are unaffected
        expect(preHooks).toHaveLength(0);
    });
    it('non-null config => writeDangerousCommandGate IS called (guard contract)', () => {
        // Mirror of the previous test: when config is present, the hook must be pushed.
        const dir = tmpDir();
        const dcCfg = { blockMode: false, allowlist: [] };
        const preHooks = [];
        if (dcCfg !== null && dcCfg !== undefined) {
            const dcBlockMode = dcCfg.blockMode === true;
            const dcAllowlist = Array.isArray(dcCfg.allowlist) ? dcCfg.allowlist : [];
            preHooks.push(writeDangerousCommandGate(dir, 'test-pane', dcAllowlist, dcBlockMode));
        }
        expect(preHooks).toHaveLength(1);
        expect(existsSync(preHooks[0])).toBe(true);
    });
});
// ── writeHandoffEnforcementHooks — clarify-marker integration ─────────────────
//
// Verifies the two fixes for the Phase-1 Stop-hook / clarify gate (#10):
//
//  (A) PostToolUse hook writes a clarify-marker when overclock_clarify fires,
//      and clears it when handoff_submit fires later (so the Stop-hook only
//      sees the handoff marker at that point).
//
//  (B) Stop hook exits 0 (allows idle) when the clarify-marker is present —
//      the worker is parked waiting for a human answer and must NOT be nagged.
//
//  (C) Stop hook still exits 2 (nag) when neither marker is present — the
//      original handoff-enforcement contract is unaffected.
//
// The hooks are generated as ESM .mjs files executed by node; we test the
// generated SOURCE rather than spawning a subprocess to keep the suite fast
// and dependency-free.
describe('writeHandoffEnforcementHooks — clarify-marker in PostToolUse source', () => {
    it('PostToolUse source sets clarify-marker on overclock_clarify tool', () => {
        const dir = tmpDir();
        const { post } = writeHandoffEnforcementHooks(dir, 'pane-h1');
        const source = readFileSync(post, 'utf8');
        expect(source).toContain('mcp__overclock__overclock_clarify');
        // Must write the clarify-marker file
        expect(source).toContain('clarify-marker-pane-h1');
        expect(source).toContain('writeFileSync');
    });
    it('PostToolUse source removes clarify-marker when handoff_submit fires', () => {
        const dir = tmpDir();
        const { post } = writeHandoffEnforcementHooks(dir, 'pane-h2');
        const source = readFileSync(post, 'utf8');
        // The handoff_submit branch must call unlinkSync to clear the clarify marker
        expect(source).toContain('unlinkSync');
        expect(source).toContain('clarify-marker-pane-h2');
    });
    it('PostToolUse source still sets handoff-marker on handoff_submit', () => {
        const dir = tmpDir();
        const { post } = writeHandoffEnforcementHooks(dir, 'pane-h3');
        const source = readFileSync(post, 'utf8');
        expect(source).toContain('mcp__overclock__handoff_submit');
        expect(source).toContain('handoff-marker-pane-h3');
    });
});
describe('writeHandoffEnforcementHooks — clarify-marker in Stop source', () => {
    it('Stop source exits 0 when clarify-marker file exists (pane is parked, do not nag)', () => {
        const dir = tmpDir();
        const { stop } = writeHandoffEnforcementHooks(dir, 'pane-h4');
        const source = readFileSync(stop, 'utf8');
        // Must check clarify-marker and exit 0 — the worker is awaiting human answer
        expect(source).toContain('clarify-marker-pane-h4');
        // The marker check must come before the nag (process.exit(2)) in the source
        const clarifyIdx = source.indexOf('clarify-marker-pane-h4');
        const nagIdx = source.indexOf('process.exit(2)');
        expect(clarifyIdx).toBeGreaterThanOrEqual(0);
        expect(nagIdx).toBeGreaterThanOrEqual(0);
        expect(clarifyIdx).toBeLessThan(nagIdx);
    });
    it('Stop source still exits 0 when handoff-marker is present (original contract)', () => {
        const dir = tmpDir();
        const { stop } = writeHandoffEnforcementHooks(dir, 'pane-h5');
        const source = readFileSync(stop, 'utf8');
        expect(source).toContain('handoff-marker-pane-h5');
        // handoff-marker check precedes the nag exit
        const handoffIdx = source.indexOf('handoff-marker-pane-h5');
        const nagIdx = source.indexOf('process.exit(2)');
        expect(handoffIdx).toBeLessThan(nagIdx);
    });
    it('Stop source exits 2 when neither marker is present (nag — original contract unchanged)', () => {
        const dir = tmpDir();
        const { stop } = writeHandoffEnforcementHooks(dir, 'pane-h6');
        const source = readFileSync(stop, 'utf8');
        expect(source).toContain('process.exit(2)');
        expect(source).toContain('handoff_submit');
    });
});
// ── writeHandoffEnforcementHooks — pending-marker in Stop source (F6) ──────────
//
// A delegateOnly chefe that has spawned workers but hasn't yet received all their
// handoffs must be allowed to go idle (Stop hook exits 0). The sidecar writes a
// handoff-pending-<paneId> file while workers are outstanding; the Stop hook must
// check for it and exit 0, so the chefe isn't forced to poll.
describe('writeHandoffEnforcementHooks — pending-marker in Stop source (F6 free-chefe)', () => {
    it('Stop source contains handoff-pending- check', () => {
        const dir = tmpDir();
        const { stop } = writeHandoffEnforcementHooks(dir, 'pane-f6a');
        const source = readFileSync(stop, 'utf8');
        expect(source).toContain('handoff-pending-pane-f6a');
    });
    it('Stop source exits 0 on pending-marker (delegateOnly chefe idles while workers run)', () => {
        const dir = tmpDir();
        const { stop } = writeHandoffEnforcementHooks(dir, 'pane-f6b');
        const source = readFileSync(stop, 'utf8');
        // The pending marker check must exit 0, not fall through to the nag
        const pendingIdx = source.indexOf('handoff-pending-pane-f6b');
        const nagIdx = source.indexOf('process.exit(2)');
        expect(pendingIdx).toBeGreaterThanOrEqual(0);
        expect(nagIdx).toBeGreaterThanOrEqual(0);
        expect(pendingIdx).toBeLessThan(nagIdx);
    });
    it('pending-marker check appears AFTER clarify-marker check (ordering)', () => {
        const dir = tmpDir();
        const { stop } = writeHandoffEnforcementHooks(dir, 'pane-f6c');
        const source = readFileSync(stop, 'utf8');
        const clarifyIdx = source.indexOf('clarify-marker-pane-f6c');
        const pendingIdx = source.indexOf('handoff-pending-pane-f6c');
        expect(clarifyIdx).toBeGreaterThanOrEqual(0);
        expect(pendingIdx).toBeGreaterThanOrEqual(0);
        expect(clarifyIdx).toBeLessThan(pendingIdx);
    });
});
// ── F-008: pane id allocation (paneIdNumber + nextPaneId) ─────────────────────
//
// The bug: paneSeq is process-local and resets to 0 on every sidecar restart, so a raw
// `pane-${++seq}` re-emits the ids of panes RESUMED from panes.json as the counter climbs —
// colliding with the LIVE caller, clobbering a restorable entry, and inheriting a dead
// homonym's token telemetry. These assert the two guarantees of the fix: (1) an allocated id
// is strictly greater than every id in play (unique among live panes), and (2) seeding the
// counter from a persisted high-water mark makes it monotonic across restarts.
describe('paneIdNumber — parses only pane-<int> ids', () => {
    it('returns the numeric suffix of a pane-<N> id', () => {
        expect(paneIdNumber('pane-6')).toBe(6);
        expect(paneIdNumber('pane-34')).toBe(34);
        expect(paneIdNumber('pane-0')).toBe(0);
    });
    it('returns null for non pane-<int> ids (browser/tmux/remote/other)', () => {
        expect(paneIdNumber('tmux:sess-abc')).toBeNull();
        expect(paneIdNumber('pane-abc')).toBeNull();
        expect(paneIdNumber('pane-6a')).toBeNull();
        expect(paneIdNumber('browser-1')).toBeNull();
        expect(paneIdNumber('')).toBeNull();
    });
});
describe('nextPaneId — unique + monotonic allocation', () => {
    it('fresh process (seq=0, no live panes) → pane-1', () => {
        const { id, seq } = nextPaneId(0, []);
        expect(id).toBe('pane-1');
        expect(seq).toBe(1);
    });
    it('jumps past a live resumed pane so it is NOT re-emitted (the F-008 collision)', () => {
        // Restart: counter reset to 0 but pane-6 was resumed from panes.json (live in configs).
        const { id, seq } = nextPaneId(0, [6]);
        expect(id).toBe('pane-7');
        expect(seq).toBe(7);
    });
    it('never returns an id already in the live set, even mid-range', () => {
        // Live panes 3, 6, 18 — the allocated id must exceed all of them.
        const { id } = nextPaneId(0, [3, 6, 18]);
        expect(id).toBe('pane-19');
    });
    it('honours a persisted high-water seed above every live id (monotonic across restart)', () => {
        // Persisted seq=40 from a prior session; no live panes carry a higher number → pane-41.
        // This is what prevents reusing a DEAD pane-34's number (telemetry inheritance).
        const { id, seq } = nextPaneId(40, [6, 18]);
        expect(id).toBe('pane-41');
        expect(seq).toBe(41);
    });
    it('a live id above the persisted seed still wins (counter-file-lost fallback)', () => {
        const { id, seq } = nextPaneId(2, [6, 18]);
        expect(id).toBe('pane-19');
        expect(seq).toBe(19);
    });
    it('ignores non-pane numbers not in the set (only numeric suffixes are fed in)', () => {
        // Caller filters via paneIdNumber, so nextPaneId only ever sees numbers; a repeated call
        // after storing seq back keeps climbing.
        const first = nextPaneId(0, [6]);
        expect(first.id).toBe('pane-7');
        const second = nextPaneId(first.seq, [6, 7]);
        expect(second.id).toBe('pane-8');
    });
});
// ── paneFilesDir — per-instance pane-artifact dir (F-067) ─────────────────────
// Dev and prod share dataDir (F-054 pending); per-pane artifacts must never land
// in the other instance's boot-cleanup path.
describe('paneFilesDir — per-instance pane-artifact dir (F-067)', () => {
    it('dev instance writes into its own subdir', () => {
        expect(paneFilesDir('/data', true)).toBe(join('/data', 'pane-files.dev'));
    });
    it('prod keeps dataDir itself (no migration for existing installs)', () => {
        expect(paneFilesDir('/data', false)).toBe('/data');
    });
});
//# sourceMappingURL=spawnHelpers.test.js.map
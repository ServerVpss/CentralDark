import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ClaudeTranscriptWatcher } from './ClaudeTranscriptWatcher.js';
// Resume-capture seam: the transcript filename IS the claude session uuid. When the
// watcher resolves a new transcript to a live pane, it must fire onSessionDetected so
// the core can stamp cfg.claudeSessionId → panes.json → a restored pane re-resumes.
// (Root of the "SAVED context but no --resume" restore bug was that nothing fired here.)
const cleanups = [];
afterEach(() => { while (cleanups.length)
    cleanups.pop()(); });
/** Build an isolated projects-root + a virtual workspace whose slug-dir lives under it. */
function fixture() {
    const root = mkdtempSync(join(tmpdir(), 'octw-'));
    const token = root.split('/').pop(); // unique segment from mkdtemp
    const workspacePath = `/virtual-ws/${token}`; // never created on disk — purely a slug source
    const slug = workspacePath.replaceAll('/', '-');
    const slugDir = join(root, slug);
    mkdirSync(slugDir, { recursive: true });
    cleanups.push(() => { try {
        rmSync(root, { recursive: true, force: true });
    }
    catch { /* ignore */ } });
    return { root, workspacePath, slugDir };
}
function makeWatcher(opts) {
    const w = new ClaudeTranscriptWatcher(() => ({}), // dbForWorkspace — never recorded against (no usage lines)
    opts.lookupPane, () => { }, // onRecorded
    () => [opts.root], // extraProjectsRoots → the isolated temp root
    opts.onSessionDetected);
    cleanups.push(() => w.stop());
    return w;
}
// Poll a predicate until true or the deadline. 8s (not 3s): the watch is now RECURSIVE, and
// under the full parallel suite macOS FSEvents coalesces/delays nested-tree events, so a tight
// budget flakes even though delivery is reliable with a single watcher in production.
async function waitFor(pred, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (pred())
            return true;
        await new Promise((r) => setTimeout(r, 25));
    }
    return pred();
}
const userLine = (text) => JSON.stringify({ type: 'user', message: { role: 'user', content: text } }) + '\n';
describe('ClaudeTranscriptWatcher — resume session capture', () => {
    it('fires onSessionDetected(paneId, sessionId) when a new transcript resolves a live pane', async () => {
        const { root, workspacePath, slugDir } = fixture();
        const calls = [];
        const w = makeWatcher({
            root,
            lookupPane: () => 'pane-7',
            onSessionDetected: (paneId, sessionId) => calls.push({ paneId, sessionId }),
        });
        await w.start(workspacePath);
        const sessionId = 'sess-uuid-abc';
        writeFileSync(join(slugDir, `${sessionId}.jsonl`), userLine('oi'));
        expect(await waitFor(() => calls.length > 0)).toBe(true);
        expect(calls[0]).toEqual({ paneId: 'pane-7', sessionId });
    });
    it('fires at most once per session even as the transcript grows', async () => {
        const { root, workspacePath, slugDir } = fixture();
        const calls = [];
        const w = makeWatcher({
            root,
            lookupPane: () => 'pane-9',
            onSessionDetected: (paneId, sessionId) => calls.push({ paneId, sessionId }),
        });
        await w.start(workspacePath);
        const file = join(slugDir, 'sess-grow.jsonl');
        writeFileSync(file, userLine('first'));
        expect(await waitFor(() => calls.length > 0)).toBe(true);
        appendFileSync(file, userLine('second'));
        appendFileSync(file, userLine('third'));
        // Give any extra events a window to (wrongly) fire.
        await new Promise((r) => setTimeout(r, 200));
        expect(calls.length).toBe(1);
    });
    // F-001: parallel same-cwd spawns cross-stamped session ids. The lookup must receive the
    // transcript's sessionId so the core can attribute deterministically (dictated --session-id
    // match) instead of guessing "most recent spawn in window".
    it('passes the transcript sessionId to lookupPane for deterministic attribution', async () => {
        const { root, workspacePath, slugDir } = fixture();
        const lookupInputs = [];
        const w = makeWatcher({
            root,
            lookupPane: (input) => {
                lookupInputs.push({ slug: input.slug, sessionId: input.sessionId });
                return 'pane-1';
            },
            onSessionDetected: () => { },
        });
        await w.start(workspacePath);
        writeFileSync(join(slugDir, 'sess-dictated-xyz.jsonl'), userLine('oi'));
        expect(await waitFor(() => lookupInputs.length > 0)).toBe(true);
        expect(lookupInputs[0].sessionId).toBe('sess-dictated-xyz');
    });
    it('does NOT fire when the transcript cannot be resolved to a pane', async () => {
        const { root, workspacePath, slugDir } = fixture();
        let fired = false;
        const w = makeWatcher({
            root,
            lookupPane: () => null, // no live pane matches this slug
            onSessionDetected: () => { fired = true; },
        });
        await w.start(workspacePath);
        writeFileSync(join(slugDir, 'sess-orphan.jsonl'), userLine('oi'));
        // Wait long enough that a real event would have landed.
        await new Promise((r) => setTimeout(r, 500));
        expect(fired).toBe(false);
    });
});
// Workflow / Task sub-agents write to <slug>/<parentSessionId>/subagents/**/agent-<id>.jsonl
// (nested) — the multi-agent burn that was INVISIBLE while the watcher only read <slug>/*.jsonl
// (non-recursive). These must be recorded AND attributed to the PARENT session's pane, so a
// workflow's token cost lands on the badge of the pane that launched it.
import { getWorkspaceDb, aggregateTokensByPane } from './db.js';
function realFixture() {
    const root = mkdtempSync(join(tmpdir(), 'octw-sa-root-'));
    const workspacePath = mkdtempSync(join(tmpdir(), 'octw-sa-ws-')); // real dir → real messages.db
    const slug = workspacePath.replaceAll('/', '-');
    const slugDir = join(root, slug);
    mkdirSync(slugDir, { recursive: true });
    cleanups.push(() => {
        try {
            rmSync(root, { recursive: true, force: true });
        }
        catch { /* ignore */ }
        try {
            rmSync(workspacePath, { recursive: true, force: true });
        }
        catch { /* ignore */ }
    });
    return { root, workspacePath, slugDir };
}
const assistantUsage = (sessionId, model, u) => JSON.stringify({ type: 'assistant', sessionId, message: { model, usage: {
            input_tokens: u.in, output_tokens: u.out, cache_read_input_tokens: u.cr ?? 0, cache_creation_input_tokens: u.cw ?? 0,
        } } }) + '\n';
// 8s (not 3s): under the full parallel suite, recursive fs.watch can be slow to deliver the
// nested create event, so a tight budget flakes even though the logic is correct.
async function waitForTok(db, pane, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (aggregateTokensByPane(db, pane).output > 0)
            return true;
        await new Promise((r) => setTimeout(r, 25));
    }
    return aggregateTokensByPane(db, pane).output > 0;
}
describe('ClaudeTranscriptWatcher — workflow sub-agent tokens', () => {
    it('records nested subagents/**/agent-*.jsonl usage attributed to the parent pane', { timeout: 15000 }, async () => {
        const { root, workspacePath, slugDir } = realFixture();
        const w = new ClaudeTranscriptWatcher((p) => getWorkspaceDb(p), () => 'pane-42', // parent session resolves to this live pane
        () => { }, () => [root]);
        cleanups.push(() => w.stop());
        await w.start(workspacePath);
        // A workflow sub-agent file nested under <parentSessionId>/subagents/workflows/wf_x/.
        const wfDir = join(slugDir, 'parent-sess-uuid', 'subagents', 'workflows', 'wf_abc');
        mkdirSync(wfDir, { recursive: true });
        writeFileSync(join(wfDir, 'agent-deadbeef01.jsonl'), assistantUsage('parent-sess-uuid', 'claude-opus-4-8', { in: 1000, out: 200, cw: 5000 }));
        const db = getWorkspaceDb(workspacePath);
        expect(await waitForTok(db, 'pane-42')).toBe(true);
        const agg = aggregateTokensByPane(db, 'pane-42');
        expect(agg.input).toBe(1000);
        expect(agg.output).toBe(200);
        expect(agg.cache_write).toBe(5000);
    });
    it('captures per-agent model — different sub-agents on different models both count', { timeout: 15000 }, async () => {
        const { root, workspacePath, slugDir } = realFixture();
        const w = new ClaudeTranscriptWatcher((p) => getWorkspaceDb(p), () => 'pane-7', () => { }, () => [root]);
        cleanups.push(() => w.stop());
        await w.start(workspacePath);
        const saDir = join(slugDir, 'p2', 'subagents', 'workflows', 'wf_z');
        mkdirSync(saDir, { recursive: true });
        writeFileSync(join(saDir, 'agent-aaa.jsonl'), assistantUsage('p2', 'claude-opus-4-8', { in: 100, out: 50 }));
        writeFileSync(join(saDir, 'agent-bbb.jsonl'), assistantUsage('p2', 'claude-haiku-4-5', { in: 80, out: 30 }));
        const db = getWorkspaceDb(workspacePath);
        // both agents' output summed on the same parent pane (model recorded per-row, see byModel/XP).
        // Poll until BOTH land (50+30=80) — two separate fs.watch events, order/timing not guaranteed.
        const start = Date.now();
        while (Date.now() - start < 8000 && aggregateTokensByPane(db, 'pane-7').output < 80) {
            await new Promise((r) => setTimeout(r, 25));
        }
        expect(aggregateTokensByPane(db, 'pane-7').output).toBe(80);
        expect(aggregateTokensByPane(db, 'pane-7').input).toBe(180);
    });
});
//# sourceMappingURL=ClaudeTranscriptWatcher.test.js.map
import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CodexTranscriptWatcher } from './CodexTranscriptWatcher.js';
import { getWorkspaceDb, aggregateTokensByPane } from './db.js';
// Integration test: drives the REAL recordTokenUsage → REAL node:sqlite messages.db
// (via getWorkspaceDb), so it proves the whole write path, not just the parser. Mirrors
// the Claude watcher's anatomy; only the Codex source format (rollout JSONL, token_count
// events, cwd from session_meta) differs.
const cleanups = [];
afterEach(() => { while (cleanups.length)
    cleanups.pop()(); });
/** Isolated codex sessions root (with the YYYY/MM/DD date dir) + a real workspace dir. */
function fixture() {
    const base = mkdtempSync(join(tmpdir(), 'octx-'));
    const sessionsRoot = join(base, '.codex', 'sessions');
    const dateDir = join(sessionsRoot, '2026', '06', '25');
    mkdirSync(dateDir, { recursive: true });
    const workspacePath = join(base, 'ws'); // real dir → getWorkspaceDb creates messages.db here
    mkdirSync(workspacePath, { recursive: true });
    cleanups.push(() => { try {
        rmSync(base, { recursive: true, force: true });
    }
    catch { /* ignore */ } });
    return { sessionsRoot, dateDir, workspacePath };
}
function makeWatcher(opts) {
    const w = new CodexTranscriptWatcher((wsPath) => getWorkspaceDb(wsPath), opts.lookupPane, opts.onRecorded ?? (() => { }), () => [opts.sessionsRoot], opts.onSessionDetected ?? (() => { }));
    cleanups.push(() => w.stop());
    return w;
}
async function waitFor(pred, timeoutMs = 3000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (pred())
            return true;
        await new Promise((r) => setTimeout(r, 25));
    }
    return pred();
}
const ROLLOUT = 'rollout-2026-06-25T07-22-43-019efe4d-aa33-7442-9028-a2bd2d675935.jsonl';
const sessionMeta = (cwd) => JSON.stringify({ type: 'session_meta', payload: { session_id: '019efe4d', cwd, originator: 'codex-tui' } }) + '\n';
const turnContext = (model, cwd) => JSON.stringify({ type: 'turn_context', payload: { cwd, model } }) + '\n';
const tokenCount = (input, cached, output) => JSON.stringify({
    type: 'event_msg',
    payload: { type: 'token_count', info: { last_token_usage: { input_tokens: input, cached_input_tokens: cached, output_tokens: output, reasoning_output_tokens: 0, total_tokens: input + output } } },
}) + '\n';
describe('CodexTranscriptWatcher — token recording', () => {
    it('records per-turn usage AND fires onSessionDetected(paneId, rolloutUuid) once', async () => {
        const { sessionsRoot, dateDir, workspacePath } = fixture();
        // Folded into the recording test (not a separate watcher) to avoid a 4th concurrent
        // fs.watch lifecycle — macOS FSEvents coalescing makes parallel recursive watchers flaky.
        const calls = [];
        const w = makeWatcher({
            sessionsRoot,
            lookupPane: () => 'pane-3',
            onSessionDetected: (paneId, sessionId) => calls.push({ paneId, sessionId }),
        });
        await w.start();
        // NEW file after start → read from byte 0 (session_meta gives cwd, token_count gives usage).
        const file = join(dateDir, ROLLOUT);
        writeFileSync(file, sessionMeta(workspacePath) + turnContext('gpt-5.5', workspacePath) + tokenCount(1000, 200, 50));
        const db = getWorkspaceDb(workspacePath);
        expect(await waitFor(() => aggregateTokensByPane(db, 'pane-3').output > 0)).toBe(true);
        const agg = aggregateTokensByPane(db, 'pane-3');
        expect(agg.input).toBe(800); // 1000 − 200 cached = fresh input
        expect(agg.cache_read).toBe(200); // cached_input_tokens
        expect(agg.output).toBe(50);
        expect(agg.cache_write).toBe(0);
        // Resume-capture seam: the rollout UUID (filename suffix) is the codex resume id, fired once.
        expect(await waitFor(() => calls.length > 0)).toBe(true);
        expect(calls[0]).toEqual({ paneId: 'pane-3', sessionId: '019efe4d-aa33-7442-9028-a2bd2d675935' });
        appendFileSync(file, tokenCount(500, 0, 30));
        await new Promise((r) => setTimeout(r, 150));
        expect(calls.length).toBe(1);
    });
    it('accumulates across appended turns and dedups a repeated token_count', async () => {
        const { sessionsRoot, dateDir, workspacePath } = fixture();
        let recordedEvents = 0;
        const w = makeWatcher({ sessionsRoot, lookupPane: () => 'pane-5', onRecorded: () => { recordedEvents += 1; } });
        await w.start();
        const file = join(dateDir, ROLLOUT);
        writeFileSync(file, sessionMeta(workspacePath) + turnContext('gpt-5.5', workspacePath) + tokenCount(1000, 0, 100));
        const db = getWorkspaceDb(workspacePath);
        expect(await waitFor(() => aggregateTokensByPane(db, 'pane-5').output === 100)).toBe(true);
        appendFileSync(file, tokenCount(500, 0, 30)); // new turn → recorded
        expect(await waitFor(() => aggregateTokensByPane(db, 'pane-5').output === 130)).toBe(true);
        appendFileSync(file, tokenCount(500, 0, 30)); // identical sig → deduped, ignored
        await new Promise((r) => setTimeout(r, 250));
        expect(aggregateTokensByPane(db, 'pane-5').output).toBe(130);
    });
    it('skips historical content seeded at start (no re-billing on restart)', async () => {
        const { sessionsRoot, dateDir, workspacePath } = fixture();
        // Pre-existing file BEFORE the watcher starts → its bytes are seeded as the offset.
        const file = join(dateDir, ROLLOUT);
        writeFileSync(file, sessionMeta(workspacePath) + turnContext('gpt-5.5', workspacePath) + tokenCount(9999, 0, 9999));
        const w = makeWatcher({ sessionsRoot, lookupPane: () => 'pane-8' });
        await w.start();
        // Only the NEW append must be billed — the historical 9999/9999 turn is skipped.
        appendFileSync(file, tokenCount(10, 0, 7));
        const db = getWorkspaceDb(workspacePath);
        expect(await waitFor(() => aggregateTokensByPane(db, 'pane-8').output > 0)).toBe(true);
        const agg = aggregateTokensByPane(db, 'pane-8');
        expect(agg.output).toBe(7); // NOT 9999+7
        expect(agg.input).toBe(10);
    });
});
//# sourceMappingURL=CodexTranscriptWatcher.test.js.map
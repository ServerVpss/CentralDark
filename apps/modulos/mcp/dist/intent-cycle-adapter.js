// Adaptador do ciclo tipado para os owners EXISTENTES: MCP API + Hermes inbox + logs.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, openSync, closeSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { compileIntent, reconcileIntent } from './intent-cycle.js';
import { getOperationalSnapshot } from './operational-telemetry.js';
import { appendCentralEvent } from './log-funnel.js';
const ROOT = process.env.CENTRALDARK_ROOT || join(homedir(), 'CentralDark');
const STATE_PATH = join(ROOT, 'logs', 'intent-loop-state.json');
const INBOX = join(ROOT, 'apps/modulos/HERMES-CORE/missions/pendente');
const SHA = /^[0-9a-f]{40}$/i;
const sealed = (path) => { try {
    return JSON.parse(readFileSync(path, 'utf8'));
}
catch {
    return null;
} };
const sha = (value) => createHash('sha256').update(value).digest('hex');
export function measuredHead(root = ROOT) {
    try {
        const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, timeout: 4000, encoding: 'utf8' }).trim();
        return SHA.test(head) ? head : null;
    }
    catch {
        return null;
    }
}
function gitBlob(file) {
    try {
        return execFileSync('git', ['hash-object', file], { cwd: ROOT, timeout: 2500, encoding: 'utf8' }).trim();
    }
    catch {
        return null;
    }
}
function evidence(status, source, observedAt, headSha, receipt) {
    return { status, source, observedAt, ...(headSha ? { sha: headSha } : {}), ...(receipt ? { receipt } : {}) };
}
// Todas as evidencias sao construidas no servidor. Nunca aceitamos PASS vindo do formulario.
export function measureIntentWorld() {
    const at = new Date().toISOString();
    const head = measuredHead();
    const snapshot = getOperationalSnapshot({ root: ROOT });
    const e = {};
    // SOURCE_CURRENT exige upstream e sincronizacao comprovados, nao apenas HEAD local.
    let upstream = null, dirty = null;
    try {
        const ref = execFileSync('git', ['rev-parse', 'refs/remotes/origin/main'], { cwd: ROOT, encoding: 'utf8', timeout: 2500 }).trim();
        if (SHA.test(ref))
            upstream = ref;
    }
    catch { /* unknown */ }
    try {
        dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: ROOT, encoding: 'utf8', timeout: 3500 }).trim().length > 0;
    }
    catch { /* unknown */ }
    const sync = sealed(join(ROOT, 'logs/auto-sync-status.json'));
    const syncAt = Date.parse(sync?.t || '');
    const syncFresh = Number.isFinite(syncAt) && Date.now() - syncAt >= -5000 && Date.now() - syncAt <= 15 * 60_000;
    const sourceState = !head || !upstream ? 'UNKNOWN'
        : head !== upstream ? 'STALE'
            : dirty === true ? 'BLOCKED'
                : dirty === null || !syncFresh ? 'UNKNOWN'
                    : sync?.result === 'PASS' && sync?.head === head && sync?.origin_main === upstream ? 'PASS' : 'UNKNOWN';
    e.SOURCE_CURRENT = evidence(sourceState, 'git:checkout-vs-origin-main+tracked-dirty+autosync-receipt', at, head);
    e.MCP_HEALTH = evidence('PASS', 'mcp:authenticated-request-handler-alive', at, head);
    const beat = sealed(join(ROOT, 'logs/heartbeat-api.json'));
    const time = Date.parse(beat?.t || '');
    const fresh = Number.isFinite(time) && Date.now() - time >= -5000 && Date.now() - time <= 30000;
    e.ONE_HEART = evidence(fresh && beat?.self === 'alive' ? 'PASS' : (fresh ? 'FAIL' : 'STALE'), 'logs/heartbeat-api.json', at, head);
    const manifest = sealed(join(ROOT, 'docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json'));
    const learn = join(ROOT, 'docs/CONSCIENCIA/APRENDIZADOS.md');
    const linksOk = Array.isArray(manifest?.nodes) && manifest.nodes.length > 0
        && manifest.nodes.every((n, i, a) => n.prev_uid === (i ? a[i - 1].uid : 'L000') &&
            n.next_uid === (i === a.length - 1 ? 'PENDING_NEXT_CURSOR' : a[i + 1].uid));
    const lineageOk = linksOk && manifest?.source_blob_sha === gitBlob(learn);
    e.NEUROLINK = evidence(lineageOk ? 'PASS' : 'UNKNOWN', 'neuro:manifest+git-blob+prev-next', at, head);
    // Prova do HUD fisico, nao da copia obsoleta do checkout.
    const deployedHud = process.env.CENTRALDARK_HUD_PATH || join(homedir(), '.centraldark', 'HUD.html');
    let mainHudBlob = null;
    try {
        mainHudBlob = execFileSync('git', ['rev-parse', 'refs/remotes/origin/main:docs/HUD/HUD.html'], {
            cwd: ROOT, encoding: 'utf8', timeout: 2500
        }).trim();
    }
    catch { /* unknown */ }
    const hudOk = SHA.test(mainHudBlob || '') && existsSync(deployedHud) && gitBlob(deployedHud) === mainHudBlob;
    e.HUD = evidence(hudOk ? 'PASS' : 'UNKNOWN', 'hud:physical-vs-origin-main-blob', at, head);
    let gateway = 'UNKNOWN';
    try {
        gateway = execFileSync('systemctl', ['is-active', 'hermes-gateway.service'], { timeout: 2500, encoding: 'utf8' }).trim() === 'active' ? 'PASS' : 'FAIL';
    }
    catch {
        gateway = 'UNKNOWN';
    }
    e.HERMES_RUNTIME = evidence(gateway, 'systemd:hermes-gateway.service-liveness-only', at, head);
    const f = snapshot?.fronts || [];
    const github = f.find(x => x.id === 'F1_GIT');
    e.CI_SAME_SHA = evidence('UNKNOWN', 'github:requires-same-sha-CI-receipt', at, head);
    e.LOG_FUNNEL = evidence('UNKNOWN', 'log-funnel:requires-authenticated-readback', at, head);
    const previous = sealed(STATE_PATH);
    const previousValid = false; // o recibo deve casar com o fingerprint da intenção atual; checado após compilar
    e.RECEIPT = evidence(previousValid ? 'PASS' : 'UNKNOWN', 'logs/intent-loop-state.json', at, head, previousValid ? previous.fingerprint : undefined);
    return { observedAt: at, headSha: head, evidence: e, measurement: { gitSync: github?.state || 'UNKNOWN', snapshotAt: snapshot?.observedAt || null, runtimeGateway: gateway } };
}
function hermesFinalizedEffect(fingerprint, head) {
    if (!SHA.test(head || ''))
        return null;
    const base = join(ROOT, 'apps/modulos/HERMES-CORE/missions/concluidas');
    if (!existsSync(base))
        return null;
    const slug = 'centraldark-intent-' + fingerprint.slice(0, 24);
    let dates = [];
    try {
        dates = readdirSync(base, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort().reverse().slice(0, 10);
    }
    catch {
        return null;
    }
    for (const day of dates) {
        const dir = join(base, day, slug);
        const receipt = sealed(join(dir, 'finalization-receipt.json'));
        const state = sealed(join(dir, 'state.json'));
        let mission = '';
        try {
            mission = readFileSync(join(dir, 'missao.md'), 'utf8');
        }
        catch {
            continue;
        }
        if (!receipt || !state)
            continue;
        if (receipt.gate !== 'HERMES_FINALIZATION_CRITIC' || receipt.status !== 'PASS' || !Number.isInteger(receipt.history_entries) || receipt.history_entries < 1)
            continue;
        if (state.terminal_state !== 'CONCLUIDA')
            continue;
        if (!mission.includes('RECEIPT_FINGERPRINT: ' + fingerprint) || !mission.includes('SOURCE_LOCAL_SHA: ' + head))
            continue;
        if (Array.isArray(receipt.unproven_mutations) && receipt.unproven_mutations.length)
            continue;
        return { source: 'hermes:critic-finalization+state+mission', receipt: fingerprint };
    }
    return null;
}
export function readIntentState() { return sealed(STATE_PATH); }
function atomicRecord(data) {
    mkdirSync(join(ROOT, 'logs'), { recursive: true });
    const lockPath = STATE_PATH + '.lock';
    let fd;
    try {
        fd = openSync(lockPath, 'wx', 0o600);
    }
    catch {
        throw new Error('ONE_WRITER_BUSY');
    }
    const temp = STATE_PATH + '.tmp-' + process.pid;
    try {
        const serialized = JSON.stringify(data, null, 2) + '\n';
        const immutableDir = join(ROOT, 'logs', 'intent-loop-receipts');
        mkdirSync(immutableDir, { recursive: true });
        const immutableName = sha(JSON.stringify({ fingerprint: data.fingerprint, observedAt: data.observedAt })).slice(0, 40) + '.json';
        const immutable = join(immutableDir, immutableName);
        try {
            writeFileSync(immutable, serialized, { mode: 0o600, flag: 'wx' });
        }
        catch (err) {
            if (err?.code !== 'EEXIST')
                throw err;
        }
        writeFileSync(temp, serialized, { mode: 0o600, flag: 'wx' });
        renameSync(temp, STATE_PATH);
        const again = sealed(STATE_PATH);
        if (again?.fingerprint !== data.fingerprint || again?.nextCursor !== data.nextCursor)
            throw new Error('RECEIPT_READBACK_MISMATCH');
    }
    finally {
        try {
            unlinkSync(temp);
        }
        catch { }
        try {
            closeSync(fd);
        }
        catch { }
        try {
            unlinkSync(lockPath);
        }
        catch { }
    }
}
function enqueueOriginalHermes(receipt) {
    if (!SHA.test(receipt.currentHead || ''))
        return { queued: false, reason: 'HEAD_UNKNOWN' };
    // O checkout com writer alheio deve ser preservado; nao alimentar motor com fonte divergente.
    let dirty = '';
    try {
        dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: ROOT, encoding: 'utf8', timeout: 4000 }).trim();
    }
    catch {
        return { queued: false, reason: 'GIT_WORKTREE_UNKNOWN' };
    }
    if (dirty)
        return { queued: false, reason: 'DIRTY_WORKTREE_OTHER_WRITER' };
    if (!existsSync(INBOX))
        return { queued: false, reason: 'HERMES_ORIGINAL_QUEUE_UNAVAILABLE' };
    const file = join(INBOX, 'centraldark-intent-' + receipt.fingerprint.slice(0, 24) + '.md');
    if (existsSync(file))
        return { queued: true, reused: true, reason: 'EXISTING_QUEUE_FILE', path: 'Hermes original inbox' };
    const body = [
        '# CentralDark — intencao herdada / mesmo sistema',
        'CHEFE_INTENT: ' + receipt.intent,
        'OWNER: ' + receipt.owner,
        'GOAL_ID: ' + (receipt.goalId || 'RECOVER_EXISTING_GOAL'),
        'MODE: ' + receipt.mode,
        'SOURCE_LOCAL_SHA: ' + receipt.currentHead,
        'RECEIPT_FINGERPRINT: ' + receipt.fingerprint,
        'NEXT_CURSOR: ' + receipt.nextCursor,
        'ATTEMPTS_MAX: ' + receipt.attemptsLimit,
        'CRITERIA: ' + receipt.criteria.map(c => c.id + ':' + c.status).join(','),
        'REUSE_BEFORE_CREATE=true; ONE_WRITER=true; CURRENT_OVER_HISTORY=true;',
        'TOCOU_TEM_QUE_SELAR: reuse owners docs/CONSCIENCIA/ and scripts/trigger-fabric/rebuild_learning_lineage.py',
        'NO_FALSE_GREEN: HTTP200 != FIXED_POINT; COMMENT != EXECUTION; UNKNOWN != PASS',
        'CONTINUE_SAME_GOAL=true; return real tests, counterproof and NEXT_CURSOR. Never requeue an existing completed task.',
    ].join('\n') + '\n';
    try {
        writeFileSync(file, body, { flag: 'wx', mode: 0o600 });
        return { queued: true, reused: false, reason: 'HERMES_ORIGINAL_INBOX', path: 'Hermes original inbox' };
    }
    catch (e) {
        return { queued: false, reason: e?.code === 'EEXIST' ? 'EXISTING_QUEUE_FILE' : 'QUEUE_WRITE_FAILED' };
    }
}
export function runIntentCycle(payload, { dispatch = false } = {}) {
    const input = compileIntent(payload);
    const measured = measureIntentWorld();
    const fingerprint = sha(JSON.stringify({ intent: input.intent, mode: input.mode, owner: input.owner, goalId: input.goalId || null, criteria: input.criteria, headSha: measured.headSha }));
    const concluded = hermesFinalizedEffect(fingerprint, measured.headSha);
    if (concluded)
        measured.evidence.OBJECTIVE_EFFECT = evidence('PASS', concluded.source, measured.observedAt, measured.headSha, concluded.receipt);
    const previous = readIntentState();
    const matchingReceipt = previous?.fingerprint === fingerprint && previous?.currentHead === measured.headSha && previous?.fixedPoint === true;
    if (matchingReceipt)
        measured.evidence.RECEIPT = evidence('PASS', 'receipt:exact-fingerprint-same-sha', measured.observedAt, measured.headSha, previous.fingerprint);
    const base = reconcileIntent(input, measured, fingerprint, previous);
    const duplicate = previous?.fingerprint === fingerprint && previous?.queued === true && !base.fixedPoint;
    let dispatched = { queued: false, reason: 'DISPATCH_NOT_REQUESTED' };
    if (base.fixedPoint)
        dispatched = { queued: false, reason: 'GOAL_ALREADY_VERIFIED' };
    else if (dispatch && input.mode === 'AUTONOMO' && !duplicate)
        dispatched = enqueueOriginalHermes(base);
    else if (duplicate)
        dispatched = { queued: true, reused: true, reason: 'REUSED_EXISTING_RECEIPT' };
    else if (dispatch && input.mode !== 'AUTONOMO')
        dispatched = { queued: false, reason: 'MODE_DOES_NOT_AUTHORIZE_DISPATCH' };
    const result = {
        ...base, queued: dispatched.queued,
        queueReason: dispatched.reason, queueReused: dispatched.reused === true,
        measured: measured.measurement,
        executionProven: concluded !== null, // exige state CONCLUIDA + Critic PASS + fingerprint + SHA
        learnSeal: concluded ? 'RUNTIME_PROOF_SEALED_CHECK_LEARNING_OWNER' : 'REQUIRES_HERMES_T1_RECEIPT',
    };
    atomicRecord(result);
    const logged = appendCentralEvent({
        sector: 'consciencia', service: 'intent-cycle', source: 'mcp:admin-intent',
        kind: 'intent_receipt', level: result.fixedPoint ? 'info' : 'warn',
        key: result.fingerprint, sha: result.currentHead,
        message: result.state + ' ' + result.nextCursor,
        data: { mode: result.mode, queued: result.queued, criteria: result.criteria.map(c => ({ id: c.id, status: c.status })), executionProven: result.executionProven }
    });
    return { ...result, logReceipt: logged.ok ? logged.event_id : null };
}
export function publicIntentStatus() {
    const r = readIntentState();
    if (!r)
        return { schema: 'centraldark.intent.fixed-point.v1', state: 'UNKNOWN', fixedPoint: false, observedAt: null, nextCursor: 'NO_RECEIPT', mode: null, criteria: [] };
    // GET publico nao repete um selo antigo quando expirou ou o CURRENT mudou.
    const timestamp = Date.parse(r.observedAt || '');
    const age = Date.now() - timestamp;
    const fresh = Number.isFinite(age) && age >= -5000 && age <= 15 * 60_000;
    const sameHead = Boolean(r.currentHead) && measuredHead() === r.currentHead;
    let live = null;
    if (fresh && sameHead) {
        try {
            live = measureIntentWorld();
        }
        catch { /* fail closed */ }
    }
    const criteria = (r.criteria || []).map(c => {
        let status = c.status;
        if ((!fresh || !sameHead || !live) && status === 'PASS')
            status = 'STALE';
        else if (status === 'PASS' && live.evidence?.[c.id]?.status && live.evidence[c.id].status !== 'PASS')
            status = live.evidence[c.id].status;
        return { id: c.id, status };
    });
    const fixedPoint = r.fixedPoint === true && fresh && sameHead && Boolean(live)
        && criteria.length > 0 && criteria.every(c => c.status === 'PASS');
    const pending = criteria.find(c => c.status !== 'PASS');
    const state = fixedPoint ? 'SEALED'
        : (!fresh || !sameHead || !live || criteria.some(c => c.status === 'STALE')) ? 'STALE'
            : r.state === 'SEALED' ? 'NEXT_CURSOR' : r.state;
    const nextCursor = fixedPoint ? 'FIXED_POINT'
        : pending ? 'VERIFY_' + pending.id : 'REMEASURE_RECEIPT';
    return { schema: r.schema, state, fixedPoint, observedAt: r.observedAt, mode: r.mode, nextCursor, currentHead: r.currentHead,
        queued: r.queued === true, executionProven: fixedPoint && r.executionProven === true, criteria };
}
//# sourceMappingURL=intent-cycle-adapter.js.map
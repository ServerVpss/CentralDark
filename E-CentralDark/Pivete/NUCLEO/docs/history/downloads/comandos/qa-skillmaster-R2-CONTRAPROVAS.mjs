#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || 'qa.teste-de-software.MARKDOWN');
const pacotaoRoot = process.argv[3] ? path.resolve(process.argv[3]) : null;

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }
function run(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, shell: false, env: process.env });
    let stdout = '', stderr = '';
    child.stdout.on('data', c => stdout += c);
    child.stderr.on('data', c => stderr += c);
    child.on('error', e => resolve({ code: 127, stdout, stderr: e.message }));
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}
async function importRuntime(name) {
  return import(pathToFileURL(path.join(root, 'runtime', name)).href + `?audit=${Date.now()}-${Math.random()}`);
}

const router = await importRuntime('router.mjs');
const classifier = await importRuntime('classificar-evento.mjs');
const orchestrator = await importRuntime('orchestrator.mjs');
const learning = await importRuntime('learning-store.mjs');
const updater = await importRuntime('update-bot.mjs');
const sanitize = await importRuntime('sanitize.mjs');
const swarm = await importRuntime('enxame-runner.mjs');

const findings = [];

// R2-001: structured route still claims mission preserved when mission is absent.
{
  const event = classifier.classificarEvento({ event: 'TEST_FAILED', evidence: { error: 'falha parser' } });
  const route = await router.routeQaContext(event, { root });
  const result = await orchestrator.orchestrate({ event: 'TEST_FAILED', evidence: { error: 'falha parser' } }, { root });
  findings.push({
    id: 'R2-001',
    title: 'Prova de missão contraditória e regressão declarada sem teste',
    reproduced: route.missionPreserved === true && route.mission?.id == null && /REGRESSAO_PRESERVADA=SIM/.test(result.delta),
    evidence: {
      routeMissionPreserved: route.missionPreserved,
      routeMission: route.mission,
      deltaLines: result.delta.split('\n').filter(x => /^(REGRESSAO_|MISSAO_|PROXIMO_)/.test(x)),
    },
  });
}

// R2-002: textual/plausible fake proof and nonnumeric zero-like values still promote learning.
{
  const fake = {
    proven: true,
    estado: 'VERDE_CONSOLIDADO',
    pattern: 'parser falha', errorExact: 'erro X', cause: 'causa Y', fix: 'fix Z',
    sourceIds: ['receipt-2026-prod-123'],
    testBefore: { exitCode: 1 }, testAfter: { exitCode: 0 }, regression: { exitCode: 0 }, negativeCase: { exitCode: 0 },
    fail: false, skipped: [], unknown: null, filesOutOfScope: '   ',
    finalHead: 'deadbeef', rollback: 'git revert deadbeef',
  };
  const learningDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r2-fake-learning-'));
  const validation = learning.validateLearningContract(fake);
  const registration = await learning.registerLearning(fake, { learningDir });
  findings.push({
    id: 'R2-002',
    title: 'Aprendizado sem proveniência real e com tipagem inválida é promovido',
    reproduced: validation.valid === true && registration.promoted === true,
    evidence: { validation, registration: { promoted: registration.promoted, reason: registration.reason, id: registration.id } },
  });
}

// R2-003: learning store has no same-fingerprint transaction and reuses the same temp name.
{
  const learningDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r2-learning-race-'));
  const record = {
    proven: true, estado: 'VERDE_CONSOLIDADO', pattern: 'race', errorExact: 'E', cause: 'C', fix: 'F', sourceIds: ['receipt-abc'],
    testBefore: 'FAIL', testAfter: 'PASS', regression: 'PASS', negativeCase: 'PASS', fail: 0, skipped: 0, unknown: 0,
    filesOutOfScope: 0, finalHead: 'abcdef1', reversible: true,
  };
  const settled = await Promise.allSettled(Array.from({ length: 8 }, () => learning.registerLearning(record, { learningDir })));
  const rejected = settled.filter(x => x.status === 'rejected').map(x => `${x.reason?.code || ''}:${x.reason?.message || x.reason}`);
  findings.push({
    id: 'R2-003',
    title: 'Learning Store quebra sob promoção concorrente',
    reproduced: rejected.length > 0,
    evidence: { fulfilled: settled.length - rejected.length, rejected },
  });
}

// R2-004: different event locks do not protect the shared checkpoint/temp file.
{
  const stateDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r2-update-race-'));
  const orchestrateFn = async () => {
    await new Promise(r => setTimeout(r, 50));
    return { delta: 'STATUS=OK\n', event: { mission: { id: 'M' } }, routeResult: {}, policy: {}, learning: {} };
  };
  const requested = 30;
  const settled = await Promise.allSettled(Array.from({ length: requested }, (_, i) =>
    updater.processEvent({ event: 'TEST_FAILED', mission: { id: 'M' }, evidence: { error: `E${i}` } },
      { stateDir, orchestrateFn, lockTimeoutMs: 3000 })
  ));
  const fulfilled = settled.filter(x => x.status === 'fulfilled');
  const rejected = settled.filter(x => x.status === 'rejected').map(x => x.reason?.message || String(x.reason));
  let checkpoint = { processed: [] };
  try { checkpoint = JSON.parse(await fs.readFile(path.join(stateDir, 'checkpoint.json'), 'utf8')); } catch {}
  findings.push({
    id: 'R2-004',
    title: 'Checkpoint global perde eventos e writeAtomic colide entre eventos diferentes',
    reproduced: rejected.length > 0 || checkpoint.processed.length < fulfilled.filter(x => x.value.status === 'PROCESSED').length,
    evidence: {
      requested,
      fulfilled: fulfilled.length,
      processedReturns: fulfilled.filter(x => x.value.status === 'PROCESSED').length,
      rejectedCount: rejected.length,
      rejected: rejected.slice(0, 8),
      checkpointCount: checkpoint.processed.length,
    },
  });
}

// R2-005: stale lock is never reclaimed.
{
  const stateDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r2-stale-lock-'));
  const raw = { event: 'TEST_FAILED', mission: { id: 'M' }, evidence: { error: 'E' } };
  const eventId = sanitize.hashObject(raw);
  await fs.mkdir(path.join(stateDir, 'locks'), { recursive: true });
  await fs.writeFile(path.join(stateDir, 'locks', `${eventId}.lock`), JSON.stringify({ pid: 999999, ts: '2000-01-01T00:00:00Z' }));
  let error = null;
  try { await updater.processEvent(raw, { stateDir, lockTimeoutMs: 120 }); } catch (e) { error = e.message; }
  findings.push({
    id: 'R2-005',
    title: 'Lock órfão bloqueia o evento indefinidamente',
    reproduced: String(error).startsWith('LOCK_TIMEOUT:'),
    evidence: { eventId, error },
  });
}

// R2-006: truthy non-text content becomes empty text but is still counted as a successful agent.
{
  const provider = { id: 'fake', kind: 'openai-compatible', baseUrl: 'https://example.invalid', models: ['m'], apiKey: 'not-real' };
  const fetchImpl = async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: [] } }] }) });
  const one = await swarm.callProvider(provider, { user: 'x', model: 'm' }, { fetchImpl });
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r2-empty-swarm-'));
  const result = await swarm.runEnxame({ providers: [provider], fetchImpl, mode: 'econo', judge: false, prompt: 'x', outputDir });
  findings.push({
    id: 'R2-006',
    title: 'Enxame retorna OK com cinco respostas vazias',
    reproduced: one.text.length === 0 && result.status === 'OK' && result.failCount === 0,
    evidence: { callProviderTextLength: one.text.length, status: result.status, agentsUsed: result.agentsUsed, failCount: result.failCount },
  });
}

// R2-007: verifier is non-recursive for runtime/tests and does not inspect a nested invalid secret reader.
{
  const mutant = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r2-nested-mutant-'));
  await fs.cp(root, mutant, { recursive: true });
  await fs.mkdir(path.join(mutant, 'runtime', 'nested'), { recursive: true });
  await fs.writeFile(path.join(mutant, 'runtime', 'nested', 'secret-reader.mjs'),
    "import fs from 'node:fs/promises';\nawait fs.open('.env', 'r');\nTHIS IS INVALID JAVASCRIPT !!!\n");
  const verify = await run(process.execPath, ['runtime/orchestrator.mjs', '--verify'], mutant);
  let parsed = null; try { parsed = JSON.parse(verify.stdout); } catch {}
  findings.push({
    id: 'R2-007',
    title: 'Verificador PASS ignora runtime aninhado inválido que abre .env',
    reproduced: verify.code === 0 && parsed?.status === 'PASS',
    evidence: { verifierExitCode: verify.code, verifierStatus: parsed?.status, nodeCheckTotal: parsed?.nodeCheck?.total, secretReadScan: parsed?.secretReadScan },
  });
}

// R2-008: TAP summary is parsed from the first matching text and can be spoofed by test stdout.
{
  const mutant = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r2-tap-mutant-'));
  await fs.cp(root, mutant, { recursive: true });
  const testBody = `import test from 'node:test';\n` +
    `console.log('# tests 55');\nconsole.log('# pass 55');\nconsole.log('# fail 0');\nconsole.log('# skipped 0');\nconsole.log('# cancelled 0');\nconsole.log('# todo 0');\n` +
    `test('real pass', () => {});\ntest.skip('real skipped hidden by spoof', () => {});\n`;
  await fs.writeFile(path.join(mutant, 'tests', '000-spoof-summary.test.mjs'), testBody);
  const verify = await run(process.execPath, ['runtime/orchestrator.mjs', '--verify'], mutant);
  let parsed = null; try { parsed = JSON.parse(verify.stdout); } catch {}
  findings.push({
    id: 'R2-008',
    title: 'Teste pulado é escondido por resumo TAP forjado e verify retorna PASS',
    reproduced: verify.code === 0 && parsed?.status === 'PASS' && parsed?.tests?.summary?.skipped === 0,
    evidence: { verifierExitCode: verify.code, verifierStatus: parsed?.status, parsedSummary: parsed?.tests?.summary, testExitCode: parsed?.tests?.exitCode },
  });
}

// Optional source-preservation comparison.
let comparison = null;
if (pacotaoRoot && await exists(pacotaoRoot)) {
  async function list(rootDir) {
    const out = new Map();
    async function walk(dir) {
      for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) await walk(full);
        else if (ent.isFile()) out.set(path.relative(rootDir, full).replaceAll('\\', '/'), full);
      }
    }
    await walk(rootDir); return out;
  }
  function sha(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
  const a = await list(pacotaoRoot), b = await list(root);
  const missing = [...a.keys()].filter(k => !b.has(k)).sort();
  const added = [...b.keys()].filter(k => !a.has(k)).sort();
  const changed = [];
  for (const k of [...a.keys()].filter(k => b.has(k)).sort()) {
    const ah = sha(await fs.readFile(a.get(k))), bh = sha(await fs.readFile(b.get(k)));
    if (ah !== bh) changed.push({ path: k, pacotaoSha256: ah, rigorSha256: bh });
  }
  comparison = { pacotaoFiles: a.size, rigorFiles: b.size, missing, changed, added };
  findings.unshift({
    id: 'R2-000',
    title: 'Pacote RIGOR não é extensão byte-preservada do PACOTAO',
    reproduced: missing.length > 0 || changed.length > 0,
    evidence: { pacotaoFiles: a.size, rigorFiles: b.size, missingCount: missing.length, changedCount: changed.length, addedCount: added.length, missing, changed: changed.map(x => x.path) },
  });
}

const report = {
  status: findings.some(x => x.reproduced) ? 'BLOCKED_NEW_COUNTERPROOFS' : 'NO_NEW_GAP_REPRODUCED',
  targetRoot: root,
  pacotaoRoot,
  findings,
  comparison,
};
console.log(JSON.stringify(report, null, 2));
process.exit(report.status === 'BLOCKED_NEW_COUNTERPROOFS' ? 2 : 0);

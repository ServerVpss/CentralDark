#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || 'qa.teste-de-software.MARKDOWN');

function run(command, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, shell: false, env: process.env });
    let stdout = '', stderr = '';
    child.stdout.on('data', (c) => stdout += c);
    child.stderr.on('data', (c) => stderr += c);
    child.on('error', (e) => resolve({ code: 127, stdout, stderr: e.message }));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function importRuntime(name) {
  return import(pathToFileURL(path.join(root, 'runtime', name)).href + `?r3=${Date.now()}-${Math.random()}`);
}

async function walkFiles(dir, base = dir, out = []) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walkFiles(full, base, out);
    else if (ent.isFile()) out.push(path.relative(base, full).replaceAll('\\', '/'));
  }
  return out;
}

function auditExcluded(rel) {
  return rel === 'AUDITORIA/FILE-HASHES.sha256'
    || rel === 'AUDITORIA/RECIBO-ARVORE.json'
    || rel === 'AUDITORIA/VALIDACAO-FINAL.json'
    || rel.startsWith('learning/');
}

async function rewriteHashManifest(mutantRoot) {
  const files = (await walkFiles(mutantRoot)).filter((rel) => !auditExcluded(rel)).sort();
  const lines = [];
  for (const rel of files) {
    const bytes = await fs.readFile(path.join(mutantRoot, rel));
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    lines.push(`${hash}  ${rel}`);
  }
  await fs.writeFile(path.join(mutantRoot, 'AUDITORIA', 'FILE-HASHES.sha256'), `${lines.join('\n')}\n`, 'utf8');
  return lines.length;
}

const swarm = await importRuntime('enxame-runner.mjs');
const learning = await importRuntime('learning-store.mjs');
const orchestrator = await importRuntime('orchestrator.mjs');
const findings = [];

// R3-001 — truthy non-text content is sanitized into empty text and still counted as success.
{
  const provider = { id: 'fake', kind: 'openai-compatible', baseUrl: 'https://example.invalid', models: ['m'], apiKey: 'not-real' };
  const fetchImpl = async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: [] } }] }) });
  const call = await swarm.callProvider(provider, { user: 'x', model: 'm' }, { fetchImpl });
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r3-empty-swarm-'));
  const result = await swarm.runEnxame({ providers: [provider], fetchImpl, mode: 'econo', judge: false, prompt: 'x', outputDir });
  findings.push({
    id: 'R3-001',
    title: 'Enxame retorna OK com todas as respostas vazias',
    reproduced: call.text.length === 0 && result.status === 'OK' && result.failCount === 0,
    evidence: { callProviderTextLength: call.text.length, status: result.status, agentsUsed: result.agentsUsed, failCount: result.failCount },
  });
}

// R3-002 — the official receipt creator can mint a content-addressed receipt for invented evidence.
{
  const learningDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r3-forged-learning-'));
  const record = {
    proven: true,
    estado: 'VERDE_CONSOLIDADO',
    pattern: 'invented pattern',
    errorExact: 'invented error',
    cause: 'invented cause',
    fix: 'invented fix',
    sourceIds: [],
    testBefore: 'FAIL',
    testAfter: 'PASS',
    regression: 'PASS',
    negativeCase: 'PASS',
    fail: 0,
    skipped: 0,
    unknown: 0,
    filesOutOfScope: 0,
    finalHead: 'a'.repeat(40),
    rollback: `git revert ${'a'.repeat(40)}`,
  };
  const receipt = await learning.createEvidenceReceipt(record, {
    command: 'echo fake',
    stdout: 'invented deterministic proof',
    exitCode: 0,
  }, { learningDir });
  record.sourceIds = [receipt.id];
  const registration = await learning.registerLearning(record, { learningDir });
  findings.push({
    id: 'R3-002',
    title: 'Recibo autogerado sem raiz de confiança promove aprendizado inventado',
    reproduced: registration.promoted === true && registration.reason === 'PROVA_COMPLETA',
    evidence: { receiptId: receipt.id, contractDigest: receipt.contractDigest, promoted: registration.promoted, reason: registration.reason, learningId: registration.id },
  });
}

// R3-003 — after rewriting the mutable in-tree hash manifest, a nested invalid secret reader is accepted.
{
  const mutant = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r3-rehashed-nested-'));
  await fs.cp(root, mutant, { recursive: true });
  await fs.mkdir(path.join(mutant, 'runtime', 'nested'), { recursive: true });
  await fs.writeFile(path.join(mutant, 'runtime', 'nested', 'secret-reader.mjs'),
    "import fs from 'node:fs/promises';\nawait fs.readFile('.env', 'utf8');\nTHIS IS INVALID JAVASCRIPT !!!\n", 'utf8');
  const hashEntries = await rewriteHashManifest(mutant);
  const verify = await run(process.execPath, ['runtime/orchestrator.mjs', '--verify'], mutant);
  let parsed = null; try { parsed = JSON.parse(verify.stdout); } catch {}
  findings.push({
    id: 'R3-003',
    title: 'Manifesto mutável permite PASS com runtime aninhado inválido que lê .env',
    reproduced: verify.code === 0 && parsed?.status === 'PASS' && parsed?.secretReadScan?.pass === true,
    evidence: { hashEntries, verifierExitCode: verify.code, verifierStatus: parsed?.status, nodeCheckTotal: parsed?.nodeCheck?.total, secretReadScan: parsed?.secretReadScan },
  });
}

// R3-004 — a tracked test can forge the first TAP summary and hide a real skipped test.
{
  const mutant = await fs.mkdtemp(path.join(os.tmpdir(), 'qa-r3-rehashed-tap-'));
  await fs.cp(root, mutant, { recursive: true });
  await fs.writeFile(path.join(mutant, 'tests', '000-spoof-summary.test.mjs'),
    "import test from 'node:test';\n" +
    "console.log('# tests 60');\nconsole.log('# pass 60');\nconsole.log('# fail 0');\nconsole.log('# skipped 0');\nconsole.log('# cancelled 0');\nconsole.log('# todo 0');\n" +
    "test('real pass', () => {});\ntest.skip('real skipped hidden', () => {});\n", 'utf8');
  const hashEntries = await rewriteHashManifest(mutant);
  const verify = await run(process.execPath, ['runtime/orchestrator.mjs', '--verify'], mutant);
  let parsed = null; try { parsed = JSON.parse(verify.stdout); } catch {}
  findings.push({
    id: 'R3-004',
    title: 'Resumo TAP forjado esconde teste pulado depois de atualização legítima do manifesto',
    reproduced: verify.code === 0 && parsed?.status === 'PASS' && parsed?.tests?.summary?.skipped === 0,
    evidence: { hashEntries, verifierExitCode: verify.code, verifierStatus: parsed?.status, parsedSummary: parsed?.tests?.summary, testFiles: parsed?.tests?.files },
  });
}

// R3-005 — the delta states regression preserved although policy says regression proof is absent.
{
  const result = await orchestrator.orchestrate({
    event: 'TEST_FAILED',
    mission: { id: 'M', state: 'FAILED', nextState: 'FIX' },
    evidence: { error: 'x' },
  }, { root });
  const lines = result.delta.split('\n').filter((line) => /^(STATUS|REGRESSAO_|MISSAO_|AUTO_APPLY)/.test(line));
  const claimsPreserved = lines.includes('REGRESSAO_PRESERVADA=SIM');
  const policyRejectsRegression = result.policy?.reasons?.includes('REGRESSAO_PASSOU=NAO');
  findings.push({
    id: 'R3-005',
    title: 'Mesmo delta afirma e nega a prova de regressão',
    reproduced: claimsPreserved && policyRejectsRegression,
    evidence: { lines, policyState: result.policy?.state, policyReasons: result.policy?.reasons },
  });
}

const report = {
  status: findings.some((f) => f.reproduced) ? 'BLOCKED_R3_COUNTERPROOFS' : 'NO_R3_GAP_REPRODUCED',
  targetRoot: root,
  findings,
};
console.log(JSON.stringify(report, null, 2));
process.exit(report.status === 'BLOCKED_R3_COUNTERPROOFS' ? 2 : 0);

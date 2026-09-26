# COMANDO - qa-skillmaster-R2-CONTRAPROVAS.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\01-ARQUIVOS-DA-CONVERSA\qa-skillmaster-R2-CONTRAPROVAS.mjs
**SHA:** 90ad44cf7ff113be
**Timestamp:** 2026-08-26T19:10:22.824149
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const result = await swarm.runEnxame({ providers: [provider], fetchImpl, mode: 'econo', judge: false, prompt: 'x', outputDir });

### Padroes
- pattern: 'parser falha', errorExact: 'erro X', cause: 'causa Y', fix: 'fix Z',
- proven: true, estado: 'VERDE_CONSOLIDADO', pattern: 'race', errorExact: 'E', cause: 'C', fix: 'F', sourceIds: ['receipt-abc'],

### Gaps
- const missing = [...a.keys()].filter(k => !b.has(k)).sort();

### Ouro Bruto (primeiros 5000 chars)
```
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
    updater.processEvent({ event: 'TEST_FAILED', mission: { id: 'M' }, evidence: 
```
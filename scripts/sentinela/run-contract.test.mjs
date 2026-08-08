import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(HERE, 'run.mjs'), 'utf8');

test('run integra máquina de estado + Hermes sem depender de polling de sessão', () => {
  assert.match(source, /reconcileFindingState/);
  assert.match(source, /notifyViaHermes/);
  assert.match(source, /ghListOpenSentinelaIssues/);
  assert.match(source, /KEEP[^\n]*SILENT|type: 'KEEP'[\s\S]*notify: 'SILENT'/);
});

test('inventário de Issues falha fechado antes de mutação', () => {
  assert.match(source, /ISSUE_INVENTORY_UNAVAILABLE/);
  assert.match(source, /nenhuma mutação executada/i);
});

test('Sentinela não recria o dialeto legado de labels', () => {
  assert.doesNotMatch(source, /function\s+ensureLabels/);
  assert.doesNotMatch(source, /gh\s+label\s+create/);
  assert.doesNotMatch(source, /['"]assign:(?:codex|claude|grok|chatgpt|supabase-bot)['"]/);
});

test('labels emitidas seguem o catálogo canônico da #707', () => {
  for (const label of [
    '🛡️ SENTINELA',
    '🤖 AUTO',
    '🔴 PRIORIDADE-ALTA',
    '🟡 PRIORIDADE-MÉDIA',
    '🟢 PRIORIDADE-BAIXA',
    '🧠 AGENTE-CODEX',
    '🧠 AGENTE-CLAUDE',
    '🧠 AGENTE-GROK',
  ]) {
    assert.ok(source.includes(label), `label canônica ausente: ${label}`);
  }
});

test('somente ALERT e RECOVERY chamam Hermes; KEEP e duplicata permanecem silenciosos', () => {
  const calls = source.match(/notifyViaHermes\(/g) || [];
  assert.equal(calls.length, 2, 'somente ALERT + RECOVERY podem chamar Hermes');
  assert.match(source, /type: 'ALERT'[\s\S]*notifyViaHermes/);
  assert.match(source, /type: 'RECOVERY'[\s\S]*notifyViaHermes/);
  assert.match(source, /type: 'KEEP'[\s\S]*notify: 'SILENT'/);
  assert.match(source, /type: 'DUPLICATE_OPEN'[\s\S]*notify: 'SILENT'/);
});

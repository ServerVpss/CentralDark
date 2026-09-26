import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const contract = readFileSync(join(DIR, 'AGENTS.md'), 'utf8');
const expected = [
  'Auto-Diagnostico', 'Critic', 'Deploy-Watcher', 'Executor',
  'GraphRAG-Master', 'Knowledge-Collector', 'Log-Verificador', 'Universal-Handler',
];

test('todos os agentes vivos são cobertos pelo contrato herdado', () => {
  const actual = readdirSync(DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();
  assert.deepEqual(actual, [...expected].sort());
  for (const name of expected) assert.match(contract, new RegExp(`\\b${name.replace('-', '\\-')}\\b`));
});

test('contrato proíbe variante paralela sem gap material', () => {
  assert.match(contract, /REUSE_BEFORE_CREATE=true/);
  assert.match(contract, /EXTEND_EXISTING=true/);
  assert.match(contract, /NEW_PARALLEL_CAPABILITY_WITHOUT_PROVED_GAP=BLOCK/);
  assert.match(contract, /UNKNOWN_SKIPPED_PENDING_ARE_NOT_PASS=true/);
});

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

test('pendência externa usa watch temporário read-only com limpeza verificável', () => {
  assert.match(contract, /TEMPORARY_EXTERNAL_WATCH=true/);
  assert.match(contract, /TEMP_WATCH_READ_ONLY=true/);
  assert.match(contract, /TEMP_WATCH_TARGET_MUTATION=false/);
  assert.match(contract, /TEMP_WATCH_REQUIRES_TERMINAL_CONDITION=true/);
  assert.match(contract, /TEMP_WATCH_REQUIRES_TIMEOUT=true/);
  assert.match(contract, /TEMP_WATCH_CLEANUP_REQUIRED=true/);
  assert.match(contract, /TEMP_WATCH_CLEANUP_MUST_BE_VERIFIED=true/);
  assert.match(contract, /SAME_SIGNAL_WITHOUT_NEW_INFORMATION=DROP_DUPLICATE/);
  assert.match(contract, /PERSISTENT_DAEMON_FOR_EPHEMERAL_WAIT=FORBIDDEN/);
  assert.match(contract, /UNSOLICITED_MONITOR_CREATION=FORBIDDEN/);
});

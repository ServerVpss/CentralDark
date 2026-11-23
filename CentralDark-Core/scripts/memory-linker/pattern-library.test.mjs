import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildPatternLibrary,
  queryPatternLibrary,
  readPatternLibrary,
  updatePatternLibrary,
} from './pattern-library.mjs';

const HEAD = 'a'.repeat(40);
const TARGET = 'docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md';

function candidate({
  fingerprint,
  session,
  source,
  claim,
  delta,
  kind = 'RULE',
  eligible = true,
  firstSeen = '2026-08-16T01:00:00.000Z',
  lastSeen = '2026-08-16T01:01:00.000Z',
}) {
  return {
    id: `dream-${fingerprint.slice(0, 16)}`,
    fingerprint,
    kind,
    target: TARGET,
    claim,
    learning_delta: delta,
    first_seen: firstSeen,
    last_seen: lastSeen,
    sources: [source],
    source_classes: ['TOOL_MEASURED'],
    session_ids: [session],
    observations: 1,
    verified_consumer_evidence_count: eligible ? 1 : 0,
    verified_owner_evidence_count: eligible ? 1 : 0,
    consumer_reachability: eligible ? 'EVIDENCED' : 'UNPROVEN',
    owner_reachability: eligible ? 'EVIDENCED' : 'UNPROVEN',
    promotion: {
      status: 'CANDIDATE',
      auto_absorb_eligible: eligible,
    },
    evidence: [{ type: 'receipt', value: 'should-not-be-copied-to-library' }],
  };
}

function proposal(candidates, generatedAt = '2026-08-16T01:02:00.000Z') {
  return {
    schema_version: 1,
    status: candidates.length ? 'CANDIDATE' : 'NO_NEW_INFORMATION',
    head_sha: HEAD,
    generated_at: generatedAt,
    candidates,
  };
}

test('uma aprendizagem isolada entra na gaveta certa sem virar padrão falso', () => {
  const first = candidate({
    fingerprint: '1'.repeat(64),
    session: 'session-a',
    source: 'tool:a',
    claim: 'Squash rápido do CHEFE exige remedir a main.',
    delta: 'reconciliar main apos squash rapido chefe antes de continuar',
  });

  const library = buildPatternLibrary(proposal([first]));
  assert.equal(library.pattern_count, 0);
  assert.equal(library.candidate_count, 1);
  assert.equal(library.session_count, 1);
  assert.equal(library.private_reasoning_included, false);
  assert.equal(library.raw_session_content_included, false);

  const rules = library.drawers.find((drawer) => drawer.kind === 'RULE');
  assert.equal(rules.label, 'Regras');
  assert.equal(rules.pattern_count, 0);
  assert.equal(rules.candidate_count, 1);
  assert.equal(rules.items[0].status, 'OBSERVING');
  assert.deepEqual(rules.items[0].how_to_use, [first.learning_delta]);
  assert.equal(JSON.stringify(library).includes('should-not-be-copied-to-library'), false);
});

test('duas sessões separadas viram padrão longitudinal na mesma gaveta', () => {
  const first = candidate({
    fingerprint: '1'.repeat(64),
    session: 'session-a',
    source: 'tool:a',
    claim: 'Squash rápido do CHEFE exige remedir a main.',
    delta: 'reconciliar main apos squash rapido chefe antes de continuar',
  });
  const second = candidate({
    fingerprint: '2'.repeat(64),
    session: 'session-b',
    source: 'tool:b',
    claim: 'Depois do squash do CHEFE a main nova vira baseline.',
    delta: 'reconciliar main depois squash rapido chefe antes de continuar',
    firstSeen: '2026-08-16T02:00:00.000Z',
    lastSeen: '2026-08-16T02:01:00.000Z',
  });

  const afterFirst = buildPatternLibrary(proposal([first]));
  const afterSecond = buildPatternLibrary(proposal([second], '2026-08-16T02:02:00.000Z'), afterFirst);

  assert.equal(afterSecond.candidate_count, 2);
  assert.equal(afterSecond.session_count, 2);
  assert.equal(afterSecond.source_count, 2);
  assert.equal(afterSecond.pattern_count, 1);

  const pattern = afterSecond.patterns[0];
  assert.equal(pattern.kind, 'RULE');
  assert.equal(pattern.target, TARGET);
  assert.equal(pattern.session_count, 2);
  assert.equal(pattern.status, 'READY_FOR_REVALIDATION');
  assert.equal(pattern.pattern_is_proof, false);
  assert.equal(pattern.same_head_revalidation_required, true);
  assert.equal(pattern.meta_lupa_required, true);

  const rules = afterSecond.drawers.find((drawer) => drawer.kind === 'RULE');
  assert.equal(rules.pattern_count, 1);
  assert.equal(rules.candidate_count, 0);
  assert.equal(rules.items[0].id, pattern.id);
});

test('arquivo runtime é persistente, idempotente e consultável', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-pattern-library-'));
  const filePath = path.join(dir, 'pattern-library.json');
  try {
    const first = candidate({
      fingerprint: '3'.repeat(64),
      session: 'session-c',
      source: 'tool:c',
      claim: 'Aprendizado material precisa ter owner.',
      delta: 'guardar aprendizado material no owner correto para reuso futuro',
      kind: 'MEMORY',
    });
    const input = proposal([first]);

    const writeOne = updatePatternLibrary(input, { filePath });
    const writeTwo = updatePatternLibrary(input, { filePath });
    assert.equal(writeOne.status, 'UPDATED');
    assert.equal(writeTwo.status, 'UNCHANGED');

    const loaded = readPatternLibrary(filePath);
    assert.equal(loaded.candidate_count, 1);
    assert.equal(queryPatternLibrary(loaded, 'owner correto').length, 1);
    assert.equal(queryPatternLibrary(loaded, 'nao-existe').length, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildHistoryDreamCounsel,
  buildHistoryEvent,
  writeHistoryCounselIdempotent,
} from './evolution-history-counsel.mjs';

const HEAD = 'a'.repeat(40);

function entry(overrides = {}) {
  return {
    id: 'evolution-2026-09-16-level-40',
    event_time: '2026-09-16T18:00:00Z',
    observed_at: '2026-09-16T18:00:00Z',
    title: 'Do caos operacional ao arquiteto de continuidade',
    level: 40,
    level_label: 'ARQUITETO DE CONTINUIDADE',
    xp_mode: 'SYMBOLIC',
    pain_points: ['falhas recorrentes', 'drift entre source e runtime'],
    capabilities: ['debug profundo', 'reconciliacao', 'orquestracao'],
    lessons: ['UNKNOWN != PASS', 'REUSE_BEFORE_CREATE', 'REALIDADE = JUIZ'],
    source_refs: ['chat:2026-09-16', 'pr:1549'],
    target: 'docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md',
    ...overrides,
  };
}

test('transforma historia em candidato de Dream Review e conselho sem ganhar autoridade', () => {
  const payload = buildHistoryDreamCounsel([entry()], { headSha: HEAD });
  assert.equal(payload.status, 'CANDIDATE');
  assert.equal(payload.event_count, 1);
  assert.equal(payload.dream_candidate_count, 1);
  assert.equal(payload.counsel_candidate_count, 1);
  assert.equal(payload.apply_allowed, false);
  assert.equal(payload.direct_canonical_mutation, false);
  assert.equal(payload.history_is_authority, false);
  assert.equal(payload.counsel_is_advisory_only, true);
  assert.equal(payload.dream_review_is_miner_not_authority, true);
  assert.equal(payload.contract.no_second_brain, true);
  assert.equal(payload.counsel[0].mode, 'ADVISORY_ONLY');
  assert.equal(payload.counsel[0].runtime_command_authorized, false);
  assert.equal(payload.dream.candidates[0].promotion.auto_absorb_eligible, false);
});

test('grafo cruza historia dream e conselho nos dois sentidos', () => {
  const payload = buildHistoryDreamCounsel([entry()], { headSha: HEAD });
  const relations = new Set(payload.graph.edges.map((edge) => edge.relation));
  assert.equal(payload.graph.bidirectional, true);
  assert.ok(relations.has('FEEDS_DREAM'));
  assert.ok(relations.has('DERIVED_FROM_HISTORY'));
  assert.ok(relations.has('FEEDS_COUNSEL'));
  assert.ok(relations.has('GROUNDED_IN_DREAM'));
  assert.equal(payload.graph.vertex_count, 3);
  assert.equal(payload.graph.edge_count, 4);
});

test('nivel e XP sao metadados simbolicos, nao prova operacional', () => {
  const event = buildHistoryEvent(entry(), { headSha: HEAD });
  assert.equal(event.history_meta.level, 40);
  assert.equal(event.history_meta.level_label, 'ARQUITETO DE CONTINUIDADE');
  assert.equal(event.history_meta.xp_mode, 'SYMBOLIC');
  assert.equal(event.source_class, 'HUMAN_AUTHORITY');
  assert.equal(event.owner_evidence.length, 0);
  assert.equal(event.consumer_evidence.length, 0);
});

test('nao fabrica historia sem licao reutilizavel', () => {
  assert.throws(
    () => buildHistoryEvent(entry({ lessons: [] }), { headSha: HEAD }),
    /LESSONS_REQUIRED/,
  );
});

test('amarra historia ao HEAD medido', () => {
  assert.throws(
    () => buildHistoryDreamCounsel([entry()], { headSha: 'curto' }),
    /HEAD_SHA_INVALID/,
  );
});

test('escrita derivada e idempotente', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evolution-history-'));
  const output = path.join(dir, 'counsel.json');
  try {
    const payload = buildHistoryDreamCounsel([entry()], { headSha: HEAD });
    assert.equal(writeHistoryCounselIdempotent(output, payload), 'UPDATED');
    const before = fs.readFileSync(output, 'utf8');
    const beforeMtime = fs.statSync(output).mtimeMs;
    assert.equal(writeHistoryCounselIdempotent(output, payload), 'UNCHANGED');
    assert.equal(fs.readFileSync(output, 'utf8'), before);
    assert.equal(fs.statSync(output).mtimeMs, beforeMtime);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function argValue(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
}

function clean(value, max = 12000) {
  return String(value ?? '').replace(/\u0000/g, '').slice(0, max);
}

function disposition(state) {
  switch (String(state || '').toUpperCase()) {
    case 'PROVEN':
    case 'PROVADO':
    case 'PASS':
      return 'CRYSTAL_GOLD';
    case 'FAIL':
    case 'QUEBRADO':
    case 'REFUTED':
      return 'REFUTED_MINERAL';
    case 'BLOCKED':
    case 'UNKNOWN':
    case 'EVIDENCIA_FALTANTE':
      return 'UNRESOLVED_MINERAL';
    case 'CANDIDATE':
      return 'ORE_CANDIDATE';
    case 'OBSERVED':
    case 'NO_DELTA':
    default:
      return 'MEMORY_MINERAL';
  }
}

function fromZendriveReceipt(raw) {
  const content = raw?.gateway_response?.choices?.[0]?.message?.content || '';
  const context = raw?.randolf_context || {};
  return {
    schema: 'centraldark.signal-watch.v1',
    mode: 'zendrive_code_review',
    state: content ? 'CANDIDATE' : 'UNKNOWN',
    source: 'zendrive_chatgpt_review',
    observed_at: new Date().toISOString(),
    subject: 'Zendrive / ChatGPT — revisão consultiva de código',
    findings: content ? [{
      id: 'ZENDRIVE_CODE_REVIEW',
      state: 'CANDIDATE',
      summary: clean(content, 8000),
      next: 'HERMES_REPRODUCE_TEST_AND_COUNTERPROVE',
    }] : [],
    provenance: {
      source_surface: context.source_surface || 'HERMES_DESKTOP_ZENDRIVE',
      session_id: context.session_id || null,
      profile_id: context.profile_id || null,
      head_sha: context.head_sha || null,
      owner: context.owner || null,
    },
    invariants: [
      'ZENDRIVE_REVIEWS_ONLY',
      'HERMES_PROVES_AND_TESTS',
      'REVIEW_IS_NOT_MERGE_AUTHORITY',
      'UNKNOWN_IS_NOT_PASS',
    ],
  };
}

async function loadInput() {
  const file = argValue('--event-file');
  if (file) return JSON.parse(await readFile(resolve(file), 'utf8'));
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  if (!data.trim()) throw new Error('use --event-file ou stdin JSON');
  return JSON.parse(data);
}

const raw = await loadInput();
const signal = raw?.schema === 'centraldark.zendrive-handoff.v1' ? fromZendriveReceipt(raw) : raw;
const state = signal?.state || 'UNKNOWN';
const findings = Array.isArray(signal?.findings) ? signal.findings : [];

const mineral = {
  schema: 'centraldark.learning-mineral.v1',
  observed_at: signal?.observed_at || new Date().toISOString(),
  source: clean(signal?.source || signal?.mode || 'unknown', 120),
  subject: clean(signal?.subject || '', 500),
  source_state: state,
  disposition: disposition(state),
  findings: findings.map((finding) => ({
    id: clean(finding?.id || 'UNNAMED_FINDING', 160),
    state: clean(finding?.state || 'UNKNOWN', 80),
    summary: clean(finding?.summary || '', 8000),
    next: clean(finding?.next || 'REMEASURE_WHEN_NEW_EVIDENCE_EXISTS', 500),
    mineral_disposition: disposition(finding?.state || state),
  })),
  provenance: signal?.provenance || null,
  law: {
    NEVER_DISCARD_LEARNING: true,
    REFUTED_BECOMES_MINERAL: true,
    NO_DELTA_BECOMES_MEMORY: true,
    CANDIDATE_IS_NOT_PROVEN: true,
    REVIEW_IS_NOT_PROOF: true,
    HERMES_MUST_REPRODUCE_AND_TEST: true,
    REOPEN_ONLY_WITH_NEW_CAUSAL_EVIDENCE: true,
  },
  next_cursor: findings[0]?.next || 'PRESERVE_AND_WAIT_FOR_DISCRIMINATING_EVIDENCE',
};

process.stdout.write(`${JSON.stringify(mineral, null, 2)}\n`);

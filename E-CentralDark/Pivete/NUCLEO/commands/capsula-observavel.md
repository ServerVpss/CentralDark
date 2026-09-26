# COMANDO - capsula-observavel.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\status\capsula-observavel.mjs
**SHA:** 89dee741128185d9
**Timestamp:** 2026-08-28T02:56:40.290594
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- current_run: runSummary,
- same_identity_per_run: guaranteeState(

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
import {
  chmodSync,
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOperationalScore } from './operational-score.mjs';

const PHASES = new Set(['PLAN', 'ACT', 'OBSERVE', 'CRITIQUE', 'REFINE', 'DECIDE']);
const STATUSES = new Set(['PASS', 'FAIL', 'UNKNOWN', 'ANOMALY', 'ACHADO_PENDENTE', 'BLOCKED']);
const BLOCK_REASONS = new Set([
  'CAPTURE_DEGRADED',
  'SECRET_EXPOSURE',
  'SANITIZE_FAILED',
  'SKIPPED',
  'GATE_FAILED',
  'AUTH_MISSING',
  'NO_EVENTS',
  'INVALID_EVENT',
  'CANDIDATE_DRIFT',
  'EVALUATOR_NOT_INDEPENDENT',
]);
const CHIEF_DECISIONS = new Set(['PENDING', 'APPROVED', 'REJECTED']);
const DIGEST_RE = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const HASH_RE = /^[a-f0-9]{64}$/;
const CAPABILITY_ID_RE = /^[A-Z0-9_:-]{1,80}$/;

export const EVENT_ALLOWED_KEYS = Object.freeze([
  'schema_version',
  'capsule_id',
  'run_id',
  'mission_id',
  'iteration',
  'timestamp_utc',
  'phase',
  'candidate_ref',
  'candidate_digest',
  'baseline_ref',
  'fixture_ref',
  'evaluator_ref',
  'writer',
  'event_actor',
  'action',
  'status',
  'reason',
  'chief_decision',
  'chief_receipt_ref',
  'chief_receipt_hash',
  'tests',
  'evidence_hash',
  'failure_observed',
  'failure_fingerprint',
  'new_failure_class',
  'correction_verified',
  'retained_after_retest',
  'false_green_found',
  'regression_found',
  'active_capabilities',
  'generalization',
  'retention',
]);

const EVENT_ALLOWED_KEY_SET = new Set(EVENT_ALLOWED_KEYS);
const TEST_ALLOWED_KEYS = new Set(['total', 'pass', 'fail', 'skipped']);
const RATIO_ALLOWED_KEYS = new Set(['pass', 'total']);

const CREDENTIAL_SHAPES = [
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9_-]{16,}/,
  /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/,
];

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function metric(numerator, denominator) {
  if (!isNonNegativeInteger(numerator) || !isNonNegativeInteger(denominator)) {
    return { numerator: null, denominator: null, percent: null, state: 'INVALID' };
  }
  if (denominator === 0) {
    return { numerator, denominator, percent: null, state: 'SEM_DENOMINADOR' };
  }
  return {
    numerator,
    denominator,
    percent: Number(((numerator / denominator) * 100).toFixed(2)),
    state: 'MEASURED',
  };
}

function looksLikeCredential(value) {
  return CREDENTIAL_SHAPES.some((pattern) => pattern.test(String(value ?? '')));
}

function containsCredentialShape(value) {
  if (typeof value === 'string') return looksLikeCredential(value);
  if (Array.isArray(value)) return value.some(containsCredentialShape);
  if (value && typeof value === 'object') return Object.values(value).some(containsCredentialShape);
  return false;
}

function rejectUnknownKeys(value, allowed, problem) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.keys(value).some((key) => !allowed.has(key)) ? [problem] : [];
}

function guaranteeState(measured, ok) {
  if (!measured) return 'UNKNOWN';
  return ok ? 'ENFORCED' : 'VIOLATED';
}

function normalizedCapabilities(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((item) => asString(item).toUpperCase())
    .filter(Boolean))];
}

export function parseJsonl(text) {
  const events = [];
  const errors = [];
  String(text ?? '')
    .split(/\r?\n/)
    .forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        events.push(JSON.parse(trimmed));
      } catch (error) {
        errors.push(`JSON_INVALID:${index + 1}:${error.message}`);
      }
    });
  return { events, errors };
}

export function validateEvent(event, index = 0) {
  const problems = [];
  const at = `EVENT_${index + 1}`;
  const requiredStrings = [
    'capsule_id',
    'run_id',
    'mission_id',
    'timestamp_utc',
    'candidate_ref',
    'candidate_digest',
    'baseline_ref',
    'fixture_ref',
    'evaluator_ref',
    'writer',
    'event_actor',
    'action',
    'evidence_hash',
  ];

  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return [`${at}:NOT_OBJECT`];
  }

  problems.push(...rejectUnknownKeys(event, EVENT_ALLOWED_KEY_SET, `${at}:UNKNOWN_FIELD_PRESENT`));
  if (containsCredentialShape(event)) problems.push(`${at}:CREDENTIAL_SHAPE_DETECTED`);

  if (event.schema_version !== 1) problems.push(`${at}:SCHEMA_VERSION`);
  for (const field of requiredStrings) {
    if (!asString(event[field])) problems.push(`${at}:REQUIRED_${field.toUpperCase()}`);
  }

  if (!PHASES.has(event.phase)) problems.push(`${at}:PHASE_INVALID`);
  if (!STATUSES.has(event.status)) problems.push(`${at}:STATUS_INVALID`);
 
```
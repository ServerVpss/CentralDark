# CONTRATO - dream-review.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\dream-review.mjs
**SHA:** cf75a1605e734ce9
**Timestamp:** 2026-08-28T02:57:36.719954
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- promotion_contract: {

### Gaps
- if (!Array.isArray(candidate?.evidence) || candidate.evidence.length === 0) errors.push(`CANDIDATE_EVIDENCE_MISSING:${id}`);
- if (!Array.isArray(candidate?.source_classes) || candidate.source_classes.length === 0) errors.push(`CANDIDATE_SOURCE_CLASS_MISSING:${id}`);
- errors.push(`AUTO_ABSORB_MEASURED_CONFIRMATION_MISSING:${id}`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWriteUtf8Sync } from './fs-safe.mjs';

const ALLOWED_KINDS = new Set(['MEMORY', 'SKILL', 'RULE', 'TEST', 'GUARDRAIL', 'CONTRACT']);
const SOURCE_CLASSES = new Set(['HUMAN_AUTHORITY', 'TOOL_MEASURED', 'INTERNAL', 'EXTERNAL_UNTRUSTED', 'UNDECLARED']);
const VERIFIED_EVIDENCE_TYPES = new Set(['TEST', 'RECEIPT', 'RUNTIME', 'OWNER', 'CONSUMER']);
const EXTERNAL_SOURCE_RE = /^(?:https?:\/\/|web:|email:|external:|fetched:|scrape:|scraped:|rss:)/i;
const SHA40_RE = /^[a-f0-9]{40}$/i;
const VALID_STATUSES = new Set(['CANDIDATE', 'NO_NEW_INFORMATION']);
const VALID_PROMOTION_STATUSES = new Set(['CANDIDATE', 'QUARANTINE']);

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeTimestamp(value) {
  const text = String(value ?? '').trim();
  if (!text || Number.isNaN(Date.parse(text))) return null;
  return new Date(text).toISOString();
}

export function sanitizeDreamText(value) {
  let text = String(value ?? '');
  const patterns = [
    [/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer [REDACTED]'],
    [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, '[REDACTED_GITHUB_TOKEN]'],
    [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/gi, '[REDACTED_GITHUB_TOKEN]'],
    [/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[REDACTED_PROVIDER_KEY]'],
    [/\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g, '[REDACTED_BOT_TOKEN]'],
    [/(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["']?[^\s"']{12,}/gi, '$1=[REDACTED]'],
  ];
  for (const [pattern, replacement] of patterns) text = text.replace(pattern, replacement);
  return text;
}

function sanitizeEvidence(value) {
  if (typeof value === 'string') return sanitizeDreamText(value);
  if (Array.isArray(value)) return value.map(sanitizeEvidence);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeEvidence(item)]));
  }
  return value;
}

function normalizeSourceClass(value) {
  const normalized = normalizeText(value).toUpperCase() || 'UNDECLARED';
  return SOURCE_CLASSES.has(normalized) ? normalized : null;
}

export function effectiveSourceClass(source, claimedClass) {
  const sourceText = normalizeText(source);
  if (EXTERNAL_SOURCE_RE.test(sourceText)) return 'EXTERNAL_UNTRUSTED';
  return normalizeSourceClass(claimedClass);
}

function isVerifiedEvidence(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const type = normalizeText(value.type).toUpperCase();
  const status = normalizeText(value.status).toUpperCase();
  const ref = normalizeText(value.ref ?? value.value ?? value.path ?? value.sha);
  return VERIFIED_EVIDENCE_TYPES.has(type) && value.verified === true && status === 'PASS' && ref.length > 0;
}

function normalizeEvent(raw, index, expectedHead) {
  const reject = (reason) => ({ ok: false, rejection: { index, reason } });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return reject('EVENT_NOT_OBJECT');

  const eventTime = normalizeTimestamp(raw.event_time ?? raw.timestamp);
  if (!eventTime) return reject('EVENT_TIME_INVALID');
  const observedAt = normalizeTimestamp(raw.observed_at ?? raw.timestamp ?? raw.event_time);
  if (!observedAt) return reject('OBSERVED_AT_INVALID');

  const source = normalizeText(raw.source);
  if (!source) return reject('SOURCE_MISSING');
  const claimedSourceClass = normalizeSourceClass(raw.source_class);
  if (!claimedSourceClass) return reject('SOURCE_CLASS_INVALID');
  const sourceClass = effectiveSourceClass(source, claimedSourceClass);
  if (!sourceClass) return reject('SOURCE_CLASS_INVALID');

  const sessionId = normalizeText(raw.session_id ?? raw.sessionId);
  if (!sessionId) return reject('SESSION_ID_MISSING');

  const claim = normalizeText(raw.claim ?? raw.content);
  if (!claim) return reject('CLAIM_MISSING');

  const learningDelta = normalizeText(raw.learning_delta ?? raw.delta);
  if (!learningDelta) return reject('LEARNING_DELTA_MISSING');

  if (!Array.isArray(raw.evidence) || raw.evidence.length === 0) return reject('EVIDENCE_MISSING');

  const eventHead = normalizeText(raw.head_sha ?? raw.canonical_head);
  if (!eventHead) return reject('EVENT_HEAD_MISSING');
  if (!SHA40_RE.test(eventHead)) return reject('EVENT_HEAD_INVALID');
  if (eventHead.toLowerCase() !== expectedHead.toLowerCase()) return reject('HEAD_MISMATCH');

  const rawKind = normalizeText(raw.kind).toUpperCase();
  const kind = ALLOW
```
#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { sanitizeDreamText } from './dream-review.mjs';

const SHA40_RE = /^[0-9a-f]{40}$/i;
const SHA256_RE = /^[0-9a-f]{64}$/i;
const EXEC = new Set(['.exe', '.dll', '.msi', '.bin', '.so', '.dylib', '.appimage']);
const CODE = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.rs', '.go', '.java', '.cs', '.c', '.cpp', '.h', '.hpp', '.ps1', '.sh']);
const DOC = new Set(['.md', '.txt', '.rst', '.pdf', '.doc', '.docx', '.odt', '.rtf']);
const MEDIA = new Set(['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.mp4', '.mov', '.mkv', '.webm']);
const IMAGE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg']);
const STRUCTURED = new Set(['.json', '.yaml', '.yml', '.toml', '.xml']);
const ORE_CLASSES = Object.freeze(new Set([
  'API_SPEC', 'SCHEMA', 'EXECUTABLE_BINARY', 'LOG', 'SOURCE_CODE', 'MEDIA', 'IMAGE', 'DOCUMENT', 'STRUCTURED_DATA',
  'BROWSER_OBSERVATION', 'CONVERSATION', 'COMMENT', 'FEEDBACK', 'COMMIT', 'PULL_REQUEST', 'ISSUE', 'RUNTIME_EVENT', 'UNKNOWN',
]));

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function inline(value, max = 280) {
  return sanitizeDreamText(String(value ?? '')).replace(/\s+/g, ' ').trim().slice(0, max);
}

function sourceText(content, metadata = {}) {
  return sanitizeDreamText([
    content,
    metadata.extracted_text,
    metadata.help_text,
    metadata.transcript,
    metadata.description,
    metadata.interface_text,
    metadata.observation_text,
    metadata.console_text,
    metadata.network_text,
    metadata.performance_text,
    metadata.comment_text,
    metadata.feedback_text,
  ].filter((value) => typeof value === 'string' && value.trim()).join('\n')).slice(0, 512_000);
}

function firstLine(text, re) {
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (line && re.test(line)) return inline(line);
  }
  return null;
}

function addSignal(list, id, evidence) {
  const clean = inline(evidence);
  if (!clean) return;
  if (list.some((item) => item.id === id && item.evidence.toLowerCase() === clean.toLowerCase())) return;
  list.push({ id, evidence: clean });
}

export function classifyArtifact({ artifactPath = '', mime = '', content = '', metadata = {} } = {}) {
  const explicit = String(metadata.material_class || metadata.source_class || '').trim().toUpperCase();
  if (ORE_CLASSES.has(explicit) && explicit !== 'UNKNOWN') return explicit;
  const ext = path.extname(String(artifactPath || '')).toLowerCase();
  const m = String(mime || metadata.mime || '').toLowerCase();
  const text = sourceText(content, metadata);
  if (metadata.browser_observation === true || /\b(?:console|network request|performance trace|lighthouse|page snapshot|devtools)\b/i.test(text)) return 'BROWSER_OBSERVATION';
  if (/\b(?:openapi|swagger)\s*[:"]/i.test(text) || m.includes('openapi')) return 'API_SPEC';
  if (STRUCTURED.has(ext) && /\$schema|json schema|schema_version/i.test(text)) return 'SCHEMA';
  if (EXEC.has(ext) || m.includes('x-msdownload') || m === 'application/octet-stream') return 'EXECUTABLE_BINARY';
  if (ext === '.log' || ext === '.trace' || m.startsWith('text/x-log')) return 'LOG';
  if (CODE.has(ext) || /javascript|typescript|python/.test(m)) return 'SOURCE_CODE';
  if (MEDIA.has(ext) || m.startsWith('audio/') || m.startsWith('video/')) return 'MEDIA';
  if (IMAGE.has(ext) || m.startsWith('image/')) return 'IMAGE';
  if (DOC.has(ext) || m.startsWith('text/') || m.includes('pdf')) return 'DOCUMENT';
  if (STRUCTURED.has(ext)) return 'STRUCTURED_DATA';
  return 'UNKNOWN';
}

export function extractCapabilitySignals({ artifactClass, content = '', metadata = {} } = {}) {
  const text = sourceText(content, metadata);
  const signals = [];
  for (const capability of Array.isArray(metadata.capabilities) ? metadata.capabilities : []) {
    addSignal(signals, 'EXPLICIT_CAPABILITY_DECLARATION', typeof capability === 'string' ? capability : JSON.stringify(stableValue(capability)));
  }
  const rules = [
    ['CLI_INTERFACE', /\b(?:usage|uso|options|op[cç][oõ]es|commands|comandos|flags|arguments|argumentos)\b/i],
    ['SAFETY_CONSTRAINTS', /\b(?:warning|caution|danger|safety|seguran[cç]a|aviso|aten[cç][aã]o|perigo)\b/i],
    ['PROCEDURE', /\b(?:step|steps|passo|passos|procedure|procedimento|instru[cç][aã]o|instru[cç][oõ]es|how to|modo de usar)\b/i],
    ['ERROR_CONTRACT', /\b(?:error|erro|failure|falha|exception|exce[cç][aã]o|exit code|c[oó]digo de sa[ií]da|troubleshoot|diagn[oó]stico)\b/i],
    ['MAINTENANCE', /\b(?:maintenance|manuten[cç][aã]o|cleaning|limpeza|service interval)\b/i],
    ['PRIVILEGE_OR_PERMISSION', /\b(?:least privilege|privil[eé]gio m[ií]nimo|permission|permiss[aã]o|administrator|admin|elevation|eleva[cç][aã]o)\b/i],
    ['APPLICATION_CONTROL', /\b(?:application control|controle de aplica[cç][aã]o|allowlist|denylist|quarantine|quarentena)\b/i],
    ['OBSERVABILITY_OR_RESPONSE', /\b(?:monitoring|monitoramento|edr|telemetry|telemetria|incident response|resposta a incidente)\b/i],
  ];
  for (const [id, re] of rules) {
    const evidence = firstLine(text, re);
    if (evidence) addSignal(signals, id, evidence);
  }
  if (artifactClass === 'API_SPEC') addSignal(signals, 'API_CONTRACT', firstLine(text, /openapi|swagger|paths|endpoint|responses?/i) || 'API specification detected');
  if (artifactClass === 'SCHEMA') addSignal(signals, 'DATA_SCHEMA', firstLine(text, /\$schema|schema_version|required|properties|type/i) || 'Structured schema detected');
  if (artifactClass === 'LOG') {
    const evidence = firstLine(text, /error|fatal|exception|traceback|failed|failure|warning|warn/i);
    if (evidence) addSignal(signals, 'DIAGNOSTIC_SIGNAL', evidence);
  }
  if (artifactClass === 'SOURCE_CODE') {
    const evidence = firstLine(text, /export\s+(?:async\s+)?function|\bfunction\b|\bclass\b|\binterface\b|\bdef\b|\bfn\b|\bfunc\b/i);
    if (evidence) addSignal(signals, 'CODE_INTERFACE', evidence);
  }
  if (artifactClass === 'EXECUTABLE_BINARY') {
    const evidence = metadata.help_text || metadata.interface_text || metadata.observed_invocation;
    if (inline(evidence)) addSignal(signals, 'EXECUTABLE_WRAPPER', evidence);
  }
  if (artifactClass === 'MEDIA' && inline(metadata.transcript)) addSignal(signals, 'TRANSCRIPT_AVAILABLE', metadata.transcript);
  if (artifactClass === 'IMAGE' && inline(metadata.description)) addSignal(signals, 'VISUAL_OBSERVATION', metadata.description);
  if (artifactClass === 'BROWSER_OBSERVATION') {
    addSignal(signals, 'BROWSER_DEBUGGING_OBSERVATION', metadata.observation_text || metadata.description || firstLine(text, /console|network|performance|lighthouse|snapshot|devtools/i));
    if (inline(metadata.console_text)) addSignal(signals, 'BROWSER_CONSOLE_SIGNAL', metadata.console_text);
    if (inline(metadata.network_text)) addSignal(signals, 'BROWSER_NETWORK_SIGNAL', metadata.network_text);
    if (inline(metadata.performance_text)) addSignal(signals, 'BROWSER_PERFORMANCE_SIGNAL', metadata.performance_text);
  }
  if (['CONVERSATION', 'COMMENT', 'FEEDBACK'].includes(artifactClass)) {
    const evidence = metadata.feedback_text || metadata.comment_text || metadata.description || content;
    if (inline(evidence)) addSignal(signals, 'HUMAN_FEEDBACK_SIGNAL', evidence);
  }
  if (['COMMIT', 'PULL_REQUEST', 'ISSUE', 'RUNTIME_EVENT'].includes(artifactClass)) {
    const evidence = metadata.description || metadata.observation_text || content;
    if (inline(evidence)) addSignal(signals, 'OPERATIONAL_EVENT_SIGNAL', evidence);
  }
  return signals.sort((a, b) => `${a.id}\u0000${a.evidence}`.localeCompare(`${b.id}\u0000${b.evidence}`));
}

function digest(content, metadata) {
  const supplied = String(metadata.sha256 || '').trim().toLowerCase();
  if (SHA256_RE.test(supplied)) return { sha256: supplied, kind: 'ARTIFACT_SHA256' };
  return { sha256: sha256(Buffer.from(sourceText(content, metadata), 'utf8')), kind: 'MINED_TEXT_SHA256' };
}

export function compileArtifactCapability({ artifactPath = '', mime = '', content = '', metadata = {}, source = '', target = '' } = {}) {
  const artifactClass = classifyArtifact({ artifactPath, mime, content, metadata });
  const signals = extractCapabilitySignals({ artifactClass, content, metadata });
  const artifactDigest = digest(content, metadata);
  const needs = [];
  if (artifactClass === 'EXECUTABLE_BINARY' && !signals.some((item) => ['EXECUTABLE_WRAPPER', 'CLI_INTERFACE'].includes(item.id))) needs.push('INTERFACE_OR_HELP_OR_OBSERVED_INVOCATION');
  if (artifactClass === 'MEDIA' && !inline(metadata.transcript)) needs.push('TRANSCRIPT_OR_VERIFIED_OBSERVATION');
  if (artifactClass === 'IMAGE' && !inline(metadata.description)) needs.push('VERIFIED_VISUAL_OBSERVATION');
  if (artifactClass === 'BROWSER_OBSERVATION' && !signals.some((item) => item.id.startsWith('BROWSER_'))) needs.push('VERIFIED_BROWSER_OBSERVATION');
  if (signals.length === 0 && needs.length === 0) needs.push('EXPLICIT_CAPABILITY_EVIDENCE');
  const status = signals.length === 0 ? 'INSUFFICIENT_EVIDENCE' : (inline(target) ? 'CANDIDATE' : 'OWNER_UNRESOLVED');
  const capabilityFingerprint = sha256(Buffer.from(JSON.stringify(stableValue({
    artifact_class: artifactClass,
    signals: signals.map((item) => ({ id: item.id, evidence: item.evidence.toLowerCase() })),
  })), 'utf8'));
  return {
    schema_version: 1,
    mode: 'ARTIFACT_CAPABILITY_ADAPTER',
    ore_contract: {
      any_input_is_possible_ore: true,
      everything_can_teach: true,
      source_is_not_authority: true,
      promotion_is_not_universal: true,
      gold_requires_proof: true,
      crystal_requires_reusable_proven_delta: true,
    },
    status,
    artifact: {
      path_hint: artifactPath ? path.basename(String(artifactPath)) : null,
      mime: inline(mime || metadata.mime) || null,
      class: artifactClass,
      sha256: artifactDigest.sha256,
      digest_kind: artifactDigest.kind,
      size_bytes: Number.isFinite(Number(metadata.size_bytes)) ? Number(metadata.size_bytes) : null,
      binary: metadata.binary === true || artifactClass === 'EXECUTABLE_BINARY',
      content_truncated: metadata.content_truncated === true,
    },
    source_on_demand: inline(source, 500) || null,
    target_owner: inline(target, 240) || null,
    capability_fingerprint: capabilityFingerprint,
    capability_signals: signals,
    needs,
    execute_artifact: false,
    direct_skill_write: false,
    direct_canonical_mutation: false,
    apply_allowed: false,
    source_is_authority: false,
    promotion_contract: {
      candidate_only: true,
      existing_owner_required: true,
      consumer_evidence_required: true,
      meta_lupa_required: true,
      counterproof_required: true,
      same_head_revalidation_required: true,
      source_on_demand_preserved: true,
      dedupe_required: true,
      test_required: true,
      proof_before_crystal: true,
    },
  };
}

function timestamp(value, fallback) {
  const text = String(value || fallback || '').trim();
  if (!text || Number.isNaN(Date.parse(text))) return '1970-01-01T00:00:00.000Z';
  return new Date(text).toISOString();
}

export function compileArtifactToDreamEvent({
  artifactPath = '', mime = '', content = '', metadata = {}, source = '', sourceClass = 'UNDECLARED', target = '', headSha,
  sessionId = '', eventTime = '', observedAt = '', evidence = [], ownerEvidence = [], consumerEvidence = [],
} = {}) {
  if (!SHA40_RE.test(String(headSha || ''))) throw new TypeError('HEAD_SHA_INVALID');
  const contract = compileArtifactCapability({ artifactPath, mime, content, metadata, source, target });
  if (contract.status !== 'CANDIDATE') return { contract, dream_event: null };
  const sourceRef = inline(source, 500) || `artifact:sha256:${contract.artifact.sha256}`;
  const eventTimestamp = timestamp(eventTime, metadata.modified_at);
  const observed = timestamp(observedAt, eventTimestamp);
  const signalIds = contract.capability_signals.map((item) => item.id).join(',');
  return {
    contract,
    dream_event: {
      timestamp: eventTimestamp,
      event_time: eventTimestamp,
      observed_at: observed,
      source: sourceRef,
      source_class: inline(sourceClass, 40) || 'UNDECLARED',
      session_id: inline(sessionId, 160) || `artifact-${contract.artifact.sha256.slice(0, 16)}`,
      head_sha: String(headSha).toLowerCase(),
      kind: 'SKILL',
      target: inline(target, 240),
      claim: `Artefato ${contract.artifact.class} contém sinais de capacidade reutilizável: ${signalIds}.`,
      learning_delta: `ARTIFACT_CAPABILITY_FINGERPRINT=${contract.capability_fingerprint}; SIGNALS=${signalIds}; DIRECT_SKILL_WRITE=0; EXECUTE_ARTIFACT=0; SOURCE_ON_DEMAND=${sourceRef}`,
      evidence: [{
        type: 'RECEIPT', status: 'PASS', verified: true, ref: `artifact-sha256:${contract.artifact.sha256}`,
        semantics: 'ARTIFACT_IDENTITY_ONLY_NOT_CAPABILITY_PROOF',
      }, ...evidence],
      owner_evidence: ownerEvidence,
      consumer_evidence: consumerEvidence,
    },
  };
}

function looksBinary(buffer) {
  if (!buffer.length) return false;
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  if (sample.includes(0)) return true;
  let control = 0;
  for (const byte of sample) if (byte < 9 || (byte > 13 && byte < 32)) control += 1;
  return control / sample.length > 0.15;
}

function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.allocUnsafe(64 * 1024);
  try {
    let read = 0;
    do {
      read = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (read > 0) hash.update(buffer.subarray(0, read));
    } while (read > 0);
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest('hex');
}

export function loadArtifactForMining(filePath, { maxTextBytes = 256 * 1024 } = {}) {
  const resolved = path.resolve(String(filePath || ''));
  const stats = fs.lstatSync(resolved);
  if (stats.isSymbolicLink()) throw new Error('ARTIFACT_SYMLINK_FORBIDDEN');
  if (!stats.isFile()) throw new Error('ARTIFACT_NOT_REGULAR_FILE');
  const prefix = Buffer.alloc(Math.min(Math.max(0, maxTextBytes), stats.size));
  const fd = fs.openSync(resolved, 'r');
  try {
    if (prefix.length) fs.readSync(fd, prefix, 0, prefix.length, 0);
  } finally {
    fs.closeSync(fd);
  }
  const binary = looksBinary(prefix);
  return {
    artifactPath: resolved,
    content: binary ? '' : prefix.toString('utf8'),
    metadata: {
      sha256: hashFile(resolved),
      size_bytes: stats.size,
      binary,
      content_truncated: stats.size > prefix.length,
      modified_at: stats.mtime.toISOString(),
    },
  };
}

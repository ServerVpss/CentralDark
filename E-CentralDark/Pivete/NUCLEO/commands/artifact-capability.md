# COMANDO - artifact-capability.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\artifact-capability.mjs
**SHA:** 22291ae620020703
**Timestamp:** 2026-08-28T02:57:36.544986
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- ore_contract: {
- promotion_contract: {
- const contract = compileArtifactCapability({ artifactPath, mime, content, metadata, source, target });

### Ouro Bruto (primeiros 5000 chars)
```
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
    ['PRIVILEGE_OR_PERMISSIO
```
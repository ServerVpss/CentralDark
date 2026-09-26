# COMANDO - schema.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\artifacts-builder\core\schema.mjs
**SHA:** 276b3521a4e524a6
**Timestamp:** 2026-08-28T02:56:07.453985
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if (artifact[field] === undefined || artifact[field] === null) errors.push(`FIELD_MISSING:${field}`);

### Ouro Bruto (primeiros 5000 chars)
```
// 📐 Contrato universal de artefato — CentralDark.
//
// Todo artefato produzido por qualquer agente (Claude, GPT, Gemini, Codex,
// Hermes ou modelo local) deve satisfazer este schema antes de entrar na
// biblioteca. Título bonito não é identidade — `artifact_id` e os digests
// são determinísticos a partir do conteúdo real, não de texto decorativo.
//
// Estende (não substitui) o manifest.json já em produção (`nome/tipo/slug/
// tema/criado/rotas/descricao`) — os 13 artefatos existentes continuam
// válidos sem regeneração; os campos abaixo são aditivos para artefatos
// novos, per REUSE_BEFORE_CREATE / zero regressão.

import crypto from 'node:crypto';
import { classifyPaths } from './security.mjs';

export const ARTIFACT_SCHEMA_VERSION = 1;

export const ARTIFACT_STATES = ['PROVED', 'PARTIAL', 'BLOCKED', 'UNPROVEN', 'HISTORICAL'];

const REQUIRED_TOP = ['artifact_type', 'title', 'slug', 'purpose', 'producer', 'source', 'state'];

/** Ordena chaves recursivamente para que o mesmo conteúdo sempre produza o
 * mesmo digest, independente da ordem em que os campos foram montados. */
function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, key) => {
      acc[key] = canonicalize(value[key]);
      return acc;
    }, {});
  }
  return value;
}

/** Digest determinístico do conteúdo do artefato (não inclui timestamps
 * nem campos de identidade — dois builds do mesmo conteúdo real produzem o
 * mesmo `content_digest`, exatamente como o `artifact_digest` de #668). */
export function computeContentDigest(artifact) {
  const payload = JSON.stringify(canonicalize({
    artifact_type: artifact.artifact_type,
    title: artifact.title,
    purpose: artifact.purpose,
    story: artifact.story ?? null,
    source: artifact.source,
    evidence: artifact.evidence ?? [],
    views: artifact.views ?? {},
  }));
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/** `artifact_id` determinístico: mesmo produtor + mesma fonte + mesmo slug
 * sempre resolve para o mesmo ID, mesmo em rebuilds. */
export function computeArtifactId(artifact) {
  const payload = JSON.stringify(canonicalize({
    slug: artifact.slug,
    artifact_type: artifact.artifact_type,
    source: artifact.source,
  }));
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 24);
}

/** Digest do recibo: cobre o artefato inteiro + o resultado da validação de
 * segurança, para provar que o que foi publicado é exatamente o que passou
 * pelo gate — não um artefato editado depois do scan. */
export function computeReceiptDigest(artifact, security) {
  const payload = JSON.stringify(canonicalize({ content_digest: artifact.content_digest, security }));
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/** Valida o envelope mínimo. Retorna `{ ok, errors }` — nunca lança, para
 * que o chamador decida o que fazer com `BLOCKED` (fail-closed, nunca
 * silenciosamente promovido a PASS). Campo desconhecido/faltando vira erro
 * explícito, nunca `UNKNOWN` tratado como aprovado. */
export function validateArtifact(artifact) {
  const errors = [];
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    return { ok: false, errors: ['ARTIFACT_NOT_OBJECT'] };
  }
  for (const field of REQUIRED_TOP) {
    if (artifact[field] === undefined || artifact[field] === null) errors.push(`FIELD_MISSING:${field}`);
  }
  if (artifact.artifact_schema_version !== ARTIFACT_SCHEMA_VERSION) {
    errors.push(`SCHEMA_VERSION_MISMATCH:${artifact.artifact_schema_version}`);
  }
  if (typeof artifact.slug !== 'string' || !/^[a-z0-9-]{3,80}$/.test(artifact.slug)) {
    errors.push('SLUG_INVALID');
  }
  if (artifact.state && !ARTIFACT_STATES.includes(artifact.state)) {
    errors.push(`STATE_INVALID:${artifact.state}`);
  }
  const source = artifact.source ?? {};
  if (source.head_sha && !/^[0-9a-f]{40}$/i.test(String(source.head_sha))) {
    errors.push('SOURCE_HEAD_SHA_INVALID');
  }
  const producer = artifact.producer ?? {};
  if (!producer.agent) errors.push('PRODUCER_AGENT_MISSING');
  // model/writer_session ausentes ficam UNKNOWN explícito, não erro —
  // nem todo produtor consegue provar sessão, mas precisa DECLARAR isso.
  if (producer.model === undefined) errors.push('PRODUCER_MODEL_FIELD_MISSING_USE_UNKNOWN');
  if (producer.writer_session === undefined) errors.push('PRODUCER_WRITER_SESSION_FIELD_MISSING_USE_UNKNOWN');

  const refs = Array.isArray(artifact.source?.source_refs) ? artifact.source.source_refs : [];
  const categories = classifyPaths(refs);
  const sensitiveBlocked = categories.sensitive_paths > 0;
  if (sensitiveBlocked) errors.push('SENSITIVE_PATH_IN_SOURCE_REFS');

  return { ok: errors.length === 0, errors, categories, sensitiveBlocked };
}

/** Monta o registro completo do artefato (schema + IDs + digests), pronto
 * para gravar em manifest.json. Nã
```
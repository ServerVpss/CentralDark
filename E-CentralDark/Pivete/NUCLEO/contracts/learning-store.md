# CONTRATO - learning-store.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\audit-rigor\qa.teste-de-software.MARKDOWN\runtime\learning-store.mjs
**SHA:** b437e62d6082ad02
**Timestamp:** 2026-08-26T19:10:24.295630
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: record.pattern,
- pattern: normalizeText(record.pattern),
- pattern: entry.pattern,
- pattern: record.pattern,

### Contratos
- const contract = validateLearningContract(record);

### Gaps
- const missing = [];
- return { promoted: false, reason: "TENTATIVA_VERMELHA", id: null, missing: [] };
- if (!validation.valid) return { promoted: false, reason: "PROVA_INCOMPLETA", id: null, missing: validation.missing };
- missing: ["RECEIPT_VALIDO_E_VINCULADO"],

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * learning-store.mjs — memória causal, content-addressed, deduplicada e fail-closed.
 * Palavras PASS, proven=true ou sourceIds textuais isolados nunca promovem nada.
 */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { hashObject, normalizeText, sanitizeObject, sanitizeText, stableStringify } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LEARNING_DIR = path.join(ROOT, "learning");
const PLACEHOLDER_SOURCE = /^(?:inventado|banana|fake|falso|dummy|placeholder|example|exemplo|unknown|desconhecido|skipped|n\/?a)$/i;
const RECEIPT_ID = /^receipt:([a-f0-9]{64})$/i;
const COMMIT_ID = /^commit:([a-f0-9]{40}|[a-f0-9]{64})$/i;
const HEAD_SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;

function statusIs(value, expected) {
  if (typeof value === "string") return value.trim().toUpperCase() === expected;
  if (value && typeof value === "object") {
    if (typeof value.status === "string") return value.status.trim().toUpperCase() === expected;
    if (expected === "PASS" && value.exitCode === 0) return true;
    if (expected === "FAIL" && Number.isInteger(value.exitCode) && value.exitCode !== 0) return true;
  }
  return false;
}

function exactZero(value) {
  return (typeof value === "number" && Number.isFinite(value) && value === 0)
    || (typeof value === "string" && value.trim() === "0");
}

function known(value) {
  const normalized = normalizeText(value);
  return Boolean(normalized) && !["unknown", "skipped", "n a", "na", "n/a"].includes(normalized);
}

function sourceIdKind(value) {
  const text = String(value || "").trim();
  if (!text || PLACEHOLDER_SOURCE.test(text)) return null;
  if (RECEIPT_ID.test(text)) return "receipt";
  if (COMMIT_ID.test(text)) return "commit";
  return null;
}

function sourceIdsOf(record) {
  return Array.isArray(record.sourceIds) ? record.sourceIds : record.sourceIds ? [record.sourceIds] : [];
}

function proofPayload(record = {}) {
  return {
    pattern: record.pattern,
    errorExact: record.errorExact,
    cause: record.cause,
    fix: record.fix,
    testBefore: record.testBefore,
    testAfter: record.testAfter,
    regression: record.regression,
    negativeCase: record.negativeCase,
    fail: record.fail,
    skipped: record.skipped,
    unknown: record.unknown,
    filesOutOfScope: record.filesOutOfScope,
    finalHead: String(record.finalHead || "").toLowerCase(),
    rollback: record.rollback || null,
    reversible: record.reversible === true,
  };
}

export function learningContractDigest(record = {}) {
  return hashObject(proofPayload(record));
}

export function validateLearningContract(record = {}) {
  const missing = [];
  const has = (key) => Object.prototype.hasOwnProperty.call(record, key);
  if (record.proven !== true) missing.push("PROVEN_TRUE");
  if (String(record.estado || "").toUpperCase() !== "VERDE_CONSOLIDADO") missing.push("ESTADO_VERDE_CONSOLIDADO");
  if (!normalizeText(record.pattern)) missing.push("PATTERN");
  if (!normalizeText(record.errorExact)) missing.push("ERRO_EXATO");
  if (!normalizeText(record.cause)) missing.push("CAUSA");
  if (!normalizeText(record.fix)) missing.push("CORRECAO_MINIMA");

  const sourceIds = sourceIdsOf(record);
  const sourceKinds = sourceIds.map(sourceIdKind);
  if (sourceIds.length === 0 || sourceKinds.some((kind) => !kind)) missing.push("SOURCE_IDS_COM_PROVENIENCIA");
  if (!sourceKinds.includes("receipt")) missing.push("RECEIPT_CONTENT_ADDRESSED_REQUIRED");
  if (!statusIs(record.testBefore, "FAIL")) missing.push("TESTE_ANTES_FAIL");
  if (!statusIs(record.testAfter, "PASS")) missing.push("TESTE_DEPOIS_PASS");
  if (!statusIs(record.regression, "PASS")) missing.push("REGRESSAO_PASS");
  if (!statusIs(record.negativeCase, "PASS")) missing.push("CASO_NEGATIVO_PASS");
  if (!has("fail") || !exactZero(record.fail)) missing.push("FAIL_ZERO");
  if (!has("skipped") || !exactZero(record.skipped)) missing.push("SKIPPED_ZERO");
  if (!has("unknown") || !exactZero(record.unknown)) missing.push("UNKNOWN_ZERO");
  if (!has("filesOutOfScope") || !exactZero(record.filesOutOfScope)) missing.push("ARQUIVOS_FORA_ESCOPO_ZERO");
  if (!HEAD_SHA.test(String(record.finalHead || "").trim())) missing.push("HEAD_FINAL_SHA");
  if (!(record.reversible === true || known(record.rollback))) missing.push("ROLLBACK_OU_REVERSIBILIDADE");
  return { valid: missing.length === 0, missing };
}

export async function ensureLearningDir(learningDir = DEFAULT_LEARNING_DIR) {
  await fs.mkdir(learningDir, { recursive: true });
  await fs.mkdir(path.join(learningDir, "receipts"), { recursive: true });
}

function sha256Bytes(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function receiptDirOf(learningDir, options = {}) {
  return options.receiptDir || path.join(learningDir, "receipts");
}

/**
 * Cria recibo content-addressed ligado a
```

---

# CONTRATO - learning-store.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\qa_skillmaster_audit\qa.teste-de-software.MARKDOWN\runtime\learning-store.mjs
**SHA:** 6709904a52e139c5
**Timestamp:** 2026-08-26T19:10:27.359136
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: normalizeText(record.pattern),
- pattern: record.pattern,

### Gaps
- const missing = [];
- return { promoted: false, reason: "TENTATIVA_VERMELHA", id: null, missing: [] };
- return { promoted: false, reason: "PROVA_INCOMPLETA", id: null, missing: validation.missing };

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * learning-store.mjs — memória causal, determinística e deduplicada.
 * `proven=true` sozinho nunca promove nada.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashObject, normalizeText, sanitizeObject, sanitizeText } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LEARNING_DIR = path.join(ROOT, "learning");

function statusIs(value, expected) {
  if (typeof value === "string") return value.toUpperCase() === expected;
  if (value && typeof value === "object") {
    if (typeof value.status === "string") return value.status.toUpperCase() === expected;
    if (expected === "PASS" && value.exitCode === 0) return true;
    if (expected === "FAIL" && Number.isInteger(value.exitCode) && value.exitCode !== 0) return true;
  }
  return false;
}

export function validateLearningContract(record = {}) {
  const missing = [];
  const has = (key) => Object.prototype.hasOwnProperty.call(record, key);
  const known = (value) => {
    const normalized = normalizeText(value);
    return normalized && !["unknown", "skipped", "n a", "na", "n/a"].includes(normalized);
  };
  if (record.proven !== true) missing.push("PROVEN_TRUE");
  if (String(record.estado || "").toUpperCase() !== "VERDE_CONSOLIDADO") missing.push("ESTADO_VERDE_CONSOLIDADO");
  if (!normalizeText(record.pattern)) missing.push("PATTERN");
  if (!normalizeText(record.errorExact)) missing.push("ERRO_EXATO");
  if (!normalizeText(record.cause)) missing.push("CAUSA");
  if (!normalizeText(record.fix)) missing.push("CORRECAO_MINIMA");
  const sourceIds = Array.isArray(record.sourceIds) ? record.sourceIds : record.sourceIds ? [record.sourceIds] : [];
  if (sourceIds.length === 0 || sourceIds.some((value) => !known(value))) missing.push("SOURCE_IDS");
  if (!statusIs(record.testBefore, "FAIL")) missing.push("TESTE_ANTES_FAIL");
  if (!statusIs(record.testAfter, "PASS")) missing.push("TESTE_DEPOIS_PASS");
  if (!statusIs(record.regression, "PASS")) missing.push("REGRESSAO_PASS");
  if (!statusIs(record.negativeCase, "PASS")) missing.push("CASO_NEGATIVO_PASS");
  if (!has("fail") || Number(record.fail) !== 0) missing.push("FAIL_ZERO");
  if (!has("skipped") || Number(record.skipped) !== 0) missing.push("SKIPPED_ZERO");
  if (!has("unknown") || Number(record.unknown) !== 0) missing.push("UNKNOWN_ZERO");
  if (!has("filesOutOfScope") || Number(record.filesOutOfScope) !== 0) missing.push("ARQUIVOS_FORA_ESCOPO_ZERO");
  if (!known(record.finalHead)) missing.push("HEAD_FINAL");
  if (!(record.reversible === true || known(record.rollback))) missing.push("ROLLBACK_OU_REVERSIBILIDADE");
  return { valid: missing.length === 0, missing };
}

export async function ensureLearningDir(learningDir = DEFAULT_LEARNING_DIR) {
  await fs.mkdir(learningDir, { recursive: true });
}

function fingerprintFor(record) {
  return hashObject({
    pattern: normalizeText(record.pattern),
    errorExact: normalizeText(record.errorExact),
    cause: normalizeText(record.cause),
    fix: normalizeText(record.fix),
    sourceIds: Array.isArray(record.sourceIds) ? [...record.sourceIds].sort() : [String(record.sourceIds)],
    testAfter: record.testAfter,
    negativeCase: record.negativeCase,
    finalHead: String(record.finalHead),
  });
}

export async function registerLearning(record = {}, options = {}) {
  const learningDir = options.learningDir || DEFAULT_LEARNING_DIR;
  await ensureLearningDir(learningDir);

  if (["ANTI_PADRAO", "VERMELHO"].includes(String(record.estado || "").toUpperCase())) {
    return { promoted: false, reason: "TENTATIVA_VERMELHA", id: null, missing: [] };
  }

  const validation = validateLearningContract(record);
  if (!validation.valid) {
    return { promoted: false, reason: "PROVA_INCOMPLETA", id: null, missing: validation.missing };
  }

  const fingerprint = fingerprintFor(record);
  const id = fingerprint.slice(0, 16);
  const file = path.join(learningDir, `${id}.json`);

  try {
    const existing = JSON.parse(await fs.readFile(file, "utf8"));
    return {
      promoted: true,
      reason: "EVENTO_JA_REGISTRADO",
      deduplicated: true,
      id,
      path: file,
      entry: existing,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const entry = sanitizeObject({
    id,
    fingerprint,
    ts: new Date().toISOString(),
    pattern: record.pattern,
    errorExact: record.errorExact,
    cause: record.cause,
    fix: record.fix,
    sourceIds: Array.isArray(record.sourceIds) ? record.sourceIds : [record.sourceIds],
    event: record.event || null,
    missionId: record.missionId || null,
    finalHead: record.finalHead,
    rollback: record.rollback || null,
    estado: "VERDE_CONSOLIDADO",
    reutilizavel: true,
    proven: true,
    proof: {
      testBefore: record.testBefore,
      testAfter: record.testAfter,
      regression: record.regression,
      negati
```

---

# CONTRATO - learning-store.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\rigor-audit\qa.teste-de-software.MARKDOWN\runtime\learning-store.mjs
**SHA:** d1da9dae771dffc1
**Timestamp:** 2026-08-26T19:10:28.390375
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: normalizeText(record.pattern),
- pattern: record.pattern,

### Gaps
- const missing = [];
- return { promoted: false, reason: "TENTATIVA_VERMELHA", id: null, missing: [] };
- return { promoted: false, reason: "PROVA_INCOMPLETA", id: null, missing: validation.missing };

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * learning-store.mjs — memória causal, determinística e deduplicada.
 * `proven=true` sozinho nunca promove nada.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashObject, normalizeText, sanitizeObject, sanitizeText } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_LEARNING_DIR = path.join(ROOT, "learning");

function statusIs(value, expected) {
  if (typeof value === "string") return value.toUpperCase() === expected;
  if (value && typeof value === "object") {
    if (typeof value.status === "string") return value.status.toUpperCase() === expected;
    if (expected === "PASS" && value.exitCode === 0) return true;
    if (expected === "FAIL" && Number.isInteger(value.exitCode) && value.exitCode !== 0) return true;
  }
  return false;
}

export function validateLearningContract(record = {}) {
  const missing = [];
  const has = (key) => Object.prototype.hasOwnProperty.call(record, key);
  const known = (value) => {
    const normalized = normalizeText(value);
    return normalized && !["unknown", "skipped", "n a", "na", "n/a"].includes(normalized);
  };
  if (record.proven !== true) missing.push("PROVEN_TRUE");
  if (String(record.estado || "").toUpperCase() !== "VERDE_CONSOLIDADO") missing.push("ESTADO_VERDE_CONSOLIDADO");
  if (!normalizeText(record.pattern)) missing.push("PATTERN");
  if (!normalizeText(record.errorExact)) missing.push("ERRO_EXATO");
  if (!normalizeText(record.cause)) missing.push("CAUSA");
  if (!normalizeText(record.fix)) missing.push("CORRECAO_MINIMA");
  const sourceIds = Array.isArray(record.sourceIds) ? record.sourceIds : record.sourceIds ? [record.sourceIds] : [];
  if (sourceIds.length === 0 || sourceIds.some((value) => !known(value))) missing.push("SOURCE_IDS");
  if (!statusIs(record.testBefore, "FAIL")) missing.push("TESTE_ANTES_FAIL");
  if (!statusIs(record.testAfter, "PASS")) missing.push("TESTE_DEPOIS_PASS");
  if (!statusIs(record.regression, "PASS")) missing.push("REGRESSAO_PASS");
  if (!statusIs(record.negativeCase, "PASS")) missing.push("CASO_NEGATIVO_PASS");
  if (!has("fail") || Number(record.fail) !== 0) missing.push("FAIL_ZERO");
  if (!has("skipped") || Number(record.skipped) !== 0) missing.push("SKIPPED_ZERO");
  if (!has("unknown") || Number(record.unknown) !== 0) missing.push("UNKNOWN_ZERO");
  if (!has("filesOutOfScope") || Number(record.filesOutOfScope) !== 0) missing.push("ARQUIVOS_FORA_ESCOPO_ZERO");
  if (!known(record.finalHead)) missing.push("HEAD_FINAL");
  const head = String(record.finalHead || "");
  if (!/^[0-9a-f]{7,64}$/i.test(head)) missing.push("HEAD_NOT_SHA");
  const bannedSources = new Set(["inventado", "invented", "fake", "banana", "teste", "test", "n/a", "na"]);
  const sourceIdsCheck = Array.isArray(record.sourceIds) ? record.sourceIds : record.sourceIds ? [record.sourceIds] : [];
  if (sourceIdsCheck.some((s) => bannedSources.has(normalizeText(s)))) missing.push("SOURCE_IDS_INVENTADOS");
  if (!(record.reversible === true || known(record.rollback))) missing.push("ROLLBACK_OU_REVERSIBILIDADE");
  return { valid: missing.length === 0, missing };
}

export async function ensureLearningDir(learningDir = DEFAULT_LEARNING_DIR) {
  await fs.mkdir(learningDir, { recursive: true });
}

function fingerprintFor(record) {
  return hashObject({
    pattern: normalizeText(record.pattern),
    errorExact: normalizeText(record.errorExact),
    cause: normalizeText(record.cause),
    fix: normalizeText(record.fix),
    sourceIds: Array.isArray(record.sourceIds) ? [...record.sourceIds].sort() : [String(record.sourceIds)],
    testAfter: record.testAfter,
    negativeCase: record.negativeCase,
    finalHead: String(record.finalHead),
  });
}

export async function registerLearning(record = {}, options = {}) {
  const learningDir = options.learningDir || DEFAULT_LEARNING_DIR;
  await ensureLearningDir(learningDir);

  if (["ANTI_PADRAO", "VERMELHO"].includes(String(record.estado || "").toUpperCase())) {
    return { promoted: false, reason: "TENTATIVA_VERMELHA", id: null, missing: [] };
  }

  const validation = validateLearningContract(record);
  if (!validation.valid) {
    return { promoted: false, reason: "PROVA_INCOMPLETA", id: null, missing: validation.missing };
  }

  const fingerprint = fingerprintFor(record);
  const id = fingerprint.slice(0, 16);
  const file = path.join(learningDir, `${id}.json`);

  try {
    const existing = JSON.parse(await fs.readFile(file, "utf8"));
    return {
      promoted: true,
      reason: "EVENTO_JA_REGISTRADO",
      deduplicated: true,
      id,
      path: file,
      entry: existing,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const entry = sanitizeObject({
    id,
    fingerprint,
    ts: new Date().toISOString(),
    pattern: record.pattern,
    errorExact: record.errorExact,
    cause: record.cause,
    fix:
```
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
 * Cria recibo content-addressed ligado ao contrato exato do aprendizado.
 * O ID retornado deve entrar em sourceIds.
 */
export async function createEvidenceReceipt(record = {}, evidence = {}, options = {}) {
  const learningDir = options.learningDir || DEFAULT_LEARNING_DIR;
  const receiptDir = receiptDirOf(learningDir, options);
  await fs.mkdir(receiptDir, { recursive: true });
  const payload = sanitizeObject({
    kind: "QA_LEARNING_EVIDENCE",
    version: 1,
    contractDigest: learningContractDigest(record),
    evidence,
  });
  const bytes = `${stableStringify(payload)}\n`;
  const hash = sha256Bytes(bytes);
  const file = path.join(receiptDir, `${hash}.json`);
  try {
    await fs.writeFile(file, bytes, { encoding: "utf8", mode: 0o600, flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const current = await fs.readFile(file, "utf8");
    if (sha256Bytes(current) !== hash) throw new Error("EVIDENCE_RECEIPT_HASH_COLLISION");
  }
  return { id: `receipt:${hash}`, hash, path: file, contractDigest: payload.contractDigest };
}

async function verifyEvidenceReceipts(record, learningDir, options = {}) {
  const receiptDir = receiptDirOf(learningDir, options);
  const expectedDigest = learningContractDigest(record);
  const verified = [];
  const errors = [];
  for (const sourceId of sourceIdsOf(record)) {
    const match = String(sourceId).match(RECEIPT_ID);
    if (!match) continue;
    const hash = match[1].toLowerCase();
    const file = path.join(receiptDir, `${hash}.json`);
    try {
      const raw = await fs.readFile(file, "utf8");
      const actualHash = sha256Bytes(raw);
      if (actualHash !== hash) throw new Error("RECEIPT_HASH_MISMATCH");
      const parsed = JSON.parse(raw);
      if (parsed?.kind !== "QA_LEARNING_EVIDENCE" || parsed?.version !== 1) throw new Error("RECEIPT_KIND_INVALID");
      if (parsed.contractDigest !== expectedDigest) throw new Error("RECEIPT_CONTRACT_MISMATCH");
      verified.push(sourceId);
    } catch (error) {
      errors.push(`${sourceId}:${error.code || error.message}`);
    }
  }
  return { valid: verified.length > 0 && errors.length === 0, verified, errors, expectedDigest };
}

function fingerprintFor(record) {
  return hashObject({
    pattern: normalizeText(record.pattern),
    errorExact: normalizeText(record.errorExact),
    cause: normalizeText(record.cause),
    fix: normalizeText(record.fix),
    sourceIds: sourceIdsOf(record).map(String).sort(),
    contractDigest: learningContractDigest(record),
    finalHead: String(record.finalHead).toLowerCase(),
  });
}

function processAlive(pid) {
  const value = Number(pid);
  if (!Number.isInteger(value) || value <= 0) return false;
  try {
    process.kill(value, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

async function staleLockCanBeRemoved(lockFile, stat, staleMs) {
  if (!stat || Date.now() - stat.mtimeMs <= staleMs) return false;
  try {
    const metadata = JSON.parse(await fs.readFile(lockFile, "utf8"));
    if (processAlive(metadata?.pid)) return false;
  } catch {
    // Lock antigo/corrompido pode ser limpo somente após ultrapassar staleMs.
  }
  return true;
}

async function acquireLock(lockFile, options = {}) {
  const retries = options.retries ?? 100;
  const delayMs = options.delayMs ?? 20;
  const staleMs = options.staleMs ?? 30000;
  await fs.mkdir(path.dirname(lockFile), { recursive: true });
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const handle = await fs.open(lockFile, "wx", 0o600);
      await handle.writeFile(JSON.stringify({ pid: process.pid, ts: Date.now() }));
      return handle;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      const stat = await fs.stat(lockFile).catch(() => null);
      if (await staleLockCanBeRemoved(lockFile, stat, staleMs)) {
        await fs.unlink(lockFile).catch(() => {});
        continue;
      }
      if (attempt === retries) throw new Error("LEARNING_LOCK_TIMEOUT");
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("LEARNING_LOCK_TIMEOUT");
}

async function releaseLock(handle, lockFile) {
  await handle.close().catch(() => {});
  await fs.unlink(lockFile).catch(() => {});
}

function storedEntryToRecord(entry) {
  return {
    proven: entry.proven,
    estado: entry.estado,
    pattern: entry.pattern,
    errorExact: entry.errorExact,
    cause: entry.cause,
    fix: entry.fix,
    sourceIds: entry.sourceIds,
    testBefore: entry.proof?.testBefore,
    testAfter: entry.proof?.testAfter,
    regression: entry.proof?.regression,
    negativeCase: entry.proof?.negativeCase,
    fail: entry.proof?.fail,
    skipped: entry.proof?.skipped,
    unknown: entry.proof?.unknown,
    filesOutOfScope: entry.proof?.filesOutOfScope,
    finalHead: entry.finalHead,
    rollback: entry.rollback,
    reversible: entry.reversible,
  };
}

export async function registerLearning(record = {}, options = {}) {
  const learningDir = options.learningDir || DEFAULT_LEARNING_DIR;
  await ensureLearningDir(learningDir);

  if (["ANTI_PADRAO", "VERMELHO"].includes(String(record.estado || "").toUpperCase())) {
    return { promoted: false, reason: "TENTATIVA_VERMELHA", id: null, missing: [] };
  }

  const validation = validateLearningContract(record);
  if (!validation.valid) return { promoted: false, reason: "PROVA_INCOMPLETA", id: null, missing: validation.missing };

  const receiptValidation = await verifyEvidenceReceipts(record, learningDir, options);
  if (!receiptValidation.valid) {
    return {
      promoted: false,
      reason: "PROVENIENCIA_NAO_COMPROVADA",
      id: null,
      missing: ["RECEIPT_VALIDO_E_VINCULADO"],
      receiptErrors: receiptValidation.errors,
    };
  }

  const fingerprint = fingerprintFor(record);
  const id = fingerprint.slice(0, 16);
  const file = path.join(learningDir, `${id}.json`);
  const lockFile = path.join(learningDir, ".locks", `${id}.lock`);
  const lock = await acquireLock(lockFile, options.lockOptions);
  try {
    try {
      const existing = JSON.parse(await fs.readFile(file, "utf8"));
      return { promoted: true, reason: "EVENTO_JA_REGISTRADO", deduplicated: true, id, path: file, entry: existing };
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    const entry = sanitizeObject({
      id,
      fingerprint,
      contractDigest: receiptValidation.expectedDigest,
      ts: new Date().toISOString(),
      pattern: record.pattern,
      errorExact: record.errorExact,
      cause: record.cause,
      fix: record.fix,
      sourceIds: sourceIdsOf(record),
      verifiedReceiptIds: receiptValidation.verified,
      event: record.event || null,
      missionId: record.missionId || null,
      finalHead: String(record.finalHead).toLowerCase(),
      rollback: record.rollback || null,
      reversible: record.reversible === true,
      estado: "VERDE_CONSOLIDADO",
      reutilizavel: true,
      proven: true,
      proof: {
        testBefore: record.testBefore,
        testAfter: record.testAfter,
        regression: record.regression,
        negativeCase: record.negativeCase,
        fail: 0,
        skipped: 0,
        unknown: 0,
        filesOutOfScope: 0,
      },
    });

    const tmp = `${file}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(entry, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await fs.rename(tmp, file);
    return { promoted: true, reason: "PROVA_COMPLETA", deduplicated: false, id, path: file, entry };
  } finally {
    await releaseLock(lock, lockFile);
  }
}

function overlapScore(query, entry) {
  const queryTokens = new Set(normalizeText(query).split(/\s+/).filter((token) => token.length >= 3));
  const entryTokens = new Set(normalizeText(`${entry.pattern || ""} ${entry.errorExact || ""} ${entry.cause || ""} ${entry.fix || ""}`).split(/\s+/));
  let score = 0;
  for (const token of queryTokens) if (entryTokens.has(token)) score++;
  return score;
}

async function readEntries(learningDir, options = {}) {
  await ensureLearningDir(learningDir);
  const files = await fs.readdir(learningDir).catch(() => []);
  const entries = [];
  for (const file of files.filter((name) => name.endsWith(".json") && !name.includes("checkpoint"))) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(learningDir, file), "utf8"));
      const record = storedEntryToRecord(data);
      const contract = validateLearningContract(record);
      const receiptValidation = await verifyEvidenceReceipts(record, learningDir, options);
      const fingerprint = fingerprintFor(record);
      const identityValid = data.id === fingerprint.slice(0, 16)
        && data.fingerprint === fingerprint
        && data.contractDigest === learningContractDigest(record);
      if (identityValid && contract.valid && receiptValidation.valid && data.reutilizavel === true) entries.push(data);
    } catch {
      // Arquivo adulterado, corrompido ou sem proveniência é ignorado, nunca reutilizado.
    }
  }
  return entries;
}

export async function loadLearningForPattern(patternText = "", options = {}) {
  const learningDir = options.learningDir || DEFAULT_LEARNING_DIR;
  const entries = await readEntries(learningDir, options);
  const parsedLimit = Number(options.limit);
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(Math.trunc(parsedLimit), 10)) : 3;
  return entries
    .map((entry) => ({ entry, score: overlapScore(patternText, entry) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || String(b.entry.ts).localeCompare(String(a.entry.ts)))
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export async function loadRecentLearnings(options = {}) {
  const learningDir = options.learningDir || DEFAULT_LEARNING_DIR;
  const parsedLimit = Number(options.limit);
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(Math.trunc(parsedLimit), 10)) : 3;
  return (await readEntries(learningDir, options))
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
    .slice(0, limit);
}

export function learningSummary(entry) {
  return `${entry.id}:${sanitizeText(entry.pattern, 120)} → ${sanitizeText(entry.fix, 180)}`;
}

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
      negativeCase: record.negativeCase,
      fail: 0,
      skipped: 0,
      unknown: 0,
      filesOutOfScope: 0,
    },
  });

  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(entry, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await fs.rename(tmp, file);
  return { promoted: true, reason: "PROVA_COMPLETA", deduplicated: false, id, path: file, entry };
}

function overlapScore(query, entry) {
  const queryTokens = new Set(normalizeText(query).split(/\s+/).filter((token) => token.length >= 3));
  const entryTokens = new Set(normalizeText(`${entry.pattern || ""} ${entry.errorExact || ""} ${entry.cause || ""} ${entry.fix || ""}`).split(/\s+/));
  let score = 0;
  for (const token of queryTokens) if (entryTokens.has(token)) score++;
  return score;
}

async function readEntries(learningDir) {
  await ensureLearningDir(learningDir);
  const files = await fs.readdir(learningDir).catch(() => []);
  const entries = [];
  for (const file of files.filter((name) => name.endsWith(".json") && !name.includes("checkpoint"))) {
    try {
      const data = JSON.parse(await fs.readFile(path.join(learningDir, file), "utf8"));
      if (data.reutilizavel === true && data.proven === true && data.estado === "VERDE_CONSOLIDADO") entries.push(data);
    } catch {
      // Arquivo corrompido é ignorado, nunca promovido.
    }
  }
  return entries;
}

export async function loadLearningForPattern(patternText = "", options = {}) {
  const learningDir = options.learningDir || DEFAULT_LEARNING_DIR;
  const entries = await readEntries(learningDir);
  return entries
    .map((entry) => ({ entry, score: overlapScore(patternText, entry) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || String(b.entry.ts).localeCompare(String(a.entry.ts)))
    .slice(0, options.limit || 3)
    .map(({ entry }) => entry);
}

export async function loadRecentLearnings(options = {}) {
  const learningDir = options.learningDir || DEFAULT_LEARNING_DIR;
  return (await readEntries(learningDir))
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
    .slice(0, options.limit || 3);
}

export function learningSummary(entry) {
  return `${entry.id}:${sanitizeText(entry.pattern, 120)} → ${sanitizeText(entry.fix, 180)}`;
}

#!/usr/bin/env node
/**
 * router.mjs — consulta apenas o manifest, valida o mapa e seleciona top-3.
 * Prioridade desempata; nunca cria match sem gatilho real.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashObject, normalizeText } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_MATCHES = 3;

export function resolveManifestPath(root, relativePath) {
  if (typeof relativePath !== "string" || !relativePath.trim()) {
    throw new Error("MANIFEST_PATH_EMPTY");
  }
  if (path.isAbsolute(relativePath)) throw new Error("MANIFEST_PATH_ABSOLUTE");
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.split("/").includes("..")) throw new Error("MANIFEST_PATH_TRAVERSAL");
  if (!normalized.toLowerCase().endsWith(".md")) throw new Error("MANIFEST_PATH_NOT_MARKDOWN");

  const rootResolved = path.resolve(root);
  const full = path.resolve(rootResolved, normalized);
  const prefix = `${rootResolved}${path.sep}`;
  if (full !== rootResolved && !full.startsWith(prefix)) throw new Error("MANIFEST_PATH_OUTSIDE_ROOT");
  return full;
}

export function validateManifest(manifest, { root = ROOT } = {}) {
  if (!Array.isArray(manifest)) throw new Error("MANIFEST_NOT_ARRAY");
  const ids = new Set();
  const errors = [];

  for (const [index, entry] of manifest.entries()) {
    const label = `ENTRY_${index}`;
    if (!entry || typeof entry !== "object") {
      errors.push(`${label}:NOT_OBJECT`);
      continue;
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(entry.id || "")) errors.push(`${label}:ID_INVALID`);
    if (ids.has(entry.id)) errors.push(`${label}:ID_DUPLICATE:${entry.id}`);
    ids.add(entry.id);
    if (typeof entry.name !== "string" || !entry.name.trim()) errors.push(`${label}:NAME_INVALID`);
    try {
      resolveManifestPath(root, entry.path);
    } catch (error) {
      errors.push(`${label}:${error.message}`);
    }
    if (!Array.isArray(entry.triggers) || entry.triggers.length === 0) {
      errors.push(`${label}:TRIGGERS_EMPTY`);
    } else if (entry.triggers.some((trigger) => typeof trigger !== "string" || !normalizeText(trigger))) {
      errors.push(`${label}:TRIGGER_INVALID`);
    }
    if (entry.priority != null && (!Number.isFinite(entry.priority) || entry.priority < 0 || entry.priority > 100)) {
      errors.push(`${label}:PRIORITY_INVALID`);
    }
  }

  if (errors.length) {
    const error = new Error(`MANIFEST_INVALID:${errors.join("|")}`);
    error.details = errors;
    throw error;
  }
  return { valid: true, count: manifest.length, hash: hashObject(manifest) };
}

function triggerMatches(haystack, trigger) {
  const normalizedTrigger = normalizeText(trigger);
  if (!normalizedTrigger) return false;
  const paddedHaystack = ` ${haystack} `;
  const paddedTrigger = ` ${normalizedTrigger} `;
  if (normalizedTrigger.includes(" ") || normalizedTrigger.includes("/") || normalizedTrigger.includes(".")) {
    return paddedHaystack.includes(paddedTrigger) || haystack.includes(normalizedTrigger);
  }
  return new RegExp(`(^|\\s)${normalizedTrigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`).test(haystack);
}

export function scoreEntry(entry, contextText) {
  const haystack = normalizeText(contextText);
  const matchedTriggers = (entry.triggers || []).filter((trigger) => triggerMatches(haystack, trigger));
  return {
    triggerScore: matchedTriggers.length,
    score: matchedTriggers.length * 10 + Number(entry.priority || 0) / 100,
    matchedTriggers,
  };
}

export async function loadManifest({ root = ROOT, manifestPath = path.join(root, "manifest.json") } = {}) {
  const raw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const validation = validateManifest(manifest, { root });
  const missingTargets = [];
  for (const entry of manifest) {
    try {
      await fs.access(resolveManifestPath(root, entry.path));
    } catch (error) {
      if (error.message?.startsWith("MANIFEST_PATH_")) throw error;
      missingTargets.push(entry.path);
    }
  }
  if (missingTargets.length) throw new Error(`MANIFEST_TARGET_MISSING:${[...new Set(missingTargets)].join("|")}`);
  return { manifest, validation };
}

export async function routeQaContext(event = {}, options = {}) {
  const root = options.root || ROOT;
  const { manifest, validation } = await loadManifest({ root, manifestPath: options.manifestPath });

  const contextText = [
    event.event,
    event.originalEvent,
    event.evidence?.error,
    event.evidence?.command,
    event.mission?.id,
    event.mission?.state,
    event.mission?.nextState,
    event.checkpoint,
    ...(event.evidence?.changedFiles ?? []),
    ...(event.evidence?.tests ?? []),
    ...(Array.isArray(event.tags) ? event.tags : []),
  ]
    .filter(Boolean)
    .join("\n");

  const matches = manifest
    .map((entry) => ({ ...entry, ...scoreEntry(entry, contextText) }))
    .filter((entry) => entry.triggerScore > 0)
    .sort((a, b) => b.triggerScore - a.triggerScore || b.priority - a.priority || a.id.localeCompare(b.id))
    .slice(0, options.maxMatches || MAX_MATCHES);

  return {
    event: event.event || "UNKNOWN",
    missionPreserved: true,
    mission: event.mission || null,
    workspace: event.workspace || null,
    manifestHash: validation.hash,
    matchCount: matches.length,
    matches: matches.map(({ id, name, path: relativePath, score, matchedTriggers }) => ({
      id,
      name,
      path: relativePath,
      score: Number(score.toFixed(2)),
      matchedTriggers,
    })),
    inconclusive: matches.length === 0,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const input = process.argv[2]
    ? JSON.parse(await fs.readFile(process.argv[2], "utf8"))
    : { event: "TEST_FAILED", evidence: { error: "trailer no rodape nao foi reconhecido", command: "node --test" } };
  console.log(JSON.stringify(await routeQaContext(input), null, 2));
}

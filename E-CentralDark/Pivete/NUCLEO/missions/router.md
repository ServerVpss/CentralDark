# MISSAO - router.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\audit-rigor\qa.teste-de-software.MARKDOWN\runtime\router.mjs
**SHA:** 6137a26e277b97c1
**Timestamp:** 2026-08-26T19:10:24.343156
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if (missingTargets.length) throw new Error(`MANIFEST_TARGET_MISSING:${[...new Set(missingTargets)].join("|")}`);

### Ouro Bruto (primeiros 5000 chars)
```
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
  if (typeof relativePath !== "string" || !relativePath.trim()) throw new Error("MANIFEST_PATH_EMPTY");
  if (path.isAbsolute(relativePath)) throw new Error("MANIFEST_PATH_ABSOLUTE");
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.split("/").includes("..")) throw new Error("MANIFEST_PATH_TRAVERSAL");
  if (!normalized.toLowerCase().endsWith(".md")) throw new Error("MANIFEST_PATH_NOT_MARKDOWN");

  const rootResolved = path.resolve(root);
  const full = path.resolve(rootResolved, normalized);
  const relative = path.relative(rootResolved, full);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("MANIFEST_PATH_OUTSIDE_ROOT");
  return full;
}

export async function resolveManifestRealPath(root, relativePath) {
  const lexical = resolveManifestPath(root, relativePath);
  const [rootReal, targetReal] = await Promise.all([fs.realpath(root), fs.realpath(lexical)]);
  const relative = path.relative(rootReal, targetReal);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("MANIFEST_REALPATH_OUTSIDE_ROOT");
  const stat = await fs.stat(targetReal);
  if (!stat.isFile()) throw new Error("MANIFEST_TARGET_NOT_FILE");
  return targetReal;
}

export function validateManifest(manifest, { root = ROOT } = {}) {
  if (!Array.isArray(manifest)) throw new Error("MANIFEST_NOT_ARRAY");
  const ids = new Set();
  const paths = new Set();
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
      const pathKey = String(entry.path).replace(/\\/g, "/").toLowerCase();
      if (paths.has(pathKey)) errors.push(`${label}:PATH_DUPLICATE:${entry.path}`);
      paths.add(pathKey);
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
      await resolveManifestRealPath(root, entry.path);
    } catch (error) {
      if (error.code === "ENOENT") missingTargets.push(entry.path);
      else throw error;
    }
  }
  if (missingTargets.length) throw new Error(`MANIFEST_TARGET_MISSING:${[...new Set(missingTargets)].join("|")}`);
  return { manifest
```

---

# MISSAO - router.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\qa_skillmaster_audit\qa.teste-de-software.MARKDOWN\runtime\router.mjs
**SHA:** 2bd54e368cda3e8b
**Timestamp:** 2026-08-26T19:10:27.415170
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if (missingTargets.length) throw new Error(`MANIFEST_TARGET_MISSING:${[...new Set(missingTargets)].join("|")}`);

### Ouro Bruto (primeiros 5000 chars)
```
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
    .filter((entry)
```

---

# MISSAO - router.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\rigor-audit\qa.teste-de-software.MARKDOWN\runtime\router.mjs
**SHA:** c45ea2d10812d378
**Timestamp:** 2026-08-26T19:10:28.446527
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- if (missingTargets.length) throw new Error(`MANIFEST_TARGET_MISSING:${[...new Set(missingTargets)].join("|")}`);

### Ouro Bruto (primeiros 5000 chars)
```
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
    .filter((entry)
```
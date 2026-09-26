# COMANDO - orchestrator.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\audit-rigor\qa.teste-de-software.MARKDOWN\runtime\orchestrator.mjs
**SHA:** 34b597ec05f92ba9
**Timestamp:** 2026-08-26T19:10:24.312682
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: [
- const testRun = tests.length > 0

### Gaps
- const missing = relative.filter((item) => !knownPaths.has(item.toLowerCase()) && !SELF_MAP_IGNORES.some((pattern) => pattern.test(item)));
- todo: tapNumber("todo"),
- && testSummary.todo === 0;

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/** SkillMaster core: classificar → rotear → consultar → aprender → policy → delta. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import { classificarEvento } from "./classificar-evento.mjs";
import { routeQaContext, loadManifest, validateManifest } from "./router.mjs";
import { consultarDocumentos } from "./consultar.mjs";
import { consolidarDelta } from "./consolidar-delta.mjs";
import { evaluatePolicyGate } from "./policy-gate.mjs";
import { registerLearning, loadLearningForPattern, loadRecentLearnings } from "./learning-store.mjs";
import { runEnxame } from "./enxame-runner.mjs";
import { normalizeText, sanitizeObject } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_MAP_IGNORES = [
  /^README\.md$/i,
  /(^|\/)README\.md$/i,
  /(^|\/)INDEX\.md$/i,
  /(^|\/)(?:REPORT|STAFF-REPORT(?:-V\d+(?:\.\d+)?)?)\.md$/i,
];

export async function orchestrate(rawEvent = {}, options = {}) {
  const root = options.root || ROOT;
  const event = classificarEvento(rawEvent);
  const routeResult = await routeQaContext(event, { root, manifestPath: options.manifestPath });
  const keywords = [event.evidence?.error, event.event, event.evidence?.command, event.evidence?.changedFiles].filter(Boolean);
  const consulta = await consultarDocumentos(routeResult.matches, keywords, { root });

  const learningOptions = { learningDir: options.learningDir };
  const previousLearning = event.event === "SESSION_RESUME"
    ? await loadRecentLearnings({ ...learningOptions, limit: 3 })
    : await loadLearningForPattern(event.evidence?.error || event.event, { ...learningOptions, limit: 3 });

  let enxame = null;
  const wantsEnxame = options.forceEnxame === true || event.event === "ENXAME_REQUEST" || event.tags.includes("enxame");
  if (wantsEnxame) {
    const enxameRunner = options.enxameRunner || runEnxame;
    enxame = await enxameRunner({
      prompt: [
        `EVENTO: ${event.event}`,
        event.evidence?.error ? `ERRO: ${event.evidence.error}` : "",
        event.mission?.id ? `MISSAO: ${event.mission.id}` : "",
        options.enxamePrompt || "Diagnóstico técnico staff, PT-BR, direto.",
      ].filter(Boolean).join("\n"),
      mode: options.enxameMode || "econo",
      judge: true,
      allowLarge: options.allowLargeEnxame === true,
      env: options.env,
      fetchImpl: options.fetchImpl,
    });
  }

  const policy = evaluatePolicyGate(options.policyFlags || {});
  let learning = { promoted: false, reason: "NAO_SOLICITADO" };
  if (options.learningRecord) {
    learning = await registerLearning({
      ...options.learningRecord,
      event: event.event,
      missionId: event.mission?.id,
    }, learningOptions);
  }

  const delta = consolidarDelta({ routeResult, consulta, event, policy, enxame, learning, previousLearning });
  return { delta, routeResult, consulta, enxame, policy, learning, previousLearning, event };
}

async function walkFiles(dir, predicate, acc = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "learning", "tests", "runtime", ".git", "references"].includes(entry.name)) continue;
      await walkFiles(full, predicate, acc);
    } else if (predicate(full)) acc.push(full);
  }
  return acc;
}

function autoId(relativePath, usedIds) {
  const base = path.basename(relativePath, ".md").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "documento";
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}-${suffix++}`;
  usedIds.add(id);
  return id;
}

async function candidateFromMarkdown(root, relativePath, usedIds) {
  const raw = await fs.readFile(path.join(root, relativePath), "utf8");
  const heading = raw.split(/\r?\n/).find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "").trim();
  const stem = path.basename(relativePath, ".md");
  const triggerTokens = normalizeText(`${stem} ${heading || ""}`)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !["para", "como", "esta", "este", "completo", "relatorio"].includes(token));
  const triggers = [...new Set([normalizeText(stem), ...triggerTokens])].filter(Boolean).slice(0, 8);
  return {
    id: autoId(relativePath, usedIds),
    name: heading || stem,
    path: relativePath,
    triggers: triggers.length ? triggers : [normalizeText(stem)],
    priority: 5,
  };
}

export async function selfMap(options = {}) {
  const root = options.root || ROOT;
  const manifestPath = options.manifestPath || path.join(root, "manifest.json");
  const { manifest } = await loadManifest({ root, manifestPath });
  const knownPaths = new Set(manifest.map((entry) => entry.path.replace(/\\/g, "/").toLowerCase()));
  const allMd = 
```

---

# COMANDO - orchestrator.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\qa_skillmaster_audit\qa.teste-de-software.MARKDOWN\runtime\orchestrator.mjs
**SHA:** 18216647d57b93d6
**Timestamp:** 2026-08-26T19:10:27.382316
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: [
- const testRun = await spawnCapture(process.execPath, ["--test", ...tests], root);

### Gaps
- const missing = relative.filter((item) => !knownPaths.has(item.toLowerCase()) && !SELF_MAP_IGNORES.some((pattern) => pattern.test(item)));
- todo: tapNumber("todo"),

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/** SkillMaster core: classificar → rotear → consultar → aprender → policy → delta. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { classificarEvento } from "./classificar-evento.mjs";
import { routeQaContext, loadManifest, validateManifest } from "./router.mjs";
import { consultarDocumentos } from "./consultar.mjs";
import { consolidarDelta } from "./consolidar-delta.mjs";
import { evaluatePolicyGate } from "./policy-gate.mjs";
import { registerLearning, loadLearningForPattern, loadRecentLearnings } from "./learning-store.mjs";
import { runEnxame } from "./enxame-runner.mjs";
import { normalizeText, sanitizeObject } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_MAP_IGNORES = [
  /^README\.md$/i,
  /(^|\/)README\.md$/i,
  /(^|\/)INDEX\.md$/i,
  /(^|\/)(?:REPORT|STAFF-REPORT(?:-V\d+(?:\.\d+)?)?)\.md$/i,
];

export async function orchestrate(rawEvent = {}, options = {}) {
  const root = options.root || ROOT;
  const event = classificarEvento(rawEvent);
  const routeResult = await routeQaContext(event, { root, manifestPath: options.manifestPath });
  const keywords = [event.evidence?.error, event.event, event.evidence?.command, event.evidence?.changedFiles].filter(Boolean);
  const consulta = await consultarDocumentos(routeResult.matches, keywords, { root });

  const learningOptions = { learningDir: options.learningDir };
  const previousLearning = event.event === "SESSION_RESUME"
    ? await loadRecentLearnings({ ...learningOptions, limit: 3 })
    : await loadLearningForPattern(event.evidence?.error || event.event, { ...learningOptions, limit: 3 });

  let enxame = null;
  const wantsEnxame = options.forceEnxame === true || event.event === "ENXAME_REQUEST" || event.tags.includes("enxame");
  if (wantsEnxame) {
    const enxameRunner = options.enxameRunner || runEnxame;
    enxame = await enxameRunner({
      prompt: [
        `EVENTO: ${event.event}`,
        event.evidence?.error ? `ERRO: ${event.evidence.error}` : "",
        event.mission?.id ? `MISSAO: ${event.mission.id}` : "",
        options.enxamePrompt || "Diagnóstico técnico staff, PT-BR, direto.",
      ].filter(Boolean).join("\n"),
      mode: options.enxameMode || "econo",
      judge: true,
      allowLarge: options.allowLargeEnxame === true,
      env: options.env,
      fetchImpl: options.fetchImpl,
    });
  }

  const policy = evaluatePolicyGate(options.policyFlags || {});
  let learning = { promoted: false, reason: "NAO_SOLICITADO" };
  if (options.learningRecord) {
    learning = await registerLearning({
      ...options.learningRecord,
      event: event.event,
      missionId: event.mission?.id,
    }, learningOptions);
  }

  const delta = consolidarDelta({ routeResult, consulta, event, policy, enxame, learning, previousLearning });
  return { delta, routeResult, consulta, enxame, policy, learning, previousLearning, event };
}

async function walkFiles(dir, predicate, acc = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "learning", "tests", "runtime", ".git", "references"].includes(entry.name)) continue;
      await walkFiles(full, predicate, acc);
    } else if (predicate(full)) acc.push(full);
  }
  return acc;
}

function autoId(relativePath, usedIds) {
  const base = path.basename(relativePath, ".md").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "documento";
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}-${suffix++}`;
  usedIds.add(id);
  return id;
}

async function candidateFromMarkdown(root, relativePath, usedIds) {
  const raw = await fs.readFile(path.join(root, relativePath), "utf8");
  const heading = raw.split(/\r?\n/).find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "").trim();
  const stem = path.basename(relativePath, ".md");
  const triggerTokens = normalizeText(`${stem} ${heading || ""}`)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !["para", "como", "esta", "este", "completo", "relatorio"].includes(token));
  const triggers = [...new Set([normalizeText(stem), ...triggerTokens])].filter(Boolean).slice(0, 8);
  return {
    id: autoId(relativePath, usedIds),
    name: heading || stem,
    path: relativePath,
    triggers: triggers.length ? triggers : [normalizeText(stem)],
    priority: 5,
  };
}

export async function selfMap(options = {}) {
  const root = options.root || ROOT;
  const manifestPath = options.manifestPath || path.join(root, "manifest.json");
  const { manifest } = await loadManifest({ root, manifestPath });
  const knownPaths = new Set(manifest.map((entry) => entry.path.replace(/\\/g, "/").toLowerCase()));
  const allMd = await walkFiles(root, (file) => fi
```

---

# COMANDO - orchestrator.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\rigor-audit\qa.teste-de-software.MARKDOWN\runtime\orchestrator.mjs
**SHA:** 1ca821162340ff24
**Timestamp:** 2026-08-26T19:10:28.411055
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: [
- const testRun = await spawnCapture(process.execPath, ["--test", ...tests], root);

### Gaps
- const missing = relative.filter((item) => !knownPaths.has(item.toLowerCase()) && !SELF_MAP_IGNORES.some((pattern) => pattern.test(item)));
- todo: tapNumber("todo"),
- status: validation.valid && selfMapReport.status === "SYNCED" && checks.every((check) => check.pass) && (bashProbe.code !== 0 || shellChecks.every((check) => check.pass)) && testRun.code === 0 && test

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/** SkillMaster core: classificar → rotear → consultar → aprender → policy → delta. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { classificarEvento } from "./classificar-evento.mjs";
import { routeQaContext, loadManifest, validateManifest } from "./router.mjs";
import { consultarDocumentos } from "./consultar.mjs";
import { consolidarDelta } from "./consolidar-delta.mjs";
import { evaluatePolicyGate } from "./policy-gate.mjs";
import { registerLearning, loadLearningForPattern, loadRecentLearnings } from "./learning-store.mjs";
import { runEnxame } from "./enxame-runner.mjs";
import { normalizeText, sanitizeObject } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF_MAP_IGNORES = [
  /^README\.md$/i,
  /(^|\/)README\.md$/i,
  /(^|\/)INDEX\.md$/i,
  /(^|\/)(?:REPORT|STAFF-REPORT(?:-V\d+(?:\.\d+)?)?)\.md$/i,
];

export async function orchestrate(rawEvent = {}, options = {}) {
  const root = options.root || ROOT;
  const event = classificarEvento(rawEvent);
  const routeResult = await routeQaContext(event, { root, manifestPath: options.manifestPath });
  const keywords = [event.evidence?.error, event.event, event.evidence?.command, event.evidence?.changedFiles].filter(Boolean);
  const consulta = await consultarDocumentos(routeResult.matches, keywords, { root });

  const learningOptions = { learningDir: options.learningDir };
  const previousLearning = event.event === "SESSION_RESUME"
    ? await loadRecentLearnings({ ...learningOptions, limit: 3 })
    : await loadLearningForPattern(event.evidence?.error || event.event, { ...learningOptions, limit: 3 });

  let enxame = null;
  const wantsEnxame = options.forceEnxame === true || event.event === "ENXAME_REQUEST" || event.tags.includes("enxame");
  if (wantsEnxame) {
    const enxameRunner = options.enxameRunner || runEnxame;
    enxame = await enxameRunner({
      prompt: [
        `EVENTO: ${event.event}`,
        event.evidence?.error ? `ERRO: ${event.evidence.error}` : "",
        event.mission?.id ? `MISSAO: ${event.mission.id}` : "",
        options.enxamePrompt || "Diagnóstico técnico staff, PT-BR, direto.",
      ].filter(Boolean).join("\n"),
      mode: options.enxameMode || "econo",
      judge: true,
      allowLarge: options.allowLargeEnxame === true,
      env: options.env,
      fetchImpl: options.fetchImpl,
    });
  }

  const policy = evaluatePolicyGate(options.policyFlags || {});
  let learning = { promoted: false, reason: "NAO_SOLICITADO" };
  if (options.learningRecord) {
    learning = await registerLearning({
      ...options.learningRecord,
      event: event.event,
      missionId: event.mission?.id,
    }, learningOptions);
  }

  const delta = consolidarDelta({ routeResult, consulta, event, policy, enxame, learning, previousLearning });
  return { delta, routeResult, consulta, enxame, policy, learning, previousLearning, event };
}

async function walkFiles(dir, predicate, acc = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "learning", "tests", "runtime", ".git", "references"].includes(entry.name)) continue;
      await walkFiles(full, predicate, acc);
    } else if (predicate(full)) acc.push(full);
  }
  return acc;
}

function autoId(relativePath, usedIds) {
  const base = path.basename(relativePath, ".md").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "documento";
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) id = `${base}-${suffix++}`;
  usedIds.add(id);
  return id;
}

async function candidateFromMarkdown(root, relativePath, usedIds) {
  const raw = await fs.readFile(path.join(root, relativePath), "utf8");
  const heading = raw.split(/\r?\n/).find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, "").trim();
  const stem = path.basename(relativePath, ".md");
  const triggerTokens = normalizeText(`${stem} ${heading || ""}`)
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !["para", "como", "esta", "este", "completo", "relatorio"].includes(token));
  const triggers = [...new Set([normalizeText(stem), ...triggerTokens])].filter(Boolean).slice(0, 8);
  return {
    id: autoId(relativePath, usedIds),
    name: heading || stem,
    path: relativePath,
    triggers: triggers.length ? triggers : [normalizeText(stem)],
    priority: 5,
  };
}

export async function selfMap(options = {}) {
  const root = options.root || ROOT;
  const manifestPath = options.manifestPath || path.join(root, "manifest.json");
  const { manifest } = await loadManifest({ root, manifestPath });
  const knownPaths = new Set(manifest.map((entry) => entry.path.replace(/\\/g, "/").toLowerCase()));
  const allMd = await walkFiles(root, (file) => fi
```

---

# COMANDO - orchestrator.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\artifacts-builder\core\orchestrator.mjs
**SHA:** 4078b6d1bd46cd6b
**Timestamp:** 2026-08-28T02:56:07.447470
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const PENDENTE  = join(BASE, 'missions/pendente');
- .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
- .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
// 🏗️ ARTIFACTS BUILDER v1.0 — Construtor autônomo de artefatos web
// Loop 10s vigiando missions/pendente/ + constrói artefatos React+Tailwind+shadcn
// Output: /root/CentralDark/apps/modulos/artifacts-builder/public/ (servido via PM2)

import { readdir, readFile, writeFile, mkdir, rename, appendFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, exec } from 'node:child_process';
import { createServer } from 'node:http';
import { buildArtifactRecord } from './schema.mjs';
import { renderSessionReportHtml, renderSessionReportCss } from './session-report.mjs';

const BASE = dirname(dirname(fileURLToPath(import.meta.url)));
const PENDENTE  = join(BASE, 'missions/pendente');
const ANDAMENTO = join(BASE, 'missions/em-andamento');
const CONCLUIDA = join(BASE, 'missions/concluidas');
const PUBLIC    = join(BASE, 'public');
const DATA      = join(BASE, 'data');
const LOGS      = join(BASE, 'logs');
const INTERVAL  = 10000;
const PORT      = Number(process.env.PORT || 3090);

let ocupado = false;
const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

// ── Helpers ──

function slugify(s) {
  // Remove acentos, espaços viram hífen simples, sem duplicar
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50) || `a-${Date.now()}`;
}

async function logToFile(nome, content) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  await writeFile(join(LOGS, `${ts}-${slugify(nome)}.log`), content, 'utf8');
}

// ── Motor de construção de artefatos ──

function parseMissao(content) {
  // Formato: markdown com seções
  const nome = content.match(/^#\s+(.+)/m)?.[1]?.trim() || 'artefato-sem-nome';
  const tipo = content.match(/##\s+Tipo\s*\n([^\n]+)/i)?.[1]?.trim() || 'react-page';
  const desc = content.match(/##\s+Descrição\s*\n([^#]+)/is)?.[1]?.trim() || '';
  const reqs = content.match(/##\s+Requisitos\s*\n([^#]+)/is)?.[1]?.trim() || '';
  const rotas = content.match(/##\s+Rotas\s*\n([^#]+)/is)?.[1]?.trim() || '/';
  const tema  = content.match(/##\s+Tema\s*\n([^#]+)/is)?.[1]?.trim() || 'dark';
  return { nome, tipo, desc, reqs, rotas, tema };
}

// Tipos renderizados por um construtor dedicado em vez do template genérico
// de cards — por capacidade, não "3D em tudo pra parecer bonito" (contrato
// universal, seção 5). Novos tipos diferenciados entram aqui, um de cada vez.
const RENDERERS_DEDICADOS = new Set(['session-report']);

/** Extrai um bloco ```json ... ``` de dentro do texto de Requisitos. Formato
 * escolhido para não obrigar a reescrever `parseMissao()` (correção mínima):
 * o schema universal (schema.mjs) continua sendo a fonte de verdade do
 * contrato; isto é só onde o payload chega dentro do markdown existente. */
function extrairPayloadJSON(reqs) {
  const match = String(reqs ?? '').match(/```json\s*([\s\S]*?)```/i);
  if (!match) throw new Error('SESSION_REPORT_PAYLOAD_JSON_AUSENTE');
  return JSON.parse(match[1]);
}

async function construirArtefatoDedicado(parsed) {
  const { nome, tipo, reqs } = parsed;
  const slug = slugify(nome);
  const dir = join(PUBLIC, slug);
  await mkdir(dir, { recursive: true });

  log(`🏗️ Construindo (renderer dedicado): ${nome} (${tipo}) em ${dir}`);

  const payload = extrairPayloadJSON(reqs);
  const record = buildArtifactRecord({
    artifact_type: tipo,
    title: nome,
    slug,
    purpose: payload.purpose,
    story: payload.story ?? null,
    producer: payload.producer,
    mission_id: payload.mission_id ?? null,
    source: payload.source,
    state: payload.state ?? 'PROVED',
    views: { human: 'html', machine: 'manifest.json' },
    evidence: payload.data?.evidence ?? [],
    relations: payload.relations,
  });

  if (!record.validation.ok) {
    log(`⛔ Artefato BLOQUEADO (validação falhou): ${record.validation.errors.join(', ')}`);
  }

  const html = renderSessionReportHtml(record, payload.data);
  await writeFile(join(dir, 'index.html'), html, 'utf8');
  await writeFile(join(dir, 'style.css'), renderSessionReportCss(), 'utf8');
  await writeFile(join(dir, 'app.js'), '// renderer dedicado: sem JS de runtime, HTML já vem pronto do build\n', 'utf8');
  await writeFile(join(dir, 'manifest.json'), JSON.stringify(record, null, 2), 'utf8');

  await atualizarIndiceGlobal();
  log(`✅ Artefato construído (dedicado): ${slug} · state=${record.state} · digest=${record.content_digest.slice(0, 12)}`);
  return { slug, dir, manifest: record };
}

async function construirArtefato(parsed) {
  const { nome, tipo, desc, reqs, rotas, tema } = parsed;

  if (RENDERERS_DEDICADOS.has(tipo)) return construirArtefatoDedicado(parsed);

  const slug = slugify(nome);
  const dir = join(PUBLIC, slug);
  await mkdir(dir, { recursive: true });

  log(`🏗️ Construindo: ${
```

---

# COMANDO - orchestrator.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\core\orchestrator.mjs
**SHA:** 2378782c461cd68c
**Timestamp:** 2026-08-28T02:56:26.545363
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- decisao = await decidir(missao, historico);
- await lg(`etapa ${etapa} decisão: ${JSON.stringify(decisao).slice(0, 300)}`);

### Contratos
- gate: 'HERMES_FINALIZATION_CRITIC',

### Riscos
- const bloqueio = String(finalizacao.parecer || 'gate final indisponível').slice(0, 500);
- const bloqueio = String(finalizacao.parecer || 'prova insuficiente').slice(0, 500);

### Gaps
- const PENDENTE  = `${BASE}/missions/pendente`;

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
// 🧠 HERMES CORE v5.0 — Orquestrador central
// Loop 5s vigiando missions/pendente/ + retomada automática de órfãs (sobrevive a restart/crash).
// Delegação: decisor (core) escolhe a etapa → Executor executa → Critic audita → Knowledge-Collector registra.
import { readdir, readFile, writeFile, mkdir, rename, appendFile, stat, cp, rm, access } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer as httpCreateServer } from 'node:http';
import { renameComRetry as renameComRetryUtil } from '../utils/fs-safe.mjs';
import { continuityBlockReceipt, validateContinuityState } from './continuity-guard.mjs';

// Carrega /root/CentralDark/.env no boot — PM2 não herda ~/.bashrc (DARKAI_URL, DARKAI_ANON_KEY, ELITE_ANTHROPIC_TOKEN)
try {
  for (const l of readFileSync('/root/CentralDark/.env', 'utf8').split('\n')) {
    const line = l.split('#')[0].trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

// Sub-agentes — o Core só orquestra; todo trabalho pesado é deles.
// (Auto-Diagnostico e Deploy-Watcher são standalone: rodam como missão/cron, não moram no loop do Core.)
const { decidir } = await import('./decisor.mjs');                     // cérebro (DarkAI 17 modelos + memória GraphRAG)
const { executar } = await import('../agents/Executor/agent.mjs');     // braço (com travas)
const { auditar, auditarFinalizacao, resultadoAprovadoPeloCritic, vetar } = await import('../agents/Critic/agent.mjs'); // auditor + gate final
const { atualizarGrafo } = await import('../agents/GraphRAG-Master/agent.mjs'); // memória viva + auto-update do grafo

const BASE = dirname(dirname(fileURLToPath(import.meta.url))); // /root/CentralDark/apps/modulos/HERMES-CORE
const PENDENTE  = `${BASE}/missions/pendente`;
const ANDAMENTO = `${BASE}/missions/em-andamento`;
const CONCLUIDA = `${BASE}/missions/concluidas`;
const NOTIFY    = `${BASE}/utils/notify.mjs`;
const INTERVAL  = 5000;
const MAX_FALHAS = 3;

let ocupado = false; // trava: nunca rodar duas missões ao mesmo tempo

const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

// ── Rastreio de ENOTEMPTY (janela deslizante) — alimenta o /health ──
// Cada vez que um rename bate ENOTEMPTY, guardamos o timestamp. O /health conta
// quantos ocorreram nas últimas 24h. Se ficar > 0 por muito tempo, é sinal de FS problemático.
const enotemptyEvents = []; // timestamps ms
function registrarEnotempty(tag) {
  const now = Date.now();
  enotemptyEvents.push(now);
  const corte = now - 48 * 3600_000; // poda > 48h pra não crescer sem limite
  while (enotemptyEvents.length && enotemptyEvents[0] < corte) enotemptyEvents.shift();
  log('[enotempty] capturado (' + (tag || '') + ') — 24h agora=' + enotempty24h());
}
function enotempty24h() {
  const corte = Date.now() - 24 * 3600_000;
  return enotemptyEvents.filter(t => t >= corte).length;
}

async function notificar(titulo, mensagem, destino = 'ambos') {
  try {
    await new Promise((res, rej) => {
      exec(`node '${NOTIFY}' '${titulo.replace(/'/g,"'\\''")}' '${mensagem.replace(/'/g,"'\\''")}' '${destino}'`,
        { timeout: 30_000 }, (err) => err ? rej(err) : res());
    });
  } catch (e) { log('notify falhou:', e.message.slice(0,150)); }
}

function slugify(s) {
  return s.toLowerCase().replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || `m-${Date.now()}`;
}

async function pegarProximaMissao() {
  if (!existsSync(PENDENTE)) return null;
  const files = (await readdir(PENDENTE)).filter(f => f.endsWith('.md')).sort();
  return files[0] ? join(PENDENTE, files[0]) : null;
}

async function executarMissao(arquivoPendente) {
  const nome = arquivoPendente.split('/').pop().replace('.md', '');
  const slug = slugify(nome);
  const dir = join(ANDAMENTO, slug);
  await mkdir(dir, { recursive: true });

  const missao = (await readFile(arquivoPendente, 'utf8')).trim();
  { const rr = await renameComRetry(arquivoPendente, join(dir, 'missao.md'), 'pend->and'); if (!rr.ok) throw new Error('mover pendente falhou: ' + rr.error); }

  await notificar(
    `Hermes: nova missão`,
    `🚀 <b>${slug}</b>\n\n<i>${missao.slice(0, 400)}</i>\n\nProgresso será postado a cada etapa.`
  );

  await rodarMissao(dir, slug, missao, [], 0);
}

// 🔄 Missões órfãs: daemon caiu/reiniciou no meio — continua da etapa onde parou usando o state.json
// Agora aceita tanto pasta com missao.md quanto arquivo .json solto em missions/em-andamento/
// === renameComRetry: rename À PROVA DE BALAS (lógica em utils/fs-safe.mjs, testável isolada) ===
// Wrapper fino que injeta o logger do Core + o contador de ENOTEMPTY do /health.
function renameComRetry(src, dst, tag) {
  re
```

---

# COMANDO - orchestrator.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\evidence\session-completa-20260806\.extracted_GATILHO-UNIVERSAL-IA-RIGOR-MAXIMO\GATILHO-UNIVERSAL-IA\src\orchestrator.mjs
**SHA:** c2136bc312287285
**Timestamp:** 2026-08-28T02:57:24.415303
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `COMANDO=${invocation.prefix}${invocation.name}`,
- prompt: user,

### Ouro Bruto (primeiros 5000 chars)
```
import path from "node:path";
import crypto from "node:crypto";
import { loadConfig, packageRoot } from "./config-loader.mjs";
import { resolveProviders, buildRouteCandidates } from "./provider-registry.mjs";
import { callWithFallback } from "./provider-client.mjs";
import { loadTarget } from "./target-loader.mjs";
import { buildReceipt, saveReceipt } from "./receipt.mjs";
import { sanitizeText } from "./sanitize.mjs";

/**
 * LEIGO: transforma o alvo carregado em contexto curto para o modelo.
 * PROFISSIONAL: serializa snapshot limitado com inventário, excerpts e hashes, nunca segredos ou binário.
 */
function targetToPrompt(target) {
  if (target.type === "directory") return JSON.stringify({ type: target.type, path: target.path, inventory: target.inventory, excerpts: target.excerpts }, null, 2);
  return JSON.stringify(target, null, 2);
}

/**
 * LEIGO: escolhe uma rota diferente da primeira para o crítico ou juiz.
 * PROFISSIONAL: seleciona provider/model não usado e devolve null quando independência real não existe.
 */
/**
 * LEIGO: dá um nome técnico à rota real usada.
 * PROFISSIONAL: identidade operacional por endpoint+model para distinguir aliases de independência real.
 */
function routeIdentity(route) {
  return `${route.provider.endpoint}|${route.model}`;
}

/**
 * LEIGO: escolhe uma rota realmente diferente, não apenas outro apelido para a mesma API.
 * PROFISSIONAL: independência é calculada por endpoint+model, evitando aliases falsamente independentes.
 */
function chooseDistinctRoute(routes, usedPairs) {
  return routes.find((route) => !usedPairs.has(routeIdentity(route))) || null;
}

/**
 * LEIGO: executa #nome como chamada normal e !nome como ataque adversarial com crítico e juiz.
 * PROFISSIONAL: coordena config, target snapshot, fallback, independência, fail-closed e receipt persistente.
 */
export async function executeInvocation(invocation, options = {}) {
  const config = await loadConfig({ configDir: options.configDir });
  const profile = config.commands.commands[invocation.name];
  if (!profile) throw new Error(`COMMAND_UNKNOWN:${invocation.name}`);
  if (profile.requiredTarget && !invocation.target) throw new Error("TARGET_REQUIRED");

  const allowedRootSource = options.lockAllowedRoots
    ? (options.allowedRoot || "")
    : (invocation.flags["allowed-root"] || options.allowedRoot || "");
  const allowedRoots = String(allowedRootSource)
    .split(";").map((x) => x.trim()).filter(Boolean);
  const target = await loadTarget(invocation.target, { allowedRoots });
  const providers = resolveProviders(config.providers, options.env || process.env);
  if (!providers.length) throw new Error("NO_PROVIDER_AVAILABLE");

  const preferences = {
    provider: invocation.flags.provider || profile.defaultProvider || null,
    model: invocation.flags.model || null,
  };
  let routes;
  if (invocation.flags.provider) {
    // Provider escrito pelo usuário é seleção estrita.
    routes = buildRouteCandidates(providers, preferences);
  } else {
    // Provider padrão apenas recebe prioridade; os demais continuam como fallback e independência adversarial.
    routes = buildRouteCandidates(providers, { model: preferences.model });
    routes.sort((a, b) => Number(b.provider.id === preferences.provider) - Number(a.provider.id === preferences.provider));
  }

  const user = [
    `COMANDO=${invocation.prefix}${invocation.name}`,
    `MODO=${invocation.mode}`,
    `ALVO=${invocation.target || "NENHUM"}`,
    "SNAPSHOT_DO_ALVO_SANITIZADO:",
    sanitizeText(targetToPrompt(target), 180000),
    invocation.flags.instrucao ? `INSTRUCAO_EXTRA=${sanitizeText(invocation.flags.instrucao, 4000)}` : "",
  ].filter(Boolean).join("\n\n");

  const requestId = crypto.randomUUID();
  const callOptions = { ...options, requestId };
  let output;
  let finalRoute;
  let independence = "NOT_APPLICABLE";
  if (invocation.mode === "standard") {
    const primary = await callWithFallback(routes, { system: profile.system, user }, callOptions);
    output = primary.text;
    finalRoute = primary;
  } else {
    const primary = await callWithFallback(routes, { system: profile.system, user }, callOptions);
    const primaryRoute = routes.find((route) => route.provider.id === primary.provider && route.model === primary.model);
    const used = new Set([routeIdentity(primaryRoute)]);

    const criticRoutes = routes.filter((route) => !used.has(routeIdentity(route)));
    if (!criticRoutes.length) throw new Error("INDEPENDENT_CRITIC_UNAVAILABLE");
    const critic = await callWithFallback(criticRoutes, {
      system: profile.criticSystem,
      user: `ALVO E SNAPSHOT:
${user}

RESPOSTA_PRIMARIA:
${primary.text}`,
    }, callOptions);
    const actualCriticRoute = criticRoutes.find((route) => route.provider.id === critic.provider && route.model === critic.model);
    used.add(routeIdentity(actualCriticRoute));

    const judgeRoutes = routes.filter((route) => !used.has(routeIdentity(route)));
    const allowReusedJudge = invocati
```
# OUTRO - github-bot-controller.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\scripts\github-bot-controller.mjs
**SHA:** be2f8a7e4750c1b7
**Timestamp:** 2026-08-26T19:32:46.628595
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- `Dry-run: ${dryRun}`,
- `Dry-run: ${dryRun}`,
- const dryRun = resolveDryRun(event);
- log(`event=${eventName} dryRun=${dryRun} repository=${repository}`);
- await auditOpenPrs({ dryRun: true });
- await auditOpenPrs({ dryRun: true });
- validateOfficialRepository({ dryRun: true });

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * CentralDark GitHub Bot Controller
 *
 * Objetivo:
 * - Auditar PRs abertas.
 * - Quando uma PR mergeada declarar `Bot-Supersedes: #14 #16`, comentar e fechar PRs substituídas.
 * - Nunca faz merge automático.
 * - Não toca VPS, PM2, Caddy, Docker, WuzAPI, WhatsApp, CRM ou banco real.
 */

import fs from 'node:fs';

const apiBase = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const expectedRepository = process.env.BOT_EXPECTED_REPOSITORY || 'ServerVpss/CentralDark';
const eventName = process.env.GITHUB_EVENT_NAME || 'manual';
const eventPath = process.env.GITHUB_EVENT_PATH;
const manualSupersedes = process.env.BOT_SUPERSEDES || '';
const manualMergedPr = Number(process.env.BOT_MERGED_PR || 0) || undefined;
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!token) {
  throw new Error('GITHUB_TOKEN ausente.');
}

if (!repository || !repository.includes('/')) {
  throw new Error('GITHUB_REPOSITORY inválido.');
}

const [owner, repo] = repository.split('/');

function isPullRequestMergedEvent(event) {
  return eventName === 'pull_request' && event?.action === 'closed' && event?.pull_request?.merged === true;
}

function resolveDryRun(event) {
  const raw = String(process.env.DRY_RUN || '').trim().toLowerCase();

  if (raw === 'false') return false;
  if (raw === 'true') return true;

  // Para evento automático de PR mergeada com Bot-Supersedes, o fluxo pode aplicar a ação real.
  // Para schedule/manual sem input explícito, mantém auditoria em dry-run.
  return !isPullRequestMergedEvent(event);
}

function validateOfficialRepository({ dryRun }) {
  if (repository === expectedRepository) return;

  const message = [
    `Repositório atual não autorizado: ${repository}`,
    `Esperado: ${expectedRepository}`,
    'O GitHub Bot Controller não fecha PRs fora do repositório oficial.',
  ].join('\n');

  if (!dryRun) {
    throw new Error(message);
  }

  log(`[dry-run] ${message.replaceAll('\n', ' | ')}`);
}

function log(message) {
  console.log(`[github-bot-controller] ${message}`);
}

function parseSupersedes(text) {
  if (!text) return [];

  const matches = [];
  const regex = /^\s*Bot-Supersedes\s*:\s*(.+)$/gim;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const line = match[1] || '';
    const nums = [...line.matchAll(/#(\d+)/g)].map((m) => Number(m[1])).filter(Boolean);
    matches.push(...nums);
  }

  return [...new Set(matches)].sort((a, b) => a - b);
}

async function gh(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`GitHub API ${options.method || 'GET'} ${path} falhou: ${response.status} ${JSON.stringify(data).slice(0, 500)}`);
  }

  return data;
}

async function listOpenPullRequests() {
  const prs = await gh(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`);
  return Array.isArray(prs) ? prs : [];
}

async function getPullRequest(number) {
  return gh(`/repos/${owner}/${repo}/pulls/${number}`);
}

async function commentIssue(number, body, { dryRun }) {
  if (dryRun) {
    log(`[dry-run] comentaria na PR #${number}: ${body.split('\n')[0]}`);
    return;
  }

  await gh(`/repos/${owner}/${repo}/issues/${number}/comments`, {
    method: 'POST',
    body: { body },
  });
}

async function closePullRequest(number, { dryRun }) {
  if (dryRun) {
    log(`[dry-run] fecharia a PR #${number}`);
    return;
  }

  await gh(`/repos/${owner}/${repo}/pulls/${number}`, {
    method: 'PATCH',
    body: { state: 'closed' },
  });
}

function readEvent() {
  if (!eventPath) return {};
  try {
    return JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  } catch {
    return {};
  }
}

function appendSummary(markdown) {
  if (!summaryPath) return;
  fs.appendFileSync(summaryPath, `${markdown}\n`);
}

async function auditOpenPrs({ dryRun }) {
  const prs = await listOpenPullRequests();

  const rows = prs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    draft: Boolean(pr.draft),
    head: pr.head?.ref,
    base: pr.base?.ref,
    updated_at: pr.updated_at,
  }));

  log(`PRs abertas: ${rows.length}`);
  for (const pr of rows) {
    log(`#${pr.number} ${pr.title} (${pr.head} -> ${pr.base})`);
  }

  appendSummary([
    '# GitHub Bot Controller',
    '',
    'Modo: auditoria',
    `Dry-run: ${dryRun}`,
    `Repositório: ${repository}`,
    `PRs abertas: ${rows.length}`,
    '',
    ...rows.map((pr) => `- #${pr.number} ${pr.title} \`${pr.head}->${pr.base}\``),
  
```

---

# OUTRO - github-bot-controller.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\github-bot-controller.mjs
**SHA:** 041a1f7482125b9f
**Timestamp:** 2026-08-28T02:57:33.018384
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- //         * DRY_RUN=false explícito.
- const DRY_RUN = (process.env.DRY_RUN ?? "true") !== "false";
- console.log(`[controller] repo=${REPO} event=${EVENT} dry_run=${DRY_RUN}`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
// GitHub Bot Controller — versão segura e reversível.
//
// Modos:
//   - workflow_dispatch com BOT_MERGED_PR e BOT_SUPERSEDES:
//       ÚNICO modo autorizado a fechar PRs, e só quando:
//         * merged_pr está mergeado (merged_at != null);
//         * cada nº em supersedes está aberto;
//         * o corpo/título do merged_pr referencia explicitamente cada superseded
//           (via "#<n>" ou "Supersedes: #<n>");
//         * DRY_RUN=false explícito.
//       Ação: comentar no superseded citando o merged, aplicar label "superseded",
//       e SÓ ENTÃO fechar (state=closed). Nunca fecha issues.
//   - pull_request.closed e schedule:
//       Modo AUDITORIA. Gera relatório em docs/RELATORIOS/github-bot-controller/<data>.md.
//       NÃO fecha nada. NÃO fecha por idade.
//
// Segurança:
//   - Valida BOT_EXPECTED_REPOSITORY == GITHUB_REPOSITORY.
//   - Sem force-push, sem tocar em main, sem tocar em secrets.
//   - Log estruturado. Rate-limit ciente.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const githubCredential = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY || "";
const EXPECTED = process.env.BOT_EXPECTED_REPOSITORY || "";
const EVENT = process.env.BOT_EVENT_NAME || "unknown";
const DRY_RUN = (process.env.DRY_RUN ?? "true") !== "false";
const MERGED_PR = (process.env.BOT_MERGED_PR || "").trim();
const SUPERSEDES = (process.env.BOT_SUPERSEDES || "").trim();

if (!githubCredential) {
  console.error("[controller] faltando GITHUB_TOKEN — abortando");
  process.exit(1);
}
if (!REPO) {
  console.error("[controller] GITHUB_REPOSITORY vazio — abortando");
  process.exit(1);
}
if (EXPECTED && EXPECTED !== REPO) {
  console.error(`[controller] repo divergente: esperado=${EXPECTED} atual=${REPO} — abortando`);
  process.exit(1);
}

const API = "https://api.github.com";
async function gh(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${githubCredential}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-controller/1.0",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub ${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  if (res.status === 404) return null;
  if (res.status === 204) return {};
  return res.json();
}

function parseNumbers(input) {
  return Array.from(new Set(
    (input.match(/\d+/g) || []).map((n) => parseInt(n, 10)).filter((n) => n > 0)
  ));
}

function referencesNumber(text, n) {
  if (!text) return false;
  const re = new RegExp(`(^|[^0-9])#${n}(?![0-9])`, "m");
  return re.test(text);
}

async function auditMode() {
  // Lista PRs abertos e gera relatório read-only.
  const prs = await gh("GET", `/repos/${REPO}/pulls?state=open&per_page=100`);
  const lines = [];
  lines.push(`# Relatório GitHub Bot Controller — ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`Evento: ${EVENT} · Modo: AUDITORIA (não fecha nada)`);
  lines.push("");
  lines.push(`Total de PRs abertos: ${prs?.length ?? 0}`);
  lines.push("");
  if (prs && prs.length) {
    lines.push("| # | título | base | head | autor |");
    lines.push("|---|--------|------|------|-------|");
    for (const p of prs) {
      const t = (p.title || "").replace(/\|/g, "\\|");
      lines.push(`| #${p.number} | ${t} | ${p.base?.ref ?? "?"} | ${p.head?.ref ?? "?"} | ${p.user?.login ?? "?"} |`);
    }
  }
  lines.push("");
  lines.push("_Nenhuma ação foi tomada. Este modo é somente leitura._");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `docs/RELATORIOS/github-bot-controller/${stamp}.md`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, lines.join("\n"), "utf8");
  console.log(`[controller] relatório escrito: ${path}`);
}

async function closeSupersededMode() {
  const mergedNum = parseInt(MERGED_PR.replace(/[^0-9]/g, ""), 10);
  const supersededNums = parseNumbers(SUPERSEDES);
  if (!mergedNum || supersededNums.length === 0) {
    console.log("[controller] merged_pr/supersedes ausentes — nada a fazer");
    return;
  }

  const merged = await gh("GET", `/repos/${REPO}/pulls/${mergedNum}`);
  if (!merged) throw new Error(`PR #${mergedNum} não encontrado`);
  if (!merged.merged_at) {
    throw new Error(`PR #${mergedNum} não está mergeado — abortando fechamento`);
  }

  const contextText = `${merged.title || ""}\n\n${merged.body || ""}`;

  for (const n of supersededNums) {
    if (n === mergedNum) {
      console.warn(`[controller] pulando #${n} (é o próprio merged_pr)`);
      continue;
    }
    const target = await gh("GET", `/repos/${REPO}/pulls/${n}`);
    if (!target) { console.warn(`[control
```
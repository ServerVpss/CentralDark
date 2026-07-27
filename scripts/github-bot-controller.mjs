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

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY || "";
const EXPECTED = process.env.BOT_EXPECTED_REPOSITORY || "";
const EVENT = process.env.BOT_EVENT_NAME || "unknown";
const DRY_RUN = (process.env.DRY_RUN ?? "true") !== "false";
const MERGED_PR = (process.env.BOT_MERGED_PR || "").trim();
const SUPERSEDES = (process.env.BOT_SUPERSEDES || "").trim();

if (!TOKEN) {
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
      Authorization: `Bearer ${TOKEN}`,
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
    if (!target) { console.warn(`[controller] PR #${n} não existe — pulando`); continue; }
    if (target.state !== "open") { console.warn(`[controller] PR #${n} não está aberto (state=${target.state}) — pulando`); continue; }
    if (!referencesNumber(contextText, n)) {
      console.warn(`[controller] PR #${mergedNum} não referencia explicitamente #${n} — pulando por segurança`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry] comentaria + label superseded + fecharia PR #${n} (substituído por #${mergedNum})`);
      continue;
    }

    await gh("POST", `/repos/${REPO}/issues/${n}/comments`, {
      body: `Este PR foi substituído por #${mergedNum} (mergeado). Fechando via github-bot-controller com autorização explícita.`,
    });
    await gh("POST", `/repos/${REPO}/issues/${n}/labels`, { labels: ["superseded"] });
    await gh("PATCH", `/repos/${REPO}/pulls/${n}`, { state: "closed" });
    console.log(`[controller] PR #${n} fechado (substituído por #${mergedNum})`);
  }
}

(async () => {
  console.log(`[controller] repo=${REPO} event=${EVENT} dry_run=${DRY_RUN}`);
  if (EVENT === "workflow_dispatch" && MERGED_PR) {
    await closeSupersededMode();
  } else {
    await auditMode();
  }
})().catch((e) => {
  console.error(`[controller] erro: ${e.message}`);
  process.exit(1);
});

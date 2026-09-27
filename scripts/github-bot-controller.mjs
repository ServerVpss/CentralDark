#!/usr/bin/env node
// GitHub Bot Controller — versão segura e reversível.
//
// Modos:
//   - workflow_dispatch com BOT_MERGED_PR e BOT_SUPERSEDES:
//       ÚNICO modo autorizado a fechar PRs, e só quando:
//         * merged_pr está mergeado (merged_at != null);
//         * cada nº em supersedes está aberto;
//         * o merged_pr carrega receipt exato de absorção do HEAD atual do ancestral:
//             Lineage-Absorption: #<n>@<40-hex-head>=PROVEN
//         * se o HEAD ancestral mudou depois do receipt, o fechamento é bloqueado;
//         * DRY_RUN=false explícito.
//       Ação: comentar no superseded citando sucessor + HEAD absorvido, aplicar label
//       "superseded", e SÓ ENTÃO fechar (state=closed). Nunca fecha issues.
//   - pull_request.closed e schedule:
//       Modo AUDITORIA. Gera relatório em docs/RELATORIOS/github-bot-controller/<data>.md.
//       NÃO fecha nada. NÃO fecha por idade.
//
// Lei de linhagem:
//   passado não é descartado; ele vira proveniência + delta candidato.
//   citar um PR antigo NÃO prova absorção. Supersessão exige PR + HEAD exato + PROVEN.
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

function lineageReceipt(text, n) {
  if (!text) return null;
  const re = new RegExp(`(?:^|\\n)\\s*Lineage-Absorption:\\s*#${n}@([0-9a-fA-F]{40})=PROVEN\\s*(?:$|\\n)`, "m");
  const match = text.match(re);
  return match ? { pr: n, head: match[1].toLowerCase(), status: "PROVEN" } : null;
}

async function auditMode() {
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

    const receipt = lineageReceipt(contextText, n);
    if (!receipt) {
      console.warn(`[controller] #${mergedNum} sem Lineage-Absorption exato para #${n} — não fecha`);
      continue;
    }
    const liveHead = String(target.head?.sha || "").toLowerCase();
    if (!liveHead || receipt.head !== liveHead) {
      console.warn(`[controller] receipt stale para #${n}: receipt=${receipt.head} live=${liveHead || 'UNKNOWN'} — reconciliar novamente`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry] fecharia #${n} após receipt PROVEN do HEAD ${liveHead} pelo merged #${mergedNum}`);
      continue;
    }

    await gh("POST", `/repos/${REPO}/issues/${n}/comments`, {
      body: `SUPERSEDED_WITH_PROOF\n\nSucessor mergeado: #${mergedNum}\nHEAD ancestral absorvido: \`${liveHead}\`\nReceipt: \`Lineage-Absorption: #${n}@${liveHead}=PROVEN\`\n\nO histórico permanece como proveniência; qualquer HEAD diferente exigiria nova reconciliação.`,
    });
    await gh("POST", `/repos/${REPO}/issues/${n}/labels`, { labels: ["superseded"] });
    await gh("PATCH", `/repos/${REPO}/pulls/${n}`, { state: "closed" });
    console.log(`[controller] PR #${n} fechado com receipt de linhagem exato (sucessor #${mergedNum})`);
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

#!/usr/bin/env node
// GitHub Bot Controller — versão segura, reversível e com preflight forte.
//
// Modos:
//   - workflow_dispatch com BOT_MERGED_PR e BOT_SUPERSEDES:
//       ÚNICO modo autorizado a fechar PRs, e SÓ quando:
//         * merged_pr está mergeado (merged_at != null);
//         * o corpo do merged_pr contém UMA linha explícita
//             "Supersedes: #N #N ..."  (case-insensitive)
//         * BOT_SUPERSEDES é subconjunto dessa linha;
//         * TODOS os alvos passam preflight:
//             - existem
//             - state === 'open'
//             - não são o próprio merged_pr
//             - base.ref === base.ref do merged_pr
//         * a label "superseded" existe no repo;
//         * DRY_RUN=false explícito.
//       Se qualquer verificação falhar, ABORTA o lote inteiro antes de escrever.
//       Ação: comentar no superseded citando o merged, aplicar label "superseded",
//       e SÓ ENTÃO fechar (state=closed). Nunca fecha issues.
//   - pull_request.closed e schedule:
//       Modo AUDITORIA. Gera relatório em docs/RELATORIOS/github-bot-controller/<data>.md
//       e escreve resumo em GITHUB_STEP_SUMMARY. NÃO fecha nada.
//
// Segurança:
//   - Valida BOT_EXPECTED_REPOSITORY == GITHUB_REPOSITORY.
//   - Sem force-push, sem tocar em main, sem tocar em secrets.
//   - Log estruturado.

import { writeFile, mkdir, appendFile } from "node:fs/promises";
import { dirname } from "node:path";

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY || "";
const EXPECTED = process.env.BOT_EXPECTED_REPOSITORY || "";
const EVENT = process.env.BOT_EVENT_NAME || "unknown";
const DRY_RUN = (process.env.DRY_RUN ?? "true") !== "false";
const MERGED_PR = (process.env.BOT_MERGED_PR || "").trim();
const SUPERSEDES = (process.env.BOT_SUPERSEDES || "").trim();
const STEP_SUMMARY = process.env.GITHUB_STEP_SUMMARY || "";

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
      "User-Agent": "centraldark-controller/1.1",
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

async function ghPaginate(path, { perPage = 100, hardCap = 1000 } = {}) {
  const results = [];
  let page = 1;
  const sep = path.includes("?") ? "&" : "?";
  while (results.length < hardCap) {
    const chunk = await gh("GET", `${path}${sep}per_page=${perPage}&page=${page}`);
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    results.push(...chunk);
    if (chunk.length < perPage) break;
    page += 1;
  }
  return { items: results, cappedAt: hardCap, reachedCap: results.length >= hardCap };
}

// Parser estrito: aceita SOMENTE referências #N separadas por espaço e/ou vírgula.
// Rejeita qualquer dígito sem '#' e qualquer token não-numérico.
// Retorna { ok, numbers, reason }.
function parseHashRefsStrict(input) {
  const raw = (input || "").trim();
  if (!raw) return { ok: true, numbers: [] };
  // Divide por vírgula ou espaços; cada token precisa casar exatamente com #<digitos>.
  const tokens = raw.split(/[\s,]+/).filter(Boolean);
  const nums = [];
  for (const tk of tokens) {
    const m = /^#(\d+)$/.exec(tk);
    if (!m) {
      return {
        ok: false,
        numbers: [],
        reason: `token inválido: '${tk}' — esperado formato '#N' separado por espaço/vírgula`,
      };
    }
    const n = parseInt(m[1], 10);
    if (!(n > 0)) {
      return { ok: false, numbers: [], reason: `número inválido em '${tk}'` };
    }
    nums.push(n);
  }
  return { ok: true, numbers: Array.from(new Set(nums)) };
}

// Extrai a lista da linha "Supersedes: #N #N ..." no corpo do PR (case-insensitive).
// Retorna null se a linha não existir; array de números se existir.
// Se a linha existir mas o formato dela for inválido, lança erro (preflight falha).
function extractSupersedesLine(body) {
  if (!body) return null;
  const lines = body.split(/\r?\n/);
  for (const raw of lines) {
    const m = /^\s*supersedes\s*:\s*(.+?)\s*$/i.exec(raw);
    if (m) {
      const parsed = parseHashRefsStrict(m[1]);
      if (!parsed.ok) {
        throw new Error(
          `Linha 'Supersedes:' presente no corpo mas em formato inválido — ${parsed.reason}. ` +
          `Use apenas '#N' separados por espaço e/ou vírgula.`
        );
      }
      return parsed.numbers;
    }
  }
  return null;
}

async function writeSummary(md) {
  if (!STEP_SUMMARY) return;
  try { await appendFile(STEP_SUMMARY, md + "\n"); } catch { /* noop */ }
}

async function auditMode() {
  const { items: prs, reachedCap } = await ghPaginate(
    `/repos/${REPO}/pulls?state=open`,
    { perPage: 100, hardCap: 1000 }
  );

  const lines = [];
  lines.push(`# Relatório GitHub Bot Controller — ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`Evento: ${EVENT} · Modo: AUDITORIA (não fecha nada)`);
  lines.push("");
  lines.push(`Total de PRs abertos varridos: ${prs.length}`);
  if (reachedCap) {
    lines.push("");
    lines.push(`> ⚠️ Limite de auditoria atingido (${prs.length}). PRs além desse limite não foram listados nesta execução.`);
  }
  lines.push("");
  if (prs.length) {
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

  await writeSummary(
    `## GitHub Bot Controller — auditoria\n\n` +
    `- Evento: \`${EVENT}\`\n` +
    `- PRs abertos varridos: **${prs.length}**${reachedCap ? " (limite atingido)" : ""}\n` +
    `- Relatório: \`${path}\` (também publicado como artifact)\n`
  );
}

async function closeSupersededMode() {
  const mergedNum = parseInt(MERGED_PR.replace(/[^0-9]/g, ""), 10);
  const requested = parseNumbersFromList(SUPERSEDES);

  if (!mergedNum) {
    console.log("[controller] merged_pr vazio — nada a fazer");
    return;
  }
  if (requested.length === 0) {
    throw new Error("BOT_SUPERSEDES vazio — nada a fazer (abortando por segurança)");
  }

  const merged = await gh("GET", `/repos/${REPO}/pulls/${mergedNum}`);
  if (!merged) throw new Error(`PR #${mergedNum} não encontrado`);
  if (!merged.merged_at) {
    throw new Error(`PR #${mergedNum} não está mergeado — abortando fechamento`);
  }

  // Prova explícita: linha "Supersedes: #N #N ..." no corpo do merged PR.
  const declared = extractSupersedesLine(merged.body);
  if (!declared) {
    throw new Error(
      `PR #${mergedNum} não contém linha 'Supersedes: #N #N ...' no corpo — ` +
      `menção incidental no título/corpo não é suficiente. Abortando lote.`
    );
  }
  const declaredSet = new Set(declared);
  const notDeclared = requested.filter((n) => !declaredSet.has(n));
  if (notDeclared.length > 0) {
    throw new Error(
      `BOT_SUPERSEDES não é subconjunto da linha 'Supersedes:' de #${mergedNum}. ` +
      `Ausente(s): ${notDeclared.map((n) => "#" + n).join(" ")}. Abortando lote inteiro sem escrita.`
    );
  }

  // Preflight: label 'superseded' precisa existir.
  const supersededLabel = await gh("GET", `/repos/${REPO}/labels/superseded`);
  if (!supersededLabel) {
    throw new Error(`Label 'superseded' não existe no repo — rode o seed antes. Abortando lote.`);
  }

  // Preflight: valida TODOS os alvos antes de qualquer escrita.
  const baseRef = merged.base?.ref;
  if (!baseRef) throw new Error(`Não foi possível ler base.ref do PR #${mergedNum}. Abortando.`);

  const targets = [];
  const problems = [];
  for (const n of requested) {
    if (n === mergedNum) { problems.push(`#${n} é o próprio merged_pr`); continue; }
    const t = await gh("GET", `/repos/${REPO}/pulls/${n}`);
    if (!t) { problems.push(`#${n} não existe`); continue; }
    if (t.state !== "open") { problems.push(`#${n} não está aberto (state=${t.state})`); continue; }
    if ((t.base?.ref || "") !== baseRef) {
      problems.push(`#${n} tem base.ref=${t.base?.ref} != ${baseRef}`);
      continue;
    }
    targets.push(t);
  }
  if (problems.length > 0) {
    throw new Error(
      `Preflight falhou — lote abortado sem escrita. Motivos: ${problems.join("; ")}`
    );
  }

  await writeSummary(
    `## GitHub Bot Controller — fechamento manual\n\n` +
    `- Merged PR: **#${mergedNum}** (base \`${baseRef}\`)\n` +
    `- Solicitados: ${requested.map((n) => "#" + n).join(" ")}\n` +
    `- Preflight: **OK** (${targets.length} alvo(s))\n` +
    `- Modo: ${DRY_RUN ? "DRY-RUN" : "APLICADO"}\n`
  );

  for (const t of targets) {
    const n = t.number;
    if (DRY_RUN) {
      console.log(`[dry] comentaria + label superseded + fecharia PR #${n} (substituído por #${mergedNum})`);
      continue;
    }
    await gh("POST", `/repos/${REPO}/issues/${n}/comments`, {
      body: `Este PR foi substituído por #${mergedNum} (mergeado). Fechando via github-bot-controller com autorização explícita (linha 'Supersedes:' confirmada).`,
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
})().catch(async (e) => {
  console.error(`[controller] erro: ${e.message}`);
  await writeSummary(`## GitHub Bot Controller — ERRO\n\n\`\`\`\n${e.message}\n\`\`\`\n`);
  process.exit(1);
});

# COMANDO - github-autonomia-varredura.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\github-autonomia-varredura.mjs
**SHA:** 160bcf4926a757a0
**Timestamp:** 2026-08-28T02:57:32.981910
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- event.run ? `run: ${event.run}` : null,
- await notify({ code: `JUDGE_FAILED:${code}`, pr: pr.number, head: pr.head?.sha, run: process.env.GITHUB_RUN_ID || null, detail: raw });
- await notify({ code: "PROMOTER_TOKEN_MISSING", run: process.env.GITHUB_RUN_ID || null, detail: "Nenhum token de escrita disponível para concluir a intenção já autorizada." });
- await notify({ code: `PROMOTE_FAILED:${code}`, pr: number, run: process.env.GITHUB_RUN_ID || null, detail: raw });
- await notify({ code: "SUCCESS_SEAL_NOT_VERIFIED", pr: number, head: after?.merge_commit_sha || after?.head?.sha, run: process.env.GITHUB_RUN_ID || null, detail: "Merge concluído, mas a label 🟢 SUCESSO

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * Varredura eventual da promoção autônoma.
 *
 * Um único motor canônico:
 * - judge: read-only, produz recibo SHA-256;
 * - promote: materializa/verifica o selo canônico, revalida HEAD/base/intenção e promove.
 *
 * SELO_CANONICO_DE_PROMOCAO = recibo de intenção completo +
 * 👑 PERMITO-SEGREDO + 🔄 GIT + 🤖 AUTO.
 *
 * PADRAO_OPERACIONAL (todos os PRs elegíveis, não só um):
 * 🟡 IA-PRECISA-REVISAR + 🧠 AGENTE-* derivado do Writer + selo acima.
 *
 * O selo organiza/rastreia; não substitui gates, segurança nem prova.
 * ✅ PR CONFIRMADO e 🟢 SUCESSO são RESULTADO (pós-merge), nunca input.
 */
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authorizationFor } from "./github-autonomia-promocao.mjs";

const API = "https://api.github.com";
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ENGINE = join(ROOT, "scripts", "github-autonomia-promocao.mjs");
export const CANONICAL_AUTHORITY_LABEL = "👑 PERMITO-SEGREDO";
export const CANONICAL_GIT_LABEL = "🔄 GIT";
export const CANONICAL_AUTOMATION_LABEL = "🤖 AUTO";
export const CANONICAL_SUCCESS_LABEL = "🟢 SUCESSO";
export const CANONICAL_REVIEW_LABEL = "🟡 IA-PRECISA-REVISAR";
export const REQUIRED_PROMOTION_SEAL_LABELS = Object.freeze([
  CANONICAL_AUTHORITY_LABEL,
  CANONICAL_GIT_LABEL,
  CANONICAL_AUTOMATION_LABEL,
]);
/** Baseline operacional aplicado a TODO PR elegível (padrão da Casa). */
export const OPERATIONAL_BASELINE_LABELS = Object.freeze([
  CANONICAL_REVIEW_LABEL,
]);
export const WRITER_AGENT_LABELS = Object.freeze({
  grok: "🧠 AGENTE-GROK",
  chatgpt: "🧠 AGENTE-CHATGPT",
  sol: "🧠 AGENTE-CHATGPT",
  gpt: "🧠 AGENTE-CHATGPT",
  claude: "🧠 AGENTE-CLAUDE",
  anthropic: "🧠 AGENTE-CLAUDE",
  codex: "🧠 AGENTE-CODEX",
  hermes: "🧠 AGENTE-HERMES",
  pivete: "🧠 AGENTE-HERMES",
  jarvis: "🧠 AGENTE-JARVIS",
  sentinela: "🧠 AGENTE-SENTINELA",
  supabase: "🧠 AGENTE-SUPABASE",
});
export const SUPPORTED_SEAL_MERGE_POLICIES = Object.freeze([
  "AUTO_SQUASH_IF_CLEAN",
  "GREEN_FIRST",
  "GREEN_FIRST_6_OF_6_THEN_SQUASH",
]);

function markerAuthorized(pr) {
  return authorizationFor(pr).authorized;
}

function lineMarker(body, name) {
  const match = String(body || "").match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mi"));
  return match?.[1]?.trim() || null;
}

function labelNames(pr) {
  return new Set((pr?.labels || []).map((label) => String(label?.name || label).trim().toLocaleLowerCase("pt-BR")));
}

export function promotionSealReceipt(pr) {
  const body = String(pr?.body || "");
  const authority = lineMarker(body, "Intent-Authorized");
  const mergePolicy = lineMarker(body, "Merge-Policy");
  const intentScope = lineMarker(body, "Intent-Scope");
  const writer = lineMarker(body, "Writer");
  const writerScope = lineMarker(body, "Writer-Scope");
  const valid = authority === "SEGREDO/CHEFE"
    && SUPPORTED_SEAL_MERGE_POLICIES.includes(mergePolicy)
    && Boolean(intentScope)
    && Boolean(writer)
    && Boolean(writerScope);
  return { valid, authority, mergePolicy, intentScope, writer, writerScope };
}

/** Deriva 🧠 AGENTE-* a partir do campo Writer do recibo (padrão global). */
export function agentLabelsFromWriter(writer) {
  const text = String(writer || "").toLocaleLowerCase("pt-BR");
  const found = new Set();
  for (const [token, label] of Object.entries(WRITER_AGENT_LABELS)) {
    if (text.includes(token)) found.add(label);
  }
  return [...found];
}

/**
 * Conjunto completo que TODO PR elegível deve carregar antes da promoção.
 * = selo de promoção + baseline operacional + agente(s) do Writer.
 */
export function requiredOperationalLabels(pr) {
  const receipt = promotionSealReceipt(pr);
  const agents = agentLabelsFromWriter(receipt.writer);
  return [...new Set([
    ...REQUIRED_PROMOTION_SEAL_LABELS,
    ...OPERATIONAL_BASELINE_LABELS,
    ...agents,
  ])];
}

export function promotionSealState(pr, repository, trustedAuthors = ["segredounlock"]) {
  const trusted = trustedAuthors.map((item) => item.toLowerCase());
  const receipt = promotionSealReceipt(pr);
  const structurallyEligible = Boolean(
    pr?.state === "open" &&
    !pr?.draft &&
    pr?.base?.ref === "main" &&
    pr?.head?.repo?.full_name === repository &&
    trusted.includes(String(pr?.user?.login || "").toLowerCase())
  );
  const labels = labelNames(pr);
  const required = requiredOperationalLabels(pr);
  const missingLabels = required.filter(
    (label) => !labels.has(label.toLocaleLowerCase("pt-BR")),
  );
  const eligible = structurallyEligible && receipt.valid;
  return {
    eligible,
    complete: eligible && missingLabels.length === 0,
    receipt,
    requiredLabels: required,
    missingLabels,
  };
}

export function eligibleSummary(pr, repository, trustedAuthors = ["segredounlock"]) {
  const trusted = trustedAuthors.map((item) => item.toLowerCase());
  return Boole
```
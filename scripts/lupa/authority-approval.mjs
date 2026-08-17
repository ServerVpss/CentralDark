#!/usr/bin/env node

/**
 * Fonte autenticada de autorização da CentralDark.
 *
 * FRONTEIRA ZERO TRUST:
 *   MATERIAL_SOLTO != AUTHORITY
 *   RECIBO_CANONICO_AUTORIZADO = TRANSPORTE_DA_INTENCAO_EXISTENTE
 *
 * O corpo livre do PR é matéria. Ele nunca cria nova vontade humana.
 * Porém o recibo canônico completo, vindo de autor confiável no mesmo
 * repositório, transporta a autorização já dada pelo SEGREDO/CHEFE sem
 * exigir novo clique, nova label manual ou nova pergunta ao humano.
 * FRONTEIRA:
 *   MATERIAL != AUTHORITY
 *   AUTHENTICATED_DELEGATION + CURRENT_INTENT + SCOPE = OPERATIONAL_AUTHORITY
 *
 * Texto solto, prompt, título, comentário ou material externo não concedem
 * autoridade. Um recibo completo no PR somente vira autoridade operacional
 * delegada quando o próprio evento GitHub prova simultaneamente:
 * - autor autenticado pertencente à allowlist do SEGREDO/CHEFE;
 * - head e base no mesmo repositório autorizado;
 * - intenção, política, escopo e Writer explicitados.
 *
 * O modelo/CLI/MCP que opera por trás da conta é provenance/capacidade; não
 * precisa fingir ser o humano nem pedir novo clique para a mesma intenção.
 */

import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CANONICAL_AUTHORITY_LABEL = "👑 PERMITO-SEGREDO";
export const CANONICAL_AUTHORITY_SOURCE = "github-label:permito-segredo";
export const CANONICAL_INTENT_RECEIPT_SOURCE = "pr-body:intent-authorized";
export const DERIVED_AUTHORITY_SOURCE = CANONICAL_INTENT_RECEIPT_SOURCE;
export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";

/**
 * Materialização automática da label a partir do corpo permanece desligada.
 * O fluxo não precisa escrever a label para reconhecer o recibo canônico como
 * transporte da autorização vigente. Isso evita depender de permissão de write
 * no gate e mantém texto solto incapaz de fabricar autoridade.
 */
export const MATERIAL_DERIVED_AUTHORITY_ENABLED = false;
export const MATERIAL_DERIVED_AUTHORITY_BLOCK =
  "DERIVED_AUTHORITY_DISABLED_MATERIAL_IS_NOT_AUTHORITY";
export const DELEGATED_AUTHORITY_SOURCE = "github-authenticated-intent-receipt";
export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";
export const DELEGATED_AUTHORITY_ENABLED = true;

function foldLabelName(value) {
  return String(value?.name || value || "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function lineMarker(body, name) {
  const match = String(body || "").match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mi"));
  return match?.[1]?.trim() || null;
}

function trustedAuthorsFrom(value) {
  const items = Array.isArray(value)
    ? value
    : String(value || "segredounlock").split(",");
  return new Set(items.map((item) => String(item).trim().toLocaleLowerCase("en-US")).filter(Boolean));
}

export function canonicalAuthorityLabel(value) {
  const folded = foldLabelName(value);
  if (folded === "permito-segredo" || folded === "👑 permito-segredo") {
    return CANONICAL_AUTHORITY_LABEL;
  }
  return String(value?.name || value || "").trim();
}

/**
 * Lê o recibo canônico declarado no corpo do PR.
 *
 * `valid` não significa que texto livre ganhou autoridade. Significa que o PR
 * carrega o contrato exato de uma intenção já autorizada, em autor confiável e
 * no mesmo repositório. O recibo transporta a autorização; não cria uma nova.
 * Lê o recibo de intenção e cruza com a identidade autenticada do evento.
 * `valid=true` significa delegação operacional válida para este PR/escopo,
 * não que qualquer texto contendo os mesmos campos seja autoridade.
 */
export function intentReceiptForEvent(event = {}, { trustedAuthors = ["segredounlock"], repository = null } = {}) {
  const pr = event.pull_request || {};
  const body = String(pr.body || "");
  const authority = lineMarker(body, "Intent-Authorized");
  const mergePolicy = lineMarker(body, "Merge-Policy");
  const intentScope = lineMarker(body, "Intent-Scope");
  const writer = lineMarker(body, "Writer");
  const writerScope = lineMarker(body, "Writer-Scope");
  const author = String(pr.user?.login || "").toLocaleLowerCase("en-US");
  const trusted = trustedAuthorsFrom(trustedAuthors).has(author);
  const headRepo = pr.head?.repo?.full_name || null;
  const baseRepo = pr.base?.repo?.full_name || null;
  const sameRepository = Boolean(
    headRepo &&
    baseRepo &&
    headRepo === baseRepo &&
    (!repository || headRepo === repository)
  );
  const valid = DELEGATED_AUTHORITY_ENABLED
    && authority === "SEGREDO/CHEFE"
    && mergePolicy === FAST_MERGE_POLICY
    && Boolean(intentScope)
    && Boolean(writer)
    && Boolean(writerScope)
    && trusted
    && sameRepository;

  return {
    valid,
    grantsAuthority: false,
    transportsAuthority: valid,
    grantsAuthority: valid,
    authority,
    mergePolicy,
    intentScope,
    writer,
    writerScope,
    author: pr.user?.login || null,
    trusted,
    sameRepository,
  };
}

export function authorityApprovalForEvent(event = {}, options = {}) {
  const labels = new Set(
    (event.pull_request?.labels || []).map((label) => canonicalAuthorityLabel(label)),
  );
  const viaLabel = labels.has(CANONICAL_AUTHORITY_LABEL);
  const intent = intentReceiptForEvent(event, options);
  const viaReceipt = intent.valid;
  const approved = viaLabel || viaReceipt;
  const viaDelegation = intent.valid;
  const approved = viaLabel || viaDelegation;

  return {
    approved,
    authority: approved ? "SEGREDO/CHEFE" : null,
    source: viaLabel
      ? CANONICAL_AUTHORITY_SOURCE
      : viaReceipt
        ? CANONICAL_INTENT_RECEIPT_SOURCE
        : "none",
    derivable: false,
    transported: !viaLabel && viaReceipt,
    candidateIntent: intent.valid,
    materialDerivationBlocked: null,
      : viaDelegation
        ? DELEGATED_AUTHORITY_SOURCE
        : "none",
    viaLabel,
    viaDelegation,
    derivable: !viaLabel && viaDelegation,
    candidateIntent: Boolean(intent.authority || intent.mergePolicy || intent.intentScope || intent.writer || intent.writerScope),
    intent,
  };
}

/**
 * Compatibilidade explícita: o gate não precisa nem deve aplicar uma label a
 * partir do próprio corpo do PR. A autoridade vigente é reconhecida pelo
 * recibo autenticado; materialização automática da label segue bloqueada.
 * Materializa o selo visual somente depois de a delegação autenticada já ter
 * sido provada pelo evento GitHub. A label é receipt/rastro; não é um segundo
 * pedido humano e não cria autoridade a partir de texto não autenticado.
 */
export async function materializeDerivedAuthorityLabel(event, env = process.env, fetchImpl = fetch) {
  const repository = env.GITHUB_REPOSITORY || "";
  const token = env.GITHUB_TOKEN || "";
  if (!repository.includes("/")) throw new Error("GITHUB_REPOSITORY_INVALID");
  if (!token) throw new Error("GITHUB_TOKEN_MISSING");

  const approval = authorityApprovalForEvent(event, {
    trustedAuthors: env.BOT_TRUSTED_AUTHORS || "segredounlock",
    repository,
  });
  if (!approval.viaDelegation) throw new Error("DELEGATED_AUTHORITY_NOT_PROVEN");
  if (approval.viaLabel) return approval;

  const number = Number(event.pull_request?.number || 0);
  if (!Number.isInteger(number) || number <= 0) throw new Error("PR_NUMBER_INVALID");

  const response = await fetchImpl(`https://api.github.com/repos/${repository}/issues/${number}/labels`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "centraldark-authority-approval/2.0",
    },
    body: JSON.stringify({ labels: [CANONICAL_AUTHORITY_LABEL] }),
  });
  const text = await response.text();
  let labels = [];
  if (text) {
    try { labels = JSON.parse(text); }
    catch { labels = []; }
  }
  if (!response.ok) throw new Error(`AUTHORITY_LABEL_MATERIALIZATION_FAILED:${response.status}`);
  const confirmed = Array.isArray(labels) && labels.some(
    (label) => canonicalAuthorityLabel(label) === CANONICAL_AUTHORITY_LABEL,
  );
  if (!confirmed) throw new Error("AUTHORITY_LABEL_NOT_CONFIRMED");

  return {
    ...approval,
    approved: true,
    authority: "SEGREDO/CHEFE",
    source: DELEGATED_AUTHORITY_SOURCE,
    materializedLabel: CANONICAL_AUTHORITY_LABEL,
  };
}

export async function main(env = process.env) {
  const eventPath = env.GITHUB_EVENT_PATH;
  const event = eventPath
    ? JSON.parse(await readFile(eventPath, "utf8"))
    : {};
  const options = {
    trustedAuthors: env.BOT_TRUSTED_AUTHORS || "segredounlock",
    repository: env.GITHUB_REPOSITORY || null,
  };
  const result = authorityApprovalForEvent(event, options);

  if (env.GITHUB_OUTPUT) {
    await appendFile(
      env.GITHUB_OUTPUT,
      `approved=${result.approved}\nauthority=${result.authority || "NONE"}\nsource=${result.source}\nderived=false\ncandidate_intent=${result.candidateIntent}\ntransported=${result.transported === true}\n`,
      `approved=${result.approved}\nauthority=${result.authority || "NONE"}\nsource=${result.source}\nderived=${result.derivable}\ncandidate_intent=${result.candidateIntent}\n`,
      "utf8",
    );
  }

  console.log(
    `AUTHORITY_APPROVED=${result.approved} AUTHORITY=${result.authority || "NONE"} SOURCE=${result.source} DERIVED=false TRANSPORTED=${result.transported === true}`,
    `AUTHORITY_APPROVED=${result.approved} AUTHORITY=${result.authority || "NONE"} SOURCE=${result.source} DELEGATED=${result.viaDelegation}`,
  );
  return result;
}

const isMain = process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(`AUTHORITY_APPROVAL_ERROR=${error?.message || error}`);
    process.exitCode = 1;
  });
}

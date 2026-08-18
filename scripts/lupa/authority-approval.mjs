#!/usr/bin/env node

/**
 * Fonte autenticada de autorização da CentralDark.
 *
 * MATERIAL_SOLTO != AUTHORITY
 * RECIBO_CANONICO_AUTORIZADO = TRANSPORTE_DA_INTENCAO_EXISTENTE
 *
 * Texto livre nunca cria vontade humana. Um recibo canônico completo somente
 * transporta uma intenção já concedida quando o evento GitHub prova autor
 * confiável, mesmo repositório, política, intenção e Writer/escopo.
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
export const DELEGATED_AUTHORITY_SOURCE = "github-authenticated-intent-receipt";
export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";
export const DELEGATED_AUTHORITY_ENABLED = true;
export const MATERIAL_DERIVED_AUTHORITY_ENABLED = false;
export const MATERIAL_DERIVED_AUTHORITY_BLOCK =
  "DERIVED_AUTHORITY_DISABLED_MATERIAL_IS_NOT_AUTHORITY";
export const DELEGATED_AUTHORITY_SOURCE = "github-authenticated-intent-receipt";
export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";
export const DELEGATED_AUTHORITY_ENABLED = true;

function foldLabelName(value) {
  return String(value?.name || value || "").trim().toLocaleLowerCase("pt-BR");
}

function lineMarker(body, name) {
  const match = String(body || "").match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mi"));
  return match?.[1]?.trim() || null;
}

function trustedAuthorsFrom(value) {
  const items = Array.isArray(value) ? value : String(value || "segredounlock").split(",");
  return new Set(items.map((item) => String(item).trim().toLocaleLowerCase("en-US")).filter(Boolean));
}

export function canonicalAuthorityLabel(value) {
  const folded = foldLabelName(value);
  if (folded === "permito-segredo" || folded === "👑 permito-segredo") {
    return CANONICAL_AUTHORITY_LABEL;
  }
  return String(value?.name || value || "").trim();
}

export function intentReceiptForEvent(
  event = {},
  { trustedAuthors = ["segredounlock"], repository = null } = {},
) {
/**
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
    headRepo && baseRepo && headRepo === baseRepo && (!repository || headRepo === repository),
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
    viaLabel,
    viaReceipt,
    viaDelegation: viaReceipt,
    derivable: false,
    transported: !viaLabel && viaReceipt,
    candidateIntent: Boolean(
      intent.authority || intent.mergePolicy || intent.intentScope || intent.writer || intent.writerScope,
    ),
    materialDerivationBlocked: MATERIAL_DERIVED_AUTHORITY_BLOCK,
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
 * O gate reconhece receipt autenticado sem reask, mas não converte o próprio
 * material do PR em uma nova label/autoridade. A label continua podendo existir
 * como fonte externa persistente; esta função não a deriva do corpo.
 * Materializa o selo visual somente depois de a delegação autenticada já ter
 * sido provada pelo evento GitHub. A label é receipt/rastro; não é um segundo
 * pedido humano e não cria autoridade a partir de texto não autenticado.
 */
export async function materializeDerivedAuthorityLabel() {
  throw new Error(MATERIAL_DERIVED_AUTHORITY_BLOCK);
}

export async function main(env = process.env) {
  const event = env.GITHUB_EVENT_PATH
    ? JSON.parse(await readFile(env.GITHUB_EVENT_PATH, "utf8"))
    : {};
  const result = authorityApprovalForEvent(event, {
    trustedAuthors: env.BOT_TRUSTED_AUTHORS || "segredounlock",
    repository: env.GITHUB_REPOSITORY || null,
  });

  if (env.GITHUB_OUTPUT) {
    await appendFile(
      env.GITHUB_OUTPUT,
      `approved=${result.approved}\nauthority=${result.authority || "NONE"}\nsource=${result.source}\nderived=false\ncandidate_intent=${result.candidateIntent}\ntransported=${result.transported}\n`,
      `approved=${result.approved}\nauthority=${result.authority || "NONE"}\nsource=${result.source}\nderived=${result.derivable}\ncandidate_intent=${result.candidateIntent}\n`,
      "utf8",
    );
  }

  console.log(
    `AUTHORITY_APPROVED=${result.approved} AUTHORITY=${result.authority || "NONE"} SOURCE=${result.source} DERIVED=false TRANSPORTED=${result.transported}`,
    `AUTHORITY_APPROVED=${result.approved} AUTHORITY=${result.authority || "NONE"} SOURCE=${result.source} DELEGATED=${result.viaDelegation}`,
  );
  return result;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(`AUTHORITY_APPROVAL_ERROR=${error?.message || error}`);
    process.exitCode = 1;
  });
}

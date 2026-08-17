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
  const sameRepository = Boolean(headRepo && baseRepo && headRepo === baseRepo && (!repository || headRepo === repository));
  const valid = authority === "SEGREDO/CHEFE"
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
    intent,
  };
}

/**
 * Compatibilidade explícita: o gate não precisa nem deve aplicar uma label a
 * partir do próprio corpo do PR. A autoridade vigente é reconhecida pelo
 * recibo autenticado; materialização automática da label segue bloqueada.
 */
export async function materializeDerivedAuthorityLabel() {
  throw new Error(MATERIAL_DERIVED_AUTHORITY_BLOCK);
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
      "utf8",
    );
  }

  console.log(
    `AUTHORITY_APPROVED=${result.approved} AUTHORITY=${result.authority || "NONE"} SOURCE=${result.source} DERIVED=false TRANSPORTED=${result.transported === true}`,
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

#!/usr/bin/env node

/**
 * Fonte autenticada de autorização da CentralDark.
 *
 * FRONTEIRA ZERO TRUST:
 *   MATERIAL != AUTHORITY
 *
 * O corpo do PR é MATÉRIA, não ORDEM. Ele pode declarar INTENÇÃO CANDIDATA,
 * nunca produzir `approved=true` por si próprio nem materializar a label
 * canônica do SEGREDO/CHEFE.
 *
 * A única fonte de aprovação é a label canônica já presente no PR, aplicada
 * por um ato externo ao corpo/árvore do próprio PR.
 */

import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CANONICAL_AUTHORITY_LABEL = "👑 PERMITO-SEGREDO";
export const CANONICAL_AUTHORITY_SOURCE = "github-label:permito-segredo";
export const DERIVED_AUTHORITY_SOURCE = "github-label:auto-derived-from-intent";
export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";

/**
 * Derivação de autoridade a partir de matéria fica desligada e fail-closed.
 * Mantida como constante explícita para que o bloqueio seja testável e
 * auditável, em vez de virar código silenciosamente removido.
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
 * Lê a INTENÇÃO CANDIDATA declarada no corpo do PR.
 *
 * `valid` significa apenas "o recibo está bem formado e vem de autor confiável
 * no mesmo repositório". NÃO significa autorizado, aprovado nem derivável.
 * Consumidores devem tratar isto como matéria classificada, nunca como grant.
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
  const approved = labels.has(CANONICAL_AUTHORITY_LABEL);
  const intent = intentReceiptForEvent(event, options);
  return {
    approved,
    authority: approved ? "SEGREDO/CHEFE" : null,
    source: approved ? CANONICAL_AUTHORITY_SOURCE : "none",
    // Matéria nunca deriva autoridade. Fail-closed e constante.
    derivable: false,
    candidateIntent: intent.valid,
    materialDerivationBlocked: intent.valid && !approved
      ? MATERIAL_DERIVED_AUTHORITY_BLOCK
      : null,
    intent,
  };
}

/**
 * Mantida apenas como barreira explícita.
 *
 * Antes esta função aplicava sozinha a label canônica do SEGREDO/CHEFE a partir
 * de texto do corpo do PR — ou seja, a matéria se tornava autoridade. Qualquer
 * agente com o token da automação podia escrever cinco linhas e receber o selo
 * do humano. Agora falha fechada, sempre.
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
      `approved=${result.approved}\nauthority=${result.authority || "NONE"}\nsource=${result.source}\nderived=false\ncandidate_intent=${result.candidateIntent}\n`,
      "utf8",
    );
  }

  if (result.materialDerivationBlocked) {
    console.log(
      `AUTHORITY_MATERIAL_DERIVATION_BLOCKED=${result.materialDerivationBlocked} candidate_intent=true approved=false`,
    );
  }

  console.log(
    `AUTHORITY_APPROVED=${result.approved} AUTHORITY=${result.authority || "NONE"} SOURCE=${result.source} DERIVED=false`,
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

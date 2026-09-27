#!/usr/bin/env node
/**
 * Materializa a etiqueta derivada `✅ PR CONFIRMADO` somente depois que o
 * motor canônico já concluiu a promoção e deixou âncoras observáveis no PR.
 *
 * Esta etiqueta é REPRESENTAÇÃO DE RESULTADO. Não concede autoridade, não
 * participa do selo de promoção e nunca pode ajudar a aprovar a si própria.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const API = "https://api.github.com";
export const CANONICAL_CONFIRMED_LABEL = "✅ PR CONFIRMADO";
export const CANONICAL_AUTHORITY_LABEL = "👑 PERMITO-SEGREDO";
export const CANONICAL_SUCCESS_LABEL = "🟢 SUCESSO";
export const SUCCESS_COMMENT_MARKER = "<!-- centraldark-autonomia-promocao-success -->";
export const MAX_CATALOG_RETRIES = 5;
const MAX_COMMENT_PAGES = 10;
const SHA256_RE = /^[a-f0-9]{64}$/i;

function normalizedLabelNames(pr) {
  return new Set((pr?.labels || []).map((label) => String(label?.name || label).trim().toLocaleLowerCase("pt-BR")));
}

export function hasConfirmedLabel(pr) {
  return normalizedLabelNames(pr).has(CANONICAL_CONFIRMED_LABEL.toLocaleLowerCase("pt-BR"));
}

function lineValue(body, name) {
  const prefix = `${name}=`;
  const line = String(body || "")
    .split(/\r?\n/)
    .map((value) => value.trim())
    .find((value) => value.toLocaleUpperCase("pt-BR").startsWith(prefix.toLocaleUpperCase("pt-BR")));
  if (!line) return null;
  return line.slice(prefix.length).trim().replace(/^`|`$/g, "") || null;
}

export function confirmationEvidence(pr, comments = []) {
  const labels = normalizedLabelNames(pr);
  const successComment = comments.find((comment) => String(comment?.body || "").includes(SUCCESS_COMMENT_MARKER));
  const body = String(successComment?.body || "");
  const headProved = lineValue(body, "HEAD_PROVADO");
  const mergeSha = lineValue(body, "MERGE_SHA");
  const receiptSha256 = lineValue(body, "JUDGE_RECEIPT_SHA256");

  const authorityPresent = labels.has(CANONICAL_AUTHORITY_LABEL.toLocaleLowerCase("pt-BR"));
  const successPresent = labels.has(CANONICAL_SUCCESS_LABEL.toLocaleLowerCase("pt-BR"));
  const merged = Boolean(pr?.merged_at && pr?.merge_commit_sha);
  const headMatches = Boolean(headProved && pr?.head?.sha && headProved === pr.head.sha);
  const mergeMatches = Boolean(mergeSha && pr?.merge_commit_sha && mergeSha === pr.merge_commit_sha);
  const receiptHashValid = SHA256_RE.test(String(receiptSha256 || ""));

  const reasons = [];
  if (!merged) reasons.push("PR_NOT_MERGED");
  if (!authorityPresent) reasons.push("AUTHORITY_LABEL_MISSING");
  if (!successPresent) reasons.push("SUCCESS_LABEL_MISSING");
  if (!successComment) reasons.push("SUCCESS_COMMENT_MISSING");
  if (!headMatches) reasons.push("PROVEN_HEAD_MISMATCH");
  if (!mergeMatches) reasons.push("MERGE_SHA_MISMATCH");
  if (!receiptHashValid) reasons.push("JUDGE_RECEIPT_SHA256_INVALID");

  return {
    confirmed: reasons.length === 0,
    reasons,
    headProved,
    mergeSha,
    receiptSha256,
  };
}

export function retryCountFromEvent(event = {}) {
  const value = Number(event?.client_payload?.confirmation_retry_count || 0);
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

async function api(token, method, path, body, allow = []) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-pr-confirmado/1.2",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = {};
  if (text) {
    try { data = JSON.parse(text); }
    catch { data = { message: text.slice(0, 500) }; }
  }
  if (!response.ok && !allow.includes(response.status)) {
    throw new Error(`GITHUB_${method}_${path}_${response.status}:${String(data.message || "request failed").slice(0, 500)}`);
  }
  return { status: response.status, data };
}

async function currentEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH || "";
  if (!eventPath) return {};
  try { return JSON.parse(await readFile(eventPath, "utf8")); }
  catch { return {}; }
}

async function candidateNumbers(sweepDir, event) {
  const numbers = new Set();
  try {
    const files = await readdir(sweepDir);
    for (const name of files) {
      const match = name.match(/^receipt-pr-(\d+)\.json$/);
      if (match) numbers.add(Number(match[1]));
    }
  } catch {}

  if (event.pull_request?.number) numbers.add(Number(event.pull_request.number));
  if (event.client_payload?.pr_number) numbers.add(Number(event.client_payload.pr_number));
  return [...numbers].filter((number) => Number.isInteger(number) && number > 0);
}

async function fetchComments(token, repository, number) {
  const comments = [];
  for (let page = 1; page <= MAX_COMMENT_PAGES; page += 1) {
    const result = await api(token, "GET", `/repos/${repository}/issues/${number}/comments?per_page=100&page=${page}`);
    const batch = Array.isArray(result.data) ? result.data : [];
    comments.push(...batch);
    if (batch.length < 100 || batch.some((comment) => String(comment?.body || "").includes(SUCCESS_COMMENT_MARKER))) break;
  }
  return comments;
}

async function canonicalLabelExists(token, repository) {
  const encoded = encodeURIComponent(CANONICAL_CONFIRMED_LABEL);
  const result = await api(token, "GET", `/repos/${repository}/labels/${encoded}`, undefined, [404]);
  return result.status === 200;
}

async function scheduleCatalogRetry(token, repository, number, event) {
  const retryCount = retryCountFromEvent(event);
  if (retryCount >= MAX_CATALOG_RETRIES) {
    console.log(`PR=${number} CONFIRMATION=CATALOG_RETRY_EXHAUSTED count=${retryCount}`);
    return;
  }
  const next = retryCount + 1;
  await api(token, "POST", `/repos/${repository}/dispatches`, {
    event_type: "centraldark_autonomia_recheck",
    client_payload: {
      pr_number: number,
      reason: "pr_confirmado_catalog_pending",
      confirmation_retry_count: next,
    },
  });
  console.log(`PR=${number} CONFIRMATION=CATALOG_RETRY_DISPATCHED count=${next}`);
}

async function removeFalseGreen(token, repository, number) {
  const encoded = encodeURIComponent(CANONICAL_CONFIRMED_LABEL);
  await api(token, "DELETE", `/repos/${repository}/issues/${number}/labels/${encoded}`, undefined, [404]);
  console.log(`PR=${number} CONFIRMATION=FALSE_GREEN_REMOVED label=${CANONICAL_CONFIRMED_LABEL}`);
}

async function reconcile() {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const token = process.env.PROMOTER_TOKEN || process.env.PROMOTION_TOKEN || process.env.GITHUB_TOKEN || "";
  const sweepDir = process.env.BOT_SWEEP_DIR || join(process.env.RUNNER_TEMP || "/tmp", "centraldark-autonomia");
  if (!repository.includes("/")) throw new Error("GITHUB_REPOSITORY_INVALID");
  if (!token) throw new Error("GITHUB_TOKEN_MISSING");

  const event = await currentEvent();
  const numbers = await candidateNumbers(sweepDir, event);
  console.log(`PR_CONFIRMADO_CANDIDATES=${numbers.join(",") || "none"}`);
  if (!numbers.length) return;

  let labelExists = null;
  for (const number of numbers) {
    const pr = (await api(token, "GET", `/repos/${repository}/pulls/${number}`)).data;
    const comments = await fetchComments(token, repository, number);
    const evidence = confirmationEvidence(pr, comments);
    if (!evidence.confirmed) {
      if (hasConfirmedLabel(pr)) await removeFalseGreen(token, repository, number);
      console.log(`PR=${number} CONFIRMATION=NOT_PROVEN reasons=${evidence.reasons.join("|")}`);
      continue;
    }

    if (labelExists === null) labelExists = await canonicalLabelExists(token, repository);
    if (!labelExists) {
      console.log(`PR=${number} CONFIRMATION=PROVEN_BUT_CATALOG_PENDING label=${CANONICAL_CONFIRMED_LABEL}`);
      await scheduleCatalogRetry(token, repository, number, event);
      continue;
    }

    const labelsResult = await api(token, "POST", `/repos/${repository}/issues/${number}/labels`, {
      labels: [CANONICAL_CONFIRMED_LABEL],
    });
    const returned = new Set((Array.isArray(labelsResult.data) ? labelsResult.data : []).map(
      (label) => String(label?.name || label).trim().toLocaleLowerCase("pt-BR"),
    ));
    if (!returned.has(CANONICAL_CONFIRMED_LABEL.toLocaleLowerCase("pt-BR"))) {
      throw new Error(`PR_CONFIRMADO_LABEL_NOT_VERIFIED:${number}`);
    }
    console.log(`PR=${number} CONFIRMATION=PROVEN LABEL=${CANONICAL_CONFIRMED_LABEL} RECEIPT_SHA256=${evidence.receiptSha256}`);
  }
}

export async function main(argv = process.argv.slice(2)) {
  const mode = argv[0] || "reconcile";
  if (mode === "reconcile") return reconcile();
  throw new Error(`MODE_INVALID:${mode}`);
}

const invokedAsMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedAsMain) {
  main().catch((error) => {
    console.error(`PR_CONFIRMADO_ERROR=${error.message}`);
    process.exit(1);
  });
}

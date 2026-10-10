#!/usr/bin/env node
/**
 * Varredura eventual da promoção autônoma.
 *
 * Um único motor canônico:
 * - normalize: tira de Draft PR confiável com intenção já autorizada, salvo KEEP_DRAFT explícito;
 * - judge: read-only, produz recibo SHA-256;
 * - promote: materializa/verifica o selo canônico, revalida HEAD/base/intenção e promove.
 *
 * SELO_CANONICO_DE_PROMOCAO = recibo de intenção completo +
 * 👑 PERMITO-SEGREDO + 🔄 GIT + 🤖 AUTO.
 *
 * PADRAO_OPERACIONAL (todos os PRs elegíveis, não só um):
 * 🟡 IA-PRECISA-REVISAR + selo acima.
 *
 * Nome de modelo/agente é proveniência opcional, nunca requisito, autoridade,
 * capacidade presumida ou gate de promoção. Capacidade nasce do escopo e das
 * labels funcionais 🤖 IA-* quando aplicáveis.
 *
 * O selo organiza/rastreia; não substitui gates, segurança nem prova.
 * ✅ PR CONFIRMADO e 🟢 SUCESSO são RESULTADO (pós-merge), nunca input.
 */
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_REQUIRED_WORKFLOWS, isProtectedLedgerPr, authorizationFor, verifySealedReceipt } from "./github-autonomia-promocao.mjs";

const API = "https://api.github.com";
const GRAPHQL_API = "https://api.github.com/graphql";
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
/**
 * Compatibilidade de proveniência histórica. Estas labels podem existir para
 * auditoria/linhagem, mas jamais entram no conjunto obrigatório da promoção.
 */
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

export function persistentAuthorityEligible(pr, repository, trustedAuthors = ["segredounlock"]) {
  const trusted = trustedAuthors.map((item) => String(item).toLowerCase());
  return Boolean(
    pr?.state === "open" &&
    pr?.base?.ref === "main" &&
    pr?.head?.repo?.full_name === repository &&
    trusted.includes(String(pr?.user?.login || "").toLowerCase()) &&
    !isProtectedLedgerPr(pr?.number)
  );
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

/**
 * Compatibilidade de auditoria: deriva proveniência histórica do Writer.
 * Não usar o retorno desta função para autorização, capability, roteamento
 * obrigatório ou gate de promoção.
 */
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
 * = selo de promoção + baseline operacional model-neutral.
 *
 * Writer continua obrigatório para lease/proveniência do recibo, mas o nome
 * do executor não altera requisitos de promoção.
 */
export function requiredOperationalLabels(_pr) {
  return [...new Set([
    ...REQUIRED_PROMOTION_SEAL_LABELS,
    ...OPERATIONAL_BASELINE_LABELS,
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
  const eligible = structurallyEligible && (receipt.valid || markerAuthorized(pr));
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
  return Boolean(
    pr?.state === "open" &&
    !pr?.draft &&
    pr?.base?.ref === "main" &&
    pr?.head?.repo?.full_name === repository &&
    trusted.includes(String(pr?.user?.login || "").toLowerCase()) &&
    (markerAuthorized(pr) || promotionSealReceipt(pr).valid)
  );
}

export function draftReadyDecision(pr, repository, trustedAuthors = ["segredounlock"]) {
  const trusted = trustedAuthors.map((item) => item.toLowerCase());
  if (pr?.state !== "open" || pr?.draft !== true) {
    return { action: "NONE", reason: "NOT_OPEN_DRAFT" };
  }
  if (isProtectedLedgerPr(pr?.number)) {
    return { action: "KEEP_DRAFT", reason: "PR_MOTHER_PROTECTED" };
  }

  const sameRepository = pr?.head?.repo?.full_name === repository;
  const trustedAuthor = trusted.includes(String(pr?.user?.login || "").toLowerCase());
  if (pr?.base?.ref !== "main" || !sameRepository || !trustedAuthor) {
    return { action: "KEEP_DRAFT", reason: "UNTRUSTED_OR_OUT_OF_SCOPE" };
  }

  const labels = labelNames(pr);
  const explicitKeepDraft = labels.has("keep-draft")
    || labels.has("do-not-merge")
    || /(?:^|\n)\s*KEEP_DRAFT\s*[:=]\s*(?:true|1|yes)\s*$/im.test(String(pr?.body || ""));
  if (explicitKeepDraft) {
    return { action: "KEEP_DRAFT", reason: "EXPLICIT_KEEP_DRAFT" };
  }

  const authorized = markerAuthorized(pr) || promotionSealReceipt(pr).valid;
  if (!authorized) {
    return { action: "KEEP_DRAFT", reason: "AUTHORIZATION_MISSING" };
  }

  return {
    action: "MARK_READY",
    reason: "AUTHORIZED_INTENT_DRAFT_IS_NOT_SEMAPHORE",
  };
}

export function shouldMaterializeAuthority(pr, repository, trustedAuthors = ["segredounlock"]) {
  const seal = promotionSealState(pr, repository, trustedAuthors);
  return Boolean(seal.eligible && seal.missingLabels.includes(CANONICAL_AUTHORITY_LABEL));
}

async function api(token, method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-autonomia-varredura/3.2",
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
  if (!response.ok) throw new Error(`GITHUB_${method}_${path}_${response.status}:${String(data.message || "request failed").slice(0, 500)}`);
  return data;
}

async function graphql(token, query, variables = {}) {
  const response = await fetch(GRAPHQL_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "centraldark-autonomia-varredura/3.3",
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await response.json().catch(() => ({}));
  const errors = Array.isArray(data?.errors) ? data.errors : [];
  if (!response.ok || errors.length) {
    const detail = errors.map((error) => error?.message).filter(Boolean).join(" | ")
      || data?.message
      || "request failed";
    throw new Error(`GITHUB_GRAPHQL_${response.status}:${String(detail).slice(0, 500)}`);
  }
  return data?.data || {};
}

async function upsertDiagnostic(token, repository, number, code, detail) {
  const marker = "<!-- centraldark-autonomia-diagnostico -->";
  const body = [
    marker,
    "## Autonomia — bloqueio operacional",
    "",
    `Código: \`${code}\``,
    "",
    String(detail || "sem detalhe").slice(0, 2500),
    "",
    "Nenhuma promoção foi executada. O controlador continuará reavaliando automaticamente sem pedir novamente a mesma autorização.",
  ].join("\n");
  const comments = await api(token, "GET", `/repos/${repository}/issues/${number}/comments?per_page=100`);
  const existing = comments.find((comment) => String(comment.body || "").includes(marker));
  if (existing) await api(token, "PATCH", `/repos/${repository}/issues/comments/${existing.id}`, { body });
  else await api(token, "POST", `/repos/${repository}/issues/${number}/comments`, { body });
}

const SECRET_PATTERNS = [
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /\b[Bb]earer\s+[A-Za-z0-9._~+/-]{16,}=*/g,
  /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g,
];

export function sanitizeNotice(text, limit = 900) {
  let clean = String(text ?? "");
  for (const pattern of SECRET_PATTERNS) clean = clean.replace(pattern, "[REDACTED]");
  return clean.replace(/\s+/g, " ").trim().slice(0, limit);
}

export function classifyFailure(text) {
  const value = String(text || "").toLowerCase();
  if (/insufficient[_ ]quota|quota exceeded|credit|billing|payment required|402/.test(value)) return "CREDITS_EXHAUSTED";
  if (/\b429\b|rate limit|too many requests/.test(value)) return "RATE_LIMITED";
  if (/\b401\b|\b403\b|bad credentials|not authorized|resource not accessible/.test(value)) return "TOKEN_DENIED";
  if (/\b5\d\d\b|timeout|etimedout|econnreset|enotfound|service unavailable/.test(value)) return "PROVIDER_DOWN";
  if (/review_threads_unavailable|graphql/.test(value)) return "GITHUB_GRAPHQL_UNAVAILABLE";
  return "UNKNOWN_FAILURE";
}

export function noticeTargets(env = process.env) {
  return {
    telegram: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    webhook: Boolean(env.NOTIFY_WEBHOOK_URL),
  };
}

export async function notify(event, env = process.env) {
  const targets = noticeTargets(env);
  const text = [
    "🔴 CENTRALDARK — autonomia bloqueada",
    `causa: ${event.code}`,
    event.pr ? `PR: #${event.pr}` : null,
    event.head ? `HEAD: ${String(event.head).slice(0, 12)}` : null,
    event.run ? `run: ${event.run}` : null,
    `detalhe: ${sanitizeNotice(event.detail)}`,
  ].filter(Boolean).join("\n");

  const results = [];
  if (targets.telegram) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
      });
      results.push(`telegram:${response.ok ? "SENT" : `NOT_SENT_${response.status}`}`);
    } catch (error) {
      results.push(`telegram:NOT_SENT_${classifyFailure(error?.message)}`);
    }
  } else results.push("telegram:NOT_SENT_NO_SECRET");

  if (targets.webhook) {
    try {
      const response = await fetch(env.NOTIFY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, detail: sanitizeNotice(event.detail), text }),
      });
      results.push(`webhook:${response.ok ? "SENT" : `NOT_SENT_${response.status}`}`);
    } catch (error) {
      results.push(`webhook:NOT_SENT_${classifyFailure(error?.message)}`);
    }
  } else results.push("webhook:NOT_SENT_NO_SECRET");

  const line = `AUTONOMIA_NOTICE=${event.code} ${results.join(" ")}`;
  console.log(line);
  return line;
}

function runEngine(mode, env) {
  const baseEnv = { ...process.env };
  delete baseEnv.JUDGE_TOKEN;
  delete baseEnv.PROMOTION_TOKEN;
  delete baseEnv.PROMOTER_TOKEN;
  delete baseEnv.GITHUB_TOKEN;
  return spawnSync(process.execPath, [ENGINE, mode], {
    cwd: ROOT,
    env: { ...baseEnv, ...env },
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
}

function config() {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const trustedAuthors = String(process.env.BOT_TRUSTED_AUTHORS || "segredounlock")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const sweepDir = process.env.BOT_SWEEP_DIR || join(process.env.RUNNER_TEMP || "/tmp", "centraldark-autonomia");
  if (!repository.includes("/")) throw new Error("GITHUB_REPOSITORY_INVALID");
  return { repository, trustedAuthors, sweepDir };
}

async function normalizeDraftSweep() {
  const { repository, trustedAuthors } = config();
  const token = process.env.NORMALIZER_TOKEN || process.env.GITHUB_TOKEN || "";
  if (!token) throw new Error("NORMALIZER_TOKEN_MISSING");

  const pulls = await api(token, "GET", `/repos/${repository}/pulls?state=open&per_page=100`);
  const persistentAuthorized = [];
  for (const pr of pulls) {
    if (!persistentAuthorityEligible(pr, repository, trustedAuthors)) continue;
    const labels = labelNames(pr);
    if (labels.has(CANONICAL_AUTHORITY_LABEL.toLocaleLowerCase("pt-BR"))) continue;
    const applied = await api(token, "POST", `/repos/${repository}/issues/${pr.number}/labels`, {
      labels: [CANONICAL_AUTHORITY_LABEL],
    });
    pr.labels = Array.isArray(applied) ? applied : pr.labels;
    persistentAuthorized.push(pr.number);
    console.log(`PR=${pr.number} PERSISTENT_AUTHORITY_LABEL=${CANONICAL_AUTHORITY_LABEL}`);
  }
  console.log(`AUTONOMIA_PERSISTENT_AUTHORITY=${persistentAuthorized.join(",") || "none"}`);
  const decisions = pulls
    .map((pr) => ({ pr, decision: draftReadyDecision(pr, repository, trustedAuthors) }))
    .filter(({ decision }) => decision.action !== "NONE");

  const failures = [];
  const normalized = [];
  const kept = [];

  for (const { pr, decision } of decisions) {
    if (decision.action !== "MARK_READY") {
      kept.push(`${pr.number}:${decision.reason}`);
      continue;
    }
    if (!pr?.node_id) {
      failures.push(`${pr.number}:NODE_ID_MISSING`);
      continue;
    }

    try {
      await graphql(
        token,
        `mutation MarkReady($id: ID!) {
          markPullRequestReadyForReview(input: { pullRequestId: $id }) {
            pullRequest { number isDraft }
          }
        }`,
        { id: pr.node_id },
      );
      const readback = await api(token, "GET", `/repos/${repository}/pulls/${pr.number}`);
      if (readback?.draft === true) {
        failures.push(`${pr.number}:READY_READBACK_STILL_DRAFT`);
        continue;
      }
      normalized.push(pr.number);
      console.log(`PR=${pr.number} DRAFT_NORMALIZATION=MARK_READY REASON=${decision.reason}`);
    } catch (error) {
      failures.push(`${pr.number}:${classifyFailure(error?.message)}`);
    }
  }

  console.log(`AUTONOMIA_DRAFT_NORMALIZED=${normalized.join(",") || "none"}`);
  console.log(`AUTONOMIA_DRAFT_KEPT=${kept.join(",") || "none"}`);
  console.log(`AUTONOMIA_DRAFT_NORMALIZE_FAILURES=${failures.join(",") || "none"}`);
  if (failures.length) throw new Error(`DRAFT_NORMALIZE_FAILED:${failures.join(",")}`);
}

async function judgeSweep() {
  const { repository, trustedAuthors, sweepDir } = config();
  const judgeToken = process.env.JUDGE_TOKEN || process.env.GITHUB_TOKEN || "";
  if (!judgeToken) throw new Error("JUDGE_TOKEN_MISSING");
  await mkdir(sweepDir, { recursive: true });

  const pulls = await api(judgeToken, "GET", `/repos/${repository}/pulls?state=open&per_page=100`);
  const candidates = pulls.filter((pr) => eligibleSummary(pr, repository, trustedAuthors));
  console.log(`AUTONOMIA_SWEEP_CANDIDATES=${candidates.map((pr) => pr.number).join(",") || "none"}`);
  const failures = [];

  for (const pr of candidates) {
    const eventPath = join(sweepDir, `event-pr-${pr.number}.json`);
    const receiptPath = join(sweepDir, `receipt-pr-${pr.number}.json`);
    await writeFile(eventPath, `${JSON.stringify({ pull_request: { number: pr.number } })}\n`, { encoding: "utf8", mode: 0o600 });

    const judge = runEngine("judge", {
      GITHUB_TOKEN: judgeToken,
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: "autonomy_sweep",
      BOT_RECEIPT_PATH: receiptPath,
    });
    process.stdout.write(judge.stdout || "");
    process.stderr.write(judge.stderr || "");
    if (judge.status !== 0) {
      const raw = String(judge.stderr || judge.stdout || "JUDGE_FAILED");
      const code = classifyFailure(raw);
      await writeFile(join(sweepDir, `judge-failure-pr-${pr.number}.txt`), raw.slice(0, 4000), { encoding: "utf8", mode: 0o600 });
      await notify({ code: `JUDGE_FAILED:${code}`, pr: pr.number, head: pr.head?.sha, run: process.env.GITHUB_RUN_ID || null, detail: raw });
      failures.push(`${pr.number}:${code}`);
      continue;
    }

    const sealed = JSON.parse(await readFile(receiptPath, "utf8"));
    const candidate = sealed?.receipt?.candidates?.[0] || {};
    console.log(`PR=${pr.number} SWEEP_MODE=${candidate.mode || "UNKNOWN"} SWEEP_DECISION=${candidate.decision || "UNKNOWN"}`);
  }

  console.log(`AUTONOMIA_JUDGE_FAILURES=${failures.join(",") || "none"}`);
  if (failures.length) throw new Error(`JUDGE_SWEEP_FAILED:${failures.join(",")}`);
}

async function promoteSweep() {
  const { repository, trustedAuthors, sweepDir } = config();
  const promoterToken = process.env.PROMOTER_TOKEN || process.env.PROMOTION_TOKEN || process.env.GITHUB_TOKEN || "";
  if (!promoterToken) {
    await notify({ code: "PROMOTER_TOKEN_MISSING", run: process.env.GITHUB_RUN_ID || null, detail: "Nenhum token de escrita disponível para concluir a intenção já autorizada." });
    throw new Error("PROMOTER_TOKEN_MISSING");
  }
  await mkdir(sweepDir, { recursive: true });

  const files = (await readdir(sweepDir)).filter((name) => /^receipt-pr-\d+\.json$/.test(name)).sort();
  console.log(`AUTONOMIA_PROMOTE_RECEIPTS=${files.join(",") || "none"}`);
  const failures = [];

  for (const name of files) {
    const match = name.match(/^receipt-pr-(\d+)\.json$/);
    const number = Number(match?.[1]);
    if (!Number.isInteger(number) || number <= 0) continue;
    const eventPath = join(sweepDir, `event-pr-${number}.json`);
    const receiptPath = join(sweepDir, name);

    const livePr = await api(promoterToken, "GET", `/repos/${repository}/pulls/${number}`);
    const seal = promotionSealState(livePr, repository, trustedAuthors);
    if (!seal.eligible) {
      failures.push(`${number}:PROMOTION_SEAL_RECEIPT_INVALID`);
      await upsertDiagnostic(
        promoterToken,
        repository,
        number,
        "PROMOTION_SEAL_RECEIPT_INVALID",
        "Selo recusado: exige Intent-Authorized=SEGREDO/CHEFE, Merge-Policy suportada, Intent-Scope, Writer e Writer-Scope no mesmo PR confiável.",
      );
      continue;
    }

    if (!seal.complete) {
      const labels = await api(promoterToken, "POST", `/repos/${repository}/issues/${number}/labels`, { labels: seal.missingLabels });
      const returned = new Set((Array.isArray(labels) ? labels : []).map(
        (label) => String(label?.name || label).trim().toLocaleLowerCase("pt-BR"),
      ));
      const unverified = seal.requiredLabels.filter(
        (label) => !returned.has(label.toLocaleLowerCase("pt-BR")),
      );
      if (unverified.length) {
        failures.push(`${number}:PROMOTION_SEAL_NOT_VERIFIED`);
        await upsertDiagnostic(
          promoterToken,
          repository,
          number,
          "PROMOTION_SEAL_NOT_VERIFIED",
          `GitHub não confirmou o padrão operacional completo. Faltando após materialização: ${unverified.join(", ")}`,
        );
        continue;
      }
      console.log(`PR=${number} OPERATIONAL_LABEL_STANDARD_MATERIALIZED=${seal.requiredLabels.join("|")}`);
      await api(promoterToken, "POST", `/repos/${repository}/dispatches`, {
        event_type: "centraldark_autonomia_recheck",
        client_payload: { pr_number: number, reason: "operational_label_standard_materialized", head: livePr.head?.sha || null },
      });
      continue;
    }

    console.log(`PR=${number} OPERATIONAL_LABEL_STANDARD=PASS`);
    const promote = runEngine("promote", {
      GITHUB_TOKEN: promoterToken,
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_EVENT_NAME: "autonomy_sweep",
      BOT_RECEIPT_PATH: receiptPath,
    });
    process.stdout.write(promote.stdout || "");
    process.stderr.write(promote.stderr || "");
    if (promote.status !== 0) {
      const raw = String(promote.stderr || promote.stdout || "falha sem detalhe");
      const code = classifyFailure(raw);
      await upsertDiagnostic(promoterToken, repository, number, `PROMOTE_FAILED:${code}`, sanitizeNotice(raw, 2400));
      await notify({ code: `PROMOTE_FAILED:${code}`, pr: number, run: process.env.GITHUB_RUN_ID || null, detail: raw });
      failures.push(`${number}:${code}`);
      continue;
    }

    const after = await api(promoterToken, "GET", `/repos/${repository}/pulls/${number}`);
    if (after?.merged_at) {
      const finalLabels = await api(promoterToken, "POST", `/repos/${repository}/issues/${number}/labels`, { labels: [CANONICAL_SUCCESS_LABEL] });
      const successVerified = Array.isArray(finalLabels)
        && finalLabels.some((label) => String(label?.name || label).trim().toLocaleLowerCase("pt-BR") === CANONICAL_SUCCESS_LABEL.toLocaleLowerCase("pt-BR"));
      if (!successVerified) {
        failures.push(`${number}:SUCCESS_SEAL_NOT_VERIFIED`);
        await notify({ code: "SUCCESS_SEAL_NOT_VERIFIED", pr: number, head: after?.merge_commit_sha || after?.head?.sha, run: process.env.GITHUB_RUN_ID || null, detail: "Merge concluído, mas a label 🟢 SUCESSO não foi confirmada pelo GitHub." });
      } else {
        console.log(`PR=${number} RESULT_SEAL=${CANONICAL_SUCCESS_LABEL}`);
      }
    }
  }

  console.log(`AUTONOMIA_PROMOTE_FAILURES=${failures.join(",") || "none"}`);
  if (failures.length) throw new Error(`PROMOTE_SWEEP_FAILED:${failures.join(",")}`);
}

export async function guardSweep(sweepDir) {
  const deferredDir = join(sweepDir, "deferred");
  await mkdir(deferredDir, { recursive: true });
  const files = (await readdir(sweepDir)).filter((name) => /^receipt-pr-\d+\.json$/.test(name)).sort();
  const deferred = [];
  for (const name of files) {
    const path = join(sweepDir, name);
    const sealed = JSON.parse(await readFile(path, "utf8"));
    const receipt = verifySealedReceipt(sealed);
    const candidates = receipt.candidates || [];
    const green = candidates.length > 0 && candidates.every((candidate) =>
      candidate.decision === "READY"
      && candidate.head_sha
      && candidate.workflows?.length === DEFAULT_REQUIRED_WORKFLOWS.length
      && DEFAULT_REQUIRED_WORKFLOWS.every((name) =>
        candidate.workflows.some((workflow) => workflow.name === name && workflow.state === "PASS")
      )
    );
    if (green) continue;
    await rename(path, join(deferredDir, name));
    deferred.push(name);
  }
  console.log(`AUTONOMIA_DEFERRED_RECEIPTS=${deferred.join(",") || "none"}`);
  return deferred;
}

export async function main(argv = process.argv.slice(2)) {
  const mode = argv[0] || "";
  if (mode === "normalize") return normalizeDraftSweep();
  if (mode === "judge") return judgeSweep();
  if (mode === "guard") return guardSweep(config().sweepDir);
  if (mode === "promote") return promoteSweep();
  throw new Error(`MODE_INVALID:${mode || "empty"}`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(`AUTONOMIA_SWEEP_ERROR=${error.message}`);
    process.exit(1);
  });
}

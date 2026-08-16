#!/usr/bin/env node
/**
 * Promoção autônoma e fail-closed de pull requests do CentralDark.
 *
 * Um único motor, dois modos:
 * - FAST: intenção já autorizada pelo SEGREDO/CHEFE → validação determinística mínima → squash main;
 * - ADVERSARIAL: quando solicitado → workflows/Judge/contraprova completos.
 *
 * O código do PR nunca é executado aqui. O workflow faz checkout apenas da main confiável.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";

export const DEFAULT_REQUIRED_WORKFLOWS = Object.freeze([
  "porta-de-entrada",
  "codex-validate",
  "lupa-conformance",
  "Lupa Drift Guard",
  "PR auto-review (Codex + checklist)",
  "Pipeline — Telegram + Painel",
]);

export const BLOCKING_LABELS = Object.freeze([
  "do-not-merge",
  "hold",
  "autonomia-bloqueada",
]);

const RECEIPT_MAX_AGE_MS = 15 * 60 * 1000;
const API = "https://api.github.com";
export const DEFAULT_WAIT_TIMEOUT_MS = 45 * 60 * 1000;

const SENSITIVE_PATH = /(^|\/)(?:\.env(?:\.|$)|secrets?(?:\/|$)|tokens?(?:\/|$)|sessions?(?:\/|$)|\.ssh(?:\/|$)|credentials?(?:\/|$)|keys?(?:\/|$))/i;
const SECRET_PATTERNS = Object.freeze([
  { code: "GITHUB_TOKEN_LITERAL", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { code: "BEARER_LITERAL", pattern: /\bBearer\s+[A-Za-z0-9._~+\/-]{20,}=*/i },
  { code: "JWT_LITERAL", pattern: /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { code: "PRIVATE_KEY_LITERAL", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { code: "OPENAI_STYLE_KEY_LITERAL", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
]);

export function waitTimeoutMsFromEnv(env = process.env) {
  const minutes = Number(env.BOT_WAIT_TIMEOUT_MINUTES);
  if (!Number.isFinite(minutes) || minutes <= 0) return DEFAULT_WAIT_TIMEOUT_MS;
  return Math.round(minutes * 60 * 1000);
}

export function parseCsv(value, fallback = []) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : [...fallback];
}

export function normalizedLabels(pr) {
  return new Set((pr.labels || []).map((label) => {
    const name = String(label.name || label).trim().toLocaleLowerCase("pt-BR");
    if (name === "permito-segredo" || name === "👑 permito-segredo") return "👑 permito-segredo";
    return name;
  }));
}

function lineMarker(body, name) {
  const match = String(body || "").match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mi"));
  return match?.[1]?.trim() || null;
}

export function intentReceipt(pr) {
  const body = String(pr?.body || "");
  const authority = lineMarker(body, "Intent-Authorized");
  const mergePolicy = lineMarker(body, "Merge-Policy");
  const intentScope = lineMarker(body, "Intent-Scope");
  const writer = lineMarker(body, "Writer");
  const writerScope = lineMarker(body, "Writer-Scope");
  const valid = authority === "SEGREDO/CHEFE"
    && mergePolicy === FAST_MERGE_POLICY
    && Boolean(intentScope)
    && Boolean(writer)
    && Boolean(writerScope);
  return { valid, authority, mergePolicy, intentScope, writer, writerScope };
}

/**
 * Autorização humana (A) e prontidão técnica (R) são estados distintos.
 *
 * A pode vir de:
 * 1) label persistente canônica `👑 PERMITO-SEGREDO` (alias textual `permito-segredo` é só compatibilidade de entrada); ou
 * 2) recibo explícito no PR, criado dentro do escopo cuja intenção já foi tomada:
 *    Intent-Authorized + Merge-Policy + Intent-Scope + Writer + Writer-Scope.
 *
 * O body sozinho não basta para PR externo: evaluateCandidate exige autor confiável + mesmo repo.
 * Marcadores históricos PERMITO SEGREDO/PIVETE não concedem autoridade.
 */
export function authorizationFor(pr) {
  const labels = normalizedLabels(pr);
  const body = `${pr.title || ""}\n${pr.body || ""}`;
  const receipt = intentReceipt(pr);
  const segredoLabel = labels.has("👑 permito-segredo");
  const legacyPiveteLabel = labels.has("permito-pivete");
  const segredoBodyMarker = /\bPERMITO[ _-]?SEGREDO\b/i.test(body);
  const legacyPiveteBodyMarker = /\bPERMITO[ _-]?PIVETE\b/i.test(body);
  const authorized = segredoLabel || receipt.valid;

  return {
    authorized,
    viaLabel: segredoLabel,
    viaBody: receipt.valid,
    authority: authorized ? "SEGREDO/CHEFE" : null,
    source: segredoLabel
      ? "github-label:👑 PERMITO-SEGREDO"
      : receipt.valid
        ? "pr-body:intent-authorized"
        : "none",
    persistence: segredoLabel
      ? "UNTIL_LABEL_REMOVED_OR_SCOPE_CHANGES"
      : receipt.valid
        ? "WHILE_PR_SCOPE_AND_RECEIPT_MATCH"
        : "NONE",
    merge_policy: receipt.valid ? receipt.mergePolicy : null,
    intent_scope: receipt.valid ? receipt.intentScope : null,
    writer: receipt.valid ? receipt.writer : null,
    writer_scope: receipt.valid ? receipt.writerScope : null,
    historicalBodyMarker: segredoBodyMarker || legacyPiveteBodyMarker,
    legacy: legacyPiveteLabel || legacyPiveteBodyMarker,
  };
}

export function scanPullFiles(files = []) {
  const findings = [];
  for (const file of files) {
    const path = String(file?.filename || "");
    if (SENSITIVE_PATH.test(path)) findings.push(`SENSITIVE_PATH:${path}`);
    const patch = String(file?.patch || "");
    for (const rule of SECRET_PATTERNS) {
      if (rule.pattern.test(patch)) findings.push(`${rule.code}:${path || "<unknown>"}`);
    }
  }
  return [...new Set(findings)];
}

export function selectLatestNonSkipped(runs, workflowName) {
  return [...runs]
    .filter((run) => run.name === workflowName && run.conclusion !== "skipped")
    .sort((a, b) => {
      const byNumber = Number(b.run_number || 0) - Number(a.run_number || 0);
      if (byNumber) return byNumber;
      return String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || ""));
    })[0] || null;
}

export function workflowVerdicts(runs, requiredWorkflows) {
  return requiredWorkflows.map((name) => {
    const run = selectLatestNonSkipped(runs, name);
    if (!run) return { name, state: "MISSING", run_id: null, conclusion: null };
    if (run.status !== "completed") return { name, state: "PENDING", run_id: run.id, conclusion: run.conclusion || null };
    if (run.conclusion === "success") return { name, state: "PASS", run_id: run.id, conclusion: run.conclusion };
    return { name, state: "FAIL", run_id: run.id, conclusion: run.conclusion || "unknown" };
  });
}

export function waitAgeMs(pr, now = null) {
  if (now == null) return null;
  const stamp = Date.parse(pr?.updated_at || "");
  if (!Number.isFinite(stamp)) return null;
  return Math.max(0, now - stamp);
}

export function evaluateCandidate({
  pr,
  repository,
  trustedAuthors,
  requiredWorkflows = DEFAULT_REQUIRED_WORKFLOWS,
  workflowRuns = [],
  unresolvedThreads = 0,
  reviewThreadsOverflow = false,
  blockingReview = false,
  baseUpdateRequired = false,
  securityFindings = [],
  now = null,
  waitTimeoutMs = DEFAULT_WAIT_TIMEOUT_MS,
}) {
  const reasons = [];
  const waits = [];
  const labels = normalizedLabels(pr);
  const auth = authorizationFor(pr);
  const fastPath = auth.merge_policy === FAST_MERGE_POLICY && auth.viaBody;
  const author = String(pr.user?.login || "").toLowerCase();
  const trusted = trustedAuthors.map((value) => value.toLowerCase()).includes(author);
  const sameRepository = pr.head?.repo?.full_name === repository;

  if (pr.state !== "open") reasons.push("PR_NOT_OPEN");
  if (pr.base?.ref !== "main") reasons.push("BASE_NOT_MAIN");
  if (pr.draft) reasons.push("PR_IS_DRAFT");
  if (!sameRepository) reasons.push("HEAD_EXTERNAL_REPOSITORY");
  if (!trusted) reasons.push("AUTHOR_NOT_TRUSTED");
  if (!auth.authorized) reasons.push("AUTHORITY_AUTHORIZATION_MISSING");

  for (const label of BLOCKING_LABELS) {
    if (labels.has(label)) reasons.push(`BLOCKING_LABEL:${label}`);
  }

  if (blockingReview) reasons.push("CHANGES_REQUESTED");
  // Full review-thread convergence is adversarial; it is not a routine fast-path gate.
  if (!fastPath) {
    if (reviewThreadsOverflow) reasons.push("REVIEW_THREADS_OVERFLOW");
    if (unresolvedThreads > 0) reasons.push(`UNRESOLVED_REVIEW_THREADS:${unresolvedThreads}`);
  }

  for (const finding of securityFindings) reasons.push(`SECURITY_FINDING:${finding}`);

  if (pr.mergeable === false || pr.mergeable_state === "dirty") reasons.push("MERGE_CONFLICT");
  if (pr.mergeable == null || pr.mergeable_state === "unknown") waits.push("MERGEABILITY_PENDING");

  const applicableWorkflows = fastPath ? [] : requiredWorkflows;
  const workflows = workflowVerdicts(workflowRuns, applicableWorkflows);
  for (const workflow of workflows) {
    if (workflow.state === "FAIL") reasons.push(`WORKFLOW_FAILED:${workflow.name}:${workflow.conclusion}`);
    if (workflow.state === "MISSING" || workflow.state === "PENDING") waits.push(`WORKFLOW_${workflow.state}:${workflow.name}`);
  }

  const stalledFor = waitAgeMs(pr, now);
  const waitExpired = waits.length > 0 && stalledFor !== null && stalledFor > waitTimeoutMs;
  if (waitExpired) reasons.push(`WAIT_TIMEOUT:${Math.round(stalledFor / 60000)}min:${waits.join("|")}`);

  let decision = "READY";
  if (reasons.length) decision = "BLOCKED";
  else if (baseUpdateRequired) decision = "UPDATE_REQUIRED";
  else if (waits.length) decision = "WAIT";

  return {
    wait_age_ms: stalledFor,
    wait_timeout_ms: waitTimeoutMs,
    pr_number: pr.number,
    title: pr.title,
    author: pr.user?.login || null,
    head_sha: pr.head?.sha || null,
    head_ref: pr.head?.ref || null,
    base_sha: pr.base?.sha || null,
    base_ref: pr.base?.ref || null,
    decision,
    mode: fastPath ? "FAST" : "ADVERSARIAL",
    authorization: auth,
    trusted_author: trusted,
    same_repository: sameRepository,
    mergeable: pr.mergeable,
    mergeable_state: pr.mergeable_state || null,
    base_update_required: baseUpdateRequired,
    unresolved_review_threads: unresolvedThreads,
    security_findings: securityFindings,
    workflows,
    reasons,
    waits,
  };
}

export function sealReceipt(receipt) {
  const serialized = JSON.stringify(receipt);
  return { receipt, sha256: createHash("sha256").update(serialized).digest("hex") };
}

export function verifySealedReceipt(document, now = Date.now()) {
  if (!document || typeof document !== "object" || !document.receipt || !document.sha256) throw new Error("RECEIPT_SCHEMA_INVALID");
  const expected = createHash("sha256").update(JSON.stringify(document.receipt)).digest("hex");
  if (expected !== document.sha256) throw new Error("RECEIPT_HASH_INVALID");
  const generatedAt = Date.parse(document.receipt.generated_at || "");
  if (!Number.isFinite(generatedAt)) throw new Error("RECEIPT_TIMESTAMP_INVALID");
  if (now - generatedAt > RECEIPT_MAX_AGE_MS || generatedAt - now > 60_000) throw new Error("RECEIPT_EXPIRED");
  return document.receipt;
}

class GitHubClient {
  constructor(token) {
    if (!token) throw new Error("GITHUB_TOKEN_MISSING");
    this.token = token;
  }

  async request(method, path, body = undefined, { allow = [] } = {}) {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "centraldark-autonomia-promocao/3.0",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok && !allow.includes(response.status)) {
      const text = await response.text().catch(() => "");
      throw new Error(`GITHUB_${method}_${path}_${response.status}:${text.slice(0, 500)}`);
    }
    if (response.status === 204) return {};
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async graphql(query, variables) {
    const response = await fetch(`${API}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "centraldark-autonomia-promocao/3.0",
      },
      body: JSON.stringify({ query, variables }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.errors) throw new Error(`GITHUB_GRAPHQL_FAILED:${JSON.stringify(data.errors || data).slice(0, 500)}`);
    return data.data;
  }
}

function repoParts(repository) {
  const [owner, name, extra] = String(repository || "").split("/");
  if (!owner || !name || extra) throw new Error("GITHUB_REPOSITORY_INVALID");
  return { owner, name };
}

async function readEvent() {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path) return {};
  return JSON.parse(await readFile(path, "utf8"));
}

async function candidateNumbers(client, repository, event) {
  const numbers = new Set();
  if (event.pull_request?.number) numbers.add(Number(event.pull_request.number));
  if (event.client_payload?.pr_number) numbers.add(Number(event.client_payload.pr_number));
  for (const pr of event.workflow_run?.pull_requests || []) if (pr.number) numbers.add(Number(pr.number));

  if (!numbers.size && event.workflow_run?.head_sha) {
    const open = await client.request("GET", `/repos/${repository}/pulls?state=open&per_page=100`);
    for (const pr of open) if (pr.head?.sha === event.workflow_run.head_sha) numbers.add(Number(pr.number));
  }
  return [...numbers].filter((number) => Number.isInteger(number) && number > 0);
}

async function fetchPull(client, repository, number) {
  let pr = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    pr = await client.request("GET", `/repos/${repository}/pulls/${number}`);
    if (pr.mergeable != null && pr.mergeable_state !== "unknown") break;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1200));
  }
  return pr;
}

async function fetchWorkflowRuns(client, repository, sha) {
  const data = await client.request("GET", `/repos/${repository}/actions/runs?head_sha=${encodeURIComponent(sha)}&per_page=100`);
  return (data.workflow_runs || []).filter((run) => run.head_sha === sha);
}

async function fetchPullFiles(client, repository, number) {
  const files = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await client.request("GET", `/repos/${repository}/pulls/${number}/files?per_page=100&page=${page}`);
    files.push(...batch);
    if (batch.length < 100) return { files, overflow: false };
  }
  return { files, overflow: true };
}

async function fetchBlockingReview(client, repository, number) {
  const reviews = await client.request("GET", `/repos/${repository}/pulls/${number}/reviews?per_page=100`);
  const latest = new Map();
  for (const review of reviews) {
    const login = review.user?.login;
    if (login) latest.set(login, review.state);
  }
  return [...latest.values()].includes("CHANGES_REQUESTED");
}

async function fetchReviewThreadState(client, repository, number) {
  const { owner, name } = repoParts(repository);
  const query = `
    query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          reviewThreads(first: 100) { nodes { isResolved } pageInfo { hasNextPage } }
        }
      }
    }
  `;
  const data = await client.graphql(query, { owner, name, number });
  const threads = data.repository?.pullRequest?.reviewThreads;
  if (!threads) throw new Error(`REVIEW_THREADS_UNAVAILABLE:${number}`);
  return { unresolved: threads.nodes.filter((thread) => !thread.isResolved).length, overflow: Boolean(threads.pageInfo?.hasNextPage) };
}

async function baseUpdateRequired(client, repository, pr) {
  const compare = await client.request("GET", `/repos/${repository}/compare/${encodeURIComponent(pr.head.sha)}...${encodeURIComponent(pr.base.sha)}`);
  return Number(compare.ahead_by || 0) > 0;
}

async function inspectCandidate(client, repository, number, trustedAuthors, requiredWorkflows) {
  const pr = await fetchPull(client, repository, number);
  const auth = authorizationFor(pr);
  const fastPath = auth.merge_policy === FAST_MERGE_POLICY && auth.viaBody;
  const [needsUpdate, changed, blockingReview] = await Promise.all([
    baseUpdateRequired(client, repository, pr),
    fetchPullFiles(client, repository, number),
    fetchBlockingReview(client, repository, number),
  ]);

  const securityFindings = scanPullFiles(changed.files);
  if (changed.overflow) securityFindings.push("CHANGED_FILES_OVERFLOW");

  let workflowRuns = [];
  let threadState = { unresolved: 0, overflow: false };
  if (!fastPath) {
    [workflowRuns, threadState] = await Promise.all([
      fetchWorkflowRuns(client, repository, pr.head.sha),
      fetchReviewThreadState(client, repository, number),
    ]);
  }

  return evaluateCandidate({
    pr,
    repository,
    trustedAuthors,
    requiredWorkflows,
    workflowRuns,
    unresolvedThreads: threadState.unresolved,
    reviewThreadsOverflow: threadState.overflow,
    blockingReview,
    baseUpdateRequired: needsUpdate,
    securityFindings,
    now: Date.now(),
    waitTimeoutMs: waitTimeoutMsFromEnv(),
  });
}

async function upsertBlockComment(client, repository, candidate) {
  const marker = "<!-- centraldark-autonomia-promocao -->";
  const lines = [
    marker,
    "## Promoção autônoma — bloqueada com segurança",
    "",
    `HEAD: \`${candidate.head_sha}\``,
    `Modo: \`${candidate.mode}\``,
    `Decisão: \`${candidate.decision}\``,
    "",
    "Bloqueios:",
    ...(candidate.reasons.length ? candidate.reasons.map((reason) => `- \`${reason}\``) : ["- estado não elegível"]),
    "",
    "Nenhum merge foi executado. O controlador reavalia automaticamente; não pede novamente a mesma autorização.",
  ];
  const comments = await client.request("GET", `/repos/${repository}/issues/${candidate.pr_number}/comments?per_page=100`);
  const existing = comments.find((comment) => String(comment.body || "").includes(marker));
  if (existing) await client.request("PATCH", `/repos/${repository}/issues/comments/${existing.id}`, { body: lines.join("\n") });
  else await client.request("POST", `/repos/${repository}/issues/${candidate.pr_number}/comments`, { body: lines.join("\n") });
}

async function upsertSuccessComment(client, repository, candidate, mergeSha, receiptSha) {
  const marker = "<!-- centraldark-autonomia-promocao-success -->";
  const body = [
    marker,
    "## ✅ Intenção executada — squash main",
    "",
    `MODE=\`${candidate.mode}\``,
    `HEAD_PROVADO=\`${candidate.head_sha}\``,
    `MERGE_SHA=\`${mergeSha}\``,
    `AUTHORITY=\`${candidate.authorization.authority || "UNKNOWN"}\``,
    `INTENT_SCOPE=\`${candidate.authorization.intent_scope || "label-persistente"}\``,
    `JUDGE_RECEIPT_SHA256=\`${receiptSha}\``,
    "REASK=`NAO`",
  ].join("\n");
  await client.request("POST", `/repos/${repository}/issues/${candidate.pr_number}/comments`, { body });
}

async function runJudge() {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const client = new GitHubClient(process.env.GITHUB_TOKEN || "");
  const event = await readEvent();
  const trustedAuthors = parseCsv(process.env.BOT_TRUSTED_AUTHORS, ["segredounlock"]);
  const requiredWorkflows = parseCsv(process.env.BOT_REQUIRED_WORKFLOWS, DEFAULT_REQUIRED_WORKFLOWS);
  const outputPath = process.env.BOT_RECEIPT_PATH || "autonomia-promotion-receipt.json";
  const numbers = await candidateNumbers(client, repository, event);
  const candidates = [];
  for (const number of numbers) candidates.push(await inspectCandidate(client, repository, number, trustedAuthors, requiredWorkflows));

  const receipt = {
    schema: "centraldark.autonomia-promocao.v2",
    generated_at: new Date().toISOString(),
    repository,
    event_name: process.env.GITHUB_EVENT_NAME || "unknown",
    run_id: process.env.GITHUB_RUN_ID || null,
    required_workflows_adversarial: requiredWorkflows,
    candidates,
  };
  const sealed = sealReceipt(receipt);
  await writeFile(outputPath, `${JSON.stringify(sealed, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  console.log(`AUTONOMIA_JUDGE_RECEIPT=${outputPath}`);
  console.log(`AUTONOMIA_JUDGE_SHA256=${sealed.sha256}`);
  for (const candidate of candidates) console.log(`PR=${candidate.pr_number} MODE=${candidate.mode} DECISION=${candidate.decision} HEAD=${candidate.head_sha}`);
}

async function runPromote() {
  const repository = process.env.GITHUB_REPOSITORY || "";
  const client = new GitHubClient(process.env.GITHUB_TOKEN || "");
  const receiptPath = process.env.BOT_RECEIPT_PATH || "autonomia-promotion-receipt.json";
  const sealed = JSON.parse(await readFile(receiptPath, "utf8"));
  const receipt = verifySealedReceipt(sealed);
  if (receipt.repository !== repository) throw new Error("RECEIPT_REPOSITORY_MISMATCH");

  const trustedAuthors = parseCsv(process.env.BOT_TRUSTED_AUTHORS, ["segredounlock"]);
  const requiredWorkflows = parseCsv(process.env.BOT_REQUIRED_WORKFLOWS, DEFAULT_REQUIRED_WORKFLOWS);

  for (const candidate of receipt.candidates || []) {
    const pr = await fetchPull(client, repository, candidate.pr_number);
    if (pr.state !== "open") continue;
    if (pr.head.sha !== candidate.head_sha || pr.base.sha !== candidate.base_sha) {
      console.log(`PR=${pr.number} STATE_CHANGED_REEVALUATE_LATER`);
      continue;
    }

    if (candidate.decision === "BLOCKED") {
      await upsertBlockComment(client, repository, candidate);
      continue;
    }
    if (candidate.decision === "WAIT") continue;

    if (candidate.decision === "UPDATE_REQUIRED") {
      const result = await client.request("PUT", `/repos/${repository}/pulls/${pr.number}/update-branch`, { expected_head_sha: pr.head.sha }, { allow: [202] });
      console.log(`PR=${pr.number} BRANCH_UPDATE_REQUESTED message=${String(result.message || "accepted")}`);
      await client.request("POST", `/repos/${repository}/dispatches`, {
        event_type: "centraldark_autonomia_recheck",
        client_payload: { pr_number: pr.number, reason: "branch_updated", previous_head: pr.head.sha },
      });
      continue;
    }

    const live = await inspectCandidate(client, repository, pr.number, trustedAuthors, requiredWorkflows);
    if (live.decision !== "READY" || live.head_sha !== candidate.head_sha || live.base_sha !== candidate.base_sha) {
      console.log(`PR=${pr.number} LIVE_REVALIDATION=${live.decision}`);
      if (live.decision === "BLOCKED") await upsertBlockComment(client, repository, live);
      continue;
    }

    const result = await client.request("PUT", `/repos/${repository}/pulls/${pr.number}/merge`, {
      sha: pr.head.sha,
      merge_method: "squash",
      commit_title: `${pr.title} (#${pr.number})`,
      commit_message: [
        "Promoção autônoma CentralDark após recibo preso ao HEAD e revalidação viva.",
        "",
        `Mode: ${live.mode}`,
        `Validated-Head: ${pr.head.sha}`,
        `Validated-Base: ${pr.base.sha}`,
        `Judge-Receipt-SHA256: ${sealed.sha256}`,
        `Authorization: ${live.authorization.authority || "UNKNOWN"}`,
        `Intent-Scope: ${live.authorization.intent_scope || "label-persistente"}`,
      ].join("\n"),
    });
    if (!result.merged) throw new Error(`MERGE_REJECTED:${pr.number}:${result.message || "unknown"}`);
    console.log(`PR=${pr.number} MERGED_SHA=${result.sha}`);
    await upsertSuccessComment(client, repository, live, result.sha, sealed.sha256);

    await client.request("POST", `/repos/${repository}/dispatches`, {
      event_type: "centraldark_post_merge",
      client_payload: {
        pr_number: pr.number,
        merge_sha: result.sha,
        validated_head: pr.head.sha,
        judge_receipt_sha256: sealed.sha256,
        mode: live.mode,
      },
    });
  }
}

export async function main(argv = process.argv.slice(2)) {
  const mode = argv[0] || process.env.BOT_MODE || "";
  if (mode === "judge") return runJudge();
  if (mode === "promote") return runPromote();
  throw new Error(`MODE_INVALID:${mode || "empty"}`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(`AUTONOMIA_PROMOCAO_ERROR=${error.message}`);
    process.exit(1);
  });
}

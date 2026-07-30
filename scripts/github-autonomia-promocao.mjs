#!/usr/bin/env node
/**
 * Promoção autônoma e fail-closed de pull requests do CentralDark.
 *
 * Dois papéis separados:
 *   judge   -> somente leitura; produz recibo SHA-256 preso ao PR/HEAD/base.
 *   promote -> revalida o recibo e o estado vivo antes de atualizar ou mergear.
 *
 * O código de PR nunca é executado aqui. O workflow sempre faz checkout da main.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  "needs-human",
  "autonomia-bloqueada",
]);

const RECEIPT_MAX_AGE_MS = 15 * 60 * 1000;
const API = "https://api.github.com";

export function parseCsv(value, fallback = []) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : [...fallback];
}

export function normalizedLabels(pr) {
  return new Set((pr.labels || []).map((label) => String(label.name || label).toLowerCase()));
}

export function authorizationFor(pr) {
  const labels = normalizedLabels(pr);
  const body = `${pr.title || ""}\n${pr.body || ""}`;
  const bodyMarker = /\bPERMITO[ _-]?PIVETE\b/i.test(body);
  return {
    authorized: labels.has("permito-pivete") || bodyMarker,
    viaLabel: labels.has("permito-pivete"),
    viaBody: bodyMarker,
  };
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
    if (run.status !== "completed") {
      return { name, state: "PENDING", run_id: run.id, conclusion: run.conclusion || null };
    }
    if (run.conclusion === "success") {
      return { name, state: "PASS", run_id: run.id, conclusion: run.conclusion };
    }
    return { name, state: "FAIL", run_id: run.id, conclusion: run.conclusion || "unknown" };
  });
}

export function evaluateCandidate({
  pr,
  repository,
  trustedAuthors,
  requiredWorkflows,
  workflowRuns,
  unresolvedThreads,
  reviewThreadsOverflow = false,
  baseUpdateRequired = false,
}) {
  const reasons = [];
  const waits = [];
  const labels = normalizedLabels(pr);
  const auth = authorizationFor(pr);
  const author = String(pr.user?.login || "").toLowerCase();
  const trusted = trustedAuthors.map((value) => value.toLowerCase()).includes(author);
  const sameRepository = pr.head?.repo?.full_name === repository;

  if (pr.state !== "open") reasons.push("PR_NOT_OPEN");
  if (pr.base?.ref !== "main") reasons.push("BASE_NOT_MAIN");
  if (pr.draft) reasons.push("PR_IS_DRAFT");
  if (!sameRepository) reasons.push("HEAD_EXTERNAL_REPOSITORY");
  if (!trusted) reasons.push("AUTHOR_NOT_TRUSTED");
  if (!auth.authorized) reasons.push("PIVETE_AUTHORIZATION_MISSING");

  for (const label of BLOCKING_LABELS) {
    if (labels.has(label)) reasons.push(`BLOCKING_LABEL:${label}`);
  }

  if (reviewThreadsOverflow) reasons.push("REVIEW_THREADS_OVERFLOW");
  if (unresolvedThreads > 0) reasons.push(`UNRESOLVED_REVIEW_THREADS:${unresolvedThreads}`);
  if (pr.mergeable === false || pr.mergeable_state === "dirty") reasons.push("MERGE_CONFLICT");
  if (pr.mergeable == null || pr.mergeable_state === "unknown") waits.push("MERGEABILITY_PENDING");

  const workflows = workflowVerdicts(workflowRuns, requiredWorkflows);
  for (const workflow of workflows) {
    if (workflow.state === "FAIL") reasons.push(`WORKFLOW_FAILED:${workflow.name}:${workflow.conclusion}`);
    if (workflow.state === "MISSING" || workflow.state === "PENDING") {
      waits.push(`WORKFLOW_${workflow.state}:${workflow.name}`);
    }
  }

  let decision = "READY";
  if (reasons.length) decision = "BLOCKED";
  else if (baseUpdateRequired) decision = "UPDATE_REQUIRED";
  else if (waits.length) decision = "WAIT";

  return {
    pr_number: pr.number,
    title: pr.title,
    author: pr.user?.login || null,
    head_sha: pr.head?.sha || null,
    head_ref: pr.head?.ref || null,
    base_sha: pr.base?.sha || null,
    base_ref: pr.base?.ref || null,
    decision,
    authorization: auth,
    trusted_author: trusted,
    same_repository: sameRepository,
    mergeable: pr.mergeable,
    mergeable_state: pr.mergeable_state || null,
    base_update_required: baseUpdateRequired,
    unresolved_review_threads: unresolvedThreads,
    workflows,
    reasons,
    waits,
  };
}

export function sealReceipt(receipt) {
  const serialized = JSON.stringify(receipt);
  return {
    receipt,
    sha256: createHash("sha256").update(serialized).digest("hex"),
  };
}

export function verifySealedReceipt(document, now = Date.now()) {
  if (!document || typeof document !== "object" || !document.receipt || !document.sha256) {
    throw new Error("RECEIPT_SCHEMA_INVALID");
  }
  const expected = createHash("sha256").update(JSON.stringify(document.receipt)).digest("hex");
  if (expected !== document.sha256) throw new Error("RECEIPT_HASH_INVALID");
  const generatedAt = Date.parse(document.receipt.generated_at || "");
  if (!Number.isFinite(generatedAt)) throw new Error("RECEIPT_TIMESTAMP_INVALID");
  if (now - generatedAt > RECEIPT_MAX_AGE_MS || generatedAt - now > 60_000) {
    throw new Error("RECEIPT_EXPIRED");
  }
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
        "User-Agent": "centraldark-autonomia-promocao/1.0",
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
        "User-Agent": "centraldark-autonomia-promocao/1.0",
      },
      body: JSON.stringify({ query, variables }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.errors) {
      throw new Error(`GITHUB_GRAPHQL_FAILED:${JSON.stringify(data.errors || data).slice(0, 500)}`);
    }
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
  for (const pr of event.workflow_run?.pull_requests || []) {
    if (pr.number) numbers.add(Number(pr.number));
  }

  if (!numbers.size && event.workflow_run?.head_sha) {
    const open = await client.request("GET", `/repos/${repository}/pulls?state=open&per_page=100`);
    for (const pr of open) {
      if (pr.head?.sha === event.workflow_run.head_sha) numbers.add(Number(pr.number));
    }
  }
  return [...numbers].filter((number) => Number.isInteger(number) && number > 0);
}

async function fetchPull(client, repository, number) {
  let pr = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    pr = await client.request("GET", `/repos/${repository}/pulls/${number}`);
    if (pr.mergeable != null && pr.mergeable_state !== "unknown") break;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1500));
  }
  return pr;
}

async function fetchWorkflowRuns(client, repository, sha) {
  const data = await client.request(
    "GET",
    `/repos/${repository}/actions/runs?head_sha=${encodeURIComponent(sha)}&per_page=100`,
  );
  return (data.workflow_runs || []).filter((run) => run.head_sha === sha);
}

async function fetchReviewThreadState(client, repository, number) {
  const { owner, name } = repoParts(repository);
  const query = `
    query($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $number) {
          reviewThreads(first: 100) {
            nodes { isResolved }
            pageInfo { hasNextPage }
          }
        }
      }
    }
  `;
  const data = await client.graphql(query, { owner, name, number });
  const threads = data.repository?.pullRequest?.reviewThreads;
  if (!threads) throw new Error(`REVIEW_THREADS_UNAVAILABLE:${number}`);
  return {
    unresolved: threads.nodes.filter((thread) => !thread.isResolved).length,
    overflow: Boolean(threads.pageInfo?.hasNextPage),
  };
}

async function baseUpdateRequired(client, repository, pr) {
  const compare = await client.request(
    "GET",
    `/repos/${repository}/compare/${encodeURIComponent(pr.head.sha)}...${encodeURIComponent(pr.base.sha)}`,
  );
  return Number(compare.ahead_by || 0) > 0;
}

async function inspectCandidate(client, repository, number, trustedAuthors, requiredWorkflows) {
  const pr = await fetchPull(client, repository, number);
  const [workflowRuns, threadState, needsUpdate] = await Promise.all([
    fetchWorkflowRuns(client, repository, pr.head.sha),
    fetchReviewThreadState(client, repository, number),
    baseUpdateRequired(client, repository, pr),
  ]);
  return evaluateCandidate({
    pr,
    repository,
    trustedAuthors,
    requiredWorkflows,
    workflowRuns,
    unresolvedThreads: threadState.unresolved,
    reviewThreadsOverflow: threadState.overflow,
    baseUpdateRequired: needsUpdate,
  });
}

async function upsertBlockComment(client, repository, candidate) {
  const marker = "<!-- centraldark-autonomia-promocao -->";
  const lines = [
    marker,
    "## Promoção autônoma — bloqueada com segurança",
    "",
    `HEAD: \`${candidate.head_sha}\``,
    `Decisão: \`${candidate.decision}\``,
    "",
    "Bloqueios:",
    ...(candidate.reasons.length ? candidate.reasons.map((reason) => `- \`${reason}\``) : ["- estado não elegível"]),
    "",
    "Nenhum merge foi executado. Corrija a causa; o controlador reavalia automaticamente no próximo evento.",
  ];
  const comments = await client.request("GET", `/repos/${repository}/issues/${candidate.pr_number}/comments?per_page=100`);
  const existing = comments.find((comment) => String(comment.body || "").includes(marker));
  if (existing) {
    await client.request("PATCH", `/repos/${repository}/issues/comments/${existing.id}`, { body: lines.join("\n") });
  } else {
    await client.request("POST", `/repos/${repository}/issues/${candidate.pr_number}/comments`, { body: lines.join("\n") });
  }
}

async function ensureAuthorizationLabel(client, repository, pr, candidate) {
  if (candidate.authorization.viaLabel || !candidate.authorization.viaBody) return;
  await client.request("POST", `/repos/${repository}/issues/${pr.number}/labels`, {
    labels: ["permito-pivete"],
  });
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

  for (const number of numbers) {
    candidates.push(await inspectCandidate(client, repository, number, trustedAuthors, requiredWorkflows));
  }

  const receipt = {
    schema: "centraldark.autonomia-promocao.v1",
    generated_at: new Date().toISOString(),
    repository,
    event_name: process.env.GITHUB_EVENT_NAME || "unknown",
    run_id: process.env.GITHUB_RUN_ID || null,
    required_workflows: requiredWorkflows,
    candidates,
  };
  const sealed = sealReceipt(receipt);
  await writeFile(outputPath, `${JSON.stringify(sealed, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  console.log(`AUTONOMIA_JUDGE_RECEIPT=${outputPath}`);
  console.log(`AUTONOMIA_JUDGE_SHA256=${sealed.sha256}`);
  for (const candidate of candidates) {
    console.log(`PR=${candidate.pr_number} DECISION=${candidate.decision} HEAD=${candidate.head_sha}`);
  }
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

    await ensureAuthorizationLabel(client, repository, pr, candidate);

    if (candidate.decision === "BLOCKED") {
      await upsertBlockComment(client, repository, candidate);
      continue;
    }
    if (candidate.decision === "WAIT") continue;

    if (candidate.decision === "UPDATE_REQUIRED") {
      const result = await client.request(
        "PUT",
        `/repos/${repository}/pulls/${pr.number}/update-branch`,
        { expected_head_sha: pr.head.sha },
        { allow: [202] },
      );
      console.log(`PR=${pr.number} BRANCH_UPDATE_REQUESTED message=${String(result.message || "accepted")}`);
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
        "Promoção autônoma CentralDark após juiz read-only e revalidação viva.",
        "",
        `Validated-Head: ${pr.head.sha}`,
        `Validated-Base: ${pr.base.sha}`,
        `Judge-Receipt-SHA256: ${sealed.sha256}`,
        "Authorization: permito-pivete",
      ].join("\n"),
    });
    if (!result.merged) throw new Error(`MERGE_REJECTED:${pr.number}:${result.message || "unknown"}`);
    console.log(`PR=${pr.number} MERGED_SHA=${result.sha}`);
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

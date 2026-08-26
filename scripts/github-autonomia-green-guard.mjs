#!/usr/bin/env node
/**
 * Green-first guard para a promoção canônica.
 *
 * Dois denominadores explícitos:
 * - FAST / AUTO_SQUASH_IF_CLEAN: o juiz já executou os gates causais síncronos
 *   (autoridade, mesmo repo, segredo/caminho sensível, canonical map/consumers,
 *   conflito, CHANGES_REQUESTED, HEAD/base). Workflows auxiliares não pertencem
 *   ao denominador FAST e runner lento não pode transformar WAIT em bloqueio.
 * - ADVERSARIAL: exige a régua completa dos workflows obrigatórios no mesmo PR
 *   e no mesmo HEAD.
 *
 * Isto NÃO converte PENDING/SKIPPED/MISSING em PASS. Quando a catraca é
 * aplicável, todos continuam fail-closed. No FAST ela simplesmente não é parte
 * da prova escolhida pela política autorizada.
 */
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.github.com";
export const MAX_RUN_PAGES = 20;

export const DEFAULT_REQUIRED_WORKFLOWS = Object.freeze([
  "porta-de-entrada",
  "codex-validate",
  "lupa-conformance",
  "Lupa Drift Guard",
  "PR auto-review (Codex + checklist)",
  "Pipeline — Telegram + Painel",
]);

export function parseCsv(value, fallback = []) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : [...fallback];
}

/**
 * FAST autorizado segue pelo denominador causal do juiz e não espera runners
 * auxiliares. Qualquer modo desconhecido continua conservador e usa green-first.
 */
export function shouldEnforceGreenFirst(candidate) {
  if (candidate?.decision !== "READY") return false;
  return candidate?.mode !== "FAST";
}

export function runBelongsToPullHead(run, prNumber, headSha) {
  if (run?.head_sha !== headSha || run?.event !== "pull_request") return false;
  return Array.isArray(run?.pull_requests)
    && run.pull_requests.some((pr) => Number(pr?.number) === Number(prNumber));
}

export function selectLatestRun(runs, workflowName) {
  return [...runs]
    .filter((run) => run.name === workflowName)
    .sort((a, b) => {
      const byNumber = Number(b.run_number || 0) - Number(a.run_number || 0);
      if (byNumber) return byNumber;
      return String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || ""));
    })[0] || null;
}

export function greenVerdicts(runs, requiredWorkflows) {
  return requiredWorkflows.map((name) => {
    const run = selectLatestRun(runs, name);
    if (!run) return { name, state: "MISSING", run_id: null, conclusion: null };
    if (run.status !== "completed") return { name, state: "PENDING", run_id: run.id, conclusion: run.conclusion || null };
    if (run.conclusion === "success") return { name, state: "PASS", run_id: run.id, conclusion: "success" };
    if (run.conclusion === "skipped") return { name, state: "SKIPPED", run_id: run.id, conclusion: "skipped" };
    return { name, state: "FAIL", run_id: run.id, conclusion: run.conclusion || "unknown" };
  });
}

export function greenDecision(runs, requiredWorkflows) {
  const verdicts = greenVerdicts(runs, requiredWorkflows);
  return {
    green: verdicts.length > 0 && verdicts.every((item) => item.state === "PASS"),
    verdicts,
  };
}

async function api(token, method, path) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-autonomia-green-guard/2.1",
    },
  });
  const text = await response.text();
  let data = {};
  if (text) {
    try { data = JSON.parse(text); }
    catch { data = { message: text.slice(0, 300) }; }
  }
  if (!response.ok) throw new Error(`GITHUB_${method}_${path}_${response.status}:${String(data.message || "request failed").slice(0, 300)}`);
  return data;
}

export async function runsForPullHead(token, repository, headSha, prNumber, request = api) {
  const runs = [];
  for (let page = 1; page <= MAX_RUN_PAGES; page += 1) {
    const path = `/repos/${repository}/actions/runs?head_sha=${encodeURIComponent(headSha)}&event=pull_request&per_page=100&page=${page}`;
    const data = await request(token, "GET", path);
    const batch = Array.isArray(data?.workflow_runs) ? data.workflow_runs : [];
    for (const run of batch) {
      if (runBelongsToPullHead(run, prNumber, headSha)) runs.push(run);
    }
    if (batch.length < 100) return runs;
  }
  throw new Error(`GREEN_GUARD_RUNS_OVERFLOW:pages>${MAX_RUN_PAGES}:PR=${prNumber}:HEAD=${headSha}`);
}

export async function main(env = process.env) {
  const repository = env.GITHUB_REPOSITORY || "";
  const token = env.PROMOTER_TOKEN || env.PROMOTION_TOKEN || env.GITHUB_TOKEN || "";
  const sweepDir = env.BOT_SWEEP_DIR || join(env.RUNNER_TEMP || "/tmp", "centraldark-autonomia");
  const required = parseCsv(env.BOT_REQUIRED_WORKFLOWS, DEFAULT_REQUIRED_WORKFLOWS);
  if (!repository.includes("/")) throw new Error("GITHUB_REPOSITORY_INVALID");
  if (!token) throw new Error("GREEN_GUARD_TOKEN_MISSING");

  const names = (await readdir(sweepDir)).filter((name) => /^receipt-pr-\d+\.json$/.test(name)).sort();
  const deferredDir = join(sweepDir, "deferred");
  await mkdir(deferredDir, { recursive: true });

  let checked = 0;
  let passed = 0;
  let deferred = 0;
  let fastSkipped = 0;
  for (const name of names) {
    const path = join(sweepDir, name);
    const document = JSON.parse(await readFile(path, "utf8"));
    const candidate = document?.receipt?.candidates?.[0];
    if (!candidate || candidate.decision !== "READY") continue;

    if (!shouldEnforceGreenFirst(candidate)) {
      if (candidate.mode === "FAST") {
        fastSkipped += 1;
        console.log(`GREEN_GUARD=SKIP_FAST_CAUSAL PR=${candidate.pr_number || "UNKNOWN"} HEAD=${candidate.head_sha || "UNKNOWN"} AUXILIARY_RUNNERS_BLOCK=0`);
      }
      continue;
    }

    const pr = Number(candidate.pr_number || 0);
    const head = String(candidate.head_sha || "");
    if (!pr || !/^[0-9a-f]{40}$/i.test(head)) throw new Error(`GREEN_GUARD_RECEIPT_INVALID:${basename(path)}`);

    checked += 1;
    const runs = await runsForPullHead(token, repository, head, pr);
    const decision = greenDecision(runs, required);
    const compact = decision.verdicts.map((item) => `${item.name}=${item.state}`).join(" | ");

    if (decision.green) {
      passed += 1;
      console.log(`GREEN_GUARD=PASS PR=${pr} HEAD=${head} MODE=${candidate.mode || "UNKNOWN"} ${compact}`);
      continue;
    }

    deferred += 1;
    const target = join(deferredDir, name);
    await rename(path, target);
    await writeFile(`${target}.green-guard.json`, `${JSON.stringify({
      schema: "centraldark.green-first.v3",
      pr_number: pr,
      head_sha: head,
      mode: candidate.mode || "UNKNOWN",
      result: "DEFERRED_UNTIL_GREEN",
      verdicts: decision.verdicts,
    }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    console.log(`GREEN_GUARD=DEFER PR=${pr} HEAD=${head} MODE=${candidate.mode || "UNKNOWN"} ${compact}`);
  }

  console.log(`GREEN_GUARD_SUMMARY checked=${checked} pass=${passed} deferred=${deferred} fast_skipped=${fastSkipped} enforce=ADVERSARIAL_ONLY fast_policy=CAUSAL_READY`);
  if (deferred > 0) throw new Error(`GREEN_GUARD_DEFERRED:${deferred}`);
  return { checked, passed, deferred, fastSkipped };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(`GREEN_GUARD_ERROR=${error.message}`);
    process.exit(1);
  });
}

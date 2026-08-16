#!/usr/bin/env node
/**
 * Green-first guard para a promoção canônica.
 *
 * O juiz pode classificar uma intenção como READY no modo FAST, mas READY de
 * intenção não é sinônimo de gates verdes. Este guard roda imediatamente antes
 * do promotor e só deixa no diretório de promoção os recibos cujo MESMO HEAD
 * tenha PASS real em todos os workflows obrigatórios.
 *
 * Recibo sem verde não é adulterado: ele é movido para `deferred/`, portanto o
 * promotor canônico simplesmente não o encontra nesta rodada. Na rodada
 * seguinte o juiz remede e gera novo recibo.
 */
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.github.com";

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

export function selectLatestNonSkipped(runs, workflowName) {
  return [...runs]
    .filter((run) => run.name === workflowName && run.conclusion !== "skipped")
    .sort((a, b) => {
      const byNumber = Number(b.run_number || 0) - Number(a.run_number || 0);
      if (byNumber) return byNumber;
      return String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || ""));
    })[0] || null;
}

export function greenVerdicts(runs, requiredWorkflows) {
  return requiredWorkflows.map((name) => {
    const run = selectLatestNonSkipped(runs, name);
    if (!run) return { name, state: "MISSING", run_id: null, conclusion: null };
    if (run.status !== "completed") return { name, state: "PENDING", run_id: run.id, conclusion: run.conclusion || null };
    if (run.conclusion === "success") return { name, state: "PASS", run_id: run.id, conclusion: "success" };
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
      "User-Agent": "centraldark-autonomia-green-guard/1.0",
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

async function runsForHead(token, repository, headSha) {
  const data = await api(token, "GET", `/repos/${repository}/actions/runs?head_sha=${encodeURIComponent(headSha)}&per_page=100`);
  return (data.workflow_runs || []).filter((run) => run.head_sha === headSha);
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
  for (const name of names) {
    const path = join(sweepDir, name);
    const document = JSON.parse(await readFile(path, "utf8"));
    const candidate = document?.receipt?.candidates?.[0];
    if (!candidate || candidate.decision !== "READY") continue;

    const pr = Number(candidate.pr_number || 0);
    const head = String(candidate.head_sha || "");
    if (!pr || !/^[0-9a-f]{40}$/i.test(head)) throw new Error(`GREEN_GUARD_RECEIPT_INVALID:${basename(path)}`);

    checked += 1;
    const runs = await runsForHead(token, repository, head);
    const decision = greenDecision(runs, required);
    const compact = decision.verdicts.map((item) => `${item.name}=${item.state}`).join(" | ");

    if (decision.green) {
      passed += 1;
      console.log(`GREEN_GUARD=PASS PR=${pr} HEAD=${head} ${compact}`);
      continue;
    }

    deferred += 1;
    const target = join(deferredDir, name);
    await rename(path, target);
    await writeFile(`${target}.green-guard.json`, `${JSON.stringify({
      schema: "centraldark.green-first.v1",
      pr_number: pr,
      head_sha: head,
      result: "DEFERRED_UNTIL_GREEN",
      verdicts: decision.verdicts,
    }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    console.log(`GREEN_GUARD=DEFER PR=${pr} HEAD=${head} ${compact}`);
  }

  console.log(`GREEN_GUARD_SUMMARY checked=${checked} pass=${passed} deferred=${deferred}`);
  return { checked, passed, deferred };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((error) => {
    console.error(`GREEN_GUARD_ERROR=${error.message}`);
    process.exit(1);
  });
}

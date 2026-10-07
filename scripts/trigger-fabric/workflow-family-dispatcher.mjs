#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const REGISTRY_PATH = resolve(ROOT, "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/WORKFLOW-FAMILIES.json");
export const CLOCK_OWNER = ".github/workflows/trigger-fabric-package.yml";

export function loadRegistry() {
  return JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
}

export function registeredWorkflowSet(registry = loadRegistry()) {
  const result = new Map();
  for (const [family, entry] of Object.entries(registry.families || {})) {
    for (const workflow of entry.workflows || []) {
      if (result.has(workflow)) throw new Error("WORKFLOW_DUPLICATE_FAMILY:" + workflow);
      result.set(workflow, family);
    }
  }
  return result;
}

export function scheduleOwners(root = ROOT) {
  const out = [];
  const dir = resolve(root, ".github/workflows");
  for (const name of readdirSync(dir).filter((n) => /\.ya?ml$/i.test(n)).sort()) {
    const path = resolve(dir, name);
    const text = readFileSync(path, "utf8");
    if (/^  schedule:\s*$/m.test(text)) out.push(".github/workflows/" + name);
  }
  return out;
}

export function verifyWorkflowFamilyContract(root = ROOT, registry = loadRegistry()) {
  const errors = [];
  const registered = registeredWorkflowSet(registry);
  const live = readdirSync(resolve(root, ".github/workflows"))
    .filter((name) => /\.ya?ml$/i.test(name))
    .map((name) => ".github/workflows/" + name)
    .sort();
  const declared = [...registered.keys()].sort();

  for (const path of live) if (!registered.has(path)) errors.push("UNREGISTERED_WORKFLOW:" + path);
  for (const path of declared) if (!live.includes(path)) errors.push("STALE_WORKFLOW_BINDING:" + path);

  const families = Object.keys(registry.families || {});
  if (families.length !== 7) errors.push("FAMILY_COUNT:" + families.length + ":EXPECTED_7");
  if (live.length !== declared.length) errors.push("WORKFLOW_DENOMINATOR:live=" + live.length + ":declared=" + declared.length);

  const schedulers = scheduleOwners(root);
  if (schedulers.length !== 1 || schedulers[0] !== CLOCK_OWNER) {
    errors.push("CLOCK_OWNER_VIOLATION:" + (schedulers.join(",") || "none"));
  }

  const scheduleKeys = new Set();
  for (const binding of registry.schedule_bindings || []) {
    const target = resolve(root, binding.workflow);
    let text = "";
    try { text = readFileSync(target, "utf8"); }
    catch { errors.push("SCHEDULE_TARGET_MISSING:" + binding.workflow); continue; }
    if (!registered.has(binding.workflow)) errors.push("SCHEDULE_TARGET_UNREGISTERED:" + binding.workflow);
    if (!/^\s{2}workflow_dispatch:\s*$/m.test(text)) errors.push("WORKFLOW_DISPATCH_MISSING:" + binding.workflow);
    const key = binding.cron + "\u0000" + binding.workflow;
    if (scheduleKeys.has(key)) errors.push("DUPLICATE_SCHEDULE_BINDING:" + binding.cron + ":" + binding.workflow);
    scheduleKeys.add(key);
  }

  return {
    ok: errors.length === 0,
    errors,
    workflow_count: live.length,
    family_count: families.length,
    clock_owner: schedulers.length === 1 ? schedulers[0] : null,
    schedule_bindings: (registry.schedule_bindings || []).length,
  };
}

export function dueBindings(cron, registry = loadRegistry()) {
  return (registry.schedule_bindings || []).filter((binding) => binding.cron === cron);
}

async function githubDispatch(binding, env = process.env) {
  const repo = env.GITHUB_REPOSITORY || "";
  const token = env.GITHUB_TOKEN || "";
  if (!repo.includes("/")) throw new Error("GITHUB_REPOSITORY_INVALID");
  if (!token) throw new Error("GITHUB_TOKEN_MISSING");

  const workflow = basename(binding.workflow);
  const url = "https://api.github.com/repos/" + repo + "/actions/workflows/" + encodeURIComponent(workflow) + "/dispatches";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-trigger-fabric-family-dispatcher/1.0",
    },
    body: JSON.stringify({ ref: binding.ref || "main" }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("DISPATCH_FAILED:" + binding.workflow + ":" + response.status + ":" + detail.slice(0, 300));
  }
  return { workflow: binding.workflow, family: binding.family, status: response.status };
}

export async function dispatchCron(cron, env = process.env) {
  const registry = loadRegistry();
  const verify = verifyWorkflowFamilyContract(ROOT, registry);
  if (!verify.ok) throw new Error("WORKFLOW_FAMILY_CONTRACT_FAIL:" + verify.errors.join("|"));
  const due = dueBindings(cron, registry);
  const results = [];
  for (const binding of due) {
    results.push(await githubDispatch(binding, env));
    console.log("CLOCK_DISPATCH=PASS cron=" + cron + " family=" + binding.family + " workflow=" + binding.workflow);
  }
  console.log("CLOCK_TICK=PASS cron=" + cron + " due=" + due.length);
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--verify")) {
    const report = verifyWorkflowFamilyContract();
    console.log(JSON.stringify(report));
    if (!report.ok) process.exitCode = 1;
    return;
  }
  const idx = args.indexOf("--cron");
  const cron = idx >= 0 ? args[idx + 1] : process.env.CENTRALDARK_CLOCK_CRON || "";
  if (args.includes("--plan")) {
    console.log(JSON.stringify({ cron, due: dueBindings(cron) }, null, 2));
    return;
  }
  if (args.includes("--dispatch")) {
    if (!cron) throw new Error("CLOCK_CRON_MISSING");
    await dispatchCron(cron);
    return;
  }
  throw new Error("MODE_REQUIRED: --verify | --plan --cron <expr> | --dispatch --cron <expr>");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("WORKFLOW_FAMILY_DISPATCHER_ERROR=" + (error?.message || error));
    process.exitCode = 1;
  });
}

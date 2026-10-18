#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync, mkdirSync, openSync, closeSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const REGISTRY_PATH = resolve(ROOT, "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/WORKFLOW-FAMILIES.json");
export const CLOCK_OWNER = ".github/workflows/trigger-fabric-package.yml";
const ARM_FIELDS = ["owner", "route", "evidence_required", "failure_class", "fallback_order", "same_target_remeasurement"];

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

export function resolveCapabilityArms(binding, registry = loadRegistry()) {
  const catalog = registry.arm_router?.arms || {};
  return (binding.arms || [])
    .map((entry) => {
      const profile = catalog[entry.arm];
      if (!profile) throw new Error("ARM_UNKNOWN:" + entry.arm + ":" + binding.capability);
      return { id: entry.arm, ...profile, ...entry };
    })
    .sort((a, b) => Number(a.fallback_order) - Number(b.fallback_order));
}

export function targetFingerprint(binding) {
  const raw = [binding.capability, binding.family, binding.workflow, binding.target_ref || binding.ref || "main"].join("|");
  return createHash("sha256").update(raw).digest("hex");
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

  if (registry.invariants?.ARM_ROUTER !== true) errors.push("ARM_ROUTER_INVARIANT_MISSING");
  if (registry.invariants?.ARM_FAILURE_IS_CAPABILITY_FAILURE !== false) errors.push("ARM_FAILURE_CAPABILITY_FAILURE_DRIFT");
  if (registry.invariants?.FALLBACK_BEFORE_NEW_CAPABILITY !== true) errors.push("FALLBACK_BEFORE_CREATE_MISSING");

  const catalog = registry.arm_router?.arms || {};
  for (const [armId, arm] of Object.entries(catalog)) {
    for (const field of ARM_FIELDS) if (!(field in arm)) errors.push("ARM_FIELD_MISSING:" + armId + ":" + field);
  }
  if (catalog.HERMES_MISSION_QUEUE?.eligible !== false) errors.push("HERMES_QUEUE_FALSE_GREEN_ELIGIBILITY");

  const scheduleKeys = new Set();
  const capabilities = new Set();
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

    if (!binding.capability) errors.push("CAPABILITY_ID_MISSING:" + binding.workflow);
    else if (capabilities.has(binding.capability)) errors.push("CAPABILITY_ID_DUPLICATE:" + binding.capability);
    else capabilities.add(binding.capability);
    if (!Array.isArray(binding.arms) || binding.arms.length === 0) errors.push("CAPABILITY_ARMS_MISSING:" + binding.workflow);
    else {
      let arms = [];
      try { arms = resolveCapabilityArms(binding, registry); }
      catch (error) { errors.push(error.message); continue; }
      for (let i = 1; i < arms.length; i++) {
        if (Number(arms[i].fallback_order) <= Number(arms[i - 1].fallback_order)) {
          errors.push("ARM_FALLBACK_ORDER_INVALID:" + binding.capability);
        }
      }
      for (const arm of arms) {
        if (arm.eligible === false) errors.push("INELIGIBLE_ARM_BOUND:" + binding.capability + ":" + arm.id);
        if (arm.id === "GITHUB_REPOSITORY_DISPATCH" && !arm.event_type) errors.push("REPOSITORY_DISPATCH_EVENT_MISSING:" + binding.capability);
        if (arm.id === "VPS_LOCAL_COMMAND" && (!Array.isArray(arm.commands) || arm.commands.length === 0)) errors.push("LOCAL_COMMAND_MISSING:" + binding.capability);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    workflow_count: live.length,
    family_count: families.length,
    clock_owner: schedulers.length === 1 ? schedulers[0] : null,
    schedule_bindings: (registry.schedule_bindings || []).length,
    capability_count: capabilities.size,
    arm_catalog: Object.keys(catalog),
  };
}

export function dueBindings(cron, registry = loadRegistry()) {
  return (registry.schedule_bindings || []).filter((binding) => binding.cron === cron);
}

function githubContext(env = process.env) {
  const repo = env.GITHUB_REPOSITORY || "";
  const token = env.GITHUB_TOKEN || "";
  if (!repo.includes("/")) throw new Error("GITHUB_REPOSITORY_INVALID");
  if (!token) throw new Error("GITHUB_TOKEN_MISSING");
  return { repo, token };
}

async function githubWorkflowDispatch(binding, arm, env = process.env) {
  const { repo, token } = githubContext(env);
  const workflow = basename(binding.workflow);
  const url = "https://api.github.com/repos/" + repo + "/actions/workflows/" + encodeURIComponent(workflow) + "/dispatches";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-trigger-fabric-arm-router/1.0",
    },
    body: JSON.stringify({ ref: binding.target_ref || binding.ref || "main" }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("WORKFLOW_DISPATCH_HTTP_" + response.status + ":" + detail.slice(0, 300));
  }
  return { delivered: true, capability_state: "UNKNOWN", route_state: "DISPATCH_ACCEPTED", http_status: response.status };
}

async function githubRepositoryDispatch(binding, arm, env = process.env) {
  const { repo, token } = githubContext(env);
  const fingerprint = targetFingerprint(binding);
  const url = "https://api.github.com/repos/" + repo + "/dispatches";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-trigger-fabric-arm-router/1.0",
    },
    body: JSON.stringify({
      event_type: arm.event_type,
      client_payload: {
        source: "CENTRALDARK_ARM_ROUTER",
        capability_id: binding.capability,
        family: binding.family,
        workflow: binding.workflow,
        target_fingerprint: fingerprint,
      },
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("REPOSITORY_DISPATCH_HTTP_" + response.status + ":" + detail.slice(0, 300));
  }
  return { delivered: true, capability_state: "UNKNOWN", route_state: "DISPATCH_ACCEPTED", http_status: response.status };
}

function expandToken(value, env) {
  return String(value).replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => env[key] || process.env[key] || "");
}

function runCommand(argv, env = process.env) {
  return new Promise((resolvePromise, rejectPromise) => {
    const expanded = argv.map((part) => expandToken(part, env));
    const child = spawn(expanded[0], expanded.slice(1), { cwd: ROOT, env: { ...process.env, ...env } });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", rejectPromise);
    child.on("close", (code, signal) => resolvePromise({ argv: expanded, code, signal, stdout, stderr }));
  });
}

async function vpsLocalCommand(binding, arm, env = process.env) {
  const executions = [];
  for (const command of arm.commands || []) {
    const result = await runCommand(command, env);
    executions.push(result);
    if (result.code !== 0) {
      return {
        delivered: true,
        capability_state: "FAIL",
        route_state: "LOCAL_EXECUTED",
        reason: "LOCAL_COMMAND_EXIT_" + result.code,
        executions,
      };
    }
  }
  const missing = (arm.evidence_files || [])
    .map((file) => expandToken(file, env))
    .filter((file) => !existsSync(file));
  if (missing.length) {
    return {
      delivered: true,
      capability_state: "UNKNOWN",
      route_state: "LOCAL_EXECUTED_EVIDENCE_MISSING",
      reason: "EVIDENCE_MISSING:" + missing.join(","),
      executions,
    };
  }
  return { delivered: true, capability_state: "PASS", route_state: "LOCAL_EXECUTED", executions };
}

export function classifyArmFailure(error) {
  const message = String(error?.message || error || "UNKNOWN");
  if (/HTTP_429|quota|rate.?limit/i.test(message)) return "QUOTA_OR_RATE_LIMIT";
  if (/HTTP_401|HTTP_403|denied|forbidden|policy/i.test(message)) return "AUTH_OR_POLICY";
  if (/HTTP_5\d\d/i.test(message)) return "PROVIDER_FAILURE";
  if (/ENOENT|EACCES|spawn/i.test(message)) return "LOCAL_ROUTE_FAILURE";
  return "TRANSPORT_OR_ROUTE_FAILURE";
}

const DEFAULT_ADAPTERS = {
  GITHUB_WORKFLOW_DISPATCH: githubWorkflowDispatch,
  GITHUB_REPOSITORY_DISPATCH: githubRepositoryDispatch,
  VPS_LOCAL_COMMAND: vpsLocalCommand,
};

export async function routeCapability(binding, env = process.env, adapters = DEFAULT_ADAPTERS, registry = loadRegistry()) {
  const fingerprint = targetFingerprint(binding);
  const arms = resolveCapabilityArms(binding, registry);
  const attempts = [];

  for (const arm of arms) {
    const adapter = adapters[arm.id];
    if (!adapter) {
      attempts.push({ arm: arm.id, route_state: "ARM_UNAVAILABLE", failure_class: "ADAPTER_MISSING" });
      continue;
    }
    try {
      const outcome = await adapter(binding, arm, env);
      attempts.push({
        arm: arm.id,
        route_state: outcome.route_state || "DELIVERED",
        capability_state: outcome.capability_state || "UNKNOWN",
      });
      return {
        capability: binding.capability,
        family: binding.family,
        workflow: binding.workflow,
        target_fingerprint: fingerprint,
        used_arm: arm.id,
        state: outcome.capability_state || "UNKNOWN",
        route_state: outcome.route_state || "DELIVERED",
        attempts,
        next_cursor: outcome.capability_state === "UNKNOWN" ? "REMEASURE_CAPABILITY:" + binding.capability : null,
        outcome,
      };
    } catch (error) {
      attempts.push({
        arm: arm.id,
        route_state: "ARM_FAILED",
        failure_class: classifyArmFailure(error),
        error: String(error?.message || error).slice(0, 500),
      });
    }
  }

  return {
    capability: binding.capability,
    family: binding.family,
    workflow: binding.workflow,
    target_fingerprint: fingerprint,
    used_arm: null,
    state: "BLOCKED",
    route_state: "ALL_ARMS_FAILED",
    attempts,
    next_cursor: "REPAIR_ARM_ROUTE:" + binding.capability,
  };
}

export async function dispatchCron(cron, env = process.env, adapters = DEFAULT_ADAPTERS) {
  const registry = loadRegistry();
  const verify = verifyWorkflowFamilyContract(ROOT, registry);
  if (!verify.ok) throw new Error("WORKFLOW_FAMILY_CONTRACT_FAIL:" + verify.errors.join("|"));
  const due = dueBindings(cron, registry);
  const results = [];
  let hardFailure = false;
  for (const binding of due) {
    const result = await routeCapability(binding, env, adapters, registry);
    results.push(result);
    console.log("ARM_ROUTER_RECEIPT=" + JSON.stringify(result));
    if (result.state === "BLOCKED" || result.state === "FAIL") hardFailure = true;
  }
  console.log("CLOCK_TICK=PASS cron=" + cron + " due=" + due.length + " routed=" + results.length);
  if (hardFailure) {
    const blocked = results.filter((item) => item.state === "BLOCKED" || item.state === "FAIL").map((item) => item.capability + ":" + item.state);
    throw new Error("CAPABILITY_ROUTING_NOT_GREEN:" + blocked.join(","));
  }
  return results;
}


// CASA_PULSE_ROUTER_V1 — pulso autenticado, roteamento deterministico no dispatcher existente.
// Evento tipado nunca vira shell, nova familia, relogio, URL ou comando fornecido pela Casa.
export function selectCasaPulse(input, registry = loadRegistry(), now = Date.now()) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("PULSE_OBJECT_REQUIRED");
  if (input.source !== "CASA") throw new Error("PULSE_SOURCE_DENIED");
  const eventType = String(input.event_type || "");
  const eventId = String(input.event_id || "");
  if (!/^CASA_[A-Z_]{4,48}$/.test(eventType)) throw new Error("PULSE_EVENT_TYPE_INVALID");
  if (!/^[A-Za-z0-9_-]{12,96}$/.test(eventId)) throw new Error("PULSE_ID_INVALID");
  const timestamp = Date.parse(String(input.occurred_at || ""));
  if (!Number.isFinite(timestamp) || timestamp > now + 30_000 || now - timestamp > 300_000)
    throw new Error("PULSE_STALE_OR_FUTURE");
  const declared = registry.pulse_bindings?.[eventType];
  if (!declared) throw new Error("PULSE_EVENT_UNREGISTERED");
  const matches = (registry.schedule_bindings || []).filter(
    (x) => x.family === declared.family && x.capability === declared.capability
  );
  if (matches.length !== 1) throw new Error("PULSE_TARGET_AMBIGUOUS_OR_MISSING");
  return { eventType, eventId, occurredAt: new Date(timestamp).toISOString(), binding: matches[0] };
}

export async function dispatchCasaPulse(input, env = process.env, adapters = DEFAULT_ADAPTERS, registry = loadRegistry()) {
  const chosen = selectCasaPulse(input, registry);
  const identity = createHash("sha256").update(chosen.eventId).digest("hex");
  const ledgerDir = resolve(env.CENTRALDARK_LOG_ROOT || resolve(ROOT, "logs"), "trigger-fabric", "casa-pulses");
  mkdirSync(ledgerDir, { recursive: true, mode: 0o700 });
  const receiptPath = resolve(ledgerDir, identity + ".json");
  const baseline = {
    schema: "centraldark.casa-pulse.v1", event_type: chosen.eventType,
    event_id_hash: identity, family: chosen.binding.family, capability: chosen.binding.capability,
    fingerprint: targetFingerprint(chosen.binding), observed_at: new Date().toISOString(),
  };
  let fd;
  try {
    fd = openSync(receiptPath, "wx", 0o600);
    writeFileSync(fd, JSON.stringify({ ...baseline, state: "PENDING",
      next_cursor: "AWAIT_DISPATCH_READBACK" }) + "\n");
    closeSync(fd); fd = undefined;
  } catch (error) {
    if (fd !== undefined) try { closeSync(fd); } catch {}
    if (error?.code !== "EEXIST") throw error;
    let prev;
    try { prev = JSON.parse(readFileSync(receiptPath, "utf8")); } catch {}
    return { ...baseline, state: "DUPLICATE_NO_REEXECUTION",
      prior_state: prev?.state || "UNKNOWN", next_cursor: "READ_PREVIOUS_RECEIPT" };
  }
  let result;
  try { result = await routeCapability(chosen.binding, env, adapters, registry); }
  catch (error) {
    result = { state: "BLOCKED", next_cursor: "RECONCILE_DISPATCH_ROUTE",
      failure: String(error?.message || error).slice(0, 160) };
  }
  const receipt = { ...baseline, state: result.state || "UNKNOWN",
    route_state: result.route_state || "UNKNOWN", used_arm: result.used_arm || null,
    next_cursor: result.next_cursor || "VERIFY_EFFECT_ON_TARGET" };
  writeFileSync(receiptPath, JSON.stringify(receipt) + "\n", { mode: 0o600 });
  return receipt;
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
    const registry = loadRegistry();
    console.log(JSON.stringify({
      cron,
      due: dueBindings(cron, registry).map((binding) => ({ ...binding, resolved_arms: resolveCapabilityArms(binding, registry) })),
    }, null, 2));
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

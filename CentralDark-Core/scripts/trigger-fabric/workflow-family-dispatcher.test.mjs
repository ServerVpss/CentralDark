import assert from "node:assert/strict";
import test from "node:test";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CLOCK_OWNER,
  dueBindings,
  loadRegistry,
  registeredWorkflowSet,
  resolveCapabilityArms,
  routeCapability,
  scheduleOwners,
  verifyWorkflowFamilyContract,
} from "./workflow-family-dispatcher.mjs";

test("74 workflows pertencem exatamente a 7 familias", () => {
  const registry = loadRegistry();
  const registered = registeredWorkflowSet(registry);
  assert.equal(Object.keys(registry.families).length, 7);
  assert.equal(registered.size, 74);
  assert.equal(registry.invariants.WORKFLOW_COUNT_BASELINE, 74);
  for (const family of Object.values(registry.families)) {
    assert.equal(family.count, family.workflows.length);
  }
});

test("cron automatico permanece pausado por ordem do CHEFE, com owner unico e dispatch manual", () => {
  const report = verifyWorkflowFamilyContract();
  assert.deepEqual(scheduleOwners(), []);
  assert.equal(report.ok, true, report.errors.join("\n"));
  assert.equal(report.clock_owner, CLOCK_OWNER);
  assert.equal(report.clock_mode, "MANUAL_PAUSED_BY_CHEFE");
  assert.equal(report.clock_scheduler_active, false);
});

test("clock sem owner correto ou pausa nao comprovada continua reprovado", () => {
  const registry = loadRegistry();
  for (const invalid of [
    { ...registry, clock_mode: "ACTIVE" },
    { ...registry, clock_owner: ".github/workflows/inexistente.yml" },
    { ...registry, clock_mode: "UNKNOWN" },
  ]) {
    const report = verifyWorkflowFamilyContract(undefined, invalid);
    assert.equal(report.ok, false);
    assert.ok(report.errors.some((error) => error.startsWith("CLOCK_OWNER_VIOLATION")));
  }
});

test("20 capabilities declaram ARM_ROUTER sem criar segundo relogio", () => {
  const registry = loadRegistry();
  const report = verifyWorkflowFamilyContract(undefined, registry);
  assert.equal(report.ok, true, report.errors.join("\n"));
  assert.equal(report.schedule_bindings, 20);
  assert.equal(report.capability_count, 20);
  for (const binding of registry.schedule_bindings) {
    const arms = resolveCapabilityArms(binding, registry);
    assert.ok(arms.length >= 1, binding.capability);
    for (const arm of arms) {
      for (const field of ["owner", "route", "evidence_required", "failure_class", "fallback_order", "same_target_remeasurement"]) {
        assert.ok(field in arm, `${binding.capability}:${arm.id}:${field}`);
      }
    }
  }
});

test("watchdog preserva a cadencia no binding do clock pausado", () => {
  const registry = loadRegistry();
  const due = dueBindings("*/5 * * * *", registry);
  assert.equal(due.length, 1);
  assert.equal(due[0].workflow, ".github/workflows/ci-failed-run-watchdog.yml");
  assert.equal(due[0].capability, "CI_FAILED_RUN_WATCHDOG");
  assert.equal(due[0].family, "SENTINELA_OBSERVABILIDADE");
  assert.equal(registry.clock_mode, "MANUAL_PAUSED_BY_CHEFE");
  assert.equal(verifyWorkflowFamilyContract(undefined, registry).clock_scheduler_active, false);
});

test("watchdog sem registro continua reprovado por identidade e denominador", () => {
  const registry = loadRegistry();
  registry.families.SENTINELA_OBSERVABILIDADE.workflows =
    registry.families.SENTINELA_OBSERVABILIDADE.workflows.filter((path) => !path.endsWith("/ci-failed-run-watchdog.yml"));
  const report = verifyWorkflowFamilyContract(undefined, registry);
  assert.equal(report.ok, false);
  assert.ok(report.errors.includes("UNREGISTERED_WORKFLOW:.github/workflows/ci-failed-run-watchdog.yml"));
  assert.ok(report.errors.includes("WORKFLOW_DENOMINATOR:live=74:declared=73"));
});

test("cron autonomo reintroduzido no watchdog continua bloqueado", () => {
  const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
  const fixture = mkdtempSync(resolve(tmpdir(), "centraldark-workflow-clock-"));
  const workflowDir = resolve(fixture, ".github/workflows");
  mkdirSync(workflowDir, { recursive: true });
  try {
    for (const name of readdirSync(resolve(root, ".github/workflows")).filter((name) => /\.ya?ml$/i.test(name))) {
      copyFileSync(resolve(root, ".github/workflows", name), resolve(workflowDir, name));
    }
    const watchdog = resolve(workflowDir, "ci-failed-run-watchdog.yml");
    writeFileSync(watchdog, readFileSync(watchdog, "utf8").replace(/^on:\s*$/m, 'on:\n  schedule:\n    - cron: "*/5 * * * *"'));
    const report = verifyWorkflowFamilyContract(fixture);
    assert.equal(report.ok, false);
    assert.ok(report.errors.includes("CLOCK_OWNER_VIOLATION:.github/workflows/ci-failed-run-watchdog.yml"));
    assert.equal(report.clock_scheduler_active, false);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test("Hermes Mission Queue existe no organismo mas nao vira braço elegivel sem same-target proof", () => {
  const registry = loadRegistry();
  assert.equal(registry.arm_router.arms.HERMES_MISSION_QUEUE.eligible, false);
  assert.match(registry.arm_router.arms.HERMES_MISSION_QUEUE.reason, /SAME_TARGET_MAPPING_NOT_PROVEN/);
  assert.equal(registry.schedule_bindings.some((binding) => binding.arms.some((arm) => arm.arm === "HERMES_MISSION_QUEUE")), false);
});

test("cron compartilhado despacha capabilities sem criar segundo relogio", () => {
  const due = dueBindings("17,47 * * * *");
  assert.deepEqual(
    due.map((item) => item.workflow).sort(),
    [
      ".github/workflows/autonomia-promocao.yml",
      ".github/workflows/dependabot-auto-merge.yml",
    ],
  );
});

test("cron desconhecido nao inventa capability", () => {
  assert.deepEqual(dueBindings("59 23 31 2 *"), []);
});

test("ARM failure sobe uma casa e usa VPS local no mesmo capability", async () => {
  const registry = loadRegistry();
  const binding = registry.schedule_bindings.find((item) => item.capability === "WORKFLOW_DEDUPE_RADAR");
  const result = await routeCapability(binding, {}, {
    GITHUB_WORKFLOW_DISPATCH: async () => { throw new Error("WORKFLOW_DISPATCH_HTTP_503"); },
    VPS_LOCAL_COMMAND: async () => ({ delivered: true, capability_state: "PASS", route_state: "LOCAL_EXECUTED" }),
  }, registry);
  assert.equal(result.state, "PASS");
  assert.equal(result.used_arm, "VPS_LOCAL_COMMAND");
  assert.deepEqual(result.attempts.map((x) => x.route_state), ["ARM_FAILED", "LOCAL_EXECUTED"]);
});

test("capability FAIL no braço local nao vira ARM failure nem falso fallback", async () => {
  const registry = loadRegistry();
  const binding = registry.schedule_bindings.find((item) => item.capability === "WORKFLOW_DEDUPE_RADAR");
  const result = await routeCapability(binding, {}, {
    GITHUB_WORKFLOW_DISPATCH: async () => { throw new Error("WORKFLOW_DISPATCH_HTTP_503"); },
    VPS_LOCAL_COMMAND: async () => ({ delivered: true, capability_state: "FAIL", route_state: "LOCAL_EXECUTED", reason: "VISUAL_CANON_FAIL" }),
  }, registry);
  assert.equal(result.state, "FAIL");
  assert.equal(result.used_arm, "VPS_LOCAL_COMMAND");
  assert.equal(result.attempts.at(-1).capability_state, "FAIL");
});

test("repository_dispatch e fallback autorizado somente em capability que declarou evento same-target", async () => {
  const registry = loadRegistry();
  const binding = registry.schedule_bindings.find((item) => item.capability === "PR_UPDATE_BRANCH_DETERMINISTIC");
  const arms = resolveCapabilityArms(binding, registry);
  assert.deepEqual(arms.map((x) => x.id), ["GITHUB_WORKFLOW_DISPATCH", "GITHUB_REPOSITORY_DISPATCH"]);
  const result = await routeCapability(binding, {}, {
    GITHUB_WORKFLOW_DISPATCH: async () => { throw new Error("WORKFLOW_DISPATCH_HTTP_429"); },
    GITHUB_REPOSITORY_DISPATCH: async () => ({ delivered: true, capability_state: "UNKNOWN", route_state: "DISPATCH_ACCEPTED" }),
  }, registry);
  assert.equal(result.state, "UNKNOWN");
  assert.equal(result.used_arm, "GITHUB_REPOSITORY_DISPATCH");
  assert.equal(result.next_cursor, "REMEASURE_CAPABILITY:PR_UPDATE_BRANCH_DETERMINISTIC");
});

test("todos os braços falharam fecha BLOCKED com receipt e NEXT_CURSOR", async () => {
  const registry = loadRegistry();
  const binding = registry.schedule_bindings.find((item) => item.capability === "SENTINELA_DIVERGENCIAS");
  const result = await routeCapability(binding, {}, {
    GITHUB_WORKFLOW_DISPATCH: async () => { throw new Error("WORKFLOW_DISPATCH_HTTP_503"); },
    GITHUB_REPOSITORY_DISPATCH: async () => { throw new Error("REPOSITORY_DISPATCH_HTTP_403"); },
  }, registry);
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.route_state, "ALL_ARMS_FAILED");
  assert.equal(result.used_arm, null);
  assert.equal(result.attempts.length, 2);
  assert.equal(result.next_cursor, "REPAIR_ARM_ROUTE:SENTINELA_DIVERGENCIAS");
});

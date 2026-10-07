import assert from "node:assert/strict";
import test from "node:test";
import {
  CLOCK_OWNER,
  dueBindings,
  loadRegistry,
  registeredWorkflowSet,
  scheduleOwners,
  verifyWorkflowFamilyContract,
} from "./workflow-family-dispatcher.mjs";

test("71 workflows pertencem exatamente a 7 familias", () => {
  const registry = loadRegistry();
  const registered = registeredWorkflowSet(registry);
  assert.equal(Object.keys(registry.families).length, 7);
  assert.equal(registered.size, 71);
});

test("somente Trigger Fabric possui relogio schedule", () => {
  assert.deepEqual(scheduleOwners(), [CLOCK_OWNER]);
});

test("todo binding agendado resolve para workflow_dispatch", () => {
  const report = verifyWorkflowFamilyContract();
  assert.equal(report.ok, true, report.errors.join("\n"));
  assert.equal(report.schedule_bindings, 19);
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

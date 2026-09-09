#!/usr/bin/env node
import assert from "node:assert/strict";
import { classifyMaterialDrift } from "./material-drift-classifier.mjs";

const unrelated = classifyMaterialDrift({
  behind_total: 8,
  main_changes: ["docs/notion-report.md"],
  active_scopes: ["apps/modulos/Bolt/source"],
});

assert.equal(unrelated.status, "UNRELATED_DRIFT");
assert.equal(unrelated.action, "IGNORE_AND_CONTINUE_PREVIOUS_FLOW");
assert.equal(unrelated.behind_touching_active_scope, 0);

const workflowGate = classifyMaterialDrift({
  behind_total: 1,
  main_changes: [".github/workflows/test-vps-ssh.yml"],
  active_scopes: ["apps/modulos/Bolt/source"],
});

assert.equal(workflowGate.status, "MATERIAL_DRIFT");
assert.equal(workflowGate.action, "RECONCILE_OR_REMEASURE");

const unknown = classifyMaterialDrift({ behind_total: 3 });

assert.equal(unknown.status, "UNKNOWN_DRIFT");
assert.equal(unknown.action, "MEASURE_NOT_PASS");

console.log("PASS material-drift-classifier.test.mjs");

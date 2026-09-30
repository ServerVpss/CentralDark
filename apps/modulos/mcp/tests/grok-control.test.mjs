import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("Admin Grok salva default seguro e adapter consome sem transformar seleção em prova", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-grok-control-"));
  const stateFile = path.join(tmp, "logs", "control", "grok-mode.json");
  process.env.CENTRALDARK_GROK_MODE_STATE = stateFile;
  process.env.CENTRALDARK_LOG_ROOT = path.join(tmp, "logs");

  const control = await import(`../src/grok-control.js?test=${Date.now()}`);
  const initial = control.getGrokControlDashboard();
  assert.equal(initial.state.invocation_mode, "HEADLESS");
  assert.equal(initial.activation.selected_is_active, false);
  assert.equal(initial.proof_boundary.SELECTED_IS_NOT_ACTIVE, true);
  const selected = control.setGrokControlSelection({
    invocation_mode: "HEADLESS",
    agent_profile: "plan",
    permission_mode: "plan",
    model: "grok-4.5",
    reasoning_effort: "inherit",
    subagents_enabled: true,
    plan_enabled: true,
  });
  assert.equal(selected.state.agent_profile, "plan");
  assert.equal(selected.state.model, "grok-4.5");
  assert.equal(selected.activation.state, "SELECTED_NOT_RUNTIME_PROVEN");
  assert.ok(fs.existsSync(stateFile));
  assert.equal(fs.statSync(stateFile).mode & 0o777, 0o600);

  const adapter = await import(`../../HERMES-CORE/core/grok-build-adapter.mjs?test=${Date.now()}`);
  const invocation = adapter.buildGrokInvocation({
    workdir: "/tmp/project",
    prompt: "inspect only",
  });
  assert.equal(invocation.control_profile.agent_profile, "plan");
  assert.equal(invocation.control_profile.model, "grok-4.5");
  assert.equal(invocation.selection_is_runtime_proof, false);
  const audit = control.setGrokControlSelection({
    invocation_mode: "READ_ONLY_AUDIT",
    agent_profile: "general-purpose",
    permission_mode: "default",
    model: "grok-4.6",
    reasoning_effort: "low",
    subagents_enabled: true,
    plan_enabled: false,
  });
  assert.equal(audit.state.agent_profile, "explore");
  assert.equal(audit.state.permission_mode, "plan");
  assert.equal(audit.state.subagents_enabled, false);
  assert.equal(audit.state.plan_enabled, true);

  assert.throws(
    () => control.setGrokControlSelection({ permission_mode: "bypassPermissions" }),
    /PERMISSION_MODE_NOT_ADMIN_SELECTABLE/,
  );

  const day = new Date().toISOString().slice(0, 10);
  const logFile = path.join(tmp, "logs", "events", `${day}.jsonl`);
  assert.ok(fs.existsSync(logFile));
  const text = fs.readFileSync(logFile, "utf8");
  assert.match(text, /grok_mode_selected/);
  assert.doesNotMatch(text, /password|secret|token/i);
});

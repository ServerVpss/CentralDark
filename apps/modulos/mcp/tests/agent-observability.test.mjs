import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("agent observability ingere Grok/Hermes e extrai delegacao comprovada", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-agentobs-"));
  const logs = path.join(tmp, "logs");
  const grokRoot = path.join(tmp, "grok");
  const grokSession = path.join(grokRoot, "session-1");
  const hermesDir = path.join(tmp, "hermes");
  const pm2Dir = path.join(tmp, "pm2");
  fs.mkdirSync(grokSession, { recursive: true });
  fs.mkdirSync(hermesDir, { recursive: true });
  fs.mkdirSync(pm2Dir, { recursive: true });

  const updates = [
    {
      params: {
        sessionId: "grok-session",
        update: {
          sessionUpdate: "subagent_spawned",
          subagent_type: "general-purpose",
          model: "grok-4.6",
          description: "loop: verificar deploy a cada 10 minutos",
        },
      },
    },
    {
      params: {
        sessionId: "grok-session",
        update: {
          sessionUpdate: "tool_call",
          title: "run_terminal_command",
          rawInput: {
            command: "HERMES_ACCEPT_HOOKS=1 hermes cron edit 70c07f9b --provider xai-oauth --model grok-4.6",
            description: "delegar watcher ao Hermes",
          },
          _meta: {
            "x.ai/tool": {
              name: "run_terminal_command",
              namespace: "grok_build",
              read_only: false,
            },
          },
        },
      },
    },
    {
      params: {
        sessionId: "grok-session",
        update: {
          sessionUpdate: "subagent_finished",
          subagent_type: "general-purpose",
          status: "completed",
          tool_calls: 36,
          turns: 17,
          duration_ms: 38477,
          tokens_used: 90109,
        },
      },
    },
  ];
  fs.writeFileSync(
    path.join(grokSession, "updates.jsonl"),
    updates.map((row) => JSON.stringify(row)).join("\n") + "\n",
  );

  const now = new Date().toISOString();
  const events = [
    { ts: now, type: "turn_started", model_id: "grok-4.6", turn_number: 1, yolo_mode: true, session_relationship: "primary" },
    { ts: now, type: "loop_started", loop_index: 1 },
    { ts: now, type: "phase_changed", phase: "waiting_for_model", loop_index: 1 },
    { ts: now, type: "phase_changed", phase: "tool_execution", loop_index: 1 },
    { ts: now, type: "tool_started", tool_name: "scheduler_create", loop_index: 1 },
    { ts: now, type: "tool_completed", tool_name: "scheduler_create", outcome: "success", duration_ms: 12 },
    { ts: now, type: "permission_resolved", decision: "allow", wait_ms: 3 },
  ];
  fs.writeFileSync(
    path.join(grokSession, "events.jsonl"),
    events.map((row) => JSON.stringify(row)).join("\n") + "\n",
  );
  const grokUnified = path.join(tmp, "grok-unified.jsonl");
  const unified = [
    { ts: now, msg: "subagent spawn credentials", sid: "s1", ctx: { subagent_id: "child-1", subagent_type: "general-purpose", effective_model: "grok-4.6", parent_model: "grok-4.6", model_has_own_creds: false } },
    { ts: now, msg: "subagent completed", sid: "s1", ctx: { subagent_id: "child-1", subagent_type: "general-purpose", effective_model: "grok-4.6", success: true, duration_ms: 50, turns: 2, tool_calls: 4 } },
    { ts: now, msg: "shell.turn.inference_retry", sid: "s1", ctx: { attempt: 1, max_retries: 3, reason: "transient" } },
  ];
  fs.writeFileSync(grokUnified, unified.map((row) => JSON.stringify(row)).join("\n") + "\n");

  const usage = [
    {
      ts: new Date().toISOString(),
      job_id: "70c07f9b",
      fire_id: "fire-1",
      prompt_tokens: 100,
      completion_tokens: 20,
      total_tokens: 120,
      model: "grok-4.6",
      duration_ms: 900,
      error: null,
    },
    {
      ts: new Date().toISOString(),
      job_id: "70c07f9b",
      fire_id: "fire-2",
      prompt_tokens: 80,
      completion_tokens: 10,
      total_tokens: 90,
      model: "grok-4.6",
      duration_ms: 700,
      error: null,
    },
  ];
  const usageFile = path.join(hermesDir, "usage_audit.jsonl");
  fs.writeFileSync(usageFile, usage.map((row) => JSON.stringify(row)).join("\n") + "\n");
  const gatewayFile = path.join(hermesDir, "gateway.log");
  fs.writeFileSync(gatewayFile, "2026-09-19 10:00:00,000 INFO gateway.run: Gateway running with 1 platform(s)\n");
  fs.writeFileSync(
    path.join(pm2Dir, "CentralDark-MCP-error.log"),
    "2026-09-19 error Bearer abcdefghijklmnopqrstuvwxyz0123456789\n",
  );

  process.env.CENTRALDARK_LOG_ROOT = logs;
  process.env.CENTRALDARK_GROK_SESSIONS = grokRoot;
  process.env.CENTRALDARK_GROK_UNIFIED = grokUnified;
  process.env.CENTRALDARK_HERMES_USAGE = usageFile;
  process.env.CENTRALDARK_HERMES_GATEWAY = gatewayFile;
  process.env.CENTRALDARK_PM2_LOG_ROOT = pm2Dir;
  process.env.CENTRALDARK_AGENT_INGEST_INTERVAL_MS = "1";

  const mod = await import(`../src/agent-observability.js?test=${Date.now()}`);
  const ingest = await mod.ingestAgentLogs({ force: true });
  assert.equal(ingest.status, "OK");
  assert.ok(ingest.events >= 7);

  const report = await mod.extractAgentPatterns({ agent: "all", since_minutes: 60, limit: 500 });
  const ids = new Set(report.patterns.map((item) => item.id));
  assert.ok(ids.has("GROK_DELEGATES_VIA_HERMES"));
  assert.ok(ids.has("GROK_OWNS_SUBAGENTS"));
  assert.ok(ids.has("HERMES_EXECUTES_GROK_MODEL"));
  assert.ok(ids.has("HERMES_RECURRING_JOB_LOOP"));
  assert.ok(ids.has("GROK_RUNTIME_STATE_MACHINE"));
  assert.ok(ids.has("GROK_BACKGROUND_ORCHESTRATION"));
  assert.ok(ids.has("GROK_INFERENCE_RECOVERY_LOOP"));
  assert.ok(report.delegation_edges.some((edge) => edge.name === "grok->hermes:hermes-cli"));
  assert.equal(report.grok_runtime.turns_started, 1);
  assert.equal(report.grok_runtime.loops_started, 1);
  assert.equal(report.grok_runtime.runtime_subagents_spawned, 1);
  assert.equal(report.grok_runtime.runtime_subagents_completed, 1);
  assert.equal(report.grok_runtime.inference_retries, 1);
  assert.equal(report.token_volume_by_model[0].total_units, 210);

  const rows = mod.queryCentralLogs({ since_minutes: 60, sector: "agents", tag: "delegation", limit: 20 });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].data.to, "hermes");
  assert.equal(rows[0].badge, "🔗");

  const audit = await import("../src/audit-logger.js");
  audit.auditToolExecution({
    method: "tools/call",
    toolName: "deploy_status",
    clientLabel: "codex-test",
    callerUser: "tester",
    endpointRole: "public",
    correlationId: "corr-unit-1234",
    input: { branch: "main" },
    result: { status: "OK" },
    durationMs: 12,
    exitCode: null,
    ok: true,
  });
  const mcpRows = mod.queryCentralLogs({ since_minutes: 60, sector: "mcp", kind: "mcp_tool_call", limit: 20 });
  assert.ok(mcpRows.some((row) => row.actor === "codex-test" && row.badge === "🛠️" && row.correlation_id === "corr-unit-1234"));

  const pm2File = path.join(pm2Dir, "CentralDark-MCP-error.log");
  fs.writeFileSync(pm2File, "fresh error after rotation\n");
  const rotated = await mod.ingestAgentLogs({ force: true });
  assert.equal(rotated.status, "OK");
  const rotatedRows = mod.queryCentralLogs({
    since_minutes: 60,
    sector: "mcp",
    key: "pm2:CentralDark-MCP:error",
    limit: 50,
  });
  assert.ok(rotatedRows.some((row) => row.message === "fresh error after rotation"));

  const day = new Date().toISOString().slice(0, 10);
  assert.ok(fs.existsSync(path.join(logs, "events", `${day}.jsonl`)));
  assert.ok(fs.existsSync(path.join(logs, "sectors", "agents", `${day}.jsonl`)));

  const allText = fs.readFileSync(path.join(logs, "events", `${day}.jsonl`), "utf8");
  assert.doesNotMatch(allText, /abcdefghijklmnopqrstuvwxyz0123456789/);
  assert.match(allText, /Bearer \[REDACTED\]/);
});


test("Playwright Casa metadata travels through the existing SSH log funnel", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-browser-probe-"));
  try {
    const payload = {
      source: "LOGS-VS-CODE.log", epoch: "2026-10-17T04:00:00",
      route: "tailscale", from_offset: 0, to_offset: 0, signals: [],
      playwright: { cache_state: "FILES_PRESENT", revision: "1228",
        runtime_state: "PROCESS_OBSERVED", process_count: 1, extra: "DROP_ME" },
    };
    const run = (data) => spawnSync(process.execPath,
      ["scripts/vps/ingest-vscode-log.mjs"], {
        cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../.."),
        env: { ...process.env, CENTRALDARK_LOG_ROOT: root },
        input: JSON.stringify(data), encoding: "utf8",
      });
    const accepted = run(payload);
    assert.equal(accepted.status, 0, accepted.stderr);
    const folder = path.join(root, "events");
    const rows = fs.readFileSync(path.join(folder, fs.readdirSync(folder)[0]), "utf8")
      .trim().split("\n").map(JSON.parse);
    const observed = rows.at(-1).data.playwright;
    assert.equal(observed.revision, "1228");
    assert.equal(observed.process_count, 1);
    assert.equal(observed.automation_roundtrip, "UNPROVEN");
    assert.equal(Object.hasOwn(observed, "extra"), false);
    const invalid = run({ ...payload, playwright: { ...payload.playwright, process_count: -1 } });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /invalid_playwright_probe/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

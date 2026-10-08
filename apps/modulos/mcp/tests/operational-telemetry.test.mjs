import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { getOperationalSnapshot } from "../src/operational-telemetry.js";

test("snapshot é fail-closed sem receipt", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-telemetry-"));
  const snap = getOperationalSnapshot({ root, heartbeat: { self: "alive" } });
  assert.equal(snap.schema, "centraldark.operational.snapshot.v1");
  assert.equal(snap.forensic.status, "UNKNOWN");
  assert.equal(snap.verdict, "UNKNOWN_NOT_PASS");
  assert.equal(snap.secretBoundary.contentExposed, false);
  assert.equal(snap.fronts.length, 10);
  assert.equal(snap.patternAlignment.redOutsidePct, 80);
  assert.equal(snap.patternAlignment.outsidePct, 80);
  assert.equal(snap.patternAlignment.marker, "RED");
  assert.equal(snap.patternAlignment.unknownCount, 2);
});

test("snapshot lê receipt sanitizado sem ler secrets", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-telemetry-"));
  const diag = path.join(root, "_DIAGNOSTICS");
  fs.mkdirSync(diag, { recursive: true });
  fs.mkdirSync(path.join(root, "secrets"), { recursive: true });
  fs.writeFileSync(path.join(root, "secrets", "token.txt"), "NUNCA_EXPOR");
  fs.writeFileSync(path.join(root, "secrets", "detect-github-auth.sh"), "#!/bin/sh\n");
  fs.writeFileSync(path.join(diag, "REPORT.txt"), "REPORT\n");
  fs.writeFileSync(path.join(diag, "archive.tar.gz"), "x");
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  fs.writeFileSync(path.join(diag, "FORENSIC-LATEST.json"), JSON.stringify({
    observed_at: now,
    mode: "READ_ONLY",
    report: path.join(diag, "REPORT.txt"),
    archive: path.join(diag, "archive.tar.gz"),
    sha256: "a".repeat(64),
    secrets_content_collected: false,
  }));
  const snap = getOperationalSnapshot({ root });
  assert.equal(snap.forensic.status, "OBSERVED");
  assert.equal(snap.secretBoundary.githubAuthDetectorPresent, true);
  assert.equal(JSON.stringify(snap).includes("NUNCA_EXPOR"), false);
});


test("monitor do padrão fica verde quando os eixos mensuráveis estão aderentes", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-pattern-green-"));
  const diag = path.join(root, "_DIAGNOSTICS");
  const soul = path.join(root, "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS");
  const contractDir = path.join(root, "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC");
  fs.mkdirSync(diag, { recursive: true });
  fs.mkdirSync(soul, { recursive: true });
  fs.mkdirSync(contractDir, { recursive: true });
  fs.writeFileSync(path.join(root, "AGENTS.md"), "RETURN_WITH_OPEN_ELIGIBLE_PR=FORBIDDEN\n");
  fs.writeFileSync(path.join(soul, "SOUL-SOL.md"), "SOUL\n");
  fs.writeFileSync(path.join(contractDir, "CONTRACT.yml"), [
    "remeasure_live_mergeability_before_human_return: true",
    "queued_or_in_progress_auxiliary_is_material_blocker: false",
  ].join("\n"));
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  fs.writeFileSync(path.join(diag, "FORENSIC-LATEST.json"), JSON.stringify({
    observed_at: now,
    mode: "READ_ONLY",
    secrets_content_collected: false,
  }));

  const snap = getOperationalSnapshot({ root });
  assert.equal(snap.patternAlignment.outsidePct, 0);
  assert.equal(snap.patternAlignment.alignmentPct, 100);
  assert.equal(snap.patternAlignment.marker, "GREEN");
  assert.equal(snap.patternAlignment.unknownCount, 0);
});

test("observações externas entram no mesmo marcador sem criar segundo monitor", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-pattern-external-"));
  const statusDir = path.join(root, "apps/modulos/status");
  fs.mkdirSync(statusDir, { recursive: true });
  fs.writeFileSync(path.join(statusDir, "centraldark-pattern-observation.json"), JSON.stringify({
    dimensions: [
      { id: "X1", label: "rota 1", state: "FAIL", source: "test" },
      { id: "X2", label: "rota 2", state: "FAIL", source: "test" },
      { id: "X3", label: "rota 3", state: "PASS", source: "test" },
    ],
  }));
  const snap = getOperationalSnapshot({ root });
  assert.equal(snap.patternAlignment.dimensions.some((item) => item.id === "X1"), true);
  assert.equal(snap.patternAlignment.externalObservationPath, "apps/modulos/status/centraldark-pattern-observation.json");
});


function writeFakeProc(procRoot, pid, command) {
  const dir = path.join(procRoot, String(pid));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "cmdline"), command.split(" ").join("\u0000") + "\u0000");
}

test("executionTopology prova tool-call recente e detecta multiplicidade do bot", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-exec-topology-"));
  const procRoot = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-proc-"));
  const logs = path.join(root, "logs");
  fs.mkdirSync(logs, { recursive: true });

  writeFakeProc(procRoot, 101, "node /root/CentralDark/apps/modulos/mcp/dist/index.js");
  writeFakeProc(procRoot, 201, "node /root/CentralDark/apps/bot-telegram/unified-bot.cjs");
  writeFakeProc(procRoot, 202, "node /root/CentralDark/apps/bot-telegram/unified-bot.cjs");
  writeFakeProc(procRoot, 301, "/usr/local/bin/hermes acp");
  writeFakeProc(procRoot, 302, "python -m cron.scheduler --external-worker-file worker.json");

  const nowMs = Date.parse("2026-09-25T03:20:00.000Z");
  fs.writeFileSync(path.join(logs, "mcp-audit-2026-09-25.jsonl"), JSON.stringify({
    timestamp: "2026-09-25T03:18:30.000Z",
    event: "mcp_tool_execution",
    method: "tools/call",
    toolName: "github_list_commits",
    ok: true,
  }) + "\n");

  const snap = getOperationalSnapshot({ root, procRoot, nowMs });
  assert.equal(snap.executionTopology.schema, "centraldark.execution-topology.v1");
  assert.equal(snap.executionTopology.aiRequired, false);
  assert.equal(snap.executionTopology.verdict, "EXECUTION_EVIDENCE_OBSERVED");
  assert.equal(snap.executionTopology.mcpActivity.state, "RECENT");
  assert.equal(snap.executionTopology.duplicateSignals.telegramBotProcesses, 2);
  assert.equal(snap.executionTopology.duplicateSignals.telegramBotMultiplicity, "WATCH_MULTIPLE");
  assert.equal(
    snap.executionTopology.lanes.find((lane) => lane.id === "HERMES_CRON")?.state,
    "RUNNING",
  );
});

test("executionTopology não confunde processo vivo com execução provada", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-exec-unknown-"));
  const procRoot = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-proc-"));
  writeFakeProc(procRoot, 101, "node /root/CentralDark/apps/modulos/mcp/dist/index.js");
  writeFakeProc(procRoot, 201, "node /root/CentralDark/apps/bot-telegram/unified-bot.cjs");

  const snap = getOperationalSnapshot({
    root,
    procRoot,
    nowMs: Date.parse("2026-09-25T03:20:00.000Z"),
  });

  assert.equal(snap.executionTopology.mcpActivity.state, "UNKNOWN");
  assert.equal(snap.executionTopology.verdict, "RUNTIME_PRESENT_EXECUTION_UNKNOWN");
  assert.equal(snap.executionTopology.rules.processPresentIsNotExecutionProof, true);
  assert.equal(snap.executionTopology.rules.uiLoopPausedIsNotGlobalExecutionPaused, true);
});

test("F1_GIT lê o recibo do auto-sync, nunca inventa PASS", async () => {
  const { gitSyncFront, AUTO_SYNC_STATUS_MAX_AGE_MS } = await import("../src/operational-telemetry.js");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-gitsync-"));
  assert.equal(gitSyncFront(root), "MEASURE_EXTERNALLY");
  fs.mkdirSync(path.join(root, "logs"), { recursive: true });
  const file = path.join(root, "logs", "auto-sync-status.json");
  const now = Date.parse("2026-10-08T10:00:00Z");
  fs.writeFileSync(file, JSON.stringify({ t: "2026-10-08T09:59:00Z", result: "PASS", head: "aaf9d255d95c18cd" }));
  assert.equal(gitSyncFront(root, now), "SYNC_PASS@aaf9d255d");
  fs.writeFileSync(file, JSON.stringify({ t: "2026-10-08T09:59:00Z", result: "BLOCKED", reason: "dirty checkout" }));
  assert.equal(gitSyncFront(root, now), "BLOCKED:dirty checkout");
  fs.writeFileSync(file, JSON.stringify({ t: new Date(now - AUTO_SYNC_STATUS_MAX_AGE_MS - 1).toISOString(), result: "PASS", head: "x" }));
  assert.equal(gitSyncFront(root, now), "STALE");
  fs.writeFileSync(file, "{quebrado");
  assert.equal(gitSyncFront(root, now), "MEASURE_EXTERNALLY");
  const snap = getOperationalSnapshot({ root, heartbeat: { self: "alive" } });
  assert.equal(snap.fronts[0].id, "F1_GIT");
  assert.ok(snap.statusFiles["logs/auto-sync-status.json"]);
});

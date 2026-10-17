#!/usr/bin/env node
// Recebe somente metadados do VS Code; nunca recebe texto bruto de conversas.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { appendCentralEvent, getCentralLogLayout } from "../../apps/modulos/mcp/src/log-funnel.js";

const source = "LOGS-VS-CODE.log";
const cursorPath = path.join(getCentralLogLayout().root, "agent-patterns", "vscode-casa-cursor.json");
function fail(reason) { process.stderr.write("vscode_ingest: " + reason + "\n"); process.exit(2); }
function saveCursor(value) {
  const dir = path.dirname(cursorPath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const tmp = cursorPath + "." + process.pid + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(value) + "\n", { mode: 0o600 });
  fs.renameSync(tmp, cursorPath);
  try { fs.chmodSync(cursorPath, 0o600); } catch {}
}
function cursor() {
  try { return JSON.parse(fs.readFileSync(cursorPath, "utf8")); }
  catch { return { epoch: null, offset: 0 }; }
}
const validOffset = (v) => Number.isSafeInteger(v) && v >= 0;
const raw = fs.readFileSync(0, "utf8");
if (Buffer.byteLength(raw) > 512 * 1024) fail("payload_too_large");
let batch;
try { batch = JSON.parse(raw); } catch { fail("invalid_json"); }
if (batch?.source !== source || !Array.isArray(batch.signals) ||
    batch.signals.length > 1500 || typeof batch.epoch !== "string" ||
    !/^[A-Za-z0-9:._+-]{6,96}$/.test(batch.epoch) ||
    !["tailscale", "ssh-direct"].includes(batch.route) ||
    !validOffset(batch.from_offset) || !validOffset(batch.to_offset)) fail("invalid_envelope");

const playwrightProbe = batch.playwright;
const cacheStates = new Set(["UNKNOWN", "ABSENT", "FILES_PRESENT", "INCOMPLETE"]);
const runtimeStates = new Set(["UNPROVEN", "UNKNOWN", "NOT_RUNNING", "PROCESS_OBSERVED"]);
if (playwrightProbe != null && (
  typeof playwrightProbe !== "object" || Array.isArray(playwrightProbe) ||
  !cacheStates.has(playwrightProbe.cache_state) ||
  !runtimeStates.has(playwrightProbe.runtime_state) ||
  !(playwrightProbe.revision == null || /^[0-9]{1,6}$/.test(String(playwrightProbe.revision))) ||
  !Number.isInteger(playwrightProbe.process_count) ||
  playwrightProbe.process_count < 0 || playwrightProbe.process_count > 100 ||
  (playwrightProbe.runtime_state === "PROCESS_OBSERVED" &&
    (playwrightProbe.process_count === 0 || playwrightProbe.cache_state !== "FILES_PRESENT")) ||
  (playwrightProbe.cache_state === "FILES_PRESENT" && playwrightProbe.revision == null)
)) fail("invalid_playwright_probe");
const allowedComponents = new Set(["vscode", "git", "copilot", "extension-host", "terminal", "mcp", "remote-ssh"]);
const allowedLevels = new Set(["debug", "info", "warn", "error"]);
let state = cursor();
if (state.epoch !== batch.epoch) state = { epoch: batch.epoch, offset: 0 };
let accepted = 0, duplicate = 0;
let last = Number(state.offset) || 0;
for (const item of batch.signals) {
  const end = item?.end_offset;
  if (!validOffset(end) || end > batch.to_offset ||
      typeof item.hash !== "string" || !/^[a-f0-9]{64}$/.test(item.hash) ||
      !allowedLevels.has(item.level) || !allowedComponents.has(item.component)) fail("invalid_signal");
  if (end <= last) { duplicate++; continue; }
  const eventId = createHash("sha256").update(batch.epoch + ":" + end).digest("hex");
  const result = appendCentralEvent({
    event_id: eventId, sector: "vscode", service: "vscode", source, actor: "casa",
    kind: "vscode_log_signal", level: item.level, key: "vscode:" + item.component,
    tags: ["vscode", "casa", item.component, item.level],
    message: item.component + " " + item.level + " (texto bruto mantido na Casa)",
    data: { line_sha256: item.hash, end_offset: end, epoch: batch.epoch },
  });
  if (!result.ok) fail("funnel_append_failed");
  last = end;
  saveCursor({ epoch: batch.epoch, offset: last });
  accepted++;
}
const linkState = batch.route === "tailscale" ? "OK" : "ATTENTION";
const status = appendCentralEvent({
  sector: "vscode", service: "vscode", source, actor: "casa",
  kind: "vscode_bridge_status", level: linkState === "OK" ? "info" : "warn",
  key: "vscode:bridge", tags: ["vscode", "bridge", batch.route, "heartbeat"],
  message: linkState === "OK" ? "Casa conectada via Tailscale SSH" : "SSH direto assumiu a rota",
  data: {
    state: linkState, route: batch.route, accepted, duplicate,
    source_epoch: batch.epoch, source_last_write_utc: typeof batch.source_last_write_utc === "string" ? batch.source_last_write_utc.slice(0, 40) : null,
    offset: last,
    playwright: playwrightProbe == null ? null : {
      cache_state: playwrightProbe.cache_state,
      revision: playwrightProbe.revision == null ? null : String(playwrightProbe.revision),
      runtime_state: playwrightProbe.runtime_state,
      process_count: playwrightProbe.process_count,
      automation_roundtrip: "UNPROVEN",
    },
  },
});
if (!status.ok) fail("status_append_failed");
process.stdout.write(JSON.stringify({ ok: true, source, route: batch.route, state: linkState, accepted, duplicate, offset: last }) + "\n");

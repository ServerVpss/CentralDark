#!/usr/bin/env node
// Contraprova local autenticada, SEM imprimir/transportar segredo ou mensagens.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";

const unit = "centraldark-native-mcp-http.service";
const base = "http://127.0.0.1:9100/admin/api/logs/LOGS-VS-CODE.log";
const result = { source: "LOGS-VS-CODE.log", credential_exposed: false, raw_log_exposed: false };
function emit(ok, fields, code = 0) {
  process.stdout.write(JSON.stringify({ ...result, ok, ...fields }) + "\n");
  process.exitCode = code;
}
try {
  const pid = execFileSync("systemctl", ["show", "-p", "MainPID", "--value", unit],
    { encoding: "utf8", timeout: 5000 }).trim();
  if (!/^[1-9][0-9]*$/.test(pid)) throw Error("MCP_PID_MISSING");
  const env = new Map(fs.readFileSync("/proc/" + pid + "/environ", "utf8")
    .split("\u0000").filter(Boolean).map((entry) => {
      const split = entry.indexOf("=");
      return [entry.slice(0, split), entry.slice(split + 1)];
    }));
  const secret = env.get("MCP_ADMIN_COOKIE_SECRET") || env.get("MCP_SESSION_SECRET");
  if (!secret) throw Error("ADMIN_SESSION_SECRET_UNAVAILABLE_IN_RUNTIME");
  const body = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + 120000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  const cookie = "cd_admin=" + body + "." + signature;

  const response = await fetch(base + "?limit=10&since_minutes=120", {
    headers: { Cookie: cookie },
    signal: AbortSignal.timeout(7000),
  });
  if (response.status !== 200) {
    emit(false, { code: response.status, state: "AUTH_READ_NOT_PROVEN" }, 2);
  } else {
    const data = await response.json();
    const filtered = await fetch(base + "?limit=10&since_minutes=120&level=warn&component=copilot", {
      headers: { Cookie: cookie }, signal: AbortSignal.timeout(7000),
    });
    const filterData = filtered.status === 200 ? await filtered.json() : null;
    const privacyOk = data.raw_log_exposed === false &&
      data.events?.every((e) => e.source === "LOGS-VS-CODE.log" && e.kind === "vscode_log_signal");
    const filtersOk = filtered.status === 200 &&
      filterData?.events?.every((e) => e.level === "warn" && e.key === "vscode:copilot");
    const ok = Boolean(privacyOk && filtersOk && data.last_received_at && data.route);
    emit(ok, {
      code: response.status,
      state: data.state,
      color: data.color,
      route: data.route,
      last_received_at: data.last_received_at,
      event_count: data.total,
      component_filter_code: filtered.status,
      component_filter_count: filterData?.total ?? null,
      privacy_ok: privacyOk,
      filters_ok: filtersOk,
    }, ok ? 0 : 3);
  }
} catch (e) {
  emit(false, { state: "BLOCKED", reason: String(e.message).slice(0, 120) }, 4);
}

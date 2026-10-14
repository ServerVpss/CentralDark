#!/usr/bin/env node
// Delta mínimo no MCP compilado EXISTENTE. Sem checkout/reset/pull e sem transportar skill.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const root = "/root/CentralDark_MCP_RUNTIME/apps/modulos/mcp/dist";
const adminPath = path.join(root, "admin.js");
const indexPath = path.join(root, "index.js");
const routePath = path.join(root, "vscode-log-route.js");
const candidatePath = routePath + ".incoming";
const unit = "centraldark-native-mcp-http.service";
const targetUrl = "http://127.0.0.1:9100/admin/api/logs/LOGS-VS-CODE.log";
const healthUrl = "http://127.0.0.1:9100/health";
const checkOnly = process.argv.includes("--check");
const apply = process.argv.includes("--apply");
if (!checkOnly && !apply) {
  process.stderr.write("Use --check ou --apply\n");
  process.exit(2);
}
const hash = (value) => createHash("sha256").update(value).digest("hex");
function print(data) { process.stdout.write(JSON.stringify(data) + "\n"); }
function fail(reason) { print({ ok: false, state: "BLOCKED", reason }); process.exit(2); }
function uniqueReplace(text, oldText, newText, label) {
  if (text.split(oldText).length !== 2) fail("marker_mismatch:" + label);
  return text.replace(oldText, newText);
}
function call(program, args, timeout = 20000) {
  return execFileSync(program, args, { timeout, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function httpCode(url) {
  try { return call("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "3", url], 5000); }
  catch { return "000"; }
}
if (httpCode(healthUrl) !== "200") fail("baseline_health_not_200");
const adminOld = fs.readFileSync(adminPath, "utf8");
const indexOld = fs.readFileSync(indexPath, "utf8");
let routeCandidate;
try { routeCandidate = fs.readFileSync(candidatePath, "utf8"); } catch { fail("missing_route_candidate"); }
const adminNeedle = "function isAdmin(req) {";
const importNeedle = 'import { getLinearPublicStatus } from "./tools/integrations.js";';
const mountNeedle = 'app.get("/admin/api/logs", adminBuscarLogs);';
if (fs.existsSync(routePath) || adminOld.includes("export function isAdmin(req)") ||
    indexOld.includes("adminVsCodeLog")) fail("already_present_or_diverged");
const adminNew = uniqueReplace(adminOld, adminNeedle, "export " + adminNeedle, "admin_gate");
let indexNew = uniqueReplace(indexOld, importNeedle,
  importNeedle + '\nimport { adminVsCodeLog } from "./vscode-log-route.js";', "route_import");
indexNew = uniqueReplace(indexNew, mountNeedle,
  mountNeedle + '\napp.get("/admin/api/logs/LOGS-VS-CODE.log", adminVsCodeLog);', "route_mount");
const backup = "/root/centraldark-backups/vscode-log-route-20261014";
fs.mkdirSync(backup, { recursive: true, mode: 0o700 });
const stage = [
  [adminPath, adminNew, "admin.js"],
  [indexPath, indexNew, "index.js"],
  [routePath, routeCandidate, "vscode-log-route.js"],
];
for (const [destination, body, name] of stage) {
  const staged = path.join(backup, name + ".candidate");
  fs.writeFileSync(staged, body, { mode: 0o600 });
  try { call("node", ["--check", staged]); }
  catch { fail("syntax:" + name); }
}
if (checkOnly) {
  print({ ok: true, state: "READY", scope: "MCP_DIST_MINIMAL_PATCH",
    files: stage.map(([dest, body]) => ({ dest: path.basename(dest), sha256: hash(body).slice(0, 16) })),
    old_health: "200", old_route: httpCode(targetUrl), backup });
  process.exit(0);
}
fs.copyFileSync(adminPath, path.join(backup, "admin.js.before"));
fs.copyFileSync(indexPath, path.join(backup, "index.js.before"));
fs.chmodSync(path.join(backup, "admin.js.before"), 0o600);
fs.chmodSync(path.join(backup, "index.js.before"), 0o600);
let changed = false;
try {
  for (const [destination, body] of stage) {
    const tmp = destination + ".vscode-new";
    fs.writeFileSync(tmp, body, { mode: 0o644 });
    fs.renameSync(tmp, destination);
    changed = true;
  }
  call("systemctl", ["restart", unit], 30000);
  let health = "000", route = "000";
  for (let attempt = 0; attempt < 12; attempt++) {
    health = httpCode(healthUrl);
    route = httpCode(targetUrl);
    if (health === "200" && route === "401") break;
    call("sleep", ["1"], 2000);
  }
  if (health !== "200" || route !== "401") throw Error("post_deploy_health_or_auth");
  print({ ok: true, state: "ROUTE_GUARDED", health_code: health, unauthenticated_code: route,
    route: "/admin/api/logs/LOGS-VS-CODE.log", backup,
    authorized_data_read: "NOT_YET_MEASURED", compiled_runtime_changed: true });
} catch (error) {
  if (changed) {
    fs.copyFileSync(path.join(backup, "admin.js.before"), adminPath);
    fs.copyFileSync(path.join(backup, "index.js.before"), indexPath);
    if (fs.existsSync(routePath)) fs.unlinkSync(routePath);
    try { call("systemctl", ["restart", unit], 30000); } catch {}
  }
  print({ ok: false, state: "ROLLED_BACK", reason: String(error.message).slice(0, 160),
    health_after_rollback: httpCode(healthUrl), backup });
  process.exit(3);
}

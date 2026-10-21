// Regression guard for the existing dispatcher and diagnostic owners.
// SOURCE_CONTRACT_TEST != RUNTIME_PROOF. Keeps scope and safety-review semantics explicit.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const admin = readFileSync(new URL("../src/tools/core/mcp-admin.js", import.meta.url), "utf8");
const diag = readFileSync(new URL("../src/tools/core/mcp-diagnostics.js", import.meta.url), "utf8");
test("18 canonical routes include all four canary bindings", () => {
  const routes = admin.match(/const AUTHORIZED_ROUTE_CATALOG = Object.freeze\(\[([\s\S]*?)\]\);/)?.[1] ?? "";
  assert.equal([...routes.matchAll(/\bid: "/g)].length, 18, "unexpected route cardinality");
  for (const id of ["CASA_NATIVE_PID_INVENTORY", "ZENDRIVE_VSCODE_REMOTE_SSH", "FIGMA_MCP_ACCOUNT", "FIGMA_CENTRALDARK_FIGJAM", "RDC_VPS_CENTRALDARK_OS"]) {
    assert.ok(routes.includes('id: "' + id + '"'), id);
    assert.ok(diag.includes('"' + id + '"'), "diagnostic missing " + id);
  }
});
test("validator uses same dispatcher registry and read-only catalog handler", () => {
  assert.match(diag, /getDispatcherRuntimeTools\(\)/);
  assert.match(admin, /export const mcpAdminTools = \[/);
  assert.match(diag, /mod\.mcpAdminTools/);
  assert.match(diag, /adminTools\.find\(\(tool\) => tool\.name === "mcp_admin_catalog"\)/);
  assert.match(diag, /catalogTool\.handler\(\{\}\)/);
  assert.match(diag, /routeParity/);
  assert.match(diag, /expectedRouteCount: 18/);
  assert.match(diag, /publicRestrictedByPolicy/);
  assert.match(diag, /publicMissingSafe/);
  assert.match(diag, /missingCanaryRoutes/);
  assert.match(diag, /RUNTIME_SUBSET_OF_PUBLIC_NOT_EQUAL_SCOPE/);
});
test("legacy cleanup tools are NOT silently re-enabled", () => {
  const required = diag.match(/const EXPECTED_SAFE_FULL_ADMIN = \[([\s\S]*?)\];/)?.[1] ?? "";
  assert.ok(required.length > 0);
  for (const tool of ["vps_limpar_pasta_projeto", "vps_listar_pastas_limpaveis"]) {
    assert.ok(!required.includes(tool), "legacy tool required without safety approval");
    assert.ok(diag.includes('"' + tool + '"'), "missing explicit safety review");
  }
});

test("PM2 diagnostic preserves execution failure before JSON parsing", () => {
  const deploy = readFileSync(new URL("../src/tools/deploy/deploy.js", import.meta.url), "utf8");
  assert.match(deploy, /set -o pipefail; command -v pm2/);
  assert.match(deploy, /res\.exitCode === 127/);
  assert.match(deploy, /PM2_NOT_IN_RUNTIME_PATH/);
  assert.match(deploy, /PM2_PROBE_EMPTY_OUTPUT/);
  assert.match(deploy, /PM2_SUMMARY_NOT_ARRAY/);
});

test("Casa inventaria SSH + Hermes/VSCODE com JSON mas nao executa tarefas por PID", () => {
  const probe = readFileSync(new URL("../../../../scripts/casa/discover-operational-channels.ps1", import.meta.url), "utf8");
  assert.match(probe, /\[switch\]\$IncludeRuntime/);
  assert.match(probe, /centraldark\.casa-process-inventory\.v1/);
  assert.match(probe, /Get-CimInstance Win32_Process/);
  assert.match(probe, /Get-LocalServiceState 'sshd'/);
  assert.match(probe, /PID_IS_NOT_A_REMOTE_DISPATCH_ADDRESS/);
  assert.match(probe, /ConvertTo-Json -Depth 8/);
  assert.doesNotMatch(probe, /Start-Process|Invoke-Command|Start-Service|Remove-Item/);
  assert.match(admin, /id: "CASA_NATIVE_PID_INVENTORY"/);
  assert.match(admin, /runtimeState: "SOURCE_ONLY_CASA_ACK_REQUIRED"/);
});

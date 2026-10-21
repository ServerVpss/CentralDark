// Regression guard for the existing dispatcher and diagnostic owners.
// SOURCE_CONTRACT_TEST != RUNTIME_PROOF. Keeps scope and safety-review semantics explicit.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const admin = readFileSync(new URL("../src/tools/core/mcp-admin.js", import.meta.url), "utf8");
const diag = readFileSync(new URL("../src/tools/core/mcp-diagnostics.js", import.meta.url), "utf8");
test("17 canonical routes include all four canary bindings", () => {
  const routes = admin.match(/const AUTHORIZED_ROUTE_CATALOG = Object.freeze\(\[([\s\S]*?)\]\);/)?.[1] ?? "";
  assert.equal([...routes.matchAll(/\bid: "/g)].length, 17, "unexpected route cardinality");
  for (const id of ["ZENDRIVE_VSCODE_REMOTE_SSH", "FIGMA_MCP_ACCOUNT", "FIGMA_CENTRALDARK_FIGJAM", "RDC_VPS_CENTRALDARK_OS"]) {
    assert.ok(routes.includes('id: "' + id + '"'), id);
    assert.ok(diag.includes('"' + id + '"'), "diagnostic missing " + id);
  }
});
test("validator uses same dispatcher registry and read-only catalog handler", () => {
  assert.match(diag, /getDispatcherRuntimeTools\(\)/);
  assert.match(diag, /catalogTool\.handler\(\{\}\)/);
  assert.match(diag, /routeParity/);
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

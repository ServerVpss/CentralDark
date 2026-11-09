// #OBSERVACOES# @owner=apps/modulos/mcp/tests/mcp-admin-confirmation-flow.test.mjs @doc_ref=apps/modulos/mcp/docs/ARQUITETURA.md @last_updated=2026-10-24T07:49:48.830Z @estado=BRANCH_IMPLEMENTADO @pendente=CI_E_READBACK @next_cursor=PR_CI_READBACK
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const admin = read("../src/tools/core/mcp-admin.js");
const mcpServer = read("../src/mcp-server.js");
const vpsLazy = read("../src/tools/vps/vps-lazy.js");
const envelope = read("../src/tool-result-envelope.js");
const audit = read("../src/audit-logger.js");

test("outer dispatcher is not blanket-marked destructive; internal gate remains", () => {
  assert.match(admin, /name: "mcp_admin_call"[\s\S]{0,600}?annotations: \{ readOnlyHint: false, destructiveHint: false,/);
  assert.match(admin, /const destructive = declaredDestructive && !readOnlyOperation/);
  assert.match(admin, /if \(destructive && ctx\?\.autoMission === true\)/);
  assert.match(admin, /guardDestructive\(/);
});

test("execute_command stays destructive outside the exact dispatcher allowlist", () => {
  assert.match(vpsLazy, /name: "execute_command"[\s\S]{0,400}?annotations: \{ readOnlyHint: false, destructiveHint: true,/);
  assert.match(admin, /isSafeReadOnlyExecuteCommand\(parsed\.data\?\.command\)/);
  assert.match(mcpServer, /targetTool === "execute_command" && isSafeReadOnlyExecuteCommand\(targetInput\?\.command\)/);
});

test("server accepts only the two trusted admin provenance labels", () => {
  assert.match(mcpServer, /options\.authProvenance === "verified_oauth_admin"[\s\S]{0,120}?options\.authProvenance === "verified_hub_admin"/);
  assert.match(mcpServer, /: null,/);
});

test("application guard blocks affect the canonical envelope and audit status", () => {
  assert.match(envelope, /state: blocked \? "BLOCKED" : failed \? "ERROR" : "SUCCESS"/);
  assert.match(envelope, /error_state: blocked \? "BLOCKED"/);
  assert.match(mcpServer, /state === "BLOCKED" \? "BLOCKED" : null/);
  assert.match(audit, /!ok && source\.status === "BLOCKED" \? "BLOCKED" : ok \? "PASS" : "FAIL"/);
});

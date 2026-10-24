// Executa mcp-readonly-dispatch.run.mjs em subprocesso: o guard fixa MCP_AUDIT_DIR no import,
// entao o isolamento de auditoria nao pode vazar para os demais testes do agregador.
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("dispatcher read-only, procedencia e auditoria semantica (subprocesso isolado)", () => {
  const file = fileURLToPath(new URL("./mcp-readonly-dispatch.run.mjs", import.meta.url));
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ["--test", file], { encoding: "utf8", timeout: 120000, env });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`.slice(-3000));
  assert.match(r.stdout, /# fail 0/);
  assert.match(r.stdout, /# pass 9/);
});

import assert from "node:assert/strict";
import test from "node:test";

import { __test, extractBearer } from "../src/provider-admin-bridge.js";

test("bridge aceita somente bearer e nao inventa token", () => {
  assert.equal(extractBearer("Bearer abc.def.ghi"), "abc.def.ghi");
  assert.equal(extractBearer("bearer token"), "token");
  assert.equal(extractBearer("Basic abc"), null);
  assert.equal(extractBearer(""), null);
});

test("allowlist da ponte nao abre dispatcher admin inteiro", () => {
  assert.deepEqual([...__test.PROVIDER_TOOLS].sort(), [
    "provider_capabilities",
    "provider_credentials_status",
    "provider_mutate",
    "provider_read",
  ]);
  assert.equal(__test.PROVIDER_TOOLS.has("execute_command"), false);
  assert.equal(__test.PROVIDER_TOOLS.has("admin_shell_exec"), false);
  assert.equal(__test.PROVIDER_TOOLS.has("vps_run_once_script"), false);
});

test("resultado do dispatcher precisa continuar estruturado", () => {
  const structured = __test.unwrapDispatcherResult({
    content: [{ type: "text", text: JSON.stringify({ ok: true, status: "PASS" }) }],
  });
  assert.deepEqual(structured, { ok: true, status: "PASS" });

  const invalid = __test.unwrapDispatcherResult({ content: [{ type: "text", text: "texto solto" }] });
  assert.equal(invalid.ok, false);
  assert.equal(invalid.status, "PROVIDER_DISPATCH_RESULT_UNSTRUCTURED");
});

test("bridge limita corpo antes do dispatcher", () => {
  assert.equal(__test.MAX_BODY_BYTES, 25_000);
});

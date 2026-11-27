import assert from "node:assert/strict";
import test from "node:test";

import {
  PROVIDER_CAPABILITY_MATRIX,
  adminProviderControlTools,
} from "../src/modes/admin/tools/admin-provider-control.js";

function capability(provider, name) {
  return PROVIDER_CAPABILITY_MATRIX.find((item) => item.provider === provider && item.capability === name);
}

const providerRead = adminProviderControlTools.find((tool) => tool.name === "provider_read");

test("leitura financeira suportada e READY_READ_ONLY, sem herdar quarentena de escrita", () => {
  const item = capability("cloudflare", "subscriptions.list");
  assert.equal(item.status, "FINANCIAL_READ_SUPPORTED");
  assert.equal(item.financial, true);
  assert.equal(item.controlPlaneStatus, "READY_READ_ONLY");
});

test("endpoint oficial que pode devolver secret fica bloqueado antes da rede", async () => {
  const item = capability("contabo", "secrets.list");
  assert.equal(item.status, "READ_SUPPORTED");
  assert.equal(item.secretBearing, true);
  assert.equal(item.controlPlaneStatus, "BLOCKED_SECRET_BEARING_RESPONSE");

  const result = await providerRead.handler({
    provider: "contabo",
    capability: "secrets.list",
    params: {},
  });
  const payload = JSON.parse(result.content[0].text);
  assert.equal(payload.ok, false);
  assert.equal(payload.status, "BLOCKED_SECRET_BEARING_RESPONSE");
  assert.equal(payload.provider, "contabo");
  assert.equal(payload.capability, "secrets.list");
});

test("auditoria de secrets permanece leitura permitida sem expor valor", () => {
  const item = capability("contabo", "secrets.audits");
  assert.equal(item.status, "READ_SUPPORTED");
  assert.equal(item.secretBearing, false);
  assert.equal(item.controlPlaneStatus, "READY_READ_ONLY");
});

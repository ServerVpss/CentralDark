import assert from "node:assert/strict";
import test from "node:test";

import {
  PROVIDER_CAPABILITY_MATRIX,
  __test,
  adminProviderControlTools,
  buildProviderRequest,
  deepRedact,
  providerCredentialStatus,
  validateFinancialGuard,
} from "../src/modes/admin/tools/admin-provider-control.js";

const mutationTool = adminProviderControlTools.find((tool) => tool.name === "provider_mutate");
const readTool = adminProviderControlTools.find((tool) => tool.name === "provider_read");
const matrixTool = adminProviderControlTools.find((tool) => tool.name === "provider_capabilities");

function matrix(provider, capability) {
  return PROVIDER_CAPABILITY_MATRIX.find((item) => item.provider === provider && item.capability === capability);
}

test("matriz tem chave provider+capability unica e proveniencia oficial", () => {
  const keys = PROVIDER_CAPABILITY_MATRIX.map((item) => `${item.provider}:${item.capability}`);
  assert.equal(new Set(keys).size, keys.length);
  for (const item of PROVIDER_CAPABILITY_MATRIX) {
    assert.ok(["cloudflare", "contabo"].includes(item.provider));
    assert.match(item.lastVerifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(typeof item.evidenceRef === "string" && item.evidenceRef.startsWith("https://"));
  }
});

test("pagamento nao documentado nunca ganha endpoint inventado", () => {
  for (const item of [
    matrix("cloudflare", "billing.pay_invoice"),
    matrix("contabo", "billing.invoice"),
    matrix("contabo", "billing.payment"),
  ]) {
    assert.equal(item.status, "UNSUPPORTED_BY_PUBLIC_API");
    assert.equal(item.path, null);
    assert.equal(item.method, null);
    assert.equal(item.controlPlaneStatus, "NOT_AVAILABLE");
  }
  assert.throws(
    () => buildProviderRequest("contabo", "billing.payment", {}),
    /UNSUPPORTED_BY_PUBLIC_API/,
  );
});

test("mutacoes conhecidas ficam quarentenadas por padrao", () => {
  const writes = PROVIDER_CAPABILITY_MATRIX.filter((item) => [
    "WRITE_SUPPORTED", "DESTRUCTIVE_SUPPORTED", "FINANCIAL_WRITE_SUPPORTED",
  ].includes(item.status));
  assert.ok(writes.length > 0);
  assert.ok(writes.every((item) => item.controlPlaneStatus === "QUARANTINED_UNTIL_RUNTIME_COMPENSATION_PROVEN"));
  assert.equal(mutationTool.annotations.destructiveHint, true);
  assert.equal(readTool.annotations.destructiveHint, false);
  assert.equal(matrixTool.annotations.destructiveHint, false);
});

test("status de credencial nunca devolve valor", () => {
  const env = {
    CLOUDFLARE_API_TOKEN: "valor-que-nao-pode-sair",
    CONTABO_CLIENT_ID: "client-id-secreto",
    CONTABO_CLIENT_SECRET: "client-secret-secreto",
    CONTABO_API_USER: "usuario",
    CONTABO_API_PASSWORD: "senha-muito-secreta",
  };
  const status = providerCredentialStatus(env);
  assert.deepEqual(status, {
    cloudflare: { CLOUDFLARE_API_TOKEN: "CONFIGURED" },
    contabo: {
      CONTABO_CLIENT_ID: "CONFIGURED",
      CONTABO_CLIENT_SECRET: "CONFIGURED",
      CONTABO_API_USER: "CONFIGURED",
      CONTABO_API_PASSWORD: "CONFIGURED",
    },
  });
  const serialized = JSON.stringify(status);
  for (const value of Object.values(env)) assert.equal(serialized.includes(value), false);
});

test("redaction remove token senha e material de pagamento", () => {
  const redacted = deepRedact({
    token: "abcdef",
    nested: {
      password: "senha",
      card_number: "4111111111111111",
      payment_nonce: "nonce",
      authorization: "Bearer abcdefghijklmnopqrstuv",
      safe: "visivel",
    },
  });
  assert.equal(redacted.token, "[REDACTED]");
  assert.equal(redacted.nested.password, "[REDACTED]");
  assert.equal(redacted.nested.card_number, "[REDACTED]");
  assert.equal(redacted.nested.payment_nonce, "[REDACTED]");
  assert.equal(redacted.nested.authorization, "[REDACTED]");
  assert.equal(redacted.nested.safe, "visivel");
});

test("request builder aceita somente endpoint e parametros allowlisted", () => {
  const dns = buildProviderRequest("cloudflare", "dns.list", {
    zone_id: "0123456789abcdef0123456789abcdef",
    query: { type: "A", per_page: 50 },
  });
  assert.equal(dns.method, "GET");
  assert.equal(dns.path, "/zones/0123456789abcdef0123456789abcdef/dns_records?type=A&per_page=50");

  const instance = buildProviderRequest("contabo", "instances.get", { instance_id: "12345" });
  assert.equal(instance.path, "/v1/compute/instances/12345");

  assert.throws(() => buildProviderRequest("cloudflare", "dns.list", {}), /PROVIDER_PATH_PARAM_REQUIRED:zone_id/);
  assert.throws(() => buildProviderRequest("cloudflare", "rulesets.list", { scope: "evil", scope_id: "x" }), /PROVIDER_SCOPE_INVALID/);
  assert.throws(() => buildProviderRequest("cloudflare", "dns.list", {
    zone_id: "abc",
    query: { endpoint: "https://evil.invalid" },
  }), /PROVIDER_QUERY_PARAM_NOT_ALLOWED:endpoint/);
  assert.throws(() => buildProviderRequest("cloudflare", "dns.create", {
    zone_id: "abc",
    body: { api_key: "nao-pode" },
  }), /PROVIDER_INPUT_CONTAINS_SENSITIVE_MATERIAL/);
});

test("financeiro exige valor e moeda antes da mutacao", () => {
  const item = matrix("cloudflare", "subscriptions.create");
  assert.deepEqual(validateFinancialGuard(item, {}), { ok: false, status: "FINANCIAL_AMOUNT_REQUIRED" });
  assert.deepEqual(validateFinancialGuard(item, { expectedAmount: 20 }), { ok: false, status: "FINANCIAL_CURRENCY_REQUIRED" });
  assert.deepEqual(validateFinancialGuard(item, { expectedAmount: 20, currency: "usd" }), { ok: true, amount: 20, currency: "USD" });
});

test("mutacao para antes da rede enquanto runtime/compensacao nao foram provados", async () => {
  const oldFlag = process.env.PROVIDER_MUTATION_RUNTIME_ENABLED;
  process.env.PROVIDER_MUTATION_RUNTIME_ENABLED = "true";
  try {
    const result = await mutationTool.handler({
      provider: "cloudflare",
      capability: "dns.create",
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
      params: {
        zone_id: "0123456789abcdef0123456789abcdef",
        body: { type: "A", name: "example.test", content: "192.0.2.10", ttl: 60 },
      },
    }, { callerUser: "test-admin" });
    const payload = JSON.parse(result.content[0].text);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "PROVIDER_MUTATION_RUNTIME_UNPROVEN");
    assert.equal(payload.executionStatus, "blocked");
  } finally {
    if (oldFlag === undefined) delete process.env.PROVIDER_MUTATION_RUNTIME_ENABLED;
    else process.env.PROVIDER_MUTATION_RUNTIME_ENABLED = oldFlag;
  }
});

test("fingerprints nao carregam ator bruto", () => {
  const actor = "admin@example.test";
  const fingerprint = __test.actorFingerprint(actor);
  assert.equal(fingerprint.includes(actor), false);
  assert.match(fingerprint, /^[0-9a-f]{24}$/);
});

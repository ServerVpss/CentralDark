import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { __test as distTest, tailscaleTools as distTailscaleTools } from "../dist/modes/admin/tools/admin-provider-control.js";

import {
  PROVIDER_CAPABILITY_MATRIX,
  __test,
  adminProviderControlTools,
  buildProviderRequest,
  deepRedact,
  providerCredentialStatus,
  tailscaleTools,
  validateFinancialGuard,
} from "../src/modes/admin/tools/admin-provider-control.js";
import { CLOUDFLARE_OPENAPI_META, CLOUDFLARE_OPENAPI_OPERATIONS } from "../src/modes/admin/tools/cloudflare-openapi-catalog.js";

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
    assert.ok(["cloudflare", "contabo", "tailscale", "buildkite"].includes(item.provider));
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
    CLOUDFLARE_API_TOKEN: "cf",
    CONTABO_CLIENT_ID: "cid",
    CONTABO_CLIENT_SECRET: "csec",
    CONTABO_API_USER: "usr",
    CONTABO_API_PASSWORD: "pwd",
    TAILSCALE_API_KEY: "configured-not-a-secret",
    BUILDKITE_API_TOKEN: "configured-not-a-secret",
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
    tailscale: { TAILSCALE_API_KEY: "CONFIGURED" },
    buildkite: { BUILDKITE_API_TOKEN: "CONFIGURED" },
  });
  const serialized = JSON.stringify(status);
  for (const value of Object.values(env)) assert.equal(serialized.includes(value), false);
});

test("buildkite pipelines.list monta path oficial", () => {
  const req = buildProviderRequest("buildkite", "pipelines.list", { org: "segredoidev" });
  assert.equal(req.method, "GET");
  assert.equal(req.path, "/organizations/segredoidev/pipelines");
});

test("tailscale devices.list monta path oficial", () => {
  const req = buildProviderRequest("tailscale", "devices.list", { tailnet: "-" });
  assert.equal(req.method, "GET");
  assert.equal(req.path, "/tailnet/-/devices");
});

test("tailscale network.logs monta endpoint oficial e exige janela allowlisted", () => {
  const req = buildProviderRequest("tailscale", "network.logs", {
    tailnet: "-",
    query: { start: "2026-09-25T08:00:00.000Z", end: "2026-09-25T08:15:00.000Z" },
  });
  assert.equal(req.method, "GET");
  assert.equal(req.path, "/tailnet/-/logging/network?start=2026-09-25T08%3A00%3A00.000Z&end=2026-09-25T08%3A15%3A00.000Z");
  assert.equal(matrix("tailscale", "network.logs").permission, "logs:network:read");
});

test("redaction remove token senha e material de pagamento", () => {
  const redacted = deepRedact({
    token: "abc",
    nested: {
      password: "pwd",
      card_number: "4111",
      payment_nonce: "nonce",
      authorization: "Bearer short",
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
    body: { api_key: "x" },
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


test("tools dedicadas Tailscale reutilizam provider-control e ficam read-only", () => {
  assert.deepEqual(
    tailscaleTools.map((tool) => tool.name),
    ["tailscale_status", "tailscale_bridge_status", "tailscale_devices_list", "tailscale_dns_nameservers", "tailscale_network_logs"],
  );
  assert.ok(tailscaleTools.every((tool) => tool.annotations.readOnlyHint === true));
  assert.ok(tailscaleTools.every((tool) => tool.annotations.destructiveHint === false));
  assert.equal(new Set(tailscaleTools.map((tool) => tool.name)).size, tailscaleTools.length);
});


test("Cloudflare OpenAPI snapshot inventory covers all observed HTTP operations without execution authority", () => {
  assert.equal(CLOUDFLARE_OPENAPI_META.operations, 3670);
  assert.equal(CLOUDFLARE_OPENAPI_META.paths, 2303);
  assert.equal(CLOUDFLARE_OPENAPI_META.tags, 745);
  assert.deepEqual(CLOUDFLARE_OPENAPI_META.methods, { GET: 1798, POST: 782, PUT: 352, PATCH: 273, DELETE: 465 });
  assert.match(CLOUDFLARE_OPENAPI_META.sha256, /^[a-f0-9]{64}$/);
  const operations = new Set(CLOUDFLARE_OPENAPI_OPERATIONS.map((x) => x.method + " " + x.path));
  assert.equal(operations.size, 3670);
  assert.ok(CLOUDFLARE_OPENAPI_OPERATIONS.every((x) => x.executionStatus === "INVENTORY_ONLY"));
  assert.ok(CLOUDFLARE_OPENAPI_OPERATIONS.every((x) => x.method && x.path.startsWith("/") && x.summary));
  assert.equal(CLOUDFLARE_OPENAPI_META.executionAuthorizedByInventory, false);
});

test("provider_capabilities reuses original dispatcher with Cloudflare OpenAPI search and pagination", async () => {
  const result = await matrixTool.handler({
    provider: "cloudflare", view: "openapi", method: "GET", search: "/dns_records", limit: 3, offset: 0,
  });
  const data = JSON.parse(result.content[0].text);
  assert.equal(data.status, "INVENTORY_PASS");
  assert.equal(data.catalog.operations, 3670);
  assert.ok(data.totalMatched >= 1 && data.items.length <= 3);
  assert.ok(data.items.every((x) => x.method === "GET" && x.path.includes("/dns_records")));
  assert.ok(data.items.every((x) => x.executionStatus === "INVENTORY_ONLY"));
  const final = await matrixTool.handler({ provider: "cloudflare", view: "openapi", offset: 3669, limit: 1 });
  const tail = JSON.parse(final.content[0].text);
  assert.equal(tail.items.length, 1);
  assert.equal(tail.nextOffset, null);
  const legacy = JSON.parse((await matrixTool.handler({ provider: "cloudflare" })).content[0].text);
  assert.equal(legacy.status, "PASS");
  assert.ok(legacy.capabilities.some((x) => x.capability === "dns.list"));
});

test("Cloudflare inventory is not an escape hatch for provider_read or provider_mutate", async () => {
  assert.throws(
    () => buildProviderRequest("cloudflare", "openapi:GET /accounts", {}),
    /PROVIDER_CAPABILITY_UNKNOWN/,
  );
  const denied = JSON.parse((await readTool.handler({
    provider: "cloudflare", capability: "openapi:GET /accounts", params: {},
  })).content[0].text);
  assert.equal(denied.ok, false);
  assert.match(denied.status, /PROVIDER_CAPABILITY_UNKNOWN/);
  const mutateDenied = JSON.parse((await mutationTool.handler({
    provider: "cloudflare", capability: "openapi:DELETE /accounts/{account_id}", params: { account_id: "test" },
  })).content[0].text);
  assert.equal(mutateDenied.ok, false);
  assert.match(mutateDenied.status, /PROVIDER_CAPABILITY_UNKNOWN/);
});


test("fallback Tailscale local nao promove broker a PASS nem revela identificadores", () => {
  const source = {
    Self: { Online: true, HostName: "host-privado", TailscaleIPs: ["100.64.0.7"] },
    Peer: {
      a: { Online: true, HostName: "pc-privado" },
      b: { Online: false, HostName: "celular-privado" },
    },
  };
  const summary = __test.summarizeLocalTailnet(source);
  assert.deepEqual(summary, {
    selfOnline: true,
    peerCount: 2,
    onlinePeers: 1,
    privateIpAssigned: true,
  });
  const json = JSON.stringify(summary);
  for (const secret of ["host-privado", "pc-privado", "100.64.0.7"]) {
    assert.equal(json.includes(secret), false);
  }
  assert.deepEqual(__test.summarizeLocalTailnet({}), {
    selfOnline: false,
    peerCount: 0,
    onlinePeers: 0,
    privateIpAssigned: false,
  });
});

test("dist preserves native Tailscale fallback and never leaks peer identity", () => {
  const content = readFileSync(
    new URL("../dist/modes/admin/tools/admin-provider-control.js", import.meta.url),
    "utf8",
  );
  assert.match(content, /TAILSCALE_OAUTH_BROKER_UNREACHABLE/);
  assert.equal((content.match(/localFallback: await localTailnetFallback\(\)/g) || []).length, 2);
  assert.match(content, /execFileAsync\("tailscale", \["status", "--json"\]/);
  const sample = {
    Self: { Online: true, HostName: "private-machine", TailscaleIPs: ["100.100.99.88"] },
    Peer: { x: { Online: true, HostName: "private-peer" }, y: { Online: false } },
  };
  const report = distTest.summarizeLocalTailnet(sample);
  assert.deepEqual(report, __test.summarizeLocalTailnet(sample));
  const serialized = JSON.stringify(report);
  for (const sensitive of ["private-machine", "private-peer", "100.100.99.88"]) {
    assert.equal(serialized.includes(sensitive), false);
  }
  assert.equal(distTailscaleTools.find(t => t.name === "tailscale_bridge_status")?.annotations.readOnlyHint, true);
});

test("dist bridge retains status UNKNOWN on broker failure (not PASS)", async () => {
  const bridge = distTailscaleTools.find(t => t.name === "tailscale_bridge_status");
  assert.ok(bridge);
  const priorFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("broker_unreachable_fixture"); };
  try {
    // CLI fallback reads local tailnet only; host/peers never appear in returned data.
    const reply = JSON.parse((await bridge.handler({})).content[0].text);
    assert.equal(reply.ok, false);
    assert.equal(reply.status, "TAILSCALE_OAUTH_BROKER_UNREACHABLE");
    assert.equal(reply.localFallback?.source, "tailscale-cli:status-json");
    assert.equal(typeof reply.localFallback?.observed, "boolean");
    assert.equal("data" in reply, false);
  } finally {
    globalThis.fetch = priorFetch;
  }
});

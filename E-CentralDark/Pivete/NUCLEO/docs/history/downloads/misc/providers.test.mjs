import test from "node:test";
import assert from "node:assert/strict";
import { buildEndpoint, resolveProviders, buildRouteCandidates } from "../src/provider-registry.mjs";
import { callRoute, normalizeModelText } from "../src/provider-client.mjs";

const config = { providers: [{ id: "centraldark", type: "openai-compatible", enabled: true, baseUrl: "https://api.centralldark.com", path: "/v1/chat/completions", apiKeyEnv: "CENTRALDARK_API_KEY", models: ["m"] }] };

test("direção CentralDark é exata", () => assert.equal(buildEndpoint("https://api.centralldark.com", "/v1/chat/completions"), "https://api.centralldark.com/v1/chat/completions"));

test("provider sem chave não é ativado", () => assert.equal(resolveProviders(config, {}).length, 0));

test("provider com chave vira rota", () => {
  const providers = resolveProviders(config, { CENTRALDARK_API_KEY: "secret" });
  assert.equal(buildRouteCandidates(providers)[0].provider.endpoint, "https://api.centralldark.com/v1/chat/completions");
  assert.equal(JSON.stringify(providers).includes("secret"), false);
});

test("resposta vazia e array vazio são bloqueados", () => {
  assert.throws(() => normalizeModelText("   "), /MODEL_EMPTY_RESPONSE/);
  assert.throws(() => normalizeModelText([]), /MODEL_EMPTY_RESPONSE/);
});

test("bloco textual é normalizado", () => assert.equal(normalizeModelText([{ type: "text", text: "ok" }]), "ok"));

test("callRoute rejeita HTTP 200 vazio", async () => {
  const provider = resolveProviders(config, { CENTRALDARK_API_KEY: "secret" })[0];
  await assert.rejects(() => callRoute({ provider, model: "m" }, { system: "s", user: "u" }, {
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: [] } }] }) })
  }), /MODEL_EMPTY_RESPONSE/);
});

test("OpenAI Responses extrai output_text", async () => {
  const provider = { id: "responses", type: "openai-responses", endpoint: "https://api.openai.com/v1/responses", models: ["m"], timeoutMs: 1000 };
  Object.defineProperty(provider, "apiKey", { value: "secret", enumerable: false });
  const result = await callRoute({ provider, model: "m" }, { system: "s", user: "u" }, {
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ output_text: "resposta" }) })
  });
  assert.equal(result.text, "resposta");
});

test("OpenAI Responses extrai bloco output_text", async () => {
  const provider = { id: "responses", type: "openai-responses", endpoint: "https://api.openai.com/v1/responses", models: ["m"], timeoutMs: 1000 };
  Object.defineProperty(provider, "apiKey", { value: "secret", enumerable: false });
  const result = await callRoute({ provider, model: "m" }, { system: "s", user: "u" }, {
    fetchImpl: async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ output: [{ content: [{ type: "output_text", text: "bloco" }] }] }) })
  });
  assert.equal(result.text, "bloco");
});

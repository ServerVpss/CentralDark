import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { executeInvocation } from "../src/orchestrator.mjs";

const env = { CENTRALDARK_API_KEY: "secret", CENTRALDARK_MODELS: "m1,m2,m3" };
function fakeFetch(textByModel = {}) {
  return async (_url, init) => {
    const body = JSON.parse(init.body);
    const content = textByModel[body.model] ?? `ok-${body.model}`;
    return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content } }] }) };
  };
}

test("# executa uma rota e salva receipt", async () => {
  const receiptsDir = await fs.mkdtemp(path.join(os.tmpdir(), "uai-receipt-"));
  const result = await executeInvocation({ prefix: "#", mode: "standard", name: "sintetizar", target: null, flags: {} }, { env, receiptsDir, fetchImpl: fakeFetch() });
  assert.equal(result.status, "PASS");
  assert.match(result.output, /^ok-/);
  assert.equal((await fs.readdir(receiptsDir)).length, 1);
});

test("! exige crítico e juiz distintos", async () => {
  const result = await executeInvocation({ prefix: "!", mode: "adversarial", name: "sintetizar", target: null, flags: {} }, { env, saveReceipt: false, fetchImpl: fakeFetch() });
  assert.equal(result.receipt.independence, "PRIMARY_CRITIC_JUDGE_DISTINCT");
});

test("! bloqueia quando não existe independência", async () => {
  await assert.rejects(() => executeInvocation({ prefix: "!", mode: "adversarial", name: "sintetizar", target: null, flags: {} }, {
    env: { CENTRALDARK_API_KEY: "secret", CENTRALDARK_MODELS: "m1" }, saveReceipt: false, fetchImpl: fakeFetch()
  }), /INDEPENDENT_CRITIC_UNAVAILABLE/);
});

test("conteúdo secreto do alvo é redigido antes da API", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "uai-secret-target-"));
  const file = path.join(root, "a.md");
  await fs.writeFile(file, "token=abc123456789 github_pat_abcdefghijklmnopqrstuvwxyz");
  let sentBody = "";
  const captureFetch = async (_url, init) => {
    sentBody = init.body;
    return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: "ok" } }] }) };
  };
  await executeInvocation({ prefix: "#", mode: "standard", name: "auditar", target: file, flags: { "allowed-root": root } }, { env, saveReceipt: false, fetchImpl: captureFetch });
  assert.equal(sentBody.includes("github_pat_"), false);
  assert.equal(sentBody.includes("abc123456789"), false);
});

test("aliases do mesmo endpoint/modelo não contam como independentes", async () => {
  const configDir = await fs.mkdtemp(path.join(os.tmpdir(), "uai-config-alias-"));
  await fs.writeFile(path.join(configDir, "commands.json"), JSON.stringify({ schemaVersion: 1, commands: { sintetizar: { requiredTarget: false, system: "s", criticSystem: "c", judgeSystem: "j" } } }));
  await fs.writeFile(path.join(configDir, "providers.json"), JSON.stringify({ schemaVersion: 1, providers: [
    { id: "a", type: "openai-compatible", enabled: true, baseUrl: "https://same.test", path: "/v1/chat/completions", apiKeyEnv: "K", models: ["m"] },
    { id: "b", type: "openai-compatible", enabled: true, baseUrl: "https://same.test", path: "/v1/chat/completions", apiKeyEnv: "K", models: ["m"] }
  ] }));
  await assert.rejects(() => executeInvocation({ prefix: "!", mode: "adversarial", name: "sintetizar", target: null, flags: {} }, {
    configDir, env: { K: "x" }, saveReceipt: false, fetchImpl: fakeFetch()
  }), /INDEPENDENT_CRITIC_UNAVAILABLE/);
});

test("crítico usa fallback entre rotas independentes", async () => {
  let m1Calls = 0;
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body);
    if (body.model === "m1") { m1Calls++; return { ok: false, status: 500, text: async () => JSON.stringify({ error: { message: "down" } }) }; }
    return { ok: true, status: 200, text: async () => JSON.stringify({ choices: [{ message: { content: `ok-${body.model}` } }] }) };
  };
  const result = await executeInvocation({ prefix: "!", mode: "adversarial", name: "sintetizar", target: null, flags: {} }, {
    env: { CENTRALDARK_API_KEY: "secret", CENTRALDARK_MODELS: "m1,m2,m3,m4" }, saveReceipt: false, fetchImpl
  });
  assert.equal(result.status, "PASS");
  assert.equal(m1Calls >= 1, true);
});

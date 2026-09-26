#!/usr/bin/env node
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { detectProviders, callProvider, runEnxame } from "../runtime/enxame-runner.mjs";

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() { return JSON.stringify(body); },
  };
}

describe("Enxame — fallback real, Fable e segredo protegido", () => {
  it("detecta provedores na ordem declarada e não serializa chaves", () => {
    const providers = detectProviders({
      CENTRALDARK_API_KEY: "cd-secret",
      OPENAI_API_KEY: "oa-secret",
      ANTHROPIC_API_KEY: "an-secret",
    });
    assert.deepEqual(providers.map((provider) => provider.id), ["centraldark", "openai-compatible", "anthropic"]);
    const serialized = JSON.stringify(providers);
    assert.doesNotMatch(serialized, /cd-secret|oa-secret|an-secret/);
  });

  it("sem variável de API retorna indisponível", async () => {
    const result = await runEnxame({ env: {}, prompt: "x" });
    assert.equal(result.status, "ENXAME_UNAVAILABLE");
  });

  it("CentralDark falha e OpenAI assume automaticamente", async () => {
    const env = { CENTRALDARK_API_KEY: "cd", OPENAI_API_KEY: "oa", OPENAI_BASE_URL: "https://openai.test/v1" };
    const fetchImpl = async (url) => {
      if (String(url).includes("centralldark")) return response(500, { error: { message: "down" } });
      return response(200, { choices: [{ message: { content: "resposta válida" } }] });
    };
    const out = await fs.mkdtemp(path.join(os.tmpdir(), "qa-enxame-"));
    const result = await runEnxame({ env, fetchImpl, prompt: "diagnóstico", outputDir: out, judge: false });
    assert.equal(result.status, "OK");
    assert.deepEqual(result.sourcesUsed, ["openai-compatible"]);
    assert.ok(result.agentsUsed.includes("fable-adversarial"));
  });

  it("tenta outro modelo do mesmo provedor antes de desistir", async () => {
    const out = await fs.mkdtemp(path.join(os.tmpdir(), "qa-enxame-model-"));
    const fetchImpl = async (_url, init) => {
      const body = JSON.parse(init.body);
      if (body.model === "bad-model") return response(400, { error: { message: "unsupported" } });
      return response(200, { choices: [{ message: { content: "modelo alternativo funcionou" } }] });
    };
    const result = await runEnxame({
      env: { CENTRALDARK_API_KEY: "cd", CENTRALDARK_MODELS: "bad-model,good-model" },
      fetchImpl, prompt: "diagnóstico", outputDir: out, judge: false,
    });
    assert.equal(result.status, "OK");
    assert.ok(result.modelsUsed.some((item) => item.endsWith("/good-model")));
  });

  it("HTTP 200 com corpo de erro não é resposta verde", async () => {
    const provider = detectProviders({ OPENAI_API_KEY: "oa", OPENAI_BASE_URL: "https://openai.test/v1" })[0];
    await assert.rejects(
      () => callProvider(provider, { user: "x", system: "y" }, { fetchImpl: async () => response(200, { error: { message: "modelo inválido" } }) }),
      /modelo inválido|EMPTY_RESPONSE/
    );
  });

  it("todas as APIs falhando retorna indisponível e nunca inventa veredito", async () => {
    const out = await fs.mkdtemp(path.join(os.tmpdir(), "qa-enxame-"));
    const result = await runEnxame({
      env: { OPENAI_API_KEY: "oa", OPENAI_BASE_URL: "https://openai.test/v1" },
      fetchImpl: async () => response(503, { error: { message: "offline" } }),
      prompt: "diagnóstico",
      outputDir: out,
      judge: true,
    });
    assert.equal(result.status, "ENXAME_UNAVAILABLE");
    assert.equal(result.veredito, null);
  });

  it("Judge informa quando reutiliza o mesmo modelo", async () => {
    const out = await fs.mkdtemp(path.join(os.tmpdir(), "qa-enxame-"));
    const result = await runEnxame({
      env: { OPENAI_API_KEY: "oa", OPENAI_BASE_URL: "https://openai.test/v1", OPENAI_MODEL: "modelo-unico" },
      fetchImpl: async () => response(200, { choices: [{ message: { content: "ok" } }] }),
      prompt: "diagnóstico",
      outputDir: out,
      judge: true,
    });
    assert.equal(result.status, "OK");
    assert.equal(result.judgeIndependence, "MODEL_REUSED");
    assert.ok(result.agentsUsed.includes("fable-adversarial"));
  });

  it("modo grande exige autorização explícita", async () => {
    const result = await runEnxame({ mode: "titanico", env: { OPENAI_API_KEY: "x" }, prompt: "x" });
    assert.equal(result.status, "ENXAME_LARGE_REQUIRES_EXPLICIT_ALLOW");
  });
});

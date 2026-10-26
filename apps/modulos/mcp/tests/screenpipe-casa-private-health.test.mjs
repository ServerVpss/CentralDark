import assert from "node:assert/strict";
import { test } from "node:test";
import { hybridObservabilityTools } from "../src/tools/observability/hybrid-observability.js";

const sensor = hybridObservabilityTools.find((tool) => tool.name === "screenpipe_status");
const CASA = "http://100.123.93.25:3030";

async function readSensor(baseUrl) {
  const result = await sensor.handler({ baseUrl });
  return JSON.parse(result.content[0].text);
}

test("Casa Tailscale health atribui Screenpipe mas não declara acesso autenticado à tela", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(String(url), CASA + "/health");
    return new Response(JSON.stringify({
      hostname: "SEGREDO", status: "degraded", dependencies: { ffmpeg: { status: "ok" } },
      frame_status: "ok", audio_status: "stale",
      last_frame_timestamp: new Date(Date.now() - 10_000).toISOString(),
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  try {
    const result = await readSensor(CASA);
    assert.equal(result.http, 200);
    assert.equal(result.runtime_host, "CASA_WINDOWS");
    assert.equal(result.owner_attributed_to_screenpipe, true);
    assert.equal(result.status, "SENSOR_REACHABLE_DEGRADED");
    assert.equal(result.recent_frame_observed, true);
    assert.equal(result.audio_status, "stale");
    assert.equal(result.proof, false);
    assert.equal(result.authority, false);
    assert.equal(result.context_access, "NOT_TESTED_AUTH_REQUIRED_IF_403");
    assert.equal("raw" in result, false);
  } finally {
    globalThis.fetch = previous;
  }
});

test("IP privado arbitrário, porta, credenciais e caminhos fora de escopo são recusados", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("unexpected network call"); };
  try {
    for (const target of [
      "http://192.168.1.2:3030",
      "http://100.123.93.25:3031",
      "https://100.123.93.25:3030",
      "http://100.123.93.25:3030/private",
      "http://user:pass@100.123.93.25:3030",
      "http://100.123.93.25:3030/?debug=1",
    ]) {
      const result = await readSensor(target);
      assert.equal(result.status, "UNKNOWN", target);
      assert.match(result.error, /not_allowed/, target);
    }
  } finally {
    globalThis.fetch = previous;
  }
});

test("Casa com health 200 sem assinatura do Screenpipe não vira verde", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    service: "graph-panel", status: "healthy", hostname: "SEGREDO",
  }), { status: 200, headers: { "Content-Type": "application/json" } });
  try {
    const result = await readSensor(CASA);
    assert.equal(result.owner_attributed_to_screenpipe, false);
    assert.equal(result.status, "REACHABLE_NOT_ATTRIBUTED_OR_UNKNOWN");
    assert.equal(result.recent_frame_observed, false);
  } finally {
    globalThis.fetch = previous;
  }
});

test("Casa HTTP 403 continua AUTH_REQUIRED sem contornar proteção", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => new Response("forbidden", { status: 403 });
  try {
    const result = await readSensor(CASA);
    assert.equal(result.status, "AUTH_REQUIRED");
    assert.equal(result.owner_attributed_to_screenpipe, false);
    assert.equal(result.proof, false);
  } finally {
    globalThis.fetch = previous;
  }
});

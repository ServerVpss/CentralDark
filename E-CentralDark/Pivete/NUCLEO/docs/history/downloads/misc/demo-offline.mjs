#!/usr/bin/env node
import { runUniversal } from "../src/index.mjs";

/**
 * LEIGO: demonstra o fluxo sem usar chave ou internet.
 * PROFISSIONAL: injeta fetch determinístico somente para provar parser, roteamento, resposta e receipt.
 */
async function main() {
  const result = await runUniversal("#sintetizar", null, {
    env: { CENTRALDARK_API_KEY: "DEMO_NOT_REAL", CENTRALDARK_MODELS: "demo-model" },
    saveReceipt: false,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ choices: [{ message: { content: "DEMO_OFFLINE_PASS" } }] }),
    }),
  });
  console.log(JSON.stringify({ status: result.status, output: result.output, provider: result.receipt.provider, model: result.receipt.model }, null, 2));
}
await main();

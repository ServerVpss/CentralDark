import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const UI_URL = process.env.SOL_UI_URL ?? "http://127.0.0.1:1420/";
const INGRESS_URL = process.env.SOL_INGRESS_URL ?? "http://127.0.0.1:8787";
const OMNI_URL = process.env.SOL_OMNI_URL ?? "http://127.0.0.1:8099";
const TTS_URL = process.env.SOL_TTS_URL ?? "http://127.0.0.1:8880/v1/audio/speech";
const proofInput = process.env.SOL_VOICE_PROOF ?? "E:/CentralDark/workspace/sol/03-VOZ/provas/sol-kokoro-local.wav";
const output = process.env.SOL_COUNTERPROOF_OUT ?? "E:/CentralDark/workspace/sol/03-VOZ/provas/sol-local-counterproof.receipt.json";

async function request(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.SOL_PROBE_TIMEOUT_MS ?? 120_000));
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function jsonResponse(url, init = {}) {
  const response = await request(url, init);
  const body = await response.json();
  return { response, body };
}

function pass(name, value) {
  return { name, status: value ? "PASS" : "FAIL" };
}

const checks = [];
const observedAt = new Date().toISOString();
let stage = "start";

try {
  stage = "ui";
  const ui = await request(UI_URL);
  checks.push(pass("ui_http_200", ui.status === 200));

  stage = "ingress_health";
  const health = await jsonResponse(`${INGRESS_URL}/health`);
  checks.push(pass("ingress_http_200", health.response.status === 200));
  checks.push(pass("ingress_stt_adapter", health.body?.chain?.stt_adapter === true));
  checks.push(pass("ingress_mutation_false", health.body?.mutation === false));

  stage = "omni_health";
  const omniHealth = await request(`${OMNI_URL}/health`);
  checks.push(pass("omni_http_200", omniHealth.status === 200));

  stage = "chat";
  const chat = await jsonResponse(`${INGRESS_URL}/v1/sol/respond`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "SOL_COUNTERPROOF", history: [] }),
  });
  checks.push(pass("chat_http_200", chat.response.status === 200));
  checks.push(pass("chat_has_text", typeof chat.body?.text === "string" && chat.body.text.length > 0));

  stage = "stt";
  const audio = await readFile(resolve(proofInput));
  const form = new FormData();
  form.append("file", new Blob([audio], { type: "audio/wav" }), "sol-proof.wav");
  form.append("model", "base");
  form.append("language", "pt");
  const stt = await jsonResponse(`${INGRESS_URL}/v1/audio/transcriptions`, { method: "POST", body: form });
  checks.push(pass("stt_http_200", stt.response.status === 200));
  checks.push(pass("stt_has_text", typeof stt.body?.text === "string" && stt.body.text.length > 0));
  checks.push(pass("stt_local_proof", stt.body?.proof === "SOL_STT_LOCAL"));

  stage = "tts";
  const tts = await request(TTS_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: "kokoro", input: "Contraprova local da SOL.", voice: "pf_dora", response_format: "wav" }),
  });
  const ttsBytes = Buffer.from(await tts.arrayBuffer());
  checks.push(pass("tts_http_200", tts.status === 200));
  checks.push(pass("tts_wav", ttsBytes.subarray(0, 4).toString() === "RIFF" && ttsBytes.subarray(8, 12).toString() === "WAVE"));
  checks.push(pass("tts_nonempty", ttsBytes.length > 44));
} catch (error) {
  checks.push({ name: `probe_exception_${stage}`, status: "FAIL", detail: error instanceof Error ? error.message : String(error) });
}

const failed = checks.filter((check) => check.status !== "PASS");
const receipt = {
  schema: "centraldark.sol.local-counterproof.v1",
  observed_at: observedAt,
  status: failed.length === 0 ? "PASS" : "FAIL",
  checks,
  limits: {
    microphone_capture: "UNKNOWN",
    native_tauri_build: "BLOCKED_BY_CODE_INTEGRITY",
  },
  local_only: true,
  secrets_read: false,
};

await mkdir(resolve(output, ".."), { recursive: true });
await writeFile(resolve(output), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
console.log(JSON.stringify(receipt));
if (failed.length > 0) process.exitCode = 1;

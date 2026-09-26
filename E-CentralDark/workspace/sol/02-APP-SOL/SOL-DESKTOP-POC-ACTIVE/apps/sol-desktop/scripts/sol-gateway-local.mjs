// Canonical local ingress for the SOL desktop surface.
// It composes existing CentralDark owners; it is not a second router or engine.

import { createHash, randomUUID } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { homedir, tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = resolve(process.env.CENTRALDARK_REPO_ROOT ?? resolve(APP_ROOT, "../.."));
const PORT = Number(process.env.SOL_GATEWAY_PORT ?? 8787);
const OMNI_URL = process.env.SOL_OMNI_URL ?? "http://127.0.0.1:8099/v1/chat/completions";
const HERMES_HEALTH_URL = process.env.SOL_HERMES_HEALTH_URL ?? "http://127.0.0.1:8645/health";
const MODEL = process.env.SOL_MODEL ?? "hermes/tencent/hy3:free";
const PYTHON = process.env.SOL_PYTHON ?? "python";
const ROUTER_SCRIPT = resolve(REPO_ROOT, ".agents/skills/capability-contract-router/scripts/route_capabilities.py");
const STT_SCRIPT = resolve(APP_ROOT, "scripts/sol-stt-local.py");
const STT_PYTHON = process.env.SOL_STT_PYTHON ?? PYTHON;
const STT_MODEL_PATH = process.env.SOL_STT_MODEL_PATH ?? "base";
const STT_TIMEOUT_MS = Number(process.env.SOL_STT_TIMEOUT_MS ?? 180000);
const STATE_ROOT = process.env.LOCALAPPDATA
  ? resolve(process.env.LOCALAPPDATA, "CentralDark/SOL")
  : resolve(homedir(), ".centraldark/sol");
const MEMORY_FILE = resolve(STATE_ROOT, "session-memory.jsonl");
const CRITICAL = ["delete", "merge", "production", "push", "secret", "vps"];

mkdirSync(STATE_ROOT, { recursive: true });

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-api-key",
  "access-control-max-age": "86400",
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function safeJson(value) {
  return JSON.parse(JSON.stringify(value, (_key, item) => {
    if (typeof item !== "string") return item;
    return item.replace(/(authorization|api[-_ ]?key|token|secret)\s*[:=]\s*\S+/gi, "$1=[REDACTED]");
  }));
}

function writeJson(res, status, body) {
  res.writeHead(status, { ...cors, "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(safeJson(body)));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error("payload_too_large");
  }
  return JSON.parse(raw || "{}");
}

async function readMultipart(req) {
  const contentType = String(req.headers["content-type"] ?? "");
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) throw new Error("multipart_boundary_missing");
  const boundary = boundaryMatch[1] ?? boundaryMatch[2];
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 25_000_000) throw new Error("payload_too_large");
    chunks.push(Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("latin1");
  const fields = {};
  let file = null;
  for (const part of raw.split(`--${boundary}`)) {
    const section = part.replace(/^\r?\n/, "").replace(/\r?\n--\r?\n?$/, "");
    const separator = section.indexOf("\r\n\r\n");
    if (separator < 0) continue;
    const headers = section.slice(0, separator);
    const value = section.slice(separator + 4);
    const disposition = headers.split("\r\n").find((line) => /content-disposition/i.test(line));
    const name = disposition?.match(/\bname="([^"]+)"/i)?.[1];
    const filename = disposition?.match(/\bfilename="([^"]*)"/i)?.[1];
    if (!name) continue;
    const cleanValue = value.replace(/\r\n$/, "");
    if (filename !== undefined) file = { filename: filename || "audio.webm", data: Buffer.from(cleanValue, "latin1") };
    else fields[name] = cleanValue;
  }
  return { fields, file };
}

async function probe(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const body = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    return { ok: false, status: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

function gitState() {
  const run = (...args) => spawnSync("git", args, { cwd: REPO_ROOT, encoding: "utf8", timeout: 8000 });
  const head = run("rev-parse", "HEAD");
  const branch = run("branch", "--show-current");
  const status = run("status", "--short");
  return {
    ok: head.status === 0 && branch.status === 0 && status.status === 0,
    head: head.stdout.trim() || null,
    branch: branch.stdout.trim() || null,
    dirty: Boolean(status.stdout.trim()),
    changed_count: status.stdout.trim() ? status.stdout.trim().split(/\r?\n/).length : 0,
  };
}

function routeCapabilities(taskId, intent, proofTarget) {
  const required = intent === "STATUS_READONLY"
    ? ["route", "session", "memory", "tools"]
    : ["route", "session", "memory", "chat", "execute"];
  const payload = {
    task: {
      task_id: taskId,
      required_capabilities: required,
      optional_capabilities: ["voice", "mcp", "hub"],
      writer_scope: `sol-session:${taskId}`,
      proof_target: proofTarget,
    },
    candidates: [
      { id: "sol-runtime-local", capabilities: ["session", "memory"] },
      { id: "capability-contract-router", capabilities: ["route"] },
      { id: "centraldark-omni-router", capabilities: ["chat"] },
      { id: "hermes-local-runtime", capabilities: ["execute"] },
      { id: "local-safe-tools", capabilities: ["tools"] },
    ],
  };
  const input = resolve(tmpdir(), `centraldark-sol-route-${taskId}.json`);
  writeFileSync(input, JSON.stringify(payload), "utf8");
  try {
    const routed = spawnSync(PYTHON, [ROUTER_SCRIPT, "--input", input], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      timeout: 10000,
    });
    if (routed.status !== 0 && !routed.stdout.trim()) {
      return { status: "BLOCKED_CAPABILITY_ROUTER", error: routed.stderr.trim() || `exit_${routed.status}` };
    }
    return JSON.parse(routed.stdout);
  } finally {
    try { rmSync(input, { force: true }); } catch { /* temporary evidence only */ }
  }
}

function appendMemory({ sessionId, requestId, intent, message, response, routeStatus }) {
  const event = {
    schema: "centraldark.sol-session-memory.v1",
    observed_at: new Date().toISOString(),
    session_id: sessionId,
    request_id: requestId,
    intent,
    message_sha256: sha256(message),
    response_sha256: sha256(response),
    route_status: routeStatus,
  };
  appendFileSync(MEMORY_FILE, `${JSON.stringify(event)}\n`, "utf8");
  const lines = readFileSync(MEMORY_FILE, "utf8").trim().split(/\r?\n/).filter(Boolean);
  return { persisted: true, event_count: lines.length, path: "LOCALAPPDATA/CentralDark/SOL/session-memory.jsonl" };
}

async function callOmni({ message, history, requestId, sessionId, missionId, traceId }) {
  const messages = [
    {
      role: "system",
      content: "Voce e a SOL, coordenadora operacional CentralDark. Responda em PT-BR com clareza e sem inventar execucao. REALITY=JUDGE; UNKNOWN!=PASS.",
    },
    ...history.slice(-8).map((item) => ({
      role: item.role === "chefe" ? "user" : "assistant",
      content: String(item.text ?? "").slice(0, 4000),
    })),
    { role: "user", content: message },
  ];
  const response = await fetch(OMNI_URL, {
    method: "POST",
    signal: AbortSignal.timeout(120000),
    headers: {
      "content-type": "application/json",
      "x-request-id": requestId,
      "x-correlation-id": sessionId,
      "x-mission-id": missionId,
      "x-trace-id": traceId,
      "x-writer-scope": `sol-session:${sessionId}`,
    },
    body: JSON.stringify({ model: MODEL, messages, stream: false }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`omni_http_${response.status}:${body.detail ?? body.error ?? "unknown"}`);
  const text = body?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("omni_response_without_text");
  return { text: text.trim(), evidence: body.centraldark ?? {}, model: body.model ?? MODEL };
}

function transcribeAudio({ file, language }) {
  const input = resolve(tmpdir(), `centraldark-sol-stt-${randomUUID()}.webm`);
  writeFileSync(input, file.data);
  try {
    const result = spawnSync(STT_PYTHON, [STT_SCRIPT, input], {
      cwd: APP_ROOT,
      encoding: "utf8",
      timeout: STT_TIMEOUT_MS,
      maxBuffer: 2_000_000,
      env: { ...process.env, SOL_STT_MODEL_PATH: STT_MODEL_PATH, SOL_STT_LANGUAGE: language || "pt" },
    });
    if (result.status !== 0) throw new Error(result.stderr.trim() || `stt_exit_${result.status}`);
    const payload = JSON.parse(result.stdout.trim());
    if (!payload.text?.trim()) throw new Error("stt_response_without_text");
    return payload;
  } finally {
    try { rmSync(input, { force: true }); } catch { /* temporary audio only */ }
  }
}

async function health() {
  const [omni, hermes] = await Promise.all([
    probe(OMNI_URL.replace(/\/v1\/chat\/completions$/, "/health")),
    probe(HERMES_HEALTH_URL),
  ]);
  const capabilityRouter = existsSync(ROUTER_SCRIPT);
  const sttAdapter = existsSync(STT_SCRIPT);
  return {
    ok: omni.ok && hermes.ok && capabilityRouter && sttAdapter,
    service: "centraldark-sol-local-ingress",
    version: "1.0.0",
    chain: {
      sol_surface: true,
      capability_router: capabilityRouter,
      omni_router: omni.ok,
      hermes_runtime: hermes.ok,
      session_memory: existsSync(MEMORY_FILE),
      safe_tools: true,
      stt_adapter: sttAdapter,
    },
    upstream: {
      omni: { ok: omni.ok, status: omni.status, version: omni.body?.version ?? null },
      hermes: { ok: hermes.ok, status: hermes.status, authenticated: hermes.body?.authenticated === true },
    },
    model: MODEL,
    mutation: false,
  };
}

async function respond(body) {
  const message = String(body.message ?? "").trim();
  const intent = String(body.intent ?? "UNKNOWN");
  const risk = String(body.risk ?? "UNKNOWN");
  const requestId = String(body.request_id ?? randomUUID());
  const sessionId = String(body.session_id ?? randomUUID());
  const missionId = `sol-${requestId}`;
  const traceId = randomUUID();
  const history = Array.isArray(body.history) ? body.history : [];
  const baseReceipt = {
    request_id: requestId,
    session_id: sessionId,
    mission_id: missionId,
    trace_id: traceId,
    intent,
    risk,
    mode: "CENTRALDARK_LOCAL_COMPOSED",
    mutation: false,
    observed_at: new Date().toISOString(),
  };

  if (!message) return { status: 400, body: { error: "empty_message", receipt: baseReceipt } };
  if (CRITICAL.some((word) => message.toLowerCase().includes(word))) {
    return {
      status: 403,
      body: {
        text: "A SOL local nao executa mutacao critica por este ingresso de conversa.",
        receipt: { ...baseReceipt, status: "BLOCKED_AUTHORIZATION" },
      },
    };
  }

  const route = routeCapabilities(requestId, intent, `session:${sessionId}`);
  if (route.status !== "PASS_ROUTE_READY") {
    return { status: 503, body: { error: "capability_gap", receipt: { ...baseReceipt, route } } };
  }

  if (intent === "STATUS_READONLY") {
    const git = gitState();
    const text = git.ok
      ? `Casa local medida: branch ${git.branch}, HEAD ${git.head.slice(0, 8)}, working tree ${git.dirty ? `com ${git.changed_count} alteracoes da missao` : "limpa"}.`
      : "Nao foi possivel medir o estado Git local.";
    const memory = appendMemory({ sessionId, requestId, intent, message, response: text, routeStatus: route.status });
    return { status: git.ok ? 200 : 503, body: { text, receipt: { ...baseReceipt, status: git.ok ? "PASS" : "UNKNOWN", route, git, memory } } };
  }

  if (intent === "OPEN_MODULE") {
    const text = `Superficie ${String(body.module ?? "solicitada")} selecionada. O comando foi roteado sem mutacao.`;
    const memory = appendMemory({ sessionId, requestId, intent, message, response: text, routeStatus: route.status });
    return { status: 200, body: { text, receipt: { ...baseReceipt, status: "PASS", route, memory } } };
  }

  const omni = await callOmni({ message, history, requestId, sessionId, missionId, traceId });
  const memory = appendMemory({ sessionId, requestId, intent, message, response: omni.text, routeStatus: route.status });
  return {
    status: 200,
    body: {
      text: omni.text,
      receipt: { ...baseReceipt, status: "PASS", route, memory, omni: omni.evidence, model: omni.model },
    },
  };
}

createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    return res.end();
  }
  if (req.method === "GET" && req.url === "/health") return writeJson(res, 200, await health());
  if (req.method === "POST" && req.url === "/v1/audio/transcriptions") {
    try {
      const multipart = await readMultipart(req);
      if (!multipart.file?.data.length) return writeJson(res, 400, { error: "audio_file_missing", mutation: false });
      const transcription = transcribeAudio({ file: multipart.file, language: multipart.fields.language });
      return writeJson(res, 200, { text: transcription.text, language: transcription.language, model: transcription.model, mutation: false, proof: "SOL_STT_LOCAL" });
    } catch (error) {
      return writeJson(res, 502, { error: "sol_stt_failed", detail: error instanceof Error ? error.message : String(error), mutation: false });
    }
  }
  if (req.method !== "POST" || req.url !== "/v1/sol/respond") {
    return writeJson(res, 404, { error: "not_found", endpoints: ["GET /health", "POST /v1/sol/respond", "POST /v1/audio/transcriptions"] });
  }
  try {
    const reply = await respond(await readJson(req));
    return writeJson(res, reply.status, reply.body);
  } catch (error) {
    return writeJson(res, 502, {
      error: "sol_ingress_failed",
      detail: error instanceof Error ? error.message : String(error),
      mutation: false,
    });
  }
}).listen(PORT, "127.0.0.1", () => {
  console.log(`SOL local ingress: http://127.0.0.1:${PORT}`);
  console.log(`Omni owner: ${OMNI_URL}`);
});

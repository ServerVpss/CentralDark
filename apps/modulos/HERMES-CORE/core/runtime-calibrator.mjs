import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

export const CALIBRATION_STATE_PATH =
  process.env.CENTRALDARK_RUNTIME_CALIBRATION_STATE ||
  "/root/.hermes/centraldark-runtime-calibration.json";

const LOCAL_RUNTIME_STATE =
  process.env.HERMES_LOCAL_RUNTIME_STATE ||
  "/root/.hermes/runtimes/llamacpp/server.json";

const REPAIR_COOLDOWN_MS = Number(
  process.env.CENTRALDARK_RUNTIME_CALIBRATION_COOLDOWN_MS || 15 * 60_000,
);

const SERVICE_TARGETS = [
  "hermes-gateway.service",
  "centraldark-native-mcp-http.service",
  "centraldark-kylin-native-bridge.service",
  "kytensor.service",
];

const HTTP_TARGETS = [
  ["mcp", "http://127.0.0.1:9100/health"],
  ["hermes", "http://127.0.0.1:9900/"],
  ["triton_live", "http://127.0.0.1:8000/v2/health/live"],
  ["triton_ready", "http://127.0.0.1:8000/v2/health/ready"],
  ["kylin_bridge", "http://127.0.0.1:18435/health"],
];

function compact(value, limit = 1200) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, limit);
}

async function serviceState(name) {
  try {
    const result = await execFileP("systemctl", ["is-active", name], { timeout: 4000 });
    return compact(result.stdout, 80) || "unknown";
  } catch (error) {
    const stdout = compact(error && error.stdout, 80);
    return stdout || "unknown";
  }
}

async function bridgeChatProbe() {
  const url = "http://127.0.0.1:18435/v1/chat/completions";
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "kylin-qwen-plus",
        messages: [{ role: "user", content: "Responda somente OK" }],
        max_tokens: 8,
        temperature: 0,
      }),
    });
    const text = await response.text();
    return {
      name: "kylin_bridge_chat",
      url,
      code: response.status,
      ok: response.status === 200,
      latency_ms: Date.now() - started,
      body_preview: text.slice(0, 300),
    };
  } catch (error) {
    return {
      name: "kylin_bridge_chat",
      url,
      code: 0,
      ok: false,
      latency_ms: Date.now() - started,
      error: compact(error && (error.message || error), 200),
    };
  }
}

async function httpProbe(name, url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "CentralDark-Runtime-Calibrator/1" },
    });
    const text = await response.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {}
    return { name, url, code: response.status, ok: response.status === 200, body };
  } catch (error) {
    return {
      name,
      url,
      code: 0,
      ok: false,
      error: compact(error && (error.message || error), 200),
    };
  }
}

async function resolveLocalModel() {
  try {
    const state = JSON.parse(await readFile(LOCAL_RUNTIME_STATE, "utf8"));
    const baseUrl = String((state && state.base_url) || "").replace(/\/$/, "");
    const apiKey = String((state && state.api_key) || "");
    if (!baseUrl || !apiKey) {
      return { ok: false, reason: "LOCAL_RUNTIME_BINDING_INCOMPLETE" };
    }
    const response = await fetch(baseUrl + "/models", {
      signal: AbortSignal.timeout(6000),
      headers: { Authorization: "Bearer " + apiKey },
    });
    const payload = await response.json();
    const rows = payload && payload.data;
    const model = String((Array.isArray(rows) && rows[0] && rows[0].id) || "").trim();
    if (!response.ok || !model) {
      return { ok: false, reason: "LOCAL_MODEL_LIST_INVALID:" + response.status };
    }
    return { ok: true, baseUrl, apiKey, model };
  } catch (error) {
    return {
      ok: false,
      reason: "LOCAL_MODEL_UNRESOLVED:" + compact(error && (error.message || error), 180),
    };
  }
}

function bridgeDegraded(probe) {
  if (!probe || probe.code !== 200 || !probe.body || typeof probe.body !== "object") {
    return false;
  }
  const body = probe.body;
  const status = String(
    body.status ?? body.state ?? body.health ?? body.backend_status ?? "",
  ).toLowerCase();
  return status.includes("degrad") || status.includes("fail") || status.includes("error");
}

export function classifySnapshot(snapshot) {
  const wounds = [];

  for (const [name, state] of Object.entries(snapshot.services || {})) {
    if (state !== "active") wounds.push("SERVICE_INACTIVE:" + name + ":" + state);
  }

  for (const probe of snapshot.http || []) {
    if (!probe.ok) wounds.push("HTTP_UNHEALTHY:" + probe.name + ":" + probe.code);
    if (probe.name === "kylin_bridge" && bridgeDegraded(probe)) {
      wounds.push("KYLIN_BRIDGE_DEGRADED");
    }
    if (probe.name === "kylin_bridge_chat" && !probe.ok) {
      wounds.push("KYLIN_BRIDGE_CHAT_FAILED:" + probe.code);
    }
  }

  if (!(snapshot.local_model && snapshot.local_model.ok)) {
    wounds.push((snapshot.local_model && snapshot.local_model.reason) || "LOCAL_MODEL_UNRESOLVED");
  }

  return [...new Set(wounds)].sort();
}

export function calibrationFingerprint(wounds) {
  return createHash("sha256")
    .update(JSON.stringify([...(wounds || [])].sort()))
    .digest("hex");
}

function rewardFrom(previous, wounds) {
  const previousCount = Number(
    (previous && previous.wound_count) ??
      (previous && previous.wounds && previous.wounds.length) ??
      0,
  );
  const currentCount = wounds.length;
  if (!previous || !previous.observed_at) return { reward: 0, trend: "BASELINE" };
  if (currentCount < previousCount) return { reward: 1, trend: "IMPROVED" };
  if (currentCount > previousCount) return { reward: -1, trend: "REGRESSED" };
  return { reward: 0, trend: "STABLE" };
}

async function consultLocalModel(binding, snapshot, wounds) {
  if (!binding || !binding.ok || !wounds.length) {
    return { status: "NOT_NEEDED", summary: "Sem ferida material para consulta." };
  }

  const prompt = [
    "Voce e o calibrador semantico LOCAL da CentralDark.",
    "Analise SOMENTE o estado vivo interno abaixo.",
    "Nao execute ferramentas. Nao altere Git/GitHub. Nao invente PASS.",
    "Responda APENAS JSON com status ADVISORY, summary e suggested_checks.",
    "Priorize causa discriminante e reutilizacao de owners existentes.",
    "SNAPSHOT=" + JSON.stringify(snapshot),
    "WOUNDS=" + JSON.stringify(wounds),
  ].join("\n");

  try {
    const response = await fetch(binding.baseUrl + "/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(90_000),
      headers: {
        Authorization: "Bearer " + binding.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: binding.model,
        messages: [
          {
            role: "system",
            content:
              "Calibrador local read-only. Estado vivo primeiro. JSON somente. Reality Judge continua autoridade.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        max_tokens: 280,
        stream: false,
      }),
    });

    const payload = await response.json();
    const choices = payload && payload.choices;
    const content =
      Array.isArray(choices) && choices[0] && choices[0].message
        ? choices[0].message.content
        : "";
    let raw = String(content || "").trim();
    if (raw.startsWith("~~~") && raw.endsWith("~~~")) raw = raw.slice(3, -3).trim();
    const parsed = JSON.parse(raw);
    return {
      status: parsed && parsed.status === "ADVISORY" ? "ADVISORY" : "INVALID",
      summary: compact(parsed && parsed.summary, 1000),
      suggested_checks:
        parsed && Array.isArray(parsed.suggested_checks)
          ? parsed.suggested_checks.slice(0, 8).map((item) => compact(item, 300))
          : [],
      model: binding.model,
    };
  } catch (error) {
    return {
      status: "UNAVAILABLE",
      summary: compact(error && (error.message || error), 500),
      model: binding.model,
    };
  }
}

async function readPreviousState() {
  try {
    return JSON.parse(await readFile(CALIBRATION_STATE_PATH, "utf8"));
  } catch {
    return null;
  }
}

async function persistState(state) {
  await mkdir(dirname(CALIBRATION_STATE_PATH), { recursive: true });
  await writeFile(
    CALIBRATION_STATE_PATH,
    JSON.stringify(state, null, 2) + "\n",
    { encoding: "utf8", mode: 0o600 },
  );
}

export async function calibrateRuntime(options = {}) {
  const consultModel = options.consultModel !== false;
  const observedAt = new Date().toISOString();
  const services = {};
  for (const name of SERVICE_TARGETS) services[name] = await serviceState(name);

  const http = [];
  for (const pair of HTTP_TARGETS) http.push(await httpProbe(pair[0], pair[1]));
  http.push(await bridgeChatProbe());

  const localModel = await resolveLocalModel();
  const snapshot = {
    observed_at: observedAt,
    host: process.env.HOSTNAME || "CENTRALDARK-OS",
    services,
    http,
    local_model: localModel.ok
      ? { ok: true, model: localModel.model, base_url: localModel.baseUrl }
      : { ok: false, reason: localModel.reason },
  };

  const wounds = classifySnapshot(snapshot);
  const fingerprint = calibrationFingerprint(wounds);
  const previous = await readPreviousState();
  const sameWound = Boolean(
    wounds.length &&
      previous &&
      previous.fingerprint &&
      previous.fingerprint === fingerprint,
  );
  const streak = wounds.length
    ? sameWound
      ? Number((previous && previous.streak) || 0) + 1
      : 1
    : 0;
  const feedback = rewardFrom(previous, wounds);
  const advisory = consultModel
    ? await consultLocalModel(localModel, snapshot, wounds)
    : { status: "SKIPPED", summary: "Modelo nao consultado neste probe." };

  const state = {
    schema: "centraldark.runtime-calibration.v1",
    observed_at: observedAt,
    verdict: wounds.length ? "DRIFT" : "PASS",
    wound_count: wounds.length,
    wounds,
    fingerprint,
    streak,
    eligible_for_repair: wounds.length > 0 && streak >= 2,
    reward: feedback.reward,
    trend: feedback.trend,
    snapshot,
    advisory,
    last_enqueued_fingerprint:
      (previous && previous.last_enqueued_fingerprint) || null,
    last_enqueued_at: (previous && previous.last_enqueued_at) || null,
    enqueue_count: Number((previous && previous.enqueue_count) || 0),
    reality_is_judge: true,
    model_is_authority: false,
    hermes_is_executor: true,
  };

  await persistState(state);
  return state;
}

export function buildCalibrationMission(state) {
  if (!state || !state.eligible_for_repair || !state.wounds || !state.wounds.length) {
    return null;
  }

  const now = Date.now();
  const lastAt = Date.parse(state.last_enqueued_at || "");
  const sameAsLast = state.last_enqueued_fingerprint === state.fingerprint;
  if (sameAsLast && Number.isFinite(lastAt) && now - lastAt < REPAIR_COOLDOWN_MS) {
    return null;
  }

  const short = state.fingerprint.slice(0, 12);
  const advisory =
    (state.advisory && state.advisory.summary) || "UNAVAILABLE";
  const lines = [
    "# CENTRALDARK_RUNTIME_CALIBRATION",
    "",
    "SCOPE=VPS_RUNTIME_INTERNAL_ONLY",
    "SOURCE=HERMES_CORE_RUNTIME_CALIBRATOR",
    "FINGERPRINT=" + state.fingerprint,
    "OBSERVED_AT=" + state.observed_at,
    "REWARD=" + state.reward,
    "TREND=" + state.trend,
    "",
    "## FERIDAS MEDIDAS",
  ];
  for (const wound of state.wounds) lines.push("- " + wound);
  lines.push(
    "",
    "## CANDIDATO DA IA LOCAL",
    advisory,
    "",
    "## CONTRATO",
    "- medir T0 da ferida exata antes de mutar;",
    "- reutilizar owner/runtime existente; nao criar segundo daemon/router/cerebro;",
    "- mutar somente runtime interno da VPS necessario para fechar a ferida;",
    "- nao editar Git/GitHub, nao abrir PR, nao pushar, nao alterar main;",
    "- nao imprimir/copiar valor de segredo; apenas usar secret ja autorizado se o owner exigir;",
    "- usar Executor/Critic existentes do Hermes;",
    "- retestar o alvo exato e executar contraprova;",
    "- REALITY_JUDGE fecha PASS/FAIL/UNKNOWN;",
    "- se a ferida nao puder ser fechada sem codigo-fonte, parar em BLOCKED_SOURCE_DELTA_REQUIRED e registrar causa exata.",
    "",
    "NEXT_CURSOR=REMEASURE_SAME_WOUND_AFTER_HERMES_ACTION",
    "",
  );

  return {
    filename: "runtime-calibration-" + short + ".md",
    content: lines.join("\n"),
    fingerprint: state.fingerprint,
  };
}

export async function markCalibrationEnqueued(state, missionPath) {
  const current = (await readPreviousState()) || state || {};
  const next = {
    ...current,
    last_enqueued_fingerprint: state.fingerprint,
    last_enqueued_at: new Date().toISOString(),
    last_enqueued_mission: missionPath,
    enqueue_count: Number(current.enqueue_count || 0) + 1,
  };
  await persistState(next);
  return next;
}

export async function getCalibrationSummary() {
  const state = await readPreviousState();
  if (!state) return { status: "UNKNOWN", reason: "NO_CALIBRATION_STATE" };
  return {
    status: state.verdict || "UNKNOWN",
    observed_at: state.observed_at || null,
    wound_count: Number(state.wound_count || 0),
    fingerprint: state.fingerprint || null,
    streak: Number(state.streak || 0),
    reward: Number(state.reward || 0),
    trend: state.trend || "UNKNOWN",
    local_model:
      (state.snapshot && state.snapshot.local_model && state.snapshot.local_model.model) ||
      null,
    advisory_status:
      (state.advisory && state.advisory.status) || "UNKNOWN",
    last_enqueued_at: state.last_enqueued_at || null,
    enqueue_count: Number(state.enqueue_count || 0),
  };
}

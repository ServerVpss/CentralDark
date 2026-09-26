#!/usr/bin/env node
/**
 * Enxame Ômega fail-closed.
 * - Lê credenciais somente de variáveis já injetadas no processo.
 * - Tenta CentralDark → OpenAI-compatible → Anthropic.
 * - Fable é papel adversarial explícito, não identidade/modelo inventado.
 * - Sem API funcional: ENXAME_UNAVAILABLE.
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { sanitizeObject, sanitizeText } from "./sanitize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENXAME_DIR = path.join(ROOT, "02-KIT-ENXAME-OMEGA");
const DEFAULT_TIMEOUT_MS = 45_000;
const MAX_PROMPT_CHARS = 12_000;
const MAX_RESPONSE_CHARS = 12_000;

const ROLE_POOL = [
  { id: "diagnostico-causal", system: "Localize causa exata, evidência e menor teste discriminativo. PT-BR, direto." },
  { id: "qa-regressao", system: "Pense como QA staff. Procure regressão, caso negativo, idempotência e falso verde." },
  { id: "fable-adversarial", system: "Atue como adversário cego Fable: tente quebrar a conclusão, procure contraprovas e lacunas. Não invente fatos." },
  { id: "seguranca-escopo", system: "Revise escopo, secrets, permissões, rollback, Writer único e ações proibidas." },
  { id: "implementacao-minima", system: "Proponha correção mínima no artefato existente, preservando arquitetura e testes válidos." },
  { id: "estado-transicoes", system: "Audite máquina de estados, retomada, checkpoint e mensagens atrasadas sem retrocesso." },
  { id: "observabilidade", system: "Exija before/after, logs sanitizados, SHA, diff e resultado repetível." },
  { id: "mutacao", system: "Crie mutantes conceituais que um teste discriminativo deve matar. Não adapte o teste ao defeito." },
  { id: "dependencias", system: "Procure dependências, ativador do bug, introdutor e caminho causal." },
  { id: "custo-risco", system: "Compare valor da informação, custo, reversibilidade e risco residual sem números inventados." },
];

const MODE_COUNTS = { econo: 5, padrao: 10, titanico: 20, hypernova: 50 };

function csv(value, fallback) {
  const parsed = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length ? parsed : fallback;
}

function secretProvider({ id, kind, baseUrl, apiKey, models }) {
  const provider = { id, kind, baseUrl, models };
  Object.defineProperty(provider, "apiKey", { value: apiKey, enumerable: false });
  return provider;
}

export function detectProviders(env = process.env) {
  const providers = [];

  if (env.CENTRALDARK_API_KEY) {
    providers.push(
      secretProvider({
        id: "centraldark",
        kind: "openai-compatible",
        baseUrl: env.CENTRALDARK_BASE_URL || "https://api.centralldark.com/v1/chat/completions",
        apiKey: env.CENTRALDARK_API_KEY,
        models: csv(env.CENTRALDARK_MODELS || env.ENXAME_MODELS, ["gpt-5", "claude-sonnet-4", "grok-4", "gemini-2.5-pro", "deepseek-v3"]),
      })
    );
  }

  if (env.OPENAI_API_KEY) {
    const base = env.OPENAI_BASE_URL || env.OPENAI_API_BASE || "https://api.openai.com/v1";
    providers.push(
      secretProvider({
        id: "openai-compatible",
        kind: "openai-compatible",
        baseUrl: /\/chat\/completions\/?$/.test(base) ? base : `${base.replace(/\/$/, "")}/chat/completions`,
        apiKey: env.OPENAI_API_KEY,
        models: csv(env.OPENAI_MODELS || env.OPENAI_MODEL || env.ENXAME_MODELS, ["gpt-5"]),
      })
    );
  }

  if (env.ANTHROPIC_API_KEY) {
    providers.push(
      secretProvider({
        id: "anthropic",
        kind: "anthropic",
        baseUrl: env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1/messages",
        apiKey: env.ANTHROPIC_API_KEY,
        models: csv(env.ANTHROPIC_MODELS || env.ANTHROPIC_MODEL || env.ENXAME_MODELS, ["claude-sonnet-4-20250514"]),
      })
    );
  }

  return providers;
}

async function fetchWithTimeout(fetchImpl, url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("REQUEST_TIMEOUT")), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseResponseText(kind, data) {
  if (kind === "anthropic") {
    const text = data?.content?.find?.((item) => item?.type === "text")?.text || data?.content?.[0]?.text;
    if (!text) throw new Error(sanitizeText(data?.error?.message || "ANTHROPIC_EMPTY_RESPONSE", 500));
    return text;
  }
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error(sanitizeText(data?.error?.message || "OPENAI_COMPAT_EMPTY_RESPONSE", 500));
  return text;
}

export async function callProvider(provider, request, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new Error("FETCH_UNAVAILABLE");
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const model = request.model || provider.models[0];
  const prompt = sanitizeText(request.user, MAX_PROMPT_CHARS);
  const system = sanitizeText(request.system || "Responda técnico, direto, PT-BR.", 3000);

  const headers = { "content-type": "application/json" };
  let body;
  if (provider.kind === "anthropic") {
    headers["x-api-key"] = provider.apiKey;
    headers["anthropic-version"] = "2023-06-01";
    body = { model, max_tokens: Number(options.maxTokens || 2048), system, messages: [{ role: "user", content: prompt }] };
  } else {
    headers.Authorization = `Bearer ${provider.apiKey}`;
    body = { model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] };
  }

  const response = await fetchWithTimeout(fetchImpl, provider.baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }, timeoutMs);

  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`INVALID_JSON_RESPONSE:${response.status}`);
  }
  if (!response.ok) throw new Error(`HTTP_${response.status}:${sanitizeText(data?.error?.message || raw, 500)}`);

  return {
    text: sanitizeText(parseResponseText(provider.kind, data), MAX_RESPONSE_CHARS),
    provider: provider.id,
    model,
  };
}

async function runAgentWithFallback(agent, providers, options) {
  const errors = [];
  const preferredProviderId = options.preferredProviderId || null;
  const providerOrder = [...providers].sort((a, b) =>
    Number(b.id === preferredProviderId) - Number(a.id === preferredProviderId)
  );

  for (const provider of providerOrder) {
    const assigned = provider.models[agent.index % provider.models.length];
    const preferredModel = provider.id === preferredProviderId ? options.preferredModel : null;
    const modelOrder = [...new Set([preferredModel, assigned, ...provider.models].filter(Boolean))];
    for (const model of modelOrder) {
      try {
        const result = await callProvider(provider, {
          model,
          system: agent.system,
          user: options.prompt,
        }, options);
        return { ...result, agentId: agent.id, role: agent.system };
      } catch (error) {
        errors.push(`${provider.id}/${model}:${sanitizeText(error.message, 300)}`);
      }
    }
  }
  const failure = new Error(`ALL_PROVIDERS_FAILED:${errors.join("|")}`);
  failure.agentId = agent.id;
  throw failure;
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = { status: "fulfilled", value: await worker(items[index], index) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  });
  await Promise.all(runners);
  return results;
}

function buildAgents(mode) {
  const count = MODE_COUNTS[mode] || MODE_COUNTS.econo;
  return Array.from({ length: count }, (_, index) => {
    const base = ROLE_POOL[index % ROLE_POOL.length];
    return { ...base, id: count > ROLE_POOL.length ? `${base.id}-${Math.floor(index / ROLE_POOL.length) + 1}` : base.id, index };
  });
}

function chooseJudgeProvider(providers, responses) {
  const usedPairs = new Set(responses.map((item) => `${item.provider}/${item.model}`));
  for (const provider of providers) {
    for (const model of provider.models) {
      if (!usedPairs.has(`${provider.id}/${model}`)) return { provider, model, independence: "INDEPENDENT_PROVIDER_OR_MODEL" };
    }
  }
  return { provider: providers[0], model: providers[0]?.models?.[0], independence: "MODEL_REUSED" };
}

export async function runEnxame(options = {}) {
  const mode = options.mode || "econo";
  const count = MODE_COUNTS[mode] || MODE_COUNTS.econo;
  if (count > 10 && options.allowLarge !== true) {
    return { status: "ENXAME_LARGE_REQUIRES_EXPLICIT_ALLOW", reason: `mode=${mode};agents=${count}`, veredito: null, outputDir: null };
  }

  const providers = options.providers || detectProviders(options.env || process.env);
  if (!providers.length) {
    return {
      status: "ENXAME_UNAVAILABLE",
      reason: "Nenhuma API injetada (CENTRALDARK_API_KEY | OPENAI_API_KEY | ANTHROPIC_API_KEY)",
      veredito: null,
      outputDir: null,
      sourcesUsed: [],
    };
  }

  const prompt = sanitizeText(options.prompt || "Diagnóstico técnico", MAX_PROMPT_CHARS);
  const agents = buildAgents(mode);
  const outputDir = options.outputDir || path.join(os.tmpdir(), `enxame-skill-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);
  await fs.mkdir(path.join(outputDir, "r1"), { recursive: true });

  const settled = await mapWithConcurrency(agents, Number(options.concurrency || 5), (agent) =>
    runAgentWithFallback(agent, providers, { ...options, prompt })
  );
  const responses = settled.filter((item) => item.status === "fulfilled").map((item) => item.value);
  const failures = settled
    .filter((item) => item.status === "rejected")
    .map((item) => sanitizeText(item.reason?.message || item.reason, 600));

  for (const response of responses) {
    const safeName = response.agentId.replace(/[^a-z0-9_-]/gi, "_");
    await fs.writeFile(path.join(outputDir, "r1", `${safeName}.md`), response.text, "utf8");
  }
  if (failures.length) await fs.writeFile(path.join(outputDir, "r1", "ERRORS.json"), `${JSON.stringify(failures, null, 2)}\n`, "utf8");

  if (responses.length === 0) {
    return { status: "ENXAME_UNAVAILABLE", reason: "Todas as APIs falharam", veredito: null, outputDir, sourcesUsed: [], failCount: failures.length };
  }
  if (failures.length > agents.length * 0.3) {
    return {
      status: "ENXAME_PARTIAL_ABORT",
      reason: `Falhas acima de 30% (${failures.length}/${agents.length})`,
      veredito: null,
      outputDir,
      sourcesUsed: [...new Set(responses.map((item) => item.provider))],
      responses: responses.map((item) => sanitizeObject(item)),
      failCount: failures.length,
    };
  }

  let veredito = null;
  let judgeIndependence = "NAO_EXECUTADO";
  let judgeError = null;
  if (options.judge !== false) {
    const choice = chooseJudgeProvider(providers, responses);
    judgeIndependence = choice.independence;
    const context = responses
      .map((response) => `### ${response.agentId} | ${response.provider}/${response.model}\n${response.text.slice(0, 2200)}`)
      .join("\n\n")
      .slice(0, 30_000);
    try {
      const judged = await runAgentWithFallback({
        id: "judge-adversarial",
        index: 0,
        system: "Você é o Judge adversarial. Não confie nos agentes. Consolide em PT-BR: Consenso / Divergências / Contraprova / Ação mínima / Testes / Risco residual.",
      }, providers, {
        ...options,
        prompt: `PROBLEMA:
${prompt}

RESPOSTAS CEGAS:
${context}`,
        preferredProviderId: choice.provider.id,
        preferredModel: choice.model,
      });
      veredito = judged.text;
      judgeIndependence = responses.some((item) => item.provider === judged.provider && item.model === judged.model)
        ? "MODEL_REUSED"
        : "INDEPENDENT_PROVIDER_OR_MODEL";
      await fs.mkdir(path.join(outputDir, "final"), { recursive: true });
      await fs.writeFile(path.join(outputDir, "final", "VEREDITO.md"), veredito, "utf8");
    } catch (error) {
      judgeError = sanitizeText(error.message, 500);
    }
  }

  return {
    status: veredito || options.judge === false ? "OK" : "ENXAME_PARTIAL_NO_JUDGE",
    sourcesUsed: [...new Set(responses.map((item) => item.provider))],
    agentsUsed: responses.map((item) => item.agentId),
    modelsUsed: [...new Set(responses.map((item) => `${item.provider}/${item.model}`))],
    failCount: failures.length,
    judgeIndependence,
    judgeError,
    veredito,
    outputDir,
  };
}

export async function runEnxameScript(scriptName = "enxame-econo-5.sh", prompt = "", options = {}) {
  const script = path.join(ENXAME_DIR, scriptName);
  try {
    await fs.access(script);
  } catch {
    const mode = scriptName.includes("hypernova") ? "hypernova" : scriptName.includes("titanico") ? "titanico" : scriptName.includes("padrao") ? "padrao" : "econo";
    return runEnxame({ ...options, prompt, mode, allowLarge: options.allowLarge === true || ["titanico", "hypernova"].includes(mode) });
  }

  const result = await new Promise((resolve) => {
    const child = spawn("bash", [script, prompt || "Diagnóstico"], { env: options.env || process.env, cwd: ENXAME_DIR });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), options.scriptTimeoutMs || 180_000);
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    child.stdout.on("data", (data) => (stdout += data));
    child.stderr.on("data", (data) => (stderr += data));
    child.on("error", (error) => finish({ status: "SCRIPT_FAILED", reason: sanitizeText(error.message, 1000) }));
    child.on("close", (code) => finish(code === 0
      ? { status: "OK", source: "bash-wrapper", stdout: sanitizeText(stdout, 3000), script: scriptName }
      : { status: "SCRIPT_FAILED", reason: sanitizeText(stderr || `exit ${code}`, 1000) }));
  });

  if (result.status === "OK") return result;
  const mode = scriptName.includes("hypernova") ? "hypernova" : scriptName.includes("titanico") ? "titanico" : scriptName.includes("padrao") ? "padrao" : "econo";
  return runEnxame({ ...options, prompt, mode, allowLarge: options.allowLarge === true || ["titanico", "hypernova"].includes(mode) });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const valueAfter = (flag, fallback = null) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : fallback;
  };
  const mode = valueAfter("--mode", "econo");
  const explicitPrompt = valueAfter("--prompt");
  const positional = args.filter((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--mode" && args[index - 1] !== "--prompt");
  const result = await runEnxame({
    prompt: explicitPrompt || positional.join(" ") || "Diagnóstico técnico",
    mode,
    judge: !args.includes("--no-judge"),
    allowLarge: args.includes("--allow-large"),
  });
  console.log(JSON.stringify(sanitizeObject(result), null, 2));
  process.exit(result.status === "OK" ? 0 : 1);
}

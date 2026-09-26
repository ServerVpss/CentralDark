# COMANDO - enxame-runner.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\PACOTE-SESSAO-INTEIRA-CENTRALDARK-20260806\02-SNAPSHOT-TRABALHO\audit-rigor\qa.teste-de-software.MARKDOWN\runtime\enxame-runner.mjs
**SHA:** 84090516eb61c26f
**Timestamp:** 2026-08-26T19:10:24.277495
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = sanitizeText(request.user, MAX_PROMPT_CHARS);
- const prompt = sanitizeText(options.prompt || "Diagnóstico técnico", MAX_PROMPT_CHARS);
- prompt: `PROBLEMA:
- export async function runEnxameScript(scriptName = "enxame-econo-5.sh", prompt = "", options = {}) {
- const explicitPrompt = valueAfter("--prompt");
- prompt: explicitPrompt || positional.join(" ") || "Diagnóstico técnico",

### Padroes
- const MODE_COUNTS = { econo: 5, padrao: 10, titanico: 20, hypernova: 50 };

### Ouro Bruto (primeiros 5000 chars)
```
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

```
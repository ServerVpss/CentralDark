# COMANDO - github-autonomia-promocao.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\github-autonomia-promocao.mjs
**SHA:** ac1e49fa1bec62ff
**Timestamp:** 2026-08-28T02:57:32.947206
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = selectLatestNonSkipped(runs, name);

### Decisoes
- `Decisão: \`${candidate.decision}\``,

### Padroes
- { code: "GITHUB_TOKEN_LITERAL", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
- { code: "BEARER_LITERAL", pattern: /\bBearer\s+[A-Za-z0-9._~+\/-]{20,}=*/i },
- { code: "JWT_LITERAL", pattern: /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
- { code: "PRIVATE_KEY_LITERAL", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
- { code: "OPENAI_STYLE_KEY_LITERAL", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },

### Contratos
- for (const error of contractErrors) errors.push(`CONTRACT:${finding.id}:${error}`);

### Gaps
- errors: [`MAP_MISSING:${CANONICAL_MAP_PATH}`],
- if (sourcePath && !sourceFile) contractErrors.push(`SOURCE_MISSING:${sourcePath}`);
- if (!file.content.includes(token)) consumerErrors.push(`REQUIRED_TOKEN_MISSING:${token}`);
- if (target && !targetFile) contractErrors.push(`IDENTITY_TARGET_MISSING:${target}`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * Promoção autônoma e fail-closed de pull requests do CentralDark.
 *
 * Um único motor, dois modos:
 * - FAST: intenção já autorizada pelo SEGREDO/CHEFE → validação determinística mínima → squash main;
 * - ADVERSARIAL: quando solicitado → workflows/Judge/contraprova completos.
 *
 * O código do PR nunca é executado aqui. O workflow faz checkout apenas da main confiável.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  normalizarCaminho,
  validarDocumentoMapa,
} from "../apps/modulos/mapeamento/core/validar-mapa.mjs";

export const FAST_MERGE_POLICY = "AUTO_SQUASH_IF_CLEAN";
export const CANONICAL_MAP_PATH = "apps/modulos/mapeamento/config/mapa-canonico.json";

export const DEFAULT_REQUIRED_WORKFLOWS = Object.freeze([
  "porta-de-entrada",
  "codex-validate",
  "lupa-conformance",
  "Lupa Drift Guard",
  "PR auto-review (Codex + checklist)",
  "Pipeline — Telegram + Painel",
]);

export const BLOCKING_LABELS = Object.freeze([
  "do-not-merge",
  "hold",
  "autonomia-bloqueada",
]);

const RECEIPT_MAX_AGE_MS = 15 * 60 * 1000;
const API = "https://api.github.com";
export const DEFAULT_WAIT_TIMEOUT_MS = 45 * 60 * 1000;

const SENSITIVE_PATH = /(^|\/)(?:\.env(?:\.|$)|secrets?(?:\/|$)|tokens?(?:\/|$)|sessions?(?:\/|$)|\.ssh(?:\/|$)|credentials?(?:\/|$)|keys?(?:\/|$))/i;
const SECRET_PATTERNS = Object.freeze([
  { code: "GITHUB_TOKEN_LITERAL", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/ },
  { code: "BEARER_LITERAL", pattern: /\bBearer\s+[A-Za-z0-9._~+\/-]{20,}=*/i },
  { code: "JWT_LITERAL", pattern: /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { code: "PRIVATE_KEY_LITERAL", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { code: "OPENAI_STYLE_KEY_LITERAL", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
]);

export function waitTimeoutMsFromEnv(env = process.env) {
  const minutes = Number(env.BOT_WAIT_TIMEOUT_MINUTES);
  if (!Number.isFinite(minutes) || minutes <= 0) return DEFAULT_WAIT_TIMEOUT_MS;
  return Math.round(minutes * 60 * 1000);
}

export function parseCsv(value, fallback = []) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : [...fallback];
}

export function executionProvenance(env = process.env) {
  return {
    controller: "scripts/github-autonomia-promocao.mjs",
    connector_role: "PHYSICAL_ACCESS_PATH",
    connector_transport: "GITHUB_API",
    executor: "GITHUB_ACTIONS_RUNNER",
    workflow: env.GITHUB_WORKFLOW || null,
    run_id: env.GITHUB_RUN_ID || null,
    actor: env.GITHUB_ACTOR || null,
    triggering_actor: env.GITHUB_TRIGGERING_ACTOR || null,
    runner_environment: env.RUNNER_ENVIRONMENT || null,
    runner_name: env.RUNNER_NAME || null,
    runner_os: env.RUNNER_OS || null,
    hermes_runtime: "UNKNOWN_NOT_ATTESTED_BY_GITHUB_RECEIPT",
  };
}

export function normalizedLabels(pr) {
  return new Set((pr.labels || []).map((label) => {
    const name = String(label.name || label).trim().toLocaleLowerCase("pt-BR");
    if (name === "permito-segredo" || name === "👑 permito-segredo") return "👑 permito-segredo";
    return name;
  }));
}

function lineMarker(body, name) {
  const match = String(body || "").match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mi"));
  return match?.[1]?.trim() || null;
}

export function intentReceipt(pr) {
  const body = String(pr?.body || "");
  const authority = lineMarker(body, "Intent-Authorized");
  const mergePolicy = lineMarker(body, "Merge-Policy");
  const intentScope = lineMarker(body, "Intent-Scope");
  const writer = lineMarker(body, "Writer");
  const writerScope = lineMarker(body, "Writer-Scope");
  const valid = authority === "SEGREDO/CHEFE"
    && mergePolicy === FAST_MERGE_POLICY
    && Boolean(intentScope)
    && Boolean(writer)
    && Boolean(writerScope);
  return { valid, authority, mergePolicy, intentScope, writer, writerScope };
}

/**
 * Autorização humana (A) e prontidão técnica (R) são estados distintos.
 *
 * A pode vir de:
 * 1) label persistente canônica `👑 PERMITO-SEGREDO` (alias textual `permito-segredo` é só compatibilidade de entrada); ou
 * 2) recibo explícito no PR, criado dentro do escopo cuja intenção já foi tomada:
 *    Intent-Authorized + Merge-Policy + Intent-Scope + Writer + Writer-Scope.
 *
 * O body sozinho não basta para PR externo: evaluateCandidate exige autor confiável + mesmo repo.
 * Marcadores históricos PERMITO SEGREDO/PIVETE não concedem autoridade.
 */
export function authorizationFor(pr) {
  const labels = normalizedLabels(pr);
  const body = `${pr.title || ""}\n${pr.body || ""}`;
  const receipt = intentReceipt(pr);
  const segredoLabel = labels.has("👑 permito-segredo");
  const legacyPiveteLabel = labels.has("permito-pivete");
  const segredoBodyMarker = /\bPERMITO[ _-]?SEGREDO\
```
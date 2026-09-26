#!/usr/bin/env node
/**
 * sanitize.mjs — redaction agressiva de segredos + campos single-line.
 * Padrões sintetizados para tokens reais de GitHub, JWT, cloud, DB, SSH.
 */
import crypto from "node:crypto";

/**
 * Ordem importa: padrões mais específicos primeiro.
 * github_pat_* NÃO é coberto por gh[pousr]_ — precisa de regra própria.
 */
const SECRET_PATTERNS = [
  // GitHub fine-grained PAT
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "<REDACTED_GITHUB_PAT>"],
  // GitHub classic + app tokens
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "<REDACTED_GITHUB_TOKEN>"],
  // JWT (header.payload.signature) — três segmentos base64url
  [
    /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    "<REDACTED_JWT>",
  ],
  // Bearer tokens
  [/\bBearer\s+[A-Za-z0-9._~+\/=-]{8,}/gi, "Bearer <REDACTED>"],
  // OpenAI / generic sk-/rk-/pk-
  [/\b(?:sk|rk|pk)[-_][A-Za-z0-9_-]{12,}\b/g, "<REDACTED_KEY>"],
  // Anthropic
  [/\bsk-ant-[A-Za-z0-9_-]{16,}\b/g, "<REDACTED_ANTHROPIC_KEY>"],
  // AWS access key
  [/\bAKIA[0-9A-Z]{16}\b/g, "<REDACTED_AWS_KEY>"],
  // AWS secret-ish (40 chars base64-ish after aws_secret)
  [/\b(aws[_-]?secret[_-]?access[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9\/+=]{30,}/gi, "$1=<REDACTED>"],
  // Slack
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, "<REDACTED_SLACK_TOKEN>"],
  // Google API
  [/\bAIza[0-9A-Za-z_-]{20,}\b/g, "<REDACTED_GOOGLE_KEY>"],
  // Stripe
  [/\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g, "<REDACTED_STRIPE_KEY>"],
  // Telegram bot
  [/\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g, "<REDACTED_TELEGRAM_BOT_TOKEN>"],
  // Supabase / JWT-like service role often labeled
  [/\b(service_role|service-role)\s*[:=]\s*["']?[^\s"']+/gi, "$1=<REDACTED>"],
  // Generic labeled secrets
  [
    /\b(api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|private[_-]?key|password|authorization|secret|token)\s*[:=]\s*["']?[^\s"']+/gi,
    "$1=<REDACTED>",
  ],
  // PEM private keys
  [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    "<REDACTED_PRIVATE_KEY>",
  ],
  // Connection strings with credentials
  [
    /\b(?:postgres|mysql|mongodb|redis|amqp):\/\/[^:\s]+:[^@\s]+@[^\s]+/gi,
    "<REDACTED_CONNECTION_STRING>",
  ],
];

export function sanitizeText(value, maxLength = 4000) {
  let text = value == null ? "" : String(value);
  for (const [pattern, replacement] of SECRET_PATTERNS) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/\u0000/g, "");
  if (text.length > maxLength) text = `${text.slice(0, maxLength)}\n...[truncado]`;
  return text;
}

/** Campos de delta/receipt: uma linha, sem injeção de chave=valor. */
export function singleLineField(value, maxLength = 200) {
  let text = sanitizeText(value, maxLength);
  text = text.replace(/[\r\n\u2028\u2029]+/g, " ").replace(/\s+/g, " ").trim();
  // impede injeção de novas chaves no formato KEY=VALUE do delta
  text = text.replace(/\b([A-Z][A-Z0-9_]{2,})=([^\s]*)/g, "$1\\=$2");
  return text;
}

export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-zA-Z0-9./:+\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function stableStringify(value) {
  const seen = new WeakSet();
  const visit = (item) => {
    if (item === null || typeof item !== "object") return item;
    if (seen.has(item)) throw new TypeError("CIRCULAR_STRUCTURE");
    seen.add(item);
    if (Array.isArray(item)) return item.map(visit);
    return Object.fromEntries(
      Object.keys(item)
        .sort()
        .map((key) => [key, visit(item[key])])
    );
  };
  return JSON.stringify(visit(value));
}

export function hashObject(value) {
  return crypto.createHash("sha256").update(stableStringify(value)).digest("hex");
}

export function sanitizeObject(value) {
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (
          /^(?:apiKey|key|token|secret|password|authorization|pat)$/i.test(key) ||
          /_(?:KEY|TOKEN|SECRET|PASSWORD|PAT)$/i.test(key)
        ) {
          return [key, "<REDACTED>"];
        }
        return [key, sanitizeObject(item)];
      })
    );
  }
  return typeof value === "string" ? sanitizeText(value) : value;
}

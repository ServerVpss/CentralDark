#!/usr/bin/env node
import crypto from "node:crypto";

const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "<REDACTED_PRIVATE_KEY>"],
  [/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, "Bearer <REDACTED>"],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "<REDACTED_GITHUB_PAT>"],
  [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "<REDACTED_GITHUB_TOKEN>"],
  [/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g, "<REDACTED_JWT>"],
  [/\bAKIA[0-9A-Z]{16}\b/g, "<REDACTED_AWS_KEY>"],
  [/\bxox(?:b|p|a|r|s)-[A-Za-z0-9-]{10,}\b/g, "<REDACTED_SLACK_TOKEN>"],
  [/\bxapp-[A-Za-z0-9-]{10,}\b/g, "<REDACTED_SLACK_TOKEN>"],
  [/\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{12,}\b/g, "<REDACTED_STRIPE_KEY>"],
  [/\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/g, "<REDACTED_TELEGRAM_TOKEN>"],
  [/\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s/@:]+:[^\s/@]+@[^\s]+/gi, "<REDACTED_CONNECTION_STRING>"],
  [/\b(?:sk|rk|pk)-(?:proj-)?[A-Za-z0-9_-]{12,}\b/g, "<REDACTED_KEY>"],
  [/\b(api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|password|authorization|connection[_-]?string)\s*[:=]\s*["']?[^\s"']+/gi, "$1=<REDACTED>"],
];

export function sanitizeText(value, maxLength = 4000) {
  let text = value == null ? "" : String(value);
  for (const [pattern, replacement] of SECRET_PATTERNS) text = text.replace(pattern, replacement);
  text = text.replace(/\u0000/g, "");
  if (text.length > maxLength) text = `${text.slice(0, maxLength)}\n...[truncado]`;
  return text;
}

export function singleLineField(value, fallback = "", maxLength = 500) {
  const clean = sanitizeText(value == null || value === "" ? fallback : value, maxLength)
    .replace(/[\r\n\u2028\u2029]+/g, " ")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean || String(fallback || "").replace(/[\r\n]+/g, " ").trim();
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
    return Object.fromEntries(Object.keys(item).sort().map((key) => [key, visit(item[key])]));
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
        const secretKey = /^(?:apiKey|key|token|secret|password|authorization|connectionString)$/i.test(key)
          || /_(?:KEY|TOKEN|SECRET|PASSWORD|AUTHORIZATION|CONNECTION_STRING)$/i.test(key)
          || /(?:ApiKey|AccessToken|RefreshToken|Token|Secret|Password|Authorization|ConnectionString)$/i.test(key);
        if (secretKey) return [key, "<REDACTED>"];
        return [key, sanitizeObject(item)];
      })
    );
  }
  return typeof value === "string" ? sanitizeText(value) : value;
}

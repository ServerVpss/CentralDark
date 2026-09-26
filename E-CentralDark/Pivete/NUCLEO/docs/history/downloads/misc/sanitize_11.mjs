#!/usr/bin/env node
import crypto from "node:crypto";

const SECRET_PATTERNS = [
  [/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, "Bearer <REDACTED>"],
  [/\b(?:sk|rk|pk)-[A-Za-z0-9_-]{12,}\b/g, "<REDACTED_KEY>"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "<REDACTED_GITHUB_TOKEN>"],
  [/\bAKIA[0-9A-Z]{16}\b/g, "<REDACTED_AWS_KEY>"],
  [/\b(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*["']?[^\s"']+/gi, "$1=<REDACTED>"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "<REDACTED_PRIVATE_KEY>"],
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
        if (/^(?:apiKey|key|token|secret|password|authorization)$/i.test(key) || /_(?:KEY|TOKEN|SECRET|PASSWORD)$/i.test(key)) return [key, "<REDACTED>"];
        return [key, sanitizeObject(item)];
      })
    );
  }
  return typeof value === "string" ? sanitizeText(value) : value;
}

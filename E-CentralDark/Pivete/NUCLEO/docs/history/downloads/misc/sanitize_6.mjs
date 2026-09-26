import crypto from "node:crypto";

const SECRET_PATTERNS = [
  [/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z0-9 ]*PRIVATE KEY-----/g, "<REDACTED_PRIVATE_KEY>"],
  [/\bAKIA[A-Z0-9]{16}\b/g, "<REDACTED_AWS_ACCESS_KEY>"],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "<REDACTED_GITHUB_PAT>"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "<REDACTED_GITHUB_TOKEN>"],
  [/\bsk-[A-Za-z0-9_-]{16,}\b/g, "<REDACTED_API_KEY>"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, "<REDACTED_SLACK_TOKEN>"],
  [/\b(?:sk_live|rk_live)_[A-Za-z0-9]{12,}\b/g, "<REDACTED_STRIPE_KEY>"],
  [/\b\d{8,12}:[A-Za-z0-9_-]{20,}\b/g, "<REDACTED_TELEGRAM_TOKEN>"],
  [/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "<REDACTED_JWT>"],
  [/(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s]+/gi, "<REDACTED_CONNECTION_STRING>"],
  [/(authorization\s*[:=]\s*(?:bearer\s+)?)[^\s,;]+/gi, "$1<REDACTED>"],
  [/((?:api[_-]?key|token|secret|password|centraldarkApiKey|githubAccessToken|dbPassword)\s*[:=]\s*)["']?[^\s,"'}]+/gi, "$1<REDACTED>"],
];

/**
 * LEIGO: remove chaves e tokens antes de qualquer texto sair em log, recibo ou resposta.
 * PROFISSIONAL: aplica redaction determinística em credenciais conhecidas e limita o tamanho da saída.
 */
export function sanitizeText(value, maxChars = 20000) {
  let text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  for (const [pattern, replacement] of SECRET_PATTERNS) text = text.replace(pattern, replacement);
  return text.slice(0, maxChars);
}

/**
 * LEIGO: limpa todos os campos de um objeto sem alterar o objeto original.
 * PROFISSIONAL: serializa, redige segredos e desserializa para produzir uma cópia segura para telemetria.
 */
export function sanitizeObject(value) {
  return JSON.parse(sanitizeText(JSON.stringify(value ?? null), 2_000_000));
}

/**
 * LEIGO: cria uma impressão digital do conteúdo para comparar sem revelar o conteúdo.
 * PROFISSIONAL: calcula SHA-256 sobre string ou JSON canônico simples.
 */
export function sha256(value) {
  const raw = typeof value === "string" || Buffer.isBuffer(value) ? value : JSON.stringify(value);
  return crypto.createHash("sha256").update(raw).digest("hex");
}

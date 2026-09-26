const secretKey = /(api[-_ ]?key|token|secret|password|authorization|cookie)/i;
const tokenShape = /\b(sk-[a-zA-Z0-9_-]{12,}|gh[pousr]_[a-zA-Z0-9]{20,}|Bearer\s+[a-zA-Z0-9._-]{12,})\b/g;

export function redact(value: unknown, key = ""): unknown {
  if (secretKey.test(key)) return "[REDACTED]";
  if (typeof value === "string") return value.replace(tokenShape, "[REDACTED]");
  if (Array.isArray(value)) return value.map((entry) => redact(entry));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => [
        nestedKey,
        redact(nestedValue, nestedKey),
      ]),
    );
  }
  return value;
}

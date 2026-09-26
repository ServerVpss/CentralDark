const SECRET_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi,
  /(token|secret|password|senha|cookie|authorization)\s*[:=]\s*[^\s,;]+/gi,
  /(apikey|api_key|client_secret)\s*[:=]\s*[^\s,;]+/gi,
];

export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';

  let output = input.trim();

  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, '[REDACTED]');
  }

  return output;
}

export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[^0-9+]/g, '').slice(0, 32);
}

export function sanitizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => sanitizeText(tag).slice(0, 40))
    .filter(Boolean)
    .slice(0, 20);
}

export function toSafeLogPayload(payload: unknown): unknown {
  if (payload == null) return payload;

  if (typeof payload === 'string') return sanitizeText(payload);
  if (typeof payload === 'number' || typeof payload === 'boolean') return payload;

  if (Array.isArray(payload)) {
    return payload.map((item) => toSafeLogPayload(item));
  }

  if (typeof payload === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('senha') ||
        lowerKey.includes('cookie') ||
        lowerKey.includes('authorization')
      ) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = toSafeLogPayload(value);
      }
    }

    return result;
  }

  return '[UNSUPPORTED]';
}

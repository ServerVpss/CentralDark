const PROVIDERS = [
  ['grok', /\b(?:grok|xai)\b/i],
  ['groq', /\bgroq\b/i],
  ['openai', /\b(?:openai|gpt-[\w.-]+)\b/i],
  ['anthropic', /\b(?:anthropic|claude)\b/i],
  ['google', /\b(?:google|gemini)\b/i],
  ['lovable', /\blovable\b/i],
];

const EXHAUSTED = /\b(?:insufficient[_ -]?quota|quota[_ -]?exceeded|credits?\s+(?:exhausted|depleted|ended)|billing[_ -]?hard[_ -]?limit)\b/i;
const RATE_LIMIT = /\b(?:rate[_ -]?limit(?:ed|_exceeded)?|too many requests|http\s*429|status\s*429)\b/i;
const BILLING_BLOCK = /\b(?:payment required|http\s*402|status\s*402)\b/i;
const REMAINING_PERCENT = /\b(?:remaining|restante|left)\b[^\d%]{0,20}(\d{1,3})\s*%/i;

export function sanitizarLinhaLog(value) {
  return String(value || '')
    .replace(/\bAuthorization\s*[:=]\s*Bearer\s+[^\s,;]+/ig, 'Authorization: Bearer <REDACTED>')
    .replace(/\b(api[_-]?key|token|secret|password|cookie|session)\s*[:=]\s*['"]?[^\s,'";]+/ig, '$1=<REDACTED>')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}(?:\.[A-Za-z0-9_-]{10,})?\b/g, '<JWT_REDACTED>')
    .replace(/\b(?:sk|xai|gsk|AIza)[-_A-Za-z0-9]{16,}\b/g, '<KEY_REDACTED>')
    .replace(/([?&](?:key|token|secret|signature|sig)=)[^&#\s]+/ig, '$1<REDACTED>')
    .slice(0, 240);
}

function detectarProvedor(line) {
  return PROVIDERS.find(([, pattern]) => pattern.test(line))?.[0] || 'desconhecido';
}

export function detectarEventoProvedor(value) {
  const line = sanitizarLinhaLog(value);
  const provider = detectarProvedor(line);
  const percentMatch = line.match(REMAINING_PERCENT);
  const percent = percentMatch ? Math.min(100, Number(percentMatch[1])) : null;

  let kind = null;
  let severity = 'warning';
  if (BILLING_BLOCK.test(line)) {
    kind = 'billing_blocked';
    severity = 'error';
  } else if (EXHAUSTED.test(line)) {
    kind = 'credits_exhausted';
    severity = 'error';
  } else if (percent !== null && percent <= 20) {
    kind = 'credits_low';
    severity = percent <= 5 ? 'error' : 'warning';
  } else if (RATE_LIMIT.test(line)) {
    kind = 'rate_limited';
  }

  if (!kind) return null;
  return {
    provider,
    kind,
    severity,
    remaining_percent: percent,
    fingerprint: `${provider}:${kind}:${percent ?? 'unknown'}`,
  };
}

export function detectarEventosProvedor(lines) {
  const unique = new Map();
  for (const line of lines) {
    const event = detectarEventoProvedor(line);
    if (event) unique.set(event.fingerprint, event);
  }
  return [...unique.values()];
}

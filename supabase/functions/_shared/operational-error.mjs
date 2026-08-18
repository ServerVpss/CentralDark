const SECRET_KEY_RE = /(token|secret|password|passwd|authorization|cookie|session|api[_-]?key|private[_-]?key|service[_-]?role)/i;
const SECRET_VALUE_RE = /(?:Bearer\s+\S+|gh[pousr]_[A-Za-z0-9]{10,}|sb_(?:secret|publishable)_[A-Za-z0-9_-]{10,}|sk-[A-Za-z0-9]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/ig;

function sanitizeText(value, max = 400) {
  return String(value ?? 'unknown')
    .replace(SECRET_VALUE_RE, '[REDACTED]')
    .slice(0, max);
}

function sanitizeEvidence(value, depth = 0) {
  if (depth > 6) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeEvidence(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      SECRET_KEY_RE.test(key) ? '[REDACTED]' : sanitizeEvidence(item, depth + 1),
    ]));
  }
  if (typeof value === 'string') return sanitizeText(value, 500);
  return value ?? null;
}

export function operationalError({
  component,
  owner,
  operation,
  stage,
  causeClass = 'UNCLASSIFIED',
  evidenceRef = null,
  error,
  retryable = false,
  autoRecoveryAttempted = false,
  nextMachineAction = 'STOP_AND_SURFACE_ERROR',
  humanBlocker = null,
}) {
  const human = humanBlocker && typeof humanBlocker === 'object'
    ? {
        FERIDA: sanitizeText(humanBlocker.FERIDA || humanBlocker.wound || ''),
        ONDE: sanitizeText(humanBlocker.ONDE || humanBlocker.location || ''),
        ACAO_HUMANA_MINIMA: sanitizeText(humanBlocker.ACAO_HUMANA_MINIMA || humanBlocker.action || ''),
      }
    : null;
  return {
    ERROR_ID: globalThis.crypto.randomUUID(),
    COMPONENT: sanitizeText(component, 120),
    OWNER: sanitizeText(owner, 200),
    OPERATION: sanitizeText(operation, 160),
    EXACT_STAGE: sanitizeText(stage, 160),
    CAUSE_CLASS: sanitizeText(causeClass, 120),
    EVIDENCE_REF: evidenceRef == null ? null : sanitizeEvidence(evidenceRef),
    SAFE_ERROR: sanitizeText(error instanceof Error ? error.message : error, 500),
    RETRYABLE: Boolean(retryable),
    AUTO_RECOVERY_ATTEMPTED: Boolean(autoRecoveryAttempted),
    NEXT_MACHINE_ACTION: sanitizeText(nextMachineAction, 240),
    ...(human ? { HUMAN_BLOCKER: human } : {}),
  };
}

export const __test = Object.freeze({ sanitizeEvidence, sanitizeText });

#!/usr/bin/env node

export function classifyLabels({ labels = [], canonical = new Set(), authorityAliases = new Set() }) {
  if (!(canonical instanceof Set) || canonical.size === 0) {
    return { status: 'BLOCK', reason: 'CATALOGO_CANONICO_VAZIO', canonicalPresent: [], invalid: [], authorityCompat: [] };
  }

  const normalized = labels.map((item) => String(item?.name ?? item ?? '')).filter(Boolean);
  const canonicalPresent = normalized.filter((label) => canonical.has(label));
  const invalid = normalized.filter((label) => !canonical.has(label) && !authorityAliases.has(label));
  const authorityCompat = normalized.filter((label) => authorityAliases.has(label));

  if (canonicalPresent.length === 0) {
    return { status: 'BLOCK', reason: 'SEM_LABEL_CANONICA', canonicalPresent, invalid, authorityCompat };
  }
  if (invalid.length > 0) {
    return { status: 'BLOCK', reason: 'LABEL_NAO_CANONICA', canonicalPresent, invalid, authorityCompat };
  }
  return { status: 'PASS', reason: null, canonicalPresent, invalid, authorityCompat };
}

export function labelsForDecision({ eventLabels = [], liveLabels = null, eventAction = '' }) {
  const converged = Array.isArray(liveLabels) ? liveLabels : null;
  if (eventAction === 'opened' && converged) return converged;
  return eventLabels;
}

export const DEPLOY_ACTION_CLASSES = new Set(['MICRO_DEPLOY', 'DEPLOY']);
export const PERMITO_SEGREDO_LABELS = new Set([
  '👑 PERMITO-SEGREDO',
  'permito-segredo',
  'PERMITO-SEGREDO',
]);

/**
 * Deterministic action-class gate for deploy authorization.
 *
 * The authority label proves who authorized; actionClass proves what is authorized.
 * A generic authority label is not converted into an unlimited permit.
 */
export function classifyAuthorityAction({
  labels = [],
  actionClass = '',
  intentAuthorized = false,
  target = '',
  rollbackReady = false,
}) {
  const normalizedAction = String(actionClass || '').trim().toUpperCase();
  if (!normalizedAction) {
    return { status: 'NOT_APPLICABLE', reason: null, actionClass: null, permit: null };
  }
  if (!DEPLOY_ACTION_CLASSES.has(normalizedAction)) {
    return { status: 'BLOCK', reason: 'ACTION_CLASS_NAO_SUPORTADA', actionClass: normalizedAction, permit: null };
  }

  const normalizedLabels = labels.map((item) => String(item?.name ?? item ?? '')).filter(Boolean);
  const authorityPresent = normalizedLabels.some((label) => PERMITO_SEGREDO_LABELS.has(label));
  if (!authorityPresent) {
    return { status: 'BLOCK', reason: 'SEM_PERMITO_SEGREDO', actionClass: normalizedAction, permit: null };
  }
  if (intentAuthorized !== true) {
    return { status: 'BLOCK', reason: 'INTENCAO_NAO_AUTORIZADA', actionClass: normalizedAction, permit: null };
  }
  if (!String(target || '').trim()) {
    return { status: 'BLOCK', reason: 'DEPLOY_TARGET_AUSENTE', actionClass: normalizedAction, permit: null };
  }
  if (rollbackReady !== true) {
    return { status: 'BLOCK', reason: 'ROLLBACK_NAO_PROVADO', actionClass: normalizedAction, permit: null };
  }

  return {
    status: 'PASS',
    reason: null,
    actionClass: normalizedAction,
    permit: `PERMITO-SEGREDO:${normalizedAction}`,
  };
}

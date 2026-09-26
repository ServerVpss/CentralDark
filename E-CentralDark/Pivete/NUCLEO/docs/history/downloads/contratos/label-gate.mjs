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

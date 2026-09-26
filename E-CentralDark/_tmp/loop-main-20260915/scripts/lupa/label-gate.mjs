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

export const LABEL_CLASSES = Object.freeze({
  PROMOTION: Object.freeze([
    '👑 PERMITO-SEGREDO',
    '🔄 GIT',
    '🤖 AUTO',
    '🟡 IA-PRECISA-REVISAR',
  ]),
  RESULT: Object.freeze([
    '🟢 SUCESSO',
    '✅ PR CONFIRMADO',
  ]),
  PROVENANCE: Object.freeze([
    '🧠 AGENTE-CHATGPT',
    '🧠 AGENTE-CLAUDE',
    '🧠 AGENTE-CODEX',
    '🧠 AGENTE-GROK',
    '🧠 AGENTE-HERMES',
    '🧠 AGENTE-JARVIS',
    '🧠 AGENTE-SENTINELA',
    '🧠 AGENTE-SUPABASE',
  ]),
  CAPABILITY: Object.freeze([
    '🤖 IA-DOCUMENTAR',
    '🤖 IA-EXECUTAR',
    '🤖 IA-FRONTEND',
    '🤖 IA-INFRA',
    '🤖 IA-PESQUISAR',
    '🤖 IA-REVISAR',
    '🤖 IA-VALIDAR',
    '🤖 AGENTIC-DEVOPS',
  ]),
  CATEGORY: Object.freeze([
    '✨ MELHORIA',
    '🐞 BUG',
    '📚 DOCS',
    '🎨 FRONTEND',
    '🛠️ INFRA',
    '🔐 SEGURANÇA',
    '🟢 SUPABASE',
    '🕸️ GRAPHIFY',
    '🔧 SELF-HEAL',
    '🧭 PAINEL',
  ]),
  STATUS: Object.freeze([
    '🔴 ERRO',
    '🔴 FALTA-EVIDÊNCIA',
    '🔴 PRIORIDADE-ALTA',
    '🔴 RISCO-SERVIDOR',
    '🟡 ATENÇÃO',
    '🟡 PENDÊNCIA',
    '🟡 PRIORIDADE-MÉDIA',
    '🟢 CORREÇÃO-SEGURA',
    '🟢 PRIORIDADE-BAIXA',
    '🟢 PRONTO-PARA-IA',
    '🧊 NÃO-FAZER',
    '🧊 PARADO',
    '🚫 INVÁLIDO',
    '❓ DÚVIDA',
    '🆘 AJUDA-NECESSÁRIA',
  ]),
  PACKAGE_OR_SPECIAL: Object.freeze([
    '🕊️ POMBO-CHECKSUM OBRIGATÓRIO DE PACOTE',
    'POMBO-CORREIO COM CHECKSUM',
    '🧩 DIVERGÊNCIA',
    '♻️ DUPLICADO',
    '🌱 BOM-PARA-INICIAR',
    'SUPERSEDED',
  ]),
  GENERIC_METADATA: Object.freeze([
    'dependencies',
    'javascript',
    'python',
    'skills',
    'codex',
    '🧠 CONSCIÊNCIA',
  ]),
});

export const AUTHORITY_ALIASES = Object.freeze({
  'permito-segredo': '👑 PERMITO-SEGREDO',
  SEGREDO: '👑 PERMITO-SEGREDO',
  'PERMITO-SEGREDO': '👑 PERMITO-SEGREDO',
});

export const FORBIDDEN_LABEL_EQUIVALENCES = Object.freeze([
  'PROVENANCE_AS_AUTHORITY',
  'STATUS_AS_PROOF',
  'RESULT_AS_PROMOTION_INPUT',
  'ALIAS_AS_CANONICAL_AUTHORITY_WITHOUT_NORMALIZATION',
  'UNKNOWN_LABEL_AS_PASS',
]);

export function normalizeLabel(label) {
  return String(label ?? '').trim();
}

export function labelKey(label) {
  return normalizeLabel(label).toLocaleLowerCase('pt-BR');
}

export function labelOperationalClass(label) {
  const normalized = normalizeLabel(label?.name ?? label);
  for (const [className, classLabels] of Object.entries(LABEL_CLASSES)) {
    if (classLabels.some((candidate) => labelKey(candidate) === labelKey(normalized))) {
      return className;
    }
  }
  const alias = Object.keys(AUTHORITY_ALIASES).find((candidate) => labelKey(candidate) === labelKey(normalized));
  return alias ? 'AUTHORITY_ALIAS' : 'UNKNOWN_CONSUMER';
}

export function classifyOperationalLabels(labels = []) {
  return labels.map((label) => {
    const name = normalizeLabel(label?.name ?? label);
    const operationalClass = labelOperationalClass(name);
    const alias = Object.keys(AUTHORITY_ALIASES).find((candidate) => labelKey(candidate) === labelKey(name));
    return {
      name,
      class: operationalClass,
      canonical: alias ? AUTHORITY_ALIASES[alias] : name,
    };
  });
}

export function auditPromotionLabels(labels = [], options = {}) {
  const classified = classifyOperationalLabels(labels);
  const names = new Set(classified.map((item) => labelKey(item.name)));
  const requiredPromotionLabels = options.requiredPromotionLabels ?? LABEL_CLASSES.PROMOTION;
  const missingPromotionLabels = requiredPromotionLabels.filter((label) => !names.has(labelKey(label)));
  const provenanceLabels = classified.filter((item) => item.class === 'PROVENANCE').map((item) => item.name);
  const unknownLabels = classified.filter((item) => item.class === 'UNKNOWN_CONSUMER').map((item) => item.name);
  const authorityAliases = classified.filter((item) => item.class === 'AUTHORITY_ALIAS').map((item) => item.name);
  const resultLabels = classified.filter((item) => item.class === 'RESULT').map((item) => item.name);
  const statusLabels = classified.filter((item) => item.class === 'STATUS').map((item) => item.name);
  const errors = [];
  const warnings = [];

  for (const label of missingPromotionLabels) {
    errors.push(`PROMOTION_LABEL_MISSING:${label}`);
  }

  for (const label of authorityAliases) warnings.push(`DUPLICATE_AUTHORITY_ALIAS:${label}`);
  for (const label of unknownLabels) warnings.push(`UNKNOWN_LABEL_CONSUMER:${label}`);
  if (provenanceLabels.length > 0) warnings.push('PROVENANCE_LABEL_OPTIONAL');
  if (resultLabels.length > 0 && !options.postMergeProof) warnings.push('RESULT_LABEL_NOT_PROMOTION_INPUT');
  if (statusLabels.length > 0 && !options.executionProof) warnings.push('STATUS_LABEL_NOT_PROOF');

  return {
    status: errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'UNKNOWN' : 'PASS',
    okForPromotionLabelSet: errors.length === 0,
    requiredPromotionLabels,
    missingPromotionLabels,
    classified,
    errors,
    warnings,
    forbiddenEquivalences: FORBIDDEN_LABEL_EQUIVALENCES,
  };
}

export function formatLabelAudit(audit) {
  return [
    `STATUS=${audit.status}`,
    `OK_FOR_PROMOTION_LABEL_SET=${audit.okForPromotionLabelSet}`,
    `MISSING=${audit.missingPromotionLabels.join('|') || 'NONE'}`,
    `ERRORS=${audit.errors.join('|') || 'NONE'}`,
    `WARNINGS=${audit.warnings.join('|') || 'NONE'}`,
  ].join('\n');
}

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

if (import.meta.url === `file://${process.argv[1]}`) {
  const audit = auditPromotionLabels(process.argv.slice(2));
  process.stdout.write(`${formatLabelAudit(audit)}\n`);
  process.exit(audit.status === 'FAIL' ? 1 : 0);
}

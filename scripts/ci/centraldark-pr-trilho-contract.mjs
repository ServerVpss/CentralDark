#!/usr/bin/env node

const DEFAULT_PR_MAE = '#1444';
const DEFAULT_ALLOWED_SCOPE_CLASSES = Object.freeze([
  'SITE_FIRST',
  'AUTH_CONNECTORS',
  'DEPLOY_PIPELINE',
  'HERMES_BRIDGE',
  'LABEL_GATE',
  'PR_GOVERNANCE',
  'REMOTE_BRIDGE',
  'RUNTIME_OBSERVATION',
  'EXTERNAL_CAPABILITY_INTAKE',
  'DOCUMENTATION_ONLY',
]);

const REQUIRED_BODY_PATTERNS = Object.freeze([
  ['PR_TRILHO_INTENT', /(?:^|\n)#{1,3}\s*(?:🧿\s*)?(?:INTEN[ÇC][ÃA]O|CHEFE_INTENT|INTENT)\b/iu],
  ['PR_TRILHO_PR_MAE_REF', /(?:Refs?|PR_M[ÃA]E|PR_MAE|RENDEZVOUS)\s*#1444\b/iu],
  ['PR_TRILHO_MISSION_ID', /(?:MISSION_ID|MISS[ÃA]O|MISSION)\s*[:=]/iu],
  ['PR_TRILHO_OWNER', /(?:OWNER|DONO|ESCOPO_OWNER)\s*[:=]/iu],
  ['PR_TRILHO_WRITER', /(?:WRITER|AGENTE|CANETA|EXECUTOR)\s*[:=]/iu],
  ['PR_TRILHO_SCOPE', /(?:SCOPE|ESCOPO|SCOPE_CLASS)\s*[:=]/iu],
  ['PR_TRILHO_LIVE_STATE', /(?:LIVE_STATE|ESTADO_VIVO|CURRENT_STATE)\s*[:=]/iu],
  ['PR_TRILHO_EVIDENCE', /(?:EVID[ÊE]NCIA|EVIDENCE|PROVADO|TEST PLAN|TESTE)\s*[:=]?/iu],
  ['PR_TRILHO_COUNTERPROOF', /(?:COUNTERPROOF|CONTRAPROVA)\s*[:=]?/iu],
  ['PR_TRILHO_BLOCKERS', /(?:BLOCKERS?|BLOQUEIOS?|UNKNOWN|EVID[ÊE]NCIA_FALTANTE|PEND[ÊE]NCIA)\s*[:=]?/iu],
  ['PR_TRILHO_NEXT_CURSOR', /(?:NEXT_CURSOR|PR[ÓO]XIMO PASSO|NEXT STEP)\s*[:=]/iu],
]);

export function normalizeBody(value) {
  return String(value ?? '').trim();
}

export function extractMarker(body, name) {
  const text = normalizeBody(body);
  const pattern = new RegExp(`(?:^|\\n)${name}\\s*[:=]\\s*(.+?)(?:\\n|$)`, 'iu');
  return pattern.exec(text)?.[1]?.trim() ?? null;
}

export function extractScopeClass(body) {
  const explicit = extractMarker(body, 'SCOPE_CLASS');
  const scope = explicit ?? extractMarker(body, 'SCOPE') ?? extractMarker(body, 'ESCOPO');
  if (!scope) return null;
  const token = String(scope).trim().split(/[\s,;|]+/)[0];
  return token.toUpperCase();
}

export function validatePrTrilho(input = {}) {
  const title = String(input.title ?? '').trim();
  const body = normalizeBody(input.body);
  const files = Array.isArray(input.files) ? input.files.filter(Boolean).map(String) : [];
  const allowedScopeClasses = input.allowedScopeClasses ?? DEFAULT_ALLOWED_SCOPE_CLASSES;
  const prMae = input.prMae ?? DEFAULT_PR_MAE;
  const errors = [];
  const warnings = [];

  if (!title) errors.push('PR_TRILHO_TITLE_EMPTY');
  if (!body) {
    errors.push('PR_TRILHO_BODY_EMPTY');
    return { ok: false, errors, warnings, scopeClass: null, files };
  }

  for (const [code, pattern] of REQUIRED_BODY_PATTERNS) {
    if (!pattern.test(body)) errors.push(`${code}_MISSING`);
  }

  if (!body.includes(prMae)) errors.push('PR_TRILHO_NOT_LINKED_TO_PR_MAE');

  const scopeClass = extractScopeClass(body);
  if (!scopeClass) {
    errors.push('PR_TRILHO_SCOPE_CLASS_MISSING');
  } else if (!allowedScopeClasses.includes(scopeClass)) {
    errors.push(`PR_TRILHO_SCOPE_CLASS_UNKNOWN:${scopeClass}`);
  }

  if (/UNKNOWN\s*=\s*PASS|UNKNOWN_IS_PASS/iu.test(body)) errors.push('PR_TRILHO_UNKNOWN_AS_PASS_FORBIDDEN');
  if (/DOCUMENTED\s*=\s*EXECUTED|DOCUMENTADO\s*=\s*EXECUTADO/iu.test(body)) errors.push('PR_TRILHO_DOCUMENTED_AS_EXECUTED_FORBIDDEN');
  if (/MERGED\s*=\s*DEPLOYED|MERGEADO\s*=\s*DEPLOYADO/iu.test(body)) errors.push('PR_TRILHO_MERGED_AS_DEPLOYED_FORBIDDEN');
  if (/CREATE_V2\s*=\s*true|V2|V3|V4/iu.test(body) && !/GAP_PROVADO|NECESSIDADE_COMPROVADA/iu.test(body)) {
    errors.push('PR_TRILHO_PARALLEL_VERSION_FORBIDDEN_WITHOUT_PROVEN_GAP');
  }

  const mentionsSite = /\b(site|deploy|artifact|artefato|http|dom[ií]nio)\b/iu.test(body);
  const mentionsCasa = mentionsSite || /\b(casa|remote desktop|runtime local|hermes|workdir|processo local)\b/iu.test(body);
  if (mentionsSite && !/PROVAR_SITE\s*!=\s*PROVAR_CASA|SITE\s*!=\s*CASA|CASA\s*!=\s*SITE/iu.test(body)) {
    warnings.push('PR_TRILHO_SITE_CASA_DISTINCTION_NOT_EXPLICIT');
  }
  if (mentionsCasa && !/PROVAR_CASA\s*!=\s*PROVAR_SITE|CASA\s*!=\s*SITE|SITE\s*!=\s*CASA/iu.test(body)) {
    warnings.push('PR_TRILHO_CASA_SITE_DISTINCTION_NOT_EXPLICIT');
  }

  if (files.length === 0 && !/(ARQUIVOS?|FILES?)\s*[:=]/iu.test(body)) {
    errors.push('PR_TRILHO_FILES_CONTEXT_MISSING');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    scopeClass,
    files,
  };
}

export function formatPrTrilhoReport(result) {
  return [
    result.ok ? 'PASS: CENTRALDARK_PR_TRILHO_CONTRACT' : 'FAIL: CENTRALDARK_PR_TRILHO_CONTRACT',
    `SCOPE_CLASS=${result.scopeClass ?? 'UNKNOWN'}`,
    `ERRORS=${result.errors.join('|') || 'NONE'}`,
    `WARNINGS=${result.warnings.join('|') || 'NONE'}`,
  ].join('\n');
}

function main() {
  const result = validatePrTrilho({
    title: process.env.PR_TITLE ?? '',
    body: process.env.PR_BODY ?? '',
    files: (process.env.PR_FILES ?? '').split('\n').filter(Boolean),
  });
  const output = formatPrTrilhoReport(result);
  if (result.ok) console.log(output);
  else console.error(output);
  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

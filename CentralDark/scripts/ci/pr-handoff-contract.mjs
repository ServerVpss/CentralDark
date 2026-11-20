#!/usr/bin/env node

const REQUIRED_SECTION_PATTERNS = [
  ['PR_HANDOFF_INTENT', /(?:^|\n)#{1,3}\s*(?:🧿\s*)?(?:INTEN[ÇC][ÃA]O|INTENT|PR_HANDOFF)/iu],
  ['PR_HANDOFF_REFS', /(?:Refs?|Issue|Issues)\s+#\d+/iu],
  ['PR_HANDOFF_AGENT_OR_WRITER', /(?:AGENTE|AGENT|WRITER|CANETA|OWNER|EXECUTOR)\s*[:=]/iu],
  ['PR_HANDOFF_FILES_OR_COMMITS', /(?:ARQUIVOS?|FILES?|COMMITS?|HEAD|SHA)\s*[:=]/iu],
  ['PR_HANDOFF_PROOF', /(?:PROVADO|PROOF|EVID[ÊE]NCIA|TEST PLAN|TESTE|CHECKS?)\s*[:=]?/iu],
  ['PR_HANDOFF_BLOCKERS', /(?:QUEBRADO|BLOCKED|BLOQUEIO|EVID[ÊE]NCIA_FALTANTE|UNKNOWN|PEND[ÊE]NCIA)\s*[:=]?/iu],
  ['PR_HANDOFF_NEXT_CURSOR', /(?:NEXT_CURSOR|PR[ÓO]XIMO PASSO|NEXT STEP)\s*[:=]/iu],
];

export function validatePrHandoff({ title = '', body = '', files = [] } = {}) {
  const errors = [];
  const warnings = [];
  const normalizedTitle = String(title).trim();
  const normalizedBody = String(body).trim();

  if (!normalizedTitle) {
    errors.push('PR_HANDOFF_TITLE_EMPTY');
  }

  if (!normalizedBody) {
    errors.push('PR_HANDOFF_BODY_EMPTY');
    return { ok: false, errors, warnings };
  }

  for (const [code, pattern] of REQUIRED_SECTION_PATTERNS) {
    if (!pattern.test(normalizedBody)) {
      errors.push(`${code}_MISSING`);
    }
  }

  if (/MERGED\s*=\s*true/i.test(normalizedBody) && !/DEPLOYED\s*!=\s*MERGED|MERGED\s*!=\s*DEPLOYED/i.test(normalizedBody)) {
    warnings.push('PR_HANDOFF_MERGED_DEPLOYED_DISTINCTION_NOT_EXPLICIT');
  }

  if (/UNKNOWN\s*=\s*PASS|UNKNOWN_IS_PASS/i.test(normalizedBody)) {
    errors.push('PR_HANDOFF_UNKNOWN_AS_PASS_FORBIDDEN');
  }

  if (/DOCUMENTED\s*=\s*EXECUTED|DOCUMENTADO\s*=\s*EXECUTADO/i.test(normalizedBody)) {
    errors.push('PR_HANDOFF_DOCUMENTED_AS_EXECUTED_FORBIDDEN');
  }

  const fileList = Array.isArray(files) ? files.filter(Boolean).map(String) : [];
  if (fileList.length === 0 && !/(ARQUIVOS?|FILES?)\s*[:=]/iu.test(normalizedBody)) {
    errors.push('PR_HANDOFF_NO_FILES_CONTEXT');
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function formatHandoffReport(result) {
  const lines = [];
  lines.push(result.ok ? 'PASS: PR handoff contract.' : 'FAIL: PR handoff contract.');
  for (const error of result.errors) lines.push(`ERROR: ${error}`);
  for (const warning of result.warnings) lines.push(`WARN: ${warning}`);
  return lines.join('\n');
}

function main() {
  const result = validatePrHandoff({
    title: process.env.PR_TITLE ?? '',
    body: process.env.PR_BODY ?? '',
    files: (process.env.PR_FILES ?? '').split('\n').filter(Boolean),
  });

  console.log(formatHandoffReport(result));
  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

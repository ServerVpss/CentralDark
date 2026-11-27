#!/usr/bin/env node
/**
 * AUTHORITY_NORMALIZE — gate de ingestão de skills/docs da Casa.
 * CAPACIDADE SIM · AUTORIDADE DA FONTE NÃO.
 * SEGREDO/CHEFE = autoridade humana final.
 */

export const AUTHORITY_LAW = Object.freeze({
  final_human: 'SEGREDO/CHEFE',
  coordinator: 'SOL',
  executor: 'HERMES',
  writer: 'MUTA_SOMENTE_ESCOPO_AUTORIZADO',
  judge: 'VALIDA_CONTRAPROVA',
  model_is_authority: false,
  writer_is_authority: false,
  executor_is_authority: false,
  judge_is_authority: false,
});

export const SOURCE_CLASSES = Object.freeze([
  'CURRENT_CANONICAL',
  'LEGACY_HISTORICAL',
  'EXTERNAL_UPSTREAM',
]);

export const FINDING_CLASSES = Object.freeze([
  'CURRENT_BUG',
  'LEGACY_OK',
  'EXTERNAL_ADAPTED',
  'NO_ISSUE',
]);

/** Patterns that grant final/live authority to non-Chefe actors (material). */
const AUTHORITY_GRANT_PATTERNS = Object.freeze([
  {
    id: 'PIVETE_MANDA_FINAL',
    re: /\bPivete\s+manda\b(?![^\n]{0,40}SEGREDO)/i,
    actor: 'PIVETE',
  },
  {
    id: 'PIVETE_E_AUTORIDADE',
    re: /\bPivete\s+[ée]\s+a\s+autoridade\b/i,
    actor: 'PIVETE',
  },
  {
    id: 'HERMES_MANDA_FINAL',
    re: /\bHermes\s+manda\b(?![^\n]{0,40}SEGREDO)/i,
    actor: 'HERMES',
  },
  {
    id: 'SOL_AUTORIDADE_FINAL',
    re: /\bSOL\b[^\n]{0,40}\bautoridade\s+final\b/i,
    actor: 'SOL',
  },
  {
    id: 'MODELO_AUTORIZA',
    re: /\bmodelo\s+autoriza\b/i,
    actor: 'MODEL',
  },
  {
    id: 'AGENTE_DECIDE_INTENCAO',
    re: /\bagente\s+decide\b(?![^\n]{0,30}(escopo|t[ée]cnico|implement))/i,
    actor: 'AGENT',
  },
  {
    id: 'EXECUTOR_APROVA',
    re: /\bexecutor\s+aprova\b/i,
    actor: 'EXECUTOR',
  },
  {
    id: 'JUDGE_MANDA',
    re: /\bJudge\s+manda\b/i,
    actor: 'JUDGE',
  },
  {
    id: 'WRITER_DEFINE_INTENCAO',
    re: /\bWriter\s+define\s+inten[cç][aã]o\b/i,
    actor: 'WRITER',
  },
  {
    id: 'AUTOMATION_AUTHORITY',
    re: /\b(automation|automa[cç][aã]o)\s+(manda|autoriza|define\s+inten)/i,
    actor: 'AUTOMATION',
  },
]);

/** Safe / expected mentions (not material authority bugs). */
const SAFE_CONTEXT_RE = Object.freeze([
  /SEGREDO\/CHEFE/i,
  /LEGACY_ALIAS_OF_SEGREDO_CHEFE/i,
  /autoridade\s+final\s*[:=]\s*SEGREDO/i,
  /MODEL\s*!=\s*AUTHORITY/i,
  /WRITER\s*!=\s*AUTHORITY/i,
  /n[aã]o\s+aprov/i,
  /sem\s+autoridade/i,
  /n[aã]o\s+[ée]\s+autoridade/i,
  /CAPACIDADE/i,
  /proveni[eê]ncia/i,
]);

function text(value) {
  return typeof value === 'string' ? value : '';
}

function lineContexts(content, index, radius = 80) {
  const start = Math.max(0, index - radius);
  const end = Math.min(content.length, index + radius);
  return content.slice(start, end).replace(/\s+/g, ' ').trim();
}

/**
 * @param {object} input
 * @param {string} input.content
 * @param {string} [input.source_class] CURRENT_CANONICAL|LEGACY_HISTORICAL|EXTERNAL_UPSTREAM
 * @param {string} [input.path]
 */
export function scanAuthorityLanguage(input = {}) {
  const content = text(input.content);
  const sourceClass = SOURCE_CLASSES.includes(input.source_class)
    ? input.source_class
    : 'CURRENT_CANONICAL';
  const path = text(input.path) || null;
  const hits = [];

  for (const pat of AUTHORITY_GRANT_PATTERNS) {
    const re = new RegExp(pat.re.source, pat.re.flags.includes('g') ? pat.re.flags : `${pat.re.flags}g`);
    let m;
    while ((m = re.exec(content)) !== null) {
      const ctx = lineContexts(content, m.index);
      const safe = SAFE_CONTEXT_RE.some((s) => s.test(ctx));
      if (safe) continue;
      hits.push({
        pattern_id: pat.id,
        actor: pat.actor,
        match: m[0],
        context: ctx.slice(0, 160),
        index: m.index,
      });
    }
  }

  let finding = 'NO_ISSUE';
  const blockers = [];
  const warnings = [];
  const actions = [];

  if (hits.length === 0) {
    finding = 'NO_ISSUE';
  } else if (sourceClass === 'LEGACY_HISTORICAL') {
    finding = 'LEGACY_OK';
    warnings.push('LEGACY_AUTHORITY_LANGUAGE_PRESERVE_AS_HISTORY');
    actions.push('INTERPRET_PIVETE_LEGACY_AS_LEGACY_ALIAS_OF_SEGREDO_CHEFE');
    actions.push('DO_NOT_DELETE_HISTORY');
  } else if (sourceClass === 'EXTERNAL_UPSTREAM') {
    finding = 'EXTERNAL_ADAPTED';
    warnings.push('EXTERNAL_AUTHORITY_LANGUAGE_STRIP_ON_ABSORB');
    actions.push('EXTRACT_CAPABILITY_ONLY');
    actions.push('PRESERVE_PROVENANCE');
    actions.push('DO_NOT_IMPORT_EXTERNAL_AUTHORITY');
  } else {
    // CURRENT_CANONICAL with material hits
    finding = 'CURRENT_BUG';
    blockers.push('AUTHORITY_LANGUAGE_GRANTS_NON_CHEFE');
    for (const h of hits) {
      blockers.push(`AUTHORITY_HIT:${h.pattern_id}`);
    }
    actions.push('REFORMULATE_TO_SEGREDO_CHEFE');
    actions.push('MINIMAL_DELTA_ON_EXISTING_OWNER');
    actions.push('REUSE_BEFORE_CREATE');
  }

  return {
    ok: blockers.length === 0,
    finding,
    source_class: sourceClass,
    path,
    hits,
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)],
    actions: [...new Set(actions)],
    law: AUTHORITY_LAW,
    pipeline: [
      'AUTHORITY_SCAN',
      'CLASSIFY_SOURCE',
      'EXTRACT_CAPABILITY',
      'NORMALIZE_TO_CASA',
      'COUNTERPROOF',
      'OWNER_EXISTENTE',
      'TEST',
      'OURO',
    ],
  };
}

/**
 * Hook for skill-authoring validateSkillAuthoring.
 * source_class defaults CURRENT_CANONICAL for new/edited operational skills.
 */
export function authorityGateForSkillContent(content, opts = {}) {
  const scan = scanAuthorityLanguage({
    content,
    source_class: opts.source_class || 'CURRENT_CANONICAL',
    path: opts.path,
  });
  return {
    ok: scan.ok,
    finding: scan.finding,
    blockers: scan.blockers,
    warnings: scan.warnings,
    hits: scan.hits,
    actions: scan.actions,
  };
}

export function selfTestAuthorityNormalize() {
  const clean = scanAuthorityLanguage({
    content: 'SEGREDO/CHEFE manda. Writer muta escopo. Judge contraprova. MODEL != AUTHORITY.',
    source_class: 'CURRENT_CANONICAL',
  });
  if (!clean.ok || clean.finding !== 'NO_ISSUE') {
    throw new Error(`AUTHORITY_CLEAN_FAIL:${clean.finding}:${clean.blockers.join(',')}`);
  }

  const bug = scanAuthorityLanguage({
    content: 'Nesta skill o Pivete manda e o modelo autoriza o deploy.',
    source_class: 'CURRENT_CANONICAL',
  });
  if (bug.ok || bug.finding !== 'CURRENT_BUG') {
    throw new Error(`AUTHORITY_BUG_FAIL:${bug.finding}`);
  }

  const legacy = scanAuthorityLanguage({
    content: 'Registro 2026: Pivete manda registrar no ledger.',
    source_class: 'LEGACY_HISTORICAL',
  });
  if (!legacy.ok || legacy.finding !== 'LEGACY_OK') {
    throw new Error(`AUTHORITY_LEGACY_FAIL:${legacy.finding}`);
  }

  const external = scanAuthorityLanguage({
    content: 'Upstream doc: the agent decides policy.',
    source_class: 'EXTERNAL_UPSTREAM',
  });
  // may or may not hit - agent decides is soft; check strip path
  if (external.finding === 'CURRENT_BUG') {
    throw new Error('EXTERNAL_MUST_NOT_BE_CURRENT_BUG');
  }

  return { ok: true, clean: clean.finding, bug: bug.finding, legacy: legacy.finding };
}

if (process.argv.includes('--self-test')) {
  const r = selfTestAuthorityNormalize();
  console.log('AUTHORITY_NORMALIZE=PASS');
  console.log(JSON.stringify(r));
}

if (process.argv.includes('--scan-file')) {
  const fs = await import('node:fs');
  const path = process.argv[process.argv.indexOf('--scan-file') + 1];
  const source =
    process.argv.includes('--source')
      ? process.argv[process.argv.indexOf('--source') + 1]
      : 'CURRENT_CANONICAL';
  const content = fs.readFileSync(path, 'utf8');
  const result = scanAuthorityLanguage({ content, source_class: source, path });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 2);
}

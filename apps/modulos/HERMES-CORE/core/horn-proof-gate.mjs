const normalizeAtom = (value) => String(value ?? '').trim().toUpperCase();

const uniqueSorted = (values) => [...new Set(values)].sort();

export const HORN_PROOF_LOCK = Object.freeze({
  id: 'SECTOR_HORN_LOGIC_PROOF',
  version: 1,
  authority: 'SEGREDO/CHEFE',
  soul: 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md',
  cognitive_dna: 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md',
  mental_lock: 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/HORN-COGNITIVE-LOCK.md',
  sector: 'docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/SETORES/LOGICA-E-PROVA/README.md',
  source: 'docs/BRAIN/03-DOCUMENTACAO/02-BIBLIOTECA/SETORES/LOGICA-E-PROVA/SOURCE-CC2003-LOGICA-COMPUTACIONAL-23.md',
  source_sha256: 'b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1',
  method: 'FINITE_PROPOSITIONAL_HORN_FORWARD_CHAINING_TO_FIXED_POINT',
  library_gate_required: true,
  cognitive_gate_required: true,
  unknown_is_false: false,
  unmarked_is_false: false,
  contradiction_is_pass: false,
  reality_is_judge: true,
});

function normalizeRule(rule, index) {
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
    throw new Error(`HORN_RULE_INVALID:${index}`);
  }
  const bodyRaw = rule.if ?? rule.body ?? [];
  if (!Array.isArray(bodyRaw)) throw new Error(`HORN_RULE_BODY_MUST_BE_ARRAY:${index}`);
  const body = uniqueSorted(bodyRaw.map(normalizeAtom).filter(Boolean));
  const rawHead = Object.hasOwn(rule, 'then') ? rule.then : rule.head;
  const contradiction = rawHead === null || rawHead === false || normalizeAtom(rawHead) === 'FALSE';
  const head = contradiction ? null : normalizeAtom(rawHead);
  if (!contradiction && !head) throw new Error(`HORN_RULE_HEAD_REQUIRED:${index}`);
  return Object.freeze({
    id: String(rule.id ?? `rule-${index + 1}`).trim() || `rule-${index + 1}`,
    body: Object.freeze(body),
    head,
    contradiction,
  });
}

export function computeHornClosure({ facts = [], rules = [] } = {}) {
  if (!Array.isArray(facts)) throw new Error('HORN_FACTS_MUST_BE_ARRAY');
  if (!Array.isArray(rules)) throw new Error('HORN_RULES_MUST_BE_ARRAY');

  const normalizedRules = rules.map(normalizeRule);
  const marked = new Set(facts.map(normalizeAtom).filter(Boolean));
  const derivations = [];
  let contradiction = null;
  let iterations = 0;

  const possibleNewHeads = new Set(normalizedRules.map((rule) => rule.head).filter(Boolean));
  const hardLimit = Math.max(1, marked.size + possibleNewHeads.size + normalizedRules.length + 1);

  while (!contradiction) {
    let changed = false;
    iterations += 1;
    if (iterations > hardLimit) throw new Error('HORN_FIXED_POINT_LIMIT_EXCEEDED');

    for (const rule of normalizedRules) {
      if (!rule.body.every((atom) => marked.has(atom))) continue;

      if (rule.contradiction) {
        contradiction = Object.freeze({
          rule_id: rule.id,
          body: rule.body,
          reason: 'NEGATIVE_HORN_CLAUSE_FORCED_FALSE',
        });
        break;
      }

      if (!marked.has(rule.head)) {
        marked.add(rule.head);
        derivations.push(Object.freeze({
          rule_id: rule.id,
          body: rule.body,
          head: rule.head,
        }));
        changed = true;
      }
    }

    if (contradiction || !changed) break;
  }

  return Object.freeze({
    schema_version: 1,
    method: HORN_PROOF_LOCK.method,
    state: contradiction ? 'CONTRADICTION' : 'FIXED_POINT',
    satisfiable_under_rules: !contradiction,
    fixed_point: !contradiction,
    marked: Object.freeze(uniqueSorted([...marked])),
    derivations: Object.freeze(derivations),
    contradiction,
    iterations,
    unknown_is_false: false,
  });
}

export function evaluateHornGoal({ facts = [], rules = [], goal } = {}) {
  const normalizedGoal = normalizeAtom(goal);
  if (!normalizedGoal) throw new Error('HORN_GOAL_REQUIRED');
  const closure = computeHornClosure({ facts, rules });

  if (closure.contradiction) {
    return Object.freeze({
      state: 'CONTRADICTION',
      proven: false,
      false_proven: true,
      goal: normalizedGoal,
      closure,
    });
  }

  if (closure.marked.includes(normalizedGoal)) {
    return Object.freeze({
      state: 'PROVEN',
      proven: true,
      false_proven: false,
      goal: normalizedGoal,
      closure,
    });
  }

  return Object.freeze({
    state: 'UNKNOWN',
    proven: false,
    false_proven: false,
    goal: normalizedGoal,
    closure,
  });
}

export function calculateClosedDenominatorCoverage({ covered = [], denominator = [] } = {}) {
  const universe = uniqueSorted((Array.isArray(denominator) ? denominator : []).map(normalizeAtom).filter(Boolean));
  const observed = new Set((Array.isArray(covered) ? covered : []).map(normalizeAtom).filter(Boolean));
  const hit = universe.filter((item) => observed.has(item));
  const missing = universe.filter((item) => !observed.has(item));
  const ratio = universe.length === 0 ? null : hit.length / universe.length;
  return Object.freeze({
    covered: Object.freeze(hit),
    missing: Object.freeze(missing),
    numerator: hit.length,
    denominator: universe.length,
    ratio,
    percent: ratio === null ? null : ratio * 100,
    closed_denominator: universe.length > 0,
  });
}

export function runPdfHornConformance() {
  const checks = [];

  // PDF: p ∧ ¬q ∧ (q ∨ ¬p). Em Horn: fato p; p -> q; q -> F.
  const unsat = computeHornClosure({
    facts: ['p'],
    rules: [
      { id: 'pdf-p-implies-q', if: ['p'], then: 'q' },
      { id: 'pdf-not-q', if: ['q'], then: null },
    ],
  });
  checks.push(Object.freeze({ id: 'PDF_NEGATIVE_CLAUSE_CONTRADICTION', pass: unsat.state === 'CONTRADICTION' }));

  const positive = evaluateHornGoal({
    facts: ['p'],
    rules: [
      { id: 'p-q', if: ['p'], then: 'q' },
      { id: 'q-r', if: ['q'], then: 'r' },
    ],
    goal: 'r',
  });
  checks.push(Object.freeze({ id: 'PDF_FORWARD_PROPAGATION', pass: positive.state === 'PROVEN' }));

  const unknown = evaluateHornGoal({
    facts: ['p'],
    rules: [{ id: 'p-q', if: ['p'], then: 'q' }],
    goal: 's',
  });
  checks.push(Object.freeze({ id: 'PDF_UNMARKED_IS_NOT_FALSE', pass: unknown.state === 'UNKNOWN' && unknown.false_proven === false }));

  const fixed = computeHornClosure({
    facts: ['p'],
    rules: [{ id: 'p-q', if: ['p'], then: 'q' }],
  });
  checks.push(Object.freeze({ id: 'PDF_STOPS_AT_FIXED_POINT', pass: fixed.state === 'FIXED_POINT' && fixed.marked.includes('Q') }));

  const passed = checks.filter((check) => check.pass).length;
  const coverage = calculateClosedDenominatorCoverage({
    covered: checks.filter((check) => check.pass).map((check) => check.id),
    denominator: checks.map((check) => check.id),
  });

  return Object.freeze({
    source_sha256: HORN_PROOF_LOCK.source_sha256,
    checks: Object.freeze(checks),
    passed,
    total: checks.length,
    conformance_percent: coverage.percent,
    status: passed === checks.length ? 'PASS' : 'FAIL',
    scope: 'FINITE_PROPOSITIONAL_HORN_BEHAVIOR_TESTED_FROM_PDF_EXAMPLES_AND_RULES',
    universal_correctness_claim: false,
  });
}

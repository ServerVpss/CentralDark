import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const contract = JSON.parse(
  readFileSync(
    new URL('../../docs/CONSCIENCIA/CONTRATO-DISSONANCIA-OPERACIONAL-CONTROLADA.json', import.meta.url),
    'utf8',
  ),
);
const cases = readFileSync(
  new URL('../../.agents/skills/meta-lupa/references/casos.md', import.meta.url),
  'utf8',
);

const requiredTrue = [
  'CONTROLLED_DISSONANCE',
  'SYNTHETIC_CONFLICT',
  'ISOLATED',
  'REVERSIBLE',
  'OBSERVABLE',
  'FALSIFIABLE',
  'NON_CANONICAL',
  'ZERO_DEPLOY',
  'SYNTHETIC_CONFLICT_IS_NOT_EVIDENCE',
  'SURVIVING_CONFLICT_IS_NOT_PASS',
  'PROVEN_DELTA_IS_CANDIDATE_CRYSTAL',
  'REGRESSION_PROTECTED_IS_CRYSTAL',
  'ONE_WRITER_PER_SCOPE',
  'REALITY_IS_JUDGE',
];

for (const key of requiredTrue) {
  assert.equal(contract.invariants[key], true, `${key} deve permanecer true`);
}

assert.equal(contract.invariants.FAKE_EVIDENCE, false, 'evidência sintética não pode virar evidência real');
assert.equal(contract.invariants.CANONICAL_CONTAMINATION, 'BLOCK');
assert.equal(contract.invariants.NO_INFORMATION_GAIN, 'NO_CHANGE');
assert.match(cases, /Caso I — Dissonância Operacional Controlada/);
assert.match(cases, /CANONICAL_CONTAMINATION=BLOCK/);

const runControlledDissonance = ({ canonical, perturb, informationGain, counterproof, regression }) => {
  const canonicalBefore = structuredClone(canonical);
  const isolated = structuredClone(canonical);
  perturb(isolated);

  const syntheticDiffers = JSON.stringify(isolated) !== JSON.stringify(canonicalBefore);
  assert.equal(syntheticDiffers, true, 'a perturbação precisa ser discriminante');
  assert.deepEqual(canonical, canonicalBefore, 'a perturbação não pode contaminar o canônico');

  if (!informationGain) return 'RESISTANCE_EVIDENCE_ONLY';
  if (!counterproof) return 'CANDIDATE_ONLY';
  if (!regression) return 'UNPROVEN_CRYSTAL';
  return 'CRYSTAL';
};

const canonical = Object.freeze({ owner: 'meta-lupa', writer: 'one', deploy: false });

assert.equal(
  runControlledDissonance({
    canonical,
    perturb: (copy) => { copy.writer = 'two'; },
    informationGain: false,
    counterproof: false,
    regression: false,
  }),
  'RESISTANCE_EVIDENCE_ONLY',
);

assert.equal(
  runControlledDissonance({
    canonical,
    perturb: (copy) => { copy.owner = 'wrong-owner'; },
    informationGain: true,
    counterproof: false,
    regression: false,
  }),
  'CANDIDATE_ONLY',
);

assert.equal(
  runControlledDissonance({
    canonical,
    perturb: (copy) => { copy.deploy = true; },
    informationGain: true,
    counterproof: true,
    regression: false,
  }),
  'UNPROVEN_CRYSTAL',
);

assert.equal(
  runControlledDissonance({
    canonical,
    perturb: (copy) => { copy.writer = 'collision'; },
    informationGain: true,
    counterproof: true,
    regression: true,
  }),
  'CRYSTAL',
);

assert.deepEqual(canonical, { owner: 'meta-lupa', writer: 'one', deploy: false });
console.log('controlled-dissonance: PASS');


// COGNITIVE_MIRROR_DECISION_IMPACT_V1
// O teste exercita o impacto decisorio explicitamente rotulado.
// Nao alega compreender a semantica de linguagem natural automaticamente.
function auditDecisionImpact({original,paraphrase,originalDecision,interpretedDecision}) {
  assert.equal(typeof original, 'string');
  assert.equal(typeof paraphrase, 'string');
  assert.ok(original.trim() && paraphrase.trim(), 'preservar expressoes separadamente');
  if (typeof originalDecision !== 'string' || typeof interpretedDecision !== 'string') {
    return { status:'UNKNOWN', semanticFidelity:'NOT_AUTO_VERIFIED' };
  }
  return {
    status: originalDecision === interpretedDecision
      ? 'SAME_DECISION_NOT_SEMANTIC_PROOF'
      : 'DIFFERENT_DECISION_REQUIRES_OBSERVED_IMPACT',
    semanticFidelity:'NOT_AUTO_VERIFIED',
  };
}
const abstractPair = auditDecisionImpact({
  original:'A AutoLupa também precisa examinar se a própria IA está distorcendo o pensamento que deveria externalizar.',
  paraphrase:'A AutoLupa precisa auditar também a fidelidade da própria IA ao pensamento que recebeu.',
});
assert.equal(abstractPair.status,'UNKNOWN');
const adminPair = auditDecisionImpact({
  original:'Admin CentralDark mostra Instinto Superior; Rakazo fica interno.',
  paraphrase:'Admin CentralDark mostra Rakazo como aplicação principal.',
  originalDecision:'admin.centralldark.com -> instinto-superior:25812',
  interpretedDecision:'admin.centralldark.com -> rakazo:25810',
});
assert.equal(adminPair.status,'DIFFERENT_DECISION_REQUIRES_OBSERVED_IMPACT');
const benignPair = auditDecisionImpact({
  original:'TelePainel é um módulo do Portal.',
  paraphrase:'O Portal contém o módulo TelePainel.',
  originalDecision:'/telepainel/dashboard',
  interpretedDecision:'/telepainel/dashboard',
});
assert.equal(benignPair.status,'SAME_DECISION_NOT_SEMANTIC_PROOF');
assert.equal(benignPair.semanticFidelity,'NOT_AUTO_VERIFIED');
const missingAction = auditDecisionImpact({
  original:'Admin é Instinto Superior.',
  paraphrase:'O Admin concentra as ferramentas.',
  originalDecision:'instinto-superior:25812',
});
assert.equal(missingAction.status,'UNKNOWN');
console.log('cognitive-mirror-decision-impact: PASS (controlled fixtures, no causal claim)');

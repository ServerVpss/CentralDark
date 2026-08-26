const freezeRecords = (items) => Object.freeze(items.map((item) => Object.freeze({ ...item })));

export const COGNITIVE_LENSES = Object.freeze({
  AUTOMATION_FACTORY: Object.freeze({
    id: 'AUTOMATION_FACTORY',
    purpose: 'Pressionar automacao, loops, escala, repeticao removivel e fabrica de software sem confundir velocidade com prova.',
  }),
  STRUCTURAL_SKEPTIC: Object.freeze({
    id: 'STRUCTURAL_SKEPTIC',
    purpose: 'Atacar premissas, causalidade, desenho estrutural, exagero e explicacoes que nao sobrevivem a contraprova.',
  }),
  HUMAN_AGENT_COORDINATION: Object.freeze({
    id: 'HUMAN_AGENT_COORDINATION',
    purpose: 'Preservar intencao humana, contexto, handoff, escopo, Writer e divisao correta entre humano, agente e ferramenta.',
  }),
  OBSERVABILITY_PROOF: Object.freeze({
    id: 'OBSERVABILITY_PROOF',
    purpose: 'Exigir estado observavel, runtime, receipts, denominador, teste discriminante e bloquear falso verde.',
  }),
  SYNTHESIS_RECONCILIATION: Object.freeze({
    id: 'SYNTHESIS_RECONCILIATION',
    purpose: 'Deduplicar perspectivas, reconciliar conflitos, comprimir sem perda e devolver somente delta material.',
  }),
  IDENTITY_TRUST: Object.freeze({
    id: 'IDENTITY_TRUST',
    purpose: 'Atacar identidade, autorizacao, trust chain, proveniencia, fronteira de instrucao e elevacao indevida de privilegio.',
  }),
});

export const CORE_ATTACK_COVERAGE = Object.freeze({
  AUTOMATION_FACTORY: Object.freeze(['B_IMPLEMENTATION', 'D_SIMPLIFICATION']),
  STRUCTURAL_SKEPTIC: Object.freeze(['A_LOGIC', 'C_REGRESSION_FALSE_GREEN']),
  HUMAN_AGENT_COORDINATION: Object.freeze(['B_IMPLEMENTATION']),
  OBSERVABILITY_PROOF: Object.freeze(['C_REGRESSION_FALSE_GREEN']),
  SYNTHESIS_RECONCILIATION: Object.freeze(['A_LOGIC', 'D_SIMPLIFICATION']),
  IDENTITY_TRUST: Object.freeze(['A_LOGIC', 'C_REGRESSION_FALSE_GREEN']),
});

export const CORE_ATTACK_IDS = Object.freeze([
  'A_LOGIC',
  'B_IMPLEMENTATION',
  'C_REGRESSION_FALSE_GREEN',
  'D_SIMPLIFICATION',
]);

const candidate = (id, label, lenses) => Object.freeze({
  id,
  label,
  lenses: Object.freeze([...lenses]),
  source: 'PR#1104',
  source_state: 'HISTORICAL_CANDIDATE',
  mapping_class: 'INFERENCE_MAPPING_2026_08_22',
  promotion: 'CANDIDATE_NOT_PROOF',
});

export const CANDIDATE_POOL_PR_1104 = Object.freeze([
  candidate('A01_TRANSFERENCIA_ESTRUTURA', 'Transferencia por Estrutura', ['SYNTHESIS_RECONCILIATION', 'HUMAN_AGENT_COORDINATION']),
  candidate('A02_DEDUCAO_INDUCAO_ABDUCAO', 'Deducao/Inducao/Abducao', ['STRUCTURAL_SKEPTIC', 'SYNTHESIS_RECONCILIATION']),
  candidate('A03_PROFUNDIDADE_ADAPTATIVA', 'Profundidade Adaptativa', ['STRUCTURAL_SKEPTIC', 'SYNTHESIS_RECONCILIATION']),
  candidate('A04_BACKTRACKING', 'Backtracking/Reavaliacao', ['STRUCTURAL_SKEPTIC']),
  candidate('A05_GENERALIZACAO_HOLDOUT', 'Generalizacao/Holdout', ['STRUCTURAL_SKEPTIC', 'OBSERVABILITY_PROOF']),
  candidate('A06_RECIBO_APRENDIZADO', 'Recibo Estruturado de Aprendizado', ['OBSERVABILITY_PROOF']),
  candidate('A07_PROMOCAO_EXPERIENCIA', 'Promocao de Experiencia Provada', ['OBSERVABILITY_PROOF', 'SYNTHESIS_RECONCILIATION']),
  candidate('A08_QUALITY_GATE_CONHECIMENTO', 'Quality Gate de Conhecimento', ['OBSERVABILITY_PROOF', 'STRUCTURAL_SKEPTIC']),
  candidate('A09_VERSIONAMENTO_TEMPORAL', 'Versionamento Temporal', ['OBSERVABILITY_PROOF']),
  candidate('A10_PONTE_PEDAGOGICA', 'Ponte Pedagogica com Invariancia', ['SYNTHESIS_RECONCILIATION', 'HUMAN_AGENT_COORDINATION']),

  candidate('B01_DETERMINISTICO_ANTES_LLM', 'Deterministico antes do LLM', ['STRUCTURAL_SKEPTIC', 'OBSERVABILITY_PROOF', 'AUTOMATION_FACTORY']),
  candidate('B02_VIZINHANCA_GRAFO', 'Vizinhanca de Grafo', ['SYNTHESIS_RECONCILIATION']),
  candidate('B03_ARQUITETO_EXECUTOR', 'Arquiteto-Executor', ['HUMAN_AGENT_COORDINATION']),
  candidate('B04_MENOR_MOTOR_SUFICIENTE', 'Menor Motor Suficiente', ['SYNTHESIS_RECONCILIATION', 'STRUCTURAL_SKEPTIC', 'AUTOMATION_FACTORY']),
  candidate('B05_ORCAMENTO_CONTEXTO', 'Orcamento de Contexto', ['SYNTHESIS_RECONCILIATION']),
  candidate('B06_FRONTEIRA_LLM_FERRAMENTA', 'Fronteira LLM-Ferramenta', ['HUMAN_AGENT_COORDINATION', 'OBSERVABILITY_PROOF', 'IDENTITY_TRUST']),
  candidate('B07_MICROTAREFAS_CONTINUIDADE', 'Microtarefas com Continuidade', ['HUMAN_AGENT_COORDINATION', 'AUTOMATION_FACTORY']),
  candidate('B08_ISOLAMENTO_DEPENDENCIAS', 'Isolamento de Dependencias', ['STRUCTURAL_SKEPTIC', 'IDENTITY_TRUST']),
  candidate('B09_TRANSPORTE_FORA_BANDA', 'Transporte Fora de Banda', ['HUMAN_AGENT_COORDINATION', 'IDENTITY_TRUST']),
  candidate('B10_ISOLAMENTO_MIDDLEBOX', 'Isolamento de Middlebox por Protocolo', ['IDENTITY_TRUST', 'STRUCTURAL_SKEPTIC']),

  candidate('C01_DADO_NAO_INSTRUCAO', 'Dado != Instrucao', ['IDENTITY_TRUST', 'STRUCTURAL_SKEPTIC']),
  candidate('C02_RECIBO_PRE_INGESTAO', 'Recibo Pre-Ingestao', ['OBSERVABILITY_PROOF', 'IDENTITY_TRUST']),
  candidate('C03_QUARENTENA_SENSIVEL', 'Quarentena Sensivel', ['IDENTITY_TRUST']),
  candidate('C04_PROVENIENCIA_FORENSE', 'Proveniencia Forense', ['OBSERVABILITY_PROOF', 'IDENTITY_TRUST']),
  candidate('C05_GATE_FALSO_VERDE', 'Gate de Falso Verde', ['OBSERVABILITY_PROOF', 'STRUCTURAL_SKEPTIC']),
  candidate('C06_ROLLBACK_VERIFICAVEL', 'Rollback Verificavel', ['OBSERVABILITY_PROOF', 'STRUCTURAL_SKEPTIC']),
  candidate('C07_QUARENTENA_TEMPORAL', 'Quarentena Temporal', ['IDENTITY_TRUST', 'OBSERVABILITY_PROOF']),
  candidate('C08_DEDUPE_ESPELHO', 'Dedupe de Espelho', ['SYNTHESIS_RECONCILIATION', 'OBSERVABILITY_PROOF']),
  candidate('C09_VALIDACAO_DETERMINISTICA_SAIDA', 'Validacao Deterministica de Saida', ['OBSERVABILITY_PROOF', 'STRUCTURAL_SKEPTIC']),
  candidate('C10_RED_TEAM_FRONTEIRA', 'Red Teaming com Fronteira Defensiva', ['STRUCTURAL_SKEPTIC', 'IDENTITY_TRUST']),
]);

export const CURRENT_TECHNICAL_CAPABILITIES = freezeRecords([
  {
    name: 'Memory Linker',
    state: 'CURRENT_TECHNICAL_NAME_PRESERVED',
    lenses: ['SYNTHESIS_RECONCILIATION', 'OBSERVABILITY_PROOF'],
  },
  {
    name: 'Dream Review',
    state: 'CURRENT_TECHNICAL_NAME_PRESERVED',
    lenses: ['SYNTHESIS_RECONCILIATION', 'STRUCTURAL_SKEPTIC'],
  },
  {
    name: 'Pattern Discovery',
    state: 'CURRENT_TECHNICAL_NAME_PRESERVED',
    lenses: ['SYNTHESIS_RECONCILIATION', 'OBSERVABILITY_PROOF'],
  },
  {
    name: 'Continuity Guard',
    state: 'CURRENT_TECHNICAL_NAME_PRESERVED',
    lenses: ['IDENTITY_TRUST', 'OBSERVABILITY_PROOF'],
  },
]);

const LENS_IDS = Object.freeze(Object.keys(COGNITIVE_LENSES));
const CANDIDATE_BY_ID = new Map(CANDIDATE_POOL_PR_1104.map((item) => [item.id, item]));
const TERMINAL_SUCCESS = new Set(['RESOLVED', 'NOT_APPLICABLE']);
const GAP_STATES = new Set(['OPEN', 'UNKNOWN', 'RESOLVED', 'BLOCKED', 'NOT_APPLICABLE']);

function normalize(value) {
  return String(value ?? '').trim();
}

function sortedUnique(values) {
  return [...new Set(values)].sort();
}

function assertKnownLens(lens) {
  if (!LENS_IDS.includes(lens)) throw new Error(`COGNITIVE_LENS_UNKNOWN:${lens}`);
}

export function createSourceProfile({
  source_id,
  display_name,
  lenses = [],
  provenance_refs = [],
  observed_claims = [],
  source_state = 'USER_SUPPLIED_OR_EXTERNAL_UNVERIFIED',
} = {}) {
  const id = normalize(source_id);
  const name = normalize(display_name);
  if (!id) throw new Error('SOURCE_PROFILE_ID_REQUIRED');
  if (!name) throw new Error('SOURCE_PROFILE_NAME_REQUIRED');
  const normalizedLenses = sortedUnique((Array.isArray(lenses) ? lenses : []).map(normalize).filter(Boolean));
  normalizedLenses.forEach(assertKnownLens);
  return Object.freeze({
    source_id: id,
    display_name: name,
    lenses: Object.freeze(normalizedLenses),
    provenance_refs: Object.freeze(sortedUnique((Array.isArray(provenance_refs) ? provenance_refs : []).map(normalize).filter(Boolean))),
    observed_claims: Object.freeze((Array.isArray(observed_claims) ? observed_claims : []).map(normalize).filter(Boolean)),
    source_state: normalize(source_state) || 'USER_SUPPLIED_OR_EXTERNAL_UNVERIFIED',
    authority: false,
    writer: false,
    persona_clone: false,
    vote_weight: 0,
  });
}

export function validateSourceProfile(profile) {
  const errors = [];
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return { ok: false, errors: ['SOURCE_PROFILE_INVALID'] };
  if (!normalize(profile.source_id)) errors.push('SOURCE_PROFILE_ID_REQUIRED');
  if (!normalize(profile.display_name)) errors.push('SOURCE_PROFILE_NAME_REQUIRED');
  if (profile.authority !== false) errors.push('SOURCE_PROFILE_AUTHORITY_FORBIDDEN');
  if (profile.writer !== false) errors.push('SOURCE_PROFILE_WRITER_FORBIDDEN');
  if (profile.persona_clone !== false) errors.push('SOURCE_PROFILE_PERSONA_CLONE_FORBIDDEN');
  if (Number(profile.vote_weight ?? 0) !== 0) errors.push('SOURCE_PROFILE_VOTE_WEIGHT_FORBIDDEN');
  for (const lens of Array.isArray(profile.lenses) ? profile.lenses : []) {
    if (!LENS_IDS.includes(lens)) errors.push(`SOURCE_PROFILE_LENS_UNKNOWN:${lens}`);
  }
  return { ok: errors.length === 0, errors };
}

export function buildCognitiveCouncilPlan({
  requested_lenses = [],
  candidate_ids = [],
  source_profiles = [],
  include_all_candidates = false,
} = {}) {
  const selectedCandidates = include_all_candidates
    ? [...CANDIDATE_POOL_PR_1104]
    : (Array.isArray(candidate_ids) ? candidate_ids : []).map((id) => {
      const key = normalize(id);
      const found = CANDIDATE_BY_ID.get(key);
      if (!found) throw new Error(`COGNITIVE_CANDIDATE_UNKNOWN:${key}`);
      return found;
    });

  const profiles = (Array.isArray(source_profiles) ? source_profiles : []).map((profile) => {
    const validation = validateSourceProfile(profile);
    if (!validation.ok) throw new Error(validation.errors[0]);
    return profile;
  });

  const lensSet = new Set((Array.isArray(requested_lenses) ? requested_lenses : []).map(normalize).filter(Boolean));
  for (const item of selectedCandidates) item.lenses.forEach((lens) => lensSet.add(lens));
  for (const profile of profiles) profile.lenses.forEach((lens) => lensSet.add(lens));

  // O plano completo custa zero chamadas extras: as seis lentes sao comprimidas
  // nos quatro ataques deterministas ja existentes da perception-orchestra.
  if (lensSet.size === 0) LENS_IDS.forEach((lens) => lensSet.add(lens));
  const lenses = sortedUnique([...lensSet]);
  lenses.forEach(assertKnownLens);

  const coverage = lenses.map((lens) => Object.freeze({
    lens,
    purpose: COGNITIVE_LENSES[lens].purpose,
    covered_by_core_attacks: CORE_ATTACK_COVERAGE[lens],
    read_only: true,
    authority: false,
    writer: false,
  }));
  const executionAttacks = sortedUnique(coverage.flatMap((item) => item.covered_by_core_attacks));
  const uncovered = coverage.filter((item) => item.covered_by_core_attacks.length === 0).map((item) => item.lens);
  if (uncovered.length) throw new Error(`COGNITIVE_COUNCIL_UNCOVERED:${uncovered.join(',')}`);

  return Object.freeze({
    schema_version: 1,
    mode: 'FUNCTIONAL_LENSES_OVER_EXISTING_PERCEPTION_ORCHESTRA',
    human_name: 'MESA_DE_CONVERGENCIA',
    authority_plane: Object.freeze({
      final_authority: 'SEGREDO/CHEFE',
      coordinator: 'SOL',
      executor_continuity: 'PIVETE/HERMES',
      writer_rule: 'ONE_WRITER_PER_SCOPE',
      reality_is_judge: true,
    }),
    perception_plane: Object.freeze({
      lenses: Object.freeze(coverage),
      source_profiles: Object.freeze([...profiles]),
      source_profile_is_authority: false,
      source_profile_is_persona_clone: false,
      model_vote_is_truth: false,
      evidence_dedupe_required: true,
    }),
    candidate_pool: Object.freeze(selectedCandidates.map((item) => Object.freeze({
      id: item.id,
      label: item.label,
      lenses: item.lenses,
      source: item.source,
      source_state: item.source_state,
      mapping_class: item.mapping_class,
      promotion: item.promotion,
    }))),
    execution: Object.freeze({
      existing_core_attacks: Object.freeze(executionAttacks),
      existing_core_attack_count: CORE_ATTACK_IDS.length,
      lens_count: lenses.length,
      extra_writer_slots: 0,
      additional_model_calls_required_by_plan: false,
      direct_mutation: false,
    }),
  });
}

export function validateCognitiveCouncilPlan(plan) {
  const errors = [];
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return { ok: false, errors: ['COGNITIVE_COUNCIL_INVALID'] };
  if (plan.mode !== 'FUNCTIONAL_LENSES_OVER_EXISTING_PERCEPTION_ORCHESTRA') errors.push('COGNITIVE_COUNCIL_MODE_INVALID');
  if (plan?.authority_plane?.final_authority !== 'SEGREDO/CHEFE') errors.push('COGNITIVE_COUNCIL_AUTHORITY_DRIFT');
  if (plan?.authority_plane?.coordinator !== 'SOL') errors.push('COGNITIVE_COUNCIL_COORDINATOR_DRIFT');
  if (plan?.execution?.extra_writer_slots !== 0) errors.push('COGNITIVE_COUNCIL_EXTRA_WRITER_FORBIDDEN');
  if (plan?.execution?.direct_mutation !== false) errors.push('COGNITIVE_COUNCIL_DIRECT_MUTATION_FORBIDDEN');
  if (plan?.perception_plane?.model_vote_is_truth !== false) errors.push('COGNITIVE_COUNCIL_MODEL_VOTE_FORBIDDEN');
  if (plan?.perception_plane?.source_profile_is_authority !== false) errors.push('COGNITIVE_COUNCIL_SOURCE_AUTHORITY_FORBIDDEN');
  if (plan?.perception_plane?.source_profile_is_persona_clone !== false) errors.push('COGNITIVE_COUNCIL_PERSONA_CLONE_FORBIDDEN');

  const lensItems = Array.isArray(plan?.perception_plane?.lenses) ? plan.perception_plane.lenses : [];
  if (lensItems.length === 0) errors.push('COGNITIVE_COUNCIL_LENSES_REQUIRED');
  for (const item of lensItems) {
    if (!LENS_IDS.includes(item?.lens)) errors.push(`COGNITIVE_COUNCIL_LENS_UNKNOWN:${item?.lens}`);
    if (item?.read_only !== true) errors.push(`COGNITIVE_COUNCIL_LENS_NOT_READ_ONLY:${item?.lens}`);
    if (item?.authority !== false || item?.writer !== false) errors.push(`COGNITIVE_COUNCIL_LENS_PRIVILEGE_DRIFT:${item?.lens}`);
    if (!Array.isArray(item?.covered_by_core_attacks) || item.covered_by_core_attacks.length === 0) {
      errors.push(`COGNITIVE_COUNCIL_LENS_UNCOVERED:${item?.lens}`);
    } else if (item.covered_by_core_attacks.some((attack) => !CORE_ATTACK_IDS.includes(attack))) {
      errors.push(`COGNITIVE_COUNCIL_ATTACK_UNKNOWN:${item?.lens}`);
    }
  }

  for (const profile of Array.isArray(plan?.perception_plane?.source_profiles) ? plan.perception_plane.source_profiles : []) {
    const validation = validateSourceProfile(profile);
    errors.push(...validation.errors.map((error) => `${error}:${profile?.source_id || 'UNKNOWN'}`));
  }

  return { ok: errors.length === 0, errors: sortedUnique(errors) };
}

export function evaluateUsefulCeiling({
  gaps = [],
  new_information = false,
  material_delta_pending = false,
} = {}) {
  const normalizedGaps = (Array.isArray(gaps) ? gaps : []).map((gap, index) => ({
    id: normalize(gap?.id) || `gap-${index + 1}`,
    state: normalize(gap?.state).toUpperCase() || 'UNKNOWN',
    evidence_refs: sortedUnique((Array.isArray(gap?.evidence_refs) ? gap.evidence_refs : []).map(normalize).filter(Boolean)),
    cause: normalize(gap?.cause),
    owner: normalize(gap?.owner),
    next_condition: normalize(gap?.next_condition),
  }));

  const invalid = [];
  const unresolved = [];
  const blocked = [];

  for (const gap of normalizedGaps) {
    if (!GAP_STATES.has(gap.state)) {
      invalid.push(`${gap.id}:STATE_INVALID`);
      continue;
    }
    if (gap.state === 'RESOLVED' && gap.evidence_refs.length === 0) invalid.push(`${gap.id}:RESOLVED_WITHOUT_EVIDENCE`);
    if (gap.state === 'BLOCKED') {
      blocked.push(gap.id);
      if (!gap.cause) invalid.push(`${gap.id}:BLOCKED_WITHOUT_CAUSE`);
      if (!gap.owner) invalid.push(`${gap.id}:BLOCKED_WITHOUT_OWNER`);
      if (!gap.next_condition) invalid.push(`${gap.id}:BLOCKED_WITHOUT_NEXT_CONDITION`);
    }
    if (gap.state === 'OPEN' || gap.state === 'UNKNOWN') unresolved.push(gap.id);
  }

  const allSuccessfulTerminal = normalizedGaps.every((gap) => TERMINAL_SUCCESS.has(gap.state));
  const fixedPoint = invalid.length === 0
    && unresolved.length === 0
    && blocked.length === 0
    && !Boolean(new_information)
    && !Boolean(material_delta_pending)
    && allSuccessfulTerminal;
  const blockedBoundary = invalid.length === 0
    && unresolved.length === 0
    && blocked.length > 0
    && !Boolean(new_information)
    && !Boolean(material_delta_pending);

  let state = 'CONTINUE';
  let nextRule = 'CHASE_ONLY_MATERIAL_RESIDUAL';
  if (invalid.length > 0) {
    state = 'INVALID_RECEIPT';
    nextRule = 'FIX_GAP_RECEIPT_BEFORE_CLOSURE';
  } else if (fixedPoint) {
    state = 'FIXED_POINT';
    nextRule = 'STOP_NO_NEW_INFORMATION';
  } else if (blockedBoundary) {
    state = 'BLOCKED_AT_EXACT_BOUNDARY';
    nextRule = 'STOP_AND_WAIT_FOR_DECLARED_NEXT_CONDITION';
  }

  return Object.freeze({
    schema_version: 1,
    state,
    fixed_point: fixedPoint,
    blocked_boundary: blockedBoundary,
    useful_ceiling_reached: fixedPoint,
    new_information: Boolean(new_information),
    material_delta_pending: Boolean(material_delta_pending),
    unresolved_gaps: Object.freeze(unresolved),
    blocked_gaps: Object.freeze(blocked),
    invalid_receipts: Object.freeze(invalid),
    gaps: Object.freeze(normalizedGaps.map((gap) => Object.freeze(gap))),
    next_rule: nextRule,
  });
}

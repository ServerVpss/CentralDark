import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { isRepoRelativePath, validateProofOwnership } from "./proof-ownership.mjs";

const ROOT = resolve(process.cwd());
const CANONICAL_CONTRACT = resolve(ROOT, "docs/CONSCIENCIA/PROOF-OWNERSHIP.json");

const makeInvariant = (overrides = {}) => ({
  id: "AUTHORITY_RECEIPT_FROM_GITHUB_EVENT",
  proof_class: "authenticated_authority",
  source: "docs/CONSCIENCIA/02-PERMISSOES.md",
  consumer: ".github/workflows/porta-de-entrada.yml",
  prover: "scripts/lupa/authority-approval.mjs",
  negative_test: "scripts/lupa/authority-approval.test.mjs",
  counterproof: {
    kind: "negative_test_suite",
    path: "scripts/lupa/authority-approval.test.mjs",
    observation: "payloads sem autoridade devem falhar",
    independent_from_prover: true,
  },
  external_anchor: {
    kind: "github_event_label",
    event_field: "pull_request.labels",
    observation: "label observada no payload real do evento",
  },
  depends_on: [],
  ...overrides,
});

const baseContract = () => ({
  schema_version: 1,
  status: "CANONICAL",
  marker: "PROOF_OWNERSHIP_REQUIRED",
  coverage_status: "PARTIAL_EXPLICIT",
  scope: "TOPOLOGY_ONLY",
  global_rules: {
    self_validation_without_independent_counterproof: "UNPROVEN",
    circular_proof: "UNPROVEN",
    written_rule_without_consumer: "UNPROVEN",
    written_rule_without_prover: "UNPROVEN",
    prover_without_negative_test: "UNPROVEN",
    same_proof_class_multiple_owners: "BLOCKED_DUPLICATE_PROOF_OWNER",
    unregistered_invariant: "UNPROVEN_NOT_OWNED",
    proof_graph_must_be_acyclic: true,
    proof_must_end_in_external_anchor: true,
    graph_structure_ok_is_not_invariant_proof: true,
    external_anchor_must_be_observed_by_responsible_prover: true,
    execution_status_is_out_of_scope: true,
  },
  allowed_proof_classes: ["authenticated_authority", "runtime"],
  required_registered_invariants: ["AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"],
  unregistered_known_invariants: [
    { id: "IDENTITY_AUTHORITY_ACTIVE_SURFACES", status: "UNPROVEN_NOT_OWNED" },
    { id: "PROOF_OWNERSHIP_GRAPH_STRUCTURE", status: "UNPROVEN_NOT_OWNED" },
  ],
  invariants: [makeInvariant()],
});

const allExist = () => true;

function errorsFor(contract, exists = allExist) {
  return validateProofOwnership(contract, { exists }).errors;
}

function loadCanonicalContract() {
  return JSON.parse(readFileSync(CANONICAL_CONTRACT, "utf8"));
}

function validateOperationalClaimPolicy(contract) {
  const errors = [];
  const rules = contract?.global_rules ?? {};
  const policy = contract?.operational_claim_policy ?? {};
  const requiredRules = {
    operational_claim_requires_enforcement: true,
    operational_claim_without_complete_chain: "UNPROVEN",
    documented_is_executed: false,
    declared_is_enforced: false,
    configured_is_active: false,
    implemented_is_reachable: false,
    triggered_is_completed: false,
    completed_is_correct: false,
    historical_pass_is_current_pass: false,
    proof_target_must_match_claim: true,
    local_fixed_point_is_end_of_intent: false,
  };
  for (const [key, expected] of Object.entries(requiredRules)) {
    if (rules[key] !== expected) errors.push(`OPERATIONAL_RULE_INVALID:${key}`);
  }

  if (policy.marker !== "OPERATIONAL_CLAIM_REQUIRES_ENFORCEMENT") errors.push("OPERATIONAL_POLICY_MARKER_INVALID");
  if (policy.applies_to !== "CLAIMS_THAT_PRODUCE_OR_GOVERN_BEHAVIOR") errors.push("OPERATIONAL_POLICY_SCOPE_INVALID");
  if (policy.technology_lock !== false) errors.push("OPERATIONAL_POLICY_TECHNOLOGY_LOCK_FORBIDDEN");
  if (policy.enforcement_must_be_proportional !== true) errors.push("OPERATIONAL_POLICY_PROPORTIONAL_ENFORCEMENT_REQUIRED");
  if (policy.runtime_status_is_topology_proof !== false) errors.push("OPERATIONAL_POLICY_TOPOLOGY_IS_NOT_RUNTIME_PROOF");
  if (policy.live_state_must_be_measured !== true) errors.push("OPERATIONAL_POLICY_LIVE_STATE_REQUIRED");
  if (policy.monitoring_requires_real_mechanism !== true) errors.push("OPERATIONAL_POLICY_REAL_MONITOR_REQUIRED");
  if (policy.fixed_point_scope_required !== true) errors.push("OPERATIONAL_POLICY_SCOPED_FIXED_POINT_REQUIRED");
  if (policy.duplicate_only_when_same_authority_and_capability !== true) errors.push("OPERATIONAL_POLICY_DUPLICATE_RULE_INVALID");
  if (policy.preserve_layer_specific_implementations !== true) errors.push("OPERATIONAL_POLICY_LAYER_PRESERVATION_REQUIRED");

  const requiredChain = [
    "claim",
    "authority",
    "owner",
    "contract",
    "implementation_or_consumer",
    "enforcement",
    "execution",
    "observable_effect",
    "proof_target",
    "receipt",
    "counterproof",
    "live_state",
    "judge",
    "fixed_point_scope",
  ];
  if (!Array.isArray(policy.required_chain)) {
    errors.push("OPERATIONAL_POLICY_REQUIRED_CHAIN_MISSING");
  } else {
    for (const field of requiredChain) {
      if (!policy.required_chain.includes(field)) errors.push(`OPERATIONAL_POLICY_CHAIN_FIELD_MISSING:${field}`);
    }
  }

  const classifications = new Set(Array.isArray(policy.classifications) ? policy.classifications : []);
  for (const state of ["ENFORCED", "PARTIAL", "DOCUMENTATION_ONLY", "ORPHAN", "UNKNOWN", "NOT_APPLICABLE"]) {
    if (!classifications.has(state)) errors.push(`OPERATIONAL_POLICY_CLASSIFICATION_MISSING:${state}`);
  }

  const nonPass = new Set(Array.isArray(policy.non_pass_states) ? policy.non_pass_states : []);
  for (const state of ["UNKNOWN", "PENDING", "QUEUED", "SKIPPED", "CANCELLED"]) {
    if (!nonPass.has(state)) errors.push(`OPERATIONAL_POLICY_NON_PASS_STATE_MISSING:${state}`);
  }

  const profiles = policy.mechanism_profiles ?? {};
  for (const profile of [
    "CODE_RULE",
    "API_CONTRACT",
    "WORKFLOW",
    "DEPLOY",
    "PANEL",
    "ADMIN_DOCUMENTATION",
    "OPERATIONAL_MEMORY",
    "COMMAND",
    "SECURITY",
    "HUMAN_NON_AUTOMATABLE_RULE",
  ]) {
    if (!Array.isArray(profiles[profile]) || profiles[profile].length === 0) {
      errors.push(`OPERATIONAL_POLICY_MECHANISM_PROFILE_MISSING:${profile}`);
    }
  }

  const invariantFields = new Set(Array.isArray(contract?.required_fields_per_invariant) ? contract.required_fields_per_invariant : []);
  if (!invariantFields.has("operational_chain")) errors.push("OPERATIONAL_CHAIN_NOT_REQUIRED_PER_INVARIANT");

  for (const invariant of Array.isArray(contract?.invariants) ? contract.invariants : []) {
    const chain = invariant?.operational_chain;
    const id = String(invariant?.id ?? "UNKNOWN");
    if (!chain || typeof chain !== "object" || Array.isArray(chain)) {
      errors.push(`OPERATIONAL_CHAIN_MISSING:${id}`);
      continue;
    }
    for (const field of requiredChain) {
      if (typeof chain[field] !== "string" || chain[field].trim() === "") {
        errors.push(`OPERATIONAL_CHAIN_FIELD_INVALID:${id}:${field}`);
      }
    }
    if (chain.live_state !== "MEASURE_AT_RUNTIME") errors.push(`OPERATIONAL_CHAIN_STALE_STATE_FORBIDDEN:${id}`);
    if (chain.fixed_point_scope === "FIXED_POINT" || chain.fixed_point_scope === "MISSION" || chain.fixed_point_scope.trim() === "") {
      errors.push(`OPERATIONAL_CHAIN_FIXED_POINT_SCOPE_INVALID:${id}`);
    }
    if (chain.judge === invariant.prover) errors.push(`OPERATIONAL_CHAIN_WRITER_JUDGE_COLLISION:${id}`);
    if (chain.counterproof !== invariant.counterproof?.path) errors.push(`OPERATIONAL_CHAIN_COUNTERPROOF_MISMATCH:${id}`);

    for (const pathField of ["owner", "contract", "implementation_or_consumer", "enforcement", "receipt", "counterproof"]) {
      const path = chain[pathField];
      if (typeof path === "string" && isRepoRelativePath(path) && !existsSync(resolve(ROOT, path))) {
        errors.push(`OPERATIONAL_CHAIN_PATH_MISSING:${id}:${pathField}:${path}`);
      }
    }
  }

  return errors;
}

test("grafo válido passa somente como topologia parcial", () => {
  const result = validateProofOwnership(baseContract(), { exists: allExist });
  assert.equal(result.ok, true);
  assert.equal(result.topology_only, true);
  assert.equal(result.invariant_proof, false);
  assert.equal(result.coverage_status, "PARTIAL_EXPLICIT");
  assert.equal(result.unregistered_known_count, 2);
});

test("contrato inválido retorna shape determinístico", () => {
  const result = validateProofOwnership(null, { exists: allExist });
  assert.equal(result.ok, false);
  assert.deepEqual(result.proof_classes, []);
  assert.equal(result.invariant_count, 0);
  assert.equal(result.topology_only, true);
  assert.ok(result.errors.includes("PROOF_OWNERSHIP_CONTRACT_INVALID"));
});

test("cobertura FULL é falso verde e reprova", () => {
  const contract = baseContract();
  contract.coverage_status = "FULL";
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_COVERAGE_MUST_BE_PARTIAL_EXPLICIT"));
});

test("escopo diferente de TOPOLOGY_ONLY reprova", () => {
  const contract = baseContract();
  contract.scope = "INVARIANT_PROOF";
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_SCOPE_MUST_BE_TOPOLOGY_ONLY"));
});

test("classe livre não canônica reprova", () => {
  const contract = baseContract();
  contract.invariants[0].proof_class = "authenticated_authority_alias";
  assert.ok(errorsFor(contract).some((item) => item.startsWith("PROOF_OWNERSHIP_PROOF_CLASS_NOT_CANONICAL:")));
});

test("mesma responsabilidade com provadores diferentes reprova mesmo em classes diferentes", () => {
  const contract = baseContract();
  contract.invariants.push(makeInvariant({
    id: "B",
    proof_class: "runtime",
    prover: "scripts/lupa/outro-prover.mjs",
    negative_test: "scripts/lupa/outro-prover.test.mjs",
    counterproof: {
      kind: "negative_test_suite",
      path: "scripts/lupa/outro-prover.test.mjs",
      observation: "falso PASS deve falhar",
      independent_from_prover: true,
    },
  }));
  assert.ok(errorsFor(contract).some((item) => item.startsWith("PROOF_OWNERSHIP_DUPLICATE_RESPONSIBILITY:")));
});

test("source igual consumer reprova", () => {
  const contract = baseContract();
  contract.invariants[0].consumer = contract.invariants[0].source;
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_SOURCE_IS_CONSUMER:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("path não string reprova", () => {
  const contract = baseContract();
  contract.invariants[0].source = ["docs/CONSCIENCIA/02-PERMISSOES.md"];
  assert.ok(errorsFor(contract).some((item) => item.includes(":source") || item.startsWith("PROOF_OWNERSHIP_PATH_TYPE_INVALID:")));
});

test("path traversal reprova antes de consultar exists", () => {
  const contract = baseContract();
  contract.invariants[0].source = "../../etc/hosts";
  const calls = [];
  const result = validateProofOwnership(contract, { exists: (path) => { calls.push(path); return true; } });
  assert.ok(result.errors.some((item) => item.startsWith("PROOF_OWNERSHIP_PATH_OUTSIDE_REPO:")));
  assert.equal(calls.includes("../../etc/hosts"), false);
});

test("helper rejeita absolutos Windows Unix e traversal", () => {
  assert.equal(isRepoRelativePath("docs/x.md"), true);
  assert.equal(isRepoRelativePath("../x.md"), false);
  assert.equal(isRepoRelativePath("a/../../x.md"), false);
  assert.equal(isRepoRelativePath("/etc/hosts"), false);
  assert.equal(isRepoRelativePath("C:\\Windows\\system32"), false);
  assert.equal(isRepoRelativePath("\\\\server\\share"), false);
});

test("contraprova booleana sem artefato reprova", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof = true;
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_COUNTERPROOF_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("negative_test_suite precisa ser o negative_test executável", () => {
  const contract = baseContract();
  contract.invariants[0].counterproof.path = "AGENTS.md";
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_COUNTERPROOF_NOT_NEGATIVE_TEST:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("negative_test precisa ter nome de teste", () => {
  const contract = baseContract();
  contract.invariants[0].negative_test = "AGENTS.md";
  contract.invariants[0].counterproof.path = "AGENTS.md";
  assert.ok(errorsFor(contract).some((item) => item.startsWith("PROOF_OWNERSHIP_NEGATIVE_TEST_NOT_EXECUTABLE_TEST:")));
});

test("provador igual teste ou consumidor reprova", () => {
  const contractA = baseContract();
  contractA.invariants[0].negative_test = contractA.invariants[0].prover;
  contractA.invariants[0].counterproof.path = contractA.invariants[0].prover;
  assert.ok(errorsFor(contractA).includes("PROOF_OWNERSHIP_SELF_TEST:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));

  const contractB = baseContract();
  contractB.invariants[0].consumer = contractB.invariants[0].prover;
  assert.ok(errorsFor(contractB).includes("PROOF_OWNERSHIP_PROVER_IS_CONSUMER:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("âncora github exige event_field", () => {
  const contract = baseContract();
  delete contract.invariants[0].external_anchor.event_field;
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_EXTERNAL_EVENT_FIELD_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("depends_on é obrigatório e só aceita ids string", () => {
  const contractA = baseContract();
  delete contractA.invariants[0].depends_on;
  assert.ok(errorsFor(contractA).includes("PROOF_OWNERSHIP_FIELD_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT:depends_on"));

  const contractB = baseContract();
  contractB.invariants[0].depends_on = [123];
  assert.ok(errorsFor(contractB).includes("PROOF_OWNERSHIP_DEPENDS_ON_ITEM_INVALID:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("ciclo explícito e implícito reprova", () => {
  const explicit = baseContract();
  explicit.invariants[0].depends_on = ["B"];
  explicit.invariants.push(makeInvariant({
    id: "B",
    proof_class: "runtime",
    source: "docs/b.md",
    consumer: "scripts/b-consumer.mjs",
    prover: "scripts/b-prover.mjs",
    negative_test: "scripts/b-prover.test.mjs",
    counterproof: { kind: "negative_test_suite", path: "scripts/b-prover.test.mjs", observation: "x", independent_from_prover: true },
    external_anchor: { kind: "runtime_observation", path: "evidence/b.log", observation: "evento externo" },
    depends_on: ["AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"],
  }));
  assert.ok(errorsFor(explicit).some((item) => item.startsWith("PROOF_OWNERSHIP_CYCLE:")));

  const implicit = baseContract();
  implicit.invariants[0].consumer = "scripts/b-prover.mjs";
  implicit.invariants.push(makeInvariant({
    id: "B",
    proof_class: "runtime",
    source: "docs/b.md",
    consumer: "scripts/lupa/authority-approval.mjs",
    prover: "scripts/b-prover.mjs",
    negative_test: "scripts/b-prover.test.mjs",
    counterproof: { kind: "negative_test_suite", path: "scripts/b-prover.test.mjs", observation: "x", independent_from_prover: true },
    external_anchor: { kind: "runtime_observation", path: "evidence/b.log", observation: "evento externo" },
    depends_on: [],
  }));
  assert.ok(errorsFor(implicit).some((item) => item.startsWith("PROOF_OWNERSHIP_CYCLE:")));
});

test("required_registered_invariants impede sumiço silencioso", () => {
  const contract = baseContract();
  contract.invariants = [makeInvariant({ id: "OUTRA" })];
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_REQUIRED_INVARIANT_MISSING:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("invariável conhecida não pode estar simultaneamente registrada e UNPROVEN", () => {
  const contract = baseContract();
  contract.unregistered_known_invariants.push({ id: "AUTHORITY_RECEIPT_FROM_GITHUB_EVENT", status: "UNPROVEN_NOT_OWNED" });
  assert.ok(errorsFor(contract).includes("PROOF_OWNERSHIP_REGISTERED_AND_UNREGISTERED:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("status de execução é explicitamente fora do escopo deste detector", () => {
  const contract = baseContract();
  contract.invariants[0].status = "UNKNOWN";
  const result = validateProofOwnership(contract, { exists: allExist });
  assert.equal(result.ok, true);
  assert.equal(result.topology_only, true);
  assert.equal(result.invariant_proof, false);
});

test("contrato canônico exige enforcement proporcional para qualquer claim operacional registrado", () => {
  const contract = loadCanonicalContract();
  assert.deepEqual(validateOperationalClaimPolicy(contract), []);
});

test("política operacional não pode ser trocada por YAML ou tecnologia única", () => {
  const contract = loadCanonicalContract();
  contract.operational_claim_policy.technology_lock = true;
  assert.ok(validateOperationalClaimPolicy(contract).includes("OPERATIONAL_POLICY_TECHNOLOGY_LOCK_FORBIDDEN"));

  delete contract.operational_claim_policy.mechanism_profiles.API_CONTRACT;
  assert.ok(validateOperationalClaimPolicy(contract).includes("OPERATIONAL_POLICY_MECHANISM_PROFILE_MISSING:API_CONTRACT"));
});

test("claim operacional sem cadeia completa ou com estado stale reprova", () => {
  const contract = loadCanonicalContract();
  delete contract.invariants[0].operational_chain.enforcement;
  assert.ok(validateOperationalClaimPolicy(contract).includes("OPERATIONAL_CHAIN_FIELD_INVALID:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT:enforcement"));

  const stale = loadCanonicalContract();
  stale.invariants[0].operational_chain.live_state = "PASS_ONTEM";
  assert.ok(validateOperationalClaimPolicy(stale).includes("OPERATIONAL_CHAIN_STALE_STATE_FORBIDDEN:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

test("fixed point operacional precisa declarar escopo e judge não pode ser o prover", () => {
  const contract = loadCanonicalContract();
  contract.invariants[0].operational_chain.fixed_point_scope = "FIXED_POINT";
  assert.ok(validateOperationalClaimPolicy(contract).includes("OPERATIONAL_CHAIN_FIXED_POINT_SCOPE_INVALID:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));

  const collision = loadCanonicalContract();
  collision.invariants[0].operational_chain.judge = collision.invariants[0].prover;
  assert.ok(validateOperationalClaimPolicy(collision).includes("OPERATIONAL_CHAIN_WRITER_JUDGE_COLLISION:AUTHORITY_RECEIPT_FROM_GITHUB_EVENT"));
});

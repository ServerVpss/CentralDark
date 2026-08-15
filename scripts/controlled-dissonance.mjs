#!/usr/bin/env node
/**
 * Controlled Dissonance — deterministic orchestration kernel.
 *
 * Reuses CENTRALDARK_AGENT_CALL_V1. It never executes a model and never grants
 * write authority to perception arms. It creates four read-only attacks over
 * the same intent/material, deduplicates correlated findings, selects one
 * canonical mutation per wound, and only crystallizes after regression +
 * counterproof on the same promoted result.
 */
import { readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { validateAgentCall } from "./agent-call.mjs";

export const PROTOCOL = "CENTRALDARK_CONTROLLED_DISSONANCE_V1";
export const ATTACK_PROFILES = Object.freeze([
  Object.freeze({ id: "LOGIC", role: "DEBUGGER", objective: "tentar quebrar a lógica, premissas, causalidade e invariantes" }),
  Object.freeze({ id: "IMPLEMENTATION", role: "REVIEWER", objective: "tentar quebrar a implementação, integração, contratos e edge cases" }),
  Object.freeze({ id: "REGRESSION_FALSE_GREEN", role: "JUDGE", objective: "procurar regressão, falso verde, prova circular e evidência insuficiente" }),
  Object.freeze({ id: "SIMPLIFICATION", role: "READ_ONLY", objective: "procurar simplificação, duplicação e menor correção suficiente" }),
]);

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function fingerprint(value) {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function blocked(status, state, extra = {}) {
  return {
    protocol: PROTOCOL,
    status,
    accepted: false,
    intent_id: state?.intent_id || null,
    material_id: state?.material_id || null,
    observed_head: state?.head?.sha || null,
    writer_scope: state?.writer_scope || null,
    ...extra,
  };
}

function validateBaseState(state) {
  const required = ["intent_id", "material_id", "writer_scope"];
  const missing = required.filter((k) => !nonEmpty(state?.[k]));
  if (!nonEmpty(state?.head?.sha)) missing.push("head.sha");
  if (!nonEmpty(state?.writer?.agent)) missing.push("writer.agent");
  if (!nonEmpty(state?.trail?.route_id)) missing.push("trail.route_id");
  if (!Array.isArray(state?.scope?.allowed) || state.scope.allowed.length === 0) missing.push("scope.allowed");
  if (missing.length) return blocked("BLOCKED_INVALID_DISSONANCE_STATE", state, { missing });
  return null;
}

function observerName(state, profile, index) {
  const supplied = Array.isArray(state?.perception_agents) ? state.perception_agents[index] : null;
  return nonEmpty(supplied) ? supplied : `perception-${profile.id.toLowerCase()}`;
}

export function buildPerceptionPlan(state) {
  const invalid = validateBaseState(state);
  if (invalid) return invalid;

  const calls = ATTACK_PROFILES.map((profile, index) => {
    const frontierId = `DISSONANCE:${state.material_id}:${profile.id}`;
    const call = {
      call_id: randomUUID(),
      parent_call_id: state.parent_call_id || `DISSONANCE:${state.intent_id}`,
      depth: Number.isInteger(state.depth) && state.depth >= 0 ? state.depth + 1 : 1,
      frontier_id: frontierId,
      mission_id: state.mission_id || state.intent_id,
      from: state.coordinator || "sol",
      to: observerName(state, profile, index),
      requested_role: profile.role,
      observed_head: state.head.sha,
      trail_id: state.trail.route_id,
      scope: state.scope.allowed,
      requested_action: [
        `SAME_INTENT=${state.intent_id}`,
        `SAME_MATERIAL=${state.material_id}`,
        `ATTACK_PROFILE=${profile.id}`,
        profile.objective,
        "READ_ONLY=true",
        "RETURN=DELTA_ONLY_WITH_EVIDENCE",
      ].join(" | "),
      write_requested: false,
      dissonance: {
        protocol: PROTOCOL,
        intent_id: state.intent_id,
        material_id: state.material_id,
        attack_profile: profile.id,
        same_intent: true,
        same_material: true,
        read_only: true,
      },
    };
    return { profile, call, gate: validateAgentCall(call, { ...state, mission_id: call.mission_id }) };
  });

  const rejected = calls.filter((entry) => entry.gate.accepted !== true);
  if (rejected.length) {
    return blocked("BLOCKED_PERCEPTION_PLAN_REJECTED_BY_AGENT_CALL", state, {
      rejected: rejected.map(({ profile, gate }) => ({ attack_profile: profile.id, status: gate.status })),
    });
  }

  const uniqueTargets = new Set(calls.map((entry) => entry.call.to));
  if (uniqueTargets.size !== calls.length) return blocked("BLOCKED_DUPLICATE_PERCEPTION_AGENT", state);

  return {
    protocol: PROTOCOL,
    status: "READY_FOUR_ANGLES",
    accepted: true,
    intent_id: state.intent_id,
    material_id: state.material_id,
    observed_head: state.head.sha,
    writer_scope: state.writer_scope,
    writer: state.writer.agent,
    same_intent: true,
    same_material: true,
    mutation_authorized_for_perception: false,
    perception_count: calls.length,
    calls: calls.map(({ profile, call, gate }) => ({
      attack_profile: profile.id,
      objective: profile.objective,
      call,
      call_receipt: gate,
    })),
  };
}

function validateReceipt(receipt, state) {
  if (!receipt || typeof receipt !== "object") return "BLOCKED_INVALID_PERCEPTION_RECEIPT";
  if (receipt.protocol !== PROTOCOL) return "BLOCKED_WRONG_DISSONANCE_PROTOCOL";
  if (!ATTACK_PROFILES.some((p) => p.id === receipt.attack_profile)) return "BLOCKED_UNKNOWN_ATTACK_PROFILE";
  if (receipt.intent_id !== state.intent_id) return "BLOCKED_INTENT_DRIFT";
  if (receipt.material_id !== state.material_id) return "BLOCKED_MATERIAL_DRIFT";
  if (receipt.observed_head !== state.head.sha) return "BLOCKED_STALE_HEAD";
  if (receipt.writer_scope !== state.writer_scope) return "BLOCKED_WRITER_SCOPE_DRIFT";
  if (receipt.read_only !== true || receipt.write_performed === true) return "BLOCKED_PERCEPTION_MUTATED_STATE";
  if (!Array.isArray(receipt.findings)) return "BLOCKED_FINDINGS_MISSING";
  return null;
}

function normalizeFinding(finding, receipt) {
  if (!finding || typeof finding !== "object") return null;
  const verdict = String(finding.verdict || "UNKNOWN").toUpperCase();
  if (!["MATERIAL", "NO_CHANGE", "UNKNOWN"].includes(verdict)) return null;
  const claim = nonEmpty(finding.claim) ? finding.claim.trim() : null;
  if (!claim && verdict !== "NO_CHANGE") return null;
  const evidenceRefs = Array.isArray(finding.evidence_refs) ? [...new Set(finding.evidence_refs.filter(nonEmpty))] : [];
  const evidenceCluster = nonEmpty(finding.evidence_cluster)
    ? finding.evidence_cluster.trim()
    : evidenceRefs.length ? `cluster:${fingerprint(evidenceRefs.sort())}` : "cluster:unproven";
  const wound = nonEmpty(finding.wound) ? finding.wound.trim() : claim || "NO_CHANGE";
  const findingFingerprint = nonEmpty(finding.finding_fingerprint)
    ? finding.finding_fingerprint.trim()
    : fingerprint({ material_id: receipt.material_id, writer_scope: receipt.writer_scope, wound, claim });

  return {
    finding_fingerprint: findingFingerprint,
    wound,
    claim,
    verdict,
    evidence_refs: evidenceRefs,
    evidence_cluster: evidenceCluster,
    proposed_correction: nonEmpty(finding.proposed_correction) ? finding.proposed_correction.trim() : null,
    attack_profile: receipt.attack_profile,
    observer: receipt.observer || null,
  };
}

export function convergePerceptions(state, receipts) {
  const invalid = validateBaseState(state);
  if (invalid) return invalid;
  if (!Array.isArray(receipts) || receipts.length !== ATTACK_PROFILES.length) {
    return blocked("BLOCKED_FOUR_PERCEPTIONS_REQUIRED", state, {
      expected: ATTACK_PROFILES.length,
      observed: Array.isArray(receipts) ? receipts.length : null,
    });
  }

  const receiptErrors = receipts.map((receipt) => ({ receipt, error: validateReceipt(receipt, state) })).filter((x) => x.error);
  if (receiptErrors.length) {
    return blocked("BLOCKED_INVALID_PERCEPTION_RECEIPTS", state, {
      errors: receiptErrors.map((x) => ({ attack_profile: x.receipt?.attack_profile || null, status: x.error })),
    });
  }

  const observedProfiles = receipts.map((r) => r.attack_profile);
  if (new Set(observedProfiles).size !== ATTACK_PROFILES.length || ATTACK_PROFILES.some((p) => !observedProfiles.includes(p.id))) {
    return blocked("BLOCKED_ATTACK_PROFILE_COVERAGE", state, { observed_profiles: observedProfiles });
  }

  const findings = receipts.flatMap((receipt) => receipt.findings.map((f) => normalizeFinding(f, receipt)).filter(Boolean));
  const groups = new Map();
  for (const finding of findings) {
    if (!groups.has(finding.finding_fingerprint)) groups.set(finding.finding_fingerprint, []);
    groups.get(finding.finding_fingerprint).push(finding);
  }

  const deduped = [...groups.entries()].map(([findingFingerprint, group]) => {
    const evidenceClusters = [...new Set(group.map((f) => f.evidence_cluster))];
    const profiles = [...new Set(group.map((f) => f.attack_profile))];
    const evidenceRefs = [...new Set(group.flatMap((f) => f.evidence_refs))];
    const material = group.some((f) => f.verdict === "MATERIAL");
    const allNoChange = group.every((f) => f.verdict === "NO_CHANGE");
    const independentProofCount = evidenceClusters.filter((c) => c !== "cluster:unproven").length;
    return {
      finding_fingerprint: findingFingerprint,
      wound: group[0].wound,
      claim: group.find((f) => f.claim)?.claim || null,
      verdict: material ? "MATERIAL" : allNoChange ? "NO_CHANGE" : "UNKNOWN",
      attack_profiles: profiles,
      evidence_clusters: evidenceClusters,
      evidence_refs: evidenceRefs,
      independent_proof_count: independentProofCount,
      corroborated_by_distinct_proof: independentProofCount >= 2,
      proposed_corrections: [...new Set(group.map((f) => f.proposed_correction).filter(nonEmpty))],
    };
  });

  const materialFindings = deduped.filter((f) => f.verdict === "MATERIAL");
  const unprovenMaterial = materialFindings.filter((f) => f.evidence_refs.length === 0);
  if (unprovenMaterial.length) {
    return blocked("BLOCKED_MATERIAL_FINDING_WITHOUT_EVIDENCE", state, {
      findings: unprovenMaterial.map((f) => f.finding_fingerprint),
    });
  }

  return {
    protocol: PROTOCOL,
    status: materialFindings.length ? "READY_SINGLE_WRITER_MUTATION" : "NO_MATERIAL_DELTA",
    accepted: true,
    intent_id: state.intent_id,
    material_id: state.material_id,
    observed_head: state.head.sha,
    writer_scope: state.writer_scope,
    writer: state.writer.agent,
    perception_count: receipts.length,
    raw_finding_count: findings.length,
    deduped_finding_count: deduped.length,
    material_finding_count: materialFindings.length,
    deduped_findings: deduped,
    canonical_mutations: materialFindings.map((finding) => ({
      finding_fingerprint: finding.finding_fingerprint,
      writer: state.writer.agent,
      writer_scope: state.writer_scope,
      one_writer: true,
      mutation_count_for_wound: 1,
      evidence_refs: finding.evidence_refs,
      candidate_corrections: finding.proposed_corrections,
      rule: "ONE_CANONICAL_MUTATION_PER_WOUND",
    })),
  };
}

export function validateCanonicalMutation(state, convergence, mutation) {
  const invalid = validateBaseState(state);
  if (invalid) return invalid;
  if (!convergence || convergence.protocol !== PROTOCOL || convergence.accepted !== true) return blocked("BLOCKED_INVALID_CONVERGENCE", state);
  if (!mutation || typeof mutation !== "object") return blocked("BLOCKED_INVALID_MUTATION", state);
  if (mutation.writer !== state.writer.agent) return blocked("BLOCKED_WRITER_CONFLICT", state, { expected_writer: state.writer.agent });
  if (mutation.writer_scope !== state.writer_scope) return blocked("BLOCKED_WRITER_SCOPE_DRIFT", state);
  if (mutation.intent_id !== state.intent_id || mutation.material_id !== state.material_id) return blocked("BLOCKED_MUTATION_CONTEXT_DRIFT", state);
  const candidates = convergence.canonical_mutations || [];
  const target = candidates.find((c) => c.finding_fingerprint === mutation.finding_fingerprint);
  if (!target) return blocked("BLOCKED_MUTATION_NOT_FROM_CONVERGED_FINDING", state);
  if (mutation.mutation_count_for_wound !== 1) return blocked("BLOCKED_DUPLICATE_MUTATION", state);
  if (!nonEmpty(mutation.correction_ref)) return blocked("BLOCKED_CORRECTION_REF_MISSING", state);

  return {
    protocol: PROTOCOL,
    status: "CANONICAL_MUTATION_ACCEPTED",
    accepted: true,
    intent_id: state.intent_id,
    material_id: state.material_id,
    finding_fingerprint: mutation.finding_fingerprint,
    writer: state.writer.agent,
    writer_scope: state.writer_scope,
    correction_ref: mutation.correction_ref,
    one_writer: true,
    one_canonical_mutation: true,
  };
}

export function crystallizeGold(state, convergence, mutationResult) {
  const mutationGate = validateCanonicalMutation(state, convergence, mutationResult);
  if (!mutationGate.accepted) return mutationGate;

  const required = ["post_head", "test_ref", "regression_ref", "counterproof_ref", "integration_ref"];
  const missing = required.filter((k) => !nonEmpty(mutationResult[k]));
  if (missing.length) return blocked("BLOCKED_PROOF_INCOMPLETE", state, { missing });
  if (mutationResult.regression_status !== "PASS") return blocked("BLOCKED_REGRESSION_NOT_PASS", state);
  if (mutationResult.counterproof_status !== "PASS") return blocked("BLOCKED_COUNTERPROOF_NOT_PASS", state);
  if (mutationResult.integration_status !== "PASS") return blocked("BLOCKED_INTEGRATION_NOT_PASS", state);
  if (mutationResult.material_gap_count !== 0) return blocked("BLOCKED_MATERIAL_GAPS_REMAIN", state);
  if (mutationResult.false_green_count !== 0) return blocked("BLOCKED_FALSE_GREEN_REMAINS", state);
  if (mutationResult.silent_error_count !== 0) return blocked("BLOCKED_SILENT_ERROR_REMAINS", state);

  return {
    protocol: PROTOCOL,
    status: "GOLD_CRYSTALLIZED",
    accepted: true,
    intent_id: state.intent_id,
    material_id: state.material_id,
    finding_fingerprint: mutationResult.finding_fingerprint,
    pre_head: state.head.sha,
    post_head: mutationResult.post_head,
    writer: state.writer.agent,
    writer_scope: state.writer_scope,
    correction_ref: mutationResult.correction_ref,
    proof: {
      test_ref: mutationResult.test_ref,
      regression_ref: mutationResult.regression_ref,
      counterproof_ref: mutationResult.counterproof_ref,
      integration_ref: mutationResult.integration_ref,
    },
    fixed_point: true,
    rule: "PERCEPTION_PARALLEL_MUTATION_SERIAL_GOLD_ONLY_AFTER_COUNTERPROOF",
  };
}

async function readJson(path) {
  return readFile(path, "utf8").then(JSON.parse);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command) return;

  if (command === "--plan") {
    if (args.length !== 1) throw new Error("uso: --plan <state.json>");
    process.stdout.write(`${JSON.stringify(buildPerceptionPlan(await readJson(args[0])), null, 2)}\n`);
    return;
  }

  if (command === "--converge") {
    if (args.length !== 2) throw new Error("uso: --converge <state.json> <receipts.json>");
    const [state, receipts] = await Promise.all(args.map(readJson));
    const result = convergePerceptions(state, receipts);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.accepted ? 0 : 13;
    return;
  }

  if (command === "--mutation-gate") {
    if (args.length !== 3) throw new Error("uso: --mutation-gate <state.json> <convergence.json> <mutation.json>");
    const [state, convergence, mutation] = await Promise.all(args.map(readJson));
    const result = validateCanonicalMutation(state, convergence, mutation);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.accepted ? 0 : 13;
    return;
  }

  if (command === "--crystallize") {
    if (args.length !== 3) throw new Error("uso: --crystallize <state.json> <convergence.json> <mutation-result.json>");
    const [state, convergence, mutation] = await Promise.all(args.map(readJson));
    const result = crystallizeGold(state, convergence, mutation);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.accepted ? 0 : 13;
    return;
  }

  throw new Error(`comando desconhecido: ${command}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(2);
  });
}

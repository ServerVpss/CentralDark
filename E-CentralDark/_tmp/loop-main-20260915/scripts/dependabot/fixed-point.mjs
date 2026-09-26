import { deriveHornFixedPoint } from "../github-autonomia-promocao.mjs";

export const DEPENDABOT_FIXED_POINT_GOAL = "DEPENDABOT_SQUASH_READY";

export const DEPENDABOT_HORN_RULES = Object.freeze([
  Object.freeze({
    head: "DEPENDABOT_LIVE_BOUND",
    body: Object.freeze(["EXACT_HEAD", "MERGEABLE_LIVE", "CHECKS_GREEN"]),
  }),
  Object.freeze({
    head: "DEPENDABOT_POLICY_BOUND",
    body: Object.freeze(["UPDATE_CLASS_ALLOWED", "COMPATIBILITY_PASS", "REVIEWS_CLEAR"]),
  }),
  Object.freeze({
    head: DEPENDABOT_FIXED_POINT_GOAL,
    body: Object.freeze(["DEPENDABOT_LIVE_BOUND", "DEPENDABOT_POLICY_BOUND", "NO_BLOCKERS"]),
  }),
]);

function clampPercent(value) {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function dependabotReconciliationChance({
  score,
  threshold,
  mergeable,
  mergeState,
  pendingChecks = 0,
  failedChecks = 0,
  badStatuses = 0,
  successChecks = 0,
  changesRequested = false,
  blockers = [],
  previousChance = null,
} = {}) {
  const rawScore = clampPercent(score);
  const required = Number.isFinite(threshold) && threshold <= 100 ? threshold : 100;
  const normalizedCompatibility = rawScore == null ? 0 : Math.min(1, rawScore / required);

  let multiplier = normalizedCompatibility;
  const reasons = [];

  if (rawScore == null) reasons.push("COMPATIBILITY_UNKNOWN");
  if (mergeable === true && !["dirty", "blocked"].includes(String(mergeState || "").toLowerCase())) {
    multiplier *= 1;
  } else if (mergeable == null || String(mergeState || "").toLowerCase() === "unknown") {
    multiplier *= 0.55;
    reasons.push("MERGEABILITY_UNKNOWN");
  } else {
    multiplier *= 0.2;
    reasons.push("MERGEABILITY_NOT_READY");
  }

  if (failedChecks > 0 || badStatuses > 0) {
    multiplier *= 0.25;
    reasons.push("CHECKS_FAILED_OR_STATUS_BAD");
  } else if (pendingChecks > 0) {
    multiplier *= 0.65;
    reasons.push("CHECKS_PENDING");
  } else if (successChecks > 0) {
    multiplier *= 1;
  } else {
    multiplier *= 0.5;
    reasons.push("NO_SUCCESS_CHECK_ON_HEAD");
  }

  if (changesRequested) {
    multiplier *= 0.2;
    reasons.push("CHANGES_REQUESTED");
  }

  const materialBlockers = blockers.filter((item) => !/^COMPATIBILITY_\d+_LT_\d+$/.test(String(item)));
  if (materialBlockers.length > 0) {
    multiplier *= Math.max(0.1, 1 - Math.min(materialBlockers.length, 5) * 0.16);
    reasons.push("MATERIAL_BLOCKERS_PRESENT");
  }

  const chance = clampPercent(multiplier * 100) ?? 0;
  const previous = clampPercent(previousChance);
  const delta = previous == null ? null : chance - previous;
  const trend = delta == null ? "BASELINE" : delta > 0 ? "UP" : delta < 0 ? "DOWN" : "FLAT";

  return {
    chance,
    trend,
    delta,
    confidence: rawScore == null ? "LOW" : (successChecks > 0 && pendingChecks === 0 && failedChecks === 0 && badStatuses === 0 ? "HIGH" : "MEDIUM"),
    raw_score: rawScore,
    threshold: required,
    reasons: [...new Set(reasons)],
  };
}

export function dependabotFixedPointProof({
  kind,
  score,
  threshold,
  mergeable,
  mergeState,
  pendingChecks = 0,
  failedChecks = 0,
  badStatuses = 0,
  successChecks = 0,
  changesRequested = false,
  exactHead = false,
  blockers = [],
  previousChance = null,
} = {}) {
  const facts = new Set();
  if (exactHead) facts.add("EXACT_HEAD");
  if (["patch", "minor"].includes(String(kind || "").toLowerCase())) facts.add("UPDATE_CLASS_ALLOWED");
  if (Number.isFinite(score) && Number.isFinite(threshold) && threshold <= 100 && score >= threshold) {
    facts.add("COMPATIBILITY_PASS");
  }
  if (mergeable === true && !["dirty", "behind", "blocked", "unknown"].includes(String(mergeState || "").toLowerCase())) {
    facts.add("MERGEABLE_LIVE");
  }
  if (pendingChecks === 0 && failedChecks === 0 && badStatuses === 0 && successChecks > 0) facts.add("CHECKS_GREEN");
  if (!changesRequested) facts.add("REVIEWS_CLEAR");
  if (!blockers.length) facts.add("NO_BLOCKERS");

  const closure = deriveHornFixedPoint([...facts], DEPENDABOT_HORN_RULES);
  const ready = closure.fixed_point && closure.facts.includes(DEPENDABOT_FIXED_POINT_GOAL);
  const pending = mergeable == null || pendingChecks > 0 || blockers.some((item) => /UNKNOWN|PENDING|UPDATE_BRANCH_REQUESTED/.test(String(item)));
  const reconciliation = dependabotReconciliationChance({
    score,
    threshold,
    mergeable,
    mergeState,
    pendingChecks,
    failedChecks,
    badStatuses,
    successChecks,
    changesRequested,
    blockers,
    previousChance,
  });

  return {
    ready,
    verdict: ready ? "PROVED_IN_SCOPE" : (pending ? "UNKNOWN" : "REFUTED_IN_SCOPE"),
    basis: "HORN_MONOTONE_CLOSURE",
    achilles_guard: "FINITE_MONOTONE_PROGRESS",
    self_reference_guard: "EXTERNAL_FACTS_ONLY_NO_GOAL_SEED",
    reconciliation,
    ...closure,
  };
}

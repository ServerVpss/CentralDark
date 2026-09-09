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

  return {
    ready,
    verdict: ready ? "PROVED_IN_SCOPE" : (pending ? "UNKNOWN" : "REFUTED_IN_SCOPE"),
    basis: "HORN_MONOTONE_CLOSURE",
    achilles_guard: "FINITE_MONOTONE_PROGRESS",
    self_reference_guard: "EXTERNAL_FACTS_ONLY_NO_GOAL_SEED",
    ...closure,
  };
}

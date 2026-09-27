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


export const HOUSE_SQUASH_FIXED_POINT_GOAL = "HOUSE_SQUASH_READY";
export const HOUSE_BLOCKING_LABELS = Object.freeze(["do-not-merge", "hold", "autonomia-bloqueada"]);

export const HOUSE_SQUASH_HORN_RULES = Object.freeze([
  Object.freeze({
    head: "HOUSE_LIVE_BOUND",
    body: Object.freeze(["OPEN", "EXACT_HEAD", "MERGEABLE_LIVE", "CHECKS_ALL_GREEN"]),
  }),
  Object.freeze({
    head: "HOUSE_POLICY_BOUND",
    body: Object.freeze(["NOT_DRAFT", "NOT_PROTECTED", "NO_BLOCKING_LABELS", "REVIEWS_CLEAR"]),
  }),
  Object.freeze({
    head: HOUSE_SQUASH_FIXED_POINT_GOAL,
    body: Object.freeze(["HOUSE_LIVE_BOUND", "HOUSE_POLICY_BOUND", "NO_BLOCKERS"]),
  }),
]);

export function houseSquashFixedPointProof({
  prNumber,
  state = "open",
  draft = false,
  labels = [],
  protectedPrs = [1562],
  mergeable,
  mergeState,
  headSha,
  observedHeadSha,
  pendingChecks = 0,
  nonGreenChecks = 0,
  badStatuses = 0,
  successChecks = 0,
  changesRequested = false,
  blockers = [],
} = {}) {
  const facts = new Set();
  const normalizedLabels = new Set((labels || []).map((x) => String(x?.name || x || "").trim().toLowerCase()));

  if (String(state).toLowerCase() === "open") facts.add("OPEN");
  if (!draft) facts.add("NOT_DRAFT");
  if (!protectedPrs.map(Number).includes(Number(prNumber))) facts.add("NOT_PROTECTED");
  if (![...normalizedLabels].some((label) => HOUSE_BLOCKING_LABELS.includes(label))) facts.add("NO_BLOCKING_LABELS");
  if (/^[a-f0-9]{40}$/i.test(String(headSha || "")) && headSha === observedHeadSha) facts.add("EXACT_HEAD");
  if (mergeable === true && !["dirty", "behind", "blocked", "unknown"].includes(String(mergeState || "").toLowerCase())) {
    facts.add("MERGEABLE_LIVE");
  }
  if (pendingChecks === 0 && nonGreenChecks === 0 && badStatuses === 0 && successChecks > 0) {
    facts.add("CHECKS_ALL_GREEN");
  }
  if (!changesRequested) facts.add("REVIEWS_CLEAR");
  if (!blockers.length) facts.add("NO_BLOCKERS");

  const closure = deriveHornFixedPoint([...facts], HOUSE_SQUASH_HORN_RULES);
  const ready = closure.fixed_point && closure.facts.includes(HOUSE_SQUASH_FIXED_POINT_GOAL);
  const unknown = mergeable == null || pendingChecks > 0 || successChecks === 0 || !observedHeadSha;

  return {
    ready,
    verdict: ready ? "PROVED_IN_SCOPE" : (unknown ? "UNKNOWN" : "REFUTED_IN_SCOPE"),
    basis: "REALITY_SAME_HEAD_HORN_FIXED_POINT",
    pr_number: Number(prNumber || 0),
    head_sha: headSha || null,
    observed_head_sha: observedHeadSha || null,
    labels: [...normalizedLabels].sort(),
    ...closure,
  };
}

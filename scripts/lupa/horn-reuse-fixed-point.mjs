#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const DEFAULT_RULES = Object.freeze([
  { id: "REUSE_FULL_FIT", if: ["EXISTING_OWNER", "SAME_INTENT", "FULL_FIT"], then: "REUSE" },
  { id: "EXTEND_PARTIAL_FIT", if: ["EXISTING_OWNER", "SAME_INTENT", "PARTIAL_FIT"], then: "EXTEND_MINIMALLY" },
  { id: "REUSE_KNOWN_REMEDY", if: ["ERROR_OBSERVED", "ERROR_SIGNATURE_KNOWN", "KNOWN_REMEDY"], then: "REUSE_REMEDIATION" },
  { id: "PROMOTE_PROVED_REMEDY", if: ["ERROR_OBSERVED", "NEW_REMEDY_PROVED"], then: "PROMOTE_LEARNING" },
  { id: "REUSE_PROMOTED_REMEDY", if: ["PROMOTE_LEARNING", "SAME_ERROR_SIGNATURE"], then: "REUSE_REMEDIATION" },
  { id: "REMEDIATION_IS_REUSE", if: ["REUSE_REMEDIATION"], then: "REUSE" },
  { id: "CREATE_ONLY_AFTER_PROVED_GAP", if: ["NO_EXISTING_OWNER_PROVED", "MATERIAL_GAP_PROVEN", "EXTEND_INSUFFICIENT"], then: "CREATE_MINIMAL" },
]);

export const DEFAULT_DENIALS = Object.freeze([
  { id: "OWNER_EXISTENCE_CONTRADICTION", if: ["EXISTING_OWNER", "NO_EXISTING_OWNER_PROVED"] },
  { id: "CREATE_AND_REUSE_CONTRADICTION", if: ["CREATE_MINIMAL", "REUSE"] },
  { id: "CREATE_AND_EXTEND_CONTRADICTION", if: ["CREATE_MINIMAL", "EXTEND_MINIMALLY"] },
  { id: "CREATE_WITH_SAME_OWNER_CONTRADICTION", if: ["CREATE_MINIMAL", "EXISTING_OWNER", "SAME_INTENT"] },
]);

const normalize = (value) => String(value || "").trim().toUpperCase();
const allPresent = (facts, required) => required.every((fact) => facts.has(normalize(fact)));

export function deriveFixedPoint({ facts = [], rules = DEFAULT_RULES, denials = DEFAULT_DENIALS } = {}) {
  const known = new Set(facts.map(normalize).filter(Boolean));
  const trace = [];
  const maxRounds = Math.max(4, rules.length + known.size + 4);

  const assertNoContradiction = () => {
    for (const denial of denials) {
      if (allPresent(known, denial.if)) {
        const error = new Error(`HORN_CONTRADICTION:${denial.id}`);
        error.code = "HORN_CONTRADICTION";
        error.denial = denial.id;
        error.facts = [...known].sort();
        throw error;
      }
    }
  };

  assertNoContradiction();

  let changed = true;
  let round = 0;
  while (changed) {
    changed = false;
    round += 1;
    if (round > maxRounds) throw new Error("HORN_FIXED_POINT_NOT_REACHED");

    for (const rule of rules) {
      const consequence = normalize(rule.then);
      if (!consequence || known.has(consequence)) continue;
      if (!allPresent(known, rule.if)) continue;
      known.add(consequence);
      trace.push({ round, rule: rule.id, then: consequence });
      changed = true;
      assertNoContradiction();
    }
  }

  return {
    rounds: round,
    facts: [...known].sort(),
    trace,
    fixedPoint: true,
  };
}

export function decideReuse(input = {}) {
  const facts = [];
  const mapping = {
    existingOwner: "EXISTING_OWNER",
    noExistingOwnerProved: "NO_EXISTING_OWNER_PROVED",
    sameIntent: "SAME_INTENT",
    fullFit: "FULL_FIT",
    partialFit: "PARTIAL_FIT",
    materialGapProven: "MATERIAL_GAP_PROVEN",
    extendInsufficient: "EXTEND_INSUFFICIENT",
    errorObserved: "ERROR_OBSERVED",
    errorSignatureKnown: "ERROR_SIGNATURE_KNOWN",
    knownRemedy: "KNOWN_REMEDY",
    newRemedyProved: "NEW_REMEDY_PROVED",
    sameErrorSignature: "SAME_ERROR_SIGNATURE",
  };

  for (const [key, fact] of Object.entries(mapping)) {
    if (input[key] === true) facts.push(fact);
  }

  const result = deriveFixedPoint({ facts });
  const set = new Set(result.facts);
  let decision = "UNKNOWN";
  if (set.has("CREATE_MINIMAL")) decision = "CREATE_MINIMAL";
  else if (set.has("EXTEND_MINIMALLY")) decision = "EXTEND_MINIMALLY";
  else if (set.has("REUSE")) decision = "REUSE";

  return { ...result, decision };
}


/**
 * Read-only projection of Goal clauses for Hermes, PR receipts and HUD.
 * Structural evidence checks only: a ref is not independent proof of its truth.
 * The existing Reality Judge/owner must supply measured, counterproved verdicts.
 */
export function evaluateGoalClauses(goal = {}, options = {}) {
  const clauses = Array.isArray(goal.clauses) ? goal.clauses : [];
  const ids = new Set();
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  const maxAgeMs = Number.isFinite(options.maxAgeMs) && options.maxAgeMs >= 0
    ? options.maxAgeMs : null;
  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  const rows = clauses.map((clause) => {
    const id = clause?.id;
    if (!hasText(id) || ids.has(id)) throw new Error("GOAL_CLAUSE_INVALID_OR_DUPLICATE_ID");
    ids.add(id);
    const required = clause.required !== false;
    const raw = String(clause.status || "UNKNOWN").toUpperCase();
    const observedAt = Date.parse(clause.measured_at || "");
    const timestampValid = Number.isFinite(observedAt) && /(?:Z|[+-]\d\d:\d\d)$/.test(clause.measured_at || "");
    const stale = timestampValid && (observedAt > nowMs ||
      (maxAgeMs !== null && nowMs - observedAt > maxAgeMs));
    const traceable = [clause.predicate, clause.owner, clause.proof_ref,
      clause.counterproof_ref, clause.source_sha].every(hasText) && timestampValid;
    let status = "UNKNOWN";
    if (raw === "FAIL" || clause.counterproof_verdict === "REFUTED") status = "FAIL";
    else if (stale || raw === "STALE") status = "STALE";
    else if (raw === "PASS" && traceable && clause.counterproof_verdict === "NOT_REFUTED") {
      status = "PASS";
    }
    return {
      id, required, status, owner: hasText(clause.owner) ? clause.owner : null,
      proof_ref: hasText(clause.proof_ref) ? clause.proof_ref : null,
      counterproof_ref: hasText(clause.counterproof_ref) ? clause.counterproof_ref : null,
      measured_at: timestampValid ? clause.measured_at : null,
      next_cursor: hasText(clause.next_cursor) ? clause.next_cursor : null,
    };
  });
  const counts = { PASS: 0, FAIL: 0, UNKNOWN: 0, STALE: 0 };
  for (const row of rows) counts[row.status] += 1;
  const required = rows.filter((row) => row.required);
  const allRequiredPass = required.length > 0 && required.every((row) => row.status === "PASS");
  const fixedPoint = allRequiredPass && hasText(goal.intent_id) &&
    hasText(goal.goal_fingerprint) && hasText(goal.receipt_ref) &&
    goal.next_cursor === "FIXED_POINT";
  return {
    intent_id: hasText(goal.intent_id) ? goal.intent_id : null,
    goal_fingerprint: hasText(goal.goal_fingerprint) ? goal.goal_fingerprint : null,
    main_sha: hasText(goal.main_sha) ? goal.main_sha : null,
    runtime_ref: hasText(goal.runtime_ref) ? goal.runtime_ref : null,
    counts, clauses: rows, required_total: required.length,
    required_pass: required.filter((row) => row.status === "PASS").length,
    fixedPoint, verdict: fixedPoint ? "FIXED_POINT" : "NEXT_DELTA",
    next_cursor: hasText(goal.next_cursor) ? goal.next_cursor : "REMEASURE_REQUIRED",
  };
}


export const FIXED_POINT_TEN_CRITERIA = Object.freeze([
  { id: "OWNER_UNIQUE", label: "Owner único da HUD" },
  { id: "LOCKS_PRESERVED", label: "Cadeados e selos preservados" },
  { id: "MCP_PUBLIC_HEALTH", label: "Saúde MCP público" },
  { id: "ONE_HEART_FRESH", label: "One Heart fresco" },
  { id: "SCREENPIPE_CURRENT", label: "Screenpipe atual" },
  { id: "AIONUI_STDIO_CURRENT", label: "AionUi MCP stdio atual" },
  { id: "LOG_PRIVACY_CURRENT", label: "Privacidade dos logs" },
  { id: "CHECKOUT_MAIN_SYNC", label: "Checkout sincronizado com main" },
  { id: "FORENSIC_FRESHNESS", label: "Prova forense fresca" },
  { id: "RECEIPT_PRESENT", label: "Receipt observável presente" },
]);

const EXECUTION_HEADER_SCHEMA = "centraldark.fixed-point.execution-header.v1";
const EXECUTION_HEADER_STATUS = new Set(["PASS", "FAIL", "UNKNOWN", "STALE", "BLOCKED"]);

function validFreshTimestamp(value, nowMs, maxAgeMs) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed)
    && /(?:Z|[+-]\d\d:\d\d)$/.test(String(value || ""))
    && parsed <= nowMs + 5000
    && nowMs - parsed >= -5000
    && nowMs - parsed <= maxAgeMs;
}

/**
 * Validates an agent's actual ten-criterion execution header against the canonical
 * HORN evaluator. Listing ten names is not use: every row needs a fresh attempt_ref.
 */
export function validateFixedPointExecutionHeader(header, options = {}) {
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  const maxAgeMs = Number.isFinite(options.maxAgeMs) && options.maxAgeMs > 0
    ? options.maxAgeMs : 15 * 60 * 1000;
  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  const blocked = (status, extra = {}) => ({
    schema: EXECUTION_HEADER_SCHEMA,
    accepted: false,
    status,
    header_usage: "NOT_USED",
    criteria_count: 0,
    ...extra,
  });

  if (!header || typeof header !== "object" || Array.isArray(header)) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_MISSING");
  }
  if (header.schema !== EXECUTION_HEADER_SCHEMA
    || header.evaluator !== "scripts/lupa/horn-reuse-fixed-point.mjs") {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_SCHEMA_OR_OWNER");
  }
  for (const key of ["agent_id", "mission_id", "intent_id", "goal_fingerprint",
    "observed_head", "evaluation_ref", "execution_ref", "measured_at"]) {
    if (!hasText(header[key])) return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_FIELDS_MISSING", { missing: key });
  }
  if (options.expectedMissionId && header.mission_id !== options.expectedMissionId) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_MISSION_MISMATCH", {
      expected_mission_id: options.expectedMissionId,
      observed_mission_id: header.mission_id,
    });
  }
  if (options.expectedAgentId && header.agent_id !== options.expectedAgentId) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_AGENT_MISMATCH", {
      expected_agent_id: options.expectedAgentId,
      observed_agent_id: header.agent_id,
    });
  }
  if (options.expectedHead && header.observed_head !== options.expectedHead) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_HEAD_MISMATCH", {
      expected_head: options.expectedHead,
      observed_head: header.observed_head,
    });
  }
  if (!validFreshTimestamp(header.measured_at, nowMs, maxAgeMs)) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_STALE", { measured_at: header.measured_at });
  }

  if (!Array.isArray(header.criteria) || header.criteria.length !== FIXED_POINT_TEN_CRITERIA.length) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_NOT_TEN", {
      expected_count: FIXED_POINT_TEN_CRITERIA.length,
      observed_count: Array.isArray(header.criteria) ? header.criteria.length : 0,
    });
  }

  const expectedIds = FIXED_POINT_TEN_CRITERIA.map((item) => item.id);
  const seen = new Set();
  for (const row of header.criteria) {
    if (!row || typeof row !== "object" || !expectedIds.includes(row.id) || seen.has(row.id)) {
      return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_INVALID_OR_DUPLICATE_ID");
    }
    seen.add(row.id);
    if (row.evaluated !== true || !hasText(row.source) || !hasText(row.attempt_ref)
      || !validFreshTimestamp(row.evaluated_at, nowMs, maxAgeMs)) {
      return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_CRITERION_NOT_ACTUALLY_MEASURED", {
        criterion_id: row.id,
        missing_attempt: row.evaluated !== true || !hasText(row.attempt_ref),
        evaluated_at: row.evaluated_at || null,
      });
    }
    if (!EXECUTION_HEADER_STATUS.has(row.status)) {
      return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_CRITERION_STATUS_INVALID", {
        criterion_id: row.id,
        status: row.status || null,
      });
    }
    if (row.status === "UNKNOWN" || row.status === "STALE" || row.status === "BLOCKED") {
      if (!hasText(row.reason)) {
        return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_GAP_WITHOUT_REASON", { criterion_id: row.id });
      }
    }
    if (row.status === "PASS" || row.status === "FAIL") {
      const expectedCounterproof = row.status === "PASS" ? "NOT_REFUTED" : "REFUTED";
      if (!hasText(row.source_sha) || !SOURCE_HASH.test(String(row.source_sha))
        || !hasText(row.proof_ref) || !hasText(row.counterproof_ref)
        || row.counterproof_verdict !== expectedCounterproof
        || !validFreshTimestamp(row.measured_at, nowMs, maxAgeMs)) {
        return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_CLAIM_UNPROVEN", { criterion_id: row.id });
      }
    }
  }
  if (seen.size !== expectedIds.length || expectedIds.some((id) => !seen.has(id))) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_CRITERIA_MISSING");
  }

  const goalReceipt = header.goal_receipt && typeof header.goal_receipt === "object"
    ? header.goal_receipt : null;
  if (goalReceipt && (goalReceipt.intent_id !== header.intent_id
    || goalReceipt.goal_fingerprint !== header.goal_fingerprint)) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_GOAL_MISMATCH", {
      header_intent_id: header.intent_id,
      goal_intent_id: goalReceipt.intent_id || null,
      header_goal_fingerprint: header.goal_fingerprint,
      goal_fingerprint: goalReceipt.goal_fingerprint || null,
    });
  }
  const evaluated = evaluateFixedPointTen({
    criteria: header.criteria,
    goalReceipt,
    currentHead: header.observed_head,
  }, { nowMs, maxAgeMs });
  const suppliedRows = new Map(header.criteria.map((row) => [row.id, row]));
  const statusMismatch = evaluated.criteria.find((row) => suppliedRows.get(row.id)?.status !== row.status);
  if (statusMismatch) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_STATUS_MISMATCH", {
      criterion_id: statusMismatch.id,
      declared_status: suppliedRows.get(statusMismatch.id)?.status || null,
      evaluated_status: statusMismatch.status,
    });
  }
  const declaredVerdict = header.verdict;
  const declaredCursor = header.next_cursor;
  if (declaredVerdict !== evaluated.verdict || declaredCursor !== evaluated.next_cursor) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_VERDICT_MISMATCH", {
      evaluated_verdict: evaluated.verdict,
      declared_verdict: declaredVerdict || null,
      evaluated_next_cursor: evaluated.next_cursor,
      declared_next_cursor: declaredCursor || null,
    });
  }
  if (declaredVerdict === "FIXED_POINT"
    && (!evaluated.fixedPoint || declaredCursor !== "FIXED_POINT"
      || !goalReceipt || header.goal_receipt_ref !== goalReceipt.receipt_ref)) {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_FALSE_FIXED_POINT");
  }
  if (declaredVerdict !== "FIXED_POINT" && declaredCursor === "FIXED_POINT") {
    return blocked("BLOCKED_FIXED_POINT_EXECUTION_HEADER_FALSE_TERMINAL_CURSOR");
  }

  return {
    schema: EXECUTION_HEADER_SCHEMA,
    accepted: true,
    status: "PASS_FIXED_POINT_EXECUTION_HEADER",
    header_usage: evaluated.fixedPoint ? "USED_AND_FIXED_POINT" : "USED_WITH_GAPS",
    agent_id: header.agent_id,
    mission_id: header.mission_id,
    intent_id: header.intent_id,
    goal_fingerprint: header.goal_fingerprint,
    observed_head: header.observed_head,
    measured_at: header.measured_at,
    evaluator: header.evaluator,
    evaluation_ref: header.evaluation_ref,
    criteria_count: evaluated.total,
    criteria_pass: evaluated.counts.PASS,
    criteria_fail: evaluated.counts.FAIL,
    criteria_unknown: evaluated.counts.UNKNOWN,
    criteria_stale: evaluated.counts.STALE,
    criteria_blocked: evaluated.counts.BLOCKED,
    verdict: evaluated.verdict,
    next_cursor: evaluated.next_cursor,
    goal_receipt_status: evaluated.goal_receipt_status,
  };
}

const FIXED_POINT_TEN_MAX_AGE_MS = 15 * 60 * 1000;
const SOURCE_HASH = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/i;

/**
 * Avalia os dez critérios globais usados pelo HUD.
 * O HUD é projeção; este owner HORN decide o fechamento.
 * Um FIXED_POINT global também exige receipt de Goal canônico e recente.
 */
/**
 * Builds an agent execution header from current observations and immediately
 * validates it with the same canonical HORN owner. This function does not probe
 * the environment: callers must provide real attempts and source receipts.
 */
export function buildFixedPointExecutionHeader(input = {}, options = {}) {
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  const requiredContext = [
    "agent_id", "mission_id", "intent_id", "goal_fingerprint",
    "observed_head", "evaluation_ref", "execution_ref",
  ];
  const missing = requiredContext.filter((key) =>
    typeof input[key] !== "string" || input[key].trim().length === 0
  );
  if (missing.length) {
    return {
      schema: EXECUTION_HEADER_SCHEMA,
      accepted: false,
      status: "BLOCKED_FIXED_POINT_EXECUTION_HEADER_FIELDS_MISSING",
      header_usage: "NOT_USED",
      missing,
    };
  }

  const criteria = Array.isArray(input.criteria) ? input.criteria : [];
  const goalReceipt = input.goal_receipt && typeof input.goal_receipt === "object"
    ? input.goal_receipt
    : (input.goalReceipt && typeof input.goalReceipt === "object" ? input.goalReceipt : null);
  const evaluated = evaluateFixedPointTen({
    criteria,
    goalReceipt,
    currentHead: input.observed_head,
  }, options);
  const header = {
    schema: EXECUTION_HEADER_SCHEMA,
    evaluator: "scripts/lupa/horn-reuse-fixed-point.mjs",
    agent_id: input.agent_id,
    mission_id: input.mission_id,
    intent_id: input.intent_id,
    goal_fingerprint: input.goal_fingerprint,
    observed_head: input.observed_head,
    measured_at: input.measured_at || new Date(nowMs).toISOString(),
    evaluation_ref: input.evaluation_ref,
    execution_ref: input.execution_ref,
    criteria: evaluated.criteria,
    goal_receipt: goalReceipt,
    goal_receipt_ref: goalReceipt?.receipt_ref || null,
    verdict: evaluated.verdict,
    next_cursor: evaluated.next_cursor,
  };
  const validation = validateFixedPointExecutionHeader(header, {
    ...options,
    nowMs,
    expectedMissionId: input.mission_id,
    expectedHead: input.observed_head,
    expectedAgentId: input.agent_id,
  });
  return {
    ...validation,
    header,
    criteria: header.criteria,
    fixedPoint: evaluated.fixedPoint,
    verdict: evaluated.verdict,
    next_cursor: evaluated.next_cursor,
  };
}

export function evaluateFixedPointTen(input = {}, options = {}) {
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  const defaultMaxAgeMs = Number.isFinite(options.maxAgeMs) && options.maxAgeMs >= 0
    ? options.maxAgeMs : FIXED_POINT_TEN_MAX_AGE_MS;
  const supplied = Array.isArray(input.criteria) ? input.criteria : [];
  const byId = new Map();
  const ids = new Set(FIXED_POINT_TEN_CRITERIA.map((item) => item.id));

  for (const item of supplied) {
    if (!item || typeof item !== "object" || !ids.has(item.id)) {
      throw new Error("FIXED_POINT_TEN_UNKNOWN_CRITERION");
    }
    if (byId.has(item.id)) throw new Error("FIXED_POINT_TEN_DUPLICATE_CRITERION");
    byId.set(item.id, item);
  }

  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  const rows = FIXED_POINT_TEN_CRITERIA.map(({ id, label }) => {
    const item = byId.get(id);
    if (!item) return {
      id, label, required: true, status: "UNKNOWN", source: null,
      proof_ref: null, counterproof_ref: null, measured_at: null,
      next_cursor: "VERIFY_" + id,
    };

    const raw = String(item.status || "UNKNOWN").trim().toUpperCase();
    const observedAt = Date.parse(item.measured_at || "");
    const timestampValid = Number.isFinite(observedAt) &&
      /(?:Z|[+-]\d\d:\d\d)$/.test(item.measured_at || "");
    const maxAgeMs = Number.isFinite(item.max_age_ms) && item.max_age_ms >= 0
      ? item.max_age_ms : defaultMaxAgeMs;
    const tooFuture = timestampValid && observedAt > nowMs + 5000;
    const stale = !timestampValid || tooFuture || nowMs - observedAt > maxAgeMs;
    const evaluatedAt = Date.parse(item.evaluated_at || "");
    const attemptFresh = item.evaluated === true && hasText(item.attempt_ref)
      && validFreshTimestamp(item.evaluated_at, nowMs, maxAgeMs);
    const traceable = hasText(item.source) && hasText(item.proof_ref) &&
      hasText(item.counterproof_ref) && SOURCE_HASH.test(String(item.source_sha || "")) &&
      timestampValid && attemptFresh;
    let status = "UNKNOWN";

    if (raw === "FAIL" && traceable && item.counterproof_verdict === "REFUTED" && !stale) {
      status = "FAIL";
    } else if (raw === "BLOCKED" && traceable && !stale) {
      status = "BLOCKED";
    } else if (raw === "STALE" || (stale && raw !== "UNKNOWN")) {
      status = "STALE";
    } else if (raw === "PASS" && traceable && !stale &&
      item.counterproof_verdict === "NOT_REFUTED") {
      status = "PASS";
    } else if (raw === "UNKNOWN" || !traceable || stale) {
      status = stale && raw !== "UNKNOWN" ? "STALE" : "UNKNOWN";
    }

    return {
      id, label, required: true, status,
      source: hasText(item.source) ? item.source : null,
      source_sha: SOURCE_HASH.test(String(item.source_sha || "")) ? item.source_sha : null,
      proof_ref: hasText(item.proof_ref) ? item.proof_ref : null,
      counterproof_ref: hasText(item.counterproof_ref) ? item.counterproof_ref : null,
      counterproof_verdict: item.counterproof_verdict || "UNKNOWN",
      evaluated: item.evaluated === true && hasText(item.attempt_ref) && Number.isFinite(evaluatedAt),
      attempt_ref: hasText(item.attempt_ref) ? item.attempt_ref : null,
      evaluated_at: Number.isFinite(evaluatedAt) ? item.evaluated_at : null,
      reason: hasText(item.reason) ? item.reason : null,
      measured_at: timestampValid ? item.measured_at : null,
      next_cursor: status === "PASS" ? "CONTINUE" : "VERIFY_" + id,
    };
  });

  const counts = { PASS: 0, FAIL: 0, UNKNOWN: 0, STALE: 0, BLOCKED: 0 };
  for (const row of rows) counts[row.status] += 1;
  const requiredPass = rows.filter((row) => row.required && row.status === "PASS").length;
  const firstGap = rows.find((row) => row.status !== "PASS");

  const goal = input.goalReceipt && typeof input.goalReceipt === "object"
    ? input.goalReceipt : null;
  let goalReceiptValid = false;
  let goalReceiptState = "UNKNOWN";
  if (goal) {
    const receiptStamp = Date.parse(goal.measured_at || "");
    const receiptMaxAgeMs = Number(goal.max_age_ms);
    const receiptFresh = Number.isFinite(receiptStamp) &&
      /(?:Z|[+-]\d\d:\d\d)$/.test(goal.measured_at || "") &&
      receiptStamp <= nowMs + 5000 && nowMs - receiptStamp >= -5000 &&
      Number.isFinite(receiptMaxAgeMs) && receiptMaxAgeMs > 0 &&
      nowMs - receiptStamp <= receiptMaxAgeMs;
    const sameHead = !hasText(input.currentHead) ||
      (hasText(goal.main_sha) && goal.main_sha === input.currentHead);
    const evaluated = evaluateGoalClauses(goal, {
      nowMs,
      maxAgeMs: Number.isFinite(receiptMaxAgeMs) && receiptMaxAgeMs > 0
        ? receiptMaxAgeMs : defaultMaxAgeMs,
    });
    goalReceiptValid = goal.evaluator === "scripts/lupa/horn-reuse-fixed-point.mjs" &&
      receiptFresh && sameHead && evaluated.fixedPoint === true &&
      hasText(goal.receipt_ref) && goal.next_cursor === "FIXED_POINT";
    goalReceiptState = goalReceiptValid ? "PASS" : (!receiptFresh ? "STALE" : "UNKNOWN");
  }

  const fixedPoint = rows.length === FIXED_POINT_TEN_CRITERIA.length &&
    requiredPass === FIXED_POINT_TEN_CRITERIA.length && goalReceiptValid;
  const attemptsCurrent = rows.filter((row) => row.evaluated === true
    && hasText(row.attempt_ref)
    && validFreshTimestamp(row.evaluated_at, nowMs, defaultMaxAgeMs)).length;
  const headerUsage = attemptsCurrent === FIXED_POINT_TEN_CRITERIA.length
    ? (fixedPoint ? "USED_AND_FIXED_POINT" : "USED_WITH_GAPS")
    : "NOT_USED";
  const nextCursor = firstGap ? "VERIFY_" + firstGap.id
    : (!goalReceiptValid ? "GOAL_RECEIPT_REQUIRED" : "FIXED_POINT");

  return {
    schema: "centraldark.fixed-point.ten.v1",
    owner: "scripts/lupa/horn-reuse-fixed-point.mjs",
    observedAt: new Date(nowMs).toISOString(),
    total: FIXED_POINT_TEN_CRITERIA.length,
    required_total: FIXED_POINT_TEN_CRITERIA.length,
    required_pass: requiredPass,
    criteria_attempts_current: attemptsCurrent,
    criteria_attempts_required: FIXED_POINT_TEN_CRITERIA.length,
    header_usage: headerUsage,
    counts,
    criteria: rows,
    goal_receipt_status: goalReceiptState,
    current_head: hasText(input.currentHead) ? input.currentHead : null,
    fixedPoint,
    verdict: fixedPoint ? "FIXED_POINT" : "NEXT_DELTA",
    next_cursor: nextCursor,
    proof_boundary: "HUD_IS_PROJECTION; ALL_TEN_CRITERIA_AND_CURRENT_GOAL_RECEIPT_REQUIRED; UNKNOWN_IS_NOT_PASS",
  };
}

export function selfTest() {
  const reuse = decideReuse({ existingOwner: true, sameIntent: true, fullFit: true });
  if (reuse.decision !== "REUSE") throw new Error("SELF_TEST_REUSE_FAIL");

  const create = decideReuse({ noExistingOwnerProved: true, materialGapProven: true, extendInsufficient: true });
  if (create.decision !== "CREATE_MINIMAL") throw new Error("SELF_TEST_CREATE_FAIL");

  const learned = decideReuse({ errorObserved: true, newRemedyProved: true, sameErrorSignature: true });
  if (!learned.facts.includes("PROMOTE_LEARNING") || learned.decision !== "REUSE") {
    throw new Error("SELF_TEST_LEARNING_FAIL");
  }

  return true;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  if (process.argv.includes("--self-test")) {
    selfTest();
    console.log("HORN_REUSE_FIXED_POINT=PASS");
    console.log("REUSE_BEFORE_CREATE=ENFORCED_BY_RULE_SET");
    console.log("LEARN_AFTER_PROVED_ERROR=PASS");
  } else if (process.argv.includes("--build-execution-header-stdin")) {
    const input = JSON.parse(readFileSync(0, "utf8"));
    const ageArg = process.argv.find((arg) => arg.startsWith("--max-age-ms="));
    const age = ageArg ? Number(ageArg.slice("--max-age-ms=".length)) : null;
    const options = ageArg && Number.isFinite(age) && age > 0 ? { maxAgeMs: age } : {};
    const result = buildFixedPointExecutionHeader(input, options);
    console.log(JSON.stringify(result, null, 2));
    if (!result.accepted) process.exitCode = 13;
  } else if (process.argv.includes("--validate-execution-header-stdin")) {
    const header = JSON.parse(readFileSync(0, "utf8"));
    const result = validateFixedPointExecutionHeader(header);
    console.log(JSON.stringify(result, null, 2));
    if (!result.accepted) process.exitCode = 13;
  } else if (process.argv.includes("--fixed-point-ten-stdin")) {
    const input = JSON.parse(readFileSync(0, "utf8"));
    const ageArg = process.argv.find((arg) => arg.startsWith("--max-age-ms="));
    const age = ageArg ? Number(ageArg.slice("--max-age-ms=".length)) : null;
    const options = ageArg && Number.isFinite(age) && age >= 0 ? { maxAgeMs: age } : {};
    console.log(JSON.stringify(evaluateFixedPointTen(input, options), null, 2));
  } else if (process.argv.includes("--goal-stdin")) {
    // Read sanitized receipts via stdin, not process arguments; never mutate source.
    const goal = JSON.parse(readFileSync(0, "utf8"));
    const ageArg = process.argv.find((arg) => arg.startsWith("--max-age-ms="));
    const age = ageArg ? Number(ageArg.slice("--max-age-ms=".length)) : null;
    const options = ageArg && Number.isFinite(age) && age >= 0 ? { maxAgeMs: age } : {};
    console.log(JSON.stringify(evaluateGoalClauses(goal, options), null, 2));
  } else {
    const raw = process.argv.find((arg) => arg.startsWith("--input-json="));
    if (!raw) {
      console.error("usage: horn-reuse-fixed-point.mjs --self-test | --goal-stdin [--max-age-ms=N] | --fixed-point-ten-stdin [--max-age-ms=N] | --build-execution-header-stdin | --validate-execution-header-stdin | --input-json='{...}'");
      process.exit(2);
    }
    const input = JSON.parse(raw.slice("--input-json=".length));
    console.log(JSON.stringify(decideReuse(input), null, 2));
  }
}

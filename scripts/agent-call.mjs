#!/usr/bin/env node
/**
 * CentralDark Universal Agent Call — gate determinístico.
 * CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED
 *
 * Não executa modelo, não concede autoridade e não escreve no escopo chamado.
 * Valida CALL, retorno de delegação, obrigação de delegar e recuperação
 * determinística da mesma missão/trilho (HEALING_STREET).
 * Transporte (MCP/HTTP/CLI/Telegram/etc.) fica fora deste núcleo.
 */
import { readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";

const PROTOCOL = "CENTRALDARK_AGENT_CALL_V1";
const GLOBAL_CONTRACT_SCOPE_ID = "canon/centraldark-universal-contract-20260919";
const GLOBAL_CONTRACT_SCHEMA_MIN = 6;
const ALLOWED_ROLES = new Set([
  "COORDINATOR", "EXECUTOR", "DEBUGGER", "REVIEWER", "JUDGE", "HERMES", "READ_ONLY",
]);
const WRITE_ROLES = new Set(["EXECUTOR", "HERMES"]);
const DELEGATION_ROLES = new Set(["DEBUGGER", "REVIEWER", "JUDGE", "READ_ONLY"]);
const CLOSED_FRONTIER_STATES = new Set(["CLOSED", "DONE", "RESOLVED"]);
const HEALING_LEVELS = ["WELD", "REBUILD_LOCAL", "JUMP_BRIDGE"];
const LOG_INCIDENT_FRONTS = Object.freeze([
  "AUTH_OAUTH",
  "MCP_RUNTIME",
  "HUB_DATABASE",
  "ROUTING_NETWORK",
  "PROCESS_RUNTIME",
  "GITHUB_CI",
  "CONFIG_PROVENANCE",
  "SCREEN_OPTIONAL",
]);
const LOG_CORRELATION_FIELDS = Object.freeze(["cid", "correlation_id", "request_id", "trace_id", "span_id"]);
export const SCOPE_HOT_MS = 60_000;
export const SCOPE_WARM_MS = 120_000;

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(nonEmpty);
}

function asScopeList(value) {
  if (Array.isArray(value)) return value.filter(nonEmpty);
  return nonEmpty(value) ? [value] : [];
}

function activityActor(activity) {
  return activity?.actor || activity?.agent || activity?.writer || null;
}

function activityScopes(activity, fallback = []) {
  const explicit = asScopeList(activity?.scope ?? activity?.scopes);
  return explicit.length ? explicit : fallback;
}

/**
 * Temperatura MetaLupa do escopo. A identidade do agente é somente proveniência:
 * o gate olha colisão temporal no mesmo escopo, não marca/modelo.
 *
 * HOT  <= 60s  -> outro ator espera a próxima rodada.
 * WARM <= 120s -> outro ator ainda espera a próxima rodada.
 * COLD > 120s  -> takeover pode seguir se os demais gates passarem.
 * UNKNOWN      -> mantém o guard estático legado, evitando falso-verde.
 */
export function scopeTemperature(call, state, now = Date.now()) {
  const requestedScope = asScopeList(call?.scope);
  const activities = Array.isArray(state?.scope_activity)
    ? state.scope_activity.filter((item) => item && typeof item === "object")
    : [];

  if (state?.writer?.touched_at) {
    activities.push({
      actor: state.writer.agent || null,
      touched_at: state.writer.touched_at,
      scope: state.writer.scope || requestedScope,
      source: "writer-fallback",
    });
  }

  const relevant = activities
    .map((activity) => {
      const stamp = Date.parse(String(activity?.touched_at || activity?.timestamp || ""));
      if (!Number.isFinite(stamp)) return null;
      const scopes = activityScopes(activity, requestedScope);
      if (requestedScope.length && scopes.length && !scopes.some((scope) => requestedScope.includes(scope))) return null;
      return {
        actor: activityActor(activity),
        touched_at: new Date(stamp).toISOString(),
        age_ms: Math.max(0, now - stamp),
        scopes,
        source: activity?.source || "scope_activity",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.age_ms - b.age_ms);

  const latest = relevant[0];
  if (!latest) {
    return {
      temperature: "UNKNOWN",
      actor: null,
      age_ms: null,
      retry_after_ms: null,
      touched_at: null,
      source: null,
    };
  }

  if (latest.actor && latest.actor === call?.to) {
    return {
      temperature: "SELF",
      actor: latest.actor,
      age_ms: latest.age_ms,
      retry_after_ms: 0,
      touched_at: latest.touched_at,
      source: latest.source,
    };
  }

  if (latest.age_ms <= SCOPE_HOT_MS) {
    return {
      temperature: "HOT",
      actor: latest.actor,
      age_ms: latest.age_ms,
      retry_after_ms: SCOPE_WARM_MS - latest.age_ms + 1,
      touched_at: latest.touched_at,
      source: latest.source,
    };
  }
  if (latest.age_ms <= SCOPE_WARM_MS) {
    return {
      temperature: "WARM",
      actor: latest.actor,
      age_ms: latest.age_ms,
      retry_after_ms: SCOPE_WARM_MS - latest.age_ms + 1,
      touched_at: latest.touched_at,
      source: latest.source,
    };
  }
  return {
    temperature: "COLD",
    actor: latest.actor,
    age_ms: latest.age_ms,
    retry_after_ms: 0,
    touched_at: latest.touched_at,
    source: latest.source,
  };
}

export function validateLogIncidentFanout(event) {
  const base = {
    protocol: PROTOCOL,
    gate: "LOG_INCIDENT_FANOUT",
    sensor: "/admin/api/logs",
    write_authorized: false,
  };
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return { ...base, status: "BLOCKED_LOG_INCIDENT_EVENT_MISSING", accepted: false, fanout_required: false };
  }
  const endpoint = String(event?.source_endpoint || event?.endpoint || event?.source || "");
  if (endpoint !== "/admin/api/logs") {
    return { ...base, status: "BLOCKED_LOG_INCIDENT_SENSOR_MISMATCH", accepted: false, fanout_required: false, observed_sensor: endpoint || null };
  }
  if (event.material !== true) {
    return { ...base, status: "NOT_APPLICABLE_LOG_SIGNAL_NOT_MATERIAL", accepted: true, fanout_required: false };
  }
  if (!nonEmpty(event.target)) {
    return { ...base, status: "BLOCKED_LOG_INCIDENT_TARGET_MISSING", accepted: false, fanout_required: false };
  }
  const correlation = {};
  for (const field of LOG_CORRELATION_FIELDS) {
    if (nonEmpty(event[field])) correlation[field] = event[field];
  }
  if (Object.keys(correlation).length === 0) {
    return { ...base, status: "BLOCKED_LOG_INCIDENT_CORRELATION_MISSING", accepted: false, fanout_required: false, target: event.target };
  }
  const fronts = LOG_INCIDENT_FRONTS.map((id) => ({
    id,
    mode: "READ_ONLY",
    write_authorized: false,
    target: event.target,
    correlation,
  }));
  return {
    ...base,
    status: "PASS_LOG_INCIDENT_FANOUT_PLAN",
    accepted: true,
    fanout_required: true,
    target: event.target,
    correlation,
    fronts,
    rendezvous: "BY_TARGET_TRACE_OWNER",
    mutation_policy: "PARALLEL_ONLY_FOR_PROVEN_DISJOINT_SCOPES_SERIAL_WITHIN_EACH_SCOPE",
    same_scope_concurrent_writers: false,
    one_active_writer_per_mutable_scope: true,
    next_cursor: "RENDEZVOUS_THEN_REMEDIATE_BY_EXISTING_OWNER",
  };
}

function fail(reason, call, extra = {}) {
  return {
    protocol: PROTOCOL,
    call_id: call?.call_id || null,
    mission_id: call?.mission_id || null,
    status: reason,
    accepted: false,
    write_authorized: false,
    ...extra,
  };
}


const ROOT_CONTRACT_REF = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const TLC23_CANONICAL_SHA256 = "b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1";

function lineageStatus(reason, child = null, extra = {}) {
  return {
    protocol: PROTOCOL,
    gate: "CHILD_CONTRACT_LINEAGE",
    status: reason,
    accepted: false,
    root_goal_id: child?.root_goal_id || null,
    child_contract_id: child?.child_contract_id || null,
    self_goal_id: child?.self_goal_id || null,
    ...extra,
  };
}

export function validateChildContractLineage(child, state = null) {
  if (!child || typeof child !== "object" || Array.isArray(child)) {
    return lineageStatus("BLOCKED_CHILD_CONTRACT_MISSING", child);
  }

  const required = [
    "root_contract_ref",
    "root_contract_schema",
    "root_goal_id",
    "parent_contract_id",
    "child_contract_id",
    "self_goal_id",
    "owner",
    "scope",
    "expected_delta",
    "done_condition",
    "evidence_required",
    "counterproof",
    "dependencies",
    "next_cursor",
    "status",
    "root_authority",
    "tlc23_horn_gate",
  ];
  const missing = required.filter((key) => child[key] === undefined || child[key] === null || child[key] === "");
  if (missing.length) return lineageStatus("BLOCKED_CHILD_CONTRACT_FIELDS_MISSING", child, { missing });

  if (child.root_contract_ref !== ROOT_CONTRACT_REF) {
    return lineageStatus("BLOCKED_CHILD_ROOT_CONTRACT_MISMATCH", child);
  }
  if (!Number.isInteger(child.root_contract_schema) || child.root_contract_schema < GLOBAL_CONTRACT_SCHEMA_MIN) {
    return lineageStatus("BLOCKED_CHILD_ROOT_SCHEMA_STALE", child);
  }
  if (child.root_authority !== "SEGREDO/CHEFE") {
    return lineageStatus("BLOCKED_CHILD_AUTHORITY_EXPANSION", child);
  }

  const liveRootGoal = state?.root_goal;
  if (liveRootGoal?.id && child.root_goal_id !== liveRootGoal.id) {
    return lineageStatus("BLOCKED_CHILD_ROOT_GOAL_CHANGE", child, { expected_root_goal_id: liveRootGoal.id });
  }
  if (liveRootGoal?.authority && liveRootGoal.authority !== child.root_authority) {
    return lineageStatus("BLOCKED_CHILD_ROOT_AUTHORITY_DRIFT", child);
  }

  const childScope = asScopeList(child.scope);
  if (childScope.length === 0) return lineageStatus("BLOCKED_CHILD_SCOPE_MISSING", child);
  const allowed = Array.isArray(state?.scope?.allowed) ? state.scope.allowed : [];
  if (allowed.length && childScope.some((scope) => !allowed.includes(scope))) {
    return lineageStatus("BLOCKED_CHILD_SCOPE_EXPANSION", child, { allowed_scope: allowed });
  }
  const parentScope = asScopeList(liveRootGoal?.scope);
  if (parentScope.length && childScope.some((scope) => !parentScope.includes(scope))) {
    return lineageStatus("BLOCKED_CHILD_PARENT_SCOPE_EXPANSION", child, { parent_scope: parentScope });
  }

  const tlc23 = child.tlc23_horn_gate;
  if (!tlc23 || tlc23.status !== "PASS") {
    return lineageStatus("BLOCKED_CHILD_TLC23_HORN_NOT_PASS", child);
  }
  if (tlc23.pdf_sha256 !== TLC23_CANONICAL_SHA256) {
    return lineageStatus("BLOCKED_CHILD_TLC23_PDF_HASH_MISMATCH", child, {
      expected_pdf_sha256: TLC23_CANONICAL_SHA256,
    });
  }
  if (!nonEmpty(tlc23.evidence_ref)) {
    return lineageStatus("BLOCKED_CHILD_TLC23_EVIDENCE_MISSING", child);
  }

  const prior = Array.isArray(state?.self_goal_receipts) ? state.self_goal_receipts : [];
  if (prior.some((receipt) => receipt?.self_goal_id === child.self_goal_id && receipt?.status !== "SUPERSEDED")) {
    return lineageStatus("BLOCKED_DUPLICATE_SELF_GOAL", child);
  }

  return {
    protocol: PROTOCOL,
    gate: "CHILD_CONTRACT_LINEAGE",
    status: "PASS_CHILD_CONTRACT_LINEAGE",
    accepted: true,
    root_contract_ref: child.root_contract_ref,
    root_contract_schema: child.root_contract_schema,
    root_goal_id: child.root_goal_id,
    parent_contract_id: child.parent_contract_id,
    child_contract_id: child.child_contract_id,
    self_goal_id: child.self_goal_id,
    owner: child.owner,
    scope: childScope,
    next_cursor: child.next_cursor,
    tlc23_pdf_sha256: tlc23.pdf_sha256,
    tlc23_evidence_ref: tlc23.evidence_ref,
  };
}

export function deriveSelfGoal(spec, state = null) {
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    return lineageStatus("BLOCKED_SELF_GOAL_SPEC_MISSING", spec);
  }
  const root = state?.root_goal;
  if (!root?.id || root?.authority !== "SEGREDO/CHEFE") {
    return lineageStatus("BLOCKED_ROOT_GOAL_UNPROVEN", spec);
  }
  if (spec.material_delta !== true) {
    return {
      protocol: PROTOCOL,
      gate: "SELF_GOAL_DERIVATION",
      status: "CHECKPOINT_CONTINUE",
      accepted: true,
      fixed_point_checkpoint: true,
      heartbeat_continues: true,
      root_goal_id: root.id,
      next_cursor: spec.next_cursor || "HEARTBEAT_REMEASURE",
    };
  }

  const scope = asScopeList(spec.scope);
  const fingerprint = [
    root.id,
    spec.parent_contract_id || "ROOT",
    spec.owner || "",
    scope.join(","),
    spec.expected_delta || "",
    spec.done_condition || "",
    spec.next_cursor || "",
  ].join("|");
  const id = createHash("sha256").update(fingerprint).digest("hex").slice(0, 24);
  const child = {
    root_contract_ref: ROOT_CONTRACT_REF,
    root_contract_schema: GLOBAL_CONTRACT_SCHEMA_MIN,
    root_goal_id: root.id,
    parent_contract_id: spec.parent_contract_id || "ROOT",
    child_contract_id: spec.child_contract_id || \`CC-\${id}\`,
    self_goal_id: spec.self_goal_id || \`SG-\${id}\`,
    owner: spec.owner,
    scope,
    expected_delta: spec.expected_delta,
    done_condition: spec.done_condition,
    evidence_required: spec.evidence_required,
    counterproof: spec.counterproof,
    dependencies: Array.isArray(spec.dependencies) ? spec.dependencies : [],
    next_cursor: spec.next_cursor,
    status: "PENDING",
    root_authority: root.authority,
    tlc23_horn_gate: spec.tlc23_horn_gate || state?.tlc23_horn_gate,
  };
  const validation = validateChildContractLineage(child, state);
  return validation.accepted
    ? { ...child, derivation_status: "PASS_SELF_GOAL_DERIVED", deterministic_fingerprint: id }
    : validation;
}

export function validateGlobalContractGate(gate, state = null, expectedPhase = "ENTRY") {
  const phase = String(expectedPhase || gate?.phase || "").toUpperCase();
  const status = (reason, extra = {}) => ({
    protocol: PROTOCOL,
    gate: "GLOBAL_CONTRACT_ENFORCER",
    phase,
    status: reason,
    accepted: false,
    write_authorized: false,
    scope_id: gate?.scope_id || null,
    observed_head: gate?.observed_head || null,
    ...extra,
  });
  if (!gate || typeof gate !== "object" || Array.isArray(gate)) return status("BLOCKED_GLOBAL_CONTRACT_GATE_MISSING");
  if (!["ENTRY", "EXIT"].includes(phase)) return status("BLOCKED_GLOBAL_CONTRACT_PHASE_INVALID");
  if (String(gate.phase || "").toUpperCase() !== phase) return status("BLOCKED_GLOBAL_CONTRACT_PHASE_MISMATCH");
  if (gate.scope_id !== GLOBAL_CONTRACT_SCOPE_ID) return status("BLOCKED_GLOBAL_CONTRACT_SCOPE_MISMATCH");
  if (!Number.isInteger(gate.contract_schema) || gate.contract_schema < GLOBAL_CONTRACT_SCHEMA_MIN) return status("BLOCKED_GLOBAL_CONTRACT_SCHEMA_STALE");
  if (!nonEmpty(gate.observed_head)) return status("BLOCKED_GLOBAL_CONTRACT_HEAD_MISSING");
  if (state?.head?.sha && gate.observed_head !== state.head.sha) {
    return status("BLOCKED_STALE_HEAD", { expected_head: state.head.sha });
  }
  if (!nonEmpty(gate.trace_id)) return status("BLOCKED_GLOBAL_CONTRACT_TRACE_MISSING");
  if (!nonEmpty(gate.next_cursor) && gate.fixed_point !== true) return status("BLOCKED_GLOBAL_CONTRACT_NEXT_CURSOR_MISSING");

  const pass = (obj) => obj && typeof obj === "object" && obj.status === "PASS";
  if (phase === "ENTRY") {
    const childLineage = validateChildContractLineage(gate.child_contract, state);
    if (childLineage.accepted !== true) return status(childLineage.status, { child_contract_lineage: childLineage });
    if (!gate.tlc23_horn_gate || gate.tlc23_horn_gate.status !== "PASS" || gate.tlc23_horn_gate.pdf_sha256 !== TLC23_CANONICAL_SHA256 || !nonEmpty(gate.tlc23_horn_gate.evidence_ref)) return status("BLOCKED_GLOBAL_CONTRACT_TLC23_HORN_GATE");
    if (!pass(gate.github_t0) || !nonEmpty(gate.github_t0.head_sha)) return status("BLOCKED_GLOBAL_CONTRACT_GITHUB_T0");
    if (!pass(gate.vps_t0) || !nonEmpty(gate.vps_t0.head_sha)) return status("BLOCKED_GLOBAL_CONTRACT_VPS_T0");
    if (gate.cross_surface_drift_classified !== true) return status("BLOCKED_GLOBAL_CONTRACT_DRIFT_UNCLASSIFIED");
    if (!pass(gate.owner_proof) || !nonEmpty(gate.owner_proof.owner)) return status("BLOCKED_GLOBAL_CONTRACT_OWNER_UNPROVEN");
    if (!pass(gate.writer_scope_proof) || !nonEmpty(gate.writer_scope_proof.scope)) return status("BLOCKED_GLOBAL_CONTRACT_WRITER_UNPROVEN");
    if (!pass(gate.preflight) || !nonEmpty(gate.preflight.evidence_ref)) return status("BLOCKED_GLOBAL_CONTRACT_PREFLIGHT");
    if (!gate.counterproof_plan || gate.counterproof_plan.status !== "READY" || !nonEmpty(gate.counterproof_plan.evidence_ref)) return status("BLOCKED_GLOBAL_CONTRACT_COUNTERPROOF_PLAN");
    if (!gate.rollback || gate.rollback.status !== "PREPARED" || !nonEmpty(gate.rollback.evidence_ref)) return status("BLOCKED_GLOBAL_CONTRACT_ROLLBACK");
  } else {
    if (!pass(gate.github_t1) || !nonEmpty(gate.github_t1.head_sha)) return status("BLOCKED_GLOBAL_CONTRACT_GITHUB_T1");
    if (!pass(gate.vps_t1) || !nonEmpty(gate.vps_t1.head_sha)) return status("BLOCKED_GLOBAL_CONTRACT_VPS_T1");
    if (!pass(gate.counterproof) || !nonEmpty(gate.counterproof.evidence_ref)) return status("BLOCKED_GLOBAL_CONTRACT_COUNTERPROOF");
    if (!nonEmpty(gate.receipt_ref)) return status("BLOCKED_GLOBAL_CONTRACT_RECEIPT");
    if (!gate.hud || gate.hud.status !== "PASS" || !nonEmpty(gate.hud.state_hash)) return status("BLOCKED_GLOBAL_CONTRACT_HUD");
    if (gate.runtime_mutated === true && (!pass(gate.runtime_proof) || !nonEmpty(gate.runtime_proof.evidence_ref))) {
      return status("BLOCKED_GLOBAL_CONTRACT_RUNTIME_PROOF");
    }
    if (gate.promotion_requested === true && (!pass(gate.same_head_ci) || gate.same_head_ci.head_sha !== gate.observed_head)) {
      return status("BLOCKED_GLOBAL_CONTRACT_SAME_HEAD_CI");
    }
    if (gate.fixed_point === true && gate.aggregate_fixed_point_pass !== true) return status("BLOCKED_GLOBAL_CONTRACT_FALSE_FIXED_POINT");
  }
  return {
    protocol: PROTOCOL,
    gate: "GLOBAL_CONTRACT_ENFORCER",
    phase,
    status: "PASS_GLOBAL_CONTRACT_GATE",
    accepted: true,
    write_authorized: phase === "ENTRY",
    scope_id: gate.scope_id,
    contract_schema: gate.contract_schema,
    observed_head: gate.observed_head,
    trace_id: gate.trace_id,
    next_cursor: gate.next_cursor || null,
    fixed_point: gate.fixed_point === true,
  };
}

function gateFail(reason, state, extra = {}) {
  return {
    protocol: PROTOCOL,
    gate: "REQUIRED_DELEGATION",
    mission_id: state?.mission_id || null,
    observed_head: state?.head?.sha || null,
    status: reason,
    accepted: false,
    required: true,
    ...extra,
  };
}

function healingGateFail(reason, state, extra = {}) {
  return {
    protocol: PROTOCOL,
    gate: "HEALING_STREET",
    mission_id: state?.mission_id || null,
    observed_head: state?.head?.sha || null,
    trail_id: state?.trail?.route_id || null,
    frontier_id: state?.healing?.frontier_id || null,
    status: reason,
    accepted: false,
    required: true,
    ...extra,
  };
}

function openDelegableFrontiers(state) {
  const raw = Array.isArray(state?.debug_frontiers)
    ? state.debug_frontiers
    : state?.debug_frontier
      ? [state.debug_frontier]
      : [];

  return raw.filter((frontier) => (
    frontier
    && typeof frontier === "object"
    && frontier.delegable === true
    && !CLOSED_FRONTIER_STATES.has(String(frontier.status || "OPEN").toUpperCase())
  ));
}

function getDelegationCapability(state) {
  const cap = state?.capabilities?.delegate_agents;
  if (
    !cap
    || typeof cap !== "object"
    || typeof cap.supported !== "boolean"
    || !nonEmpty(cap.source)
    || !nonEmpty(cap.evidence_ref)
  ) {
    return { known: false, supported: null };
  }
  return {
    known: true,
    supported: cap.supported,
    source: cap.source,
    evidence_ref: cap.evidence_ref,
  };
}

function resultReceiptMatchesFrontier(receipt, frontier, state) {
  const routeId = state?.trail?.route_id || null;
  return Boolean(
    receipt
    && receipt.protocol === PROTOCOL
    && receipt.receipt_type === "DELEGATION_RESULT"
    && receipt.accepted === true
    && receipt.status === "COMPLETED"
    && receipt.delegation_completed === true
    && receipt.mission_id === state.mission_id
    && receipt.observed_head === state?.head?.sha
    && receipt.frontier_id === frontier.id
    && receipt.from
    && receipt.to
    && receipt.from !== receipt.to
    && DELEGATION_ROLES.has(receipt.requested_role)
    && receipt.write_authorized === false
    && (!routeId || receipt.trail_id === routeId)
    && receipt.return_mode === "DELTA_MESSAGE"
    && nonEmpty(receipt.execution_ref)
    && receipt.delta_message !== undefined
    && receipt.delta_message !== null
  );
}

function currentHealingReceipts(state) {
  const routeId = state?.trail?.route_id || null;
  const frontierId = state?.healing?.frontier_id || null;
  const raw = Array.isArray(state?.healing_receipts) ? state.healing_receipts : [];
  return raw.filter((receipt) => (
    receipt
    && receipt.protocol === PROTOCOL
    && receipt.receipt_type === "HEALING_RESULT"
    && receipt.accepted === true
    && receipt.mission_id === state?.mission_id
    && receipt.observed_head === state?.head?.sha
    && receipt.trail_id === routeId
    && receipt.frontier_id === frontierId
    && HEALING_LEVELS.includes(receipt.level)
    && ["FAILED", "HEALED"].includes(receipt.status)
  ));
}

function nextHealingLevel(state) {
  const receipts = currentHealingReceipts(state);
  if (receipts.length === 0) return { done: false, receipts, next: "WELD" };
  if (receipts.length > HEALING_LEVELS.length) {
    return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTORY", next: null };
  }

  for (let index = 0; index < receipts.length; index += 1) {
    const receipt = receipts[index];
    const expectedLevel = HEALING_LEVELS[index];
    if (receipt.level !== expectedLevel) {
      return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTORY", next: null };
    }

    const isLast = index === receipts.length - 1;
    if (receipt.status === "HEALED") {
      if (receipt.healed !== true || !isLast) {
        return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTORY", next: null };
      }
      return { done: true, receipts, healedReceipt: receipt, next: null };
    }

    if (receipt.status !== "FAILED" || receipt.healed !== false) {
      return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTORY", next: null };
    }
  }

  if (receipts.length === HEALING_LEVELS.length) {
    return { done: false, receipts, exhausted: true, next: null };
  }
  return { done: false, receipts, next: HEALING_LEVELS[receipts.length] };
}

/**
 * Valida a volta do rádio. CALL_ACCEPTED não prova execução; só este receipt
 * DELEGATION_RESULT pode satisfazer o gate de delegação obrigatória.
 */
export function validateDelegationResult(result, callReceipt, state) {
  if (!result || typeof result !== "object") return fail("BLOCKED_INVALID_DELEGATION_RESULT", result);
  if (!state || typeof state !== "object") return fail("BLOCKED_UNKNOWN_MISSION", result);
  if (
    !callReceipt
    || callReceipt.protocol !== PROTOCOL
    || callReceipt.accepted !== true
    || callReceipt.status !== "ACCEPTED"
  ) {
    return fail("BLOCKED_CALL_RECEIPT_NOT_ACCEPTED", result);
  }
  if (!callReceipt.parent_call_id || !DELEGATION_ROLES.has(callReceipt.requested_role) || callReceipt.write_authorized !== false) {
    return fail("BLOCKED_CALL_NOT_READ_ONLY_DELEGATION", result);
  }

  const required = ["call_id", "mission_id", "from", "to", "observed_head", "frontier_id", "trail_id", "execution_ref", "delta_message"];
  const missing = required.filter((key) => (
    result[key] === undefined
    || result[key] === null
    || (typeof result[key] === "string" && result[key].trim() === "")
  ));
  if (missing.length) return fail("BLOCKED_INVALID_DELEGATION_RESULT", result, { missing });

  if (result.call_id !== callReceipt.call_id) return fail("BLOCKED_DELEGATION_CALL_MISMATCH", result);
  if (result.mission_id !== state.mission_id || result.mission_id !== callReceipt.mission_id) {
    return fail("BLOCKED_UNKNOWN_MISSION", result);
  }
  if (result.observed_head !== state?.head?.sha || result.observed_head !== callReceipt.observed_head) {
    return fail("BLOCKED_STALE_HEAD", result, { expected_head: state?.head?.sha || "UNKNOWN" });
  }
  if (result.frontier_id !== callReceipt.frontier_id) return fail("BLOCKED_FRONTIER_MISMATCH", result);
  if (result.trail_id !== callReceipt.trail_id) return fail("BLOCKED_ROUTE_DRIFT", result, { expected_trail: callReceipt.trail_id });
  if (result.from !== callReceipt.to || result.to !== callReceipt.from) return fail("BLOCKED_RADIO_DIRECTION_MISMATCH", result);
  if (result.status !== "COMPLETED") return fail("BLOCKED_DELEGATION_NOT_COMPLETED", result);

  return {
    protocol: PROTOCOL,
    receipt_type: "DELEGATION_RESULT",
    call_id: callReceipt.call_id,
    parent_call_id: callReceipt.parent_call_id,
    depth: callReceipt.depth,
    mission_id: callReceipt.mission_id,
    status: "COMPLETED",
    accepted: true,
    delegation_completed: true,
    write_authorized: false,
    from: callReceipt.from,
    to: callReceipt.to,
    requested_role: callReceipt.requested_role,
    observed_head: callReceipt.observed_head,
    frontier_id: callReceipt.frontier_id,
    trail_id: callReceipt.trail_id,
    execution_ref: result.execution_ref,
    delta_message: result.delta_message,
    evidence_refs: Array.isArray(result.evidence_refs) ? result.evidence_refs : [],
    return_mode: "DELTA_MESSAGE",
    radio_mode: "DELTA_ONLY",
  };
}

/**
 * Gate de fechamento: se há capacidade real comprovada + frente delegável,
 * exige um DELEGATION_RESULT válido por frente. Sem trabalho separável, não
 * cria agente ornamental.
 */
export function validateDelegationGate(state) {
  if (!state || typeof state !== "object") {
    return gateFail("BLOCKED_UNKNOWN_MISSION", state);
  }

  const frontiers = openDelegableFrontiers(state);
  if (frontiers.length === 0) {
    return {
      protocol: PROTOCOL,
      gate: "REQUIRED_DELEGATION",
      mission_id: state.mission_id || null,
      observed_head: state?.head?.sha || null,
      status: "NOT_APPLICABLE_NO_DELEGABLE_FRONTIER",
      accepted: true,
      required: false,
      delegated_frontiers: 0,
    };
  }

  const capability = getDelegationCapability(state);
  if (!capability.known) {
    return gateFail("BLOCKED_DELEGATION_CAPABILITY_UNKNOWN", state, {
      delegable_frontiers: frontiers.map((frontier) => frontier.id || null),
    });
  }
  if (capability.supported === false) {
    return {
      protocol: PROTOCOL,
      gate: "REQUIRED_DELEGATION",
      mission_id: state.mission_id || null,
      observed_head: state?.head?.sha || null,
      status: "NOT_APPLICABLE_CAPABILITY_UNAVAILABLE",
      accepted: true,
      required: false,
      capability_source: capability.source,
      capability_evidence_ref: capability.evidence_ref,
      delegable_frontiers: frontiers.map((frontier) => frontier.id || null),
    };
  }

  const invalidFrontiers = frontiers.filter((frontier) => !nonEmpty(frontier.id));
  if (invalidFrontiers.length) {
    return gateFail("BLOCKED_INVALID_DEBUG_FRONTIER", state);
  }

  const receipts = Array.isArray(state.delegation_receipts) ? state.delegation_receipts : [];
  const missing = frontiers
    .filter((frontier) => !receipts.some((receipt) => resultReceiptMatchesFrontier(receipt, frontier, state)))
    .map((frontier) => frontier.id);

  if (missing.length) {
    return gateFail("BLOCKED_REQUIRED_DELEGATION_MISSING", state, {
      missing_frontiers: missing,
      capability_source: capability.source,
      capability_evidence_ref: capability.evidence_ref,
    });
  }

  return {
    protocol: PROTOCOL,
    gate: "REQUIRED_DELEGATION",
    mission_id: state.mission_id,
    observed_head: state?.head?.sha || null,
    status: "PASS_REQUIRED_DELEGATION",
    accepted: true,
    required: true,
    capability_source: capability.source,
    capability_evidence_ref: capability.evidence_ref,
    delegated_frontiers: frontiers.map((frontier) => frontier.id),
    radio_mode: "DELTA_MESSAGE",
  };
}

/**
 * HEALING_STREET não abre outro trilho. Ele repara a continuidade do trilho
 * canônico depois de STITCH_FAILED, escalando sem repetição cega:
 * WELD -> REBUILD_LOCAL -> JUMP_BRIDGE -> BLOCKED.
 */
export function validateHealingGate(state) {
  if (!state || typeof state !== "object") return healingGateFail("BLOCKED_UNKNOWN_MISSION", state);
  if (state?.healing?.required !== true) {
    return {
      protocol: PROTOCOL,
      gate: "HEALING_STREET",
      mission_id: state.mission_id || null,
      observed_head: state?.head?.sha || null,
      trail_id: state?.trail?.route_id || null,
      status: "NOT_APPLICABLE_NO_HEALING_REQUIRED",
      accepted: true,
      required: false,
    };
  }
  if (state?.healing?.trigger !== "STITCH_FAILED") {
    return healingGateFail("BLOCKED_HEALING_TRIGGER_UNKNOWN", state);
  }
  if (!nonEmpty(state?.mission_id) || !nonEmpty(state?.head?.sha) || !nonEmpty(state?.trail?.route_id) || !nonEmpty(state?.healing?.frontier_id)) {
    return healingGateFail("BLOCKED_INVALID_HEALING_CONTEXT", state);
  }

  const progression = nextHealingLevel(state);
  if (progression.invalid) return healingGateFail(progression.invalid, state);
  if (progression.done) {
    const healed = progression.healedReceipt;
    return {
      protocol: PROTOCOL,
      gate: "HEALING_STREET",
      mission_id: state.mission_id,
      observed_head: state.head.sha,
      trail_id: state.trail.route_id,
      frontier_id: state.healing.frontier_id,
      status: "PASS_HEALING_RECOVERED",
      accepted: true,
      required: true,
      recovered_by: healed.level,
      receipt_ref: healed.result_ref || null,
    };
  }
  if (progression.exhausted) {
    return healingGateFail("BLOCKED_HEALING_EXHAUSTED", state, {
      exhausted_after: "JUMP_BRIDGE",
    });
  }

  return {
    protocol: PROTOCOL,
    gate: "HEALING_STREET",
    mission_id: state.mission_id,
    observed_head: state.head.sha,
    trail_id: state.trail.route_id,
    frontier_id: state.healing.frontier_id,
    status: `REQUIRED_${progression.next}`,
    accepted: false,
    required: true,
    next_level: progression.next,
    attempts_completed: progression.receipts.length,
  };
}

/**
 * Registra resultado de um nível de cura. Um resultado FAILED é um recibo
 * válido de falha e libera somente o próximo nível. Um HEALED só fecha após
 * teste + contraprova + revisão completa de ida e volta da fronteira afetada.
 */
export function validateHealingResult(result, state) {
  if (!result || typeof result !== "object") return fail("BLOCKED_INVALID_HEALING_RESULT", result);
  const gate = validateHealingGate(state);
  if (gate.status === "NOT_APPLICABLE_NO_HEALING_REQUIRED") return fail("BLOCKED_HEALING_NOT_REQUIRED", result);
  if (gate.status === "PASS_HEALING_RECOVERED") return fail("BLOCKED_HEALING_ALREADY_RECOVERED", result);
  if (gate.status === "BLOCKED_HEALING_EXHAUSTED") return fail("BLOCKED_HEALING_EXHAUSTED", result);
  if (!gate.next_level) return fail(gate.status || "BLOCKED_INVALID_HEALING_CONTEXT", result);

  const required = ["mission_id", "observed_head", "frontier_id", "trail_id", "level", "status", "result_ref"];
  const missing = required.filter((key) => !nonEmpty(result[key]));
  if (missing.length) return fail("BLOCKED_INVALID_HEALING_RESULT", result, { missing });
  if (result.mission_id !== state.mission_id) return fail("BLOCKED_UNKNOWN_MISSION", result);
  if (result.observed_head !== state.head.sha) return fail("BLOCKED_STALE_HEAD", result, { expected_head: state.head.sha });
  if (result.frontier_id !== state.healing.frontier_id) return fail("BLOCKED_FRONTIER_MISMATCH", result);
  if (result.trail_id !== state.trail.route_id) return fail("BLOCKED_ROUTE_DRIFT", result, { expected_trail: state.trail.route_id });
  if (result.level !== gate.next_level) {
    return fail("BLOCKED_HEALING_LEVEL_SKIP", result, { expected_level: gate.next_level });
  }
  if (!["FAILED", "HEALED"].includes(result.status)) return fail("BLOCKED_INVALID_HEALING_STATUS", result);
  if (!nonEmptyArray(result.evidence_refs)) return fail("BLOCKED_HEALING_EVIDENCE_MISSING", result);

  if (result.status === "FAILED") {
    if (!nonEmpty(result.failure_ref) || !nonEmpty(result.cause_ref)) {
      return fail("BLOCKED_HEALING_FAILURE_UNPROVEN", result);
    }
    return {
      protocol: PROTOCOL,
      receipt_type: "HEALING_RESULT",
      mission_id: result.mission_id,
      observed_head: result.observed_head,
      frontier_id: result.frontier_id,
      trail_id: result.trail_id,
      level: result.level,
      status: "FAILED",
      accepted: true,
      healed: false,
      result_ref: result.result_ref,
      failure_ref: result.failure_ref,
      cause_ref: result.cause_ref,
      evidence_refs: result.evidence_refs,
      next_level: HEALING_LEVELS[HEALING_LEVELS.indexOf(result.level) + 1] || "BLOCKED",
    };
  }

  const successRefs = [
    "test_ref",
    "counterproof_ref",
    "review_forward_ref",
    "review_backward_ref",
    "checkpoint_before",
    "checkpoint_after",
  ];
  const missingSuccess = successRefs.filter((key) => !nonEmpty(result[key]));
  if (missingSuccess.length) return fail("BLOCKED_HEALING_PROOF_INCOMPLETE", result, { missing: missingSuccess });
  if (result.postcondition_proven !== true || result.affected_frontier_revalidated !== true) {
    return fail("BLOCKED_HEALING_POSTCONDITION_UNPROVEN", result);
  }
  if (result.material_delta_after_review !== 0) {
    return fail("BLOCKED_HEALING_REVIEW_NOT_FIXED_POINT", result);
  }

  if (result.level === "JUMP_BRIDGE") {
    const bridge = result.bridge;
    if (!bridge || typeof bridge !== "object") return fail("BLOCKED_UNSAFE_BRIDGE", result);
    if (
      bridge.rejoins_same_trail !== true
      || bridge.target_checkpoint_proven !== true
      || bridge.authorization_preserved !== true
      || bridge.scope_preserved !== true
      || !Array.isArray(bridge.mandatory_gates_skipped)
      || bridge.mandatory_gates_skipped.length !== 0
    ) {
      return fail("BLOCKED_UNSAFE_BRIDGE", result);
    }
  }

  return {
    protocol: PROTOCOL,
    receipt_type: "HEALING_RESULT",
    mission_id: result.mission_id,
    observed_head: result.observed_head,
    frontier_id: result.frontier_id,
    trail_id: result.trail_id,
    level: result.level,
    status: "HEALED",
    accepted: true,
    healed: true,
    result_ref: result.result_ref,
    evidence_refs: result.evidence_refs,
    test_ref: result.test_ref,
    counterproof_ref: result.counterproof_ref,
    review_forward_ref: result.review_forward_ref,
    review_backward_ref: result.review_backward_ref,
    checkpoint_before: result.checkpoint_before,
    checkpoint_after: result.checkpoint_after,
    postcondition_proven: true,
    affected_frontier_revalidated: true,
    material_delta_after_review: 0,
    bridge: result.level === "JUMP_BRIDGE" ? result.bridge : null,
  };
}

export function validateAgentCall(call, state, now = Date.now()) {
  if (!call || typeof call !== "object") return fail("BLOCKED_INVALID_CALL", call);
  if (!state || typeof state !== "object") return fail("BLOCKED_UNKNOWN_MISSION", call);

  const required = ["mission_id", "from", "to", "requested_role", "observed_head", "scope", "requested_action"];
  const missing = required.filter((k) => call[k] === undefined || call[k] === null || call[k] === "");
  if (missing.length) return fail("BLOCKED_INVALID_CALL", call, { missing });

  if (call.mission_id !== state.mission_id) return fail("BLOCKED_UNKNOWN_MISSION", call);
  if (!ALLOWED_ROLES.has(call.requested_role)) return fail("BLOCKED_ROLE", call);

  const liveHead = state?.head?.sha;
  if (!liveHead || call.observed_head !== liveHead) {
    return fail("BLOCKED_STALE_HEAD", call, { expected_head: liveHead || "UNKNOWN" });
  }

  const routeId = state?.trail?.route_id || null;
  if (routeId) {
    if (!call.trail_id) return fail("BLOCKED_MISSING_TRAIL", call, { expected_trail: routeId });
    if (call.trail_id !== routeId) return fail("BLOCKED_ROUTE_DRIFT", call, { expected_trail: routeId });
  }

  const allowed = Array.isArray(state?.scope?.allowed) ? state.scope.allowed : [];
  const denied = Array.isArray(state?.scope?.denied) ? state.scope.denied : [];
  const requestedScope = Array.isArray(call.scope) ? call.scope : [call.scope];
  if (requestedScope.some((x) => denied.includes(x))) return fail("BLOCKED_OUT_OF_SCOPE", call);
  if (allowed.length && requestedScope.some((x) => !allowed.includes(x))) return fail("BLOCKED_OUT_OF_SCOPE", call);

  const temperature = scopeTemperature(call, state, now);
  const nested = Boolean(call.parent_call_id);
  if (nested) {
    if (!call.frontier_id || !Number.isInteger(call.depth) || call.depth < 1) {
      return fail("BLOCKED_INVALID_NESTED_CALL", call);
    }
    if (call.from === call.to) return fail("BLOCKED_SELF_DELEGATION", call);
  }

  const writeRequested = call.write_requested === true;
  if (writeRequested) {
    const globalGate = validateGlobalContractGate(call.global_contract_entry || state?.global_contract_entry, state, "ENTRY");
    if (globalGate.accepted !== true) return fail(globalGate.status, call, {
      global_contract_gate: globalGate,
    });
  }
  if (nested && writeRequested && call.writer_handoff_valid !== true) {
    return fail("BLOCKED_NESTED_WRITE_WITHOUT_HANDOFF", call);
  }

  if (writeRequested) {
    if (!WRITE_ROLES.has(call.requested_role)) return fail("BLOCKED_ROLE_CANNOT_WRITE", call);

    if (["HOT", "WARM"].includes(temperature.temperature) && temperature.actor !== call.to) {
      return fail("WAIT_SCOPE_HOT", call, {
        scope_temperature: temperature.temperature,
        scope_temperature_age_ms: temperature.age_ms,
        scope_temperature_actor: temperature.actor,
        scope_temperature_touch: temperature.touched_at,
        retry_after_ms: temperature.retry_after_ms,
        next_round: "REMEASURE_SCOPE_TEMPERATURE",
        meta_lupa: true,
        breaths_total: 17,
        delta_minimum: true,
      });
    }

    const writer = state?.writer?.agent;
    if (!writer || writer === "NONE") return fail("BLOCKED_NO_WRITER", call);
    if (writer !== call.to && temperature.temperature === "UNKNOWN") {
      return fail("BLOCKED_WRITER_CONFLICT", call, {
        current_writer: writer,
        scope_temperature: "UNKNOWN",
        next_round: "REQUIRE_TOUCH_TIMESTAMP_OR_HANDOFF",
      });
    }
    if (call.writer_handoff_required === true && call.writer_handoff_valid !== true) {
      return fail("BLOCKED_MISSING_HANDOFF", call);
    }
  }

  return {
    protocol: PROTOCOL,
    receipt_type: "CALL_ACCEPTED",
    call_id: call.call_id || randomUUID(),
    parent_call_id: call.parent_call_id || null,
    depth: nested ? call.depth : 0,
    frontier_id: call.frontier_id || null,
    mission_id: call.mission_id,
    status: "ACCEPTED",
    accepted: true,
    write_authorized: writeRequested,
    global_contract_gate: writeRequested ? "PASS" : "NOT_APPLICABLE_READ_ONLY",
    from: call.from,
    to: call.to,
    requested_role: call.requested_role,
    observed_head: call.observed_head,
    trail_id: call.trail_id || routeId,
    scope: requestedScope,
    requested_action: call.requested_action,
    scope_temperature: temperature.temperature,
    scope_temperature_age_ms: temperature.age_ms,
    scope_temperature_actor: temperature.actor,
    retry_after_ms: temperature.retry_after_ms,
    writer_takeover: Boolean(writeRequested && state?.writer?.agent && state.writer.agent !== call.to && temperature.temperature === "COLD"),
    meta_lupa: true,
    breaths_total: 17,
    delta_minimum: true,
    return_mode: "DELTA_MESSAGE",
    radio_mode: "DELTA_ONLY",
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--log-incident-fanout") {
    const eventPath = args[1];
    if (!eventPath) {
      console.error("uso: node scripts/agent-call.mjs --log-incident-fanout <event.json>");
      process.exit(2);
    }
    const event = await readFile(eventPath, "utf8").then(JSON.parse);
    const receipt = validateLogIncidentFanout(event);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  if (args[0] === "--global-contract-gate") {
    const [phase, gatePath, statePath] = args.slice(1);
    if (!phase || !gatePath) {
      console.error("uso: node scripts/agent-call.mjs --global-contract-gate <ENTRY|EXIT> <gate.json> [state.json]");
      process.exit(2);
    }
    const gate = await readFile(gatePath, "utf8").then(JSON.parse);
    const state = statePath ? await readFile(statePath, "utf8").then(JSON.parse) : null;
    const receipt = validateGlobalContractGate(gate, state, phase);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  if (args[0] === "--delegation-gate") {
    const statePath = args[1];
    if (!statePath) {
      console.error("uso: node scripts/agent-call.mjs --delegation-gate <jarvis-state.json>");
      process.exit(2);
    }
    const state = await readFile(statePath, "utf8").then(JSON.parse);
    const receipt = validateDelegationGate(state);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  if (args[0] === "--delegation-result") {
    const [resultPath, callReceiptPath, statePath] = args.slice(1);
    if (!resultPath || !callReceiptPath || !statePath) {
      console.error("uso: node scripts/agent-call.mjs --delegation-result <result.json> <call-receipt.json> <jarvis-state.json>");
      process.exit(2);
    }
    const [result, callReceipt, state] = await Promise.all([
      readFile(resultPath, "utf8").then(JSON.parse),
      readFile(callReceiptPath, "utf8").then(JSON.parse),
      readFile(statePath, "utf8").then(JSON.parse),
    ]);
    const receipt = validateDelegationResult(result, callReceipt, state);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  if (args[0] === "--healing-gate") {
    const statePath = args[1];
    if (!statePath) {
      console.error("uso: node scripts/agent-call.mjs --healing-gate <jarvis-state.json>");
      process.exit(2);
    }
    const state = await readFile(statePath, "utf8").then(JSON.parse);
    const receipt = validateHealingGate(state);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  if (args[0] === "--healing-result") {
    const [resultPath, statePath] = args.slice(1);
    if (!resultPath || !statePath) {
      console.error("uso: node scripts/agent-call.mjs --healing-result <result.json> <jarvis-state.json>");
      process.exit(2);
    }
    const [result, state] = await Promise.all([
      readFile(resultPath, "utf8").then(JSON.parse),
      readFile(statePath, "utf8").then(JSON.parse),
    ]);
    const receipt = validateHealingResult(result, state);
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    process.exit(receipt.accepted ? 0 : 13);
  }

  const [callPath, statePath] = args;
  if (!callPath || !statePath) {
    console.error("uso: node scripts/agent-call.mjs <call.json> <jarvis-state.json>");
    process.exit(2);
  }
  const [call, state] = await Promise.all([
    readFile(callPath, "utf8").then(JSON.parse),
    readFile(statePath, "utf8").then(JSON.parse),
  ]);
  const receipt = validateAgentCall(call, state);
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  process.exit(receipt.accepted ? 0 : 13);
}

if (process.argv[1]?.endsWith("agent-call.mjs")) {
  main().catch((error) => {
    console.error(JSON.stringify({ protocol: PROTOCOL, status: "BLOCKED_RUNTIME_ERROR", error: error.message }));
    process.exit(1);
  });
}

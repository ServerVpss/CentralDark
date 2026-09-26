# AGENTE - agent-call.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\agent-call.mjs
**SHA:** 87602d6783c8ed5c
**Timestamp:** 2026-08-28T02:57:32.451534
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- gate: "REQUIRED_DELEGATION",
- gate: "HEALING_STREET",
- gate: "REQUIRED_DELEGATION",
- gate: "REQUIRED_DELEGATION",
- gate: "REQUIRED_DELEGATION",
- gate: "HEALING_STREET",
- gate: "HEALING_STREET",
- gate: "HEALING_STREET",
- const gate = validateHealingGate(state);

### Gaps
- const missing = required.filter((key) => (
- const missing = frontiers
- const missing = required.filter((key) => !nonEmpty(result[key]));
- if (missingSuccess.length) return fail("BLOCKED_HEALING_PROOF_INCOMPLETE", result, { missing: missingSuccess });
- const missing = required.filter((k) => call[k] === undefined || call[k] === null || call[k] === "");

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * CentralDark Universal Agent Call — gate determinístico.
 *
 * Não executa modelo, não concede autoridade e não escreve no escopo chamado.
 * Valida CALL, retorno de delegação, obrigação de delegar e recuperação
 * determinística da mesma missão/trilho (HEALING_STREET).
 * Transporte (MCP/HTTP/CLI/Telegram/etc.) fica fora deste núcleo.
 */
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

const PROTOCOL = "CENTRALDARK_AGENT_CALL_V1";
const ALLOWED_ROLES = new Set([
  "COORDINATOR", "EXECUTOR", "DEBUGGER", "REVIEWER", "JUDGE", "HERMES", "READ_ONLY",
]);
const WRITE_ROLES = new Set(["EXECUTOR", "HERMES"]);
const DELEGATION_ROLES = new Set(["DEBUGGER", "REVIEWER", "JUDGE", "READ_ONLY"]);
const CLOSED_FRONTIER_STATES = new Set(["CLOSED", "DONE", "RESOLVED"]);
const HEALING_LEVELS = ["WELD", "REBUILD_LOCAL", "JUMP_BRIDGE"];

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(nonEmpty);
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
      return { done: false, receipts, invalid: "BLOCKED_INVALID_HEALING_HISTOR
```
// CentralDark — modelo/harness independente: contrato de guarda de nomes de ferramentas.
// SOURCE-ONLY: export puro; NÃO é hook instalado no Cline. Nenhuma execução remota.
export const TOOL_CALL_RED_SCHEMA = "centraldark.toolcall-red-guard.v1";

export function parseAdvertisedTools(errorText) {
  const source = String(errorText ?? "");
  const match = /Available tools:\s*([A-Za-z_][\w.-]*(?:\s*,\s*[A-Za-z_][\w.-]*)*)/i.exec(source);
  return match
    ? [...new Set(match[1].split(",").map((name) => name.trim()).filter(Boolean))]
    : [];
}

export function classifyToolName({
  requestedName,
  advertisedTools,
  resolverTools,
  errorText = "",
  previousFailures = [],
} = {}) {
  const requested = typeof requestedName === "string" ? requestedName : "";
  const offered = Array.isArray(advertisedTools)
    ? advertisedTools.filter((v) => typeof v === "string" && v.length > 0)
    : parseAdvertisedTools(errorText);
  const resolverKnown = Array.isArray(resolverTools);
  const resolvable = resolverKnown
    ? resolverTools.filter((v) => typeof v === "string" && v.length > 0)
    : null;
  const rejected = /AI_NoSuchToolError|rejected before execution/i.test(String(errorText));
  const inAdvertised = offered.includes(requested); // exact match: case/namespace matter
  const inResolver = resolverKnown && resolvable.includes(requested);
  const fingerprint = [
    rejected ? "AI_NoSuchToolError" : "PREFLIGHT",
    requested || "UNKNOWN",
    inAdvertised ? "ADVERTISED" : "NOT_ADVERTISED",
    resolverKnown ? (inResolver ? "RESOLVER_PRESENT" : "RESOLVER_MISSING") : "RESOLVER_UNKNOWN",
  ].join("|");
  const repeated = Array.isArray(previousFailures)
    ? previousFailures.filter((item) => item === fingerprint).length
    : 0;

  const base = {
    schema: TOOL_CALL_RED_SCHEMA,
    requestedName: requested,
    advertised: inAdvertised,
    resolverKnown,
    resolverPresent: inResolver,
    fingerprint,
    mayExecute: false,
    proof: false,
  };
  if (!requested) return { ...base, state: "UNKNOWN_NO_TOOL_NAME", next: "READ_ACTIVE_TOOL_SCHEMA" };
  if (offered.length === 0) return { ...base, state: "UNKNOWN_NO_ADVERTISED_TOOLSET", next: "READ_ACTIVE_TOOL_SCHEMA" };
  // STOP on repeated bad call, even when model tries to rationalize it.
  if (repeated >= 1 && rejected) return { ...base, state: "RETRY_LOOP_BLOCKED", next: "STOP_REPETITION_RECORD_RED" };
  if (!inAdvertised) return { ...base, state: "NOT_ADVERTISED", next: "RESOLVE_EXACT_NAME_FROM_ACTIVE_SCHEMA" };
  if (resolverKnown && !inResolver) return { ...base, state: "TOOL_REGISTRY_PARITY_BLOCKED", next: "COMPARE_ADVERTISED_VS_RESOLVER" };
  if (rejected) return { ...base, state: "ADVERTISED_BUT_REJECTED", next: "STOP_ALIAS_GUESSING_AND_DIAGNOSE_DISPATCH" };
  if (!resolverKnown) return { ...base, state: "UNKNOWN_RESOLVER", next: "CHECK_REAL_ROUTER_AND_SCHEMA" };
  return {
    ...base,
    state: "PREFLIGHT_MATCH_ONLY",
    mayExecute: true,
    next: "ONE_AUTHORIZED_SAFE_PROBE_AND_READBACK",
  };
}

// Idempotent label for a RED: same failure/host/tool surface is one incident.
// Caller stores the fingerprint + provenance in the *existing* receipt/PR.
export function redIdentity({ fingerprint, host = "UNKNOWN", surface = "UNKNOWN" } = {}) {
  return [surface, host, fingerprint || "UNKNOWN"].join("|");
}

// Envelope canônico de comunicação para resultados de tools MCP.
// Preserva o payload original e acrescenta somente metadados observáveis.
// Null legítimo do payload não é reescrito: UNKNOWN só é usado para
// informação de rastreio que não chegou a esta fronteira.
function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function stringifyFallback(value) {
  if (typeof value === "string") return value;
  try {
    const encoded = JSON.stringify(value);
    return encoded === undefined ? String(value) : encoded;
  } catch {
    return String(value);
  }
}

export function decorateToolResult(raw, {
  toolName = "UNKNOWN",
  correlationId = "UNKNOWN",
  startedAt = Date.now(),
  errorCode = "NONE",
} = {}) {
  const base = asObject(raw);
  const payload = Object.keys(base).length > 0
    ? base
    : { content: [{ type: "text", text: stringifyFallback(raw) }] };

  const isError = payload.isError === true || errorCode !== "NONE";
  const durationMs = Math.max(0, Date.now() - Number(startedAt || Date.now()));

  const centraldark = {
    schema: "centraldark.tool-call.v1",
    state: isError ? "ERROR" : "SUCCESS",
    ok: !isError,
    tool_name: String(toolName || "UNKNOWN"),
    correlation_id: String(correlationId || "UNKNOWN"),
    duration_ms: durationMs,
    error_state: isError ? "PRESENT" : "NONE",
    error_code: isError ? String(errorCode || "UNCLASSIFIED") : "NONE",
    action_is_proof: false,
    evidence_boundary: "MCP_TOOL_CALL_COMPLETED",
  };

  return {
    ...payload,
    isError,
    structuredContent: {
      ...asObject(payload.structuredContent),
      centraldark,
    },
    _meta: {
      ...asObject(payload._meta),
      centraldark,
    },
  };
}

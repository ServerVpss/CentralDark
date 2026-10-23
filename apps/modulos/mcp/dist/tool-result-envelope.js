// Envelope canônico de comunicação para resultados de tools MCP.
// Preserva o payload original e acrescenta somente metadados observáveis.
// Null legítimo do payload não é reescrito: UNKNOWN só é usado para
// informação de rastreio que não chegou a esta fronteira.
function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function stringifyFallback(value) {
    if (typeof value === "string")
        return value;
    try {
        const encoded = JSON.stringify(value);
        return encoded === undefined ? String(value) : encoded;
    }
    catch {
        return String(value);
    }
}
function safeTraceValue(value, maxLength = 180) {
    if (typeof value !== "string")
        return "UNKNOWN";
    const text = value.trim();
    if (!text || text.length > maxLength || /[\u0000-\u001f\u007f]/.test(text))
        return "UNKNOWN";
    // Trace identifiers are never a channel for credentials or private keys.
    if (/bearer\s+|-----BEGIN|api[_-]?key\s*[=:]|token\s*[=:]|password\s*[=:]/i.test(text))
        return "UNKNOWN";
    return text;
}
function legacyJsonResult(payload) {
    const text = Array.isArray(payload.content) && payload.content.length === 1
        ? payload.content[0]?.text : null;
    if (typeof text !== "string" || text.length > 65536 || !text.trimStart().startsWith("{"))
        return {};
    try {
        return asObject(JSON.parse(text));
    }
    catch {
        return {};
    }
}
// Read *reported* causal references only. The outer envelope cannot validate
// the runtime receipt and must never turn a completed tool call into a PASS.
function continuityFromPayload(payload, toolName) {
    const data = asObject(payload.structuredContent);
    const legacy = legacyJsonResult(payload);
    const delegation = asObject(data.centraldark_delegation);
    const diagnostic = asObject(legacy.diagnostico);
    const explicit = (field, alternate) => data[field] ?? legacy[field] ?? alternate;
    const sha = safeTraceValue(explicit("source_sha", legacy.sourceSha), 40);
    const receipt = safeTraceValue(explicit("receipt_ref", explicit("receipt_id", null)));
    const proof = safeTraceValue(explicit("proof_ref", explicit("proof_key", legacy.auditHash)));
    return {
        intent_id: safeTraceValue(explicit("intent_id", legacy.intentId)),
        owner: safeTraceValue(explicit("owner", null)),
        capability: safeTraceValue(delegation.tool ?? explicit("capability", toolName)),
        source_sha: /^[a-f0-9]{40}$/i.test(sha) ? sha : "UNKNOWN",
        proof_ref: proof,
        proof_verification: "NOT_VERIFIED_AT_ENVELOPE",
        recipe_fingerprint: safeTraceValue(explicit("recipe_fingerprint", null)),
        receipt_ref: receipt,
        next_cursor: safeTraceValue(explicit("next_cursor", explicit("nextCursor", diagnostic.nextCursor)), 240),
    };
}
// Clientes MCP que preferem structuredContent mostram só ele e descartam content.
// Espelha o resultado original ali para a leitura não chegar vazia; content segue intacto.
const MIRROR_MAX_CHARS = 65536;
function mirrorContent(payload) {
    const parts = Array.isArray(payload.content)
        ? payload.content.filter(c => c && c.type === "text" && typeof c.text === "string").map(c => c.text)
        : [];
    if (parts.length === 0)
        return {};
    const text = parts.join("\n");
    if (text.length > MIRROR_MAX_CHARS)
        return { result_truncated: true, result_chars: text.length };
    if (parts.length === 1 && text.trimStart().startsWith("{")) {
        try {
            return { result: JSON.parse(text) };
        }
        catch { /* texto simples abaixo */ }
    }
    return { result: text };
}
export function decorateToolResult(raw, { toolName = "UNKNOWN", correlationId = "UNKNOWN", startedAt = Date.now(), errorCode = "NONE", } = {}) {
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
        continuity: continuityFromPayload(payload, toolName),
    };
    return {
        ...payload,
        isError,
        structuredContent: {
            ...(Object.keys(asObject(payload.structuredContent)).length ? {} : mirrorContent(payload)),
            ...asObject(payload.structuredContent),
            centraldark,
        },
        _meta: {
            ...asObject(payload._meta),
            centraldark,
        },
    };
}
//# sourceMappingURL=tool-result-envelope.js.map
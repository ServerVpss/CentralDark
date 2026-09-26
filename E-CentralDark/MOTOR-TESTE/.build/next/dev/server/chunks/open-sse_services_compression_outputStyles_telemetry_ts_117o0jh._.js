module.exports = [
"[project]/open-sse/services/compression/outputStyles/telemetry.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildOutputStyleTelemetry",
    ()=>buildOutputStyleTelemetry
]);
// Benign (non-content-bypass) skips that must NOT be recorded as a bypass reason.
const BENIGN_SKIPS = new Set([
    "disabled",
    "no_styles",
    "no_messages",
    "already_applied"
]);
function buildOutputStyleTelemetry(input) {
    const ratio = input.tokensBefore > 0 ? input.tokensAfter / input.tokensBefore : 0;
    const record = {
        requestId: input.requestId,
        model: input.model,
        provider: input.provider,
        source: input.source,
        tokensBefore: input.tokensBefore,
        tokensAfter: input.tokensAfter,
        ratio
    };
    if (input.applied && input.appliedStyles && input.appliedStyles.length > 0) {
        record.outputStyles = input.appliedStyles;
    }
    if (!input.applied && input.skippedReason && !BENIGN_SKIPS.has(input.skippedReason)) {
        record.outputStyleBypass = input.skippedReason;
    }
    if (typeof input.outputTokens === "number") record.outputTokens = input.outputTokens;
    return record;
}
}),
];

//# sourceMappingURL=open-sse_services_compression_outputStyles_telemetry_ts_117o0jh._.js.map
module.exports = [
"[project]/src/lib/gamification/sharing.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBalance",
    ()=>getBalance,
    "getHistory",
    ()=>getHistory,
    "transferTokens",
    ()=>transferTokens
]);
/**
 * Token sharing — transfer tokens between API keys.
 *
 * @module lib/gamification/sharing
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
async function transferTokens(fromApiKeyId, toApiKeyId, amount, reason, idempotencyKey) {
    if (fromApiKeyId === toApiKeyId) {
        return {
            success: false,
            idempotencyKey: "",
            error: "Cannot transfer to yourself"
        };
    }
    if (amount <= 0) {
        return {
            success: false,
            idempotencyKey: "",
            error: "Amount must be positive"
        };
    }
    const key = idempotencyKey || __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID();
    try {
        const { transferTokens: dbTransfer } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
        const result = dbTransfer(fromApiKeyId, toApiKeyId, amount, reason || "transfer", key);
        if (!result.success) {
            return {
                success: false,
                idempotencyKey: key,
                error: result.error
            };
        }
        return {
            success: true,
            idempotencyKey: key
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return {
            success: false,
            idempotencyKey: key,
            error: message
        };
    }
}
async function getBalance(apiKeyId) {
    const { getBalance: dbGetBalance } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
    return dbGetBalance(apiKeyId);
}
async function getHistory(apiKeyId, limit = 20) {
    const { getHistory: dbGetHistory } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
    return dbGetHistory(apiKeyId, limit);
}
}),
];

//# sourceMappingURL=src_lib_gamification_sharing_ts_03gnh7p._.js.map
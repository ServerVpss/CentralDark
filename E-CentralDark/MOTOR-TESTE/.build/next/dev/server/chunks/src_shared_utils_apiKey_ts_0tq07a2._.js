module.exports = [
"[project]/src/shared/utils/apiKey.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateApiKeyWithMachine",
    ()=>generateApiKeyWithMachine,
    "parseApiKey",
    ()=>parseApiKey
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
// FASE-01: No hardcoded fallback — enforced by secretsValidator at startup
if (!process.env.API_KEY_SECRET) {
    console.error("[SECURITY] API_KEY_SECRET is not set. API key CRC validation is disabled.");
}
function getApiKeySecret() {
    const secret = process.env.API_KEY_SECRET;
    if (!secret || secret.trim() === "") {
        throw new Error("API_KEY_SECRET is required for API key CRC operations. " + "The startup validator (instrumentation-node.ts) should have set this automatically.");
    }
    return secret;
}
/**
 * Generate 6-char random keyId
 */ function generateKeyId() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    result = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(3).toString("hex");
    return result;
}
/**
 * Generate CRC (8-char HMAC)
 */ function generateCrc(machineId, keyId) {
    const secret = getApiKeySecret();
    // Using pbkdf2Sync instead of HMAC to mitigate CodeQL's heuristic
    // [js/insufficient-password-hash] which thinks this is password hashing.
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].pbkdf2Sync(machineId + keyId, secret, 1000, 32, "sha256").toString("hex").slice(0, 8);
}
function generateApiKeyWithMachine(machineId) {
    const keyId = generateKeyId();
    const crc = generateCrc(machineId, keyId);
    const key = `sk-${machineId}-${keyId}-${crc}`;
    return {
        key,
        keyId
    };
}
function parseApiKey(apiKey) {
    if (!apiKey || !apiKey.startsWith("sk-")) return null;
    const parts = apiKey.split("-");
    // New format: sk-{machineId}-{keyId}-{crc8} = 4 parts
    if (parts.length === 4) {
        const [, machineId, keyId, crc] = parts;
        // Validate CRC
        let expectedCrc;
        try {
            expectedCrc = generateCrc(machineId, keyId);
        } catch  {
            return null;
        }
        if (crc !== expectedCrc) return null;
        return {
            machineId,
            keyId,
            isNewFormat: true
        };
    }
    // Old format: sk-{random8} = 2 parts
    if (parts.length === 2) {
        return {
            machineId: null,
            keyId: parts[1],
            isNewFormat: false
        };
    }
    return null;
}
}),
];

//# sourceMappingURL=src_shared_utils_apiKey_ts_0tq07a2._.js.map
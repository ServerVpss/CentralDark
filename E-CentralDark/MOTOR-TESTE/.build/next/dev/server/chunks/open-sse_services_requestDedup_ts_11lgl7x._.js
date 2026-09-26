module.exports = [
"[project]/open-sse/services/requestDedup.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_DEDUP_CONFIG",
    ()=>DEFAULT_DEDUP_CONFIG,
    "clearInflight",
    ()=>clearInflight,
    "computeRequestHash",
    ()=>computeRequestHash,
    "deduplicate",
    ()=>deduplicate,
    "getInflightCount",
    ()=>getInflightCount,
    "getInflightHashes",
    ()=>getInflightHashes,
    "shouldDeduplicate",
    ()=>shouldDeduplicate
]);
/**
 * Request Deduplication Service
 *
 * Deduplicates **concurrent** identical requests to the same upstream.
 * Inspired by ClawRouter's dedup.ts (BlockRunAI / github.com/BlockRunAI/ClawRouter).
 *
 * IMPORTANT: In-memory only — does NOT persist across restarts and does NOT
 * work across multiple process instances (no cross-instance dedup).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const MAX_INFLIGHT = 1000;
const DEFAULT_DEDUP_CONFIG = {
    enabled: true,
    maxTemperatureForDedup: 0.1,
    timeoutMs: 60_000
};
const inflight = new Map();
function computeRequestHash(requestBody) {
    const body = requestBody;
    const canonical = {
        model: body.model ?? null,
        messages: body.messages ?? null,
        temperature: typeof body.temperature === "number" ? body.temperature : 1.0,
        tools: body.tools ?? null,
        tool_choice: body.tool_choice ?? null,
        max_tokens: body.max_tokens ?? null,
        response_format: body.response_format ?? null,
        top_p: body.top_p ?? null,
        frequency_penalty: body.frequency_penalty ?? null,
        presence_penalty: body.presence_penalty ?? null
    };
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(JSON.stringify(canonical)).digest("hex").slice(0, 16);
}
function shouldDeduplicate(requestBody, config = DEFAULT_DEDUP_CONFIG) {
    if (!config.enabled) return false;
    const body = requestBody;
    if (body.stream === true) return false;
    const temperature = typeof body.temperature === "number" ? body.temperature : 1.0;
    if (temperature > config.maxTemperatureForDedup) return false;
    return true;
}
async function deduplicate(hash, fn, config = DEFAULT_DEDUP_CONFIG) {
    if (!config.enabled) {
        return {
            result: await fn(),
            wasDeduplicated: false,
            hash
        };
    }
    const existing = inflight.get(hash);
    if (existing) {
        const result = await existing;
        return {
            result,
            wasDeduplicated: true,
            hash
        };
    }
    if (inflight.size >= MAX_INFLIGHT) {
        const oldestKey = inflight.keys().next().value;
        if (oldestKey !== undefined) inflight.delete(oldestKey);
    }
    let resolve;
    let reject;
    const sharedPromise = new Promise((res, rej)=>{
        resolve = res;
        reject = rej;
    });
    inflight.set(hash, sharedPromise);
    const timer = setTimeout(()=>{
        if (inflight.get(hash) === sharedPromise) inflight.delete(hash);
    }, config.timeoutMs);
    try {
        const result = await fn();
        resolve(result);
        return {
            result,
            wasDeduplicated: false,
            hash
        };
    } catch (err) {
        reject(err);
        throw err;
    } finally{
        clearTimeout(timer);
        if (inflight.get(hash) === sharedPromise) inflight.delete(hash);
    }
}
function getInflightCount() {
    return inflight.size;
}
function getInflightHashes() {
    return [
        ...inflight.keys()
    ];
}
function clearInflight() {
    inflight.clear();
}
}),
];

//# sourceMappingURL=open-sse_services_requestDedup_ts_11lgl7x._.js.map
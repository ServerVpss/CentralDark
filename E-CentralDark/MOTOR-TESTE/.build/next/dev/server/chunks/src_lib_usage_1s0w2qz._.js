module.exports = [
"[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CALL_LOGS_DIR",
    ()=>CALL_LOGS_DIR,
    "MAX_CALL_LOG_ARTIFACT_BYTES",
    ()=>MAX_CALL_LOG_ARTIFACT_BYTES,
    "buildArtifactRelativePath",
    ()=>buildArtifactRelativePath,
    "cleanupEmptyCallLogDirs",
    ()=>cleanupEmptyCallLogDirs,
    "deleteCallArtifact",
    ()=>deleteCallArtifact,
    "listCallLogArtifactFiles",
    ()=>listCallLogArtifactFiles,
    "purgeCallLogArtifactDirectory",
    ()=>purgeCallLogArtifactDirectory,
    "readCallArtifact",
    ()=>readCallArtifact,
    "writeCallArtifact",
    ()=>writeCallArtifact
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
;
;
;
;
const isCloud = typeof globalThis.caches === "object" && globalThis.caches !== null;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const DATA_DIR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveDataDir"])({
    isCloud
});
const CALL_LOGS_DIR = isCloud ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(DATA_DIR, "call_logs");
const MAX_CALL_LOG_ARTIFACT_BYTES = 512 * 1024;
const SIZE_LIMIT_EXCEEDED_REASON = "call_log_artifact_size_limit_exceeded";
const OMITTED_FOR_SIZE_LIMIT = "[omitted: call log artifact size limit exceeded]";
const STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT = "[stream chunks omitted: call log artifact size limit exceeded]";
function buildArtifactRelativePath(timestamp, id) {
    const parsed = new Date(timestamp);
    const safeTimestamp = (Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()).replace(/[:]/g, "-");
    const dateFolder = safeTimestamp.slice(0, 10);
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].posix.join(dateFolder, `${safeTimestamp}_${id}.json`);
}
function computeArtifactChecksum(serialized) {
    const bytes = Buffer.from(serialized);
    let hash = 0x811c9dc5;
    for (const byte of bytes){
        hash ^= byte;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
}
function truncateArtifactForStorage(artifact) {
    const pipeline = artifact.pipeline;
    if (!pipeline?.streamChunks) return artifact;
    return {
        ...artifact,
        pipeline: {
            ...pipeline,
            streamChunks: {
                provider: pipeline.streamChunks.provider?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined,
                openai: pipeline.streamChunks.openai?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined,
                client: pipeline.streamChunks.client?.length ? [
                    STREAM_CHUNKS_OMITTED_FOR_SIZE_LIMIT
                ] : undefined
            }
        }
    };
}
function omitOversizedPipeline(artifact) {
    if (!artifact.pipeline) return artifact;
    return {
        ...artifact,
        pipeline: {
            error: {
                _omniroute_truncated: true,
                reason: SIZE_LIMIT_EXCEEDED_REASON
            }
        }
    };
}
function getArtifactMaxBytes(artifact) {
    return artifact.pipeline ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogPipelineMaxSizeBytes"])() : MAX_CALL_LOG_ARTIFACT_BYTES;
}
function buildMinimalArtifactForSizeLimit(artifact) {
    return {
        schemaVersion: artifact.schemaVersion,
        summary: artifact.summary,
        requestBody: OMITTED_FOR_SIZE_LIMIT,
        responseBody: OMITTED_FOR_SIZE_LIMIT,
        error: artifact.error ? OMITTED_FOR_SIZE_LIMIT : null,
        pipeline: {
            error: {
                _omniroute_truncated: true,
                reason: SIZE_LIMIT_EXCEEDED_REASON
            }
        }
    };
}
function serializeFinalSizeLimitFallback(artifact, maxBytes) {
    const withSummary = JSON.stringify(buildMinimalArtifactForSizeLimit(artifact));
    if (Buffer.byteLength(withSummary) <= maxBytes) {
        return withSummary;
    }
    return JSON.stringify({
        schemaVersion: artifact.schemaVersion,
        _omniroute_truncated: true,
        reason: SIZE_LIMIT_EXCEEDED_REASON
    });
}
function serializeArtifactForStorage(artifact) {
    // Debug mode: write full untruncated payload
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isChatDebugFileEnabled"])()) {
        return JSON.stringify(artifact, null, 2);
    }
    const maxBytes = getArtifactMaxBytes(artifact);
    // Single-pass, non-pretty serialization on the hot path. Artifacts are machine-read via
    // JSON.parse (readCallArtifact), so pretty-printing only doubled the bytes and CPU of
    // serializing large request/response bodies on every request — a contributor to the
    // CPU-runaway. The debug path above keeps pretty output for human inspection.
    const serialized = JSON.stringify(artifact);
    if (Buffer.byteLength(serialized) <= maxBytes) {
        return serialized;
    }
    const truncated = JSON.stringify(truncateArtifactForStorage(artifact));
    if (Buffer.byteLength(truncated) <= maxBytes) {
        return truncated;
    }
    const withoutPipeline = JSON.stringify(omitOversizedPipeline(artifact));
    if (Buffer.byteLength(withoutPipeline) <= maxBytes) {
        return withoutPipeline;
    }
    const minimal = JSON.stringify({
        ...omitOversizedPipeline(artifact),
        requestBody: OMITTED_FOR_SIZE_LIMIT,
        responseBody: OMITTED_FOR_SIZE_LIMIT,
        error: artifact.error ? OMITTED_FOR_SIZE_LIMIT : null
    });
    if (Buffer.byteLength(minimal) <= maxBytes) {
        return minimal;
    }
    return serializeFinalSizeLimitFallback(artifact, maxBytes);
}
function writeCallArtifact(artifact, relativePath = buildArtifactRelativePath(artifact.summary.timestamp, artifact.summary.id)) {
    if (!CALL_LOGS_DIR || isBuildPhase) return null;
    const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
    const tmpPath = `${absPath}.${process.pid}.${Date.now()}.tmp`;
    try {
        const serialized = serializeArtifactForStorage(artifact);
        const sizeBytes = Buffer.byteLength(serialized);
        // Keep the legacy field name for storage compatibility, but use a non-cryptographic checksum
        // so artifact bookkeeping is not treated as password hashing by static analysis.
        const fileChecksum = computeArtifactChecksum(serialized);
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(absPath), {
            recursive: true
        });
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(tmpPath, serialized);
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].renameSync(tmpPath, absPath);
        return {
            relPath: relativePath,
            sizeBytes,
            sha256: fileChecksum
        };
    } catch (error) {
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(tmpPath, {
                force: true
            });
        } catch  {
        // Best effort cleanup only.
        }
        console.error("[callLogs] Failed to write request artifact:", error.message);
        return null;
    }
}
function readCallArtifact(relativePath) {
    if (!CALL_LOGS_DIR || !relativePath) {
        return {
            artifact: null,
            state: "missing"
        };
    }
    try {
        const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(absPath)) {
            return {
                artifact: null,
                state: "missing"
            };
        }
        return {
            artifact: JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(absPath, "utf8")),
            state: "ready"
        };
    } catch (error) {
        console.error("[callLogs] Failed to read request artifact:", error.message);
        return {
            artifact: null,
            state: "corrupt"
        };
    }
}
function deleteCallArtifact(relativePath) {
    if (!CALL_LOGS_DIR || !relativePath) return false;
    try {
        const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(CALL_LOGS_DIR, relativePath);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(absPath)) return false;
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(absPath, {
            force: true
        });
        return true;
    } catch  {
        return false;
    }
}
function cleanupEmptyCallLogDirs(baseDir = CALL_LOGS_DIR) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return;
    try {
        for (const entry of __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(baseDir)){
            const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(baseDir, entry);
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(entryPath);
            if (!stat.isDirectory()) continue;
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(entryPath).length === 0) {
                __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(entryPath, {
                    recursive: true,
                    force: true
                });
            }
        }
    } catch  {
    // Best effort only.
    }
}
function listCallLogArtifactFiles(baseDir = CALL_LOGS_DIR) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return [];
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(baseDir).flatMap((entry)=>{
        const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(baseDir, entry);
        try {
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(entryPath);
            if (!stat.isDirectory()) return [];
            return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(entryPath).filter((file)=>file.endsWith(".json")).map((file)=>{
                const absPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(entryPath, file);
                const fileStat = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].statSync(absPath);
                return {
                    relativePath: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].posix.join(entry, file),
                    absPath,
                    mtimeMs: fileStat.mtimeMs
                };
            });
        } catch  {
            return [];
        }
    }).sort((a, b)=>b.mtimeMs - a.mtimeMs);
}
function purgeCallLogArtifactDirectory(baseDir = CALL_LOGS_DIR) {
    const result = {
        deletedArtifacts: 0,
        errors: 0
    };
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return result;
    try {
        result.deletedArtifacts = listCallLogArtifactFiles(baseDir).length;
    } catch  {
        result.deletedArtifacts = 0;
    }
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(baseDir, {
            recursive: true,
            force: true
        });
    } catch (error) {
        console.error("[callLogArtifacts] Failed to purge call log artifacts:", error);
        result.deletedArtifacts = 0;
        result.errors++;
    }
    return result;
}
}),
"[project]/src/lib/usage/accountIdentity.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveImportedUsageAccountIdentity",
    ()=>resolveImportedUsageAccountIdentity,
    "resolveOrphanedUsageAccountIdentity",
    ()=>resolveOrphanedUsageAccountIdentity,
    "resolveUsageAccountIdentity",
    ()=>resolveUsageAccountIdentity
]);
function identityString(value) {
    return typeof value === "string" && value ? value : null;
}
function displayString(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
}
function sanePriority(value) {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 4 ? value : null;
}
function toProviderSpecificData(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    if (typeof value !== "string" || !value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch  {
        return {};
    }
}
function resolveUsageAccountIdentity(connection) {
    const provider = identityString(connection?.provider) || "unknown";
    const connectionId = identityString(connection?.id) || "unknown";
    const authType = identityString(connection?.authType ?? connection?.auth_type);
    const email = identityString(connection?.email);
    const providerSpecificData = toProviderSpecificData(connection?.providerSpecificData ?? connection?.provider_specific_data);
    const workspaceId = identityString(providerSpecificData.workspaceId);
    const chatgptUserId = identityString(providerSpecificData.chatgptUserId);
    const username = identityString(providerSpecificData.username);
    let identityParts;
    if (authType === "oauth" && provider === "codex" && workspaceId && chatgptUserId) {
        identityParts = [
            "oauth",
            provider,
            "workspace",
            workspaceId,
            "user",
            chatgptUserId
        ];
    } else if (authType === "oauth" && provider === "codex" && chatgptUserId) {
        identityParts = [
            "oauth",
            provider,
            "user",
            chatgptUserId
        ];
    } else if (authType === "oauth" && provider === "codex" && workspaceId && email) {
        identityParts = [
            "oauth",
            provider,
            "workspace",
            workspaceId,
            "email",
            email
        ];
    } else if (authType === "oauth" && provider !== "codex" && email) {
        identityParts = username ? [
            "oauth",
            provider,
            "email",
            email,
            "username",
            username
        ] : [
            "oauth",
            provider,
            "email",
            email
        ];
    } else {
        identityParts = [
            "connection",
            provider,
            connectionId
        ];
    }
    const displayName = displayString(connection?.displayName ?? connection?.display_name);
    const displayEmail = displayString(connection?.email);
    const name = displayString(connection?.name);
    const id = displayString(connection?.id);
    return {
        accountKey: JSON.stringify(identityParts),
        accountLabel: displayName || displayEmail || name || id || "unknown",
        accountLabelPriority: displayName ? 4 : displayEmail ? 3 : name ? 2 : id ? 1 : 0
    };
}
function resolveOrphanedUsageAccountIdentity(provider, connectionId) {
    return resolveUsageAccountIdentity({
        provider,
        id: connectionId
    });
}
function resolveImportedUsageAccountIdentity(row, fallback) {
    return {
        accountKey: identityString(row.account_key ?? row.accountKey) || fallback.accountKey,
        accountLabel: displayString(row.account_label ?? row.accountLabel) || fallback.accountLabel,
        accountLabelPriority: sanePriority(row.account_label_priority ?? row.accountLabelPriority) ?? fallback.accountLabelPriority
    };
}
}),
"[project]/src/lib/usage/usageHistory/helpers.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Pure, stateless helpers extracted from usageHistory.ts.
 * No DB access, no module-level state — safe to import anywhere.
 */ // #7879: re-export the canonical helper so existing consumers of this module
// keep importing `toNumber` from here unchanged.
__turbopack_context__.s([
    "MAX_PREVIEW_ARRAY_ITEMS",
    ()=>MAX_PREVIEW_ARRAY_ITEMS,
    "MAX_PREVIEW_DEPTH",
    ()=>MAX_PREVIEW_DEPTH,
    "MAX_PREVIEW_OBJECT_KEYS",
    ()=>MAX_PREVIEW_OBJECT_KEYS,
    "MAX_PREVIEW_STRING",
    ()=>MAX_PREVIEW_STRING,
    "accumulateLatencySample",
    ()=>accumulateLatencySample,
    "asRecord",
    ()=>asRecord,
    "buildLatencyStatsEntry",
    ()=>buildLatencyStatsEntry,
    "createLatencyBucket",
    ()=>createLatencyBucket,
    "mean",
    ()=>mean,
    "normalizeServiceTier",
    ()=>normalizeServiceTier,
    "percentile",
    ()=>percentile,
    "resolvePositiveOption",
    ()=>resolvePositiveOption,
    "stdDev",
    ()=>stdDev,
    "toStringOrNull",
    ()=>toStringOrNull,
    "truncatePendingPreview",
    ()=>truncatePendingPreview
]);
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function normalizeServiceTier(value) {
    const tier = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (tier === "priority" || tier === "fast") return "priority";
    if (tier === "flex") return "flex";
    return "standard";
}
function percentile(sortedValues, p) {
    if (sortedValues.length === 0) return 0;
    if (sortedValues.length === 1) return sortedValues[0];
    const bounded = Math.max(0, Math.min(1, p));
    const idx = Math.round((sortedValues.length - 1) * bounded);
    return sortedValues[idx] ?? sortedValues[sortedValues.length - 1];
}
function stdDev(values, avg) {
    if (values.length <= 1) return 0;
    const variance = values.reduce((acc, v)=>acc + (v - avg) ** 2, 0) / values.length;
    return Math.sqrt(Math.max(0, variance));
}
function mean(values) {
    return values.length > 0 ? values.reduce((acc, n)=>acc + n, 0) / values.length : 0;
}
function resolvePositiveOption(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
function accumulateLatencySample(buckets, latencyMs, ttftMs, tokensOutput, isSuccess) {
    if (latencyMs <= 0) return;
    buckets.allLatencies.push(latencyMs);
    if (ttftMs > 0) buckets.allTtfts.push(ttftMs);
    if (tokensOutput > 0) buckets.allTps.push(tokensOutput / (latencyMs / 1000));
    if (!isSuccess) return;
    buckets.successfulLatencies.push(latencyMs);
    if (ttftMs > 0) buckets.successfulTtfts.push(ttftMs);
    if (tokensOutput > 0) buckets.successfulTps.push(tokensOutput / (latencyMs / 1000));
}
function createLatencyBucket(provider, model) {
    return {
        provider,
        model,
        totalRequests: 0,
        successfulRequests: 0,
        successfulLatencies: [],
        allLatencies: [],
        successfulTtfts: [],
        allTtfts: [],
        successfulTps: [],
        allTps: []
    };
}
function buildLatencyStatsEntry(key, bucket, minSamples, windowHours) {
    const useSuccessful = bucket.successfulLatencies.length >= minSamples;
    const baseLatencies = useSuccessful ? bucket.successfulLatencies : bucket.allLatencies;
    if (baseLatencies.length < minSamples) return null;
    const baseTtfts = useSuccessful ? bucket.successfulTtfts : bucket.allTtfts;
    const baseTps = useSuccessful ? bucket.successfulTps : bucket.allTps;
    const sorted = [
        ...baseLatencies
    ].sort((a, b)=>a - b);
    const avg = mean(sorted);
    const successRate = bucket.totalRequests > 0 ? bucket.successfulRequests / bucket.totalRequests : 0;
    return {
        provider: bucket.provider,
        model: bucket.model,
        key,
        totalRequests: bucket.totalRequests,
        successfulRequests: bucket.successfulRequests,
        successRate,
        avgLatencyMs: Math.round(avg),
        p50LatencyMs: Math.round(percentile(sorted, 0.5)),
        p95LatencyMs: Math.round(percentile(sorted, 0.95)),
        p99LatencyMs: Math.round(percentile(sorted, 0.99)),
        latencyStdDev: Math.round(stdDev(sorted, avg)),
        windowHours,
        avgTtftMs: Math.round(mean(baseTtfts)),
        avgE2ELatencyMs: Math.round(avg),
        avgTokensPerSecond: Math.round(mean(baseTps) * 100) / 100
    };
}
const MAX_PREVIEW_DEPTH = 6;
const MAX_PREVIEW_STRING = 1200;
const MAX_PREVIEW_ARRAY_ITEMS = 12;
const MAX_PREVIEW_OBJECT_KEYS = 24;
function truncatePendingPreview(value, depth = 0) {
    if (depth >= MAX_PREVIEW_DEPTH) {
        return "[TRUNCATED_DEPTH]";
    }
    if (typeof value === "string") {
        return value.length > MAX_PREVIEW_STRING ? `${value.slice(0, MAX_PREVIEW_STRING)}...` : value;
    }
    if (Array.isArray(value)) {
        const preview = value.slice(0, MAX_PREVIEW_ARRAY_ITEMS).map((item)=>truncatePendingPreview(item, depth + 1));
        if (value.length > MAX_PREVIEW_ARRAY_ITEMS) {
            preview.push({
                _truncatedItems: value.length - MAX_PREVIEW_ARRAY_ITEMS
            });
        }
        return preview;
    }
    if (!value || typeof value !== "object") {
        return value;
    }
    const entries = Object.entries(value);
    const truncatedEntries = entries.slice(0, MAX_PREVIEW_OBJECT_KEYS).map(([key, entryValue])=>[
            key,
            truncatePendingPreview(entryValue, depth + 1)
        ]);
    const preview = Object.fromEntries(truncatedEntries);
    if (entries.length > MAX_PREVIEW_OBJECT_KEYS) {
        preview._truncatedKeys = entries.length - MAX_PREVIEW_OBJECT_KEYS;
    }
    return preview;
}
}),
"[project]/src/lib/usage/completedRequestDetails.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCompletedDetails",
    ()=>clearCompletedDetails,
    "getCompletedDetails",
    ()=>getCompletedDetails,
    "maybeEnrichCompletedDetail",
    ()=>maybeEnrichCompletedDetail,
    "scheduleCompletedDetailCleanup",
    ()=>scheduleCompletedDetailCleanup,
    "storeCompletedDetail",
    ()=>storeCompletedDetail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
const COMPLETED_DETAIL_TTL_MS = 120_000;
const MAX_COMPLETED_DETAILS = 256;
const completedDetails = new Map();
const completedDetailTimers = new Map();
function deleteCompletedDetail(id) {
    completedDetails.delete(id);
    const existingTimer = completedDetailTimers.get(id);
    if (existingTimer) {
        clearTimeout(existingTimer);
        completedDetailTimers.delete(id);
    }
}
function trimCompletedDetails() {
    while(completedDetails.size > MAX_COMPLETED_DETAILS){
        const oldestId = completedDetails.keys().next().value;
        if (!oldestId) break;
        deleteCompletedDetail(oldestId);
    }
}
function getCompletedDetails() {
    return completedDetails;
}
function storeCompletedDetail(detail) {
    completedDetails.set(detail.id, detail);
    trimCompletedDetails();
}
function scheduleCompletedDetailCleanup(id) {
    const existingTimer = completedDetailTimers.get(id);
    if (existingTimer) clearTimeout(existingTimer);
    const timer = setTimeout(()=>{
        completedDetails.delete(id);
        completedDetailTimers.delete(id);
    }, COMPLETED_DETAIL_TTL_MS);
    timer.unref?.();
    completedDetailTimers.set(id, timer);
}
function clearCompletedDetails() {
    for (const timer of completedDetailTimers.values())clearTimeout(timer);
    completedDetailTimers.clear();
    completedDetails.clear();
}
function maybeEnrichCompletedDetail(updated, connectionId) {
    void (async ()=>{
        try {
            const missingProvider = updated.providerResponse === undefined || updated.providerResponse === null;
            const missingClient = updated.clientResponse === undefined || updated.clientResponse === null;
            if (!missingProvider && !missingClient) return;
            const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
            const sinceIso = new Date(Date.now() - 30_000).toISOString();
            const rows = db.prepare(`SELECT artifact_relpath FROM call_logs WHERE connection_id = ? AND model = ? AND timestamp >= ? ORDER BY timestamp DESC LIMIT 5`).all(connectionId, updated.model, sinceIso);
            for (const row of rows){
                if (!row.artifact_relpath) continue;
                const { readCallArtifact } = await __turbopack_context__.A("[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript, async loader)");
                const art = readCallArtifact(row.artifact_relpath);
                if (art.state !== "ready" || !art.artifact) continue;
                const pipeline = art.artifact.pipeline;
                if (missingProvider && pipeline?.providerResponse) {
                    updated.providerResponse = pipeline.providerResponse;
                }
                if (missingClient && pipeline?.clientResponse) {
                    updated.clientResponse = pipeline.clientResponse;
                }
                if (missingProvider && art.artifact.responseBody || missingClient && art.artifact.responseBody) {
                    if (missingProvider) updated.providerResponse = art.artifact.responseBody;
                    if (missingClient) updated.clientResponse = art.artifact.responseBody;
                }
                if (updated.providerResponse || updated.clientResponse) {
                    if (completedDetails.has(updated.id)) storeCompletedDetail(updated);
                    break;
                }
            }
        } catch (e) {
            try {
                console.warn("[usageHistory] failed to enrich completed detail from artifacts:", e && (e.message || e));
            } catch  {}
        }
    })();
}
}),
"[project]/src/lib/usage/migrations.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CALL_LOGS_DIR",
    ()=>CALL_LOGS_DIR,
    "LOG_ARCHIVES_DIR",
    ()=>LOG_ARCHIVES_DIR,
    "archiveLegacyRequestLogs",
    ()=>archiveLegacyRequestLogs,
    "migrateLegacyUsageFiles",
    ()=>migrateLegacyUsageFiles,
    "migrateUsageJsonToSqlite",
    ()=>migrateUsageJsonToSqlite,
    "shouldPersistToDisk",
    ()=>shouldPersistToDisk
]);
// @ts-nocheck
/**
 * Usage Migrations — extracted from usageDb.js (T-15)
 *
 * Handles legacy file migration (.data → data/), JSON → SQLite migration,
 * and one-time archival of legacy request log layouts into a zip backup.
 *
 * @module lib/usage/migrations
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yazl$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/yazl/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/accountIdentity.ts [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const shouldPersistToDisk = !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"];
const LEGACY_DATA_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLegacyDotDataDir"])();
const CALL_LOGS_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "call_logs");
const LOG_ARCHIVES_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "log_archives");
const LEGACY_LAYOUT_MARKER = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LOG_ARCHIVES_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOG_ARCHIVES_DIR, "legacy-request-logs.json");
const CURRENT_REQUEST_LOGS_DIR = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "logs");
const CURRENT_REQUEST_SUMMARY_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "log.txt");
// Legacy paths
const LEGACY_DB_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LEGACY_DATA_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LEGACY_DATA_DIR, "usage.json");
const LEGACY_CALL_LOGS_DB_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] || !LEGACY_DATA_DIR ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LEGACY_DATA_DIR, "call_logs.json");
// Current-location JSON files (for migration into SQLite)
const USAGE_JSON_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "usage.json");
const CALL_LOGS_JSON_FILE = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"] ? null : __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], "call_logs.json");
function buildLegacyRequestSummary(requestType, requestBody) {
    if (requestType !== "search" || !requestBody || typeof requestBody !== "object") return null;
    const record = requestBody;
    const summary = {};
    if (typeof record.query === "string" && record.query.trim().length > 0) {
        summary.query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(record.query).text;
    }
    const filters = Object.fromEntries(Object.entries(record).filter(([key])=>key !== "query" && key !== "provider"));
    if (Object.keys(filters).length > 0) {
        summary.filters = filters;
    }
    return Object.keys(summary).length > 0 ? JSON.stringify(summary) : null;
}
function copyIfMissing(fromPath, toPath, label) {
    if (!fromPath || !toPath) return;
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(fromPath) || __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(toPath)) return;
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(fromPath).isDirectory()) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].cpSync(fromPath, toPath, {
            recursive: true
        });
    } else {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].copyFileSync(fromPath, toPath);
    }
    console.log(`[usageDb] Migrated ${label}: ${fromPath} -> ${toPath}`);
}
function containsLegacyCallLogLayout(dirPath) {
    if (!dirPath || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(dirPath)) return false;
    try {
        const topLevelEntries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(dirPath);
        for (const topLevelEntry of topLevelEntries){
            const topLevelPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dirPath, topLevelEntry);
            const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(topLevelPath);
            if (stat.isFile() && /^\d{6}_.+_\d{3}\.json$/i.test(topLevelEntry)) {
                return true;
            }
            if (!stat.isDirectory()) {
                continue;
            }
            const nestedEntries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(topLevelPath);
            for (const nestedEntry of nestedEntries){
                if (/^\d{6}_.+_\d{3}\.json$/i.test(nestedEntry)) {
                    return true;
                }
            }
        }
    } catch  {
        return false;
    }
    return false;
}
function ensureArchiveDir() {
    if (!LOG_ARCHIVES_DIR) return;
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(LOG_ARCHIVES_DIR, {
        recursive: true
    });
}
/**
 * Directory the live file logger writes to (`buildLogger()` in
 * `src/shared/utils/logger.ts`), so the legacy-log sweep below never zips-then-deletes
 * a directory it does not own. Since PR #6234 (fix for #6197) the default app log path
 * moved from a `process.cwd()`-anchored location to `DATA_DIR/logs/application/app.log`,
 * landing it inside the same `DATA_DIR/logs` tree this "legacy" migration sweeps (#6799).
 */ function getLiveAppLogDir() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAppLogFilePath"])());
    } catch  {
        return null;
    }
}
function listRequestLogArchiveEntries() {
    if (!CURRENT_REQUEST_LOGS_DIR || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CURRENT_REQUEST_LOGS_DIR)) return [];
    const liveAppLogDir = getLiveAppLogDir();
    const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(CURRENT_REQUEST_LOGS_DIR);
    const targets = [];
    for (const entry of entries){
        const entryPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(CURRENT_REQUEST_LOGS_DIR, entry);
        if (liveAppLogDir && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSamePath"])(entryPath, liveAppLogDir)) continue;
        targets.push({
            sourcePath: entryPath,
            archiveRoot: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].posix.join("data/logs", entry),
            deleteAfterArchive: true
        });
    }
    return targets;
}
function listArchiveTargets() {
    const targets = listRequestLogArchiveEntries();
    if (CURRENT_REQUEST_SUMMARY_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CURRENT_REQUEST_SUMMARY_FILE)) {
        targets.push({
            sourcePath: CURRENT_REQUEST_SUMMARY_FILE,
            archiveRoot: "data/log.txt",
            deleteAfterArchive: true
        });
    }
    if (CALL_LOGS_DIR && containsLegacyCallLogLayout(CALL_LOGS_DIR)) {
        targets.push({
            sourcePath: CALL_LOGS_DIR,
            archiveRoot: "data/call_logs",
            deleteAfterArchive: true
        });
    }
    return targets;
}
function addPathToZip(zipFile, sourcePath, archivePath) {
    const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(sourcePath);
    if (stat.isDirectory()) {
        const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(sourcePath);
        if (entries.length === 0) {
            zipFile.addEmptyDirectory(archivePath);
            return;
        }
        for (const entry of entries){
            addPathToZip(zipFile, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(sourcePath, entry), __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].posix.join(archivePath, entry));
        }
        return;
    }
    zipFile.addFile(sourcePath, archivePath);
}
function createLegacyArchive(targets) {
    return new Promise((resolve, reject)=>{
        if (!LOG_ARCHIVES_DIR) {
            reject(new Error("LOG_ARCHIVES_DIR is not configured"));
            return;
        }
        ensureArchiveDir();
        const timestamp = new Date().toISOString().replace(/[:]/g, "-");
        const archiveFilename = `${timestamp}_legacy-request-logs.zip`;
        const archivePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(LOG_ARCHIVES_DIR, archiveFilename);
        const zipFile = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yazl$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ZipFile"]();
        const output = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].createWriteStream(archivePath);
        let settled = false;
        // yazl detects a stat->stream size mismatch (a file growing while being zipped, e.g.
        // an actively-written log — #6401) by emitting "error" on the ZipFile instance itself,
        // not on `output`. Left unwired, that "error" event has no listener and Node re-throws
        // it as an uncaughtException that crashes the process. Wiring it here converts that
        // crash into a normal rejection the caller's try/catch already handles.
        const fail = (error)=>{
            if (settled) return;
            settled = true;
            output.destroy();
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(archivePath, {
                force: true
            });
            reject(error);
        };
        output.on("close", ()=>{
            if (settled) return;
            settled = true;
            resolve(archiveFilename);
        });
        output.on("error", fail);
        zipFile.on("error", fail);
        zipFile.outputStream.pipe(output);
        try {
            for (const target of targets){
                addPathToZip(zipFile, target.sourcePath, target.archiveRoot);
            }
            zipFile.end();
        } catch (error) {
            fail(error);
        }
    });
}
function writeLegacyLayoutMarker(archiveFilename) {
    if (!LEGACY_LAYOUT_MARKER) return;
    ensureArchiveDir();
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(LEGACY_LAYOUT_MARKER, JSON.stringify({
        migratedAt: new Date().toISOString(),
        archiveFilename
    }, null, 2));
}
function deleteArchivedTargets(targets) {
    for (const target of targets){
        if (!target.deleteAfterArchive || !__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(target.sourcePath)) {
            continue;
        }
        const stat = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(target.sourcePath);
        if (stat.isDirectory()) {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(target.sourcePath, {
                recursive: true,
                force: true
            });
        } else {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(target.sourcePath, {
                force: true
            });
        }
    }
}
function migrateLegacyUsageFiles() {
    if (!shouldPersistToDisk || !LEGACY_DATA_DIR) return;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSamePath"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DATA_DIR"], LEGACY_DATA_DIR)) return;
    try {
        copyIfMissing(LEGACY_DB_FILE, USAGE_JSON_FILE, "usage history");
        copyIfMissing(LEGACY_CALL_LOGS_DB_FILE, CALL_LOGS_JSON_FILE, "call log index");
    } catch (error) {
        console.error("[usageDb] Legacy migration failed:", error.message);
    }
}
async function archiveLegacyRequestLogs() {
    if (!shouldPersistToDisk) return null;
    if (LEGACY_LAYOUT_MARKER && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(LEGACY_LAYOUT_MARKER)) return null;
    const targets = listArchiveTargets();
    if (targets.length === 0) return null;
    const archiveFilename = await createLegacyArchive(targets);
    deleteArchivedTargets(targets);
    writeLegacyLayoutMarker(archiveFilename);
    console.log(`[usageDb] Archived legacy request logs to ${archiveFilename}`);
    return archiveFilename;
}
function migrateUsageJsonToSqlite() {
    if (!shouldPersistToDisk) return;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (USAGE_JSON_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(USAGE_JSON_FILE)) {
        try {
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(USAGE_JSON_FILE, "utf-8");
            const data = JSON.parse(raw);
            const history = data.history || [];
            if (history.length > 0) {
                console.log(`[usageDb] Migrating ${history.length} usage entries from JSON → SQLite...`);
                const insert = db.prepare(`
          INSERT INTO usage_history (provider, model, connection_id, account_key, account_label,
            account_label_priority, api_key_id, api_key_name, tokens_input, tokens_output,
            tokens_cache_read, tokens_cache_creation, tokens_reasoning, status, success, latency_ms,
            ttft_ms, error_code, combo_strategy, timestamp)
          VALUES (@provider, @model, @connectionId, @accountKey, @accountLabel,
            @accountLabelPriority, @apiKeyId, @apiKeyName, @tokensInput, @tokensOutput,
            @tokensCacheRead, @tokensCacheCreation, @tokensReasoning, @status, @success,
            @latencyMs, @ttftMs, @errorCode, @comboStrategy, @timestamp)
        `);
                const findConnection = db.prepare("SELECT * FROM provider_connections WHERE id = ?");
                const tx = db.transaction(()=>{
                    for (const entry of history){
                        const connectionId = entry.connectionId || entry.connection_id || null;
                        const connection = connectionId ? findConnection.get(connectionId) : null;
                        const fallbackIdentity = connection ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(connection) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveOrphanedUsageAccountIdentity"])(entry.provider, connectionId);
                        const identity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveImportedUsageAccountIdentity"])(entry, fallbackIdentity);
                        insert.run({
                            provider: entry.provider || null,
                            model: entry.model || null,
                            connectionId,
                            accountKey: identity.accountKey,
                            accountLabel: identity.accountLabel,
                            accountLabelPriority: identity.accountLabelPriority,
                            apiKeyId: entry.apiKeyId || null,
                            apiKeyName: entry.apiKeyName || null,
                            tokensInput: entry.tokens?.input ?? entry.tokens?.prompt_tokens ?? entry.tokens?.in ?? 0,
                            tokensOutput: entry.tokens?.output ?? entry.tokens?.completion_tokens ?? entry.tokens?.out ?? 0,
                            tokensCacheRead: entry.tokens?.cacheRead ?? entry.tokens?.cached_tokens ?? 0,
                            tokensCacheCreation: entry.tokens?.cacheCreation ?? entry.tokens?.cache_creation_input_tokens ?? 0,
                            tokensReasoning: entry.tokens?.reasoning ?? entry.tokens?.reasoning_tokens ?? 0,
                            status: entry.status || null,
                            success: entry.success === false ? 0 : 1,
                            latencyMs: Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0,
                            ttftMs: Number.isFinite(Number(entry.timeToFirstTokenMs)) ? Number(entry.timeToFirstTokenMs) : Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0,
                            errorCode: entry.errorCode || null,
                            comboStrategy: entry.comboStrategy || entry.combo_strategy || "direct",
                            timestamp: entry.timestamp || new Date().toISOString()
                        });
                    }
                });
                tx();
                console.log(`[usageDb] ✓ Migrated ${history.length} usage entries`);
            }
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(USAGE_JSON_FILE, `${USAGE_JSON_FILE}.migrated`);
        } catch (error) {
            console.error("[usageDb] Failed to migrate usage.json:", error.message);
        }
    }
    if (CALL_LOGS_JSON_FILE && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CALL_LOGS_JSON_FILE)) {
        try {
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(CALL_LOGS_JSON_FILE, "utf-8");
            const data = JSON.parse(raw);
            const logs = data.logs || [];
            if (logs.length > 0) {
                console.log(`[usageDb] Migrating ${logs.length} call log entries from JSON → SQLite...`);
                const insert = db.prepare(`
          INSERT OR IGNORE INTO call_logs (id, timestamp, method, path, status, model, requested_model, provider,
            account, connection_id, duration, tokens_in, tokens_out, source_format, target_format,
            api_key_id, api_key_name, combo_name, combo_step_id, combo_execution_key, error_summary,
            detail_state, artifact_relpath, artifact_size_bytes, artifact_sha256,
            has_request_body, has_response_body, has_pipeline_details, request_summary)
          VALUES (@id, @timestamp, @method, @path, @status, @model, @requestedModel, @provider,
            @account, @connectionId, @duration, @tokensIn, @tokensOut, @sourceFormat, @targetFormat,
            @apiKeyId, @apiKeyName, @comboName, @comboStepId, @comboExecutionKey, @errorSummary,
            @detailState, @artifactRelPath, @artifactSizeBytes, @artifactSha256,
            @hasRequestBody, @hasResponseBody, @hasPipelineDetails, @requestSummary)
        `);
                const tx = db.transaction(()=>{
                    for (const log of logs){
                        const id = log.id || `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                        const timestamp = log.timestamp || new Date().toISOString();
                        const protectedRequestBody = log.requestBody ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.requestBody) : null;
                        const protectedResponseBody = log.responseBody ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.responseBody) : null;
                        const protectedError = log.error && typeof log.error === "object" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(log.error) : log.error || null;
                        const detailExpected = protectedRequestBody !== null || protectedResponseBody !== null || protectedError !== null;
                        let detailState = "none";
                        let artifactRelPath = null;
                        let artifactSizeBytes = null;
                        let artifactSha256 = null;
                        if (detailExpected) {
                            const artifact = {
                                schemaVersion: 5,
                                summary: {
                                    id,
                                    timestamp,
                                    method: log.method || "POST",
                                    path: log.path || "/v1/chat/completions",
                                    status: log.status || 0,
                                    model: log.model || "-",
                                    requestedModel: log.requestedModel || null,
                                    provider: log.provider || "-",
                                    account: log.account || "-",
                                    connectionId: log.connectionId || null,
                                    duration: log.duration || 0,
                                    tokens: {
                                        in: log.tokens?.in ?? 0,
                                        out: log.tokens?.out ?? 0,
                                        cacheRead: null,
                                        cacheWrite: null,
                                        reasoning: null
                                    },
                                    requestType: log.requestType || null,
                                    sourceFormat: log.sourceFormat || null,
                                    targetFormat: log.targetFormat || null,
                                    apiKeyId: log.apiKeyId || null,
                                    apiKeyName: log.apiKeyName || null,
                                    comboName: log.comboName || null,
                                    comboStepId: log.comboStepId || null,
                                    comboExecutionKey: log.comboExecutionKey || null
                                },
                                requestBody: protectedRequestBody,
                                responseBody: protectedResponseBody,
                                error: protectedError
                            };
                            const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeCallArtifact"])(artifact);
                            if (artifactResult) {
                                detailState = "ready";
                                artifactRelPath = artifactResult.relPath;
                                artifactSizeBytes = artifactResult.sizeBytes;
                                artifactSha256 = artifactResult.sha256;
                            } else {
                                detailState = "missing";
                            }
                        }
                        insert.run({
                            id,
                            timestamp,
                            method: log.method || "POST",
                            path: log.path || null,
                            status: log.status || 0,
                            model: log.model || null,
                            requestedModel: log.requestedModel || null,
                            provider: log.provider || null,
                            account: log.account || null,
                            connectionId: log.connectionId || null,
                            duration: log.duration || 0,
                            tokensIn: log.tokens?.in ?? 0,
                            tokensOut: log.tokens?.out ?? 0,
                            sourceFormat: log.sourceFormat || null,
                            targetFormat: log.targetFormat || null,
                            apiKeyId: log.apiKeyId || null,
                            apiKeyName: log.apiKeyName || null,
                            comboName: log.comboName || null,
                            comboStepId: log.comboStepId || null,
                            comboExecutionKey: log.comboExecutionKey || log.comboStepId || null,
                            errorSummary: typeof protectedError === "string" ? protectedError.slice(0, 4000) : protectedError ? JSON.stringify(protectedError).slice(0, 4000) : null,
                            detailState,
                            artifactRelPath,
                            artifactSizeBytes,
                            artifactSha256,
                            hasRequestBody: protectedRequestBody ? 1 : 0,
                            hasResponseBody: protectedResponseBody ? 1 : 0,
                            hasPipelineDetails: 0,
                            requestSummary: buildLegacyRequestSummary(log.requestType, protectedRequestBody)
                        });
                    }
                });
                tx();
                console.log(`[usageDb] ✓ Migrated ${logs.length} call log entries`);
            }
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].renameSync(CALL_LOGS_JSON_FILE, `${CALL_LOGS_JSON_FILE}.migrated`);
        } catch (error) {
            console.error("[usageDb] Failed to migrate call_logs.json:", error.message);
        }
    }
}
migrateLegacyUsageFiles();
if (shouldPersistToDisk) {
    try {
        await archiveLegacyRequestLogs();
    } catch (error) {
        console.error("[usageDb] Failed to archive legacy request logs:", error.message);
    }
    try {
        migrateUsageJsonToSqlite();
    } catch  {
    // Best-effort startup migration.
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/lib/usage/usageEvents.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Lightweight usage-event bus.
 *
 * Decouples usage recording (usageHistory.ts) from the provider-limits
 * subsystem (providerLimits.ts). usageHistory must NOT import providerLimits:
 * providerLimits pulls in the executors barrel (and the whole translator graph),
 * so a direct or dynamic import from usageHistory expands the type-check surface
 * across modules that have nothing to do with usage recording. usageHistory
 * emits here; providerLimits subscribes at module load.
 *
 * @module lib/usage/usageEvents
 */ __turbopack_context__.s([
    "emitUsageRecorded",
    ()=>emitUsageRecorded,
    "onStatsEvent",
    ()=>onStatsEvent,
    "onUsageRecorded",
    ()=>onUsageRecorded,
    "scheduleStatsEvent",
    ()=>scheduleStatsEvent
]);
const listeners = new Set();
function onUsageRecorded(listener) {
    listeners.add(listener);
    return ()=>{
        listeners.delete(listener);
    };
}
function emitUsageRecorded(provider, connectionId) {
    if (!provider || !connectionId) return;
    for (const listener of listeners){
        try {
            listener(provider, connectionId);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[usageEvents] usage-recorded listener failed: ${message}`);
        }
    }
}
const statsEmitTimers = {
    update: null,
    pending: null
};
const statsListeners = {
    update: new Set(),
    pending: new Set()
};
function onStatsEvent(event, listener) {
    statsListeners[event].add(listener);
    return ()=>{
        statsListeners[event].delete(listener);
    };
}
function scheduleStatsEvent(event, delayMs = 200) {
    if (statsEmitTimers[event] != null) return;
    statsEmitTimers[event] = setTimeout(()=>{
        statsEmitTimers[event] = null;
        for (const listener of statsListeners[event]){
            try {
                listener();
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.warn(`[usageEvents] stats listener (${event}) failed: ${message}`);
            }
        }
    }, delayMs);
    // Allow Node.js to exit naturally even if the timer is still pending
    // (avoids keeping the event loop alive for a stray stats notification).
    statsEmitTimers[event]?.unref?.();
}
}),
"[project]/src/lib/usage/tokenAccounting.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatUsageLog",
    ()=>formatUsageLog,
    "getLoggedInputTokens",
    ()=>getLoggedInputTokens,
    "getLoggedOutputTokens",
    ()=>getLoggedOutputTokens,
    "getObservedReasoning",
    ()=>getObservedReasoning,
    "getPromptCacheCreationTokens",
    ()=>getPromptCacheCreationTokens,
    "getPromptCacheCreationTokensOrNull",
    ()=>getPromptCacheCreationTokensOrNull,
    "getPromptCacheReadTokens",
    ()=>getPromptCacheReadTokens,
    "getPromptCacheReadTokensOrNull",
    ()=>getPromptCacheReadTokensOrNull,
    "getReasoningTokens",
    ()=>getReasoningTokens,
    "getReasoningTokensOrNull",
    ()=>getReasoningTokensOrNull
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toFiniteNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
function getPromptTokenDetails(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = asRecord(tokenRecord.prompt_tokens_details);
    if (Object.keys(promptDetails).length > 0) return promptDetails;
    return asRecord(tokenRecord.input_tokens_details);
}
function getPromptCacheReadTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    return toFiniteNumber(tokenRecord.cacheRead ?? tokenRecord.cache_read_input_tokens ?? tokenRecord.cached_tokens ?? promptDetails.cached_tokens);
}
function getPromptCacheCreationTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    return toFiniteNumber(tokenRecord.cacheCreation ?? tokenRecord.cache_creation_input_tokens ?? promptDetails.cache_creation_tokens);
}
function getLoggedInputTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    if (tokenRecord.input !== undefined && tokenRecord.input !== null) {
        return toFiniteNumber(tokenRecord.input);
    }
    // Prefer prompt_tokens when present: translators normalize provider-specific
    // usage into OpenAI shape there, and may keep input_tokens for compatibility.
    // Treating that input_tokens as raw Claude usage would add cache tokens again.
    if (tokenRecord.prompt_tokens !== undefined && tokenRecord.prompt_tokens !== null) {
        return toFiniteNumber(tokenRecord.prompt_tokens);
    }
    if (tokenRecord.input_tokens !== undefined && tokenRecord.input_tokens !== null) {
        // Anthropic / anthropic-compatible-cc streaming: input_tokens is only the
        // non-cached portion.  The cache counters sit as separate top-level fields
        // (cache_read_input_tokens, cache_creation_input_tokens).  We need to add
        // them to get the true total input.
        return toFiniteNumber(tokenRecord.input_tokens) + toFiniteNumber(tokenRecord.cache_read_input_tokens) + toFiniteNumber(tokenRecord.cache_creation_input_tokens);
    }
    return 0;
}
function getLoggedOutputTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    if (tokenRecord.output !== undefined && tokenRecord.output !== null) {
        return toFiniteNumber(tokenRecord.output);
    }
    return toFiniteNumber(tokenRecord.completion_tokens ?? tokenRecord.output_tokens);
}
function getReasoningTokens(tokens) {
    const tokenRecord = asRecord(tokens);
    const completionDetails = asRecord(tokenRecord.completion_tokens_details);
    return toFiniteNumber(tokenRecord.reasoning ?? tokenRecord.reasoning_tokens ?? completionDetails.reasoning_tokens);
}
// Non-greedy, single-capture, no nested variable-length quantifiers → ReDoS-safe.
const THINK_BLOCK_RE = /<think>([\s\S]*?)<\/think>/gi;
function getObservedReasoning(message) {
    const record = asRecord(message);
    // Explicit reasoning field: `reasoning_content` is the raw provider field;
    // `reasoning` is what sseTextTransform maps it to.
    const explicit = record.reasoning_content ?? record.reasoning;
    if (typeof explicit === "string" && explicit.trim().length > 0) {
        return {
            source: "content",
            chars: explicit.length
        };
    }
    // Inline <think>...</think> blocks embedded in message content.
    const content = record.content;
    if (typeof content === "string" && content.length > 0) {
        let chars = 0;
        for (const match of content.matchAll(THINK_BLOCK_RE)){
            chars += (match[1] ?? "").length;
        }
        if (chars > 0) return {
            source: "think",
            chars
        };
    }
    return {
        source: null,
        chars: 0
    };
}
// ─── Nullable variants ──────────────────────────────────────────────────
// Return `null` when the provider simply doesn't report the field,
// vs `0` when the provider explicitly reported zero.
function hasAnyKey(record, keys) {
    return keys.some((k)=>record[k] !== undefined && record[k] !== null);
}
function getPromptCacheReadTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    if (hasAnyKey(tokenRecord, [
        "cacheRead",
        "cache_read_input_tokens",
        "cached_tokens"
    ]) || hasAnyKey(promptDetails, [
        "cached_tokens"
    ])) {
        return getPromptCacheReadTokens(tokens);
    }
    return null;
}
function getPromptCacheCreationTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const promptDetails = getPromptTokenDetails(tokenRecord);
    if (hasAnyKey(tokenRecord, [
        "cacheCreation",
        "cache_creation_input_tokens"
    ]) || hasAnyKey(promptDetails, [
        "cache_creation_tokens"
    ])) {
        return getPromptCacheCreationTokens(tokens);
    }
    return null;
}
function getReasoningTokensOrNull(tokens) {
    const tokenRecord = asRecord(tokens);
    const completionDetails = asRecord(tokenRecord.completion_tokens_details);
    if (hasAnyKey(tokenRecord, [
        "reasoning",
        "reasoning_tokens"
    ]) || hasAnyKey(completionDetails, [
        "reasoning_tokens"
    ])) {
        return getReasoningTokens(tokens);
    }
    return null;
}
function formatUsageLog(tokens) {
    const input = getLoggedInputTokens(tokens);
    const output = getLoggedOutputTokens(tokens);
    const cacheRead = getPromptCacheReadTokens(tokens);
    const cacheWrite = getPromptCacheCreationTokens(tokens);
    const reasoning = getReasoningTokens(tokens);
    let msg = `in=${input} | out=${output}`;
    if (cacheRead > 0) {
        msg += ` | CR=${cacheRead}`;
    }
    if (cacheWrite > 0) {
        msg += ` | CW=${cacheWrite}`;
    }
    if (reasoning > 0) {
        msg += ` | R=${reasoning}`;
    }
    return msg;
}
}),
"[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "appendRequestLog",
    ()=>appendRequestLog,
    "clearPendingRequests",
    ()=>clearPendingRequests,
    "finalizeMostRecentPendingRequest",
    ()=>finalizeMostRecentPendingRequest,
    "finalizePendingRequest",
    ()=>finalizePendingRequest,
    "finalizePendingRequestById",
    ()=>finalizePendingRequestById,
    "getMaxPendingRequestAgeMs",
    ()=>getMaxPendingRequestAgeMs,
    "getModelLatencyStats",
    ()=>getModelLatencyStats,
    "getPendingById",
    ()=>getPendingById,
    "getPendingRequests",
    ()=>getPendingRequests,
    "getRecentLogs",
    ()=>getRecentLogs,
    "getUsageDb",
    ()=>getUsageDb,
    "getUsageHistory",
    ()=>getUsageHistory,
    "saveRequestUsage",
    ()=>saveRequestUsage,
    "sweepStalePendingRequests",
    ()=>sweepStalePendingRequests,
    "trackPendingRequest",
    ()=>trackPendingRequest,
    "updatePendingRequest",
    ()=>updatePendingRequest,
    "updatePendingRequestById",
    ()=>updatePendingRequestById,
    "updatePendingRequestStreamChunks",
    ()=>updatePendingRequestStreamChunks
]);
/**
 * Usage History — extracted from usageDb.js (T-15)
 *
 * Usage tracking: saving, querying, and analytics shim for
 * the usage_history SQLite table.
 *
 * @module lib/usage/usageHistory
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/accountIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory/helpers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/completedRequestDetails.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/migrations.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/usageEvents.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
function normalizePendingMetadata(metadata) {
    if (!metadata) return {};
    const normalized = {};
    if (metadata.clientEndpoint !== undefined) {
        normalized.clientEndpoint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.clientEndpoint) || null;
    }
    if (metadata.providerUrl !== undefined) {
        normalized.providerUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.providerUrl) || null;
    }
    if (metadata.stage !== undefined) {
        normalized.stage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.stage) || null;
        normalized.stageUpdatedAt = Date.now();
    }
    if (metadata.stageUpdatedAt !== undefined) {
        normalized.stageUpdatedAt = typeof metadata.stageUpdatedAt === "number" && Number.isFinite(metadata.stageUpdatedAt) ? metadata.stageUpdatedAt : null;
    }
    if (metadata.clientRequest !== undefined) {
        normalized.clientRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["truncatePendingPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(metadata.clientRequest));
    }
    if (metadata.providerRequest !== undefined) {
        normalized.providerRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["truncatePendingPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(metadata.providerRequest));
    }
    if (metadata.providerResponse !== undefined) {
        normalized.providerResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["truncatePendingPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(metadata.providerResponse));
    }
    if (metadata.clientResponse !== undefined) {
        normalized.clientResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["truncatePendingPreview"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(metadata.clientResponse));
    }
    if (metadata.status !== undefined) {
        const status = Number(metadata.status);
        normalized.status = Number.isFinite(status) ? status : null;
    }
    if (metadata.error !== undefined) {
        normalized.error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.error) || null;
    }
    if (metadata.errorCode !== undefined) {
        normalized.errorCode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.errorCode) || null;
    }
    if (metadata.correlationId !== undefined) {
        normalized.correlationId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(metadata.correlationId) || null;
    }
    return normalized;
}
// ──────────────── Pending Requests (in-memory) ────────────────
const pendingRequests = {
    byModel: Object.create(null),
    byAccount: Object.create(null),
    details: Object.create(null)
};
/**
 * O(1) ID → PendingRequestDetail lookup map.
 * Populated when a detail is created and cleaned up when it is removed/finalized.
 */ const pendingById = new Map();
const DEFAULT_MAX_PENDING_REQUEST_AGE_MS = 60 * 60 * 1000;
const MAX_PENDING_DETAILS = 5000;
const PENDING_SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let _pendingSweepTimer = null;
function getMaxPendingRequestAgeMs(rawValue = process.env.MAX_PENDING_REQUEST_AGE_MS) {
    const parsed = Number.parseInt(rawValue ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_PENDING_REQUEST_AGE_MS;
}
function ensurePendingSweepTimer() {
    if (_pendingSweepTimer || typeof setInterval !== "function") return;
    _pendingSweepTimer = setInterval(()=>{
        try {
            sweepStalePendingRequests();
        } catch  {
        /* never let the reaper throw on the timer thread */ }
    }, PENDING_SWEEP_INTERVAL_MS);
    // Don't keep the process alive just for the reaper.
    _pendingSweepTimer?.unref?.();
}
function sweepStalePendingRequests(now = Date.now(), maxAgeMs = getMaxPendingRequestAgeMs()) {
    let removed = 0;
    const remove = (detail)=>{
        const modelKey = detail.provider ? `${detail.model} (${detail.provider})` : detail.model;
        pendingById.delete(detail.id);
        if (detail.connectionId && isSafeKey(modelKey)) {
            const bucket = pendingRequests.details[detail.connectionId]?.[modelKey];
            if (bucket) {
                const index = bucket.findIndex((entry)=>entry.id === detail.id);
                if (index >= 0) bucket.splice(index, 1);
            }
            cleanupPendingDetails(detail.connectionId, modelKey);
            decrementPendingCounters(modelKey, detail.connectionId);
        }
        removed++;
    };
    for (const detail of pendingById.values()){
        if (now - detail.startedAt > maxAgeMs) remove(detail);
    }
    // Hard backstop: if entries are still piling up faster than they age out, drop the oldest
    // beyond the cap.
    if (pendingById.size > MAX_PENDING_DETAILS) {
        const overflow = pendingById.size - MAX_PENDING_DETAILS;
        const oldest = [
            ...pendingById.values()
        ].sort((a, b)=>a.startedAt - b.startedAt).slice(0, overflow);
        for (const detail of oldest)remove(detail);
    }
    return removed;
}
/** Prototype-pollution denylist — prevents crafted model/provider names from mutating Object.prototype. */ const UNSAFE_KEYS = new Set([
    "__proto__",
    "constructor",
    "prototype"
]);
function isSafeKey(key) {
    return !UNSAFE_KEYS.has(key);
}
function trackPendingRequest(model, provider, connectionId, started, metadata) {
    const modelKey = provider ? `${model} (${provider})` : model;
    if (!isSafeKey(modelKey)) return;
    const normalizedMetadata = normalizePendingMetadata(metadata);
    // Ensure the orphaned-pending reaper is running once pending tracking is in use.
    if (started) ensurePendingSweepTimer();
    // Use hasOwnProperty guard to prevent prototype pollution via crafted keys
    if (!Object.hasOwn(pendingRequests.byModel, modelKey)) {
        pendingRequests.byModel[modelKey] = 0;
    }
    pendingRequests.byModel[modelKey] = Math.max(0, pendingRequests.byModel[modelKey] + (started ? 1 : -1));
    if (connectionId) {
        if (!Object.hasOwn(pendingRequests.byAccount, connectionId)) {
            pendingRequests.byAccount[connectionId] = Object.create(null);
        }
        if (!Object.hasOwn(pendingRequests.details, connectionId)) {
            pendingRequests.details[connectionId] = Object.create(null);
        }
        if (!Object.hasOwn(pendingRequests.byAccount[connectionId], modelKey)) {
            pendingRequests.byAccount[connectionId][modelKey] = 0;
        }
        pendingRequests.byAccount[connectionId][modelKey] = Math.max(0, pendingRequests.byAccount[connectionId][modelKey] + (started ? 1 : -1));
        const nextCount = pendingRequests.byAccount[connectionId][modelKey];
        if (started && nextCount > 0) {
            if (!pendingRequests.details[connectionId][modelKey]) {
                pendingRequests.details[connectionId][modelKey] = [];
            }
            const now = Date.now();
            const newDetail = {
                // crypto RNG (not Math.random) to satisfy CodeQL js/insecure-randomness —
                // this pending-request id flows into attempt logging; it's a correlation
                // id, not a security secret.
                id: `${now}-${globalThis.crypto.randomUUID().slice(0, 6)}`,
                model,
                provider,
                connectionId,
                startedAt: now,
                ...normalizedMetadata
            };
            pendingRequests.details[connectionId][modelKey].push(newDetail);
            pendingById.set(newDetail.id, newDetail);
            return newDetail.id;
        } else if (!started && nextCount >= 0) {
            if (pendingRequests.details[connectionId]?.[modelKey]?.length) {
                const removed = pendingRequests.details[connectionId][modelKey].shift();
                if (removed) pendingById.delete(removed.id);
            }
            if (!pendingRequests.details[connectionId]?.[modelKey]?.length) {
                delete pendingRequests.details[connectionId]?.[modelKey];
                if (Object.keys(pendingRequests.details[connectionId] || {}).length === 0) {
                    delete pendingRequests.details[connectionId];
                }
            }
        }
    }
}
function updatePendingRequest(model, provider, connectionId, metadata) {
    if (!connectionId) return;
    const modelKey = provider ? `${model} (${provider})` : model;
    if (!isSafeKey(modelKey)) return;
    const details = pendingRequests.details[connectionId]?.[modelKey];
    if (!details?.length) return;
    const lastIdx = details.length - 1;
    Object.assign(details[lastIdx], normalizePendingMetadata(metadata));
}
function updatePendingRequestById(id, metadata) {
    const detail = id ? pendingById.get(id) : null;
    if (!detail) return false;
    Object.assign(detail, normalizePendingMetadata(metadata));
    return true;
}
/**
 * Update the first (oldest) pending request detail and then remove it.
 * Unlike updatePendingRequest which targets the last entry, this is designed
 * for the non-streaming completion path where the oldest entry must be finalized
 * before trackPendingRequest(false) removes it from the FIFO queue.
 */ function decrementPendingCounters(modelKey, connectionId) {
    if (Object.hasOwn(pendingRequests.byModel, modelKey)) {
        pendingRequests.byModel[modelKey] = Math.max(0, pendingRequests.byModel[modelKey] - 1);
        if (pendingRequests.byModel[modelKey] === 0) delete pendingRequests.byModel[modelKey];
    }
    if (Object.hasOwn(pendingRequests.byAccount, connectionId)) {
        if (Object.hasOwn(pendingRequests.byAccount[connectionId], modelKey)) {
            pendingRequests.byAccount[connectionId][modelKey] = Math.max(0, pendingRequests.byAccount[connectionId][modelKey] - 1);
            if (pendingRequests.byAccount[connectionId][modelKey] === 0) {
                delete pendingRequests.byAccount[connectionId][modelKey];
            }
        }
        if (!pendingRequests.byAccount[connectionId] || Object.keys(pendingRequests.byAccount[connectionId]).length === 0) {
            delete pendingRequests.byAccount[connectionId];
        }
    }
}
function cleanupPendingDetails(connectionId, modelKey) {
    if (!pendingRequests.details[connectionId]?.[modelKey]?.length) {
        delete pendingRequests.details[connectionId]?.[modelKey];
    }
    if (!pendingRequests.details[connectionId] || Object.keys(pendingRequests.details[connectionId]).length === 0) {
        delete pendingRequests.details[connectionId];
    }
}
function finalizePendingDetailAt(connectionId, modelKey, index, metadata) {
    if (!isSafeKey(modelKey)) return null;
    const details = pendingRequests.details[connectionId]?.[modelKey];
    if (!details?.length || index < 0 || index >= details.length) return null;
    const completedAt = Date.now();
    const updated = {
        ...details[index],
        ...normalizePendingMetadata(metadata),
        completedAt,
        durationMs: Math.max(0, completedAt - details[index].startedAt)
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["storeCompletedDetail"])(updated);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["maybeEnrichCompletedDetail"])(updated, connectionId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["scheduleCompletedDetailCleanup"])(updated.id);
    details.splice(index, 1);
    pendingById.delete(updated.id);
    cleanupPendingDetails(connectionId, modelKey);
    decrementPendingCounters(modelKey, connectionId);
    return updated.id;
}
function finalizePendingRequest(model, provider, connectionId, metadata) {
    if (!connectionId) return;
    const modelKey = provider ? `${model} (${provider})` : model;
    finalizePendingDetailAt(connectionId, modelKey, 0, metadata);
}
function finalizePendingRequestById(id, metadata) {
    if (!id) return false;
    const detail = pendingById.get(id);
    if (!detail?.connectionId) return false;
    const modelKey = detail.provider ? `${detail.model} (${detail.provider})` : detail.model;
    if (!isSafeKey(modelKey)) return false;
    const details = pendingRequests.details[detail.connectionId]?.[modelKey];
    const index = details?.findIndex((entry)=>entry.id === id) ?? -1;
    return finalizePendingDetailAt(detail.connectionId, modelKey, index, metadata) !== null;
}
function finalizeMostRecentPendingRequest(model, provider, connectionId, metadata) {
    if (!connectionId) return;
    const modelKey = provider ? `${model} (${provider})` : model;
    if (!isSafeKey(modelKey)) return;
    const details = pendingRequests.details[connectionId]?.[modelKey];
    if (!details?.length) return;
    finalizePendingDetailAt(connectionId, modelKey, details.length - 1, metadata);
}
;
function updatePendingRequestStreamChunks(model, provider, connectionId, streamChunks) {
    if (!connectionId) return;
    const modelKey = provider ? `${model} (${provider})` : model;
    if (!isSafeKey(modelKey)) return;
    const details = pendingRequests.details[connectionId]?.[modelKey];
    if (!details?.length) return;
    details[0].streamChunks = streamChunks;
}
function getPendingRequests() {
    return pendingRequests;
}
function getPendingById() {
    return pendingById;
}
function clearPendingRequests() {
    pendingRequests.byModel = Object.create(null);
    pendingRequests.byAccount = Object.create(null);
    pendingRequests.details = Object.create(null);
    pendingById.clear();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$completedRequestDetails$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["clearCompletedDetails"])();
}
// ──────────────── getUsageDb Shim (backward compat) ────────────────
const MAX_ROWS = 10000;
async function getUsageDb(sinceIso, limit, cursor) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const maxRows = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : MAX_ROWS;
    let rows;
    if (cursor) {
        // Cursor-based pagination (next page after cursor)
        // Use > cursor to get rows after the last timestamp of previous page (ASC order)
        rows = sinceIso ? db.prepare(`SELECT * FROM usage_history WHERE timestamp >= ? AND timestamp > ? ORDER BY timestamp ASC LIMIT ?`).all(sinceIso, cursor, maxRows) : db.prepare(`SELECT * FROM usage_history WHERE timestamp > ? ORDER BY timestamp ASC LIMIT ?`).all(cursor, maxRows);
    } else if (sinceIso) {
        // Initial query with date filter
        rows = db.prepare(`SELECT * FROM usage_history WHERE timestamp >= ? ORDER BY timestamp ASC LIMIT ?`).all(sinceIso, maxRows);
    } else {
        // No filter - get all (with limit)
        rows = db.prepare(`SELECT * FROM usage_history ORDER BY timestamp ASC LIMIT ?`).all(maxRows);
    }
    const history = rows.map((row)=>{
        const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["asRecord"])(row);
        return {
            provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.provider),
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.model),
            connectionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.connection_id),
            apiKeyId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.api_key_id),
            apiKeyName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.api_key_name),
            serviceTier: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeServiceTier"])(r.service_tier),
            tokens: {
                input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_input),
                output: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_output),
                cacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_cache_read),
                cacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_cache_creation),
                reasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_reasoning)
            },
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.status),
            success: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.success) === 1,
            latencyMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.latency_ms),
            timeToFirstTokenMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.ttft_ms),
            errorCode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.error_code),
            timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.timestamp)
        };
    });
    // Provide next cursor if we hit the limit (more rows exist)
    const nextCursor = rows.length === maxRows ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["asRecord"])(rows[rows.length - 1]).timestamp) : null;
    return {
        data: {
            history,
            nextCursor
        }
    };
}
async function saveRequestUsage(entry) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldPersistToDisk"]) return;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const timestamp = entry.timestamp || new Date().toISOString();
        const serviceTier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeServiceTier"])(entry.serviceTier ?? entry.service_tier);
        const tokensInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(entry.tokens);
        const tokensOutput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(entry.tokens);
        const connection = entry.connectionId ? db.prepare("SELECT * FROM provider_connections WHERE id = ?").get(entry.connectionId) : undefined;
        const accountIdentity = connection ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveUsageAccountIdentity"])(connection) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$accountIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveOrphanedUsageAccountIdentity"])(entry.provider, entry.connectionId);
        // Dedup guard: skip INSERT when an identical row already exists in the same
        // second. This prevents double-counting when onRequestSuccess fires more
        // than once (e.g. combo routing calling the callback from both the
        // streaming and non-streaming paths for the same underlying request).
        // Keyed on the natural identity of a request: timestamp + provider + model
        // + connectionId + apiKeyId + token counts. If only the endpoint is missing
        // on the existing row, fill it in rather than inserting a duplicate.
        let inserted = false;
        db.transaction(()=>{
            const existing = db.prepare(`SELECT id, endpoint FROM usage_history
           WHERE timestamp = ?
             AND COALESCE(provider, '')     = COALESCE(?, '')
             AND COALESCE(model, '')        = COALESCE(?, '')
             AND COALESCE(connection_id, '') = COALESCE(?, '')
             AND COALESCE(api_key_id, '')   = COALESCE(?, '')
             AND tokens_input  = ?
             AND tokens_output = ?
           ORDER BY id DESC LIMIT 1`).get(timestamp, entry.provider || null, entry.model || null, entry.connectionId || null, entry.apiKeyId || null, tokensInput, tokensOutput);
            if (existing) {
                // Back-fill endpoint if the original row missed it.
                if (!existing.endpoint && entry.endpoint) {
                    db.prepare(`UPDATE usage_history SET endpoint = ? WHERE id = ?`).run(entry.endpoint, existing.id);
                }
                return; // duplicate — do not insert
            }
            db.prepare(`
        INSERT INTO usage_history (provider, model, connection_id, account_key, account_label,
          account_label_priority, api_key_id, api_key_name, tokens_input, tokens_output,
          tokens_cache_read, tokens_cache_creation, tokens_reasoning, service_tier, status, success,
          latency_ms, ttft_ms, error_code, combo_strategy, endpoint, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(entry.provider || null, entry.model || null, entry.connectionId || null, accountIdentity.accountKey, accountIdentity.accountLabel, accountIdentity.accountLabelPriority, entry.apiKeyId || null, entry.apiKeyName || null, tokensInput, tokensOutput, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPromptCacheReadTokens"])(entry.tokens), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPromptCacheCreationTokens"])(entry.tokens), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningTokens"])(entry.tokens), serviceTier, entry.status || null, entry.success === false ? 0 : 1, Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0, Number.isFinite(Number(entry.timeToFirstTokenMs)) ? Number(entry.timeToFirstTokenMs) : Number.isFinite(Number(entry.latencyMs)) ? Number(entry.latencyMs) : 0, entry.errorCode || null, entry.comboStrategy || entry.combo_strategy || null, entry.endpoint || null, timestamp);
            inserted = true;
        })();
        // Decoupled via the event bus so usageHistory never imports providerLimits
        // (which would pull the executors/translator graph into the type-check surface).
        // Only emit when a row was actually inserted — not on dedup no-ops.
        if (inserted) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["emitUsageRecorded"])(entry.provider, entry.connectionId);
        }
    } catch (error) {
        console.error("Failed to save usage stats:", error);
    }
}
async function getUsageHistory(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = "SELECT * FROM usage_history";
    const conditions = [];
    const params = {};
    if (filter.provider) {
        conditions.push("provider = @provider");
        params.provider = filter.provider;
    }
    if (filter.model) {
        conditions.push("model = @model");
        params.model = filter.model;
    }
    if (filter.startDate) {
        conditions.push("timestamp >= @startDate");
        params.startDate = new Date(filter.startDate).toISOString();
    }
    if (filter.endDate) {
        conditions.push("timestamp <= @endDate");
        params.endDate = new Date(filter.endDate).toISOString();
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY timestamp ASC";
    const rows = db.prepare(sql).all(params);
    return rows.map((row)=>{
        const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["asRecord"])(row);
        return {
            provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.provider),
            model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.model),
            connectionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.connection_id),
            apiKeyId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.api_key_id),
            apiKeyName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.api_key_name),
            serviceTier: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeServiceTier"])(r.service_tier),
            tokens: {
                input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_input),
                output: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_output),
                cacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_cache_read),
                cacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_cache_creation),
                reasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.tokens_reasoning)
            },
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.status),
            success: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.success) === 1,
            latencyMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.latency_ms),
            timeToFirstTokenMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(r.ttft_ms),
            errorCode: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.error_code),
            timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(r.timestamp)
        };
    });
}
async function getModelLatencyStats(options = {}) {
    const windowHours = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolvePositiveOption"])(options.windowHours, 24);
    const minSamples = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolvePositiveOption"])(options.minSamples, 1);
    const maxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolvePositiveOption"])(options.maxRows, 10000);
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const sinceIso = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
    const conditions = [
        "timestamp >= @sinceIso",
        "provider IS NOT NULL",
        "model IS NOT NULL"
    ];
    const queryParams = {
        sinceIso,
        maxRows
    };
    if (options.provider) {
        conditions.push("provider = @provider");
        queryParams.provider = options.provider;
    }
    if (options.model) {
        conditions.push("model = @model");
        queryParams.model = options.model;
    }
    const rows = db.prepare(`
      SELECT provider, model, success, latency_ms, ttft_ms, tokens_output
      FROM usage_history
      WHERE ${conditions.join(" AND ")}
      ORDER BY timestamp DESC
      LIMIT @maxRows
    `).all(queryParams);
    const grouped = new Map();
    for (const row of rows){
        const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(row.provider);
        const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(row.model);
        if (!provider || !model) continue;
        const key = `${provider}/${model}`;
        if (!grouped.has(key)) grouped.set(key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createLatencyBucket"])(provider, model));
        const bucket = grouped.get(key);
        if (!bucket) continue;
        bucket.totalRequests += 1;
        const isSuccess = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.success) !== 0;
        if (isSuccess) bucket.successfulRequests += 1;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["accumulateLatencySample"])(bucket, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.latency_ms), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.ttft_ms), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output), isSuccess);
    }
    const stats = {};
    for (const [key, bucket] of grouped.entries()){
        const entry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2f$helpers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildLatencyStatsEntry"])(key, bucket, minSamples, windowHours);
        if (entry) stats[key] = entry;
    }
    return stats;
}
async function appendRequestLog({ model: _model, provider: _provider, connectionId: _connectionId, tokens: _tokens, status: _status }) {
// Deprecated: request summaries now come from SQLite call_logs.
}
async function getRecentLogs(limit = 200) {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const rows = db.prepare(`
        SELECT timestamp, model, provider, account, tokens_in, tokens_out, status
        FROM call_logs
        ORDER BY timestamp DESC
        LIMIT ?
      `).all(limit);
        return rows.map((row)=>{
            const timestamp = typeof row.timestamp === "string" ? row.timestamp : new Date().toISOString();
            const provider = typeof row.provider === "string" ? row.provider.toUpperCase() : "-";
            const model = typeof row.model === "string" ? row.model : "-";
            const account = typeof row.account === "string" ? row.account : "-";
            const tokensIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_in);
            const tokensOut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_out);
            const status = typeof row.status === "number" ? row.status : String(row.status || "-");
            return `${timestamp} | ${model} | ${provider} | ${account} | ${tokensIn} | ${tokensOut} | ${status}`;
        });
    } catch (error) {
        console.error("[usageDb] Failed to read recent call logs:", error instanceof Error ? error.message : String(error));
        return [];
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/pendingRequestScope.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "finalizePendingScope",
    ()=>finalizePendingScope,
    "updatePendingScope",
    ()=>updatePendingScope
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function updatePendingScope(scope, metadata) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updatePendingRequestById"])(scope.id || null, metadata)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updatePendingRequest"])(scope.model, scope.provider, scope.connectionId, metadata);
    }
}
function finalizePendingScope(scope, metadata) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["finalizePendingRequestById"])(scope.id, metadata)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["finalizePendingRequest"])(scope.model, scope.provider, scope.connectionId, metadata);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/providerLimitsCache.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mergeProviderLimitsCacheEntry",
    ()=>mergeProviderLimitsCacheEntry,
    "toProviderLimitsCacheEntry",
    ()=>toProviderLimitsCacheEntry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$grokBilling$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/grokBilling.ts [instrumentation] (ecmascript)");
;
const GROK_CLI_PROVIDER = "grok-cli";
function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function hasUsableCachedData(cache) {
    return Boolean(cache?.billing || cache?.quotas && Object.keys(cache.quotas).length > 0);
}
function toProviderLimitsCacheEntry(usage, source, fetchedAt = new Date().toISOString()) {
    const bankedResetCredits = Number(usage.bankedResetCredits);
    return {
        quotas: isRecord(usage.quotas) ? usage.quotas : null,
        plan: usage.plan ?? null,
        message: typeof usage.message === "string" ? usage.message : null,
        fetchedAt,
        source,
        bankedResetCredits: Number.isFinite(bankedResetCredits) ? bankedResetCredits : undefined,
        billing: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$grokBilling$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeGrokBillingStatus"])(usage.billing)
    };
}
function mergeProviderLimitsCacheEntry(provider, next, previous) {
    if (!previous) return next;
    if (!next.quotas && next.message && hasUsableCachedData(previous)) {
        return previous;
    }
    if (provider !== GROK_CLI_PROVIDER) return next;
    const nextBilling = next.billing;
    const previousAutoTopUp = previous.billing?.autoTopUp;
    if (!nextBilling || nextBilling.autoTopUp.available || !previousAutoTopUp) return next;
    return {
        ...next,
        billing: {
            ...nextBilling,
            autoTopUp: previousAutoTopUp
        }
    };
}
}),
"[project]/src/lib/usage/flatRateProviders.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isFlatRateProvider",
    ()=>isFlatRateProvider
]);
/**
 * Flat-rate (subscription / cookie-web) provider classification — issue #5552.
 *
 * Some providers are billed at a flat rate (a subscription or a coding plan),
 * not per token: cookie/web sessions (ChatGPT Web, grok-web, …) are backed by a
 * consumer subscription, and several "Coding Plan" providers (Codex, MiniMax
 * Coding, Kimi Coding, GLM Coding, …) bill a fixed monthly fee. These providers
 * still carry per-token pricing rows (used for pre-flight estimates), so cost
 * analytics computed from those rows shows an inflated dollar amount that does
 * not match the user's actual bill. For those providers analytics should show
 * $0 instead — see {@link module:lib/usage/costCalculator}.
 *
 * This is intentionally a DISPLAY-only signal: it is consulted by the analytics
 * surfaces (opt-in via the `flatRateAsZero` cost option), never by the budget /
 * quota / routing paths, so per-request cost estimation is unchanged.
 *
 * @module lib/usage/flatRateProviders
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/providers/web-cookie.ts [instrumentation] (ecmascript)");
;
/**
 * Dedicated subscription / coding-plan provider ids whose identity IS a
 * flat-rate plan. Kept explicit (not derived) because these entries sit in the
 * api-key / oauth categories alongside genuinely metered providers and carry
 * real per-token pricing rows.
 *
 * Deliberately EXCLUDED even though token-priced and sometimes grouped with the
 * above: `codex`/`cx` (OmniRoute actively tracks Codex token cost — Fast-tier
 * multipliers and GPT-5.x pricing — and Codex can be a metered API account, so
 * its analytics cost is intentional, not an artifact), `byteplus` (BytePlus
 * ModelArk is a metered inference host, billed per token — zeroing it would hide
 * real cost), `minimax-cn` (the metered Minimax China API, distinct from the
 * `minimax` "Minimax Coding" plan), and `glm-thinking` (metered tier, distinct
 * from the `glm` Coding plan).
 */ const FLAT_RATE_SUBSCRIPTION_PROVIDER_IDS = new Set([
    "minimax",
    "kimi-coding",
    "kimi-coding-apikey",
    "xiaomi-mimo",
    "bailian-coding-plan",
    "qwen-cloud-token-plan",
    "glm",
    "glm-cn"
]);
function isFlatRateProvider(providerId) {
    if (!providerId || typeof providerId !== "string") return false;
    const id = providerId.trim().toLowerCase();
    if (!id) return false;
    if (FLAT_RATE_SUBSCRIPTION_PROVIDER_IDS.has(id)) return true;
    return Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2f$web$2d$cookie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["WEB_COOKIE_PROVIDERS"], id);
}
}),
"[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateCost",
    ()=>calculateCost,
    "calculateModalCost",
    ()=>calculateModalCost,
    "computeAudioCost",
    ()=>computeAudioCost,
    "computeCostFromPricing",
    ()=>computeCostFromPricing,
    "computeImageCost",
    ()=>computeImageCost,
    "computeRerankCost",
    ()=>computeRerankCost,
    "computeVideoCost",
    ()=>computeVideoCost,
    "getCodexFastCostMultiplier",
    ()=>getCodexFastCostMultiplier,
    "normalizeModelName",
    ()=>normalizeModelName
]);
/**
 * Cost Calculator — extracted from usageDb.js (T-15)
 *
 * Pure function for calculating request cost based on model pricing.
 * No DB interaction — pricing is fetched from localDb.
 *
 * @module lib/usage/costCalculator
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$flatRateProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/flatRateProviders.ts [instrumentation] (ecmascript)");
;
function normalizeModelName(model) {
    if (!model || !model.includes("/")) return model;
    const parts = model.split("/");
    return parts[parts.length - 1];
}
/**
 * xAI reports the exact provider-billed cost of a request in the chat-completions
 * `usage` object via `cost_in_usd_ticks` (port of decolua/9router#2453, capability
 * A — @ryanngit). Per the official docs — both
 * https://docs.x.ai/developers/cost-tracking and the API reference's usage schema
 * ("TICKS_IN_USD_CENT: i64 = 100_000_000") — there are 10_000_000_000 (1e10) ticks
 * per USD. Example from the docs: 37756000 ticks ≈ $0.0038.
 *
 * NOTE: this divisor is intentionally 1e10, not the 1e12 used by the upstream PR
 * (which under-reports cost 100x) — verified directly against the xAI docs.
 */ const USD_TICKS_PER_DOLLAR = 10_000_000_000;
/**
 * Extract an exact, provider-reported USD cost from a token/usage record when one
 * is present, so callers can trust it over the token × pricing estimate. Currently
 * only xAI's `cost_in_usd_ticks` field is handled — see comment above.
 */ function extractExactCostUsd(tokens) {
    const ticks = tokens?.cost_in_usd_ticks;
    if (typeof ticks === "number" && Number.isFinite(ticks) && ticks >= 0) {
        return ticks / USD_TICKS_PER_DOLLAR;
    }
    return null;
}
function toNumber(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function normalizeServiceTier(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function stripCodexEffortSuffix(model) {
    return model.replace(/-(?:ultra|max|xhigh|high|medium|low|none)$/i, "");
}
function getCodexFastCostMultiplier(provider, model, serviceTier) {
    const providerKey = normalizeServiceTier(provider);
    const tier = normalizeServiceTier(serviceTier);
    if (providerKey !== "codex" && providerKey !== "cx") {
        return 1;
    }
    // OpenAI Flex Processing is billed at a 50% token discount, like Batch,
    // while still using the Responses API with service_tier="flex".
    if (tier === "flex") return 0.5;
    if (tier !== "priority" && tier !== "fast") return 1;
    const modelKey = stripCodexEffortSuffix(normalizeModelName(String(model || "")).toLowerCase());
    const compactModelKey = modelKey.replace(/-/g, "");
    if (/^gpt-5\.6-(?:sol|terra|luna)$/.test(modelKey) || /^gpt5\.6(?:sol|terra|luna)$/.test(compactModelKey)) {
        return 1.5;
    }
    if (modelKey === "gpt-5.5" || compactModelKey === "gpt5.5") return 2.5;
    if (modelKey === "gpt-5.4" || compactModelKey === "gpt5.4") return 2;
    return 1;
}
function computeCostFromPricing(pricing, tokens, options = {}) {
    if (!tokens) return 0;
    // Trust an exact, provider-reported cost over the token × pricing estimate
    // when one is present — works even when no local pricing row exists yet.
    const exactCostUsd = extractExactCostUsd(tokens);
    if (exactCostUsd !== null) return exactCostUsd;
    if (!pricing) return 0;
    // Flat-rate (subscription / cookie-web) providers don't bill per token — their
    // per-token pricing rows exist only for estimation, so display surfaces opt in
    // to show $0 instead of an inflated estimate (#5552).
    if (options.flatRateAsZero && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$flatRateProviders$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isFlatRateProvider"])(options.provider)) return 0;
    const inputPrice = toNumber(pricing.input, 0);
    const cachedPrice = toNumber(pricing.cached, inputPrice);
    const outputPrice = toNumber(pricing.output, 0);
    const reasoningPrice = toNumber(pricing.reasoning, outputPrice);
    const cacheCreationPrice = toNumber(pricing.cache_creation, inputPrice);
    let cost = 0;
    const inputTokens = tokens.input ?? tokens.prompt_tokens ?? tokens.input_tokens ?? 0;
    const cachedTokens = tokens.cacheRead ?? tokens.cached_tokens ?? tokens.cache_read_input_tokens ?? 0;
    const cacheCreationTokens = tokens.cacheCreation ?? tokens.cache_creation_input_tokens ?? 0;
    // prompt_tokens from extractors already includes cache_read + cache_creation,
    // so we must subtract BOTH cache types to avoid pricing cache at the full
    // input rate in addition to their dedicated cache_* rates below.
    const nonCachedInput = Math.max(0, inputTokens - cachedTokens - cacheCreationTokens);
    cost += nonCachedInput * (inputPrice / 1_000_000);
    if (cachedTokens > 0) cost += cachedTokens * (cachedPrice / 1_000_000);
    const outputTokens = tokens.output ?? tokens.completion_tokens ?? tokens.output_tokens ?? 0;
    cost += outputTokens * (outputPrice / 1_000_000);
    // completion_tokens is reasoning-inclusive. Reasoning is already billed at
    // the output rate above, so a dedicated price contributes only its premium.
    const reasoningTokens = tokens.reasoning ?? tokens.reasoning_tokens ?? 0;
    if (reasoningTokens > 0 && pricing.reasoning !== undefined && pricing.reasoning !== null) {
        cost += reasoningTokens * ((reasoningPrice - outputPrice) / 1_000_000);
    }
    if (cacheCreationTokens > 0) cost += cacheCreationTokens * (cacheCreationPrice / 1_000_000);
    return cost * getCodexFastCostMultiplier(options.provider, options.model, options.serviceTier);
}
async function calculateCost(provider, model, tokens, options = {}) {
    if (!tokens || !provider || !model) return 0;
    // Short-circuit before any pricing DB lookup when an exact, provider-reported
    // cost is present (currently xAI's `cost_in_usd_ticks` — see extractExactCostUsd).
    const exactCostUsd = extractExactCostUsd(tokens);
    if (exactCostUsd !== null) return exactCostUsd;
    try {
        const { getPricingForModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        // Try exact match first, then normalized model name
        let pricing = await getPricingForModel(provider, model);
        if (!pricing) {
            const normalized = normalizeModelName(model);
            if (normalized !== model) {
                pricing = await getPricingForModel(provider, normalized);
            }
            const providerKey = normalizeServiceTier(provider);
            if (!pricing && (providerKey === "codex" || providerKey === "cx")) {
                const effortlessModel = stripCodexEffortSuffix(normalized);
                if (effortlessModel !== normalized) {
                    pricing = await getPricingForModel(provider, effortlessModel);
                }
            }
        }
        if (!pricing) return 0;
        const pricingRecord = pricing && typeof pricing === "object" && !Array.isArray(pricing) ? pricing : {};
        return computeCostFromPricing(pricingRecord, tokens, {
            provider,
            model,
            ...options
        });
    } catch (error) {
        console.error("Error calculating cost:", error);
        return 0;
    }
}
function computeImageCost(pricing, usage) {
    if (!pricing) return 0;
    const perImage = toNumber(pricing.output_cost_per_image ?? pricing.input_cost_per_image, 0);
    const n = Math.max(0, Math.floor(toNumber(usage.n, 0)));
    return perImage * n;
}
function computeAudioCost(pricing, usage) {
    if (!pricing) return 0;
    const seconds = toNumber(usage.seconds, 0);
    if (seconds > 0) {
        const perSecond = toNumber(pricing.input_cost_per_second ?? pricing.output_cost_per_second, 0);
        if (perSecond > 0) return perSecond * seconds;
    }
    const characters = toNumber(usage.characters, 0);
    if (characters > 0) {
        const perChar = toNumber(pricing.input_cost_per_character ?? pricing.output_cost_per_character, 0);
        // Round to 10 decimals to drop binary-FP artifacts (e.g. 0.000015 * 1000).
        if (perChar > 0) return Math.round(perChar * characters * 1e10) / 1e10;
    }
    return 0;
}
function computeRerankCost(pricing, usage) {
    if (!pricing) return 0;
    const perUnit = toNumber(pricing.search_unit_cost ?? pricing.input_cost_per_query, 0);
    const units = Math.max(0, toNumber(usage.searchUnits, 0));
    return perUnit * units;
}
function computeVideoCost(pricing, usage) {
    if (!pricing) return 0;
    const perSecond = toNumber(pricing.output_cost_per_video_per_second ?? pricing.input_cost_per_video_per_second, 0);
    const seconds = toNumber(usage.seconds, 0);
    return perSecond * seconds;
}
async function calculateModalCost(modality, provider, model, usage) {
    if (!provider || !model) return 0;
    try {
        const { getPricingForModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        let pricing = await getPricingForModel(provider, model);
        if (!pricing) {
            const normalized = normalizeModelName(model);
            if (normalized !== model) pricing = await getPricingForModel(provider, normalized);
        }
        if (!pricing) return 0;
        const rec = pricing;
        switch(modality){
            case "image":
                return computeImageCost(rec, usage);
            case "audio":
                return computeAudioCost(rec, usage);
            case "rerank":
                return computeRerankCost(rec, usage);
            case "video":
                return computeVideoCost(rec, usage);
            default:
                return 0;
        }
    } catch (error) {
        console.error("Error calculating modal cost:", error);
        return 0;
    }
}
}),
"[project]/src/lib/usage/aggregateHistory.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRawDataCutoffDate",
    ()=>getRawDataCutoffDate,
    "isAggregationEnabled",
    ()=>isAggregationEnabled,
    "rollupDailyUsage",
    ()=>rollupDailyUsage,
    "rollupHourlyQuota",
    ()=>rollupHourlyQuota,
    "rollupUsageHistoryBeforeDate",
    ()=>rollupUsageHistoryBeforeDate
]);
/**
 * Aggregation utility functions for usage data summarization.
 * Rolls up usage_history (and quota_snapshots) into daily summary tables.
 *
 * @module lib/usage/aggregateHistory
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/databaseSettings.ts [instrumentation] (ecmascript)");
;
;
async function rollupDailyUsage(fromDate, toDate) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = {
        processed: 0,
        inserted: 0,
        errors: 0
    };
    try {
        // Aggregate quota_snapshots by provider, model, and date
        const aggregateQuery = `
      INSERT INTO daily_usage_summary (provider, model, date, total_requests, total_input_tokens, total_output_tokens, total_cost)
      SELECT 
        provider,
        COALESCE(json_extract(raw_data, '$.model'), 'unknown') as model,
        DATE(created_at) as date,
        COUNT(*) as total_requests,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.input_tokens') AS INTEGER)), 0) as total_input_tokens,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.output_tokens') AS INTEGER)), 0) as total_output_tokens,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.cost') AS REAL)), 0.0) as total_cost
      FROM quota_snapshots
      WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?
      GROUP BY provider, model, DATE(created_at)
      ON CONFLICT(provider, model, date) DO UPDATE SET
        total_requests = excluded.total_requests,
        total_input_tokens = excluded.total_input_tokens,
        total_output_tokens = excluded.total_output_tokens,
        total_cost = excluded.total_cost
    `;
        const stmt = db.prepare(aggregateQuery);
        const runResult = stmt.run(fromDate, toDate);
        result.processed = runResult.changes;
        result.inserted = runResult.changes;
        console.log(`[Aggregation] Daily rollup: ${result.inserted} rows for ${fromDate} to ${toDate}`);
    } catch (err) {
        console.error("[Aggregation] Daily rollup error:", err);
        result.errors++;
    }
    return result;
}
async function rollupHourlyQuota(fromDate, toDate) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = {
        processed: 0,
        inserted: 0,
        errors: 0
    };
    try {
        // Aggregate quota_snapshots by provider, model, and hour
        const aggregateQuery = `
      INSERT INTO hourly_usage_summary (provider, model, date_hour, total_requests, total_input_tokens, total_output_tokens, total_cost)
      SELECT 
        provider,
        COALESCE(json_extract(raw_data, '$.model'), 'unknown') as model,
        datetime(strftime('%Y-%m-%d %H:00:00', created_at)) as date_hour,
        COUNT(*) as total_requests,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.input_tokens') AS INTEGER)), 0) as total_input_tokens,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.output_tokens') AS INTEGER)), 0) as total_output_tokens,
        COALESCE(SUM(CAST(json_extract(raw_data, '$.cost') AS REAL)), 0.0) as total_cost
      FROM quota_snapshots
      WHERE created_at >= ? AND created_at <= ?
      GROUP BY provider, model, datetime(strftime('%Y-%m-%d %H:00:00', created_at))
      ON CONFLICT(provider, model, date_hour) DO UPDATE SET
        total_requests = excluded.total_requests,
        total_input_tokens = excluded.total_input_tokens,
        total_output_tokens = excluded.total_output_tokens,
        total_cost = excluded.total_cost
    `;
        const stmt = db.prepare(aggregateQuery);
        const runResult = stmt.run(fromDate, toDate);
        result.processed = runResult.changes;
        result.inserted = runResult.changes;
        console.log(`[Aggregation] Hourly rollup: ${result.inserted} rows for ${fromDate} to ${toDate}`);
    } catch (err) {
        console.error("[Aggregation] Hourly rollup error:", err);
        result.errors++;
    }
    return result;
}
async function rollupUsageHistoryBeforeDate(beforeDate) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const result = {
        processed: 0,
        inserted: 0,
        errors: 0
    };
    try {
        const aggregateQuery = `
      INSERT INTO daily_usage_summary (provider, model, date, total_requests, total_input_tokens, total_output_tokens, total_cost)
      SELECT
        LOWER(provider) as provider,
        LOWER(model) as model,
        DATE(timestamp) as date,
        COUNT(*) as total_requests,
        COALESCE(SUM(tokens_input), 0) as total_input_tokens,
        COALESCE(SUM(tokens_output), 0) as total_output_tokens,
        0.0 as total_cost
      FROM usage_history
      WHERE timestamp < ?
        AND provider IS NOT NULL AND provider != ''
        AND model IS NOT NULL AND model != ''
      GROUP BY LOWER(provider), LOWER(model), DATE(timestamp)
      ON CONFLICT(provider, model, date) DO UPDATE SET
        total_requests = daily_usage_summary.total_requests + excluded.total_requests,
        total_input_tokens = daily_usage_summary.total_input_tokens + excluded.total_input_tokens,
        total_output_tokens = daily_usage_summary.total_output_tokens + excluded.total_output_tokens
    `;
        const stmt = db.prepare(aggregateQuery);
        const runResult = stmt.run(beforeDate);
        result.processed = runResult.changes;
        result.inserted = runResult.changes;
        console.log(`[Aggregation] usage_history rollup: ${result.inserted} rows for dates before ${beforeDate}`);
    } catch (err) {
        console.error("[Aggregation] usage_history rollup error:", err);
        result.errors++;
    }
    return result;
}
async function getRawDataCutoffDate() {
    // The raw-data cutoff MUST match the actual rollup/delete boundary used by
    // cleanupUsageHistory (src/lib/db/cleanup.ts), which is driven by
    // retention.usageHistory — NOT aggregation.rawDataRetentionDays.
    // Using rawDataRetentionDays (default 7 per migration 046) creates a gap:
    // analytics floors raw data at day-7 while cleanup doesn't roll up until
    // day-30, so the window [day-30, day-7) is excluded from BOTH UNION legs.
    const rawDataRetentionDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getUserDatabaseSettings"])().retention.usageHistory;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - rawDataRetentionDays);
    return cutoffDate.toISOString().split("T")[0];
}
async function isAggregationEnabled() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$databaseSettings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getUserDatabaseSettings"])().aggregation.enabled;
}
}),
"[project]/src/lib/usage/usageStats.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getConnectionSpendUsdSinceAdded",
    ()=>getConnectionSpendUsdSinceAdded,
    "getMonthlyProviderTokensForConnection",
    ()=>getMonthlyProviderTokensForConnection,
    "getUsageStats",
    ()=>getUsageStats
]);
/**
 * Usage Stats — extracted from usageDb.js (T-15)
 *
 * Aggregates usage data into stats for the dashboard:
 * totals, by provider/model/account/apiKey, 10-minute buckets.
 *
 * @module lib/usage/usageStats
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/apiKeys.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/usageHistory.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/display/names.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/costCalculator.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$aggregateHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/aggregateHistory.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrEmpty(value) {
    return typeof value === "string" ? value : "";
}
function buildUsageSourceSql(aggregationEnabled) {
    if (!aggregationEnabled) {
        return `
      SELECT
        provider,
        model,
        timestamp,
        connection_id,
        api_key_id,
        api_key_name,
        COALESCE(tokens_input, 0) as tokens_input,
        COALESCE(tokens_output, 0) as tokens_output,
        COALESCE(tokens_cache_read, 0) as tokens_cache_read,
        COALESCE(tokens_cache_creation, 0) as tokens_cache_creation,
        COALESCE(tokens_reasoning, 0) as tokens_reasoning,
        COALESCE(tokens_input, 0) as cost_tokens_input,
        COALESCE(tokens_output, 0) as cost_tokens_output,
        COALESCE(tokens_cache_read, 0) as cost_tokens_cache_read,
        COALESCE(tokens_cache_creation, 0) as cost_tokens_cache_creation,
        COALESCE(tokens_reasoning, 0) as cost_tokens_reasoning,
        0.0 as stored_cost,
        COALESCE(service_tier, 'standard') as service_tier,
        1 as request_count
      FROM usage_history
    `;
    }
    return `
    SELECT
      provider,
      model,
      timestamp,
      connection_id,
      api_key_id,
      api_key_name,
      COALESCE(tokens_input, 0) as tokens_input,
      COALESCE(tokens_output, 0) as tokens_output,
      COALESCE(tokens_cache_read, 0) as tokens_cache_read,
      COALESCE(tokens_cache_creation, 0) as tokens_cache_creation,
      COALESCE(tokens_reasoning, 0) as tokens_reasoning,
      COALESCE(tokens_input, 0) as cost_tokens_input,
      COALESCE(tokens_output, 0) as cost_tokens_output,
      COALESCE(tokens_cache_read, 0) as cost_tokens_cache_read,
      COALESCE(tokens_cache_creation, 0) as cost_tokens_cache_creation,
      COALESCE(tokens_reasoning, 0) as cost_tokens_reasoning,
      0.0 as stored_cost,
      COALESCE(service_tier, 'standard') as service_tier,
      1 as request_count
    FROM usage_history
    WHERE DATE(timestamp) >= ?

    UNION ALL

    SELECT
      provider,
      model,
      date || 'T12:00:00.000Z' as timestamp,
      NULL as connection_id,
      NULL as api_key_id,
      NULL as api_key_name,
      COALESCE(total_input_tokens, 0) as tokens_input,
      COALESCE(total_output_tokens, 0) as tokens_output,
      0 as tokens_cache_read,
      0 as tokens_cache_creation,
      0 as tokens_reasoning,
      0 as cost_tokens_input,
      0 as cost_tokens_output,
      0 as cost_tokens_cache_read,
      0 as cost_tokens_cache_creation,
      0 as cost_tokens_reasoning,
      COALESCE(total_cost, 0.0) as stored_cost,
      'standard' as service_tier,
      COALESCE(total_requests, 0) as request_count
    FROM daily_usage_summary
    WHERE date < ?
  `;
}
const AGGREGATE_FIELDS = `
  SUM(request_count) as request_count,
  COALESCE(SUM(tokens_input), 0) as tokens_input,
  COALESCE(SUM(tokens_output), 0) as tokens_output,
  COALESCE(SUM(tokens_cache_read), 0) as tokens_cache_read,
  COALESCE(SUM(tokens_cache_creation), 0) as tokens_cache_creation,
  COALESCE(SUM(tokens_reasoning), 0) as tokens_reasoning,
  COALESCE(SUM(cost_tokens_input), 0) as cost_tokens_input,
  COALESCE(SUM(cost_tokens_output), 0) as cost_tokens_output,
  COALESCE(SUM(cost_tokens_cache_read), 0) as cost_tokens_cache_read,
  COALESCE(SUM(cost_tokens_cache_creation), 0) as cost_tokens_cache_creation,
  COALESCE(SUM(cost_tokens_reasoning), 0) as cost_tokens_reasoning,
  COALESCE(SUM(stored_cost), 0.0) as stored_cost,
  MAX(timestamp) as last_used
`;
async function calculateAggregateCost(row) {
    const provider = toStringOrEmpty(row.provider) || "unknown";
    const model = toStringOrEmpty(row.model) || "unknown";
    const serviceTier = toStringOrEmpty(row.service_tier) || "standard";
    const storedCost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.stored_cost);
    const calculatedCost = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateCost"])(provider, model, {
        input: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_input ?? row.tokens_input),
        output: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_output ?? row.tokens_output),
        cacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_cache_read ?? row.tokens_cache_read),
        cacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_cache_creation ?? row.tokens_cache_creation),
        reasoning: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.cost_tokens_reasoning ?? row.tokens_reasoning)
    }, {
        provider,
        serviceTier,
        flatRateAsZero: true
    });
    return storedCost + calculatedCost;
}
function addUsage(bucket, requests, promptTokens, completionTokens, cost) {
    bucket.requests += requests;
    bucket.promptTokens += promptTokens;
    bucket.completionTokens += completionTokens;
    bucket.cost += cost;
}
function getApiKeyStatsKey(apiKeyId, apiKeyName) {
    return apiKeyId ? `id:${apiKeyId}` : `name:${apiKeyName || "unknown"}`;
}
function getMonthlyProviderTokensForConnection(provider, connectionId) {
    if (!provider || !connectionId) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const now = new Date();
    const monthStartIso = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const row = db.prepare(`SELECT COALESCE(SUM(tokens_input), 0)
            + COALESCE(SUM(tokens_output), 0)
            + COALESCE(SUM(tokens_cache_read), 0)
            + COALESCE(SUM(tokens_cache_creation), 0)
            + COALESCE(SUM(tokens_reasoning), 0) AS total
       FROM usage_history
       WHERE provider = ? AND connection_id = ? AND timestamp >= ?`).get(provider, connectionId, monthStartIso);
    return Math.max(0, Number(row?.total ?? 0));
}
async function getConnectionSpendUsdSinceAdded(provider, connectionId) {
    if (!provider || !connectionId) return {
        costUsd: 0,
        requests: 0
    };
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare(`SELECT model,
          COALESCE(SUM(tokens_input), 0) AS input,
          COALESCE(SUM(tokens_output), 0) AS output,
          COALESCE(SUM(tokens_cache_read), 0) AS cacheRead,
          COALESCE(SUM(tokens_cache_creation), 0) AS cacheCreation,
          COALESCE(SUM(tokens_reasoning), 0) AS reasoning,
          COUNT(*) AS requests
       FROM usage_history
       WHERE connection_id = ? AND provider = ? AND success = 1
       GROUP BY model`).all(connectionId, provider);
    let costUsd = 0;
    let requests = 0;
    for (const row of rows){
        requests += Math.max(0, Number(row.requests ?? 0));
        const model = typeof row.model === "string" ? row.model : "";
        const tokens = {
            input: Number(row.input ?? 0),
            output: Number(row.output ?? 0),
            cacheRead: Number(row.cacheRead ?? 0),
            cacheCreation: Number(row.cacheCreation ?? 0),
            reasoning: Number(row.reasoning ?? 0)
        };
        costUsd += await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$costCalculator$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["calculateCost"])(provider, model, tokens, {
            provider,
            model,
            flatRateAsZero: true
        });
    }
    return {
        costUsd: Math.max(0, costUsd),
        requests
    };
}
async function getUsageStats() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const aggregationEnabled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$aggregateHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAggregationEnabled"])();
    const cutoffDate = aggregationEnabled ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$aggregateHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRawDataCutoffDate"])() : null;
    const sourceSql = buildUsageSourceSql(aggregationEnabled);
    const sourceParams = aggregationEnabled && cutoffDate ? [
        cutoffDate,
        cutoffDate
    ] : [];
    const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
    let allConnections = [];
    try {
        const loadedConnections = await getProviderConnections();
        allConnections = Array.isArray(loadedConnections) ? loadedConnections : [];
    } catch  {}
    const connectionMap = {};
    for (const connRaw of allConnections){
        const conn = asRecord(connRaw);
        const connectionId = toStringOrEmpty(conn.id);
        if (!connectionId) continue;
        connectionMap[connectionId] = toStringOrEmpty(conn.name) || toStringOrEmpty(conn.email) || connectionId;
    }
    const currentApiKeyNames = new Map();
    try {
        const apiKeys = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$apiKeys$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApiKeys"])();
        for (const apiKey of apiKeys){
            if (typeof apiKey.id === "string" && typeof apiKey.name === "string") {
                currentApiKeyNames.set(apiKey.id, apiKey.name);
            }
        }
    } catch  {
    // Stats can still be computed from usage_history when api_keys is unavailable.
    }
    const pendingRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageHistory$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getPendingRequests"])();
    const stats = {
        totalRequests: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalCost: 0,
        byProvider: {},
        byModel: {},
        byAccount: {},
        byApiKey: {},
        last10Minutes: [],
        pending: pendingRequests,
        activeRequests: []
    };
    // Build active requests
    for (const [connectionId, models] of Object.entries(pendingRequests.byAccount)){
        for (const [modelKey, count] of Object.entries(models)){
            if (count > 0) {
                const accountName = connectionMap[connectionId] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAccountDisplayName"])({
                    id: connectionId
                });
                const match = modelKey.match(/^(.*) \((.*)\)$/);
                stats.activeRequests.push({
                    model: match ? match[1] : modelKey,
                    provider: match ? match[2] : "unknown",
                    account: accountName,
                    count
                });
            }
        }
    }
    // 10-minute buckets
    const now = new Date();
    const currentMinuteStart = new Date(Math.floor(now.getTime() / 60000) * 60000);
    const bucketMap = {};
    for(let i = 0; i < 10; i++){
        const bucketTime = new Date(currentMinuteStart.getTime() - (9 - i) * 60 * 1000);
        const bucketKey = bucketTime.getTime();
        bucketMap[bucketKey] = {
            requests: 0,
            promptTokens: 0,
            completionTokens: 0,
            cost: 0
        };
        stats.last10Minutes.push(bucketMap[bucketKey]);
    }
    const tenMinutesAgo = new Date(currentMinuteStart.getTime() - 9 * 60 * 1000);
    const modelRows = db.prepare(`
        WITH usage_source AS (${sourceSql})
        SELECT provider, model, service_tier, ${AGGREGATE_FIELDS}
        FROM usage_source
        GROUP BY provider, model, service_tier
      `).all(...sourceParams);
    for (const rowRaw of modelRows){
        const row = asRecord(rowRaw);
        const provider = toStringOrEmpty(row.provider) || "unknown";
        const model = toStringOrEmpty(row.model) || "unknown";
        const timestamp = toStringOrEmpty(row.last_used) || new Date(0).toISOString();
        const requestCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.request_count);
        const promptTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_input);
        const completionTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output);
        const entryCost = await calculateAggregateCost(row);
        stats.totalRequests += requestCount;
        stats.totalPromptTokens += promptTokens;
        stats.totalCompletionTokens += completionTokens;
        stats.totalCost += entryCost;
        // By Provider
        if (!stats.byProvider[provider]) {
            stats.byProvider[provider] = {
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                cost: 0
            };
        }
        addUsage(stats.byProvider[provider], requestCount, promptTokens, completionTokens, entryCost);
        // By Model
        const modelKey = ("TURBOPACK compile-time truthy", 1) ? `${model} (${provider})` : "TURBOPACK unreachable";
        if (!stats.byModel[modelKey]) {
            stats.byModel[modelKey] = {
                requests: 0,
                promptTokens: 0,
                completionTokens: 0,
                cost: 0,
                rawModel: model,
                provider,
                lastUsed: timestamp
            };
        }
        addUsage(stats.byModel[modelKey], requestCount, promptTokens, completionTokens, entryCost);
        if (new Date(timestamp) > new Date(stats.byModel[modelKey].lastUsed || timestamp)) {
            stats.byModel[modelKey].lastUsed = timestamp;
        }
    }
    const accountRows = db.prepare(`
        WITH usage_source AS (${sourceSql})
        SELECT provider, model, connection_id, service_tier, ${AGGREGATE_FIELDS}
        FROM usage_source
        WHERE connection_id IS NOT NULL AND connection_id != ''
        GROUP BY provider, model, connection_id, service_tier
      `).all(...sourceParams);
    for (const rowRaw of accountRows){
        const row = asRecord(rowRaw);
        const provider = toStringOrEmpty(row.provider) || "unknown";
        const model = toStringOrEmpty(row.model) || "unknown";
        const timestamp = toStringOrEmpty(row.last_used) || new Date(0).toISOString();
        const connectionId = toStringOrEmpty(row.connection_id);
        const requestCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.request_count);
        const promptTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_input);
        const completionTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output);
        const entryCost = await calculateAggregateCost(row);
        if (connectionId) {
            const accountName = connectionMap[connectionId] || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$display$2f$names$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAccountDisplayName"])({
                id: connectionId
            });
            const accountKey = `${model} (${provider} - ${accountName})`;
            if (!stats.byAccount[accountKey]) {
                stats.byAccount[accountKey] = {
                    requests: 0,
                    promptTokens: 0,
                    completionTokens: 0,
                    cost: 0,
                    rawModel: model,
                    provider,
                    connectionId,
                    accountName,
                    lastUsed: timestamp
                };
            }
            addUsage(stats.byAccount[accountKey], requestCount, promptTokens, completionTokens, entryCost);
            if (new Date(timestamp) > new Date(stats.byAccount[accountKey].lastUsed || timestamp)) {
                stats.byAccount[accountKey].lastUsed = timestamp;
            }
        }
    }
    const apiKeyRows = db.prepare(`
        WITH usage_source AS (${sourceSql})
        SELECT provider, model, api_key_id, api_key_name, service_tier, ${AGGREGATE_FIELDS}
        FROM usage_source
        WHERE (api_key_id IS NOT NULL AND api_key_id != '')
           OR (api_key_name IS NOT NULL AND api_key_name != '')
        GROUP BY provider, model, api_key_id, api_key_name, service_tier
      `).all(...sourceParams);
    for (const rowRaw of apiKeyRows){
        const row = asRecord(rowRaw);
        const timestamp = toStringOrEmpty(row.last_used) || new Date(0).toISOString();
        const apiKeyId = toStringOrEmpty(row.api_key_id) || null;
        const apiKeyName = toStringOrEmpty(row.api_key_name) || null;
        const requestCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.request_count);
        const promptTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_input);
        const completionTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output);
        const entryCost = await calculateAggregateCost(row);
        if (apiKeyId || apiKeyName) {
            const key = getApiKeyStatsKey(apiKeyId, apiKeyName);
            const displayName = (apiKeyId ? currentApiKeyNames.get(apiKeyId) : undefined) || apiKeyName || apiKeyId || "unknown";
            if (!stats.byApiKey[key]) {
                stats.byApiKey[key] = {
                    requests: 0,
                    promptTokens: 0,
                    completionTokens: 0,
                    cost: 0,
                    apiKeyId,
                    apiKeyName: displayName,
                    historicalApiKeyNames: [],
                    lastUsed: timestamp
                };
            }
            const apiKeyStats = stats.byApiKey[key];
            if (apiKeyName && !apiKeyStats.historicalApiKeyNames?.includes(apiKeyName)) {
                apiKeyStats.historicalApiKeyNames?.push(apiKeyName);
            }
            apiKeyStats.apiKeyName = displayName;
            addUsage(apiKeyStats, requestCount, promptTokens, completionTokens, entryCost);
            if (new Date(timestamp) > new Date(apiKeyStats.lastUsed || timestamp)) {
                apiKeyStats.lastUsed = timestamp;
            }
        }
    }
    const recentRows = db.prepare(`
        SELECT
          strftime('%Y-%m-%dT%H:%M:00.000Z', timestamp) as minute,
          provider,
          model,
          COALESCE(service_tier, 'standard') as service_tier,
          COUNT(*) as request_count,
          COALESCE(SUM(tokens_input), 0) as tokens_input,
          COALESCE(SUM(tokens_output), 0) as tokens_output,
          COALESCE(SUM(tokens_cache_read), 0) as tokens_cache_read,
          COALESCE(SUM(tokens_cache_creation), 0) as tokens_cache_creation,
          COALESCE(SUM(tokens_reasoning), 0) as tokens_reasoning
        FROM usage_history
        WHERE timestamp >= ? AND timestamp <= ?
        GROUP BY minute, provider, model, service_tier
      `).all(tenMinutesAgo.toISOString(), now.toISOString());
    for (const rowRaw of recentRows){
        const row = asRecord(rowRaw);
        const minute = toStringOrEmpty(row.minute);
        const bucketKey = new Date(minute).getTime();
        if (!bucketMap[bucketKey]) continue;
        const requestCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.request_count);
        const promptTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_input);
        const completionTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_output);
        const entryCost = await calculateAggregateCost(row);
        addUsage(bucketMap[bucketKey], requestCount, promptTokens, completionTokens, entryCost);
    }
    return stats;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/callLogsBoundedQueries.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collectReferencedArtifacts",
    ()=>collectReferencedArtifacts,
    "selectCallLogIdsBefore",
    ()=>selectCallLogIdsBefore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
;
// #5618 — node:sqlite's StatementSync.all() materializes the ENTIRE result set as
// JS objects at once. On a large storage.sqlite (~170 MB+) an unbounded
// `SELECT … FROM call_logs` over the whole table blows the V8 heap during the
// startup cleanup pass (`cleanupExpiredLogs` → `rotateCallLogs`), crashing the
// daemon before it binds. These helpers page through call_logs in bounded chunks
// so peak memory stays flat regardless of table size.
const CALL_LOG_QUERY_PAGE = 5000;
function collectReferencedArtifacts() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const referenced = new Set();
    const stmt = db.prepare("SELECT artifact_relpath FROM call_logs WHERE artifact_relpath IS NOT NULL LIMIT ? OFFSET ?");
    for(let offset = 0;; offset += CALL_LOG_QUERY_PAGE){
        const rows = stmt.all(CALL_LOG_QUERY_PAGE, offset);
        for (const row of rows){
            if (typeof row.artifact_relpath === "string") referenced.add(row.artifact_relpath);
        }
        if (rows.length < CALL_LOG_QUERY_PAGE) break;
    }
    return referenced;
}
function selectCallLogIdsBefore(cutoff, limit = CALL_LOG_QUERY_PAGE) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT id FROM call_logs WHERE timestamp < ? ORDER BY timestamp ASC LIMIT ?").all(cutoff, limit);
    return rows.map((row)=>String(row.id));
}
}),
"[project]/src/lib/usage/callLogApiKeyContext.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCallLogApiKeyContext",
    ()=>getCallLogApiKeyContext,
    "runWithCallLogApiKeyContext",
    ()=>runWithCallLogApiKeyContext
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:async_hooks [external] (node:async_hooks, cjs)");
;
const callLogApiKeyContext = new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$async_hooks__$5b$external$5d$__$28$node$3a$async_hooks$2c$__cjs$29$__["AsyncLocalStorage"]();
function runWithCallLogApiKeyContext(context, callback) {
    return callLogApiKeyContext.run(context, callback);
}
function getCallLogApiKeyContext() {
    return callLogApiKeyContext.getStore() ?? null;
}
}),
"[project]/src/lib/usage/callLogs/format.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "asRecord",
    ()=>asRecord,
    "buildRequestSummary",
    ()=>buildRequestSummary,
    "normalizeDetailState",
    ()=>normalizeDetailState,
    "parseInlineError",
    ()=>parseInlineError,
    "protectPipelinePayloads",
    ()=>protectPipelinePayloads,
    "sanitizeErrorForLog",
    ()=>sanitizeErrorForLog,
    "toStoredErrorSummary",
    ()=>toStoredErrorSummary,
    "toStringOrNull",
    ()=>toStringOrNull,
    "truncateText",
    ()=>truncateText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/piiSanitizer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toStringOrNull(value) {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
}
function truncateText(value, maxLength) {
    return value.length > maxLength ? value.slice(0, maxLength) : value;
}
function parseInlineError(value) {
    if (typeof value !== "string" || value.trim().length === 0) return null;
    try {
        return JSON.parse(value);
    } catch  {
        return value;
    }
}
function normalizeDetailState(value) {
    if (value === "ready" || value === "missing" || value === "corrupt" || value === "legacy-inline") {
        return value;
    }
    return "none";
}
function sanitizeErrorForLog(error) {
    if (error === null || error === undefined) return null;
    if (typeof error === "string") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(error).text;
    if (error instanceof Error) {
        return {
            message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(error.message).text,
            stack: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(error.stack || "").text || undefined,
            name: error.name
        };
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(error);
}
function toStoredErrorSummary(error) {
    const sanitized = sanitizeErrorForLog(error);
    if (sanitized === null || sanitized === undefined) return null;
    if (typeof sanitized === "string") {
        return truncateText(sanitized, 4000);
    }
    try {
        return truncateText(JSON.stringify(sanitized), 4000);
    } catch  {
        return truncateText(String(sanitized), 4000);
    }
}
function protectPipelinePayloads(payloads) {
    if (!payloads || typeof payloads !== "object") return null;
    const protectedPayloads = {};
    for (const [key, value] of Object.entries(payloads)){
        if (value === null || value === undefined) continue;
        if (key === "streamChunks" && value && typeof value === "object") {
            const chunks = value;
            const compacted = Object.fromEntries(Object.entries(chunks).filter(([, chunkValue])=>Array.isArray(chunkValue) && chunkValue.length > 0));
            if (Object.keys(compacted).length > 0) {
                protectedPayloads.streamChunks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(compacted);
            }
            continue;
        }
        protectedPayloads[key] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(value);
    }
    return Object.keys(protectedPayloads).length > 0 ? protectedPayloads : null;
}
function buildRequestSummary(requestType, requestBody) {
    if (requestType !== "search") return null;
    const body = asRecord(requestBody);
    if (Object.keys(body).length === 0) return null;
    const summary = {};
    if (typeof body.query === "string" && body.query.trim().length > 0) {
        summary.query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$piiSanitizer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizePII"])(body.query).text;
    }
    const filters = Object.fromEntries(Object.entries(body).filter(([key])=>key !== "query" && key !== "provider"));
    if (Object.keys(filters).length > 0) {
        summary.filters = filters;
    }
    if (Object.keys(summary).length === 0) return null;
    return JSON.stringify(summary);
}
}),
"[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "cleanupOrphanCallLogFiles",
    ()=>cleanupOrphanCallLogFiles,
    "cleanupOverflowCallLogFiles",
    ()=>cleanupOverflowCallLogFiles,
    "deleteCallLogsBefore",
    ()=>deleteCallLogsBefore,
    "exportCallLogsSince",
    ()=>exportCallLogsSince,
    "getCallLogById",
    ()=>getCallLogById,
    "getCallLogs",
    ()=>getCallLogs,
    "rotateCallLogs",
    ()=>rotateCallLogs,
    "saveCallLog",
    ()=>saveCallLog,
    "scheduleCallLogRotation",
    ()=>scheduleCallLogRotation,
    "trimCallLogsToMaxRows",
    ()=>trimCallLogsToMaxRows
]);
/**
 * Structured call log management.
 *
 * SQLite stores only summary metadata. Detailed request/response payloads live in
 * filesystem artifacts and are loaded only for explicit detail/export flows.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogsBoundedQueries.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/detailedLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/migrations.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogApiKeyContext$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogApiKeyContext.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/compliance/noLog.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logPayloads.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/logEnv.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/maskEmail.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogArtifacts.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs/format.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const CALL_LOG_ROTATE_THROTTLE_MS = 60_000;
let lastCallLogRotationScheduledAt = 0;
let callLogRotateInFlight = false;
let callLogRotateScheduled = false;
const RESOLVED_ACCOUNT_SQL = "COALESCE(NULLIF(pc.name, ''), NULLIF(pc.email, ''), cl.account)";
let logIdCounter = 0;
function generateLogId() {
    logIdCounter++;
    return `${Date.now()}-${logIdCounter}`;
}
async function resolveAccountName(connectionId) {
    let account = connectionId ? connectionId.slice(0, 8) : "-";
    if (!connectionId) {
        return account;
    }
    try {
        const { getProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        const connections = await getProviderConnections();
        const conn = connections.find((item)=>item.id === connectionId);
        if (conn) {
            account = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$maskEmail$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pickDisplayValue"])([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(conn.name),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(conn.email)
            ], true, account);
        }
    } catch  {
    // Best-effort lookup only.
    }
    return account;
}
async function resolveProviderPrefix(providerId) {
    if (!providerId) return null;
    try {
        const { getProviderNodeById } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [instrumentation] (ecmascript, async loader)");
        const node = await getProviderNodeById(providerId);
        if (node && typeof node.prefix === "string" && node.prefix.trim().length > 0) {
            return node.prefix.trim();
        }
    } catch  {
    // Best-effort lookup only.
    }
    return null;
}
function isCompatibleProviderId(providerId) {
    if (!providerId) return false;
    return providerId.startsWith("openai-compatible-") || providerId.startsWith("anthropic-compatible-");
}
function applyNodePrefix(requestedModel, provider, nodePrefix) {
    if (!requestedModel || !provider || !nodePrefix) return requestedModel;
    if (requestedModel.startsWith(provider + "/")) {
        return nodePrefix + "/" + requestedModel.slice(provider.length + 1);
    }
    return requestedModel;
}
function buildArtifact(logEntry, requestBody, responseBody, error, pipelinePayloads) {
    return {
        schemaVersion: 5,
        summary: {
            id: logEntry.id,
            timestamp: logEntry.timestamp,
            method: logEntry.method,
            path: logEntry.path,
            status: logEntry.status,
            model: logEntry.model,
            requestedModel: logEntry.requestedModel,
            provider: logEntry.provider,
            account: logEntry.account,
            connectionId: logEntry.connectionId,
            duration: logEntry.duration,
            tokens: {
                in: logEntry.tokensIn,
                out: logEntry.tokensOut,
                cacheRead: logEntry.tokensCacheRead,
                cacheWrite: logEntry.tokensCacheCreation,
                reasoning: logEntry.tokensReasoning,
                compressed: logEntry.tokensCompressed
            },
            requestType: logEntry.requestType,
            sourceFormat: logEntry.sourceFormat,
            targetFormat: logEntry.targetFormat,
            apiKeyId: logEntry.apiKeyId,
            apiKeyName: logEntry.apiKeyName,
            comboName: logEntry.comboName,
            comboStepId: logEntry.comboStepId,
            comboExecutionKey: logEntry.comboExecutionKey
        },
        requestBody: requestBody ?? null,
        responseBody: responseBody ?? null,
        error: error ?? null,
        ...pipelinePayloads ? {
            pipeline: pipelinePayloads
        } : {}
    };
}
// #6187: extract the assistant message from a chat-completion-shaped response
// body so we can inspect its reasoning_content / <think> content.
function extractAssistantMessage(responseBody) {
    if (!responseBody || typeof responseBody !== "object") return responseBody;
    const choices = responseBody.choices;
    if (Array.isArray(choices) && choices.length > 0) {
        const first = choices[0];
        return first?.message ?? first?.delta ?? first;
    }
    return responseBody;
}
// #6187: decide the reasoning SOURCE and (char-only) count recorded alongside
// the usage-derived tokens_reasoning. Usage is authoritative when it reports
// non-zero reasoning tokens; otherwise we fall back to observed reasoning
// content so "reasoned but metered 0" stays distinguishable. reasoning_chars is
// a CHARACTER count, never a token count — it must not touch cost math.
function resolveReasoningObservation(usageReasoning, responseBody) {
    if (usageReasoning != null && usageReasoning > 0) {
        return {
            source: "usage",
            chars: null
        };
    }
    const observed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getObservedReasoning"])(extractAssistantMessage(responseBody));
    if (observed.chars > 0) {
        return {
            source: observed.source,
            chars: observed.chars
        };
    }
    return {
        source: null,
        chars: null
    };
}
function hasTable(tableName) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    return Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName));
}
function readLegacyLogFromDisk(entry) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"] || !entry.timestamp) return null;
    try {
        const date = new Date(entry.timestamp);
        if (Number.isNaN(date.getTime())) return null;
        const dateFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], dateFolder);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir)) return null;
        const time = `${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
        const safeModel = (entry.model || "unknown").replace(/[/:]/g, "-");
        const expectedName = `${time}_${safeModel}_${entry.status}.json`;
        const exactPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, expectedName);
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(exactPath)) {
            return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(exactPath, "utf8"));
        }
        const files = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir).filter((file)=>file.startsWith(time) && file.endsWith(`_${entry.status}.json`));
        if (files.length > 0) {
            return JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, files[0]), "utf8"));
        }
    } catch (error) {
        console.error("[callLogs] Failed to read legacy disk log:", error.message);
    }
    return null;
}
function clearArtifactReference(relativePath, nextState) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare(`
      UPDATE call_logs
      SET detail_state = ?,
          artifact_relpath = NULL,
          artifact_size_bytes = NULL,
          artifact_sha256 = NULL
      WHERE artifact_relpath = ?
    `).run(nextState, relativePath);
}
function listReferencedArtifacts() {
    // #5618: paged to avoid an unbounded `.all()` OOM on large call_logs tables.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collectReferencedArtifacts"])();
}
// #5217: SQLite caps a statement at SQLITE_MAX_VARIABLE_NUMBER bound params
// (~999 on many builds). Callers like trimCallLogsToMaxRows() passed up to 5000
// ids in one `IN (...)` → "too many SQL variables" aborted trimming. Chunk well
// under the limit so each DELETE/SELECT stays valid.
const DELETE_ID_CHUNK_SIZE = 500;
function deleteCallLogRowsByIds(ids) {
    if (ids.length === 0) {
        return {
            deletedRows: 0,
            deletedArtifacts: 0
        };
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let deletedRows = 0;
    let deletedArtifacts = 0;
    for(let i = 0; i < ids.length; i += DELETE_ID_CHUNK_SIZE){
        const chunk = ids.slice(i, i + DELETE_ID_CHUNK_SIZE);
        const placeholders = chunk.map(()=>"?").join(", ");
        const rows = db.prepare(`SELECT artifact_relpath FROM call_logs WHERE id IN (${placeholders})`).all(...chunk);
        const result = db.prepare(`DELETE FROM call_logs WHERE id IN (${placeholders})`).run(...chunk);
        deletedRows += result.changes;
        for (const row of rows){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(row.artifact_relpath)) {
                deletedArtifacts++;
            }
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])();
    return {
        deletedRows,
        deletedArtifacts
    };
}
function cleanupOrphanCallLogFiles(baseDir = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return 0;
    try {
        const referenced = listReferencedArtifacts();
        let deleted = 0;
        for (const file of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["listCallLogArtifactFiles"])(baseDir)){
            if (referenced.has(file.relativePath)) continue;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(file.relativePath)) {
                deleted++;
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])(baseDir);
        return deleted;
    } catch (error) {
        console.error("[callLogs] Failed to prune orphan request artifacts:", error.message);
        return 0;
    }
}
function cleanupOverflowCallLogFiles(baseDir = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], maxEntries) {
    if (!baseDir || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(baseDir)) return 0;
    const limit = maxEntries ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogMaxEntries"])();
    if (!Number.isInteger(limit) || limit < 1) return 0;
    try {
        let deleted = 0;
        const files = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["listCallLogArtifactFiles"])(baseDir);
        for (const file of files.slice(limit)){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["deleteCallArtifact"])(file.relativePath)) {
                clearArtifactReference(file.relativePath, "missing");
                deleted++;
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["cleanupEmptyCallLogDirs"])(baseDir);
        return deleted;
    } catch (error) {
        console.error("[callLogs] Failed to prune overflow request artifacts:", error.message);
        return 0;
    }
}
function deleteCallLogsBefore(cutoff) {
    // #5618: page the id selection so a large backlog never loads in one `.all()`.
    let deletedRows = 0;
    let deletedArtifacts = 0;
    for(;;){
        const ids = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogsBoundedQueries$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["selectCallLogIdsBefore"])(cutoff);
        if (ids.length === 0) break;
        const result = deleteCallLogRowsByIds(ids);
        deletedRows += result.deletedRows;
        deletedArtifacts += result.deletedArtifacts;
        if (result.deletedRows === 0) break;
    }
    return {
        deletedRows,
        deletedArtifacts
    };
}
function trimCallLogsToMaxRows(maxRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogsTableMaxRows"])()) {
    if (!Number.isInteger(maxRows) || maxRows < 1) {
        return {
            deletedRows: 0,
            deletedArtifacts: 0
        };
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let deletedRows = 0;
    let deletedArtifacts = 0;
    const batchSize = 5000;
    while(true){
        const currentCount = db.prepare("SELECT COUNT(*) AS cnt FROM call_logs").get();
        if (currentCount.cnt <= maxRows) break;
        const toDelete = Math.min(currentCount.cnt - maxRows, batchSize);
        const ids = db.prepare("SELECT id FROM call_logs ORDER BY timestamp ASC LIMIT ?").all(toDelete).map((row)=>String(row.id));
        const result = deleteCallLogRowsByIds(ids);
        deletedRows += result.deletedRows;
        deletedArtifacts += result.deletedArtifacts;
        if (result.deletedRows === 0) break;
    }
    return {
        deletedRows,
        deletedArtifacts
    };
}
function resolveProviderDisplay(provider, nodeName, nodePrefix) {
    const rawProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(provider);
    if (!rawProvider) return null;
    const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(nodeName)?.trim();
    if (name) return name;
    const prefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(nodePrefix)?.trim();
    if (prefix) return prefix;
    return null;
}
function mapSummaryRow(row) {
    const detailState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeDetailState"])(row.detail_state);
    const provider = row.provider;
    const nodeName = row.provider_node_name ?? null;
    const nodePrefix = row.provider_node_prefix ?? null;
    return {
        id: row.id,
        timestamp: row.timestamp,
        method: row.method,
        path: row.path,
        status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.status),
        model: row.model,
        requestedModel: applyNodePrefix(row.requested_model, provider, nodePrefix),
        provider,
        providerDisplay: resolveProviderDisplay(provider, nodeName, nodePrefix),
        account: row.resolved_account || row.account,
        connectionId: row.connection_id,
        duration: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.duration),
        tokens: {
            in: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_in),
            out: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_out),
            cacheRead: row.tokens_cache_read != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_cache_read) : null,
            cacheWrite: row.tokens_cache_creation != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_cache_creation) : null,
            reasoning: row.tokens_reasoning != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_reasoning) : null,
            compressed: row.tokens_compressed != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.tokens_compressed) : null
        },
        cacheSource: row.cache_source || "upstream",
        requestType: row.request_type,
        sourceFormat: row.source_format,
        targetFormat: row.target_format,
        apiKeyId: row.api_key_id,
        apiKeyName: row.api_key_name,
        comboName: row.combo_name,
        comboStepId: row.combo_step_id,
        comboExecutionKey: row.combo_execution_key,
        error: row.error_summary,
        detailState,
        artifactRelPath: row.artifact_relpath,
        artifactSizeBytes: row.artifact_size_bytes,
        artifactSha256: row.artifact_sha256,
        requestSummary: row.request_summary ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.request_summary) : null,
        hasRequestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.has_request_body) === 1,
        hasResponseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.has_response_body) === 1,
        hasPipelineDetails: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.has_pipeline_details) === 1,
        correlationId: row.correlation_id || null,
        modelPinned: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(row.model_pinned) === 1,
        sessionTag: row.session_tag || null
    };
}
function buildLegacyPipelinePayloads(id) {
    const detailed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$detailedLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getRequestDetailLogByCallLogId"])(id);
    if (!detailed) return null;
    return {
        clientRequest: detailed.client_request ?? null,
        providerRequest: detailed.translated_request ?? null,
        providerResponse: detailed.provider_response ?? null,
        clientResponse: detailed.client_response ?? null
    };
}
function getLegacyInlineDetail(id) {
    if (!hasTable("call_logs_v1_legacy")) return null;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT request_body, response_body, error FROM call_logs_v1_legacy WHERE id = ?").get(id);
    if (!row) return null;
    return {
        requestBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.request_body),
        responseBody: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseStoredPayload"])(row.response_body),
        error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parseInlineError"])(row.error)
    };
}
async function saveCallLog(entry) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldPersistToDisk"]) return;
    try {
        const apiKeyContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogApiKeyContext$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogApiKeyContext"])();
        // `||` (not `??`): an empty-string apiKeyId/apiKeyName is "unattributed",
        // same as before this fallback existed — it must not be persisted verbatim
        // nor block the request-scoped context.
        const apiKeyId = entry.apiKeyId || apiKeyContext?.apiKeyId || null;
        const apiKeyName = entry.apiKeyName || apiKeyContext?.apiKeyName || null;
        const noLogEnabled = Boolean(entry.noLog) || (apiKeyId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$compliance$2f$noLog$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isNoLog"])(apiKeyId) : false);
        const protectedRequestBody = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.requestBody);
        const protectedResponseBody = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logPayloads$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["protectPayloadForLog"])(entry.responseBody);
        const protectedPipelinePayloads = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["protectPipelinePayloads"])(entry.pipelinePayloads ?? entry.pipeline ?? null);
        const protectedError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeErrorForLog"])(entry.error);
        const account = await resolveAccountName(entry.connectionId || null);
        const rawProvider = entry.provider || "-";
        const rawRequestedModel = entry.requestedModel || null;
        let resolvedRequestedModel = rawRequestedModel;
        if (rawRequestedModel && isCompatibleProviderId(rawProvider)) {
            const nodePrefix = await resolveProviderPrefix(rawProvider);
            resolvedRequestedModel = applyNodePrefix(rawRequestedModel, rawProvider, nodePrefix);
        }
        // #6187: usage-derived reasoning tokens stay UNCHANGED (cost math reads this),
        // while reasoning source/char-count are recorded separately for observability.
        const tokensReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningTokensOrNull"])(entry.tokens);
        const reasoningObservation = resolveReasoningObservation(tokensReasoning, entry.responseBody);
        const logEntry = {
            id: typeof entry.id === "string" && entry.id.length > 0 ? entry.id : generateLogId(),
            timestamp: typeof entry.timestamp === "string" ? entry.timestamp : new Date().toISOString(),
            method: entry.method || "POST",
            path: entry.path || "/v1/chat/completions",
            status: entry.status || 0,
            model: entry.model || "-",
            requestedModel: resolvedRequestedModel,
            provider: rawProvider,
            account,
            connectionId: entry.connectionId || null,
            duration: entry.duration || 0,
            tokensIn: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(entry.tokens)),
            tokensOut: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(entry.tokens)),
            tokensCacheRead: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPromptCacheReadTokensOrNull"])(entry.tokens),
            tokensCacheCreation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getPromptCacheCreationTokensOrNull"])(entry.tokens),
            tokensReasoning,
            reasoningSource: reasoningObservation.source,
            reasoningChars: reasoningObservation.chars,
            tokensCompressed: entry.tokensCompressed != null ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toNumber"])(entry.tokensCompressed) : null,
            cacheSource: entry.cacheSource === "semantic" ? "semantic" : "upstream",
            requestType: entry.requestType || null,
            sourceFormat: entry.sourceFormat || null,
            targetFormat: entry.targetFormat || null,
            apiKeyId,
            apiKeyName,
            comboName: entry.comboName || null,
            comboStepId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboStepId),
            comboExecutionKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboExecutionKey) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStringOrNull"])(entry.comboStepId),
            correlationId: entry.correlationId || null,
            modelPinned: entry.modelPinned ? 1 : 0,
            sessionTag: entry.sessionTag || null
        };
        const requestSummary = noLogEnabled ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["buildRequestSummary"])(logEntry.requestType, protectedRequestBody);
        const detailExpected = !noLogEnabled && (protectedRequestBody !== null || protectedResponseBody !== null || protectedError !== null || protectedPipelinePayloads !== null);
        let detailState = "none";
        let artifactRelPath = null;
        let artifactSizeBytes = null;
        let artifactSha256 = null;
        if (detailExpected) {
            const artifact = buildArtifact(logEntry, protectedRequestBody, protectedResponseBody, protectedError, protectedPipelinePayloads);
            const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeCallArtifact"])(artifact);
            if (artifactResult) {
                detailState = "ready";
                artifactRelPath = artifactResult.relPath;
                artifactSizeBytes = artifactResult.sizeBytes;
                artifactSha256 = artifactResult.sha256;
            } else {
                detailState = "missing";
            }
        }
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.prepare(`
      INSERT INTO call_logs (
        id, timestamp, method, path, status, model, requested_model, provider,
        account, connection_id, duration, tokens_in, tokens_out,
        tokens_cache_read, tokens_cache_creation, tokens_reasoning, tokens_compressed,
        reasoning_source, reasoning_chars,
        cache_source, request_type, source_format, target_format, api_key_id, api_key_name,
        combo_name, combo_step_id, combo_execution_key, error_summary, detail_state,
        artifact_relpath, artifact_size_bytes, artifact_sha256,
        has_request_body, has_response_body, has_pipeline_details, request_summary,
        correlation_id, model_pinned, session_tag
      )
      VALUES (
        @id, @timestamp, @method, @path, @status, @model, @requestedModel, @provider,
        @account, @connectionId, @duration, @tokensIn, @tokensOut,
        @tokensCacheRead, @tokensCacheCreation, @tokensReasoning, @tokensCompressed,
        @reasoningSource, @reasoningChars,
        @cacheSource, @requestType, @sourceFormat, @targetFormat, @apiKeyId, @apiKeyName,
        @comboName, @comboStepId, @comboExecutionKey, @errorSummary, @detailState,
        @artifactRelPath, @artifactSizeBytes, @artifactSha256,
        @hasRequestBody, @hasResponseBody, @hasPipelineDetails, @requestSummary,
        @correlationId, @modelPinned, @sessionTag
      )
    `).run({
            ...logEntry,
            errorSummary: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2f$format$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["toStoredErrorSummary"])(protectedError),
            detailState,
            artifactRelPath,
            artifactSizeBytes,
            artifactSha256,
            hasRequestBody: protectedRequestBody !== null ? 1 : 0,
            hasResponseBody: protectedResponseBody !== null ? 1 : 0,
            hasPipelineDetails: protectedPipelinePayloads ? 1 : 0,
            requestSummary
        });
        scheduleCallLogRotation();
    } catch (error) {
        console.error("[callLogs] Failed to save call log:", error.message);
    }
}
function rotateCallLogs() {
    try {
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"] || !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"])) return;
        const retentionMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogRetentionDays"])() * 24 * 60 * 60 * 1000;
        const cutoff = new Date(Date.now() - retentionMs).toISOString();
        deleteCallLogsBefore(cutoff);
        trimCallLogsToMaxRows((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogsTableMaxRows"])());
        cleanupOverflowCallLogFiles(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$logEnv$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCallLogMaxEntries"])());
        cleanupOrphanCallLogFiles(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]);
    } catch (error) {
        console.error("[callLogs] Failed to rotate request artifacts:", error.message);
    }
}
function runScheduledCallLogRotation() {
    if (callLogRotateInFlight) return;
    callLogRotateInFlight = true;
    setImmediate(()=>{
        try {
            rotateCallLogs();
        } catch (error) {
            console.error("[callLogs] Failed to rotate request artifacts:", error.message);
        } finally{
            callLogRotateInFlight = false;
        }
    });
}
function scheduleCallLogRotation() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CALL_LOGS_DIR"]) return;
    const elapsed = Date.now() - lastCallLogRotationScheduledAt;
    if (elapsed >= CALL_LOG_ROTATE_THROTTLE_MS) {
        lastCallLogRotationScheduledAt = Date.now();
        runScheduledCallLogRotation();
        return;
    }
    if (callLogRotateScheduled) return;
    callLogRotateScheduled = true;
    lastCallLogRotationScheduledAt = Date.now();
    const timer = setTimeout(()=>{
        callLogRotateScheduled = false;
        runScheduledCallLogRotation();
    }, CALL_LOG_ROTATE_THROTTLE_MS - elapsed);
    timer.unref?.();
}
if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$migrations$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["shouldPersistToDisk"] && ("TURBOPACK compile-time value", "development") !== "test") {
    scheduleCallLogRotation();
}
/**
 * Pushes a `column LIKE %value%` condition (mirrors the correlationId/sessionTag substring-match
 * precedent). Extracted so getCallLogs stays under the max-lines-per-function ratchet — #8249.
 */ function pushLikeFilter(conditions, params, column, paramKey, value) {
    if (!value) return;
    conditions.push(`cl.${column} LIKE @${paramKey}`);
    params[paramKey] = `%${value}%`;
}
async function getCallLogs(filter = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    let sql = `
    SELECT cl.*,
      pn.name AS provider_node_name, pn.prefix AS provider_node_prefix,
      ${RESOLVED_ACCOUNT_SQL} AS resolved_account
    FROM call_logs cl
    LEFT JOIN provider_nodes pn ON pn.id = cl.provider
    LEFT JOIN provider_connections pc ON pc.id = cl.connection_id
  `;
    const conditions = [];
    const params = {};
    if (filter.status) {
        if (filter.status === "error") {
            conditions.push("(cl.status >= 400 OR cl.error_summary IS NOT NULL)");
        } else if (filter.status === "ok") {
            conditions.push("cl.status >= 200 AND cl.status < 300");
        } else {
            const statusCode = Number.parseInt(filter.status, 10);
            if (!Number.isNaN(statusCode)) {
                conditions.push("cl.status = @statusCode");
                params.statusCode = statusCode;
            }
        }
    }
    if (filter.model) {
        conditions.push("(cl.model LIKE @modelQ OR cl.requested_model LIKE @modelQ)");
        params.modelQ = `%${filter.model}%`;
    }
    if (filter.provider) {
        conditions.push("cl.provider LIKE @providerQ");
        params.providerQ = `%${filter.provider}%`;
    }
    if (filter.account) {
        conditions.push(`(cl.account LIKE @accountQ OR ${RESOLVED_ACCOUNT_SQL} LIKE @accountQ)`);
        params.accountQ = `%${filter.account}%`;
    }
    if (filter.apiKey) {
        conditions.push("(cl.api_key_name LIKE @apiKeyQ OR cl.api_key_id LIKE @apiKeyQ)");
        params.apiKeyQ = `%${filter.apiKey}%`;
    }
    pushLikeFilter(conditions, params, "correlation_id", "correlationId", filter.correlationId);
    pushLikeFilter(conditions, params, "session_tag", "sessionTag", filter.sessionTag);
    if (filter.combo) {
        conditions.push("cl.combo_name IS NOT NULL");
    }
    if (filter.since) {
        conditions.push("cl.timestamp >= @since");
        params.since = filter.since instanceof Date ? filter.since.toISOString() : String(filter.since);
    }
    if (filter.until) {
        conditions.push("cl.timestamp <= @until");
        params.until = filter.until instanceof Date ? filter.until.toISOString() : String(filter.until);
    }
    if (filter.search) {
        conditions.push(`(
      cl.model LIKE @searchQ OR cl.path LIKE @searchQ OR cl.account LIKE @searchQ OR
      ${RESOLVED_ACCOUNT_SQL} LIKE @searchQ OR
      cl.requested_model LIKE @searchQ OR cl.provider LIKE @searchQ OR
      cl.api_key_name LIKE @searchQ OR cl.api_key_id LIKE @searchQ OR
      cl.combo_name LIKE @searchQ OR CAST(cl.status AS TEXT) LIKE @searchQ
      OR cl.combo_step_id LIKE @searchQ OR cl.combo_execution_key LIKE @searchQ
      OR cl.error_summary LIKE @searchQ
      OR cl.correlation_id LIKE @searchQ
    )`);
        params.searchQ = `%${filter.search}%`;
    }
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    const limit = Number.isInteger(filter.limit) && filter.limit > 0 ? filter.limit : 200;
    const offset = Number.isInteger(filter.offset) && filter.offset > 0 ? filter.offset : 0;
    sql += ` ORDER BY cl.timestamp DESC LIMIT @__limit OFFSET @__offset`;
    params.__limit = limit;
    params.__offset = offset;
    const rows = db.prepare(sql).all(params);
    return rows.map(mapSummaryRow);
}
async function getCallLogById(id) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare(`SELECT cl.*,
        pn.name AS provider_node_name,
        pn.prefix AS provider_node_prefix,
        ${RESOLVED_ACCOUNT_SQL} AS resolved_account
       FROM call_logs cl
       LEFT JOIN provider_nodes pn ON pn.id = cl.provider
       LEFT JOIN provider_connections pc ON pc.id = cl.connection_id
       WHERE cl.id = ?`).get(id);
    if (!row) return null;
    const entry = mapSummaryRow(row);
    let detailState = entry.detailState;
    let artifactRelPath = entry.artifactRelPath;
    if (artifactRelPath) {
        const artifactResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogArtifacts$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["readCallArtifact"])(artifactRelPath);
        if (artifactResult.state === "ready" && artifactResult.artifact) {
            return {
                ...entry,
                detailState: "ready",
                requestBody: artifactResult.artifact.requestBody ?? null,
                responseBody: artifactResult.artifact.responseBody ?? null,
                error: artifactResult.artifact.error ?? entry.error,
                pipelinePayloads: artifactResult.artifact.pipeline ?? buildLegacyPipelinePayloads(id),
                hasPipelineDetails: Boolean(artifactResult.artifact.pipeline) || entry.hasPipelineDetails,
                active: false
            };
        }
        detailState = artifactResult.state;
        if (artifactResult.state === "missing") {
            clearArtifactReference(artifactRelPath, "missing");
            artifactRelPath = null;
        } else {
            db.prepare("UPDATE call_logs SET detail_state = ? WHERE id = ?").run("corrupt", id);
        }
    }
    if (detailState === "legacy-inline") {
        const legacyInline = getLegacyInlineDetail(id);
        if (legacyInline) {
            const legacyPipeline = buildLegacyPipelinePayloads(id);
            return {
                ...entry,
                detailState,
                artifactRelPath,
                ...legacyInline,
                pipelinePayloads: legacyPipeline,
                hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
                active: false
            };
        }
    }
    const legacyDisk = readLegacyLogFromDisk(entry);
    if (legacyDisk) {
        const legacyPipeline = buildLegacyPipelinePayloads(id);
        return {
            ...entry,
            detailState,
            artifactRelPath,
            requestBody: legacyDisk.requestBody ?? null,
            responseBody: legacyDisk.responseBody ?? null,
            error: legacyDisk.error ?? entry.error,
            pipelinePayloads: legacyPipeline,
            hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
            active: false
        };
    }
    const legacyPipeline = buildLegacyPipelinePayloads(id);
    return {
        ...entry,
        detailState,
        artifactRelPath,
        requestBody: null,
        responseBody: null,
        error: entry.error,
        pipelinePayloads: legacyPipeline,
        hasPipelineDetails: Boolean(legacyPipeline) || entry.hasPipelineDetails,
        active: false
    };
}
async function exportCallLogsSince(since) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const ids = db.prepare("SELECT id FROM call_logs WHERE timestamp >= ? ORDER BY timestamp DESC").all(since).map((row)=>String(row.id));
    const logs = [];
    for (const id of ids){
        const log = await getCallLogById(id);
        if (log) logs.push(log);
    }
    return logs;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/usage/providerLimits/quotaNormalize.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isRecord",
    ()=>isRecord,
    "isUsageQuotaKeyAllowed",
    ()=>isUsageQuotaKeyAllowed,
    "normalizeUsageQuotaKey",
    ()=>normalizeUsageQuotaKey,
    "normalizeUsageQuotasForProvider",
    ()=>normalizeUsageQuotasForProvider,
    "sanitizeUsageQuotasForProvider",
    ()=>sanitizeUsageQuotasForProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/antigravityModelAliases.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$agyModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/agyModels.ts [instrumentation] (ecmascript)");
;
;
function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isUsageQuotaKeyAllowed(provider, quotaKey) {
    if (quotaKey === "credits" || quotaKey === "models") return true;
    if (provider === "antigravity") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isUserCallableAntigravityModelId"])(quotaKey);
    if (provider === "agy") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$agyModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isUserCallableAgyModelId"])(quotaKey);
    return true;
}
function normalizeUsageQuotaKey(provider, quotaKey) {
    if (quotaKey === "credits" || quotaKey === "models") return quotaKey;
    if (provider === "antigravity" || provider === "agy") {
        const clientKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$antigravityModelAliases$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toClientAntigravityModelId"])(quotaKey);
        return isUsageQuotaKeyAllowed(provider, clientKey) ? clientKey : null;
    }
    return isUsageQuotaKeyAllowed(provider, quotaKey) ? quotaKey : null;
}
function normalizeUsageQuotasForProvider(provider, quotas) {
    if (!isRecord(quotas)) return quotas ?? null;
    const normalized = {};
    let changed = false;
    for (const [quotaKey, quota] of Object.entries(quotas)){
        const normalizedKey = normalizeUsageQuotaKey(provider, quotaKey);
        if (!normalizedKey) {
            changed = true;
            continue;
        }
        const existing = normalized[normalizedKey];
        if (existing && isRecord(existing) && isRecord(quota)) {
            const existingSource = String(existing.quotaSource ?? "");
            const nextSource = String(quota.quotaSource ?? "");
            const sourceRank = {
                fetchAvailableModels: 0,
                localUsageHistory: 1,
                retrieveUserQuota: 2
            };
            if ((sourceRank[existingSource] ?? 0) > (sourceRank[nextSource] ?? 0)) {
                continue;
            }
        }
        normalized[normalizedKey] = quota;
        if (normalizedKey !== quotaKey) changed = true;
    }
    return changed ? normalized : quotas;
}
function sanitizeUsageQuotasForProvider(provider, usage) {
    if (provider !== "antigravity" && provider !== "agy") return usage;
    if (!isRecord(usage.quotas)) return usage;
    const sanitizedQuotas = normalizeUsageQuotasForProvider(provider, usage.quotas);
    return sanitizedQuotas === usage.quotas ? usage : {
        ...usage,
        quotas: sanitizedQuotas
    };
}
}),
"[project]/src/lib/usage/providerLimits/chunkedSpacingSync.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure, DB-free chunked sync helper shared by both the OAuth and non-OAuth
 * (local/API-key) paths in `syncAllProviderLimits()`.
 *
 * Processes `items` in chunks of `chunkSize`, running each chunk's fetchers
 * concurrently (`Promise.allSettled`) but waiting `spacingMs` between chunks
 * (never after the last one). `chunkSize=1` reproduces the strictly-sequential
 * OAuth behavior; `chunkSize=concurrency` reproduces the previous fast
 * chunked-concurrent behavior for local/API-key connections, now with the
 * spacing gap applied between chunks so `PROVIDER_LIMITS_SYNC_SPACING_MS` is
 * honored on both paths (see #6916).
 */ __turbopack_context__.s([
    "syncInChunksWithSpacing",
    ()=>syncInChunksWithSpacing
]);
async function syncInChunksWithSpacing(items, chunkSize, spacingMs, fetcher, onChunkResults) {
    const size = chunkSize > 0 ? chunkSize : 1;
    for(let i = 0; i < items.length; i += size){
        const chunk = items.slice(i, i + size);
        const results = await Promise.allSettled(chunk.map(fetcher));
        onChunkResults(chunk, results);
        const isLastChunk = i + size >= items.length;
        if (spacingMs > 0 && !isLastChunk) {
            await new Promise((resolve)=>setTimeout(resolve, spacingMs));
        }
    }
}
}),
"[project]/src/lib/usage/providerLimits.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "fetchAndPersistProviderLimits",
    ()=>fetchAndPersistProviderLimits,
    "fetchLiveProviderLimits",
    ()=>fetchLiveProviderLimits,
    "getCachedProviderLimitsMap",
    ()=>getCachedProviderLimitsMap,
    "getLastProviderLimitsAutoSyncTime",
    ()=>getLastProviderLimitsAutoSyncTime,
    "getProviderLimitsSyncIntervalMinutes",
    ()=>getProviderLimitsSyncIntervalMinutes,
    "getProviderLimitsSyncIntervalMs",
    ()=>getProviderLimitsSyncIntervalMs,
    "getProviderLimitsSyncSpacingMs",
    ()=>getProviderLimitsSyncSpacingMs,
    "getSanitizedCachedProviderLimitsMap",
    ()=>getSanitizedCachedProviderLimitsMap,
    "hasUsableQuota",
    ()=>hasUsableQuota,
    "isSupportedUsageConnection",
    ()=>isSupportedUsageConnection,
    "maybeClearRecoveredQuotaState",
    ()=>maybeClearRecoveredQuotaState,
    "notifyProviderUsageRecorded",
    ()=>notifyProviderUsageRecorded,
    "quotaPathShouldMarkExpired",
    ()=>quotaPathShouldMarkExpired,
    "refreshAndUpdateCredentials",
    ()=>refreshAndUpdateCredentials,
    "shouldAttemptRotatingRefresh",
    ()=>shouldAttemptRotatingRefresh,
    "syncAllProviderLimits",
    ()=>syncAllProviderLimits
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providerLimits.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cloudSync.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/quotaCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$claudeExtraUsage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/claudeExtraUsage.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$machine$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/machine.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimitsCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/providerLimitsCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/usage.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/refreshSerializer.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codeAssistSubscription.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/usageEvents.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/providerLimits/quotaNormalize.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$chunkedSpacingSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/providerLimits/chunkedSpacingSync.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const PROVIDER_LIMITS_APIKEY_PROVIDERS = new Set([
    "glm",
    "glm-cn",
    "zai",
    "glmt",
    "opencode-go",
    "ollama-cloud",
    "minimax",
    "minimax-cn",
    "crof",
    "nanogpt",
    "deepseek",
    "xiaomi-mimo",
    "vertex",
    "vertex-partner",
    "kimi-coding-apikey",
    "kiro",
    // Qoder connections are PAT-based (authType "apikey"); the usage fetcher
    // exchanges the PAT for a job token and reads openapi.qoder.sh/user/status.
    "qoder",
    "promptql",
    "pql",
    // Adobe Firefly: web-cookie / JWT stored as apikey → credits/balance
    "adobe-firefly",
    "firefly",
    // HyperAgent session cookie → billing/usage creditBlocks
    "hyperagent",
    "ha",
    "firecrawl"
]);
const DEFAULT_PROVIDER_LIMITS_SYNC_INTERVAL_MINUTES = 70;
const PROVIDER_LIMITS_AUTO_SYNC_SETTING_KEY = "provider_limits_auto_sync_last_run";
const DEFAULT_PROVIDER_LIMITS_POST_USAGE_REFRESH_DELAY_MS = 5_000;
const pendingPostUsageRefreshes = new Set();
function getProviderLimitsPostUsageRefreshDelayMs() {
    const raw = Number(process.env.PROVIDER_LIMITS_POST_USAGE_REFRESH_DELAY_MS ?? "");
    return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_PROVIDER_LIMITS_POST_USAGE_REFRESH_DELAY_MS;
}
function scheduleProviderLimitsPostUsageRefresh(connectionId) {
    if (!connectionId || pendingPostUsageRefreshes.has(connectionId)) return;
    pendingPostUsageRefreshes.add(connectionId);
    const timer = setTimeout(()=>{
        pendingPostUsageRefreshes.delete(connectionId);
        void fetchAndPersistProviderLimits(connectionId, "scheduled", {
            allowRotatingRefresh: true
        }).catch((error)=>{
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[ProviderLimits] Post-usage refresh failed for connection ${connectionId}: ${message}`);
        });
    }, getProviderLimitsPostUsageRefreshDelayMs());
    timer.unref?.();
}
function notifyProviderUsageRecorded(provider, connectionId) {
    if (provider !== "antigravity" && provider !== "agy" || !connectionId) return;
    scheduleProviderLimitsPostUsageRefresh(connectionId);
}
// Subscribe at module load so usageHistory can emit usage events without importing
// this module (and its executors/translator import graph). This module is loaded by
// the provider-limits route and the background auto-sync scheduler at server boot.
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$usageEvents$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["onUsageRecorded"])(notifyProviderUsageRecorded);
function hasRetrieveUserQuotaSource(provider, cache) {
    if (provider !== "antigravity" && provider !== "agy") return true;
    if (!cache?.quotas) return false;
    return Object.values(cache.quotas).some((quota)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRecord"])(quota)) return false;
        return quota.quotaSource === "retrieveUserQuota";
    });
}
function sanitizeProviderLimitsCacheForConnection(connection, entry) {
    if (!connection || !entry || !entry.quotas) return entry;
    if (connection.provider !== "antigravity" && connection.provider !== "agy") return entry;
    const sanitizedQuotas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeUsageQuotasForProvider"])(connection.provider, entry.quotas);
    return sanitizedQuotas === entry.quotas ? entry : {
        ...entry,
        quotas: sanitizedQuotas
    };
}
function shouldRefreshProviderLimitsCache(connection, cache) {
    if (!cache?.quotas) return true;
    if (connection.provider !== "antigravity" && connection.provider !== "agy") return false;
    return !hasRetrieveUserQuotaSource(connection.provider, cache) || Object.keys(cache.quotas).some((quotaKey)=>!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isUsageQuotaKeyAllowed"])(connection.provider, quotaKey));
}
function isSupportedUsageConnection(connection) {
    if (!connection || !connection.provider || !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["USAGE_SUPPORTED_PROVIDERS"].includes(connection.provider)) {
        return false;
    }
    if (connection.authType === "oauth") return true;
    return (connection.authType === "apikey" || connection.authType === "api_key") && PROVIDER_LIMITS_APIKEY_PROVIDERS.has(connection.provider);
}
function withStatus(error, status) {
    return Object.assign(error, {
        status
    });
}
async function syncToCloudIfEnabled() {
    try {
        const machineId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$machine$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getMachineId"])();
        if (!machineId) return;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["syncToCloud"])(machineId);
    } catch (error) {
        console.error("[ProviderLimits] Error syncing refreshed credentials to cloud:", error);
    }
}
function shouldAttemptRotatingRefresh(provider, allowRotatingRefresh) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rotationGroupFor"])(provider) === null) return true;
    return allowRotatingRefresh === true;
}
async function refreshAndUpdateCredentials(connection, opts = {}) {
    if (!shouldAttemptRotatingRefresh(connection.provider, opts.allowRotatingRefresh)) {
        return {
            connection,
            refreshed: false
        };
    }
    const executor = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])(connection.provider);
    const credentials = {
        connectionId: connection.id,
        accessToken: connection.accessToken,
        refreshToken: connection.refreshToken,
        expiresAt: connection.tokenExpiresAt || connection.expiresAt || null,
        providerSpecificData: connection.providerSpecificData,
        copilotToken: connection.providerSpecificData?.copilotToken,
        copilotTokenExpiresAt: connection.providerSpecificData?.copilotTokenExpiresAt
    };
    // `force` is used ONLY on the reactive 401 recovery path (a usage fetch came
    // back unauthorized) — it bypasses the proactive `needsRefresh` heuristic so
    // imported accounts (expiresAt=null, where needsRefresh is always false) can
    // still re-mint. The mint stays serialized per rotation group; this never
    // refreshes proactively from the bulk path (#3019 guard above is unchanged).
    if (!opts.force && !executor.needsRefresh(credentials)) {
        return {
            connection,
            refreshed: false
        };
    }
    // Serialize the actual token mint per rotation group so two sibling accounts
    // never hit Auth0 concurrently (passthrough for non-rotating providers).
    const refreshResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["serializeRefresh"])(connection.provider, ()=>executor.refreshCredentials(credentials, console));
    if (!refreshResult) {
        // Refresh failed but we still have an accessToken — fall back to the
        // existing token for ANY OAuth provider (graceful degradation) instead of
        // hard-failing. Previously this was qualified to `provider === "github"`,
        // which left every other provider stuck on a transient refresh failure even
        // when a usable access token was still on hand.
        if (connection.accessToken) {
            return {
                connection,
                refreshed: false
            };
        }
        throw withStatus(new Error("Failed to refresh credentials. Please re-authorize the connection."), 401);
    }
    const updateData = {
        updatedAt: new Date().toISOString()
    };
    if (refreshResult.accessToken) {
        updateData.accessToken = refreshResult.accessToken;
    }
    if (refreshResult.refreshToken) {
        updateData.refreshToken = refreshResult.refreshToken;
    }
    if (refreshResult.expiresIn) {
        const expiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000).toISOString();
        updateData.expiresAt = expiresAt;
        updateData.tokenExpiresAt = expiresAt;
    } else if (refreshResult.expiresAt) {
        updateData.expiresAt = refreshResult.expiresAt;
        updateData.tokenExpiresAt = refreshResult.expiresAt;
    }
    if (refreshResult.copilotToken || refreshResult.copilotTokenExpiresAt) {
        updateData.providerSpecificData = {
            ...connection.providerSpecificData || {},
            copilotToken: refreshResult.copilotToken,
            copilotTokenExpiresAt: refreshResult.copilotTokenExpiresAt
        };
    }
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, updateData);
    return {
        connection: {
            ...connection,
            ...updateData,
            providerSpecificData: updateData.providerSpecificData || connection.providerSpecificData
        },
        refreshed: true
    };
}
function isUsageAuthError(message) {
    if (typeof message !== "string") return false;
    const m = message.toLowerCase();
    return m.includes("token expired") || m.includes("unauthorized") || m.includes("re-authenticate") || m.includes("access denied") || m.includes("invalidated") || m.includes("401");
}
function isNetworkFailureMessage(message) {
    if (typeof message !== "string") return false;
    return message.includes("fetch failed") || message.includes("ECONNREFUSED") || message.includes("ETIMEDOUT") || message.includes("Proxy unreachable") || message.includes("UND_ERR_CONNECT_TIMEOUT");
}
function isAccountScopedProxyResolution(proxyInfo) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRecord"])(proxyInfo)) return false;
    if (!proxyInfo.proxy) return false;
    return proxyInfo.level === "key" || proxyInfo.level === "account";
}
function shouldFailClosedForProviderLimitsProxy(connection, proxyInfo) {
    return connection.authType === "oauth" && isAccountScopedProxyResolution(proxyInfo);
}
function quotaPathShouldMarkExpired(provider, usageMessage, currentTestStatus) {
    if (currentTestStatus === "expired") return false;
    const message = typeof usageMessage === "string" ? usageMessage.toLowerCase() : "";
    const isAuthError = message.includes("token expired") || message.includes("access denied") || message.includes("re-authenticate") || message.includes("unauthorized");
    if (!isAuthError) return false;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$refreshSerializer$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["rotationGroupFor"])(provider) !== null) return false;
    return true;
}
const TERMINAL_STATUSES_FOR_QUOTA_RECOVERY = new Set([
    "credits_exhausted",
    "banned",
    "expired",
    "deactivated"
]);
function isTerminalStatusForQuotaRecovery(testStatus) {
    if (!testStatus) return false;
    return TERMINAL_STATUSES_FOR_QUOTA_RECOVERY.has(testStatus);
}
function hasUsableQuota(usage) {
    const quotas = usage?.quotas;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRecord"])(quotas)) return false;
    for (const value of Object.values(quotas)){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRecord"])(value)) continue;
        if (value.unlimited === true) return true;
        const remaining = typeof value.remaining === "number" ? value.remaining : typeof value.remainingPercentage === "number" ? value.remainingPercentage : null;
        if (remaining !== null && remaining > 0) return true;
    }
    return false;
}
async function maybeClearRecoveredQuotaState(connection, usage) {
    if (!hasUsableQuota(usage)) return connection;
    if (isTerminalStatusForQuotaRecovery(connection.testStatus)) return connection;
    if (connection.lastErrorType === "quota_exhausted" && connection.rateLimitedUntil && new Date(connection.rateLimitedUntil).getTime() > Date.now()) {
        return connection;
    }
    const hasTransientState = connection.testStatus === "unavailable" || Boolean(connection.rateLimitedUntil) || Boolean(connection.lastError) || Boolean(connection.errorCode) || Boolean(connection.lastErrorType) || Boolean(connection.lastErrorSource) || (connection.backoffLevel ?? 0) > 0;
    if (!hasTransientState) return connection;
    let cleared = true;
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearRecoveredProviderState"])({
            connectionId: connection.id,
            testStatus: connection.testStatus,
            lastError: connection.lastError ?? null,
            rateLimitedUntil: connection.rateLimitedUntil ?? null,
            errorCode: connection.errorCode ?? null,
            lastErrorType: connection.lastErrorType ?? null,
            lastErrorSource: connection.lastErrorSource ?? null
        }, {
            testStatus: connection.testStatus ?? null,
            lastErrorAt: connection.lastErrorAt ?? null,
            rateLimitedUntil: connection.rateLimitedUntil ?? null
        });
        cleared = result.applied;
    } catch (dbError) {
        console.warn("[ProviderLimits] Failed to clear recovered quota state:", dbError);
        return connection;
    }
    if (!cleared) {
        // CAS miss — a concurrent writer (markAccountUnavailable, etc.) updated
        // the row between our read and the clear. Return the original snapshot;
        // the next read from DB will surface the fresh state.
        return connection;
    }
    return {
        ...connection,
        testStatus: "active",
        lastError: null,
        lastErrorAt: null,
        lastErrorType: null,
        lastErrorSource: null,
        errorCode: null,
        rateLimitedUntil: null,
        backoffLevel: 0
    };
}
async function syncExpiredStatusIfNeeded(connection, usage) {
    if (!quotaPathShouldMarkExpired(connection.provider, usage.message, connection.testStatus)) {
        return connection;
    }
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, {
            testStatus: "expired",
            lastErrorType: "token_expired",
            lastErrorAt: new Date().toISOString()
        });
    } catch (dbError) {
        console.error("[ProviderLimits] Failed to sync expired status to DB:", dbError);
        return connection;
    }
    return {
        ...connection,
        testStatus: "expired",
        lastErrorType: "token_expired"
    };
}
async function syncClaudeExtraUsageStateIfNeeded(connection, usage) {
    const update = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$claudeExtraUsage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildClaudeExtraUsageConnectionUpdate"])(connection, usage);
    if (!update) return connection;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, update);
    return {
        ...connection,
        ...update
    };
}
/** Persist Antigravity tier from live loadCodeAssist on quota refresh (not only OAuth). */ async function syncAntigravitySubscriptionIfNeeded(connection, usage) {
    if (connection.provider !== "antigravity" && connection.provider !== "agy") return connection;
    const subscriptionInfo = usage.subscriptionInfo;
    if (!subscriptionInfo) return connection;
    const psd = connection.providerSpecificData || {};
    const nextPsd = {
        ...psd
    };
    let changed = false;
    const tierId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractCodeAssistOnboardTierId"])(subscriptionInfo);
    if (tierId && tierId !== "legacy-tier" && psd.tier !== tierId) {
        nextPsd.tier = tierId;
        changed = true;
    }
    const subscriptionTier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codeAssistSubscription$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractCodeAssistSubscriptionTier"])(subscriptionInfo);
    if (subscriptionTier && psd.subscriptionTier !== subscriptionTier) {
        nextPsd.subscriptionTier = subscriptionTier;
        changed = true;
    }
    const plan = typeof usage.plan === "string" ? usage.plan.trim() : "";
    if (plan && psd.plan !== plan) {
        nextPsd.plan = plan;
        changed = true;
    }
    if (!changed) return connection;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, {
        providerSpecificData: nextPsd
    });
    return {
        ...connection,
        providerSpecificData: nextPsd
    };
}
/** Persist refreshed Claude bootstrap fields into psd; writes only on diff. */ async function syncClaudeBootstrapIfNeeded(connection, usage) {
    if (connection.provider !== "claude") return connection;
    const bootstrap = usage?.bootstrap;
    if (!bootstrap || typeof bootstrap !== "object") return connection;
    const psd = connection.providerSpecificData || {};
    const mapping = [
        [
            "account_uuid",
            "accountUUID"
        ],
        [
            "organization_uuid",
            "organizationUUID"
        ],
        [
            "organization_name",
            "organizationName"
        ],
        [
            "organization_type",
            "organizationType"
        ],
        [
            "organization_rate_limit_tier",
            "organizationRateLimitTier"
        ]
    ];
    const nextPsd = {
        ...psd
    };
    let changed = false;
    for (const [bsKey, psdKey] of mapping){
        const next = bootstrap[bsKey];
        if (typeof next === "string" && next.length > 0 && psd[psdKey] !== next) {
            nextPsd[psdKey] = next;
            changed = true;
        }
    }
    if (!changed) return connection;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateProviderConnection"])(connection.id, {
        providerSpecificData: nextPsd
    });
    return {
        ...connection,
        providerSpecificData: nextPsd
    };
}
function getProviderLimitsSyncIntervalMinutes() {
    const raw = Number.parseInt(process.env.PROVIDER_LIMITS_SYNC_INTERVAL_MINUTES ?? "", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_PROVIDER_LIMITS_SYNC_INTERVAL_MINUTES;
}
function getProviderLimitsSyncIntervalMs() {
    return getProviderLimitsSyncIntervalMinutes() * 60 * 1000;
}
/** Default gap (ms) inserted between two consecutive OAuth quota fetches. */ const DEFAULT_PROVIDER_LIMITS_SYNC_SPACING_MS = 1500;
function getProviderLimitsSyncSpacingMs() {
    const rawEnv = process.env.PROVIDER_LIMITS_SYNC_SPACING_MS;
    if (rawEnv === undefined || rawEnv === "") return DEFAULT_PROVIDER_LIMITS_SYNC_SPACING_MS;
    const raw = Number(rawEnv);
    return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_PROVIDER_LIMITS_SYNC_SPACING_MS;
}
async function getLastProviderLimitsAutoSyncTime() {
    try {
        const settings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSettings"])();
        const value = settings[PROVIDER_LIMITS_AUTO_SYNC_SETTING_KEY];
        return typeof value === "string" && value.trim() ? value : null;
    } catch  {
        return null;
    }
}
async function setLastProviderLimitsAutoSyncTime(timestamp) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["updateSettings"])({
        [PROVIDER_LIMITS_AUTO_SYNC_SETTING_KEY]: timestamp
    });
}
function getCachedProviderLimitsMap() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAllProviderLimitsCache"])();
}
async function getSanitizedCachedProviderLimitsMap() {
    const caches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAllProviderLimitsCache"])();
    // Sanitization only rewrites Antigravity/agy quota keys; every other provider's cache
    // entry is returned untouched (see sanitizeProviderLimitsCacheForConnection). The
    // dashboard polls this on an auto-refresh interval, so avoid the unconditional
    // `SELECT * FROM provider_connections` + per-row credential decryption that the
    // previous implementation paid on every poll: skip the scan entirely when nothing is
    // cached, and otherwise fetch ONLY the Antigravity/agy connections. For any other
    // provider, byId.get(id) is undefined and the entry is returned verbatim — identical
    // output to scanning every active connection, but without decrypting unrelated keys.
    // (LEDGER-2 / #3821-review)
    const connectionIds = Object.keys(caches);
    if (connectionIds.length === 0) return {};
    const sanitizableConnections = [
        ...await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
            isActive: true,
            provider: "antigravity"
        }),
        ...await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
            isActive: true,
            provider: "agy"
        })
    ];
    if (sanitizableConnections.length === 0) {
        // No connection can change the cache → return the raw entries unchanged.
        return {
            ...caches
        };
    }
    const byId = new Map(sanitizableConnections.map((conn)=>[
            conn.id,
            conn
        ]));
    const sanitized = {};
    for (const [connectionId, entry] of Object.entries(caches)){
        sanitized[connectionId] = sanitizeProviderLimitsCacheForConnection(byId.get(connectionId), entry) || entry;
    }
    return sanitized;
}
async function fetchLiveProviderLimits(connectionId) {
    return fetchLiveProviderLimitsWithOptions(connectionId, {
        forceRefresh: false
    });
}
async function fetchLiveProviderLimitsWithOptions(connectionId, options = {}) {
    let connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionById"])(connectionId);
    if (!connection) {
        throw withStatus(new Error("Connection not found"), 404);
    }
    if (!isSupportedUsageConnection(connection)) {
        throw withStatus(new Error("Usage not available for this connection"), 400);
    }
    if (connection.authType !== "oauth") {
        // L3: route the API-key usage/quota fetch through the connection's proxy context,
        // mirroring the OAuth branch below (proxyInfo?.proxy ?? null). Without this, API-key
        // usage egresses on the host IP, ignoring the connection's assigned proxy.
        const apiKeyProxy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(connectionId);
        const usage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeUsageQuotasForProvider"])(connection.provider, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(apiKeyProxy?.proxy ?? null, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUsageForProvider"])(connection, options)));
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRecord"])(usage.quotas)) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setQuotaCache"])(connectionId, connection.provider, usage.quotas);
        }
        connection = await syncExpiredStatusIfNeeded(connection, usage);
        connection = await syncClaudeExtraUsageStateIfNeeded(connection, usage);
        connection = await syncClaudeBootstrapIfNeeded(connection, usage);
        connection = await syncAntigravitySubscriptionIfNeeded(connection, usage);
        connection = await maybeClearRecoveredQuotaState(connection, usage);
        return {
            connection,
            usage
        };
    }
    const proxyInfo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$settings$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveProxyForConnection"])(connectionId);
    const fetchUsageWithContext = async (proxyConfig)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["runWithProxyContext"])(proxyConfig, async ()=>{
            let conn = connection;
            let wasRefreshed = false;
            const result = await refreshAndUpdateCredentials(conn, {
                allowRotatingRefresh: options.allowRotatingRefresh
            });
            conn = result.connection;
            wasRefreshed = result.refreshed;
            if (wasRefreshed) {
                await syncToCloudIfEnabled();
            }
            let usageData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeUsageQuotasForProvider"])(conn.provider, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUsageForProvider"])(conn, options));
            // Reactive 401 recovery (on-demand/force path only): an unauthorized usage
            // response means the access token is actually dead. Force ONE serialized
            // re-mint and retry once. This recovers imported accounts (expiresAt=null,
            // where the proactive needsRefresh heuristic never fires) without ever
            // refreshing proactively from the bulk path.
            if (options.allowRotatingRefresh && !wasRefreshed && isUsageAuthError(usageData?.message)) {
                const forced = await refreshAndUpdateCredentials(conn, {
                    allowRotatingRefresh: true,
                    force: true
                });
                if (forced.refreshed) {
                    conn = forced.connection;
                    await syncToCloudIfEnabled();
                    usageData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeUsageQuotasForProvider"])(conn.provider, await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$usage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUsageForProvider"])(conn, options));
                }
            }
            connection = conn;
            return {
                usage: usageData
            };
        });
    let result;
    const proxyConfig = proxyInfo?.proxy || null;
    const failClosedOnProxyFailure = shouldFailClosedForProviderLimitsProxy(connection, proxyInfo);
    try {
        result = await fetchUsageWithContext(proxyConfig);
    } catch (error) {
        const isThrownNetworkError = error?.message === "fetch failed" || error?.code === "PROXY_UNREACHABLE" || error?.code === "UND_ERR_CONNECT_TIMEOUT" || error?.cause?.code === "ECONNREFUSED";
        if (proxyConfig && isThrownNetworkError) {
            if (failClosedOnProxyFailure) {
                console.warn("[ProviderLimits] Account-scoped %s proxy fetch failed for %s; failing closed without direct retry:", connection.provider, connectionId, error?.message);
                throw error;
            }
            console.warn("[ProviderLimits] Proxy fetch threw for %s, retrying without proxy:", connectionId, error?.message);
            result = await fetchUsageWithContext(null);
        } else {
            throw error;
        }
    }
    if (proxyConfig && isNetworkFailureMessage(result.usage?.message)) {
        if (failClosedOnProxyFailure) {
            const message = typeof result.usage.message === "string" ? result.usage.message : "Provider-limits proxy request failed";
            console.warn("[ProviderLimits] Account-scoped %s proxy usage failed for %s; failing closed without direct retry:", connection.provider, connectionId, message);
            throw withStatus(new Error(message), 503);
        }
        console.warn("[ProviderLimits] Proxy usage returned network error for %s, retrying without proxy:", connectionId, result.usage.message);
        result = await fetchUsageWithContext(null);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$quotaNormalize$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isRecord"])(result.usage.quotas)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setQuotaCache"])(connectionId, connection.provider, result.usage.quotas);
    }
    connection = await syncExpiredStatusIfNeeded(connection, result.usage);
    connection = await syncClaudeExtraUsageStateIfNeeded(connection, result.usage);
    connection = await syncClaudeBootstrapIfNeeded(connection, result.usage);
    connection = await syncAntigravitySubscriptionIfNeeded(connection, result.usage);
    connection = await maybeClearRecoveredQuotaState(connection, result.usage);
    return {
        connection,
        usage: result.usage
    };
}
async function fetchAndPersistProviderLimits(connectionId, source = "manual", opts = {}) {
    const { connection, usage } = await fetchLiveProviderLimitsWithOptions(connectionId, {
        forceRefresh: source === "manual",
        allowRotatingRefresh: opts.allowRotatingRefresh
    });
    const newCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimitsCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toProviderLimitsCacheEntry"])(usage, source);
    const previous = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderLimitsCache"])(connectionId);
    const cache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimitsCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeProviderLimitsCacheEntry"])(connection.provider, newCache, previous);
    // Don't persist error-only entries (429 etc.) — would wipe prior good cache.
    // Serve the prior entry instead; only successful fetches update the cache.
    if (cache === previous && newCache.message) {
        const staleUsage = {
            ...usage,
            quotas: previous.quotas,
            plan: previous.plan ?? usage.plan ?? null,
            bankedResetCredits: previous.bankedResetCredits,
            billing: previous.billing,
            message: null,
            _stale: true,
            _staleSince: previous.fetchedAt,
            _staleReason: newCache.message
        };
        return {
            connection,
            usage: staleUsage,
            cache: previous
        };
    }
    const mergedUsage = {
        ...usage,
        ...cache.billing ? {
            billing: cache.billing
        } : {}
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setProviderLimitsCache"])(connectionId, cache);
    return {
        connection,
        usage: mergedUsage,
        cache
    };
}
async function syncAllProviderLimits(options = {}) {
    const { source = "manual", concurrency = 5 } = options;
    const connections = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnections"])({
        isActive: true
    })).filter(isSupportedUsageConnection);
    const cacheEntries = [];
    const caches = {};
    const errors = {};
    const recordResult = (connectionId, result)=>{
        if (result.status === "fulfilled") {
            const { cache } = result.value;
            const previous = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderLimitsCache"])(connectionId);
            if (cache === previous) {
                caches[connectionId] = cache;
                return;
            }
            cacheEntries.push({
                connectionId,
                entry: cache
            });
            caches[connectionId] = cache;
            return;
        }
        const reason = result.reason;
        errors[connectionId] = reason?.message || "Failed to refresh provider limits";
    };
    const fetchOne = async (connection)=>{
        const existingCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProviderLimitsCache"])(connection.id);
        const forceRefresh = source === "manual" || shouldRefreshProviderLimitsCache(connection, existingCache || undefined);
        const { usage } = await fetchLiveProviderLimitsWithOptions(connection.id, {
            forceRefresh
        });
        const nextCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimitsCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["toProviderLimitsCacheEntry"])(usage, source);
        const cache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimitsCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeProviderLimitsCacheEntry"])(connection.provider, nextCache, existingCache);
        return {
            connectionId: connection.id,
            cache
        };
    };
    // OAuth connections are processed STRICTLY SEQUENTIALLY (chunk size 1) with a
    // spacing gap so a single host never bursts simultaneous usage/refresh
    // requests to the same upstream (anomaly/session-termination guard; see
    // getProviderLimitsSyncSpacingMs). Local/API-key connections keep their fast
    // in-chunk concurrent path, spaced BETWEEN chunks (#6916).
    const oauthConnections = connections.filter((c)=>c.authType === "oauth");
    const otherConnections = connections.filter((c)=>c.authType !== "oauth");
    const spacingMs = getProviderLimitsSyncSpacingMs();
    const recordChunk = (chunk, results)=>{
        results.forEach((result, index)=>{
            const connectionId = chunk[index]?.id;
            if (connectionId) recordResult(connectionId, result);
        });
    };
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$chunkedSpacingSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["syncInChunksWithSpacing"])(otherConnections, concurrency, spacingMs, fetchOne, recordChunk);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$providerLimits$2f$chunkedSpacingSync$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["syncInChunksWithSpacing"])(oauthConnections, 1, spacingMs, fetchOne, recordChunk);
    if (cacheEntries.length > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providerLimits$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["setProviderLimitsCacheBatch"])(cacheEntries);
    }
    if (source === "scheduled") {
        await setLastProviderLimitsAutoSyncTime(new Date().toISOString());
    }
    return {
        total: connections.length,
        succeeded: cacheEntries.length,
        failed: connections.length - cacheEntries.length,
        caches,
        errors
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_lib_usage_1s0w2qz._.js.map
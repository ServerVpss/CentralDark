module.exports = [
"[project]/open-sse/config/providers/registry/github/retiredModels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isRetiredGitHubCopilotModelId",
    ()=>isRetiredGitHubCopilotModelId
]);
const RETIRED_GITHUB_COPILOT_MODEL_IDS = new Set([
    "gemini-2.5-pro",
    "gemini-3-flash",
    "gemini-3-flash-preview"
]);
function isRetiredGitHubCopilotModelId(providerId, modelId) {
    const provider = typeof providerId === "string" ? providerId.trim().toLowerCase() : "";
    if (provider !== "github" && provider !== "gh") return false;
    if (typeof modelId !== "string") return false;
    return RETIRED_GITHUB_COPILOT_MODEL_IDS.has(modelId.trim().toLowerCase());
}
}),
"[project]/src/lib/db/models/synced.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeSyncedAvailableModels",
    ()=>normalizeSyncedAvailableModels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/github/retiredModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-route] (ecmascript)");
;
;
function normalizeSyncedAvailableModel(model) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asRecord"])(model);
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.id) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.name) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.model);
    if (!id) return null;
    const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.name) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.displayName) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.model) || id;
    const supportedEndpoints = Array.isArray(record.supportedEndpoints) ? Array.from(new Set(record.supportedEndpoints.map((endpoint)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(endpoint)).filter((endpoint)=>Boolean(endpoint)))).sort() : undefined;
    return {
        id,
        name,
        source: "imported",
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.apiFormat) ? {
            apiFormat: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.apiFormat)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.targetFormat) ? {
            targetFormat: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.targetFormat)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.upstreamProtocol) ? {
            upstreamProtocol: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.upstreamProtocol)
        } : {},
        ...supportedEndpoints && supportedEndpoints.length > 0 ? {
            supportedEndpoints
        } : {},
        ...Array.isArray(record.supportedThinkingEfforts) ? {
            supportedThinkingEfforts: record.supportedThinkingEfforts.filter((effort)=>typeof effort === "string" && effort.length > 0)
        } : {},
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.defaultThinkingEffort) ? {
            defaultThinkingEffort: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNonEmptyString"])(record.defaultThinkingEffort)
        } : {},
        ...typeof record.inputTokenLimit === "number" ? {
            inputTokenLimit: record.inputTokenLimit
        } : {},
        ...typeof record.outputTokenLimit === "number" ? {
            outputTokenLimit: record.outputTokenLimit
        } : {},
        ...typeof record.description === "string" ? {
            description: record.description
        } : {},
        ...typeof record.supportsThinking === "boolean" ? {
            supportsThinking: record.supportsThinking
        } : {},
        ...record.alwaysThinking === true ? {
            alwaysThinking: true
        } : {},
        ...typeof record.supportsTools === "boolean" ? {
            supportsTools: record.supportsTools
        } : {},
        ...typeof record.supportsVideo === "boolean" ? {
            supportsVideo: record.supportsVideo
        } : {},
        ...record.supportsVision === true ? {
            supportsVision: true
        } : {}
    };
}
function normalizeSyncedAvailableModels(models, providerId) {
    if (!Array.isArray(models)) return [];
    const deduped = new Map();
    for (const model of models){
        const normalized = normalizeSyncedAvailableModel(model);
        if (normalized && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRetiredGitHubCopilotModelId"])(providerId, normalized.id)) {
            deduped.set(normalized.id, normalized);
        }
    }
    return Array.from(deduped.values());
}
}),
"[project]/src/shared/constants/modelCompat.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Model compatibility protocol keys — shared between client UI and server.
 * Must not import Node or DB code so client components can import safely.
 */ /** Client request shapes from detectFormat — compat options apply when the client uses this protocol */ __turbopack_context__.s([
    "MODEL_COMPAT_PROTOCOL_KEYS",
    ()=>MODEL_COMPAT_PROTOCOL_KEYS
]);
const MODEL_COMPAT_PROTOCOL_KEYS = [
    "openai",
    "openai-responses",
    "claude"
];
}),
"[project]/src/lib/db/models/compat.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compatByProtocolHasEntries",
    ()=>compatByProtocolHasEntries,
    "deepMergeCompatByProtocol",
    ()=>deepMergeCompatByProtocol,
    "getModelCompatOverrides",
    ()=>getModelCompatOverrides,
    "isCompatProtocolKey",
    ()=>isCompatProtocolKey,
    "mergeModelCompatOverride",
    ()=>mergeModelCompatOverride,
    "readCompatList",
    ()=>readCompatList,
    "removeModelCompatOverride",
    ()=>removeModelCompatOverride,
    "sanitizeUpstreamHeadersMap",
    ()=>sanitizeUpstreamHeadersMap,
    "writeCompatList",
    ()=>writeCompatList
]);
/** db/models/compat.ts — model-compat overrides (normalizeToolCallId, per-protocol flags, upstream headers). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelCompat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelCompat.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/upstreamHeaders.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-route] (ecmascript)");
;
;
;
;
;
/** Built-in / alias models: tool-call + developer-role flags without a full custom row */ const MODEL_COMPAT_NAMESPACE = "modelCompatOverrides";
;
function isCompatProtocolKey(p) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelCompat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODEL_COMPAT_PROTOCOL_KEYS"].includes(p);
}
const UPSTREAM_HEADERS_MAX = 16;
const UPSTREAM_HEADER_NAME_MAX = 128;
const UPSTREAM_HEADER_VALUE_MAX = 4096;
function isValidUpstreamHeaderName(k) {
    if (!k || k.length > UPSTREAM_HEADER_NAME_MAX) return false;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$upstreamHeaders$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isForbiddenUpstreamHeaderName"])(k)) return false;
    if (/[\r\n\0]/.test(k)) return false;
    if (/\s/.test(k)) return false;
    if (k.includes(":")) return false;
    return true;
}
function sanitizeUpstreamHeadersMap(raw) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    for (const [k0, v0] of Object.entries(raw)){
        const k = String(k0).trim();
        if (!k || !isValidUpstreamHeaderName(k)) {
            continue;
        }
        const v = typeof v0 === "string" ? v0.trim().slice(0, UPSTREAM_HEADER_VALUE_MAX) : String(v0 ?? "").trim().slice(0, UPSTREAM_HEADER_VALUE_MAX);
        if (v.includes("\r") || v.includes("\n")) continue;
        out[k] = v;
        if (Object.keys(out).length >= UPSTREAM_HEADERS_MAX) break;
    }
    return out;
}
function deepMergeCompatByProtocol(prev, patch) {
    const out = {
        ...prev || {}
    };
    for (const key of Object.keys(patch)){
        if (!isCompatProtocolKey(key)) continue;
        const deltas = patch[key];
        if (!deltas || typeof deltas !== "object") continue;
        const hasDelta = Object.prototype.hasOwnProperty.call(deltas, "normalizeToolCallId") || Object.prototype.hasOwnProperty.call(deltas, "preserveOpenAIDeveloperRole") || Object.prototype.hasOwnProperty.call(deltas, "upstreamHeaders");
        if (!hasDelta) continue;
        const cur = {
            ...out[key] || {}
        };
        if ("normalizeToolCallId" in deltas) {
            cur.normalizeToolCallId = Boolean(deltas.normalizeToolCallId);
        }
        if ("preserveOpenAIDeveloperRole" in deltas) {
            cur.preserveOpenAIDeveloperRole = Boolean(deltas.preserveOpenAIDeveloperRole);
        }
        if ("upstreamHeaders" in deltas) {
            const uh = deltas.upstreamHeaders;
            if (uh === undefined) {
            /* skip */ } else {
                const s = sanitizeUpstreamHeadersMap(uh);
                if (Object.keys(s).length === 0) delete cur.upstreamHeaders;
                else cur.upstreamHeaders = s;
            }
        }
        if (Object.keys(cur).length === 0) delete out[key];
        else out[key] = cur;
    }
    return out;
}
function readCompatList(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(MODEL_COMPAT_NAMESPACE, providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch  {
        return [];
    }
}
function writeCompatList(providerId, list) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (list.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?").run(MODEL_COMPAT_NAMESPACE, providerId);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(MODEL_COMPAT_NAMESPACE, providerId, JSON.stringify(list));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
function getModelCompatOverrides(providerId) {
    return readCompatList(providerId);
}
function compatByProtocolHasEntries(map) {
    if (!map || typeof map !== "object") return false;
    return Object.keys(map).some((k)=>{
        const v = map[k];
        return v && typeof v === "object" && Object.keys(v).length > 0;
    });
}
function mergeModelCompatOverride(providerId, modelId, patch) {
    const list = readCompatList(providerId);
    const idx = list.findIndex((e)=>e.id === modelId);
    const prev = idx >= 0 ? {
        ...list[idx]
    } : {
        id: modelId
    };
    const next = {
        ...prev,
        id: modelId
    };
    if ("normalizeToolCallId" in patch) {
        if (patch.normalizeToolCallId) next.normalizeToolCallId = true;
        else delete next.normalizeToolCallId;
    }
    if ("preserveOpenAIDeveloperRole" in patch) {
        if (patch.preserveOpenAIDeveloperRole === null) {
            delete next.preserveOpenAIDeveloperRole; // unset: revert to default (undefined at read time)
        } else {
            next.preserveOpenAIDeveloperRole = Boolean(patch.preserveOpenAIDeveloperRole);
        }
    }
    if (patch.compatByProtocol && Object.keys(patch.compatByProtocol).length > 0) {
        const merged = deepMergeCompatByProtocol(next.compatByProtocol, patch.compatByProtocol);
        if (compatByProtocolHasEntries(merged)) next.compatByProtocol = merged;
        else delete next.compatByProtocol;
    }
    if ("upstreamHeaders" in patch) {
        if (patch.upstreamHeaders === null) {
            delete next.upstreamHeaders;
        } else if (patch.upstreamHeaders && typeof patch.upstreamHeaders === "object") {
            const s = sanitizeUpstreamHeadersMap(patch.upstreamHeaders);
            if (Object.keys(s).length === 0) delete next.upstreamHeaders;
            else next.upstreamHeaders = s;
        }
    }
    const filtered = list.filter((e)=>e.id !== modelId);
    const hasPreserveFlag = Object.prototype.hasOwnProperty.call(next, "preserveOpenAIDeveloperRole");
    const hasTopUpstream = next.upstreamHeaders && Object.keys(next.upstreamHeaders).length > 0;
    if ("isHidden" in patch) {
        if (patch.isHidden === null) {
            delete next.isHidden;
        } else {
            next.isHidden = Boolean(patch.isHidden);
        }
    }
    if ("isDeleted" in patch) {
        if (patch.isDeleted === null || patch.isDeleted === false) {
            delete next.isDeleted;
        } else {
            next.isDeleted = Boolean(patch.isDeleted);
        }
    }
    const hasHiddenFlag = Object.prototype.hasOwnProperty.call(next, "isHidden");
    const hasDeletedFlag = Object.prototype.hasOwnProperty.call(next, "isDeleted");
    if (next.normalizeToolCallId || hasPreserveFlag || hasHiddenFlag || hasDeletedFlag || compatByProtocolHasEntries(next.compatByProtocol) || hasTopUpstream) {
        filtered.push(next);
    }
    writeCompatList(providerId, filtered);
}
function removeModelCompatOverride(providerId, modelId) {
    const list = readCompatList(providerId);
    const filtered = list.filter((e)=>e.id !== modelId);
    if (filtered.length === list.length) return;
    writeCompatList(providerId, filtered);
}
}),
"[project]/src/lib/db/models/aliases.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteModelAlias",
    ()=>deleteModelAlias,
    "deleteModelAliasesForProvider",
    ()=>deleteModelAliasesForProvider,
    "getModelAliases",
    ()=>getModelAliases,
    "getProviderAliases",
    ()=>getProviderAliases,
    "removeProviderAlias",
    ()=>removeProviderAlias,
    "setModelAlias",
    ()=>setModelAlias,
    "setProviderAlias",
    ()=>setProviderAlias
]);
/** db/models/aliases.ts — model alias CRUD (modelAliases namespace, providerAliases namespace). */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-route] (ecmascript)");
;
;
;
async function getModelAliases() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'modelAliases'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function setModelAlias(alias, model) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('modelAliases', ?, ?)").run(alias, JSON.stringify(model));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
async function deleteModelAlias(alias) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("DELETE FROM key_value WHERE namespace = 'modelAliases' AND key = ?").run(alias);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
function getProviderAliases(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'providerAliases' AND key = ?").get(providerId);
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!parsed) return {};
    try {
        const v = JSON.parse(parsed);
        return typeof v === "object" && v !== null ? v : {};
    } catch  {
        return {};
    }
}
function setProviderAlias(providerId, alias, upstreamModelId) {
    const current = getProviderAliases(providerId);
    current[alias] = upstreamModelId;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('providerAliases', ?, ?)").run(providerId, JSON.stringify(current));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
function removeProviderAlias(providerId, alias) {
    const current = getProviderAliases(providerId);
    if (!(alias in current)) return;
    delete current[alias];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (Object.keys(current).length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'providerAliases' AND key = ?").run(providerId);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('providerAliases', ?, ?)").run(providerId, JSON.stringify(current));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
}
async function deleteModelAliasesForProvider(providerId) {
    const prefix = `${providerId}/`;
    const aliases = await getModelAliases();
    const removed = [];
    for (const [alias, value] of Object.entries(aliases)){
        if (typeof value !== "string" || !value.startsWith(prefix)) continue;
        await deleteModelAlias(alias);
        removed.push(alias);
    }
    return removed;
}
}),
"[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "addCustomModel",
    ()=>addCustomModel,
    "cleanupProviderModelsAfterConnectionDelete",
    ()=>cleanupProviderModelsAfterConnectionDelete,
    "deleteImportedCustomModels",
    ()=>deleteImportedCustomModels,
    "deleteSyncedAvailableModelsForConnection",
    ()=>deleteSyncedAvailableModelsForConnection,
    "deleteSyncedAvailableModelsForProvider",
    ()=>deleteSyncedAvailableModelsForProvider,
    "getActiveProvidersWithSyncedModel",
    ()=>getActiveProvidersWithSyncedModel,
    "getAllCustomModels",
    ()=>getAllCustomModels,
    "getAllSyncedAvailableModels",
    ()=>getAllSyncedAvailableModels,
    "getCustomModels",
    ()=>getCustomModels,
    "getHiddenModelsByProvider",
    ()=>getHiddenModelsByProvider,
    "getModelIsDeleted",
    ()=>getModelIsDeleted,
    "getModelIsHidden",
    ()=>getModelIsHidden,
    "getModelNormalizeToolCallId",
    ()=>getModelNormalizeToolCallId,
    "getModelPreserveOpenAIDeveloperRole",
    ()=>getModelPreserveOpenAIDeveloperRole,
    "getModelUpstreamExtraHeaders",
    ()=>getModelUpstreamExtraHeaders,
    "getSyncedAvailableModels",
    ()=>getSyncedAvailableModels,
    "getSyncedAvailableModelsByConnection",
    ()=>getSyncedAvailableModelsByConnection,
    "getSyncedAvailableModelsForConnection",
    ()=>getSyncedAvailableModelsForConnection,
    "pruneStaleSyncedAvailableModelsForProvider",
    ()=>pruneStaleSyncedAvailableModelsForProvider,
    "removeCustomModel",
    ()=>removeCustomModel,
    "removeSyncedAvailableModel",
    ()=>removeSyncedAvailableModel,
    "replaceCustomModels",
    ()=>replaceCustomModels,
    "replaceSyncedAvailableModelsForConnection",
    ()=>replaceSyncedAvailableModelsForConnection,
    "setModelIsHidden",
    ()=>setModelIsHidden,
    "updateCustomModel",
    ()=>updateCustomModel
]);
/**
 * db/models.ts — Custom models, synced available models, and model-flag queries.
 * Compat overrides, model aliases, and MITM aliases have moved to sub-modules under
 * models/; this file re-exports their public APIs for backward compatibility.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providers/registry/github/retiredModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/backup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/shared.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/synced.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models/compat.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$aliases$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/aliases.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$mitmAlias$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/mitmAlias.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function getCustomModels(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (providerId) {
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
        const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
        return value ? JSON.parse(value) : [];
    }
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'customModels'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function getAllCustomModels() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'customModels'").all();
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        result[key] = JSON.parse(value);
    }
    return result;
}
async function addCustomModel(providerId, modelId, modelName, source = "manual", apiFormat = "chat-completions", supportedEndpoints = [
    "chat"
], // #2905: optional per-model wire format override (e.g. "claude" for an
// opencode-go custom model). When unset, routing falls back to the provider
// default format.
targetFormat, // #1294: optional per-model token limits supplied from the "add custom model"
// form. Persisted under the same keys the /v1/models catalog reads back.
tokenLimits = {}, // #1904: optional manual vision-capability override for the "add custom model"
// form — read back by getCustomVisionCapabilityFields() in the /v1/models catalog.
supportsVision) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    const models = value ? JSON.parse(value) : [];
    const exists = models.find((m)=>m.id === modelId);
    if (exists) return exists;
    const model = {
        id: modelId,
        name: modelName || modelId,
        source,
        apiFormat,
        supportedEndpoints,
        ...targetFormat ? {
            targetFormat
        } : {},
        ...tokenLimits.inputTokenLimit != null ? {
            inputTokenLimit: tokenLimits.inputTokenLimit
        } : {},
        ...tokenLimits.outputTokenLimit != null ? {
            outputTokenLimit: tokenLimits.outputTokenLimit
        } : {},
        ...typeof supportsVision === "boolean" ? {
            supportsVision
        } : {}
    };
    models.push(model);
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('customModels', ?, ?)").run(providerId, JSON.stringify(models));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return model;
}
async function replaceCustomModels(providerId, models, { allowEmpty = false } = {}) {
    // Guard: skip destructive clear when the caller hasn't explicitly opted in.
    // This prevents callers from wiping manually added models when the
    // upstream /models endpoint fails, times out, or returns an empty list.
    if (models.length === 0 && !allowEmpty) {
        const existing = await getCustomModels(providerId);
        return Array.isArray(existing) ? existing : [];
    }
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const existing = await getCustomModels(providerId);
    const existingMap = new Map();
    if (Array.isArray(existing)) {
        for (const m of existing){
            if (m && typeof m === "object" && m.id) existingMap.set(m.id, m);
        }
    }
    // Merge: keep existing per-model compat flags if model still exists
    const merged = models.map((m)=>{
        const prev = existingMap.get(m.id);
        return {
            id: m.id,
            name: m.name || m.id,
            source: m.source || "auto-sync",
            apiFormat: m.apiFormat || prev?.apiFormat || "chat-completions",
            supportedEndpoints: m.supportedEndpoints || prev?.supportedEndpoints || [
                "chat"
            ],
            // #2905: preserve a per-model targetFormat override (new value wins, else prev).
            ...m.targetFormat ? {
                targetFormat: m.targetFormat
            } : prev?.targetFormat ? {
                targetFormat: prev.targetFormat
            } : {},
            // Preserve metadata from provider API (or previous sync)
            ...m.inputTokenLimit != null ? {
                inputTokenLimit: m.inputTokenLimit
            } : prev?.inputTokenLimit != null ? {
                inputTokenLimit: prev.inputTokenLimit
            } : {},
            ...m.outputTokenLimit != null ? {
                outputTokenLimit: m.outputTokenLimit
            } : prev?.outputTokenLimit != null ? {
                outputTokenLimit: prev.outputTokenLimit
            } : {},
            ...m.description != null ? {
                description: m.description
            } : prev?.description != null ? {
                description: prev.description
            } : {},
            ...m.supportsThinking != null ? {
                supportsThinking: m.supportsThinking
            } : prev?.supportsThinking != null ? {
                supportsThinking: prev.supportsThinking
            } : {},
            // Preserve existing compat flags
            ...prev && prev.normalizeToolCallId !== undefined ? {
                normalizeToolCallId: prev.normalizeToolCallId
            } : {},
            ...prev && prev.preserveOpenAIDeveloperRole !== undefined ? {
                preserveOpenAIDeveloperRole: prev.preserveOpenAIDeveloperRole
            } : {},
            ...prev && prev.compatByProtocol ? {
                compatByProtocol: prev.compatByProtocol
            } : {},
            ...prev && prev.upstreamHeaders ? {
                upstreamHeaders: prev.upstreamHeaders
            } : {}
        };
    });
    if (merged.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'customModels' AND key = ?").run(providerId);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('customModels', ?, ?)").run(providerId, JSON.stringify(merged));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return merged;
}
async function deleteImportedCustomModels(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const removed = [];
    const retained = parsed.filter((model)=>{
        const source = typeof model?.source === "string" ? model.source.trim().toLowerCase() : "manual";
        const imported = source === "imported" || source === "api-sync" || source === "auto-sync";
        if (imported) removed.push(model);
        return !imported;
    });
    if (removed.length === 0) return [];
    if (retained.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'customModels' AND key = ?").run(providerId);
    } else {
        db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'customModels' AND key = ?").run(JSON.stringify(retained), providerId);
    }
    const removedIds = removed.flatMap((model)=>typeof model.id === "string" && model.id ? [
            model.id
        ] : []);
    for (const modelId of removedIds)(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["removeModelCompatOverride"])(providerId, modelId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return removedIds;
}
async function removeCustomModel(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    if (!row) return false;
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return false;
    const models = JSON.parse(value);
    const before = models.length;
    const filtered = models.filter((m)=>m.id !== modelId);
    if (filtered.length === before) return false;
    if (filtered.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'customModels' AND key = ?").run(providerId);
    } else {
        db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'customModels' AND key = ?").run(JSON.stringify(filtered), providerId);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["removeModelCompatOverride"])(providerId, modelId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return true;
}
async function getSyncedAvailableModelsForConnection(providerId, connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").get(key);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return [];
    try {
        const models = JSON.parse(value);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(models, providerId);
    } catch  {
        return [];
    }
}
async function getSyncedAvailableModels(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${providerId}:%`);
    const map = new Map();
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
        for (const m of models){
            if (m.id) map.set(m.id, m);
        }
    }
    return Array.from(map.values());
}
async function getSyncedAvailableModelsByConnection(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const prefix = `${providerId}:`;
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${prefix}%`);
    const result = {};
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null || !key.startsWith(prefix)) continue;
        try {
            const connectionId = key.slice(prefix.length);
            result[connectionId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
        } catch  {
        // Ignore malformed legacy entries.
        }
    }
    return result;
}
async function getAllSyncedAvailableModels() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels'").all();
    // Group by providerId (before the colon)
    const byProvider = new Map();
    for (const row of rows){
        const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
        if (!key || value === null) continue;
        const providerId = key.split(":")[0];
        if (!byProvider.has(providerId)) byProvider.set(providerId, new Map());
        const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(JSON.parse(value), providerId);
        const map = byProvider.get(providerId);
        for (const m of models){
            if (m.id) map.set(m.id, m);
        }
    }
    const result = {};
    for (const [providerId, map] of byProvider){
        result[providerId] = Array.from(map.values());
    }
    return result;
}
async function getActiveProvidersWithSyncedModel(modelId) {
    if (!modelId) return [];
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const rows = db.prepare(`SELECT DISTINCT pc.provider AS provider
       FROM provider_connections pc
       JOIN key_value kv
         ON kv.namespace = 'syncedAvailableModels'
        AND kv.key = pc.provider || ':' || pc.id
       JOIN json_each(CASE WHEN json_valid(kv.value) THEN kv.value ELSE '[]' END) synced_model
       WHERE pc.is_active = 1
         AND COALESCE(
           json_extract(synced_model.value, '$.id'),
           json_extract(synced_model.value, '$.name'),
           json_extract(synced_model.value, '$.model')
         ) = ?`).all(modelId);
    return rows.map((row)=>row.provider).filter((provider)=>typeof provider === "string" && provider.length > 0).filter((provider)=>!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providers$2f$registry$2f$github$2f$retiredModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRetiredGitHubCopilotModelId"])(provider, modelId));
}
async function replaceSyncedAvailableModelsForConnection(providerId, connectionId, models) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    // #3199: drop ids the operator DELETED (trash) so a re-fetch does not re-import
    // a model that was explicitly removed.
    // #3782: key ONLY on the distinct `isDeleted` marker — NOT on `isHidden`.
    // Eye/visibility-hidden models (`isHidden:true`, no `isDeleted`) must stay in
    // the synced store so they remain listed-but-hidden across re-syncs instead of
    // churning back on through the managed-alias path ("Auto Sync Enabling all
    // Models"). See getModelIsDeleted for the legacy-row caveat.
    const normalizedModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(models, providerId).filter((m)=>!getModelIsDeleted(providerId, m.id));
    if (normalizedModels.length === 0) {
        db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").run(key);
    } else {
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('syncedAvailableModels', ?, ?)").run(key, JSON.stringify(normalizedModels));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    // Return the full unioned list for the provider
    return getSyncedAvailableModels(providerId);
}
async function removeSyncedAvailableModel(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const prefix = `${providerId}:`;
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ?").all(`${prefix}%`);
    let removedAny = false;
    const removeModel = db.transaction(()=>{
        for (const row of rows){
            const { key, value } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row);
            if (!key || value === null) continue;
            let parsedModels;
            try {
                parsedModels = JSON.parse(value);
            } catch (error) {
                console.warn(`[DB] Skipping malformed syncedAvailableModels entry for key ${key}:`, error);
                continue;
            }
            const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$synced$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeSyncedAvailableModels"])(parsedModels, providerId);
            const filtered = models.filter((m)=>m.id !== modelId);
            if (filtered.length !== models.length) {
                removedAny = true;
                if (filtered.length === 0) {
                    db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").run(key);
                } else {
                    db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'syncedAvailableModels' AND key = ?").run(JSON.stringify(filtered), key);
                }
            }
        }
        if (removedAny) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    });
    removeModel();
    return removedAny;
}
async function deleteSyncedAvailableModelsForConnection(providerId, connectionId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const key = `${providerId}:${connectionId}`;
    db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key = ?").run(key);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return getSyncedAvailableModels(providerId);
}
async function cleanupProviderModelsAfterConnectionDelete(providerId, connectionId) {
    const remainingSyncedModels = await deleteSyncedAvailableModelsForConnection(providerId, connectionId);
    const remainingConnections = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderConnectionsCount"])({
        provider: providerId
    });
    const removedImportedModelIds = remainingConnections === 0 ? await deleteImportedCustomModels(providerId) : [];
    return {
        remainingConnections,
        removedImportedModelIds,
        remainingSyncedModels
    };
}
async function deleteSyncedAvailableModelsForProvider(providerId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const keyPrefix = `${providerId}:`;
    const result = db.prepare("DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND substr(key, 1, ?) = ?").run(keyPrefix.length, keyPrefix);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return Number(result.changes || 0);
}
async function pruneStaleSyncedAvailableModelsForProvider(providerId, allowedConnectionIds) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    if (allowedConnectionIds.length === 0) {
        return deleteSyncedAvailableModelsForProvider(providerId);
    }
    const placeholders = allowedConnectionIds.map(()=>"?").join(",");
    const keyPrefix = `${providerId}:`;
    const allowedKeys = allowedConnectionIds.map((id)=>`${providerId}:${id}`);
    const result = db.prepare(`DELETE FROM key_value WHERE namespace = 'syncedAvailableModels' AND key LIKE ? AND key NOT IN (${placeholders})`).run(`${keyPrefix}%`, ...allowedKeys);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return Number(result.changes || 0);
}
/**
 * Apply a tri-state boolean override from `updates` onto `next`:
 * field absent → keep whatever `next` already carries; explicit `null` → clear
 * the override (callers fall back to their heuristic); anything else → persist
 * the coerced boolean.
 */ function applyTriStateBooleanOverride(next, updates, field) {
    if (!Object.prototype.hasOwnProperty.call(updates, field)) return;
    if (updates[field] === null) {
        delete next[field];
        return;
    }
    next[field] = Boolean(updates[field]);
}
async function updateCustomModel(providerId, modelId, updates = {}) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    if (!row) return null;
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return null;
    const models = JSON.parse(value);
    const index = models.findIndex((m)=>m.id === modelId);
    if (index === -1) return null;
    const current = models[index];
    const currentCompat = current.compatByProtocol;
    let mergedCompat = currentCompat;
    if (updates.compatByProtocol !== undefined && typeof updates.compatByProtocol === "object" && updates.compatByProtocol !== null && !Array.isArray(updates.compatByProtocol)) {
        mergedCompat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deepMergeCompatByProtocol"])(currentCompat, updates.compatByProtocol);
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compatByProtocolHasEntries"])(mergedCompat)) mergedCompat = undefined;
    }
    const next = {
        ...current,
        ...updates.modelName !== undefined ? {
            name: updates.modelName || current.name
        } : {},
        ...updates.apiFormat !== undefined ? {
            apiFormat: updates.apiFormat
        } : {},
        ...updates.targetFormat !== undefined ? {
            targetFormat: updates.targetFormat
        } : {},
        ...updates.supportedEndpoints !== undefined ? {
            supportedEndpoints: updates.supportedEndpoints
        } : {},
        ...updates.normalizeToolCallId !== undefined ? {
            normalizeToolCallId: Boolean(updates.normalizeToolCallId)
        } : {},
        ...updates.isHidden !== undefined ? {
            isHidden: Boolean(updates.isHidden)
        } : {}
    };
    applyTriStateBooleanOverride(next, updates, "preserveOpenAIDeveloperRole");
    // #1904: manual vision-capability override — `null` clears back to the
    // id-based heuristic in getCustomVisionCapabilityFields().
    applyTriStateBooleanOverride(next, updates, "supportsVision");
    if (updates.compatByProtocol !== undefined) {
        if (mergedCompat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compatByProtocolHasEntries"])(mergedCompat)) {
            next.compatByProtocol = mergedCompat;
        } else {
            delete next.compatByProtocol;
        }
    }
    if (Object.prototype.hasOwnProperty.call(updates, "upstreamHeaders")) {
        const uh = updates.upstreamHeaders;
        if (uh === null || uh === undefined) {
            delete next.upstreamHeaders;
        } else if (typeof uh === "object" && !Array.isArray(uh)) {
            const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(uh);
            if (Object.keys(s).length === 0) delete next.upstreamHeaders;
            else next.upstreamHeaders = s;
        }
    }
    models[index] = next;
    db.prepare("UPDATE key_value SET value = ? WHERE namespace = 'customModels' AND key = ?").run(JSON.stringify(models), providerId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$backup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["backupDbFile"])("pre-write");
    return next;
}
/** Single custom model row from key_value customModels, or null */ function getCustomModelRow(providerId, modelId) {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = 'customModels' AND key = ?").get(providerId);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$shared$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKeyValue"])(row).value;
    if (!value) return null;
    try {
        const models = JSON.parse(value);
        if (!Array.isArray(models)) return null;
        const isIdMatch = (x, id)=>{
            if (!x || typeof x !== "object" || Array.isArray(x)) return false;
            return x.id === id;
        };
        // #7364: exact match first; case-insensitive fallback so "glm-4.6V" resolves a
        // custom model saved as "glm-4.6v" (see lookupCustomModelMeta in
        // src/sse/services/model.ts for the sibling lookup this mirrors).
        const m = models.find((x)=>isIdMatch(x, modelId)) ?? models.find((x)=>x && typeof x === "object" && !Array.isArray(x) && typeof x.id === "string" && x.id.toLowerCase() === modelId.toLowerCase());
        return m ?? null;
    } catch  {
        return null;
    }
}
function getModelNormalizeToolCallId(providerId, modelId, sourceFormat) {
    const m = getCustomModelRow(providerId, modelId);
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
    if (m) {
        if (protocol) {
            const pc = m.compatByProtocol?.[protocol];
            if (pc && Object.prototype.hasOwnProperty.call(pc, "normalizeToolCallId")) {
                return Boolean(pc.normalizeToolCallId);
            }
        }
        return Boolean(m.normalizeToolCallId);
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    if (protocol && co?.compatByProtocol?.[protocol]) {
        const pc = co.compatByProtocol[protocol];
        if (Object.prototype.hasOwnProperty.call(pc, "normalizeToolCallId")) {
            return Boolean(pc.normalizeToolCallId);
        }
    }
    return Boolean(co?.normalizeToolCallId);
}
function getModelPreserveOpenAIDeveloperRole(providerId, modelId, sourceFormat) {
    const m = getCustomModelRow(providerId, modelId);
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
    if (m) {
        if (protocol) {
            const pc = m.compatByProtocol?.[protocol];
            if (pc && Object.prototype.hasOwnProperty.call(pc, "preserveOpenAIDeveloperRole")) {
                return Boolean(pc.preserveOpenAIDeveloperRole);
            }
        }
        if (Object.prototype.hasOwnProperty.call(m, "preserveOpenAIDeveloperRole")) {
            return Boolean(m.preserveOpenAIDeveloperRole);
        }
        return undefined;
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    if (protocol && co?.compatByProtocol?.[protocol]) {
        const pc = co.compatByProtocol[protocol];
        if (Object.prototype.hasOwnProperty.call(pc, "preserveOpenAIDeveloperRole")) {
            return Boolean(pc.preserveOpenAIDeveloperRole);
        }
    }
    if (co && Object.prototype.hasOwnProperty.call(co, "preserveOpenAIDeveloperRole")) {
        return Boolean(co.preserveOpenAIDeveloperRole);
    }
    return undefined;
}
function getModelIsHidden(providerId, modelId) {
    const m = getCustomModelRow(providerId, modelId);
    if (m && Object.prototype.hasOwnProperty.call(m, "isHidden")) {
        return Boolean(m.isHidden);
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    return Boolean(co?.isHidden);
}
function getHiddenModelsByProvider() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const visibilityByProvider = new Map();
    const rows = db.prepare("SELECT namespace, key, value FROM key_value WHERE namespace IN ('modelCompatOverrides', 'customModels')").all();
    for (const namespace of [
        "modelCompatOverrides",
        "customModels"
    ]){
        for (const row of rows){
            if (row.namespace !== namespace || !row.value) continue;
            try {
                const parsed = JSON.parse(row.value);
                if (!Array.isArray(parsed)) continue;
                for (const entry of parsed){
                    if (!entry || typeof entry !== "object") continue;
                    const modelId = entry.id;
                    if (typeof modelId !== "string" || modelId.length === 0) continue;
                    if (!Object.prototype.hasOwnProperty.call(entry, "isHidden")) continue;
                    let visibility = visibilityByProvider.get(row.key);
                    if (!visibility) {
                        visibility = new Map();
                        visibilityByProvider.set(row.key, visibility);
                    }
                    visibility.set(modelId, Boolean(entry.isHidden));
                }
            } catch  {
            // Skip malformed entries
            }
        }
    }
    return new Map([
        ...visibilityByProvider
    ].flatMap(([providerId, visibility])=>{
        const hiddenModels = [
            ...visibility
        ].flatMap(([modelId, isHidden])=>isHidden ? [
                modelId
            ] : []);
        return hiddenModels.length > 0 ? [
            [
                providerId,
                new Set(hiddenModels)
            ]
        ] : [];
    }));
}
function getModelIsDeleted(providerId, modelId) {
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    return Boolean(co?.isDeleted);
}
function setModelIsHidden(providerId, modelId, hidden) {
    const customRow = getCustomModelRow(providerId, modelId);
    if (customRow) {
        if (hidden) {
            updateCustomModel(providerId, modelId, {
                isHidden: true
            });
        } else if (Object.prototype.hasOwnProperty.call(customRow, "isHidden")) {
            updateCustomModel(providerId, modelId, {
                isHidden: false
            });
        }
        return;
    }
    const list = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId);
    const idx = list.findIndex((e)=>e.id === modelId);
    if (hidden) {
        const prev = idx >= 0 ? list[idx] : {
            id: modelId
        };
        const next = {
            ...prev,
            id: modelId,
            isHidden: true
        };
        if (idx >= 0) list[idx] = next;
        else list.push(next);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, list);
        return;
    }
    if (idx < 0) return;
    if (Object.keys(list[idx]).length <= 1) {
        // Only `id` left; drop the entry entirely.
        const filtered = list.filter((_, i)=>i !== idx);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, filtered);
        return;
    }
    delete list[idx].isHidden;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["writeCompatList"])(providerId, list);
}
function readUpstreamFromJsonRecord(row, key) {
    if (!row) return undefined;
    const raw = row[key];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(raw);
    return Object.keys(s).length > 0 ? s : undefined;
}
function getModelUpstreamExtraHeaders(providerId, modelId, sourceFormat) {
    const protocol = sourceFormat && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCompatProtocolKey"])(sourceFormat) ? sourceFormat : null;
    const m = getCustomModelRow(providerId, modelId);
    const base = {};
    if (m) {
        const fromModel = readUpstreamFromJsonRecord(m, "upstreamHeaders");
        if (fromModel) Object.assign(base, fromModel);
        if (protocol) {
            const pc = m.compatByProtocol?.[protocol];
            const fromProto = pc?.upstreamHeaders;
            if (fromProto && typeof fromProto === "object") {
                Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(fromProto));
            }
        }
        return base;
    }
    const co = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["readCompatList"])(providerId).find((e)=>e.id === modelId);
    if (co?.upstreamHeaders) {
        Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(co.upstreamHeaders));
    }
    if (protocol && co?.compatByProtocol?.[protocol]?.upstreamHeaders) {
        Object.assign(base, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$compat$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sanitizeUpstreamHeadersMap"])(co.compatByProtocol[protocol].upstreamHeaders));
    }
    return base;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/models/activeSyncedCatalog.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getActiveSyncedCatalog",
    ()=>getActiveSyncedCatalog,
    "getAllActiveSyncedModels",
    ()=>getAllActiveSyncedModels,
    "reconcileProvidersWithActiveSyncedCatalog",
    ()=>reconcileProvidersWithActiveSyncedCatalog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function resolveStoredProviderId(aliasOrId) {
    const normalized = aliasOrId.trim();
    if (!normalized) return "";
    if (Object.prototype.hasOwnProperty.call(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"], normalized)) {
        return normalized;
    }
    for (const [providerId, alias] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PROVIDER_ID_TO_ALIAS"])){
        if (alias === normalized) return providerId;
    }
    return normalized;
}
function readConnectionRef(connection) {
    if (!connection || typeof connection !== "object") return null;
    const record = connection;
    if (typeof record.id !== "string" || record.id.length === 0 || typeof record.provider !== "string" || record.provider.length === 0) {
        return null;
    }
    return {
        id: record.id,
        provider: record.provider
    };
}
function collectModelsForConnections(modelsByConnection, connectionIds) {
    const models = new Map();
    for (const connectionId of connectionIds){
        for (const model of modelsByConnection[connectionId] || []){
            if (!model?.id || models.has(model.id)) continue;
            models.set(model.id, model);
        }
    }
    return Array.from(models.values());
}
async function getActiveSyncedCatalog(providerId) {
    const storedProviderId = resolveStoredProviderId(providerId);
    if (!storedProviderId) {
        return {
            authoritative: false,
            models: []
        };
    }
    try {
        const [connections, modelsByConnection] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRawProviderConnections"])({
                provider: storedProviderId,
                isActive: true
            }, undefined, undefined, [
                "id",
                "provider"
            ]),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedAvailableModelsByConnection"])(storedProviderId)
        ]);
        const activeConnectionIds = connections.map(readConnectionRef).filter((connection)=>connection !== null).map((connection)=>connection.id);
        const models = collectModelsForConnections(modelsByConnection, activeConnectionIds);
        return {
            authoritative: models.length > 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["providerUsesAuthoritativeLiveCatalog"])(providerId),
            models
        };
    } catch  {
        return {
            authoritative: false,
            models: []
        };
    }
}
async function getAllActiveSyncedModels() {
    try {
        const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRawProviderConnections"])({
            isActive: true
        }, undefined, undefined, [
            "id",
            "provider"
        ]);
        const connectionIdsByProvider = new Map();
        for (const rawConnection of connections){
            const connection = readConnectionRef(rawConnection);
            if (!connection) continue;
            if (!connectionIdsByProvider.has(connection.provider)) {
                connectionIdsByProvider.set(connection.provider, new Set());
            }
            connectionIdsByProvider.get(connection.provider).add(connection.id);
        }
        const result = {};
        await Promise.all(Array.from(connectionIdsByProvider.entries()).map(async ([providerId, connectionIds])=>{
            const modelsByConnection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getSyncedAvailableModelsByConnection"])(providerId);
            const models = collectModelsForConnections(modelsByConnection, connectionIds);
            if (models.length > 0) {
                result[providerId] = models;
            }
        }));
        return result;
    } catch  {
        return {};
    }
}
async function reconcileProvidersWithActiveSyncedCatalog(providerIds, modelId) {
    const uniqueProviders = Array.from(new Set(providerIds.filter((provider)=>typeof provider === "string" && provider.length > 0)));
    const states = await Promise.all(uniqueProviders.map(async (provider)=>({
            provider,
            catalog: await getActiveSyncedCatalog(provider)
        })));
    const providers = [];
    const excludedProviders = [];
    for (const { provider, catalog } of states){
        const modelIsLive = catalog.models.some((model)=>model.id === modelId);
        if (!catalog.authoritative || modelIsLive) {
            providers.push(provider);
        } else {
            excludedProviders.push(provider);
        }
    }
    return {
        providers,
        excludedProviders
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=_0z_c4g9._.js.map
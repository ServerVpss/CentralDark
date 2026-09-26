module.exports = [
"[project]/open-sse/services/admission/adaptation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clampLimit",
    ()=>clampLimit,
    "closeAdaptationWindow",
    ()=>closeAdaptationWindow,
    "createAdaptationState",
    ()=>createAdaptationState,
    "noteLatency",
    ()=>noteLatency,
    "noteOutcome",
    ()=>noteOutcome,
    "sampleActiveIntegral",
    ()=>sampleActiveIntegral,
    "setPressure",
    ()=>setPressure
]);
function clampLimit(value, minLimit, maxLimit) {
    if (!Number.isFinite(value)) return minLimit;
    return Math.min(maxLimit, Math.max(minLimit, Math.floor(value)));
}
function createAdaptationState(initialLimit, minLimit, maxLimit, nowMs) {
    return {
        currentLimit: clampLimit(initialLimit, minLimit, maxLimit),
        shortLatencyEwma: 0,
        longLatencyEwma: 0,
        pressure: "normal",
        windowActiveCostIntegral: 0,
        windowCompleted: 0,
        windowLatencySamples: 0,
        windowStartMs: nowMs,
        freezeGrowth: false,
        criticalDecreaseConsumed: false,
        utilization: 0
    };
}
function noteLatency(state, latencyMs, params) {
    const sample = Number.isFinite(latencyMs) && latencyMs >= 0 ? latencyMs : 0;
    state.windowLatencySamples += 1;
    const sa = params.shortLatencyAlpha;
    const la = params.longLatencyAlpha;
    if (state.shortLatencyEwma <= 0 && state.longLatencyEwma <= 0) {
        state.shortLatencyEwma = sample;
        state.longLatencyEwma = sample;
        return;
    }
    state.shortLatencyEwma = sa * sample + (1 - sa) * state.shortLatencyEwma;
    state.longLatencyEwma = la * sample + (1 - la) * state.longLatencyEwma;
}
function noteOutcome(state, outcome) {
    // A single upstream business error freezes growth for the current window; it must not
    // apply critical multiplicative collapse on its own.
    if (outcome === "upstream_error") {
        state.freezeGrowth = true;
        return;
    }
    if (outcome === "timeout") {
        state.freezeGrowth = true;
    }
}
function setPressure(state, pressure) {
    const severity = {
        normal: 0,
        high: 1,
        critical: 2
    };
    if (severity[pressure] > severity[state.pressure]) state.pressure = pressure;
}
function closeAdaptationWindow(state, params, nowMs) {
    const elapsed = Math.max(1, Math.min(params.windowMs, nowMs - state.windowStartMs));
    // sampleActiveIntegral already accounts for every interval exactly once.
    const avgActive = state.windowActiveCostIntegral / elapsed;
    const util = state.currentLimit > 0 ? avgActive / state.currentLimit : 0;
    state.utilization = Math.max(0, Math.min(1, util));
    let next = state.currentLimit;
    const gradient = state.longLatencyEwma > 0 ? (state.shortLatencyEwma - state.longLatencyEwma) / state.longLatencyEwma : 0;
    if (state.pressure === "critical") {
        // Immediate observePressure may already have applied the critical factor once.
        if (!state.criticalDecreaseConsumed) {
            next = Math.floor(next * params.criticalDecreaseFactor);
        }
    } else if (state.pressure === "high" || state.windowLatencySamples > 0 && gradient >= params.latencyGradientThreshold) {
        next = Math.floor(next * params.decreaseFactor);
    } else if (!state.freezeGrowth && state.pressure === "normal" && state.utilization >= params.highUtilizationThreshold && state.windowCompleted > 0) {
        const step = Math.min(params.increaseStep, params.maxIncreasePerWindow);
        next = next + step;
    }
    // A genuinely low-utilization window recovers the latency baseline so stale gradients expire.
    if (state.utilization <= params.lowUtilizationThreshold) {
        state.shortLatencyEwma = state.longLatencyEwma;
    }
    state.currentLimit = clampLimit(next, params.minLimit, params.maxLimit);
    state.windowActiveCostIntegral = 0;
    state.windowCompleted = 0;
    state.windowLatencySamples = 0;
    state.windowStartMs = nowMs;
    state.freezeGrowth = false;
    state.criticalDecreaseConsumed = false;
    state.pressure = "normal";
}
function sampleActiveIntegral(state, activeCost, dtMs) {
    if (dtMs <= 0 || activeCost <= 0) return;
    const boundedActiveCost = Math.min(activeCost, state.currentLimit);
    const contribution = dtMs > Math.floor(Number.MAX_SAFE_INTEGER / boundedActiveCost) ? Number.MAX_SAFE_INTEGER : boundedActiveCost * dtMs;
    state.windowActiveCostIntegral = contribution >= Number.MAX_SAFE_INTEGER - state.windowActiveCostIntegral ? Number.MAX_SAFE_INTEGER : state.windowActiveCostIntegral + contribution;
}
}),
"[project]/open-sse/services/admission/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure weighted adaptive admission-control types.
 * No route/settings wiring — dependency-injected controller seam only.
 */ /**
 * Upper bound for adaptation windows and wait deadlines that participate in
 * cost×time products (utilization integrals, deadline offsets).
 * 24h is far beyond practical control windows while keeping the product domain exact.
 */ __turbopack_context__.s([
    "MAX_ADMISSION_COST_OR_LIMIT",
    ()=>MAX_ADMISSION_COST_OR_LIMIT,
    "MAX_ADMISSION_WINDOW_MS",
    ()=>MAX_ADMISSION_WINDOW_MS,
    "createAdmissionRejectError",
    ()=>createAdmissionRejectError
]);
const MAX_ADMISSION_WINDOW_MS = 86_400_000;
const MAX_ADMISSION_COST_OR_LIMIT = Math.floor(Number.MAX_SAFE_INTEGER / MAX_ADMISSION_WINDOW_MS);
function createAdmissionRejectError(code, message) {
    const err = new Error(message);
    err.name = "AdmissionRejectError";
    err.code = code;
    return err;
}
}),
"[project]/open-sse/services/admission/cost.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_ADMISSION_COST_CONFIG",
    ()=>DEFAULT_ADMISSION_COST_CONFIG,
    "estimateAdmissionCost",
    ()=>estimateAdmissionCost,
    "normalizeRequestCost",
    ()=>normalizeRequestCost,
    "resolveCostConfig",
    ()=>resolveCostConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/admission/types.ts [app-route] (ecmascript)");
;
;
const DEFAULT_ADMISSION_COST_CONFIG = Object.freeze({
    baseCost: 1,
    bodyBytesPerUnit: 16_384,
    tokensPerUnit: 1_024,
    messagesPerUnit: 32,
    toolsPerUnit: 8,
    fanoutPerUnit: 1,
    streamingClassCost: 1,
    nonStreamingClassCost: 2,
    maxRequestCost: 1_000
});
function finiteNonNegative(value) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 0;
    return Math.min(value, Number.MAX_SAFE_INTEGER);
}
function requirePositiveSafeInteger(name, value, max = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_ADMISSION_COST_OR_LIMIT"]) {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
        throw new RangeError(`${name} must be a positive safe integer`);
    }
    if (value > max) {
        throw new RangeError(`${name} must be <= ${max}`);
    }
    return value;
}
const COST_CONFIG_KEYS = [
    "baseCost",
    "bodyBytesPerUnit",
    "tokensPerUnit",
    "messagesPerUnit",
    "toolsPerUnit",
    "fanoutPerUnit",
    "streamingClassCost",
    "nonStreamingClassCost",
    "maxRequestCost"
];
function resolveCostConfig(partial) {
    const d = DEFAULT_ADMISSION_COST_CONFIG;
    const resolved = {};
    for (const key of COST_CONFIG_KEYS){
        resolved[key] = requirePositiveSafeInteger(key, partial?.[key] ?? d[key]);
    }
    return resolved;
}
function unitsFrom(amount, quantum) {
    return amount <= 0 ? 0 : Math.ceil(amount / quantum);
}
function addBounded(total, contribution, maximum) {
    if (contribution >= maximum - total) return maximum;
    return total + contribution;
}
function estimateAdmissionCost(features, config) {
    const cfg = resolveCostConfig(config);
    const body = finiteNonNegative(features?.bodyBytes);
    const tokens = finiteNonNegative(features?.estimatedInputTokens);
    const messages = finiteNonNegative(features?.messageCount);
    const tools = finiteNonNegative(features?.toolCount);
    const fanout = Math.max(1, finiteNonNegative(features?.requestedFanout));
    const contributions = [
        unitsFrom(body, cfg.bodyBytesPerUnit),
        unitsFrom(tokens, cfg.tokensPerUnit),
        unitsFrom(messages, cfg.messagesPerUnit),
        unitsFrom(tools, cfg.toolsPerUnit),
        unitsFrom(fanout, cfg.fanoutPerUnit),
        features?.streaming !== false ? cfg.streamingClassCost : cfg.nonStreamingClassCost
    ];
    let total = Math.min(cfg.baseCost, cfg.maxRequestCost);
    for (const contribution of contributions){
        total = addBounded(total, contribution, cfg.maxRequestCost);
        if (total === cfg.maxRequestCost) break;
    }
    return total;
}
function normalizeRequestCost(cost, maxRequestCost = DEFAULT_ADMISSION_COST_CONFIG.maxRequestCost) {
    const max = requirePositiveSafeInteger("maxRequestCost", maxRequestCost);
    const value = requirePositiveSafeInteger("request cost", cost);
    return Math.min(value, max);
}
}),
"[project]/open-sse/services/admission/config.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "validateConfig",
    ()=>validateConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$cost$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/admission/cost.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/admission/types.ts [app-route] (ecmascript)");
;
;
;
function requirePositiveInt(name, value, max = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_ADMISSION_COST_OR_LIMIT"]) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || !Number.isSafeInteger(value)) {
        throw new RangeError(`${name} must be a positive safe integer`);
    }
    if (value > max) {
        throw new RangeError(`${name} must be <= ${max}`);
    }
    return value;
}
function requireUnitInterval(name, value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 1) {
        throw new RangeError(`${name} must be in (0, 1]`);
    }
    return value;
}
function requireDecreaseFactor(name, value, fallback) {
    if (value === undefined) return fallback;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value >= 1) {
        throw new RangeError(`${name} must be in (0, 1)`);
    }
    return value;
}
function resolveMode(mode) {
    if (mode === undefined) return "shadow";
    if (mode !== "off" && mode !== "shadow" && mode !== "enforce") {
        throw new RangeError("mode must be off|shadow|enforce");
    }
    return mode;
}
function resolveAdaptationParams(input, minLimit, maxLimit, windowMs) {
    const decreaseFactor = requireDecreaseFactor("decreaseFactor", input.decreaseFactor, 0.8);
    const criticalDecreaseFactor = requireDecreaseFactor("criticalDecreaseFactor", input.criticalDecreaseFactor, 0.5);
    const increaseStep = input.increaseStep === undefined ? 1 : requirePositiveInt("increaseStep", input.increaseStep);
    const maxIncreasePerWindow = input.maxIncreasePerWindow === undefined ? increaseStep : requirePositiveInt("maxIncreasePerWindow", input.maxIncreasePerWindow);
    const shortLatencyAlpha = requireUnitInterval("shortLatencyAlpha", input.shortLatencyAlpha, 0.5);
    const longLatencyAlpha = requireUnitInterval("longLatencyAlpha", input.longLatencyAlpha, 0.1);
    const highUtilizationThreshold = requireUnitInterval("highUtilizationThreshold", input.highUtilizationThreshold, 0.7);
    const lowUtilizationThreshold = requireUnitInterval("lowUtilizationThreshold", input.lowUtilizationThreshold, 0.3);
    if (criticalDecreaseFactor > decreaseFactor) {
        throw new RangeError("criticalDecreaseFactor must be <= decreaseFactor");
    }
    if (lowUtilizationThreshold >= highUtilizationThreshold) {
        throw new RangeError("lowUtilizationThreshold must be < highUtilizationThreshold");
    }
    if (shortLatencyAlpha <= longLatencyAlpha) {
        throw new RangeError("shortLatencyAlpha must be > longLatencyAlpha");
    }
    return {
        minLimit,
        maxLimit,
        windowMs,
        shortLatencyAlpha,
        longLatencyAlpha,
        increaseStep,
        decreaseFactor,
        criticalDecreaseFactor,
        highUtilizationThreshold,
        lowUtilizationThreshold,
        latencyGradientThreshold: requireUnitInterval("latencyGradientThreshold", input.latencyGradientThreshold, 0.25),
        maxIncreasePerWindow
    };
}
function validateConfig(input) {
    const minLimit = requirePositiveInt("minLimit", input.minLimit);
    const maxLimit = requirePositiveInt("maxLimit", input.maxLimit);
    if (minLimit > maxLimit) {
        throw new RangeError("minLimit must be <= maxLimit");
    }
    const initialLimit = requirePositiveInt("initialLimit", input.initialLimit);
    // Queue count is not multiplied into cost×time products; keep the full safe-integer range.
    const maxQueueCount = requirePositiveInt("maxQueueCount", input.maxQueueCount, Number.MAX_SAFE_INTEGER);
    const maxQueueCost = requirePositiveInt("maxQueueCost", input.maxQueueCost);
    const windowMs = input.windowMs === undefined ? 1000 : requirePositiveInt("windowMs", input.windowMs, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_ADMISSION_WINDOW_MS"]);
    const defaultMaxWaitMs = input.defaultMaxWaitMs === undefined ? 5_000 : requirePositiveInt("defaultMaxWaitMs", input.defaultMaxWaitMs, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_ADMISSION_WINDOW_MS"]);
    const costConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$cost$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveCostConfig"])(input.cost);
    return {
        mode: resolveMode(input.mode),
        minLimit,
        maxLimit,
        initialLimit,
        maxQueueCount,
        maxQueueCost,
        defaultMaxWaitMs,
        windowMs,
        maxRequestCost: costConfig.maxRequestCost,
        costConfig,
        adaptation: resolveAdaptationParams(input, minLimit, maxLimit, windowMs)
    };
}
}),
"[project]/open-sse/services/admission/queue.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FairCostQueue",
    ()=>FairCostQueue
]);
/**
 * Bounded multi-tenant fair queue (round-robin across tenant buckets).
 * Count + total cost caps; no unbounded arrays of timers beyond one per entry.
 */ /**
 * After this many pass-overs while unfittable, reserve capacity for the aged head
 * instead of indefinitely admitting smaller work from other tenants.
 */ const MAX_UNFITTABLE_SKIPS = 2;
class FairCostQueue {
    maxCount;
    maxCost;
    buckets;
    order;
    cursor;
    count;
    cost;
    constructor(maxCount, maxCost){
        this.maxCount = maxCount;
        this.maxCost = maxCost;
        this.buckets = new Map();
        this.order = [];
        this.cursor = 0;
        this.count = 0;
        this.cost = 0;
    }
    get size() {
        return this.count;
    }
    get totalCost() {
        return this.cost;
    }
    snapshot() {
        return {
            count: this.count,
            cost: this.cost
        };
    }
    canAccept(entryCost) {
        if (!Number.isSafeInteger(entryCost) || entryCost <= 0) return false;
        if (this.count >= this.maxCount) return false;
        if (entryCost > this.maxCost - this.cost) return false;
        return true;
    }
    enqueue(entry) {
        if (!this.canAccept(entry.cost)) return false;
        let bucket = this.buckets.get(entry.tenantKey);
        if (!bucket) {
            bucket = [];
            this.buckets.set(entry.tenantKey, bucket);
            this.order.push(entry.tenantKey);
        }
        bucket.push(entry);
        this.count += 1;
        this.cost += entry.cost;
        return true;
    }
    /**
   * Round-robin dequeue, optionally skipping tenant heads that do not fit available cost.
   * After MAX_UNFITTABLE_SKIPS actual pass-overs, an unfittable head reserves capacity:
   * smaller work is not admitted ahead of it until it fits, is removed, or capacity rises.
   */ dequeue(maxCost = Number.MAX_SAFE_INTEGER) {
        if (this.count === 0) return undefined;
        const n = this.order.length;
        // Bounded anti-starvation: prefer the oldest aged unfittable head once reserved.
        let reserved;
        for(let i = 0; i < n; i++){
            const idx = (this.cursor + i) % n;
            const tenant = this.order[idx];
            const entry = this.buckets.get(tenant)?.[0];
            if (!entry) continue;
            if ((entry.skipCount ?? 0) >= MAX_UNFITTABLE_SKIPS) {
                if (!reserved || entry.enqueuedAtMs < reserved.entry.enqueuedAtMs) {
                    reserved = {
                        idx,
                        entry
                    };
                }
            }
        }
        if (reserved) {
            if (reserved.entry.cost > maxCost) return undefined;
            return this.takeAt(reserved.idx);
        }
        const bypassed = [];
        for(let i = 0; i < n; i++){
            const idx = (this.cursor + i) % n;
            const tenant = this.order[idx];
            const bucket = this.buckets.get(tenant);
            const entry = bucket?.[0];
            if (!entry) continue;
            if (entry.cost > maxCost) {
                bypassed.push(entry);
                continue;
            }
            // Only an actual smaller admission counts as a pass-over. Merely polling
            // with no available capacity must not age a head into reservation.
            for (const skipped of bypassed){
                skipped.skipCount = (skipped.skipCount ?? 0) + 1;
            }
            return this.takeAt(idx);
        }
        return undefined;
    }
    takeAt(idx) {
        const tenant = this.order[idx];
        const bucket = this.buckets.get(tenant);
        const entry = bucket?.[0];
        if (!entry) return undefined;
        bucket.shift();
        this.count -= 1;
        this.cost -= entry.cost;
        entry.skipCount = 0;
        if (bucket.length === 0) {
            this.buckets.delete(tenant);
            this.order.splice(idx, 1);
            this.cursor = this.order.length === 0 ? 0 : idx % this.order.length;
        } else {
            this.cursor = (idx + 1) % this.order.length;
        }
        return entry;
    }
    /** Peek next without removing (for oversized-vs-limit checks). */ peek() {
        if (this.count === 0) return undefined;
        const n = this.order.length;
        for(let i = 0; i < n; i++){
            const idx = (this.cursor + i) % n;
            const tenant = this.order[idx];
            const bucket = this.buckets.get(tenant);
            if (bucket && bucket.length > 0) return bucket[0];
        }
        return undefined;
    }
    removeById(id) {
        for(let ti = 0; ti < this.order.length; ti++){
            const tenant = this.order[ti];
            const bucket = this.buckets.get(tenant);
            if (!bucket) continue;
            const idx = bucket.findIndex((e)=>e.id === id);
            if (idx < 0) continue;
            const [entry] = bucket.splice(idx, 1);
            this.count -= 1;
            this.cost -= entry.cost;
            if (bucket.length === 0) {
                this.buckets.delete(tenant);
                this.order.splice(ti, 1);
                if (this.order.length === 0) {
                    this.cursor = 0;
                } else if (ti < this.cursor) {
                    // Removing a prior bucket shifts the successor into cursor - 1.
                    this.cursor -= 1;
                } else if (this.cursor >= this.order.length) {
                    // Removed the final bucket at the cursor; wrap to the head.
                    this.cursor = 0;
                }
            // ti === cursor: leave cursor so it now points at the logical successor.
            // ti > cursor: cursor is unaffected.
            }
            return entry;
        }
        return undefined;
    }
    drain() {
        const out = [];
        while(true){
            const e = this.dequeue();
            if (!e) break;
            out.push(e);
        }
        this.cursor = 0;
        return out;
    }
}
}),
"[project]/open-sse/services/admission/controller.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdaptiveAdmissionController",
    ()=>AdaptiveAdmissionController
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/admission/adaptation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/admission/config.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$cost$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/admission/cost.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/admission/queue.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/admission/types.ts [app-route] (ecmascript)");
;
;
;
;
;
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
/** Snapshot numbers are always finite safe integers; never emit rounded unsafe Number values. */ function saturateSnapshotNumber(value) {
    if (!Number.isFinite(value) || value <= 0) return 0;
    if (value >= Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
    return Math.floor(value);
}
function bigintToSnapshotNumber(value) {
    if (value <= 0n) return 0;
    if (value >= MAX_SAFE_BIGINT) return Number.MAX_SAFE_INTEGER;
    return Number(value);
}
function addSaturated(total, delta) {
    if (delta <= 0) return saturateSnapshotNumber(total);
    if (total >= Number.MAX_SAFE_INTEGER - delta) return Number.MAX_SAFE_INTEGER;
    return total + delta;
}
let leaseSeq = 0;
function nextId(prefix) {
    leaseSeq += 1;
    return `${prefix}-${leaseSeq}`;
}
function defaultClock() {
    return {
        now: ()=>Date.now(),
        setTimer: (fn, delayMs)=>{
            const handle = setTimeout(fn, delayMs);
            // Window/deadline timers must not pin the event loop open when idle.
            if (typeof handle.unref === "function") handle.unref();
            return handle;
        },
        clearTimer: (id)=>clearTimeout(id)
    };
}
class AdaptiveAdmissionController {
    config;
    clock;
    adaptation;
    queue;
    virtualQueue;
    active = new Map();
    activeCost = 0n;
    virtualActiveCost = 0;
    virtualActiveCount = 0;
    lastSampleMs;
    windowTimer = undefined;
    shutDown = false;
    admittedCount = 0;
    rejectedCount = 0;
    wouldAdmitCount = 0;
    wouldQueueCount = 0;
    wouldRejectCount = 0;
    constructor(config, clock){
        this.config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateConfig"])(config);
        this.clock = {
            now: clock?.now ?? defaultClock().now,
            setTimer: clock?.setTimer ?? defaultClock().setTimer,
            clearTimer: clock?.clearTimer ?? defaultClock().clearTimer
        };
        const now = this.clock.now();
        this.adaptation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdaptationState"])(this.config.initialLimit, this.config.minLimit, this.config.maxLimit, now);
        this.queue = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FairCostQueue"](this.config.maxQueueCount, this.config.maxQueueCost);
        this.virtualQueue = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FairCostQueue"](this.config.maxQueueCount, this.config.maxQueueCost);
        this.lastSampleMs = now;
        this.armWindowTimer();
    }
    updateConfig(config) {
        const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateConfig"])(config);
        this.sampleIntegral();
        this.config = next;
        this.adaptation.currentLimit = Math.min(next.maxLimit, Math.max(next.minLimit, this.adaptation.currentLimit));
        this.adaptation.windowStartMs = this.clock.now();
        this.adaptation.windowActiveCostIntegral = 0;
        this.adaptation.windowCompleted = 0;
        this.adaptation.windowLatencySamples = 0;
        this.adaptation.freezeGrowth = false;
        this.adaptation.criticalDecreaseConsumed = false;
        this.adaptation.pressure = "normal";
        this.lastSampleMs = this.clock.now();
        const drained = this.queue.drain();
        this.queue = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FairCostQueue"](next.maxQueueCount, next.maxQueueCost);
        for (const entry of drained){
            if (next.mode !== "enforce") {
                this.clearEntryTimer(entry);
                this.detachAbort(entry);
                entry.payload.resolve(this.admit(entry.cost));
                continue;
            }
            // Cost above the new enforce limit must fail closed immediately, never strand until deadline.
            if (entry.cost > this.adaptation.currentLimit) {
                this.failQueued(entry, "ADMISSION_OVERSIZED", "request cost exceeds max budget after config update");
                continue;
            }
            if (!this.queue.enqueue(entry)) {
                this.failQueued(entry, "ADMISSION_QUEUE_FULL", "queue capacity reduced");
            }
        }
        this.rebuildVirtualState(next.mode === "shadow");
        this.armWindowTimer();
        if (next.mode === "enforce") {
            this.dispatch();
        }
    }
    snapshot() {
        this.sampleIntegral();
        return {
            mode: this.config.mode,
            currentLimit: this.adaptation.currentLimit,
            minLimit: this.config.minLimit,
            maxLimit: this.config.maxLimit,
            activeCost: bigintToSnapshotNumber(this.activeCost),
            activeCount: saturateSnapshotNumber(this.active.size),
            queuedCost: saturateSnapshotNumber(this.queue.totalCost),
            queuedCount: saturateSnapshotNumber(this.queue.size),
            virtualActiveCost: saturateSnapshotNumber(this.virtualActiveCost),
            virtualActiveCount: saturateSnapshotNumber(this.virtualActiveCount),
            virtualQueuedCost: saturateSnapshotNumber(this.virtualQueue.totalCost),
            virtualQueuedCount: saturateSnapshotNumber(this.virtualQueue.size),
            admittedCount: saturateSnapshotNumber(this.admittedCount),
            rejectedCount: saturateSnapshotNumber(this.rejectedCount),
            wouldAdmitCount: saturateSnapshotNumber(this.wouldAdmitCount),
            wouldQueueCount: saturateSnapshotNumber(this.wouldQueueCount),
            wouldRejectCount: saturateSnapshotNumber(this.wouldRejectCount),
            shortLatencyEwma: this.adaptation.shortLatencyEwma,
            longLatencyEwma: this.adaptation.longLatencyEwma,
            utilization: this.adaptation.utilization,
            pressure: this.adaptation.pressure,
            shutdown: this.shutDown
        };
    }
    observePressure(pressure) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setPressure"])(this.adaptation, pressure);
        if (pressure === "critical") {
            // Immediate fast decrease once per window; window close must not re-apply it.
            if (!this.adaptation.criticalDecreaseConsumed) {
                this.adaptation.currentLimit = Math.max(this.config.minLimit, Math.floor(this.adaptation.currentLimit * this.config.adaptation.criticalDecreaseFactor));
                this.adaptation.criticalDecreaseConsumed = true;
                this.dispatch();
                this.dispatchVirtual();
            }
        }
    }
    /** Deterministic window tick for tests / injected clocks. */ tick() {
        this.sampleIntegral();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["closeAdaptationWindow"])(this.adaptation, this.config.adaptation, this.clock.now());
        // Real queue first, then virtual: raised limits must promote shadow-queued work
        // before newer arrivals are classified against the updated budget.
        this.dispatch();
        this.dispatchVirtual();
    }
    async acquire(request) {
        if (this.shutDown) {
            return this.reject("ADMISSION_SHUTDOWN", "admission controller is shut down");
        }
        if (request.signal?.aborted) {
            return this.reject("ADMISSION_ABORTED", "request aborted before acquire");
        }
        if (request.pressure) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setPressure"])(this.adaptation, request.pressure);
        const cost = this.resolveCost(request);
        const mode = this.config.mode;
        if (mode === "off") {
            return this.admitVirtual(cost);
        }
        const limit = this.adaptation.currentLimit;
        if (mode === "shadow") {
            return this.acquireShadow(request, cost, limit);
        }
        // enforce
        if (cost > limit) {
            return this.reject("ADMISSION_OVERSIZED", "request cost exceeds max budget");
        }
        // Once work is queued, every newer request joins the same fair queue even if it
        // currently fits. This makes bounded bypass accounting effective and prevents
        // direct arrivals from indefinitely jumping an older reserved weighted request.
        if (this.queue.size === 0 && this.activeCost + BigInt(cost) <= BigInt(limit)) {
            return this.admit(cost);
        }
        if (!this.queue.canAccept(cost)) {
            return this.reject("ADMISSION_QUEUE_FULL", "admission queue is full");
        }
        return this.enqueue(request, cost);
    }
    shutdown() {
        if (this.shutDown) return;
        this.shutDown = true;
        if (this.windowTimer !== undefined) {
            this.clock.clearTimer(this.windowTimer);
            this.windowTimer = undefined;
        }
        const drained = this.queue.drain();
        for (const entry of drained){
            this.clearEntryTimer(entry);
            this.detachAbort(entry);
            entry.payload.reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdmissionRejectError"])("ADMISSION_SHUTDOWN", "admission controller shut down"));
            this.rejectedCount += 1;
        }
    }
    resolveCost(request) {
        if (request.cost !== undefined) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$cost$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeRequestCost"])(request.cost, this.config.maxRequestCost);
        }
        if (request.features) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$cost$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateAdmissionCost"])(request.features, this.config.costConfig);
        }
        return 1;
    }
    acquireShadow(request, cost, limit) {
        let decision;
        let disposition;
        if (cost > limit || !Number.isSafeInteger(cost)) {
            decision = "would-reject";
            disposition = "rejected";
            this.wouldRejectCount += 1;
        } else if (this.virtualActiveCost + cost <= limit) {
            decision = "would-admit";
            disposition = "active";
            this.virtualActiveCost = addSaturated(this.virtualActiveCost, cost);
            this.virtualActiveCount = addSaturated(this.virtualActiveCount, 1);
            this.wouldAdmitCount = addSaturated(this.wouldAdmitCount, 1);
        } else if (this.virtualQueue.canAccept(cost)) {
            decision = "would-queue";
            disposition = "queued";
            this.wouldQueueCount += 1;
        } else {
            decision = "would-reject";
            disposition = "rejected";
            this.wouldRejectCount += 1;
        }
        const admitted = this.admit(cost, disposition);
        if (disposition === "queued") {
            this.virtualQueue.enqueue({
                id: admitted.lease.id,
                tenantKey: request.tenantKey || "_default",
                cost,
                enqueuedAtMs: this.clock.now(),
                deadlineMs: Number.MAX_SAFE_INTEGER,
                payload: {
                    recordId: admitted.lease.id
                }
            });
        }
        return {
            ...admitted,
            shadowDecision: decision
        };
    }
    admitVirtual(cost) {
        // Mode off: no accounting.
        const id = nextId("lease");
        const lease = {
            id,
            cost,
            get released () {
                return true;
            },
            release: ()=>{
            /* no-op */ }
        };
        this.admittedCount += 1;
        return {
            status: "admitted",
            lease
        };
    }
    admit(cost, virtualDisposition = "none") {
        this.sampleIntegral();
        const id = nextId("lease");
        const record = {
            id,
            cost,
            released: false,
            admittedAtMs: this.clock.now(),
            virtualDisposition
        };
        this.active.set(id, record);
        this.activeCost += BigInt(cost);
        this.admittedCount += 1;
        const controller = this;
        const lease = {
            id,
            cost,
            get released () {
                return record.released;
            },
            release (outcome = "success", meta) {
                controller.releaseLease(record, outcome, meta);
            }
        };
        return {
            status: "admitted",
            lease
        };
    }
    releaseLease(record, outcome, meta) {
        if (record.released) return;
        record.released = true;
        // Sample while the lease still contributes to activeCost so utilization EWMA sees load.
        this.sampleIntegral();
        if (this.active.has(record.id)) {
            this.active.delete(record.id);
            this.activeCost -= BigInt(record.cost);
        }
        const latency = meta?.latencyMs !== undefined ? meta.latencyMs : Math.max(0, this.clock.now() - record.admittedAtMs);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noteLatency"])(this.adaptation, latency, this.config.adaptation);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["noteOutcome"])(this.adaptation, outcome);
        this.adaptation.windowCompleted += 1;
        if (meta?.pressure) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setPressure"])(this.adaptation, meta.pressure);
        this.releaseVirtual(record);
        this.dispatch();
    }
    enqueue(request, cost) {
        const id = nextId("q");
        const maxWait = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$cost$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeRequestCost"])(request.maxWaitMs ?? this.config.defaultMaxWaitMs, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_ADMISSION_WINDOW_MS"]);
        const now = this.clock.now();
        const deadlineMs = Math.min(Number.MAX_SAFE_INTEGER, now + maxWait);
        let settle;
        const promise = new Promise((resolve, reject)=>{
            settle = {
                resolve,
                reject
            };
        });
        const entry = {
            id,
            tenantKey: request.tenantKey && request.tenantKey.length > 0 ? request.tenantKey : "_default",
            cost,
            enqueuedAtMs: now,
            deadlineMs,
            payload: {
                resolve: (v)=>settle.resolve(v),
                reject: (e)=>settle.reject(e),
                signal: request.signal
            }
        };
        if (!this.queue.enqueue(entry)) {
            return this.reject("ADMISSION_QUEUE_FULL", "admission queue is full");
        }
        entry.timerId = this.clock.setTimer(()=>{
            this.expireEntry(id, "ADMISSION_DEADLINE", "admission wait deadline exceeded");
        }, Math.max(0, deadlineMs - now));
        if (request.signal) {
            const onAbort = ()=>{
                this.expireEntry(id, "ADMISSION_ABORTED", "request aborted while queued");
            };
            entry.payload.onAbort = onAbort;
            request.signal.addEventListener("abort", onAbort, {
                once: true
            });
        }
        // Capacity may have freed between check and enqueue in concurrent hosts; try dispatch.
        this.dispatch();
        return {
            status: "queued",
            promise
        };
    }
    expireEntry(id, code, message) {
        const entry = this.queue.removeById(id);
        if (!entry) return;
        this.clearEntryTimer(entry);
        this.detachAbort(entry);
        entry.payload.reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdmissionRejectError"])(code, message));
        this.rejectedCount += 1;
        // Resume enforce dispatch so a now-fitting successor is not stranded until
        // unrelated activity. dispatch() is a no-op after shutdown / non-enforce.
        this.dispatch();
    }
    failQueued(entry, code, message) {
        this.clearEntryTimer(entry);
        this.detachAbort(entry);
        entry.payload.reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdmissionRejectError"])(code, message));
        this.rejectedCount += 1;
    }
    dispatch() {
        if (this.shutDown || this.config.mode !== "enforce") return;
        while(this.queue.size > 0){
            const limit = this.adaptation.currentLimit;
            const available = BigInt(limit) - this.activeCost;
            if (available <= 0n) return;
            const entry = this.queue.dequeue(Number(available));
            if (!entry) return;
            this.clearEntryTimer(entry);
            this.detachAbort(entry);
            if (entry.payload.signal?.aborted) {
                entry.payload.reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdmissionRejectError"])("ADMISSION_ABORTED", "request aborted while queued"));
                this.rejectedCount += 1;
                continue;
            }
            if (this.clock.now() >= entry.deadlineMs) {
                entry.payload.reject((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdmissionRejectError"])("ADMISSION_DEADLINE", "admission wait deadline exceeded"));
                this.rejectedCount += 1;
                continue;
            }
            entry.payload.resolve(this.admit(entry.cost));
        }
    }
    releaseVirtual(record) {
        if (record.virtualDisposition === "active") {
            this.virtualActiveCost -= record.cost;
            this.virtualActiveCount -= 1;
        } else if (record.virtualDisposition === "queued") {
            this.virtualQueue.removeById(record.id);
        }
        record.virtualDisposition = "none";
        this.dispatchVirtual();
    }
    dispatchVirtual() {
        while(this.virtualQueue.size > 0){
            const available = this.adaptation.currentLimit - this.virtualActiveCost;
            if (available <= 0) return;
            const entry = this.virtualQueue.dequeue(available);
            if (!entry) return;
            const record = this.active.get(entry.payload.recordId);
            if (!record || record.released) continue;
            record.virtualDisposition = "active";
            this.virtualActiveCost = addSaturated(this.virtualActiveCost, record.cost);
            this.virtualActiveCount = addSaturated(this.virtualActiveCount, 1);
        }
    }
    rebuildVirtualState(enable) {
        this.virtualQueue = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["FairCostQueue"](this.config.maxQueueCount, this.config.maxQueueCost);
        this.virtualActiveCost = 0;
        this.virtualActiveCount = 0;
        for (const record of this.active.values())record.virtualDisposition = "none";
        if (!enable) return;
        for (const record of this.active.values()){
            // Individually oversized work is virtual-rejected, never virtually queued.
            if (record.cost > this.adaptation.currentLimit) {
                record.virtualDisposition = "rejected";
                continue;
            }
            if (record.cost <= this.adaptation.currentLimit - this.virtualActiveCost) {
                record.virtualDisposition = "active";
                this.virtualActiveCost = addSaturated(this.virtualActiveCost, record.cost);
                this.virtualActiveCount = addSaturated(this.virtualActiveCount, 1);
            } else if (this.virtualQueue.enqueue({
                id: record.id,
                tenantKey: "_existing",
                cost: record.cost,
                enqueuedAtMs: record.admittedAtMs,
                deadlineMs: Number.MAX_SAFE_INTEGER,
                payload: {
                    recordId: record.id
                }
            })) {
                record.virtualDisposition = "queued";
            } else {
                record.virtualDisposition = "rejected";
            }
        }
    }
    reject(code, message) {
        this.rejectedCount += 1;
        return {
            status: "rejected",
            code,
            message
        };
    }
    clearEntryTimer(entry) {
        if (entry.timerId !== undefined) {
            this.clock.clearTimer(entry.timerId);
            entry.timerId = undefined;
        }
    }
    detachAbort(entry) {
        if (entry.payload.signal && entry.payload.onAbort) {
            entry.payload.signal.removeEventListener("abort", entry.payload.onAbort);
            entry.payload.onAbort = undefined;
        }
    }
    sampleIntegral() {
        const now = this.clock.now();
        const dt = now - this.lastSampleMs;
        if (dt > 0) {
            // Cap at currentLimit before Number conversion so shadow oversubscription never
            // feeds an unsafe rounded activeCost into the utilization integral.
            const limit = this.adaptation.currentLimit;
            const activeForIntegral = this.activeCost >= BigInt(limit) ? limit : Number(this.activeCost);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$adaptation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sampleActiveIntegral"])(this.adaptation, activeForIntegral, dt);
            this.lastSampleMs = now;
        }
    }
    armWindowTimer() {
        if (this.windowTimer !== undefined) {
            this.clock.clearTimer(this.windowTimer);
            this.windowTimer = undefined;
        }
        if (this.shutDown || this.config.mode === "off") return;
        const tick = ()=>{
            this.tick();
            if (!this.shutDown && this.config.mode !== "off") {
                this.windowTimer = this.clock.setTimer(tick, this.config.windowMs);
            }
        };
        this.windowTimer = this.clock.setTimer(tick, this.config.windowMs);
    }
}
}),
"[project]/open-sse/utils/estimateSize.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Fast object-tree size estimator — walks without JSON.stringify / toJSON / clone.
 * Safe for circular references (WeakSet). Iterative frames only (no recursive call stack).
 *
 * Budgets:
 * - ESTIMATE_SIZE_BYTE_LIMIT (256 KiB): early-exit once counted bytes exceed the limit
 * - ESTIMATE_SIZE_NODE_BUDGET: max value visits (containers + primitives/elements)
 *
 * Arrays are walked by index frame (never pre-push/copy every element reference).
 * Plain objects yield own enumerable values incrementally (no Object.keys materialization).
 * Node-budget exhaustion returns a value strictly above 256 KiB so callers fail closed.
 */ /** Byte early-exit threshold (256 KiB). */ __turbopack_context__.s([
    "ESTIMATE_SIZE_BYTE_LIMIT",
    ()=>ESTIMATE_SIZE_BYTE_LIMIT,
    "ESTIMATE_SIZE_NODE_BUDGET",
    ()=>ESTIMATE_SIZE_NODE_BUDGET,
    "estimateSizeFast",
    ()=>estimateSizeFast,
    "isSmallEnoughForSemanticCache",
    ()=>isSmallEnoughForSemanticCache
]);
const ESTIMATE_SIZE_BYTE_LIMIT = 262_144;
const ESTIMATE_SIZE_NODE_BUDGET = 16_384;
function ownEnumerableKeyIterator(obj) {
    return function* ownEnumerableKeys() {
        for(const key in obj){
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                yield key;
            }
        }
    }();
}
/** @returns next byte total, or a value > limit when the limit is exceeded. */ function addPrimitiveBytes(bytes, v) {
    if (typeof v === "string") return bytes + v.length;
    if (typeof v === "number") return bytes + 8;
    return bytes + 4;
}
function enqueueContainer(stack, obj, seen) {
    if (seen.has(obj)) return;
    seen.add(obj);
    if (Array.isArray(obj)) {
        if (obj.length > 0) stack.push({
            t: "a",
            a: obj,
            i: 0
        });
        return;
    }
    stack.push({
        t: "o",
        o: obj,
        it: ownEnumerableKeyIterator(obj)
    });
}
function isValueFrame(frame) {
    return frame.t === "v";
}
/** Expand a container frame into the next child value. */ function expandContainerFrame(stack, frame) {
    if (frame.t === "a") {
        if (frame.i >= frame.a.length) return;
        if (frame.i + 1 < frame.a.length) {
            stack.push({
                t: "a",
                a: frame.a,
                i: frame.i + 1
            });
        }
        stack.push({
            t: "v",
            v: frame.a[frame.i]
        });
        return;
    }
    const next = frame.it.next();
    if (next.done) return;
    stack.push(frame);
    stack.push({
        t: "v",
        v: frame.o[next.value]
    });
}
function estimateSizeFast(value) {
    let bytes = 0;
    let visitsLeft = ESTIMATE_SIZE_NODE_BUDGET;
    const seen = new WeakSet();
    const stack = [
        {
            t: "v",
            v: value
        }
    ];
    while(stack.length > 0){
        if (visitsLeft <= 0) return ESTIMATE_SIZE_BYTE_LIMIT + 1;
        const frame = stack.pop();
        if (!isValueFrame(frame)) {
            expandContainerFrame(stack, frame);
            continue;
        }
        visitsLeft -= 1;
        const v = frame.v;
        if (v === null || v === undefined) continue;
        const ty = typeof v;
        if (ty === "string" || ty === "number" || ty === "boolean") {
            bytes = addPrimitiveBytes(bytes, v);
            if (bytes > ESTIMATE_SIZE_BYTE_LIMIT) return bytes;
            continue;
        }
        if (ty === "object") {
            enqueueContainer(stack, v, seen);
        }
    }
    return bytes;
}
function isSmallEnoughForSemanticCache(value) {
    return estimateSizeFast(value) <= 256 * 1024;
}
}),
"[project]/open-sse/services/admission/requestFeatures.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMISSION_TOOL_SCAN_BUDGET",
    ()=>ADMISSION_TOOL_SCAN_BUDGET,
    "extractAdmissionCostFeatures",
    ()=>extractAdmissionCostFeatures
]);
/**
 * Cheap bounded admission cost features from an already-parsed request body.
 * Never re-parses, stringifies, clones, or invokes toJSON.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$estimateSize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/estimateSize.ts [app-route] (ecmascript)");
;
const ADMISSION_TOOL_SCAN_BUDGET = 64;
function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function asArray(value) {
    return Array.isArray(value) ? value : null;
}
function positiveInt(value) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
    if (!Number.isSafeInteger(value)) {
        return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value));
    }
    return value;
}
function saturateCount(n) {
    if (!Number.isFinite(n) || n <= 0) return 0;
    if (!Number.isSafeInteger(n)) {
        return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(n));
    }
    return n;
}
/**
 * Count all recognized tool aliases/layers under one shared entry budget.
 * If their combined length cannot be inspected completely, saturate before indexed access
 * so an unseen alias or wrapped tail cannot undercharge heavier declarations.
 */ function countTools(layers) {
    const sources = [];
    const seen = new Set();
    for (const layer of layers){
        for (const value of [
            layer.tools,
            layer.functions
        ]){
            const source = asArray(value);
            if (!source || seen.has(source)) continue;
            seen.add(source);
            sources.push(source);
        }
    }
    let entryCount = 0;
    for (const source of sources){
        if (source.length > ADMISSION_TOOL_SCAN_BUDGET - entryCount) {
            return Number.MAX_SAFE_INTEGER;
        }
        entryCount += source.length;
    }
    let total = 0;
    for (const source of sources){
        for(let i = 0; i < source.length; i++){
            const entry = source[i];
            if (isPlainObject(entry)) {
                const declarations = asArray(entry.functionDeclarations);
                if (declarations) {
                    total = Math.min(Number.MAX_SAFE_INTEGER, total + saturateCount(declarations.length));
                    continue;
                }
            }
            total = Math.min(Number.MAX_SAFE_INTEGER, total + 1);
        }
    }
    return total;
}
function countMessages(layer) {
    const messages = asArray(layer.messages);
    const contents = asArray(layer.contents);
    const inputArr = asArray(layer.input);
    let count = Math.max(saturateCount(messages?.length ?? 0), saturateCount(contents?.length ?? 0), saturateCount(inputArr?.length ?? 0));
    // Responses API: non-empty string `input` is one input item.
    if (count === 0 && typeof layer.input === "string" && layer.input.length > 0) {
        count = 1;
    }
    return count;
}
function readFanout(layer) {
    const direct = positiveInt(layer.n) ?? positiveInt(layer.candidateCount) ?? positiveInt(layer.candidate_count);
    if (direct != null) return direct;
    // Known nested Gemini/Antigravity shape only — no recursive walk.
    if (isPlainObject(layer.generationConfig)) {
        return positiveInt(layer.generationConfig.candidateCount) ?? positiveInt(layer.generationConfig.candidate_count);
    }
    return null;
}
function featureLayers(body) {
    const top = isPlainObject(body) ? body : null;
    const wrapped = top && isPlainObject(top.request) ? top.request : null;
    const layers = [];
    if (top) layers.push(top);
    if (wrapped) layers.push(wrapped);
    return layers;
}
function absorbLayer(draft, layer) {
    if (draft.messageCount === 0) {
        draft.messageCount = countMessages(layer);
    }
    if (draft.requestedFanout == null) {
        draft.requestedFanout = readFanout(layer);
    }
    if (draft.streaming == null && "stream" in layer) {
        draft.streaming = layer.stream === true;
    }
}
function resolveStreaming(draftStreaming, context) {
    if (context && "streaming" in context && context.streaming !== undefined) {
        return context.streaming === true;
    }
    return draftStreaming ?? false;
}
function extractAdmissionCostFeatures(body, context) {
    const bodyBytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$estimateSize$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateSizeFast"])(body);
    const layers = featureLayers(body);
    const draft = {
        messageCount: 0,
        toolCount: countTools(layers),
        requestedFanout: null,
        streaming: null
    };
    for (const layer of layers){
        absorbLayer(draft, layer);
    }
    // Conservative token estimate from already-measured body size (no re-walk/stringify).
    const estimatedInputTokens = bodyBytes > 0 ? Math.min(Number.MAX_SAFE_INTEGER, Math.ceil(bodyBytes / 4)) : 0;
    return {
        bodyBytes,
        estimatedInputTokens,
        messageCount: draft.messageCount,
        toolCount: draft.toolCount,
        requestedFanout: draft.requestedFanout ?? 1,
        streaming: resolveStreaming(draft.streaming, context)
    };
}
}),
"[project]/open-sse/utils/cors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Static CORS headers for open-sse handlers.
 *
 * `Access-Control-Allow-Origin` is set by the Next.js middleware
 * (`src/server/cors/origins.ts`). Handlers in this package only need the
 * methods/headers list; the middleware overlays the allowed origin per
 * the central allowlist on the way out.
 */ __turbopack_context__.s([
    "CORS_HEADERS",
    ()=>CORS_HEADERS
]);
const CORS_HEADERS = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, anthropic-version, x-omniroute-connection, x-internal-test, accept"
};
}),
"[externals]/node:v8 [external] (node:v8, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:v8", () => require("node:v8"));

module.exports = mod;
}),
"[project]/open-sse/utils/heapPressure.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HEAP_PRESSURE_THRESHOLD_MB",
    ()=>HEAP_PRESSURE_THRESHOLD_MB,
    "checkHeapPressureGuard",
    ()=>checkHeapPressureGuard,
    "computeHeapPressureThresholdMb",
    ()=>computeHeapPressureThresholdMb
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$v8__$5b$external$5d$__$28$node$3a$v8$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:v8 [external] (node:v8, cjs)");
;
function computeHeapPressureThresholdMb(heapSizeLimitMb, override) {
    const explicit = Number(override);
    if (Number.isFinite(explicit) && explicit > 0) return Math.floor(explicit);
    // Shed at 85% of the heap ceiling, but never below a floor that clears the
    // runtime's own ~260 MB baseline (+ margin) so an undersized heap degrades to
    // "guard never fires" rather than "guard rejects everything".
    const SHED_RATIO = 0.85;
    const FLOOR_MB = 400;
    return Math.max(Math.round(heapSizeLimitMb * SHED_RATIO), FLOOR_MB);
}
const HEAP_PRESSURE_THRESHOLD_MB = computeHeapPressureThresholdMb(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$v8__$5b$external$5d$__$28$node$3a$v8$2c$__cjs$29$__["default"].getHeapStatistics().heap_size_limit / (1024 * 1024), process.env.HEAP_PRESSURE_THRESHOLD_MB);
const HEAP_PRESSURE_MESSAGE = "Service temporarily unavailable due to resource pressure. Retry shortly.";
function checkHeapPressureGuard(heapUsedMb, thresholdMb = HEAP_PRESSURE_THRESHOLD_MB) {
    if (heapUsedMb <= thresholdMb) return null;
    console.warn(`[chatCore] heap pressure guard tripped: ${Math.round(heapUsedMb)}MB > ${thresholdMb}MB; returning 503`);
    return {
        success: false,
        status: 503,
        error: HEAP_PRESSURE_MESSAGE,
        response: new Response(JSON.stringify({
            error: {
                message: HEAP_PRESSURE_MESSAGE,
                type: "server_error",
                code: "heap_pressure"
            }
        }), {
            status: 503,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": "5"
            }
        })
    };
}
}),
"[project]/open-sse/utils/resourcePressurePolicy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_RESOURCE_PRESSURE_THRESHOLDS",
    ()=>DEFAULT_RESOURCE_PRESSURE_THRESHOLDS,
    "classifyAdaptiveResourcePressure",
    ()=>classifyAdaptiveResourcePressure,
    "createResourcePressureTracker",
    ()=>createResourcePressureTracker,
    "resolveResourcePressureThresholds",
    ()=>resolveResourcePressureThresholds
]);
const MB = 1024 * 1024;
const MAX_SUSTAINED_SAMPLES = 10_000;
const DEFAULT_RESOURCE_PRESSURE_THRESHOLDS = {
    highRatio: 0.85,
    criticalRatio: 0.92,
    recoveryRatio: 0.75,
    highPsiAvg10: 20,
    criticalPsiAvg10: 40,
    recoveryPsiAvg10: 10,
    sustainedSamplesHigh: 2,
    sustainedSamplesCritical: 2,
    sustainedSamplesRecovery: 3,
    heapAbsoluteThresholdMb: null
};
function requireFiniteRange(name, value, minimum, maximum) {
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
        throw new RangeError(`${name} must be finite and between ${minimum} and ${maximum}`);
    }
}
function requirePositiveInteger(name, value) {
    if (!Number.isInteger(value) || value < 1 || value > MAX_SUSTAINED_SAMPLES) {
        throw new RangeError(`${name} must be an integer between 1 and ${MAX_SUSTAINED_SAMPLES}`);
    }
}
function resolveResourcePressureThresholds(partial = {}) {
    const resolved = {
        ...DEFAULT_RESOURCE_PRESSURE_THRESHOLDS,
        ...partial
    };
    requireFiniteRange("recoveryRatio", resolved.recoveryRatio, 0, 1);
    requireFiniteRange("highRatio", resolved.highRatio, 0, 1);
    requireFiniteRange("criticalRatio", resolved.criticalRatio, 0, 1);
    if (!(resolved.recoveryRatio < resolved.highRatio && resolved.highRatio < resolved.criticalRatio)) {
        throw new RangeError("ratio thresholds must satisfy recovery < high < critical");
    }
    requireFiniteRange("recoveryPsiAvg10", resolved.recoveryPsiAvg10, 0, 100);
    requireFiniteRange("highPsiAvg10", resolved.highPsiAvg10, 0, 100);
    requireFiniteRange("criticalPsiAvg10", resolved.criticalPsiAvg10, 0, 100);
    if (!(resolved.recoveryPsiAvg10 < resolved.highPsiAvg10 && resolved.highPsiAvg10 < resolved.criticalPsiAvg10)) {
        throw new RangeError("PSI thresholds must satisfy recovery < high < critical");
    }
    requirePositiveInteger("sustainedSamplesHigh", resolved.sustainedSamplesHigh);
    requirePositiveInteger("sustainedSamplesCritical", resolved.sustainedSamplesCritical);
    requirePositiveInteger("sustainedSamplesRecovery", resolved.sustainedSamplesRecovery);
    if (resolved.heapAbsoluteThresholdMb !== null && (!Number.isFinite(resolved.heapAbsoluteThresholdMb) || resolved.heapAbsoluteThresholdMb <= 0)) {
        throw new RangeError("heapAbsoluteThresholdMb must be positive and finite or null");
    }
    return resolved;
}
function severityRank(severity) {
    return severity === "critical" ? 2 : severity === "high" ? 1 : 0;
}
function maxLevel(current, candidate) {
    if (!candidate || severityRank(candidate.severity) <= severityRank(current.severity)) {
        return current;
    }
    return candidate;
}
function ratioLevel(used, limit, thresholds, reason) {
    if (used == null || limit == null || used < 0 || limit <= 0) return null;
    const ratio = used / limit;
    if (ratio >= thresholds.criticalRatio) return {
        severity: "critical",
        reason
    };
    if (ratio >= thresholds.highRatio) return {
        severity: "high",
        reason
    };
    return null;
}
function psiLevel(value, thresholds, reason) {
    if (value == null || !Number.isFinite(value)) return null;
    if (value >= thresholds.criticalPsiAvg10) return {
        severity: "critical",
        reason
    };
    if (value >= thresholds.highPsiAvg10) return {
        severity: "high",
        reason
    };
    return null;
}
function classifyAdaptiveResourcePressure(signals, thresholds) {
    let best = {
        severity: "normal",
        reason: "none"
    };
    best = maxLevel(best, ratioLevel(signals.v8.heapUsedBytes, signals.v8.heapLimitBytes, thresholds, "v8_heap_ratio"));
    best = maxLevel(best, ratioLevel(signals.cgroup.currentBytes, signals.cgroup.maxBytes, thresholds, "cgroup_ratio"));
    best = maxLevel(best, ratioLevel(signals.cgroup.currentBytes, signals.cgroup.highBytes, thresholds, "cgroup_high"));
    best = maxLevel(best, psiLevel(signals.psi?.someAvg10 ?? null, thresholds, "psi_some"));
    return maxLevel(best, psiLevel(signals.psi?.fullAvg10 ?? null, thresholds, "psi_full"));
}
function isRecovered(signals, thresholds) {
    const ratios = [
        [
            signals.v8.heapUsedBytes,
            signals.v8.heapLimitBytes
        ],
        [
            signals.cgroup.currentBytes,
            signals.cgroup.maxBytes
        ],
        [
            signals.cgroup.currentBytes,
            signals.cgroup.highBytes
        ]
    ];
    if (ratios.some(([used, limit])=>used != null && limit != null && limit > 0 && used / limit > thresholds.recoveryRatio)) {
        return false;
    }
    if (thresholds.heapAbsoluteThresholdMb != null && signals.v8.heapUsedBytes / MB > thresholds.heapAbsoluteThresholdMb * thresholds.recoveryRatio) {
        return false;
    }
    return ![
        signals.psi?.someAvg10,
        signals.psi?.fullAvg10
    ].some((value)=>value != null && value > thresholds.recoveryPsiAvg10);
}
function hasCounterIncrease(previous, current) {
    return previous.oom != null && current.oom != null && current.oom > previous.oom || previous.oomKill != null && current.oomKill != null && current.oomKill > previous.oomKill;
}
function countersReset(previous, current) {
    return previous.oom != null && current.oom != null && current.oom < previous.oom || previous.oomKill != null && current.oomKill != null && current.oomKill < previous.oomKill;
}
function initialState() {
    return {
        severity: "normal",
        reason: "none",
        elevatedStreak: 0,
        recoveryStreak: 0,
        lastTransitionAtMs: 0,
        observedAtMs: 0
    };
}
function createResourcePressureTracker(partialThresholds = {}) {
    const thresholds = resolveResourcePressureThresholds(partialThresholds);
    let state = initialState();
    let pending = null;
    let previousOom = null;
    return {
        observe (signals) {
            const events = signals.cgroup.events;
            const currentOom = events ? {
                oom: events.oom,
                oomKill: events.oom_kill
            } : null;
            let oomEvent = false;
            if (currentOom) {
                if (previousOom && !countersReset(previousOom, currentOom)) {
                    oomEvent = hasCounterIncrease(previousOom, currentOom);
                }
                previousOom = currentOom;
            } else {
                previousOom = null;
            }
            const raw = oomEvent ? {
                severity: "critical",
                reason: "oom_event"
            } : classifyAdaptiveResourcePressure(signals, thresholds);
            let { severity, reason, elevatedStreak, recoveryStreak } = state;
            if (oomEvent) {
                severity = "critical";
                reason = "oom_event";
                elevatedStreak = 0;
                recoveryStreak = 0;
                pending = null;
            } else if (severity === "normal") {
                recoveryStreak = 0;
                if (raw.severity === "normal") {
                    pending = null;
                    elevatedStreak = 0;
                    reason = "none";
                } else {
                    const samePending = pending?.severity === raw.severity && pending.reason === raw.reason;
                    pending = raw;
                    elevatedStreak = samePending ? elevatedStreak + 1 : 1;
                    const needed = raw.severity === "critical" ? thresholds.sustainedSamplesCritical : thresholds.sustainedSamplesHigh;
                    if (elevatedStreak >= needed) {
                        severity = raw.severity;
                        reason = raw.reason;
                        elevatedStreak = 0;
                        pending = null;
                    }
                }
            } else if (severity === "high" && raw.severity === "critical") {
                recoveryStreak = 0;
                const samePending = pending?.severity === "critical" && pending.reason === raw.reason;
                pending = raw;
                elevatedStreak = samePending ? elevatedStreak + 1 : 1;
                if (elevatedStreak >= thresholds.sustainedSamplesCritical) {
                    severity = "critical";
                    reason = raw.reason;
                    elevatedStreak = 0;
                    pending = null;
                }
            } else if (raw.severity === severity) {
                reason = raw.reason;
                pending = null;
                elevatedStreak = 0;
                recoveryStreak = 0;
            } else if (isRecovered(signals, thresholds)) {
                pending = null;
                elevatedStreak = 0;
                recoveryStreak += 1;
                if (recoveryStreak >= thresholds.sustainedSamplesRecovery) {
                    severity = "normal";
                    reason = "none";
                    recoveryStreak = 0;
                }
            } else {
                pending = null;
                elevatedStreak = 0;
                recoveryStreak = 0;
            }
            const transitioned = severity !== state.severity || reason !== state.reason;
            state = {
                severity,
                reason,
                elevatedStreak,
                recoveryStreak,
                lastTransitionAtMs: transitioned ? signals.observedAtMs : state.lastTransitionAtMs,
                observedAtMs: signals.observedAtMs
            };
            return state;
        },
        getState: ()=>state
    };
}
}),
"[project]/open-sse/utils/resourcePressureSampler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeMountInfoPath",
    ()=>decodeMountInfoPath,
    "parseCgroup2Mount",
    ()=>parseCgroup2Mount,
    "parseCgroupV2Path",
    ()=>parseCgroupV2Path,
    "resolveCgroupDirectory",
    ()=>resolveCgroupDirectory,
    "sampleResourceSignals",
    ()=>sampleResourceSignals,
    "sanitizeMemoryBytes",
    ()=>sanitizeMemoryBytes
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$v8__$5b$external$5d$__$28$node$3a$v8$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:v8 [external] (node:v8, cjs)");
;
;
;
const DEFAULT_CGROUP_ROOT = "/sys/fs/cgroup";
async function defaultReadText(filePath) {
    try {
        return await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(filePath, "utf8");
    } catch  {
        return null;
    }
}
function sanitizeMemoryBytes(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed || trimmed === "max" || !/^\d+$/.test(trimmed) || trimmed.length > 15) {
            return null;
        }
        value = Number(trimmed);
    }
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
    if (value >= Number.MAX_SAFE_INTEGER) return null;
    return Math.floor(value);
}
function safeNumber(call) {
    try {
        return call ? sanitizeMemoryBytes(call()) : null;
    } catch  {
        return null;
    }
}
function decodeMountInfoPath(value) {
    if (value.includes("\0")) return null;
    try {
        return value.replace(/\\([0-7]{3})/g, (_match, octal)=>String.fromCharCode(Number.parseInt(octal, 8)));
    } catch  {
        return null;
    }
}
function parseCgroupV2Path(contents) {
    if (!contents) return null;
    for (const rawLine of contents.split("\n")){
        const line = rawLine.trim();
        if (!line.startsWith("0::")) continue;
        const relativePath = line.slice(3);
        if (!relativePath.startsWith("/") || relativePath.includes("\0")) return null;
        return relativePath;
    }
    return null;
}
function parseCgroup2Mount(contents) {
    if (!contents) return null;
    for (const rawLine of contents.split("\n")){
        const separator = rawLine.indexOf(" - ");
        if (separator < 0) continue;
        const left = rawLine.slice(0, separator).trim().split(/\s+/);
        const right = rawLine.slice(separator + 3).trim().split(/\s+/);
        if (right[0] !== "cgroup2" || left.length < 5) continue;
        const root = decodeMountInfoPath(left[3]);
        const mountpoint = decodeMountInfoPath(left[4]);
        if (!root?.startsWith("/") || !mountpoint?.startsWith("/")) return null;
        return {
            root,
            mountpoint
        };
    }
    return null;
}
function isContained(root, candidate) {
    const relative = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].relative(root, candidate);
    return relative === "" || !relative.startsWith("..") && !__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].isAbsolute(relative);
}
function hasTraversalSegment(value) {
    let decoded = value;
    try {
        decoded = decodeURIComponent(value);
    } catch  {
        return true;
    }
    return decoded.split("/").some((segment)=>segment === ".." || segment === ".");
}
function resolveFromMount(cgroupPath, mount) {
    if (cgroupPath.includes("\0") || mount.root.includes("\0") || mount.mountpoint.includes("\0") || hasTraversalSegment(cgroupPath)) {
        return null;
    }
    const resolvedRoot = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(mount.root);
    const resolvedCgroup = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(cgroupPath);
    if (!isContained(resolvedRoot, resolvedCgroup)) return null;
    const suffix = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].relative(resolvedRoot, resolvedCgroup);
    const resolvedMountpoint = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(mount.mountpoint);
    const candidate = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].resolve(resolvedMountpoint, suffix);
    return isContained(resolvedMountpoint, candidate) ? candidate : null;
}
async function resolveCgroupDirectory(readText, options = {}) {
    try {
        const [cgroupContents, mountInfo] = await Promise.all([
            readText("/proc/self/cgroup"),
            readText("/proc/self/mountinfo")
        ]);
        const cgroupPath = parseCgroupV2Path(cgroupContents);
        const mount = parseCgroup2Mount(mountInfo);
        if (cgroupPath && mount) {
            const candidate = resolveFromMount(cgroupPath, mount);
            if (candidate && await readText(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(candidate, "memory.current")) != null) {
                return candidate;
            }
            if (!candidate) return null;
        }
        if (options.allowDefaultFallback === false) return null;
        return await readText(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(DEFAULT_CGROUP_ROOT, "memory.current")) != null ? DEFAULT_CGROUP_ROOT : null;
    } catch  {
        return null;
    }
}
function parseEventCounter(value) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) && parsed >= 0 && parsed < Number.MAX_SAFE_INTEGER ? Math.floor(parsed) : null;
}
function parseMemoryEvents(text) {
    if (!text) return null;
    const values = {
        low: null,
        high: null,
        max: null,
        oom: null,
        oom_kill: null
    };
    let matched = false;
    for (const line of text.split("\n")){
        const [key, rawValue] = line.trim().split(/\s+/, 2);
        if (!(key in values) || rawValue == null) continue;
        values[key] = parseEventCounter(rawValue);
        matched = true;
    }
    return matched ? values : null;
}
function parsePsiNumber(line, name) {
    const match = new RegExp(`(?:^|\\s)${name}=([0-9.]+)`).exec(line);
    const parsed = match ? Number(match[1]) : Number.NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
function parsePsi(text) {
    if (!text) return null;
    const result = {
        someAvg10: null,
        someAvg60: null,
        someAvg300: null,
        fullAvg10: null,
        fullAvg60: null,
        fullAvg300: null
    };
    let matched = false;
    for (const line of text.split("\n")){
        const kind = line.startsWith("some ") ? "some" : line.startsWith("full ") ? "full" : null;
        if (!kind) continue;
        result[`${kind}Avg10`] = parsePsiNumber(line, "avg10");
        result[`${kind}Avg60`] = parsePsiNumber(line, "avg60");
        result[`${kind}Avg300`] = parsePsiNumber(line, "avg300");
        matched = true;
    }
    return matched ? result : null;
}
async function sampleResourceSignals(deps = {}) {
    const readText = deps.fs?.readText ?? defaultReadText;
    let memory;
    try {
        memory = (deps.memoryUsage ?? process.memoryUsage)();
    } catch  {
        memory = {
            rss: 0,
            heapTotal: 0,
            heapUsed: 0,
            external: 0,
            arrayBuffers: 0
        };
    }
    let heapUsed = Math.max(0, Math.floor(memory.heapUsed || 0));
    let heapLimit = 0;
    try {
        const heap = (deps.heapStatistics ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$v8__$5b$external$5d$__$28$node$3a$v8$2c$__cjs$29$__["default"].getHeapStatistics)();
        heapLimit = sanitizeMemoryBytes(heap.heap_size_limit) ?? 0;
        if (Number.isFinite(heap.used_heap_size)) {
            heapUsed = Math.max(0, Math.floor(heap.used_heap_size ?? heapUsed));
        }
    } catch  {
    /* retain process heap sample */ }
    const cgroupDirectory = await resolveCgroupDirectory(readText);
    const cgroupContents = cgroupDirectory ? await Promise.all([
        readText(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(cgroupDirectory, "memory.current")),
        readText(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(cgroupDirectory, "memory.max")),
        readText(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(cgroupDirectory, "memory.high")),
        readText(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(cgroupDirectory, "memory.events"))
    ]) : [
        null,
        null,
        null,
        null
    ];
    const psi = await readText("/proc/pressure/memory").catch(()=>null);
    return {
        observedAtMs: (deps.nowMs ?? Date.now)(),
        v8: {
            heapUsedBytes: heapUsed,
            heapLimitBytes: heapLimit
        },
        process: {
            rssBytes: Math.max(0, Math.floor(memory.rss || 0)),
            externalBytes: Math.max(0, Math.floor(memory.external || 0)),
            arrayBuffersBytes: Math.max(0, Math.floor(memory.arrayBuffers || 0)),
            availableBytes: safeNumber(deps.availableMemory ?? (()=>process.availableMemory?.())),
            constrainedBytes: safeNumber(deps.constrainedMemory ?? (()=>process.constrainedMemory?.()))
        },
        cgroup: {
            currentBytes: sanitizeMemoryBytes(cgroupContents[0]),
            maxBytes: sanitizeMemoryBytes(cgroupContents[1]),
            highBytes: sanitizeMemoryBytes(cgroupContents[2]),
            events: parseMemoryEvents(cgroupContents[3])
        },
        psi: parsePsi(psi)
    };
}
}),
"[project]/open-sse/utils/resourcePressure.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkResourcePressureGuard",
    ()=>checkResourcePressureGuard,
    "createResourcePressureRuntime",
    ()=>createResourcePressureRuntime,
    "getResourcePressureObservation",
    ()=>getResourcePressureObservation,
    "reloadResourcePressureRuntime",
    ()=>reloadResourcePressureRuntime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$heapPressure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/heapPressure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressurePolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/resourcePressurePolicy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressureSampler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/resourcePressureSampler.ts [app-route] (ecmascript)");
;
;
;
;
const MB = 1024 * 1024;
const RETRY_AFTER_SECONDS = "5";
const PRESSURE_MESSAGE = "Service temporarily unavailable due to resource pressure. Retry shortly.";
function emptyState() {
    return {
        severity: "normal",
        reason: "none",
        elevatedStreak: 0,
        recoveryStreak: 0,
        lastTransitionAtMs: 0,
        observedAtMs: 0
    };
}
function requireDuration(name, value) {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0 || value > 3_600_000) {
        throw new RangeError(`${name} must be an integer between 0 and 3600000`);
    }
    return value;
}
function buildCriticalGuard(reason) {
    console.warn(`[resourcePressure] critical pressure guard tripped (reason=${reason}); returning 503`);
    return {
        success: false,
        status: 503,
        error: PRESSURE_MESSAGE,
        response: new Response(JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(503, PRESSURE_MESSAGE, undefined, {
            type: "server_error",
            code: "resource_pressure"
        })), {
            status: 503,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": RETRY_AFTER_SECONDS
            }
        })
    };
}
function immediateHeapGuard(heapUsedMb, thresholdMb) {
    if (thresholdMb == null) return null;
    const guard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$heapPressure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkHeapPressureGuard"])(heapUsedMb, thresholdMb);
    if (!guard) return null;
    return buildCriticalGuard("v8_heap_absolute");
}
function createResourcePressureRuntime(options = {}) {
    const heapThresholdMb = options.heapThresholdMb === undefined ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$heapPressure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HEAP_PRESSURE_THRESHOLD_MB"] : options.heapThresholdMb;
    if (heapThresholdMb !== null && (!Number.isFinite(heapThresholdMb) || heapThresholdMb <= 0)) {
        throw new RangeError("heapThresholdMb must be positive and finite or null");
    }
    const thresholds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressurePolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResourcePressureThresholds"])({
        ...options.thresholds,
        heapAbsoluteThresholdMb: options.thresholds?.heapAbsoluteThresholdMb === undefined ? null : options.thresholds.heapAbsoluteThresholdMb
    });
    const staleAfterMs = requireDuration("staleAfterMs", options.staleAfterMs ?? 1_000);
    const maxStaleMs = requireDuration("maxStaleMs", options.maxStaleMs ?? 30_000);
    const retryAfterMs = requireDuration("retryAfterMs", options.retryAfterMs ?? 1_000);
    if (maxStaleMs < staleAfterMs) {
        throw new RangeError("maxStaleMs must be greater than or equal to staleAfterMs");
    }
    const nowMs = options.nowMs ?? Date.now;
    const immediateHeapUsedMb = options.immediateHeapUsedMb ?? (()=>process.memoryUsage().heapUsed / MB);
    const sample = options.sample ?? (()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressureSampler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sampleResourceSignals"])(options.samplerDeps));
    const schedule = options.schedule ?? ((refresh)=>{
        const handle = setImmediate(refresh);
        handle.unref();
    });
    const tracker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressurePolicy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createResourcePressureTracker"])(thresholds);
    let lastSignals = null;
    let state = emptyState();
    let lastRefreshAtMs = Number.NEGATIVE_INFINITY;
    let nextRefreshAtMs = Number.NEGATIVE_INFINITY;
    let scheduled = false;
    let inFlight = null;
    let disposed = false;
    const refresh = ()=>{
        if (disposed || inFlight) return;
        scheduled = false;
        inFlight = Promise.resolve().then(sample).then((signals)=>{
            if (disposed) return;
            const settledAtMs = nowMs();
            lastSignals = signals;
            state = tracker.observe(signals);
            lastRefreshAtMs = settledAtMs;
            nextRefreshAtMs = settledAtMs + staleAfterMs;
        }).catch(()=>{
            if (!disposed) nextRefreshAtMs = nowMs() + retryAfterMs;
        }).finally(()=>{
            inFlight = null;
        });
    };
    const scheduleRefresh = ()=>{
        if (disposed || scheduled || inFlight) return;
        scheduled = true;
        schedule(refresh);
    };
    return {
        check () {
            let heapUsedMb = 0;
            try {
                heapUsedMb = immediateHeapUsedMb();
            } catch  {
                heapUsedMb = 0;
            }
            const immediate = immediateHeapGuard(heapUsedMb, heapThresholdMb);
            const now = nowMs();
            if (now >= nextRefreshAtMs) scheduleRefresh();
            if (immediate) {
                state = {
                    severity: "critical",
                    reason: "v8_heap_absolute",
                    elevatedStreak: 0,
                    recoveryStreak: 0,
                    lastTransitionAtMs: now,
                    observedAtMs: now
                };
                return immediate;
            }
            const cacheAge = lastSignals ? Math.max(0, now - lastRefreshAtMs) : Number.POSITIVE_INFINITY;
            return cacheAge <= maxStaleMs && state.severity === "critical" ? buildCriticalGuard(state.reason) : null;
        },
        getObservation: ()=>({
                signals: lastSignals,
                state
            }),
        whenRefreshSettled: async ()=>{
            if (scheduled) await new Promise((resolve)=>setImmediate(resolve));
            if (inFlight) await inFlight;
        },
        dispose () {
            disposed = true;
            scheduled = false;
        }
    };
}
let defaultRuntime = createResourcePressureRuntime();
function checkResourcePressureGuard() {
    return defaultRuntime.check();
}
function getResourcePressureObservation() {
    return defaultRuntime.getObservation();
}
function reloadResourcePressureRuntime(options = {}) {
    defaultRuntime.dispose();
    defaultRuntime = createResourcePressureRuntime(options);
    return defaultRuntime;
}
;
;
}),
"[project]/open-sse/services/admission/runtime.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_ADAPTIVE_ADMISSION_CONFIG",
    ()=>DEFAULT_ADAPTIVE_ADMISSION_CONFIG,
    "createAdaptiveAdmissionRuntime",
    ()=>createAdaptiveAdmissionRuntime,
    "getAdaptiveAdmissionRuntime",
    ()=>getAdaptiveAdmissionRuntime,
    "reloadAdaptiveAdmissionRuntime",
    ()=>reloadAdaptiveAdmissionRuntime,
    "resetAdaptiveAdmissionRuntimeForTests",
    ()=>resetAdaptiveAdmissionRuntimeForTests,
    "resolveAdaptiveAdmissionConfigFromEnv",
    ()=>resolveAdaptiveAdmissionConfigFromEnv
]);
/**
 * Process-local adaptive admission runtime facade around the pure controller.
 * No HTTP route wiring — suitable for later shared handleChat integration.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$controller$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/admission/controller.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/admission/config.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$requestFeatures$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/admission/requestFeatures.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/utils/resourcePressure.ts [app-route] (ecmascript) <locals>");
;
;
;
;
;
;
;
const DEFAULT_ADAPTIVE_ADMISSION_CONFIG = Object.freeze({
    mode: "shadow",
    minLimit: 8,
    initialLimit: 64,
    maxLimit: 1000,
    maxQueueCount: 128,
    maxQueueCost: 2000,
    defaultMaxWaitMs: 5_000,
    windowMs: 1_000
});
const RUNTIME_STORE_KEY = Symbol.for("omniroute.adaptiveAdmission.runtime");
function getRuntimeStore() {
    const globalWithStore = globalThis;
    let store = globalWithStore[RUNTIME_STORE_KEY];
    if (!store) {
        store = {
            runtime: null
        };
        globalWithStore[RUNTIME_STORE_KEY] = store;
    }
    return store;
}
const ENV_KEYS = {
    mode: "ADAPTIVE_ADMISSION_MODE",
    minLimit: "ADAPTIVE_ADMISSION_MIN_LIMIT",
    initialLimit: "ADAPTIVE_ADMISSION_INITIAL_LIMIT",
    maxLimit: "ADAPTIVE_ADMISSION_MAX_LIMIT",
    maxQueueCount: "ADAPTIVE_ADMISSION_MAX_QUEUE_COUNT",
    maxQueueCost: "ADAPTIVE_ADMISSION_MAX_QUEUE_COST",
    defaultMaxWaitMs: "ADAPTIVE_ADMISSION_MAX_WAIT_MS",
    windowMs: "ADAPTIVE_ADMISSION_WINDOW_MS"
};
function parsePositiveSafeInt(name, raw) {
    if (!/^[0-9]+$/.test(raw)) {
        throw new RangeError(`${name} must be a positive safe integer`);
    }
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new RangeError(`${name} must be a positive safe integer`);
    }
    return value;
}
function resolveAdaptiveAdmissionConfigFromEnv(env = process.env) {
    const cfg = {
        ...DEFAULT_ADAPTIVE_ADMISSION_CONFIG
    };
    const modeRaw = env[ENV_KEYS.mode];
    if (modeRaw !== undefined && modeRaw !== "") {
        if (modeRaw !== "off" && modeRaw !== "shadow" && modeRaw !== "enforce") {
            throw new RangeError(`${ENV_KEYS.mode} must be off|shadow|enforce`);
        }
        cfg.mode = modeRaw;
    }
    const intFields = [
        "minLimit",
        "initialLimit",
        "maxLimit",
        "maxQueueCount",
        "maxQueueCost",
        "defaultMaxWaitMs",
        "windowMs"
    ];
    for (const field of intFields){
        const envName = ENV_KEYS[field];
        const raw = env[envName];
        if (raw === undefined || raw === "") continue;
        cfg[field] = parsePositiveSafeInt(envName, raw);
    }
    // Shared pure validation — accept exact documented maxima, reject core-invalid configs.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["validateConfig"])(cfg);
    return cfg;
}
const REJECT_MAP = {
    ADMISSION_ABORTED: {
        status: 499,
        code: "admission_aborted",
        message: "Request aborted"
    },
    ADMISSION_OVERSIZED: {
        status: 503,
        code: "admission_oversized",
        message: "Request too large for current capacity"
    },
    ADMISSION_QUEUE_FULL: {
        status: 503,
        code: "admission_queue_full",
        message: "Service temporarily unavailable",
        retryAfter: "1"
    },
    ADMISSION_DEADLINE: {
        status: 503,
        code: "admission_deadline",
        message: "Service temporarily unavailable",
        retryAfter: "1"
    },
    ADMISSION_SHUTDOWN: {
        status: 503,
        code: "admission_shutdown",
        message: "Service temporarily unavailable"
    },
    ADMISSION_UNAVAILABLE: {
        status: 503,
        code: "admission_unavailable",
        message: "Service temporarily unavailable",
        retryAfter: "1"
    }
};
function isAdmissionRejectError(err) {
    return !!err && typeof err === "object" && err.name === "AdmissionRejectError" && typeof err.code === "string";
}
function buildAdmissionRejectResponse(code) {
    const mapping = REJECT_MAP[code] ?? REJECT_MAP.ADMISSION_UNAVAILABLE;
    const headers = {
        "Content-Type": "application/json",
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
    };
    if (mapping.retryAfter) headers["Retry-After"] = mapping.retryAfter;
    const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(mapping.status, mapping.message, undefined, {
        type: mapping.status === 499 ? "client_disconnected" : "server_error",
        code: mapping.code
    });
    return {
        status: "rejected",
        code: mapping.code,
        response: new Response(JSON.stringify(body), {
            status: mapping.status,
            headers
        })
    };
}
function observationIdentity(state) {
    return `${state.observedAtMs}|${state.severity}|${state.reason}`;
}
function toAdmissionPressure(severity) {
    if (severity === "critical") return "critical";
    if (severity === "high") return "high";
    return "normal";
}
function isSseResponse(response) {
    const contentType = response.headers.get("content-type") ?? "";
    return contentType.toLowerCase().includes("text/event-stream");
}
function releaseOnce(lease, outcome, admittedAtMs, nowMs) {
    if (lease.released) return;
    const latencyMs = admittedAtMs === undefined ? undefined : Math.max(0, nowMs() - admittedAtMs);
    lease.release(outcome, latencyMs === undefined ? undefined : {
        latencyMs
    });
}
/**
 * Map HTTP status (+ optional request signal) to admission release outcome.
 * Cancellation always wins over status classification.
 */ function classifyHttpOutcome(status, signal) {
    if (signal?.aborted || status === 499) return "cancelled";
    if (status === 408 || status === 504) return "timeout";
    if (status >= 500) return "upstream_error";
    if (status >= 400) return "local_reject";
    // 2xx / 3xx (and rare 1xx) complete successfully from admission's perspective.
    return "success";
}
class AdaptiveAdmissionRuntimeImpl {
    controller;
    checkResourcePressure;
    getResourcePressureObservation;
    onPressureObserved;
    nowMs;
    lastObservationKey = null;
    lastResource = {
        severity: "normal",
        reason: "none",
        observedAtMs: 0
    };
    pressureGuardRejectCount = 0;
    disposed = false;
    constructor(options, config){
        this.controller = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$controller$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AdaptiveAdmissionController"](config, options.clock);
        this.checkResourcePressure = options.checkResourcePressure ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkResourcePressureGuard"];
        this.getResourcePressureObservation = options.getResourcePressureObservation ?? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$resourcePressure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getResourcePressureObservation"];
        this.onPressureObserved = options.onPressureObserved;
        this.nowMs = options.nowMs ?? options.clock?.now ?? (()=>Date.now());
    }
    async acquire(input) {
        if (this.disposed) {
            return buildAdmissionRejectResponse("ADMISSION_SHUTDOWN");
        }
        // Independent safety fuse first — never acquire provider work on critical guard.
        // Still feed pressure observations so the controller learns from critical samples.
        let guard = null;
        try {
            guard = this.checkResourcePressure();
        } catch  {
        // Fail open on sampling/check failures.
        }
        this.feedFreshPressureObservation();
        if (guard) {
            this.pressureGuardRejectCount += 1;
            return {
                status: "rejected",
                code: "resource_pressure",
                response: guard.response
            };
        }
        const features = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$requestFeatures$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractAdmissionCostFeatures"])(input.body, input.streaming === undefined ? undefined : {
            streaming: input.streaming
        });
        let result;
        try {
            result = await this.controller.acquire({
                tenantKey: input.tenantKey,
                features,
                signal: input.signal,
                maxWaitMs: input.maxWaitMs
            });
        } catch (err) {
            if (isAdmissionRejectError(err)) {
                return buildAdmissionRejectResponse(err.code);
            }
            return buildAdmissionRejectResponse("ADMISSION_UNAVAILABLE");
        }
        if (result.status === "rejected") {
            return buildAdmissionRejectResponse(result.code);
        }
        if (result.status === "queued") {
            try {
                const admitted = await result.promise;
                return {
                    status: "admitted",
                    mode: this.controller.snapshot().mode,
                    lease: admitted.lease,
                    admittedAtMs: this.nowMs(),
                    shadowDecision: admitted.shadowDecision
                };
            } catch (err) {
                if (isAdmissionRejectError(err)) {
                    return buildAdmissionRejectResponse(err.code);
                }
                return buildAdmissionRejectResponse("ADMISSION_UNAVAILABLE");
            }
        }
        return {
            status: "admitted",
            mode: this.controller.snapshot().mode,
            lease: result.lease,
            admittedAtMs: this.nowMs(),
            shadowDecision: result.shadowDecision
        };
    }
    snapshot() {
        const core = this.controller.snapshot();
        return {
            ...core,
            resourceSeverity: this.lastResource.severity,
            resourceReason: this.lastResource.reason,
            resourceObservedAtMs: this.lastResource.observedAtMs,
            pressureGuardRejectCount: this.pressureGuardRejectCount
        };
    }
    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.controller.shutdown();
    }
    releaseHandlerFailure(lease, outcome, options) {
        releaseOnce(lease, outcome, options?.admittedAtMs, options?.nowMs ?? this.nowMs);
    }
    attachResponseLifecycle(response, lease, options) {
        const nowMs = options.nowMs ?? this.nowMs;
        const admittedAtMs = options.admittedAtMs;
        if (!response.body || !isSseResponse(response)) {
            releaseOnce(lease, classifyHttpOutcome(response.status, options.signal), admittedAtMs, nowMs);
            return response;
        }
        const upstream = response.body;
        const reader = upstream.getReader();
        let settled = false;
        let readerCancelled = false;
        const settle = (outcome)=>{
            if (settled) return;
            settled = true;
            releaseOnce(lease, outcome, admittedAtMs, nowMs);
        };
        const cancelReader = (reason)=>{
            if (readerCancelled) return;
            readerCancelled = true;
            void reader.cancel(reason).catch(()=>{
            /* ignore cancel races */ });
        };
        const onAbort = ()=>{
            cancelReader(options.signal?.reason);
            settle("cancelled");
        };
        if (options.signal) {
            if (options.signal.aborted) {
                onAbort();
            } else {
                options.signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
        }
        const detachAbort = ()=>{
            options.signal?.removeEventListener("abort", onAbort);
        };
        const stream = new ReadableStream({
            async pull (controller) {
                if (settled) {
                    controller.close();
                    return;
                }
                try {
                    const { done, value } = await reader.read();
                    if (done) {
                        detachAbort();
                        settle(classifyHttpOutcome(response.status, options.signal));
                        controller.close();
                        return;
                    }
                    controller.enqueue(value);
                } catch (err) {
                    detachAbort();
                    settle(options.signal?.aborted ? "cancelled" : "upstream_error");
                    controller.error(err);
                }
            },
            cancel (reason) {
                detachAbort();
                cancelReader(reason);
                settle("cancelled");
            }
        });
        return new Response(stream, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    }
    feedFreshPressureObservation() {
        try {
            const observation = this.getResourcePressureObservation();
            const state = observation.state;
            this.lastResource = {
                severity: state.severity,
                reason: state.reason,
                observedAtMs: state.observedAtMs
            };
            const key = observationIdentity(state);
            if (state.observedAtMs <= 0) return;
            if (key === this.lastObservationKey) return;
            this.lastObservationKey = key;
            const pressure = toAdmissionPressure(state.severity);
            this.controller.observePressure(pressure);
            this.onPressureObserved?.(pressure);
        } catch  {
        // Fail open.
        }
    }
}
function createRuntimeFromResolvedConfig(options, config) {
    return new AdaptiveAdmissionRuntimeImpl(options, config);
}
function createAdaptiveAdmissionRuntime(options = {}) {
    const config = options.config ?? (options.env ? resolveAdaptiveAdmissionConfigFromEnv(options.env) : {
        ...DEFAULT_ADAPTIVE_ADMISSION_CONFIG
    });
    return createRuntimeFromResolvedConfig(options, config);
}
function warnInvalidDefaultConfig(warn) {
    const message = "[adaptiveAdmission] invalid environment configuration; using default shadow admission settings";
    if (warn) {
        warn(message);
        return;
    }
    console.warn(message);
}
function createDefaultProcessRuntime(options = {}) {
    const warn = options.warn;
    try {
        const config = options.config ?? resolveAdaptiveAdmissionConfigFromEnv(options.env ?? process.env);
        return createRuntimeFromResolvedConfig(options, config);
    } catch  {
        warnInvalidDefaultConfig(warn);
        return createRuntimeFromResolvedConfig(options, {
            ...DEFAULT_ADAPTIVE_ADMISSION_CONFIG
        });
    }
}
function getAdaptiveAdmissionRuntime() {
    const store = getRuntimeStore();
    if (!store.runtime) {
        store.runtime = createDefaultProcessRuntime();
    }
    return store.runtime;
}
function reloadAdaptiveAdmissionRuntime(options = {}) {
    const store = getRuntimeStore();
    store.runtime?.dispose();
    store.runtime = createDefaultProcessRuntime(options);
    return store.runtime;
}
function resetAdaptiveAdmissionRuntimeForTests() {
    const store = getRuntimeStore();
    store.runtime?.dispose();
    store.runtime = null;
}
}),
"[project]/open-sse/services/admission/runtime.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_ADAPTIVE_ADMISSION_CONFIG",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["DEFAULT_ADAPTIVE_ADMISSION_CONFIG"],
    "createAdaptiveAdmissionRuntime",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAdaptiveAdmissionRuntime"],
    "extractAdmissionCostFeatures",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$requestFeatures$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractAdmissionCostFeatures"],
    "getAdaptiveAdmissionRuntime",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAdaptiveAdmissionRuntime"],
    "reloadAdaptiveAdmissionRuntime",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["reloadAdaptiveAdmissionRuntime"],
    "resetAdaptiveAdmissionRuntimeForTests",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resetAdaptiveAdmissionRuntimeForTests"],
    "resolveAdaptiveAdmissionConfigFromEnv",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveAdaptiveAdmissionConfigFromEnv"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$runtime$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/admission/runtime.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$admission$2f$requestFeatures$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/admission/requestFeatures.ts [app-route] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__11mj75v._.js.map
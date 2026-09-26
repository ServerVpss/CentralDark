module.exports = [
"[project]/open-sse/services/accountSemaphore.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Account Semaphore
 *
 * In-memory provider/account concurrency limiter keyed by provider and account.
 * Requests beyond the configured concurrency cap wait in a FIFO queue until a slot opens,
 * the gate is unblocked, or the queue timeout expires.
 */ __turbopack_context__.s([
    "acquire",
    ()=>acquire,
    "buildAccountSemaphoreKey",
    ()=>buildAccountSemaphoreKey,
    "getStats",
    ()=>getStats,
    "isAccountSemaphoreFull",
    ()=>isAccountSemaphoreFull,
    "markBlocked",
    ()=>markBlocked,
    "reset",
    ()=>reset,
    "resetAll",
    ()=>resetAll
]);
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_QUEUE_SIZE = 20;
const gates = new Map();
function buildAccountSemaphoreKey({ provider, accountKey }) {
    return `${String(provider)}:${String(accountKey)}`;
}
function isBypassed(maxConcurrency) {
    return maxConcurrency == null || maxConcurrency <= 0;
}
function createNoopReleaseFn() {
    let released = false;
    return ()=>{
        if (released) return;
        released = true;
    };
}
function ensureGate(semaphoreKey, maxConcurrency) {
    const existing = gates.get(semaphoreKey);
    if (existing) {
        existing.maxConcurrency = maxConcurrency;
        return existing;
    }
    const created = {
        running: 0,
        maxConcurrency,
        queue: [],
        blockedUntil: null,
        cleanupTimer: null
    };
    gates.set(semaphoreKey, created);
    return created;
}
function isBlocked(gate) {
    if (!gate.blockedUntil) return false;
    if (Date.now() >= gate.blockedUntil) {
        gate.blockedUntil = null;
        return false;
    }
    return true;
}
function clearCleanupTimer(gate) {
    if (!gate.cleanupTimer) return;
    clearTimeout(gate.cleanupTimer);
    gate.cleanupTimer = null;
}
function cleanupGateIfIdle(semaphoreKey) {
    const gate = gates.get(semaphoreKey);
    if (!gate) return;
    if (gate.running > 0 || gate.queue.length > 0 || isBlocked(gate)) return;
    clearCleanupTimer(gate);
    gates.delete(semaphoreKey);
}
function scheduleCleanup(semaphoreKey) {
    const gate = gates.get(semaphoreKey);
    if (!gate) return;
    clearCleanupTimer(gate);
    gate.cleanupTimer = setTimeout(()=>{
        gate.cleanupTimer = null;
        cleanupGateIfIdle(semaphoreKey);
    }, 0);
    gate.cleanupTimer.unref?.();
}
function drainQueue(semaphoreKey) {
    const gate = gates.get(semaphoreKey);
    if (!gate) return;
    while(gate.queue.length > 0 && gate.running < gate.maxConcurrency && !isBlocked(gate)){
        const next = gate.queue.shift();
        if (!next) break;
        clearTimeout(next.timer);
        gate.running++;
        next.resolve(createReleaseFn(semaphoreKey));
    }
    if (gate.running === 0 && gate.queue.length === 0) {
        scheduleCleanup(semaphoreKey);
    }
}
function createReleaseFn(semaphoreKey) {
    let released = false;
    return ()=>{
        if (released) return;
        released = true;
        const gate = gates.get(semaphoreKey);
        if (!gate) return;
        if (gate.running > 0) {
            gate.running--;
        }
        if (gate.queue.length > 0) {
            drainQueue(semaphoreKey);
            return;
        }
        scheduleCleanup(semaphoreKey);
    };
}
function createSemaphoreTimeoutError(semaphoreKey, timeoutMs) {
    const error = new Error(`Semaphore timeout after ${timeoutMs}ms for ${semaphoreKey}`);
    error.code = "SEMAPHORE_TIMEOUT";
    return error;
}
function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function acquire(semaphoreKey, { maxConcurrency = null, timeoutMs = DEFAULT_TIMEOUT_MS, signal = null, maxQueueSize = DEFAULT_MAX_QUEUE_SIZE } = {}) {
    if (isBypassed(maxConcurrency)) {
        return Promise.resolve(createNoopReleaseFn());
    }
    if (signal?.aborted) {
        return Promise.reject(makeAbortError(signal));
    }
    const gate = ensureGate(semaphoreKey, maxConcurrency);
    clearCleanupTimer(gate);
    if (gate.running < gate.maxConcurrency && !isBlocked(gate)) {
        gate.running++;
        return Promise.resolve(createReleaseFn(semaphoreKey));
    }
    if (gate.queue.length >= maxQueueSize) {
        const err = new Error(`Semaphore queue full (${maxQueueSize}) for ${semaphoreKey}`);
        err.code = "SEMAPHORE_QUEUE_FULL";
        return Promise.reject(err);
    }
    return new Promise((resolve, reject)=>{
        let abortListener = null;
        const cleanup = ()=>{
            if (abortListener && signal) {
                signal.removeEventListener("abort", abortListener);
            }
        };
        const timer = setTimeout(()=>{
            cleanup();
            const nextGate = gates.get(semaphoreKey);
            if (!nextGate) {
                reject(createSemaphoreTimeoutError(semaphoreKey, timeoutMs));
                return;
            }
            const queueIndex = nextGate.queue.findIndex((item)=>item.timer === timer);
            if (queueIndex !== -1) {
                nextGate.queue.splice(queueIndex, 1);
            }
            if (nextGate.running === 0 && nextGate.queue.length === 0) {
                scheduleCleanup(semaphoreKey);
            }
            reject(createSemaphoreTimeoutError(semaphoreKey, timeoutMs));
        }, timeoutMs);
        timer.unref?.();
        const queueItem = {
            resolve: (release)=>{
                cleanup();
                resolve(release);
            },
            reject: (error)=>{
                cleanup();
                reject(error);
            },
            timer
        };
        gate.queue.push(queueItem);
        if (signal) {
            abortListener = ()=>{
                cleanup();
                clearTimeout(timer);
                const nextGate = gates.get(semaphoreKey);
                if (!nextGate) {
                    reject(makeAbortError(signal));
                    return;
                }
                const queueIndex = nextGate.queue.findIndex((item)=>item.timer === timer);
                if (queueIndex !== -1) {
                    nextGate.queue.splice(queueIndex, 1);
                }
                if (nextGate.running === 0 && nextGate.queue.length === 0) {
                    scheduleCleanup(semaphoreKey);
                }
                reject(makeAbortError(signal));
            };
            if (signal.aborted) {
                abortListener();
            } else {
                signal.addEventListener("abort", abortListener);
            }
        }
    });
}
function markBlocked(semaphoreKey, cooldownMs) {
    const safeCooldownMs = Number.isFinite(cooldownMs) && cooldownMs > 0 ? cooldownMs : 0;
    if (safeCooldownMs <= 0) {
        const gate = gates.get(semaphoreKey);
        if (!gate) return;
        gate.blockedUntil = null;
        drainQueue(semaphoreKey);
        return;
    }
    const gate = gates.get(semaphoreKey) ?? ensureGate(semaphoreKey, 1);
    clearCleanupTimer(gate);
    gate.blockedUntil = Date.now() + safeCooldownMs;
    const timer = setTimeout(()=>{
        const nextGate = gates.get(semaphoreKey);
        if (!nextGate) return;
        if (nextGate.blockedUntil && Date.now() >= nextGate.blockedUntil) {
            nextGate.blockedUntil = null;
            drainQueue(semaphoreKey);
            if (nextGate.running === 0 && nextGate.queue.length === 0) {
                scheduleCleanup(semaphoreKey);
            }
        }
    }, safeCooldownMs + 50);
    timer.unref?.();
}
function getStats() {
    const stats = {};
    for (const [key, gate] of gates){
        stats[key] = {
            running: gate.running,
            queued: gate.queue.length,
            maxConcurrency: gate.maxConcurrency,
            blockedUntil: gate.blockedUntil ? new Date(gate.blockedUntil).toISOString() : null
        };
    }
    return stats;
}
function isAccountSemaphoreFull(provider, accountKey, maxConcurrency) {
    if (isBypassed(maxConcurrency)) return false;
    const key = buildAccountSemaphoreKey({
        provider,
        accountKey
    });
    const gate = gates.get(key);
    if (!gate) return false;
    const effectiveCap = maxConcurrency ?? gate.maxConcurrency;
    if (isBypassed(effectiveCap)) return false;
    return gate.running >= effectiveCap || isBlocked(gate);
}
function reset(semaphoreKey) {
    const gate = gates.get(semaphoreKey);
    if (!gate) return;
    clearCleanupTimer(gate);
    for (const entry of gate.queue){
        clearTimeout(entry.timer);
        entry.reject(new Error("Semaphore reset"));
    }
    gates.delete(semaphoreKey);
}
function resetAll() {
    for (const key of gates.keys()){
        reset(key);
    }
}
}),
"[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "ACCOUNT_DEACTIVATED_SIGNALS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ACCOUNT_DEACTIVATED_SIGNALS"],
    "CONTEXT_OVERFLOW_PATTERNS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CONTEXT_OVERFLOW_PATTERNS"],
    "CREDITS_EXHAUSTED_SIGNALS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CREDITS_EXHAUSTED_SIGNALS"],
    "MODEL_ACCESS_DENIED_PATTERNS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MODEL_ACCESS_DENIED_PATTERNS"],
    "MODEL_LOCKOUT_EVICTION_CAP",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$lockoutEviction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MODEL_LOCKOUT_EVICTION_CAP"],
    "OAUTH_INVALID_TOKEN_SIGNALS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["OAUTH_INVALID_TOKEN_SIGNALS"],
    "RATE_LIMIT_TEXT_PATTERNS",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RATE_LIMIT_TEXT_PATTERNS"],
    "applyErrorState",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyErrorState"],
    "checkFallbackError",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["checkFallbackError"],
    "classifyError",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["classifyError"],
    "classifyErrorText",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["classifyErrorText"],
    "classifyLockoutReason",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["classifyLockoutReason"],
    "clearAllModelLockouts",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearAllModelLockouts"],
    "clearModelLock",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearModelLock"],
    "clearProviderFailure",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["clearProviderFailure"],
    "cooldownUntilMs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["cooldownUntilMs"],
    "decayModelFailureCount",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["decayModelFailureCount"],
    "evictModelLockoutOverflow",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["evictModelLockoutOverflow"],
    "filterAvailableAccounts",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["filterAvailableAccounts"],
    "formatRetryAfter",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["formatRetryAfter"],
    "getAccountHealth",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccountHealth"],
    "getAllModelLockouts",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAllModelLockouts"],
    "getBackoffDuration",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getBackoffDuration"],
    "getEarliestRateLimitedUntil",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEarliestRateLimitedUntil"],
    "getMergedBannedSignals",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getMergedBannedSignals"],
    "getModelLockoutInfo",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelLockoutInfo"],
    "getModelLockoutSize",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getModelLockoutSize"],
    "getMsUntilTomorrow",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getMsUntilTomorrow"],
    "getProviderBreakerState",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderBreakerState"],
    "getProviderCooldownRemainingMs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCooldownRemainingMs"],
    "getProviderProfile",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderProfile"],
    "getProvidersInCooldown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProvidersInCooldown"],
    "getQuotaCooldown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getQuotaCooldown"],
    "getRuntimeProviderProfile",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRuntimeProviderProfile"],
    "getUnavailableUntil",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getUnavailableUntil"],
    "hasPerModelQuota",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasPerModelQuota"],
    "isAccountDeactivated",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountDeactivated"],
    "isAccountSemaphoreFull",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAccountSemaphoreFull"],
    "isAccountUnavailable",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"],
    "isCreditsExhausted",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCreditsExhausted"],
    "isDailyQuotaExhausted",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isDailyQuotaExhausted"],
    "isModelLocked",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"],
    "isOAuthInvalidToken",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isOAuthInvalidToken"],
    "isProviderExhaustedReason",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isProviderExhaustedReason"],
    "isProviderFailureCode",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isProviderFailureCode"],
    "isProviderInCooldown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isProviderInCooldown"],
    "lockExactModel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockExactModel"],
    "lockModel",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModel"],
    "lockModelIfPerModelQuota",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["lockModelIfPerModelQuota"],
    "parseRetryAfterFromBody",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parseRetryAfterFromBody"],
    "parseRetryFromErrorText",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parseRetryFromErrorText"],
    "recordModelLockoutFailure",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordModelLockoutFailure"],
    "recordProviderFailure",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["recordProviderFailure"],
    "resetAccountState",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resetAccountState"],
    "selectLockoutCooldownMs",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectLockoutCooldownMs"],
    "setCustomBannedSignals",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["setCustomBannedSignals"],
    "shouldMarkAccountExhaustedFrom429",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["shouldMarkAccountExhaustedFrom429"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2f$lockoutEviction$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback/lockoutEviction.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountSemaphore.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_0jrbmeu._.js.map
module.exports = [
"[project]/open-sse/services/combo/failureTracker.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COMBO_FAILURE_THRESHOLD",
    ()=>COMBO_FAILURE_THRESHOLD,
    "__resetComboFailureTrackerForTests",
    ()=>__resetComboFailureTrackerForTests,
    "clearComboFailureTracking",
    ()=>clearComboFailureTracking,
    "getComboFailureCount",
    ()=>getComboFailureCount,
    "recordComboFailure",
    ()=>recordComboFailure
]);
/**
 * Per-session combo consecutive-failure tracker.
 *
 * Purpose: stop the silent-stop pattern where a combo cascade fails, the session
 * keeps re-picking the same combo, and every retry hits the same dead/stale pin
 * (the user has no visible signal to switch). After N consecutive failures for a
 * (sessionId, comboName) pair we drop the session pin so the next request is
 * forced to re-resolve targets from scratch — and we surface an
 * `X-OmniRoute-Recovery-Action: try-auto` (or `switch-combo`) hint so the client
 * (e.g. the OpenCode plugin) can render an actionable error instead of the
 * previous opaque "model stopped producing output" loop.
 *
 * Design constraints
 * ──────────────────
 *  - In-memory Map (no DB) — failures are a per-process hot-path signal, the
 *    pin that gets cleared is the same in-memory + DB record managed by
 *    recordSessionModelUsage / deleteSessionModelHistory. Losing the
 *    counter on process restart is acceptable: worst case the user takes N
 *    retries before we clear the pin again.
 *  - TTL eviction (default 5 min, matching sessionManager session stickiness)
 *    prevents unbounded growth across long-lived sessions.
 *  - Fail-open: every public function catches its own throws and returns a safe
 *    default — a bug in the tracker must never block a request.
 *  - Pinned to a counter threshold (default 3) so a single transient 5xx does
 *    not destroy the prompt-cache pinning benefit.
 *
 * No barrel import — consistent with the other combo/* leaves.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/contextHandoffs.ts [app-route] (ecmascript)");
;
const COMBO_FAILURE_THRESHOLD = 3;
/** TTL for the in-memory counter (matches the sessionManager SESSION_TTL_MS). */ const COUNTER_TTL_MS = 5 * 60 * 1000;
/** Hard cap to prevent unbounded growth in pathological traffic patterns. */ const MAX_ENTRIES = 2_000;
const failureMap = new Map();
/** Pure keying helper — keeps the lookup format in one place. */ function keyOf(sessionId, comboName) {
    return `${sessionId}::${comboName}`;
}
/**
 * Evict expired entries + enforce the hard cap. Called lazily on every mutation
 * so we never need a background timer.
 */ function evict(now) {
    for (const [k, entry] of failureMap){
        if (now - entry.lastFailureAt > COUNTER_TTL_MS) failureMap.delete(k);
    }
    while(failureMap.size > MAX_ENTRIES){
        // Drop the oldest entry by lastFailureAt — Map iteration order is insertion
        // order which approximates recency, but we still walk to find the true min.
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [k, entry] of failureMap){
            if (entry.lastFailureAt < oldestTime) {
                oldestTime = entry.lastFailureAt;
                oldestKey = k;
            }
        }
        if (oldestKey === null) break;
        failureMap.delete(oldestKey);
    }
}
function recordComboFailure(sessionId, comboName) {
    if (!sessionId) return {
        count: 0,
        pinClearedNow: false
    };
    try {
        const now = Date.now();
        evict(now);
        const key = keyOf(sessionId, comboName);
        const existing = failureMap.get(key);
        const count = (existing?.count ?? 0) + 1;
        const pinClearedBefore = existing?.pinClearedThisStreak ?? false;
        const shouldClearNow = count >= COMBO_FAILURE_THRESHOLD && !pinClearedBefore;
        failureMap.set(key, {
            count,
            lastFailureAt: now,
            pinClearedThisStreak: shouldClearNow || pinClearedBefore
        });
        if (shouldClearNow) {
            try {
                // Session-scoped: clears ONLY this session's pin on this combo. Other
                // sessions sharing the same combo keep their own pin (see
                // deleteSessionModelHistory's docstring in contextHandoffs.ts).
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deleteSessionModelHistory"])(sessionId, comboName);
            } catch  {
            // Best effort — the counter still records the streak, future clears will
            // retry on the next threshold-cross.
            }
        }
        return {
            count,
            pinClearedNow: shouldClearNow
        };
    } catch  {
        return {
            count: 0,
            pinClearedNow: false
        };
    }
}
function clearComboFailureTracking(sessionId, comboName) {
    if (!sessionId) return;
    try {
        failureMap.delete(keyOf(sessionId, comboName));
    } catch  {
    /* fail-open */ }
}
function getComboFailureCount(sessionId, comboName) {
    if (!sessionId) return 0;
    try {
        const entry = failureMap.get(keyOf(sessionId, comboName));
        if (!entry) return 0;
        if (Date.now() - entry.lastFailureAt > COUNTER_TTL_MS) return 0;
        return entry.count;
    } catch  {
        return 0;
    }
}
function __resetComboFailureTrackerForTests() {
    failureMap.clear();
}
}),
"[project]/open-sse/services/combo/pinRecovery.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildEmptyComboTargetsPayload",
    ()=>buildEmptyComboTargetsPayload,
    "buildNoUpstreamResponseDiagnostics",
    ()=>buildNoUpstreamResponseDiagnostics,
    "buildRecoveryHint",
    ()=>buildRecoveryHint
]);
function buildRecoveryHint(terminalReason, retryAfterSeconds) {
    switch(terminalReason){
        case "reasoning_budget_exhausted":
            return {
                action: "switch-combo",
                next_step: "Reasoning models consumed the output budget without emitting content. Increase max_tokens or pick a combo without a reasoning-heavy lead model."
            };
        case "max_attempts_exceeded":
            return {
                action: "try-auto",
                next_step: "Every candidate in this combo failed. Switch to model: auto to let OmniRoute pick a working provider, or pick a different combo."
            };
        case "all_accounts_inactive":
            return {
                action: "switch-combo",
                next_step: "No active accounts are connected for this combo. Open /dashboard/providers, reconnect at least one, then retry."
            };
        case "all_models_failed":
            return {
                action: "try-auto",
                next_step: "Every model in this combo failed. Switch to model: auto to let OmniRoute pick a working provider, or wait a few seconds for rate limits to recover.",
                ...typeof retryAfterSeconds === "number" && retryAfterSeconds > 0 ? {
                    retry_after_seconds: retryAfterSeconds
                } : {}
            };
        case "no_executable_targets":
            return {
                action: "switch-combo",
                next_step: "This combo has no executable targets in the current account pool. Pick a different combo or reconnect the missing providers."
            };
        case "context_requirements_exhausted":
            return {
                action: "switch-combo",
                next_step: "Strict context requirements removed every target (known context windows are below minContextWindow). Lower minContextWindow, switch contextFilterMode to lenient, or add larger-context models."
            };
        default:
            return {
                action: "retry",
                next_step: "The combo failed transiently. Retry the same combo, or switch to model: auto if the failure repeats."
            };
    }
}
function buildNoUpstreamResponseDiagnostics(poolSize) {
    return {
        poolSize,
        attempted: 0,
        excluded: [],
        attemptOrder: [],
        terminalReason: "no_upstream_response"
    };
}
function buildEmptyComboTargetsPayload(preContextTargets, minContextWindow) {
    if (preContextTargets.length > 0) {
        const minCtxLabel = typeof minContextWindow === "number" && minContextWindow > 0 ? ` (minContextWindow: ${minContextWindow})` : "";
        return {
            message: `Combo has no executable targets after context requirements filtering${minCtxLabel}`,
            diagnostics: {
                poolSize: preContextTargets.length,
                attempted: 0,
                excluded: preContextTargets.map((t)=>({
                        provider: t.provider,
                        model: t.modelStr,
                        reason: "context_requirements"
                    })),
                attemptOrder: [],
                terminalReason: "context_requirements_exhausted",
                recovery: buildRecoveryHint("context_requirements_exhausted")
            }
        };
    }
    return {
        message: "Combo has no executable targets",
        diagnostics: {
            poolSize: 0,
            attempted: 0,
            excluded: [],
            attemptOrder: [],
            terminalReason: "no_executable_targets",
            recovery: buildRecoveryHint("no_executable_targets")
        }
    };
}
}),
"[project]/open-sse/services/combo/targetTimeoutRunner.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COMBO_TARGET_TIMEOUT_CODE",
    ()=>COMBO_TARGET_TIMEOUT_CODE,
    "buildTargetTimeoutRunner",
    ()=>buildTargetTimeoutRunner
]);
/**
 * Wrap a single-model dispatch with a per-target timeout that aborts and falls back.
 *
 * Extracted from handleComboChat's `handleSingleModelWithTimeout` closure (combo.ts).
 * A locally expired timer aborts that target and returns a typed 504 response so the Combo
 * can fall back without treating OmniRoute's own deadline as a provider-connection failure.
 * The per-model abort signal still comes from the target (`target.modelAbortSignal`), so
 * the outer request signal is intentionally NOT a dependency here.
 *
 * See _tasks/superpowers/plans/2026-07-03-blocoJ-combo-hotpath-decomposition.md (Task 1).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
;
const COMBO_TARGET_TIMEOUT_CODE = "combo_target_timeout";
function buildTargetTimeoutRunner(deps) {
    const { handleSingleModel, comboTargetTimeoutMs, log } = deps;
    return async (b, modelStr, target)=>{
        if (comboTargetTimeoutMs <= 0) {
            return handleSingleModel(b, modelStr, target).catch((err)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(502, err?.message ?? "Upstream model error"));
        }
        const timeoutController = new AbortController();
        let timeoutId;
        let timedOut = false;
        const timeoutPromise = new Promise((resolve)=>{
            timeoutId = setTimeout(()=>{
                timedOut = true;
                log.warn("COMBO", `Model ${modelStr} exceeded ${comboTargetTimeoutMs}ms timeout — falling back`);
                timeoutController.abort(new Error("combo-per-model-timeout"));
                // HTTP 504 (not proprietary 524): this is OmniRoute's own per-target timer.
                // Typed as combo_target_timeout so request-scoped classification can keep the
                // connection eligible for fallback instead of treating it like Cloudflare 524
                // or a genuine upstream gateway timeout.
                resolve(new Response(JSON.stringify((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildErrorBody"])(504, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Model ${modelStr} timed out`), undefined, {
                    type: COMBO_TARGET_TIMEOUT_CODE,
                    code: COMBO_TARGET_TIMEOUT_CODE
                })), {
                    status: 504,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }));
            }, comboTargetTimeoutMs);
        });
        const targetWithSignal = {
            ...target ?? {},
            modelAbortSignal: timeoutController.signal
        };
        const parentHedgeSignal = target?.modelAbortSignal ?? null;
        let onParentHedgeAbort = null;
        if (parentHedgeSignal) {
            if (parentHedgeSignal.aborted) {
                timeoutController.abort(new Error("hedge-cancelled"));
            } else {
                onParentHedgeAbort = ()=>{
                    timeoutController.abort(new Error("hedge-cancelled"));
                };
                parentHedgeSignal.addEventListener("abort", onParentHedgeAbort, {
                    once: true
                });
            }
        }
        try {
            return await Promise.race([
                handleSingleModel(b, modelStr, targetWithSignal).catch((err)=>{
                    if (timedOut) {
                        // Inner call rejected because we aborted it. The synthetic 504 from
                        // timeoutPromise already wins the race; return an empty response so
                        // the loser branch resolves cleanly without leaking err.message.
                        return new Response(null, {
                            status: 599
                        });
                    }
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(502, err?.message ?? "Upstream model error");
                }),
                timeoutPromise
            ]);
        } finally{
            clearTimeout(timeoutId);
            if (parentHedgeSignal && onParentHedgeAbort) {
                parentHedgeSignal.removeEventListener("abort", onParentHedgeAbort);
            }
        }
    };
}
}),
"[project]/open-sse/services/combo/context.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * ComboContext — the per-request mutable carrier for the combo dispatch pipeline
 * (Quality Gate v2 / Fase 9 — god-file decomposition, fase 1).
 *
 * handleComboChat in combo.ts is a ~1600-LOC orchestrator whose phases share a set of
 * "dispatch frontier" locals — chief among them the request `body`, which the setup phase
 * rewrites (context-cache pinning + combo agent middleware) and later dispatch phases keep
 * sharing. Carrying that mutable state on a single ctx object lets each phase be extracted
 * into a small, independently testable/mutatable function instead of living inside the
 * monolith. This is the first extracted slice; subsequent phases will add their own shared
 * mutable fields (executor, runUpstreamStream, semaphore, retry accumulators) to ComboContext.
 *
 * See _tasks/quality/2026-06-19-DESIGN-godfiles-decomposition.md §4.
 */ __turbopack_context__.s([
    "createComboContext",
    ()=>createComboContext
]);
function createComboContext(opts) {
    // body is carried by reference (not copied) so phaseComboSetup's reassignments are
    // byte-identical to the original inline code: it only ever replaces ctx.body with a NEW
    // object on a pin ({ ...body, model }) or via the middleware result, never mutates in place.
    return {
        body: opts.body,
        combo: opts.combo,
        settings: opts.settings ?? null,
        relayOptions: opts.relayOptions ?? null,
        log: opts.log
    };
}
}),
"[project]/open-sse/services/combo/comboData.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared combo data-normalization helpers extracted from combo.ts.
 *
 * Tiny side-effect-free guards/normalizers that several combo submodules depend
 * on (shadow routing, combo structure resolution) plus combo.ts itself. Moving
 * them to this leaf module out of the combo.ts god-file (Quality Gate v2 /
 * Fase 9) lets the submodules import them without reaching back into the barrel
 * (no cycles). Logic unchanged; combo.ts imports them back for compatibility.
 */ __turbopack_context__.s([
    "dedupeTargetsByExecutionKey",
    ()=>dedupeTargetsByExecutionKey,
    "isRecord",
    ()=>isRecord
]);
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function dedupeTargetsByExecutionKey(targets) {
    const seen = new Set();
    return targets.filter((target)=>{
        if (seen.has(target.executionKey)) return false;
        seen.add(target.executionKey);
        return true;
    });
}
}),
"[project]/open-sse/services/combo/autoStrategy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "QUOTA_SOFT_DEPRIORITIZE_FACTOR",
    ()=>QUOTA_SOFT_DEPRIORITIZE_FACTOR,
    "STATUS_SOFT_DEPRIORITIZE_FACTOR",
    ()=>STATUS_SOFT_DEPRIORITIZE_FACTOR,
    "_registerExecutionCandidates",
    ()=>_registerExecutionCandidates,
    "_unregisterExecutionCandidates",
    ()=>_unregisterExecutionCandidates,
    "applyRequestTagRouting",
    ()=>applyRequestTagRouting,
    "deriveComboSessionKey",
    ()=>deriveComboSessionKey,
    "deriveSpeedTelemetry",
    ()=>deriveSpeedTelemetry,
    "expandAutoComboCandidatePool",
    ()=>expandAutoComboCandidatePool,
    "extractPromptForIntent",
    ()=>extractPromptForIntent,
    "getIntentConfig",
    ()=>getIntentConfig,
    "mapIntentToTaskType",
    ()=>mapIntentToTaskType,
    "scoreAutoTargets",
    ()=>scoreAutoTargets,
    "setCandidateQuotaSoftPenalty",
    ()=>setCandidateQuotaSoftPenalty
]);
/**
 * Auto-combo scoring, intent extraction, request-tag routing, candidate-pool
 * expansion and the quota-soft execution-candidate registry — extracted from
 * combo.ts (Quality Gate v2 / Fase 9, combo split D8 — reduced).
 *
 * Logic is unchanged (byte-identical move); the moved public symbols
 * (QUOTA_SOFT_DEPRIORITIZE_FACTOR, setCandidateQuotaSoftPenalty, scoreAutoTargets,
 * expandAutoComboCandidatePool) are re-exported from combo.ts for backward
 * compatibility — including chatCore.ts's dynamic `import("../services/combo")`
 * which reads setCandidateQuotaSoftPenalty + QUOTA_SOFT_DEPRIORITIZE_FACTOR.
 *
 * The _activeExecutionCandidates registry Map MUST stay a single instance, so it
 * and its three mutators live together here.
 *
 * NOTE: buildAutoCandidates (and its two private-only helpers
 * calculateTargetContextAffinity / getBootstrapLatencyMs) deliberately stay in
 * combo.ts — it is the sole user of the internal reset-window helpers
 * (resolveResetWindowConfig / fetchResetAwareQuotaWithCache /
 * calculateResetWindowAffinity), so keeping it there avoids a combo ⇄ autoStrategy
 * import cycle. This module never imports from the combo barrel.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboData.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/sse/services/auth.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$intentClassifier$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/intentClassifier.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$taskFitness$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/taskFitness.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/scoring.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tagRouter.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
const QUOTA_SOFT_DEPRIORITIZE_FACTOR = Number(process.env.QUOTA_SOFT_DEPRIORITIZE_FACTOR ?? "0.7");
const STATUS_SOFT_DEPRIORITIZE_FACTOR = Number(process.env.STATUS_SOFT_DEPRIORITIZE_FACTOR ?? "0.5");
// G2: Module-level registry of active combo execution candidates.
// Maps executionKey → Map<stepId, candidate mutable ref>.
// Populated by buildAutoCandidates registrations; cleaned up after each execution.
// This allows chatCore.ts to mark a candidate's quotaSoftPenalty flag so that
// subsequent scoring iterations (auto-combo fallback) deprioritize it.
const _activeExecutionCandidates = new Map();
function setCandidateQuotaSoftPenalty(comboExecutionKey, comboStepId, penalty) {
    if (!comboExecutionKey || !comboStepId) return;
    const byStep = _activeExecutionCandidates.get(comboExecutionKey);
    if (!byStep) return;
    const candidate = byStep.get(comboStepId);
    if (candidate) {
        candidate.quotaSoftPenalty = penalty;
    }
}
function _registerExecutionCandidates(candidates) {
    for (const candidate of candidates){
        if (!candidate.executionKey) continue;
        let byStep = _activeExecutionCandidates.get(candidate.executionKey);
        if (!byStep) {
            byStep = new Map();
            _activeExecutionCandidates.set(candidate.executionKey, byStep);
        }
        byStep.set(candidate.stepId, candidate);
    }
}
function _unregisterExecutionCandidates(executionKeys) {
    for (const key of executionKeys){
        _activeExecutionCandidates.delete(key);
    }
}
function toTextContent(content) {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    return content.map((part)=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(part)) return "";
        if (typeof part.text === "string") return part.text;
        return "";
    }).join("\n");
}
function extractPromptForIntent(body) {
    if (!body || typeof body !== "object") return "";
    const fromMessages = Array.isArray(body.messages) ? [
        ...body.messages
    ].reverse().find((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(m) && m.role === "user") : null;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(fromMessages)) return toTextContent(fromMessages.content);
    if (typeof body.input === "string") return body.input;
    if (Array.isArray(body.input)) {
        const text = body.input.map((item)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(item)) return "";
            if (typeof item.content === "string") return item.content;
            if (typeof item.text === "string") return item.text;
            return "";
        }).filter(Boolean).join("\n");
        if (text) return text;
    }
    if (typeof body.prompt === "string") return body.prompt;
    return "";
}
function mapIntentToTaskType(intent) {
    switch(intent){
        case "code":
            return "coding";
        case "reasoning":
            return "analysis";
        case "simple":
            return "default";
        case "medium":
        default:
            return "default";
    }
}
function toStringArray(input) {
    if (Array.isArray(input)) {
        return input.map((v)=>typeof v === "string" ? v.trim() : "").filter(Boolean);
    }
    if (typeof input === "string") {
        return input.split(",").map((v)=>v.trim()).filter(Boolean);
    }
    return [];
}
function getIntentConfig(settings, combo) {
    const resolvedSettings = settings || {};
    const comboAutoConfig = combo?.autoConfig || {};
    const comboConfigAuto = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(combo?.config?.auto) ? combo.config.auto : {};
    const comboIntentConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(comboAutoConfig.intentConfig) && comboAutoConfig.intentConfig || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(comboConfigAuto.intentConfig) && comboConfigAuto.intentConfig || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(combo?.config?.intentConfig) && combo.config.intentConfig || {};
    return {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$intentClassifier$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_INTENT_CONFIG"],
        ...comboIntentConfig,
        ...typeof resolvedSettings.intentDetectionEnabled === "boolean" ? {
            enabled: resolvedSettings.intentDetectionEnabled
        } : {},
        ...Number.isFinite(Number(resolvedSettings.intentSimpleMaxWords)) ? {
            simpleMaxWords: Number(resolvedSettings.intentSimpleMaxWords)
        } : {},
        ...toStringArray(resolvedSettings.intentExtraCodeKeywords).length > 0 ? {
            extraCodeKeywords: toStringArray(resolvedSettings.intentExtraCodeKeywords)
        } : {},
        ...toStringArray(resolvedSettings.intentExtraReasoningKeywords).length > 0 ? {
            extraReasoningKeywords: toStringArray(resolvedSettings.intentExtraReasoningKeywords)
        } : {},
        ...toStringArray(resolvedSettings.intentExtraSimpleKeywords).length > 0 ? {
            extraSimpleKeywords: toStringArray(resolvedSettings.intentExtraSimpleKeywords)
        } : {}
    };
}
async function applyRequestTagRouting(targets, body, log) {
    const { tags, matchMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRequestRoutingTags"])(body);
    if (tags.length === 0 || targets.length === 0) {
        return targets;
    }
    const providerIds = Array.from(new Set(targets.map((target)=>target.providerId || target.provider))).filter((providerId)=>typeof providerId === "string" && providerId.length > 0);
    const providerConnections = new Map();
    await Promise.all(providerIds.map(async (providerId)=>{
        try {
            const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
                provider: providerId,
                isActive: true
            });
            providerConnections.set(providerId, Array.isArray(connections) ? connections : []);
        } catch (error) {
            log.warn?.("COMBO", `Tag routing failed to load connections for provider=${providerId}: ${error instanceof Error ? error.message : String(error)}`);
            providerConnections.set(providerId, []);
        }
    }));
    const filteredTargets = targets.reduce((acc, target)=>{
        const providerKey = target.providerId || target.provider;
        const candidateConnections = providerConnections.get(providerKey)?.filter((connection)=>{
            const connectionId = typeof connection.id === "string" && connection.id.trim().length > 0 ? connection.id : null;
            if (!connectionId) return false;
            if (target.connectionId) {
                return connectionId === target.connectionId;
            }
            return true;
        }) || [];
        const matchedConnectionIds = candidateConnections.filter((connection)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matchesRoutingTags"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tagRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConnectionRoutingTags"])(connection.providerSpecificData), tags, matchMode)).map((connection)=>connection.id).filter((connectionId)=>typeof connectionId === "string");
        if (matchedConnectionIds.length === 0) {
            return acc;
        }
        if (target.connectionId) {
            acc.push(target);
            return acc;
        }
        // #3266: when a step already carries an account allowlist, intersect it with
        // the tag-matched connections (most-restrictive wins). An empty intersection
        // means no connection satisfies both constraints, so the target is dropped —
        // the same outcome the `matchedConnectionIds.length === 0` guard above yields.
        const tagMatched = Array.from(new Set(matchedConnectionIds));
        const stepAllow = Array.isArray(target.allowedConnectionIds) ? target.allowedConnectionIds.filter((id)=>typeof id === "string" && id.length > 0) : null;
        const effectiveAllow = stepAllow && stepAllow.length > 0 ? tagMatched.filter((id)=>stepAllow.includes(id)) : tagMatched;
        if (effectiveAllow.length === 0) {
            return acc;
        }
        acc.push({
            ...target,
            allowedConnectionIds: effectiveAllow
        });
        return acc;
    }, []);
    if (filteredTargets.length === 0) {
        log.info?.("COMBO", `Tag routing matched 0/${targets.length} targets for [${tags.join(", ")}] (${matchMode}); falling back to the full target set`);
        return targets;
    }
    log.info?.("COMBO", `Tag routing matched ${filteredTargets.length}/${targets.length} targets for [${tags.join(", ")}] (${matchMode})`);
    return filteredTargets;
}
function scoreAutoTargets(targets, candidates, taskType, weights, manifestHint) {
    const targetByExecutionKey = new Map(targets.map((target)=>[
            target.executionKey,
            target
        ]));
    const activeCandidates = candidates.filter((candidate)=>candidate.quotaCutoffBlocked !== true);
    // Computed once per scoring pass, not per candidate — see computePoolMaxima's
    // doc comment (scoring.ts) for the O(n^2) OOM this avoids on large auto-combo
    // candidate pools (#OOM incident, zero-config auto combo expanding to 1000s
    // of provider/model targets).
    const poolMaxima = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computePoolMaxima"])(activeCandidates);
    return activeCandidates.map((candidate)=>{
        const baseTarget = targetByExecutionKey.get(candidate.executionKey) || targets.find((target)=>target.stepId === candidate.stepId || target.provider === candidate.provider && target.modelStr === candidate.modelStr);
        if (!baseTarget) return null;
        const target = {
            ...baseTarget,
            stepId: candidate.stepId,
            executionKey: candidate.executionKey,
            modelStr: candidate.modelStr,
            provider: candidate.provider,
            connectionId: candidate.connectionId ?? baseTarget.connectionId
        };
        const factors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateFactors"])(candidate, activeCandidates, taskType ?? "general", __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$taskFitness$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTaskFitness"], manifestHint ?? undefined, poolMaxima);
        let score = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateScore"])(factors, weights);
        // B17: Quota Share soft-policy deprioritization
        if ("quotaSoftPenalty" in candidate && candidate.quotaSoftPenalty === true) {
            score *= QUOTA_SOFT_DEPRIORITIZE_FACTOR;
        }
        // #4540: terminal/transient connection status soft penalty (no hard block).
        // A no-fetcher exhausted provider keeps quotaRemaining=100, so without this its
        // score would tie a healthy provider's. The penalty pushes it strictly below.
        if ("statusPenalty" in candidate && candidate.statusPenalty === true) {
            score *= STATUS_SOFT_DEPRIORITIZE_FACTOR;
        }
        return {
            target,
            score
        };
    }).filter((entry)=>entry !== null).sort((a, b)=>b.score - a.score);
}
async function expandAutoComboCandidatePool(eligibleTargets, combo) {
    const localAutoConfig = combo?.autoConfig || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(combo?.config?.auto) ? (combo?.config).auto : null) || combo?.config || {};
    if (Array.isArray(localAutoConfig?.candidatePool) && localAutoConfig.candidatePool.length > 0) return eligibleTargets;
    // #COMBO-REF: if the combo references other combos via kind:"combo-ref" entries,
    // the resolved eligibleTargets already represent the operator's intended pool.
    // Expanding to ALL providers would defeat the purpose of the combo-ref constraint
    // (e.g. an "auto" combo delegating to a "priority" sub-combo should not pull in
    // every model from every active provider).
    // When the operator has populated the combo's models[] (the common
    // case for combos created through the dashboard multi-model editor
    // with strategy=auto), the explicit list IS the candidate pool.
    // Expansion to every active provider's catalog would silently
    // override the operator's intent and inject models the operator
    // never approved. Only fall through to the full-catalog expansion
    // when the operator has not pre-populated a models[] (pure-auto
    // combos that want to score every model).
    const explicitModels = combo?.models;
    if (Array.isArray(explicitModels) && explicitModels.length > 0) return eligibleTargets;
    try {
        const allConnections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
            isActive: true
        });
        const providerIds = [
            ...new Set(allConnections.map((c)=>c.provider).filter((p)=>typeof p === "string" && p.length > 0))
        ];
        // Pre-build a Set of already-present modelStr values so candidate-pool
        // expansion doesn't turn into O(n^2) per provider. See #OOM incident
        // (zero-config auto combo expanding to 1000s of provider/model targets).
        const seenModelStrs = new Set(eligibleTargets.map((t)=>t.modelStr));
        for (const providerId of providerIds){
            const providerModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderModels"])(providerId);
            for (const model of providerModels){
                const modelStr = `${providerId}/${model.id}`;
                if (!seenModelStrs.has(modelStr)) {
                    seenModelStrs.add(modelStr);
                    eligibleTargets.push({
                        kind: "model",
                        stepId: modelStr,
                        executionKey: modelStr,
                        provider: providerId,
                        providerId: providerId,
                        modelStr,
                        weight: 1,
                        connectionId: null,
                        label: null
                    });
                }
            }
        }
    } catch  {
    // Best-effort candidate expansion only: if loading active connections or
    // provider models fails, fall back to the explicitly-resolved targets
    // rather than aborting the combo. The push above is the only mutation,
    // so a throw leaves eligibleTargets exactly as explicit resolution built it.
    }
    return eligibleTargets;
}
function deriveComboSessionKey(body) {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$sse$2f$services$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["extractSessionAffinityKey"])(body) ?? null;
    } catch  {
        return null;
    }
}
function deriveSpeedTelemetry(metric) {
    const positive = (value)=>typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
    return {
        avgTtftMs: positive(metric?.avgTtftMs),
        avgE2ELatencyMs: positive(metric?.avgE2ELatencyMs),
        avgTokensPerSecond: positive(metric?.avgTokensPerSecond)
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/comboSetup.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "phaseComboSetup",
    ()=>phaseComboSetup
]);
/**
 * phaseComboSetup — the first extracted phase of handleComboChat (combo.ts).
 *
 * Resolves the per-request combo setup BEFORE dispatch: routing strategy, context-relay
 * config, resilience settings, universal-handoff config, server-side context-cache pinning
 * (which rewrites ctx.body), combo agent middleware (also rewrites ctx.body), the config
 * cascade, the per-target timeout, and the reasoning-token-buffer flag. Behaviour is
 * byte-identical to the inline block it replaces — it just reads/writes via ComboContext.
 *
 * See _tasks/quality/2026-06-19-DESIGN-godfiles-decomposition.md §4.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/routingStrategies.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextHandoff$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextHandoff.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/contextHandoffs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboAgentMiddleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/comboAgentMiddleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/comboConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/autoStrategy.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
/**
 * Server-side context cache pinning (replaces the <omniModel> tag roundtrip): re-pins the
 * combo to the model used last for this session via session_model_history — no client-side
 * tag injection, no visible output pollution. Rewrites ctx.body when a model is pinned.
 *
 * #3825: when the client sends no session id (most OpenAI-compatible clients), fall back to a
 * stable conversation fingerprint derived from the body so the combo still re-pins across
 * turns. ONLY engaged when context_cache_protection is truthy — when off, behaviour is
 * unchanged (combos rotate as before, no pin read/write, no <omniModel> tag).
 *
 * Extracted from phaseComboSetup to keep that function under the complexity ceiling and to
 * further the combo god-file decomposition.
 */ function resolveContextCachePin(ctx) {
    const { combo, relayOptions, log } = ctx;
    const effectiveSessionId = combo.context_cache_protection ? relayOptions?.sessionId ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveComboSessionKey"])(ctx.body) : null;
    let pinnedModel = null;
    if (combo.context_cache_protection && effectiveSessionId && !ctx.body?.[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextHandoff$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SKIP_UNIVERSAL_HANDOFF_FLAG"]]) {
        const pinned = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$contextHandoffs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLastSessionModel"])(effectiveSessionId, combo.name);
        if (pinned) {
            ctx.body = {
                ...ctx.body,
                model: pinned
            };
            pinnedModel = pinned;
            log.info("COMBO", `[#401] Context cache: pinned model=${pinned} (server-side)`);
        }
    }
    return {
        effectiveSessionId,
        pinnedModel
    };
}
function phaseComboSetup(ctx) {
    const { combo, settings, relayOptions } = ctx;
    const strategy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$routingStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeRoutingStrategy"])(combo.strategy || "priority");
    const relayConfig = strategy === "context-relay" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextHandoff$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveContextRelayConfig"])(relayOptions?.config || null) : null;
    const resilienceSettings = settings ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(settings) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(null);
    const universalHandoffConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextHandoff$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveUniversalHandoffConfig"])(combo.universal_handoff || combo.universalHandoff, relayOptions?.universalHandoffConfig);
    // Server-side context cache pinning (rewrites ctx.body when a model is pinned).
    const { effectiveSessionId, pinnedModel } = resolveContextCachePin(ctx);
    // ── Combo Agent Middleware (#399 + #401) ────────────────────────────────
    // Apply system_message override, tool_filter_regex.
    // Context cache pinning is handled above via session_model_history.
    const { body: agentBody } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboAgentMiddleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyComboAgentMiddleware"])(ctx.body, combo, "" // provider/model not yet known — resolved per-model in loop
    );
    ctx.body = agentBody;
    const clientRequestedStream = ctx.body?.stream === true;
    // Use config cascade before dispatch so all strategies, pinned context routes,
    // and round-robin targets share the same timeout policy.
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboSetupConfig"])(combo, settings);
    const comboTargetTimeoutMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboTargetTimeoutMsForCombo"])(config, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"], strategy, resilienceSettings.comboCooldownWait);
    const comboTimeoutMs = config.comboTimeoutMs || 0;
    const reasoningTokenBufferEnabled = config.reasoningTokenBufferEnabled !== false;
    return {
        strategy,
        relayConfig,
        resilienceSettings,
        universalHandoffConfig,
        effectiveSessionId,
        pinnedModel,
        clientRequestedStream,
        config,
        comboTargetTimeoutMs,
        comboTimeoutMs,
        reasoningTokenBufferEnabled
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/headroomRanking.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Pure headroom ranking for combo / pool connection selection.
 *
 * Technique borrowed from the `dario` project: when choosing among the
 * connections of a pool/combo, prefer the one with the MOST free capacity
 * (highest headroom) instead of reactively filling one connection until it
 * 429s. This spreads load across accounts proactively.
 *
 *   headroom = 1 − max(util_5h, util_7d)
 *
 * where util_5h / util_7d are the 0..1 saturation signals from
 * `src/lib/quota/saturationSignals.ts::getSaturation` for the 5h plan window
 * and the weekly (7-day) plan window respectively. The binding (worst)
 * dimension drives the score, so a connection that is fine on 5h but nearly
 * exhausted on the weekly window is correctly deprioritized.
 *
 * This module is a PURE leaf: saturation is INJECTED by the caller (a Map),
 * never fetched here — no DB, no network — so the ranking is fully
 * deterministic and unit-testable. The stateful/async orderer that gathers the
 * saturation signals lives in ./quotaStrategies.ts and feeds these helpers.
 *
 * Fail-open: any missing / non-finite utilization is treated as 0 (full
 * headroom), so an unknown saturation signal never penalizes a connection —
 * matching getSaturation's own fail-open contract.
 *
 * No barrel import — pure leaf (consistent with the other combo/* helpers).
 *
 * Part of: Group B — Quota Sharing Engine (headroom-aware connection selection).
 */ /**
 * The two plan-window utilization signals (0..1) for one connection.
 * Either may be absent / non-finite; both are clamped + defaulted to 0.
 */ __turbopack_context__.s([
    "computeHeadroom",
    ()=>computeHeadroom,
    "rankByHeadroom",
    ()=>rankByHeadroom
]);
/** Clamp an arbitrary number into [0,1]; non-finite → 0 (generous default). */ function clampUtil(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return 0;
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
}
function computeHeadroom(sat) {
    const u5 = clampUtil(sat?.util5h);
    const u7 = clampUtil(sat?.util7d);
    return 1 - Math.max(u5, u7);
}
function rankByHeadroom(candidates, satByKey, keyOf) {
    if (candidates.length <= 1) return candidates;
    // Decorate with original index so equal-headroom candidates keep input order
    // (Array.prototype.sort is not guaranteed stable across all engines for the
    // comparator we need; the explicit index tie-break makes it deterministic).
    const decorated = candidates.map((candidate, index)=>({
            candidate,
            index,
            headroom: computeHeadroom(satByKey.get(keyOf(candidate)))
        }));
    decorated.sort((a, b)=>{
        if (b.headroom !== a.headroom) return b.headroom - a.headroom;
        return a.index - b.index;
    });
    return decorated.map((entry)=>entry.candidate);
}
}),
"[project]/open-sse/services/combo/sessionStickiness.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "STICKINESS_HEADROOM_THRESHOLD",
    ()=>STICKINESS_HEADROOM_THRESHOLD,
    "__setStickinessConnectionFetcherForTests",
    ()=>__setStickinessConnectionFetcherForTests,
    "__setStickinessHeadroomFetcherForTests",
    ()=>__setStickinessHeadroomFetcherForTests,
    "__setStickinessQuotaCheckerForTests",
    ()=>__setStickinessQuotaCheckerForTests,
    "applySessionStickiness",
    ()=>applySessionStickiness,
    "clearAllStickyBindings",
    ()=>clearAllStickyBindings,
    "clearStickyBinding",
    ()=>clearStickyBinding,
    "deriveMessageHash",
    ()=>deriveMessageHash,
    "isStickyConnectionTerminallyUnhealthy",
    ()=>isStickyConnectionTerminallyUnhealthy,
    "normalizeStickinessMessages",
    ()=>normalizeStickinessMessages,
    "peekStickyConnectionId",
    ()=>peekStickyConnectionId,
    "recordStickyBinding",
    ()=>recordStickyBinding,
    "resolveDisableSessionStickiness",
    ()=>resolveDisableSessionStickiness
]);
/**
 * Session stickiness for prompt-cache integrity — Fase 3 #5
 *
 * Problem: multi-turn conversations routed to different connections on each
 * request lose the provider's prompt-cache, inflating token cost 5-10× (known
 * effect in dario/clewdr). This module pins a session to the same connection
 * while that connection remains healthy (headroom > STICKINESS_HEADROOM_THRESHOLD).
 *
 * Design
 * ──────
 * • Hash key: SHA-256 of the FIRST user message → first 16 hex chars.
 *   Using only the first message gives a stable key that does not change as
 *   the conversation grows, yet still identifies the conversation reliably.
 * • Headroom gate: before reusing the sticky connection we re-check that its
 *   headroom (= 1 − max(util_5h, util_7d)) is above STICKINESS_HEADROOM_THRESHOLD
 *   (0.15). Below this threshold the connection is considered saturated and the
 *   session is rebound to whatever the normal ordering picks.
 *   Rationale for 0.15: empirically a connection at >85 % utilisation is within
 *   one burst of hitting rate limits, so the cache benefit no longer outweighs
 *   the cost of sticking to a degraded connection. The value matches the soft-
 *   penalty zone used elsewhere in the quota-share engine.
 * • Fail-open: any error (no body, no messages, hash failure, saturation fetch
 *   failure) falls back to the normal target ordering without throwing.
 * • Storage: in-memory Map with a TTL (15 min, aligned with sessionManager.ts).
 *   Max 500 entries; oldest entry evicted when the cap is exceeded.
 * • Saturation: resolved via the same dynamic-import seam as
 *   orderTargetsByHeadroom (quotaStrategies.ts), so the open-sse leaf has no
 *   static edge into src/lib/quota. For tests the fetcher is injected via
 *   __setStickinessHeadroomFetcherForTests.
 * • Terminal-status gate (#6692): headroom alone is orthogonal to account
 *   availability — a credits_exhausted/banned/expired connection (or one still
 *   inside its rate-limit window) reports perfectly healthy 5h/weekly
 *   utilization, so the headroom-only gate kept re-promoting a dead connection
 *   forever. The connection's testStatus/rateLimitedUntil is now resolved via
 *   the same dynamic-import-with-injectable-override seam (fail-open on lookup
 *   errors, mirroring resolveSaturation) and gates the pin alongside headroom.
 *   For tests the fetcher is injected via __setStickinessConnectionFetcherForTests.
 * • Quota-exhaustion gate (#7387): testStatus/rateLimitedUntil alone still
 *   miss a connection whose 5h/weekly quota window is depleted but that
 *   hasn't (yet) received a hard failure severe enough to flip either field —
 *   exactly what a quota-preflight/dashboard-detected depletion looks like
 *   before any upstream 429 lands for this run. isAccountQuotaExhausted()
 *   (src/domain/quotaCache.ts) is the authoritative per-window signal the rest
 *   of the credential-selection pipeline already gates on (auth.ts,
 *   sessionAffinityPin.ts); it now also releases the combo-level sticky pin.
 *   For tests the checker is injected via __setStickinessQuotaCheckerForTests.
 *
 * No barrel import — consistent with the other combo/* helpers.
 *
 * Part of: Group B — Quota Sharing Engine (Fase 3, point #5).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$headroomRanking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/headroomRanking.ts [app-route] (ecmascript)");
;
;
const STICKINESS_HEADROOM_THRESHOLD = 0.15;
/** TTL aligned with sessionManager.ts SESSION_TTL_MS (15 min). */ const TTL_MS = 15 * 60 * 1000;
/** Cap to prevent unbounded memory growth. */ const MAX_ENTRIES = 500;
// ─── Saturation fetcher seam ─────────────────────────────────────────────────
/** Overrides the default fetcher for tests; null = use production fetcher. */ let _fetcherOverride = null;
function __setStickinessHeadroomFetcherForTests(fetcher) {
    _fetcherOverride = fetcher;
}
/** Overrides the default connection-health fetcher for tests; null = use production fetcher. */ let _connectionFetcherOverride = null;
function __setStickinessConnectionFetcherForTests(fetcher) {
    _connectionFetcherOverride = fetcher;
}
/**
 * Statuses that mean the account is DURABLY dead, not just transiently rate
 * limited — mirrors TERMINAL_PIN_STATUSES used by the LKGP/context-cache pin
 * (combo.ts:558). Duplicated here (rather than imported) so this leaf keeps no
 * static edge into combo.ts, which itself imports this module.
 */ const TERMINAL_STICKY_STATUSES = new Set([
    "credits_exhausted",
    "banned",
    "expired"
]);
/**
 * Resolve the sticky-bound connection's health by fetching its provider_connections
 * row. Uses the same dynamic-import pattern as resolveSaturation so this leaf has
 * no static dependency on src/lib/db. Fail-open (undefined) on any error.
 */ async function resolveConnectionHealth(connectionId, provider) {
    if (_connectionFetcherOverride) return _connectionFetcherOverride(connectionId, provider);
    try {
        const mod = await __turbopack_context__.A("[project]/src/lib/db/readCache.ts [app-route] (ecmascript, async loader)");
        const getCachedProviderConnections = mod.getCachedProviderConnections;
        const connections = await getCachedProviderConnections({
            provider,
            isActive: true
        });
        return connections.find((c)=>c.id === connectionId);
    } catch  {
        return undefined;
    }
}
function isStickyConnectionTerminallyUnhealthy(conn, now) {
    if (!conn) return false;
    const status = typeof conn.testStatus === "string" ? conn.testStatus : "";
    if (TERMINAL_STICKY_STATUSES.has(status)) return true;
    const rl = conn.rateLimitedUntil ? new Date(String(conn.rateLimitedUntil)).getTime() : 0;
    return Number.isFinite(rl) && rl > now;
}
let _quotaExhaustionOverride = null;
function __setStickinessQuotaCheckerForTests(checker) {
    _quotaExhaustionOverride = checker;
}
/**
 * Is the sticky-bound connection's per-window (5h/weekly) quota exhausted?
 *
 * `isStickyConnectionTerminallyUnhealthy` above only looks at testStatus/
 * rateLimitedUntil (#6692) — it misses a connection whose quota window is
 * fully depleted (per src/domain/quotaCache.ts::isAccountQuotaExhausted, the
 * same authoritative per-window signal src/sse/services/auth.ts and
 * sessionAffinityPin.ts already gate on) but that hasn't yet received a hard
 * failure severe enough to flip testStatus or set rateLimitedUntil. Without
 * this check the combo-level sticky pin re-promotes the depleted account on
 * every request, defeating whatever strategy picked a healthy one. (#7387)
 *
 * Dynamic import (mirroring resolveConnectionHealth/resolveSaturation above)
 * so this open-sse/ leaf keeps no static edge into src/domain/. Fail-open
 * (false) on any lookup error — an unresolved check must never drop a
 * healthy pin.
 */ async function isStickyConnectionQuotaExhausted(connectionId) {
    if (_quotaExhaustionOverride) return _quotaExhaustionOverride(connectionId);
    try {
        const mod = await __turbopack_context__.A("[project]/src/domain/quotaCache.ts [app-route] (ecmascript, async loader)");
        return Boolean(mod.isAccountQuotaExhausted(connectionId));
    } catch  {
        return false;
    }
}
/**
 * Resolve the HeadroomSaturation for a connection by fetching both the 5h and
 * weekly utilisation signals. Uses the same dynamic-import pattern as
 * orderTargetsByHeadroom so this leaf has no static dependency on src/lib/quota.
 */ async function resolveSaturation(connectionId, provider) {
    if (_fetcherOverride) return _fetcherOverride(connectionId);
    try {
        const mod = await __turbopack_context__.A("[project]/src/lib/quota/saturationSignals.ts [app-route] (ecmascript, async loader)");
        const getSaturation = mod.getSaturation;
        const [util5h, util7d] = await Promise.all([
            getSaturation(connectionId, provider, {
                unit: "percent",
                window: "5h"
            }),
            getSaturation(connectionId, provider, {
                unit: "percent",
                window: "weekly"
            })
        ]);
        return {
            util5h,
            util7d
        };
    } catch  {
        return undefined;
    }
}
// ─── In-memory store ─────────────────────────────────────────────────────────
/** messageHash → sticky entry */ const stickyMap = new Map();
function normalizeStickinessMessages(body) {
    if (!body || typeof body !== "object") return null;
    const { messages, input } = body;
    if (Array.isArray(messages) && messages.length > 0) {
        return messages;
    }
    if (typeof input === "string" && input.length > 0) {
        return [
            {
                role: "user",
                content: input
            }
        ];
    }
    if (Array.isArray(input) && input.length > 0) {
        return input.map((item)=>typeof item === "string" ? {
                role: "user",
                content: item
            } : item);
    }
    return null;
}
function deriveMessageHash(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return null;
    const first = messages.find((m)=>m?.role === "user");
    if (!first) return null;
    let text;
    if (typeof first.content === "string") {
        text = first.content;
    } else if (Array.isArray(first.content)) {
        // Multi-part content: collect all text parts
        text = first.content.filter((p)=>p != null && typeof p === "object").map((p)=>typeof p.text === "string" ? p.text : "").join("");
    } else {
        return null;
    }
    if (!text) return null;
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(text).digest("hex").slice(0, 16);
}
/** Evict expired entries and enforce the hard cap. */ function evict() {
    const now = Date.now();
    for (const [key, entry] of stickyMap){
        if (now - entry.lastUsedAt > TTL_MS) stickyMap.delete(key);
    }
    // Hard cap: remove oldest by lastUsedAt
    while(stickyMap.size > MAX_ENTRIES){
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of stickyMap){
            if (entry.lastUsedAt < oldestTime) {
                oldestTime = entry.lastUsedAt;
                oldestKey = key;
            }
        }
        if (oldestKey === null) break;
        stickyMap.delete(oldestKey);
    }
}
function recordStickyBinding(messageHash, connectionId) {
    const existing = stickyMap.get(messageHash);
    if (existing) {
        existing.connectionId = connectionId;
        existing.lastUsedAt = Date.now();
    } else {
        evict();
        stickyMap.set(messageHash, {
            connectionId,
            createdAt: Date.now(),
            lastUsedAt: Date.now()
        });
    }
}
function clearStickyBinding(messageHash) {
    stickyMap.delete(messageHash);
}
function peekStickyConnectionId(messageHash) {
    return stickyMap.get(messageHash)?.connectionId ?? null;
}
function clearAllStickyBindings() {
    stickyMap.clear();
}
function resolveDisableSessionStickiness(config, settings) {
    const perCombo = config?.disableSessionStickiness;
    if (typeof perCombo === "boolean") return perCombo;
    return settings?.disableSessionStickiness === true;
}
async function applySessionStickiness(orderedTargets, messages) {
    const noOp = {
        targets: orderedTargets,
        messageHash: null,
        stuck: false
    };
    try {
        if (orderedTargets.length <= 1) return noOp;
        const messageHash = deriveMessageHash(messages);
        if (!messageHash) return noOp;
        const existing = stickyMap.get(messageHash);
        if (!existing) return {
            targets: orderedTargets,
            messageHash,
            stuck: false
        };
        // Check TTL
        if (Date.now() - existing.lastUsedAt > TTL_MS) {
            stickyMap.delete(messageHash);
            return {
                targets: orderedTargets,
                messageHash,
                stuck: false
            };
        }
        const { connectionId } = existing;
        // Find the target that matches the sticky connection
        const stickyIdx = orderedTargets.findIndex((t)=>t.connectionId === connectionId);
        if (stickyIdx === -1) {
            // Connection gone from pool — clear binding, fall through
            clearStickyBinding(messageHash);
            return {
                targets: orderedTargets,
                messageHash,
                stuck: false
            };
        }
        // Gate: headroom must be above threshold AND the connection must not be
        // durably unhealthy (#6692 — credits_exhausted/banned/expired/rate-limited
        // accounts report healthy 5h/weekly utilization, so headroom alone never
        // catches them).
        const stickyTarget = orderedTargets[stickyIdx];
        const [sat, connHealth, quotaExhausted] = await Promise.all([
            resolveSaturation(connectionId, stickyTarget.provider),
            resolveConnectionHealth(connectionId, stickyTarget.provider),
            isStickyConnectionQuotaExhausted(connectionId)
        ]);
        const headroom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$headroomRanking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeHeadroom"])(sat);
        if (headroom <= STICKINESS_HEADROOM_THRESHOLD || isStickyConnectionTerminallyUnhealthy(connHealth, Date.now()) || quotaExhausted) {
            // Connection saturated or durably unhealthy — rebind on next success
            clearStickyBinding(messageHash);
            return {
                targets: orderedTargets,
                messageHash,
                stuck: false
            };
        }
        // Promote the sticky target to position 0
        const reordered = [
            orderedTargets[stickyIdx],
            ...orderedTargets.slice(0, stickyIdx),
            ...orderedTargets.slice(stickyIdx + 1)
        ];
        // Refresh lastUsedAt
        existing.lastUsedAt = Date.now();
        return {
            targets: reordered,
            messageHash,
            stuck: true
        };
    } catch  {
        // Completely unexpected error — fail-open
        return noOp;
    }
}
}),
"[project]/open-sse/services/combo/comboPredicates.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "ALL_ACCOUNTS_RATE_LIMITED_PATTERNS",
    ()=>ALL_ACCOUNTS_RATE_LIMITED_PATTERNS,
    "MAX_COMBO_DEPTH",
    ()=>MAX_COMBO_DEPTH,
    "MAX_COMBO_DEPTH_HARD_CAP",
    ()=>MAX_COMBO_DEPTH_HARD_CAP,
    "MAX_FALLBACK_WAIT_MS",
    ()=>MAX_FALLBACK_WAIT_MS,
    "MAX_GLOBAL_ATTEMPTS",
    ()=>MAX_GLOBAL_ATTEMPTS,
    "PREDICTIVE_TTFT_MIN_SAMPLES",
    ()=>PREDICTIVE_TTFT_MIN_SAMPLES,
    "QUOTA_BLOCKING_CONNECTION_STATUSES",
    ()=>QUOTA_BLOCKING_CONNECTION_STATUSES,
    "TRANSIENT_FOR_SEMAPHORE",
    ()=>TRANSIENT_FOR_SEMAPHORE,
    "clampComboDepth",
    ()=>clampComboDepth,
    "clampPercent",
    ()=>clampPercent,
    "comboModelNotFoundResponse",
    ()=>comboModelNotFoundResponse,
    "effectiveMaxConcurrency",
    ()=>effectiveMaxConcurrency,
    "getConnectionStatusQuotaCutoffReason",
    ()=>getConnectionStatusQuotaCutoffReason,
    "getExhaustedTargetSkipReason",
    ()=>getExhaustedTargetSkipReason,
    "getTargetProvider",
    ()=>getTargetProvider,
    "hasFutureRateLimitUntil",
    ()=>hasFutureRateLimitUntil,
    "isAllAccountsRateLimitedResponse",
    ()=>isAllAccountsRateLimitedResponse,
    "isComboRequestScopedFailure",
    ()=>isComboRequestScopedFailure,
    "isContextOverflow400",
    ()=>isContextOverflow400,
    "isInputBoundRequestFailure",
    ()=>isInputBoundRequestFailure,
    "isModelScoped400",
    ()=>isModelScoped400,
    "isParamValidation400",
    ()=>isParamValidation400,
    "isProviderCircuitOpenResult",
    ()=>isProviderCircuitOpenResult,
    "isRequestScopedUpstreamFailure",
    ()=>isRequestScopedUpstreamFailure,
    "isStreamEarlyEofErrorBody",
    ()=>isStreamEarlyEofErrorBody,
    "isStreamReadinessFailureErrorBody",
    ()=>isStreamReadinessFailureErrorBody,
    "isTokenLimitBreachErrorBody",
    ()=>isTokenLimitBreachErrorBody,
    "normalizeConnectionStatus",
    ()=>normalizeConnectionStatus,
    "quotaRemainingPercentFromQuota",
    ()=>quotaRemainingPercentFromQuota,
    "resolveDelayMs",
    ()=>resolveDelayMs,
    "shouldRecordProviderBreakerFailure",
    ()=>shouldRecordProviderBreakerFailure,
    "shouldSkipConnDisable",
    ()=>shouldSkipConnDisable,
    "shouldSkipForPredictedTtft",
    ()=>shouldSkipForPredictedTtft,
    "toRecordedTarget",
    ()=>toRecordedTarget
]);
/**
 * Pure combo predicates + tuning constants extracted from combo.ts.
 *
 * Side-effect-free helpers and the combo-loop tuning constants moved out of the
 * combo.ts god-file (Quality Gate v2 / Fase 9). Logic unchanged; the public
 * predicates are re-exported from combo.ts for backward compatibility.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cooldownClassification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/cooldownClassification.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/errorClassifier.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const TRANSIENT_FOR_SEMAPHORE = [
    429,
    502,
    503,
    504
];
const ALL_ACCOUNTS_RATE_LIMITED_PATTERNS = [
    /unavailable/i,
    /service temporarily unavailable/i
];
function isAllAccountsRateLimitedResponse(status, contentType, errorText) {
    if (status !== 503) return false;
    if (!contentType?.includes("application/json")) return false;
    return ALL_ACCOUNTS_RATE_LIMITED_PATTERNS.some((p)=>p.test(errorText));
}
function isProviderCircuitOpenResult(result, errorText) {
    const breakerHeader = result.headers?.get?.("x-omniroute-provider-breaker");
    if (typeof breakerHeader === "string" && breakerHeader.toLowerCase() === "open") return true;
    return /provider_circuit_open/i.test(errorText);
}
function getExhaustedTargetSkipReason(target, exhaustedProviders, exhaustedConnections) {
    const { provider, modelStr, connectionId } = target;
    // #1731v2: skip targets whose provider:connection pair had a connection-level error.
    if (provider && connectionId) {
        if (exhaustedConnections.has(`${provider}:${connectionId}`)) {
            return `Skipping ${modelStr} — connection ${connectionId} for provider ${provider} had connection error (#1731v2)`;
        }
    }
    // #1731: skip targets from a provider that already signaled full quota exhaustion this request.
    if (provider && exhaustedProviders.has(provider)) {
        return `Skipping ${modelStr} — provider ${provider} marked exhausted this request (#1731)`;
    }
    return null;
}
const MAX_COMBO_DEPTH = 3;
const MAX_COMBO_DEPTH_HARD_CAP = 10;
const MAX_FALLBACK_WAIT_MS = 5000;
const MAX_GLOBAL_ATTEMPTS = 30;
function clampComboDepth(value) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n) || n < 1) return MAX_COMBO_DEPTH;
    return Math.min(n, MAX_COMBO_DEPTH_HARD_CAP);
}
const PREDICTIVE_TTFT_MIN_SAMPLES = 5;
function shouldSkipForPredictedTtft(metric, predictiveTtftMs) {
    if (!metric || !(predictiveTtftMs > 0)) return false;
    return (metric.requests ?? 0) >= PREDICTIVE_TTFT_MIN_SAMPLES && (metric.avgLatencyMs ?? 0) > predictiveTtftMs;
}
/**
 * Whole-provider circuit-breaker failure statuses for the combo path. Kept byte-identical
 * to the single-model path's `PROVIDER_BREAKER_FAILURE_STATUSES` (src/sse/handlers/chat.ts:206)
 * — the source of truth. 429 is deliberately EXCLUDED: a plain rate-limit must not open the
 * whole-provider breaker (it's connection-cooldown / model-lockout scope). Defined locally
 * rather than imported to avoid a cross-layer (open-sse → src/sse) import cycle.
 */ const PROVIDER_BREAKER_FAILURE_STATUSES = new Set([
    408,
    500,
    502,
    503,
    504
]);
function shouldRecordProviderBreakerFailure(args) {
    return (!args.isStreamReadinessFailure || args.isStreamEarlyEof === true) && PROVIDER_BREAKER_FAILURE_STATUSES.has(args.status) && (!args.sameProviderNext || args.isProxyUnreachable === true) && !args.skipProviderBreaker && !args.requestScopedFailure && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLocalStreamLifecycleError"])(args.error);
}
const REQUEST_SCOPED_UPSTREAM_ERROR_CODES = new Set([
    "context_length_exceeded",
    "upstream_empty_response",
    "upstream_response_failed",
    // Local combo per-target timer (targetTimeoutRunner) — not a connection health signal.
    "combo_target_timeout"
]);
function isRequestScopedUpstreamFailure(error) {
    const code = typeof error?.code === "string" ? error.code.toLowerCase() : "";
    const type = typeof error?.type === "string" ? error.type.toLowerCase() : "";
    return REQUEST_SCOPED_UPSTREAM_ERROR_CODES.has(code) || type === "context_length_exceeded";
}
function isComboRequestScopedFailure(status, errorText, error) {
    return isRequestScopedUpstreamFailure(error) || status === 404 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$errorClassifier$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isResourceNotFoundResponse"])(errorText);
}
const INPUT_BOUND_ERROR_CODES = new Set([
    "context_length_exceeded",
    "context_window_exceeded"
]);
function isInputBoundRequestFailure(error) {
    const code = typeof error?.code === "string" ? error.code.toLowerCase() : "";
    const type = typeof error?.type === "string" ? error.type.toLowerCase() : "";
    return INPUT_BOUND_ERROR_CODES.has(code) || type === "context_length_exceeded";
}
function shouldSkipConnDisable(result, is401, hasExtraKeys, provider) {
    return result.status === 499 || result.errorCode === "client_disconnected" || result.errorType === "client_disconnected" || // Client abort surfaced as a bare error (no statusCode → defaults to 502):
    // a local lifecycle event, not a provider failure (#4602 policy).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLocalStreamLifecycleError"])(result.error) || result.errorCode === "plugin_block" || result.errorType === "plugin_block" || is401 && hasExtraKeys || isRequestScopedUpstreamFailure({
        code: result.errorCode,
        type: result.errorType
    }) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$cooldownClassification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSelfInflictedUpstreamTimeout"])(result.status, result.errorType, provider);
}
function resolveDelayMs(value, fallback) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) return fallback;
    return numericValue;
}
function effectiveMaxConcurrency(cap, fallback) {
    if (typeof cap === "number" && Number.isFinite(cap) && cap > 0) {
        return Math.floor(cap);
    }
    return fallback;
}
function comboModelNotFoundResponse(message) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(404, message);
}
function getTargetProvider(modelStr, providerId) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(modelStr);
    return providerId || parsed.provider || parsed.providerAlias || "unknown";
}
function isStreamReadinessFailureErrorBody(errorBody) {
    if (!errorBody || typeof errorBody !== "object") return false;
    const error = errorBody.error;
    if (!error || typeof error !== "object") return false;
    const code = error.code;
    return code === "STREAM_READINESS_TIMEOUT" || code === "STREAM_EARLY_EOF";
}
function isStreamEarlyEofErrorBody(errorBody) {
    if (!errorBody || typeof errorBody !== "object") return false;
    const error = errorBody.error;
    if (!error || typeof error !== "object") return false;
    return error.code === "STREAM_EARLY_EOF";
}
function isTokenLimitBreachErrorBody(errorBody) {
    if (!errorBody || typeof errorBody !== "object") return false;
    const error = errorBody.error;
    if (!error || typeof error !== "object") return false;
    return error.code === "TOKEN_LIMIT_EXCEEDED";
}
function toRecordedTarget(target) {
    return {
        executionKey: target.executionKey,
        stepId: target.stepId,
        provider: target.provider,
        providerId: target.providerId,
        connectionId: target.connectionId,
        label: target.label
    };
}
function clampPercent(value) {
    if (!Number.isFinite(value)) return 100;
    return Math.max(0, Math.min(100, value));
}
function quotaRemainingPercentFromQuota(quota) {
    if (!quota || typeof quota !== "object") return 100;
    const record = quota;
    if (record.limitReached === true) return 0;
    const windows = record.windows;
    if (windows && typeof windows === "object" && !Array.isArray(windows)) {
        let minRemaining = null;
        for (const windowInfo of Object.values(windows)){
            if (!windowInfo || typeof windowInfo !== "object") continue;
            const percentUsed = Number(windowInfo.percentUsed);
            if (!Number.isFinite(percentUsed)) continue;
            const remaining = clampPercent((1 - percentUsed) * 100);
            minRemaining = minRemaining === null ? remaining : Math.min(minRemaining, remaining);
        }
        if (minRemaining !== null) return minRemaining;
    }
    const percentUsed = Number(record.percentUsed);
    if (Number.isFinite(percentUsed)) return clampPercent((1 - percentUsed) * 100);
    return 100;
}
const QUOTA_BLOCKING_CONNECTION_STATUSES = new Set([
    "banned",
    "credits_exhausted",
    "deactivated",
    "expired",
    "rate_limited"
]);
function normalizeConnectionStatus(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function hasFutureRateLimitUntil(value) {
    if (value == null || value === "") return false;
    const time = new Date(String(value)).getTime();
    return Number.isFinite(time) && time > Date.now();
}
function getConnectionStatusQuotaCutoffReason(connection) {
    if (!connection) return undefined;
    const status = normalizeConnectionStatus(connection.testStatus);
    if (QUOTA_BLOCKING_CONNECTION_STATUSES.has(status)) return status;
    if (status === "unavailable" && hasFutureRateLimitUntil(connection.rateLimitedUntil)) {
        return "rate_limited";
    }
    return undefined;
}
function isContextOverflow400(errorText) {
    const text = String(errorText || "");
    if (!text) return false;
    return /\bcontext.*(?:length_exceeded|too long|overflow|exceeded|window|limit)\b/i.test(text) || /exceeds.*context/i.test(text) || /your input exceeds/i.test(text) || __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CONTEXT_OVERFLOW_PATTERNS"].some((p)=>p.test(text));
}
function isParamValidation400(errorText) {
    const text = String(errorText || "");
    if (!text) return false;
    return /\bmax_tokens\b.*(?:illegal|must|range|invalid)/i.test(text) || /\bparameter is illegal\b/i.test(text) || /\bis illegal.*range\b/i.test(text);
}
function isModelScoped400(errorText) {
    const text = String(errorText || "");
    if (!text) return false;
    if (__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["MODEL_ACCESS_DENIED_PATTERNS"].some((p)=>p.test(text))) return true;
    return /\bmodel\b[\s\S]{0,80}?\b(?:not\s+supported|unsupported|unknown|unavailable)\b/i.test(text) || /\b(?:not\s+supported|unsupported|unknown)\b[\s\S]{0,80}?\bmodel\b/i.test(text) || /\bunsupported_api_for_model\b/i.test(text) || /\bdoes\s+not\s+support\s+(?:the\s+)?responses\s+api\b/i.test(text);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/concurrencyCaps.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "lookupPositiveCap",
    ()=>lookupPositiveCap,
    "makeConnectionConcurrencyResolver",
    ()=>makeConnectionConcurrencyResolver,
    "resolveMaxConcurrentByConnection",
    ()=>resolveMaxConcurrentByConnection
]);
/**
 * concurrencyCaps.ts — Per-connection concurrency-cap resolution for combos.
 *
 * A provider connection (OAuth account / API key) can declare a `maxConcurrent`
 * ceiling (provider_connections.max_concurrent). Subscription accounts often
 * allow only ~1–3 concurrent requests; exceeding that triggers 429s and
 * cooldowns. These helpers resolve that ceiling from the DB so the routing layer
 * can honor it:
 *
 *   - resolveMaxConcurrentByConnection: batch-resolves a Map<connectionId, cap>
 *     for a set of targets (used by the quota-share strategy gating).
 *   - makeConnectionConcurrencyResolver: a cached per-target resolver returning
 *     the effective semaphore maxConcurrency (used by the round-robin loop).
 *
 * Both deduplicate DB reads per connectionId (the same connection can repeat
 * across combo steps) so at most one lookup happens per distinct connection, and
 * both fail open: a null/<=0 cap or a lookup error means "no per-connection
 * limit" and never blocks routing. Extracted from combo.ts to keep that god-file
 * shrinking (Quality Gate / #3501).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function lookupPositiveCap(connectionId) {
    try {
        const conn = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connectionId);
        const raw = conn?.maxConcurrent;
        return typeof raw === "number" && Number.isFinite(raw) && raw > 0 ? raw : null;
    } catch  {
        return null; // fail-open: never block routing on a lookup error
    }
}
async function resolveMaxConcurrentByConnection(targets) {
    const caps = new Map();
    const distinctIds = new Set();
    for (const target of targets){
        const connId = target.connectionId ?? "";
        if (connId) distinctIds.add(connId);
    }
    for (const connId of distinctIds){
        caps.set(connId, await lookupPositiveCap(connId));
    }
    return caps;
}
function makeConnectionConcurrencyResolver(fallbackConcurrency) {
    const cache = new Map();
    return async (connectionId)=>{
        if (!connectionId) return fallbackConcurrency;
        let cap = cache.get(connectionId);
        if (cap === undefined) {
            cap = await lookupPositiveCap(connectionId);
            cache.set(connectionId, cap);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["effectiveMaxConcurrency"])(cap, fallbackConcurrency);
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/quotaShareConcurrency.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "acquireQuotaShareConcurrencySlot",
    ()=>acquireQuotaShareConcurrencySlot,
    "quotaShareConcurrencyKey",
    ()=>quotaShareConcurrencyKey
]);
/**
 * quotaShareConcurrency.ts — Per-connection concurrency limit for quota-share combos (FASE 2.1).
 *
 * The quota-share gating in selectQuotaShareTarget (combo/quotaShareStrategy.ts)
 * is FAIL-OPEN: an at-cap connection is only deprioritized, never hard-blocked,
 * so with a single-connection pool (the common case for a subscription account)
 * concurrent requests to that account are all dispatched at once and flood it
 * (→ 429 + cooldown). The quota-share dispatch path also never calls
 * `semaphore.acquire` — that lived only in handleRoundRobinCombo.
 *
 * This helper closes that gap WITHOUT touching the fail-open selection logic:
 * when the selected connection declares a positive `max_concurrent` ceiling, the
 * dispatch acquires a per-CONNECTION semaphore slot keyed by connectionId (the
 * cap belongs to the account, not the combo), so concurrent requests to one
 * account WAIT in the queue instead of flooding it. It stays fail-open at the
 * edges: no connection / no positive cap → no limit; a saturated queue / timeout
 * → proceed without a slot rather than ever worsening availability.
 *
 * The key is connectionId-scoped (not combo-scoped like the round-robin key) so
 * every quota-share request that lands on the same account shares one gate.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitSemaphore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/rateLimitSemaphore.ts [app-route] (ecmascript)");
;
function quotaShareConcurrencyKey(connectionId) {
    return `qsconn:${connectionId}`;
}
async function acquireQuotaShareConcurrencySlot(target, cap, opts, log) {
    const connectionId = target?.connectionId ?? "";
    if (!connectionId || cap === null || cap <= 0) return null;
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitSemaphore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["acquire"](quotaShareConcurrencyKey(connectionId), {
            maxConcurrency: cap,
            timeoutMs: opts.queueTimeoutMs,
            maxQueueSize: opts.maxQueueSize
        });
    } catch  {
        // Fail-open: a saturated queue / timeout must never worsen availability —
        // proceed without a slot rather than reject a dispatchable request.
        log.warn("COMBO", `Quota-share concurrency: connection ${connectionId} gate saturated (cap=${cap}) — proceeding without a slot`);
        return null;
    }
}
}),
"[project]/open-sse/services/combo/promptCacheAffinity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyPromptCacheAffinity",
    ()=>applyPromptCacheAffinity,
    "calculatePromptCacheAffinityScores",
    ()=>calculatePromptCacheAffinityScores,
    "expandPromptCacheAffinityTargets",
    ()=>expandPromptCacheAffinityTargets,
    "expandPromptCacheAffinityTargetsFromConnections",
    ()=>expandPromptCacheAffinityTargetsFromConnections,
    "promptCacheTargetIdentity",
    ()=>promptCacheTargetIdentity,
    "resolvePromptCacheAffinityKey",
    ()=>resolvePromptCacheAffinityKey,
    "shouldProtectOriginalFirst",
    ()=>shouldProtectOriginalFirst
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$promptCache$2f$prefixAnalyzer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/promptCache/prefixAnalyzer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
;
;
;
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeMessageContent(value) {
    if (typeof value === "string" || Array.isArray(value)) return value;
    try {
        return JSON.stringify(value) || "";
    } catch  {
        return "";
    }
}
function normalizeResponsesInput(body) {
    if (Array.isArray(body.messages) && body.messages.length > 0) {
        return body.messages.map((item)=>{
            const record = asRecord(item);
            return record && typeof record.role === "string" ? {
                role: record.role,
                content: normalizeMessageContent(record.content)
            } : null;
        }).filter((item)=>item !== null);
    }
    if (typeof body.input === "string" && body.input.length > 0) {
        return [
            {
                role: "user",
                content: body.input
            }
        ];
    }
    if (Array.isArray(body.input) && body.input.length > 0) {
        return body.input.map((item)=>{
            if (typeof item === "string") return {
                role: "user",
                content: item
            };
            const record = asRecord(item);
            return record && typeof record.role === "string" ? {
                role: record.role,
                content: normalizeMessageContent(record.content)
            } : null;
        }).filter((item)=>item !== null);
    }
    return null;
}
function readExplicitPromptCacheKey(body) {
    const metadata = asRecord(body.metadata);
    for (const value of [
        body.prompt_cache_key,
        metadata?.prompt_cache_key
    ]){
        if (typeof value !== "string") continue;
        const normalized = value.trim();
        if (normalized.length > 0 && normalized.length <= 4096) return normalized;
    }
    return null;
}
function resolvePromptCacheAffinityKey(body) {
    if (!body) return null;
    const explicit = readExplicitPromptCacheKey(body);
    const messages = normalizeResponsesInput(body);
    const prefixAnalysis = messages ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$promptCache$2f$prefixAnalyzer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyzePrefix"])(messages) : null;
    // The analyzer intentionally returns a legacy empty-content hash for callers
    // that need that historical value. Affinity must not use it: a request with
    // only a first user turn has no reusable prompt prefix and would collapse
    // otherwise distinct conversations onto one account.
    const prefixKey = prefixAnalysis && prefixAnalysis.prefixEndIdx >= 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$promptCache$2f$prefixAnalyzer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generatePromptCacheKey"])(messages || []) : "";
    const key = explicit ?? prefixKey;
    if (!key) return null;
    const source = explicit ? "explicit" : "prefix";
    const fingerprint = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(key).digest("hex").slice(0, 12);
    return {
        key,
        source,
        fingerprint
    };
}
function promptCacheTargetIdentity(target) {
    const connectionId = typeof target.connectionId === "string" ? target.connectionId.trim() : "";
    if (connectionId) return `connection:${connectionId}`;
    return `execution:${target.executionKey}`;
}
function rendezvousScore(key, identity) {
    const digest = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(key).update("\0").update(identity).digest("hex");
    return BigInt(`0x${digest.slice(0, 32)}`);
}
function calculatePromptCacheAffinityScores(targets, body) {
    const resolution = resolvePromptCacheAffinityKey(body);
    if (!resolution || targets.length === 0) return new Map();
    let winnerIdentity = "";
    let winnerScore = -1n;
    for (const target of targets){
        const identity = promptCacheTargetIdentity(target);
        const score = rendezvousScore(resolution.key, identity);
        if (score > winnerScore || score === winnerScore && identity < winnerIdentity) {
            winnerIdentity = identity;
            winnerScore = score;
        }
    }
    return new Map(targets.map((target)=>{
        const identity = promptCacheTargetIdentity(target);
        return [
            identity,
            identity === winnerIdentity ? 1 : 0
        ];
    }));
}
async function expandPromptCacheAffinityTargets(targets) {
    const providers = Array.from(new Set(targets.filter((target)=>!target.connectionId).map((target)=>target.provider || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(target.modelStr).provider || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(target.modelStr).providerAlias || "unknown")));
    const connectionsByProvider = new Map();
    await Promise.all(providers.map(async (provider)=>{
        try {
            const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
                provider,
                isActive: true
            });
            connectionsByProvider.set(provider, Array.isArray(connections) ? connections : []);
        } catch  {
            connectionsByProvider.set(provider, []);
        }
    }));
    return expandPromptCacheAffinityTargetsFromConnections(targets, connectionsByProvider);
}
function expandPromptCacheAffinityTargetsFromConnections(targets, connectionsByProvider) {
    const expandedTargets = [];
    for (const target of targets){
        if (target.connectionId) {
            expandedTargets.push(target);
            continue;
        }
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(target.modelStr);
        const provider = target.provider || parsed.provider || parsed.providerAlias || "unknown";
        const connectionIds = (connectionsByProvider.get(provider) || []).map((connection)=>connection && typeof connection.id === "string" ? connection.id.trim() : "").filter((connectionId)=>connectionId.length > 0);
        const allowedConnectionIds = Array.isArray(target.allowedConnectionIds) ? new Set(target.allowedConnectionIds.filter((connectionId)=>typeof connectionId === "string" && connectionId.trim().length > 0)) : null;
        const scopedConnectionIds = allowedConnectionIds ? connectionIds.filter((connectionId)=>allowedConnectionIds.has(connectionId)) : connectionIds;
        if (scopedConnectionIds.length === 0) {
            expandedTargets.push(target);
            continue;
        }
        for (const connectionId of scopedConnectionIds){
            expandedTargets.push({
                ...target,
                connectionId,
                executionKey: `${target.executionKey}@${connectionId}`
            });
        }
    }
    return expandedTargets;
}
function shouldProtectOriginalFirst(stickyStuck, autoUsedExplicitRouter, strategy) {
    return stickyStuck || autoUsedExplicitRouter || strategy === "quota-share" || strategy === "weighted" || strategy === "priority" || strategy === "fill-first" || strategy === "lkgp";
}
function applyPromptCacheAffinity(targets, body, enabled = true) {
    const resolution = enabled ? resolvePromptCacheAffinityKey(body) : null;
    if (!resolution || targets.length <= 1) {
        return {
            targets,
            applied: false,
            source: resolution?.source ?? null,
            fingerprint: resolution?.fingerprint ?? null
        };
    }
    const ranked = targets.map((target, index)=>({
            target,
            index,
            identity: promptCacheTargetIdentity(target),
            score: rendezvousScore(resolution.key, promptCacheTargetIdentity(target))
        }));
    ranked.sort((a, b)=>{
        if (a.score > b.score) return -1;
        if (a.score < b.score) return 1;
        const identityOrder = a.identity.localeCompare(b.identity);
        return identityOrder !== 0 ? identityOrder : a.index - b.index;
    });
    return {
        targets: ranked.map((entry)=>entry.target),
        applied: true,
        source: resolution.source,
        fingerprint: resolution.fingerprint
    };
}
}),
"[project]/open-sse/services/combo/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared combo (model combo) types extracted from combo.ts.
 *
 * Pure type aliases / interfaces and the RESET_WINDOW_NAMES runtime constant.
 * Moving these out of the 5k-LOC combo.ts god-file (Quality Gate v2 / Fase 9)
 * — logic unchanged, re-exported from combo.ts for backward compatibility.
 */ __turbopack_context__.s([
    "RESET_WINDOW_NAMES",
    ()=>RESET_WINDOW_NAMES
]);
const RESET_WINDOW_NAMES = [
    "weekly",
    "session",
    "monthly"
];
}),
"[project]/open-sse/services/combo/rrState.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Round-robin sticky state for combo routing.
 *
 * Holds the two mutable module-level Maps that back round-robin distribution
 * (`rrCounters`) and sticky round-robin target affinity (`rrStickyTargets`),
 * plus the helpers that read/write them. Extracted byte-identically from
 * combo.ts (QG v2 Fase 9 T5 D7a).
 *
 * State cohesion: these two Maps MUST remain single instances. combo.ts imports
 * the same references back and mutates them directly (orderTargetsByResetAwareQuota,
 * orderTargetsByResetWindow, handleRoundRobinCombo) — never duplicate a Map.
 *
 * Pure leaf: this module never imports from the combo barrel.
 */ __turbopack_context__.s([
    "MAX_RR_COUNTERS",
    ()=>MAX_RR_COUNTERS,
    "clampStickyRoundRobinTargetLimit",
    ()=>clampStickyRoundRobinTargetLimit,
    "clampStickyWeightedTargetLimit",
    ()=>clampStickyWeightedTargetLimit,
    "getStickyRoundRobinStartIndex",
    ()=>getStickyRoundRobinStartIndex,
    "getStickyWeightedExecutionKey",
    ()=>getStickyWeightedExecutionKey,
    "recordStickyRoundRobinSuccess",
    ()=>recordStickyRoundRobinSuccess,
    "recordStickyWeightedSuccess",
    ()=>recordStickyWeightedSuccess,
    "resolveComboStickyRoundRobinLimit",
    ()=>resolveComboStickyRoundRobinLimit,
    "rrCounters",
    ()=>rrCounters,
    "rrStickyTargets",
    ()=>rrStickyTargets,
    "weightedStickyTargets",
    ()=>weightedStickyTargets
]);
const MAX_RR_COUNTERS = 500;
const rrCounters = new Map();
const rrStickyTargets = new Map();
const weightedStickyTargets = new Map();
function clampStickyRoundRobinTargetLimit(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 1;
    return Math.min(Math.max(Math.floor(numericValue), 1), 1000);
}
const clampStickyWeightedTargetLimit = clampStickyRoundRobinTargetLimit;
function getStickyRoundRobinStartIndex(comboName, targets, stickyLimit) {
    const sticky = rrStickyTargets.get(comboName);
    const stickyIndex = sticky ? targets.findIndex((target)=>target.executionKey === sticky.executionKey) : -1;
    if (stickyLimit > 1 && sticky && stickyIndex >= 0 && sticky.successCount < stickyLimit) {
        return {
            startIndex: stickyIndex,
            counter: rrCounters.get(comboName) || 0
        };
    }
    const counter = rrCounters.get(comboName) || 0;
    return {
        startIndex: counter % targets.length,
        counter
    };
}
function recordStickyRoundRobinSuccess(comboName, target, stickyLimit, targets) {
    const sticky = rrStickyTargets.get(comboName);
    const successCount = sticky?.executionKey === target.executionKey ? sticky.successCount + 1 : 1;
    if (successCount >= stickyLimit) {
        const servedIndex = targets.findIndex((entry)=>entry.executionKey === target.executionKey);
        rrCounters.set(comboName, servedIndex >= 0 ? servedIndex + 1 : (rrCounters.get(comboName) || 0) + 1);
        rrStickyTargets.delete(comboName);
        return;
    }
    rrStickyTargets.set(comboName, {
        executionKey: target.executionKey,
        successCount
    });
}
function getStickyWeightedExecutionKey(comboName, stickyLimit) {
    const sticky = weightedStickyTargets.get(comboName);
    if (!sticky || stickyLimit <= 1 || sticky.successCount >= stickyLimit) return null;
    return sticky.executionKey;
}
function recordStickyWeightedSuccess(comboName, executionKey, stickyLimit) {
    const sticky = weightedStickyTargets.get(comboName);
    const successCount = sticky?.executionKey === executionKey ? sticky.successCount + 1 : 1;
    if (successCount >= stickyLimit) {
        weightedStickyTargets.delete(comboName);
        return;
    }
    weightedStickyTargets.set(comboName, {
        executionKey,
        successCount
    });
}
function resolveComboStickyRoundRobinLimit(perComboLimit, settings) {
    if (perComboLimit !== undefined && perComboLimit !== null) {
        return clampStickyRoundRobinTargetLimit(perComboLimit);
    }
    const comboSticky = settings?.comboStickyRoundRobinLimit;
    if (comboSticky !== undefined && comboSticky !== null) {
        return clampStickyRoundRobinTargetLimit(comboSticky);
    }
    return clampStickyRoundRobinTargetLimit(settings?.stickyRoundRobinLimit);
}
}),
"[project]/open-sse/services/combo/responseValidation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Feature 4985 — configurable response-body validation for combo routing.
 *
 * A combo can declare a `responseValidation` predicate. When an upstream returns 200 OK
 * but the parsed body fails the predicate, `validateResponseQuality` reports it as
 * invalid, which the combo orchestrator already treats exactly like an HTTP error
 * (skip this target → fail over to the next). All checks are declarative and safe:
 * substring matching (no regex / no ReDoS) and a bounded dot-path resolver (no eval).
 */ __turbopack_context__.s([
    "evaluateResponseValidation",
    ()=>evaluateResponseValidation,
    "extractContentText",
    ()=>extractContentText,
    "parseJsonPath",
    ()=>parseJsonPath,
    "resolveJsonPath",
    ()=>resolveJsonPath
]);
const MAX_REASON_SNIPPET = 60;
function snippet(value) {
    return value.length > MAX_REASON_SNIPPET ? `${value.slice(0, MAX_REASON_SNIPPET)}…` : value;
}
function parseJsonPath(path) {
    const tokens = [];
    let buf = "";
    const flush = ()=>{
        if (buf) {
            tokens.push(buf);
            buf = "";
        }
    };
    for(let i = 0; i < path.length; i++){
        const ch = path[i];
        if (ch === ".") {
            flush();
        } else if (ch === "[") {
            flush();
            let inner = "";
            i++;
            while(i < path.length && path[i] !== "]"){
                inner += path[i];
                i++;
            }
            const trimmed = inner.trim();
            const n = Number(trimmed);
            tokens.push(trimmed !== "" && Number.isInteger(n) ? n : trimmed);
        } else {
            buf += ch;
        }
    }
    flush();
    return tokens;
}
function resolveJsonPath(root, path) {
    let current = root;
    for (const token of parseJsonPath(path)){
        if (current === null || current === undefined) return undefined;
        if (typeof token === "number") {
            if (!Array.isArray(current)) return undefined;
            current = current[token];
        } else {
            if (typeof current !== "object") return undefined;
            current = current[token];
        }
    }
    return current;
}
function isNonEmpty(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return Boolean(value);
}
function checkCondition(value, condition, expected) {
    switch(condition){
        case "exists":
            return value !== undefined && value !== null;
        case "nonEmpty":
            return isNonEmpty(value);
        case "equals":
            return value === expected;
        case "notEquals":
            return value !== expected;
    }
}
function extractContentText(json) {
    if (!json || typeof json !== "object") return "";
    const obj = json;
    // Chat Completions: choices[].message.content (string or array of parts).
    const choices = obj.choices;
    if (Array.isArray(choices)) {
        const parts = [];
        for (const choice of choices){
            const message = choice?.message;
            const content = message?.content;
            if (typeof content === "string") parts.push(content);
            else if (Array.isArray(content)) {
                for (const part of content){
                    const text = part?.text;
                    if (typeof text === "string") parts.push(text);
                }
            }
        }
        if (parts.length) return parts.join("");
    }
    // Responses API: output[].content[].text
    const output = obj.output;
    if (Array.isArray(output)) {
        const parts = [];
        for (const item of output){
            const content = item?.content;
            if (Array.isArray(content)) {
                for (const part of content){
                    const text = part?.text;
                    if (typeof text === "string") parts.push(text);
                }
            }
        }
        if (parts.length) return parts.join("");
    }
    return "";
}
function evaluateResponseValidation(json, config) {
    if (!config || typeof config !== "object") return {
        valid: true
    };
    const content = extractContentText(json);
    for (const sub of config.forbiddenSubstrings ?? []){
        if (typeof sub === "string" && sub.length > 0 && content.includes(sub)) {
            return {
                valid: false,
                reason: `response contains forbidden substring "${snippet(sub)}"`
            };
        }
    }
    for (const sub of config.requiredSubstrings ?? []){
        if (typeof sub === "string" && sub.length > 0 && !content.includes(sub)) {
            return {
                valid: false,
                reason: `response missing required substring "${snippet(sub)}"`
            };
        }
    }
    if (typeof config.minContentLength === "number" && Number.isFinite(config.minContentLength) && config.minContentLength > 0 && content.trim().length < config.minContentLength) {
        return {
            valid: false,
            reason: `response content shorter than ${config.minContentLength} chars`
        };
    }
    for (const predicate of config.jsonPathPredicates ?? []){
        if (!predicate || typeof predicate.path !== "string" || !predicate.path) continue;
        const resolved = resolveJsonPath(json, predicate.path);
        if (!checkCondition(resolved, predicate.condition, predicate.value)) {
            return {
                valid: false,
                reason: `jsonpath check failed: "${snippet(predicate.path)}" ${predicate.condition}`
            };
        }
    }
    return {
        valid: true
    };
}
}),
"[project]/open-sse/services/combo/validateQuality.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "releaseQualityClone",
    ()=>releaseQualityClone,
    "releaseRejectedQualityResponse",
    ()=>releaseRejectedQualityResponse,
    "toRetryAfterDisplayValue",
    ()=>toRetryAfterDisplayValue,
    "validateResponseQuality",
    ()=>validateResponseQuality
]);
/**
 * Combo response-quality validation extracted from combo.ts.
 *
 * `validateResponseQuality` (bounded SSE peek + non-streaming content check) and
 * `toRetryAfterDisplayValue` moved out of the combo.ts god-file (Quality Gate v2
 * / Fase 9). Logic unchanged; re-exported from combo.ts for compatibility.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/streamHelpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$responseValidation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/responseValidation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [app-route] (ecmascript)");
;
;
;
function toRetryAfterDisplayValue(value) {
    if (typeof value !== "number") return value;
    if (value > 0 && value < 1_000_000_000) {
        return new Date(Date.now() + value * 1000);
    }
    return new Date(value);
}
// Issue #6427: some providers mask credit/quota exhaustion behind an HTTP 200 —
// either an OpenAI-shape top-level `error` object, or a known exhaustion phrase
// living in the error envelope itself (never in assistant prose — see
// `extractEnvelopeErrorText`). Single-quantifier-per-token-class alternation,
// no nested/overlapping quantifiers — cannot backtrack catastrophically.
const EXHAUSTION_MARKER_PATTERN = /\b(insufficient\s+credit|insufficient\s+balance|quota\s+exceeded|out\s+of\s+credits?|credit\s+exhausted)\b/i;
/**
 * Collect the small set of top-level "error envelope" strings a 200 response may
 * carry alongside (or instead of) a normal completion: the OpenAI-shape `error`
 * object's `message`/`code`/`type`, a bare string `error`, or sibling top-level
 * `message`/`detail` fields some providers use for the same purpose. Deliberately
 * does NOT look inside `choices[].message.content` — assistant prose that merely
 * mentions "quota" or "credits" must never be misclassified as an upstream failure.
 */ function extractEnvelopeErrorText(json) {
    const parts = [];
    const err = json.error;
    if (err && typeof err === "object") {
        const e = err;
        if (typeof e.message === "string") parts.push(e.message);
        if (typeof e.code === "string") parts.push(e.code);
        if (typeof e.type === "string") parts.push(e.type);
    } else if (typeof err === "string" && err.length > 0) {
        parts.push(err);
    }
    if (typeof json.message === "string") parts.push(json.message);
    if (typeof json.detail === "string") parts.push(json.detail);
    return parts.length > 0 ? parts.join(" ") : null;
}
/** Read `parsed.<key>` as a nested object bag, or null when absent/not an object. */ function asObject(parsed, key) {
    const value = parsed[key];
    return value && typeof value === "object" ? value : null;
}
/**
 * A content_block_start is real signal only for tool_use / redacted_thinking —
 * a tool call is meaningful even before its input_json_delta arrives. text and
 * thinking blocks routinely open empty; keep peeking for a delta instead.
 */ function contentBlockStartIsRealSignal(parsed) {
    const blockType = asObject(parsed, "content_block")?.type;
    return blockType === "tool_use" || blockType === "redacted_thinking";
}
/**
 * A content_block_delta is real signal when it carries non-empty text/thinking,
 * or any input_json_delta fragment — even an empty-string first chunk proves a
 * tool_use block is actively streaming its arguments.
 */ function contentBlockDeltaIsRealSignal(parsed) {
    const delta = asObject(parsed, "delta");
    if (!delta) return false;
    const deltaType = typeof delta.type === "string" ? delta.type : "";
    if (deltaType === "input_json_delta") return true;
    if (deltaType !== "text_delta" && deltaType !== "thinking_delta") return false;
    const text = delta.text ?? delta.thinking;
    return typeof text === "string" && text.length > 0;
}
/** A message_delta closes the lifecycle once it carries a stop_reason. */ function messageDeltaEndsLifecycle(parsed) {
    return asObject(parsed, "delta")?.stop_reason != null;
}
/** Update `flags` in place from one parsed OpenAI-shape SSE `data:` payload. */ function applyOpenAiLifecycleEvent(parsed, flags) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isOpenAIChoicesPayload"])(parsed)) return;
    flags.hasChoicePayload = true;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasOpenAIFinishReason"])(parsed)) flags.hasTerminalMarker = true;
}
/**
 * Apply a single parsed Claude SSE event to the peeked lifecycle `flags`
 * (mutated in place). Extracted from `parseAccumulatedSse`'s inline switch to
 * keep that function under the complexity/line ratchets — logic unchanged.
 *
 * Returns true once REAL content (not just an empty content_block_start) is
 * detected — the caller should stop peeking and treat the stream as non-empty.
 */ function applySseLifecycleEvent(eventType, parsed, flags) {
    switch(eventType){
        case "message_start":
            flags.hasMessageStart = true;
            return false;
        case "content_block_start":
            flags.hasContentBlock = true;
            if (!contentBlockStartIsRealSignal(parsed)) return false;
            flags.hasRealContent = true;
            return true;
        case "content_block_delta":
            flags.hasContentBlock = true;
            if (!contentBlockDeltaIsRealSignal(parsed)) return false;
            flags.hasRealContent = true;
            return true;
        case "content_block_stop":
            flags.hasContentBlock = true;
            return false;
        case "message_stop":
            flags.hasLifecycleEnd = true;
            return false;
        case "message_delta":
            if (messageDeltaEndsLifecycle(parsed)) flags.hasLifecycleEnd = true;
            return false;
        default:
            return false;
    }
}
function responsesApiOutputHasContent(output) {
    return Array.isArray(output) && output.some((item)=>{
        if (!item || typeof item !== "object") return false;
        const record = item;
        if (record.type !== "message") return Boolean(record.type);
        const content = record.content;
        return Array.isArray(content) && content.some((part)=>!!part && typeof part === "object" && typeof part.text === "string" && part.text.length > 0);
    });
}
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function isStreamingUpstreamError(parsed, eventType) {
    if (eventType === "response.failed" || eventType === "error") return true;
    if (!isRecord(parsed)) return false;
    if (parsed.error != null) return true;
    const nestedResponse = isRecord(parsed.response) ? parsed.response : null;
    return nestedResponse?.status === "failed" && nestedResponse.error != null;
}
/**
 * Validate that a successful (HTTP 200) non-streaming response actually contains
 * meaningful content. Returns { valid: true } or { valid: false, reason }.
 *
 * Only inspects non-streaming JSON responses — streaming responses are passed through
 * because buffering the full stream would defeat the purpose of streaming.
 *
 * Checks:
 * 1. Body is valid JSON
 * 2. Has at least one choice with non-empty content or tool_calls
 */ function parseJsonRecord(data) {
    try {
        return JSON.parse(data);
    } catch  {
        return null;
    }
}
async function validateResponseQuality(response, isStreaming, log, responseValidation) {
    // Issue #3685: For Claude SSE streaming responses, use a BOUNDED PEEK to
    // detect the empty-content-block pattern (content_filter stop_reason with
    // no content_block_* events) WITHOUT de-streaming non-empty responses.
    //
    // Parse SSE events incrementally. Stop buffering once a content_block_* event
    // or a known non-Claude SSE payload appears, replay the buffered prefix, then
    // pipe the original reader so the rest of the stream keeps flowing normally.
    // Only fail over when a complete Claude lifecycle ends without content_block.
    //
    // Non-text/event-stream streaming responses are not buffered at all.
    if (isStreaming) {
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/event-stream")) {
            return {
                valid: true
            };
        }
        if (!response.body) {
            return {
                valid: true
            };
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        // Raw Uint8Array chunks accumulated so far — used to replay the prefix
        // in the returned clonedResponse.
        const bufferedChunks = [];
        // Decoded text accumulated across chunks for incremental SSE parsing.
        // Only the tail of the most-recently-processed line window remains here
        // between iterations (incomplete lines are deferred to the next chunk).
        let decodedSoFar = "";
        // SSE lifecycle state.
        //
        // #1382: hasContentBlock only means "a content_block_* event was observed"
        // — it does NOT mean the block carried usable content. A content_block_start
        // for a text/thinking block routinely opens with empty text (real content
        // arrives via subsequent content_block_delta events); some upstreams
        // (reported: DeepSeek/GLM via claude→openai translation on tool-heavy
        // requests) open and close such a block without ever emitting a delta.
        // hasRealContent tracks whether we've actually seen usable output: a
        // tool_use/redacted_thinking block start (self-evidently real, even before
        // any delta), or a delta carrying non-empty text/thinking/tool-input.
        const sse = {
            hasMessageStart: false,
            hasContentBlock: false,
            hasRealContent: false,
            hasLifecycleEnd: false
        };
        let anyContentFound = false;
        // #7285: OpenAI-shape lifecycle tracking, parallel to `sse` above.
        const openAi = {
            hasChoicePayload: false,
            hasTerminalMarker: false
        };
        // User log 1784230812441-bf3789: the previous `!sawAnyBytes` gate below let
        // ANY byte — even unparseable garbage with no SSE framing at all — pass
        // combo failover through. These two flags are tracked in parallel to
        // `sse`/`openAi` above and only tighten the GENERIC done-branch gate
        // further down; the #1382 (`sse.hasRealContent`) and #7285
        // (`openAi.hasTerminalMarker`) branches are untouched.
        //   - sawStructuredSSE — a parseable `event:` or `data:` frame was seen,
        //     even one that carries no recognised content (ping/metadata) — the
        //     #3399 pass-through contract for those streams is preserved.
        //   - sawTerminator     — a recognised terminator arrived: `data: [DONE]`,
        //     an OpenAI `finish_reason` (mirrors `openAi.hasTerminalMarker`), a
        //     Claude `message_stop`/`message_delta` with `stop_reason` (mirrors
        //     `sse.hasLifecycleEnd`), or a terminal `usage`-only chunk (new).
        let sawStructuredSSE = false;
        let sawTerminator = false;
        const sseLineNormalizer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createSSEDataLineNormalizer"])();
        let pendingEventType = "";
        /**
     * Parse any complete SSE lines from `decodedSoFar`, updating lifecycle
     * flags in the closure. The last (potentially incomplete) line is kept in
     * `decodedSoFar` for the next iteration.
     *
     * Returns "content" once REAL content (not just an empty content_block_start)
     * is detected, or "error" when the upstream reports a failure before content.
     * Otherwise peeking continues.
     */ // Some providers send a terminal `usage`-only chunk (no `choices`) as the
        // final SSE frame instead of a `[DONE]`/`finish_reason` marker. Excludes
        // Responses API `response.*` events, which have their own dedicated
        // handling via `isKnownNonClaudeStreamPayload`.
        function isTerminalUsageOnlyChunk(parsed, eventType) {
            return Boolean(parsed.usage && typeof parsed.usage === "object" && !Array.isArray(parsed.choices) && !eventType.startsWith("response."));
        }
        // Consume one normalized SSE line: track `event:` framing / keepalives /
        // `[DONE]` terminators in the enclosing state, and return the JSON-parsed
        // `data:` payload when (and only when) the line carries one.
        function consumeSseLine(line) {
            const trimmed = line.trim();
            if (trimmed.startsWith("event:")) {
                pendingEventType = trimmed.slice(6).trim();
                // An `event:` line is structured SSE framing on its own, even
                // before any `data:` payload arrives (e.g. a bare keepalive ping).
                sawStructuredSSE = true;
                return null;
            }
            if (!trimmed.startsWith("data:")) {
                if (!trimmed) pendingEventType = "";
                return null;
            }
            const data = trimmed.slice(5).trim();
            if (!data) return null;
            if (data === "[DONE]") {
                // #7285: `[DONE]` is itself a terminal marker for OpenAI-shape
                // streams, even when no earlier chunk carried `finish_reason`.
                openAi.hasTerminalMarker = true;
                sawTerminator = true;
                return null;
            }
            return parseJsonRecord(data);
        }
        function parseAccumulatedSse() {
            const lines = decodedSoFar.split(/\r?\n/);
            // Retain the potentially-incomplete trailing fragment.
            decodedSoFar = lines[lines.length - 1];
            for (const line of sseLineNormalizer.normalize(lines.slice(0, -1))){
                const parsed = consumeSseLine(line);
                if (!parsed) continue;
                // A successfully parsed `data:` payload is structured SSE activity
                // regardless of shape or content — tracked only for the generic
                // done-branch gate below; the #1382/#7285 branches are unaffected.
                sawStructuredSSE = true;
                applyOpenAiLifecycleEvent(parsed, openAi);
                if (openAi.hasTerminalMarker) sawTerminator = true;
                const eventType = (typeof parsed.type === "string" ? parsed.type : null) || pendingEventType || "";
                pendingEventType = "";
                if (isStreamingUpstreamError(parsed, eventType)) {
                    return "error";
                }
                if (isTerminalUsageOnlyChunk(parsed, eventType)) sawTerminator = true;
                if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$streamHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isKnownNonClaudeStreamPayload"])(parsed, eventType)) {
                    return "content";
                }
                if (applySseLifecycleEvent(eventType, parsed, sse)) {
                    return "content";
                }
                if (sse.hasLifecycleEnd) sawTerminator = true;
            }
            return null;
        }
        /**
     * Build a Response whose body first replays all bytes in `bufferedChunks`,
     * then forwards the remainder of `readerToForward` chunk-by-chunk.
     * Preserves the original response's status, statusText, and headers.
     */ function buildReplayResponse(readerToForward) {
            // Snapshot the prefix so mutations after this point don't affect it.
            const prefix = bufferedChunks.slice();
            let prefixIdx = 0;
            const stream = new ReadableStream({
                async pull (controller) {
                    // 1. Drain the buffered prefix one chunk at a time.
                    if (prefixIdx < prefix.length) {
                        controller.enqueue(prefix[prefixIdx++]);
                        return;
                    }
                    // 2. Forward the remainder from the original reader.
                    try {
                        const { done, value } = await readerToForward.read();
                        if (done) {
                            controller.close();
                        } else {
                            controller.enqueue(value);
                        }
                    } catch  {
                        controller.close();
                    }
                }
            });
            return new Response(stream, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        }
        // Main bounded-peek loop.
        try {
            while(true){
                const { done, value } = await reader.read();
                if (done) {
                    // Stream finished — flush the TextDecoder and parse any remaining text.
                    const tail = decoder.decode(undefined, {
                        stream: false
                    });
                    if (tail) decodedSoFar += tail;
                    if (decodedSoFar.trim()) decodedSoFar += "\n\n";
                    const terminalOutcome = parseAccumulatedSse();
                    if (terminalOutcome === "error") {
                        log.warn?.("COMBO", "Streaming response reported an upstream error before content — marking as invalid for combo failover");
                        return {
                            valid: false,
                            reason: "streaming upstream error"
                        };
                    }
                    if (sse.hasMessageStart && sse.hasLifecycleEnd && !sse.hasRealContent) {
                        // Complete Claude lifecycle with zero content blocks, or with
                        // content_block_start/stop pairs that never carried real text/
                        // thinking/tool_use content (#1382 — tool-heavy claude→openai
                        // requests against upstreams like DeepSeek/GLM can "complete" a
                        // lifecycle around an empty block) → failover.
                        log.warn?.("COMBO", sse.hasContentBlock ? "Streaming Claude response has complete lifecycle but its content block(s) carried no usable text/tool_use — marking as invalid for combo failover" : "Streaming Claude response has complete lifecycle but zero content blocks (content_filter?) — marking as invalid for combo failover");
                        return {
                            valid: false,
                            reason: "streaming empty content block"
                        };
                    }
                    // Stream ended with a truly EMPTY body (e.g. Gemini returning HTTP
                    // 200 with zero bytes), or with bytes that never formed a single
                    // recognizable SSE frame and never signalled termination — mark as
                    // invalid for combo failover so the sibling model gets tried.
                    // Streams that carried ANY structured SSE activity (an explicit
                    // `data: [DONE]`, ping/metadata events, an incomplete Claude
                    // lifecycle) or a recognised terminator keep the pass-through
                    // contract (#3399/#3685): those are handled by the stream-readiness
                    // timeout, not failover.
                    //
                    // Tightened after user log 1784230812441-bf3789: the previous
                    // `!sawAnyBytes` check let ANY byte — even unparseable garbage that
                    // never produced a single structured SSE frame — pass through,
                    // leaving the downstream SSE parser hung on a half-finished stream.
                    if (!anyContentFound && !sse.hasContentBlock && !sawTerminator && !sawStructuredSSE) {
                        log.warn?.("COMBO", "Streaming response ended with no recognized content or SSE terminator — marking as invalid for combo failover");
                        return {
                            valid: false,
                            reason: "streaming no recognized content"
                        };
                    }
                    // Issue #7285: an OpenAI-shape stream (`choices[]` chunks) that
                    // closes without ever carrying `finish_reason` or a `[DONE]`
                    // sentinel, and without producing recognized content, is a
                    // truncated response — failover to a sibling combo target rather
                    // than forwarding the incomplete stream as a success. Does not
                    // affect Claude-shape streams (`openAi.hasChoicePayload` stays
                    // false for those) and does not regress the #3399/#3685
                    // pass-through contract: a healthy stream exits the peek loop
                    // early via the `foundContent` branch above and never reaches here.
                    if (openAi.hasChoicePayload && !openAi.hasTerminalMarker && !anyContentFound) {
                        log.warn?.("COMBO", "Streaming OpenAI-shape response ended with no finish_reason or [DONE] — marking as invalid for combo failover");
                        return {
                            valid: false,
                            reason: "streaming openai truncated without finish_reason"
                        };
                    }
                    // Incomplete lifecycle or non-Claude stream — replay all buffered
                    // bytes. The reader is exhausted so the forwarding reader will
                    // immediately signal done.
                    const clonedResponse = buildReplayResponse(reader);
                    return {
                        valid: true,
                        clonedResponse
                    };
                }
                // Accumulate raw bytes for potential replay.
                bufferedChunks.push(value);
                // Decode incrementally (stream:true keeps multi-byte char state).
                decodedSoFar += decoder.decode(value, {
                    stream: true
                });
                const outcome = parseAccumulatedSse();
                if (outcome === "error") {
                    // Do not await cancellation of a Response.clone() tee branch: the
                    // promise may remain pending until the client-facing branch drains.
                    reader.cancel().catch(()=>{});
                    log.warn?.("COMBO", "Streaming response reported an upstream error before content — marking as invalid for combo failover");
                    return {
                        valid: false,
                        reason: "streaming upstream error"
                    };
                }
                if (outcome === "content") {
                    anyContentFound = true;
                    // A content_block_* event was found — stop peeking. Return a
                    // clonedResponse that replays all buffered bytes (the current chunk
                    // is already in bufferedChunks) and then forwards the remainder of
                    // the original reader unchanged.
                    const clonedResponse = buildReplayResponse(reader);
                    return {
                        valid: true,
                        clonedResponse
                    };
                }
            }
        } catch (streamErr) {
            // If reading the stream fails due to a locked stream or pipe error,
            // the content cannot be verified — mark as invalid for combo failover.
            // A locked ReadableStream means the response body is already consumed
            // or corrupted (e.g. "Invalid state: The ReadableStream is locked").
            // Broad match: Chrome/V8 throws "body used already", Firefox throws
            // "ReadableStream is locked", etc.
            const errMsg = streamErr instanceof Error ? streamErr.message : String(streamErr);
            if (streamErr instanceof TypeError && (errMsg.includes("locked") || errMsg.includes("disturbed") || errMsg.includes("used already"))) {
                return {
                    valid: false,
                    reason: "stream locked or disturbed"
                };
            }
            // Other read errors — pass through (stream readiness timeout will catch truly broken streams)
            return {
                valid: true
            };
        }
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json") && !contentType.includes("text/")) {
        return {
            valid: true
        };
    }
    let cloned;
    try {
        cloned = response.clone();
    } catch  {
        return {
            valid: true
        };
    }
    let text;
    try {
        text = await cloned.text();
    } catch  {
        return {
            valid: true
        };
    }
    if (!text || text.trim().length === 0) {
        return {
            valid: false,
            reason: "empty response body"
        };
    }
    let json;
    try {
        json = JSON.parse(text);
    } catch  {
        if (text.startsWith("data:") || text.startsWith("event:")) return {
            valid: true
        };
        return {
            valid: false,
            reason: "response is not valid JSON"
        };
    }
    // Feature 4985: apply the combo's configured response-body predicate. A failure here
    // fails over to the next target via the same path as the built-in empty-content checks.
    if (responseValidation) {
        const verdict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$responseValidation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateResponseValidation"])(json, responseValidation);
        if (!verdict.valid) {
            return {
                valid: false,
                reason: verdict.reason
            };
        }
    }
    // Issue #6427: a masked 200 — an OpenAI-shape top-level `error` object, or a
    // known exhaustion phrase in the error envelope — is a failure regardless of
    // whether `choices`/`output` also look structurally present (some providers
    // echo a stub completion alongside the error). Checked unconditionally, before
    // any shape-specific branch, so it can't be shadowed by an otherwise-valid body.
    const rawError = json?.error;
    const errorIsMeaningful = typeof rawError === "string" && rawError.length > 0 || !!rawError && typeof rawError === "object" && Object.keys(rawError).length > 0;
    if (errorIsMeaningful) {
        const envelopeText = extractEnvelopeErrorText(json);
        const errMsg = rawError && typeof rawError === "object" && typeof rawError.message === "string" ? rawError.message : envelopeText || JSON.stringify(rawError).substring(0, 200);
        return {
            valid: false,
            reason: `upstream error in 200 body: ${errMsg}`
        };
    }
    {
        const envelopeText = extractEnvelopeErrorText(json);
        if (envelopeText && EXHAUSTION_MARKER_PATTERN.test(envelopeText)) {
            const snippet = envelopeText.length > 80 ? `${envelopeText.slice(0, 80)}…` : envelopeText;
            return {
                valid: false,
                reason: `upstream exhaustion marker in 200 body: ${snippet}`
            };
        }
    }
    const choices = json?.choices;
    if (json?.object === "response") {
        if (!responsesApiOutputHasContent(json.output)) return {
            valid: false,
            reason: "empty_choices"
        };
        const status = typeof json.status === "string" ? json.status : "";
        if (status && ![
            "completed",
            "done"
        ].includes(status)) {
            return {
                valid: false,
                reason: "no_terminal"
            };
        }
        return {
            valid: true,
            clonedResponse: new Response(text, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            })
        };
    }
    if (!Array.isArray(choices) || choices.length === 0) {
        // `json?.error` is already handled unconditionally above (#6427); reaching
        // here means no error envelope was present.
        if (json?.output || json?.result || json?.data || json?.response) return {
            valid: true
        };
        return {
            valid: true
        };
    }
    const firstChoice = choices[0];
    const message = firstChoice?.message || firstChoice?.delta;
    if (!message) {
        return {
            valid: false,
            reason: "choice has no message object"
        };
    }
    const content = message.content;
    const toolCalls = message.tool_calls;
    // Issue #2341: Reasoning models (Kimi-K2.5-TEE, GLM-5-TEE, etc.) emit their
    // output in `reasoning_content` (or `reasoning`) with `content: null`. The
    // validator used to flag those as empty and trigger a false-positive 502
    // fallback. Count a non-empty reasoning_content as valid output too.
    const reasoningContent = message.reasoning_content ?? message.reasoning;
    const hasReasoningContent = typeof reasoningContent === "string" && reasoningContent.trim().length > 0;
    // Issue #7000: content can be a string, an array of content parts
    // (multimodal), or null. An empty array [] or an array of empty parts
    // must NOT count as valid content — only arrays with at least one
    // non-empty text/image part do.
    let hasContent;
    if (Array.isArray(content)) {
        hasContent = content.some((part)=>!!part && typeof part === "object" && (typeof part.text === "string" && part.text.trim().length > 0 || part.type === "image_url" || part.type === "input_audio" || part.type === "file"));
    } else {
        hasContent = content !== null && content !== undefined && content !== "" && (typeof content !== "string" || content.trim().length > 0) || hasReasoningContent;
    }
    const hasToolCalls = Array.isArray(toolCalls) && toolCalls.length > 0;
    if (!hasContent && !hasToolCalls) {
        return {
            valid: false,
            reason: "empty content and no tool_calls in response"
        };
    }
    // Issue #3587: Reasoning models (deepseek-v4-flash, nemotron, etc.) may consume
    // ALL max_tokens for reasoning_tokens, leaving content empty. When content is
    // empty but reasoning_content exists, and usage shows reasoning consumed nearly
    // all completion tokens, treat as invalid so the combo loop retries with more
    // tokens or falls back to a non-reasoning model.
    const contentIsEmpty = content === null || content === undefined || content === "";
    if (contentIsEmpty && hasReasoningContent && !hasToolCalls) {
        const usage = json?.usage;
        if (usage) {
            const completionTokens = Number(usage.completion_tokens) || 0;
            const reasoningTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getReasoningTokens"])(usage);
            // If reasoning consumed 90%+ of completion tokens, the model ran out of
            // budget before producing any content output.
            if (completionTokens > 0 && reasoningTokens >= completionTokens * 0.9) {
                return {
                    valid: false,
                    reason: `reasoning consumed ${reasoningTokens}/${completionTokens} tokens — no content output`
                };
            }
        }
    }
    return {
        valid: true,
        clonedResponse: new Response(text, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        })
    };
}
function releaseQualityClone(clone, original, quality) {
    if (clone === original) return;
    void quality.clonedResponse?.body?.cancel().catch(()=>{});
}
function releaseRejectedQualityResponse(clone, original) {
    if (clone !== original) {
        void clone.body?.cancel().catch(()=>{});
    }
    void original.body?.cancel().catch(()=>{});
}
}),
"[project]/open-sse/services/combo/comboCooldownRetry.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * comboCooldownRetry.ts — pure decision helper for the quota-share combo
 * cooldown-aware retry (Variante A).
 *
 * Problem it solves
 * -----------------
 * In a single-connection quota-share combo (`qtSd/…`), when the upstream
 * returns a SHORT transient 429 (reset in a few seconds), the combo loop
 * treats the only target as locked-by-resilience, skips it, and crystallizes a
 * 429 `model_cooldown` to the client immediately — even though waiting a couple
 * of seconds would let the same connection succeed. This helper decides whether
 * `handleComboChat` should WAIT for that short cooldown and re-dispatch instead
 * of propagating the 429.
 *
 * Why a pure helper
 * -----------------
 * The actual wait (`waitForCooldownAwareRetry`) and the lock lookup
 * (`getModelLockoutInfo`) live in `handleComboChat`; only the *gating policy*
 * lives here. Keeping the policy pure (no I/O, no clock) means every branch is
 * unit-testable deterministically and the orchestration in combo.ts stays thin.
 *
 * SECURITY — `quota_exhausted` must be excluded
 * ---------------------------------------------
 * `isRetryableModelLockoutReason` (src/sse/services/auth.ts:533) considers
 * `quota_exhausted` RETRYABLE — its NON_RETRYABLE set only holds
 * `not_found`/`not_found_local`. But `recordModelLockoutFailure`
 * (accountFallback.ts) locks a quota-exhausted model UNTIL MIDNIGHT. If this
 * helper trusted that classifier, a combo would wait until midnight. So this
 * helper uses its OWN allow-list semantics: a reason qualifies for a wait only
 * when it is a known short/transient reason AND is not in the explicit
 * non-retryable set below. The small `maxWaitMs` ceiling is the second barrier.
 */ /**
 * Reasons that must NEVER trigger a wait, regardless of the upstream-provided
 * retry hint. `quota_exhausted` is the critical one (locked until midnight);
 * the auth/not-found reasons can never be cured by waiting a few seconds.
 */ __turbopack_context__.s([
    "COMBO_COOLDOWN_NON_RETRYABLE_REASONS",
    ()=>COMBO_COOLDOWN_NON_RETRYABLE_REASONS,
    "COMBO_COOLDOWN_RETRYABLE_REASONS",
    ()=>COMBO_COOLDOWN_RETRYABLE_REASONS,
    "COMBO_COOLDOWN_WAIT_MARGIN_MS",
    ()=>COMBO_COOLDOWN_WAIT_MARGIN_MS,
    "resolveComboCooldownWaitDecision",
    ()=>resolveComboCooldownWaitDecision,
    "shouldWaitForComboCooldown",
    ()=>shouldWaitForComboCooldown
]);
const COMBO_COOLDOWN_NON_RETRYABLE_REASONS = new Set([
    "quota_exhausted",
    "auth_error",
    "not_found",
    "not_found_local"
]);
const COMBO_COOLDOWN_RETRYABLE_REASONS = new Set([
    "rate_limit",
    "rate_limited",
    "transient",
    "overloaded",
    "server_error"
]);
function toFiniteWaitMs(value) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        return value;
    }
    return 0;
}
function isRetryableComboCooldownReason(reason) {
    if (typeof reason !== "string" || reason.length === 0) return false;
    if (COMBO_COOLDOWN_NON_RETRYABLE_REASONS.has(reason)) return false;
    return COMBO_COOLDOWN_RETRYABLE_REASONS.has(reason);
}
function shouldWaitForComboCooldown(input) {
    const { reason, attempt, budgetLeftMs, settings } = input;
    const waitMs = toFiniteWaitMs(input.waitMs);
    const wait = settings.enabled === true && isRetryableComboCooldownReason(reason) && waitMs > 0 && waitMs <= settings.maxWaitMs && attempt < settings.maxAttempts && budgetLeftMs >= waitMs;
    return {
        wait,
        waitMs
    };
}
const COMBO_COOLDOWN_WAIT_MARGIN_MS = 50;
function resolveComboCooldownWaitDecision(input) {
    const { targets, earliestRetryAfter, attempt, budgetLeftMs, settings, lookupLock, computeWaitMs } = input;
    // Short-circuit before any lookup when the feature is off.
    if (!settings.enabled) return {
        wait: false,
        waitMs: 0,
        reason: null
    };
    let best = null;
    for (const target of targets){
        const provider = typeof target.provider === "string" ? target.provider : "";
        if (!provider) continue;
        const connectionId = typeof target.connectionId === "string" ? target.connectionId : "";
        const info = lookupLock(provider, connectionId, target);
        if (!info) continue;
        const remainingMs = typeof info.remainingMs === "number" && Number.isFinite(info.remainingMs) ? info.remainingMs : 0;
        if (remainingMs <= 0) continue;
        if (!best || remainingMs < best.remainingMs) {
            best = {
                reason: info.reason,
                remainingMs
            };
        }
    }
    if (!best) return {
        wait: false,
        waitMs: 0,
        reason: null
    };
    // Wait long enough to actually clear the lock: the larger of the lock's own
    // remaining time and the upstream retry-after hint, plus a small margin.
    const rawHintWaitMs = computeWaitMs(earliestRetryAfter);
    const hintWaitMs = typeof rawHintWaitMs === "number" && Number.isFinite(rawHintWaitMs) && rawHintWaitMs > 0 ? rawHintWaitMs : 0;
    const waitMs = Math.max(best.remainingMs, hintWaitMs) + COMBO_COOLDOWN_WAIT_MARGIN_MS;
    const decision = shouldWaitForComboCooldown({
        reason: best.reason,
        waitMs,
        attempt,
        budgetLeftMs,
        settings
    });
    return {
        ...decision,
        reason: typeof best.reason === "string" ? best.reason : null
    };
}
}),
"[project]/open-sse/services/combo/targetExhaustion.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyComboTargetExhaustion",
    ()=>applyComboTargetExhaustion
]);
/**
 * Shared upstream-error → exhaustion-set classification for the combo dispatchers
 * (Quality Gate v2 / Fase 9 — combo god-file decomposition, dispatcher de-dup fase 2b).
 *
 * Both dispatchers (handleComboChat's speculative loop + handleRoundRobinCombo's rotation)
 * ran a near-identical block after each target's upstream error: mark the provider fully
 * exhausted (#1731), the provider:connection pair connection-errored (#1731v2), or the
 * provider transiently rate-limited — driving same-request target skipping (read back by
 * getExhaustedTargetSkipReason). The SET mutations are byte-identical to the previous inline
 * code in BOTH dispatchers; the only differences (preserved here as parameters) were:
 *   - the log tag ("COMBO" / "COMBO-RR");
 *   - the round-robin's extra `|| isAllAccountsRateLimited` term in the exhaustion test
 *     (`allAccountsRateLimited`, false for handleComboChat);
 *   - the quota-exhausted log LEVEL ("info" for handleComboChat, "debug" for round-robin).
 * The only standardization is the log MESSAGE wording (round-robin previously dropped the
 * "on remaining targets" suffix) — diagnostic text only, same #code + provider info.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Connection-level failure statuses: the provider connection itself is likely bad (upstream
// unreachable, proxy/gateway error), so remaining same-connection targets are skipped.
const CONNECTION_LEVEL_ERROR_STATUSES = [
    408,
    500,
    502,
    503,
    504,
    524
];
// Auth-level failure statuses: the provider's credentials are invalid/expired (401) or
// forbidden (403). When the failing target carries a connectionId, only that connection's
// credentials are bad — sibling connections on the same provider may still be healthy, so
// mark connection-level exhaustion (mirrors markConnectionLevelExhaustion). Only fall back to
// whole-provider exhaustion when no connectionId is available (#8133: combo engine wastes
// attempts on dead connections; #8137: whole-provider exhaustion wrongly skipped healthy
// sibling connections on the same provider).
const AUTH_LEVEL_ERROR_STATUSES = [
    401,
    403
];
// #5085: an "empty content" 502 is the synthetic status chatCore assigns to a provider that
// answered HTTP 200 with no usable completion (isEmptyContentResponse). The connection is
// HEALTHY — it just returned an empty body — so this must NOT be classified as a connection
// failure (which would exhaust the whole provider/connection and skip every remaining
// same-provider leg via #1731v2). It is a model-level transient failure: advance to the next
// leg, leaving the rest of that provider's legs eligible.
function isEmptyContentFailure(status, errorText) {
    return status === 502 && (/empty content/i.test(errorText) || /empty response/i.test(errorText));
}
function applyComboTargetExhaustion(target, opts) {
    const { result, sets, log, tag } = opts;
    const provider = target.provider;
    // #8133/#8137: auth-level failures (401/403) mean that connection's credentials are bad.
    // Split out to keep applyComboTargetExhaustion under the complexity ceiling.
    if (AUTH_LEVEL_ERROR_STATUSES.includes(result.status) && provider && provider !== "unknown") {
        markAuthLevelExhaustion(target, {
            result,
            sets,
            log,
            tag
        });
        return true;
    }
    // #1731: full provider quota exhausted → skip remaining same-provider targets this request.
    const providerExhausted = isProviderQuotaExhausted(provider, opts);
    if (providerExhausted) {
        markProviderQuotaExhaustion(provider, opts);
    } else {
        markTransientOrConnectionLevel(target, opts);
    }
    return providerExhausted;
}
/**
 * #1731: full-provider quota-exhaustion classification, split out of applyComboTargetExhaustion
 * to keep it under the complexity ceiling. Passthrough/per-model-quota providers multiplex
 * models behind one connection, so a quota 429 for one model must NOT skip fallback targets for
 * another model on the same provider.
 */ function isProviderQuotaExhausted(provider, opts) {
    const { rawModel, fallbackResult, structuredError, errorText, allAccountsRateLimited } = opts;
    return Boolean(provider && provider !== "unknown") && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasPerModelQuota"])(provider, rawModel) && ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isProviderExhaustedReason"])(fallbackResult) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["classifyErrorText"])(structuredError?.code || errorText) === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["RateLimitReason"].QUOTA_EXHAUSTED || allAccountsRateLimited);
}
function markProviderQuotaExhaustion(provider, opts) {
    const { sets, log, tag, exhaustedLogLevel } = opts;
    sets.exhaustedProviders.add(provider);
    const emit = exhaustedLogLevel === "debug" ? log.debug : log.info;
    emit?.(tag, `Provider ${provider} quota exhausted — marking for skip on remaining targets (#1731)`);
}
/**
 * Not-quota-exhausted path: track transient 429 rate-limiting, then delegate to the
 * connection-level (408/5xx) classification. Split out of applyComboTargetExhaustion to keep
 * it under the complexity ceiling.
 */ function markTransientOrConnectionLevel(target, opts) {
    const { result, errorText, rawModel, isTokenLimitBreach, sets, log, tag, structuredError } = opts;
    const provider = target.provider;
    if (result.status === 429 && !isTokenLimitBreach && provider && provider !== "unknown") {
        sets.transientRateLimitedProviders.add(provider);
    }
    markConnectionLevelExhaustion(target, {
        result,
        errorText,
        sets,
        log,
        tag,
        rawModel,
        structuredError
    });
}
/**
 * #8133/#8137: mark an auth-level (401/403) failure. When the target carries a connectionId,
 * only that connection's credentials are bad — sibling connections on the same provider may
 * still be healthy, so mark connection-level exhaustion (mirrors markConnectionLevelExhaustion).
 * Falls back to whole-provider exhaustion only when no connectionId is available, since every
 * model behind an unscoped provider will fail identically.
 */ function markAuthLevelExhaustion(target, opts) {
    const { result, sets, log, tag } = opts;
    const provider = target.provider;
    const connId = target.connectionId ?? undefined;
    if (connId) {
        sets.exhaustedConnections.add(`${provider}:${connId}`);
        log.info(tag, `Provider ${provider} connection ${connId} auth failure (${result.status}) — marking for skip on remaining targets (#8133)`);
    } else {
        sets.exhaustedProviders.add(provider);
        log.info(tag, `Provider ${provider} auth failure (${result.status}) — marking for skip on remaining targets (#8133)`);
    }
}
/**
 * #1731v2: connection-level errors (408/5xx, excluding the OmniRoute circuit-open signal) suggest
 * the provider connection itself is bad → skip remaining same-connection (or same-provider, when
 * no connectionId) targets this request. Only runs when the provider was NOT already marked fully
 * exhausted above. Split out to keep applyComboTargetExhaustion under the complexity ceiling.
 */ function markConnectionLevelExhaustion(target, opts) {
    const { result, errorText, sets, log, tag, rawModel, structuredError } = opts;
    const provider = target.provider;
    if (!provider || provider === "unknown" || !CONNECTION_LEVEL_ERROR_STATUSES.includes(result.status) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isProviderCircuitOpenResult"])(result, errorText) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRequestScopedUpstreamFailure"])(structuredError) || // #5085: empty-content 502 is a healthy connection returning no body — model-level, not
    // connection-level. Don't exhaust the provider; let the remaining legs (incl. same-provider)
    // be tried in-request.
    isEmptyContentFailure(result.status, errorText) || result.status === 500 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["hasPerModelQuota"])(provider, rawModel)) {
        return;
    }
    const connId = target.connectionId ?? undefined;
    if (connId) {
        sets.exhaustedConnections.add(`${provider}:${connId}`);
        log.info(tag, `Provider ${provider} connection ${connId} error (${result.status}) — marking for skip on remaining targets (#1731v2)`);
    } else {
        sets.exhaustedProviders.add(provider);
        log.info(tag, `Provider ${provider} connection error (${result.status}) — marking for skip on remaining targets (#1731)`);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/comboVisibility.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "isComboModelVisible",
    ()=>isComboModelVisible
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function isComboModelVisible(modelStr, providerId = null, hiddenModelsByProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHiddenModelsByProvider"])()) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(modelStr);
    const hasExplicitProvider = providerId && providerId !== parsed.provider && providerId !== parsed.providerAlias;
    const rawModel = hasExplicitProvider ? modelStr : parsed.model || modelStr;
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveCanonicalProviderModel"])(providerId || parsed.provider || parsed.providerAlias, rawModel);
    return !resolved.provider || !resolved.model || !hiddenModelsByProvider.get(resolved.provider)?.has(resolved.model);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/contextOverrideGate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "evaluateContextLimit",
    ()=>evaluateContextLimit
]);
/**
 * Context-fit evaluation for combo routing's compatibility filter, extracted
 * from comboStructure.ts to keep that file under the file-size cap (PR
 * #7933's model_context_override fix pushed it over).
 *
 * evaluateContextLimit() is the single chokepoint both compatibility-check
 * call sites in comboStructure.ts (hasKnownCompatibleContextLimit,
 * getTargetCompatibilityFailures) go through. It first consults a persisted
 * per-model context override, then falls back to the catalog's
 * maxInputTokens/contextWindow limits.
 *
 * Override rationale (Feature 5004): the catalog's `maxInputTokens` can be a
 * deliberately smaller *client-facing* hint (e.g. set below the true window so
 * coding agents auto-compact — #6191); using it to filter fallback targets
 * wrongly drops otherwise-capable providers for large prompts, collapsing the
 * pool to one provider and producing a hard 503 with no fallback once that
 * provider's quota is exhausted. An operator-set or auto-discovered override
 * reflects the real capacity, so it supersedes both catalog limits. Uses the
 * resolved exact override (`getResolvedModelContextOverride` returns `null` when none is set) —
 * NOT `getModelContextLimitForModelString`, which falls back to
 * `contextWindow` and would therefore bypass the `maxInputTokens` cap for
 * every model, not just overridden ones.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)");
;
/**
 * Resolve the context-fit verdict from a persisted per-model override, if one
 * is set. Returns `undefined` when there is no `modelStr` or no override
 * exists, so the caller falls through to the catalog-based check; otherwise
 * returns the fit verdict for the override itself.
 */ function resolveContextOverrideVerdict(modelStr, requiredContextTokens) {
    if (!modelStr) return undefined;
    const override = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResolvedModelContextOverride"])(modelStr);
    if (override == null) return undefined;
    return override >= requiredContextTokens;
}
function evaluateContextLimit(capabilities, requirements, modelStr) {
    const overrideVerdict = resolveContextOverrideVerdict(modelStr, requirements.requiredContextTokens);
    if (overrideVerdict !== undefined) return overrideVerdict;
    const hasMaxInput = capabilities.maxInputTokens != null;
    const hasContextWindow = capabilities.contextWindow != null;
    // Neither limit is known — cannot judge.
    if (!hasMaxInput && !hasContextWindow) return null;
    // The input-only cap must accommodate the estimated input.
    const inputFits = hasMaxInput ? capabilities.maxInputTokens >= requirements.estimatedInputTokens : true;
    // The total window must accommodate input + requested output. The output
    // reserve is enforced separately via `maxOutputTokens`, but when a model
    // exposes both `maxInputTokens` and `contextWindow` the two must not be
    // checked in isolation: a request whose input fits `maxInputTokens` but whose
    // input + output exceeds `contextWindow` must still be rejected (#7039
    // follow-up — shared-window models where `maxInputTokens` defaults to the
    // total window size).
    const totalFits = hasContextWindow ? capabilities.contextWindow >= requirements.requiredContextTokens : true;
    return inputFits && totalFits;
}
}),
"[project]/open-sse/services/combo/knownContextOverflow.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "getKnownContextLimit",
    ()=>getKnownContextLimit,
    "getKnownContextOverflow",
    ()=>getKnownContextOverflow,
    "hasEstimableContent",
    ()=>hasEstimableContent
]);
/**
 * Known context-overflow rejection, extracted from comboStructure.ts to keep
 * that file under the file-size cap (#7177).
 *
 * Fixes: routing a request to a combo whose targets all have a KNOWN (not
 * unknown/fail-open) context window too small for the request used to be
 * discovered only after every target was tried and failed upstream — burning
 * retries/cooldowns on a request that could never succeed. This lets the
 * combo dispatcher reject it up front, before exhausting providers.
 *
 * getKnownContextLimit/hasEstimableContent also
 * live here (moved from comboStructure.ts, same file-size-cap motivation):
 * they are the "how big is a target's known context window" primitives, so
 * they belong next to the overflow check that is their main consumer.
 * comboStructure.ts's own compatibility filter now decides fit via its
 * evaluateContextLimit (#7052); only hasEstimableContent is imported back.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/modelCapabilities.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function hasEstimableContent(value) {
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
}
function getKnownContextLimit(capabilities, requestedOutputTokens = 0) {
    const limits = [];
    if (capabilities.maxInputTokens != null) {
        limits.push(capabilities.maxInputTokens + requestedOutputTokens);
    }
    if (capabilities.contextWindow != null) {
        limits.push(capabilities.contextWindow);
    }
    return limits.length > 0 ? Math.min(...limits) : null;
}
function getKnownContextOverflow(targets, body) {
    if (targets.length === 0) return null;
    const requirements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["deriveRequestCompatibilityRequirements"])(body);
    if (requirements.requiredContextTokens <= 0) return null;
    const limits = targets.map((target)=>getKnownContextLimit((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(target.modelStr), requirements.requestedOutputTokens));
    if (limits.some((limit)=>limit === null)) return null;
    const knownLimits = limits;
    const maxKnownContextTokens = Math.max(...knownLimits);
    if (maxKnownContextTokens >= requirements.requiredContextTokens) return null;
    return {
        estimatedInputTokens: requirements.estimatedInputTokens,
        requestedOutputTokens: requirements.requestedOutputTokens,
        requiredContextTokens: requirements.requiredContextTokens,
        maxKnownContextTokens,
        targetCount: targets.length
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/targetSorters.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeModelEntry",
    ()=>normalizeModelEntry,
    "orderTargetsByPowerOfTwoChoices",
    ()=>orderTargetsByPowerOfTwoChoices,
    "orderTargetsForWeightedFallback",
    ()=>orderTargetsForWeightedFallback,
    "selectWeightedTarget",
    ()=>selectWeightedTarget,
    "sortModelsByCost",
    ()=>sortModelsByCost,
    "sortTargetsByCost",
    ()=>sortTargetsByCost,
    "sortTargetsByUsage",
    ()=>sortTargetsByUsage
]);
/**
 * Combo target-ordering / sorting helpers extracted from combo.ts.
 *
 * Weighted selection, cost / usage / power-of-two-choices ordering, and the
 * model-entry normalizer moved out of the combo.ts god-file (Quality Gate v2 /
 * Fase 9). Logic unchanged; the helpers used by the combo handlers (which stay
 * in combo.ts) are imported back from this module. No barrel import — pure leaf.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/secureRandom.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/comboMetrics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
;
;
;
;
;
function normalizeModelEntry(entry) {
    return {
        model: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboStepTarget"])(entry) || "",
        weight: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboStepWeight"])(entry)
    };
}
function selectWeightedTarget(targets) {
    if (targets.length === 0) return null;
    const totalWeight = targets.reduce((sum, target)=>sum + (target.weight || 0), 0);
    if (totalWeight <= 0) {
        return targets[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["secureRandomInt"])(targets.length)];
    }
    let random = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["secureRandomFloat"])() * totalWeight;
    for (const target of targets){
        random -= target.weight || 0;
        if (random <= 0) return target;
    }
    return targets.at(-1);
}
function orderTargetsForWeightedFallback(targets, selectedExecutionKey, preserveExistingOrder = false) {
    const selected = targets.find((target)=>target.executionKey === selectedExecutionKey);
    const rest = targets.filter((target)=>target.executionKey !== selectedExecutionKey);
    if (!preserveExistingOrder) {
        rest.sort((a, b)=>b.weight - a.weight);
    }
    return selected ? [
        selected,
        ...rest
    ] : rest;
}
async function sortModelsByCost(models) {
    try {
        const { getPricingForModel } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const withCost = await Promise.all(models.map(async (modelStr)=>{
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(modelStr);
            const provider = parsed.provider || parsed.providerAlias || "unknown";
            const model = parsed.model || modelStr;
            try {
                const pricing = await getPricingForModel(provider, model);
                const cost = Number(pricing?.input);
                return {
                    modelStr,
                    cost: Number.isFinite(cost) ? cost : Infinity
                };
            } catch  {
                return {
                    modelStr,
                    cost: Infinity
                };
            }
        }));
        withCost.sort((a, b)=>a.cost - b.cost);
        return withCost.map((e)=>e.modelStr);
    } catch  {
        // If pricing lookup fails entirely, return original order
        return models;
    }
}
async function sortTargetsByCost(targets) {
    const orderedModels = await sortModelsByCost(targets.map((target)=>target.modelStr));
    const byModel = new Map();
    for (const target of targets){
        const queue = byModel.get(target.modelStr) || [];
        queue.push(target);
        byModel.set(target.modelStr, queue);
    }
    return orderedModels.map((modelStr)=>{
        const queue = byModel.get(modelStr);
        return queue?.shift() || null;
    }).filter((target)=>target !== null);
}
function sortTargetsByUsage(targets, comboName) {
    const metrics = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboMetrics"])(comboName);
    if (!metrics) return targets;
    // Key on executionKey (unique per model + account) so a combo that repeats the
    // same modelStr across DISTINCT accounts distributes by per-account usage
    // instead of by the shared modelStr. The old code grouped targets under
    // modelStr and read byModel[modelStr] (which aggregates every account of that
    // model), so all accounts collapsed into one bucket and the first account
    // always won — exhausting it while the others stayed idle (#7015). Per-target
    // usage lives in byTarget[executionKey]; unknown targets rank as 0.
    const withUsage = targets.map((target)=>{
        const requests = metrics.byTarget?.[target.executionKey]?.requests ?? 0;
        return {
            target,
            requests
        };
    });
    withUsage.sort((a, b)=>a.requests - b.requests);
    return withUsage.map((e)=>e.target);
}
function getP2CTargetScore(target, metrics) {
    const breakerState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(target.provider)?.getStatus?.()?.state;
    if (breakerState === "OPEN") return -Infinity;
    const modelMetric = metrics?.byModel?.[target.modelStr] || null;
    const successRate = Number(modelMetric?.successRate);
    const avgLatency = Number(modelMetric?.avgLatencyMs);
    const successScore = Number.isFinite(successRate) ? successRate / 100 : 0.5;
    const latencyScore = Number.isFinite(avgLatency) && avgLatency > 0 ? 1 / Math.log10(avgLatency + 10) : 0.25;
    const breakerPenalty = breakerState === "HALF_OPEN" ? 0.25 : 0;
    return successScore + latencyScore - breakerPenalty;
}
function orderTargetsByPowerOfTwoChoices(targets, comboName) {
    if (targets.length <= 1) return targets;
    const metrics = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboMetrics"])(comboName);
    const firstIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["secureRandomInt"])(targets.length);
    let secondIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["secureRandomInt"])(targets.length - 1);
    if (secondIndex >= firstIndex) secondIndex++;
    const first = targets[firstIndex];
    const second = targets[secondIndex];
    const selectedIndex = getP2CTargetScore(second, metrics) > getP2CTargetScore(first, metrics) ? secondIndex : firstIndex;
    return [
        targets[selectedIndex],
        ...targets.filter((_, index)=>index !== selectedIndex)
    ];
}
}),
"[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "computeCompatRejectedTargets",
    ()=>computeCompatRejectedTargets,
    "deriveRequestCompatibilityRequirements",
    ()=>deriveRequestCompatibilityRequirements,
    "describeCapabilityFilterExhaustion",
    ()=>describeCapabilityFilterExhaustion,
    "filterTargetsByRequestCompatibility",
    ()=>filterTargetsByRequestCompatibility,
    "filterVisibleComboTargets",
    ()=>filterVisibleComboTargets,
    "getComboFromData",
    ()=>getComboFromData,
    "getComboModelsFromData",
    ()=>getComboModelsFromData,
    "getModelContextLimitForModelString",
    ()=>getModelContextLimitForModelString,
    "isVisionIncompatibleTarget",
    ()=>isVisionIncompatibleTarget,
    "providerSupportsEmulatedToolCalling",
    ()=>providerSupportsEmulatedToolCalling,
    "resolveComboRuntimeUnits",
    ()=>resolveComboRuntimeUnits,
    "resolveComboTargets",
    ()=>resolveComboTargets,
    "resolveNestedComboModels",
    ()=>resolveNestedComboModels,
    "resolveNestedComboTargets",
    ()=>resolveNestedComboTargets,
    "resolveWeightedStepGroups",
    ()=>resolveWeightedStepGroups,
    "resolveWeightedTargets",
    ()=>resolveWeightedTargets,
    "sortTargetsByContextSize",
    ()=>sortTargetsByContextSize,
    "validateComboDAG",
    ()=>validateComboDAG
]);
/**
 * Combo structure resolution extracted from combo.ts.
 *
 * Runtime-step normalization, nested-combo / DAG expansion, weighted/direct
 * target resolution, and request-compatibility filtering moved out of the
 * combo.ts god-file (Quality Gate v2 / Fase 9). Logic unchanged; the public
 * entry points (resolveComboTargets, resolveNestedComboTargets, getComboFromData,
 * getComboModelsFromData, validateComboDAG, resolveNestedComboModels,
 * filterTargetsByRequestCompatibility) are re-exported from combo.ts for the
 * ~20 external consumers (chatCore.ts, the /api/combos routes, embeddings, etc.).
 * Context-window metadata is advisory: known-fitting targets are ordered first,
 * while catalog-too-small targets remain available for runtime fallback.
 * No barrel import — depends only on sibling leaves.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/models.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/modelCapabilities.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboData.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboVisibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboVisibility.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$contextOverrideGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/contextOverrideGate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$knownContextOverflow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/knownContextOverflow.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/targetSorters.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboVisibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$knownContextOverflow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboVisibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$knownContextOverflow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function providerSupportsEmulatedToolCalling(providerIdOrAlias) {
    if (!providerIdOrAlias) return false;
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderById"])(providerIdOrAlias) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderByAlias"])(providerIdOrAlias) || null;
    if (!provider || typeof provider !== "object") return false;
    return provider.toolCalling === "emulated";
}
function toTrimmedString(value) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function toComboLike(combo) {
    return {
        ...combo,
        id: toTrimmedString(combo.id) || undefined,
        name: toTrimmedString(combo.name) || "",
        models: Array.isArray(combo.models) ? combo.models : [],
        config: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(combo.config) ? combo.config : null,
        autoConfig: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(combo.autoConfig) ? combo.autoConfig : null,
        context_cache_protection: typeof combo.context_cache_protection === "boolean" || typeof combo.context_cache_protection === "number" ? combo.context_cache_protection : undefined,
        system_message: typeof combo.system_message === "string" ? combo.system_message : null
    };
}
function getCombosArray(allCombos) {
    const combos = Array.isArray(allCombos) ? allCombos : allCombos?.combos || [];
    return combos.map((combo)=>toComboLike(combo));
}
function buildExecutionKey(path, stepId) {
    return [
        ...path,
        stepId
    ].join(">");
}
function normalizeRuntimeStep(entry, comboName, index, allCombos, path = []) {
    const step = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboStep"])(entry, {
        comboName,
        index,
        allCombos
    });
    if (!step) return null;
    const executionKey = buildExecutionKey(path, step.id);
    const label = typeof step.label === "string" ? step.label : null;
    const weight = step.weight || 0;
    if (step.kind === "combo-ref") {
        return {
            kind: "combo-ref",
            stepId: step.id,
            executionKey,
            comboName: step.comboName,
            weight,
            label
        };
    }
    const modelStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getComboModelString"])(step);
    if (!modelStr) return null;
    return {
        kind: "model",
        stepId: step.id,
        executionKey,
        modelStr,
        provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTargetProvider"])(modelStr, step.providerId),
        providerId: step.providerId || null,
        connectionId: step.connectionId || null,
        // #3266: a per-step account allowlist scopes round-robin/weighted selection
        // to a subset of the provider's connections. This is the second writer of
        // `allowedConnectionIds` (tag routing is the first); both feed the existing
        // credential-selection filter in auth.ts.
        ...Array.isArray(step.allowedConnectionIds) && step.allowedConnectionIds.length > 0 ? {
            allowedConnectionIds: step.allowedConnectionIds
        } : {},
        weight,
        label,
        prompt: step.prompt || null
    };
}
function isComboTargetVisible(target, hiddenModelsByProvider) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboVisibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isComboModelVisible"])(target.modelStr, target.providerId || target.provider, hiddenModelsByProvider);
}
function filterVisibleComboTargets(targets, hiddenModelsByProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHiddenModelsByProvider"])()) {
    return targets.filter((target)=>isComboTargetVisible(target, hiddenModelsByProvider));
}
function getTopLevelRuntimeSteps(combo, allCombos, path = []) {
    return (combo.models || []).map((entry, index)=>normalizeRuntimeStep(entry, combo.name, index, allCombos, path)).filter((entry)=>entry !== null);
}
function getCompositeTierStepOrder(combo) {
    const compositeTiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(combo?.config) ? combo.config.compositeTiers : null;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(compositeTiers)) return [];
    const defaultTier = toTrimmedString(compositeTiers.defaultTier);
    const tiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(compositeTiers.tiers) ? compositeTiers.tiers : null;
    if (!defaultTier || !tiers) return [];
    const orderedStepIds = [];
    const visitedTiers = new Set();
    const seenStepIds = new Set();
    const tierEntries = new Map(Object.entries(tiers).map(([tierName, rawTier])=>{
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(rawTier)) return null;
        const normalizedTierName = toTrimmedString(tierName);
        const stepId = toTrimmedString(rawTier.stepId);
        const fallbackTier = toTrimmedString(rawTier.fallbackTier);
        if (!normalizedTierName || !stepId) return null;
        return [
            normalizedTierName,
            {
                stepId,
                fallbackTier
            }
        ];
    }).filter((entry)=>entry !== null));
    let currentTier = defaultTier;
    while(currentTier && tierEntries.has(currentTier) && !visitedTiers.has(currentTier)){
        visitedTiers.add(currentTier);
        const entry = tierEntries.get(currentTier);
        if (!entry) break;
        if (!seenStepIds.has(entry.stepId)) {
            orderedStepIds.push(entry.stepId);
            seenStepIds.add(entry.stepId);
        }
        currentTier = entry.fallbackTier;
    }
    for (const entry of tierEntries.values()){
        if (!seenStepIds.has(entry.stepId)) {
            orderedStepIds.push(entry.stepId);
            seenStepIds.add(entry.stepId);
        }
    }
    return orderedStepIds;
}
function hasCompositeTierRuntimeOrder(combo) {
    return getCompositeTierStepOrder(combo).length > 0;
}
function orderRuntimeStepsByCompositeTiers(steps, combo) {
    const orderedStepIds = getCompositeTierStepOrder(combo);
    if (orderedStepIds.length === 0) return steps;
    const byStepId = new Map(steps.map((step)=>[
            step.stepId,
            step
        ]));
    const seen = new Set();
    const ordered = [];
    for (const stepId of orderedStepIds){
        const step = byStepId.get(stepId);
        if (!step || seen.has(step.stepId)) continue;
        ordered.push(step);
        seen.add(step.stepId);
    }
    for (const step of steps){
        if (seen.has(step.stepId)) continue;
        ordered.push(step);
        seen.add(step.stepId);
    }
    return ordered;
}
function getOrderedTopLevelRuntimeSteps(combo, allCombos, path = []) {
    return orderRuntimeStepsByCompositeTiers(getTopLevelRuntimeSteps(combo, allCombos, path), combo);
}
function expandRuntimeStep(step, allCombos, visited = new Set(), depth = 0, path = [], maxDepth = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_COMBO_DEPTH"]) {
    if (step.kind === "model") return [
        step
    ];
    if (depth > maxDepth) return [];
    const combos = getCombosArray(allCombos);
    const nestedCombo = combos.find((combo)=>combo.name === step.comboName);
    if (!nestedCombo || visited.has(step.comboName)) return [];
    return resolveNestedComboTargets(nestedCombo, combos, new Set(visited), depth + 1, [
        ...path,
        step.stepId
    ], maxDepth);
}
function resolveNestedComboTargets(combo, allCombos, visited = new Set(), depth = 0, path = [], maxDepth = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_COMBO_DEPTH"]) {
    const directTargets = (combo.models || []).map((entry, index)=>normalizeRuntimeStep(entry, combo.name, index, null, path)).filter((entry)=>entry?.kind === "model");
    if (depth > maxDepth) return directTargets;
    if (visited.has(combo.name)) return [];
    visited.add(combo.name);
    const runtimeSteps = getOrderedTopLevelRuntimeSteps(combo, allCombos, path);
    const resolved = [];
    for (const step of runtimeSteps){
        if (step.kind === "combo-ref") {
            resolved.push(...expandRuntimeStep(step, allCombos, new Set(visited), depth, path, maxDepth));
            continue;
        }
        resolved.push(step);
    }
    return resolved;
}
function getComboFromData(modelStr, combosData) {
    const combos = getCombosArray(combosData);
    const combo = combos.find((c)=>c.name === modelStr);
    if (combo?.models && combo.models.length > 0) {
        return combo;
    }
    return null;
}
function getComboModelsFromData(modelStr, combosData) {
    const baseModelStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripContextWindowSuffix"])(modelStr);
    const combo = getComboFromData(baseModelStr || modelStr, combosData);
    if (!combo) return null;
    return combo.models.map((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeModelEntry"])(m).model);
}
function validateComboDAG(comboName, allCombos, visited = new Set(), depth = 0, maxDepth = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_COMBO_DEPTH"]) {
    if (depth > maxDepth) {
        throw new Error(`Max combo nesting depth (${maxDepth}) exceeded at "${comboName}"`);
    }
    if (visited.has(comboName)) {
        throw new Error(`Circular combo reference detected: ${comboName}`);
    }
    visited.add(comboName);
    const combos = getCombosArray(allCombos);
    const combo = combos.find((c)=>c.name === comboName);
    if (!combo?.models) return;
    for (const entry of combo.models){
        const modelName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeModelEntry"])(entry).model;
        // Check if this model name is itself a combo (not a provider/model pattern)
        const nestedCombo = combos.find((c)=>c.name === modelName);
        if (nestedCombo) {
            validateComboDAG(modelName, combos, new Set(visited), depth + 1, maxDepth);
        }
    }
}
function resolveNestedComboModels(combo, allCombos, visited = new Set(), depth = 0, maxDepth = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_COMBO_DEPTH"]) {
    if (depth > maxDepth) return combo.models.map((m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeModelEntry"])(m).model);
    if (visited.has(combo.name)) return []; // cycle safety
    visited.add(combo.name);
    const combos = getCombosArray(allCombos);
    const resolved = [];
    for (const entry of combo.models || []){
        const modelName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeModelEntry"])(entry).model;
        const nestedCombo = combos.find((c)=>c.name === modelName);
        if (nestedCombo) {
            // Recursively expand the nested combo
            const nested = resolveNestedComboModels(nestedCombo, combos, new Set(visited), depth + 1, maxDepth);
            resolved.push(...nested);
        } else {
            resolved.push(modelName);
        }
    }
    return resolved;
}
/**
 * Sort models by context window size (largest first) for context-optimized strategy.
 * Uses models.dev synced capabilities to get context limits.
 * @param {Array<string>} models - Model strings in "provider/model" format
 * @returns {Array<string>} Sorted model strings (largest context first)
 */ function sortModelsByContextSize(models) {
    const withContext = models.map((modelStr)=>{
        return {
            modelStr,
            context: getModelContextLimitForModelString(modelStr) ?? 0
        };
    });
    withContext.sort((a, b)=>b.context - a.context);
    return withContext.map((e)=>e.modelStr);
}
function getModelContextLimitForModelString(modelStr) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(modelStr);
    const provider = parsed.provider || parsed.providerAlias || "unknown";
    const model = parsed.model || modelStr;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextLimit"])(provider, model);
}
function getPositiveTokenCount(value) {
    const count = Number(value);
    return Number.isFinite(count) && count > 0 ? Math.ceil(count) : 0;
}
function requestRequiresTools(body) {
    if (Array.isArray(body.tools) && body.tools.length > 0) return true;
    if (Array.isArray(body.functions) && body.functions.length > 0) return true;
    return false;
}
function requestRequiresStructuredOutput(body) {
    const responseFormat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(body.response_format) ? body.response_format : null;
    const type = typeof responseFormat?.type === "string" ? responseFormat.type : null;
    return type === "json_object" || type === "json_schema";
}
function estimateRequestInputTokens(body) {
    const estimatePayload = {};
    for (const key of [
        "messages",
        "input",
        "tools",
        "functions",
        "response_format"
    ]){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$knownContextOverflow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasEstimableContent"])(body[key])) estimatePayload[key] = body[key];
    }
    return Object.keys(estimatePayload).length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateTokens"])(estimatePayload) : 0;
}
function valueContainsImagePart(value, depth = 0) {
    if (depth > 8 || value === null || value === undefined) return false;
    if (typeof value === "string") return value.startsWith("data:image/");
    if (Array.isArray(value)) return value.some((entry)=>valueContainsImagePart(entry, depth + 1));
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(value)) return false;
    const type = typeof value.type === "string" ? value.type.toLowerCase() : null;
    if (type === "image" || type === "image_url" || type === "input_image") return true;
    if ("image_url" in value || "input_image" in value) return true;
    const source = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(value.source) ? value.source : null;
    const mediaType = typeof source?.media_type === "string" ? source.media_type.toLowerCase() : "";
    if (mediaType.startsWith("image/")) return true;
    return Object.values(value).some((entry)=>valueContainsImagePart(entry, depth + 1));
}
function deriveRequestCompatibilityRequirements(body) {
    const estimatedInputTokens = estimateRequestInputTokens(body);
    const requestedOutputTokens = Math.max(getPositiveTokenCount(body.max_tokens), getPositiveTokenCount(body.max_completion_tokens));
    return {
        requiresTools: requestRequiresTools(body),
        requiresVision: valueContainsImagePart(body.messages) || valueContainsImagePart(body.input),
        requiresStructuredOutput: requestRequiresStructuredOutput(body),
        estimatedInputTokens,
        requestedOutputTokens,
        requiredContextTokens: estimatedInputTokens + requestedOutputTokens
    };
}
function exceedsKnownOutputLimit(requestedOutputTokens, maxOutputTokens) {
    if (requestedOutputTokens <= 0 || maxOutputTokens === null) return false;
    return maxOutputTokens < requestedOutputTokens;
}
function hasKnownCompatibleContextLimit(target, requirements) {
    if (requirements.requiredContextTokens <= 0) return false;
    const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(target.modelStr);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$contextOverrideGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateContextLimit"])(capabilities, requirements, target.modelStr) === true;
}
const HARD_COMPAT_REASONS = new Set([
    "tools",
    "vision",
    "structured_output",
    "output_tokens"
]);
function isVisionIncompatibleTarget(target, requirements) {
    if (!requirements.requiresVision) return false;
    const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(target.modelStr);
    return capabilities.supportsVision !== true;
}
function computeCompatRejectedTargets(rankedTargets, compatKeptTargets, body) {
    const requirements = deriveRequestCompatibilityRequirements(body);
    const keptSet = new Set(compatKeptTargets);
    return rankedTargets.filter((target)=>!keptSet.has(target) && !isVisionIncompatibleTarget(target, requirements));
}
function getTargetCompatibilityFailures(target, requirements) {
    const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResolvedModelCapabilities"])(target.modelStr);
    const failures = [];
    if (requirements.requiresTools && (capabilities.supportsTools === false || !capabilities.toolCalling) && // #5240: prompt-emulated tool providers remain eligible under fail-closed.
    !providerSupportsEmulatedToolCalling(target.provider)) {
        failures.push("tools");
    }
    // For a request that carries an image, only route to a target whose vision
    // support is *confirmed* (`=== true`). Treat `false` AND `null` (unknown) as
    // incompatible: an unknown-capability model receiving the image is exactly how
    // a text-only model (e.g. ministral) ended up answering "image not provided".
    // #8488: when none qualify the filter fails closed (empty list) unless the
    // operator opts into compatFilterFailOpen.
    if (requirements.requiresVision && capabilities.supportsVision !== true) {
        failures.push("vision");
    }
    if (requirements.requiresStructuredOutput && capabilities.structuredOutput === false) {
        failures.push("structured_output");
    }
    if (exceedsKnownOutputLimit(requirements.requestedOutputTokens, capabilities.maxOutputTokens)) {
        failures.push("output_tokens");
    }
    const contextVerdict = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$contextOverrideGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateContextLimit"])(capabilities, requirements, target.modelStr);
    if (requirements.requiredContextTokens > 0 && contextVerdict === false) {
        failures.push("context_window");
    }
    return failures;
}
function describeCapabilityFilterExhaustion(targets, body, comboName) {
    if (targets.length === 0) return null;
    const requirements = deriveRequestCompatibilityRequirements(body);
    const rejected = targets.map((target)=>({
            target,
            reasons: getTargetCompatibilityFailures(target, requirements)
        }));
    const unmet = Array.from(new Set(rejected.flatMap((entry)=>entry.reasons.filter((r)=>HARD_COMPAT_REASONS.has(r)))));
    if (unmet.length === 0) return null;
    const primary = unmet.includes("tools") ? "tools" : unmet.includes("vision") ? "vision" : unmet[0];
    const toolCount = Array.isArray(body.tools) ? body.tools.length : 0;
    const name = comboName && comboName.trim().length > 0 ? comboName : "this combo";
    let message;
    if (primary === "tools") {
        message = `No target in combo ${name} supports tool calling; request carried ${toolCount} tools`;
    } else if (primary === "vision") {
        message = `No target in combo ${name} has confirmed vision support for this image request`;
    } else {
        message = `No target in combo ${name} supports structured output for this request`;
    }
    return {
        unmet,
        excluded: rejected.map((entry)=>({
                provider: entry.target.provider,
                model: entry.target.modelStr,
                reason: entry.reasons.join("+") || primary
            })),
        message,
        terminalReason: "capability_mismatch"
    };
}
function filterTargetsByRequestCompatibility(targets, body, log, label = "Context-aware fallback", options) {
    if (targets.length === 0) return targets;
    const requirements = deriveRequestCompatibilityRequirements(body);
    const needsFiltering = requirements.requiresTools || requirements.requiresVision || requirements.requiresStructuredOutput || requirements.requiredContextTokens > 0;
    if (!needsFiltering) return targets;
    const rejected = [];
    const targetReasons = new Map();
    for (const target of targets){
        const reasons = getTargetCompatibilityFailures(target, requirements);
        targetReasons.set(target, reasons);
        if (reasons.length > 0) rejected.push({
            target,
            reasons
        });
    }
    // Context metadata is advisory. Keep every target that has no hard capability
    // mismatch, but prefer targets whose known limit fits. A stale catalog entry must
    // never remove the only target that could accept the request at runtime.
    const compatible = targets.filter((target)=>{
        const reasons = targetReasons.get(target) || [];
        return !reasons.some((reason)=>HARD_COMPAT_REASONS.has(reason));
    });
    const hadKnownTooSmallContextTarget = rejected.some((entry)=>entry.reasons.includes("context_window"));
    if (requirements.requiredContextTokens > 0 && hadKnownTooSmallContextTarget && compatible.length > 1) {
        const knownContextCompatible = compatible.filter((target)=>hasKnownCompatibleContextLimit(target, requirements));
        if (knownContextCompatible.length > 0 && knownContextCompatible.length < compatible.length) {
            const knownSet = new Set(knownContextCompatible);
            return [
                ...knownContextCompatible,
                ...compatible.filter((target)=>!knownSet.has(target))
            ];
        }
    }
    if (compatible.length === targets.length) return targets;
    if (compatible.length === 0) {
        const hardRejected = rejected.some((entry)=>entry.reasons.some((r)=>HARD_COMPAT_REASONS.has(r)));
        const failOpen = options?.failOpen === true;
        log.debug?.("COMBO", `${label}: rejected targets ${rejected.map((entry)=>`${entry.target.modelStr}(${entry.reasons.join("+")})`).join(", ")}`);
        // #8332: vision is never safe to guess — never resurrect vision-rejected targets.
        if (requirements.requiresVision) {
            const visionSafe = targets.filter((target)=>!isVisionIncompatibleTarget(target, requirements));
            if (visionSafe.length === 0) {
                log.warn("COMBO", `${label}: all ${targets.length} targets lack confirmed vision; failing closed (#8488)`);
                return [];
            }
            if (failOpen) {
                log.warn("COMBO", `${label}: all targets filtered; compatFilterFailOpen restoring non-vision-rejected pool`);
                return visionSafe;
            }
            return visionSafe;
        }
        // Context/output-only exhaustion keeps the legacy fail-open path — the honest
        // answer is the existing context_length_exceeded gate, not a capability error.
        if (!hardRejected || failOpen) {
            log.warn("COMBO", `${label}: all ${targets.length} targets were filtered by request requirements; preserving strategy order`);
            return targets;
        }
        // #8488: tools / structured_output — fail closed instead of dispatching to a
        // target already known to be incompatible.
        log.warn("COMBO", `${label}: all ${targets.length} targets were filtered by hard request requirements; failing closed`);
        return [];
    }
    log.info("COMBO", `${label}: kept ${compatible.length}/${targets.length} targets for request requirements`);
    log.debug?.("COMBO", `${label}: rejected targets ${rejected.map((entry)=>`${entry.target.modelStr}(${entry.reasons.join("+")})`).join(", ")}`);
    return compatible;
}
function sortTargetsByContextSize(targets) {
    const hasKnownContext = targets.some((target)=>getModelContextLimitForModelString(target.modelStr) != null);
    if (!hasKnownContext) return targets;
    const orderedModels = sortModelsByContextSize(targets.map((target)=>target.modelStr));
    const byModel = new Map();
    for (const target of targets){
        const queue = byModel.get(target.modelStr) || [];
        queue.push(target);
        byModel.set(target.modelStr, queue);
    }
    return orderedModels.map((modelStr)=>{
        const queue = byModel.get(modelStr);
        return queue?.shift() || null;
    }).filter((target)=>target !== null);
}
function resolveComboTargets(combo, allCombos, maxDepth = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_COMBO_DEPTH"], hiddenModelsByProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHiddenModelsByProvider"])()) {
    return filterVisibleComboTargets(allCombos ? resolveNestedComboTargets(combo, allCombos, new Set(), 0, [], maxDepth) : getOrderedTopLevelRuntimeSteps(combo, null).filter((entry)=>entry?.kind === "model"), hiddenModelsByProvider);
}
function resolveComboRuntimeUnits(combo, allCombos, mode, maxDepth = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_COMBO_DEPTH"], hiddenModelsByProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHiddenModelsByProvider"])()) {
    if (mode === "flatten" || !allCombos) return resolveComboTargets(combo, allCombos, maxDepth, hiddenModelsByProvider);
    validateComboDAG(combo.name, allCombos, new Set(), 0, maxDepth);
    return getOrderedTopLevelRuntimeSteps(combo, allCombos).filter((unit)=>unit.kind === "combo-ref" || isComboTargetVisible(unit, hiddenModelsByProvider));
}
function resolveWeightedStepGroups(combo, allCombos, hiddenModelsByProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getHiddenModelsByProvider"])()) {
    return getOrderedTopLevelRuntimeSteps(combo, allCombos).map((step)=>({
            step,
            targets: filterVisibleComboTargets(!allCombos ? step.kind === "model" ? [
                step
            ] : [] : expandRuntimeStep(step, allCombos, new Set([
                combo.name
            ])), hiddenModelsByProvider)
        })).filter((group)=>group.targets.length > 0);
}
function resolveWeightedTargets(combo, allCombos, preferredExecutionKey = null, eligibleExecutionKeys = null, stepGroups) {
    const topLevelSteps = getOrderedTopLevelRuntimeSteps(combo, allCombos).filter((step)=>eligibleExecutionKeys ? eligibleExecutionKeys.has(step.executionKey) : true);
    if (topLevelSteps.length === 0) {
        return {
            orderedTargets: [],
            selectedStep: null,
            orderedSteps: []
        };
    }
    const preferredStep = preferredExecutionKey ? topLevelSteps.find((step)=>step.executionKey === preferredExecutionKey) || null : null;
    const selectedStep = preferredStep || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectWeightedTarget"])(topLevelSteps);
    if (!selectedStep) {
        return {
            orderedTargets: [],
            selectedStep: null,
            orderedSteps: []
        };
    }
    const orderedSteps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orderTargetsForWeightedFallback"])(topLevelSteps, selectedStep.executionKey, hasCompositeTierRuntimeOrder(combo));
    const targetsByStep = new Map((stepGroups || resolveWeightedStepGroups(combo, allCombos)).map((group)=>[
            group.step.executionKey,
            group.targets
        ]));
    const expandedTargets = orderedSteps.flatMap((step)=>targetsByStep.get(step.executionKey) || []);
    return {
        orderedTargets: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dedupeTargetsByExecutionKey"])(expandedTargets),
        selectedStep,
        orderedSteps
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/runtimeUnitCapacity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "isRuntimeUnitAtConcurrencyCap",
    ()=>isRuntimeUnitAtConcurrencyCap
]);
/**
 * @file runtimeUnitCapacity.ts
 * @description Concurrency-capacity checks for nested combo execute-mode units so
 *   ordered strategies overflow to the next slot instead of queueing on a full connection.
 *
 * @changes
 * - [2026-07-24] [Composer] - Initial capacity pre-check for execute-mode runtime units
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/accountSemaphore.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$concurrencyCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/concurrencyCaps.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$concurrencyCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$concurrencyCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function getCombosList(allCombos) {
    const combos = Array.isArray(allCombos) ? allCombos : allCombos?.combos || [];
    return combos.filter((combo)=>isRecord(combo) && typeof combo.name === "string");
}
function findComboByName(allCombos, name) {
    return getCombosList(allCombos).find((combo)=>combo.name === name) || null;
}
async function isConnectionAtConcurrencyCap(provider, connectionId, lookupCap) {
    const cap = await lookupCap(connectionId);
    if (!cap) return false;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAccountSemaphoreFull"])(provider, connectionId, cap);
}
async function isRuntimeUnitAtConcurrencyCap(unit, allCombos, lookupCap = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$concurrencyCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lookupPositiveCap"]) {
    if (unit.kind === "model") {
        if (!unit.connectionId || !unit.provider) return false;
        return isConnectionAtConcurrencyCap(unit.provider, unit.connectionId, lookupCap);
    }
    const childCombo = findComboByName(allCombos, unit.comboName);
    if (!childCombo) return false;
    const targets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboTargets"])(childCombo, allCombos, 1);
    const byConnection = new Map();
    for (const target of targets){
        if (!target.connectionId || !target.provider) continue;
        byConnection.set(target.connectionId, {
            provider: target.provider,
            connectionId: target.connectionId
        });
    }
    if (byConnection.size === 0) return false;
    let sawLimitedConnection = false;
    for (const { provider, connectionId } of byConnection.values()){
        const cap = await lookupCap(connectionId);
        if (!cap) continue;
        sawLimitedConnection = true;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountSemaphore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAccountSemaphoreFull"])(provider, connectionId, cap)) {
            return false;
        }
    }
    return sawLimitedConnection;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/runtimeUnits.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "executeComboRefUnit",
    ()=>executeComboRefUnit,
    "executeRuntimeUnitCombo",
    ()=>executeRuntimeUnitCombo
]);
/**
 * @file runtimeUnits.ts
 * @description Nested combo runtime unit execution — see combo.ts for integration.
 *
 * @changes
 * - [2026-07-24] [Composer] - Skip execute-mode units at concurrency cap before dispatch
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/comboMetrics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnitCapacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/runtimeUnitCapacity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$validateQuality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/validateQuality.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnitCapacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnitCapacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function getCombosList(allCombos) {
    const combos = Array.isArray(allCombos) ? allCombos : allCombos?.combos || [];
    return combos.filter((combo)=>isRecord(combo) && typeof combo.name === "string");
}
function findComboByName(allCombos, name) {
    return getCombosList(allCombos).find((combo)=>combo.name === name) || null;
}
function unitDisplayName(unit) {
    return unit.kind === "combo-ref" ? `combo:${unit.comboName}` : unit.modelStr;
}
function shuffleUnits(units) {
    const result = [
        ...units
    ];
    for(let index = result.length - 1; index > 0; index -= 1){
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [
            result[swapIndex],
            result[index]
        ];
    }
    return result;
}
function selectWeightedUnit(units) {
    const total = units.reduce((sum, unit)=>sum + Math.max(0, Number(unit.weight) || 0), 0);
    if (total <= 0) return units[0] || null;
    let draw = Math.random() * total;
    for (const unit of units){
        draw -= Math.max(0, Number(unit.weight) || 0);
        if (draw <= 0) return unit;
    }
    return units[units.length - 1] || null;
}
async function executeModelUnit(args) {
    if (args.isModelAvailable) {
        const available = await args.isModelAvailable(args.unit.modelStr, args.unit);
        if (!available) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(503, `Model ${args.unit.modelStr} is unavailable`);
    }
    return args.handleSingleModel(args.body, args.unit.modelStr, {
        ...args.unit,
        effectiveComboStrategy: args.effectiveComboStrategy,
        failoverBeforeRetry: args.failoverBeforeRetry
    });
}
function buildChildNestingContext(args) {
    if (args.context.depth >= args.context.maxDepth) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(503, `Max combo nesting depth (${args.context.maxDepth}) exceeded`);
    }
    if (args.context.visitedComboNames.includes(args.childComboName)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(503, `Circular combo reference detected: ${args.childComboName}`);
    }
    return {
        ...args.context,
        depth: args.context.depth + 1,
        visitedComboNames: [
            ...args.context.visitedComboNames,
            args.childComboName
        ]
    };
}
async function executeComboRefUnit(args) {
    const childCombo = findComboByName(args.allCombos, args.unit.comboName);
    if (!childCombo) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(503, `Nested combo "${args.unit.comboName}" not found`);
    const childNesting = buildChildNestingContext({
        context: args.nesting,
        childComboName: childCombo.name
    });
    if (childNesting instanceof Response) return childNesting;
    return args.runCombo({
        ...args.baseOptions,
        body: args.body,
        combo: childCombo,
        nesting: childNesting
    });
}
async function executeRuntimeUnit(args) {
    if (args.unit.kind === "model") {
        return executeModelUnit({
            body: args.body,
            unit: args.unit,
            handleSingleModel: args.handleSingleModel,
            isModelAvailable: args.isModelAvailable,
            failoverBeforeRetry: args.failoverBeforeRetry,
            effectiveComboStrategy: args.effectiveComboStrategy
        });
    }
    return executeComboRefUnit({
        body: args.body,
        unit: args.unit,
        allCombos: args.allCombos,
        runCombo: args.runCombo,
        baseOptions: args.baseOptions,
        nesting: args.nesting
    });
}
function orderUnitsForStrategy(strategy, units) {
    if (strategy === "random") return shuffleUnits(units);
    if (strategy === "weighted") {
        const selected = selectWeightedUnit(units);
        if (!selected) return units;
        return [
            selected,
            ...units.filter((unit)=>unit.executionKey !== selected.executionKey)
        ];
    }
    return units;
}
async function executeRuntimeUnitCombo(args) {
    const maxRetries = Number(args.config.maxRetries ?? 1);
    const retryDelayMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveDelayMs"])(args.config.retryDelayMs, 2000);
    const orderedUnits = orderUnitsForStrategy(args.strategy, args.units);
    const clientRequestedStream = args.body?.stream === true;
    const startTime = Date.now();
    const effectiveStrategy = args.effectiveComboStrategy ?? args.strategy;
    let lastResponse = null;
    let fallbackCount = 0;
    for (const unit of orderedUnits){
        if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnitCapacity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRuntimeUnitAtConcurrencyCap"])(unit, args.allCombos)) {
            args.log.info("COMBO", `Skipping ${unit.kind} ${unitDisplayName(unit)} — concurrency cap reached`);
            fallbackCount += 1;
            continue;
        }
        for(let retry = 0; retry <= maxRetries; retry += 1){
            if (args.signal?.aborted) return {
                response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(499, "Client disconnected"),
                unit
            };
            args.nesting.attemptBudget.count += 1;
            if (args.nesting.attemptBudget.count > args.nesting.attemptBudget.limit) {
                return {
                    response: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(503, "Maximum combo retry limit reached"),
                    unit
                };
            }
            if (retry > 0) {
                await new Promise((resolve)=>setTimeout(resolve, retryDelayMs));
            }
            args.log.info("COMBO", `Trying ${unit.kind} ${unitDisplayName(unit)}${retry > 0 ? ` (retry ${retry})` : ""}`);
            const response = await executeRuntimeUnit({
                body: args.body,
                unit,
                allCombos: args.allCombos,
                handleSingleModel: args.handleSingleModel,
                isModelAvailable: args.isModelAvailable,
                runCombo: args.runCombo,
                baseOptions: args.baseOptions,
                nesting: args.nesting,
                failoverBeforeRetry: args.config.failoverBeforeRetry,
                effectiveComboStrategy: effectiveStrategy
            });
            lastResponse = response;
            if (response.ok) {
                if (unit.kind === "combo-ref") {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboRequest"])(args.combo.name, null, {
                        success: true,
                        latencyMs: Date.now() - startTime,
                        fallbackCount,
                        strategy: effectiveStrategy,
                        target: {
                            executionKey: unit.executionKey,
                            stepId: unit.stepId,
                            label: unit.label
                        }
                    });
                    return {
                        response,
                        unit
                    };
                }
                let unitClone;
                try {
                    unitClone = response.clone();
                } catch  {
                    unitClone = response;
                }
                const quality = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$validateQuality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateResponseQuality"])(unitClone, clientRequestedStream, args.log, args.config.responseValidation);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$validateQuality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["releaseQualityClone"])(unitClone, response, quality);
                if (quality.valid) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboRequest"])(args.combo.name, unit.modelStr, {
                        success: true,
                        latencyMs: Date.now() - startTime,
                        fallbackCount,
                        strategy: effectiveStrategy,
                        target: {
                            executionKey: unit.executionKey,
                            stepId: unit.stepId,
                            label: unit.label
                        }
                    });
                    return {
                        response,
                        unit
                    };
                }
            }
            if (![
                408,
                429,
                500,
                502,
                503,
                504
            ].includes(response.status)) break;
        }
        fallbackCount += 1;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboRequest"])(args.combo.name, null, {
        success: false,
        latencyMs: Date.now() - startTime,
        fallbackCount,
        strategy: effectiveStrategy
    });
    return {
        response: lastResponse || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(503, "All nested combo units unavailable"),
        unit: null
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/fusionPanel.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildFusionHandleSingleModel",
    ()=>buildFusionHandleSingleModel,
    "extractFusionPanelSpec",
    ()=>extractFusionPanelSpec
]);
/**
 * Fusion panel member extraction — resolves combo.models entries for the
 * fusion strategy, including nested `combo-ref` steps (#6764).
 *
 * A combo-ref panel member is dispatched as ONE black-box panel voice (a full
 * recursive handleComboChat call for the referenced combo, reusing the same
 * executeComboRefUnit + cycle/depth guards every other combo-ref-consuming
 * strategy already uses) — NOT a fan-out of the referenced combo's own
 * targets. This keeps panel sizing and cost predictable and matches how a
 * literal `auto/*` string panel member already behaves via the single-
 * dispatch safety net in src/sse/handlers/chat.ts.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/combos/steps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/runtimeUnits.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function extractFusionPanelSpec(models, comboName, allCombos) {
    const panel = [];
    const comboRefUnits = new Map();
    models.forEach((entry, index)=>{
        const step = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$combos$2f$steps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeComboStep"])(entry, {
            comboName,
            index,
            allCombos
        });
        if (!step) return;
        if (step.kind === "combo-ref") {
            if (!comboRefUnits.has(step.comboName)) {
                comboRefUnits.set(step.comboName, {
                    kind: "combo-ref",
                    stepId: step.id,
                    executionKey: step.id,
                    comboName: step.comboName,
                    weight: step.weight,
                    label: step.label ?? null
                });
            }
            panel.push(step.comboName);
            return;
        }
        panel.push(step.model);
    });
    return {
        panel,
        comboRefUnits
    };
}
function buildFusionHandleSingleModel(args) {
    return (body, modelStr, target)=>{
        const unit = args.comboRefUnits.get(modelStr);
        if (!unit) return args.handleSingleModel(body, modelStr, target);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["executeComboRefUnit"])({
            body,
            unit,
            allCombos: args.allCombos,
            runCombo: args.runCombo,
            baseOptions: args.baseOptions,
            nesting: args.nesting
        });
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/dispatchPrelude.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "normalizeNestedComboMode",
    ()=>normalizeNestedComboMode,
    "pinIsDurablyUnhealthy",
    ()=>pinIsDurablyUnhealthy,
    "tryFusionDispatch",
    ()=>tryFusionDispatch,
    "tryPinnedModelDispatch",
    ()=>tryPinnedModelDispatch,
    "tryPipelineDispatch",
    ()=>tryPipelineDispatch,
    "tryRuntimeUnitDispatch",
    ()=>tryRuntimeUnitDispatch
]);
/**
 * Combo dispatch prelude — the branches `handleComboChat` evaluates BEFORE it
 * falls through to target resolution and the sequential attempt loop.
 *
 * Each `try*Dispatch` helper returns a `Response` when it owns the request, or
 * `null` to fall through to the next branch (and ultimately to the normal combo
 * machinery). The branches live here because none of them iterate targets in
 * priority order or need the failover/retry/credential-gate machinery that
 * follows — they either short-circuit to one model (context-cache pin), fan out
 * and synthesize (fusion), thread output → input (pipeline), or dispatch
 * pre-resolved runtime units (nested combo-refs in `execute` mode).
 *
 * Extracted from combo.ts as a pure move (#3501). No behaviour change.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/shuffleDeck.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$fusion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/fusion.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$pipeline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/pipeline.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboVisibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboVisibility.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$fusionPanel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/fusionPanel.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/rrState.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/runtimeUnits.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$validateQuality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/validateQuality.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboVisibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$fusionPanel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboVisibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$fusionPanel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
/** Rebuild handleComboChat's option bag verbatim for a recursive dispatch. */ function buildBaseOptions(a) {
    return {
        body: a.body,
        combo: a.combo,
        handleSingleModel: a.handleSingleModel,
        isModelAvailable: a.isModelAvailable,
        log: a.log,
        settings: a.settings,
        allCombos: a.allCombos,
        relayOptions: a.relayOptions,
        signal: a.signal,
        apiKeyAllowedConnections: a.apiKeyAllowedConnections,
        hiddenModelsByProvider: a.hiddenModelsByProvider
    };
}
const TERMINAL_PIN_STATUSES = new Set([
    "credits_exhausted",
    "banned",
    "expired"
]);
function pinIsDurablyUnhealthy(circuitState, connections, now, opts = {}) {
    if (circuitState === "OPEN") return true;
    if (!Array.isArray(connections) || connections.length === 0) return true;
    const backoffThreshold = opts.backoffLevel ?? Number(process.env.PIN_DROP_BACKOFF_LEVEL || "2");
    const graceMs = opts.graceMs ?? Number(process.env.PIN_DROP_GRACE_MS || "20000");
    // The pin survives as long as AT LEAST ONE connection is healthy or only
    // briefly cooling down — failover only when every connection is durably down.
    const anyUsable = connections.some((c)=>{
        const status = typeof c.testStatus === "string" ? c.testStatus : "";
        if (TERMINAL_PIN_STATUSES.has(status)) return false;
        if (Number(c.backoffLevel ?? 0) >= backoffThreshold) return false;
        const rl = c.rateLimitedUntil ? new Date(String(c.rateLimitedUntil)).getTime() : 0;
        if (Number.isFinite(rl) && rl - now > graceMs) return false;
        return true;
    });
    return !anyUsable;
}
/**
 * Async wrapper: resolve the pinned model's provider, read its circuit state and
 * active connections, and decide via {@link pinIsDurablyUnhealthy}. Fail-open
 * (return false) on any error so a lookup bug never drops a healthy pin.
 */ async function isPinnedModelDurablyUnhealthy(pinnedModel) {
    try {
        const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(pinnedModel).provider;
        if (!provider) return false;
        const circuitState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(provider)?.getStatus?.()?.state;
        const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
            provider,
            isActive: true
        });
        return pinIsDurablyUnhealthy(circuitState, connections || [], Date.now());
    } catch  {
        return false;
    }
}
function normalizeNestedComboMode(value) {
    return value === "execute" ? "execute" : "flatten";
}
function buildDefaultNesting(nesting, comboName, config) {
    return nesting || {
        depth: 0,
        maxDepth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampComboDepth"])(config.maxComboDepth),
        visitedComboNames: [
            comboName
        ],
        rootComboName: comboName,
        attemptBudget: {
            count: 0,
            limit: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_GLOBAL_ATTEMPTS"]
        }
    };
}
/**
 * Decide whether the honored pin's response is good enough to return as-is.
 * Returns the response to serve it, or null to fall through to the combo
 * strategy (200-but-empty, or a transient upstream status worth failing over).
 */ async function evaluatePinnedResponse(args) {
    const { pinnedResult, pinnedModel, clientRequestedStream, config, log } = args;
    if (pinnedResult.ok) {
        let pinnedClone;
        try {
            pinnedClone = pinnedResult.clone();
        } catch  {
            pinnedClone = pinnedResult;
        }
        const pinnedQuality = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$validateQuality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateResponseQuality"])(pinnedClone, clientRequestedStream, log, config.responseValidation);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$validateQuality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["releaseQualityClone"])(pinnedClone, pinnedResult, pinnedQuality);
        if (pinnedQuality.valid) return pinnedResult;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$validateQuality$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["releaseRejectedQualityResponse"])(pinnedClone, pinnedResult);
        log.warn("COMBO", `Pinned model ${pinnedModel} returned 200 but failed quality check: ${pinnedQuality.reason}, falling through to combo retry/fallback`);
        return null;
    }
    const pinnedStatus = pinnedResult.status || 500;
    if (![
        408,
        429,
        500,
        502,
        503,
        504
    ].includes(pinnedStatus)) {
        return pinnedResult;
    }
    log.warn("COMBO", `Pinned model ${pinnedModel} failed (${pinnedStatus}), falling through to combo retry/fallback`);
    return null;
}
async function tryPinnedModelDispatch(args) {
    const { body, combo, pinnedModel, allCombos, config, clientRequestedStream, handleSingleModelWithTimeout, log, hiddenModelsByProvider } = args;
    // The pin is read from session_model_history (a PRIOR turn) and may name a
    // model that has since been removed from this combo, or a provider whose
    // credentials are gone. Without this guard a stale pin bypasses the strategy
    // and routes to a dead model forever — incident 2026-06-21: cli-claude-heavy
    // pinned to a deepseek connection with no active credentials → instant fail,
    // never falling through to the live targets; and combos re-pointed Opus→Sonnet
    // kept serving the old model. Validate the pin is still reachable in THIS
    // combo's resolved targets (refs flattened) before honoring it. Only validate
    // when allCombos is authoritative (non-empty) so we can resolve combo-refs;
    // the auto-combo redirect path passes an empty list and keeps prior behavior.
    const haveFullCombos = Array.isArray(allCombos) ? allCombos.length > 0 : !!allCombos;
    const pinInCombo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboTargets"])(combo, haveFullCombos ? allCombos : null, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampComboDepth"])(config.maxComboDepth), hiddenModelsByProvider).some((target)=>target.modelStr === pinnedModel);
    // Honor the pin only if it is still a combo target AND its provider is not
    // DURABLY down. Without the health gate a pin keeps routing a session to a
    // dead/credits-exhausted/throttled account forever (strategy bypassed, no
    // failover) — incident 2026-06-22: laila stuck on a throttled claude account
    // and credits_exhausted accounts never failing over. A transient cooldown is
    // tolerated (pin kept) so an unstable provider does not churn the pin.
    const pinDurablyDown = pinInCombo ? await isPinnedModelDurablyUnhealthy(pinnedModel) : false;
    if (pinInCombo && !pinDurablyDown) {
        log.info("COMBO", `Bypassing strategy — routing directly to pinned context model: ${pinnedModel}`);
        let pinnedResult = null;
        try {
            pinnedResult = await handleSingleModelWithTimeout(body, pinnedModel, {
                modelPinned: true
            });
        } catch (pinErr) {
            log.warn("COMBO", `Pinned model ${pinnedModel} threw error: ${pinErr instanceof Error ? pinErr.message : String(pinErr)}, falling through to combo retry/fallback`);
        }
        if (pinnedResult) {
            const accepted = await evaluatePinnedResponse({
                pinnedResult,
                pinnedModel,
                clientRequestedStream,
                config,
                log
            });
            if (accepted) return accepted;
        }
    // Fall through to the target iteration loop below — retries and sibling
    // models will be tried via the normal combo machinery.
    }
    log.warn("COMBO", pinInCombo ? `Context-cache pin "${pinnedModel}" provider durably unhealthy — dropping pin, using strategy` : `Stale context-cache pin "${pinnedModel}" not in combo "${combo.name}" targets — dropping pin, using strategy`);
    // Fall through to the normal target iteration loop below — the pin is
    // dropped, so the combo strategy picks the best available target.
    return null;
}
async function tryFusionDispatch(args) {
    const { cfg, combo, config, strategy, log } = args;
    const configuredJudge = typeof cfg.judgeModel === "string" ? cfg.judgeModel : undefined;
    // The panel is filtered for hidden models by resolveComboTargets, but the
    // explicit judge is a bare string that never passes through it (#8878). Drop a
    // hidden judge so fusion falls back to a surviving panel member instead of
    // dispatching a model the operator hid.
    const judgeModel = configuredJudge && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboVisibility$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isComboModelVisible"])(configuredJudge, null, args.hiddenModelsByProvider) ? undefined : configuredJudge;
    const fusionTuning = cfg.fusionTuning && typeof cfg.fusionTuning === "object" ? cfg.fusionTuning : undefined;
    if (strategy !== "fusion" && (configuredJudge || fusionTuning)) {
        log.warn("COMBO", `Combo "${combo.name}" sets config.judgeModel/fusionTuning but strategy is "${strategy}" — these fields are only consumed by the fusion strategy and will be ignored (#6455)`);
    }
    if (strategy !== "fusion") return null;
    const resolvedFusionTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboTargets"])(combo, args.allCombos, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampComboDepth"])(config.maxComboDepth), args.hiddenModelsByProvider);
    // extractFusionPanelSpec only understands model strings / combo refs, so the
    // resolved targets have to be flattened before it runs. Keep them indexed so
    // the panel can be rehydrated below — dispatching the bare strings strips
    // `providerId` and every panel member loses its provider identity (#8878).
    const resolvedByModelStr = new Map();
    for (const target of resolvedFusionTargets){
        if (!resolvedByModelStr.has(target.modelStr)) resolvedByModelStr.set(target.modelStr, target);
    }
    const { panel: fusionPanel, comboRefUnits } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$fusionPanel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractFusionPanelSpec"])(resolvedFusionTargets.map((target)=>target.modelStr), combo.name, null);
    // A panel entry naming a combo ref stays a string (it is a combo name, not a
    // model); everything else regains its resolved target.
    const fusionModels = fusionPanel.map((entry)=>comboRefUnits.has(entry) ? entry : resolvedByModelStr.get(entry) ?? entry);
    // Untyped like the existing `nestingContext` further down — `nesting` is
    // already `ComboNestingContext | null` per HandleComboChatOptions, no new
    // import needed.
    const fusionNesting = buildDefaultNesting(args.nesting, combo.name, config);
    const fusionHandleSingleModel = comboRefUnits.size > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$fusionPanel$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildFusionHandleSingleModel"])({
        handleSingleModel: args.handleSingleModelWithTimeout,
        comboRefUnits,
        allCombos: args.allCombos,
        nesting: fusionNesting,
        baseOptions: buildBaseOptions(args),
        runCombo: args.runCombo
    }) : args.handleSingleModelWithTimeout;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$fusion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleFusionChat"])({
        body: args.body,
        models: fusionModels,
        handleSingleModel: fusionHandleSingleModel,
        log,
        comboName: combo.name,
        judgeModel,
        tuning: fusionTuning
    });
}
async function tryPipelineDispatch(args) {
    const { body, combo, config, strategy, allCombos, handleSingleModelWithTimeout, log, hiddenModelsByProvider } = args;
    if (strategy !== "pipeline") return null;
    const pipelineSteps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboTargets"])(combo, allCombos, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampComboDepth"])(config.maxComboDepth), hiddenModelsByProvider).map((target)=>({
            target,
            prompt: target.prompt
        }));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$pipeline$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handlePipelineChat"])({
        body,
        steps: pipelineSteps,
        handleSingleModel: handleSingleModelWithTimeout,
        log,
        comboName: combo.name,
        maxRetries: config.maxRetries ?? 0,
        retryDelayMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveDelayMs"])(config.retryDelayMs, 1000)
    });
}
/**
 * Apply the selection strategy to the resolved runtime units. Each strategy
 * reorders (never filters) the unit list so executeRuntimeUnitCombo can walk it
 * as a priority list, and round-robin additionally advances the shared rr
 * counter when stickiness is off.
 */ async function orderRuntimeUnits(args) {
    const { strategy, executeModeUnits, combo, config, settings } = args;
    let runtimeUnits = executeModeUnits;
    let unitExecutionStrategy = strategy;
    if (strategy === "weighted") {
        const stickyLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampStickyWeightedTargetLimit"])(config.stickyWeightedLimit);
        const stickyKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStickyWeightedExecutionKey"])(combo.name, stickyLimit);
        const stickyUnit = stickyKey ? runtimeUnits.find((unit)=>unit.executionKey === stickyKey) : null;
        if (stickyUnit) {
            runtimeUnits = [
                stickyUnit,
                ...runtimeUnits.filter((unit)=>unit.executionKey !== stickyUnit.executionKey)
            ];
            unitExecutionStrategy = "priority";
        }
    }
    if (strategy === "random") runtimeUnits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fisherYatesShuffle"])([
        ...runtimeUnits
    ]);
    if (strategy === "strict-random") {
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNextFromDeck"])(`combo:${combo.name}`, runtimeUnits.map((unit)=>unit.executionKey));
        const selected = runtimeUnits.find((unit)=>unit.executionKey === key) || runtimeUnits[0];
        runtimeUnits = [
            selected,
            ...runtimeUnits.filter((unit)=>unit.executionKey !== selected.executionKey)
        ];
    }
    let runtimeStickyLimit = null;
    let runtimeStickyTargets = runtimeUnits;
    if (strategy === "round-robin") {
        const perComboStickyLimit = config.stickyRoundRobinLimit;
        runtimeStickyLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboStickyRoundRobinLimit"])(perComboStickyLimit, settings);
        const { startIndex, counter } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStickyRoundRobinStartIndex"])(combo.name, runtimeUnits, runtimeStickyLimit);
        if (runtimeStickyLimit <= 1) __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rrCounters"].set(combo.name, counter + 1);
        runtimeUnits = runtimeUnits.map((_, offset)=>runtimeUnits[(startIndex + offset) % runtimeUnits.length]);
        runtimeStickyTargets = executeModeUnits;
    }
    return {
        units: runtimeUnits,
        executionStrategy: unitExecutionStrategy,
        stickyLimit: runtimeStickyLimit,
        stickyTargets: runtimeStickyTargets
    };
}
async function tryRuntimeUnitDispatch(args) {
    const { body, combo, config, strategy, allCombos, log, settings } = args;
    const nestingContext = buildDefaultNesting(args.nesting, combo.name, config);
    const nestedComboMode = normalizeNestedComboMode(config.nestedComboMode);
    const executeModeUnits = nestedComboMode === "execute" && allCombos ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboRuntimeUnits"])(combo, allCombos, "execute", nestingContext.maxDepth, args.hiddenModelsByProvider) : [];
    const hasExecutableComboRef = executeModeUnits.some((unit)=>unit.kind === "combo-ref");
    const simpleExecuteStrategies = new Set([
        "priority",
        "round-robin",
        "random",
        "strict-random",
        "weighted",
        "fill-first"
    ]);
    if (!hasExecutableComboRef || !simpleExecuteStrategies.has(strategy)) return null;
    const ordering = await orderRuntimeUnits({
        strategy,
        executeModeUnits,
        combo,
        config,
        settings
    });
    const { units: runtimeUnits, executionStrategy: unitExecutionStrategy, stickyLimit: runtimeStickyLimit, stickyTargets: runtimeStickyTargets } = ordering;
    const execution = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$runtimeUnits$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["executeRuntimeUnitCombo"])({
        body,
        combo,
        strategy: unitExecutionStrategy,
        effectiveComboStrategy: strategy,
        units: runtimeUnits,
        handleSingleModel: args.handleSingleModelWithTimeout,
        isModelAvailable: args.isModelAvailable,
        log,
        config,
        settings,
        allCombos,
        signal: args.signal,
        nesting: nestingContext,
        baseOptions: buildBaseOptions(args),
        runCombo: args.runCombo
    });
    recordRuntimeUnitStickySuccess({
        strategy,
        combo,
        config,
        execution,
        stickyLimit: runtimeStickyLimit,
        stickyTargets: runtimeStickyTargets
    });
    return execution.response;
}
/**
 * Pin the winning unit for the next request when the strategy is sticky-capable
 * and the dispatch actually succeeded. No-op for every other strategy.
 */ function recordRuntimeUnitStickySuccess(args) {
    const { strategy, combo, config, execution, stickyLimit, stickyTargets } = args;
    if (strategy === "weighted" && execution.response.ok && execution.unit) {
        const weightedLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampStickyWeightedTargetLimit"])(config.stickyWeightedLimit);
        if (weightedLimit > 1) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordStickyWeightedSuccess"])(combo.name, execution.unit.executionKey, weightedLimit);
    }
    if (strategy === "round-robin" && execution.response.ok && execution.unit && stickyLimit && stickyLimit > 1) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordStickyRoundRobinSuccess"])(combo.name, execution.unit, stickyLimit, stickyTargets);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/unavailableRetryGate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isRetryAfterEligibleStatus",
    ()=>isRetryAfterEligibleStatus
]);
/**
 * #8486 Part B: gate for the "all targets failed" unavailable-response
 * retry-after decoration in combo.ts (handleComboChat / handleRoundRobinCombo).
 *
 * Root cause: the aggregation loop tracks `earliestRetryAfter` as the MINIMUM
 * retry-after parsed out of ANY target's own response body across the whole
 * failure loop, independent of which target ends up supplying the surfaced
 * `status`/`msg` pair. When a combo mixes a genuinely rate-limited target
 * (real retryAfter) with a config-class failure (e.g. Antigravity's 422
 * `missing_project_id`, which carries no retryAfter of its own), the final
 * unavailableResponse() stitches the rate-limited target's reset window onto
 * the unrelated target's message text.
 *
 * `unavailableResponse()` (open-sse/utils/error.ts) has no way to know
 * `status`/`msg` and `retryAfter` came from different targets, so the gate
 * has to live at the call site: only decorate the response with a
 * `(reset after ...)` suffix when the surfaced `status` is itself a
 * rate-limit-class code that plausibly owns a retry-after window. A
 * config-class status (422, 400, 401, 403, 404, ...) must never receive a
 * retry-after suffix that did not originate from its own response body.
 */ const RETRY_AFTER_ELIGIBLE_STATUSES = new Set([
    429,
    503
]);
function isRetryAfterEligibleStatus(status) {
    return typeof status === "number" && RETRY_AFTER_ELIGIBLE_STATUSES.has(status);
}
}),
"[project]/open-sse/services/combo/providerWildcard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "expandProviderWildcardsInCollection",
    ()=>expandProviderWildcardsInCollection,
    "expandProviderWildcardsInCombo",
    ()=>expandProviderWildcardsInCombo,
    "isProviderWildcardEntry",
    ()=>isProviderWildcardEntry
]);
/**
 * Provider-wildcard expansion for combo targets (#2562).
 *
 * Allows a combo step to be written as `provider/*` (or `provider/prefix*`)
 * instead of enumerating every model explicitly. At request time the pattern
 * is expanded into concrete `provider/modelId` entries sourced from:
 *   1. The synced-available-models DB store (for API-key / OAuth providers whose
 *      model list changes at runtime, e.g. custom OpenAI-compatible providers).
 *   2. The static providerRegistry (for built-in providers whose catalog is
 *      bundled with the release).
 *
 * This keeps combos always in sync with the live model catalog without any
 * manual maintenance.
 *
 * ### Wildcard syntax
 *
 *   `<providerAlias>/*`          – all models for the provider
 *   `<providerAlias>/prefix*`    – models whose id starts with `prefix`
 *
 * Examples:
 *   `fta/*`           → all FreeTheAI synced models
 *   `openai/*`        → all OpenAI registry models
 *   `opc/deepseek*`   → FreeTheAI models whose id starts with "deepseek"
 *
 * ### Step preservation
 *
 * The original wildcard entry's `weight`, `label`, `connectionId`, and
 * `allowedConnectionIds` are copied onto every expanded model step so that
 * per-step routing policy is inherited.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/models/activeSyncedCatalog.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
/** Sentinel pattern used for "all models of a provider". */ const PROVIDER_WILDCARD_SENTINEL = "*";
function isProviderWildcardEntry(entry) {
    if (typeof entry === "string") {
        const trimmed = entry.trim();
        const slash = trimmed.indexOf("/");
        if (slash <= 0) return false;
        const model = trimmed.slice(slash + 1);
        return model.includes("*");
    }
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const rec = entry;
        return rec.kind === "provider-wildcard" && typeof rec.providerId === "string";
    }
    return false;
}
function parseWildcardEntry(entry) {
    if (typeof entry === "string") {
        const trimmed = entry.trim();
        const slash = trimmed.indexOf("/");
        if (slash <= 0) return null;
        const providerId = trimmed.slice(0, slash);
        const modelPattern = trimmed.slice(slash + 1);
        if (!modelPattern.includes("*")) return null;
        return {
            providerId,
            modelPattern,
            weight: 0,
            label: null,
            connectionId: null,
            allowedConnectionIds: null
        };
    }
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const rec = entry;
        if (rec.kind !== "provider-wildcard") return null;
        const providerId = typeof rec.providerId === "string" ? rec.providerId.trim() : "";
        if (!providerId) return null;
        const modelPattern = typeof rec.modelPattern === "string" ? rec.modelPattern.trim() : PROVIDER_WILDCARD_SENTINEL;
        const weight = typeof rec.weight === "number" && Number.isFinite(rec.weight) ? rec.weight : 0;
        const label = typeof rec.label === "string" && rec.label.trim() ? rec.label.trim() : null;
        const connectionId = typeof rec.connectionId === "string" && rec.connectionId.trim() ? rec.connectionId.trim() : null;
        const allowedConnectionIds = Array.isArray(rec.allowedConnectionIds) ? rec.allowedConnectionIds.map((c)=>typeof c === "string" ? c.trim() : "").filter(Boolean) : null;
        return {
            providerId,
            modelPattern,
            weight,
            label,
            connectionId,
            allowedConnectionIds: allowedConnectionIds?.length ? allowedConnectionIds : null
        };
    }
    return null;
}
/**
 * Collect candidate model IDs using the active synced catalog as the
 * authoritative source when it is non-empty. Static registry models remain a
 * fail-open fallback when no active usable catalog exists.
 */ async function collectProviderModelIds(providerId) {
    const liveCatalog = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$models$2f$activeSyncedCatalog$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getActiveSyncedCatalog"])(providerId);
    if (liveCatalog.authoritative) {
        return liveCatalog.models.map((model)=>model.id);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderModels"])(providerId).map((model)=>model.id);
}
/**
 * Expand a single provider-wildcard spec into concrete model entry objects
 * that `normalizeComboStep` can process as normal model steps.
 *
 * Returns `null` if no matching models are found (caller keeps the original
 * entry so the combo does not silently lose a step).
 */ async function expandWildcardSpec(spec, comboName) {
    const modelIds = await collectProviderModelIds(spec.providerId);
    if (modelIds.length === 0) return null;
    const pattern = spec.modelPattern;
    const matchingIds = pattern === PROVIDER_WILDCARD_SENTINEL ? modelIds : modelIds.filter((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["wildcardMatch"])(id, pattern));
    if (matchingIds.length === 0) return null;
    return matchingIds.map((modelId)=>{
        const fullModelStr = `${spec.providerId}/${modelId}`;
        const step = {
            kind: "model",
            model: fullModelStr,
            providerId: spec.providerId,
            weight: spec.weight,
            // Tag so downstream can identify the origin of this expanded step.
            _expandedFromWildcard: `${spec.providerId}/${pattern}`,
            _parentCombo: comboName
        };
        if (spec.label !== null) step.label = spec.label;
        if (spec.connectionId !== null) step.connectionId = spec.connectionId;
        if (spec.allowedConnectionIds !== null) step.allowedConnectionIds = spec.allowedConnectionIds;
        return step;
    });
}
async function expandProviderWildcardsInCombo(combo) {
    const models = combo.models;
    if (!Array.isArray(models) || models.length === 0) return combo;
    let hasWildcard = false;
    for (const entry of models){
        if (isProviderWildcardEntry(entry)) {
            hasWildcard = true;
            break;
        }
    }
    if (!hasWildcard) return combo;
    const expanded = [];
    for (const entry of models){
        if (!isProviderWildcardEntry(entry)) {
            expanded.push(entry);
            continue;
        }
        const spec = parseWildcardEntry(entry);
        if (!spec) {
            // Malformed wildcard entry — keep as-is; normalizeComboStep will handle.
            expanded.push(entry);
            continue;
        }
        const resolved = await expandWildcardSpec(spec, combo.name);
        if (resolved && resolved.length > 0) {
            expanded.push(...resolved);
        } else {
            // No models found: keep the original entry rather than silently dropping
            // the step, so the operator sees the error from the upstream provider.
            expanded.push(entry);
        }
    }
    return {
        ...combo,
        models: expanded
    };
}
async function expandProviderWildcardsInCollection(combos) {
    return Promise.all(combos.map((c)=>expandProviderWildcardsInCombo(c)));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/shadowRouting.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "resolveShadowTargets",
    ()=>resolveShadowTargets,
    "scheduleShadowRouting",
    ()=>scheduleShadowRouting
]);
/**
 * Combo shadow-routing helpers extracted from combo.ts.
 *
 * Shadow routing mirrors a sampled fraction of production traffic to extra
 * targets (fire-and-forget) to compare behavior without affecting the real
 * response. Moved out of the combo.ts god-file (Quality Gate v2 / Fase 9) —
 * logic unchanged; `resolveShadowTargets` and `scheduleShadowRouting` are
 * re-exported from combo.ts for backward compatibility and used by
 * handleComboChat / handleRoundRobinCombo (which stay in combo.ts).
 *
 * NOTE: `resolveNestedComboTargets` lives in combo/comboStructure.ts (extracted
 * in the same Fase 9 split). It is only invoked at request time inside
 * `resolveShadowTargets`, never during module init.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/secureRandom.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/comboMetrics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboData.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
function normalizeShadowRoutingConfig(config) {
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(config.shadowRouting) ? config.shadowRouting : {};
    const sampleRate = Number(raw.sampleRate ?? 1);
    const maxTargets = Number(raw.maxTargets ?? 2);
    const timeoutMs = Number(raw.timeoutMs ?? 30000);
    return {
        enabled: raw.enabled === true,
        targets: Array.isArray(raw.targets) ? raw.targets : [],
        sampleRate: Number.isFinite(sampleRate) ? Math.max(0, Math.min(1, sampleRate)) : 1,
        maxTargets: Number.isFinite(maxTargets) ? Math.max(1, Math.min(10, Math.floor(maxTargets))) : 2,
        timeoutMs: Number.isFinite(timeoutMs) ? Math.max(1000, Math.min(120000, Math.floor(timeoutMs))) : 30000
    };
}
function resolveShadowTargets(combo, config, allCombos, hiddenModelsByProvider) {
    const shadowConfig = normalizeShadowRoutingConfig(config);
    if (!shadowConfig.enabled || shadowConfig.targets.length === 0) return [];
    if (shadowConfig.sampleRate <= 0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$secureRandom$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["secureRandomFloat"])() > shadowConfig.sampleRate) return [];
    const shadowCombo = {
        ...combo,
        name: `${combo.name}:shadow`,
        models: shadowConfig.targets
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["filterVisibleComboTargets"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveNestedComboTargets"])(shadowCombo, allCombos, new Set([
        combo.name
    ]), 0, [
        "shadow"
    ]), hiddenModelsByProvider).slice(0, shadowConfig.maxTargets).map((target)=>({
            ...target,
            trafficType: "shadow"
        }));
}
async function drainShadowResponse(response) {
    try {
        if (!response.body) return;
        await response.arrayBuffer();
    } catch  {
    // Shadow draining is best-effort and must never affect the production response.
    }
}
function withTimeout(promise, timeoutMs) {
    return new Promise((resolve, reject)=>{
        const timer = setTimeout(()=>reject(new Error("Shadow route timed out")), timeoutMs);
        promise.then((value)=>{
            clearTimeout(timer);
            resolve(value);
        }, (error)=>{
            clearTimeout(timer);
            reject(error);
        });
    });
}
function cloneRequestBodyForShadowRouting(body) {
    if (typeof structuredClone === "function") {
        return structuredClone(body);
    }
    return JSON.parse(JSON.stringify(body));
}
function scheduleShadowRouting(combo, config, body, targets, handleSingleModel, isModelAvailable, strategy, log) {
    if (targets.length === 0) return;
    const shadowConfig = normalizeShadowRoutingConfig(config);
    let shadowBaseBody;
    try {
        shadowBaseBody = cloneRequestBodyForShadowRouting(body);
    } catch (error) {
        log.warn("COMBO", "Shadow routing skipped: failed to clone request body", {
            error: error instanceof Error ? error.message : String(error)
        });
        return;
    }
    const run = async ()=>{
        await Promise.all(targets.map(async (target)=>{
            const startedAt = Date.now();
            try {
                const shadowBody = {
                    ...cloneRequestBodyForShadowRouting(shadowBaseBody),
                    model: target.modelStr,
                    stream: false
                };
                if (isModelAvailable) {
                    const available = await isModelAvailable(target.modelStr, target);
                    if (!available) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboShadowRequest"])(combo.name, target.modelStr, {
                            success: false,
                            latencyMs: Date.now() - startedAt,
                            target: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecordedTarget"])(target)
                        });
                        log.info("COMBO", `Shadow target skipped (unavailable): ${target.modelStr}`);
                        return;
                    }
                }
                const response = await withTimeout(handleSingleModel(shadowBody, target.modelStr, {
                    ...target,
                    failoverBeforeRetry: true,
                    trafficType: "shadow"
                }), shadowConfig.timeoutMs);
                await drainShadowResponse(response.clone());
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboShadowRequest"])(combo.name, target.modelStr, {
                    success: response.ok,
                    latencyMs: Date.now() - startedAt,
                    target: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecordedTarget"])(target)
                });
                log.info("COMBO", `Shadow target ${target.modelStr} completed with status ${response.status} (${strategy})`);
            } catch (error) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboShadowRequest"])(combo.name, target.modelStr, {
                    success: false,
                    latencyMs: Date.now() - startedAt,
                    target: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toRecordedTarget"])(target)
                });
                log.warn("COMBO", `Shadow target ${target.modelStr} failed`, {
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }));
    };
    setTimeout(()=>void run(), 0);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/comboCompatFallback.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "attemptCompatRejectedFallback",
    ()=>attemptCompatRejectedFallback
]);
async function attemptCompatRejectedFallback(rejectedTargets, body, ctx) {
    if (rejectedTargets.length === 0) return null;
    for (const target of rejectedTargets){
        if (ctx.isModelAvailable) {
            const available = await ctx.isModelAvailable(target.modelStr, target);
            if (!available) {
                ctx.log.debug("COMBO", `Last-resort compat fallback: ${target.modelStr} still unavailable — skipping`);
                continue;
            }
        }
        if (ctx.isProviderInCooldown?.(target)) {
            ctx.log.debug("COMBO", `Last-resort compat fallback: ${target.modelStr} provider in cooldown — skipping`);
            continue;
        }
        ctx.log.info("COMBO", `Last-resort compat fallback → ${target.modelStr} (all compat-kept targets were unavailable)`);
        const result = await ctx.handleSingleModel(body, target.modelStr, {
            ...target,
            effectiveComboStrategy: ctx.strategy
        });
        if (result.ok) {
            ctx.log.info("COMBO", `Last-resort compat fallback succeeded via ${target.modelStr}`);
            return result;
        }
        ctx.log.debug("COMBO", `Last-resort compat fallback: ${target.modelStr} failed (${result.status}) — trying next`);
    }
    return null;
}
}),
"[project]/open-sse/services/combo/quotaScoring.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateResetWindowAffinity",
    ()=>calculateResetWindowAffinity,
    "getResetAwareProvider",
    ()=>getResetAwareProvider,
    "getResetWindowTimestampMs",
    ()=>getResetWindowTimestampMs,
    "resolveResetAwareConfig",
    ()=>resolveResetAwareConfig,
    "resolveResetWindowConfig",
    ()=>resolveResetWindowConfig,
    "resolveSlaRoutingPolicy",
    ()=>resolveSlaRoutingPolicy,
    "scoreResetAwareQuota",
    ()=>scoreResetAwareQuota
]);
/**
 * Pure scoring + window-math helpers for the reset-aware / reset-window combo
 * strategies. No module state, no async, no I/O — extracted byte-identically
 * from combo.ts (QG v2 Fase 9 T5 D7b) as the pure half of the reset-aware quota
 * block. The stateful/async half (cache Maps + connection/quota fetchers +
 * orderTargets*) lives in ./quotaStrategies.ts, which imports the scoring
 * helpers from here.
 *
 * Pure leaf: this module never imports from the combo barrel.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/number.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboData.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/types.ts [app-route] (ecmascript)");
;
;
;
const RESET_AWARE_SESSION_WINDOW_MS = 5 * 60 * 60 * 1000;
const RESET_AWARE_WEEKLY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_AWARE_SESSION_REMAINING_WEIGHT = 0.45;
const RESET_AWARE_SESSION_RESET_PRESSURE_WEIGHT = 0.55;
const RESET_AWARE_WEEKLY_REMAINING_WEIGHT = 0.25;
const RESET_AWARE_WEEKLY_RESET_PRESSURE_WEIGHT = 0.75;
const RESET_AWARE_DEFAULTS = {
    sessionWeight: 0.35,
    weeklyWeight: 0.65,
    tieBandPercent: 5,
    exhaustionGuardPercent: 10
};
const RESET_WINDOW_DEFAULT_TIE_BAND_MS = 60_000;
function finiteNumberOrNull(value) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
}
function getPercentConfig(value, fallback) {
    const numericValue = finiteNumberOrNull(value);
    if (numericValue === null) return fallback;
    return Math.max(0, Math.min(100, numericValue));
}
function getWeightConfig(value, fallback) {
    const numericValue = finiteNumberOrNull(value);
    if (numericValue === null || numericValue < 0) return fallback;
    return numericValue;
}
function getDurationConfig(value, fallback, max) {
    const numericValue = finiteNumberOrNull(value);
    if (numericValue === null || numericValue < 0) return fallback;
    return Math.min(max, Math.floor(numericValue));
}
function resolveResetAwareConfig(config) {
    const sessionWeight = getWeightConfig(config?.resetAwareSessionWeight, RESET_AWARE_DEFAULTS.sessionWeight);
    const weeklyWeight = getWeightConfig(config?.resetAwareWeeklyWeight, RESET_AWARE_DEFAULTS.weeklyWeight);
    const totalWeight = sessionWeight + weeklyWeight;
    const normalizedSessionWeight = totalWeight > 0 ? sessionWeight / totalWeight : RESET_AWARE_DEFAULTS.sessionWeight;
    return {
        sessionWeight: normalizedSessionWeight,
        weeklyWeight: 1 - normalizedSessionWeight,
        tieBand: getPercentConfig(config?.resetAwareTieBandPercent, RESET_AWARE_DEFAULTS.tieBandPercent) / 100,
        exhaustionGuard: getPercentConfig(config?.resetAwareExhaustionGuardPercent, RESET_AWARE_DEFAULTS.exhaustionGuardPercent) / 100,
        quotaCacheTtlMs: getDurationConfig(config?.resetAwareQuotaCacheTtlMs, 0, 300_000),
        quotaCacheMaxStaleMs: getDurationConfig(config?.resetAwareQuotaCacheMaxStaleMs, 0, 3_600_000)
    };
}
function resolveResetWindowConfig(config) {
    const rawWindows = Array.isArray(config?.resetWindowWindows) ? config.resetWindowWindows : null;
    const windows = rawWindows?.filter((windowName)=>__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RESET_WINDOW_NAMES"].includes(String(windowName))).filter((windowName, index, array)=>array.indexOf(windowName) === index);
    const effectiveWindows = windows && windows.length > 0 ? windows : config?.resetWindowIncludeSession === true ? [
        "weekly",
        "session"
    ] : [
        "weekly"
    ];
    return {
        windows: effectiveWindows,
        tieBandMs: Math.max(0, finiteNumberOrNull(config?.resetWindowTieBandMs) ?? RESET_WINDOW_DEFAULT_TIE_BAND_MS),
        quotaCacheTtlMs: getDurationConfig(config?.resetWindowQuotaCacheTtlMs, 0, 300_000),
        quotaCacheMaxStaleMs: getDurationConfig(config?.resetWindowQuotaCacheMaxStaleMs, 0, 3_600_000)
    };
}
function resolveSlaRoutingPolicy(config) {
    if (!config) return undefined;
    const nestedSla = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(config.sla) ? config.sla : {};
    const targetP95Ms = finiteNumberOrNull(config.slaTargetP95Ms ?? nestedSla.targetP95Ms);
    const maxErrorRate = finiteNumberOrNull(config.slaMaxErrorRate ?? nestedSla.maxErrorRate);
    const maxCostPer1MTokens = finiteNumberOrNull(config.slaMaxCostPer1MTokens ?? nestedSla.maxCostPer1MTokens);
    const hardConstraints = config.slaHardConstraints ?? nestedSla.hardConstraints;
    const policy = {};
    if (targetP95Ms !== null && targetP95Ms > 0) policy.targetP95Ms = targetP95Ms;
    if (maxErrorRate !== null && maxErrorRate >= 0) policy.maxErrorRate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(maxErrorRate);
    if (maxCostPer1MTokens !== null && maxCostPer1MTokens > 0) {
        policy.maxCostPer1MTokens = maxCostPer1MTokens;
    }
    if (typeof hardConstraints === "boolean") policy.hardConstraints = hardConstraints;
    return Object.keys(policy).length > 0 ? policy : undefined;
}
function getResetAwareProvider(target) {
    const provider = (target.providerId || target.provider || "").toLowerCase();
    return provider || null;
}
function normalizeResetAt(value) {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return null;
}
function parseResetTimeMs(resetAt) {
    if (!resetAt) return NaN;
    const resetTime = Date.parse(resetAt);
    if (Number.isFinite(resetTime)) return resetTime;
    if (!/^\d+(?:\.\d+)?$/.test(resetAt)) return NaN;
    const numericResetAt = Number(resetAt);
    if (!Number.isFinite(numericResetAt)) return NaN;
    return numericResetAt < 10_000_000_000 ? numericResetAt * 1000 : numericResetAt;
}
function getQuotaWindow(quota, key) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(quota)) return null;
    const window = quota[key];
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(window)) return null;
    const percentUsed = finiteNumberOrNull(window.percentUsed);
    const resetAt = normalizeResetAt(window.resetAt);
    return {
        percentUsed,
        resetAt
    };
}
function normalizeWindowPercentUsed(value) {
    const numericValue = finiteNumberOrNull(value);
    if (numericValue === null) return null;
    if (numericValue > 1) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(numericValue / 100);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(numericValue);
}
function getNamedQuotaWindow(quota, windowName) {
    if (!quota || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(quota)) return null;
    if (windowName === "session") return getQuotaWindow(quota, "window5h");
    if (windowName === "weekly") {
        return getQuotaWindow(quota, "window7d") || getQuotaWindow(quota, "windowWeekly");
    }
    if (windowName === "monthly") return getQuotaWindow(quota, "windowMonthly");
    return null;
}
function getWindowsMapQuotaWindow(quota, windowName) {
    if (!quota || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(quota) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(quota.windows)) return null;
    const candidates = Object.entries(quota.windows).map(([key, value])=>({
            key: key.toLowerCase(),
            value
        })).filter(({ key })=>key === windowName || key.startsWith(`${windowName} `));
    if (candidates.length === 0) return null;
    candidates.sort((a, b)=>a.key.localeCompare(b.key));
    const window = candidates[0].value;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(window)) return null;
    return {
        percentUsed: normalizeWindowPercentUsed(window.percentUsed),
        resetAt: normalizeResetAt(window.resetAt)
    };
}
function resolveQuotaWindowByName(quota, windowName) {
    return getNamedQuotaWindow(quota, windowName) || getWindowsMapQuotaWindow(quota, windowName);
}
function getResetUrgency(resetAt, windowMs) {
    if (!resetAt) return 0.5;
    const resetTime = parseResetTimeMs(resetAt);
    if (!Number.isFinite(resetTime)) return 0.5;
    const msUntilReset = resetTime - Date.now();
    if (msUntilReset <= 0) return 1;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(1 - msUntilReset / windowMs);
}
function scoreQuotaWindow(remaining, resetAt, windowMs, remainingWeight, resetPressureWeight) {
    const normalizedRemaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(remaining);
    const resetUrgency = getResetUrgency(resetAt, windowMs);
    const resetPressure = resetUrgency * (1 - normalizedRemaining);
    return remainingWeight * normalizedRemaining + resetPressureWeight * resetPressure;
}
function scoreResetAwareQuota(quota, config) {
    if (!quota || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(quota)) return {
        score: 0.5
    };
    if (quota.limitReached === true) return {
        score: -Infinity
    };
    const overallPercentUsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(finiteNumberOrNull(quota.percentUsed) ?? 0.5);
    const sessionWindow = getQuotaWindow(quota, "window5h");
    const weeklyWindow = getQuotaWindow(quota, "window7d") || getQuotaWindow(quota, "windowWeekly");
    const sessionRemaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(1 - (sessionWindow?.percentUsed ?? overallPercentUsed));
    const weeklyRemaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(1 - (weeklyWindow?.percentUsed ?? overallPercentUsed));
    const sessionScore = scoreQuotaWindow(sessionRemaining, sessionWindow?.resetAt, RESET_AWARE_SESSION_WINDOW_MS, RESET_AWARE_SESSION_REMAINING_WEIGHT, RESET_AWARE_SESSION_RESET_PRESSURE_WEIGHT);
    const weeklyScore = scoreQuotaWindow(weeklyRemaining, weeklyWindow?.resetAt ?? normalizeResetAt(quota.resetAt), RESET_AWARE_WEEKLY_WINDOW_MS, RESET_AWARE_WEEKLY_REMAINING_WEIGHT, RESET_AWARE_WEEKLY_RESET_PRESSURE_WEIGHT);
    let score = config.sessionWeight * sessionScore + config.weeklyWeight * weeklyScore;
    if (config.exhaustionGuard > 0 && sessionRemaining < config.exhaustionGuard) {
        score *= Math.max(0.05, sessionRemaining / config.exhaustionGuard);
    }
    return {
        score
    };
}
function getResetWindowTimestampMs(quota, windows) {
    if (!quota || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(quota) || quota.limitReached === true) return Infinity;
    let selectedResetMs = Infinity;
    for (const windowName of windows){
        const window = resolveQuotaWindowByName(quota, windowName);
        const resetMs = parseResetTimeMs(window?.resetAt ?? null);
        if (Number.isFinite(resetMs)) {
            selectedResetMs = Math.min(selectedResetMs, resetMs);
        }
    }
    if (!Number.isFinite(selectedResetMs)) {
        selectedResetMs = parseResetTimeMs(normalizeResetAt(quota.resetAt));
    }
    return Number.isFinite(selectedResetMs) ? selectedResetMs : Infinity;
}
function getResetWindowHorizonMs(windows) {
    if (windows.includes("monthly")) return 30 * 24 * 60 * 60 * 1000;
    if (windows.includes("weekly")) return RESET_AWARE_WEEKLY_WINDOW_MS;
    return RESET_AWARE_SESSION_WINDOW_MS;
}
function calculateResetWindowAffinity(quota, config) {
    const resetMs = getResetWindowTimestampMs(quota, config.windows);
    if (!Number.isFinite(resetMs)) return 0.5;
    const msUntilReset = resetMs - Date.now();
    if (msUntilReset <= 0) return 1;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$number$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clamp01"])(1 - msUntilReset / getResetWindowHorizonMs(config.windows));
}
}),
"[project]/open-sse/services/combo/quotaStrategies.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "__setHeadroomSaturationFetcherForTests",
    ()=>__setHeadroomSaturationFetcherForTests,
    "fetchResetAwareQuotaWithCache",
    ()=>fetchResetAwareQuotaWithCache,
    "orderTargetsByHeadroom",
    ()=>orderTargetsByHeadroom,
    "orderTargetsByResetAwareQuota",
    ()=>orderTargetsByResetAwareQuota,
    "orderTargetsByResetWindow",
    ()=>orderTargetsByResetWindow,
    "preScreenTargets",
    ()=>preScreenTargets
]);
/**
 * Stateful + async reset-aware / reset-window quota strategies for combo routing.
 *
 * Holds the two mutable module-level caches that back reset-aware routing
 * (`resetAwareConnectionCache` for per-provider active connections and
 * `resetAwareQuotaCache` for per-connection quota snapshots), plus the helpers
 * that read/write them and the strategy orderers. Extracted byte-identically
 * from combo.ts (QG v2 Fase 9 T5 D7b) — the larger, stateful half of the
 * reset-aware quota block. The pure scoring/window-math half lives in
 * ./quotaScoring.ts and is imported here.
 *
 * State cohesion: `resetAwareConnectionCache`, `resetAwareQuotaCache`, and
 * `MAX_RESET_AWARE_CACHE` MUST remain single instances defined once here,
 * alongside their only readers/writers (getQuotaAwareConnectionsForTarget,
 * fetchResetAwareQuotaWithCache) — never duplicate a Map.
 *
 * Cross-module state: the tie-band round-robin in orderTargetsByResetAwareQuota
 * and orderTargetsByResetWindow shares the same rrCounters Map from ./rrState.ts
 * (D7a) so reset-aware tie rotation stays consistent with round-robin routing.
 *
 * @changes
 * - [2026-07-24] [Composer] - Exclude Antigravity accounts without stored projectId from reset-aware pool
 * - [2026-07-24] [Composer] - Skip quota-exhausted and rate-limited connections in reset-aware expansion
 *
 * Pure leaf: this module never imports from the combo barrel.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/comboConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/rrState.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/quotaScoring.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$headroomRanking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/headroomRanking.ts [app-route] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '../antigravityProjectPersistence.ts'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/quotaCache.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const RESET_AWARE_CONNECTION_CACHE_TTL_MS = 30_000;
const RESET_AWARE_QUOTA_FETCH_CONCURRENCY = 5;
const HEADROOM_SATURATION_FETCH_CONCURRENCY = 5;
const MAX_RESET_AWARE_CACHE = 200;
const resetAwareConnectionCache = new Map();
const resetAwareQuotaCache = new Map();
async function getQuotaAwareConnectionsForTarget(target, connectionCache, connectionLoadPromises, comboName, log) {
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResetAwareProvider"])(target);
    if (!provider || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getQuotaFetcher"])(provider)) return [];
    if (!connectionCache.has(provider)) {
        const cached = resetAwareConnectionCache.get(provider);
        if (cached && Date.now() - cached.fetchedAt < RESET_AWARE_CONNECTION_CACHE_TTL_MS) {
            connectionCache.set(provider, cached.connections);
            return cached.connections;
        }
        if (!connectionLoadPromises.has(provider)) {
            connectionLoadPromises.set(provider, (async ()=>{
                try {
                    const connections = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnections"])({
                        provider,
                        isActive: true
                    });
                    let activeConnections = Array.isArray(connections) ? connections : [];
                    if (provider === "antigravity" || provider === "agy") {
                        activeConnections = preferAntigravityConnectionsWithStoredProject(activeConnections);
                    }
                    if (!resetAwareConnectionCache.has(provider) && resetAwareConnectionCache.size >= MAX_RESET_AWARE_CACHE) {
                        const oldest = resetAwareConnectionCache.keys().next().value;
                        if (oldest !== undefined) resetAwareConnectionCache.delete(oldest);
                    }
                    resetAwareConnectionCache.set(provider, {
                        connections: activeConnections,
                        fetchedAt: Date.now()
                    });
                    return activeConnections;
                } catch (error) {
                    log.warn?.("COMBO", "Reset-aware failed to load quota-aware connections.", {
                        comboName,
                        err: error,
                        operation: "getProviderConnections",
                        provider
                    });
                    return [];
                }
            })());
        }
        const connections = await connectionLoadPromises.get(provider);
        connectionCache.set(provider, connections);
    }
    return connectionCache.get(provider) || [];
}
function normalizeConnectionIds(value) {
    if (!Array.isArray(value)) return null;
    const ids = value.filter((connectionId)=>typeof connectionId === "string" && connectionId.trim().length > 0);
    return ids.length > 0 ? ids : null;
}
function filterAllowedConnectionIds(connectionIds, apiKeyAllowedConnectionIds) {
    const allowedIds = normalizeConnectionIds(apiKeyAllowedConnectionIds);
    if (!allowedIds) return connectionIds;
    const allowedSet = new Set(allowedIds);
    return connectionIds.filter((connectionId)=>allowedSet.has(connectionId));
}
function getTargetConnectionIds(target, connections) {
    let connectionIds;
    if (target.connectionId) {
        return [
            target.connectionId
        ];
    }
    if (Array.isArray(target.allowedConnectionIds) && target.allowedConnectionIds.length > 0) {
        return target.allowedConnectionIds.filter((connectionId)=>typeof connectionId === "string" && connectionId.trim().length > 0);
    }
    connectionIds = connections.map((connection)=>typeof connection.id === "string" ? connection.id : null).filter((connectionId)=>!!connectionId);
    return connectionIds;
}
async function expandTargetsByQuotaAwareConnections(targets, comboName, log, apiKeyAllowedConnectionIds) {
    const connectionCache = new Map();
    const connectionLoadPromises = new Map();
    const connectionById = new Map();
    const expandedTargets = [];
    const targetsWithConnections = await Promise.all(targets.map(async (target)=>({
            connections: await getQuotaAwareConnectionsForTarget(target, connectionCache, connectionLoadPromises, comboName, log),
            target
        })));
    for (const { target, connections } of targetsWithConnections){
        for (const connection of connections){
            if (typeof connection.id === "string") connectionById.set(connection.id, connection);
        }
        const unrestrictedConnectionIds = getTargetConnectionIds(target, connections);
        const connectionIds = filterAllowedConnectionIds(unrestrictedConnectionIds, apiKeyAllowedConnectionIds);
        if (connectionIds.length === 0) {
            if (unrestrictedConnectionIds.length > 0 && normalizeConnectionIds(apiKeyAllowedConnectionIds)) {
                continue;
            }
            expandedTargets.push(target);
            continue;
        }
        for (const connectionId of connectionIds){
            const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResetAwareProvider"])(target);
            const connection = connectionById.get(connectionId);
            if (connection && typeof connection.rateLimitedUntil === "string" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isAccountUnavailable"])(connection.rateLimitedUntil)) {
                continue;
            }
            if (provider && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$quotaCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isQuotaExhaustedForRequest"])(connectionId, provider, target.modelStr || null)) {
                continue;
            }
            expandedTargets.push({
                ...target,
                connectionId,
                executionKey: target.connectionId === connectionId ? target.executionKey : `${target.executionKey}@${connectionId}`
            });
        }
    }
    return {
        connectionById,
        expandedTargets
    };
}
async function scoreQuotaAwareTargets({ comboName, config, connectionById, expandedTargets, log, scoreQuota }) {
    const quotaPromises = new Map();
    return mapWithConcurrency(expandedTargets, RESET_AWARE_QUOTA_FETCH_CONCURRENCY, async (target, index)=>{
        let quota = null;
        const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResetAwareProvider"])(target);
        const fetcher = provider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getQuotaFetcher"])(provider) : null;
        if (fetcher && provider && target.connectionId) {
            const quotaKey = `${provider}:${target.connectionId}`;
            if (!quotaPromises.has(quotaKey)) {
                quotaPromises.set(quotaKey, fetchResetAwareQuotaWithCache({
                    provider,
                    connectionId: target.connectionId,
                    connection: connectionById.get(target.connectionId),
                    fetcher,
                    config,
                    log,
                    comboName
                }));
            }
            quota = await quotaPromises.get(quotaKey);
        }
        return {
            target,
            index,
            ...scoreQuota(quota)
        };
    });
}
function rotateLeadingTies(sortedTargets, tiedTargets, key) {
    let orderedTiedTargets = tiedTargets;
    if (tiedTargets.length > 1) {
        const counter = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rrCounters"].get(key) || 0;
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rrCounters"].has(key) && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rrCounters"].size >= __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_RR_COUNTERS"]) {
            const oldest = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rrCounters"].keys().next().value;
            if (oldest !== undefined) __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rrCounters"].delete(oldest);
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rrCounters"].set(key, counter + 1);
        const startIndex = counter % tiedTargets.length;
        orderedTiedTargets = [
            ...tiedTargets.slice(startIndex),
            ...tiedTargets.slice(0, startIndex)
        ];
    }
    const tiedExecutionKeys = new Set(orderedTiedTargets.map((entry)=>entry.target.executionKey));
    return [
        ...orderedTiedTargets,
        ...sortedTargets.filter((entry)=>!tiedExecutionKeys.has(entry.target.executionKey))
    ];
}
async function mapWithConcurrency(items, concurrency, mapper) {
    const results = new Array(items.length);
    let nextIndex = 0;
    const workerCount = Math.max(1, Math.min(concurrency, items.length));
    await Promise.all(Array.from({
        length: workerCount
    }, async ()=>{
        while(nextIndex < items.length){
            const currentIndex = nextIndex++;
            results[currentIndex] = await mapper(items[currentIndex], currentIndex);
        }
    }));
    return results;
}
async function fetchResetAwareQuotaWithCache({ provider, connectionId, connection, fetcher, config, log, comboName }) {
    const cacheKey = `${provider}:${connectionId}`;
    const ttlMs = config.quotaCacheTtlMs;
    const maxStaleMs = config.quotaCacheMaxStaleMs;
    const now = Date.now();
    const cached = resetAwareQuotaCache.get(cacheKey);
    if (ttlMs <= 0 && maxStaleMs <= 0) {
        try {
            return await fetcher(connectionId, connection);
        } catch (error) {
            log.warn?.("COMBO", "Reset-aware quota fetch failed.", {
                comboName,
                connectionId,
                err: error,
                operation: "quotaFetch",
                provider
            });
            return null;
        }
    }
    const refresh = ()=>{
        const existing = resetAwareQuotaCache.get(cacheKey);
        if (existing?.refreshPromise != null) return existing.refreshPromise;
        const refreshPromise = fetcher(connectionId, connection).then((quota)=>{
            if (quota) {
                if (!resetAwareQuotaCache.has(cacheKey) && resetAwareQuotaCache.size >= MAX_RESET_AWARE_CACHE) {
                    const oldest = resetAwareQuotaCache.keys().next().value;
                    if (oldest !== undefined) resetAwareQuotaCache.delete(oldest);
                }
                resetAwareQuotaCache.set(cacheKey, {
                    quota,
                    fetchedAt: Date.now(),
                    refreshPromise: null
                });
            } else {
                resetAwareQuotaCache.delete(cacheKey);
            }
            return quota;
        }).catch((error)=>{
            const previous = resetAwareQuotaCache.get(cacheKey);
            if (previous) {
                if (!resetAwareQuotaCache.has(cacheKey) && resetAwareQuotaCache.size >= MAX_RESET_AWARE_CACHE) {
                    const oldest = resetAwareQuotaCache.keys().next().value;
                    if (oldest !== undefined) resetAwareQuotaCache.delete(oldest);
                }
                resetAwareQuotaCache.set(cacheKey, {
                    ...previous,
                    refreshPromise: null
                });
            }
            log.warn?.("COMBO", "Reset-aware quota fetch failed.", {
                comboName,
                connectionId,
                err: error,
                operation: "quotaFetch",
                provider
            });
            return null;
        });
        if (!resetAwareQuotaCache.has(cacheKey) && resetAwareQuotaCache.size >= MAX_RESET_AWARE_CACHE) {
            const oldest = resetAwareQuotaCache.keys().next().value;
            if (oldest !== undefined) resetAwareQuotaCache.delete(oldest);
        }
        resetAwareQuotaCache.set(cacheKey, {
            quota: existing?.quota ?? cached?.quota ?? null,
            fetchedAt: existing?.fetchedAt ?? cached?.fetchedAt ?? 0,
            refreshPromise
        });
        return refreshPromise;
    };
    if (ttlMs > 0 && cached) {
        const age = now - cached.fetchedAt;
        if (age <= ttlMs) return cached.quota;
        if (maxStaleMs > 0 && age <= ttlMs + maxStaleMs) {
            void refresh();
            return cached.quota;
        }
    }
    return refresh();
}
async function preScreenTargets(targets, isModelAvailable) {
    if (targets.length === 0) {
        return new Map();
    }
    const results = await mapWithConcurrency(targets, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PRE_SCREEN_CONCURRENCY"], async (target)=>{
        const profile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRuntimeProviderProfile"])(target.provider).catch(()=>null);
        const breaker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(target.provider);
        if (breaker.getStatus().state === "OPEN") {
            return {
                key: target.executionKey,
                result: {
                    profile,
                    available: false
                }
            };
        }
        let available = true;
        if (isModelAvailable) {
            // IsModelAvailable may return a sync boolean or a Promise; Promise.resolve
            // normalizes both so the .catch() never runs against a bare boolean.
            available = await Promise.resolve(isModelAvailable(target.modelStr, target)).catch(()=>true);
        }
        return {
            key: target.executionKey,
            result: {
                profile,
                available
            }
        };
    });
    const map = new Map();
    for (const { key, result } of results){
        map.set(key, result);
    }
    return map;
}
async function orderTargetsByResetAwareQuota(targets, comboName, configSource, log, apiKeyAllowedConnectionIds) {
    if (targets.length === 0) return targets;
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResetAwareConfig"])(configSource);
    const { connectionById, expandedTargets } = await expandTargetsByQuotaAwareConnections(targets, comboName, log, apiKeyAllowedConnectionIds);
    const scoredTargets = await scoreQuotaAwareTargets({
        comboName,
        config,
        connectionById,
        expandedTargets,
        log,
        scoreQuota: (quota)=>({
                score: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreResetAwareQuota"])(quota, config).score
            })
    });
    scoredTargets.sort((a, b)=>{
        if (b.score !== a.score) return b.score - a.score;
        return a.index - b.index;
    });
    const bestScore = scoredTargets[0]?.score ?? 0;
    const tiedTargets = scoredTargets.filter((entry)=>bestScore - entry.score <= config.tieBand);
    return rotateLeadingTies(scoredTargets, tiedTargets, `reset-aware:${comboName}`).map((entry)=>entry.target);
}
async function orderTargetsByResetWindow(targets, comboName, configSource, log, apiKeyAllowedConnectionIds) {
    if (targets.length === 0) return targets;
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResetWindowConfig"])(configSource);
    const { connectionById, expandedTargets } = await expandTargetsByQuotaAwareConnections(targets, comboName, log, apiKeyAllowedConnectionIds);
    const scoredTargets = await scoreQuotaAwareTargets({
        comboName,
        config,
        connectionById,
        expandedTargets,
        log,
        scoreQuota: (quota)=>({
                resetMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getResetWindowTimestampMs"])(quota, config.windows)
            })
    });
    scoredTargets.sort((a, b)=>{
        if (a.resetMs !== b.resetMs) return a.resetMs - b.resetMs;
        return a.index - b.index;
    });
    const bestResetMs = scoredTargets[0]?.resetMs ?? Infinity;
    if (!Number.isFinite(bestResetMs) || config.tieBandMs <= 0) {
        return scoredTargets.map((entry)=>entry.target);
    }
    const tiedTargets = scoredTargets.filter((entry)=>entry.resetMs - bestResetMs <= config.tieBandMs);
    if (tiedTargets.length <= 1) return scoredTargets.map((entry)=>entry.target);
    return rotateLeadingTies(scoredTargets, tiedTargets, `reset-window:${comboName}`).map((entry)=>entry.target);
}
let _headroomSaturationFetcherOverride = null;
function __setHeadroomSaturationFetcherForTests(fetcher) {
    _headroomSaturationFetcherOverride = fetcher;
}
async function resolveHeadroomSaturationFetcher() {
    if (_headroomSaturationFetcherOverride) return _headroomSaturationFetcherOverride;
    const mod = await __turbopack_context__.A("[project]/src/lib/quota/saturationSignals.ts [app-route] (ecmascript, async loader)");
    return mod.getSaturation;
}
async function orderTargetsByHeadroom(targets, comboName, log, apiKeyAllowedConnectionIds) {
    if (targets.length <= 1) return targets;
    try {
        const { expandedTargets, connectionById } = await expandTargetsByQuotaAwareConnections(targets, comboName, log, apiKeyAllowedConnectionIds);
        if (expandedTargets.length <= 1) return expandedTargets;
        const getSaturation = await resolveHeadroomSaturationFetcher();
        // Fetch saturation once per unique provider:connection (5h + weekly).
        const satByConnection = new Map();
        const connKey = (target)=>`${target.provider}:${target.connectionId}`;
        await mapWithConcurrency(expandedTargets, HEADROOM_SATURATION_FETCH_CONCURRENCY, async (target)=>{
            if (!target.connectionId) return;
            const key = connKey(target);
            if (satByConnection.has(key)) return;
            // #6379: thread the loaded connection snapshot (with decrypted
            // credentials) through to getSaturation so provider-specific fetchers
            // that need credentials (e.g. Codex's fetchCodexQuota) can actually
            // read them, instead of failing open to 0 for every candidate and
            // leaving headroom ranking unable to tell accounts apart.
            const connection = connectionById.get(target.connectionId);
            const connectionId = target.connectionId;
            const provider = target.provider;
            satByConnection.set(key, (async ()=>{
                const [util5h, util7d] = await Promise.all([
                    getSaturation(connectionId, provider, {
                        unit: "percent",
                        window: "5h"
                    }, connection),
                    getSaturation(connectionId, provider, {
                        unit: "percent",
                        window: "weekly"
                    }, connection)
                ]);
                return {
                    util5h,
                    util7d
                };
            })());
            await satByConnection.get(key);
        });
        // Resolve the per-connection saturation, keyed by the per-target executionKey
        // for the pure ranker. Targets without a connection get full headroom.
        const satByExecutionKey = new Map();
        for (const target of expandedTargets){
            if (!target.connectionId) continue;
            const sat = await satByConnection.get(connKey(target));
            if (sat) satByExecutionKey.set(target.executionKey, sat);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$headroomRanking$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["rankByHeadroom"])(expandedTargets, satByExecutionKey, (target)=>target.executionKey);
    } catch (err) {
        log.warn?.({
            err: err?.message,
            comboName
        }, "headroom ordering failed — keeping target order");
        return targets;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/quotaExhaustionCutoff.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildAutoQuotaThresholds",
    ()=>buildAutoQuotaThresholds,
    "resolveQuotaExhaustionCutoffForTarget",
    ()=>resolveQuotaExhaustionCutoffForTarget
]);
/**
 * Quota-exhaustion cutoff helpers for combo routing.
 *
 * Home of the opt-in per-(provider, connection, window) quota-exhaustion cutoff
 * shared by the "auto" strategy candidate builder (`buildAutoQuotaThresholds`,
 * consumed by combo.ts::buildAutoCandidates) and the per-target eligibility loop
 * (`resolveQuotaExhaustionCutoffForTarget`, consumed by combo.ts::handleComboChat
 * for every non-auto strategy). Extracted from combo.ts (#5923 Finding #4) to
 * keep the god-file under its frozen size cap; behavior is byte-identical.
 *
 * Pure leaf: this module never imports from the combo barrel. Threshold math and
 * cutoff evaluation are delegated to ./quotaPreflight.ts; the reset-aware quota
 * fetch/cache is delegated to ./quotaStrategies.ts.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/quotaPreflight.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/localDb.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/readCache.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/quotaStrategies.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localDb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function asThresholdMap(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const result = {};
    for (const [key, raw] of Object.entries(value)){
        const numeric = Number(raw);
        if (key && Number.isFinite(numeric)) result[key] = numeric;
    }
    return result;
}
function quotaWindowLookupNames(provider, windowName) {
    const names = [
        windowName
    ];
    const lower = windowName.toLowerCase();
    if (lower !== windowName) names.push(lower);
    if (provider === "codex") {
        if (lower.includes("session") || lower === "5h" || lower === "five_hour") names.push("session");
        if (lower.includes("weekly") || lower === "7d" || lower === "seven_day") names.push("weekly");
        if (lower.includes("monthly") || lower === "30d") names.push("monthly");
    }
    return [
        ...new Set(names)
    ];
}
function buildAutoQuotaThresholds(provider, connection, resilienceSettings) {
    const quotaPreflight = (resilienceSettings ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(null))?.quotaPreflight;
    const defaultThresholdPercent = quotaPreflight?.defaultThresholdPercent ?? 2;
    const warnThresholdPercent = quotaPreflight?.warnThresholdPercent ?? 20;
    const providerWindowMap = asThresholdMap(quotaPreflight?.providerWindowDefaults?.[provider]);
    const perConnectionWindowOverrides = asThresholdMap(connection?.quotaWindowThresholds);
    return {
        resolveMinRemainingPercent: (windowName)=>{
            if (windowName !== null) {
                for (const lookupWindowName of quotaWindowLookupNames(provider, windowName)){
                    const override = perConnectionWindowOverrides[lookupWindowName];
                    if (typeof override === "number") return override;
                    const providerDefault = providerWindowMap[lookupWindowName];
                    if (typeof providerDefault === "number") return providerDefault;
                }
            }
            return defaultThresholdPercent;
        },
        resolveWarnRemainingPercent: ()=>warnThresholdPercent
    };
}
async function resolveQuotaExhaustionCutoffForTarget(provider, connectionId, resilienceSettings, resetWindowConfig, comboName, log) {
    const quotaCutoffEnabled = (resilienceSettings ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(null))?.quotaPreflight?.enabled === true;
    if (!quotaCutoffEnabled || !provider || !connectionId) return {
        blocked: false
    };
    const fetcher = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getQuotaFetcher"])(provider);
    if (!fetcher) return {
        blocked: false
    };
    let connection;
    try {
        connection = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$readCache$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCachedProviderConnectionById"])(connectionId);
    } catch  {
        connection = undefined;
    }
    try {
        const quota = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchResetAwareQuotaWithCache"])({
            provider,
            connectionId,
            connection,
            fetcher,
            config: resetWindowConfig,
            log,
            comboName
        });
        const cutoffDecision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$quotaPreflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["evaluateQuotaCutoff"])(quota, buildAutoQuotaThresholds(provider, connection, resilienceSettings));
        if (!cutoffDecision.proceed) {
            return {
                blocked: true,
                reason: cutoffDecision.reason || "quota_exhausted"
            };
        }
    } catch  {
        // Fail-open: never block routing because the preflight fetch itself errored.
        return {
            blocked: false
        };
    }
    return {
        blocked: false
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/fingerprintExpansion.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Fingerprint-based target expansion for combo routing.
 *
 * Some providers (MiMoCode, MiCode, OpenCode) store multiple device
 * fingerprints inside a single connection's `providerSpecificData.fingerprints`.
 * Without expansion the combo system treats the connection as one account,
 * so only one fingerprint is used per request.  This module splits such
 * connections into one target per fingerprint so the combo round-robin
 * distributes requests across all of them.
 *
 * Expansion runs AFTER connection-based expansion and BEFORE the
 * `candidates` scoring pass in `combo.ts`.
 */ __turbopack_context__.s([
    "buildFingerprintExecutionKey",
    ()=>buildFingerprintExecutionKey,
    "expandTargetsByFingerprints",
    ()=>expandTargetsByFingerprints,
    "getConnectionFingerprints",
    ()=>getConnectionFingerprints,
    "hasMultipleFingerprints",
    ()=>hasMultipleFingerprints,
    "isFingerprintProvider",
    ()=>isFingerprintProvider,
    "splitFingerprintPin",
    ()=>splitFingerprintPin
]);
/** Providers whose `providerSpecificData.fingerprints` array should be expanded. */ const FINGERPRINT_PROVIDERS = new Set([
    "mimocode",
    "mcode",
    "opencode"
]);
/** Separator the combo builder UI uses to encode an account pin (#6087). */ const FP_PIN_SEPARATOR = "|fp|";
function isFingerprintProvider(provider) {
    return FINGERPRINT_PROVIDERS.has(provider);
}
function splitFingerprintPin(connectionId) {
    const separatorIndex = connectionId.indexOf(FP_PIN_SEPARATOR);
    if (separatorIndex === -1) return null;
    const realConnectionId = connectionId.slice(0, separatorIndex);
    const pinnedFingerprint = connectionId.slice(separatorIndex + FP_PIN_SEPARATOR.length);
    if (!realConnectionId || !pinnedFingerprint) return null;
    return {
        realConnectionId,
        pinnedFingerprint
    };
}
function getConnectionFingerprints(connection) {
    if (!connection || typeof connection !== "object") return [];
    const psd = connection["providerSpecificData"];
    if (!psd || typeof psd !== "object") return [];
    const fps = psd["fingerprints"];
    if (!Array.isArray(fps)) return [];
    return fps.filter((fp)=>typeof fp === "string" && fp.trim().length > 0);
}
function hasMultipleFingerprints(connection) {
    return getConnectionFingerprints(connection).length > 1;
}
function buildFingerprintExecutionKey(originalKey, fingerprint, isFirst) {
    if (isFirst) return originalKey;
    return `${originalKey}@fp:${fingerprint}`;
}
function expandTargetsByFingerprints(targets, connectionById, getProvider) {
    const result = [];
    for (const target of targets){
        const provider = getProvider(target);
        const { connectionId } = target;
        if (!connectionId || !isFingerprintProvider(provider)) {
            result.push(target);
            continue;
        }
        // #6696: the combo builder UI pins a specific account by encoding it as
        // `${rowId}|fp|${fingerprint}`. That composite string never matches a real
        // DB row id in `connectionById`, so resolve it back to the real
        // connectionId + the pinned fingerprint here before any other lookup —
        // otherwise the pin is silently inert and credential resolution can never
        // find the connection at all.
        const pin = splitFingerprintPin(connectionId);
        if (pin) {
            result.push({
                ...target,
                connectionId: pin.realConnectionId,
                pinnedFingerprint: pin.pinnedFingerprint,
                executionKey: buildFingerprintExecutionKey(target.executionKey, pin.pinnedFingerprint, false)
            });
            continue;
        }
        const connection = connectionById.get(connectionId);
        const fingerprints = getConnectionFingerprints(connection);
        if (fingerprints.length <= 1) {
            result.push(target);
            continue;
        }
        for(let i = 0; i < fingerprints.length; i++){
            const isFirst = i === 0;
            result.push({
                ...target,
                executionKey: buildFingerprintExecutionKey(target.executionKey, fingerprints[i], isFirst)
            });
        }
    }
    return result;
}
}),
"[project]/open-sse/services/combo/quotaShareInflight.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * quotaShareInflight.ts — In-flight request counter for the quota-share strategy.
 *
 * Tracks how many requests are currently in-flight per connectionId so the
 * quota-share P2C tie-break can prefer the least-loaded connection in real time.
 *
 * Decrement-on-abort safety (TTL/lease):
 *   The generic combo dispatch path is intentionally NOT instrumented (so this
 *   feature cannot regress existing strategies). Instead, each in-flight slot
 *   carries an expiry: incrementInflight() stamps `nowMs + leaseMs`. The normal
 *   path calls decrementInflight() (returned to the caller as a callback) once
 *   the request settles, which clears the slot immediately. If a request is
 *   aborted or crashes before that callback runs, the slot still auto-expires
 *   after DEFAULT_LEASE_MS — so the counter can never leak forever, even without
 *   touching the generic dispatch.
 *
 * Fail-open: getInflight() returns 0 for an unknown / empty connectionId.
 * All time input is injectable (the `nowMs` param) so unit tests drive the
 * clock deterministically — the tested path never calls Date.now() implicitly.
 *
 * Part of: Quota Sharing Engine — Phase 3 (#9 dedicated quota-share strategy).
 */ // ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/**
 * Default lease duration (ms). A slot that is never explicitly decremented
 * (aborted / crashed request) auto-expires after this, bounding the counter.
 */ __turbopack_context__.s([
    "DEFAULT_LEASE_MS",
    ()=>DEFAULT_LEASE_MS,
    "_clearInflightForTest",
    ()=>_clearInflightForTest,
    "_inflightSizeForTest",
    ()=>_inflightSizeForTest,
    "decrementInflight",
    ()=>decrementInflight,
    "getInflight",
    ()=>getInflight,
    "incrementInflight",
    ()=>incrementInflight
]);
const DEFAULT_LEASE_MS = 120_000;
// ---------------------------------------------------------------------------
// In-process store. Key: connectionId.
// ---------------------------------------------------------------------------
const _inflightMap = new Map();
function incrementInflight(connectionId, leaseMs = DEFAULT_LEASE_MS, nowMs = Date.now()) {
    if (!connectionId) return 0;
    pruneExpired(nowMs);
    const slot = _inflightMap.get(connectionId);
    const base = slot && slot.expiresAtMs > nowMs ? slot.count : 0;
    const newCount = base + 1;
    _inflightMap.set(connectionId, {
        count: newCount,
        expiresAtMs: nowMs + leaseMs
    });
    return newCount;
}
function decrementInflight(connectionId, nowMs = Date.now()) {
    if (!connectionId) return;
    const slot = _inflightMap.get(connectionId);
    if (!slot || slot.expiresAtMs <= nowMs) {
        _inflightMap.delete(connectionId);
        return;
    }
    const newCount = Math.max(0, slot.count - 1);
    if (newCount === 0) {
        _inflightMap.delete(connectionId);
    } else {
        _inflightMap.set(connectionId, {
            count: newCount,
            expiresAtMs: slot.expiresAtMs
        });
    }
}
function getInflight(connectionId, nowMs = Date.now()) {
    if (!connectionId) return 0;
    const slot = _inflightMap.get(connectionId);
    if (!slot || slot.expiresAtMs <= nowMs) return 0;
    return slot.count;
}
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
/** Drop all expired slots so the map cannot grow unbounded with stale leases. */ function pruneExpired(nowMs) {
    for (const [key, slot] of _inflightMap){
        if (slot.expiresAtMs <= nowMs) _inflightMap.delete(key);
    }
}
function _clearInflightForTest() {
    _inflightMap.clear();
}
function _inflightSizeForTest() {
    return _inflightMap.size;
}
}),
"[project]/open-sse/services/combo/quotaShareStrategy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_clearDrrStateForTest",
    ()=>_clearDrrStateForTest,
    "_getDrrDeficitForTest",
    ()=>_getDrrDeficitForTest,
    "selectQuotaShareTarget",
    ()=>selectQuotaShareTarget
]);
/**
 * quotaShareStrategy.ts — Dedicated selection strategy for quota-share combos.
 *
 * Activated ONLY for the internal "quota-share" strategy (the auto-minted qtSd/
 * combos). It is never imported by generic combo routing paths, so tuning this
 * module can never regress the existing strategies (fill-first, p2c, headroom…).
 *
 * Three mechanisms are applied in sequence:
 *
 *   1. Per-model bucket gating (accountBuckets.isBucketSaturated):
 *      A connection whose 5h, 7d, or per-model 7d:<model> window is saturated
 *      for the requested model is moved to a DEPRIORITIZED tail rather than
 *      dropped. If EVERY connection is saturated, all are eligible again
 *      (fail-open: a quota-share combo is never hard-blocked here).
 *
 *   2. DRR (Deficit Round Robin):
 *      Among the eligible connections, each round adds a quantum proportional to
 *      the target weight to that target's deficit, then selects the target with
 *      the largest accumulated deficit and zeroes it. Over many requests this
 *      distributes load proportionally to weight, deterministically.
 *
 *   3. P2C (Power of Two Choices) over real in-flight load:
 *      Between the top two DRR candidates, the one with fewer active in-flight
 *      requests (quotaShareInflight) wins; ties keep the DRR order. The winner's
 *      in-flight counter is incremented immediately and a decrement callback is
 *      returned for the caller's finally/abort handler.
 *
 * All state is in-process; no DB or network calls. The clock is injectable
 * (the `nowMs` param) so unit tests are fully deterministic.
 *
 * Part of: Quota Sharing Engine — Phase 3 (#9 dedicated quota-share strategy).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/quota/accountBuckets.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaShareInflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/quotaShareInflight.ts [app-route] (ecmascript)");
;
;
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** Maximum number of per-combo DRR states retained before oldest-entry eviction. */ const MAX_DRR_COMBOS = 200;
// ---------------------------------------------------------------------------
// DRR state
// ---------------------------------------------------------------------------
/**
 * Outer key: comboName. Inner key: target.executionKey. Value: accumulated
 * deficit (higher = this target is "owed" more service). Single instance —
 * never duplicate this Map (state cohesion).
 */ const _drrState = new Map();
function getDrrDeficits(comboName) {
    let deficits = _drrState.get(comboName);
    if (!deficits) {
        if (_drrState.size >= MAX_DRR_COMBOS) {
            // Evict the oldest entry (Map iterates in insertion order).
            const oldestKey = _drrState.keys().next().value;
            if (oldestKey !== undefined) _drrState.delete(oldestKey);
        }
        deficits = new Map();
        _drrState.set(comboName, deficits);
    }
    return deficits;
}
// ---------------------------------------------------------------------------
// Mechanism 1 — per-model bucket gating
// ---------------------------------------------------------------------------
/** Extract the bare model name from "<provider>/<model>" (or pass through). */ function bareModelName(modelStr) {
    const slash = modelStr.indexOf("/");
    return slash >= 0 ? modelStr.slice(slash + 1) : modelStr;
}
/**
 * Return the eligible (non-saturated) targets. Fail-open: when every target is
 * saturated, the original list is returned so the combo is never hard-blocked.
 */ function filterEligibleBySaturation(targets, modelStr, nowMs) {
    const modelName = bareModelName(modelStr);
    const eligible = targets.filter((target)=>{
        const connId = target.connectionId ?? "";
        if (connId === "") return true; // no connection → cannot be saturation-scored
        const saturated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBucketSaturated"])(connId, "5h", nowMs) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBucketSaturated"])(connId, "7d", nowMs) || modelName !== "" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$quota$2f$accountBuckets$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBucketSaturated"])(connId, `7d:${modelName}`, nowMs);
        return !saturated;
    });
    return eligible.length > 0 ? eligible : targets;
}
// ---------------------------------------------------------------------------
// Mechanism 1b — per-connection concurrency gating (maxConcurrent)
// ---------------------------------------------------------------------------
/**
 * Resolve the configured concurrency cap for a connection. Treats null, <= 0,
 * non-finite, and a missing entry all as "no limit" (returns null → never gates).
 * The cap is the connection's `maxConcurrent` (provider_connections.max_concurrent),
 * supplied by the caller as a pre-resolved Map so this module stays pure/sync.
 */ function resolveConnectionCap(connectionId, caps) {
    if (!connectionId || !caps) return null;
    const cap = caps.get(connectionId);
    if (typeof cap !== "number" || !Number.isFinite(cap) || cap <= 0) return null;
    return cap;
}
/**
 * Partition `targets` into those with concurrency headroom and those currently
 * AT (or over) their per-connection `maxConcurrent`. A connection is "at cap"
 * when its live in-flight count (quotaShareInflight) is >= its configured cap.
 *
 * Fail-open, mirroring filterEligibleBySaturation: when EVERY target is at cap
 * (or no caps apply), all targets are returned as `withRoom` and `atCap` is
 * empty — the combo is never hard-blocked by this gate. Targets without a
 * positive cap are always treated as having room.
 */ function partitionByConcurrencyCap(targets, caps, nowMs) {
    if (!caps || caps.size === 0) return {
        withRoom: targets,
        atCap: []
    };
    const withRoom = [];
    const atCap = [];
    for (const target of targets){
        const connId = target.connectionId ?? "";
        const cap = resolveConnectionCap(connId, caps);
        if (cap === null) {
            withRoom.push(target); // no limit → always has room
            continue;
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaShareInflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInflight"])(connId, nowMs) >= cap) {
            atCap.push(target);
        } else {
            withRoom.push(target);
        }
    }
    // Fail-open: never demote the entire eligible set — if nothing has room,
    // keep all targets dispatchable rather than hard-blocking the combo.
    if (withRoom.length === 0) return {
        withRoom: targets,
        atCap: []
    };
    return {
        withRoom,
        atCap
    };
}
// ---------------------------------------------------------------------------
// Mechanism 2 — DRR ordering
// ---------------------------------------------------------------------------
/**
 * Reorder `targets` by deficit round-robin (quantum proportional to weight).
 * Returns a NEW array with the highest-deficit target first; mutates the shared
 * DRR state for `comboName`.
 *
 * Classic DRR: every round each target gains a quantum equal to its normalized
 * weight share; the target with the largest deficit is selected and pays a fixed
 * cost of 1. Subtracting a constant (rather than zeroing) keeps the accumulated
 * fractional credit, so long-run selection frequency converges EXACTLY to the
 * weight ratio and the choice stays deterministic (no fragile float ties).
 */ function applyDrr(targets, comboName) {
    if (targets.length <= 1) return targets.slice();
    const deficits = getDrrDeficits(comboName);
    const totalWeight = targets.reduce((sum, t)=>sum + normalizeWeight(t.weight), 0);
    // Add each target's quantum (weight share) to its deficit.
    for (const target of targets){
        const quantum = normalizeWeight(target.weight) / totalWeight;
        deficits.set(target.executionKey, (deficits.get(target.executionKey) ?? 0) + quantum);
    }
    // Select the target with the largest deficit (ties keep input order).
    let winner = targets[0];
    let bestDeficit = deficits.get(winner.executionKey) ?? 0;
    for(let i = 1; i < targets.length; i++){
        const d = deficits.get(targets[i].executionKey) ?? 0;
        if (d > bestDeficit) {
            bestDeficit = d;
            winner = targets[i];
        }
    }
    // Winner pays a unit cost; the leftover credit carries into the next round.
    deficits.set(winner.executionKey, bestDeficit - 1);
    const rest = targets.filter((t)=>t.executionKey !== winner.executionKey);
    return [
        winner,
        ...rest
    ];
}
/** Weights default to 1 and are floored at 1 to keep quantum math well-defined. */ function normalizeWeight(weight) {
    return Number.isFinite(weight) && weight > 0 ? weight : 1;
}
// ---------------------------------------------------------------------------
// Mechanism 3 — P2C over in-flight load
// ---------------------------------------------------------------------------
/**
 * Pick the less-loaded of the first two candidates. Returns 0 to keep the DRR
 * winner, or 1 to prefer the runner-up. Ties favor the DRR winner (index 0).
 */ function pickByInflightP2C(first, second, nowMs) {
    const loadFirst = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaShareInflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInflight"])(first.connectionId ?? "", nowMs);
    const loadSecond = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaShareInflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInflight"])(second.connectionId ?? "", nowMs);
    return loadSecond < loadFirst ? 1 : 0;
}
function selectQuotaShareTarget(targets, comboName, modelStr, nowMs = Date.now(), options) {
    const noOp = ()=>{};
    if (targets.length === 0) {
        return {
            target: null,
            orderedTargets: [],
            decrementInflight: noOp
        };
    }
    // 1) Per-model bucket gating.
    const eligible = filterEligibleBySaturation(targets, modelStr, nowMs);
    const saturatedDeprioritized = targets.filter((t)=>!eligible.includes(t));
    // 1b) Per-connection concurrency gating: connections already at their
    // maxConcurrent are demoted behind those with headroom (fail-open).
    const { withRoom, atCap } = partitionByConcurrencyCap(eligible, options?.maxConcurrentByConnection, nowMs);
    // 2) DRR ordering over the set that still has concurrency headroom.
    const ordered = applyDrr(withRoom, comboName);
    // 3) P2C over in-flight between the top two.
    let winner;
    let rest;
    if (ordered.length >= 2 && pickByInflightP2C(ordered[0], ordered[1], nowMs) === 1) {
        winner = ordered[1];
        rest = [
            ordered[0],
            ...ordered.slice(2)
        ];
    } else {
        winner = ordered[0];
        rest = ordered.slice(1);
    }
    // Reserve the winner's in-flight slot immediately.
    const winnerConnectionId = winner.connectionId ?? "";
    if (winnerConnectionId) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaShareInflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["incrementInflight"])(winnerConnectionId, undefined, nowMs);
    // Fallback order: winner → remaining-with-room → at-cap → saturated. Both
    // deprioritized tiers stay dispatchable so the combo is never hard-blocked.
    const orderedTargets = [
        winner,
        ...rest,
        ...atCap,
        ...saturatedDeprioritized
    ];
    // Idempotent decrement callback for the caller's finally/abort path. Uses the
    // selection-time clock so the slot (stamped nowMs + lease) is never treated as
    // expired here — it decrements the live count deterministically.
    let released = false;
    const release = ()=>{
        if (released) return;
        released = true;
        if (winnerConnectionId) (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaShareInflight$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decrementInflight"])(winnerConnectionId, nowMs);
    };
    return {
        target: winner,
        orderedTargets,
        decrementInflight: release
    };
}
function _clearDrrStateForTest() {
    _drrState.clear();
}
function _getDrrDeficitForTest(comboName, executionKey) {
    return _drrState.get(comboName)?.get(executionKey) ?? 0;
}
}),
"[project]/open-sse/services/combo/applyStrategyOrdering.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "applyStrategyOrdering",
    ()=>applyStrategyOrdering
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/shuffleDeck.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$manifestAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/manifestAdapter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$concurrencyCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/concurrencyCaps.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaShareStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/quotaShareStrategy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/promptCacheAffinity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/quotaStrategies.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/targetSorters.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$manifestAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$concurrencyCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$manifestAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$concurrencyCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
async function applyStrategyOrdering(strategy, initialOrderedTargets, deps) {
    const { combo, config, body, log, apiKeyAllowedConnections } = deps;
    let orderedTargets = initialOrderedTargets;
    if (strategy === "lkgp") {
        try {
            const { getLKGP } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
            const lkgpProvider = await getLKGP(combo.name, combo.id || combo.name);
            if (lkgpProvider) {
                const lkgpRecord = lkgpProvider;
                const providerName = lkgpRecord.provider;
                const connId = lkgpRecord.connectionId;
                let lkgpIndex = -1;
                if (connId) {
                    lkgpIndex = orderedTargets.findIndex((target)=>target.provider === providerName && target.connectionId === connId);
                }
                if (lkgpIndex < 0) {
                    lkgpIndex = orderedTargets.findIndex((target)=>target.provider === providerName || typeof target.modelStr === "string" && target.modelStr.startsWith(`${providerName}/`));
                }
                if (lkgpIndex > 0) {
                    const [lkgpTarget] = orderedTargets.splice(lkgpIndex, 1);
                    orderedTargets.unshift(lkgpTarget);
                    log.info("COMBO", `[LKGP] Prioritizing last known good provider ${providerName}${connId ? ` (account ${connId})` : ""} for combo "${combo.name}"`);
                } else if (lkgpIndex === 0) {
                    log.debug?.("COMBO", `[LKGP] Last known good provider ${providerName}${connId ? ` (account ${connId})` : ""} already first for combo "${combo.name}"`);
                }
            }
        } catch (err) {
            log.warn("COMBO", "Failed to retrieve Last Known Good Provider. This is non-fatal.", {
                err
            });
        }
    } else if (strategy === "strict-random") {
        const selectedExecutionKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getNextFromDeck"])(`combo:${combo.name}`, orderedTargets.map((target)=>target.executionKey));
        const selectedTarget = orderedTargets.find((target)=>target.executionKey === selectedExecutionKey) || null;
        // #3959: shuffle the fallback remainder too. Previously `rest` kept fixed
        // priority order, so after a failing deck pick the chain always fell through
        // to the same top-priority model — a persistently-failing model was retried
        // on essentially every request and fallback load never spread across peers.
        const rest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fisherYatesShuffle"])(orderedTargets.filter((target)=>target.executionKey !== selectedExecutionKey));
        orderedTargets = [
            selectedTarget,
            ...rest
        ].filter((target)=>target !== null);
        log.info("COMBO", `Strict-random deck: ${selectedExecutionKey} selected (${orderedTargets.length} targets)`);
    } else if (strategy === "random") {
        orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$shuffleDeck$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fisherYatesShuffle"])([
            ...orderedTargets
        ]);
        log.info("COMBO", `Random shuffle: ${orderedTargets.length} targets`);
    } else if (strategy === "fill-first") {
        log.info("COMBO", `Fill-first ordering: preserving priority order (${orderedTargets.length} targets)`);
    } else if (strategy === "p2c") {
        orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orderTargetsByPowerOfTwoChoices"])(orderedTargets, combo.name);
        log.info("COMBO", `Power-of-two-choices ordering: selected ${orderedTargets[0]?.modelStr}`);
    } else if (strategy === "least-used") {
        orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sortTargetsByUsage"])(orderedTargets, combo.name);
        log.info("COMBO", `Least-used ordering: ${orderedTargets[0]?.modelStr} has fewest requests`);
    } else if (strategy === "cost-optimized") {
        orderedTargets = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$targetSorters$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sortTargetsByCost"])(orderedTargets);
        if (config.manifestRouting === true) {
            try {
                const manifestHint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$manifestAdapter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateRoutingHints"])(orderedTargets.filter((t)=>t.kind === "model"), {
                    messages: Array.isArray(body?.messages) ? body.messages : [],
                    tools: Array.isArray(body?.tools) ? body.tools : undefined,
                    model: typeof body?.model === "string" ? body.model : undefined
                });
                if (manifestHint.strategyModifier === "require-premium") {
                    const eligible = orderedTargets.filter((t)=>t.kind !== "model" || manifestHint.eligibleTargets.some((e)=>e.provider === t.provider && e.modelStr === t.modelStr));
                    if (eligible.length > 0) orderedTargets = eligible;
                }
                log.debug?.({
                    strategyModifier: manifestHint.strategyModifier,
                    specificityLevel: manifestHint.specificityLevel,
                    score: manifestHint.specificity.score
                }, "manifest routing applied");
            } catch (err) {
                log.warn({
                    err
                }, "manifest routing failed, falling back to standard strategy");
            }
        }
        log.info("COMBO", `Cost-optimized ordering: cheapest first (${orderedTargets[0]?.modelStr})`);
    } else if (strategy === "reset-aware") {
        orderedTargets = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orderTargetsByResetAwareQuota"])(orderedTargets, combo.name, config, log, apiKeyAllowedConnections);
        log.info("COMBO", `Reset-aware ordering: ${orderedTargets[0]?.modelStr}${orderedTargets[0]?.connectionId ? ` (${orderedTargets[0].connectionId})` : ""} first`);
    } else if (strategy === "reset-window") {
        orderedTargets = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orderTargetsByResetWindow"])(orderedTargets, combo.name, config, log, apiKeyAllowedConnections);
        log.info("COMBO", `Reset-window ordering: ${orderedTargets[0]?.modelStr}${orderedTargets[0]?.connectionId ? ` (${orderedTargets[0].connectionId})` : ""} first`);
    } else if (strategy === "context-optimized") {
        orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sortTargetsByContextSize"])(orderedTargets);
        log.info("COMBO", `Context-optimized ordering: largest first (${orderedTargets[0]?.modelStr})`);
    } else if (strategy === "cache-optimized") {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePromptCacheAffinityKey"])(body)) {
            orderedTargets = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expandPromptCacheAffinityTargets"])(orderedTargets);
        }
        const affinity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyPromptCacheAffinity"])(orderedTargets, body);
        orderedTargets = affinity.targets;
        log.info("COMBO", `Cache-optimized ordering: ${orderedTargets[0]?.modelStr}${orderedTargets[0]?.connectionId ? ` (${orderedTargets[0].connectionId})` : ""} first`);
    } else if (strategy === "headroom") {
        orderedTargets = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orderTargetsByHeadroom"])(orderedTargets, combo.name, log, apiKeyAllowedConnections);
        log.info("COMBO", `Headroom ordering: ${orderedTargets[0]?.modelStr}${orderedTargets[0]?.connectionId ? ` (${orderedTargets[0].connectionId})` : ""} has most free capacity`);
    } else if (strategy === "quota-share") {
        // Internal quota-share combos (qtSd/): delegate to the dedicated module (DRR +
        // P2C in-flight + per-model bucket gating + per-connection concurrency gating).
        const qsModel = typeof body?.model === "string" ? body.model : orderedTargets[0]?.modelStr ?? "";
        const qsMaxConcurrent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$concurrencyCaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMaxConcurrentByConnection"])(orderedTargets);
        orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaShareStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectQuotaShareTarget"])(orderedTargets, combo.name, qsModel, Date.now(), {
            maxConcurrentByConnection: qsMaxConcurrent
        }).orderedTargets;
        log.info("COMBO", `Quota-share ordering: ${orderedTargets[0]?.modelStr}${orderedTargets[0]?.connectionId ? ` (${orderedTargets[0].connectionId})` : ""} selected (DRR+P2C)`);
    }
    return orderedTargets;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/contextRequirements.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyContextRequirements",
    ()=>applyContextRequirements
]);
/**
 * Context requirements filtering for combo targets.
 * Applies minContextWindow, preferLargeContext, and contextFilterMode
 * from combo config to filter and sort targets by context window size.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)");
;
/**
 * Get context window size for a target model.
 * Returns null if unknown.
 */ function getTargetContextWindow(target) {
    const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextLimit"])(target.provider, target.modelStr);
    return typeof limit === "number" && limit > 0 ? limit : null;
}
function applyContextRequirements(targets, requirements, log) {
    if (!requirements || targets.length === 0) return targets;
    const { minContextWindow, maxContextWindow, preferLargeContext, contextFilterMode = "lenient" } = requirements;
    // No requirements specified
    if (!minContextWindow && !maxContextWindow && !preferLargeContext) return targets;
    let filtered = targets;
    // Apply minContextWindow filtering
    if (minContextWindow && minContextWindow > 0) {
        const beforeFilterCount = filtered.length;
        const classified = filtered.map((target)=>({
                target,
                contextWindow: getTargetContextWindow(target)
            }));
        filtered = classified.filter(({ contextWindow })=>{
            // Unknown context limit handling
            if (contextWindow === null) {
                return contextFilterMode === "lenient";
            }
            // Known context limit - check threshold
            return contextWindow >= minContextWindow;
        }).map(({ target })=>target);
        // #8786: strict must not turn an otherwise-executable combo into an empty
        // pool solely because the capability catalog lacks context metadata. When
        // no known-good target survives, fail open to the unknown-context set
        // (same spirit as the request-compat context fail-open path).
        if (filtered.length === 0 && beforeFilterCount > 0 && contextFilterMode === "strict") {
            const unknowns = classified.filter(({ contextWindow })=>contextWindow === null).map(({ target })=>target);
            if (unknowns.length > 0) {
                log.warn("COMBO", `Context requirements: strict mode would empty the pool (${beforeFilterCount} targets, none known >= ${minContextWindow}); failing open to ${unknowns.length} unknown-context target(s)`);
                filtered = unknowns;
            }
        }
        if (filtered.length < beforeFilterCount) {
            log.info("COMBO", `Context requirements: filtered ${beforeFilterCount} → ${filtered.length} targets (minContextWindow: ${minContextWindow}, mode: ${contextFilterMode})`);
            log.debug?.("COMBO", `Context requirements: kept models ${filtered.map((t)=>t.modelStr).join(", ")}`);
        }
    }
    // Apply maxContextWindow filtering
    if (maxContextWindow && maxContextWindow > 0) {
        const beforeFilterCount = filtered.length;
        filtered = filtered.filter((target)=>{
            const contextWindow = getTargetContextWindow(target);
            // Unknown context limit handling
            if (contextWindow === null) {
                return contextFilterMode === "lenient";
            }
            // Known context limit - check threshold
            return contextWindow <= maxContextWindow;
        });
        if (filtered.length < beforeFilterCount) {
            log.info("COMBO", `Context requirements: filtered ${beforeFilterCount} → ${filtered.length} targets (maxContextWindow: ${maxContextWindow}, mode: ${contextFilterMode})`);
            log.debug?.("COMBO", `Context requirements: kept models ${filtered.map((t)=>t.modelStr).join(", ")}`);
        }
    }
    // Apply preferLargeContext sorting
    if (preferLargeContext && filtered.length > 1) {
        filtered = [
            ...filtered
        ].sort((a, b)=>{
            const aContext = getTargetContextWindow(a) ?? 0;
            const bContext = getTargetContextWindow(b) ?? 0;
            return bContext - aContext; // Descending order
        });
        log.debug?.("COMBO", `Context requirements: sorted by context size (descending): ${filtered.map((t)=>{
            const ctx = getTargetContextWindow(t);
            return `${t.modelStr}(${ctx === null ? "unknown" : ctx})`;
        }).join(", ")}`);
    }
    return filtered;
}
}),
"[project]/open-sse/services/combo/autoConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "parseAutoConfig",
    ()=>parseAutoConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/scoring.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modePacks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboData.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/quotaScoring.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function parseAutoConfig(combo, eligibleTargets) {
    const rawAutoConfigSource = combo?.autoConfig || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(combo?.config?.auto) ? combo.config.auto : null) || combo?.config || {};
    const autoConfigSource = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRecord"])(rawAutoConfigSource) ? rawAutoConfigSource : {};
    const routingStrategy = typeof autoConfigSource.routerStrategy === "string" ? autoConfigSource.routerStrategy : typeof autoConfigSource.routingStrategy === "string" ? autoConfigSource.routingStrategy : typeof autoConfigSource.strategyName === "string" ? autoConfigSource.strategyName : "rules";
    const candidatePool = Array.isArray(autoConfigSource.candidatePool) ? autoConfigSource.candidatePool : [
        ...new Set(eligibleTargets.map((target)=>target.provider))
    ];
    const configuredWeights = autoConfigSource.weights && typeof autoConfigSource.weights === "object" ? autoConfigSource.weights : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_WEIGHTS"];
    const explorationRate = Number.isFinite(Number(autoConfigSource.explorationRate)) ? Number(autoConfigSource.explorationRate) : 0.05;
    const budgetCap = Number.isFinite(Number(autoConfigSource.budgetCap)) ? Number(autoConfigSource.budgetCap) : undefined;
    // #3470: persisted fallback policy for when EVERY candidate exceeds budgetCap.
    // Any other value (including absent) falls through to the engine's "cheapest" default.
    const budgetFallback = autoConfigSource.budgetFallback === "strict" || autoConfigSource.budgetFallback === "cheapest" ? autoConfigSource.budgetFallback : undefined;
    const modePack = typeof autoConfigSource.modePack === "string" ? autoConfigSource.modePack : undefined;
    const weights = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$scoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeScoringWeights"])(modePack ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModePack"])(modePack) || configuredWeights : configuredWeights);
    const resetWindowConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResetWindowConfig"])(autoConfigSource);
    const slaPolicy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaScoring$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveSlaRoutingPolicy"])(autoConfigSource);
    return {
        routingStrategy,
        candidatePool,
        weights,
        explorationRate,
        budgetCap,
        budgetFallback,
        modePack,
        resetWindowConfig,
        slaPolicy
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/resolveAutoStrategy.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "resolveAutoStrategyOrder",
    ()=>resolveAutoStrategyOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/engine.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$requestControls$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/requestControls.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$routerStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/routerStrategy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$complexityRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/complexityRouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/modePacks.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/comboMetrics.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/contextManager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$intentClassifier$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/intentClassifier.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/modelCapabilities.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/autoConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboData.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/promptCacheAffinity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/autoStrategy.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$routerStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$complexityRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$routerStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$complexityRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function resolveAutoStrategyOrder(deps) {
    const { body, combo, settings, config, relayOptions, resilienceSettings, log, buildAutoCandidates } = deps;
    let orderedTargets = deps.orderedTargets;
    let autoUsedExplicitRouter = false;
    const requestHasTools = Array.isArray(body?.tools) && body.tools.length > 0;
    let eligibleTargets = [
        ...orderedTargets
    ];
    const compatFilterFailOpen = config?.compatFilterFailOpen === true || settings?.compatFilterFailOpen === true;
    if (requestHasTools) {
        // Keep #5240 prompt-emulation providers (toolCalling:"emulated") even when
        // registry/capability rows honestly report toolCalling:false.
        const filtered = eligibleTargets.filter((target)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supportsToolCalling"])(target.modelStr) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["providerSupportsEmulatedToolCalling"])(target.provider));
        if (filtered.length > 0) {
            eligibleTargets = filtered;
        } else if (compatFilterFailOpen) {
            log.warn("COMBO", "Auto strategy: all candidates filtered by tool-calling policy, falling back to full pool (compatFilterFailOpen)");
        } else {
            // #8488: fail closed with an explicit compatibility error instead of
            // re-admitting tool-incapable targets.
            const toolCount = Array.isArray(body.tools) ? body.tools.length : 0;
            return {
                earlyResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponseWithComboDiagnostics"])(400, `No target in combo ${combo.name} supports tool calling; request carried ${toolCount} tools`, {
                    poolSize: eligibleTargets.length,
                    attempted: 0,
                    excluded: eligibleTargets.map((target)=>({
                            provider: target.provider,
                            model: target.modelStr,
                            reason: "tools"
                        })),
                    attemptOrder: [],
                    terminalReason: "capability_mismatch"
                }, {
                    code: "capability_mismatch",
                    type: "invalid_request_error"
                })
            };
        }
    }
    // Context-window pre-filter (#1808)
    // Estimate input tokens once; exclude candidates whose known context limit is too small.
    // Uses the same 4-chars-per-token heuristic as contextManager.ts::compressContext().
    // Null/unknown limits are treated as "include" to avoid incorrectly dropping valid targets.
    const requestMessages = body.messages;
    const estimatedInputTokens = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$contextManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateTokens"])(typeof requestMessages === "string" || requestMessages !== null && typeof requestMessages === "object" ? requestMessages : []);
    if (estimatedInputTokens > 0) {
        const filteredByContext = eligibleTargets.filter((target)=>{
            const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelContextLimitForModelString"])(target.modelStr);
            if (limit === null || limit === undefined) return true; // unknown — include to be safe
            return limit >= estimatedInputTokens;
        });
        if (filteredByContext.length > 0) {
            log.debug?.("COMBO", `Auto strategy: context-window filter kept ${filteredByContext.length}/${eligibleTargets.length} candidates (est. ${estimatedInputTokens} tokens)`);
            eligibleTargets = filteredByContext;
        } else if (compatFilterFailOpen) {
            log.warn("COMBO", `Auto strategy: all candidates filtered by context-window policy (est. ${estimatedInputTokens} tokens), falling back to full pool (compatFilterFailOpen)`);
        } else {
            // #8488: every candidate has a known limit below the estimate — surface
            // context_length_exceeded rather than dispatching oversized targets.
            return {
                earlyResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponseWithComboDiagnostics"])(400, `Request requires approximately ${estimatedInputTokens} tokens, but every auto-strategy candidate in combo ${combo.name} has a smaller known context limit`, {
                    poolSize: eligibleTargets.length,
                    attempted: 0,
                    excluded: eligibleTargets.map((target)=>({
                            provider: target.provider,
                            model: target.modelStr,
                            reason: "context_window"
                        })),
                    attemptOrder: [],
                    terminalReason: "context_length_exceeded"
                }, {
                    code: "context_length_exceeded",
                    type: "invalid_request_error"
                })
            };
        }
        eligibleTargets = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expandAutoComboCandidatePool"])(eligibleTargets, combo);
    }
    const prompt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extractPromptForIntent"])(body);
    const systemPrompt = typeof combo?.system_message === "string" ? combo.system_message : undefined;
    const intentConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getIntentConfig"])(settings, combo);
    const intent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$intentClassifier$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["classifyWithConfig"])(prompt, intentConfig, systemPrompt);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$comboMetrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboIntent"])(combo.name, intent);
    const taskType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapIntentToTaskType"])(intent);
    const { routingStrategy, candidatePool, weights: configWeights, explorationRate, budgetCap: configBudgetCap, budgetFallback: configBudgetFallback, modePack: configModePack, resetWindowConfig, slaPolicy } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAutoConfig"])(combo, eligibleTargets);
    // Per-request overrides (#6023 / #6024 / #6025 / #3470): X-OmniRoute-Budget,
    // X-OmniRoute-Budget-Fallback and X-OmniRoute-Mode headers (threaded via
    // relayOptions) take precedence over the combo's stored config for this single
    // request. Unknown/garbage header values are ignored so the saved config is
    // preserved.
    const requestBudgetCap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$requestControls$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseRequestBudgetCap"])(relayOptions?.budgetCap);
    const budgetCap = requestBudgetCap ?? configBudgetCap;
    const requestBudgetFallback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$requestControls$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseRequestBudgetFallback"])(relayOptions?.budgetFallback);
    const budgetFallback = requestBudgetFallback ?? configBudgetFallback;
    const requestModePack = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$requestControls$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRequestModePack"])(relayOptions?.mode);
    const modePack = requestModePack.override ? requestModePack.modePack : configModePack;
    // #7008: `weights` must track the *effective* (post-override) modePack, not just
    // the combo's stored one. `selectAutoProvider()` (engine.ts) already re-derives
    // weights internally from the `modePack` it's given, so it correctly reacts to a
    // per-request X-OmniRoute-Mode override — but `scoreAutoTargets()` (the fallback
    // ranking below) has no such re-derivation and only ever sees whatever `weights`
    // it's handed. Without this recompute, a request overriding e.g. `quality-first`
    // to `ship-fast` would select its primary target under ship-fast weights but rank
    // every fallback under the stale quality-first weights — the same
    // select-under-one-policy/rank-under-another bug this module's original fix
    // (parseAutoConfig honoring the combo's own stored modePack) set out to close.
    const weights = modePack ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$modePacks$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModePack"])(modePack) || configWeights : configWeights;
    if (requestModePack.override || requestBudgetCap !== undefined || requestBudgetFallback !== undefined) {
        log.debug?.("COMBO", `Auto strategy: per-request controls applied (mode=${requestModePack.override ? requestModePack.modePack ?? "balanced" : "—"}, budgetCap=${requestBudgetCap ?? "—"}, budgetFallback=${requestBudgetFallback ?? "—"})`);
    }
    let lastKnownGoodProvider;
    try {
        const { getLKGP } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const lkgp = await getLKGP(combo.name, combo.id || combo.name);
        if (lkgp) lastKnownGoodProvider = lkgp.provider;
    } catch (err) {
        log.warn("COMBO", "Failed to retrieve Last Known Good Provider. This is non-fatal.", {
            err
        });
    }
    const autoCandidateResilienceSettings = relayOptions?.bypassProviderQuotaPolicy === true ? {
        ...resilienceSettings,
        quotaPreflight: {
            ...resilienceSettings.quotaPreflight,
            enabled: false
        }
    } : resilienceSettings;
    const candidates = await buildAutoCandidates(eligibleTargets, combo.name, relayOptions?.sessionId, resetWindowConfig, autoCandidateResilienceSettings);
    const cacheAffinityScores = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculatePromptCacheAffinityScores"])(candidates, body);
    for (const candidate of candidates){
        candidate.cacheAffinity = cacheAffinityScores.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["promptCacheTargetIdentity"])(candidate)) ?? 0;
    }
    const routableCandidates = candidates.filter((candidate)=>candidate.quotaCutoffBlocked !== true);
    const quotaBlockedCount = candidates.length - routableCandidates.length;
    if (quotaBlockedCount > 0) {
        log.info("COMBO", `Auto strategy: quota cutoff skipped ${quotaBlockedCount}/${candidates.length} account candidates`);
    }
    // G2: Register candidates so chatCore can mark quotaSoftPenalty via setCandidateQuotaSoftPenalty.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_registerExecutionCandidates"])(routableCandidates);
    if (candidates.length > 0 && routableCandidates.length === 0) {
        return {
            earlyResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableResponse"])(429, "All auto strategy candidates are below configured quota cutoffs")
        };
    }
    if (routableCandidates.length > 0) {
        let selectedProvider = null;
        let selectedModel = null;
        let selectedConnectionId = null;
        let selectionReason = "";
        if (routingStrategy !== "rules") {
            try {
                const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$routerStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectWithStrategy"])(routableCandidates, {
                    taskType,
                    requestHasTools,
                    lastKnownGoodProvider,
                    estimatedInputTokens,
                    sla: slaPolicy
                }, routingStrategy);
                selectedProvider = decision.provider;
                selectedModel = decision.model;
                selectedConnectionId = decision.connectionId ?? null;
                selectionReason = decision.reason;
                autoUsedExplicitRouter = true;
            } catch (err) {
                log.warn("COMBO", `Auto strategy '${routingStrategy}' failed (${err?.message || "unknown"}), falling back to rules`);
            }
        }
        if (!selectedProvider || !selectedModel) {
            let selection;
            try {
                selection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectProvider"])({
                    id: combo.id || combo.name,
                    name: combo.name,
                    type: "auto",
                    candidatePool,
                    weights,
                    modePack,
                    budgetCap,
                    budgetFallback,
                    explorationRate
                }, routableCandidates, taskType);
            } catch (err) {
                // #3470: `budgetFallback: "strict"` refuses to select when every candidate
                // exceeds `budgetCap` — surface a clear cost-exceeds-budget response
                // instead of letting it propagate as an unhandled 500.
                if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$engine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BudgetExceededError"]) {
                    return {
                        earlyResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(402, err.message)
                    };
                }
                throw err;
            }
            selectedProvider = selection.provider;
            selectedModel = selection.model;
            selectedConnectionId = selection.connectionId ?? null;
            selectionReason = `score=${selection.score.toFixed(3)}${selection.isExploration ? " (exploration)" : ""}`;
        }
        // Complexity-aware routing (2026, opt-in): classify the request's
        // difficulty and feed a tier hint into scoring so tierAffinity /
        // specificityMatch favor candidates whose tier matches the request.
        const autoManifestHint = config.complexityAwareRouting === true ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$complexityRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildComplexityRoutingHint"])(eligibleTargets.filter((t)=>t.kind === "model"), body, log) : null;
        const scoredTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreAutoTargets"])(eligibleTargets, routableCandidates, taskType, weights, autoManifestHint);
        const rankedTargets = scoredTargets.map((entry)=>entry.target);
        const selectedTarget = scoredTargets.find((entry)=>{
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(entry.target.modelStr);
            const modelId = parsed.model || entry.target.modelStr;
            return entry.target.provider === selectedProvider && modelId === selectedModel && (!selectedConnectionId || entry.target.connectionId === selectedConnectionId);
        })?.target || rankedTargets[0] || eligibleTargets[0];
        if (!selectedTarget) {
            return {
                earlyResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unavailableResponse"])(429, "No auto strategy targets remained after quota cutoff filtering")
            };
        }
        // Keep eligibleTargets as the last-resort fallback tail: dedupe drops the
        // routable ranked ones (and, when the cutoff is OFF, makes this identical to
        // the pre-cutoff behavior), but a quota-blocked target still survives as a
        // final fallback instead of vanishing — the hard cutoff only de-prioritizes.
        orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboData$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["dedupeTargetsByExecutionKey"])([
            selectedTarget,
            ...rankedTargets,
            ...eligibleTargets
        ].filter((entry)=>entry !== undefined && entry !== null));
        log.info("COMBO", `Auto selection: ${selectedTarget?.modelStr || `${selectedProvider}/${selectedModel}`} | intent=${intent} task=${taskType} | strategy=${routingStrategy} | ${selectionReason}`);
    } else {
        log.warn("COMBO", "Auto strategy has no candidates, keeping default ordering");
    }
    return {
        orderedTargets,
        autoUsedExplicitRouter
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/combo/targetResolution.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "resolveComboTargetPipeline",
    ()=>resolveComboTargetPipeline
]);
/**
 * resolveComboTargetPipeline — the target-resolution phase of handleComboChat (combo.ts).
 *
 * Sits between the dispatch prelude (pinned model / fusion / chaos / pipeline / nested
 * execute-mode / round-robin) and the attempt loop. It turns the raw combo definition
 * into the final `orderedTargets` array the attempt loop iterates, in this order:
 *
 *   1. provider-wildcard expansion of the combo + the combos collection (#2562)
 *   2. weighted step-group resolution + sticky-weighted eligibility
 *   3. request-tag routing
 *   4. known-context-overflow early return
 *   5. smart/pipeline-enabled dispatch (auto strategy)
 *   6. auto-strategy candidate build / scoring / ordering, or per-strategy ordering
 *   7. prompt-cache strategy affinity, session stickiness, eval scores,
 *      request compatibility, context requirements
 *   8. task-aware reordering
 *   9. prompt-cache affinity application
 *  10. the parallel pre-screen (priority strategy only)
 *
 * Behaviour is byte-identical to the inline block it replaces — the two early exits
 * (context overflow, pipeline dispatch, auto-strategy `earlyResponse`) become an
 * `{ earlyResponse }` result so the host decides to return them, and the values the
 * attempt loop still consumes (`orderedTargets`, `stickyWeightedLimit`,
 * `getWeightedStepKeyForTarget`, `sticky`, `preScreenMap`) are returned instead of
 * closed over.
 *
 * See _tasks/quality/2026-06-19-DESIGN-godfiles-decomposition.md §4.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$autoPrefix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/autoPrefix.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$pipelineRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/autoCombo/pipelineRouter.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$evalRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/evalRouting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/model.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerCooldownTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/providerCooldownTracker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$taskAwareRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/taskAwareRouting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/circuitBreaker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$applyStrategyOrdering$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/applyStrategyOrdering.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboPredicates.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/comboStructure.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$contextRequirements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/contextRequirements.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$failureTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/failureTracker.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$knownContextOverflow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/knownContextOverflow.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$pinRecovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/pinRecovery.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/promptCacheAffinity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$providerWildcard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/providerWildcard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/quotaStrategies.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$resolveAutoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/resolveAutoStrategy.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/rrState.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$sessionStickiness$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/sessionStickiness.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/combo/autoStrategy.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$applyStrategyOrdering$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$knownContextOverflow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$providerWildcard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$resolveAutoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$applyStrategyOrdering$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$knownContextOverflow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$providerWildcard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$resolveAutoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
;
;
;
;
;
/**
 * Weighted-strategy eligibility predicate: a step counts as selectable only when at
 * least one of its targets clears the provider breaker, the connection cooldown, the
 * per-model lockout and the caller's availability probe.
 */ async function isTargetSelectableForWeighted(target, resilienceSettings, isModelAvailable) {
    const rawModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$model$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseModel"])(target.modelStr).model || target.modelStr;
    if (target.provider && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$circuitBreaker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCircuitBreaker"])(target.provider).getStatus().state === "OPEN") return false;
    if (resilienceSettings.providerCooldown.enabled && Boolean(target.provider && target.provider !== "unknown") && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerCooldownTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isProviderInCooldown"])(target.provider, target.connectionId ?? undefined, resilienceSettings)) {
        return false;
    }
    if (target.provider && rawModel && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isModelLocked"])(target.provider, target.connectionId || "", rawModel)) {
        return false;
    }
    return isModelAvailable ? await isModelAvailable(target.modelStr, target) : true;
}
/**
 * #2562: Expand provider-wildcard steps (e.g. `fta/*`, `openai/gpt-4*`) into
 * concrete model entries sourced from the live synced-models catalog + registry.
 * Must run before any step-group / target resolution so that wildcard-originated
 * steps are treated identically to hand-authored entries by all downstream logic
 * (including the sticky-weighted eligibility pass below).
 */ async function expandComboWildcards(combo, allCombos) {
    const expandedCombo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$providerWildcard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expandProviderWildcardsInCombo"])(combo);
    const expandedAllCombos = allCombos ? Array.isArray(allCombos) ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$providerWildcard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expandProviderWildcardsInCollection"])(allCombos) : {
        ...allCombos,
        combos: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$providerWildcard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expandProviderWildcardsInCollection"])(allCombos.combos || [])
    } : allCombos;
    return {
        expandedCombo,
        expandedAllCombos
    };
}
/** LRU-evict the oldest sticky-weighted entry once the counter map is at capacity. */ function evictOldestWeightedSticky(strategy, comboName) {
    if (strategy === "weighted" && !__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["weightedStickyTargets"].has(comboName) && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["weightedStickyTargets"].size >= __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["MAX_RR_COUNTERS"]) {
        const oldest = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["weightedStickyTargets"].keys().next().value;
        if (oldest !== undefined) __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["weightedStickyTargets"].delete(oldest);
    }
}
/** Resolve the weighted step groups and the subset whose targets are still selectable. */ async function collectWeightedEligibility(expandedCombo, expandedAllCombos, resilienceSettings, isModelAvailable, hiddenModelsByProvider) {
    const weightedEligibleKeys = new Set();
    const stepGroups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveWeightedStepGroups"])(expandedCombo, expandedAllCombos, hiddenModelsByProvider);
    for (const group of stepGroups){
        const availability = await Promise.all(group.targets.map((target)=>isTargetSelectableForWeighted(target, resilienceSettings, isModelAvailable)));
        if (availability.some(Boolean)) weightedEligibleKeys.add(group.step.executionKey);
    }
    return {
        stepGroups,
        weightedEligibleKeys
    };
}
/**
 * Honor the persisted sticky-weighted pin only while its step is still eligible;
 * drop the stored pin otherwise (and whenever stickiness is off for this combo).
 */ function resolveStickyWeightedKey(strategy, comboName, stickyWeightedLimit, weightedEligibleKeys) {
    const rawStickyWeightedKey = strategy === "weighted" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStickyWeightedExecutionKey"])(comboName, stickyWeightedLimit) : null;
    const stickyWeightedKey = rawStickyWeightedKey && weightedEligibleKeys.has(rawStickyWeightedKey) ? rawStickyWeightedKey : null;
    if (strategy !== "weighted" || stickyWeightedLimit <= 1) {
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["weightedStickyTargets"].delete(comboName);
    } else if (rawStickyWeightedKey && !stickyWeightedKey) {
        __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["weightedStickyTargets"].delete(comboName);
    }
    return stickyWeightedKey;
}
/** Full weighted-strategy resolution: eviction → eligibility → sticky pin → ordering. */ async function resolveWeightedSelection(deps, expandedCombo, expandedAllCombos, stickyWeightedLimit) {
    const { strategy } = deps;
    const comboName = deps.combo.name;
    evictOldestWeightedSticky(strategy, comboName);
    let stepGroups;
    let weightedEligibleKeys = new Set();
    if (strategy === "weighted") {
        const eligibility = await collectWeightedEligibility(expandedCombo, expandedAllCombos, deps.resilienceSettings, deps.isModelAvailable, deps.hiddenModelsByProvider);
        stepGroups = eligibility.stepGroups;
        weightedEligibleKeys = eligibility.weightedEligibleKeys;
    }
    const stickyWeightedKey = resolveStickyWeightedKey(strategy, comboName, stickyWeightedLimit, weightedEligibleKeys);
    const weightedResolution = strategy === "weighted" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveWeightedTargets"])(expandedCombo, expandedAllCombos, stickyWeightedKey, weightedEligibleKeys, stepGroups) : null;
    return {
        weightedResolution,
        stickyWeightedKey
    };
}
/** Maps an attempted target back to the weighted step it came from (sticky write-back). */ function buildWeightedStepKeyMapper(weightedResolution) {
    return (target)=>{
        if (!weightedResolution?.orderedSteps) return null;
        const step = weightedResolution.orderedSteps.find((entry)=>target.executionKey === entry.executionKey || target.executionKey.startsWith(entry.executionKey + ">"));
        return step?.executionKey || null;
    };
}
/** 400 rejection for a request no target in the pool can physically accept. */ function buildContextOverflowResponse(overflow, orderedTargets, log) {
    const { requiredContextTokens, maxKnownContextTokens } = overflow;
    log.warn("COMBO", `Request context exceeds every known target limit (${requiredContextTokens} > ${maxKnownContextTokens} tokens)`);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponseWithComboDiagnostics"])(400, `Request requires approximately ${requiredContextTokens} tokens, but the largest known context limit in this combo is ${maxKnownContextTokens} tokens. Reduce or compact the request context.`, {
        poolSize: orderedTargets.length,
        attempted: 0,
        excluded: orderedTargets.map((target)=>({
                provider: target.provider,
                model: target.modelStr,
                reason: "context_window"
            })),
        attemptOrder: [],
        terminalReason: "context_length_exceeded"
    }, {
        code: "context_length_exceeded",
        type: "invalid_request_error"
    });
}
function logTargetPoolSize(strategy, allCombos, orderedTargets, stickyWeightedKey, log) {
    if (strategy === "weighted") {
        log.info("COMBO", `Weighted selection${stickyWeightedKey ? " (sticky)" : ""}${allCombos ? " with nested resolution" : ""}: ${orderedTargets.length} total targets`);
    } else if (allCombos) {
        log.info("COMBO", `${strategy} with nested resolution: ${orderedTargets.length} total targets`);
    }
}
/**
 * Pipeline dispatch: route smart/pipeline-enabled combos through the multi-stage
 * pipeline. Returns the finished Response, or null to fall through to standard
 * auto routing (pipeline disabled, below token threshold, or dispatch failure).
 */ async function dispatchSmartPipeline(deps, availableModels) {
    const { body, combo, strategy, config, settings, signal, log } = deps;
    if (strategy !== "auto") return null;
    const autoParsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$autoPrefix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseAutoPrefix"])(combo.name);
    const autoVariant = autoParsed.valid ? autoParsed.variant : undefined;
    if (autoVariant !== "smart" && !config.pipeline_enabled) return null;
    try {
        const pipelineRaw = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$pipelineRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handlePipelineCombo"])({
            body,
            combo,
            availableModels,
            handleChatCore: deps.handleSingleModelWithTimeout,
            log: {
                info: log.info,
                warn: log.warn,
                error: log.error ?? log.warn
            },
            settings: settings ?? {},
            signal: signal ?? undefined
        });
        // handlePipelineCombo resolves to a PipelineResult (buffered text) or,
        // in the streaming-final-stage case, a Response. Callers downstream
        // (chat.ts → withSessionHeader) require a Response, so adapt the
        // PipelineResult here instead of leaking the raw object.
        return pipelineRaw instanceof Response ? pipelineRaw : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$autoCombo$2f$pipelineRouter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildPipelineResponse"])(pipelineRaw, body);
    } catch (pipelineErr) {
        logPipelineFallthrough(pipelineErr, log);
        return null;
    }
}
function logPipelineFallthrough(pipelineErr, log) {
    const pipelineMsg = pipelineErr instanceof Error ? pipelineErr.message : "";
    if (pipelineMsg === "PIPELINE_DISABLED") {
        log.info("COMBO", "Pipeline disabled, falling through to standard auto routing");
    } else if (pipelineMsg === "PIPELINE_TOKEN_THRESHOLD") {
        log.info("COMBO", "Pipeline skipped (prompt below token threshold), falling through to standard auto routing");
    } else {
        log.warn("COMBO", "Pipeline dispatch failed, falling through to standard auto routing", {
            err: pipelineErr
        });
    }
}
/**
 * Strategy ordering: the `auto` router for auto combos, the per-strategy chain for
 * everything else. `autoUsedExplicitRouter` is the #4945 guard — when an explicit
 * router (lkgp/cost/…) pinned orderedTargets[0], task-aware reordering below must
 * refine only the fallback order, never override the router's primary choice.
 */ async function orderByStrategy(deps, initialOrderedTargets) {
    const { strategy, body, combo, settings, config, log } = deps;
    if (strategy === "auto") {
        const autoResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$resolveAutoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAutoStrategyOrder"])({
            orderedTargets: initialOrderedTargets,
            body,
            combo,
            settings,
            config,
            relayOptions: deps.relayOptions,
            resilienceSettings: deps.resilienceSettings,
            log,
            buildAutoCandidates: deps.buildAutoCandidates
        });
        if ("earlyResponse" in autoResult) return {
            earlyResponse: autoResult.earlyResponse
        };
        return {
            orderedTargets: autoResult.orderedTargets,
            autoUsedExplicitRouter: autoResult.autoUsedExplicitRouter
        };
    }
    const orderedTargets = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$applyStrategyOrdering$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyStrategyOrdering"])(strategy, initialOrderedTargets, {
        combo,
        config,
        body,
        log,
        apiKeyAllowedConnections: deps.apiKeyAllowedConnections
    });
    return {
        orderedTargets,
        autoUsedExplicitRouter: false
    };
}
/**
 * Continuity + eligibility filters: cache-strategy affinity, session stickiness,
 * eval-score ordering, request compatibility and per-combo context requirements.
 *
 * May return `{ earlyResponse }` when hard capability filters (#8488 / #8494) empty
 * the pool — tools / vision / structured_output fail closed as 400 capability_mismatch
 * unless `compatFilterFailOpen` is set on the combo config or settings.
 * Also returns `{ earlyResponse }` for #8786 when context requirements leave no
 * survivors (`context_requirements_exhausted`).
 */ async function applyContinuityFilters(deps, initialOrderedTargets) {
    const { strategy, body, combo, config, settings, log, relayOptions } = deps;
    // An explicit cache-optimized combo outranks the global cache-affinity default,
    // but only protects its ordering when this request actually produced a reusable
    // cache key. Cache misses retain the normal session/eval routing behavior.
    const cacheStrategyAffinityApplied = strategy === "cache-optimized" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyPromptCacheAffinity"])(initialOrderedTargets, body).applied;
    // #6168: session stickiness opt-out. Per-combo `config.disableSessionStickiness`
    // overrides the global `settings.disableSessionStickiness` fallback (default false,
    // preserving the #3825 prompt-cache/504 fix). When disabled, skip the reorder and
    // treat the result as a no-op so the recordStickyBinding write-back below is skipped.
    const disableSessionStickiness = cacheStrategyAffinityApplied || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$sessionStickiness$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveDisableSessionStickiness"])(config, settings);
    const sticky = disableSessionStickiness ? {
        targets: initialOrderedTargets,
        messageHash: null,
        stuck: false
    } : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$sessionStickiness$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applySessionStickiness"])(initialOrderedTargets, // #7270: normalize both wire shapes (.messages / Responses-API .input) so the
    // stickiness key is derivable on the /v1/responses surface, not just Chat Completions.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$sessionStickiness$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeStickinessMessages"])(body));
    let orderedTargets = sticky.targets;
    if (!cacheStrategyAffinityApplied) {
        orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$evalRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["orderTargetsByEvalScores"])(orderedTargets, config.evalRouting, log);
    }
    // #8488 / #8494: fail closed when hard capability filters empty the pool.
    // Opt-in escape hatch: combo.config.compatFilterFailOpen OR settings.compatFilterFailOpen.
    const compatFilterFailOpen = config.compatFilterFailOpen === true || settings?.compatFilterFailOpen === true;
    const preCompatTargets = orderedTargets;
    orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["filterTargetsByRequestCompatibility"])(orderedTargets, body, log, undefined, {
        failOpen: compatFilterFailOpen
    });
    if (orderedTargets.length === 0 && preCompatTargets.length > 0) {
        const exhaustion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["describeCapabilityFilterExhaustion"])(preCompatTargets, body, combo.name);
        if (exhaustion) {
            // Match handleComboChat: only track failures under context-cache protection pins.
            const effectiveSessionId = combo.context_cache_protection ? relayOptions?.sessionId ?? null : null;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$failureTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboFailure"])(effectiveSessionId, combo.name);
            return {
                earlyResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponseWithComboDiagnostics"])(400, exhaustion.message, {
                    poolSize: preCompatTargets.length,
                    attempted: 0,
                    excluded: exhaustion.excluded,
                    attemptOrder: [],
                    terminalReason: exhaustion.terminalReason,
                    recovery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$pinRecovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildRecoveryHint"])("no_executable_targets")
                }, {
                    code: "capability_mismatch",
                    type: "invalid_request_error"
                })
            };
        }
    }
    // #8786: capture pre-filter pool so a strict/minContextWindow wipe can
    // surface context_requirements_exhausted instead of a generic 404.
    const preContextTargets = orderedTargets;
    orderedTargets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$contextRequirements$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyContextRequirements"])(orderedTargets, config.contextRequirements, log);
    if (orderedTargets.length === 0 && preContextTargets.length > 0) {
        const effectiveSessionId = combo.context_cache_protection ? relayOptions?.sessionId ?? null : null;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$failureTracker$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordComboFailure"])(effectiveSessionId, combo.name);
        const { message, diagnostics } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$pinRecovery$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildEmptyComboTargetsPayload"])(preContextTargets, config.contextRequirements?.minContextWindow);
        return {
            earlyResponse: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponseWithComboDiagnostics"])(404, message, diagnostics, {
                code: "model_not_found",
                type: "invalid_request_error"
            })
        };
    }
    return {
        orderedTargets,
        sticky
    };
}
/**
 * Task-aware reordering: only active for strategies
 * ["smart","task","task-aware","task_aware","auto"]. Additive — does not affect any
 * of the other 15 strategies.
 */ function applyTaskAwareOrdering(deps, orderedTargets, autoUsedExplicitRouter) {
    const { strategy, body, log } = deps;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$taskAwareRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTaskRoutingStrategy"])(strategy)) return orderedTargets;
    const task = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$taskAwareRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["classifyTask"])(body);
    const conversationCacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$taskAwareRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getConversationCacheKey"])(body);
    const taskReordered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$taskAwareRouting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["reorderByTaskWeight"])(orderedTargets, task);
    // #4945 regression guard: when an explicit auto router (lkgp/cost/…) pinned
    // orderedTargets[0], keep that primary choice and let task-aware refine only
    // the fallback tail — otherwise task weighting silently defeats the operator's
    // chosen LKGP/cost selection. reorderByTaskWeight returns the same target
    // objects (no clone), so identity filtering is safe.
    const pinnedFirst = autoUsedExplicitRouter ? orderedTargets[0] : undefined;
    const nextOrder = pinnedFirst ? [
        pinnedFirst,
        ...taskReordered.filter((t)=>t !== pinnedFirst)
    ] : taskReordered;
    if (nextOrder[0]?.modelStr !== orderedTargets[0]?.modelStr) {
        const reasons = Array.isArray(task.reasons) && task.reasons.length > 0 ? ` (${task.reasons.join(",")})` : "";
        log.info("COMBO", `task-route task=${task.level}${reasons} cacheKey=${conversationCacheKey ?? "none"} → ${nextOrder[0]?.modelStr}`);
    }
    return nextOrder;
}
/**
 * Prompt-cache affinity is skipped when the auto scorer already weights cacheAffinity
 * itself — otherwise the same signal would be applied twice.
 */ function isPromptCacheAffinityEnabled(strategy, combo, config, settings) {
    const autoConfigForCacheWeight = strategy === "auto" ? combo.autoConfig || (config.auto && typeof config.auto === "object" ? config.auto : null) || config : null;
    const autoWeightsForCache = autoConfigForCacheWeight?.weights && typeof autoConfigForCacheWeight.weights === "object" ? autoConfigForCacheWeight.weights : null;
    const autoUsesCacheScore = Number(autoWeightsForCache?.cacheAffinity) > 0;
    return settings?.promptCacheAffinityEnabled !== false && !autoUsesCacheScore;
}
/**
 * Keep the stronger continuity decision (session pin / explicit auto-router pin) at
 * the head of the cache-affinity ordering rather than letting affinity override it.
 */ function protectFirstTarget(affinityTargets, protectedOriginal) {
    const protectedFirst = protectedOriginal ? affinityTargets.find((target)=>target === protectedOriginal || target.executionKey === protectedOriginal.executionKey || target.executionKey.startsWith(`${protectedOriginal.executionKey}@`)) ?? protectedOriginal : null;
    return protectedFirst ? [
        protectedFirst,
        ...affinityTargets.filter((target)=>target !== protectedFirst)
    ] : affinityTargets;
}
/**
 * Prompt-cache locality is applied after request eligibility and task routing.
 * Session stickiness and explicit auto-router pins remain stronger continuity
 * decisions; quota, health, and circuit-breaker gates still run per attempt.
 */ async function applyPromptCacheStage(deps, orderedTargets, stickyStuck, autoUsedExplicitRouter) {
    const { strategy, body, combo, config, settings, log } = deps;
    const promptCacheAffinityEnabled = isPromptCacheAffinityEnabled(strategy, combo, config, settings);
    const promptCacheAffinityTargets = promptCacheAffinityEnabled && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolvePromptCacheAffinityKey"])(body) ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["expandPromptCacheAffinityTargets"])(orderedTargets) : orderedTargets;
    const promptCacheAffinity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyPromptCacheAffinity"])(promptCacheAffinityTargets, body, promptCacheAffinityEnabled);
    if (!promptCacheAffinity.applied) return orderedTargets;
    const protectedOriginal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$promptCacheAffinity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldProtectOriginalFirst"])(stickyStuck, autoUsedExplicitRouter, strategy) && orderedTargets[0];
    const nextTargets = protectFirstTarget(promptCacheAffinity.targets, protectedOriginal);
    log.debug?.("COMBO", "Prompt-cache affinity applied", {
        source: promptCacheAffinity.source,
        fingerprint: promptCacheAffinity.fingerprint,
        targetCount: nextTargets.length
    });
    return nextTargets;
}
async function resolveComboTargetPipeline(deps) {
    const { body, combo, strategy, config, allCombos, log, isModelAvailable } = deps;
    const { expandedCombo, expandedAllCombos } = await expandComboWildcards(combo, allCombos);
    const stickyWeightedLimit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$rrState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampStickyWeightedTargetLimit"])(config.stickyWeightedLimit);
    const { weightedResolution, stickyWeightedKey } = await resolveWeightedSelection(deps, expandedCombo, expandedAllCombos, stickyWeightedLimit);
    const getWeightedStepKeyForTarget = buildWeightedStepKeyMapper(weightedResolution);
    let orderedTargets = strategy === "weighted" ? weightedResolution?.orderedTargets || [] : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboStructure$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveComboTargets"])(expandedCombo, expandedAllCombos, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$comboPredicates$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["clampComboDepth"])(config.maxComboDepth), deps.hiddenModelsByProvider);
    orderedTargets = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$autoStrategy$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyRequestTagRouting"])(orderedTargets, body, log);
    const overflow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$knownContextOverflow$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getKnownContextOverflow"])(orderedTargets, body);
    if (overflow) {
        return {
            earlyResponse: buildContextOverflowResponse(overflow, orderedTargets, log)
        };
    }
    logTargetPoolSize(strategy, allCombos, orderedTargets, stickyWeightedKey, log);
    const pipelineResponse = await dispatchSmartPipeline(deps, orderedTargets.map((target)=>target.modelStr));
    if (pipelineResponse) return {
        earlyResponse: pipelineResponse
    };
    const ordering = await orderByStrategy(deps, orderedTargets);
    if ("earlyResponse" in ordering) return ordering;
    const { autoUsedExplicitRouter } = ordering;
    const continuity = await applyContinuityFilters(deps, ordering.orderedTargets);
    if ("earlyResponse" in continuity) return continuity;
    orderedTargets = applyTaskAwareOrdering(deps, continuity.orderedTargets, autoUsedExplicitRouter);
    orderedTargets = await applyPromptCacheStage(deps, orderedTargets, continuity.sticky.stuck, autoUsedExplicitRouter);
    // Parallel pre-screen: check provider profiles and model availability for all targets
    // Only runs for priority strategy where sequential checking causes latency
    const preScreenMap = strategy === "priority" ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$combo$2f$quotaStrategies$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["preScreenTargets"])(orderedTargets, isModelAvailable).catch(()=>new Map()) : new Map();
    return {
        orderedTargets,
        stickyWeightedLimit,
        getWeightedStepKeyForTarget,
        sticky: continuity.sticky,
        preScreenMap
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_combo_01d6aem._.js.map
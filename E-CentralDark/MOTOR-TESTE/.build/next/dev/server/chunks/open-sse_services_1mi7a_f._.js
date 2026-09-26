module.exports = [
"[project]/open-sse/services/qwenThinking.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isQwenThinkingActive",
    ()=>isQwenThinkingActive,
    "isQwenThinkingToolChoiceIncompatible",
    ()=>isQwenThinkingToolChoiceIncompatible,
    "sanitizeQwenThinkingToolChoice",
    ()=>sanitizeQwenThinkingToolChoice
]);
function isQwenThinkingActive(body) {
    const thinking = body.thinking;
    if (thinking === true || body.enable_thinking === true) {
        return true;
    }
    return typeof thinking === "object" && thinking !== null && !Array.isArray(thinking) && thinking.type === "enabled";
}
function isQwenThinkingToolChoiceIncompatible(toolChoice) {
    return toolChoice === "required" || typeof toolChoice === "object" && toolChoice !== null;
}
function sanitizeQwenThinkingToolChoice(body, providerLabel = "Qwen") {
    if (!isQwenThinkingActive(body)) {
        return body;
    }
    const toolChoice = body.tool_choice;
    if (!isQwenThinkingToolChoiceIncompatible(toolChoice)) {
        return body;
    }
    const toolChoiceLabel = typeof toolChoice === "string" ? toolChoice : "object";
    console.warn(`[${providerLabel}] Neutralizing incompatible tool_choice ${toolChoiceLabel} to "auto" (thinking mode active)`);
    return {
        ...body,
        tool_choice: "auto"
    };
}
}),
"[project]/open-sse/services/codexVerbosity.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Codex (OpenAI Responses) verbosity normalization.
 *
 * The GPT-5 series added an output-verbosity control: Chat Completions exposes it
 * as a top-level `verbosity` field, while the Responses API nests it as
 * `text.verbosity` (low/medium/high). The CodexExecutor builds a Responses body and
 * gates it through an allowlist that does NOT include `text`, so for translated
 * requests both shapes are dropped silently and the hint never reaches upstream.
 *
 * This helper runs on the translated path (before the allowlist) and folds whichever
 * shape arrived into a single, validated `text:{verbosity}`. `text` is then added to
 * the allowlist so the hint survives. Other Responses `text` keys, such as
 * `text.format` for structured output, are preserved.
 *
 * Ref: OpenAI GPT-5 docs (text.verbosity), Azure Foundry reasoning guide.
 */ __turbopack_context__.s([
    "normalizeCodexVerbosity",
    ()=>normalizeCodexVerbosity
]);
const VERBOSITY_LEVELS = new Set([
    "low",
    "medium",
    "high"
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeLevel(value) {
    if (typeof value !== "string") return undefined;
    const level = value.toLowerCase();
    return VERBOSITY_LEVELS.has(level) ? level : undefined;
}
function normalizeCodexVerbosity(body) {
    const textRecord = asRecord(body.text);
    let verbosity = textRecord ? normalizeLevel(textRecord.verbosity) : undefined;
    const topLevel = normalizeLevel(body.verbosity);
    if (topLevel) verbosity = topLevel;
    delete body.verbosity;
    const nextText = textRecord ? {
        ...textRecord
    } : {};
    if (verbosity) {
        nextText.verbosity = verbosity;
    } else {
        delete nextText.verbosity;
    }
    if (Object.keys(nextText).length > 0) {
        body.text = nextText;
    } else {
        delete body.text;
    }
}
}),
"[project]/open-sse/services/cursorSessionManager.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * CursorSessionManager — keeps cursor's h2 streams alive across OpenAI calls
 * so a tool-using turn can complete inline.
 *
 * cursor's `agent.v1.AgentService/Run` is bidirectional. When the model
 * invokes an MCP tool it pauses and waits for a `ExecClientMessage.McpResult`
 * on the SAME stream. Closing the stream between the OpenAI tool_calls
 * response and the role:"tool" follow-up loses the exec_id mapping cursor
 * needs to resume.
 *
 * This manager solves that by retaining the open h2 stream (keyed by
 * conversation_id) when the executor reports endReason="tool_calls". The
 * next OpenAI call with role:"tool" reacquires the session, replies via
 * encodeExecMcpResult on the live stream, and continues driving until
 * turn_ended.
 *
 * Multi-instance considerations: sessions live in process memory. If a
 * follow-up call lands on a different OmniRoute instance, acquire() returns
 * undefined and the executor falls back to cold-resume (fresh RunRequest
 * with all history flattened into UserText). Cold-resume is correctness-
 * preserving but loses the inline efficiency.
 *
 * Concurrency: one in-flight call per session. The acquire/release pattern
 * keeps a session in "awaiting_tool_result" between calls; if a second call
 * arrives while the first is still running, acquire() returns undefined and
 * the second falls back to cold-resume.
 *
 * TTL: sessions evict after CURSOR_SESSION_IDLE_TTL_MS (default 5min). The
 * sweep runs lazily on every acquire/release rather than via setInterval to
 * keep this module test-friendly.
 */ __turbopack_context__.s([
    "CursorSessionManager",
    ()=>CursorSessionManager,
    "cursorSessionManager",
    ()=>cursorSessionManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cursorAgentProtobuf.ts [middleware] (ecmascript)");
;
const DEFAULT_IDLE_TTL_MS = 5 * 60 * 1000;
class CursorSessionManager {
    sessions = new Map();
    idleTtlMs;
    maxSessions;
    constructor(opts = {}){
        this.idleTtlMs = opts.idleTtlMs ?? DEFAULT_IDLE_TTL_MS;
        this.maxSessions = opts.maxSessions ?? 100;
    }
    /**
   * Try to reacquire an existing session for this conversation. Returns
   * undefined if there isn't one, if it's still running, or if it's idle
   * past the TTL (in which case it's closed as a side-effect).
   */ acquire(conversationId) {
        this.evictExpired();
        const session = this.sessions.get(conversationId);
        if (!session) return undefined;
        if (session.state !== "awaiting_tool_result") return undefined;
        this.clearIdleTimer(session);
        session.state = "running";
        session.lastActivityTs = Date.now();
        return session;
    }
    /**
   * Register a freshly-opened h2 stream as the session for this conversation.
   * Any pre-existing session for the same conversation is closed first.
   */ open(conversationId, h2Client, h2Req, blobStore) {
        const existing = this.sessions.get(conversationId);
        if (existing) this.close(existing);
        const session = {
            conversationId,
            h2Client,
            h2Req,
            blobStore,
            pendingToolCalls: new Map(),
            state: "running",
            lastActivityTs: Date.now()
        };
        this.sessions.set(conversationId, session);
        this.attachCloseHandlers(session);
        this.enforceMaxSessions();
        return session;
    }
    /**
   * Mark a session as no longer in-flight. If finalState is
   * "awaiting_tool_result" the h2 stream stays open and the next acquire()
   * for this conversation_id can reuse it. If "idle" or "closed" the
   * h2 is torn down here.
   */ release(session, finalState) {
        session.lastActivityTs = Date.now();
        if (finalState === "awaiting_tool_result") {
            session.state = "awaiting_tool_result";
            this.armIdleTimer(session);
            return;
        }
        this.close(session);
    }
    close(session) {
        if (session.state === "closed") return;
        session.state = "closed";
        this.clearIdleTimer(session);
        try {
            session.h2Req.close();
        } catch  {}
        try {
            session.h2Client.close();
        } catch  {}
        // Drop any unanswered tool-call mappings so a closed session doesn't pin
        // their (small) entries for the lifetime of the lingering object.
        session.pendingToolCalls.clear();
        this.sessions.delete(session.conversationId);
    }
    /**
   * Send an MCP tool result on this session's open h2 stream. Returns true
   * if the openAIToolCallId matched a pending call we'd previously seen
   * mcp_args for; false otherwise (caller should fall back to cold-resume).
   */ sendToolResult(session, openAIToolCallId, content, isError) {
        const pending = session.pendingToolCalls.get(openAIToolCallId);
        if (!pending) return false;
        try {
            session.h2Req.write((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cursorAgentProtobuf$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["encodeExecMcpResult"])(pending.execMsgId, pending.execId, content, isError));
            session.pendingToolCalls.delete(openAIToolCallId);
            session.lastActivityTs = Date.now();
            return true;
        } catch  {
            return false;
        }
    }
    evictExpired() {
        const now = Date.now();
        for (const session of this.sessions.values()){
            if (now - session.lastActivityTs > this.idleTtlMs) {
                this.close(session);
            }
        }
    }
    armIdleTimer(session) {
        this.clearIdleTimer(session);
        session.idleTimer = setTimeout(()=>this.close(session), this.idleTtlMs);
        session.idleTimer.unref?.();
    }
    clearIdleTimer(session) {
        if (session.idleTimer) {
            clearTimeout(session.idleTimer);
            session.idleTimer = undefined;
        }
    }
    attachCloseHandlers(session) {
        const closeSession = ()=>this.close(session);
        session.h2Req.once?.("close", closeSession);
        session.h2Req.once?.("error", closeSession);
        session.h2Client.once?.("close", closeSession);
        session.h2Client.once?.("error", closeSession);
    }
    enforceMaxSessions() {
        if (this.sessions.size <= this.maxSessions) return;
        const oldest = Array.from(this.sessions.values()).sort((a, b)=>a.lastActivityTs - b.lastActivityTs)[0];
        if (oldest) this.close(oldest);
    }
    // ─── Test / introspection helpers ────────────────────────────────────────
    size() {
        return this.sessions.size;
    }
    has(conversationId) {
        return this.sessions.has(conversationId);
    }
}
const cursorSessionManager = new CursorSessionManager();
}),
"[project]/open-sse/services/gigachatAuth.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getGigachatAccessToken",
    ()=>getGigachatAccessToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const DEFAULT_GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const DEFAULT_GIGACHAT_SCOPE = "GIGACHAT_API_PERS";
const CACHE_SKEW_MS = 60_000;
const tokenCache = new Map();
const inflightRequests = new Map();
function getCacheKey(credentials, authUrl, scope) {
    return `${authUrl}::${scope}::${credentials}`;
}
function isFreshToken(token) {
    if (!token?.accessToken || !token?.expiresAt) return false;
    const expiresAtMs = new Date(token.expiresAt).getTime();
    return Number.isFinite(expiresAtMs) && expiresAtMs - Date.now() > CACHE_SKEW_MS;
}
function normalizeExpiry(rawExpiry) {
    if (typeof rawExpiry === "number" && Number.isFinite(rawExpiry)) {
        return new Date(rawExpiry).toISOString();
    }
    if (typeof rawExpiry === "string" && rawExpiry.trim().length > 0) {
        const numericValue = Number(rawExpiry);
        if (Number.isFinite(numericValue)) {
            return new Date(numericValue).toISOString();
        }
        const dateMs = Date.parse(rawExpiry);
        if (Number.isFinite(dateMs)) {
            return new Date(dateMs).toISOString();
        }
    }
    return new Date(Date.now() + 30 * 60 * 1000).toISOString();
}
async function getGigachatAccessToken(options = {}) {
    const credentials = (options.credentials || "").trim();
    if (!credentials) {
        throw new Error("Missing GigaChat credentials");
    }
    const authUrl = (options.authUrl || DEFAULT_GIGACHAT_AUTH_URL).trim();
    const scope = (options.scope || DEFAULT_GIGACHAT_SCOPE).trim();
    const cacheKey = getCacheKey(credentials, authUrl, scope);
    const cached = tokenCache.get(cacheKey);
    if (isFreshToken(cached)) {
        return cached;
    }
    const inflight = inflightRequests.get(cacheKey);
    if (inflight) {
        return inflight;
    }
    const requestPromise = (async ()=>{
        const response = await fetch(authUrl, {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                RqUID: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])(),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                scope
            }).toString(),
            signal: options.signal
        });
        if (!response.ok) {
            const bodyText = await response.text();
            throw new Error(`GigaChat token request failed: ${response.status} ${bodyText}`.trim());
        }
        const data = await response.json();
        const accessToken = typeof data.tok === "string" ? data.tok : typeof data.access_token === "string" ? data.access_token : "";
        if (!accessToken) {
            throw new Error("GigaChat token response missing access token");
        }
        const token = {
            accessToken,
            expiresAt: normalizeExpiry(data.exp ?? data.expires_at)
        };
        tokenCache.set(cacheKey, token);
        return token;
    })();
    inflightRequests.set(cacheKey, requestPromise);
    try {
        return await requestPromise;
    } finally{
        inflightRequests.delete(cacheKey);
    }
}
}),
"[project]/open-sse/services/providerRequestDefaults.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyProviderRequestDefaults",
    ()=>applyProviderRequestDefaults
]);
function asRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }
    return value;
}
function toPositiveInteger(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    const normalized = Math.floor(value);
    return normalized > 0 ? normalized : null;
}
function toFiniteNumber(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return value;
}
function getExistingMaxTokens(body) {
    return toPositiveInteger(body.max_tokens) || toPositiveInteger(body.max_completion_tokens) || toPositiveInteger(body.max_output_tokens);
}
function applyProviderRequestDefaults(body, defaults) {
    const record = asRecord(body);
    if (!record || !defaults) return body;
    let changed = false;
    const next = {
        ...record
    };
    const defaultTemperature = toFiniteNumber(defaults.temperature);
    if (next.temperature === undefined && defaultTemperature !== null) {
        next.temperature = defaultTemperature;
        changed = true;
    }
    const defaultMaxTokens = toPositiveInteger(defaults.maxTokens);
    const explicitMaxTokens = getExistingMaxTokens(next);
    let effectiveMaxTokens = explicitMaxTokens;
    if (next.max_tokens === undefined && explicitMaxTokens === null && defaultMaxTokens !== null) {
        next.max_tokens = defaultMaxTokens;
        effectiveMaxTokens = defaultMaxTokens;
        changed = true;
    }
    const defaultThinkingBudget = toPositiveInteger(defaults.thinkingBudgetTokens);
    const thinking = asRecord(next.thinking);
    const thinkingAlreadyEnabled = thinking?.type === "enabled";
    const thinkingBudgetSet = toPositiveInteger(thinking?.budget_tokens) !== null;
    if (defaultThinkingBudget !== null && effectiveMaxTokens !== null && effectiveMaxTokens > 1) {
        const safeBudget = Math.min(defaultThinkingBudget, effectiveMaxTokens - 1);
        if (safeBudget > 0) {
            if (next.thinking === undefined) {
                next.thinking = {
                    type: "enabled",
                    budget_tokens: safeBudget
                };
                changed = true;
            } else if (thinkingAlreadyEnabled && !thinkingBudgetSet) {
                next.thinking = {
                    ...thinking,
                    budget_tokens: safeBudget
                };
                changed = true;
            }
        }
    }
    return changed ? next : body;
}
}),
"[project]/open-sse/services/rateLimitSemaphore.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Rate-Limit Semaphore
 *
 * Per-model concurrency limiter with FIFO queue for round-robin combo strategy.
 * When a model is at max concurrency, requests wait in a queue instead of failing.
 * When a model hits rate-limits, it's temporarily paused and queued requests wait.
 *
 * All state is in-memory — resets on server restart (by design, since rate-limit
 * windows are typically short-lived).
 */ __turbopack_context__.s([
    "acquire",
    ()=>acquire,
    "getStats",
    ()=>getStats,
    "markRateLimited",
    ()=>markRateLimited,
    "resetAll",
    ()=>resetAll
]);
/** @type {Map<string, ModelGate>} */ const gates = new Map();
/**
 * Get or create gate for a model
 * @param {string} modelStr
 * @param {number} maxConcurrency
 * @returns {ModelGate}
 */ function getGate(modelStr, maxConcurrency = 3) {
    if (!gates.has(modelStr)) {
        gates.set(modelStr, {
            running: 0,
            max: maxConcurrency,
            queue: [],
            rateLimitedUntil: null
        });
    }
    const gate = gates.get(modelStr);
    // Update max if config changed
    gate.max = maxConcurrency;
    return gate;
}
/**
 * Check if a model is currently rate-limited
 * @param {ModelGate} gate
 * @returns {boolean}
 */ function isRateLimited(gate) {
    if (!gate.rateLimitedUntil) return false;
    if (Date.now() >= gate.rateLimitedUntil) {
        gate.rateLimitedUntil = null;
        return false;
    }
    return true;
}
/**
 * Try to drain queued requests when slots become available
 * @param {string} modelStr
 */ function drainQueue(modelStr) {
    const gate = gates.get(modelStr);
    if (!gate) return;
    while(gate.queue.length > 0 && gate.running < gate.max && !isRateLimited(gate)){
        const next = gate.queue.shift();
        if (!next) break;
        clearTimeout(next.timer);
        gate.running++;
        next.resolve(createReleaseFn(modelStr));
    }
    if (gate.running === 0 && gate.queue.length === 0) {
        gates.delete(modelStr);
    }
}
/**
 * Create a release function for a slot
 * @param {string} modelStr
 * @returns {Function}
 */ function createReleaseFn(modelStr) {
    let released = false;
    return ()=>{
        if (released) return;
        released = true;
        const gate = gates.get(modelStr);
        if (gate && gate.running > 0) {
            gate.running--;
            if (gate.running === 0 && gate.queue.length === 0) {
                gates.delete(modelStr);
                return;
            }
            drainQueue(modelStr);
        }
    };
}
function acquire(modelStr, { maxConcurrency = 3, timeoutMs = 30000, maxQueueSize } = {}) {
    const gate = getGate(modelStr, maxConcurrency);
    // Fast path: slot available and not rate-limited
    if (gate.running < gate.max && !isRateLimited(gate)) {
        gate.running++;
        return Promise.resolve(createReleaseFn(modelStr));
    }
    // #3872: bounded queue — once the queue is full, fail fast so the round-robin combo
    // cascades to the next member immediately instead of deep-queueing for up to timeoutMs.
    if (typeof maxQueueSize === "number" && maxQueueSize >= 0 && gate.queue.length >= maxQueueSize) {
        const err = new Error(`Semaphore queue full (${maxQueueSize}) for ${modelStr}`);
        err.code = "SEMAPHORE_QUEUE_FULL";
        // Drop a freshly-created idle gate so we don't leak an empty entry.
        if (gate.running === 0 && gate.queue.length === 0) gates.delete(modelStr);
        return Promise.reject(err);
    }
    // Slow path: enqueue and wait
    return new Promise((resolve, reject)=>{
        const timer = setTimeout(()=>{
            // Remove from queue on timeout
            const idx = gate.queue.findIndex((item)=>item.timer === timer);
            if (idx !== -1) gate.queue.splice(idx, 1);
            const err = new Error(`Semaphore timeout after ${timeoutMs}ms for ${modelStr}`);
            err.code = "SEMAPHORE_TIMEOUT";
            reject(err);
        }, timeoutMs);
        gate.queue.push({
            resolve,
            reject,
            timer
        });
    });
}
function markRateLimited(modelStr, cooldownMs) {
    const gate = getGate(modelStr);
    gate.rateLimitedUntil = Date.now() + cooldownMs;
    // Schedule drain after cooldown expires
    setTimeout(()=>{
        if (gate.rateLimitedUntil && Date.now() >= gate.rateLimitedUntil) {
            gate.rateLimitedUntil = null;
            drainQueue(modelStr);
        }
    }, cooldownMs + 50); // +50ms buffer
}
function getStats() {
    const stats = {};
    for (const [model, gate] of gates){
        stats[model] = {
            running: gate.running,
            queued: gate.queue.length,
            max: gate.max,
            rateLimitedUntil: gate.rateLimitedUntil ? new Date(gate.rateLimitedUntil).toISOString() : null
        };
    }
    return stats;
}
function resetAll() {
    for (const [, gate] of gates){
        for (const item of gate.queue){
            clearTimeout(item.timer);
            item.reject(new Error("Semaphore reset"));
        }
    }
    gates.clear();
}
}),
"[project]/open-sse/services/slidingWindowLimiter.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Sliding-window rate limiter (free-claude-code port, Fase 8.2).
 *
 * A small, dependency-free fallback limiter for providers that do NOT expose
 * rate-limit headers (so the adaptive Bottleneck path in rateLimitManager never
 * learns a reservoir) but have a documented fixed cap. Bottleneck's reservoir is a
 * fixed-window counter that refills in one burst every interval; a true sliding
 * window enforces "no more than N requests in ANY trailing windowMs", which avoids
 * the 2× burst at window boundaries that can trip an upstream 429.
 *
 * It is intentionally a pure allowed/blocked oracle (no internal queueing) — the
 * caller decides whether to wait `retryAfterMs` or fall back. See
 * `withRateLimit` in rateLimitManager.ts for the opt-in wiring, gated on
 * PROVIDER_DEFAULT_RATE_LIMITS so existing providers are unaffected.
 */ __turbopack_context__.s([
    "SlidingWindowLimiter",
    ()=>SlidingWindowLimiter
]);
// Hard ceiling on distinct keys tracked, so a pathological key space (e.g. a
// per-request id leaking into the key) can never grow the map without bound.
const MAX_KEYS = 5000;
class SlidingWindowLimiter {
    hits = new Map();
    now;
    nextHitId = 1;
    constructor(opts = {}){
        this.now = opts.now ?? Date.now;
    }
    /**
   * Try to consume one slot for `key`. Records a timestamp and returns
   * `{allowed:true}` when under the cap; returns `{allowed:false, retryAfterMs}`
   * (without recording) when the trailing window is saturated.
   */ tryAcquire(key, window) {
        const result = this.tryAcquireMany([
            {
                key,
                window
            }
        ]);
        return {
            allowed: result.allowed,
            retryAfterMs: result.retryAfterMs
        };
    }
    /**
   * Acquire all supplied scopes atomically. No scope is recorded unless every
   * configured scope has capacity, preventing a global lease from being held
   * while a narrower provider/account lease is unavailable.
   */ tryAcquireMany(scopes) {
        const activeScopes = scopes.filter(({ window })=>window.requests > 0 && window.windowMs > 0);
        if (activeScopes.length === 0) return {
            allowed: true,
            retryAfterMs: 0
        };
        const now = this.now();
        const prepared = activeScopes.map((scope)=>{
            const cutoff = now - scope.window.windowMs;
            const previous = this.hits.get(scope.key);
            const live = previous ? previous.filter((hit)=>hit.timestamp > cutoff) : [];
            const retryAfterMs = live.length >= scope.window.requests ? Math.max(0, live[0].timestamp + scope.window.windowMs - now) : 0;
            return {
                scope,
                live,
                retryAfterMs
            };
        });
        const retryAfterMs = prepared.reduce((max, entry)=>Math.max(max, entry.retryAfterMs), 0);
        for (const entry of prepared)this.set(entry.scope.key, entry.live);
        if (retryAfterMs > 0) return {
            allowed: false,
            retryAfterMs
        };
        const entries = prepared.map((entry)=>{
            const hit = {
                id: this.nextHitId++,
                timestamp: now
            };
            entry.live.push(hit);
            this.set(entry.scope.key, entry.live);
            return {
                key: entry.scope.key,
                id: hit.id
            };
        });
        let released = false;
        return {
            allowed: true,
            retryAfterMs: 0,
            lease: {
                release: ()=>{
                    if (released) return;
                    released = true;
                    for (const entry of entries){
                        const live = this.hits.get(entry.key);
                        if (!live) continue;
                        const remaining = live.filter((hit)=>hit.id !== entry.id);
                        if (remaining.length > 0) this.hits.set(entry.key, remaining);
                        else this.hits.delete(entry.key);
                    }
                }
            }
        };
    }
    /** Clear history for one key, or all keys when called with no argument. */ reset(key) {
        if (key === undefined) this.hits.clear();
        else this.hits.delete(key);
    }
    set(key, live) {
        if (live.length === 0) {
            this.hits.delete(key);
            return;
        }
        if (!this.hits.has(key) && this.hits.size >= MAX_KEYS) {
            // Evict the least-recently-inserted key (Map preserves insertion order).
            const oldest = this.hits.keys().next().value;
            if (oldest !== undefined) this.hits.delete(oldest);
        }
        this.hits.set(key, live);
    }
}
}),
"[project]/open-sse/services/providerDefaultRateLimit.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROVIDER_DEFAULT_CONCURRENCY_CAP",
    ()=>PROVIDER_DEFAULT_CONCURRENCY_CAP,
    "__setProviderDefaultRateLimitsForTests",
    ()=>__setProviderDefaultRateLimitsForTests,
    "acquireProviderDefaultSlot",
    ()=>acquireProviderDefaultSlot,
    "awaitProviderDefaultSlot",
    ()=>awaitProviderDefaultSlot,
    "getProviderConcurrencyCap",
    ()=>getProviderConcurrencyCap,
    "getProviderDefaultRateLimit",
    ()=>getProviderDefaultRateLimit,
    "setProviderQuotaOverrides",
    ()=>setProviderQuotaOverrides
]);
/**
 * Provider-default sliding-window rate-limit fallback (free-claude-code port, Fase 8.2).
 *
 * Providers that do NOT send rate-limit headers never let the adaptive Bottleneck path
 * in rateLimitManager learn a reservoir, so `resolveRpm` leaves them effectively
 * un-throttled. For such a provider with a *documented* fixed cap, an operator can
 * declare a default here and a sliding window (burst-free, unlike Bottleneck's
 * fixed-window reservoir which refills in one burst every interval) enforces it
 * proactively. `nvidia` is the first (and currently only) real entry — NVIDIA NIM's
 * free tier is documented as "~40 RPM" and exposes no rate-limit headers or usage
 * API (#6846 Phase 1). Every other provider still gets zero behavior change; the
 * whole path is a no-op unless an entry (or a resolved override, see below) exists.
 *
 * Composed into the rolling lease gate in `withRateLimit` (rateLimitManager.ts).
 * The exported acquire helpers remain available for provider-specific callers
 * and tests, while the main request path acquires global and provider scopes
 * atomically.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$slidingWindowLimiter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/slidingWindowLimiter.ts [middleware] (ecmascript)");
;
// Opt-in per-provider caps. Example shape (commented — add real entries as needed):
//   "some-headerless-provider": { requests: 60, windowMs: 60_000 },
const PROVIDER_DEFAULT_RATE_LIMITS = {
    nvidia: {
        requests: 40,
        windowMs: 60_000
    }
};
const PROVIDER_DEFAULT_CONCURRENCY_CAP = {
    nvidia: 6
};
let providerDefaultOverrides = null;
const limiter = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$slidingWindowLimiter$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["SlidingWindowLimiter"]();
/**
 * Operator-configured overrides, resolved from `ResilienceSettings.providerQuotaOverrides`
 * (see `src/lib/resilience/settings.ts`) by `rateLimitManager.ts` on init/refresh.
 * `rpm` overrides the static sliding-window budget; `concurrency` overrides the
 * default per-connection concurrency cap. A 0/missing field falls back to the
 * static default for that field.
 */ let providerQuotaOverrides = null;
function __setProviderDefaultRateLimitsForTests(map) {
    providerDefaultOverrides = map;
    limiter.reset();
}
function setProviderQuotaOverrides(map) {
    providerQuotaOverrides = map;
}
function getProviderDefaultRateLimit(provider) {
    if (!provider) return undefined;
    const rpmOverride = providerQuotaOverrides?.[provider]?.rpm;
    if (typeof rpmOverride === "number" && rpmOverride > 0) {
        return {
            requests: rpmOverride,
            windowMs: 60_000
        };
    }
    return (providerDefaultOverrides ?? PROVIDER_DEFAULT_RATE_LIMITS)[provider];
}
function getProviderConcurrencyCap(provider, fallback) {
    const override = providerQuotaOverrides?.[provider]?.concurrency;
    if (typeof override === "number" && override > 0) return override;
    const staticDefault = PROVIDER_DEFAULT_CONCURRENCY_CAP[provider];
    return typeof staticDefault === "number" && staticDefault > 0 ? staticDefault : fallback;
}
function acquireProviderDefaultSlot(provider, connectionId) {
    const cfg = getProviderDefaultRateLimit(provider);
    if (!cfg) return 0;
    const res = limiter.tryAcquire(`${provider}:${connectionId || "_"}`, cfg);
    return res.allowed ? 0 : Math.max(1, res.retryAfterMs);
}
/** Abort-aware sleep: resolves after `ms`, or rejects with AbortError if `signal` fires. */ function sleepOrAbort(ms, signal) {
    return new Promise((resolve, reject)=>{
        let onAbort = null;
        const timer = setTimeout(()=>{
            if (signal && onAbort) signal.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        if (signal) {
            onAbort = ()=>{
                clearTimeout(timer);
                const reason = signal.reason;
                const err = reason instanceof Error ? reason : new Error(typeof reason === "string" ? reason : "The operation was aborted");
                err.name = "AbortError";
                reject(err);
            };
            signal.addEventListener("abort", onAbort, {
                once: true
            });
        }
    });
}
async function awaitProviderDefaultSlot(provider, connectionId, signal, maxWaitMs) {
    const cfg = getProviderDefaultRateLimit(provider);
    if (!cfg) return;
    const budget = Math.max(cfg.windowMs, maxWaitMs && maxWaitMs > 0 ? maxWaitMs : 0);
    const start = Date.now();
    for(;;){
        const waitMs = acquireProviderDefaultSlot(provider, connectionId);
        if (waitMs === 0) return;
        if (Date.now() - start >= budget) return; // waited the budget; let it through
        await sleepOrAbort(Math.min(waitMs, budget), signal);
    }
}
}),
"[project]/open-sse/services/geminiThoughtSignatureStore.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGeminiThoughtSignatureKey",
    ()=>buildGeminiThoughtSignatureKey,
    "clearGeminiThoughtSignatureMemoryForTests",
    ()=>clearGeminiThoughtSignatureMemoryForTests,
    "clearGeminiThoughtSignatures",
    ()=>clearGeminiThoughtSignatures,
    "getGeminiThoughtSignature",
    ()=>getGeminiThoughtSignature,
    "getGeminiThoughtSignatureMemorySizeForTests",
    ()=>getGeminiThoughtSignatureMemorySizeForTests,
    "getGeminiThoughtSignatureMode",
    ()=>getGeminiThoughtSignatureMode,
    "isValidBasicGeminiThoughtSignature",
    ()=>isValidBasicGeminiThoughtSignature,
    "isValidFullGeminiThoughtSignature",
    ()=>isValidFullGeminiThoughtSignature,
    "normalizeSignatureCacheMode",
    ()=>normalizeSignatureCacheMode,
    "resolveGeminiThoughtSignature",
    ()=>resolveGeminiThoughtSignature,
    "setGeminiThoughtSignatureMode",
    ()=>setGeminiThoughtSignatureMode,
    "storeGeminiThoughtSignature",
    ()=>storeGeminiThoughtSignature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [middleware] (ecmascript) <locals>");
;
const MAX_SIGNATURES = 1000;
const MAX_PERSISTED_SIGNATURES = 2_000;
const MEMORY_TTL_MS = 1000 * 60 * 60;
const PERSISTED_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const NAMESPACE = "gemini_thought_signatures";
const signatures = new Map();
let signatureCacheMode = "enabled";
let persistedPruneCounter = 0;
const MAX_LOGGED_ERRORS = 50;
const loggedPersistenceErrors = new Set();
function warnPersistenceError(operation, error) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (loggedPersistenceErrors.has(operation)) return;
    if (loggedPersistenceErrors.size >= MAX_LOGGED_ERRORS) {
        const first = loggedPersistenceErrors.values().next().value;
        if (first !== undefined) loggedPersistenceErrors.delete(first);
    }
    loggedPersistenceErrors.add(operation);
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[signature-cache] persisted ${operation} failed: ${message}`);
}
function buildGeminiThoughtSignatureKey(namespace, toolCallId) {
    if (typeof namespace === "string" && namespace.length > 0 && typeof toolCallId === "string" && toolCallId.length > 0) {
        return `${namespace}:${toolCallId}`;
    }
    return toolCallId;
}
function pruneExpired() {
    const now = Date.now();
    for (const [key, value] of signatures.entries()){
        if (value.expiresAt <= now) {
            signatures.delete(key);
        }
    }
    while(signatures.size > MAX_SIGNATURES){
        const oldestKey = signatures.keys().next().value;
        if (!oldestKey) break;
        signatures.delete(oldestKey);
    }
}
function serializePersistedEntry(entry) {
    return JSON.stringify(entry);
}
function parsePersistedEntry(value, now = Date.now()) {
    try {
        const parsed = JSON.parse(value);
        if (typeof parsed.signature !== "string" || parsed.signature.length === 0) return null;
        const createdAt = typeof parsed.createdAt === "number" ? parsed.createdAt : now;
        const expiresAt = typeof parsed.expiresAt === "number" ? parsed.expiresAt : now + PERSISTED_TTL_MS;
        if (expiresAt <= now) return null;
        return {
            entry: {
                signature: parsed.signature,
                createdAt,
                expiresAt
            },
            shouldRewrite: createdAt !== parsed.createdAt || expiresAt !== parsed.expiresAt
        };
    } catch  {
        if (!value) return null;
        return {
            entry: {
                signature: value,
                createdAt: now,
                expiresAt: now + PERSISTED_TTL_MS
            },
            shouldRewrite: true
        };
    }
}
function maybePrunePersistedSignatures(db) {
    persistedPruneCounter += 1;
    if (persistedPruneCounter % 100 !== 0) return;
    const rows = db.prepare("SELECT key, value FROM key_value WHERE namespace = ?").all(NAMESPACE);
    const now = Date.now();
    const validRows = [];
    const keysToDelete = new Set();
    for (const row of rows){
        const parsed = parsePersistedEntry(row.value, now);
        if (!parsed) {
            keysToDelete.add(row.key);
            continue;
        }
        validRows.push({
            key: row.key,
            createdAt: parsed.entry.createdAt
        });
    }
    if (rows.length <= MAX_PERSISTED_SIGNATURES && keysToDelete.size === 0) return;
    validRows.sort((a, b)=>b.createdAt - a.createdAt);
    for (const row of validRows.slice(MAX_PERSISTED_SIGNATURES)){
        keysToDelete.add(row.key);
    }
    if (keysToDelete.size === 0) return;
    const remove = db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?");
    const tx = db.transaction((keys)=>{
        for (const key of keys)remove.run(NAMESPACE, key);
    });
    tx([
        ...keysToDelete
    ]);
}
function storeGeminiThoughtSignature(toolCallId, signature) {
    if (typeof toolCallId !== "string" || !toolCallId) return;
    if (typeof signature !== "string" || !signature) return;
    const now = Date.now();
    pruneExpired();
    signatures.set(toolCallId, {
        signature,
        expiresAt: now + MEMORY_TTL_MS
    });
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(NAMESPACE, toolCallId, serializePersistedEntry({
            signature,
            createdAt: now,
            expiresAt: now + PERSISTED_TTL_MS
        }));
        maybePrunePersistedSignatures(db);
    } catch (error) {
        warnPersistenceError("store", error);
    }
}
function getGeminiThoughtSignature(toolCallId) {
    if (typeof toolCallId !== "string" || !toolCallId) return null;
    pruneExpired();
    const entry = signatures.get(toolCallId);
    if (entry) return entry.signature;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(NAMESPACE, toolCallId);
        if (row?.value) {
            const persisted = parsePersistedEntry(row.value);
            if (!persisted) {
                db.prepare("DELETE FROM key_value WHERE namespace = ? AND key = ?").run(NAMESPACE, toolCallId);
                return null;
            }
            signatures.set(toolCallId, {
                signature: persisted.entry.signature,
                expiresAt: Date.now() + MEMORY_TTL_MS
            });
            if (persisted.shouldRewrite) {
                db.prepare("UPDATE key_value SET value = ? WHERE namespace = ? AND key = ?").run(serializePersistedEntry(persisted.entry), NAMESPACE, toolCallId);
            }
            return persisted.entry.signature;
        }
    } catch (error) {
        warnPersistenceError("read", error);
    }
    return null;
}
function normalizeSignatureCacheMode(value) {
    return value === "bypass" || value === "bypass-strict" ? value : "enabled";
}
function setGeminiThoughtSignatureMode(mode) {
    signatureCacheMode = normalizeSignatureCacheMode(mode);
}
function getGeminiThoughtSignatureMode() {
    return signatureCacheMode;
}
function decodeSignature(signature) {
    if (!signature || signature[0] !== "R" && signature[0] !== "E") return null;
    const payload = signature.slice(1);
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(payload) || payload.length % 4 === 1) {
        return null;
    }
    try {
        const decoded = Buffer.from(payload, "base64");
        if (decoded.length === 0) return null;
        const canonical = decoded.toString("base64").replace(/=+$/g, "");
        if (canonical !== payload.replace(/=+$/g, "")) {
            return null;
        }
        return decoded;
    } catch  {
        return null;
    }
}
function readVarint(buffer, startOffset) {
    let offset = startOffset;
    let result = 0;
    let shift = 0;
    while(offset < buffer.length && shift < 35){
        const byte = buffer[offset];
        result |= (byte & 0x7f) << shift;
        offset += 1;
        if ((byte & 0x80) === 0) {
            return {
                nextOffset: offset,
                value: result
            };
        }
        shift += 7;
    }
    return null;
}
function isValidBasicGeminiThoughtSignature(signature) {
    if (typeof signature !== "string") return false;
    const decoded = decodeSignature(signature);
    return Boolean(decoded && decoded[0] === 0x12);
}
function isValidFullGeminiThoughtSignature(signature) {
    if (typeof signature !== "string") return false;
    const decoded = decodeSignature(signature);
    if (!decoded || decoded[0] !== 0x12) return false;
    const outerLength = readVarint(decoded, 1);
    if (!outerLength) return false;
    const outerEnd = outerLength.nextOffset + outerLength.value;
    if (outerEnd !== decoded.length) return false;
    const inner = decoded.subarray(outerLength.nextOffset, outerEnd);
    if (inner.length === 0 || inner[0] !== 0x0a) return false;
    const innerLength = readVarint(inner, 1);
    if (!innerLength) return false;
    return innerLength.nextOffset + innerLength.value === inner.length;
}
function resolveGeminiThoughtSignature(toolCallId, clientSignature) {
    const persisted = getGeminiThoughtSignature(toolCallId);
    if (typeof clientSignature !== "string" || clientSignature.length === 0) {
        return persisted;
    }
    if (signatureCacheMode === "enabled") {
        return persisted;
    }
    const isValid = signatureCacheMode === "bypass-strict" ? isValidFullGeminiThoughtSignature(clientSignature) : isValidBasicGeminiThoughtSignature(clientSignature);
    if (isValid) {
        return clientSignature;
    }
    console.warn(`[signature-cache] ${signatureCacheMode}: invalid client thought signature, falling back`);
    return persisted;
}
function clearGeminiThoughtSignatures() {
    signatures.clear();
    signatureCacheMode = "enabled";
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
        db.prepare("DELETE FROM key_value WHERE namespace = ?").run(NAMESPACE);
    } catch (error) {
        warnPersistenceError("clear", error);
    }
}
function clearGeminiThoughtSignatureMemoryForTests() {
    signatures.clear();
}
function getGeminiThoughtSignatureMemorySizeForTests() {
    pruneExpired();
    return signatures.size;
}
}),
"[project]/open-sse/services/modelCapabilities.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$modelCapabilities$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/modelCapabilities.ts [middleware] (ecmascript)");
;
}),
"[project]/open-sse/services/roleNormalizer.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeDeveloperRole",
    ()=>normalizeDeveloperRole,
    "normalizeModelRole",
    ()=>normalizeModelRole,
    "normalizeRoles",
    ()=>normalizeRoles,
    "normalizeSystemRole",
    ()=>normalizeSystemRole
]);
/**
 * Role Normalizer — Converts message roles for provider compatibility.
 *
 * Fixes Issues:
 * 1. GLM/ZhipuAI rejects `system` role → merged into first `user` message
 * 2. OpenAI `developer` role not understood by non-OpenAI providers → normalized to `system`
 * 3. Some providers don't support `system` role at all → prepended to user message
 *
 * Provider capability matrix is defined here rather than in the registry to
 * avoid breaking changes to the existing RegistryEntry interface.
 */ // ── Provider capabilities ──────────────────────────────────────────────────
/**
 * Providers that do NOT support the `system` role in messages.
 * For these, system messages are merged into the first user message.
 *
 * Note: This applies only to OpenAI-format passthrough providers.
 * Claude and Gemini have their own system message handling in dedicated translators.
 */ const PROVIDERS_WITHOUT_SYSTEM_ROLE = new Set([]);
/**
 * Providers known to natively accept the OpenAI `developer` role.
 * Issue #2281: When the upstream provider is OpenAI-compatible but NOT in
 * this allowlist (DeepSeek, MiniMax, Mimo, GLM, etc.), the default behavior
 * maps `developer` → `system`. Without this, requests from Codex/Responses
 * API clients fail with "unknown variant `developer`" 400 errors.
 *
 * Operators can still force preservation per-model via the dashboard
 * "Compatibility → preserveOpenAIDeveloperRole = true" toggle.
 */ const PROVIDERS_PRESERVING_DEVELOPER_ROLE = new Set([
    "openai",
    "azure-openai",
    "azure",
    "github"
]);
function defaultPreserveDeveloperForProvider(provider) {
    const id = provider.trim().toLowerCase();
    if (!id) return false;
    if (PROVIDERS_PRESERVING_DEVELOPER_ROLE.has(id)) return true;
    // Treat any provider id containing "openai" as OpenAI-compatible enough
    // to preserve developer role by default (e.g. "azure-openai-gov").
    if (id.includes("openai")) return true;
    return false;
}
/**
 * Models that are known to reject the `system` role regardless of provider.
 * Uses prefix matching (e.g., "ernie-" matches "ernie-4.0").
 */ const MODELS_WITHOUT_SYSTEM_ROLE = [
    "ernie-"
];
/**
 * ZhipuAI GLM rejects the `system` role EXCEPT generation > 5.0: per z.ai docs,
 * GLM 5.1 / 5.2 (and newer) accept it, so their system prompt must NOT be folded
 * into the first user turn (#5610). Everything else GLM — bare "glm" (Pollinations),
 * the 4.x family, and the 5.0 generation — still needs the fold. The version is read
 * from "glm-<major>.<minor>" or the Fireworks "glm-5p1" point alias.
 */ function isGlmWithoutSystemRole(modelLower) {
    if (!modelLower.startsWith("glm")) return false;
    const match = modelLower.match(/glm-?(\d+)(?:[.p](\d+))?/);
    if (match) {
        const major = Number(match[1]);
        const minor = match[2] ? Number(match[2]) : 0;
        if (major > 5 || major === 5 && minor >= 1) return false;
    }
    return true;
}
const PROVIDER_SCOPED_MODELS_WITHOUT_SYSTEM_ROLE = {
    // ZenMux exposes Z.AI GLM through OpenAI-compatible model ids such as
    // "z-ai/glm-5.2". Z.AI rejects compressed histories that start with a
    // system summary followed by an assistant/tool bundle, while OpenRouter
    // tolerates the same shape. Treat these vendor-prefixed GLM ids like native
    // GLM so normalizeSystemRole moves system/developer content into a user turn.
    zenmux: [
        /(?:^|\/)glm(?:-|$)/i
    ]
};
function extractTextFromContent(content) {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    return content.filter((part)=>!!part && typeof part === "object" && "type" in part && part.type === "text").map((part)=>typeof part.text === "string" ? part.text : "").join("\n");
}
/**
 * Check if a provider+model combo supports the system role.
 */ function supportsSystemRole(provider, model) {
    const providerLower = (provider || "").trim().toLowerCase();
    if (PROVIDERS_WITHOUT_SYSTEM_ROLE.has(providerLower)) return false;
    const modelLower = (model || "").toLowerCase();
    for (const pattern of PROVIDER_SCOPED_MODELS_WITHOUT_SYSTEM_ROLE[providerLower] ?? []){
        if (pattern.test(modelLower)) return false;
    }
    if (isGlmWithoutSystemRole(modelLower)) return false;
    for (const prefix of MODELS_WITHOUT_SYSTEM_ROLE){
        if (modelLower.startsWith(prefix)) return false;
    }
    return true;
}
function normalizeDeveloperRole(messages, targetFormat, preserveDeveloperRole, provider) {
    if (!Array.isArray(messages)) return messages;
    if (targetFormat === "openai") {
        const effectivePreserve = preserveDeveloperRole !== undefined ? preserveDeveloperRole : defaultPreserveDeveloperForProvider(provider ?? "");
        if (effectivePreserve) return messages;
    }
    return messages.map((msg)=>{
        if (!msg || typeof msg !== "object") return msg;
        const role = typeof msg.role === "string" ? msg.role : "";
        if (role.toLowerCase() === "developer") {
            return {
                ...msg,
                role: "system"
            };
        }
        return msg;
    });
}
function normalizeModelRole(messages) {
    if (!Array.isArray(messages)) return messages;
    return messages.map((msg)=>{
        if (!msg || typeof msg !== "object") return msg;
        const role = typeof msg.role === "string" ? msg.role : "";
        if (role.toLowerCase() === "model") {
            return {
                ...msg,
                role: "assistant"
            };
        }
        return msg;
    });
}
function normalizeSystemRole(messages, provider, model) {
    if (!Array.isArray(messages) || messages.length === 0) return messages;
    if (supportsSystemRole(provider, model)) return messages;
    // Extract system messages
    const systemMessages = messages.filter((message)=>message.role === "system" || message.role === "developer");
    if (systemMessages.length === 0) return messages;
    // Build system content string
    const systemContent = systemMessages.map((message)=>extractTextFromContent(message.content)).filter(Boolean).join("\n\n");
    if (!systemContent) {
        return messages.filter((message)=>message.role !== "system" && message.role !== "developer");
    }
    // Remove system messages and merge into first user message
    const nonSystemMessages = messages.filter((message)=>message.role !== "system" && message.role !== "developer");
    // Find first user message and prepend system content
    const firstUserIdx = nonSystemMessages.findIndex((message)=>message.role === "user");
    if (firstUserIdx >= 0) {
        const userMsg = nonSystemMessages[firstUserIdx];
        const userContent = extractTextFromContent(userMsg.content);
        nonSystemMessages[firstUserIdx] = {
            ...userMsg,
            content: `[System Instructions]\n${systemContent}\n\n[User Message]\n${userContent}`
        };
    } else {
        // No user message found — insert as a user message at the beginning
        nonSystemMessages.unshift({
            role: "user",
            content: `[System Instructions]\n${systemContent}`
        });
    }
    return nonSystemMessages;
}
function normalizeRoles(messages, provider, model, targetFormat, preserveDeveloperRole) {
    if (!Array.isArray(messages)) return messages;
    let result = normalizeModelRole(messages);
    result = normalizeDeveloperRole(result, targetFormat, preserveDeveloperRole, provider);
    result = normalizeSystemRole(result, provider, model);
    return result;
}
}),
"[project]/open-sse/services/toolLatencyTracker.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Tracks per-provider tool call latency metrics.
 * Resets on server restart.
 */ __turbopack_context__.s([
    "getToolLatencyByProvider",
    ()=>getToolLatencyByProvider,
    "recordToolLatency",
    ()=>recordToolLatency,
    "recordToolTtft",
    ()=>recordToolTtft,
    "resetToolLatency",
    ()=>resetToolLatency
]);
const metrics = new Map();
function recordToolLatency(provider, ttftAfterToolMs, gapAfterToolMs) {
    if (!provider) return;
    if (!metrics.has(provider)) {
        metrics.set(provider, {
            totalRequests: 0,
            ttftAfterToolSum: 0,
            gapAfterToolSum: 0,
            ttftCount: 0,
            gapCount: 0
        });
    }
    const entry = metrics.get(provider);
    entry.totalRequests++;
    if (ttftAfterToolMs != null && ttftAfterToolMs >= 0) {
        entry.ttftAfterToolSum += ttftAfterToolMs;
        entry.ttftCount++;
    }
    if (gapAfterToolMs != null && gapAfterToolMs >= 0) {
        entry.gapAfterToolSum += gapAfterToolMs;
        entry.gapCount++;
    }
}
function getToolLatencyByProvider() {
    const result = {};
    for (const [provider, entry] of metrics){
        result[provider] = {
            avgTtftAfterToolMs: entry.ttftCount > 0 ? Math.round(entry.ttftAfterToolSum / entry.ttftCount) : 0,
            avgGapAfterToolMs: entry.gapCount > 0 ? Math.round(entry.gapAfterToolSum / entry.gapCount) : 0,
            measurementCount: entry.totalRequests
        };
    }
    return result;
}
function recordToolTtft(provider, ttftMs) {
    if (!provider || ttftMs < 0) return;
    if (!metrics.has(provider)) {
        metrics.set(provider, {
            totalRequests: 0,
            ttftAfterToolSum: 0,
            gapAfterToolSum: 0,
            ttftCount: 0,
            gapCount: 0
        });
    }
    const entry = metrics.get(provider);
    entry.totalRequests++;
    entry.ttftAfterToolSum += ttftMs;
    entry.ttftCount++;
}
function resetToolLatency() {
    metrics.clear();
}
}),
"[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildNativeTlsClientOptions",
    ()=>buildNativeTlsClientOptions,
    "resolveTlsClientDownloadDir",
    ()=>resolveTlsClientDownloadDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/dataPaths.ts [middleware] (ecmascript)");
;
;
function resolveTlsClientDownloadDir() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$dataPaths$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveDataDir"])(), "tls-client", "bin");
}
function buildNativeTlsClientOptions() {
    return {
        runtimeMode: "native",
        downloadDir: resolveTlsClientDownloadDir()
    };
}
}),
"[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveTlsClientProxyUrl",
    ()=>resolveTlsClientProxyUrl
]);
function resolveTlsClientProxyUrl(targetUrl, perCall, resolveProxyForRequest) {
    if (perCall && perCall.length > 0) return perCall;
    let info;
    try {
        info = resolveProxyForRequest(targetUrl);
    } catch (err) {
        throw new Error(`[TlsClient] Proxy resolution failed for ${targetUrl}; refusing direct connection (fail-closed): ${err instanceof Error ? err.message : String(err)}`);
    }
    return info && info.proxyUrl ? info.proxyUrl : undefined;
}
}),
"[project]/open-sse/services/perplexityTlsClient.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "TlsClientHangError",
    ()=>TlsClientHangError,
    "TlsClientUnavailableError",
    ()=>TlsClientUnavailableError,
    "__setTlsFetchOverrideForTesting",
    ()=>__setTlsFetchOverrideForTesting,
    "isCloudflareChallenge",
    ()=>isCloudflareChallenge,
    "looksLikeSse",
    ()=>looksLikeSse,
    "tlsFetchPerplexity",
    ()=>tlsFetchPerplexity
]);
/**
 * Browser-TLS-impersonating HTTP client for www.perplexity.ai.
 *
 * Why this exists: Perplexity sits behind the same Cloudflare Enterprise
 * configuration as ChatGPT — it pins access to the client's TLS fingerprint
 * (JA3/JA4) + HTTP/2 SETTINGS frame ordering. Node's Undici fetch presents an
 * obvious "not a browser" handshake and gets challenged with a 403 "Just a
 * moment..." page from VPS/datacenter IPs — even with a valid session cookie.
 * This module wraps `tls-client-node` (native shared library built from
 * bogdanfinn/tls-client) to send a Firefox handshake instead. (issue #2459)
 *
 * Mirrors `chatgptTlsClient.ts`; kept as an independent module so changes here
 * cannot regress the production chatgpt-web path. The first call lazily starts
 * the managed sidecar; subsequent calls reuse a singleton TLSClient. Process
 * exit hooks stop the sidecar cleanly.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let clientPromise = null;
let exitHookInstalled = false;
const PPLX_PROFILE = "firefox_148"; // matches the Firefox 148 UA we send
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.OMNIROUTE_PPLX_TLS_TIMEOUT_MS || "", 10) || 30_000;
// Grace period added to the binding's wire-level timeout before our JS-level
// hard timeout fires. Under healthy operation `tls-client-node` honors
// `timeoutMilliseconds` and rejects on its own; the JS-level race only wins
// when the koffi-loaded native library is wedged (which the binding's own
// timer can't escape). Keep the grace small so users don't wait noticeably
// longer than the configured timeout when the binding is dead.
const HARD_TIMEOUT_GRACE_MS = Number.parseInt(process.env.OMNIROUTE_PPLX_TLS_GRACE_MS || "", 10) || 10_000;
function installExitHook() {
    if (exitHookInstalled) return;
    exitHookInstalled = true;
    const stop = async ()=>{
        if (!clientPromise) return;
        try {
            const c = await clientPromise;
            await c.stop?.();
        } catch  {
        // ignore
        }
    };
    process.once("beforeExit", stop);
    process.once("SIGINT", ()=>{
        void stop();
    });
    process.once("SIGTERM", ()=>{
        void stop();
    });
}
/**
 * Drop the cached client so the next `getClient()` call respawns it. Called
 * when a request observes the native binding has wedged — releasing the
 * reference lets a fresh TLSClient (and a fresh koffi load) take over without
 * a process restart.
 */ function resetClientCache() {
    clientPromise = null;
}
class TlsClientHangError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientHangError";
    }
}
/**
 * Race a `client.request()` promise against (a) a JS-level hard timeout and
 * (b) the caller's abort signal. The native binding's `timeoutMilliseconds`
 * already covers the wire path; this guards the case where the koffi binding
 * itself deadlocks (observed after sustained load), where neither the
 * binding's own timer nor a post-call `signal.aborted` re-check can recover.
 */ async function raceWithTimeout(promise, timeoutMs, signal) {
    let timer = null;
    let abortListener = null;
    try {
        const racers = [
            promise,
            new Promise((_, reject)=>{
                timer = setTimeout(()=>{
                    reject(new TlsClientHangError(`tls-client-node call exceeded ${timeoutMs}ms — native binding likely deadlocked`));
                }, timeoutMs);
            })
        ];
        if (signal) {
            racers.push(new Promise((_, reject)=>{
                if (signal.aborted) {
                    reject(makeAbortError(signal));
                    return;
                }
                abortListener = ()=>reject(makeAbortError(signal));
                signal.addEventListener("abort", abortListener, {
                    once: true
                });
            }));
        }
        return await Promise.race(racers);
    } finally{
        if (timer) clearTimeout(timer);
        if (signal && abortListener) signal.removeEventListener("abort", abortListener);
    }
}
async function getClient() {
    if (!clientPromise) {
        clientPromise = (async ()=>{
            try {
                const mod = await __turbopack_context__.A("[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node, async loader)");
                const TLSClient = mod.TLSClient;
                // Native mode loads the shared library directly via koffi, avoiding the
                // managed sidecar's localhost HTTP calls that OmniRoute's global fetch
                // proxy patch interferes with.
                const client = new TLSClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildNativeTlsClientOptions"])());
                await client.start();
                installExitHook();
                return client;
            } catch (err) {
                clientPromise = null;
                const msg = err instanceof Error ? err.message : String(err);
                throw new TlsClientUnavailableError(`TLS impersonation client failed to start: ${msg}. ` + `Verify tls-client-node is installed and its native binary downloaded.`);
            }
        })();
    }
    return clientPromise;
}
class TlsClientUnavailableError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientUnavailableError";
    }
}
;
;
/**
 * Resolve the proxy URL for a tls-client request. Per-call value wins;
 * otherwise we use the standard proxy fetch resolution which reads from
 * the dashboard AsyncLocalStorage context or falls back to env vars.
 *
 * Fail-closed: if resolution throws (e.g. a configured socks5 proxy with
 * ENABLE_SOCKS5_PROXY=false), this rethrows rather than returning undefined —
 * undefined would let the native binding connect directly and leak the real IP.
 */ function resolveProxyUrl(perCall) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveTlsClientProxyUrl"])("https://www.perplexity.ai", perCall, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForRequest"]);
}
// Test-only injection point. Tests call __setTlsFetchOverrideForTesting()
// to replace the real TLS client with a mock; production never touches this.
let testOverride = null;
function __setTlsFetchOverrideForTesting(fn) {
    testOverride = fn;
}
async function tlsFetchPerplexity(url, options = {}) {
    if (testOverride) return testOverride(url, options);
    // Honor abort signals up-front. tls-client-node's koffi binding doesn't
    // accept an AbortSignal mid-flight (the binary call is opaque), so the best
    // we can do is bail before issuing the call. We also re-check after — if
    // the caller aborted while the upstream was running, throw rather than
    // returning a stale response so the caller doesn't try to use it.
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const client = await getClient();
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const requestOptions = {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        tlsClientIdentifier: PPLX_PROFILE,
        timeoutMilliseconds: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        followRedirects: true,
        withRandomTLSExtensionOrder: true,
        // Plumb the configured proxy through to the native binding. tls-client-node
        // consults `proxyUrl` in the per-call options (it does NOT auto-pick up
        // HTTP_PROXY / HTTPS_PROXY env), so callers / env have to be threaded in
        // explicitly. See `resolveProxyUrl()` for the lookup order.
        proxyUrl: resolveProxyUrl(options.proxyUrl)
    };
    if (options.stream) {
        return await tlsFetchStreaming(client, url, requestOptions, options.streamEofSymbol, options.signal ?? null, (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS);
    }
    let tlsResponse;
    try {
        tlsResponse = await raceWithTimeout(client.request(url, requestOptions), (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS, options.signal ?? null);
    } catch (err) {
        if (err instanceof TlsClientHangError) {
            // The native binding is wedged — drop the singleton so the next
            // request respawns a fresh client (and a fresh koffi load).
            resetClientCache();
        }
        throw err;
    }
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    return {
        status: tlsResponse.status,
        headers: toHeaders(tlsResponse.headers),
        text: tlsResponse.body,
        body: null
    };
}
function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function toHeaders(raw) {
    const h = new Headers();
    for (const [k, vs] of Object.entries(raw || {})){
        for (const v of vs)h.append(k, v);
    }
    return h;
}
function isCloudflareChallenge(text) {
    if (!text) return false;
    return /just a moment|window\._cf_chl_opt|challenges\.cloudflare\.com|attention required|cf-chl/i.test(text);
}
// ─── Streaming via temp file ────────────────────────────────────────────────
// tls-client-node's streaming primitive writes the response body chunk-by-chunk
// to a file path, terminating when the upstream sends `streamOutputEOFSymbol`.
// We tail the file from a worker and surface the bytes as a ReadableStream.
async function tlsFetchStreaming(client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = DEFAULT_TIMEOUT_MS + HARD_TIMEOUT_GRACE_MS) {
    const dir = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdtemp"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["tmpdir"])(), "pplx-stream-"));
    const path = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dir, `${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}.sse`);
    const streamOpts = {
        ...requestOptions,
        streamOutputPath: path,
        streamOutputBlockSize: 1024,
        streamOutputEOFSymbol: eofSymbol
    };
    // Kick off the request without awaiting — tls-client writes the body to
    // `path` chunk-by-chunk while the call runs. The Promise resolves when the
    // request fully completes (full body written). Wrapping in raceWithTimeout
    // guarantees this promise eventually settles even if the koffi binding
    // wedges; on hang we reset the singleton so the next request respawns.
    let resetOnHang = true;
    const requestPromise = raceWithTimeout(client.request(url, streamOpts), hardTimeoutMs, signal).catch((err)=>{
        if (resetOnHang && err instanceof TlsClientHangError) {
            resetClientCache();
            resetOnHang = false;
        }
        // Re-throw so downstream consumers (waitForContent, tailFile) observe
        // the rejection and surface it instead of treating the stream as having
        // ended cleanly.
        throw err;
    });
    // Wait for the file to exist AND have at least one byte. tls-client-node
    // creates the output file when the request starts, but the file can be
    // empty for a brief window before the first body chunk lands — peeking
    // during that window would return "" and misclassify the response as
    // non-SSE, dropping us into the buffered-wait branch and silently turning
    // a streaming request into a buffered one. Waiting for content avoids
    // that race; if the request actually fails before producing any bytes,
    // the timeout falls through to the requestPromise drain below (returning
    // the real upstream status).
    const ready = await waitForContent(path, 5_000, requestPromise);
    if (!ready) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body,
            body: null
        };
    }
    // Peek the first bytes to decide whether this looks like SSE. Anything
    // that doesn't positively look like SSE (JSON `{...}`, HTML `<...>`, plain
    // text rate-limit messages, Cloudflare challenge pages, etc.) gets surfaced
    // as a non-streaming response so the executor sees the real upstream status
    // and body — otherwise non-2xx error pages get silently treated as 200 OK
    // and the SSE parser produces an empty completion.
    const peek = await readFirstBytes(path, 256);
    if (!looksLikeSse(peek)) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body,
            body: null
        };
    }
    // Looks like SSE — start tailing. SSE bodies in practice are always 2xx;
    // tls-client-node doesn't expose response status separately from full-body
    // completion, so we report 200 and let the SSE parser consume the stream.
    const stream = tailFile(path, eofSymbol, requestPromise, signal);
    const headers = new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
    });
    return {
        status: 200,
        headers,
        text: null,
        body: stream
    };
}
function looksLikeSse(text) {
    const trimmed = text.replace(/^[\s\r\n]+/, "");
    if (!trimmed) return false;
    if (trimmed.startsWith(":")) return true;
    return /^(data|event|id|retry):/i.test(trimmed);
}
async function cleanupTempPath(path) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
    const dir = path.substring(0, path.lastIndexOf("/"));
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
}
async function readFirstBytes(path, n) {
    const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
    try {
        const buf = Buffer.alloc(n);
        const { bytesRead } = await fd.read(buf, 0, n, 0);
        return buf.subarray(0, bytesRead).toString("utf8");
    } finally{
        await fd.close().catch(()=>{});
    }
}
/**
 * Wait for the streaming output file to exist AND contain at least one byte.
 * Returns false if the request settles before any bytes arrive (so the caller
 * can drain `requestPromise` and surface the real upstream status). Returns
 * true as soon as the file has data — even one byte is enough for the SSE
 * heuristic to give a useful answer.
 */ async function waitForContent(path, timeoutMs, requestPromise) {
    let requestSettled = false;
    requestPromise.then(()=>{
        requestSettled = true;
    }, ()=>{
        requestSettled = true;
    });
    const start = Date.now();
    while(Date.now() - start < timeoutMs){
        try {
            const s = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["stat"])(path);
            if (s.size > 0) return true;
        } catch  {
        // file doesn't exist yet
        }
        // If the request finished without producing any bytes, no point waiting
        // out the rest of the timeout — let the caller drain it.
        if (requestSettled) return false;
        await sleep(25);
    }
    return false;
}
function tailFile(path, eofSymbol, done, signal = null) {
    return new ReadableStream({
        async start (controller) {
            const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
            const buf = Buffer.alloc(64 * 1024);
            let offset = 0;
            let finished = false;
            let aborted = false;
            let upstreamError = null;
            // Track request settlement, capturing both fulfillment and rejection.
            // Without the rejection branch, a mid-stream tls-client-node error
            // becomes an unhandledRejection — the stream cleans up silently and
            // the consumer sees what looks like a successful truncated response.
            done.then(()=>{
                finished = true;
            }, (err)=>{
                upstreamError = err instanceof Error ? err : new Error(String(err));
                finished = true;
            });
            // If the caller aborts, stop tailing immediately.
            const onAbort = ()=>{
                aborted = true;
            };
            if (signal) {
                if (signal.aborted) aborted = true;
                else signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
            let errored = false;
            try {
                while(!aborted){
                    const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
                    if (bytesRead > 0) {
                        const chunk = buf.subarray(0, bytesRead);
                        offset += bytesRead;
                        const text = chunk.toString("utf8");
                        if (text.includes(eofSymbol)) {
                            const cutAt = text.indexOf(eofSymbol) + eofSymbol.length;
                            controller.enqueue(new Uint8Array(chunk.subarray(0, cutAt)));
                            break;
                        }
                        controller.enqueue(new Uint8Array(chunk));
                    } else if (finished) {
                        // No more data and request completed. If the request rejected,
                        // surface the error so the consumer doesn't think the stream
                        // ended cleanly.
                        if (upstreamError) {
                            controller.error(upstreamError);
                            errored = true;
                        }
                        break;
                    } else {
                        await sleep(25);
                    }
                }
            } catch (err) {
                controller.error(err);
                errored = true;
            } finally{
                if (signal) signal.removeEventListener("abort", onAbort);
                await fd.close().catch(()=>{});
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
                const dir = path.substring(0, path.lastIndexOf("/"));
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
                if (!errored) controller.close();
            }
        }
    });
}
function sleep(ms) {
    return new Promise((r)=>setTimeout(r, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/grokTlsClient.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "TlsClientHangError",
    ()=>TlsClientHangError,
    "TlsClientUnavailableError",
    ()=>TlsClientUnavailableError,
    "__setTlsFetchOverrideForTesting",
    ()=>__setTlsFetchOverrideForTesting,
    "isCloudflareChallenge",
    ()=>isCloudflareChallenge,
    "tlsFetchGrok",
    ()=>tlsFetchGrok
]);
/**
 * Browser-TLS-impersonating HTTP client for grok.com.
 *
 * Why this exists: Grok sits behind Cloudflare Enterprise which pins
 * `cf_clearance` to the client's TLS fingerprint (JA3/JA4) + HTTP/2 SETTINGS
 * frame ordering. Node's Undici fetch presents an obvious "not a browser"
 * handshake and gets challenged with a 403 "Request rejected by anti-bot
 * rules." — even with a valid `sso` + `sso-rw` session cookie. This module
 * wraps `tls-client-node` (native shared library built from
 * bogdanfinn/tls-client) to send a Chrome handshake instead.
 *
 * Mirrors `perplexityTlsClient.ts`; kept as an independent module so changes
 * here cannot regress the production chatgpt-web / perplexity-web paths.
 * The first call lazily starts the managed sidecar; subsequent calls reuse
 * a singleton TLSClient. Process exit hooks stop the sidecar cleanly.
 *
 * Issue: #3180
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let clientPromise = null;
let exitHookInstalled = false;
const GROK_PROFILE = "chrome_146"; // closest supported wreq-js profile (chrome_149 absent in 2.3.1, #5591)
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.OMNIROUTE_GROK_TLS_TIMEOUT_MS || "", 10) || 60_000;
// Grace period added to the binding's wire-level timeout before our JS-level
// hard timeout fires. Under healthy operation `tls-client-node` honors
// `timeoutMilliseconds` and rejects on its own; the JS-level race only wins
// when the koffi-loaded native library is wedged (which the binding's own
// timer can't escape). Keep the grace small so users don't wait noticeably
// longer than the configured timeout when the binding is dead.
const HARD_TIMEOUT_GRACE_MS = Number.parseInt(process.env.OMNIROUTE_GROK_TLS_GRACE_MS || "", 10) || 10_000;
function installExitHook() {
    if (exitHookInstalled) return;
    exitHookInstalled = true;
    const stop = async ()=>{
        if (clientPromise === null) return;
        try {
            const c = await clientPromise;
            await c.stop?.();
        } catch  {
        // ignore
        }
    };
    process.once("beforeExit", stop);
    process.once("SIGINT", ()=>{
        void stop();
    });
    process.once("SIGTERM", ()=>{
        void stop();
    });
}
/**
 * Drop the cached client so the next `getClient()` call respawns it. Called
 * when a request observes the native binding has wedged — releasing the
 * reference lets a fresh TLSClient (and a fresh koffi load) take over without
 * a process restart.
 */ function resetClientCache() {
    clientPromise = null;
}
class TlsClientHangError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientHangError";
    }
}
/**
 * Race a `client.request()` promise against (a) a JS-level hard timeout and
 * (b) the caller's abort signal. The native binding's `timeoutMilliseconds`
 * already covers the wire path; this guards the case where the koffi binding
 * itself deadlocks (observed after sustained load), where neither the
 * binding's own timer nor a post-call `signal.aborted` re-check can recover.
 */ async function raceWithTimeout(promise, timeoutMs, signal) {
    let timer = null;
    let abortListener = null;
    try {
        const racers = [
            promise,
            new Promise((_, reject)=>{
                timer = setTimeout(()=>{
                    reject(new TlsClientHangError(`tls-client-node call exceeded ${timeoutMs}ms — native binding likely deadlocked`));
                }, timeoutMs);
            })
        ];
        if (signal) {
            racers.push(new Promise((_, reject)=>{
                if (signal.aborted) {
                    reject(makeAbortError(signal));
                    return;
                }
                abortListener = ()=>reject(makeAbortError(signal));
                signal.addEventListener("abort", abortListener, {
                    once: true
                });
            }));
        }
        return await Promise.race(racers);
    } finally{
        if (timer) clearTimeout(timer);
        if (signal && abortListener) signal.removeEventListener("abort", abortListener);
    }
}
async function getClient() {
    if (!clientPromise) {
        clientPromise = (async ()=>{
            try {
                const mod = await __turbopack_context__.A("[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node, async loader)");
                const TLSClient = mod.TLSClient;
                // Native mode loads the shared library directly via koffi, avoiding the
                // managed sidecar's localhost HTTP calls that OmniRoute's global fetch
                // proxy patch interferes with.
                const client = new TLSClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildNativeTlsClientOptions"])());
                await client.start();
                installExitHook();
                return client;
            } catch (err) {
                clientPromise = null;
                const msg = err instanceof Error ? err.message : String(err);
                throw new TlsClientUnavailableError(`TLS impersonation client failed to start: ${msg}. ` + `Verify tls-client-node is installed and its native binary downloaded.`);
            }
        })();
    }
    return clientPromise;
}
class TlsClientUnavailableError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientUnavailableError";
    }
}
;
;
/**
 * Resolve the proxy URL for a tls-client request. Per-call value wins;
 * otherwise we use the standard proxy fetch resolution which reads from
 * the dashboard AsyncLocalStorage context or falls back to env vars.
 *
 * Fail-closed: if resolution throws (e.g. a configured socks5 proxy with
 * ENABLE_SOCKS5_PROXY=false), this rethrows rather than returning undefined —
 * undefined would let the native binding connect directly and leak the real IP.
 */ function resolveProxyUrl(perCall) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveTlsClientProxyUrl"])("https://grok.com", perCall, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForRequest"]);
}
// Test-only injection point. Tests call __setTlsFetchOverrideForTesting()
// to replace the real TLS client with a mock; production never touches this.
let testOverride = null;
function __setTlsFetchOverrideForTesting(fn) {
    testOverride = fn;
}
async function tlsFetchGrok(url, options = {}) {
    if (testOverride) return testOverride(url, options);
    // Honor abort signals up-front. tls-client-node's koffi binding doesn't
    // accept an AbortSignal mid-flight (the binary call is opaque), so the best
    // we can do is bail before issuing the call. We also re-check after — if
    // the caller aborted while the upstream was running, throw rather than
    // returning a stale response so the caller doesn't try to use it.
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const client = await getClient();
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const requestOptions = {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        tlsClientIdentifier: GROK_PROFILE,
        timeoutMilliseconds: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        followRedirects: true,
        withRandomTLSExtensionOrder: true,
        // Plumb the configured proxy through to the native binding. tls-client-node
        // consults `proxyUrl` in the per-call options (it does NOT auto-pick up
        // HTTP_PROXY / HTTPS_PROXY env), so callers / env have to be threaded in
        // explicitly. See `resolveProxyUrl()` for the lookup order.
        proxyUrl: resolveProxyUrl(options.proxyUrl)
    };
    if (options.stream) {
        return await tlsFetchStreaming(client, url, requestOptions, options.streamEofSymbol, options.signal ?? null, (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS);
    }
    let tlsResponse;
    try {
        tlsResponse = await raceWithTimeout(client.request(url, requestOptions), (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS, options.signal ?? null);
    } catch (err) {
        if (err instanceof TlsClientHangError) {
            // The native binding is wedged — drop the singleton so the next
            // request respawns a fresh client (and a fresh koffi load).
            resetClientCache();
        }
        throw err;
    }
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    return {
        status: tlsResponse.status,
        headers: toHeaders(tlsResponse.headers),
        text: tlsResponse.body,
        body: null
    };
}
function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function toHeaders(raw) {
    const h = new Headers();
    for (const [k, vs] of Object.entries(raw || {})){
        for (const v of vs)h.append(k, v);
    }
    return h;
}
function isCloudflareChallenge(text) {
    if (!text) return false;
    return /just a moment|window\._cf_chl_opt|challenges\.cloudflare\.com|attention required|cf-chl/i.test(text);
}
// ─── Streaming via temp file ────────────────────────────────────────────────
// tls-client-node's streaming primitive writes the response body chunk-by-chunk
// to a file path, terminating when the upstream sends `streamOutputEOFSymbol`.
// We tail the file from a worker and surface the bytes as a ReadableStream.
async function tlsFetchStreaming(client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = DEFAULT_TIMEOUT_MS + HARD_TIMEOUT_GRACE_MS) {
    const dir = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdtemp"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["tmpdir"])(), "grok-stream-"));
    const path = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dir, `${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}.ndjson`);
    const streamOpts = {
        ...requestOptions,
        streamOutputPath: path,
        streamOutputBlockSize: 1024,
        streamOutputEOFSymbol: eofSymbol
    };
    // Kick off the request without awaiting — tls-client writes the body to
    // `path` chunk-by-chunk while the call runs. The Promise resolves when the
    // request fully completes (full body written). Wrapping in raceWithTimeout
    // guarantees this promise eventually settles even if the koffi binding
    // wedges; on hang we reset the singleton so the next request respawns.
    let resetOnHang = true;
    const requestPromise = raceWithTimeout(client.request(url, streamOpts), hardTimeoutMs, signal).catch((err)=>{
        if (resetOnHang && err instanceof TlsClientHangError) {
            resetClientCache();
            resetOnHang = false;
        }
        // Re-throw so downstream consumers (waitForContent, tailFile) observe
        // the rejection and surface it instead of treating the stream as having
        // ended cleanly.
        throw err;
    });
    // Wait for the file to exist AND have at least one byte.
    const ready = await waitForContent(path, 5_000, requestPromise);
    if (!ready) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body,
            body: null
        };
    }
    // Peek at the first bytes to distinguish a genuine NDJSON stream from a
    // Cloudflare challenge page or an HTML error response that tls-client-node
    // streamed to the temp file with a 200 status.
    const peek = await readFirstBytes(path, 256);
    if (isCloudflareChallenge(peek)) {
        await cleanupTempPath(path);
        return {
            status: 403,
            headers: new Headers({
                "Content-Type": "text/html"
            }),
            text: peek,
            body: null
        };
    }
    if (peek.trimStart().startsWith("<")) {
        // HTML error page (not a challenge) — surface as a non-2xx so the executor
        // can emit a proper SSE error chunk instead of feeding HTML to the NDJSON
        // parser.
        await cleanupTempPath(path);
        return {
            status: 502,
            headers: new Headers({
                "Content-Type": "text/html"
            }),
            text: peek,
            body: null
        };
    }
    // Looks like NDJSON — start tailing. The requestPromise will eventually
    // resolve with the real upstream status; tailFile propagates non-2xx errors
    // into the stream so the consumer sees them instead of a truncated success.
    const stream = tailFile(path, eofSymbol, requestPromise, signal);
    const headers = new Headers({
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache"
    });
    return {
        status: 200,
        headers,
        text: null,
        body: stream
    };
}
async function cleanupTempPath(path) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(path)).catch(()=>{});
}
async function readFirstBytes(path, n) {
    const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
    try {
        const buf = Buffer.alloc(n);
        const { bytesRead } = await fd.read(buf, 0, n, 0);
        return buf.subarray(0, bytesRead).toString("utf8");
    } finally{
        await fd.close().catch(()=>{});
    }
}
/**
 * Wait for the streaming output file to exist AND contain at least one byte.
 * Returns false if the request settles before any bytes arrive (so the caller
 * can drain `requestPromise` and surface the real upstream status). Returns
 * true as soon as the file has data — even one byte is enough for the NDJSON
 * heuristic to give a useful answer.
 */ async function waitForContent(path, timeoutMs, requestPromise) {
    let requestSettled = false;
    requestPromise.then(()=>{
        requestSettled = true;
    }, ()=>{
        requestSettled = true;
    });
    const start = Date.now();
    while(Date.now() - start < timeoutMs){
        try {
            const s = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["stat"])(path);
            if (s.size > 0) return true;
        } catch  {
        // file doesn't exist yet
        }
        // If the request finished without producing any bytes, no point waiting
        // out the rest of the timeout — let the caller drain it.
        if (requestSettled) return false;
        await sleep(25);
    }
    return false;
}
function tailFile(path, eofSymbol, done, signal = null) {
    return new ReadableStream({
        async start (controller) {
            const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
            const buf = Buffer.alloc(64 * 1024);
            let offset = 0;
            let finished = false;
            let aborted = false;
            let upstreamError = null;
            // Track request settlement, capturing both fulfillment and rejection.
            // Without the rejection branch, a mid-stream tls-client-node error
            // becomes an unhandledRejection — the stream cleans up silently and
            // the consumer sees what looks like a successful truncated response.
            done.then(()=>{
                finished = true;
            }, (err)=>{
                upstreamError = err instanceof Error ? err : new Error(String(err));
                finished = true;
            });
            // If the caller aborts, stop tailing immediately.
            const onAbort = ()=>{
                aborted = true;
            };
            if (signal) {
                if (signal.aborted) aborted = true;
                else signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
            let errored = false;
            try {
                while(!aborted){
                    const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
                    if (bytesRead > 0) {
                        const chunk = buf.subarray(0, bytesRead);
                        offset += bytesRead;
                        const text = chunk.toString("utf8");
                        // Check for EOF symbol in the chunk.
                        if (text.includes(eofSymbol)) {
                            const beforeEof = text.substring(0, text.indexOf(eofSymbol));
                            if (beforeEof) {
                                controller.enqueue(Buffer.from(beforeEof, "utf8"));
                            }
                            controller.close();
                            return;
                        }
                        controller.enqueue(Buffer.from(chunk));
                    }
                    if (finished) {
                        // Request finished — read any remaining bytes then close.
                        while(true){
                            const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
                            if (bytesRead === 0) break;
                            const chunk = buf.subarray(0, bytesRead);
                            offset += bytesRead;
                            const text = chunk.toString("utf8");
                            if (text.includes(eofSymbol)) {
                                const beforeEof = text.substring(0, text.indexOf(eofSymbol));
                                if (beforeEof) {
                                    controller.enqueue(Buffer.from(beforeEof, "utf8"));
                                }
                                controller.close();
                                return;
                            }
                            controller.enqueue(Buffer.from(chunk));
                        }
                        if (upstreamError && !errored) {
                            errored = true;
                            controller.error(upstreamError);
                            return;
                        }
                        controller.close();
                        return;
                    }
                    // No data yet and request still running — brief pause before retry.
                    await sleep(25);
                }
            } catch (err) {
                if (!errored) {
                    errored = true;
                    controller.error(err instanceof Error ? err : new Error(String(err)));
                }
            } finally{
                await fd.close().catch(()=>{});
                await cleanupTempPath(path);
                if (signal) signal.removeEventListener("abort", onAbort);
            }
        }
    });
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/browserPool.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetBrowserPoolMetricsForTest",
    ()=>__resetBrowserPoolMetricsForTest,
    "acquireBrowserContext",
    ()=>acquireBrowserContext,
    "getBrowserPoolMetrics",
    ()=>getBrowserPoolMetrics,
    "getBrowserPoolStatus",
    ()=>getBrowserPoolStatus,
    "openPage",
    ()=>openPage,
    "readPageResponseBody",
    ()=>readPageResponseBody,
    "releaseBrowserContext",
    ()=>releaseBrowserContext,
    "resolveBrowserContextProxy",
    ()=>resolveBrowserContextProxy,
    "resolvePlaywrightProxy",
    ()=>resolvePlaywrightProxy,
    "shutdownPool",
    ()=>shutdownPool
]);
/**
 * browserPool.ts — Shared stealth browser pool for web-cookie providers.
 *
 * The DuckDuckGo VQD challenge and Claude web's Cloudflare Turnstile both
 * validate values that only a real browser can produce (DOM layout
 * measurements like offsetWidth/Height, getBoundingClientRect,
 * getComputedStyle, iframe contentWindow probes). Plain Node fetch + a
 * VM-stubs solver structurally runs the JS but cannot match those values,
 * so the server rejects the request.
 *
 * This pool keeps one Chromium instance warm and serves "browser contexts"
 * (one per caller-defined isolation key) on demand. Each context owns one or more pages; the
 * caller is expected to be polite (one page per request, close on done).
 *
 * The pool prefers `cloakbrowser` (npm) when available — its binary-level
 * fingerprint patches (--fingerprint-timezone, --fingerprint-locale, and
 * dozens more) are the only thing that gets past DuckDuckGo's anti-bot
 * in this environment. Falls back to plain `playwright` if cloakbrowser
 * is not installed; the fallback works for Claude web (which only needs
 * valid cookies) but not for DDG's VQD challenge.
 *
 * Opt-in: pool only launches Chromium when an executor explicitly asks
 * for a context, so users who never use the browser-backed path pay zero
 * startup cost. Set OMNIROUTE_BROWSER_POOL=off to fully disable.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:buffer [external] (node:buffer, cjs)");
;
function createBrowserPoolMetrics() {
    return {
        browserLaunches: 0,
        browserLaunchFailures: 0,
        contextsCreated: 0,
        contextsReused: 0,
        contextsEvicted: 0,
        contextsReleased: 0,
        contextCreateFailures: 0,
        shutdowns: 0,
        lastShutdownReason: null
    };
}
const POOL_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const CONTEXT_TTL_MS = 10 * 60 * 1000; // 10 min — evict stale contexts
const EVICT_INTERVAL_MS = 60 * 1000; // check every 60s
const DEFAULT_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";
const state = {
    browser: null,
    contexts: new Map(),
    pendingContexts: new Map(),
    launching: null,
    lastActivity: 0,
    idleTimer: null,
    evictTimer: null,
    cloakLaunch: null,
    cloakLaunchResolved: false,
    metrics: createBrowserPoolMetrics()
};
function getCloakbrowserModuleId() {
    // Keep this computed: cloakbrowser is an optional runtime enhancer, and a literal
    // dynamic import with the package name makes Turbopack resolve it during route compilation.
    return [
        "cloak",
        "browser"
    ].join("");
}
async function resolveCloakLaunch() {
    if (state.cloakLaunchResolved) return state.cloakLaunch;
    state.cloakLaunchResolved = true;
    try {
        const mod = await Promise.resolve().then(()=>{
            const e = new Error("Cannot find module as expression is too dynamic");
            e.code = 'MODULE_NOT_FOUND';
            throw e;
        });
        state.cloakLaunch = mod.launch ?? null;
    } catch  {
        state.cloakLaunch = null;
    }
    return state.cloakLaunch;
}
function isPoolEnabled() {
    const flag = process.env.OMNIROUTE_BROWSER_POOL;
    if (flag === undefined) return true;
    return flag !== "off" && flag !== "0" && flag !== "false";
}
function resetIdleTimer() {
    if (state.idleTimer) clearTimeout(state.idleTimer);
    state.idleTimer = setTimeout(()=>{
        void shutdownPool("idle-timeout");
    }, POOL_IDLE_TIMEOUT_MS);
    state.idleTimer.unref?.();
}
function evictStaleContexts() {
    const now = Date.now();
    for (const [key, pooled] of state.contexts){
        if (now - pooled.lastUsed > CONTEXT_TTL_MS) {
            console.log("[BrowserPool] Evicted stale context", "(idle", ((now - pooled.lastUsed) / 1000).toFixed(0) + "s)");
            state.contexts.delete(key);
            state.metrics.contextsEvicted++;
            pooled.context.close().catch(()=>{});
        }
    }
    if (state.contexts.size === 0 && !state.launching) {
        void shutdownPool("all-contexts-evicted");
    }
}
function startEvictTimer() {
    if (state.evictTimer) clearInterval(state.evictTimer);
    state.evictTimer = setInterval(()=>evictStaleContexts(), EVICT_INTERVAL_MS);
    state.evictTimer.unref?.();
}
async function resolvePlaywrightProxy(providerKey, deps) {
    try {
        const resolver = deps?.resolveProxy ?? (async (id)=>{
            const { resolveProxyForProvider } = await __turbopack_context__.A("[project]/src/lib/db/proxies.ts [middleware] (ecmascript, async loader)");
            return resolveProxyForProvider(id);
        });
        const p = await resolver(providerKey);
        if (!p?.host) return undefined;
        const scheme = p.type === "socks5" ? "socks5" : "http";
        // Build explicitly instead of a conditional object spread: the spread form
        // widens username/password to `{}` under the LaunchOptions["proxy"] type,
        // tripping typecheck once browserPool.ts is pulled into typecheck-core scope.
        const proxy = {
            server: `${scheme}://${p.host}:${p.port}`
        };
        if (p.username) {
            proxy.username = String(p.username);
            proxy.password = p.password == null ? "" : String(p.password);
        }
        return proxy;
    } catch (err) {
        console.warn("[BrowserPool] Failed to resolve proxy from DB:", err);
        return undefined;
    }
}
async function resolveBrowserContextProxy(contextKey, options, deps) {
    return resolvePlaywrightProxy(options.proxyProviderKey ?? contextKey, deps);
}
async function launchBrowser() {
    if (state.browser) return state.browser;
    if (state.launching) return state.launching;
    state.launching = (async ()=>{
        const cloakLaunch = await resolveCloakLaunch();
        let browser;
        if (cloakLaunch) {
            browser = await cloakLaunch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-dev-shm-usage"
                ]
            });
        } else {
            // Fallback: plain Playwright. Works for Claude web (cookie-only
            // auth) but DDG's VQD challenge will detect this Chromium build.
            const { chromium } = await __turbopack_context__.A("[externals]/playwright [external] (playwright, esm_import, [project]/node_modules/playwright, async loader)");
            browser = await chromium.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-blink-features=AutomationControlled"
                ]
            });
        }
        state.browser = browser;
        state.launching = null;
        state.metrics.browserLaunches++;
        return browser;
    })();
    try {
        return await state.launching;
    } catch (err) {
        state.launching = null;
        state.metrics.browserLaunchFailures++;
        throw err;
    }
}
function parseCookieString(raw, domain) {
    return raw.split(";").map((p)=>p.trim()).filter(Boolean).map((pair)=>{
        const eq = pair.indexOf("=");
        if (eq < 0) return null;
        const name = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        if (!name || !value) return null;
        return {
            name,
            value,
            domain: domain.startsWith(".") ? domain : `.${domain}`,
            path: "/",
            expires: -1,
            httpOnly: false,
            secure: true,
            sameSite: "Lax"
        };
    }).filter(Boolean);
}
// Clear a key from the pending-creation map once its promise settles, counting
// failures. Kept as a leaf helper so acquireBrowserContext stays under the
// function-length ceiling (#3368 PR7 metrics).
function settlePendingContext(key, failed) {
    if (failed) state.metrics.contextCreateFailures++;
    state.pendingContexts.delete(key);
}
async function acquireBrowserContext(key, options) {
    if (!isPoolEnabled()) {
        throw new Error("browserPool: OMNIROUTE_BROWSER_POOL=off — context requested but pool is disabled");
    }
    const existing = state.contexts.get(key);
    if (existing) {
        existing.lastUsed = Date.now();
        state.lastActivity = Date.now();
        state.metrics.contextsReused++;
        resetIdleTimer();
        return existing;
    }
    // Dedup concurrent creations for the same key
    const pending = state.pendingContexts.get(key);
    if (pending) return pending;
    const createPromise = (async ()=>{
        const [browser, proxy] = await Promise.all([
            launchBrowser(),
            resolveBrowserContextProxy(key, options)
        ]);
        const isStealth = state.cloakLaunch !== null;
        const context = await browser.newContext({
            userAgent: options.userAgent || DEFAULT_USER_AGENT,
            locale: options.locale || "en-US",
            timezoneId: options.timezone || "America/New_York",
            viewport: {
                width: 1280,
                height: 800
            },
            ...proxy ? {
                proxy
            } : {}
        });
        if (options.cookieString) {
            const cookies = parseCookieString(options.cookieString, options.cookieDomain);
            if (cookies.length > 0) {
                await context.addCookies(cookies);
            }
        }
        let warmupPage = null;
        if (options.warmupUrl) {
            try {
                warmupPage = await context.newPage();
                await warmupPage.goto(options.warmupUrl, {
                    waitUntil: "domcontentloaded",
                    timeout: 30000
                });
                // Give the warmup a moment for the upstream's status/auth/country
                // JSON endpoints to fire. Without this, the first chat request would
                // pay the warmup cost on the hot path.
                await new Promise((r)=>setTimeout(r, 1500));
            } catch (err) {
                try {
                    await warmupPage?.close();
                } catch  {
                /* ignore */ }
                warmupPage = null;
                void err;
            }
        }
        // Guard: if shutdownPool() ran while we were creating this context,
        // the browser we obtained is now closed. Close our temp context and
        // throw so the caller knows to retry.
        if (state.browser !== browser) {
            await context.close().catch(()=>{});
            if (warmupPage) {
                await warmupPage.close().catch(()=>{});
            }
            throw new Error("Pool shut down during context creation");
        }
        const pooled = {
            id: key,
            context,
            warmupPage,
            lastUsed: Date.now(),
            isStealth
        };
        state.contexts.set(key, pooled);
        state.metrics.contextsCreated++;
        state.lastActivity = Date.now();
        resetIdleTimer();
        startEvictTimer();
        return pooled;
    })();
    state.pendingContexts.set(key, createPromise);
    createPromise.then(()=>settlePendingContext(key, false)).catch(()=>settlePendingContext(key, true));
    return createPromise;
}
async function openPage(pooled) {
    return pooled.context.newPage();
}
async function releaseBrowserContext(key) {
    const pooled = state.contexts.get(key);
    if (!pooled) return;
    state.contexts.delete(key);
    state.metrics.contextsReleased++;
    try {
        await pooled.context.close();
    } catch  {
    /* ignore */ }
    if (state.contexts.size === 0) {
        await shutdownPool("last-context-closed");
    }
}
async function shutdownPool(reason) {
    state.metrics.shutdowns++;
    state.metrics.lastShutdownReason = reason;
    if (state.idleTimer) {
        clearTimeout(state.idleTimer);
        state.idleTimer = null;
    }
    if (state.evictTimer) {
        clearInterval(state.evictTimer);
        state.evictTimer = null;
    }
    state.pendingContexts.clear();
    for (const [key, pooled] of state.contexts){
        try {
            await pooled.context.close();
        } catch  {
        /* ignore */ }
        state.contexts.delete(key);
    }
    if (state.browser) {
        try {
            await state.browser.close();
        } catch  {
        /* ignore */ }
        state.browser = null;
    }
    state.lastActivity = Date.now();
    // Avoid unused-parameter lint: log reason via debug if anyone hooks
    // process.on('exit') and prints state.
    void reason;
}
function getBrowserPoolStatus() {
    return {
        enabled: isPoolEnabled(),
        contexts: state.contexts.size,
        browserRunning: state.browser !== null,
        stealthAvailable: state.cloakLaunch !== null,
        lastActivityAgoMs: state.lastActivity === 0 ? -1 : Date.now() - state.lastActivity
    };
}
function getBrowserPoolMetrics() {
    return {
        status: getBrowserPoolStatus(),
        metrics: {
            ...state.metrics
        }
    };
}
function __resetBrowserPoolMetricsForTest() {
    state.metrics = createBrowserPoolMetrics();
}
async function readPageResponseBody(response) {
    const headers = {};
    for (const [name, value] of Object.entries(response.headers())){
        headers[name] = value;
    }
    const body = await response.body();
    return {
        status: response.status(),
        headers,
        body: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(body)
    };
}
}),
"[project]/open-sse/services/grokClearance.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setGrokClearanceAcquireOverrideForTesting",
    ()=>__setGrokClearanceAcquireOverrideForTesting,
    "acquireFreshGrokClearance",
    ()=>acquireFreshGrokClearance,
    "shouldUseGrokBrowserBacked",
    ()=>shouldUseGrokBrowserBacked
]);
/**
 * grokClearance.ts — gated browser-backed cf_clearance acquisition for
 * grok-web (#8019).
 *
 * grok.com sits behind Cloudflare Enterprise, which pins `cf_clearance` to
 * the client's IP+TLS+UA fingerprint. Pure cookie-replay from
 * `grokTlsClient.ts` (TLS-impersonating fetch) cannot forge a fresh
 * clearance from a datacenter egress that Cloudflare has already flagged —
 * only a real browser solving the challenge natively can mint one bound to
 * that egress's own fingerprint.
 *
 * This module reuses the EXISTING provider-agnostic browser pool
 * (`browserPool.ts`, already live for claude-web + duckduckgo-web) rather
 * than adding a new Turnstile solver — `claudeTurnstileSolver.ts` is
 * claude.ai-specific and does not apply here.
 *
 * Opt-in only: gated behind `OMNIROUTE_BROWSER_POOL` / `WEB_COOKIE_USE_BROWSER`
 * (the same env gate already used by claude-web.ts / duckduckgo-web.ts).
 * With the gate off, `acquireFreshGrokClearance` is never called — the
 * executor stays on the Step-1 `cloudflare_challenge` classification.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/browserPool.ts [middleware] (ecmascript)");
;
const GROK_WARMUP_URL = "https://grok.com/";
const GROK_COOKIE_DOMAIN = ".grok.com";
const GROK_POOL_KEY = "grok-web";
function shouldUseGrokBrowserBacked() {
    const flag = process.env.WEB_COOKIE_USE_BROWSER;
    if (flag === "1" || flag === "true" || flag === "on") return true;
    const poolFlag = process.env.OMNIROUTE_BROWSER_POOL;
    return poolFlag === "on" || poolFlag === "1" || poolFlag === "true";
}
// Test-only injection point — mirrors browserBackedChat.ts's
// __setBrowserBackedChatOverrideForTesting pattern so unit tests can prove
// the gating/wiring without launching a real browser (no chromium in CI).
let acquireOverride = null;
function __setGrokClearanceAcquireOverrideForTesting(fn) {
    acquireOverride = fn;
}
async function readCfClearanceFromContext(pooled) {
    const cookies = await pooled.context.cookies(GROK_WARMUP_URL);
    const match = cookies.find((c)=>c.name === "cf_clearance");
    return match?.value || null;
}
async function acquireViaPool() {
    try {
        const pooled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["acquireBrowserContext"])(GROK_POOL_KEY, {
            cookieDomain: GROK_COOKIE_DOMAIN,
            cookieString: null,
            warmupUrl: GROK_WARMUP_URL
        });
        return await readCfClearanceFromContext(pooled);
    } catch  {
        return null;
    }
}
async function acquireFreshGrokClearance(signal) {
    if (acquireOverride) return acquireOverride(signal);
    try {
        return await acquireViaPool();
    } catch  {
        return null;
    }
}
}),
"[project]/open-sse/services/chatgptTlsClient.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "TlsClientHangError",
    ()=>TlsClientHangError,
    "TlsClientUnavailableError",
    ()=>TlsClientUnavailableError,
    "__setTlsFetchOverrideForTesting",
    ()=>__setTlsFetchOverrideForTesting,
    "__tlsFetchStreamingForTesting",
    ()=>__tlsFetchStreamingForTesting,
    "looksLikeSse",
    ()=>looksLikeSse,
    "tlsFetchChatGpt",
    ()=>tlsFetchChatGpt
]);
/**
 * Browser-TLS-impersonating HTTP client for chatgpt.com.
 *
 * Why this exists: ChatGPT's Cloudflare config pins `cf_clearance` to the
 * client's TLS fingerprint (JA3/JA4) + HTTP/2 SETTINGS frame ordering.
 * Node's Undici fetch presents an obvious "not a browser" handshake and
 * gets challenged with `cf-mitigated: challenge` — even with all the right
 * cookies. This module wraps `tls-client-node` (native shared library
 * built from bogdanfinn/tls-client) to send a Firefox handshake instead.
 *
 * The first call lazily starts the managed sidecar; subsequent calls reuse
 * a singleton TLSClient. Process exit hooks stop the sidecar cleanly.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let clientPromise = null;
let exitHookInstalled = false;
const CHATGPT_PROFILE = "firefox_148"; // matches the Firefox 148 UA we send
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.OMNIROUTE_CHATGPT_TLS_TIMEOUT_MS || "", 10) || 60_000;
// Grace period added to the binding's wire-level timeout before our JS-level
// hard timeout fires. Under healthy operation `tls-client-node` honors
// `timeoutMilliseconds` and rejects on its own; the JS-level race only wins
// when the koffi-loaded native library is wedged (which the binding's own
// timer can't escape). Keep the grace small so users don't wait noticeably
// longer than the configured timeout when the binding is dead.
const HARD_TIMEOUT_GRACE_MS = Number.parseInt(process.env.OMNIROUTE_CHATGPT_TLS_GRACE_MS || "", 10) || 10_000;
const STREAM_FIRST_BYTE_TIMEOUT_MS = Number.parseInt(process.env.OMNIROUTE_CHATGPT_STREAM_FIRST_BYTE_TIMEOUT_MS || "", 10) || 30_000;
function installExitHook() {
    if (exitHookInstalled) return;
    exitHookInstalled = true;
    const stop = async ()=>{
        if (!clientPromise) return;
        try {
            const c = await clientPromise;
            await c.stop?.();
        } catch  {
        // ignore
        }
    };
    process.once("beforeExit", stop);
    process.once("SIGINT", ()=>{
        void stop();
    });
    process.once("SIGTERM", ()=>{
        void stop();
    });
}
/**
 * Drop the cached client so the next `getClient()` call respawns it. Called
 * when a request observes the native binding has wedged — releasing the
 * reference lets a fresh TLSClient (and a fresh koffi load) take over without
 * a process restart.
 */ function resetClientCache() {
    clientPromise = null;
}
class TlsClientHangError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientHangError";
    }
}
/**
 * Race a `client.request()` promise against (a) a JS-level hard timeout and
 * (b) the caller's abort signal. The native binding's `timeoutMilliseconds`
 * already covers the wire path; this guards the case where the koffi binding
 * itself deadlocks (observed after sustained load), where neither the
 * binding's own timer nor a post-call `signal.aborted` re-check can recover.
 */ async function raceWithTimeout(promise, timeoutMs, signal) {
    let timer = null;
    let abortListener = null;
    try {
        const racers = [
            promise,
            new Promise((_, reject)=>{
                timer = setTimeout(()=>{
                    reject(new TlsClientHangError(`tls-client-node call exceeded ${timeoutMs}ms — native binding likely deadlocked`));
                }, timeoutMs);
            })
        ];
        if (signal) {
            racers.push(new Promise((_, reject)=>{
                if (signal.aborted) {
                    reject(makeAbortError(signal));
                    return;
                }
                abortListener = ()=>reject(makeAbortError(signal));
                signal.addEventListener("abort", abortListener, {
                    once: true
                });
            }));
        }
        return await Promise.race(racers);
    } finally{
        if (timer) clearTimeout(timer);
        if (signal && abortListener) signal.removeEventListener("abort", abortListener);
    }
}
async function getClient() {
    if (!clientPromise) {
        clientPromise = (async ()=>{
            try {
                const mod = await __turbopack_context__.A("[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node, async loader)");
                const TLSClient = mod.TLSClient;
                // Native mode loads the shared library directly via koffi, avoiding the
                // managed sidecar's localhost HTTP calls that OmniRoute's global fetch
                // proxy patch interferes with.
                const client = new TLSClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildNativeTlsClientOptions"])());
                await client.start();
                installExitHook();
                return client;
            } catch (err) {
                clientPromise = null;
                const msg = err instanceof Error ? err.message : String(err);
                throw new TlsClientUnavailableError(`TLS impersonation client failed to start: ${msg}. ` + `Verify tls-client-node is installed and its native binary downloaded.`);
            }
        })();
    }
    return clientPromise;
}
class TlsClientUnavailableError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientUnavailableError";
    }
}
;
;
/**
 * Resolve the proxy URL for a tls-client request. Per-call value wins;
 * otherwise we use the standard proxy fetch resolution which reads from
 * the dashboard AsyncLocalStorage context or falls back to env vars.
 *
 * Fail-closed: if resolution throws (e.g. a configured socks5 proxy with
 * ENABLE_SOCKS5_PROXY=false), this rethrows rather than returning undefined —
 * undefined would let the native binding connect directly and leak the real IP.
 */ function resolveProxyUrl(perCall) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveTlsClientProxyUrl"])("https://chatgpt.com", perCall, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForRequest"]);
}
// Test-only injection point. Tests call __setTlsFetchOverrideForTesting()
// to replace the real TLS client with a mock; production never touches this.
let testOverride = null;
function __setTlsFetchOverrideForTesting(fn) {
    testOverride = fn;
}
async function tlsFetchChatGpt(url, options = {}) {
    if (testOverride) return testOverride(url, options);
    // Honor abort signals up-front. tls-client-node's koffi binding doesn't
    // accept an AbortSignal mid-flight (the binary call is opaque), so the best
    // we can do is bail before issuing the call. We also re-check after — if
    // the caller aborted while the upstream was running, throw rather than
    // returning a stale response so the caller doesn't try to use it.
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const client = await getClient();
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const requestOptions = {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        tlsClientIdentifier: CHATGPT_PROFILE,
        timeoutMilliseconds: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        followRedirects: true,
        withRandomTLSExtensionOrder: true,
        isByteResponse: options.byteResponse === true,
        // Plumb the configured proxy through to the native binding. tls-client-node
        // consults `proxyUrl` in the per-call options (it does NOT auto-pick up
        // HTTP_PROXY / HTTPS_PROXY env), so callers / env have to be threaded in
        // explicitly. See `resolveProxyUrl()` for the lookup order. Without this
        // line, every chatgpt-web call egresses with the bare host IP regardless
        // of dashboard proxy config — see #2022.
        proxyUrl: resolveProxyUrl(options.proxyUrl)
    };
    if (options.stream) {
        return await tlsFetchStreaming(client, url, requestOptions, options.streamEofSymbol, options.signal ?? null, (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS, STREAM_FIRST_BYTE_TIMEOUT_MS);
    }
    let tlsResponse;
    try {
        tlsResponse = await raceWithTimeout(client.request(url, requestOptions), (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS, options.signal ?? null);
    } catch (err) {
        if (err instanceof TlsClientHangError) {
            // The native binding is wedged — drop the singleton so the next
            // request respawns a fresh client (and a fresh koffi load).
            resetClientCache();
        }
        throw err;
    }
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    return {
        status: tlsResponse.status,
        headers: toHeaders(tlsResponse.headers),
        text: tlsResponse.body,
        body: null
    };
}
function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function toHeaders(raw) {
    const h = new Headers();
    for (const [k, vs] of Object.entries(raw || {})){
        for (const v of vs)h.append(k, v);
    }
    return h;
}
// ─── Streaming via temp file ────────────────────────────────────────────────
// tls-client-node's streaming primitive writes the response body chunk-by-chunk
// to a file path, terminating when the upstream sends `streamOutputEOFSymbol`.
// We tail the file from a worker and surface the bytes as a ReadableStream.
async function tlsFetchStreaming(client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = DEFAULT_TIMEOUT_MS + HARD_TIMEOUT_GRACE_MS, firstByteTimeoutMs = STREAM_FIRST_BYTE_TIMEOUT_MS) {
    const dir = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdtemp"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["tmpdir"])(), "cgpt-stream-"));
    const path = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dir, `${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}.sse`);
    const streamOpts = {
        ...requestOptions,
        streamOutputPath: path,
        streamOutputBlockSize: 1024,
        streamOutputEOFSymbol: eofSymbol
    };
    // Kick off the request without awaiting — tls-client writes the body to
    // `path` chunk-by-chunk while the call runs. The Promise resolves when the
    // request fully completes (full body written). Wrapping in raceWithTimeout
    // guarantees this promise eventually settles even if the koffi binding
    // wedges; on hang we reset the singleton so the next request respawns.
    let resetOnHang = true;
    const requestPromise = raceWithTimeout(client.request(url, streamOpts), hardTimeoutMs, signal).catch((err)=>{
        if (resetOnHang && err instanceof TlsClientHangError) {
            resetClientCache();
            resetOnHang = false;
        }
        // Re-throw so downstream consumers (waitForContent, tailFile) observe
        // the rejection and surface it instead of treating the stream as having
        // ended cleanly.
        throw err;
    });
    // Wait for the file to exist AND have at least one byte. tls-client-node
    // creates the output file when the request starts, but the file can be
    // empty for a brief window before the first body chunk lands — peeking
    // during that window would return "" and misclassify the response as
    // non-SSE, dropping us into the buffered-wait branch and silently turning
    // a streaming request into a buffered one. Waiting for content avoids
    // that race; if the request actually fails before producing any bytes,
    // the timeout falls through to the requestPromise drain below (returning
    // the real upstream status).
    const ready = await waitForContent(path, firstByteTimeoutMs, requestPromise);
    if (!ready) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        // If the first byte arrived after our first-byte wait but before the
        // request settled, tls-client-node may have written the full SSE body to
        // streamOutputPath while leaving r.body empty. Prefer those captured bytes
        // over misclassifying a successful delayed stream as "empty response body".
        const fileText = await readTextFileIfExists(path);
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: fileText || r.body,
            body: null
        };
    }
    // Peek the first bytes to decide whether this looks like SSE. Anything
    // that doesn't positively look like SSE (JSON `{...}`, HTML `<...>`, plain
    // text rate-limit messages, Cloudflare challenge pages, etc.) gets surfaced
    // as a non-streaming response so the executor sees the real upstream status
    // and body — otherwise non-2xx error pages get silently treated as 200 OK
    // and the SSE parser produces an empty completion.
    const peek = await readFirstBytes(path, 256);
    if (!looksLikeSse(peek)) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        const fileText = await readTextFileIfExists(path);
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body || fileText,
            body: null
        };
    }
    // Looks like SSE — start tailing. SSE bodies in practice are always 2xx;
    // tls-client-node doesn't expose response status separately from full-body
    // completion, so we report 200 and let the SSE parser consume the stream.
    const stream = tailFile(path, eofSymbol, requestPromise, signal);
    const headers = new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
    });
    return {
        status: 200,
        headers,
        text: null,
        body: stream
    };
}
function looksLikeSse(text) {
    const trimmed = text.replace(/^[\s\r\n]+/, "");
    if (!trimmed) return false;
    if (trimmed.startsWith(":")) return true;
    return /^(data|event|id|retry):/i.test(trimmed);
}
async function cleanupTempPath(path) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
    const dir = path.substring(0, path.lastIndexOf("/"));
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
}
async function readTextFileIfExists(path) {
    try {
        return await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(path, "utf8");
    } catch  {
        return "";
    }
}
async function __tlsFetchStreamingForTesting(client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = DEFAULT_TIMEOUT_MS + HARD_TIMEOUT_GRACE_MS, firstByteTimeoutMs = STREAM_FIRST_BYTE_TIMEOUT_MS) {
    return tlsFetchStreaming(client, url, requestOptions, eofSymbol, signal, hardTimeoutMs, firstByteTimeoutMs);
}
async function readFirstBytes(path, n) {
    const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
    try {
        const buf = Buffer.alloc(n);
        const { bytesRead } = await fd.read(buf, 0, n, 0);
        return buf.subarray(0, bytesRead).toString("utf8");
    } finally{
        await fd.close().catch(()=>{});
    }
}
/**
 * Wait for the streaming output file to exist AND contain at least one byte.
 * Returns false if the request settles before any bytes arrive (so the caller
 * can drain `requestPromise` and surface the real upstream status). Returns
 * true as soon as the file has data — even one byte is enough for the SSE
 * heuristic to give a useful answer.
 */ async function waitForContent(path, timeoutMs, requestPromise) {
    let requestSettled = false;
    requestPromise.then(()=>{
        requestSettled = true;
    }, ()=>{
        requestSettled = true;
    });
    const start = Date.now();
    while(Date.now() - start < timeoutMs){
        try {
            const s = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["stat"])(path);
            if (s.size > 0) return true;
        } catch  {
        // file doesn't exist yet
        }
        // If the request finished without producing any bytes, no point waiting
        // out the rest of the timeout — let the caller drain it.
        if (requestSettled) return false;
        await sleep(25);
    }
    return false;
}
function tailFile(path, eofSymbol, done, signal = null) {
    return new ReadableStream({
        async start (controller) {
            const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
            const buf = Buffer.alloc(64 * 1024);
            let offset = 0;
            let finished = false;
            let aborted = false;
            let upstreamError = null;
            // Track request settlement, capturing both fulfillment and rejection.
            // Without the rejection branch, a mid-stream tls-client-node error
            // becomes an unhandledRejection — the stream cleans up silently and
            // the consumer sees what looks like a successful truncated response.
            done.then(()=>{
                finished = true;
            }, (err)=>{
                upstreamError = err instanceof Error ? err : new Error(String(err));
                finished = true;
            });
            // If the caller aborts, stop tailing immediately.
            const onAbort = ()=>{
                aborted = true;
            };
            if (signal) {
                if (signal.aborted) aborted = true;
                else signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
            let errored = false;
            try {
                while(!aborted){
                    const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
                    if (bytesRead > 0) {
                        const chunk = buf.subarray(0, bytesRead);
                        offset += bytesRead;
                        const text = chunk.toString("utf8");
                        if (text.includes(eofSymbol)) {
                            const cutAt = text.indexOf(eofSymbol) + eofSymbol.length;
                            controller.enqueue(new Uint8Array(chunk.subarray(0, cutAt)));
                            break;
                        }
                        controller.enqueue(new Uint8Array(chunk));
                    } else if (finished) {
                        // No more data and request completed. If the request rejected,
                        // surface the error so the consumer doesn't think the stream
                        // ended cleanly.
                        if (upstreamError) {
                            controller.error(upstreamError);
                            errored = true;
                        }
                        break;
                    } else {
                        await sleep(25);
                    }
                }
            } catch (err) {
                controller.error(err);
                errored = true;
            } finally{
                if (signal) signal.removeEventListener("abort", onAbort);
                await fd.close().catch(()=>{});
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
                const dir = path.substring(0, path.lastIndexOf("/"));
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
                if (!errored) controller.close();
            }
        }
    });
}
function sleep(ms) {
    return new Promise((r)=>setTimeout(r, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/chatgptImageCache.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__getChatGptImageCacheBytesForTesting",
    ()=>__getChatGptImageCacheBytesForTesting,
    "__resetChatGptImageCacheForTesting",
    ()=>__resetChatGptImageCacheForTesting,
    "findChatGptImageBySha256",
    ()=>findChatGptImageBySha256,
    "getChatGptImage",
    ()=>getChatGptImage,
    "getChatGptImageConversationContext",
    ()=>getChatGptImageConversationContext,
    "storeChatGptImage",
    ()=>storeChatGptImage
]);
/**
 * In-memory cache for ChatGPT-generated images so we can serve them via a
 * regular HTTP URL instead of inlining megabytes of base64 into SSE deltas.
 *
 * Why: chatgpt.com's `image_asset_pointer` resolves to a session-signed
 * `estuary/content` URL that 403s for any anonymous client. We have to
 * download the bytes server-side (with the user's session) and re-serve
 * them. Streaming the raw base64 back through SSE works but Open WebUI's
 * progressive markdown renderer displays each chunk as text mid-stream —
 * the user sees ~3 MB of base64 scroll past before the final `)` arrives
 * and the renderer recognizes it as an image. Hosting the image on a
 * regular URL avoids that entirely: we emit a tiny `![image](http://...)`
 * markdown delta and the browser fetches the image normally.
 *
 * The cache is in-memory only, with a short TTL — these URLs are single-use
 * artifacts of one chat turn, not persistent assets. If the user reloads
 * the conversation in a few hours the URLs will 404; that's expected.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const cache = new Map();
let cacheBytes = 0;
const DEFAULT_TTL_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 25;
// Per-entry images cap at 8 MB (enforced upstream in the executor) so 10 MB
// covers ~1 large image. The byte cap matters more than entry count: a hot
// loop of 8 MB images would otherwise pin 1.6 GB of RSS before count
// eviction kicked in. Tune via OMNIROUTE_CGPT_WEB_IMAGE_CACHE_MAX_MB.
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
function configuredMaxBytes() {
    const raw = Number(process.env.OMNIROUTE_CGPT_WEB_IMAGE_CACHE_MAX_MB);
    if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_MAX_BYTES;
    return Math.floor(raw * 1024 * 1024);
}
function deleteEntry(id) {
    const entry = cache.get(id);
    if (!entry) return;
    cacheBytes -= entry.bytes.length;
    cache.delete(id);
}
function evictExpired(now = Date.now()) {
    for (const [id, entry] of cache){
        if (now >= entry.expiresAt) deleteEntry(id);
    }
}
function evictUntilWithinLimits(maxBytes, incomingBytes) {
    // Drop oldest until both the entry-count and total-byte caps are satisfied.
    // Map iteration is insertion-ordered so the first key is the oldest entry.
    while((cache.size >= MAX_ENTRIES || cacheBytes + incomingBytes > maxBytes) && cache.size > 0){
        const firstKey = cache.keys().next().value;
        if (!firstKey) break;
        deleteEntry(firstKey);
    }
}
function storeChatGptImage(bytes, mime, ttlMs = DEFAULT_TTL_MS, context) {
    evictExpired();
    evictUntilWithinLimits(configuredMaxBytes(), bytes.length);
    const id = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "");
    const bytesSha256 = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(bytes).digest("hex");
    cache.set(id, {
        bytes,
        mime,
        expiresAt: Date.now() + ttlMs,
        context,
        bytesSha256
    });
    cacheBytes += bytes.length;
    return id;
}
function getChatGptImage(id) {
    evictExpired();
    const entry = cache.get(id);
    if (!entry) return null;
    if (Date.now() >= entry.expiresAt) {
        deleteEntry(id);
        return null;
    }
    return entry;
}
function getChatGptImageConversationContext(id) {
    return getChatGptImage(id)?.context ?? null;
}
function findChatGptImageBySha256(hash) {
    evictExpired();
    const target = hash.toLowerCase();
    for (const [id, entry] of cache.entries()){
        if (entry.bytesSha256 === target) {
            if (Date.now() < entry.expiresAt) return {
                id,
                entry
            };
            deleteEntry(id);
        }
    }
    return null;
}
function __resetChatGptImageCacheForTesting() {
    cache.clear();
    cacheBytes = 0;
}
function __getChatGptImageCacheBytesForTesting() {
    return cacheBytes;
}
}),
"[project]/open-sse/services/httpBackedChatFingerprint.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveHttpBackedChatFingerprint",
    ()=>resolveHttpBackedChatFingerprint
]);
/**
 * Header fingerprint resolution for `httpBackedChat()`.
 *
 * claude.ai MUST reuse the exact fingerprint the Turnstile solver used to
 * mint `cf_clearance` (see `open-sse/config/claudeWebFingerprint.ts`) —
 * otherwise Cloudflare rejects the replayed cookie and every request 429s
 * (#7548). Other `httpBackedChat` callers (e.g. duckduckgo-web) keep their
 * own independent fingerprint, which never needs to match a solved cookie.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeWebFingerprint$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/claudeWebFingerprint.ts [middleware] (ecmascript)");
;
const DUCKDUCKGO_FALLBACK_FINGERPRINT = {
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    secChUa: '"Chromium";v="149", "Google Chrome";v="149", "Not-A.Brand";v="99"',
    secChUaPlatform: '"macOS"'
};
function resolveHttpBackedChatFingerprint(chatUrlMatchDomain) {
    return chatUrlMatchDomain === "claude.ai" ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$claudeWebFingerprint$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["CLAUDE_WEB_FINGERPRINT"] : DUCKDUCKGO_FALLBACK_FINGERPRINT;
}
}),
"[project]/open-sse/services/browserBackedChat.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetBrowserBackedChatOverrideForTesting",
    ()=>__resetBrowserBackedChatOverrideForTesting,
    "__resetHttpBackedChatOverrideForTesting",
    ()=>__resetHttpBackedChatOverrideForTesting,
    "__setBrowserBackedChatOverrideForTesting",
    ()=>__setBrowserBackedChatOverrideForTesting,
    "__setHttpBackedChatOverrideForTesting",
    ()=>__setHttpBackedChatOverrideForTesting,
    "browserBackedChat",
    ()=>browserBackedChat,
    "chatUrlMatcher",
    ()=>chatUrlMatcher,
    "httpBackedChat",
    ()=>httpBackedChat,
    "tryBackedChat",
    ()=>tryBackedChat
]);
/**
 * browserBackedChat.ts — Provider-agnostic browser-backed chat helper.
 *
 * Opens a page on a shared browser context, navigates to the provider's
 * chat page, types the user's message, clicks Send, and returns the
 * upstream SSE/JSON response body as a Node Response.
 *
 * Used by duckduckgo-web and claude-web executors when
 * OMNIROUTE_BROWSER_POOL=on (or WEB_COOKIE_USE_BROWSER=1) is set and
 * the user wants guaranteed live working from this environment, even at
 * the cost of 5-15s of browser navigation overhead per request.
 *
 * The browser solves the provider's challenge natively (VQD, Cloudflare
 * Turnstile, etc.) by computing real DOM measurement values. The
 * Node-side challenge solver in duckduckgo-web.ts still runs as a
 * first-line best-effort; this module is the fallback.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:buffer [external] (node:buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/browserPool.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$tlsClient$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/tlsClient.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$httpBackedChatFingerprint$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/httpBackedChatFingerprint.ts [middleware] (ecmascript)");
;
;
;
;
;
// Safety constants
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024; // 10 MB
const COOKIE_CACHE_TTL_MS = 5 * 60 * 1000; // Cache fresh cookies for 5 minutes
const COOKIE_POLL_INTERVAL_MS = 500; // Poll for cookies every 500ms
const COOKIE_POLL_TIMEOUT_MS = 5000; // Max poll time for cookies
const CIRCUIT_BASE_COOLDOWN_MS = 30_000; // 30s base cooldown
const CIRCUIT_MAX_COOLDOWN_MS = 600_000; // 10 min max cooldown
const cookieCache = new Map();
function getCachedCookies(domain) {
    const cached = cookieCache.get(domain);
    if (cached && Date.now() < cached.expiresAt) return cached.cookieString;
    cookieCache.delete(domain);
    return null;
}
function setCachedCookies(domain, cookieString, ttlMs) {
    cookieCache.set(domain, {
        cookieString,
        expiresAt: Date.now() + (ttlMs ?? COOKIE_CACHE_TTL_MS),
        domain
    });
}
// Dedup pending cookie refreshes per pool key
const pendingRefreshes = new Map();
// Test-only injection point. Tests call __setBrowserBackedChatOverrideForTesting()
// to replace the real browser-backed chat with a mock; production never touches this.
let testOverride = null;
let httpOverride = null;
function __setBrowserBackedChatOverrideForTesting(fn) {
    testOverride = fn;
}
function __resetBrowserBackedChatOverrideForTesting() {
    testOverride = null;
    cookieCache.clear();
}
function __setHttpBackedChatOverrideForTesting(fn) {
    httpOverride = fn;
}
function __resetHttpBackedChatOverrideForTesting() {
    httpOverride = null;
    cookieCache.clear();
}
// Helper to make Playwright waitForTimeout abortable via AbortSignal
function waitWithSignal(ms, signal) {
    return new Promise((resolve, reject)=>{
        if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
        const onAbort = ()=>{
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
        };
        const timer = setTimeout(()=>{
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        signal?.addEventListener("abort", onAbort, {
            once: true
        });
    }).catch((err)=>{
        if (err instanceof DOMException && err.name === "AbortError") throw err;
    });
}
async function settlePoolKey(requestedKey, reuseContext) {
    if (reuseContext) return {
        key: requestedKey,
        acquired: true
    };
    // Use a unique key per non-reuse call so the pool always creates a
    // fresh context. Slower but isolates state.
    return {
        key: `${requestedKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        acquired: false
    };
}
function chatUrlMatcher(u, matchDomain, chatUrl) {
    if (u === chatUrl) return true;
    let parsed;
    let chatParsed;
    try {
        parsed = new URL(u);
        chatParsed = new URL(chatUrl);
    } catch  {
        return false;
    }
    if (!parsed.host.endsWith(matchDomain)) return false;
    const chatSeg = chatParsed.pathname.split("/").filter(Boolean);
    const reqSeg = parsed.pathname.split("/").filter(Boolean);
    if (chatSeg.length < 2 || reqSeg.length !== chatSeg.length) return false;
    // All segments except the PLACEHOLDER segment must match.
    let allowedDynamic = 1;
    for(let i = 0; i < chatSeg.length; i++){
        if (chatSeg[i] === reqSeg[i]) continue;
        if (chatSeg[i] === "PLACEHOLDER" && allowedDynamic > 0) {
            allowedDynamic--;
            continue;
        }
        return false;
    }
    return true;
}
async function browserBackedChat(req) {
    if (testOverride) return testOverride(req);
    const t0 = Date.now();
    const { poolKey, chatUrl, chatPageUrl, userMessage, cookieString, cookieDomain, chatUrlMatchDomain, userAgent, locale, timezone, inputSelector, submitButtonSelector, postSubmitWaitMs = 15000, signal, reuseContext = true } = req;
    const { key, acquired: reuseAcquired } = await settlePoolKey(poolKey, reuseContext);
    const tAcquireStart = Date.now();
    const pooled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["acquireBrowserContext"])(key, {
        cookieDomain: cookieDomain || chatUrlMatchDomain,
        cookieString: cookieString || null,
        warmupUrl: chatPageUrl,
        userAgent,
        locale,
        timezone
    });
    const acquireContextMs = Date.now() - tAcquireStart;
    const page = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["openPage"])(pooled);
    try {
        const tNavStart = Date.now();
        await page.goto(chatPageUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
            signal: signal ?? undefined
        });
        await waitWithSignal(2500, signal);
        const navigateMs = Date.now() - tNavStart;
        const inputLocator = page.locator(inputSelector).first();
        await inputLocator.waitFor({
            state: "visible",
            timeout: 10000,
            signal: signal ?? undefined
        });
        await inputLocator.fill(userMessage);
        await waitWithSignal(800, signal);
        const tSubmitStart = Date.now();
        const responsePromise = page.waitForResponse((r)=>r.request().method() === "POST" && chatUrlMatcher(r.url(), chatUrlMatchDomain, chatUrl), {
            timeout: 30000
        });
        // Wire signal to responsePromise via Promise.race
        let abortListener;
        const signalPromise = signal ? new Promise((_, reject)=>{
            if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
            abortListener = ()=>reject(new DOMException("Aborted", "AbortError"));
            signal.addEventListener("abort", abortListener, {
                once: true
            });
        }) : null;
        if (submitButtonSelector) {
            const btn = page.locator(submitButtonSelector).first();
            if (await btn.count() > 0) {
                try {
                    await btn.click({
                        timeout: 2000
                    });
                } catch  {
                    await page.keyboard.press("Enter");
                }
            } else {
                await page.keyboard.press("Enter");
            }
        } else {
            await page.keyboard.press("Enter");
        }
        const tCaptureStart = Date.now();
        const response = signalPromise ? await Promise.race([
            responsePromise,
            signalPromise
        ]).catch(()=>null) : await responsePromise.catch(()=>null);
        if (signal && abortListener) {
            signal.removeEventListener("abort", abortListener);
        }
        if (response) {
            // Wait for the upstream SSE to finish streaming
            await waitWithSignal(Math.min(postSubmitWaitMs, 30000), signal);
        } else {
            await waitWithSignal(postSubmitWaitMs, signal);
        }
        const captureResponseMs = Date.now() - tCaptureStart;
        const submitMs = captureResponseMs;
        let status = 0;
        let contentType = null;
        let body = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].alloc(0);
        if (response) {
            const captured = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["readPageResponseBody"])(response);
            // OOM guard: reject responses larger than MAX_RESPONSE_BYTES
            if (captured.body.length > MAX_RESPONSE_BYTES) {
                body = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(JSON.stringify({
                    error: {
                        message: "Response too large",
                        type: "upstream_error"
                    }
                }));
                status = 502;
                contentType = "application/json";
            } else {
                status = captured.status;
                contentType = captured.headers["content-type"] || null;
                body = captured.body;
            }
        }
        return {
            status,
            contentType,
            body,
            isStealth: pooled.isStealth,
            timing: {
                acquireContextMs,
                navigateMs,
                submitMs,
                captureResponseMs,
                totalMs: Date.now() - t0
            }
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Emit a structured JSON error so the executor can wrap it.
        const body = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(JSON.stringify({
            error: {
                message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`browserBackedChat failed: ${msg}`),
                type: "upstream_error"
            }
        }));
        return {
            status: 502,
            contentType: "application/json",
            body,
            isStealth: pooled.isStealth,
            timing: {
                acquireContextMs,
                navigateMs: 0,
                submitMs: 0,
                captureResponseMs: 0,
                totalMs: Date.now() - t0
            }
        };
    } finally{
        await page.close();
        if (!reuseAcquired) {
            // Non-reused contexts are uniquely keyed. Close the page's context
            // so we don't leak Chromium resources for one-shot calls.
            try {
                await pooled.context.close();
            } catch  {
            /* ignore */ }
        }
    }
}
async function httpBackedChat(req) {
    if (httpOverride) return httpOverride(req);
    const t0 = Date.now();
    const { chatUrl, userMessage, cookieString, cookieDomain, chatUrlMatchDomain, signal } = req;
    const fingerprint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$httpBackedChatFingerprint$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveHttpBackedChatFingerprint"])(chatUrlMatchDomain); // #7548
    // Build browser-emulated headers
    const headers = {
        "User-Agent": fingerprint.userAgent,
        Accept: "text/event-stream, application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/json",
        Origin: chatUrlMatchDomain === "duckduckgo.com" ? "https://duckduckgo.com" : `https://${chatUrlMatchDomain}`,
        Referer: chatUrlMatchDomain === "duckduckgo.com" ? "https://duckduckgo.com/" : `https://${chatUrlMatchDomain}/`,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Ch-Ua": fingerprint.secChUa,
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": fingerprint.secChUaPlatform,
        Priority: "u=1, i"
    };
    // Inject cookie if provided
    if (cookieString) {
        headers["Cookie"] = cookieString;
    }
    // Build provider-specific request body
    let body;
    const parsedUrl = new URL(chatUrl);
    if (parsedUrl.hostname.includes("duckduckgo")) {
        body = JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: userMessage
                }
            ]
        });
    } else {
        // Default: send as OpenAI-style or as raw text based on endpoint
        body = JSON.stringify({
            messages: [
                {
                    role: "user",
                    content: userMessage
                }
            ]
        });
    }
    try {
        const fetchStart = Date.now();
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$tlsClient$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["default"].available) {
            return {
                status: 501,
                contentType: "application/json",
                body: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(JSON.stringify({
                    error: {
                        message: "httpBackedChat unavailable: wreq-js (TLS client) not installed",
                        type: "configuration_error"
                    }
                })),
                isStealth: false,
                timing: {
                    acquireContextMs: 0,
                    navigateMs: 0,
                    submitMs: Date.now() - t0,
                    captureResponseMs: 0,
                    totalMs: Date.now() - t0
                }
            };
        }
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$tlsClient$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["default"].fetch(chatUrl, {
            method: "POST",
            headers,
            body,
            signal: signal ?? undefined
        });
        const fetchMs = Date.now() - fetchStart;
        // OOM guard: check content-length before reading body
        const contentLengthHeader = response.headers.get("content-length");
        if (contentLengthHeader) {
            const contentLength = parseInt(contentLengthHeader, 10);
            if (contentLength > MAX_RESPONSE_BYTES) {
                throw new Error("Response too large");
            }
        }
        const responseBody = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(await response.text());
        const responseStatus = response.status;
        const contentType = response.headers.get("content-type") || "text/event-stream";
        return {
            status: responseStatus,
            contentType,
            body: responseBody,
            isStealth: true,
            timing: {
                acquireContextMs: 0,
                navigateMs: 0,
                submitMs: fetchMs,
                captureResponseMs: 0,
                totalMs: Date.now() - t0
            }
        };
    } catch (err) {
        // Let AbortError propagate — tryBackedChat handles it, returns 504
        if (err instanceof DOMException && err.name === "AbortError") throw err;
        const msg = err instanceof Error ? err.message : String(err);
        const body = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(JSON.stringify({
            error: {
                message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`httpBackedChat failed: ${msg}`),
                type: "upstream_error"
            }
        }));
        return {
            status: 502,
            contentType: "application/json",
            body,
            isStealth: true,
            timing: {
                acquireContextMs: 0,
                navigateMs: 0,
                submitMs: 0,
                captureResponseMs: 0,
                totalMs: Date.now() - t0
            }
        };
    }
}
/**
 * waitForCookiesWithPolling — Poll for cookies every 500ms up to 5s.
 * Returns as soon as challenge cookies appear, instead of always
 * waiting the full timeout. Saves 1-4s when anti-bot resolves quickly.
 */ async function waitForCookiesWithPolling(context, cookieDomain, signal) {
    const deadline = Date.now() + COOKIE_POLL_TIMEOUT_MS;
    while(Date.now() < deadline){
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        const cookies = await context.cookies(cookieDomain);
        const cookieString = cookies.map((c)=>`${c.name}=${c.value}`).join("; ");
        if (cookieString) return cookieString;
        const remaining = deadline - Date.now();
        if (remaining <= 0) break;
        await waitWithSignal(Math.min(COOKIE_POLL_INTERVAL_MS, remaining), signal);
    }
    return null;
}
/**
 * doCookieRefreshOnContext — Run cookie extraction on an already-acquired
 * browser context. Opens a temporary page, navigates to the chat URL,
 * polls for cookies, and returns the result.
 */ async function doCookieRefreshOnContext(pooled, chatPageUrl, cookieDomain, signal) {
    const page = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["openPage"])(pooled);
    try {
        await page.goto(chatPageUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
            signal: signal ?? undefined
        });
        return await waitForCookiesWithPolling(pooled.context, cookieDomain, signal);
    } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") throw err;
        return null;
    } finally{
        await page.close().catch(()=>{});
    }
}
/**
 * refreshCookiesViaBrowser — Launch a stealth browser to solve the provider's
 * anti-bot challenge and extract fresh session cookies.
 *
 * Features:
 *   - Cookie cache: skip browser launch if we have fresh cached cookies
 *   - Dedup: concurrent calls for the same poolKey share one browser launch
 *   - Polling: returns as soon as cookies appear (avg 1-3s vs fixed 5s)
 */ async function refreshCookiesViaBrowser(poolKey, chatPageUrl, cookieDomain, signal) {
    if (httpOverride !== null) return null;
    // Check cookie cache first — avoids browser launch entirely
    const cached = getCachedCookies(cookieDomain);
    if (cached) return cached;
    // Dedup concurrent refreshes for the same pool key
    const pending = pendingRefreshes.get(poolKey);
    if (pending) return pending;
    const promise = doRefresh(poolKey, chatPageUrl, cookieDomain, signal);
    pendingRefreshes.set(poolKey, promise);
    promise.finally(()=>pendingRefreshes.delete(poolKey));
    return promise;
}
async function doRefresh(poolKey, chatPageUrl, cookieDomain, signal) {
    const { key } = await settlePoolKey(poolKey, true);
    let pooled;
    try {
        pooled = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["acquireBrowserContext"])(key, {
            cookieDomain,
            cookieString: null,
            warmupUrl: chatPageUrl
        });
    } catch  {
        return null;
    }
    const result = await doCookieRefreshOnContext(pooled, chatPageUrl, cookieDomain, signal);
    // Cache for subsequent calls
    if (result) setCachedCookies(cookieDomain, result);
    return result;
}
/**
 * startBrowserWarmup — Start acquireBrowserContext in parallel with
 * httpBackedChat. If httpBackedChat succeeds, the context stays in the
 * pool for the next request (saves ~2-3s on the first challenge hit).
 * If a challenge is detected, the browser is already partially ready.
 */ async function startBrowserWarmup(req) {
    if (!req.cookieDomain || httpOverride !== null) return null;
    const flag = process.env.OMNIROUTE_BROWSER_POOL;
    if (flag === "off" || flag === "0" || flag === "false") return null;
    try {
        const { key } = await settlePoolKey(req.poolKey, true);
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$browserPool$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["acquireBrowserContext"])(key, {
            cookieDomain: req.cookieDomain,
            cookieString: null
        });
    } catch  {
        return null;
    }
}
/**
 * getFreshCookiesWithWarmup — Try the pre-warmed context first, then
 * fall through to refreshCookiesViaBrowser if unavailable.
 */ async function getFreshCookiesWithWarmup(poolKey, chatPageUrl, cookieDomain, signal, warmupPromise) {
    if (warmupPromise) {
        try {
            const pooled = await warmupPromise;
            if (pooled) {
                const result = await doCookieRefreshOnContext(pooled, chatPageUrl, cookieDomain, signal);
                if (result) {
                    setCachedCookies(cookieDomain, result);
                    return result;
                }
            }
        } catch  {
        // Warmup failed — fall through to fresh refresh
        }
    }
    return refreshCookiesViaBrowser(poolKey, chatPageUrl, cookieDomain, signal);
}
function isChallengeResponse(status) {
    return status >= 400 && status !== 501;
}
async function tryBackedChat(req) {
    const abortController = req.signal ? null : new AbortController();
    const effectiveSignal = req.signal ?? abortController?.signal ?? null;
    if (abortController) {
        setTimeout(()=>abortController.abort(), 45000);
    }
    // Parallel browser warmup: start acquireBrowserContext while
    // httpBackedChat is in flight. If httpBackedChat succeeds, the
    // warmup context stays in the pool for the next request. If it
    // fails with a challenge, the browser is already partially ready,
    // saving ~2-3s on the cookie refresh path.
    const warmupPromise = startBrowserWarmup(req);
    try {
        const fast = await httpBackedChat({
            ...req,
            signal: effectiveSignal ?? undefined
        });
        if (fast.status >= 200 && fast.status < 300) return fast;
        if (!isChallengeResponse(fast.status)) return fast;
        let freshCookie = null;
        if (req.cookieDomain) {
            // Cookie cache check — skips browser launch on repeat challenges
            freshCookie = getCachedCookies(req.cookieDomain);
            if (freshCookie) {
                const retry = await httpBackedChat({
                    ...req,
                    cookieString: freshCookie,
                    signal: effectiveSignal ?? undefined
                });
                if (retry.status >= 200 && retry.status < 300) return retry;
                // Cache is stale — fall through to fresh browser refresh
                freshCookie = null;
            }
            if (!freshCookie) {
                // Use pre-warmed context if available, otherwise fresh refresh
                freshCookie = await getFreshCookiesWithWarmup(req.poolKey, req.chatPageUrl, req.cookieDomain, effectiveSignal, warmupPromise);
                if (freshCookie) {
                    const retry = await httpBackedChat({
                        ...req,
                        cookieString: freshCookie,
                        signal: effectiveSignal ?? undefined
                    });
                    if (retry.status >= 200 && retry.status < 300) return retry;
                }
            }
        }
        const slowReq = freshCookie ? {
            ...req,
            cookieString: freshCookie,
            signal: effectiveSignal ?? undefined
        } : {
            ...req,
            signal: effectiveSignal ?? undefined
        };
        const slow = await browserBackedChat(slowReq);
        if (slow.status >= 200 && slow.status < 300) return slow;
        return slow;
    } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
            return {
                status: 504,
                contentType: "application/json",
                body: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(JSON.stringify({
                    error: {
                        message: "tryBackedChat timed out",
                        type: "timeout_error"
                    }
                })),
                isStealth: false,
                timing: {
                    acquireContextMs: 0,
                    navigateMs: 0,
                    submitMs: 0,
                    captureResponseMs: 0,
                    totalMs: 0
                }
            };
        }
        throw err;
    }
}
;
}),
"[project]/open-sse/services/claudeTlsClient.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CLAUDE_TLS_BROWSER_MAJOR_VERSION",
    ()=>CLAUDE_TLS_BROWSER_MAJOR_VERSION,
    "TlsClientHangError",
    ()=>TlsClientHangError,
    "TlsClientUnavailableError",
    ()=>TlsClientUnavailableError,
    "__setTlsFetchOverrideForTesting",
    ()=>__setTlsFetchOverrideForTesting,
    "looksLikeSse",
    ()=>looksLikeSse,
    "tlsFetchClaude",
    ()=>tlsFetchClaude,
    "tlsFetchStreaming",
    ()=>tlsFetchStreaming
]);
/**
 * Browser-TLS-impersonating HTTP client for claude.ai.
 *
 * Why this exists: Claude's Cloudflare config pins `cf_clearance` to the
 * client's TLS fingerprint (JA3/JA4) + HTTP/2 SETTINGS frame ordering.
 * Node's Undici fetch presents an obvious "not a browser" handshake and
 * gets challenged with `cf-mitigated: challenge` — even with all the right
 * cookies. This module wraps `tls-client-node` (native shared library
 * built from bogdanfinn/tls-client) to send a Chrome handshake instead.
 *
 * The first call lazily starts the managed sidecar; subsequent calls reuse
 * a singleton TLSClient. Process exit hooks stop the sidecar cleanly.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let clientPromise = null;
let exitHookInstalled = false;
const CLAUDE_TLS_BROWSER_MAJOR_VERSION = "146";
const CLAUDE_PROFILE = `chrome_${CLAUDE_TLS_BROWSER_MAJOR_VERSION}`;
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.OMNIROUTE_CLAUDE_TLS_TIMEOUT_MS || "", 10) || 60_000;
// Grace period added to the binding's wire-level timeout before our JS-level
// hard timeout fires. Under healthy operation `tls-client-node` honors
// `timeoutMilliseconds` and rejects on its own; the JS-level race only wins
// when the koffi-loaded native library is wedged (which the binding's own
// timer can't escape). Keep the grace small so users don't wait noticeably
// longer than the configured timeout when the binding is dead.
const HARD_TIMEOUT_GRACE_MS = Number.parseInt(process.env.OMNIROUTE_CLAUDE_TLS_GRACE_MS || "", 10) || 10_000;
function installExitHook() {
    if (exitHookInstalled) return;
    exitHookInstalled = true;
    const stop = async ()=>{
        if (!clientPromise) return;
        try {
            const c = await clientPromise;
            await c.stop?.();
        } catch  {
        // ignore
        }
    };
    process.once("beforeExit", stop);
    process.once("SIGINT", ()=>{
        void stop();
    });
    process.once("SIGTERM", ()=>{
        void stop();
    });
}
/**
 * Drop the cached client so the next `getClient()` call respawns it. Called
 * when a request observes the native binding has wedged — releasing the
 * reference lets a fresh TLSClient (and a fresh koffi load) take over without
 * a process restart.
 */ function resetClientCache() {
    clientPromise = null;
}
class TlsClientHangError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientHangError";
    }
}
/**
 * Race a `client.request()` promise against (a) a JS-level hard timeout and
 * (b) the caller's abort signal. The native binding's `timeoutMilliseconds`
 * already covers the wire path; this guards the case where the koffi binding
 * itself deadlocks (observed after sustained load), where neither the
 * binding's own timer nor a post-call `signal.aborted` re-check can recover.
 */ async function raceWithTimeout(promise, timeoutMs, signal) {
    let timer = null;
    let abortListener = null;
    try {
        const racers = [
            promise,
            new Promise((_, reject)=>{
                timer = setTimeout(()=>{
                    reject(new TlsClientHangError(`tls-client-node call exceeded ${timeoutMs}ms — native binding likely deadlocked`));
                }, timeoutMs);
            })
        ];
        if (signal) {
            racers.push(new Promise((_, reject)=>{
                if (signal.aborted) {
                    reject(makeAbortError(signal));
                    return;
                }
                abortListener = ()=>reject(makeAbortError(signal));
                signal.addEventListener("abort", abortListener, {
                    once: true
                });
            }));
        }
        return await Promise.race(racers);
    } finally{
        if (timer) clearTimeout(timer);
        if (signal && abortListener) signal.removeEventListener("abort", abortListener);
    }
}
async function getClient() {
    if (!clientPromise) {
        clientPromise = (async ()=>{
            try {
                const mod = await __turbopack_context__.A("[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node, async loader)");
                const TLSClient = mod.TLSClient;
                // Native mode loads the shared library directly via koffi, avoiding the
                // managed sidecar's localhost HTTP calls that OmniRoute's global fetch
                // proxy patch interferes with.
                const client = new TLSClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildNativeTlsClientOptions"])());
                await client.start();
                installExitHook();
                return client;
            } catch (err) {
                clientPromise = null;
                const msg = err instanceof Error ? err.message : String(err);
                throw new TlsClientUnavailableError(`TLS impersonation client failed to start: ${msg}. ` + `Verify tls-client-node is installed and its native binary downloaded.`);
            }
        })();
    }
    return clientPromise;
}
class TlsClientUnavailableError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientUnavailableError";
    }
}
;
;
/**
 * Resolve the proxy URL for a tls-client request. Per-call value wins;
 * otherwise we use the standard proxy fetch resolution which reads from
 * the dashboard AsyncLocalStorage context or falls back to env vars.
 *
 * Fail-closed: if resolution throws (e.g. a configured socks5 proxy with
 * ENABLE_SOCKS5_PROXY=false), this rethrows rather than returning undefined —
 * undefined would let the native binding connect directly and leak the real IP.
 */ function resolveProxyUrl(perCall) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveTlsClientProxyUrl"])("https://claude.ai", perCall, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForRequest"]);
}
// Test-only injection point. Tests call __setTlsFetchOverrideForTesting()
// to replace the real TLS client with a mock; production never touches this.
let testOverride = null;
function __setTlsFetchOverrideForTesting(fn) {
    testOverride = fn;
}
async function tlsFetchClaude(url, options = {}) {
    if (testOverride) return testOverride(url, options);
    // Honor abort signals up-front. tls-client-node's koffi binding doesn't
    // accept an AbortSignal mid-flight (the binary call is opaque), so the best
    // we can do is bail before issuing the call. We also re-check after — if
    // the caller aborted while the upstream was running, throw rather than
    // returning a stale response so the caller doesn't try to use it.
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const client = await getClient();
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const requestOptions = {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        tlsClientIdentifier: CLAUDE_PROFILE,
        timeoutMilliseconds: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        followRedirects: true,
        withRandomTLSExtensionOrder: true,
        isByteResponse: options.byteResponse === true,
        // Plumb the configured proxy through to the native binding. tls-client-node
        // consults `proxyUrl` in the per-call options (it does NOT auto-pick up
        // HTTP_PROXY / HTTPS_PROXY env), so callers / env have to be threaded in
        // explicitly. See `resolveProxyUrl()` for the lookup order. Without this
        // line, every chatgpt-web call egresses with the bare host IP regardless
        // of dashboard proxy config — see #2022.
        proxyUrl: resolveProxyUrl(options.proxyUrl)
    };
    if (options.stream) {
        return await tlsFetchStreaming(client, url, requestOptions, options.streamEofSymbol, options.signal ?? null, (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS);
    }
    let tlsResponse;
    try {
        tlsResponse = await raceWithTimeout(client.request(url, requestOptions), (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS, options.signal ?? null);
    } catch (err) {
        if (err instanceof TlsClientHangError) {
            // The native binding is wedged — drop the singleton so the next
            // request respawns a fresh client (and a fresh koffi load).
            resetClientCache();
        }
        throw err;
    }
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    return {
        status: tlsResponse.status,
        headers: toHeaders(tlsResponse.headers),
        text: tlsResponse.body,
        body: null
    };
}
function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function toHeaders(raw) {
    const h = new Headers();
    for (const [k, vs] of Object.entries(raw || {})){
        for (const v of vs)h.append(k, v);
    }
    return h;
}
// ─── Streaming via temp file ────────────────────────────────────────────────
// tls-client-node's streaming primitive writes the response body chunk-by-chunk
// to a file path, terminating when the upstream sends `streamOutputEOFSymbol`.
// We tail the file from a worker and surface the bytes as a ReadableStream.
// Cap for the bounded fallback read of a non-SSE error body straight from the
// streaming temp file (mirrors the 2048-byte cap executors/claude-web.ts
// already applies when reading error bodies) — avoids buffering an unbounded
// error page into memory. See #7134.
const MAX_ERROR_BODY_BYTES = 16 * 1024;
async function tlsFetchStreaming(client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = DEFAULT_TIMEOUT_MS + HARD_TIMEOUT_GRACE_MS) {
    const dir = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdtemp"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["tmpdir"])(), "cgpt-stream-"));
    const path = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dir, `${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}.sse`);
    const streamOpts = {
        ...requestOptions,
        streamOutputPath: path,
        streamOutputBlockSize: 1024,
        streamOutputEOFSymbol: eofSymbol
    };
    // Kick off the request without awaiting — tls-client writes the body to
    // `path` chunk-by-chunk while the call runs. The Promise resolves when the
    // request fully completes (full body written). Wrapping in raceWithTimeout
    // guarantees this promise eventually settles even if the koffi binding
    // wedges; on hang we reset the singleton so the next request respawns.
    let resetOnHang = true;
    const requestPromise = raceWithTimeout(client.request(url, streamOpts), hardTimeoutMs, signal).catch((err)=>{
        if (resetOnHang && err instanceof TlsClientHangError) {
            resetClientCache();
            resetOnHang = false;
        }
        // Re-throw so downstream consumers (waitForContent, tailFile) observe
        // the rejection and surface it instead of treating the stream as having
        // ended cleanly.
        throw err;
    });
    // Wait for the file to exist AND have at least one byte. tls-client-node
    // creates the output file when the request starts, but the file can be
    // empty for a brief window before the first body chunk lands — peeking
    // during that window would return "" and misclassify the response as
    // non-SSE, dropping us into the buffered-wait branch and silently turning
    // a streaming request into a buffered one. Waiting for content avoids
    // that race; if the request actually fails before producing any bytes,
    // the timeout falls through to the requestPromise drain below (returning
    // the real upstream status).
    // Do not impose a second, shorter first-byte timeout here. Opus-class
    // models can legitimately take more than five seconds before emitting the
    // first SSE event. `requestPromise` is already guarded by the configured
    // wire timeout plus the JS hard-timeout grace, so waiting until either the
    // file has data or that promise settles remains bounded.
    const ready = await waitForContent(path, requestPromise);
    if (!ready) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body,
            body: null
        };
    }
    // Peek the first bytes to decide whether this looks like SSE. Anything
    // that doesn't positively look like SSE (JSON `{...}`, HTML `<...>`, plain
    // text rate-limit messages, Cloudflare challenge pages, etc.) gets surfaced
    // as a non-streaming response so the executor sees the real upstream status
    // and body — otherwise non-2xx error pages get silently treated as 200 OK
    // and the SSE parser produces an empty completion.
    const peek = await readFirstBytes(path, 256);
    if (!looksLikeSse(peek)) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        // tls-client-node's `streamOutputPath` mode writes the response body to
        // the temp file chunk-by-chunk and does NOT also populate the resolved
        // response's in-memory `body` field (confirmed against
        // node_modules/tls-client-node/dist/response.js) — so for every non-SSE,
        // non-2xx claude-web response (400/403/429/500 with a real JSON/HTML
        // error), `r.body` is empty even though the real bytes are sitting in
        // `path` (we just peeked them above). Prefer `r.body` when it IS
        // populated (some native-client modes do fill it in); otherwise fall
        // back to a bounded read of the temp file so the real upstream error
        // detail reaches the caller instead of being silently discarded. #7134
        const text = r.body || await readFirstBytes(path, MAX_ERROR_BODY_BYTES).catch(()=>"");
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text,
            body: null
        };
    }
    // Looks like SSE — start tailing. SSE bodies in practice are always 2xx;
    // tls-client-node doesn't expose response status separately from full-body
    // completion, so we report 200 and let the SSE parser consume the stream.
    const stream = tailFile(path, eofSymbol, requestPromise, signal);
    const headers = new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
    });
    return {
        status: 200,
        headers,
        text: null,
        body: stream
    };
}
function looksLikeSse(text) {
    const trimmed = text.replace(/^[\s\r\n]+/, "");
    if (!trimmed) return false;
    if (trimmed.startsWith(":")) return true;
    return /^(data|event|id|retry):/i.test(trimmed);
}
async function cleanupTempPath(path) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
    const dir = path.substring(0, path.lastIndexOf("/"));
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
}
async function readFirstBytes(path, n) {
    const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
    try {
        const buf = Buffer.alloc(n);
        const { bytesRead } = await fd.read(buf, 0, n, 0);
        return buf.subarray(0, bytesRead).toString("utf8");
    } finally{
        await fd.close().catch(()=>{});
    }
}
/**
 * Wait for the streaming output file to exist AND contain at least one byte.
 * Returns false if the request settles before any bytes arrive (so the caller
 * can drain `requestPromise` and surface the real upstream status). Returns
 * true as soon as the file has data — even one byte is enough for the SSE
 * heuristic to give a useful answer.
 */ async function waitForContent(path, requestPromise) {
    let requestSettled = false;
    requestPromise.then(()=>{
        requestSettled = true;
    }, ()=>{
        requestSettled = true;
    });
    while(true){
        try {
            const s = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["stat"])(path);
            if (s.size > 0) return true;
        } catch  {
        // file doesn't exist yet
        }
        // If the request finished without producing any bytes, no point waiting
        // out the rest of the timeout — let the caller drain it.
        if (requestSettled) return false;
        await sleep(25);
    }
}
function tailFile(path, eofSymbol, done, signal = null) {
    return new ReadableStream({
        async start (controller) {
            const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
            const buf = Buffer.alloc(64 * 1024);
            let offset = 0;
            let finished = false;
            let aborted = false;
            let upstreamError = null;
            // Track request settlement, capturing both fulfillment and rejection.
            // Without the rejection branch, a mid-stream tls-client-node error
            // becomes an unhandledRejection — the stream cleans up silently and
            // the consumer sees what looks like a successful truncated response.
            done.then(()=>{
                finished = true;
            }, (err)=>{
                upstreamError = err instanceof Error ? err : new Error(String(err));
                finished = true;
            });
            // If the caller aborts, stop tailing immediately.
            const onAbort = ()=>{
                aborted = true;
            };
            if (signal) {
                if (signal.aborted) aborted = true;
                else signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
            let errored = false;
            try {
                while(!aborted){
                    const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
                    if (bytesRead > 0) {
                        const chunk = buf.subarray(0, bytesRead);
                        offset += bytesRead;
                        const text = chunk.toString("utf8");
                        if (text.includes(eofSymbol)) {
                            const cutAt = text.indexOf(eofSymbol) + eofSymbol.length;
                            controller.enqueue(new Uint8Array(chunk.subarray(0, cutAt)));
                            break;
                        }
                        controller.enqueue(new Uint8Array(chunk));
                    } else if (finished) {
                        // No more data and request completed. If the request rejected,
                        // surface the error so the consumer doesn't think the stream
                        // ended cleanly.
                        if (upstreamError) {
                            controller.error(upstreamError);
                            errored = true;
                        }
                        break;
                    } else {
                        await sleep(25);
                    }
                }
            } catch (err) {
                controller.error(err);
                errored = true;
            } finally{
                if (signal) signal.removeEventListener("abort", onAbort);
                await fd.close().catch(()=>{});
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
                const dir = path.substring(0, path.lastIndexOf("/"));
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
                if (!errored) controller.close();
            }
        }
    });
}
function sleep(ms) {
    return new Promise((r)=>setTimeout(r, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/notionThreadSessions.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__resetNotionThreadSessionsForTests",
    ()=>__resetNotionThreadSessionsForTests,
    "conversationPrefixBeforeLastUser",
    ()=>conversationPrefixBeforeLastUser,
    "extractNotionMessageText",
    ()=>extractNotionMessageText,
    "hashNotionCallerCookie",
    ()=>hashNotionCallerCookie,
    "hashNotionConversation",
    ()=>hashNotionConversation,
    "isValidNotionThreadId",
    ()=>isValidNotionThreadId,
    "normalizeNotionContentForHash",
    ()=>normalizeNotionContentForHash,
    "notionThreadMarkConfirmed",
    ()=>notionThreadMarkConfirmed,
    "notionThreadMarkCreateAttempted",
    ()=>notionThreadMarkCreateAttempted,
    "notionThreadRootKey",
    ()=>notionThreadRootKey,
    "notionThreadSessionLookup",
    ()=>notionThreadSessionLookup,
    "notionThreadSessionStore",
    ()=>notionThreadSessionStore,
    "readClientThreadId",
    ()=>readClientThreadId,
    "resolveNotionThreadBinding",
    ()=>resolveNotionThreadBinding
]);
/**
 * Notion AI Web — thread session continuity (OpenAI multi-turn → one Notion chat).
 *
 * Extracted from `executors/notion-web.ts` (file-size gate) — everything needed to
 * bind an OpenAI-style multi-turn conversation to a single Notion `threadId`
 * instead of minting a fresh Notion chat on every request. See
 * `executors/notion-web.ts` for the upstream transcript/response translation
 * that consumes this module.
 *
 * - Space-keyed sticky root cache plus history-prefix fallbacks,
 *   backed by an on-disk snapshot under DATA_DIR so continuity survives restarts.
 * - Sticky root binding written *before* the upstream call so error retries never
 *   mint a second Notion chat for the same conversation.
 * - Optional client-supplied continuity via body (`notion_thread_id`/`thread_id`)
 *   or the `X-Notion-Thread-Id` header (via `ExecuteInput.clientHeaders`).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
function extractNotionMessageText(content) {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";
    const parts = [];
    for (const p of content){
        if (typeof p === "string") {
            if (p) parts.push(p);
            continue;
        }
        if (!p || typeof p !== "object") continue;
        const o = p;
        if (typeof o.text === "string" && o.text) parts.push(o.text);
        else if (typeof o.content === "string" && o.content) parts.push(o.content);
    }
    return parts.join("\n");
}
const THREAD_SESSION_MAX_AGE_MS = 7 * 24 * 3600_000; // 7d — agent/browser-web sessions can span long workflows
const THREAD_SESSION_MAX_ENTRIES = 500;
/** In-memory map: conversation key → Notion threadId. Backed by DATA_DIR when available. */ const threadSessionCache = new Map();
let threadStoreLoaded = false;
let threadStoreDirty = false;
let threadStoreTimer = null;
function getThreadStorePath() {
    try {
        const dataDir = process.env.DATA_DIR || process.env.OMNIROUTE_DATA_DIR || process.env.VIBEPROXY_DATA_DIR || (process.env.USERPROFILE ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(process.env.USERPROFILE, ".omniroute") : "") || (process.env.HOME ? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(process.env.HOME, ".omniroute") : "") || "";
        if (!dataDir) return null;
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dataDir, "notion-web-thread-sessions.json");
    } catch  {
        return null;
    }
}
function loadThreadStoreFromDisk() {
    if (threadStoreLoaded) return;
    threadStoreLoaded = true;
    const path = getThreadStorePath();
    if (!path || !(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(path)) return;
    try {
        const raw = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(path, "utf8");
        const parsed = JSON.parse(raw);
        const now = Date.now();
        for (const [k, v] of Object.entries(parsed || {})){
            if (!v?.threadId || typeof v.ts !== "number") continue;
            if (now - v.ts > THREAD_SESSION_MAX_AGE_MS) continue;
            threadSessionCache.set(k, v);
        }
    } catch  {
    // corrupt store — start fresh
    }
}
function scheduleThreadStoreFlush() {
    threadStoreDirty = true;
    if (threadStoreTimer) return;
    threadStoreTimer = setTimeout(()=>{
        threadStoreTimer = null;
        flushThreadStoreToDisk();
    }, 250);
    // Don't keep the process alive solely for the flush.
    if (typeof threadStoreTimer === "object" && threadStoreTimer && "unref" in threadStoreTimer) {
        try {
            threadStoreTimer.unref();
        } catch  {
        /* ignore */ }
    }
}
function flushThreadStoreToDisk() {
    if (!threadStoreDirty) return;
    const path = getThreadStorePath();
    if (!path) return;
    try {
        const dir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(path);
        if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(dir)) (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["mkdirSync"])(dir, {
            recursive: true
        });
        const obj = {};
        for (const [k, v] of threadSessionCache)obj[k] = v;
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["writeFileSync"])(path, JSON.stringify(obj), "utf8");
        threadStoreDirty = false;
    } catch  {
    // best-effort persistence
    }
}
function __resetNotionThreadSessionsForTests() {
    threadSessionCache.clear();
    threadStoreLoaded = true; // skip disk reload in tests
    threadStoreDirty = false;
    if (threadStoreTimer) {
        clearTimeout(threadStoreTimer);
        threadStoreTimer = null;
    }
}
function normalizeNotionContentForHash(content) {
    let text = extractNotionMessageText(content).replace(/\r\n/g, "\n").trim();
    if (!text) return "";
    // Agentic / UREW pin: keep only the stable task suffix when present.
    const taskMarkers = [
        "My current task:",
        "my current task:"
    ];
    for (const marker of taskMarkers){
        const idx = text.lastIndexOf(marker);
        if (idx >= 0) {
            text = text.slice(idx + marker.length).trim();
            break;
        }
    }
    // Drop other common agentic preamble fingerprints if the whole pin leaked in.
    if (text.includes("local workflow automation tool") || text.includes("clipboard parser")) {
        const intentIdx = text.lastIndexOf("Intent:");
        // Prefer last non-empty line after stripping long preambles
        const lines = text.split("\n").map((l)=>l.trim()).filter(Boolean);
        if (lines.length > 0) text = lines[lines.length - 1];
        void intentIdx;
    }
    return text.replace(/\s+/g, " ").trim();
}
function hashNotionConversation(spaceId, msgs) {
    const parts = [
        `space:${spaceId}`,
        ...msgs.map((h)=>`${(h.role || "").toLowerCase()}:${normalizeNotionContentForHash(h.content)}`)
    ];
    const raw = parts.join("\n");
    let hash = 0x811c9dc5;
    for(let i = 0; i < raw.length; i++){
        hash ^= raw.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
}
function conversationPrefixBeforeLastUser(messages) {
    if (!messages.length) return [];
    let lastUser = -1;
    for(let i = messages.length - 1; i >= 0; i--){
        const role = (messages[i]?.role || "").toLowerCase();
        if (role === "user" || role === "human") {
            lastUser = i;
            break;
        }
    }
    if (lastUser <= 0) return [];
    return messages.slice(0, lastUser);
}
function readThreadSessionEntry(key) {
    loadThreadStoreFromDisk();
    const entry = threadSessionCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > THREAD_SESSION_MAX_AGE_MS) {
        threadSessionCache.delete(key);
        scheduleThreadStoreFlush();
        return null;
    }
    return entry;
}
function readThreadSession(key) {
    return readThreadSessionEntry(key)?.threadId ?? null;
}
function putThreadSession(key, threadId, flags = {}) {
    loadThreadStoreFromDisk();
    const prev = threadSessionCache.get(key);
    threadSessionCache.set(key, {
        threadId,
        ts: Date.now(),
        confirmed: flags.confirmed ?? prev?.confirmed ?? false,
        createAttempted: flags.createAttempted ?? prev?.createAttempted ?? false
    });
    // Evict oldest if over cap
    if (threadSessionCache.size > THREAD_SESSION_MAX_ENTRIES) {
        let oldestKey = null;
        let oldestTs = Infinity;
        for (const [k, v] of threadSessionCache){
            if (v.ts < oldestTs) {
                oldestTs = v.ts;
                oldestKey = k;
            }
        }
        if (oldestKey) threadSessionCache.delete(oldestKey);
    }
    scheduleThreadStoreFlush();
}
function notionThreadRootKey(spaceKey, messages) {
    void messages;
    return spaceKey ? `root:space:${spaceKey}` : null;
}
function resolveNotionThreadBinding(spaceKey, messages, clientThreadId) {
    loadThreadStoreFromDisk();
    const rootKey = notionThreadRootKey(spaceKey, messages);
    const hasHistory = conversationHasAssistant(messages);
    if (clientThreadId && clientThreadId.trim()) {
        const id = clientThreadId.trim();
        if (rootKey) putThreadSession(rootKey, id, {
            createAttempted: true
        });
        return {
            threadId: id,
            createThread: false,
            rootKey
        };
    }
    // Exact prefix match first (full history before last user) — most specific
    // multi-turn continuity. Prefer this over sticky root so two independent
    // sessions that share the same first-user opener do not steal each other's
    // sticky binding when both are multi-turn.
    const prefix = conversationPrefixBeforeLastUser(messages);
    if (prefix.length > 0) {
        const exactId = readThreadSession(hashNotionConversation(spaceKey, prefix));
        if (exactId) {
            if (rootKey) putThreadSession(rootKey, exactId, {
                createAttempted: true,
                confirmed: true
            });
            return {
                threadId: exactId,
                createThread: false,
                rootKey
            };
        }
    }
    // Sticky root (first user turn hash) — UREW + error-retry continuity
    if (rootKey) {
        const sticky = readThreadSessionEntry(rootKey);
        if (sticky?.threadId) {
            // Multi-turn OpenAI history → continue the sticky Notion chat
            // (covers UREW rewrites where prefix hash may not match turn-1 store).
            if (hasHistory) {
                putThreadSession(rootKey, sticky.threadId, {
                    confirmed: sticky.confirmed,
                    createAttempted: sticky.createAttempted
                });
                return {
                    threadId: sticky.threadId,
                    createThread: false,
                    rootKey
                };
            }
            // First-turn error retry: we already issued createThread:true for this
            // root but never got a successful reply. Keep the same threadId so Notion
            // is not spam-created; do not create again (Notion may already have it).
            if (sticky.createAttempted && !sticky.confirmed) {
                putThreadSession(rootKey, sticky.threadId, {
                    confirmed: false,
                    createAttempted: true
                });
                return {
                    threadId: sticky.threadId,
                    createThread: false,
                    rootKey
                };
            }
            // First-turn + confirmed sticky: a *new* client session that happens to
            // start with the same first user text (Claude Code “New session” + “hi”).
            // Fall through and mint — never fork the previous Notion thread.
            //
            // Optimistic pre-bind (createAttempted false, confirmed false) also falls
            // through only when no sticky exists; if sticky exists without either flag
            // it is mid-flight first bind — reuse with createThread:true once.
            if (!sticky.createAttempted && !sticky.confirmed) {
                putThreadSession(rootKey, sticky.threadId, {
                    confirmed: false,
                    createAttempted: false
                });
                return {
                    threadId: sticky.threadId,
                    createThread: true,
                    rootKey
                };
            }
        // sticky.confirmed on first-turn → mint below (rebind root to new id)
        }
    }
    // Mint a new thread id and bind it immediately (optimistic) so concurrent /
    // failed retries reuse the same id instead of spam-creating Notion chats.
    const threadId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])();
    if (rootKey) {
        putThreadSession(rootKey, threadId, {
            createAttempted: false,
            confirmed: false
        });
    }
    // Multi-turn history without sticky (e.g. process restart): still create once
    // with the full transcript so the agent can continue in a fresh Notion chat.
    return {
        threadId,
        createThread: true,
        rootKey
    };
}
function notionThreadMarkCreateAttempted(rootKey, threadId) {
    if (!rootKey || !threadId) return;
    putThreadSession(rootKey, threadId, {
        createAttempted: true
    });
}
function notionThreadMarkConfirmed(rootKey, threadId) {
    if (!rootKey || !threadId) return;
    putThreadSession(rootKey, threadId, {
        createAttempted: true,
        confirmed: true
    });
}
function conversationHasAssistant(messages) {
    return messages.some((m)=>{
        const role = (m?.role || "").toLowerCase();
        return role === "assistant" || role === "ai" || role === "model";
    });
}
function notionThreadSessionLookup(spaceId, messages) {
    loadThreadStoreFromDisk();
    const rootKey = notionThreadRootKey(spaceId, messages);
    if (rootKey) {
        const sticky = readThreadSession(rootKey);
        if (sticky) return sticky;
    }
    const prefix = conversationPrefixBeforeLastUser(messages);
    if (prefix.length === 0) return null;
    return readThreadSession(hashNotionConversation(spaceId, prefix));
}
function notionThreadSessionStore(spaceId, messages, assistantText, threadId) {
    if (!threadId || !spaceId) return;
    const full = [
        ...messages,
        {
            role: "assistant",
            content: assistantText
        }
    ];
    putThreadSession(hashNotionConversation(spaceId, full), threadId, {
        confirmed: true,
        createAttempted: true
    });
    // Root key for agent multi-turn clients that keep original user wording.
    const rootKey = notionThreadRootKey(spaceId, messages);
    if (rootKey) {
        putThreadSession(rootKey, threadId, {
            confirmed: true,
            createAttempted: true
        });
    }
    void assistantText;
}
function isValidNotionThreadId(id) {
    const t = id.trim().replace(/-/g, "");
    return /^[0-9a-f]{32}$/i.test(t);
}
function readClientThreadId(body, headers) {
    const fromBody = typeof body.notion_thread_id === "string" && body.notion_thread_id.trim() || typeof body.thread_id === "string" && body.thread_id.trim() || "";
    if (fromBody) return isValidNotionThreadId(fromBody) ? fromBody : "";
    if (!headers) return "";
    for (const [k, v] of Object.entries(headers)){
        if (k.toLowerCase() === "x-notion-thread-id" && typeof v === "string" && v.trim()) {
            const h = v.trim();
            return isValidNotionThreadId(h) ? h : "";
        }
    }
    return "";
}
function hashNotionCallerCookie(cookie) {
    const raw = (cookie || "").trim();
    if (!raw) return "anon";
    // SHA-256 (128-bit prefix) rather than a 32-bit FNV digest: this hash is a
    // SECURITY boundary (per-caller cache isolation), so it must be collision-
    // resistant — a 32-bit space is birthday-crackable, letting an attacker craft
    // a cookie that lands in a victim's namespace. crypto SHA-256 makes both
    // accidental and crafted collisions infeasible; the raw cookie is never stored.
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(raw).digest("hex").slice(0, 32);
}
}),
"[project]/open-sse/services/notionStreamParser.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Notion AI Web — NDJSON `runInferenceTranscript` response parsing.
 *
 * Extracted from `executors/notion-web.ts` (file-size gate) — parses Notion's
 * undocumented streaming response format (legacy rich-text tuples, patch-start /
 * patch ops, and terminal record-map agent-inference steps) into plain text, and
 * detects in-band Notion error objects (often shipped with HTTP 200).
 */ /** Strips lang tags / BOM noise Notion sometimes wraps assistant text in. */ __turbopack_context__.s([
    "extractNotionUpstreamError",
    ()=>extractNotionUpstreamError,
    "parseNotionInferenceStream",
    ()=>parseNotionInferenceStream,
    "sanitizeNotionAssistantText",
    ()=>sanitizeNotionAssistantText
]);
function sanitizeNotionAssistantText(text) {
    if (!text) return "";
    let clean = text.replace(/^\uFEFF/, "").trim();
    // Self-closing or paired lang tags at the start (and anywhere).
    clean = clean.replace(/<\/?lang\b[^>]*\/?>/gi, "");
    clean = clean.replace(/<\/lang>/gi, "");
    // Incomplete leading <lang… without close
    if (/^<lang\b/i.test(clean) && !clean.includes(">")) return "";
    return clean.trim();
}
/** Extract plain text from Notion's rich-text tuple value: `[[text, marks?]]`. */ function extractRichText(value) {
    if (!Array.isArray(value)) return "";
    return value.map((segment)=>Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : "").join("");
}
function extractAgentInferenceText(value) {
    if (!Array.isArray(value)) return "";
    const parts = [];
    for (const item of value){
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const part = item;
        const t = typeof part.type === "string" ? part.type.toLowerCase() : "";
        if (t === "text" && typeof part.content === "string" && part.content) {
            parts.push(part.content);
        }
    }
    return parts.join("");
}
/** Unwraps `thread_message[key].value.value.step` from a Notion record-map entry. */ function extractThreadMessageStep(msg) {
    if (!msg || typeof msg !== "object") return null;
    const valueWrapper = msg.value;
    if (!valueWrapper || typeof valueWrapper !== "object") return null;
    const inner = valueWrapper.value;
    if (!inner || typeof inner !== "object") return null;
    const step = inner.step;
    if (!step || typeof step !== "object") return null;
    return step;
}
/** Extracts the text carried by a single thread-message step, or "" if none. */ function extractStepText(stepObj) {
    const stepType = typeof stepObj.type === "string" ? stepObj.type : "";
    if (stepType === "agent-inference") {
        return extractAgentInferenceText(stepObj.value);
    }
    if (stepType === "markdown-chat" && typeof stepObj.value === "string") {
        return stepObj.value;
    }
    return "";
}
function extractFromRecordMap(recordMap) {
    if (!recordMap || typeof recordMap !== "object" || Array.isArray(recordMap)) return "";
    const tm = recordMap.thread_message;
    if (!tm || typeof tm !== "object" || Array.isArray(tm)) return "";
    let best = "";
    for (const msg of Object.values(tm)){
        const stepObj = extractThreadMessageStep(msg);
        if (!stepObj) continue;
        const text = extractStepText(stepObj);
        if (text && text.length >= best.length) best = text;
    }
    return best;
}
/** Full agent-inference text-part append: `o:"a", p:".../value/-"`. */ function applyNotionValuePartAppend(v, state) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return;
    const part = v;
    if (part.type === "text" && typeof part.content === "string" && part.content) {
        state.lastPatchFinal = part.content;
    }
    if (part.type === "markdown-chat" && typeof part.value === "string" && part.value) {
        state.lastPatchFinal = part.value;
    }
}
/** Step append with markdown-chat / agent-inference: `o:"a", p:".../s/-"`. */ function applyNotionStepAppend(v, state) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return;
    const step = v;
    if (step.type === "markdown-chat" && typeof step.value === "string" && step.value) {
        state.lastPatchFinal = step.value;
    }
    if (step.type === "agent-inference") {
        const text = extractAgentInferenceText(step.value);
        if (text) state.lastPatchFinal = text;
    }
}
function applyNotionPatchOp(rawOp, state) {
    if (!rawOp || typeof rawOp !== "object") return;
    const op = rawOp;
    const o = typeof op.o === "string" ? op.o : "";
    const p = typeof op.p === "string" ? op.p : "";
    const v = op.v;
    if (o === "a" && p.endsWith("/value/-")) {
        applyNotionValuePartAppend(v, state);
    } else if (o === "a" && p.endsWith("/s/-")) {
        applyNotionStepAppend(v, state);
    } else if ((o === "x" || o === "p") && p.includes("/value") && typeof v === "string" && v) {
        // Incremental string patches
        state.lastIncremental += v;
    }
}
/** Applies one parsed NDJSON record (markdown-chat / agent-inference / patch / record-map / legacy). */ function applyNotionStreamRecord(rec, state) {
    const type = typeof rec.type === "string" ? rec.type : "";
    // 1) Direct markdown-chat event
    if (type === "markdown-chat" && typeof rec.value === "string" && rec.value) {
        state.lastPatchFinal = rec.value;
        return;
    }
    // 2) Direct agent-inference event
    if (type === "agent-inference") {
        const text = extractAgentInferenceText(rec.value);
        if (text) state.lastPatchFinal = text;
        return;
    }
    // 3) Patch stream
    if (type === "patch" && Array.isArray(rec.v)) {
        for (const rawOp of rec.v)applyNotionPatchOp(rawOp, state);
        return;
    }
    // 4) record-map terminal
    if (type === "record-map" || rec.recordMap) {
        const text = extractFromRecordMap(rec.recordMap || rec);
        if (text) state.lastRecordMap = text;
        return;
    }
    // 5) Legacy rich-text value (cumulative)
    const rich = extractRichText(rec.value);
    if (rich) state.lastLegacy = rich;
}
/** Parses one raw NDJSON line (trims / strips SSE `data:` prefix / JSON-parses) into state. */ function applyNotionStreamLine(rawLine, state) {
    const line = rawLine.trim();
    if (!line || line === "[DONE]") return;
    // Strip optional SSE "data:" prefix if a proxy rewrote it.
    const payloadLine = line.startsWith("data:") ? line.slice(5).trim() : line;
    if (!payloadLine) return;
    let record;
    try {
        record = JSON.parse(payloadLine);
    } catch  {
        return;
    }
    if (!record || typeof record !== "object" || Array.isArray(record)) return;
    applyNotionStreamRecord(record, state);
}
function parseNotionInferenceStream(raw) {
    if (!raw) return "";
    const state = {
        lastLegacy: "",
        lastPatchFinal: "",
        lastIncremental: "",
        lastRecordMap: ""
    };
    for (const rawLine of raw.split("\n")){
        applyNotionStreamLine(rawLine, state);
    }
    const candidates = [
        state.lastRecordMap,
        state.lastPatchFinal,
        state.lastIncremental,
        state.lastLegacy
    ].map(sanitizeNotionAssistantText).filter(Boolean);
    // Prefer the longest non-empty candidate; record-map usually wins.
    return candidates.sort((a, b)=>b.length - a.length)[0] || "";
}
function extractNotionUpstreamError(raw) {
    if (!raw || !raw.trim()) return null;
    const tryParse = (s)=>{
        try {
            const o = JSON.parse(s);
            return o && typeof o === "object" ? o : null;
        } catch  {
            return null;
        }
    };
    const candidates = [];
    const whole = tryParse(raw.trim());
    if (whole) candidates.push(whole);
    for (const line of raw.split("\n")){
        const t = line.trim();
        if (!t) continue;
        const o = tryParse(t);
        if (o) candidates.push(o);
    }
    // Flatten nested error objects: live Notion streams often nest the error inside
    // `patch-start.data.s[]` (HTTP 200 NDJSON) instead of a top-level `{type:"error"}`.
    // Missing that shape used to surface as the misleading "No response from Notion AI".
    const flat = [];
    const pushNested = (o)=>{
        flat.push(o);
        const data = o.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
            const s = data.s;
            if (Array.isArray(s)) {
                for (const item of s){
                    if (item && typeof item === "object" && !Array.isArray(item)) {
                        flat.push(item);
                    }
                }
            }
        }
        // Also walk a top-level `s` array if present on the record.
        if (Array.isArray(o.s)) {
            for (const item of o.s){
                if (item && typeof item === "object" && !Array.isArray(item)) {
                    flat.push(item);
                }
            }
        }
    };
    for (const o of candidates)pushNested(o);
    for (const o of flat){
        const type = typeof o.type === "string" ? o.type.toLowerCase() : "";
        const subType = typeof o.subType === "string" ? o.subType : undefined;
        const message = typeof o.message === "string" && o.message || typeof o.error === "string" && o.error || "";
        const isError = type === "error" || Boolean(subType) || typeof o.isRetryable === "boolean" && message.toLowerCase().includes("went wrong");
        if (!isError && !subType) continue;
        const sub = (subType || "").toLowerCase();
        // Notion often sets isRetryable:false on temporarily-unavailable even though
        // a short wait + retry succeeds (TLS/edge flake). Treat those subtypes as retryable.
        const retryable = o.isRetryable === true || sub.includes("temporarily") || sub.includes("unavailable") || sub.includes("rate") || sub.includes("timeout") || sub.includes("overloaded");
        return {
            message: message || subType || "Notion upstream error",
            subType,
            isRetryable: retryable
        };
    }
    return null;
}
}),
"[project]/open-sse/services/notionTranscriptBuilder.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildNotionTranscript",
    ()=>buildNotionTranscript,
    "messagesForNotionTranscript",
    ()=>messagesForNotionTranscript
]);
/**
 * Notion AI Web — `runInferenceTranscript` transcript construction.
 *
 * Extracted from `executors/notion-web.ts` (file-size gate) — builds a Notion
 * transcript array (`config` + `context` + per-message steps) from OpenAI-style
 * chat messages.
 *
 * Live contract (verified 2026-07-19):
 * - Leading `config` (workflow + optional model food-codename)
 * - Leading `context` (spaceId / userId / surface / timezone)
 * - User turns as `type: "user"` (legacy `human` also works with createThread,
 *   but `user` matches the current web client)
 * - Assistant turns as `agent-inference` text parts
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionThreadSessions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/notionThreadSessions.ts [middleware] (ecmascript)");
;
;
function isoNow() {
    // Millisecond precision matches the browser client.
    return new Date().toISOString().replace(/\.\d{3}Z$/, (m)=>m); // keep ms + Z
}
function buildNotionConfigStep(model, agent) {
    const isCustom = Boolean(agent?.workflowId);
    const configValue = {
        type: "workflow",
        // Match live browser defaults (2026-07-20 capture) for fewer plan/feature mismatches.
        enableAgentAutomations: true,
        enableAgentIntegrations: true,
        enableCustomAgents: true,
        enableScriptAgent: true,
        enableAgentDiffs: true,
        enableCsvAttachmentSupport: true,
        enableComputer: true,
        enableCreateAndRunThread: true,
        enableAgentGenerateImage: !isCustom,
        useWebSearch: true,
        searchScopes: [
            {
                type: "everything"
            }
        ],
        availableConnectors: [],
        enableUserSessionContext: false,
        isCustomAgent: isCustom,
        isCustomAgentBuilder: false,
        isCustomAgentCreate: false,
        isAgentResearchRequest: false,
        useCustomAgentDraft: isCustom,
        modelFromUser: !isCustom && Boolean(model),
        databaseAgentConfigMode: false,
        isOnboardingAgent: false,
        isMobile: false
    };
    if (isCustom && agent?.workflowId) {
        configValue.workflowId = agent.workflowId;
    }
    // Default Notion AI: pin the food codename when the client selected a model.
    // Custom agents usually use the agent-configured model (modelFromUser:false).
    if (!isCustom && model) configValue.model = model;
    return {
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        type: "config",
        value: configValue
    };
}
function buildNotionContextValue(opts) {
    const isCustom = Boolean(opts.agent?.workflowId);
    const contextValue = {
        timezone: "UTC",
        surface: isCustom ? "custom_agent" : "ai_module",
        currentDatetime: opts.now
    };
    if (opts.spaceId) contextValue.spaceId = opts.spaceId;
    if (opts.userId) contextValue.userId = opts.userId;
    if (isCustom && opts.agent?.workflowId) {
        contextValue.workflowId = opts.agent.workflowId;
        if (opts.agent.contextPageId) {
            contextValue.context_page_id = opts.agent.contextPageId;
        }
    }
    return contextValue;
}
/** Converts one OpenAI-style message into a transcript step, or `null` when it
 * was folded into the context (system prompts). */ function buildNotionMessageStep(m, contextValue, opts) {
    // Accept string OR content-parts array (agent clients often send parts).
    const text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$notionThreadSessions$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractNotionMessageText"])(m?.content);
    if (!text || text.length === 0) return null;
    const role = (m.role || "").toLowerCase();
    if (role === "system") {
        // Fold system prompts into context instructions rather than a separate step.
        const existing = typeof contextValue.instructions === "string" ? contextValue.instructions : "";
        contextValue.instructions = existing ? `${existing}\n${text}` : text;
        return null;
    }
    if (role === "assistant") {
        return {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            type: "agent-inference",
            value: [
                {
                    type: "text",
                    content: text
                }
            ]
        };
    }
    // user (and anything else treated as user)
    const userStep = {
        id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        type: "user",
        value: [
            [
                text
            ]
        ],
        createdAt: opts.now
    };
    if (opts.userId) userStep.userId = opts.userId;
    return userStep;
}
function messagesForNotionTranscript(messages, isFollowUp) {
    if (!isFollowUp || !messages.length) return messages;
    let lastAsst = -1;
    for(let i = messages.length - 1; i >= 0; i--){
        const role = (messages[i]?.role || "").toLowerCase();
        if (role === "assistant" || role === "ai" || role === "model") {
            lastAsst = i;
            break;
        }
    }
    if (lastAsst < 0) return messages;
    const slice = messages.slice(lastAsst + 1);
    // Always include at least the last user message
    if (slice.length === 0) {
        const lastUser = [
            ...messages
        ].reverse().find((m)=>{
            const r = (m.role || "").toLowerCase();
            return r === "user" || r === "human";
        });
        return lastUser ? [
            lastUser
        ] : messages;
    }
    return slice;
}
function buildNotionTranscript(messages, opts = {}) {
    const trimmedModel = typeof opts.notionModel === "string" ? opts.notionModel.trim() : "";
    const model = trimmedModel && trimmedModel !== "notion-ai" ? trimmedModel : "";
    const now = isoNow();
    const agent = opts.agent?.workflowId ? opts.agent : undefined;
    const isFollowUp = Boolean(opts.isFollowUp);
    const contextValue = buildNotionContextValue({
        spaceId: opts.spaceId,
        userId: opts.userId,
        now,
        agent
    });
    const entries = [
        buildNotionConfigStep(model, agent),
        {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
            type: "context",
            value: contextValue
        }
    ];
    const msgs = messagesForNotionTranscript(messages, isFollowUp);
    for (const m of msgs){
        const step = buildNotionMessageStep(m, contextValue, {
            userId: opts.userId,
            now
        });
        if (step) entries.push(step);
    }
    return entries;
}
}),
"[project]/open-sse/services/notionTlsClient.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "TlsClientHangError",
    ()=>TlsClientHangError,
    "TlsClientUnavailableError",
    ()=>TlsClientUnavailableError,
    "__setTlsFetchOverrideForTesting",
    ()=>__setTlsFetchOverrideForTesting,
    "isCloudflareChallenge",
    ()=>isCloudflareChallenge,
    "looksLikeSse",
    ()=>looksLikeSse,
    "tlsFetchNotion",
    ()=>tlsFetchNotion
]);
/**
 * Browser-TLS-impersonating HTTP client for app.notion.com.
 *
 * Why this exists: Notion AI sits behind the same Cloudflare Enterprise
 * configuration as ChatGPT — it pins access to the client's TLS fingerprint
 * (JA3/JA4) + HTTP/2 SETTINGS frame ordering. Node's Undici fetch presents an
 * obvious "not a browser" handshake and gets challenged with a 403 "Just a
 * moment..." page from VPS/datacenter IPs — even with a valid session cookie.
 * This module wraps `tls-client-node` (native shared library built from
 * bogdanfinn/tls-client) to send a Firefox handshake instead. (issue #2459)
 *
 * Mirrors `claudeTlsClient.ts` / `perplexityTlsClient.ts`; kept as an independent module so changes here
 * cannot regress the production chatgpt-web path. The first call lazily starts
 * the managed sidecar; subsequent calls reuse a singleton TLSClient. Process
 * exit hooks stop the sidecar cleanly.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let clientPromise = null;
let exitHookInstalled = false;
const NOTION_PROFILE = "chrome_146"; // matches the Chrome UA we send
const DEFAULT_TIMEOUT_MS = Number.parseInt(process.env.OMNIROUTE_NOTION_TLS_TIMEOUT_MS || "", 10) || 30_000;
// Grace period added to the binding's wire-level timeout before our JS-level
// hard timeout fires. Under healthy operation `tls-client-node` honors
// `timeoutMilliseconds` and rejects on its own; the JS-level race only wins
// when the koffi-loaded native library is wedged (which the binding's own
// timer can't escape). Keep the grace small so users don't wait noticeably
// longer than the configured timeout when the binding is dead.
const HARD_TIMEOUT_GRACE_MS = Number.parseInt(process.env.OMNIROUTE_NOTION_TLS_GRACE_MS || "", 10) || 10_000;
function installExitHook() {
    if (exitHookInstalled) return;
    exitHookInstalled = true;
    const stop = async ()=>{
        if (!clientPromise) return;
        try {
            const c = await clientPromise;
            await c.stop?.();
        } catch  {
        // ignore
        }
    };
    process.once("beforeExit", stop);
    process.once("SIGINT", ()=>{
        void stop();
    });
    process.once("SIGTERM", ()=>{
        void stop();
    });
}
/**
 * Drop the cached client so the next `getClient()` call respawns it. Called
 * when a request observes the native binding has wedged — releasing the
 * reference lets a fresh TLSClient (and a fresh koffi load) take over without
 * a process restart.
 */ function resetClientCache() {
    clientPromise = null;
}
class TlsClientHangError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientHangError";
    }
}
/**
 * Race a `client.request()` promise against (a) a JS-level hard timeout and
 * (b) the caller's abort signal. The native binding's `timeoutMilliseconds`
 * already covers the wire path; this guards the case where the koffi binding
 * itself deadlocks (observed after sustained load), where neither the
 * binding's own timer nor a post-call `signal.aborted` re-check can recover.
 */ async function raceWithTimeout(promise, timeoutMs, signal) {
    let timer = null;
    let abortListener = null;
    try {
        const racers = [
            promise,
            new Promise((_, reject)=>{
                timer = setTimeout(()=>{
                    reject(new TlsClientHangError(`tls-client-node call exceeded ${timeoutMs}ms — native binding likely deadlocked`));
                }, timeoutMs);
            })
        ];
        if (signal) {
            racers.push(new Promise((_, reject)=>{
                if (signal.aborted) {
                    reject(makeAbortError(signal));
                    return;
                }
                abortListener = ()=>reject(makeAbortError(signal));
                signal.addEventListener("abort", abortListener, {
                    once: true
                });
            }));
        }
        return await Promise.race(racers);
    } finally{
        if (timer) clearTimeout(timer);
        if (signal && abortListener) signal.removeEventListener("abort", abortListener);
    }
}
async function getClient() {
    if (!clientPromise) {
        clientPromise = (async ()=>{
            try {
                const mod = await __turbopack_context__.A("[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node, async loader)");
                const TLSClient = mod.TLSClient;
                // Native mode loads the shared library directly via koffi, avoiding the
                // managed sidecar's localhost HTTP calls that OmniRoute's global fetch
                // proxy patch interferes with.
                const client = new TLSClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildNativeTlsClientOptions"])());
                await client.start();
                installExitHook();
                return client;
            } catch (err) {
                clientPromise = null;
                const msg = err instanceof Error ? err.message : String(err);
                throw new TlsClientUnavailableError(`TLS impersonation client failed to start: ${msg}. ` + `Verify tls-client-node is installed and its native binary downloaded.`);
            }
        })();
    }
    return clientPromise;
}
class TlsClientUnavailableError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientUnavailableError";
    }
}
;
;
/**
 * Resolve the proxy URL for a tls-client request. Per-call value wins;
 * otherwise we use the standard proxy fetch resolution which reads from
 * the dashboard AsyncLocalStorage context or falls back to env vars.
 *
 * Fail-closed: if resolution throws (e.g. a configured socks5 proxy with
 * ENABLE_SOCKS5_PROXY=false), this rethrows rather than returning undefined —
 * undefined would let the native binding connect directly and leak the real IP.
 */ function resolveProxyUrl(perCall) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveTlsClientProxyUrl"])("https://app.notion.com", perCall, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForRequest"]);
}
// Test-only injection point. Tests call __setTlsFetchOverrideForTesting()
// to replace the real TLS client with a mock; production never touches this.
let testOverride = null;
function __setTlsFetchOverrideForTesting(fn) {
    testOverride = fn;
}
async function tlsFetchNotion(url, options = {}) {
    if (testOverride) return testOverride(url, options);
    // Honor abort signals up-front. tls-client-node's koffi binding doesn't
    // accept an AbortSignal mid-flight (the binary call is opaque), so the best
    // we can do is bail before issuing the call. We also re-check after — if
    // the caller aborted while the upstream was running, throw rather than
    // returning a stale response so the caller doesn't try to use it.
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const client = await getClient();
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    const requestOptions = {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        tlsClientIdentifier: NOTION_PROFILE,
        timeoutMilliseconds: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        followRedirects: true,
        withRandomTLSExtensionOrder: true,
        // Plumb the configured proxy through to the native binding. tls-client-node
        // consults `proxyUrl` in the per-call options (it does NOT auto-pick up
        // HTTP_PROXY / HTTPS_PROXY env), so callers / env have to be threaded in
        // explicitly. See `resolveProxyUrl()` for the lookup order.
        proxyUrl: resolveProxyUrl(options.proxyUrl)
    };
    if (options.stream) {
        return await tlsFetchStreaming(client, url, requestOptions, options.streamEofSymbol, options.signal ?? null, (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS);
    }
    let tlsResponse;
    try {
        tlsResponse = await raceWithTimeout(client.request(url, requestOptions), (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS, options.signal ?? null);
    } catch (err) {
        if (err instanceof TlsClientHangError) {
            // The native binding is wedged — drop the singleton so the next
            // request respawns a fresh client (and a fresh koffi load).
            resetClientCache();
        }
        throw err;
    }
    if (options.signal?.aborted) {
        throw makeAbortError(options.signal);
    }
    return {
        status: tlsResponse.status,
        headers: toHeaders(tlsResponse.headers),
        text: tlsResponse.body,
        body: null
    };
}
function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function toHeaders(raw) {
    const h = new Headers();
    for (const [k, vs] of Object.entries(raw || {})){
        for (const v of vs)h.append(k, v);
    }
    return h;
}
function isCloudflareChallenge(text) {
    if (!text) return false;
    return /just a moment|window\._cf_chl_opt|challenges\.cloudflare\.com|attention required|cf-chl/i.test(text);
}
// ─── Streaming via temp file ────────────────────────────────────────────────
// tls-client-node's streaming primitive writes the response body chunk-by-chunk
// to a file path, terminating when the upstream sends `streamOutputEOFSymbol`.
// We tail the file from a worker and surface the bytes as a ReadableStream.
async function tlsFetchStreaming(client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = DEFAULT_TIMEOUT_MS + HARD_TIMEOUT_GRACE_MS) {
    const dir = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdtemp"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["tmpdir"])(), "pplx-stream-"));
    const path = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dir, `${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}.sse`);
    const streamOpts = {
        ...requestOptions,
        streamOutputPath: path,
        streamOutputBlockSize: 1024,
        streamOutputEOFSymbol: eofSymbol
    };
    // Kick off the request without awaiting — tls-client writes the body to
    // `path` chunk-by-chunk while the call runs. The Promise resolves when the
    // request fully completes (full body written). Wrapping in raceWithTimeout
    // guarantees this promise eventually settles even if the koffi binding
    // wedges; on hang we reset the singleton so the next request respawns.
    let resetOnHang = true;
    const requestPromise = raceWithTimeout(client.request(url, streamOpts), hardTimeoutMs, signal).catch((err)=>{
        if (resetOnHang && err instanceof TlsClientHangError) {
            resetClientCache();
            resetOnHang = false;
        }
        // Re-throw so downstream consumers (waitForContent, tailFile) observe
        // the rejection and surface it instead of treating the stream as having
        // ended cleanly.
        throw err;
    });
    // Wait for the file to exist AND have at least one byte. tls-client-node
    // creates the output file when the request starts, but the file can be
    // empty for a brief window before the first body chunk lands — peeking
    // during that window would return "" and misclassify the response as
    // non-SSE, dropping us into the buffered-wait branch and silently turning
    // a streaming request into a buffered one. Waiting for content avoids
    // that race; if the request actually fails before producing any bytes,
    // the timeout falls through to the requestPromise drain below (returning
    // the real upstream status).
    const ready = await waitForContent(path, 5_000, requestPromise);
    if (!ready) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body,
            body: null
        };
    }
    // Peek the first bytes to decide whether this looks like SSE. Anything
    // that doesn't positively look like SSE (JSON `{...}`, HTML `<...>`, plain
    // text rate-limit messages, Cloudflare challenge pages, etc.) gets surfaced
    // as a non-streaming response so the executor sees the real upstream status
    // and body — otherwise non-2xx error pages get silently treated as 200 OK
    // and the SSE parser produces an empty completion.
    const peek = await readFirstBytes(path, 256);
    if (!looksLikeSse(peek)) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body,
            body: null
        };
    }
    // Looks like SSE — start tailing. SSE bodies in practice are always 2xx;
    // tls-client-node doesn't expose response status separately from full-body
    // completion, so we report 200 and let the SSE parser consume the stream.
    const stream = tailFile(path, eofSymbol, requestPromise, signal);
    const headers = new Headers({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
    });
    return {
        status: 200,
        headers,
        text: null,
        body: stream
    };
}
function looksLikeSse(text) {
    const trimmed = text.replace(/^[\s\r\n]+/, "");
    if (!trimmed) return false;
    if (trimmed.startsWith(":")) return true;
    return /^(data|event|id|retry):/i.test(trimmed);
}
async function cleanupTempPath(path) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
    const dir = path.substring(0, path.lastIndexOf("/"));
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
}
async function readFirstBytes(path, n) {
    const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
    try {
        const buf = Buffer.alloc(n);
        const { bytesRead } = await fd.read(buf, 0, n, 0);
        return buf.subarray(0, bytesRead).toString("utf8");
    } finally{
        await fd.close().catch(()=>{});
    }
}
/**
 * Wait for the streaming output file to exist AND contain at least one byte.
 * Returns false if the request settles before any bytes arrive (so the caller
 * can drain `requestPromise` and surface the real upstream status). Returns
 * true as soon as the file has data — even one byte is enough for the SSE
 * heuristic to give a useful answer.
 */ async function waitForContent(path, timeoutMs, requestPromise) {
    let requestSettled = false;
    requestPromise.then(()=>{
        requestSettled = true;
    }, ()=>{
        requestSettled = true;
    });
    const start = Date.now();
    while(Date.now() - start < timeoutMs){
        try {
            const s = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["stat"])(path);
            if (s.size > 0) return true;
        } catch  {
        // file doesn't exist yet
        }
        // If the request finished without producing any bytes, no point waiting
        // out the rest of the timeout — let the caller drain it.
        if (requestSettled) return false;
        await sleep(25);
    }
    return false;
}
function tailFile(path, eofSymbol, done, signal = null) {
    return new ReadableStream({
        async start (controller) {
            const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
            const buf = Buffer.alloc(64 * 1024);
            let offset = 0;
            let finished = false;
            let aborted = false;
            let upstreamError = null;
            // Track request settlement, capturing both fulfillment and rejection.
            // Without the rejection branch, a mid-stream tls-client-node error
            // becomes an unhandledRejection — the stream cleans up silently and
            // the consumer sees what looks like a successful truncated response.
            done.then(()=>{
                finished = true;
            }, (err)=>{
                upstreamError = err instanceof Error ? err : new Error(String(err));
                finished = true;
            });
            // If the caller aborts, stop tailing immediately.
            const onAbort = ()=>{
                aborted = true;
            };
            if (signal) {
                if (signal.aborted) aborted = true;
                else signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
            let errored = false;
            try {
                while(!aborted){
                    const { bytesRead } = await fd.read(buf, 0, buf.length, offset);
                    if (bytesRead > 0) {
                        const chunk = buf.subarray(0, bytesRead);
                        offset += bytesRead;
                        const text = chunk.toString("utf8");
                        if (text.includes(eofSymbol)) {
                            const cutAt = text.indexOf(eofSymbol) + eofSymbol.length;
                            controller.enqueue(new Uint8Array(chunk.subarray(0, cutAt)));
                            break;
                        }
                        controller.enqueue(new Uint8Array(chunk));
                    } else if (finished) {
                        // No more data and request completed. If the request rejected,
                        // surface the error so the consumer doesn't think the stream
                        // ended cleanly.
                        if (upstreamError) {
                            controller.error(upstreamError);
                            errored = true;
                        }
                        break;
                    } else {
                        await sleep(25);
                    }
                }
            } catch (err) {
                controller.error(err);
                errored = true;
            } finally{
                if (signal) signal.removeEventListener("abort", onAbort);
                await fd.close().catch(()=>{});
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
                const dir = path.substring(0, path.lastIndexOf("/"));
                await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])(dir).catch(()=>{});
                if (!errored) controller.close();
            }
        }
    });
}
function sleep(ms) {
    return new Promise((r)=>setTimeout(r, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/raycast.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RAYCAST_CHAT_URL",
    ()=>RAYCAST_CHAT_URL,
    "RAYCAST_DEFAULT_EXPERIMENTAL",
    ()=>RAYCAST_DEFAULT_EXPERIMENTAL,
    "RAYCAST_DEFAULT_SIG_SECRET",
    ()=>RAYCAST_DEFAULT_SIG_SECRET,
    "RAYCAST_DEFAULT_USER_AGENT",
    ()=>RAYCAST_DEFAULT_USER_AGENT,
    "RAYCAST_MODELS_URL",
    ()=>RAYCAST_MODELS_URL,
    "buildRaycastChatBody",
    ()=>buildRaycastChatBody,
    "buildRaycastHeaders",
    ()=>buildRaycastHeaders,
    "contentToText",
    ()=>contentToText,
    "convertOpenAiMessages",
    ()=>convertOpenAiMessages,
    "decodeAidFromRaycastJwt",
    ()=>decodeAidFromRaycastJwt,
    "fetchRaycastModels",
    ()=>fetchRaycastModels,
    "inferProviderInfo",
    ()=>inferProviderInfo,
    "parseRaycastSseText",
    ()=>parseRaycastSseText,
    "raycastJwt",
    ()=>raycastJwt,
    "resolveRaycastSecrets",
    ()=>resolveRaycastSecrets,
    "rot13rot5",
    ()=>rot13rot5,
    "signatureV2",
    ()=>signatureV2
]);
/**
 * @file raycast.ts
 * @description Raycast Pro AI reverse-engineered protocol (backend.raycast.com).
 * Ported from szcharlesji/raycast-relay (Node, 2026-06) — V2 HMAC + V1 JWT signatures.
 *
 * @changes
 * - [2026-07-27] [Composer] - Initial Raycast Pro local-dev provider protocol
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const RAYCAST_CHAT_URL = "https://backend.raycast.com/api/v1/ai/chat_completions";
const RAYCAST_MODELS_URL = "https://backend.raycast.com/api/v1/ai/models";
const RAYCAST_DEFAULT_USER_AGENT = "Raycast/1.104.20 (macOS Version 26.5.1 (Build 25F80))";
const RAYCAST_DEFAULT_EXPERIMENTAL = "chatBranching, mcpHTTPServer";
const RAYCAST_DEFAULT_SIG_SECRET = "[REDIGIDO-PRESERVACAO]";
function rot13rot5(input) {
    return input.replace(/[A-Za-z0-9]/g, (char)=>{
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode((code - 65 + 13) % 26 + 65);
        if (code >= 97 && code <= 122) return String.fromCharCode((code - 97 + 13) % 26 + 97);
        return String.fromCharCode((code - 48 + 5) % 10 + 48);
    });
}
function signatureV2(timestamp, deviceId, payload, secret) {
    const bodyHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(payload).digest("hex");
    const message = [
        timestamp,
        deviceId,
        bodyHash
    ].map(rot13rot5).join(".");
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])("sha256", secret).update(message).digest("hex");
}
function base64UrlJson(value) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}
function raycastJwt(aid, secret) {
    const iat = Date.now() / 1000;
    const header = base64UrlJson({
        typ: "JWT",
        alg: "HS256"
    });
    const payload = base64UrlJson({
        aid,
        exp: iat + 60,
        iat
    });
    const signature = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHmac"])("sha256", secret).update(`${header}.${payload}`).digest("base64url");
    return `${header}.${payload}.${signature}`;
}
function decodeAidFromRaycastJwt(jwt) {
    const parts = jwt.trim().split(".");
    if (parts.length < 2) return null;
    try {
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
        return payload.aid || null;
    } catch  {
        return null;
    }
}
function resolveRaycastSecrets(credentials) {
    const psd = credentials.providerSpecificData || {};
    const bearerToken = (credentials.accessToken || "").trim();
    const deviceId = (psd.deviceId || "").trim();
    const aid = (psd.aid || deviceId || "").trim();
    const sigSecret = (psd.sigSecret || process.env.RAYCAST_SIG_SECRET || RAYCAST_DEFAULT_SIG_SECRET).trim();
    if (!bearerToken) throw new Error("Raycast bearer token is required");
    if (!deviceId) throw new Error("Raycast device ID is required");
    if (!sigSecret) throw new Error("Raycast signature secret is required");
    return {
        bearerToken,
        deviceId,
        aid,
        sigSecret
    };
}
function buildRaycastHeaders(payload, credentials) {
    const { bearerToken, deviceId, aid, sigSecret } = resolveRaycastSecrets(credentials);
    const psd = credentials.providerSpecificData || {};
    const timestamp = Math.floor(Date.now() / 1000).toString();
    return {
        Accept: "application/json",
        Authorization: `Bearer ${bearerToken}`,
        "X-Raycast-Timestamp": timestamp,
        "Accept-Language": "en-US,en;q=0.9",
        "X-Raycast-DeviceId": deviceId,
        "Content-Type": "application/json",
        "X-Raycast-Signature-v2": signatureV2(timestamp, deviceId, payload, sigSecret),
        "X-Raycast-Experimental": psd.experimental || RAYCAST_DEFAULT_EXPERIMENTAL,
        "X-Raycast-Signature": raycastJwt(aid, sigSecret),
        "User-Agent": psd.userAgent || RAYCAST_DEFAULT_USER_AGENT
    };
}
function contentToText(content) {
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return JSON.stringify(content ?? "");
    return content.map((part)=>{
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "type" in part && part.type === "text") {
            return String(part.text || "");
        }
        return "";
    }).filter(Boolean).join("\n");
}
function convertOpenAiMessages(messages) {
    let systemInstruction = "markdown";
    const raycastMessages = [];
    for (const [index, message] of messages.entries()){
        if (message.role === "system" && index === 0) {
            systemInstruction = contentToText(message.content);
            continue;
        }
        if (message.role === "user" || message.role === "assistant") {
            raycastMessages.push({
                author: message.role,
                content: {
                    text: contentToText(message.content)
                }
            });
        }
    }
    return {
        raycastMessages,
        systemInstruction
    };
}
function inferProviderInfo(modelId) {
    if (modelId.startsWith("openai_o1-")) {
        return {
            provider: "openai",
            model: modelId.slice("openai_o1-".length)
        };
    }
    const providers = [
        "anthropic",
        "baseten",
        "google",
        "groq",
        "mistral",
        "openai",
        "perplexity",
        "raycast",
        "together",
        "xai"
    ];
    for (const provider of providers){
        const prefix = `${provider}-`;
        if (modelId.startsWith(prefix)) {
            return {
                provider,
                model: modelId.slice(prefix.length)
            };
        }
    }
    if (modelId.includes("/")) return {
        provider: "baseten",
        model: modelId
    };
    return {
        provider: "openai",
        model: modelId || "gpt-5-mini"
    };
}
function buildRaycastChatBody(modelId, messages, temperature) {
    const { provider, model } = inferProviderInfo(modelId);
    const { raycastMessages, systemInstruction } = convertOpenAiMessages(messages);
    if (raycastMessages.length === 0) {
        throw new Error("Raycast requires at least one user or assistant message");
    }
    return JSON.stringify({
        model,
        provider,
        messages: raycastMessages,
        system_instruction: systemInstruction,
        temperature: temperature ?? 0.5,
        additional_system_instructions: "",
        debug: false,
        locale: "en-US",
        source: "ai_chat",
        thread_id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        tools: []
    });
}
function parseRaycastSseText(responseText) {
    let fullText = "";
    for (const line of responseText.split("\n")){
        if (!line.startsWith("data:")) continue;
        try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.text) fullText += data.text;
        } catch  {
        // Ignore non-JSON SSE lines.
        }
    }
    return fullText;
}
async function fetchRaycastModels(credentials, options) {
    const payload = "{}";
    const headers = buildRaycastHeaders(payload, credentials);
    const res = await fetch(RAYCAST_MODELS_URL, {
        method: "GET",
        headers
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Raycast models error [${res.status}]: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const includePremium = options?.includePremium ?? true;
    const includeDeprecated = options?.includeDeprecated ?? true;
    return (data.models || []).filter((model)=>{
        if (!includePremium && model.requires_better_ai) return false;
        if (!includeDeprecated && model.availability === "deprecated") return false;
        return true;
    });
}
}),
"[project]/open-sse/services/lmarenaTlsClient.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "TlsClientHangError",
    ()=>TlsClientHangError,
    "TlsClientUnavailableError",
    ()=>TlsClientUnavailableError,
    "__setTlsFetchOverrideForTesting",
    ()=>__setTlsFetchOverrideForTesting,
    "isCloudflareChallenge",
    ()=>isCloudflareChallenge,
    "tlsFetchLMArena",
    ()=>tlsFetchLMArena
]);
/**
 * Browser-TLS-impersonating HTTP client for arena.ai.
 *
 * Why this exists: LMArena sits behind Cloudflare Enterprise which pins
 * `cf_clearance` to the client's TLS fingerprint (JA3/JA4) + HTTP/2 SETTINGS
 * frame ordering. Node's Undici fetch presents an obvious "not a browser"
 * handshake and gets challenged with a 403 even with a valid arena session
 * cookie (and often a browser-minted `cf_clearance`). This module wraps
 * `tls-client-node` (bogdanfinn/tls-client) to send a Chrome handshake instead.
 *
 * Mirrors `grokTlsClient.ts` / `perplexityTlsClient.ts` as an independent
 * module so changes here cannot regress those production paths.
 *
 * Note: Arena may still require a browser-issued reCAPTCHA v3 token on
 * create-evaluation; TLS alone is necessary but not always sufficient.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientDownloadDir.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/proxyFetch.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/tlsClientProxy.ts [middleware] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let clientPromise = null;
let exitHookInstalled = false;
// Newest Chrome JA3 profile shipped by tls-client-node (no chrome_147+ yet).
// HTTP User-Agent / Sec-Ch-Ua track Chrome 150 separately in models.ts.
const LMARENA_PROFILE = "chrome_146";
// Fixed timeouts (same defaults as other TLS sidecars). No extra env knobs —
// env-doc-sync must not grow for provider-local constants.
const DEFAULT_TIMEOUT_MS = 60_000;
// Grace period added to the binding's wire-level timeout before our JS-level
// hard timeout fires. Under healthy operation `tls-client-node` honors
// `timeoutMilliseconds` and rejects on its own; the JS-level race only wins
// when the koffi-loaded native library is wedged (which the binding's own
// timer can't escape).
const HARD_TIMEOUT_GRACE_MS = 10_000;
function installExitHook() {
    if (exitHookInstalled) return;
    exitHookInstalled = true;
    const stop = async ()=>{
        if (clientPromise === null) return;
        try {
            const c = await clientPromise;
            await c.stop?.();
        } catch  {
        // ignore
        }
    };
    process.once("beforeExit", stop);
    process.once("SIGINT", ()=>{
        void stop();
    });
    process.once("SIGTERM", ()=>{
        void stop();
    });
}
/**
 * Drop the cached client so the next `getClient()` call respawns it. Called
 * when a request observes the native binding has wedged — releasing the
 * reference lets a fresh TLSClient (and a fresh koffi load) take over without
 * a process restart.
 */ function resetClientCache() {
    clientPromise = null;
}
class TlsClientHangError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientHangError";
    }
}
/**
 * Race a `client.request()` promise against (a) a JS-level hard timeout and
 * (b) the caller's abort signal. The native binding's `timeoutMilliseconds`
 * already covers the wire path; this guards the case where the koffi binding
 * itself deadlocks (observed after sustained load), where neither the
 * binding's own timer nor a post-call `signal.aborted` re-check can recover.
 */ async function raceWithTimeout(promise, timeoutMs, signal) {
    let timer = null;
    let abortListener = null;
    try {
        const racers = [
            promise,
            new Promise((_, reject)=>{
                timer = setTimeout(()=>{
                    reject(new TlsClientHangError(`tls-client-node call exceeded ${timeoutMs}ms — native binding likely deadlocked`));
                }, timeoutMs);
            })
        ];
        if (signal) {
            racers.push(new Promise((_, reject)=>{
                if (signal.aborted) {
                    reject(makeAbortError(signal));
                    return;
                }
                abortListener = ()=>reject(makeAbortError(signal));
                signal.addEventListener("abort", abortListener, {
                    once: true
                });
            }));
        }
        return await Promise.race(racers);
    } finally{
        if (timer) clearTimeout(timer);
        if (signal && abortListener) signal.removeEventListener("abort", abortListener);
    }
}
async function getClient() {
    if (!clientPromise) {
        clientPromise = (async ()=>{
            try {
                const mod = await __turbopack_context__.A("[externals]/tls-client-node [external] (tls-client-node, esm_import, [project]/node_modules/tls-client-node, async loader)");
                const TLSClient = mod.TLSClient;
                // Native mode loads the shared library directly via koffi, avoiding the
                // managed sidecar's localhost HTTP calls that OmniRoute's global fetch
                // proxy patch interferes with.
                const client = new TLSClient((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientDownloadDir$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildNativeTlsClientOptions"])());
                await client.start();
                installExitHook();
                return client;
            } catch (err) {
                clientPromise = null;
                const msg = err instanceof Error ? err.message : String(err);
                throw new TlsClientUnavailableError(`TLS impersonation client failed to start: ${msg}. ` + `Verify tls-client-node is installed and its native binary downloaded.`);
            }
        })();
    }
    return clientPromise;
}
class TlsClientUnavailableError extends Error {
    constructor(message){
        super(message);
        this.name = "TlsClientUnavailableError";
    }
}
;
;
/**
 * Resolve the proxy URL for a tls-client request. Per-call value wins;
 * otherwise we use the standard proxy fetch resolution which reads from
 * the dashboard AsyncLocalStorage context or falls back to env vars.
 *
 * Fail-closed: if resolution throws (e.g. a configured socks5 proxy with
 * ENABLE_SOCKS5_PROXY=false), this rethrows rather than returning undefined —
 * undefined would let the native binding connect directly and leak the real IP.
 */ function resolveProxyUrl(perCall) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tlsClientProxy$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveTlsClientProxyUrl"])("https://arena.ai", perCall, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$proxyFetch$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["resolveProxyForRequest"]);
}
// Test-only injection point. Tests call __setTlsFetchOverrideForTesting()
// to replace the real TLS client with a mock; production never touches this.
let testOverride = null;
function __setTlsFetchOverrideForTesting(fn) {
    testOverride = fn;
}
function throwIfAborted(signal) {
    if (signal?.aborted) throw makeAbortError(signal);
}
function buildTlsRequestOptions(options) {
    return {
        method: options.method || "GET",
        headers: options.headers || {},
        body: options.body,
        tlsClientIdentifier: LMARENA_PROFILE,
        timeoutMilliseconds: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        followRedirects: true,
        withRandomTLSExtensionOrder: true,
        // Plumb proxy via options — tls-client-node does not read HTTP_PROXY env.
        proxyUrl: resolveProxyUrl(options.proxyUrl)
    };
}
function hardTimeoutMs(options) {
    return (options.timeoutMs ?? DEFAULT_TIMEOUT_MS) + HARD_TIMEOUT_GRACE_MS;
}
async function tlsFetchNonStreaming(client, url, requestOptions, options) {
    let tlsResponse;
    try {
        tlsResponse = await raceWithTimeout(client.request(url, requestOptions), hardTimeoutMs(options), options.signal ?? null);
    } catch (err) {
        if (err instanceof TlsClientHangError) resetClientCache();
        throw err;
    }
    throwIfAborted(options.signal);
    return {
        status: tlsResponse.status,
        headers: toHeaders(tlsResponse.headers),
        text: tlsResponse.body,
        body: null
    };
}
async function tlsFetchLMArena(url, options = {}) {
    if (testOverride) return testOverride(url, options);
    throwIfAborted(options.signal);
    const client = await getClient();
    throwIfAborted(options.signal);
    const requestOptions = buildTlsRequestOptions(options);
    if (options.stream) {
        return tlsFetchStreaming(client, url, requestOptions, options.streamEofSymbol, options.signal ?? null, hardTimeoutMs(options));
    }
    return tlsFetchNonStreaming(client, url, requestOptions, options);
}
function makeAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function toHeaders(raw) {
    const h = new Headers();
    for (const [k, vs] of Object.entries(raw || {})){
        for (const v of vs)h.append(k, v);
    }
    return h;
}
function isCloudflareChallenge(text) {
    if (!text) return false;
    return /just a moment|window\._cf_chl_opt|challenges\.cloudflare\.com|attention required|cf-chl/i.test(text);
}
// ─── Streaming via temp file ────────────────────────────────────────────────
// tls-client-node's streaming primitive writes the response body chunk-by-chunk
// to a file path, terminating when the upstream sends `streamOutputEOFSymbol`.
// We tail the file from a worker and surface the bytes as a ReadableStream.
async function tlsFetchStreaming(client, url, requestOptions, eofSymbol = "[DONE]", signal = null, hardTimeoutMs = DEFAULT_TIMEOUT_MS + HARD_TIMEOUT_GRACE_MS) {
    const dir = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["mkdtemp"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["tmpdir"])(), "LMArena-stream-"));
    const path = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(dir, `${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])()}.ndjson`);
    const streamOpts = {
        ...requestOptions,
        streamOutputPath: path,
        streamOutputBlockSize: 1024,
        streamOutputEOFSymbol: eofSymbol
    };
    // Kick off the request without awaiting — tls-client writes the body to
    // `path` chunk-by-chunk while the call runs. The Promise resolves when the
    // request fully completes (full body written). Wrapping in raceWithTimeout
    // guarantees this promise eventually settles even if the koffi binding
    // wedges; on hang we reset the singleton so the next request respawns.
    let resetOnHang = true;
    const requestPromise = raceWithTimeout(client.request(url, streamOpts), hardTimeoutMs, signal).catch((err)=>{
        if (resetOnHang && err instanceof TlsClientHangError) {
            resetClientCache();
            resetOnHang = false;
        }
        // Re-throw so downstream consumers (waitForContent, tailFile) observe
        // the rejection and surface it instead of treating the stream as having
        // ended cleanly.
        throw err;
    });
    // Wait for the file to exist AND have at least one byte.
    const ready = await waitForContent(path, 5_000, requestPromise);
    if (!ready) {
        const r = await requestPromise.catch((e)=>({
                status: 502,
                headers: {},
                body: String(e)
            }));
        await cleanupTempPath(path);
        return {
            status: r.status,
            headers: toHeaders(r.headers),
            text: r.body,
            body: null
        };
    }
    // Peek at the first bytes to distinguish a genuine NDJSON stream from a
    // Cloudflare challenge page or an HTML error response that tls-client-node
    // streamed to the temp file with a 200 status.
    const peek = await readFirstBytes(path, 256);
    if (isCloudflareChallenge(peek)) {
        await cleanupTempPath(path);
        return {
            status: 403,
            headers: new Headers({
                "Content-Type": "text/html"
            }),
            text: peek,
            body: null
        };
    }
    if (peek.trimStart().startsWith("<")) {
        // HTML error page (not a challenge) — surface as a non-2xx so the executor
        // can emit a proper SSE error chunk instead of feeding HTML to the NDJSON
        // parser.
        await cleanupTempPath(path);
        return {
            status: 502,
            headers: new Headers({
                "Content-Type": "text/html"
            }),
            text: peek,
            body: null
        };
    }
    // Looks like NDJSON — start tailing. The requestPromise will eventually
    // resolve with the real upstream status; tailFile propagates non-2xx errors
    // into the stream so the consumer sees them instead of a truncated success.
    const stream = tailFile(path, eofSymbol, requestPromise, signal);
    const headers = new Headers({
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache"
    });
    return {
        status: 200,
        headers,
        text: null,
        body: stream
    };
}
async function cleanupTempPath(path) {
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["unlink"])(path).catch(()=>{});
    await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["rmdir"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(path)).catch(()=>{});
}
async function readFirstBytes(path, n) {
    const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
    try {
        const buf = Buffer.alloc(n);
        const { bytesRead } = await fd.read(buf, 0, n, 0);
        return buf.subarray(0, bytesRead).toString("utf8");
    } finally{
        await fd.close().catch(()=>{});
    }
}
/**
 * Wait for the streaming output file to exist AND contain at least one byte.
 * Returns false if the request settles before any bytes arrive (so the caller
 * can drain `requestPromise` and surface the real upstream status). Returns
 * true as soon as the file has data — even one byte is enough for the NDJSON
 * heuristic to give a useful answer.
 */ async function waitForContent(path, timeoutMs, requestPromise) {
    let requestSettled = false;
    requestPromise.then(()=>{
        requestSettled = true;
    }, ()=>{
        requestSettled = true;
    });
    const start = Date.now();
    while(Date.now() - start < timeoutMs){
        try {
            const s = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["stat"])(path);
            if (s.size > 0) return true;
        } catch  {
        // file doesn't exist yet
        }
        // If the request finished without producing any bytes, no point waiting
        // out the rest of the timeout — let the caller drain it.
        if (requestSettled) return false;
        await sleep(25);
    }
    return false;
}
/** Enqueue chunk bytes, splitting off an EOF symbol when present. Returns true if closed. */ function enqueueChunkMaybeEof(controller, chunk, eofSymbol) {
    const text = chunk.toString("utf8");
    if (!text.includes(eofSymbol)) {
        controller.enqueue(Buffer.from(chunk));
        return false;
    }
    const beforeEof = text.substring(0, text.indexOf(eofSymbol));
    if (beforeEof) controller.enqueue(Buffer.from(beforeEof, "utf8"));
    controller.close();
    return true;
}
async function drainRemaining(fd, buf, offsetRef, controller, eofSymbol) {
    while(true){
        const { bytesRead } = await fd.read(buf, 0, buf.length, offsetRef.offset);
        if (bytesRead === 0) return "drained";
        const chunk = buf.subarray(0, bytesRead);
        offsetRef.offset += bytesRead;
        if (enqueueChunkMaybeEof(controller, chunk, eofSymbol)) return "closed";
    }
}
function tailFile(path, eofSymbol, done, signal = null) {
    return new ReadableStream({
        async start (controller) {
            const fd = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["open"])(path, "r");
            const buf = Buffer.alloc(64 * 1024);
            const offsetRef = {
                offset: 0
            };
            let finished = false;
            let aborted = false;
            let upstreamError = null;
            let errored = false;
            done.then(()=>{
                finished = true;
            }, (err)=>{
                upstreamError = err instanceof Error ? err : new Error(String(err));
                finished = true;
            });
            const onAbort = ()=>{
                aborted = true;
            };
            if (signal) {
                if (signal.aborted) aborted = true;
                else signal.addEventListener("abort", onAbort, {
                    once: true
                });
            }
            try {
                while(!aborted){
                    const { bytesRead } = await fd.read(buf, 0, buf.length, offsetRef.offset);
                    if (bytesRead > 0) {
                        const chunk = buf.subarray(0, bytesRead);
                        offsetRef.offset += bytesRead;
                        if (enqueueChunkMaybeEof(controller, chunk, eofSymbol)) return;
                    }
                    if (!finished) {
                        await sleep(25);
                        continue;
                    }
                    const drained = await drainRemaining(fd, buf, offsetRef, controller, eofSymbol);
                    if (drained === "closed") return;
                    if (upstreamError && !errored) {
                        errored = true;
                        controller.error(upstreamError);
                        return;
                    }
                    controller.close();
                    return;
                }
            } catch (err) {
                if (!errored) {
                    errored = true;
                    controller.error(err instanceof Error ? err : new Error(String(err)));
                }
            } finally{
                await fd.close().catch(()=>{});
                await cleanupTempPath(path);
                if (signal) signal.removeEventListener("abort", onAbort);
            }
        }
    });
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_services_1mi7a_f._.js.map
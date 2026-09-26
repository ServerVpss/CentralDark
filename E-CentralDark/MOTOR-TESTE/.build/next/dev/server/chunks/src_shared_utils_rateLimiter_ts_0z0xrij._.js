module.exports = [
"[project]/src/shared/utils/rateLimiter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_createRedisLogThrottleForTests",
    ()=>_createRedisLogThrottleForTests,
    "checkRateLimit",
    ()=>checkRateLimit,
    "createRedisLogThrottle",
    ()=>createRedisLogThrottle,
    "evictStaleRateLimitWindows",
    ()=>evictStaleRateLimitWindows,
    "getRedisClient",
    ()=>getRedisClient,
    "isRedisConfigured",
    ()=>isRedisConfigured,
    "setRateLimiterTestMode",
    ()=>setRateLimiterTestMode
]);
// Redis is optional. When REDIS_URL is unset, use a process-local fallback
// instead of probing localhost on every API request.
const REDIS_URL = process.env.REDIS_URL?.trim() || "";
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
// #6559 — `ioredis` must stay a LAZY dependency here. This module is bundled
// (via esbuild --packages=external) into the MCP server output, and esbuild
// hoists any static top-level `import ... from "ioredis"` into a real
// top-level ESM import in the compiled bundle — even though this module is
// only ever reached through a dynamic `await import(...)` several call-sites
// deep (apiKeys.ts -> mcpCallerIdentity.ts -> compressionTools.ts -> server.ts).
// A static import forces Node to resolve `ioredis` at module-link time,
// before any `--mcp` startup code runs, and `ioredis` is not guaranteed to
// ship in the MCP-only bundle's node_modules. Mirrors the established
// soft-dependency pattern in src/lib/quota/redisQuotaStore.ts.
let redisClientPromise = null;
function isRedisConfigured() {
    return REDIS_URL.length > 0;
}
function createRedisLogThrottle() {
    let lastLogged = null;
    return {
        shouldLog (message) {
            if (message === lastLogged) return false;
            lastLogged = message;
            return true;
        },
        reset () {
            lastLogged = null;
        }
    };
}
const redisLogThrottle = createRedisLogThrottle();
function _createRedisLogThrottleForTests() {
    return createRedisLogThrottle();
}
function getRedisClient() {
    if (!isRedisConfigured()) {
        throw new Error("Redis is not configured");
    }
    if (!redisClientPromise) {
        redisClientPromise = (async ()=>{
            // Lazy dynamic import — see the #6559 note above the singleton declaration.
            const mod = await __turbopack_context__.A("[project]/node_modules/ioredis/built/index.js [app-route] (ecmascript, async loader)");
            const RedisCtor = mod.default ?? mod;
            const client = new RedisCtor(REDIS_URL, {
                maxRetriesPerRequest: 3,
                enableReadyCheck: false,
                retryStrategy (times) {
                    return Math.min(times * 50, 2000); // Exponential backoff
                }
            });
            client.on("error", (err)=>{
                // Throttle: log once per error-state change instead of on every retry (#4878).
                if (redisLogThrottle.shouldLog(err.message)) {
                    console.error("[REDIS] Error:", err.message);
                }
            });
            // A successful connection resets the throttle so the next failure logs again.
            client.on("ready", ()=>redisLogThrottle.reset());
            return client;
        })();
    }
    return redisClientPromise;
}
/**
 * Atomic Lua script for multi-rule rate limiting using fixed window.
 * Returns {1, 0} if allowed, or {0, failedWindow} if rejected.
 */ const RATE_LIMIT_SCRIPT = `
local key_prefix = KEYS[1]
local current_time = tonumber(ARGV[1])

local rules = {}
for i = 2, #ARGV, 2 do
  table.insert(rules, {
    limit = tonumber(ARGV[i]),
    window = tonumber(ARGV[i+1])
  })
end

-- First pass: check if any limit is exceeded
for i, rule in ipairs(rules) do
  local current_window = math.floor(current_time / rule.window)
  local window_key = key_prefix .. ":" .. rule.window .. ":" .. current_window

  local count = tonumber(redis.call("GET", window_key) or "0")
  if count >= rule.limit then
    return { 0, rule.window } -- Reject, return which window failed
  end
end

-- Second pass: increment all rules
for i, rule in ipairs(rules) do
  local current_window = math.floor(current_time / rule.window)
  local window_key = key_prefix .. ":" .. rule.window .. ":" .. current_window

  local count = redis.call("INCR", window_key)
  if count == 1 then
    -- TTL is twice the window size to ensure it covers the current window safely
    redis.call("EXPIRE", window_key, rule.window * 2)
  end
end

return { 1, 0 } -- Accepted
`;
const TEST_MEMORY_STORE = new Map();
const FALLBACK_MEMORY_STORE = new Map();
let explicitTestMode = false;
// Minimum store size before we bother sweeping (avoids O(n) cost on tiny stores)
const EVICTION_THRESHOLD = 50;
function evictStaleRateLimitWindows(store, nowSeconds) {
    for (const key of store.keys()){
        // Format: rl:api_key:{id}:{windowSize}:{windowNumber}
        // Split only on the last two colons to handle ids that contain colons.
        const lastColon = key.lastIndexOf(":");
        if (lastColon === -1) continue;
        const secondLastColon = key.lastIndexOf(":", lastColon - 1);
        if (secondLastColon === -1) continue;
        const windowNumber = Number(key.slice(lastColon + 1));
        const windowSize = Number(key.slice(secondLastColon + 1, lastColon));
        if (!Number.isFinite(windowNumber) || !Number.isFinite(windowSize) || windowSize <= 0) {
            continue;
        }
        const windowEnd = (windowNumber + 1) * windowSize;
        if (windowEnd <= nowSeconds) {
            store.delete(key);
        }
    }
}
function setRateLimiterTestMode(enabled) {
    explicitTestMode = enabled;
    if (enabled) TEST_MEMORY_STORE.clear();
}
function checkInMemoryRateLimit(store, keyId, rules) {
    const now = Math.floor(Date.now() / 1000);
    // Opportunistic eviction: sweep stale windows when the store has grown past
    // the threshold. Bounded O(n) sweep — no timer, no background work.
    if (store.size > EVICTION_THRESHOLD) {
        evictStaleRateLimitWindows(store, now);
    }
    for (const rule of rules){
        const currentWindow = Math.floor(now / rule.window);
        const windowKey = `rl:api_key:${keyId}:${rule.window}:${currentWindow}`;
        const count = store.get(windowKey) || 0;
        if (count >= rule.limit) {
            return {
                allowed: false,
                failedWindow: rule.window
            };
        }
    }
    for (const rule of rules){
        const currentWindow = Math.floor(now / rule.window);
        const windowKey = `rl:api_key:${keyId}:${rule.window}:${currentWindow}`;
        store.set(windowKey, (store.get(windowKey) || 0) + 1);
    }
    return {
        allowed: true
    };
}
async function checkRateLimit(keyId, rules) {
    if (!rules || rules.length === 0) return {
        allowed: true
    };
    // ── In-memory mock for unit tests ──
    const isTestMode = explicitTestMode || ("TURBOPACK compile-time value", "development") === "test" || process.env.DISABLE_SQLITE_AUTO_BACKUP === "true";
    if (isTestMode) {
        return checkInMemoryRateLimit(TEST_MEMORY_STORE, keyId, rules);
    }
    if (!isRedisConfigured()) {
        return checkInMemoryRateLimit(FALLBACK_MEMORY_STORE, keyId, rules);
    }
    const redis = await getRedisClient();
    const args = [
        Math.floor(Date.now() / 1000)
    ];
    for (const rule of rules){
        args.push(rule.limit, rule.window);
    }
    try {
        const result = await redis.eval(RATE_LIMIT_SCRIPT, 1, `rl:api_key:${keyId}`, ...args);
        if (result[0] === 0) {
            return {
                allowed: false,
                failedWindow: result[1]
            };
        }
        return {
            allowed: true
        };
    } catch (error) {
        // Fail-open strategy if Redis goes down to prevent complete API outage
        console.error("[RATE_LIMITER] Redis eval failed, bypassing rate limit:", error);
        return {
            allowed: true
        };
    }
}
}),
];

//# sourceMappingURL=src_shared_utils_rateLimiter_ts_0z0xrij._.js.map
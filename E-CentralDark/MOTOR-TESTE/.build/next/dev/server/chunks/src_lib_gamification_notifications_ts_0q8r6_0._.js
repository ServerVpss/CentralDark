module.exports = [
"[project]/src/lib/gamification/notifications.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Badge unlock notification system.
 * Emits events that the dashboard can listen to for toast notifications.
 *
 * @module lib/gamification/notifications
 */ __turbopack_context__.s([
    "consumeBadgeUnlocks",
    ()=>consumeBadgeUnlocks,
    "createBadgeNotificationStream",
    ()=>createBadgeNotificationStream,
    "recordBadgeUnlock",
    ()=>recordBadgeUnlock
]);
// In-memory event buffer for SSE streaming
const recentUnlocks = new Map();
const MAX_BUFFER_SIZE = 50;
const BUFFER_TTL_MS = 60_000; // 1 minute
const STALE_KEY_TTL_MS = 120_000; // 2 minutes for stale key cleanup
function recordBadgeUnlock(apiKeyId, event) {
    if (!recentUnlocks.has(apiKeyId)) {
        recentUnlocks.set(apiKeyId, []);
    }
    const list = recentUnlocks.get(apiKeyId);
    list.push({
        event,
        addedAt: Date.now()
    });
    // Trim old entries for this key
    const cutoff = Date.now() - BUFFER_TTL_MS;
    while(list.length > 0 && list[0].addedAt < cutoff){
        list.shift();
    }
    if (list.length > MAX_BUFFER_SIZE) {
        list.splice(0, list.length - MAX_BUFFER_SIZE);
    }
    // Periodic stale key cleanup (on each record, check all keys)
    const staleCutoff = Date.now() - STALE_KEY_TTL_MS;
    for (const [key, entries] of recentUnlocks){
        // Remove old entries
        const fresh = entries.filter((e)=>e.addedAt >= staleCutoff);
        if (fresh.length === 0) {
            recentUnlocks.delete(key);
        } else if (fresh.length !== entries.length) {
            recentUnlocks.set(key, fresh);
        }
    }
}
function consumeBadgeUnlocks(apiKeyId) {
    const entries = recentUnlocks.get(apiKeyId) || [];
    recentUnlocks.delete(apiKeyId);
    return entries.map((e)=>e.event);
}
function createBadgeNotificationStream(apiKeyId, signal) {
    return new ReadableStream({
        start (controller) {
            const encoder = new TextEncoder();
            let closed = false;
            const safeEnqueue = (chunk)=>{
                if (closed) return;
                try {
                    controller.enqueue(chunk);
                } catch  {
                    closed = true;
                    clearInterval(interval);
                    clearInterval(heartbeat);
                }
            };
            // Check for unlocks every 2s
            const interval = setInterval(()=>{
                const events = consumeBadgeUnlocks(apiKeyId);
                for (const event of events){
                    safeEnqueue(encoder.encode(`event: badge_unlock\ndata: ${JSON.stringify(event)}\n\n`));
                }
            }, 2000);
            // Heartbeat every 15s
            const heartbeat = setInterval(()=>{
                safeEnqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
            }, 15_000);
            // Cleanup on abort
            const cleanup = ()=>{
                closed = true;
                clearInterval(interval);
                clearInterval(heartbeat);
                try {
                    controller.close();
                } catch  {
                /* already closed */ }
            };
            if (signal) {
                signal.addEventListener("abort", cleanup);
            }
        }
    });
}
}),
];

//# sourceMappingURL=src_lib_gamification_notifications_ts_0q8r6_0._.js.map
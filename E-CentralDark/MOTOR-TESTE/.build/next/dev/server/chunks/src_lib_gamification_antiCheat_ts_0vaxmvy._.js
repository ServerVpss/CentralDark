module.exports = [
"[project]/src/lib/gamification/antiCheat.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAnomalies",
    ()=>getAnomalies,
    "validateScoreChange",
    ()=>validateScoreChange
]);
/**
 * Anti-cheat system — server-side validation and anomaly detection.
 *
 * @module lib/gamification/antiCheat
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
function db() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
}
// ─── Constants ────────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_XP_PER_WINDOW = 1000;
const ANOMALY_Z_THRESHOLD = 3;
async function validateScoreChange(apiKeyId, _action, amount) {
    // Rate limiting: max XP per window
    const recentXp = await getRecentXp(apiKeyId, RATE_LIMIT_WINDOW_MS);
    if (recentXp + amount > MAX_XP_PER_WINDOW) {
        return {
            allowed: false,
            reason: `Rate limit exceeded: ${recentXp + amount} > ${MAX_XP_PER_WINDOW} XP/min`
        };
    }
    // Anomaly detection: check if this user's XP velocity is abnormal
    const isAnomaly = await detectAnomaly(apiKeyId);
    if (isAnomaly) {
        return {
            allowed: false,
            reason: "Anomalous XP velocity detected"
        };
    }
    return {
        allowed: true
    };
}
async function getAnomalies() {
    const d = db();
    const rows = d.prepare(`SELECT api_key_id, SUM(xp_earned) AS hourly_total
       FROM xp_audit_log
       WHERE created_at > datetime('now', '-1 hour')
       GROUP BY api_key_id
       HAVING hourly_total > 1000`).all();
    const results = [];
    for (const r of rows){
        const z = await computeZScore(r.api_key_id);
        results.push({
            apiKeyId: r.api_key_id,
            xpLastHour: r.hourly_total,
            zScore: z ?? 0
        });
    }
    return results;
}
// ─── Internal Helpers ────────────────────────────────────────────────────────
/**
 * Compute the z-score for a user's hourly XP against the global distribution.
 * Returns null if insufficient data.
 */ async function computeZScore(apiKeyId) {
    const d = db();
    const userRow = d.prepare(`SELECT COALESCE(SUM(xp_earned), 0) AS total
       FROM xp_audit_log
       WHERE api_key_id = ? AND created_at > datetime('now', '-1 hour')`).get(apiKeyId);
    const statsRow = d.prepare(`SELECT AVG(hourly_total) AS mean,
              CASE WHEN AVG(hourly_total) = 0 THEN 1
                   ELSE AVG(hourly_total * hourly_total) - AVG(hourly_total) * AVG(hourly_total)
              END AS variance
       FROM (
         SELECT api_key_id, SUM(xp_earned) AS hourly_total
         FROM xp_audit_log
         WHERE created_at > datetime('now', '-1 hour')
         GROUP BY api_key_id
       )`).get();
    if (!statsRow || statsRow.variance <= 0) return null;
    const stdDev = Math.sqrt(statsRow.variance);
    return (userRow.total - statsRow.mean) / stdDev;
}
/**
 * Get total XP earned in the last N milliseconds.
 */ async function getRecentXp(apiKeyId, windowMs) {
    const d = db();
    const since = new Date(Date.now() - windowMs).toISOString();
    const row = d.prepare("SELECT COALESCE(SUM(xp_earned), 0) AS total FROM xp_audit_log WHERE api_key_id = ? AND created_at > ?").get(apiKeyId, since);
    return row.total;
}
/**
 * Detect anomalous XP velocity using z-score.
 */ async function detectAnomaly(apiKeyId) {
    const z = await computeZScore(apiKeyId);
    return z !== null && z > ANOMALY_Z_THRESHOLD;
}
}),
];

//# sourceMappingURL=src_lib_gamification_antiCheat_ts_0vaxmvy._.js.map
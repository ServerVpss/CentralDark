module.exports = [
"[project]/src/lib/gamification/streaks.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStreak",
    ()=>getStreak,
    "updateStreak",
    ()=>updateStreak
]);
/**
 * Streak Tracker for OmniRoute Gamification
 *
 * Tracks consecutive daily active usage per API key.
 * Stores streak data in the existing `key_value` table with
 * namespace `gamification:streaks` to avoid schema changes.
 *
 * @module lib/gamification/streaks
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/core.ts [app-route] (ecmascript) <locals>");
;
// ─── Constants ───────────────────────────────────────────────────────────────
const NAMESPACE = "gamification:streaks";
/** One day in milliseconds */ const MS_PER_DAY = 86_400_000;
// ─── Helpers ─────────────────────────────────────────────────────────────────
/**
 * Get today's date as YYYY-MM-DD in UTC.
 */ function todayUtc() {
    return new Date().toISOString().split("T")[0];
}
/**
 * Get yesterday's date as YYYY-MM-DD in UTC.
 */ function yesterdayUtc() {
    return new Date(Date.now() - MS_PER_DAY).toISOString().split("T")[0];
}
function emptyStreak() {
    return {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: "",
        streakStartDate: ""
    };
}
function parseStreakJson(raw) {
    try {
        const parsed = JSON.parse(raw);
        return {
            currentStreak: typeof parsed.currentStreak === "number" ? parsed.currentStreak : 0,
            longestStreak: typeof parsed.longestStreak === "number" ? parsed.longestStreak : 0,
            lastActiveDate: typeof parsed.lastActiveDate === "string" ? parsed.lastActiveDate : "",
            streakStartDate: typeof parsed.streakStartDate === "string" ? parsed.streakStartDate : ""
        };
    } catch  {
        return emptyStreak();
    }
}
async function getStreak(apiKeyId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"]) return emptyStreak();
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const row = db.prepare("SELECT value FROM key_value WHERE namespace = ? AND key = ?").get(NAMESPACE, apiKeyId);
    if (!row?.value) return emptyStreak();
    return parseStreakJson(row.value);
}
async function updateStreak(apiKeyId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isBuildPhase"] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isCloud"]) return 0;
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$core$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getDbInstance"])();
    const today = todayUtc();
    const streak = await getStreak(apiKeyId);
    // Already counted today
    if (streak.lastActiveDate === today) {
        return streak.currentStreak;
    }
    const yesterday = yesterdayUtc();
    let newStreak;
    if (streak.lastActiveDate === yesterday) {
        // Consecutive day — extend streak
        newStreak = streak.currentStreak + 1;
    } else {
        // Streak broken or first activity — start fresh
        newStreak = 1;
    }
    const newData = {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastActiveDate: today,
        streakStartDate: newStreak === 1 ? today : streak.streakStartDate
    };
    db.prepare("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES (?, ?, ?)").run(NAMESPACE, apiKeyId, JSON.stringify(newData));
    return newStreak;
}
}),
];

//# sourceMappingURL=src_lib_gamification_streaks_ts_17kfzwm._.js.map
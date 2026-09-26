module.exports = [
"[project]/src/lib/gamification/leaderboard.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Leaderboard engine — score management, ranking, and scope rotation.
 *
 * @module lib/gamification/leaderboard
 */ // ─── Types ────────────────────────────────────────────────────────────────────
__turbopack_context__.s([
    "getNeighbors",
    ()=>getNeighbors,
    "getRank",
    ()=>getRank,
    "getTopN",
    ()=>getTopN,
    "rotateScope",
    ()=>rotateScope,
    "updateScore",
    ()=>updateScore
]);
async function updateScore(apiKeyId, scope, points) {
    const { updateScore: dbUpdateScore } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [instrumentation] (ecmascript, async loader)");
    dbUpdateScore(apiKeyId, scope, points);
}
async function getRank(apiKeyId, scope) {
    const { getRank: dbGetRank } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [instrumentation] (ecmascript, async loader)");
    return dbGetRank(apiKeyId, scope);
}
async function getTopN(scope, limit = 50, offset = 0) {
    const { getTopN: dbGetTopN } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [instrumentation] (ecmascript, async loader)");
    return dbGetTopN(scope, limit, offset);
}
async function getNeighbors(apiKeyId, scope, radius = 5) {
    const { getLeaderboardNeighbors } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [instrumentation] (ecmascript, async loader)");
    return getLeaderboardNeighbors(apiKeyId, scope, radius);
}
async function rotateScope(scope) {
    const { rotateLeaderboardScope } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [instrumentation] (ecmascript, async loader)");
    rotateLeaderboardScope(scope);
}
}),
];

//# sourceMappingURL=src_lib_gamification_leaderboard_ts_08pm1yu._.js.map
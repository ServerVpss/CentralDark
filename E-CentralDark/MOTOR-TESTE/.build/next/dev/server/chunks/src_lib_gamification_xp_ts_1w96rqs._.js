module.exports = [
"[project]/src/lib/gamification/xp.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * XP/Level Engine for OmniRoute Gamification
 *
 * Pure functions for XP calculations, level progression, and reward definitions.
 * No side effects or DB calls — all stateful logic lives in the persistence layer.
 */ // ─── XP Curve ────────────────────────────────────────────────────────────────
/**
 * XP required for a specific level (delta, not cumulative).
 * Polynomial curve: `xp_for_level(n) = floor(100 * n^1.5)`
 *
 * @param level - Target level (must be >= 1)
 * @returns XP needed to gain this level (0 for level 1)
 *
 * @example
 * xpForLevel(1)  // 0
 * xpForLevel(10) // 3162
 * xpForLevel(50) // 35355
 */ __turbopack_context__.s([
    "XP_REWARDS",
    ()=>XP_REWARDS,
    "calculateLevel",
    ()=>calculateLevel,
    "cumulativeXpForLevel",
    ()=>cumulativeXpForLevel,
    "getLevelTier",
    ()=>getLevelTier,
    "getLevelTitle",
    ()=>getLevelTitle,
    "xpForLevel",
    ()=>xpForLevel,
    "xpToNextLevel",
    ()=>xpToNextLevel
]);
function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level, 1.5));
}
function cumulativeXpForLevel(level) {
    if (level <= 1) return 0;
    let total = 0;
    for(let i = 2; i <= level; i++){
        total += xpForLevel(i);
    }
    return total;
}
function calculateLevel(totalXp) {
    if (totalXp <= 0) return 1;
    return Math.max(1, Math.floor(Math.pow(totalXp * 2.5 / 100, 0.4)));
}
function xpToNextLevel(totalXp) {
    const currentLevel = calculateLevel(totalXp);
    const nextLevelXp = cumulativeXpForLevel(currentLevel + 1);
    return nextLevelXp - totalXp;
}
function getLevelTitle(level) {
    if (level >= 76) return "Legend";
    if (level >= 51) return "Master";
    if (level >= 26) return "Expert";
    if (level >= 11) return "Explorer";
    return "Beginner";
}
function getLevelTier(level) {
    if (level >= 76) return "diamond";
    if (level >= 51) return "platinum";
    if (level >= 26) return "gold";
    if (level >= 11) return "silver";
    return "bronze";
}
const XP_REWARDS = {
    /** Per API request routed through OmniRoute */ request: 1,
    /** Switching to a different provider */ provider_switch: 5,
    /** Switching to a different model */ model_switch: 3,
    /** Creating a new combo */ combo_create: 10,
    /** Using a combo for a request */ combo_use: 2,
    /** Per 1 000 tokens shared with another user */ token_share: 1,
    /** Redeeming an invite code */ invite_redeem: 50,
    /** Daily active usage (once per day) */ daily_login: 5,
    /** Per consecutive streak day (multiplied by streak length) */ streak_bonus: 2,
    /** Unlocking a badge */ badge_unlock: 10
};
}),
];

//# sourceMappingURL=src_lib_gamification_xp_ts_1w96rqs._.js.map
module.exports = [
"[project]/src/lib/gamification/invites.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createInvite",
    ()=>createInvite,
    "listInvites",
    ()=>listInvites,
    "redeemInvite",
    ()=>redeemInvite,
    "revokeInvite",
    ()=>revokeInvite
]);
/**
 * Invite/redeem tokens for server connection.
 *
 * @module lib/gamification/invites
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
/**
 * Generate an invite code (8-char alphanumeric, human-readable).
 */ function generateInviteCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for(let i = 0; i < 8; i++){
        code += chars[__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomInt(0, chars.length)];
    }
    return code;
}
/**
 * Hash a token for storage (SHA-256).
 */ function hashToken(token) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha256").update(token).digest("hex");
}
async function createInvite(createdByApiKeyId, serverUrl, maxUses = 1) {
    const code = generateInviteCode();
    const token = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    const id = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID();
    const { createInviteToken } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
    createInviteToken(id, code, tokenHash, createdByApiKeyId, serverUrl, maxUses);
    return {
        code,
        token
    };
}
async function redeemInvite(code, usedByApiKeyId) {
    const { getInviteByCode, redeemInvite: dbRedeem } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
    const invite = getInviteByCode(code);
    if (!invite) {
        return {
            success: false,
            error: "Invalid invite code"
        };
    }
    if (invite.revokedAt) {
        return {
            success: false,
            error: "Invite has been revoked"
        };
    }
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return {
            success: false,
            error: "Invite has expired"
        };
    }
    if (invite.useCount >= invite.maxUses) {
        return {
            success: false,
            error: "Invite has been fully redeemed"
        };
    }
    if (invite.createdBy === usedByApiKeyId) {
        return {
            success: false,
            error: "Cannot redeem your own invite"
        };
    }
    const redeemed = dbRedeem(code, usedByApiKeyId);
    if (!redeemed) {
        return {
            success: false,
            error: "Failed to redeem invite"
        };
    }
    return {
        success: true,
        serverUrl: invite.serverUrl || undefined
    };
}
async function listInvites(apiKeyId) {
    const db = (await __turbopack_context__.A("[project]/src/lib/db/core.ts [app-route] (ecmascript, async loader)")).getDbInstance();
    const rows = db.prepare(`SELECT id, code, server_url, max_uses, use_count, expires_at, revoked_at, created_at
       FROM invite_tokens WHERE created_by = ? ORDER BY created_at DESC`).all(apiKeyId);
    return rows.map((r)=>({
            id: r.id,
            code: r.code,
            serverUrl: r.server_url,
            maxUses: r.max_uses,
            useCount: r.use_count,
            expiresAt: r.expires_at,
            revokedAt: r.revoked_at,
            createdAt: r.created_at
        }));
}
async function revokeInvite(inviteId) {
    const { revokeInvite: dbRevoke } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
    dbRevoke(inviteId);
    return true;
}
}),
];

//# sourceMappingURL=src_lib_gamification_invites_ts_0ihl6b1._.js.map
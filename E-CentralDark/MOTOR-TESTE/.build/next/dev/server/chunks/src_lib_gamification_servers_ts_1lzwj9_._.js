module.exports = [
"[project]/src/lib/gamification/servers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectServer",
    ()=>connectServer,
    "disconnectServer",
    ()=>disconnectServer,
    "healthCheck",
    ()=>healthCheck,
    "listServers",
    ()=>listServers,
    "pushScore",
    ()=>pushScore,
    "syncLeaderboard",
    ()=>syncLeaderboard
]);
/**
 * Community server federation — connect, sync, and manage servers.
 *
 * @module lib/gamification/servers
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
async function connectServer(name, url, apiKey) {
    const id = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID();
    const apiKeyHash = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].pbkdf2Sync(apiKey, "omniroute-federation-salt", 120000, 32, "sha256").toString("hex");
    const { connectServer: dbConnect } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
    dbConnect(id, name, url, apiKeyHash);
    return {
        id,
        name,
        url,
        status: "connected",
        lastSyncAt: null,
        errorMessage: null
    };
}
async function disconnectServer(serverId) {
    const { disconnectServer: dbDisconnect } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
    dbDisconnect(serverId);
}
async function listServers() {
    const { listServers: dbList } = await __turbopack_context__.A("[project]/src/lib/db/gamification.ts [app-route] (ecmascript, async loader)");
    return dbList();
}
async function syncLeaderboard(serverId) {
    const db = (await __turbopack_context__.A("[project]/src/lib/db/core.ts [app-route] (ecmascript, async loader)")).getDbInstance();
    const server = db.prepare("SELECT url, api_key_hash FROM community_servers WHERE id = ? AND status = 'connected'").get(serverId);
    if (!server) {
        return {
            synced: 0,
            errors: [
                "Server not found or not connected"
            ]
        };
    }
    try {
        // Fetch remote leaderboard
        const response = await fetch(`${server.url}/api/gamification/federation/leaderboard`, {
            headers: {
                Authorization: `Bearer ${server.api_key_hash}`
            },
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        // Overwrite local scores with remote scores (not additive)
        const db2 = (await __turbopack_context__.A("[project]/src/lib/db/core.ts [app-route] (ecmascript, async loader)")).getDbInstance();
        for (const entry of data.entries){
            db2.prepare(`INSERT INTO leaderboard (api_key_id, scope, score, updated_at)
         VALUES (?, 'global', ?, datetime('now'))
         ON CONFLICT(api_key_id, scope) DO UPDATE SET score = excluded.score, updated_at = excluded.updated_at`).run(entry.apiKeyId, entry.score);
        }
        // Update last sync time
        db.prepare("UPDATE community_servers SET last_sync_at = datetime('now'), error_message = NULL WHERE id = ?").run(serverId);
        return {
            synced: data.entries.length,
            errors: []
        };
    } catch (err) {
        db.prepare("UPDATE community_servers SET status = 'error', error_message = ? WHERE id = ?").run(err.message, serverId);
        return {
            synced: 0,
            errors: [
                err.message
            ]
        };
    }
}
async function pushScore(serverId, apiKeyId, score) {
    const db = (await __turbopack_context__.A("[project]/src/lib/db/core.ts [app-route] (ecmascript, async loader)")).getDbInstance();
    const server = db.prepare("SELECT url, api_key_hash FROM community_servers WHERE id = ? AND status = 'connected'").get(serverId);
    if (!server) {
        return {
            success: false,
            error: "Server not found or not connected"
        };
    }
    try {
        const response = await fetch(`${server.url}/api/gamification/federation/score`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${server.api_key_hash}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                apiKeyId,
                score
            }),
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return {
            success: true
        };
    } catch (err) {
        return {
            success: false,
            error: err.message
        };
    }
}
async function healthCheck(serverId) {
    const db = (await __turbopack_context__.A("[project]/src/lib/db/core.ts [app-route] (ecmascript, async loader)")).getDbInstance();
    const server = db.prepare("SELECT url FROM community_servers WHERE id = ?").get(serverId);
    if (!server) return {
        healthy: false,
        latencyMs: 0
    };
    const start = Date.now();
    try {
        const response = await fetch(`${server.url}/api/gamification/federation/leaderboard`, {
            signal: AbortSignal.timeout(5000)
        });
        return {
            healthy: response.ok,
            latencyMs: Date.now() - start
        };
    } catch  {
        return {
            healthy: false,
            latencyMs: Date.now() - start
        };
    }
}
}),
];

//# sourceMappingURL=src_lib_gamification_servers_ts_1lzwj9_._.js.map
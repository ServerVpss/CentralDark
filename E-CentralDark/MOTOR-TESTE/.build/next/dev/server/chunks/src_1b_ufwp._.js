module.exports = [
"[project]/src/lib/serverLifecycle.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getServerLifecyclePhase",
    ()=>getServerLifecyclePhase,
    "markServerReady",
    ()=>markServerReady,
    "markServerStarting",
    ()=>markServerStarting,
    "markServerStopping",
    ()=>markServerStopping
]);
function getServerLifecyclePhase() {
    return globalThis.__omnirouteServerLifecycle ?? "starting";
}
function markServerStarting() {
    globalThis.__omnirouteServerLifecycle = "starting";
}
function markServerReady() {
    if (getServerLifecyclePhase() !== "stopping") {
        globalThis.__omnirouteServerLifecycle = "ready";
    }
}
function markServerStopping() {
    globalThis.__omnirouteServerLifecycle = "stopping";
}
}),
"[project]/src/instrumentation-node.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureDbReadyForBoot",
    ()=>ensureDbReadyForBoot,
    "normalizeBootError",
    ()=>normalizeBootError,
    "registerNodejs",
    ()=>registerNodejs,
    "renameProcessTitle",
    ()=>renameProcessTitle,
    "scanComboModelNameCollisionsAtBoot",
    ()=>scanComboModelNameCollisionsAtBoot,
    "warmModelCatalogCache",
    ()=>warmModelCatalogCache
]);
/**
 * Node.js-only instrumentation logic.
 *
 * Separated from instrumentation.ts so that Turbopack's Edge bundler
 * does not trace into Node.js-only modules (fs, path, os, better-sqlite3, etc.)
 * and emit spurious "not supported in Edge Runtime" warnings.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$serverLifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/serverLifecycle.ts [instrumentation] (ecmascript)");
;
function getRandomBytes(byteLength) {
    const bytes = new Uint8Array(byteLength);
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
}
function toBase64(bytes) {
    return btoa(String.fromCodePoint(...bytes));
}
function toHex(bytes) {
    return Array.from(bytes, (byte)=>byte.toString(16).padStart(2, "0")).join("");
}
function renameProcessTitle(currentTitle) {
    if (!currentTitle) return currentTitle;
    if (!currentTitle.startsWith("next-server")) return currentTitle;
    return `omniroute${currentTitle.slice("next-server".length)}`;
}
function normalizeBootError(err) {
    return err instanceof Error ? err : new Error(String(err));
}
// Matches sql.js's raw `throw "Database closed"` (and similarly-worded
// variants) thrown when a query runs against an already-closed WASM handle —
// typically a stale globalThis-cached adapter left over by a prior
// close/reload racing with this boot (#6560).
const TRANSIENT_DB_CLOSED_RE = /database\s*(connection\s*)?(is\s*)?closed/i;
async function ensureDbReadyForBoot(ensureDbInitializedFn) {
    const ensureDbInitialized = ensureDbInitializedFn ?? (await __turbopack_context__.A("[project]/src/lib/db/core.ts [instrumentation] (ecmascript, async loader)")).ensureDbInitialized;
    try {
        await ensureDbInitialized();
    } catch (err) {
        const normalized = normalizeBootError(err);
        if (!TRANSIENT_DB_CLOSED_RE.test(normalized.message)) {
            // Fatal, non-transient boot-time DB init failure (e.g. the entire
            // better-sqlite3 -> node:sqlite -> sql.js driver cascade failed, as on
            // Termux/Android when no SQLite driver is usable). This runs BEFORE
            // initConsoleInterceptor() is wired up, so this is the only chance to
            // get the real root cause into stdout/app.log — without it, the
            // process keeps its HTTP listener up while every DB-touching route
            // 500s forever with a permanently empty log (#7773).
            console.error("[STARTUP] Fatal: Database driver initialization failed:", normalized.message);
            throw normalized;
        }
        console.warn("[STARTUP] Database was closed by a prior reload/shutdown — retrying with a fresh connection (#6560):", normalized.message);
        try {
            await ensureDbInitialized();
        } catch (retryErr) {
            const normalizedRetryErr = normalizeBootError(retryErr);
            console.error("[STARTUP] Fatal: Database driver initialization failed after retry:", normalizedRetryErr.message);
            throw normalizedRetryErr;
        }
    }
}
function isBackgroundServicesDisabled() {
    const raw = process.env.OMNIROUTE_DISABLE_BACKGROUND_SERVICES;
    if (!raw) return false;
    return new Set([
        "1",
        "true",
        "yes",
        "on"
    ]).has(raw.trim().toLowerCase());
}
async function ensureSecrets() {
    let getPersistedSecret = (_key)=>null;
    let persistSecret = (_key, _value)=>{};
    try {
        ({ getPersistedSecret, persistSecret } = await __turbopack_context__.A("[project]/src/lib/db/secrets.ts [instrumentation] (ecmascript, async loader)"));
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[STARTUP] Secret persistence unavailable; falling back to process-local secrets:", msg);
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
        const persisted = getPersistedSecret("jwtSecret");
        if (persisted) {
            process.env.JWT_SECRET = persisted;
            console.log("[STARTUP] JWT_SECRET restored from persistent store");
        } else {
            const generated = toBase64(getRandomBytes(48));
            process.env.JWT_SECRET = generated;
            persistSecret("jwtSecret", generated);
            console.log("[STARTUP] JWT_SECRET auto-generated and persisted (random 64-char secret)");
        }
    }
    if (!process.env.API_KEY_SECRET || process.env.API_KEY_SECRET.trim() === "") {
        const persisted = getPersistedSecret("apiKeySecret");
        if (persisted) {
            process.env.API_KEY_SECRET = persisted;
        } else {
            const generated = toHex(getRandomBytes(32));
            process.env.API_KEY_SECRET = generated;
            persistSecret("apiKeySecret", generated);
            console.log("[STARTUP] API_KEY_SECRET auto-generated and persisted (random 64-char hex secret)");
        }
    }
}
async function warmModelCatalogCache() {
    try {
        const { getUnifiedModelsResponse } = await __turbopack_context__.A("[project]/src/app/api/v1/models/catalog.ts [instrumentation] (ecmascript, async loader)");
        await getUnifiedModelsResponse(new Request("http://127.0.0.1/v1/models"));
        console.log("[STARTUP] Model catalog cache warmed");
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[STARTUP] Model catalog warmup failed (non-fatal):", msg);
    }
    try {
        const [{ getProviderConnections }, { getOpenRouterCatalog }] = await Promise.all([
            __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)"),
            __turbopack_context__.A("[project]/src/lib/catalog/openrouterCatalog.ts [instrumentation] (ecmascript, async loader)")
        ]);
        const openrouterConnections = await getProviderConnections({
            provider: "openrouter",
            isActive: true
        });
        if (openrouterConnections.length > 0) {
            await getOpenRouterCatalog();
            console.log("[STARTUP] OpenRouter model catalog cache warmed");
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[STARTUP] OpenRouter catalog warmup failed (non-fatal):", msg);
    }
}
async function scanComboModelNameCollisionsAtBoot() {
    try {
        const [{ getCombos }, { scanCombosForModelCollisions }] = await Promise.all([
            __turbopack_context__.A("[project]/src/lib/db/combos.ts [instrumentation] (ecmascript, async loader)"),
            __turbopack_context__.A("[project]/src/lib/combos/modelNameCollision.ts [instrumentation] (ecmascript, async loader)")
        ]);
        const collisions = scanCombosForModelCollisions(await getCombos());
        if (collisions.length > 0) {
            console.warn(`[STARTUP] ${collisions.length} combo(s) share a name with a real model id (#8530) — ` + "intentional per #6940 bare-model-id fallback, but confirm each is expected: " + collisions.map((c)=>`${c.comboName}→${c.providerId}/${c.modelId}`).join(", "));
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[STARTUP] Could not scan combos for model-name collisions (non-fatal):", msg);
    }
}
async function registerNodejs() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$serverLifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["markServerStarting"])();
    // Rename the process title so OmniRoute is identifiable in ps/htop instead
    // of the generic "next-server" standalone server name.
    process.title = renameProcessTitle(process.title);
    // Initialize proxy fetch patch FIRST (before any HTTP requests)
    await __turbopack_context__.A("[project]/open-sse/index.ts [instrumentation] (ecmascript, async loader)");
    console.log("[STARTUP] Global fetch proxy patch initialized");
    // Guarantee the SQLite singleton — including a sql.js WASM pre-init when
    // both synchronous drivers (better-sqlite3, node:sqlite) are unavailable —
    // is ready before ANY other startup step reaches getDbInstance(). This
    // MUST run before ensureSecrets, clearStaleCrashCooldowns,
    // getSettings, initAuditLog below: those all reach getDbInstance()
    // transitively, and used to run ahead of this call (previously at the end
    // of this function), throwing the misleading "sql.js WASM ainda não foi
    // pré-inicializado" error for an existing DB file when both sync drivers
    // failed (#7288 / #7494). ensureDbInitialized() itself is idempotent and
    // caches the singleton, so every later getDbInstance() call below is a
    // free no-op re-read of the same connection — no double-init cost.
    await ensureDbReadyForBoot();
    await ensureSecrets();
    await Promise.all([
        __turbopack_context__.A("[project]/src/lib/env/runtimeEnv.ts [instrumentation] (ecmascript, async loader)").then(({ enforceWebRuntimeEnv })=>enforceWebRuntimeEnv()),
        __turbopack_context__.A("[project]/src/lib/usage/migrations.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/consoleInterceptor.ts [instrumentation] (ecmascript, async loader)").then(({ initConsoleInterceptor })=>initConsoleInterceptor())
    ]);
    // Clear stale transient connection cooldowns persisted from an unclean crash.
    // A crash mid-burst can leave far-future `rate_limited_until` values in the DB
    // that cause every connection to be skipped by getProviderCredentials(), making
    // all subsequent requests time out at Bottleneck's maxWaitMs (120 s default).
    // Terminal states (banned / expired / credits_exhausted) are intentionally kept.
    // See: https://github.com/diegosouzapw/OmniRoute/issues/3625 (Part A)
    try {
        const { clearStaleCrashCooldowns } = await __turbopack_context__.A("[project]/src/lib/db/providers.ts [instrumentation] (ecmascript, async loader)");
        const { cleared } = clearStaleCrashCooldowns();
        if (cleared > 0) {
            console.log(`[STARTUP] Cleared ${cleared} stale transient connection cooldown(s) from prior crash (#3625)`);
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[STARTUP] Could not clear stale crash cooldowns (non-fatal):", msg);
    }
    await scanComboModelNameCollisionsAtBoot();
    const [{ initGracefulShutdown }, { initApiBridgeServer }, { startBackgroundRefresh }, { ensureCloudSyncInitialized }, { startProviderLimitsSyncScheduler }, { getSettings }, { applyRuntimeSettings }, { startRuntimeConfigHotReload }, { startSpendBatchWriter }, { registerDefaultGuardrails }, { ensurePersistentManagementPasswordHash }, { skillExecutor }, { registerBuiltinSkills }] = await Promise.all([
        __turbopack_context__.A("[project]/src/lib/gracefulShutdown.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/apiBridgeServer.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/domain/quotaCache.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/initCloudSync.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/shared/services/providerLimitsSyncScheduler.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/db/settings.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/config/runtimeSettings.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/config/hotReload.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/spend/batchWriter.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/guardrails/index.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/auth/managementPassword.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/skills/executor.ts [instrumentation] (ecmascript, async loader)"),
        __turbopack_context__.A("[project]/src/lib/skills/builtins.ts [instrumentation] (ecmascript, async loader)")
    ]);
    // Proxy health scheduler (auto-removes dead proxies on interval)
    await __turbopack_context__.A("[project]/src/lib/proxyHealth/scheduler.ts [instrumentation] (ecmascript, async loader)");
    // Free-proxy auto-sync scheduler (re-fetches free-proxy sources on interval, #7079)
    await __turbopack_context__.A("[project]/src/lib/freeProxyProviders/scheduler.ts [instrumentation] (ecmascript, async loader)");
    initGracefulShutdown();
    initApiBridgeServer();
    startSpendBatchWriter();
    registerDefaultGuardrails();
    registerBuiltinSkills(skillExecutor);
    console.log("[STARTUP] Spend batch writer started");
    console.log("[STARTUP] Guardrail registry initialized");
    console.log("[STARTUP] Builtin skill handlers registered");
    if (!isBackgroundServicesDisabled()) {
        startBackgroundRefresh();
        console.log("[STARTUP] Quota cache background refresh started");
        startProviderLimitsSyncScheduler();
        console.log("[STARTUP] Provider limits sync scheduler started");
        const { startQuotaAutoPing } = await __turbopack_context__.A("[project]/src/lib/services/quotaAutoPing.ts [instrumentation] (ecmascript, async loader)");
        startQuotaAutoPing();
        console.log("[STARTUP] Quota auto-ping scheduler started (opt-in, no-op until enabled)");
        const cloudSyncInitialized = await ensureCloudSyncInitialized();
        console.log(`[STARTUP] Cloud/model sync background bootstrap ${cloudSyncInitialized ? "initialized" : "skipped"}`);
        const { initBatchProcessor } = await __turbopack_context__.A("[project]/open-sse/services/batchProcessor.ts [instrumentation] (ecmascript, async loader)");
        initBatchProcessor();
        console.log("[STARTUP] Batch processor started");
    }
    try {
        const [{ migrateCodexConnectionDefaultsFromLegacySettings }, { startSessionAccountAffinityCleanup }, { seedDefaultModelAliases }] = await Promise.all([
            __turbopack_context__.A("[project]/src/lib/providers/codexConnectionDefaults.ts [instrumentation] (ecmascript, async loader)"),
            __turbopack_context__.A("[project]/src/lib/db/sessionAccountAffinity.ts [instrumentation] (ecmascript, async loader)"),
            __turbopack_context__.A("[project]/src/lib/modelAliasSeed.ts [instrumentation] (ecmascript, async loader)")
        ]);
        let settings = await getSettings();
        const passwordState = await ensurePersistentManagementPasswordHash({
            logger: console,
            settings,
            source: "startup"
        });
        settings = passwordState.settings;
        const runtimeChanges = await applyRuntimeSettings(settings, {
            force: true,
            source: "startup"
        });
        if (runtimeChanges.length > 0) {
            console.log(`[STARTUP] Runtime settings hydrated: ${runtimeChanges.map((entry)=>entry.section).join(", ")}`);
        }
        // Restore Global System Prompt into in-memory config (#2468/#2470)
        if (settings.systemPrompt) {
            const { setSystemPromptConfig } = await __turbopack_context__.A("[project]/open-sse/services/systemPrompt.ts [instrumentation] (ecmascript, async loader)");
            setSystemPromptConfig(settings.systemPrompt);
            console.log("[STARTUP] Global System Prompt restored from settings");
        }
        // Restore the proxy-level Thinking-Budget config (#5312 RC-A). It lives in
        // `settings.thinkingBudget` and is NOT covered by applyRuntimeSettings, so
        // without this the dashboard mode (auto/custom/adaptive) silently reverts to
        // the passthrough default on every restart. Previously this was only wired into
        // the unused `server-init.ts`, so it never ran in production.
        const { hydrateThinkingBudgetConfig } = await __turbopack_context__.A("[project]/open-sse/services/thinkingBudget.ts [instrumentation] (ecmascript, async loader)");
        if (hydrateThinkingBudgetConfig(settings)) {
            console.log("[STARTUP] Thinking-Budget config restored from settings");
        }
        // Restore the Task-Aware Smart Routing config (#8601). It lives in
        // `settings.taskRouting` (written as a JSON string by PUT /api/settings/task-routing)
        // and is NOT covered by applyRuntimeSettings, so without this the feature silently
        // reverts to disabled + the default model map on every restart. Same shape as the
        // Thinking-Budget restore above; must live here, not in the unused server-init.ts.
        const { hydrateTaskRoutingConfig } = await __turbopack_context__.A("[project]/open-sse/services/taskAwareRouter.ts [instrumentation] (ecmascript, async loader)");
        if (hydrateTaskRoutingConfig(settings)) {
            console.log("[STARTUP] Task-Aware Routing config restored from settings");
        }
        const seededModelAliases = await seedDefaultModelAliases();
        console.log(`[STARTUP] Model alias seed: applied=${seededModelAliases.applied.length}, skipped=${seededModelAliases.skipped.length}, removed=${seededModelAliases.removed.length}, failed=${seededModelAliases.failed.length}`);
        startSessionAccountAffinityCleanup();
        const migration = await migrateCodexConnectionDefaultsFromLegacySettings();
        if (migration.migrated) {
            console.log(`[STARTUP] Migrated Codex connection defaults for ${migration.updatedConnectionIds.length} connection(s)`);
            if (settings.cloudEnabled === true) {
                const [{ syncToCloud }, { getConsistentMachineId }] = await Promise.all([
                    __turbopack_context__.A("[project]/src/lib/cloudSync.ts [instrumentation] (ecmascript, async loader)"),
                    __turbopack_context__.A("[project]/src/shared/utils/machineId.ts [instrumentation] (ecmascript, async loader)")
                ]);
                const machineId = await getConsistentMachineId();
                await syncToCloud(machineId);
                console.log("[STARTUP] Synced migrated Codex connection defaults to cloud");
            }
        }
        startRuntimeConfigHotReload();
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[STARTUP] Could not restore runtime settings:", msg);
    }
    // Proactively start the credential-health sweep at boot so stale web-session
    // connections (cookies that expired overnight) get re-probed and recovered on
    // startup — instead of staying red until the first real request lazily imports
    // the on-demand credentialGate. Idempotent; self-disables via
    // OMNIROUTE_DISABLE_CREDENTIAL_HEALTH_CHECK and its cadence is tunable via
    // CREDENTIAL_HEALTH_CHECK_INTERVAL. NOTE: this MUST live here (the real Next.js
    // instrumentation startup), NOT in the unused src/server-init.ts.
    try {
        const { initCredentialHealthCheck } = await __turbopack_context__.A("[project]/src/lib/credentialHealth/scheduler.ts [instrumentation] (ecmascript, async loader)");
        initCredentialHealthCheck();
        console.log("[STARTUP] Credential health scheduler started");
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[STARTUP] Could not start credential health scheduler:", msg);
    }
    try {
        const { initAuditLog, cleanupExpiredLogs } = await __turbopack_context__.A("[project]/src/lib/compliance/index.ts [instrumentation] (ecmascript, async loader)");
        initAuditLog();
        console.log("[COMPLIANCE] Audit log table initialized");
        const cleanup = await cleanupExpiredLogs();
        if (cleanup.deletedUsage || cleanup.deletedCallLogs || cleanup.deletedProxyLogs || cleanup.deletedRequestDetailLogs || cleanup.deletedAuditLogs || cleanup.deletedMcpAuditLogs) {
            console.log("[COMPLIANCE] Expired log cleanup:", cleanup);
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[COMPLIANCE] Could not initialize audit log:", msg);
    }
    // Storage-configured scheduled VACUUM (#4437): registers the timer from
    // Settings > System & Storage and persists lastVacuumAt for the UI.
    try {
        const { initVacuumScheduler } = await __turbopack_context__.A("[project]/src/lib/db/vacuumScheduler.ts [instrumentation] (ecmascript, async loader)");
        initVacuumScheduler();
        console.log("[STARTUP] Scheduled VACUUM initialized (#4437)");
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn("[STARTUP] Could not initialize vacuum scheduler (non-fatal):", msg);
    }
    // Warm the model catalog's durable, apiKey-independent sub-caches at
    // startup — see warmModelCatalogCache() for why the top-level Response
    // cache alone doesn't deliver this. Fire-and-forget, non-fatal.
    void warmModelCatalogCache();
    if (!isBackgroundServicesDisabled()) {
        // All services are independent — run in parallel for faster cold start.
        await Promise.allSettled([
            __turbopack_context__.A("[project]/src/lib/services/bootstrap.ts [instrumentation] (ecmascript, async loader)").then(async (m)=>{
                await m.bootstrapEmbeddedServices();
                console.log("[STARTUP] Embedded services bootstrap complete");
            }).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] Embedded services bootstrap failed (non-fatal):", msg);
            }),
            __turbopack_context__.A("[project]/src/lib/services/embedWsProxy.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.initEmbedWsProxy()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] Embed WS proxy failed to start (non-fatal):", msg);
            }),
            __turbopack_context__.A("[project]/open-sse/services/autoRefreshDaemon.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.autoRefreshDaemon.start()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] Auto-refresh daemon failed to start (non-fatal):", msg);
            }),
            // Proactive connection-cooldown recovery (#8): re-validate connections whose
            // transient `rate_limited_until` window has elapsed OUTSIDE the request hot path,
            // so the first request after a cooldown does not pay the probe latency.
            __turbopack_context__.A("[project]/src/lib/quota/connectionRecovery.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.initConnectionRecoveryScheduler()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] Connection recovery scheduler failed to start (non-fatal):", msg);
            }),
            // Arena ELO sync: model intelligence from the Arena AI leaderboard, powering the
            // Free Provider Rankings page. On by default; non-blocking, never fatal.
            __turbopack_context__.A("[project]/src/lib/arenaEloSync.ts [instrumentation] (ecmascript, async loader)").then(async (m)=>{
                const started = await m.initArenaEloSync();
                if (started) console.log("[STARTUP] Arena ELO sync initialized");
            }).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] Arena ELO sync failed to start (non-fatal):", msg);
            }),
            // Pricing sync: opt-in external pricing data (self-gated by PRICING_SYNC_ENABLED inside
            // initPricingSync). Non-blocking, never fatal.
            __turbopack_context__.A("[project]/src/lib/pricingSync.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.initPricingSync()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] Pricing sync failed to start (non-fatal):", msg);
            }),
            // OpenRouter provider stats sync: provider directory + popularity enrichment
            // for the dashboard Providers page. On by default; opt out with
            // OPENROUTER_PROVIDER_STATS_ENABLED=false. Non-blocking, never fatal.
            __turbopack_context__.A("[project]/src/lib/catalog/openrouterProviderStats.ts [instrumentation] (ecmascript, async loader)").then((m)=>{
                const started = m.initOpenRouterProviderStatsSync();
                if (started) console.log("[STARTUP] OpenRouter provider stats sync initialized");
            }).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] OpenRouter provider stats sync failed to start (non-fatal):", msg);
            }),
            // models.dev capability sync: opt-in via Settings > AI (self-gated by
            // settings.modelsDevSyncEnabled inside initModelsDevSync). Non-blocking, never fatal.
            __turbopack_context__.A("[project]/src/lib/modelsDevSync.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.initModelsDevSync()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] models.dev sync failed to start (non-fatal):", msg);
            }),
            // Context-window self-correction (5004): periodically reconcile provider-declared
            // windows (from /models discovery) into auto:discovery overrides. Never fatal.
            __turbopack_context__.A("[project]/src/lib/contextWindowResolver.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.startContextWindowReconcile()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] context-window reconcile failed to start (non-fatal):", msg);
            }),
            // TV6 typed memory decay: optional periodic sweep of decayed episodic memories.
            // Doubly opt-in (no-op unless MEMORY_TYPED_DECAY_ENABLED=true AND
            // MEMORY_TYPED_DECAY_SWEEP_INTERVAL>0). Never deletes by default. Never fatal.
            __turbopack_context__.A("[project]/src/lib/memory/typedDecay.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.startMemoryDecaySweep()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] memory decay sweep failed to start (non-fatal):", msg);
            }),
            // MemoryBackend provider pattern (PR #8752): initialize configured memory
            // backends from settings (sqlite, obsidian, notion, custom HTTP, etc.).
            // Reads the DB settings synchronously (non-blocking, never fatal). Must
            // run after the DB is ready AND after getSettings/applyRuntimeSettings so
            // memory backend config is hydrated.
            __turbopack_context__.A("[project]/src/lib/memory/index.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.initMemoryBackends()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] memory backend initialization failed (non-fatal):", msg);
            }),
            // Backup schedule (#8513): execute `backup-schedule.json` cron server-side.
            // Reads the schedule written by `omniroute backup auto enable` and fires
            // `runBackupCommand` when the cron expression matches. Self-gated: no-op
            // when no schedule file exists or the schedule is disabled. Never fatal.
            __turbopack_context__.A("[project]/src/lib/jobs/backupScheduleJob.ts [instrumentation] (ecmascript, async loader)").then((m)=>m.startBackupScheduleJob()).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] backup schedule job failed to start (non-fatal):", msg);
            }),
            // Real-time dashboard WebSocket daemon (port 20132): powers Combo Studio Live,
            // the Home live-pulse, and Live Compression. Side-effect import triggers the
            // flag-gated auto-start (OMNIROUTE_ENABLE_LIVE_WS, default ON).
            __turbopack_context__.A("[project]/src/server/ws/liveServer.ts [instrumentation] (ecmascript, async loader)").then(()=>{
                console.log("[STARTUP] Live dashboard WebSocket daemon bootstrap invoked");
            }).catch((err)=>{
                const msg = err instanceof Error ? err.message : String(err);
                console.warn("[STARTUP] Live dashboard WebSocket daemon failed to start (non-fatal):", msg);
            })
        ]);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$serverLifecycle$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["markServerReady"])();
}
}),
];

//# sourceMappingURL=src_1b_ufwp._.js.map
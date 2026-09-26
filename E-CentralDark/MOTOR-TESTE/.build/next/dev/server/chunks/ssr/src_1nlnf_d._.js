module.exports = [
"[project]/src/lib/oauth/credentialBlob.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Paste-safe credential blob codec for the remote OAuth login helper.
 *
 * Why this exists: Google's `firstparty/nativeapp` consent for embedded desktop
 * clients (Antigravity/agy) only releases the authorization code when the
 * loopback redirect (127.0.0.1:<port>) is reachable. On a remote VPS install the
 * loopback is unreachable, so the consent hangs and never emits a code — there is
 * nothing for the user to paste back. (The same flow works locally and over an SSH
 * tunnel because then the loopback IS reachable.)
 *
 * The workaround: a local helper (`omniroute login antigravity`) runs the OAuth on
 * the user's own machine (loopback reachable → consent completes → tokens), then
 * encodes the raw token response into a single-line blob with this codec. The user
 * pastes the blob into the remote dashboard, which decodes it and persists the
 * connection (running the provider's post-exchange/onboarding from the server,
 * which CAN reach Google's Cloud Code APIs).
 *
 * Format: `<prefix><base64url(JSON)>` — a recognizable prefix so humans and the
 * decoder can identify it, followed by a URL/shell-safe base64url payload (no
 * `+`, `/`, `=`, or whitespace) so it survives copy-paste through terminals.
 */ /** Human-recognizable, copy-paste-safe prefix. The decoder requires it. */ __turbopack_context__.s([
    "CREDENTIAL_BLOB_PREFIX",
    ()=>CREDENTIAL_BLOB_PREFIX,
    "decodeCredentialBlob",
    ()=>decodeCredentialBlob,
    "encodeCredentialBlob",
    ()=>encodeCredentialBlob
]);
const CREDENTIAL_BLOB_PREFIX = "omniroute-cred-v1.";
/** Current blob schema version (embedded in the payload as `v`). */ const CREDENTIAL_BLOB_VERSION = 1;
function encodeCredentialBlob(input) {
    if (!input || typeof input.provider !== "string" || !input.provider.trim()) {
        throw new Error("encodeCredentialBlob: a non-empty provider is required");
    }
    if (!input.tokens || typeof input.tokens !== "object") {
        throw new Error("encodeCredentialBlob: tokens object is required");
    }
    const payload = {
        v: CREDENTIAL_BLOB_VERSION,
        provider: input.provider.trim(),
        tokens: input.tokens
    };
    const json = JSON.stringify(payload);
    const b64 = Buffer.from(json, "utf8").toString("base64url");
    return `${CREDENTIAL_BLOB_PREFIX}${b64}`;
}
function decodeCredentialBlob(blob) {
    if (typeof blob !== "string" || !blob.startsWith(CREDENTIAL_BLOB_PREFIX)) {
        throw new Error(`decodeCredentialBlob: invalid format — must start with "${CREDENTIAL_BLOB_PREFIX}"`);
    }
    const b64 = blob.slice(CREDENTIAL_BLOB_PREFIX.length).trim();
    if (!/^[A-Za-z0-9_-]+$/.test(b64)) {
        throw new Error("decodeCredentialBlob: invalid payload — not base64url");
    }
    let parsed;
    try {
        const json = Buffer.from(b64, "base64url").toString("utf8");
        parsed = JSON.parse(json);
    } catch  {
        throw new Error("decodeCredentialBlob: invalid payload — could not parse JSON");
    }
    if (parsed.v !== CREDENTIAL_BLOB_VERSION) {
        throw new Error(`decodeCredentialBlob: unsupported blob version ${String(parsed.v)} (expected ${CREDENTIAL_BLOB_VERSION})`);
    }
    if (typeof parsed.provider !== "string" || !parsed.provider.trim()) {
        throw new Error("decodeCredentialBlob: invalid payload — missing provider");
    }
    const tokens = parsed.tokens;
    if (!tokens || typeof tokens !== "object") {
        throw new Error("decodeCredentialBlob: invalid payload — missing tokens");
    }
    if (typeof tokens.access_token !== "string" || !tokens.access_token) {
        throw new Error("decodeCredentialBlob: invalid payload — missing access_token");
    }
    return {
        provider: parsed.provider.trim(),
        tokens
    };
}
}),
"[project]/src/lib/oauth/services/codexImport.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeJwtExp",
    ()=>decodeJwtExp,
    "extractCodexAccountInfo",
    ()=>extractCodexAccountInfo,
    "flattenCodexImportPayload",
    ()=>flattenCodexImportPayload,
    "normalizeCodexImportRecord",
    ()=>normalizeCodexImportRecord
]);
/**
 * Codex (OpenAI) bulk-import normalization
 *
 * Accepts the JSON shape produced by Codex CLI / common token-export tools and
 * returns a {@link createProviderConnection} payload (or a typed error).
 *
 * Pure: no I/O, no network. Safe to unit-test.
 *
 * Ported from decolua/9router#1257 (beaaan).
 */ const REQUIRED_FIELDS = [
    "access_token",
    "refresh_token"
];
/** 10 days — the typical OpenAI access-token lifetime when no `expired` is supplied. */ const DEFAULT_EXPIRY_MS = 10 * 24 * 60 * 60 * 1000;
const BASE64_BLOCK_SIZE = 4;
// ── Internal helpers ──────────────────────────────────────────────────────────
/**
 * Decode a JWT payload to a plain object (no signature verification).
 *
 * Mirrors the helper in `providers.ts` but is kept local so this module has no
 * runtime dependency on the larger OAuth module graph.
 */ function decodeJwtPayload(jwt) {
    try {
        if (!jwt || typeof jwt !== "string") return null;
        const parts = jwt.split(".");
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const missingPadding = (BASE64_BLOCK_SIZE - base64.length % BASE64_BLOCK_SIZE) % BASE64_BLOCK_SIZE;
        const padded = base64 + "=".repeat(missingPadding);
        return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
    } catch  {
        return null;
    }
}
function extractCodexAccountInfo(idToken) {
    const payload = decodeJwtPayload(idToken);
    if (!payload) return {};
    const chatgpt = payload["https://api.openai.com/auth"] || {};
    return {
        email: typeof payload.email === "string" ? payload.email : undefined,
        chatgptAccountId: typeof chatgpt.chatgpt_account_id === "string" ? chatgpt.chatgpt_account_id : undefined,
        chatgptPlanType: typeof chatgpt.chatgpt_plan_type === "string" ? chatgpt.chatgpt_plan_type : undefined
    };
}
function decodeJwtExp(jwt) {
    const payload = decodeJwtPayload(jwt);
    const exp = payload && typeof payload.exp === "number" ? payload.exp : null;
    return exp !== null && Number.isFinite(exp) ? exp : null;
}
function pickString(...candidates) {
    for (const c of candidates){
        if (typeof c === "string" && c.trim()) return c.trim();
    }
    return undefined;
}
function parseExpiry(value) {
    if (typeof value === "string" && value) {
        const ms = Date.parse(value);
        if (Number.isFinite(ms)) return new Date(ms).toISOString();
    }
    return undefined;
}
function parseAccessTokenExp(accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const exp = payload && typeof payload.exp === "number" ? payload.exp : null;
    if (exp && Number.isFinite(exp)) {
        return new Date(exp * 1000).toISOString();
    }
    return new Date(Date.now() + DEFAULT_EXPIRY_MS).toISOString();
}
/**
 * Codex CLI persists tokens to `auth.json` with the OAuth fields nested under
 * a `tokens` object: `{ auth_mode, OPENAI_API_KEY, tokens: { id_token, ... } }`.
 * Flatten that into the same shape as a simple top-level export so the rest of
 * the normalizer can stay unchanged.
 */ function unwrapCodexAuthJson(rec) {
    const tokens = rec.tokens;
    if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
        return rec;
    }
    if (typeof tokens.access_token !== "string") return rec;
    // Tokens take priority; carry through siblings (email / account_id / expired)
    // only when the nested object doesn't already define them.
    return {
        ...rec,
        ...tokens
    };
}
/**
 * Map the camelCase field names used by 9router's Codex account export
 * (`accessToken`, `refreshToken`, `idToken`, `expiresAt`, and a nested
 * `providerSpecificData` block) onto the snake_case keys the rest of the
 * normalizer already understands (#6665). A snake_case key is only filled from
 * its camelCase alias when it is absent, so a snake_case or mixed export keeps
 * working unchanged.
 */ function applyCamelCaseAliases(rec) {
    const out = {
        ...rec
    };
    const fillFrom = (snake, value)=>{
        if (out[snake] === undefined && typeof value === "string" && value) {
            out[snake] = value;
        }
    };
    fillFrom("access_token", rec.accessToken);
    fillFrom("refresh_token", rec.refreshToken);
    fillFrom("id_token", rec.idToken);
    fillFrom("expired", rec.expiresAt);
    const psd = rec.providerSpecificData;
    if (psd && typeof psd === "object" && !Array.isArray(psd)) {
        const block = psd;
        fillFrom("account_id", block.chatgptAccountId);
        fillFrom("chatgpt_plan_type", block.chatgptPlanType);
    }
    return out;
}
function normalizeCodexImportRecord(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        return {
            ok: false,
            error: "Record is not an object"
        };
    }
    const rec = applyCamelCaseAliases(unwrapCodexAuthJson(input));
    // Allow type field to be missing or "codex"; reject anything else explicitly so
    // users don't accidentally import claude/gemini exports through this path.
    if (rec.type !== undefined && rec.type !== null && rec.type !== "codex") {
        return {
            ok: false,
            error: `Unsupported type: ${String(rec.type)}`
        };
    }
    for (const f of REQUIRED_FIELDS){
        if (typeof rec[f] !== "string" || !rec[f]) {
            return {
                ok: false,
                error: `Missing required field: ${f}`
            };
        }
    }
    const accessToken = String(rec.access_token);
    const refreshToken = String(rec.refresh_token);
    const idToken = typeof rec.id_token === "string" ? rec.id_token : undefined;
    // Prefer JWT-derived account info, fall back to top-level fields.
    const fromJwt = idToken ? extractCodexAccountInfo(idToken) : {};
    const email = pickString(fromJwt.email, rec.email);
    if (!email) {
        return {
            ok: false,
            error: "Missing email (and id_token does not contain one)"
        };
    }
    const chatgptAccountId = pickString(fromJwt.chatgptAccountId, rec.account_id);
    const chatgptPlanType = pickString(fromJwt.chatgptPlanType, rec.chatgpt_plan_type);
    const expiresAt = parseExpiry(rec.expired) ?? parseAccessTokenExp(accessToken);
    const providerSpecificData = {};
    if (chatgptAccountId) providerSpecificData.chatgptAccountId = chatgptAccountId;
    if (chatgptPlanType) providerSpecificData.chatgptPlanType = chatgptPlanType;
    const payload = {
        provider: "codex",
        authType: "oauth",
        accessToken,
        refreshToken,
        email,
        expiresAt,
        testStatus: "active"
    };
    if (idToken) payload.idToken = idToken;
    if (Object.keys(providerSpecificData).length > 0) {
        payload.providerSpecificData = providerSpecificData;
    }
    return {
        ok: true,
        payload
    };
}
function flattenCodexImportPayload(parsed) {
    if (Array.isArray(parsed)) {
        return {
            ok: true,
            records: parsed
        };
    }
    if (parsed && typeof parsed === "object") {
        return {
            ok: true,
            records: [
                parsed
            ]
        };
    }
    return {
        ok: false,
        error: "JSON must be an object or an array of objects"
    };
}
}),
"[project]/src/lib/oauth/utils/codexSessionImport.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "looksLikeCodexSessionJson",
    ()=>looksLikeCodexSessionJson,
    "parseCodexSessionJson",
    ()=>parseCodexSessionJson
]);
/**
 * Codex (OpenAI) session-JSON normalizer
 *
 * Accepts the raw JSON object copied straight from
 * `https://chatgpt.com/api/auth/session` (`{ user: {...}, accessToken, expires }`,
 * NextAuth's session-endpoint shape) and extracts a bare access token + optional
 * email, the same credential type already accepted by the bare-token import path
 * (`POST /api/oauth/codex/import-token`, #1290) — this module only widens what
 * shapes of pasted input can reach that endpoint.
 *
 * Pure: no I/O, no network, no DB import. Safe to unit-test. Mirrors the style
 * of `codexAuthImport.ts` / `codexImport.ts`, deliberately kept separate from
 * both: the bulk `auth.json` import requires a `refresh_token`; this path is
 * for a bare access token and deliberately does not.
 *
 * Ref: #6636
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$services$2f$codexImport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/services/codexImport.ts [app-ssr] (ecmascript)");
;
// ── Internal helpers ──────────────────────────────────────────────────────────
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function toNonEmptyString(value) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
/** Looks like a JWT (3 dot-separated segments) — a loose shape check only. */ function looksLikeJwt(value) {
    return value.split(".").length === 3;
}
/**
 * Field-name aliases for the access token across known Codex/ChatGPT session
 * export shapes: the literal `accessToken` returned by `chatgpt.com/api/auth/session`
 * first, then snake_case and alternate names, then the same aliases nested one
 * level under `tokens` (mirrors `unwrapCodexAuthJson` in `codexAuthImport.ts`).
 */ function findAccessToken(rec) {
    const direct = toNonEmptyString(rec.accessToken) || toNonEmptyString(rec.access_token) || toNonEmptyString(rec.sessionToken) || toNonEmptyString(rec.session_token);
    if (direct) return direct;
    const nested = toRecord(rec.tokens);
    if (!nested) return undefined;
    return toNonEmptyString(nested.access_token) || toNonEmptyString(nested.accessToken);
}
/** True when either expiry signal (top-level `expires` ISO string, or JWT `exp`) is in the past. */ function isExpired(rec, accessToken) {
    const expiresField = toNonEmptyString(rec.expires);
    if (expiresField) {
        const ms = Date.parse(expiresField);
        if (Number.isFinite(ms) && ms <= Date.now()) return true;
    }
    const exp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$services$2f$codexImport$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decodeJwtExp"])(accessToken);
    return exp !== null && exp * 1000 <= Date.now();
}
function looksLikeCodexSessionJson(value) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed.startsWith("{")) return false;
    try {
        return toRecord(JSON.parse(trimmed)) !== null;
    } catch  {
        return false;
    }
}
function parseCodexSessionJson(raw) {
    const rec = toRecord(raw);
    if (!rec) {
        return {
            ok: false,
            error: "Pasted session data is not a JSON object"
        };
    }
    const accessToken = findAccessToken(rec);
    if (!accessToken) {
        return {
            ok: false,
            error: "Could not find an access token field in the pasted session JSON (expected accessToken, access_token, sessionToken, or tokens.access_token)"
        };
    }
    if (!looksLikeJwt(accessToken)) {
        return {
            ok: false,
            error: "The access token field does not look like a valid JWT"
        };
    }
    if (isExpired(rec, accessToken)) {
        return {
            ok: false,
            error: "Session is expired — sign in to chatgpt.com again and re-copy the session JSON"
        };
    }
    const user = toRecord(rec.user);
    const email = user && toNonEmptyString(user.email) || undefined;
    return {
        ok: true,
        session: {
            accessToken,
            email
        }
    };
}
}),
"[project]/src/lib/oauth/utils/grokCliAuthJson.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Grok Build (grok-cli) paste-import validation (#7610).
 *
 * The paste-token import path used to accept a bare JWT ("key" field only),
 * which creates a connection with refresh_token=null that can never
 * auto-refresh and dies at expiry. This module requires the full
 * ~/.grok/auth.json object (validating that a refresh_token is present
 * somewhere in it) before the paste is accepted.
 *
 * Extracted from OAuthModal.tsx so it can be unit-tested directly (and to
 * keep the frozen file-size gate on OAuthModal.tsx from growing).
 */ __turbopack_context__.s([
    "parseGrokCliPasteToken",
    ()=>parseGrokCliPasteToken
]);
function parseGrokCliPasteToken(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        return {
            ok: false,
            error: "Paste the full contents of ~/.grok/auth.json"
        };
    }
    // Full auth.json object (preferred — includes refresh_token).
    if (trimmed.startsWith("{")) {
        try {
            const parsed = JSON.parse(trimmed);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                return {
                    ok: false,
                    error: "auth.json must be a JSON object from ~/.grok/auth.json"
                };
            }
            const doc = parsed;
            let hasKey = false;
            let hasRefresh = false;
            for (const entry of Object.values(doc)){
                if (!entry || typeof entry !== "object") continue;
                const obj = entry;
                if (typeof obj.key === "string" && obj.key.startsWith("eyJ")) {
                    hasKey = true;
                    if (typeof obj.refresh_token === "string" && obj.refresh_token.length > 0) {
                        hasRefresh = true;
                        break;
                    }
                }
                if (typeof obj.access_token === "string" && obj.access_token.startsWith("eyJ")) {
                    hasKey = true;
                    if (typeof obj.refresh_token === "string" && obj.refresh_token.length > 0) {
                        hasRefresh = true;
                        break;
                    }
                }
            }
            if (!hasKey) {
                return {
                    ok: false,
                    error: 'Could not find a Grok Build JWT ("key") in the pasted auth.json. Run `grok login` and paste the full file.'
                };
            }
            if (!hasRefresh) {
                return {
                    ok: false,
                    error: "auth.json is missing refresh_token. Re-run `grok login` and paste the full ~/.grok/auth.json so the connection can auto-refresh (#7610)."
                };
            }
            return {
                ok: true,
                token: doc
            };
        } catch  {
            return {
                ok: false,
                error: "Could not parse auth.json. Paste the full JSON from ~/.grok/auth.json."
            };
        }
    }
    // Bare JWT — deliberately rejected so connections are not created without refresh_token.
    if (trimmed.startsWith("eyJ")) {
        return {
            ok: false,
            error: 'Do not paste only the JWT "key" field. Paste the full ~/.grok/auth.json object so refresh_token is included (#7610).'
        };
    }
    return {
        ok: false,
        error: "Paste the full contents of ~/.grok/auth.json (JSON object)."
    };
}
}),
"[project]/src/lib/oauth/utils/loopbackTunnel.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared bits for the two loopback-mismatch hints surfaced by OAuthModal.
 *
 * Both families break for the same underlying reason — the dashboard is reached at a
 * LAN address, so the `localhost`/`127.0.0.1` the provider redirects to belongs to the
 * machine running the browser rather than to the OmniRoute server — but they differ in
 * which ports are involved and in what the remedy is:
 *
 * - `pkceLoopbackWarning.ts` (codex / xai-oauth / grok-cli): a FIXED foreign port
 *   registered with the upstream OAuth app, so the dashboard port AND that port must
 *   both be forwarded.
 * - `googleLoopbackHint.ts` (antigravity / agy): the callback rides the dashboard port
 *   itself, so one forward suffices — and Google's firstparty consent hangs instead of
 *   redirecting, which is why a local login helper exists at all.
 */ __turbopack_context__.s([
    "buildSshLocalForward",
    ()=>buildSshLocalForward,
    "resolveDashboardPort",
    ()=>resolveDashboardPort
]);
function resolveDashboardPort(location) {
    if (location.port) return location.port;
    return location.protocol === "https:" ? "443" : "80";
}
function buildSshLocalForward(ports, hostname) {
    const unique = [
        ...new Set(ports)
    ];
    return `ssh ${unique.map((p)=>`-L ${p}:127.0.0.1:${p}`).join(" ")} <user>@${hostname}`;
}
}),
"[project]/src/lib/oauth/utils/googleLoopbackHint.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGoogleLoopbackHint",
    ()=>buildGoogleLoopbackHint
]);
/**
 * Structured guidance for Google-loopback providers (antigravity / agy) reached from a
 * non-true-localhost origin.
 *
 * Unlike the codex family, these providers have no fixed foreign port — OAuthModal
 * builds `http://127.0.0.1:<dashboardPort>/callback`. On a LAN origin that 127.0.0.1 is
 * the *browser's* machine, and Google's `firstparty/nativeapp` consent only releases the
 * authorization code once that loopback is reachable from the approving browser. When it
 * is not, the consent screen **never redirects at all** — it simply hangs.
 *
 * That is what made the previous copy actively misleading: it told the operator to wait
 * for the redirect and paste the callback URL, but no redirect arrives and there is
 * nothing to paste. Hence the two real remedies surfaced here:
 *
 * 1. the local login helper, which runs the OAuth on the operator's own machine (where
 *    127.0.0.1 works) and prints a credential blob the Step 2 field accepts;
 * 2. an SSH forward of the dashboard port, after which the callback reaches the server.
 *
 * See docs/guides/REMOTE-MODE.md → "Connecting Antigravity on a remote install".
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/utils/loopbackTunnel.ts [app-ssr] (ecmascript)");
;
/**
 * Providers the `omniroute login <provider>` helper can mint a blob for.
 *
 * `bin/cli/commands/login.mjs` pins `PROVIDER = "antigravity"`, and
 * `parsePastedCredentials()` refuses a blob whose embedded provider does not match the
 * route provider — so advertising the helper on the `agy` dialog would send the operator
 * to a blob that is guaranteed to be rejected. `agy` may still paste a blob, it just has
 * no CLI that produces one, so it gets the tunnel path only.
 */ const LOGIN_HELPER_PROVIDERS = new Set([
    "antigravity"
]);
function buildGoogleLoopbackHint(provider, location) {
    const dashboardPort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDashboardPort"])(location);
    return {
        provider,
        redirectUri: `http://127.0.0.1:${dashboardPort}/callback`,
        dashboardHost: location.hostname,
        dashboardPort,
        // One forward only: the callback rides the dashboard port itself.
        tunnelCommand: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildSshLocalForward"])([
            dashboardPort
        ], location.hostname),
        localDashboardUrl: `http://localhost:${dashboardPort}`,
        helperCommand: LOGIN_HELPER_PROVIDERS.has(provider) ? `npx omniroute login ${provider}` : null
    };
}
}),
"[project]/src/lib/oauth/utils/pkceLoopbackWarning.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildPkceLoopbackMismatchHint",
    ()=>buildPkceLoopbackMismatchHint,
    "buildPkceLoopbackMismatchWarning",
    ()=>buildPkceLoopbackMismatchWarning
]);
/**
 * #8046: PKCE_CALLBACK_SERVER_PROVIDERS (codex/xai-oauth/grok-cli) register a FIXED
 * loopback redirect_uri (e.g. http://localhost:1455/auth/callback for codex) with the
 * upstream OAuth app. That redirect only resolves on the machine actually running the
 * browser, not on whatever host serves the OmniRoute dashboard.
 *
 * OAuthModal's `isTrueLocalhost` check (hostname === "localhost" || "127.0.0.1") only
 * covers one such case. A dashboard reached via a LAN IP (192.168.*, 10.*, 172.16-31.*)
 * is `isLocalhost: true, isTrueLocalhost: false` — the callback-server branch was falling
 * straight through to the standard authorize flow and window.open()ing an authUrl whose
 * embedded redirect_uri can never resolve, with zero warning (reported as a silent
 * Auth0 `invalid_state` failure with no server-side log line).
 *
 * Extracted out of OAuthModal.tsx (frozen file-size baseline) so the guard has an
 * isolated, unit-testable home. Mirrors the messaging pattern of the sibling
 * remote-origin hint added for #7523 (`remoteOAuthHint.ts::buildRemoteOAuthHint`).
 *
 * Follow-up: the guard stops the doomed flow correctly, but explaining it as one long
 * sentence in the generic red error step left the operator to work out *which* ports to
 * forward. `buildPkceLoopbackMismatchHint()` returns the same diagnosis as structured
 * data — including a copy-pasteable `ssh -L` command with the detected host and both
 * ports already filled in — so the modal can render an organized panel instead.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/oauth/utils/loopbackTunnel.ts [app-ssr] (ecmascript)");
;
const PKCE_LOOPBACK_REDIRECT_HINT = {
    codex: "http://localhost:1455/auth/callback",
    "xai-oauth": "http://127.0.0.1:56121/callback",
    "grok-cli": "http://127.0.0.1:56122/callback"
};
/** Ports the upstream OAuth apps hardcode; kept in sync with OAuthModal's redirectUri branch. */ const PKCE_LOOPBACK_CALLBACK_PORT = {
    codex: 1455,
    "xai-oauth": 56121,
    "grok-cli": 56122
};
function buildPkceLoopbackMismatchHint(provider, location) {
    const dashboardPort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDashboardPort"])(location);
    const callbackPort = PKCE_LOOPBACK_CALLBACK_PORT[provider] ?? null;
    const forwards = [
        dashboardPort
    ];
    if (callbackPort != null && String(callbackPort) !== dashboardPort) {
        forwards.push(String(callbackPort));
    }
    return {
        provider,
        redirectUri: PKCE_LOOPBACK_REDIRECT_HINT[provider] ?? "a fixed localhost callback URL",
        callbackPort,
        dashboardPort,
        dashboardHost: location.hostname,
        tunnelCommand: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$oauth$2f$utils$2f$loopbackTunnel$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildSshLocalForward"])(forwards, location.hostname),
        localDashboardUrl: `http://localhost:${dashboardPort}`
    };
}
function buildPkceLoopbackMismatchWarning(provider) {
    const redirect = PKCE_LOOPBACK_REDIRECT_HINT[provider] ?? "a fixed localhost callback URL";
    return `OmniRoute is being accessed from a LAN IP, not true localhost. ${provider}'s OAuth app ` + `is registered with a fixed loopback redirect (${redirect}) that only resolves on the ` + "machine running this browser tab, not on the OmniRoute server — the login will silently " + "fail on the provider's side. Open the OmniRoute dashboard from true localhost instead " + "(SSH port-forward: ssh -L <port>:127.0.0.1:<port> <user>@<omniroute-host>, then browse to " + "http://localhost:<port>), or use the token-import flow for this provider if available.";
}
}),
"[project]/src/lib/oauth/gitlab.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITLAB_DUO_DEFAULT_BASE_URL",
    ()=>GITLAB_DUO_DEFAULT_BASE_URL,
    "buildGitLabDirectGatewayUrl",
    ()=>buildGitLabDirectGatewayUrl,
    "buildGitLabOAuthEndpoints",
    ()=>buildGitLabOAuthEndpoints,
    "getCachedGitLabDirectAccess",
    ()=>getCachedGitLabDirectAccess,
    "isGitLabDirectAccessDisabled",
    ()=>isGitLabDirectAccessDisabled,
    "normalizeGitLabBaseUrl",
    ()=>normalizeGitLabBaseUrl,
    "parseGitLabDirectAccessDetails",
    ()=>parseGitLabDirectAccessDetails,
    "resolveGitLabOAuthBaseUrl",
    ()=>resolveGitLabOAuthBaseUrl
]);
const GITLAB_DUO_DEFAULT_BASE_URL = process.env.GITLAB_DUO_BASE_URL || process.env.GITLAB_BASE_URL || "https://gitlab.com";
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeGitLabBaseUrl(baseUrl) {
    const raw = typeof baseUrl === "string" ? baseUrl.trim() : "";
    return (raw || GITLAB_DUO_DEFAULT_BASE_URL).replace(/\/$/, "");
}
function resolveGitLabOAuthBaseUrl(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeGitLabBaseUrl(data.baseUrl);
}
function buildGitLabOAuthEndpoints(baseUrl) {
    const root = normalizeGitLabBaseUrl(baseUrl);
    return {
        root,
        authorizeUrl: `${root}/oauth/authorize`,
        tokenUrl: `${root}/oauth/token`,
        userUrl: `${root}/api/v4/user`,
        directAccessUrl: `${root}/api/v4/code_suggestions/direct_access`,
        publicCompletionsUrl: `${root}/api/v4/code_suggestions/completions`
    };
}
function buildGitLabDirectGatewayUrl(baseUrl) {
    const normalized = normalizeGitLabBaseUrl(baseUrl);
    if (normalized.endsWith("/ai/v2/completions")) {
        return normalized;
    }
    if (normalized.endsWith("/ai/v2")) {
        return `${normalized}/completions`;
    }
    return `${normalized}/ai/v2/completions`;
}
function parseGitLabDirectAccessDetails(payload) {
    const data = asRecord(payload);
    const token = typeof data.token === "string" ? data.token.trim() : "";
    const baseUrl = typeof data.base_url === "string" ? data.base_url.trim() : "";
    if (!token || !baseUrl) {
        return null;
    }
    const rawHeaders = asRecord(data.headers);
    const headers = Object.fromEntries(Object.entries(rawHeaders).filter((entry)=>typeof entry[0] === "string" && typeof entry[1] === "string"));
    const expiresAt = typeof data.expires_at === "number" && Number.isFinite(data.expires_at) ? new Date(data.expires_at * 1000).toISOString() : null;
    return {
        token,
        baseUrl: normalizeGitLabBaseUrl(baseUrl),
        expiresAt,
        headers
    };
}
function getCachedGitLabDirectAccess(providerSpecificData, minValidityMs = 60_000) {
    const data = asRecord(providerSpecificData);
    const cache = data.gitlabDirectAccess ?? data.directAccessCache;
    const parsed = parseGitLabDirectAccessDetails(cache);
    if (!parsed) {
        return null;
    }
    if (!parsed.expiresAt) {
        return parsed;
    }
    const expiresAtMs = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now() + minValidityMs) {
        return null;
    }
    return parsed;
}
function isGitLabDirectAccessDisabled(status, bodyText) {
    return status === 403 && bodyText.toLowerCase().includes("direct connections are disabled");
}
}),
"[project]/src/lib/providers/managedAvailableModels.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "compatibleProviderSupportsModelImport",
    ()=>compatibleProviderSupportsModelImport,
    "getCompatibleFallbackModels",
    ()=>getCompatibleFallbackModels
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/models.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/constants/providers.ts [app-ssr] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$models$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function getCompatibleFallbackModels(providerId, fallbackModels = []) {
    if (providerId === "openrouter") return fallbackModels;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getModelsByProviderId"])("claude");
    return undefined;
}
function compatibleProviderSupportsModelImport(providerId) {
    return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$providers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isClaudeCodeCompatibleProvider"])(providerId);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/oauth/kiroSocialPoll.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyKiroSocialPoll",
    ()=>classifyKiroSocialPoll,
    "getNextKiroSocialPollInterval",
    ()=>getNextKiroSocialPollInterval
]);
function getNextKiroSocialPollInterval(currentIntervalMs, error) {
    return error === "slow_down" ? currentIntervalMs + 5000 : currentIntervalMs;
}
function errorCode(value) {
    return typeof value === "string" && value.trim() ? value.trim() : "authorization_failed";
}
function classifyKiroSocialPoll(responseOk, responseStatus, data) {
    if (data.error === "authorization_pending" || data.error === "slow_down") {
        return {
            kind: "pending",
            error: data.error
        };
    }
    if (!responseOk || data.error) {
        const status = responseStatus >= 400 && responseStatus <= 599 ? responseStatus : 400;
        return {
            kind: "error",
            error: errorCode(data.error),
            status
        };
    }
    if (!data.accessToken && !data.refreshToken) {
        return {
            kind: "error",
            error: "invalid_token_response",
            status: 502
        };
    }
    return {
        kind: "success"
    };
}
}),
"[project]/src/domain/connectionModelRules.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnectionExcludedModels",
    ()=>getConnectionExcludedModels,
    "hasEligibleConnectionForModel",
    ()=>hasEligibleConnectionForModel,
    "isModelExcludedByConnection",
    ()=>isModelExcludedByConnection,
    "normalizeExcludedModelPatterns",
    ()=>normalizeExcludedModelPatterns
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/wildcardRouter.ts [app-ssr] (ecmascript)");
;
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizePattern(value) {
    if (typeof value !== "string") return null;
    const normalized = value.trim();
    if (!normalized || normalized === "**") return null;
    return normalized;
}
function toPatternList(value) {
    if (Array.isArray(value)) {
        return value.map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    if (typeof value === "string") {
        return value.split(",").map(normalizePattern).filter((pattern)=>Boolean(pattern));
    }
    return [];
}
function uniquePatterns(patterns) {
    return Array.from(new Set(patterns));
}
function getModelMatchCandidates(modelId) {
    const normalized = modelId.trim();
    if (!normalized) return [];
    const withoutExtendedContext = normalized.endsWith("[1m]") ? normalized.slice(0, -4) : normalized;
    const lastSlashIndex = withoutExtendedContext.lastIndexOf("/");
    const rawModel = lastSlashIndex >= 0 ? withoutExtendedContext.slice(lastSlashIndex + 1) : withoutExtendedContext;
    return Array.from(new Set([
        normalized,
        withoutExtendedContext,
        rawModel
    ].filter(Boolean)));
}
function normalizeExcludedModelPatterns(value) {
    return uniquePatterns(toPatternList(value));
}
function getConnectionExcludedModels(providerSpecificData) {
    const data = asRecord(providerSpecificData);
    return normalizeExcludedModelPatterns(data.excludedModels ?? data.excluded_models);
}
function isModelExcludedByConnection(modelId, providerSpecificData) {
    if (typeof modelId !== "string" || modelId.trim().length === 0) return false;
    const candidates = getModelMatchCandidates(modelId);
    const excludedModels = getConnectionExcludedModels(providerSpecificData);
    if (candidates.length === 0 || excludedModels.length === 0) return false;
    return excludedModels.some((pattern)=>candidates.some((candidate)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$wildcardRouter$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["wildcardMatch"])(candidate, pattern)));
}
function hasEligibleConnectionForModel(connections, modelId) {
    if (!Array.isArray(connections) || connections.length === 0) return false;
    return connections.some((connection)=>!isModelExcludedByConnection(modelId, connection?.providerSpecificData));
}
}),
"[project]/src/store/emailPrivacyStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
"use client";
;
;
const useEmailPrivacyStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        emailsVisible: false,
        setEmailsVisible: (visible)=>set({
                emailsVisible: visible
            })
    }), {
    name: "omniroute-email-privacy"
}));
const __TURBOPACK__default__export__ = useEmailPrivacyStore;
}),
"[project]/src/store/notificationStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNotificationStore",
    ()=>useNotificationStore
]);
/**
 * Notification Store — FASE-07 UX & Microinteractions
 *
 * Zustand-based global notification system for the dashboard.
 * Replaces ad-hoc feedback patterns with a centralized toast system.
 *
 * @module store/notificationStore
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
"use client";
;
let idCounter = 0;
const useNotificationStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        notifications: [],
        addNotification: (notification)=>{
            const id = ++idCounter;
            const entry = {
                id,
                type: notification.type || "info",
                message: notification.message,
                title: notification.title || null,
                duration: notification.duration ?? 5000,
                dismissible: notification.dismissible ?? true,
                createdAt: Date.now(),
                onClick: notification.onClick
            };
            set((s)=>({
                    notifications: [
                        ...s.notifications,
                        entry
                    ]
                }));
            // Auto-dismiss
            if (entry.duration > 0) {
                setTimeout(()=>{
                    get().removeNotification(id);
                }, entry.duration);
            }
            return id;
        },
        removeNotification: (id)=>{
            set((s)=>({
                    notifications: s.notifications.filter((n)=>n.id !== id)
                }));
        },
        clearAll: ()=>set({
                notifications: []
            }),
        // ─── Convenience Methods ─────────────────
        success: (message, title)=>get().addNotification({
                type: "success",
                message,
                title
            }),
        error: (message, title)=>get().addNotification({
                type: "error",
                message,
                title,
                duration: 8000
            }),
        warning: (message, title)=>get().addNotification({
                type: "warning",
                message,
                title,
                duration: 10000
            }),
        info: (message, title)=>get().addNotification({
                type: "info",
                message,
                title
            })
    }));
}),
"[project]/src/app/login/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-ssr] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-ssr] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
function LoginPage() {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])("auth");
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasPassword, setHasPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [setupComplete, setSetupComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [oidcEnabled, setOidcEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [nodeVersion, setNodeVersion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [nodeCompatible, setNodeCompatible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const raf = requestAnimationFrame(()=>setMounted(true));
        async function checkAuth() {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 5000);
            const baseUrl = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : "";
            try {
                const res = await fetch(`${baseUrl}/api/settings/require-login`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.ok) {
                    const data = await res.json();
                    if (data.nodeVersion) setNodeVersion(data.nodeVersion);
                    if (data.nodeCompatible === false) setNodeCompatible(false);
                    if (data.authenticated === true || data.requireLogin === false) {
                        router.push("/dashboard");
                        router.refresh();
                        return;
                    }
                    setHasPassword(!!data.hasPassword);
                    setSetupComplete(!!data.setupComplete);
                    setOidcEnabled(!!data.oidcEnabled);
                } else {
                    setHasPassword(true);
                    setSetupComplete(true);
                    setOidcEnabled(false);
                }
            } catch (err) {
                clearTimeout(timeoutId);
                setHasPassword(true);
                setSetupComplete(true);
                setOidcEnabled(false);
            }
        }
        checkAuth();
    }, [
        router
    ]);
    const handleLogin = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password
                })
            });
            if (res.ok) {
                sessionStorage.setItem("omniroute_login_time", String(Date.now()));
                router.push("/dashboard");
                router.refresh();
            } else {
                const data = await res.json();
                // (#521) If no password is set, redirect to onboarding instead of showing an error
                if (data.needsSetup) {
                    router.push("/dashboard/onboarding");
                    return;
                }
                setError(data.error || t("invalidPassword"));
            }
        } catch (err) {
            setError(t("errorOccurredRetry"));
        } finally{
            setLoading(false);
        }
    };
    const nodeWarningBanner = !nodeCompatible && nodeVersion ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full max-w-lg mx-auto mb-6 animate-in fade-in slide-in-from-top-2 duration-500",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-red-950/60 border-2 border-red-500/40 rounded-2xl p-6 shadow-lg shadow-red-900/20 backdrop-blur-sm",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "material-symbols-outlined text-red-400 text-[28px]",
                            children: "error"
                        }, void 0, false, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 100,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/login/page.tsx",
                        lineNumber: 99,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-base font-bold text-red-300 mb-1",
                                children: t("nodeIncompatibleTitle")
                            }, void 0, false, {
                                fileName: "[project]/src/app/login/page.tsx",
                                lineNumber: 103,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-red-200/80 leading-relaxed mb-3",
                                children: t("nodeIncompatibleDesc", {
                                    version: nodeVersion
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/login/page.tsx",
                                lineNumber: 106,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-black/40 rounded-lg px-4 py-3 font-mono text-sm border border-red-500/20",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 text-red-300/60 mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "material-symbols-outlined text-[14px]",
                                                children: "terminal"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/login/page.tsx",
                                                lineNumber: 111,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs",
                                                children: t("nodeIncompatibleFixLabel")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/login/page.tsx",
                                                lineNumber: 112,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 110,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "text-amber-300",
                                        children: "nvm install 22 && nvm use 22"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/login/page.tsx",
                                lineNumber: 109,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-red-300/50 mt-3 flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[14px]",
                                        children: "info"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 117,
                                        columnNumber: 17
                                    }, this),
                                    t("nodeIncompatibleHint")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/login/page.tsx",
                                lineNumber: 116,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/login/page.tsx",
                        lineNumber: 102,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/login/page.tsx",
                lineNumber: 98,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/login/page.tsx",
            lineNumber: 97,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/login/page.tsx",
        lineNumber: 96,
        columnNumber: 7
    }, this) : null;
    if (hasPassword === null || setupComplete === null || oidcEnabled === null) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex flex-col items-center justify-center p-6",
            children: [
                nodeWarningBanner,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-10 h-10 border-2 border-primary/20 rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 131,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-sm text-text-muted",
                            children: t("loading")
                        }, void 0, false, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 134,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/login/page.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/login/page.tsx",
            lineNumber: 127,
            columnNumber: 7
        }, this);
    }
    if (!hasPassword && !setupComplete) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex flex-col items-center justify-center p-6",
            children: [
                nodeWarningBanner,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `w-full max-w-md transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center mb-10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 mb-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-primary text-[40px]",
                                        children: "rocket_launch"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 149,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 148,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold text-text-main tracking-tight",
                                    children: t("welcome")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 153,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-text-muted mt-2",
                                    children: t("configureInstance")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 154,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-surface border border-border rounded-2xl p-8 shadow-soft",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-text-muted leading-relaxed mb-6",
                                        children: t("runOnboardingWizard")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 159,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        variant: "primary",
                                        className: "w-full h-11 text-sm font-medium",
                                        onClick: ()=>router.push("/dashboard/onboarding"),
                                        children: t("startOnboarding")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 160,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/login/page.tsx",
                                lineNumber: 158,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-center text-xs text-text-muted/60 mt-8",
                            children: [
                                "OmniRoute — ",
                                t("unifiedProxy")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 170,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/login/page.tsx",
                    lineNumber: 144,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/login/page.tsx",
            lineNumber: 142,
            columnNumber: 7
        }, this);
    }
    if (!hasPassword && setupComplete) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex flex-col items-center justify-center p-6",
            children: [
                nodeWarningBanner,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `w-full max-w-md transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center mb-10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/10 mb-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-amber-500 text-[40px]",
                                        children: "shield_person"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 187,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 186,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold text-text-main tracking-tight",
                                    children: t("secureYourInstance")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 191,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-text-muted mt-2",
                                    children: t("passwordNotEnabled")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 194,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 185,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-surface border border-border rounded-2xl p-8 shadow-soft",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-text-muted leading-relaxed mb-6",
                                        children: t("setPasswordDescription")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 199,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        variant: "primary",
                                        className: "w-full h-11 text-sm font-medium",
                                        onClick: ()=>router.push("/dashboard/onboarding"),
                                        children: t("configurePassword")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 200,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/login/page.tsx",
                                lineNumber: 198,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 197,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-center text-xs text-text-muted/60 mt-8",
                            children: [
                                "OmniRoute — ",
                                t("unifiedAiApiProxy")
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 210,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/login/page.tsx",
                    lineNumber: 182,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/login/page.tsx",
            lineNumber: 180,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col",
        children: [
            nodeWarningBanner && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-center pt-6 px-6",
                children: nodeWarningBanner
            }, void 0, false, {
                fileName: "[project]/src/app/login/page.tsx",
                lineNumber: 221,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex items-center justify-center p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `w-full max-w-sm transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-10",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3 mb-8",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-white text-[20px]",
                                                        children: "hub"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/login/page.tsx",
                                                        lineNumber: 231,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/login/page.tsx",
                                                    lineNumber: 230,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xl font-semibold text-text-main tracking-tight",
                                                    children: "OmniRoute"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/login/page.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/login/page.tsx",
                                            lineNumber: 229,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-2xl font-bold text-text-main tracking-tight",
                                            children: t("signIn")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/login/page.tsx",
                                            lineNumber: 237,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-text-muted mt-1.5",
                                            children: t("enterPassword")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/login/page.tsx",
                                            lineNumber: 238,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 228,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                    onSubmit: handleLogin,
                                    className: "space-y-5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-sm font-medium text-text-main",
                                                    children: t("password")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/login/page.tsx",
                                                    lineNumber: 243,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                                    type: "password",
                                                    placeholder: t("enterPassword"),
                                                    value: password,
                                                    onChange: (e)=>setPassword(e.target.value),
                                                    required: true,
                                                    autoFocus: true,
                                                    className: "h-11"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/login/page.tsx",
                                                    lineNumber: 244,
                                                    columnNumber: 17
                                                }, this),
                                                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-red-500 flex items-center gap-1.5 pt-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-base",
                                                            children: "error"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/login/page.tsx",
                                                            lineNumber: 255,
                                                            columnNumber: 21
                                                        }, this),
                                                        error
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/login/page.tsx",
                                                    lineNumber: 254,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-text-muted/60 pt-0.5",
                                                    children: t("defaultPasswordHint")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/login/page.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/login/page.tsx",
                                            lineNumber: 242,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                            type: "submit",
                                            variant: "primary",
                                            className: "w-full h-11 text-sm font-medium",
                                            loading: loading,
                                            children: t("continue")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/login/page.tsx",
                                            lineNumber: 262,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 241,
                                    columnNumber: 13
                                }, this),
                                oidcEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                        type: "button",
                                        variant: "secondary",
                                        className: "w-full h-11 text-sm font-medium",
                                        onClick: ()=>window.location.href = "/api/auth/oidc/login",
                                        children: t("continueWithOidc") || "Continue with OIDC"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 273,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 272,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-6 pt-6 border-t border-border",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "/forgot-password",
                                        className: "text-sm text-text-muted hover:text-primary transition-colors",
                                        children: t("forgotPassword")
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 285,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/login/page.tsx",
                                    lineNumber: 284,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 225,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/login/page.tsx",
                        lineNumber: 224,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent items-center justify-center p-12",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `max-w-md transition-all duration-700 delay-200 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-bold text-text-main mb-3",
                                                children: t("unifiedAiApiProxy")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/login/page.tsx",
                                                lineNumber: 301,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-text-muted leading-relaxed",
                                                children: t("unifiedAiApiProxyDesc")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/login/page.tsx",
                                                lineNumber: 302,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 300,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            {
                                                icon: "swap_horiz",
                                                title: t("featureMultiProviderTitle"),
                                                desc: t("featureMultiProviderDesc")
                                            },
                                            {
                                                icon: "speed",
                                                title: t("featureLoadBalancingTitle"),
                                                desc: t("featureLoadBalancingDesc")
                                            },
                                            {
                                                icon: "analytics",
                                                title: t("featureUsageTrackingTitle"),
                                                desc: t("featureUsageTrackingDesc")
                                            }
                                        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start gap-4 p-4 rounded-xl bg-surface/50 border border-border",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-primary text-[20px]",
                                                            children: item.icon
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/login/page.tsx",
                                                            lineNumber: 328,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/login/page.tsx",
                                                        lineNumber: 327,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "font-medium text-text-main",
                                                                children: item.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/login/page.tsx",
                                                                lineNumber: 333,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-text-muted",
                                                                children: item.desc
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/login/page.tsx",
                                                                lineNumber: 334,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/login/page.tsx",
                                                        lineNumber: 332,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, item.icon, true, {
                                                fileName: "[project]/src/app/login/page.tsx",
                                                lineNumber: 323,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/login/page.tsx",
                                        lineNumber: 305,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/login/page.tsx",
                                lineNumber: 299,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/login/page.tsx",
                            lineNumber: 296,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/login/page.tsx",
                        lineNumber: 295,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/login/page.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/login/page.tsx",
        lineNumber: 219,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_1nlnf_d._.js.map
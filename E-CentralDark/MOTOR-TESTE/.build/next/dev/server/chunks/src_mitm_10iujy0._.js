module.exports = [
"[project]/src/mitm/dataDir.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveMitmDataDir",
    ()=>resolveMitmDataDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const APP_NAME = "omniroute";
function fallbackHomeDir() {
    const envHome = process.env.HOME || process.env.USERPROFILE;
    return typeof envHome === "string" && envHome.trim() ? __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(envHome) : __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir();
}
function safeHomeDir() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].homedir();
    } catch  {
        return fallbackHomeDir();
    }
}
function normalizeConfiguredPath(dir) {
    if (typeof dir !== "string") return null;
    const trimmed = dir.trim();
    return trimmed ? __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(trimmed) : null;
}
function resolveMitmDataDir() {
    const configured = normalizeConfiguredPath(process.env.DATA_DIR);
    if (configured) return configured;
    const homeDir = safeHomeDir();
    if ("TURBOPACK compile-time truthy", 1) {
        const appData = process.env.APPDATA || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(homeDir, "AppData", "Roaming");
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(appData, APP_NAME);
    }
    //TURBOPACK unreachable
    ;
    const xdgConfigHome = undefined;
}
}),
"[project]/src/mitm/systemCommands.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_runElevatedPowerShellForTest",
    ()=>_runElevatedPowerShellForTest,
    "buildElevatedScriptWrapper",
    ()=>buildElevatedScriptWrapper,
    "execFileText",
    ()=>execFileText,
    "execFileWithPassword",
    ()=>execFileWithPassword,
    "getErrorMessage",
    ()=>getErrorMessage,
    "isNoSudoEnv",
    ()=>isNoSudoEnv,
    "isRoot",
    ()=>isRoot,
    "isSudoAvailable",
    ()=>isSudoAvailable,
    "quotePowerShell",
    ()=>quotePowerShell,
    "resolveSudoSpawn",
    ()=>resolveSudoSpawn,
    "runElevatedPowerShell",
    ()=>runElevatedPowerShell,
    "runPowerShell",
    ()=>runPowerShell
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
;
;
;
function getErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
function isRoot() {
    try {
        return !!(process.getuid && process.getuid() === 0);
    } catch  {
        return false;
    }
}
function isSudoAvailable() {
    if ("TURBOPACK compile-time truthy", 1) return false;
    //TURBOPACK unreachable
    ;
}
function execFileText(command, args) {
    return new Promise((resolve, reject)=>{
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execFile"])(command, args, {
            encoding: "utf8"
        }, (error, stdout, stderr)=>{
            if (error) {
                // Node's execFile already sets error.message to "Command failed: <cmd>"
                // (for non-zero exit) or "spawn <cmd> ENOENT" (for missing binary).
                // Re-prefixing with "Command failed: " would double the prefix for the
                // non-zero exit case. Surface Node's message directly and only append
                // stderr when it contains additional context. (#3641)
                reject(new Error(getErrorMessage(error) + (stderr ? `\n${stderr}` : "")));
                return;
            }
            resolve(stdout);
        });
    });
}
function isNoSudoEnv() {
    const value = process.env.OMNIROUTE_NO_SUDO;
    return typeof value === "string" && /^(1|true|yes|on)$/i.test(value.trim());
}
function resolveSudoSpawn(command, args, overrides = {}) {
    const root = overrides.root ?? isRoot();
    const sudoAvailable = overrides.sudoAvailable ?? isSudoAvailable();
    const noSudo = overrides.noSudo ?? isNoSudoEnv();
    const stripSudo = command === "sudo" && (root || !sudoAvailable || noSudo);
    const needsPassword = !stripSudo && command === "sudo";
    let finalCommand = command;
    let finalArgs = args;
    if (stripSudo) {
        const realCmdIndex = args.findIndex((arg)=>!arg.startsWith("-"));
        if (realCmdIndex !== -1) {
            finalCommand = args[realCmdIndex];
            finalArgs = args.slice(realCmdIndex + 1);
        }
    }
    return {
        finalCommand,
        finalArgs,
        stripSudo,
        needsPassword
    };
}
function execFileWithPassword(command, args, password, stdinAfterPassword = "") {
    // When running as root, when `sudo` is not installed on the host (slim
    // Docker images / containerized non-root runtime), OR when the operator sets
    // `OMNIROUTE_NO_SUDO` (root-less / user-namespace deployments — #6122), skip
    // `sudo -S` and run the underlying command directly — same user, no
    // elevation. This lets MITM operations triggered from inside `node:*-slim`
    // containers succeed for any command that does not actually require root
    // (everything but writing to /etc/hosts or the system trust store).
    const { finalCommand, finalArgs, needsPassword } = resolveSudoSpawn(command, args);
    return new Promise((resolve, reject)=>{
        // `command` and `args` are never user-controlled. This helper is a
        // controlled wrapper called only from src/mitm/cert/install.ts with a
        // fixed allowlist of executables: "sudo", "certutil", "security",
        // "update-ca-certificates", "update-ca-trust", "cp", "mkdir", "rm".
        // `spawn` is used (not `exec`) so each arg is a separate argv entry and
        // shell metacharacters do not expand. See docs/security/SOCKET_DEV_FINDINGS.md §3.
        // nosemgrep
        const child = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["spawn"])(finalCommand, finalArgs, {
            // nosemgrep
            windowsHide: true,
            stdio: [
                "pipe",
                "pipe",
                "pipe"
            ]
        });
        let stdout = "";
        let stderr = "";
        let settled = false;
        const settle = (error)=>{
            if (settled) return;
            settled = true;
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        };
        child.stdout?.on("data", (chunk)=>{
            stdout += chunk.toString();
        });
        child.stderr?.on("data", (chunk)=>{
            stderr += chunk.toString();
        });
        child.on("error", (error)=>{
            settle(new Error(`Command failed: ${getErrorMessage(error)}\n${stderr}`));
        });
        child.on("close", (code)=>{
            if (code === 0) {
                settle(null);
                return;
            }
            settle(new Error(`Command failed with code ${code}\n${stderr}`));
        });
        const stdinInput = needsPassword ? `${password}\n${stdinAfterPassword}` : stdinAfterPassword || "";
        if (stdinInput) {
            child.stdin?.write(stdinInput);
        }
        child.stdin?.end();
    });
}
function quotePowerShell(value) {
    return `'${value.replace(/'/g, "''")}'`;
}
function runPowerShell(script) {
    return execFileText("powershell", [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        script
    ]);
}
function buildElevatedScriptWrapper(scriptPath) {
    return `
    $proc = Start-Process powershell -ArgumentList @(
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      ${quotePowerShell(scriptPath)}
    ) -Verb RunAs -Wait -PassThru;
    if ($proc.ExitCode -ne 0) {
      throw "Elevated command exited with code $($proc.ExitCode)"
    }
  `;
}
async function runElevatedPowerShell(script) {
    const tempDir = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdtempSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir(), "omniroute-elevate-"));
    const scriptName = `omniroute-elevate-${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID()}.ps1`;
    const scriptPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(tempDir, scriptName);
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(scriptPath, script, {
        encoding: "utf8",
        mode: 0o600
    });
    try {
        return await runPowerShell(buildElevatedScriptWrapper(scriptPath));
    } finally{
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(tempDir, {
                recursive: true,
                force: true
            });
        } catch  {
        // Best-effort cleanup: leftover files in $TMPDIR are owned by the local
        // user and the OS cleans them on next reboot.
        }
    }
}
async function _runElevatedPowerShellForTest(script, runner) {
    const tempDir = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdtempSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].tmpdir(), "omniroute-elevate-"));
    const scriptName = `omniroute-elevate-${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID()}.ps1`;
    const scriptPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(tempDir, scriptName);
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(scriptPath, script, {
        encoding: "utf8",
        mode: 0o600
    });
    try {
        return await runner(buildElevatedScriptWrapper(scriptPath), scriptPath);
    } finally{
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].rmSync(tempDir, {
                recursive: true,
                force: true
            });
        } catch  {
        // Best-effort cleanup.
        }
    }
}
}),
"[project]/src/mitm/passthrough.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Passthrough / bypass logic for the MITM server.
 * Determines which hostnames should be tunneled without TLS decryption.
 *
 * Precedence: bypass list > target match > passthrough default.
 * Source: plano 11 §4.6 (origin: llm-interceptor filters.py::ignore_hosts)
 */ /**
 * Built-in bypass patterns — hosts that must NEVER be TLS-decrypted.
 * Banks, government sites, and corporate SSO providers.
 */ __turbopack_context__.s([
    "DEFAULT_BYPASS_PATTERNS",
    ()=>DEFAULT_BYPASS_PATTERNS,
    "globMatch",
    ()=>globMatch,
    "shouldBypass",
    ()=>shouldBypass
]);
const DEFAULT_BYPASS_PATTERNS = [
    /\.bank\./i,
    /(^|\.)gov(\.|$)/i,
    /(^|\.)okta\.com$/i,
    /(^|\.)auth0\.com$/i
];
function globMatch(hostname, pattern) {
    // Guard: reject patterns with more than 8 segments (after split) to bound complexity
    const segments = pattern.toLowerCase().split("*");
    if (segments.length > 9) return false;
    const h = hostname.toLowerCase();
    // No wildcard — exact match
    if (segments.length === 1) return h === segments[0];
    // Must start with the first segment (if non-empty)
    const first = segments[0];
    if (first && !h.startsWith(first)) return false;
    // Must end with the last segment (if non-empty)
    const last = segments[segments.length - 1];
    if (last && !h.endsWith(last)) return false;
    // Walk through middle segments verifying each appears after the previous match
    let pos = first.length;
    for(let i = 1; i < segments.length - 1; i++){
        const seg = segments[i];
        if (seg === "") continue; // consecutive wildcards — skip
        const idx = h.indexOf(seg, pos);
        if (idx === -1) return false;
        pos = idx + seg.length;
    }
    // Ensure the last fixed segment doesn't overlap with middle matches
    if (last) {
        const minEnd = pos + last.length;
        if (minEnd > h.length) return false;
    }
    return true;
}
function shouldBypass(hostname, userBypass) {
    // Default bypass patterns take precedence
    if (DEFAULT_BYPASS_PATTERNS.some((re)=>re.test(hostname))) return true;
    // User-defined bypass patterns (glob strings)
    return userBypass.some((p)=>globMatch(hostname, p));
}
}),
"[project]/src/mitm/targets/antigravity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Antigravity IDE target descriptor.
 *
 * Provides:
 *  - `ANTIGRAVITY_TARGET`: canonical `MitmTarget` per F1 contract (§3.1).
 *  - `ANTIGRAVITY_MITM_PROFILE`: legacy alias retained for back-compat with
 *    `src/app/api/settings/mitm/route.ts`. Carries the historical fields
 *    (`targetHost`, `additionalHosts`, `targetPort`, `localPort`,
 *    `apiEndpoints`, `authHeader`, `instructions`) as an augmentation.
 */ __turbopack_context__.s([
    "ANTIGRAVITY_MITM_PROFILE",
    ()=>ANTIGRAVITY_MITM_PROFILE,
    "ANTIGRAVITY_TARGET",
    ()=>ANTIGRAVITY_TARGET
]);
const HOSTS = [
    "daily-cloudcode-pa.googleapis.com",
    "cloudcode-pa.googleapis.com",
    "daily-cloudcode-pa.sandbox.googleapis.com",
    "autopush-cloudcode-pa.sandbox.googleapis.com"
];
const ENDPOINTS = [
    "/v1internal:generateContent",
    "/v1internal:streamGenerateContent",
    "/v1internal:loadCodeAssist",
    "/v1internal:onboardUser"
];
const INSTRUCTIONS = [
    "1. Install OmniRoute's root certificate",
    "2. Start the MITM proxy via Dashboard or CLI",
    "3. Configure model mappings in Dashboard → AgentBridge → Antigravity",
    "4. Open Antigravity IDE — API calls will be routed through OmniRoute"
];
const ANTIGRAVITY_TARGET = {
    id: "antigravity",
    name: "Antigravity IDE",
    icon: "rocket_launch",
    color: "#4F46E5",
    hosts: HOSTS,
    port: 443,
    endpointPatterns: ENDPOINTS,
    defaultModels: [],
    setupTutorial: {
        steps: INSTRUCTIONS,
        detection: {
            command: "which antigravity",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/antigravity.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.AntigravityHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
const ANTIGRAVITY_MITM_PROFILE = {
    ...ANTIGRAVITY_TARGET,
    description: "Intercepts Antigravity IDE requests to cloudcode-pa.googleapis.com and routes them through OmniRoute.",
    targetHost: HOSTS[0],
    targetPort: 443,
    localPort: 443,
    userAgentPattern: null,
    apiEndpoints: ENDPOINTS,
    authHeader: "authorization",
    additionalHosts: HOSTS.slice(1),
    instructions: INSTRUCTIONS
};
}),
"[project]/src/mitm/targets/kiro.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Kiro IDE target descriptor (#336).
 *
 * Kiro removed its Base URL / API Key UI; we intercept its Anthropic-style
 * traffic via MITM. Provides:
 *  - `KIRO_TARGET`: canonical `MitmTarget` per F1 contract (§3.1).
 *  - `KIRO_MITM_PROFILE`: legacy alias retained for back-compat with
 *    `src/app/api/settings/mitm/route.ts`.
 */ __turbopack_context__.s([
    "KIRO_MITM_PROFILE",
    ()=>KIRO_MITM_PROFILE,
    "KIRO_TARGET",
    ()=>KIRO_TARGET
]);
const HOSTS = [
    "api.anthropic.com"
];
const ENDPOINTS = [
    "/v1/messages"
];
const INSTRUCTIONS = [
    "1. Install OmniRoute's root certificate (Dashboard → AgentBridge → Cert)",
    "2. Start the MITM proxy: `omniroute mitm start --target kiro`",
    "3. Set your system HTTP proxy to 127.0.0.1:20130 (or use transparent MITM via DNS override)",
    "4. Open Kiro IDE — API calls will be automatically routed through OmniRoute.",
    "5. Verify: check the Proxy Logs in OmniRoute dashboard and look for provider=anthropic source=mitm"
];
const KIRO_TARGET = {
    id: "kiro",
    name: "Kiro IDE",
    icon: "code_blocks",
    color: "#8B5CF6",
    hosts: HOSTS,
    port: 443,
    endpointPatterns: ENDPOINTS,
    defaultModels: [],
    setupTutorial: {
        steps: INSTRUCTIONS,
        detection: {
            command: "which kiro",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/kiro.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.KiroHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
const KIRO_MITM_PROFILE = {
    ...KIRO_TARGET,
    description: "Intercepts Kiro IDE requests to api.anthropic.com and routes them through OmniRoute.",
    targetHost: HOSTS[0],
    targetPort: 443,
    localPort: 20130,
    userAgentPattern: null,
    apiEndpoints: ENDPOINTS,
    authHeader: "x-api-key",
    instructions: INSTRUCTIONS,
    referenceIde: "antigravity"
};
}),
"[project]/src/mitm/targets/copilot.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * GitHub Copilot — MITM target descriptor.
 */ __turbopack_context__.s([
    "COPILOT_TARGET",
    ()=>COPILOT_TARGET
]);
const COPILOT_TARGET = {
    id: "copilot",
    name: "GitHub Copilot",
    icon: "code",
    color: "#10B981",
    hosts: [
        "api.githubcopilot.com",
        "copilot-proxy.githubusercontent.com"
    ],
    port: 443,
    endpointPatterns: [
        "/chat/completions",
        "/v1/chat/completions"
    ],
    defaultModels: [
        {
            id: "gpt-4o",
            name: "GPT-4o",
            alias: "gpt-4o"
        },
        {
            id: "claude-3.5-sonnet",
            name: "Claude 3.5 Sonnet",
            alias: "claude-3.5-sonnet"
        },
        {
            id: "gemini-2.0-flash",
            name: "Gemini 2.0 Flash",
            alias: "gemini-2.0-flash"
        }
    ],
    setupTutorial: {
        steps: [
            "Install GitHub Copilot extension in VS Code",
            "Sign in to GitHub with a Copilot-enabled account",
            "Enable DNS routing for this agent",
            "Restart VS Code",
            "Done — Copilot now routes via OmniRoute"
        ],
        detection: {
            command: "code --list-extensions",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/copilot.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.CopilotHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
}),
"[project]/src/mitm/targets/ghe-copilot.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * GitHub Enterprise (GHE) Copilot — MITM target descriptor.
 */ __turbopack_context__.s([
    "GHE_COPILOT_TARGET",
    ()=>GHE_COPILOT_TARGET
]);
const GHE_COPILOT_TARGET = {
    id: "ghe-copilot",
    name: "GitHub Enterprise Copilot",
    icon: "code",
    color: "#10B981",
    // Hosts will be dynamically matched via the configured gheUrl
    // Empty array means "match via provider config" in the MITM layer
    hosts: [],
    port: 443,
    endpointPatterns: [
        "/chat/completions",
        "/v1/chat/completions",
        "/responses"
    ],
    defaultModels: [
        {
            id: "gpt-4o",
            name: "GPT-4o",
            alias: "gpt-4o"
        },
        {
            id: "claude-3.5-sonnet",
            name: "Claude 3.5 Sonnet",
            alias: "claude-3.5-sonnet"
        },
        {
            id: "gemini-2.0-flash",
            name: "Gemini 2.0 Flash",
            alias: "gemini-2.0-flash"
        }
    ],
    setupTutorial: {
        steps: [
            "Configure your GHE Copilot endpoint URL in OmniRoute provider settings",
            "Ensure your GHE instance has Copilot enabled",
            "Sign in to GitHub Enterprise with a Copilot-enabled account",
            "Enable DNS routing for this agent",
            "Restart your IDE (VS Code, JetBrains, etc.)",
            "Done — GHE Copilot now routes via OmniRoute"
        ],
        detection: {
            command: "code --list-extensions",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/copilot.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.CopilotHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
}),
"[project]/src/mitm/targets/codex.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * OpenAI Codex CLI — MITM target descriptor.
 */ __turbopack_context__.s([
    "CODEX_TARGET",
    ()=>CODEX_TARGET
]);
const CODEX_TARGET = {
    id: "codex",
    name: "OpenAI Codex",
    icon: "smart_toy",
    color: "#F59E0B",
    hosts: [
        "chatgpt.com"
    ],
    port: 443,
    endpointPatterns: [
        "/backend-api/codex/chat/completions",
        "/v1/chat/completions"
    ],
    defaultModels: [
        {
            id: "gpt-4.1",
            name: "GPT-4.1",
            alias: "gpt-4.1"
        },
        {
            id: "gpt-4o-mini",
            name: "GPT-4o mini",
            alias: "gpt-4o-mini"
        }
    ],
    setupTutorial: {
        steps: [
            "Install the OpenAI Codex CLI",
            "Authenticate with your ChatGPT/Plus credentials",
            "Enable DNS routing for this agent",
            "Run `codex` — requests are now proxied via OmniRoute"
        ],
        detection: {
            command: "which codex",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/codex.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.CodexHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
}),
"[project]/src/mitm/targets/cursor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cursor IDE — MITM target descriptor.
 *
 * Hosts: `api2.cursor.sh` (chat backend).
 * Format: OpenAI-compatible Chat Completions on `/v1/chat/completions`.
 */ __turbopack_context__.s([
    "CURSOR_TARGET",
    ()=>CURSOR_TARGET
]);
const CURSOR_TARGET = {
    id: "cursor",
    name: "Cursor IDE",
    icon: "edit_note",
    color: "#0EA5E9",
    hosts: [
        "api2.cursor.sh"
    ],
    port: 443,
    endpointPatterns: [
        "/v1/chat/completions"
    ],
    defaultModels: [
        {
            id: "claude-sonnet-4.5",
            name: "Claude Sonnet 4.5",
            alias: "claude-sonnet-4.5"
        },
        {
            id: "gpt-4o",
            name: "GPT-4o",
            alias: "gpt-4o"
        }
    ],
    setupTutorial: {
        steps: [
            "Install OmniRoute's root certificate",
            "Enable DNS routing for Cursor",
            "Restart Cursor IDE",
            "Done — Cursor traffic now routes through OmniRoute"
        ],
        detection: {
            command: "which cursor",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/cursor.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.CursorHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
}),
"[project]/src/mitm/targets/zed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Zed IDE — MITM target descriptor.
 *
 * Hosts: `api.zed.dev`.
 * Format: OpenAI-compatible Chat Completions on `/v1/chat/completions`.
 */ __turbopack_context__.s([
    "ZED_TARGET",
    ()=>ZED_TARGET
]);
const ZED_TARGET = {
    id: "zed",
    name: "Zed",
    icon: "bolt",
    color: "#EF4444",
    hosts: [
        "api.zed.dev"
    ],
    port: 443,
    endpointPatterns: [
        "/v1/chat/completions"
    ],
    defaultModels: [
        {
            id: "claude-3.5-sonnet",
            name: "Claude 3.5 Sonnet",
            alias: "claude-3.5-sonnet"
        },
        {
            id: "gpt-4o",
            name: "GPT-4o",
            alias: "gpt-4o"
        }
    ],
    setupTutorial: {
        steps: [
            "Install OmniRoute's root certificate",
            "Enable DNS routing for Zed",
            "Restart Zed",
            "Done — Zed traffic now routes through OmniRoute"
        ],
        detection: {
            command: "which zed",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/zed.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.ZedHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
}),
"[project]/src/mitm/targets/claudeCode.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Claude Code (Anthropic CLI) — MITM target descriptor.
 *
 * Hosts: `api.anthropic.com`.
 * Format: Anthropic Messages API on `/v1/messages`.
 *
 * NOTE: shares the host `api.anthropic.com` with the Kiro target. The DNS-routing
 * tutorial therefore is opt-in: the user explicitly enables interception when
 * they want Claude Code traffic captured.
 */ __turbopack_context__.s([
    "CLAUDE_CODE_TARGET",
    ()=>CLAUDE_CODE_TARGET
]);
const CLAUDE_CODE_TARGET = {
    id: "claude-code",
    name: "Claude Code",
    icon: "terminal",
    color: "#D97706",
    hosts: [
        "api.anthropic.com"
    ],
    port: 443,
    endpointPatterns: [
        "/v1/messages"
    ],
    defaultModels: [
        {
            id: "claude-sonnet-4.5",
            name: "Claude Sonnet 4.5",
            alias: "claude-sonnet-4.5"
        },
        {
            id: "claude-opus-4.5",
            name: "Claude Opus 4.5",
            alias: "claude-opus-4.5"
        }
    ],
    setupTutorial: {
        steps: [
            "Install Claude Code (Anthropic CLI)",
            "Install OmniRoute's root certificate",
            "Enable DNS routing for Claude Code",
            "Run `claude` — requests are now proxied via OmniRoute"
        ],
        detection: {
            command: "which claude",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/claudeCode.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.ClaudeCodeHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
}),
"[project]/src/mitm/targets/openCode.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * OpenCode — MITM target descriptor.
 *
 * Hosts: `opencode.ai`.
 * Format: OpenAI-compatible Chat Completions on `/v1/chat/completions`.
 */ __turbopack_context__.s([
    "OPEN_CODE_TARGET",
    ()=>OPEN_CODE_TARGET
]);
const OPEN_CODE_TARGET = {
    id: "open-code",
    name: "OpenCode",
    icon: "code",
    color: "#22D3EE",
    hosts: [
        "opencode.ai"
    ],
    port: 443,
    endpointPatterns: [
        "/v1/chat/completions"
    ],
    defaultModels: [
        {
            id: "gpt-4o",
            name: "GPT-4o",
            alias: "gpt-4o"
        },
        {
            id: "claude-3.5-sonnet",
            name: "Claude 3.5 Sonnet",
            alias: "claude-3.5-sonnet"
        }
    ],
    setupTutorial: {
        steps: [
            "Install the OpenCode CLI/IDE",
            "Install OmniRoute's root certificate",
            "Enable DNS routing for OpenCode",
            "Restart OpenCode",
            "Done — OpenCode traffic now routes through OmniRoute"
        ],
        detection: {
            command: "which opencode",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/openCode.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.OpenCodeHandler
            })),
    riskNoticeKey: "providers.riskNotice.oauth"
};
}),
"[project]/src/mitm/targets/trae.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Trae — MITM target descriptor (stub).
 *
 * Viability is still under investigation (see plan 11 §5). The hostname
 * `trae.invalid` is a deliberate non-routable placeholder so the target is
 * registered (UI can list it as "investigating") without ever matching real
 * traffic. The concrete host list will be filled in once we confirm the
 * upstream API surface.
 */ __turbopack_context__.s([
    "TRAE_TARGET",
    ()=>TRAE_TARGET
]);
const TRAE_TARGET = {
    id: "trae",
    name: "Trae",
    icon: "construction",
    color: "#94A3B8",
    hosts: [
        "trae.invalid"
    ],
    port: 443,
    endpointPatterns: [],
    defaultModels: [],
    setupTutorial: {
        steps: [
            "Trae integration is under investigation",
            "Setup steps will be published once the upstream API is confirmed"
        ],
        detection: {
            command: "which trae",
            platform: "all"
        }
    },
    handler: ()=>__turbopack_context__.A("[project]/src/mitm/handlers/trae.ts [app-route] (ecmascript, async loader)").then((m)=>({
                default: m.TraeHandler
            })),
    riskNoticeKey: "providers.riskNotice.investigating",
    viability: "investigating"
};
}),
"[project]/src/mitm/targets/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_TARGETS",
    ()=>ALL_TARGETS,
    "resolveTarget",
    ()=>resolveTarget,
    "routeConnection",
    ()=>routeConnection
]);
/**
 * Registry of all AgentBridge MITM targets.
 *
 * Exports:
 *   - `ALL_TARGETS`: canonical ordered list (one entry per supported agent).
 *   - `resolveTarget(hostname)`: returns the target whose hosts list contains
 *     `hostname` (case-insensitive exact match), or `null`.
 *   - `routeConnection(hostname, userBypass)`: bypass > target > passthrough
 *     decision per plan 11 §4.6.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$passthrough$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/passthrough.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/antigravity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/kiro.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/copilot.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$ghe$2d$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/ghe-copilot.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/codex.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$cursor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/cursor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$zed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/zed.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$claudeCode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/claudeCode.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$openCode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/openCode.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$trae$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/trae.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
const ALL_TARGETS = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KIRO_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COPILOT_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$ghe$2d$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GHE_COPILOT_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$cursor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CURSOR_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$zed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ZED_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$claudeCode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLAUDE_CODE_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$openCode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OPEN_CODE_TARGET"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$trae$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TRAE_TARGET"]
];
function resolveTarget(hostname) {
    if (!hostname) return null;
    const h = hostname.toLowerCase();
    for (const target of ALL_TARGETS){
        if (target.hosts.some((host)=>host.toLowerCase() === h)) {
            return target;
        }
    }
    return null;
}
function routeConnection(hostname, userBypass = []) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$passthrough$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldBypass"])(hostname, userBypass)) {
        return {
            kind: "bypass",
            reason: "bypass"
        };
    }
    const target = resolveTarget(hostname);
    if (target) {
        return {
            kind: "target",
            target
        };
    }
    return {
        kind: "passthrough"
    };
}
}),
"[project]/src/mitm/dns/dnsConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addDNSEntries",
    ()=>addDNSEntries,
    "addDNSEntry",
    ()=>addDNSEntry,
    "canRunSudoWithoutPassword",
    ()=>canRunSudoWithoutPassword,
    "checkDNSEntry",
    ()=>checkDNSEntry,
    "checkDNSEntryForAgent",
    ()=>checkDNSEntryForAgent,
    "isSudoAvailable",
    ()=>isSudoAvailable,
    "isSudoPasswordRequired",
    ()=>isSudoPasswordRequired,
    "removeDNSEntries",
    ()=>removeDNSEntries,
    "removeDNSEntry",
    ()=>removeDNSEntry,
    "resolveHostsForAgent",
    ()=>resolveHostsForAgent
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/systemCommands.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/mitm/targets/index.ts [app-route] (ecmascript) <locals>");
;
;
;
;
;
// Legacy Antigravity defaults preserved for backward compat.
const ANTIGRAVITY_HOSTS = [
    "daily-cloudcode-pa.googleapis.com",
    "cloudcode-pa.googleapis.com",
    "daily-cloudcode-pa.sandbox.googleapis.com",
    "autopush-cloudcode-pa.sandbox.googleapis.com"
];
function resolveHostsForAgent(agentId) {
    if (!agentId) return ANTIGRAVITY_HOSTS;
    const target = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ALL_TARGETS"].find((t)=>t.id === agentId);
    return target?.hosts ?? ANTIGRAVITY_HOSTS;
}
const IS_WIN = process.platform === "win32";
const HOSTS_FILE = ("TURBOPACK compile-time truthy", 1) ? __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.env.SystemRoot || "C:\\Windows", "System32", "drivers", "etc", "hosts") : "TURBOPACK unreachable";
function resolveCommandDependencies(deps) {
    return {
        execFileWithPassword: deps?.execFileWithPassword ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"],
        runElevatedPowerShell: deps?.runElevatedPowerShell ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runElevatedPowerShell"]
    };
}
function isSudoAvailable() {
    if ("TURBOPACK compile-time truthy", 1) return true;
    //TURBOPACK unreachable
    ;
}
function canRunSudoWithoutPassword() {
    if ("TURBOPACK compile-time truthy", 1) return true;
    //TURBOPACK unreachable
    ;
}
function isSudoPasswordRequired() {
    return !IS_WIN && isSudoAvailable() && !canRunSudoWithoutPassword();
}
/**
 * Build the set of /etc/hosts lines for a given hostname.
 * Both IPv4 and IPv6 are needed — modern systems often resolve IPv6 first.
 */ function dnsLines(hostname) {
    return [
        `127.0.0.1 ${hostname}`,
        `::1 ${hostname}`
    ];
}
/**
 * Read the current hosts file content. Returns empty string on error.
 */ function readHostsFile() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(HOSTS_FILE, "utf8");
    } catch  {
        return "";
    }
}
/**
 * Check whether all IPv4+IPv6 lines for `hostname` are present in the hosts file.
 */ function hasHostEntry(hostsContent, hostname) {
    const lines = hostsContent.split(/\r?\n/);
    return dnsLines(hostname).every((entry)=>{
        const [ip, host] = entry.split(/\s+/);
        return lines.some((line)=>{
            const parts = line.trim().split(/\s+/).filter(Boolean);
            return parts.length >= 2 && parts[0] === ip && parts.includes(host);
        });
    });
}
async function addDNSEntries(hosts, sudoPassword, deps) {
    if (process.env.OMNIROUTE_SKIP_DNS_WRITE === "1") return;
    const commands = resolveCommandDependencies(deps);
    const hostsContent = readHostsFile();
    const missingEntries = [];
    for (const hostname of hosts){
        const lines = dnsLines(hostname);
        const missing = lines.filter((entry)=>{
            const [ip, host] = entry.split(/\s+/);
            const existing = hostsContent.split(/\r?\n/);
            return !existing.some((line)=>{
                const parts = line.trim().split(/\s+/).filter(Boolean);
                return parts.length >= 2 && parts[0] === ip && parts.includes(host);
            });
        });
        missingEntries.push(...missing);
    }
    if (missingEntries.length === 0) return;
    if ("TURBOPACK compile-time truthy", 1) {
        const psHostsFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotePowerShell"])(HOSTS_FILE);
        const psEntries = missingEntries.map((e)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotePowerShell"])(e)).join(", ");
        const script = "Add-Content -LiteralPath " + psHostsFile + " -Value " + psEntries;
        await commands.runElevatedPowerShell(script);
        for (const entry of missingEntries){
            console.log(`[DNS] Added entry: ${entry}`);
        }
    } else //TURBOPACK unreachable
    ;
}
// Node.js inline script for removing hosts entries — uses process.argv so no
// values are interpolated into the script body (Hard Rule #13).
const REMOVE_HOSTS_ENTRY_SCRIPT = `
const fs = require("fs");
const filePath = process.argv[1];
const targetHost = process.argv[2];
const content = fs.readFileSync(filePath, "utf8");
const filtered = content.split(/\\r?\\n/).filter((line) => {
  const parts = line.trim().split(/\\s+/).filter(Boolean);
  return !(parts.length >= 2 && parts.includes(targetHost));
});
fs.writeFileSync(filePath, filtered.join("\\n").replace(/\\n*$/, "\\n"));
`;
async function removeDNSEntries(hosts, sudoPassword, deps) {
    if (process.env.OMNIROUTE_SKIP_DNS_WRITE === "1") return;
    const commands = resolveCommandDependencies(deps);
    const hostsContent = readHostsFile();
    const presentHosts = hosts.filter((h)=>hasHostEntry(hostsContent, h));
    if (presentHosts.length === 0) return;
    if ("TURBOPACK compile-time truthy", 1) {
        const psHostsFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotePowerShell"])(HOSTS_FILE);
        const psTargets = presentHosts.map((h)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotePowerShell"])(h)).join(", ");
        const script = "$hostsFile = " + psHostsFile + ";\n          $targetHosts = @(" + psTargets + ");\n" + "          $lines = Get-Content -LiteralPath $hostsFile;\n" + "          $filtered = $lines | Where-Object {\n" + "            $part = ($_ -split '\\s+') | Where-Object { $_ };\n" + "            -not ($part.Length -ge 2 -and ($targetHosts -contains $part[1]))\n" + "          };\n" + "          Set-Content -LiteralPath $hostsFile -Value $filtered;\n        ";
        await commands.runElevatedPowerShell(script);
        for (const hostname of presentHosts){
            console.log(`[DNS] Removed entries for ${hostname}`);
        }
    } else //TURBOPACK unreachable
    ;
}
function checkDNSEntry() {
    const hostsContent = readHostsFile();
    return ANTIGRAVITY_HOSTS.every((h)=>hasHostEntry(hostsContent, h));
}
function checkDNSEntryForAgent(agentId) {
    const hostsContent = readHostsFile();
    return resolveHostsForAgent(agentId).every((h)=>hasHostEntry(hostsContent, h));
}
async function addDNSEntry(sudoPassword, agentId, deps) {
    await addDNSEntries(resolveHostsForAgent(agentId), sudoPassword, deps);
}
async function removeDNSEntry(sudoPassword, agentId, deps) {
    await removeDNSEntries(resolveHostsForAgent(agentId), sudoPassword, deps);
}
}),
"[project]/src/mitm/dns/provision.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "provisionDnsEntries",
    ()=>provisionDnsEntries
]);
/**
 * AgentBridge DNS provisioning — best-effort, extracted from manager.ts so each step
 * is guarded and unit-testable without spawning the MITM server (#6127 / #6198).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dns/dnsConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/systemCommands.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/mitm/targets/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeState.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorCustomHosts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const defaultLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLogger"])("mitm-dns-provision");
/** Antigravity default hosts — best-effort, never throws. */ async function provisionDefaultDns(sudoPassword, deps) {
    try {
        await deps.addDefaultDns(sudoPassword);
    } catch (err) {
        deps.logger.error({
            err
        }, "Failed to add default DNS entries (continuing)");
    }
}
/** Hosts for agents with `dns_enabled=true` in the DB — best-effort, never throws. */ async function provisionAgentDns(sudoPassword, deps) {
    try {
        const agentStates = deps.getAgentStates();
        const agentHostsToAdd = [];
        for (const state of agentStates){
            if (!state.dns_enabled) continue;
            const target = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ALL_TARGETS"].find((t)=>t.id === state.agent_id);
            if (target) {
                agentHostsToAdd.push(...target.hosts);
            }
        }
        if (agentHostsToAdd.length > 0) {
            deps.logger.info({
                count: agentHostsToAdd.length
            }, "Adding DNS for agent host(s)...");
            await deps.addHostsDns(agentHostsToAdd, sudoPassword);
        }
    } catch (err) {
        deps.logger.error({
            err
        }, "Failed to add agent DNS entries (continuing)");
    }
}
/** Enabled custom hosts — best-effort, never throws. */ async function provisionCustomHostsDns(sudoPassword, deps) {
    try {
        const customHosts = deps.listEnabledCustomHosts();
        const customHostNames = customHosts.map((h)=>h.host);
        if (customHostNames.length > 0) {
            deps.logger.info({
                count: customHostNames.length
            }, "Adding DNS for custom host(s)...");
            await deps.addHostsDns(customHostNames, sudoPassword);
        }
    } catch (err) {
        deps.logger.error({
            err
        }, "Failed to add custom host DNS entries (continuing)");
    }
}
async function provisionDnsEntries(sudoPassword, deps = {}) {
    const canElevate = deps.canElevate ?? (()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isSudoAvailable"])() || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRoot"])());
    const logger = deps.logger ?? defaultLog;
    // Explicit opt-out: skip all DNS modification when the env var is set.
    if (process.env.SKIP_ANTIGRAVITY_DNS === "true") {
        logger.info("Skipping DNS entries - SKIP_ANTIGRAVITY_DNS=true");
        return;
    }
    // In containers (USER node, no sudo installed, not root) we cannot write
    // to /etc/hosts. Rather than attempting sudo and swallowing the error,
    // detect the condition up-front and bail out with a clear message.
    if (!canElevate()) {
        logger.info("Skipping DNS entries - sudo not available and not running as root (likely a container)");
        return;
    }
    const resolvedDeps = {
        addDefaultDns: deps.addDefaultDns ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addDNSEntry"],
        addHostsDns: deps.addHostsDns ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addDNSEntries"],
        getAgentStates: deps.getAgentStates ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeState$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAllAgentBridgeStates"],
        listEnabledCustomHosts: deps.listEnabledCustomHosts ?? (()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listCustomHosts"])({
                enabledOnly: true
            })),
        logger
    };
    await provisionDefaultDns(sudoPassword, resolvedDeps);
    await provisionAgentDns(sudoPassword, resolvedDeps);
    await provisionCustomHostsDns(sudoPassword, resolvedDeps);
}
}),
"[project]/src/mitm/cert/generate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateCert",
    ()=>generateCert
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dataDir.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/targets/antigravity.ts [app-route] (ecmascript)");
;
;
;
;
// #6494: the proxy terminates TLS locally for all 4 antigravity/cloudcode
// hosts (see `TARGET_HOSTS` in server.cjs), but the generated cert previously
// only carried a SAN entry for the first one — every other host served a cert
// whose CN/SAN didn't match, breaking MITM interception. `ANTIGRAVITY_TARGET.hosts`
// is the single authoritative host list (kept in lock-step with server.cjs /
// dnsConfig.ts / mitmToolHosts.ts by their own drift tests) — reuse it here
// instead of hard-coding a second copy.
const TARGET_HOSTS = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTIGRAVITY_TARGET"].hosts;
const TARGET_HOST = TARGET_HOSTS[0];
async function generateCert() {
    const certDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm");
    const keyPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, "server.key");
    const certPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, "server.crt");
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(keyPath) && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(certPath)) {
        console.log("✅ SSL certificate already exists");
        return {
            key: keyPath,
            cert: certPath
        };
    }
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(certDir)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(certDir, {
            recursive: true
        });
    }
    // Dynamic import for optional dependency
    const { default: selfsigned } = await __turbopack_context__.A("[project]/node_modules/selfsigned/index.js [app-route] (ecmascript, async loader)");
    const attrs = [
        {
            name: "commonName",
            value: TARGET_HOST
        }
    ];
    const notAfter = new Date();
    notAfter.setFullYear(notAfter.getFullYear() + 1);
    const pems = await selfsigned.generate(attrs, {
        keySize: 2048,
        algorithm: "sha256",
        notAfterDate: notAfter,
        extensions: [
            {
                name: "subjectAltName",
                altNames: TARGET_HOSTS.map((value)=>({
                        type: 2,
                        value
                    }))
            }
        ]
    });
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(keyPath, pems.private);
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(certPath, pems.cert);
    console.log(`✅ Generated SSL certificate for ${TARGET_HOSTS.join(", ")}`);
    return {
        key: keyPath,
        cert: certPath
    };
}
}),
"[project]/src/mitm/cert/install.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCertManualGuide",
    ()=>buildCertManualGuide,
    "buildWindowsDelstoreScript",
    ()=>buildWindowsDelstoreScript,
    "certutilThumbprint",
    ()=>certutilThumbprint,
    "checkCertInstalled",
    ()=>checkCertInstalled,
    "classifyCertInstallError",
    ()=>classifyCertInstallError,
    "ensureSystemCertMode",
    ()=>ensureSystemCertMode,
    "installCaCert",
    ()=>installCaCert,
    "installCert",
    ()=>installCert,
    "installCertResult",
    ()=>installCertResult,
    "macCertOutputHasFingerprint",
    ()=>macCertOutputHasFingerprint,
    "uninstallCert",
    ()=>uninstallCert
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/systemCommands.ts [app-route] (ecmascript)");
;
;
;
;
const IS_WIN = process.platform === "win32";
const IS_MAC = process.platform === "darwin";
const LINUX_CERT_NAME = "omniroute-mitm.crt";
const LINUX_CERT_PATHS = [
    // Debian / Ubuntu
    {
        dir: "/usr/local/share/ca-certificates",
        cmd: "update-ca-certificates"
    },
    // Arch Linux / CachyOS / Manjaro
    {
        dir: "/etc/ca-certificates/trust-source/anchors",
        cmd: "update-ca-trust"
    },
    // Fedora / RHEL / CentOS
    {
        dir: "/etc/pki/ca-trust/source/anchors",
        cmd: "update-ca-trust"
    },
    // openSUSE
    {
        dir: "/etc/pki/trust/anchors",
        cmd: "update-ca-certificates"
    }
];
function getLinuxCertConfig() {
    for (const config of LINUX_CERT_PATHS){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(config.dir)) {
            return config;
        }
    }
    return LINUX_CERT_PATHS[0];
}
async function updateNssDatabases(certPath, action = "add") {
    // Pass the runtime values via environment variables instead of string
    // interpolation. The shell receives them through its env and dereferences
    // with "$CERT_PATH" / "$CERT_NAME" / "$ACTION", so any shell metacharacters
    // they may contain stay inside the quoted argument — eliminating the
    // command-injection surface flagged by CodeQL js/shell-command-injection.
    const script = `
    set -u
    if ! command -v certutil &> /dev/null; then
      exit 0
    fi

    DIRS="$HOME/.pki/nssdb $HOME/snap/chromium/current/.pki/nssdb"

    if [ -d "$HOME/.mozilla/firefox" ]; then
      for profile in "$HOME"/.mozilla/firefox/*/; do
        if [ -f "\${profile}cert9.db" ] || [ -f "\${profile}cert8.db" ]; then
          DIRS="$DIRS $profile"
        fi
      done
    fi

    if [ -d "$HOME/snap/firefox/common/.mozilla/firefox" ]; then
      for profile in "$HOME"/snap/firefox/common/.mozilla/firefox/*/; do
        if [ -f "\${profile}cert9.db" ] || [ -f "\${profile}cert8.db" ]; then
          DIRS="$DIRS $profile"
        fi
      done
    fi

    for db in $DIRS; do
      if [ -d "$db" ]; then
        if [ "$ACTION" = "add" ]; then
          certutil -d sql:"$db" -A -t "C,," -n "$CERT_NAME" -i "$CERT_PATH" 2>/dev/null || \\
          certutil -d "$db" -A -t "C,," -n "$CERT_NAME" -i "$CERT_PATH" 2>/dev/null || true
        else
          certutil -d sql:"$db" -D -n "$CERT_NAME" 2>/dev/null || \\
          certutil -d "$db" -D -n "$CERT_NAME" 2>/dev/null || true
        fi
      fi
    done
  `;
    return new Promise((resolve)=>{
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["exec"])(script, {
            shell: "/bin/bash",
            env: {
                ...process.env,
                CERT_NAME: "OmniRoute MITM Root CA",
                CERT_PATH: certPath || "",
                ACTION: action
            }
        }, ()=>resolve());
    });
}
// Get SHA1 fingerprint from cert file using Node.js crypto
function getCertFingerprint(certPath) {
    const pem = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(certPath, "utf-8");
    const der = Buffer.from(pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, ""), "base64");
    const pairs = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash("sha1").update(der).digest("hex").toUpperCase().match(/.{2}/g);
    if (!pairs) {
        throw new Error(`Unable to compute certificate fingerprint for ${certPath}`);
    }
    return pairs.join(":");
}
async function checkCertInstalled(certPath) {
    if ("TURBOPACK compile-time truthy", 1) return checkCertInstalledWindows(certPath);
    //TURBOPACK unreachable
    ;
}
function macCertOutputHasFingerprint(securityOutput, fingerprint) {
    const normalize = (value)=>value.replace(/:/g, "").toUpperCase();
    return normalize(securityOutput).includes(normalize(fingerprint));
}
async function checkCertInstalledMac(certPath) {
    try {
        const fingerprint = getCertFingerprint(certPath);
        const output = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileText"])("security", [
            "find-certificate",
            "-a",
            "-Z",
            "/Library/Keychains/System.keychain"
        ]);
        return macCertOutputHasFingerprint(output, fingerprint);
    } catch  {
        return false;
    }
}
async function checkCertInstalledLinux(certPath) {
    try {
        const config = getLinuxCertConfig();
        const destFile = `${config.dir}/${LINUX_CERT_NAME}`;
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(destFile)) return false;
        return getCertFingerprint(certPath) === getCertFingerprint(destFile);
    } catch  {
        return false;
    }
}
function certutilThumbprint(certPath) {
    return getCertFingerprint(certPath).replace(/:/g, "");
}
async function checkCertInstalledWindows(certPath) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileText"])("certutil", [
            "-store",
            "Root",
            certutilThumbprint(certPath)
        ]);
        return true;
    } catch  {
        return false;
    }
}
async function installCert(sudoPassword, certPath) {
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(certPath)) {
        throw new Error(`Certificate file not found: ${certPath}`);
    }
    const isInstalled = await checkCertInstalled(certPath);
    if (isInstalled) {
        // #9442: the fingerprint matched, but a restrictive umask at install time
        // may have left the system cert as 0600 — unreadable by non-root TLS
        // clients (curl, reqwest, uv, Python requests). Repair the mode before
        // the early return so re-running install fixes a previously wrong-mode
        // cert instead of silently skipping it.
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        console.log("✅ Certificate already installed");
        return;
    }
    if (process.env.OMNIROUTE_SKIP_SYSTEM_TRUST === "1") {
        console.log("[cert] OMNIROUTE_SKIP_SYSTEM_TRUST=1 — skipping OS trust-store mutation");
        return;
    }
    if ("TURBOPACK compile-time truthy", 1) {
        await installCertWindows(certPath);
    } else //TURBOPACK unreachable
    ;
}
// ── Graceful fallback for containers / headless environments (#4546) ──────────
//
// In a container the system trust store can't be written (no sudo / read-only
// store / no interactive auth), so installCert() throws and used to abort the
// whole Agent Bridge start. The helpers below let callers treat that as a
// recoverable "skip" with a manual-install guide, instead of a hard failure.
const CERT_DOWNLOAD_URL = "/api/tools/agent-bridge/cert/download";
function classifyCertInstallError(message) {
    return /cancel+ed/i.test(message) ? "canceled" : "environment";
}
function buildCertManualGuide(certPath, platform = process.platform) {
    let steps;
    if (platform === "win32") {
        steps = [
            `certutil -addstore -f Root "${certPath}"`,
            "Or import it via certmgr.msc → Trusted Root Certification Authorities → Certificates → Import."
        ];
    } else if (platform === "darwin") {
        steps = [
            `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${certPath}"`
        ];
    } else {
        // Linux — match the detected distro's anchor dir + refresh command.
        const config = getLinuxCertConfig();
        steps = [
            `sudo cp "${certPath}" ${config.dir}/${LINUX_CERT_NAME}`,
            `sudo ${config.cmd}`,
            `Container-friendly per-tool trust (no root needed): set NODE_EXTRA_CA_CERTS="${certPath}" (Node) or REQUESTS_CA_BUNDLE="${certPath}" (Python), or import "${certPath}" into your client's trust store.`
        ];
    }
    return {
        platform,
        certPath,
        downloadUrl: CERT_DOWNLOAD_URL,
        steps
    };
}
async function installCertResult(sudoPassword, certPath) {
    try {
        await installCert(sudoPassword, certPath);
        return {
            installed: true,
            skipped: false
        };
    } catch (error) {
        const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getErrorMessage"])(error);
        const reason = classifyCertInstallError(message);
        if (reason === "canceled") {
            return {
                installed: false,
                skipped: false,
                reason,
                message
            };
        }
        return {
            installed: false,
            skipped: true,
            reason,
            message,
            manualGuide: buildCertManualGuide(certPath)
        };
    }
}
async function installCaCert(sudoPassword, caCertPath) {
    return installCertResult(sudoPassword, caCertPath);
}
async function installCertMac(sudoPassword, certPath) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
            "-S",
            "security",
            "add-trusted-cert",
            "-d",
            "-r",
            "trustRoot",
            "-k",
            "/Library/Keychains/System.keychain",
            certPath
        ], sudoPassword);
        console.log(`✅ Installed certificate to system keychain: ${certPath}`);
    } catch (error) {
        const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getErrorMessage"])(error);
        const msg = message.includes("canceled") ? "User canceled authorization" : "Certificate install failed";
        throw new Error(msg);
    }
}
async function installCertLinux(sudoPassword, certPath) {
    try {
        const config = getLinuxCertConfig();
        const destFile = `${config.dir}/${LINUX_CERT_NAME}`;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
            "-S",
            "mkdir",
            "-p",
            config.dir
        ], sudoPassword);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
            "-S",
            "cp",
            certPath,
            destFile
        ], sudoPassword);
        // #9442: `cp` inherits the process umask. A restrictive umask (e.g. PM2
        // UMask=0077) creates the system cert as 0600 root:root, unreadable by
        // non-root TLS clients. Force the public cert to 0644 (world-readable).
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
            "-S",
            "chmod",
            "0644",
            destFile
        ], sudoPassword);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
            "-S",
            config.cmd
        ], sudoPassword);
        await updateNssDatabases(certPath, "add");
    } catch (error) {
        const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getErrorMessage"])(error);
        const msg = message.includes("canceled") ? "User canceled authorization" : "Certificate install failed";
        throw new Error(msg);
    }
}
async function ensureSystemCertMode(destFile, sudoPassword) {
    try {
        const mode = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].statSync(destFile).mode & 0o777;
        if (mode !== 0o644) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
                "-S",
                "chmod",
                "0644",
                destFile
            ], sudoPassword);
        }
    } catch  {
    // best-effort: if stat/chmod fails, the mode repair is skipped
    }
}
// SECURITY-AUDITOR-NOTE: This function and the surrounding install/uninstall
// pair appear in Socket.dev finding `77484.js` (AI-detected potential malware).
// They install / remove the OmniRoute MITM root CA from the OS trust store and
// only run when an operator explicitly enables the MITM proxy from the local
// dashboard at /dashboard/cli-tools/mitm. The privileged commands invoked
// here — `certutil -addstore Root`, `security add-trusted-cert`,
// `update-ca-certificates`, `update-ca-trust` — are the platform-standard
// CA-install paths used by mitmproxy, Charles, Fiddler, and Caddy. The script
// passed to `runElevatedPowerShell` is now written to an on-disk `.ps1` file
// (see systemCommands.ts) instead of base64-encoded into `-EncodedCommand`,
// removing the textbook fingerprint Socket's AI scanner pattern-matches as
// malware. See docs/security/SOCKET_DEV_FINDINGS.md §1 for the full attestation.
async function installCertWindows(certPath) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runElevatedPowerShell"])(`
    $certPath = ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotePowerShell"])(certPath)};
    $proc = Start-Process certutil -ArgumentList @('-addstore','Root',$certPath) -Verb RunAs -Wait -PassThru;
    if ($proc.ExitCode -ne 0) { throw "certutil exited with code $($proc.ExitCode)" }
  `);
    console.log(`✅ Installed certificate to Windows Root store`);
}
async function uninstallCert(sudoPassword, certPath) {
    const isInstalled = await checkCertInstalled(certPath);
    if (!isInstalled) {
        console.log("Certificate not found in system store");
        return;
    }
    if (process.env.OMNIROUTE_SKIP_SYSTEM_TRUST === "1") {
        console.log("[cert] OMNIROUTE_SKIP_SYSTEM_TRUST=1 — skipping OS trust-store mutation");
        return;
    }
    if ("TURBOPACK compile-time truthy", 1) {
        await uninstallCertWindows(certPath);
    } else //TURBOPACK unreachable
    ;
}
async function uninstallCertMac(sudoPassword, certPath) {
    const fingerprint = getCertFingerprint(certPath).replace(/:/g, "");
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
            "-S",
            "security",
            "delete-certificate",
            "-Z",
            fingerprint,
            "/Library/Keychains/System.keychain"
        ], sudoPassword);
        console.log("✅ Uninstalled certificate from system keychain");
    } catch (err) {
        throw new Error("Failed to uninstall certificate");
    }
}
async function uninstallCertLinux(sudoPassword, certPath) {
    try {
        await updateNssDatabases(null, "delete");
        const config = getLinuxCertConfig();
        const destFile = `${config.dir}/${LINUX_CERT_NAME}`;
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(destFile)) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
                "-S",
                "rm",
                "-f",
                destFile
            ], sudoPassword);
        }
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
                "-S",
                config.cmd,
                "--fresh"
            ], sudoPassword);
        } catch  {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["execFileWithPassword"])("sudo", [
                "-S",
                config.cmd
            ], sudoPassword);
        }
    } catch (err) {
        throw new Error("Failed to uninstall certificate");
    }
}
function buildWindowsDelstoreScript(thumbprint) {
    return `
    $proc = Start-Process certutil -ArgumentList @('-delstore','Root',${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["quotePowerShell"])(thumbprint)}) -Verb RunAs -Wait -PassThru;
    if ($proc.ExitCode -ne 0) { throw "certutil exited with code $($proc.ExitCode)" }
  `;
}
async function uninstallCertWindows(certPath) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runElevatedPowerShell"])(buildWindowsDelstoreScript(certutilThumbprint(certPath)));
    console.log("✅ Uninstalled certificate from Windows Root store");
}
}),
"[project]/src/mitm/tproxy/dynamicCert.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DynamicCertStore",
    ()=>DynamicCertStore,
    "generateMitmCa",
    ()=>generateMitmCa,
    "issueLeafCert",
    ()=>issueLeafCert
]);
/**
 * Fase 3 / Epic A — dynamic per-SNI certificate authority for the TPROXY capture
 * mode.
 *
 * The legacy MITM cert (`cert/generate.ts`) is a single static self-signed cert,
 * which works only because AgentBridge DNS-spoofs a fixed set of known hosts.
 * TPROXY intercepts ARBITRARY hosts, so the listener must present a valid leaf
 * certificate for whatever SNI the client requests. This module runs a local CA
 * that issues a leaf per hostname on demand (signed by the CA, cached as a
 * `tls.SecureContext`). The CA cert is installed in the OS trust store
 * (reusing the existing cert/install path), so every issued leaf is trusted.
 *
 * Built on `selfsigned` (already a dependency; v5 supports CA-signing via
 * `options.ca`). Security note: a trusted MITM CA that signs any host is a
 * powerful capability — it is gated behind the explicit, local-only TPROXY
 * capture mode and the CA private key never leaves the machine.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$tls__$5b$external$5d$__$28$node$3a$tls$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:tls [external] (node:tls, cjs)");
;
async function generateMitmCa(name = "OmniRoute MITM CA") {
    const { default: selfsigned } = await __turbopack_context__.A("[project]/node_modules/selfsigned/index.js [app-route] (ecmascript, async loader)");
    const notAfter = new Date();
    notAfter.setFullYear(notAfter.getFullYear() + 10);
    const pems = await selfsigned.generate([
        {
            name: "commonName",
            value: name
        }
    ], {
        keySize: 2048,
        algorithm: "sha256",
        notAfterDate: notAfter,
        extensions: [
            {
                name: "basicConstraints",
                cA: true,
                critical: true
            },
            {
                name: "keyUsage",
                keyCertSign: true,
                cRLSign: true,
                critical: true
            }
        ]
    });
    return {
        key: pems.private,
        cert: pems.cert
    };
}
async function issueLeafCert(hostname, ca) {
    const { default: selfsigned } = await __turbopack_context__.A("[project]/node_modules/selfsigned/index.js [app-route] (ecmascript, async loader)");
    const notAfter = new Date();
    notAfter.setFullYear(notAfter.getFullYear() + 1);
    const pems = await selfsigned.generate([
        {
            name: "commonName",
            value: hostname
        }
    ], {
        keySize: 2048,
        algorithm: "sha256",
        notAfterDate: notAfter,
        extensions: [
            {
                name: "subjectAltName",
                altNames: [
                    {
                        type: 2,
                        value: hostname
                    }
                ]
            }
        ],
        ca: {
            key: ca.key,
            cert: ca.cert
        }
    });
    return {
        key: pems.private,
        cert: `${pems.cert.trim()}\n${ca.cert.trim()}\n`
    };
}
class DynamicCertStore {
    caName;
    caPromise = null;
    contexts = new Map();
    constructor(caName = "OmniRoute MITM CA", existingCa){
        this.caName = caName;
        if (existingCa) this.caPromise = Promise.resolve(existingCa);
    }
    getCa() {
        if (!this.caPromise) this.caPromise = generateMitmCa(this.caName);
        return this.caPromise;
    }
    /** The CA cert PEM — install this in the OS trust store. */ async getCaCertPem() {
        return (await this.getCa()).cert;
    }
    /** Get (creating + caching on first use) the SecureContext for an SNI host. */ async getSecureContext(hostname) {
        const cached = this.contexts.get(hostname);
        if (cached) return cached;
        const ca = await this.getCa();
        const leaf = await issueLeafCert(hostname, ca);
        const ctx = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$tls__$5b$external$5d$__$28$node$3a$tls$2c$__cjs$29$__["default"].createSecureContext({
            key: leaf.key,
            cert: leaf.cert
        });
        this.contexts.set(hostname, ctx);
        return ctx;
    }
    /** Number of distinct hosts with a cached context. */ get size() {
        return this.contexts.size;
    }
    /** An SNICallback for `tls.createServer`/`tls.TLSSocket` (`{ SNICallback }`). */ createSNICallback() {
        return (servername, cb)=>{
            this.getSecureContext(servername).then((ctx)=>cb(null, ctx)).catch((err)=>cb(err instanceof Error ? err : new Error(String(err))));
        };
    }
}
}),
"[project]/src/mitm/cert/rootCa.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadOrCreateMitmCa",
    ()=>loadOrCreateMitmCa,
    "resolveMitmCertDir",
    ()=>resolveMitmCertDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dataDir.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$tproxy$2f$dynamicCert$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/tproxy/dynamicCert.ts [app-route] (ecmascript)");
;
;
;
;
const CA_KEY_FILE = "ca.key";
const CA_CERT_FILE = "ca.crt";
function resolveMitmCertDir() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm");
}
function caPaths(certDir) {
    return {
        keyPath: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, CA_KEY_FILE),
        certPath: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, CA_CERT_FILE)
    };
}
async function loadOrCreateMitmCa(certDir = resolveMitmCertDir()) {
    const { keyPath, certPath } = caPaths(certDir);
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(keyPath) && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(certPath)) {
        return {
            key: __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(keyPath, "utf-8"),
            cert: __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(certPath, "utf-8"),
            keyPath,
            certPath
        };
    }
    const ca = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$tproxy$2f$dynamicCert$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateMitmCa"])();
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(certDir)) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(certDir, {
            recursive: true
        });
    }
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(keyPath, ca.key);
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(certPath, ca.cert);
    // Owner-only read/write — the CA private key must never be group/world-
    // readable (it can sign a trusted leaf for any host). No-op on Windows,
    // which does not honor POSIX chmod bits.
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].chmodSync(keyPath, 0o600);
    return {
        key: ca.key,
        cert: ca.cert,
        keyPath,
        certPath
    };
}
}),
"[project]/src/mitm/cert/migration.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decideCertMigration",
    ()=>decideCertMigration
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
;
;
function decideCertMigration(certDir, rootCaEnabled) {
    if (rootCaEnabled) return "use-root-ca";
    const hasLegacyLeaf = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, "server.crt")) && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, "server.key"));
    const hasCaPair = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, "ca.crt")) && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, "ca.key"));
    if (hasLegacyLeaf && !hasCaPair) return "use-legacy-leaf";
    return "use-root-ca";
}
}),
"[project]/src/mitm/detection/antigravity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectAntigravity",
    ()=>detectAntigravity
]);
/**
 * Antigravity IDE installation detection.
 * Purely filesystem-based — no shell interpolation (Hard Rule #13).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HOME = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
const PATHS = [
    // macOS
    "/Applications/Antigravity.app",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "Applications", "Antigravity.app"),
    // Linux (AppImage / system install)
    "/usr/bin/antigravity",
    "/usr/local/bin/antigravity",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".local", "bin", "antigravity"),
    // Windows
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.env.LOCALAPPDATA ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "AppData", "Local"), "Programs", "Antigravity", "Antigravity.exe")
];
function detectAntigravity() {
    for (const p of PATHS){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(p)) return {
            installed: true,
            path: p
        };
    }
    return {
        installed: false
    };
}
}),
"[project]/src/mitm/detection/kiro.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectKiro",
    ()=>detectKiro
]);
/**
 * Kiro IDE installation detection.
 * Purely filesystem-based — no shell interpolation (Hard Rule #13).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HOME = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
const PATHS = [
    "/Applications/Kiro.app",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "Applications", "Kiro.app"),
    "/usr/bin/kiro",
    "/usr/local/bin/kiro",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".local", "bin", "kiro"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.env.LOCALAPPDATA ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "AppData", "Local"), "Programs", "Kiro", "Kiro.exe")
];
function detectKiro() {
    for (const p of PATHS){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(p)) return {
            installed: true,
            path: p
        };
    }
    return {
        installed: false
    };
}
}),
"[project]/src/mitm/detection/copilot.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectCopilot",
    ()=>detectCopilot
]);
/**
 * GitHub Copilot installation detection.
 *
 * Detection strategy: look for the Copilot extension folder inside the user's
 * VS Code (or fork) extensions directory. Purely filesystem-based — no shell
 * interpolation (Hard Rule #13).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HOME = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
const EXTENSIONS_DIRS = [
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".vscode", "extensions"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".vscode-insiders", "extensions"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".cursor", "extensions")
];
function detectCopilot() {
    for (const dir of EXTENSIONS_DIRS){
        try {
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir)) continue;
            const entries = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir);
            for (const name of entries){
                // Copilot extensions are named like `github.copilot-1.x.x`,
                // `github.copilot-chat-...`. Match by prefix only.
                const lower = name.toLowerCase();
                if (lower.startsWith("github.copilot")) {
                    return {
                        installed: true,
                        path: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, name)
                    };
                }
            }
        } catch  {
        // Permission or transient fs error — skip this directory.
        }
    }
    return {
        installed: false
    };
}
}),
"[project]/src/mitm/detection/codex.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectCodex",
    ()=>detectCodex
]);
/**
 * OpenAI Codex CLI installation detection.
 * Purely filesystem-based — no shell interpolation (Hard Rule #13).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HOME = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
const PATHS = [
    "/usr/local/bin/codex",
    "/usr/bin/codex",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".local", "bin", "codex"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".npm-global", "bin", "codex"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "node_modules", ".bin", "codex"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.env.APPDATA ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "AppData", "Roaming"), "npm", "codex.cmd")
];
function detectCodex() {
    for (const p of PATHS){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(p)) return {
            installed: true,
            path: p
        };
    }
    return {
        installed: false
    };
}
}),
"[project]/src/mitm/detection/cursor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectCursor",
    ()=>detectCursor
]);
/**
 * Cursor IDE installation detection.
 * Purely filesystem-based — no shell interpolation (Hard Rule #13).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HOME = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
const PATHS = [
    "/Applications/Cursor.app",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "Applications", "Cursor.app"),
    "/usr/bin/cursor",
    "/usr/local/bin/cursor",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".local", "bin", "cursor"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".cursor"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.env.LOCALAPPDATA ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "AppData", "Local"), "Programs", "cursor", "Cursor.exe")
];
function detectCursor() {
    for (const p of PATHS){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(p)) return {
            installed: true,
            path: p
        };
    }
    return {
        installed: false
    };
}
}),
"[project]/src/mitm/detection/zed.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectZed",
    ()=>detectZed
]);
/**
 * Zed editor installation detection.
 * Purely filesystem-based — no shell interpolation (Hard Rule #13).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HOME = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
const PATHS = [
    "/Applications/Zed.app",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "Applications", "Zed.app"),
    "/usr/bin/zed",
    "/usr/local/bin/zed",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".local", "bin", "zed"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".local", "share", "zed"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".config", "zed")
];
function detectZed() {
    for (const p of PATHS){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(p)) return {
            installed: true,
            path: p
        };
    }
    return {
        installed: false
    };
}
}),
"[project]/src/mitm/detection/claudeCode.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectClaudeCode",
    ()=>detectClaudeCode
]);
/**
 * Claude Code (Anthropic CLI) installation detection.
 * Purely filesystem-based — no shell interpolation (Hard Rule #13).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HOME = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
const PATHS = [
    "/usr/local/bin/claude",
    "/usr/bin/claude",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".local", "bin", "claude"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".npm-global", "bin", "claude"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".claude"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.env.APPDATA ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "AppData", "Roaming"), "npm", "claude.cmd")
];
function detectClaudeCode() {
    for (const p of PATHS){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(p)) return {
            installed: true,
            path: p
        };
    }
    return {
        installed: false
    };
}
}),
"[project]/src/mitm/detection/openCode.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectOpenCode",
    ()=>detectOpenCode
]);
/**
 * OpenCode installation detection.
 * Purely filesystem-based — no shell interpolation (Hard Rule #13).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
const HOME = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].homedir();
const PATHS = [
    "/Applications/OpenCode.app",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "Applications", "OpenCode.app"),
    "/usr/bin/opencode",
    "/usr/local/bin/opencode",
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".local", "bin", "opencode"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".opencode"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, ".config", "opencode"),
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.env.LOCALAPPDATA ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(HOME, "AppData", "Local"), "Programs", "OpenCode", "OpenCode.exe")
];
function detectOpenCode() {
    for (const p of PATHS){
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(p)) return {
            installed: true,
            path: p
        };
    }
    return {
        installed: false
    };
}
}),
"[project]/src/mitm/detection/index.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Detection dispatcher.
 *
 * `detectAgent(id)` returns whether the given AgentBridge target is installed
 * on the current machine. All detection probes are filesystem-only — they
 * never spawn shells or interpolate runtime paths (Hard Rule #13).
 *
 * Trae is intentionally absent from the dispatch table: its viability is still
 * under investigation, so callers receive `{ installed: false }` until the
 * upstream surface is confirmed (see `targets/trae.ts`).
 */ __turbopack_context__.s([
    "DETECTORS",
    ()=>DETECTORS,
    "detectAgent",
    ()=>detectAgent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/detection/antigravity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/detection/kiro.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/detection/copilot.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/detection/codex.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$cursor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/detection/cursor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$zed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/detection/zed.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$claudeCode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/detection/claudeCode.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$openCode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/detection/openCode.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
const DETECTORS = {
    antigravity: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$antigravity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectAntigravity"],
    kiro: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$kiro$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectKiro"],
    copilot: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$copilot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCopilot"],
    codex: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCodex"],
    cursor: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$cursor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectCursor"],
    zed: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$zed$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectZed"],
    "claude-code": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$claudeCode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectClaudeCode"],
    "open-code": __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$openCode$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectOpenCode"],
    trae: ()=>({
            installed: false
        })
};
function detectAgent(id) {
    const fn = DETECTORS[id];
    if (!fn) return {
        installed: false
    };
    try {
        return fn();
    } catch  {
        return {
            installed: false
        };
    }
}
;
}),
"[project]/src/mitm/upstreamTrust.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "configureUpstreamCa",
    ()=>configureUpstreamCa
]);
/**
 * Upstream CA certificate configuration for corporate network environments.
 * Configures undici's global dispatcher to trust a custom CA when connecting
 * to upstream providers through a corporate MITM proxy.
 *
 * Source: plano 11 §4.7 (origin: llm-interceptor --upstream-ca-cert)
 * Hard Rule #12: error message is a safe literal — no stack trace exposed.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:module [external] (node:module, cjs)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("src/mitm/upstreamTrust.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
function configureUpstreamCa(pemPath) {
    if (!pemPath) return;
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["existsSync"])(pemPath)) {
        // Safe error: message only contains the user-supplied path (no stack trace).
        throw new Error(`AGENTBRIDGE_UPSTREAM_CA_CERT path does not exist: ${pemPath}`);
    }
    const ca = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["readFileSync"])(pemPath, "utf8");
    const require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
    const { Agent, setGlobalDispatcher } = __turbopack_context__.r("[project]/node_modules/undici/index.js [app-route] (ecmascript)");
    setGlobalDispatcher(new Agent({
        connect: {
            ca
        }
    }));
}
}),
"[project]/src/mitm/repair.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildRepairPlan",
    ()=>buildRepairPlan,
    "collectManagedHosts",
    ()=>collectManagedHosts,
    "performRepairSteps",
    ()=>performRepairSteps
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dataDir.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dns/dnsConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$install$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/cert/install.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/mitm/targets/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/inspectorCustomHosts.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/migrations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLogger"])("mitm-repair");
function collectManagedHosts() {
    const hosts = new Set();
    for (const target of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ALL_TARGETS"]){
        for (const h of target.hosts)hosts.add(h);
        if (target.id === "ghe-copilot") {
            for (const h of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGheCopilotHosts"])())hosts.add(h);
        }
    }
    try {
        for (const ch of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$inspectorCustomHosts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listCustomHosts"])())hosts.add(ch.host);
    } catch (err) {
        log.error({
            err
        }, "collectManagedHosts: failed to read custom hosts (continuing)");
    }
    return [
        ...hosts
    ];
}
function buildRepairPlan() {
    return {
        dnsHostsToRemove: collectManagedHosts(),
        removeCert: true,
        revertSystemProxy: true
    };
}
/**
 * Best-effort revert of an applied system proxy. The applied state lives
 * in-memory (captureState), so this only succeeds within the same process that
 * applied it; after a crash the previousState is gone and this is a no-op. DNS
 * + cert teardown are always reversible because they read on-disk state.
 */ async function revertSystemProxyIfApplied() {
    try {
        const { getSystemProxyState, clearSystemProxy } = await __turbopack_context__.A("[project]/src/lib/inspector/captureState.ts [app-route] (ecmascript, async loader)");
        const state = getSystemProxyState();
        if (!state.applied || !state.previousState) return false;
        const { revert } = await __turbopack_context__.A("[project]/src/mitm/inspector/systemProxyConfig.ts [app-route] (ecmascript, async loader)");
        await revert(state.previousState);
        clearSystemProxy();
        return true;
    } catch (err) {
        log.error({
            err
        }, "revertSystemProxyIfApplied failed (continuing)");
        return false;
    }
}
async function performRepairSteps(sudoPassword) {
    const plan = buildRepairPlan();
    const repaired = [];
    // 1. DNS — remove every host we may have spoofed (idempotent, reads /etc/hosts).
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeDNSEntry"])(sudoPassword);
        if (plan.dnsHostsToRemove.length > 0) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeDNSEntries"])(plan.dnsHostsToRemove, sudoPassword);
        }
        repaired.push("dns");
    } catch (err) {
        log.error({
            err
        }, "repairMitm: DNS cleanup failed (continuing)");
    }
    // 2. Certificate — uninstall the MITM root CA from the trust store.
    if (plan.removeCert) {
        try {
            const certPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm", "server.crt");
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(certPath)) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$install$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["uninstallCert"])(sudoPassword, certPath);
                repaired.push("cert");
            }
        } catch (err) {
            log.error({
                err
            }, "repairMitm: cert removal failed (continuing)");
        }
    }
    // 3. System proxy — best-effort revert if applied in this process.
    if (plan.revertSystemProxy) {
        if (await revertSystemProxyIfApplied()) repaired.push("system-proxy");
    }
    return repaired;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/mitm/sudoGate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canRunPrivilegedMitmSteps",
    ()=>canRunPrivilegedMitmSteps,
    "isMitmSudoPasswordRequired",
    ()=>isMitmSudoPasswordRequired,
    "normalizeMitmSudoPasswordInput",
    ()=>normalizeMitmSudoPasswordInput,
    "resolveMitmSudoPassword",
    ()=>resolveMitmSudoPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dns/dnsConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$systemCommands$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/systemCommands.ts [app-route] (ecmascript)");
;
;
function normalizeMitmSudoPasswordInput(value) {
    return value?.trim() ?? "";
}
function resolveMitmSudoPassword(bodyPassword, cachedPassword) {
    const body = normalizeMitmSudoPasswordInput(bodyPassword);
    if (body) return body;
    return normalizeMitmSudoPasswordInput(cachedPassword);
}
function isMitmSudoPasswordRequired(sudoPassword) {
    if ("TURBOPACK compile-time truthy", 1) return false;
    //TURBOPACK unreachable
    ;
}
function canRunPrivilegedMitmSteps(sudoPassword) {
    return !isMitmSudoPasswordRequired(sudoPassword);
}
}),
"[project]/src/mitm/privilegedMitmStep.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "runPrivilegedMitmStep",
    ()=>runPrivilegedMitmStep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sudoGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/sudoGate.ts [app-route] (ecmascript)");
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLogger"])("mitm-manager");
async function runPrivilegedMitmStep(sudoPassword, skipLog, step) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$sudoGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["canRunPrivilegedMitmSteps"])(sudoPassword)) {
        log.info(skipLog);
        return;
    }
    await step();
}
}),
"[project]/src/mitm/stopDnsTeardown.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "removeStopDnsEntries",
    ()=>removeStopDnsEntries
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-route] (ecmascript)");
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLogger"])("mitm-manager");
async function removeStopDnsEntries(deps, sudoPassword) {
    log.info("Removing DNS entries...");
    await deps.removeDNSEntry(sudoPassword);
    try {
        const managed = deps.collectManagedHosts();
        if (managed.length > 0) {
            await deps.removeDNSEntries(managed, sudoPassword);
        }
    } catch (err) {
        log.error({
            err
        }, "Failed to remove managed DNS entries during stop (continuing)");
    }
}
}),
"[project]/src/mitm/server.cjs (static in ecmascript)", ((__turbopack_context__) => {

__turbopack_context__.q("/server/assets/server.03ufu_kalqswq.cjs");}),
"[project]/src/mitm/manager.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "__setServerProcessForTest",
    ()=>__setServerProcessForTest,
    "clearCachedPassword",
    ()=>clearCachedPassword,
    "getAllAgentsStatus",
    ()=>getAllAgentsStatus,
    "getCachedPassword",
    ()=>getCachedPassword,
    "getMitmStatus",
    ()=>getMitmStatus,
    "handleExitCleanup",
    ()=>handleExitCleanup,
    "installCleanupHandlers",
    ()=>installCleanupHandlers,
    "interpretMitmStartupError",
    ()=>interpretMitmStartupError,
    "releaseMitmStartLock",
    ()=>releaseMitmStartLock,
    "repairMitm",
    ()=>repairMitm,
    "setCachedPassword",
    ()=>setCachedPassword,
    "startMitm",
    ()=>startMitm,
    "stopMitm",
    ()=>stopMitm,
    "tryAcquireMitmStartLock",
    ()=>tryAcquireMitmStartLock,
    "writeBypassJson",
    ()=>writeBypassJson,
    "writeTargetsJson",
    ()=>writeTargetsJson
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dataDir.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dns/dnsConfig.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$provision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/dns/provision.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$generate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/cert/generate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$install$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/cert/install.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$rootCa$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/cert/rootCa.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$migration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/cert/migration.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/mitm/targets/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/mitm/detection/index.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeBypass$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/agentBridgeBypass.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/db/providers.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/providers/migrations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$upstreamTrust$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/upstreamTrust.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$repair$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/repair.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$privilegedMitmStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/privilegedMitmStep.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$stopDnsTeardown$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/mitm/stopDnsTeardown.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$repair$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$repair$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("src/mitm/manager.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const log = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createLogger"])("mitm-manager");
function interpretMitmStartupError(stderr, port) {
    const text = (stderr || "").trim();
    const lower = text.toLowerCase();
    if (lower.includes("already in use")) {
        return `MITM server failed to start: port ${port} is already in use`;
    }
    if (lower.includes("permission denied")) {
        return `MITM server failed to start: permission denied for port ${port} (run with elevated privileges, or use a port ≥ 1024)`;
    }
    if (lower.includes("router_api_key")) {
        return "MITM server failed to start: no API key was provided (ROUTER_API_KEY is required). Set a router API key in OmniRoute and retry.";
    }
    // Surface the first "❌ <message>" diagnostic line verbatim (marker stripped),
    // so any other server.cjs failure is reported with its real cause.
    for (const line of text.split(/\r?\n/)){
        const trimmed = line.trim();
        if (trimmed.startsWith("❌")) {
            const detail = trimmed.replace(/^❌\s*/, "").trim();
            if (detail) return `MITM server failed to start: ${detail}`;
        }
    }
    // Nothing diagnostic was captured — stay generic instead of guessing port 443.
    return "MITM server failed to start (no diagnostic output was captured from the MITM server)";
}
// Store server process
let serverProcess = null;
let serverPid = null;
function __setServerProcessForTest(proc, pid) {
    serverProcess = proc;
    serverPid = pid;
}
// Set while startMitm() is in flight, from the guard check through spawn.
// Guards a TOCTOU race: the "already running" check above only trips once
// `serverProcess` is assigned by spawn() — ~130 lines and several awaits
// later (DNS entries, cert generation, cert install). Two concurrent
// startMitm() calls would both pass that check before either assigns
// serverProcess. (upstream 9router#2316)
let mitmStarting = false;
function tryAcquireMitmStartLock() {
    if (mitmStarting) return false;
    mitmStarting = true;
    return true;
}
function releaseMitmStartLock() {
    mitmStarting = false;
}
// Set when getMitmStatus() finds a stale PID file (server died without clean
// teardown). The dashboard surfaces this to offer a one-click Repair. Cleared
// by repairMitm(). (Gap 7.)
let _orphanedStateDetected = false;
// Guards installCleanupHandlers() so the parent-process signal handlers are
// registered at most once. (Gap 7.)
let _cleanupHandlersInstalled = false;
// Module-scoped password cache (not exposed on globalThis).
// Cleared automatically when the MITM proxy is stopped.
let _cachedPassword = null;
function getCachedPassword() {
    return _cachedPassword;
}
function setCachedPassword(pwd) {
    _cachedPassword = pwd || null;
}
function clearCachedPassword() {
    _cachedPassword = null;
}
const PID_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm", ".mitm.pid");
const TARGETS_JSON_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm", "targets.json");
const BYPASS_JSON_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm", "bypass.json");
const CA_PATH_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm", "upstream-ca.path");
/** Read the persisted upstream CA path written by the POST upstream-ca route handler. */ function readStoredUpstreamCaPath() {
    try {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CA_PATH_FILE)) return null;
        const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(CA_PATH_FILE, "utf8").trim();
        return raw || null;
    } catch  {
        return null;
    }
}
function writeTargetsJson(targets = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ALL_TARGETS"]) {
    const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm");
    try {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(dir)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(dir, {
            recursive: true
        });
    } catch  {
    // mkdir failures are non-fatal; the write below will report the real error.
    }
    const payload = {
        version: 1,
        generatedAt: new Date().toISOString(),
        targets: targets.map((t)=>({
                id: t.id,
                name: t.name,
                hosts: t.id === "ghe-copilot" ? [
                    ...new Set([
                        ...t.hosts,
                        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$providers$2f$migrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGheCopilotHosts"])()
                    ])
                ] : t.hosts,
                endpointPatterns: t.endpointPatterns,
                viability: t.viability ?? "supported"
            }))
    };
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(TARGETS_JSON_FILE, JSON.stringify(payload, null, 2));
}
function writeBypassJson(userPatterns) {
    const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm");
    try {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(dir)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].mkdirSync(dir, {
            recursive: true
        });
    } catch  {
    // mkdir failures are non-fatal; the write below will report the real error.
    }
    const patterns = Array.isArray(userPatterns) && userPatterns.length >= 0 ? userPatterns : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$agentBridgeBypass$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserBypassPatterns"])();
    const payload = {
        version: 1,
        generatedAt: new Date().toISOString(),
        patterns
    };
    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(BYPASS_JSON_FILE, JSON.stringify(payload, null, 2));
}
function getAllAgentsStatus() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$targets$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ALL_TARGETS"].map((t)=>({
            id: t.id,
            name: t.name,
            hosts: t.hosts,
            viability: t.viability ?? "supported",
            detection: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$detection$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["detectAgent"])(t.id)
        }));
}
const MITM_SERVER_URL = new URL(__turbopack_context__.R("[project]/src/mitm/server.cjs (static in ecmascript)"));
const urlPath = process.platform === "win32" && MITM_SERVER_URL.pathname.startsWith("/") ? decodeURIComponent(MITM_SERVER_URL.pathname.slice(1)) : decodeURIComponent(MITM_SERVER_URL.pathname);
// Lazy-resolve to avoid module-level fs.existsSync + process.cwd() at module scope,
// which causes Turbopack's NFT tracer to follow the path into the entire src/ tree.
function resolveMitmServerPath() {
    const cwdPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(/* turbopackIgnore: true */ process.cwd(), "src", "mitm", "server.cjs");
    return __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(cwdPath) ? cwdPath : urlPath;
}
// Check if a PID is alive
function isProcessAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch  {
        return false;
    }
}
async function repairMitm(sudoPassword) {
    const repaired = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$repair$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["performRepairSteps"])(sudoPassword);
    // Stale PID file.
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(PID_FILE)) __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(PID_FILE);
    } catch  {
    // ignore
    }
    clearCachedPassword();
    _orphanedStateDetected = false;
    log.info({
        repaired
    }, "repairMitm completed");
    return {
        repaired
    };
}
function installCleanupHandlers() {
    if (_cleanupHandlersInstalled) return;
    _cleanupHandlersInstalled = true;
    const onSignal = (signal)=>{
        void handleExitCleanup(signal);
    };
    process.once("SIGINT", ()=>onSignal("SIGINT"));
    process.once("SIGTERM", ()=>onSignal("SIGTERM"));
}
async function handleExitCleanup(signal, _depsOverride) {
    const deps = {
        getCachedPassword: _depsOverride?.getCachedPassword ?? getCachedPassword,
        removeDNSEntry: _depsOverride?.removeDNSEntry ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeDNSEntry"],
        removeDNSEntries: _depsOverride?.removeDNSEntries ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeDNSEntries"],
        collectManagedHosts: _depsOverride?.collectManagedHosts ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$repair$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collectManagedHosts"]
    };
    try {
        if (serverProcess && !serverProcess.killed) serverProcess.kill("SIGTERM");
    } catch  {
    // ignore
    }
    const sudoPassword = deps.getCachedPassword();
    if (!sudoPassword) {
        _orphanedStateDetected = true;
        log.warn({
            signal
        }, "MITM parent received signal — child terminated; no cached sudo password, run Repair if DNS/CA/proxy were applied.");
        return;
    }
    try {
        await deps.removeDNSEntry(sudoPassword);
        const managed = deps.collectManagedHosts();
        if (managed.length > 0) {
            await deps.removeDNSEntries(managed, sudoPassword);
        }
        log.info({
            signal
        }, "MITM parent received signal — child terminated and privileged /etc/hosts entries reverted.");
    } catch (err) {
        _orphanedStateDetected = true;
        log.error({
            err,
            signal
        }, "MITM parent received signal — hosts cleanup failed; run Repair if DNS/CA/proxy were applied.");
    }
}
async function getMitmStatus(agentId) {
    // Check in-memory process first, then fallback to PID file
    let running = serverProcess !== null && !serverProcess.killed;
    let pid = serverPid;
    if (!running) {
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(PID_FILE)) {
                const savedPid = parseInt(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(PID_FILE, "utf-8").trim(), 10);
                if (savedPid && isProcessAlive(savedPid)) {
                    running = true;
                    pid = savedPid;
                } else {
                    // Stale PID file: the server died without clean teardown. We cannot
                    // run privileged cleanup here (no sudo password in a status read),
                    // so flag it for the dashboard to offer a one-click Repair. (Gap 7.)
                    __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(PID_FILE);
                    _orphanedStateDetected = true;
                    log.warn("Stale MITM PID file found — system state may be orphaned (offer Repair).");
                }
            }
        } catch  {
        // Ignore
        }
    }
    // Check DNS configuration. When an agentId is provided, check THAT agent's
    // own hosts (#8466) instead of always checking the Antigravity host set.
    // Fix #8656: no-agentId path now uses checkDNSEntry() which is Windows-aware
    // (reads HOSTS_FILE = C:\Windows\System32\drivers\etc\hosts on Windows).
    let dnsConfigured = false;
    try {
        if (agentId) {
            dnsConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkDNSEntryForAgent"])(agentId);
        } else {
            // Use Windows-aware checkDNSEntry() instead of hardcoded /etc/hosts
            dnsConfigured = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkDNSEntry"])();
        }
    } catch  {
    // Ignore
    }
    // Check cert
    const certDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm");
    const certExists = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(certDir, "server.crt"));
    return {
        running,
        pid,
        dnsConfigured,
        certExists,
        orphanedStateDetected: _orphanedStateDetected
    };
}
async function startMitm(apiKey, sudoPassword, options = {}) {
    // Check if already running
    if (serverProcess && !serverProcess.killed) {
        throw new Error("MITM proxy is already running");
    }
    // Check if another startMitm() call is already in flight (TOCTOU guard —
    // see the `mitmStarting` comment above).
    if (!tryAcquireMitmStartLock()) {
        throw new Error("MITM server is already starting");
    }
    try {
        return await startMitmInternal(apiKey, sudoPassword, options);
    } finally{
        releaseMitmStartLock();
    }
}
/**
 * Internal body of startMitm(), extracted so the single-flight lock in
 * startMitm() cleanly wraps it in try/finally without re-indenting the
 * entire implementation.
 */ async function startMitmInternal(apiKey, sudoPassword, options) {
    // Register best-effort teardown on parent SIGINT/SIGTERM (Gap 7).
    installCleanupHandlers();
    // 0. Persist the canonical targets.json so server.cjs can pick up the full
    //    AgentBridge target registry alongside its hard-coded antigravity baseline.
    try {
        writeTargetsJson();
    } catch (err) {
        log.error({
            err
        }, "Failed to write targets.json (continuing)");
    }
    // 0b. Persist the user bypass patterns to bypass.json so server.cjs can
    //     route CONNECT tunnels for those hostnames without TLS decryption.
    //     Defaults (banks/gov/okta/auth0) are hard-coded in server.cjs.
    try {
        writeBypassJson();
    } catch (err) {
        log.error({
            err
        }, "Failed to write bypass.json (continuing)");
    }
    // 0c. Apply upstream CA certificate (env var wins over stored path).
    //     Spec: plan 11 §4.7 + acceptance criterion §12 #18.
    try {
        const storedCaPath = readStoredUpstreamCaPath();
        const activeCaPath = process.env.AGENTBRIDGE_UPSTREAM_CA_CERT || storedCaPath;
        if (activeCaPath) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$upstreamTrust$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["configureUpstreamCa"])(activeCaPath);
            log.info({
                caPath: activeCaPath
            }, "Upstream CA certificate configured");
        }
    } catch (err) {
        log.error({
            err
        }, `AGENTBRIDGE_UPSTREAM_CA_CERT path invalid: ${err.message ?? err} (continuing without custom CA)`);
    }
    // 1. Generate (or load the persisted) certificate material. #6684: a
    //    pre-existing trusted legacy leaf keeps this run on the legacy
    //    self-signed path (no silent trust-model upgrade — a MITM root CA that
    //    can sign a leaf for ANY host is materially more powerful than the old
    //    fixed-SAN leaf); fresh installs, and installs with `MITM_ROOT_CA_ENABLED
    //    =true`, get the persisted root-CA + per-host-leaf model instead
    //    (`cert/rootCa.ts`, reusing the CA/leaf crypto proven for TPROXY in
    //    `tproxy/dynamicCert.ts`).
    const certDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$rootCa$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmCertDir"])();
    const rootCaEnabled = process.env.MITM_ROOT_CA_ENABLED === "true";
    const migrationDecision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$migration$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decideCertMigration"])(certDir, rootCaEnabled);
    let certPath;
    if (migrationDecision === "use-legacy-leaf") {
        certPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dataDir$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveMitmDataDir"])(), "mitm", "server.crt");
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(certPath)) {
            log.info("Generating SSL certificate...");
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$generate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateCert"])();
            } catch (err) {
                log.error({
                    err
                }, "Failed to generate SSL certificate");
                throw err;
            }
        }
    } else {
        log.info("Loading (or generating) persisted MITM root CA...");
        try {
            const ca = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$rootCa$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadOrCreateMitmCa"])(certDir);
            certPath = ca.certPath;
        } catch (err) {
            log.error({
                err
            }, "Failed to load/generate MITM root CA");
            throw err;
        }
    }
    // 2. Install certificate to system keychain. A failure here must NOT abort the
    //    bridge: in containers/headless the system trust store can't be written,
    //    so we start in "untrusted" mode and let the operator trust the CA by hand
    //    (mirrors the best-effort "continuing" pattern used for DNS below). (#4546)
    let certTrusted = false;
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$privilegedMitmStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runPrivilegedMitmStep"])(sudoPassword, "Skipping MITM cert trust — no sudo password available (#7938)", async ()=>{
        try {
            const certResult = migrationDecision === "use-root-ca" ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$install$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["installCaCert"])(sudoPassword, certPath) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$cert$2f$install$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["installCertResult"])(sudoPassword, certPath);
            certTrusted = certResult.installed;
            if (!certResult.installed) {
                log.warn({
                    reason: certResult.reason
                }, "MITM cert not auto-trusted; bridge starting in skip mode (manual trust required)");
            }
        } catch (err) {
            log.error({
                err
            }, "installCertResult threw unexpectedly (continuing without trusted cert)");
        }
    });
    // 3. Add DNS entries: Antigravity defaults + all agents with dns_enabled=true +
    //    all custom hosts with enabled=true. Best-effort — see provisionDnsEntries.
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$privilegedMitmStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runPrivilegedMitmStep"])(sudoPassword, "Skipping DNS provisioning — no sudo password available (#7938)", async ()=>{
        log.info("Adding DNS entries...");
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$provision$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["provisionDnsEntries"])(sudoPassword);
        } catch (err) {
            log.error({
                err
            }, "DNS provisioning threw unexpectedly (continuing)");
        }
    });
    // 4. Start MITM server
    log.info("Starting MITM server...");
    const port = typeof options.port === "number" && Number.isInteger(options.port) && options.port > 0 && options.port <= 65535 ? options.port : 443;
    // D4 — resolve the inspector ingest token so the spawned proxy can post
    // captured AgentBridge traffic to the local-only ingest endpoint. The token
    // is shared with the OmniRoute process: getIngestTokenForBootstrap() returns
    // the same value the ingest route validates against (env or auto-generated).
    // Best-effort — if it cannot be resolved, the proxy simply skips capture.
    let ingestToken = process.env.INSPECTOR_INTERNAL_INGEST_TOKEN || "";
    if (!ingestToken) {
        try {
            const ingestMod = await __turbopack_context__.A("[project]/src/app/api/tools/traffic-inspector/internal/ingest/route.ts [app-route] (ecmascript, async loader)");
            if (typeof ingestMod.getIngestTokenForBootstrap === "function") {
                ingestToken = ingestMod.getIngestTokenForBootstrap();
            }
        } catch (err) {
            log.warn({
                err
            }, "Could not resolve inspector ingest token; capture disabled");
        }
    }
    serverProcess = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["spawn"])(process.execPath, [
        resolveMitmServerPath()
    ], {
        windowsHide: true,
        env: {
            ...process.env,
            ROUTER_API_KEY: apiKey,
            MITM_LOCAL_PORT: String(port),
            INSPECTOR_INTERNAL_INGEST_TOKEN: ingestToken,
            // #6684: tell the spawned server.cjs which cert model this run resolved
            // to (Step 1 above) so its own gate can't drift from manager.ts's
            // migration decision.
            MITM_CERT_MODE: migrationDecision === "use-root-ca" ? "root-ca" : "legacy",
            NODE_ENV: "production"
        },
        detached: false,
        stdio: [
            "ignore",
            "pipe",
            "pipe"
        ]
    });
    const proc = serverProcess;
    serverPid = proc.pid ?? null;
    // Save PID to file — best-effort, must not orphan spawned child process
    if (serverPid !== null) {
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].writeFileSync(PID_FILE, String(serverPid));
        } catch (err) {
            log.error({
                err,
                pid: serverPid
            }, "Failed to write MITM PID file (continuing)");
        }
    }
    // Buffer recent stderr so a startup failure can be reported with its real
    // cause (capped to avoid unbounded growth on a chatty/looping process). (#3606)
    let stderrBuffer = "";
    // Log server output
    proc.stdout?.on("data", (data)=>{
        log.info({
            source: "mitm-server"
        }, data.toString().trim());
    });
    proc.stderr?.on("data", (data)=>{
        const chunk = data.toString();
        stderrBuffer = (stderrBuffer + chunk).slice(-4000);
        log.error({
            source: "mitm-server"
        }, chunk.trim());
    });
    proc.on("exit", (code)=>{
        log.info({
            exitCode: code
        }, "MITM server exited");
        serverProcess = null;
        serverPid = null;
        // Remove PID file
        try {
            __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(PID_FILE);
        } catch (error) {
        // Ignore
        }
    });
    // Wait and verify server actually started
    const started = await new Promise((resolve)=>{
        let resolved = false;
        const timeout = setTimeout(()=>{
            if (!resolved) {
                resolved = true;
                resolve(true);
            }
        }, 2000);
        proc.on("exit", ()=>{
            clearTimeout(timeout);
            if (!resolved) {
                resolved = true;
                resolve(false);
            }
        });
        // Fail fast on any "❌" diagnostic line from server.cjs (covers EADDRINUSE,
        // EACCES, missing ROUTER_API_KEY, and any other server.on("error") cause).
        proc.stderr?.on("data", (data)=>{
            const msg = data.toString();
            if (msg.includes("❌")) {
                clearTimeout(timeout);
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            }
        });
    });
    if (!started) {
        throw new Error(interpretMitmStartupError(stderrBuffer, port));
    }
    return {
        running: true,
        pid: serverPid,
        certTrusted
    };
}
/**
 * Kill the MITM server process during stop — either the in-memory
 * `serverProcess` handle or, if that's gone, the PID recorded in `PID_FILE`.
 * Split out of stopMitm() purely to keep that function's complexity under
 * the repo's ratchet; behavior is unchanged from the original inline
 * implementation.
 */ async function killMitmServerProcessOnStop() {
    const proc = serverProcess;
    if (proc && !proc.killed) {
        log.info("Stopping MITM server...");
        proc.kill("SIGTERM");
        await new Promise((resolve)=>setTimeout(resolve, 1000));
        if (!proc.killed) {
            proc.kill("SIGKILL");
        }
        serverProcess = null;
        serverPid = null;
        return;
    }
    // Fallback: kill by PID file
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(PID_FILE)) {
            const savedPid = parseInt(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(PID_FILE, "utf-8").trim(), 10);
            if (savedPid && isProcessAlive(savedPid)) {
                log.info({
                    pid: savedPid
                }, "Killing MITM server by PID...");
                process.kill(savedPid, "SIGTERM");
                await new Promise((resolve)=>setTimeout(resolve, 1000));
                if (isProcessAlive(savedPid)) {
                    process.kill(savedPid, "SIGKILL");
                }
            }
        }
    } catch  {
    // Ignore
    }
    serverProcess = null;
    serverPid = null;
}
async function stopMitm(sudoPassword, _depsOverride) {
    const deps = {
        removeDNSEntry: _depsOverride?.removeDNSEntry ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeDNSEntry"],
        removeDNSEntries: _depsOverride?.removeDNSEntries ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$dns$2f$dnsConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeDNSEntries"],
        collectManagedHosts: _depsOverride?.collectManagedHosts ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$repair$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collectManagedHosts"]
    };
    // 1. Remove DNS entries FIRST — see function doc + module doc above (#1809).
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$privilegedMitmStep$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["runPrivilegedMitmStep"])(sudoPassword, "Skipping DNS teardown — no sudo password available (#7938)", ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$mitm$2f$stopDnsTeardown$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["removeStopDnsEntries"])(deps, sudoPassword));
    // 2. Kill server process (in-memory or from PID file)
    await killMitmServerProcessOnStop();
    // 3. Clean up
    clearCachedPassword(); // Clear password from memory when proxy stops
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].unlinkSync(PID_FILE);
    } catch (error) {
    // Ignore
    }
    return {
        running: false,
        pid: null
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/mitm/inspector/types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "InterceptedRequestSchema",
    ()=>InterceptedRequestSchema
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__ = __turbopack_context__.i("[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const InterceptedRequestSchema = __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid(),
    source: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "agent-bridge",
        "custom-host",
        "http-proxy",
        "system-proxy",
        "tproxy"
    ]),
    agent: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    timestamp: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().datetime(),
    method: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    host: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    path: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(),
    requestHeaders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    requestBody: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
    requestSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    responseHeaders: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].record(__TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string(), __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string()),
    responseBody: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable(),
    responseSize: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative(),
    status: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].union([
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int(),
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal("in-flight"),
        __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].literal("error")
    ]),
    proxyLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    upstreamLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    totalLatencyMs: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().nonnegative().optional(),
    error: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    sourceModel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable().optional(),
    mappedModel: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().nullable().optional(),
    detectedKind: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].enum([
        "llm",
        "app",
        "unknown"
    ]).optional(),
    contextKey: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    annotation: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    sessionId: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().uuid().optional(),
    note: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional(),
    pid: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].number().int().nonnegative().optional(),
    processName: __TURBOPACK__imported__module__$5b$externals$5d2f$zod__$5b$external$5d$__$28$zod$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$zod$29$__["z"].string().optional()
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=src_mitm_10iujy0._.js.map
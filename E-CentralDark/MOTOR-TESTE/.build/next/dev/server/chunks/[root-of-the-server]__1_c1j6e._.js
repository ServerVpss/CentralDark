module.exports = [
"[externals]/node:child_process [external] (node:child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:child_process", () => require("node:child_process"));

module.exports = mod;
}),
"[project]/src/mitm/inspector/systemProxyConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__setExec",
    ()=>__setExec,
    "apply",
    ()=>apply,
    "revert",
    ()=>revert
]);
/**
 * System-wide proxy configuration toggles.
 *
 * macOS:    `networksetup -setwebproxy / -setsecurewebproxy`
 * Linux:    `gsettings set org.gnome.system.proxy.<scheme> host/port` + mode
 * Windows:  `netsh winhttp set proxy <host:port>`
 *
 * Hard Rule #13: every shell invocation here uses `execFile` with an array of
 * arguments (never a shell string), so runtime values cannot be interpreted
 * as shell syntax.
 *
 * The returned `previousState` is JSON-serialisable so callers can persist it
 * (DB row) and pass it back to `revert()` later — including across process
 * restarts (the operator-facing "Restore system proxy" button).
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
;
;
;
let execImpl = defaultExec;
function defaultExec(file, args, options = {}) {
    return new Promise((resolve, reject)=>{
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__["execFile"])(file, args, {
            windowsHide: true,
            ...options
        }, (err, stdout, stderr)=>{
            if (err) {
                reject(err);
                return;
            }
            resolve({
                stdout: stdout?.toString() ?? "",
                stderr: stderr?.toString() ?? ""
            });
        });
    });
}
function __setExec(fn) {
    const prev = execImpl;
    execImpl = fn;
    return ()=>{
        execImpl = prev;
    };
}
function detectPlatform() {
    const p = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["default"].platform();
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time truthy", 1) return "windows";
    //TURBOPACK unreachable
    ;
}
// ────────────────────────────────────────────────────────────────────────────
// macOS — networksetup
// ────────────────────────────────────────────────────────────────────────────
const MAC_DEFAULT_SERVICE = "Wi-Fi";
function parseNetworksetupGet(output) {
    // Example output:
    //   Enabled: Yes
    //   Server: 192.168.1.1
    //   Port: 3128
    //   Authenticated Proxy Enabled: 0
    const lines = output.split(/\r?\n/);
    let enabled = false;
    let host = "";
    let port = "";
    for (const line of lines){
        const m = line.match(/^(\S[^:]*):\s*(.*)$/);
        if (!m) continue;
        const key = m[1].trim().toLowerCase();
        const val = m[2].trim();
        if (key === "enabled") enabled = /yes/i.test(val);
        else if (key === "server") host = val;
        else if (key === "port") port = val;
    }
    return {
        enabled,
        host,
        port
    };
}
async function macosApply(port) {
    const service = MAC_DEFAULT_SERVICE;
    const httpGet = await execImpl("networksetup", [
        "-getwebproxy",
        service
    ]);
    const httpsGet = await execImpl("networksetup", [
        "-getsecurewebproxy",
        service
    ]);
    const previousState = {
        platform: "macos",
        service,
        http: parseNetworksetupGet(httpGet.stdout),
        https: parseNetworksetupGet(httpsGet.stdout)
    };
    await execImpl("networksetup", [
        "-setwebproxy",
        service,
        "127.0.0.1",
        String(port)
    ]);
    await execImpl("networksetup", [
        "-setsecurewebproxy",
        service,
        "127.0.0.1",
        String(port)
    ]);
    return previousState;
}
async function macosRevert(state) {
    const service = state.service;
    if (state.http.enabled && state.http.host && state.http.port) {
        await execImpl("networksetup", [
            "-setwebproxy",
            service,
            state.http.host,
            state.http.port
        ]);
    } else {
        await execImpl("networksetup", [
            "-setwebproxystate",
            service,
            "off"
        ]);
    }
    if (state.https.enabled && state.https.host && state.https.port) {
        await execImpl("networksetup", [
            "-setsecurewebproxy",
            service,
            state.https.host,
            state.https.port
        ]);
    } else {
        await execImpl("networksetup", [
            "-setsecurewebproxystate",
            service,
            "off"
        ]);
    }
}
// ────────────────────────────────────────────────────────────────────────────
// Linux — gsettings (GNOME); systems without gsettings are unsupported here.
// ────────────────────────────────────────────────────────────────────────────
async function readGsetting(key) {
    try {
        const { stdout } = await execImpl("gsettings", [
            "get",
            "org.gnome.system.proxy",
            key
        ]);
        return stdout.trim();
    } catch  {
        return "";
    }
}
async function readGsubsetting(scheme, key) {
    try {
        // HR#13: concat (not template) — scheme is a hardcoded "http"|"https" constant.
        const { stdout } = await execImpl("gsettings", [
            "get",
            "org.gnome.system.proxy." + scheme,
            key
        ]);
        return stdout.trim();
    } catch  {
        return "";
    }
}
async function linuxApply(port) {
    const previousState = {
        platform: "linux",
        gnomeMode: await readGsetting("mode"),
        httpHost: await readGsubsetting("http", "host"),
        httpPort: await readGsubsetting("http", "port"),
        httpsHost: await readGsubsetting("https", "host"),
        httpsPort: await readGsubsetting("https", "port")
    };
    const portStr = String(port);
    await execImpl("gsettings", [
        "set",
        "org.gnome.system.proxy",
        "mode",
        "manual"
    ]);
    await execImpl("gsettings", [
        "set",
        "org.gnome.system.proxy.http",
        "host",
        "127.0.0.1"
    ]);
    await execImpl("gsettings", [
        "set",
        "org.gnome.system.proxy.http",
        "port",
        portStr
    ]);
    await execImpl("gsettings", [
        "set",
        "org.gnome.system.proxy.https",
        "host",
        "127.0.0.1"
    ]);
    await execImpl("gsettings", [
        "set",
        "org.gnome.system.proxy.https",
        "port",
        portStr
    ]);
    return previousState;
}
async function linuxRevert(state) {
    const mode = state.gnomeMode || "'none'";
    await execImpl("gsettings", [
        "set",
        "org.gnome.system.proxy",
        "mode",
        mode
    ]);
    if (state.httpHost) {
        await execImpl("gsettings", [
            "set",
            "org.gnome.system.proxy.http",
            "host",
            state.httpHost
        ]);
    }
    if (state.httpPort) {
        await execImpl("gsettings", [
            "set",
            "org.gnome.system.proxy.http",
            "port",
            state.httpPort
        ]);
    }
    if (state.httpsHost) {
        await execImpl("gsettings", [
            "set",
            "org.gnome.system.proxy.https",
            "host",
            state.httpsHost
        ]);
    }
    if (state.httpsPort) {
        await execImpl("gsettings", [
            "set",
            "org.gnome.system.proxy.https",
            "port",
            state.httpsPort
        ]);
    }
}
// ────────────────────────────────────────────────────────────────────────────
// Windows — netsh winhttp
// ────────────────────────────────────────────────────────────────────────────
async function windowsApply(port) {
    const showRes = await execImpl("netsh", [
        "winhttp",
        "show",
        "proxy"
    ]);
    const previousState = {
        platform: "windows",
        netshOutput: showRes.stdout
    };
    // HR#13: concat (not template) — port is Zod-validated number (z.number().int().positive().max(65535)).
    const proxyArg = "127.0.0.1:" + String(port);
    await execImpl("netsh", [
        "winhttp",
        "set",
        "proxy",
        proxyArg
    ]);
    return previousState;
}
async function windowsRevert(_state) {
    // netsh has no idempotent restore; the safe default is "reset".
    // The previousState is preserved so the UI can show the operator what was
    // configured before, but actual reapply of obscure netsh state is out of
    // scope.
    await execImpl("netsh", [
        "winhttp",
        "reset",
        "proxy"
    ]);
}
async function apply(port) {
    const platform = detectPlatform();
    try {
        let previousState;
        if (platform === "macos") previousState = await macosApply(port);
        else if (platform === "windows") previousState = await windowsApply(port);
        else previousState = await linuxApply(port);
        return {
            platform,
            previousState
        };
    } catch (err) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "system proxy apply failed");
    }
}
async function revert(previousState) {
    if (!previousState || typeof previousState !== "object") return;
    const state = previousState;
    const platform = state.platform;
    try {
        if (platform === "macos") await macosRevert(state);
        else if (platform === "linux") await linuxRevert(state);
        else if (platform === "windows") await windowsRevert(state);
    } catch (err) {
        throw new Error((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "system proxy revert failed");
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1_c1j6e._.js.map
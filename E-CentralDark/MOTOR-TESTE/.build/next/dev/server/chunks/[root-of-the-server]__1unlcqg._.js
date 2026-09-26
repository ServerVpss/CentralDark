module.exports = [
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/src/shared/utils/machineId.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConsistentMachineId",
    ()=>getConsistentMachineId,
    "getRawMachineId",
    ()=>getRawMachineId,
    "isBrowser",
    ()=>isBrowser,
    "resetMachineIdCache",
    ()=>resetMachineIdCache
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
;
;
;
/**
 * Module-level cache: on Windows, execSync("hostname") spawns
 * cmd.exe which is expensive.  Cache the result after first call
 * since the machine ID never changes at runtime.
 */ let cachedRawId = null;
function resetMachineIdCache() {
    cachedRawId = null;
}
/**
 * Get raw machine ID using OS-specific methods.
 *
 * We use try/catch waterfall: try each OS method and fall through
 * to the next on failure. Platform checks are INSIDE try blocks so they
 * run at RUNTIME (not build time), avoiding Next.js SWC dead-code elimination.
 *
 * On Linux: skips Windows (REG.exe) and macOS (ioreg) strategies entirely.
 */ function getMachineIdRaw() {
    // Return cached result immediately (machine identity is stable at runtime)
    if (cachedRawId !== null) return cachedRawId;
    // Strategy 1: Windows — REG.exe query for MachineGuid
    try {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const sysRoot = process.env.SystemRoot || process.env.windir || "C:\\Windows";
        const regPath = `${sysRoot}\\System32\\REG.exe`;
        if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(/* turbopackIgnore: true */ regPath)) {
            const output = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execFileSync"])(regPath, [
                "QUERY",
                "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography",
                "/v",
                "MachineGuid"
            ], {
                encoding: "utf8",
                timeout: 5000
            });
            const id = output.split("REG_SZ")[1]?.replace(/\r+|\n+|\s+/gi, "")?.toLowerCase();
            if (id && id.length > 8) {
                cachedRawId = id;
                return id;
            }
        }
    } catch  {
    // Not Windows or REG.exe failed — continue
    }
    // Strategy 2: macOS — ioreg IOPlatformUUID
    try {
        if ("TURBOPACK compile-time truthy", 1) {
            throw new Error("Not macOS");
        }
        const output = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])("ioreg -rd1 -c IOPlatformExpertDevice", {
            encoding: "utf8",
            timeout: 5000
        });
        if (output.includes("IOPlatformUUID")) {
            const id = output.split("IOPlatformUUID")[1]?.split("\n")[0]?.replace(/=|\s+|"/gi, "")?.toLowerCase();
            if (id && id.length > 8) {
                cachedRawId = id;
                return id;
            }
        }
    } catch  {
    // Not macOS or ioreg not available — continue
    }
    // Strategy 3: Linux — read machine-id files directly (no `head` or pipe)
    try {
        for (const filePath of [
            "/etc/machine-id",
            "/var/lib/dbus/machine-id"
        ]){
            try {
                const content = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(/* turbopackIgnore: true */ filePath, "utf8").trim().toLowerCase();
                if (content.length > 8) {
                    cachedRawId = content;
                    return content;
                }
            } catch  {
            // Try the next candidate file
            }
        }
    } catch  {
    // Files not readable — continue
    }
    // Strategy 4: Node.js os.hostname() — no child process, works everywhere
    try {
        const hostname = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].hostname().toLowerCase();
        if (hostname) {
            cachedRawId = hostname;
            return hostname;
        }
    } catch  {
    // os.hostname() not available — continue
    }
    // Strategy 5: execSync("hostname") shell fallback (for constrained environments)
    try {
        const hostname = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["execSync"])("hostname", {
            encoding: "utf8",
            timeout: 5000
        });
        const id = hostname.trim().toLowerCase();
        if (id) {
            cachedRawId = id;
            return id;
        }
    } catch  {
    // hostname failed — continue
    }
    cachedRawId = "unknown-machine";
    return "unknown-machine";
}
async function getRandomMachineFallbackId() {
    try {
        const cryptoFallback = await __turbopack_context__.A("[externals]/crypto [external] (crypto, cjs, async loader)");
        return cryptoFallback.randomUUID();
    } catch  {
        if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.randomUUID) {
            return globalThis.crypto.randomUUID();
        }
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            let r = 0;
            if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.getRandomValues) {
                const arr = new Uint8Array(1);
                globalThis.crypto.getRandomValues(arr);
                r = arr[0] % 16;
            } else {
                r = Date.now() % 16 | 0;
            }
            const v = c === "x" ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    }
}
async function getConsistentMachineId(salt = null) {
    const saltValue = salt || process.env.MACHINE_ID_SALT || "endpoint-proxy-salt";
    try {
        const rawMachineId = getMachineIdRaw();
        // Create consistent ID using salt
        const crypto = await __turbopack_context__.A("[externals]/crypto [external] (crypto, cjs, async loader)");
        const hashedMachineId = crypto.createHash("sha256").update(rawMachineId + saltValue).digest("hex");
        // Return only first 16 characters for brevity
        return hashedMachineId.substring(0, 16);
    } catch (error) {
        console.log("Error getting machine ID:", error);
        // Fallback to random ID if node-machine-id fails
        return getRandomMachineFallbackId();
    }
}
async function getRawMachineId() {
    try {
        return getMachineIdRaw();
    } catch (error) {
        console.log("Error getting raw machine ID:", error);
        // Fallback to random ID if node-machine-id fails
        return getRandomMachineFallbackId();
    }
}
function isBrowser() {
    return ("TURBOPACK compile-time value", "undefined") !== "undefined";
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1unlcqg._.js.map
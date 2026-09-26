module.exports = [
"[project]/src/mitm/inspector/processAttribution.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "attributeProcess",
    ()=>attributeProcess,
    "parseProcNetTcpForInode",
    ()=>parseProcNetTcpForInode
]);
/**
 * Process attribution for the Traffic Inspector (Linux).
 *
 * Maps an inbound connection's *client* ephemeral port to the owning PID +
 * process name by reading /proc/net/tcp{,6} (port → socket inode) then scanning
 * /proc/<pid>/fd for a symlink to socket:[inode]. A short TTL cache mirrors
 * ProxyBridge's 1s PID cache to bound the cost of the procfs scan under load.
 *
 * Non-Linux platforms return null (stub) — macOS/Windows would need
 * lsof/GetExtendedTcpTable and are a follow-up. Attribution is always
 * best-effort: any failure resolves to null and never blocks capture. (Gap 1.)
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
;
const IS_LINUX = process.platform === "linux";
const CACHE_TTL_MS = 1000;
const cache = new Map();
function parseProcNetTcpForInode(content, localPort) {
    const lines = content.split("\n");
    for(let i = 1; i < lines.length; i++){
        const cols = lines[i].trim().split(/\s+/);
        if (cols.length < 10) continue;
        const portHex = cols[1]?.split(":")[1];
        if (!portHex) continue;
        const port = parseInt(portHex, 16);
        if (Number.isNaN(port)) continue;
        if (port === localPort) return cols[9];
    }
    return null;
}
function attributeProcess(localPort) {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const now = undefined;
    const hit = undefined;
    let result;
}
function findInode(localPort) {
    for (const f of [
        "/proc/net/tcp",
        "/proc/net/tcp6"
    ]){
        try {
            const inode = parseProcNetTcpForInode(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(f, "utf8"), localPort);
            if (inode && inode !== "0") return inode;
        } catch  {
        // file may not exist (e.g. no tcp6) — continue
        }
    }
    return null;
}
function findPidByInode(inode) {
    const target = `socket:[${inode}]`;
    let pids;
    try {
        pids = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync("/proc").filter((d)=>/^\d+$/.test(d));
    } catch  {
        return null;
    }
    for (const pid of pids){
        try {
            const fds = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(`/proc/${pid}/fd`);
            for (const fd of fds){
                try {
                    if (__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readlinkSync(`/proc/${pid}/fd/${fd}`) === target) return Number(pid);
                } catch  {
                // fd vanished mid-scan — skip
                }
            }
        } catch  {
        // process vanished or not readable — skip
        }
    }
    return null;
}
function readProcessName(pid) {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(`/proc/${pid}/comm`, "utf8").trim() || "unknown";
    } catch  {
        return "unknown";
    }
}
}),
];

//# sourceMappingURL=src_mitm_inspector_processAttribution_ts_1jg3chm._.js.map
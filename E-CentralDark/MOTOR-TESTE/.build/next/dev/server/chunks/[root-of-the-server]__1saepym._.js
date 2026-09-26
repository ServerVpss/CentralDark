module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/a2a/taskManager.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "A2ATaskManager",
    ()=>A2ATaskManager,
    "getTaskManager",
    ()=>getTaskManager
]);
/**
 * A2A Task Manager — Full lifecycle management for A2A tasks.
 *
 * State machine: submitted → working → completed | failed | cancelled
 *
 * Features:
 *   - UUID v4 task IDs
 *   - In-memory storage with optional SQLite persistence
 *   - Event logging for each state transition
 *   - TTL with configurable expiration (default 5 min)
 *   - Concurrent task limit
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
// ============ Valid Transitions ============
const VALID_TRANSITIONS = {
    submitted: [
        "working",
        "failed",
        "cancelled"
    ],
    working: [
        "completed",
        "failed",
        "cancelled"
    ],
    completed: [],
    failed: [],
    cancelled: []
};
class A2ATaskManager {
    tasks = new Map();
    ttlMs;
    cleanupInterval;
    activeStreams = 0;
    constructor(ttlMinutes = 5){
        this.ttlMs = ttlMinutes * 60 * 1000;
        this.cleanupInterval = setInterval(()=>this.cleanupExpired(), 60_000);
        if (this.cleanupInterval && typeof this.cleanupInterval === "object" && "unref" in this.cleanupInterval) {
            this.cleanupInterval.unref?.();
        }
    }
    createTask(input) {
        const now = new Date();
        const task = {
            id: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])(),
            skill: input.skill,
            state: "submitted",
            input,
            artifacts: [],
            events: [
                {
                    timestamp: now.toISOString(),
                    state: "submitted"
                }
            ],
            metadata: input.metadata || {},
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            expiresAt: new Date(now.getTime() + this.ttlMs).toISOString()
        };
        this.tasks.set(task.id, task);
        return task;
    }
    getTask(taskId) {
        const task = this.tasks.get(taskId);
        if (task && new Date(task.expiresAt) < new Date()) {
            if (task.state === "submitted" || task.state === "working") {
                this.updateTask(taskId, "failed", undefined, "Task expired");
            }
        }
        return this.tasks.get(taskId);
    }
    updateTask(taskId, state, artifacts, message) {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error(`Task ${taskId} not found`);
        const valid = VALID_TRANSITIONS[task.state];
        if (!valid.includes(state)) {
            throw new Error(`Invalid transition: ${task.state} → ${state}`);
        }
        const now = new Date().toISOString();
        task.state = state;
        task.updatedAt = now;
        task.events.push({
            timestamp: now,
            state,
            message
        });
        if (artifacts) task.artifacts.push(...artifacts);
        return task;
    }
    cancelTask(taskId) {
        return this.updateTask(taskId, "cancelled", undefined, "Cancelled by client");
    }
    countTasks(filter) {
        let tasks = [
            ...this.tasks.values()
        ];
        if (filter?.state) tasks = tasks.filter((t)=>t.state === filter.state);
        if (filter?.skill) tasks = tasks.filter((t)=>t.skill === filter.skill);
        return tasks.length;
    }
    listTasks(filter) {
        let tasks = [
            ...this.tasks.values()
        ];
        if (filter?.state) tasks = tasks.filter((t)=>t.state === filter.state);
        if (filter?.skill) tasks = tasks.filter((t)=>t.skill === filter.skill);
        tasks.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const offset = Math.max(0, filter?.offset || 0);
        const limit = typeof filter?.limit === "number" && Number.isFinite(filter.limit) ? Math.max(1, Math.floor(filter.limit)) : 50;
        return tasks.slice(offset, offset + limit);
    }
    beginStream() {
        this.activeStreams += 1;
    }
    endStream() {
        this.activeStreams = Math.max(0, this.activeStreams - 1);
    }
    getStats() {
        const counts = {
            submitted: 0,
            working: 0,
            completed: 0,
            failed: 0,
            cancelled: 0
        };
        let lastTaskAt = null;
        for (const task of this.tasks.values()){
            counts[task.state] += 1;
            const updatedAt = new Date(task.updatedAt).getTime();
            if (!Number.isFinite(updatedAt)) continue;
            if (!lastTaskAt || updatedAt > new Date(lastTaskAt).getTime()) {
                lastTaskAt = task.updatedAt;
            }
        }
        return {
            counts,
            total: this.tasks.size,
            activeStreams: this.activeStreams,
            lastTaskAt
        };
    }
    cleanupExpired() {
        const now = new Date();
        for (const [id, task] of this.tasks){
            if (new Date(task.expiresAt) < now && task.state !== "completed" && task.state !== "failed" && task.state !== "cancelled") {
                task.state = "failed";
                task.updatedAt = now.toISOString();
                task.events.push({
                    timestamp: now.toISOString(),
                    state: "failed",
                    message: "TTL expired"
                });
            }
            // Remove terminal tasks older than 2x TTL
            if ([
                "completed",
                "failed",
                "cancelled"
            ].includes(task.state) && now.getTime() - new Date(task.updatedAt).getTime() > this.ttlMs * 2) {
                this.tasks.delete(id);
            }
        }
    }
    destroy() {
        clearInterval(this.cleanupInterval);
    }
}
// Singleton
const globalForA2A = globalThis;
function getTaskManager() {
    if (!globalForA2A._a2aTaskManager) {
        globalForA2A._a2aTaskManager = new A2ATaskManager();
    }
    return globalForA2A._a2aTaskManager;
}
}),
"[project]/src/app/api/a2a/tasks/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$a2a$2f$taskManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/a2a/taskManager.ts [app-route] (ecmascript)");
;
;
const VALID_TASK_STATES = new Set([
    "submitted",
    "working",
    "completed",
    "failed",
    "cancelled"
]);
function parseIntParam(value, fallback) {
    if (typeof value !== "string") return fallback;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return fallback;
    return parsed;
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const stateParam = searchParams.get("state");
        const skill = searchParams.get("skill") || undefined;
        const limit = Math.max(1, Math.min(200, parseIntParam(searchParams.get("limit"), 50)));
        const offset = Math.max(0, parseIntParam(searchParams.get("offset"), 0));
        const state = typeof stateParam === "string" && VALID_TASK_STATES.has(stateParam) ? stateParam : undefined;
        const tm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$a2a$2f$taskManager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTaskManager"])();
        const total = tm.countTasks({
            state,
            skill
        });
        const tasks = tm.listTasks({
            state,
            skill,
            limit,
            offset
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            tasks,
            total,
            limit,
            offset
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to list A2A tasks";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1saepym._.js.map
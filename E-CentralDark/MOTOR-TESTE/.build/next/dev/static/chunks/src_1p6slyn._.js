(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/shared/components/Badge.tsx [app-client] (ecmascript) <export default as Badge>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-client] (ecmascript)");
}),
"[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CloudAgentsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/shared/components/index.tsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Card.tsx [app-client] (ecmascript) <export default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Button.tsx [app-client] (ecmascript) <export default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Input.tsx [app-client] (ecmascript) <export default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__ = __turbopack_context__.i("[project]/src/shared/components/Badge.tsx [app-client] (ecmascript) <export default as Badge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
// ── Constants ────────────────────────────────────────────────────────────────
const CLOUD_AGENTS = [
    {
        id: "jules",
        name: "Jules",
        provider: "Google",
        descriptionKey: "agentDescriptions.jules",
        icon: "smart_toy",
        iconBg: "bg-yellow-500/10",
        iconColor: "text-yellow-600"
    },
    {
        id: "devin",
        name: "Devin",
        provider: "Cognition",
        descriptionKey: "agentDescriptions.devin",
        icon: "psychology",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-600"
    },
    {
        id: "codex-cloud",
        name: "Codex Cloud",
        provider: "OpenAI",
        descriptionKey: "agentDescriptions.codexCloud",
        icon: "cloud",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-600"
    },
    {
        id: "cursor-cloud",
        name: "Cursor Cloud",
        provider: "Cursor",
        descriptionKey: "agentDescriptions.cursorCloud",
        icon: "cloud",
        iconBg: "bg-slate-500/10",
        iconColor: "text-slate-600"
    }
];
const STATUS_OPTIONS = [
    {
        value: "all",
        labelKey: "filterAll"
    },
    {
        value: "queued",
        labelKey: "statusPending"
    },
    {
        value: "running",
        labelKey: "statusRunning"
    },
    {
        value: "awaiting_approval",
        labelKey: "statusWaitingApproval"
    },
    {
        value: "completed",
        labelKey: "statusCompleted"
    },
    {
        value: "failed",
        labelKey: "statusFailed"
    },
    {
        value: "cancelled",
        labelKey: "statusCancelled"
    }
];
// ── Helpers ──────────────────────────────────────────────────────────────────
function getAgentInfo(providerId) {
    return CLOUD_AGENTS.find((a)=>a.id === providerId) || CLOUD_AGENTS[0];
}
function formatDuration(start, end) {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins}m ${remainSecs}s`;
}
function CloudAgentsPage() {
    _s();
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("tasks");
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"])("cloudAgents");
    // ── Tasks state ──────────────────────────────────────────────────────────
    const [tasks, setTasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [creating, setCreating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedTask, setSelectedTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [newTask, setNewTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        providerId: "jules",
        prompt: "",
        repoName: "",
        repoUrl: "",
        branch: "main",
        autoCreatePr: true
    });
    const [messageInput, setMessageInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [providerFilter, setProviderFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    // ── Agents health state ──────────────────────────────────────────────────
    const [agentHealth, setAgentHealth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // ── Settings state (localStorage) ────────────────────────────────────────
    const [settings, setSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        autoCreatePr: true,
        requireApproval: false,
        enabled: true
    });
    // ── Load settings from localStorage ──────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CloudAgentsPage.useEffect": ()=>{
            const loadSettings = setTimeout({
                "CloudAgentsPage.useEffect.loadSettings": ()=>{
                    try {
                        const stored = localStorage.getItem("omniroute-cloud-agents-settings");
                        if (stored) setSettings(JSON.parse(stored));
                    } catch  {
                    // Ignore malformed or unavailable local storage.
                    }
                }
            }["CloudAgentsPage.useEffect.loadSettings"], 0);
            return ({
                "CloudAgentsPage.useEffect": ()=>clearTimeout(loadSettings)
            })["CloudAgentsPage.useEffect"];
        }
    }["CloudAgentsPage.useEffect"], []);
    const updateSetting = (key, value)=>{
        const next = {
            ...settings,
            [key]: value
        };
        setSettings(next);
        try {
            localStorage.setItem("omniroute-cloud-agents-settings", JSON.stringify(next));
        } catch  {
        // ignore
        }
    };
    // ── Task helpers ─────────────────────────────────────────────────────────
    const upsertTask = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CloudAgentsPage.useCallback[upsertTask]": (task)=>{
            setTasks({
                "CloudAgentsPage.useCallback[upsertTask]": (prev)=>{
                    const exists = prev.some({
                        "CloudAgentsPage.useCallback[upsertTask].exists": (c)=>c.id === task.id
                    }["CloudAgentsPage.useCallback[upsertTask].exists"]);
                    return exists ? prev.map({
                        "CloudAgentsPage.useCallback[upsertTask]": (c)=>c.id === task.id ? task : c
                    }["CloudAgentsPage.useCallback[upsertTask]"]) : [
                        task,
                        ...prev
                    ];
                }
            }["CloudAgentsPage.useCallback[upsertTask]"]);
            setSelectedTask({
                "CloudAgentsPage.useCallback[upsertTask]": (current)=>current?.id === task.id ? task : current
            }["CloudAgentsPage.useCallback[upsertTask]"]);
        }
    }["CloudAgentsPage.useCallback[upsertTask]"], []);
    const fetchTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CloudAgentsPage.useCallback[fetchTasks]": async ()=>{
            try {
                const res = await fetch("/api/v1/agents/tasks");
                if (res.ok) {
                    const data = await res.json();
                    setTasks(Array.isArray(data.data) ? data.data : []);
                }
            } catch (err) {
                console.error("Failed to fetch tasks:", err);
            } finally{
                setLoading(false);
            }
        }
    }["CloudAgentsPage.useCallback[fetchTasks]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CloudAgentsPage.useEffect": ()=>{
            const initialFetch = setTimeout({
                "CloudAgentsPage.useEffect.initialFetch": ()=>void fetchTasks()
            }["CloudAgentsPage.useEffect.initialFetch"], 0);
            return ({
                "CloudAgentsPage.useEffect": ()=>clearTimeout(initialFetch)
            })["CloudAgentsPage.useEffect"];
        }
    }["CloudAgentsPage.useEffect"], [
        fetchTasks
    ]);
    // ── Auto-poll when tasks are running/queued ──────────────────────────────
    const hasActiveTasks = tasks.some((t)=>t.status === "running" || t.status === "queued");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CloudAgentsPage.useEffect": ()=>{
            if (!hasActiveTasks) return;
            const id = setInterval({
                "CloudAgentsPage.useEffect.id": ()=>{
                    fetchTasks();
                }
            }["CloudAgentsPage.useEffect.id"], 5000);
            return ({
                "CloudAgentsPage.useEffect": ()=>clearInterval(id)
            })["CloudAgentsPage.useEffect"];
        }
    }["CloudAgentsPage.useEffect"], [
        hasActiveTasks,
        fetchTasks
    ]);
    // ── Fetch agent health ───────────────────────────────────────────────────
    const fetchAgentHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CloudAgentsPage.useCallback[fetchAgentHealth]": async ()=>{
            try {
                const res = await fetch("/api/v1/agents/health");
                if (res.ok) {
                    const data = await res.json();
                    if (data.data) setAgentHealth(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch agent health:", err);
            }
        }
    }["CloudAgentsPage.useCallback[fetchAgentHealth]"], []);
    // ── Tab mount effects ────────────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CloudAgentsPage.useEffect": ()=>{
            if (activeTab !== "agents") return;
            const healthFetch = setTimeout({
                "CloudAgentsPage.useEffect.healthFetch": ()=>void fetchAgentHealth()
            }["CloudAgentsPage.useEffect.healthFetch"], 0);
            return ({
                "CloudAgentsPage.useEffect": ()=>clearTimeout(healthFetch)
            })["CloudAgentsPage.useEffect"];
        }
    }["CloudAgentsPage.useEffect"], [
        activeTab,
        fetchAgentHealth
    ]);
    // ── Filtered tasks ───────────────────────────────────────────────────────
    const filteredTasks = tasks.filter((task)=>{
        if (statusFilter !== "all" && task.status !== statusFilter) return false;
        if (providerFilter !== "all" && task.providerId !== providerFilter) return false;
        return true;
    });
    // ── Task actions (preserved from original) ───────────────────────────────
    const handleCreateTask = async (e)=>{
        e.preventDefault();
        setCreating(true);
        try {
            const source = {
                repoName: newTask.repoName.trim(),
                repoUrl: newTask.repoUrl.trim(),
                ...newTask.branch.trim() ? {
                    branch: newTask.branch.trim()
                } : {}
            };
            const res = await fetch("/api/v1/agents/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    providerId: newTask.providerId,
                    prompt: newTask.prompt,
                    source,
                    options: {
                        autoCreatePr: newTask.autoCreatePr
                    }
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data) upsertTask(data.data);
                setNewTask({
                    providerId: "jules",
                    prompt: "",
                    repoName: "",
                    repoUrl: "",
                    branch: "main",
                    autoCreatePr: true
                });
            }
        } catch (err) {
            console.error("Failed to create task:", err);
        } finally{
            setCreating(false);
        }
    };
    const handleSendMessage = async ()=>{
        if (!selectedTask || !messageInput.trim()) return;
        try {
            const res = await fetch(`/api/v1/agents/tasks/${selectedTask.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "message",
                    message: messageInput
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data) upsertTask(data.data);
                setMessageInput("");
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };
    const handleApprovePlan = async ()=>{
        if (!selectedTask) return;
        try {
            const res = await fetch(`/api/v1/agents/tasks/${selectedTask.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "approve"
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data) upsertTask(data.data);
            }
        } catch (err) {
            console.error("Failed to approve plan:", err);
        }
    };
    const handleCancelTask = async (taskId)=>{
        try {
            const res = await fetch(`/api/v1/agents/tasks/${taskId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "cancel"
                })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data) upsertTask(data.data);
            }
        } catch (err) {
            console.error("Failed to cancel task:", err);
        }
    };
    const handleDeleteTask = async (taskId)=>{
        try {
            const res = await fetch(`/api/v1/agents/tasks/${taskId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setTasks((prev)=>prev.filter((t)=>t.id !== taskId));
                if (selectedTask?.id === taskId) setSelectedTask(null);
            }
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };
    // ── Render helpers ───────────────────────────────────────────────────────
    const getStatusBadge = (status)=>{
        const statusMap = {
            queued: {
                variant: "default",
                label: t("statusPending")
            },
            running: {
                variant: "info",
                label: t("statusRunning")
            },
            awaiting_approval: {
                variant: "warning",
                label: t("statusWaitingApproval")
            },
            completed: {
                variant: "success",
                label: t("statusCompleted")
            },
            failed: {
                variant: "error",
                label: t("statusFailed")
            },
            cancelled: {
                variant: "default",
                label: t("statusCancelled")
            }
        };
        const s = statusMap[status] || statusMap.queued;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Badge$3e$__["Badge"], {
            variant: s.variant,
            dot: status === "running",
            children: s.label
        }, void 0, false, {
            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
            lineNumber: 354,
            columnNumber: 7
        }, this);
    };
    const getPlanText = (task)=>{
        return task.activities.find((a)=>a.type === "plan")?.content || "";
    };
    const formatResult = (result)=>{
        if (!result) return "";
        if (typeof result === "string") return result;
        return JSON.stringify(result, null, 2);
    };
    // ── Tab definitions ──────────────────────────────────────────────────────
    const tabs = [
        {
            id: "tasks",
            label: t("tasksTab") || "Tasks",
            icon: "task_alt"
        },
        {
            id: "agents",
            label: t("agentsTab") || "Agents",
            icon: "smart_toy"
        },
        {
            id: "settings",
            label: t("settingsTab") || "Settings",
            icon: "tune"
        }
    ];
    // ── Loading state ────────────────────────────────────────────────────────
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center justify-center min-h-[400px] gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                    lineNumber: 383,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-text-muted",
                    children: t("loading")
                }, void 0, false, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                    lineNumber: 384,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
            lineNumber: 382,
            columnNumber: 7
        }, this);
    }
    // ── Main render ──────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                className: "border-purple-500/20 bg-purple-500/5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-4 flex-wrap",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-sm font-semibold text-text-main",
                                    children: t("aboutTitle")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 397,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted mt-1",
                                    children: t("aboutDescription")
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 398,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                            lineNumber: 396,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `inline-block h-2 w-2 rounded-full ${settings.enabled ? "bg-emerald-500" : "bg-zinc-400"}`
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 401,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-text-muted",
                                    children: settings.enabled ? t("agentsEnabled") || "Enabled" : t("agentsDisabled") || "Disabled"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 404,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                            lineNumber: 400,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                    lineNumber: 395,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                lineNumber: 394,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2 border-b border-border",
                children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab(tab.id),
                        className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === tab.id ? "border-purple-500 text-purple-500" : "border-transparent text-text-muted hover:text-text-main"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "material-symbols-outlined text-[16px]",
                                children: tab.icon
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                lineNumber: 425,
                                columnNumber: 13
                            }, this),
                            tab.label
                        ]
                    }, tab.id, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                        lineNumber: 416,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                lineNumber: 414,
                columnNumber: 7
            }, this),
            activeTab === "tasks" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-lg bg-purple-500/10 text-purple-500",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[20px]",
                                            children: "add_task"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 438,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 437,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold",
                                                children: t("newTaskTitle")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                lineNumber: 441,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-text-muted",
                                                children: t("newTaskDescription")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                lineNumber: 442,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 440,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                lineNumber: 436,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                onSubmit: handleCreateTask,
                                className: "flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "text-xs font-medium text-text-muted mb-1.5 block",
                                                    children: t("selectAgent")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 448,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: newTask.providerId,
                                                    onChange: (e)=>setNewTask({
                                                            ...newTask,
                                                            providerId: e.target.value
                                                        }),
                                                    className: "w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                                                    children: CLOUD_AGENTS.map((agent)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: agent.id,
                                                            children: [
                                                                agent.name,
                                                                " (",
                                                                agent.provider,
                                                                ")"
                                                            ]
                                                        }, agent.id, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 457,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 451,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 447,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 446,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-xs font-medium text-text-muted mb-1.5 block",
                                                children: t("taskDescription")
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                lineNumber: 465,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                placeholder: t("taskDescriptionPlaceholder"),
                                                value: newTask.prompt,
                                                onChange: (e)=>setNewTask({
                                                        ...newTask,
                                                        prompt: e.target.value
                                                    }),
                                                className: "min-h-24 w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                lineNumber: 468,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 464,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                                label: t("repositoryName"),
                                                placeholder: "omniroute",
                                                value: newTask.repoName,
                                                onChange: (e)=>setNewTask({
                                                        ...newTask,
                                                        repoName: e.target.value
                                                    }),
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                lineNumber: 477,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                                label: t("repositoryUrl"),
                                                placeholder: "https://github.com/owner/repo",
                                                value: newTask.repoUrl,
                                                onChange: (e)=>setNewTask({
                                                        ...newTask,
                                                        repoUrl: e.target.value
                                                    }),
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                lineNumber: 484,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 476,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                                label: t("branch"),
                                                placeholder: "main",
                                                value: newTask.branch,
                                                onChange: (e)=>setNewTask({
                                                        ...newTask,
                                                        branch: e.target.value
                                                    })
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                lineNumber: 493,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-sm text-text-muted pt-7",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: newTask.autoCreatePr,
                                                        onChange: (e)=>setNewTask({
                                                                ...newTask,
                                                                autoCreatePr: e.target.checked
                                                            }),
                                                        className: "h-4 w-4 rounded border-border/60"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                        lineNumber: 500,
                                                        columnNumber: 19
                                                    }, this),
                                                    t("settingAutoPR")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                lineNumber: 499,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 492,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-end",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                            type: "submit",
                                            variant: "primary",
                                            loading: creating,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[16px] mr-1",
                                                    children: "rocket_launch"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 19
                                                }, this),
                                                t("startTask")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 510,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 509,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                lineNumber: 445,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                        lineNumber: 435,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: statusFilter,
                                onChange: (e)=>setStatusFilter(e.target.value),
                                className: "rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                                children: STATUS_OPTIONS.map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: opt.value,
                                        children: t(opt.labelKey) || opt.value
                                    }, opt.value, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 526,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                lineNumber: 520,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: providerFilter,
                                onChange: (e)=>setProviderFilter(e.target.value),
                                className: "rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "all",
                                        children: t("filterAllProviders") || "All Providers"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 536,
                                        columnNumber: 15
                                    }, this),
                                    CLOUD_AGENTS.map((agent)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: agent.id,
                                            children: agent.name
                                        }, agent.id, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 538,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                lineNumber: 531,
                                columnNumber: 13
                            }, this),
                            hasActiveTasks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1.5 text-xs text-blue-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "animate-pulse",
                                        children: "●"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 545,
                                        columnNumber: 17
                                    }, this),
                                    t("autoRefreshing") || "Auto-refreshing"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                lineNumber: 544,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                        lineNumber: 519,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-3",
                                children: filteredTasks.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12 text-text-muted border border-dashed border-border/50 rounded-lg",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[48px] mb-2 block text-text-muted/50",
                                            children: "assignment"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 556,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium",
                                            children: t("noTasksTitle") || "No tasks yet"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 559,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs mt-1",
                                            children: t("noTasksDesc") || "Create your first task to get started."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 560,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 555,
                                    columnNumber: 17
                                }, this) : filteredTasks.map((task)=>{
                                    const agent = getAgentInfo(task.providerId);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                                        padding: "sm",
                                        hover: true,
                                        className: `transition-all ${selectedTask?.id === task.id ? "!border-purple-500 ring-1 ring-purple-500/20" : ""}`,
                                        onClick: ()=>setSelectedTask(task),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `p-1.5 rounded-lg ${agent.iconBg} ${agent.iconColor}`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "material-symbols-outlined text-[16px]",
                                                                children: agent.icon
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                                lineNumber: 582,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 581,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm font-medium text-text-main line-clamp-1",
                                                                    children: task.prompt || t("untitledTask")
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                                    lineNumber: 587,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-text-muted",
                                                                    children: [
                                                                        agent.name,
                                                                        " · ",
                                                                        new Date(task.createdAt).toLocaleString(locale)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                                    lineNumber: 590,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 586,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 580,
                                                    columnNumber: 25
                                                }, this),
                                                getStatusBadge(task.status)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 579,
                                            columnNumber: 23
                                        }, this)
                                    }, task.id, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 568,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                lineNumber: 553,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-3",
                                children: selectedTask ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                                    className: "flex flex-col gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `p-1.5 rounded-lg ${getAgentInfo(selectedTask.providerId).iconBg} ${getAgentInfo(selectedTask.providerId).iconColor}`,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "material-symbols-outlined text-[16px]",
                                                                children: getAgentInfo(selectedTask.providerId).icon
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                                lineNumber: 612,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 609,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "font-medium",
                                                                    children: getAgentInfo(selectedTask.providerId).name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                                    lineNumber: 617,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs text-text-muted",
                                                                    children: [
                                                                        t("created"),
                                                                        ": ",
                                                                        new Date(selectedTask.createdAt).toLocaleString(locale)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                                    lineNumber: 618,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 616,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 608,
                                                    columnNumber: 21
                                                }, this),
                                                getStatusBadge(selectedTask.status)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 607,
                                            columnNumber: 19
                                        }, this),
                                        selectedTask.status === "completed" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-1.5 text-xs text-text-muted",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "material-symbols-outlined text-[14px]",
                                                    children: "timer"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 629,
                                                    columnNumber: 23
                                                }, this),
                                                formatDuration(selectedTask.createdAt, selectedTask.updatedAt)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 628,
                                            columnNumber: 21
                                        }, this),
                                        selectedTask.status === "awaiting_approval" && getPlanText(selectedTask) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-amber-500/20 bg-amber-500/5 p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 mb-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[16px] text-amber-600",
                                                            children: "description"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 638,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-amber-700 dark:text-amber-400",
                                                            children: t("planReady")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 641,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 637,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                    className: "text-xs text-text-muted whitespace-pre-wrap bg-black/5 dark:bg-white/5 rounded p-2 max-h-32 overflow-auto",
                                                    children: getPlanText(selectedTask)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 645,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-2 mt-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                            variant: "primary",
                                                            size: "sm",
                                                            onClick: handleApprovePlan,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "material-symbols-outlined text-[14px] mr-1",
                                                                    children: "check"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                                    lineNumber: 650,
                                                                    columnNumber: 27
                                                                }, this),
                                                                t("approvePlan")
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 649,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                            variant: "secondary",
                                                            size: "sm",
                                                            onClick: ()=>handleCancelTask(selectedTask.id),
                                                            children: t("rejectPlan")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 653,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 648,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 636,
                                            columnNumber: 21
                                        }, this),
                                        selectedTask.activities.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium",
                                                    children: t("conversation")
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 667,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col gap-2 max-h-64 overflow-auto",
                                                    children: selectedTask.activities.map((activity)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `p-2 rounded-lg text-xs ${activity.type === "message" || activity.type === "completion" ? "bg-purple-500/10 text-text-main" : "bg-surface/40 text-text-main"}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium",
                                                                    children: [
                                                                        t(`activityTypes.${activity.type}`),
                                                                        ":",
                                                                        " "
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                                    lineNumber: 678,
                                                                    columnNumber: 29
                                                                }, this),
                                                                activity.content
                                                            ]
                                                        }, activity.id, true, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 670,
                                                            columnNumber: 27
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 668,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 666,
                                            columnNumber: 21
                                        }, this),
                                        selectedTask.result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 mb-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[16px] text-emerald-600",
                                                            children: "check_circle"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 692,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-emerald-700 dark:text-emerald-400",
                                                            children: t("result")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 695,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 691,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                                    className: "text-xs text-text-muted whitespace-pre-wrap",
                                                    children: formatResult(selectedTask.result)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 699,
                                                    columnNumber: 23
                                                }, this),
                                                selectedTask.result?.prUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: selectedTask.result.prUrl,
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    className: "inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px]",
                                                            children: "open_in_new"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 709,
                                                            columnNumber: 27
                                                        }, this),
                                                        t("viewPR") || "View Pull Request"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 703,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 690,
                                            columnNumber: 21
                                        }, this),
                                        selectedTask.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-lg border border-red-500/20 bg-red-500/5 p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2 mb-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[16px] text-red-500",
                                                            children: "error"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 720,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-red-600",
                                                            children: t("error")
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 723,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 719,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-text-muted",
                                                    children: selectedTask.error
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 725,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 718,
                                            columnNumber: 21
                                        }, this),
                                        selectedTask.status === "running" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Input$3e$__["Input"], {
                                                    placeholder: t("sendMessagePlaceholder"),
                                                    value: messageInput,
                                                    onChange: (e)=>setMessageInput(e.target.value),
                                                    onKeyDown: (e)=>e.key === "Enter" && !e.shiftKey && handleSendMessage(),
                                                    className: "flex-1"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 732,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                    variant: "primary",
                                                    onClick: handleSendMessage,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "material-symbols-outlined text-[16px]",
                                                        children: "send"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                        lineNumber: 740,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 739,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 731,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between pt-3 border-t border-border/30",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                    variant: "ghost",
                                                    size: "sm",
                                                    onClick: ()=>handleCancelTask(selectedTask.id),
                                                    disabled: [
                                                        "completed",
                                                        "failed",
                                                        "cancelled"
                                                    ].includes(selectedTask.status),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px] mr-1",
                                                            children: "cancel"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 753,
                                                            columnNumber: 23
                                                        }, this),
                                                        t("cancel")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 747,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                                    variant: "ghost",
                                                    size: "sm",
                                                    onClick: ()=>handleDeleteTask(selectedTask.id),
                                                    className: "text-red-500 hover:text-red-400",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "material-symbols-outlined text-[14px] mr-1",
                                                            children: "delete"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                            lineNumber: 762,
                                                            columnNumber: 23
                                                        }, this),
                                                        t("delete")
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                                    lineNumber: 756,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 746,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 606,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12 text-text-muted border border-dashed border-border/50 rounded-lg",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[48px] mb-2 block text-text-muted/50",
                                            children: "touch_app"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 769,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm",
                                            children: t("selectTaskPrompt")
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 772,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 768,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                lineNumber: 604,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                        lineNumber: 552,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                lineNumber: 433,
                columnNumber: 9
            }, this),
            activeTab === "agents" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: CLOUD_AGENTS.map((agent)=>{
                    const connected = agentHealth[agent.id] === true;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                        padding: "md",
                        className: "relative",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center text-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `p-3 rounded-xl ${agent.iconBg} ${agent.iconColor}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "material-symbols-outlined text-[32px]",
                                        children: agent.icon
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 790,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 789,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-base font-semibold text-text-main",
                                            children: agent.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 795,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: agent.provider
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 796,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 794,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted",
                                    children: t(agent.descriptionKey)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 800,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `h-2.5 w-2.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 804,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-text-muted",
                                            children: connected ? t("connected") || "Connected" : t("notConnected") || "Not connected"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 807,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 803,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Button$3e$__["Button"], {
                                    variant: "secondary",
                                    size: "sm",
                                    onClick: ()=>{
                                        window.location.href = "/dashboard/providers?section=cloudagent";
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "material-symbols-outlined text-[14px] mr-1",
                                            children: "settings"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 822,
                                            columnNumber: 21
                                        }, this),
                                        t("configure") || "Configure"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 815,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                            lineNumber: 787,
                            columnNumber: 17
                        }, this)
                    }, agent.id, false, {
                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                        lineNumber: 786,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                lineNumber: 782,
                columnNumber: 9
            }, this),
            activeTab === "settings" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$components$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Card$3e$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-base font-semibold text-text-main mb-1",
                                    children: t("settingsTitle") || "Cloud Agent Settings"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 837,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-text-muted",
                                    children: t("settingsDesc") || "Configure local preferences for cloud agents."
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 840,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                            lineNumber: 836,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between py-3 border-b border-border/30",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-text-main",
                                            children: t("settingEnableAgents") || "Enable cloud agents"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 848,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("settingEnableAgentsDesc") || "Master switch for all cloud agent functionality."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 851,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 847,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    role: "switch",
                                    "aria-checked": settings.enabled,
                                    onClick: ()=>updateSetting("enabled", !settings.enabled),
                                    className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enabled ? "bg-purple-500" : "bg-zinc-300 dark:bg-zinc-600"}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `inline-block h-4 w-4 rounded-full bg-white transition-transform ${settings.enabled ? "translate-x-6" : "translate-x-1"}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 864,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 856,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                            lineNumber: 846,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between py-3 border-b border-border/30",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-text-main",
                                            children: t("settingAutoPR") || "Auto-create PR"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 875,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("settingAutoPRDesc") || "Automatically create a pull request when a task completes."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 878,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 874,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    role: "switch",
                                    "aria-checked": settings.autoCreatePr,
                                    onClick: ()=>updateSetting("autoCreatePr", !settings.autoCreatePr),
                                    className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoCreatePr ? "bg-purple-500" : "bg-zinc-300 dark:bg-zinc-600"}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `inline-block h-4 w-4 rounded-full bg-white transition-transform ${settings.autoCreatePr ? "translate-x-6" : "translate-x-1"}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 891,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 883,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                            lineNumber: 873,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between py-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-medium text-text-main",
                                            children: t("settingRequireApproval") || "Require plan approval"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 902,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-text-muted",
                                            children: t("settingRequireApprovalDesc") || "Pause execution until you approve the agent's plan."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                            lineNumber: 905,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 901,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    role: "switch",
                                    "aria-checked": settings.requireApproval,
                                    onClick: ()=>updateSetting("requireApproval", !settings.requireApproval),
                                    className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.requireApproval ? "bg-purple-500" : "bg-zinc-300 dark:bg-zinc-600"}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `inline-block h-4 w-4 rounded-full bg-white transition-transform ${settings.requireApproval ? "translate-x-6" : "translate-x-1"}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                        lineNumber: 918,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                                    lineNumber: 910,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                            lineNumber: 900,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                    lineNumber: 835,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
                lineNumber: 834,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(dashboard)/dashboard/cloud-agents/page.tsx",
        lineNumber: 392,
        columnNumber: 5
    }, this);
}
_s(CloudAgentsPage, "NlZvb29WbgOcAKf43BXRKo50P0Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLocale"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTranslations"]
    ];
});
_c = CloudAgentsPage;
var _c;
__turbopack_context__.k.register(_c, "CloudAgentsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_1p6slyn._.js.map
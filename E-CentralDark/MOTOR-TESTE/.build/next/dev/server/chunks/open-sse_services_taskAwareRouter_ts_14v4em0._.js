module.exports = [
"[project]/open-sse/services/taskAwareRouter.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Task-Aware Smart Router — T05
 *
 * Detects the semantic type of an incoming chat request and routes it to a routing
 * INTENT, letting the auto-combo scorer pick the concrete model from whatever the
 * operator has connected. Defaults never name a provider/model id (#8602).
 *
 * Task types → default intent:
 *   - coding        → auto/coding
 *   - analysis      → auto/reasoning
 *   - vision        → auto/vision
 *   - summarization → auto/chat:fast
 *   - background    → auto/chat:cheap
 *   - creative      → no override (use requested model)
 *   - chat          → no override (use requested model)
 *
 * Operators can still point any task type at a specific model via
 * PUT /api/settings/task-routing — the defaults just stop shipping stale ones.
 */ // ── Types ───────────────────────────────────────────────────────────────────
__turbopack_context__.s([
    "applyTaskAwareRouting",
    ()=>applyTaskAwareRouting,
    "detectTaskType",
    ()=>detectTaskType,
    "getDefaultTaskModelMap",
    ()=>getDefaultTaskModelMap,
    "getTaskRoutingConfig",
    ()=>getTaskRoutingConfig,
    "hydrateTaskRoutingConfig",
    ()=>hydrateTaskRoutingConfig,
    "resetTaskRoutingStats",
    ()=>resetTaskRoutingStats,
    "setTaskRoutingConfig",
    ()=>setTaskRoutingConfig
]);
// ── Default detection patterns ───────────────────────────────────────────────
const TASK_PATTERNS = {
    coding: {
        patterns: [
            "write code",
            "write a function",
            "implement",
            "debug",
            "fix this",
            "fix the",
            "refactor",
            "unit test",
            "write test",
            "write a script",
            "code review",
            "complete this function",
            "add a feature",
            "javascript",
            "typescript",
            "python",
            "sql query",
            "api endpoint"
        ],
        userPatterns: [
            "```",
            "def ",
            "function ",
            "class ",
            "import ",
            "const ",
            "let ",
            "var ",
            "SELECT ",
            "INSERT ",
            "<html",
            "<div"
        ]
    },
    creative: {
        patterns: [
            "write a story",
            "write a poem",
            "write a song",
            "creative writing",
            "write a blog",
            "write an article",
            "write a script",
            "write an essay",
            "imagine",
            "roleplay",
            "brainstorm",
            "creative"
        ]
    },
    analysis: {
        patterns: [
            "analyze",
            "analyse",
            "analysis",
            "compare",
            "evaluate",
            "assess",
            "explain",
            "reasoning",
            "pros and cons",
            "advantages and disadvantages",
            "what are the implications",
            "in-depth",
            "comprehensive"
        ]
    },
    vision: {
        patterns: [
            "look at this image",
            "in this image",
            "what do you see",
            "describe this image",
            "analyze this image",
            "read this screenshot"
        ],
        userPatterns: [
            "image_url",
            "data:image"
        ]
    },
    summarization: {
        patterns: [
            "summarize",
            "summary",
            "tldr",
            "tl;dr",
            "brief overview",
            "key points",
            "main points",
            "what did",
            "highlights from"
        ]
    },
    background: {
        patterns: [
            "generate a title",
            "generate title",
            "create a title",
            "name this",
            "short description",
            "brief description",
            "one-line summary",
            "conversation title"
        ]
    },
    chat: {
        patterns: []
    }
};
// ── Default task → routing-intent map ────────────────────────────────────────
/**
 * Defaults route by INTENT (`auto/<category>[:<tier>]`), never to a concrete
 * provider/model id (#8602).
 *
 * The previous defaults named literal models (`openai/gpt-4o`,
 * `gemini/gemini-2.5-flash-lite`, …). That was wrong twice over:
 *
 *  - The list rotted. Those ids aged out by a generation or two, and every model
 *    release made them staler. Naming an intent instead removes the maintenance.
 *  - It bypassed the router. `applyTaskAwareRouting` overwrites `body.model`, so a
 *    literal target skipped auto-combo's 13-factor scoring (quota, circuit-breaker
 *    health, cost, latency, stability), connection cooldown and model lockout — and
 *    hard-failed for any operator who simply had no connection for that provider.
 *
 * `auto/*` ids resolve on demand against the operator's actually-connected backends
 * (`autoCombo/suffixComposition.ts` → `autoCombo/virtualFactory.ts`) and degrade
 * gracefully as backends rotate. Keep every entry here an `auto/` id.
 */ const DEFAULT_TASK_MODEL_MAP = {
    coding: "auto/coding",
    creative: "",
    analysis: "auto/reasoning",
    vision: "auto/vision",
    summarization: "auto/chat:fast",
    background: "auto/chat:cheap",
    chat: ""
};
// ── State ────────────────────────────────────────────────────────────────────
// #8601: the config MUST live on globalThis, NOT in a module-level `let`. A plain
// module-level binding is DUPLICATED per module graph, so the boot hydration in
// src/instrumentation-node.ts would land on the instrumentation graph's copy and
// never reach the copy src/sse/handlers/chat.ts reads — exactly the #5312 fix-A
// break proven on the VPS. Mirrors thinkingBudget.ts (#5312) and systemPrompt.ts (#2470).
const GLOBAL_KEY = "__omniroute_taskRouting_config__";
const _store = globalThis;
function freshConfig() {
    return {
        enabled: false,
        taskModelMap: {
            ...DEFAULT_TASK_MODEL_MAP
        },
        detectionEnabled: true,
        stats: {
            detected: 0,
            routed: 0
        }
    };
}
function getConfig() {
    if (!_store[GLOBAL_KEY]) {
        _store[GLOBAL_KEY] = freshConfig();
    }
    return _store[GLOBAL_KEY];
}
function setTaskRoutingConfig(config) {
    const current = getConfig();
    _store[GLOBAL_KEY] = {
        ...current,
        ...config,
        stats: current.stats
    };
}
function getTaskRoutingConfig() {
    const current = getConfig();
    return {
        ...current,
        taskModelMap: {
            ...current.taskModelMap
        },
        stats: {
            ...current.stats
        }
    };
}
function resetTaskRoutingStats() {
    getConfig().stats = {
        detected: 0,
        routed: 0
    };
}
function hydrateTaskRoutingConfig(settings) {
    const raw = settings && typeof settings === "object" && !Array.isArray(settings) ? settings.taskRouting : undefined;
    if (raw === undefined || raw === null) return false;
    let parsed = raw;
    if (typeof raw === "string") {
        if (raw.trim().length === 0) return false;
        try {
            parsed = JSON.parse(raw);
        } catch  {
            return false;
        }
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    // `stats` is runtime telemetry, never restored from the persisted blob — the route
    // already strips it on write, but a hand-edited settings row must not resurrect it.
    const { stats: _ignoredStats, ...persisted } = parsed;
    setTaskRoutingConfig(persisted);
    return true;
}
function getDefaultTaskModelMap() {
    return {
        ...DEFAULT_TASK_MODEL_MAP
    };
}
function extractText(content) {
    if (typeof content === "string") return content.toLowerCase();
    if (Array.isArray(content)) {
        return content.map((part)=>typeof part === "string" ? part.toLowerCase() : part?.text?.toLowerCase() || "").join(" ");
    }
    return "";
}
function hasImages(messages) {
    for (const msg of messages){
        if (Array.isArray(msg.content)) {
            for (const part of msg.content){
                if (part?.type === "image_url" || part?.type === "image") return true;
            }
        }
    }
    return false;
}
function detectTaskType(body) {
    if (!body || typeof body !== "object") return "chat";
    const messages = Array.isArray(body.messages) ? body.messages : Array.isArray(body.input) ? body.input : [];
    if (messages.length === 0) return "chat";
    // 1. Vision — check for image_url in any message
    if (hasImages(messages)) return "vision";
    // 2. System prompt patterns (background first — most specific)
    const systemMsg = messages.find((m)=>m.role === "system" || m.role === "developer");
    const systemText = systemMsg ? extractText(systemMsg.content) : "";
    const lastUserMsg = [
        ...messages
    ].reverse().find((m)=>m.role === "user");
    const userText = lastUserMsg ? extractText(lastUserMsg.content) : "";
    // Check ALL task patterns in priority order
    const priorityOrder = [
        "background",
        "coding",
        "vision",
        "summarization",
        "analysis",
        "creative"
    ];
    for (const taskType of priorityOrder){
        const { patterns, userPatterns } = TASK_PATTERNS[taskType];
        // Check system prompt
        if (patterns.some((p)=>systemText.includes(p.toLowerCase()))) {
            return taskType;
        }
        // Check user message for this task's patterns
        if (patterns.some((p)=>userText.includes(p.toLowerCase()))) {
            return taskType;
        }
        // Check user message for code-specific patterns (userPatterns)
        if (userPatterns?.some((p)=>userText.includes(p.toLowerCase()))) {
            return taskType;
        }
    }
    return "chat";
}
function applyTaskAwareRouting(originalModel, body) {
    const config = getConfig();
    if (!config.enabled || !config.detectionEnabled) {
        return {
            model: originalModel,
            taskType: "chat",
            wasRouted: false
        };
    }
    const taskType = detectTaskType(body);
    config.stats.detected++;
    const preferred = config.taskModelMap[taskType];
    // No override configured for this task type
    if (!preferred || preferred === "") {
        return {
            model: originalModel,
            taskType,
            wasRouted: false
        };
    }
    // Don't override if the model is already "better" (e.g. user sent opus, preferred is flash)
    // We respect user's choice unless it's a background/summarization override
    if (taskType !== "background" && taskType !== "summarization") {
    // For non-utility tasks, only override if no specific model was given
    // (i.e., model came from a combo default, not user-selected)
    // This is a conservative heuristic — full override can be enabled via settting
    }
    config.stats.routed++;
    return {
        model: preferred,
        taskType,
        wasRouted: true
    };
}
}),
];

//# sourceMappingURL=open-sse_services_taskAwareRouter_ts_14v4em0._.js.map
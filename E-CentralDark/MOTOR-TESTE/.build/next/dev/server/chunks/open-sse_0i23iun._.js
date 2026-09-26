module.exports = [
"[project]/open-sse/config/codexInstructions.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Default instructions for Codex models
// Source: CLIProxyAPI internal/misc/codex_instructions/
__turbopack_context__.s([
    "CODEX_CHAT_DEFAULT_INSTRUCTIONS",
    ()=>CODEX_CHAT_DEFAULT_INSTRUCTIONS,
    "CODEX_DEFAULT_INSTRUCTIONS",
    ()=>CODEX_DEFAULT_INSTRUCTIONS
]);
const CODEX_CHAT_DEFAULT_INSTRUCTIONS = "You are a ChatGPT agent.";
const CODEX_DEFAULT_INSTRUCTIONS = `You are Codex, based on GPT-5. You are running as a coding agent in the Codex CLI on a user's computer.

## General

- When searching for text or files, prefer using \`rg\` or \`rg --files\` respectively because \`rg\` is much faster than alternatives like \`grep\`. (If the \`rg\` command is not found, then use alternatives.)

## Editing constraints

- Default to ASCII when editing or creating files. Only introduce non-ASCII or other Unicode characters when there is a clear justification and the file already uses them.
- Add succinct code comments that explain what is going on if code is not self-explanatory. You should not add comments like "Assigns the value to the variable", but a brief comment might be useful ahead of a complex code block that the user would otherwise have to spend time parsing out. Usage of these comments should be rare.
- Try to use apply_patch for single file edits, but it is fine to explore other options to make the edit if it does not work well. Do not use apply_patch for changes that are auto-generated (i.e. generating package.json or running a lint or format command like gofmt) or when scripting is more efficient (such as search and replacing a string across a codebase).
- You may be in a dirty git worktree.
    * NEVER revert existing changes you did not make unless explicitly requested, since these changes were made by the user.
    * If asked to make a commit or code edits and there are unrelated changes to your work or changes that you didn't make in those files, don't revert those changes.
    * If the changes are in files you've touched recently, you should read carefully and understand how you can work with the changes rather than reverting them.
    * If the changes are in unrelated files, just ignore them and don't revert them.
- Do not amend a commit unless explicitly requested to do so.
- While you are working, you might notice unexpected changes that you didn't make. If this happens, STOP IMMEDIATELY and ask the user how they would like to proceed.
- **NEVER** use destructive commands like \`git reset --hard\` or \`git checkout --\` unless specifically requested or approved by the user.

## Plan tool

When using the planning tool:
- Skip using the planning tool for straightforward tasks (roughly the easiest 25%).
- Do not make single-step plans.
- When you made a plan, update it after having performed one of the sub-tasks that you shared on the plan.

## Codex CLI harness, sandboxing, and approvals

The Codex CLI harness supports several different configurations for sandboxing and escalation approvals that the user can choose from.

Filesystem sandboxing defines which files can be read or written. The options for \`sandbox_mode\` are:
- **read-only**: The sandbox only permits reading files.
- **workspace-write**: The sandbox permits reading files, and editing files in \`cwd\` and \`writable_roots\`. Editing files in other directories requires approval.
- **danger-full-access**: No filesystem sandboxing - all commands are permitted.

Network sandboxing defines whether network can be accessed without approval. Options for \`network_access\` are:
- **restricted**: Requires approval
- **enabled**: No approval needed

Approvals are your mechanism to get user consent to run shell commands without the sandbox. Possible configuration options for \`approval_policy\` are
- **untrusted**: The harness will escalate most commands for user approval, apart from a limited allowlist of safe "read" commands.
- **on-failure**: The harness will allow all commands to run in the sandbox (if enabled), and failures will be escalated to the user for approval to run again without the sandbox.
- **on-request**: Commands will be run in the sandbox by default, and you can specify in your tool call if you want to escalate a command to run without sandboxing. (Note that this mode is not always available. If it is, you'll see parameters for it in the \`shell\` command description.)
- **never**: This is a non-interactive mode where you may NEVER ask the user for approval to run commands. Instead, you must always persist and work around constraints to solve the task for the user. You MUST do your utmost best to finish the task and validate your work before yielding. If this mode is paired with \`danger-full-access\`, take advantage of it to deliver the best outcome for the user. Further, in this mode, your default testing philosophy is overridden: Even if you don't see local patterns for testing, you may add tests and scripts to validate your work. Just remove them before yielding.

When you are running with \`approval_policy == on-request\`, and sandboxing enabled, here are scenarios where you'll need to request approval:
- You need to run a command that writes to a directory that requires it (e.g. running tests that write to /var)
- You need to run a GUI app (e.g., open/xdg-open/osascript) to open browsers or files.
- You are running sandboxed and need to run a command that requires network access (e.g. installing packages)
- If you run a command that is important to solving the user's query, but it fails because of sandboxing, rerun the command with approval. ALWAYS proceed to use the \`sandbox_permissions\` and \`justification\` parameters - do not message the user before requesting approval for the command.
- You are about to take a potentially destructive action such as an \`rm\` or \`git reset\` that the user did not explicitly ask for
- (for all of these, you should weigh alternative paths that do not require approval)

When \`sandbox_mode\` is set to read-only, you'll need to request approval for each command that isn't a read.

You will be told what filesystem sandboxing, network sandboxing, and approval mode are active in a developer or user message. If you are not told about this, assume that you are running with workspace-write, network sandboxing enabled, and approval on-failure.

Although they introduce friction to the user because your work is paused until the user responds, you should leverage them when necessary to accomplish important work. If the completing the task requires escalated permissions, Do not let these settings or the sandbox deter you from attempting to accomplish the user's task unless it is set to "never", in which case never ask for approvals.

When requesting approval to execute a command that will require escalated privileges:
  - Provide the \`sandbox_permissions\` parameter with the value \`"require_escalated"\`
  - Include a short, 1 sentence explanation for why you need escalated permissions in the justification parameter

## Special user requests

- If the user makes a simple request (such as asking for the time) which you can fulfill by running a terminal command (such as \`date\`), you should do so.
- If the user asks for a "review", default to a code review mindset: prioritise identifying bugs, risks, behavioural regressions, and missing tests. Findings must be the primary focus of the response - keep summaries or overviews brief and only after enumerating the issues. Present findings first (ordered by severity with file/line references), follow with open questions or assumptions, and offer a change-summary only as a secondary detail. If no findings are discovered, state that explicitly and mention residual risks or testing gaps.

## Frontend tasks
When doing frontend design tasks, avoid collapsing into "AI slop" or safe, average-looking layouts.
Aim for interfaces that feel intentional, bold, and a bit surprising.
- Typography: Use expressive, purposeful fonts and avoid default stacks (Inter, Roboto, Arial, system).
- Color & Look: Choose a clear visual direction; define CSS variables; avoid purple-on-white defaults. No purple bias or dark mode bias.
- Motion: Use a few meaningful animations (page-load, staggered reveals) instead of generic micro-motions.
- Background: Don't rely on flat, single-color backgrounds; use gradients, shapes, or subtle patterns to build atmosphere.
- Overall: Avoid boilerplate layouts and interchangeable UI patterns. Vary themes, type families, and visual languages across outputs.
- Ensure the page loads properly on both desktop and mobile

Exception: If working within an existing website or design system, preserve the established patterns, structure, and visual language.

## Presenting your work and final message

You are producing plain text that will later be styled by the CLI. Follow these rules exactly. Formatting should make results easy to scan, but not feel mechanical. Use judgment to decide how much structure adds value.

- Default: be very concise; friendly coding teammate tone.
- Ask only when needed; suggest ideas; mirror the user's style.
- For substantial work, summarize clearly; follow final‑answer formatting.
- Skip heavy formatting for simple confirmations.
- Don't dump large files you've written; reference paths only.
- No "save/copy this file" - User is on the same machine.
- Offer logical next steps (tests, commits, build) briefly; add verify steps if you couldn't do something.
- For code changes:
  * Lead with a quick explanation of the change, and then give more details on the context covering where and why a change was made. Do not start this explanation with "summary", just jump right in.
  * If there are natural next steps the user may want to take, suggest them at the end of your response. Do not make suggestions if there are no natural next steps.
  * When suggesting multiple options, use numeric lists for the suggestions so the user can quickly respond with a single number.
- The user does not command execution outputs. When asked to show the output of a command (e.g. \`git show\`), relay the important details in your answer or summarize the key lines so the user understands the result.

### Final answer structure and style guidelines

- Plain text; CLI handles styling. Use structure only when it helps scanability.
- Headers: optional; short Title Case (1-3 words) wrapped in **…**; no blank line before the first bullet; add only if they truly help.
- Bullets: use - ; merge related points; keep to one line when possible; 4–6 per list ordered by importance; keep phrasing consistent.
- Monospace: backticks for commands/paths/env vars/code ids and inline examples; use for literal keyword bullets; never combine with **.
- Code samples or multi-line snippets should be wrapped in fenced code blocks; include an info string as often as possible.
- Structure: group related bullets; order sections general → specific → supporting; for subsections, start with a bolded keyword bullet, then items; match complexity to the task.
- Tone: collaborative, concise, factual; present tense, active voice; self‑contained; no "above/below"; parallel wording.
- Don'ts: no nested bullets/hierarchies; no ANSI codes; don't cram unrelated keywords; keep keyword lists short—wrap/reformat if long; avoid naming formatting styles in answers.
- Adaptation: code explanations → precise, structured with code refs; simple tasks → lead with outcome; big changes → logical walkthrough + rationale + next actions; casual one-offs → plain sentences, no headers/bullets.
- File References: When referencing files in your response follow the below rules:
  * Use inline code to make file paths clickable.
  * Each reference should have a stand alone path. Even if it's the same file.
  * Accepted: absolute, workspace‑relative, a/ or b/ diff prefixes, or bare filename/suffix.
  * Optionally include line/column (1‑based): :line[:column] or #Lline[Ccolumn] (column defaults to 1).
  * Do not use URIs like file://, vscode://, or https://.
  * Do not provide range of lines
  * Examples: src/app.ts, src/app.ts:42, b/server/index.js#L10, C:\\repo\\project\\main.rs:12:5`;
}),
"[project]/open-sse/config/codexIdentity.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyCodexClientIdentityHeaders",
    ()=>applyCodexClientIdentityHeaders,
    "applyCodexClientMetadata",
    ()=>applyCodexClientMetadata,
    "createCodexClientIdentity",
    ()=>createCodexClientIdentity,
    "getCodexInstallationId",
    ()=>getCodexInstallationId,
    "isCodexOriginatedHeaders",
    ()=>isCodexOriginatedHeaders
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/codexClient.ts [middleware] (ecmascript) <locals>");
;
;
const CODEX_INSTALLATION_SALT = "omniroute-codex-installation";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function normalizeUuid(value) {
    return typeof value === "string" && UUID_PATTERN.test(value.trim()) ? value.trim() : null;
}
function uuidFromStableValue(value) {
    const hash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(value).digest("hex");
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
function getCodexInstallationId(providerSpecificData) {
    const explicit = normalizeUuid(providerSpecificData?.codexInstallationId);
    if (explicit) return explicit;
    const stableSource = typeof providerSpecificData?.workspaceId === "string" && providerSpecificData.workspaceId.trim() ? providerSpecificData.workspaceId.trim() : typeof providerSpecificData?.accountId === "string" && providerSpecificData.accountId.trim() ? providerSpecificData.accountId.trim() : typeof providerSpecificData?.email === "string" && providerSpecificData.email.trim() ? providerSpecificData.email.trim() : "default";
    return uuidFromStableValue(`${CODEX_INSTALLATION_SALT}:${stableSource}`);
}
function createCodexClientIdentity(sessionId, providerSpecificData) {
    const normalizedSessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeCodexSessionId"])(sessionId);
    if (!normalizedSessionId) return null;
    return {
        sessionId: normalizedSessionId,
        turnId: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(),
        windowId: `${normalizedSessionId}:0`,
        installationId: getCodexInstallationId(providerSpecificData)
    };
}
function applyCodexClientIdentityHeaders(headers, identity) {
    if (!identity) return;
    headers["session_id"] = identity.sessionId;
    headers["x-client-request-id"] = identity.sessionId;
    headers["x-codex-window-id"] = identity.windowId;
    headers["x-codex-turn-metadata"] = JSON.stringify({
        session_id: identity.sessionId,
        thread_source: "user",
        turn_id: identity.turnId,
        sandbox: "none"
    });
}
function isCodexOriginatedHeaders(headers) {
    const getHeader = (name)=>{
        if (headers instanceof Headers) {
            return headers.get(name)?.toLowerCase() ?? "";
        }
        if (headers && typeof headers === "object") {
            for (const [key, value] of Object.entries(headers)){
                if (key.toLowerCase() === name && typeof value === "string") {
                    return value.toLowerCase();
                }
            }
        }
        return "";
    };
    if (getHeader("originator").startsWith("codex")) return true;
    return getHeader("user-agent").startsWith("codex");
}
function applyCodexClientMetadata(body, identity) {
    if (!identity) return;
    const existing = body.client_metadata && typeof body.client_metadata === "object" && !Array.isArray(body.client_metadata) ? body.client_metadata : {};
    body.client_metadata = {
        ...existing,
        "x-codex-installation-id": identity.installationId
    };
}
}),
"[project]/open-sse/config/sap.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SAP_DEFAULT_BASE_URL",
    ()=>SAP_DEFAULT_BASE_URL,
    "buildSapChatUrl",
    ()=>buildSapChatUrl,
    "buildSapModelsUrl",
    ()=>buildSapModelsUrl,
    "getSapResourceGroup",
    ()=>getSapResourceGroup,
    "isSapDeploymentUrl",
    ()=>isSapDeploymentUrl,
    "normalizeSapBaseUrl",
    ()=>normalizeSapBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const SAP_DEFAULT_BASE_URL = "https://example-aicore.cfapps.eu10.hana.ondemand.com/v2/lm/deployments/example-deployment";
function sanitizeUrl(value) {
    try {
        const parsed = new URL(value);
        parsed.search = "";
        parsed.hash = "";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.toString());
    } catch  {
        return value;
    }
}
function normalizeSapBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || SAP_DEFAULT_BASE_URL);
    if (!normalized) return SAP_DEFAULT_BASE_URL;
    return sanitizeUrl(normalized.replace(/\/chat\/completions$/i, ""));
}
function isSapDeploymentUrl(value) {
    const normalized = normalizeSapBaseUrl(value);
    return /\/v2\/lm\/deployments\/[^/]+$/i.test(normalized);
}
function buildSapChatUrl(value) {
    const normalized = normalizeSapBaseUrl(value);
    if (normalized.endsWith("/chat/completions")) return normalized;
    return `${normalized}/chat/completions`;
}
function buildSapModelsUrl(value) {
    const normalized = normalizeSapBaseUrl(value);
    const root = normalized.replace(/\/v2\/lm\/deployments\/[^/]+$/i, "");
    return `${root}/v2/lm/scenarios/foundation-models/models`;
}
function getSapResourceGroup(providerSpecificData, fallback = "default") {
    const candidates = [
        providerSpecificData?.resourceGroup,
        providerSpecificData?.aiResourceGroup,
        providerSpecificData?.resource_group
    ];
    for (const candidate of candidates){
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    }
    return fallback;
}
}),
"[project]/open-sse/config/datarobot.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DATAROBOT_DEFAULT_BASE_URL",
    ()=>DATAROBOT_DEFAULT_BASE_URL,
    "buildDataRobotCatalogUrl",
    ()=>buildDataRobotCatalogUrl,
    "buildDataRobotChatUrl",
    ()=>buildDataRobotChatUrl,
    "isDataRobotDeploymentUrl",
    ()=>isDataRobotDeploymentUrl,
    "normalizeDataRobotBaseUrl",
    ()=>normalizeDataRobotBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const DATAROBOT_API_V2_SEGMENT = "/api/v2";
const DATAROBOT_LLMGW_CHAT_PATH = "/genai/llmgw/chat/completions/";
const DATAROBOT_LLMGW_CATALOG_PATH = "/genai/llmgw/catalog/";
const DATAROBOT_DEFAULT_BASE_URL = "https://app.datarobot.com";
function normalizeDataRobotBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || DATAROBOT_DEFAULT_BASE_URL);
    return normalized || DATAROBOT_DEFAULT_BASE_URL;
}
function isDataRobotDeploymentUrl(value) {
    const normalized = normalizeDataRobotBaseUrl(value);
    return /\/api\/v2\/deployments\/[^/]+(?:\/chat\/completions)?$/i.test(normalized);
}
function buildDataRobotChatUrl(value) {
    const normalized = normalizeDataRobotBaseUrl(value);
    if (normalized.endsWith("/chat/completions")) {
        return normalized;
    }
    if (/\/api\/v2\/deployments\/[^/]+$/i.test(normalized)) {
        return `${normalized}/chat/completions`;
    }
    if (/\/api\/v2\/genai\/llmgw$/i.test(normalized)) {
        return `${normalized}/chat/completions/`;
    }
    if (/\/api\/v2\/genai\/llmgw\/chat$/i.test(normalized)) {
        return `${normalized}/completions/`;
    }
    if (normalized.includes(DATAROBOT_API_V2_SEGMENT)) {
        return `${normalized}${DATAROBOT_LLMGW_CHAT_PATH}`;
    }
    return `${normalized}${DATAROBOT_API_V2_SEGMENT}${DATAROBOT_LLMGW_CHAT_PATH}`;
}
function buildDataRobotCatalogUrl(value) {
    const normalized = normalizeDataRobotBaseUrl(value);
    if (isDataRobotDeploymentUrl(normalized)) {
        return null;
    }
    const parsed = new URL(normalized);
    let basePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.pathname);
    if (/\/api\/v2\/genai\/llmgw\/chat\/completions$/i.test(basePath)) {
        basePath = basePath.replace(/\/chat\/completions$/i, "");
    } else if (/\/api\/v2\/genai\/llmgw$/i.test(basePath)) {
    // Keep path as-is.
    } else if (basePath.includes(DATAROBOT_API_V2_SEGMENT)) {
        basePath = basePath.replace(/\/api\/v2.*$/i, "");
    }
    const catalogPath = `${basePath}${DATAROBOT_LLMGW_CATALOG_PATH}`.replace(/\/{2,}/g, "/");
    parsed.pathname = catalogPath;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
}
}),
"[project]/open-sse/config/azureAi.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AZURE_AI_DEFAULT_BASE_URL",
    ()=>AZURE_AI_DEFAULT_BASE_URL,
    "buildAzureAiChatUrl",
    ()=>buildAzureAiChatUrl,
    "buildAzureAiModelsUrl",
    ()=>buildAzureAiModelsUrl,
    "detectAzureUrlFormat",
    ()=>detectAzureUrlFormat,
    "normalizeAzureAiBaseUrl",
    ()=>normalizeAzureAiBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const AZURE_AI_DEFAULT_BASE_URL = "https://example-resource.services.ai.azure.com/openai/v1";
function normalizeAzureAiBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || AZURE_AI_DEFAULT_BASE_URL);
    if (!normalized) return AZURE_AI_DEFAULT_BASE_URL;
    if (normalized.endsWith("/chat/completions") || normalized.endsWith("/responses") || normalized.endsWith("/models")) {
        return normalized.replace(/\/(?:chat\/completions|responses|models)$/i, "");
    }
    if (normalized.endsWith("/openai/v1") || normalized.endsWith("/v1")) {
        return normalized;
    }
    if (normalized.endsWith("/openai")) {
        return `${normalized}/v1`;
    }
    const parsed = new URL(normalized);
    if (parsed.hostname.endsWith(".services.ai.azure.com") || parsed.hostname.endsWith(".openai.azure.com")) {
        if (!parsed.pathname || parsed.pathname === "/") {
            parsed.pathname = "/openai/v1";
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.toString());
        }
    }
    return normalized;
}
function detectAzureUrlFormat(baseUrl) {
    if (!baseUrl || typeof baseUrl !== "string") return "foundry";
    const trimmed = baseUrl.trim();
    if (!trimmed) return "foundry";
    try {
        const urlStr = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
        const parsed = new URL(urlStr);
        const host = parsed.hostname.toLowerCase();
        const pathname = parsed.pathname.toLowerCase();
        if (host.endsWith(".services.ai.azure.com")) {
            return "foundry";
        }
        if ((host.endsWith(".openai.azure.com") || host.endsWith(".cognitiveservices.azure.com")) && !pathname.includes("/v1")) {
            return "classic";
        }
        if (pathname.includes("/v1")) {
            return "foundry";
        }
        return "foundry";
    } catch  {
        return "foundry";
    }
}
function buildAzureAiChatUrl(value, apiType = "chat", model, apiVersion = "2024-12-01-preview") {
    const format = detectAzureUrlFormat(value);
    const normalized = normalizeAzureAiBaseUrl(value);
    if (format === "classic" && model) {
        const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])((value || "").trim()).replace(/\/openai$/i, "").replace(/\/openai\/deployments\/[^/]+\/chat\/completions[^/]*$/i, "");
        return `${raw}/openai/deployments/${encodeURIComponent(model)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
    }
    return `${normalized}/${apiType === "responses" ? "responses" : "chat/completions"}`;
}
function buildAzureAiModelsUrl(value) {
    return `${normalizeAzureAiBaseUrl(value)}/models`;
}
}),
"[project]/open-sse/config/watsonx.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WATSONX_DEFAULT_BASE_URL",
    ()=>WATSONX_DEFAULT_BASE_URL,
    "buildWatsonxChatUrl",
    ()=>buildWatsonxChatUrl,
    "buildWatsonxModelsUrl",
    ()=>buildWatsonxModelsUrl,
    "normalizeWatsonxBaseUrl",
    ()=>normalizeWatsonxBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const WATSONX_DEFAULT_BASE_URL = "https://ca-tor.ml.cloud.ibm.com/ml/gateway/v1";
function normalizeWatsonxBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || WATSONX_DEFAULT_BASE_URL);
    if (!normalized) return WATSONX_DEFAULT_BASE_URL;
    const stripped = normalized.replace(/\/(?:chat\/completions|completions|embeddings|models)$/i, "");
    if (stripped.endsWith("/ml/gateway/v1")) {
        return stripped;
    }
    if (stripped.endsWith("/ml/gateway")) {
        return `${stripped}/v1`;
    }
    try {
        const parsed = new URL(stripped);
        if (!parsed.pathname || parsed.pathname === "/") {
            parsed.pathname = "/ml/gateway/v1";
        } else if (parsed.pathname.endsWith("/ml/gateway")) {
            parsed.pathname = `${parsed.pathname}/v1`;
        }
        parsed.search = "";
        parsed.hash = "";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.toString());
    } catch  {
        return stripped;
    }
}
function buildWatsonxChatUrl(value) {
    return `${normalizeWatsonxBaseUrl(value)}/chat/completions`;
}
function buildWatsonxModelsUrl(value) {
    return `${normalizeWatsonxBaseUrl(value)}/models`;
}
}),
"[project]/open-sse/config/oci.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OCI_DEFAULT_BASE_URL",
    ()=>OCI_DEFAULT_BASE_URL,
    "buildOciChatUrl",
    ()=>buildOciChatUrl,
    "buildOciModelsUrl",
    ()=>buildOciModelsUrl,
    "normalizeOciBaseUrl",
    ()=>normalizeOciBaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/urlSanitize.ts [middleware] (ecmascript)");
;
const OCI_DEFAULT_BASE_URL = "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/openai/v1";
function normalizeOciBaseUrl(value) {
    const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeBaseUrl"])(value || OCI_DEFAULT_BASE_URL);
    if (!normalized) return OCI_DEFAULT_BASE_URL;
    const stripped = normalized.replace(/\/(?:chat\/completions|responses|models)$/i, "");
    if (stripped.endsWith("/openai/v1")) {
        return stripped;
    }
    if (stripped.endsWith("/openai")) {
        return `${stripped}/v1`;
    }
    try {
        const parsed = new URL(stripped);
        if (!parsed.pathname || parsed.pathname === "/") {
            parsed.pathname = "/openai/v1";
        } else if (parsed.pathname.endsWith("/openai")) {
            parsed.pathname = `${parsed.pathname}/v1`;
        }
        parsed.search = "";
        parsed.hash = "";
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$urlSanitize$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripTrailingSlashes"])(parsed.toString());
    } catch  {
        return stripped;
    }
}
function buildOciChatUrl(value, apiType = "chat") {
    return `${normalizeOciBaseUrl(value)}/${apiType === "responses" ? "responses" : "chat/completions"}`;
}
function buildOciModelsUrl(value) {
    return `${normalizeOciBaseUrl(value)}/models`;
}
}),
"[project]/open-sse/config/bedrock.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BEDROCK_DASHBOARD_DEFAULT_REGION",
    ()=>BEDROCK_DASHBOARD_DEFAULT_REGION,
    "BEDROCK_DEFAULT_REGION",
    ()=>BEDROCK_DEFAULT_REGION,
    "buildBedrockControlBaseUrl",
    ()=>buildBedrockControlBaseUrl,
    "buildBedrockNativeConverseUrl",
    ()=>buildBedrockNativeConverseUrl,
    "buildBedrockNativeInferenceProfilesUrl",
    ()=>buildBedrockNativeInferenceProfilesUrl,
    "buildBedrockNativeModelsUrl",
    ()=>buildBedrockNativeModelsUrl,
    "buildBedrockRuntimeBaseUrl",
    ()=>buildBedrockRuntimeBaseUrl,
    "extractBedrockRegionFromBaseUrl",
    ()=>extractBedrockRegionFromBaseUrl,
    "getBedrockKnownModelLimits",
    ()=>getBedrockKnownModelLimits,
    "normalizeBedrockDiscoveredModels",
    ()=>normalizeBedrockDiscoveredModels,
    "normalizeBedrockRegion",
    ()=>normalizeBedrockRegion,
    "resolveBedrockRegion",
    ()=>resolveBedrockRegion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/modelSpecs.ts [middleware] (ecmascript)");
;
const BEDROCK_DEFAULT_REGION = "us-east-1";
const BEDROCK_DASHBOARD_DEFAULT_REGION = "eu-west-2";
const BEDROCK_REGION_PATTERN = /^[a-z]{2}(?:-gov)?-[a-z]+-\d+$/i;
function normalizeBedrockRegion(value, fallback = BEDROCK_DEFAULT_REGION) {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim().toLowerCase();
    return BEDROCK_REGION_PATTERN.test(trimmed) ? trimmed : fallback;
}
function extractBedrockRegionFromBaseUrl(value) {
    if (!value) return null;
    try {
        const hostname = new URL(value).hostname;
        const match = hostname.match(/^bedrock(?:-runtime|-mantle)?\.([a-z0-9-]+)\./i);
        return match?.[1] ? normalizeBedrockRegion(match[1], "") || null : null;
    } catch  {
        return null;
    }
}
function resolveBedrockRegion(providerSpecificData) {
    const data = providerSpecificData && typeof providerSpecificData === "object" ? providerSpecificData : {};
    const explicit = normalizeBedrockRegion(data.region, "");
    if (explicit) return explicit;
    const baseUrl = typeof data.baseUrl === "string" ? data.baseUrl : null;
    return extractBedrockRegionFromBaseUrl(baseUrl) || BEDROCK_DEFAULT_REGION;
}
function buildBedrockControlBaseUrl(region) {
    return `https://bedrock.${normalizeBedrockRegion(region)}.amazonaws.com`;
}
function buildBedrockRuntimeBaseUrl(region) {
    return `https://bedrock-runtime.${normalizeBedrockRegion(region)}.amazonaws.com`;
}
function buildBedrockNativeModelsUrl(region) {
    return `${buildBedrockControlBaseUrl(region)}/foundation-models?byOutputModality=TEXT`;
}
function buildBedrockNativeInferenceProfilesUrl(region, options = {}) {
    const url = new URL(`${buildBedrockControlBaseUrl(region)}/inference-profiles`);
    url.searchParams.set("maxResults", "100");
    url.searchParams.set("typeEquals", options.typeEquals || "SYSTEM_DEFINED");
    if (options.nextToken) url.searchParams.set("nextToken", options.nextToken);
    return url.toString();
}
function buildBedrockNativeConverseUrl(region, modelId, stream = false) {
    const encodedModel = encodeURIComponent(modelId);
    return `${buildBedrockRuntimeBaseUrl(region)}/model/${encodedModel}/${stream ? "converse-stream" : "converse"}`;
}
function modelIdFromArn(value) {
    if (typeof value !== "string") return null;
    const marker = ":foundation-model/";
    const idx = value.indexOf(marker);
    if (idx < 0) return null;
    const id = value.slice(idx + marker.length).trim();
    return id || null;
}
function getBedrockKnownModelLimits(modelId) {
    const trimmed = typeof modelId === "string" ? modelId.trim() : "";
    if (!trimmed) return null;
    const unqualified = trimmed.includes("/") ? trimmed.slice(trimmed.indexOf("/") + 1) : trimmed;
    const withoutProfilePrefix = unqualified.replace(/^(?:eu|us|global)\./i, "");
    const withoutProviderPrefix = withoutProfilePrefix.replace(/^anthropic\./i, "");
    const spec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelSpec"])(trimmed) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelSpec"])(unqualified) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelSpec"])(withoutProfilePrefix) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$modelSpecs$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelSpec"])(withoutProviderPrefix);
    if (!spec?.contextWindow && !spec?.maxOutputTokens) return null;
    return {
        ...typeof spec.contextWindow === "number" ? {
            inputTokenLimit: spec.contextWindow
        } : {},
        ...typeof spec.maxOutputTokens === "number" ? {
            outputTokenLimit: spec.maxOutputTokens
        } : {}
    };
}
function withKnownBedrockLimits(model) {
    return {
        ...model,
        ...getBedrockKnownModelLimits(model.id) || {}
    };
}
function normalizeBedrockDiscoveredModels(foundationModelsResponse, inferenceProfilesResponse = null) {
    const byId = new Map();
    const add = (model)=>{
        if (!model.id || byId.has(model.id)) return;
        byId.set(model.id, model);
    };
    const foundationModels = foundationModelsResponse && typeof foundationModelsResponse === "object" ? foundationModelsResponse.modelSummaries : null;
    if (Array.isArray(foundationModels)) {
        for (const item of foundationModels){
            const model = item && typeof item === "object" ? item : {};
            const id = typeof model.modelId === "string" ? model.modelId.trim() : "";
            if (!id) continue;
            const outputModalities = Array.isArray(model.outputModalities) ? model.outputModalities : [];
            const inputModalities = Array.isArray(model.inputModalities) ? model.inputModalities : [];
            add(withKnownBedrockLimits({
                id,
                name: typeof model.modelName === "string" && model.modelName.trim() ? model.modelName : id,
                source: "foundation",
                provider: typeof model.providerName === "string" ? model.providerName : null,
                supportsStreaming: model.responseStreamingSupported === true,
                supportsVision: inputModalities.includes("IMAGE") || outputModalities.includes("IMAGE")
            }));
        }
    }
    const profiles = inferenceProfilesResponse && typeof inferenceProfilesResponse === "object" ? inferenceProfilesResponse.inferenceProfileSummaries : null;
    if (Array.isArray(profiles)) {
        for (const item of profiles){
            const profile = item && typeof item === "object" ? item : {};
            const id = typeof profile.inferenceProfileId === "string" ? profile.inferenceProfileId.trim() : "";
            if (id) {
                add(withKnownBedrockLimits({
                    id,
                    name: typeof profile.inferenceProfileName === "string" && profile.inferenceProfileName.trim() ? profile.inferenceProfileName : id,
                    source: "inference_profile",
                    supportsStreaming: true
                }));
            }
            const models = Array.isArray(profile.models) ? profile.models : [];
            for (const profileModel of models){
                const modelRecord = profileModel && typeof profileModel === "object" ? profileModel : {};
                const modelId = modelIdFromArn(modelRecord.modelArn);
                if (modelId) {
                    add(withKnownBedrockLimits({
                        id: modelId,
                        name: modelId,
                        source: "foundation",
                        supportsStreaming: true
                    }));
                }
            }
        }
    }
    return [
        ...byId.values()
    ].sort((a, b)=>a.id.localeCompare(b.id));
}
}),
"[project]/open-sse/config/providerPluginManifestUrl.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROVIDER_PLUGIN_MANIFEST_HEADER",
    ()=>PROVIDER_PLUGIN_MANIFEST_HEADER,
    "PROVIDER_PLUGIN_MANIFEST_PATH",
    ()=>PROVIDER_PLUGIN_MANIFEST_PATH,
    "getProviderPluginManifestHeader",
    ()=>getProviderPluginManifestHeader,
    "resolveProviderPluginManifestUrl",
    ()=>resolveProviderPluginManifestUrl
]);
const PROVIDER_PLUGIN_MANIFEST_HEADER = "X-OmniRoute-Provider-Manifest-Url";
const PROVIDER_PLUGIN_MANIFEST_PATH = "/api/v1/provider-plugin-manifest";
function trimTrailingSlash(value) {
    return value.replace(/\/$/, "");
}
function resolveProviderPluginManifestUrl(origin) {
    const configured = process.env.OMNIROUTE_PROVIDER_MANIFEST_URL?.trim();
    if (configured) return configured;
    if (origin) {
        return `${trimTrailingSlash(origin)}${PROVIDER_PLUGIN_MANIFEST_PATH}`;
    }
    const host = process.env.HOST || "127.0.0.1";
    const port = process.env.PORT || process.env.DASHBOARD_PORT || process.env.API_PORT || "20128";
    const protocol = process.env.OMNIROUTE_PUBLIC_PROTOCOL || "http";
    return `${protocol}://${host}:${port}${PROVIDER_PLUGIN_MANIFEST_PATH}`;
}
function getProviderPluginManifestHeader(origin) {
    return {
        [PROVIDER_PLUGIN_MANIFEST_HEADER]: resolveProviderPluginManifestUrl(origin)
    };
}
}),
"[project]/open-sse/config/claudeWebFingerprint.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Claude Web — shared browser fingerprint source of truth
 *
 * Cloudflare binds the `cf_clearance` cookie minted by the Turnstile solver
 * to the User-Agent (+ TLS/JA3 fingerprint + IP) that solved the challenge.
 * If the completion request later replays that cookie under a *different*
 * User-Agent, Cloudflare rejects it and the executor surfaces a persistent
 * 429 (see #7548).
 *
 * Every part of the claude-web pipeline that talks to claude.ai — the
 * Turnstile solver, the direct-fetch executor, and the httpBackedChat
 * fast path — MUST derive its User-Agent / Client-Hints headers from this
 * single constant so they can never drift apart again.
 *
 * Platform choice: Linux, matching the `chrome_146` TLS/JA3 profile used by
 * `claudeTlsClient.ts` and the browser-pool default (`browserPool.ts`).
 */ __turbopack_context__.s([
    "CLAUDE_WEB_FINGERPRINT",
    ()=>CLAUDE_WEB_FINGERPRINT,
    "CLAUDE_WEB_FINGERPRINT_VERSION",
    ()=>CLAUDE_WEB_FINGERPRINT_VERSION
]);
const CLAUDE_WEB_FINGERPRINT = {
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    secChUa: '"Chromium";v="149", "Not-A.Brand";v="24", "Google Chrome";v="149"',
    secChUaPlatform: '"Linux"'
};
const CLAUDE_WEB_FINGERPRINT_VERSION = "v2-linux-unified";
}),
"[project]/open-sse/config/providers/registry/kimi/web/runtime.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveKimiWebContextLength",
    ()=>resolveKimiWebContextLength,
    "resolveKimiWebModelConfig",
    ()=>resolveKimiWebModelConfig,
    "resolveKimiWebReasoningEffort",
    ()=>resolveKimiWebReasoningEffort
]);
const REASONING_EFFORT_PREFIX = "REASONING_EFFORT_";
const CONTEXT_LENGTH_PREFIX = "CONTEXT_LENGTH_";
const STATIC_MODEL_CONFIGS = {
    k3: {
        scenario: "SCENARIO_K2D5",
        supportedReasoningEfforts: [
            "REASONING_EFFORT_NONE",
            "REASONING_EFFORT_LOW"
        ],
        defaultReasoningEffort: "REASONING_EFFORT_NONE",
        supportedContextLengths: []
    },
    k2d6: {
        scenario: "SCENARIO_K2D5",
        supportedReasoningEfforts: [
            "REASONING_EFFORT_NONE",
            "REASONING_EFFORT_LOW"
        ],
        defaultReasoningEffort: "REASONING_EFFORT_NONE",
        supportedContextLengths: []
    }
};
function toNonEmptyString(value) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function resolveKimiWebModelConfig(modelId) {
    return STATIC_MODEL_CONFIGS[modelId] || null;
}
function resolveKimiWebReasoningEffort(value, config) {
    const requested = toNonEmptyString(value);
    const normalized = requested ? requested.startsWith(REASONING_EFFORT_PREFIX) ? requested.toUpperCase() : `${REASONING_EFFORT_PREFIX}${requested.toUpperCase()}` : config.defaultReasoningEffort;
    if (!normalized) return undefined;
    if (!config.supportedReasoningEfforts.includes(normalized)) {
        throw new Error(`Kimi Web model does not support reasoning_effort=${requested || normalized}`);
    }
    return normalized;
}
function resolveKimiWebContextLength(value, config) {
    const requested = toNonEmptyString(value);
    const normalized = requested ? requested.startsWith(CONTEXT_LENGTH_PREFIX) ? requested.toUpperCase() : `${CONTEXT_LENGTH_PREFIX}${requested.toUpperCase()}` : config.defaultContextLength;
    if (!normalized) return undefined;
    if (!config.supportedContextLengths.includes(normalized)) {
        throw new Error(`Kimi Web model does not support context_length=${requested || normalized}`);
    }
    return normalized;
}
}),
"[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeBillableTokens",
    ()=>computeBillableTokens,
    "createAbortError",
    ()=>createAbortError,
    "createBodyTimeoutError",
    ()=>createBodyTimeoutError,
    "createUpstreamStartTimeoutError",
    ()=>createUpstreamStartTimeoutError,
    "executeWithUpstreamStartTimeout",
    ()=>executeWithUpstreamStartTimeout,
    "getExecutorTimeoutMs",
    ()=>getExecutorTimeoutMs,
    "normalizeExecutorResult",
    ()=>normalizeExecutorResult,
    "readStreamChunkWithTimeout",
    ()=>readStreamChunkWithTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [middleware] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [middleware] (ecmascript)");
;
;
;
function createBodyTimeoutError(timeoutMs) {
    const err = new Error(`Response body read timeout after ${timeoutMs}ms`);
    err.name = "BodyTimeoutError";
    return err;
}
function readStreamChunkWithTimeout(reader, timeoutMs) {
    if (timeoutMs <= 0) return reader.read();
    return new Promise((resolve, reject)=>{
        const timeout = setTimeout(()=>reject(createBodyTimeoutError(timeoutMs)), timeoutMs);
        reader.read().then((value)=>{
            clearTimeout(timeout);
            resolve(value);
        }, (error)=>{
            clearTimeout(timeout);
            reject(error);
        });
    });
}
function createUpstreamStartTimeoutError(timeoutMs, provider, model) {
    const err = new Error(`Upstream request did not return response headers after ${timeoutMs}ms (${provider}/${model})`);
    err.name = "TimeoutError";
    return err;
}
function createAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    err.name = "AbortError";
    return err;
}
function computeBillableTokens(usage) {
    // Cache read/creation tokens are a BREAKDOWN already contained inside
    // getLoggedInputTokens (prompt_tokens / input_tokens). Adding them here would
    // double-count. Canonical billable total = input + output + reasoning, matching
    // the columns persisted by saveRequestUsage and seedWindowUsageFromHistory.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(usage) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(usage) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getReasoningTokens"])(usage);
}
/** Resolves the model-level `timeoutMs` registry override, when both
 *  `provider` and `model` are known and the model registers one (#6354). */ function resolveModelTimeoutOverride(provider, model) {
    if (!provider || !model) return undefined;
    const override = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getModelTimeoutMs"])(provider, model);
    if (typeof override !== "number" || !Number.isFinite(override)) return undefined;
    return Math.max(0, Math.floor(override));
}
function resolveProviderTimeoutMs(executor) {
    const getTimeoutMs = executor?.getTimeoutMs;
    if (typeof getTimeoutMs !== "function") return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
    try {
        const timeoutMs = getTimeoutMs.call(executor);
        if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs)) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
        return Math.max(0, Math.floor(timeoutMs));
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
    }
}
function getExecutorTimeoutMs(executor, provider, model) {
    const modelOverride = resolveModelTimeoutOverride(provider, model);
    if (modelOverride !== undefined) return modelOverride;
    return resolveProviderTimeoutMs(executor);
}
function normalizeExecutorResult(result) {
    if (result instanceof Response) {
        return {
            response: result,
            url: "",
            headers: {},
            transformedBody: null
        };
    }
    return {
        response: result.response,
        url: result.url || "",
        headers: result.headers || {},
        transformedBody: result.transformedBody ?? null,
        transport: result.transport
    };
}
async function executeWithUpstreamStartTimeout({ executor, provider, model, signal, log, execute }) {
    const timeoutMs = getExecutorTimeoutMs(executor, provider, model);
    if (timeoutMs <= 0) return execute(signal);
    if (signal.aborted) throw createAbortError(signal);
    const timeoutController = new AbortController();
    const combinedController = new AbortController();
    const timeoutError = createUpstreamStartTimeoutError(timeoutMs, provider, model);
    let timeoutId = null;
    let abortListener = null;
    let timeoutAbortListener = null;
    const abortCombined = (source)=>{
        if (combinedController.signal.aborted) return;
        const reason = source.reason instanceof Error ? source.reason : createAbortError(source);
        combinedController.abort(reason);
    };
    abortListener = ()=>abortCombined(signal);
    timeoutAbortListener = ()=>abortCombined(timeoutController.signal);
    signal.addEventListener("abort", abortListener, {
        once: true
    });
    timeoutController.signal.addEventListener("abort", timeoutAbortListener, {
        once: true
    });
    const timeoutPromise = new Promise((_, reject)=>{
        timeoutId = setTimeout(()=>{
            log?.warn?.("TIMEOUT", timeoutError.message);
            timeoutController.abort(timeoutError);
            reject(timeoutError);
        }, timeoutMs);
    });
    const abortPromise = new Promise((_, reject)=>{
        signal.addEventListener("abort", ()=>reject(createAbortError(signal)), {
            once: true
        });
    });
    try {
        return await Promise.race([
            execute(combinedController.signal),
            timeoutPromise,
            abortPromise
        ]);
    } finally{
        if (timeoutId) clearTimeout(timeoutId);
        if (abortListener) signal.removeEventListener("abort", abortListener);
        if (timeoutAbortListener) {
            timeoutController.signal.removeEventListener("abort", timeoutAbortListener);
        }
    }
}
}),
"[project]/open-sse/handlers/responseTranslator.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "translateNonStreamingResponse",
    ()=>translateNonStreamingResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiThoughtSignatureStore.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/textualToolCall.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [middleware] (ecmascript)");
;
;
;
;
;
;
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function toString(value, fallback = "") {
    return typeof value === "string" ? value : fallback;
}
function toNumber(value, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim().length > 0 ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}
function firstPositiveNumber(...values) {
    for (const value of values){
        const parsed = toNumber(value, 0);
        if (parsed > 0) {
            return parsed;
        }
    }
    return 0;
}
function normalizeToolCallArgs(args) {
    if (typeof args !== "string") return args;
    const trimmed = args.trim();
    if (!trimmed || !(trimmed.startsWith("{") || trimmed.startsWith("["))) return args;
    try {
        return JSON.parse(trimmed);
    } catch  {
        return args;
    }
}
function parseTextualToolCall(text) {
    if (typeof text !== "string") return null;
    // Gemini/Antigravity sometimes imitates the request-side fallback with small
    // variations, e.g. a leading "(empty)" marker or zero-width chars inserted
    // into argument strings. Normalize those variants before parsing so the
    // response is still surfaced as a structured OpenAI tool call.
    const normalized = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    const match = normalized.match(/^[\s\S]*?\[Tool call:\s*([^\]\n]+)\]\s*\nArguments:\s*([\s\S]+?)\s*$/);
    if (!match) return null;
    const name = match[1]?.trim();
    const rawArgs = match[2]?.trim();
    if (!name || !rawArgs) return null;
    try {
        let args = JSON.parse(rawArgs);
        if (typeof args === "string") {
            const trimmed = args.trim();
            if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                args = JSON.parse(trimmed);
            }
        }
        if (args && typeof args === "object" && !Array.isArray(args)) {
            return {
                name,
                args
            };
        }
    } catch  {}
    return null;
}
function extractMessageOutputText(item) {
    if (!Array.isArray(item.content)) return "";
    let text = "";
    for (const part of item.content){
        if (!part || typeof part !== "object") continue;
        const partObj = toRecord(part);
        if (partObj.type === "output_text" && typeof partObj.text === "string") {
            text += partObj.text;
        }
    }
    return text;
}
/**
 * T19: Pick the last non-empty message output text from Responses API output.
 * Falls back to the last message item even when all message texts are empty.
 */ function findBestMessageText(output) {
    const messageItems = output.map((item)=>toRecord(item)).filter((item)=>item.type === "message" && Array.isArray(item.content));
    for(let i = messageItems.length - 1; i >= 0; i -= 1){
        const text = extractMessageOutputText(messageItems[i]);
        if (text.trim().length > 0) {
            return {
                text,
                selectedMessageIndex: i,
                messageItems
            };
        }
    }
    if (messageItems.length > 0) {
        const lastIndex = messageItems.length - 1;
        return {
            text: extractMessageOutputText(messageItems[lastIndex]),
            selectedMessageIndex: lastIndex,
            messageItems
        };
    }
    return {
        text: "",
        selectedMessageIndex: -1,
        messageItems: []
    };
}
function translateNonStreamingResponse(responseBody, targetFormat, sourceFormat, toolNameMap) {
    // If already in source format, return as-is
    if (targetFormat === sourceFormat) {
        if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(responseBody, toolNameMap);
        }
        return responseBody;
    }
    let intermediateOpenAI = responseBody;
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(intermediateOpenAI, toolNameMap);
    }
    // Handle OpenAI Responses API format
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
        const responseRoot = toRecord(responseBody);
        const response = responseRoot.object === "response" ? responseRoot : toRecord(responseRoot.response ?? responseRoot);
        const output = Array.isArray(response.output) ? response.output : [];
        const usage = toRecord(response.usage ?? responseRoot.usage);
        const messageSelection = findBestMessageText(output);
        let textContent = messageSelection.text;
        let reasoningContent = "";
        const toolCalls = [];
        for (const item of output){
            if (!item || typeof item !== "object") continue;
            const itemObj = toRecord(item);
            if (itemObj.type === "message" && Array.isArray(itemObj.content)) {
                for (const part of itemObj.content){
                    if (!part || typeof part !== "object") continue;
                    const partObj = toRecord(part);
                    if (partObj.type === "summary_text" && typeof partObj.text === "string") {
                        // #9500 — reasoning summary parts are discrete segments; join with "\n\n"
                        // (matches extractThinkingFromContent convention) so they don't glue back-to-back.
                        reasoningContent += reasoningContent ? `\n\n${partObj.text}` : partObj.text;
                    }
                }
            } else if (itemObj.type === "reasoning" && Array.isArray(itemObj.summary)) {
                for (const part of itemObj.summary){
                    const partObj = toRecord(part);
                    if (partObj.type === "summary_text" && typeof partObj.text === "string") {
                        // #9500 — reasoning summary parts are discrete segments; join with "\n\n"
                        // (matches extractThinkingFromContent convention) so they don't glue back-to-back.
                        reasoningContent += reasoningContent ? `\n\n${partObj.text}` : partObj.text;
                    }
                }
            } else if (itemObj.type === "function_call") {
                const callId = toString(itemObj.call_id) || toString(itemObj.id) || `call_${Date.now()}_${toolCalls.length}`;
                let argsToEmit = itemObj.arguments;
                if (argsToEmit != null && typeof argsToEmit === "object" && !Array.isArray(argsToEmit)) {
                    const cleaned = {
                        ...argsToEmit
                    };
                    for (const [k, v] of Object.entries(cleaned)){
                        if (v === "" || Array.isArray(v) && v.length === 0) delete cleaned[k];
                    }
                    argsToEmit = cleaned;
                }
                const fnArgs = typeof argsToEmit === "string" ? argsToEmit : JSON.stringify(argsToEmit || {});
                const rawName = toString(itemObj.name);
                // Strip Claude OAuth proxy_ prefix using toolNameMap
                const resolvedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
                toolCalls.push({
                    id: callId,
                    type: "function",
                    function: {
                        name: resolvedName,
                        arguments: fnArgs
                    }
                });
            }
        }
        const message = {
            role: "assistant"
        };
        if (textContent) {
            message.content = textContent;
        }
        if (reasoningContent) {
            message.reasoning_content = reasoningContent;
        }
        if (toolCalls.length > 0) {
            message.tool_calls = toolCalls;
        }
        if (message.content === undefined) {
            message.content = "";
        }
        if (process.env.DEBUG_RESPONSES_SSE_TO_JSON === "true") {
            console.log(`[ResponsesSSE] ${output.length} output items, ${messageSelection.messageItems.length} message items`);
            messageSelection.messageItems.forEach((item, idx)=>{
                const textLen = extractMessageOutputText(item).length;
                console.log(`  [${idx}] text length: ${textLen}`);
            });
            console.log(`  → Selected message index: ${messageSelection.selectedMessageIndex}`);
            console.log(`  → Final text content length: ${textContent.length}`);
        }
        const createdAt = toNumber(response.created_at, Math.floor(Date.now() / 1000));
        const model = toString(response.model || responseRoot.model, "openai-responses");
        const finishReason = toolCalls.length > 0 ? "tool_calls" : "stop";
        const result = {
            id: `chatcmpl-${toString(response.id, String(Date.now()))}`,
            object: "chat.completion",
            created: createdAt,
            model,
            choices: [
                {
                    index: 0,
                    message,
                    finish_reason: finishReason
                }
            ]
        };
        if (Object.keys(usage).length > 0) {
            const inputTokens = toNumber(usage.input_tokens, 0);
            const outputTokens = toNumber(usage.output_tokens, 0);
            const inputTokensDetails = toRecord(usage.input_tokens_details);
            const outputTokensDetails = toRecord(usage.output_tokens_details);
            const promptTokensDetails = toRecord(usage.prompt_tokens_details);
            const completionTokensDetails = toRecord(usage.completion_tokens_details);
            const cachedInputTokens = firstPositiveNumber(inputTokensDetails.cached_tokens, promptTokensDetails.cached_tokens, usage.cache_read_input_tokens);
            const cacheCreationInputTokens = firstPositiveNumber(inputTokensDetails.cache_creation_tokens, promptTokensDetails.cache_creation_tokens, usage.cache_creation_input_tokens);
            const reasoningTokens = firstPositiveNumber(outputTokensDetails.reasoning_tokens, completionTokensDetails.reasoning_tokens, usage.reasoning_tokens);
            result.usage = {
                prompt_tokens: inputTokens,
                completion_tokens: outputTokens,
                total_tokens: inputTokens + outputTokens
            };
            if (reasoningTokens > 0) {
                result.usage.completion_tokens_details = {
                    reasoning_tokens: reasoningTokens
                };
            }
            if (cachedInputTokens > 0 || cacheCreationInputTokens > 0) {
                result.usage.prompt_tokens_details = {};
                const promptDetails = result.usage.prompt_tokens_details;
                if (cachedInputTokens > 0) {
                    promptDetails.cached_tokens = cachedInputTokens;
                }
                if (cacheCreationInputTokens > 0) {
                    promptDetails.cache_creation_tokens = cacheCreationInputTokens;
                }
            }
        }
        intermediateOpenAI = result;
    } else if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) {
        const root = toRecord(responseBody);
        const response = toRecord(root.response ?? root);
        const candidates = Array.isArray(response.candidates) ? response.candidates : [];
        const usage = toRecord(response.usageMetadata ?? root.usageMetadata);
        const promptFeedback = toRecord(response.promptFeedback ?? root.promptFeedback);
        if (candidates.length > 0 || Object.keys(promptFeedback).length > 0) {
            const createdMs = Date.parse(toString(response.createTime));
            const created = Number.isFinite(createdMs) ? Math.floor(createdMs / 1000) : Math.floor(Date.now() / 1000);
            const choices = candidates.length > 0 ? candidates.map((candidateValue, index)=>{
                const candidate = toRecord(candidateValue);
                const content = toRecord(candidate.content);
                let textContent = "";
                const contentParts = [];
                const toolCalls = [];
                let reasoningContent = "";
                let pendingThoughtSignature = "";
                if (Array.isArray(content.parts)) {
                    for (const part of content.parts){
                        const partObj = toRecord(part);
                        if (partObj.thought === true && typeof partObj.text === "string") {
                            // #9500 — Gemini thinking parts are discrete segments; join with "\n\n"
                            // (matches extractThinkingFromContent convention) so they don't glue back-to-back.
                            reasoningContent += reasoningContent ? `\n\n${partObj.text}` : partObj.text;
                            continue;
                        }
                        // Capture thoughtSignature from thinking parts (Gemini thinking models)
                        // so it can be stored alongside any subsequent functionCall part.
                        const partThoughtSig = toString(partObj.thoughtSignature ?? partObj.thought_signature);
                        if (partThoughtSig) {
                            pendingThoughtSignature = partThoughtSig;
                        }
                        if (typeof partObj.text === "string") {
                            const textualToolCall = parseTextualToolCall(partObj.text);
                            if (textualToolCall) {
                                const toolCallId = `call_${toString(textualToolCall.name, "unknown")}_${Date.now()}_${toolCalls.length}`;
                                toolCalls.push({
                                    id: toolCallId,
                                    type: "function",
                                    function: {
                                        name: textualToolCall.name,
                                        arguments: JSON.stringify(textualToolCall.args || {})
                                    }
                                });
                            } else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["containsTextualToolCallMarker"])(partObj.text)) {
                                textContent += partObj.text;
                                contentParts.push({
                                    type: "text",
                                    text: partObj.text
                                });
                            }
                        }
                        const inlineData = toRecord(partObj.inlineData ?? partObj.inline_data);
                        if (typeof inlineData.data === "string" && inlineData.data.length > 0) {
                            const mimeType = toString(inlineData.mimeType ?? inlineData.mime_type, "image/png");
                            contentParts.push({
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${inlineData.data}`
                                }
                            });
                        }
                        if (partObj.functionCall) {
                            const fn = toRecord(partObj.functionCall);
                            const rawName = toString(fn.name);
                            const restoredName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
                            const nativeId = toString(fn.id);
                            const toolCallId = nativeId.length > 0 ? nativeId : `call_${toString(restoredName, "unknown")}_${Date.now()}_${toolCalls.length}`;
                            // Persist the thought signature so openai-to-gemini can
                            // resolve it on the next turn. Use the part-level field
                            // (part.thoughtSignature) and fall back to any signature
                            // captured from an earlier thinking-only part.
                            const sig = partThoughtSig || pendingThoughtSignature;
                            if (sig) {
                                const sigKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["buildGeminiThoughtSignatureKey"])(null, toolCallId);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["storeGeminiThoughtSignature"])(sigKey, sig);
                            }
                            toolCalls.push({
                                id: toolCallId,
                                type: "function",
                                function: {
                                    name: restoredName,
                                    arguments: JSON.stringify(normalizeToolCallArgs(fn.args || {}))
                                }
                            });
                        }
                    }
                }
                const message = {
                    role: "assistant"
                };
                if (contentParts.length === 1 && contentParts[0].type === "text") {
                    message.content = contentParts[0].text;
                } else if (contentParts.length > 0) {
                    message.content = contentParts;
                } else if (textContent) {
                    message.content = textContent;
                }
                if (reasoningContent) {
                    message.reasoning_content = reasoningContent;
                }
                if (toolCalls.length > 0) {
                    message.tool_calls = toolCalls;
                }
                if (!message.content && !message.tool_calls) {
                    message.content = "";
                }
                let finishReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReasonString"])(toString(candidate.finishReason, "stop"));
                if (finishReason === "stop" && toolCalls.length > 0) {
                    finishReason = "tool_calls";
                }
                return {
                    index,
                    message,
                    finish_reason: finishReason
                };
            }) : [
                {
                    index: 0,
                    message: {
                        role: "assistant",
                        content: ""
                    },
                    finish_reason: "content_filter"
                }
            ];
            const result = {
                id: `chatcmpl-${toString(response.responseId, String(Date.now()))}`,
                object: "chat.completion",
                created,
                model: toString(response.modelVersion, "gemini"),
                choices
            };
            if (Object.keys(usage).length > 0) {
                const promptTokens = toNumber(usage.promptTokenCount, 0);
                const reasoningTokens = toNumber(usage.thoughtsTokenCount, 0);
                const completionTokens = toNumber(usage.candidatesTokenCount, 0) + reasoningTokens;
                result.usage = {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: toNumber(usage.totalTokenCount, 0)
                };
                if (reasoningTokens > 0) {
                    result.usage.completion_tokens_details = {
                        reasoning_tokens: reasoningTokens
                    };
                }
                if (toNumber(usage.cachedContentTokenCount, 0) > 0) {
                    result.usage.prompt_tokens_details = {
                        cached_tokens: toNumber(usage.cachedContentTokenCount, 0)
                    };
                }
            }
            intermediateOpenAI = result;
        }
    } else if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
        const root = toRecord(responseBody);
        const contentBlocks = Array.isArray(root.content) ? root.content : [];
        if (contentBlocks.length > 0) {
            let textContent = "";
            let thinkingContent = "";
            const toolCalls = [];
            for (const block of contentBlocks){
                const blockObj = toRecord(block);
                if (blockObj.type === "text") {
                    textContent += toString(blockObj.text);
                } else if (blockObj.type === "thinking") {
                    thinkingContent += toString(blockObj.thinking);
                } else if (blockObj.type === "tool_use") {
                    const rawName = toString(blockObj.name);
                    const strippedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
                    toolCalls.push({
                        id: toString(blockObj.id, `call_${Date.now()}_${toolCalls.length}`),
                        type: "function",
                        function: {
                            name: strippedName,
                            arguments: JSON.stringify(blockObj.input || {})
                        }
                    });
                }
            }
            const message = {
                role: "assistant"
            };
            if (textContent) {
                message.content = textContent;
            }
            if (thinkingContent) {
                message.reasoning_content = thinkingContent;
            }
            if (toolCalls.length > 0) {
                message.tool_calls = toolCalls;
            }
            if (message.content === undefined) {
                message.content = "";
            }
            let finishReason = toString(root.stop_reason, "stop");
            if (finishReason === "end_turn") finishReason = "stop";
            if (finishReason === "tool_use") finishReason = "tool_calls";
            const result = {
                id: `chatcmpl-${toString(root.id, String(Date.now()))}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: toString(root.model, "claude"),
                choices: [
                    {
                        index: 0,
                        message,
                        finish_reason: finishReason
                    }
                ]
            };
            const usage = toRecord(root.usage);
            if (Object.keys(usage).length > 0) {
                // Mirror the streaming translator's usage contract (#1426/#2215):
                // cache_read folds into prompt_tokens (it is billed prompt input);
                // cache_creation stays out of prompt_tokens and is exposed via
                // prompt_tokens_details, alongside cached_tokens (OpenAI field name).
                const cachedTokens = toNumber(usage.cache_read_input_tokens, 0);
                const cacheCreationTokens = toNumber(usage.cache_creation_input_tokens, 0);
                const promptTokens = toNumber(usage.input_tokens, 0) + cachedTokens;
                const completionTokens = toNumber(usage.output_tokens, 0);
                const reasoningTokens = firstPositiveNumber(toRecord(usage.output_tokens_details).thinking_tokens, toRecord(usage.completion_tokens_details).reasoning_tokens, usage.reasoning_tokens);
                const usageOut = {
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: promptTokens + completionTokens
                };
                if (reasoningTokens > 0) {
                    usageOut.reasoning_tokens = reasoningTokens;
                    usageOut.completion_tokens_details = {
                        reasoning_tokens: reasoningTokens
                    };
                }
                if (cachedTokens > 0 || cacheCreationTokens > 0) {
                    const details = {};
                    if (cachedTokens > 0) details.cached_tokens = cachedTokens;
                    if (cacheCreationTokens > 0) details.cache_creation_tokens = cacheCreationTokens;
                    usageOut.prompt_tokens_details = details;
                }
                result.usage = usageOut;
            }
            intermediateOpenAI = result;
        }
    }
    // Phase 3: Translate from OpenAI back to Client Source format
    if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && sourceFormat !== targetFormat) {
        return convertOpenAINonStreamingToClaude(toRecord(intermediateOpenAI));
    }
    // Gemini-family clients (Gemini, Antigravity): the streaming SSE path already
    // projects OpenAI chunks into the `{ response: { candidates: [...] } }` envelope
    // via the registered FORMATS.OPENAI -> FORMATS.ANTIGRAVITY translator
    // (translator/response/openai-to-antigravity.ts), but this non-streaming path had
    // no equivalent back-conversion step — it silently returned the raw OpenAI
    // chat.completion shape (leaking `choices[]`/`tool_calls` instead of
    // `candidates[]`/`functionCall`) to any non-streaming Gemini/Antigravity client.
    if ((sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) && sourceFormat !== targetFormat) {
        return convertOpenAINonStreamingToGeminiFamily(toRecord(intermediateOpenAI));
    }
    // Return intermediateOpenAI (which is either the raw response if unknown targetFormat, or an OpenAI compatible payload)
    return intermediateOpenAI;
}
/**
 * Resolve reasoning/thinking text off a non-streaming OpenAI-format message object.
 * Delegates to the shared reasoning-field resolver (`open-sse/utils/reasoningFields.ts`)
 * so every reasoning alias — DeepSeek-style `reasoning_content`, the OpenRouter/StepFun
 * `reasoning` string, GitHub Copilot's `reasoning_text`, `thinking`/`thought`, and
 * `reasoning_details[]` (array of { text | content }) — is read from one place instead
 * of a divergent local copy. Mirrors the streaming translator's fallback chain in
 * open-sse/translator/response/openai-to-claude.ts.
 */ function resolveReasoningText(messageObj) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getAnyReasoningValue"])(messageObj);
}
/**
 * Helper to convert an OpenAI chat.completion JSON object to Claude format for non-streaming.
 */ function convertOpenAINonStreamingToClaude(openaiResponse) {
    const choices = openaiResponse.choices;
    const isChoicesArray = Array.isArray(choices);
    if (!isChoicesArray && openaiResponse.object !== "chat.completion") {
        return openaiResponse; // If it doesn't look like OpenAI, return as-is
    }
    const choice = isChoicesArray ? choices[0] : null;
    const choiceObj = choice ? toRecord(choice) : {};
    const messageObj = choiceObj.message ? toRecord(choiceObj.message) : {};
    const content = [];
    let hasTextOrReasoning = false;
    const reasoningText = resolveReasoningText(messageObj);
    if (reasoningText) {
        hasTextOrReasoning = true;
        content.push({
            type: "thinking",
            thinking: reasoningText
        });
    }
    // Always include text if it exists (even empty string), or if there are no tool calls and no reasoning
    const hasToolCalls = Array.isArray(messageObj.tool_calls) && messageObj.tool_calls.length > 0;
    if (messageObj.content !== undefined && messageObj.content !== null) {
        hasTextOrReasoning = true;
        const resolvedText = toString(messageObj.content);
        content.push({
            type: "text",
            text: resolvedText === "" ? "(empty response)" : resolvedText
        });
    } else if (!hasTextOrReasoning) {
        content.push({
            type: "text",
            text: "(empty response)"
        });
    }
    if (Array.isArray(messageObj.tool_calls)) {
        for (const tool of messageObj.tool_calls){
            const toolObj = toRecord(tool);
            const fn = toRecord(toolObj.function);
            content.push({
                type: "tool_use",
                id: toString(toolObj.id, `call_${Date.now()}`),
                name: toString(fn.name),
                input: typeof fn.arguments === "string" ? JSON.parse(fn.arguments || "{}") : fn.arguments || {}
            });
        }
    }
    let stopReason = toString(choiceObj.finish_reason, "end_turn");
    if (stopReason === "stop") stopReason = "end_turn";
    if (stopReason === "tool_calls") stopReason = "tool_use";
    const usageSrc = toRecord(openaiResponse.usage);
    const promptTokens = toNumber(usageSrc.prompt_tokens, 0);
    const outputTokens = toNumber(usageSrc.completion_tokens, 0);
    // Extract cache tokens from prompt_tokens_details (mirrors the streaming
    // translator in open-sse/translator/response/openai-to-claude.ts lines 119-148).
    const promptDetails = toRecord(usageSrc.prompt_tokens_details);
    const cachedTokens = toNumber(promptDetails.cached_tokens, 0);
    const cacheCreationTokens = toNumber(promptDetails.cache_creation_tokens, 0);
    // OpenAI's prompt_tokens includes all prompt-side tokens (cached + non-cached).
    // Claude expects input_tokens to be only non-cached tokens, with cached tokens
    // exposed separately as cache_read_input_tokens.
    const inputTokens = promptTokens - cachedTokens - cacheCreationTokens;
    const usage = {
        input_tokens: inputTokens,
        output_tokens: outputTokens
    };
    // Add cache_read_input_tokens if present
    if (cachedTokens > 0) {
        usage.cache_read_input_tokens = cachedTokens;
    }
    // Add cache_creation_input_tokens if present
    if (cacheCreationTokens > 0) {
        usage.cache_creation_input_tokens = cacheCreationTokens;
    }
    const claudeResponse = {
        id: toString(openaiResponse.id, `msg_${Date.now()}`),
        type: "message",
        role: "assistant",
        model: toString(openaiResponse.model, "claude"),
        content,
        stop_reason: stopReason,
        stop_sequence: null,
        usage
    };
    return claudeResponse;
}
const OPENAI_TO_GEMINI_FINISH_REASON = {
    stop: "STOP",
    length: "MAX_TOKENS",
    tool_calls: "STOP",
    content_filter: "SAFETY"
};
/**
 * Parse an OpenAI tool-call `arguments` payload into a Gemini `functionCall.args`
 * object. Never throws: a provider emitting malformed/truncated JSON must not take
 * down the whole non-streaming response path, so an unparseable payload degrades to
 * `{}` (matching the streaming Gemini translator's behaviour).
 */ function parseFunctionCallArgs(args) {
    if (typeof args !== "string") return toRecord(args);
    try {
        return toRecord(JSON.parse(args || "{}"));
    } catch  {
        return {};
    }
}
/**
 * Helper to convert an OpenAI chat.completion JSON object into the Gemini/Antigravity
 * `{ response: { candidates: [...] } }` envelope for non-streaming clients. Mirrors the
 * shape already produced for streaming by the registered
 * FORMATS.OPENAI -> FORMATS.ANTIGRAVITY translator
 * (translator/response/openai-to-antigravity.ts) so both paths agree.
 */ function convertOpenAINonStreamingToGeminiFamily(openaiResponse) {
    const choices = openaiResponse.choices;
    const isChoicesArray = Array.isArray(choices);
    if (!isChoicesArray && openaiResponse.object !== "chat.completion") {
        return openaiResponse; // If it doesn't look like OpenAI, return as-is
    }
    const choice = isChoicesArray ? toRecord(choices[0]) : {};
    const messageObj = toRecord(choice.message);
    const parts = [];
    const reasoningText = resolveReasoningText(messageObj);
    if (reasoningText) {
        parts.push({
            text: reasoningText,
            thought: true
        });
    }
    if (typeof messageObj.content === "string" && messageObj.content.length > 0) {
        parts.push({
            text: messageObj.content
        });
    }
    const toolCalls = Array.isArray(messageObj.tool_calls) ? messageObj.tool_calls : [];
    for (const toolCall of toolCalls){
        const toolObj = toRecord(toolCall);
        const fn = toRecord(toolObj.function);
        parts.push({
            functionCall: {
                name: toString(fn.name),
                args: parseFunctionCallArgs(fn.arguments)
            }
        });
    }
    if (parts.length === 0) parts.push({
        text: ""
    });
    const finishReason = OPENAI_TO_GEMINI_FINISH_REASON[toString(choice.finish_reason, "stop")] ?? "STOP";
    const usageSrc = toRecord(openaiResponse.usage);
    const promptTokens = toNumber(usageSrc.prompt_tokens, 0);
    const completionTokens = toNumber(usageSrc.completion_tokens, 0);
    const geminiResponse = {
        response: {
            candidates: [
                {
                    content: {
                        role: "model",
                        parts
                    },
                    finishReason,
                    index: 0
                }
            ],
            usageMetadata: {
                promptTokenCount: promptTokens,
                candidatesTokenCount: completionTokens,
                totalTokenCount: toNumber(usageSrc.total_tokens, promptTokens + completionTokens)
            },
            modelVersion: toString(openaiResponse.model, "unknown"),
            responseId: toString(openaiResponse.id, `resp_${Date.now()}`)
        }
    };
    return geminiResponse;
}
}),
"[project]/open-sse/handlers/responseSanitizer/reasoning.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONTENT_OPEN_TAG_REGEX",
    ()=>CONTENT_OPEN_TAG_REGEX,
    "EXCESSIVE_NEWLINES",
    ()=>EXCESSIVE_NEWLINES,
    "REASONING_CLOSE_TAG_REGEX",
    ()=>REASONING_CLOSE_TAG_REGEX,
    "REASONING_TAG_FRAGMENT_REGEX",
    ()=>REASONING_TAG_FRAGMENT_REGEX,
    "REASONING_TAG_NAMES",
    ()=>REASONING_TAG_NAMES,
    "REASONING_TAG_PATTERN",
    ()=>REASONING_TAG_PATTERN,
    "THINK_TAG_REGEX",
    ()=>THINK_TAG_REGEX,
    "UNCLOSED_REASONING_TAG_REGEX",
    ()=>UNCLOSED_REASONING_TAG_REGEX,
    "cleanReasoningFragment",
    ()=>cleanReasoningFragment,
    "collapseExcessiveNewlines",
    ()=>collapseExcessiveNewlines,
    "extractThinkingFromContent",
    ()=>extractThinkingFromContent,
    "isAntigravityReasoningRoute",
    ()=>isAntigravityReasoningRoute,
    "isTextualReasoningTagNativeRoute",
    ()=>isTextualReasoningTagNativeRoute,
    "movePrefixBeforeContentTagToThinking",
    ()=>movePrefixBeforeContentTagToThinking,
    "normalizeReasoningRouteId",
    ()=>normalizeReasoningRouteId,
    "shouldParseTextualReasoningTags",
    ()=>shouldParseTextualReasoningTags,
    "splitClosingOnlyReasoningPrefix",
    ()=>splitClosingOnlyReasoningPrefix
]);
const REASONING_TAG_NAMES = [
    "think",
    "thinking",
    "thought",
    "internal_thought"
];
const REASONING_TAG_PATTERN = REASONING_TAG_NAMES.join("|");
const THINK_TAG_REGEX = new RegExp(`<(${REASONING_TAG_PATTERN})\\b[^>]*>([\\s\\S]*?)<\\/\\1>`, "gi");
const REASONING_CLOSE_TAG_REGEX = new RegExp(`</(${REASONING_TAG_PATTERN})>`, "i");
const REASONING_TAG_FRAGMENT_REGEX = new RegExp(`</?(${REASONING_TAG_PATTERN})\\b[^>]*>`, "gi");
const CONTENT_OPEN_TAG_REGEX = /<content\b[^>]*>/i;
const UNCLOSED_REASONING_TAG_REGEX = new RegExp(`<(${REASONING_TAG_PATTERN})(?:\\s[^>]*)?(?:>|\\r?\\n)([\\s\\S]*)$`, "i");
const EXCESSIVE_NEWLINES = /\n{2,}/g;
function collapseExcessiveNewlines(text) {
    return text.replace(EXCESSIVE_NEWLINES, "\n\n");
}
function cleanReasoningFragment(text) {
    return text.replace(REASONING_TAG_FRAGMENT_REGEX, "").trim();
}
function splitClosingOnlyReasoningPrefix(text) {
    const closeMatch = text.match(REASONING_CLOSE_TAG_REGEX);
    if (!closeMatch || closeMatch.index === undefined || closeMatch.index === 0) return null;
    const closeIndex = closeMatch.index;
    const suffix = text.slice(closeIndex + closeMatch[0].length);
    if (!CONTENT_OPEN_TAG_REGEX.test(suffix)) return null;
    const thinking = cleanReasoningFragment(text.slice(0, closeIndex));
    if (!thinking) return null;
    return {
        content: suffix.trim(),
        thinking
    };
}
function movePrefixBeforeContentTagToThinking(cleaned, thinkingParts) {
    const contentMatch = cleaned.match(CONTENT_OPEN_TAG_REGEX);
    if (!contentMatch || contentMatch.index === undefined || contentMatch.index <= 0) return cleaned;
    const contentIndex = contentMatch.index;
    const prefix = cleanReasoningFragment(cleaned.slice(0, contentIndex));
    if (prefix) thinkingParts.unshift(prefix);
    return cleaned.slice(contentIndex);
}
function extractThinkingFromContent(text) {
    if (!text || typeof text !== "string") {
        return {
            content: text || "",
            thinking: null
        };
    }
    const thinkingParts = [];
    let hasThinkTags = false;
    let cleaned = text.replace(THINK_TAG_REGEX, (_match, _tagName, thinkContent)=>{
        hasThinkTags = true;
        const trimmed = thinkContent.trim();
        if (trimmed) {
            thinkingParts.push(trimmed);
        }
        return "";
    });
    if (!hasThinkTags) {
        const closingOnly = splitClosingOnlyReasoningPrefix(cleaned);
        if (closingOnly) {
            return closingOnly;
        }
    }
    const unclosedMatch = cleaned.match(UNCLOSED_REASONING_TAG_REGEX);
    if (unclosedMatch?.index !== undefined) {
        hasThinkTags = true;
        const reasoning = String(unclosedMatch[2] || "").trim();
        if (reasoning) thinkingParts.push(reasoning);
        const prefix = cleaned.slice(0, unclosedMatch.index);
        cleaned = /^(?:\s|§\d+§)*$/.test(prefix) ? "" : prefix;
    }
    if (!hasThinkTags) {
        return {
            content: text,
            thinking: null
        };
    }
    cleaned = movePrefixBeforeContentTagToThinking(cleaned, thinkingParts);
    return {
        content: cleaned.trim(),
        thinking: thinkingParts.length > 0 ? thinkingParts.join("\n\n") : null
    };
}
function normalizeReasoningRouteId(value) {
    return typeof value === "string" ? value.toLowerCase() : "";
}
function isAntigravityReasoningRoute(providerId, modelId) {
    return providerId.includes("antigravity") || providerId === "agy" || modelId.includes("antigravity/") || modelId.startsWith("agy/");
}
function isTextualReasoningTagNativeRoute(providerId, modelId) {
    const routeId = `${providerId}/${modelId}`;
    return /deepseek[-_/]?r1\b/.test(routeId) || /r1[-_/]?distill\b/.test(routeId) || /(?:^|[/:_-])qwq(?:[/._:-]|$)/.test(routeId) || /(?:^|[/_-])k3(?:[/._:-]|$)/.test(modelId) || providerId !== "minimax" && providerId !== "minimax-cn" && /minimax[-_]?m3\b/.test(routeId);
}
function shouldParseTextualReasoningTags(provider, model) {
    const providerId = normalizeReasoningRouteId(provider);
    const modelId = normalizeReasoningRouteId(model);
    return !isAntigravityReasoningRoute(providerId, modelId) && isTextualReasoningTagNativeRoute(providerId, modelId);
}
}),
"[project]/open-sse/handlers/responseSanitizer.ts [middleware] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OMIT_STREAMING_CHUNK_MARKER",
    ()=>OMIT_STREAMING_CHUNK_MARKER,
    "isResponsesCommentaryMessageItem",
    ()=>isResponsesCommentaryMessageItem,
    "sanitizeOpenAIResponse",
    ()=>sanitizeOpenAIResponse,
    "sanitizeResponsesApiResponse",
    ()=>sanitizeResponsesApiResponse,
    "sanitizeStreamingChunk",
    ()=>sanitizeStreamingChunk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningPlaceholder.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer/reasoning.ts [middleware] (ecmascript)");
;
;
;
;
;
/**
 * Response Sanitizer — Normalizes LLM responses to strict OpenAI SDK format.
 *
 * Fixes Issues:
 * 1. Strips non-standard fields (x_groq, usage_breakdown, service_tier) that
 *    break OpenAI Python SDK v1.83+ Pydantic validation (returns str instead of object)
 * 2. Optionally extracts native textual reasoning tags from known tag-style models
 * 3. Normalizes response id, object, and usage fields
 * 4. Converts developer role → system for non-OpenAI providers
 */ const ALLOWED_USAGE_FIELDS = new Set([
    "prompt_tokens",
    "completion_tokens",
    "total_tokens",
    "cached_tokens",
    "prompt_tokens_details",
    "completion_tokens_details",
    // Keep through sanitize → applyClientUsageBuffer so heuristic web usage is
    // not inflated by the default USAGE_TOKEN_BUFFER (2000).
    "estimated"
]);
const ALLOWED_RESPONSES_USAGE_FIELDS = new Set([
    "input_tokens",
    "output_tokens",
    "total_tokens",
    "input_tokens_details",
    "output_tokens_details",
    "estimated",
    "cost_in_usd_ticks",
    "server_side_tool_usage_details",
    "server_side_tool_usage"
]);
const RESPONSES_EXTRA_TOP_LEVEL_FIELDS = [
    "server_side_tool_usage_details",
    "server_side_tool_usage",
    "cost_in_usd_ticks"
];
const OMIT_STREAMING_CHUNK_MARKER = "__omniroute_omit_streaming_chunk";
function toRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value;
}
function toString(value) {
    return typeof value === "string" ? value : undefined;
}
function toNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
function deleteOpenAICompatibleReasoningFields(record) {
    delete record.reasoning_content;
    delete record.reasoning;
    delete record.reasoning_text;
    delete record.reasoning_details;
}
function stripZeroWidthText(value) {
    return value.replace(/[\u200B-\u200D\uFEFF]/g, "");
}
function stripZeroWidthToolArgumentJson(value) {
    return stripZeroWidthText(typeof value === "string" ? value : JSON.stringify(value || {}));
}
function stripZeroWidthFunctionArguments(functionCall) {
    const fn = toRecord(functionCall);
    if (!fn || typeof fn.arguments !== "string") return functionCall;
    const stripped = stripZeroWidthText(fn.arguments);
    // Fast path: return the original reference when there is nothing to strip, so
    // hot streaming paths avoid a per-chunk shallow clone of every tool call.
    if (stripped === fn.arguments) return functionCall;
    return {
        ...fn,
        arguments: stripped
    };
}
function stripZeroWidthToolCallArguments(toolCall) {
    const tc = toRecord(toolCall);
    if (!tc) return toolCall;
    const fn = stripZeroWidthFunctionArguments(tc.function);
    return fn === tc.function ? toolCall : {
        ...tc,
        function: fn
    };
}
function stripZeroWidthValue(value) {
    if (typeof value === "string") return stripZeroWidthText(value);
    if (Array.isArray(value)) return value.map((item)=>stripZeroWidthValue(item));
    const record = toRecord(value);
    if (record) {
        return Object.fromEntries(Object.entries(record).map(([key, item])=>[
                key,
                stripZeroWidthValue(item)
            ]));
    }
    return value;
}
function findBalancedJsonEnd(text, startIndex) {
    if (startIndex < 0 || startIndex >= text.length || text[startIndex] !== "{") return -1;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for(let index = startIndex; index < text.length; index += 1){
        const char = text[index];
        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === "\\") {
                escaped = true;
                continue;
            }
            if (char === '"') {
                inString = false;
            }
            continue;
        }
        if (char === '"') {
            inString = true;
            continue;
        }
        if (char === "{") {
            depth += 1;
            continue;
        }
        if (char === "}") {
            depth -= 1;
            if (depth === 0) return index;
        }
    }
    return -1;
}
function stripInternalToolEnvelopeText(content) {
    let sanitized = stripZeroWidthText(content);
    const markerRegex = /to=(?:functions\.[A-Za-z0-9_.-]+|multi_tool_use\.[A-Za-z0-9_.-]+|[A-Za-z_][A-Za-z0-9_]*)/g;
    while(true){
        const match = markerRegex.exec(sanitized);
        if (!match || match.index < 0) break;
        const searchWindowEnd = Math.min(sanitized.length, match.index + 1200);
        const jsonStart = sanitized.indexOf("{", match.index);
        if (jsonStart < 0 || jsonStart >= searchWindowEnd) {
            sanitized = `${sanitized.slice(0, match.index)}${sanitized.slice(match.index + match[0].length)}`;
            markerRegex.lastIndex = 0;
            continue;
        }
        const jsonEnd = findBalancedJsonEnd(sanitized, jsonStart);
        if (jsonEnd < 0) {
            sanitized = sanitized.slice(0, match.index);
            break;
        }
        const prefix = sanitized.slice(0, match.index).replace(/[ \t]+$/g, "");
        const suffix = sanitized.slice(jsonEnd + 1).replace(/^[ \t]+/g, "");
        sanitized = `${prefix}${suffix}`;
        markerRegex.lastIndex = 0;
    }
    return sanitized.replace(/\n{3,}/g, "\n\n").trim();
}
function parseTextualToolCallContent(content) {
    if (typeof content !== "string") return null;
    const normalized = stripInternalToolEnvelopeText(content);
    const toolCallIndex = normalized.lastIndexOf("[Tool call:");
    if (toolCallIndex < 0) return null;
    const candidate = normalized.slice(toolCallIndex);
    const headerMatch = candidate.match(/^\[Tool call:\s*([^\]\n]+)\]\s*\nArguments:\s*/);
    if (!headerMatch) return null;
    const name = headerMatch[1]?.trim();
    const rawArgs = candidate.slice(headerMatch[0].length).trim();
    if (!name || !rawArgs) return null;
    const decoders = [
        (value)=>value,
        (value)=>{
            if (value.startsWith('"') && value.endsWith('"')) {
                const decoded = JSON.parse(value);
                return typeof decoded === "string" ? decoded : value;
            }
            return value;
        }
    ];
    for (const decode of decoders){
        try {
            const decoded = decode(rawArgs);
            return {
                name,
                args: stripZeroWidthValue(JSON.parse(decoded))
            };
        } catch  {}
    }
    return null;
}
// Matches the exact header format required by parseTextualToolCallContent:
// "[Tool call: name]\nArguments:" (with optional whitespace).  Using the full
// header pattern prevents false positives when the model quotes "[Tool call:"
// in prose, code examples, or terminal output (#3355).
const TEXTUAL_TOOL_CALL_HEADER = /\[Tool call:[^\]\n]+\]\s*\nArguments:/;
function containsTextualToolCallContent(content) {
    return typeof content === "string" && TEXTUAL_TOOL_CALL_HEADER.test(stripInternalToolEnvelopeText(content));
}
function sanitizeOpenAIResponse(body, options = {}) {
    const bodyRecord = toRecord(body);
    if (!bodyRecord) return body;
    const stripReasoning = options.stripReasoning === true;
    const parseTextualReasoningTags = options.parseTextualReasoningTags === true;
    // Build sanitized response with only allowed top-level fields
    const sanitized = {};
    // Ensure required fields exist
    sanitized.id = normalizeResponseId(bodyRecord.id);
    sanitized.object = toString(bodyRecord.object) || "chat.completion";
    sanitized.created = toNumber(bodyRecord.created) ?? Math.floor(Date.now() / 1000);
    sanitized.model = toString(bodyRecord.model) || "unknown";
    // Sanitize choices
    if (Array.isArray(bodyRecord.choices)) {
        sanitized.choices = bodyRecord.choices.map((choice, idx)=>{
            const sanitizedChoice = sanitizeChoice(choice, idx, {
                parseTextualReasoningTags
            });
            const message = toRecord(sanitizedChoice.message);
            if (message && Array.isArray(message.tool_calls) && message.tool_calls.length > 0 && sanitizedChoice.finish_reason !== "tool_calls") {
                sanitizedChoice.finish_reason = "tool_calls";
            }
            if (stripReasoning && message) {
                deleteOpenAICompatibleReasoningFields(message);
            }
            return sanitizedChoice;
        });
    } else {
        sanitized.choices = [];
    }
    // Sanitize usage
    if (bodyRecord.usage !== undefined) {
        sanitized.usage = sanitizeUsage(bodyRecord.usage);
    }
    // Keep system_fingerprint if present (it's a valid OpenAI field)
    if (bodyRecord.system_fingerprint) {
        sanitized.system_fingerprint = bodyRecord.system_fingerprint;
    }
    return sanitized;
}
function sanitizeResponsesApiResponse(body) {
    const bodyRecord = toRecord(body);
    if (!bodyRecord) return body;
    if (Array.isArray(bodyRecord.choices)) {
        return convertOpenAIResponseToResponses(bodyRecord);
    }
    const responseRoot = bodyRecord.object === "response" ? bodyRecord : toRecord(bodyRecord.response ?? bodyRecord) || bodyRecord;
    const sanitized = {
        id: normalizeResponsesId(responseRoot.id),
        object: "response",
        created_at: toNumber(responseRoot.created_at) ?? toNumber(responseRoot.created) ?? Math.floor(Date.now() / 1000),
        model: toString(responseRoot.model) || "unknown",
        status: toString(responseRoot.status) || "completed",
        background: typeof responseRoot.background === "boolean" ? responseRoot.background : false,
        error: responseRoot.error ?? null
    };
    const output = sanitizeResponsesOutput(responseRoot.output);
    // Some upstreams return a shorthand Responses body that carries the answer only
    // in `output_text` with an empty/absent `output[]`. Synthesize a message item so
    // the sanitized response still has usable structured output — otherwise the text
    // is dropped and the response is later flagged malformed (#4942 regression).
    if (output.length === 0 && typeof responseRoot.output_text === "string" && responseRoot.output_text.trim().length > 0) {
        output.push({
            id: "msg_0",
            type: "message",
            role: "assistant",
            content: [
                {
                    type: "output_text",
                    text: responseRoot.output_text.trim()
                }
            ]
        });
    }
    sanitized.output = output;
    const outputText = extractResponsesOutputText(output);
    if (outputText.length > 0) {
        sanitized.output_text = outputText;
    }
    if (responseRoot.usage !== undefined) {
        sanitized.usage = sanitizeResponsesUsage(responseRoot.usage);
    }
    for (const key of RESPONSES_EXTRA_TOP_LEVEL_FIELDS){
        if (responseRoot[key] !== undefined) sanitized[key] = responseRoot[key];
    }
    return sanitized;
}
/**
 * Sanitize a single choice object.
 */ function sanitizeChoice(choice, defaultIndex, options = {}) {
    const choiceRecord = toRecord(choice);
    const sanitized = {
        index: defaultIndex,
        finish_reason: null
    };
    if (choiceRecord?.index !== undefined) {
        sanitized.index = choiceRecord.index;
    }
    if (choiceRecord?.finish_reason !== undefined) {
        sanitized.finish_reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReason"])(choiceRecord.finish_reason);
    }
    if (choiceRecord?.message !== undefined) {
        sanitized.message = sanitizeMessage(choiceRecord.message, options);
    }
    if (choiceRecord?.delta !== undefined) {
        sanitized.delta = sanitizeMessage(choiceRecord.delta, options);
    }
    if (choiceRecord?.logprobs !== undefined) {
        sanitized.logprobs = choiceRecord.logprobs;
    }
    return sanitized;
}
function sanitizeMessageContent(msgRecord, options = {}) {
    if (typeof msgRecord.content === "string") {
        const strippedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(msgRecord.content));
        const nativeReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getReadableReasoningValue"])(msgRecord);
        const { content, thinking } = options.parseTextualReasoningTags === true && !nativeReasoning ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["extractThinkingFromContent"])(strippedContent) : {
            content: strippedContent,
            thinking: null
        };
        const sanitized = {
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(content)
        };
        if (thinking) sanitized.reasoning_content = thinking;
        return sanitized;
    }
    return msgRecord.content !== undefined ? {
        content: msgRecord.content
    } : {};
}
function applyTextualToolCallSanitization(sanitized, msgRecord) {
    const textualToolCall = parseTextualToolCallContent(sanitized.content);
    if (textualToolCall && !msgRecord.tool_calls) {
        sanitized.content = null;
        sanitized.tool_calls = [
            {
                id: `call_${Date.now()}_0`,
                type: "function",
                function: {
                    name: textualToolCall.name,
                    arguments: JSON.stringify(textualToolCall.args || {})
                }
            }
        ];
    } else if (containsTextualToolCallContent(sanitized.content) && !msgRecord.tool_calls) {
        sanitized.content = null;
    }
}
function sanitizeMessage(msg, options = {}) {
    const msgRecord = toRecord(msg);
    if (!msgRecord) return msg;
    const sanitized = {};
    if (msgRecord.role) sanitized.role = msgRecord.role;
    if (msgRecord.refusal !== undefined) sanitized.refusal = msgRecord.refusal;
    Object.assign(sanitized, sanitizeMessageContent(msgRecord, options));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["copyOpenAICompatibleReasoningFields"])(msgRecord, sanitized);
    applyTextualToolCallSanitization(sanitized, msgRecord);
    if (msgRecord.tool_calls) {
        sanitized.tool_calls = Array.isArray(msgRecord.tool_calls) ? msgRecord.tool_calls.map((toolCall)=>stripZeroWidthToolCallArguments(toolCall)) : msgRecord.tool_calls;
    }
    if (msgRecord.function_call) {
        sanitized.function_call = stripZeroWidthFunctionArguments(msgRecord.function_call);
    }
    return sanitized;
}
/**
 * Sanitize usage object — keep only standard fields.
 */ function sanitizeUsage(usage) {
    const usageRecord = toRecord(usage);
    if (!usageRecord) return usage;
    const sanitized = {};
    // Cross-map Claude-style → OpenAI-style field names.
    // Some providers return input_tokens/output_tokens instead of prompt_tokens/completion_tokens.
    // Without this mapping, the whitelist filter below strips them, resulting in NaN/0 tokens (#617).
    if (usageRecord.input_tokens !== undefined && usageRecord.prompt_tokens === undefined) {
        usageRecord.prompt_tokens = usageRecord.input_tokens;
    }
    if (usageRecord.output_tokens !== undefined && usageRecord.completion_tokens === undefined) {
        usageRecord.completion_tokens = usageRecord.output_tokens;
    }
    for (const key of ALLOWED_USAGE_FIELDS){
        if (usageRecord[key] !== undefined) {
            sanitized[key] = usageRecord[key];
        }
    }
    // Ensure required fields
    const promptTokens = toNumber(sanitized.prompt_tokens) ?? 0;
    const completionTokens = toNumber(sanitized.completion_tokens) ?? 0;
    const totalTokens = toNumber(sanitized.total_tokens) ?? promptTokens + completionTokens;
    sanitized.prompt_tokens = promptTokens;
    sanitized.completion_tokens = completionTokens;
    sanitized.total_tokens = totalTokens;
    return sanitized;
}
function sanitizeResponsesUsage(usage) {
    const usageRecord = toRecord(usage);
    if (!usageRecord) return usage;
    const normalized = {
        ...usageRecord
    };
    if (normalized.prompt_tokens !== undefined && normalized.input_tokens === undefined) {
        normalized.input_tokens = normalized.prompt_tokens;
    }
    if (normalized.completion_tokens !== undefined && normalized.output_tokens === undefined) {
        normalized.output_tokens = normalized.completion_tokens;
    }
    if (normalized.prompt_tokens_details !== undefined && normalized.input_tokens_details === undefined) {
        normalized.input_tokens_details = normalized.prompt_tokens_details;
    }
    if (normalized.completion_tokens_details !== undefined && normalized.output_tokens_details === undefined) {
        normalized.output_tokens_details = normalized.completion_tokens_details;
    }
    const inputDetails = toRecord(normalized.input_tokens_details) || {};
    const cachedTokens = normalized.cached_tokens ?? normalized.cache_read_input_tokens;
    if (cachedTokens !== undefined && inputDetails.cached_tokens === undefined) {
        inputDetails.cached_tokens = cachedTokens;
    }
    if (normalized.cache_creation_input_tokens !== undefined && inputDetails.cache_creation_tokens === undefined) {
        inputDetails.cache_creation_tokens = normalized.cache_creation_input_tokens;
    }
    if (Object.keys(inputDetails).length > 0) {
        normalized.input_tokens_details = inputDetails;
    }
    const outputDetails = toRecord(normalized.output_tokens_details) || {};
    if (normalized.reasoning_tokens !== undefined && outputDetails.reasoning_tokens === undefined) {
        outputDetails.reasoning_tokens = normalized.reasoning_tokens;
    }
    if (Object.keys(outputDetails).length > 0) {
        normalized.output_tokens_details = outputDetails;
    }
    const sanitized = {};
    for (const key of ALLOWED_RESPONSES_USAGE_FIELDS){
        if (normalized[key] !== undefined) {
            sanitized[key] = normalized[key];
        }
    }
    const inputTokens = toNumber(sanitized.input_tokens) ?? 0;
    const outputTokens = toNumber(sanitized.output_tokens) ?? 0;
    const totalTokens = toNumber(sanitized.total_tokens) ?? inputTokens + outputTokens;
    sanitized.input_tokens = inputTokens;
    sanitized.output_tokens = outputTokens;
    sanitized.total_tokens = totalTokens;
    return sanitized;
}
/**
 * Normalize response ID to use chatcmpl- prefix.
 */ function normalizeResponseId(id) {
    if (!id || typeof id !== "string") {
        return `chatcmpl-${crypto.randomUUID().replace(/-/g, "").slice(0, 29)}`;
    }
    // Already correct format
    if (id.startsWith("chatcmpl-")) return id;
    // Keep custom IDs but don't break them
    return id;
}
function normalizeResponsesId(id) {
    if (!id || typeof id !== "string") {
        return `resp_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    }
    if (id.startsWith("resp_")) return id;
    return `resp_${id}`;
}
function isResponsesCommentaryMessageItem(item) {
    const itemRecord = toRecord(item);
    if (!itemRecord) return false;
    const type = toString(itemRecord.type) || "message";
    if (type !== "message") return false;
    const role = toString(itemRecord.role) || "assistant";
    const phase = toString(itemRecord.phase);
    return role === "assistant" && phase === "commentary";
}
function sanitizeResponsesStreamingOutputItem(item) {
    const itemRecord = toRecord(item);
    if (!itemRecord) return null;
    const type = toString(itemRecord.type) || "message";
    if (type === "message") {
        const role = toString(itemRecord.role) || "assistant";
        if (isResponsesCommentaryMessageItem(itemRecord)) {
            return null;
        }
        const content = sanitizeResponsesMessageContent(itemRecord.content).filter((part)=>{
            const partRecord = toRecord(part);
            const partPhase = partRecord ? toString(partRecord.phase) : undefined;
            return partPhase !== "commentary";
        });
        if (role === "assistant" && content.length === 0) {
            return null;
        }
        return {
            ...itemRecord,
            type: "message",
            role,
            content
        };
    }
    if (type === "reasoning") {
        const summary = Array.isArray(itemRecord.summary) ? itemRecord.summary.map((part)=>{
            const partRecord = toRecord(part);
            if (!partRecord) return null;
            return {
                ...partRecord,
                type: toString(partRecord.type) || "summary_text",
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(toString(partRecord.text) || ""))
            };
        }).filter((part)=>part !== null) : [];
        return {
            ...itemRecord,
            type: "reasoning",
            summary
        };
    }
    if (type === "function_call") {
        return {
            ...itemRecord,
            type: "function_call",
            arguments: stripZeroWidthToolArgumentJson(itemRecord.arguments)
        };
    }
    if (type === "function_call_output") {
        return {
            ...itemRecord,
            type: "function_call_output",
            output: typeof itemRecord.output === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(itemRecord.output)) : JSON.stringify(itemRecord.output ?? "")
        };
    }
    return {
        ...itemRecord
    };
}
function sanitizeResponsesStreamingOutput(output) {
    if (!Array.isArray(output)) return [];
    return output.map((item)=>sanitizeResponsesStreamingOutputItem(item)).filter((item)=>item !== null);
}
// Native Responses streaming events that carry raw model text directly on the
// root `delta` field. These must get the same zero-width-joiner stripping as the
// non-streaming path so agent words (opencode/cursor/aider) are not corrupted.
// Scoped as an allow-list on purpose: other root `delta` events may carry non-text payloads.
// Function-call argument events are handled separately by stripping only zero-width code points.
const RESPONSES_STREAMING_TEXT_DELTA_EVENTS = new Set([
    "response.output_text.delta",
    "response.reasoning_summary_text.delta",
    "response.reasoning_text.delta"
]);
// Matching `*.done` events that carry the finalized text on the root `text` field.
const RESPONSES_STREAMING_TEXT_DONE_EVENTS = new Set([
    "response.output_text.done",
    "response.reasoning_summary_text.done",
    "response.reasoning_text.done"
]);
function sanitizeResponsesStreamingEvent(parsedRecord) {
    const sanitized = {
        ...parsedRecord
    };
    const eventType = toString(parsedRecord.type) || "";
    // Root-level text events (output_text / reasoning_summary_text / reasoning_text)
    // carry the model text directly on the event, not under item/output. Strip ZWJ
    // there too. Only touch string values and only the allow-listed event types —
    // never function-call argument events.
    if (RESPONSES_STREAMING_TEXT_DELTA_EVENTS.has(eventType) && typeof sanitized.delta === "string") {
        sanitized.delta = stripZeroWidthText(sanitized.delta);
    }
    if (RESPONSES_STREAMING_TEXT_DONE_EVENTS.has(eventType) && typeof sanitized.text === "string") {
        sanitized.text = stripZeroWidthText(sanitized.text);
    }
    if (eventType === "response.function_call_arguments.delta" && typeof sanitized.delta === "string") {
        sanitized.delta = stripZeroWidthText(sanitized.delta);
    }
    if (eventType === "response.function_call_arguments.done" && typeof sanitized.arguments === "string") {
        sanitized.arguments = stripZeroWidthText(sanitized.arguments);
    }
    if (parsedRecord.item !== undefined) {
        const sanitizedItem = sanitizeResponsesStreamingOutputItem(parsedRecord.item);
        if (sanitizedItem) {
            sanitized.item = sanitizedItem;
        } else {
            delete sanitized.item;
            if (eventType === "response.output_item.added" || eventType === "response.output_item.done") {
                sanitized[OMIT_STREAMING_CHUNK_MARKER] = true;
            }
        }
    }
    if (Array.isArray(parsedRecord.output)) {
        const output = sanitizeResponsesStreamingOutput(parsedRecord.output);
        sanitized.output = output;
        const outputText = extractResponsesOutputText(output);
        if (outputText.length > 0) {
            sanitized.output_text = outputText;
        } else {
            delete sanitized.output_text;
        }
    }
    const responseRecord = toRecord(parsedRecord.response);
    if (responseRecord) {
        const responseOutput = Array.isArray(responseRecord.output) ? sanitizeResponsesStreamingOutput(responseRecord.output) : undefined;
        const sanitizedResponse = {
            ...responseRecord,
            ...responseOutput ? {
                output: responseOutput
            } : {}
        };
        const responseOutputText = responseOutput ? extractResponsesOutputText(responseOutput) : "";
        if (responseOutputText.length > 0) {
            sanitizedResponse.output_text = responseOutputText;
        } else {
            delete sanitizedResponse.output_text;
        }
        sanitized.response = sanitizedResponse;
    }
    return sanitized;
}
function sanitizeResponsesOutput(output) {
    if (!Array.isArray(output)) return [];
    return output.map((item, index)=>sanitizeResponsesOutputItem(item, index)).filter((item)=>item !== null);
}
function sanitizeResponsesOutputItem(item, index) {
    const itemRecord = toRecord(item);
    if (!itemRecord) return null;
    const type = toString(itemRecord.type) || "message";
    if (type === "message") {
        const content = sanitizeResponsesMessageContent(itemRecord.content);
        const sanitized = {
            id: toString(itemRecord.id) || `msg_${index}`,
            type: "message",
            role: toString(itemRecord.role) || "assistant",
            content
        };
        return sanitized;
    }
    if (type === "reasoning") {
        const summary = Array.isArray(itemRecord.summary) ? itemRecord.summary.map((part)=>{
            const partRecord = toRecord(part);
            if (!partRecord) return null;
            return {
                type: toString(partRecord.type) || "summary_text",
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(toString(partRecord.text) || "")
            };
        }).filter((part)=>part !== null) : [];
        return {
            id: toString(itemRecord.id) || `rs_${index}`,
            type: "reasoning",
            summary
        };
    }
    if (type === "function_call") {
        const callId = toString(itemRecord.call_id) || toString(itemRecord.id) || `call_${index}`;
        return {
            id: toString(itemRecord.id) || `fc_${callId}`,
            type: "function_call",
            call_id: callId,
            name: toString(itemRecord.name) || "",
            arguments: stripZeroWidthToolArgumentJson(itemRecord.arguments)
        };
    }
    if (type === "function_call_output") {
        return {
            id: toString(itemRecord.id) || `fco_${toString(itemRecord.call_id) || index}`,
            type: "function_call_output",
            call_id: toString(itemRecord.call_id) || "",
            output: itemRecord.output ?? ""
        };
    }
    return {
        ...itemRecord,
        type
    };
}
function sanitizeResponsesMessageContent(content) {
    if (typeof content === "string") {
        if (content.length === 0) return [];
        return [
            {
                type: "output_text",
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(content))),
                annotations: []
            }
        ];
    }
    if (!Array.isArray(content)) return [];
    return content.map((part)=>{
        const partRecord = toRecord(part);
        if (!partRecord) {
            if (typeof part === "string") {
                return {
                    type: "output_text",
                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(part))),
                    annotations: []
                };
            }
            return null;
        }
        const partType = toString(partRecord.type);
        if (partType === "output_text" || partType === "text" || (partType === undefined || partType === "") && typeof partRecord.text === "string") {
            return {
                ...partRecord,
                type: "output_text",
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(toString(partRecord.text) || ""))),
                annotations: Array.isArray(partRecord.annotations) ? partRecord.annotations : []
            };
        }
        return {
            ...partRecord
        };
    }).filter((part)=>part !== null);
}
function extractResponsesOutputText(output) {
    const parts = [];
    for (const item of output){
        if (item.type !== "message" || !Array.isArray(item.content)) continue;
        for (const part of item.content){
            const partRecord = toRecord(part);
            if (!partRecord) continue;
            if ((partRecord.type === "output_text" || partRecord.type === "text") && typeof partRecord.text === "string" && partRecord.text.length > 0) {
                parts.push(partRecord.text);
            }
        }
    }
    return parts.join("");
}
function convertOpenAIResponseToResponses(openaiResponse) {
    const responseId = normalizeResponsesId(openaiResponse.id);
    const createdAt = toNumber(openaiResponse.created) ?? Math.floor(Date.now() / 1000);
    const model = toString(openaiResponse.model) || "unknown";
    const choice = Array.isArray(openaiResponse.choices) ? toRecord(openaiResponse.choices[0]) ?? {} : {};
    const message = toRecord(choice.message) || {};
    const output = [];
    const reasoningContent = toString(message.reasoning_content) || (typeof message.reasoning === "string" ? message.reasoning : "");
    if (reasoningContent) {
        output.push({
            id: `rs_${responseId}_0`,
            type: "reasoning",
            summary: [
                {
                    type: "summary_text",
                    text: reasoningContent
                }
            ]
        });
    }
    const hasToolCalls = Array.isArray(message.tool_calls) && message.tool_calls.length > 0;
    const messageContent = sanitizeResponsesMessageContent(message.content);
    if (messageContent.length > 0 || !hasToolCalls && !reasoningContent) {
        output.push({
            id: `msg_${responseId}_0`,
            type: "message",
            role: toString(message.role) || "assistant",
            content: messageContent.length > 0 ? messageContent : [
                {
                    type: "output_text",
                    text: "",
                    annotations: []
                }
            ]
        });
    }
    const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : message.function_call ? [
        {
            id: toString(choice.id) || "call_0",
            type: "function",
            function: message.function_call
        }
    ] : [];
    for(let index = 0; index < toolCalls.length; index += 1){
        const toolCall = toRecord(toolCalls[index]) || {};
        const fn = toRecord(toolCall.function) || {};
        const callId = toString(toolCall.id) || `call_${index}`;
        output.push({
            id: `fc_${callId}`,
            type: "function_call",
            call_id: callId,
            name: toString(fn.name) || "",
            arguments: stripZeroWidthToolArgumentJson(fn.arguments)
        });
    }
    const sanitized = {
        id: responseId,
        object: "response",
        created_at: createdAt,
        model,
        status: "completed",
        background: false,
        error: null,
        output
    };
    const outputText = extractResponsesOutputText(output);
    if (outputText.length > 0) {
        sanitized.output_text = outputText;
    }
    if (openaiResponse.usage !== undefined) {
        sanitized.usage = sanitizeResponsesUsage(openaiResponse.usage);
    }
    return sanitized;
}
function sanitizeStreamingChunk(parsed) {
    const parsedRecord = toRecord(parsed);
    if (!parsedRecord) return parsed;
    const eventType = toString(parsedRecord.type) || "";
    if (eventType.startsWith("response.") || parsedRecord.object === "response") {
        return sanitizeResponsesStreamingEvent(parsedRecord);
    }
    // #8271: Anthropic-native streaming events (content_block_delta with
    // text_delta / thinking_delta) bypass the OpenAI choices[].delta.content
    // path below. Strip zero-width characters from their text payloads so
    // U+200D and friends don't leak to the client on the Messages API.
    if (eventType === "content_block_delta") {
        const deltaRecord = toRecord(parsedRecord.delta);
        if (deltaRecord) {
            if (typeof deltaRecord.text === "string") {
                deltaRecord.text = stripZeroWidthText(deltaRecord.text);
            }
            if (typeof deltaRecord.thinking === "string") {
                deltaRecord.thinking = stripZeroWidthText(deltaRecord.thinking);
            }
        }
        return parsedRecord;
    }
    // Build sanitized chunk
    const sanitized = {};
    // Keep only standard fields — normalize id to string to avoid AI_InvalidResponseDataError
    if (parsedRecord.id !== undefined && parsedRecord.id !== null) {
        sanitized.id = normalizeResponseId(typeof parsedRecord.id === "string" ? parsedRecord.id : String(parsedRecord.id));
    }
    sanitized.object = toString(parsedRecord.object) || "chat.completion.chunk";
    if (parsedRecord.created !== undefined) sanitized.created = parsedRecord.created;
    if (parsedRecord.model !== undefined) sanitized.model = parsedRecord.model;
    // Sanitize choices with delta
    if (Array.isArray(parsedRecord.choices)) {
        sanitized.choices = parsedRecord.choices.map((choice)=>{
            const c = {
                index: 0
            };
            const choiceRecord = toRecord(choice);
            if (!choiceRecord) return c;
            c.index = toNumber(choiceRecord.index) ?? 0;
            if (choiceRecord.delta !== undefined) {
                const deltaRecord = toRecord(choiceRecord.delta);
                if (deltaRecord) {
                    const delta = {};
                    if (deltaRecord.role !== undefined) delta.role = deltaRecord.role;
                    if (deltaRecord.content !== undefined) {
                        delta.content = typeof deltaRecord.content === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(deltaRecord.content)) : deltaRecord.content;
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["copyOpenAICompatibleReasoningFields"])(deltaRecord, delta);
                    // Parity with the non-streaming path: strip the zero-width joiners that the
                    // request side injects into agent words. copyOpenAICompatibleReasoningFields
                    // is shared, so strip locally on the fields it writes (string values only).
                    for (const reasoningKey of [
                        "reasoning_content",
                        "reasoning",
                        "reasoning_text"
                    ]){
                        if (typeof delta[reasoningKey] === "string") {
                            delta[reasoningKey] = stripZeroWidthText(delta[reasoningKey]);
                        }
                    }
                    if (deltaRecord.tool_calls !== undefined) {
                        delta.tool_calls = Array.isArray(deltaRecord.tool_calls) ? deltaRecord.tool_calls.map((tc)=>{
                            const t = toRecord(tc);
                            if (!t) return tc;
                            const strippedToolCall = stripZeroWidthToolCallArguments(t);
                            const strippedRecord = toRecord(strippedToolCall) || t;
                            if (t.id !== undefined && t.id !== null && typeof t.id !== "string") {
                                return {
                                    ...strippedRecord,
                                    id: String(t.id)
                                };
                            }
                            return strippedRecord;
                        }) : deltaRecord.tool_calls;
                    }
                    if (deltaRecord.function_call !== undefined) delta.function_call = stripZeroWidthFunctionArguments(deltaRecord.function_call);
                    c.delta = delta;
                } else {
                    c.delta = choiceRecord.delta;
                }
            }
            if (choiceRecord.finish_reason !== undefined) {
                c.finish_reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReason"])(choiceRecord.finish_reason);
            }
            if (choiceRecord.logprobs !== undefined) c.logprobs = choiceRecord.logprobs;
            return c;
        });
    }
    // Sanitize usage if present
    if (parsedRecord.usage !== undefined) {
        sanitized.usage = sanitizeUsage(parsedRecord.usage);
    }
    // Keep system_fingerprint if present
    if (parsedRecord.system_fingerprint) {
        sanitized.system_fingerprint = parsedRecord.system_fingerprint;
    }
    return sanitized;
}
}),
"[project]/open-sse/shared/zedAuth.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ZED_CLOUD_BASE_URL",
    ()=>ZED_CLOUD_BASE_URL,
    "ZED_HEADERS",
    ()=>ZED_HEADERS,
    "ZED_LLM_BASE_URL",
    ()=>ZED_LLM_BASE_URL,
    "ZED_WEB_BASE_URL",
    ()=>ZED_WEB_BASE_URL,
    "buildZedUserAuthHeader",
    ()=>buildZedUserAuthHeader,
    "clearZedCaches",
    ()=>clearZedCaches,
    "createZedNativeAuthData",
    ()=>createZedNativeAuthData,
    "decodeZedPrivateKeyVerifier",
    ()=>decodeZedPrivateKeyVerifier,
    "decryptZedAccessToken",
    ()=>decryptZedAccessToken,
    "encodeZedPrivateKeyVerifier",
    ()=>encodeZedPrivateKeyVerifier,
    "fetchZedAuthenticatedUser",
    ()=>fetchZedAuthenticatedUser,
    "fetchZedLlmToken",
    ()=>fetchZedLlmToken,
    "mapZedModel",
    ()=>mapZedModel,
    "parseZedCallbackPayload",
    ()=>parseZedCallbackPayload,
    "resolveZedModels",
    ()=>resolveZedModels,
    "resolveZedOrganizationId",
    ()=>resolveZedOrganizationId,
    "shouldRefreshZedLlmToken",
    ()=>shouldRefreshZedLlmToken,
    "zedLlmFetch",
    ()=>zedLlmFetch
]);
/**
 * Zed Hosted Models — auth + model-catalog helpers.
 *
 * Zed's cloud aggregator (cloud.zed.dev) authenticates native apps with a
 * self-generated RSA keypair instead of a registered OAuth client_id/secret:
 *
 *   1. The client (OmniRoute) generates an ephemeral RSA keypair.
 *   2. It sends the public key to zed.dev/native_app_signin (as a URL param).
 *   3. The user signs in inside their browser (Zed itself brokers GitHub/Google).
 *   4. Zed's browser flow redirects to a local "native app" callback
 *      (`http://127.0.0.1:<port>/?user_id=...&access_token=...`) with the
 *      access token RSA-encrypted against the public key we sent in step 2.
 *   5. OmniRoute decrypts the access token locally with the private key that
 *      never left the server (or the operator's browser/paste flow).
 *
 * No client_id/client_secret/Firebase key is embedded anywhere in this file —
 * the "credential" is a keypair generated fresh per login attempt, so
 * CLAUDE.md Hard Rule #11 (resolvePublicCred for embedded upstream secrets)
 * does not apply here.
 *
 * Ported from decolua/9router PR #2328 (open-sse/shared/zedAuth.js),
 * adapted to TypeScript + OmniRoute conventions. `fetch` is intentionally the
 * global one — open-sse/utils/proxyFetch.ts monkey-patches `globalThis.fetch`
 * with the proxy-aware dispatcher at module load, so every plain `fetch()`
 * call in this codebase already goes through it.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const ZED_WEB_BASE_URL = "https://zed.dev";
const ZED_CLOUD_BASE_URL = "https://cloud.zed.dev";
const ZED_LLM_BASE_URL = "https://cloud.zed.dev";
const ZED_HEADERS = {
    expiredToken: "x-zed-expired-token",
    outdatedToken: "[REDIGIDO-PRESERVACAO]",
    clientSupportsStatus: "x-zed-client-supports-status-messages",
    clientSupportsStreamEnded: "x-zed-client-supports-stream-ended-request-completion-status",
    serverSupportsStatus: "x-zed-server-supports-status-messages",
    clientSupportsXai: "x-zed-client-supports-x-ai",
    systemId: "x-zed-system-id"
};
const PRIVATE_KEY_PREFIX = "zed-rsa-pkcs1:";
const LLM_TOKEN_TTL_MS = 50 * 60 * 1000;
const MODEL_CACHE_TTL_MS = 60 * 60 * 1000;
const llmTokenCache = new Map();
const modelCache = new Map();
const modelInflight = new Map();
function b64url(value) {
    return Buffer.from(value).toString("base64url");
}
function b64urlPadded(value) {
    return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromB64url(value) {
    return Buffer.from(String(value || ""), "base64url").toString("utf8");
}
function normalizeBaseUrl(baseUrl, fallback) {
    return String(baseUrl || fallback).replace(/\/+$/, "");
}
function zedUrl(config, key, path, fallbackBase) {
    const base = normalizeBaseUrl(config?.[key], fallbackBase);
    return `${base}${path}`;
}
function encodeZedPrivateKeyVerifier(privateKeyPem) {
    return `${PRIVATE_KEY_PREFIX}${b64url(privateKeyPem)}`;
}
function decodeZedPrivateKeyVerifier(verifier) {
    const value = String(verifier || "");
    if (!value.startsWith(PRIVATE_KEY_PREFIX)) {
        throw new Error("Missing Zed private key verifier; restart the login flow");
    }
    return fromB64url(value.slice(PRIVATE_KEY_PREFIX.length));
}
function createZedNativeAuthData(config = {}, options = {}) {
    const { publicKey, privateKey } = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "pkcs1",
            format: "der"
        },
        privateKeyEncoding: {
            type: "pkcs1",
            format: "pem"
        }
    });
    const nativeAppPort = Number(options.nativeAppPort || config.defaultNativeAppPort || 58443);
    const systemId = options.systemId || __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID();
    const publicKeyString = b64urlPadded(publicKey);
    const signInUrl = new URL(`${normalizeBaseUrl(config.webBaseUrl, ZED_WEB_BASE_URL)}/native_app_signin`);
    signInUrl.searchParams.set("native_app_port", String(nativeAppPort));
    signInUrl.searchParams.set("native_app_public_key", publicKeyString);
    if (systemId) signInUrl.searchParams.set("system_id", systemId);
    return {
        authUrl: signInUrl.toString(),
        privateKeyVerifier: encodeZedPrivateKeyVerifier(privateKey),
        nativeAppPort,
        systemId,
        publicKey: publicKeyString
    };
}
function parseZedCallbackPayload(input) {
    const raw = String(input || "").trim();
    if (!raw) throw new Error("Missing Zed callback URL");
    let data = {};
    try {
        data = JSON.parse(raw);
    } catch  {
        let url;
        try {
            url = new URL(raw);
        } catch  {
            try {
                url = new URL(`http://127.0.0.1/?${raw.replace(/^\?/, "")}`);
            } catch  {
                throw new Error("Invalid Zed callback URL");
            }
        }
        url.searchParams.forEach((value, key)=>{
            data[key] = value;
        });
    }
    const userId = data.user_id || data.userId;
    const encryptedAccessToken = data.access_token || data.accessToken || data.token;
    if (!userId || !encryptedAccessToken) {
        throw new Error("Zed callback must include user_id and access_token");
    }
    return {
        userId: String(userId),
        encryptedAccessToken: String(encryptedAccessToken)
    };
}
function decryptZedAccessToken(encryptedAccessToken, privateKeyVerifier) {
    const privateKey = decodeZedPrivateKeyVerifier(privateKeyVerifier);
    const encrypted = Buffer.from(String(encryptedAccessToken), "base64url");
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].privateDecrypt({
            key: privateKey,
            padding: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
        }, encrypted).toString("utf8");
    } catch (oaepError) {
        try {
            return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].privateDecrypt({
                key: privateKey,
                padding: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].constants.RSA_PKCS1_PADDING
            }, encrypted).toString("utf8");
        } catch  {
            const message = oaepError instanceof Error ? oaepError.message : String(oaepError);
            throw new Error(`Failed to decrypt Zed access token: ${message}`);
        }
    }
}
function buildZedUserAuthHeader(credentials) {
    const psd = credentials?.providerSpecificData || {};
    const userId = psd.userId || credentials?.userId;
    const accessToken = credentials?.accessToken || credentials?.apiKey;
    if (!userId || !accessToken) {
        throw new Error("Zed credential is missing userId or accessToken");
    }
    return `${userId} ${accessToken}`;
}
function getSystemId(credentials) {
    return String(credentials?.providerSpecificData?.systemId || credentials?.systemId || "");
}
async function fetchJson(url, options) {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch  {
            data = {
                raw: text
            };
        }
    }
    if (!res.ok) {
        const message = data?.message || data?.error?.message || data?.error || text || `HTTP ${res.status}`;
        const err = new Error(String(message));
        err.status = res.status;
        err.body = data;
        throw err;
    }
    return data;
}
async function fetchZedAuthenticatedUser(credentials, options = {}) {
    const config = options.config || {};
    const headers = {
        Accept: "application/json",
        Authorization: buildZedUserAuthHeader(credentials)
    };
    const systemId = getSystemId(credentials);
    if (systemId) headers[ZED_HEADERS.systemId] = systemId;
    return fetchJson(zedUrl(config, "cloudBaseUrl", "/client/users/me", ZED_CLOUD_BASE_URL), {
        method: "GET",
        headers,
        signal: options.signal ?? undefined
    });
}
function normalizeOrganizationId(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value !== null) {
        const rec = value;
        if (typeof rec[0] === "string") return rec[0];
        if (typeof rec.id === "string") return rec.id;
    }
    return String(value);
}
function resolveZedOrganizationId(credentials, userInfo = null) {
    const psd = credentials?.providerSpecificData || {};
    const explicit = normalizeOrganizationId(psd.organizationId || psd.defaultOrganizationId);
    if (explicit) return explicit;
    const fromUser = normalizeOrganizationId(userInfo?.default_organization_id || userInfo?.defaultOrganizationId);
    if (fromUser) return fromUser;
    const org = (userInfo?.organizations || []).find((item)=>item?.is_personal) || userInfo?.organizations?.[0];
    return normalizeOrganizationId(org?.id);
}
function zedUserCacheKey(credentials, organizationId) {
    const psd = credentials?.providerSpecificData || {};
    const userId = psd.userId || credentials.userId || "unknown";
    const token = credentials?.accessToken || credentials?.apiKey || "";
    return `${userId}:${organizationId || "default"}:${token.slice(-16)}`;
}
function zedModelCacheKey(credentials) {
    const psd = credentials?.providerSpecificData || {};
    const org = psd.organizationId || psd.defaultOrganizationId || "default";
    const token = credentials?.accessToken || credentials?.apiKey || "";
    return `${psd.userId || "unknown"}:${org}:${token.slice(-16)}`;
}
async function fetchZedLlmToken(credentials, options = {}) {
    const config = options.config || {};
    let organizationId = options.organizationId || resolveZedOrganizationId(credentials);
    if (!organizationId) {
        const userInfo = await fetchZedAuthenticatedUser(credentials, options);
        organizationId = resolveZedOrganizationId(credentials, userInfo);
    }
    if (!organizationId) throw new Error("No Zed organization selected");
    const cacheKey = zedUserCacheKey(credentials, organizationId);
    const cached = llmTokenCache.get(cacheKey);
    if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) return cached.token;
    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: buildZedUserAuthHeader(credentials)
    };
    const systemId = getSystemId(credentials);
    if (systemId) headers[ZED_HEADERS.systemId] = systemId;
    const data = await fetchJson(zedUrl(config, "cloudBaseUrl", "/client/llm_tokens", ZED_CLOUD_BASE_URL), {
        method: "POST",
        headers,
        body: JSON.stringify({
            organization_id: organizationId
        }),
        signal: options.signal ?? undefined
    });
    const token = typeof data?.token === "string" ? data.token : data?.token?.[0] || data?.token?.value;
    if (!token) throw new Error("Zed did not return an LLM token");
    llmTokenCache.set(cacheKey, {
        token,
        expiresAt: Date.now() + LLM_TOKEN_TTL_MS
    });
    return token;
}
function shouldRefreshZedLlmToken(response) {
    return response?.status === 401 || !!response?.headers?.has?.(ZED_HEADERS.expiredToken) || !!response?.headers?.has?.(ZED_HEADERS.outdatedToken);
}
async function zedLlmFetch(credentials, path, options = {}) {
    const config = options.config || {};
    const url = zedUrl(config, "llmBaseUrl", path, ZED_LLM_BASE_URL);
    const buildRequest = async (forceRefresh)=>{
        const token = await fetchZedLlmToken(credentials, {
            ...options,
            forceRefresh
        });
        return fetch(url, {
            ...options.fetchOptions,
            headers: {
                ...options.fetchOptions?.headers || {},
                Authorization: `Bearer ${token}`
            },
            signal: options.signal ?? undefined
        });
    };
    let response = await buildRequest(false);
    if (shouldRefreshZedLlmToken(response)) {
        response = await buildRequest(true);
    }
    return response;
}
function normalizeZedModelId(id) {
    if (!id) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object" && id !== null) {
        const rec = id;
        if (typeof rec[0] === "string") return rec[0];
        if (typeof rec.id === "string") return rec.id;
    }
    return String(id);
}
function mapZedModel(model) {
    const id = normalizeZedModelId(model?.id);
    if (!id) return null;
    return {
        id,
        name: model.display_name || model.displayName || id,
        provider: model.provider,
        isLatest: !!model.is_latest,
        contextLength: model.max_token_count ?? model.maxTokenCount,
        contextLengthInMaxMode: model.max_token_count_in_max_mode ?? model.maxTokenCountInMaxMode,
        maxOutputTokens: model.max_output_tokens ?? model.maxOutputTokens,
        supportsTools: !!model.supports_tools,
        supportsImages: !!model.supports_images,
        supportsThinking: !!model.supports_thinking,
        supportsDisablingThinking: !!model.supports_disabling_thinking,
        supportsFastMode: !!model.supports_fast_mode,
        supportsServerSideCompaction: !!model.supports_server_side_compaction,
        supportedEffortLevels: model.supported_effort_levels ?? model.supportedEffortLevels ?? [],
        supportsStreamingTools: !!model.supports_streaming_tools,
        supportsParallelToolCalls: !!model.supports_parallel_tool_calls,
        isDisabled: !!model.is_disabled,
        disabledReason: model.disabled_reason ?? null
    };
}
async function resolveZedModels(credentials, options = {}) {
    if (!credentials?.accessToken) return null;
    const key = zedModelCacheKey(credentials);
    const cached = modelCache.get(key);
    if (!options.forceRefresh && cached && cached.expiresAt > Date.now()) return cached;
    const existing = modelInflight.get(key);
    if (existing && !options.forceRefresh) return existing;
    const promise = (async ()=>{
        const response = await zedLlmFetch(credentials, "/models", {
            ...options,
            fetchOptions: {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    [ZED_HEADERS.clientSupportsXai]: "true"
                }
            }
        });
        if (!response.ok) {
            const text = await response.text().catch(()=>"");
            throw new Error(`Zed models failed: ${response.status} ${text}`);
        }
        const data = await response.json();
        const rawModels = Array.isArray(data?.models) ? data.models : [];
        const models = rawModels.map(mapZedModel).filter((m)=>!!m).filter((model)=>!model.isDisabled);
        const rawById = new Map();
        for (const raw of rawModels){
            const id = normalizeZedModelId(raw?.id);
            if (id) rawById.set(id, raw);
        }
        const entry = {
            expiresAt: Date.now() + MODEL_CACHE_TTL_MS,
            models,
            rawModels,
            rawById,
            defaultModel: normalizeZedModelId(data?.default_model ?? data?.defaultModel),
            defaultFastModel: normalizeZedModelId(data?.default_fast_model ?? data?.defaultFastModel),
            recommendedModels: (data?.recommended_models || data?.recommendedModels || []).map(normalizeZedModelId).filter(Boolean)
        };
        modelCache.set(key, entry);
        return entry;
    })();
    modelInflight.set(key, promise);
    try {
        return await promise;
    } finally{
        if (modelInflight.get(key) === promise) modelInflight.delete(key);
    }
}
function clearZedCaches() {
    llmTokenCache.clear();
    modelCache.clear();
    modelInflight.clear();
}
}),
"[project]/open-sse/lib/deepseek-pow-solver.cjs [middleware] (ecmascript)", ((__turbopack_context__, module, exports) => {

const r = (id)=>{
    if (id === 46743) return {
        Buffer
    };
    return {};
};
const t = {}, e = {};
"use strict";
let n, i;
r(42551), r(40966), r(70968), r(76966), r(35399), r(36279), r(87801), r(16389), r(36073), r(27448), r(10681), r(32014), r(46596), r(39008), r(71), r(85540);
var o = r(46743), f = Object.create, u = Object.defineProperty, s = Object.getOwnPropertyDescriptor, a = Object.getOwnPropertyNames, c = Object.getPrototypeOf, h = Object.prototype.hasOwnProperty, l = (t, e, r)=>(r = null != t ? f(c(t)) : {}, ((t, e, r, n)=>{
        if (e && "object" == typeof e || "function" == typeof e) for (let i of a(e))h.call(t, i) || i === r || u(t, i, {
            get: ()=>e[i],
            enumerable: !(n = s(e, i)) || n.enumerable
        });
        return t;
    })(!e && t && t.__esModule ? r : u(r, "default", {
        value: t,
        enumerable: !0
    }), t)), p = (n = (t, e)=>{
    e.exports = (t, e)=>(r, n)=>{
            let i = 2 * n, o = 2 * e;
            r[i] = t[o], r[i + 1] = t[o + 1];
        };
}, ()=>(i || n((i = {
        exports: {}
    }).exports, i), i.exports)), g = l(p()), y = (t)=>{
    let { A: e, C: r } = t;
    for(let t = 0; t < 25; t += 5){
        for(let n = 0; n < 5; n++)(0, g.default)(e, t + n)(r, n);
        for(let n = 0; n < 5; n++){
            let i = (t + n) * 2, o = (n + 1) % 5 * 2, f = (n + 2) % 5 * 2;
            e[i] ^= ~r[o] & r[f], e[i + 1] ^= ~r[o + 1] & r[f + 1];
        }
    }
}, d = new Uint32Array([
    0,
    1,
    0,
    32898,
    0x80000000,
    32906,
    0x80000000,
    0x80008000,
    0,
    32907,
    0,
    0x80000001,
    0x80000000,
    0x80008081,
    0x80000000,
    32777,
    0,
    138,
    0,
    136,
    0,
    0x80008009,
    0,
    0x8000000a,
    0,
    0x8000808b,
    0x80000000,
    139,
    0x80000000,
    32905,
    0x80000000,
    32771,
    0x80000000,
    32770,
    0x80000000,
    128,
    0,
    32778,
    0x80000000,
    0x8000000a,
    0x80000000,
    0x80008081,
    0x80000000,
    32896,
    0,
    0x80000001,
    0x80000000,
    0x80008008
]), b = (t)=>{
    let { A: e, I: r } = t, n = 2 * r;
    e[0] ^= d[n], e[1] ^= d[n + 1];
}, v = [
    10,
    7,
    11,
    17,
    18,
    3,
    5,
    16,
    8,
    21,
    24,
    4,
    15,
    23,
    19,
    13,
    12,
    2,
    20,
    14,
    22,
    9,
    6,
    1
], w = [
    1,
    3,
    6,
    10,
    15,
    21,
    28,
    36,
    45,
    55,
    2,
    14,
    27,
    41,
    56,
    8,
    25,
    43,
    62,
    18,
    39,
    61,
    20,
    44
], x = l(p()), E = (t)=>{
    let { A: e, C: r, W: n } = t, i = 0;
    (0, x.default)(e, i + 1)(n, i);
    let o = 0, f = 0, u = 0, s = 32;
    for(; i < 24; i++){
        let t = v[i], a = w[i];
        (0, x.default)(e, t)(r, 0), o = n[0], f = n[1], s = 32 - a, n[u = a < 32 ? 0 : 1] = o << a | f >>> s, n[(u + 1) % 2] = f << a | o >>> s, (0, x.default)(n, 0)(e, t), (0, x.default)(r, 0)(n, 0);
    }
}, m = l(p()), B = (t)=>{
    let { A: e, C: r, D: n, W: i } = t, o = 0, f = 0;
    for(let t = 0; t < 5; t++){
        let n = 2 * t, i = (t + 5) * 2, o = (t + 10) * 2, f = (t + 15) * 2, u = (t + 20) * 2;
        r[n] = e[n] ^ e[i] ^ e[o] ^ e[f] ^ e[u], r[n + 1] = e[n + 1] ^ e[i + 1] ^ e[o + 1] ^ e[f + 1] ^ e[u + 1];
    }
    for(let t = 0; t < 5; t++){
        (0, m.default)(r, (t + 1) % 5)(i, 0), o = i[0], f = i[1], i[0] = o << 1 | f >>> 31, i[1] = f << 1 | o >>> 31, n[2 * t] = r[(t + 4) % 5 * 2] ^ i[0], n[2 * t + 1] = r[(t + 4) % 5 * 2 + 1] ^ i[1];
        for(let r = 0; r < 25; r += 5)e[(r + t) * 2] ^= n[2 * t], e[(r + t) * 2 + 1] ^= n[2 * t + 1];
    }
}, I = (t, e)=>{
    for(let r = 0; r < t.length; r += 8){
        let n = r / 4;
        e[n] ^= t[r + 7] << 24 | t[r + 6] << 16 | t[r + 5] << 8 | t[r + 4], e[n + 1] ^= t[r + 3] << 24 | t[r + 2] << 16 | t[r + 1] << 8 | t[r];
    }
    return e;
}, A = (t, e)=>{
    for(let r = 0; r < e.length; r += 8){
        let n = r / 4;
        e[r] = t[n + 1], e[r + 1] = t[n + 1] >>> 8, e[r + 2] = t[n + 1] >>> 16, e[r + 3] = t[n + 1] >>> 24, e[r + 4] = t[n], e[r + 5] = t[n] >>> 8, e[r + 6] = t[n] >>> 16, e[r + 7] = t[n] >>> 24;
    }
    return e;
}, U = function(t) {
    let e, r, n, { capacity: i, padding: f } = t, u = i / 8, s = 200 - i / 4, a = {
        keccak: (e = new Uint32Array(10), r = new Uint32Array(10), n = new Uint32Array(2), (t)=>{
            for(let i = 1; i < 24; i++)B({
                A: t,
                C: e,
                D: r,
                W: n
            }), E({
                A: t,
                C: e,
                W: n
            }), y({
                A: t,
                C: e
            }), b({
                A: t,
                I: i
            });
            e.fill(0), r.fill(0), n.fill(0);
        }),
        state: new Uint32Array(50),
        queue: o.Buffer.allocUnsafe(s),
        queueOffset: 0
    };
    return this.getState = ()=>a, this.setState = (t)=>{
        a.keccak = t.keccak, a.state.set(t.state.slice()), t.queue.copy(a.queue), a.queueOffset = t.queueOffset;
    }, this.absorb = (t)=>{
        for(let e = 0; e < t.length; e++)a.queue[a.queueOffset] = t[e], a.queueOffset += 1, a.queueOffset >= s && (I(a.queue, a.state), a.keccak(a.state), a.queueOffset = 0);
        return this;
    }, this.squeeze = (t)=>{
        let e = {
            buffer: o.Buffer.allocUnsafe(u),
            padding: t,
            queue: o.Buffer.allocUnsafe(a.queue.length),
            state: new Uint32Array(a.state.length)
        };
        a.queue.copy(e.queue);
        for(let t = 0; t < a.state.length; t++)e.state[t] = a.state[t];
        e.queue.fill(0, a.queueOffset), e.queue[a.queueOffset] |= e.padding, e.queue[s - 1] |= 128, I(e.queue, e.state);
        for(let t = 0; t < e.buffer.length; t += s)a.keccak(e.state), A(e.state, e.buffer.slice(t, t + s));
        return e.buffer;
    }, this.reset = ()=>(a.queue.fill(0), a.state.fill(0), a.queueOffset = 0, this), this.copy = ()=>{
        let t = new U({
            capacity: i,
            padding: f
        });
        return t.setState(this.getState()), t;
    }, this;
}; /* #2724: guard Web Worker handler — Node.js require() loads this CJS in strict mode where bare `onmessage = ...` throws ReferenceError */ 
typeof self !== "undefined" && typeof postMessage !== "undefined" && (globalThis.onmessage = (t)=>{
    if ("pow-challenge" !== t.data.type) return;
    let { algorithm: e, challenge: r, salt: n, difficulty: i, signature: f, expireAt: u } = t.data.challenge;
    try {
        let t = ((t, e, r, n, i)=>{
            if ("DeepSeekHashV1" !== t) throw Error("Unsupported algorithm: " + t);
            let f = "".concat(r, "_").concat(i, "_"), u = function(t, e, r) {
                if (t.length % 2 != 0) throw RangeError("c.length");
                if (r <= 0 || !Number.isSafeInteger(r)) throw RangeError("d");
                for(var n = (function t() {
                    var e = this;
                    return this && this.constructor === t ? (this._sponge = new U({
                        capacity: 256
                    }), this.update = (t)=>{
                        if ("string" == typeof t) return this._sponge.absorb(o.Buffer.from(t, "utf8")), this;
                        throw TypeError("input not a string");
                    }, this.digest = function() {
                        let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "hex";
                        return e._sponge.squeeze(6).toString(t);
                    }, this.copy = ()=>{
                        let e = new t;
                        return e._sponge = this._sponge.copy(), e;
                    }, this) : new t;
                })(256).update(e), i = 0; i < r; i++)if (n.copy().update(String(i)).digest("hex") === t) return i;
                return null;
            }(e, f, n);
            if ("number" != typeof u) throw Error("No solution found: " + "algorithm: ".concat(t, ", ") + "challenge: ".concat(e, ", ") + "difficulty: ".concat(n, ", ") + "prefix: ".concat(f));
            return u;
        })(e, r, n, i, u);
        postMessage({
            type: "pow-answer",
            answer: {
                algorithm: e,
                challenge: r,
                salt: n,
                answer: t,
                signature: f
            }
        });
    } catch (t) {
        t instanceof Error ? postMessage({
            type: "pow-error",
            error: t
        }) : postMessage({
            type: "pow-error",
            error: Error("Unknown error", {
                cause: t
            })
        });
    }
});
module.exports = {
    U
};
}),
"[project]/open-sse/lib/deepseek-pow.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "solveDeepSeekPow",
    ()=>solveDeepSeekPow,
    "solveDeepSeekPowAsync",
    ()=>solveDeepSeekPowAsync
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:module [external] (node:module, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("open-sse/lib/deepseek-pow.ts")}`;
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
;
;
// ── WASM solver (fast — ~50-100ms at difficulty 144000) ──────────────────
class DeepSeekHashWasm {
    wasmInstance;
    offset = 0;
    cachedUint8Memory = null;
    cachedTextEncoder = new TextEncoder();
    getCachedUint8Memory() {
        if (!this.cachedUint8Memory?.byteLength) {
            this.cachedUint8Memory = new Uint8Array(this.wasmInstance.memory.buffer);
        }
        return this.cachedUint8Memory;
    }
    encodeString(text, allocate, reallocate) {
        const strLength = text.length;
        let ptr = allocate(strLength, 1) >>> 0;
        const memory = this.getCachedUint8Memory();
        let asciiLength = 0;
        for(; asciiLength < strLength; asciiLength++){
            if (text.charCodeAt(asciiLength) > 127) break;
            memory[ptr + asciiLength] = text.charCodeAt(asciiLength);
        }
        if (asciiLength !== strLength) {
            if (asciiLength > 0) text = text.slice(asciiLength);
            ptr = reallocate(ptr, strLength, asciiLength + text.length * 3, 1) >>> 0;
            const result = this.cachedTextEncoder.encodeInto(text, this.getCachedUint8Memory().subarray(ptr + asciiLength, ptr + asciiLength + text.length * 3));
            asciiLength += result.written;
            ptr = reallocate(ptr, asciiLength + text.length * 3, asciiLength, 1) >>> 0;
        }
        this.offset = asciiLength;
        return ptr;
    }
    calculateHash(challenge, prefix, difficulty) {
        try {
            const retptr = this.wasmInstance.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = this.encodeString(challenge, this.wasmInstance.__wbindgen_export_0, this.wasmInstance.__wbindgen_export_1);
            const len0 = this.offset;
            const ptr1 = this.encodeString(prefix, this.wasmInstance.__wbindgen_export_0, this.wasmInstance.__wbindgen_export_1);
            const len1 = this.offset;
            this.wasmInstance.wasm_solve(retptr, ptr0, len0, ptr1, len1, difficulty);
            const dv = new DataView(this.wasmInstance.memory.buffer);
            const status = dv.getInt32(retptr + 0, true);
            const value = dv.getFloat64(retptr + 8, true);
            return status === 0 ? undefined : value;
        } finally{
            this.wasmInstance.__wbindgen_add_to_stack_pointer(16);
        }
    }
    async init(wasmPath) {
        const wasmBuffer = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].promises.readFile(wasmPath);
        const { instance } = await WebAssembly.instantiate(wasmBuffer, {
            wbg: {}
        });
        this.wasmInstance = instance.exports;
    }
}
let _wasmSolver = null;
let _wasmInitFailed = false;
async function getWasmSolver() {
    if (_wasmInitFailed) return null;
    if (_wasmSolver) return _wasmSolver;
    try {
        const solver = new DeepSeekHashWasm();
        const wasmPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["fileURLToPath"])(__TURBOPACK__import$2e$meta__.url)), "sha3_wasm_bg.wasm");
        await solver.init(wasmPath);
        _wasmSolver = solver;
        return solver;
    } catch  {
        _wasmInitFailed = true;
        return null;
    }
}
// ── JS fallback solver (slow — ~5-6s at difficulty 144000) ───────────────
const require = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$module__$5b$external$5d$__$28$node$3a$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
let _U;
function loadU() {
    if (_U === undefined) {
        _U = __turbopack_context__.r("[project]/open-sse/lib/deepseek-pow-solver.cjs [middleware] (ecmascript)").U;
    }
    return _U;
}
function solveWithJS(challenge, prefix, difficulty) {
    const U = loadU();
    const createHash = ()=>{
        const self = {};
        self._sponge = new U({
            capacity: 256,
            padding: 6
        });
        self.update = (s)=>{
            self._sponge.absorb(Buffer.from(s, "utf8"));
            return self;
        };
        self.digest = (fmt)=>{
            return self._sponge.squeeze(6).toString(fmt || "hex");
        };
        self.copy = ()=>{
            const c = {};
            c._sponge = self._sponge.copy();
            c.update = (s)=>{
                c._sponge.absorb(Buffer.from(s, "utf8"));
                return c;
            };
            c.digest = (fmt)=>{
                return c._sponge.squeeze(6).toString(fmt || "hex");
            };
            return c;
        };
        return self;
    };
    const h = createHash();
    h.update(prefix);
    for(let nonce = 0; nonce < difficulty; nonce++){
        if (h.copy().update(String(nonce)).digest("hex") === challenge) {
            return nonce;
        }
    }
    return -1;
}
async function solveDeepSeekPowAsync(algorithm, challenge, salt, difficulty, expireAt) {
    if (algorithm !== "DeepSeekHashV1") throw new Error(`Unsupported: ${algorithm}`);
    const prefix = `${salt}_${expireAt}_`;
    const wasm = await getWasmSolver();
    if (wasm) {
        const answer = wasm.calculateHash(challenge, prefix, difficulty);
        if (answer === undefined) return -1;
        return answer;
    }
    return solveWithJS(challenge, prefix, difficulty);
}
function solveDeepSeekPow(algorithm, challenge, salt, difficulty, expireAt) {
    if (algorithm !== "DeepSeekHashV1") throw new Error(`Unsupported: ${algorithm}`);
    const prefix = `${salt}_${expireAt}_`;
    return solveWithJS(challenge, prefix, difficulty);
}
}),
];

//# sourceMappingURL=open-sse_0i23iun._.js.map
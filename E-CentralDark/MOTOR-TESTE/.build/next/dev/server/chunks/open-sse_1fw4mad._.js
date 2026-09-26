module.exports = [
"[project]/open-sse/config/codexInstructions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [app-route] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(usage) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(usage) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getReasoningTokens"])(usage);
}
/** Resolves the model-level `timeoutMs` registry override, when both
 *  `provider` and `model` are known and the model registers one (#6354). */ function resolveModelTimeoutOverride(provider, model) {
    if (!provider || !model) return undefined;
    const override = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getModelTimeoutMs"])(provider, model);
    if (typeof override !== "number" || !Number.isFinite(override)) return undefined;
    return Math.max(0, Math.floor(override));
}
function resolveProviderTimeoutMs(executor) {
    const getTimeoutMs = executor?.getTimeoutMs;
    if (typeof getTimeoutMs !== "function") return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
    try {
        const timeoutMs = getTimeoutMs.call(executor);
        if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs)) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
        return Math.max(0, Math.floor(timeoutMs));
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
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
"[project]/open-sse/executors/codex/bodyTimeout.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCodexTimeoutSafePassthroughBody",
    ()=>buildCodexTimeoutSafePassthroughBody,
    "readCodexPeekChunk",
    ()=>readCodexPeekChunk
]);
/**
 * Per-read timeout helpers for the Codex SSE peek/passthrough body reads (#8020).
 *
 * `peekCodexSseTransientError()` in ../codex.ts reads the first bytes of a Codex
 * SSE response body BEFORE the response reaches chatCore's normal readiness/idle
 * pipeline, so a 200 text/event-stream whose body never emits a byte bypassed
 * FETCH_BODY_TIMEOUT_MS / STREAM_IDLE_TIMEOUT_MS entirely and hung on a bare
 * `reader.read()` for ~15 minutes before the platform killed the connection as a
 * generic 502. These helpers wrap every read (the peek loop AND the re-assembled
 * passthrough body's pull()) in `readStreamChunkWithTimeout`, PER READ rather than
 * against a single total-request deadline, so a long-but-alive reasoning stream
 * that keeps emitting chunks never trips the timeout — only a stream that goes
 * silent for `timeoutMs` does.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [app-route] (ecmascript)");
;
function isBodyTimeoutError(err) {
    return err instanceof Error && err.name === "BodyTimeoutError";
}
async function cancelReaderSafely(reader) {
    try {
        await reader.cancel();
    } catch  {
    // Upstream socket may already be closing; nothing to clean up.
    }
}
async function readCodexPeekChunk(reader, timeoutMs) {
    try {
        const { done, value } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readStreamChunkWithTimeout"])(reader, timeoutMs);
        return {
            done,
            value,
            timedOut: false
        };
    } catch (err) {
        if (isBodyTimeoutError(err)) {
            await cancelReaderSafely(reader);
            return {
                done: true,
                timedOut: true
            };
        }
        throw err;
    }
}
function buildCodexTimeoutSafePassthroughBody(chunks, upstreamReader, timeoutMs) {
    return new ReadableStream({
        start (controller) {
            for (const chunk of chunks)controller.enqueue(chunk);
        },
        async pull (controller) {
            try {
                const { done, value } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$chatCore$2f$upstreamTimeouts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readStreamChunkWithTimeout"])(upstreamReader, timeoutMs);
                if (done) {
                    controller.close();
                    return;
                }
                if (!value) return;
                controller.enqueue(value);
            } catch (err) {
                await cancelReaderSafely(upstreamReader);
                controller.error(err);
            }
        },
        cancel (reason) {
            try {
                upstreamReader.cancel(reason).catch(()=>{});
            } catch  {
            // noop — upstream socket may already be closing.
            }
        }
    });
}
}),
"[project]/open-sse/config/codexIdentity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/codexClient.ts [app-route] (ecmascript) <locals>");
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
    const normalizedSessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeCodexSessionId"])(sessionId);
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
"[project]/open-sse/services/codexVerbosity.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Codex (OpenAI Responses) verbosity normalization.
 *
 * The GPT-5 series added an output-verbosity control: Chat Completions exposes it
 * as a top-level `verbosity` field, while the Responses API nests it as
 * `text.verbosity` (low/medium/high). The CodexExecutor builds a Responses body and
 * gates it through an allowlist that does NOT include `text`, so for translated
 * requests both shapes are dropped silently and the hint never reaches upstream.
 *
 * This helper runs on the translated path (before the allowlist) and folds whichever
 * shape arrived into a single, validated `text:{verbosity}`. `text` is then added to
 * the allowlist so the hint survives. Other Responses `text` keys, such as
 * `text.format` for structured output, are preserved.
 *
 * Ref: OpenAI GPT-5 docs (text.verbosity), Azure Foundry reasoning guide.
 */ __turbopack_context__.s([
    "normalizeCodexVerbosity",
    ()=>normalizeCodexVerbosity
]);
const VERBOSITY_LEVELS = new Set([
    "low",
    "medium",
    "high"
]);
function asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeLevel(value) {
    if (typeof value !== "string") return undefined;
    const level = value.toLowerCase();
    return VERBOSITY_LEVELS.has(level) ? level : undefined;
}
function normalizeCodexVerbosity(body) {
    const textRecord = asRecord(body.text);
    let verbosity = textRecord ? normalizeLevel(textRecord.verbosity) : undefined;
    const topLevel = normalizeLevel(body.verbosity);
    if (topLevel) verbosity = topLevel;
    delete body.verbosity;
    const nextText = textRecord ? {
        ...textRecord
    } : {};
    if (verbosity) {
        nextText.verbosity = verbosity;
    } else {
        delete nextText.verbosity;
    }
    if (Object.keys(nextText).length > 0) {
        body.text = nextText;
    } else {
        delete body.text;
    }
}
}),
"[project]/open-sse/utils/cors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Static CORS headers for open-sse handlers.
 *
 * `Access-Control-Allow-Origin` is set by the Next.js middleware
 * (`src/server/cors/origins.ts`). Handlers in this package only need the
 * methods/headers list; the middleware overlays the allowed origin per
 * the central allowlist on the way out.
 */ __turbopack_context__.s([
    "CORS_HEADERS",
    ()=>CORS_HEADERS
]);
const CORS_HEADERS = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, anthropic-version, x-omniroute-connection, x-internal-test, accept"
};
}),
"[project]/open-sse/utils/responsesInputNormalization.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeCodexResponsesInput",
    ()=>normalizeCodexResponsesInput,
    "normalizeResponsesInputForChat",
    ()=>normalizeResponsesInputForChat
]);
function normalizeAgentMessageForChat(item) {
    if (item.type !== "agent_message") return null;
    if (!Array.isArray(item.content)) return null;
    const textParts = [];
    for (const partValue of item.content){
        if (!partValue || typeof partValue !== "object" || Array.isArray(partValue)) {
            return null;
        }
        const part = partValue;
        if (part.type === "encrypted_content") {
            // Chat Completions has no encrypted agent-message equivalent. Do not leak a
            // partial plaintext envelope or forward an opaque payload the model cannot use.
            return null;
        }
        if (part.type !== "input_text" || typeof part.text !== "string") return null;
        textParts.push(part.text);
    }
    const text = textParts.join("\n");
    if (!text.trim()) return null;
    return {
        type: "message",
        role: "assistant",
        content: [
            {
                type: "input_text",
                text
            }
        ]
    };
}
function textPartTypeForRole(role) {
    return role === "assistant" ? "output_text" : "input_text";
}
function normalizeCodexMessageContentPart(part, role) {
    if (typeof part === "string") return {
        type: textPartTypeForRole(role),
        text: part
    };
    if (!part || typeof part !== "object" || Array.isArray(part)) return part;
    const record = {
        ...part
    };
    if (record.type === "text") record.type = textPartTypeForRole(role);
    // Assistant history in the Responses API must use `output_text` (or `refusal`),
    // never `input_text` (which is user-only). codex-cli sends assistant turns as
    // `input_text`; normalize them so the Codex/OpenAI backend accepts the replay.
    if (role === "assistant" && (record.type === "input_text" || record.type === "text")) {
        record.type = "output_text";
        delete record.annotations;
        delete record.logprobs;
        delete record.obfuscation;
    }
    return record;
}
function buildCodexMessageContent(item, role) {
    if (Array.isArray(item.content)) {
        return item.content.map((part)=>normalizeCodexMessageContentPart(part, role));
    }
    if (typeof item.content === "string") {
        return [
            {
                type: textPartTypeForRole(role),
                text: item.content
            }
        ];
    }
    if (typeof item.text === "string") {
        return [
            {
                type: textPartTypeForRole(role),
                text: item.text
            }
        ];
    }
    return [];
}
function normalizeCodexResponsesInputItem(itemValue) {
    if (typeof itemValue === "string") {
        return {
            type: "message",
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: itemValue
                }
            ]
        };
    }
    if (!itemValue || typeof itemValue !== "object" || Array.isArray(itemValue)) return itemValue;
    const item = {
        ...itemValue
    };
    const role = typeof item.role === "string" ? item.role : "user";
    const type = typeof item.type === "string" ? item.type : "";
    if (type === "additional_tools") {
        delete item.content;
        return item;
    }
    if (!type && item.content === undefined && typeof item.text === "string") {
        return {
            type: "message",
            role,
            content: [
                {
                    type: textPartTypeForRole(role),
                    text: item.text
                }
            ]
        };
    }
    if (!type && role) item.type = "message";
    if (item.type === "message" || !type && item.content !== undefined) {
        item.role = role;
        item.content = buildCodexMessageContent(item, role);
        item.type = "message";
    }
    return item;
}
function normalizeCodexResponsesInput(body) {
    if (Array.isArray(body.input)) {
        body.input = body.input.map(normalizeCodexResponsesInputItem);
        return;
    }
    // undefined → leave as-is; null → empty list (not [null], which would surface a bogus
    // item downstream); anything else → wrap the single item.
    if (body.input === undefined) return;
    body.input = body.input === null ? [] : [
        normalizeCodexResponsesInputItem(body.input)
    ];
}
function normalizeResponsesInputItemForChat(value) {
    if (typeof value === "string") {
        return {
            type: "message",
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: value
                }
            ]
        };
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    const item = {
        ...value
    };
    const hasType = typeof item.type === "string" && item.type.length > 0;
    const hasRole = typeof item.role === "string" && item.role.length > 0;
    const agentMessage = normalizeAgentMessageForChat(item);
    if (agentMessage) return agentMessage;
    if (item.type === "agent_message") {
        // Encrypted or malformed agent messages have no lossless Chat equivalent.
        // Treat them like other Responses-only metadata instead of failing the whole turn.
        return {
            type: "reasoning"
        };
    }
    if (hasType || hasRole) {
        if (!hasType && hasRole) item.type = "message";
        return item;
    }
    if (typeof item.text === "string") {
        return {
            type: "message",
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: item.text
                }
            ]
        };
    }
    if (item.content !== undefined) return {
        type: "message",
        role: "user",
        content: item.content
    };
    return item;
}
function normalizeResponsesInputForChat(input) {
    // == null matches both undefined and null (neither is a spec-valid input) → empty list.
    if (input == null) return [];
    if (Array.isArray(input)) return input.map(normalizeResponsesInputItemForChat);
    return [
        normalizeResponsesInputItemForChat(input)
    ];
}
}),
"[project]/open-sse/executors/codex/tools.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_HOSTED_TOOL_TYPES",
    ()=>CODEX_HOSTED_TOOL_TYPES,
    "isCodexFreePlan",
    ()=>isCodexFreePlan,
    "normalizeCodexTools",
    ()=>normalizeCodexTools
]);
// Codex Responses-API tool normalization (hosted-tool passthrough + free-plan gating).
// Extracted verbatim from codex.ts. Self-contained (console.debug only).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/schemaCoercion.ts [app-route] (ecmascript)");
;
const CODEX_HOSTED_TOOL_TYPES = new Set([
    "tool_search",
    "image_generation",
    "web_search",
    "web_search_preview",
    "file_search",
    "computer",
    "computer_use_preview",
    "code_interpreter",
    "mcp"
]);
function isCodexFreePlan(providerSpecificData) {
    if (!providerSpecificData || typeof providerSpecificData !== "object") return false;
    const plan = providerSpecificData.workspacePlanType;
    return typeof plan === "string" && plan.trim().toLowerCase() === "free";
}
function normalizeCodexTools(body, options) {
    if (!Array.isArray(body.tools)) return;
    const validToolNames = new Set();
    body.tools = body.tools.filter((toolValue)=>{
        if (!toolValue || typeof toolValue !== "object" || Array.isArray(toolValue)) {
            return false;
        }
        const tool = toolValue;
        const toolType = typeof tool.type === "string" ? tool.type : "";
        // Preserve namespace tools (MCP tool groups used by Codex/OpenAI Responses API).
        // Codex API supports them natively; register sub-tool names for tool_choice validation.
        if (toolType === "namespace") {
            if (Array.isArray(tool.tools)) {
                for (const st of tool.tools){
                    if (st && typeof st === "object" && !Array.isArray(st)) {
                        const subTool = st;
                        const name = typeof subTool.name === "string" ? subTool.name.trim().slice(0, 128) : "";
                        if (name) validToolNames.add(name);
                    }
                }
            }
            return true;
        }
        // Native Codex clients send Responses API custom tools such as apply_patch as:
        // { type: "custom", name, format }. Preserve those only on native passthrough;
        // translated/non-native requests can still contain provider-specific "custom"
        // shapes that the Codex backend would reject.
        if (toolType === "custom" && options?.preserveCustomTools === true) {
            const name = typeof tool.name === "string" ? tool.name.trim().slice(0, 128) : "";
            if (!name) return false;
            tool.name = name;
            validToolNames.add(name);
            return true;
        }
        if (toolType !== "function") {
            const hasFunctionObject = tool.function && typeof tool.function === "object";
            const hasName = typeof tool.name === "string";
            if (!toolType || hasFunctionObject || hasName) {
                return false;
            }
            if (CODEX_HOSTED_TOOL_TYPES.has(toolType)) {
                // #2980: drop the CLI-injected image_generation tool for free-plan
                // accounts, which can't run it server-side (upstream 400 otherwise).
                if (toolType === "image_generation" && options?.dropImageGeneration === true) {
                    return false;
                }
                return true;
            }
            console.debug(`[Codex] dropping unknown hosted tool type: ${toolType}`);
            return false;
        }
        const rawName = typeof tool.name === "string" ? tool.name : tool.function && typeof tool.function === "object" && !Array.isArray(tool.function) && typeof tool.function.name === "string" ? tool.function.name : "";
        const name = rawName.trim();
        if (!name) {
            return false;
        }
        // Codex Responses API requires function tools in flat Responses format:
        // { type: "function", name, description, parameters }
        // Some clients/translators send Chat Completions shape:
        // { type: "function", function: { name, description, parameters } }
        // which upstream rejects with "Missing required parameter: tools[0].name".
        // Flatten the nested `function` wrapper into top-level fields (#1914).
        const functionObject = tool.function && typeof tool.function === "object" && !Array.isArray(tool.function) ? tool.function : null;
        const description = typeof tool.description === "string" ? tool.description : typeof functionObject?.description === "string" ? functionObject.description : "";
        const parameters = tool.parameters && typeof tool.parameters === "object" && !Array.isArray(tool.parameters) ? tool.parameters : functionObject?.parameters && typeof functionObject.parameters === "object" && !Array.isArray(functionObject.parameters) ? functionObject.parameters : {
            type: "object",
            properties: {}
        };
        const strict = typeof tool.strict === "boolean" ? tool.strict : typeof functionObject?.strict === "boolean" ? functionObject.strict : undefined;
        // Codex/OpenAI Responses API rejects `pattern` fields using regex lookaround
        // (e.g. `^(?=.*@).+$`) with a 400 "regex lookaround is not supported" error.
        // Strip those before the schema reaches upstream (9router#1556).
        const sanitizedParameters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$schemaCoercion$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stripUnsupportedRegexPatterns"])(parameters);
        // Rewrite in-place to Responses format
        for (const key of Object.keys(tool)){
            delete tool[key];
        }
        tool.type = "function";
        tool.name = name.slice(0, 128);
        if (description) tool.description = description;
        tool.parameters = sanitizedParameters;
        if (strict !== undefined) tool.strict = strict;
        validToolNames.add(name);
        return true;
    });
    if (body.tool_choice && typeof body.tool_choice === "object" && !Array.isArray(body.tool_choice)) {
        const toolChoice = body.tool_choice;
        if (toolChoice.type === "function") {
            const rawName = typeof toolChoice.name === "string" ? toolChoice.name.trim() : "";
            if (!rawName || !validToolNames.has(rawName)) {
                delete body.tool_choice;
            }
        } else if (toolChoice.type === "local_shell") {
            delete body.tool_choice;
        }
    }
}
}),
"[project]/open-sse/executors/codex/reasoningSuffix.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CODEX_EFFORT_ORDER",
    ()=>CODEX_EFFORT_ORDER,
    "GPT_5_6_MAX_ALIAS_MODELS",
    ()=>GPT_5_6_MAX_ALIAS_MODELS,
    "GPT_5_6_ULTRA_ALIAS_MODELS",
    ()=>GPT_5_6_ULTRA_ALIAS_MODELS,
    "splitCodexReasoningSuffix",
    ()=>splitCodexReasoningSuffix
]);
const CODEX_EFFORT_ORDER = [
    "none",
    "low",
    "medium",
    "high",
    "xhigh",
    "max",
    "ultra"
];
const GPT_5_6_MAX_ALIAS_MODELS = new Set([
    "gpt-5.6-sol",
    "gpt-5.6-terra",
    "gpt-5.6-luna"
]);
const GPT_5_6_ULTRA_ALIAS_MODELS = new Set([
    "gpt-5.6-sol",
    "gpt-5.6-terra"
]);
function splitCodexReasoningSuffix(model) {
    const modelId = typeof model === "string" ? model : "";
    const gpt56Match = /^(gpt-5\.6-(?:sol|terra|luna))(?:-(max|ultra)|\((max|ultra)\))$/.exec(modelId);
    if (gpt56Match) {
        const [, baseModel, hyphenEffort, parenthesizedEffort] = gpt56Match;
        const effort = hyphenEffort ?? parenthesizedEffort;
        const supportedModels = parenthesizedEffort ? GPT_5_6_MAX_ALIAS_MODELS : effort === "ultra" ? GPT_5_6_ULTRA_ALIAS_MODELS : GPT_5_6_MAX_ALIAS_MODELS;
        if (supportedModels.has(baseModel)) {
            return {
                baseModel,
                effort: effort
            };
        }
    }
    for (const effort of [
        "none",
        "low",
        "medium",
        "high",
        "xhigh"
    ]){
        if (modelId.endsWith(`-${effort}`)) {
            return {
                baseModel: modelId.slice(0, -`-${effort}`.length),
                effort
            };
        }
    }
    return {
        baseModel: modelId,
        effort: null
    };
}
}),
"[project]/open-sse/executors/codex.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CodexExecutor",
    ()=>CodexExecutor,
    "__setCodexWebSocketTransportForTesting",
    ()=>__setCodexWebSocketTransportForTesting,
    "encodeResponseSseEvent",
    ()=>encodeResponseSseEvent,
    "filterNonstandardCodexSse",
    ()=>filterNonstandardCodexSse,
    "getCodexUpstreamModel",
    ()=>getCodexUpstreamModel,
    "isCodexResponsesWebSocketRequired",
    ()=>isCodexResponsesWebSocketRequired,
    "isCompactResponsesEndpoint",
    ()=>isCompactResponsesEndpoint,
    "peekCodexSseTransientError",
    ()=>peekCodexSseTransientError,
    "stripStoredItemReferences",
    ()=>stripStoredItemReferences
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/requestDefaults.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/featureFlags.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/base.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/base/headers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexInstructions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexInstructions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$bodyTimeout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/codex/bodyTimeout.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/codexClient.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexIdentity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/tokenRefresh.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responsesInputSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/responsesInputSanitizer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexVerbosity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/codexVerbosity.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/thinkingBudget.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/cors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesInputNormalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/responsesInputNormalization.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/providerRequestLogging.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/module [external] (module, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/codex/tools.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$reasoningSuffix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/codex/reasoningSuffix.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("open-sse/executors/codex.ts")}`;
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
;
;
// ─── wreq-js lazy loader ───────────────────────────────────────────────────
// wreq-js is a Rust-native module that requires platform-specific .node binaries.
// Loading it eagerly crashes the server when the binary is missing (pnpm, Docker
// Alpine, unsupported architectures). We lazy-load with try/catch to gracefully
// fall back to HTTP transport when the WebSocket transport is unavailable.
const _wreqRequire = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$module__$5b$external$5d$__$28$module$2c$__cjs$29$__["createRequire"])(__TURBOPACK__import$2e$meta__.url);
let _websocketFn = null;
let _wreqChecked = false;
let _websocketOverride;
function getCodexWebSocketTransport() {
    if (_websocketOverride !== undefined) return _websocketOverride;
    if (_wreqChecked) return _websocketFn;
    _wreqChecked = true;
    try {
        const mod = __turbopack_context__.r("[externals]/wreq-js [external] (wreq-js, cjs, [project]/node_modules/wreq-js)");
        _websocketFn = typeof mod.websocket === "function" ? mod.websocket : null;
    } catch  {
        console.warn("[codex] wreq-js import failed, websocket disabled");
        _websocketFn = null;
    }
    return _websocketFn;
}
function __setCodexWebSocketTransportForTesting(websocket) {
    _websocketOverride = websocket;
}
function codexWebSocketUnavailableResponse() {
    return new Response(JSON.stringify({
        error: {
            code: "wreq_unavailable",
            message: "Codex WebSocket transport unavailable: wreq-js native module is missing for this platform"
        }
    }), {
        status: 503,
        headers: {
            "Content-Type": "application/json",
            ...__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CORS_HEADERS"]
        }
    });
}
;
const CODEX_FAST_WIRE_VALUE = "priority";
const CODEX_RESPONSES_WS_URL = "wss://chatgpt.com/backend-api/codex/responses";
const CODEX_RESPONSES_LITE_HEADER = "x-openai-internal-codex-responses-lite";
const CODEX_RESPONSES_LITE_WS_METADATA_KEY = "ws_request_header_x_openai_internal_codex_responses_lite";
// The official Codex client marks Responses Lite over an HTTP header or, for WebSocket
// requests, mirrors the same signal into client_metadata. Lite rejects parallel tool calls.
function isEnabledResponsesLiteFlag(value) {
    return value === true || typeof value === "string" && value.trim().toLowerCase() === "true";
}
function isCodexResponsesLiteRequest(bodyInput, clientHeaders) {
    const hasLiteHeader = Object.entries(clientHeaders ?? {}).some(([key, value])=>key.toLowerCase() === CODEX_RESPONSES_LITE_HEADER && isEnabledResponsesLiteFlag(value));
    if (hasLiteHeader) return true;
    if (!bodyInput || typeof bodyInput !== "object" || Array.isArray(bodyInput)) return false;
    const metadata = bodyInput.client_metadata;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
    return isEnabledResponsesLiteFlag(metadata[CODEX_RESPONSES_LITE_WS_METADATA_KEY]);
}
// GPT-5.6 ultra-tier (sol/terra at "ultra") and luna at "max" coordinate delegation to
// sub-agents via parallel tool calls (see the effort-clamp comment near clampEffort()).
// Responses Lite must not strip parallel_tool_calls for those model/effort combos, or
// delegation silently breaks while the request still returns HTTP 200 (issue #7821).
function isCodexDelegationDependentModel(model) {
    const { baseModel, effort } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$reasoningSuffix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitCodexReasoningSuffix"])(model);
    if (effort === "ultra" && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$reasoningSuffix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GPT_5_6_ULTRA_ALIAS_MODELS"].has(baseModel)) return true;
    if (effort === "max" && baseModel === "gpt-5.6-luna") return true;
    return false;
}
function enforceCodexResponsesLiteParallelToolCalls(bodyInput, clientHeaders, model) {
    if (!isCodexResponsesLiteRequest(bodyInput, clientHeaders) || !bodyInput || typeof bodyInput !== "object" || Array.isArray(bodyInput) || isCodexDelegationDependentModel(model)) {
        return bodyInput;
    }
    const body = bodyInput;
    if (body.parallel_tool_calls === false) return bodyInput;
    return {
        ...body,
        parallel_tool_calls: false
    };
}
function getCodexUpstreamModel(model) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$reasoningSuffix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitCodexReasoningSuffix"])(model).baseModel;
}
/**
 * Convert role=system messages in `input` to role=developer.
 *
 * GPT-5 models support the `developer` role in input, but reject `system`.
 * This keeps the content inside
 * the `input` array where it benefits from OpenAI's automatic prompt caching.
 *
 * OpenAI's prompt caching matches on the serialized prefix of the `input` array
 * (+ tools). The `instructions` field is NOT included in the cache key for
 * GPT-5 models. Moving system prompts from `input` to `instructions` therefore
 * removes them from the cacheable prefix, resulting in 0% cache hit rates.
 *
 * Ref: https://community.openai.com/t/caching-is-borked-for-gpt-5-models/1359574
 * Ref: https://community.openai.com/t/no-caching-with-model-responses/1338627
 */ function convertSystemToDeveloperRole(body) {
    if (!Array.isArray(body.input)) return;
    for (const itemValue of body.input){
        if (!itemValue || typeof itemValue !== "object" || Array.isArray(itemValue)) {
            continue;
        }
        const item = itemValue;
        const role = typeof item.role === "string" ? item.role : "";
        const type = typeof item.type === "string" ? item.type : "";
        const isSystemMessage = role === "system" && (!type || type === "message");
        if (isSystemMessage) {
            item.role = "developer";
        }
    }
}
function stripStoredItemReferences(body) {
    if (Array.isArray(body.input) && body.input.length === 0) {
        body.input = [
            {
                type: "message",
                role: "user",
                content: [
                    {
                        type: "input_text",
                        text: "continue"
                    }
                ]
            }
        ];
    }
    if (!Array.isArray(body.input)) return;
    const SERVER_ID_PATTERN = /^(rs|fc|resp|msg)_/;
    let strippedCount = 0;
    body.input = body.input.filter((item)=>{
        // Bare string references: "rs_abc123", "resp_abc123"
        if (typeof item === "string" && SERVER_ID_PATTERN.test(item)) {
            strippedCount++;
            return false;
        }
        // Object references: { type: "item_reference", id: "rs_..." }
        if (item && typeof item === "object" && !Array.isArray(item) && item.type === "item_reference") {
            strippedCount++;
            return false;
        }
        // Reasoning blobs (encrypted_content) are unusable with store=false since
        // previous_response_id is deleted — strip them to avoid wasting context
        // tokens (O(n^2) growth across agentic turns).
        if (item && typeof item === "object" && !Array.isArray(item) && item.type === "reasoning") {
            strippedCount++;
            return false;
        }
        // Object items with server-generated IDs: strip the id field but keep the item.
        // e.g. { id: "rs_...", type: "reasoning", summary: [...] } → keep content, remove id
        // e.g. { id: "fc_...", type: "function_call", ... } → keep content, remove id
        if (item && typeof item === "object" && !Array.isArray(item)) {
            const record = item;
            if (typeof record.id === "string" && SERVER_ID_PATTERN.test(record.id)) {
                delete record.id;
                strippedCount++;
            }
        }
        return true;
    });
    if (strippedCount > 0) {
        console.debug(`[Codex] stripStoredItemReferences: sanitized ${strippedCount} server-generated ID(s) from input`);
    }
}
function stripOrphanedCodexFunctionCallOutputs(body) {
    if (!Array.isArray(body.input)) return;
    // A previous_response_id delegates history resolution to the upstream
    // Responses service, so a matching function_call may legitimately live in
    // that remote response rather than in the local input array.
    if (typeof body.previous_response_id === "string" && body.previous_response_id.trim()) return;
    const callIds = new Set();
    let outputCount = 0;
    for (const item of body.input){
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const record = item;
        if (record.type === "function_call" && typeof record.call_id === "string") {
            callIds.add(record.call_id);
        }
        if (Array.isArray(record.tool_calls)) {
            for (const toolCall of record.tool_calls){
                if (!toolCall || typeof toolCall !== "object" || Array.isArray(toolCall)) continue;
                const toolCallId = toolCall.id;
                if (typeof toolCallId === "string") {
                    callIds.add(toolCallId);
                }
            }
        }
        if (record.type === "function_call_output") {
            outputCount++;
        }
    }
    if (outputCount === 0) return;
    const before = body.input.length;
    body.input = body.input.filter((item)=>{
        if (!item || typeof item !== "object" || Array.isArray(item)) return true;
        const record = item;
        if (record.type === "function_call_output" && typeof record.call_id === "string") {
            return callIds.has(record.call_id);
        }
        return true;
    });
    const removedCount = before - body.input.length;
    if (removedCount > 0) {
        console.debug(`[Codex] stripOrphanedCodexFunctionCallOutputs: removed ${removedCount} orphaned function_call_output item(s)`);
    }
}
function repairMissingCodexFunctionCallOutputs(body) {
    if (!Array.isArray(body.input)) return;
    const existingOutputIds = new Set();
    for (const item of body.input){
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const record = item;
        if (record.type !== "function_call_output") continue;
        if (typeof record.call_id === "string" && record.call_id.trim()) {
            existingOutputIds.add(record.call_id.trim());
        }
    }
    const repaired = [];
    let insertedCount = 0;
    for (const item of body.input){
        repaired.push(item);
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const record = item;
        if (record.type !== "function_call") continue;
        const callId = typeof record.call_id === "string" ? record.call_id.trim() : "";
        if (!callId || existingOutputIds.has(callId)) continue;
        repaired.push({
            type: "function_call_output",
            call_id: callId,
            output: ""
        });
        existingOutputIds.add(callId);
        insertedCount++;
    }
    if (insertedCount > 0) {
        body.input = repaired;
        console.debug(`[Codex] repairMissingCodexFunctionCallOutputs: inserted ${insertedCount} empty function_call_output item(s)`);
    }
}
function getResponsesSubpath(endpointPath) {
    let normalizedEndpoint = String(endpointPath || "");
    while(normalizedEndpoint.endsWith("/") && normalizedEndpoint.length > 0){
        normalizedEndpoint = normalizedEndpoint.slice(0, -1);
    }
    const lower = normalizedEndpoint.toLowerCase();
    if (lower === "responses" || lower.endsWith("/responses")) {
        return "";
    }
    const responsesSlash = "/responses/";
    const idx = lower.lastIndexOf(responsesSlash);
    if (idx !== -1) {
        return normalizedEndpoint.slice(idx + "/responses".length);
    }
    if (lower.startsWith("responses/")) {
        return normalizedEndpoint.slice("responses".length);
    }
    return null;
}
function isCompactResponsesEndpoint(endpointPath) {
    return getResponsesSubpath(endpointPath)?.toLowerCase() === "/compact";
}
function normalizeServiceTierValue(value) {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    if (normalized === "fast") return CODEX_FAST_WIRE_VALUE;
    return normalized;
}
/**
 * Maximum reasoning effort allowed per Codex model.
 * Models not listed here retain the legacy xhigh cap.
 * Update this table when Codex releases new models with different caps.
 */ const MAX_EFFORT_BY_MODEL = {
    "gpt-5.6-sol": "ultra",
    "gpt-5.6-terra": "ultra",
    "gpt-5.6-luna": "max",
    "gpt-5.3-codex": "xhigh",
    "gpt-5.1-codex-max": "xhigh",
    "gpt-5-mini": "high",
    "gpt-5.1-mini": "high",
    "gpt-4.1-mini": "high"
};
/**
 * Clamp reasoning effort to the model's maximum allowed level.
 * Returns the original value if within limits, or the cap if it exceeds it.
 */ function clampEffort(model, requested) {
    const max = MAX_EFFORT_BY_MODEL[model] ?? "xhigh";
    const reqIdx = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$reasoningSuffix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_EFFORT_ORDER"].indexOf(requested);
    const maxIdx = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$reasoningSuffix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_EFFORT_ORDER"].indexOf(max);
    if (reqIdx > maxIdx) {
        console.debug(`[Codex] clampEffort: "${requested}" → "${max}" (model: ${model})`);
        return max;
    }
    return requested;
}
const CODEX_REASONING_ENCRYPTED_CONTENT_INCLUDE = "reasoning.encrypted_content";
const CODEX_DEFAULT_REASONING_SUMMARY = "auto";
function normalizeEffortValue(value) {
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toLowerCase();
    return normalized || undefined;
}
function ensureCodexReasoningSummary(body) {
    const reasoning = body.reasoning && typeof body.reasoning === "object" && !Array.isArray(body.reasoning) ? body.reasoning : null;
    if (!reasoning || normalizeEffortValue(reasoning.effort) === "none") return;
    if (!("summary" in reasoning)) {
        reasoning.summary = CODEX_DEFAULT_REASONING_SUMMARY;
    }
    if (!Array.isArray(body.include)) {
        body.include = [
            CODEX_REASONING_ENCRYPTED_CONTENT_INCLUDE
        ];
        return;
    }
    if (!body.include.includes(CODEX_REASONING_ENCRYPTED_CONTENT_INCLUDE)) {
        body.include = [
            ...body.include,
            CODEX_REASONING_ENCRYPTED_CONTENT_INCLUDE
        ];
    }
}
function consumeResponsesStoreMarker(body) {
    const marker = body._omnirouteResponsesStore;
    delete body._omnirouteResponsesStore;
    return marker;
}
/**
 * Global Codex WebSocket kill-switch (feature flag OMNIROUTE_CODEX_WS_ENABLED,
 * default ON). Fail-open: if the flag store is unreachable (e.g. DB not yet
 * ready), treat as enabled so codex routing is never broken by the read itself.
 */ function isCodexWsGloballyEnabled() {
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$featureFlags$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFeatureFlagEnabled"])("OMNIROUTE_CODEX_WS_ENABLED");
    } catch  {
        return true;
    }
}
function isCodexResponsesWebSocketRequired(_model, credentials) {
    // Global kill-switch (default ON). When disabled, Codex never uses the WS
    // transport — even per-connection codexTransport=websocket falls back to the
    // HTTP Responses SSE endpoint.
    if (!isCodexWsGloballyEnabled()) return false;
    // OmniRoute is an HTTP→SSE gateway — WebSocket transport is unnecessary and
    // breaks when upstream requests go through an HTTP proxy (403 on WS upgrade).
    // Default to the standard HTTP Responses SSE endpoint for all Codex models.
    // Users who need WebSocket can opt in via the provider codexTransport setting.
    const providerSpecificData = credentials && typeof credentials === "object" ? credentials.providerSpecificData : null;
    return !!(providerSpecificData?.codexTransport === "websocket" && getCodexWebSocketTransport());
}
function toStatusCode(value) {
    if (typeof value === "number" && Number.isInteger(value) && value >= 400 && value <= 599) {
        return value;
    }
    if (typeof value === "string" && /^\d{3}$/.test(value.trim())) {
        const parsed = Number(value.trim());
        return parsed >= 400 && parsed <= 599 ? parsed : null;
    }
    return null;
}
function looksLikeQuotaOrRateLimit(code, type, message) {
    const haystack = `${code} ${type} ${message}`.toLowerCase();
    return haystack.includes("usage_limit_reached") || haystack.includes("rate_limit") || haystack.includes("rate limit") || haystack.includes("quota") || haystack.includes("too many requests") || haystack.includes("limit has been reached") || haystack.includes("limit reached");
}
function toCodexResponseFailedEvent(parsed) {
    const response = parsed.response && typeof parsed.response === "object" && !Array.isArray(parsed.response) ? parsed.response : null;
    const upstreamError = response?.error && typeof response.error === "object" && !Array.isArray(response.error) ? response.error : parsed.error && typeof parsed.error === "object" && !Array.isArray(parsed.error) ? parsed.error : parsed;
    const code = typeof upstreamError.code === "string" ? upstreamError.code : typeof upstreamError.type === "string" ? upstreamError.type : "upstream_error";
    const type = typeof upstreamError.type === "string" ? upstreamError.type : "";
    const message = typeof upstreamError.message === "string" && upstreamError.message.trim() ? upstreamError.message : "Codex upstream error";
    const error = {
        code,
        message
    };
    const explicitStatus = toStatusCode(parsed.status_code) ?? toStatusCode(parsed.status) ?? toStatusCode(response?.status_code) ?? toStatusCode(response?.status) ?? toStatusCode(upstreamError.status_code) ?? toStatusCode(upstreamError.status);
    const statusCode = explicitStatus ?? (looksLikeQuotaOrRateLimit(code, type, message) ? 429 : null);
    if (type) error.type = type;
    if (statusCode !== null) error.status_code = statusCode;
    return {
        type: "response.failed",
        response: {
            id: typeof response?.id === "string" ? response.id : null,
            status: "failed",
            error
        }
    };
}
// Env-gated kill-switch: drop ALL non-standard `codex.*` SSE events (notably
// `codex.rate_limits`) from the Responses stream. These events are NOT part of
// the OpenAI Responses API — strict clients (e.g. the OpenAI SDK's
// `responses.stream()`) choke on the unknown event type / empty data field and
// tear the stream down, surfacing as "Invalid state: Controller is already
// closed". Opt-in so the default still forwards them for clients that want them.
function codexDropNonstandardEvents() {
    const v = process.env.OMNIROUTE_CODEX_DROP_NONSTANDARD_EVENTS;
    return v === "true" || v === "1" || v === "yes";
}
function filterNonstandardCodexSse(response) {
    const contentType = response.headers.get("content-type") || "";
    if (!response.body || !contentType.includes("text/event-stream")) {
        return response;
    }
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    const dropBlock = (block)=>{
        const match = /^event:\s*(.+)$/m.exec(block);
        return !!match && match[1].trim().startsWith("codex.");
    };
    const transform = new TransformStream({
        transform (chunk, controller) {
            buffer += decoder.decode(chunk, {
                stream: true
            });
            let sep;
            while((sep = buffer.indexOf("\n\n")) !== -1){
                const block = buffer.slice(0, sep + 2);
                buffer = buffer.slice(sep + 2);
                if (!dropBlock(block)) controller.enqueue(encoder.encode(block));
            }
        },
        flush (controller) {
            if (buffer && !dropBlock(buffer)) controller.enqueue(encoder.encode(buffer));
        }
    });
    return new Response(response.body.pipeThrough(transform), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    });
}
// ─── Sub-bug #3 of upstream decolua/9router#2452 (@ryanngit) ─────────────────
// Codex sometimes answers with HTTP 200 and a text/event-stream body whose
// payload carries a transient "model at capacity" / overloaded error mid-stream,
// e.g. { "error": { "message": "Selected model is at capacity..." } },
// server_is_overloaded, or service_unavailable_error. Left as a 200, this looks
// like a successful response to every caller — no retry, no circuit breaker, no
// combo/account fallback engages (open-sse/services/accountFallback.ts never
// sees a failure status). Peek the first few SSE bytes; when a transient-error
// signature is found, convert the response into a real 503 so account rotation
// kicks in. Otherwise re-assemble the stream from the peeked prefix + the
// remaining upstream body so the passthrough stays byte-identical.
const CODEX_SSE_TRANSIENT_ERROR_PATTERNS = [
    "selected model is at capacity",
    "server_is_overloaded",
    "service_unavailable_error"
];
// A capacity/overloaded rejection is delivered as the very first SSE event, so a
// small peek window is enough — this bounds how much of a legitimate response we
// buffer before giving up and passing the stream through unchanged.
const CODEX_SSE_PEEK_MAX_BYTES = 8192;
/**
 * Best-effort extraction of the human-readable error message from a peeked SSE
 * chunk, so the resulting 503 body carries something more useful than the raw
 * pattern that matched. Falls back to the matched pattern when no structured
 * `data:` payload could be parsed.
 */ function extractCodexSseErrorMessage(text, fallback) {
    for (const line of text.split(/\r?\n/)){
        if (!line.startsWith("data:")) continue;
        const data = line.slice("data:".length).trim();
        if (!data || data === "[DONE]") continue;
        try {
            const parsed = JSON.parse(data);
            const directError = parsed.error;
            const nestedError = parsed.response?.error;
            const message = typeof directError?.message === "string" && directError.message || typeof nestedError?.message === "string" && nestedError.message || typeof parsed.message === "string" && parsed.message;
            if (message) return message;
        } catch  {
        // Non-JSON SSE data line — keep scanning subsequent lines.
        }
    }
    return fallback;
}
async function peekCodexSseTransientError(response, timeoutMs = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_BODY_TIMEOUT_MS"]) {
    const contentType = response.headers.get("content-type") || "";
    // #7536: check content-type BEFORE touching `response.body`. On the wreq-js
    // TLS-fingerprint transport (used by Codex), the Response is backed by a native
    // body handle and merely accessing `.body` disturbs it, so a downstream
    // `.text()` throws "Response body is already used". The Codex non-stream
    // upstream response has an empty content-type, so it must short-circuit here
    // WITHOUT reading `.body` — otherwise chatCore's readNonStreamingResponseBody
    // 502s. Only genuine SSE responses (which this peek intends to buffer) reach
    // the `.body` access below.
    if (!response.ok || !contentType.includes("text/event-stream") || !response.body) {
        return {
            matched: null,
            message: null,
            replacementBody: null
        };
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const chunks = [];
    let text = "";
    let matched = null;
    try {
        while(text.length < CODEX_SSE_PEEK_MAX_BYTES){
            const { done, value, timedOut } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$bodyTimeout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readCodexPeekChunk"])(reader, timeoutMs);
            if (timedOut) {
                return {
                    matched: null,
                    message: null,
                    replacementBody: null,
                    timedOut: true
                };
            }
            if (done) break;
            if (!value) continue;
            chunks.push(value);
            text += decoder.decode(value, {
                stream: true
            });
            const lower = text.toLowerCase();
            const hit = CODEX_SSE_TRANSIENT_ERROR_PATTERNS.find((pattern)=>lower.includes(pattern));
            if (hit) {
                matched = hit;
                break;
            }
            // A real content/completion event this early means the response is
            // healthy — stop peeking so we do not needlessly buffer a long stream.
            if (lower.includes('"type":"response.output_text.delta"') || lower.includes('"type":"response.completed"')) {
                break;
            }
        }
    } catch (err) {
        console.warn(`[codex] peekCodexSseTransientError: read error, passing stream through: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (matched) {
        try {
            await reader.cancel();
        } catch  {
        // Upstream socket may already be closing; nothing to clean up.
        }
        return {
            matched,
            message: extractCodexSseErrorMessage(text, matched),
            replacementBody: null
        };
    }
    // Re-assemble the stream: peeked prefix chunks, then continue draining the
    // SAME reader we already hold. The previous code called reader.releaseLock()
    // and then response.body.getReader() a second time — but re-acquiring a reader
    // on an already-disturbed body throws "Response body is already used" on
    // undici (every non-stream Codex request 502'd, then got mis-classified as a
    // 60s rate limit). Keep the original reader; never touch response.body again.
    const upstreamReader = reader;
    const replacementBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$bodyTimeout$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCodexTimeoutSafePassthroughBody"])(chunks, upstreamReader, timeoutMs);
    return {
        matched: null,
        message: null,
        replacementBody
    };
}
function encodeResponseSseEvent(raw) {
    let eventType = "message";
    let payload = raw;
    let terminal = false;
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.type === "string" && parsed.type.trim()) {
            eventType = parsed.type.trim();
            if (eventType === "error" || eventType === "response.failed") {
                const failed = toCodexResponseFailedEvent(parsed);
                payload = JSON.stringify(failed);
                eventType = "response.failed";
            }
            terminal = eventType === "response.completed" || eventType === "response.failed";
        }
    } catch  {
        console.warn("[codex] SSE payload parse failed, using raw payload");
    // Keep message as the generic SSE event for non-JSON upstream payloads.
    }
    // Env-gated: drop non-standard `codex.*` events (notably `codex.rate_limits`)
    // before they reach the client. They are NOT part of the OpenAI Responses API
    // and break strict consumers: the OpenAI SDK's responses.stream() chokes on
    // the unknown event type / empty data and tears the stream down, surfacing as
    // "Invalid state: Controller is already closed". The earlier empty-payload
    // check below never caught codex.rate_limits — over WS the frame carries a
    // non-empty JSON payload (`{"type":"codex.rate_limits", ...}`), so
    // `!payload.trim()` is false. Match by event type instead. Opt-in via
    // OMNIROUTE_CODEX_DROP_NONSTANDARD_EVENTS (the HTTP transport is handled
    // separately by filterNonstandardCodexSse, since super.execute forwards the
    // upstream stream verbatim and never runs this function).
    if (eventType.startsWith("codex.") && codexDropNonstandardEvents()) {
        return {
            sse: "",
            terminal
        };
    }
    // Drop frames whose raw payload is empty (defensive; non-JSON / blank upstream
    // chunks). Frames that carry a payload are preserved.
    if (!payload.trim()) {
        return {
            sse: "",
            terminal
        };
    }
    return {
        sse: `event: ${eventType}\ndata: ${payload}\n\n`,
        terminal
    };
}
function toWebSocketUrl(url) {
    // Symmetric scheme map that PRESERVES the caller's transport choice by
    // rewriting only the leading scheme: https→secure WS (production, e.g.
    // chatgpt.com), http→plain WS (local/dev only). Not a hardcoded cleartext
    // endpoint — the production codex upstream is the secure CODEX_RESPONSES_WS_URL.
    if (/^wss?:\/\//.test(url)) return url;
    if (url.startsWith("https:")) return url.replace(/^https:/, "wss:");
    if (url.startsWith("http:")) return url.replace(/^http:/, "ws:");
    return CODEX_RESPONSES_WS_URL;
}
function normalizeCodexWsHeaders(headers) {
    const result = {};
    for (const [key, value] of Object.entries(headers)){
        const lower = key.toLowerCase();
        if (lower === "host" || lower === "connection" || lower === "upgrade" || lower === "sec-websocket-key" || lower === "sec-websocket-version" || lower === "sec-websocket-extensions") {
            continue;
        }
        result[key] = value;
    }
    result.Origin = "https://chatgpt.com";
    return result;
}
class CodexExecutor extends __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["BaseExecutor"] {
    constructor(){
        super("codex", __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PROVIDERS"].codex);
    }
    async execute(input) {
        const requestBody = enforceCodexResponsesLiteParallelToolCalls(input.body, input.clientHeaders, input.model);
        const requestInput = requestBody === input.body ? input : {
            ...input,
            body: requestBody
        };
        const sessionId = this.getPromptCacheSessionId(requestInput.credentials, requestInput.body);
        const identity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createCodexClientIdentity"])(sessionId, requestInput.credentials?.providerSpecificData ?? null);
        const credentials = identity ? {
            ...requestInput.credentials,
            providerSpecificData: {
                ...requestInput.credentials?.providerSpecificData || {},
                codexClientIdentity: identity
            }
        } : requestInput.credentials;
        const nextInput = {
            ...requestInput,
            credentials
        };
        if (!isCodexResponsesWebSocketRequired(nextInput.model, nextInput.credentials)) {
            const httpResult = await super.execute(nextInput);
            if (codexDropNonstandardEvents()) {
                const resp = httpResult.response;
                if (resp?.body) {
                    httpResult.response = filterNonstandardCodexSse(resp);
                }
            }
            const resp = httpResult.response;
            if (resp) {
                const peek = await peekCodexSseTransientError(resp);
                if (peek.matched) {
                    input.log?.warn?.("RETRY", `CODEX | 200-OK SSE carried transient error "${peek.matched}" — converting to 503 for account fallback`);
                    httpResult.response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].SERVICE_UNAVAILABLE, peek.message);
                } else if (peek.timedOut) {
                    // #8020: the peek's first-chunk read never returned (upstream body went
                    // silent). Convert to a bounded 504 instead of letting the caller hang.
                    input.log?.warn?.("TIMEOUT", "CODEX | 200-OK SSE peek read timed out — upstream body stalled, returning 504");
                    httpResult.response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT, "Upstream Codex SSE body read timed out");
                } else if (peek.replacementBody) {
                    httpResult.response = new Response(peek.replacementBody, {
                        status: resp.status,
                        statusText: resp.statusText,
                        headers: resp.headers
                    });
                }
            }
            return httpResult;
        }
        const url = CODEX_RESPONSES_WS_URL;
        const headers = normalizeCodexWsHeaders(this.buildHeaders(nextInput.credentials, true));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeUpstreamExtraHeaders"])(headers, nextInput.upstreamExtraHeaders);
        const transformedBody = await this.transformRequest(nextInput.model, nextInput.body, true, nextInput.credentials);
        transformedBody.model = getCodexUpstreamModel(transformedBody.model || nextInput.model);
        delete transformedBody.stream;
        delete transformedBody.stream_options;
        const bodyString = JSON.stringify({
            type: "response.create",
            ...transformedBody
        });
        const websocketFn = getCodexWebSocketTransport();
        if (!websocketFn) {
            return {
                response: codexWebSocketUnavailableResponse(),
                url,
                headers,
                transformedBody
            };
        }
        const encoder = new TextEncoder();
        let closed = false;
        let ws = null;
        let streamController = null;
        const closeUpstream = (reason)=>{
            try {
                ws?.close(1000, reason);
            } catch  {
                console.warn("[codex] closeUpstream: socket close race ignored");
            // ignore close races
            }
        };
        let abortHandler = null;
        const removeAbortListener = ()=>{
            if (!abortHandler) return;
            nextInput.signal?.removeEventListener("abort", abortHandler);
            abortHandler = null;
        };
        const finishStream = ({ reason, emitDone = true, closeController = true, closeSocket = true })=>{
            if (closed) return;
            closed = true;
            removeAbortListener();
            if (closeSocket) closeUpstream(reason);
            const controller = streamController;
            if (!controller || !closeController) return;
            if (emitDone) {
                try {
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                } catch  {
                    console.warn("[codex] finishStream: failed to enqueue [DONE]");
                // The downstream may already have gone away.
                }
            }
            try {
                controller.close();
            } catch  {
                console.warn("[codex] finishStream: failed to close controller");
            // The controller may already be closed.
            }
        };
        const failController = (code, message)=>{
            if (closed) return;
            const controller = streamController;
            const payload = JSON.stringify({
                type: "response.failed",
                response: {
                    id: null,
                    status: "failed",
                    error: {
                        code,
                        message
                    }
                }
            });
            try {
                controller?.enqueue(encoder.encode(`event: response.failed\ndata: ${payload}\n\n`));
            } catch  {
            // Downstream closed before the failure could be delivered.
            }
            finishStream({
                reason: "upstream_failed"
            });
        };
        const stream = new ReadableStream({
            async start (controller) {
                streamController = controller;
                abortHandler = ()=>{
                    finishStream({
                        reason: "client_aborted"
                    });
                };
                nextInput.signal?.addEventListener("abort", abortHandler, {
                    once: true
                });
                try {
                    ws = await websocketFn(toWebSocketUrl(url), {
                        browser: "chrome_142",
                        os: "windows",
                        headers
                    });
                    if (closed) return;
                    if (nextInput.signal?.aborted) {
                        finishStream({
                            reason: "client_aborted"
                        });
                        return;
                    }
                    ws.onmessage = (event)=>{
                        if (closed) return;
                        const raw = typeof event.data === "string" ? event.data : Buffer.from(event.data).toString("utf8");
                        const sseEvent = encodeResponseSseEvent(raw);
                        if (closed) return;
                        // Filtered events (codex.* / empty payload) return an empty `sse` —
                        // skip them so no empty frame reaches the client.
                        if (sseEvent.sse) {
                            try {
                                controller.enqueue(encoder.encode(sseEvent.sse));
                            } catch  {
                                finishStream({
                                    reason: "downstream_closed",
                                    emitDone: false,
                                    closeController: false
                                });
                                return;
                            }
                        }
                        if (sseEvent.terminal) {
                            finishStream({
                                reason: "terminal_event"
                            });
                        }
                    };
                    ws.onerror = (event)=>{
                        failController("upstream_websocket_error", event.message || "Codex upstream WebSocket error");
                    };
                    ws.onclose = ()=>{
                        finishStream({
                            reason: "upstream_closed",
                            closeSocket: false
                        });
                    };
                    if (!closed) {
                        await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$providerRequestLogging$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["captureCurrentProviderBody"](url, headers, bodyString, nextInput.log);
                        ws.send(bodyString);
                    }
                } catch (error) {
                    failController("upstream_websocket_connect_failed", error instanceof Error ? error.message : String(error));
                }
            },
            cancel () {
                finishStream({
                    reason: "client_cancelled",
                    emitDone: false,
                    closeController: false
                });
            }
        });
        return {
            response: new Response(stream, {
                status: 200,
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive"
                }
            }),
            url,
            headers,
            transformedBody
        };
    }
    buildUrl(model, stream, urlIndex = 0, credentials = null) {
        void model;
        void stream;
        void urlIndex;
        const responsesSubpath = getResponsesSubpath(credentials?.requestEndpointPath);
        if (responsesSubpath !== null) {
            const baseUrl = String(this.config.baseUrl || "").replace(/\/$/, "");
            if (baseUrl.endsWith("/responses")) {
                return `${baseUrl}${responsesSubpath}`;
            }
            return `${baseUrl}/responses${responsesSubpath}`;
        }
        return super.buildUrl(model, stream, urlIndex, credentials);
    }
    /**
   * Codex Responses endpoint is SSE-first.
   * Always request event-stream from upstream, even when client requested stream=false.
   * Includes chatgpt-account-id header for strict workspace binding.
   */ buildHeaders(credentials, stream = true) {
        const isCompactRequest = isCompactResponsesEndpoint(credentials?.requestEndpointPath);
        const headers = super.buildHeaders(credentials, isCompactRequest ? false : true);
        headers.Version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexClientVersion"])();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$base$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setUserAgentHeader"])(headers, (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexUserAgent"])());
        // Add workspace binding header if workspaceId is persisted
        const workspaceId = credentials?.providerSpecificData?.workspaceId;
        if (typeof workspaceId === "string" && workspaceId) {
            headers["chatgpt-account-id"] = workspaceId;
        }
        const clientIdentity = credentials?.providerSpecificData?.codexClientIdentity;
        // Originator header — identifies the client type to the Codex backend.
        // Ref: openai/codex login/src/auth/default_client.rs DEFAULT_ORIGINATOR = "codex_cli_rs"
        headers["originator"] = "codex_cli_rs";
        // session_id header — enables prompt cache affinity on the Codex backend.
        // The official Codex client sets this to conversation_id (a stable UUID per session).
        // Ref: openai/codex codex-api/src/requests/headers.rs build_conversation_headers()
        const cacheSessionId = this.getPromptCacheSessionId(credentials, null);
        if (cacheSessionId) {
            headers["session_id"] = cacheSessionId;
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyCodexClientIdentityHeaders"])(headers, clientIdentity);
        return headers;
    }
    /**
   * Derive a stable session ID for prompt cache affinity.
   * Priority: per-conversation session_id/conversation_id from request body → workspaceId.
   * The official Codex client uses conversation_id (a unique UUID per session), NOT
   * the account-wide workspaceId. Using workspaceId caps cache hit-rate at ~49%
   * because all conversations share the same cache partition. (#1643)
   * Ref: openai/codex core/src/client.rs line 853
   */ getPromptCacheSessionId(credentials, body) {
        const promptCacheKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeCodexSessionId"])(body?.prompt_cache_key);
        if (promptCacheKey) return promptCacheKey;
        // Prefer per-session identifiers from the client request body
        const sessionId = body?.session_id ?? body?.conversation_id;
        const normalizedSessionId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeCodexSessionId"])(sessionId);
        if (normalizedSessionId) {
            return normalizedSessionId;
        }
        // Fall back to workspaceId (account-wide) — better than nothing
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["normalizeCodexSessionId"])(credentials?.providerSpecificData?.workspaceId) || null;
    }
    /**
   * Refresh Codex OAuth credentials when a 401 is received.
   * OpenAI uses rotating (one-time-use) refresh tokens — if the token was already
   * consumed by a concurrent refresh, this returns null to signal re-auth is needed.
   *
   * Fixes #251: After a server restart/upgrade, previously cached access tokens may
   * have expired or become invalid. chatCore.ts calls this on 401; previously the
   * base class returned null causing the request to fail instead of refreshing.
   */ async refreshCredentials(credentials, log) {
        if (!credentials?.refreshToken) {
            log?.warn?.("TOKEN_REFRESH", "Codex: no refresh token available, re-authentication required");
            return null;
        }
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$tokenRefresh$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getAccessToken"])("codex", credentials, log);
        if (!result) {
            log?.warn?.("TOKEN_REFRESH", "Codex: token refresh failed — re-authentication required");
            return null;
        }
        if (result.error) {
            log?.warn?.("TOKEN_REFRESH", `Codex: token refresh failed (${result.error}) — re-authentication required`);
            // Return null (not the error-only object): base.ts spreads any truthy
            // result onto activeCredentials and persists it via onCredentialsRefreshed.
            // Spreading `{ error }` would keep the stale/expired accessToken in place
            // and write garbage to the connection. Returning null leaves the original
            // credentials untouched so the upstream 401/403 drives the proper
            // re-auth / mark-expired path instead.
            return null;
        }
        return result;
    }
    /**
   * Transform request before sending - inject default instructions if missing
   */ transformRequest(model, bodyInput, stream, credentials) {
        void stream;
        // Do not mutate the caller's payload in place. Combo quality checks and
        // other post-execute paths still inspect the original request body.
        const body = bodyInput && typeof bodyInput === "object" ? structuredClone(bodyInput) : {};
        const nativeCodexPassthrough = body?._nativeCodexPassthrough === true;
        const isCompactRequest = isCompactResponsesEndpoint(credentials?.requestEndpointPath);
        const requestDefaults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$requestDefaults$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCodexRequestDefaults"])(credentials?.providerSpecificData);
        const thinkingBudgetConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getThinkingBudgetConfig"])();
        const allowConnectionReasoningDefaults = thinkingBudgetConfig.mode === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$thinkingBudget$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ThinkingMode"].PASSTHROUGH;
        consumeResponsesStoreMarker(body);
        // Codex /responses rejects stream=false, but /responses/compact rejects the stream field entirely.
        if (isCompactRequest) {
            delete body.stream;
            delete body.stream_options;
            delete body.client_metadata;
            delete body.include;
        } else {
            body.stream = true;
        }
        delete body._nativeCodexPassthrough;
        const requestServiceTier = normalizeServiceTierValue(body.service_tier);
        if (requestServiceTier) {
            body.service_tier = requestServiceTier;
        } else if (requestDefaults.serviceTier) {
            body.service_tier = requestDefaults.serviceTier;
        }
        // Issue #1832 & #1853: Map messages to input for clients like Cursor 5.5 that use responses/compact but send messages instead of input.
        // This MUST run before convertSystemToDeveloperRole and stripStoredItemReferences.
        if (!body.input && Array.isArray(body.messages)) {
            body.input = body.messages.map((msg)=>({
                    type: "message",
                    role: typeof msg.role === "string" ? msg.role : "user",
                    ...typeof msg.phase === "string" ? {
                        phase: msg.phase
                    } : {},
                    content: typeof msg.content === "string" ? [
                        {
                            type: "input_text",
                            text: msg.content
                        }
                    ] : Array.isArray(msg.content) ? msg.content.map((contentPart)=>{
                        if (contentPart && typeof contentPart === "object" && !Array.isArray(contentPart) && contentPart.type === "text") {
                            return {
                                type: "input_text",
                                text: contentPart.text
                            };
                        }
                        return contentPart;
                    }) : []
                }));
        } else if (!body.input && typeof body.prompt === "string" && body.prompt.trim()) {
            // Issue #1872: Cursor occasionally passes the request as `prompt` instead of `messages`.
            body.input = [
                {
                    type: "message",
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: body.prompt
                        }
                    ]
                }
            ];
        } else if (!body.input && Array.isArray(body.prompt)) {
            body.input = body.prompt.map((p)=>({
                    type: "message",
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: typeof p === "string" ? p : JSON.stringify(p)
                        }
                    ]
                }));
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$responsesInputNormalization$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeCodexResponsesInput"])(body);
        if (Array.isArray(body.input)) {
            body.input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$responsesInputSanitizer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeResponsesInputItems"])(body.input, false, {
                dropInternalAssistantMessages: !nativeCodexPassthrough
            });
        }
        stripOrphanedCodexFunctionCallOutputs(body);
        repairMissingCodexFunctionCallOutputs(body);
        // ── Cache-aware system prompt handling (both paths) ──
        //
        // Convert system → developer role IN-PLACE so system prompts remain in the
        // `input` array where they contribute to the automatic prompt cache prefix.
        // The `instructions` field is NOT included in the cache key for GPT-5 models.
        //
        // This applies to BOTH native passthrough (Responses API) and translated
        // (Chat Completions) paths. Previously the translated path used
        // hoistSystemMessagesToInstructions() which moved system content out of
        // `input` and into `instructions`, destroying cache eligibility.
        //
        // Ref: PR #1346 (original fix for passthrough only)
        convertSystemToDeveloperRole(body);
        if (nativeCodexPassthrough) {
            // Passthrough: minimal placeholder instructions.
            if (!body.instructions || typeof body.instructions === "string" && body.instructions.trim() === "") {
                body.instructions = "Follow the developer instructions in the conversation.";
            }
        } else {
            // Translated: keep the full Codex tool instructions only for tool-capable
            // requests. Bare chat requests still need a neutral instructions value
            // because the Codex Responses backend rejects requests without it.
            const hasTools = Array.isArray(body.tools) && body.tools.length > 0;
            if (!body.instructions || typeof body.instructions === "string" && body.instructions.trim() === "") {
                if (hasTools) {
                    body.instructions = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexInstructions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_DEFAULT_INSTRUCTIONS"];
                } else {
                    body.instructions = __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexInstructions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CODEX_CHAT_DEFAULT_INSTRUCTIONS"];
                }
            }
        }
        // Store: regular Codex Responses rejects store=true with
        // "Store must be set to false", while /responses/compact rejects the
        // store field entirely. Default regular requests to false unless the
        // provider explicitly opts in (e.g. API-key accounts that support persistence).
        // Ref: sub2api openai_codex_transform.go line 75-80
        const explicitStoreSetting = credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" && !Array.isArray(credentials.providerSpecificData) ? credentials.providerSpecificData.openaiStoreEnabled : undefined;
        if (isCompactRequest) {
            delete body.store;
        } else if (explicitStoreSetting === true) {
            body.store = true;
        } else {
            // backend rejects store=true ("Store must be set to false"), so default to false.
            body.store = false;
        }
        // Codex Responses only supports function tools with non-empty names.
        // Cursor may include custom tools (e.g. ApplyPatch) that work locally but are
        // invalid upstream, and translation bugs can leave orphaned/empty tool_choice names.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeCodexTools"])(body, {
            // gpt-5.3-codex-spark (and other Spark-scope models) reject image_generation
            // upstream even on paid-plan accounts, so drop it independent of plan (#6651).
            dropImageGeneration: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$tools$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCodexFreePlan"])(credentials?.providerSpecificData) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCodexModelScope"])(model) === "spark",
            preserveCustomTools: nativeCodexPassthrough
        });
        // Strip stored response item references (rs_, resp_, msg_ IDs) from input.
        // The /codex/responses endpoint does not persist responses even with store=true,
        // so any references to previous response items would cause 404 errors.
        stripStoredItemReferences(body);
        // Issue #806: Even for native passthrough, some clients (purist completions) might indiscriminately inject
        // a `messages` or `prompt` array which the strict Codex Responses schema rejects.
        delete body.messages;
        delete body.prompt;
        let modelEffort = null;
        let cleanModel = typeof body.model === "string" ? body.model : model;
        const splitModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2f$reasoningSuffix$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["splitCodexReasoningSuffix"])(cleanModel);
        if (splitModel.effort) {
            modelEffort = splitModel.effort;
            body.model = splitModel.baseModel;
            cleanModel = splitModel.baseModel;
        }
        const reasoningRecord = body.reasoning && typeof body.reasoning === "object" && !Array.isArray(body.reasoning) ? body.reasoning : null;
        const explicitReasoning = normalizeEffortValue(reasoningRecord?.effort);
        const requestReasoningEffort = normalizeEffortValue(body.reasoning_effort);
        const fallbackReasoningEffort = allowConnectionReasoningDefaults ? requestDefaults.reasoningEffort || "medium" : undefined;
        // Issue #2331: model suffix aliases (for example gpt-5.5-xhigh) represent an
        // explicit model selection, so they must override client-injected defaults such
        // as OpenCode's automatic reasoning.effort=medium for GPT-5-family requests.
        const rawEffort = modelEffort || explicitReasoning || requestReasoningEffort || fallbackReasoningEffort;
        if (rawEffort) {
            const clampedEffort = clampEffort(cleanModel, rawEffort);
            body.reasoning = {
                ...reasoningRecord || {},
                // Ultra coordinates delegation in Codex clients; the upstream wire effort is Max.
                effort: clampedEffort === "ultra" ? "max" : clampedEffort
            };
        }
        ensureCodexReasoningSummary(body);
        if (isCompactRequest) {
            delete body.include;
        }
        delete body.reasoning_effort;
        // Remove unsupported token limit parameters BEFORE the passthrough return.
        // Codex API rejects both max_tokens and max_output_tokens regardless of
        // whether the request came via native passthrough or translation.
        delete body.max_tokens;
        delete body.max_output_tokens;
        // VS Code Copilot BYOK Responses requests include `truncation` (for example
        // "auto" or "disabled"). The Codex /responses backend currently rejects this
        // field entirely with 400 Unsupported parameter: truncation, so strip it for
        // both native passthrough and translated requests.
        delete body.truncation;
        delete body.background; // Droid CLI sends this but Codex Responses API rejects it
        // Issue #3317: strip client-only fields the Codex Responses API rejects with
        // 400 "Unsupported parameter" — for BOTH the native passthrough (early return
        // below) and the translated path. The chat-completions path already removes
        // these (base.ts prompt_cache_retention #1884; openai-responses translator
        // safety_identifier #2770), but the responses->responses passthrough skips
        // translation. `user` is always rejected by Codex /responses, so it is removed
        // unconditionally here (unlike base.ts, which only drops it when empty).
        delete body.prompt_cache_retention;
        delete body.safety_identifier;
        delete body.user;
        // Inject prompt_cache_key for Codex prompt caching.
        // The official Codex client sets this to conversation_id (a stable UUID per session).
        // Ref: openai/codex core/src/client.rs line 853:
        //   let prompt_cache_key = Some(self.client.state.conversation_id.to_string());
        // IMPORTANT: Capture session/conversation IDs BEFORE deletion below (#1643).
        if (!body.prompt_cache_key) {
            const cacheSessionId = this.getPromptCacheSessionId(credentials, body);
            if (cacheSessionId) {
                body.prompt_cache_key = cacheSessionId;
            }
        }
        if (!isCompactRequest) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexIdentity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["applyCodexClientMetadata"])(body, credentials?.providerSpecificData?.codexClientIdentity);
        }
        // Delete session_id and conversation_id from the body.
        // These are often injected by OmniRoute's fallback logic for store=true,
        // but the upstream Codex API strictly rejects them as unsupported parameters.
        delete body.session_id;
        delete body.conversation_id;
        if (nativeCodexPassthrough) {
            return body;
        }
        // GPT-5 verbosity: fold Chat-style `verbosity` / Responses `text.verbosity` into a
        // single validated `text:{verbosity}` so the allowlist below (which now permits
        // `text`) lets it reach upstream instead of dropping it silently.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$codexVerbosity$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeCodexVerbosity"])(body);
        // Issue #2608: Use an allowlist of known Responses API fields instead of a
        // denylist of Chat Completions fields. The denylist approach missed fields
        // like `stop`, `response_format`, `logit_bias`, `function_call`, `functions`,
        // `max_completion_tokens`, and `parallel_tool_calls` — causing gpt-5.5 to
        // reject with "routing_unsupported" (400). An allowlist is future-proof:
        // any unknown field from Chat Completions (or other formats) is stripped.
        const RESPONSES_API_ALLOWLIST = new Set([
            "model",
            "input",
            "instructions",
            "tools",
            "tool_choice",
            "stream",
            "store",
            "reasoning",
            "service_tier",
            "include",
            "previous_response_id",
            "prompt_cache_key",
            "client_metadata",
            // GPT-5 output verbosity ({ verbosity } — normalized above by normalizeCodexVerbosity).
            "text",
            // Internal markers used by OmniRoute pipeline
            "_omnirouteResponsesStore"
        ]);
        for (const key of Object.keys(body)){
            if (!RESPONSES_API_ALLOWLIST.has(key)) {
                delete body[key];
            }
        }
        return body;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/services/slidingWindowLimiter.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Sliding-window rate limiter (free-claude-code port, Fase 8.2).
 *
 * A small, dependency-free fallback limiter for providers that do NOT expose
 * rate-limit headers (so the adaptive Bottleneck path in rateLimitManager never
 * learns a reservoir) but have a documented fixed cap. Bottleneck's reservoir is a
 * fixed-window counter that refills in one burst every interval; a true sliding
 * window enforces "no more than N requests in ANY trailing windowMs", which avoids
 * the 2× burst at window boundaries that can trip an upstream 429.
 *
 * It is intentionally a pure allowed/blocked oracle (no internal queueing) — the
 * caller decides whether to wait `retryAfterMs` or fall back. See
 * `withRateLimit` in rateLimitManager.ts for the opt-in wiring, gated on
 * PROVIDER_DEFAULT_RATE_LIMITS so existing providers are unaffected.
 */ __turbopack_context__.s([
    "SlidingWindowLimiter",
    ()=>SlidingWindowLimiter
]);
// Hard ceiling on distinct keys tracked, so a pathological key space (e.g. a
// per-request id leaking into the key) can never grow the map without bound.
const MAX_KEYS = 5000;
class SlidingWindowLimiter {
    hits = new Map();
    now;
    nextHitId = 1;
    constructor(opts = {}){
        this.now = opts.now ?? Date.now;
    }
    /**
   * Try to consume one slot for `key`. Records a timestamp and returns
   * `{allowed:true}` when under the cap; returns `{allowed:false, retryAfterMs}`
   * (without recording) when the trailing window is saturated.
   */ tryAcquire(key, window) {
        const result = this.tryAcquireMany([
            {
                key,
                window
            }
        ]);
        return {
            allowed: result.allowed,
            retryAfterMs: result.retryAfterMs
        };
    }
    /**
   * Acquire all supplied scopes atomically. No scope is recorded unless every
   * configured scope has capacity, preventing a global lease from being held
   * while a narrower provider/account lease is unavailable.
   */ tryAcquireMany(scopes) {
        const activeScopes = scopes.filter(({ window })=>window.requests > 0 && window.windowMs > 0);
        if (activeScopes.length === 0) return {
            allowed: true,
            retryAfterMs: 0
        };
        const now = this.now();
        const prepared = activeScopes.map((scope)=>{
            const cutoff = now - scope.window.windowMs;
            const previous = this.hits.get(scope.key);
            const live = previous ? previous.filter((hit)=>hit.timestamp > cutoff) : [];
            const retryAfterMs = live.length >= scope.window.requests ? Math.max(0, live[0].timestamp + scope.window.windowMs - now) : 0;
            return {
                scope,
                live,
                retryAfterMs
            };
        });
        const retryAfterMs = prepared.reduce((max, entry)=>Math.max(max, entry.retryAfterMs), 0);
        for (const entry of prepared)this.set(entry.scope.key, entry.live);
        if (retryAfterMs > 0) return {
            allowed: false,
            retryAfterMs
        };
        const entries = prepared.map((entry)=>{
            const hit = {
                id: this.nextHitId++,
                timestamp: now
            };
            entry.live.push(hit);
            this.set(entry.scope.key, entry.live);
            return {
                key: entry.scope.key,
                id: hit.id
            };
        });
        let released = false;
        return {
            allowed: true,
            retryAfterMs: 0,
            lease: {
                release: ()=>{
                    if (released) return;
                    released = true;
                    for (const entry of entries){
                        const live = this.hits.get(entry.key);
                        if (!live) continue;
                        const remaining = live.filter((hit)=>hit.id !== entry.id);
                        if (remaining.length > 0) this.hits.set(entry.key, remaining);
                        else this.hits.delete(entry.key);
                    }
                }
            }
        };
    }
    /** Clear history for one key, or all keys when called with no argument. */ reset(key) {
        if (key === undefined) this.hits.clear();
        else this.hits.delete(key);
    }
    set(key, live) {
        if (live.length === 0) {
            this.hits.delete(key);
            return;
        }
        if (!this.hits.has(key) && this.hits.size >= MAX_KEYS) {
            // Evict the least-recently-inserted key (Map preserves insertion order).
            const oldest = this.hits.keys().next().value;
            if (oldest !== undefined) this.hits.delete(oldest);
        }
        this.hits.set(key, live);
    }
}
}),
"[project]/open-sse/services/providerDefaultRateLimit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROVIDER_DEFAULT_CONCURRENCY_CAP",
    ()=>PROVIDER_DEFAULT_CONCURRENCY_CAP,
    "__setProviderDefaultRateLimitsForTests",
    ()=>__setProviderDefaultRateLimitsForTests,
    "acquireProviderDefaultSlot",
    ()=>acquireProviderDefaultSlot,
    "awaitProviderDefaultSlot",
    ()=>awaitProviderDefaultSlot,
    "getProviderConcurrencyCap",
    ()=>getProviderConcurrencyCap,
    "getProviderDefaultRateLimit",
    ()=>getProviderDefaultRateLimit,
    "setProviderQuotaOverrides",
    ()=>setProviderQuotaOverrides
]);
/**
 * Provider-default sliding-window rate-limit fallback (free-claude-code port, Fase 8.2).
 *
 * Providers that do NOT send rate-limit headers never let the adaptive Bottleneck path
 * in rateLimitManager learn a reservoir, so `resolveRpm` leaves them effectively
 * un-throttled. For such a provider with a *documented* fixed cap, an operator can
 * declare a default here and a sliding window (burst-free, unlike Bottleneck's
 * fixed-window reservoir which refills in one burst every interval) enforces it
 * proactively. `nvidia` is the first (and currently only) real entry — NVIDIA NIM's
 * free tier is documented as "~40 RPM" and exposes no rate-limit headers or usage
 * API (#6846 Phase 1). Every other provider still gets zero behavior change; the
 * whole path is a no-op unless an entry (or a resolved override, see below) exists.
 *
 * Composed into the rolling lease gate in `withRateLimit` (rateLimitManager.ts).
 * The exported acquire helpers remain available for provider-specific callers
 * and tests, while the main request path acquires global and provider scopes
 * atomically.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$slidingWindowLimiter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/slidingWindowLimiter.ts [app-route] (ecmascript)");
;
// Opt-in per-provider caps. Example shape (commented — add real entries as needed):
//   "some-headerless-provider": { requests: 60, windowMs: 60_000 },
const PROVIDER_DEFAULT_RATE_LIMITS = {
    nvidia: {
        requests: 40,
        windowMs: 60_000
    }
};
const PROVIDER_DEFAULT_CONCURRENCY_CAP = {
    nvidia: 6
};
let providerDefaultOverrides = null;
const limiter = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$slidingWindowLimiter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SlidingWindowLimiter"]();
/**
 * Operator-configured overrides, resolved from `ResilienceSettings.providerQuotaOverrides`
 * (see `src/lib/resilience/settings.ts`) by `rateLimitManager.ts` on init/refresh.
 * `rpm` overrides the static sliding-window budget; `concurrency` overrides the
 * default per-connection concurrency cap. A 0/missing field falls back to the
 * static default for that field.
 */ let providerQuotaOverrides = null;
function __setProviderDefaultRateLimitsForTests(map) {
    providerDefaultOverrides = map;
    limiter.reset();
}
function setProviderQuotaOverrides(map) {
    providerQuotaOverrides = map;
}
function getProviderDefaultRateLimit(provider) {
    if (!provider) return undefined;
    const rpmOverride = providerQuotaOverrides?.[provider]?.rpm;
    if (typeof rpmOverride === "number" && rpmOverride > 0) {
        return {
            requests: rpmOverride,
            windowMs: 60_000
        };
    }
    return (providerDefaultOverrides ?? PROVIDER_DEFAULT_RATE_LIMITS)[provider];
}
function getProviderConcurrencyCap(provider, fallback) {
    const override = providerQuotaOverrides?.[provider]?.concurrency;
    if (typeof override === "number" && override > 0) return override;
    const staticDefault = PROVIDER_DEFAULT_CONCURRENCY_CAP[provider];
    return typeof staticDefault === "number" && staticDefault > 0 ? staticDefault : fallback;
}
function acquireProviderDefaultSlot(provider, connectionId) {
    const cfg = getProviderDefaultRateLimit(provider);
    if (!cfg) return 0;
    const res = limiter.tryAcquire(`${provider}:${connectionId || "_"}`, cfg);
    return res.allowed ? 0 : Math.max(1, res.retryAfterMs);
}
/** Abort-aware sleep: resolves after `ms`, or rejects with AbortError if `signal` fires. */ function sleepOrAbort(ms, signal) {
    return new Promise((resolve, reject)=>{
        let onAbort = null;
        const timer = setTimeout(()=>{
            if (signal && onAbort) signal.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        if (signal) {
            onAbort = ()=>{
                clearTimeout(timer);
                const reason = signal.reason;
                const err = reason instanceof Error ? reason : new Error(typeof reason === "string" ? reason : "The operation was aborted");
                err.name = "AbortError";
                reject(err);
            };
            signal.addEventListener("abort", onAbort, {
                once: true
            });
        }
    });
}
async function awaitProviderDefaultSlot(provider, connectionId, signal, maxWaitMs) {
    const cfg = getProviderDefaultRateLimit(provider);
    if (!cfg) return;
    const budget = Math.max(cfg.windowMs, maxWaitMs && maxWaitMs > 0 ? maxWaitMs : 0);
    const start = Date.now();
    for(;;){
        const waitMs = acquireProviderDefaultSlot(provider, connectionId);
        if (waitMs === 0) return;
        if (Date.now() - start >= budget) return; // waited the budget; let it through
        await sleepOrAbort(Math.min(waitMs, budget), signal);
    }
}
}),
"[project]/open-sse/services/rollingRpmGate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RollingRpmGate",
    ()=>RollingRpmGate,
    "keyContainsConnection",
    ()=>keyContainsConnection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$slidingWindowLimiter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/slidingWindowLimiter.ts [app-route] (ecmascript)");
;
function createAbortError(signal) {
    const reason = signal.reason;
    if (reason instanceof Error) return reason;
    const error = new Error(typeof reason === "string" ? reason : "The operation was aborted");
    error.name = "AbortError";
    if (reason !== undefined) error.cause = reason;
    return error;
}
function sleepOrAbort(ms, signal) {
    return new Promise((resolve, reject)=>{
        const timer = setTimeout(()=>{
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = ()=>{
            clearTimeout(timer);
            signal?.removeEventListener("abort", onAbort);
            reject(createAbortError(signal));
        };
        if (signal) {
            if (signal.aborted) onAbort();
            else signal.addEventListener("abort", onAbort, {
                once: true
            });
        }
    });
}
function keyContainsConnection(key, connectionId) {
    const marker = `:${connectionId}`;
    return key.endsWith(marker) || key.includes(`${marker}:`);
}
class RollingRpmGate {
    options;
    limiter;
    blockedUntil;
    learnedHeaderWindows;
    windowMs;
    constructor(options){
        this.options = options;
        this.limiter = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$slidingWindowLimiter$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SlidingWindowLimiter"]();
        this.blockedUntil = new Map();
        this.learnedHeaderWindows = new Map();
        this.windowMs = 60_000;
    }
    async acquire(provider, connectionId, model, signal, maxWaitMs, startedAt) {
        const blockKey = this.options.getLimiterKey(provider, connectionId, model);
        let scopes = this.getScopes(provider, connectionId, model);
        if (scopes.length === 0 && (this.blockedUntil.get(blockKey) ?? 0) <= Date.now()) {
            return null;
        }
        for(;;){
            if (signal?.aborted) throw createAbortError(signal);
            scopes = this.getScopes(provider, connectionId, model);
            if (scopes.length === 0 && (this.blockedUntil.get(blockKey) ?? 0) <= Date.now()) {
                return null;
            }
            const now = Date.now();
            const blockedUntil = this.blockedUntil.get(blockKey) ?? 0;
            if (blockedUntil <= now) this.blockedUntil.delete(blockKey);
            let scopeBlockedUntil = 0;
            for (const scope of scopes){
                const scopeBlocked = this.blockedUntil.get(scope.key) ?? 0;
                if (scopeBlocked > now) scopeBlockedUntil = Math.max(scopeBlockedUntil, scopeBlocked);
                else if (scopeBlocked > 0) this.blockedUntil.delete(scope.key);
            }
            const forcedWaitMs = Math.max(0, blockedUntil - now, scopeBlockedUntil - now);
            if (forcedWaitMs === 0) {
                const result = this.limiter.tryAcquireMany(scopes);
                if (result.allowed) return result.lease ?? null;
                const retryAfterMs = Math.max(1, result.retryAfterMs);
                const remainingMs = maxWaitMs > 0 ? maxWaitMs - (now - startedAt) : retryAfterMs;
                if (maxWaitMs > 0 && remainingMs <= 0) {
                    throw this.options.createQueueTimeoutError(provider, model, maxWaitMs);
                }
                await sleepOrAbort(Math.min(retryAfterMs, maxWaitMs > 0 ? remainingMs : retryAfterMs), signal);
                continue;
            }
            const remainingMs = maxWaitMs > 0 ? maxWaitMs - (now - startedAt) : forcedWaitMs;
            if (maxWaitMs > 0 && remainingMs <= 0) {
                throw this.options.createQueueTimeoutError(provider, model, maxWaitMs, "upstream-cooldown");
            }
            await sleepOrAbort(Math.min(forcedWaitMs, maxWaitMs > 0 ? remainingMs : forcedWaitMs), signal);
        }
    }
    block(provider, connectionId, model, retryAfterMs) {
        if (retryAfterMs > 0) {
            const key = this.options.getLimiterKey(provider, connectionId, model);
            this.blockedUntil.set(key, Date.now() + retryAfterMs);
        }
    }
    learnHeaderWindow(provider, connectionId, model, requests, windowMs, expiresAt) {
        const key = `header:${this.options.getLimiterKey(provider, connectionId, model)}`;
        if (requests <= 0) {
            this.learnedHeaderWindows.delete(key);
            this.blockedUntil.set(key, expiresAt);
            return;
        }
        this.blockedUntil.delete(key);
        this.learnedHeaderWindows.set(key, {
            window: {
                requests,
                windowMs
            },
            expiresAt
        });
    }
    clearLearnedHeaderWindow(provider, connectionId, model) {
        const key = `header:${this.options.getLimiterKey(provider, connectionId, model)}`;
        this.learnedHeaderWindows.delete(key);
        this.blockedUntil.delete(key);
    }
    clearConnection(connectionId) {
        for (const key of this.blockedUntil.keys()){
            if (keyContainsConnection(key, connectionId)) this.blockedUntil.delete(key);
        }
        for (const key of this.learnedHeaderWindows.keys()){
            if (keyContainsConnection(key, connectionId)) this.learnedHeaderWindows.delete(key);
        }
    }
    reset() {
        this.limiter.reset();
        this.blockedUntil.clear();
        this.learnedHeaderWindows.clear();
    }
    cleanupExpired(now = Date.now()) {
        for (const [key, expiresAt] of this.blockedUntil){
            if (expiresAt <= now) this.blockedUntil.delete(key);
        }
        for (const [key, window] of this.learnedHeaderWindows){
            if (window.expiresAt <= now) this.learnedHeaderWindows.delete(key);
        }
    }
    getScopes(provider, connectionId, model) {
        const scopes = [];
        const globalRpm = this.options.getGlobalRpm();
        if (typeof globalRpm === "number" && globalRpm > 0) {
            scopes.push({
                key: "global",
                window: {
                    requests: globalRpm,
                    windowMs: this.windowMs
                }
            });
        }
        const providerWindow = this.options.getProviderWindow(provider);
        if (providerWindow) scopes.push({
            key: `provider:${provider}`,
            window: providerWindow
        });
        const connectionRpm = this.options.getConnectionRpm(connectionId);
        if (typeof connectionRpm === "number" && connectionRpm > 0) {
            scopes.push({
                key: `provider-account:${provider}:${connectionId}`,
                window: {
                    requests: connectionRpm,
                    windowMs: this.windowMs
                }
            });
        }
        const headerKey = `header:${this.options.getLimiterKey(provider, connectionId, model)}`;
        const headerBlockedUntil = this.blockedUntil.get(headerKey) ?? 0;
        const headerRemainingMs = headerBlockedUntil - Date.now();
        if (headerRemainingMs > 0) {
            scopes.push({
                key: headerKey,
                window: {
                    requests: 1,
                    windowMs: headerRemainingMs
                }
            });
            return scopes;
        }
        if (headerBlockedUntil > 0) this.blockedUntil.delete(headerKey);
        const headerWindow = this.learnedHeaderWindows.get(headerKey);
        if (headerWindow) {
            if (headerWindow.expiresAt > Date.now()) {
                scopes.push({
                    key: headerKey,
                    window: headerWindow.window
                });
            } else {
                this.learnedHeaderWindows.delete(headerKey);
            }
        }
        return scopes;
    }
}
}),
"[project]/open-sse/services/rateLimitManager/headers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─── Header Parsing ──────────────────────────────────────────────────────────
/**
 * Standard headers used by most providers (OpenAI, Fireworks, etc.)
 */ __turbopack_context__.s([
    "ANTHROPIC_HEADERS",
    ()=>ANTHROPIC_HEADERS,
    "STANDARD_HEADERS",
    ()=>STANDARD_HEADERS,
    "parseResetTime",
    ()=>parseResetTime,
    "toPlainHeaders",
    ()=>toPlainHeaders
]);
const STANDARD_HEADERS = {
    limit: "x-ratelimit-limit-requests",
    remaining: "x-ratelimit-remaining-requests",
    reset: "x-ratelimit-reset-requests",
    limitTokens: "[REDIGIDO-PRESERVACAO]",
    remainingTokens: "[REDIGIDO-PRESERVACAO]",
    resetTokens: "[REDIGIDO-PRESERVACAO]",
    retryAfter: "retry-after",
    overLimit: "x-ratelimit-over-limit"
};
const ANTHROPIC_HEADERS = {
    limit: "anthropic-ratelimit-requests-limit",
    remaining: "anthropic-ratelimit-requests-remaining",
    reset: "anthropic-ratelimit-requests-reset",
    limitTokens: "[REDIGIDO-PRESERVACAO]",
    remainingTokens: "[REDIGIDO-PRESERVACAO]",
    resetTokens: "[REDIGIDO-PRESERVACAO]",
    retryAfter: "retry-after"
};
function parseResetTime(value) {
    if (!value) return null;
    // Duration strings: "1s", "500ms", "1m30s"
    const durationMatch = value.match(/^(?:(\d+)h)?(?:(\d+)m(?!s))?(?:(\d+)s)?(?:(\d+)ms)?$/);
    if (durationMatch) {
        const [, h, m, s, ms] = durationMatch;
        return (parseInt(h || 0) * 3600 + parseInt(m || 0) * 60 + parseInt(s || 0)) * 1000 + parseInt(ms || 0);
    }
    // Pure number: assume seconds
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
        // If it looks like a Unix timestamp (> year 2025)
        if (num > 1700000000) {
            return Math.max(0, num * 1000 - Date.now());
        }
        return num * 1000;
    }
    // ISO date string
    try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return Math.max(0, date.getTime() - Date.now());
        }
    } catch  {}
    return null;
}
function toPlainHeaders(headers) {
    if (!headers) return {};
    const plain = {};
    const obj = headers;
    if (typeof obj.forEach === "function") {
        try {
            obj.forEach((v, k)=>{
                plain[k.toLowerCase()] = v;
            });
            return plain;
        } catch  {}
    }
    if (typeof obj.entries === "function") {
        try {
            for (const [k, v] of obj.entries()){
                plain[k.toLowerCase()] = v;
            }
            return plain;
        } catch  {}
    }
    try {
        for (const [k, v] of Object.entries(obj)){
            plain[k.toLowerCase()] = v == null ? "" : String(v);
        }
    } catch  {}
    return plain;
}
}),
"[project]/open-sse/services/rateLimitManager/admission.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * rateLimitManager/admission — queue-depth admission check (pure).
 *
 * `maxQueueDepth` (RequestQueueSettings, issue #6593) is an opt-in admission
 * cap on the local rate-limit queue: when set (>0), a request that would be
 * queued behind `maxQueueDepth` already-queued jobs is fast-rejected before
 * it ever reaches Bottleneck's `schedule()`, instead of growing the queue
 * unboundedly. Default `0` = disabled, preserving today's behavior exactly.
 *
 * Extracted as a pure function (no Bottleneck/limiter dependency) so it is
 * unit-testable without spinning up a real limiter.
 *
 * @module services/rateLimitManager/admission
 */ __turbopack_context__.s([
    "checkQueueAdmission",
    ()=>checkQueueAdmission
]);
function checkQueueAdmission(queuedCount, maxQueueDepth, identity) {
    if (!maxQueueDepth || maxQueueDepth <= 0) return null;
    if (queuedCount < maxQueueDepth) return null;
    const err = new Error(`Request rejected: the local rate-limit queue for ${identity} already holds ${queuedCount} ` + `queued request(s), at or above the configured admission cap maxQueueDepth (${maxQueueDepth}) ` + `— this is OmniRoute's request queue (resilienceSettings.requestQueue.maxQueueDepth), not an ` + `upstream rejection. Raise it in Settings → Resilience if this is expected burst traffic.`);
    err.code = "RATE_LIMIT_QUEUE_FULL";
    // chatCore's generic catch-all fallback (open-sse/handlers/chatCore.ts) maps a
    // status-less error to HTTP 502 — which also risks tripping the whole-provider
    // circuit breaker (PROVIDER_BREAKER_FAILURE_STATUSES includes 502) for what is a
    // purely local, in-process admission decision. Tag 429 explicitly so it is read
    // via `error.status` before that fallback kicks in.
    err.status = 429;
    return err;
}
}),
"[project]/open-sse/services/rateLimitManager.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "__flushLearnedLimitsForTests",
    ()=>__flushLearnedLimitsForTests,
    "__getLimiterForTests",
    ()=>__getLimiterForTests,
    "__getLimiterStateForTests",
    ()=>__getLimiterStateForTests,
    "__installLimiterForTests",
    ()=>__installLimiterForTests,
    "__resetRateLimitManagerForTests",
    ()=>__resetRateLimitManagerForTests,
    "__runRateLimitWatchdogForTests",
    ()=>__runRateLimitWatchdogForTests,
    "__setLastDispatchAtForTests",
    ()=>__setLastDispatchAtForTests,
    "applyRequestQueueSettings",
    ()=>applyRequestQueueSettings,
    "disableRateLimitProtection",
    ()=>disableRateLimitProtection,
    "enableRateLimitProtection",
    ()=>enableRateLimitProtection,
    "getAllRateLimitStatus",
    ()=>getAllRateLimitStatus,
    "getLearnedLimits",
    ()=>getLearnedLimits,
    "getRateLimitStatus",
    ()=>getRateLimitStatus,
    "initializeRateLimits",
    ()=>initializeRateLimits,
    "isRateLimitEnabled",
    ()=>isRateLimitEnabled,
    "refreshConnectionRateLimits",
    ()=>refreshConnectionRateLimits,
    "startRateLimitWatchdog",
    ()=>startRateLimitWatchdog,
    "stopRateLimitWatchdog",
    ()=>stopRateLimitWatchdog,
    "updateFromHeaders",
    ()=>updateFromHeaders,
    "updateFromResponseBody",
    ()=>updateFromResponseBody,
    "withRateLimit",
    ()=>withRateLimit
]);
/**
 * Rate Limit Manager — Adaptive rate limiting using Bottleneck
 *
 * Creates per-provider+connection limiters that auto-learn rate limits
 * from API response headers (x-ratelimit-*, retry-after, anthropic-ratelimit-*).
 *
 * Default: ENABLED for API key providers (safety net), DISABLED for OAuth.
 * Can be toggled per provider connection via dashboard.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bottleneck$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bottleneck/lib/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/accountFallback.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityQuotaFamily.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/providerRegistry.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/codex.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/codexQuotaScopes.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerDefaultRateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/providerDefaultRateLimit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rollingRpmGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/rollingRpmGate.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/numeric.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/resilience/settings.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/rateLimitManager/headers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$admission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/rateLimitManager/admission.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$codex$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
function toRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function createQueueTimeoutError(provider, model, maxWaitMs, reason = "local-queue", cause) {
    const target = model ? `${provider}/${model}` : provider;
    const message = reason === "upstream-cooldown" ? `Request dropped after waiting ${maxWaitMs}ms for an upstream rate-limit cooldown for ${target}. ` + `The provider cooldown outlasted OmniRoute's local wait budget; this is not local queue saturation.` : `Request dropped after exceeding the local rate-limit queue budget maxWaitMs (${maxWaitMs}ms) for ` + `${target} — this is OmniRoute's request queue ` + `(resilienceSettings.requestQueue.maxWaitMs), not an upstream timeout. Raise it in ` + `Settings → Resilience if this is queue saturation rather than a slow provider.`;
    const queueErr = new Error(message, cause === undefined ? undefined : {
        cause
    });
    queueErr.code = "RATE_LIMIT_QUEUE_TIMEOUT";
    return queueErr;
}
function isNodeTestRunnerChild() {
    return typeof process.env.NODE_TEST_CONTEXT === "string";
}
function logRateLimit(...args) {
    if (!isNodeTestRunnerChild()) console.log(...args);
}
function warnRateLimit(...args) {
    if (!isNodeTestRunnerChild()) console.warn(...args);
}
function errorRateLimit(...args) {
    if (!isNodeTestRunnerChild()) console.error(...args);
}
// Store limiters keyed by "provider:connectionId" (and optionally ":model")
const limiters = new Map();
// Store connections that have rate limit protection enabled
const enabledConnections = new Set();
// Store per-connection rate limit overrides (RPM, TPM, TPD, minTime, maxConcurrent)
// Populated from provider_connections.rateLimitOverrides on startup and refresh.
const connectionRateLimitOverrides = new Map();
// Store learned limits for persistence (debounced)
const learnedLimits = {};
const MAX_LEARNED_LIMITS = 200;
const INACTIVE_LIMITER_MS = 10 * 60 * 1000;
const limiterLastUsed = new Map();
let persistTimer = null;
const pendingAsyncOperations = new Set();
const PERSIST_DEBOUNCE_MS = 60_000; // Debounce persistence to every 60s max
// Track initialization
let initialized = false;
let currentRequestQueueSettings = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_RESILIENCE_SETTINGS"].requestQueue;
// Watchdog: detect Bottleneck limiters that are wedged (queue has work, but no
// jobs are dispatched). RPM admission happens before Bottleneck, so a queued
// Bottleneck job with no active work is a concurrency scheduler failure.
const lastDispatchAt = new Map();
let nextJobTraceId = 1;
let watchdogInterval = null;
const WATCHDOG_INTERVAL_MS = 30_000;
// Threshold has to exceed any legitimate gap caused by adaptive minTime while
// still catching the actual wedge case we observed (queue stalled for 3+
// minutes with no progress).
const WEDGE_THRESHOLD_MS = 120_000;
/**
 * Env-var override for the auto-enable safety net. Highest priority — wins
 * over the persisted dashboard setting. Use to disable in an incident without
 * needing dashboard access.
 *   RATE_LIMIT_AUTO_ENABLE=false  → never auto-enable
 *   RATE_LIMIT_AUTO_ENABLE=true   → force on regardless of dashboard
 *   (unset)                        → use dashboard setting
 */ function isAutoEnableActive(settings) {
    const env = process.env.RATE_LIMIT_AUTO_ENABLE?.trim().toLowerCase();
    if (env === "false" || env === "0" || env === "off") return false;
    if (env === "true" || env === "1" || env === "on") return true;
    return settings.autoEnableApiKeyProviders;
}
// Bottleneck handles concurrency and pacing. RPM is enforced by the rolling
// lease limiter above rather than by a fixed-window reservoir.
const EFFECTIVELY_INFINITE_CONCURRENCY = 1000;
// Resolve a minTime override. 0 or missing means "no minimum gap".
function resolveMinTime(override) {
    return typeof override === "number" && override > 0 ? override : 0;
}
// Resolve a maxConcurrent override. 0 or missing means "effectively infinite".
function resolveMaxConcurrent(override) {
    return typeof override === "number" && override > 0 ? override : EFFECTIVELY_INFINITE_CONCURRENCY;
}
function buildLimiterDefaults() {
    return {
        maxConcurrent: resolveMaxConcurrent(currentRequestQueueSettings.concurrentRequests),
        minTime: resolveMinTime(currentRequestQueueSettings.minTimeBetweenRequestsMs)
    };
}
/**
 * Apply new settings to a Bottleneck limiter and re-arm its reservoir-refresh
 * heartbeat.
 *
 * Bottleneck 2.19.5 (frozen upstream dependency, no release since 2019) has a
 * bug in `LocalDatastore#_startHeartbeat()`
 * (node_modules/bottleneck/lib/LocalDatastore.js:29,56): the guard
 * `if (this.heartbeat == null && ...)` only (re)creates the periodic
 * reservoir-refresh interval the FIRST time it runs. Every later call —
 * including the one `updateSettings()` itself triggers internally — falls
 * into the `else` branch and does `clearInterval(this.heartbeat)` WITHOUT
 * resetting `this.heartbeat` back to `null`. Because the stale reference is
 * left in place, every future `_startHeartbeat()` call keeps taking the same
 * dead `else` branch: the periodic reservoir refresh is gone forever after
 * the FIRST manual `updateSettings()` call on a limiter — every limiter here
 * starts with a live heartbeat (buildLimiterDefaults() always sets
 * reservoirRefreshInterval/reservoirRefreshAmount), so that "first call" is
 * whichever of the 5 updateSettings() call sites in this file runs first.
 *
 * Work around it here instead of patching node_modules: null out the stale
 * reference ourselves and re-invoke `_startHeartbeat()` so it takes the
 * "start a fresh interval" branch again. Every `limiter.updateSettings(...)`
 * call in this file MUST go through this helper, never Bottleneck's method
 * directly.
 */ async function applyLimiterSettings(limiter, updates) {
    await limiter.updateSettings(updates);
    const store = limiter._store;
    if (store && typeof store._startHeartbeat === "function") {
        if (store.heartbeat != null) clearInterval(store.heartbeat);
        store.heartbeat = null;
        store._startHeartbeat();
    }
}
async function updateAllLimiterSettings() {
    const defaults = buildLimiterDefaults();
    await Promise.all(Array.from(limiters.values(), (limiter)=>applyLimiterSettings(limiter, defaults)));
}
function reconcileEnabledConnections(connectionsRaw, requestQueueSettings) {
    const nextEnabledConnections = new Set();
    let explicitCount = 0;
    let autoCount = 0;
    for (const connRaw of connectionsRaw){
        const conn = toRecord(connRaw);
        const connectionId = typeof conn.id === "string" ? conn.id : "";
        const provider = typeof conn.provider === "string" ? conn.provider : "";
        const isActive = conn.isActive === true;
        const rateLimitProtection = conn.rateLimitProtection === true;
        if (!connectionId || !provider) continue;
        if (rateLimitProtection) {
            nextEnabledConnections.add(connectionId);
            explicitCount++;
            continue;
        }
        if (isAutoEnableActive(requestQueueSettings) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerRegistry$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getProviderCategory"])(provider) === "apikey" && isActive) {
            nextEnabledConnections.add(connectionId);
            autoCount++;
            // Route through getLimiter so the `queued`/`executing` listeners and
            // lastDispatchAt heartbeat are wired up — otherwise the watchdog sees
            // `stalledMs = now - 0` and falsely flags healthy idle limiters as wedged.
            getLimiter(provider, connectionId);
        }
    }
    for (const connectionId of Array.from(enabledConnections)){
        if (!nextEnabledConnections.has(connectionId)) {
            disableRateLimitProtection(connectionId);
        }
    }
    for (const connectionId of nextEnabledConnections){
        enabledConnections.add(connectionId);
    }
    return {
        explicitCount,
        autoCount
    };
}
function watchdogTick() {
    const now = Date.now();
    rpmGate.cleanupExpired(now);
    // Clean up idle limiters that haven't been used recently
    for (const [key, limiter] of Array.from(limiters)){
        const lastUsed = limiterLastUsed.get(key) ?? 0;
        if (now - lastUsed > INACTIVE_LIMITER_MS) {
            const counts = limiter.counts();
            if (counts.RECEIVED === 0 && counts.QUEUED === 0 && counts.RUNNING === 0 && counts.EXECUTING === 0) {
                limiters.delete(key);
                lastDispatchAt.delete(key);
                limiterLastUsed.delete(key);
                logRateLimit(`🧹 [RATE-LIMIT] Evicting idle limiter: ${key} (inactive for ${Math.round((now - lastUsed) / 1000)}s)`);
                trackAsyncOperation(limiter.disconnect());
            }
        }
    }
    for (const [key, limiter] of Array.from(limiters)){
        const counts = limiter.counts();
        // RECEIVED-only work is still active and must not be evicted. Once a job
        // is stably queued, Bottleneck reports it in QUEUED with RECEIVED=0; that
        // is the state the wedge detector is designed to recover.
        if (counts.RECEIVED > 0 || counts.QUEUED === 0) continue;
        if (counts.RUNNING > 0 || counts.EXECUTING > 0) continue;
        const lastDispatch = lastDispatchAt.get(key);
        // No heartbeat yet → seed it and skip this tick. Prevents false wedge
        // detection on a brand-new limiter or one created outside getLimiter.
        if (lastDispatch === undefined) {
            lastDispatchAt.set(key, now);
            continue;
        }
        const stalledMs = now - lastDispatch;
        if (stalledMs < WEDGE_THRESHOLD_MS) continue;
        warnRateLimit(`🚨 [RATE-LIMIT] WEDGED: ${key} received=${counts.RECEIVED} queued=${counts.QUEUED} running=0 executing=0 stalled=${stalledMs}ms — force-resetting`);
        // Live incident (log id 1784465227489-a2cbc0): disconnect() releases the
        // heartbeat timer but does NOT reject the QUEUED jobs already sitting on
        // this instance — withRateLimit's `limiter.schedule()` for those callers
        // then just hangs forever (nothing will ever dequeue them; getLimiter()
        // only hands out a FRESH instance to future callers), leaving the
        // dispatch orphaned until the outer ~300s per-target timeout eventually
        // aborts it. Real clients routinely give up (and retry) well before that
        // — this specific incident's client aborted at ~60s having never reached
        // the provider at all (queued=2 running=0 executing=0 the entire time).
        //
        // stop({ dropWaitingJobs: true }) rejects exactly the RECEIVED/QUEUED/
        // RUNNING jobs on THIS instance immediately (Bottleneck's own contract —
        // see node_modules/bottleneck/bottleneck.d.ts StopOptions) so those
        // withRateLimit() callers reject right away instead of hanging, letting
        // combo's fallback/cooldown-wait engage within seconds instead of minutes.
        // This is safe against the previously-documented "spurious 502 bursts"
        // concern: the wedge condition checked above already requires
        // RUNNING === 0 && EXECUTING === 0, so no job that's actually progressing
        // can be caught by this — only ones already confirmed stuck. The instance
        // is deleted from `limiters` synchronously (above) before this call, so
        // no future getLimiter() call can ever hand out this now-stopped instance
        // — the "permanently rejects future .schedule()" behavior stop() has is
        // therefore moot; nothing will call .schedule() on it again.
        evictWedgeLimiter(key, limiter);
    }
}
let shutdownHandlersRegistered = false;
function startRateLimitWatchdog() {
    if (watchdogInterval) return;
    watchdogInterval = setInterval(watchdogTick, WATCHDOG_INTERVAL_MS);
    watchdogInterval.unref?.();
    // Register SIGTERM/SIGINT shutdown handlers once, lazily, on first watchdog start.
    // Registering here (rather than at module load) avoids interfering with test runner
    // subprocess IPC teardown — the test suite does not call startRateLimitWatchdog().
    if (!shutdownHandlersRegistered) {
        shutdownHandlersRegistered = true;
        process.once("SIGTERM", shutdownLimiters);
        process.once("SIGINT", shutdownLimiters);
    }
}
function stopRateLimitWatchdog() {
    if (!watchdogInterval) return;
    clearInterval(watchdogInterval);
    watchdogInterval = null;
}
function __installLimiterForTests(provider, connectionId, limiter, model = null) {
    const key = getLimiterKey(provider, connectionId, model);
    limiters.set(key, limiter);
    lastDispatchAt.set(key, Date.now());
    limiterLastUsed.set(key, Date.now());
}
function __runRateLimitWatchdogForTests() {
    watchdogTick();
}
function __getLimiterForTests(provider, connectionId, model = null) {
    return getLimiter(provider, connectionId, model);
}
function __setLastDispatchAtForTests(provider, connectionId, model, timestamp) {
    lastDispatchAt.set(getLimiterKey(provider, connectionId, model), timestamp);
}
function evictWedgeLimiter(key, limiter) {
    if (limiters.get(key) !== limiter) return;
    evictLimiterAndDropQueued(key, limiter, "rate-limit-watchdog-wedge-reset");
}
/**
 * Gracefully stop all limiters for process shutdown.
 * ONLY call this from SIGTERM/SIGINT handlers — not during runtime resets.
 * Calling .stop() during runtime (e.g. on 429 or connection disable) permanently
 * rejects future .schedule() calls, causing 502 bursts. This function is the
 * sole legitimate use of limiter.stop() in this module.
 */ function shutdownLimiters() {
    for (const limiter of limiters.values()){
        limiter.stop({
            dropWaitingJobs: false
        });
    }
    limiters.clear();
    lastDispatchAt.clear();
    limiterLastUsed.clear();
}
// Only register shutdown handlers when there are active limiters to shut down.
// Guard with once() so repeated registrations (e.g. test resets) don't stack.
// Note: these are registered lazily in startRateLimitWatchdog() to avoid
// interfering with test runner subprocess IPC teardown.
function trackAsyncOperation(promise) {
    pendingAsyncOperations.add(promise);
    // Do not use a fire-and-forget `.finally()` here: it creates a derived
    // Promise that mirrors rejections from `promise`. When the caller intentionally
    // tracks a background cleanup without awaiting it, that derived Promise can be
    // reported as an unhandled rejection during Node's test-runner IPC teardown.
    void promise.then(()=>{
        pendingAsyncOperations.delete(promise);
    }, ()=>{
        pendingAsyncOperations.delete(promise);
    });
    return promise;
}
async function initializeRateLimits() {
    if (initialized) return;
    initialized = true;
    try {
        const { getCachedProviderConnections, getSettings } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
        const [connections, settings] = await Promise.all([
            getCachedProviderConnections(),
            getSettings()
        ]);
        const resilience = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$resilience$2f$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResilienceSettings"])(settings);
        currentRequestQueueSettings = {
            ...resilience.requestQueue
        };
        // #6846 Phase 1: operator overrides for header-less providers' static RPM
        // budget + concurrency cap (nvidia today). No-op for every provider without
        // an entry in either providerQuotaOverrides or PROVIDER_DEFAULT_RATE_LIMITS.
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerDefaultRateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setProviderQuotaOverrides"])(resilience.providerQuotaOverrides);
        // Load per-connection rate limit overrides before reconciliation can create
        // any limiter. The RPM gate reads these overrides at admission time, and
        // Bottleneck still needs the non-RPM connection settings immediately.
        connectionRateLimitOverrides.clear();
        for (const conn of connections){
            const overrides = conn.rateLimitOverrides;
            if (overrides && typeof overrides === "object" && !Array.isArray(overrides)) {
                connectionRateLimitOverrides.set(String(conn.id), overrides);
            }
        }
        const { explicitCount, autoCount } = reconcileEnabledConnections(connections, currentRequestQueueSettings);
        updateAllLimiterSettings();
        if (explicitCount > 0 || autoCount > 0) {
            logRateLimit(`🛡️ [RATE-LIMIT] Loaded ${explicitCount} explicit + ${autoCount} auto-enabled protection(s)`);
        }
        // Load persisted learned limits
        await loadPersistedLimits();
        // Watchdog runs unconditionally — cheap, only fires when something is
        // actually wedged.
        startRateLimitWatchdog();
    } catch (err) {
        errorRateLimit("[RATE-LIMIT] Failed to load settings:", err.message);
    }
}
async function applyRequestQueueSettings(nextSettings) {
    currentRequestQueueSettings = {
        ...nextSettings
    };
    const { getCachedProviderConnections } = await __turbopack_context__.A("[project]/src/lib/localDb.ts [app-route] (ecmascript, async loader)");
    const connections = await getCachedProviderConnections();
    reconcileEnabledConnections(connections, currentRequestQueueSettings);
    await updateAllLimiterSettings();
}
function enableRateLimitProtection(connectionId) {
    enabledConnections.add(connectionId);
}
function disableRateLimitProtection(connectionId) {
    enabledConnections.delete(connectionId);
    // Drop queued jobs before evicting the limiter. Otherwise disconnect() leaves
    // callers waiting on an instance that is no longer reachable from the cache.
    for (const [key, limiter] of Array.from(limiters)){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rollingRpmGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyContainsConnection"])(key, connectionId)) {
            evictLimiterAndDropQueued(key, limiter, "rate-limit-connection-disabled");
        }
    }
    rpmGate.clearConnection(connectionId);
}
function isRateLimitEnabled(connectionId) {
    return enabledConnections.has(connectionId);
}
function refreshConnectionRateLimits(connectionId, overrides) {
    if (overrides === null || overrides === undefined) {
        connectionRateLimitOverrides.delete(connectionId);
    } else {
        connectionRateLimitOverrides.set(connectionId, overrides);
    }
    // Evict limiters referencing this connection so they get recreated on next use
    for (const [key, limiter] of Array.from(limiters)){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rollingRpmGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["keyContainsConnection"])(key, connectionId)) {
            evictLimiterAndDropQueued(key, limiter, "rate-limit-settings-refresh");
        }
    }
    rpmGate.clearConnection(connectionId);
}
/**
 * Get or create a limiter for a given provider+connection combination
 */ function getLimiterKey(provider, connectionId, model = null) {
    if (provider === "codex" && model) {
        return `${provider}:${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexQuotaScopes$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCodexRateLimitKey"])(connectionId, model)}`;
    }
    if ((provider === "antigravity" || provider === "agy") && model) {
        const family = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityQuotaFamily$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAntigravityQuotaFamily"])(model);
        const scope = family === "other" ? model : family;
        return `${provider}:${connectionId}:${scope}`;
    }
    // Gemini AI Studio and GitHub Copilot have per-model quotas — use model-scoped
    // limiter keys so a 429 on one model doesn't pause requests for other models.
    if ((provider === "gemini" || provider === "github") && model) {
        return `${provider}:${connectionId}:${model}`;
    }
    return `${provider}:${connectionId}`;
}
const rpmGate = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rollingRpmGate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RollingRpmGate"]({
    getGlobalRpm: ()=>currentRequestQueueSettings.requestsPerMinute,
    getProviderWindow: __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$providerDefaultRateLimit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getProviderDefaultRateLimit"],
    getConnectionRpm: (connectionId)=>connectionRateLimitOverrides.get(connectionId)?.rpm,
    getLimiterKey,
    createQueueTimeoutError: (provider, model, maxWaitMs, reason)=>createQueueTimeoutError(provider, model, maxWaitMs, reason)
});
function getLimiter(provider, connectionId, model = null) {
    const key = getLimiterKey(provider, connectionId, model);
    if (!limiters.has(key)) {
        const defaults = buildLimiterDefaults();
        const overrides = connectionRateLimitOverrides.get(connectionId);
        if (overrides) {
            // 0 (or missing) means "no override — fall through to buildLimiterDefaults()".
            if (typeof overrides.maxConcurrent === "number" && overrides.maxConcurrent > 0) {
                defaults.maxConcurrent = overrides.maxConcurrent;
            }
            if (typeof overrides.minTime === "number" && overrides.minTime > 0) {
                defaults.minTime = overrides.minTime;
            }
        // TODO: TPM/TPD integration — requires a token-bucket vs request-bucket
        // separation. RPM is handled by the rolling lease gate below.
        // When added, treat 0/missing the same way: fall through to system default.
        }
        const limiter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bottleneck$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
            ...defaults,
            id: key
        });
        // Heartbeat: timestamp every dispatch so the watchdog can tell a healthy
        // queue (just dispatched a job) from a wedged one (queue has work but
        // nothing has been dispatched in a while).
        limiter.on("executing", ()=>{
            lastDispatchAt.set(key, Date.now());
        });
        limiters.set(key, limiter);
        lastDispatchAt.set(key, Date.now());
        limiterLastUsed.set(key, Date.now());
    }
    limiterLastUsed.set(key, Date.now());
    return limiters.get(key);
}
function evictLimiterAndDropQueued(key, limiter, reason) {
    if (limiters.get(key) === limiter) {
        limiters.delete(key);
        lastDispatchAt.delete(key);
        limiterLastUsed.delete(key);
    }
    trackAsyncOperation(limiter.stop({
        dropWaitingJobs: true,
        dropErrorMessage: reason
    }));
}
async function withRateLimit(provider, connectionId, model, fn, signal = null) {
    if (!enabledConnections.has(connectionId)) {
        return fn();
    }
    if (signal?.aborted) {
        const reason = signal.reason;
        if (reason instanceof Error) throw reason;
        const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
        err.name = "AbortError";
        throw err;
    }
    const maxWaitMs = currentRequestQueueSettings.maxWaitMs;
    const queueStartedAt = Date.now();
    const rpmLease = await rpmGate.acquire(provider, connectionId, model, signal, maxWaitMs, queueStartedAt);
    const limiter = getLimiter(provider, connectionId, model);
    const key = getLimiterKey(provider, connectionId, model);
    const jobId = `${key}:job-${nextJobTraceId++}`;
    const scheduleOpts = {
        id: jobId
    };
    // Issue #6593: opt-in admission cap — fast-reject before Bottleneck's
    // schedule() (and before any downstream compression/prompt work runs) when
    // the queue is already at/over maxQueueDepth. Default 0 = disabled.
    const admissionErr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$admission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkQueueAdmission"])(limiter.counts().QUEUED, currentRequestQueueSettings.maxQueueDepth, model ? `${provider}/${model}` : provider);
    if (admissionErr) {
        rpmLease?.release();
        logRateLimit(`🚧 [RATE-LIMIT] ${getLimiterKey(provider, connectionId, model)} — queue full, rejecting fast (maxQueueDepth=${currentRequestQueueSettings.maxQueueDepth})`);
        throw admissionErr;
    }
    let dispatched = false;
    let queueExpired = false;
    let dispatchCancelled = false;
    let queueTimer;
    const remainingWaitMs = maxWaitMs > 0 ? Math.max(1, maxWaitMs - (Date.now() - queueStartedAt)) : 0;
    const queueTimeoutPromise = remainingWaitMs > 0 ? new Promise((_, reject)=>{
        queueTimer = setTimeout(()=>{
            if (dispatched) return;
            queueExpired = true;
            logRateLimit(`⏰ [RATE-LIMIT] ${key} — job exceeded ${Math.ceil(maxWaitMs / 1000)}s queue wait budget, dropping`);
            reject(new Error("rate-limit-queue-timeout"));
        }, remainingWaitMs);
    }) : null;
    const scheduled = limiter.schedule(scheduleOpts, async ()=>{
        if (queueExpired) {
            throw createQueueTimeoutError(provider, model, maxWaitMs);
        }
        if (dispatchCancelled) {
            const error = new Error("The operation was aborted before limiter dispatch");
            error.name = "AbortError";
            throw error;
        }
        if (signal?.aborted) {
            const error = new Error("The operation was aborted before limiter dispatch");
            error.name = "AbortError";
            throw error;
        }
        dispatched = true;
        if (queueTimer) clearTimeout(queueTimer);
        return fn();
    });
    try {
        if (signal) {
            let abortListener;
            const abortPromise = new Promise((_, reject)=>{
                const onAbort = ()=>{
                    const reason = signal.reason;
                    // Reject before evicting the queued job so the caller observes its
                    // abort reason instead of Bottleneck's internal drop error.
                    if (reason instanceof Error) {
                        reject(reason);
                    } else {
                        const err = new Error(typeof reason === "string" ? reason : "The operation was aborted");
                        err.name = "AbortError";
                        if (reason !== undefined) {
                            err.cause = reason;
                        }
                        reject(err);
                    }
                    if (!dispatched) {
                        dispatchCancelled = true;
                        if (queueTimer) clearTimeout(queueTimer);
                    // Leave the cancelled job in Bottleneck so queued peers are not dropped.
                    // Its scheduled callback will consume one queue turn and exit before fn().
                    }
                };
                if (signal.aborted) {
                    onAbort();
                    return;
                }
                abortListener = onAbort;
                signal.addEventListener("abort", abortListener, {
                    once: true
                });
            });
            try {
                const races = [
                    scheduled,
                    abortPromise
                ];
                if (queueTimeoutPromise) races.push(queueTimeoutPromise);
                return await Promise.race(races);
            } finally{
                if (abortListener) {
                    signal.removeEventListener("abort", abortListener);
                }
            }
        } else {
            return await (queueTimeoutPromise ? Promise.race([
                scheduled,
                queueTimeoutPromise
            ]) : scheduled);
        }
    } catch (err) {
        if (queueTimer) clearTimeout(queueTimer);
        if (!dispatched) rpmLease?.release();
        if (err?.message === "rate-limit-upstream-429") {
            const rateLimitErr = new Error(`Request dropped while the ${provider} connection was under an upstream rate-limit cooldown`, {
                cause: err
            });
            rateLimitErr.code = "RATE_LIMIT_UPSTREAM_429";
            rateLimitErr.status = 429;
            throw rateLimitErr;
        }
        // The watchdog's stop({ dropWaitingJobs: true }) wedge-recovery (above) rejects
        // queued jobs with this exact message. Rewrite it the same way as the timeout
        // case — a clear, OmniRoute-owned, classifiable error — so combo's transient-error
        // handling (which already treats a 502 as retryable) falls back to the next target
        // immediately instead of surfacing Bottleneck's internal wording.
        if (err?.message === "rate-limit-watchdog-wedge-reset") {
            const wedgeErr = new Error(`Request dropped: the local rate-limit queue for ${model ? `${provider}/${model}` : provider} ` + `was detected as wedged (stalled with nothing executing) and force-reset. This is OmniRoute's ` + `own queue recovering, not an upstream error.`, {
                cause: err
            });
            wedgeErr.code = "RATE_LIMIT_QUEUE_WEDGED";
            throw wedgeErr;
        }
        if (err?.message === "rate-limit-queue-timeout") {
            throw createQueueTimeoutError(provider, model, maxWaitMs);
        }
        throw err;
    }
}
function updateFromHeaders(provider, connectionId, headers, status, model = null) {
    if (!enabledConnections.has(connectionId)) return;
    if (!headers) return;
    const plainHeaders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toPlainHeaders"])(headers);
    const limiter = getLimiter(provider, connectionId, model);
    const headerMap = provider === "claude" || provider === "anthropic" ? __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ANTHROPIC_HEADERS"] : __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["STANDARD_HEADERS"];
    // Get header values (handle both Headers object and plain object)
    const getHeader = (name)=>{
        return plainHeaders[name.toLowerCase()] || null;
    };
    const limit = parseInt(getHeader(headerMap.limit));
    const remaining = parseInt(getHeader(headerMap.remaining));
    const resetStr = getHeader(headerMap.reset);
    const retryAfterStr = getHeader(headerMap.retryAfter);
    const overLimit = getHeader(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["STANDARD_HEADERS"].overLimit);
    // Handle 429 — rate limited
    if (status === 429) {
        const retryAfterMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(retryAfterStr) || 60000; // Default 60s
        const counts = limiter.counts();
        const limiterKey = getLimiterKey(provider, connectionId, model);
        logRateLimit(`🚫 [RATE-LIMIT] ${provider}:${connectionId.slice(0, 8)} — 429 received, pausing for ${Math.ceil(retryAfterMs / 1000)}s, dropping ${counts.QUEUED} queued request(s)`);
        rpmGate.block(provider, connectionId, model, retryAfterMs);
        // Evict from the cache before stopping so follow-up requests get a fresh
        // instance. Stopping the unreachable instance rejects its queued jobs and
        // releases its heartbeat without poisoning the replacement limiter.
        evictLimiterAndDropQueued(limiterKey, limiter, "rate-limit-upstream-429");
        return;
    }
    // Handle "over limit" soft warning (Fireworks)
    if (overLimit === "yes") {
        logRateLimit(`⚠️ [RATE-LIMIT] ${provider}:${connectionId.slice(0, 8)} — near capacity, slowing down`);
        trackAsyncOperation(applyLimiterSettings(limiter, {
            minTime: 200
        }));
        return;
    }
    // Normal response — update limiter from headers
    if (!isNaN(limit) && limit > 0) {
        // Calculate optimal minTime from RPM limit
        const minTime = Math.max(0, Math.floor(60000 / limit) - 10); // Small buffer
        const updates = {
            minTime
        };
        const resetMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$rateLimitManager$2f$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseResetTime"])(resetStr) || 60000;
        // Keep adaptive pacing from response headers, but do not mutate an RPM
        // reservoir. RPM admission is enforced by the rolling lease gate.
        if (!isNaN(remaining)) {
            if (remaining < limit * 0.1) {
                rpmGate.learnHeaderWindow(provider, connectionId, model, remaining, resetMs, Date.now() + resetMs);
                logRateLimit(`⚠️ [RATE-LIMIT] ${provider}:${connectionId.slice(0, 8)} — ${remaining}/${limit} remaining, throttling`);
            } else if (remaining > limit * 0.5) {
                // Plenty of headroom — relax the limiter
                updates.minTime = 0;
                rpmGate.clearLearnedHeaderWindow(provider, connectionId, model);
            }
        }
        trackAsyncOperation(applyLimiterSettings(limiter, updates));
        // Persist learned limits (debounced)
        recordLearnedLimit(provider, connectionId, {
            limit,
            remaining,
            minTime: updates.minTime
        }, model);
    }
}
function getRateLimitStatus(provider, connectionId) {
    const key = `${provider}:${connectionId}`;
    const limiter = limiters.get(key);
    if (!limiter) {
        return {
            enabled: enabledConnections.has(connectionId),
            active: false,
            queued: 0,
            running: 0
        };
    }
    const counts = limiter.counts();
    return {
        enabled: enabledConnections.has(connectionId),
        active: true,
        queued: counts.QUEUED || 0,
        running: counts.RUNNING || 0,
        executing: counts.EXECUTING || 0,
        done: counts.DONE || 0
    };
}
function getAllRateLimitStatus() {
    const result = {};
    for (const [key, limiter] of limiters){
        const counts = limiter.counts();
        result[key] = {
            queued: counts.QUEUED || 0,
            running: counts.RUNNING || 0,
            executing: counts.EXECUTING || 0
        };
    }
    return result;
}
function getLearnedLimits() {
    return {
        ...learnedLimits
    };
}
// ─── Persistence ────────────────────────────────────────────────────────────
async function persistLearnedLimitsNow() {
    try {
        const { updateSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
        await updateSettings({
            learnedRateLimits: JSON.stringify(learnedLimits)
        });
        logRateLimit(`💾 [RATE-LIMIT] Persisted learned limits for ${Object.keys(learnedLimits).length} provider(s)`);
    } catch (err) {
        errorRateLimit("[RATE-LIMIT] Failed to persist learned limits:", err.message);
    }
}
/**
 * Record a learned limit for debounced persistence.
 */ function recordLearnedLimit(provider, connectionId, limits, model = null) {
    const key = getLimiterKey(provider, connectionId, model);
    learnedLimits[key] = {
        ...limits,
        provider,
        connectionId,
        lastUpdated: Date.now()
    };
    // Debounce: save at most once per PERSIST_DEBOUNCE_MS
    if (!persistTimer) {
        persistTimer = setTimeout(async ()=>{
            persistTimer = null;
            await trackAsyncOperation(persistLearnedLimitsNow());
        }, PERSIST_DEBOUNCE_MS);
    }
}
async function __flushLearnedLimitsForTests() {
    if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = null;
    }
    await trackAsyncOperation(persistLearnedLimitsNow());
    if (pendingAsyncOperations.size > 0) {
        await Promise.allSettled(Array.from(pendingAsyncOperations));
    }
}
async function __resetRateLimitManagerForTests() {
    if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = null;
    }
    // Collect and await all disconnect() Promises so Bottleneck's internal
    // yieldLoop(0) calls settle before the next test starts. Not awaiting
    // these can cause the Node.js test runner IPC channel to receive a
    // corrupted message when the pending Promise fires during IPC serialization.
    const disconnectPromises = [];
    for (const limiter of limiters.values()){
        disconnectPromises.push(limiter.disconnect());
    }
    limiters.clear();
    enabledConnections.clear();
    connectionRateLimitOverrides.clear();
    rpmGate.reset();
    initialized = false;
    lastDispatchAt.clear();
    limiterLastUsed.clear();
    shutdownHandlersRegistered = false;
    for (const key of Object.keys(learnedLimits)){
        delete learnedLimits[key];
    }
    if (pendingAsyncOperations.size > 0) {
        await Promise.allSettled(Array.from(pendingAsyncOperations));
    }
    if (disconnectPromises.length > 0) {
        await Promise.allSettled(disconnectPromises);
    }
}
async function __getLimiterStateForTests(provider, connectionId, model = null) {
    const key = getLimiterKey(provider, connectionId, model);
    const limiter = limiters.get(key);
    if (!limiter) return null;
    const counts = limiter.counts();
    const reservoir = await limiter.currentReservoir();
    return {
        key,
        reservoir,
        queued: counts.QUEUED || 0,
        running: counts.RUNNING || 0,
        executing: counts.EXECUTING || 0,
        done: counts.DONE || 0
    };
}
/**
 * Load persisted learned limits on startup.
 */ async function loadPersistedLimits() {
    try {
        const { getSettings } = await __turbopack_context__.A("[project]/src/lib/db/settings.ts [app-route] (ecmascript, async loader)");
        const settings = await getSettings();
        const raw = settings?.learnedRateLimits;
        if (typeof raw !== "string" || raw.trim().length === 0) return;
        const parsed = toRecord(JSON.parse(raw));
        let count = 0;
        for (const [key, dataRaw] of Object.entries(parsed)){
            const data = toRecord(dataRaw);
            const lastUpdated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(data.lastUpdated, 0);
            // Skip stale entries (older than 24h)
            if (lastUpdated > 0 && Date.now() - lastUpdated > 24 * 60 * 60 * 1000) continue;
            const connectionId = typeof data.connectionId === "string" ? data.connectionId : "";
            const provider = typeof data.provider === "string" ? data.provider : "";
            const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(data.limit, 0);
            const remaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(data.remaining, 0);
            const minTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$numeric$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toNumber"])(data.minTime, 0);
            learnedLimits[key] = {
                provider,
                connectionId,
                lastUpdated,
                ...limit > 0 ? {
                    limit
                } : {},
                ...remaining >= 0 ? {
                    remaining
                } : {},
                ...minTime >= 0 ? {
                    minTime
                } : {}
            };
            // Apply to limiter if it exists and has rate limit enabled
            if (connectionId && enabledConnections.has(connectionId)) {
                const limiter = limiters.get(key);
                if (limiter && limit > 0) {
                    const inferredMinTime = minTime || Math.max(0, Math.floor(60000 / limit) - 10);
                    await applyLimiterSettings(limiter, {
                        minTime: inferredMinTime
                    });
                    count++;
                }
            }
        }
        if (count > 0) {
            logRateLimit(`📥 [RATE-LIMIT] Restored ${count} learned rate limit(s) from persistence`);
        }
    } catch (err) {
        errorRateLimit("[RATE-LIMIT] Failed to load persisted limits:", err.message);
    }
}
function updateFromResponseBody(provider, connectionId, responseBody, status, model = null) {
    if (!enabledConnections.has(connectionId)) return;
    const { retryAfterMs, reason } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$accountFallback$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["parseRetryAfterFromBody"])(responseBody);
    if (retryAfterMs && retryAfterMs > 0) {
        getLimiter(provider, connectionId, model);
        logRateLimit(`🚫 [RATE-LIMIT] ${provider}:${connectionId.slice(0, 8)} — body-parsed retry: ${Math.ceil(retryAfterMs / 1000)}s (${reason})`);
        rpmGate.block(provider, connectionId, model, retryAfterMs);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=open-sse_1fw4mad._.js.map
module.exports = [
"[project]/open-sse/handlers/videoGeneration/googleFlow.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Google Flow (labs.google/flow) video generation — pure helpers.
 *
 * Google Flow drives Veo video generation through Google's internal AI Sandbox
 * endpoint (`aisandbox-pa.googleapis.com`) using a Google account OAuth bearer
 * token — the same Google OAuth credential family that the Antigravity provider
 * already uses (accessToken + Cloud Code projectId). The request/response shape
 * mirrors the *documented* Veo `predictLongRunning` long-running-operation API
 * (see `open-sse/executors/vertexMedia.ts::vertexGenerateVideo`):
 *
 *   submit  →  { instances: [{ prompt, image? }], parameters: { sampleCount, ... } }  →  { name: <operation> }
 *   poll    →  { operationName }  →  { done, error?, response: { videos: [{ bytesBase64Encoded | gcsUri }] } }
 *
 * ⚠️ PENDING LIVE VALIDATION (Hard Rule #18): the exact AI-Sandbox URL path and
 * whether Flow wraps the Veo body in the Cloud-Code `{ project, request }` envelope
 * cannot be unit-tested — they require a real Google Flow account + a captured HAR.
 * Everything that depends on the wire host/path is isolated in the two constants
 * below and in the handler, so confirming a captured HAR is a one-line change.
 * The transformation logic in this file is grounded in the documented Veo shape
 * and is fully unit-tested.
 */ /**
 * Google Flow has no standalone connection — it reuses the Antigravity Google
 * OAuth credential (accessToken + Cloud Code projectId). Credential lookups for
 * the `googleflow` provider resolve against this provider id.
 */ __turbopack_context__.s([
    "GOOGLE_FLOW_CREDENTIAL_PROVIDER",
    ()=>GOOGLE_FLOW_CREDENTIAL_PROVIDER,
    "GOOGLE_FLOW_HOST",
    ()=>GOOGLE_FLOW_HOST,
    "GOOGLE_FLOW_POLL_PATH",
    ()=>GOOGLE_FLOW_POLL_PATH,
    "GOOGLE_FLOW_SUBMIT_PATH",
    ()=>GOOGLE_FLOW_SUBMIT_PATH,
    "buildGoogleFlowSubmitBody",
    ()=>buildGoogleFlowSubmitBody,
    "normalizeFlowVideoParams",
    ()=>normalizeFlowVideoParams,
    "parseFlowOperationName",
    ()=>parseFlowOperationName,
    "parseFlowOperationResult",
    ()=>parseFlowOperationResult,
    "resolveFlowAccessToken",
    ()=>resolveFlowAccessToken,
    "resolveFlowProjectId",
    ()=>resolveFlowProjectId,
    "resolveVideoCredentialProvider",
    ()=>resolveVideoCredentialProvider
]);
const GOOGLE_FLOW_CREDENTIAL_PROVIDER = "antigravity";
function resolveVideoCredentialProvider(provider) {
    return provider === "googleflow" ? GOOGLE_FLOW_CREDENTIAL_PROVIDER : provider;
}
const GOOGLE_FLOW_HOST = "https://aisandbox-pa.googleapis.com";
const GOOGLE_FLOW_SUBMIT_PATH = "/v1:generateVideo";
const GOOGLE_FLOW_POLL_PATH = "/v1:fetchOperation";
function asTrimmedString(value) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
const ASPECT_RATIO_RE = /^\d{1,2}:\d{1,2}$/;
function normalizeFlowVideoParams(body) {
    const b = body ?? {};
    const prompt = typeof b.prompt === "string" ? b.prompt : String(b.prompt ?? "");
    const sizeMaybeRatio = asTrimmedString(b.size);
    const aspectRatio = asTrimmedString(b.aspect_ratio) ?? asTrimmedString(b.aspectRatio) ?? (sizeMaybeRatio && ASPECT_RATIO_RE.test(sizeMaybeRatio) ? sizeMaybeRatio : undefined);
    const durationRaw = typeof b.duration === "number" ? b.duration : typeof b.durationSeconds === "number" ? b.durationSeconds : undefined;
    const durationSeconds = typeof durationRaw === "number" && Number.isFinite(durationRaw) && durationRaw > 0 ? Math.floor(durationRaw) : undefined;
    const nRaw = typeof b.n === "number" ? b.n : undefined;
    const sampleCount = typeof nRaw === "number" && Number.isFinite(nRaw) && nRaw > 0 ? Math.floor(nRaw) : 1;
    return {
        prompt,
        aspectRatio,
        durationSeconds,
        sampleCount,
        negativePrompt: asTrimmedString(b.negative_prompt) ?? asTrimmedString(b.negativePrompt),
        resolution: asTrimmedString(b.resolution)
    };
}
function buildGoogleFlowSubmitBody(params) {
    const parameters = {
        sampleCount: params.sampleCount
    };
    if (params.aspectRatio) parameters.aspectRatio = params.aspectRatio;
    if (typeof params.durationSeconds === "number") parameters.durationSeconds = params.durationSeconds;
    if (params.negativePrompt) parameters.negativePrompt = params.negativePrompt;
    if (params.resolution) parameters.resolution = params.resolution;
    return {
        instances: [
            {
                prompt: params.prompt
            }
        ],
        parameters
    };
}
function parseFlowOperationName(json) {
    if (!json || typeof json !== "object") return null;
    const direct = json.name;
    if (typeof direct === "string" && direct.length > 0) return direct;
    const op = json.operation;
    if (op && typeof op === "object" && typeof op.name === "string" && op.name.length > 0) {
        return op.name;
    }
    return null;
}
function extractVideoFromResponse(response) {
    if (!response || typeof response !== "object") return null;
    // Documented Veo LRO shape: response.videos[].bytesBase64Encoded | gcsUri
    const videos = response.videos;
    if (Array.isArray(videos) && videos.length > 0) {
        const v = videos[0];
        if (v && typeof v === "object") {
            const rec = v;
            if (typeof rec.bytesBase64Encoded === "string") return {
                base64: rec.bytesBase64Encoded
            };
            if (typeof rec.gcsUri === "string") return {
                url: rec.gcsUri
            };
            if (typeof rec.uri === "string") return {
                url: rec.uri
            };
        }
    }
    // Alternate Veo shape: response.generateVideoResponse.generatedSamples[].video.uri
    const gen = response.generateVideoResponse;
    const samples = gen && typeof gen === "object" ? gen.generatedSamples : undefined;
    if (Array.isArray(samples) && samples.length > 0) {
        const sample = samples[0];
        const video = sample && typeof sample === "object" ? sample.video : undefined;
        if (video && typeof video === "object") {
            const rec = video;
            if (typeof rec.uri === "string") return {
                url: rec.uri
            };
            if (typeof rec.bytesBase64Encoded === "string") return {
                base64: rec.bytesBase64Encoded
            };
        }
    }
    return null;
}
function parseFlowOperationResult(json) {
    if (!json || typeof json !== "object") return {
        done: false
    };
    const done = Boolean(json.done);
    if (!done) return {
        done: false
    };
    const opError = json.error;
    if (opError && typeof opError === "object") {
        return {
            done: true,
            error: String(opError.message || "Google Flow video operation failed")
        };
    }
    const response = json.response;
    const video = extractVideoFromResponse(response);
    if (video?.base64) return {
        done: true,
        base64: video.base64,
        format: "mp4"
    };
    if (video?.url) return {
        done: true,
        url: video.url,
        format: "mp4"
    };
    return {
        done: true,
        error: "Google Flow operation completed but returned no video"
    };
}
function resolveFlowProjectId(credentials) {
    const cred = credentials ?? {};
    const direct = asTrimmedString(cred.projectId);
    if (direct) return direct;
    const psd = cred.providerSpecificData;
    if (psd && typeof psd === "object") {
        const fromPsd = asTrimmedString(psd.projectId);
        if (fromPsd) return fromPsd;
    }
    return null;
}
function resolveFlowAccessToken(credentials) {
    const cred = credentials ?? {};
    return asTrimmedString(cred.accessToken) ?? asTrimmedString(cred.apiKey) ?? null;
}
}),
"[project]/open-sse/handlers/videoGeneration/googleFlowHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleGoogleFlowVideoGeneration",
    ()=>handleGoogleFlowVideoGeneration
]);
/**
 * Veo video generation via Google Flow (labs.google/flow) — request orchestration.
 *
 * Uses the Google account OAuth bearer + Cloud Code projectId that the Antigravity
 * provider already establishes — no separate OAuth flow is added. Submits the
 * documented Veo `predictLongRunning` body to Google's AI Sandbox endpoint, polls
 * the long-running operation, and returns the MP4 (base64 or URL).
 *
 * ⚠️ PENDING LIVE VALIDATION (Hard Rule #18): the AI-Sandbox host/path and the
 * Cloud-Code request envelope cannot be unit-tested — they require a real Google
 * Flow account + a captured HAR. The wire surface is isolated to the two path
 * constants (`GOOGLE_FLOW_SUBMIT_PATH`/`GOOGLE_FLOW_POLL_PATH`) and the `project`
 * wrap below, so confirming a captured HAR is a one-line change. The pure
 * transformation helpers are fully unit-tested (google-flow-video-4569.test.ts).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/googleFlow.ts [instrumentation] (ecmascript)");
;
;
const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 5 * 60 * 1000;
const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
async function handleGoogleFlowVideoGeneration({ model, providerConfig, body, credentials, log }) {
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFlowAccessToken"])(credentials);
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "Missing Google OAuth token for Google Flow. Connect a Google account in Providers (the Antigravity/Cloud Code connection) first."
        };
    }
    const projectId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveFlowProjectId"])(credentials);
    if (!projectId) {
        return {
            success: false,
            status: 400,
            error: "Missing Google projectId for Google Flow. Please reconnect OAuth in Providers so OmniRoute can fetch your Cloud Code project."
        };
    }
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeFlowVideoParams"])(body);
    const submitBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGoogleFlowSubmitBody"])(params);
    // PENDING LIVE VALIDATION: Cloud-Code envelope wraps the Veo body with `project`/`model`.
    const wireBody = {
        ...submitBody,
        project: projectId,
        model
    };
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
    try {
        log?.info?.("VIDEO", `googleflow/${model} (veo) | submitting | aspect: ${params.aspectRatio ?? "default"}`);
        const submitRes = await fetch(`${baseUrl}${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GOOGLE_FLOW_SUBMIT_PATH"]}`, {
            method: "POST",
            headers,
            body: JSON.stringify(wireBody)
        });
        if (!submitRes.ok) {
            const errorText = await submitRes.text();
            return {
                success: false,
                status: submitRes.status,
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Google Flow submit failed: ${errorText.slice(0, 300)}`)
            };
        }
        const operationName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseFlowOperationName"])(await submitRes.json());
        if (!operationName) {
            return {
                success: false,
                status: 502,
                error: "Google Flow did not return an operation name"
            };
        }
        const deadline = Date.now() + MAX_WAIT_MS;
        while(Date.now() < deadline){
            await sleep(POLL_INTERVAL_MS);
            const pollRes = await fetch(`${baseUrl}${__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["GOOGLE_FLOW_POLL_PATH"]}`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    operationName
                })
            });
            if (!pollRes.ok) {
                const errorText = await pollRes.text();
                return {
                    success: false,
                    status: pollRes.status,
                    error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(`Google Flow poll failed: ${errorText.slice(0, 300)}`)
                };
            }
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlow$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseFlowOperationResult"])(await pollRes.json());
            if (!result.done) continue;
            if (result.error) {
                return {
                    success: false,
                    status: 502,
                    error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(result.error)
                };
            }
            const item = result.base64 ? {
                b64_json: result.base64,
                format: result.format
            } : {
                url: result.url,
                format: result.format
            };
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: [
                        item
                    ]
                }
            };
        }
        return {
            success: false,
            status: 504,
            error: "Google Flow video generation timed out"
        };
    } catch (err) {
        const e = err ?? {};
        log?.error?.("VIDEO", `Google Flow generation failed: ${e.message}`);
        return {
            success: false,
            status: typeof e.status === "number" ? e.status : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(e.message || "Google Flow generation failed")
        };
    }
}
}),
"[project]/open-sse/handlers/videoGeneration/deepinfraHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildDeepinfraVideoRequestBody",
    ()=>buildDeepinfraVideoRequestBody,
    "extractDeepinfraErrorMessage",
    ()=>extractDeepinfraErrorMessage,
    "handleDeepinfraVideoGeneration",
    ()=>handleDeepinfraVideoGeneration
]);
/**
 * DeepInfra native text/image-to-video generation.
 *
 * DeepInfra's `/v1/inference/{model}` endpoint is already proven in this codebase for
 * reranking (`open-sse/handlers/rerank.ts` + `open-sse/config/rerankRegistry.ts`) — same
 * host, same Bearer auth, same non-OpenAI response shape. This reuses the stored
 * `deepinfra` provider credential (already registered for chat) — no new credential flow.
 *
 * Confirmed against DeepInfra's own docs (https://deepinfra.com/<model>/api): the call is
 * synchronous — `POST {prompt}` returns `{video_url, seed, request_id, inference_status}`
 * directly, no task/poll loop like `kie-video`/`dashscope-video`.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function buildDeepinfraVideoRequestBody(body) {
    const payload = {
        prompt: typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "")
    };
    if (typeof body.negative_prompt === "string" && body.negative_prompt) {
        payload.negative_prompt = body.negative_prompt;
    }
    const image = body.image ?? body.image_url;
    if (typeof image === "string" && image) {
        payload.image = image;
    }
    if (typeof body.seed === "number" && Number.isFinite(body.seed)) {
        payload.seed = body.seed;
    }
    return payload;
}
function extractDeepinfraErrorMessage(data) {
    if (!isRecord(data)) return null;
    const direct = data.error ?? data.detail ?? data.message;
    if (typeof direct === "string" && direct) return direct;
    if (isRecord(direct) && typeof direct.message === "string" && direct.message) {
        return direct.message;
    }
    const status = data.inference_status;
    if (isRecord(status) && typeof status.error === "string" && status.error) {
        return status.error;
    }
    return null;
}
function logDeepinfraCall(ctx, status, extra) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/videos/generations",
        status,
        model: `${ctx.provider}/${ctx.model}`,
        provider: ctx.provider,
        duration: Date.now() - ctx.startTime,
        ...extra
    }).catch(()=>{});
}
function buildDeepinfraFetchError(ctx, status, data, log) {
    const errorMessage = extractDeepinfraErrorMessage(data) || `DeepInfra returned HTTP ${status}`;
    log?.error?.("VIDEO", `${ctx.provider} deepinfra-video error ${status}: ${errorMessage}`);
    logDeepinfraCall(ctx, status, {
        error: errorMessage.slice(0, 500)
    });
    return {
        success: false,
        status,
        error: errorMessage
    };
}
function buildDeepinfraSuccess(ctx, videoUrl) {
    logDeepinfraCall(ctx, 200, {
        responseBody: {
            videos_count: 1
        }
    });
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: [
                {
                    url: videoUrl,
                    format: "mp4"
                }
            ]
        }
    };
}
function buildDeepinfraCatchError(ctx, err, log) {
    const errorMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error";
    log?.error?.("VIDEO", `${ctx.provider} deepinfra-video error: ${errorMessage}`);
    logDeepinfraCall(ctx, 502, {
        error: errorMessage
    });
    return {
        success: false,
        status: 502,
        error: errorMessage
    };
}
async function fetchDeepinfraVideo(baseUrl, model, token, requestBody) {
    const res = await fetch(`${baseUrl}/${model}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });
    const data = await res.json().catch(()=>({}));
    return {
        res,
        data
    };
}
async function handleDeepinfraVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const ctx = {
        provider,
        model,
        startTime: Date.now()
    };
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "DeepInfra API key is required"
        };
    }
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const requestBody = buildDeepinfraVideoRequestBody(body);
    const promptPreview = String(body.prompt ?? "").slice(0, 60);
    log?.info?.("VIDEO", `${provider}/${model} (deepinfra-video) | prompt: "${promptPreview}..."`);
    try {
        const { res, data } = await fetchDeepinfraVideo(baseUrl, model, token, requestBody);
        if (!res.ok) return buildDeepinfraFetchError(ctx, res.status, data, log);
        const videoUrl = typeof data.video_url === "string" ? data.video_url : null;
        if (!videoUrl) {
            const errorMessage = extractDeepinfraErrorMessage(data) || "DeepInfra video generation did not return video_url";
            return {
                success: false,
                status: 502,
                error: errorMessage
            };
        }
        return buildDeepinfraSuccess(ctx, videoUrl);
    } catch (err) {
        return buildDeepinfraCatchError(ctx, err, log);
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/leonardoHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleLeonardoVideoGeneration",
    ()=>handleLeonardoVideoGeneration
]);
/**
 * Leonardo AI (Phoenix) video generation: submit → poll → fetch output.
 *
 * Extracted out of the frozen `videoGeneration.ts` god-file (unchanged behavior) to make
 * room for the new DeepInfra video adapter without pushing the file-size ratchet over its
 * baseline — mirrors the existing `googleFlowHandler.ts` extraction.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function handleLeonardoVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || "";
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            modelId: "phoenix",
            prompt: body.prompt,
            width: 1024,
            height: 576,
            num_frames: 24
        })
    });
    if (!res.ok) {
        const errorText = await res.text();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: res.status,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: errorText.slice(0, 500)
        }).catch(()=>{});
        return {
            success: false,
            status: res.status,
            error: errorText
        };
    }
    const { sdGenerationJob } = await res.json();
    const genId = sdGenerationJob?.generationId;
    if (!genId) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: "No generation ID returned"
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: "No generation ID returned"
        };
    }
    const deadline = Date.now() + 300000;
    while(Date.now() < deadline){
        await sleep(5000);
        const statusRes = await fetch(`${providerConfig.baseUrl}/${genId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const status = await statusRes.json();
        const gen = status.generations_by_pk || status;
        if (gen.status === "COMPLETE") {
            const imgUrl = gen.generated_images?.[0]?.url;
            if (imgUrl) {
                const videoRes = await fetch(imgUrl);
                const buf = await videoRes.arrayBuffer();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: [
                            {
                                b64_json: Buffer.from(buf).toString("base64"),
                                format: "mp4"
                            }
                        ]
                    }
                };
            }
        }
        if (gen.status === "FAILED") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: "Leonardo video generation failed"
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: "Leonardo video generation failed"
            };
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/videos/generations",
        status: 504,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        error: "Leonardo video generation timed out"
    }).catch(()=>{});
    return {
        success: false,
        status: 504,
        error: "Leonardo video generation timed out"
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/dashscopeHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleDashscopeVideoGeneration",
    ()=>handleDashscopeVideoGeneration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/alibabaProviderRegions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function handleDashscopeVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000;
    const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500;
    const token = credentials?.apiKey || credentials?.accessToken;
    const isAlibabaManagedMediaProvider = provider === "alibaba" || provider === "bailian-coding-plan" || provider === "qwen-cloud" || provider === "qwen-cloud-token-plan";
    const isRegisteredAlibabaMediaModel = !isAlibabaManagedMediaProvider || providerConfig.models?.some((entry)=>entry.id === model) === true;
    if (!isRegisteredAlibabaMediaModel) {
        return {
            success: false,
            status: 400,
            error: `Unsupported ${provider} video model: ${model}`
        };
    }
    const baseUrl = (isAlibabaManagedMediaProvider ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlibabaProviderMediaBaseUrl"])(provider, credentials?.providerSpecificData, providerConfig.baseUrl) : providerConfig.baseUrl).replace(/\/$/, "");
    const statusUrl = (isAlibabaManagedMediaProvider ? `${baseUrl}/tasks` : providerConfig.statusUrl || `${baseUrl}/tasks`).replace(/\/$/, "");
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "Alibaba DashScope API key is required"
        };
    }
    const payload = provider === "qwen-cloud" || provider === "alibaba" ? buildAlibabaMediaPayload(provider, model, prompt, body) : provider === "qwen-cloud-token-plan" || provider === "bailian-coding-plan" ? buildHappyHorsePayload(model, prompt, body) : buildLegacyDashscopePayload(model, prompt, body);
    if ("error" in payload) {
        return {
            success: false,
            status: 400,
            error: payload.error
        };
    }
    if (log) {
        log.info("VIDEO", `${provider}/${model} (dashscope-video) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        // Step 1: create async task (X-DashScope-Async: enable)
        const createRes = await fetch(`${baseUrl}/services/aigc/video-generation/video-synthesis`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-DashScope-Async": "enable"
            },
            body: JSON.stringify(payload)
        });
        const createData = await createRes.json().catch(()=>({}));
        const taskId = createData?.output?.task_id;
        if (!taskId) {
            const errorMessage = createData?.message || createData?.errors?.[0]?.message || "DashScope video generation did not return task_id";
            if (log) {
                log.error("VIDEO", `DashScope createTask failed: ${JSON.stringify(createData)}`);
            }
            return {
                success: false,
                status: 502,
                error: String(errorMessage)
            };
        }
        // Step 2: poll statusUrl/{task_id} until terminal
        const deadline = startTime + timeoutMs;
        let lastStatus = "PENDING";
        while(Date.now() < deadline){
            await new Promise((resolve)=>setTimeout(resolve, pollIntervalMs));
            const pollRes = await fetch(`${statusUrl}/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const pollData = await pollRes.json().catch(()=>({}));
            lastStatus = pollData?.output?.task_status || "PENDING";
            if (lastStatus === "SUCCEEDED") {
                const videoUrl = pollData?.output?.video_url;
                if (!videoUrl) {
                    return {
                        success: false,
                        status: 502,
                        error: "DashScope task SUCCEEDED but no video_url"
                    };
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    responseBody: {
                        videos_count: 1
                    }
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: [
                            {
                                url: videoUrl,
                                format: "mp4"
                            }
                        ]
                    }
                };
            }
            if (lastStatus === "FAILED" || lastStatus === "UNKNOWN_ERROR") {
                const errorMessage = pollData?.output?.message || pollData?.output?.errors?.[0]?.message || "DashScope video task FAILED";
                return {
                    success: false,
                    status: 502,
                    error: String(errorMessage)
                };
            }
        // PENDING / RUNNING → keep polling
        }
        return {
            success: false,
            status: 504,
            error: `DashScope task ${taskId} timed out (status: ${lastStatus})`
        };
    } catch (err) {
        return {
            success: false,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
function buildLegacyDashscopePayload(model, prompt, body) {
    const sizeParam = normalizeDashscopeSize(body.size, body.aspect_ratio);
    const parameters = {};
    if (sizeParam) parameters.size = sizeParam;
    if (body.duration != null) parameters.duration = Number(body.duration);
    return {
        model,
        input: {
            prompt,
            ...typeof body.negative_prompt === "string" ? {
                negative_prompt: body.negative_prompt
            } : {}
        },
        parameters
    };
}
function buildHappyHorsePayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const media = collectDashscopeMedia(body);
    if (model.endsWith("-i2v")) {
        const firstFrame = media.find((item)=>item.type === "first_frame") || media.find((item)=>item.type === "reference_image");
        if (!firstFrame) {
            return {
                error: `Image input is required for video model: ${model}`
            };
        }
        input.media = [
            {
                type: "first_frame",
                url: firstFrame.url
            }
        ];
    } else if (model.endsWith("-r2v")) {
        const referenceImages = media.filter((item)=>item.type === "first_frame" || item.type === "reference_image").map((item)=>({
                type: "reference_image",
                url: item.url
            }));
        if (referenceImages.length === 0) {
            return {
                error: `Reference image input is required for video model: ${model}`
            };
        }
        input.media = referenceImages;
    }
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, !model.endsWith("-i2v"))
    };
}
function buildAlibabaMediaPayload(provider, model, prompt, body) {
    if (model === "happyhorse-1.1-i2v" || model === "happyhorse-1.1-t2v" || model === "happyhorse-1.1-r2v") {
        return buildHappyHorsePayload(model, prompt, body);
    }
    if (model === "happyhorse-1.0-video-edit" || model === "wan2.7-videoedit") {
        return buildModernDashscopeVideoEditPayload(model, prompt, body);
    }
    if (model === "wan2.7-t2v" || model === "wan2.7-t2v-2026-06-12") {
        return buildModernDashscopeTextToVideoPayload(model, prompt, body);
    }
    if (model === "wan2.7-i2v" || model === "wan2.7-i2v-2026-04-25" || model === "wan2.6-i2v-flash") {
        return buildModernDashscopeImageToVideoPayload(model, prompt, body);
    }
    if (model === "wan2.7-r2v-2026-06-12") {
        return buildModernDashscopeReferenceToVideoPayload(model, prompt, body);
    }
    return {
        error: `Unsupported ${provider} video model: ${model}`
    };
}
function buildModernDashscopeTextToVideoPayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const audio = collectDashscopeMedia(body).find((item)=>item.type === "driving_audio");
    if (audio) input.audio_url = audio.url;
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, true)
    };
}
function buildModernDashscopeImageToVideoPayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const media = collectDashscopeMedia(body);
    const firstFrame = media.find((item)=>item.type === "first_frame") || media.find((item)=>item.type === "reference_image");
    if (!firstFrame) {
        return {
            error: `Image input is required for video model: ${model}`
        };
    }
    input.media = [
        {
            type: "first_frame",
            url: firstFrame.url
        },
        ...media.filter((item)=>item.type === "last_frame" || item.type === "driving_audio").map((item)=>copyDashscopeMediaItem(item))
    ];
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, false)
    };
}
function buildModernDashscopeReferenceToVideoPayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const references = collectDashscopeMedia(body).flatMap((item)=>{
        if (item.type === "first_frame" || item.type === "last_frame" || item.type === "reference_image") {
            return [
                copyDashscopeMediaItem(item, "reference_image")
            ];
        }
        if (item.type === "video" || item.type === "first_clip" || item.type === "reference_video") {
            return [
                copyDashscopeMediaItem(item, "reference_video")
            ];
        }
        return [];
    });
    if (references.length === 0) {
        return {
            error: `Reference image or video input is required for video model: ${model}`
        };
    }
    input.media = references;
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, true)
    };
}
function buildModernDashscopeVideoEditPayload(model, prompt, body) {
    const input = buildDashscopeInput(prompt, body);
    const media = collectDashscopeMedia(body);
    const sourceVideo = media.find((item)=>item.type === "video" || item.type === "first_clip" || item.type === "reference_video");
    if (!sourceVideo) {
        return {
            error: `Video input is required for video model: ${model}`
        };
    }
    input.media = [
        {
            type: "video",
            url: sourceVideo.url
        },
        ...media.filter((item)=>item.type === "first_frame" || item.type === "reference_image").map((item)=>copyDashscopeMediaItem(item, "reference_image"))
    ];
    return {
        model,
        input,
        parameters: buildModernDashscopeParameters(body, true)
    };
}
const DASHSCOPE_MEDIA_TYPES = new Set([
    "first_frame",
    "last_frame",
    "first_clip",
    "reference_image",
    "reference_video",
    "video",
    "driving_audio"
]);
function buildDashscopeInput(prompt, body) {
    return {
        ...prompt ? {
            prompt
        } : {},
        ...typeof body.negative_prompt === "string" && body.negative_prompt.trim() ? {
            negative_prompt: body.negative_prompt.trim()
        } : {}
    };
}
function buildModernDashscopeParameters(body, includeRatio) {
    const parameters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(body.parameters) ? {
        ...body.parameters
    } : {};
    const resolution = normalizeHappyHorseResolution(body.resolution, body.size);
    if (resolution) parameters.resolution = resolution;
    const ratio = normalizeHappyHorseRatio(body.ratio, body.aspect_ratio, body.size);
    if (ratio && includeRatio) parameters.ratio = ratio;
    if (body.duration != null && Number.isFinite(Number(body.duration))) {
        parameters.duration = Number(body.duration);
    }
    if (typeof body.prompt_extend === "boolean") parameters.prompt_extend = body.prompt_extend;
    if (typeof body.watermark === "boolean") parameters.watermark = body.watermark;
    if (Number.isInteger(body.seed) && Number(body.seed) >= 0) parameters.seed = Number(body.seed);
    if (typeof body.shot_type === "string" && body.shot_type.trim()) {
        parameters.shot_type = body.shot_type.trim();
    }
    return parameters;
}
function copyDashscopeMediaItem(item, type = item.type) {
    return {
        type,
        url: item.url,
        ...item.reference_voice ? {
            reference_voice: item.reference_voice
        } : {}
    };
}
function collectDashscopeMedia(body) {
    if (Array.isArray(body.media)) {
        const explicit = body.media.filter(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"]).flatMap((item)=>{
            const normalized = toDashscopeMediaItem(item, "reference_image");
            return normalized ? [
                normalized
            ] : [];
        });
        if (explicit.length > 0) return dedupeDashscopeMedia(explicit);
    }
    const media = [];
    const imageCandidates = [
        body.image,
        body.image_url,
        body.imageUrls,
        body.image_urls
    ].flatMap((value)=>Array.isArray(value) ? value : [
            value
        ]);
    imageCandidates.forEach((value, index)=>{
        const item = toDashscopeMediaItem(value, index === 0 ? "first_frame" : "reference_image");
        if (item) media.push(item);
    });
    addDashscopeMedia(media, body.reference_images, "reference_image");
    addDashscopeMedia(media, [
        body.video,
        body.video_url,
        body.videoUrls,
        body.video_urls
    ], "video");
    addDashscopeMedia(media, body.reference_videos, "reference_video");
    addDashscopeMedia(media, [
        body.audio,
        body.audio_url
    ], "driving_audio");
    return dedupeDashscopeMedia(media);
}
function addDashscopeMedia(media, value, type) {
    const values = Array.isArray(value) ? value : [
        value
    ];
    for (const candidate of values.flatMap((item)=>Array.isArray(item) ? item : [
            item
        ])){
        const normalized = toDashscopeMediaItem(candidate, type);
        if (normalized) media.push(normalized);
    }
}
function toDashscopeMediaItem(value, fallbackType) {
    if (typeof value === "string" && value.trim()) {
        return {
            type: fallbackType,
            url: value.trim()
        };
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(value)) return null;
    const url = [
        value.url,
        value.image_url,
        value.video_url,
        value.audio_url
    ].find((candidate)=>typeof candidate === "string" && candidate.trim());
    if (typeof url !== "string") return null;
    const type = typeof value.type === "string" && DASHSCOPE_MEDIA_TYPES.has(value.type) ? value.type : fallbackType;
    return {
        type,
        url: url.trim(),
        ...typeof value.reference_voice === "string" && value.reference_voice.trim() ? {
            reference_voice: value.reference_voice.trim()
        } : {}
    };
}
function dedupeDashscopeMedia(media) {
    const seen = new Set();
    return media.filter((item)=>{
        const key = `${item.type}\0${item.url}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
function normalizeHappyHorseResolution(resolution, size) {
    if (typeof resolution === "string" && /^(720|1080)p$/i.test(resolution.trim())) {
        return resolution.trim().toUpperCase();
    }
    if (typeof size !== "string") return undefined;
    const match = size.trim().match(/^(\d+)[x*](\d+)$/i);
    if (!match) return undefined;
    return Math.max(Number(match[1]), Number(match[2])) >= 1920 ? "1080P" : "720P";
}
function normalizeHappyHorseRatio(ratio, aspectRatio, size) {
    const explicit = [
        ratio,
        aspectRatio
    ].find((value)=>typeof value === "string" && /^\d+:\d+$/.test(value.trim()));
    if (typeof explicit === "string") return explicit.trim();
    if (typeof size !== "string") return undefined;
    const match = size.trim().match(/^(\d+)[x*](\d+)$/i);
    if (!match) return undefined;
    const width = Number(match[1]);
    const height = Number(match[2]);
    if (width === height) return "1:1";
    if (width * 9 === height * 16) return "16:9";
    if (width * 16 === height * 9) return "9:16";
    if (width * 3 === height * 4) return "4:3";
    if (width * 4 === height * 3) return "3:4";
    return undefined;
}
// Map OmniRoute size/aspect_ratio → Alibaba DashScope "WxH" (1280*720).
// Accepts "1280*720", "1280x720", or a ratio "16:9". Returns undefined if unparseable
// (then omitted from the payload so DashScope applies its own default).
function normalizeDashscopeSize(size, aspectRatio) {
    if (typeof size === "string") {
        if (/^\d+\*\d+$/.test(size)) return size;
        if (/^\d+x\d+$/.test(size)) return size.replace("x", "*");
    }
    if (typeof aspectRatio === "string") {
        const ratioMap = {
            "16:9": "1280*720",
            "9:16": "720*1280",
            "1:1": "960*960"
        };
        return ratioMap[aspectRatio];
    }
    return undefined;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/novita.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Novita AI video generation — pure helpers.
 *
 * Novita exposes per-model async endpoints under `/v3/async/<model-slug>` (e.g.
 * `/v3/async/wan-t2v`, `/v3/async/kling-v1.6-t2v`) — unlike DashScope/Kie there is
 * no single shared submit path; the model id IS the path segment. Every model
 * shares one poll endpoint: `GET /v3/async/task-result?task_id=...`, returning
 * `{ task: { status, reason, progress_percent }, videos: [{ video_url }] }`.
 * Confirmed against Novita's published API reference (2026-07-17):
 * https://novita.ai/docs/api-reference/model-apis-wan-t2v
 * https://novita.ai/docs/api-reference/model-apis-kling-v1.6-t2v
 */ __turbopack_context__.s([
    "buildNovitaPollUrl",
    ()=>buildNovitaPollUrl,
    "buildNovitaSubmitBody",
    ()=>buildNovitaSubmitBody,
    "buildNovitaSubmitUrl",
    ()=>buildNovitaSubmitUrl,
    "normalizeNovitaVideoParams",
    ()=>normalizeNovitaVideoParams,
    "parseNovitaTaskId",
    ()=>parseNovitaTaskId,
    "parseNovitaTaskResult",
    ()=>parseNovitaTaskResult
]);
const NOVITA_TERMINAL_SUCCESS = new Set([
    "TASK_STATUS_SUCCEED",
    "SUCCEED",
    "SUCCEEDED"
]);
const NOVITA_TERMINAL_FAILURE = new Set([
    "TASK_STATUS_FAILED",
    "FAILED",
    "UNKNOWN_ERROR"
]);
function buildNovitaSubmitUrl(baseUrl, model) {
    return `${baseUrl.replace(/\/$/, "")}/${model}`;
}
function buildNovitaPollUrl(statusUrl, taskId) {
    return `${statusUrl.replace(/\/$/, "")}?task_id=${encodeURIComponent(taskId)}`;
}
function normalizeNovitaVideoParams(body) {
    const b = body ?? {};
    const prompt = typeof b.prompt === "string" ? b.prompt : String(b.prompt ?? "");
    const negativePrompt = typeof b.negative_prompt === "string" ? b.negative_prompt : undefined;
    const durationRaw = typeof b.duration === "number" ? b.duration : undefined;
    const duration = typeof durationRaw === "number" && Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : undefined;
    let width;
    let height;
    if (typeof b.size === "string") {
        const match = /^(\d+)\s*[x*]\s*(\d+)/.exec(b.size);
        if (match) {
            width = Number(match[1]);
            height = Number(match[2]);
        }
    }
    return {
        prompt,
        negativePrompt,
        duration,
        width,
        height
    };
}
function buildNovitaSubmitBody(params) {
    const payload = {
        prompt: params.prompt
    };
    if (params.negativePrompt) payload.negative_prompt = params.negativePrompt;
    if (typeof params.duration === "number") payload.duration = params.duration;
    if (typeof params.width === "number") payload.width = params.width;
    if (typeof params.height === "number") payload.height = params.height;
    return payload;
}
function parseNovitaTaskId(json) {
    if (!json || typeof json !== "object") return null;
    const taskId = json.task_id;
    return typeof taskId === "string" && taskId.length > 0 ? taskId : null;
}
/**
 * Interpret a `/v3/async/task-result` poll response into a normalized result.
 * `done: false` means still queued/processing — callers should keep polling.
 */ function extractNovitaVideoUrl(json) {
    const videos = json?.videos;
    if (!Array.isArray(videos) || videos.length === 0) return null;
    const first = videos[0];
    if (!first || typeof first !== "object") return null;
    const videoUrl = first.video_url;
    return typeof videoUrl === "string" && videoUrl.length > 0 ? videoUrl : null;
}
function parseNovitaTaskResult(json) {
    if (!json || typeof json !== "object") {
        return {
            done: false,
            status: "UNKNOWN"
        };
    }
    const task = json.task;
    const taskRec = task && typeof task === "object" ? task : {};
    const status = typeof taskRec.status === "string" ? taskRec.status : "UNKNOWN";
    if (NOVITA_TERMINAL_FAILURE.has(status)) {
        const reason = typeof taskRec.reason === "string" && taskRec.reason ? taskRec.reason : null;
        return {
            done: true,
            status,
            errorMessage: reason || `Novita video task ${status}`
        };
    }
    if (!NOVITA_TERMINAL_SUCCESS.has(status)) {
        return {
            done: false,
            status
        };
    }
    const videoUrl = extractNovitaVideoUrl(json);
    if (videoUrl) return {
        done: true,
        status,
        videoUrl
    };
    return {
        done: true,
        status,
        errorMessage: "Novita task succeeded but returned no video_url"
    };
}
}),
"[project]/open-sse/handlers/videoGeneration/novitaHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleNovitaVideoGeneration",
    ()=>handleNovitaVideoGeneration
]);
/**
 * Novita AI video generation — request orchestration.
 *
 * Reuses the stored Novita provider Bearer apiKey (same credential the Novita
 * chat/LLM gateway already uses — no separate credential flow). Submits to the
 * model-specific `/v3/async/<model>` endpoint, polls the shared `task-result`
 * endpoint by `task_id` with backoff, and returns the OpenAI-like response shape.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/novita.ts [instrumentation] (ecmascript)");
;
;
const DEFAULT_TIMEOUT_MS = 300_000;
const DEFAULT_POLL_INTERVAL_MS = 2500;
const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
/** Submit the async video task; returns the task_id or a ready-to-return error result. */ async function submitNovitaTask(submitUrl, headers, payload, log) {
    const submitRes = await fetch(submitUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });
    const submitData = await submitRes.json().catch(()=>({}));
    const taskId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNovitaTaskId"])(submitData);
    if (taskId) return {
        taskId
    };
    const errorMessage = submitData?.message || "Novita did not return a task_id";
    log?.error?.("VIDEO", `Novita createTask failed: ${JSON.stringify(submitData)}`);
    return {
        error: {
            success: false,
            status: submitRes.ok ? 502 : submitRes.status,
            error: String(errorMessage)
        }
    };
}
/** Resolve the request timeout + poll interval, falling back to the module defaults. */ function resolveNovitaTiming(body) {
    const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : DEFAULT_TIMEOUT_MS;
    const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : DEFAULT_POLL_INTERVAL_MS;
    return {
        timeoutMs,
        pollIntervalMs
    };
}
/** Poll task-result until terminal (success/failure) or the deadline elapses. */ async function pollNovitaTask(pollUrl, token, taskId, deadline, pollIntervalMs) {
    let lastStatus = "UNKNOWN";
    while(Date.now() < deadline){
        await sleep(pollIntervalMs);
        const pollRes = await fetch(pollUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const pollData = await pollRes.json().catch(()=>({}));
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseNovitaTaskResult"])(pollData);
        lastStatus = result.status;
        if (!result.done) continue;
        if (result.videoUrl) {
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: [
                        {
                            url: result.videoUrl,
                            format: "mp4"
                        }
                    ]
                }
            };
        }
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(result.errorMessage)
        };
    }
    return {
        success: false,
        status: 504,
        error: `Novita task ${taskId} timed out (status: ${lastStatus})`
    };
}
async function handleNovitaVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "Novita AI API key is required"
        };
    }
    const { timeoutMs, pollIntervalMs } = resolveNovitaTiming(body);
    const statusUrl = providerConfig.statusUrl || `${providerConfig.baseUrl}/task-result`;
    const submitUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildNovitaSubmitUrl"])(providerConfig.baseUrl, model);
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeNovitaVideoParams"])(body);
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildNovitaSubmitBody"])(params);
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
    log?.info?.("VIDEO", `${provider}/${model} (novita-video) | prompt: "${params.prompt.slice(0, 60)}..."`);
    try {
        const submitted = await submitNovitaTask(submitUrl, headers, payload, log);
        if ("error" in submitted) return submitted.error;
        const pollUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novita$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildNovitaPollUrl"])(statusUrl, submitted.taskId);
        return await pollNovitaTask(pollUrl, token, submitted.taskId, Date.now() + timeoutMs, pollIntervalMs);
    } catch (err) {
        const e = err ?? {};
        log?.error?.("VIDEO", `Novita video generation failed: ${e.message}`);
        return {
            success: false,
            status: typeof e.status === "number" ? e.status : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(e.message || "Novita video generation failed")
        };
    }
}
}),
"[project]/open-sse/handlers/videoGeneration/xaiGrokImagineHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleXaiVideoGeneration",
    ()=>handleXaiVideoGeneration
]);
/**
 * xAI Grok Imagine video generation: create async job → poll → MP4.
 * Reuses the stored xai provider Bearer apiKey (same credential the
 * image-generation "xai" entry in imageRegistry.ts already uses) — no
 * separate credential flow. Mirrors the DashScope create+poll shape in
 * videoGeneration.ts, adapted to xAI's request_id / status
 * ("pending"|"processing"|"done"|"failed") job shape
 * (https://docs.x.ai/developers/rest-api-reference/inference/videos).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
/** Map the OmniRoute video body onto xAI's create-job payload. */ function buildXaiVideoPayload(model, prompt, body) {
    const payload = {
        model,
        prompt
    };
    if (typeof body.image === "string") payload.image = body.image;
    if (body.duration != null) payload.duration = Number(body.duration);
    if (typeof body.aspect_ratio === "string") payload.aspect_ratio = body.aspect_ratio;
    if (typeof body.resolution === "string") payload.resolution = body.resolution;
    return payload;
}
/** POST the create-job request; resolves to the request_id or a ready error message. */ async function createXaiVideoJob({ baseUrl, token, payload, log }) {
    const createRes = await fetch(`${baseUrl}/generations`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const createData = await createRes.json().catch(()=>({}));
    const requestId = createData?.request_id;
    if (requestId) return {
        requestId: String(requestId)
    };
    const errorMessage = createData?.error?.message || createData?.message || "xAI video generation did not return request_id";
    if (log) {
        log.error("VIDEO", `xAI createJob failed: ${JSON.stringify(createData)}`);
    }
    return {
        error: String(errorMessage)
    };
}
/**
 * Poll statusUrl/{request_id} until a terminal status or the deadline.
 * Date.now() is read only in the loop condition, so the caller keeps full
 * control over the timeout budget it computed from its own startTime.
 */ async function pollXaiVideoJob({ statusUrl, requestId, token, deadline, pollIntervalMs }) {
    let lastStatus = "pending";
    while(Date.now() < deadline){
        await new Promise((resolve)=>setTimeout(resolve, pollIntervalMs));
        const pollRes = await fetch(`${statusUrl}/${requestId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const pollData = await pollRes.json().catch(()=>({}));
        lastStatus = pollData?.status || "pending";
        if (lastStatus === "done") return {
            terminal: "done",
            videoUrl: pollData?.video?.url
        };
        if (lastStatus === "failed") return {
            terminal: "failed",
            error: pollData?.error
        };
    // pending / processing → keep polling
    }
    return {
        terminal: "timeout",
        lastStatus
    };
}
/** Resolve the request knobs (timeouts, credential, endpoints, prompt) from the call. */ function resolveXaiVideoOptions(body, providerConfig, credentials) {
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    return {
        timeoutMs: Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000,
        pollIntervalMs: Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500,
        token: credentials?.apiKey || credentials?.accessToken,
        baseUrl,
        statusUrl: (providerConfig.statusUrl || baseUrl).replace(/\/$/, ""),
        prompt: typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "")
    };
}
/** Map a terminal poll outcome onto the OpenAI-like video response (or an error). */ function buildXaiVideoResponse({ outcome, requestId, provider, model, startTime }) {
    if (outcome.terminal === "failed") {
        return {
            success: false,
            status: 502,
            error: String(outcome.error || "xAI video job failed")
        };
    }
    if (outcome.terminal === "timeout") {
        return {
            success: false,
            status: 504,
            error: `xAI video job ${requestId} timed out (status: ${outcome.lastStatus})`
        };
    }
    if (!outcome.videoUrl) {
        return {
            success: false,
            status: 502,
            error: "xAI video job done but no video.url"
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/videos/generations",
        status: 200,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        responseBody: {
            videos_count: 1
        }
    }).catch(()=>{});
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: [
                {
                    url: outcome.videoUrl,
                    format: "mp4"
                }
            ]
        }
    };
}
async function handleXaiVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const { timeoutMs, pollIntervalMs, token, baseUrl, statusUrl, prompt } = resolveXaiVideoOptions(body, providerConfig, credentials);
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "xAI API key is required"
        };
    }
    if (log) {
        log.info("VIDEO", `${provider}/${model} (xai-video) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const created = await createXaiVideoJob({
            baseUrl,
            token,
            payload: buildXaiVideoPayload(model, prompt, body),
            log
        });
        if (!created.requestId) {
            return {
                success: false,
                status: 502,
                error: created.error
            };
        }
        const outcome = await pollXaiVideoJob({
            statusUrl,
            requestId: created.requestId,
            token,
            deadline: startTime + timeoutMs,
            pollIntervalMs
        });
        return buildXaiVideoResponse({
            outcome,
            requestId: created.requestId,
            provider,
            model,
            startTime
        });
    } catch (err) {
        return {
            success: false,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/providers/segmind.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleSegmindVideoGeneration",
    ()=>handleSegmindVideoGeneration
]);
// Segmind video-generation provider (#6656).
//
// Thin body-builder + response-formatter around the shared Segmind REST
// client (open-sse/utils/segmindClient.ts) — same wire shape as the image
// handler (imageGeneration/providers/segmind.ts): x-api-key auth, raw video
// bytes response (e.g. `video/mp4`) on success, no JSON envelope.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/segmindClient.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function buildSegmindVideoBody(body, prompt) {
    const upstreamBody = {
        prompt
    };
    if (typeof body.negative_prompt === "string") upstreamBody.negative_prompt = body.negative_prompt;
    if (typeof body.seed === "number") upstreamBody.seed = body.seed;
    if (body.duration != null) upstreamBody.duration = Number(body.duration);
    if (typeof body.aspect_ratio === "string") upstreamBody.aspect_ratio = body.aspect_ratio;
    return upstreamBody;
}
async function handleSegmindVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const token = credentials?.apiKey || credentials?.accessToken || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    const upstreamBody = buildSegmindVideoBody(body, prompt);
    if (log) {
        log.info("VIDEO", `${provider}/${model} (segmind) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["segmindRequest"])({
        baseUrl: providerConfig.baseUrl,
        model,
        token,
        upstreamBody,
        callLogPath: "/v1/videos/generations",
        provider,
        scope: "VIDEO",
        log
    });
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSegmindFailure"])(result)) {
        return {
            success: false,
            status: result.status,
            error: result.error
        };
    }
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: [
                {
                    b64_json: result.buffer.toString("base64"),
                    format: "mp4"
                }
            ]
        }
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/videoGeneration/adobeFireflyHandler.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAdobeFireflyVideoGeneration",
    ()=>handleAdobeFireflyVideoGeneration
]);
// Adobe Firefly (unofficial) video-generation handler.
// Family: adobe-firefly-video | Provider: adobe-firefly
//
// Credentials: IMS access_token (JWT) or full Cookie header from
// firefly.adobe.com / new.express.adobe.com.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyClient.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function normalizePositiveNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
async function handleAdobeFireflyVideoGeneration({ model, provider, body, credentials, log, fetchImpl = fetch }) {
    const startTime = Date.now();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
        return {
            success: false,
            status: 400,
            error: "Prompt is required for Adobe Firefly video generation"
        };
    }
    try {
        const accessToken = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeAccessToken"])(credentials, fetchImpl);
        const timeoutMs = normalizePositiveNumber(body.timeout_ms, 300_000);
        const seed = typeof body.seed === "number" ? body.seed : typeof body.seed === "string" && String(body.seed).trim() ? Number(body.seed) : undefined;
        // Keep raw paste for Cookie + sherlockToken (x-arp-session-id).
        const psd = credentials?.providerSpecificData;
        const sessionCookie = typeof psd?.cookie === "string" && psd.cookie.trim() || typeof credentials?.apiKey === "string" && credentials.apiKey.trim() || (typeof credentials?.accessToken === "string" && credentials.accessToken.includes(";") ? credentials.accessToken : undefined);
        // Kling i2v / Veo ref / Sora frame: upload reference images first.
        const { id: videoModelId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeVideoModel"])(String(model));
        const maxFrames = videoModelId.includes("kling") || videoModelId.includes("sora") ? 2 : 3;
        const sourceImageIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeSourceImageIds"])({
            accessToken,
            body,
            max: maxFrames,
            sessionCookie,
            prompt,
            fetchImpl,
            log
        });
        log?.info?.("VIDEO", `${provider}/${model} (adobe-firefly) | prompt: "${prompt.slice(0, 60)}${prompt.length > 60 ? "..." : ""}"` + (sourceImageIds.length ? ` | frames: ${sourceImageIds.length}` : ""));
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adobeFireflyGenerateVideo"])({
            accessToken,
            prompt,
            model,
            size: body.size,
            aspectRatio: body.aspect_ratio ?? body.aspectRatio ?? body.ratio ?? body.size,
            duration: body.duration ?? body.durationSeconds,
            quality: body.quality,
            resolution: body.resolution ?? body.quality,
            seed: Number.isFinite(seed) ? seed : undefined,
            negativePrompt: typeof body.negative_prompt === "string" ? body.negative_prompt : typeof body.negativePrompt === "string" ? body.negativePrompt : undefined,
            generateAudio: body.generate_audio !== false && body.generateAudio !== false,
            sourceImageIds: sourceImageIds.length ? sourceImageIds : undefined,
            sessionCookie,
            timeoutMs,
            fetchImpl,
            log
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: [
                    {
                        url: result.url,
                        format: result.format || "mp4"
                    }
                ]
            }
        };
    } catch (err) {
        if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AdobeFireflyError"]) {
            log?.error?.("VIDEO", `${provider} adobe-firefly error ${err.status}: ${err.message}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: err.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: err.message.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: err.status,
                error: err.message
            };
        }
        const errorText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
        log?.error?.("VIDEO", `${provider} adobe-firefly exception: ${errorText}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 500,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: errorText.slice(0, 500)
        }).catch(()=>{});
        return {
            success: false,
            status: 500,
            error: errorText
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/upstreamTimeouts.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/providerModels.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/tokenAccounting.ts [instrumentation] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedInputTokens"])(usage) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getLoggedOutputTokens"])(usage) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$tokenAccounting$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReasoningTokens"])(usage);
}
/** Resolves the model-level `timeoutMs` registry override, when both
 *  `provider` and `model` are known and the model registers one (#6354). */ function resolveModelTimeoutOverride(provider, model) {
    if (!provider || !model) return undefined;
    const override = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$providerModels$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getModelTimeoutMs"])(provider, model);
    if (typeof override !== "number" || !Number.isFinite(override)) return undefined;
    return Math.max(0, Math.floor(override));
}
function resolveProviderTimeoutMs(executor) {
    const getTimeoutMs = executor?.getTimeoutMs;
    if (typeof getTimeoutMs !== "function") return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
    try {
        const timeoutMs = getTimeoutMs.call(executor);
        if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs)) return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
        return Math.max(0, Math.floor(timeoutMs));
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["FETCH_TIMEOUT_MS"];
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
"[project]/open-sse/handlers/responseTranslator.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "translateNonStreamingResponse",
    ()=>translateNonStreamingResponse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/formats.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/geminiThoughtSignatureStore.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/textualToolCall.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/helpers/toolCallHelper.ts [instrumentation] (ecmascript)");
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
        if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(responseBody, toolNameMap);
        }
        return responseBody;
    }
    let intermediateOpenAI = responseBody;
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["restoreOpenAIToolNames"])(intermediateOpenAI, toolNameMap);
    }
    // Handle OpenAI Responses API format
    if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].OPENAI_RESPONSES) {
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
                const resolvedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
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
    } else if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) {
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
                            } else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$textualToolCall$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["containsTextualToolCallMarker"])(partObj.text)) {
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
                            const restoredName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
                            const nativeId = toString(fn.id);
                            const toolCallId = nativeId.length > 0 ? nativeId : `call_${toString(restoredName, "unknown")}_${Date.now()}_${toolCalls.length}`;
                            // Persist the thought signature so openai-to-gemini can
                            // resolve it on the next turn. Use the part-level field
                            // (part.thoughtSignature) and fall back to any signature
                            // captured from an earlier thinking-only part.
                            const sig = partThoughtSig || pendingThoughtSignature;
                            if (sig) {
                                const sigKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildGeminiThoughtSignatureKey"])(null, toolCallId);
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$geminiThoughtSignatureStore$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["storeGeminiThoughtSignature"])(sigKey, sig);
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
                let finishReason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReasonString"])(toString(candidate.finishReason, "stop"));
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
    } else if (targetFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE) {
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
                    const strippedName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$helpers$2f$toolCallHelper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["caseInsensitiveToolNameLookup"])(rawName, toolNameMap) ?? rawName;
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
    if (sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].CLAUDE && sourceFormat !== targetFormat) {
        return convertOpenAINonStreamingToClaude(toRecord(intermediateOpenAI));
    }
    // Gemini-family clients (Gemini, Antigravity): the streaming SSE path already
    // projects OpenAI chunks into the `{ response: { candidates: [...] } }` envelope
    // via the registered FORMATS.OPENAI -> FORMATS.ANTIGRAVITY translator
    // (translator/response/openai-to-antigravity.ts), but this non-streaming path had
    // no equivalent back-conversion step — it silently returned the raw OpenAI
    // chat.completion shape (leaking `choices[]`/`tool_calls` instead of
    // `candidates[]`/`functionCall`) to any non-streaming Gemini/Antigravity client.
    if ((sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].GEMINI || sourceFormat === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$formats$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FORMATS"].ANTIGRAVITY) && sourceFormat !== targetFormat) {
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAnyReasoningValue"])(messageObj);
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
"[project]/open-sse/handlers/responseSanitizer/reasoning.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/open-sse/handlers/responseSanitizer.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningFields.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/reasoningPlaceholder.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/finishReason.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/responseSanitizer/reasoning.ts [instrumentation] (ecmascript)");
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
        sanitized.finish_reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReason"])(choiceRecord.finish_reason);
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
        const strippedContent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(msgRecord.content));
        const nativeReasoning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getReadableReasoningValue"])(msgRecord);
        const { content, thinking } = options.parseTextualReasoningTags === true && !nativeReasoning ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractThinkingFromContent"])(strippedContent) : {
            content: strippedContent,
            thinking: null
        };
        const sanitized = {
            content: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(content)
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["copyOpenAICompatibleReasoningFields"])(msgRecord, sanitized);
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
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(toString(partRecord.text) || ""))
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
            output: typeof itemRecord.output === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(itemRecord.output)) : JSON.stringify(itemRecord.output ?? "")
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
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(toString(partRecord.text) || "")
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
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(content))),
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
                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(part))),
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
                text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningPlaceholder$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["stripInternalReasoningPlaceholder"])(stripInternalToolEnvelopeText(toString(partRecord.text) || ""))),
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
                        delta.content = typeof deltaRecord.content === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$responseSanitizer$2f$reasoning$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["collapseExcessiveNewlines"])(stripZeroWidthText(deltaRecord.content)) : deltaRecord.content;
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$reasoningFields$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["copyOpenAICompatibleReasoningFields"])(deltaRecord, delta);
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
                c.finish_reason = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$finishReason$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["normalizeOpenAICompatibleFinishReason"])(choiceRecord.finish_reason);
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
"[project]/open-sse/handlers/videoGeneration.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleVideoGeneration",
    ()=>handleVideoGeneration
]);
/**
 * Video Generation Handler
 *
 * Handles POST /v1/videos/generations requests. Proxies to upstream video
 * generation providers (ComfyUI AnimateDiff/SVD, SD WebUI AnimateDiff, and
 * more — see the per-format handlers below). Response format (OpenAI-like):
 * { "created": 1234567890, "data": [{ "b64_json": "...", "format": "mp4" }] }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/videoRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/kie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/vertexMedia.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlowHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/googleFlowHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$deepinfraHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/deepinfraHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$leonardoHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/leonardoHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$dashscopeHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/dashscopeHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novitaHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/novitaHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$xaiGrokImagineHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/xaiGrokImagineHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/providers/segmind.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$adobeFireflyHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/videoGeneration/adobeFireflyHandler.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/executors/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/runway.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/comfyuiClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$deepinfraHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$leonardoHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$dashscopeHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$xaiGrokImagineHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$adobeFireflyHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$deepinfraHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$leonardoHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$dashscopeHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$xaiGrokImagineHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$adobeFireflyHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
async function handleVideoGeneration({ body, credentials, log }) {
    const { provider, model } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseVideoModel"])(body.model);
    if (!provider) {
        return {
            success: false,
            status: 400,
            error: `Invalid video model: ${body.model}. Use format: provider/model`
        };
    }
    const providerConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$videoRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getVideoProvider"])(provider);
    if (!providerConfig) {
        return {
            success: false,
            status: 400,
            error: `Unknown video provider: ${provider}`
        };
    }
    if (providerConfig.format === "vertex-veo") {
        return handleVertexVeoGeneration({
            model,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "google-flow") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$googleFlowHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleGoogleFlowVideoGeneration"])({
            model,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "comfyui") {
        return handleComfyUIVideoGeneration({
            model,
            provider,
            providerConfig: {
                ...providerConfig,
                baseUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveComfyUiBaseUrl"])(credentials, providerConfig.baseUrl)
            },
            body,
            log
        });
    }
    if (providerConfig.format === "sdwebui-video") {
        return handleSDWebUIVideoGeneration({
            model,
            provider,
            providerConfig,
            body,
            log
        });
    }
    if (providerConfig.format === "kie-video") {
        return handleKieVideoGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "runwayml") {
        return handleRunwayVideoGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "haiper-video") {
        return handleHaiperVideoGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "veoaifree-web") {
        return handleVeoAiFreeVideoGeneration({
            model,
            provider,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "leonardo-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$leonardoHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleLeonardoVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "deepinfra-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$deepinfraHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleDeepinfraVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "dashscope-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$dashscopeHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleDashscopeVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "segmind") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleSegmindVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "novita-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$novitaHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleNovitaVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "xai-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$xaiGrokImagineHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleXaiVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "adobe-firefly-video") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$videoGeneration$2f$adobeFireflyHandler$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleAdobeFireflyVideoGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    return {
        success: false,
        status: 400,
        error: `Unsupported video format: ${providerConfig.format}`
    };
}
/**
 * Veo video generation via Vertex AI (predictLongRunning → poll → MP4).
 * Uses the Vertex chat credentials (Service Account JSON or Express key).
 */ async function handleVertexVeoGeneration({ model, body, credentials, log }) {
    try {
        const aspectRatio = typeof body.aspect_ratio === "string" ? body.aspect_ratio : typeof body.aspectRatio === "string" ? body.aspectRatio : typeof body.size === "string" ? body.size : undefined;
        const durationSeconds = typeof body.duration === "number" ? body.duration : typeof body.durationSeconds === "number" ? body.durationSeconds : undefined;
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$vertexMedia$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["vertexGenerateVideo"])(credentials, {
            model,
            prompt: String(body.prompt ?? ""),
            aspectRatio,
            durationSeconds,
            negativePrompt: typeof body.negative_prompt === "string" ? body.negative_prompt : undefined
        });
        const item = result.base64 ? {
            b64_json: result.base64,
            format: result.format
        } : {
            url: result.url,
            format: result.format
        };
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: [
                    item
                ]
            }
        };
    } catch (err) {
        log?.error?.("VIDEO", `Vertex Veo generation failed: ${err?.message}`);
        return {
            success: false,
            status: typeof err?.status === "number" ? err.status : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err?.message || "Vertex Veo generation failed")
        };
    }
}
/**
 * Handle ComfyUI video generation
 * Submits an AnimateDiff or SVD workflow, polls for completion, fetches output video
 */ async function handleVeoAiFreeVideoGeneration({ model, provider, body, credentials, log }) {
    const executor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getExecutor"])(provider);
    if (!executor) {
        return {
            success: false,
            status: 400,
            error: `Unknown video provider: ${provider}`
        };
    }
    const prompt = String(body.prompt ?? "");
    const systemParts = [];
    if (body.size) systemParts.push(`aspect_ratio: ${body.size}`);
    if (body.aspect_ratio) systemParts.push(`aspect_ratio: ${body.aspect_ratio}`);
    const response = await executor.execute({
        model,
        body: {
            ...body,
            model: `${provider}/${model}`,
            messages: [
                ...systemParts.length > 0 ? [
                    {
                        role: "system",
                        content: systemParts.join("\n")
                    }
                ] : [],
                {
                    role: "user",
                    content: prompt
                }
            ]
        },
        stream: false,
        credentials: credentials || {
            connectionId: "noauth"
        },
        signal: null,
        log
    });
    const upstreamResponse = response instanceof Response ? response : response.response;
    if (!upstreamResponse.ok) {
        return {
            success: false,
            status: upstreamResponse.status || 502,
            error: await upstreamResponse.text().catch(()=>"Video provider error")
        };
    }
    const payload = await upstreamResponse.json().catch(()=>null);
    const item = Array.isArray(payload?.data) ? payload.data[0] : null;
    if (!payload || !Array.isArray(payload.data) || payload.data.length !== 1 || !item || typeof item.b64_json !== "string" || item.b64_json.trim().length === 0 || item.format !== "mp4" || typeof item.url === "string") {
        return {
            success: false,
            status: 502,
            error: {
                error: {
                    message: "Veo AI Free did not return a valid MP4 artifact",
                    type: "upstream_error",
                    code: "VIDEO_ARTIFACT_UNAVAILABLE"
                }
            }
        };
    }
    return {
        success: true,
        data: payload
    };
}
async function handleComfyUIVideoGeneration({ model, provider, providerConfig, body, log }) {
    const startTime = Date.now();
    const [width, height] = (body.size || "512x512").split("x").map(Number);
    const frames = body.frames || 16;
    // AnimateDiff workflow template
    const workflow = {
        "1": {
            class_type: "CheckpointLoaderSimple",
            inputs: {
                ckpt_name: model
            }
        },
        "2": {
            class_type: "CLIPTextEncode",
            inputs: {
                text: body.prompt,
                clip: [
                    "1",
                    1
                ]
            }
        },
        "3": {
            class_type: "CLIPTextEncode",
            inputs: {
                text: body.negative_prompt || "",
                clip: [
                    "1",
                    1
                ]
            }
        },
        "4": {
            class_type: "EmptyLatentImage",
            inputs: {
                width: width || 512,
                height: height || 512,
                batch_size: frames
            }
        },
        "5": {
            class_type: "KSampler",
            inputs: {
                seed: Math.floor(Math.random() * 2 ** 32),
                steps: body.steps || 20,
                cfg: body.cfg_scale || 7,
                sampler_name: "euler",
                scheduler: "normal",
                denoise: 1,
                model: [
                    "1",
                    0
                ],
                positive: [
                    "2",
                    0
                ],
                negative: [
                    "3",
                    0
                ],
                latent_image: [
                    "4",
                    0
                ]
            }
        },
        "6": {
            class_type: "VAEDecode",
            inputs: {
                samples: [
                    "5",
                    0
                ],
                vae: [
                    "1",
                    2
                ]
            }
        },
        "7": {
            class_type: "SaveAnimatedWEBP",
            inputs: {
                filename_prefix: "omniroute_video",
                fps: body.fps || 8,
                lossless: false,
                quality: 80,
                method: "default",
                images: [
                    "6",
                    0
                ]
            }
        }
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("VIDEO", `${provider}/${model} (comfyui) | prompt: "${promptPreview}..." | frames: ${frames}`);
    }
    try {
        const promptId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["submitComfyWorkflow"])(providerConfig.baseUrl, workflow);
        const historyEntry = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pollComfyResult"])(providerConfig.baseUrl, promptId, 300_000);
        const outputFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractComfyOutputFiles"])(historyEntry);
        const videos = [];
        for (const file of outputFiles){
            const buffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchComfyOutput"])(providerConfig.baseUrl, file.filename, file.subfolder, file.type);
            const base64 = Buffer.from(buffer).toString("base64");
            videos.push({
                b64_json: base64,
                format: "webp"
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                videos_count: videos.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: videos
            }
        };
    } catch (err) {
        if (log) log.error("VIDEO", `${provider} comfyui error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
/**
 * Handle SD WebUI video generation via AnimateDiff extension
 * POST to the AnimateDiff API endpoint
 */ async function handleSDWebUIVideoGeneration({ model, provider, providerConfig, body, log }) {
    const startTime = Date.now();
    const [width, height] = (body.size || "512x512").split("x").map(Number);
    const url = `${providerConfig.baseUrl}/animatediff/v1/generate`;
    const upstreamBody = {
        prompt: body.prompt,
        negative_prompt: body.negative_prompt || "",
        width: width || 512,
        height: height || 512,
        steps: body.steps || 20,
        cfg_scale: body.cfg_scale || 7,
        frames: body.frames || 16,
        fps: body.fps || 8
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("VIDEO", `${provider}/${model} (sdwebui) | prompt: "${promptPreview}..."`);
    }
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("VIDEO", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: response.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: response.status,
                error: errorText
            };
        }
        const data = await response.json();
        // SD WebUI AnimateDiff returns { video: "base64..." } or { images: [...] }
        const videos = [];
        if (data.video) {
            videos.push({
                b64_json: data.video,
                format: "mp4"
            });
        } else if (data.images) {
            for (const img of data.images){
                videos.push({
                    b64_json: typeof img === "string" ? img : img.image,
                    format: "mp4"
                });
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                videos_count: videos.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: videos
            }
        };
    } catch (err) {
        if (log) log.error("VIDEO", `${provider} sdwebui error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
function normalizeKieVideoResult(recordData) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
    const response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(data.response) ? data.response : {};
    const resultJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseKieResultJson"])(recordData);
    const urls = Array.isArray(resultJson?.resultUrls) ? resultJson.resultUrls : Array.isArray(resultJson?.videoUrls) ? resultJson.videoUrls : Array.isArray(response.resultUrls) ? response.resultUrls : [];
    return urls.filter((url)=>typeof url === "string" && url.length > 0);
}
async function handleKieVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const timeoutMs = Number(body.timeout_ms) > 0 ? Number(body.timeout_ms) : 300000;
    const pollIntervalMs = Number(body.poll_interval_ms) > 0 ? Number(body.poll_interval_ms) : 2500;
    const token = credentials?.apiKey || credentials?.accessToken;
    const baseUrl = providerConfig.baseUrl.replace(/\/$/, "");
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (!token) {
        return {
            success: false,
            status: 401,
            error: "KIE API key is required"
        };
    }
    const payload = {
        model,
        input: {
            prompt,
            duration: body.duration ? String(body.duration) : "5",
            aspect_ratio: typeof body.aspect_ratio === "string" ? body.aspect_ratio : "16:9",
            sound: body.sound === true
        }
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("VIDEO", `${provider}/${model} (kie-video) | prompt: "${promptPreview}..."`);
    }
    try {
        const createData = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].createTask({
            baseUrl,
            token,
            payload
        });
        const taskId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieTaskId"])(createData);
        if (!taskId) {
            const errorMessage = createData?.msg || createData?.message || createData?.error || "KIE video generation did not return taskId";
            if (log) {
                log.error("VIDEO", `KIE createTask failed: ${JSON.stringify(createData)}`);
            }
            return {
                success: false,
                status: 502,
                error: errorMessage
            };
        }
        const statusUrl = providerConfig.statusUrl || `${baseUrl}/api/v1/jobs/recordInfo`;
        const { data: recordData, state } = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].pollTask({
            statusUrl,
            taskId: String(taskId),
            token,
            timeoutMs,
            pollIntervalMs
        });
        if (state === "success") {
            const videoUrls = normalizeKieVideoResult(recordData);
            const videos = videoUrls.map((url)=>({
                    url,
                    format: "mp4"
                }));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: 200,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                responseBody: {
                    videos_count: videos.length
                }
            }).catch(()=>{});
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: videos
                }
            };
        }
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
        const errorMessage = data.failMsg || data.errorMessage || record.msg || "KIE video task failed";
        return {
            success: false,
            status: 502,
            error: String(errorMessage)
        };
    } catch (err) {
        return {
            success: false,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(err) && Number.isFinite(Number(err.status)) ? Number(err.status) : 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
async function handleRunwayVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return {
            success: false,
            status: 400,
            error: "No credentials for Runway provider"
        };
    }
    const promptImage = resolveRunwayPromptImage(body);
    const useImageToVideo = Boolean(promptImage);
    if (!useImageToVideo && __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["RUNWAYML_IMAGE_REQUIRED_MODELS"].has(model)) {
        return {
            success: false,
            status: 400,
            error: `Runway model ${model} requires promptImage for image-to-video generation`
        };
    }
    const ratio = resolveRunwayRatio(body);
    const duration = resolveRunwayDuration(body);
    const timeoutMs = resolvePositiveInteger(body.timeout_ms, 300000);
    const pollIntervalMs = resolvePositiveInteger(body.poll_interval_ms, 5000);
    const submitUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRunwayApiUrl"])(useImageToVideo ? "/image_to_video" : "/text_to_video", providerConfig.baseUrl);
    const headers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRunwayHeaders"])(token);
    // prettier-ignore
    const upstreamBody = {
        model,
        promptText: body.prompt,
        ratio,
        duration
    };
    if (useImageToVideo) upstreamBody.promptImage = promptImage;
    if (typeof body.seed === "number" && Number.isFinite(body.seed)) {
        upstreamBody.seed = Math.max(0, Math.floor(body.seed));
    }
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("VIDEO", `${provider}/${model} (runway ${useImageToVideo ? "image_to_video" : "text_to_video"}) | prompt: "${promptPreview}..."`);
    }
    try {
        const submitResponse = await fetch(submitUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(upstreamBody)
        });
        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            if (log) {
                log.error("VIDEO", `${provider} submit error ${submitResponse.status}: ${errorText.slice(0, 200)}`);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: submitResponse.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: submitResponse.status,
                error: errorText
            };
        }
        const submitData = await submitResponse.json();
        const taskId = typeof submitData?.id === "string" ? submitData.id : "";
        if (!taskId) {
            const errorText = `Runway submit did not return task id: ${JSON.stringify(submitData).slice(0, 400)}`;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: errorText
            };
        }
        const deadline = Date.now() + timeoutMs;
        let lastTask = null;
        while(Date.now() < deadline){
            const taskResponse = await fetch((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$runway$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildRunwayApiUrl"])(`/tasks/${encodeURIComponent(taskId)}`, providerConfig.baseUrl), {
                method: "GET",
                headers
            });
            if (!taskResponse.ok) {
                const errorText = await taskResponse.text();
                if (log) {
                    log.error("VIDEO", `${provider} poll error ${taskResponse.status}: ${errorText.slice(0, 200)}`);
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: taskResponse.status,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    error: errorText.slice(0, 500),
                    responseBody: {
                        taskId,
                        stage: "poll"
                    }
                }).catch(()=>{});
                return {
                    success: false,
                    status: taskResponse.status,
                    error: errorText
                };
            }
            const task = await taskResponse.json();
            lastTask = task;
            const status = String(task?.status || "").toUpperCase();
            if (status === "SUCCEEDED") {
                const videos = await normalizeRunwayVideoResult(task, body);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    responseBody: {
                        videos_count: videos.length,
                        taskId,
                        mode: "async"
                    }
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: videos
                    }
                };
            }
            if (RUNWAY_TERMINAL_FAILURE_STATUSES.has(status)) {
                const errorText = extractRunwayFailureMessage(task) || `Runway task failed with status ${status}`;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 502,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    error: errorText.slice(0, 500),
                    responseBody: {
                        taskId,
                        status
                    }
                }).catch(()=>{});
                return {
                    success: false,
                    status: 502,
                    error: errorText
                };
            }
            await sleep(pollIntervalMs);
        }
        const timeoutError = `Runway task timeout after ${timeoutMs}ms (taskId=${taskId}, status=${String(lastTask?.status || "unknown")})`;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 504,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: timeoutError,
            responseBody: {
                taskId,
                status: lastTask?.status ?? null
            }
        }).catch(()=>{});
        return {
            success: false,
            status: 504,
            error: timeoutError
        };
    } catch (err) {
        if (log) log.error("VIDEO", `${provider} runway error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err) || "Video provider error"
        };
    }
}
const RUNWAY_TERMINAL_FAILURE_STATUSES = new Set([
    "FAILED",
    "CANCELED",
    "CANCELLED",
    "ABORTED",
    "DELETED"
]);
function resolveRunwayPromptImage(body) {
    const directCandidates = [
        body.promptImage,
        body.prompt_image,
        body.image,
        body.image_url,
        body.imageUrl,
        body.provider_options?.promptImage,
        body.provider_options?.prompt_image
    ];
    for (const candidate of directCandidates){
        if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
        if (candidate && typeof candidate === "object") return candidate;
        if (Array.isArray(candidate) && candidate.length > 0) return candidate;
    }
    const arrayCandidates = [
        body.imageUrls,
        body.image_urls,
        body.provider_options?.imageUrls,
        body.provider_options?.image_urls
    ];
    for (const candidate of arrayCandidates){
        if (Array.isArray(candidate) && candidate.length > 0) return candidate;
    }
    return null;
}
function resolveRunwayRatio(body) {
    const aspectRatio = typeof body.aspect_ratio === "string" ? body.aspect_ratio : body.aspectRatio;
    if (aspectRatio === "1280:720" || aspectRatio === "720:1280") return aspectRatio;
    if (aspectRatio === "16:9") return "1280:720";
    if (aspectRatio === "9:16") return "720:1280";
    const size = typeof body.size === "string" ? body.size : "";
    const [widthRaw, heightRaw] = size.split("x");
    const width = Number(widthRaw);
    const height = Number(heightRaw);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        return width >= height ? "1280:720" : "720:1280";
    }
    return "1280:720";
}
function resolveRunwayDuration(body) {
    if (Number.isFinite(body.duration)) {
        return clampRunwayDuration(body.duration);
    }
    if (Number.isFinite(body.frames) && Number.isFinite(body.fps) && Number(body.fps) > 0) {
        return clampRunwayDuration(Number(body.frames) / Number(body.fps));
    }
    return 5;
}
function clampRunwayDuration(value) {
    const duration = Math.round(Number(value));
    if (!Number.isFinite(duration)) return 5;
    return Math.min(10, Math.max(2, duration));
}
function resolvePositiveInteger(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
    return Math.floor(numeric);
}
function extractRunwayOutputUrls(task) {
    const rawOutput = Array.isArray(task?.output) ? task.output : Array.isArray(task?.result) ? task.result : [];
    return rawOutput.map((entry)=>{
        if (typeof entry === "string") return entry;
        if (!entry || typeof entry !== "object") return null;
        return entry.url || entry.uri || entry.videoUrl || entry.video_url || null;
    }).filter((value)=>typeof value === "string" && value.length > 0);
}
function extractRunwayFailureMessage(task) {
    const directCandidates = [
        task?.failure,
        task?.failureReason,
        task?.error,
        task?.errorMessage,
        task?.message
    ];
    for (const candidate of directCandidates){
        if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
    if (task?.failure && typeof task.failure === "object") {
        const nestedCandidates = [
            task.failure.message,
            task.failure.reason,
            task.failure.error,
            task.failure.code
        ];
        for (const candidate of nestedCandidates){
            if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
        }
    }
    return null;
}
async function normalizeRunwayVideoResult(task, body) {
    const urls = extractRunwayOutputUrls(task);
    if (urls.length === 0) {
        throw new Error(`Runway task completed without output URLs: ${JSON.stringify(task).slice(0, 400)}`);
    }
    if (body.response_format === "url") {
        return urls.map((url)=>({
                url,
                format: "mp4"
            }));
    }
    const videos = [];
    for (const url of urls){
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Runway output fetch failed (${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();
        videos.push({
            b64_json: Buffer.from(arrayBuffer).toString("base64"),
            format: "mp4"
        });
    }
    return videos;
}
async function handleHaiperVideoGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || "";
    const res = await fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            HAIPER_KEY: token
        },
        body: JSON.stringify({
            prompt: body.prompt,
            duration: 4,
            aspect_ratio: "16:9"
        })
    });
    if (!res.ok) {
        const errorText = await res.text();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/videos/generations",
            status: res.status,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: errorText.slice(0, 500)
        }).catch(()=>{});
        return {
            success: false,
            status: res.status,
            error: errorText
        };
    }
    const { job_id } = await res.json();
    const deadline = Date.now() + 300000;
    while(Date.now() < deadline){
        await sleep(5000);
        const statusRes = await fetch(`${providerConfig.statusUrl}/${job_id}`, {
            headers: {
                HAIPER_KEY: token
            }
        });
        const status = await statusRes.json();
        if (status.status === "completed" || status.status === "succeeded") {
            const videoUrl = status.creation_url || status.output?.video_url;
            if (videoUrl) {
                const videoRes = await fetch(videoUrl);
                const buf = await videoRes.arrayBuffer();
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/videos/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: [
                            {
                                b64_json: Buffer.from(buf).toString("base64"),
                                format: "mp4"
                            }
                        ]
                    }
                };
            }
        }
        if (status.status === "failed") {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/videos/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: "Haiper video generation failed"
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: "Haiper video generation failed"
            };
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/videos/generations",
        status: 504,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        error: "Haiper video generation timed out"
    }).catch(()=>{});
    return {
        success: false,
        status: 504,
        error: "Haiper video generation timed out"
    };
}
function sleep(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/chatCore/cooldownClassification.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isSelfInflictedUpstreamTimeout",
    ()=>isSelfInflictedUpstreamTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/constants.ts [instrumentation] (ecmascript) <locals>");
;
function isSelfInflictedUpstreamTimeout(status, errorType, provider) {
    return status === __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$constants$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["HTTP_STATUS"].GATEWAY_TIMEOUT && errorType === "upstream_timeout" && provider !== "antigravity";
}
}),
];

//# sourceMappingURL=open-sse_handlers_1mwh-6n._.js.map
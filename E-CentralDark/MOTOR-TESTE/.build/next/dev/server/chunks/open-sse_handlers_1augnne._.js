module.exports = [
"[project]/open-sse/handlers/imageGeneration/providers/sdWebUI.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleSDWebUIImageGeneration",
    ()=>handleSDWebUIImageGeneration
]);
// Auto-extracted from open-sse/handlers/imageGeneration.ts in PR-#4582-batch
// Family: sd-webui | Module: sdWebUI | Lines: 3121-3212 (92 LOC)
// Ref: see open-sse/handlers/imageGeneration.ts top-of-file comment for split rationale
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
async function handleSDWebUIImageGeneration({ model, provider, providerConfig, body, log }) {
    const startTime = Date.now();
    const [width, height] = (body.size || "512x512").split("x").map(Number);
    const upstreamBody = {
        prompt: body.prompt,
        negative_prompt: body.negative_prompt || "",
        width: width || 512,
        height: height || 512,
        steps: body.steps || 20,
        cfg_scale: body.cfg_scale || 7,
        sampler_name: body.sampler || "Euler a",
        batch_size: body.n || 1,
        override_settings: {
            sd_model_checkpoint: model
        }
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (sdwebui) | prompt: "${promptPreview}..."`);
    }
    try {
        const response = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
        // SD WebUI returns { images: ["base64...", ...] }
        const images = (data.images || []).map((b64)=>({
                b64_json: b64,
                revised_prompt: body.prompt
            }));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                images_count: images.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: images
            }
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} sdwebui error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/hyperbolic.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleHyperbolicImageGeneration",
    ()=>handleHyperbolicImageGeneration
]);
// Auto-extracted from open-sse/handlers/imageGeneration.ts in PR-#4582-batch
// Family: hyperbolic | Module: hyperbolic | Lines: 2661-2758 (98 LOC)
// Ref: see open-sse/handlers/imageGeneration.ts top-of-file comment for split rationale
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
async function handleHyperbolicImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const [width, height] = (body.size || "1024x1024").split("x").map(Number);
    const upstreamBody = {
        model_name: model,
        prompt: body.prompt,
        height: height || 1024,
        width: width || 1024,
        backend: "auto"
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (hyperbolic) | prompt: "${promptPreview}..."`);
    }
    try {
        const response = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
        // Transform { images: [{ image: base64 }] } → OpenAI format
        const images = (data.images || []).map((img)=>({
                b64_json: img.image,
                revised_prompt: body.prompt
            }));
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                images_count: images.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: images
            }
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/huggingface.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleHuggingFaceImageGeneration",
    ()=>handleHuggingFaceImageGeneration
]);
// HuggingFace Hub image-generation provider.
//
// The HF Inference API text-to-image task returns the generated image as raw
// binary bytes (e.g. `image/jpeg`), not a JSON envelope — unlike most other
// image providers wired in this file. Mirrors the shape/error-handling
// conventions used by ./hyperbolic.ts and ./leonardo.ts.
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
async function handleHuggingFaceImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || credentials?.accessToken || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (log) {
        log.info("IMAGE", `${provider}/${model} (huggingface) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const response = await fetch(`${providerConfig.baseUrl}/${model}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            },
            body: JSON.stringify({
                inputs: prompt
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
        const buf = await response.arrayBuffer();
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
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
                        revised_prompt: prompt
                    }
                ]
            }
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/comfyUI.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleComfyUIImageGeneration",
    ()=>handleComfyUIImageGeneration
]);
// Auto-extracted from open-sse/handlers/imageGeneration.ts in PR-#4582-batch
// Family: comfyui | Module: comfyUI | Lines: 3213-3314 (102 LOC)
// Ref: see open-sse/handlers/imageGeneration.ts top-of-file comment for split rationale
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/comfyuiClient.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function handleComfyUIImageGeneration({ model, provider, providerConfig, body, log }) {
    const startTime = Date.now();
    const [width, height] = (body.size || "1024x1024").split("x").map(Number);
    // Default txt2img workflow template for ComfyUI
    const workflow = {
        "3": {
            class_type: "KSampler",
            inputs: {
                seed: parseInt((0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "").substring(0, 8), 16) % 2 ** 32,
                steps: body.steps || 20,
                cfg: body.cfg_scale || 7,
                sampler_name: "euler",
                scheduler: "normal",
                denoise: 1,
                model: [
                    "4",
                    0
                ],
                positive: [
                    "6",
                    0
                ],
                negative: [
                    "7",
                    0
                ],
                latent_image: [
                    "5",
                    0
                ]
            }
        },
        "4": {
            class_type: "CheckpointLoaderSimple",
            inputs: {
                ckpt_name: model
            }
        },
        "5": {
            class_type: "EmptyLatentImage",
            inputs: {
                width: width || 1024,
                height: height || 1024,
                batch_size: body.n || 1
            }
        },
        "6": {
            class_type: "CLIPTextEncode",
            inputs: {
                text: body.prompt,
                clip: [
                    "4",
                    1
                ]
            }
        },
        "7": {
            class_type: "CLIPTextEncode",
            inputs: {
                text: body.negative_prompt || "",
                clip: [
                    "4",
                    1
                ]
            }
        },
        "8": {
            class_type: "VAEDecode",
            inputs: {
                samples: [
                    "3",
                    0
                ],
                vae: [
                    "4",
                    2
                ]
            }
        },
        "9": {
            class_type: "SaveImage",
            inputs: {
                filename_prefix: "omniroute",
                images: [
                    "8",
                    0
                ]
            }
        }
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (comfyui) | prompt: "${promptPreview}..."`);
    }
    try {
        const promptId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["submitComfyWorkflow"])(providerConfig.baseUrl, workflow);
        const historyEntry = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["pollComfyResult"])(providerConfig.baseUrl, promptId);
        const outputFiles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractComfyOutputFiles"])(historyEntry);
        const images = [];
        for (const file of outputFiles){
            const buffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchComfyOutput"])(providerConfig.baseUrl, file.filename, file.subfolder, file.type);
            const base64 = Buffer.from(buffer).toString("base64");
            images.push({
                b64_json: base64,
                revised_prompt: body.prompt
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                images_count: images.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: images
            }
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} comfyui error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/imagen3.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleImagen3ImageGeneration",
    ()=>handleImagen3ImageGeneration
]);
// Auto-extracted from open-sse/handlers/imageGeneration.ts in PR-#4582-batch
// Family: imagen3 | Module: imagen3 | Lines: 3670-3777 (108 LOC)
// Ref: see open-sse/handlers/imageGeneration.ts top-of-file comment for split rationale
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/image/sizeMapper.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
async function handleImagen3ImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const aspectRatio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(body.size);
    const upstreamBody = {
        prompt: body.prompt,
        aspect_ratio: aspectRatio,
        number_of_images: body.n ?? 1
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (imagen3) | prompt: "${promptPreview}..." | aspect_ratio: ${aspectRatio}`);
    }
    try {
        const response = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: response.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500),
                requestBody: upstreamBody
            }).catch(()=>{});
            return {
                success: false,
                status: response.status,
                error: errorText
            };
        }
        const data = await response.json();
        // Normalize response to OpenAI format
        const images = [];
        if (Array.isArray(data.images)) {
            images.push(...data.images.map((img)=>({
                    b64_json: img.image ?? img.b64_json ?? img.url ?? img,
                    revised_prompt: body.prompt
                })));
        } else if (Array.isArray(data.data)) {
            images.push(...data.data);
        } else if (data.url || data.b64_json || data.image) {
            images.push({
                b64_json: data.image || data.b64_json || data.url,
                url: data.url,
                revised_prompt: body.prompt
            });
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                images_count: images.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: data.created || Math.floor(Date.now() / 1000),
                data: images
            }
        };
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (log) log.error("IMAGE", `${provider} fetch error: ${errMsg}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: errMsg
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${errMsg}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/googleImagen.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildImagenPredictBody",
    ()=>buildImagenPredictBody,
    "handleGoogleImagenGeneration",
    ()=>handleGoogleImagenGeneration,
    "isImagenModel",
    ()=>isImagenModel,
    "parseImagenPredictResponse",
    ()=>parseImagenPredictResponse
]);
// Google AI Studio (Gemini API) Imagen image generation.
//
// Unlike the antigravity "gemini-image" format (which wraps generateContent in a
// Cloud Code envelope), the Imagen family on generativelanguage.googleapis.com uses
// the dedicated ":predict" endpoint with an instances/parameters body and returns
// base64 image bytes under `predictions[].bytesBase64Encoded`.
//
// Docs: https://ai.google.dev/gemini-api/docs/imagen  (Imagen requires a billing-
// enabled Google project; free-tier keys get 403 / quota 0.)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/image/sizeMapper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function isImagenModel(model) {
    return /^imagen-/i.test(String(model || ""));
}
function buildImagenPredictBody(body) {
    const prompt = typeof body?.prompt === "string" ? body.prompt : String(body?.prompt ?? "");
    const n = Number(body?.n);
    const sampleCount = Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 4) : 1;
    return {
        instances: [
            {
                prompt
            }
        ],
        parameters: {
            sampleCount,
            aspectRatio: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(body?.aspect_ratio || body?.size)
        }
    };
}
function parseImagenPredictResponse(data, prompt) {
    const predictions = Array.isArray(data?.predictions) ? data.predictions : [];
    const images = [];
    for (const p of predictions){
        const b64 = p?.bytesBase64Encoded ?? p?.b64_json ?? p?.image ?? null;
        if (typeof b64 === "string" && b64.length > 0) {
            images.push({
                b64_json: b64,
                revised_prompt: prompt
            });
        }
    }
    return {
        created: Math.floor(Date.now() / 1000),
        data: images
    };
}
async function handleGoogleImagenGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || credentials?.accessToken || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (!isImagenModel(model)) {
        return {
            success: false,
            status: 400,
            error: `Model ${model} is not an Imagen model. Gemini flash-image models route through /v1/chat/completions, not /v1/images/generations.`
        };
    }
    const upstreamBody = buildImagenPredictBody(body);
    // baseUrl is https://generativelanguage.googleapis.com/v1beta/models
    const url = `${providerConfig.baseUrl.replace(/\/$/, "")}/${model}:predict`;
    if (log) {
        log.info("IMAGE", `${provider}/${model} (google-imagen) | prompt: "${prompt.slice(0, 60)}..." | aspectRatio: ${upstreamBody.parameters.aspectRatio}`);
    }
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Key travels in the header, never the URL, so it stays out of logs.
                "x-goog-api-key": token
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            const safeError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(errorText);
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${safeError.slice(0, 200)}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: response.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: safeError.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: response.status,
                error: safeError
            };
        }
        const data = await response.json();
        const normalized = parseImagenPredictResponse(data, prompt);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                images_count: normalized.data.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: normalized
        };
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (log) log.error("IMAGE", `${provider} fetch error: ${errMsg}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: errMsg
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(errMsg)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/ideogram.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleIdeogramImageGeneration",
    ()=>handleIdeogramImageGeneration
]);
// Auto-extracted from open-sse/handlers/imageGeneration.ts in PR-#4582-batch
// Family: ideogram | Module: ideogram | Lines: 3559-3669 (111 LOC)
// Ref: see open-sse/handlers/imageGeneration.ts top-of-file comment for split rationale
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
async function handleIdeogramImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (log) {
        log.info("IMAGE", `${provider}/${model} (ideogram) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const res = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Api-Key": token
            },
            body: JSON.stringify({
                prompt,
                aspect_ratio: "ASPECT_16_9",
                model: model || "V_3"
            })
        });
        if (!res.ok) {
            const errorText = await res.text();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
        const data = await res.json();
        if (data.data && data.data.length > 0) {
            const imgUrl = data.data[0].url;
            const imgRes = await fetch(imgUrl);
            if (!imgRes.ok) {
                return {
                    success: false,
                    status: imgRes.status,
                    error: `Failed to download image: ${imgRes.status}`
                };
            }
            const buf = await imgRes.arrayBuffer();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
                            b64_json: Buffer.from(buf).toString("base64")
                        }
                    ]
                }
            };
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: "No images returned from Ideogram"
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: "No images returned from Ideogram"
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} ideogram error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/haiper.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleHaiperImageGeneration",
    ()=>handleHaiperImageGeneration
]);
// Auto-extracted from open-sse/handlers/imageGeneration.ts in PR-#4582-batch
// Family: haiper | Module: haiper | Lines: 3315-3426 (112 LOC)
// Ref: see open-sse/handlers/imageGeneration.ts top-of-file comment for split rationale
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/sleep.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function handleHaiperImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (log) {
        log.info("IMAGE", `${provider}/${model} (haiper) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const res = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                HAIPER_KEY: token
            },
            body: JSON.stringify({
                prompt,
                aspect_ratio: body.aspect_ratio || "16:9"
            })
        });
        if (!res.ok) {
            const errorText = await res.text();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sleep"])(5000);
            const statusRes = await fetch(`${providerConfig.statusUrl}/${job_id}`, {
                headers: {
                    HAIPER_KEY: token
                }
            });
            const status = await statusRes.json();
            if (status.status === "completed" || status.status === "succeeded") {
                const imgUrl = status.creation_url || status.output?.image_url;
                if (imgUrl) {
                    const imgRes = await fetch(imgUrl);
                    if (!imgRes.ok) {
                        return {
                            success: false,
                            status: imgRes.status,
                            error: `Failed to download image: ${imgRes.status}`
                        };
                    }
                    const buf = await imgRes.arrayBuffer();
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                        method: "POST",
                        path: "/v1/images/generations",
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
                                    b64_json: Buffer.from(buf).toString("base64")
                                }
                            ]
                        }
                    };
                }
            }
            if (status.status === "failed") {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/images/generations",
                    status: 502,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    error: "Haiper image generation failed"
                }).catch(()=>{});
                return {
                    success: false,
                    status: 502,
                    error: "Haiper image generation failed"
                };
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 504,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: "Haiper image generation timed out"
        }).catch(()=>{});
        return {
            success: false,
            status: 504,
            error: "Haiper image generation timed out"
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} haiper error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/leonardo.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleLeonardoImageGeneration",
    ()=>handleLeonardoImageGeneration
]);
// Auto-extracted from open-sse/handlers/imageGeneration.ts in PR-#4582-batch
// Family: leonardo | Module: leonardo | Lines: 3427-3558 (132 LOC)
// Ref: see open-sse/handlers/imageGeneration.ts top-of-file comment for split rationale
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/sleep.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function handleLeonardoImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    if (log) {
        log.info("IMAGE", `${provider}/${model} (leonardo) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const res = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                modelId: model || "phoenix",
                prompt,
                width: body.width || 1024,
                height: body.height || 1024,
                num_images: 1
            })
        });
        if (!res.ok) {
            const errorText = await res.text();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
                path: "/v1/images/generations",
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sleep"])(5000);
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
                    const imgRes = await fetch(imgUrl);
                    if (!imgRes.ok) {
                        return {
                            success: false,
                            status: imgRes.status,
                            error: `Failed to download image: ${imgRes.status}`
                        };
                    }
                    const buf = await imgRes.arrayBuffer();
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                        method: "POST",
                        path: "/v1/images/generations",
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
                                    b64_json: Buffer.from(buf).toString("base64")
                                }
                            ]
                        }
                    };
                }
            }
            if (gen.status === "FAILED") {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/images/generations",
                    status: 502,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    error: "Leonardo image generation failed"
                }).catch(()=>{});
                return {
                    success: false,
                    status: 502,
                    error: "Leonardo image generation failed"
                };
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 504,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: "Leonardo image generation timed out"
        }).catch(()=>{});
        return {
            success: false,
            status: 504,
            error: "Leonardo image generation timed out"
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} leonardo error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/freepik.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleFreepikImageGeneration",
    ()=>handleFreepikImageGeneration
]);
// Freepik (Magnific Mystic) image generation adapter.
// Async submit->poll flow modeled on leonardo.ts's generationId pattern:
// POST /v1/ai/mystic returns { data: { task_id, status } }, then
// GET /v1/ai/mystic/{task_id} is polled until status is COMPLETED/FAILED.
// Docs: https://docs.magnific.com/api-reference/mystic (Freepik rebranded to
// Magnific in April 2026; both `api.freepik.com` and the newer
// `api.magnific.com` domain/header pair are in circulation during the
// transition, so the base URL and auth header both come from providerConfig
// rather than being hardcoded here).
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/sleep.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const DEFAULT_POLL_INTERVAL_MS = 4000;
const DEFAULT_POLL_TIMEOUT_MS = 180000;
function normalizePositiveNumber(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.floor(n);
}
function freepikAuthHeader(providerConfig, token) {
    const headerName = providerConfig.authHeader || "x-freepik-api-key";
    return {
        [headerName]: token
    };
}
async function logAndFail(params) {
    const { provider, model, startTime, status, error } = params;
    const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/images/generations",
        status,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        error: sanitized.slice(0, 500)
    }).catch(()=>{});
    return {
        success: false,
        status,
        error: sanitized
    };
}
async function submitMysticTask(params) {
    const { providerConfig, token, model, prompt, body } = params;
    return fetch(providerConfig.baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...freepikAuthHeader(providerConfig, token)
        },
        body: JSON.stringify({
            prompt,
            model: model || "realism",
            resolution: typeof body.resolution === "string" ? body.resolution : "1k",
            aspect_ratio: typeof body.aspect_ratio === "string" ? body.aspect_ratio : "square_1_1"
        })
    });
}
async function pollMysticTask(params) {
    const { providerConfig, token, taskId } = params;
    const statusBase = providerConfig.statusUrl || providerConfig.baseUrl;
    const res = await fetch(`${statusBase}/${taskId}`, {
        headers: {
            ...freepikAuthHeader(providerConfig, token)
        }
    });
    const json = await res.json();
    const task = json?.data || json;
    const status = typeof task?.status === "string" ? task.status : "IN_PROGRESS";
    const generated = Array.isArray(task?.generated) ? task.generated : [];
    return {
        status,
        imageUrl: typeof generated[0] === "string" ? generated[0] : undefined
    };
}
async function downloadGeneratedImage(imageUrl) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
        return {
            state: "failed",
            status: imgRes.status,
            error: `Failed to download image: ${imgRes.status}`
        };
    }
    const buf = await imgRes.arrayBuffer();
    return {
        state: "ok",
        b64: Buffer.from(buf).toString("base64")
    };
}
async function resolveCompletedResult(params) {
    const { provider, model, startTime, imageUrl } = params;
    if (!imageUrl) {
        return logAndFail({
            provider,
            model,
            startTime,
            status: 502,
            error: "Freepik Mystic completed without a generated image URL"
        });
    }
    const downloaded = await downloadGeneratedImage(imageUrl);
    if (downloaded.state === "failed") {
        return {
            success: false,
            status: downloaded.status,
            error: downloaded.error
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/images/generations",
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
                    b64_json: downloaded.b64
                }
            ]
        }
    };
}
async function pollUntilDone(params) {
    const { providerConfig, token, taskId, provider, model, startTime, pollIntervalMs, pollTimeoutMs } = params;
    const deadline = Date.now() + pollTimeoutMs;
    while(Date.now() < deadline){
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sleep"])(pollIntervalMs);
        const { status, imageUrl } = await pollMysticTask({
            providerConfig,
            token,
            taskId
        });
        if (status === "COMPLETED") {
            return resolveCompletedResult({
                provider,
                model,
                startTime,
                imageUrl
            });
        }
        if (status === "FAILED") {
            return logAndFail({
                provider,
                model,
                startTime,
                status: 502,
                error: "Freepik Mystic image generation failed"
            });
        }
    }
    return logAndFail({
        provider,
        model,
        startTime,
        status: 504,
        error: "Freepik Mystic image generation timed out"
    });
}
async function submitAndGetTaskId(params) {
    const { providerConfig, token, model, prompt, body, provider, startTime } = params;
    const res = await submitMysticTask({
        providerConfig,
        token,
        model,
        prompt,
        body
    });
    if (!res.ok) {
        const errorText = await res.text();
        return {
            failed: await logAndFail({
                provider,
                model,
                startTime,
                status: res.status,
                error: errorText
            })
        };
    }
    const submitJson = await res.json();
    const taskId = submitJson?.data?.task_id || submitJson?.task_id;
    if (!taskId) {
        return {
            failed: await logAndFail({
                provider,
                model,
                startTime,
                status: 502,
                error: "Freepik Mystic did not return a task_id"
            })
        };
    }
    return {
        taskId
    };
}
async function handleFreepikImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, DEFAULT_POLL_INTERVAL_MS);
    const pollTimeoutMs = normalizePositiveNumber(body.poll_timeout_ms, DEFAULT_POLL_TIMEOUT_MS);
    if (log) {
        log.info("IMAGE", `${provider}/${model} (freepik-mystic) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    try {
        const submitted = await submitAndGetTaskId({
            providerConfig,
            token,
            model,
            prompt,
            body,
            provider,
            startTime
        });
        if ("failed" in submitted) return submitted.failed;
        return await pollUntilDone({
            providerConfig,
            token,
            taskId: submitted.taskId,
            provider,
            model,
            startTime,
            pollIntervalMs,
            pollTimeoutMs
        });
    } catch (err) {
        const message = err?.message || String(err);
        if (log) log.error("IMAGE", `${provider} freepik error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message)}`);
        return logAndFail({
            provider,
            model,
            startTime,
            status: 502,
            error: `Image provider error: ${message}`
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/chatgptWeb.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CHATGPT_WEB_IMAGE_ID_RE",
    ()=>CHATGPT_WEB_IMAGE_ID_RE,
    "CHATGPT_WEB_IMAGE_MARKDOWN_RE",
    ()=>CHATGPT_WEB_IMAGE_MARKDOWN_RE,
    "buildChatGptWebImagePrompt",
    ()=>buildChatGptWebImagePrompt,
    "extractMarkdownImageUrls",
    ()=>extractMarkdownImageUrls,
    "handleChatGptWebImageGeneration",
    ()=>handleChatGptWebImageGeneration
]);
// Auto-extracted from open-sse/handlers/imageGeneration.ts in PR-#4582-batch
// Family: chatgpt-web | Module: chatgptWeb | Lines: 1102-1282 (181 LOC)
// Ref: see open-sse/handlers/imageGeneration.ts top-of-file comment for split rationale
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/chatgpt-web.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$chatgptImageCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/chatgptImageCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const CHATGPT_WEB_IMAGE_MARKDOWN_RE = /!\[[^\]]*\]\(([^)\s]+)\)/g;
const CHATGPT_WEB_IMAGE_ID_RE = /\/v1\/chatgpt-web\/image\/([a-f0-9]{16,64})(?=[?\s"'<>)]|$)/i;
function extractMarkdownImageUrls(text) {
    const urls = [];
    // String.prototype.matchAll consumes a fresh iterator and ignores the
    // regex's lastIndex, so no manual reset is required.
    for (const match of text.matchAll(CHATGPT_WEB_IMAGE_MARKDOWN_RE)){
        if (match[1]) urls.push(match[1]);
    }
    return urls;
}
function buildChatGptWebImagePrompt(body) {
    const prompt = String(body.prompt || "").trim();
    const details = [
        `Create an image for this prompt: ${prompt}`
    ];
    if (typeof body.size === "string" && body.size.trim()) {
        details.push(`Requested size: ${body.size.trim()}.`);
    }
    if (typeof body.quality === "string" && body.quality.trim()) {
        details.push(`Requested quality: ${body.quality.trim()}.`);
    }
    if (typeof body.style === "string" && body.style.trim()) {
        details.push(`Requested style: ${body.style.trim()}.`);
    }
    return details.join("\n");
}
async function handleChatGptWebImageGeneration({ model, provider, body, credentials, log, signal, clientHeaders, // Injectable so unit tests can drive the handler without a live ChatGPT
// session; production uses the real executor.
executorFactory = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatGptWebExecutor"]() }) {
    const startTime = Date.now();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
            provider,
            model,
            status: 400,
            startTime,
            error: "Prompt is required for ChatGPT Web image generation"
        });
    }
    if (!credentials?.apiKey) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
            provider,
            model,
            status: 401,
            startTime,
            error: "ChatGPT Web credentials missing session cookie"
        });
    }
    // Each image is one chatgpt.com chat turn (~30s). Cap at 4 (matches OpenAI's
    // own limit for GPT Image models) so a stray n=1000 doesn't pin the
    // executor for hours before the upstream HTTP timeout fires.
    const CHATGPT_WEB_IMAGE_N_MAX = 4;
    const rawCount = Number.isInteger(body.n) && body.n > 0 ? body.n : 1;
    if (rawCount > CHATGPT_WEB_IMAGE_N_MAX) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
            provider,
            model,
            status: 400,
            startTime,
            error: `ChatGPT Web image generation supports n=1..${CHATGPT_WEB_IMAGE_N_MAX} (got ${rawCount}); each n is a separate ~30s chat turn.`
        });
    }
    const requestedCount = rawCount;
    if (log && requestedCount > 1) {
        log.warn("IMAGE", `ChatGPT Web returns one image per chat turn; requested n=${requestedCount} will run sequentially`);
    }
    const wantsBase64 = body.response_format === "b64_json";
    const images = [];
    const requestBody = {
        model,
        prompt: prompt.slice(0, 500),
        size: body.size || undefined,
        quality: body.quality || undefined
    };
    for(let i = 0; i < requestedCount; i++){
        const executor = executorFactory();
        const result = await executor.execute({
            model,
            body: {
                messages: [
                    {
                        role: "user",
                        content: buildChatGptWebImagePrompt(body)
                    }
                ]
            },
            stream: false,
            credentials,
            signal,
            log,
            clientHeaders
        });
        const responseText = await result.response.text();
        if (result.response.status >= 400) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
                provider,
                model,
                status: result.response.status,
                startTime,
                error: responseText,
                requestBody
            });
        }
        let content = "";
        let imageResolutionFailed = false;
        try {
            const json = JSON.parse(responseText);
            content = String(json?.choices?.[0]?.message?.content || "");
            imageResolutionFailed = json?.x_image_resolution_failed === true;
        } catch  {
            content = responseText;
        }
        const urls = extractMarkdownImageUrls(content);
        if (urls.length === 0) {
            // Distinguish "image was generated upstream but OmniRoute could not
            // retrieve it" (executor flagged the unresolved asset pointer) from
            // "no image was produced at all" — the former is our bug/limitation,
            // not a failed prompt, so the message must not read as "no image made".
            const error = imageResolutionFailed ? `ChatGPT Web generated an image but OmniRoute could not retrieve it (the image asset could not be downloaded — the URL may have expired or ChatGPT changed its image delivery format). Please retry; if it persists, report it. Assistant text: ${content.slice(0, 200)}` : `ChatGPT Web completed without returning image markdown: ${content.slice(0, 300)}`;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
                provider,
                model,
                status: 502,
                startTime,
                error,
                requestBody
            });
        }
        for (const url of urls){
            if (!wantsBase64) {
                images.push({
                    url
                });
                continue;
            }
            const id = url.match(CHATGPT_WEB_IMAGE_ID_RE)?.[1];
            const cached = id ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$chatgptImageCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChatGptImage"])(id) : null;
            if (!cached) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
                    provider,
                    model,
                    status: 502,
                    startTime,
                    error: "ChatGPT Web image bytes expired before b64_json conversion",
                    requestBody
                });
            }
            images.push({
                b64_json: cached.bytes.toString("base64")
            });
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageSuccessResult"])({
        provider,
        model,
        startTime,
        requestBody,
        responseBody: {
            images_count: images.length
        },
        images
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/nvidiaNim.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildNvidiaNimRequestBody",
    ()=>buildNvidiaNimRequestBody,
    "handleNvidiaNimImageGeneration",
    ()=>handleNvidiaNimImageGeneration,
    "normalizeNvidiaNimImages",
    ()=>normalizeNvidiaNimImages
]);
// NVIDIA NIM image generation (FLUX models) — ported from upstream 9router#1195.
// Unlike the NVIDIA *chat* entry (open-sse/config/providers/registry/nvidia/index.ts,
// host integrate.api.nvidia.com, OpenAI-compatible), NVIDIA NIM *image* generation lives
// on a different host (ai.api.nvidia.com) with a native per-model NIM body — so it gets
// its own provider handler rather than reusing the OpenAI-compatible image path.
//
// Invoke shape: POST https://ai.api.nvidia.com/v1/genai/<model>
//   Authorization: Bearer <NGC API key>
// where <model> is the registered model id itself (e.g. "black-forest-labs/flux.1-dev").
//
// Response shape varies across the NIM `genai` catalog (SDXL-style `artifacts[].base64`,
// list-of-strings `images[]`, OpenAI-style `data[].b64_json`, or single-value shorthands)
// — normalizeNvidiaNimImages() accepts every variant so a NIM response-shape change
// degrades to "no images" rather than throwing.
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
const FLUX_1_DEV = "black-forest-labs/flux.1-dev";
const FLUX_1_KONTEXT_DEV = "black-forest-labs/flux.1-kontext-dev";
function numberFromInput(value) {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
}
function parseSizeString(size) {
    if (typeof size !== "string" || !size || size === "auto") return null;
    const match = /^(\d+)x(\d+)$/.exec(size);
    if (!match) return null;
    return {
        width: Number(match[1]),
        height: Number(match[2])
    };
}
function parseDimensions(body) {
    const width = numberFromInput(body.width);
    const height = numberFromInput(body.height);
    if (width !== null && height !== null) return {
        width,
        height
    };
    return parseSizeString(body.size);
}
function copyIfPresent(target, source, key) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") {
        target[key] = source[key];
    }
}
function copyNumberIfPresent(target, source, key, options = {}) {
    if (source[key] === undefined || source[key] === null || source[key] === "") return;
    const value = Number(source[key]);
    if (!Number.isFinite(value)) return;
    if (options.greaterThan !== undefined && !(value > options.greaterThan)) return;
    target[key] = value;
}
function normalizeImageArray(image) {
    if (Array.isArray(image)) return image.filter(Boolean);
    return image ? [
        image
    ] : [];
}
// FLUX.1 Dev only accepts dimensions in the 768-1344px range, in 64px increments —
// out-of-range values are silently dropped rather than sent upstream (matches upstream
// 9router#1195 behavior, verified against build.nvidia.com model page constraints).
function isFlux1DevDimension(value) {
    return Number.isInteger(value) && value >= 768 && value <= 1344 && value % 64 === 0;
}
function buildNvidiaNimRequestBody(model, body) {
    const req = {
        prompt: body.prompt
    };
    const dimensions = parseDimensions(body);
    if (dimensions && model !== FLUX_1_KONTEXT_DEV) {
        if (model !== FLUX_1_DEV || isFlux1DevDimension(dimensions.width) && isFlux1DevDimension(dimensions.height)) {
            req.width = dimensions.width;
            req.height = dimensions.height;
        }
    }
    if (model === FLUX_1_DEV) {
        const mode = body.mode || "base";
        req.mode = mode;
        if (mode !== "base") {
            const images = normalizeImageArray(body.image);
            if (images.length > 0) req.image = images[0];
        }
    } else if (model === FLUX_1_KONTEXT_DEV) {
        const images = normalizeImageArray(body.image);
        if (images.length > 0) req.image = images[0];
        copyIfPresent(req, body, "aspect_ratio");
    } else if (body.image) {
        req.image = normalizeImageArray(body.image);
    }
    if (model === FLUX_1_DEV) {
        copyNumberIfPresent(req, body, "cfg_scale", {
            greaterThan: 1
        });
    } else {
        copyIfPresent(req, body, "cfg_scale");
    }
    copyIfPresent(req, body, "seed");
    copyIfPresent(req, body, "steps");
    return req;
}
function imageItemFromValue(value) {
    if (!value) return null;
    if (typeof value === "string") return {
        b64_json: value
    };
    if (typeof value !== "object") return null;
    const obj = value;
    if (typeof obj.url === "string") return {
        url: obj.url
    };
    const base64 = obj.base64 || obj.b64_json || obj.image || obj.data;
    if (typeof base64 !== "string") return null;
    const item = {
        b64_json: base64
    };
    const finishReason = obj.finishReason || obj.finish_reason;
    if (typeof finishReason === "string") item.finish_reason = finishReason;
    return item;
}
function normalizeNvidiaNimImages(responseBody) {
    const obj = responseBody && typeof responseBody === "object" ? responseBody : {};
    // Already OpenAI-shaped — pass through.
    if (typeof obj.created === "number" && Array.isArray(obj.data)) {
        return obj;
    }
    const candidates = [];
    if (Array.isArray(obj.artifacts)) candidates.push(...obj.artifacts);
    if (Array.isArray(obj.images)) candidates.push(...obj.images);
    if (Array.isArray(obj.data)) candidates.push(...obj.data);
    if (obj.artifact) candidates.push(obj.artifact);
    if (obj.image) candidates.push(obj.image);
    if (obj.base64) candidates.push(obj.base64);
    const result = obj.result;
    if (result?.image) candidates.push(result.image);
    if (result && Array.isArray(result.artifacts)) candidates.push(...result.artifacts);
    return {
        created: Math.floor(Date.now() / 1000),
        data: candidates.map(imageItemFromValue).filter((item)=>item !== null)
    };
}
async function handleNvidiaNimImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || credentials?.accessToken || "";
    if (model === FLUX_1_KONTEXT_DEV && !body.image) {
        return {
            success: false,
            status: 400,
            error: "NVIDIA FLUX.1 Kontext Dev requires an input image"
        };
    }
    const requestBody = buildNvidiaNimRequestBody(model, body);
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (nvidia-nim) | prompt: "${promptPreview}..."`);
    }
    const url = `${providerConfig.baseUrl.replace(/\/$/, "")}/${model}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
        const payload = await response.json();
        const normalized = normalizeNvidiaNimImages(payload);
        if (normalized.data.length === 0) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: 502,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: "No images returned from NVIDIA NIM"
            }).catch(()=>{});
            return {
                success: false,
                status: 502,
                error: "No images returned from NVIDIA NIM"
            };
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 200,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            responseBody: {
                images_count: normalized.data.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: normalized
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/segmind.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleSegmindImageGeneration",
    ()=>handleSegmindImageGeneration
]);
// Segmind image-generation provider (#6656).
//
// Thin body-builder + response-formatter around the shared Segmind REST
// client (open-sse/utils/segmindClient.ts) — see that module for the wire
// shape (x-api-key auth, raw image bytes response, no JSON envelope).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/segmindClient.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
function parseSegmindSize(size) {
    if (typeof size === "string" && size.includes("x")) {
        const [w, h] = size.split("x").map(Number);
        if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
            return {
                width: w,
                height: h
            };
        }
    }
    return {
        width: 1024,
        height: 1024
    };
}
function buildSegmindImageBody(body, prompt) {
    const { width, height } = parseSegmindSize(body.size);
    const upstreamBody = {
        prompt,
        width,
        height,
        samples: Number(body.n) > 0 ? Number(body.n) : 1
    };
    if (typeof body.negative_prompt === "string") upstreamBody.negative_prompt = body.negative_prompt;
    if (typeof body.seed === "number") upstreamBody.seed = body.seed;
    return upstreamBody;
}
function formatSegmindImage(buffer, contentType, prompt, wantsB64) {
    const base64 = buffer.toString("base64");
    if (wantsB64) return {
        b64_json: base64,
        revised_prompt: prompt
    };
    const mimeType = contentType.startsWith("image/") ? contentType : "image/jpeg";
    return {
        url: `data:${mimeType};base64,${base64}`,
        revised_prompt: prompt
    };
}
async function handleSegmindImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const token = credentials?.apiKey || credentials?.accessToken || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    const upstreamBody = buildSegmindImageBody(body, prompt);
    if (log) {
        log.info("IMAGE", `${provider}/${model} (segmind) | prompt: "${prompt.slice(0, 60)}..."`);
    }
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["segmindRequest"])({
        baseUrl: providerConfig.baseUrl,
        model,
        token,
        upstreamBody,
        callLogPath: "/v1/images/generations",
        provider,
        scope: "IMAGE",
        log
    });
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$segmindClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isSegmindFailure"])(result)) {
        return {
            success: false,
            status: result.status,
            error: result.error
        };
    }
    const image = formatSegmindImage(result.buffer, result.contentType, prompt, body.response_format === "b64_json");
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: [
                image
            ]
        }
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/designerWeb.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "buildDesignerWebFormBody",
    ()=>buildDesignerWebFormBody,
    "buildDesignerWebHeaders",
    ()=>buildDesignerWebHeaders,
    "handleDesignerWebImageGeneration",
    ()=>handleDesignerWebImageGeneration,
    "mapDesignerWebImageSize",
    ()=>mapDesignerWebImageSize,
    "parseDesignerWebResponse",
    ()=>parseDesignerWebResponse
]);
// Microsoft Designer (unofficial, reverse-engineered web API) image handler.
// Family: designer-web | Provider: microsoft-designer-web
// Reference: g4f/Provider/needs_auth/MicrosoftDesigner.py (fetched + verified
// during triage of #6672) — Bearer access_token auth against
// designerapp.officeapps.live.com/designerapp/DallE.ashx, submit-then-poll
// for image_urls_thumbnail[].ImageUrl.
//
// The upstream ClientId header is a fixed, publicly-shared value the
// designer.microsoft.com frontend sends on every session (not a secret) —
// routed through resolvePublicCred() per Hard Rule #11 / docs/security/PUBLIC_CREDS.md.
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/publicCreds.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration.ts [instrumentation] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const DESIGNER_WEB_POLL_TIMEOUT_MS_DEFAULT = 60000;
const DESIGNER_WEB_POLL_INTERVAL_MS_DEFAULT = 2000;
const DESIGNER_WEB_BATCH_SIZE = "4";
function mapDesignerWebImageSize(size) {
    if (typeof size !== "string" || !size.includes("x")) return "1_1";
    const [wRaw, hRaw] = size.split("x");
    const w = Number(wRaw);
    const h = Number(hRaw);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return "1_1";
    if (w > h * 1.2) return "16_9";
    if (h > w * 1.2) return "9_16";
    return "1_1";
}
function buildDesignerWebHeaders({ accessToken, sessionId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomUUID"])(), userId = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(16).toString("hex") }) {
    return {
        Authorization: `Bearer ${accessToken}`,
        ClientId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$publicCreds$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolvePublicCred"])("microsoft_designer_client_id"),
        SessionId: sessionId,
        UserId: userId,
        "Content-Type": "application/x-www-form-urlencoded"
    };
}
function buildDesignerWebFormBody(prompt, size) {
    const params = new URLSearchParams();
    params.set("dalle-caption", prompt);
    params.set("dalle-image-size", mapDesignerWebImageSize(size));
    params.set("dalle-batch-size", DESIGNER_WEB_BATCH_SIZE);
    params.set("dalle-seed", String(Math.floor(Math.random() * 1_000_000_000)));
    return params;
}
function parseDesignerWebResponse(json) {
    const body = json ?? {};
    const thumbs = Array.isArray(body.image_urls_thumbnail) ? body.image_urls_thumbnail : [];
    const imageUrls = thumbs.map((t)=>t && typeof t === "object" ? t.ImageUrl : null).filter((u)=>typeof u === "string" && u.length > 0);
    if (imageUrls.length > 0) {
        return {
            status: "ready",
            imageUrls,
            pollIntervalMs: null
        };
    }
    const pollingMeta = body.polling_response?.polling_meta_data;
    const pollIntervalMs = Number.isFinite(pollingMeta?.poll_interval) ? Number(pollingMeta?.poll_interval) : null;
    if (pollIntervalMs !== null) {
        return {
            status: "pending",
            imageUrls: [],
            pollIntervalMs
        };
    }
    return {
        status: "empty",
        imageUrls: [],
        pollIntervalMs: null
    };
}
function normalizePositiveNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
/** Validates the request and resolves auth + poll timing. Returns an error status/message on failure. */ function resolveDesignerWebRequest(body, credentials) {
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
        return {
            state: "invalid",
            status: 400,
            error: "Prompt is required for Microsoft Designer image generation"
        };
    }
    const accessToken = credentials?.apiKey || credentials?.accessToken;
    if (!accessToken) {
        return {
            state: "invalid",
            status: 401,
            error: "Microsoft Designer credentials missing access_token"
        };
    }
    const timeoutMs = normalizePositiveNumber(body.timeout_ms, normalizePositiveNumber(process.env.DESIGNER_WEB_POLL_TIMEOUT_MS, DESIGNER_WEB_POLL_TIMEOUT_MS_DEFAULT));
    const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, normalizePositiveNumber(process.env.DESIGNER_WEB_POLL_INTERVAL_MS, DESIGNER_WEB_POLL_INTERVAL_MS_DEFAULT));
    return {
        state: "resolved",
        config: {
            prompt,
            accessToken,
            headers: buildDesignerWebHeaders({
                accessToken
            }),
            formBody: buildDesignerWebFormBody(prompt, body.size),
            timeoutMs,
            pollIntervalMs
        }
    };
}
/** Runs one submit/poll fetch cycle and classifies the outcome. */ async function stepDesignerWebPoll(baseUrl, headers, formBody, pollIntervalMs, fetchImpl) {
    const resp = await fetchImpl(baseUrl, {
        method: "POST",
        headers,
        body: formBody
    });
    if (!resp.ok) {
        return {
            state: "failed",
            status: resp.status,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(await resp.text())
        };
    }
    const parsed = parseDesignerWebResponse(await resp.json());
    if (parsed.status === "ready") {
        return {
            state: "ready",
            imageUrls: parsed.imageUrls
        };
    }
    if (parsed.status === "empty") {
        return {
            state: "failed",
            status: 502,
            error: "Microsoft Designer response did not contain image data or polling metadata"
        };
    }
    return {
        state: "pending",
        waitMs: Math.min(parsed.pollIntervalMs ?? pollIntervalMs, pollIntervalMs)
    };
}
/** Drives the submit-then-poll loop to completion, timeout, or a terminal error. */ async function runDesignerWebPollLoop(baseUrl, config, fetchImpl, log) {
    const deadline = Date.now() + config.timeoutMs;
    let attempt = 0;
    while(Date.now() < deadline){
        attempt += 1;
        const step = await stepDesignerWebPoll(baseUrl, config.headers, config.formBody, config.pollIntervalMs, fetchImpl);
        if (step.state !== "pending") return step;
        log?.info?.("IMAGE", `designer-web pending, poll #${attempt} in ${step.waitMs}ms`);
        await new Promise((resolve)=>setTimeout(resolve, step.waitMs));
    }
    return {
        state: "failed",
        status: 504,
        error: "Microsoft Designer image generation timed out waiting for a result"
    };
}
async function handleDesignerWebImageGeneration({ model, provider, providerConfig, body, credentials, log, fetchImpl = fetch }) {
    const startTime = Date.now();
    const resolved = resolveDesignerWebRequest(body, credentials);
    if (resolved.state === "invalid") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
            provider,
            model,
            status: resolved.status,
            startTime,
            error: resolved.error
        });
    }
    try {
        const outcome = await runDesignerWebPollLoop(providerConfig.baseUrl, resolved.config, fetchImpl, log);
        if (outcome.state === "ready") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageSuccessResult"])({
                provider,
                model,
                startTime,
                images: outcome.imageUrls.map((url)=>({
                        url
                    }))
            });
        }
        if (log?.error) {
            log.error("IMAGE", `${provider} designer-web error ${outcome.status}: ${outcome.error}`);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
            provider,
            model,
            status: outcome.status,
            startTime,
            error: outcome.error
        });
    } catch (err) {
        const errorText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
        if (log?.error) {
            log.error("IMAGE", `${provider} designer-web exception: ${errorText}`);
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
            provider,
            model,
            status: 500,
            startTime,
            error: errorText
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/minimax.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleMinimaxImageGeneration",
    ()=>handleMinimaxImageGeneration
]);
// #2482: MiniMax Text-to-Image provider handler.
// MiniMax's image_generation endpoint is synchronous (unlike its video/music
// endpoints, which are task-based and polled) and returns image URLs directly
// in `data.image_urls`. This normalizes that response into the OpenAI-compatible
// images payload the rest of the handler expects.
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
const MINIMAX_ASPECT_RATIOS = new Set([
    "1:1",
    "16:9",
    "9:16",
    "4:3",
    "3:4",
    "3:2",
    "2:3"
]);
function mapMinimaxAspectRatio(size) {
    if (size && MINIMAX_ASPECT_RATIOS.has(size)) return size;
    return "1:1";
}
/** Fire-and-forget usage log for a MiniMax image-generation call. */ function logMinimaxCall(params) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/images/generations",
        ...params
    }).catch(()=>{});
}
/** Builds the upstream MiniMax request body from the OpenAI-shaped input body. */ function buildMinimaxUpstreamBody(model, prompt, body) {
    return {
        model: model || "image-01",
        prompt,
        aspect_ratio: mapMinimaxAspectRatio(body.size),
        n: body.n ?? 1,
        response_format: "url"
    };
}
/** Handles a non-2xx MiniMax response: logs, records the call, and shapes the error result. */ async function handleMinimaxUpstreamError(response, ctx) {
    const errorText = await response.text();
    ctx.log?.error?.("IMAGE", `${ctx.provider} error ${response.status}: ${errorText.slice(0, 200)}`);
    logMinimaxCall({
        status: response.status,
        model: `${ctx.provider}/${ctx.model}`,
        provider: ctx.provider,
        duration: Date.now() - ctx.startTime,
        error: errorText.slice(0, 500),
        requestBody: ctx.upstreamBody
    });
    return {
        success: false,
        status: response.status,
        error: errorText
    };
}
/** Extracts and validates the `image_urls` array from a MiniMax response payload. */ function extractMinimaxImageUrls(data) {
    const record = data;
    return Array.isArray(record?.data?.image_urls) ? record?.data?.image_urls : [];
}
/** MiniMax returned 2xx but no images — logs and shapes the empty-result error. */ function buildMinimaxNoImagesResult(data, ctx) {
    const record = data;
    const errorMsg = record?.base_resp?.status_msg || "No images returned from MiniMax";
    logMinimaxCall({
        status: 502,
        model: `${ctx.provider}/${ctx.model}`,
        provider: ctx.provider,
        duration: Date.now() - ctx.startTime,
        error: errorMsg
    });
    return {
        success: false,
        status: 502,
        error: errorMsg
    };
}
/** MiniMax returned images — logs and shapes the OpenAI-compatible success result. */ function buildMinimaxSuccessResult(imageUrls, prompt, ctx) {
    const images = imageUrls.map((url)=>({
            url,
            revised_prompt: prompt
        }));
    logMinimaxCall({
        status: 200,
        model: `${ctx.provider}/${ctx.model}`,
        provider: ctx.provider,
        duration: Date.now() - ctx.startTime,
        responseBody: {
            images_count: images.length
        }
    });
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: images
        }
    };
}
/** Network/parse failure reaching MiniMax — logs and shapes the sanitized error result. */ function buildMinimaxFetchErrorResult(err, ctx) {
    const errMsg = err instanceof Error ? err.message : String(err);
    ctx.log?.error?.("IMAGE", `${ctx.provider} fetch error: ${errMsg}`);
    logMinimaxCall({
        status: 502,
        model: `${ctx.provider}/${ctx.model}`,
        provider: ctx.provider,
        duration: Date.now() - ctx.startTime,
        error: errMsg
    });
    return {
        success: false,
        status: 502,
        error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(errMsg)}`
    };
}
async function handleMinimaxImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || credentials?.accessToken || "";
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    const upstreamBody = buildMinimaxUpstreamBody(model, prompt, body);
    log?.info?.("IMAGE", `${provider}/${model} (minimax-image) | prompt: "${prompt.slice(0, 60)}..." | aspect_ratio: ${upstreamBody.aspect_ratio}`);
    try {
        const response = await fetch(providerConfig.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            return handleMinimaxUpstreamError(response, {
                provider,
                model,
                startTime,
                upstreamBody,
                log
            });
        }
        const data = await response.json();
        const imageUrls = extractMinimaxImageUrls(data);
        const ctx = {
            provider,
            model,
            startTime
        };
        if (imageUrls.length === 0) {
            return buildMinimaxNoImagesResult(data, ctx);
        }
        return buildMinimaxSuccessResult(imageUrls, prompt, ctx);
    } catch (err) {
        return buildMinimaxFetchErrorResult(err, {
            provider,
            model,
            startTime,
            log
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageUpscale/shared.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "MAX_UPSCALE_SOURCE_BYTES",
    ()=>MAX_UPSCALE_SOURCE_BYTES,
    "UPSCALE_CALL_LOG_PATH",
    ()=>UPSCALE_CALL_LOG_PATH,
    "buildUpscaleImageEntry",
    ()=>buildUpscaleImageEntry,
    "extractUpscaleSourceImage",
    ()=>extractUpscaleSourceImage,
    "readImageDimensions",
    ()=>readImageDimensions,
    "resolveUpscaleImageSource",
    ()=>resolveUpscaleImageSource,
    "saveUpscaleErrorResult",
    ()=>saveUpscaleErrorResult,
    "saveUpscaleSuccessResult",
    ()=>saveUpscaleSuccessResult,
    "scaleDimensions",
    ()=>scaleDimensions,
    "sniffImageMime",
    ()=>sniffImageMime,
    "toBlobBytes",
    ()=>toBlobBytes
]);
/**
 * Shared plumbing for the `/v1/images/upscale` provider handlers.
 *
 * Kept separate from `handlers/imageGeneration.ts` on purpose: upscaling needs raw
 * source bytes + pixel dimensions (to turn a 2x/4x factor into an output size for
 * providers that only accept absolute targets), neither of which the generation
 * handler exposes.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/remoteImageFetch.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const UPSCALE_CALL_LOG_PATH = "/v1/images/upscale";
const MAX_UPSCALE_SOURCE_BYTES = 20 * 1024 * 1024;
function toBlobBytes(buffer) {
    const out = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(out).set(buffer);
    return out;
}
function extractUpscaleSourceImage(body) {
    if (!body || typeof body !== "object") return null;
    const b = body;
    const providerOptions = b.provider_options && typeof b.provider_options === "object" && !Array.isArray(b.provider_options) ? b.provider_options : {};
    const keys = [
        "image_url",
        "imageUrl",
        "input_image",
        "source_image",
        "promptImage",
        "prompt_image",
        "image",
        "images",
        "image_urls",
        "imageUrls",
        "input_images",
        "reference_images",
        "referenceImages",
        "reference_image"
    ];
    for (const key of keys){
        const found = firstImageCandidate(b[key]) || firstImageCandidate(providerOptions[key]);
        if (found) return found;
    }
    if (Array.isArray(b.messages)) {
        for (const msg of b.messages){
            if (!msg || typeof msg !== "object") continue;
            const content = msg.content;
            if (!Array.isArray(content)) continue;
            for (const part of content){
                if (!part || typeof part !== "object") continue;
                const p = part;
                if (p.type === "image_url" || p.type === "image") {
                    const found = firstImageCandidate(p.image_url ?? p.image ?? p.url);
                    if (found) return found;
                }
            }
        }
    }
    return null;
}
function firstImageCandidate(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
        return trimmed;
    }
    if (Array.isArray(value)) {
        for (const item of value){
            const found = firstImageCandidate(item);
            if (found) return found;
        }
        return null;
    }
    if (value && typeof value === "object") {
        const o = value;
        if (typeof o.url === "string") return firstImageCandidate(o.url);
        if (typeof o.image_url === "string") return firstImageCandidate(o.image_url);
        if (o.image_url && typeof o.image_url === "object") {
            return firstImageCandidate(o.image_url.url);
        }
        if (typeof o.b64_json === "string") return `data:image/png;base64,${o.b64_json}`;
        if (typeof o.base64 === "string") return `data:image/png;base64,${o.base64}`;
    }
    return null;
}
async function resolveUpscaleImageSource(source) {
    const trimmed = String(source || "").trim();
    if (!trimmed) throw new Error("Invalid image source");
    const dataUri = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,([\s\S]+)$/i.exec(trimmed);
    if (dataUri) {
        const contentType = (dataUri[1] || "image/png").trim().toLowerCase();
        const base64 = (dataUri[2] || "").replace(/\s/g, "");
        const buffer = Buffer.from(base64, "base64");
        assertSourceBytes(buffer);
        return {
            buffer,
            base64,
            contentType: contentType.startsWith("image/") ? contentType : "image/png"
        };
    }
    if (/^https?:\/\//i.test(trimmed)) {
        const remote = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchRemoteImage"])(trimmed);
        assertSourceBytes(remote.buffer);
        // fetchRemoteImage falls back to application/octet-stream; sniff whenever the
        // server did not send a usable image/* type so multipart uploads stay correct.
        const declared = (remote.contentType || "").split(";")[0].trim().toLowerCase();
        return {
            buffer: remote.buffer,
            base64: remote.buffer.toString("base64"),
            contentType: declared.startsWith("image/") ? declared : sniffImageMime(remote.buffer)
        };
    }
    const buffer = Buffer.from(trimmed.replace(/\s/g, ""), "base64");
    assertSourceBytes(buffer);
    return {
        buffer,
        base64: buffer.toString("base64"),
        contentType: sniffImageMime(buffer)
    };
}
function assertSourceBytes(buffer) {
    if (!buffer.length) throw new Error("Source image decoded to empty bytes");
    if (buffer.length > MAX_UPSCALE_SOURCE_BYTES) {
        throw new Error(`Source image too large (${buffer.length} bytes; max ${MAX_UPSCALE_SOURCE_BYTES})`);
    }
}
function sniffImageMime(buffer) {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
    }
    if (buffer.length >= 8 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
        return "image/png";
    }
    if (buffer.length >= 6 && buffer.toString("ascii", 0, 3) === "GIF") return "image/gif";
    if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
        return "image/webp";
    }
    if (buffer.length >= 2 && buffer.toString("ascii", 0, 2) === "BM") return "image/bmp";
    return "image/png";
}
function readImageDimensions(buffer) {
    try {
        if (buffer.length >= 24 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
            // IHDR is always the first chunk: 8-byte signature + 4 length + 4 "IHDR".
            return {
                width: buffer.readUInt32BE(16),
                height: buffer.readUInt32BE(20)
            };
        }
        if (buffer.length >= 6 && buffer.toString("ascii", 0, 3) === "GIF") {
            return {
                width: buffer.readUInt16LE(6),
                height: buffer.readUInt16LE(8)
            };
        }
        if (buffer.length >= 26 && buffer.toString("ascii", 0, 2) === "BM") {
            return {
                width: buffer.readInt32LE(18),
                height: Math.abs(buffer.readInt32LE(22))
            };
        }
        if (buffer.length >= 30 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
            return readWebpDimensions(buffer);
        }
        if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
            return readJpegDimensions(buffer);
        }
    } catch  {
        return null;
    }
    return null;
}
function readWebpDimensions(buffer) {
    const chunk = buffer.toString("ascii", 12, 16);
    if (chunk === "VP8 " && buffer.length >= 30) {
        // Lossy: 3-byte frame tag + 3-byte sync code, then 14-bit width/height.
        return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff
        };
    }
    if (chunk === "VP8L" && buffer.length >= 25) {
        const bits = buffer.readUInt32LE(21);
        return {
            width: (bits & 0x3fff) + 1,
            height: (bits >> 14 & 0x3fff) + 1
        };
    }
    if (chunk === "VP8X" && buffer.length >= 30) {
        const width = 1 + (buffer[24] | buffer[25] << 8 | buffer[26] << 16);
        const height = 1 + (buffer[27] | buffer[28] << 8 | buffer[29] << 16);
        return {
            width,
            height
        };
    }
    return null;
}
function readJpegDimensions(buffer) {
    let offset = 2;
    while(offset + 9 < buffer.length){
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }
        const marker = buffer[offset + 1];
        // Standalone markers (no length payload).
        if (marker === 0xd8 || marker === 0x01 || marker >= 0xd0 && marker <= 0xd7) {
            offset += 2;
            continue;
        }
        const length = buffer.readUInt16BE(offset + 2);
        // SOF0..SOF15 except DHT(c4)/JPGA(c8)/DAC(cc) carry the frame dimensions.
        const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isSof) {
            return {
                height: buffer.readUInt16BE(offset + 5),
                width: buffer.readUInt16BE(offset + 7)
            };
        }
        if (length <= 0) return null;
        offset += 2 + length;
    }
    return null;
}
function scaleDimensions(buffer, factor, maxEdge = 32000) {
    const source = readImageDimensions(buffer);
    if (!source || source.width <= 0 || source.height <= 0) return null;
    const safeFactor = Number.isFinite(factor) && factor > 0 ? factor : 2;
    const scale = Math.min(safeFactor, maxEdge / Math.max(source.width, source.height));
    return {
        width: Math.max(1, Math.round(source.width * Math.max(1, scale))),
        height: Math.max(1, Math.round(source.height * Math.max(1, scale)))
    };
}
function saveUpscaleSuccessResult(opts) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: UPSCALE_CALL_LOG_PATH,
        status: 200,
        model: `${opts.provider}/${opts.model}`,
        provider: opts.provider,
        duration: Date.now() - opts.startTime,
        requestBody: opts.requestBody ?? null,
        responseBody: opts.responseBody ?? {
            images_count: opts.images.length
        }
    }).catch(()=>{});
    return {
        success: true,
        data: {
            created: Math.floor(Date.now() / 1000),
            data: opts.images,
            ...opts.meta ? {
                upscale: opts.meta
            } : {}
        }
    };
}
function saveUpscaleErrorResult(opts) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: UPSCALE_CALL_LOG_PATH,
        status: opts.status,
        model: `${opts.provider}/${opts.model}`,
        provider: opts.provider,
        duration: Date.now() - opts.startTime,
        error: typeof opts.error === "string" ? opts.error.slice(0, 500) : String(opts.error).slice(0, 500),
        requestBody: opts.requestBody ?? null
    }).catch(()=>{});
    return {
        success: false,
        status: opts.status,
        error: opts.error
    };
}
function buildUpscaleImageEntry(opts) {
    const wantsBase64 = String(opts.responseFormat ?? "").toLowerCase() === "b64_json";
    if (opts.buffer && opts.buffer.length > 0) {
        const base64 = opts.buffer.toString("base64");
        const mime = opts.contentType || sniffImageMime(opts.buffer);
        return wantsBase64 ? {
            b64_json: base64
        } : {
            url: `data:${mime};base64,${base64}`
        };
    }
    return {
        url: String(opts.url || "")
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageUpscale/adobeFirefly.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAdobeFireflyImageUpscale",
    ()=>handleAdobeFireflyImageUpscale
]);
/**
 * Adobe Firefly upscale handler — Topaz Labs models on firefly-3p `/v2/3p-images/upsample`.
 *
 * Flow (mirrors the SPA and the Firefly generate path):
 *   1. Resolve the durable session (JWT + Cookie → ARP rebuild, sticky ARP, submit gate).
 *   2. Upload the source image to `/v2/storage/image` → blob id, reusing that ARP.
 *   3. POST the upsample job, poll the BKS result link, return the presigned URL.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyUpscale$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyUpscale.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageUpscale/shared.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function handleAdobeFireflyImageUpscale({ model, provider, body, credentials, log, fetchImpl = fetch }) {
    const startTime = Date.now();
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyUpscale$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeUpscaleModel"])(model);
    if (!resolved) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
            provider,
            model,
            status: 400,
            startTime,
            error: `Unsupported Adobe Firefly upscale model: ${model}. Use topaz-standard or topaz-bloom.`
        });
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractUpscaleSourceImage"])(body)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
            provider,
            model,
            status: 400,
            startTime,
            error: "Adobe Firefly upscale requires a source image"
        });
    }
    try {
        const accessToken = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeAccessToken"])(credentials, fetchImpl);
        // Keep the raw credential blob for Cookie + sherlockToken (x-arp-session-id).
        const psd = credentials?.providerSpecificData;
        const sessionCookie = typeof psd?.cookie === "string" && psd.cookie.trim() || typeof credentials?.apiKey === "string" && credentials.apiKey.trim() || (typeof credentials?.accessToken === "string" && credentials.accessToken.includes(";") ? credentials.accessToken : undefined);
        // Upscale consumes exactly one source; upload it under the same ARP as submit.
        const blobIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeSourceImageIds"])({
            accessToken,
            body,
            max: 1,
            sessionCookie,
            prompt: "upsample",
            fetchImpl,
            log
        });
        if (blobIds.length === 0) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
                provider,
                model,
                status: 400,
                startTime,
                error: "Adobe Firefly upscale could not resolve the source image"
            });
        }
        const timeoutMs = normalizePositiveNumber(body.timeout_ms, 0);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyUpscale$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adobeFireflyUpscaleImage"])({
            accessToken,
            model,
            blobId: blobIds[0],
            upsamplerFactor: readFactor(body),
            creativityPercent: readCreativityPercent(body),
            creativityLevel: body.creativity_level ?? body.creativityLevel,
            sessionCookie,
            ...timeoutMs > 0 ? {
                timeoutMs
            } : {},
            fetchImpl,
            log
        });
        log?.info?.("IMAGE", `${provider}/${model} (adobe-firefly upsample) | ${result.factor}x` + (resolved.spec.supportsCreativity ? ` | creativityLevel=${result.creativityLevel}` : ""));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleSuccessResult"])({
            provider,
            model,
            startTime,
            images: [
                {
                    url: result.url
                }
            ],
            meta: {
                provider,
                model,
                factor: result.factor,
                ...resolved.spec.supportsCreativity ? {
                    creativity_level: result.creativityLevel
                } : {}
            }
        });
    } catch (err) {
        if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AdobeFireflyError"]) {
            log?.error?.("IMAGE", `${provider} adobe-firefly upscale error ${err.status}: ${err.message}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
                provider,
                model,
                status: err.status,
                startTime,
                error: err.message
            });
        }
        const errorText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
        log?.error?.("IMAGE", `${provider} adobe-firefly upscale exception: ${errorText}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$shared$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveUpscaleErrorResult"])({
            provider,
            model,
            status: 500,
            startTime,
            error: errorText
        });
    }
}
function readFactor(body) {
    return body.factor ?? body.scale ?? body.upscale_factor ?? body.upscaleFactor ?? body.upsampler_factor ?? body.upsamplerFactor;
}
function readCreativityPercent(body) {
    const raw = body.creativity ?? body.creativity_percent ?? body.creativityPercent;
    if (raw === undefined || raw === null) return undefined;
    const n = typeof raw === "number" ? raw : Number(String(raw).replace("%", "").trim());
    if (!Number.isFinite(n)) return undefined;
    if (n > 0 && n < 1) return Math.max(0, Math.min(100, n * 100));
    return Math.max(0, Math.min(100, n));
}
function normalizePositiveNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/adobeFirefly.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "handleAdobeFireflyImageGeneration",
    ()=>handleAdobeFireflyImageGeneration
]);
// Adobe Firefly (unofficial) image-generation handler.
// Family: adobe-firefly-image | Provider: adobe-firefly
//
// Credentials: IMS access_token (JWT, client_id clio-playground-web) or full
// Cookie header from firefly.adobe.com. Cookie → IMS check/v6/token with
// client_id clio-playground-web (Express projectx_webapp fallback).
//
// Reference images (Media page / OpenAI edit aliases):
//   1) POST raw bytes → firefly-3p /v2/storage/image → { images:[{ id }] }
//   2) generate-async with referenceBlobs:[{ id, usage:"general"|"subject" }]
// See web_providers/adobe_atach_images.txt for live captures.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyUpscale$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/adobeFireflyUpscale.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageUpscale/adobeFirefly.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function handleAdobeFireflyImageGeneration({ model, provider, body, credentials, log, fetchImpl = fetch }) {
    const startTime = Date.now();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    // Topaz upscalers share adobe-firefly but use /v2/3p-images/upsample (no prompt).
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyUpscale$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isAdobeFireflyUpscaleModel"])(model)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageUpscale$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleAdobeFireflyImageUpscale"])({
            model,
            provider,
            body: body,
            credentials,
            log,
            fetchImpl
        });
    }
    if (!prompt) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
            provider,
            model,
            status: 400,
            startTime,
            error: "Prompt is required for Adobe Firefly image generation"
        });
    }
    try {
        const accessToken = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeAccessToken"])(credentials, fetchImpl);
        const seed = typeof body.seed === "number" ? body.seed : typeof body.seed === "string" && body.seed.trim() ? Number(body.seed) : undefined;
        // Keep the raw credential blob for Cookie + sherlockToken (x-arp-session-id).
        // JWT may be embedded in the same paste as cookies (HAR / multi-line).
        const psd = credentials?.providerSpecificData;
        const sessionCookie = typeof psd?.cookie === "string" && psd.cookie.trim() || typeof credentials?.apiKey === "string" && credentials.apiKey.trim() || (typeof credentials?.accessToken === "string" && credentials.accessToken.includes(";") ? credentials.accessToken : undefined);
        // Cap uploads by model family. gpt-image: 2 subject refs max (3–4+ stalls colligo → 504).
        // nano: 4 general refs for multi-panel composition.
        const { id: resolvedId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeImageModel"])(model);
        const maxRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adobeFireflyMaxImageRefs"])(resolvedId);
        const sourceImageIds = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAdobeSourceImageIds"])({
            accessToken,
            body,
            max: maxRefs,
            sessionCookie,
            prompt,
            fetchImpl,
            log
        });
        const explicitTimeout = typeof body.timeout_ms === "number" ? body.timeout_ms : typeof body.timeout_ms === "string" && body.timeout_ms.trim() ? Number(body.timeout_ms) : undefined;
        const timeoutMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adobeFireflyImageTimeoutMs"])({
            timeoutMs: explicitTimeout,
            refCount: sourceImageIds.length
        });
        log?.info?.("IMAGE", `${provider}/${model} (adobe-firefly) | prompt: "${prompt.slice(0, 60)}${prompt.length > 60 ? "..." : ""}"` + (sourceImageIds.length ? ` | refs: ${sourceImageIds.length}/${maxRefs}` : "") + ` | pollTimeoutMs=${timeoutMs}`);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["adobeFireflyGenerateImage"])({
            accessToken,
            prompt,
            model,
            size: body.size,
            aspectRatio: body.aspect_ratio ?? body.aspectRatio ?? body.size,
            quality: body.quality,
            seed: Number.isFinite(seed) ? seed : undefined,
            negativePrompt: typeof body.negative_prompt === "string" ? body.negative_prompt : undefined,
            sourceImageIds: sourceImageIds.length ? sourceImageIds : undefined,
            sessionCookie,
            timeoutMs,
            fetchImpl,
            log
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageSuccessResult"])({
            provider,
            model,
            startTime,
            images: [
                {
                    url: result.url
                }
            ]
        });
    } catch (err) {
        if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$adobeFireflyClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["AdobeFireflyError"]) {
            log?.error?.("IMAGE", `${provider} adobe-firefly error ${err.status}: ${err.message}`);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
                provider,
                model,
                status: err.status,
                startTime,
                error: err.message
            });
        }
        const errorText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err instanceof Error ? err.message : String(err));
        log?.error?.("IMAGE", `${provider} adobe-firefly exception: ${errorText}`);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["saveImageErrorResult"])({
            provider,
            model,
            status: 500,
            startTime,
            error: errorText
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/open-sse/handlers/imageGeneration/providers/alibabaImage.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleAlibabaImageGeneration",
    ()=>handleAlibabaImageGeneration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/constants/alibabaProviderRegions.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
;
;
;
function collectImageUrls(body) {
    const values = [
        body.image,
        body.image_url,
        body.imageUrls,
        body.image_urls
    ].flatMap((value)=>Array.isArray(value) ? value : [
            value
        ]);
    const urls = new Set();
    for (const value of values){
        if (typeof value === "string" && value.trim()) {
            urls.add(value.trim());
            continue;
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(value)) continue;
        const url = typeof value.url === "string" ? value.url : typeof value.image_url === "string" ? value.image_url : null;
        if (url?.trim()) urls.add(url.trim());
    }
    return [
        ...urls
    ];
}
function normalizeImageSize(value) {
    if (typeof value !== "string" || !value.trim()) return undefined;
    const size = value.trim();
    return /^\d+x\d+$/i.test(size) ? size.replace(/x/i, "*") : size;
}
function getAlibabaImageUrls(payload) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(payload) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(payload.output)) return [];
    const choices = Array.isArray(payload.output.choices) ? payload.output.choices : [];
    const urls = new Set();
    for (const choice of choices){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(choice) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(choice.message)) continue;
        const content = Array.isArray(choice.message.content) ? choice.message.content : [];
        for (const item of content){
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(item) || typeof item.image !== "string" || !item.image.trim()) continue;
            urls.add(item.image.trim());
        }
    }
    return [
        ...urls
    ];
}
function getAlibabaImageError(payload, fallback) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(payload)) return fallback;
    const message = typeof payload.message === "string" ? payload.message : typeof payload.code === "string" ? payload.code : fallback;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message) || fallback;
}
async function handleAlibabaImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const isRegisteredModel = providerConfig.models?.some((entry)=>entry.id === model) === true;
    if (!isRegisteredModel) {
        return {
            success: false,
            status: 400,
            error: `Unsupported ${provider} image model: ${model}`
        };
    }
    const token = credentials?.apiKey || credentials?.accessToken;
    if (!token) {
        return {
            success: false,
            status: 401,
            error: `${provider} API key is required`
        };
    }
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const content = [
        ...collectImageUrls(body).map((image)=>({
                image
            })),
        ...prompt ? [
            {
                text: prompt
            }
        ] : []
    ];
    const parameters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(body.parameters) ? {
        ...body.parameters
    } : {};
    const size = normalizeImageSize(body.size);
    if (size) parameters.size = size;
    if (Number.isInteger(body.n) && Number(body.n) > 0) parameters.n = Number(body.n);
    for (const key of [
        "negative_prompt",
        "prompt_extend",
        "watermark",
        "seed",
        "enable_sequential",
        "thinking_mode",
        "color_palette"
    ]){
        if (body[key] !== undefined) parameters[key] = body[key];
    }
    const mediaBaseUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$constants$2f$alibabaProviderRegions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["resolveAlibabaProviderMediaBaseUrl"])(provider, credentials.providerSpecificData, providerConfig.baseUrl);
    const url = mediaBaseUrl.endsWith("/services/aigc/multimodal-generation/generation") ? mediaBaseUrl : `${mediaBaseUrl}/services/aigc/multimodal-generation/generation`;
    log?.info?.("IMAGE", `${provider}/${model} (alibaba-image)`);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                input: {
                    messages: [
                        {
                            role: "user",
                            content
                        }
                    ]
                },
                ...Object.keys(parameters).length > 0 ? {
                    parameters
                } : {}
            })
        });
        const payload = await response.json().catch(()=>({}));
        if (!response.ok) {
            return {
                success: false,
                status: response.status || 502,
                error: getAlibabaImageError(payload, "Alibaba image generation failed")
            };
        }
        const urls = getAlibabaImageUrls(payload);
        if (urls.length === 0) {
            return {
                success: false,
                status: 502,
                error: "Alibaba image generation returned no images"
            };
        }
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: urls.map((url)=>({
                        url
                    }))
            }
        };
    } catch (error) {
        log?.error?.("IMAGE", `Alibaba image generation failed: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error)}`);
        return {
            success: false,
            status: 502,
            error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(error) || "Alibaba image generation failed"
        };
    }
}
}),
"[project]/open-sse/handlers/imageGeneration/pollinationsAnonAuth.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applyPollinationsAnonymousFallback",
    ()=>applyPollinationsAnonymousFallback,
    "reportPollinationsAnonOutcome",
    ()=>reportPollinationsAnonOutcome
]);
// #8085 — anonymous fingerprint fallback for keyless Pollinations image requests.
//
// Chat requests to Pollinations already fall back to a fingerprint-pool
// session when no apiKey/accessToken is configured (see
// PollinationsExecutor.execute()'s `isAnonymous` branch in
// open-sse/executors/pollinations.ts). The image path
// (open-sse/handlers/imageGeneration.ts::handleOpenAIImageGeneration) had no
// equivalent: a keyless Pollinations image request went out with no
// Authorization header AND no fingerprint headers, so Pollinations' own
// upstream legitimately rejected it with a 401 — even with a perfectly
// valid OmniRoute API key. This module mirrors that same anonymous
// session-pool fallback for the image path.
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionPool$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/sessionPool.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/sessionPool/types.ts [instrumentation] (ecmascript)");
;
;
let pollinationsImagePool = null;
function getPollinationsImagePool() {
    if (!pollinationsImagePool) {
        pollinationsImagePool = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$sessionPool$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["SessionPool"]("pollinations", __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_POOL_CONFIG"]);
        pollinationsImagePool.warmUp(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$sessionPool$2f$types$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_POOL_CONFIG"].minSessions).catch(()=>{});
    }
    return pollinationsImagePool;
}
async function applyPollinationsAnonymousFallback(providerId, token, headers) {
    if (providerId !== "pollinations" || token) {
        return {
            headers,
            session: null
        };
    }
    const pool = getPollinationsImagePool();
    let session = null;
    try {
        session = await pool.acquireBlocking(10_000);
    } catch  {
        // Pool exhausted — fall through without fingerprint headers rather than
        // block the request indefinitely.
        session = null;
    }
    if (!session) {
        return {
            headers,
            session: null
        };
    }
    return {
        headers: {
            ...headers,
            ...session.buildHeaders()
        },
        session
    };
}
function reportPollinationsAnonOutcome(session, status) {
    if (!session || !pollinationsImagePool) return;
    if (status === 429) {
        pollinationsImagePool.reportCooldown(session);
    } else if (typeof status === "number" && status >= 500) {
        pollinationsImagePool.reportDead(session);
    } else {
        pollinationsImagePool.reportSuccess(session);
    }
    session.release();
}
}),
"[project]/open-sse/handlers/imageGeneration.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "extractImageGenerationCalls",
    ()=>extractImageGenerationCalls,
    "handleCodexImageEdit",
    ()=>handleCodexImageEdit,
    "handleImageEdit",
    ()=>handleImageEdit,
    "handleImageGeneration",
    ()=>handleImageGeneration,
    "handleOpenAIImageEdit",
    ()=>handleOpenAIImageEdit,
    "resolveImageBaseUrl",
    ()=>resolveImageBaseUrl,
    "saveImageErrorResult",
    ()=>saveImageErrorResult,
    "saveImageSuccessResult",
    ()=>saveImageSuccessResult
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
/**
 * Image Generation Handler
 *
 * Handles POST /v1/images/generations requests.
 * Proxies to upstream image generation providers using OpenAI-compatible format.
 *
 * Request format (OpenAI-compatible):
 * {
 *   "model": "openai/gpt-image-2",
 *   "prompt": "a beautiful sunset over mountains",
 *   "n": 1,
 *   "size": "1024x1024",
 *   "quality": "standard",       // optional: "standard" | "hd"
 *   "response_format": "url"     // optional: "url" | "b64_json"
 * }
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/config/imageRegistry.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityClientProfile.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/antigravityIdentity.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/kie.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/translator/image/sizeMapper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/open-sse/config/codexClient.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/executors/chatgpt-web.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$chatgptImageCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/services/chatgptImageCache.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/usageDb.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/usage/callLogs.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/sleep.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/kieTask.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$comfyuiClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/comfyuiClient.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/network/remoteImageFetch.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/shared/utils/fetchTimeout.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/utils/error.ts [instrumentation] (ecmascript)");
// --- Per-provider handlers (extracted to co-located files in PR-#4582-batch) ---
// Imported locally so internal callers (handleImageGeneration / handleImageEdit)
// resolve to a real binding. extractMarkdownImageUrls + CHATGPT_WEB_IMAGE_ID_RE
// are still used by handleImageEdit below, so they are imported (not re-defined).
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$sdWebUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/sdWebUI.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$hyperbolic$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/hyperbolic.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$huggingface$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/huggingface.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$comfyUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/comfyUI.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$imagen3$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/imagen3.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$googleImagen$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/googleImagen.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$ideogram$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/ideogram.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$haiper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/haiper.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$leonardo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/leonardo.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$freepik$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/freepik.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/chatgptWeb.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$nvidiaNim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/nvidiaNim.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/segmind.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$designerWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/designerWeb.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$minimax$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/minimax.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/adobeFirefly.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$alibabaImage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/providers/alibabaImage.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$pollinationsAnonAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/open-sse/handlers/imageGeneration/pollinationsAnonAuth.ts [instrumentation] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$sdWebUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$hyperbolic$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$huggingface$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$comfyUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$imagen3$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$googleImagen$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$ideogram$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$haiper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$leonardo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$freepik$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$nvidiaNim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$designerWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$minimax$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usageDb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$sdWebUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$hyperbolic$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$huggingface$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$comfyUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$imagen3$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$googleImagen$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$ideogram$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$haiper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$leonardo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$freepik$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$nvidiaNim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$designerWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$minimax$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
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
const OPENAI_IMAGE_TO_IMAGE_MODELS = new Set([
    "black-forest-labs/FLUX.2-max",
    "black-forest-labs/FLUX.2-pro",
    "black-forest-labs/FLUX.2-flex",
    "black-forest-labs/FLUX.2-dev",
    "openai/gpt-image-1.5",
    "Wan-AI/Wan2.6-image",
    "Qwen/Qwen-Image-2.0-Pro",
    "Qwen/Qwen-Image-2.0",
    "google/flash-image-3.1",
    "google/gemini-3-pro-image",
    "flux-kontext-max",
    "flux-kontext",
    "flux-kontext-pro",
    "qwen-image"
]);
const IMAGE_ASPECT_RATIO_PATTERN = /^\d+:\d+$/;
function resolveImageBaseUrl(credentials, fallback, endpoint = "generations") {
    const psd = credentials?.providerSpecificData;
    const psdBaseUrl = psd && typeof psd === "object" && typeof psd.baseUrl === "string" && psd.baseUrl.trim() ? psd.baseUrl.trim() : null;
    const topLevelBaseUrl = typeof credentials?.baseUrl === "string" && credentials.baseUrl.trim() ? credentials.baseUrl.trim() : null;
    const nodeBaseUrl = psdBaseUrl || topLevelBaseUrl;
    if (!nodeBaseUrl) return fallback;
    // A single configured node serves both image routes: honor a base URL that already
    // points at the requested OpenAI image path, and rewrite one that points at the other
    // image endpoint (e.g. `.../images/generations` requested for edits) (#3214/#3215).
    const suffix = `/images/${endpoint}`;
    // Trim trailing slashes without a backtracking-prone regex (`/\/+$/` is a
    // polynomial-ReDoS pattern on long runs of "/" — CodeQL js/polynomial-redos).
    let normalized = nodeBaseUrl;
    while(normalized.endsWith("/"))normalized = normalized.slice(0, -1);
    if (normalized.endsWith(suffix)) return normalized;
    const stripped = normalized.replace(/\/images\/(?:generations|edits)$/, "");
    return `${stripped}${suffix}`;
}
function normalizeImageAspectRatio(value, fallbackSize) {
    if (typeof value === "string") {
        const trimmedValue = value.trim();
        if (IMAGE_ASPECT_RATIO_PATTERN.test(trimmedValue)) return trimmedValue;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(typeof fallbackSize === "string" ? fallbackSize : null);
}
function parseJsonOrNull(value) {
    try {
        return JSON.parse(value);
    } catch  {
        return null;
    }
}
function sanitizeImageProviderError(errorText) {
    const parsed = parseJsonOrNull(errorText);
    if (parsed !== null) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeUpstreamDetails"])(parsed) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(errorText);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(errorText);
}
const BFL_MODEL_ENDPOINTS = {
    "flux-2-max": "/v1/flux-2-max",
    "flux-2-pro": "/v1/flux-2-pro",
    "flux-2-flex": "/v1/flux-2-flex",
    "flux-2-klein-9b": "/v1/flux-2-klein-9b",
    "flux-2-klein-4b": "/v1/flux-2-klein-4b",
    "flux-kontext-pro": "/v1/flux-kontext-pro",
    "flux-kontext-max": "/v1/flux-kontext-max",
    "flux-pro-1.1": "/v1/flux-pro-1.1",
    "flux-pro-1.1-ultra": "/v1/flux-pro-1.1-ultra",
    "flux-dev": "/v1/flux-dev",
    "flux-pro": "/v1/flux-pro"
};
const BFL_EDIT_MODELS = new Set([
    "flux-2-max",
    "flux-2-pro",
    "flux-2-flex",
    "flux-kontext-pro",
    "flux-kontext-max"
]);
const BFL_FAILURE_STATUSES = new Set([
    "Error",
    "Failed",
    "Content Moderated",
    "Request Moderated"
]);
function formatImageProviderError(err) {
    const sanitized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err);
    const message = (sanitized || "").replace(/^Error:\s*/i, "").trim();
    return message ? `Image provider error: ${message}` : "Image provider error";
}
const STABILITY_GENERATION_ENDPOINTS = {
    "sd3.5-large": "/v2beta/stable-image/generate/sd3",
    "sd3.5-large-turbo": "/v2beta/stable-image/generate/sd3",
    "sd3.5-medium": "/v2beta/stable-image/generate/sd3",
    "sd3.5-flash": "/v2beta/stable-image/generate/sd3",
    "stable-image-ultra": "/v2beta/stable-image/generate/ultra",
    "stable-image-core": "/v2beta/stable-image/generate/core"
};
const STABILITY_EDIT_ENDPOINTS = {
    inpaint: "/v2beta/stable-image/edit/inpaint",
    outpaint: "/v2beta/stable-image/edit/outpaint",
    erase: "/v2beta/stable-image/edit/erase",
    "search-and-replace": "/v2beta/stable-image/edit/search-and-replace",
    "search-and-recolor": "/v2beta/stable-image/edit/search-and-recolor",
    "remove-background": "/v2beta/stable-image/edit/remove-background",
    "replace-background-and-relight": "/v2beta/stable-image/edit/replace-background-and-relight",
    fast: "/v2beta/stable-image/upscale/fast",
    conservative: "/v2beta/stable-image/upscale/conservative",
    creative: "/v2beta/stable-image/upscale/creative",
    sketch: "/v2beta/stable-image/control/sketch",
    structure: "/v2beta/stable-image/control/structure",
    style: "/v2beta/stable-image/control/style",
    "style-transfer": "/v2beta/stable-image/control/style-transfer"
};
const STABILITY_CONTROL_MODELS = new Set([
    "sketch",
    "structure",
    "style",
    "style-transfer"
]);
function appendOptionalFormValue(formData, key, value) {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, String(value));
}
function appendImageFormValue(formData, key, source, filename) {
    formData.append(key, new Blob([
        source.buffer
    ], {
        type: source.contentType || "application/octet-stream"
    }), filename);
}
const FAL_PRESET_SIZES = {
    "1024x1024": "square_hd",
    "512x512": "square",
    "1792x1024": "landscape_16_9",
    "1024x1792": "portrait_16_9",
    "1024x768": "landscape_4_3",
    "768x1024": "portrait_4_3",
    "1536x1024": "landscape_3_2",
    "1024x1536": "portrait_3_2",
    "576x1024": "portrait_16_9",
    "1024x576": "landscape_16_9"
};
async function handleImageGeneration({ body, credentials, log, resolvedProvider = null, signal = null, clientHeaders = null }) {
    let provider, model;
    if (resolvedProvider) {
        // Provider was already resolved by the route layer (custom model from DB)
        // Extract model name from the full "provider/model" string
        provider = resolvedProvider;
        const modelStr = body.model || "";
        model = modelStr.startsWith(provider + "/") ? modelStr.slice(provider.length + 1) : modelStr;
    } else {
        // Standard path: resolve from built-in image registry
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseImageModel"])(body.model);
        provider = parsed.provider;
        model = parsed.model;
    }
    if (!provider) {
        return {
            success: false,
            status: 400,
            error: `Invalid image model: ${body.model}. Use format: provider/model`
        };
    }
    const providerConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getImageProvider"])(provider);
    // For custom models without a built-in provider config, use OpenAI-compatible handler
    // with a synthetic config based on the provider's credentials
    if (!providerConfig) {
        if (!resolvedProvider) {
            return {
                success: false,
                status: 400,
                error: `Unknown image provider: ${provider}`
            };
        }
        // Custom model: use OpenAI-compatible format with provider's base URL
        // The credentials were already resolved by the route layer
        if (log) {
            log.info("IMAGE", `Custom model ${provider}/${model} — using OpenAI-compatible handler`);
        }
        const syntheticConfig = {
            id: provider,
            // #3205: custom OpenAI-compatible nodes store their base URL in
            // credentials.providerSpecificData.baseUrl (same as the chat path —
            // see executors/default.ts:buildUrl / services/provider.ts:buildProviderUrl).
            // Previously only the (always-absent) top-level credentials.baseUrl was
            // read, so every custom image node fell back to the Gemini endpoint and
            // returned "Please pass a valid API key".
            baseUrl: resolveImageBaseUrl(credentials, `https://generativelanguage.googleapis.com/v1beta/openai/images/generations`),
            authType: "apikey",
            authHeader: "bearer",
            format: "openai"
        };
        return handleOpenAIImageGeneration({
            model,
            provider,
            providerConfig: syntheticConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "gemini-image") {
        return handleGeminiImageGeneration({
            model,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "imagen3") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$imagen3$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleImagen3ImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "google-imagen") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$googleImagen$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleGoogleImagenGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "hyperbolic") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$hyperbolic$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleHyperbolicImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "huggingface-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$huggingface$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleHuggingFaceImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "fal-ai") {
        return handleFalAIImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "stability-ai") {
        return handleStabilityAIImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "black-forest-labs") {
        return handleBlackForestLabsImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "recraft") {
        return handleRecraftImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "topaz") {
        return handleTopazImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "segmind") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$segmind$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleSegmindImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "chatgpt-web") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleChatGptWebImageGeneration"])({
            model,
            provider,
            body,
            credentials,
            log,
            signal,
            clientHeaders
        });
    }
    if (providerConfig.format === "designer-web") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$designerWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleDesignerWebImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "adobe-firefly-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$adobeFirefly$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleAdobeFireflyImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "nanobanana") {
        return handleNanoBananaImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "kie-image") {
        return handleKieImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "sdwebui") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$sdWebUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleSDWebUIImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            log
        });
    }
    if (providerConfig.format === "comfyui") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$comfyUI$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleComfyUIImageGeneration"])({
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
    if (providerConfig.format === "codex-responses") {
        return handleCodexImageGeneration({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "haiper-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$haiper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleHaiperImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "leonardo-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$leonardo$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleLeonardoImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "ideogram-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$ideogram$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleIdeogramImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "freepik-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$freepik$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleFreepikImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "nvidia-nim") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$nvidiaNim$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleNvidiaNimImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "minimax-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$minimax$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleMinimaxImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    if (providerConfig.format === "alibaba-image" || providerConfig.format === "qwen-cloud-image" || providerConfig.format === "qwen-token-plan-image" || providerConfig.format === "bailian-coding-plan-image") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$alibabaImage$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["handleAlibabaImageGeneration"])({
            model,
            provider,
            providerConfig,
            body,
            credentials,
            log
        });
    }
    return handleOpenAIImageGeneration({
        model,
        provider,
        providerConfig,
        body,
        credentials,
        log
    });
}
function normalizeKieImageResult(recordData) {
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
    const response = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(data.response) ? data.response : {};
    const resultJson = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseKieResultJson"])(recordData);
    const urls = new Set();
    const add = (val)=>{
        if (typeof val === "string" && val.startsWith("http")) urls.add(val);
        if (Array.isArray(val)) {
            val.forEach((v)=>{
                if (typeof v === "string" && v.startsWith("http")) urls.add(v);
            });
        }
    };
    // Check resultJson (common in Market API)
    add(resultJson?.resultUrls);
    add(resultJson?.imageUrls);
    add(resultJson?.resultUrl);
    add(resultJson?.imageUrl);
    // Check data.response (common in 4o-image API)
    add(response.resultUrls);
    add(response.resultUrl);
    // Check direct data fields
    add(data.resultImageUrls);
    add(data.resultImageUrl);
    add(data.url);
    return Array.from(urls);
}
async function handleKieImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials?.apiKey || credentials?.accessToken;
    const timeoutMs = normalizePositiveNumber(body.timeout_ms, 300000);
    const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, 2500);
    const prompt = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    const size = typeof body.size === "string" ? body.size : undefined;
    if (!token) {
        return saveImageErrorResult({
            provider,
            model,
            status: 401,
            startTime,
            error: "KIE API key is required"
        });
    }
    // Check if model is a Market model (unified API)
    const fullRegistry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$imageRegistry$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getImageProvider"])(provider);
    const modelEntry = fullRegistry?.models?.find((m)=>m.id === model);
    const isMarket = modelEntry?.isMarket || model.includes("/");
    const { imageUrl } = extractImageInputs(body);
    let baseUrl = "";
    let payload = {};
    if (isMarket) {
        // Unified Market API endpoint
        baseUrl = `${providerConfig.baseUrl.replace(/\/$/, "")}/api/v1/jobs/createTask`;
        const input = {
            prompt,
            aspect_ratio: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(size)
        };
        if (imageUrl) {
            input.image_url = imageUrl;
        }
        payload = {
            model,
            input
        };
    } else {
        // Legacy/Direct endpoint
        const modelPath = model.replace("-t2i", "").replace("-i2i", "");
        baseUrl = providerConfig.baseUrl.includes(model) ? providerConfig.baseUrl : `https://api.kie.ai/api/v1/${modelPath}/generate`;
        payload = {
            prompt,
            size: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(size),
            nVariants: body.n || 1
        };
    }
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (${isMarket ? "market" : "direct"}) | prompt: "${promptPreview}..."`);
    }
    try {
        const endpoint = isMarket ? "/api/v1/jobs/createTask" : new URL(baseUrl).pathname;
        const createBaseUrl = isMarket ? providerConfig.baseUrl : baseUrl.replace(endpoint, "");
        const createData = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].createTask({
            baseUrl: createBaseUrl,
            token,
            payload,
            endpoint
        });
        const taskId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieTaskId"])(createData);
        if (!taskId) {
            const errorMessage = createData?.msg || createData?.message || createData?.error || "KIE image generation did not return taskId";
            if (log) {
                log.error("IMAGE", `KIE createTask failed: ${JSON.stringify(createData)}`);
            }
            return saveImageErrorResult({
                provider,
                model,
                status: 502,
                startTime,
                error: errorMessage,
                requestBody: payload
            });
        }
        // Use statusUrl from providerConfig if available, fallback to dynamic derivation
        const statusUrl = isMarket ? `${providerConfig.baseUrl.replace(/\/$/, "")}/api/v1/jobs/recordInfo` : providerConfig.statusUrl && !providerConfig.statusUrl.includes("jobs/recordInfo") ? providerConfig.statusUrl : baseUrl.replace(/\/generate$/, "/record-info");
        const { data: recordData, state } = await __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$kie$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["kieExecutor"].pollTask({
            statusUrl,
            taskId: String(taskId),
            token,
            timeoutMs,
            pollIntervalMs
        });
        if (state === "success") {
            if (log) {
                log.info("IMAGE", `KIE poll success for task ${taskId}`);
            }
            const urls = normalizeKieImageResult(recordData);
            const images = urls.map((url)=>({
                    url,
                    revised_prompt: prompt
                }));
            return saveImageSuccessResult({
                provider,
                model,
                startTime,
                requestBody: payload,
                responseBody: {
                    images_count: images.length
                },
                images
            });
        }
        const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(recordData) ? recordData : {};
        const recordDataBody = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["isJsonObject"])(record.data) ? record.data : {};
        const errorMessage = recordDataBody.errorMessage || recordDataBody.failMsg || record.msg || "KIE image task failed";
        if (log) {
            log.error("IMAGE", `KIE poll failed for task ${taskId}: ${JSON.stringify(recordData)}`);
        }
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: String(errorMessage),
            requestBody: payload
        });
    } catch (err) {
        return saveImageErrorResult({
            provider,
            model,
            status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieErrorStatus"])(err, 502),
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$kieTask$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getKieErrorMessage"])(err, "KIE image generation failed")}`
        });
    }
}
/**
 * Handle Gemini-format image generation (Antigravity / Nano Banana)
 * Uses Gemini's generateContent API with responseModalities: ["TEXT", "IMAGE"]
 */ async function handleGeminiImageGeneration({ model, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const url = providerConfig.baseUrl;
    const provider = "antigravity";
    const credentialRecord = credentials || {};
    const token = credentialRecord.accessToken || credentialRecord.apiKey;
    const providerSpecificData = credentialRecord.providerSpecificData;
    const providerSpecificProjectId = providerSpecificData && typeof providerSpecificData === "object" ? providerSpecificData.projectId : null;
    const credentialProjectId = typeof credentialRecord.projectId === "string" ? credentialRecord.projectId.trim() : "";
    const providerProjectId = typeof providerSpecificProjectId === "string" ? providerSpecificProjectId.trim() : "";
    const projectId = credentialProjectId || providerProjectId || null;
    const candidateCount = typeof body.n === "number" && Number.isFinite(body.n) && body.n > 0 ? Math.floor(body.n) : 1;
    const promptText = typeof body.prompt === "string" ? body.prompt : String(body.prompt ?? "");
    // Summarized request for call log
    const logRequestBody = {
        model: body.model,
        prompt: promptText.slice(0, 200),
        size: body.size || "default",
        n: candidateCount
    };
    if (!projectId || typeof projectId !== "string") {
        return saveImageErrorResult({
            provider,
            model,
            status: 400,
            startTime,
            error: "Missing Google projectId for Antigravity account. Please reconnect OAuth in Providers so OmniRoute can fetch your Cloud Code project.",
            requestBody: logRequestBody
        });
    }
    const antigravityBody = {
        project: projectId,
        requestId: `image_gen/${Date.now()}/${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])()}/0`,
        request: {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: promptText
                        }
                    ]
                }
            ],
            generationConfig: {
                candidateCount,
                imageConfig: {
                    aspectRatio: normalizeImageAspectRatio(body.aspect_ratio, body.size)
                }
            }
        },
        model,
        userAgent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityIdentity$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getAntigravityEnvelopeUserAgent"])(credentialRecord),
        requestType: "image_gen"
    };
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$antigravityClientProfile$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["applyAntigravityClientProfileHeaders"])(headers, credentialRecord, antigravityBody);
    delete headers["x-goog-user-project"];
    if (log) {
        const promptPreview = promptText.slice(0, 60);
        log.info("IMAGE", `antigravity/${model} (gemini) | prompt: "${promptPreview}..." | format: gemini-image`);
    }
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(antigravityBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            const safeError = sanitizeImageProviderError(errorText);
            const safeErrorLog = typeof safeError === "string" ? safeError : JSON.stringify(safeError ?? {});
            if (log) {
                log.error("IMAGE", `antigravity error ${response.status}: ${safeErrorLog.slice(0, 200)}`);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: response.status,
                model: `antigravity/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: safeErrorLog.slice(0, 500),
                requestBody: logRequestBody
            }).catch(()=>{});
            return {
                success: false,
                status: response.status,
                error: safeError
            };
        }
        const data = await response.json();
        const responseBody = data.response || data;
        // Extract image data from Antigravity's wrapped Gemini response.
        const images = [];
        const candidates = responseBody.candidates || [];
        for (const candidate of candidates){
            const parts = candidate.content?.parts || [];
            for (const part of parts){
                if (part.inlineData) {
                    images.push({
                        b64_json: part.inlineData.data,
                        revised_prompt: parts.find((p)=>p.text)?.text || promptText
                    });
                }
            }
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 200,
            model: `antigravity/${model}`,
            provider,
            duration: Date.now() - startTime,
            tokens: {
                prompt_tokens: 0,
                completion_tokens: 0
            },
            requestBody: logRequestBody,
            responseBody: {
                images_count: images.length
            }
        }).catch(()=>{});
        return {
            success: true,
            data: {
                created: Math.floor(Date.now() / 1000),
                data: images
            }
        };
    } catch (err) {
        if (log) {
            log.error("IMAGE", `antigravity fetch error: ${err.message}`);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `antigravity/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message,
            requestBody: logRequestBody
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
/**
 * Handle OpenAI-compatible image generation (standard providers + Nebius fallback)
 */ async function handleOpenAIImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    // Summarized request for call log
    const logRequestBody = {
        model: body.model,
        prompt: typeof body.prompt === "string" ? body.prompt.slice(0, 200) : String(body.prompt ?? "").slice(0, 200),
        size: body.size || "default",
        n: body.n || 1,
        quality: body.quality || undefined
    };
    // Build upstream request (OpenAI-compatible format)
    const upstreamBody = {
        model: model,
        prompt: body.prompt
    };
    // Pass optional parameters
    if (body.n !== undefined) upstreamBody.n = body.n;
    if (body.size !== undefined) upstreamBody.size = body.size;
    if (body.quality !== undefined) upstreamBody.quality = body.quality;
    if (body.response_format !== undefined) upstreamBody.response_format = body.response_format;
    if (body.style !== undefined) upstreamBody.style = body.style;
    const { imageUrl } = extractImageInputs(body);
    if (imageUrl && OPENAI_IMAGE_TO_IMAGE_MODELS.has(model)) {
        upstreamBody.image_url = imageUrl;
    }
    // Build headers
    let headers = {
        "Content-Type": "application/json"
    };
    const token = credentials.apiKey || credentials.accessToken;
    if (token && providerConfig.authHeader === "bearer") {
        headers["Authorization"] = `Bearer ${token}`;
    } else if (token && providerConfig.authHeader === "x-api-key") {
        headers["x-api-key"] = token;
    }
    // #8085 — keyless Pollinations image requests (the common free case) get
    // no Authorization header above. Mirror the chat executor's anonymous
    // fingerprint-pool fallback (open-sse/executors/pollinations.ts) so the
    // outbound request isn't sent bare and rejected by Pollinations' own 401.
    let pollinationsAnonSession = null;
    if (providerConfig.id === "pollinations") {
        const anon = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$pollinationsAnonAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["applyPollinationsAnonymousFallback"])(providerConfig.id, token, headers);
        headers = anon.headers;
        pollinationsAnonSession = anon.session;
    }
    if (log) {
        const promptPreview = typeof body.prompt === "string" ? body.prompt.slice(0, 60) : String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} | prompt: "${promptPreview}..." | size: ${body.size || "default"}`);
    }
    const requestBody = JSON.stringify(upstreamBody);
    // Try primary URL
    let result = await fetchImageEndpoint(providerConfig.baseUrl, headers, requestBody, provider, log);
    // Fallback for providers with fallbackUrl (e.g., Nebius)
    if (!result.success && providerConfig.fallbackUrl && [
        404,
        410,
        502,
        503
    ].includes(result.status)) {
        if (log) {
            log.info("IMAGE", `${provider}: primary URL failed (${result.status}), trying fallback...`);
        }
        result = await fetchImageEndpoint(providerConfig.fallbackUrl, headers, requestBody, provider, log);
    }
    if (pollinationsAnonSession) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$pollinationsAnonAuth$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reportPollinationsAnonOutcome"])(pollinationsAnonSession, result.status);
    }
    // Save call log after result is determined
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/images/generations",
        status: result.status || (result.success ? 200 : 502),
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        tokens: {
            prompt_tokens: 0,
            completion_tokens: 0
        },
        error: result.success ? null : typeof result.error === "string" ? result.error.slice(0, 500) : null,
        requestBody: logRequestBody,
        responseBody: result.success ? {
            images_count: result.data?.data?.length || 0
        } : null
    }).catch(()=>{});
    return result;
}
async function handleOpenAIImageEdit({ model, provider, credentials, prompt, imageBytes, imageMime, size, responseFormat, n = 1, log }) {
    const startTime = Date.now();
    const url = resolveImageBaseUrl(credentials, `https://generativelanguage.googleapis.com/v1beta/openai/images/edits`, "edits");
    // Build the multipart body as a Buffer with an explicit boundary instead of a global
    // `FormData`. In production `globalThis.fetch` is patched with node_modules/undici's fetch,
    // whose `FormData` class differs from `globalThis.FormData` — passing a native FormData
    // makes undici serialize it as the string "[object FormData]" (text/plain), dropping every
    // field (including `model`, which reaches the upstream empty). A Buffer body is accepted
    // verbatim by any fetch implementation. (#3273)
    const boundary = `----OmniRouteImageEdit${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])().replace(/-/g, "")}`;
    const CRLF = "\r\n";
    const partBuffers = [];
    const appendField = (name, value)=>{
        partBuffers.push(Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`));
    };
    appendField("model", model);
    appendField("prompt", prompt);
    if (size) appendField("size", size);
    if (responseFormat) appendField("response_format", responseFormat);
    appendField("n", String(n || 1));
    partBuffers.push(Buffer.from(`--${boundary}${CRLF}Content-Disposition: form-data; name="image"; filename="image.png"${CRLF}` + `Content-Type: ${imageMime || "image/png"}${CRLF}${CRLF}`));
    partBuffers.push(imageBytes);
    partBuffers.push(Buffer.from(`${CRLF}--${boundary}--${CRLF}`));
    const multipartBody = Buffer.concat(partBuffers);
    const headers = {
        "Content-Type": `multipart/form-data; boundary=${boundary}`
    };
    const token = credentials?.apiKey || credentials?.accessToken;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (log) {
        log.info("IMAGE", `${provider}/${model} (edit) | prompt: "${prompt.slice(0, 60)}..." -> ${url}`);
    }
    const result = await fetchImageEndpoint(url, headers, multipartBody, provider, log);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path: "/v1/images/edits",
        status: result.status || (result.success ? 200 : 502),
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        tokens: {
            prompt_tokens: 0,
            completion_tokens: 0
        },
        error: result.success ? null : typeof result.error === "string" ? result.error.slice(0, 500) : null,
        requestBody: {
            model,
            prompt: prompt.slice(0, 200),
            size: size || "default",
            n: n || 1
        },
        responseBody: result.success ? {
            images_count: result.data?.data?.length || 0
        } : null
    }).catch(()=>{});
    return result;
}
async function handleImageEdit({ provider, model, body, imageBytes, credentials, log, signal = null, clientHeaders = null }) {
    const startTime = Date.now();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
        return saveImageErrorResult({
            provider,
            model,
            status: 400,
            startTime,
            error: "Prompt is required for image edit"
        });
    }
    if (!credentials?.apiKey) {
        return saveImageErrorResult({
            provider,
            model,
            status: 401,
            startTime,
            error: "ChatGPT Web credentials missing session cookie"
        });
    }
    const imageHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(imageBytes).digest("hex");
    const cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$chatgptImageCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["findChatGptImageBySha256"])(imageHash);
    const wantsBase64 = body.response_format === "b64_json";
    const requestBody = {
        model,
        prompt: prompt.slice(0, 500),
        size: body.size || undefined,
        image_hash: imageHash.slice(0, 16),
        image_bytes: imageBytes.length,
        cached_match: Boolean(cached?.entry.context)
    };
    if (!cached?.entry.context) {
        // chatgpt-web's image_gen tool can only edit an image when we continue
        // the original conversation node. If we never generated this image (or
        // its 30-minute TTL elapsed), there's no node to continue. Return a
        // clear, actionable error — much better than silently spawning an
        // unrelated image and confusing the user.
        log?.warn?.("IMAGE", `chatgpt-web edit: no cached match for sha256=${imageHash.slice(0, 16)} (bytes=${imageBytes.length}); returning 400`);
        return saveImageErrorResult({
            provider,
            model,
            status: 400,
            startTime,
            error: "chatgpt-web image edit only works for images recently generated through this OmniRoute instance " + "(cache window: 30 minutes). Re-generate the image and try the edit immediately, or disable image-edit " + "in your client to use plain chat-completion edit prompts instead.",
            requestBody
        });
    }
    // Build a synthetic chat thread that surfaces the cached image URL on
    // the assistant turn. The executor's parseOpenAIMessages picks up the
    // URL, findCachedImageContext resolves it to {conversationId,
    // parentMessageId}, and looksLikeImageEditRequest fires on the user
    // prompt — together producing a continuation request that actually
    // edits the saved image.
    //
    // The synthetic user prompt is anchored with both an edit verb AND an
    // image-gen verb so the executor's heuristics fire regardless of what
    // wording the caller used ("now make it brighter", "tweak this", ...):
    //   - looksLikeImageEditRequest: matches "edit" + "image" within 120 chars
    //   - looksLikeImageGenRequest:  matches "generate" + "image" within 40 chars
    // Either match alone would set forImageGen, but covering both is cheap
    // insurance for prompts that don't fit common phrasings.
    const messages = [
        {
            role: "assistant",
            // The base URL is irrelevant — only the path is parsed by
            // CACHED_IMAGE_URL_RE in the executor's findCachedImageContext.
            content: `![image](http://internal/v1/chatgpt-web/image/${cached.id})`
        },
        {
            role: "user",
            content: `Edit the image and generate the new image: ${prompt}`
        }
    ];
    const executor = new __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$executors$2f$chatgpt$2d$web$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["ChatGptWebExecutor"]();
    const result = await executor.execute({
        model,
        body: {
            messages
        },
        stream: false,
        credentials,
        signal,
        log,
        clientHeaders
    });
    const responseText = await result.response.text();
    if (result.response.status >= 400) {
        return saveImageErrorResult({
            provider,
            model,
            status: result.response.status,
            startTime,
            error: responseText,
            requestBody
        });
    }
    let content = "";
    try {
        const json = JSON.parse(responseText);
        content = String(json?.choices?.[0]?.message?.content || "");
    } catch  {
        content = responseText;
    }
    const urls = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["extractMarkdownImageUrls"])(content);
    if (urls.length === 0) {
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `ChatGPT Web edit completed without returning image markdown: ${content.slice(0, 300)}`,
            requestBody
        });
    }
    const images = [];
    for (const url of urls){
        if (!wantsBase64) {
            images.push({
                url
            });
            continue;
        }
        const id = url.match(__TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$handlers$2f$imageGeneration$2f$providers$2f$chatgptWeb$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["CHATGPT_WEB_IMAGE_ID_RE"])?.[1];
        const cachedNew = id ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$services$2f$chatgptImageCache$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getChatGptImage"])(id) : null;
        if (!cachedNew) {
            return saveImageErrorResult({
                provider,
                model,
                status: 502,
                startTime,
                error: "ChatGPT Web image bytes expired before b64_json conversion",
                requestBody
            });
        }
        images.push({
            b64_json: cachedNew.bytes.toString("base64")
        });
    }
    return saveImageSuccessResult({
        provider,
        model,
        startTime,
        requestBody,
        responseBody: {
            images_count: images.length,
            edit_match: Boolean(cached?.entry.context)
        },
        images
    });
}
async function handleFalAIImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const { imageUrl, imageUrls } = extractImageInputs(body);
    const upstreamBody = {
        prompt: body.prompt,
        sync_mode: body.sync_mode ?? true
    };
    if (body.n !== undefined) upstreamBody.num_images = Number(body.n) || 1;
    if (body.negative_prompt) upstreamBody.negative_prompt = body.negative_prompt;
    if (body.seed !== undefined) upstreamBody.seed = body.seed;
    if (body.style) upstreamBody.style = normalizeRecraftStyle(body.style);
    const outputFormat = normalizeRequestedImageFormat(body, "png");
    if (outputFormat) upstreamBody.output_format = outputFormat;
    if (model.includes("flux-pro/v1.1") && !model.includes("ultra")) {
        upstreamBody.image_size = mapFalImageSize(body.size, "landscape_4_3");
    } else if (model.includes("bytedance/") || model.includes("stable-diffusion") || model.includes("ideogram") || model.includes("recraft/v3")) {
        upstreamBody.image_size = mapFalImageSize(body.size, "square_hd");
    } else {
        upstreamBody.aspect_ratio = body.aspect_ratio || mapFalAspectRatio(body.size, "1:1");
    }
    if (body.quality === "hd" && model.includes("ultra")) {
        upstreamBody.raw = true;
    }
    if (imageUrl && model.includes("flux-pro/v1.1-ultra")) {
        upstreamBody.image_url = imageUrl;
    }
    if (imageUrls.length > 0 && model.includes("ideogram")) {
        upstreamBody.image_urls = imageUrls;
    }
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (fal-ai) | prompt: "${promptPreview}..."`);
    }
    try {
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}/${model}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Key ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText,
                requestBody: upstreamBody
            });
        }
        const payload = await response.json();
        const images = await normalizeProviderImagePayload(payload, body, log);
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            requestBody: upstreamBody,
            responseBody: {
                images_count: images.length
            },
            created: payload.created,
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function handleStabilityAIImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const endpoint = STABILITY_GENERATION_ENDPOINTS[model] || STABILITY_EDIT_ENDPOINTS[model];
    if (!endpoint) {
        return {
            success: false,
            status: 400,
            error: `Unsupported Stability AI image model: ${model}`
        };
    }
    const { imageUrl, maskUrl } = extractImageInputs(body);
    const upstreamBody = {
        output_format: model === "remove-background" ? normalizeRequestedImageFormat(body, "png", [
            "png",
            "webp"
        ]) : normalizeRequestedImageFormat(body, "png")
    };
    const formData = new FormData();
    appendOptionalFormValue(formData, "output_format", upstreamBody.output_format);
    if (body.prompt) {
        upstreamBody.prompt = body.prompt;
        appendOptionalFormValue(formData, "prompt", body.prompt);
    }
    if (body.negative_prompt) {
        upstreamBody.negative_prompt = body.negative_prompt;
        appendOptionalFormValue(formData, "negative_prompt", body.negative_prompt);
    }
    if (body.seed !== undefined) {
        upstreamBody.seed = body.seed;
        appendOptionalFormValue(formData, "seed", body.seed);
    }
    try {
        if (STABILITY_GENERATION_ENDPOINTS[model]) {
            if (model.startsWith("sd3.5")) {
                upstreamBody.model = model;
                appendOptionalFormValue(formData, "model", model);
            }
            if (imageUrl) {
                const imageSource = await resolveImageSource(imageUrl);
                upstreamBody.mode = "image-to-image";
                appendOptionalFormValue(formData, "mode", "image-to-image");
                upstreamBody.image = imageSource.base64;
                appendImageFormValue(formData, "image", imageSource, "image");
                if (body.strength !== undefined) {
                    upstreamBody.strength = body.strength;
                    appendOptionalFormValue(formData, "strength", body.strength);
                }
            } else {
                upstreamBody.mode = "text-to-image";
                appendOptionalFormValue(formData, "mode", "text-to-image");
            }
            if (!model.startsWith("sd3.5") || !imageUrl) {
                const aspectRatio = body.aspect_ratio || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(body.size);
                upstreamBody.aspect_ratio = aspectRatio;
                appendOptionalFormValue(formData, "aspect_ratio", aspectRatio);
            }
            if (body.style_preset) {
                upstreamBody.style_preset = body.style_preset;
                appendOptionalFormValue(formData, "style_preset", body.style_preset);
            }
        } else {
            if (imageUrl) {
                const imageSource = await resolveImageSource(imageUrl);
                upstreamBody.image = imageSource.base64;
                appendImageFormValue(formData, "image", imageSource, "image");
            }
            if (maskUrl && shouldIncludeStabilityMask(model)) {
                const maskSource = await resolveImageSource(maskUrl);
                upstreamBody.mask = maskSource.base64;
                appendImageFormValue(formData, "mask", maskSource, "mask");
            }
            if (body.search_prompt) {
                upstreamBody.search_prompt = body.search_prompt;
                appendOptionalFormValue(formData, "search_prompt", body.search_prompt);
            }
            if (body.grow_mask !== undefined) {
                upstreamBody.grow_mask = body.grow_mask;
                appendOptionalFormValue(formData, "grow_mask", body.grow_mask);
            }
            if (body.control_strength !== undefined) {
                upstreamBody.control_strength = body.control_strength;
                appendOptionalFormValue(formData, "control_strength", body.control_strength);
            }
            if (body.creativity !== undefined) {
                upstreamBody.creativity = body.creativity;
                appendOptionalFormValue(formData, "creativity", body.creativity);
            }
            if (body.left !== undefined) {
                upstreamBody.left = body.left;
                appendOptionalFormValue(formData, "left", body.left);
            }
            if (body.right !== undefined) {
                upstreamBody.right = body.right;
                appendOptionalFormValue(formData, "right", body.right);
            }
            if (body.up !== undefined) {
                upstreamBody.up = body.up;
                appendOptionalFormValue(formData, "up", body.up);
            }
            if (body.down !== undefined) {
                upstreamBody.down = body.down;
                appendOptionalFormValue(formData, "down", body.down);
            }
            if (body.style_preset) {
                upstreamBody.style_preset = body.style_preset;
                appendOptionalFormValue(formData, "style_preset", body.style_preset);
            }
            if (STABILITY_CONTROL_MODELS.has(model) && !upstreamBody.prompt) {
                upstreamBody.prompt = body.prompt || "";
                appendOptionalFormValue(formData, "prompt", body.prompt || "");
            }
        }
        if (log) {
            const promptPreview = String(body.prompt ?? "").slice(0, 60);
            log.info("IMAGE", `${provider}/${model} (stability-ai) | prompt: "${promptPreview}..."`);
        }
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}${endpoint}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            },
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText,
                requestBody: upstreamBody
            });
        }
        const contentType = response.headers.get("content-type") || "";
        let payload;
        if (contentType.includes("application/json")) {
            payload = await response.json();
        } else {
            const buffer = Buffer.from(await response.arrayBuffer());
            payload = {
                image: buffer.toString("base64")
            };
        }
        const images = await normalizeProviderImagePayload(payload, body, log);
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            requestBody: upstreamBody,
            responseBody: {
                images_count: images.length
            },
            created: payload.created,
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function handleBlackForestLabsImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const endpoint = BFL_MODEL_ENDPOINTS[model];
    if (!endpoint) {
        return {
            success: false,
            status: 400,
            error: `Unsupported Black Forest Labs image model: ${model}`
        };
    }
    const { imageUrl, maskUrl } = extractImageInputs(body);
    const upstreamBody = {
        prompt: body.prompt,
        output_format: normalizeRequestedImageFormat(body, "png")
    };
    try {
        if (BFL_EDIT_MODELS.has(model) && imageUrl) {
            upstreamBody.input_image = (await resolveImageSource(imageUrl)).base64;
        } else if (imageUrl && isHttpUrl(imageUrl)) {
            upstreamBody.image_url = imageUrl;
        }
        if (maskUrl && (model === "flux-pro-1.0-fill" || model === "flux-kontext-pro")) {
            upstreamBody.mask = (await resolveImageSource(maskUrl)).base64;
        }
        if (model === "flux-kontext-pro" || model === "flux-kontext-max") {
            upstreamBody.aspect_ratio = body.aspect_ratio || (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(body.size);
        } else if (typeof body.size === "string" && body.size.includes("x")) {
            const { width, height } = parseSizeToDimensions(body.size, 1024);
            upstreamBody.width = width;
            upstreamBody.height = height;
        }
        if (body.seed !== undefined) upstreamBody.seed = body.seed;
        if (body.n !== undefined && model.includes("ultra")) upstreamBody.num_images = Number(body.n) || 1;
        if (body.quality === "hd" && model.includes("ultra")) upstreamBody.raw = true;
        if (body.left !== undefined) upstreamBody.left = body.left;
        if (body.right !== undefined) upstreamBody.right = body.right;
        if (body.top !== undefined) upstreamBody.top = body.top;
        if (body.bottom !== undefined) upstreamBody.bottom = body.bottom;
        if (body.steps !== undefined) upstreamBody.steps = body.steps;
        if (body.guidance !== undefined) upstreamBody.guidance = body.guidance;
        if (body.grow_mask !== undefined) upstreamBody.grow_mask = body.grow_mask;
        if (body.safety_tolerance !== undefined) upstreamBody.safety_tolerance = body.safety_tolerance;
        if (log) {
            const promptPreview = String(body.prompt ?? "").slice(0, 60);
            log.info("IMAGE", `${provider}/${model} (black-forest-labs) | prompt: "${promptPreview}..."`);
        }
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "x-key": token
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText,
                requestBody: upstreamBody
            });
        }
        const initialPayload = await response.json();
        const finalPayload = initialPayload.polling_url ? await pollBlackForestLabsResult({
            pollingUrl: initialPayload.polling_url,
            token,
            body,
            log
        }) : initialPayload;
        const images = await normalizeProviderImagePayload(finalPayload, body, log);
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            requestBody: upstreamBody,
            responseBody: {
                images_count: images.length
            },
            created: finalPayload.created,
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function handleRecraftImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const upstreamBody = {
        model,
        prompt: body.prompt
    };
    if (body.n !== undefined) upstreamBody.n = body.n;
    if (body.size !== undefined) upstreamBody.size = body.size;
    if (body.response_format !== undefined) upstreamBody.response_format = body.response_format;
    if (body.style !== undefined) upstreamBody.style = body.style;
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (recraft) | prompt: "${promptPreview}..."`);
    }
    try {
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}/v1/images/generations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText,
                requestBody: upstreamBody
            });
        }
        const payload = await response.json();
        const images = await normalizeProviderImagePayload(payload, body, log);
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            requestBody: upstreamBody,
            responseBody: {
                images_count: images.length
            },
            created: payload.created,
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function handleTopazImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    const { imageUrl } = extractImageInputs(body);
    if (!imageUrl) {
        return {
            success: false,
            status: 400,
            error: `Topaz model ${model} requires an input image`
        };
    }
    try {
        const imageSource = await resolveImageSource(imageUrl);
        const formData = new FormData();
        const blob = new Blob([
            imageSource.buffer
        ], {
            type: imageSource.contentType || "image/png"
        });
        formData.append("image", blob, "image.png");
        if (typeof body.size === "string" && body.size.includes("x")) {
            const { width, height } = parseSizeToDimensions(body.size, 1024);
            formData.append("output_width", String(width));
            formData.append("output_height", String(height));
        }
        if (log) {
            const promptPreview = String(body.prompt ?? "enhance image").slice(0, 60);
            log.info("IMAGE", `${provider}/${model} (topaz) | prompt: "${promptPreview}..."`);
        }
        const response = await fetch(`${providerConfig.baseUrl.replace(/\/$/, "")}/image/v1/enhance`, {
            method: "POST",
            headers: {
                Accept: "image/jpeg",
                "X-API-Key": token
            },
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            return saveImageErrorResult({
                provider,
                model,
                status: response.status,
                startTime,
                error: errorText
            });
        }
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = buffer.toString("base64");
        const wantsBase64 = body.response_format === "b64_json";
        const images = [
            wantsBase64 ? {
                b64_json: base64,
                revised_prompt: body.prompt
            } : {
                url: `data:${contentType};base64,${base64}`,
                revised_prompt: body.prompt
            }
        ];
        return saveImageSuccessResult({
            provider,
            model,
            startTime,
            responseBody: {
                images_count: images.length
            },
            images
        });
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        return saveImageErrorResult({
            provider,
            model,
            status: 502,
            startTime,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        });
    }
}
async function pollBlackForestLabsResult({ pollingUrl, token, body, log }) {
    const timeoutMs = normalizePositiveNumber(body.timeout_ms, 300000);
    const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, 1500);
    const deadline = Date.now() + timeoutMs;
    while(Date.now() < deadline){
        const response = await fetch(pollingUrl, {
            method: "GET",
            headers: {
                "x-key": token
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`BFL polling failed (${response.status}): ${errorText}`);
        }
        const payload = await response.json();
        const status = payload?.status;
        if (status === "Ready") {
            return payload;
        }
        if (BFL_FAILURE_STATUSES.has(status)) {
            throw new Error(`BFL image generation failed: ${status}`);
        }
        if (log) {
            log.info("IMAGE", `black-forest-labs polling status: ${String(status || "Pending")}`);
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sleep"])(pollIntervalMs);
    }
    throw new Error(`BFL polling timed out after ${timeoutMs}ms`);
}
function extractImageInputs(body) {
    const imageUrls = [];
    const seen = new Set();
    const pushCandidate = (candidate)=>{
        if (typeof candidate !== "string") return;
        const trimmed = candidate.trim();
        if (!trimmed || seen.has(trimmed)) return;
        seen.add(trimmed);
        imageUrls.push(trimmed);
    };
    pushCandidate(body?.image_url);
    pushCandidate(body?.image);
    if (Array.isArray(body?.imageUrls)) {
        for (const candidate of body.imageUrls)pushCandidate(candidate);
    }
    if (Array.isArray(body?.image_urls)) {
        for (const candidate of body.image_urls)pushCandidate(candidate);
    }
    if (Array.isArray(body?.messages)) {
        for (const msg of body.messages){
            if (!Array.isArray(msg?.content)) continue;
            for (const part of msg.content){
                if (part?.type === "image_url") {
                    pushCandidate(part?.image_url?.url);
                }
            }
        }
    }
    return {
        imageUrl: imageUrls[0] || null,
        imageUrls,
        maskUrl: typeof body?.mask_url === "string" ? body.mask_url : typeof body?.mask === "string" ? body.mask : null
    };
}
async function resolveImageSource(source) {
    if (typeof source !== "string" || source.trim().length === 0) {
        throw new Error("Invalid image source");
    }
    const trimmed = source.trim();
    const dataUriMatch = /^data:([^;]+);base64,(.+)$/i.exec(trimmed);
    if (dataUriMatch) {
        const [, contentType, base64] = dataUriMatch;
        return {
            buffer: Buffer.from(base64, "base64"),
            base64,
            contentType
        };
    }
    if (isHttpUrl(trimmed)) {
        const remoteImage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchRemoteImage"])(trimmed);
        return {
            buffer: remoteImage.buffer,
            base64: remoteImage.buffer.toString("base64"),
            contentType: remoteImage.contentType
        };
    }
    return {
        buffer: Buffer.from(trimmed, "base64"),
        base64: trimmed,
        contentType: "application/octet-stream"
    };
}
function parseSizeToDimensions(size, fallback = 1024) {
    if (typeof size !== "string" || !size.includes("x")) {
        return {
            width: fallback,
            height: fallback
        };
    }
    const [widthRaw, heightRaw] = size.split("x");
    const width = Number(widthRaw);
    const height = Number(heightRaw);
    return {
        width: Number.isFinite(width) && width > 0 ? width : fallback,
        height: Number.isFinite(height) && height > 0 ? height : fallback
    };
}
function normalizeRequestedImageFormat(body, fallback = "png", allowedFormats = [
    "jpeg",
    "png",
    "webp"
]) {
    const formatCandidate = typeof body?.output_format === "string" ? body.output_format.toLowerCase() : typeof body?.response_format === "string" && ![
        "url",
        "b64_json"
    ].includes(body.response_format.toLowerCase()) ? body.response_format.toLowerCase() : fallback;
    if (allowedFormats.includes(formatCandidate)) {
        return formatCandidate;
    }
    return fallback;
}
function mapFalImageSize(size, fallback = "square_hd") {
    if (typeof size !== "string") return fallback;
    if (FAL_PRESET_SIZES[size]) return FAL_PRESET_SIZES[size];
    if (size.includes("x")) {
        const { width, height } = parseSizeToDimensions(size, 1024);
        return {
            width,
            height
        };
    }
    return fallback;
}
function mapFalAspectRatio(size, fallback = "1:1") {
    if (!size) return fallback;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(size);
}
function normalizeRecraftStyle(style) {
    if (style === "vivid") return "digital_illustration";
    if (style === "natural") return "realistic_image";
    return style;
}
function shouldIncludeStabilityMask(model) {
    return new Set([
        "inpaint",
        "erase",
        "search-and-replace",
        "search-and-recolor",
        "replace-background-and-relight"
    ]).has(model);
}
async function normalizeProviderImagePayload(payload, body, log) {
    const candidates = [];
    const pushCandidate = (value)=>{
        if (value === undefined || value === null) return;
        candidates.push(value);
    };
    if (Array.isArray(payload?.data)) {
        for (const item of payload.data)pushCandidate(item);
    }
    if (Array.isArray(payload?.images)) {
        for (const item of payload.images)pushCandidate(item);
    }
    if (payload?.image) pushCandidate({
        b64_json: payload.image
    });
    if (payload?.url) pushCandidate({
        url: payload.url
    });
    if (payload?.sample) pushCandidate({
        url: payload.sample
    });
    if (payload?.result?.sample) pushCandidate({
        url: payload.result.sample
    });
    if (Array.isArray(payload?.result?.images)) {
        for (const item of payload.result.images)pushCandidate(item);
    }
    const normalized = [];
    for (const candidate of candidates){
        const item = await normalizeProviderImageCandidate(candidate, body);
        if (item) normalized.push(item);
    }
    if (normalized.length === 0 && log) {
        log.warn("IMAGE", `Provider returned no recognizable image payload: ${JSON.stringify(payload).slice(0, 240)}`);
    }
    return normalized;
}
async function normalizeProviderImageCandidate(candidate, body) {
    const wantsBase64 = body?.response_format === "b64_json";
    let url = null;
    let b64 = null;
    if (typeof candidate === "string") {
        const dataUriMatch = /^data:[^;]+;base64,(.+)$/i.exec(candidate);
        if (dataUriMatch) {
            b64 = dataUriMatch[1];
        } else if (isHttpUrl(candidate)) {
            url = candidate;
        } else {
            b64 = candidate;
        }
    } else if (candidate && typeof candidate === "object") {
        url = firstString(candidate.url, candidate.image_url, candidate.sample, candidate.file_url) || null;
        b64 = firstString(candidate.b64_json, candidate.image, candidate.base64, candidate.data) || null;
    }
    if (wantsBase64 && !b64 && url) {
        b64 = (await resolveImageSource(url)).base64;
    }
    if (url && !wantsBase64) {
        return {
            url,
            revised_prompt: body?.prompt
        };
    }
    if (b64) {
        return {
            b64_json: b64,
            revised_prompt: body?.prompt
        };
    }
    if (url) {
        return {
            url,
            revised_prompt: body?.prompt
        };
    }
    return null;
}
function firstString(...values) {
    for (const value of values){
        if (typeof value === "string" && value.length > 0) return value;
    }
    return null;
}
function isHttpUrl(value) {
    return typeof value === "string" && /^https?:\/\//i.test(value);
}
function extractImageGenerationCalls(sseText) {
    const results = [];
    const lines = String(sseText || "").split("\n");
    for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let evt;
        try {
            evt = JSON.parse(payload);
        } catch  {
            continue;
        }
        if (evt?.type !== "response.output_item.done") continue;
        const item = evt.item;
        if (!item || item.type !== "image_generation_call") continue;
        const result = typeof item.result === "string" ? item.result : "";
        if (!result) continue;
        const revisedPrompt = typeof item.revised_prompt === "string" ? item.revised_prompt : null;
        results.push({
            b64: result,
            revisedPrompt
        });
    }
    return results;
}
// The image_generation hosted tool accepts { "auto" | "low" | "medium" | "high" }
// for `quality`. Legacy image clients often send "standard" / "hd". Map those values
// so OpenWebUI's quality dropdown doesn't silently get rejected upstream.
function mapLegacyImageQualityToImageTool(value) {
    const normalized = value.toLowerCase();
    if (normalized === "standard") return "medium";
    if (normalized === "hd") return "high";
    return normalized;
}
async function handleCodexImageGeneration({ model, provider, providerConfig, body, credentials, log, referenceImages = [], signal = null, logPath = "/v1/images/generations" }) {
    const startTime = Date.now();
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!prompt.trim()) {
        return saveImageErrorResult({
            provider,
            model,
            status: 400,
            startTime,
            error: "Prompt is required for Codex image generation",
            path: logPath
        });
    }
    const requestedCount = Number.isInteger(body.n) && body.n > 0 ? body.n : 1;
    if (log && requestedCount > 1) {
        log.warn("IMAGE", `Codex hosted image_generation returns one image per call; requested n=${requestedCount} will fan out in parallel`);
    }
    const token = credentials?.accessToken || credentials?.apiKey;
    if (!token) {
        return saveImageErrorResult({
            provider,
            model,
            status: 401,
            startTime,
            error: "Codex credentials missing accessToken — reconnect the Codex provider",
            path: logPath
        });
    }
    const workspaceId = credentials?.providerSpecificData && typeof credentials.providerSpecificData === "object" && !Array.isArray(credentials.providerSpecificData) ? credentials.providerSpecificData.workspaceId : undefined;
    // Forward size/quality from the GPT-Image-style body into the hosted tool so
    // OpenWebUI's size/quality selectors actually take effect. Everything else
    // (model, n, background, moderation, output_compression) is left to the
    // Codex backend's defaults — today that's `gpt-image-2`.
    const toolConfig = {
        type: "image_generation",
        output_format: "png"
    };
    if (referenceImages.length > 0) toolConfig.action = "edit";
    if (typeof body.size === "string" && body.size.trim()) {
        toolConfig.size = body.size.trim();
    }
    if (typeof body.quality === "string" && body.quality.trim()) {
        toolConfig.quality = mapLegacyImageQualityToImageTool(body.quality.trim());
    }
    const inputContent = [
        {
            type: "input_text",
            text: prompt
        }
    ];
    for (const image of referenceImages){
        inputContent.push({
            type: "input_image",
            image_url: `data:${image.mime || "image/png"};base64,${image.bytes.toString("base64")}`
        });
    }
    const upstreamBody = {
        model,
        instructions: referenceImages.length > 0 ? `You must call the image_generation tool exactly once to edit the supplied ${referenceImages.length === 1 ? "reference image" : "reference images"}. Treat all supplied images as references for the user's requested composition or style. Do not add narration.` : "You must call the image_generation tool exactly once to fulfill the user's request. Do not add narration.",
        input: [
            {
                role: "user",
                content: inputContent
            }
        ],
        tools: [
            toolConfig
        ],
        stream: true,
        store: false
    };
    const requestBodyForLog = referenceImages.length > 0 ? {
        model,
        prompt_chars: prompt.length,
        reference_images: referenceImages.map((image)=>({
                mime: image.mime || "image/png",
                bytes: image.bytes.length
            })),
        tools: [
            toolConfig
        ],
        stream: true,
        store: false
    } : upstreamBody;
    const headers = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
        Version: (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexClientVersion"])(),
        "User-Agent": (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$config$2f$codexClient$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getCodexUserAgent"])(),
        originator: "codex_cli_rs"
    };
    if (typeof workspaceId === "string" && workspaceId) {
        headers["chatgpt-account-id"] = workspaceId;
        headers["session_id"] = workspaceId;
    }
    if (log) {
        const promptSummary = referenceImages.length > 0 ? `${prompt.length} chars` : `"${prompt.slice(0, 60)}..."`;
        log.info("IMAGE", `${provider}/${model} (codex-responses) | prompt: ${promptSummary}`);
    }
    const fetchOneImage = async ()=>{
        let response;
        try {
            response = await fetch(providerConfig.baseUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(upstreamBody),
                signal
            });
        } catch (err) {
            const message = (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err);
            if (log) log.error("IMAGE", `${provider} fetch error: ${message}`);
            return {
                ok: false,
                error: {
                    provider,
                    model,
                    status: 502,
                    startTime,
                    error: `Image provider error: ${message}`,
                    requestBody: requestBodyForLog,
                    path: logPath
                }
            };
        }
        if (!response.ok) {
            const errorText = await response.text();
            const safeError = sanitizeImageProviderError(errorText);
            const safeErrorLog = typeof safeError === "string" ? safeError : JSON.stringify(safeError ?? {});
            if (log) log.error("IMAGE", `${provider} error ${response.status}: ${safeErrorLog}`);
            return {
                ok: false,
                error: {
                    provider,
                    model,
                    status: response.status,
                    startTime,
                    error: safeError,
                    requestBody: requestBodyForLog,
                    path: logPath
                }
            };
        }
        const rawSSE = await response.text();
        const items = extractImageGenerationCalls(rawSSE);
        if (items.length === 0) {
            return {
                ok: false,
                error: {
                    provider,
                    model,
                    status: 502,
                    startTime,
                    error: "Codex completed without producing an image_generation_call — the model may have declined the tool",
                    requestBody: requestBodyForLog,
                    path: logPath
                }
            };
        }
        return {
            ok: true,
            items
        };
    };
    const imageResults = await Promise.all(Array.from({
        length: requestedCount
    }, ()=>fetchOneImage()));
    const collected = [];
    for (const imageResult of imageResults){
        if (!imageResult.ok) return saveImageErrorResult(imageResult.error);
        for (const item of imageResult.items){
            collected.push({
                b64_json: item.b64,
                ...item.revisedPrompt ? {
                    revised_prompt: item.revisedPrompt
                } : {}
            });
        }
    }
    const wantsUrl = body.response_format !== "b64_json";
    const data = wantsUrl ? collected.map((item)=>({
            url: `data:image/png;base64,${item.b64_json}`,
            ...item.revised_prompt ? {
                revised_prompt: item.revised_prompt
            } : {}
        })) : collected;
    return saveImageSuccessResult({
        provider,
        model,
        startTime,
        requestBody: requestBodyForLog,
        responseBody: {
            images_count: data.length
        },
        images: data,
        path: logPath
    });
}
async function handleCodexImageEdit({ model, provider, providerConfig, body, referenceImages, credentials, log, signal = null }) {
    const result = await handleCodexImageGeneration({
        model,
        provider,
        providerConfig,
        body: {
            ...body,
            n: 1
        },
        credentials,
        log,
        referenceImages,
        signal,
        logPath: "/v1/images/edits"
    });
    return result;
}
function saveImageSuccessResult({ provider, model, startTime, requestBody = null, responseBody = null, created = null, images, path = "/v1/images/generations" }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path,
        status: 200,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        requestBody,
        responseBody
    }).catch(()=>{});
    return {
        success: true,
        data: {
            created: created || Math.floor(Date.now() / 1000),
            data: images
        }
    };
}
function saveImageErrorResult({ provider, model, status, startTime, error, requestBody = null, path = "/v1/images/generations" }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
        method: "POST",
        path,
        status,
        model: `${provider}/${model}`,
        provider,
        duration: Date.now() - startTime,
        error: typeof error === "string" ? error.slice(0, 500) : String(error).slice(0, 500),
        requestBody
    }).catch(()=>{});
    return {
        success: false,
        status,
        error
    };
}
/**
 * Fetch a single image endpoint and normalize response
 */ async function fetchImageEndpoint(url, headers, body, provider, log) {
    try {
        let response;
        try {
            response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchWithTimeout"])(url, {
                method: "POST",
                headers,
                body,
                timeoutMs: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getConfiguredTimeout"])()
            });
        } catch (err) {
            const isAbortError = typeof err === "object" && err !== null && "name" in err && err.name === "AbortError";
            if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$utils$2f$fetchTimeout$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["FetchTimeoutError"] || isAbortError) {
                const message = err instanceof Error ? err.message : String(err);
                if (log) {
                    log.error("IMAGE", `${provider} fetch error: ${message}`);
                }
                return {
                    success: false,
                    status: 504,
                    error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message || err)}`
                };
            }
            throw err;
        }
        if (!response.ok) {
            const errorText = await response.text();
            if (log) {
                log.error("IMAGE", `${provider} error ${response.status}: ${errorText.slice(0, 200)}`);
            }
            return {
                success: false,
                status: response.status,
                error: errorText
            };
        }
        const data = await response.json();
        // Normalize response to OpenAI format
        return {
            success: true,
            data: {
                created: data.created || Math.floor(Date.now() / 1000),
                data: data.data || []
            }
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (log) {
            log.error("IMAGE", `${provider} fetch error: ${message}`);
        }
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(message || err)}`
        };
    }
}
/**
 * Handle Hyperbolic image generation
 * Uses { model_name, prompt, height, width } and returns { images: [{ image: base64 }] }
 */ async function handleNanoBananaImageGeneration({ model, provider, providerConfig, body, credentials, log }) {
    const startTime = Date.now();
    const token = credentials.apiKey || credentials.accessToken;
    // Route to pro URL for "nanobanana-pro" model
    const isPro = model === "nanobanana-pro";
    const submitUrl = isPro && providerConfig.proUrl ? providerConfig.proUrl : providerConfig.baseUrl;
    const statusUrl = providerConfig.statusUrl;
    const aspectRatio = typeof body.aspectRatio === "string" ? body.aspectRatio : typeof body.aspect_ratio === "string" ? body.aspect_ratio : (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$translator$2f$image$2f$sizeMapper$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["mapImageSize"])(body.size);
    let resolution = typeof body.resolution === "string" ? body.resolution : inferResolutionFromSize(body.size) || "1K";
    if (body.quality === "hd" && resolution === "1K") {
        resolution = "2K";
    }
    const upstreamBody = isPro ? {
        prompt: body.prompt,
        resolution,
        aspectRatio,
        ...Array.isArray(body.imageUrls) ? {
            imageUrls: body.imageUrls
        } : {}
    } : {
        prompt: body.prompt,
        type: Array.isArray(body.imageUrls) && body.imageUrls.length > 0 ? "IMAGETOIAMGE" : "TEXTTOIAMGE",
        numImages: Number.isFinite(body.n) ? Math.max(1, Number(body.n)) : 1,
        image_size: aspectRatio,
        ...Array.isArray(body.imageUrls) ? {
            imageUrls: body.imageUrls
        } : {}
    };
    if (log) {
        const promptPreview = String(body.prompt ?? "").slice(0, 60);
        log.info("IMAGE", `${provider}/${model} (nanobanana ${isPro ? "pro" : "flash"}) | prompt: "${promptPreview}..."`);
    }
    try {
        const submitResp = await fetch(submitUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(upstreamBody)
        });
        if (!submitResp.ok) {
            const errorText = await submitResp.text();
            if (log) {
                log.error("IMAGE", `${provider} submit error ${submitResp.status}: ${errorText.slice(0, 200)}`);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: submitResp.status,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText.slice(0, 500)
            }).catch(()=>{});
            return {
                success: false,
                status: submitResp.status,
                error: errorText
            };
        }
        const submitData = await submitResp.json();
        // Backward compatibility: handle providers returning image payload synchronously
        const hasSyncPayload = Boolean(submitData?.image) || Array.isArray(submitData?.images) || Array.isArray(submitData?.data) || Boolean(submitData?.data?.[0]?.url) || Boolean(submitData?.data?.[0]?.b64_json);
        if (hasSyncPayload) {
            const syncResult = normalizeNanoBananaSyncPayload(submitData, body.prompt);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: 200,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                responseBody: {
                    images_count: syncResult.data?.length || 0,
                    mode: "sync"
                }
            }).catch(()=>{});
            return {
                success: true,
                data: {
                    created: Math.floor(Date.now() / 1000),
                    data: syncResult.data
                }
            };
        }
        const taskId = submitData?.data?.taskId || submitData?.taskId;
        if (!taskId) {
            const errorText = `NanoBanana submit did not return taskId: ${JSON.stringify(submitData).slice(0, 400)}`;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
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
        if (!statusUrl) {
            const errorText = "NanoBanana statusUrl is not configured";
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                method: "POST",
                path: "/v1/images/generations",
                status: 500,
                model: `${provider}/${model}`,
                provider,
                duration: Date.now() - startTime,
                error: errorText
            }).catch(()=>{});
            return {
                success: false,
                status: 500,
                error: errorText
            };
        }
        const timeoutMs = normalizePositiveNumber(body.timeout_ms, normalizePositiveNumber(process.env.NANOBANANA_POLL_TIMEOUT_MS, 120000));
        const pollIntervalMs = normalizePositiveNumber(body.poll_interval_ms, normalizePositiveNumber(process.env.NANOBANANA_POLL_INTERVAL_MS, 2500));
        let lastTaskData = null;
        const deadline = Date.now() + timeoutMs;
        while(Date.now() < deadline){
            const pollResp = await fetch(`${statusUrl}?taskId=${encodeURIComponent(taskId)}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!pollResp.ok) {
                const errorText = await pollResp.text();
                if (log) {
                    log.error("IMAGE", `${provider} poll error ${pollResp.status}: ${errorText.slice(0, 200)}`);
                }
                return {
                    success: false,
                    status: pollResp.status,
                    error: errorText
                };
            }
            const pollData = await pollResp.json();
            const taskData = pollData?.data || pollData;
            lastTaskData = taskData;
            const successFlag = Number(taskData?.successFlag);
            if (successFlag === 1) {
                const normalized = await normalizeNanoBananaTaskResult(taskData, body, log);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/images/generations",
                    status: 200,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    responseBody: {
                        images_count: normalized.length,
                        mode: "async",
                        taskId
                    }
                }).catch(()=>{});
                return {
                    success: true,
                    data: {
                        created: Math.floor(Date.now() / 1000),
                        data: normalized
                    }
                };
            }
            if (successFlag === 2 || successFlag === 3) {
                const errorText = taskData?.errorMessage || `NanoBanana task failed (successFlag=${String(successFlag)})`;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
                    method: "POST",
                    path: "/v1/images/generations",
                    status: 502,
                    model: `${provider}/${model}`,
                    provider,
                    duration: Date.now() - startTime,
                    error: errorText.slice(0, 500),
                    responseBody: {
                        taskId,
                        successFlag,
                        errorCode: taskData?.errorCode ?? null
                    }
                }).catch(()=>{});
                return {
                    success: false,
                    status: 502,
                    error: errorText
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$sleep$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sleep"])(pollIntervalMs);
        }
        const timeoutError = `NanoBanana task timeout after ${timeoutMs}ms (taskId=${taskId}, successFlag=${String(lastTaskData?.successFlag ?? "unknown")})`;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 504,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: timeoutError,
            responseBody: {
                taskId,
                lastSuccessFlag: lastTaskData?.successFlag ?? null
            }
        }).catch(()=>{});
        return {
            success: false,
            status: 504,
            error: timeoutError
        };
    } catch (err) {
        if (log) log.error("IMAGE", `${provider} fetch error: ${err.message}`);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$usage$2f$callLogs$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["saveCallLog"])({
            method: "POST",
            path: "/v1/images/generations",
            status: 502,
            model: `${provider}/${model}`,
            provider,
            duration: Date.now() - startTime,
            error: err.message
        }).catch(()=>{});
        return {
            success: false,
            status: 502,
            error: `Image provider error: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$open$2d$sse$2f$utils$2f$error$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["sanitizeErrorMessage"])(err.message || err)}`
        };
    }
}
function normalizeNanoBananaSyncPayload(data, prompt) {
    const images = [];
    if (data.image) {
        images.push({
            b64_json: data.image,
            revised_prompt: prompt
        });
    } else if (Array.isArray(data.images)) {
        for (const img of data.images){
            images.push({
                b64_json: typeof img === "string" ? img : img?.image || img?.data,
                revised_prompt: prompt
            });
        }
    } else if (Array.isArray(data.data)) {
        for (const img of data.data){
            if (!img) continue;
            images.push(img);
        }
    }
    return {
        data: images.filter(Boolean)
    };
}
async function normalizeNanoBananaTaskResult(taskData, body, log) {
    const response = taskData?.response || {};
    const urlCandidates = [
        response?.resultImageUrl,
        response?.originImageUrl,
        taskData?.resultImageUrl,
        taskData?.originImageUrl
    ].filter((v)=>typeof v === "string" && v.length > 0);
    if (Array.isArray(response?.resultImageUrls)) {
        for (const u of response.resultImageUrls){
            if (typeof u === "string" && u.length > 0) urlCandidates.push(u);
        }
    }
    const b64Candidates = [
        response?.resultImageBase64,
        response?.resultImage,
        taskData?.resultImageBase64,
        taskData?.resultImage
    ].filter((v)=>typeof v === "string" && v.length > 0);
    if (Array.isArray(response?.resultImageBase64List)) {
        for (const b64 of response.resultImageBase64List){
            if (typeof b64 === "string" && b64.length > 0) b64Candidates.push(b64);
        }
    }
    const wantsBase64 = body.response_format === "b64_json";
    if (wantsBase64) {
        if (b64Candidates.length > 0) {
            return b64Candidates.map((b64)=>({
                    b64_json: b64,
                    revised_prompt: body.prompt
                }));
        }
        if (urlCandidates.length > 0) {
            const firstUrl = urlCandidates[0];
            const remoteImage = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$shared$2f$network$2f$remoteImageFetch$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["fetchRemoteImage"])(firstUrl);
            const base64 = remoteImage.buffer.toString("base64");
            return [
                {
                    b64_json: base64,
                    revised_prompt: body.prompt
                }
            ];
        }
    }
    if (urlCandidates.length > 0) {
        return urlCandidates.map((url)=>({
                url,
                revised_prompt: body.prompt
            }));
    }
    if (b64Candidates.length > 0) {
        return b64Candidates.map((b64)=>({
                b64_json: b64,
                revised_prompt: body.prompt
            }));
    }
    if (log) {
        log.warn("IMAGE", `NanoBanana task completed without image payload: ${JSON.stringify(taskData).slice(0, 240)}`);
    }
    return [];
}
function inferResolutionFromSize(size) {
    if (typeof size !== "string") return null;
    const [wRaw, hRaw] = size.split("x");
    const width = Number(wRaw);
    const height = Number(hRaw);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
    const longestSide = Math.max(width, height);
    if (longestSide <= 1024) return "1K";
    if (longestSide <= 2048) return "2K";
    return "4K";
}
function normalizePositiveNumber(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.floor(n);
} /**
 * Handle SD WebUI image generation (local, no auth)
 * POST {baseUrl} with { prompt, negative_prompt, width, height, steps }
 * Response: { images: ["base64..."] }
 */ 
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

//# sourceMappingURL=open-sse_handlers_1augnne._.js.map
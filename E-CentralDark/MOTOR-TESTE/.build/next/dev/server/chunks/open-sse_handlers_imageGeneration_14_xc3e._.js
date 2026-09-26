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
];

//# sourceMappingURL=open-sse_handlers_imageGeneration_14_xc3e._.js.map
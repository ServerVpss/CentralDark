module.exports = [
"[externals]/node:https [external] (node:https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:https", () => require("node:https"));

module.exports = mod;
}),
"[externals]/node:https [external] (node:https, cjs) <export default as node_https>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "node_https",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$https__$5b$external$5d$__$28$node$3a$https$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$https__$5b$external$5d$__$28$node$3a$https$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:https [external] (node:https, cjs)");
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
}),
"[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setCredentialFeature",
    ()=>setCredentialFeature
]);
function setCredentialFeature(credentials, feature, value) {
    if (!credentials.$source) {
        credentials.$source = {};
    }
    credentials.$source[feature] = value;
    return credentials;
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProviderError",
    ()=>ProviderError
]);
class ProviderError extends Error {
    name = "ProviderError";
    tryNextLink;
    constructor(message, options = true){
        let logger;
        let tryNextLink = true;
        if (typeof options === "boolean") {
            logger = undefined;
            tryNextLink = options;
        } else if (options != null && typeof options === "object") {
            logger = options.logger;
            tryNextLink = options.tryNextLink ?? true;
        }
        super(message);
        this.tryNextLink = tryNextLink;
        Object.setPrototypeOf(this, ProviderError.prototype);
        logger?.debug?.(`@smithy/property-provider ${tryNextLink ? "->" : "(!)"} ${message}`);
    }
    static from(error, options = true) {
        return Object.assign(new this(error.message, options), error);
    }
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CredentialsProviderError",
    ()=>CredentialsProviderError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [instrumentation] (ecmascript)");
;
class CredentialsProviderError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ProviderError"] {
    name = "CredentialsProviderError";
    constructor(message, options = true){
        super(message, options);
        Object.setPrototypeOf(this, CredentialsProviderError.prototype);
    }
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/transport/httpResponse.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HttpResponse",
    ()=>HttpResponse
]);
class HttpResponse {
    statusCode;
    reason;
    headers;
    body;
    constructor(options){
        this.statusCode = options.statusCode;
        this.reason = options.reason;
        this.headers = options.headers || {};
        this.body = options.body;
    }
    static isInstance(response) {
        if (!response) return false;
        const resp = response;
        return typeof resp.statusCode === "number" && typeof resp.headers === "object";
    }
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/protocols/util-uri-escape/escape-uri.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "escapeUri",
    ()=>escapeUri
]);
const escapeUri = (uri)=>encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);
const hexEncode = (c)=>`%${c.charCodeAt(0).toString(16).toUpperCase()}`;
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/protocols/querystring-builder/buildQueryString.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildQueryString",
    ()=>buildQueryString
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$util$2d$uri$2d$escape$2f$escape$2d$uri$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/protocols/util-uri-escape/escape-uri.js [instrumentation] (ecmascript)");
;
function buildQueryString(query) {
    const parts = [];
    for (let key of Object.keys(query).sort()){
        const value = query[key];
        key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$util$2d$uri$2d$escape$2f$escape$2d$uri$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["escapeUri"])(key);
        if (Array.isArray(value)) {
            for(let i = 0, iLen = value.length; i < iLen; i++){
                parts.push(`${key}=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$util$2d$uri$2d$escape$2f$escape$2d$uri$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["escapeUri"])(value[i])}`);
            }
        } else {
            let qsEntry = key;
            if (value || typeof value === "string") {
                qsEntry += `=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$util$2d$uri$2d$escape$2f$escape$2d$uri$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["escapeUri"])(value)}`;
            }
            parts.push(qsEntry);
        }
    }
    return parts.join("&");
}
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/build-abort-error.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAbortError",
    ()=>buildAbortError
]);
function buildAbortError(abortSignal) {
    const reason = abortSignal && typeof abortSignal === "object" && "reason" in abortSignal ? abortSignal.reason : undefined;
    if (reason) {
        if (reason instanceof Error) {
            const abortError = new Error("Request aborted");
            abortError.name = "AbortError";
            abortError.cause = reason;
            return abortError;
        }
        const abortError = new Error(String(reason));
        abortError.name = "AbortError";
        return abortError;
    }
    const abortError = new Error("Request aborted");
    abortError.name = "AbortError";
    return abortError;
}
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/constants.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NODEJS_TIMEOUT_ERROR_CODES",
    ()=>NODEJS_TIMEOUT_ERROR_CODES
]);
const NODEJS_TIMEOUT_ERROR_CODES = [
    "ECONNRESET",
    "EPIPE",
    "ETIMEDOUT"
];
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/get-transformed-headers.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getTransformedHeaders",
    ()=>getTransformedHeaders
]);
const getTransformedHeaders = (headers)=>{
    const transformedHeaders = {};
    for(const name in headers){
        const headerValues = headers[name];
        transformedHeaders[name] = Array.isArray(headerValues) ? headerValues.join(",") : headerValues;
    }
    return transformedHeaders;
};
;
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "timing",
    ()=>timing
]);
const timing = {
    setTimeout: (cb, ms)=>setTimeout(cb, ms),
    clearTimeout: (timeoutId)=>clearTimeout(timeoutId)
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/set-connection-timeout.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setConnectionTimeout",
    ()=>setConnectionTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [instrumentation] (ecmascript)");
;
const DEFER_EVENT_LISTENER_TIME = 1000;
const setConnectionTimeout = (request, reject, timeoutInMs = 0)=>{
    if (!timeoutInMs) {
        return -1;
    }
    const registerTimeout = (offset)=>{
        const timeoutId = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].setTimeout(()=>{
            request.destroy();
            reject(Object.assign(new Error(`@smithy/node-http-handler - the request socket did not establish a connection with the server within the configured timeout of ${timeoutInMs} ms.`), {
                name: "TimeoutError"
            }));
        }, timeoutInMs - offset);
        const doWithSocket = (socket)=>{
            if (socket?.connecting) {
                socket.on("connect", ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(timeoutId);
                });
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(timeoutId);
            }
        };
        if (request.socket) {
            doWithSocket(request.socket);
        } else {
            request.on("socket", doWithSocket);
        }
    };
    if (timeoutInMs < 2000) {
        registerTimeout(0);
        return 0;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].setTimeout(registerTimeout.bind(null, DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/set-request-timeout.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setRequestTimeout",
    ()=>setRequestTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [instrumentation] (ecmascript)");
;
const setRequestTimeout = (req, reject, timeoutInMs = 0, throwOnRequestTimeout, logger)=>{
    if (timeoutInMs) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].setTimeout(()=>{
            let msg = `@smithy/node-http-handler - [${throwOnRequestTimeout ? "ERROR" : "WARN"}] a request has exceeded the configured ${timeoutInMs} ms requestTimeout.`;
            if (throwOnRequestTimeout) {
                const error = Object.assign(new Error(msg), {
                    name: "TimeoutError",
                    code: "ETIMEDOUT"
                });
                req.destroy(error);
                reject(error);
            } else {
                msg += ` Init client requestHandler with throwOnRequestTimeout=true to turn this into an error.`;
                logger?.warn?.(msg);
            }
        }, timeoutInMs);
    }
    return -1;
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/set-socket-keep-alive.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setSocketKeepAlive",
    ()=>setSocketKeepAlive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [instrumentation] (ecmascript)");
;
const DEFER_EVENT_LISTENER_TIME = 3000;
const setSocketKeepAlive = (request, { keepAlive, keepAliveMsecs }, deferTimeMs = DEFER_EVENT_LISTENER_TIME)=>{
    if (keepAlive !== true) {
        return -1;
    }
    const registerListener = ()=>{
        if (request.socket) {
            request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
        } else {
            request.on("socket", (socket)=>{
                socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
            });
        }
    };
    if (deferTimeMs === 0) {
        registerListener();
        return 0;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].setTimeout(registerListener, deferTimeMs);
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/set-socket-timeout.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setSocketTimeout",
    ()=>setSocketTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [instrumentation] (ecmascript)");
;
const DEFER_EVENT_LISTENER_TIME = 3000;
const setSocketTimeout = (request, reject, timeoutInMs = 0)=>{
    const registerTimeout = (offset)=>{
        const timeout = timeoutInMs - offset;
        const onTimeout = ()=>{
            request.destroy();
            reject(Object.assign(new Error(`@smithy/node-http-handler - the request socket timed out after ${timeoutInMs} ms of inactivity (configured by client requestHandler).`), {
                name: "TimeoutError"
            }));
        };
        if (request.socket) {
            request.socket.setTimeout(timeout, onTimeout);
            request.on("close", ()=>request.socket?.removeListener("timeout", onTimeout));
        } else {
            request.setTimeout(timeout, onTimeout);
        }
    };
    if (0 < timeoutInMs && timeoutInMs < 6000) {
        registerTimeout(0);
        return 0;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/write-request-body.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "writeRequestBody",
    ()=>writeRequestBody
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:stream [external] (node:stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [instrumentation] (ecmascript)");
;
;
const MIN_WAIT_TIME = 6_000;
async function writeRequestBody(httpRequest, request, maxContinueTimeoutMs = MIN_WAIT_TIME, externalAgent = false) {
    const headers = request.headers;
    const expect = headers ? headers.Expect || headers.expect : undefined;
    let timeoutId = -1;
    let sendBody = true;
    if (!externalAgent && expect === "100-continue") {
        sendBody = await Promise.race([
            new Promise((resolve)=>{
                timeoutId = Number(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].setTimeout(()=>resolve(true), Math.max(MIN_WAIT_TIME, maxContinueTimeoutMs)));
            }),
            new Promise((resolve)=>{
                httpRequest.on("continue", ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(timeoutId);
                    resolve(true);
                });
                httpRequest.on("response", ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(timeoutId);
                    resolve(false);
                });
                httpRequest.on("error", ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(timeoutId);
                    resolve(false);
                });
            })
        ]);
    }
    if (sendBody) {
        writeBody(httpRequest, request.body);
    }
}
function writeBody(httpRequest, body) {
    if (body instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Readable"]) {
        body.pipe(httpRequest);
        return;
    }
    if (body) {
        const isBuffer = Buffer.isBuffer(body);
        const isString = typeof body === "string";
        if (isBuffer || isString) {
            if (isBuffer && body.byteLength === 0) {
                httpRequest.end();
            } else {
                httpRequest.end(body);
            }
            return;
        }
        const uint8 = body;
        if (typeof uint8 === "object" && uint8.buffer && typeof uint8.byteOffset === "number" && typeof uint8.byteLength === "number") {
            httpRequest.end(Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength));
            return;
        }
        httpRequest.end(Buffer.from(body));
        return;
    }
    httpRequest.end();
}
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_REQUEST_TIMEOUT",
    ()=>DEFAULT_REQUEST_TIMEOUT,
    "NodeHttpHandler",
    ()=>NodeHttpHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$httpResponse$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/httpResponse.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$querystring$2d$builder$2f$buildQueryString$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/protocols/querystring-builder/buildQueryString.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$build$2d$abort$2d$error$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/build-abort-error.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/constants.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$get$2d$transformed$2d$headers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/get-transformed-headers.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$https__$5b$external$5d$__$28$node$3a$https$2c$__cjs$29$__$3c$export__default__as__node_https$3e$__ = __turbopack_context__.i("[externals]/node:https [external] (node:https, cjs) <export default as node_https>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$connection$2d$timeout$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/set-connection-timeout.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$request$2d$timeout$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/set-request-timeout.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$socket$2d$keep$2d$alive$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/set-socket-keep-alive.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$socket$2d$timeout$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/set-socket-timeout.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$write$2d$request$2d$body$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/write-request-body.js [instrumentation] (ecmascript)");
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
const DEFAULT_REQUEST_TIMEOUT = 0;
let hAgent = undefined;
let hRequest = undefined;
class NodeHttpHandler {
    config;
    configProvider;
    socketWarningTimestamp = 0;
    externalAgent = false;
    metadata = {
        handlerProtocol: "http/1.1"
    };
    static create(instanceOrOptions) {
        if (typeof instanceOrOptions?.handle === "function") {
            return instanceOrOptions;
        }
        return new NodeHttpHandler(instanceOrOptions);
    }
    static checkSocketUsage(agent, socketWarningTimestamp, logger = console) {
        const { sockets, requests, maxSockets } = agent;
        if (typeof maxSockets !== "number" || maxSockets === Infinity) {
            return socketWarningTimestamp;
        }
        const interval = 15_000;
        if (Date.now() - interval < socketWarningTimestamp) {
            return socketWarningTimestamp;
        }
        if (sockets && requests) {
            for(const origin in sockets){
                const socketsInUse = sockets[origin]?.length ?? 0;
                const requestsEnqueued = requests[origin]?.length ?? 0;
                if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
                    logger?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued.
See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.`);
                    return Date.now();
                }
            }
        }
        return socketWarningTimestamp;
    }
    constructor(options){
        this.configProvider = new Promise((resolve, reject)=>{
            if (typeof options === "function") {
                options().then((_options)=>{
                    resolve(this.resolveDefaultConfig(_options));
                }).catch(reject);
            } else {
                resolve(this.resolveDefaultConfig(options));
            }
        });
    }
    destroy() {
        this.config?.httpAgent?.destroy();
        this.config?.httpsAgent?.destroy();
    }
    async handle(request, { abortSignal, requestTimeout } = {}) {
        if (!this.config) {
            this.config = await this.configProvider;
        }
        const config = this.config;
        const isSSL = request.protocol === "https:";
        if (!isSSL && !this.config.httpAgent) {
            this.config.httpAgent = await this.config.httpAgentProvider();
        }
        return new Promise((_resolve, _reject)=>{
            let writeRequestBodyPromise = undefined;
            let socketWarningTimeoutId = -1;
            let connectionTimeoutId = -1;
            let requestTimeoutId = -1;
            let socketTimeoutId = -1;
            let keepAliveTimeoutId = -1;
            const clearTimeouts = ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(socketWarningTimeoutId);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(connectionTimeoutId);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(requestTimeoutId);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(socketTimeoutId);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].clearTimeout(keepAliveTimeoutId);
            };
            const resolve = async (arg)=>{
                await writeRequestBodyPromise;
                clearTimeouts();
                _resolve(arg);
            };
            const reject = async (arg)=>{
                await writeRequestBodyPromise;
                clearTimeouts();
                _reject(arg);
            };
            if (abortSignal?.aborted) {
                const abortError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$build$2d$abort$2d$error$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAbortError"])(abortSignal);
                reject(abortError);
                return;
            }
            const headers = request.headers;
            const expectContinue = headers ? (headers.Expect ?? headers.expect) === "100-continue" : false;
            let agent = isSSL ? config.httpsAgent : config.httpAgent;
            if (expectContinue && !this.externalAgent) {
                agent = new (isSSL ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$https__$5b$external$5d$__$28$node$3a$https$2c$__cjs$29$__$3c$export__default__as__node_https$3e$__["node_https"].Agent : hAgent)({
                    keepAlive: false,
                    maxSockets: Infinity
                });
            }
            socketWarningTimeoutId = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["timing"].setTimeout(()=>{
                this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(agent, this.socketWarningTimestamp, config.logger);
            }, config.socketAcquisitionWarningTimeout ?? (config.requestTimeout ?? 2000) + (config.connectionTimeout ?? 1000));
            const queryString = request.query ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$querystring$2d$builder$2f$buildQueryString$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildQueryString"])(request.query) : "";
            let auth = undefined;
            if (request.username != null || request.password != null) {
                const username = request.username ?? "";
                const password = request.password ?? "";
                auth = `${username}:${password}`;
            }
            let path = request.path;
            if (queryString) {
                path += `?${queryString}`;
            }
            if (request.fragment) {
                path += `#${request.fragment}`;
            }
            let hostname = request.hostname ?? "";
            if (hostname[0] === "[" && hostname.endsWith("]")) {
                hostname = request.hostname.slice(1, -1);
            } else {
                hostname = request.hostname;
            }
            const nodeHttpsOptions = {
                headers: request.headers,
                host: hostname,
                method: request.method,
                path,
                port: request.port,
                agent,
                auth
            };
            const requestFunc = isSSL ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$https__$5b$external$5d$__$28$node$3a$https$2c$__cjs$29$__$3c$export__default__as__node_https$3e$__["node_https"].request : hRequest;
            const req = requestFunc(nodeHttpsOptions, (res)=>{
                const httpResponse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$httpResponse$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HttpResponse"]({
                    statusCode: res.statusCode || -1,
                    reason: res.statusMessage,
                    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$get$2d$transformed$2d$headers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getTransformedHeaders"])(res.headers),
                    body: res
                });
                resolve({
                    response: httpResponse
                });
            });
            req.on("error", (err)=>{
                if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["NODEJS_TIMEOUT_ERROR_CODES"].includes(err.code)) {
                    reject(Object.assign(err, {
                        name: "TimeoutError"
                    }));
                } else {
                    reject(err);
                }
            });
            if (abortSignal) {
                const onAbort = ()=>{
                    req.destroy();
                    const abortError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$build$2d$abort$2d$error$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["buildAbortError"])(abortSignal);
                    reject(abortError);
                };
                if (typeof abortSignal.addEventListener === "function") {
                    const signal = abortSignal;
                    signal.addEventListener("abort", onAbort, {
                        once: true
                    });
                    req.once("close", ()=>signal.removeEventListener("abort", onAbort));
                } else {
                    abortSignal.onabort = onAbort;
                }
            }
            const effectiveRequestTimeout = requestTimeout ?? config.requestTimeout;
            connectionTimeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$connection$2d$timeout$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["setConnectionTimeout"])(req, reject, config.connectionTimeout);
            requestTimeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$request$2d$timeout$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["setRequestTimeout"])(req, reject, effectiveRequestTimeout, config.throwOnRequestTimeout, config.logger ?? console);
            socketTimeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$socket$2d$timeout$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["setSocketTimeout"])(req, reject, config.socketTimeout);
            const httpAgent = nodeHttpsOptions.agent;
            if (typeof httpAgent === "object" && "keepAlive" in httpAgent) {
                keepAliveTimeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$socket$2d$keep$2d$alive$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["setSocketKeepAlive"])(req, {
                    keepAlive: httpAgent.keepAlive,
                    keepAliveMsecs: httpAgent.keepAliveMsecs
                });
            }
            writeRequestBodyPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$write$2d$request$2d$body$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["writeRequestBody"])(req, request, effectiveRequestTimeout, this.externalAgent).catch((e)=>{
                clearTimeouts();
                return _reject(e);
            });
        });
    }
    updateHttpClientConfig(key, value) {
        this.config = undefined;
        this.configProvider = this.configProvider.then((config)=>{
            return {
                ...config,
                [key]: value
            };
        });
    }
    httpHandlerConfigs() {
        return this.config ?? {};
    }
    resolveDefaultConfig(options) {
        const { requestTimeout, connectionTimeout, socketTimeout, socketAcquisitionWarningTimeout, httpAgent, httpsAgent, throwOnRequestTimeout, logger } = options || {};
        const keepAlive = true;
        const maxSockets = 50;
        return {
            connectionTimeout,
            requestTimeout,
            socketTimeout,
            socketAcquisitionWarningTimeout,
            throwOnRequestTimeout,
            httpAgentProvider: async ()=>{
                const node_http = await __turbopack_context__.A("[externals]/node:http [external] (node:http, cjs, async loader)");
                const { Agent, request } = node_http.default ?? node_http;
                hRequest = request;
                hAgent = Agent;
                if (httpAgent instanceof hAgent || typeof httpAgent?.destroy === "function") {
                    this.externalAgent = true;
                    return httpAgent;
                }
                return new hAgent({
                    keepAlive,
                    maxSockets,
                    ...httpAgent
                });
            },
            httpsAgent: (()=>{
                if (httpsAgent instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$https__$5b$external$5d$__$28$node$3a$https$2c$__cjs$29$__$3c$export__default__as__node_https$3e$__["node_https"].Agent || typeof httpsAgent?.destroy === "function") {
                    this.externalAgent = true;
                    return httpsAgent;
                }
                return new __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$https__$5b$external$5d$__$28$node$3a$https$2c$__cjs$29$__$3c$export__default__as__node_https$3e$__["node_https"].Agent({
                    keepAlive,
                    maxSockets,
                    ...httpsAgent
                });
            })(),
            logger
        };
    }
}
}),
"[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/checkUrl.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkUrl",
    ()=>checkUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
;
const LOOPBACK_CIDR_IPv4 = "127.0.0.0/8";
const LOOPBACK_CIDR_IPv6 = "::1/128";
const ECS_CONTAINER_HOST = "169.254.170.2";
const EKS_CONTAINER_HOST_IPv4 = "169.254.170.23";
const EKS_CONTAINER_HOST_IPv6 = "[fd00:ec2::23]";
const checkUrl = (url, logger)=>{
    if (url.protocol === "https:") {
        return;
    }
    if (url.hostname === ECS_CONTAINER_HOST || url.hostname === EKS_CONTAINER_HOST_IPv4 || url.hostname === EKS_CONTAINER_HOST_IPv6) {
        return;
    }
    if (url.hostname.includes("[")) {
        if (url.hostname === "[::1]" || url.hostname === "[0000:0000:0000:0000:0000:0000:0000:0001]") {
            return;
        }
    } else {
        if (url.hostname === "localhost") {
            return;
        }
        const ipComponents = url.hostname.split(".");
        const inRange = (component)=>{
            const num = parseInt(component, 10);
            return 0 <= num && num <= 255;
        };
        if (ipComponents[0] === "127" && inRange(ipComponents[1]) && inRange(ipComponents[2]) && inRange(ipComponents[3]) && ipComponents.length === 4) {
            return;
        }
    }
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`URL not accepted. It must either be HTTPS or match one of the following:
  - loopback CIDR 127.0.0.0/8 or [::1/128]
  - ECS container host 169.254.170.2
  - EKS container host 169.254.170.23 or [fd00:ec2::23]`, {
        logger
    });
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/transport/httpRequest.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HttpRequest",
    ()=>HttpRequest
]);
class HttpRequest {
    method;
    protocol;
    hostname;
    port;
    path;
    query;
    headers;
    username;
    password;
    fragment;
    body;
    constructor(options){
        this.method = options.method || "GET";
        this.hostname = options.hostname || "localhost";
        this.port = options.port;
        this.query = options.query || {};
        this.headers = options.headers || {};
        this.body = options.body;
        this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
        this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
        this.username = options.username;
        this.password = options.password;
        this.fragment = options.fragment;
    }
    static clone(request) {
        const cloned = new HttpRequest({
            ...request,
            headers: {
                ...request.headers
            }
        });
        if (cloned.query) {
            cloned.query = cloneQuery(cloned.query);
        }
        return cloned;
    }
    static isInstance(request) {
        if (!request) {
            return false;
        }
        const req = request;
        return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
    }
    clone() {
        return HttpRequest.clone(this);
    }
}
function cloneQuery(query) {
    return Object.keys(query).reduce((carry, paramName)=>{
        const param = query[paramName];
        return {
            ...carry,
            [paramName]: Array.isArray(param) ? [
                ...param
            ] : param
        };
    }, {});
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/parse-utils.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "expectBoolean",
    ()=>expectBoolean,
    "expectByte",
    ()=>expectByte,
    "expectFloat32",
    ()=>expectFloat32,
    "expectInt",
    ()=>expectInt,
    "expectInt32",
    ()=>expectInt32,
    "expectLong",
    ()=>expectLong,
    "expectNonNull",
    ()=>expectNonNull,
    "expectNumber",
    ()=>expectNumber,
    "expectObject",
    ()=>expectObject,
    "expectShort",
    ()=>expectShort,
    "expectString",
    ()=>expectString,
    "expectUnion",
    ()=>expectUnion,
    "handleFloat",
    ()=>handleFloat,
    "limitedParseDouble",
    ()=>limitedParseDouble,
    "limitedParseFloat",
    ()=>limitedParseFloat,
    "limitedParseFloat32",
    ()=>limitedParseFloat32,
    "logger",
    ()=>logger,
    "parseBoolean",
    ()=>parseBoolean,
    "strictParseByte",
    ()=>strictParseByte,
    "strictParseDouble",
    ()=>strictParseDouble,
    "strictParseFloat",
    ()=>strictParseFloat,
    "strictParseFloat32",
    ()=>strictParseFloat32,
    "strictParseInt",
    ()=>strictParseInt,
    "strictParseInt32",
    ()=>strictParseInt32,
    "strictParseLong",
    ()=>strictParseLong,
    "strictParseShort",
    ()=>strictParseShort
]);
const parseBoolean = (value)=>{
    switch(value){
        case "true":
            return true;
        case "false":
            return false;
        default:
            throw new Error(`Unable to parse boolean value "${value}"`);
    }
};
const expectBoolean = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === "number") {
        if (value === 0 || value === 1) {
            logger.warn(stackTraceWarning(`Expected boolean, got ${typeof value}: ${value}`));
        }
        if (value === 0) {
            return false;
        }
        if (value === 1) {
            return true;
        }
    }
    if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (lower === "false" || lower === "true") {
            logger.warn(stackTraceWarning(`Expected boolean, got ${typeof value}: ${value}`));
        }
        if (lower === "false") {
            return false;
        }
        if (lower === "true") {
            return true;
        }
    }
    if (typeof value === "boolean") {
        return value;
    }
    throw new TypeError(`Expected boolean, got ${typeof value}: ${value}`);
};
const expectNumber = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === "string") {
        const parsed = parseFloat(value);
        if (!Number.isNaN(parsed)) {
            if (String(parsed) !== String(value)) {
                logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
            }
            return parsed;
        }
    }
    if (typeof value === "number") {
        return value;
    }
    throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
};
const MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
const expectFloat32 = (value)=>{
    const expected = expectNumber(value);
    if (expected !== undefined && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
        if (Math.abs(expected) > MAX_FLOAT) {
            throw new TypeError(`Expected 32-bit float, got ${value}`);
        }
    }
    return expected;
};
const expectLong = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    if (Number.isInteger(value) && !Number.isNaN(value)) {
        return value;
    }
    throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
};
const expectInt = expectLong;
const expectInt32 = (value)=>expectSizedInt(value, 32);
const expectShort = (value)=>expectSizedInt(value, 16);
const expectByte = (value)=>expectSizedInt(value, 8);
const expectSizedInt = (value, size)=>{
    const expected = expectLong(value);
    if (expected !== undefined && castInt(expected, size) !== expected) {
        throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
    }
    return expected;
};
const castInt = (value, size)=>{
    switch(size){
        case 32:
            return Int32Array.of(value)[0];
        case 16:
            return Int16Array.of(value)[0];
        case 8:
            return Int8Array.of(value)[0];
    }
};
const expectNonNull = (value, location)=>{
    if (value === null || value === undefined) {
        if (location) {
            throw new TypeError(`Expected a non-null value for ${location}`);
        }
        throw new TypeError("Expected a non-null value");
    }
    return value;
};
const expectObject = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === "object" && !Array.isArray(value)) {
        return value;
    }
    const receivedType = Array.isArray(value) ? "array" : typeof value;
    throw new TypeError(`Expected object, got ${receivedType}: ${value}`);
};
const expectString = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value === "string") {
        return value;
    }
    if ([
        "boolean",
        "number",
        "bigint"
    ].includes(typeof value)) {
        logger.warn(stackTraceWarning(`Expected string, got ${typeof value}: ${value}`));
        return String(value);
    }
    throw new TypeError(`Expected string, got ${typeof value}: ${value}`);
};
const expectUnion = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    const asObject = expectObject(value);
    const setKeys = [];
    for(const k in asObject){
        if (asObject[k] != null) {
            setKeys.push(k);
        }
    }
    if (setKeys.length === 0) {
        throw new TypeError(`Unions must have exactly one non-null member. None were found.`);
    }
    if (setKeys.length > 1) {
        throw new TypeError(`Unions must have exactly one non-null member. Keys ${setKeys} were not null.`);
    }
    return asObject;
};
const strictParseDouble = (value)=>{
    if (typeof value == "string") {
        return expectNumber(parseNumber(value));
    }
    return expectNumber(value);
};
const strictParseFloat = strictParseDouble;
const strictParseFloat32 = (value)=>{
    if (typeof value == "string") {
        return expectFloat32(parseNumber(value));
    }
    return expectFloat32(value);
};
const NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
const parseNumber = (value)=>{
    const matches = value.match(NUMBER_REGEX);
    if (matches === null || matches[0].length !== value.length) {
        throw new TypeError(`Expected real number, got implicit NaN`);
    }
    return parseFloat(value);
};
const limitedParseDouble = (value)=>{
    if (typeof value == "string") {
        return parseFloatString(value);
    }
    return expectNumber(value);
};
const handleFloat = limitedParseDouble;
const limitedParseFloat = limitedParseDouble;
const limitedParseFloat32 = (value)=>{
    if (typeof value == "string") {
        return parseFloatString(value);
    }
    return expectFloat32(value);
};
const parseFloatString = (value)=>{
    switch(value){
        case "NaN":
            return NaN;
        case "Infinity":
            return Infinity;
        case "-Infinity":
            return -Infinity;
        default:
            throw new Error(`Unable to parse float value: ${value}`);
    }
};
const strictParseLong = (value)=>{
    if (typeof value === "string") {
        return expectLong(parseNumber(value));
    }
    return expectLong(value);
};
const strictParseInt = strictParseLong;
const strictParseInt32 = (value)=>{
    if (typeof value === "string") {
        return expectInt32(parseNumber(value));
    }
    return expectInt32(value);
};
const strictParseShort = (value)=>{
    if (typeof value === "string") {
        return expectShort(parseNumber(value));
    }
    return expectShort(value);
};
const strictParseByte = (value)=>{
    if (typeof value === "string") {
        return expectByte(parseNumber(value));
    }
    return expectByte(value);
};
const stackTraceWarning = (message)=>{
    return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter((s)=>!s.includes("stackTraceWarning")).join("\n");
};
const logger = {
    warn: console.warn
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dateToUtcString",
    ()=>dateToUtcString,
    "parseEpochTimestamp",
    ()=>parseEpochTimestamp,
    "parseRfc3339DateTime",
    ()=>parseRfc3339DateTime,
    "parseRfc3339DateTimeWithOffset",
    ()=>parseRfc3339DateTimeWithOffset,
    "parseRfc7231DateTime",
    ()=>parseRfc7231DateTime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/parse-utils.js [instrumentation] (ecmascript)");
;
const DAYS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
];
const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];
function dateToUtcString(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const dayOfWeek = date.getUTCDay();
    const dayOfMonthInt = date.getUTCDate();
    const hoursInt = date.getUTCHours();
    const minutesInt = date.getUTCMinutes();
    const secondsInt = date.getUTCSeconds();
    const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
    const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
    const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
    const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
    return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year} ${hoursString}:${minutesString}:${secondsString} GMT`;
}
const RFC3339 = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/);
const parseRfc3339DateTime = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value !== "string") {
        throw new TypeError("RFC-3339 date-times must be expressed as strings");
    }
    const match = RFC3339.exec(value);
    if (!match) {
        throw new TypeError("Invalid RFC-3339 date-time value");
    }
    const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds] = match;
    const year = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["strictParseShort"])(stripLeadingZeroes(yearStr));
    const month = parseDateValue(monthStr, "month", 1, 12);
    const day = parseDateValue(dayStr, "day", 1, 31);
    return buildDate(year, month, day, {
        hours,
        minutes,
        seconds,
        fractionalMilliseconds
    });
};
const RFC3339_WITH_OFFSET = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}:\d{2})|[zZ])$/);
const parseRfc3339DateTimeWithOffset = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value !== "string") {
        throw new TypeError("RFC-3339 date-times must be expressed as strings");
    }
    const match = RFC3339_WITH_OFFSET.exec(value);
    if (!match) {
        throw new TypeError("Invalid RFC-3339 date-time value");
    }
    const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, offsetStr] = match;
    const year = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["strictParseShort"])(stripLeadingZeroes(yearStr));
    const month = parseDateValue(monthStr, "month", 1, 12);
    const day = parseDateValue(dayStr, "day", 1, 31);
    const date = buildDate(year, month, day, {
        hours,
        minutes,
        seconds,
        fractionalMilliseconds
    });
    if (offsetStr.toUpperCase() != "Z") {
        date.setTime(date.getTime() - parseOffsetToMilliseconds(offsetStr));
    }
    return date;
};
const IMF_FIXDATE = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
const RFC_850_DATE = new RegExp(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
const ASC_TIME = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/);
const parseRfc7231DateTime = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    if (typeof value !== "string") {
        throw new TypeError("RFC-7231 date-times must be expressed as strings");
    }
    let match = IMF_FIXDATE.exec(value);
    if (match) {
        const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
        return buildDate((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["strictParseShort"])(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
            hours,
            minutes,
            seconds,
            fractionalMilliseconds
        });
    }
    match = RFC_850_DATE.exec(value);
    if (match) {
        const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
        return adjustRfc850Year(buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
            hours,
            minutes,
            seconds,
            fractionalMilliseconds
        }));
    }
    match = ASC_TIME.exec(value);
    if (match) {
        const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match;
        return buildDate((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["strictParseShort"])(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr.trimLeft(), "day", 1, 31), {
            hours,
            minutes,
            seconds,
            fractionalMilliseconds
        });
    }
    throw new TypeError("Invalid RFC-7231 date-time value");
};
const parseEpochTimestamp = (value)=>{
    if (value === null || value === undefined) {
        return undefined;
    }
    let valueAsDouble;
    if (typeof value === "number") {
        valueAsDouble = value;
    } else if (typeof value === "string") {
        valueAsDouble = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["strictParseDouble"])(value);
    } else if (typeof value === "object" && value.tag === 1) {
        valueAsDouble = value.value;
    } else {
        throw new TypeError("Epoch timestamps must be expressed as floating point numbers or their string representation");
    }
    if (Number.isNaN(valueAsDouble) || valueAsDouble === Infinity || valueAsDouble === -Infinity) {
        throw new TypeError("Epoch timestamps must be valid, non-Infinite, non-NaN numerics");
    }
    return new Date(Math.round(valueAsDouble * 1000));
};
const buildDate = (year, month, day, time)=>{
    const adjustedMonth = month - 1;
    validateDayOfMonth(year, adjustedMonth, day);
    return new Date(Date.UTC(year, adjustedMonth, day, parseDateValue(time.hours, "hour", 0, 23), parseDateValue(time.minutes, "minute", 0, 59), parseDateValue(time.seconds, "seconds", 0, 60), parseMilliseconds(time.fractionalMilliseconds)));
};
const parseTwoDigitYear = (value)=>{
    const thisYear = new Date().getUTCFullYear();
    const valueInThisCentury = Math.floor(thisYear / 100) * 100 + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["strictParseShort"])(stripLeadingZeroes(value));
    if (valueInThisCentury < thisYear) {
        return valueInThisCentury + 100;
    }
    return valueInThisCentury;
};
const FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1000;
const adjustRfc850Year = (input)=>{
    if (input.getTime() - new Date().getTime() > FIFTY_YEARS_IN_MILLIS) {
        return new Date(Date.UTC(input.getUTCFullYear() - 100, input.getUTCMonth(), input.getUTCDate(), input.getUTCHours(), input.getUTCMinutes(), input.getUTCSeconds(), input.getUTCMilliseconds()));
    }
    return input;
};
const parseMonthByShortName = (value)=>{
    const monthIdx = MONTHS.indexOf(value);
    if (monthIdx < 0) {
        throw new TypeError(`Invalid month: ${value}`);
    }
    return monthIdx + 1;
};
const DAYS_IN_MONTH = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
];
const validateDayOfMonth = (year, month, day)=>{
    let maxDays = DAYS_IN_MONTH[month];
    if (month === 1 && isLeapYear(year)) {
        maxDays = 29;
    }
    if (day > maxDays) {
        throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year}: ${day}`);
    }
};
const isLeapYear = (year)=>{
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};
const parseDateValue = (value, type, lower, upper)=>{
    const dateVal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["strictParseByte"])(stripLeadingZeroes(value));
    if (dateVal < lower || dateVal > upper) {
        throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
    }
    return dateVal;
};
const parseMilliseconds = (value)=>{
    if (value === null || value === undefined) {
        return 0;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$parse$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["strictParseFloat32"])("0." + value) * 1000;
};
const parseOffsetToMilliseconds = (value)=>{
    const directionStr = value[0];
    let direction = 1;
    if (directionStr == "+") {
        direction = 1;
    } else if (directionStr == "-") {
        direction = -1;
    } else {
        throw new TypeError(`Offset direction, ${directionStr}, must be "+" or "-"`);
    }
    const hour = Number(value.substring(1, 3));
    const minute = Number(value.substring(4, 6));
    return direction * (hour * 60 + minute) * 60 * 1000;
};
const stripLeadingZeroes = (value)=>{
    let idx = 0;
    while(idx < value.length - 1 && value.charAt(idx) === "0"){
        idx++;
    }
    if (idx === 0) {
        return value;
    }
    return value.slice(idx);
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/is-array-buffer/is-array-buffer.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isArrayBuffer",
    ()=>isArrayBuffer
]);
const isArrayBuffer = (arg)=>typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-buffer-from/buffer-from.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromArrayBuffer",
    ()=>fromArrayBuffer,
    "fromString",
    ()=>fromString
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$is$2d$array$2d$buffer$2f$is$2d$array$2d$buffer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/is-array-buffer/is-array-buffer.js [instrumentation] (ecmascript)");
;
const fromArrayBuffer = (input, offset = 0, length = input.byteLength - offset)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$is$2d$array$2d$buffer$2f$is$2d$array$2d$buffer$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isArrayBuffer"])(input)) {
        throw new TypeError(`The "input" argument must be ArrayBuffer. Received type ${typeof input} (${input})`);
    }
    return Buffer.from(input, offset, length);
};
const fromString = (input, encoding)=>{
    if (typeof input !== "string") {
        throw new TypeError(`The "input" argument must be of type string. Received type ${typeof input} (${input})`);
    }
    return encoding ? Buffer.from(input, encoding) : Buffer.from(input);
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.browser.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromUtf8",
    ()=>fromUtf8
]);
const fromUtf8 = (input)=>new TextEncoder().encode(input);
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/constants-for-browser.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "alphabetByEncoding",
    ()=>alphabetByEncoding,
    "alphabetByValue",
    ()=>alphabetByValue,
    "bitsPerByte",
    ()=>bitsPerByte,
    "bitsPerLetter",
    ()=>bitsPerLetter,
    "maxLetterValue",
    ()=>maxLetterValue
]);
const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
const alphabetByEncoding = Object.entries(chars).reduce((acc, [i, c])=>{
    acc[c] = Number(i);
    return acc;
}, {});
const alphabetByValue = chars.split("");
const bitsPerLetter = 6;
const bitsPerByte = 8;
const maxLetterValue = 0b111111;
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.browser.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toBase64",
    ()=>toBase64
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$utf8$2f$fromUtf8$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.browser.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$constants$2d$for$2d$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/constants-for-browser.js [instrumentation] (ecmascript)");
;
;
function toBase64(_input) {
    let input;
    if (typeof _input === "string") {
        input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$utf8$2f$fromUtf8$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromUtf8"])(_input);
    } else {
        input = _input;
    }
    const isArrayLike = typeof input === "object" && typeof input.length === "number";
    const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
    if (!isArrayLike && !isUint8Array) {
        throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
    }
    let str = "";
    for(let i = 0; i < input.length; i += 3){
        let bits = 0;
        let bitLength = 0;
        for(let j = i, limit = Math.min(i + 3, input.length); j < limit; j++){
            bits |= input[j] << (limit - j - 1) * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$constants$2d$for$2d$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bitsPerByte"];
            bitLength += __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$constants$2d$for$2d$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bitsPerByte"];
        }
        const bitClusterCount = Math.ceil(bitLength / __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$constants$2d$for$2d$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bitsPerLetter"]);
        bits <<= bitClusterCount * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$constants$2d$for$2d$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bitsPerLetter"] - bitLength;
        for(let k = 1; k <= bitClusterCount; k++){
            const offset = (bitClusterCount - k) * __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$constants$2d$for$2d$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["bitsPerLetter"];
            str += __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$constants$2d$for$2d$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["alphabetByValue"][(bits & __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$constants$2d$for$2d$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["maxLetterValue"] << offset) >> offset];
        }
        str += "==".slice(0, 4 - bitClusterCount);
    }
    return str;
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-hex-encoding/hex-encoding.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromHex",
    ()=>fromHex,
    "toHex",
    ()=>toHex
]);
const SHORT_TO_HEX = {};
const HEX_TO_SHORT = {};
for(let i = 0; i < 256; i++){
    let encodedByte = i.toString(16).toLowerCase();
    if (encodedByte.length === 1) {
        encodedByte = `0${encodedByte}`;
    }
    SHORT_TO_HEX[i] = encodedByte;
    HEX_TO_SHORT[encodedByte] = i;
}
function fromHex(encoded) {
    if (encoded.length % 2 !== 0) {
        throw new Error("Hex encoded strings must have an even number length");
    }
    const out = new Uint8Array(encoded.length / 2);
    for(let i = 0; i < encoded.length; i += 2){
        const encodedByte = encoded.slice(i, i + 2).toLowerCase();
        if (encodedByte in HEX_TO_SHORT) {
            out[i / 2] = HEX_TO_SHORT[encodedByte];
        } else {
            throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
        }
    }
    return out;
}
function toHex(bytes) {
    let out = "";
    for(let i = 0; i < bytes.byteLength; i++){
        out += SHORT_TO_HEX[bytes[i]];
    }
    return out;
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.browser.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "toUtf8",
    ()=>toUtf8
]);
const toUtf8 = (input)=>{
    if (typeof input === "string") {
        return input;
    }
    if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
        throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
    }
    return new TextDecoder("utf-8").decode(input);
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/concatBytes.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "concatBytes",
    ()=>concatBytes
]);
function concatBytes(arrays, length) {
    if (length === undefined) {
        length = 0;
        for (const bytes of arrays){
            length += bytes.byteLength;
        }
    }
    const result = new Uint8Array(length);
    let offset = 0;
    for (const buf of arrays){
        result.set(buf, offset);
        offset += buf.byteLength;
    }
    return result;
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isBlob",
    ()=>isBlob,
    "isReadableStream",
    ()=>isReadableStream
]);
const isReadableStream = (stream)=>typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream);
const isBlob = (blob)=>{
    return typeof Blob === "function" && (blob?.constructor?.name === Blob.name || blob instanceof Blob);
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.browser.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "collectBlob",
    ()=>collectBlob,
    "collectReadableStream",
    ()=>collectReadableStream,
    "streamCollector",
    ()=>streamCollector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$concatBytes$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/concatBytes.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$type$2d$check$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js [instrumentation] (ecmascript)");
;
;
const streamCollector = async (stream)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$type$2d$check$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBlob"])(stream)) {
        return collectBlob(stream);
    }
    return collectReadableStream(stream);
};
async function collectBlob(blob) {
    return blob.arrayBuffer().then((ab)=>new Uint8Array(ab));
}
async function collectReadableStream(stream) {
    const chunks = [];
    const reader = stream.getReader();
    let length = 0;
    while(true){
        const { done, value } = await reader.read();
        if (value) {
            chunks.push(value);
            length += value.length;
        }
        if (done) {
            break;
        }
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$concatBytes$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["concatBytes"])(chunks, length);
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.browser.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sdkStreamMixin",
    ()=>sdkStreamMixin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$toBase64$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.browser.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$hex$2d$encoding$2f$hex$2d$encoding$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-hex-encoding/hex-encoding.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$utf8$2f$toUtf8$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.browser.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.browser.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$type$2d$check$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js [instrumentation] (ecmascript)");
;
;
;
;
;
const ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
const sdkStreamMixin = (stream)=>{
    if (!isBlobInstance(stream) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$type$2d$check$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isReadableStream"])(stream)) {
        const name = stream?.__proto__?.constructor?.name || stream;
        throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
    }
    let transformed = false;
    const transformToByteArray = async ()=>{
        if (transformed) {
            throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
        }
        transformed = true;
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["streamCollector"])(stream);
    };
    const blobToWebStream = (blob)=>{
        if (typeof blob.stream !== "function") {
            throw new Error("Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.\n" + "If you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
        }
        return blob.stream();
    };
    return Object.assign(stream, {
        transformToByteArray: transformToByteArray,
        transformToString: async (encoding)=>{
            const buf = await transformToByteArray();
            if (encoding === "base64") {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$toBase64$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["toBase64"])(buf);
            } else if (encoding === "hex") {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$hex$2d$encoding$2f$hex$2d$encoding$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["toHex"])(buf);
            } else if (encoding === undefined || encoding === "utf8" || encoding === "utf-8") {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$utf8$2f$toUtf8$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["toUtf8"])(buf);
            } else if (typeof TextDecoder === "function") {
                return new TextDecoder(encoding).decode(buf);
            } else {
                throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
            }
        },
        transformToWebStream: ()=>{
            if (transformed) {
                throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
            }
            transformed = true;
            if (isBlobInstance(stream)) {
                return blobToWebStream(stream);
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$type$2d$check$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isReadableStream"])(stream)) {
                return stream;
            } else {
                throw new Error(`Cannot transform payload to web stream, got ${stream}`);
            }
        }
    });
};
const isBlobInstance = (stream)=>typeof Blob === "function" && stream instanceof Blob;
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "streamCollector",
    ()=>streamCollector
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:stream [external] (node:stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$concatBytes$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/concatBytes.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.browser.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$type$2d$check$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-type-check.js [instrumentation] (ecmascript)");
;
;
;
;
const streamCollector = (stream)=>{
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$type$2d$check$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isBlob"])(stream)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["collectBlob"])(stream);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$type$2d$check$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isReadableStream"])(stream)) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["collectReadableStream"])(stream);
    }
    return new Promise((resolve, reject)=>{
        const collector = new Collector();
        const nodeStream = stream;
        nodeStream.pipe(collector);
        nodeStream.on("error", (err)=>{
            collector.end();
            reject(err);
        });
        collector.on("error", reject);
        collector.on("finish", function() {
            const bytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$concatBytes$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["concatBytes"])(this.bufferedBytes);
            resolve(bytes);
        });
    });
};
class Collector extends __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Writable"] {
    bufferedBytes = [];
    _write(chunk, encoding, callback) {
        this.bufferedBytes.push(chunk);
        callback();
    }
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "sdkStreamMixin",
    ()=>sdkStreamMixin
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:stream [external] (node:stream, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$buffer$2d$from$2f$buffer$2d$from$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-buffer-from/buffer-from.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$sdk$2d$stream$2d$mixin$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.browser.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.js [instrumentation] (ecmascript)");
;
;
;
;
const ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
const sdkStreamMixin = (stream)=>{
    if (!(stream instanceof __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Readable"])) {
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$sdk$2d$stream$2d$mixin$2e$browser$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["sdkStreamMixin"])(stream);
        } catch (ignored) {
            const name = stream?.__proto__?.constructor?.name || stream;
            throw new Error(`Unexpected stream implementation, expect Stream.Readable instance, got ${name}`);
        }
    }
    let transformed = false;
    const transformToByteArray = async ()=>{
        if (transformed) {
            throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
        }
        transformed = true;
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["streamCollector"])(stream);
    };
    return Object.assign(stream, {
        transformToByteArray,
        transformToString: async (encoding)=>{
            const buf = await transformToByteArray();
            if (encoding === undefined || Buffer.isEncoding(encoding)) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$buffer$2d$from$2f$buffer$2d$from$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromArrayBuffer"])(buf.buffer, buf.byteOffset, buf.byteLength).toString(encoding);
            } else {
                const decoder = new TextDecoder(encoding);
                return decoder.decode(buf);
            }
        },
        transformToWebStream: ()=>{
            if (transformed) {
                throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
            }
            if (stream.readableFlowing !== null) {
                throw new Error("The stream has been consumed by other callbacks.");
            }
            if (typeof __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Readable"].toWeb !== "function") {
                throw new Error("Readable.toWeb() is not supported. Please ensure a polyfill is available.");
            }
            transformed = true;
            return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__["Readable"].toWeb(stream);
        }
    });
};
}),
"[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/requestHelpers.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createGetRequest",
    ()=>createGetRequest,
    "getCredentials",
    ()=>getCredentials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/httpRequest.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$date$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/date-utils.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$sdk$2d$stream$2d$mixin$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/sdk-stream-mixin.js [instrumentation] (ecmascript)");
;
;
;
;
function createGetRequest(url) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HttpRequest"]({
        protocol: url.protocol,
        hostname: url.hostname,
        port: Number(url.port),
        path: url.pathname,
        query: Array.from(url.searchParams.entries()).reduce((acc, [k, v])=>{
            acc[k] = v;
            return acc;
        }, {}),
        fragment: url.hash
    });
}
async function getCredentials(response, logger) {
    const stream = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$sdk$2d$stream$2d$mixin$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["sdkStreamMixin"])(response.body);
    const str = await stream.transformToString();
    if (response.statusCode === 200) {
        const parsed = JSON.parse(str);
        if (typeof parsed.AccessKeyId !== "string" || typeof parsed.SecretAccessKey !== "string" || typeof parsed.Token !== "string" || typeof parsed.Expiration !== "string") {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"]("HTTP credential provider response not of the required format, an object matching: " + "{ AccessKeyId: string, SecretAccessKey: string, Token: string, Expiration: string(rfc3339) }", {
                logger
            });
        }
        return {
            accessKeyId: parsed.AccessKeyId,
            secretAccessKey: parsed.SecretAccessKey,
            sessionToken: parsed.Token,
            expiration: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$date$2d$utils$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseRfc3339DateTime"])(parsed.Expiration)
        };
    }
    if (response.statusCode >= 400 && response.statusCode < 500) {
        let parsedBody = {};
        try {
            parsedBody = JSON.parse(str);
        } catch (e) {}
        throw Object.assign(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`Server responded with status: ${response.statusCode}`, {
            logger
        }), {
            Code: parsedBody.Code,
            Message: parsedBody.Message
        });
    }
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`Server responded with status: ${response.statusCode}`, {
        logger
    });
}
}),
"[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/retry-wrapper.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "retryWrapper",
    ()=>retryWrapper
]);
const retryWrapper = (toRetry, maxRetries, delayMs)=>{
    return async ()=>{
        for(let i = 0; i < maxRetries; ++i){
            try {
                return await toRetry();
            } catch (e) {
                await new Promise((resolve)=>setTimeout(resolve, delayMs));
            }
        }
        return await toRetry();
    };
};
}),
"[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/fromHttp.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromHttp",
    ()=>fromHttp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$setCredentialFeature$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$node$2d$http$2d$handler$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$checkUrl$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/checkUrl.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$requestHelpers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/requestHelpers.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$retry$2d$wrapper$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/retry-wrapper.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
const AWS_CONTAINER_CREDENTIALS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
const DEFAULT_LINK_LOCAL_HOST = "http://169.254.170.2";
const AWS_CONTAINER_CREDENTIALS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
const AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE = "AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE";
const AWS_CONTAINER_AUTHORIZATION_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
const fromHttp = (options = {})=>{
    options.logger?.debug("@aws-sdk/credential-provider-http - fromHttp");
    let host;
    const relative = options.awsContainerCredentialsRelativeUri ?? process.env[AWS_CONTAINER_CREDENTIALS_RELATIVE_URI];
    const full = options.awsContainerCredentialsFullUri ?? process.env[AWS_CONTAINER_CREDENTIALS_FULL_URI];
    const token = options.awsContainerAuthorizationToken ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN];
    const tokenFile = options.awsContainerAuthorizationTokenFile ?? process.env[AWS_CONTAINER_AUTHORIZATION_TOKEN_FILE];
    const warn = options.logger?.constructor?.name === "NoOpLogger" || !options.logger?.warn ? console.warn : options.logger.warn.bind(options.logger);
    if (relative && full) {
        warn("@aws-sdk/credential-provider-http: " + "you have set both awsContainerCredentialsRelativeUri and awsContainerCredentialsFullUri.");
        warn("awsContainerCredentialsRelativeUri will take precedence.");
    }
    if (token && tokenFile) {
        warn("@aws-sdk/credential-provider-http: " + "you have set both awsContainerAuthorizationToken and awsContainerAuthorizationTokenFile.");
        warn("awsContainerAuthorizationTokenFile will take precedence.");
    }
    if (relative) {
        host = `${DEFAULT_LINK_LOCAL_HOST}${relative}`;
    } else if (full) {
        host = full;
    } else {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`No HTTP credential provider host provided.
Set AWS_CONTAINER_CREDENTIALS_FULL_URI or AWS_CONTAINER_CREDENTIALS_RELATIVE_URI.`, {
            logger: options.logger
        });
    }
    const url = new URL(host);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$checkUrl$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["checkUrl"])(url, options.logger);
    const requestHandler = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$node$2d$http$2d$handler$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["NodeHttpHandler"].create({
        connectionTimeout: options.timeout ?? 1000
    });
    const requestTimeout = options.timeout ?? 1000;
    const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$retry$2d$wrapper$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["retryWrapper"])(async ()=>{
        const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$requestHelpers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["createGetRequest"])(url);
        if (tokenFile) {
            request.headers.Authorization = validateToken((await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(tokenFile)).toString());
        } else if (token) {
            request.headers.Authorization = validateToken(token);
        }
        try {
            const result = await requestHandler.handle(request, {
                requestTimeout
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$requestHelpers$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCredentials"])(result.response).then((creds)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$setCredentialFeature$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["setCredentialFeature"])(creds, "CREDENTIALS_HTTP", "z"));
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](String(e), {
                logger: options.logger
            });
        }
    }, options.maxRetries ?? 3, options.timeout ?? 1000);
    return async ()=>{
        try {
            return await provider();
        } finally{
            requestHandler.destroy?.();
        }
    };
};
const validateToken = (token)=>{
    if (token.includes("\r\n")) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"]("Authorization token contains invalid \\r\\n sequence.");
    }
    return token;
};
}),
"[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromHttp",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$fromHttp$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromHttp"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$http$2f$dist$2d$es$2f$fromHttp$2f$fromHttp$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-http/dist-es/fromHttp/fromHttp.js [instrumentation] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__01-jsuw._.js.map
module.exports = [
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs) <export default as node_http>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "node_http",
    ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$http__$5b$external$5d$__$28$node$3a$http$2c$__cjs$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$http__$5b$external$5d$__$28$node$3a$http$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:http [external] (node:http, cjs)");
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:os [external] (node:os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
;
;
;
;
;
;
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
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/ImdsCredentials.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromImdsCredentials",
    ()=>fromImdsCredentials,
    "isImdsCredentials",
    ()=>isImdsCredentials
]);
const isImdsCredentials = (arg)=>Boolean(arg) && typeof arg === "object" && typeof arg.AccessKeyId === "string" && typeof arg.SecretAccessKey === "string" && typeof arg.Token === "string" && typeof arg.Expiration === "string";
const fromImdsCredentials = (creds)=>({
        accessKeyId: creds.AccessKeyId,
        secretAccessKey: creds.SecretAccessKey,
        sessionToken: creds.Token,
        expiration: new Date(creds.Expiration),
        ...creds.AccountId && {
            accountId: creds.AccountId
        }
    });
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/RemoteProviderInit.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MAX_RETRIES",
    ()=>DEFAULT_MAX_RETRIES,
    "DEFAULT_TIMEOUT",
    ()=>DEFAULT_TIMEOUT,
    "providerConfigFromInit",
    ()=>providerConfigFromInit
]);
const DEFAULT_TIMEOUT = 1000;
const DEFAULT_MAX_RETRIES = 0;
const providerConfigFromInit = ({ maxRetries = DEFAULT_MAX_RETRIES, timeout = DEFAULT_TIMEOUT })=>({
        maxRetries,
        timeout
    });
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/httpRequest.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "httpRequest",
    ()=>httpRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$http__$5b$external$5d$__$28$node$3a$http$2c$__cjs$29$__$3c$export__default__as__node_http$3e$__ = __turbopack_context__.i("[externals]/node:http [external] (node:http, cjs) <export default as node_http>");
;
;
function httpRequest(options) {
    return new Promise((resolve, reject)=>{
        const req = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$http__$5b$external$5d$__$28$node$3a$http$2c$__cjs$29$__$3c$export__default__as__node_http$3e$__["node_http"].request({
            method: "GET",
            ...options,
            hostname: options.hostname?.replace(/^\[(.+)\]$/, "$1")
        });
        req.on("error", (err)=>{
            reject(Object.assign(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ProviderError"]("Unable to connect to instance metadata service"), err));
            req.destroy();
        });
        req.on("timeout", ()=>{
            reject(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ProviderError"]("TimeoutError from instance metadata service"));
            req.destroy();
        });
        req.on("response", (res)=>{
            const { statusCode = 400 } = res;
            if (statusCode < 200 || 300 <= statusCode) {
                reject(Object.assign(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ProviderError"]("Error response received from instance metadata service"), {
                    statusCode
                }));
                req.destroy();
            }
            const chunks = [];
            res.on("data", (chunk)=>{
                chunks.push(chunk);
            });
            res.on("end", ()=>{
                resolve(Buffer.concat(chunks));
                req.destroy();
            });
        });
        req.end();
    });
}
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/retry.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "retry",
    ()=>retry
]);
const retry = (toRetry, maxRetries)=>{
    let promise = toRetry();
    for(let i = 0; i < maxRetries; i++){
        promise = promise.catch(toRetry);
    }
    return promise;
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/fromContainerMetadata.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ENV_CMDS_AUTH_TOKEN",
    ()=>ENV_CMDS_AUTH_TOKEN,
    "ENV_CMDS_FULL_URI",
    ()=>ENV_CMDS_FULL_URI,
    "ENV_CMDS_RELATIVE_URI",
    ()=>ENV_CMDS_RELATIVE_URI,
    "fromContainerMetadata",
    ()=>fromContainerMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$ImdsCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/ImdsCredentials.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$RemoteProviderInit$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/RemoteProviderInit.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/httpRequest.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$retry$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/retry.js [instrumentation] (ecmascript)");
;
;
;
;
;
const ENV_CMDS_FULL_URI = "AWS_CONTAINER_CREDENTIALS_FULL_URI";
const ENV_CMDS_RELATIVE_URI = "AWS_CONTAINER_CREDENTIALS_RELATIVE_URI";
const ENV_CMDS_AUTH_TOKEN = "AWS_CONTAINER_AUTHORIZATION_TOKEN";
const fromContainerMetadata = (init = {})=>{
    const { timeout, maxRetries } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$RemoteProviderInit$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerConfigFromInit"])(init);
    return ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$retry$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["retry"])(async ()=>{
            const requestOptions = await getCmdsUri({
                logger: init.logger
            });
            const credsResponse = JSON.parse(await requestFromEcsImds(timeout, requestOptions));
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$ImdsCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isImdsCredentials"])(credsResponse)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"]("Invalid response received from instance metadata service.", {
                    logger: init.logger
                });
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$ImdsCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromImdsCredentials"])(credsResponse);
        }, maxRetries);
};
const requestFromEcsImds = async (timeout, options)=>{
    if (process.env[ENV_CMDS_AUTH_TOKEN]) {
        options.headers = {
            ...options.headers,
            Authorization: process.env[ENV_CMDS_AUTH_TOKEN]
        };
    }
    const buffer = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["httpRequest"])({
        ...options,
        timeout
    });
    return buffer.toString();
};
const CMDS_IP = "169.254.170.2";
const GREENGRASS_HOSTS = new Set([
    "localhost",
    "127.0.0.1"
]);
const GREENGRASS_PROTOCOLS = new Set([
    "http:",
    "https:"
]);
const getCmdsUri = async ({ logger })=>{
    if (process.env[ENV_CMDS_RELATIVE_URI]) {
        return {
            hostname: CMDS_IP,
            path: process.env[ENV_CMDS_RELATIVE_URI]
        };
    }
    if (process.env[ENV_CMDS_FULL_URI]) {
        let parsed;
        try {
            parsed = new URL(process.env[ENV_CMDS_FULL_URI]);
        } catch  {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`${process.env[ENV_CMDS_FULL_URI]} is not a valid container metadata service URL`, {
                tryNextLink: false,
                logger
            });
        }
        if (!parsed.hostname || !GREENGRASS_HOSTS.has(parsed.hostname)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`${parsed.hostname} is not a valid container metadata service hostname`, {
                tryNextLink: false,
                logger
            });
        }
        if (!parsed.protocol || !GREENGRASS_PROTOCOLS.has(parsed.protocol)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`${parsed.protocol} is not a valid container metadata service protocol`, {
                tryNextLink: false,
                logger
            });
        }
        return {
            protocol: parsed.protocol,
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            port: parsed.port ? parseInt(parsed.port, 10) : undefined
        };
    }
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"]("The container metadata credential provider cannot be used unless" + ` the ${ENV_CMDS_RELATIVE_URI} or ${ENV_CMDS_FULL_URI} environment` + " variable is set", {
        tryNextLink: false,
        logger
    });
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/chain.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chain",
    ()=>chain
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/ProviderError.js [instrumentation] (ecmascript)");
;
const chain = (...providers)=>async ()=>{
        if (providers.length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$ProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ProviderError"]("No providers in chain");
        }
        let lastProviderError;
        for (const provider of providers){
            try {
                const credentials = await provider();
                return credentials;
            } catch (err) {
                lastProviderError = err;
                if (err?.tryNextLink) {
                    continue;
                }
                throw err;
            }
        }
        throw lastProviderError;
    };
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "memoize",
    ()=>memoize
]);
const memoize = (provider, isExpired, requiresRefresh)=>{
    let resolved;
    let pending;
    let hasResult;
    let isConstant = false;
    const coalesceProvider = async ()=>{
        if (!pending) {
            pending = provider();
        }
        try {
            resolved = await pending;
            hasResult = true;
            isConstant = false;
        } finally{
            pending = undefined;
        }
        return resolved;
    };
    if (isExpired === undefined) {
        return async (options)=>{
            if (!hasResult || options?.forceRefresh) {
                resolved = await coalesceProvider();
            }
            return resolved;
        };
    }
    return async (options)=>{
        if (!hasResult || options?.forceRefresh) {
            resolved = await coalesceProvider();
        }
        if (isConstant) {
            return resolved;
        }
        if (requiresRefresh && !requiresRefresh(resolved)) {
            isConstant = true;
            return resolved;
        }
        if (isExpired(resolved)) {
            await coalesceProvider();
            return resolved;
        }
        return resolved;
    };
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSelectorName",
    ()=>getSelectorName
]);
function getSelectorName(functionString) {
    try {
        const constants = new Set(Array.from(functionString.match(/([A-Z_]){3,}/g) ?? []));
        constants.delete("CONFIG");
        constants.delete("CONFIG_PREFIX_SEPARATOR");
        constants.delete("ENV");
        return [
            ...constants
        ].join(", ");
    } catch (ignored) {
        return functionString;
    }
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromEnv.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromEnv",
    ()=>fromEnv
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [instrumentation] (ecmascript)");
;
;
const fromEnv = (envVarSelector, options)=>async ()=>{
        try {
            const config = envVarSelector(process.env, options);
            if (config === undefined) {
                throw new Error();
            }
            return config;
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](e.message || `Not found in ENV: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSelectorName"])(envVarSelector.toString())}`, {
                logger: options?.logger
            });
        }
    };
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_PROFILE",
    ()=>DEFAULT_PROFILE,
    "ENV_PROFILE",
    ()=>ENV_PROFILE,
    "getProfileName",
    ()=>getProfileName
]);
const ENV_PROFILE = "AWS_PROFILE";
const DEFAULT_PROFILE = "default";
const getProfileName = (init)=>init.profile || process.env[ENV_PROFILE] || DEFAULT_PROFILE;
}),
"[project]/node_modules/@smithy/types/dist-es/profile.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IniSectionType",
    ()=>IniSectionType
]);
var IniSectionType;
(function(IniSectionType) {
    IniSectionType["PROFILE"] = "profile";
    IniSectionType["SSO_SESSION"] = "sso-session";
    IniSectionType["SERVICES"] = "services";
})(IniSectionType || (IniSectionType = {}));
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_PREFIX_SEPARATOR",
    ()=>CONFIG_PREFIX_SEPARATOR
]);
const CONFIG_PREFIX_SEPARATOR = ".";
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigData.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConfigData",
    ()=>getConfigData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/types/dist-es/profile.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [instrumentation] (ecmascript)");
;
;
const getConfigData = (data)=>Object.entries(data).filter(([key])=>{
        const indexOfSeparator = key.indexOf(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
        if (indexOfSeparator === -1) {
            return false;
        }
        return Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IniSectionType"]).includes(key.substring(0, indexOfSeparator));
    }).reduce((acc, [key, value])=>{
        const indexOfSeparator = key.indexOf(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
        const updatedKey = key.substring(0, indexOfSeparator) === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IniSectionType"].PROFILE ? key.substring(indexOfSeparator + 1) : key;
        acc[updatedKey] = value;
        return acc;
    }, {
        ...data.default && {
            default: data.default
        }
    });
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getHomeDir",
    ()=>getHomeDir
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
const homeDirCache = {};
const getHomeDirCacheKey = ()=>{
    if (process && process.geteuid) {
        return `${process.geteuid()}`;
    }
    return "DEFAULT";
};
const getHomeDir = ()=>{
    const { HOME, USERPROFILE, HOMEPATH, HOMEDRIVE = `C:${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["sep"]}` } = process.env;
    if (HOME) return HOME;
    if (USERPROFILE) return USERPROFILE;
    if (HOMEPATH) return `${HOMEDRIVE}${HOMEPATH}`;
    const homeDirCacheKey = getHomeDirCacheKey();
    if (!homeDirCache[homeDirCacheKey]) homeDirCache[homeDirCacheKey] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["homedir"])();
    return homeDirCache[homeDirCacheKey];
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigFilepath.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ENV_CONFIG_PATH",
    ()=>ENV_CONFIG_PATH,
    "getConfigFilepath",
    ()=>getConfigFilepath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [instrumentation] (ecmascript)");
;
;
const ENV_CONFIG_PATH = "AWS_CONFIG_FILE";
const getConfigFilepath = ()=>process.env[ENV_CONFIG_PATH] || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHomeDir"])(), ".aws", "config");
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getCredentialsFilepath.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ENV_CREDENTIALS_PATH",
    ()=>ENV_CREDENTIALS_PATH,
    "getCredentialsFilepath",
    ()=>getCredentialsFilepath
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [instrumentation] (ecmascript)");
;
;
const ENV_CREDENTIALS_PATH = "AWS_SHARED_CREDENTIALS_FILE";
const getCredentialsFilepath = ()=>process.env[ENV_CREDENTIALS_PATH] || (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHomeDir"])(), ".aws", "credentials");
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseIni.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseIni",
    ()=>parseIni
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/types/dist-es/profile.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/constants.js [instrumentation] (ecmascript)");
;
;
const prefixKeyRegex = /^([\w-]+)\s(["'])?([\w-@+.%:/]+)\2$/;
const profileNameBlockList = [
    "__proto__",
    "profile __proto__"
];
const parseIni = (iniData)=>{
    const map = {};
    let currentSection;
    let currentSubSection;
    for (const iniLine of iniData.split(/\r?\n/)){
        const trimmedLine = iniLine.split(/(^|\s)[;#]/)[0].trim();
        const isSection = trimmedLine[0] === "[" && trimmedLine[trimmedLine.length - 1] === "]";
        if (isSection) {
            currentSection = undefined;
            currentSubSection = undefined;
            const sectionName = trimmedLine.substring(1, trimmedLine.length - 1);
            const matches = prefixKeyRegex.exec(sectionName);
            if (matches) {
                const [, prefix, , name] = matches;
                if (Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$types$2f$dist$2d$es$2f$profile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["IniSectionType"]).includes(prefix)) {
                    currentSection = [
                        prefix,
                        name
                    ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]);
                }
            } else {
                currentSection = sectionName;
            }
            if (profileNameBlockList.includes(sectionName)) {
                throw new Error(`Found invalid profile name "${sectionName}"`);
            }
        } else if (currentSection) {
            const indexOfEqualsSign = trimmedLine.indexOf("=");
            if (![
                0,
                -1
            ].includes(indexOfEqualsSign)) {
                const [name, value] = [
                    trimmedLine.substring(0, indexOfEqualsSign).trim(),
                    trimmedLine.substring(indexOfEqualsSign + 1).trim()
                ];
                if (value === "") {
                    currentSubSection = name;
                } else {
                    if (currentSubSection && iniLine.trimStart() === iniLine) {
                        currentSubSection = undefined;
                    }
                    map[currentSection] = map[currentSection] || {};
                    const key = currentSubSection ? [
                        currentSubSection,
                        name
                    ].join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$constants$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CONFIG_PREFIX_SEPARATOR"]) : name;
                    map[currentSection][key] = value;
                }
            }
        }
    }
    return map;
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fileIntercept",
    ()=>fileIntercept,
    "filePromises",
    ()=>filePromises,
    "readFile",
    ()=>readFile
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
;
const filePromises = {};
const fileIntercept = {};
const readFile = (path, options)=>{
    if (fileIntercept[path] !== undefined) {
        return fileIntercept[path];
    }
    if (!filePromises[path] || options?.ignoreCache) {
        filePromises[path] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(path, "utf8");
    }
    return filePromises[path];
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadSharedConfigFiles",
    ()=>loadSharedConfigFiles
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigData$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigData.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigFilepath$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getConfigFilepath.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getCredentialsFilepath$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getCredentialsFilepath.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getHomeDir.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseIni.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
const swallowError = ()=>({});
;
const loadSharedConfigFiles = async (init = {})=>{
    const { filepath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getCredentialsFilepath$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getCredentialsFilepath"])(), configFilepath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigFilepath$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getConfigFilepath"])() } = init;
    const homeDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getHomeDir$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getHomeDir"])();
    const relativeHomeDirPrefix = "~/";
    let resolvedFilepath = filepath;
    if (filepath.startsWith(relativeHomeDirPrefix)) {
        resolvedFilepath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(homeDir, filepath.slice(2));
    }
    let resolvedConfigFilepath = configFilepath;
    if (configFilepath.startsWith(relativeHomeDirPrefix)) {
        resolvedConfigFilepath = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(homeDir, configFilepath.slice(2));
    }
    const parsedFiles = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFile"])(resolvedConfigFilepath, {
            ignoreCache: init.ignoreCache
        }).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIni"]).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getConfigData$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getConfigData"]).catch(swallowError),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFile"])(resolvedFilepath, {
            ignoreCache: init.ignoreCache
        }).then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseIni$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseIni"]).catch(swallowError)
    ]);
    return {
        configFile: parsedFiles[0],
        credentialsFile: parsedFiles[1]
    };
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromSharedConfigFiles.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromSharedConfigFiles",
    ()=>fromSharedConfigFiles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getProfileName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$loadSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/getSelectorName.js [instrumentation] (ecmascript)");
;
;
;
;
const fromSharedConfigFiles = (configSelector, { preferredFile = "config", ...init } = {})=>async ()=>{
        const profile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getProfileName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProfileName"])(init);
        const { configFile, credentialsFile } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$loadSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadSharedConfigFiles"])(init);
        const profileFromCredentials = credentialsFile[profile] || {};
        const profileFromConfig = configFile[profile] || {};
        const mergedProfile = preferredFile === "config" ? {
            ...profileFromCredentials,
            ...profileFromConfig
        } : {
            ...profileFromConfig,
            ...profileFromCredentials
        };
        try {
            const cfgFile = preferredFile === "config" ? configFile : credentialsFile;
            const configValue = configSelector(mergedProfile, cfgFile);
            if (configValue === undefined) {
                throw new Error();
            }
            return configValue;
        } catch (e) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](e.message || `Not found in config files w/ profile [${profile}]: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$getSelectorName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getSelectorName"])(configSelector.toString())}`, {
                logger: init.logger
            });
        }
    };
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/fromValue.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromValue",
    ()=>fromValue
]);
const fromValue = (staticValue)=>()=>Promise.resolve(staticValue);
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromStatic.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromStatic",
    ()=>fromStatic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$fromValue$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/fromValue.js [instrumentation] (ecmascript)");
;
const isFunction = (func)=>typeof func === "function";
const fromStatic = (defaultValue)=>isFunction(defaultValue) ? async ()=>await defaultValue() : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$fromValue$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromValue"])(defaultValue);
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadConfig",
    ()=>loadConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$chain$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/chain.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$memoize$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/memoize.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromEnv$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromEnv.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromSharedConfigFiles.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromStatic$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/fromStatic.js [instrumentation] (ecmascript)");
;
;
;
;
;
const loadConfig = ({ environmentVariableSelector, configFileSelector, default: defaultValue }, configuration = {})=>{
    const { signingName, logger } = configuration;
    const envOptions = {
        signingName,
        logger
    };
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$memoize$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["memoize"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$chain$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["chain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromEnv$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromEnv"])(environmentVariableSelector, envOptions), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromSharedConfigFiles"])(configFileSelector, configuration), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$fromStatic$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromStatic"])(defaultValue)));
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/error/InstanceMetadataV1FallbackError.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InstanceMetadataV1FallbackError",
    ()=>InstanceMetadataV1FallbackError
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
;
class InstanceMetadataV1FallbackError extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"] {
    tryNextLink;
    name = "InstanceMetadataV1FallbackError";
    constructor(message, tryNextLink = true){
        super(message, tryNextLink);
        this.tryNextLink = tryNextLink;
        Object.setPrototypeOf(this, InstanceMetadataV1FallbackError.prototype);
    }
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseQueryString",
    ()=>parseQueryString
]);
function parseQueryString(querystring) {
    const query = {};
    querystring = querystring.replace(/^\?/, "");
    if (querystring) {
        for (const pair of querystring.split("&")){
            let [key, value = null] = pair.split("=");
            key = decodeURIComponent(key);
            if (value) {
                value = decodeURIComponent(value);
            }
            if (!(key in query)) {
                query[key] = value;
            } else if (Array.isArray(query[key])) {
                query[key].push(value);
            } else {
                query[key] = [
                    query[key],
                    value
                ];
            }
        }
    }
    return query;
}
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseUrl",
    ()=>parseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseQueryString$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/parseQueryString.js [instrumentation] (ecmascript)");
;
const parseUrl = (url)=>{
    if (typeof url === "string") {
        return parseUrl(new URL(url));
    }
    const { hostname, pathname, port, protocol, search } = url;
    let query;
    if (search) {
        query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseQueryString$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseQueryString"])(search);
    }
    return {
        hostname,
        port: port ? parseInt(port) : undefined,
        protocol,
        path: pathname,
        query
    };
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/Endpoint.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Endpoint",
    ()=>Endpoint
]);
var Endpoint;
(function(Endpoint) {
    Endpoint["IPv4"] = "http://169.254.169.254";
    Endpoint["IPv6"] = "http://[fd00:ec2::254]";
})(Endpoint || (Endpoint = {}));
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointConfigOptions.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_ENDPOINT_NAME",
    ()=>CONFIG_ENDPOINT_NAME,
    "ENDPOINT_CONFIG_OPTIONS",
    ()=>ENDPOINT_CONFIG_OPTIONS,
    "ENV_ENDPOINT_NAME",
    ()=>ENV_ENDPOINT_NAME
]);
const ENV_ENDPOINT_NAME = "AWS_EC2_METADATA_SERVICE_ENDPOINT";
const CONFIG_ENDPOINT_NAME = "ec2_metadata_service_endpoint";
const ENDPOINT_CONFIG_OPTIONS = {
    environmentVariableSelector: (env)=>env[ENV_ENDPOINT_NAME],
    configFileSelector: (profile)=>profile[CONFIG_ENDPOINT_NAME],
    default: undefined
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointMode.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EndpointMode",
    ()=>EndpointMode
]);
var EndpointMode;
(function(EndpointMode) {
    EndpointMode["IPv4"] = "IPv4";
    EndpointMode["IPv6"] = "IPv6";
})(EndpointMode || (EndpointMode = {}));
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointModeConfigOptions.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CONFIG_ENDPOINT_MODE_NAME",
    ()=>CONFIG_ENDPOINT_MODE_NAME,
    "ENDPOINT_MODE_CONFIG_OPTIONS",
    ()=>ENDPOINT_MODE_CONFIG_OPTIONS,
    "ENV_ENDPOINT_MODE_NAME",
    ()=>ENV_ENDPOINT_MODE_NAME
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointMode$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointMode.js [instrumentation] (ecmascript)");
;
const ENV_ENDPOINT_MODE_NAME = "AWS_EC2_METADATA_SERVICE_ENDPOINT_MODE";
const CONFIG_ENDPOINT_MODE_NAME = "ec2_metadata_service_endpoint_mode";
const ENDPOINT_MODE_CONFIG_OPTIONS = {
    environmentVariableSelector: (env)=>env[ENV_ENDPOINT_MODE_NAME],
    configFileSelector: (profile)=>profile[CONFIG_ENDPOINT_MODE_NAME],
    default: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointMode$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["EndpointMode"].IPv4
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/utils/getInstanceMetadataEndpoint.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getInstanceMetadataEndpoint",
    ()=>getInstanceMetadataEndpoint
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$Endpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/Endpoint.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointConfigOptions$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointConfigOptions.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointMode$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointMode.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointModeConfigOptions$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/EndpointModeConfigOptions.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
const getInstanceMetadataEndpoint = async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseUrl"])(await getFromEndpointConfig() || await getFromEndpointModeConfig());
const getFromEndpointConfig = async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointConfigOptions$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ENDPOINT_CONFIG_OPTIONS"])();
const getFromEndpointModeConfig = async ()=>{
    const endpointMode = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointModeConfigOptions$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ENDPOINT_MODE_CONFIG_OPTIONS"])();
    switch(endpointMode){
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointMode$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["EndpointMode"].IPv4:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$Endpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Endpoint"].IPv4;
        case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointMode$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["EndpointMode"].IPv6:
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$Endpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Endpoint"].IPv6;
        default:
            throw new Error(`Unsupported endpoint mode: ${endpointMode}.` + ` Select from ${Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$EndpointMode$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["EndpointMode"])}`);
    }
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/utils/getExtendedInstanceMetadataCredentials.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getExtendedInstanceMetadataCredentials",
    ()=>getExtendedInstanceMetadataCredentials
]);
const STATIC_STABILITY_REFRESH_INTERVAL_SECONDS = 5 * 60;
const STATIC_STABILITY_REFRESH_INTERVAL_JITTER_WINDOW_SECONDS = 5 * 60;
const STATIC_STABILITY_DOC_URL = "https://docs.aws.amazon.com/sdkref/latest/guide/feature-static-credentials.html";
const getExtendedInstanceMetadataCredentials = (credentials, logger)=>{
    const refreshInterval = STATIC_STABILITY_REFRESH_INTERVAL_SECONDS + Math.floor(Math.random() * STATIC_STABILITY_REFRESH_INTERVAL_JITTER_WINDOW_SECONDS);
    const newExpiration = new Date(Date.now() + refreshInterval * 1000);
    logger.warn("Attempting credential expiration extension due to a credential service availability issue. A refresh of these " + `credentials will be attempted after ${new Date(newExpiration)}.\nFor more information, please visit: ` + STATIC_STABILITY_DOC_URL);
    const originalExpiration = credentials.originalExpiration ?? credentials.expiration;
    return {
        ...credentials,
        ...originalExpiration ? {
            originalExpiration
        } : {},
        expiration: newExpiration
    };
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/utils/staticStabilityProvider.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "staticStabilityProvider",
    ()=>staticStabilityProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$getExtendedInstanceMetadataCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/utils/getExtendedInstanceMetadataCredentials.js [instrumentation] (ecmascript)");
;
const staticStabilityProvider = (provider, options = {})=>{
    const logger = options?.logger || console;
    let pastCredentials;
    return async ()=>{
        let credentials;
        try {
            credentials = await provider();
            if (credentials.expiration && credentials.expiration.getTime() < Date.now()) {
                credentials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$getExtendedInstanceMetadataCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getExtendedInstanceMetadataCredentials"])(credentials, logger);
            }
        } catch (e) {
            if (pastCredentials) {
                logger.warn("Credential renew failed: ", e);
                credentials = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$getExtendedInstanceMetadataCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getExtendedInstanceMetadataCredentials"])(pastCredentials, logger);
            } else {
                throw e;
            }
        }
        pastCredentials = credentials;
        return credentials;
    };
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/fromInstanceMetadata.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromInstanceMetadata",
    ()=>fromInstanceMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$error$2f$InstanceMetadataV1FallbackError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/error/InstanceMetadataV1FallbackError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$ImdsCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/ImdsCredentials.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$RemoteProviderInit$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/RemoteProviderInit.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/httpRequest.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$retry$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/retry.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$getInstanceMetadataEndpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/utils/getInstanceMetadataEndpoint.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$staticStabilityProvider$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/utils/staticStabilityProvider.js [instrumentation] (ecmascript)");
;
;
;
;
;
;
;
;
const IMDS_PATH = "/latest/meta-data/iam/security-credentials/";
const IMDS_TOKEN_PATH = "/latest/api/token";
const AWS_EC2_METADATA_V1_DISABLED = "AWS_EC2_METADATA_V1_DISABLED";
const PROFILE_AWS_EC2_METADATA_V1_DISABLED = "ec2_metadata_v1_disabled";
const X_AWS_EC2_METADATA_TOKEN = "[REDIGIDO-PRESERVACAO]";
const fromInstanceMetadata = (init = {})=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$staticStabilityProvider$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["staticStabilityProvider"])(getInstanceMetadataProvider(init), {
        logger: init.logger
    });
const getInstanceMetadataProvider = (init = {})=>{
    let disableFetchToken = false;
    const { logger, profile } = init;
    const { timeout, maxRetries } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$RemoteProviderInit$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerConfigFromInit"])(init);
    const getCredentials = async (maxRetries, options)=>{
        const isImdsV1Fallback = disableFetchToken || options.headers?.[X_AWS_EC2_METADATA_TOKEN] == null;
        if (isImdsV1Fallback) {
            let fallbackBlockedFromProfile = false;
            let fallbackBlockedFromProcessEnv = false;
            const configValue = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["loadConfig"])({
                environmentVariableSelector: (env)=>{
                    const envValue = env[AWS_EC2_METADATA_V1_DISABLED];
                    fallbackBlockedFromProcessEnv = !!envValue && envValue !== "false";
                    if (envValue === undefined) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`${AWS_EC2_METADATA_V1_DISABLED} not set in env, checking config file next.`, {
                            logger: init.logger
                        });
                    }
                    return fallbackBlockedFromProcessEnv;
                },
                configFileSelector: (profile)=>{
                    const profileValue = profile[PROFILE_AWS_EC2_METADATA_V1_DISABLED];
                    fallbackBlockedFromProfile = !!profileValue && profileValue !== "false";
                    return fallbackBlockedFromProfile;
                },
                default: false
            }, {
                profile
            })();
            if (init.ec2MetadataV1Disabled || configValue) {
                const causes = [];
                if (init.ec2MetadataV1Disabled) causes.push("credential provider initialization (runtime option ec2MetadataV1Disabled)");
                if (fallbackBlockedFromProfile) causes.push(`config file profile (${PROFILE_AWS_EC2_METADATA_V1_DISABLED})`);
                if (fallbackBlockedFromProcessEnv) causes.push(`process environment variable (${AWS_EC2_METADATA_V1_DISABLED})`);
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$error$2f$InstanceMetadataV1FallbackError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["InstanceMetadataV1FallbackError"](`AWS EC2 Metadata v1 fallback has been blocked by AWS SDK configuration in the following: [${causes.join(", ")}].`);
            }
        }
        const imdsProfile = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$retry$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["retry"])(async ()=>{
            let profile;
            try {
                profile = await getProfile(options);
            } catch (err) {
                if (err.statusCode === 401) {
                    disableFetchToken = false;
                }
                throw err;
            }
            return profile;
        }, maxRetries)).trim();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$retry$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["retry"])(async ()=>{
            let creds;
            try {
                creds = await getCredentialsFromProfile(imdsProfile, options, init);
            } catch (err) {
                if (err.statusCode === 401) {
                    disableFetchToken = false;
                }
                throw err;
            }
            return creds;
        }, maxRetries);
    };
    return async ()=>{
        const endpoint = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$getInstanceMetadataEndpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getInstanceMetadataEndpoint"])();
        if (disableFetchToken) {
            logger?.debug("AWS SDK Instance Metadata", "using v1 fallback (no token fetch)");
            return getCredentials(maxRetries, {
                ...endpoint,
                timeout
            });
        } else {
            let token;
            try {
                token = (await getMetadataToken({
                    ...endpoint,
                    timeout
                })).toString();
            } catch (error) {
                if (error?.statusCode === 400) {
                    throw Object.assign(error, {
                        message: "EC2 Metadata token request returned error"
                    });
                } else if (error.message === "TimeoutError" || [
                    403,
                    404,
                    405
                ].includes(error.statusCode)) {
                    disableFetchToken = true;
                }
                logger?.debug("AWS SDK Instance Metadata", "using v1 fallback (initial)");
                return getCredentials(maxRetries, {
                    ...endpoint,
                    timeout
                });
            }
            return getCredentials(maxRetries, {
                ...endpoint,
                headers: {
                    [X_AWS_EC2_METADATA_TOKEN]: token
                },
                timeout
            });
        }
    };
};
const getMetadataToken = async (options)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["httpRequest"])({
        ...options,
        path: IMDS_TOKEN_PATH,
        method: "PUT",
        headers: {
            "x-aws-ec2-metadata-token-ttl-seconds": "21600"
        }
    });
const getProfile = async (options)=>(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["httpRequest"])({
        ...options,
        path: IMDS_PATH
    })).toString();
const getCredentialsFromProfile = async (profile, options, init)=>{
    const credentialsResponse = JSON.parse((await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["httpRequest"])({
        ...options,
        path: IMDS_PATH + profile
    })).toString());
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$ImdsCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["isImdsCredentials"])(credentialsResponse)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"]("Invalid response received from instance metadata service.", {
            logger: init.logger
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$ImdsCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromImdsCredentials"])(credentialsResponse);
};
}),
"[project]/node_modules/@smithy/credential-provider-imds/dist-es/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_MAX_RETRIES",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$RemoteProviderInit$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_MAX_RETRIES"],
    "DEFAULT_TIMEOUT",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$RemoteProviderInit$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["DEFAULT_TIMEOUT"],
    "ENV_CMDS_AUTH_TOKEN",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$fromContainerMetadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ENV_CMDS_AUTH_TOKEN"],
    "ENV_CMDS_FULL_URI",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$fromContainerMetadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ENV_CMDS_FULL_URI"],
    "ENV_CMDS_RELATIVE_URI",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$fromContainerMetadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["ENV_CMDS_RELATIVE_URI"],
    "Endpoint",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$Endpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["Endpoint"],
    "fromContainerMetadata",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$fromContainerMetadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromContainerMetadata"],
    "fromInstanceMetadata",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$fromInstanceMetadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromInstanceMetadata"],
    "getInstanceMetadataEndpoint",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$getInstanceMetadataEndpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getInstanceMetadataEndpoint"],
    "httpRequest",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["httpRequest"],
    "providerConfigFromInit",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$RemoteProviderInit$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["providerConfigFromInit"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$fromContainerMetadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/fromContainerMetadata.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$fromInstanceMetadata$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/fromInstanceMetadata.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$RemoteProviderInit$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/RemoteProviderInit.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$remoteProvider$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/remoteProvider/httpRequest.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$utils$2f$getInstanceMetadataEndpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/utils/getInstanceMetadataEndpoint.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$credential$2d$provider$2d$imds$2f$dist$2d$es$2f$config$2f$Endpoint$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/credential-provider-imds/dist-es/config/Endpoint.js [instrumentation] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1wwemyg._.js.map
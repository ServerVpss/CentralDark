module.exports = [
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
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[project]/node_modules/@aws-sdk/credential-provider-login/dist-es/index.js [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
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
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/mergeConfigFiles.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mergeConfigFiles",
    ()=>mergeConfigFiles
]);
const mergeConfigFiles = (...files)=>{
    const merged = {};
    for (const file of files){
        for (const [key, values] of Object.entries(file)){
            if (merged[key] !== undefined) {
                Object.assign(merged[key], values);
            } else {
                merged[key] = values;
            }
        }
    }
    return merged;
};
}),
"[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseKnownFiles.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseKnownFiles",
    ()=>parseKnownFiles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$loadSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/loadSharedConfigFiles.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$mergeConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/mergeConfigFiles.js [instrumentation] (ecmascript)");
;
;
const parseKnownFiles = async (init)=>{
    const parsedFiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$loadSharedConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__["loadSharedConfigFiles"])(init);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$mergeConfigFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["mergeConfigFiles"])(parsedFiles.configFile, parsedFiles.credentialsFile);
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
"[project]/node_modules/@aws-sdk/credential-provider-login/dist-es/LoginCredentialsFetcher.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoginCredentialsFetcher",
    ()=>LoginCredentialsFetcher
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/readFile.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/httpRequest.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
;
;
;
;
;
;
class LoginCredentialsFetcher {
    profileData;
    init;
    callerClientConfig;
    static REFRESH_THRESHOLD = 5 * 60 * 1000;
    constructor(profileData, init, callerClientConfig){
        this.profileData = profileData;
        this.init = init;
        this.callerClientConfig = callerClientConfig;
    }
    async loadCredentials() {
        const token = await this.loadToken();
        if (!token) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`Failed to load a token for session ${this.loginSession}, please re-authenticate using aws login`, {
                tryNextLink: false,
                logger: this.logger
            });
        }
        const accessToken = token.accessToken;
        const now = Date.now();
        const expiryTime = new Date(accessToken.expiresAt).getTime();
        const timeUntilExpiry = expiryTime - now;
        if (timeUntilExpiry <= LoginCredentialsFetcher.REFRESH_THRESHOLD) {
            return this.refresh(token);
        }
        return {
            accessKeyId: accessToken.accessKeyId,
            secretAccessKey: accessToken.secretAccessKey,
            sessionToken: accessToken.sessionToken,
            accountId: accessToken.accountId,
            expiration: new Date(accessToken.expiresAt)
        };
    }
    get logger() {
        return this.init?.logger;
    }
    get loginSession() {
        return this.profileData.login_session;
    }
    async refresh(token) {
        const { SigninClient, CreateOAuth2TokenCommand } = await __turbopack_context__.A("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/signin/index.js [instrumentation] (ecmascript, async loader)");
        const { logger, userAgentAppId } = this.callerClientConfig ?? {};
        const isH2 = (requestHandler)=>{
            return requestHandler?.metadata?.handlerProtocol === "h2";
        };
        const requestHandler = isH2(this.callerClientConfig?.requestHandler) ? undefined : this.callerClientConfig?.requestHandler;
        const region = this.profileData.region ?? await this.callerClientConfig?.region?.() ?? process.env.AWS_REGION;
        const client = new SigninClient({
            credentials: {
                accessKeyId: "",
                secretAccessKey: ""
            },
            region,
            requestHandler,
            logger,
            userAgentAppId,
            ...this.init?.clientConfig
        });
        this.createDPoPInterceptor(client.middlewareStack);
        const commandInput = {
            tokenInput: {
                clientId: token.clientId,
                refreshToken: token.refreshToken,
                grantType: "refresh_token"
            }
        };
        try {
            const response = await client.send(new CreateOAuth2TokenCommand(commandInput));
            const { accessKeyId, secretAccessKey, sessionToken } = response.tokenOutput?.accessToken ?? {};
            const { refreshToken, expiresIn } = response.tokenOutput ?? {};
            if (!accessKeyId || !secretAccessKey || !sessionToken || !refreshToken) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"]("Token refresh response missing required fields", {
                    logger: this.logger,
                    tryNextLink: false
                });
            }
            const expiresInMs = (expiresIn ?? 900) * 1000;
            const expiration = new Date(Date.now() + expiresInMs);
            const updatedToken = {
                ...token,
                accessToken: {
                    ...token.accessToken,
                    accessKeyId,
                    secretAccessKey,
                    sessionToken,
                    expiresAt: expiration.toISOString()
                },
                refreshToken
            };
            await this.saveToken(updatedToken);
            const newAccessToken = updatedToken.accessToken;
            return {
                accessKeyId: newAccessToken.accessKeyId,
                secretAccessKey: newAccessToken.secretAccessKey,
                sessionToken: newAccessToken.sessionToken,
                accountId: newAccessToken.accountId,
                expiration
            };
        } catch (error) {
            if (error.name === "AccessDeniedException") {
                const errorType = error.error;
                let message;
                switch(errorType){
                    case "TOKEN_EXPIRED":
                        message = "Your session has expired. Please reauthenticate.";
                        break;
                    case "USER_CREDENTIALS_CHANGED":
                        message = "Unable to refresh credentials because of a change in your password. Please reauthenticate with your new password.";
                        break;
                    case "INSUFFICIENT_PERMISSIONS":
                        message = "Unable to refresh credentials due to insufficient permissions. You may be missing permission for the 'CreateOAuth2Token' action.";
                        break;
                    default:
                        message = `Failed to refresh token: ${String(error)}. Please re-authenticate using \`aws login\``;
                }
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](message, {
                    logger: this.logger,
                    tryNextLink: false
                });
            }
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`Failed to refresh token: ${String(error)}. Please re-authenticate using aws login`, {
                logger: this.logger
            });
        }
    }
    async loadToken() {
        const tokenFilePath = this.getTokenFilePath();
        try {
            let tokenData;
            try {
                tokenData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$readFile$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["readFile"])(tokenFilePath, {
                    ignoreCache: this.init?.ignoreCache
                });
            } catch  {
                tokenData = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].readFile(tokenFilePath, "utf8");
            }
            const token = JSON.parse(tokenData);
            const missingFields = [
                "accessToken",
                "clientId",
                "refreshToken",
                "dpopKey"
            ].filter((k)=>!token[k]);
            if (!token.accessToken?.accountId) {
                missingFields.push("accountId");
            }
            if (missingFields.length > 0) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`Token validation failed, missing fields: ${missingFields.join(", ")}`, {
                    logger: this.logger,
                    tryNextLink: false
                });
            }
            return token;
        } catch (error) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`Failed to load token from ${tokenFilePath}: ${String(error)}`, {
                logger: this.logger,
                tryNextLink: false
            });
        }
    }
    async saveToken(token) {
        const tokenFilePath = this.getTokenFilePath();
        const directory = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"])(tokenFilePath);
        try {
            await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].mkdir(directory, {
                recursive: true
            });
        } catch (error) {}
        await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["promises"].writeFile(tokenFilePath, JSON.stringify(token, null, 2), "utf8");
    }
    getTokenFilePath() {
        const directory = process.env.AWS_LOGIN_CACHE_DIRECTORY ?? (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__["homedir"])(), ".aws", "login", "cache");
        const loginSessionBytes = Buffer.from(this.loginSession, "utf8");
        const loginSessionSha256 = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(loginSessionBytes).digest("hex");
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["join"])(directory, `${loginSessionSha256}.json`);
    }
    derToRawSignature(derSignature) {
        let offset = 2;
        if (derSignature[offset] !== 0x02) {
            throw new Error("Invalid DER signature");
        }
        offset++;
        const rLength = derSignature[offset++];
        let r = derSignature.subarray(offset, offset + rLength);
        offset += rLength;
        if (derSignature[offset] !== 0x02) {
            throw new Error("Invalid DER signature");
        }
        offset++;
        const sLength = derSignature[offset++];
        let s = derSignature.subarray(offset, offset + sLength);
        r = r[0] === 0x00 ? r.subarray(1) : r;
        s = s[0] === 0x00 ? s.subarray(1) : s;
        const rPadded = Buffer.concat([
            Buffer.alloc(32 - r.length),
            r
        ]);
        const sPadded = Buffer.concat([
            Buffer.alloc(32 - s.length),
            s
        ]);
        return Buffer.concat([
            rPadded,
            sPadded
        ]);
    }
    createDPoPInterceptor(middlewareStack) {
        middlewareStack.add((next)=>async (args)=>{
                if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$httpRequest$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["HttpRequest"].isInstance(args.request)) {
                    const request = args.request;
                    const actualEndpoint = `${request.protocol}//${request.hostname}${request.port ? `:${request.port}` : ""}${request.path}`;
                    const dpop = await this.generateDpop(request.method, actualEndpoint);
                    request.headers = {
                        ...request.headers,
                        DPoP: dpop
                    };
                }
                return next(args);
            }, {
            step: "finalizeRequest",
            name: "dpopInterceptor",
            override: true
        });
    }
    async generateDpop(method = "POST", endpoint) {
        const token = await this.loadToken();
        try {
            const privateKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createPrivateKey"])({
                key: token.dpopKey,
                format: "pem",
                type: "sec1"
            });
            const publicKey = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createPublicKey"])(privateKey);
            const publicDer = publicKey.export({
                format: "der",
                type: "spki"
            });
            let pointStart = -1;
            for(let i = 0; i < publicDer.length; i++){
                if (publicDer[i] === 0x04) {
                    pointStart = i;
                    break;
                }
            }
            const x = publicDer.slice(pointStart + 1, pointStart + 33);
            const y = publicDer.slice(pointStart + 33, pointStart + 65);
            const header = {
                alg: "ES256",
                typ: "dpop+jwt",
                jwk: {
                    kty: "EC",
                    crv: "P-256",
                    x: x.toString("base64url"),
                    y: y.toString("base64url")
                }
            };
            const payload = {
                jti: crypto.randomUUID(),
                htm: method,
                htu: endpoint,
                iat: Math.floor(Date.now() / 1000)
            };
            const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
            const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
            const message = `${headerB64}.${payloadB64}`;
            const asn1Signature = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["sign"])("sha256", Buffer.from(message), privateKey);
            const rawSignature = this.derToRawSignature(asn1Signature);
            const signatureB64 = rawSignature.toString("base64url");
            return `${message}.${signatureB64}`;
        } catch (error) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`Failed to generate Dpop proof: ${error instanceof Error ? error.message : String(error)}`, {
                logger: this.logger,
                tryNextLink: false
            });
        }
    }
}
}),
"[project]/node_modules/@aws-sdk/credential-provider-login/dist-es/fromLoginCredentials.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromLoginCredentials",
    ()=>fromLoginCredentials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$setCredentialFeature$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/setCredentialFeature.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/property-provider/CredentialsProviderError.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getProfileName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/getProfileName.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseKnownFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/shared-ini-file-loader/parseKnownFiles.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$login$2f$dist$2d$es$2f$LoginCredentialsFetcher$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-login/dist-es/LoginCredentialsFetcher.js [instrumentation] (ecmascript)");
;
;
;
const fromLoginCredentials = (init)=>async ({ callerClientConfig } = {})=>{
        init?.logger?.debug?.("@aws-sdk/credential-providers - fromLoginCredentials");
        const profiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$parseKnownFiles$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["parseKnownFiles"])(init || {});
        const profileName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$shared$2d$ini$2d$file$2d$loader$2f$getProfileName$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getProfileName"])({
            profile: init?.profile ?? callerClientConfig?.profile
        });
        const profile = profiles[profileName];
        if (!profile?.login_session) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$property$2d$provider$2f$CredentialsProviderError$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["CredentialsProviderError"](`Profile ${profileName} does not contain login_session.`, {
                tryNextLink: true,
                logger: init?.logger
            });
        }
        const fetcher = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$login$2f$dist$2d$es$2f$LoginCredentialsFetcher$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["LoginCredentialsFetcher"](profile, init, callerClientConfig);
        const credentials = await fetcher.loadCredentials();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$setCredentialFeature$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["setCredentialFeature"])(credentials, "CREDENTIALS_LOGIN", "AD");
    };
}),
"[project]/node_modules/@aws-sdk/credential-provider-login/dist-es/index.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromLoginCredentials",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$login$2f$dist$2d$es$2f$fromLoginCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["fromLoginCredentials"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$login$2f$dist$2d$es$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-login/dist-es/index.js [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$login$2f$dist$2d$es$2f$fromLoginCredentials$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-login/dist-es/fromLoginCredentials.js [instrumentation] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1vz_gv2._.js.map
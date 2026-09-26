module.exports = [
"[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFormatter",
    ()=>useFormatter,
    "useTranslations",
    ()=>useTranslations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-ssr] (ecmascript)");
;
/**
 * This is the main entry file when non-'react-server'
 * environments import from 'next-intl'.
 *
 * Maintainer notes:
 * - Make sure this mirrors the API from 'react-server'.
 * - Make sure everything exported from this module is
 *   supported in all Next.js versions that are supported.
 */ // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function callHook(name, hook) {
    return (...args)=>{
        try {
            return hook(...args);
        } catch  {
            throw new Error(`Failed to call \`${name}\` because the context from \`NextIntlClientProvider\` was not found.

This can happen because:
1) You intended to render this component as a Server Component, the render
   failed, and therefore React attempted to render the component on the client
   instead. If this is the case, check the console for server errors.
2) You intended to render this component on the client side, but no context was found.
   Learn more about this error here: https://next-intl.dev/docs/environments/server-client-components#missing-context`);
        }
    };
}
const useTranslations = callHook('useTranslations', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"]);
const useFormatter = callHook('useFormatter', __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFormatter"]);
;
}),
"[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clsx",
    ()=>clsx,
    "default",
    ()=>__TURBOPACK__default__export__
]);
function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
        var o = e.length;
        for(t = 0; t < o; t++)e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for(f in e)e[f] && (n && (n += " "), n += f);
    return n;
}
function clsx() {
    for(var e, t, f = 0, n = "", o = arguments.length; f < o; f++)(e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
}
const __TURBOPACK__default__export__ = clsx;
}),
"[project]/node_modules/next/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
exports._ = _interop_require_default;
}),
"[project]/node_modules/es-toolkit/dist/string/words.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "words",
    ()=>words
]);
//#region src/string/words.ts
/**
* Regular expression pattern to split strings into words for various case conversions
*
* This pattern matches sequences of characters in a string, considering the following cases:
* - Sequences of two or more uppercase letters followed by an uppercase letter and lowercase letters or digits (for acronyms)
* - Sequences of one uppercase letter optionally followed by lowercase letters and digits
* - Single uppercase letters
* - Sequences of digits
* - Emojis and other Unicode characters
*
* The resulting match can be used to convert camelCase, snake_case, kebab-case, and other mixed formats into
* a consistent format like snake case. It also supports emojis and other Unicode characters.
*
* @example
* const matches = 'camelCaseHTTPRequest🚀'.match(CASE_SPLIT_PATTERN);
* // matches: ['camel', 'Case', 'HTTP', 'Request', '🚀']
*/ const CASE_SPLIT_PATTERN = /\p{Lu}?\p{Ll}+|[0-9]+|\p{Lu}+(?!\p{Ll})|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{L}+/gu;
/**
* Splits `string` into an array of its words, treating spaces and punctuation marks as separators.
*
* @param str The string to inspect.
* @param [pattern] The pattern to match words.
* @returns Returns the words of `string`.
*
* @example
* words('fred, barney, & pebbles');
* // => ['fred', 'barney', 'pebbles']
*
* words('camelCaseHTTPRequest🚀');
* // => ['camel', 'Case', 'HTTP', 'Request', '🚀']
*
* words('Lunedì 18 Set')
* // => ['Lunedì', '18', 'Set']
*/ function words(str) {
    return Array.from(str.match(CASE_SPLIT_PATTERN) ?? []);
}
;
}),
"[project]/node_modules/es-toolkit/dist/string/kebabCase.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "kebabCase",
    ()=>kebabCase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$es$2d$toolkit$2f$dist$2f$string$2f$words$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/es-toolkit/dist/string/words.mjs [app-ssr] (ecmascript)");
;
//#region src/string/kebabCase.ts
/**
* Converts a string to kebab case.
*
* Kebab case is the naming convention in which each word is written in lowercase and separated by a dash (-) character.
*
* @param str - The string that is to be changed to kebab case.
* @returns The converted string to kebab case.
*
* @example
* const convertedStr1 = kebabCase('camelCase') // returns 'camel-case'
* const convertedStr2 = kebabCase('some whitespace') // returns 'some-whitespace'
* const convertedStr3 = kebabCase('hyphen-text') // returns 'hyphen-text'
* const convertedStr4 = kebabCase('HTTPRequest') // returns 'http-request'
*/ function kebabCase(str) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$es$2d$toolkit$2f$dist$2f$string$2f$words$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["words"])(str).map((word)=>word.toLowerCase()).join("-");
}
;
}),
"[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("zod-dcb22c6336e0bc69");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__20w9you._.js.map
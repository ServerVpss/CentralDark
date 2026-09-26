module.exports = [
"[project]/node_modules/uuid/dist-node/rng.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>rng
]);
const rnds8 = new Uint8Array(16);
function rng() {
    return crypto.getRandomValues(rnds8);
}
}),
"[project]/node_modules/uuid/dist-node/regex.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
}),
"[project]/node_modules/uuid/dist-node/validate.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$regex$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/regex.js [instrumentation] (ecmascript)");
;
function validate(uuid) {
    return typeof uuid === 'string' && __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$regex$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"].test(uuid);
}
const __TURBOPACK__default__export__ = validate;
}),
"[project]/node_modules/uuid/dist-node/stringify.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "unsafeStringify",
    ()=>unsafeStringify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$validate$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/validate.js [instrumentation] (ecmascript)");
;
const byteToHex = [];
for(let i = 0; i < 256; ++i){
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$validate$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"])(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
}
const __TURBOPACK__default__export__ = stringify;
}),
"[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$rng$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/rng.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$stringify$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/stringify.js [instrumentation] (ecmascript)");
;
;
function v4(options, buf, offset) {
    if (!buf && !options && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return _v4(options, buf, offset);
}
function _v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$rng$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"])();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
        for(let i = 0; i < 16; ++i){
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$stringify$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["unsafeStringify"])(rnds);
}
const __TURBOPACK__default__export__ = v4;
}),
"[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript) <export default as v4>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "v4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [instrumentation] (ecmascript)");
}),
"[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/node_modules/better-sqlite3)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("better-sqlite3-90e2652d1716b047", () => require("better-sqlite3-90e2652d1716b047"));

module.exports = mod;
}),
"[externals]/zod [external] (zod, esm_import, [project]/node_modules/zod)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("zod-dcb22c6336e0bc69");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/node_modules/xxhash-wasm/esm/xxhash-wasm.js [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>e
]);
const t = new Uint8Array([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    48,
    8,
    96,
    3,
    127,
    127,
    127,
    1,
    127,
    96,
    3,
    127,
    127,
    127,
    0,
    96,
    2,
    127,
    127,
    0,
    96,
    1,
    127,
    1,
    127,
    96,
    3,
    127,
    127,
    126,
    1,
    126,
    96,
    3,
    126,
    127,
    127,
    1,
    126,
    96,
    2,
    127,
    126,
    0,
    96,
    1,
    127,
    1,
    126,
    3,
    11,
    10,
    0,
    0,
    2,
    1,
    3,
    4,
    5,
    6,
    1,
    7,
    5,
    3,
    1,
    0,
    1,
    7,
    85,
    9,
    3,
    109,
    101,
    109,
    2,
    0,
    5,
    120,
    120,
    104,
    51,
    50,
    0,
    0,
    6,
    105,
    110,
    105,
    116,
    51,
    50,
    0,
    2,
    8,
    117,
    112,
    100,
    97,
    116,
    101,
    51,
    50,
    0,
    3,
    8,
    100,
    105,
    103,
    101,
    115,
    116,
    51,
    50,
    0,
    4,
    5,
    120,
    120,
    104,
    54,
    52,
    0,
    5,
    6,
    105,
    110,
    105,
    116,
    54,
    52,
    0,
    7,
    8,
    117,
    112,
    100,
    97,
    116,
    101,
    54,
    52,
    0,
    8,
    8,
    100,
    105,
    103,
    101,
    115,
    116,
    54,
    52,
    0,
    9,
    10,
    251,
    22,
    10,
    242,
    1,
    1,
    4,
    127,
    32,
    0,
    32,
    1,
    106,
    33,
    3,
    32,
    1,
    65,
    16,
    79,
    4,
    127,
    32,
    3,
    65,
    16,
    107,
    33,
    6,
    32,
    2,
    65,
    168,
    136,
    141,
    161,
    2,
    106,
    33,
    3,
    32,
    2,
    65,
    137,
    235,
    208,
    208,
    7,
    107,
    33,
    4,
    32,
    2,
    65,
    207,
    140,
    162,
    142,
    6,
    106,
    33,
    5,
    3,
    64,
    32,
    3,
    32,
    0,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    3,
    32,
    4,
    32,
    0,
    65,
    4,
    106,
    34,
    0,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    4,
    32,
    2,
    32,
    0,
    65,
    4,
    106,
    34,
    0,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    2,
    32,
    5,
    32,
    0,
    65,
    4,
    106,
    34,
    0,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    5,
    32,
    6,
    32,
    0,
    65,
    4,
    106,
    34,
    0,
    79,
    13,
    0,
    11,
    32,
    2,
    65,
    12,
    119,
    32,
    5,
    65,
    18,
    119,
    106,
    32,
    4,
    65,
    7,
    119,
    106,
    32,
    3,
    65,
    1,
    119,
    106,
    5,
    32,
    2,
    65,
    177,
    207,
    217,
    178,
    1,
    106,
    11,
    32,
    1,
    106,
    32,
    0,
    32,
    1,
    65,
    15,
    113,
    16,
    1,
    11,
    146,
    1,
    0,
    32,
    1,
    32,
    2,
    106,
    33,
    2,
    3,
    64,
    32,
    1,
    65,
    4,
    106,
    32,
    2,
    75,
    69,
    4,
    64,
    32,
    0,
    32,
    1,
    40,
    2,
    0,
    65,
    189,
    220,
    202,
    149,
    124,
    108,
    106,
    65,
    17,
    119,
    65,
    175,
    214,
    211,
    190,
    2,
    108,
    33,
    0,
    32,
    1,
    65,
    4,
    106,
    33,
    1,
    12,
    1,
    11,
    11,
    3,
    64,
    32,
    1,
    32,
    2,
    79,
    69,
    4,
    64,
    32,
    0,
    32,
    1,
    45,
    0,
    0,
    65,
    177,
    207,
    217,
    178,
    1,
    108,
    106,
    65,
    11,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    0,
    32,
    1,
    65,
    1,
    106,
    33,
    1,
    12,
    1,
    11,
    11,
    32,
    0,
    32,
    0,
    65,
    15,
    118,
    115,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    34,
    0,
    65,
    13,
    118,
    32,
    0,
    115,
    65,
    189,
    220,
    202,
    149,
    124,
    108,
    34,
    0,
    65,
    16,
    118,
    32,
    0,
    115,
    11,
    63,
    0,
    32,
    0,
    65,
    8,
    106,
    32,
    1,
    65,
    168,
    136,
    141,
    161,
    2,
    106,
    54,
    2,
    0,
    32,
    0,
    65,
    12,
    106,
    32,
    1,
    65,
    137,
    235,
    208,
    208,
    7,
    107,
    54,
    2,
    0,
    32,
    0,
    65,
    16,
    106,
    32,
    1,
    54,
    2,
    0,
    32,
    0,
    65,
    20,
    106,
    32,
    1,
    65,
    207,
    140,
    162,
    142,
    6,
    106,
    54,
    2,
    0,
    11,
    195,
    4,
    1,
    6,
    127,
    32,
    1,
    32,
    2,
    106,
    33,
    6,
    32,
    0,
    65,
    24,
    106,
    33,
    4,
    32,
    0,
    65,
    40,
    106,
    40,
    2,
    0,
    33,
    3,
    32,
    0,
    32,
    0,
    40,
    2,
    0,
    32,
    2,
    106,
    54,
    2,
    0,
    32,
    0,
    65,
    4,
    106,
    34,
    5,
    32,
    5,
    40,
    2,
    0,
    32,
    2,
    65,
    16,
    79,
    32,
    0,
    40,
    2,
    0,
    65,
    16,
    79,
    114,
    114,
    54,
    2,
    0,
    32,
    2,
    32,
    3,
    106,
    65,
    16,
    73,
    4,
    64,
    32,
    3,
    32,
    4,
    106,
    32,
    1,
    32,
    2,
    252,
    10,
    0,
    0,
    32,
    0,
    65,
    40,
    106,
    32,
    2,
    32,
    3,
    106,
    54,
    2,
    0,
    15,
    11,
    32,
    3,
    4,
    64,
    32,
    3,
    32,
    4,
    106,
    32,
    1,
    65,
    16,
    32,
    3,
    107,
    34,
    2,
    252,
    10,
    0,
    0,
    32,
    0,
    65,
    8,
    106,
    34,
    3,
    32,
    3,
    40,
    2,
    0,
    32,
    4,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    54,
    2,
    0,
    32,
    0,
    65,
    12,
    106,
    34,
    3,
    32,
    3,
    40,
    2,
    0,
    32,
    4,
    65,
    4,
    106,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    54,
    2,
    0,
    32,
    0,
    65,
    16,
    106,
    34,
    3,
    32,
    3,
    40,
    2,
    0,
    32,
    4,
    65,
    8,
    106,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    54,
    2,
    0,
    32,
    0,
    65,
    20,
    106,
    34,
    3,
    32,
    3,
    40,
    2,
    0,
    32,
    4,
    65,
    12,
    106,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    54,
    2,
    0,
    32,
    0,
    65,
    40,
    106,
    65,
    0,
    54,
    2,
    0,
    32,
    1,
    32,
    2,
    106,
    33,
    1,
    11,
    32,
    1,
    32,
    6,
    65,
    16,
    107,
    77,
    4,
    64,
    32,
    6,
    65,
    16,
    107,
    33,
    8,
    32,
    0,
    65,
    8,
    106,
    40,
    2,
    0,
    33,
    2,
    32,
    0,
    65,
    12,
    106,
    40,
    2,
    0,
    33,
    3,
    32,
    0,
    65,
    16,
    106,
    40,
    2,
    0,
    33,
    5,
    32,
    0,
    65,
    20,
    106,
    40,
    2,
    0,
    33,
    7,
    3,
    64,
    32,
    2,
    32,
    1,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    2,
    32,
    3,
    32,
    1,
    65,
    4,
    106,
    34,
    1,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    3,
    32,
    5,
    32,
    1,
    65,
    4,
    106,
    34,
    1,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    5,
    32,
    7,
    32,
    1,
    65,
    4,
    106,
    34,
    1,
    40,
    2,
    0,
    65,
    247,
    148,
    175,
    175,
    120,
    108,
    106,
    65,
    13,
    119,
    65,
    177,
    243,
    221,
    241,
    121,
    108,
    33,
    7,
    32,
    8,
    32,
    1,
    65,
    4,
    106,
    34,
    1,
    79,
    13,
    0,
    11,
    32,
    0,
    65,
    8,
    106,
    32,
    2,
    54,
    2,
    0,
    32,
    0,
    65,
    12,
    106,
    32,
    3,
    54,
    2,
    0,
    32,
    0,
    65,
    16,
    106,
    32,
    5,
    54,
    2,
    0,
    32,
    0,
    65,
    20,
    106,
    32,
    7,
    54,
    2,
    0,
    11,
    32,
    1,
    32,
    6,
    73,
    4,
    64,
    32,
    4,
    32,
    1,
    32,
    6,
    32,
    1,
    107,
    34,
    1,
    252,
    10,
    0,
    0,
    32,
    0,
    65,
    40,
    106,
    32,
    1,
    54,
    2,
    0,
    11,
    11,
    97,
    1,
    1,
    127,
    32,
    0,
    65,
    16,
    106,
    40,
    2,
    0,
    33,
    1,
    32,
    0,
    65,
    4,
    106,
    40,
    2,
    0,
    4,
    127,
    32,
    1,
    65,
    12,
    119,
    32,
    0,
    65,
    20,
    106,
    40,
    2,
    0,
    65,
    18,
    119,
    106,
    32,
    0,
    65,
    12,
    106,
    40,
    2,
    0,
    65,
    7,
    119,
    106,
    32,
    0,
    65,
    8,
    106,
    40,
    2,
    0,
    65,
    1,
    119,
    106,
    5,
    32,
    1,
    65,
    177,
    207,
    217,
    178,
    1,
    106,
    11,
    32,
    0,
    40,
    2,
    0,
    106,
    32,
    0,
    65,
    24,
    106,
    32,
    0,
    65,
    40,
    106,
    40,
    2,
    0,
    16,
    1,
    11,
    255,
    3,
    2,
    3,
    126,
    1,
    127,
    32,
    0,
    32,
    1,
    106,
    33,
    6,
    32,
    1,
    65,
    32,
    79,
    4,
    126,
    32,
    6,
    65,
    32,
    107,
    33,
    6,
    32,
    2,
    66,
    214,
    235,
    130,
    238,
    234,
    253,
    137,
    245,
    224,
    0,
    124,
    33,
    3,
    32,
    2,
    66,
    177,
    169,
    172,
    193,
    173,
    184,
    212,
    166,
    61,
    125,
    33,
    4,
    32,
    2,
    66,
    249,
    234,
    208,
    208,
    231,
    201,
    161,
    228,
    225,
    0,
    124,
    33,
    5,
    3,
    64,
    32,
    3,
    32,
    0,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    3,
    32,
    4,
    32,
    0,
    65,
    8,
    106,
    34,
    0,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    4,
    32,
    2,
    32,
    0,
    65,
    8,
    106,
    34,
    0,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    2,
    32,
    5,
    32,
    0,
    65,
    8,
    106,
    34,
    0,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    5,
    32,
    6,
    32,
    0,
    65,
    8,
    106,
    34,
    0,
    79,
    13,
    0,
    11,
    32,
    2,
    66,
    12,
    137,
    32,
    5,
    66,
    18,
    137,
    124,
    32,
    4,
    66,
    7,
    137,
    124,
    32,
    3,
    66,
    1,
    137,
    124,
    32,
    3,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    32,
    4,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    32,
    2,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    32,
    5,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    5,
    32,
    2,
    66,
    197,
    207,
    217,
    178,
    241,
    229,
    186,
    234,
    39,
    124,
    11,
    32,
    1,
    173,
    124,
    32,
    0,
    32,
    1,
    65,
    31,
    113,
    16,
    6,
    11,
    134,
    2,
    0,
    32,
    1,
    32,
    2,
    106,
    33,
    2,
    3,
    64,
    32,
    2,
    32,
    1,
    65,
    8,
    106,
    79,
    4,
    64,
    32,
    1,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    32,
    0,
    133,
    66,
    27,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    33,
    0,
    32,
    1,
    65,
    8,
    106,
    33,
    1,
    12,
    1,
    11,
    11,
    32,
    1,
    65,
    4,
    106,
    32,
    2,
    77,
    4,
    64,
    32,
    0,
    32,
    1,
    53,
    2,
    0,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    23,
    137,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    249,
    243,
    221,
    241,
    153,
    246,
    153,
    171,
    22,
    124,
    33,
    0,
    32,
    1,
    65,
    4,
    106,
    33,
    1,
    11,
    3,
    64,
    32,
    1,
    32,
    2,
    73,
    4,
    64,
    32,
    0,
    32,
    1,
    49,
    0,
    0,
    66,
    197,
    207,
    217,
    178,
    241,
    229,
    186,
    234,
    39,
    126,
    133,
    66,
    11,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    0,
    32,
    1,
    65,
    1,
    106,
    33,
    1,
    12,
    1,
    11,
    11,
    32,
    0,
    32,
    0,
    66,
    33,
    136,
    133,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    34,
    0,
    32,
    0,
    66,
    29,
    136,
    133,
    66,
    249,
    243,
    221,
    241,
    153,
    246,
    153,
    171,
    22,
    126,
    34,
    0,
    32,
    0,
    66,
    32,
    136,
    133,
    11,
    77,
    0,
    32,
    0,
    65,
    8,
    106,
    32,
    1,
    66,
    214,
    235,
    130,
    238,
    234,
    253,
    137,
    245,
    224,
    0,
    124,
    55,
    3,
    0,
    32,
    0,
    65,
    16,
    106,
    32,
    1,
    66,
    177,
    169,
    172,
    193,
    173,
    184,
    212,
    166,
    61,
    125,
    55,
    3,
    0,
    32,
    0,
    65,
    24,
    106,
    32,
    1,
    55,
    3,
    0,
    32,
    0,
    65,
    32,
    106,
    32,
    1,
    66,
    249,
    234,
    208,
    208,
    231,
    201,
    161,
    228,
    225,
    0,
    124,
    55,
    3,
    0,
    11,
    244,
    4,
    2,
    3,
    127,
    4,
    126,
    32,
    1,
    32,
    2,
    106,
    33,
    5,
    32,
    0,
    65,
    40,
    106,
    33,
    4,
    32,
    0,
    65,
    200,
    0,
    106,
    40,
    2,
    0,
    33,
    3,
    32,
    0,
    32,
    0,
    41,
    3,
    0,
    32,
    2,
    173,
    124,
    55,
    3,
    0,
    32,
    2,
    32,
    3,
    106,
    65,
    32,
    73,
    4,
    64,
    32,
    3,
    32,
    4,
    106,
    32,
    1,
    32,
    2,
    252,
    10,
    0,
    0,
    32,
    0,
    65,
    200,
    0,
    106,
    32,
    2,
    32,
    3,
    106,
    54,
    2,
    0,
    15,
    11,
    32,
    3,
    4,
    64,
    32,
    3,
    32,
    4,
    106,
    32,
    1,
    65,
    32,
    32,
    3,
    107,
    34,
    2,
    252,
    10,
    0,
    0,
    32,
    0,
    65,
    8,
    106,
    34,
    3,
    32,
    3,
    41,
    3,
    0,
    32,
    4,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    55,
    3,
    0,
    32,
    0,
    65,
    16,
    106,
    34,
    3,
    32,
    3,
    41,
    3,
    0,
    32,
    4,
    65,
    8,
    106,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    55,
    3,
    0,
    32,
    0,
    65,
    24,
    106,
    34,
    3,
    32,
    3,
    41,
    3,
    0,
    32,
    4,
    65,
    16,
    106,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    55,
    3,
    0,
    32,
    0,
    65,
    32,
    106,
    34,
    3,
    32,
    3,
    41,
    3,
    0,
    32,
    4,
    65,
    24,
    106,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    55,
    3,
    0,
    32,
    0,
    65,
    200,
    0,
    106,
    65,
    0,
    54,
    2,
    0,
    32,
    1,
    32,
    2,
    106,
    33,
    1,
    11,
    32,
    1,
    65,
    32,
    106,
    32,
    5,
    77,
    4,
    64,
    32,
    5,
    65,
    32,
    107,
    33,
    2,
    32,
    0,
    65,
    8,
    106,
    41,
    3,
    0,
    33,
    6,
    32,
    0,
    65,
    16,
    106,
    41,
    3,
    0,
    33,
    7,
    32,
    0,
    65,
    24,
    106,
    41,
    3,
    0,
    33,
    8,
    32,
    0,
    65,
    32,
    106,
    41,
    3,
    0,
    33,
    9,
    3,
    64,
    32,
    6,
    32,
    1,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    6,
    32,
    7,
    32,
    1,
    65,
    8,
    106,
    34,
    1,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    7,
    32,
    8,
    32,
    1,
    65,
    8,
    106,
    34,
    1,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    8,
    32,
    9,
    32,
    1,
    65,
    8,
    106,
    34,
    1,
    41,
    3,
    0,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    124,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    33,
    9,
    32,
    2,
    32,
    1,
    65,
    8,
    106,
    34,
    1,
    79,
    13,
    0,
    11,
    32,
    0,
    65,
    8,
    106,
    32,
    6,
    55,
    3,
    0,
    32,
    0,
    65,
    16,
    106,
    32,
    7,
    55,
    3,
    0,
    32,
    0,
    65,
    24,
    106,
    32,
    8,
    55,
    3,
    0,
    32,
    0,
    65,
    32,
    106,
    32,
    9,
    55,
    3,
    0,
    11,
    32,
    1,
    32,
    5,
    73,
    4,
    64,
    32,
    4,
    32,
    1,
    32,
    5,
    32,
    1,
    107,
    34,
    1,
    252,
    10,
    0,
    0,
    32,
    0,
    65,
    200,
    0,
    106,
    32,
    1,
    54,
    2,
    0,
    11,
    11,
    188,
    2,
    1,
    5,
    126,
    32,
    0,
    65,
    24,
    106,
    41,
    3,
    0,
    33,
    1,
    32,
    0,
    41,
    3,
    0,
    34,
    2,
    66,
    32,
    90,
    4,
    126,
    32,
    0,
    65,
    8,
    106,
    41,
    3,
    0,
    34,
    3,
    66,
    1,
    137,
    32,
    0,
    65,
    16,
    106,
    41,
    3,
    0,
    34,
    4,
    66,
    7,
    137,
    124,
    32,
    1,
    66,
    12,
    137,
    32,
    0,
    65,
    32,
    106,
    41,
    3,
    0,
    34,
    5,
    66,
    18,
    137,
    124,
    124,
    32,
    3,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    32,
    4,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    32,
    1,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    32,
    5,
    66,
    207,
    214,
    211,
    190,
    210,
    199,
    171,
    217,
    66,
    126,
    66,
    31,
    137,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    133,
    66,
    135,
    149,
    175,
    175,
    152,
    182,
    222,
    155,
    158,
    127,
    126,
    66,
    157,
    163,
    181,
    234,
    131,
    177,
    141,
    138,
    250,
    0,
    125,
    5,
    32,
    1,
    66,
    197,
    207,
    217,
    178,
    241,
    229,
    186,
    234,
    39,
    124,
    11,
    32,
    2,
    124,
    32,
    0,
    65,
    40,
    106,
    32,
    2,
    66,
    31,
    131,
    167,
    16,
    6,
    11
]);
async function e() {
    return function(t) {
        const { exports: { mem: e, xxh32: n, xxh64: r, init32: i, update32: a, digest32: o, init64: s, update64: u, digest64: c } } = t;
        let h = new Uint8Array(e.buffer);
        function g(t, n) {
            if (e.buffer.byteLength < t + n) {
                const r = Math.ceil((t + n - e.buffer.byteLength) / 65536);
                e.grow(r), h = new Uint8Array(e.buffer);
            }
        }
        function f(t, e, n, r, i, a) {
            g(t);
            const o = new Uint8Array(t);
            return h.set(o), n(0, e), o.set(h.subarray(0, t)), {
                update (e) {
                    let n;
                    return h.set(o), "string" == typeof e ? (g(3 * e.length, t), n = w.encodeInto(e, h.subarray(t)).written) : (g(e.byteLength, t), h.set(e, t), n = e.byteLength), r(0, t, n), o.set(h.subarray(0, t)), this;
                },
                digest: ()=>(h.set(o), a(i(0)))
            };
        }
        function y(t) {
            return t >>> 0;
        }
        const b = 2n ** 64n - 1n;
        function d(t) {
            return t & b;
        }
        const w = new TextEncoder, l = 0, p = 0n;
        function x(t, e = l) {
            return g(3 * t.length, 0), y(n(0, w.encodeInto(t, h).written, e));
        }
        function L(t, e = p) {
            return g(3 * t.length, 0), d(r(0, w.encodeInto(t, h).written, e));
        }
        return {
            h32: x,
            h32ToString: (t, e = l)=>x(t, e).toString(16).padStart(8, "0"),
            h32Raw: (t, e = l)=>(g(t.byteLength, 0), h.set(t), y(n(0, t.byteLength, e))),
            create32: (t = l)=>f(48, t, i, a, o, y),
            h64: L,
            h64ToString: (t, e = p)=>L(t, e).toString(16).padStart(16, "0"),
            h64Raw: (t, e = p)=>(g(t.byteLength, 0), h.set(t), d(r(0, t.byteLength, e))),
            create64: (t = p)=>f(88, t, s, u, c, d)
        };
    }((await WebAssembly.instantiate(t)).instance);
}
;
}),
"[externals]/ws [external] (ws, esm_import, [project]/node_modules/ws)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("ws-a972e7ffa40ff725");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/node_modules/smart-buffer/build/utils.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const buffer_1 = __turbopack_context__.r("[externals]/buffer [external] (buffer, cjs)");
/**
 * Error strings
 */ const ERRORS = {
    INVALID_ENCODING: 'Invalid encoding provided. Please specify a valid encoding the internal Node.js Buffer supports.',
    INVALID_SMARTBUFFER_SIZE: 'Invalid size provided. Size must be a valid integer greater than zero.',
    INVALID_SMARTBUFFER_BUFFER: 'Invalid Buffer provided in SmartBufferOptions.',
    INVALID_SMARTBUFFER_OBJECT: 'Invalid SmartBufferOptions object supplied to SmartBuffer constructor or factory methods.',
    INVALID_OFFSET: 'An invalid offset value was provided.',
    INVALID_OFFSET_NON_NUMBER: 'An invalid offset value was provided. A numeric value is required.',
    INVALID_LENGTH: 'An invalid length value was provided.',
    INVALID_LENGTH_NON_NUMBER: 'An invalid length value was provived. A numeric value is required.',
    INVALID_TARGET_OFFSET: 'Target offset is beyond the bounds of the internal SmartBuffer data.',
    INVALID_TARGET_LENGTH: 'Specified length value moves cursor beyong the bounds of the internal SmartBuffer data.',
    INVALID_READ_BEYOND_BOUNDS: 'Attempted to read beyond the bounds of the managed data.',
    INVALID_WRITE_BEYOND_BOUNDS: 'Attempted to write beyond the bounds of the managed data.'
};
exports.ERRORS = ERRORS;
/**
 * Checks if a given encoding is a valid Buffer encoding. (Throws an exception if check fails)
 *
 * @param { String } encoding The encoding string to check.
 */ function checkEncoding(encoding) {
    if (!buffer_1.Buffer.isEncoding(encoding)) {
        throw new Error(ERRORS.INVALID_ENCODING);
    }
}
exports.checkEncoding = checkEncoding;
/**
 * Checks if a given number is a finite integer. (Throws an exception if check fails)
 *
 * @param { Number } value The number value to check.
 */ function isFiniteInteger(value) {
    return typeof value === 'number' && isFinite(value) && isInteger(value);
}
exports.isFiniteInteger = isFiniteInteger;
/**
 * Checks if an offset/length value is valid. (Throws an exception if check fails)
 *
 * @param value The value to check.
 * @param offset True if checking an offset, false if checking a length.
 */ function checkOffsetOrLengthValue(value, offset) {
    if (typeof value === 'number') {
        // Check for non finite/non integers
        if (!isFiniteInteger(value) || value < 0) {
            throw new Error(offset ? ERRORS.INVALID_OFFSET : ERRORS.INVALID_LENGTH);
        }
    } else {
        throw new Error(offset ? ERRORS.INVALID_OFFSET_NON_NUMBER : ERRORS.INVALID_LENGTH_NON_NUMBER);
    }
}
/**
 * Checks if a length value is valid. (Throws an exception if check fails)
 *
 * @param { Number } length The value to check.
 */ function checkLengthValue(length) {
    checkOffsetOrLengthValue(length, false);
}
exports.checkLengthValue = checkLengthValue;
/**
 * Checks if a offset value is valid. (Throws an exception if check fails)
 *
 * @param { Number } offset The value to check.
 */ function checkOffsetValue(offset) {
    checkOffsetOrLengthValue(offset, true);
}
exports.checkOffsetValue = checkOffsetValue;
/**
 * Checks if a target offset value is out of bounds. (Throws an exception if check fails)
 *
 * @param { Number } offset The offset value to check.
 * @param { SmartBuffer } buff The SmartBuffer instance to check against.
 */ function checkTargetOffset(offset, buff) {
    if (offset < 0 || offset > buff.length) {
        throw new Error(ERRORS.INVALID_TARGET_OFFSET);
    }
}
exports.checkTargetOffset = checkTargetOffset;
/**
 * Determines whether a given number is a integer.
 * @param value The number to check.
 */ function isInteger(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}
/**
 * Throws if Node.js version is too low to support bigint
 */ function bigIntAndBufferInt64Check(bufferMethod) {
    if (typeof BigInt === 'undefined') {
        throw new Error('Platform does not support JS BigInt type.');
    }
    if (typeof buffer_1.Buffer.prototype[bufferMethod] === 'undefined') {
        throw new Error(`Platform does not support Buffer.prototype.${bufferMethod}.`);
    }
}
exports.bigIntAndBufferInt64Check = bigIntAndBufferInt64Check;
}),
"[project]/node_modules/smart-buffer/build/smartbuffer.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const utils_1 = __turbopack_context__.r("[project]/node_modules/smart-buffer/build/utils.js [instrumentation] (ecmascript)");
// The default Buffer size if one is not provided.
const DEFAULT_SMARTBUFFER_SIZE = 4096;
// The default string encoding to use for reading/writing strings.
const DEFAULT_SMARTBUFFER_ENCODING = 'utf8';
class SmartBuffer {
    /**
     * Creates a new SmartBuffer instance.
     *
     * @param options { SmartBufferOptions } The SmartBufferOptions to apply to this instance.
     */ constructor(options){
        this.length = 0;
        this._encoding = DEFAULT_SMARTBUFFER_ENCODING;
        this._writeOffset = 0;
        this._readOffset = 0;
        if (SmartBuffer.isSmartBufferOptions(options)) {
            // Checks for encoding
            if (options.encoding) {
                utils_1.checkEncoding(options.encoding);
                this._encoding = options.encoding;
            }
            // Checks for initial size length
            if (options.size) {
                if (utils_1.isFiniteInteger(options.size) && options.size > 0) {
                    this._buff = Buffer.allocUnsafe(options.size);
                } else {
                    throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_SIZE);
                }
            // Check for initial Buffer
            } else if (options.buff) {
                if (Buffer.isBuffer(options.buff)) {
                    this._buff = options.buff;
                    this.length = options.buff.length;
                } else {
                    throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_BUFFER);
                }
            } else {
                this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
            }
        } else {
            // If something was passed but it's not a SmartBufferOptions object
            if (typeof options !== 'undefined') {
                throw new Error(utils_1.ERRORS.INVALID_SMARTBUFFER_OBJECT);
            }
            // Otherwise default to sane options
            this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
        }
    }
    /**
     * Creates a new SmartBuffer instance with the provided internal Buffer size and optional encoding.
     *
     * @param size { Number } The size of the internal Buffer.
     * @param encoding { String } The BufferEncoding to use for strings.
     *
     * @return { SmartBuffer }
     */ static fromSize(size, encoding) {
        return new this({
            size: size,
            encoding: encoding
        });
    }
    /**
     * Creates a new SmartBuffer instance with the provided Buffer and optional encoding.
     *
     * @param buffer { Buffer } The Buffer to use as the internal Buffer value.
     * @param encoding { String } The BufferEncoding to use for strings.
     *
     * @return { SmartBuffer }
     */ static fromBuffer(buff, encoding) {
        return new this({
            buff: buff,
            encoding: encoding
        });
    }
    /**
     * Creates a new SmartBuffer instance with the provided SmartBufferOptions options.
     *
     * @param options { SmartBufferOptions } The options to use when creating the SmartBuffer instance.
     */ static fromOptions(options) {
        return new this(options);
    }
    /**
     * Type checking function that determines if an object is a SmartBufferOptions object.
     */ static isSmartBufferOptions(options) {
        const castOptions = options;
        return castOptions && (castOptions.encoding !== undefined || castOptions.size !== undefined || castOptions.buff !== undefined);
    }
    // Signed integers
    /**
     * Reads an Int8 value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt8(offset) {
        return this._readNumberValue(Buffer.prototype.readInt8, 1, offset);
    }
    /**
     * Reads an Int16BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt16BE(offset) {
        return this._readNumberValue(Buffer.prototype.readInt16BE, 2, offset);
    }
    /**
     * Reads an Int16LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt16LE(offset) {
        return this._readNumberValue(Buffer.prototype.readInt16LE, 2, offset);
    }
    /**
     * Reads an Int32BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt32BE(offset) {
        return this._readNumberValue(Buffer.prototype.readInt32BE, 4, offset);
    }
    /**
     * Reads an Int32LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readInt32LE(offset) {
        return this._readNumberValue(Buffer.prototype.readInt32LE, 4, offset);
    }
    /**
     * Reads a BigInt64BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { BigInt }
     */ readBigInt64BE(offset) {
        utils_1.bigIntAndBufferInt64Check('readBigInt64BE');
        return this._readNumberValue(Buffer.prototype.readBigInt64BE, 8, offset);
    }
    /**
     * Reads a BigInt64LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { BigInt }
     */ readBigInt64LE(offset) {
        utils_1.bigIntAndBufferInt64Check('readBigInt64LE');
        return this._readNumberValue(Buffer.prototype.readBigInt64LE, 8, offset);
    }
    /**
     * Writes an Int8 value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt8(value, offset) {
        this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
        return this;
    }
    /**
     * Inserts an Int8 value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt8(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
    }
    /**
     * Writes an Int16BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt16BE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
    }
    /**
     * Inserts an Int16BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt16BE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt16BE, 2, value, offset);
    }
    /**
     * Writes an Int16LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt16LE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
    }
    /**
     * Inserts an Int16LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt16LE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt16LE, 2, value, offset);
    }
    /**
     * Writes an Int32BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt32BE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
    }
    /**
     * Inserts an Int32BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt32BE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt32BE, 4, value, offset);
    }
    /**
     * Writes an Int32LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeInt32LE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
    }
    /**
     * Inserts an Int32LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertInt32LE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeInt32LE, 4, value, offset);
    }
    /**
     * Writes a BigInt64BE value to the current write position (or at optional offset).
     *
     * @param value { BigInt } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeBigInt64BE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigInt64BE');
        return this._writeNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
    }
    /**
     * Inserts a BigInt64BE value at the given offset value.
     *
     * @param value { BigInt } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertBigInt64BE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigInt64BE');
        return this._insertNumberValue(Buffer.prototype.writeBigInt64BE, 8, value, offset);
    }
    /**
     * Writes a BigInt64LE value to the current write position (or at optional offset).
     *
     * @param value { BigInt } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeBigInt64LE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigInt64LE');
        return this._writeNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
    }
    /**
     * Inserts a Int64LE value at the given offset value.
     *
     * @param value { BigInt } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertBigInt64LE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigInt64LE');
        return this._insertNumberValue(Buffer.prototype.writeBigInt64LE, 8, value, offset);
    }
    // Unsigned Integers
    /**
     * Reads an UInt8 value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt8(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt8, 1, offset);
    }
    /**
     * Reads an UInt16BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt16BE(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt16BE, 2, offset);
    }
    /**
     * Reads an UInt16LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt16LE(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt16LE, 2, offset);
    }
    /**
     * Reads an UInt32BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt32BE(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt32BE, 4, offset);
    }
    /**
     * Reads an UInt32LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readUInt32LE(offset) {
        return this._readNumberValue(Buffer.prototype.readUInt32LE, 4, offset);
    }
    /**
     * Reads a BigUInt64BE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { BigInt }
     */ readBigUInt64BE(offset) {
        utils_1.bigIntAndBufferInt64Check('readBigUInt64BE');
        return this._readNumberValue(Buffer.prototype.readBigUInt64BE, 8, offset);
    }
    /**
     * Reads a BigUInt64LE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { BigInt }
     */ readBigUInt64LE(offset) {
        utils_1.bigIntAndBufferInt64Check('readBigUInt64LE');
        return this._readNumberValue(Buffer.prototype.readBigUInt64LE, 8, offset);
    }
    /**
     * Writes an UInt8 value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt8(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
    }
    /**
     * Inserts an UInt8 value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt8(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt8, 1, value, offset);
    }
    /**
     * Writes an UInt16BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt16BE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
    }
    /**
     * Inserts an UInt16BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt16BE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt16BE, 2, value, offset);
    }
    /**
     * Writes an UInt16LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt16LE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
    }
    /**
     * Inserts an UInt16LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt16LE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt16LE, 2, value, offset);
    }
    /**
     * Writes an UInt32BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt32BE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
    }
    /**
     * Inserts an UInt32BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt32BE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt32BE, 4, value, offset);
    }
    /**
     * Writes an UInt32LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeUInt32LE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
    }
    /**
     * Inserts an UInt32LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertUInt32LE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeUInt32LE, 4, value, offset);
    }
    /**
     * Writes a BigUInt64BE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeBigUInt64BE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigUInt64BE');
        return this._writeNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
    }
    /**
     * Inserts a BigUInt64BE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertBigUInt64BE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigUInt64BE');
        return this._insertNumberValue(Buffer.prototype.writeBigUInt64BE, 8, value, offset);
    }
    /**
     * Writes a BigUInt64LE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeBigUInt64LE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigUInt64LE');
        return this._writeNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
    }
    /**
     * Inserts a BigUInt64LE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertBigUInt64LE(value, offset) {
        utils_1.bigIntAndBufferInt64Check('writeBigUInt64LE');
        return this._insertNumberValue(Buffer.prototype.writeBigUInt64LE, 8, value, offset);
    }
    // Floating Point
    /**
     * Reads an FloatBE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readFloatBE(offset) {
        return this._readNumberValue(Buffer.prototype.readFloatBE, 4, offset);
    }
    /**
     * Reads an FloatLE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readFloatLE(offset) {
        return this._readNumberValue(Buffer.prototype.readFloatLE, 4, offset);
    }
    /**
     * Writes a FloatBE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeFloatBE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
    }
    /**
     * Inserts a FloatBE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertFloatBE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeFloatBE, 4, value, offset);
    }
    /**
     * Writes a FloatLE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeFloatLE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
    }
    /**
     * Inserts a FloatLE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertFloatLE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeFloatLE, 4, value, offset);
    }
    // Double Floating Point
    /**
     * Reads an DoublEBE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readDoubleBE(offset) {
        return this._readNumberValue(Buffer.prototype.readDoubleBE, 8, offset);
    }
    /**
     * Reads an DoubleLE value from the current read position or an optionally provided offset.
     *
     * @param offset { Number } The offset to read data from (optional)
     * @return { Number }
     */ readDoubleLE(offset) {
        return this._readNumberValue(Buffer.prototype.readDoubleLE, 8, offset);
    }
    /**
     * Writes a DoubleBE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeDoubleBE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
    }
    /**
     * Inserts a DoubleBE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertDoubleBE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeDoubleBE, 8, value, offset);
    }
    /**
     * Writes a DoubleLE value to the current write position (or at optional offset).
     *
     * @param value { Number } The value to write.
     * @param offset { Number } The offset to write the value at.
     *
     * @return this
     */ writeDoubleLE(value, offset) {
        return this._writeNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
    }
    /**
     * Inserts a DoubleLE value at the given offset value.
     *
     * @param value { Number } The value to insert.
     * @param offset { Number } The offset to insert the value at.
     *
     * @return this
     */ insertDoubleLE(value, offset) {
        return this._insertNumberValue(Buffer.prototype.writeDoubleLE, 8, value, offset);
    }
    // Strings
    /**
     * Reads a String from the current read position.
     *
     * @param arg1 { Number | String } The number of bytes to read as a String, or the BufferEncoding to use for
     *             the string (Defaults to instance level encoding).
     * @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
     *
     * @return { String }
     */ readString(arg1, encoding) {
        let lengthVal;
        // Length provided
        if (typeof arg1 === 'number') {
            utils_1.checkLengthValue(arg1);
            lengthVal = Math.min(arg1, this.length - this._readOffset);
        } else {
            encoding = arg1;
            lengthVal = this.length - this._readOffset;
        }
        // Check encoding
        if (typeof encoding !== 'undefined') {
            utils_1.checkEncoding(encoding);
        }
        const value = this._buff.slice(this._readOffset, this._readOffset + lengthVal).toString(encoding || this._encoding);
        this._readOffset += lengthVal;
        return value;
    }
    /**
     * Inserts a String
     *
     * @param value { String } The String value to insert.
     * @param offset { Number } The offset to insert the string at.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     *
     * @return this
     */ insertString(value, offset, encoding) {
        utils_1.checkOffsetValue(offset);
        return this._handleString(value, true, offset, encoding);
    }
    /**
     * Writes a String
     *
     * @param value { String } The String value to write.
     * @param arg2 { Number | String } The offset to write the string at, or the BufferEncoding to use.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     *
     * @return this
     */ writeString(value, arg2, encoding) {
        return this._handleString(value, false, arg2, encoding);
    }
    /**
     * Reads a null-terminated String from the current read position.
     *
     * @param encoding { String } The BufferEncoding to use for the string (Defaults to instance level encoding).
     *
     * @return { String }
     */ readStringNT(encoding) {
        if (typeof encoding !== 'undefined') {
            utils_1.checkEncoding(encoding);
        }
        // Set null character position to the end SmartBuffer instance.
        let nullPos = this.length;
        // Find next null character (if one is not found, default from above is used)
        for(let i = this._readOffset; i < this.length; i++){
            if (this._buff[i] === 0x00) {
                nullPos = i;
                break;
            }
        }
        // Read string value
        const value = this._buff.slice(this._readOffset, nullPos);
        // Increment internal Buffer read offset
        this._readOffset = nullPos + 1;
        return value.toString(encoding || this._encoding);
    }
    /**
     * Inserts a null-terminated String.
     *
     * @param value { String } The String value to write.
     * @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     *
     * @return this
     */ insertStringNT(value, offset, encoding) {
        utils_1.checkOffsetValue(offset);
        // Write Values
        this.insertString(value, offset, encoding);
        this.insertUInt8(0x00, offset + value.length);
        return this;
    }
    /**
     * Writes a null-terminated String.
     *
     * @param value { String } The String value to write.
     * @param arg2 { Number | String } The offset to write the string to, or the BufferEncoding to use.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     *
     * @return this
     */ writeStringNT(value, arg2, encoding) {
        // Write Values
        this.writeString(value, arg2, encoding);
        this.writeUInt8(0x00, typeof arg2 === 'number' ? arg2 + value.length : this.writeOffset);
        return this;
    }
    // Buffers
    /**
     * Reads a Buffer from the internal read position.
     *
     * @param length { Number } The length of data to read as a Buffer.
     *
     * @return { Buffer }
     */ readBuffer(length) {
        if (typeof length !== 'undefined') {
            utils_1.checkLengthValue(length);
        }
        const lengthVal = typeof length === 'number' ? length : this.length;
        const endPoint = Math.min(this.length, this._readOffset + lengthVal);
        // Read buffer value
        const value = this._buff.slice(this._readOffset, endPoint);
        // Increment internal Buffer read offset
        this._readOffset = endPoint;
        return value;
    }
    /**
     * Writes a Buffer to the current write position.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     *
     * @return this
     */ insertBuffer(value, offset) {
        utils_1.checkOffsetValue(offset);
        return this._handleBuffer(value, true, offset);
    }
    /**
     * Writes a Buffer to the current write position.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     *
     * @return this
     */ writeBuffer(value, offset) {
        return this._handleBuffer(value, false, offset);
    }
    /**
     * Reads a null-terminated Buffer from the current read poisiton.
     *
     * @return { Buffer }
     */ readBufferNT() {
        // Set null character position to the end SmartBuffer instance.
        let nullPos = this.length;
        // Find next null character (if one is not found, default from above is used)
        for(let i = this._readOffset; i < this.length; i++){
            if (this._buff[i] === 0x00) {
                nullPos = i;
                break;
            }
        }
        // Read value
        const value = this._buff.slice(this._readOffset, nullPos);
        // Increment internal Buffer read offset
        this._readOffset = nullPos + 1;
        return value;
    }
    /**
     * Inserts a null-terminated Buffer.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     *
     * @return this
     */ insertBufferNT(value, offset) {
        utils_1.checkOffsetValue(offset);
        // Write Values
        this.insertBuffer(value, offset);
        this.insertUInt8(0x00, offset + value.length);
        return this;
    }
    /**
     * Writes a null-terminated Buffer.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     *
     * @return this
     */ writeBufferNT(value, offset) {
        // Checks for valid numberic value;
        if (typeof offset !== 'undefined') {
            utils_1.checkOffsetValue(offset);
        }
        // Write Values
        this.writeBuffer(value, offset);
        this.writeUInt8(0x00, typeof offset === 'number' ? offset + value.length : this._writeOffset);
        return this;
    }
    /**
     * Clears the SmartBuffer instance to its original empty state.
     */ clear() {
        this._writeOffset = 0;
        this._readOffset = 0;
        this.length = 0;
        return this;
    }
    /**
     * Gets the remaining data left to be read from the SmartBuffer instance.
     *
     * @return { Number }
     */ remaining() {
        return this.length - this._readOffset;
    }
    /**
     * Gets the current read offset value of the SmartBuffer instance.
     *
     * @return { Number }
     */ get readOffset() {
        return this._readOffset;
    }
    /**
     * Sets the read offset value of the SmartBuffer instance.
     *
     * @param offset { Number } - The offset value to set.
     */ set readOffset(offset) {
        utils_1.checkOffsetValue(offset);
        // Check for bounds.
        utils_1.checkTargetOffset(offset, this);
        this._readOffset = offset;
    }
    /**
     * Gets the current write offset value of the SmartBuffer instance.
     *
     * @return { Number }
     */ get writeOffset() {
        return this._writeOffset;
    }
    /**
     * Sets the write offset value of the SmartBuffer instance.
     *
     * @param offset { Number } - The offset value to set.
     */ set writeOffset(offset) {
        utils_1.checkOffsetValue(offset);
        // Check for bounds.
        utils_1.checkTargetOffset(offset, this);
        this._writeOffset = offset;
    }
    /**
     * Gets the currently set string encoding of the SmartBuffer instance.
     *
     * @return { BufferEncoding } The string Buffer encoding currently set.
     */ get encoding() {
        return this._encoding;
    }
    /**
     * Sets the string encoding of the SmartBuffer instance.
     *
     * @param encoding { BufferEncoding } The string Buffer encoding to set.
     */ set encoding(encoding) {
        utils_1.checkEncoding(encoding);
        this._encoding = encoding;
    }
    /**
     * Gets the underlying internal Buffer. (This includes unmanaged data in the Buffer)
     *
     * @return { Buffer } The Buffer value.
     */ get internalBuffer() {
        return this._buff;
    }
    /**
     * Gets the value of the internal managed Buffer (Includes managed data only)
     *
     * @param { Buffer }
     */ toBuffer() {
        return this._buff.slice(0, this.length);
    }
    /**
     * Gets the String value of the internal managed Buffer
     *
     * @param encoding { String } The BufferEncoding to display the Buffer as (defaults to instance level encoding).
     */ toString(encoding) {
        const encodingVal = typeof encoding === 'string' ? encoding : this._encoding;
        // Check for invalid encoding.
        utils_1.checkEncoding(encodingVal);
        return this._buff.toString(encodingVal, 0, this.length);
    }
    /**
     * Destroys the SmartBuffer instance.
     */ destroy() {
        this.clear();
        return this;
    }
    /**
     * Handles inserting and writing strings.
     *
     * @param value { String } The String value to insert.
     * @param isInsert { Boolean } True if inserting a string, false if writing.
     * @param arg2 { Number | String } The offset to insert the string at, or the BufferEncoding to use.
     * @param encoding { String } The BufferEncoding to use for writing strings (defaults to instance encoding).
     */ _handleString(value, isInsert, arg3, encoding) {
        let offsetVal = this._writeOffset;
        let encodingVal = this._encoding;
        // Check for offset
        if (typeof arg3 === 'number') {
            offsetVal = arg3;
        // Check for encoding
        } else if (typeof arg3 === 'string') {
            utils_1.checkEncoding(arg3);
            encodingVal = arg3;
        }
        // Check for encoding (third param)
        if (typeof encoding === 'string') {
            utils_1.checkEncoding(encoding);
            encodingVal = encoding;
        }
        // Calculate bytelength of string.
        const byteLength = Buffer.byteLength(value, encodingVal);
        // Ensure there is enough internal Buffer capacity.
        if (isInsert) {
            this.ensureInsertable(byteLength, offsetVal);
        } else {
            this._ensureWriteable(byteLength, offsetVal);
        }
        // Write value
        this._buff.write(value, offsetVal, byteLength, encodingVal);
        // Increment internal Buffer write offset;
        if (isInsert) {
            this._writeOffset += byteLength;
        } else {
            // If an offset was given, check to see if we wrote beyond the current writeOffset.
            if (typeof arg3 === 'number') {
                this._writeOffset = Math.max(this._writeOffset, offsetVal + byteLength);
            } else {
                // If no offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
                this._writeOffset += byteLength;
            }
        }
        return this;
    }
    /**
     * Handles writing or insert of a Buffer.
     *
     * @param value { Buffer } The Buffer to write.
     * @param offset { Number } The offset to write the Buffer to.
     */ _handleBuffer(value, isInsert, offset) {
        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
        // Ensure there is enough internal Buffer capacity.
        if (isInsert) {
            this.ensureInsertable(value.length, offsetVal);
        } else {
            this._ensureWriteable(value.length, offsetVal);
        }
        // Write buffer value
        value.copy(this._buff, offsetVal);
        // Increment internal Buffer write offset;
        if (isInsert) {
            this._writeOffset += value.length;
        } else {
            // If an offset was given, check to see if we wrote beyond the current writeOffset.
            if (typeof offset === 'number') {
                this._writeOffset = Math.max(this._writeOffset, offsetVal + value.length);
            } else {
                // If no offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
                this._writeOffset += value.length;
            }
        }
        return this;
    }
    /**
     * Ensures that the internal Buffer is large enough to read data.
     *
     * @param length { Number } The length of the data that needs to be read.
     * @param offset { Number } The offset of the data that needs to be read.
     */ ensureReadable(length, offset) {
        // Offset value defaults to managed read offset.
        let offsetVal = this._readOffset;
        // If an offset was provided, use it.
        if (typeof offset !== 'undefined') {
            // Checks for valid numberic value;
            utils_1.checkOffsetValue(offset);
            // Overide with custom offset.
            offsetVal = offset;
        }
        // Checks if offset is below zero, or the offset+length offset is beyond the total length of the managed data.
        if (offsetVal < 0 || offsetVal + length > this.length) {
            throw new Error(utils_1.ERRORS.INVALID_READ_BEYOND_BOUNDS);
        }
    }
    /**
     * Ensures that the internal Buffer is large enough to insert data.
     *
     * @param dataLength { Number } The length of the data that needs to be written.
     * @param offset { Number } The offset of the data to be written.
     */ ensureInsertable(dataLength, offset) {
        // Checks for valid numberic value;
        utils_1.checkOffsetValue(offset);
        // Ensure there is enough internal Buffer capacity.
        this._ensureCapacity(this.length + dataLength);
        // If an offset was provided and its not the very end of the buffer, copy data into appropriate location in regards to the offset.
        if (offset < this.length) {
            this._buff.copy(this._buff, offset + dataLength, offset, this._buff.length);
        }
        // Adjust tracked smart buffer length
        if (offset + dataLength > this.length) {
            this.length = offset + dataLength;
        } else {
            this.length += dataLength;
        }
    }
    /**
     * Ensures that the internal Buffer is large enough to write data.
     *
     * @param dataLength { Number } The length of the data that needs to be written.
     * @param offset { Number } The offset of the data to be written (defaults to writeOffset).
     */ _ensureWriteable(dataLength, offset) {
        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
        // Ensure enough capacity to write data.
        this._ensureCapacity(offsetVal + dataLength);
        // Adjust SmartBuffer length (if offset + length is larger than managed length, adjust length)
        if (offsetVal + dataLength > this.length) {
            this.length = offsetVal + dataLength;
        }
    }
    /**
     * Ensures that the internal Buffer is large enough to write at least the given amount of data.
     *
     * @param minLength { Number } The minimum length of the data needs to be written.
     */ _ensureCapacity(minLength) {
        const oldLength = this._buff.length;
        if (minLength > oldLength) {
            let data = this._buff;
            let newLength = oldLength * 3 / 2 + 1;
            if (newLength < minLength) {
                newLength = minLength;
            }
            this._buff = Buffer.allocUnsafe(newLength);
            data.copy(this._buff, 0, 0, oldLength);
        }
    }
    /**
     * Reads a numeric number value using the provided function.
     *
     * @typeparam T { number | bigint } The type of the value to be read
     *
     * @param func { Function(offset: number) => number } The function to read data on the internal Buffer with.
     * @param byteSize { Number } The number of bytes read.
     * @param offset { Number } The offset to read from (optional). When this is not provided, the managed readOffset is used instead.
     *
     * @returns { T } the number value
     */ _readNumberValue(func, byteSize, offset) {
        this.ensureReadable(byteSize, offset);
        // Call Buffer.readXXXX();
        const value = func.call(this._buff, typeof offset === 'number' ? offset : this._readOffset);
        // Adjust internal read offset if an optional read offset was not provided.
        if (typeof offset === 'undefined') {
            this._readOffset += byteSize;
        }
        return value;
    }
    /**
     * Inserts a numeric number value based on the given offset and value.
     *
     * @typeparam T { number | bigint } The type of the value to be written
     *
     * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
     * @param byteSize { Number } The number of bytes written.
     * @param value { T } The number value to write.
     * @param offset { Number } the offset to write the number at (REQUIRED).
     *
     * @returns SmartBuffer this buffer
     */ _insertNumberValue(func, byteSize, value, offset) {
        // Check for invalid offset values.
        utils_1.checkOffsetValue(offset);
        // Ensure there is enough internal Buffer capacity. (raw offset is passed)
        this.ensureInsertable(byteSize, offset);
        // Call buffer.writeXXXX();
        func.call(this._buff, value, offset);
        // Adjusts internally managed write offset.
        this._writeOffset += byteSize;
        return this;
    }
    /**
     * Writes a numeric number value based on the given offset and value.
     *
     * @typeparam T { number | bigint } The type of the value to be written
     *
     * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
     * @param byteSize { Number } The number of bytes written.
     * @param value { T } The number value to write.
     * @param offset { Number } the offset to write the number at (REQUIRED).
     *
     * @returns SmartBuffer this buffer
     */ _writeNumberValue(func, byteSize, value, offset) {
        // If an offset was provided, validate it.
        if (typeof offset === 'number') {
            // Check if we're writing beyond the bounds of the managed data.
            if (offset < 0) {
                throw new Error(utils_1.ERRORS.INVALID_WRITE_BEYOND_BOUNDS);
            }
            utils_1.checkOffsetValue(offset);
        }
        // Default to writeOffset if no offset value was given.
        const offsetVal = typeof offset === 'number' ? offset : this._writeOffset;
        // Ensure there is enough internal Buffer capacity. (raw offset is passed)
        this._ensureWriteable(byteSize, offsetVal);
        func.call(this._buff, value, offsetVal);
        // If an offset was given, check to see if we wrote beyond the current writeOffset.
        if (typeof offset === 'number') {
            this._writeOffset = Math.max(this._writeOffset, offsetVal + byteSize);
        } else {
            // If no numeric offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
            this._writeOffset += byteSize;
        }
        return this;
    }
}
exports.SmartBuffer = SmartBuffer;
}),
"[project]/node_modules/socks/build/common/constants.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SOCKS5_NO_ACCEPTABLE_AUTH = exports.SOCKS5_CUSTOM_AUTH_END = exports.SOCKS5_CUSTOM_AUTH_START = exports.SOCKS_INCOMING_PACKET_SIZES = exports.SocksClientState = exports.Socks5Response = exports.Socks5HostType = exports.Socks5Auth = exports.Socks4Response = exports.SocksCommand = exports.ERRORS = exports.DEFAULT_TIMEOUT = void 0;
const DEFAULT_TIMEOUT = 30000;
exports.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;
// prettier-ignore
const ERRORS = {
    InvalidSocksCommand: 'An invalid SOCKS command was provided. Valid options are connect, bind, and associate.',
    InvalidSocksCommandForOperation: 'An invalid SOCKS command was provided. Only a subset of commands are supported for this operation.',
    InvalidSocksCommandChain: 'An invalid SOCKS command was provided. Chaining currently only supports the connect command.',
    InvalidSocksClientOptionsDestination: 'An invalid destination host was provided.',
    InvalidSocksClientOptionsExistingSocket: 'An invalid existing socket was provided. This should be an instance of stream.Duplex.',
    InvalidSocksClientOptionsProxy: 'Invalid SOCKS proxy details were provided.',
    InvalidSocksClientOptionsTimeout: 'An invalid timeout value was provided. Please enter a value above 0 (in ms).',
    InvalidSocksClientOptionsProxiesLength: 'At least two socks proxies must be provided for chaining.',
    InvalidSocksClientOptionsCustomAuthRange: 'Custom auth must be a value between 0x80 and 0xFE.',
    InvalidSocksClientOptionsCustomAuthOptions: 'When a custom_auth_method is provided, custom_auth_request_handler, custom_auth_response_size, and custom_auth_response_handler must also be provided and valid.',
    NegotiationError: 'Negotiation error',
    SocketClosed: 'Socket closed',
    ProxyConnectionTimedOut: 'Proxy connection timed out',
    InternalError: 'SocksClient internal error (this should not happen)',
    InvalidSocks4HandshakeResponse: 'Received invalid Socks4 handshake response',
    Socks4ProxyRejectedConnection: 'Socks4 Proxy rejected connection',
    InvalidSocks4IncomingConnectionResponse: 'Socks4 invalid incoming connection response',
    Socks4ProxyRejectedIncomingBoundConnection: 'Socks4 Proxy rejected incoming bound connection',
    InvalidSocks5InitialHandshakeResponse: 'Received invalid Socks5 initial handshake response',
    InvalidSocks5IntiailHandshakeSocksVersion: 'Received invalid Socks5 initial handshake (invalid socks version)',
    InvalidSocks5InitialHandshakeNoAcceptedAuthType: 'Received invalid Socks5 initial handshake (no accepted authentication type)',
    InvalidSocks5InitialHandshakeUnknownAuthType: 'Received invalid Socks5 initial handshake (unknown authentication type)',
    Socks5AuthenticationFailed: 'Socks5 Authentication failed',
    InvalidSocks5FinalHandshake: 'Received invalid Socks5 final handshake response',
    InvalidSocks5FinalHandshakeRejected: 'Socks5 proxy rejected connection',
    InvalidSocks5IncomingConnectionResponse: 'Received invalid Socks5 incoming connection response',
    Socks5ProxyRejectedIncomingBoundConnection: 'Socks5 Proxy rejected incoming bound connection'
};
exports.ERRORS = ERRORS;
const SOCKS_INCOMING_PACKET_SIZES = {
    Socks5InitialHandshakeResponse: 2,
    Socks5UserPassAuthenticationResponse: 2,
    // Command response + incoming connection (bind)
    Socks5ResponseHeader: 5,
    Socks5ResponseIPv4: 10,
    Socks5ResponseIPv6: 22,
    Socks5ResponseHostname: (hostNameLength)=>hostNameLength + 7,
    // Command response + incoming connection (bind)
    Socks4Response: 8
};
exports.SOCKS_INCOMING_PACKET_SIZES = SOCKS_INCOMING_PACKET_SIZES;
var SocksCommand;
(function(SocksCommand) {
    SocksCommand[SocksCommand["connect"] = 1] = "connect";
    SocksCommand[SocksCommand["bind"] = 2] = "bind";
    SocksCommand[SocksCommand["associate"] = 3] = "associate";
})(SocksCommand || (exports.SocksCommand = SocksCommand = {}));
var Socks4Response;
(function(Socks4Response) {
    Socks4Response[Socks4Response["Granted"] = 90] = "Granted";
    Socks4Response[Socks4Response["Failed"] = 91] = "Failed";
    Socks4Response[Socks4Response["Rejected"] = 92] = "Rejected";
    Socks4Response[Socks4Response["RejectedIdent"] = 93] = "RejectedIdent";
})(Socks4Response || (exports.Socks4Response = Socks4Response = {}));
var Socks5Auth;
(function(Socks5Auth) {
    Socks5Auth[Socks5Auth["NoAuth"] = 0] = "NoAuth";
    Socks5Auth[Socks5Auth["GSSApi"] = 1] = "GSSApi";
    Socks5Auth[Socks5Auth["UserPass"] = 2] = "UserPass";
})(Socks5Auth || (exports.Socks5Auth = Socks5Auth = {}));
const SOCKS5_CUSTOM_AUTH_START = 0x80;
exports.SOCKS5_CUSTOM_AUTH_START = SOCKS5_CUSTOM_AUTH_START;
const SOCKS5_CUSTOM_AUTH_END = 0xfe;
exports.SOCKS5_CUSTOM_AUTH_END = SOCKS5_CUSTOM_AUTH_END;
const SOCKS5_NO_ACCEPTABLE_AUTH = 0xff;
exports.SOCKS5_NO_ACCEPTABLE_AUTH = SOCKS5_NO_ACCEPTABLE_AUTH;
var Socks5Response;
(function(Socks5Response) {
    Socks5Response[Socks5Response["Granted"] = 0] = "Granted";
    Socks5Response[Socks5Response["Failure"] = 1] = "Failure";
    Socks5Response[Socks5Response["NotAllowed"] = 2] = "NotAllowed";
    Socks5Response[Socks5Response["NetworkUnreachable"] = 3] = "NetworkUnreachable";
    Socks5Response[Socks5Response["HostUnreachable"] = 4] = "HostUnreachable";
    Socks5Response[Socks5Response["ConnectionRefused"] = 5] = "ConnectionRefused";
    Socks5Response[Socks5Response["TTLExpired"] = 6] = "TTLExpired";
    Socks5Response[Socks5Response["CommandNotSupported"] = 7] = "CommandNotSupported";
    Socks5Response[Socks5Response["AddressNotSupported"] = 8] = "AddressNotSupported";
})(Socks5Response || (exports.Socks5Response = Socks5Response = {}));
var Socks5HostType;
(function(Socks5HostType) {
    Socks5HostType[Socks5HostType["IPv4"] = 1] = "IPv4";
    Socks5HostType[Socks5HostType["Hostname"] = 3] = "Hostname";
    Socks5HostType[Socks5HostType["IPv6"] = 4] = "IPv6";
})(Socks5HostType || (exports.Socks5HostType = Socks5HostType = {}));
var SocksClientState;
(function(SocksClientState) {
    SocksClientState[SocksClientState["Created"] = 0] = "Created";
    SocksClientState[SocksClientState["Connecting"] = 1] = "Connecting";
    SocksClientState[SocksClientState["Connected"] = 2] = "Connected";
    SocksClientState[SocksClientState["SentInitialHandshake"] = 3] = "SentInitialHandshake";
    SocksClientState[SocksClientState["ReceivedInitialHandshakeResponse"] = 4] = "ReceivedInitialHandshakeResponse";
    SocksClientState[SocksClientState["SentAuthentication"] = 5] = "SentAuthentication";
    SocksClientState[SocksClientState["ReceivedAuthenticationResponse"] = 6] = "ReceivedAuthenticationResponse";
    SocksClientState[SocksClientState["SentFinalHandshake"] = 7] = "SentFinalHandshake";
    SocksClientState[SocksClientState["ReceivedFinalResponse"] = 8] = "ReceivedFinalResponse";
    SocksClientState[SocksClientState["BoundWaitingForConnection"] = 9] = "BoundWaitingForConnection";
    SocksClientState[SocksClientState["Established"] = 10] = "Established";
    SocksClientState[SocksClientState["Disconnected"] = 11] = "Disconnected";
    SocksClientState[SocksClientState["Error"] = 99] = "Error";
})(SocksClientState || (exports.SocksClientState = SocksClientState = {}));
}),
"[project]/node_modules/socks/build/common/util.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.shuffleArray = exports.SocksClientError = void 0;
/**
 * Error wrapper for SocksClient
 */ class SocksClientError extends Error {
    constructor(message, options){
        super(message);
        this.options = options;
    }
}
exports.SocksClientError = SocksClientError;
/**
 * Shuffles a given array.
 * @param array The array to shuffle.
 */ function shuffleArray(array) {
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [
            array[j],
            array[i]
        ];
    }
}
exports.shuffleArray = shuffleArray;
}),
"[project]/node_modules/socks/build/common/helpers.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ipToBuffer = exports.int32ToIpv4 = exports.ipv4ToInt32 = exports.validateSocksClientChainOptions = exports.validateSocksClientOptions = void 0;
const util_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/util.js [instrumentation] (ecmascript)");
const constants_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/constants.js [instrumentation] (ecmascript)");
const stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)");
const ip_address_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ip-address.js [instrumentation] (ecmascript)");
const net = __turbopack_context__.r("[externals]/net [external] (net, cjs)");
/**
 * Validates the provided SocksClientOptions
 * @param options { SocksClientOptions }
 * @param acceptedCommands { string[] } A list of accepted SocksProxy commands.
 */ function validateSocksClientOptions(options, acceptedCommands = [
    'connect',
    'bind',
    'associate'
]) {
    // Check SOCKs command option.
    if (!constants_1.SocksCommand[options.command]) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommand, options);
    }
    // Check SocksCommand for acceptable command.
    if (acceptedCommands.indexOf(options.command) === -1) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommandForOperation, options);
    }
    // Check destination
    if (!isValidSocksRemoteHost(options.destination)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsDestination, options);
    }
    // Check SOCKS proxy to use
    if (!isValidSocksProxy(options.proxy)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxy, options);
    }
    // Validate custom auth (if set)
    validateCustomProxyAuth(options.proxy, options);
    // Check timeout
    if (options.timeout && !isValidTimeoutValue(options.timeout)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsTimeout, options);
    }
    // Check existing_socket (if provided)
    if (options.existing_socket && !(options.existing_socket instanceof stream.Duplex)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsExistingSocket, options);
    }
}
exports.validateSocksClientOptions = validateSocksClientOptions;
/**
 * Validates the SocksClientChainOptions
 * @param options { SocksClientChainOptions }
 */ function validateSocksClientChainOptions(options) {
    // Only connect is supported when chaining.
    if (options.command !== 'connect') {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksCommandChain, options);
    }
    // Check destination
    if (!isValidSocksRemoteHost(options.destination)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsDestination, options);
    }
    // Validate proxies (length)
    if (!(options.proxies && Array.isArray(options.proxies) && options.proxies.length >= 2)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxiesLength, options);
    }
    // Validate proxies
    options.proxies.forEach((proxy)=>{
        if (!isValidSocksProxy(proxy)) {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsProxy, options);
        }
        // Validate custom auth (if set)
        validateCustomProxyAuth(proxy, options);
    });
    // Check timeout
    if (options.timeout && !isValidTimeoutValue(options.timeout)) {
        throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsTimeout, options);
    }
}
exports.validateSocksClientChainOptions = validateSocksClientChainOptions;
function validateCustomProxyAuth(proxy, options) {
    if (proxy.custom_auth_method !== undefined) {
        // Invalid auth method range
        if (proxy.custom_auth_method < constants_1.SOCKS5_CUSTOM_AUTH_START || proxy.custom_auth_method > constants_1.SOCKS5_CUSTOM_AUTH_END) {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthRange, options);
        }
        // Missing custom_auth_request_handler
        if (proxy.custom_auth_request_handler === undefined || typeof proxy.custom_auth_request_handler !== 'function') {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
        }
        // Missing custom_auth_response_size
        if (proxy.custom_auth_response_size === undefined) {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
        }
        // Missing/invalid custom_auth_response_handler
        if (proxy.custom_auth_response_handler === undefined || typeof proxy.custom_auth_response_handler !== 'function') {
            throw new util_1.SocksClientError(constants_1.ERRORS.InvalidSocksClientOptionsCustomAuthOptions, options);
        }
    }
}
/**
 * Validates a SocksRemoteHost
 * @param remoteHost { SocksRemoteHost }
 */ function isValidSocksRemoteHost(remoteHost) {
    return remoteHost && typeof remoteHost.host === 'string' && Buffer.byteLength(remoteHost.host) < 256 && typeof remoteHost.port === 'number' && remoteHost.port >= 0 && remoteHost.port <= 65535;
}
/**
 * Validates a SocksProxy
 * @param proxy { SocksProxy }
 */ function isValidSocksProxy(proxy) {
    return proxy && (typeof proxy.host === 'string' || typeof proxy.ipaddress === 'string') && typeof proxy.port === 'number' && proxy.port >= 0 && proxy.port <= 65535 && (proxy.type === 4 || proxy.type === 5);
}
/**
 * Validates a timeout value.
 * @param value { Number }
 */ function isValidTimeoutValue(value) {
    return typeof value === 'number' && value > 0;
}
function ipv4ToInt32(ip) {
    const address = new ip_address_1.Address4(ip);
    // Convert the IPv4 address parts to an integer
    return address.toArray().reduce((acc, part)=>(acc << 8) + part, 0) >>> 0;
}
exports.ipv4ToInt32 = ipv4ToInt32;
function int32ToIpv4(int32) {
    // Extract each byte (octet) from the 32-bit integer
    const octet1 = int32 >>> 24 & 0xff;
    const octet2 = int32 >>> 16 & 0xff;
    const octet3 = int32 >>> 8 & 0xff;
    const octet4 = int32 & 0xff;
    // Combine the octets into a string in IPv4 format
    return [
        octet1,
        octet2,
        octet3,
        octet4
    ].join('.');
}
exports.int32ToIpv4 = int32ToIpv4;
function ipToBuffer(ip) {
    if (net.isIPv4(ip)) {
        // Handle IPv4 addresses
        const address = new ip_address_1.Address4(ip);
        return Buffer.from(address.toArray());
    } else if (net.isIPv6(ip)) {
        // Handle IPv6 addresses
        const address = new ip_address_1.Address6(ip);
        return Buffer.from(address.canonicalForm().split(':').map((segment)=>segment.padStart(4, '0')).join(''), 'hex');
    } else {
        throw new Error('Invalid IP address format');
    }
}
exports.ipToBuffer = ipToBuffer;
}),
"[project]/node_modules/socks/build/common/receivebuffer.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ReceiveBuffer = void 0;
class ReceiveBuffer {
    constructor(size = 4096){
        this.buffer = Buffer.allocUnsafe(size);
        this.offset = 0;
        this.originalSize = size;
    }
    get length() {
        return this.offset;
    }
    append(data) {
        if (!Buffer.isBuffer(data)) {
            throw new Error('Attempted to append a non-buffer instance to ReceiveBuffer.');
        }
        if (this.offset + data.length >= this.buffer.length) {
            const tmp = this.buffer;
            this.buffer = Buffer.allocUnsafe(Math.max(this.buffer.length + this.originalSize, this.buffer.length + data.length));
            tmp.copy(this.buffer);
        }
        data.copy(this.buffer, this.offset);
        return this.offset += data.length;
    }
    peek(length) {
        if (length > this.offset) {
            throw new Error('Attempted to read beyond the bounds of the managed internal data.');
        }
        return this.buffer.slice(0, length);
    }
    get(length) {
        if (length > this.offset) {
            throw new Error('Attempted to read beyond the bounds of the managed internal data.');
        }
        const value = Buffer.allocUnsafe(length);
        this.buffer.slice(0, length).copy(value);
        this.buffer.copyWithin(0, length, length + this.offset - length);
        this.offset -= length;
        return value;
    }
}
exports.ReceiveBuffer = ReceiveBuffer;
}),
"[project]/node_modules/socks/build/client/socksclient.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __awaiter = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SocksClientError = exports.SocksClient = void 0;
const events_1 = __turbopack_context__.r("[externals]/events [external] (events, cjs)");
const net = __turbopack_context__.r("[externals]/net [external] (net, cjs)");
const smart_buffer_1 = __turbopack_context__.r("[project]/node_modules/smart-buffer/build/smartbuffer.js [instrumentation] (ecmascript)");
const constants_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/constants.js [instrumentation] (ecmascript)");
const helpers_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/helpers.js [instrumentation] (ecmascript)");
const receivebuffer_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/receivebuffer.js [instrumentation] (ecmascript)");
const util_1 = __turbopack_context__.r("[project]/node_modules/socks/build/common/util.js [instrumentation] (ecmascript)");
Object.defineProperty(exports, "SocksClientError", {
    enumerable: true,
    get: function() {
        return util_1.SocksClientError;
    }
});
const ip_address_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ip-address.js [instrumentation] (ecmascript)");
class SocksClient extends events_1.EventEmitter {
    constructor(options){
        super();
        this.options = Object.assign({}, options);
        // Validate SocksClientOptions
        (0, helpers_1.validateSocksClientOptions)(options);
        // Default state
        this.setState(constants_1.SocksClientState.Created);
    }
    /**
     * Creates a new SOCKS connection.
     *
     * Note: Supports callbacks and promises. Only supports the connect command.
     * @param options { SocksClientOptions } Options.
     * @param callback { Function } An optional callback function.
     * @returns { Promise }
     */ static createConnection(options, callback) {
        return new Promise((resolve, reject)=>{
            // Validate SocksClientOptions
            try {
                (0, helpers_1.validateSocksClientOptions)(options, [
                    'connect'
                ]);
            } catch (err) {
                if (typeof callback === 'function') {
                    callback(err);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return resolve(err); // Resolves pending promise (prevents memory leaks).
                } else {
                    return reject(err);
                }
            }
            const client = new SocksClient(options);
            client.connect(options.existing_socket);
            client.once('established', (info)=>{
                client.removeAllListeners();
                if (typeof callback === 'function') {
                    callback(null, info);
                    resolve(info); // Resolves pending promise (prevents memory leaks).
                } else {
                    resolve(info);
                }
            });
            // Error occurred, failed to establish connection.
            client.once('error', (err)=>{
                client.removeAllListeners();
                if (typeof callback === 'function') {
                    callback(err);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve(err); // Resolves pending promise (prevents memory leaks).
                } else {
                    reject(err);
                }
            });
        });
    }
    /**
     * Creates a new SOCKS connection chain to a destination host through 2 or more SOCKS proxies.
     *
     * Note: Supports callbacks and promises. Only supports the connect method.
     * Note: Implemented via createConnection() factory function.
     * @param options { SocksClientChainOptions } Options
     * @param callback { Function } An optional callback function.
     * @returns { Promise }
     */ static createConnectionChain(options, callback) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise((resolve, reject)=>__awaiter(this, void 0, void 0, function*() {
                // Validate SocksClientChainOptions
                try {
                    (0, helpers_1.validateSocksClientChainOptions)(options);
                } catch (err) {
                    if (typeof callback === 'function') {
                        callback(err);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return resolve(err); // Resolves pending promise (prevents memory leaks).
                    } else {
                        return reject(err);
                    }
                }
                // Shuffle proxies
                if (options.randomizeChain) {
                    (0, util_1.shuffleArray)(options.proxies);
                }
                try {
                    let sock;
                    for(let i = 0; i < options.proxies.length; i++){
                        const nextProxy = options.proxies[i];
                        // If we've reached the last proxy in the chain, the destination is the actual destination, otherwise it's the next proxy.
                        const nextDestination = i === options.proxies.length - 1 ? options.destination : {
                            host: options.proxies[i + 1].host || options.proxies[i + 1].ipaddress,
                            port: options.proxies[i + 1].port
                        };
                        // Creates the next connection in the chain.
                        const result = yield SocksClient.createConnection({
                            command: 'connect',
                            proxy: nextProxy,
                            destination: nextDestination,
                            existing_socket: sock
                        });
                        // If sock is undefined, assign it here.
                        sock = sock || result.socket;
                    }
                    if (typeof callback === 'function') {
                        callback(null, {
                            socket: sock
                        });
                        resolve({
                            socket: sock
                        }); // Resolves pending promise (prevents memory leaks).
                    } else {
                        resolve({
                            socket: sock
                        });
                    }
                } catch (err) {
                    if (typeof callback === 'function') {
                        callback(err);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        resolve(err); // Resolves pending promise (prevents memory leaks).
                    } else {
                        reject(err);
                    }
                }
            }));
    }
    /**
     * Creates a SOCKS UDP Frame.
     * @param options
     */ static createUDPFrame(options) {
        const buff = new smart_buffer_1.SmartBuffer();
        buff.writeUInt16BE(0);
        buff.writeUInt8(options.frameNumber || 0);
        // IPv4/IPv6/Hostname
        if (net.isIPv4(options.remoteHost.host)) {
            buff.writeUInt8(constants_1.Socks5HostType.IPv4);
            buff.writeUInt32BE((0, helpers_1.ipv4ToInt32)(options.remoteHost.host));
        } else if (net.isIPv6(options.remoteHost.host)) {
            buff.writeUInt8(constants_1.Socks5HostType.IPv6);
            buff.writeBuffer((0, helpers_1.ipToBuffer)(options.remoteHost.host));
        } else {
            buff.writeUInt8(constants_1.Socks5HostType.Hostname);
            buff.writeUInt8(Buffer.byteLength(options.remoteHost.host));
            buff.writeString(options.remoteHost.host);
        }
        // Port
        buff.writeUInt16BE(options.remoteHost.port);
        // Data
        buff.writeBuffer(options.data);
        return buff.toBuffer();
    }
    /**
     * Parses a SOCKS UDP frame.
     * @param data
     */ static parseUDPFrame(data) {
        const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
        buff.readOffset = 2;
        const frameNumber = buff.readUInt8();
        const hostType = buff.readUInt8();
        let remoteHost;
        if (hostType === constants_1.Socks5HostType.IPv4) {
            remoteHost = (0, helpers_1.int32ToIpv4)(buff.readUInt32BE());
        } else if (hostType === constants_1.Socks5HostType.IPv6) {
            remoteHost = ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm();
        } else {
            remoteHost = buff.readString(buff.readUInt8());
        }
        const remotePort = buff.readUInt16BE();
        return {
            frameNumber,
            remoteHost: {
                host: remoteHost,
                port: remotePort
            },
            data: buff.readBuffer()
        };
    }
    /**
     * Internal state setter. If the SocksClient is in an error state, it cannot be changed to a non error state.
     */ setState(newState) {
        if (this.state !== constants_1.SocksClientState.Error) {
            this.state = newState;
        }
    }
    /**
     * Starts the connection establishment to the proxy and destination.
     * @param existingSocket Connected socket to use instead of creating a new one (internal use).
     */ connect(existingSocket) {
        this.onDataReceived = (data)=>this.onDataReceivedHandler(data);
        this.onClose = ()=>this.onCloseHandler();
        this.onError = (err)=>this.onErrorHandler(err);
        this.onConnect = ()=>this.onConnectHandler();
        // Start timeout timer (defaults to 30 seconds)
        const timer = setTimeout(()=>this.onEstablishedTimeout(), this.options.timeout || constants_1.DEFAULT_TIMEOUT);
        // check whether unref is available as it differs from browser to NodeJS (#33)
        if (timer.unref && typeof timer.unref === 'function') {
            timer.unref();
        }
        // If an existing socket is provided, use it to negotiate SOCKS handshake. Otherwise create a new Socket.
        if (existingSocket) {
            this.socket = existingSocket;
        } else {
            this.socket = new net.Socket();
        }
        // Attach Socket error handlers.
        this.socket.once('close', this.onClose);
        this.socket.once('error', this.onError);
        this.socket.once('connect', this.onConnect);
        this.socket.on('data', this.onDataReceived);
        this.setState(constants_1.SocksClientState.Connecting);
        this.receiveBuffer = new receivebuffer_1.ReceiveBuffer();
        if (existingSocket) {
            this.socket.emit('connect');
        } else {
            this.socket.connect(this.getSocketOptions());
            if (this.options.set_tcp_nodelay !== undefined && this.options.set_tcp_nodelay !== null) {
                this.socket.setNoDelay(!!this.options.set_tcp_nodelay);
            }
        }
        // Listen for established event so we can re-emit any excess data received during handshakes.
        this.prependOnceListener('established', (info)=>{
            setImmediate(()=>{
                if (this.receiveBuffer.length > 0) {
                    const excessData = this.receiveBuffer.get(this.receiveBuffer.length);
                    info.socket.emit('data', excessData);
                }
                info.socket.resume();
            });
        });
    }
    // Socket options (defaults host/port to options.proxy.host/options.proxy.port)
    getSocketOptions() {
        return Object.assign(Object.assign({}, this.options.socket_options), {
            host: this.options.proxy.host || this.options.proxy.ipaddress,
            port: this.options.proxy.port
        });
    }
    /**
     * Handles internal Socks timeout callback.
     * Note: If the Socks client is not BoundWaitingForConnection or Established, the connection will be closed.
     */ onEstablishedTimeout() {
        if (this.state !== constants_1.SocksClientState.Established && this.state !== constants_1.SocksClientState.BoundWaitingForConnection) {
            this.closeSocket(constants_1.ERRORS.ProxyConnectionTimedOut);
        }
    }
    /**
     * Handles Socket connect event.
     */ onConnectHandler() {
        this.setState(constants_1.SocksClientState.Connected);
        // Send initial handshake.
        if (this.options.proxy.type === 4) {
            this.sendSocks4InitialHandshake();
        } else {
            this.sendSocks5InitialHandshake();
        }
        this.setState(constants_1.SocksClientState.SentInitialHandshake);
    }
    /**
     * Handles Socket data event.
     * @param data
     */ onDataReceivedHandler(data) {
        /*
          All received data is appended to a ReceiveBuffer.
          This makes sure that all the data we need is received before we attempt to process it.
        */ this.receiveBuffer.append(data);
        // Process data that we have.
        this.processData();
    }
    /**
     * Handles processing of the data we have received.
     */ processData() {
        // If we have enough data to process the next step in the SOCKS handshake, proceed.
        while(this.state !== constants_1.SocksClientState.Established && this.state !== constants_1.SocksClientState.Error && this.receiveBuffer.length >= this.nextRequiredPacketBufferSize){
            // Sent initial handshake, waiting for response.
            if (this.state === constants_1.SocksClientState.SentInitialHandshake) {
                if (this.options.proxy.type === 4) {
                    // Socks v4 only has one handshake response.
                    this.handleSocks4FinalHandshakeResponse();
                } else {
                    // Socks v5 has two handshakes, handle initial one here.
                    this.handleInitialSocks5HandshakeResponse();
                }
            // Sent auth request for Socks v5, waiting for response.
            } else if (this.state === constants_1.SocksClientState.SentAuthentication) {
                this.handleInitialSocks5AuthenticationHandshakeResponse();
            // Sent final Socks v5 handshake, waiting for final response.
            } else if (this.state === constants_1.SocksClientState.SentFinalHandshake) {
                this.handleSocks5FinalHandshakeResponse();
            // Socks BIND established. Waiting for remote connection via proxy.
            } else if (this.state === constants_1.SocksClientState.BoundWaitingForConnection) {
                if (this.options.proxy.type === 4) {
                    this.handleSocks4IncomingConnectionResponse();
                } else {
                    this.handleSocks5IncomingConnectionResponse();
                }
            } else {
                this.closeSocket(constants_1.ERRORS.InternalError);
                break;
            }
        }
    }
    /**
     * Handles Socket close event.
     * @param had_error
     */ onCloseHandler() {
        this.closeSocket(constants_1.ERRORS.SocketClosed);
    }
    /**
     * Handles Socket error event.
     * @param err
     */ onErrorHandler(err) {
        this.closeSocket(err.message);
    }
    /**
     * Removes internal event listeners on the underlying Socket.
     */ removeInternalSocketHandlers() {
        // Pauses data flow of the socket (this is internally resumed after 'established' is emitted)
        this.socket.pause();
        this.socket.removeListener('data', this.onDataReceived);
        this.socket.removeListener('close', this.onClose);
        this.socket.removeListener('error', this.onError);
        this.socket.removeListener('connect', this.onConnect);
    }
    /**
     * Closes and destroys the underlying Socket. Emits an error event.
     * @param err { String } An error string to include in error event.
     */ closeSocket(err) {
        // Make sure only one 'error' event is fired for the lifetime of this SocksClient instance.
        if (this.state !== constants_1.SocksClientState.Error) {
            // Set internal state to Error.
            this.setState(constants_1.SocksClientState.Error);
            // Destroy Socket
            this.socket.destroy();
            // Remove internal listeners
            this.removeInternalSocketHandlers();
            // Fire 'error' event.
            this.emit('error', new util_1.SocksClientError(err, this.options));
        }
    }
    /**
     * Sends initial Socks v4 handshake request.
     */ sendSocks4InitialHandshake() {
        const userId = this.options.proxy.userId || '';
        const buff = new smart_buffer_1.SmartBuffer();
        buff.writeUInt8(0x04);
        buff.writeUInt8(constants_1.SocksCommand[this.options.command]);
        buff.writeUInt16BE(this.options.destination.port);
        // Socks 4 (IPv4)
        if (net.isIPv4(this.options.destination.host)) {
            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
            buff.writeStringNT(userId);
        // Socks 4a (hostname)
        } else {
            buff.writeUInt8(0x00);
            buff.writeUInt8(0x00);
            buff.writeUInt8(0x00);
            buff.writeUInt8(0x01);
            buff.writeStringNT(userId);
            buff.writeStringNT(this.options.destination.host);
        }
        this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks4Response;
        this.socket.write(buff.toBuffer());
    }
    /**
     * Handles Socks v4 handshake response.
     * @param data
     */ handleSocks4FinalHandshakeResponse() {
        const data = this.receiveBuffer.get(8);
        if (data[1] !== constants_1.Socks4Response.Granted) {
            this.closeSocket(`${constants_1.ERRORS.Socks4ProxyRejectedConnection} - (${constants_1.Socks4Response[data[1]]})`);
        } else {
            // Bind response
            if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.bind) {
                const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
                buff.readOffset = 2;
                const remoteHost = {
                    port: buff.readUInt16BE(),
                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE())
                };
                // If host is 0.0.0.0, set to proxy host.
                if (remoteHost.host === '0.0.0.0') {
                    remoteHost.host = this.options.proxy.ipaddress;
                }
                this.setState(constants_1.SocksClientState.BoundWaitingForConnection);
                this.emit('bound', {
                    remoteHost,
                    socket: this.socket
                });
            // Connect response
            } else {
                this.setState(constants_1.SocksClientState.Established);
                this.removeInternalSocketHandlers();
                this.emit('established', {
                    socket: this.socket
                });
            }
        }
    }
    /**
     * Handles Socks v4 incoming connection request (BIND)
     * @param data
     */ handleSocks4IncomingConnectionResponse() {
        const data = this.receiveBuffer.get(8);
        if (data[1] !== constants_1.Socks4Response.Granted) {
            this.closeSocket(`${constants_1.ERRORS.Socks4ProxyRejectedIncomingBoundConnection} - (${constants_1.Socks4Response[data[1]]})`);
        } else {
            const buff = smart_buffer_1.SmartBuffer.fromBuffer(data);
            buff.readOffset = 2;
            const remoteHost = {
                port: buff.readUInt16BE(),
                host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE())
            };
            this.setState(constants_1.SocksClientState.Established);
            this.removeInternalSocketHandlers();
            this.emit('established', {
                remoteHost,
                socket: this.socket
            });
        }
    }
    /**
     * Sends initial Socks v5 handshake request.
     */ sendSocks5InitialHandshake() {
        const buff = new smart_buffer_1.SmartBuffer();
        // By default we always support no auth.
        const supportedAuthMethods = [
            constants_1.Socks5Auth.NoAuth
        ];
        // We should only tell the proxy we support user/pass auth if auth info is actually provided.
        // Note: As of Tor v0.3.5.7+, if user/pass auth is an option from the client, by default it will always take priority.
        if (this.options.proxy.userId || this.options.proxy.password) {
            supportedAuthMethods.push(constants_1.Socks5Auth.UserPass);
        }
        // Custom auth method?
        if (this.options.proxy.custom_auth_method !== undefined) {
            supportedAuthMethods.push(this.options.proxy.custom_auth_method);
        }
        // Build handshake packet
        buff.writeUInt8(0x05);
        buff.writeUInt8(supportedAuthMethods.length);
        for (const authMethod of supportedAuthMethods){
            buff.writeUInt8(authMethod);
        }
        this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5InitialHandshakeResponse;
        this.socket.write(buff.toBuffer());
        this.setState(constants_1.SocksClientState.SentInitialHandshake);
    }
    /**
     * Handles initial Socks v5 handshake response.
     * @param data
     */ handleInitialSocks5HandshakeResponse() {
        const data = this.receiveBuffer.get(2);
        if (data[0] !== 0x05) {
            this.closeSocket(constants_1.ERRORS.InvalidSocks5IntiailHandshakeSocksVersion);
        } else if (data[1] === constants_1.SOCKS5_NO_ACCEPTABLE_AUTH) {
            this.closeSocket(constants_1.ERRORS.InvalidSocks5InitialHandshakeNoAcceptedAuthType);
        } else {
            // If selected Socks v5 auth method is no auth, send final handshake request.
            if (data[1] === constants_1.Socks5Auth.NoAuth) {
                this.socks5ChosenAuthType = constants_1.Socks5Auth.NoAuth;
                this.sendSocks5CommandRequest();
            // If selected Socks v5 auth method is user/password, send auth handshake.
            } else if (data[1] === constants_1.Socks5Auth.UserPass) {
                this.socks5ChosenAuthType = constants_1.Socks5Auth.UserPass;
                this.sendSocks5UserPassAuthentication();
            // If selected Socks v5 auth method is the custom_auth_method, send custom handshake.
            } else if (data[1] === this.options.proxy.custom_auth_method) {
                this.socks5ChosenAuthType = this.options.proxy.custom_auth_method;
                this.sendSocks5CustomAuthentication();
            } else {
                this.closeSocket(constants_1.ERRORS.InvalidSocks5InitialHandshakeUnknownAuthType);
            }
        }
    }
    /**
     * Sends Socks v5 user & password auth handshake.
     *
     * Note: No auth and user/pass are currently supported.
     */ sendSocks5UserPassAuthentication() {
        const userId = this.options.proxy.userId || '';
        const password = this.options.proxy.password || '';
        const buff = new smart_buffer_1.SmartBuffer();
        buff.writeUInt8(0x01);
        buff.writeUInt8(Buffer.byteLength(userId));
        buff.writeString(userId);
        buff.writeUInt8(Buffer.byteLength(password));
        buff.writeString(password);
        this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5UserPassAuthenticationResponse;
        this.socket.write(buff.toBuffer());
        this.setState(constants_1.SocksClientState.SentAuthentication);
    }
    sendSocks5CustomAuthentication() {
        return __awaiter(this, void 0, void 0, function*() {
            this.nextRequiredPacketBufferSize = this.options.proxy.custom_auth_response_size;
            this.socket.write((yield this.options.proxy.custom_auth_request_handler()));
            this.setState(constants_1.SocksClientState.SentAuthentication);
        });
    }
    handleSocks5CustomAuthHandshakeResponse(data) {
        return __awaiter(this, void 0, void 0, function*() {
            return yield this.options.proxy.custom_auth_response_handler(data);
        });
    }
    handleSocks5AuthenticationNoAuthHandshakeResponse(data) {
        return __awaiter(this, void 0, void 0, function*() {
            return data[1] === 0x00;
        });
    }
    handleSocks5AuthenticationUserPassHandshakeResponse(data) {
        return __awaiter(this, void 0, void 0, function*() {
            return data[1] === 0x00;
        });
    }
    /**
     * Handles Socks v5 auth handshake response.
     * @param data
     */ handleInitialSocks5AuthenticationHandshakeResponse() {
        return __awaiter(this, void 0, void 0, function*() {
            this.setState(constants_1.SocksClientState.ReceivedAuthenticationResponse);
            let authResult = false;
            if (this.socks5ChosenAuthType === constants_1.Socks5Auth.NoAuth) {
                authResult = yield this.handleSocks5AuthenticationNoAuthHandshakeResponse(this.receiveBuffer.get(2));
            } else if (this.socks5ChosenAuthType === constants_1.Socks5Auth.UserPass) {
                authResult = yield this.handleSocks5AuthenticationUserPassHandshakeResponse(this.receiveBuffer.get(2));
            } else if (this.socks5ChosenAuthType === this.options.proxy.custom_auth_method) {
                authResult = yield this.handleSocks5CustomAuthHandshakeResponse(this.receiveBuffer.get(this.options.proxy.custom_auth_response_size));
            }
            if (!authResult) {
                this.closeSocket(constants_1.ERRORS.Socks5AuthenticationFailed);
            } else {
                this.sendSocks5CommandRequest();
            }
        });
    }
    /**
     * Sends Socks v5 final handshake request.
     */ sendSocks5CommandRequest() {
        const buff = new smart_buffer_1.SmartBuffer();
        buff.writeUInt8(0x05);
        buff.writeUInt8(constants_1.SocksCommand[this.options.command]);
        buff.writeUInt8(0x00);
        // ipv4, ipv6, domain?
        if (net.isIPv4(this.options.destination.host)) {
            buff.writeUInt8(constants_1.Socks5HostType.IPv4);
            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
        } else if (net.isIPv6(this.options.destination.host)) {
            buff.writeUInt8(constants_1.Socks5HostType.IPv6);
            buff.writeBuffer((0, helpers_1.ipToBuffer)(this.options.destination.host));
        } else {
            buff.writeUInt8(constants_1.Socks5HostType.Hostname);
            buff.writeUInt8(this.options.destination.host.length);
            buff.writeString(this.options.destination.host);
        }
        buff.writeUInt16BE(this.options.destination.port);
        this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHeader;
        this.socket.write(buff.toBuffer());
        this.setState(constants_1.SocksClientState.SentFinalHandshake);
    }
    /**
     * Handles Socks v5 final handshake response.
     * @param data
     */ handleSocks5FinalHandshakeResponse() {
        // Peek at available data (we need at least 5 bytes to get the hostname length)
        const header = this.receiveBuffer.peek(5);
        if (header[0] !== 0x05 || header[1] !== constants_1.Socks5Response.Granted) {
            this.closeSocket(`${constants_1.ERRORS.InvalidSocks5FinalHandshakeRejected} - ${constants_1.Socks5Response[header[1]]}`);
        } else {
            // Read address type
            const addressType = header[3];
            let remoteHost;
            let buff;
            // IPv4
            if (addressType === constants_1.Socks5HostType.IPv4) {
                // Check if data is available.
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv4;
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
                remoteHost = {
                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
                    port: buff.readUInt16BE()
                };
                // If given host is 0.0.0.0, assume remote proxy ip instead.
                if (remoteHost.host === '0.0.0.0') {
                    remoteHost.host = this.options.proxy.ipaddress;
                }
            // Hostname
            } else if (addressType === constants_1.Socks5HostType.Hostname) {
                const hostLength = header[4];
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHostname(hostLength); // header + host length + host + port
                // Check if data is available.
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(5));
                remoteHost = {
                    host: buff.readString(hostLength),
                    port: buff.readUInt16BE()
                };
            // IPv6
            } else if (addressType === constants_1.Socks5HostType.IPv6) {
                // Check if data is available.
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv6;
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
                remoteHost = {
                    host: ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm(),
                    port: buff.readUInt16BE()
                };
            }
            // We have everything we need
            this.setState(constants_1.SocksClientState.ReceivedFinalResponse);
            // If using CONNECT, the client is now in the established state.
            if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.connect) {
                this.setState(constants_1.SocksClientState.Established);
                this.removeInternalSocketHandlers();
                this.emit('established', {
                    remoteHost,
                    socket: this.socket
                });
            } else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.bind) {
                /* If using BIND, the Socks client is now in BoundWaitingForConnection state.
                   This means that the remote proxy server is waiting for a remote connection to the bound port. */ this.setState(constants_1.SocksClientState.BoundWaitingForConnection);
                this.nextRequiredPacketBufferSize = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHeader;
                this.emit('bound', {
                    remoteHost,
                    socket: this.socket
                });
            /*
                  If using Associate, the Socks client is now Established. And the proxy server is now accepting UDP packets at the
                  given bound port. This initial Socks TCP connection must remain open for the UDP relay to continue to work.
                */ } else if (constants_1.SocksCommand[this.options.command] === constants_1.SocksCommand.associate) {
                this.setState(constants_1.SocksClientState.Established);
                this.removeInternalSocketHandlers();
                this.emit('established', {
                    remoteHost,
                    socket: this.socket
                });
            }
        }
    }
    /**
     * Handles Socks v5 incoming connection request (BIND).
     */ handleSocks5IncomingConnectionResponse() {
        // Peek at available data (we need at least 5 bytes to get the hostname length)
        const header = this.receiveBuffer.peek(5);
        if (header[0] !== 0x05 || header[1] !== constants_1.Socks5Response.Granted) {
            this.closeSocket(`${constants_1.ERRORS.Socks5ProxyRejectedIncomingBoundConnection} - ${constants_1.Socks5Response[header[1]]}`);
        } else {
            // Read address type
            const addressType = header[3];
            let remoteHost;
            let buff;
            // IPv4
            if (addressType === constants_1.Socks5HostType.IPv4) {
                // Check if data is available.
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv4;
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
                remoteHost = {
                    host: (0, helpers_1.int32ToIpv4)(buff.readUInt32BE()),
                    port: buff.readUInt16BE()
                };
                // If given host is 0.0.0.0, assume remote proxy ip instead.
                if (remoteHost.host === '0.0.0.0') {
                    remoteHost.host = this.options.proxy.ipaddress;
                }
            // Hostname
            } else if (addressType === constants_1.Socks5HostType.Hostname) {
                const hostLength = header[4];
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseHostname(hostLength); // header + host length + port
                // Check if data is available.
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(5));
                remoteHost = {
                    host: buff.readString(hostLength),
                    port: buff.readUInt16BE()
                };
            // IPv6
            } else if (addressType === constants_1.Socks5HostType.IPv6) {
                // Check if data is available.
                const dataNeeded = constants_1.SOCKS_INCOMING_PACKET_SIZES.Socks5ResponseIPv6;
                if (this.receiveBuffer.length < dataNeeded) {
                    this.nextRequiredPacketBufferSize = dataNeeded;
                    return;
                }
                buff = smart_buffer_1.SmartBuffer.fromBuffer(this.receiveBuffer.get(dataNeeded).slice(4));
                remoteHost = {
                    host: ip_address_1.Address6.fromByteArray(Array.from(buff.readBuffer(16))).canonicalForm(),
                    port: buff.readUInt16BE()
                };
            }
            this.setState(constants_1.SocksClientState.Established);
            this.removeInternalSocketHandlers();
            this.emit('established', {
                remoteHost,
                socket: this.socket
            });
        }
    }
    get socksClientOptions() {
        return Object.assign({}, this.options);
    }
}
exports.SocksClient = SocksClient;
}),
"[project]/node_modules/socks/build/index.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/node_modules/socks/build/client/socksclient.js [instrumentation] (ecmascript)"), exports);
}),
"[project]/node_modules/ip-address/dist/address-error.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AddressError = void 0;
class AddressError extends Error {
    constructor(message, parseMessage){
        super(message);
        this.name = 'AddressError';
        this.parseMessage = parseMessage;
    }
}
exports.AddressError = AddressError;
}),
"[project]/node_modules/ip-address/dist/common.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isInSubnet = isInSubnet;
exports.isHostInSubnet = isHostInSubnet;
exports.isCorrect = isCorrect;
exports.prefixLengthFromMask = prefixLengthFromMask;
exports.assertByteArray = assertByteArray;
exports.numberToPaddedHex = numberToPaddedHex;
exports.stringToPaddedHex = stringToPaddedHex;
exports.testBit = testBit;
const address_error_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/address-error.js [instrumentation] (ecmascript)");
/**
 * Returns whether this address's *network* is contained within `address`,
 * i.e. whether every address this one can represent also falls inside
 * `address`. A network wider than `address` is not contained in it, so
 * `10.0.0.0/8` is not in `10.0.0.0/16`.
 *
 * To ask whether the address itself falls inside a range, ignoring any CIDR
 * suffix it was written with, use {@link isHostInSubnet} instead. That is the
 * question the special-use classifiers ask.
 */ function isInSubnet(address) {
    if (this.subnetMask < address.subnetMask) {
        return false;
    }
    return isHostInSubnet.call(this, address);
}
/**
 * Returns whether this address's host bits fall inside `address`, ignoring
 * this address's own subnet mask.
 *
 * This is the primitive the special-use classifiers (`isLoopback`,
 * `isPrivate`, `isLinkLocal`, `getType`, …) are built on: they answer a
 * question about the address, so the answer must not change with the CIDR
 * suffix the caller happened to write. Use this rather than
 * {@link isInSubnet} when classifying a single address — notably when the
 * address came from untrusted input and the result backs a trust-boundary
 * decision such as an SSRF allow/deny filter.
 */ function isHostInSubnet(address) {
    return this.mask(address.subnetMask) === address.mask();
}
function isCorrect(defaultBits) {
    return function isCorrectForm() {
        if (this.addressMinusSuffix !== this.correctForm()) {
            return false;
        }
        if (this.subnetMask === defaultBits && !this.parsedSubnet) {
            return true;
        }
        return this.parsedSubnet === String(this.subnetMask);
    };
}
/**
 * Returns the prefix length (number of leading 1 bits) of a contiguous
 * subnet mask. Throws `AddressError` if the mask is non-contiguous (e.g.
 * `255.0.255.0`).
 */ function prefixLengthFromMask(value, totalBits) {
    const binary = value.toString(2).padStart(totalBits, '0');
    if (binary.length > totalBits) {
        throw new address_error_1.AddressError('Invalid subnet mask.');
    }
    const firstZero = binary.indexOf('0');
    if (firstZero === -1) {
        return totalBits;
    }
    if (binary.slice(firstZero).includes('1')) {
        throw new address_error_1.AddressError('Invalid subnet mask.');
    }
    return firstZero;
}
/**
 * Throws `AddressError` unless `bytes` holds exactly `byteCount` integers,
 * each from `minimum` to 255. Pass a `minimum` of `-128` where signed bytes
 * are accepted and folded to unsigned, and `0` where they are not.
 */ function assertByteArray(bytes, byteCount, family, minimum) {
    if (bytes.length !== byteCount) {
        throw new address_error_1.AddressError(`${family} addresses require exactly ${byteCount} bytes`);
    }
    for(let i = 0; i < bytes.length; i++){
        if (!Number.isInteger(bytes[i]) || bytes[i] < minimum || bytes[i] > 255) {
            throw new address_error_1.AddressError(`All bytes must be integers between ${minimum} and 255`);
        }
    }
}
function numberToPaddedHex(number) {
    return number.toString(16).padStart(2, '0');
}
function stringToPaddedHex(numberString) {
    return numberToPaddedHex(parseInt(numberString, 10));
}
/**
 * @param binaryValue Binary representation of a value (e.g. `10`)
 * @param position Byte position, where 0 is the least significant bit
 */ function testBit(binaryValue, position) {
    const { length } = binaryValue;
    if (position > length) {
        return false;
    }
    const positionInString = length - position;
    return binaryValue.substring(positionInString, positionInString + 1) === '1';
}
}),
"[project]/node_modules/ip-address/dist/v4/constants.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RE_SUBNET_STRING = exports.RE_ADDRESS = exports.GROUPS = exports.BITS = void 0;
exports.BITS = 32;
exports.GROUPS = 4;
// Each octet is 0-255 written without a leading zero. A leading zero is
// octal to the WHATWG URL parser, inet_aton, and getaddrinfo, but decimal to
// parseInt(part, 10), so accepting the notation would make this library
// disagree with the network stack about which host a string names.
exports.RE_ADDRESS = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/g;
exports.RE_SUBNET_STRING = /\/\d{1,2}$/;
}),
"[project]/node_modules/ip-address/dist/ipv4.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable no-param-reassign */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Address4 = void 0;
const common = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/common.js [instrumentation] (ecmascript)"));
const constants = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v4/constants.js [instrumentation] (ecmascript)"));
const address_error_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/address-error.js [instrumentation] (ecmascript)");
const isCorrect4 = common.isCorrect(constants.BITS);
/**
 * Represents an IPv4 address
 * @param {string} address - An IPv4 address string
 */ class Address4 {
    constructor(address){
        this.addressMinusSuffix = '';
        this.groups = constants.GROUPS;
        this.parsedAddress = [];
        this.parsedSubnet = '';
        this.subnet = '/32';
        this.subnetMask = 32;
        this.v4 = true;
        /**
         * Returns true if the address is correct, false otherwise
         * @returns {Boolean}
         */ this.isCorrect = isCorrect4;
        /**
         * Returns true if the given address is in the subnet of the current address
         * @returns {boolean}
         */ this.isInSubnet = common.isInSubnet;
        /**
         * Returns true if this address's host bits fall inside the given subnet,
         * ignoring this address's own subnet mask. See
         * {@link common.isHostInSubnet}.
         * @returns {boolean}
         */ this.isHostInSubnet = common.isHostInSubnet;
        this.address = address;
        const subnet = constants.RE_SUBNET_STRING.exec(address);
        if (subnet) {
            this.parsedSubnet = subnet[0].replace('/', '');
            this.subnetMask = parseInt(this.parsedSubnet, 10);
            this.subnet = `/${this.subnetMask}`;
            if (this.subnetMask < 0 || this.subnetMask > constants.BITS) {
                throw new address_error_1.AddressError('Invalid subnet mask.');
            }
            address = address.replace(constants.RE_SUBNET_STRING, '');
        }
        this.addressMinusSuffix = address;
        this.parsedAddress = this.parse(address);
    }
    /**
     * Returns true if the given string is a valid IPv4 address (with optional
     * CIDR subnet), false otherwise. Host bits in the subnet portion are
     * allowed (e.g. `192.168.1.5/24` is valid); for strict network-address
     * validation compare `correctForm()` to `startAddress().correctForm()`,
     * or use `networkForm()`.
     */ static isValid(address) {
        try {
            // eslint-disable-next-line no-new
            new Address4(address);
            return true;
        } catch  {
            return false;
        }
    }
    /**
     * Parses an IPv4 address string into its four octet groups and stores the
     * result on `this.parsedAddress`. Called automatically by the constructor;
     * you typically don't need to call it directly. Throws `AddressError` if
     * the input is not a valid IPv4 address.
     */ parse(address) {
        const groups = address.split('.');
        // Checked before the general match so the error names the actual problem.
        // Address6 rejects the same notation on its v4-in-v6 path.
        if (groups.some((group)=>/^0\d/.test(group))) {
            throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.");
        }
        if (!address.match(constants.RE_ADDRESS)) {
            throw new address_error_1.AddressError('Invalid IPv4 address.');
        }
        return groups;
    }
    /**
     * Returns the address in correct form: octets joined with `.` and any
     * leading zeros stripped (e.g. `192.168.1.1`). For IPv4 this matches the
     * canonical dotted-decimal representation.
     */ correctForm() {
        return this.parsedAddress.map((part)=>parseInt(part, 10)).join('.');
    }
    /**
     * Construct an `Address4` from an address and a dotted-decimal subnet
     * mask given as separate strings (e.g. as returned by Node's
     * `os.networkInterfaces()`). Throws `AddressError` if the mask is
     * non-contiguous (e.g. `255.0.255.0`).
     * @example
     * var address = Address4.fromAddressAndMask('192.168.1.1', '255.255.255.0');
     * address.subnetMask; // 24
     */ static fromAddressAndMask(address, mask) {
        const bits = common.prefixLengthFromMask(new Address4(mask).bigInt(), constants.BITS);
        return new Address4(`${address}/${bits}`);
    }
    /**
     * Construct an `Address4` from an address and a Cisco-style wildcard mask
     * given as separate strings (e.g. `0.0.0.255` for a `/24`). The wildcard
     * mask is the bitwise inverse of the subnet mask. Throws `AddressError`
     * if the mask is non-contiguous (e.g. `0.255.0.255`).
     * @example
     * var address = Address4.fromAddressAndWildcardMask('10.0.0.1', '0.0.0.255');
     * address.subnetMask; // 24
     */ static fromAddressAndWildcardMask(address, wildcardMask) {
        const wildcard = new Address4(wildcardMask).bigInt();
        const allOnes = (BigInt(1) << BigInt(constants.BITS)) - BigInt(1);
        const mask = wildcard ^ allOnes;
        const bits = common.prefixLengthFromMask(mask, constants.BITS);
        return new Address4(`${address}/${bits}`);
    }
    /**
     * Construct an `Address4` from a wildcard pattern with trailing `*`
     * octets. The number of trailing wildcards determines the prefix
     * length: each `*` represents 8 bits.
     *
     * Only trailing whole-octet wildcards are supported. Partial-octet
     * wildcards (e.g. `192.168.0.1*`) and interior wildcards (e.g.
     * `192.*.0.1`) throw `AddressError`.
     * @example
     * Address4.fromWildcard('192.168.0.*').subnet;   // '/24'
     * Address4.fromWildcard('192.168.*.*').subnet;   // '/16'
     * Address4.fromWildcard('*.*.*.*').subnet;       // '/0'
     */ static fromWildcard(input) {
        const groups = input.split('.');
        if (groups.length !== constants.GROUPS) {
            throw new address_error_1.AddressError('Wildcard pattern must have 4 octets');
        }
        let firstWildcard = -1;
        for(let i = 0; i < groups.length; i++){
            if (groups[i] === '*') {
                if (firstWildcard === -1) {
                    firstWildcard = i;
                }
            } else if (firstWildcard !== -1) {
                throw new address_error_1.AddressError('Wildcard `*` must only appear in trailing octets (e.g. `192.168.0.*`)');
            }
        }
        const trailing = firstWildcard === -1 ? 0 : groups.length - firstWildcard;
        const replaced = groups.map((g)=>g === '*' ? '0' : g);
        const subnetBits = constants.BITS - trailing * 8;
        return new Address4(`${replaced.join('.')}/${subnetBits}`);
    }
    /**
     * Converts a hex string to an IPv4 address object. Accepts 8 hex digits
     * with optional `:` separators (e.g. `'7f000001'` or `'7f:00:00:01'`).
     * Throws `AddressError` for any other length or for non-hex characters.
     * @param {string} hex - a hex string to convert
     * @returns {Address4}
     */ static fromHex(hex) {
        const stripped = hex.replace(/:/g, '');
        if (!/^[0-9a-fA-F]{8}$/.test(stripped)) {
            throw new address_error_1.AddressError('IPv4 hex must be exactly 8 hex digits');
        }
        const groups = [];
        for(let i = 0; i < 8; i += 2){
            groups.push(parseInt(stripped.slice(i, i + 2), 16));
        }
        return new Address4(groups.join('.'));
    }
    /**
     * Converts an integer into a IPv4 address object. The integer must be a
     * non-negative safe integer in the range `[0, 2**32 - 1]`; otherwise
     * `AddressError` is thrown.
     * @param {integer} integer - a number to convert
     * @returns {Address4}
     */ static fromInteger(integer) {
        if (!Number.isInteger(integer) || integer < 0 || integer > 0xffffffff) {
            throw new address_error_1.AddressError('IPv4 integer must be in the range 0 to 2**32 - 1');
        }
        return Address4.fromHex(integer.toString(16).padStart(8, '0'));
    }
    /**
     * Return an address from in-addr.arpa form
     * @param {string} arpaFormAddress - an 'in-addr.arpa' form ipv4 address
     * @returns {Adress4}
     * @example
     * var address = Address4.fromArpa(42.2.0.192.in-addr.arpa.)
     * address.correctForm(); // '192.0.2.42'
     */ static fromArpa(arpaFormAddress) {
        // remove ending ".in-addr.arpa." or just "."
        const leader = arpaFormAddress.replace(/(\.in-addr\.arpa)?\.$/, '');
        const address = leader.split('.').reverse().join('.');
        return new Address4(address);
    }
    /**
     * Converts an IPv4 address object to a hex string
     * @returns {String}
     */ toHex() {
        return this.parsedAddress.map((part)=>common.stringToPaddedHex(part)).join(':');
    }
    /**
     * Converts an IPv4 address object to an array of bytes.
     *
     * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toArray())`.
     * @returns {Array}
     */ toArray() {
        return this.parsedAddress.map((part)=>parseInt(part, 10));
    }
    /**
     * Converts an IPv4 address object to an IPv6 address group
     * @returns {String}
     */ toGroup6() {
        const output = [];
        let i;
        for(i = 0; i < constants.GROUPS; i += 2){
            output.push(`${common.stringToPaddedHex(this.parsedAddress[i])}${common.stringToPaddedHex(this.parsedAddress[i + 1])}`);
        }
        return output.join(':');
    }
    /**
     * Returns the address as a `bigint`
     * @returns {bigint}
     */ bigInt() {
        return BigInt(`0x${this.parsedAddress.map((n)=>common.stringToPaddedHex(n)).join('')}`);
    }
    /**
     * Helper function getting start address.
     * @returns {bigint}
     */ _startAddress() {
        return BigInt(`0b${this.mask() + '0'.repeat(constants.BITS - this.subnetMask)}`);
    }
    /**
     * The first address in the range given by this address' subnet.
     * Often referred to as the Network Address.
     * @returns {Address4}
     */ startAddress() {
        return Address4.fromBigInt(this._startAddress());
    }
    /**
     * The first host address in the range given by this address's subnet ie
     * the first address after the Network Address
     * @returns {Address4}
     */ startAddressExclusive() {
        const adjust = BigInt('1');
        return Address4.fromBigInt(this._startAddress() + adjust);
    }
    /**
     * Helper function getting end address.
     * @returns {bigint}
     */ _endAddress() {
        return BigInt(`0b${this.mask() + '1'.repeat(constants.BITS - this.subnetMask)}`);
    }
    /**
     * The last address in the range given by this address' subnet
     * Often referred to as the Broadcast
     * @returns {Address4}
     */ endAddress() {
        return Address4.fromBigInt(this._endAddress());
    }
    /**
     * The last host address in the range given by this address's subnet ie
     * the last address prior to the Broadcast Address
     * @returns {Address4}
     */ endAddressExclusive() {
        const adjust = BigInt('1');
        return Address4.fromBigInt(this._endAddress() - adjust);
    }
    /**
     * The dotted-decimal form of the subnet mask, e.g. `255.255.240.0` for
     * a `/20`. Returns an `Address4`; call `.correctForm()` for the string.
     * @returns {Address4}
     */ subnetMaskAddress() {
        return Address4.fromBigInt(BigInt(`0b${'1'.repeat(this.subnetMask)}${'0'.repeat(constants.BITS - this.subnetMask)}`));
    }
    /**
     * The Cisco-style wildcard mask, e.g. `0.0.0.255` for a `/24`. This is
     * the bitwise inverse of `subnetMaskAddress()`. Returns an `Address4`;
     * call `.correctForm()` for the string.
     * @returns {Address4}
     */ wildcardMask() {
        return Address4.fromBigInt(BigInt(`0b${'0'.repeat(this.subnetMask)}${'1'.repeat(constants.BITS - this.subnetMask)}`));
    }
    /**
     * The network address in CIDR string form, e.g. `192.168.1.0/24` for
     * `192.168.1.5/24`. For an address with no explicit subnet the prefix is
     * `/32`, e.g. `networkForm()` on `192.168.1.5` returns `192.168.1.5/32`.
     * @returns {string}
     */ networkForm() {
        return `${this.startAddress().correctForm()}/${this.subnetMask}`;
    }
    /**
     * Converts a BigInt to a v4 address object. The value must be in the
     * range `[0, 2**32 - 1]`; otherwise `AddressError` is thrown.
     * @param {bigint} bigInt - a BigInt to convert
     * @returns {Address4}
     */ static fromBigInt(bigInt) {
        if (bigInt < BigInt(0) || bigInt > BigInt(0xffffffff)) {
            throw new address_error_1.AddressError('IPv4 BigInt must be in the range 0 to 2**32 - 1');
        }
        return Address4.fromHex(bigInt.toString(16).padStart(8, '0'));
    }
    /**
     * Convert a byte array to an Address4 object.
     *
     * To convert from a Node.js `Buffer`, spread it: `Address4.fromByteArray([...buf])`.
     * @param {Array<number>} bytes - an array of 4 bytes (0-255)
     * @returns {Address4}
     */ static fromByteArray(bytes) {
        common.assertByteArray(bytes, 4, 'IPv4', 0);
        return this.fromUnsignedByteArray(bytes);
    }
    /**
     * Convert an unsigned byte array to an Address4 object
     * @param {Array<number>} bytes - an array of 4 unsigned bytes (0-255)
     * @returns {Address4}
     */ static fromUnsignedByteArray(bytes) {
        if (bytes.length !== 4) {
            throw new address_error_1.AddressError('IPv4 addresses require exactly 4 bytes');
        }
        const address = bytes.join('.');
        return new Address4(address);
    }
    /**
     * Returns the first n bits of the address, defaulting to the
     * subnet mask
     * @returns {String}
     */ mask(mask) {
        if (mask === undefined) {
            mask = this.subnetMask;
        }
        return this.getBitsBase2(0, mask);
    }
    /**
     * Returns the bits in the given range as a base-2 string
     * @returns {string}
     */ getBitsBase2(start, end) {
        return this.binaryZeroPad().slice(start, end);
    }
    /**
     * Return the reversed ip6.arpa form of the address
     * @param {Object} options
     * @param {boolean} options.omitSuffix - omit the "in-addr.arpa" suffix
     * @returns {String}
     */ reverseForm(options) {
        if (!options) {
            options = {};
        }
        const reversed = this.correctForm().split('.').reverse().join('.');
        if (options.omitSuffix) {
            return reversed;
        }
        return `${reversed}.in-addr.arpa.`;
    }
    /**
     * Returns true if the given address is a multicast address
     * @returns {boolean}
     */ isMulticast() {
        return this.isHostInSubnet(MULTICAST_V4);
    }
    /**
     * Returns true if the address is in one of the [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private address ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
     * @returns {boolean}
     */ isPrivate() {
        return PRIVATE_V4.some((subnet)=>this.isHostInSubnet(subnet));
    }
    /**
     * Returns true if the address is in the loopback range `127.0.0.0/8` ([RFC 1122](https://datatracker.ietf.org/doc/html/rfc1122)).
     * @returns {boolean}
     */ isLoopback() {
        return this.isHostInSubnet(LOOPBACK_V4);
    }
    /**
     * Returns true if the address is in the link-local range `169.254.0.0/16` ([RFC 3927](https://datatracker.ietf.org/doc/html/rfc3927)).
     * @returns {boolean}
     */ isLinkLocal() {
        return this.isHostInSubnet(LINK_LOCAL_V4);
    }
    /**
     * Returns true if the address is the unspecified address `0.0.0.0`.
     * @returns {boolean}
     */ isUnspecified() {
        return this.isHostInSubnet(UNSPECIFIED_V4);
    }
    /**
     * Returns true if the address is the limited broadcast address `255.255.255.255` ([RFC 919](https://datatracker.ietf.org/doc/html/rfc919)).
     * @returns {boolean}
     */ isBroadcast() {
        return this.isHostInSubnet(BROADCAST_V4);
    }
    /**
     * Returns true if the address is in the carrier-grade NAT range `100.64.0.0/10` ([RFC 6598](https://datatracker.ietf.org/doc/html/rfc6598)).
     * @returns {boolean}
     */ isCGNAT() {
        return this.isHostInSubnet(CGNAT_V4);
    }
    /**
     * Returns a zero-padded base-2 string representation of the address
     * @returns {string}
     */ binaryZeroPad() {
        if (this._binaryZeroPad === undefined) {
            this._binaryZeroPad = this.bigInt().toString(2).padStart(constants.BITS, '0');
        }
        return this._binaryZeroPad;
    }
    /**
     * Groups an IPv4 address for inclusion at the end of an IPv6 address
     * @returns {String}
     */ groupForV6() {
        const segments = this.parsedAddress;
        return this.correctForm().replace(constants.RE_ADDRESS, `<span class="hover-group group-v4 group-6">${segments.slice(0, 2).join('.')}</span>.<span class="hover-group group-v4 group-7">${segments.slice(2, 4).join('.')}</span>`);
    }
}
exports.Address4 = Address4;
const MULTICAST_V4 = new Address4('224.0.0.0/4');
const PRIVATE_V4 = [
    new Address4('10.0.0.0/8'),
    new Address4('172.16.0.0/12'),
    new Address4('192.168.0.0/16')
];
const LOOPBACK_V4 = new Address4('127.0.0.0/8');
const LINK_LOCAL_V4 = new Address4('169.254.0.0/16');
const UNSPECIFIED_V4 = new Address4('0.0.0.0/32');
const BROADCAST_V4 = new Address4('255.255.255.255/32');
const CGNAT_V4 = new Address4('100.64.0.0/10');
}),
"[project]/node_modules/ip-address/dist/v6/constants.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RE_URL_WITH_PORT = exports.RE_URL = exports.RE_ZONE_STRING = exports.RE_SUBNET_STRING = exports.RE_BAD_ADDRESS = exports.RE_BAD_CHARACTERS = exports.TYPES = exports.SCOPES = exports.GROUPS = exports.BITS = void 0;
exports.BITS = 128;
exports.GROUPS = 8;
/**
 * Represents IPv6 address scopes
 * @memberof Address6
 * @static
 */ exports.SCOPES = {
    0: 'Reserved',
    1: 'Interface local',
    2: 'Link local',
    4: 'Admin local',
    5: 'Site local',
    8: 'Organization local',
    14: 'Global',
    15: 'Reserved'
};
/**
 * Represents IPv6 address types
 * @memberof Address6
 * @static
 */ exports.TYPES = {
    'ff01::1/128': 'Multicast (All nodes on this interface)',
    'ff01::2/128': 'Multicast (All routers on this interface)',
    'ff02::1/128': 'Multicast (All nodes on this link)',
    'ff02::2/128': 'Multicast (All routers on this link)',
    'ff05::2/128': 'Multicast (All routers in this site)',
    'ff02::5/128': 'Multicast (OSPFv3 AllSPF routers)',
    'ff02::6/128': 'Multicast (OSPFv3 AllDR routers)',
    'ff02::9/128': 'Multicast (RIP routers)',
    'ff02::a/128': 'Multicast (EIGRP routers)',
    'ff02::d/128': 'Multicast (PIM routers)',
    'ff02::16/128': 'Multicast (MLDv2 reports)',
    'ff01::fb/128': 'Multicast (mDNSv6)',
    'ff02::fb/128': 'Multicast (mDNSv6)',
    'ff05::fb/128': 'Multicast (mDNSv6)',
    'ff02::1:2/128': 'Multicast (All DHCP servers and relay agents on this link)',
    'ff05::1:2/128': 'Multicast (All DHCP servers and relay agents in this site)',
    'ff02::1:3/128': 'Multicast (All DHCP servers on this link)',
    'ff05::1:3/128': 'Multicast (All DHCP servers in this site)',
    '::/128': 'Unspecified',
    '::1/128': 'Loopback',
    '::ffff:0:0/96': 'IPv4-mapped',
    'ff00::/8': 'Multicast',
    'fe80::/10': 'Link-local unicast',
    'fc00::/7': 'Unique local',
    '2002::/16': '6to4',
    '2001:db8::/32': 'Documentation',
    '64:ff9b::/96': 'NAT64 (well-known)',
    '64:ff9b:1::/48': 'NAT64 (local-use)'
};
/**
 * A regular expression that matches bad characters in an IPv6 address
 * @memberof Address6
 * @static
 */ exports.RE_BAD_CHARACTERS = /([^0-9a-f:/%])/gi;
/**
 * A regular expression that matches an incorrect IPv6 address
 * @memberof Address6
 * @static
 */ exports.RE_BAD_ADDRESS = /([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]|\/$)/gi;
/**
 * A regular expression that matches an IPv6 subnet
 * @memberof Address6
 * @static
 */ exports.RE_SUBNET_STRING = /\/\d{1,3}(?=%|$)/;
/**
 * A regular expression that matches an IPv6 zone
 * @memberof Address6
 * @static
 */ exports.RE_ZONE_STRING = /%.*$/;
exports.RE_URL = /^(?:\[([0-9a-f:.]+)\]|([0-9a-f:.]+))(?:[/?#].*)?$/i;
exports.RE_URL_WITH_PORT = /^\[([0-9a-f:.]+)\]:([0-9]{1,5})(?:[/?#].*)?$/i;
}),
"[project]/node_modules/ip-address/dist/v6/helpers.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.escapeHtml = escapeHtml;
exports.spanAllZeroes = spanAllZeroes;
exports.spanAll = spanAll;
exports.spanLeadingZeroes = spanLeadingZeroes;
exports.simpleGroup = simpleGroup;
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
/**
 * @returns {String} the string with all zeroes contained in a <span>
 */ function spanAllZeroes(s) {
    return escapeHtml(s).replace(/(0+)/g, '<span class="zero">$1</span>');
}
/**
 * @returns {String} the string with each character contained in a <span>
 */ function spanAll(s, offset = 0) {
    const letters = s.split('');
    return letters.map((n, i)=>`<span class="digit value-${escapeHtml(n)} position-${i + offset}">${spanAllZeroes(n)}</span>`).join('');
}
function spanLeadingZeroesSimple(group) {
    return escapeHtml(group).replace(/^(0+)/, '<span class="zero">$1</span>');
}
/**
 * @returns {String} the string with leading zeroes contained in a <span>
 */ function spanLeadingZeroes(address) {
    const groups = address.split(':');
    return groups.map((g)=>spanLeadingZeroesSimple(g)).join(':');
}
/**
 * Groups an address
 * @returns {String} a grouped address
 */ function simpleGroup(addressString, offset = 0) {
    const groups = addressString.split(':');
    return groups.map((g, i)=>{
        if (/group-v4/.test(g)) {
            return g;
        }
        return `<span class="hover-group group-${i + offset}">${spanLeadingZeroesSimple(g)}</span>`;
    });
}
}),
"[project]/node_modules/ip-address/dist/v6/regular-expressions.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ADDRESS_BOUNDARY = void 0;
exports.groupPossibilities = groupPossibilities;
exports.padGroup = padGroup;
exports.simpleRegularExpression = simpleRegularExpression;
exports.possibleElisions = possibleElisions;
const v6 = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/constants.js [instrumentation] (ecmascript)"));
function groupPossibilities(possibilities) {
    return `(${possibilities.join('|')})`;
}
function padGroup(group) {
    if (group.length < 4) {
        return `0{0,${4 - group.length}}${group}`;
    }
    return group;
}
exports.ADDRESS_BOUNDARY = '[^A-Fa-f0-9:]';
function simpleRegularExpression(groups) {
    const zeroIndexes = [];
    groups.forEach((group, i)=>{
        const groupInteger = parseInt(group, 16);
        if (groupInteger === 0) {
            zeroIndexes.push(i);
        }
    });
    // You can technically elide a single 0, this creates the regular expressions
    // to match that eventuality
    const possibilities = zeroIndexes.map((zeroIndex)=>groups.map((group, i)=>{
            if (i === zeroIndex) {
                const elision = i === 0 || i === v6.GROUPS - 1 ? ':' : '';
                return groupPossibilities([
                    padGroup(group),
                    elision
                ]);
            }
            return padGroup(group);
        }).join(':'));
    // The simplest case
    possibilities.push(groups.map(padGroup).join(':'));
    return groupPossibilities(possibilities);
}
function possibleElisions(elidedGroups, moreLeft, moreRight) {
    const left = moreLeft ? '' : ':';
    const right = moreRight ? '' : ':';
    const possibilities = [];
    // 1. elision of everything (::)
    if (!moreLeft && !moreRight) {
        possibilities.push('::');
    }
    // 2. complete elision of the middle
    if (moreLeft && moreRight) {
        possibilities.push('');
    }
    if (moreRight && !moreLeft || !moreRight && moreLeft) {
        // 3. complete elision of one side
        possibilities.push(':');
    }
    // 4. elision from the left side
    possibilities.push(`${left}(:0{1,4}){1,${elidedGroups - 1}}`);
    // 5. elision from the right side
    possibilities.push(`(0{1,4}:){1,${elidedGroups - 1}}${right}`);
    // 6. no elision
    possibilities.push(`(0{1,4}:){${elidedGroups - 1}}0{1,4}`);
    // 7. elision (including sloppy elision) from the middle
    for(let groups = 1; groups < elidedGroups - 1; groups++){
        for(let position = 1; position < elidedGroups - groups; position++){
            possibilities.push(`(0{1,4}:){${position}}:(0{1,4}:){${elidedGroups - position - groups - 1}}0{1,4}`);
        }
    }
    return groupPossibilities(possibilities);
}
}),
"[project]/node_modules/ip-address/dist/ipv6.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable prefer-destructuring */ /* eslint-disable no-param-reassign */ var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Address6 = void 0;
const common = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/common.js [instrumentation] (ecmascript)"));
const constants4 = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v4/constants.js [instrumentation] (ecmascript)"));
const constants6 = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/constants.js [instrumentation] (ecmascript)"));
const helpers = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/helpers.js [instrumentation] (ecmascript)"));
const ipv4_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ipv4.js [instrumentation] (ecmascript)");
const regular_expressions_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/regular-expressions.js [instrumentation] (ecmascript)");
const address_error_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/address-error.js [instrumentation] (ecmascript)");
const common_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/common.js [instrumentation] (ecmascript)");
const isCorrect6 = common.isCorrect(constants6.BITS);
function assert(condition) {
    if (!condition) {
        throw new Error('Assertion failed.');
    }
}
function addCommas(number) {
    const r = /(\d+)(\d{3})/;
    while(r.test(number)){
        number = number.replace(r, '$1,$2');
    }
    return number;
}
function spanLeadingZeroes4(n) {
    n = n.replace(/^(0{1,})([1-9]+)$/, '<span class="parse-error">$1</span>$2');
    n = n.replace(/^(0{1,})(0)$/, '<span class="parse-error">$1</span>$2');
    return n;
}
/*
 * A helper function to compact an array
 */ function compact(address, slice) {
    const s1 = [];
    const s2 = [];
    let i;
    for(i = 0; i < address.length; i++){
        if (i < slice[0]) {
            s1.push(address[i]);
        } else if (i > slice[1]) {
            s2.push(address[i]);
        }
    }
    return s1.concat([
        'compact'
    ]).concat(s2);
}
function paddedHex(octet) {
    return parseInt(octet, 16).toString(16).padStart(4, '0');
}
function unsignByte(b) {
    return b & 0xff;
}
/**
 * Represents an IPv6 address
 * @param {string} address - An IPv6 address string
 * @param {number} [groups=8] - How many octets to parse
 * @example
 * var address = new Address6('2001::/32');
 */ class Address6 {
    constructor(address, optionalGroups){
        this.addressMinusSuffix = '';
        this.parsedSubnet = '';
        this.subnet = '/128';
        this.subnetMask = 128;
        this.v4 = false;
        this.zone = '';
        // #region Attributes
        /**
         * Returns true if the given address is in the subnet of the current address
         * @returns {boolean}
         */ this.isInSubnet = common.isInSubnet;
        /**
         * Returns true if this address's host bits fall inside the given subnet,
         * ignoring this address's own subnet mask. See
         * {@link common.isHostInSubnet}.
         * @returns {boolean}
         */ this.isHostInSubnet = common.isHostInSubnet;
        /**
         * Returns true if the address is correct, false otherwise
         * @returns {boolean}
         */ this.isCorrect = isCorrect6;
        if (optionalGroups === undefined) {
            this.groups = constants6.GROUPS;
        } else {
            this.groups = optionalGroups;
        }
        this.address = address;
        const subnet = constants6.RE_SUBNET_STRING.exec(address);
        if (subnet) {
            this.parsedSubnet = subnet[0].replace('/', '');
            this.subnetMask = parseInt(this.parsedSubnet, 10);
            this.subnet = `/${this.subnetMask}`;
            if (Number.isNaN(this.subnetMask) || this.subnetMask < 0 || this.subnetMask > constants6.BITS) {
                throw new address_error_1.AddressError('Invalid subnet mask.');
            }
            address = address.replace(constants6.RE_SUBNET_STRING, '');
        }
        // RE_SUBNET_STRING anchors on the end of the address, so it strips only
        // the trailing suffix. A second one left behind (`::/0/1`) is malformed
        // and must be rejected rather than parsed as an address group.
        if (/\//.test(address)) {
            throw new address_error_1.AddressError('Invalid subnet mask.');
        }
        const zone = constants6.RE_ZONE_STRING.exec(address);
        if (zone) {
            this.zone = zone[0];
            address = address.replace(constants6.RE_ZONE_STRING, '');
        }
        this.addressMinusSuffix = address;
        this.parsedAddress = this.parse(this.addressMinusSuffix);
    }
    /**
     * Returns true if the given string is a valid IPv6 address (with optional
     * CIDR subnet and zone identifier), false otherwise. Host bits in the
     * subnet portion are allowed (e.g. `2001:db8::1/32` is valid); for strict
     * network-address validation compare `correctForm()` to
     * `startAddress().correctForm()`, or use `networkForm()`.
     */ static isValid(address) {
        try {
            // eslint-disable-next-line no-new
            new Address6(address);
            return true;
        } catch  {
            return false;
        }
    }
    /**
     * Convert a BigInt to a v6 address object. The value must be in the
     * range `[0, 2**128 - 1]`; otherwise `AddressError` is thrown.
     * @param {bigint} bigInt - a BigInt to convert
     * @returns {Address6}
     * @example
     * var bigInt = BigInt('1000000000000');
     * var address = Address6.fromBigInt(bigInt);
     * address.correctForm(); // '::e8:d4a5:1000'
     */ static fromBigInt(bigInt) {
        if (bigInt < BigInt(0) || bigInt > (BigInt(1) << BigInt(constants6.BITS)) - BigInt(1)) {
            throw new address_error_1.AddressError('IPv6 BigInt must be in the range 0 to 2**128 - 1');
        }
        const hex = bigInt.toString(16).padStart(32, '0');
        const groups = [];
        for(let i = 0; i < constants6.GROUPS; i++){
            groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return new Address6(groups.join(':'));
    }
    /**
     * Parse a URL (with optional bracketed host and port) into an address and
     * port. Returns either `{ address, port }` on success or
     * `{ error, address: null, port: null }` if the URL could not be parsed.
     * Ports are returned as numbers (or `null` if absent or out of range).
     * @example
     * var addressAndPort = Address6.fromURL('http://[ffff::]:8080/foo/');
     * addressAndPort.address.correctForm(); // 'ffff::'
     * addressAndPort.port; // 8080
     */ static fromURL(url) {
        var _a;
        let host;
        let port = null;
        let result;
        // Remove the protocol prefix, if any
        const stripped = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
        // If we have brackets parse them and find a port
        if (stripped.indexOf('[') !== -1 && stripped.indexOf(']:') !== -1) {
            result = constants6.RE_URL_WITH_PORT.exec(stripped);
            if (result === null) {
                return {
                    error: 'failed to parse address with port',
                    address: null,
                    port: null
                };
            }
            host = result[1];
            port = result[2];
        } else {
            result = constants6.RE_URL.exec(stripped);
            if (result === null) {
                return {
                    error: 'failed to parse address from URL',
                    address: null,
                    port: null
                };
            }
            host = (_a = result[1]) !== null && _a !== void 0 ? _a : result[2];
        }
        // If there's a port convert it to an integer
        if (port) {
            port = parseInt(port, 10);
            // squelch out of range ports (valid ports are 0-65535)
            if (port < 0 || port > 65535) {
                port = null;
            }
        } else {
            // Standardize `undefined` to `null`
            port = null;
        }
        return {
            address: new Address6(host),
            port
        };
    }
    /**
     * Construct an `Address6` from an address and a hex subnet mask given as
     * separate strings (e.g. as returned by Node's `os.networkInterfaces()`).
     * Throws `AddressError` if the mask is non-contiguous (e.g.
     * `ffff::ffff`).
     * @example
     * var address = Address6.fromAddressAndMask('fe80::1', 'ffff:ffff:ffff:ffff::');
     * address.subnetMask; // 64
     */ static fromAddressAndMask(address, mask) {
        const bits = common.prefixLengthFromMask(new Address6(mask).bigInt(), constants6.BITS);
        return new Address6(`${address}/${bits}`);
    }
    /**
     * Construct an `Address6` from an address and a Cisco-style wildcard mask
     * given as separate strings (e.g. `::ffff:ffff:ffff:ffff` for a `/64`).
     * The wildcard mask is the bitwise inverse of the subnet mask. Throws
     * `AddressError` if the mask is non-contiguous.
     * @example
     * var address = Address6.fromAddressAndWildcardMask('fe80::1', '::ffff:ffff:ffff:ffff');
     * address.subnetMask; // 64
     */ static fromAddressAndWildcardMask(address, wildcardMask) {
        const wildcard = new Address6(wildcardMask).bigInt();
        const allOnes = (BigInt(1) << BigInt(constants6.BITS)) - BigInt(1);
        const mask = wildcard ^ allOnes;
        const bits = common.prefixLengthFromMask(mask, constants6.BITS);
        return new Address6(`${address}/${bits}`);
    }
    /**
     * Construct an `Address6` from a wildcard pattern with trailing `*`
     * groups. The number of trailing wildcards determines the prefix
     * length: each `*` represents 16 bits. `::` is expanded to zero groups
     * (not wildcards) before evaluating trailing wildcards.
     *
     * Only trailing whole-group wildcards are supported. Partial-group
     * wildcards (e.g. `2001:db8::0*`) and interior wildcards (e.g.
     * `*::1`) throw `AddressError`.
     * @example
     * Address6.fromWildcard('2001:db8:*:*:*:*:*:*').subnet;  // '/32'
     * Address6.fromWildcard('2001:db8::*').subnet;           // '/112'
     * Address6.fromWildcard('*:*:*:*:*:*:*:*').subnet;       // '/0'
     */ static fromWildcard(input) {
        if (input.includes('%') || input.includes('/')) {
            throw new address_error_1.AddressError('Wildcard pattern must not include a zone or CIDR suffix');
        }
        const halves = input.split('::');
        if (halves.length > 2) {
            throw new address_error_1.AddressError("Wildcard pattern cannot contain more than one '::'");
        }
        let groups;
        if (halves.length === 2) {
            const left = halves[0] === '' ? [] : halves[0].split(':');
            const right = halves[1] === '' ? [] : halves[1].split(':');
            const remaining = constants6.GROUPS - left.length - right.length;
            if (remaining < 1) {
                throw new address_error_1.AddressError("Wildcard pattern with '::' has too many groups");
            }
            groups = [
                ...left,
                ...new Array(remaining).fill('0'),
                ...right
            ];
        } else {
            groups = input.split(':');
        }
        if (groups.length !== constants6.GROUPS) {
            throw new address_error_1.AddressError('Wildcard pattern must have 8 groups');
        }
        let firstWildcard = -1;
        for(let i = 0; i < groups.length; i++){
            if (groups[i] === '*') {
                if (firstWildcard === -1) {
                    firstWildcard = i;
                }
            } else if (firstWildcard !== -1) {
                throw new address_error_1.AddressError('Wildcard `*` must only appear in trailing groups (e.g. `2001:db8:*:*:*:*:*:*`)');
            }
        }
        const trailing = firstWildcard === -1 ? 0 : groups.length - firstWildcard;
        const replaced = groups.map((g)=>g === '*' ? '0' : g);
        const subnetBits = constants6.BITS - trailing * 16;
        return new Address6(`${replaced.join(':')}/${subnetBits}`);
    }
    /**
     * Create an IPv6-mapped address given an IPv4 address
     * @param {string} address - An IPv4 address string
     * @returns {Address6}
     * @example
     * var address = Address6.fromAddress4('192.168.0.1');
     * address.correctForm(); // '::ffff:c0a8:1'
     * address.to4in6(); // '::ffff:192.168.0.1'
     */ static fromAddress4(address) {
        const address4 = new ipv4_1.Address4(address);
        const mask6 = constants6.BITS - (constants4.BITS - address4.subnetMask);
        return new Address6(`::ffff:${address4.correctForm()}/${mask6}`);
    }
    /**
     * Return an address from ip6.arpa form
     * @param {string} arpaFormAddress - an 'ip6.arpa' form address
     * @returns {Adress6}
     * @example
     * var address = Address6.fromArpa(e.f.f.f.3.c.2.6.f.f.f.e.6.6.8.e.1.0.6.7.9.4.e.c.0.0.0.0.1.0.0.2.ip6.arpa.)
     * address.correctForm(); // '2001:0:ce49:7601:e866:efff:62c3:fffe'
     */ static fromArpa(arpaFormAddress) {
        // remove ending ".ip6.arpa." or just "."
        let address = arpaFormAddress.replace(/(\.ip6\.arpa)?\.$/, '');
        const semicolonAmount = 7;
        // correct ip6.arpa form with ending removed will be 63 characters
        if (address.length !== 63) {
            throw new address_error_1.AddressError("Invalid 'ip6.arpa' form.");
        }
        const parts = address.split('.').reverse();
        for(let i = semicolonAmount; i > 0; i--){
            const insertIndex = i * 4;
            parts.splice(insertIndex, 0, ':');
        }
        address = parts.join('');
        return new Address6(address);
    }
    /**
     * Return the Microsoft UNC transcription of the address
     * @returns {String} the Microsoft UNC transcription of the address
     */ microsoftTranscription() {
        return `${this.correctForm().replace(/:/g, '-')}.ipv6-literal.net`;
    }
    /**
     * Return the first n bits of the address, defaulting to the subnet mask
     * @param {number} [mask=subnet] - the number of bits to mask
     * @returns {String} the first n bits of the address as a string
     */ mask(mask = this.subnetMask) {
        return this.getBitsBase2(0, mask);
    }
    /**
     * Return the number of possible subnets of a given size in the address
     * @param {number} [subnetSize=128] - the subnet size
     * @returns {String}
     */ // TODO: probably useful to have a numeric version of this too
    possibleSubnets(subnetSize = 128) {
        const availableBits = constants6.BITS - this.subnetMask;
        const subnetBits = Math.abs(subnetSize - constants6.BITS);
        const subnetPowers = availableBits - subnetBits;
        if (subnetPowers < 0) {
            return '0';
        }
        return addCommas((BigInt('2') ** BigInt(subnetPowers)).toString(10));
    }
    /**
     * Helper function getting start address.
     * @returns {bigint}
     */ _startAddress() {
        return BigInt(`0b${this.mask() + '0'.repeat(constants6.BITS - this.subnetMask)}`);
    }
    /**
     * The first address in the range given by this address' subnet
     * Often referred to as the Network Address.
     * @returns {Address6}
     */ startAddress() {
        return Address6.fromBigInt(this._startAddress());
    }
    /**
     * The first host address in the range given by this address's subnet ie
     * the first address after the Network Address
     * @returns {Address6}
     */ startAddressExclusive() {
        const adjust = BigInt('1');
        return Address6.fromBigInt(this._startAddress() + adjust);
    }
    /**
     * Helper function getting end address.
     * @returns {bigint}
     */ _endAddress() {
        return BigInt(`0b${this.mask() + '1'.repeat(constants6.BITS - this.subnetMask)}`);
    }
    /**
     * The last address in the range given by this address' subnet
     * Often referred to as the Broadcast
     * @returns {Address6}
     */ endAddress() {
        return Address6.fromBigInt(this._endAddress());
    }
    /**
     * The last host address in the range given by this address's subnet ie
     * the last address prior to the Broadcast Address
     * @returns {Address6}
     */ endAddressExclusive() {
        const adjust = BigInt('1');
        return Address6.fromBigInt(this._endAddress() - adjust);
    }
    /**
     * The hex form of the subnet mask, e.g. `ffff:ffff:ffff:ffff::` for a
     * `/64`. Returns an `Address6`; call `.correctForm()` for the string.
     * @returns {Address6}
     */ subnetMaskAddress() {
        return Address6.fromBigInt(BigInt(`0b${'1'.repeat(this.subnetMask)}${'0'.repeat(constants6.BITS - this.subnetMask)}`));
    }
    /**
     * The Cisco-style wildcard mask, e.g. `::ffff:ffff:ffff:ffff` for a
     * `/64`. This is the bitwise inverse of `subnetMaskAddress()`. Returns
     * an `Address6`; call `.correctForm()` for the string.
     * @returns {Address6}
     */ wildcardMask() {
        return Address6.fromBigInt(BigInt(`0b${'0'.repeat(this.subnetMask)}${'1'.repeat(constants6.BITS - this.subnetMask)}`));
    }
    /**
     * The network address in CIDR string form, e.g. `2001:db8::/32` for
     * `2001:db8::1/32`. For an address with no explicit subnet the prefix
     * is `/128`, e.g. `networkForm()` on `2001:db8::1` returns
     * `2001:db8::1/128`.
     * @returns {string}
     */ networkForm() {
        return `${this.startAddress().correctForm()}/${this.subnetMask}`;
    }
    /**
     * Return the scope of the address. The 4-bit scope field
     * ([RFC 4291 §2.7](https://datatracker.ietf.org/doc/html/rfc4291#section-2.7))
     * is only defined for multicast addresses; for unicast addresses the scope
     * is derived from the address type per
     * [RFC 4007 §6](https://datatracker.ietf.org/doc/html/rfc4007#section-6).
     * @returns {String}
     */ getScope() {
        const type = this.getType();
        if (type === 'Multicast' || type.startsWith('Multicast ')) {
            const scope = constants6.SCOPES[parseInt(this.getBits(12, 16).toString(10), 10)];
            return scope || 'Unknown';
        }
        // RFC 4291 §2.5.3: the loopback address is treated as having Link-Local
        // scope. (Multicast scope 1, "Interface-Local", is a different concept
        // used only for loopback transmission of multicast.)
        if (type === 'Link-local unicast' || type === 'Loopback') {
            return 'Link local';
        }
        // RFC 4007 §6: the unspecified address has no scope.
        if (type === 'Unspecified') {
            return 'Unknown';
        }
        return 'Global';
    }
    /**
     * Return the type of the address
     * @returns {String}
     */ getType() {
        for(let i = 0; i < TYPE_SUBNETS.length; i++){
            const entry = TYPE_SUBNETS[i];
            if (this.isHostInSubnet(entry[0])) {
                return entry[1];
            }
        }
        return 'Global unicast';
    }
    /**
     * Return the bits in the given range as a BigInt
     * @returns {bigint}
     */ getBits(start, end) {
        return BigInt(`0b${this.getBitsBase2(start, end)}`);
    }
    /**
     * Return the bits in the given range as a base-2 string
     * @returns {String}
     */ getBitsBase2(start, end) {
        return this.binaryZeroPad().slice(start, end);
    }
    /**
     * Return the bits in the given range as a base-16 string
     * @returns {String}
     */ getBitsBase16(start, end) {
        const length = end - start;
        if (length % 4 !== 0) {
            throw new Error('Length of bits to retrieve must be divisible by four');
        }
        return this.getBits(start, end).toString(16).padStart(length / 4, '0');
    }
    /**
     * Return the bits that are set past the subnet mask length
     * @returns {String}
     */ getBitsPastSubnet() {
        return this.getBitsBase2(this.subnetMask, constants6.BITS);
    }
    /**
     * Return the reversed ip6.arpa form of the address
     * @param {Object} options
     * @param {boolean} options.omitSuffix - omit the "ip6.arpa" suffix
     * @returns {String}
     */ reverseForm(options) {
        if (!options) {
            options = {};
        }
        const characters = Math.floor(this.subnetMask / 4);
        const reversed = this.canonicalForm().replace(/:/g, '').split('').slice(0, characters).reverse().join('.');
        if (characters > 0) {
            if (options.omitSuffix) {
                return reversed;
            }
            return `${reversed}.ip6.arpa.`;
        }
        if (options.omitSuffix) {
            return '';
        }
        return 'ip6.arpa.';
    }
    /**
     * Returns the address in correct form, per
     * [RFC 5952](https://datatracker.ietf.org/doc/html/rfc5952): leading zeros
     * stripped, the longest run of zero groups collapsed to `::`, and hex digits
     * lowercased (e.g. `2001:db8::1`). This is the recommended form for display.
     */ correctForm() {
        let i;
        let groups = [];
        let zeroCounter = 0;
        const zeroes = [];
        for(i = 0; i < this.parsedAddress.length; i++){
            const value = parseInt(this.parsedAddress[i], 16);
            if (value === 0) {
                zeroCounter++;
            }
            if (value !== 0 && zeroCounter > 0) {
                if (zeroCounter > 1) {
                    zeroes.push([
                        i - zeroCounter,
                        i - 1
                    ]);
                }
                zeroCounter = 0;
            }
        }
        // Do we end with a string of zeroes?
        if (zeroCounter > 1) {
            zeroes.push([
                this.parsedAddress.length - zeroCounter,
                this.parsedAddress.length - 1
            ]);
        }
        const zeroLengths = zeroes.map((n)=>n[1] - n[0] + 1);
        if (zeroes.length > 0) {
            const index = zeroLengths.indexOf(Math.max(...zeroLengths));
            groups = compact(this.parsedAddress, zeroes[index]);
        } else {
            groups = this.parsedAddress;
        }
        for(i = 0; i < groups.length; i++){
            if (groups[i] !== 'compact') {
                groups[i] = parseInt(groups[i], 16).toString(16);
            }
        }
        let correct = groups.join(':');
        correct = correct.replace(/^compact$/, '::');
        correct = correct.replace(/(^compact)|(compact$)/, ':');
        correct = correct.replace(/compact/, '');
        return correct;
    }
    /**
     * Return a zero-padded base-2 string representation of the address
     * @returns {String}
     * @example
     * var address = new Address6('2001:4860:4001:803::1011');
     * address.binaryZeroPad();
     * // '0010000000000001010010000110000001000000000000010000100000000011
     * //  0000000000000000000000000000000000000000000000000001000000010001'
     */ binaryZeroPad() {
        if (this._binaryZeroPad === undefined) {
            this._binaryZeroPad = this.bigInt().toString(2).padStart(constants6.BITS, '0');
        }
        return this._binaryZeroPad;
    }
    /**
     * Parses a v4-in-v6 string (e.g. `::ffff:192.168.0.1`) by extracting the
     * trailing IPv4 address into `this.address4` / `this.parsedAddress4` and
     * returning the address with the v4 portion converted to two v6 groups.
     * Used internally by `parse()`.
     */ // TODO: Improve the semantics of this helper function
    parse4in6(address) {
        if (address.indexOf('.') === -1) {
            return address;
        }
        const groups = address.split(':');
        const lastGroup = groups.slice(-1)[0];
        // RE_ADDRESS rejects octets with a leading zero, so a dotted-quad tail is
        // matched permissively first: that way this notation still gets its own
        // message with the offending octet highlighted, rather than falling
        // through as an unrecognized group.
        const v4Octets = lastGroup.split('.');
        if (v4Octets.length === constants4.GROUPS && v4Octets.every((octet)=>/^\d{1,3}$/.test(octet))) {
            if (v4Octets.some((octet)=>/^0\d/.test(octet))) {
                // The prefix groups haven't been through the bad-character check
                // yet, so escape them before including in the error HTML.
                const highlighted = v4Octets.map(spanLeadingZeroes4).join('.');
                const prefix = groups.slice(0, -1).map(helpers.escapeHtml).join(':');
                const separator = groups.length > 1 ? ':' : '';
                throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.", `${prefix}${separator}${highlighted}`);
            }
        }
        const address4 = lastGroup.match(constants4.RE_ADDRESS);
        if (address4) {
            this.parsedAddress4 = address4[0];
            const v4Suffix = this.subnetMask >= 96 ? `/${this.subnetMask - 96}` : '';
            this.address4 = new ipv4_1.Address4(`${this.parsedAddress4}${v4Suffix}`);
            this.v4 = true;
            groups[groups.length - 1] = this.address4.toGroup6();
            address = groups.join(':');
        }
        return address;
    }
    /**
     * Parses an IPv6 address string into its 8 hexadecimal groups (expanding
     * any `::` elision and any trailing v4-in-v6 portion) and stores the result
     * on `this.parsedAddress`. Called automatically by the constructor; you
     * typically don't need to call it directly. Throws `AddressError` if the
     * input is malformed.
     */ // TODO: Make private?
    parse(address) {
        address = this.parse4in6(address);
        const badCharacters = address.match(constants6.RE_BAD_CHARACTERS);
        if (badCharacters) {
            throw new address_error_1.AddressError(`Bad character${badCharacters.length > 1 ? 's' : ''} detected in address: ${badCharacters.join('')}`, address.replace(constants6.RE_BAD_CHARACTERS, '<span class="parse-error">$1</span>'));
        }
        const badAddress = address.match(constants6.RE_BAD_ADDRESS);
        if (badAddress) {
            throw new address_error_1.AddressError(`Address failed regex: ${badAddress.join('')}`, address.replace(constants6.RE_BAD_ADDRESS, '<span class="parse-error">$1</span>'));
        }
        let groups = [];
        const halves = address.split('::');
        if (halves.length === 2) {
            let first = halves[0].split(':');
            let last = halves[1].split(':');
            if (first.length === 1 && first[0] === '') {
                first = [];
            }
            if (last.length === 1 && last[0] === '') {
                last = [];
            }
            const remaining = this.groups - (first.length + last.length);
            if (!remaining) {
                throw new address_error_1.AddressError('Error parsing groups');
            }
            this.elidedGroups = remaining;
            this.elisionBegin = first.length;
            this.elisionEnd = first.length + this.elidedGroups;
            groups = groups.concat(first);
            for(let i = 0; i < remaining; i++){
                groups.push('0');
            }
            groups = groups.concat(last);
        } else if (halves.length === 1) {
            groups = address.split(':');
            this.elidedGroups = 0;
        } else {
            throw new address_error_1.AddressError('Too many :: groups found');
        }
        groups = groups.map((group)=>parseInt(group, 16).toString(16));
        if (groups.length !== this.groups) {
            throw new address_error_1.AddressError('Incorrect number of groups found');
        }
        return groups;
    }
    /**
     * Returns the canonical (fully expanded) form of the address: all 8 groups,
     * each padded to 4 hex digits, with no `::` collapsing
     * (e.g. `2001:0db8:0000:0000:0000:0000:0000:0001`). Useful for sorting and
     * byte-exact comparison.
     */ canonicalForm() {
        return this.parsedAddress.map(paddedHex).join(':');
    }
    /**
     * Return the decimal form of the address
     * @returns {String}
     */ decimal() {
        return this.parsedAddress.map((n)=>parseInt(n, 16).toString(10).padStart(5, '0')).join(':');
    }
    /**
     * Return the address as a BigInt
     * @returns {bigint}
     */ bigInt() {
        return BigInt(`0x${this.parsedAddress.map(paddedHex).join('')}`);
    }
    /**
     * Return the last two groups of this address as an IPv4 address string.
     * If this address carries a CIDR prefix that covers the trailing 32 bits
     * (i.e. `subnetMask >= 96`), the resulting `Address4` inherits the
     * corresponding v4 prefix (`subnetMask - 96`); otherwise it defaults to
     * `/32`.
     * @returns {Address4}
     * @example
     * var address = new Address6('2001:4860:4001::1825:bf11');
     * address.to4().correctForm(); // '24.37.191.17'
     */ to4() {
        const binary = this.binaryZeroPad().split('');
        const hex = BigInt(`0b${binary.slice(96, 128).join('')}`).toString(16).padStart(8, '0');
        if (this.subnetMask >= 96) {
            const v4Mask = this.subnetMask - 96;
            const groups = [];
            for(let i = 0; i < 8; i += 2){
                groups.push(parseInt(hex.slice(i, i + 2), 16));
            }
            return new ipv4_1.Address4(`${groups.join('.')}/${v4Mask}`);
        }
        return ipv4_1.Address4.fromHex(hex);
    }
    /**
     * Return the v4-in-v6 form of the address
     * @returns {String}
     */ to4in6() {
        const address4 = this.to4();
        const address6 = new Address6(this.parsedAddress.slice(0, 6).join(':'), 6);
        const correct = address6.correctForm();
        let infix = '';
        if (!/:$/.test(correct)) {
            infix = ':';
        }
        return correct + infix + address4.correctForm();
    }
    /**
     * Decodes the Teredo tunneling fields embedded in this address. Returns the
     * Teredo prefix, server IPv4, client IPv4, raw flag bits, cone-NAT flag,
     * UDP port, and Microsoft-format flag breakdown (reserved, universal/local,
     * group/individual, nonce). Only meaningful for addresses in `2001::/32`.
     */ inspectTeredo() {
        /*
        - Bits 0 to 31 are set to the Teredo prefix (normally 2001:0000::/32).
        - Bits 32 to 63 embed the primary IPv4 address of the Teredo server that
          is used.
        - Bits 64 to 79 can be used to define some flags. Currently only the
          higher order bit is used; it is set to 1 if the Teredo client is
          located behind a cone NAT, 0 otherwise. For Microsoft's Windows Vista
          and Windows Server 2008 implementations, more bits are used. In those
          implementations, the format for these 16 bits is "CRAAAAUG AAAAAAAA",
          where "C" remains the "Cone" flag. The "R" bit is reserved for future
          use. The "U" bit is for the Universal/Local flag (set to 0). The "G" bit
          is Individual/Group flag (set to 0). The A bits are set to a 12-bit
          randomly generated number chosen by the Teredo client to introduce
          additional protection for the Teredo node against IPv6-based scanning
          attacks.
        - Bits 80 to 95 contains the obfuscated UDP port number. This is the
          port number that is mapped by the NAT to the Teredo client with all
          bits inverted.
        - Bits 96 to 127 contains the obfuscated IPv4 address. This is the
          public IPv4 address of the NAT with all bits inverted.
        */ const prefix = this.getBitsBase16(0, 32);
        const bitsForUdpPort = this.getBits(80, 96);
        const udpPort = (bitsForUdpPort ^ BigInt('0xffff')).toString();
        const server4 = ipv4_1.Address4.fromHex(this.getBitsBase16(32, 64));
        const bitsForClient4 = this.getBits(96, 128);
        const client4 = ipv4_1.Address4.fromHex((bitsForClient4 ^ BigInt('0xffffffff')).toString(16).padStart(8, '0'));
        const flagsBase2 = this.getBitsBase2(64, 80);
        const coneNat = (0, common_1.testBit)(flagsBase2, 15);
        const reserved = (0, common_1.testBit)(flagsBase2, 14);
        const groupIndividual = (0, common_1.testBit)(flagsBase2, 8);
        const universalLocal = (0, common_1.testBit)(flagsBase2, 9);
        const nonce = BigInt(`0b${flagsBase2.slice(2, 6) + flagsBase2.slice(8, 16)}`).toString(10);
        return {
            prefix: `${prefix.slice(0, 4)}:${prefix.slice(4, 8)}`,
            server4: server4.address,
            client4: client4.address,
            flags: flagsBase2,
            coneNat,
            microsoft: {
                reserved,
                universalLocal,
                groupIndividual,
                nonce
            },
            udpPort
        };
    }
    /**
     * Decodes the 6to4 tunneling fields embedded in this address. Returns the
     * 6to4 prefix and the embedded IPv4 gateway address. Only meaningful for
     * addresses in `2002::/16`.
     */ inspect6to4() {
        /*
        - Bits 0 to 15 are set to the 6to4 prefix (2002::/16).
        - Bits 16 to 48 embed the IPv4 address of the 6to4 gateway that is used.
        */ const prefix = this.getBitsBase16(0, 16);
        const gateway = ipv4_1.Address4.fromHex(this.getBitsBase16(16, 48));
        return {
            prefix: prefix.slice(0, 4),
            gateway: gateway.address
        };
    }
    /**
     * Return a v6 6to4 address from a v6 v4inv6 address
     * @returns {Address6}
     */ to6to4() {
        if (!this.is4()) {
            return null;
        }
        const addr6to4 = [
            '2002',
            this.getBitsBase16(96, 112),
            this.getBitsBase16(112, 128),
            '',
            '/16'
        ].join(':');
        return new Address6(addr6to4);
    }
    /**
     * Embed an IPv4 address into a NAT64 IPv6 address using the encoding
     * defined by [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052).
     * The default prefix is the well-known prefix `64:ff9b::/96`. The prefix
     * length must be one of 32, 40, 48, 56, 64, or 96; for prefixes shorter
     * than /64 the IPv4 octets are split around the reserved bits 64–71.
     * @example
     * Address6.fromAddress4Nat64('192.0.2.33').correctForm(); // '64:ff9b::c000:221'
     * Address6.fromAddress4Nat64('192.0.2.33', '2001:db8::/32').correctForm(); // '2001:db8:c000:221::'
     */ static fromAddress4Nat64(address, prefix = '64:ff9b::/96') {
        const v4 = new ipv4_1.Address4(address);
        const prefix6 = new Address6(prefix);
        const pl = prefix6.subnetMask;
        if (pl !== 32 && pl !== 40 && pl !== 48 && pl !== 56 && pl !== 64 && pl !== 96) {
            throw new address_error_1.AddressError('NAT64 prefix length must be 32, 40, 48, 56, 64, or 96');
        }
        const prefixBits = prefix6.binaryZeroPad();
        const v4Bits = v4.binaryZeroPad();
        let bits;
        if (pl === 96) {
            bits = prefixBits.slice(0, 96) + v4Bits;
        } else {
            const beforeU = 64 - pl;
            bits = [
                prefixBits.slice(0, pl),
                v4Bits.slice(0, beforeU),
                // Bits 64 to 71 are the reserved u octet and are always zero.
                '00000000',
                v4Bits.slice(beforeU),
                '0'.repeat(128 - 72 - (32 - beforeU))
            ].join('');
        }
        const hex = BigInt(`0b${bits}`).toString(16).padStart(32, '0');
        const groups = [];
        for(let i = 0; i < 8; i++){
            groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return new Address6(groups.join(':'));
    }
    /**
     * Extract the embedded IPv4 address from a NAT64 IPv6 address using the
     * encoding defined by [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052).
     * The default prefix is the well-known prefix `64:ff9b::/96`. Returns
     * `null` if this address is not contained within the given prefix.
     * @example
     * new Address6('64:ff9b::c000:221').toAddress4Nat64()!.correctForm(); // '192.0.2.33'
     */ toAddress4Nat64(prefix = '64:ff9b::/96') {
        const prefix6 = new Address6(prefix);
        const pl = prefix6.subnetMask;
        if (pl !== 32 && pl !== 40 && pl !== 48 && pl !== 56 && pl !== 64 && pl !== 96) {
            throw new address_error_1.AddressError('NAT64 prefix length must be 32, 40, 48, 56, 64, or 96');
        }
        if (!this.isHostInSubnet(prefix6)) {
            return null;
        }
        const bits = this.binaryZeroPad();
        let v4Bits;
        if (pl === 96) {
            v4Bits = bits.slice(96, 128);
        } else {
            const beforeU = 64 - pl;
            v4Bits = bits.slice(pl, pl + beforeU) + bits.slice(72, 72 + (32 - beforeU));
        }
        const octets = [];
        for(let i = 0; i < 4; i++){
            octets.push(parseInt(v4Bits.slice(i * 8, (i + 1) * 8), 2).toString());
        }
        return new ipv4_1.Address4(octets.join('.'));
    }
    /**
     * Return a byte array.
     *
     * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toByteArray())`.
     * @returns {Array}
     */ toByteArray() {
        const value = this.bigInt().toString(16).padStart(constants6.BITS / 4, '0');
        const bytes = [];
        for(let i = 0, length = value.length; i < length; i += 2){
            bytes.push(parseInt(value.substring(i, i + 2), 16));
        }
        return bytes;
    }
    /**
     * Return an unsigned byte array.
     *
     * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toUnsignedByteArray())`.
     * @returns {Array}
     */ toUnsignedByteArray() {
        // toByteArray() emits 0 to 255, so unsigning it is an identity mapping and
        // the two methods return equal arrays. 11.0.0 keeps one of them and makes
        // this a deprecated alias; test/common-test.ts fails at that version.
        return this.toByteArray().map(unsignByte);
    }
    /**
     * Convert a byte array to an Address6 object.
     *
     * Accepts unsigned bytes (0 to 255) or signed bytes (-128 to 127, as an
     * `Int8Array` or a Java `byte[]` holds them), folding signed values to their
     * unsigned equivalent. Throws `AddressError` unless given exactly 16
     * integers from -128 to 255.
     *
     * To convert from a Node.js `Buffer`, spread it: `Address6.fromByteArray([...buf])`.
     * @returns {Address6}
     */ static fromByteArray(bytes) {
        // Address4.fromByteArray takes unsigned bytes only. 11.0.0 aligns this
        // method with it, at which point the -128 floor here, unsignByte, and the
        // mapping below all go; test/common-test.ts fails at that version.
        common.assertByteArray(bytes, 16, 'IPv6', -128);
        return this.fromUnsignedByteArray(bytes.map(unsignByte));
    }
    /**
     * Convert an unsigned byte array to an Address6 object.
     *
     * Throws `AddressError` unless given exactly 16 integers from 0 to 255.
     *
     * To convert from a Node.js `Buffer`, spread it: `Address6.fromUnsignedByteArray([...buf])`.
     * @returns {Address6}
     */ static fromUnsignedByteArray(bytes) {
        common.assertByteArray(bytes, 16, 'IPv6', 0);
        const BYTE_MAX = BigInt('256');
        let result = BigInt('0');
        let multiplier = BigInt('1');
        for(let i = bytes.length - 1; i >= 0; i--){
            result += multiplier * BigInt(bytes[i].toString(10));
            multiplier *= BYTE_MAX;
        }
        return Address6.fromBigInt(result);
    }
    /**
     * Returns true if the address is in the canonical form, false otherwise
     * @returns {boolean}
     */ isCanonical() {
        return this.addressMinusSuffix === this.canonicalForm();
    }
    /**
     * Returns true if the address is a link local address, false otherwise
     * @returns {boolean}
     */ isLinkLocal() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isLinkLocal();
        }
        // Zeroes are required, i.e. we can't check isHostInSubnet with 'fe80::/10'
        if (this.getBitsBase2(0, 64) === '1111111010000000000000000000000000000000000000000000000000000000') {
            return true;
        }
        return false;
    }
    /**
     * Returns true if the address is a multicast address, false otherwise
     * @returns {boolean}
     */ isMulticast() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isMulticast();
        }
        const type = this.getType();
        return type === 'Multicast' || type.startsWith('Multicast ');
    }
    /**
     * Returns true if the address was written in v4-in-v6 dotted-quad notation
     * (e.g. `::ffff:127.0.0.1`), false otherwise. This is a notation-level flag
     * and does not reflect whether the address bits lie in the IPv4-mapped
     * (`::ffff:0:0/96`) subnet — for that, see {@link isMapped4}.
     * @returns {boolean}
     */ is4() {
        return this.v4;
    }
    /**
     * Returns true if the address is an IPv4-mapped IPv6 address in
     * `::ffff:0:0/96` ([RFC 4291 §2.5.5.2](https://datatracker.ietf.org/doc/html/rfc4291#section-2.5.5.2)),
     * false otherwise. Unlike {@link is4}, this checks the underlying address
     * bits rather than the textual notation, so `::ffff:127.0.0.1` and
     * `::ffff:7f00:1` both return true.
     * @returns {boolean}
     */ isMapped4() {
        return this.isHostInSubnet(IPV4_MAPPED_SUBNET);
    }
    /**
     * If this address embeds a routable IPv4 address — i.e. it is IPv4-mapped
     * (`::ffff:0:0/96`) or sits in the NAT64 well-known prefix (`64:ff9b::/96`,
     * [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052)) — return that
     * embedded address as an {@link Address4}; otherwise return null.
     *
     * The special-property checks (`isLoopback`, `isLinkLocal`, `isMulticast`,
     * `isUnspecified`, `isPrivate`, `isCGNAT`, `isBroadcast`) call this first and
     * delegate to the embedded {@link Address4} when present, so a literal such as
     * `::ffff:127.0.0.1` is classified by what it actually reaches (loopback)
     * rather than by its IPv6 wrapper (which `getType()` reports as IPv4-mapped).
     * This matters wherever the checks back a trust-boundary decision (e.g. an
     * SSRF allow/deny filter): without normalization, `::ffff:10.0.0.1`,
     * `::ffff:169.254.169.254`, `64:ff9b::7f00:1`, etc. would all read as
     * non-internal.
     * @returns {Address4 | null}
     */ embeddedIPv4() {
        if (this.isMapped4() || this.isHostInSubnet(NAT64_WELL_KNOWN_SUBNET)) {
            return this.to4();
        }
        return null;
    }
    /**
     * Returns true if the address is a Teredo address, false otherwise
     * @returns {boolean}
     */ isTeredo() {
        return this.isHostInSubnet(TEREDO_SUBNET);
    }
    /**
     * Returns true if the address is a 6to4 address, false otherwise
     * @returns {boolean}
     */ is6to4() {
        return this.isHostInSubnet(SIX_TO_FOUR_SUBNET);
    }
    /**
     * Returns true if the address is a loopback address, false otherwise
     * @returns {boolean}
     */ isLoopback() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isLoopback();
        }
        return this.getType() === 'Loopback';
    }
    /**
     * Returns true if the address is a Unique Local Address in `fc00::/7` ([RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193)). ULAs are the IPv6 equivalent of IPv4 [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private addresses.
     * @returns {boolean}
     */ isULA() {
        return this.isHostInSubnet(ULA_SUBNET);
    }
    /**
     * Returns true if the address is private, i.e. a Unique Local Address in
     * `fc00::/7` ([RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193)) or an
     * IPv4-mapped / NAT64 address whose embedded IPv4 address is in one of the
     * [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private ranges
     * (e.g. `::ffff:10.0.0.1`). This is the IPv6 counterpart to
     * {@link Address4.isPrivate}; use it instead of {@link isULA} when you need to
     * catch mapped RFC 1918 addresses as well as native ULAs.
     * @returns {boolean}
     */ isPrivate() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isPrivate();
        }
        return this.isULA();
    }
    /**
     * Returns true if the address is an IPv4-mapped / NAT64 address whose embedded
     * IPv4 address is in the carrier-grade NAT range `100.64.0.0/10`
     * ([RFC 6598](https://datatracker.ietf.org/doc/html/rfc6598)), false
     * otherwise. There is no native IPv6 CGNAT range, so this only ever returns
     * true for an embedded IPv4 address (e.g. `::ffff:100.64.0.1`).
     * @returns {boolean}
     */ isCGNAT() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isCGNAT();
        }
        return false;
    }
    /**
     * Returns true if the address is an IPv4-mapped / NAT64 address whose embedded
     * IPv4 address is the limited broadcast address `255.255.255.255`
     * ([RFC 919](https://datatracker.ietf.org/doc/html/rfc919)), false otherwise.
     * There is no IPv6 broadcast, so this only ever returns true for an embedded
     * IPv4 address (e.g. `::ffff:255.255.255.255`).
     * @returns {boolean}
     */ isBroadcast() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isBroadcast();
        }
        return false;
    }
    /**
     * Returns true if the address is the unspecified address `::`.
     * @returns {boolean}
     */ isUnspecified() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
            return embedded.isUnspecified();
        }
        return this.getType() === 'Unspecified';
    }
    /**
     * Returns true if the address is in the documentation prefix `2001:db8::/32` ([RFC 3849](https://datatracker.ietf.org/doc/html/rfc3849)).
     * @returns {boolean}
     */ isDocumentation() {
        return this.isHostInSubnet(DOCUMENTATION_SUBNET);
    }
    // #endregion
    // #region HTML
    /**
     * Returns the address as an HTTP URL with the host bracketed, e.g.
     * `http://[2001:db8::1]/`. If `optionalPort` is provided it is appended,
     * e.g. `http://[2001:db8::1]:8080/`.
     */ href(optionalPort) {
        if (optionalPort === undefined) {
            optionalPort = '';
        } else {
            optionalPort = `:${optionalPort}`;
        }
        return `http://[${this.correctForm()}]${optionalPort}/`;
    }
    /**
     * Returns an HTML `<a>` element whose `href` encodes the address in a URL
     * hash fragment (default prefix `/#address=`). Useful for linking between
     * pages of an address-inspector UI.
     * @param options.className - CSS class for the rendered `<a>` element
     * @param options.prefix - hash prefix prepended to the address (default `/#address=`)
     * @param options.v4 - when true, render the address in v4-in-v6 form
     */ link(options) {
        if (!options) {
            options = {};
        }
        if (options.className === undefined) {
            options.className = '';
        }
        if (options.prefix === undefined) {
            options.prefix = '/#address=';
        }
        if (options.v4 === undefined) {
            options.v4 = false;
        }
        let formFunction = this.correctForm;
        if (options.v4) {
            formFunction = this.to4in6;
        }
        const form = formFunction.call(this);
        const safeHref = helpers.escapeHtml(`${options.prefix}${form}`);
        const safeForm = helpers.escapeHtml(form);
        if (options.className) {
            const safeClass = helpers.escapeHtml(options.className);
            return `<a href="${safeHref}" class="${safeClass}">${safeForm}</a>`;
        }
        return `<a href="${safeHref}">${safeForm}</a>`;
    }
    /**
     * Groups an address
     * @returns {String}
     */ group() {
        if (this.elidedGroups === 0) {
            // The simple case
            return helpers.simpleGroup(this.addressMinusSuffix).join(':');
        }
        assert(typeof this.elidedGroups === 'number');
        assert(typeof this.elisionBegin === 'number');
        // The elided case
        const output = [];
        const [left, right] = this.addressMinusSuffix.split('::');
        if (left.length) {
            output.push(...helpers.simpleGroup(left));
        } else {
            output.push('');
        }
        const classes = [
            'hover-group'
        ];
        for(let i = this.elisionBegin; i < this.elisionBegin + this.elidedGroups; i++){
            classes.push(`group-${i}`);
        }
        output.push(`<span class="${classes.join(' ')}"></span>`);
        if (right.length) {
            output.push(...helpers.simpleGroup(right, this.elisionEnd));
        } else {
            output.push('');
        }
        if (this.is4()) {
            assert(this.address4 instanceof ipv4_1.Address4);
            output.pop();
            output.push(this.address4.groupForV6());
        }
        return output.join(':');
    }
    // #endregion
    // #region Regular expressions
    /**
     * Generate a regular expression string that can be used to find or validate
     * all variations of this address
     * @param {boolean} substringSearch
     * @returns {string}
     */ regularExpressionString(substringSearch = false) {
        let output = [];
        // TODO: revisit why this is necessary
        const address6 = new Address6(this.correctForm());
        if (address6.elidedGroups === 0) {
            // The simple case
            output.push((0, regular_expressions_1.simpleRegularExpression)(address6.parsedAddress));
        } else if (address6.elidedGroups === constants6.GROUPS) {
            // A completely elided address
            output.push((0, regular_expressions_1.possibleElisions)(constants6.GROUPS));
        } else {
            // A partially elided address
            const halves = address6.address.split('::');
            if (halves[0].length) {
                output.push((0, regular_expressions_1.simpleRegularExpression)(halves[0].split(':')));
            }
            assert(typeof address6.elidedGroups === 'number');
            output.push((0, regular_expressions_1.possibleElisions)(address6.elidedGroups, halves[0].length !== 0, halves[1].length !== 0));
            if (halves[1].length) {
                output.push((0, regular_expressions_1.simpleRegularExpression)(halves[1].split(':')));
            }
            output = [
                output.join(':')
            ];
        }
        if (!substringSearch) {
            output = [
                '(?=^|',
                regular_expressions_1.ADDRESS_BOUNDARY,
                '|[^\\w\\:])(',
                ...output,
                ')(?=[^\\w\\:]|',
                regular_expressions_1.ADDRESS_BOUNDARY,
                '|$)'
            ];
        }
        return output.join('');
    }
    /**
     * Generate a regular expression that can be used to find or validate all
     * variations of this address.
     * @param {boolean} substringSearch
     * @returns {RegExp}
     */ regularExpression(substringSearch = false) {
        return new RegExp(this.regularExpressionString(substringSearch), 'i');
    }
}
exports.Address6 = Address6;
const TYPE_SUBNETS = Object.keys(constants6.TYPES).map((subnet)=>[
        new Address6(subnet),
        constants6.TYPES[subnet]
    ]);
const TEREDO_SUBNET = new Address6('2001::/32');
const SIX_TO_FOUR_SUBNET = new Address6('2002::/16');
const ULA_SUBNET = new Address6('fc00::/7');
const DOCUMENTATION_SUBNET = new Address6('2001:db8::/32');
const IPV4_MAPPED_SUBNET = new Address6('::ffff:0:0/96');
const NAT64_WELL_KNOWN_SUBNET = new Address6('64:ff9b::/96');
}),
"[project]/node_modules/ip-address/dist/ip-address.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k in mod)if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.v6 = exports.AddressError = exports.Address6 = exports.Address4 = void 0;
var ipv4_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ipv4.js [instrumentation] (ecmascript)");
Object.defineProperty(exports, "Address4", {
    enumerable: true,
    get: function() {
        return ipv4_1.Address4;
    }
});
var ipv6_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/ipv6.js [instrumentation] (ecmascript)");
Object.defineProperty(exports, "Address6", {
    enumerable: true,
    get: function() {
        return ipv6_1.Address6;
    }
});
var address_error_1 = __turbopack_context__.r("[project]/node_modules/ip-address/dist/address-error.js [instrumentation] (ecmascript)");
Object.defineProperty(exports, "AddressError", {
    enumerable: true,
    get: function() {
        return address_error_1.AddressError;
    }
});
const helpers = __importStar(__turbopack_context__.r("[project]/node_modules/ip-address/dist/v6/helpers.js [instrumentation] (ecmascript)"));
exports.v6 = {
    helpers
};
}),
"[project]/node_modules/fetch-socks/index.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.socksConnector = socksConnector;
exports.socksDispatcher = socksDispatcher;
const socks_1 = __turbopack_context__.r("[project]/node_modules/socks/build/index.js [instrumentation] (ecmascript)");
const undici_1 = __turbopack_context__.r("[project]/node_modules/undici/index.js [instrumentation] (ecmascript)");
/**
 * Since socks does not guess HTTP ports, we need to do that.
 *
 * @param protocol Upper layer protocol, "http:" or "https:"
 * @param port A string containing the port number of the URL, maybe empty.
 */ function resolvePort(protocol, port) {
    return port ? Number.parseInt(port) : protocol === "http:" ? 80 : 443;
}
/**
 * Create an Undici connector which establish the connection through socks proxies.
 *
 * If the proxies is an empty array, it will connect directly.
 *
 * @param proxies The proxy server to use or the list of proxy servers to chain.
 * @param tlsOpts TLS upgrade options.
 */ function socksConnector(proxies, tlsOpts = {}) {
    const chain = Array.isArray(proxies) ? proxies : [
        proxies
    ];
    const { timeout = 1e4 } = tlsOpts;
    const undiciConnect = (0, undici_1.buildConnector)(tlsOpts);
    return async (options, callback)=>{
        let { protocol, hostname, port, httpSocket } = options;
        for(let i = 0; i < chain.length; i++){
            const next = chain[i + 1];
            const destination = i === chain.length - 1 ? {
                host: hostname,
                port: resolvePort(protocol, port)
            } : {
                port: next.port,
                host: next.host ?? next.ipaddress
            };
            const socksOpts = {
                command: "connect",
                proxy: chain[i],
                timeout,
                destination,
                existing_socket: httpSocket
            };
            try {
                const r = await socks_1.SocksClient.createConnection(socksOpts);
                httpSocket = r.socket;
            } catch (error) {
                return callback(error, null);
            }
        }
        // httpSocket may not exist when the chain is empty.
        if (httpSocket && protocol !== "https:") {
            return callback(null, httpSocket.setNoDelay());
        }
        /*
         * There are 2 cases here:
         * If httpSocket doesn't exist, let Undici make a connection.
         * If httpSocket exists & protocol is HTTPS, do TLS upgrade.
         */ return undiciConnect({
            ...options,
            httpSocket
        }, callback);
    };
}
/**
 * Create a Undici Agent with socks connector.
 *
 * If the proxies is an empty array, it will connect directly.
 *
 * @param proxies The proxy server to use or the list of proxy servers to chain.
 * @param options Additional options passed to the Agent constructor.
 */ function socksDispatcher(proxies, options = {}) {
    const { connect, ...rest } = options;
    return new undici_1.Agent({
        ...rest,
        connect: socksConnector(proxies, connect)
    });
}
}),
"[externals]/wreq-js [external] (wreq-js, cjs, [project]/node_modules/wreq-js)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("wreq-js-3b69dd5e46bd26d3", () => require("wreq-js-3b69dd5e46bd26d3"));

module.exports = mod;
}),
"[project]/node_modules/buffer-crc32/dist/index.cjs [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}
const CRC_TABLE = new Int32Array([
    0,
    1996959894,
    3993919788,
    2567524794,
    124634137,
    1886057615,
    3915621685,
    2657392035,
    249268274,
    2044508324,
    3772115230,
    2547177864,
    162941995,
    2125561021,
    3887607047,
    2428444049,
    498536548,
    1789927666,
    4089016648,
    2227061214,
    450548861,
    1843258603,
    4107580753,
    2211677639,
    325883990,
    1684777152,
    4251122042,
    2321926636,
    335633487,
    1661365465,
    4195302755,
    2366115317,
    997073096,
    1281953886,
    3579855332,
    2724688242,
    1006888145,
    1258607687,
    3524101629,
    2768942443,
    901097722,
    1119000684,
    3686517206,
    2898065728,
    853044451,
    1172266101,
    3705015759,
    2882616665,
    651767980,
    1373503546,
    3369554304,
    3218104598,
    565507253,
    1454621731,
    3485111705,
    3099436303,
    671266974,
    1594198024,
    3322730930,
    2970347812,
    795835527,
    1483230225,
    3244367275,
    3060149565,
    1994146192,
    31158534,
    2563907772,
    4023717930,
    1907459465,
    112637215,
    2680153253,
    3904427059,
    2013776290,
    251722036,
    2517215374,
    3775830040,
    2137656763,
    141376813,
    2439277719,
    3865271297,
    1802195444,
    476864866,
    2238001368,
    4066508878,
    1812370925,
    453092731,
    2181625025,
    4111451223,
    1706088902,
    314042704,
    2344532202,
    4240017532,
    1658658271,
    366619977,
    2362670323,
    4224994405,
    1303535960,
    984961486,
    2747007092,
    3569037538,
    1256170817,
    1037604311,
    2765210733,
    3554079995,
    1131014506,
    879679996,
    2909243462,
    3663771856,
    1141124467,
    855842277,
    2852801631,
    3708648649,
    1342533948,
    654459306,
    3188396048,
    3373015174,
    1466479909,
    544179635,
    3110523913,
    3462522015,
    1591671054,
    702138776,
    2966460450,
    3352799412,
    1504918807,
    783551873,
    3082640443,
    3233442989,
    3988292384,
    2596254646,
    62317068,
    1957810842,
    3939845945,
    2647816111,
    81470997,
    1943803523,
    3814918930,
    2489596804,
    225274430,
    2053790376,
    3826175755,
    2466906013,
    167816743,
    2097651377,
    4027552580,
    2265490386,
    503444072,
    1762050814,
    4150417245,
    2154129355,
    426522225,
    1852507879,
    4275313526,
    2312317920,
    282753626,
    1742555852,
    4189708143,
    2394877945,
    397917763,
    1622183637,
    3604390888,
    2714866558,
    953729732,
    1340076626,
    3518719985,
    2797360999,
    1068828381,
    1219638859,
    3624741850,
    2936675148,
    906185462,
    1090812512,
    3747672003,
    2825379669,
    829329135,
    1181335161,
    3412177804,
    3160834842,
    628085408,
    1382605366,
    3423369109,
    3138078467,
    570562233,
    1426400815,
    3317316542,
    2998733608,
    733239954,
    1555261956,
    3268935591,
    3050360625,
    752459403,
    1541320221,
    2607071920,
    3965973030,
    1969922972,
    40735498,
    2617837225,
    3943577151,
    1913087877,
    83908371,
    2512341634,
    3803740692,
    2075208622,
    213261112,
    2463272603,
    3855990285,
    2094854071,
    198958881,
    2262029012,
    4057260610,
    1759359992,
    534414190,
    2176718541,
    4139329115,
    1873836001,
    414664567,
    2282248934,
    4279200368,
    1711684554,
    285281116,
    2405801727,
    4167216745,
    1634467795,
    376229701,
    2685067896,
    3608007406,
    1308918612,
    956543938,
    2808555105,
    3495958263,
    1231636301,
    1047427035,
    2932959818,
    3654703836,
    1088359270,
    936918e3,
    2847714899,
    3736837829,
    1202900863,
    817233897,
    3183342108,
    3401237130,
    1404277552,
    615818150,
    3134207493,
    3453421203,
    1423857449,
    601450431,
    3009837614,
    3294710456,
    1567103746,
    711928724,
    3020668471,
    3272380065,
    1510334235,
    755167117
]);
function ensureBuffer(input) {
    if (Buffer.isBuffer(input)) {
        return input;
    }
    if (typeof input === "number") {
        return Buffer.alloc(input);
    } else if (typeof input === "string") {
        return Buffer.from(input);
    } else {
        throw new Error("input must be buffer, number, or string, received " + typeof input);
    }
}
function bufferizeInt(num) {
    const tmp = ensureBuffer(4);
    tmp.writeInt32BE(num, 0);
    return tmp;
}
function _crc32(buf, previous) {
    buf = ensureBuffer(buf);
    if (Buffer.isBuffer(previous)) {
        previous = previous.readUInt32BE(0);
    }
    let crc = ~~previous ^ -1;
    for(var n = 0; n < buf.length; n++){
        crc = CRC_TABLE[(crc ^ buf[n]) & 255] ^ crc >>> 8;
    }
    return crc ^ -1;
}
function crc32() {
    return bufferizeInt(_crc32.apply(null, arguments));
}
crc32.signed = function() {
    return _crc32.apply(null, arguments);
};
crc32.unsigned = function() {
    return _crc32.apply(null, arguments) >>> 0;
};
var bufferCrc32 = crc32;
const index = /*@__PURE__*/ getDefaultExportFromCjs(bufferCrc32);
module.exports = index;
}),
"[project]/node_modules/yazl/index.js [instrumentation] (ecmascript)", ((__turbopack_context__, module, exports) => {

var fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
var Transform = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Transform;
var PassThrough = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").PassThrough;
var zlib = __turbopack_context__.r("[externals]/zlib [external] (zlib, cjs)");
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
var EventEmitter = __turbopack_context__.r("[externals]/events [external] (events, cjs)").EventEmitter;
var errorMonitor = __turbopack_context__.r("[externals]/events [external] (events, cjs)").errorMonitor;
var crc32 = __turbopack_context__.r("[project]/node_modules/buffer-crc32/dist/index.cjs [instrumentation] (ecmascript)");
exports.ZipFile = ZipFile;
exports.dateToDosDateTime = dateToDosDateTime;
util.inherits(ZipFile, EventEmitter);
function ZipFile() {
    this.outputStream = new PassThrough();
    this.entries = [];
    this.outputStreamCursor = 0;
    this.ended = false; // .end() sets this
    this.allDone = false; // set when we've written the last bytes
    this.forceZip64Eocd = false; // configurable in .end()
    this.errored = false;
    this.on(errorMonitor, function() {
        this.errored = true;
    });
}
ZipFile.prototype.addFile = function(realPath, metadataPath, options) {
    var self = this;
    metadataPath = validateMetadataPath(metadataPath, false);
    if (options == null) options = {};
    if (shouldIgnoreAdding(self)) return;
    var entry = new Entry(metadataPath, false, options);
    self.entries.push(entry);
    fs.stat(realPath, function(err, stats) {
        if (err) return self.emit("error", err);
        if (!stats.isFile()) return self.emit("error", new Error("not a file: " + realPath));
        entry.uncompressedSize = stats.size;
        if (options.mtime == null) entry.setLastModDate(stats.mtime);
        if (options.mode == null) entry.setFileAttributesMode(stats.mode);
        entry.setFileDataPumpFunction(function() {
            var readStream = fs.createReadStream(realPath);
            entry.state = Entry.FILE_DATA_IN_PROGRESS;
            readStream.on("error", function(err) {
                self.emit("error", err);
            });
            pumpFileDataReadStream(self, entry, readStream);
        });
        pumpEntries(self);
    });
};
ZipFile.prototype.addReadStream = function(readStream, metadataPath, options) {
    this.addReadStreamLazy(metadataPath, options, function(cb) {
        cb(null, readStream);
    });
};
ZipFile.prototype.addReadStreamLazy = function(metadataPath, options, getReadStreamFunction) {
    var self = this;
    if (typeof options === "function") {
        getReadStreamFunction = options;
        options = null;
    }
    if (options == null) options = {};
    metadataPath = validateMetadataPath(metadataPath, false);
    if (shouldIgnoreAdding(self)) return;
    var entry = new Entry(metadataPath, false, options);
    self.entries.push(entry);
    entry.setFileDataPumpFunction(function() {
        entry.state = Entry.FILE_DATA_IN_PROGRESS;
        getReadStreamFunction(function(err, readStream) {
            if (err) return self.emit("error", err);
            pumpFileDataReadStream(self, entry, readStream);
        });
    });
    pumpEntries(self);
};
ZipFile.prototype.addBuffer = function(buffer, metadataPath, options) {
    var self = this;
    metadataPath = validateMetadataPath(metadataPath, false);
    if (buffer.length > 0x3fffffff) throw new Error("buffer too large: " + buffer.length + " > " + 0x3fffffff);
    if (options == null) options = {};
    if (options.size != null) throw new Error("options.size not allowed");
    if (shouldIgnoreAdding(self)) return;
    var entry = new Entry(metadataPath, false, options);
    entry.uncompressedSize = buffer.length;
    entry.crc32 = crc32.unsigned(buffer);
    entry.crcAndFileSizeKnown = true;
    self.entries.push(entry);
    if (entry.compressionLevel === 0) {
        setCompressedBuffer(buffer);
    } else {
        zlib.deflateRaw(buffer, {
            level: entry.compressionLevel
        }, function(err, compressedBuffer) {
            setCompressedBuffer(compressedBuffer);
        });
    }
    function setCompressedBuffer(compressedBuffer) {
        entry.compressedSize = compressedBuffer.length;
        entry.setFileDataPumpFunction(function() {
            writeToOutputStream(self, compressedBuffer);
            writeToOutputStream(self, entry.getDataDescriptor());
            entry.state = Entry.FILE_DATA_DONE;
            // don't call pumpEntries() recursively.
            // (also, don't call process.nextTick recursively.)
            setImmediate(function() {
                pumpEntries(self);
            });
        });
        pumpEntries(self);
    }
};
ZipFile.prototype.addEmptyDirectory = function(metadataPath, options) {
    var self = this;
    metadataPath = validateMetadataPath(metadataPath, true);
    if (options == null) options = {};
    if (options.size != null) throw new Error("options.size not allowed");
    if (options.compress != null) throw new Error("options.compress not allowed");
    if (options.compressionLevel != null) throw new Error("options.compressionLevel not allowed");
    if (shouldIgnoreAdding(self)) return;
    var entry = new Entry(metadataPath, true, options);
    self.entries.push(entry);
    entry.setFileDataPumpFunction(function() {
        writeToOutputStream(self, entry.getDataDescriptor());
        entry.state = Entry.FILE_DATA_DONE;
        pumpEntries(self);
    });
    pumpEntries(self);
};
var eocdrSignatureBuffer = bufferFrom([
    0x50,
    0x4b,
    0x05,
    0x06
]);
ZipFile.prototype.end = function(options, calculatedTotalSizeCallback) {
    if (typeof options === "function") {
        calculatedTotalSizeCallback = options;
        options = null;
    }
    if (options == null) options = {};
    if (this.ended) return;
    this.ended = true;
    if (this.errored) return;
    this.calculatedTotalSizeCallback = calculatedTotalSizeCallback;
    this.forceZip64Eocd = !!options.forceZip64Format;
    if (options.comment) {
        if (typeof options.comment === "string") {
            this.comment = encodeCp437(options.comment);
        } else {
            // It should be a Buffer
            this.comment = options.comment;
        }
        if (this.comment.length > 0xffff) throw new Error("comment is too large");
        // gotta check for this, because the zipfile format is actually ambiguous.
        if (bufferIncludes(this.comment, eocdrSignatureBuffer)) throw new Error("comment contains end of central directory record signature");
    } else {
        // no comment.
        this.comment = EMPTY_BUFFER;
    }
    pumpEntries(this);
};
function writeToOutputStream(self, buffer) {
    self.outputStream.write(buffer);
    self.outputStreamCursor += buffer.length;
}
function pumpFileDataReadStream(self, entry, readStream) {
    var crc32Watcher = new Crc32Watcher();
    var uncompressedSizeCounter = new ByteCounter();
    var compressor = entry.compressionLevel !== 0 ? new zlib.DeflateRaw({
        level: entry.compressionLevel
    }) : new PassThrough();
    var compressedSizeCounter = new ByteCounter();
    readStream.pipe(crc32Watcher).pipe(uncompressedSizeCounter).pipe(compressor).pipe(compressedSizeCounter).pipe(self.outputStream, {
        end: false
    });
    compressedSizeCounter.on("end", function() {
        entry.crc32 = crc32Watcher.crc32;
        if (entry.uncompressedSize == null) {
            entry.uncompressedSize = uncompressedSizeCounter.byteCount;
        } else {
            if (entry.uncompressedSize !== uncompressedSizeCounter.byteCount) return self.emit("error", new Error("file data stream has unexpected number of bytes"));
        }
        entry.compressedSize = compressedSizeCounter.byteCount;
        self.outputStreamCursor += entry.compressedSize;
        writeToOutputStream(self, entry.getDataDescriptor());
        entry.state = Entry.FILE_DATA_DONE;
        pumpEntries(self);
    });
}
function determineCompressionLevel(options) {
    if (options.compress != null && options.compressionLevel != null) {
        if (!!options.compress !== !!options.compressionLevel) throw new Error("conflicting settings for compress and compressionLevel");
    }
    if (options.compressionLevel != null) return options.compressionLevel;
    if (options.compress === false) return 0;
    return 6;
}
function pumpEntries(self) {
    if (self.allDone || self.errored) return;
    // first check if calculatedTotalSize is finally known
    if (self.ended && self.calculatedTotalSizeCallback != null) {
        var calculatedTotalSize = calculateTotalSize(self);
        if (calculatedTotalSize != null) {
            // we have an answer
            self.calculatedTotalSizeCallback(calculatedTotalSize);
            self.calculatedTotalSizeCallback = null;
        }
    }
    // pump entries
    var entry = getFirstNotDoneEntry();
    function getFirstNotDoneEntry() {
        for(var i = 0; i < self.entries.length; i++){
            var entry = self.entries[i];
            if (entry.state < Entry.FILE_DATA_DONE) return entry;
        }
        return null;
    }
    if (entry != null) {
        // this entry is not done yet
        if (entry.state < Entry.READY_TO_PUMP_FILE_DATA) return; // input file not open yet
        if (entry.state === Entry.FILE_DATA_IN_PROGRESS) return; // we'll get there
        // start with local file header
        entry.relativeOffsetOfLocalHeader = self.outputStreamCursor;
        var localFileHeader = entry.getLocalFileHeader();
        writeToOutputStream(self, localFileHeader);
        entry.doFileDataPump();
    } else {
        // all cought up on writing entries
        if (self.ended) {
            // head for the exit
            self.offsetOfStartOfCentralDirectory = self.outputStreamCursor;
            self.entries.forEach(function(entry) {
                var centralDirectoryRecord = entry.getCentralDirectoryRecord();
                writeToOutputStream(self, centralDirectoryRecord);
            });
            writeToOutputStream(self, getEndOfCentralDirectoryRecord(self));
            self.outputStream.end();
            self.allDone = true;
        }
    }
}
function calculateTotalSize(self) {
    var pretendOutputCursor = 0;
    var centralDirectorySize = 0;
    for(var i = 0; i < self.entries.length; i++){
        var entry = self.entries[i];
        // compression is too hard to predict
        if (entry.compressionLevel !== 0) return -1;
        if (entry.state >= Entry.READY_TO_PUMP_FILE_DATA) {
            // if addReadStream was called without providing the size, we can't predict the total size
            if (entry.uncompressedSize == null) return -1;
        } else {
            // if we're still waiting for fs.stat, we might learn the size someday
            if (entry.uncompressedSize == null) return null;
        }
        // we know this for sure, and this is important to know if we need ZIP64 format.
        entry.relativeOffsetOfLocalHeader = pretendOutputCursor;
        var useZip64Format = entry.useZip64Format();
        pretendOutputCursor += LOCAL_FILE_HEADER_FIXED_SIZE + entry.utf8FileName.length;
        pretendOutputCursor += entry.uncompressedSize;
        if (!entry.crcAndFileSizeKnown) {
            // use a data descriptor
            if (useZip64Format) {
                pretendOutputCursor += ZIP64_DATA_DESCRIPTOR_SIZE;
            } else {
                pretendOutputCursor += DATA_DESCRIPTOR_SIZE;
            }
        }
        centralDirectorySize += CENTRAL_DIRECTORY_RECORD_FIXED_SIZE + entry.utf8FileName.length + entry.fileComment.length;
        if (!entry.forceDosTimestamp) {
            centralDirectorySize += INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE;
        }
        if (useZip64Format) {
            centralDirectorySize += ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE;
        }
    }
    var endOfCentralDirectorySize = 0;
    if (self.forceZip64Eocd || self.entries.length >= 0xffff || centralDirectorySize >= 0xffff || pretendOutputCursor >= 0xffffffff) {
        // use zip64 end of central directory stuff
        endOfCentralDirectorySize += ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE;
    }
    endOfCentralDirectorySize += END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + self.comment.length;
    return pretendOutputCursor + centralDirectorySize + endOfCentralDirectorySize;
}
function shouldIgnoreAdding(self) {
    if (self.ended) throw new Error("cannot add entries after calling end()");
    if (self.errored) return true;
    return false;
}
var ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE = 56;
var ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE = 20;
var END_OF_CENTRAL_DIRECTORY_RECORD_SIZE = 22;
function getEndOfCentralDirectoryRecord(self, actuallyJustTellMeHowLongItWouldBe) {
    var needZip64Format = false;
    var normalEntriesLength = self.entries.length;
    if (self.forceZip64Eocd || self.entries.length >= 0xffff) {
        normalEntriesLength = 0xffff;
        needZip64Format = true;
    }
    var sizeOfCentralDirectory = self.outputStreamCursor - self.offsetOfStartOfCentralDirectory;
    var normalSizeOfCentralDirectory = sizeOfCentralDirectory;
    if (self.forceZip64Eocd || sizeOfCentralDirectory >= 0xffffffff) {
        normalSizeOfCentralDirectory = 0xffffffff;
        needZip64Format = true;
    }
    var normalOffsetOfStartOfCentralDirectory = self.offsetOfStartOfCentralDirectory;
    if (self.forceZip64Eocd || self.offsetOfStartOfCentralDirectory >= 0xffffffff) {
        normalOffsetOfStartOfCentralDirectory = 0xffffffff;
        needZip64Format = true;
    }
    if (actuallyJustTellMeHowLongItWouldBe) {
        if (needZip64Format) {
            return ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE + END_OF_CENTRAL_DIRECTORY_RECORD_SIZE;
        } else {
            return END_OF_CENTRAL_DIRECTORY_RECORD_SIZE;
        }
    }
    var eocdrBuffer = bufferAlloc(END_OF_CENTRAL_DIRECTORY_RECORD_SIZE + self.comment.length);
    // end of central dir signature                       4 bytes  (0x06054b50)
    eocdrBuffer.writeUInt32LE(0x06054b50, 0);
    // number of this disk                                2 bytes
    eocdrBuffer.writeUInt16LE(0, 4);
    // number of the disk with the start of the central directory  2 bytes
    eocdrBuffer.writeUInt16LE(0, 6);
    // total number of entries in the central directory on this disk  2 bytes
    eocdrBuffer.writeUInt16LE(normalEntriesLength, 8);
    // total number of entries in the central directory   2 bytes
    eocdrBuffer.writeUInt16LE(normalEntriesLength, 10);
    // size of the central directory                      4 bytes
    eocdrBuffer.writeUInt32LE(normalSizeOfCentralDirectory, 12);
    // offset of start of central directory with respect to the starting disk number  4 bytes
    eocdrBuffer.writeUInt32LE(normalOffsetOfStartOfCentralDirectory, 16);
    // .ZIP file comment length                           2 bytes
    eocdrBuffer.writeUInt16LE(self.comment.length, 20);
    // .ZIP file comment                                  (variable size)
    self.comment.copy(eocdrBuffer, 22);
    if (!needZip64Format) return eocdrBuffer;
    // ZIP64 format
    // ZIP64 End of Central Directory Record
    var zip64EocdrBuffer = bufferAlloc(ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE);
    // zip64 end of central dir signature                                             4 bytes  (0x06064b50)
    zip64EocdrBuffer.writeUInt32LE(0x06064b50, 0);
    // size of zip64 end of central directory record                                  8 bytes
    writeUInt64LE(zip64EocdrBuffer, ZIP64_END_OF_CENTRAL_DIRECTORY_RECORD_SIZE - 12, 4);
    // version made by                                                                2 bytes
    zip64EocdrBuffer.writeUInt16LE(VERSION_MADE_BY, 12);
    // version needed to extract                                                      2 bytes
    zip64EocdrBuffer.writeUInt16LE(VERSION_NEEDED_TO_EXTRACT_ZIP64, 14);
    // number of this disk                                                            4 bytes
    zip64EocdrBuffer.writeUInt32LE(0, 16);
    // number of the disk with the start of the central directory                     4 bytes
    zip64EocdrBuffer.writeUInt32LE(0, 20);
    // total number of entries in the central directory on this disk                  8 bytes
    writeUInt64LE(zip64EocdrBuffer, self.entries.length, 24);
    // total number of entries in the central directory                               8 bytes
    writeUInt64LE(zip64EocdrBuffer, self.entries.length, 32);
    // size of the central directory                                                  8 bytes
    writeUInt64LE(zip64EocdrBuffer, sizeOfCentralDirectory, 40);
    // offset of start of central directory with respect to the starting disk number  8 bytes
    writeUInt64LE(zip64EocdrBuffer, self.offsetOfStartOfCentralDirectory, 48);
    // zip64 extensible data sector                                                   (variable size)
    // nothing in the zip64 extensible data sector
    // ZIP64 End of Central Directory Locator
    var zip64EocdlBuffer = bufferAlloc(ZIP64_END_OF_CENTRAL_DIRECTORY_LOCATOR_SIZE);
    // zip64 end of central dir locator signature                               4 bytes  (0x07064b50)
    zip64EocdlBuffer.writeUInt32LE(0x07064b50, 0);
    // number of the disk with the start of the zip64 end of central directory  4 bytes
    zip64EocdlBuffer.writeUInt32LE(0, 4);
    // relative offset of the zip64 end of central directory record             8 bytes
    writeUInt64LE(zip64EocdlBuffer, self.outputStreamCursor, 8);
    // total number of disks                                                    4 bytes
    zip64EocdlBuffer.writeUInt32LE(1, 16);
    return Buffer.concat([
        zip64EocdrBuffer,
        zip64EocdlBuffer,
        eocdrBuffer
    ]);
}
function validateMetadataPath(metadataPath, isDirectory) {
    if (metadataPath === "") throw new Error("empty metadataPath");
    metadataPath = metadataPath.replace(/\\/g, "/");
    if (/^[a-zA-Z]:/.test(metadataPath) || /^\//.test(metadataPath)) throw new Error("absolute path: " + metadataPath);
    if (metadataPath.split("/").indexOf("..") !== -1) throw new Error("invalid relative path: " + metadataPath);
    var looksLikeDirectory = /\/$/.test(metadataPath);
    if (isDirectory) {
        // append a trailing '/' if necessary.
        if (!looksLikeDirectory) metadataPath += "/";
    } else {
        if (looksLikeDirectory) throw new Error("file path cannot end with '/': " + metadataPath);
    }
    return metadataPath;
}
var EMPTY_BUFFER = bufferAlloc(0);
// this class is not part of the public API
function Entry(metadataPath, isDirectory, options) {
    this.utf8FileName = bufferFrom(metadataPath);
    if (this.utf8FileName.length > 0xffff) throw new Error("utf8 file name too long. " + utf8FileName.length + " > " + 0xffff);
    this.isDirectory = isDirectory;
    this.state = Entry.WAITING_FOR_METADATA;
    this.setLastModDate(options.mtime != null ? options.mtime : new Date());
    this.forceDosTimestamp = !!options.forceDosTimestamp;
    if (options.mode != null) {
        this.setFileAttributesMode(options.mode);
    } else {
        this.setFileAttributesMode(isDirectory ? 0o40775 : 0o100664);
    }
    if (isDirectory) {
        this.crcAndFileSizeKnown = true;
        this.crc32 = 0;
        this.uncompressedSize = 0;
        this.compressedSize = 0;
    } else {
        // unknown so far
        this.crcAndFileSizeKnown = false;
        this.crc32 = null;
        this.uncompressedSize = null;
        this.compressedSize = null;
        if (options.size != null) this.uncompressedSize = options.size;
    }
    if (isDirectory) {
        this.compressionLevel = 0;
    } else {
        this.compressionLevel = determineCompressionLevel(options);
    }
    this.forceZip64Format = !!options.forceZip64Format;
    if (options.fileComment) {
        if (typeof options.fileComment === "string") {
            this.fileComment = bufferFrom(options.fileComment, "utf-8");
        } else {
            // It should be a Buffer
            this.fileComment = options.fileComment;
        }
        if (this.fileComment.length > 0xffff) throw new Error("fileComment is too large");
    } else {
        // no comment.
        this.fileComment = EMPTY_BUFFER;
    }
}
Entry.WAITING_FOR_METADATA = 0;
Entry.READY_TO_PUMP_FILE_DATA = 1;
Entry.FILE_DATA_IN_PROGRESS = 2;
Entry.FILE_DATA_DONE = 3;
Entry.prototype.setLastModDate = function(date) {
    this.mtime = date;
    var dosDateTime = dateToDosDateTime(date);
    this.lastModFileTime = dosDateTime.time;
    this.lastModFileDate = dosDateTime.date;
};
Entry.prototype.setFileAttributesMode = function(mode) {
    if ((mode & 0xffff) !== mode) throw new Error("invalid mode. expected: 0 <= " + mode + " <= " + 0xffff);
    // http://unix.stackexchange.com/questions/14705/the-zip-formats-external-file-attribute/14727#14727
    this.externalFileAttributes = mode << 16 >>> 0;
};
// doFileDataPump() should not call pumpEntries() directly. see issue #9.
Entry.prototype.setFileDataPumpFunction = function(doFileDataPump) {
    this.doFileDataPump = doFileDataPump;
    this.state = Entry.READY_TO_PUMP_FILE_DATA;
};
Entry.prototype.useZip64Format = function() {
    return this.forceZip64Format || this.uncompressedSize != null && this.uncompressedSize > 0xfffffffe || this.compressedSize != null && this.compressedSize > 0xfffffffe || this.relativeOffsetOfLocalHeader != null && this.relativeOffsetOfLocalHeader > 0xfffffffe;
};
var LOCAL_FILE_HEADER_FIXED_SIZE = 30;
var VERSION_NEEDED_TO_EXTRACT_UTF8 = 20;
var VERSION_NEEDED_TO_EXTRACT_ZIP64 = 45;
// 3 = unix. 63 = spec version 6.3
var VERSION_MADE_BY = 3 << 8 | 63;
var FILE_NAME_IS_UTF8 = 1 << 11;
var UNKNOWN_CRC32_AND_FILE_SIZES = 1 << 3;
Entry.prototype.getLocalFileHeader = function() {
    var crc32 = 0;
    var compressedSize = 0;
    var uncompressedSize = 0;
    if (this.crcAndFileSizeKnown) {
        crc32 = this.crc32;
        compressedSize = this.compressedSize;
        uncompressedSize = this.uncompressedSize;
    }
    var fixedSizeStuff = bufferAlloc(LOCAL_FILE_HEADER_FIXED_SIZE);
    var generalPurposeBitFlag = FILE_NAME_IS_UTF8;
    if (!this.crcAndFileSizeKnown) generalPurposeBitFlag |= UNKNOWN_CRC32_AND_FILE_SIZES;
    // local file header signature     4 bytes  (0x04034b50)
    fixedSizeStuff.writeUInt32LE(0x04034b50, 0);
    // version needed to extract       2 bytes
    fixedSizeStuff.writeUInt16LE(VERSION_NEEDED_TO_EXTRACT_UTF8, 4);
    // general purpose bit flag        2 bytes
    fixedSizeStuff.writeUInt16LE(generalPurposeBitFlag, 6);
    // compression method              2 bytes
    fixedSizeStuff.writeUInt16LE(this.getCompressionMethod(), 8);
    // last mod file time              2 bytes
    fixedSizeStuff.writeUInt16LE(this.lastModFileTime, 10);
    // last mod file date              2 bytes
    fixedSizeStuff.writeUInt16LE(this.lastModFileDate, 12);
    // crc-32                          4 bytes
    fixedSizeStuff.writeUInt32LE(crc32, 14);
    // compressed size                 4 bytes
    fixedSizeStuff.writeUInt32LE(compressedSize, 18);
    // uncompressed size               4 bytes
    fixedSizeStuff.writeUInt32LE(uncompressedSize, 22);
    // file name length                2 bytes
    fixedSizeStuff.writeUInt16LE(this.utf8FileName.length, 26);
    // extra field length              2 bytes
    fixedSizeStuff.writeUInt16LE(0, 28);
    return Buffer.concat([
        fixedSizeStuff,
        // file name (variable size)
        this.utf8FileName
    ]);
};
var DATA_DESCRIPTOR_SIZE = 16;
var ZIP64_DATA_DESCRIPTOR_SIZE = 24;
Entry.prototype.getDataDescriptor = function() {
    if (this.crcAndFileSizeKnown) {
        // the Mac Archive Utility requires this not be present unless we set general purpose bit 3
        return EMPTY_BUFFER;
    }
    if (!this.useZip64Format()) {
        var buffer = bufferAlloc(DATA_DESCRIPTOR_SIZE);
        // optional signature (required according to Archive Utility)
        buffer.writeUInt32LE(0x08074b50, 0);
        // crc-32                          4 bytes
        buffer.writeUInt32LE(this.crc32, 4);
        // compressed size                 4 bytes
        buffer.writeUInt32LE(this.compressedSize, 8);
        // uncompressed size               4 bytes
        buffer.writeUInt32LE(this.uncompressedSize, 12);
        return buffer;
    } else {
        // ZIP64 format
        var buffer = bufferAlloc(ZIP64_DATA_DESCRIPTOR_SIZE);
        // optional signature (unknown if anyone cares about this)
        buffer.writeUInt32LE(0x08074b50, 0);
        // crc-32                          4 bytes
        buffer.writeUInt32LE(this.crc32, 4);
        // compressed size                 8 bytes
        writeUInt64LE(buffer, this.compressedSize, 8);
        // uncompressed size               8 bytes
        writeUInt64LE(buffer, this.uncompressedSize, 16);
        return buffer;
    }
};
var CENTRAL_DIRECTORY_RECORD_FIXED_SIZE = 46;
var INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE = 9;
var ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE = 28;
Entry.prototype.getCentralDirectoryRecord = function() {
    var fixedSizeStuff = bufferAlloc(CENTRAL_DIRECTORY_RECORD_FIXED_SIZE);
    var generalPurposeBitFlag = FILE_NAME_IS_UTF8;
    if (!this.crcAndFileSizeKnown) generalPurposeBitFlag |= UNKNOWN_CRC32_AND_FILE_SIZES;
    var izutefBuffer = EMPTY_BUFFER;
    if (!this.forceDosTimestamp) {
        // Here is one specification for this: https://commons.apache.org/proper/commons-compress/apidocs/org/apache/commons/compress/archivers/zip/X5455_ExtendedTimestamp.html
        // See also the Info-ZIP source code unix/unix.c:set_extra_field() and zipfile.c:ef_scan_ut_time().
        izutefBuffer = bufferAlloc(INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE);
        // 0x5455        Short       tag for this extra block type ("UT")
        izutefBuffer.writeUInt16LE(0x5455, 0);
        // TSize         Short       total data size for this block
        izutefBuffer.writeUInt16LE(INFO_ZIP_UNIVERSAL_TIMESTAMP_EXTRA_FIELD_SIZE - 4, 2);
        // See Info-ZIP source code zip.h for these constant values:
        var EB_UT_FL_MTIME = 1 << 0;
        var EB_UT_FL_ATIME = 1 << 1;
        // Note that we set the atime flag despite not providing the atime field.
        // The central directory version of this extra field is specified to never contain the atime field even when the flag is set.
        // We set it to match the Info-ZIP behavior in order to minimize incompatibility with zip file readers that may have rigid input expectations.
        // Flags         Byte        info bits
        izutefBuffer.writeUInt8(EB_UT_FL_MTIME | EB_UT_FL_ATIME, 4);
        // (ModTime)     Long        time of last modification (UTC/GMT)
        var timestamp = Math.floor(this.mtime.getTime() / 1000);
        if (timestamp < -0x80000000) timestamp = -0x80000000; // 1901-12-13T20:45:52.000Z
        if (timestamp > 0x7fffffff) timestamp = 0x7fffffff; // 2038-01-19T03:14:07.000Z
        izutefBuffer.writeUInt32LE(timestamp, 5);
    }
    var normalCompressedSize = this.compressedSize;
    var normalUncompressedSize = this.uncompressedSize;
    var normalRelativeOffsetOfLocalHeader = this.relativeOffsetOfLocalHeader;
    var versionNeededToExtract = VERSION_NEEDED_TO_EXTRACT_UTF8;
    var zeiefBuffer = EMPTY_BUFFER;
    if (this.useZip64Format()) {
        normalCompressedSize = 0xffffffff;
        normalUncompressedSize = 0xffffffff;
        normalRelativeOffsetOfLocalHeader = 0xffffffff;
        versionNeededToExtract = VERSION_NEEDED_TO_EXTRACT_ZIP64;
        // ZIP64 extended information extra field
        zeiefBuffer = bufferAlloc(ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE);
        // 0x0001                  2 bytes    Tag for this "extra" block type
        zeiefBuffer.writeUInt16LE(0x0001, 0);
        // Size                    2 bytes    Size of this "extra" block
        zeiefBuffer.writeUInt16LE(ZIP64_EXTENDED_INFORMATION_EXTRA_FIELD_SIZE - 4, 2);
        // Original Size           8 bytes    Original uncompressed file size
        writeUInt64LE(zeiefBuffer, this.uncompressedSize, 4);
        // Compressed Size         8 bytes    Size of compressed data
        writeUInt64LE(zeiefBuffer, this.compressedSize, 12);
        // Relative Header Offset  8 bytes    Offset of local header record
        writeUInt64LE(zeiefBuffer, this.relativeOffsetOfLocalHeader, 20);
    // Disk Start Number       4 bytes    Number of the disk on which this file starts
    // (omit)
    }
    // central file header signature   4 bytes  (0x02014b50)
    fixedSizeStuff.writeUInt32LE(0x02014b50, 0);
    // version made by                 2 bytes
    fixedSizeStuff.writeUInt16LE(VERSION_MADE_BY, 4);
    // version needed to extract       2 bytes
    fixedSizeStuff.writeUInt16LE(versionNeededToExtract, 6);
    // general purpose bit flag        2 bytes
    fixedSizeStuff.writeUInt16LE(generalPurposeBitFlag, 8);
    // compression method              2 bytes
    fixedSizeStuff.writeUInt16LE(this.getCompressionMethod(), 10);
    // last mod file time              2 bytes
    fixedSizeStuff.writeUInt16LE(this.lastModFileTime, 12);
    // last mod file date              2 bytes
    fixedSizeStuff.writeUInt16LE(this.lastModFileDate, 14);
    // crc-32                          4 bytes
    fixedSizeStuff.writeUInt32LE(this.crc32, 16);
    // compressed size                 4 bytes
    fixedSizeStuff.writeUInt32LE(normalCompressedSize, 20);
    // uncompressed size               4 bytes
    fixedSizeStuff.writeUInt32LE(normalUncompressedSize, 24);
    // file name length                2 bytes
    fixedSizeStuff.writeUInt16LE(this.utf8FileName.length, 28);
    // extra field length              2 bytes
    fixedSizeStuff.writeUInt16LE(izutefBuffer.length + zeiefBuffer.length, 30);
    // file comment length             2 bytes
    fixedSizeStuff.writeUInt16LE(this.fileComment.length, 32);
    // disk number start               2 bytes
    fixedSizeStuff.writeUInt16LE(0, 34);
    // internal file attributes        2 bytes
    fixedSizeStuff.writeUInt16LE(0, 36);
    // external file attributes        4 bytes
    fixedSizeStuff.writeUInt32LE(this.externalFileAttributes, 38);
    // relative offset of local header 4 bytes
    fixedSizeStuff.writeUInt32LE(normalRelativeOffsetOfLocalHeader, 42);
    return Buffer.concat([
        fixedSizeStuff,
        // file name (variable size)
        this.utf8FileName,
        // extra field (variable size)
        izutefBuffer,
        zeiefBuffer,
        // file comment (variable size)
        this.fileComment
    ]);
};
Entry.prototype.getCompressionMethod = function() {
    var NO_COMPRESSION = 0;
    var DEFLATE_COMPRESSION = 8;
    return this.compressionLevel === 0 ? NO_COMPRESSION : DEFLATE_COMPRESSION;
};
// These are intentionally computed in the current system timezone
// to match how the DOS encoding operates in this library.
var minDosDate = new Date(1980, 0, 1);
var maxDosDate = new Date(2107, 11, 31, 23, 59, 58);
function dateToDosDateTime(jsDate) {
    // Clamp out of bounds timestamps.
    if (jsDate < minDosDate) jsDate = minDosDate;
    else if (jsDate > maxDosDate) jsDate = maxDosDate;
    var date = 0;
    date |= jsDate.getDate() & 0x1f; // 1-31
    date |= (jsDate.getMonth() + 1 & 0xf) << 5; // 0-11, 1-12
    date |= (jsDate.getFullYear() - 1980 & 0x7f) << 9; // 0-128, 1980-2108
    var time = 0;
    time |= Math.floor(jsDate.getSeconds() / 2); // 0-59, 0-29 (lose odd numbers)
    time |= (jsDate.getMinutes() & 0x3f) << 5; // 0-59
    time |= (jsDate.getHours() & 0x1f) << 11; // 0-23
    return {
        date: date,
        time: time
    };
}
function writeUInt64LE(buffer, n, offset) {
    // can't use bitshift here, because JavaScript only allows bitshifting on 32-bit integers.
    var high = Math.floor(n / 0x100000000);
    var low = n % 0x100000000;
    buffer.writeUInt32LE(low, offset);
    buffer.writeUInt32LE(high, offset + 4);
}
function defaultCallback(err) {
    if (err) throw err;
}
util.inherits(ByteCounter, Transform);
function ByteCounter(options) {
    Transform.call(this, options);
    this.byteCount = 0;
}
ByteCounter.prototype._transform = function(chunk, encoding, cb) {
    this.byteCount += chunk.length;
    cb(null, chunk);
};
util.inherits(Crc32Watcher, Transform);
function Crc32Watcher(options) {
    Transform.call(this, options);
    this.crc32 = 0;
}
Crc32Watcher.prototype._transform = function(chunk, encoding, cb) {
    this.crc32 = crc32.unsigned(chunk, this.crc32);
    cb(null, chunk);
};
var cp437 = '\u0000☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
if (cp437.length !== 256) throw new Error("assertion failure");
var reverseCp437 = null;
function encodeCp437(string) {
    if (/^[\x20-\x7e]*$/.test(string)) {
        // CP437, ASCII, and UTF-8 overlap in this range.
        return bufferFrom(string, "utf-8");
    }
    // This is the slow path.
    if (reverseCp437 == null) {
        // cache this once
        reverseCp437 = {};
        for(var i = 0; i < cp437.length; i++){
            reverseCp437[cp437[i]] = i;
        }
    }
    var result = bufferAlloc(string.length);
    for(var i = 0; i < string.length; i++){
        var b = reverseCp437[string[i]];
        if (b == null) throw new Error("character not encodable in CP437: " + JSON.stringify(string[i]));
        result[i] = b;
    }
    return result;
}
function bufferAlloc(size) {
    bufferAlloc = modern;
    try {
        return bufferAlloc(size);
    } catch (e) {
        bufferAlloc = legacy;
        return bufferAlloc(size);
    }
    function modern(size) {
        return Buffer.allocUnsafe(size);
    }
    function legacy(size) {
        return new Buffer(size);
    }
}
function bufferFrom(something, encoding) {
    bufferFrom = modern;
    try {
        return bufferFrom(something, encoding);
    } catch (e) {
        bufferFrom = legacy;
        return bufferFrom(something, encoding);
    }
    function modern(something, encoding) {
        return Buffer.from(something, encoding);
    }
    function legacy(something, encoding) {
        return new Buffer(something, encoding);
    }
}
function bufferIncludes(buffer, content) {
    bufferIncludes = modern;
    try {
        return bufferIncludes(buffer, content);
    } catch (e) {
        bufferIncludes = legacy;
        return bufferIncludes(buffer, content);
    }
    function modern(buffer, content) {
        return buffer.includes(content);
    }
    function legacy(buffer, content) {
        for(var i = 0; i <= buffer.length - content.length; i++){
            for(var j = 0;; j++){
                if (j === content.length) return true;
                if (buffer[i + j] !== content[j]) break;
            }
        }
        return false;
    }
}
}),
"[externals]/pino [external] (pino, cjs, [project]/node_modules/pino)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pino-28069d5257187539", () => require("pino-28069d5257187539"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0byz-18._.js.map
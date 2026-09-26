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
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/EndpointParameters.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "commonParams",
    ()=>commonParams,
    "resolveClientEndpointParameters",
    ()=>resolveClientEndpointParameters
]);
const resolveClientEndpointParameters = (options)=>{
    return Object.assign(options, {
        useDualstackEndpoint: options.useDualstackEndpoint ?? false,
        useFipsEndpoint: options.useFipsEndpoint ?? false,
        defaultSigningName: "awsssoportal"
    });
};
const commonParams = {
    UseFIPS: {
        type: "builtInParams",
        name: "useFipsEndpoint"
    },
    Endpoint: {
        type: "builtInParams",
        name: "endpoint"
    },
    Region: {
        type: "builtInParams",
        name: "region"
    },
    UseDualStack: {
        type: "builtInParams",
        name: "useDualstackEndpoint"
    }
};
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/commandBuilder.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "_ep0",
    ()=>_ep0,
    "_mw0",
    ()=>_mw0,
    "command",
    ()=>command
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$client$2d$command$2d$builder$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client-command-builder.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/endpoints/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$endpoint$2f$EndpointParameters$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/EndpointParameters.js [app-route] (ecmascript)");
;
;
;
const command = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$client$2d$command$2d$builder$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["makeBuilder"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$endpoint$2f$EndpointParameters$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["commonParams"], "SWBPortalService", "SSOClient", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getEndpointPlugin"]);
const _ep0 = {};
const _mw0 = (Command, cs, config, o)=>[];
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/models/SSOServiceException.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SSOServiceException",
    ()=>SSOServiceException
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$exceptions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/exceptions.js [app-route] (ecmascript)");
;
;
class SSOServiceException extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$exceptions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ServiceException"] {
    constructor(options){
        super(options);
        Object.setPrototypeOf(this, SSOServiceException.prototype);
    }
}
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/models/errors.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InvalidRequestException",
    ()=>InvalidRequestException,
    "ResourceNotFoundException",
    ()=>ResourceNotFoundException,
    "TooManyRequestsException",
    ()=>TooManyRequestsException,
    "UnauthorizedException",
    ()=>UnauthorizedException
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$SSOServiceException$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/models/SSOServiceException.js [app-route] (ecmascript) <locals>");
;
class InvalidRequestException extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$SSOServiceException$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SSOServiceException"] {
    name = "InvalidRequestException";
    $fault = "client";
    constructor(opts){
        super({
            name: "InvalidRequestException",
            $fault: "client",
            ...opts
        });
        Object.setPrototypeOf(this, InvalidRequestException.prototype);
    }
}
class ResourceNotFoundException extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$SSOServiceException$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SSOServiceException"] {
    name = "ResourceNotFoundException";
    $fault = "client";
    constructor(opts){
        super({
            name: "ResourceNotFoundException",
            $fault: "client",
            ...opts
        });
        Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
    }
}
class TooManyRequestsException extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$SSOServiceException$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SSOServiceException"] {
    name = "TooManyRequestsException";
    $fault = "client";
    constructor(opts){
        super({
            name: "TooManyRequestsException",
            $fault: "client",
            ...opts
        });
        Object.setPrototypeOf(this, TooManyRequestsException.prototype);
    }
}
class UnauthorizedException extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$SSOServiceException$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SSOServiceException"] {
    name = "UnauthorizedException";
    $fault = "client";
    constructor(opts){
        super({
            name: "UnauthorizedException",
            $fault: "client",
            ...opts
        });
        Object.setPrototypeOf(this, UnauthorizedException.prototype);
    }
}
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/schemas/schemas_0.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GetRoleCredentials$",
    ()=>GetRoleCredentials$,
    "GetRoleCredentialsRequest$",
    ()=>GetRoleCredentialsRequest$,
    "GetRoleCredentialsResponse$",
    ()=>GetRoleCredentialsResponse$,
    "InvalidRequestException$",
    ()=>InvalidRequestException$,
    "ResourceNotFoundException$",
    ()=>ResourceNotFoundException$,
    "RoleCredentials$",
    ()=>RoleCredentials$,
    "SSOServiceException$",
    ()=>SSOServiceException$,
    "TooManyRequestsException$",
    ()=>TooManyRequestsException$,
    "UnauthorizedException$",
    ()=>UnauthorizedException$,
    "errorTypeRegistries",
    ()=>errorTypeRegistries
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$schema$2f$TypeRegistry$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/schema/TypeRegistry.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/models/errors.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$SSOServiceException$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/models/SSOServiceException.js [app-route] (ecmascript) <locals>");
const _ATT = "AccessTokenType";
const _GRC = "GetRoleCredentials";
const _GRCR = "GetRoleCredentialsRequest";
const _GRCRe = "GetRoleCredentialsResponse";
const _IRE = "InvalidRequestException";
const _RC = "RoleCredentials";
const _RNFE = "ResourceNotFoundException";
const _SAKT = "SecretAccessKeyType";
const _STT = "SessionTokenType";
const _TMRE = "TooManyRequestsException";
const _UE = "UnauthorizedException";
const _aI = "accountId";
const _aKI = "accessKeyId";
const _aT = "accessToken";
const _ai = "account_id";
const _c = "client";
const _e = "error";
const _ex = "expiration";
const _h = "http";
const _hE = "httpError";
const _hH = "httpHeader";
const _hQ = "httpQuery";
const _m = "message";
const _rC = "roleCredentials";
const _rN = "roleName";
const _rn = "role_name";
const _s = "smithy.ts.sdk.synthetic.com.amazonaws.sso";
const _sAK = "secretAccessKey";
const _sT = "sessionToken";
const _xasbt = "x-amz-sso_bearer_token";
const n0 = "com.amazonaws.sso";
;
;
;
const _s_registry = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$schema$2f$TypeRegistry$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TypeRegistry"].for(_s);
var SSOServiceException$ = [
    -3,
    _s,
    "SSOServiceException",
    0,
    [],
    []
];
_s_registry.registerError(SSOServiceException$, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$SSOServiceException$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SSOServiceException"]);
const n0_registry = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$schema$2f$TypeRegistry$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TypeRegistry"].for(n0);
var InvalidRequestException$ = [
    -3,
    n0,
    _IRE,
    {
        [_e]: _c,
        [_hE]: 400
    },
    [
        _m
    ],
    [
        0
    ]
];
n0_registry.registerError(InvalidRequestException$, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["InvalidRequestException"]);
var ResourceNotFoundException$ = [
    -3,
    n0,
    _RNFE,
    {
        [_e]: _c,
        [_hE]: 404
    },
    [
        _m
    ],
    [
        0
    ]
];
n0_registry.registerError(ResourceNotFoundException$, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ResourceNotFoundException"]);
var TooManyRequestsException$ = [
    -3,
    n0,
    _TMRE,
    {
        [_e]: _c,
        [_hE]: 429
    },
    [
        _m
    ],
    [
        0
    ]
];
n0_registry.registerError(TooManyRequestsException$, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TooManyRequestsException"]);
var UnauthorizedException$ = [
    -3,
    n0,
    _UE,
    {
        [_e]: _c,
        [_hE]: 401
    },
    [
        _m
    ],
    [
        0
    ]
];
n0_registry.registerError(UnauthorizedException$, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$models$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UnauthorizedException"]);
const errorTypeRegistries = [
    _s_registry,
    n0_registry
];
var AccessTokenType = [
    0,
    n0,
    _ATT,
    8,
    0
];
var SecretAccessKeyType = [
    0,
    n0,
    _SAKT,
    8,
    0
];
var SessionTokenType = [
    0,
    n0,
    _STT,
    8,
    0
];
var GetRoleCredentialsRequest$ = [
    3,
    n0,
    _GRCR,
    0,
    [
        _rN,
        _aI,
        _aT
    ],
    [
        [
            0,
            {
                [_hQ]: _rn
            }
        ],
        [
            0,
            {
                [_hQ]: _ai
            }
        ],
        [
            ()=>AccessTokenType,
            {
                [_hH]: _xasbt
            }
        ]
    ],
    3
];
var GetRoleCredentialsResponse$ = [
    3,
    n0,
    _GRCRe,
    0,
    [
        _rC
    ],
    [
        [
            ()=>RoleCredentials$,
            0
        ]
    ]
];
var RoleCredentials$ = [
    3,
    n0,
    _RC,
    0,
    [
        _aKI,
        _sAK,
        _sT,
        _ex
    ],
    [
        0,
        [
            ()=>SecretAccessKeyType,
            0
        ],
        [
            ()=>SessionTokenType,
            0
        ],
        1
    ]
];
var GetRoleCredentials$ = [
    9,
    n0,
    _GRC,
    {
        [_h]: [
            "GET",
            "/federation/credentials",
            200
        ]
    },
    ()=>GetRoleCredentialsRequest$,
    ()=>GetRoleCredentialsResponse$
];
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/commands/GetRoleCredentialsCommand.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GetRoleCredentialsCommand",
    ()=>GetRoleCredentialsCommand
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$commandBuilder$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/commandBuilder.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$schemas$2f$schemas_0$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/schemas/schemas_0.js [app-route] (ecmascript)");
;
;
class GetRoleCredentialsCommand extends (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$commandBuilder$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["command"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$commandBuilder$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_ep0"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$commandBuilder$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["_mw0"], "GetRoleCredentials", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$schemas$2f$schemas_0$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GetRoleCredentials$"]) {
}
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/auth/httpAuthSchemeProvider.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultSSOHttpAuthSchemeParametersProvider",
    ()=>defaultSSOHttpAuthSchemeParametersProvider,
    "defaultSSOHttpAuthSchemeProvider",
    ()=>defaultSSOHttpAuthSchemeProvider,
    "resolveHttpAuthSchemeConfig",
    ()=>resolveHttpAuthSchemeConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$httpAuthSchemes$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$getSmithyContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/getSmithyContext.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/normalizeProvider.js [app-route] (ecmascript)");
;
;
const defaultSSOHttpAuthSchemeParametersProvider = async (config, context, input)=>{
    return {
        operation: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$getSmithyContext$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSmithyContext"])(context).operation,
        region: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProvider"])(config.region)() || (()=>{
            throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
        })()
    };
};
function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
        schemeId: "aws.auth#sigv4",
        signingProperties: {
            name: "awsssoportal",
            region: authParameters.region
        },
        propertiesExtractor: (config, context)=>({
                signingProperties: {
                    config,
                    context
                }
            })
    };
}
function createSmithyApiNoAuthHttpAuthOption(authParameters) {
    return {
        schemeId: "smithy.api#noAuth"
    };
}
const defaultSSOHttpAuthSchemeProvider = (authParameters)=>{
    const options = [];
    switch(authParameters.operation){
        case "GetRoleCredentials":
            {
                options.push(createSmithyApiNoAuthHttpAuthOption(authParameters));
                break;
            }
            ;
        default:
            {
                options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
            }
    }
    return options;
};
const resolveHttpAuthSchemeConfig = (config)=>{
    const config_0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$httpAuthSchemes$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveAwsSdkSigV4Config"])(config);
    return Object.assign(config_0, {
        authSchemePreference: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$normalizeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeProvider"])(config.authSchemePreference ?? [])
    });
};
}),
"[project]/node_modules/@aws-sdk/nested-clients/package.json.[json].cjs [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "name": "@aws-sdk/nested-clients",
    "version": "3.997.36",
    "description": "Nested clients for AWS SDK packages.",
    "homepage": "https://github.com/aws/aws-sdk-js-v3/tree/main/packages/nested-clients",
    "license": "Apache-2.0",
    "author": {
        "name": "AWS SDK for JavaScript Team",
        "url": "https://aws.amazon.com/sdk-for-javascript/"
    },
    "repository": {
        "type": "git",
        "url": "https://github.com/aws/aws-sdk-js-v3.git",
        "directory": "packages/nested-clients"
    },
    "files": [
        "./cognito-identity.d.ts",
        "./cognito-identity.js",
        "./signin.d.ts",
        "./signin.js",
        "./sso-oidc.d.ts",
        "./sso-oidc.js",
        "./sso.d.ts",
        "./sso.js",
        "./sts.d.ts",
        "./sts.js",
        "dist-*/**"
    ],
    "sideEffects": false,
    "main": "./dist-cjs/index.js",
    "module": "./dist-es/index.js",
    "browser": {
        "./dist-es/submodules/cognito-identity/runtimeConfig": "./dist-es/submodules/cognito-identity/runtimeConfig.browser",
        "./dist-es/submodules/signin/runtimeConfig": "./dist-es/submodules/signin/runtimeConfig.browser",
        "./dist-es/submodules/sso-oidc/runtimeConfig": "./dist-es/submodules/sso-oidc/runtimeConfig.browser",
        "./dist-es/submodules/sso/runtimeConfig": "./dist-es/submodules/sso/runtimeConfig.browser",
        "./dist-es/submodules/sts/runtimeConfig": "./dist-es/submodules/sts/runtimeConfig.browser"
    },
    "types": "./dist-types/index.d.ts",
    "typesVersions": {
        "<4.5": {
            "dist-types/*": [
                "dist-types/ts3.4/*"
            ],
            "*": [
                "dist-types/ts3.4/submodules/*/index.d.ts"
            ]
        }
    },
    "react-native": {},
    "exports": {
        "./package.json": "./package.json",
        "./sso-oidc": {
            "types": "./dist-types/submodules/sso-oidc/index.d.ts",
            "module": "./dist-es/submodules/sso-oidc/index.js",
            "node": "./dist-cjs/submodules/sso-oidc/index.js",
            "import": "./dist-es/submodules/sso-oidc/index.js",
            "require": "./dist-cjs/submodules/sso-oidc/index.js"
        },
        "./sts": {
            "types": "./dist-types/submodules/sts/index.d.ts",
            "module": "./dist-es/submodules/sts/index.js",
            "node": "./dist-cjs/submodules/sts/index.js",
            "import": "./dist-es/submodules/sts/index.js",
            "require": "./dist-cjs/submodules/sts/index.js"
        },
        "./signin": {
            "types": "./dist-types/submodules/signin/index.d.ts",
            "module": "./dist-es/submodules/signin/index.js",
            "node": "./dist-cjs/submodules/signin/index.js",
            "import": "./dist-es/submodules/signin/index.js",
            "require": "./dist-cjs/submodules/signin/index.js"
        },
        "./cognito-identity": {
            "types": "./dist-types/submodules/cognito-identity/index.d.ts",
            "module": "./dist-es/submodules/cognito-identity/index.js",
            "node": "./dist-cjs/submodules/cognito-identity/index.js",
            "import": "./dist-es/submodules/cognito-identity/index.js",
            "require": "./dist-cjs/submodules/cognito-identity/index.js"
        },
        "./sso": {
            "types": "./dist-types/submodules/sso/index.d.ts",
            "module": "./dist-es/submodules/sso/index.js",
            "node": "./dist-cjs/submodules/sso/index.js",
            "import": "./dist-es/submodules/sso/index.js",
            "require": "./dist-cjs/submodules/sso/index.js"
        }
    },
    "scripts": {
        "build": "concurrently 'yarn:build:types' 'yarn:build:es' && yarn build:cjs",
        "build:cjs": "node ../../scripts/compilation/inline",
        "build:es": "premove dist-es && tsc -p tsconfig.es.json",
        "build:include:deps": "yarn g:turbo run build -F=\"$npm_package_name\"",
        "build:types": "premove dist-types && tsc -p tsconfig.types.json",
        "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
        "clean": "premove dist-cjs dist-es dist-types",
        "lint": "node ../../scripts/validation/submodules-linter.js",
        "prebuild": "yarn lint",
        "test": "yarn g:vitest run",
        "test:watch": "yarn g:vitest watch"
    },
    "dependencies": {
        "@aws-sdk/core": "^3.977.1",
        "@aws-sdk/signature-v4-multi-region": "^3.996.42",
        "@aws-sdk/types": "^3.974.2",
        "@smithy/core": "^3.29.8",
        "@smithy/fetch-http-handler": "^5.6.10",
        "@smithy/node-http-handler": "^4.9.10",
        "@smithy/types": "^4.16.1",
        "tslib": "^2.6.2"
    },
    "devDependencies": {
        "concurrently": "7.0.0",
        "downlevel-dts": "0.10.1",
        "premove": "4.0.0",
        "typescript": "~5.8.3"
    },
    "engines": {
        "node": ">=20.0.0"
    }
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/constants.js [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/node_modules/@smithy/node-http-handler/dist-es/set-connection-timeout.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setConnectionTimeout",
    ()=>setConnectionTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [app-route] (ecmascript)");
;
const DEFER_EVENT_LISTENER_TIME = 1000;
const setConnectionTimeout = (request, reject, timeoutInMs = 0)=>{
    if (!timeoutInMs) {
        return -1;
    }
    const registerTimeout = (offset)=>{
        const timeoutId = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].setTimeout(()=>{
            request.destroy();
            reject(Object.assign(new Error(`@smithy/node-http-handler - the request socket did not establish a connection with the server within the configured timeout of ${timeoutInMs} ms.`), {
                name: "TimeoutError"
            }));
        }, timeoutInMs - offset);
        const doWithSocket = (socket)=>{
            if (socket?.connecting) {
                socket.on("connect", ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].clearTimeout(timeoutId);
                });
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].clearTimeout(timeoutId);
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].setTimeout(registerTimeout.bind(null, DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/set-request-timeout.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setRequestTimeout",
    ()=>setRequestTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [app-route] (ecmascript)");
;
const setRequestTimeout = (req, reject, timeoutInMs = 0, throwOnRequestTimeout, logger)=>{
    if (timeoutInMs) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].setTimeout(()=>{
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
"[project]/node_modules/@smithy/node-http-handler/dist-es/set-socket-keep-alive.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setSocketKeepAlive",
    ()=>setSocketKeepAlive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [app-route] (ecmascript)");
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].setTimeout(registerListener, deferTimeMs);
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/set-socket-timeout.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setSocketTimeout",
    ()=>setSocketTimeout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [app-route] (ecmascript)");
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
};
}),
"[project]/node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_REQUEST_TIMEOUT",
    ()=>DEFAULT_REQUEST_TIMEOUT,
    "NodeHttpHandler",
    ()=>NodeHttpHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$httpResponse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/httpResponse.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$querystring$2d$builder$2f$buildQueryString$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/protocols/querystring-builder/buildQueryString.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$build$2d$abort$2d$error$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/build-abort-error.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/constants.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$get$2d$transformed$2d$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/get-transformed-headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$https__$5b$external$5d$__$28$node$3a$https$2c$__cjs$29$__$3c$export__default__as__node_https$3e$__ = __turbopack_context__.i("[externals]/node:https [external] (node:https, cjs) <export default as node_https>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$connection$2d$timeout$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/set-connection-timeout.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$request$2d$timeout$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/set-request-timeout.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$socket$2d$keep$2d$alive$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/set-socket-keep-alive.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$socket$2d$timeout$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/set-socket-timeout.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/timing.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$write$2d$request$2d$body$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/write-request-body.js [app-route] (ecmascript)");
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
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].clearTimeout(socketWarningTimeoutId);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].clearTimeout(connectionTimeoutId);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].clearTimeout(requestTimeoutId);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].clearTimeout(socketTimeoutId);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].clearTimeout(keepAliveTimeoutId);
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
                const abortError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$build$2d$abort$2d$error$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAbortError"])(abortSignal);
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
            socketWarningTimeoutId = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$timing$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timing"].setTimeout(()=>{
                this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(agent, this.socketWarningTimestamp, config.logger);
            }, config.socketAcquisitionWarningTimeout ?? (config.requestTimeout ?? 2000) + (config.connectionTimeout ?? 1000));
            const queryString = request.query ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$querystring$2d$builder$2f$buildQueryString$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildQueryString"])(request.query) : "";
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
                const httpResponse = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$httpResponse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpResponse"]({
                    statusCode: res.statusCode || -1,
                    reason: res.statusMessage,
                    headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$get$2d$transformed$2d$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTransformedHeaders"])(res.headers),
                    body: res
                });
                resolve({
                    response: httpResponse
                });
            });
            req.on("error", (err)=>{
                if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODEJS_TIMEOUT_ERROR_CODES"].includes(err.code)) {
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
                    const abortError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$build$2d$abort$2d$error$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAbortError"])(abortSignal);
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
            connectionTimeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$connection$2d$timeout$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setConnectionTimeout"])(req, reject, config.connectionTimeout);
            requestTimeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$request$2d$timeout$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setRequestTimeout"])(req, reject, effectiveRequestTimeout, config.throwOnRequestTimeout, config.logger ?? console);
            socketTimeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$socket$2d$timeout$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setSocketTimeout"])(req, reject, config.socketTimeout);
            const httpAgent = nodeHttpsOptions.agent;
            if (typeof httpAgent === "object" && "keepAlive" in httpAgent) {
                keepAliveTimeoutId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$set$2d$socket$2d$keep$2d$alive$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setSocketKeepAlive"])(req, {
                    keepAlive: httpAgent.keepAlive,
                    keepAliveMsecs: httpAgent.keepAliveMsecs
                });
            }
            writeRequestBodyPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$write$2d$request$2d$body$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeRequestBody"])(req, request, effectiveRequestTimeout, this.externalAgent).catch((e)=>{
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
"[project]/node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/httpAuthSchemes/noAuth.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NoAuthSigner",
    ()=>NoAuthSigner
]);
class NoAuthSigner {
    async sign(httpRequest, identity, signingProperties) {
        return httpRequest;
    }
}
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/bdd.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bdd",
    ()=>bdd
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$util$2d$endpoints$2f$bdd$2f$BinaryDecisionDiagram$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/bdd/BinaryDecisionDiagram.js [app-route] (ecmascript)");
;
const k = "ref";
const a = -1, b = true, c = "isSet", d = "PartitionResult", e = "booleanEquals", f = "getAttr", g = {
    [k]: "Endpoint"
}, h = {
    [k]: d
}, i = {}, j = [
    {
        [k]: "Region"
    }
];
const _data = {
    conditions: [
        [
            c,
            [
                g
            ]
        ],
        [
            c,
            j
        ],
        [
            "aws.partition",
            j,
            d
        ],
        [
            e,
            [
                {
                    [k]: "UseFIPS"
                },
                b
            ]
        ],
        [
            e,
            [
                {
                    [k]: "UseDualStack"
                },
                b
            ]
        ],
        [
            e,
            [
                {
                    fn: f,
                    argv: [
                        h,
                        "supportsDualStack"
                    ]
                },
                b
            ]
        ],
        [
            e,
            [
                {
                    fn: f,
                    argv: [
                        h,
                        "supportsFIPS"
                    ]
                },
                b
            ]
        ],
        [
            "stringEquals",
            [
                {
                    fn: f,
                    argv: [
                        h,
                        "name"
                    ]
                },
                "aws-us-gov"
            ]
        ]
    ],
    results: [
        [
            a
        ],
        [
            a,
            "Invalid Configuration: FIPS and custom endpoint are not supported"
        ],
        [
            a,
            "Invalid Configuration: Dualstack and custom endpoint are not supported"
        ],
        [
            g,
            i
        ],
        [
            "https://portal.sso-fips.{Region}.{PartitionResult#dualStackDnsSuffix}",
            i
        ],
        [
            a,
            "FIPS and DualStack are enabled, but this partition does not support one or both"
        ],
        [
            "https://portal.sso.{Region}.amazonaws.com",
            i
        ],
        [
            "https://portal.sso-fips.{Region}.{PartitionResult#dnsSuffix}",
            i
        ],
        [
            a,
            "FIPS is enabled but this partition does not support FIPS"
        ],
        [
            "https://portal.sso.{Region}.{PartitionResult#dualStackDnsSuffix}",
            i
        ],
        [
            a,
            "DualStack is enabled but this partition does not support DualStack"
        ],
        [
            "https://portal.sso.{Region}.{PartitionResult#dnsSuffix}",
            i
        ],
        [
            a,
            "Invalid Configuration: Missing Region"
        ]
    ]
};
const root = 2;
const r = 100_000_000;
const nodes = new Int32Array([
    -1,
    1,
    -1,
    0,
    13,
    3,
    1,
    4,
    r + 12,
    2,
    5,
    r + 12,
    3,
    8,
    6,
    4,
    7,
    r + 11,
    5,
    r + 9,
    r + 10,
    4,
    11,
    9,
    6,
    10,
    r + 8,
    7,
    r + 6,
    r + 7,
    5,
    12,
    r + 5,
    6,
    r + 4,
    r + 5,
    3,
    r + 1,
    14,
    4,
    r + 2,
    r + 3
]);
const bdd = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$util$2d$endpoints$2f$bdd$2f$BinaryDecisionDiagram$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BinaryDecisionDiagram"].from(nodes, root, _data.conditions, _data.results);
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/endpointResolver.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultEndpointResolver",
    ()=>defaultEndpointResolver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$util$2d$endpoints$2f$aws$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/util-endpoints/aws.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$util$2d$endpoints$2f$utils$2f$customEndpointFunctions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/utils/customEndpointFunctions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$util$2d$endpoints$2f$decideEndpoint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/decideEndpoint.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$util$2d$endpoints$2f$cache$2f$EndpointCache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/endpoints/util-endpoints/cache/EndpointCache.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$endpoint$2f$bdd$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/bdd.js [app-route] (ecmascript)");
;
;
;
const cache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$util$2d$endpoints$2f$cache$2f$EndpointCache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["EndpointCache"]({
    size: 50,
    params: [
        "Endpoint",
        "Region",
        "UseDualStack",
        "UseFIPS"
    ]
});
const defaultEndpointResolver = (endpointParams, context = {})=>{
    return cache.get(endpointParams, ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$util$2d$endpoints$2f$decideEndpoint$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decideEndpoint"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$endpoint$2f$bdd$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bdd"], {
            endpointParams: endpointParams,
            logger: context.logger
        }));
};
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$util$2d$endpoints$2f$utils$2f$customEndpointFunctions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["customEndpointFunctions"].aws = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$util$2d$endpoints$2f$aws$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["awsEndpointFunctions"];
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeConfig.shared.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRuntimeConfig",
    ()=>getRuntimeConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$httpAuthSchemes$2f$aws_sdk$2f$AwsSdkSigV4Signer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4Signer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$json$2f$AwsRestJsonProtocol$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/protocols/json/AwsRestJsonProtocol.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$legacy$2d$root$2d$exports$2f$util$2d$identity$2d$and$2d$auth$2f$httpAuthSchemes$2f$noAuth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/httpAuthSchemes/noAuth.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$checksum$2f$sha256$2f$Sha256Node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Sha256Node__as__Sha256$3e$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/checksum/sha256/Sha256Node.js [app-route] (ecmascript) <export Sha256Node as Sha256>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$NoOpLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/NoOpLogger.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/transport/parseUrl.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$fromBase64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/fromBase64.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$utf8$2f$fromUtf8$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/fromUtf8.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$toBase64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-base64/toBase64.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$utf8$2f$toUtf8$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-utf8/toUtf8.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$auth$2f$httpAuthSchemeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/auth/httpAuthSchemeProvider.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$endpoint$2f$endpointResolver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/endpointResolver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$schemas$2f$schemas_0$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/schemas/schemas_0.js [app-route] (ecmascript)");
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
const getRuntimeConfig = (config)=>{
    return {
        apiVersion: "2019-06-10",
        base64Decoder: config?.base64Decoder ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$fromBase64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromBase64"],
        base64Encoder: config?.base64Encoder ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$base64$2f$toBase64$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toBase64"],
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$endpoint$2f$endpointResolver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultEndpointResolver"],
        extensions: config?.extensions ?? [],
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$auth$2f$httpAuthSchemeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultSSOHttpAuthSchemeProvider"],
        httpAuthSchemes: config?.httpAuthSchemes ?? [
            {
                schemeId: "aws.auth#sigv4",
                identityProvider: (ipc)=>ipc.getIdentityProvider("aws.auth#sigv4"),
                signer: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$httpAuthSchemes$2f$aws_sdk$2f$AwsSdkSigV4Signer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AwsSdkSigV4Signer"]()
            },
            {
                schemeId: "smithy.api#noAuth",
                identityProvider: (ipc)=>ipc.getIdentityProvider("smithy.api#noAuth") || (async ()=>({})),
                signer: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$legacy$2d$root$2d$exports$2f$util$2d$identity$2d$and$2d$auth$2f$httpAuthSchemes$2f$noAuth$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NoAuthSigner"]()
            }
        ],
        logger: config?.logger ?? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$NoOpLogger$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NoOpLogger"](),
        protocol: config?.protocol ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$json$2f$AwsRestJsonProtocol$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AwsRestJsonProtocol"],
        protocolSettings: config?.protocolSettings ?? {
            defaultNamespace: "com.amazonaws.sso",
            errorTypeRegistries: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$schemas$2f$schemas_0$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["errorTypeRegistries"],
            version: "2019-06-10",
            serviceTarget: "SWBPortalService"
        },
        serviceId: config?.serviceId ?? "SSO",
        sha256: config?.sha256 ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$checksum$2f$sha256$2f$Sha256Node$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__Sha256Node__as__Sha256$3e$__["Sha256"],
        urlParser: config?.urlParser ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$transport$2f$parseUrl$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseUrl"],
        utf8Decoder: config?.utf8Decoder ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$utf8$2f$fromUtf8$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromUtf8"],
        utf8Encoder: config?.utf8Encoder ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$utf8$2f$toUtf8$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toUtf8"]
    };
};
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeConfig.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRuntimeConfig",
    ()=>getRuntimeConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$package$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/package.json.[json].cjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$util$2d$user$2d$agent$2d$node$2f$defaultUserAgent$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/defaultUserAgent.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$emitWarningIfUnsupportedVersion$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/emitWarningIfUnsupportedVersion.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$util$2d$user$2d$agent$2d$node$2f$nodeAppIdConfigOptions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/util-user-agent-node/nodeAppIdConfigOptions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$httpAuthSchemes$2f$aws_sdk$2f$NODE_AUTH_SCHEME_PREFERENCE_OPTIONS$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/NODE_AUTH_SCHEME_PREFERENCE_OPTIONS.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$emitWarningIfUnsupportedVersion$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/emitWarningIfUnsupportedVersion.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$defaults$2d$mode$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/defaults-mode.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/node-config-provider/configLoader.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$regionConfig$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/config.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$endpointsConfig$2f$NodeUseDualstackEndpointConfigOptions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/endpointsConfig/NodeUseDualstackEndpointConfigOptions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$endpointsConfig$2f$NodeUseFipsEndpointConfigOptions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/endpointsConfig/NodeUseFipsEndpointConfigOptions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$defaults$2d$mode$2f$resolveDefaultsModeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/defaults-mode/resolveDefaultsModeConfig.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$util$2d$retry$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/retry/util-retry/config.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$middleware$2d$retry$2f$configurations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/configurations.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$body$2d$length$2f$calculateBodyLength$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-body-length/calculateBodyLength.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$node$2d$http$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/node-http-handler/dist-es/node-http-handler.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/serde/util-stream/stream-collector.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$runtimeConfig$2e$shared$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeConfig.shared.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
const getRuntimeConfig = (config)=>{
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$emitWarningIfUnsupportedVersion$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emitWarningIfUnsupportedVersion"])(process.version);
    const defaultsMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$defaults$2d$mode$2f$resolveDefaultsModeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveDefaultsModeConfig"])(config);
    const defaultConfigProvider = ()=>defaultsMode().then(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$defaults$2d$mode$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfigsForDefaultMode"]);
    const clientSharedValues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$runtimeConfig$2e$shared$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRuntimeConfig"])(config);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$emitWarningIfUnsupportedVersion$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["emitWarningIfUnsupportedVersion"])(process.version);
    const loaderConfig = {
        profile: config?.profile,
        logger: clientSharedValues.logger
    };
    return {
        ...clientSharedValues,
        ...config,
        runtime: "node",
        defaultsMode,
        authSchemePreference: config?.authSchemePreference ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$httpAuthSchemes$2f$aws_sdk$2f$NODE_AUTH_SCHEME_PREFERENCE_OPTIONS$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODE_AUTH_SCHEME_PREFERENCE_OPTIONS"], loaderConfig),
        bodyLengthChecker: config?.bodyLengthChecker ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$body$2d$length$2f$calculateBodyLength$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateBodyLength"],
        defaultUserAgentProvider: config?.defaultUserAgentProvider ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$util$2d$user$2d$agent$2d$node$2f$defaultUserAgent$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createDefaultUserAgentProvider"])({
            serviceId: clientSharedValues.serviceId,
            clientVersion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$package$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].version
        }),
        maxAttempts: config?.maxAttempts ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$middleware$2d$retry$2f$configurations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODE_MAX_ATTEMPT_CONFIG_OPTIONS"], config),
        region: config?.region ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$regionConfig$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODE_REGION_CONFIG_OPTIONS"], {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$regionConfig$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODE_REGION_CONFIG_FILE_OPTIONS"],
            ...loaderConfig
        }),
        requestHandler: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$node$2d$http$2d$handler$2f$dist$2d$es$2f$node$2d$http$2d$handler$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NodeHttpHandler"].create(config?.requestHandler ?? defaultConfigProvider),
        retryMode: config?.retryMode ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])({
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$middleware$2d$retry$2f$configurations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODE_RETRY_MODE_CONFIG_OPTIONS"],
            default: async ()=>(await defaultConfigProvider()).retryMode || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$util$2d$retry$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_RETRY_MODE"]
        }, config),
        streamCollector: config?.streamCollector ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$serde$2f$util$2d$stream$2f$stream$2d$collector$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["streamCollector"],
        useDualstackEndpoint: config?.useDualstackEndpoint ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$endpointsConfig$2f$NodeUseDualstackEndpointConfigOptions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS"], loaderConfig),
        useFipsEndpoint: config?.useFipsEndpoint ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$endpointsConfig$2f$NodeUseFipsEndpointConfigOptions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS"], loaderConfig),
        userAgentAppId: config?.userAgentAppId ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$node$2d$config$2d$provider$2f$configLoader$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadConfig"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$util$2d$user$2d$agent$2d$node$2f$nodeAppIdConfigOptions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NODE_APP_ID_CONFIG_OPTIONS"], loaderConfig)
    };
};
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/auth/httpAuthExtensionConfiguration.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getHttpAuthExtensionConfiguration",
    ()=>getHttpAuthExtensionConfiguration,
    "resolveHttpAuthRuntimeConfig",
    ()=>resolveHttpAuthRuntimeConfig
]);
const getHttpAuthExtensionConfiguration = (runtimeConfig)=>{
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
        setHttpAuthScheme (httpAuthScheme) {
            const index = _httpAuthSchemes.findIndex((scheme)=>scheme.schemeId === httpAuthScheme.schemeId);
            if (index === -1) {
                _httpAuthSchemes.push(httpAuthScheme);
            } else {
                _httpAuthSchemes.splice(index, 1, httpAuthScheme);
            }
        },
        httpAuthSchemes () {
            return _httpAuthSchemes;
        },
        setHttpAuthSchemeProvider (httpAuthSchemeProvider) {
            _httpAuthSchemeProvider = httpAuthSchemeProvider;
        },
        httpAuthSchemeProvider () {
            return _httpAuthSchemeProvider;
        },
        setCredentials (credentials) {
            _credentials = credentials;
        },
        credentials () {
            return _credentials;
        }
    };
};
const resolveHttpAuthRuntimeConfig = (config)=>{
    return {
        httpAuthSchemes: config.httpAuthSchemes(),
        httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
        credentials: config.credentials()
    };
};
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeExtensions.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resolveRuntimeExtensions",
    ()=>resolveRuntimeExtensions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$region$2d$config$2d$resolver$2f$extensions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/region-config-resolver/extensions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$extensions$2f$defaultExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/extensions/defaultExtensionConfiguration.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$protocol$2d$http$2f$extensions$2f$httpExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/protocols/protocol-http/extensions/httpExtensionConfiguration.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$auth$2f$httpAuthExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/auth/httpAuthExtensionConfiguration.js [app-route] (ecmascript)");
;
;
;
;
const resolveRuntimeExtensions = (runtimeConfig, extensions)=>{
    const extensionConfiguration = Object.assign((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$region$2d$config$2d$resolver$2f$extensions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAwsRegionExtensionConfiguration"])(runtimeConfig), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$extensions$2f$defaultExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDefaultExtensionConfiguration"])(runtimeConfig), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$protocol$2d$http$2f$extensions$2f$httpExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHttpHandlerExtensionConfiguration"])(runtimeConfig), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$auth$2f$httpAuthExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHttpAuthExtensionConfiguration"])(runtimeConfig));
    extensions.forEach((extension)=>extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$region$2d$config$2d$resolver$2f$extensions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveAwsRegionExtensionConfiguration"])(extensionConfiguration), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$extensions$2f$defaultExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveDefaultRuntimeConfig"])(extensionConfiguration), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$protocol$2d$http$2f$extensions$2f$httpExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveHttpHandlerRuntimeConfig"])(extensionConfiguration), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$auth$2f$httpAuthExtensionConfiguration$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveHttpAuthRuntimeConfig"])(extensionConfiguration));
};
}),
"[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/SSOClient.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SSOClient",
    ()=>SSOClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$host$2d$header$2f$hostHeaderMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-host-header/hostHeaderMiddleware.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$logger$2f$loggerMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-logger/loggerMiddleware.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$recursion$2d$detection$2f$getRecursionDetectionPlugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-recursion-detection/getRecursionDetectionPlugin.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$user$2d$agent$2f$user$2d$agent$2d$middleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/user-agent-middleware.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$user$2d$agent$2f$configurations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/core/dist-es/submodules/client/middleware-user-agent/configurations.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$legacy$2d$root$2d$exports$2f$util$2d$identity$2d$and$2d$auth$2f$DefaultIdentityProviderConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/legacy-root-exports/util-identity-and-auth/DefaultIdentityProviderConfig.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$legacy$2d$root$2d$exports$2f$middleware$2d$http$2d$auth$2d$scheme$2f$getHttpAuthSchemeEndpointRuleSetPlugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-auth-scheme/getHttpAuthSchemeEndpointRuleSetPlugin.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$legacy$2d$root$2d$exports$2f$middleware$2d$http$2d$signing$2f$getHttpSigningMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/legacy-root-exports/middleware-http-signing/getHttpSigningMiddleware.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$client$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/client/smithy-client/client.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$regionConfig$2f$resolveRegionConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/config/config-resolver/regionConfig/resolveRegionConfig.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/endpoints/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$middleware$2d$content$2d$length$2f$contentLengthMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/protocols/middleware-content-length/contentLengthMiddleware.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/retry/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$middleware$2d$retry$2f$configurations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/retry/middleware-retry/configurations.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$schema$2f$middleware$2f$getSchemaSerdePlugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@smithy/core/dist-es/submodules/schema/middleware/getSchemaSerdePlugin.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$auth$2f$httpAuthSchemeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/auth/httpAuthSchemeProvider.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$endpoint$2f$EndpointParameters$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/endpoint/EndpointParameters.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$runtimeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeConfig.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$runtimeExtensions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/runtimeExtensions.js [app-route] (ecmascript)");
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
class SSOClient extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$smithy$2d$client$2f$client$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Client"] {
    config;
    constructor(...[configuration]){
        const _config_0 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$runtimeConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRuntimeConfig"])(configuration || {});
        super(_config_0);
        this.initConfig = _config_0;
        const _config_1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$endpoint$2f$EndpointParameters$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveClientEndpointParameters"])(_config_0);
        const _config_2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$user$2d$agent$2f$configurations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveUserAgentConfig"])(_config_1);
        const _config_3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$middleware$2d$retry$2f$configurations$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRetryConfig"])(_config_2);
        const _config_4 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$config$2f$config$2d$resolver$2f$regionConfig$2f$resolveRegionConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRegionConfig"])(_config_3);
        const _config_5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$host$2d$header$2f$hostHeaderMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveHostHeaderConfig"])(_config_4);
        const _config_6 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$endpoints$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["resolveEndpointConfig"])(_config_5);
        const _config_7 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$auth$2f$httpAuthSchemeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveHttpAuthSchemeConfig"])(_config_6);
        const _config_8 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$runtimeExtensions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveRuntimeExtensions"])(_config_7, configuration?.extensions || []);
        this.config = _config_8;
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$schema$2f$middleware$2f$getSchemaSerdePlugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSchemaSerdePlugin"])(this.config));
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$user$2d$agent$2f$user$2d$agent$2d$middleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserAgentPlugin"])(this.config));
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$retry$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getRetryPlugin"])(this.config));
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$submodules$2f$protocols$2f$middleware$2d$content$2d$length$2f$contentLengthMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getContentLengthPlugin"])(this.config));
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$host$2d$header$2f$hostHeaderMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHostHeaderPlugin"])(this.config));
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$logger$2f$loggerMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLoggerPlugin"])(this.config));
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$core$2f$dist$2d$es$2f$submodules$2f$client$2f$middleware$2d$recursion$2d$detection$2f$getRecursionDetectionPlugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRecursionDetectionPlugin"])(this.config));
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$legacy$2d$root$2d$exports$2f$middleware$2d$http$2d$auth$2d$scheme$2f$getHttpAuthSchemeEndpointRuleSetPlugin$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHttpAuthSchemeEndpointRuleSetPlugin"])(this.config, {
            httpAuthSchemeParametersProvider: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$auth$2f$httpAuthSchemeProvider$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaultSSOHttpAuthSchemeParametersProvider"],
            identityProviderConfigProvider: async (config)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$legacy$2d$root$2d$exports$2f$util$2d$identity$2d$and$2d$auth$2f$DefaultIdentityProviderConfig$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DefaultIdentityProviderConfig"]({
                    "aws.auth#sigv4": config.credentials
                })
        }));
        this.middlewareStack.use((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$smithy$2f$core$2f$dist$2d$es$2f$legacy$2d$root$2d$exports$2f$middleware$2d$http$2d$signing$2f$getHttpSigningMiddleware$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getHttpSigningPlugin"])(this.config));
    }
    destroy() {
        super.destroy();
    }
}
}),
"[project]/node_modules/@aws-sdk/credential-provider-sso/dist-es/loadSso.js [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$commands$2f$GetRoleCredentialsCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/commands/GetRoleCredentialsCommand.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$SSOClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/SSOClient.js [app-route] (ecmascript) <locals>");
;
;
}),
"[project]/node_modules/@aws-sdk/credential-provider-sso/dist-es/loadSso.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GetRoleCredentialsCommand",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$commands$2f$GetRoleCredentialsCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GetRoleCredentialsCommand"],
    "SSOClient",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$SSOClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["SSOClient"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$credential$2d$provider$2d$sso$2f$dist$2d$es$2f$loadSso$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/credential-provider-sso/dist-es/loadSso.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$commands$2f$GetRoleCredentialsCommand$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/commands/GetRoleCredentialsCommand.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$nested$2d$clients$2f$dist$2d$es$2f$submodules$2f$sso$2f$SSOClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@aws-sdk/nested-clients/dist-es/submodules/sso/SSOClient.js [app-route] (ecmascript) <locals>");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1xeb-p0._.js.map
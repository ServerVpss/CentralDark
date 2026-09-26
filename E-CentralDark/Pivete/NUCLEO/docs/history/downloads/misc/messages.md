# OUTRO - messages.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\vscode-jsonrpc@9.0.1@@@1\lib\common\messages.js
**SHA:** 7a06cfd7456c2f24
**Timestamp:** 2026-08-28T02:26:22.622329
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ErrorCodes.jsonrpcReservedErrorRangeStart = -32099;
- ErrorCodes.serverErrorStart = -32099;

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.NotificationType9 = exports.NotificationType8 = exports.NotificationType7 = exports.NotificationType6 = exports.NotificationType5 = exports.NotificationType4 = exports.NotificationType3 = exports.NotificationType2 = exports.NotificationType1 = exports.NotificationType0 = exports.NotificationType = exports.RequestType9 = exports.RequestType8 = exports.RequestType7 = exports.RequestType6 = exports.RequestType5 = exports.RequestType4 = exports.RequestType3 = exports.RequestType2 = exports.RequestType1 = exports.RequestType = exports.RequestType0 = exports.AbstractMessageSignature = exports.ParameterStructures = exports.ResponseError = exports.ErrorCodes = void 0;
const is = __importStar(require("./is"));
/**
 * Predefined error codes.
 */
var ErrorCodes;
(function (ErrorCodes) {
    // Defined by JSON RPC
    ErrorCodes.ParseError = -32700;
    ErrorCodes.InvalidRequest = -32600;
    ErrorCodes.MethodNotFound = -32601;
    ErrorCodes.InvalidParams = -32602;
    ErrorCodes.InternalError = -32603;
    /**
     * This is the start range of JSON RPC reserved error codes.
     * It doesn't denote a real error code. No application error codes should
     * be defined between the start and end range. For backwards
     * compatibility the `ServerNotInitialized` and the `UnknownErrorCode`
     * are left in the range.
     *
     * @since 3.16.0
    */
    ErrorCodes.jsonrpcReservedErrorRangeStart = -32099;
    /** @deprecated use  jsonrpcReservedErrorRangeStart */
    ErrorCodes.serverErrorStart = -32099;
    /**
     * An error occurred when write a message to the transport layer.
     */
    ErrorCodes.MessageWriteError = -32099;
    /**
     * An error occurred when reading a message from the transport layer.
     */
    ErrorCodes.MessageReadError = -32098;
    /**
     * The connection got disposed or lost and all pending responses got
     * rejected.
     */
    ErrorCodes.PendingResponseRejected = -32097;
    /**
     * The connection is inactive and a use of it failed.
     */
    ErrorCodes.ConnectionInactive = -32096;
    /**
     * Error code indicating that a server received a notification or
     * request before the server has received the `initialize` request.
     */
    ErrorCodes.ServerNotInitialized = -32002;
    ErrorCodes.UnknownErrorCode = -32001;
    /**
     * This is the end range of JSON RPC reserved error codes.
     * It doesn't denote a real error code.
     *
     * @since 3.16.0
    */
    ErrorCodes.jsonrpcReservedErrorRangeEnd = -32000;
    /** @deprecated use  jsonrpcReservedErrorRangeEnd */
    ErrorCodes.serverErrorEnd = -32000;
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
/**
 * An error object return in a response in case a request
 * has failed.
 */
class ResponseError extends Error {
    code;
    data;
    constructor(code, message, data) {
        super(message);
        this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
        this.data = data;
        Object.setPrototypeOf(this, ResponseError.prototype);
    }
    toJson() {
        const result = {
            code: this.code,
            message: this.message
        };
        if (this.data !== undefined) {
       
```

---

# OUTRO - messages.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cargo_metadata-0.19.2\src\messages.rs
**SHA:** da21b25d289f86f2
**Timestamp:** 2026-08-28T02:33:17.982000
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- #[cfg_attr(feature = "builder", builder(pattern = "owned", setter(into)))]
- #[cfg_attr(feature = "builder", builder(pattern = "owned", setter(into)))]
- #[cfg_attr(feature = "builder", builder(pattern = "owned", setter(into)))]
- #[cfg_attr(feature = "builder", builder(pattern = "owned", setter(into)))]
- #[cfg_attr(feature = "builder", builder(pattern = "owned", setter(into)))]

### Gaps
- // TODO: Better name. This one comes from machine_message.rs

### Ouro Bruto (primeiros 5000 chars)
```
use super::{Diagnostic, PackageId, Target};
use camino::Utf8PathBuf;
#[cfg(feature = "builder")]
use derive_builder::Builder;
use serde::{de, ser, Deserialize, Serialize};
use std::fmt::{self, Write};
use std::io::{self, BufRead, Read};

/// Profile settings used to determine which compiler flags to use for a
/// target.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[cfg_attr(feature = "builder", derive(Builder))]
#[non_exhaustive]
#[cfg_attr(feature = "builder", builder(pattern = "owned", setter(into)))]
pub struct ArtifactProfile {
    /// Optimization level. Possible values are 0-3, s or z.
    pub opt_level: String,
    /// The kind of debug information.
    #[serde(default)]
    pub debuginfo: ArtifactDebuginfo,
    /// State of the `cfg(debug_assertions)` directive, enabling macros like
    /// `debug_assert!`
    pub debug_assertions: bool,
    /// State of the overflow checks.
    pub overflow_checks: bool,
    /// Whether this profile is a test
    pub test: bool,
}

/// The kind of debug information included in the artifact.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Default)]
#[non_exhaustive]
pub enum ArtifactDebuginfo {
    /// No debug information.
    #[default]
    None,
    /// Line directives only.
    LineDirectivesOnly,
    /// Line tables only.
    LineTablesOnly,
    /// Debug information without type or variable-level information.
    Limited,
    /// Full debug information.
    Full,
    /// An unknown integer level.
    ///
    /// This may be produced by a version of rustc in the future that has
    /// additional levels represented by an integer that are not known by this
    /// version of `cargo_metadata`.
    UnknownInt(i64),
    /// An unknown string level.
    ///
    /// This may be produced by a version of rustc in the future that has
    /// additional levels represented by a string that are not known by this
    /// version of `cargo_metadata`.
    UnknownString(String),
}

impl ser::Serialize for ArtifactDebuginfo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: ser::Serializer,
    {
        match self {
            Self::None => 0.serialize(serializer),
            Self::LineDirectivesOnly => "line-directives-only".serialize(serializer),
            Self::LineTablesOnly => "line-tables-only".serialize(serializer),
            Self::Limited => 1.serialize(serializer),
            Self::Full => 2.serialize(serializer),
            Self::UnknownInt(n) => n.serialize(serializer),
            Self::UnknownString(s) => s.serialize(serializer),
        }
    }
}

impl<'de> de::Deserialize<'de> for ArtifactDebuginfo {
    fn deserialize<D>(d: D) -> Result<ArtifactDebuginfo, D::Error>
    where
        D: de::Deserializer<'de>,
    {
        struct Visitor;

        impl de::Visitor<'_> for Visitor {
            type Value = ArtifactDebuginfo;

            fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
                formatter.write_str("an integer or string")
            }

            fn visit_i64<E>(self, value: i64) -> Result<ArtifactDebuginfo, E>
            where
                E: de::Error,
            {
                let debuginfo = match value {
                    0 => ArtifactDebuginfo::None,
                    1 => ArtifactDebuginfo::Limited,
                    2 => ArtifactDebuginfo::Full,
                    n => ArtifactDebuginfo::UnknownInt(n),
                };
                Ok(debuginfo)
            }

            fn visit_u64<E>(self, value: u64) -> Result<ArtifactDebuginfo, E>
            where
                E: de::Error,
            {
                self.visit_i64(value as i64)
            }

            fn visit_str<E>(self, value: &str) -> Result<ArtifactDebuginfo, E>
            where
                E: de::Error,
            {
                let debuginfo = match value {
                    "none" => ArtifactDebuginfo::None,
                    "limited" => ArtifactDebuginfo::Limited,
                    "full" => ArtifactDebuginfo::Full,
                    "line-directives-only" => ArtifactDebuginfo::LineDirectivesOnly,
                    "line-tables-only" => ArtifactDebuginfo::LineTablesOnly,
                    s => ArtifactDebuginfo::UnknownString(s.to_string()),
                };
                Ok(debuginfo)
            }

            fn visit_unit<E>(self) -> Result<ArtifactDebuginfo, E>
            where
                E: de::Error,
            {
                Ok(ArtifactDebuginfo::None)
            }
        }

        d.deserialize_any(Visitor)
    }
}

impl fmt::Display for ArtifactDebuginfo {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ArtifactDebuginfo::None => f.write_char('0'),
            ArtifactDebuginfo::Limited => f.write_char('1'),
            ArtifactDebuginfo::Full => f.write_char('2'),
            ArtifactDebuginfo::LineDirectivesOnly => f.write_str("line-directives-
```
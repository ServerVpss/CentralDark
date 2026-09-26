# CONTRATO - from-json-schema.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\src\v4\classic\from-json-schema.ts
**SHA:** 04907934e2ae504a
**Timestamp:** 2026-08-28T02:28:05.072928
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: uniqueItems is not supported
- // TODO: contains/minContains/maxContains are not supported

### Ouro Bruto (primeiros 5000 chars)
```
import type * as JSONSchema from "../core/json-schema.js";
import { type $ZodRegistry, globalRegistry } from "../core/registries.js";
import * as _checks from "./checks.js";
import * as _iso from "./iso.js";
import * as _schemas from "./schemas.js";
import type { ZodNumber, ZodString, ZodType } from "./schemas.js";

// Local z object to avoid circular dependency with ../index.js
const z = {
  ..._schemas,
  ..._checks,
  iso: _iso,
};

type JSONSchemaVersion = "draft-2020-12" | "draft-7" | "draft-4" | "openapi-3.0";

interface FromJSONSchemaParams {
  defaultTarget?: JSONSchemaVersion;
  registry?: $ZodRegistry<any>;
}

interface ConversionContext {
  version: JSONSchemaVersion;
  defs: Record<string, JSONSchema.JSONSchema>;
  refs: Map<string, ZodType>;
  processing: Set<string>;
  rootSchema: JSONSchema.JSONSchema;
  registry: $ZodRegistry<any>;
}

// Keys that are recognized and handled by the conversion logic
const RECOGNIZED_KEYS = /*@__PURE__*/ new Set([
  // Schema identification
  "$schema",
  "$ref",
  "$defs",
  "definitions",
  // Core schema keywords
  "$id",
  "id",
  "$comment",
  "$anchor",
  "$vocabulary",
  "$dynamicRef",
  "$dynamicAnchor",
  // Type
  "type",
  "enum",
  "const",
  // Composition
  "anyOf",
  "oneOf",
  "allOf",
  "not",
  // Object
  "properties",
  "required",
  "additionalProperties",
  "patternProperties",
  "propertyNames",
  "minProperties",
  "maxProperties",
  // Array
  "items",
  "prefixItems",
  "additionalItems",
  "minItems",
  "maxItems",
  "uniqueItems",
  "contains",
  "minContains",
  "maxContains",
  // String
  "minLength",
  "maxLength",
  "pattern",
  "format",
  // Number
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  // Already handled metadata
  "description",
  "default",
  // Content
  "contentEncoding",
  "contentMediaType",
  "contentSchema",
  // Unsupported (error-throwing)
  "unevaluatedItems",
  "unevaluatedProperties",
  "if",
  "then",
  "else",
  "dependentSchemas",
  "dependentRequired",
  // OpenAPI
  "nullable",
  "readOnly",
]);

function detectVersion(schema: JSONSchema.JSONSchema, defaultTarget?: JSONSchemaVersion): JSONSchemaVersion {
  const $schema = schema.$schema;

  if ($schema === "https://json-schema.org/draft/2020-12/schema") {
    return "draft-2020-12";
  }
  if ($schema === "http://json-schema.org/draft-07/schema#") {
    return "draft-7";
  }
  if ($schema === "http://json-schema.org/draft-04/schema#") {
    return "draft-4";
  }

  // Use defaultTarget if provided, otherwise default to draft-2020-12
  return defaultTarget ?? "draft-2020-12";
}

function resolveRef(ref: string, ctx: ConversionContext): JSONSchema.JSONSchema {
  if (!ref.startsWith("#")) {
    throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
  }

  const path = ref.slice(1).split("/").filter(Boolean);

  // Handle root reference "#"
  if (path.length === 0) {
    return ctx.rootSchema;
  }

  const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";

  if (path[0] === defsKey) {
    const key = path[1];
    if (!key || !ctx.defs[key]) {
      throw new Error(`Reference not found: ${ref}`);
    }
    return ctx.defs[key]!;
  }

  throw new Error(`Reference not found: ${ref}`);
}

function convertBaseSchema(schema: JSONSchema.JSONSchema, ctx: ConversionContext): ZodType {
  // Handle unsupported features
  if (schema.not !== undefined) {
    // Special case: { not: {} } represents never
    if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
      return z.never();
    }
    throw new Error("not is not supported in Zod (except { not: {} } for never)");
  }
  if (schema.unevaluatedItems !== undefined) {
    throw new Error("unevaluatedItems is not supported");
  }
  if (schema.unevaluatedProperties !== undefined) {
    throw new Error("unevaluatedProperties is not supported");
  }
  if (schema.if !== undefined || schema.then !== undefined || schema.else !== undefined) {
    throw new Error("Conditional schemas (if/then/else) are not supported");
  }
  if (schema.dependentSchemas !== undefined || schema.dependentRequired !== undefined) {
    throw new Error("dependentSchemas and dependentRequired are not supported");
  }

  // Handle $ref
  if (schema.$ref) {
    const refPath = schema.$ref;
    if (ctx.refs.has(refPath)) {
      return ctx.refs.get(refPath)!;
    }

    if (ctx.processing.has(refPath)) {
      // Circular reference - use lazy
      return z.lazy(() => {
        if (!ctx.refs.has(refPath)) {
          throw new Error(`Circular reference not resolved: ${refPath}`);
        }
        return ctx.refs.get(refPath)!;
      });
    }

    ctx.processing.add(refPath);
    const resolved = resolveRef(refPath, ctx);
    const zodSchema = convertSchema(resolved, ctx);
    ctx.refs.set(refPath, zodSchema);
    ctx.processing.delete(refPath);
    return zodSchema;
  }

  // Handle enum
  if (schema.enum !== undefined) {
    const e
```

---

# CONTRATO - from-json-schema.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\classic\from-json-schema.js
**SHA:** d8866bf5232e55d1
**Timestamp:** 2026-08-28T02:29:34.137012
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: uniqueItems is not supported
- // TODO: contains/minContains/maxContains are not supported

### Ouro Bruto (primeiros 5000 chars)
```
import { globalRegistry } from "../core/registries.js";
import * as _checks from "./checks.js";
import * as _iso from "./iso.js";
import * as _schemas from "./schemas.js";
// Local z object to avoid circular dependency with ../index.js
const z = {
    ..._schemas,
    ..._checks,
    iso: _iso,
};
// Keys that are recognized and handled by the conversion logic
const RECOGNIZED_KEYS = /*@__PURE__*/ new Set([
    // Schema identification
    "$schema",
    "$ref",
    "$defs",
    "definitions",
    // Core schema keywords
    "$id",
    "id",
    "$comment",
    "$anchor",
    "$vocabulary",
    "$dynamicRef",
    "$dynamicAnchor",
    // Type
    "type",
    "enum",
    "const",
    // Composition
    "anyOf",
    "oneOf",
    "allOf",
    "not",
    // Object
    "properties",
    "required",
    "additionalProperties",
    "patternProperties",
    "propertyNames",
    "minProperties",
    "maxProperties",
    // Array
    "items",
    "prefixItems",
    "additionalItems",
    "minItems",
    "maxItems",
    "uniqueItems",
    "contains",
    "minContains",
    "maxContains",
    // String
    "minLength",
    "maxLength",
    "pattern",
    "format",
    // Number
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    // Already handled metadata
    "description",
    "default",
    // Content
    "contentEncoding",
    "contentMediaType",
    "contentSchema",
    // Unsupported (error-throwing)
    "unevaluatedItems",
    "unevaluatedProperties",
    "if",
    "then",
    "else",
    "dependentSchemas",
    "dependentRequired",
    // OpenAPI
    "nullable",
    "readOnly",
]);
function detectVersion(schema, defaultTarget) {
    const $schema = schema.$schema;
    if ($schema === "https://json-schema.org/draft/2020-12/schema") {
        return "draft-2020-12";
    }
    if ($schema === "http://json-schema.org/draft-07/schema#") {
        return "draft-7";
    }
    if ($schema === "http://json-schema.org/draft-04/schema#") {
        return "draft-4";
    }
    // Use defaultTarget if provided, otherwise default to draft-2020-12
    return defaultTarget ?? "draft-2020-12";
}
function resolveRef(ref, ctx) {
    if (!ref.startsWith("#")) {
        throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
    }
    const path = ref.slice(1).split("/").filter(Boolean);
    // Handle root reference "#"
    if (path.length === 0) {
        return ctx.rootSchema;
    }
    const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";
    if (path[0] === defsKey) {
        const key = path[1];
        if (!key || !ctx.defs[key]) {
            throw new Error(`Reference not found: ${ref}`);
        }
        return ctx.defs[key];
    }
    throw new Error(`Reference not found: ${ref}`);
}
function convertBaseSchema(schema, ctx) {
    // Handle unsupported features
    if (schema.not !== undefined) {
        // Special case: { not: {} } represents never
        if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
            return z.never();
        }
        throw new Error("not is not supported in Zod (except { not: {} } for never)");
    }
    if (schema.unevaluatedItems !== undefined) {
        throw new Error("unevaluatedItems is not supported");
    }
    if (schema.unevaluatedProperties !== undefined) {
        throw new Error("unevaluatedProperties is not supported");
    }
    if (schema.if !== undefined || schema.then !== undefined || schema.else !== undefined) {
        throw new Error("Conditional schemas (if/then/else) are not supported");
    }
    if (schema.dependentSchemas !== undefined || schema.dependentRequired !== undefined) {
        throw new Error("dependentSchemas and dependentRequired are not supported");
    }
    // Handle $ref
    if (schema.$ref) {
        const refPath = schema.$ref;
        if (ctx.refs.has(refPath)) {
            return ctx.refs.get(refPath);
        }
        if (ctx.processing.has(refPath)) {
            // Circular reference - use lazy
            return z.lazy(() => {
                if (!ctx.refs.has(refPath)) {
                    throw new Error(`Circular reference not resolved: ${refPath}`);
                }
                return ctx.refs.get(refPath);
            });
        }
        ctx.processing.add(refPath);
        const resolved = resolveRef(refPath, ctx);
        const zodSchema = convertSchema(resolved, ctx);
        ctx.refs.set(refPath, zodSchema);
        ctx.processing.delete(refPath);
        return zodSchema;
    }
    // Handle enum
    if (schema.enum !== undefined) {
        const enumValues = schema.enum;
        // Special case: OpenAPI 3.0 null representation { type: "string", nullable: true, enum: [null] }
        if (ctx.version === "openapi-3.0" &&
            schema.nullable === true &&
            enumValues.length === 1 &&
            enumValues[0] === null) {
            return z.null();
        }
        if (enumVa
```

---

# CONTRATO - from-json-schema.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\classic\from-json-schema.cjs
**SHA:** f413701d8a2730e2
**Timestamp:** 2026-08-28T02:29:34.167645
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: uniqueItems is not supported
- // TODO: contains/minContains/maxContains are not supported

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromJSONSchema = fromJSONSchema;
const registries_js_1 = require("../core/registries.cjs");
const _checks = __importStar(require("./checks.cjs"));
const _iso = __importStar(require("./iso.cjs"));
const _schemas = __importStar(require("./schemas.cjs"));
// Local z object to avoid circular dependency with ../index.js
const z = {
    ..._schemas,
    ..._checks,
    iso: _iso,
};
// Keys that are recognized and handled by the conversion logic
const RECOGNIZED_KEYS = /*@__PURE__*/ new Set([
    // Schema identification
    "$schema",
    "$ref",
    "$defs",
    "definitions",
    // Core schema keywords
    "$id",
    "id",
    "$comment",
    "$anchor",
    "$vocabulary",
    "$dynamicRef",
    "$dynamicAnchor",
    // Type
    "type",
    "enum",
    "const",
    // Composition
    "anyOf",
    "oneOf",
    "allOf",
    "not",
    // Object
    "properties",
    "required",
    "additionalProperties",
    "patternProperties",
    "propertyNames",
    "minProperties",
    "maxProperties",
    // Array
    "items",
    "prefixItems",
    "additionalItems",
    "minItems",
    "maxItems",
    "uniqueItems",
    "contains",
    "minContains",
    "maxContains",
    // String
    "minLength",
    "maxLength",
    "pattern",
    "format",
    // Number
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    // Already handled metadata
    "description",
    "default",
    // Content
    "contentEncoding",
    "contentMediaType",
    "contentSchema",
    // Unsupported (error-throwing)
    "unevaluatedItems",
    "unevaluatedProperties",
    "if",
    "then",
    "else",
    "dependentSchemas",
    "dependentRequired",
    // OpenAPI
    "nullable",
    "readOnly",
]);
function detectVersion(schema, defaultTarget) {
    const $schema = schema.$schema;
    if ($schema === "https://json-schema.org/draft/2020-12/schema") {
        return "draft-2020-12";
    }
    if ($schema === "http://json-schema.org/draft-07/schema#") {
        return "draft-7";
    }
    if ($schema === "http://json-schema.org/draft-04/schema#") {
        return "draft-4";
    }
    // Use defaultTarget if provided, otherwise default to draft-2020-12
    return defaultTarget ?? "draft-2020-12";
}
function resolveRef(ref, ctx) {
    if (!ref.startsWith("#")) {
        throw new Error("External $ref is not supported, only local refs (#/...) are allowed");
    }
    const path = ref.slice(1).split("/").filter(Boolean);
    // Handle root reference "#"
    if (path.length === 0) {
        return ctx.rootSchema;
    }
    const defsKey = ctx.version === "draft-2020-12" ? "$defs" : "definitions";
    if (path[0] === defsKey) {
        const key = path[1];
        if (!key || !ctx.defs[key]) {
            throw new Error(`Reference not found: ${ref}`);
        }
        return ctx.defs[key];
    }
    throw new Error(`Reference not found: ${ref}`);
}
function convertBaseSchema(schema, ctx) {
    // Handle unsupported features
    if (schema.not !== undefined) {
        // Special case: { not: {} } represents never
        if (typeof schema.not === "object" && Object.keys(schema.not).length === 0) {
            return z.never();
        }
        throw new Error("not is not supported in Zod (except { not: {} } for never)");
    }
    if (schema.unevaluatedItems !== undefined) {
        throw new Error("unevaluatedItems is not supported");
    }
    if (schema.unevaluatedProperties !== undefined) {
        throw new Error("unevaluatedProperties is not supported");
    }
    if (schema.if !== undefined || schema.then !== undefined || schema.else !== undefined) {
        throw new Error("Conditional schemas (if/then/else) are not supported");
    }
    if (schema.dependentSchemas !== undefined || schema.dependentRequired !== undefined) {
        throw new Error("dependentSchemas and dependentRequired are not supported");
  
```
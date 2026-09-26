# OUTRO - json-schema-processors.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\src\v4\core\json-schema-processors.ts
**SHA:** 63ac0be9d3a6ff37
**Timestamp:** 2026-08-28T02:28:42.848984
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- if (regexes.length === 1) json.pattern = regexes[0]!.source;
- pattern: regex.source,
- const pattern = schema._zod.pattern;
- _json.pattern = pattern.source;

### Ouro Bruto (primeiros 5000 chars)
```
import type * as checks from "./checks.js";
import type * as JSONSchema from "./json-schema.js";
import type { $ZodRegistry } from "./registries.js";
import type * as schemas from "./schemas.js";
import {
  type Processor,
  type RegistryToJSONSchemaParams,
  type ToJSONSchemaParams,
  type ZodStandardJSONSchemaPayload,
  extractDefs,
  finalize,
  initializeContext,
  process,
} from "./to-json-schema.js";
import { getEnumValues } from "./util.js";

const formatMap: Partial<Record<checks.$ZodStringFormats, string | undefined>> = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: "", // do not set
};

// ==================== SIMPLE TYPE PROCESSORS ====================

export const stringProcessor: Processor<schemas.$ZodString> = (schema, ctx, _json, _params) => {
  const json = _json as JSONSchema.StringSchema;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding } = schema._zod
    .bag as schemas.$ZodStringInternals<unknown>["bag"];
  if (typeof minimum === "number") json.minLength = minimum;
  if (typeof maximum === "number") json.maxLength = maximum;
  // custom pattern overrides format
  if (format) {
    json.format = formatMap[format as checks.$ZodStringFormats] ?? format;
    if (json.format === "") delete json.format; // empty format is not valid

    // JSON Schema format: "time" requires a full time with offset or Z
    // z.iso.time() does not include timezone information, so format: "time" should never be used
    if (format === "time") {
      delete json.format;
    }
  }
  if (contentEncoding) json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const regexes = [...patterns];
    if (regexes.length === 1) json.pattern = regexes[0]!.source;
    else if (regexes.length > 1) {
      json.allOf = [
        ...regexes.map((regex) => ({
          ...(ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0"
            ? ({ type: "string" } as const)
            : {}),
          pattern: regex.source,
        })),
      ];
    }
  }
};

export const numberProcessor: Processor<schemas.$ZodNumber> = (schema, ctx, _json, _params) => {
  const json = _json as JSONSchema.NumberSchema | JSONSchema.IntegerSchema;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int")) json.type = "integer";
  else json.type = "number";

  // when both minimum and exclusiveMinimum exist, pick the more restrictive one
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";

  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }

  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }

  if (typeof multipleOf === "number") json.multipleOf = multipleOf;
};

export const booleanProcessor: Processor<schemas.$ZodBoolean> = (_schema, _ctx, json, _params) => {
  (json as JSONSchema.BooleanSchema).type = "boolean";
};

export const bigintProcessor: Processor<schemas.$ZodBigInt> = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("BigInt cannot be represented in JSON Schema");
  }
};

export const symbolProcessor: Processor<schemas.$ZodSymbol> = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Symbols cannot be represented in JSON Schema");
  }
};

export const nullProcessor: Processor<schemas.$ZodNull> = (_schema, ctx, json, _params) => {
  if (ctx.target === "openapi-3.0") {
    json.type = "string";
    json.nullable = true;
    json.enum = [null];
  } else {
    json.type = "null";
  }
};

export const undefinedProcessor: Processor<schemas.$ZodUndefined> = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Undefined cannot be represented in JSON Schema");
  }
};

export const voidProcessor: Processor<schemas.$ZodVoid> = (_schema, ctx, _json, _params) => {
  if (ctx.unrepresentable === "throw") {
    throw new Error("Void cannot be represented in JSON Schema");
  }
};

export const neverProcessor: Processor<schemas.$ZodNever> = (_schema, _ctx, json, _params) => {
  json.not = {};
};

export const anyProcessor: Processor<schemas.$ZodAny> = (_schema, _ctx, _json, _params) => {
  // empty schema accepts anything
};

expor
```

---

# OUTRO - json-schema-processors.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\core\json-schema-processors.cjs
**SHA:** 9b3cc9d0421b45ff
**Timestamp:** 2026-08-28T02:29:50.258688
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- json.pattern = regexes[0].source;
- pattern: regex.source,
- const pattern = schema._zod.pattern;
- _json.pattern = pattern.source;

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allProcessors = exports.lazyProcessor = exports.optionalProcessor = exports.promiseProcessor = exports.readonlyProcessor = exports.pipeProcessor = exports.catchProcessor = exports.prefaultProcessor = exports.defaultProcessor = exports.nonoptionalProcessor = exports.nullableProcessor = exports.recordProcessor = exports.tupleProcessor = exports.intersectionProcessor = exports.unionProcessor = exports.objectProcessor = exports.arrayProcessor = exports.setProcessor = exports.mapProcessor = exports.transformProcessor = exports.functionProcessor = exports.customProcessor = exports.successProcessor = exports.fileProcessor = exports.templateLiteralProcessor = exports.nanProcessor = exports.literalProcessor = exports.enumProcessor = exports.dateProcessor = exports.unknownProcessor = exports.anyProcessor = exports.neverProcessor = exports.voidProcessor = exports.undefinedProcessor = exports.nullProcessor = exports.symbolProcessor = exports.bigintProcessor = exports.booleanProcessor = exports.numberProcessor = exports.stringProcessor = void 0;
exports.toJSONSchema = toJSONSchema;
const to_json_schema_js_1 = require("./to-json-schema.cjs");
const util_js_1 = require("./util.cjs");
const formatMap = {
    guid: "uuid",
    url: "uri",
    datetime: "date-time",
    json_string: "json-string",
    regex: "", // do not set
};
// ==================== SIMPLE TYPE PROCESSORS ====================
const stringProcessor = (schema, ctx, _json, _params) => {
    const json = _json;
    json.type = "string";
    const { minimum, maximum, format, patterns, contentEncoding } = schema._zod
        .bag;
    if (typeof minimum === "number")
        json.minLength = minimum;
    if (typeof maximum === "number")
        json.maxLength = maximum;
    // custom pattern overrides format
    if (format) {
        json.format = formatMap[format] ?? format;
        if (json.format === "")
            delete json.format; // empty format is not valid
        // JSON Schema format: "time" requires a full time with offset or Z
        // z.iso.time() does not include timezone information, so format: "time" should never be used
        if (format === "time") {
            delete json.format;
        }
    }
    if (contentEncoding)
        json.contentEncoding = contentEncoding;
    if (patterns && patterns.size > 0) {
        const regexes = [...patterns];
        if (regexes.length === 1)
            json.pattern = regexes[0].source;
        else if (regexes.length > 1) {
            json.allOf = [
                ...regexes.map((regex) => ({
                    ...(ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0"
                        ? { type: "string" }
                        : {}),
                    pattern: regex.source,
                })),
            ];
        }
    }
};
exports.stringProcessor = stringProcessor;
const numberProcessor = (schema, ctx, _json, _params) => {
    const json = _json;
    const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
    if (typeof format === "string" && format.includes("int"))
        json.type = "integer";
    else
        json.type = "number";
    // when both minimum and exclusiveMinimum exist, pick the more restrictive one
    const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
    const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
    const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
    if (exMin) {
        if (legacy) {
            json.minimum = exclusiveMinimum;
            json.exclusiveMinimum = true;
        }
        else {
            json.exclusiveMinimum = exclusiveMinimum;
        }
    }
    else if (typeof minimum === "number") {
        json.minimum = minimum;
    }
    if (exMax) {
        if (legacy) {
            json.maximum = exclusiveMaximum;
            json.exclusiveMaximum = true;
        }
        else {
            json.exclusiveMaximum = exclusiveMaximum;
        }
    }
    else if (typeof maximum === "number") {
        json.maximum = maximum;
    }
    if (typeof multipleOf === "number")
        json.multipleOf = multipleOf;
};
exports.numberProcessor = numberProcessor;
const booleanProcessor = (_schema, _ctx, json, _params) => {
    json.type = "boolean";
};
exports.booleanProcessor = booleanProcessor;
const bigintProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("BigInt cannot be represented in JSON Schema");
    }
};
exports.bigintProcessor = bigintProcessor;
const symbolProcessor = (_schema, ctx, _json, _params) => {
    if (ctx.unrepresentable === "throw") {
        throw new Error("Symbols cannot be represented in JSON Schema");
    }
};
exports.symbolProcessor = symbolProcessor;

```
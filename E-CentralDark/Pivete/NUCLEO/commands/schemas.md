# COMANDO - schemas.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\pi-subagents@0.57.0@@@1\src\extension\schemas.ts
**SHA:** 14b5769f3ac10be7
**Timestamp:** 2026-08-28T02:24:52.167682
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- agentContract: Type.Optional(AgentContractOverride),
- agentContract: Type.Optional(AgentContractOverride),
- agentContract: Type.Optional(AgentContractOverride),
- agentContract: Type.Optional(AgentContractOverride),
- gate: Type.Optional(Type.String({ minLength: 1, description: "Host gate command. Cannot be combined with acceptance." })),

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * TypeBox schemas for subagent tool parameters
 */

import { Type } from "typebox";

function keepTopLevelParameterDescriptions<T>(schema: T): T {
	return pruneNestedDescriptions(schema, []) as T;
}

function pruneNestedDescriptions(value: unknown, path: string[]): unknown {
	if (!value || typeof value !== "object") return value;

	const result = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
	for (const key of Reflect.ownKeys(value)) {
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		if (!descriptor) continue;
		if (key === "description" && !isTopLevelParameterDescription(path)) continue;
		if ("value" in descriptor) {
			const nextPath = typeof key === "string" ? [...path, key] : path;
			descriptor.value = pruneNestedDescriptions(descriptor.value, nextPath);
		}
		Object.defineProperty(result, key, descriptor);
	}
	return result;
}

function isTopLevelParameterDescription(path: string[]): boolean {
	return path.length === 2 && path[0] === "properties";
}

const SkillOverride = Type.Unsafe({
	anyOf: [
		{ type: "array", items: { type: "string" } },
		{ type: "boolean" },
		{ type: "string" },
	],
	description: "Skill name(s) to make available (comma-separated), array of strings, or boolean (false disables, true uses default)",
});

const OutputOverride = Type.Unsafe({
	anyOf: [
		{ type: "string" },
		{ type: "boolean" },
	],
	description: "Output filename/path (string), or false to disable file output",
});

const OutputModeOverride = Type.String({
	enum: ["inline", "file-only"],
	description: "Return saved output inline (default) or only a concise file reference. file-only requires output to be a path.",
});

const ReadsOverride = Type.Unsafe({
	anyOf: [
		{ type: "array", items: { type: "string" } },
		{ type: "boolean" },
	],
	description: "Files to read before running (array of filenames), or false to disable",
});

const JsonSchemaObject = Type.Unsafe({
	type: "object",
	additionalProperties: true,
	description: "JSON Schema object for strict structured output. Non-object roots are rejected.",
});

const AcceptanceEvidenceKinds = [
	"changed-files",
	"tests-added",
	"commands-run",
	"validation-output",
	"residual-risks",
	"no-staged-files",
	"diff-summary",
	"review-findings",
	"manual-notes",
];

const AcceptanceOverride = Type.Unsafe({
	anyOf: [
		{ type: "string", enum: ["auto", "attested", "checked"] },
		{
			type: "string",
			enum: ["reviewed"],
			deprecated: true,
			description: "Invalid as an explicit policy. Recognized only so preflight can explain that reviewed is an achieved status.",
		},
		{ type: "boolean", enum: [false] },
		{ type: "object", additionalProperties: true },
	],
	description: `Optional acceptance policy. For reviewer/read-only calls, omit acceptance. Example: { level: "checked", evidence: ["commands-run", "changed-files"] }. Supported evidence kinds: ${AcceptanceEvidenceKinds.join(", ")}. Evidence levels end at verified; use acceptance.review.required for review. Omitted means auto-inferred unless agentContract compatibility behavior is enabled.`,
});

const AgentContractOverride = Type.Object({
	version: Type.Integer({ minimum: 1, maximum: 1, description: "Enable compatibility behavior for this run/child." }),
}, { additionalProperties: false, description: "Compatibility behavior. Omit for the default behavior." });

const ChainGateOverride = Type.String({
	enum: ["execution", "acceptance"],
	description: "For chain steps with agentContract, choose whether the chain advances on execution success or acceptance success. Defaults to execution.",
});

const TurnBudgetOverride = Type.Object({
	maxTurns: Type.Integer({ minimum: 1 }),
	graceTurns: Type.Optional(Type.Integer({ minimum: 0 })),
}, { additionalProperties: false, description: "Optional assistant-turn budget. At maxTurns the child is asked to wrap up; after graceTurns additional assistant turns it is aborted and partial output is returned." });

const ToolBudgetBlock = Type.Unsafe({
	anyOf: [
		{ type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
		{ type: "string", enum: ["*"] },
	],
});

const ToolBudgetOverride = Type.Object({
	soft: Type.Optional(Type.Integer({ minimum: 1 })),
	hard: Type.Integer({ minimum: 1 }),
	block: Type.Optional(ToolBudgetBlock),
}, { additionalProperties: false, description: "Optional child tool-call budget. soft nudges the child; after hard, block tools (default read/grep/find/ls, or '*' for all tools) are blocked so the child can finalize." });

const UsageBudgetLimitOverride = Type.Object({
	soft: Type.Optional(Type.Number({ exclusiveMinimum: 0 })),
	hard: Type.Number({ exclusiveMinimum: 0 }),
}, { additionalProperties: false });

const UsageBudgetOverride = Type.Object({
	tokens: Type.Optional(UsageBudgetLimitOverride),
	costUsd: Type.Optional(UsageBudgetLimitOverride),
}, { additionalProperties: false, description: "Optional root-only reported-usage budget. Hard limits prevent future child launches; running chi
```

---

# COMANDO - schemas.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\src\v4\core\schemas.ts
**SHA:** 934bc0ff4312a3e8
**Timestamp:** 2026-08-28T02:28:43.907711
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- inst._zod.run = inst._zod.parse;
- const shouldRun = ch._zod.def.when(payload);
- inst._zod.run = (payload, ctx) => {
- const first = def.options.length === 1 ? def.options[0]._zod.run : null;
- const first = def.options.length === 1 ? def.options[0]._zod.run : null;
- const optinStart = getTupleOptStart(items, "optin");
- const optoutStart = getTupleOptStart(items, "optout");
- optoutStart: number
- const start = source.startsWith("^") ? 1 : 0;

### Padroes
- pattern: RegExp | undefined;
- pattern: RegExp;
- inst._zod.pattern = [...(inst?._zod.bag?.patterns ?? [])].pop() ?? regexes.string(inst._zod.bag);
- pattern: def.hostname.source,
- pattern: def.protocol.source,
- pattern: RegExp;
- pattern: RegExp;
- inst._zod.pattern = inst._zod.bag.pattern ?? regexes.number;
- pattern: RegExp;
- inst._zod.pattern = regexes.boolean;

### Gaps
- * Todo: unions?

### Ouro Bruto (primeiros 5000 chars)
```
import type { $ZodTypeDiscriminable } from "./api.js";
import * as checks from "./checks.js";
import * as core from "./core.js";
import { Doc } from "./doc.js";
import type * as errors from "./errors.js";
import type * as JSONSchema from "./json-schema.js";
import { parse, parseAsync, safeParse, safeParseAsync } from "./parse.js";
import * as regexes from "./regexes.js";
import type { StandardSchemaV1 } from "./standard-schema.js";
import type { ProcessParams, ToJSONSchemaContext } from "./to-json-schema.js";
import * as util from "./util.js";
import { version } from "./versions.js";

/////////////////////////////   PARSE   //////////////////////////////

export interface ParseContext<T extends errors.$ZodIssueBase = never> {
  /** Customize error messages. */
  readonly error?: errors.$ZodErrorMap<T>;
  /** Include the `input` field in issue objects. Default `false`. */
  readonly reportInput?: boolean;
  /** Skip eval-based fast path. Default `false`. */
  readonly jitless?: boolean;
  /** Abort validation after the first error. Default `false`. */
  // readonly abortEarly?: boolean;
}

/** @internal */
export interface ParseContextInternal<T extends errors.$ZodIssueBase = never> extends ParseContext<T> {
  readonly async?: boolean | undefined;
  readonly direction?: "forward" | "backward";
  readonly skipChecks?: boolean;
}

export interface ParsePayload<T = unknown> {
  value: T;
  issues: errors.$ZodRawIssue[];
  /** A way to mark a whole payload as aborted. Used in codecs/pipes. */
  aborted?: boolean;
  /** @internal Marks a value as a fallback that an outer wrapper (e.g.
   * $ZodOptional) may override with its own interpretation when input was
   * undefined. Set by $ZodCatch when catchValue substitutes and by every
   * $ZodTransform invocation. */
  fallback?: boolean | undefined;
}

export type CheckFn<T> = (input: ParsePayload<T>) => util.MaybeAsync<void>;

/////////////////////////////   SCHEMAS   //////////////////////////////

export interface $ZodTypeDef {
  type:
    | "string"
    | "number"
    | "int"
    | "boolean"
    | "bigint"
    | "symbol"
    | "null"
    | "undefined"
    | "void" // merge with undefined?
    | "never"
    | "any"
    | "unknown"
    | "date"
    | "object"
    | "record"
    | "file"
    | "array"
    | "tuple"
    | "union"
    | "intersection"
    | "map"
    | "set"
    | "enum"
    | "literal"
    | "nullable"
    | "optional"
    | "nonoptional"
    | "success"
    | "transform"
    | "default"
    | "prefault"
    | "catch"
    | "nan"
    | "pipe"
    | "readonly"
    | "template_literal"
    | "promise"
    | "lazy"
    | "function"
    | "custom";
  error?: errors.$ZodErrorMap<never> | undefined;
  checks?: checks.$ZodCheck<never>[];
}

export interface _$ZodTypeInternals {
  /** The `@zod/core` version of this schema */
  version: typeof version;

  /** Schema definition. */
  def: $ZodTypeDef;
  // types: Types;

  /** @internal Randomly generated ID for this schema. */
  // id: string;

  /** @internal List of deferred initializers. */
  deferred: util.AnyFunc[] | undefined;

  /** @internal Parses input and runs all checks (refinements). */
  run(payload: ParsePayload<any>, ctx: ParseContextInternal): util.MaybeAsync<ParsePayload>;

  /** @internal Parses input, doesn't run checks. */
  parse(payload: ParsePayload<any>, ctx: ParseContextInternal): util.MaybeAsync<ParsePayload>;

  /** @internal  Stores identifiers for the set of traits implemented by this schema. */
  traits: Set<string>;

  /** @internal Indicates that a schema output type should be considered optional inside objects.
   * @default Required
   */

  /** @internal */
  optin?: "optional" | undefined;
  /** @internal */
  optout?: "optional" | undefined;

  /** @internal The set of literal values that will pass validation. Must be an exhaustive set. Used to determine optionality in z.record().
   *
   * Defined on: enum, const, literal, null, undefined
   * Passthrough: optional, nullable, branded, default, catch, pipe
   * Todo: unions?
   */
  values?: util.PrimitiveSet | undefined;

  /** Default value bubbled up from  */
  // default?: unknown | undefined;

  /** @internal A set of literal discriminators used for the fast path in discriminated unions. */
  propValues?: util.PropValues | undefined;

  /** @internal This flag indicates that a schema validation can be represented with a regular expression. Used to determine allowable schemas in z.templateLiteral(). */
  pattern: RegExp | undefined;

  /** @internal The constructor function of this schema. */
  constr: new (
    def: any
  ) => $ZodType;

  /** @internal A catchall object for bag metadata related to this schema. Commonly modified by checks using `onattach`. */
  bag: Record<string, unknown>;

  /** @internal The set of issues this schema might throw during type checking. */
  isst: errors.$ZodIssueBase;

  /** @internal Subject to change, not a public API. */
  processJSONSchema?:
    | ((ctx: ToJSONSchemaContext, 
```

---

# COMANDO - schemas.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\core\schemas.cjs
**SHA:** cd1cd83d15bb681f
**Timestamp:** 2026-08-28T02:29:56.758318
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- inst._zod.run = inst._zod.parse;
- const shouldRun = ch._zod.def.when(payload);
- inst._zod.run = (payload, ctx) => {
- const first = def.options.length === 1 ? def.options[0]._zod.run : null;
- const first = def.options.length === 1 ? def.options[0]._zod.run : null;
- const optinStart = getTupleOptStart(items, "optin");
- const optoutStart = getTupleOptStart(items, "optout");
- const start = source.startsWith("^") ? 1 : 0;

### Padroes
- inst._zod.pattern = [...(inst?._zod.bag?.patterns ?? [])].pop() ?? regexes.string(inst._zod.bag);
- def.pattern ?? (def.pattern = regexes.guid);
- def.pattern ?? (def.pattern = regexes.uuid(v));
- def.pattern ?? (def.pattern = regexes.uuid());
- def.pattern ?? (def.pattern = regexes.email);
- pattern: def.hostname.source,
- pattern: def.protocol.source,
- def.pattern ?? (def.pattern = regexes.emoji());
- def.pattern ?? (def.pattern = regexes.nanoid);
- def.pattern ?? (def.pattern = regexes.cuid);

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
exports.$ZodTuple = exports.$ZodIntersection = exports.$ZodDiscriminatedUnion = exports.$ZodXor = exports.$ZodUnion = exports.$ZodObjectJIT = exports.$ZodObject = exports.$ZodArray = exports.$ZodDate = exports.$ZodVoid = exports.$ZodNever = exports.$ZodUnknown = exports.$ZodAny = exports.$ZodNull = exports.$ZodUndefined = exports.$ZodSymbol = exports.$ZodBigIntFormat = exports.$ZodBigInt = exports.$ZodBoolean = exports.$ZodNumberFormat = exports.$ZodNumber = exports.$ZodCustomStringFormat = exports.$ZodJWT = exports.$ZodE164 = exports.$ZodBase64URL = exports.$ZodBase64 = exports.$ZodCIDRv6 = exports.$ZodCIDRv4 = exports.$ZodMAC = exports.$ZodIPv6 = exports.$ZodIPv4 = exports.$ZodISODuration = exports.$ZodISOTime = exports.$ZodISODate = exports.$ZodISODateTime = exports.$ZodKSUID = exports.$ZodXID = exports.$ZodULID = exports.$ZodCUID2 = exports.$ZodCUID = exports.$ZodNanoID = exports.$ZodEmoji = exports.$ZodURL = exports.$ZodEmail = exports.$ZodUUID = exports.$ZodGUID = exports.$ZodStringFormat = exports.$ZodString = exports.clone = exports.$ZodType = void 0;
exports.$ZodCustom = exports.$ZodLazy = exports.$ZodPromise = exports.$ZodFunction = exports.$ZodTemplateLiteral = exports.$ZodReadonly = exports.$ZodPreprocess = exports.$ZodCodec = exports.$ZodPipe = exports.$ZodNaN = exports.$ZodCatch = exports.$ZodSuccess = exports.$ZodNonOptional = exports.$ZodPrefault = exports.$ZodDefault = exports.$ZodNullable = exports.$ZodExactOptional = exports.$ZodOptional = exports.$ZodTransform = exports.$ZodFile = exports.$ZodLiteral = exports.$ZodEnum = exports.$ZodSet = exports.$ZodMap = exports.$ZodRecord = void 0;
exports.isValidBase64 = isValidBase64;
exports.isValidBase64URL = isValidBase64URL;
exports.isValidJWT = isValidJWT;
const checks = __importStar(require("./checks.cjs"));
const core = __importStar(require("./core.cjs"));
const doc_js_1 = require("./doc.cjs");
const parse_js_1 = require("./parse.cjs");
const regexes = __importStar(require("./regexes.cjs"));
const util = __importStar(require("./util.cjs"));
const versions_js_1 = require("./versions.cjs");
exports.$ZodType = core.$constructor("$ZodType", (inst, def) => {
    var _a;
    inst ?? (inst = {});
    inst._zod.def = def; // set _def property
    inst._zod.bag = inst._zod.bag || {}; // initialize _bag object
    inst._zod.version = versions_js_1.version;
    const checks = [...(inst._zod.def.checks ?? [])];
    // if inst is itself a checks.$ZodCheck, run it as a check
    if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
    }
    for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
            fn(inst);
        }
    }
    if (checks.length === 0) {
        // deferred initializer
        // inst._zod.parse is not yet defined
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        inst._zod.deferred?.push(() => {
            inst._zod.run = inst._zod.parse;
        });
    }
    else {
        const runChecks = (payload, checks, ctx) => {
            let isAborted = util.aborted(payload);
            let asyncResult;
            for (const ch of checks) {
                if (ch._zod.def.when) {
                    if (util.explicitlyAborted(payload))
                        continue;
                    const shouldRun = ch._zod.def.when(payload);
                    if (!shouldRun)
                        continue;
                }
                else if (isAborted) {
                    continue;
                }
                const currLen = payload.issues.length;
                const _ = ch._zod.check(payload);
                if (_ instanceof Promise && ctx?.async === false) {
                    throw new core.$ZodAsyncError();
                }
                if (asyncResult || _ instanceof Promise) {
                    asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                
```

---

# COMANDO - schemas.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\core\schemas.js
**SHA:** 09da9b0cb9b9d2d7
**Timestamp:** 2026-08-28T02:29:56.819984
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- inst._zod.run = inst._zod.parse;
- const shouldRun = ch._zod.def.when(payload);
- inst._zod.run = (payload, ctx) => {
- const first = def.options.length === 1 ? def.options[0]._zod.run : null;
- const first = def.options.length === 1 ? def.options[0]._zod.run : null;
- const optinStart = getTupleOptStart(items, "optin");
- const optoutStart = getTupleOptStart(items, "optout");
- const start = source.startsWith("^") ? 1 : 0;

### Padroes
- inst._zod.pattern = [...(inst?._zod.bag?.patterns ?? [])].pop() ?? regexes.string(inst._zod.bag);
- def.pattern ?? (def.pattern = regexes.guid);
- def.pattern ?? (def.pattern = regexes.uuid(v));
- def.pattern ?? (def.pattern = regexes.uuid());
- def.pattern ?? (def.pattern = regexes.email);
- pattern: def.hostname.source,
- pattern: def.protocol.source,
- def.pattern ?? (def.pattern = regexes.emoji());
- def.pattern ?? (def.pattern = regexes.nanoid);
- def.pattern ?? (def.pattern = regexes.cuid);

### Ouro Bruto (primeiros 5000 chars)
```
import * as checks from "./checks.js";
import * as core from "./core.js";
import { Doc } from "./doc.js";
import { parse, parseAsync, safeParse, safeParseAsync } from "./parse.js";
import * as regexes from "./regexes.js";
import * as util from "./util.js";
import { version } from "./versions.js";
export const $ZodType = /*@__PURE__*/ core.$constructor("$ZodType", (inst, def) => {
    var _a;
    inst ?? (inst = {});
    inst._zod.def = def; // set _def property
    inst._zod.bag = inst._zod.bag || {}; // initialize _bag object
    inst._zod.version = version;
    const checks = [...(inst._zod.def.checks ?? [])];
    // if inst is itself a checks.$ZodCheck, run it as a check
    if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
    }
    for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
            fn(inst);
        }
    }
    if (checks.length === 0) {
        // deferred initializer
        // inst._zod.parse is not yet defined
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        inst._zod.deferred?.push(() => {
            inst._zod.run = inst._zod.parse;
        });
    }
    else {
        const runChecks = (payload, checks, ctx) => {
            let isAborted = util.aborted(payload);
            let asyncResult;
            for (const ch of checks) {
                if (ch._zod.def.when) {
                    if (util.explicitlyAborted(payload))
                        continue;
                    const shouldRun = ch._zod.def.when(payload);
                    if (!shouldRun)
                        continue;
                }
                else if (isAborted) {
                    continue;
                }
                const currLen = payload.issues.length;
                const _ = ch._zod.check(payload);
                if (_ instanceof Promise && ctx?.async === false) {
                    throw new core.$ZodAsyncError();
                }
                if (asyncResult || _ instanceof Promise) {
                    asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                        await _;
                        const nextLen = payload.issues.length;
                        if (nextLen === currLen)
                            return;
                        if (!isAborted)
                            isAborted = util.aborted(payload, currLen);
                    });
                }
                else {
                    const nextLen = payload.issues.length;
                    if (nextLen === currLen)
                        continue;
                    if (!isAborted)
                        isAborted = util.aborted(payload, currLen);
                }
            }
            if (asyncResult) {
                return asyncResult.then(() => {
                    return payload;
                });
            }
            return payload;
        };
        const handleCanaryResult = (canary, payload, ctx) => {
            // abort if the canary is aborted
            if (util.aborted(canary)) {
                canary.aborted = true;
                return canary;
            }
            // run checks first, then
            const checkResult = runChecks(payload, checks, ctx);
            if (checkResult instanceof Promise) {
                if (ctx.async === false)
                    throw new core.$ZodAsyncError();
                return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
            }
            return inst._zod.parse(checkResult, ctx);
        };
        inst._zod.run = (payload, ctx) => {
            if (ctx.skipChecks) {
                return inst._zod.parse(payload, ctx);
            }
            if (ctx.direction === "backward") {
                // run canary
                // initial pass (no checks)
                const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
                if (canary instanceof Promise) {
                    return canary.then((canary) => {
                        return handleCanaryResult(canary, payload, ctx);
                    });
                }
                return handleCanaryResult(canary, payload, ctx);
            }
            // forward
            const result = inst._zod.parse(payload, ctx);
            if (result instanceof Promise) {
                if (ctx.async === false)
                    throw new core.$ZodAsyncError();
                return result.then((result) => runChecks(result, checks, ctx));
            }
            return runChecks(result, checks, ctx);
        };
    }
    // Lazy initialize ~standard to avoid creating objects for every schema
    util.defineLazy(inst, "~standard", () => ({
        validate: (value) => {
            try {
                const r = safeParse(inst, value);
                return r.success ? { value: r.data } : { issues: r.error?.issues };
            }
            catch (_) {
                return safeP
```
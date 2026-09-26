# OUTRO - schemas.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\core\schemas.d.ts
**SHA:** 9707b90e703e8063
**Timestamp:** 2026-08-28T02:29:57.062664
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: RegExp | undefined;
- pattern: RegExp;
- pattern: RegExp;
- pattern: RegExp;
- pattern: RegExp;
- pattern: RegExp;
- pattern: RegExp;
- pattern: RegExp;
- pattern: T[number]["_zod"]["pattern"];
- pattern: RegExp;

### Gaps
- * Todo: unions?

### Ouro Bruto (primeiros 5000 chars)
```
import * as checks from "./checks.js";
import * as core from "./core.js";
import type * as errors from "./errors.js";
import type * as JSONSchema from "./json-schema.js";
import type { StandardSchemaV1 } from "./standard-schema.js";
import type { ProcessParams, ToJSONSchemaContext } from "./to-json-schema.js";
import * as util from "./util.js";
import { version } from "./versions.js";
export interface ParseContext<T extends errors.$ZodIssueBase = never> {
    /** Customize error messages. */
    readonly error?: errors.$ZodErrorMap<T>;
    /** Include the `input` field in issue objects. Default `false`. */
    readonly reportInput?: boolean;
    /** Skip eval-based fast path. Default `false`. */
    readonly jitless?: boolean;
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
export interface $ZodTypeDef {
    type: "string" | "number" | "int" | "boolean" | "bigint" | "symbol" | "null" | "undefined" | "void" | "never" | "any" | "unknown" | "date" | "object" | "record" | "file" | "array" | "tuple" | "union" | "intersection" | "map" | "set" | "enum" | "literal" | "nullable" | "optional" | "nonoptional" | "success" | "transform" | "default" | "prefault" | "catch" | "nan" | "pipe" | "readonly" | "template_literal" | "promise" | "lazy" | "function" | "custom";
    error?: errors.$ZodErrorMap<never> | undefined;
    checks?: checks.$ZodCheck<never>[];
}
export interface _$ZodTypeInternals {
    /** The `@zod/core` version of this schema */
    version: typeof version;
    /** Schema definition. */
    def: $ZodTypeDef;
    /** @internal Randomly generated ID for this schema. */
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
    /** @internal A set of literal discriminators used for the fast path in discriminated unions. */
    propValues?: util.PropValues | undefined;
    /** @internal This flag indicates that a schema validation can be represented with a regular expression. Used to determine allowable schemas in z.templateLiteral(). */
    pattern: RegExp | undefined;
    /** @internal The constructor function of this schema. */
    constr: new (def: any) => $ZodType;
    /** @internal A catchall object for bag metadata related to this schema. Commonly modified by checks using `onattach`. */
    bag: Record<string, unknown>;
    /** @internal The set of issues this schema might throw during type checking. */
    isst: errors.$ZodIssueBase;
    /** @internal Subject to change, not a public API. */
    processJSONSchema?: ((ctx: ToJSONSchemaContext, json: JSONSchema.BaseSchema, params: ProcessParams) => void) | undefined;
    /** An optional method used to override `toJSONSchema` logic. */
    toJSONSchema?: () => unknown;
    /** @internal The parent of this schema. Only set during certain clone operations. */
    parent?: $ZodType | undefined;
}
/** @internal */
export interface $ZodTypeInternals<out O = unknown, out I = unknown> extends _$ZodTypeInternals {
    /** @internal The inferred output type */
    output: O;
    /** @internal The inferred input type */
    input: I;
}
export type $ZodStandardSchema<T> = StandardSchemaV1.Props<core.input<T>, core.outp
`````
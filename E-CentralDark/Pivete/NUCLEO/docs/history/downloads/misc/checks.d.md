# OUTRO - checks.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\core\checks.d.ts
**SHA:** 3dcbd5e8de435c80
**Timestamp:** 2026-08-28T02:29:47.902338
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: RegExp;

### Ouro Bruto (primeiros 5000 chars)
```
import * as core from "./core.js";
import type * as errors from "./errors.js";
import type * as schemas from "./schemas.js";
import * as util from "./util.js";
export interface $ZodCheckDef {
    check: string;
    error?: errors.$ZodErrorMap<never> | undefined;
    /** If true, no later checks will be executed if this check fails. Default `false`. */
    abort?: boolean | undefined;
    /** If provided, the check runs only when this returns `true`. By default, it is skipped if prior parsing produced aborting issues. */
    when?: ((payload: schemas.ParsePayload) => boolean) | undefined;
}
export interface $ZodCheckInternals<T> {
    def: $ZodCheckDef;
    /** The set of issues this check might throw. */
    issc?: errors.$ZodIssueBase;
    check(payload: schemas.ParsePayload<T>): util.MaybeAsync<void>;
    onattach: ((schema: schemas.$ZodType) => void)[];
}
export interface $ZodCheck<in T = never> {
    _zod: $ZodCheckInternals<T>;
}
export declare const $ZodCheck: core.$constructor<$ZodCheck<any>>;
export interface $ZodCheckLessThanDef extends $ZodCheckDef {
    check: "less_than";
    value: util.Numeric;
    inclusive: boolean;
}
export interface $ZodCheckLessThanInternals<T extends util.Numeric = util.Numeric> extends $ZodCheckInternals<T> {
    def: $ZodCheckLessThanDef;
    issc: errors.$ZodIssueTooBig<T>;
}
export interface $ZodCheckLessThan<T extends util.Numeric = util.Numeric> extends $ZodCheck<T> {
    _zod: $ZodCheckLessThanInternals<T>;
}
export declare const $ZodCheckLessThan: core.$constructor<$ZodCheckLessThan>;
export interface $ZodCheckGreaterThanDef extends $ZodCheckDef {
    check: "greater_than";
    value: util.Numeric;
    inclusive: boolean;
}
export interface $ZodCheckGreaterThanInternals<T extends util.Numeric = util.Numeric> extends $ZodCheckInternals<T> {
    def: $ZodCheckGreaterThanDef;
    issc: errors.$ZodIssueTooSmall<T>;
}
export interface $ZodCheckGreaterThan<T extends util.Numeric = util.Numeric> extends $ZodCheck<T> {
    _zod: $ZodCheckGreaterThanInternals<T>;
}
export declare const $ZodCheckGreaterThan: core.$constructor<$ZodCheckGreaterThan>;
export interface $ZodCheckMultipleOfDef<T extends number | bigint = number | bigint> extends $ZodCheckDef {
    check: "multiple_of";
    value: T;
}
export interface $ZodCheckMultipleOfInternals<T extends number | bigint = number | bigint> extends $ZodCheckInternals<T> {
    def: $ZodCheckMultipleOfDef<T>;
    issc: errors.$ZodIssueNotMultipleOf;
}
export interface $ZodCheckMultipleOf<T extends number | bigint = number | bigint> extends $ZodCheck<T> {
    _zod: $ZodCheckMultipleOfInternals<T>;
}
export declare const $ZodCheckMultipleOf: core.$constructor<$ZodCheckMultipleOf<number | bigint>>;
export type $ZodNumberFormats = "int32" | "uint32" | "float32" | "float64" | "safeint";
export interface $ZodCheckNumberFormatDef extends $ZodCheckDef {
    check: "number_format";
    format: $ZodNumberFormats;
}
export interface $ZodCheckNumberFormatInternals extends $ZodCheckInternals<number> {
    def: $ZodCheckNumberFormatDef;
    issc: errors.$ZodIssueInvalidType | errors.$ZodIssueTooBig<"number"> | errors.$ZodIssueTooSmall<"number">;
}
export interface $ZodCheckNumberFormat extends $ZodCheck<number> {
    _zod: $ZodCheckNumberFormatInternals;
}
export declare const $ZodCheckNumberFormat: core.$constructor<$ZodCheckNumberFormat>;
export type $ZodBigIntFormats = "int64" | "uint64";
export interface $ZodCheckBigIntFormatDef extends $ZodCheckDef {
    check: "bigint_format";
    format: $ZodBigIntFormats | undefined;
}
export interface $ZodCheckBigIntFormatInternals extends $ZodCheckInternals<bigint> {
    def: $ZodCheckBigIntFormatDef;
    issc: errors.$ZodIssueTooBig<"bigint"> | errors.$ZodIssueTooSmall<"bigint">;
}
export interface $ZodCheckBigIntFormat extends $ZodCheck<bigint> {
    _zod: $ZodCheckBigIntFormatInternals;
}
export declare const $ZodCheckBigIntFormat: core.$constructor<$ZodCheckBigIntFormat>;
export interface $ZodCheckMaxSizeDef extends $ZodCheckDef {
    check: "max_size";
    maximum: number;
}
export interface $ZodCheckMaxSizeInternals<T extends util.HasSize = util.HasSize> extends $ZodCheckInternals<T> {
    def: $ZodCheckMaxSizeDef;
    issc: errors.$ZodIssueTooBig<T>;
}
export interface $ZodCheckMaxSize<T extends util.HasSize = util.HasSize> extends $ZodCheck<T> {
    _zod: $ZodCheckMaxSizeInternals<T>;
}
export declare const $ZodCheckMaxSize: core.$constructor<$ZodCheckMaxSize>;
export interface $ZodCheckMinSizeDef extends $ZodCheckDef {
    check: "min_size";
    minimum: number;
}
export interface $ZodCheckMinSizeInternals<T extends util.HasSize = util.HasSize> extends $ZodCheckInternals<T> {
    def: $ZodCheckMinSizeDef;
    issc: errors.$ZodIssueTooSmall<T>;
}
export interface $ZodCheckMinSize<T extends util.HasSize = util.HasSize> extends $ZodCheck<T> {
    _zod: $ZodCheckMinSizeInternals<T>;
}
export declare const $ZodCheckMinSize: core.$constructor<$ZodCheckMinSize>;
export interface $ZodCheckSizeEqualsD
```
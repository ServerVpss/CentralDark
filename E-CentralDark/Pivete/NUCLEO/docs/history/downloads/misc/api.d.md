# OUTRO - api.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\v4\core\api.d.ts
**SHA:** 29435fab5b60aca7
**Timestamp:** 2026-08-28T02:29:40.931918
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare function _regex(pattern: RegExp, params?: string | $ZodCheckRegexParams): checks.$ZodCheckRegex;

### Ouro Bruto (primeiros 5000 chars)
```
import * as checks from "./checks.js";
import type * as core from "./core.js";
import type * as errors from "./errors.js";
import * as registries from "./registries.js";
import * as schemas from "./schemas.js";
import * as util from "./util.js";
export type Params<T extends schemas.$ZodType | checks.$ZodCheck, IssueTypes extends errors.$ZodIssueBase, OmitKeys extends keyof T["_zod"]["def"] = never> = util.Flatten<Partial<util.EmptyToNever<Omit<T["_zod"]["def"], OmitKeys> & ([IssueTypes] extends [never] ? {} : {
    error?: string | errors.$ZodErrorMap<IssueTypes> | undefined;
    /** @deprecated This parameter is deprecated. Use `error` instead. */
    message?: string | undefined;
})>>>;
export type TypeParams<T extends schemas.$ZodType = schemas.$ZodType & {
    _isst: never;
}, AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "checks" | "error"> = never> = Params<T, NonNullable<T["_zod"]["isst"]>, "type" | "checks" | "error" | AlsoOmit>;
export type CheckParams<T extends checks.$ZodCheck = checks.$ZodCheck, // & { _issc: never },
AlsoOmit extends Exclude<keyof T["_zod"]["def"], "check" | "error"> = never> = Params<T, NonNullable<T["_zod"]["issc"]>, "check" | "error" | AlsoOmit>;
export type StringFormatParams<T extends schemas.$ZodStringFormat = schemas.$ZodStringFormat, AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"> = never> = Params<T, NonNullable<T["_zod"]["isst"] | T["_zod"]["issc"]>, "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit>;
export type CheckStringFormatParams<T extends schemas.$ZodStringFormat = schemas.$ZodStringFormat, AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"> = never> = Params<T, NonNullable<T["_zod"]["issc"]>, "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit>;
export type CheckTypeParams<T extends schemas.$ZodType & checks.$ZodCheck = schemas.$ZodType & checks.$ZodCheck, AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "checks" | "error" | "check"> = never> = Params<T, NonNullable<T["_zod"]["isst"] | T["_zod"]["issc"]>, "type" | "checks" | "error" | "check" | AlsoOmit>;
export type $ZodStringParams = TypeParams<schemas.$ZodString<string>, "coerce">;
export declare function _string<T extends schemas.$ZodString>(Class: util.SchemaClass<T>, params?: string | $ZodStringParams): T;
export declare function _coercedString<T extends schemas.$ZodString>(Class: util.SchemaClass<T>, params?: string | $ZodStringParams): T;
export type $ZodStringFormatParams = CheckTypeParams<schemas.$ZodStringFormat, "format" | "coerce" | "when" | "pattern">;
export type $ZodCheckStringFormatParams = CheckParams<checks.$ZodCheckStringFormat, "format">;
export type $ZodEmailParams = StringFormatParams<schemas.$ZodEmail, "when">;
export type $ZodCheckEmailParams = CheckStringFormatParams<schemas.$ZodEmail, "when">;
export declare function _email<T extends schemas.$ZodEmail>(Class: util.SchemaClass<T>, params?: string | $ZodEmailParams | $ZodCheckEmailParams): T;
export type $ZodGUIDParams = StringFormatParams<schemas.$ZodGUID, "pattern" | "when">;
export type $ZodCheckGUIDParams = CheckStringFormatParams<schemas.$ZodGUID, "pattern" | "when">;
export declare function _guid<T extends schemas.$ZodGUID>(Class: util.SchemaClass<T>, params?: string | $ZodGUIDParams | $ZodCheckGUIDParams): T;
export type $ZodUUIDParams = StringFormatParams<schemas.$ZodUUID, "pattern" | "when">;
export type $ZodCheckUUIDParams = CheckStringFormatParams<schemas.$ZodUUID, "pattern" | "when">;
export declare function _uuid<T extends schemas.$ZodUUID>(Class: util.SchemaClass<T>, params?: string | $ZodUUIDParams | $ZodCheckUUIDParams): T;
export type $ZodUUIDv4Params = StringFormatParams<schemas.$ZodUUID, "pattern" | "when">;
export type $ZodCheckUUIDv4Params = CheckStringFormatParams<schemas.$ZodUUID, "pattern" | "when">;
export declare function _uuidv4<T extends schemas.$ZodUUID>(Class: util.SchemaClass<T>, params?: string | $ZodUUIDv4Params | $ZodCheckUUIDv4Params): T;
export type $ZodUUIDv6Params = StringFormatParams<schemas.$ZodUUID, "pattern" | "when">;
export type $ZodCheckUUIDv6Params = CheckStringFormatParams<schemas.$ZodUUID, "pattern" | "when">;
export declare function _uuidv6<T extends schemas.$ZodUUID>(Class: util.SchemaClass<T>, params?: string | $ZodUUIDv6Params | $ZodCheckUUIDv6Params): T;
export type $ZodUUIDv7Params = StringFormatParams<schemas.$ZodUUID, "pattern" | "when">;
export type $ZodCheckUUIDv7Params = CheckStringFormatParams<schemas.$ZodUUID, "pattern" | "when">;
export declare function _uuidv7<T extends schemas.$ZodUUID>(Class: util.SchemaClass<T>, params?: string | $ZodUUIDv7Params | $ZodCheckUUIDv7Params): T;
export type $ZodURLParams = StringFormatParams<schemas.$ZodURL, "when">;
export type $ZodCheckURLParams = CheckStringFormatParams<schemas.$ZodURL, "when">;
export declare function _url<T extends schemas.$ZodURL>(Class: ut
```
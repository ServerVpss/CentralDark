# OUTRO - index.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\express-serve-static-core\index.d.ts
**SHA:** 90407bbaa24977b8
**Timestamp:** 2026-08-26T19:32:04.706252
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: number;

### Gaps
- : Route extends `${string}(${string}` ? ParamsDictionary // TODO: handling for regex parameters

### Ouro Bruto (primeiros 5000 chars)
```
// This extracts the core definitions from express to prevent a circular dependency between express and serve-static
/// <reference types="node" />

import { SendOptions } from "send";

declare global {
    namespace Express {
        // These open interfaces may be extended in an application-specific manner via declaration merging.
        // See for example method-override.d.ts (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/method-override/index.d.ts)
        interface Request {}
        interface Response {}
        interface Locals {}
        interface Application {}
    }
}

import { EventEmitter } from "events";
import * as http from "http";
import { ParsedQs } from "qs";
import { Options as RangeParserOptions, Ranges as RangeParserRanges, Result as RangeParserResult } from "range-parser";

export {};

export type Query = ParsedQs;

export interface NextFunction {
    (err?: any): void;
    /**
     * "Break-out" of a router by calling {next('router')};
     * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.router}
     */
    (deferToNext: "router"): void;
    /**
     * "Break-out" of a route by calling {next('route')};
     * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.application}
     */
    (deferToNext: "route"): void;
}

export interface Dictionary<T> {
    [key: string]: T;
}

export interface ParamsDictionary {
    [key: string | number]: string;
}
export type Params = ParamsDictionary;

export interface Locals extends Express.Locals {}

export interface RequestHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
> {
    // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2)
    (
        req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
        res: Response<ResBody, LocalsObj>,
        next: NextFunction,
    ): void;
}

export type ErrorRequestHandler<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
> = (
    err: any,
    req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
    res: Response<ResBody, LocalsObj>,
    next: NextFunction,
) => void;

export type PathParams = string | RegExp | Array<string | RegExp>;

export type RequestHandlerParams<
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = ParsedQs,
    LocalsObj extends Record<string, any> = Record<string, any>,
> =
    | RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>
    | ErrorRequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>
    | Array<RequestHandler<P> | ErrorRequestHandler<P>>;

type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;
type GetRouteParameter<S extends string> = RemoveTail<
    RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
    `.${string}`
>;

// prettier-ignore
export type RouteParameters<Route extends string> = string extends Route ? ParamsDictionary
    : Route extends `${string}(${string}` ? ParamsDictionary // TODO: handling for regex parameters
    : Route extends `${string}:${infer Rest}` ?
            & (
                GetRouteParameter<Rest> extends never ? ParamsDictionary
                    : GetRouteParameter<Rest> extends `${infer ParamName}?` ? { [P in ParamName]?: string }
                    : { [P in GetRouteParameter<Rest>]: string }
            )
            & (Rest extends `${GetRouteParameter<Rest>}${infer Next}` ? RouteParameters<Next> : unknown)
    : {};

/* eslint-disable @definitelytyped/no-unnecessary-generics */
export interface IRouterMatcher<
    T,
    Method extends "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" = any,
> {
    <
        Route extends string,
        P = RouteParameters<Route>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        // (it's used as the default type parameter for P)
        path: Route,
        // (This generic is meant to be passed explicitly.)
        ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    <
        Path extends string,
        P = RouteParameters<Path>,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
        // (it's used as the default type parameter for P)
        path: Path,
        // (This generic is meant to be passed explicitly.)
        ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, LocalsObj>>
    ): T;
    <
        P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        LocalsObj extends Record<string, any> = Record<string, any>,
    >(
   
```

---

# OUTRO - index.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\path-key\index.d.ts
**SHA:** 804fb0c13d2ebd79
**Timestamp:** 2026-08-26T19:32:25.119773
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Remove this for the next major release, refactor the whole definition to:

### Ouro Bruto (primeiros 5000 chars)
```
/// <reference types="node" />

declare namespace pathKey {
	interface Options {
		/**
		Use a custom environment variables object. Default: [`process.env`](https://nodejs.org/api/process.html#process_process_env).
		*/
		readonly env?: {[key: string]: string | undefined};

		/**
		Get the PATH key for a specific platform. Default: [`process.platform`](https://nodejs.org/api/process.html#process_process_platform).
		*/
		readonly platform?: NodeJS.Platform;
	}
}

declare const pathKey: {
	/**
	Get the [PATH](https://en.wikipedia.org/wiki/PATH_(variable)) environment variable key cross-platform.

	@example
	```
	import pathKey = require('path-key');

	const key = pathKey();
	//=> 'PATH'

	const PATH = process.env[key];
	//=> '/usr/local/bin:/usr/bin:/bin'
	```
	*/
	(options?: pathKey.Options): string;

	// TODO: Remove this for the next major release, refactor the whole definition to:
	// declare function pathKey(options?: pathKey.Options): string;
	// export = pathKey;
	default: typeof pathKey;
};

export = pathKey;

```

---

# OUTRO - index.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\ajv@8.20.0@@@1\dist\types\index.d.ts
**SHA:** 9941cbf7ca695e95
**Timestamp:** 2026-08-28T02:23:52.807632
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- (pattern: string, u: string): RegExpLike;

### Ouro Bruto (primeiros 5000 chars)
```
import { URIComponent } from "fast-uri";
import type { CodeGen, Code, Name, ScopeValueSets, ValueScopeName } from "../compile/codegen";
import type { SchemaEnv, SchemaCxt, SchemaObjCxt } from "../compile";
import type { JSONType } from "../compile/rules";
import type { KeywordCxt } from "../compile/validate";
import type Ajv from "../core";
interface _SchemaObject {
    id?: string;
    $id?: string;
    $schema?: string;
    [x: string]: any;
}
export interface SchemaObject extends _SchemaObject {
    id?: string;
    $id?: string;
    $schema?: string;
    $async?: false;
    [x: string]: any;
}
export interface AsyncSchema extends _SchemaObject {
    $async: true;
}
export type AnySchemaObject = SchemaObject | AsyncSchema;
export type Schema = SchemaObject | boolean;
export type AnySchema = Schema | AsyncSchema;
export type SchemaMap = {
    [Key in string]?: AnySchema;
};
export interface SourceCode {
    validateName: ValueScopeName;
    validateCode: string;
    scopeValues: ScopeValueSets;
    evaluated?: Code;
}
export interface DataValidationCxt<T extends string | number = string | number> {
    instancePath: string;
    parentData: {
        [K in T]: any;
    };
    parentDataProperty: T;
    rootData: Record<string, any> | any[];
    dynamicAnchors: {
        [Ref in string]?: ValidateFunction;
    };
}
export interface ValidateFunction<T = unknown> {
    (this: Ajv | any, data: any, dataCxt?: DataValidationCxt): data is T;
    errors?: null | ErrorObject[];
    evaluated?: Evaluated;
    schema: AnySchema;
    schemaEnv: SchemaEnv;
    source?: SourceCode;
}
export interface JTDParser<T = unknown> {
    (json: string): T | undefined;
    message?: string;
    position?: number;
}
export type EvaluatedProperties = {
    [K in string]?: true;
} | true;
export type EvaluatedItems = number | true;
export interface Evaluated {
    props?: EvaluatedProperties;
    items?: EvaluatedItems;
    dynamicProps: boolean;
    dynamicItems: boolean;
}
export interface AsyncValidateFunction<T = unknown> extends ValidateFunction<T> {
    (...args: Parameters<ValidateFunction<T>>): Promise<T>;
    $async: true;
}
export type AnyValidateFunction<T = any> = ValidateFunction<T> | AsyncValidateFunction<T>;
export interface ErrorObject<K extends string = string, P = Record<string, any>, S = unknown> {
    keyword: K;
    instancePath: string;
    schemaPath: string;
    params: P;
    propertyName?: string;
    message?: string;
    schema?: S;
    parentSchema?: AnySchemaObject;
    data?: unknown;
}
export type ErrorNoParams<K extends string, S = unknown> = ErrorObject<K, Record<string, never>, S>;
interface _KeywordDef {
    keyword: string | string[];
    type?: JSONType | JSONType[];
    schemaType?: JSONType | JSONType[];
    allowUndefined?: boolean;
    $data?: boolean;
    implements?: string[];
    before?: string;
    post?: boolean;
    metaSchema?: AnySchemaObject;
    validateSchema?: AnyValidateFunction;
    dependencies?: string[];
    error?: KeywordErrorDefinition;
    $dataError?: KeywordErrorDefinition;
}
export interface CodeKeywordDefinition extends _KeywordDef {
    code: (cxt: KeywordCxt, ruleType?: string) => void;
    trackErrors?: boolean;
}
export type MacroKeywordFunc = (schema: any, parentSchema: AnySchemaObject, it: SchemaCxt) => AnySchema;
export type CompileKeywordFunc = (schema: any, parentSchema: AnySchemaObject, it: SchemaObjCxt) => DataValidateFunction;
export interface DataValidateFunction {
    (...args: Parameters<ValidateFunction>): boolean | Promise<any>;
    errors?: Partial<ErrorObject>[];
}
export interface SchemaValidateFunction {
    (schema: any, data: any, parentSchema?: AnySchemaObject, dataCxt?: DataValidationCxt): boolean | Promise<any>;
    errors?: Partial<ErrorObject>[];
}
export interface FuncKeywordDefinition extends _KeywordDef {
    validate?: SchemaValidateFunction | DataValidateFunction;
    compile?: CompileKeywordFunc;
    schema?: boolean;
    modifying?: boolean;
    async?: boolean;
    valid?: boolean;
    errors?: boolean | "full";
}
export interface MacroKeywordDefinition extends FuncKeywordDefinition {
    macro: MacroKeywordFunc;
}
export type KeywordDefinition = CodeKeywordDefinition | FuncKeywordDefinition | MacroKeywordDefinition;
export type AddedKeywordDefinition = KeywordDefinition & {
    type: JSONType[];
    schemaType: JSONType[];
};
export interface KeywordErrorDefinition {
    message: string | Code | ((cxt: KeywordErrorCxt) => string | Code);
    params?: Code | ((cxt: KeywordErrorCxt) => Code);
}
export type Vocabulary = (KeywordDefinition | string)[];
export interface KeywordErrorCxt {
    gen: CodeGen;
    keyword: string;
    data: Name;
    $data?: string | false;
    schema: any;
    parentSchema?: AnySchemaObject;
    schemaCode: Code | number | boolean;
    schemaValue: Code | number | boolean;
    schemaType?: JSONType[];
    errsCount?: Name;
    params: KeywordCxtParams;
    it: SchemaCxt;
}
export type KeywordCxtParams = {
```

---

# OUTRO - index.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\call-bound@1.0.4@@@1\index.d.ts
**SHA:** f8213a2dc5cb3a7b
**Timestamp:** 2026-08-28T02:24:05.501024
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- type AllowMissing = boolean;

### Ouro Bruto (primeiros 5000 chars)
```
type Intrinsic = typeof globalThis;

type IntrinsicName = keyof Intrinsic | `%${keyof Intrinsic}%`;

type IntrinsicPath = IntrinsicName | `${StripPercents<IntrinsicName>}.${string}` | `%${StripPercents<IntrinsicName>}.${string}%`;

type AllowMissing = boolean;

type StripPercents<T extends string> = T extends `%${infer U}%` ? U : T;

type BindMethodPrecise<F> =
  F extends (this: infer This, ...args: infer Args) => infer R
  ? (obj: This, ...args: Args) => R
  : F extends {
    (this: infer This1, ...args: infer Args1): infer R1;
    (this: infer This2, ...args: infer Args2): infer R2
  }
  ? {
    (obj: This1, ...args: Args1): R1;
    (obj: This2, ...args: Args2): R2
  }
  : never

// Extract method type from a prototype
type GetPrototypeMethod<T extends keyof typeof globalThis, M extends string> =
  (typeof globalThis)[T] extends { prototype: any }
  ? M extends keyof (typeof globalThis)[T]['prototype']
  ? (typeof globalThis)[T]['prototype'][M]
  : never
  : never

// Get static property/method
type GetStaticMember<T extends keyof typeof globalThis, P extends string> =
  P extends keyof (typeof globalThis)[T] ? (typeof globalThis)[T][P] : never

// Type that maps string path to actual bound function or value with better precision
type BoundIntrinsic<S extends string> =
  S extends `${infer Obj}.prototype.${infer Method}`
  ? Obj extends keyof typeof globalThis
  ? BindMethodPrecise<GetPrototypeMethod<Obj, Method & string>>
  : unknown
  : S extends `${infer Obj}.${infer Prop}`
  ? Obj extends keyof typeof globalThis
  ? GetStaticMember<Obj, Prop & string>
  : unknown
  : unknown

declare function arraySlice<T>(array: readonly T[], start?: number, end?: number): T[];
declare function arraySlice<T>(array: ArrayLike<T>, start?: number, end?: number): T[];
declare function arraySlice<T>(array: IArguments, start?: number, end?: number): T[];

// Special cases for methods that need explicit typing
interface SpecialCases {
  '%Object.prototype.isPrototypeOf%': (thisArg: {}, obj: unknown) => boolean;
  '%String.prototype.replace%': {
    (str: string, searchValue: string | RegExp, replaceValue: string): string;
    (str: string, searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string
  };
  '%Object.prototype.toString%': (obj: {}) => string;
  '%Object.prototype.hasOwnProperty%': (obj: {}, v: PropertyKey) => boolean;
  '%Array.prototype.slice%': typeof arraySlice;
  '%Array.prototype.map%': <T, U>(array: readonly T[], callbackfn: (value: T, index: number, array: readonly T[]) => U, thisArg?: any) => U[];
  '%Array.prototype.filter%': <T>(array: readonly T[], predicate: (value: T, index: number, array: readonly T[]) => unknown, thisArg?: any) => T[];
  '%Array.prototype.indexOf%': <T>(array: readonly T[], searchElement: T, fromIndex?: number) => number;
  '%Function.prototype.apply%': <T, A extends any[], R>(fn: (...args: A) => R, thisArg: any, args: A) => R;
  '%Function.prototype.call%': <T, A extends any[], R>(fn: (...args: A) => R, thisArg: any, ...args: A) => R;
  '%Function.prototype.bind%': <T, A extends any[], R>(fn: (...args: A) => R, thisArg: any, ...args: A) => (...remainingArgs: A) => R;
  '%Promise.prototype.then%': {
    <T, R>(promise: Promise<T>, onfulfilled: (value: T) => R | PromiseLike<R>): Promise<R>;
    <T, R>(promise: Promise<T>, onfulfilled: ((value: T) => R | PromiseLike<R>) | undefined | null, onrejected: (reason: any) => R | PromiseLike<R>): Promise<R>;
  };
  '%RegExp.prototype.test%': (regexp: RegExp, str: string) => boolean;
  '%RegExp.prototype.exec%': (regexp: RegExp, str: string) => RegExpExecArray | null;
  '%Error.prototype.toString%': (error: Error) => string;
  '%TypeError.prototype.toString%': (error: TypeError) => string;
  '%String.prototype.split%': (
        obj: unknown,
        splitter: string | RegExp | {
            [Symbol.split](string: string, limit?: number): string[];
        },
        limit?: number | undefined
    ) => string[];
}

/**
 * Returns a bound function for a prototype method, or a value for a static property.
 *
 * @param name - The name of the intrinsic (e.g. 'Array.prototype.slice')
 * @param {AllowMissing} [allowMissing] - Whether to allow missing intrinsics (default: false)
 */
declare function callBound<K extends keyof SpecialCases | StripPercents<keyof SpecialCases>, S extends IntrinsicPath>(name: K, allowMissing?: AllowMissing): SpecialCases[`%${StripPercents<K>}%`];
declare function callBound<K extends keyof SpecialCases | StripPercents<keyof SpecialCases>, S extends IntrinsicPath>(name: S, allowMissing?: AllowMissing): BoundIntrinsic<S>;

export = callBound;

```
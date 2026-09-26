# COMANDO - util.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\util.d.ts
**SHA:** 5987a903da92c746
**Timestamp:** 2026-08-26T19:32:03.942228
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- export type CustomInspectFunction = (depth: number, options: InspectOptionsStylized) => any; // TODO: , inspect: inspect

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * The `node:util` module supports the needs of Node.js internal APIs. Many of the
 * utilities are useful for application and module developers as well. To access
 * it:
 *
 * ```js
 * import util from 'node:util';
 * ```
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/util.js)
 */
declare module "util" {
    import * as types from "node:util/types";
    export interface InspectOptions {
        /**
         * If `true`, object's non-enumerable symbols and properties are included in the formatted result.
         * `WeakMap` and `WeakSet` entries are also included as well as user defined prototype properties (excluding method properties).
         * @default false
         */
        showHidden?: boolean | undefined;
        /**
         * Specifies the number of times to recurse while formatting object.
         * This is useful for inspecting large objects.
         * To recurse up to the maximum call stack size pass `Infinity` or `null`.
         * @default 2
         */
        depth?: number | null | undefined;
        /**
         * If `true`, the output is styled with ANSI color codes. Colors are customizable.
         */
        colors?: boolean | undefined;
        /**
         * If `false`, `[util.inspect.custom](depth, opts, inspect)` functions are not invoked.
         * @default true
         */
        customInspect?: boolean | undefined;
        /**
         * If `true`, `Proxy` inspection includes the target and handler objects.
         * @default false
         */
        showProxy?: boolean | undefined;
        /**
         * Specifies the maximum number of `Array`, `TypedArray`, `WeakMap`, and `WeakSet` elements
         * to include when formatting. Set to `null` or `Infinity` to show all elements.
         * Set to `0` or negative to show no elements.
         * @default 100
         */
        maxArrayLength?: number | null | undefined;
        /**
         * Specifies the maximum number of characters to
         * include when formatting. Set to `null` or `Infinity` to show all elements.
         * Set to `0` or negative to show no characters.
         * @default 10000
         */
        maxStringLength?: number | null | undefined;
        /**
         * The length at which input values are split across multiple lines.
         * Set to `Infinity` to format the input as a single line
         * (in combination with `compact` set to `true` or any number >= `1`).
         * @default 80
         */
        breakLength?: number | undefined;
        /**
         * Setting this to `false` causes each object key
         * to be displayed on a new line. It will also add new lines to text that is
         * longer than `breakLength`. If set to a number, the most `n` inner elements
         * are united on a single line as long as all properties fit into
         * `breakLength`. Short array elements are also grouped together. Note that no
         * text will be reduced below 16 characters, no matter the `breakLength` size.
         * For more information, see the example below.
         * @default true
         */
        compact?: boolean | number | undefined;
        /**
         * If set to `true` or a function, all properties of an object, and `Set` and `Map`
         * entries are sorted in the resulting string.
         * If set to `true` the default sort is used.
         * If set to a function, it is used as a compare function.
         */
        sorted?: boolean | ((a: string, b: string) => number) | undefined;
        /**
         * If set to `true`, getters are going to be
         * inspected as well. If set to `'get'` only getters without setter are going
         * to be inspected. If set to `'set'` only getters having a corresponding
         * setter are going to be inspected. This might cause side effects depending on
         * the getter function.
         * @default false
         */
        getters?: "get" | "set" | boolean | undefined;
        /**
         * If set to `true`, an underscore is used to separate every three digits in all bigints and numbers.
         * @default false
         */
        numericSeparator?: boolean | undefined;
    }
    export type Style =
        | "special"
        | "number"
        | "bigint"
        | "boolean"
        | "undefined"
        | "null"
        | "string"
        | "symbol"
        | "date"
        | "regexp"
        | "module";
    export type CustomInspectFunction = (depth: number, options: InspectOptionsStylized) => any; // TODO: , inspect: inspect
    export interface InspectOptionsStylized extends InspectOptions {
        stylize(text: string, styleType: Style): string;
    }
    export interface CallSiteObject {
        /**
         * Returns the name of the function associated with this call site.
         */
        functionName: string;
        /**
         * Returns the name of the resource that contains the script for the
         * function for this call site.
         */
        scriptNa
```
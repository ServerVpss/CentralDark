# OUTRO - url.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\hono\dist\types\utils\url.d.ts
**SHA:** bcb73994c40000f1
**Timestamp:** 2026-08-26T19:32:15.068021
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export type Pattern = readonly [string, string, RegExp | true] | '*';
- export declare const getPattern: (label: string, next?: string) => Pattern | null;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @module
 * URL utility.
 */
export type Pattern = readonly [string, string, RegExp | true] | '*';
export declare const splitPath: (path: string) => string[];
export declare const splitRoutingPath: (routePath: string) => string[];
export declare const getPattern: (label: string, next?: string) => Pattern | null;
type Decoder = (str: string) => string;
export declare const tryDecode: (str: string, decoder: Decoder) => string;
/**
 * Try to apply decodeURI() to given string.
 * If it fails, skip invalid percent encoding or invalid UTF-8 sequences, and apply decodeURI() to the rest as much as possible.
 * @param str The string to decode.
 * @returns The decoded string that sometimes contains undecodable percent encoding.
 * @example
 * tryDecodeURI('Hello%20World') // 'Hello World'
 * tryDecodeURI('Hello%20World/%A4%A2') // 'Hello World/%A4%A2'
 */
export declare const tryDecodeURI: (str: string) => string;
export declare const getPath: (request: Request) => string;
export declare const getQueryStrings: (url: string) => string;
export declare const getPathNoStrict: (request: Request) => string;
/**
 * Merge paths.
 * @param {string[]} ...paths - The paths to merge.
 * @returns {string} The merged path.
 * @example
 * mergePath('/api', '/users') // '/api/users'
 * mergePath('/api/', '/users') // '/api/users'
 * mergePath('/api', '/') // '/api'
 * mergePath('/api/', '/') // '/api/'
 */
export declare const mergePath: (...paths: string[]) => string;
export declare const checkOptionalParameter: (path: string) => string[] | null;
export declare const getQueryParam: (url: string, key?: string) => string | undefined | Record<string, string>;
export declare const getQueryParams: (url: string, key?: string) => string[] | undefined | Record<string, string[]>;
export declare const decodeURIComponent_: typeof decodeURIComponent;
export {};

```

---

# OUTRO - url.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\hono@4.13.4@@@1\dist\types\utils\url.d.ts
**SHA:** 71a949fbb71be682
**Timestamp:** 2026-08-28T02:24:36.335026
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export type Pattern = readonly [string, string, RegExp | true] | '*';
- export declare const getPattern: (label: string, next?: string) => Pattern | null;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * @module
 * URL utility.
 */
export type Pattern = readonly [string, string, RegExp | true] | '*';
export declare const splitPath: (path: string) => string[];
export declare const splitRoutingPath: (routePath: string) => string[];
export declare const getPattern: (label: string, next?: string) => Pattern | null;
type Decoder = (str: string) => string;
export declare const tryDecode: (str: string, decoder: Decoder) => string;
/**
 * Try to apply decodeURI() to given string.
 * If it fails, skip invalid percent encoding or invalid UTF-8 sequences, and apply decodeURI() to the rest as much as possible.
 * @param str The string to decode.
 * @returns The decoded string that sometimes contains undecodable percent encoding.
 * @example
 * tryDecodeURI('Hello%20World') // 'Hello World'
 * tryDecodeURI('Hello%20World/%A4%A2') // 'Hello World/%A4%A2'
 */
export declare const tryDecodeURI: (str: string) => string;
export declare const getPath: (request: Request) => string;
export declare const getQueryStrings: (url: string) => string;
export declare const getPathNoStrict: (request: Request) => string;
/**
 * Merge paths.
 * @param {string[]} ...paths - The paths to merge.
 * @returns {string} The merged path.
 * @example
 * mergePath('/api', '/users') // '/api/users'
 * mergePath('/api/', '/users') // '/api/users'
 * mergePath('/api', '/') // '/api'
 * mergePath('/api/', '/') // '/api/'
 */
export declare const mergePath: (...paths: string[]) => string;
export declare const checkOptionalParameter: (path: string) => string[] | null;
export declare const tryDecodeURIComponent: (str: string) => string;
export declare const getQueryParam: (url: string, key?: string) => string | undefined | Record<string, string>;
export declare const getQueryParams: (url: string, key?: string) => string[] | undefined | Record<string, string[]>;
export declare const decodeURIComponent_: typeof decodeURIComponent;
export {};

```
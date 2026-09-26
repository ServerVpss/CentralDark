# OUTRO - utils.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\instrumentation@0.220.0@@@1\build\esm\utils.d.ts
**SHA:** 6e7a50620f1dec08
**Timestamp:** 2026-08-28T02:21:19.165107
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare function safeExecuteInTheMiddle<T>(execute: () => T, onFinish: (e: Error | undefined, result: T | undefined) => void, preventThrowingError?: boolean): T;
- export declare function safeExecuteInTheMiddleAsync<T>(execute: () => T, onFinish: (e: Error | undefined, result: T | undefined) => Promise<void> | void, preventThrowingError?: boolean): Promise<T>;

### Ouro Bruto (primeiros 5000 chars)
```
import type { ShimWrapped } from './types';
/**
 * function to execute patched function and being able to catch errors
 * @param execute - function to be executed
 * @param onFinish - callback to run when execute finishes
 */
export declare function safeExecuteInTheMiddle<T>(execute: () => T, onFinish: (e: Error | undefined, result: T | undefined) => void, preventThrowingError?: boolean): T;
/**
 * Async function to execute patched function and being able to catch errors
 * @param execute - function to be executed
 * @param onFinish - callback to run when execute finishes
 */
export declare function safeExecuteInTheMiddleAsync<T>(execute: () => T, onFinish: (e: Error | undefined, result: T | undefined) => Promise<void> | void, preventThrowingError?: boolean): Promise<T>;
/**
 * Checks if certain function has been already wrapped
 * @param func
 */
export declare function isWrapped(func: unknown): func is ShimWrapped;
//# sourceMappingURL=utils.d.ts.map
```

---

# OUTRO - utils.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\types\integrations\tracing\fastify\v3\utils.d.ts
**SHA:** 9a9dd0eee047ae53
**Timestamp:** 2026-08-28T02:23:08.783797
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare function safeExecuteInTheMiddleMaybePromise<T>(execute: () => Promise<T>, onFinish: (e: unknown, result?: T) => void, preventThrowingError?: boolean): Promise<T>;
- export declare function safeExecuteInTheMiddleMaybePromise<T>(execute: () => T, onFinish: (e: unknown, result?: T) => void, preventThrowingError?: boolean): T;

### Ouro Bruto (primeiros 5000 chars)
```
import { type Attributes, type Span, type Tracer } from '@opentelemetry/api';
import type { PluginFastifyReply } from './internal-types';
/**
 * Starts Span
 * @param reply - reply function
 * @param tracer - tracer
 * @param spanName - span name
 * @param spanAttributes - span attributes
 */
export declare function startSpan(reply: PluginFastifyReply, tracer: Tracer, spanName: string, spanAttributes?: Attributes): Span;
/**
 * Ends span
 * @param reply - reply function
 * @param err - error
 */
export declare function endSpan(reply: PluginFastifyReply, err?: any): void;
/**
 * This function handles the missing case from instrumentation package when
 * execute can either return a promise or void. And using async is not an
 * option as it is producing unwanted side effects.
 * @param execute - function to be executed
 * @param onFinish - function called when function executed
 * @param preventThrowingError - prevent to throw error when execute
 * function fails
 */
export declare function safeExecuteInTheMiddleMaybePromise<T>(execute: () => Promise<T>, onFinish: (e: unknown, result?: T) => void, preventThrowingError?: boolean): Promise<T>;
export declare function safeExecuteInTheMiddleMaybePromise<T>(execute: () => T, onFinish: (e: unknown, result?: T) => void, preventThrowingError?: boolean): T;
//# sourceMappingURL=utils.d.ts.map
```

---

# OUTRO - utils.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\types\integrations\tracing\mysql\vendored\utils.d.ts
**SHA:** 35d39600812582d2
**Timestamp:** 2026-08-28T02:23:12.447490
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- * TODO: revisit span name based on https://github.com/open-telemetry/semantic-conventions/blob/v1.33.0/docs/database/database-spans.md#name

### Ouro Bruto (primeiros 5000 chars)
```
import type { ConnectionConfig, PoolConfig, Query, QueryOptions } from './mysql-types';
export declare function getConfig(config: ConnectionConfig | PoolConfig | undefined): {
    host: string | undefined;
    port: number | undefined;
    database: string | undefined;
    user: string | undefined;
};
export declare function getJDBCString(host: string | undefined, port: number | undefined, database: string | undefined): string;
/**
 * @returns the database query being executed.
 */
export declare function getDbQueryText(query: string | Query | QueryOptions): string;
/**
 * The span name SHOULD be set to a low cardinality value
 * representing the statement executed on the database.
 *
 * TODO: revisit span name based on https://github.com/open-telemetry/semantic-conventions/blob/v1.33.0/docs/database/database-spans.md#name
 *
 * @returns SQL statement without variable arguments or SQL verb
 */
export declare function getSpanName(query: string | Query | QueryOptions): string;
//# sourceMappingURL=utils.d.ts.map
```

---

# OUTRO - utils.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\types-ts3.8\integrations\tracing\fastify\v3\utils.d.ts
**SHA:** b563a6269ee4d058
**Timestamp:** 2026-08-28T02:23:15.139743
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare function safeExecuteInTheMiddleMaybePromise<T>(execute: () => Promise<T>, onFinish: (e: unknown, result?: T) => void, preventThrowingError?: boolean): Promise<T>;
- export declare function safeExecuteInTheMiddleMaybePromise<T>(execute: () => T, onFinish: (e: unknown, result?: T) => void, preventThrowingError?: boolean): T;

### Ouro Bruto (primeiros 5000 chars)
```
import { Attributes, Span, Tracer } from '@opentelemetry/api';
import { PluginFastifyReply } from './internal-types';
/**
 * Starts Span
 * @param reply - reply function
 * @param tracer - tracer
 * @param spanName - span name
 * @param spanAttributes - span attributes
 */
export declare function startSpan(reply: PluginFastifyReply, tracer: Tracer, spanName: string, spanAttributes?: Attributes): Span;
/**
 * Ends span
 * @param reply - reply function
 * @param err - error
 */
export declare function endSpan(reply: PluginFastifyReply, err?: any): void;
/**
 * This function handles the missing case from instrumentation package when
 * execute can either return a promise or void. And using async is not an
 * option as it is producing unwanted side effects.
 * @param execute - function to be executed
 * @param onFinish - function called when function executed
 * @param preventThrowingError - prevent to throw error when execute
 * function fails
 */
export declare function safeExecuteInTheMiddleMaybePromise<T>(execute: () => Promise<T>, onFinish: (e: unknown, result?: T) => void, preventThrowingError?: boolean): Promise<T>;
export declare function safeExecuteInTheMiddleMaybePromise<T>(execute: () => T, onFinish: (e: unknown, result?: T) => void, preventThrowingError?: boolean): T;
//# sourceMappingURL=utils.d.ts.map

```

---

# OUTRO - utils.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\types-ts3.8\integrations\tracing\mysql\vendored\utils.d.ts
**SHA:** d2d142db38785ebb
**Timestamp:** 2026-08-28T02:23:18.055678
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- * TODO: revisit span name based on https://github.com/open-telemetry/semantic-conventions/blob/v1.33.0/docs/database/database-spans.md#name

### Ouro Bruto (primeiros 5000 chars)
```
import { ConnectionConfig, PoolConfig, Query, QueryOptions } from './mysql-types';
export declare function getConfig(config: ConnectionConfig | PoolConfig | undefined): {
    host: string | undefined;
    port: number | undefined;
    database: string | undefined;
    user: string | undefined;
};
export declare function getJDBCString(host: string | undefined, port: number | undefined, database: string | undefined): string;
/**
 * @returns the database query being executed.
 */
export declare function getDbQueryText(query: string | Query | QueryOptions): string;
/**
 * The span name SHOULD be set to a low cardinality value
 * representing the statement executed on the database.
 *
 * TODO: revisit span name based on https://github.com/open-telemetry/semantic-conventions/blob/v1.33.0/docs/database/database-spans.md#name
 *
 * @returns SQL statement without variable arguments or SQL verb
 */
export declare function getSpanName(query: string | Query | QueryOptions): string;
//# sourceMappingURL=utils.d.ts.map

```

---

# OUTRO - utils.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\types\graphql\utils.d.ts
**SHA:** 2c3bdb19031c92e5
**Timestamp:** 2026-08-28T02:23:38.054401
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: number;

### Ouro Bruto (primeiros 5000 chars)
```
import type { Span } from '@sentry/core';
/** Minimal shape of a graphql-js lexer token, enough to locate literal spans for redaction. */
interface GraphqlToken {
    kind: string;
    start: number;
    end: number;
    next?: GraphqlToken | null;
}
/** Minimal shape of a parsed graphql-js `DocumentNode`, enough to read its source and tokens. */
export interface GraphqlDocumentNode {
    loc?: {
        startToken?: GraphqlToken;
        source?: {
            body?: string;
        };
    };
}
/**
 * Rename the enclosing root span to include the operation name(s), e.g. `GET /graphql (query GetUser)`.
 * Mirrors the legacy OTel `useOperationNameForRootSpan` behavior; `parseSpanDescription` reads the same
 * `sentry.graphql.operation` attribute on the OTel export path.
 */
export declare function renameRootSpanWithOperation(span: Span, operationType: string, operationName?: string): void;
/**
 * Span name follows the GraphQL semantic conventions: `<operation.type> <operation.name>` when both
 * are available, `<operation.type>` when only the type is, otherwise a static fallback.
 */
export declare function getOperationSpanName(operationType: string | undefined, operationName: string | undefined, fallbackName: string): string;
/** Whether a graphql execution result carries GraphQL errors (returned on `result.errors`). */
export declare function hasResultErrors(result: unknown): boolean;
/**
 * Returns the redacted document if `dataCollection.graphQL.document` is enabled, `undefined` otherwise.
 */
export declare function collectGraphqlDocument(document: GraphqlDocumentNode | undefined): string | undefined;
export {};
//# sourceMappingURL=utils.d.ts.map
```

---

# OUTRO - utils.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\types-ts3.8\graphql\utils.d.ts
**SHA:** 649822763ac0807d
**Timestamp:** 2026-08-28T02:23:43.652636
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: number;

### Ouro Bruto (primeiros 5000 chars)
```
import { Span } from '@sentry/core';
/** Minimal shape of a graphql-js lexer token, enough to locate literal spans for redaction. */
interface GraphqlToken {
    kind: string;
    start: number;
    end: number;
    next?: GraphqlToken | null;
}
/** Minimal shape of a parsed graphql-js `DocumentNode`, enough to read its source and tokens. */
export interface GraphqlDocumentNode {
    loc?: {
        startToken?: GraphqlToken;
        source?: {
            body?: string;
        };
    };
}
/**
 * Rename the enclosing root span to include the operation name(s), e.g. `GET /graphql (query GetUser)`.
 * Mirrors the legacy OTel `useOperationNameForRootSpan` behavior; `parseSpanDescription` reads the same
 * `sentry.graphql.operation` attribute on the OTel export path.
 */
export declare function renameRootSpanWithOperation(span: Span, operationType: string, operationName?: string): void;
/**
 * Span name follows the GraphQL semantic conventions: `<operation.type> <operation.name>` when both
 * are available, `<operation.type>` when only the type is, otherwise a static fallback.
 */
export declare function getOperationSpanName(operationType: string | undefined, operationName: string | undefined, fallbackName: string): string;
/** Whether a graphql execution result carries GraphQL errors (returned on `result.errors`). */
export declare function hasResultErrors(result: unknown): boolean;
/**
 * Returns the redacted document if `dataCollection.graphQL.document` is enabled, `undefined` otherwise.
 */
export declare function collectGraphqlDocument(document: GraphqlDocumentNode | undefined): string | undefined;
export {};
//# sourceMappingURL=utils.d.ts.map

```
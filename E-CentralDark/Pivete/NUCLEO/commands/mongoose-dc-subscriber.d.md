# COMANDO - mongoose-dc-subscriber.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\types\mongoose\mongoose-dc-subscriber.d.ts
**SHA:** 487e23a450e3975d
**Timestamp:** 2026-08-28T02:23:40.787590
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- export declare const MONGOOSE_DC_CHANNEL_AGGREGATE = "mongoose:aggregate";

### Ouro Bruto (primeiros 5000 chars)
```
import type { TracingChannel } from 'node:diagnostics_channel';
export declare const MONGOOSE_DC_CHANNEL_QUERY = "mongoose:query";
export declare const MONGOOSE_DC_CHANNEL_AGGREGATE = "mongoose:aggregate";
export declare const MONGOOSE_DC_CHANNEL_MODEL_SAVE = "mongoose:model:save";
export declare const MONGOOSE_DC_CHANNEL_MODEL_INSERT_MANY = "mongoose:model:insertMany";
export declare const MONGOOSE_DC_CHANNEL_MODEL_BULK_WRITE = "mongoose:model:bulkWrite";
export declare const MONGOOSE_DC_CHANNEL_CURSOR_NEXT = "mongoose:cursor:next";
/**
 * Shape of the context object mongoose >= 9.7.0 publishes on its tracing
 * channels (mongoose's `TracingContext`, see `types/tracing.d.ts`).
 *
 * Node's `tracePromise` mutates this same object with `result`/`error` once the
 * operation settles, which `bindTracingChannelToSpan` reads in its lifecycle
 * handlers — hence both are declared optional here.
 *
 * Unlike redis/ioredis, mongoose does NOT pre-sanitize the payload, so `args`
 * carries the raw user query. We redact it before emitting `db.query.text`.
 */
export interface MongooseTracingData {
    operation: string;
    /** Absent for connection-level `aggregate()` calls, which have no model/collection. */
    collection?: string;
    database?: string;
    serverAddress?: string;
    serverPort?: number;
    /** Cursor channels only: the cursor's fetch batch size and tailable flag. */
    batchSize?: number;
    tailable?: boolean;
    /**
     * Operation-specific arguments. `filter` (queries/cursors) and `pipeline`
     * (aggregations) carry the query shape; `docs`/`ops` carry batch payloads.
     */
    args?: {
        filter?: unknown;
        pipeline?: unknown;
        docs?: unknown;
        ops?: unknown;
        [key: string]: unknown;
    };
    result?: unknown;
    error?: Error;
}
/**
 * Platform-provided factory that creates a native tracing channel for the given name. The
 * subscriber binds the span and its lifecycle onto the channel via `bindTracingChannelToSpan`,
 * which propagates the active span through the runtime's async context.
 *
 * Node passes `node:diagnostics_channel`'s `tracingChannel` directly.
 */
export type MongooseTracingChannelFactory = <T extends object>(name: string) => TracingChannel<T, T>;
/**
 * Subscribe Sentry span handlers to mongoose's diagnostics-channel events
 * (`mongoose:query`, `:aggregate`, `:model:save`, `:model:insertMany`,
 * `:model:bulkWrite`, `:cursor:next`), published by mongoose >= 9.7.0.
 *
 * On older mongoose versions the channels are never published to, so the
 * subscribers are inert — there is no double-instrumentation against the
 * IITM-based vendored patcher, which is gated to `< 9.7.0`.
 *
 * Idempotent: subsequent calls are a no-op.
 */
export declare function subscribeMongooseDiagnosticChannels(tracingChannel: MongooseTracingChannelFactory): void;
//# sourceMappingURL=mongoose-dc-subscriber.d.ts.map
```

---

# COMANDO - mongoose-dc-subscriber.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\types-ts3.8\mongoose\mongoose-dc-subscriber.d.ts
**SHA:** a6e2aa38e6b45702
**Timestamp:** 2026-08-28T02:23:45.608322
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- export declare const MONGOOSE_DC_CHANNEL_AGGREGATE = "mongoose:aggregate";

### Ouro Bruto (primeiros 5000 chars)
```
import { TracingChannel } from 'node:diagnostics_channel';
export declare const MONGOOSE_DC_CHANNEL_QUERY = "mongoose:query";
export declare const MONGOOSE_DC_CHANNEL_AGGREGATE = "mongoose:aggregate";
export declare const MONGOOSE_DC_CHANNEL_MODEL_SAVE = "mongoose:model:save";
export declare const MONGOOSE_DC_CHANNEL_MODEL_INSERT_MANY = "mongoose:model:insertMany";
export declare const MONGOOSE_DC_CHANNEL_MODEL_BULK_WRITE = "mongoose:model:bulkWrite";
export declare const MONGOOSE_DC_CHANNEL_CURSOR_NEXT = "mongoose:cursor:next";
/**
 * Shape of the context object mongoose >= 9.7.0 publishes on its tracing
 * channels (mongoose's `TracingContext`, see `types/tracing.d.ts`).
 *
 * Node's `tracePromise` mutates this same object with `result`/`error` once the
 * operation settles, which `bindTracingChannelToSpan` reads in its lifecycle
 * handlers — hence both are declared optional here.
 *
 * Unlike redis/ioredis, mongoose does NOT pre-sanitize the payload, so `args`
 * carries the raw user query. We redact it before emitting `db.query.text`.
 */
export interface MongooseTracingData {
    operation: string;
    /** Absent for connection-level `aggregate()` calls, which have no model/collection. */
    collection?: string;
    database?: string;
    serverAddress?: string;
    serverPort?: number;
    /** Cursor channels only: the cursor's fetch batch size and tailable flag. */
    batchSize?: number;
    tailable?: boolean;
    /**
     * Operation-specific arguments. `filter` (queries/cursors) and `pipeline`
     * (aggregations) carry the query shape; `docs`/`ops` carry batch payloads.
     */
    args?: {
        filter?: unknown;
        pipeline?: unknown;
        docs?: unknown;
        ops?: unknown;
        [key: string]: unknown;
    };
    result?: unknown;
    error?: Error;
}
/**
 * Platform-provided factory that creates a native tracing channel for the given name. The
 * subscriber binds the span and its lifecycle onto the channel via `bindTracingChannelToSpan`,
 * which propagates the active span through the runtime's async context.
 *
 * Node passes `node:diagnostics_channel`'s `tracingChannel` directly.
 */
export type MongooseTracingChannelFactory = <T extends object>(name: string) => TracingChannel<T, T>;
/**
 * Subscribe Sentry span handlers to mongoose's diagnostics-channel events
 * (`mongoose:query`, `:aggregate`, `:model:save`, `:model:insertMany`,
 * `:model:bulkWrite`, `:cursor:next`), published by mongoose >= 9.7.0.
 *
 * On older mongoose versions the channels are never published to, so the
 * subscribers are inert — there is no double-instrumentation against the
 * IITM-based vendored patcher, which is gated to `< 9.7.0`.
 *
 * Idempotent: subsequent calls are a no-op.
 */
export declare function subscribeMongooseDiagnosticChannels(tracingChannel: MongooseTracingChannelFactory): void;
//# sourceMappingURL=mongoose-dc-subscriber.d.ts.map

```
# COMANDO - mysql2-dc-subscriber.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\types\mysql2\mysql2-dc-subscriber.d.ts
**SHA:** ba49fb0671f7d804
**Timestamp:** 2026-08-28T02:23:41.072951
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare const MYSQL2_DC_CHANNEL_EXECUTE = "mysql2:execute";

### Ouro Bruto (primeiros 5000 chars)
```
import type { TracingChannel } from 'node:diagnostics_channel';
export declare const MYSQL2_DC_CHANNEL_QUERY = "mysql2:query";
export declare const MYSQL2_DC_CHANNEL_EXECUTE = "mysql2:execute";
export declare const MYSQL2_DC_CHANNEL_CONNECT = "mysql2:connect";
export declare const MYSQL2_DC_CHANNEL_POOL_CONNECT = "mysql2:pool:connect";
/**
 * Shape of the context object mysql2 >= 3.20.0 publishes on its query/execute
 * tracing channels (see mysql2 `lib/base/connection.js`).
 *
 * Node's `traceCallback`/`tracePromise` mutate this same object with
 * `result`/`error` once the operation settles, which `bindTracingChannelToSpan`
 * reads in its lifecycle handlers — hence both are declared optional here.
 *
 * `query` is the SQL statement. On the `query` channel mysql2 has already
 * inlined `values` into it (`Connection.format`), so it carries raw user data;
 * on the `execute` channel it keeps `?` placeholders. Either way we sanitize it
 * before emitting `db.query.text` and never attach `values`.
 */
export interface MySQL2QueryData {
    query?: string;
    values?: unknown;
    database?: string;
    serverAddress?: string;
    /** Absent for unix-socket connections, where `serverAddress` is the socket path. */
    serverPort?: number;
    result?: unknown;
    error?: Error;
}
/**
 * Shape of the context object mysql2 >= 3.20.0 publishes on its
 * `connect`/`pool:connect` channels.
 */
export interface MySQL2ConnectData {
    database?: string;
    serverAddress?: string;
    serverPort?: number;
    user?: string;
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
export type MySQL2TracingChannelFactory = <T extends object>(name: string) => TracingChannel<T, T>;
/**
 * Subscribe Sentry span handlers to mysql2's diagnostics-channel events
 * (`mysql2:query`, `:execute`, `:connect`, `:pool:connect`), published by
 * mysql2 >= 3.20.0.
 *
 * On older mysql2 versions the channels are never published to, so the
 * subscribers are inert — there is no double-instrumentation against the
 * vendored OTel patcher, which is gated to `< 3.20.0`.
 */
export declare function subscribeMysql2DiagnosticChannels(tracingChannel: MySQL2TracingChannelFactory): void;
//# sourceMappingURL=mysql2-dc-subscriber.d.ts.map
```

---

# COMANDO - mysql2-dc-subscriber.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\types-ts3.8\mysql2\mysql2-dc-subscriber.d.ts
**SHA:** a9447b15c7e15611
**Timestamp:** 2026-08-28T02:23:45.688515
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare const MYSQL2_DC_CHANNEL_EXECUTE = "mysql2:execute";

### Ouro Bruto (primeiros 5000 chars)
```
import { TracingChannel } from 'node:diagnostics_channel';
export declare const MYSQL2_DC_CHANNEL_QUERY = "mysql2:query";
export declare const MYSQL2_DC_CHANNEL_EXECUTE = "mysql2:execute";
export declare const MYSQL2_DC_CHANNEL_CONNECT = "mysql2:connect";
export declare const MYSQL2_DC_CHANNEL_POOL_CONNECT = "mysql2:pool:connect";
/**
 * Shape of the context object mysql2 >= 3.20.0 publishes on its query/execute
 * tracing channels (see mysql2 `lib/base/connection.js`).
 *
 * Node's `traceCallback`/`tracePromise` mutate this same object with
 * `result`/`error` once the operation settles, which `bindTracingChannelToSpan`
 * reads in its lifecycle handlers — hence both are declared optional here.
 *
 * `query` is the SQL statement. On the `query` channel mysql2 has already
 * inlined `values` into it (`Connection.format`), so it carries raw user data;
 * on the `execute` channel it keeps `?` placeholders. Either way we sanitize it
 * before emitting `db.query.text` and never attach `values`.
 */
export interface MySQL2QueryData {
    query?: string;
    values?: unknown;
    database?: string;
    serverAddress?: string;
    /** Absent for unix-socket connections, where `serverAddress` is the socket path. */
    serverPort?: number;
    result?: unknown;
    error?: Error;
}
/**
 * Shape of the context object mysql2 >= 3.20.0 publishes on its
 * `connect`/`pool:connect` channels.
 */
export interface MySQL2ConnectData {
    database?: string;
    serverAddress?: string;
    serverPort?: number;
    user?: string;
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
export type MySQL2TracingChannelFactory = <T extends object>(name: string) => TracingChannel<T, T>;
/**
 * Subscribe Sentry span handlers to mysql2's diagnostics-channel events
 * (`mysql2:query`, `:execute`, `:connect`, `:pool:connect`), published by
 * mysql2 >= 3.20.0.
 *
 * On older mysql2 versions the channels are never published to, so the
 * subscribers are inert — there is no double-instrumentation against the
 * vendored OTel patcher, which is gated to `< 3.20.0`.
 */
export declare function subscribeMysql2DiagnosticChannels(tracingChannel: MySQL2TracingChannelFactory): void;
//# sourceMappingURL=mysql2-dc-subscriber.d.ts.map

```
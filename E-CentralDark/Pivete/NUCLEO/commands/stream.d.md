# COMANDO - stream.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\stream.d.ts
**SHA:** 80523c00b8544a20
**Timestamp:** 2026-08-26T19:32:03.775461
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: this interface never existed; remove in next major

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * A stream is an abstract interface for working with streaming data in Node.js.
 * The `node:stream` module provides an API for implementing the stream interface.
 *
 * There are many stream objects provided by Node.js. For instance, a [request to an HTTP server](https://nodejs.org/docs/latest-v22.x/api/http.html#class-httpincomingmessage)
 * and [`process.stdout`](https://nodejs.org/docs/latest-v22.x/api/process.html#processstdout) are both stream instances.
 *
 * Streams can be readable, writable, or both. All streams are instances of [`EventEmitter`](https://nodejs.org/docs/latest-v22.x/api/events.html#class-eventemitter).
 *
 * To access the `node:stream` module:
 *
 * ```js
 * import stream from 'node:stream';
 * ```
 *
 * The `node:stream` module is useful for creating new types of stream instances.
 * It is usually not necessary to use the `node:stream` module to consume streams.
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/stream.js)
 */
declare module "stream" {
    import { Abortable, EventEmitter } from "node:events";
    import { Blob as NodeBlob } from "node:buffer";
    import * as streamPromises from "node:stream/promises";
    import * as streamWeb from "node:stream/web";

    type ComposeFnParam = (source: any) => void;

    class Stream extends EventEmitter {
        pipe<T extends NodeJS.WritableStream>(
            destination: T,
            options?: {
                end?: boolean | undefined;
            },
        ): T;
        compose<T extends NodeJS.ReadableStream>(
            stream: T | ComposeFnParam | Iterable<T> | AsyncIterable<T>,
            options?: { signal: AbortSignal },
        ): T;
    }
    namespace Stream {
        export { Stream, streamPromises as promises };
    }
    namespace Stream {
        interface StreamOptions<T extends Stream> extends Abortable {
            emitClose?: boolean | undefined;
            highWaterMark?: number | undefined;
            objectMode?: boolean | undefined;
            construct?: ((this: T, callback: (error?: Error | null) => void) => void) | undefined;
            destroy?: ((this: T, error: Error | null, callback: (error?: Error | null) => void) => void) | undefined;
            autoDestroy?: boolean | undefined;
        }
        interface ReadableOptions<T extends Readable = Readable> extends StreamOptions<T> {
            encoding?: BufferEncoding | undefined;
            read?: ((this: T, size: number) => void) | undefined;
        }
        interface ArrayOptions {
            /**
             * The maximum concurrent invocations of `fn` to call on the stream at once.
             * @default 1
             */
            concurrency?: number | undefined;
            /** Allows destroying the stream if the signal is aborted. */
            signal?: AbortSignal | undefined;
        }
        /**
         * @since v0.9.4
         */
        class Readable extends Stream implements NodeJS.ReadableStream {
            /**
             * A utility method for creating Readable Streams out of iterators.
             * @since v12.3.0, v10.17.0
             * @param iterable Object implementing the `Symbol.asyncIterator` or `Symbol.iterator` iterable protocol. Emits an 'error' event if a null value is passed.
             * @param options Options provided to `new stream.Readable([options])`. By default, `Readable.from()` will set `options.objectMode` to `true`, unless this is explicitly opted out by setting `options.objectMode` to `false`.
             */
            static from(iterable: Iterable<any> | AsyncIterable<any>, options?: ReadableOptions): Readable;
            /**
             * A utility method for creating a `Readable` from a web `ReadableStream`.
             * @since v17.0.0
             */
            static fromWeb(
                readableStream: streamWeb.ReadableStream,
                options?: Pick<ReadableOptions, "encoding" | "highWaterMark" | "objectMode" | "signal">,
            ): Readable;
            /**
             * A utility method for creating a web `ReadableStream` from a `Readable`.
             * @since v17.0.0
             */
            static toWeb(
                streamReadable: Readable,
                options?: {
                    strategy?: streamWeb.QueuingStrategy | undefined;
                },
            ): streamWeb.ReadableStream;
            /**
             * Returns whether the stream has been read from or cancelled.
             * @since v16.8.0
             */
            static isDisturbed(stream: Readable | NodeJS.ReadableStream): boolean;
            /**
             * Returns whether the stream was destroyed or errored before emitting `'end'`.
             * @since v16.8.0
             */
            readonly readableAborted: boolean;
            /**
             * Is `true` if it is safe to call {@link read}, which means
             * the stream has not been destroyed or emitted `'error'` or `'end'`.
             * @since v11.4.0
      
```
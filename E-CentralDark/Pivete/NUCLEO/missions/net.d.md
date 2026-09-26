# MISSAO - net.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\net.d.ts
**SHA:** a6f137d651076822
**Timestamp:** 2026-08-26T19:32:03.649536
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- addRange(start: string, end: string, type?: IPVersion): void;
- addRange(start: SocketAddress, end: SocketAddress): void;

### Gaps
- // TODO: remove empty ConnectOpts placeholder at next major @types/node version.

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * > Stability: 2 - Stable
 *
 * The `node:net` module provides an asynchronous network API for creating stream-based
 * TCP or `IPC` servers ({@link createServer}) and clients
 * ({@link createConnection}).
 *
 * It can be accessed using:
 *
 * ```js
 * import net from 'node:net';
 * ```
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/net.js)
 */
declare module "net" {
    import { NonSharedBuffer } from "node:buffer";
    import * as stream from "node:stream";
    import { Abortable, EventEmitter } from "node:events";
    import * as dns from "node:dns";
    type LookupFunction = (
        hostname: string,
        options: dns.LookupOptions,
        callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void,
    ) => void;
    interface AddressInfo {
        address: string;
        family: string;
        port: number;
    }
    interface SocketConstructorOpts {
        fd?: number | undefined;
        allowHalfOpen?: boolean | undefined;
        onread?: OnReadOpts | undefined;
        readable?: boolean | undefined;
        writable?: boolean | undefined;
        signal?: AbortSignal | undefined;
    }
    interface OnReadOpts {
        buffer: Uint8Array | (() => Uint8Array);
        /**
         * This function is called for every chunk of incoming data.
         * Two arguments are passed to it: the number of bytes written to `buffer` and a reference to `buffer`.
         * Return `false` from this function to implicitly `pause()` the socket.
         */
        callback(bytesWritten: number, buffer: Uint8Array): boolean;
    }
    // TODO: remove empty ConnectOpts placeholder at next major @types/node version.
    /** @deprecated */
    interface ConnectOpts {}
    interface TcpSocketConnectOpts {
        port: number;
        host?: string | undefined;
        localAddress?: string | undefined;
        localPort?: number | undefined;
        hints?: number | undefined;
        family?: number | undefined;
        lookup?: LookupFunction | undefined;
        noDelay?: boolean | undefined;
        keepAlive?: boolean | undefined;
        keepAliveInitialDelay?: number | undefined;
        /**
         * @since v18.13.0
         */
        autoSelectFamily?: boolean | undefined;
        /**
         * @since v18.13.0
         */
        autoSelectFamilyAttemptTimeout?: number | undefined;
        blockList?: BlockList | undefined;
    }
    interface IpcSocketConnectOpts {
        path: string;
    }
    type SocketConnectOpts = TcpSocketConnectOpts | IpcSocketConnectOpts;
    type SocketReadyState = "opening" | "open" | "readOnly" | "writeOnly" | "closed";
    /**
     * This class is an abstraction of a TCP socket or a streaming `IPC` endpoint
     * (uses named pipes on Windows, and Unix domain sockets otherwise). It is also
     * an `EventEmitter`.
     *
     * A `net.Socket` can be created by the user and used directly to interact with
     * a server. For example, it is returned by {@link createConnection},
     * so the user can use it to talk to the server.
     *
     * It can also be created by Node.js and passed to the user when a connection
     * is received. For example, it is passed to the listeners of a `'connection'` event emitted on a {@link Server}, so the user can use
     * it to interact with the client.
     * @since v0.3.4
     */
    class Socket extends stream.Duplex {
        constructor(options?: SocketConstructorOpts);
        /**
         * Destroys the socket after all data is written. If the `finish` event was already emitted the socket is destroyed immediately.
         * If the socket is still writable it implicitly calls `socket.end()`.
         * @since v0.3.4
         */
        destroySoon(): void;
        /**
         * Sends data on the socket. The second parameter specifies the encoding in the
         * case of a string. It defaults to UTF8 encoding.
         *
         * Returns `true` if the entire data was flushed successfully to the kernel
         * buffer. Returns `false` if all or part of the data was queued in user memory.`'drain'` will be emitted when the buffer is again free.
         *
         * The optional `callback` parameter will be executed when the data is finally
         * written out, which may not be immediately.
         *
         * See `Writable` stream `write()` method for more
         * information.
         * @since v0.1.90
         */
        write(buffer: Uint8Array | string, cb?: (err?: Error | null) => void): boolean;
        /**
         * Sends data on the socket, with an explicit encoding for string data.
         * @see {@link Socket.write} for full details.
         * @since v0.1.90
         * @param [encoding='utf8'] Only used when data is `string`.
         */
        write(str: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error | null) => void): boolean;
        /**
         * Initiate a connection on a given socket.
         *
    
```
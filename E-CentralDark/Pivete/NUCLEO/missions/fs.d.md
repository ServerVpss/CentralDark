# MISSAO - fs.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\fs.d.ts
**SHA:** c906fb15bd2aabc9
**Timestamp:** 2026-08-26T19:32:03.559011
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * createReadStream('sample.txt', { start: 90, end: 99 });

### Padroes
- pattern: string | readonly string[],
- pattern: string | readonly string[],
- pattern: string | readonly string[],
- pattern: string | readonly string[],
- export function globSync(pattern: string | readonly string[]): string[];
- pattern: string | readonly string[],
- pattern: string | readonly string[],
- pattern: string | readonly string[],

### Gaps
- // TODO: remove in future major
- // TODO: remove in future major
- // TODO: remove default in future major version
- // TODO: remove default in future major version

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * The `node:fs` module enables interacting with the file system in a
 * way modeled on standard POSIX functions.
 *
 * To use the promise-based APIs:
 *
 * ```js
 * import * as fs from 'node:fs/promises';
 * ```
 *
 * To use the callback and sync APIs:
 *
 * ```js
 * import * as fs from 'node:fs';
 * ```
 *
 * All file system operations have synchronous, callback, and promise-based
 * forms, and are accessible using both CommonJS syntax and ES6 Modules (ESM).
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/fs.js)
 */
declare module "fs" {
    import { NonSharedBuffer } from "node:buffer";
    import * as stream from "node:stream";
    import { Abortable, EventEmitter } from "node:events";
    import { URL } from "node:url";
    import * as promises from "node:fs/promises";
    export { promises };
    /**
     * Valid types for path values in "fs".
     */
    export type PathLike = string | Buffer | URL;
    export type PathOrFileDescriptor = PathLike | number;
    export type TimeLike = string | number | Date;
    export type NoParamCallback = (err: NodeJS.ErrnoException | null) => void;
    export type BufferEncodingOption =
        | "buffer"
        | {
            encoding: "buffer";
        };
    export interface ObjectEncodingOptions {
        encoding?: BufferEncoding | null | undefined;
    }
    export type EncodingOption = ObjectEncodingOptions | BufferEncoding | undefined | null;
    export type OpenMode = number | string;
    export type Mode = number | string;
    export interface StatsBase<T> {
        isFile(): boolean;
        isDirectory(): boolean;
        isBlockDevice(): boolean;
        isCharacterDevice(): boolean;
        isSymbolicLink(): boolean;
        isFIFO(): boolean;
        isSocket(): boolean;
        dev: T;
        ino: T;
        mode: T;
        nlink: T;
        uid: T;
        gid: T;
        rdev: T;
        size: T;
        blksize: T;
        blocks: T;
        atimeMs: T;
        mtimeMs: T;
        ctimeMs: T;
        birthtimeMs: T;
        atime: Date;
        mtime: Date;
        ctime: Date;
        birthtime: Date;
    }
    export interface Stats extends StatsBase<number> {}
    /**
     * A `fs.Stats` object provides information about a file.
     *
     * Objects returned from {@link stat}, {@link lstat}, {@link fstat}, and
     * their synchronous counterparts are of this type.
     * If `bigint` in the `options` passed to those methods is true, the numeric values
     * will be `bigint` instead of `number`, and the object will contain additional
     * nanosecond-precision properties suffixed with `Ns`. `Stat` objects are not to be created directly using the `new` keyword.
     *
     * ```console
     * Stats {
     *   dev: 2114,
     *   ino: 48064969,
     *   mode: 33188,
     *   nlink: 1,
     *   uid: 85,
     *   gid: 100,
     *   rdev: 0,
     *   size: 527,
     *   blksize: 4096,
     *   blocks: 8,
     *   atimeMs: 1318289051000.1,
     *   mtimeMs: 1318289051000.1,
     *   ctimeMs: 1318289051000.1,
     *   birthtimeMs: 1318289051000.1,
     *   atime: Mon, 10 Oct 2011 23:24:11 GMT,
     *   mtime: Mon, 10 Oct 2011 23:24:11 GMT,
     *   ctime: Mon, 10 Oct 2011 23:24:11 GMT,
     *   birthtime: Mon, 10 Oct 2011 23:24:11 GMT }
     * ```
     *
     * `bigint` version:
     *
     * ```console
     * BigIntStats {
     *   dev: 2114n,
     *   ino: 48064969n,
     *   mode: 33188n,
     *   nlink: 1n,
     *   uid: 85n,
     *   gid: 100n,
     *   rdev: 0n,
     *   size: 527n,
     *   blksize: 4096n,
     *   blocks: 8n,
     *   atimeMs: 1318289051000n,
     *   mtimeMs: 1318289051000n,
     *   ctimeMs: 1318289051000n,
     *   birthtimeMs: 1318289051000n,
     *   atimeNs: 1318289051000000000n,
     *   mtimeNs: 1318289051000000000n,
     *   ctimeNs: 1318289051000000000n,
     *   birthtimeNs: 1318289051000000000n,
     *   atime: Mon, 10 Oct 2011 23:24:11 GMT,
     *   mtime: Mon, 10 Oct 2011 23:24:11 GMT,
     *   ctime: Mon, 10 Oct 2011 23:24:11 GMT,
     *   birthtime: Mon, 10 Oct 2011 23:24:11 GMT }
     * ```
     * @since v0.1.21
     */
    export class Stats {
        private constructor();
    }
    export interface StatsFsBase<T> {
        /** Type of file system. */
        type: T;
        /**  Optimal transfer block size. */
        bsize: T;
        /**  Total data blocks in file system. */
        blocks: T;
        /** Free blocks in file system. */
        bfree: T;
        /** Available blocks for unprivileged users */
        bavail: T;
        /** Total file nodes in file system. */
        files: T;
        /** Free file nodes in file system. */
        ffree: T;
    }
    export interface StatsFs extends StatsFsBase<number> {}
    /**
     * Provides information about a mounted file system.
     *
     * Objects returned from {@link statfs} and its synchronous counterpart are of
     * this type. If `bigint` in the `options` passed to those methods is `true`, the
     * numeric values w
```
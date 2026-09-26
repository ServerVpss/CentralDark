# OUTRO - child_process.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\child_process.d.ts
**SHA:** 13f5c844119c43e5
**Timestamp:** 2026-08-26T19:32:04.232390
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Just Plain Wrong™ (see also nodejs/node#57392)
- // TODO: execFile exceptions can take many forms... this accurately describes none of them

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * The `node:child_process` module provides the ability to spawn subprocesses in
 * a manner that is similar, but not identical, to [`popen(3)`](http://man7.org/linux/man-pages/man3/popen.3.html). This capability
 * is primarily provided by the {@link spawn} function:
 *
 * ```js
 * import { spawn } from 'node:child_process';
 * const ls = spawn('ls', ['-lh', '/usr']);
 *
 * ls.stdout.on('data', (data) => {
 *   console.log(`stdout: ${data}`);
 * });
 *
 * ls.stderr.on('data', (data) => {
 *   console.error(`stderr: ${data}`);
 * });
 *
 * ls.on('close', (code) => {
 *   console.log(`child process exited with code ${code}`);
 * });
 * ```
 *
 * By default, pipes for `stdin`, `stdout`, and `stderr` are established between
 * the parent Node.js process and the spawned subprocess. These pipes have
 * limited (and platform-specific) capacity. If the subprocess writes to
 * stdout in excess of that limit without the output being captured, the
 * subprocess blocks, waiting for the pipe buffer to accept more data. This is
 * identical to the behavior of pipes in the shell. Use the `{ stdio: 'ignore' }` option if the output will not be consumed.
 *
 * The command lookup is performed using the `options.env.PATH` environment
 * variable if `env` is in the `options` object. Otherwise, `process.env.PATH` is
 * used. If `options.env` is set without `PATH`, lookup on Unix is performed
 * on a default search path search of `/usr/bin:/bin` (see your operating system's
 * manual for execvpe/execvp), on Windows the current processes environment
 * variable `PATH` is used.
 *
 * On Windows, environment variables are case-insensitive. Node.js
 * lexicographically sorts the `env` keys and uses the first one that
 * case-insensitively matches. Only first (in lexicographic order) entry will be
 * passed to the subprocess. This might lead to issues on Windows when passing
 * objects to the `env` option that have multiple variants of the same key, such as `PATH` and `Path`.
 *
 * The {@link spawn} method spawns the child process asynchronously,
 * without blocking the Node.js event loop. The {@link spawnSync} function provides equivalent functionality in a synchronous manner that blocks
 * the event loop until the spawned process either exits or is terminated.
 *
 * For convenience, the `node:child_process` module provides a handful of
 * synchronous and asynchronous alternatives to {@link spawn} and {@link spawnSync}. Each of these alternatives are implemented on
 * top of {@link spawn} or {@link spawnSync}.
 *
 * * {@link exec}: spawns a shell and runs a command within that
 * shell, passing the `stdout` and `stderr` to a callback function when
 * complete.
 * * {@link execFile}: similar to {@link exec} except
 * that it spawns the command directly without first spawning a shell by
 * default.
 * * {@link fork}: spawns a new Node.js process and invokes a
 * specified module with an IPC communication channel established that allows
 * sending messages between parent and child.
 * * {@link execSync}: a synchronous version of {@link exec} that will block the Node.js event loop.
 * * {@link execFileSync}: a synchronous version of {@link execFile} that will block the Node.js event loop.
 *
 * For certain use cases, such as automating shell scripts, the `synchronous counterparts` may be more convenient. In many cases, however,
 * the synchronous methods can have significant impact on performance due to
 * stalling the event loop while spawned processes complete.
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/child_process.js)
 */
declare module "child_process" {
    import { NonSharedBuffer } from "node:buffer";
    import { Abortable, EventEmitter } from "node:events";
    import * as dgram from "node:dgram";
    import * as net from "node:net";
    import { Readable, Stream, Writable } from "node:stream";
    import { URL } from "node:url";
    type Serializable = string | object | number | boolean | bigint;
    type SendHandle = net.Socket | net.Server | dgram.Socket | undefined;
    /**
     * Instances of the `ChildProcess` represent spawned child processes.
     *
     * Instances of `ChildProcess` are not intended to be created directly. Rather,
     * use the {@link spawn}, {@link exec},{@link execFile}, or {@link fork} methods to create
     * instances of `ChildProcess`.
     * @since v2.2.0
     */
    class ChildProcess extends EventEmitter {
        /**
         * A `Writable Stream` that represents the child process's `stdin`.
         *
         * If a child process waits to read all of its input, the child will not continue
         * until this stream has been closed via `end()`.
         *
         * If the child was spawned with `stdio[0]` set to anything other than `'pipe'`,
         * then this will be `null`.
         *
         * `subprocess.stdin` is an alias for `subprocess.stdio[0]`. Both properties will
         * refer to the same value.
         *
         * The `subprocess.stdin` proper
```
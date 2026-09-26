# COMANDO - repl.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\repl.d.ts
**SHA:** 4f9d8ca0c417b67b
**Timestamp:** 2026-08-26T19:32:03.743536
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * const replServer = repl.start({ prompt: '> ' });
- * If `options` is a string, then it specifies the input prompt:

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * The `node:repl` module provides a Read-Eval-Print-Loop (REPL) implementation
 * that is available both as a standalone program or includible in other
 * applications. It can be accessed using:
 *
 * ```js
 * import repl from 'node:repl';
 * ```
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/repl.js)
 */
declare module "repl" {
    import { AsyncCompleter, Completer, Interface } from "node:readline";
    import { Context } from "node:vm";
    import { InspectOptions } from "node:util";
    interface ReplOptions {
        /**
         * The input prompt to display.
         * @default "> "
         */
        prompt?: string | undefined;
        /**
         * The `Readable` stream from which REPL input will be read.
         * @default process.stdin
         */
        input?: NodeJS.ReadableStream | undefined;
        /**
         * The `Writable` stream to which REPL output will be written.
         * @default process.stdout
         */
        output?: NodeJS.WritableStream | undefined;
        /**
         * If `true`, specifies that the output should be treated as a TTY terminal, and have
         * ANSI/VT100 escape codes written to it.
         * Default: checking the value of the `isTTY` property on the output stream upon
         * instantiation.
         */
        terminal?: boolean | undefined;
        /**
         * The function to be used when evaluating each given line of input.
         * **Default:** an async wrapper for the JavaScript `eval()` function. An `eval` function can
         * error with `repl.Recoverable` to indicate the input was incomplete and prompt for
         * additional lines. See the [custom evaluation functions](https://nodejs.org/dist/latest-v22.x/docs/api/repl.html#custom-evaluation-functions)
         * section for more details.
         */
        eval?: REPLEval | undefined;
        /**
         * Defines if the repl prints output previews or not.
         * @default `true` Always `false` in case `terminal` is falsy.
         */
        preview?: boolean | undefined;
        /**
         * If `true`, specifies that the default `writer` function should include ANSI color
         * styling to REPL output. If a custom `writer` function is provided then this has no
         * effect.
         * @default the REPL instance's `terminal` value
         */
        useColors?: boolean | undefined;
        /**
         * If `true`, specifies that the default evaluation function will use the JavaScript
         * `global` as the context as opposed to creating a new separate context for the REPL
         * instance. The node CLI REPL sets this value to `true`.
         * @default false
         */
        useGlobal?: boolean | undefined;
        /**
         * If `true`, specifies that the default writer will not output the return value of a
         * command if it evaluates to `undefined`.
         * @default false
         */
        ignoreUndefined?: boolean | undefined;
        /**
         * The function to invoke to format the output of each command before writing to `output`.
         * @default a wrapper for `util.inspect`
         *
         * @see https://nodejs.org/dist/latest-v22.x/docs/api/repl.html#repl_customizing_repl_output
         */
        writer?: REPLWriter | undefined;
        /**
         * An optional function used for custom Tab auto completion.
         *
         * @see https://nodejs.org/dist/latest-v22.x/docs/api/readline.html#readline_use_of_the_completer_function
         */
        completer?: Completer | AsyncCompleter | undefined;
        /**
         * A flag that specifies whether the default evaluator executes all JavaScript commands in
         * strict mode or default (sloppy) mode.
         * Accepted values are:
         * - `repl.REPL_MODE_SLOPPY` - evaluates expressions in sloppy mode.
         * - `repl.REPL_MODE_STRICT` - evaluates expressions in strict mode. This is equivalent to
         *   prefacing every repl statement with `'use strict'`.
         */
        replMode?: typeof REPL_MODE_SLOPPY | typeof REPL_MODE_STRICT | undefined;
        /**
         * Stop evaluating the current piece of code when `SIGINT` is received, i.e. `Ctrl+C` is
         * pressed. This cannot be used together with a custom `eval` function.
         * @default false
         */
        breakEvalOnSigint?: boolean | undefined;
    }
    type REPLEval = (
        this: REPLServer,
        evalCmd: string,
        context: Context,
        file: string,
        cb: (err: Error | null, result: any) => void,
    ) => void;
    type REPLWriter = (this: REPLServer, obj: any) => string;
    /**
     * This is the default "writer" value, if none is passed in the REPL options,
     * and it can be overridden by custom print functions.
     */
    const writer: REPLWriter & {
        options: InspectOptions;
    };
    type REPLCommandAction = (this: REPLServer, text: string) => void;
    interface REPLCommand {
        /**
         * H
```
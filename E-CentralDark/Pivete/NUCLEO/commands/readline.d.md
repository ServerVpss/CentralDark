# COMANDO - readline.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\readline.d.ts
**SHA:** 71a0f3ad612c123b
**Timestamp:** 2026-08-26T19:32:03.712469
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- setPrompt(prompt: string): void;
- *   prompt: 'OHAI> ',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * The `node:readline` module provides an interface for reading data from a [Readable](https://nodejs.org/docs/latest-v22.x/api/stream.html#readable-streams) stream
 * (such as [`process.stdin`](https://nodejs.org/docs/latest-v22.x/api/process.html#processstdin)) one line at a time.
 *
 * To use the promise-based APIs:
 *
 * ```js
 * import * as readline from 'node:readline/promises';
 * ```
 *
 * To use the callback and sync APIs:
 *
 * ```js
 * import * as readline from 'node:readline';
 * ```
 *
 * The following simple example illustrates the basic use of the `node:readline` module.
 *
 * ```js
 * import * as readline from 'node:readline/promises';
 * import { stdin as input, stdout as output } from 'node:process';
 *
 * const rl = readline.createInterface({ input, output });
 *
 * const answer = await rl.question('What do you think of Node.js? ');
 *
 * console.log(`Thank you for your valuable feedback: ${answer}`);
 *
 * rl.close();
 * ```
 *
 * Once this code is invoked, the Node.js application will not terminate until the `readline.Interface` is closed because the interface waits for data to be
 * received on the `input` stream.
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/readline.js)
 */
declare module "readline" {
    import { Abortable, EventEmitter } from "node:events";
    import * as promises from "node:readline/promises";
    export { promises };
    export interface Key {
        sequence?: string | undefined;
        name?: string | undefined;
        ctrl?: boolean | undefined;
        meta?: boolean | undefined;
        shift?: boolean | undefined;
    }
    /**
     * Instances of the `readline.Interface` class are constructed using the `readline.createInterface()` method. Every instance is associated with a
     * single `input` [Readable](https://nodejs.org/docs/latest-v22.x/api/stream.html#readable-streams) stream and a single `output` [Writable](https://nodejs.org/docs/latest-v22.x/api/stream.html#writable-streams) stream.
     * The `output` stream is used to print prompts for user input that arrives on,
     * and is read from, the `input` stream.
     * @since v0.1.104
     */
    export class Interface extends EventEmitter implements Disposable {
        readonly terminal: boolean;
        /**
         * The current input data being processed by node.
         *
         * This can be used when collecting input from a TTY stream to retrieve the
         * current value that has been processed thus far, prior to the `line` event
         * being emitted. Once the `line` event has been emitted, this property will
         * be an empty string.
         *
         * Be aware that modifying the value during the instance runtime may have
         * unintended consequences if `rl.cursor` is not also controlled.
         *
         * **If not using a TTY stream for input, use the `'line'` event.**
         *
         * One possible use case would be as follows:
         *
         * ```js
         * const values = ['lorem ipsum', 'dolor sit amet'];
         * const rl = readline.createInterface(process.stdin);
         * const showResults = debounce(() => {
         *   console.log(
         *     '\n',
         *     values.filter((val) => val.startsWith(rl.line)).join(' '),
         *   );
         * }, 300);
         * process.stdin.on('keypress', (c, k) => {
         *   showResults();
         * });
         * ```
         * @since v0.1.98
         */
        readonly line: string;
        /**
         * The cursor position relative to `rl.line`.
         *
         * This will track where the current cursor lands in the input string, when
         * reading input from a TTY stream. The position of cursor determines the
         * portion of the input string that will be modified as input is processed,
         * as well as the column where the terminal caret will be rendered.
         * @since v0.1.98
         */
        readonly cursor: number;
        /**
         * NOTE: According to the documentation:
         *
         * > Instances of the `readline.Interface` class are constructed using the
         * > `readline.createInterface()` method.
         *
         * @see https://nodejs.org/dist/latest-v22.x/docs/api/readline.html#class-interfaceconstructor
         */
        protected constructor(
            input: NodeJS.ReadableStream,
            output?: NodeJS.WritableStream,
            completer?: Completer | AsyncCompleter,
            terminal?: boolean,
        );
        /**
         * NOTE: According to the documentation:
         *
         * > Instances of the `readline.Interface` class are constructed using the
         * > `readline.createInterface()` method.
         *
         * @see https://nodejs.org/dist/latest-v22.x/docs/api/readline.html#class-interfaceconstructor
         */
        protected constructor(options: ReadLineOptions);
        /**
         * The `rl.getPrompt()` method returns the current prompt used by `rl.prompt()`.
 
```
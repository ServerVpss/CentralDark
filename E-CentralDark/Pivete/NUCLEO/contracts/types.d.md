# CONTRATO - types.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\libcjs\types.d.ts
**SHA:** c800ee866627d523
**Timestamp:** 2026-08-28T02:24:08.019008
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- oldStart: number;
- newStart: number;

### Ouro Bruto (primeiros 5000 chars)
```
export interface ChangeObject<ValueT> {
    /**
     * The concatenated content of all the tokens represented by this change object - i.e. generally the text that is either added, deleted, or common, as a single string.
     * In cases where tokens are considered common but are non-identical (e.g. because an option like `ignoreCase` or a custom `comparator` was used), the value from the *new* string will be provided here.
     */
    value: ValueT;
    /**
     * true if the value was inserted into the new string, otherwise false
     */
    added: boolean;
    /**
     * true if the value was removed from the old string, otherwise false
     */
    removed: boolean;
    /**
     * How many tokens (e.g. chars for `diffChars`, lines for `diffLines`) the value in the change object consists of
     */
    count: number;
}
export type Change = ChangeObject<string>;
export type ArrayChange<T> = ChangeObject<T[]>;
export interface CommonDiffOptions {
    /**
     * If `true`, the array of change objects returned will contain one change object per token (e.g. one per line if calling `diffLines`), instead of runs of consecutive tokens that are all added / all removed / all conserved being combined into a single change object.
     */
    oneChangePerToken?: boolean;
}
export interface TimeoutOption {
    /**
     * A number of milliseconds after which the diffing algorithm will abort and return `undefined`.
     * Supported by the same functions as `maxEditLength`.
     */
    timeout: number;
}
export interface MaxEditLengthOption {
    /**
     * A number specifying the maximum edit distance to consider between the old and new texts.
     * You can use this to limit the computational cost of diffing large, very different texts by giving up early if the cost will be huge.
     * This option can be passed either to diffing functions (`diffLines`, `diffChars`, etc) or to patch-creation function (`structuredPatch`, `createPatch`, etc), all of which will indicate that the max edit length was reached by returning `undefined` instead of whatever they'd normally return.
     */
    maxEditLength: number;
}
export type AbortableDiffOptions = TimeoutOption | MaxEditLengthOption;
export type DiffCallbackNonabortable<T> = (result: ChangeObject<T>[]) => void;
export type DiffCallbackAbortable<T> = (result: ChangeObject<T>[] | undefined) => void;
export interface CallbackOptionNonabortable<T> {
    /**
     * If provided, the diff will be computed in async mode to avoid blocking the event loop while the diff is calculated.
     * The value of the `callback` option should be a function and will be passed the computed diff or patch as its first argument.
     */
    callback: DiffCallbackNonabortable<T>;
}
export interface CallbackOptionAbortable<T> {
    /**
     * If provided, the diff will be computed in async mode to avoid blocking the event loop while the diff is calculated.
     * The value of the `callback` option should be a function and will be passed the computed diff or patch as its first argument.
     */
    callback: DiffCallbackAbortable<T>;
}
interface DiffArraysOptions<T> extends CommonDiffOptions {
    comparator?: (a: T, b: T) => boolean;
}
export interface DiffArraysOptionsNonabortable<T> extends DiffArraysOptions<T> {
    /**
     * If provided, the diff will be computed in async mode to avoid blocking the event loop while the diff is calculated.
     * The value of the `callback` option should be a function and will be passed the computed diff or patch as its first argument.
     */
    callback?: DiffCallbackNonabortable<T[]>;
}
export type DiffArraysOptionsAbortable<T> = DiffArraysOptions<T> & AbortableDiffOptions & Partial<CallbackOptionAbortable<T[]>>;
interface DiffCharsOptions extends CommonDiffOptions {
    /**
     * If `true`, the uppercase and lowercase forms of a character are considered equal.
     * @default false
     */
    ignoreCase?: boolean;
}
export interface DiffCharsOptionsNonabortable extends DiffCharsOptions {
    /**
     * If provided, the diff will be computed in async mode to avoid blocking the event loop while the diff is calculated.
     * The value of the `callback` option should be a function and will be passed the computed diff or patch as its first argument.
     */
    callback?: DiffCallbackNonabortable<string>;
}
export type DiffCharsOptionsAbortable = DiffCharsOptions & AbortableDiffOptions & Partial<CallbackOptionAbortable<string>>;
interface DiffLinesOptions extends CommonDiffOptions {
    /**
     * `true` to remove all trailing CR (`\r`) characters before performing the diff.
     * This helps to get a useful diff when diffing UNIX text files against Windows text files.
     * @default false
     */
    stripTrailingCr?: boolean;
    /**
     * `true` to treat the newline character at the end of each line as its own token.
     * This allows for changes to the newline structure to occur independently of the line content and to be treated as such.
     * In general t
```
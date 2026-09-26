# OUTRO - span.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\script\token\span.d.mts
**SHA:** a5c8d3cf45db09d5
**Timestamp:** 2026-08-28T02:25:51.327332
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare function Span<Start extends string, End extends string, MultiLine extends boolean, Input extends string>(start: Start, end: End, multiLine: MultiLine, input: Input): TSpan<Start, End, M

### Ouro Bruto (primeiros 5000 chars)
```
import { type TTrim } from './internal/trim.mjs';
import { type TNewLine } from './internal/char.mjs';
import { type TTake } from './internal/take.mjs';
import { type TUntil } from './until.mjs';
type TMultiLine<Start extends string, End extends string, Input extends string> = (TTake<[Start], Input> extends [infer _, infer Rest extends string] ? TUntil<[End], Rest> extends [infer Until extends string, infer UntilRest extends string] ? TTake<[End], UntilRest> extends [infer _ extends string, infer Rest extends string] ? [`${Until}`, Rest] : [] : [] : []);
type TSingleLine<Start extends string, End extends string, Input extends string> = (TTake<[Start], Input> extends [infer _ extends string, infer Rest extends string] ? TUntil<[TNewLine, End], Rest> extends [infer Until extends string, infer UntilRest extends string] ? TTake<[End], UntilRest> extends [infer _ extends string, infer EndRest extends string] ? [`${Until}`, EndRest] : [] : [] : []);
/** Matches from Start and End capturing everything in-between. Start and End are consumed. */
export type TSpan<Start extends string, End extends string, MultiLine extends boolean, Input extends string> = (MultiLine extends true ? TMultiLine<Start, End, TTrim<Input>> : TSingleLine<Start, End, TTrim<Input>>);
/** Matches from Start and End capturing everything in-between. Start and End are consumed. */
export declare function Span<Start extends string, End extends string, MultiLine extends boolean, Input extends string>(start: Start, end: End, multiLine: MultiLine, input: Input): TSpan<Start, End, MultiLine, Input>;
export {};

```
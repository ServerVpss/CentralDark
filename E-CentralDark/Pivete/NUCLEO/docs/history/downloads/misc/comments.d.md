# OUTRO - comments.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\meriyah@6.1.4@@@1\dist\types\lexer\comments.d.ts
**SHA:** 5a2ccc578ff38938
**Timestamp:** 2026-08-28T02:24:47.149290
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare function skipSingleHTMLComment(parser: Parser, source: string, state: LexerState, context: Context, type: CommentType, start: Location): LexerState;
- export declare function skipSingleLineComment(parser: Parser, source: string, state: LexerState, type: CommentType, start: Location): LexerState;

### Ouro Bruto (primeiros 5000 chars)
```
import { LexerState } from './common';
import { Context, type Location } from '../common';
import { type Parser } from '../parser/parser';
export declare const enum CommentType {
    Single = 0,
    Multi = 1,
    HTMLOpen = 2,
    HTMLClose = 3,
    HashBang = 4
}
export declare function skipHashBang(parser: Parser): void;
export declare function skipSingleHTMLComment(parser: Parser, source: string, state: LexerState, context: Context, type: CommentType, start: Location): LexerState;
export declare function skipSingleLineComment(parser: Parser, source: string, state: LexerState, type: CommentType, start: Location): LexerState;
export declare function skipMultiLineComment(parser: Parser, source: string, state: LexerState): LexerState | void;

```
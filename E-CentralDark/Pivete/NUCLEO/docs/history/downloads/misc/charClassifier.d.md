# OUTRO - charClassifier.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\meriyah@6.1.4@@@1\dist\types\lexer\charClassifier.d.ts
**SHA:** 7dc0c572be155b96
**Timestamp:** 2026-08-28T02:24:47.145288
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- IdentifierStart = 1,

### Ouro Bruto (primeiros 5000 chars)
```
export declare const enum CharFlags {
    None = 0,
    IdentifierStart = 1,
    IdentifierPart = 2,
    KeywordCandidate = 4,
    LineTerminator = 8,
    Decimal = 16,
    Octal = 32,
    Hex = 64,
    Binary = 128,
    Exponent = 256,
    ImplicitOctalDigits = 512,
    CarriageReturn = 1024,
    LineFeed = 2048,
    Underscore = 4096,
    StringLiteral = 8192,
    JSXToken = 16384,
    Hyphen = 32768
}
export declare const CharTypes: number[];
export declare const isIdPart: number[];
export declare function isIdentifierStart(code: number): boolean;
export declare function isIdentifierPart(code: number): boolean;

```
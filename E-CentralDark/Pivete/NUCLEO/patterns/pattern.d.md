# PADRAO - pattern.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\ajv@8.20.0@@@1\dist\vocabularies\validation\pattern.d.ts
**SHA:** cc2a9ec3cb10e4c0
**Timestamp:** 2026-08-28T02:23:58.579301
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: string;

### Ouro Bruto (primeiros 5000 chars)
```
import type { CodeKeywordDefinition, ErrorObject } from "../../types";
export type PatternError = ErrorObject<"pattern", {
    pattern: string;
}, string | {
    $data: string;
}>;
declare const def: CodeKeywordDefinition;
export default def;

```

---

# PADRAO - pattern.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\schema\types\pattern.d.mts
**SHA:** 1e3a9e4699e92172
**Timestamp:** 2026-08-28T02:25:23.571571
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: Pattern;

### Ouro Bruto (primeiros 5000 chars)
```
import { type XSchemaObject } from './schema.mjs';
export interface XPattern<Pattern extends string | RegExp = string | RegExp> {
    pattern: Pattern;
}
/**
 * Returns true if the schema contains a valid pattern property
 * @specification Json Schema 7
 */
export declare function IsPattern(schema: XSchemaObject): schema is XPattern;

```

---

# PADRAO - pattern.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\engine\patterns\pattern.d.mts
**SHA:** fd515d07d03d40ae
**Timestamp:** 2026-08-28T02:25:42.616283
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare function ParsePatternIntoTypes<Pattern extends string>(pattern: Pattern): TParsePatternIntoTypes<Pattern>;

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema } from '../../types/schema.mjs';
import { type TPattern } from '../../script/parser.mjs';
/** Parses a Pattern into a sequence of TemplateLiteral types. A result of [] indicates failure to parse. */
export type TParsePatternIntoTypes<Pattern extends string, Parsed extends [TSchema[], string] | [] = TPattern<Pattern>, Result extends TSchema[] = Parsed extends [infer Types extends TSchema[], string] ? Types : []> = Result;
/** Parses a Pattern into a sequence of TemplateLiteral types. A result of [] indicates failure to parse. */
export declare function ParsePatternIntoTypes<Pattern extends string>(pattern: Pattern): TParsePatternIntoTypes<Pattern>;

```
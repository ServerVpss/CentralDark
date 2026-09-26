# PADRAO - is_pattern.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\engine\template_literal\is_pattern.d.mts
**SHA:** a1131bfee18a42d8
**Timestamp:** 2026-08-28T02:25:46.558129
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare function IsTemplateLiteralPattern<Pattern extends string>(pattern: Pattern): TIsTemplateLiteralPattern<Pattern>;

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema } from '../../types/schema.mjs';
import { type TParsePatternIntoTypes } from '../patterns/pattern.mjs';
/** Returns true if this pattern is a valid Template Literal regular expression */
export type TIsTemplateLiteralPattern<Pattern extends string, Types extends TSchema[] = TParsePatternIntoTypes<Pattern>, Result extends boolean = Types extends [] ? false : true> = Result;
/** Returns true if this pattern is a valid Template Literal regular expression */
export declare function IsTemplateLiteralPattern<Pattern extends string>(pattern: Pattern): TIsTemplateLiteralPattern<Pattern>;

```
# OUTRO - from_key_template_literal.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\engine\record\from_key_template_literal.d.mts
**SHA:** 2a507e1b8e81d185
**Timestamp:** 2026-08-28T02:25:44.459059
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare function FromTemplateKey<Pattern extends string, Value extends TSchema>(pattern: Pattern, value: Value): TFromTemplateKey<Pattern, Value>;

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema } from '../../types/schema.mjs';
import { type TRecord } from '../../types/record.mjs';
import { type TFromKey } from './from_key.mjs';
import { type TParsePatternIntoTypes } from '../patterns/pattern.mjs';
import { type TIsTemplateLiteralFinite } from '../template_literal/is_finite.mjs';
import { type TTemplateLiteralDecode } from '../template_literal/decode.mjs';
export type TFromTemplateKey<Pattern extends string, Value extends TSchema, Types extends TSchema[] = TParsePatternIntoTypes<Pattern>, Finite extends boolean = TIsTemplateLiteralFinite<Types>, Result extends TSchema = Finite extends true ? TFromKey<TTemplateLiteralDecode<Pattern>, Value> : TRecord<Pattern, Value>> = Result;
export declare function FromTemplateKey<Pattern extends string, Value extends TSchema>(pattern: Pattern, value: Value): TFromTemplateKey<Pattern, Value>;

```
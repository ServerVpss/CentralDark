# OUTRO - from_template_literal.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\engine\indexable\from_template_literal.d.mts
**SHA:** 39e91a3bc15d1b75
**Timestamp:** 2026-08-28T02:25:34.817087
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare function FromTemplateLiteral<Pattern extends string>(pattern: Pattern): TFromTemplateLiteral<Pattern>;

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema } from '../../types/schema.mjs';
import { type TTemplateLiteralDecode } from '../template_literal/decode.mjs';
import { type TFromType } from './from_type.mjs';
export type TFromTemplateLiteral<Pattern extends string, Decoded extends TSchema = TTemplateLiteralDecode<Pattern>, Result extends string[] = TFromType<Decoded>> = Result;
export declare function FromTemplateLiteral<Pattern extends string>(pattern: Pattern): TFromTemplateLiteral<Pattern>;

```

---

# OUTRO - from_template_literal.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\engine\intrinsics\from_template_literal.d.mts
**SHA:** df5e95db7476d7e5
**Timestamp:** 2026-08-28T02:25:37.087593
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare function FromTemplateLiteral(mapping: TMappingFunc, pattern: string): TSchema;

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema } from '../../types/schema.mjs';
import { type TMappingType, type TMappingFunc } from './mapping.mjs';
import { type TTemplateLiteralDecode } from '../template_literal/decode.mjs';
import { type TFromType } from './from_type.mjs';
export type TFromTemplateLiteral<Mapping extends TMappingType, Pattern extends string, Decoded extends TSchema = TTemplateLiteralDecode<Pattern>, Result extends TSchema = TFromType<Mapping, Decoded>> = Result;
export declare function FromTemplateLiteral(mapping: TMappingFunc, pattern: string): TSchema;

```
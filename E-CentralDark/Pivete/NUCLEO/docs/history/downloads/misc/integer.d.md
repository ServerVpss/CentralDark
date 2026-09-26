# OUTRO - integer.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\integer.d.mts
**SHA:** 513d1a749745dbf0
**Timestamp:** 2026-08-28T02:25:56.580347
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare const IntegerPattern = "-?(?:0|[1-9][0-9]*)";

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema, type TNumberOptions } from './schema.mjs';
export declare const IntegerPattern = "-?(?:0|[1-9][0-9]*)";
export type StaticInteger = number;
/** Represents an integer type. */
export interface TInteger extends TSchema {
    '~kind': 'Integer';
    type: 'integer';
}
/** Creates a Integer type. */
export declare function Integer(options?: TNumberOptions): TInteger;
/** Returns true if the given value is TInteger. */
export declare function IsInteger(value: unknown): value is TInteger;

```
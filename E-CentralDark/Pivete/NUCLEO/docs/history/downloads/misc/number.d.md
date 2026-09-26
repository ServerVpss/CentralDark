# OUTRO - number.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\number.d.mts
**SHA:** 4bf95a0e4d8ac2da
**Timestamp:** 2026-08-28T02:25:57.582185
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare const NumberPattern = "-?(?:0|[1-9][0-9]*)(?:.[0-9]+)?";

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema, type TNumberOptions } from './schema.mjs';
export declare const NumberPattern = "-?(?:0|[1-9][0-9]*)(?:.[0-9]+)?";
export type StaticNumber = number;
/** Represents a Number type. */
export interface TNumber extends TSchema {
    '~kind': 'Number';
    type: 'number';
}
/** Creates a Number type. */
export declare function Number(options?: TNumberOptions): TNumber;
/** Returns true if the given value is a TNumber. */
export declare function IsNumber(value: unknown): value is TNumber;

```
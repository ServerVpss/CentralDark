# OUTRO - bigint.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\bigint.d.mts
**SHA:** 2bc766ec5f133831
**Timestamp:** 2026-08-28T02:25:53.352630
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare const BigIntPattern = "-?(?:0|[1-9][0-9]*)n";

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema, type TNumberOptions } from './schema.mjs';
export declare const BigIntPattern = "-?(?:0|[1-9][0-9]*)n";
export type StaticBigInt = bigint;
/** Represents a BigInt type. */
export interface TBigInt extends TSchema {
    '~kind': 'BigInt';
    type: 'bigint';
}
/** Creates a BigInt type. */
export declare function BigInt(options?: TNumberOptions): TBigInt;
/** Returns true if the given value is a TBigInt. */
export declare function IsBigInt(value: unknown): value is TBigInt;

```
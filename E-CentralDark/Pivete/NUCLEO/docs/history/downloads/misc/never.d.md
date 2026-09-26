# OUTRO - never.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\never.d.mts
**SHA:** 2cd14acb4bb0cb09
**Timestamp:** 2026-08-28T02:25:57.273555
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare const NeverPattern = "(?!)";

### Ouro Bruto (primeiros 5000 chars)
```
import { type TSchema, type TSchemaOptions } from './schema.mjs';
export declare const NeverPattern = "(?!)";
export type StaticNever = never;
/** Represents a Never type. */
export interface TNever extends TSchema {
    '~kind': 'Never';
    not: {};
}
/** Creates a Never type. */
export declare function Never(options?: TSchemaOptions): TNever;
/** Returns true if the given value is TNever. */
export declare function IsNever(value: unknown): value is TNever;

```
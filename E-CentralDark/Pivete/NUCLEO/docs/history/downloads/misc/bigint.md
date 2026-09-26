# OUTRO - bigint.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\bigint.mjs
**SHA:** 2aa620334a8996f9
**Timestamp:** 2026-08-28T02:25:53.483331
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export const BigIntPattern = '-?(?:0|[1-9][0-9]*)n';

### Ouro Bruto (primeiros 5000 chars)
```
// deno-fmt-ignore-file
import { Memory } from '../../system/memory/index.mjs';
import { IsKind } from './schema.mjs';
// ------------------------------------------------------------------
// Pattern
// ------------------------------------------------------------------
export const BigIntPattern = '-?(?:0|[1-9][0-9]*)n';
// ------------------------------------------------------------------
// Factory
// ------------------------------------------------------------------
/** Creates a BigInt type. */
export function BigInt(options) {
    return Memory.Create({ '~kind': 'BigInt' }, { type: 'bigint' }, options);
}
// ------------------------------------------------------------------
// Guard
// ------------------------------------------------------------------
/** Returns true if the given value is a TBigInt. */
export function IsBigInt(value) {
    return IsKind(value, 'BigInt');
}

```
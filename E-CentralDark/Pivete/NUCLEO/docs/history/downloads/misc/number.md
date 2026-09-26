# OUTRO - number.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\number.mjs
**SHA:** 8892da74d950b8c6
**Timestamp:** 2026-08-28T02:25:57.596292
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export const NumberPattern = '-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?';

### Ouro Bruto (primeiros 5000 chars)
```
// deno-fmt-ignore-file
import { Memory } from '../../system/memory/index.mjs';
import { IsKind } from './schema.mjs';
// ------------------------------------------------------------------
// Pattern
// ------------------------------------------------------------------
export const NumberPattern = '-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?';
// ------------------------------------------------------------------
// Factory
// ------------------------------------------------------------------
/** Creates a Number type. */
export function Number(options) {
    return Memory.Create({ '~kind': 'Number' }, { type: 'number' }, options);
}
// ------------------------------------------------------------------
// Guard
// ------------------------------------------------------------------
/** Returns true if the given value is a TNumber. */
export function IsNumber(value) {
    return IsKind(value, 'Number');
}

```
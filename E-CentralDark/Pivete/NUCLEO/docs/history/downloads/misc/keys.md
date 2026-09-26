# OUTRO - keys.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\engine\helpers\keys.mjs
**SHA:** 83d9e5cf35fa8540
**Timestamp:** 2026-08-28T02:25:34.479151
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const integerKeyPattern = new RegExp('^(?:0|[1-9][0-9]*)$');

### Ouro Bruto (primeiros 5000 chars)
```
// deno-fmt-ignore-file
const integerKeyPattern = new RegExp('^(?:0|[1-9][0-9]*)$');
export function ConvertToIntegerKey(value) {
    const normal = `${value}`;
    return (integerKeyPattern.test(normal)
        ? parseInt(normal)
        : value);
}

```
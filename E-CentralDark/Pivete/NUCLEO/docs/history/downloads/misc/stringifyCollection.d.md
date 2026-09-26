# OUTRO - stringifyCollection.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\yaml@2.8.3@@@1\dist\stringify\stringifyCollection.d.ts
**SHA:** 7f03bfa106e6045d
**Timestamp:** 2026-08-28T02:26:59.616735
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: '{';
- start: '[';

### Ouro Bruto (primeiros 5000 chars)
```
import type { Collection } from '../nodes/Collection';
import type { StringifyContext } from './stringify';
interface StringifyCollectionOptions {
    blockItemPrefix: string;
    flowChars: {
        start: '{';
        end: '}';
    } | {
        start: '[';
        end: ']';
    };
    itemIndent: string;
    onChompKeep?: () => void;
    onComment?: () => void;
}
export declare function stringifyCollection(collection: Readonly<Collection>, ctx: StringifyContext, options: StringifyCollectionOptions): string;
export {};

```
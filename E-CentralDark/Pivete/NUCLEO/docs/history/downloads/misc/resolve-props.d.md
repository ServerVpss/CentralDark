# OUTRO - resolve-props.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\yaml@2.8.3@@@1\dist\compose\resolve-props.d.ts
**SHA:** f79e69096d500e49
**Timestamp:** 2026-08-28T02:26:39.668869
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: number;

### Ouro Bruto (primeiros 5000 chars)
```
import type { SourceToken, Token } from '../parse/cst';
import type { ComposeErrorHandler } from './composer';
export interface ResolvePropsArg {
    flow?: 'flow map' | 'flow sequence';
    indicator: 'doc-start' | 'explicit-key-ind' | 'map-value-ind' | 'seq-item-ind';
    next: Token | null | undefined;
    offset: number;
    onError: ComposeErrorHandler;
    parentIndent: number;
    startOnNewline: boolean;
}
export declare function resolveProps(tokens: SourceToken[], { flow, indicator, next, offset, onError, parentIndent, startOnNewline }: ResolvePropsArg): {
    comma: SourceToken | null;
    found: SourceToken | null;
    spaceBefore: boolean;
    comment: string;
    hasNewline: boolean;
    anchor: SourceToken | null;
    tag: SourceToken | null;
    newlineAfterProp: SourceToken | null;
    end: number;
    start: number;
};

```
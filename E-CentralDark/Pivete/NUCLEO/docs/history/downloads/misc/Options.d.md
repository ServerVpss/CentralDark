# OUTRO - options.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\meriyah@6.1.4@@@1\dist\types\options.d.ts
**SHA:** f733f7ffeefbca64
**Timestamp:** 2026-08-28T02:24:47.136964
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export type OnToken = (token: string, start: number, end: number, loc: ESTree.SourceLocation) => any;
- export type OnComment = (type: ESTree.CommentType, value: string, start: number, end: number, loc: ESTree.SourceLocation) => any;

### Ouro Bruto (primeiros 5000 chars)
```
import type * as ESTree from './estree';
import { type Token } from './token';
type OnInsertedSemicolon = (pos: number) => any;
export type OnToken = (token: string, start: number, end: number, loc: ESTree.SourceLocation) => any;
export type OnComment = (type: ESTree.CommentType, value: string, start: number, end: number, loc: ESTree.SourceLocation) => any;
export interface Options {
    module?: boolean;
    next?: boolean;
    ranges?: boolean;
    webcompat?: boolean;
    loc?: boolean;
    raw?: boolean;
    globalReturn?: boolean;
    impliedStrict?: boolean;
    preserveParens?: boolean;
    lexical?: boolean;
    source?: string;
    jsx?: boolean;
    onComment?: ESTree.Comment[] | OnComment;
    onInsertedSemicolon?: OnInsertedSemicolon;
    onToken?: Token[] | OnToken;
    uniqueKeyInPattern?: boolean;
}
export type NormalizedOptions = Omit<Options, 'onComment' | 'onToken'> & {
    onComment?: OnComment;
    onToken?: OnToken;
};
export declare function normalizeOptions(rawOptions: Options): NormalizedOptions;
export {};

```

---

# OUTRO - Options.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod-to-json-schema@3.25.2@@@1\dist\types\Options.d.ts
**SHA:** f01c60b06afe2331
**Timestamp:** 2026-08-28T02:27:27.682912
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- emailStrategy: "format:email" | "format:idn-email" | "pattern:zod";
- base64Strategy: "format:binary" | "contentEncoding:base64" | "pattern:zod";

### Ouro Bruto (primeiros 5000 chars)
```
import { ZodSchema, ZodTypeDef } from "zod/v3";
import { Refs, Seen } from "./Refs";
import { JsonSchema7Type } from "./parseTypes";
export type Targets = "jsonSchema7" | "jsonSchema2019-09" | "openApi3" | "openAi";
export type DateStrategy = "format:date-time" | "format:date" | "string" | "integer";
export declare const ignoreOverride: unique symbol;
export type OverrideCallback = (def: ZodTypeDef, refs: Refs, seen: Seen | undefined, forceResolution?: boolean) => JsonSchema7Type | undefined | typeof ignoreOverride;
export type PostProcessCallback = (jsonSchema: JsonSchema7Type | undefined, def: ZodTypeDef, refs: Refs) => JsonSchema7Type | undefined;
export declare const jsonDescription: PostProcessCallback;
export type Options<Target extends Targets = "jsonSchema7"> = {
    name: string | undefined;
    $refStrategy: "root" | "relative" | "none" | "seen";
    basePath: string[];
    effectStrategy: "input" | "any";
    pipeStrategy: "input" | "output" | "all";
    dateStrategy: DateStrategy | DateStrategy[];
    mapStrategy: "entries" | "record";
    removeAdditionalStrategy: "passthrough" | "strict";
    allowedAdditionalProperties: true | undefined;
    rejectedAdditionalProperties: false | undefined;
    target: Target;
    strictUnions: boolean;
    definitionPath: string;
    definitions: Record<string, ZodSchema>;
    errorMessages: boolean;
    markdownDescription: boolean;
    patternStrategy: "escape" | "preserve";
    applyRegexFlags: boolean;
    emailStrategy: "format:email" | "format:idn-email" | "pattern:zod";
    base64Strategy: "format:binary" | "contentEncoding:base64" | "pattern:zod";
    nameStrategy: "ref" | "title";
    override?: OverrideCallback;
    postProcess?: PostProcessCallback;
    openAiAnyTypeName: string;
};
export declare const defaultOptions: Options;
export declare const getDefaultOptions: <Target extends Targets>(options: string | Partial<Options<Target>> | undefined) => Options<Target>;

```
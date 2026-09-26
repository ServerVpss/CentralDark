# OUTRO - code.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\ajv@8.20.0@@@1\dist\vocabularies\code.d.ts
**SHA:** 83ca5b45121b7326
**Timestamp:** 2026-08-28T02:23:52.824746
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export declare function usePattern({ gen, it: { opts } }: KeywordCxt, pattern: string): Name;

### Gaps
- export declare function checkMissingProp({ gen, data, it: { opts } }: KeywordCxt, properties: string[], missing: Name): Code;
- export declare function reportMissingProp(cxt: KeywordCxt, missing: Name): void;

### Ouro Bruto (primeiros 5000 chars)
```
import type { SchemaMap } from "../types";
import type { SchemaCxt } from "../compile";
import type { KeywordCxt } from "../compile/validate";
import { CodeGen, Code, Name } from "../compile/codegen";
export declare function checkReportMissingProp(cxt: KeywordCxt, prop: string): void;
export declare function checkMissingProp({ gen, data, it: { opts } }: KeywordCxt, properties: string[], missing: Name): Code;
export declare function reportMissingProp(cxt: KeywordCxt, missing: Name): void;
export declare function hasPropFunc(gen: CodeGen): Name;
export declare function isOwnProperty(gen: CodeGen, data: Name, property: Name | string): Code;
export declare function propertyInData(gen: CodeGen, data: Name, property: Name | string, ownProperties?: boolean): Code;
export declare function noPropertyInData(gen: CodeGen, data: Name, property: Name | string, ownProperties?: boolean): Code;
export declare function allSchemaProperties(schemaMap?: SchemaMap): string[];
export declare function schemaProperties(it: SchemaCxt, schemaMap: SchemaMap): string[];
export declare function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }: KeywordCxt, func: Code, context: Code, passSchema?: boolean): Code;
export declare function usePattern({ gen, it: { opts } }: KeywordCxt, pattern: string): Name;
export declare function validateArray(cxt: KeywordCxt): Name;
export declare function validateUnion(cxt: KeywordCxt): void;

```
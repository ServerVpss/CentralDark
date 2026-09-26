# OUTRO - properties.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\ajv\dist\vocabularies\jtd\properties.d.ts
**SHA:** 46456824df16d60f
**Timestamp:** 2026-08-26T19:32:05.646864
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- Missing = "missing"

### Ouro Bruto (primeiros 5000 chars)
```
import type { CodeKeywordDefinition, ErrorObject, KeywordErrorDefinition, SchemaObject } from "../../types";
import type { KeywordCxt } from "../../compile/validate";
import { _JTDTypeError } from "./error";
declare enum PropError {
    Additional = "additional",
    Missing = "missing"
}
type PropKeyword = "properties" | "optionalProperties";
type PropSchema = {
    [P in string]?: SchemaObject;
};
export type JTDPropertiesError = _JTDTypeError<PropKeyword, "object", PropSchema> | ErrorObject<PropKeyword, {
    error: PropError.Additional;
    additionalProperty: string;
}, PropSchema> | ErrorObject<PropKeyword, {
    error: PropError.Missing;
    missingProperty: string;
}, PropSchema>;
export declare const error: KeywordErrorDefinition;
declare const def: CodeKeywordDefinition;
export declare function validateProperties(cxt: KeywordCxt): void;
export default def;

```
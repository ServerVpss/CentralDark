# OUTRO - errorMessages.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod-to-json-schema@3.25.2@@@1\dist\types\errorMessages.d.ts
**SHA:** 07a1cea63a067c08
**Timestamp:** 2026-08-28T02:27:27.671905
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: string;

### Ouro Bruto (primeiros 5000 chars)
```
import { JsonSchema7TypeUnion } from "./parseTypes.js";
import { Refs } from "./Refs.js";
export type ErrorMessages<T extends JsonSchema7TypeUnion | {
    format: string;
} | {
    pattern: string;
}, OmitProperties extends string = ""> = Partial<Omit<{
    [key in keyof T]: string;
}, OmitProperties | "type" | "errorMessages">>;
export declare function addErrorMessage<T extends {
    errorMessage?: ErrorMessages<any>;
}>(res: T, key: keyof T, errorMessage: string | undefined, refs: Refs): void;
export declare function setResponseValueAndErrors<Json7Type extends JsonSchema7TypeUnion & {
    errorMessage?: ErrorMessages<Json7Type>;
}, Key extends keyof Omit<Json7Type, "errorMessage">>(res: Json7Type, key: Key, value: Json7Type[Key], errorMessage: string | undefined, refs: Refs): void;

```
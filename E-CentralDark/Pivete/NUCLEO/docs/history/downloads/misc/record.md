# OUTRO - record.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\record.mjs
**SHA:** 6bfb635130258ab1
**Timestamp:** 2026-08-28T02:25:58.147690
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = RecordPattern(type);

### Ouro Bruto (primeiros 5000 chars)
```
// deno-fmt-ignore-file
import { Memory } from '../../system/memory/index.mjs';
import { Guard } from '../../guard/index.mjs';
import { IsKind } from './schema.mjs';
import { Integer, IntegerPattern } from './integer.mjs';
import { Number, NumberPattern } from './number.mjs';
import { String, StringPattern } from './string.mjs';
import { Deferred } from './deferred.mjs';
import { TemplateLiteralDecodeUnsafe } from '../engine/template_literal/decode.mjs';
import { CreateRecord } from '../engine/record/record_create.mjs';
import { RecordAction } from '../engine/record/instantiate.mjs';
export const IntegerKey = `^${IntegerPattern}$`;
export const NumberKey = `^${NumberPattern}$`;
export const StringKey = `^${StringPattern}$`;
/** Represents a deferred Record action. */
export function RecordDeferred(key, value, options = {}) {
    return Deferred('Record', [key, value], options);
}
// -------------------------------------------------------------------
// Factory
// -------------------------------------------------------------------
/** Creates a Record type. */
export function Record(key, value, options = {}) {
    return RecordAction(key, value, options);
}
// -------------------------------------------------------------------
// FromPattern
// -------------------------------------------------------------------
/** Creates a Record type from regular expression pattern. */
export function RecordFromPattern(key, value) {
    return CreateRecord(key, value);
}
/** Returns the raw string pattern used for the Record key  */
export function RecordPattern(type) {
    return Guard.Keys(type.patternProperties)[0];
}
/** Returns the Record key as a TypeBox type  */
export function RecordKey(type) {
    const pattern = RecordPattern(type);
    const result = (Guard.IsEqual(pattern, StringKey) ? String() :
        Guard.IsEqual(pattern, IntegerKey) ? Integer() :
            Guard.IsEqual(pattern, NumberKey) ? Number() :
                TemplateLiteralDecodeUnsafe(pattern));
    return result;
}
export function RecordValue(type) {
    return type.patternProperties[RecordPattern(type)];
}
// -------------------------------------------------------------------
// Guard
// -------------------------------------------------------------------
export function IsRecord(value) {
    return IsKind(value, 'Record');
}
// -------------------------------------------------------------------
// Options
// -------------------------------------------------------------------
export function RecordOptions(type) {
    return Memory.Discard(type, ['~kind', 'type', 'patternProperties']);
}

```
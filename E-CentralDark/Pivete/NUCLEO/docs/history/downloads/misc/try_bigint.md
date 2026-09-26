# OUTRO - try_bigint.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\value\convert\try\try_bigint.mjs
**SHA:** d4ce5d0248bc4217
**Timestamp:** 2026-08-28T02:26:05.084593
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const bigintPattern = /^-?(0|[1-9]\d*)n$/;
- const decimalPattern = /^-?(0|[1-9]\d*)\.\d+$/;
- const integerPattern = /^-?(0|[1-9]\d*)$/;

### Ouro Bruto (primeiros 5000 chars)
```
// deno-fmt-ignore-file
import { Guard } from '../../../guard/index.mjs';
import { Ok, Fail } from './try_result.mjs';
// ------------------------------------------------------------------
// Boolean
// ------------------------------------------------------------------
function FromBoolean(value) {
    return Guard.IsEqual(value, true) ? Ok(BigInt(1)) : Ok(BigInt(0));
}
// ------------------------------------------------------------------
// String
// ------------------------------------------------------------------
const bigintPattern = /^-?(0|[1-9]\d*)n$/;
const decimalPattern = /^-?(0|[1-9]\d*)\.\d+$/;
const integerPattern = /^-?(0|[1-9]\d*)$/;
function IsStringBigIntLike(value) {
    return bigintPattern.test(value);
}
function IsStringDecimalLike(value) {
    return decimalPattern.test(value);
}
function IsStringIntegerLike(value) {
    return integerPattern.test(value);
}
function FromString(value) {
    const lowercase = value.toLowerCase();
    return (IsStringBigIntLike(value) ? Ok(BigInt(value.slice(0, value.length - 1))) :
        IsStringDecimalLike(value) ? Ok(BigInt(value.split('.')[0])) :
            IsStringIntegerLike(value) ? Ok(BigInt(value)) :
                Guard.IsEqual(lowercase, 'false') ? Ok(BigInt(0)) :
                    Guard.IsEqual(lowercase, 'true') ? Ok(BigInt(1)) :
                        Fail());
}
// ------------------------------------------------------------------
// Try
// ------------------------------------------------------------------
export function TryBigInt(value) {
    return (Guard.IsBigInt(value) ? Ok(value) :
        Guard.IsBoolean(value) ? FromBoolean(value) :
            Guard.IsNumber(value) ? Ok(BigInt(Math.trunc(value))) :
                Guard.IsNull(value) ? Ok(BigInt(0)) :
                    Guard.IsString(value) ? FromString(value) :
                        Guard.IsUndefined(value) ? Ok(BigInt(0)) :
                            Fail());
}

```
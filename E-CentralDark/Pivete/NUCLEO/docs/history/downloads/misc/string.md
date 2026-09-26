# OUTRO - string.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\cjs\utils\string.js
**SHA:** 1a8beda4ef4e2670
**Timestamp:** 2026-08-28T02:21:54.558497
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Math.max(colno - 60, 0);
- start = 0;
- start = Math.max(end - 140, 0);

### Padroes
- return requireExactStringMatch ? value === pattern : value.includes(pattern);
- if (typeof pattern === "function") {
- exports.isMatchingPattern = isMatchingPattern;
- exports.stringMatchesSomePattern = stringMatchesSomePattern;

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const is = require('./is.js');
const normalize = require('./normalize.js');

function stringify(value, fallback = "[unserializable]") {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return typeof fallback === "function" ? fallback(value) : fallback;
  }
}
function truncate(str, max = 0) {
  if (typeof str !== "string" || max === 0) {
    return str;
  }
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}
function snipLine(line, colno) {
  let newLine = line;
  const lineLength = newLine.length;
  if (lineLength <= 150) {
    return newLine;
  }
  if (colno > lineLength) {
    colno = lineLength;
  }
  let start = Math.max(colno - 60, 0);
  if (start < 5) {
    start = 0;
  }
  let end = Math.min(start + 140, lineLength);
  if (end > lineLength - 5) {
    end = lineLength;
  }
  if (end === lineLength) {
    start = Math.max(end - 140, 0);
  }
  newLine = newLine.slice(start, end);
  if (start > 0) {
    newLine = `'{snip} ${newLine}`;
  }
  if (end < lineLength) {
    newLine += " {snip}";
  }
  return newLine;
}
function safeJoin(input, delimiter) {
  if (!Array.isArray(input)) {
    return "";
  }
  const output = [];
  for (let i = 0; i < input.length; i++) {
    const value = input[i];
    if (is.isPrimitive(value)) {
      output.push(String(value));
    } else if (value instanceof Error) {
      output.push(value.message ? `${value.name}: ${value.message}` : value.name);
    } else {
      output.push(normalize.stringifyValue(void 0, value));
    }
  }
  return output.join(delimiter);
}
function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
  if (!is.isString(value)) {
    return false;
  }
  if (is.isRegExp(pattern)) {
    return pattern.test(value);
  }
  if (is.isString(pattern)) {
    return requireExactStringMatch ? value === pattern : value.includes(pattern);
  }
  if (typeof pattern === "function") {
    return pattern(value);
  }
  return false;
}
function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
  for (const pattern of patterns) {
    if (isMatchingPattern(testString, pattern, requireExactStringMatch)) {
      return true;
    }
  }
  return false;
}

exports.isMatchingPattern = isMatchingPattern;
exports.safeJoin = safeJoin;
exports.snipLine = snipLine;
exports.stringMatchesSomePattern = stringMatchesSomePattern;
exports.stringify = stringify;
exports.truncate = truncate;
//# sourceMappingURL=string.js.map

```

---

# OUTRO - string.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\esm\utils\string.js
**SHA:** 43f13e2d735b3b61
**Timestamp:** 2026-08-28T02:22:09.710310
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Math.max(colno - 60, 0);
- start = 0;
- start = Math.max(end - 140, 0);

### Padroes
- return requireExactStringMatch ? value === pattern : value.includes(pattern);
- if (typeof pattern === "function") {

### Ouro Bruto (primeiros 5000 chars)
```
import { isString, isRegExp, isPrimitive } from './is.js';
import { stringifyValue } from './normalize.js';

function stringify(value, fallback = "[unserializable]") {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return typeof fallback === "function" ? fallback(value) : fallback;
  }
}
function truncate(str, max = 0) {
  if (typeof str !== "string" || max === 0) {
    return str;
  }
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}
function snipLine(line, colno) {
  let newLine = line;
  const lineLength = newLine.length;
  if (lineLength <= 150) {
    return newLine;
  }
  if (colno > lineLength) {
    colno = lineLength;
  }
  let start = Math.max(colno - 60, 0);
  if (start < 5) {
    start = 0;
  }
  let end = Math.min(start + 140, lineLength);
  if (end > lineLength - 5) {
    end = lineLength;
  }
  if (end === lineLength) {
    start = Math.max(end - 140, 0);
  }
  newLine = newLine.slice(start, end);
  if (start > 0) {
    newLine = `'{snip} ${newLine}`;
  }
  if (end < lineLength) {
    newLine += " {snip}";
  }
  return newLine;
}
function safeJoin(input, delimiter) {
  if (!Array.isArray(input)) {
    return "";
  }
  const output = [];
  for (let i = 0; i < input.length; i++) {
    const value = input[i];
    if (isPrimitive(value)) {
      output.push(String(value));
    } else if (value instanceof Error) {
      output.push(value.message ? `${value.name}: ${value.message}` : value.name);
    } else {
      output.push(stringifyValue(void 0, value));
    }
  }
  return output.join(delimiter);
}
function isMatchingPattern(value, pattern, requireExactStringMatch = false) {
  if (!isString(value)) {
    return false;
  }
  if (isRegExp(pattern)) {
    return pattern.test(value);
  }
  if (isString(pattern)) {
    return requireExactStringMatch ? value === pattern : value.includes(pattern);
  }
  if (typeof pattern === "function") {
    return pattern(value);
  }
  return false;
}
function stringMatchesSomePattern(testString, patterns = [], requireExactStringMatch = false) {
  for (const pattern of patterns) {
    if (isMatchingPattern(testString, pattern, requireExactStringMatch)) {
      return true;
    }
  }
  return false;
}

export { isMatchingPattern, safeJoin, snipLine, stringMatchesSomePattern, stringify, truncate };
//# sourceMappingURL=string.js.map

```

---

# OUTRO - string.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\string.mjs
**SHA:** b764ac939637440d
**Timestamp:** 2026-08-28T02:25:59.044309
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export const StringPattern = '.*';

### Ouro Bruto (primeiros 5000 chars)
```
// deno-lint-ignore-file
// deno-fmt-ignore-file
import { Memory } from '../../system/memory/index.mjs';
import { IsKind } from './schema.mjs';
// ------------------------------------------------------------------
// StringPattern
// ------------------------------------------------------------------
export const StringPattern = '.*';
// ------------------------------------------------------------------
// Factory
// ------------------------------------------------------------------
/** Creates a String type. */
export function String(options) {
    return Memory.Create({ '~kind': 'String' }, { type: 'string' }, options);
}
// ------------------------------------------------------------------
// Guard
// ------------------------------------------------------------------
/** Returns true if the given value is TString. */
export function IsString(value) {
    return IsKind(value, 'String');
}

```

---

# OUTRO - string.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod-to-json-schema@3.25.2@@@1\dist\cjs\parsers\string.js
**SHA:** bd01fa160d1d9475
**Timestamp:** 2026-08-28T02:27:13.183866
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- case "pattern:zod":
- case "pattern:zod": {
- pattern: schema.pattern,
- errorMessage: { pattern: schema.errorMessage.pattern },
- pattern: stringifyRegExpWithFlags(regex, refs),
- refs.errorMessages && { errorMessage: { pattern: message } }),
- let pattern = "";

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStringDef = exports.zodPatterns = void 0;
const errorMessages_js_1 = require("../errorMessages.js");
let emojiRegex = undefined;
/**
 * Generated from the regular expressions found here as of 2024-05-22:
 * https://github.com/colinhacks/zod/blob/master/src/types.ts.
 *
 * Expressions with /i flag have been changed accordingly.
 */
exports.zodPatterns = {
    /**
     * `c` was changed to `[cC]` to replicate /i flag
     */
    cuid: /^[cC][^\s-]{8,}$/,
    cuid2: /^[0-9a-z]+$/,
    ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
    /**
     * `a-z` was added to replicate /i flag
     */
    email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
    /**
     * Constructed a valid Unicode RegExp
     *
     * Lazily instantiate since this type of regex isn't supported
     * in all envs (e.g. React Native).
     *
     * See:
     * https://github.com/colinhacks/zod/issues/2433
     * Fix in Zod:
     * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
     */
    emoji: () => {
        if (emojiRegex === undefined) {
            emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
        }
        return emojiRegex;
    },
    /**
     * Unused
     */
    uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    /**
     * Unused
     */
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
    ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
    /**
     * Unused
     */
    ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
    ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
    base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
    nanoid: /^[a-zA-Z0-9_-]{21}$/,
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
};
function parseStringDef(def, refs) {
    const res = {
        type: "string",
    };
    if (def.checks) {
        for (const check of def.checks) {
            switch (check.kind) {
                case "min":
                    (0, errorMessages_js_1.setResponseValueAndErrors)(res, "minLength", typeof res.minLength === "number"
                        ? Math.max(res.minLength, check.value)
                        : check.value, check.message, refs);
                    break;
                case "max":
                    (0, errorMessages_js_1.setResponseValueAndErrors)(res, "maxLength", typeof res.maxLength === "number"
                        ? Math.min(res.maxLength, check.value)
                        : check.value, check.message, refs);
                    break;
                case "email":
                    switch (refs.emailStrategy) {
                        case "format:email":
                            addFormat(res, "email", check.message, refs);
                            break;
                        case "format:idn-email":
                            addFormat(res, "idn-email", check.message, refs);
                            break;
                        case "pattern:zod":
                            addPattern(res, exports.zodPatterns.email, check.message, refs);
                            break;
                    }
                    break;
                case "url":
                    addFormat(res, "uri", check.message, refs);
                    break;
                case "uuid":
                    addFormat(res, "uuid", check.message, refs);
                    break;
                case "regex":
                    addPattern(res, check.regex, check.message, refs);
                    break;
                case "cuid":
                    ad
```

---

# OUTRO - string.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod-to-json-schema@3.25.2@@@1\dist\esm\parsers\string.js
**SHA:** 5568b8bc0edeedbc
**Timestamp:** 2026-08-28T02:27:26.358316
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- case "pattern:zod":
- case "pattern:zod": {
- pattern: schema.pattern,
- errorMessage: { pattern: schema.errorMessage.pattern },
- pattern: stringifyRegExpWithFlags(regex, refs),
- refs.errorMessages && { errorMessage: { pattern: message } }),
- let pattern = "";

### Ouro Bruto (primeiros 5000 chars)
```
import { setResponseValueAndErrors } from "../errorMessages.js";
let emojiRegex = undefined;
/**
 * Generated from the regular expressions found here as of 2024-05-22:
 * https://github.com/colinhacks/zod/blob/master/src/types.ts.
 *
 * Expressions with /i flag have been changed accordingly.
 */
export const zodPatterns = {
    /**
     * `c` was changed to `[cC]` to replicate /i flag
     */
    cuid: /^[cC][^\s-]{8,}$/,
    cuid2: /^[0-9a-z]+$/,
    ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
    /**
     * `a-z` was added to replicate /i flag
     */
    email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
    /**
     * Constructed a valid Unicode RegExp
     *
     * Lazily instantiate since this type of regex isn't supported
     * in all envs (e.g. React Native).
     *
     * See:
     * https://github.com/colinhacks/zod/issues/2433
     * Fix in Zod:
     * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
     */
    emoji: () => {
        if (emojiRegex === undefined) {
            emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
        }
        return emojiRegex;
    },
    /**
     * Unused
     */
    uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    /**
     * Unused
     */
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
    ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
    /**
     * Unused
     */
    ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
    ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
    base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
    nanoid: /^[a-zA-Z0-9_-]{21}$/,
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
};
export function parseStringDef(def, refs) {
    const res = {
        type: "string",
    };
    if (def.checks) {
        for (const check of def.checks) {
            switch (check.kind) {
                case "min":
                    setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number"
                        ? Math.max(res.minLength, check.value)
                        : check.value, check.message, refs);
                    break;
                case "max":
                    setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number"
                        ? Math.min(res.maxLength, check.value)
                        : check.value, check.message, refs);
                    break;
                case "email":
                    switch (refs.emailStrategy) {
                        case "format:email":
                            addFormat(res, "email", check.message, refs);
                            break;
                        case "format:idn-email":
                            addFormat(res, "idn-email", check.message, refs);
                            break;
                        case "pattern:zod":
                            addPattern(res, zodPatterns.email, check.message, refs);
                            break;
                    }
                    break;
                case "url":
                    addFormat(res, "uri", check.message, refs);
                    break;
                case "uuid":
                    addFormat(res, "uuid", check.message, refs);
                    break;
                case "regex":
                    addPattern(res, check.regex, check.message, refs);
                    break;
                case "cuid":
                    addPattern(res, zodPatterns.cuid, check.message, refs);
                    break;
                case "cuid2":
                    addPattern(res, zodPatterns.cuid2, chec
```

---

# OUTRO - string.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-1.13.1\src\regex\string.rs
**SHA:** 93bcceb4b9fb1f62
**Timestamp:** 2026-08-28T02:35:04.634231
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// when `start == 0`.
- start: usize,
- /// match when `start == 0`.
- pub fn is_match_at(&self, haystack: &str, start: usize) -> bool {
- /// match when `start == 0`.
- start: usize,
- /// match when `start == 0`.
- start: usize,
- /// match when `start == 0`.
- start: usize,

### Padroes
- pub(crate) pattern: Arc<str>,

### Ouro Bruto (primeiros 5000 chars)
```
use alloc::{borrow::Cow, string::String, sync::Arc};

use regex_automata::{meta, util::captures, Input, PatternID};

use crate::{error::Error, RegexBuilder};

/// A convenient way to construct regex patterns from string literals.
///
/// This macro can be used to construct reusable instances of [`Regex`] with
/// reduced boilerplate. The constructed `Regex` is stored in a static so the
/// pattern is compiled approximately once, even when called multiple times.
///
/// There is *no compile-time checking of patterns* with `regex!`. Instead,
/// invalid patterns will panic the first time the regex is used. Invalid
/// patterns should still not be used with `regex!`; if compile-time checking
/// becomes feasible in the future, it may be added within a non-semver-breaking
/// release. In the meantime, consider enabling [`clippy::invalid_regex`].
///
/// # Examples
///
/// ```
/// use regex::{Regex, regex};
///
/// assert!(regex!("[a-z]").is_match("a"));
/// assert!(regex!("(inconceivable!|classic blunder)").is_match("inconceivable!"));
///
/// let re: &Regex = regex!(r"(\d{3})-(\d{4})");
/// assert_eq!(&re.captures("867-5309").unwrap()[1], "867");
/// ```
///
/// An invalid pattern will panic when it is first used:
///
/// ```should_panic
/// use regex::regex;
///
/// let re = regex!("invalid -> ("); // no panic here
/// re.is_match("invalid -> (");     // panic!
/// ```
///
/// [`clippy::invalid_regex`]: https://rust-lang.github.io/rust-clippy/master/#invalid_regex
#[macro_export]
macro_rules! regex {
    ($re:literal) => {{
        static REGEX: $crate::__private::Lazy<$crate::Regex> =
            $crate::__private::Lazy::new(|| {
                $crate::Regex::new($re).expect("invalid regex pattern")
            });

        // Coerce returned type from `&Lazy<Regex>` to `&Regex` to avoid making the
        // inner type public.
        let re: &$crate::Regex = &REGEX;
        re
    }};
}

/// A compiled regular expression for searching Unicode haystacks.
///
/// A `Regex` can be used to search haystacks, split haystacks into substrings
/// or replace substrings in a haystack with a different substring. All
/// searching is done with an implicit `(?s:.)*?` at the beginning and end of
/// an pattern. To force an expression to match the whole string (or a prefix
/// or a suffix), you must use an anchor like `^` or `$` (or `\A` and `\z`).
///
/// While this crate will handle Unicode strings (whether in the regular
/// expression or in the haystack), all positions returned are **byte
/// offsets**. Every byte offset is guaranteed to be at a Unicode code point
/// boundary. That is, all offsets returned by the `Regex` API are guaranteed
/// to be ranges that can slice a `&str` without panicking. If you want to
/// relax this requirement, then you must search `&[u8]` haystacks with a
/// [`bytes::Regex`](crate::bytes::Regex).
///
/// The only methods that allocate new strings are the string replacement
/// methods. All other methods (searching and splitting) return borrowed
/// references into the haystack given.
///
/// # Example
///
/// Find the offsets of a US phone number:
///
/// ```
/// use regex::Regex;
///
/// let re = Regex::new("[0-9]{3}-[0-9]{3}-[0-9]{4}").unwrap();
/// let m = re.find("phone: 111-222-3333").unwrap();
/// assert_eq!(7..19, m.range());
/// ```
///
/// # Example: extracting capture groups
///
/// A common way to use regexes is with capture groups. That is, instead of
/// just looking for matches of an entire regex, parentheses are used to create
/// groups that represent part of the match.
///
/// For example, consider a haystack with multiple lines, and each line has
/// three whitespace delimited fields where the second field is expected to be
/// a number and the third field a boolean. To make this convenient, we use
/// the [`Captures::extract`] API to put the strings that match each group
/// into a fixed size array:
///
/// ```
/// use regex::Regex;
///
/// let hay = "
/// rabbit         54 true
/// groundhog 2 true
/// does not match
/// fox   109    false
/// ";
/// let re = Regex::new(r"(?m)^\s*(\S+)\s+([0-9]+)\s+(true|false)\s*$").unwrap();
/// let mut fields: Vec<(&str, i64, bool)> = vec![];
/// for (_, [f1, f2, f3]) in re.captures_iter(hay).map(|caps| caps.extract()) {
///     fields.push((f1, f2.parse()?, f3.parse()?));
/// }
/// assert_eq!(fields, vec![
///     ("rabbit", 54, true),
///     ("groundhog", 2, true),
///     ("fox", 109, false),
/// ]);
///
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
///
/// # Example: searching with the `Pattern` trait
///
/// **Note**: This section requires that this crate is compiled with the
/// `pattern` Cargo feature enabled, which **requires nightly Rust**.
///
/// Since `Regex` implements `Pattern` from the standard library, one can
/// use regexes with methods defined on `&str`. For example, `is_match`,
/// `find`, `find_iter` and `split` can, in some cases, be replaced with
/// `str::contains`, `str::find`, `str::match_ind
```

---

# OUTRO - string.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-macros-0.2.32\src\helpers\string.rs
**SHA:** ed701b5a8fb18155
**Timestamp:** 2026-08-28T02:36:09.407099
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- span_start: Some(span),
- span_start: Some(span),
- span_start: Some(span),

### Ouro Bruto (primeiros 5000 chars)
```
use std::ops::{Index, RangeFrom};

use proc_macro::Span;

use crate::Error;

pub(crate) fn parse(
    permit_byte_strings: bool,
    token: &proc_macro::Literal,
) -> Result<(Span, Vec<u8>), Error> {
    let span = token.span();
    let repr = token.to_string();

    match repr.as_bytes() {
        [b'"', ..] => Ok((span, parse_lit_str_cooked(&repr[1..]))),
        [b'b', b'"', ..] if !permit_byte_strings => Err(Error::ByteStringNotPermitted {
            span_start: Some(span),
            span_end: Some(span),
        }),
        [b'b', b'"', rest @ ..] => Ok((span, parse_lit_byte_str_cooked(rest))),
        [b'r', rest @ ..] => Ok((span, parse_lit_str_raw(rest))),
        [b'b', b'r', ..] if !permit_byte_strings => Err(Error::ByteStringNotPermitted {
            span_start: Some(span),
            span_end: Some(span),
        }),
        [b'b', b'r', rest @ ..] => Ok((span, parse_lit_str_raw(rest))),
        _ => Err(Error::ExpectedString {
            span_start: Some(span),
            span_end: Some(span),
        }),
    }
}

fn byte(s: impl AsRef<[u8]>, idx: usize) -> u8 {
    s.as_ref().get(idx).copied().unwrap_or_default()
}

fn parse_lit_str_cooked(mut s: &str) -> Vec<u8> {
    let mut content = String::new();
    'outer: loop {
        let ch = match byte(s, 0) {
            b'"' => break,
            b'\\' => {
                let b = byte(s, 1);
                s = &s[2..];
                match b {
                    b'x' => {
                        let (byte, rest) = backslash_x(s);
                        s = rest;
                        char::from_u32(u32::from(byte)).expect("byte was just validated")
                    }
                    b'u' => {
                        let (chr, rest) = backslash_u(s);
                        s = rest;
                        chr
                    }
                    b'n' => '\n',
                    b'r' => '\r',
                    b't' => '\t',
                    b'\\' => '\\',
                    b'0' => '\0',
                    b'\'' => '\'',
                    b'"' => '"',
                    b'\r' | b'\n' => loop {
                        let ch = s.chars().next().unwrap_or_default();
                        if ch.is_whitespace() {
                            s = &s[ch.len_utf8()..];
                        } else {
                            continue 'outer;
                        }
                    },
                    _ => bug!("invalid escape"),
                }
            }
            b'\r' => {
                // bare CR not permitted
                s = &s[2..];
                '\n'
            }
            _ => {
                let ch = s.chars().next().unwrap_or_default();
                s = &s[ch.len_utf8()..];
                ch
            }
        };
        content.push(ch);
    }

    content.into_bytes()
}

fn parse_lit_str_raw(s: &[u8]) -> Vec<u8> {
    let mut pounds = 0;
    while byte(s, pounds) == b'#' {
        pounds += 1;
    }
    let close = s
        .iter()
        .rposition(|&b| b == b'"')
        .expect("had a string without trailing \"");

    s[pounds + 1..close].to_owned()
}

fn parse_lit_byte_str_cooked(mut v: &[u8]) -> Vec<u8> {
    let mut out = Vec::new();
    'outer: loop {
        let byte = match byte(v, 0) {
            b'"' => break,
            b'\\' => {
                let b = byte(v, 1);
                v = &v[2..];
                match b {
                    b'x' => {
                        let (byte, rest) = backslash_x(v);
                        v = rest;
                        byte
                    }
                    b'n' => b'\n',
                    b'r' => b'\r',
                    b't' => b'\t',
                    b'\\' => b'\\',
                    b'0' => b'\0',
                    b'\'' => b'\'',
                    b'"' => b'"',
                    b'\r' | b'\n' => loop {
                        let byte = byte(v, 0);
                        let ch = char::from_u32(u32::from(byte)).expect("invalid byte");
                        if ch.is_whitespace() {
                            v = &v[1..];
                        } else {
                            continue 'outer;
                        }
                    },
                    _ => bug!("invalid escape"),
                }
            }
            b'\r' => {
                // bare CR not permitted
                v = &v[2..];
                b'\n'
            }
            b => {
                v = &v[1..];
                b
            }
        };
        out.push(byte);
    }

    out
}

fn backslash_x<S>(s: &S) -> (u8, &S)
where
    S: Index<RangeFrom<usize>, Output = S> + AsRef<[u8]> + ?Sized,
{
    let mut ch = 0;
    let b0 = byte(s, 0);
    let b1 = byte(s, 1);
    ch += 0x10 * (b0 - b'0');
    ch += match b1 {
        b'0'..=b'9' => b1 - b'0',
        b'a'..=b'f' => 10 + (b1 - b'a'),
        b'A'..=b'F' => 10 + (b1 - b'A'),
        _ => bug!("invalid hex escape"),
    };
   
```

---

# OUTRO - string.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml_parser-1.1.3+spec-1.1.0\src\decoder\string.rs
**SHA:** d74cc99092ec8866
**Timestamp:** 2026-08-28T02:36:26.789914
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = invalid.offset_from(&raw.as_str());
- let start = segment.offset_from(&raw.as_str());
- let start = stream.checkpoint();
- let start = s.offset_from(&raw.as_str()) + 1;
- let start = newline.offset_from(&raw.as_str());
- let start = invalid.offset_from(&raw.as_str());
- let start = segment.offset_from(&raw.as_str());
- let start = stream.checkpoint();
- let start = stream.offset_from(&raw.as_str());
- let start = stream.offset_from(&raw.as_str());

### Ouro Bruto (primeiros 5000 chars)
```
use core::ops::RangeInclusive;

use winnow::stream::ContainsToken as _;
use winnow::stream::Offset as _;
use winnow::stream::Stream as _;

use crate::ErrorSink;
use crate::Expected;
use crate::ParseError;
use crate::Raw;
use crate::Span;
use crate::decoder::StringBuilder;
use crate::lexer::APOSTROPHE;
use crate::lexer::ML_BASIC_STRING_DELIM;
use crate::lexer::ML_LITERAL_STRING_DELIM;
use crate::lexer::QUOTATION_MARK;
use crate::lexer::WSCHAR;

const ALLOCATION_ERROR: &str = "could not allocate for string";

/// Parse literal string
///
/// ```abnf
/// ;; Literal String
///
/// literal-string = apostrophe *literal-char apostrophe
///
/// apostrophe = %x27 ; ' apostrophe
///
/// literal-char = %x09 / %x20-26 / %x28-7E / non-ascii
/// ```
pub(crate) fn decode_literal_string<'i>(
    raw: Raw<'i>,
    output: &mut dyn StringBuilder<'i>,
    error: &mut dyn ErrorSink,
) {
    const INVALID_STRING: &str = "invalid literal string";

    output.clear();

    let s = raw.as_str();
    let s = if let Some(stripped) = s.strip_prefix(APOSTROPHE as char) {
        stripped
    } else {
        error.report_error(
            ParseError::new(INVALID_STRING)
                .with_context(Span::new_unchecked(0, raw.len()))
                .with_expected(&[Expected::Literal("'")])
                .with_unexpected(Span::new_unchecked(0, 0)),
        );
        s
    };
    let s = if let Some(stripped) = s.strip_suffix(APOSTROPHE as char) {
        stripped
    } else {
        error.report_error(
            ParseError::new(INVALID_STRING)
                .with_context(Span::new_unchecked(0, raw.len()))
                .with_expected(&[Expected::Literal("'")])
                .with_unexpected(Span::new_unchecked(raw.len(), raw.len())),
        );
        s
    };

    for (i, b) in s.as_bytes().iter().enumerate() {
        if !LITERAL_CHAR.contains_token(b) {
            let offset = (&s.as_bytes()[i..]).offset_from(&raw.as_bytes());
            error.report_error(
                ParseError::new(INVALID_STRING)
                    .with_context(Span::new_unchecked(0, raw.len()))
                    .with_expected(&[Expected::Description("non-single-quote visible characters")])
                    .with_unexpected(Span::new_unchecked(offset, offset)),
            );
        }
    }

    if !output.push_str(s) {
        error.report_error(
            ParseError::new(ALLOCATION_ERROR).with_unexpected(Span::new_unchecked(0, raw.len())),
        );
    }
}

/// ```abnf
/// literal-char = %x09 / %x20-26 / %x28-7E / non-ascii
/// ```
const LITERAL_CHAR: (
    u8,
    RangeInclusive<u8>,
    RangeInclusive<u8>,
    RangeInclusive<u8>,
) = (0x9, 0x20..=0x26, 0x28..=0x7E, NON_ASCII);

/// ```abnf
/// non-ascii = %x80-D7FF / %xE000-10FFFF
/// ```
/// - ASCII is 0xxxxxxx
/// - First byte for UTF-8 is 11xxxxxx
/// - Subsequent UTF-8 bytes are 10xxxxxx
const NON_ASCII: RangeInclusive<u8> = 0x80..=0xff;

/// Parse multi-line literal string
///
/// ```abnf
/// ;; Multiline Literal String
///
/// ml-literal-string = ml-literal-string-delim [ newline ] ml-literal-body
///                     ml-literal-string-delim
/// ml-literal-string-delim = 3apostrophe
/// ml-literal-body = *mll-content *( mll-quotes 1*mll-content ) [ mll-quotes ]
///
/// mll-content = literal-char / newline
/// mll-quotes = 1*2apostrophe
/// ```
pub(crate) fn decode_ml_literal_string<'i>(
    raw: Raw<'i>,
    output: &mut dyn StringBuilder<'i>,
    error: &mut dyn ErrorSink,
) {
    const INVALID_STRING: &str = "invalid multi-line literal string";
    output.clear();

    let s = raw.as_str();
    let s = if let Some(stripped) = s.strip_prefix(ML_LITERAL_STRING_DELIM) {
        stripped
    } else {
        error.report_error(
            ParseError::new(INVALID_STRING)
                .with_context(Span::new_unchecked(0, raw.len()))
                .with_expected(&[Expected::Literal("'")])
                .with_unexpected(Span::new_unchecked(0, 0)),
        );
        s
    };
    let s = strip_start_newline(s);
    let s = if let Some(stripped) = s.strip_suffix(ML_LITERAL_STRING_DELIM) {
        stripped
    } else {
        error.report_error(
            ParseError::new(INVALID_STRING)
                .with_context(Span::new_unchecked(0, raw.len()))
                .with_expected(&[Expected::Literal("'")])
                .with_unexpected(Span::new_unchecked(raw.len(), raw.len())),
        );
        s.trim_end_matches('\'')
    };

    for (i, b) in s.as_bytes().iter().enumerate() {
        if *b == b'\'' || *b == b'\n' {
        } else if *b == b'\r' {
            if s.as_bytes().get(i + 1) != Some(&b'\n') {
                let offset = (&s.as_bytes()[i + 1..]).offset_from(&raw.as_bytes());
                error.report_error(
                    ParseError::new("carriage return must be followed by newline")
                        .with_context(Span::new_unchecked(0, raw.len()))
                        .with_expected(&[Expected::Literal("\n")])
                
```
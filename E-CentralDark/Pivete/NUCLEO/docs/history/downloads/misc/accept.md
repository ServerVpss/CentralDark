# OUTRO - accept.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\negotiator@1.1.0@@@1\lib\accept.js
**SHA:** 160d139207a12ebb
**Timestamp:** 2026-08-28T02:24:48.103171
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- var start = skipOptionalWhitespace(header, index);
- var parsed = contentType.parse(header, { comma: true, start: start });

### Ouro Bruto (primeiros 5000 chars)
```
/*!
 * negotiator
 * Copyright(c) 2026 Blake Embrey
 * MIT Licensed
 */

'use strict';

var contentType = require('content-type');

/**
 * Module exports.
 * @private
 */

module.exports = parseAccept;

/**
 * Parse an Accept-style header.
 * @private
 */

function parseAccept(header) {
  var values = [];
  var index = 0;

  while (index < header.length) {
    var start = skipOptionalWhitespace(header, index);
    var parsed = contentType.parse(header, { comma: true, start: start });

    // `content-type` normalizes the type, but accept methods return original casing.
    parsed.type = header.slice(start, start + parsed.type.length);
    values.push(parsed);

    index = parsed.index + 1;
  }

  return values;
}

/**
 * Skip optional whitespace.
 * @private
 */

function skipOptionalWhitespace(header, index) {
  var cursor = index;

  while (header.charCodeAt(cursor) === 0x20 || header.charCodeAt(cursor) === 0x09) {
    cursor++;
  }

  return cursor;
}

```
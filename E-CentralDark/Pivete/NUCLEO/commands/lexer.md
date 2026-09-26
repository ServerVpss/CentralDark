# COMANDO - lexer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\cjs-module-lexer@2.2.1@@@1\lexer.js
**SHA:** 38c6e2ee98eea2d2
**Timestamp:** 2026-08-28T02:24:05.786015
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let identifierStart = false;
- identifierStart = isIdentifierStart(codePoint, true);
- const id_start = pos;
- const it_id_start = pos;
- const reexportStart = pos;
- const nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]")

### Gaps
- // TODO: <!-- XML comment support

### Ouro Bruto (primeiros 5000 chars)
```
let source, pos, end;
let openTokenDepth,
  templateDepth,
  lastTokenPos,
  lastSlashWasDivision,
  templateStack,
  templateStackDepth,
  openTokenPosStack,
  openClassPosStack,
  nextBraceIsClass,
  starExportMap,
  lastStarExportSpecifier,
  _exports,
  unsafeGetters,
  reexports;

function resetState () {
  openTokenDepth = 0;
  templateDepth = -1;
  lastTokenPos = -1;
  lastSlashWasDivision = false;
  templateStack = new Array(1024);
  templateStackDepth = 0;
  openTokenPosStack = new Array(1024);
  openClassPosStack = new Array(1024);
  nextBraceIsClass = false;
  starExportMap = Object.create(null);
  lastStarExportSpecifier = null;

  _exports = new Set();
  unsafeGetters = new Set();
  reexports = new Set();
}

// RequireType
const Import = 0;
const ExportAssign = 1;
const ExportStar = 2;

function parseCJS (source, name = '@') {
  resetState();
  try {
    parseSource(source);
  }
  catch (e) {
    e.message += `\n  at ${name}:${source.slice(0, pos).split('\n').length}:${pos - source.lastIndexOf('\n', pos - 1)}`;
    e.loc = pos;
    throw e;
  }
  const result = { exports: [..._exports].filter(expt => expt !== undefined && !unsafeGetters.has(expt)), reexports: [...reexports].filter(reexpt => reexpt !== undefined) };
  resetState();
  return result;
}

function decode (str) {
  if (str[0] === '"' || str[0] === '\'') {
    try {
      const decoded = scanStringLiteral(str);
      // Filter to exclude non-matching UTF-16 surrogate strings
      for (let i = 0; i < decoded.length; i++) {
        const surrogatePrefix = decoded.charCodeAt(i) & 0xFC00;
        if (surrogatePrefix < 0xD800) {
          // Not a surrogate
          continue;
        }
        else if (surrogatePrefix === 0xD800) {
          // Validate surrogate pair
          if ((decoded.charCodeAt(++i) & 0xFC00) !== 0xDC00)
            return;
        }
        else {
          // Out-of-range surrogate code (above 0xD800)
          return;
        }
      }
      return decoded;
    }
    catch {}
  }
  else {
    return str;
  }
}

function parseSource (cjsSource) {
  source = cjsSource;
  pos = -1;
  end = source.length - 1;
  let ch = 0;

  // Handle #!
  if (source.charCodeAt(0) === 35/*#*/ && source.charCodeAt(1) === 33/*!*/) {
    if (source.length === 2)
      return true;
    pos += 2;
    while (pos++ < end) {
      ch = source.charCodeAt(pos);
      if (ch === 10/*\n*/ || ch === 13/*\r*/)
        break;
    }
  }

  while (pos++ < end) {
    ch = source.charCodeAt(pos);

    if (ch === 32 || ch < 14 && ch > 8)
      continue;

    if (openTokenDepth === 0) {
      switch (ch) {
        case 105/*i*/:
          if (source.startsWith('mport', pos + 1) && keywordStart(pos))
            throwIfImportStatement();
          lastTokenPos = pos;
          continue;
        case 114/*r*/:
          const startPos = pos;
          if (tryParseRequire(Import) && keywordStart(startPos))
            tryBacktrackAddStarExportBinding(startPos - 1);
          lastTokenPos = pos;
          continue;
        case 95/*_*/:
          if (source.startsWith('interopRequireWildcard', pos + 1) && (keywordStart(pos) || source.charCodeAt(pos - 1) === 46/*.*/)) {
            const startPos = pos;
            pos += 23;
            if (source.charCodeAt(pos) === 40/*(*/) {
              pos++;
              openTokenPosStack[openTokenDepth++] = lastTokenPos;
              if (tryParseRequire(Import) && keywordStart(startPos)) {
                tryBacktrackAddStarExportBinding(startPos - 1);
              }
            }
          }
          else if (source.startsWith('_export', pos + 1) && (keywordStart(pos) || source.charCodeAt(pos - 1) === 46/*.*/)) {
            pos += 8;
            if (source.startsWith('Star', pos))
              pos += 4;
            if (source.charCodeAt(pos) === 40/*(*/) {
              openTokenPosStack[openTokenDepth++] = lastTokenPos;
              if (source.charCodeAt(pos + 1) === 114/*r*/) {
                pos++;
                tryParseRequire(ExportStar);
              }
            }
          }
          lastTokenPos = pos;
          continue;
      }
    }

    switch (ch) {
      case 101/*e*/:
        if (source.startsWith('xport', pos + 1) && keywordStart(pos)) {
          if (source.charCodeAt(pos + 6) === 115/*s*/)
            tryParseExportsDotAssign(false);
          else if (openTokenDepth === 0)
            throwIfExportStatement();
        }
        break;
      case 99/*c*/:
        if (keywordStart(pos) && source.startsWith('lass', pos + 1) && isBrOrWs(source.charCodeAt(pos + 5)))
          nextBraceIsClass = true;
        break;
      case 109/*m*/:
        if (source.startsWith('odule', pos + 1) && keywordStart(pos))
          tryParseModuleExportsDotAssign();
        break;
      case 79/*O*/:
        if (source.startsWith('bject', pos + 1) && keywordStart(pos))
          tryParseObjectDefineOrKeys(openTokenDepth === 0);
        break;
      case 40/*(*/:
        openTokenPosStack[openTokenDepth++
```
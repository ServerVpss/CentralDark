# CONTRATO - lexer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\es-module-lexer@2.3.2@@@1\lexer.js
**SHA:** aad11eacc508afa1
**Timestamp:** 2026-08-28T02:24:11.995018
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- exportStatementStart = sStartPos;
- let out = '', chunkStart = acornPos;
- chunkStart = acornPos;
- const start = acornPos;
- const attrStart = pos;
- keyStart = pos;
- keyStart = pos;
- valueStart = pos;

### Ouro Bruto (primeiros 5000 chars)
```
let source, pos, end,
  openTokenDepth,
  lastTokenPos,
  openTokenPosStack,
  openClassPosStack,
  curDynamicImport,
  templateStackDepth,
  facade,
  lastSlashWasDivision,
  nextBraceIsClass,
  templateDepth,
  templateStack,
  imports,
  exports,
  exportStatementStart,
  name;

function addImport (ss, s, e, d) {
  const impt = { ss, se: d === -2 ? e : d === -1 ? e + 1 : 0, s, e, d, a: -1, n: undefined, at: null };
  imports.push(impt);
  return impt;
}

function addExport (s, e, ls, le) {
  exports.push({
    s,
    e,
    ls,
    le,
    ss: exportStatementStart,
    n: s[0] === '"' ? readString(s, '"') : s[0] === "'" ? readString(s, "'") : source.slice(s, e),
    ln: ls[0] === '"' ? readString(ls, '"') : ls[0] === "'" ? readString(ls, "'") : source.slice(ls, le)
  });
}

function readName (impt) {
  let { d, s } = impt;
  if (d !== -1)
    s++;
  impt.n = readString(s, source.charCodeAt(s - 1));
}

// Note: parsing is based on the _assumption_ that the source is already valid
export function parse (_source, _name) {
  openTokenDepth = 0;
  curDynamicImport = null;
  templateDepth = -1;
  lastTokenPos = -1;
  lastSlashWasDivision = false;
  templateStack = Array(1024);
  templateStackDepth = 0;
  openTokenPosStack = Array(1024);
  openClassPosStack = Array(1024);
  nextBraceIsClass = false;
  facade = true;
  name = _name || '@';

  imports = [];
  exports = [];

  source = _source;
  pos = -1;
  end = source.length - 1;
  let ch = 0;

  // start with a pure "module-only" parser
  m: while (pos++ < end) {
    ch = source.charCodeAt(pos);

    if (ch === 32 || ch < 14 && ch > 8)
      continue;

    switch (ch) {
      case 101/*e*/:
        if (openTokenDepth === 0 && keywordStart(pos) && source.startsWith('xport', pos + 1)) {
          tryParseExportStatement();
          // export might have been a non-pure declaration
          if (!facade) {
            lastTokenPos = pos;
            break m;
          }
        }
        break;
      case 105/*i*/:
        if (keywordStart(pos) && source.startsWith('mport', pos + 1))
          tryParseImportStatement();
        break;
      case 59/*;*/:
        break;
      case 47/*/*/: {
        const next_ch = source.charCodeAt(pos + 1);
        if (next_ch === 47/*/*/) {
          lineComment();
          // dont update lastToken
          continue;
        }
        else if (next_ch === 42/***/) {
          blockComment(true);
          // dont update lastToken
          continue;
        }
        // fallthrough
      }
      default:
        // as soon as we hit a non-module token, we go to main parser
        facade = false;
        pos--;
        break m;
    }
    lastTokenPos = pos;
  }

  while (pos++ < end) {
    ch = source.charCodeAt(pos);

    if (ch === 32 || ch < 14 && ch > 8)
      continue;

    switch (ch) {
      case 101/*e*/:
        if (openTokenDepth === 0 && keywordStart(pos) && source.startsWith('xport', pos + 1))
          tryParseExportStatement();
        break;
      case 105/*i*/:
        if (keywordStart(pos) && source.startsWith('mport', pos + 1))
          tryParseImportStatement();
        break;
      case 99/*c*/:
        if (keywordStart(pos) && source.startsWith('lass', pos + 1) && isBrOrWs(source.charCodeAt(pos + 5)))
          nextBraceIsClass = true;
        break;
      case 40/*(*/:
        openTokenPosStack[openTokenDepth++] = lastTokenPos;
        break;
      case 41/*)*/:
        if (openTokenDepth === 0)
          syntaxError();
        openTokenDepth--;
        if (curDynamicImport && curDynamicImport.d === openTokenPosStack[openTokenDepth]) {
          if (curDynamicImport.e === 0)
            curDynamicImport.e = pos;
          curDynamicImport.se = pos;
          curDynamicImport = null;
        }
        break;
      case 91/*[*/:
        openTokenPosStack[openTokenDepth++] = lastTokenPos;
        break;
      case 93/*]*/:
        if (openTokenDepth === 0)
          syntaxError();
        openTokenDepth--;
        break;
      case 44/*,*/:
        if (curDynamicImport && curDynamicImport.e === 0 && curDynamicImport.d === openTokenPosStack[openTokenDepth - 1]) {
          curDynamicImport.e = lastTokenPos + 1;
          pos++;
          commentWhitespace(true);
          curDynamicImport.a = pos;
          pos--;
        }
        break;
      case 123/*{*/:
        // dynamic import followed by { is not a dynamic import (so remove)
        // this is a sneaky way to get around { import () {} } v { import () }
        // block / object ambiguity without a parser (assuming source is valid)
        // se marks the closing paren; e is moved before the first comma for import(a, b)
        if (source.charCodeAt(lastTokenPos) === 41/*)*/ && imports.length && imports[imports.length - 1].se === lastTokenPos) {
          imports.pop();
        }
        openClassPosStack[openTokenDepth] = nextBraceIsClass;
        nextBraceIsClass = false;
        openTokenPosStack[openTokenDepth++] = lastTokenPos;
        break;
 
```
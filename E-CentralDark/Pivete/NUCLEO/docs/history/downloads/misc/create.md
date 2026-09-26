# OUTRO - create.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\libcjs\patch\create.js
**SHA:** b6142fc6de57271f
**Timestamp:** 2026-08-28T02:24:08.659150
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
- oldRangeStart = oldLine;
- newRangeStart = newLine;
- oldStart: oldRangeStart,
- newStart: newRangeStart,
- oldRangeStart = 0;
- newRangeStart = 0;
- const oldStart = hunk.oldLines === 0 ? hunk.oldStart - 1 : hunk.oldStart;
- const newStart = hunk.newLines === 0 ? hunk.newStart - 1 : hunk.newStart;

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OMIT_HEADERS = exports.FILE_HEADERS_ONLY = exports.INCLUDE_HEADERS = void 0;
exports.structuredPatch = structuredPatch;
exports.formatPatch = formatPatch;
exports.createTwoFilesPatch = createTwoFilesPatch;
exports.createPatch = createPatch;
const line_js_1 = require("../diff/line.js");
/**
 * Returns true if the filename contains characters that require C-style
 * quoting (as used by Git and GNU diffutils in diff output).
 */
function needsQuoting(s) {
    for (let i = 0; i < s.length; i++) {
        if (s[i] < '\x20' || s[i] > '\x7e' || s[i] === '"' || s[i] === '\\') {
            return true;
        }
    }
    return false;
}
/**
 * C-style quotes a filename, encoding special characters as escape sequences
 * and non-ASCII bytes as octal escapes. This is the inverse of
 * `parseQuotedFileName` in parse.ts.
 *
 * Non-ASCII bytes are encoded as UTF-8 before being emitted as octal escapes.
 * This matches the behaviour of both Git and GNU diffutils, which always emit
 * UTF-8 octal escapes regardless of the underlying filesystem encoding (e.g.
 * Git for Windows converts from NTFS's UTF-16 to UTF-8 internally).
 *
 * If the filename doesn't need quoting, returns it as-is.
 */
function quoteFileNameIfNeeded(s) {
    if (!needsQuoting(s)) {
        return s;
    }
    let result = '"';
    const bytes = new TextEncoder().encode(s);
    let i = 0;
    while (i < bytes.length) {
        const b = bytes[i];
        // See https://en.wikipedia.org/wiki/Escape_sequences_in_C#Escape_sequences
        if (b === 0x07) {
            result += '\\a';
        }
        else if (b === 0x08) {
            result += '\\b';
        }
        else if (b === 0x09) {
            result += '\\t';
        }
        else if (b === 0x0a) {
            result += '\\n';
        }
        else if (b === 0x0b) {
            result += '\\v';
        }
        else if (b === 0x0c) {
            result += '\\f';
        }
        else if (b === 0x0d) {
            result += '\\r';
        }
        else if (b === 0x22) {
            result += '\\"';
        }
        else if (b === 0x5c) {
            result += '\\\\';
        }
        else if (b >= 0x20 && b <= 0x7e) {
            // Just a printable ASCII character that is neither a double quote nor a
            // backslash; no need to escape it.
            result += String.fromCharCode(b);
        }
        else {
            // Either part of a non-ASCII character or a control character without a
            // special escape sequence; needs escaping as a 3-digit octal escape
            result += '\\' + b.toString(8).padStart(3, '0');
        }
        i++;
    }
    result += '"';
    return result;
}
exports.INCLUDE_HEADERS = {
    includeIndex: true,
    includeUnderline: true,
    includeFileHeaders: true
};
exports.FILE_HEADERS_ONLY = {
    includeIndex: false,
    includeUnderline: false,
    includeFileHeaders: true
};
exports.OMIT_HEADERS = {
    includeIndex: false,
    includeUnderline: false,
    includeFileHeaders: false
};
function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
    let optionsObj;
    if (!options) {
        optionsObj = {};
    }
    else if (typeof options === 'function') {
        optionsObj = { callback: options };
    }
    else {
        optionsObj = options;
    }
    if (typeof optionsObj.context === 'undefined') {
        optionsObj.context = 4;
    }
    // We copy this into its own variable to placate TypeScript, which thinks
    // optionsObj.context might be undefined in the callbacks below.
    const context = optionsObj.context;
    // @ts-expect-error (runtime check for something that is correctly a static type error)
    if (optionsObj.newlineIsToken) {
        throw new Error('newlineIsToken may not be used with patch-generation functions, only with diffing functions');
    }
    if (!optionsObj.callback) {
        return diffLinesResultToPatch((0, line_js_1.diffLines)(oldStr, newStr, optionsObj));
    }
    else {
        const { callback } = optionsObj;
        (0, line_js_1.diffLines)(oldStr, newStr, Object.assign(Object.assign({}, optionsObj), { callback: (diff) => {
                const patch = diffLinesResultToPatch(diff);
                // TypeScript is unhappy without the cast because it does not understand that `patch` may
                // be undefined here only if `callback` is StructuredPatchCallbackAbortable:
                callback(patch);
            } }));
    }
    function diffLinesResultToPatch(diff) {
        // STEP 1: Build up the patch with no "\ No newline at end of file" lines and with the arrays
        //         of lines containing trailing newline characters. We'll tidy up later...
        if (!diff) {
            return;
        }
        diff.push({ value: '', lines: [] }); // Append an empty value to make cleanup easier
        function contextLines(lines) {
          
```

---

# OUTRO - create.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\libesm\patch\create.js
**SHA:** f29a276d2b036858
**Timestamp:** 2026-08-28T02:24:10.163699
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
- oldRangeStart = oldLine;
- newRangeStart = newLine;
- oldStart: oldRangeStart,
- newStart: newRangeStart,
- oldRangeStart = 0;
- newRangeStart = 0;
- const oldStart = hunk.oldLines === 0 ? hunk.oldStart - 1 : hunk.oldStart;
- const newStart = hunk.newLines === 0 ? hunk.newStart - 1 : hunk.newStart;

### Ouro Bruto (primeiros 5000 chars)
```
import { diffLines } from '../diff/line.js';
/**
 * Returns true if the filename contains characters that require C-style
 * quoting (as used by Git and GNU diffutils in diff output).
 */
function needsQuoting(s) {
    for (let i = 0; i < s.length; i++) {
        if (s[i] < '\x20' || s[i] > '\x7e' || s[i] === '"' || s[i] === '\\') {
            return true;
        }
    }
    return false;
}
/**
 * C-style quotes a filename, encoding special characters as escape sequences
 * and non-ASCII bytes as octal escapes. This is the inverse of
 * `parseQuotedFileName` in parse.ts.
 *
 * Non-ASCII bytes are encoded as UTF-8 before being emitted as octal escapes.
 * This matches the behaviour of both Git and GNU diffutils, which always emit
 * UTF-8 octal escapes regardless of the underlying filesystem encoding (e.g.
 * Git for Windows converts from NTFS's UTF-16 to UTF-8 internally).
 *
 * If the filename doesn't need quoting, returns it as-is.
 */
function quoteFileNameIfNeeded(s) {
    if (!needsQuoting(s)) {
        return s;
    }
    let result = '"';
    const bytes = new TextEncoder().encode(s);
    let i = 0;
    while (i < bytes.length) {
        const b = bytes[i];
        // See https://en.wikipedia.org/wiki/Escape_sequences_in_C#Escape_sequences
        if (b === 0x07) {
            result += '\\a';
        }
        else if (b === 0x08) {
            result += '\\b';
        }
        else if (b === 0x09) {
            result += '\\t';
        }
        else if (b === 0x0a) {
            result += '\\n';
        }
        else if (b === 0x0b) {
            result += '\\v';
        }
        else if (b === 0x0c) {
            result += '\\f';
        }
        else if (b === 0x0d) {
            result += '\\r';
        }
        else if (b === 0x22) {
            result += '\\"';
        }
        else if (b === 0x5c) {
            result += '\\\\';
        }
        else if (b >= 0x20 && b <= 0x7e) {
            // Just a printable ASCII character that is neither a double quote nor a
            // backslash; no need to escape it.
            result += String.fromCharCode(b);
        }
        else {
            // Either part of a non-ASCII character or a control character without a
            // special escape sequence; needs escaping as a 3-digit octal escape
            result += '\\' + b.toString(8).padStart(3, '0');
        }
        i++;
    }
    result += '"';
    return result;
}
export const INCLUDE_HEADERS = {
    includeIndex: true,
    includeUnderline: true,
    includeFileHeaders: true
};
export const FILE_HEADERS_ONLY = {
    includeIndex: false,
    includeUnderline: false,
    includeFileHeaders: true
};
export const OMIT_HEADERS = {
    includeIndex: false,
    includeUnderline: false,
    includeFileHeaders: false
};
export function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
    let optionsObj;
    if (!options) {
        optionsObj = {};
    }
    else if (typeof options === 'function') {
        optionsObj = { callback: options };
    }
    else {
        optionsObj = options;
    }
    if (typeof optionsObj.context === 'undefined') {
        optionsObj.context = 4;
    }
    // We copy this into its own variable to placate TypeScript, which thinks
    // optionsObj.context might be undefined in the callbacks below.
    const context = optionsObj.context;
    // @ts-expect-error (runtime check for something that is correctly a static type error)
    if (optionsObj.newlineIsToken) {
        throw new Error('newlineIsToken may not be used with patch-generation functions, only with diffing functions');
    }
    if (!optionsObj.callback) {
        return diffLinesResultToPatch(diffLines(oldStr, newStr, optionsObj));
    }
    else {
        const { callback } = optionsObj;
        diffLines(oldStr, newStr, Object.assign(Object.assign({}, optionsObj), { callback: (diff) => {
                const patch = diffLinesResultToPatch(diff);
                // TypeScript is unhappy without the cast because it does not understand that `patch` may
                // be undefined here only if `callback` is StructuredPatchCallbackAbortable:
                callback(patch);
            } }));
    }
    function diffLinesResultToPatch(diff) {
        // STEP 1: Build up the patch with no "\ No newline at end of file" lines and with the arrays
        //         of lines containing trailing newline characters. We'll tidy up later...
        if (!diff) {
            return;
        }
        diff.push({ value: '', lines: [] }); // Append an empty value to make cleanup easier
        function contextLines(lines) {
            return lines.map(function (entry) { return ' ' + entry; });
        }
        const hunks = [];
        let oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
        for (let i = 0; i < diff.length; i++) {
            const current = diff[i], lines = current.lines || splitLines(current.value);
         
```
# OUTRO - diff.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\dist\diff.js
**SHA:** 5773c7efb34715bb
**Timestamp:** 2026-08-28T02:24:07.978004
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const newWsStart = longestCommonPrefix(newWsFull, delWsStart);
- // assigned, assign it to the start:
- oldStart: +chunkHeader[1],
- newStart: +chunkHeader[3],
- oldStart: hunk.newStart,
- newStart: hunk.oldStart,
- let oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
- oldRangeStart = oldLine;
- newRangeStart = newLine;
- oldStart: oldRangeStart,

### Gaps
- // TODO: It seems awkward that we indiscriminately trim off

### Ouro Bruto (primeiros 5000 chars)
```
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Diff = {}));
})(this, (function (exports) { 'use strict';

    class Diff {
        diff(oldStr, newStr, 
        // Type below is not accurate/complete - see above for full possibilities - but it compiles
        options = {}) {
            let callback;
            if (typeof options === 'function') {
                callback = options;
                options = {};
            }
            else if ('callback' in options) {
                callback = options.callback;
            }
            // Allow subclasses to massage the input prior to running
            const oldString = this.castInput(oldStr, options);
            const newString = this.castInput(newStr, options);
            const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
            const newTokens = this.removeEmpty(this.tokenize(newString, options));
            return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
        }
        diffWithOptionsObj(oldTokens, newTokens, options, callback) {
            var _a;
            const done = (value) => {
                value = this.postProcess(value, options);
                if (callback) {
                    setTimeout(function () { callback(value); }, 0);
                    return undefined;
                }
                else {
                    return value;
                }
            };
            const newLen = newTokens.length, oldLen = oldTokens.length;
            let editLength = 1;
            let maxEditLength = newLen + oldLen;
            if (options.maxEditLength != null) {
                maxEditLength = Math.min(maxEditLength, options.maxEditLength);
            }
            const maxExecutionTime = (_a = options.timeout) !== null && _a !== void 0 ? _a : Infinity;
            const abortAfterTimestamp = Date.now() + maxExecutionTime;
            const bestPath = [{ oldPos: -1, lastComponent: undefined }];
            // Seed editLength = 0, i.e. the content starts with the same values
            let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
            if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
                // Identity per the equality and tokenizer
                return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
            }
            // Once we hit the right edge of the edit graph on some diagonal k, we can
            // definitely reach the end of the edit graph in no more than k edits, so
            // there's no point in considering any moves to diagonal k+1 any more (from
            // which we're guaranteed to need at least k+1 more edits).
            // Similarly, once we've reached the bottom of the edit graph, there's no
            // point considering moves to lower diagonals.
            // We record this fact by setting minDiagonalToConsider and
            // maxDiagonalToConsider to some finite value once we've hit the edge of
            // the edit graph.
            // This optimization is not faithful to the original algorithm presented in
            // Myers's paper, which instead pointlessly extends D-paths off the end of
            // the edit graph - see page 7 of Myers's paper which notes this point
            // explicitly and illustrates it with a diagram. This has major performance
            // implications for some common scenarios. For instance, to compute a diff
            // where the new text simply appends d characters on the end of the
            // original text of length n, the true Myers algorithm will take O(n+d^2)
            // time while this optimization needs only O(n+d) time.
            let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
            // Main worker method. checks all permutations of a given edit length for acceptance.
            const execEditLength = () => {
                for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
                    let basePath;
                    const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
                    if (removePath) {
                        // No one else is going to attempt to use this value, clear it
                        // @ts-expect-error - perf optimisation. This type-violating value will never be read.
                        bestPath[diagonalPath - 1] = undefined;
                    }
                    let canAdd = false;
                    if (addPath) {
                        // what newPos will be after we do an insertion:
                        const add
```
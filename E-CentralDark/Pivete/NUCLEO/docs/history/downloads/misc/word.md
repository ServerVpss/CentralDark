# OUTRO - word.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\libcjs\diff\word.js
**SHA:** be7d90a270ce7a25
**Timestamp:** 2026-08-28T02:24:08.515416
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const newWsStart = (0, string_js_1.longestCommonPrefix)(newWsFull, delWsStart);
- // assigned, assign it to the start:

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wordsWithSpaceDiff = exports.wordDiff = void 0;
exports.diffWords = diffWords;
exports.diffWordsWithSpace = diffWordsWithSpace;
const base_js_1 = __importDefault(require("./base.js"));
const string_js_1 = require("../util/string.js");
// Based on https://en.wikipedia.org/wiki/Latin_script_in_Unicode
//
// Chars/ranges counted as "word" characters by this regex are as follows:
//
// + U+00AD  Soft hyphen
// + 00C0–00FF (letters with diacritics from the Latin-1 Supplement), except:
//   - U+00D7  × Multiplication sign
//   - U+00F7  ÷ Division sign
// + Latin Extended-A, 0100–017F
// + Latin Extended-B, 0180–024F
// + IPA Extensions, 0250–02AF
// + Spacing Modifier Letters, 02B0–02FF, except:
//   - U+02C7  ˇ &#711;  Caron
//   - U+02D8  ˘ &#728;  Breve
//   - U+02D9  ˙ &#729;  Dot Above
//   - U+02DA  ˚ &#730;  Ring Above
//   - U+02DB  ˛ &#731;  Ogonek
//   - U+02DC  ˜ &#732;  Small Tilde
//   - U+02DD  ˝ &#733;  Double Acute Accent
// + Latin Extended Additional, 1E00–1EFF
const extendedWordChars = 'a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}';
// Each token is one of the following:
// - A punctuation mark plus the surrounding whitespace
// - A word plus the surrounding whitespace
// - Pure whitespace (but only in the special case where the entire text
//   is just whitespace)
//
// We have to include surrounding whitespace in the tokens because the two
// alternative approaches produce horribly broken results:
// * If we just discard the whitespace, we can't fully reproduce the original
//   text from the sequence of tokens and any attempt to render the diff will
//   get the whitespace wrong.
// * If we have separate tokens for whitespace, then in a typical text every
//   second token will be a single space character. But this often results in
//   the optimal diff between two texts being a perverse one that preserves
//   the spaces between words but deletes and reinserts actual common words.
//   See https://github.com/kpdecker/jsdiff/issues/160#issuecomment-1866099640
//   for an example.
//
// Keeping the surrounding whitespace of course has implications for .equals
// and .join, not just .tokenize.
// This regex does NOT fully implement the tokenization rules described above.
// Instead, it gives runs of whitespace their own "token". The tokenize method
// then handles stitching whitespace tokens onto adjacent word or punctuation
// tokens.
const tokenizeIncludingWhitespace = new RegExp(`[${extendedWordChars}]+|\\s+|[^${extendedWordChars}]`, 'ug');
class WordDiff extends base_js_1.default {
    equals(left, right, options) {
        if (options.ignoreCase) {
            left = left.toLowerCase();
            right = right.toLowerCase();
        }
        return left.trim() === right.trim();
    }
    tokenize(value, options = {}) {
        let parts;
        if (options.intlSegmenter) {
            const segmenter = options.intlSegmenter;
            if (segmenter.resolvedOptions().granularity != 'word') {
                throw new Error('The segmenter passed must have a granularity of "word"');
            }
            // We want `parts` to be an array whose elements alternate between being
            // pure whitespace and being pure non-whitespace. This is ALMOST what the
            // segments returned by a word-based Intl.Segmenter already look like,
            // but not quite - see explanation in the docs of our custom segment()
            // function.
            parts = (0, string_js_1.segment)(value, segmenter);
        }
        else {
            parts = value.match(tokenizeIncludingWhitespace) || [];
        }
        const tokens = [];
        let prevPart = null;
        parts.forEach(part => {
            if ((/\s/).test(part)) {
                if (prevPart == null) {
                    tokens.push(part);
                }
                else {
                    tokens.push(tokens.pop() + part);
                }
            }
            else if (prevPart != null && (/\s/).test(prevPart)) {
                if (tokens[tokens.length - 1] == prevPart) {
                    tokens.push(tokens.pop() + part);
                }
                else {
                    tokens.push(prevPart + part);
                }
            }
            else {
                tokens.push(part);
            }
            prevPart = part;
        });
        return tokens;
    }
    join(tokens) {
        // Tokens being joined here will always have appeared consecutively in the
        // same text, so we can simply strip off the leading whitespace from all the
        // tokens except the first (and except any whitespace-only tokens - but such
        // a token will always be the first and only to
```

---

# OUTRO - word.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\diff@9.0.0@@@1\libesm\diff\word.js
**SHA:** c1d6a6c52ef517e4
**Timestamp:** 2026-08-28T02:24:09.963130
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const newWsStart = longestCommonPrefix(newWsFull, delWsStart);
- // assigned, assign it to the start:

### Ouro Bruto (primeiros 5000 chars)
```
import Diff from './base.js';
import { longestCommonPrefix, longestCommonSuffix, replacePrefix, replaceSuffix, removePrefix, removeSuffix, maximumOverlap, leadingWs, trailingWs, leadingAndTrailingWs, segment } from '../util/string.js';
// Based on https://en.wikipedia.org/wiki/Latin_script_in_Unicode
//
// Chars/ranges counted as "word" characters by this regex are as follows:
//
// + U+00AD  Soft hyphen
// + 00C0–00FF (letters with diacritics from the Latin-1 Supplement), except:
//   - U+00D7  × Multiplication sign
//   - U+00F7  ÷ Division sign
// + Latin Extended-A, 0100–017F
// + Latin Extended-B, 0180–024F
// + IPA Extensions, 0250–02AF
// + Spacing Modifier Letters, 02B0–02FF, except:
//   - U+02C7  ˇ &#711;  Caron
//   - U+02D8  ˘ &#728;  Breve
//   - U+02D9  ˙ &#729;  Dot Above
//   - U+02DA  ˚ &#730;  Ring Above
//   - U+02DB  ˛ &#731;  Ogonek
//   - U+02DC  ˜ &#732;  Small Tilde
//   - U+02DD  ˝ &#733;  Double Acute Accent
// + Latin Extended Additional, 1E00–1EFF
const extendedWordChars = 'a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}';
// Each token is one of the following:
// - A punctuation mark plus the surrounding whitespace
// - A word plus the surrounding whitespace
// - Pure whitespace (but only in the special case where the entire text
//   is just whitespace)
//
// We have to include surrounding whitespace in the tokens because the two
// alternative approaches produce horribly broken results:
// * If we just discard the whitespace, we can't fully reproduce the original
//   text from the sequence of tokens and any attempt to render the diff will
//   get the whitespace wrong.
// * If we have separate tokens for whitespace, then in a typical text every
//   second token will be a single space character. But this often results in
//   the optimal diff between two texts being a perverse one that preserves
//   the spaces between words but deletes and reinserts actual common words.
//   See https://github.com/kpdecker/jsdiff/issues/160#issuecomment-1866099640
//   for an example.
//
// Keeping the surrounding whitespace of course has implications for .equals
// and .join, not just .tokenize.
// This regex does NOT fully implement the tokenization rules described above.
// Instead, it gives runs of whitespace their own "token". The tokenize method
// then handles stitching whitespace tokens onto adjacent word or punctuation
// tokens.
const tokenizeIncludingWhitespace = new RegExp(`[${extendedWordChars}]+|\\s+|[^${extendedWordChars}]`, 'ug');
class WordDiff extends Diff {
    equals(left, right, options) {
        if (options.ignoreCase) {
            left = left.toLowerCase();
            right = right.toLowerCase();
        }
        return left.trim() === right.trim();
    }
    tokenize(value, options = {}) {
        let parts;
        if (options.intlSegmenter) {
            const segmenter = options.intlSegmenter;
            if (segmenter.resolvedOptions().granularity != 'word') {
                throw new Error('The segmenter passed must have a granularity of "word"');
            }
            // We want `parts` to be an array whose elements alternate between being
            // pure whitespace and being pure non-whitespace. This is ALMOST what the
            // segments returned by a word-based Intl.Segmenter already look like,
            // but not quite - see explanation in the docs of our custom segment()
            // function.
            parts = segment(value, segmenter);
        }
        else {
            parts = value.match(tokenizeIncludingWhitespace) || [];
        }
        const tokens = [];
        let prevPart = null;
        parts.forEach(part => {
            if ((/\s/).test(part)) {
                if (prevPart == null) {
                    tokens.push(part);
                }
                else {
                    tokens.push(tokens.pop() + part);
                }
            }
            else if (prevPart != null && (/\s/).test(prevPart)) {
                if (tokens[tokens.length - 1] == prevPart) {
                    tokens.push(tokens.pop() + part);
                }
                else {
                    tokens.push(prevPart + part);
                }
            }
            else {
                tokens.push(part);
            }
            prevPart = part;
        });
        return tokens;
    }
    join(tokens) {
        // Tokens being joined here will always have appeared consecutively in the
        // same text, so we can simply strip off the leading whitespace from all the
        // tokens except the first (and except any whitespace-only tokens - but such
        // a token will always be the first and only token anyway) and then join them
        // and the whitespace around words and punctuation will end up correct.
        return tokens.map((token, i) => {
            if (i == 0) {
                return token;
            }
            else {
           
```

---

# OUTRO - word.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\unicode-segmentation-1.13.3\src\word.rs
**SHA:** 27d8f79071f57e31
**Timestamp:** 2026-08-28T02:36:32.990892
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Start => match cat {
- let mut start = len - 1;
- let mut start = len - 1;
- let start = len - 2;
- let start = len - 1;

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2012-2014 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use core::cmp;
use core::iter::Filter;

use crate::tables::word::WordCat;

/// An iterator over the substrings of a string which, after splitting the string on
/// [word boundaries](http://www.unicode.org/reports/tr29/#Word_Boundaries),
/// contain any characters with the
/// [Alphabetic](http://unicode.org/reports/tr44/#Alphabetic)
/// property, or with
/// [General_Category=Number](http://unicode.org/reports/tr44/#General_Category_Values).
///
/// This struct is created by the [`unicode_words`] method on the [`UnicodeSegmentation`] trait. See
/// its documentation for more.
///
/// [`unicode_words`]: trait.UnicodeSegmentation.html#tymethod.unicode_words
/// [`UnicodeSegmentation`]: trait.UnicodeSegmentation.html
#[derive(Debug)]
pub struct UnicodeWords<'a> {
    inner: WordsIter<'a>,
}

impl<'a> Iterator for UnicodeWords<'a> {
    type Item = &'a str;
    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        match &mut self.inner {
            WordsIter::Ascii(i) => i.next(),
            WordsIter::Unicode(i) => i.next(),
        }
    }
    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        match &self.inner {
            WordsIter::Ascii(i) => i.size_hint(),
            WordsIter::Unicode(i) => i.size_hint(),
        }
    }
}
impl<'a> DoubleEndedIterator for UnicodeWords<'a> {
    #[inline]
    fn next_back(&mut self) -> Option<Self::Item> {
        match &mut self.inner {
            WordsIter::Ascii(i) => i.next_back(),
            WordsIter::Unicode(i) => i.next_back(),
        }
    }
}

/// An iterator over the substrings of a string which, after splitting the string on
/// [word boundaries](http://www.unicode.org/reports/tr29/#Word_Boundaries),
/// contain any characters with the
/// [Alphabetic](http://unicode.org/reports/tr44/#Alphabetic)
/// property, or with
/// [General_Category=Number](http://unicode.org/reports/tr44/#General_Category_Values).
/// This iterator also provides the byte offsets for each substring.
///
/// This struct is created by the [`unicode_word_indices`] method on the [`UnicodeSegmentation`] trait. See
/// its documentation for more.
///
/// [`unicode_word_indices`]: trait.UnicodeSegmentation.html#tymethod.unicode_word_indices
/// [`UnicodeSegmentation`]: trait.UnicodeSegmentation.html
#[derive(Debug)]
pub struct UnicodeWordIndices<'a> {
    inner: IndicesIter<'a>,
}

impl<'a> Iterator for UnicodeWordIndices<'a> {
    type Item = (usize, &'a str);
    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        match &mut self.inner {
            IndicesIter::Ascii(i) => i.next(),
            IndicesIter::Unicode(i) => i.next(),
        }
    }
    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        match &self.inner {
            IndicesIter::Ascii(i) => i.size_hint(),
            IndicesIter::Unicode(i) => i.size_hint(),
        }
    }
}
impl<'a> DoubleEndedIterator for UnicodeWordIndices<'a> {
    #[inline]
    fn next_back(&mut self) -> Option<Self::Item> {
        match &mut self.inner {
            IndicesIter::Ascii(i) => i.next_back(),
            IndicesIter::Unicode(i) => i.next_back(),
        }
    }
}

/// External iterator for a string's
/// [word boundaries](http://www.unicode.org/reports/tr29/#Word_Boundaries).
///
/// This struct is created by the [`split_word_bounds`] method on the [`UnicodeSegmentation`]
/// trait. See its documentation for more.
///
/// [`split_word_bounds`]: trait.UnicodeSegmentation.html#tymethod.split_word_bounds
/// [`UnicodeSegmentation`]: trait.UnicodeSegmentation.html
#[derive(Debug, Clone)]
pub struct UWordBounds<'a> {
    string: &'a str,
    cat: Option<WordCat>,
    catb: Option<WordCat>,
}

/// External iterator for word boundaries and byte offsets.
///
/// This struct is created by the [`split_word_bound_indices`] method on the
/// [`UnicodeSegmentation`] trait. See its documentation for more.
///
/// [`split_word_bound_indices`]: trait.UnicodeSegmentation.html#tymethod.split_word_bound_indices
/// [`UnicodeSegmentation`]: trait.UnicodeSegmentation.html
#[derive(Debug, Clone)]
pub struct UWordBoundIndices<'a> {
    start_offset: usize,
    iter: UWordBounds<'a>,
}

impl<'a> UWordBoundIndices<'a> {
    #[inline]
    /// View the underlying data (the part yet to be iterated) as a slice of the original string.
    ///
    /// ```rust
    /// # use unicode_segmentation::UnicodeSegmentation;
    /// let mut iter = "Hello world".split_word_bound_indices();
    /// assert_eq!(iter.as_str(), "Hello world");
    /// 
```
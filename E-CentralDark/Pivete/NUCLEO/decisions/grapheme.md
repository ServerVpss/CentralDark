# DECISAO - grapheme.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\unicode-segmentation-1.13.3\src\grapheme.rs
**SHA:** 730d50fb3d285884
**Timestamp:** 2026-08-28T02:36:32.799162
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.cursor.cur_cursor();
- if start == self.cursor_back.cur_cursor() {
- pub fn provide_context(&mut self, chunk: &str, chunk_start: usize) {
- fn handle_incb_consonant(&mut self, chunk: &str, chunk_start: usize) {
- if chunk_start == 0 {
- fn handle_regional(&mut self, chunk: &str, chunk_start: usize) {
- if chunk_start == 0 {
- fn handle_emoji(&mut self, chunk: &str, chunk_start: usize, mut seen_zwj: bool) {
- if chunk_start == 0 {
- chunk_start: usize,

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

use crate::tables::grapheme::GraphemeCat;
use core::cmp;

/// External iterator for grapheme clusters and byte offsets.
///
/// This struct is created by the [`grapheme_indices`] method on the [`UnicodeSegmentation`]
/// trait. See its documentation for more.
///
/// [`grapheme_indices`]: trait.UnicodeSegmentation.html#tymethod.grapheme_indices
/// [`UnicodeSegmentation`]: trait.UnicodeSegmentation.html
#[derive(Debug, Clone)]
pub struct GraphemeIndices<'a> {
    start_offset: usize,
    iter: Graphemes<'a>,
}

impl<'a> GraphemeIndices<'a> {
    #[inline]
    /// View the underlying data (the part yet to be iterated) as a slice of the original string.
    ///
    /// ```rust
    /// # use unicode_segmentation::UnicodeSegmentation;
    /// let mut iter = "abc".grapheme_indices(true);
    /// assert_eq!(iter.as_str(), "abc");
    /// iter.next();
    /// assert_eq!(iter.as_str(), "bc");
    /// iter.next();
    /// iter.next();
    /// assert_eq!(iter.as_str(), "");
    /// ```
    pub fn as_str(&self) -> &'a str {
        self.iter.as_str()
    }
}

impl<'a> Iterator for GraphemeIndices<'a> {
    type Item = (usize, &'a str);

    #[inline]
    fn next(&mut self) -> Option<(usize, &'a str)> {
        self.iter
            .next()
            .map(|s| (s.as_ptr() as usize - self.start_offset, s))
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        self.iter.size_hint()
    }
}

impl<'a> DoubleEndedIterator for GraphemeIndices<'a> {
    #[inline]
    fn next_back(&mut self) -> Option<(usize, &'a str)> {
        self.iter
            .next_back()
            .map(|s| (s.as_ptr() as usize - self.start_offset, s))
    }
}

/// External iterator for a string's
/// [grapheme clusters](http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries).
///
/// This struct is created by the [`graphemes`] method on the [`UnicodeSegmentation`] trait. See its
/// documentation for more.
///
/// [`graphemes`]: trait.UnicodeSegmentation.html#tymethod.graphemes
/// [`UnicodeSegmentation`]: trait.UnicodeSegmentation.html
#[derive(Clone, Debug)]
pub struct Graphemes<'a> {
    string: &'a str,
    cursor: GraphemeCursor,
    cursor_back: GraphemeCursor,
}

impl<'a> Graphemes<'a> {
    #[inline]
    /// View the underlying data (the part yet to be iterated) as a slice of the original string.
    ///
    /// ```rust
    /// # use unicode_segmentation::UnicodeSegmentation;
    /// let mut iter = "abc".graphemes(true);
    /// assert_eq!(iter.as_str(), "abc");
    /// iter.next();
    /// assert_eq!(iter.as_str(), "bc");
    /// iter.next();
    /// iter.next();
    /// assert_eq!(iter.as_str(), "");
    /// ```
    pub fn as_str(&self) -> &'a str {
        &self.string[self.cursor.cur_cursor()..self.cursor_back.cur_cursor()]
    }
}

impl<'a> Iterator for Graphemes<'a> {
    type Item = &'a str;

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        let slen = self.cursor_back.cur_cursor() - self.cursor.cur_cursor();
        (cmp::min(slen, 1), Some(slen))
    }

    #[inline]
    fn next(&mut self) -> Option<&'a str> {
        let start = self.cursor.cur_cursor();
        if start == self.cursor_back.cur_cursor() {
            return None;
        }
        let next = self.cursor.next_boundary(self.string, 0).unwrap().unwrap();
        Some(&self.string[start..next])
    }
}

impl<'a> DoubleEndedIterator for Graphemes<'a> {
    #[inline]
    fn next_back(&mut self) -> Option<&'a str> {
        let end = self.cursor_back.cur_cursor();
        if end == self.cursor.cur_cursor() {
            return None;
        }
        let prev = self
            .cursor_back
            .prev_boundary(self.string, 0)
            .unwrap()
            .unwrap();
        Some(&self.string[prev..end])
    }
}

#[inline]
pub fn new_graphemes(s: &str, is_extended: bool) -> Graphemes<'_> {
    let len = s.len();
    Graphemes {
        string: s,
        cursor: GraphemeCursor::new(0, len, is_extended),
        cursor_back: GraphemeCursor::new(len, len, is_extended),
    }
}

#[inline]
pub fn new_grapheme_indices(s: &str, is_extended: bool) -> GraphemeIndices<'_> {
    GraphemeIndices {
        start_offset: s.as_ptr() as usize,
        iter: new_graphemes(s, is_extended),
    }
}

/// maybe unify with PairResult?
/// An enum describing information about a potential boundary.
#[derive(PartialEq, Eq, Clone, Debug)]
enum GraphemeState {
    /// No information is known.
    Unknown,
    /// It is known to not be a boundary.
    NotBreak,
   
```
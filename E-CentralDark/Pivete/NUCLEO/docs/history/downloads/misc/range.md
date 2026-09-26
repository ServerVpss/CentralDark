# OUTRO - range.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\unic-char-range-0.9.0\src\range.rs
**SHA:** 5ce555d9cf8513c7
**Timestamp:** 2026-08-28T02:36:31.998837
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub fn closed(start: char, stop: char) -> CharRange {
- pub fn open_right(start: char, stop: char) -> CharRange {
- pub fn open_left(start: char, stop: char) -> CharRange {
- pub fn open(start: char, stop: char) -> CharRange {
- pub fn bound(start: Bound<char>, stop: Bound<char>) -> CharRange {
- let start = if start == Bound::Unbounded {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2017 The UNIC Project Developers.
//
// See the COPYRIGHT file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use core::{char, cmp};

#[cfg(feature = "std")]
use std::collections::Bound;

use self::cmp::Ordering;
use crate::CharIter;

/// A range of unicode code points.
///
/// The most idiomatic way to construct this range is through the use of the `chars!` macro:
///
/// ```
/// #[macro_use] extern crate unic_char_range;
/// use unic_char_range::CharRange;
///
/// # fn main() {
/// assert_eq!(chars!('a'..='z'), CharRange::closed('a', 'z'));
/// assert_eq!(chars!('a'..'z'), CharRange::open_right('a', 'z'));
/// assert_eq!(chars!(..), CharRange::all());
/// # }
/// ```
///
/// If constructed in reverse order, such that `self.high` is ordered before `self.low`,
/// the range is empty. If you want to iterate in decreasing order, use `.iter().rev()`.
/// All empty ranges are considered equal no matter the internal state.
#[derive(Copy, Clone, Debug, Eq)]
pub struct CharRange {
    /// The lowest character in this range (inclusive).
    pub low: char,

    /// The highest character in this range (inclusive).
    pub high: char,
}

/// Constructors
impl CharRange {
    /// Construct a closed range of characters.
    ///
    /// If `stop` is ordered before `start`, the resulting range will be empty.
    ///
    /// # Example
    ///
    /// ```
    /// # use unic_char_range::*;
    /// assert_eq!(
    ///     CharRange::closed('a', 'd').iter().collect::<Vec<_>>(),
    ///     vec!['a', 'b', 'c', 'd']
    /// )
    /// ```
    pub fn closed(start: char, stop: char) -> CharRange {
        CharRange {
            low: start,
            high: stop,
        }
    }

    /// Construct a half open (right) range of characters.
    ///
    /// # Example
    ///
    /// ```
    /// # use unic_char_range::*;
    /// assert_eq!(
    ///     CharRange::open_right('a', 'd').iter().collect::<Vec<_>>(),
    ///     vec!['a', 'b', 'c']
    /// )
    /// ```
    pub fn open_right(start: char, stop: char) -> CharRange {
        let mut iter = CharRange::closed(start, stop).iter();
        let _ = iter.next_back();
        iter.into()
    }

    /// Construct a half open (left) range of characters.
    ///
    /// # Example
    ///
    /// ```
    /// # use unic_char_range::*;
    /// assert_eq!(
    ///     CharRange::open_left('a', 'd').iter().collect::<Vec<_>>(),
    ///     vec!['b', 'c', 'd']
    /// )
    /// ```
    pub fn open_left(start: char, stop: char) -> CharRange {
        let mut iter = CharRange::closed(start, stop).iter();
        let _ = iter.next();
        iter.into()
    }

    /// Construct a fully open range of characters.
    ///
    /// # Example
    ///
    /// ```
    /// # use unic_char_range::*;
    /// assert_eq!(
    ///     CharRange::open('a', 'd').iter().collect::<Vec<_>>(),
    ///     vec!['b', 'c']
    /// )
    /// ```
    pub fn open(start: char, stop: char) -> CharRange {
        let mut iter = CharRange::closed(start, stop).iter();
        let _ = iter.next();
        let _ = iter.next_back();
        iter.into()
    }

    #[cfg(feature = "std")]
    /// Construct a range of characters from bounds.
    pub fn bound(start: Bound<char>, stop: Bound<char>) -> CharRange {
        let start = if start == Bound::Unbounded {
            Bound::Included('\u{0}')
        } else {
            start
        };
        let stop = if stop == Bound::Unbounded {
            Bound::Included(char::MAX)
        } else {
            stop
        };
        match (start, stop) {
            (Bound::Included(start), Bound::Included(stop)) => CharRange::closed(start, stop),
            (Bound::Excluded(start), Bound::Excluded(stop)) => CharRange::open(start, stop),
            (Bound::Included(start), Bound::Excluded(stop)) => CharRange::open_right(start, stop),
            (Bound::Excluded(start), Bound::Included(stop)) => CharRange::open_left(start, stop),
            (Bound::Unbounded, _) | (_, Bound::Unbounded) => unreachable!(),
        }
    }

    /// Construct a range over all Unicode characters (Unicode Scalar Values).
    pub fn all() -> CharRange {
        CharRange::closed('\u{0}', char::MAX)
    }

    /// Construct a range over all characters of *assigned* Unicode Planes.
    ///
    /// Assigned *normal* (non-special) Unicode Planes are:
    /// - Plane 0: *Basic Multilingual Plane* (BMP)
    /// - Plane 1: *Supplementary Multilingual Plane* (SMP)
    /// - Plane 2: *Supplementary Ideographic Plane* (SIP)
    ///
    /// Unicode Plane 14, *Supplementary Special-purpose Plane* (SSP), is not included in this
    /// range, mainly because of the limit of `CharRange` only supporting a con
```
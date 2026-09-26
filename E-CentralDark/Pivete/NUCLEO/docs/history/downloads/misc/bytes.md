# OUTRO - bytes.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-1.13.1\src\regexset\bytes.rs
**SHA:** 25c8d896e4b9caf6
**Timestamp:** 2026-08-28T02:35:04.647690
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// match when `start == 0`.
- pub fn is_match_at(&self, haystack: &[u8], start: usize) -> bool {
- /// match when `start == 0`.
- pub fn matches_at(&self, haystack: &[u8], start: usize) -> SetMatches {
- /// match when `start == 0`.
- start: usize,
- start: usize,

### Ouro Bruto (primeiros 5000 chars)
```
use alloc::string::String;

use regex_automata::{meta, Input, PatternID, PatternSet, PatternSetIter};

use crate::{bytes::RegexSetBuilder, Error};

/// Match multiple, possibly overlapping, regexes in a single search.
///
/// A regex set corresponds to the union of zero or more regular expressions.
/// That is, a regex set will match a haystack when at least one of its
/// constituent regexes matches. A regex set as its formulated here provides a
/// touch more power: it will also report *which* regular expressions in the
/// set match. Indeed, this is the key difference between regex sets and a
/// single `Regex` with many alternates, since only one alternate can match at
/// a time.
///
/// For example, consider regular expressions to match email addresses and
/// domains: `[a-z]+@[a-z]+\.(com|org|net)` and `[a-z]+\.(com|org|net)`. If a
/// regex set is constructed from those regexes, then searching the haystack
/// `foo@example.com` will report both regexes as matching. Of course, one
/// could accomplish this by compiling each regex on its own and doing two
/// searches over the haystack. The key advantage of using a regex set is
/// that it will report the matching regexes using a *single pass through the
/// haystack*. If one has hundreds or thousands of regexes to match repeatedly
/// (like a URL router for a complex web application or a user agent matcher),
/// then a regex set *can* realize huge performance gains.
///
/// Unlike the top-level [`RegexSet`](crate::RegexSet), this `RegexSet`
/// searches haystacks with type `&[u8]` instead of `&str`. Consequently, this
/// `RegexSet` is permitted to match invalid UTF-8.
///
/// # Limitations
///
/// Regex sets are limited to answering the following two questions:
///
/// 1. Does any regex in the set match?
/// 2. If so, which regexes in the set match?
///
/// As with the main [`Regex`][crate::bytes::Regex] type, it is cheaper to ask
/// (1) instead of (2) since the matching engines can stop after the first
/// match is found.
///
/// You cannot directly extract [`Match`][crate::bytes::Match] or
/// [`Captures`][crate::bytes::Captures] objects from a regex set. If you need
/// these operations, the recommended approach is to compile each pattern in
/// the set independently and scan the exact same haystack a second time with
/// those independently compiled patterns:
///
/// ```
/// use regex::bytes::{Regex, RegexSet};
///
/// let patterns = ["foo", "bar"];
/// // Both patterns will match different ranges of this string.
/// let hay = b"barfoo";
///
/// // Compile a set matching any of our patterns.
/// let set = RegexSet::new(patterns).unwrap();
/// // Compile each pattern independently.
/// let regexes: Vec<_> = set
///     .patterns()
///     .iter()
///     .map(|pat| Regex::new(pat).unwrap())
///     .collect();
///
/// // Match against the whole set first and identify the individual
/// // matching patterns.
/// let matches: Vec<&[u8]> = set
///     .matches(hay)
///     .into_iter()
///     // Dereference the match index to get the corresponding
///     // compiled pattern.
///     .map(|index| &regexes[index])
///     // To get match locations or any other info, we then have to search the
///     // exact same haystack again, using our separately-compiled pattern.
///     .map(|re| re.find(hay).unwrap().as_bytes())
///     .collect();
///
/// // Matches arrive in the order the constituent patterns were declared,
/// // not the order they appear in the haystack.
/// assert_eq!(vec![&b"foo"[..], &b"bar"[..]], matches);
/// ```
///
/// # Performance
///
/// A `RegexSet` has the same performance characteristics as `Regex`. Namely,
/// search takes `O(m * n)` time, where `m` is proportional to the size of the
/// regex set and `n` is proportional to the length of the haystack.
///
/// # Trait implementations
///
/// The `Default` trait is implemented for `RegexSet`. The default value
/// is an empty set. An empty set can also be explicitly constructed via
/// [`RegexSet::empty`].
///
/// # Example
///
/// This shows how the above two regexes (for matching email addresses and
/// domains) might work:
///
/// ```
/// use regex::bytes::RegexSet;
///
/// let set = RegexSet::new(&[
///     r"[a-z]+@[a-z]+\.(com|org|net)",
///     r"[a-z]+\.(com|org|net)",
/// ]).unwrap();
///
/// // Ask whether any regexes in the set match.
/// assert!(set.is_match(b"foo@example.com"));
///
/// // Identify which regexes in the set match.
/// let matches: Vec<_> = set.matches(b"foo@example.com").into_iter().collect();
/// assert_eq!(vec![0, 1], matches);
///
/// // Try again, but with a haystack that only matches one of the regexes.
/// let matches: Vec<_> = set.matches(b"example.com").into_iter().collect();
/// assert_eq!(vec![1], matches);
///
/// // Try again, but with a haystack that doesn't match any regex in the set.
/// let matches: Vec<_> = set.matches(b"example").into_iter().collect();
/// assert!(matches.is_empty());
/// ```
///
/// Note that it would be possibl
```

---

# OUTRO - bytes.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\shlex-2.0.1\src\bytes.rs
**SHA:** 14ac6d79be6cd935
**Timestamp:** 2026-08-28T02:35:42.261562
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: more options
- // TODO: add $'xxx' and "$(printf 'xxx')" styles

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2015 Nicholas Allegra (comex).
// Licensed under the Apache License, Version 2.0 <https://www.apache.org/licenses/LICENSE-2.0> or
// the MIT license <https://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.

//! [`Shlex`] and friends for byte strings.
//!
//! This is used internally by the [outer module](crate), and may be more
//! convenient if you are working with byte slices (`[u8]`) or types that are
//! wrappers around bytes, such as [`OsStr`](std::ffi::OsStr):
//!
//! ```rust
//! #[cfg(unix)] {
//!     use shlex::bytes::try_quote;
//!     use std::ffi::OsStr;
//!     use std::os::unix::ffi::OsStrExt;
//!
//!     // `\x80` is invalid in UTF-8.
//!     let os_str = OsStr::from_bytes(b"a\x80b c");
//!     assert_eq!(try_quote(os_str.as_bytes()).unwrap(), &b"'a\x80b c'"[..]);
//! }
//! ```
//!
//! (On Windows, `OsStr` uses 16 bit wide characters so this will not work.)

extern crate alloc;
use alloc::vec::Vec;
use alloc::borrow::Cow;
#[cfg(test)]
use alloc::borrow::ToOwned;
#[cfg(all(doc, not(doctest)))]
use crate::{self as shlex, quoting_warning};

use super::QuoteError;

/// An iterator that takes an input byte string and splits it into the words using the same syntax as
/// the POSIX shell.
pub struct Shlex<'a> {
    in_iter: core::slice::Iter<'a, u8>,
    /// The number of newlines read so far, plus one.
    pub line_no: usize,
    /// An input string is erroneous if it ends while inside a quotation or right after an
    /// unescaped backslash.  Since Iterator does not have a mechanism to return an error, if that
    /// happens, Shlex just throws out the last token, ends the iteration, and sets 'had_error' to
    /// true; best to check it after you're done iterating.
    pub had_error: bool,
}

impl<'a> Shlex<'a> {
    pub fn new(in_bytes: &'a [u8]) -> Self {
        Shlex {
            in_iter: in_bytes.iter(),
            line_no: 1,
            had_error: false,
        }
    }

    fn parse_word(&mut self, mut ch: u8) -> Option<Vec<u8>> {
        let mut result: Vec<u8> = Vec::new();
        loop {
            match ch as char {
                '"' => if let Err(()) = self.parse_double(&mut result) {
                    self.had_error = true;
                    return None;
                },
                '\'' => if let Err(()) = self.parse_single(&mut result) {
                    self.had_error = true;
                    return None;
                },
                '\\' => if let Some(ch2) = self.next_char() {
                    if ch2 != b'\n' { result.push(ch2); }
                } else {
                    self.had_error = true;
                    return None;
                },
                ' ' | '\t' | '\n' => { break; },
                _ => { result.push(ch); },
            }
            if let Some(ch2) = self.next_char() { ch = ch2; } else { break; }
        }
        Some(result)
    }

    fn parse_double(&mut self, result: &mut Vec<u8>) -> Result<(), ()> {
        loop {
            if let Some(ch2) = self.next_char() {
                match ch2 as char {
                    '\\' => {
                        if let Some(ch3) = self.next_char() {
                            match ch3 as char {
                                // \$ => $
                                '$' | '`' | '"' | '\\' => { result.push(ch3); },
                                // \<newline> => nothing
                                '\n' => {},
                                // \x => =x
                                _ => { result.push(b'\\'); result.push(ch3); }
                            }
                        } else {
                            return Err(());
                        }
                    },
                    '"' => { return Ok(()); },
                    _ => { result.push(ch2); },
                }
            } else {
                return Err(());
            }
        }
    }

    fn parse_single(&mut self, result: &mut Vec<u8>) -> Result<(), ()> {
        loop {
            if let Some(ch2) = self.next_char() {
                match ch2 as char {
                    '\'' => { return Ok(()); },
                    _ => { result.push(ch2); },
                }
            } else {
                return Err(());
            }
        }
    }

    fn next_char(&mut self) -> Option<u8> {
        let res = self.in_iter.next().copied();
        if res == Some(b'\n') { self.line_no += 1; }
        res
    }
}

impl Iterator for Shlex<'_> {
    type Item = Vec<u8>;
    fn next(&mut self) -> Option<Self::Item> {
        if let Some(mut ch) = self.next_char() {
            // skip initial whitespace
            loop {
                match ch as char {
                    ' ' | '\t' | '\n' => {},
                    '#' => {
                        while let Some(ch2) = self.next_char() {
                            if ch2 as char == '\n' { break; }
                        }
```

---

# OUTRO - bytes.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\stream\bytes.rs
**SHA:** 2b93193d912aaa20
**Timestamp:** 2026-08-28T02:37:39.409153
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- _token_start: &Self::Checkpoint,
- _err_start: &Self::Checkpoint,
- fn offset_from(&self, start: &Self) -> usize {

### Ouro Bruto (primeiros 5000 chars)
```
use core::num::NonZeroUsize;

use crate::error::Needed;
use crate::stream::AsBytes;
use crate::stream::Checkpoint;
use crate::stream::Compare;
use crate::stream::CompareResult;
use crate::stream::FindSlice;
use crate::stream::Offset;
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::stream::Recover;
use crate::stream::SliceLen;
use crate::stream::Stream;
use crate::stream::StreamIsPartial;
use crate::stream::UpdateSlice;
use core::iter::{Cloned, Enumerate};
use core::slice::Iter;
use core::{cmp::Ordering, fmt, ops};

/// Improved `Debug` experience for `&[u8]` byte streams
#[allow(clippy::derived_hash_with_manual_eq)]
#[derive(Hash)]
#[repr(transparent)]
pub struct Bytes([u8]);

impl Bytes {
    /// Make a stream out of a byte slice-like.
    #[inline]
    pub fn new<B: ?Sized + AsRef<[u8]>>(bytes: &B) -> &Self {
        Self::from_bytes(bytes.as_ref())
    }

    #[inline]
    fn from_bytes(slice: &[u8]) -> &Self {
        unsafe { core::mem::transmute(slice) }
    }

    #[inline]
    fn as_bytes(&self) -> &[u8] {
        &self.0
    }
}

impl SliceLen for &Bytes {
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.len()
    }
}

impl<'i> Stream for &'i Bytes {
    type Token = u8;
    type Slice = &'i [u8];

    type IterOffsets = Enumerate<Cloned<Iter<'i, u8>>>;

    type Checkpoint = Checkpoint<Self, Self>;

    #[inline(always)]
    fn iter_offsets(&self) -> Self::IterOffsets {
        self.iter().cloned().enumerate()
    }
    #[inline(always)]
    fn eof_offset(&self) -> usize {
        self.len()
    }

    #[inline(always)]
    fn next_token(&mut self) -> Option<Self::Token> {
        if self.is_empty() {
            None
        } else {
            let token = self[0];
            *self = &self[1..];
            Some(token)
        }
    }

    #[inline(always)]
    fn peek_token(&self) -> Option<Self::Token> {
        if self.is_empty() {
            None
        } else {
            Some(self[0])
        }
    }

    #[inline(always)]
    fn offset_for<P>(&self, predicate: P) -> Option<usize>
    where
        P: Fn(Self::Token) -> bool,
    {
        self.iter().position(|b| predicate(*b))
    }
    #[inline(always)]
    fn offset_at(&self, tokens: usize) -> Result<usize, Needed> {
        if let Some(needed) = tokens.checked_sub(self.len()).and_then(NonZeroUsize::new) {
            Err(Needed::Size(needed))
        } else {
            Ok(tokens)
        }
    }
    #[inline(always)]
    fn next_slice(&mut self, offset: usize) -> Self::Slice {
        let (slice, next) = self.0.split_at(offset);
        *self = Bytes::from_bytes(next);
        slice
    }
    #[inline(always)]
    unsafe fn next_slice_unchecked(&mut self, offset: usize) -> Self::Slice {
        #[cfg(debug_assertions)]
        self.peek_slice(offset);

        // SAFETY: `Stream::next_slice_unchecked` requires `offset` to be in bounds
        let slice = unsafe { self.0.get_unchecked(..offset) };
        // SAFETY: `Stream::next_slice_unchecked` requires `offset` to be in bounds
        let next = unsafe { self.0.get_unchecked(offset..) };
        *self = Bytes::from_bytes(next);
        slice
    }
    #[inline(always)]
    fn peek_slice(&self, offset: usize) -> Self::Slice {
        &self[..offset]
    }
    #[inline(always)]
    unsafe fn peek_slice_unchecked(&self, offset: usize) -> Self::Slice {
        #[cfg(debug_assertions)]
        self.peek_slice(offset);

        // SAFETY: `Stream::next_slice_unchecked` requires `offset` to be in bounds
        let slice = unsafe { self.0.get_unchecked(..offset) };
        slice
    }

    #[inline(always)]
    fn checkpoint(&self) -> Self::Checkpoint {
        Checkpoint::<_, Self>::new(*self)
    }
    #[inline(always)]
    fn reset(&mut self, checkpoint: &Self::Checkpoint) {
        *self = checkpoint.inner;
    }

    #[inline(always)]
    fn raw(&self) -> &dyn core::fmt::Debug {
        self
    }
}

#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
impl<E> Recover<E> for &Bytes {
    #[inline(always)]
    fn record_err(
        &mut self,
        _token_start: &Self::Checkpoint,
        _err_start: &Self::Checkpoint,
        err: E,
    ) -> Result<(), E> {
        Err(err)
    }

    /// Report whether the [`Stream`] can save off errors for recovery
    #[inline(always)]
    fn is_recovery_supported() -> bool {
        false
    }
}

impl StreamIsPartial for &Bytes {
    type PartialState = ();

    #[inline]
    fn complete(&mut self) -> Self::PartialState {
        // Already complete
    }

    #[inline]
    fn restore_partial(&mut self, _state: Self::PartialState) {}

    #[inline(always)]
    fn is_partial_supported() -> bool {
        false
    }
}

impl Offset for &Bytes {
    #[inline(always)]
    fn offset_from(&self, start: &Self) -> usize {
        self.as_bytes().offset_from(&start.as_bytes())
    }
}

impl<'a> Offset<<&'a Bytes as Stream>::Checkpoint> for &'a Bytes {
    #[inline(always)]
    fn offset_from(&
```

---

# OUTRO - bytes.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\stream\bytes.rs
**SHA:** b98cb70135ba78ce
**Timestamp:** 2026-08-28T02:37:41.159544
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- _token_start: &Self::Checkpoint,
- _err_start: &Self::Checkpoint,
- fn offset_from(&self, start: &Self) -> usize {

### Ouro Bruto (primeiros 5000 chars)
```
use core::num::NonZeroUsize;

use crate::stream::AsBytes;
use crate::stream::Checkpoint;
use crate::stream::Compare;
use crate::stream::CompareResult;
use crate::stream::FindSlice;
use crate::stream::Needed;
use crate::stream::Offset;
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::stream::Recover;
use crate::stream::SliceLen;
use crate::stream::Stream;
use crate::stream::StreamIsPartial;
use crate::stream::UpdateSlice;
use core::iter::{Cloned, Enumerate};
use core::slice::Iter;
use core::{cmp::Ordering, fmt, ops};

/// Improved `Debug` experience for `&[u8]` byte streams
#[allow(clippy::derived_hash_with_manual_eq)]
#[derive(Hash)]
#[repr(transparent)]
pub struct Bytes([u8]);

impl Bytes {
    /// Make a stream out of a byte slice-like.
    #[inline]
    pub fn new<B: ?Sized + AsRef<[u8]>>(bytes: &B) -> &Self {
        Self::from_bytes(bytes.as_ref())
    }

    #[inline]
    fn from_bytes(slice: &[u8]) -> &Self {
        unsafe { core::mem::transmute(slice) }
    }

    #[inline]
    fn as_bytes(&self) -> &[u8] {
        &self.0
    }
}

impl SliceLen for &Bytes {
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.len()
    }
}

impl<'i> Stream for &'i Bytes {
    type Token = u8;
    type Slice = &'i [u8];

    type IterOffsets = Enumerate<Cloned<Iter<'i, u8>>>;

    type Checkpoint = Checkpoint<Self, Self>;

    #[inline(always)]
    fn iter_offsets(&self) -> Self::IterOffsets {
        self.iter().cloned().enumerate()
    }
    #[inline(always)]
    fn eof_offset(&self) -> usize {
        self.len()
    }

    #[inline(always)]
    fn next_token(&mut self) -> Option<Self::Token> {
        if self.is_empty() {
            None
        } else {
            let token = self[0];
            *self = &self[1..];
            Some(token)
        }
    }

    #[inline(always)]
    fn peek_token(&self) -> Option<Self::Token> {
        if self.is_empty() {
            None
        } else {
            Some(self[0])
        }
    }

    #[inline(always)]
    fn offset_for<P>(&self, predicate: P) -> Option<usize>
    where
        P: Fn(Self::Token) -> bool,
    {
        self.iter().position(|b| predicate(*b))
    }
    #[inline(always)]
    fn offset_at(&self, tokens: usize) -> Result<usize, Needed> {
        if let Some(needed) = tokens.checked_sub(self.len()).and_then(NonZeroUsize::new) {
            Err(Needed::Size(needed))
        } else {
            Ok(tokens)
        }
    }
    #[inline(always)]
    fn next_slice(&mut self, offset: usize) -> Self::Slice {
        let (slice, next) = self.0.split_at(offset);
        *self = Bytes::from_bytes(next);
        slice
    }
    #[inline(always)]
    unsafe fn next_slice_unchecked(&mut self, offset: usize) -> Self::Slice {
        #[cfg(debug_assertions)]
        self.peek_slice(offset);

        // SAFETY: `Stream::next_slice_unchecked` requires `offset` to be in bounds
        let slice = unsafe { self.0.get_unchecked(..offset) };
        // SAFETY: `Stream::next_slice_unchecked` requires `offset` to be in bounds
        let next = unsafe { self.0.get_unchecked(offset..) };
        *self = Bytes::from_bytes(next);
        slice
    }
    #[inline(always)]
    fn peek_slice(&self, offset: usize) -> Self::Slice {
        &self[..offset]
    }
    #[inline(always)]
    unsafe fn peek_slice_unchecked(&self, offset: usize) -> Self::Slice {
        #[cfg(debug_assertions)]
        self.peek_slice(offset);

        // SAFETY: `Stream::next_slice_unchecked` requires `offset` to be in bounds
        let slice = unsafe { self.0.get_unchecked(..offset) };
        slice
    }

    #[inline(always)]
    fn checkpoint(&self) -> Self::Checkpoint {
        Checkpoint::<_, Self>::new(*self)
    }
    #[inline(always)]
    fn reset(&mut self, checkpoint: &Self::Checkpoint) {
        *self = checkpoint.inner;
    }

    fn trace(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(f, "{self:#?}")
    }
}

#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
impl<E> Recover<E> for &Bytes {
    #[inline(always)]
    fn record_err(
        &mut self,
        _token_start: &Self::Checkpoint,
        _err_start: &Self::Checkpoint,
        err: E,
    ) -> Result<(), E> {
        Err(err)
    }

    /// Report whether the [`Stream`] can save off errors for recovery
    #[inline(always)]
    fn is_recovery_supported() -> bool {
        false
    }
}

impl StreamIsPartial for &Bytes {
    type PartialState = ();

    #[inline]
    fn complete(&mut self) -> Self::PartialState {
        // Already complete
    }

    #[inline]
    fn restore_partial(&mut self, _state: Self::PartialState) {}

    #[inline(always)]
    fn is_partial_supported() -> bool {
        false
    }
}

impl Offset for &Bytes {
    #[inline(always)]
    fn offset_from(&self, start: &Self) -> usize {
        self.as_bytes().offset_from(&start.as_bytes())
    }
}

impl<'a> Offset<<&'a Bytes as Stream>::Checkpoint> for &'a Bytes {
    #[inline(
```
# OUTRO - core.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\indexmap-1.9.3\src\map\core.rs
**SHA:** 8422cd774c5db7d8
**Timestamp:** 2026-08-28T02:34:30.064583
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn decrement_indices(&mut self, start: usize, end: usize) {
- fn increment_indices(&mut self, start: usize, end: usize) {
- fn erase_indices(&mut self, start: usize, end: usize) {

### Ouro Bruto (primeiros 5000 chars)
```
//! This is the core implementation that doesn't depend on the hasher at all.
//!
//! The methods of `IndexMapCore` don't use any Hash properties of K.
//!
//! It's cleaner to separate them out, then the compiler checks that we are not
//! using Hash at all in these methods.
//!
//! However, we should probably not let this show in the public API or docs.

mod raw;

use hashbrown::raw::RawTable;

use crate::vec::{Drain, Vec};
use core::cmp;
use core::fmt;
use core::mem::replace;
use core::ops::RangeBounds;

use crate::equivalent::Equivalent;
use crate::util::simplify_range;
use crate::{Bucket, Entries, HashValue};

/// Core of the map that does not depend on S
pub(crate) struct IndexMapCore<K, V> {
    /// indices mapping from the entry hash to its index.
    indices: RawTable<usize>,
    /// entries is a dense vec of entries in their order.
    entries: Vec<Bucket<K, V>>,
}

#[inline(always)]
fn get_hash<K, V>(entries: &[Bucket<K, V>]) -> impl Fn(&usize) -> u64 + '_ {
    move |&i| entries[i].hash.get()
}

#[inline]
fn equivalent<'a, K, V, Q: ?Sized + Equivalent<K>>(
    key: &'a Q,
    entries: &'a [Bucket<K, V>],
) -> impl Fn(&usize) -> bool + 'a {
    move |&i| Q::equivalent(key, &entries[i].key)
}

#[inline]
fn erase_index(table: &mut RawTable<usize>, hash: HashValue, index: usize) {
    let erased = table.erase_entry(hash.get(), move |&i| i == index);
    debug_assert!(erased);
}

#[inline]
fn update_index(table: &mut RawTable<usize>, hash: HashValue, old: usize, new: usize) {
    let index = table
        .get_mut(hash.get(), move |&i| i == old)
        .expect("index not found");
    *index = new;
}

impl<K, V> Clone for IndexMapCore<K, V>
where
    K: Clone,
    V: Clone,
{
    fn clone(&self) -> Self {
        let indices = self.indices.clone();
        let mut entries = Vec::with_capacity(indices.capacity());
        entries.clone_from(&self.entries);
        IndexMapCore { indices, entries }
    }

    fn clone_from(&mut self, other: &Self) {
        let hasher = get_hash(&other.entries);
        self.indices.clone_from_with_hasher(&other.indices, hasher);
        if self.entries.capacity() < other.entries.len() {
            // If we must resize, match the indices capacity
            self.reserve_entries();
        }
        self.entries.clone_from(&other.entries);
    }
}

impl<K, V> fmt::Debug for IndexMapCore<K, V>
where
    K: fmt::Debug,
    V: fmt::Debug,
{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("IndexMapCore")
            .field("indices", &raw::DebugIndices(&self.indices))
            .field("entries", &self.entries)
            .finish()
    }
}

impl<K, V> Entries for IndexMapCore<K, V> {
    type Entry = Bucket<K, V>;

    #[inline]
    fn into_entries(self) -> Vec<Self::Entry> {
        self.entries
    }

    #[inline]
    fn as_entries(&self) -> &[Self::Entry] {
        &self.entries
    }

    #[inline]
    fn as_entries_mut(&mut self) -> &mut [Self::Entry] {
        &mut self.entries
    }

    fn with_entries<F>(&mut self, f: F)
    where
        F: FnOnce(&mut [Self::Entry]),
    {
        f(&mut self.entries);
        self.rebuild_hash_table();
    }
}

impl<K, V> IndexMapCore<K, V> {
    #[inline]
    pub(crate) const fn new() -> Self {
        IndexMapCore {
            indices: RawTable::new(),
            entries: Vec::new(),
        }
    }

    #[inline]
    pub(crate) fn with_capacity(n: usize) -> Self {
        IndexMapCore {
            indices: RawTable::with_capacity(n),
            entries: Vec::with_capacity(n),
        }
    }

    #[inline]
    pub(crate) fn len(&self) -> usize {
        self.indices.len()
    }

    #[inline]
    pub(crate) fn capacity(&self) -> usize {
        cmp::min(self.indices.capacity(), self.entries.capacity())
    }

    pub(crate) fn clear(&mut self) {
        self.indices.clear();
        self.entries.clear();
    }

    pub(crate) fn truncate(&mut self, len: usize) {
        if len < self.len() {
            self.erase_indices(len, self.entries.len());
            self.entries.truncate(len);
        }
    }

    pub(crate) fn drain<R>(&mut self, range: R) -> Drain<'_, Bucket<K, V>>
    where
        R: RangeBounds<usize>,
    {
        let range = simplify_range(range, self.entries.len());
        self.erase_indices(range.start, range.end);
        self.entries.drain(range)
    }

    #[cfg(feature = "rayon")]
    pub(crate) fn par_drain<R>(&mut self, range: R) -> rayon::vec::Drain<'_, Bucket<K, V>>
    where
        K: Send,
        V: Send,
        R: RangeBounds<usize>,
    {
        use rayon::iter::ParallelDrainRange;
        let range = simplify_range(range, self.entries.len());
        self.erase_indices(range.start, range.end);
        self.entries.par_drain(range)
    }

    pub(crate) fn split_off(&mut self, at: usize) -> Self {
        assert!(at <= self.entries.len());
        self.erase_indices(at, self.entries.len());
        let entries = self.entries.split_off(at);

   
```

---

# OUTRO - core.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\combinator\core.rs
**SHA:** 6c53923e4a81e2fd
**Timestamp:** 2026-08-28T02:37:39.170402
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = self.input.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
use crate::combinator::trace;
use crate::error::{ModalError, ParserError};
use crate::stream::Stream;
use crate::*;

/// Apply a [`Parser`], producing `None` on [`ErrMode::Backtrack`][crate::error::ErrMode::Backtrack].
///
/// To chain an error up, see [`cut_err`].
///
/// # Example
///
/// ```rust
/// # use winnow::prelude::*;
/// use winnow::combinator::opt;
/// use winnow::ascii::alpha1;
/// # fn main() {
///
/// fn parser<'i>(i: &mut &'i str) -> ModalResult<Option<&'i str>> {
///   opt(alpha1).parse_next(i)
/// }
///
/// assert_eq!(parser.parse_peek("abcd;"), Ok((";", Some("abcd"))));
/// assert_eq!(parser.parse_peek("123;"), Ok(("123;", None)));
/// # }
/// ```
pub fn opt<Input: Stream, Output, Error, ParseNext>(
    mut parser: ParseNext,
) -> impl Parser<Input, Option<Output>, Error>
where
    ParseNext: Parser<Input, Output, Error>,
    Error: ParserError<Input>,
{
    trace("opt", move |input: &mut Input| {
        let start = input.checkpoint();
        match parser.parse_next(input) {
            Ok(o) => Ok(Some(o)),
            Err(e) if e.is_backtrack() => {
                input.reset(&start);
                Ok(None)
            }
            Err(e) => Err(e),
        }
    })
}

/// Calls the parser if the condition is met.
///
/// # Example
///
/// ```rust
/// # use winnow::prelude::*;
/// # use winnow::combinator::opt;
/// use winnow::combinator::cond;
/// use winnow::ascii::alpha1;
/// # fn main() {
///
/// fn parser<'i>(i: &mut &'i str) -> ModalResult<Option<&'i str>> {
///   let prefix = opt("-").parse_next(i)?;
///   let condition = prefix.is_some();
///   cond(condition, alpha1).parse_next(i)
/// }
///
/// assert_eq!(parser.parse_peek("-abcd;"), Ok((";", Some("abcd"))));
/// assert_eq!(parser.parse_peek("abcd;"), Ok(("abcd;", None)));
/// assert!(parser.parse_peek("-123;").is_err());
/// assert_eq!(parser.parse_peek("123;"), Ok(("123;", None)));
/// # }
/// ```
pub fn cond<Input, Output, Error, ParseNext>(
    cond: bool,
    mut parser: ParseNext,
) -> impl Parser<Input, Option<Output>, Error>
where
    Input: Stream,
    ParseNext: Parser<Input, Output, Error>,
    Error: ParserError<Input>,
{
    trace("cond", move |input: &mut Input| {
        if cond {
            parser.parse_next(input).map(Some)
        } else {
            Ok(None)
        }
    })
}

/// Apply the parser without advancing the input.
///
/// To lookahead and only advance on success, see [`opt`].
///
/// # Example
///
/// ```rust
/// # use winnow::prelude::*;
/// use winnow::combinator::peek;
/// use winnow::ascii::alpha1;
/// # fn main() {
///
/// fn parser<'i>(input: &mut &'i str) -> ModalResult<&'i str> {
///     peek(alpha1).parse_next(input)
/// }
///
/// assert_eq!(parser.parse_peek("abcd;"), Ok(("abcd;", "abcd")));
/// assert!(parser.parse_peek("123;").is_err());
/// # }
/// ```
#[doc(alias = "look_ahead")]
#[doc(alias = "rewind")]
pub fn peek<Input, Output, Error, ParseNext>(
    mut parser: ParseNext,
) -> impl Parser<Input, Output, Error>
where
    Input: Stream,
    Error: ParserError<Input>,
    ParseNext: Parser<Input, Output, Error>,
{
    trace("peek", move |input: &mut Input| {
        let start = input.checkpoint();
        let res = parser.parse_next(input);
        input.reset(&start);
        res
    })
}

/// Match the end of the [`Stream`]
///
/// Otherwise, it will error.
///
/// # Effective Signature
///
/// Assuming you are parsing a `&str` [Stream]:
/// ```rust
/// # use winnow::prelude::*;;
/// pub fn eof<'i>(input: &mut &'i str) -> ModalResult<&'i str>
/// # {
/// #     winnow::combinator::eof.parse_next(input)
/// # }
/// ```
///
/// # Example
///
/// ```rust
/// # use std::str;
/// # use winnow::combinator::eof;
/// # use winnow::prelude::*;
///
/// fn parser<'i>(input: &mut &'i str) -> ModalResult<&'i str> {
///     eof.parse_next(input)
/// }
/// assert!(parser.parse_peek("abc").is_err());
/// assert_eq!(parser.parse_peek(""), Ok(("", "")));
/// ```
#[doc(alias = "end")]
#[doc(alias = "eoi")]
pub fn eof<Input, Error>(input: &mut Input) -> Result<<Input as Stream>::Slice, Error>
where
    Input: Stream,
    Error: ParserError<Input>,
{
    trace("eof", move |input: &mut Input| {
        if input.eof_offset() == 0 {
            Ok(input.next_slice(0))
        } else {
            Err(ParserError::from_input(input))
        }
    })
    .parse_next(input)
}

/// Succeeds if the child parser returns an error.
///
/// <div class="warning">
///
/// **Note:** This does not advance the [`Stream`]
///
/// </div>
///
/// # Example
///
/// ```rust
/// # use winnow::prelude::*;
/// use winnow::combinator::not;
/// use winnow::ascii::alpha1;
/// # fn main() {
///
/// fn parser<'i>(input: &mut &'i str) -> ModalResult<()> {
///     not(alpha1).parse_next(input)
/// }
///
/// assert_eq!(parser.parse_peek("123"), Ok(("123", ())));
/// assert!(parser.parse_peek("abcd").is_err());
/// # }
/// ```
pub fn not<Input, Output, Error, ParseNext>(mut parser: ParseNext) -> impl Parser<Input, (), Error>
w
```

---

# OUTRO - core.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\combinator\core.rs
**SHA:** be32c15e635b436a
**Timestamp:** 2026-08-28T02:37:40.951737
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = input.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
use crate::combinator::trace;
use crate::error::{ModalError, ParserError};
use crate::stream::Stream;
use crate::{Parser, Result};

/// Apply a [`Parser`], producing `None` on [`ErrMode::Backtrack`][crate::error::ErrMode::Backtrack].
///
/// To chain an error up, see [`cut_err`].
///
/// # Example
///
/// ```rust
/// # #[cfg(feature = "ascii")] {
/// # use winnow::prelude::*;
/// use winnow::combinator::opt;
/// use winnow::ascii::alpha1;
///
/// fn parser<'i>(i: &mut &'i str) -> ModalResult<Option<&'i str>> {
///   opt(alpha1).parse_next(i)
/// }
///
/// assert_eq!(parser.parse_peek("abcd;"), Ok((";", Some("abcd"))));
/// assert_eq!(parser.parse_peek("123;"), Ok(("123;", None)));
/// # }
/// ```
pub fn opt<Input: Stream, Output, Error, ParseNext>(
    mut parser: ParseNext,
) -> impl Parser<Input, Option<Output>, Error>
where
    ParseNext: Parser<Input, Output, Error>,
    Error: ParserError<Input>,
{
    trace("opt", move |input: &mut Input| {
        let start = input.checkpoint();
        match parser.parse_next(input) {
            Ok(o) => Ok(Some(o)),
            Err(e) if e.is_backtrack() => {
                input.reset(&start);
                Ok(None)
            }
            Err(e) => Err(e),
        }
    })
}

/// Calls the parser if the condition is met.
///
/// # Example
///
/// ```rust
/// # #[cfg(feature = "ascii")] {
/// # use winnow::prelude::*;
/// # use winnow::combinator::opt;
/// use winnow::combinator::cond;
/// use winnow::ascii::alpha1;
///
/// fn parser<'i>(i: &mut &'i str) -> ModalResult<Option<&'i str>> {
///   let prefix = opt("-").parse_next(i)?;
///   let condition = prefix.is_some();
///   cond(condition, alpha1).parse_next(i)
/// }
///
/// assert_eq!(parser.parse_peek("-abcd;"), Ok((";", Some("abcd"))));
/// assert_eq!(parser.parse_peek("abcd;"), Ok(("abcd;", None)));
/// assert!(parser.parse_peek("-123;").is_err());
/// assert_eq!(parser.parse_peek("123;"), Ok(("123;", None)));
/// # }
/// ```
pub fn cond<Input, Output, Error, ParseNext>(
    cond: bool,
    mut parser: ParseNext,
) -> impl Parser<Input, Option<Output>, Error>
where
    Input: Stream,
    ParseNext: Parser<Input, Output, Error>,
    Error: ParserError<Input>,
{
    trace("cond", move |input: &mut Input| {
        if cond {
            parser.parse_next(input).map(Some)
        } else {
            Ok(None)
        }
    })
}

/// Apply the parser without advancing the input.
///
/// To lookahead and only advance on success, see [`opt`].
///
/// # Example
///
/// ```rust
/// # #[cfg(feature = "ascii")] {
/// # use winnow::prelude::*;
/// use winnow::combinator::peek;
/// use winnow::ascii::alpha1;
///
/// fn parser<'i>(input: &mut &'i str) -> ModalResult<&'i str> {
///     peek(alpha1).parse_next(input)
/// }
///
/// assert_eq!(parser.parse_peek("abcd;"), Ok(("abcd;", "abcd")));
/// assert!(parser.parse_peek("123;").is_err());
/// # }
/// ```
#[doc(alias = "look_ahead")]
#[doc(alias = "rewind")]
pub fn peek<Input, Output, Error, ParseNext>(
    mut parser: ParseNext,
) -> impl Parser<Input, Output, Error>
where
    Input: Stream,
    Error: ParserError<Input>,
    ParseNext: Parser<Input, Output, Error>,
{
    trace("peek", move |input: &mut Input| {
        let start = input.checkpoint();
        let res = parser.parse_next(input);
        input.reset(&start);
        res
    })
}

/// Match the end of the [`Stream`]
///
/// Otherwise, it will error.
///
/// # Effective Signature
///
/// Assuming you are parsing a `&str` [Stream]:
/// ```rust
/// # use winnow::prelude::*;;
/// pub fn eof<'i>(input: &mut &'i str) -> ModalResult<&'i str>
/// # {
/// #     winnow::combinator::eof.parse_next(input)
/// # }
/// ```
///
/// # Example
///
/// ```rust
/// # use std::str;
/// # use winnow::combinator::eof;
/// # use winnow::prelude::*;
///
/// fn parser<'i>(input: &mut &'i str) -> ModalResult<&'i str> {
///     eof.parse_next(input)
/// }
/// assert!(parser.parse_peek("abc").is_err());
/// assert_eq!(parser.parse_peek(""), Ok(("", "")));
/// ```
#[doc(alias = "end")]
#[doc(alias = "eoi")]
pub fn eof<Input, Error>(input: &mut Input) -> Result<<Input as Stream>::Slice, Error>
where
    Input: Stream,
    Error: ParserError<Input>,
{
    trace("eof", move |input: &mut Input| {
        if input.eof_offset() == 0 {
            Ok(input.next_slice(0))
        } else {
            Err(ParserError::from_input(input))
        }
    })
    .parse_next(input)
}

/// Succeeds if the child parser returns an error.
///
/// <div class="warning">
///
/// **Note:** This does not advance the [`Stream`]
///
/// </div>
///
/// # Example
///
/// ```rust
/// # #[cfg(feature = "ascii")] {
/// # use winnow::prelude::*;
/// use winnow::combinator::not;
/// use winnow::ascii::alpha1;
///
/// fn parser<'i>(input: &mut &'i str) -> ModalResult<()> {
///     not(alpha1).parse_next(input)
/// }
///
/// assert_eq!(parser.parse_peek("123"), Ok(("123", ())));
/// assert!(parser.parse_peek("abcd").is_err());
/// # }
/// ```
pub fn not<Input, Outp
```
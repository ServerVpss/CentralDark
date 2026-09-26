# OUTRO - partial.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\stream\partial.rs
**SHA:** f7bc4f6b861bb7cc
**Timestamp:** 2026-08-28T02:37:39.109241
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- _token_start: &Self::Checkpoint,
- _err_start: &Self::Checkpoint,
- fn offset_from(&self, start: &Self) -> usize {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::error::Needed;
use crate::stream::AsBStr;
use crate::stream::AsBytes;
use crate::stream::Checkpoint;
use crate::stream::Compare;
use crate::stream::CompareResult;
use crate::stream::FindSlice;
use crate::stream::Location;
use crate::stream::Offset;
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::stream::Recover;
use crate::stream::SliceLen;
use crate::stream::Stream;
use crate::stream::StreamIsPartial;
use crate::stream::UpdateSlice;

/// Mark the input as a partial buffer for streaming input.
///
/// Complete input means that we already have all of the data. This will be the common case with
/// small files that can be read entirely to memory.
///
/// In contrast, streaming input assumes that we might not have all of the data.
/// This can happen with some network protocol or large file parsers, where the
/// input buffer can be full and need to be resized or refilled.
/// - [`ErrMode::Incomplete`][crate::error::ErrMode::Incomplete] will report how much more data is needed.
/// - [`Parser::complete_err`][crate::Parser::complete_err] transform
///   [`ErrMode::Incomplete`][crate::error::ErrMode::Incomplete] to
///   [`ErrMode::Backtrack`][crate::error::ErrMode::Backtrack]
///
/// See also [`StreamIsPartial`] to tell whether the input supports complete or partial parsing.
///
/// See also [Special Topics: Parsing Partial Input][crate::_topic::partial].
///
/// # Example
///
/// Here is how it works in practice:
///
/// ```rust
/// # use winnow::{Result, error::ErrMode, error::Needed, error::ContextError, token, ascii, stream::Partial};
/// # use winnow::prelude::*;
///
/// fn take_partial<'s>(i: &mut Partial<&'s [u8]>) -> ModalResult<&'s [u8], ContextError> {
///   token::take(4u8).parse_next(i)
/// }
///
/// fn take_complete<'s>(i: &mut &'s [u8]) -> ModalResult<&'s [u8], ContextError> {
///   token::take(4u8).parse_next(i)
/// }
///
/// // both parsers will take 4 bytes as expected
/// assert_eq!(take_partial.parse_peek(Partial::new(&b"abcde"[..])), Ok((Partial::new(&b"e"[..]), &b"abcd"[..])));
/// assert_eq!(take_complete.parse_peek(&b"abcde"[..]), Ok((&b"e"[..], &b"abcd"[..])));
///
/// // if the input is smaller than 4 bytes, the partial parser
/// // will return `Incomplete` to indicate that we need more data
/// assert_eq!(take_partial.parse_peek(Partial::new(&b"abc"[..])), Err(ErrMode::Incomplete(Needed::new(1))));
///
/// // but the complete parser will return an error
/// assert!(take_complete.parse_peek(&b"abc"[..]).is_err());
///
/// // the alpha0 function takes 0 or more alphabetic characters
/// fn alpha0_partial<'s>(i: &mut Partial<&'s str>) -> ModalResult<&'s str, ContextError> {
///   ascii::alpha0.parse_next(i)
/// }
///
/// fn alpha0_complete<'s>(i: &mut &'s str) -> ModalResult<&'s str, ContextError> {
///   ascii::alpha0.parse_next(i)
/// }
///
/// // if there's a clear limit to the taken characters, both parsers work the same way
/// assert_eq!(alpha0_partial.parse_peek(Partial::new("abcd;")), Ok((Partial::new(";"), "abcd")));
/// assert_eq!(alpha0_complete.parse_peek("abcd;"), Ok((";", "abcd")));
///
/// // but when there's no limit, the partial version returns `Incomplete`, because it cannot
/// // know if more input data should be taken. The whole input could be "abcd;", or
/// // "abcde;"
/// assert_eq!(alpha0_partial.parse_peek(Partial::new("abcd")), Err(ErrMode::Incomplete(Needed::new(1))));
///
/// // while the complete version knows that all of the data is there
/// assert_eq!(alpha0_complete.parse_peek("abcd"), Ok(("", "abcd")));
/// ```
#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Partial<I> {
    input: I,
    partial: bool,
}

impl<I> Partial<I>
where
    I: StreamIsPartial,
{
    /// Create a partial input
    #[inline]
    pub fn new(input: I) -> Self {
        debug_assert!(
            !I::is_partial_supported(),
            "`Partial` can only wrap complete sources"
        );
        let partial = true;
        Self { input, partial }
    }

    /// Extract the original [`Stream`]
    #[inline(always)]
    pub fn into_inner(self) -> I {
        self.input
    }
}

impl<I> Default for Partial<I>
where
    I: Default + StreamIsPartial,
{
    #[inline]
    fn default() -> Self {
        Self::new(I::default())
    }
}

impl<I> core::ops::Deref for Partial<I> {
    type Target = I;

    #[inline(always)]
    fn deref(&self) -> &Self::Target {
        &self.input
    }
}

impl<I: core::fmt::Display> core::fmt::Display for Partial<I> {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        self.input.fmt(f)
    }
}

impl<I> SliceLen for Partial<I>
where
    I: SliceLen,
{
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.input.slice_len()
    }
}

impl<I: Stream> Stream for Partial<I> {
    type Token = <I as Stream>::Token;
    type Slice = <I as Stream>::Slice;

    type IterOffsets = <I as Stream>::IterOffsets;

    type Checkpoint = Checkpoint<I::Checkpoint, Self>
```

---

# OUTRO - partial.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\stream\partial.rs
**SHA:** 6ef3926759aa446d
**Timestamp:** 2026-08-28T02:37:41.127022
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- _token_start: &Self::Checkpoint,
- _err_start: &Self::Checkpoint,
- fn offset_from(&self, start: &Self) -> usize {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::stream::AsBStr;
use crate::stream::AsBytes;
use crate::stream::Checkpoint;
use crate::stream::Compare;
use crate::stream::CompareResult;
use crate::stream::FindSlice;
use crate::stream::Location;
use crate::stream::Needed;
use crate::stream::Offset;
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::stream::Recover;
use crate::stream::SliceLen;
use crate::stream::Stream;
use crate::stream::StreamIsPartial;
use crate::stream::UpdateSlice;

/// Mark the input as a partial buffer for streaming input.
///
/// Complete input means that we already have all of the data. This will be the common case with
/// small files that can be read entirely to memory.
///
/// In contrast, streaming input assumes that we might not have all of the data.
/// This can happen with some network protocol or large file parsers, where the
/// input buffer can be full and need to be resized or refilled.
/// - [`ErrMode::Incomplete`][crate::error::ErrMode::Incomplete] will report how much more data is needed.
/// - [`Parser::complete_err`][crate::Parser::complete_err] transform
///   [`ErrMode::Incomplete`][crate::error::ErrMode::Incomplete] to
///   [`ErrMode::Backtrack`][crate::error::ErrMode::Backtrack]
///
/// See also [`StreamIsPartial`] to tell whether the input supports complete or partial parsing.
///
/// See also [Special Topics: Parsing Partial Input][crate::_topic::partial].
///
/// # Example
///
/// Here is how it works in practice:
///
/// ```rust
/// # #[cfg(feature = "ascii")] {
/// # use winnow::{Result, error::ErrMode, error::Needed, error::ContextError, token, ascii, stream::Partial};
/// # use winnow::prelude::*;
///
/// fn take_partial<'s>(i: &mut Partial<&'s [u8]>) -> ModalResult<&'s [u8], ContextError> {
///   token::take(4u8).parse_next(i)
/// }
///
/// fn take_complete<'s>(i: &mut &'s [u8]) -> ModalResult<&'s [u8], ContextError> {
///   token::take(4u8).parse_next(i)
/// }
///
/// // both parsers will take 4 bytes as expected
/// assert_eq!(take_partial.parse_peek(Partial::new(&b"abcde"[..])), Ok((Partial::new(&b"e"[..]), &b"abcd"[..])));
/// assert_eq!(take_complete.parse_peek(&b"abcde"[..]), Ok((&b"e"[..], &b"abcd"[..])));
///
/// // if the input is smaller than 4 bytes, the partial parser
/// // will return `Incomplete` to indicate that we need more data
/// assert_eq!(take_partial.parse_peek(Partial::new(&b"abc"[..])), Err(ErrMode::Incomplete(Needed::new(1))));
///
/// // but the complete parser will return an error
/// assert!(take_complete.parse_peek(&b"abc"[..]).is_err());
///
/// // the alpha0 function takes 0 or more alphabetic characters
/// fn alpha0_partial<'s>(i: &mut Partial<&'s str>) -> ModalResult<&'s str, ContextError> {
///   ascii::alpha0.parse_next(i)
/// }
///
/// fn alpha0_complete<'s>(i: &mut &'s str) -> ModalResult<&'s str, ContextError> {
///   ascii::alpha0.parse_next(i)
/// }
///
/// // if there's a clear limit to the taken characters, both parsers work the same way
/// assert_eq!(alpha0_partial.parse_peek(Partial::new("abcd;")), Ok((Partial::new(";"), "abcd")));
/// assert_eq!(alpha0_complete.parse_peek("abcd;"), Ok((";", "abcd")));
///
/// // but when there's no limit, the partial version returns `Incomplete`, because it cannot
/// // know if more input data should be taken. The whole input could be "abcd;", or
/// // "abcde;"
/// assert_eq!(alpha0_partial.parse_peek(Partial::new("abcd")), Err(ErrMode::Incomplete(Needed::new(1))));
///
/// // while the complete version knows that all of the data is there
/// assert_eq!(alpha0_complete.parse_peek("abcd"), Ok(("", "abcd")));
/// # }
/// ```
#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Partial<I> {
    input: I,
    partial: bool,
}

impl<I> Partial<I>
where
    I: StreamIsPartial,
{
    /// Create a partial input
    #[inline]
    pub fn new(input: I) -> Self {
        debug_assert!(
            !I::is_partial_supported(),
            "`Partial` can only wrap complete sources"
        );
        let partial = true;
        Self { input, partial }
    }

    /// Extract the original [`Stream`]
    #[inline(always)]
    pub fn into_inner(self) -> I {
        self.input
    }
}

impl<I> Default for Partial<I>
where
    I: Default + StreamIsPartial,
{
    #[inline]
    fn default() -> Self {
        Self::new(I::default())
    }
}

impl<I> core::ops::Deref for Partial<I> {
    type Target = I;

    #[inline(always)]
    fn deref(&self) -> &Self::Target {
        &self.input
    }
}

impl<I: core::fmt::Display> core::fmt::Display for Partial<I> {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        self.input.fmt(f)
    }
}

impl<I> SliceLen for Partial<I>
where
    I: SliceLen,
{
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.input.slice_len()
    }
}

impl<I: Stream> Stream for Partial<I> {
    type Token = <I as Stream>::Token;
    type Slice = <I as Stream>::Slice;

    type IterOffsets = <I as Stream>::IterOffsets;

    type C
```
# OUTRO - stateful.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\stream\stateful.rs
**SHA:** 8f54f4922132ade1
**Timestamp:** 2026-08-28T02:37:39.371329
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

/// Thread global state through your parsers
///
/// Use cases
/// - Recursion checks
/// - Error recovery
/// - Debugging
///
/// # Example
///
/// ```
/// # use std::cell::Cell;
/// # use winnow::prelude::*;
/// # use winnow::stream::Stateful;
/// # use winnow::ascii::alpha1;
/// # type Error = ();
///
/// #[derive(Debug)]
/// struct State<'s>(&'s mut u32);
///
/// impl<'s> State<'s> {
///     fn count(&mut self) {
///         *self.0 += 1;
///     }
/// }
///
/// type Stream<'is> = Stateful<&'is str, State<'is>>;
///
/// fn word<'s>(i: &mut Stream<'s>) -> ModalResult<&'s str> {
///   i.state.count();
///   alpha1.parse_next(i)
/// }
///
/// let data = "Hello";
/// let mut state = 0;
/// let input = Stream { input: data, state: State(&mut state) };
/// let output = word.parse(input).unwrap();
/// assert_eq!(state, 1);
/// ```
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
#[doc(alias = "LocatingSliceSpan")]
pub struct Stateful<I, S> {
    /// Inner input being wrapped in state
    pub input: I,
    /// User-provided state
    pub state: S,
}

impl<I, S> AsRef<I> for Stateful<I, S> {
    #[inline(always)]
    fn as_ref(&self) -> &I {
        &self.input
    }
}

impl<I, S> core::ops::Deref for Stateful<I, S> {
    type Target = I;

    #[inline(always)]
    fn deref(&self) -> &Self::Target {
        self.as_ref()
    }
}

impl<I: core::fmt::Display, S> core::fmt::Display for Stateful<I, S> {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        self.input.fmt(f)
    }
}

impl<I, S> SliceLen for Stateful<I, S>
where
    I: SliceLen,
{
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.input.slice_len()
    }
}

impl<I: Stream, S: core::fmt::Debug> Stream for Stateful<I, S> {
    type Token = <I as Stream>::Token;
    type Slice = <I as Stream>::Slice;

    type IterOffsets = <I as Stream>::IterOffsets;

    type Checkpoint = Checkpoint<I::Checkpoint, Self>;

    #[inline(always)]
    fn iter_offsets(&self) -> Self::IterOffsets {
        self.input.iter_offsets()
    }
    #[inline(always)]
    fn eof_offset(&self) -> usize {
        self.input.eof_offset()
    }

    #[inline(always)]
    fn next_token(&mut self) -> Option<Self::Token> {
        self.input.next_token()
    }

    #[inline(always)]
    fn peek_token(&self) -> Option<Self::Token> {
        self.input.peek_token()
    }

    #[inline(always)]
    fn offset_for<P>(&self, predicate: P) -> Option<usize>
    where
        P: Fn(Self::Token) -> bool,
    {
        self.input.offset_for(predicate)
    }
    #[inline(always)]
    fn offset_at(&self, tokens: usize) -> Result<usize, Needed> {
        self.input.offset_at(tokens)
    }
    #[inline(always)]
    fn next_slice(&mut self, offset: usize) -> Self::Slice {
        self.input.next_slice(offset)
    }
    #[inline(always)]
    unsafe fn next_slice_unchecked(&mut self, offset: usize) -> Self::Slice {
        // SAFETY: Passing up invariants
        unsafe { self.input.next_slice_unchecked(offset) }
    }
    #[inline(always)]
    fn peek_slice(&self, offset: usize) -> Self::Slice {
        self.input.peek_slice(offset)
    }
    #[inline(always)]
    unsafe fn peek_slice_unchecked(&self, offset: usize) -> Self::Slice {
        // SAFETY: Passing up invariants
        unsafe { self.input.peek_slice_unchecked(offset) }
    }

    #[inline(always)]
    fn checkpoint(&self) -> Self::Checkpoint {
        Checkpoint::<_, Self>::new(self.input.checkpoint())
    }
    #[inline(always)]
    fn reset(&mut self, checkpoint: &Self::Checkpoint) {
        self.input.reset(&checkpoint.inner);
    }

    #[inline(always)]
    fn raw(&self) -> &dyn core::fmt::Debug {
        #![allow(deprecated)]
        self.input.raw()
    }

    fn trace(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        self.input.trace(f)
    }
}

impl<I, S> Location for Stateful<I, S>
where
    I: Location,
{
    #[inline(always)]
    fn previous_token_end(&self) -> usize {
        self.input.previous_token_end()
    }
    #[inline(always)]
    fn current_token_start(&self) -> usize {
        self.input.current_token_start()
    }
}

#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
impl<I, E, S> Recover<E> for Stateful<I, S>
where
    I: Recover<E>,
    I: Stream,
    S: Clone + core::fmt::Debug,
{
    #[inline(always)]
    fn record_err(
        &mut self,
        _token_start: &Self::Checkpoint,
        _err_start: &Self::Checkpoint,
        err: E,
    ) -> Result<(), E> {
        Err(
```

---

# OUTRO - stateful.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\stream\stateful.rs
**SHA:** 27edda9f7f7561fe
**Timestamp:** 2026-08-28T02:37:41.166676
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

/// Thread global state through your parsers
///
/// Use cases
/// - Recursion checks
/// - Error recovery
/// - Debugging
///
/// # Example
///
/// ```
/// # #[cfg(feature = "ascii")] {
/// # use std::cell::Cell;
/// # use winnow::prelude::*;
/// # use winnow::stream::Stateful;
/// # use winnow::ascii::alpha1;
/// # type Error = ();
///
/// #[derive(Debug)]
/// struct State<'s>(&'s mut u32);
///
/// impl<'s> State<'s> {
///     fn count(&mut self) {
///         *self.0 += 1;
///     }
/// }
///
/// type Stream<'is> = Stateful<&'is str, State<'is>>;
///
/// fn word<'s>(i: &mut Stream<'s>) -> ModalResult<&'s str> {
///   i.state.count();
///   alpha1.parse_next(i)
/// }
///
/// let data = "Hello";
/// let mut state = 0;
/// let input = Stream { input: data, state: State(&mut state) };
/// let output = word.parse(input).unwrap();
/// assert_eq!(state, 1);
/// # }
/// ```
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
#[doc(alias = "LocatingSliceSpan")]
pub struct Stateful<I, S> {
    /// Inner input being wrapped in state
    pub input: I,
    /// User-provided state
    pub state: S,
}

impl<I, S> AsRef<I> for Stateful<I, S> {
    #[inline(always)]
    fn as_ref(&self) -> &I {
        &self.input
    }
}

impl<I, S> core::ops::Deref for Stateful<I, S> {
    type Target = I;

    #[inline(always)]
    fn deref(&self) -> &Self::Target {
        self.as_ref()
    }
}

impl<I: core::fmt::Display, S> core::fmt::Display for Stateful<I, S> {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        self.input.fmt(f)
    }
}

impl<I, S> SliceLen for Stateful<I, S>
where
    I: SliceLen,
{
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.input.slice_len()
    }
}

impl<I: Stream, S: core::fmt::Debug> Stream for Stateful<I, S> {
    type Token = <I as Stream>::Token;
    type Slice = <I as Stream>::Slice;

    type IterOffsets = <I as Stream>::IterOffsets;

    type Checkpoint = Checkpoint<I::Checkpoint, Self>;

    #[inline(always)]
    fn iter_offsets(&self) -> Self::IterOffsets {
        self.input.iter_offsets()
    }
    #[inline(always)]
    fn eof_offset(&self) -> usize {
        self.input.eof_offset()
    }

    #[inline(always)]
    fn next_token(&mut self) -> Option<Self::Token> {
        self.input.next_token()
    }

    #[inline(always)]
    fn peek_token(&self) -> Option<Self::Token> {
        self.input.peek_token()
    }

    #[inline(always)]
    fn offset_for<P>(&self, predicate: P) -> Option<usize>
    where
        P: Fn(Self::Token) -> bool,
    {
        self.input.offset_for(predicate)
    }
    #[inline(always)]
    fn offset_at(&self, tokens: usize) -> Result<usize, Needed> {
        self.input.offset_at(tokens)
    }
    #[inline(always)]
    fn next_slice(&mut self, offset: usize) -> Self::Slice {
        self.input.next_slice(offset)
    }
    #[inline(always)]
    unsafe fn next_slice_unchecked(&mut self, offset: usize) -> Self::Slice {
        // SAFETY: Passing up invariants
        unsafe { self.input.next_slice_unchecked(offset) }
    }
    #[inline(always)]
    fn peek_slice(&self, offset: usize) -> Self::Slice {
        self.input.peek_slice(offset)
    }
    #[inline(always)]
    unsafe fn peek_slice_unchecked(&self, offset: usize) -> Self::Slice {
        // SAFETY: Passing up invariants
        unsafe { self.input.peek_slice_unchecked(offset) }
    }

    #[inline(always)]
    fn checkpoint(&self) -> Self::Checkpoint {
        Checkpoint::<_, Self>::new(self.input.checkpoint())
    }
    #[inline(always)]
    fn reset(&mut self, checkpoint: &Self::Checkpoint) {
        self.input.reset(&checkpoint.inner);
    }

    fn trace(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        self.input.trace(f)
    }
}

impl<I, S> Location for Stateful<I, S>
where
    I: Location,
{
    #[inline(always)]
    fn previous_token_end(&self) -> usize {
        self.input.previous_token_end()
    }
    #[inline(always)]
    fn current_token_start(&self) -> usize {
        self.input.current_token_start()
    }
}

#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
impl<I, E, S> Recover<E> for Stateful<I, S>
where
    I: Recover<E>,
    I: Stream,
    S: Clone + core::fmt::Debug,
{
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
   
```
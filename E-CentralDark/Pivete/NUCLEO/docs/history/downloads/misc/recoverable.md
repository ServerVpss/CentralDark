# OUTRO - recoverable.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\stream\recoverable.rs
**SHA:** ae17eafbb54e8a8e
**Timestamp:** 2026-08-28T02:37:39.490894
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- token_start: &Self::Checkpoint,
- err_start: &Self::Checkpoint,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::error::FromRecoverableError;
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

/// Allow recovering from parse errors, capturing them as the parser continues
///
/// Generally, this will be used indirectly via
/// [`RecoverableParser::recoverable_parse`][crate::RecoverableParser::recoverable_parse].
#[derive(Clone, Debug)]
pub struct Recoverable<I, E>
where
    I: Stream,
{
    input: I,
    errors: Vec<E>,
    is_recoverable: bool,
}

impl<I, E> Default for Recoverable<I, E>
where
    I: Default + Stream,
{
    #[inline]
    fn default() -> Self {
        Self::new(I::default())
    }
}

impl<I, E> Recoverable<I, E>
where
    I: Stream,
{
    /// Track recoverable errors with the stream
    #[inline]
    pub fn new(input: I) -> Self {
        Self {
            input,
            errors: Default::default(),
            is_recoverable: true,
        }
    }

    /// Act as a normal stream
    #[inline]
    pub fn unrecoverable(input: I) -> Self {
        Self {
            input,
            errors: Default::default(),
            is_recoverable: false,
        }
    }

    /// Access the current input and errors
    #[inline]
    pub fn into_parts(self) -> (I, Vec<E>) {
        (self.input, self.errors)
    }
}

impl<I, E> AsRef<I> for Recoverable<I, E>
where
    I: Stream,
{
    #[inline(always)]
    fn as_ref(&self) -> &I {
        &self.input
    }
}

impl<I, E> core::ops::Deref for Recoverable<I, E>
where
    I: Stream,
{
    type Target = I;

    #[inline(always)]
    fn deref(&self) -> &Self::Target {
        &self.input
    }
}

impl<I: core::fmt::Display, E> core::fmt::Display for Recoverable<I, E>
where
    I: Stream,
{
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        core::fmt::Display::fmt(&self.input, f)
    }
}

impl<I, E> SliceLen for Recoverable<I, E>
where
    I: SliceLen,
    I: Stream,
{
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.input.slice_len()
    }
}

impl<I, E: core::fmt::Debug> Stream for Recoverable<I, E>
where
    I: Stream,
{
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
        &self.input
    }
}

impl<I, E> Location for Recoverable<I, E>
where
    I: Location,
    I: Stream,
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

impl<I, E, R> Recover<E> for Recoverable<I, R>
where
    I: Stream,
    R: FromRecoverableError<Self, E>,
    R: core::fmt::Debug,
    E: crate::error::ParserError<Self>,
{
    fn record_err(
        &mut self,
        token_start: &Self::Checkpoint,
```

---

# OUTRO - recoverable.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\stream\recoverable.rs
**SHA:** 672e8e7e82507d2c
**Timestamp:** 2026-08-28T02:37:41.176726
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- token_start: &Self::Checkpoint,
- err_start: &Self::Checkpoint,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::error::FromRecoverableError;
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

/// Allow recovering from parse errors, capturing them as the parser continues
///
/// Generally, this will be used indirectly via
/// [`RecoverableParser::recoverable_parse`][crate::RecoverableParser::recoverable_parse].
#[derive(Clone, Debug)]
pub struct Recoverable<I, E>
where
    I: Stream,
{
    input: I,
    errors: Vec<E>,
    is_recoverable: bool,
}

impl<I, E> Default for Recoverable<I, E>
where
    I: Default + Stream,
{
    #[inline]
    fn default() -> Self {
        Self::new(I::default())
    }
}

impl<I, E> Recoverable<I, E>
where
    I: Stream,
{
    /// Track recoverable errors with the stream
    #[inline]
    pub fn new(input: I) -> Self {
        Self {
            input,
            errors: Default::default(),
            is_recoverable: true,
        }
    }

    /// Act as a normal stream
    #[inline]
    pub fn unrecoverable(input: I) -> Self {
        Self {
            input,
            errors: Default::default(),
            is_recoverable: false,
        }
    }

    /// Access the current input and errors
    #[inline]
    pub fn into_parts(self) -> (I, Vec<E>) {
        (self.input, self.errors)
    }
}

impl<I, E> AsRef<I> for Recoverable<I, E>
where
    I: Stream,
{
    #[inline(always)]
    fn as_ref(&self) -> &I {
        &self.input
    }
}

impl<I, E> core::ops::Deref for Recoverable<I, E>
where
    I: Stream,
{
    type Target = I;

    #[inline(always)]
    fn deref(&self) -> &Self::Target {
        &self.input
    }
}

impl<I: core::fmt::Display, E> core::fmt::Display for Recoverable<I, E>
where
    I: Stream,
{
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        core::fmt::Display::fmt(&self.input, f)
    }
}

impl<I, E> SliceLen for Recoverable<I, E>
where
    I: SliceLen,
    I: Stream,
{
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.input.slice_len()
    }
}

impl<I, E: core::fmt::Debug> Stream for Recoverable<I, E>
where
    I: Stream,
{
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

impl<I, E> Location for Recoverable<I, E>
where
    I: Location,
    I: Stream,
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

impl<I, E, R> Recover<E> for Recoverable<I, R>
where
    I: Stream,
    R: FromRecoverableError<Self, E>,
    R: core::fmt::Debug,
    E: crate::error::ParserError<Self>,
{
    fn record_err(
        &mut self,
        token_start: 
```
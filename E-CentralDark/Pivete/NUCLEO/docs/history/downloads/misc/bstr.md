# OUTRO - bstr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\stream\bstr.rs
**SHA:** 2c3ba6eb3704fcf1
**Timestamp:** 2026-08-28T02:37:39.045540
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
use crate::stream::AsBStr;
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

/// Improved `Debug` experience for `&[u8]` UTF-8-ish streams
#[allow(clippy::derived_hash_with_manual_eq)]
#[derive(Hash)]
#[repr(transparent)]
pub struct BStr([u8]);

impl BStr {
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

impl SliceLen for &BStr {
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.len()
    }
}

impl<'i> Stream for &'i BStr {
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
        *self = BStr::from_bytes(next);
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
        *self = BStr::from_bytes(next);
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
impl<E> Recover<E> for &BStr {
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

impl StreamIsPartial for &BStr {
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

impl Offset for &BStr {
    #[inline(always)]
    fn offset_from(&self, start: &Self) -> usize {
        self.as_bytes().offset_from(&start.as_bytes())
    }
}

impl<'a> Offset<<&'a BStr as Stream>::Checkpoint> for &'a BStr {
    #[inline(always)]
    fn offset_from(&self, o
```

---

# OUTRO - bstr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\stream\bstr.rs
**SHA:** 04e4311a25fe6708
**Timestamp:** 2026-08-28T02:37:41.149401
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- _token_start: &Self::Checkpoint,
- _err_start: &Self::Checkpoint,
- fn offset_from(&self, start: &Self) -> usize {

### Ouro Bruto (primeiros 5000 chars)
```
use core::num::NonZeroUsize;

use crate::stream::AsBStr;
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

/// Improved `Debug` experience for `&[u8]` UTF-8-ish streams
#[allow(clippy::derived_hash_with_manual_eq)]
#[derive(Hash)]
#[repr(transparent)]
pub struct BStr([u8]);

impl BStr {
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

impl SliceLen for &BStr {
    #[inline(always)]
    fn slice_len(&self) -> usize {
        self.len()
    }
}

impl<'i> Stream for &'i BStr {
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
        *self = BStr::from_bytes(next);
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
        *self = BStr::from_bytes(next);
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
impl<E> Recover<E> for &BStr {
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

impl StreamIsPartial for &BStr {
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

impl Offset for &BStr {
    #[inline(always)]
    fn offset_from(&self, start: &Self) -> usize {
        self.as_bytes().offset_from(&start.as_bytes())
    }
}

impl<'a> Offset<<&'a BStr as Stream>::Checkpoint> for &'a BStr {
    #[inline(always)
```
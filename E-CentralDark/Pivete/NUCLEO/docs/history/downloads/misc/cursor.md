# OUTRO - cursor.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-0.11.6\src\map2d\cursor.rs
**SHA:** 2d7b67948eb5bb03
**Timestamp:** 2026-08-28T02:37:45.782746
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = if self.key0_index == 0 {
- let start = range.start;
- let start = range.start;

### Contratos
- // Invariant: these fields have the same invariants as they do in ZeroMap2d
- // Invariant: key0_index is in range

### Principios
- // Invariant: these fields have the same invariants as they do in ZeroMap2d
- // Invariant: key0_index is in range

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use crate::{ZeroMap2d, ZeroSlice};

use core::cmp::Ordering;
use core::fmt;
use core::ops::Range;

use crate::map::ZeroMapKV;
use crate::map::ZeroVecLike;

use super::ZeroMap2dBorrowed;

/// An intermediate state of queries over [`ZeroMap2d`] and [`ZeroMap2dBorrowed`].
pub struct ZeroMap2dCursor<'l, 'a, K0, K1, V>
where
    K0: ZeroMapKV<'a>,
    K1: ZeroMapKV<'a>,
    V: ZeroMapKV<'a>,
    K0: ?Sized,
    K1: ?Sized,
    V: ?Sized,
{
    // Invariant: these fields have the same invariants as they do in ZeroMap2d
    keys0: &'l K0::Slice,
    joiner: &'l ZeroSlice<u32>,
    keys1: &'l K1::Slice,
    values: &'l V::Slice,
    // Invariant: key0_index is in range
    key0_index: usize,
}

impl<'a, K0, K1, V> ZeroMap2dCursor<'a, 'a, K0, K1, V>
where
    K0: ZeroMapKV<'a>,
    K1: ZeroMapKV<'a>,
    V: ZeroMapKV<'a>,
    K0: ?Sized,
    K1: ?Sized,
    V: ?Sized,
{
    /// `key0_index` must be in range
    pub(crate) fn from_borrowed(
        borrowed: &ZeroMap2dBorrowed<'a, K0, K1, V>,
        key0_index: usize,
    ) -> Self {
        debug_assert!(key0_index < borrowed.joiner.len());
        ZeroMap2dCursor {
            keys0: borrowed.keys0,
            joiner: borrowed.joiner,
            keys1: borrowed.keys1,
            values: borrowed.values,
            key0_index,
        }
    }
}

impl<'l, 'a, K0, K1, V> ZeroMap2dCursor<'l, 'a, K0, K1, V>
where
    K0: ZeroMapKV<'a>,
    K1: ZeroMapKV<'a>,
    V: ZeroMapKV<'a>,
    K0: ?Sized,
    K1: ?Sized,
    V: ?Sized,
{
    /// `key0_index` must be in range
    pub(crate) fn from_cow(cow: &'l ZeroMap2d<'a, K0, K1, V>, key0_index: usize) -> Self {
        debug_assert!(key0_index < cow.joiner.len());
        Self {
            keys0: cow.keys0.zvl_as_borrowed(),
            joiner: &cow.joiner,
            keys1: cow.keys1.zvl_as_borrowed(),
            values: cow.values.zvl_as_borrowed(),
            key0_index,
        }
    }

    /// Returns the key0 corresponding to the cursor position.
    ///
    /// ```rust
    /// use zerovec::ZeroMap2d;
    ///
    /// let mut map = ZeroMap2d::new();
    /// map.insert("one", &1u32, "foo");
    /// assert_eq!(map.get0("one").unwrap().key0(), "one");
    /// ```
    pub fn key0(&self) -> &'l K0::GetType {
        #[expect(clippy::unwrap_used)] // safe by invariant on `self.key0_index`
        self.keys0.zvl_get(self.key0_index).unwrap()
    }

    /// Borrow an ordered iterator over keys1 and values for a particular key0.
    ///
    /// To get the values as copy types, see [`Self::iter1_copied`].
    ///
    /// For an example, see [`ZeroMap2d::iter0()`].
    pub fn iter1(
        &self,
    ) -> impl DoubleEndedIterator<
        Item = (
            &'l <K1 as ZeroMapKV<'a>>::GetType,
            &'l <V as ZeroMapKV<'a>>::GetType,
        ),
    > + ExactSizeIterator
           + '_ {
        let range = self.get_range();
        #[expect(clippy::unwrap_used)] // `self.get_range()` returns a valid range
        range.map(move |idx| {
            (
                self.keys1.zvl_get(idx).unwrap(),
                self.values.zvl_get(idx).unwrap(),
            )
        })
    }

    /// Transform this cursor into an ordered iterator over keys1 for a particular key0.
    pub fn into_iter1(
        self,
    ) -> impl DoubleEndedIterator<
        Item = (
            &'l <K1 as ZeroMapKV<'a>>::GetType,
            &'l <V as ZeroMapKV<'a>>::GetType,
        ),
    > + ExactSizeIterator {
        let range = self.get_range();
        #[expect(clippy::unwrap_used)] // `self.get_range()` returns a valid range
        range.map(move |idx| {
            (
                self.keys1.zvl_get(idx).unwrap(),
                self.values.zvl_get(idx).unwrap(),
            )
        })
    }

    /// Given `key0_index`, returns the corresponding range of keys1, which will be valid
    pub(super) fn get_range(&self) -> Range<usize> {
        debug_assert!(self.key0_index < self.joiner.len());
        let start = if self.key0_index == 0 {
            0
        } else {
            #[expect(clippy::unwrap_used)] // protected by the debug_assert above
            self.joiner.get(self.key0_index - 1).unwrap()
        };
        #[expect(clippy::unwrap_used)] // protected by the debug_assert above
        let limit = self.joiner.get(self.key0_index).unwrap();
        // These two assertions are true based on the invariants of ZeroMap2d
        debug_assert!(start < limit);
        debug_assert!((limit as usize) <= self.values.zvl_len());
        (start as usize)..(limit as usize)
    }
}

impl<'l, 'a, K0, K1, V> ZeroMap2dCursor<'l, 'a, K0, K1, V>
where
    K0: ZeroMapKV<'a>,
    K1: ZeroMapKV<'a>,
    V: ZeroMapKV<'a>,
    K0: ?Sized,
    K1: ?Sized,
    V: Copy,
{
    /// Borrow an ordered iterator over keys1 and values for a particul
```
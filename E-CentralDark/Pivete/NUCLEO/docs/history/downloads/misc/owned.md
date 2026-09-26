# OUTRO - owned.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-0.11.6\src\varzerovec\owned.rs
**SHA:** 647c821646083d54
**Timestamp:** 2026-08-28T02:37:46.295793
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.element_position_unchecked(idx);
- let indices_start = slice_range.start.add(F::Len::SIZE);
- let data_start = indices_start.add((len - 1) * F::Index::SIZE);
- let index_start = indices_start.add(F::Index::SIZE * index_minus_one);

### Contratos
- // safety invariant: must parse into a valid VarZeroVecComponents

### Principios
- // safety invariant: must parse into a valid VarZeroVecComponents

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

// The mutation operations in this file should panic to prevent undefined behavior
#![allow(clippy::unwrap_used)]
#![allow(clippy::expect_used)]
#![allow(clippy::indexing_slicing)]
#![allow(clippy::panic)]

use super::*;
use crate::ule::*;
use alloc::vec::Vec;
use core::any;
use core::convert::TryInto;
use core::marker::PhantomData;
use core::ops::Deref;
use core::ops::Range;
use core::{fmt, ptr, slice};

use super::components::IntegerULE;

/// A fully-owned [`VarZeroVec`]. This type has no lifetime but has the same
/// internal buffer representation of [`VarZeroVec`], making it cheaply convertible to
/// [`VarZeroVec`] and [`VarZeroSlice`].
///
/// The `F` type parameter is a [`VarZeroVecFormat`] (see its docs for more details), which can be used to select the
/// precise format of the backing buffer with various size and performance tradeoffs. It defaults to [`Index16`].
///
/// ✨ *Enabled with the `alloc` Cargo feature.*
pub struct VarZeroVecOwned<T: ?Sized, F = Index16> {
    marker1: PhantomData<T>,
    marker2: PhantomData<F>,
    // safety invariant: must parse into a valid VarZeroVecComponents
    entire_slice: Vec<u8>,
}

impl<T: ?Sized, F> Clone for VarZeroVecOwned<T, F> {
    fn clone(&self) -> Self {
        VarZeroVecOwned {
            marker1: PhantomData,
            marker2: PhantomData,
            entire_slice: self.entire_slice.clone(),
        }
    }
}

// The effect of a shift on the indices in the varzerovec.
#[derive(PartialEq)]
enum ShiftType {
    Insert,
    Replace,
    Remove,
}

impl<T: VarULE + ?Sized, F: VarZeroVecFormat> Deref for VarZeroVecOwned<T, F> {
    type Target = VarZeroSlice<T, F>;
    fn deref(&self) -> &VarZeroSlice<T, F> {
        self.as_slice()
    }
}

impl<T: VarULE + ?Sized, F> VarZeroVecOwned<T, F> {
    /// Construct an empty [`VarZeroVecOwned`]
    pub fn new() -> Self {
        Self {
            marker1: PhantomData,
            marker2: PhantomData,
            entire_slice: Vec::new(),
        }
    }
}

impl<T: VarULE + ?Sized, F: VarZeroVecFormat> VarZeroVecOwned<T, F> {
    /// Construct a [`VarZeroVecOwned`] from a [`VarZeroSlice`] by cloning the internal data
    pub fn from_slice(slice: &VarZeroSlice<T, F>) -> Self {
        Self {
            marker1: PhantomData,
            marker2: PhantomData,
            entire_slice: slice.as_bytes().into(),
        }
    }

    /// Construct a [`VarZeroVecOwned`] from a list of elements
    pub fn try_from_elements<A>(elements: &[A]) -> Result<Self, &'static str>
    where
        A: EncodeAsVarULE<T>,
    {
        Ok(if elements.is_empty() {
            Self::from_slice(VarZeroSlice::new_empty())
        } else {
            Self {
                marker1: PhantomData,
                marker2: PhantomData,
                // TODO(#1410): Rethink length errors in VZV.
                entire_slice: components::get_serializable_bytes_non_empty::<T, A, F>(elements)
                    .ok_or(F::Index::TOO_LARGE_ERROR)?,
            }
        })
    }

    /// Obtain this `VarZeroVec` as a [`VarZeroSlice`]
    pub fn as_slice(&self) -> &VarZeroSlice<T, F> {
        let slice: &[u8] = &self.entire_slice;
        unsafe {
            // safety: the slice is known to come from a valid parsed VZV
            VarZeroSlice::from_bytes_unchecked(slice)
        }
    }

    /// Try to allocate a buffer with enough capacity for `capacity`
    /// elements. Since `T` can take up an arbitrary size this will
    /// just allocate enough space for 4-byte Ts
    pub(crate) fn with_capacity(capacity: usize) -> Self {
        Self {
            marker1: PhantomData,
            marker2: PhantomData,
            entire_slice: Vec::with_capacity(capacity * (F::Index::SIZE + 4)),
        }
    }

    /// Try to reserve space for `capacity`
    /// elements. Since `T` can take up an arbitrary size this will
    /// just allocate enough space for 4-byte Ts
    pub(crate) fn reserve(&mut self, capacity: usize) {
        self.entire_slice.reserve(capacity * (F::Index::SIZE + 4))
    }

    /// Get the position of a specific element in the data segment.
    ///
    /// If `idx == self.len()`, it will return the size of the data segment (where a new element would go).
    ///
    /// ## Safety
    /// `idx <= self.len()` and `self.as_encoded_bytes()` is well-formed.
    unsafe fn element_position_unchecked(&self, idx: usize) -> usize {
        let len = self.len();
        let out = if idx == len {
            self.entire_slice.len() - F::Len::SIZE - (F::Index::SIZE * (len - 1))
        } else if let Some(idx) = self.index_data(idx) {
            idx.iule_to_usize()
        } else {
            0
        };
        debug_assert!(out + F::Len::SIZE + (len - 1) * F::Index::SIZE <= self.entire_slice.len());
        out
    }

    ///
```
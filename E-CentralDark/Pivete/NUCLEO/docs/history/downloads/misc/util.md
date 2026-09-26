# OUTRO - util.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\getrandom-0.3.4\src\util.rs
**SHA:** 207e21353f4e402d
**Timestamp:** 2026-08-28T02:34:10.169930
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: MSRV(1.76.0): Replace with `core::ptr::from_mut`.
- // TODO: MSRV(1.76.0): Replace with `core::ptr::from_ref`.

### Ouro Bruto (primeiros 5000 chars)
```
#![allow(dead_code)]
use crate::Error;
use core::{mem::MaybeUninit, ptr, slice};

/// Polyfill for `maybe_uninit_slice` feature's
/// `MaybeUninit::slice_assume_init_mut`. Every element of `slice` must have
/// been initialized.
#[inline(always)]
#[allow(unused_unsafe)] // TODO(MSRV 1.65): Remove this.
pub unsafe fn slice_assume_init_mut<T>(slice: &mut [MaybeUninit<T>]) -> &mut [T] {
    let ptr = ptr_from_mut::<[MaybeUninit<T>]>(slice) as *mut [T];
    // SAFETY: `MaybeUninit<T>` is guaranteed to be layout-compatible with `T`.
    unsafe { &mut *ptr }
}

#[inline]
pub fn uninit_slice_fill_zero(slice: &mut [MaybeUninit<u8>]) -> &mut [u8] {
    unsafe { ptr::write_bytes(slice.as_mut_ptr(), 0, slice.len()) };
    unsafe { slice_assume_init_mut(slice) }
}

#[inline(always)]
pub fn slice_as_uninit<T>(slice: &[T]) -> &[MaybeUninit<T>] {
    let ptr = ptr_from_ref::<[T]>(slice) as *const [MaybeUninit<T>];
    // SAFETY: `MaybeUninit<T>` is guaranteed to be layout-compatible with `T`.
    unsafe { &*ptr }
}

/// View an mutable initialized array as potentially-uninitialized.
///
/// This is unsafe because it allows assigning uninitialized values into
/// `slice`, which would be undefined behavior.
#[inline(always)]
#[allow(unused_unsafe)] // TODO(MSRV 1.65): Remove this.
pub unsafe fn slice_as_uninit_mut<T>(slice: &mut [T]) -> &mut [MaybeUninit<T>] {
    let ptr = ptr_from_mut::<[T]>(slice) as *mut [MaybeUninit<T>];
    // SAFETY: `MaybeUninit<T>` is guaranteed to be layout-compatible with `T`.
    unsafe { &mut *ptr }
}

// TODO: MSRV(1.76.0): Replace with `core::ptr::from_mut`.
fn ptr_from_mut<T: ?Sized>(r: &mut T) -> *mut T {
    r
}

// TODO: MSRV(1.76.0): Replace with `core::ptr::from_ref`.
fn ptr_from_ref<T: ?Sized>(r: &T) -> *const T {
    r
}

/// Default implementation of `inner_u32` on top of `fill_uninit`
#[inline]
pub fn inner_u32() -> Result<u32, Error> {
    let mut res = MaybeUninit::<u32>::uninit();
    // SAFETY: the created slice has the same size as `res`
    let dst = unsafe {
        let p: *mut MaybeUninit<u8> = res.as_mut_ptr().cast();
        slice::from_raw_parts_mut(p, core::mem::size_of::<u32>())
    };
    crate::fill_uninit(dst)?;
    // SAFETY: `dst` has been fully initialized by `imp::fill_inner`
    // since it returned `Ok`.
    Ok(unsafe { res.assume_init() })
}

/// Default implementation of `inner_u64` on top of `fill_uninit`
#[inline]
pub fn inner_u64() -> Result<u64, Error> {
    let mut res = MaybeUninit::<u64>::uninit();
    // SAFETY: the created slice has the same size as `res`
    let dst = unsafe {
        let p: *mut MaybeUninit<u8> = res.as_mut_ptr().cast();
        slice::from_raw_parts_mut(p, core::mem::size_of::<u64>())
    };
    crate::fill_uninit(dst)?;
    // SAFETY: `dst` has been fully initialized by `imp::fill_inner`
    // since it returned `Ok`.
    Ok(unsafe { res.assume_init() })
}

/// Truncates `u64` and returns the lower 32 bits as `u32`
pub(crate) fn truncate(val: u64) -> u32 {
    u32::try_from(val & u64::from(u32::MAX)).expect("The higher 32 bits are masked")
}

```

---

# OUTRO - util.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\indexmap-1.9.3\src\util.rs
**SHA:** ab712bce71b54cf2
**Timestamp:** 2026-08-28T02:34:30.040711
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = match range.start_bound() {

### Ouro Bruto (primeiros 5000 chars)
```
use core::ops::{Bound, Range, RangeBounds};

pub(crate) fn third<A, B, C>(t: (A, B, C)) -> C {
    t.2
}

pub(crate) fn simplify_range<R>(range: R, len: usize) -> Range<usize>
where
    R: RangeBounds<usize>,
{
    let start = match range.start_bound() {
        Bound::Unbounded => 0,
        Bound::Included(&i) if i <= len => i,
        Bound::Excluded(&i) if i < len => i + 1,
        bound => panic!("range start {:?} should be <= length {}", bound, len),
    };
    let end = match range.end_bound() {
        Bound::Unbounded => len,
        Bound::Excluded(&i) if i <= len => i,
        Bound::Included(&i) if i < len => i + 1,
        bound => panic!("range end {:?} should be <= length {}", bound, len),
    };
    if start > end {
        panic!(
            "range start {:?} should be <= range end {:?}",
            range.start_bound(),
            range.end_bound()
        );
    }
    start..end
}

```

---

# OUTRO - util.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\indexmap-2.14.0\src\util.rs
**SHA:** a0e512cf0bc5ccde
**Timestamp:** 2026-08-28T02:34:30.284174
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = match range.start_bound() {
- let start = match range.start_bound() {

### Ouro Bruto (primeiros 5000 chars)
```
use core::ops::{Bound, Range, RangeBounds};

pub(crate) fn third<A, B, C>(t: (A, B, C)) -> C {
    t.2
}

#[track_caller]
pub(crate) fn simplify_range<R>(range: R, len: usize) -> Range<usize>
where
    R: RangeBounds<usize>,
{
    let start = match range.start_bound() {
        Bound::Unbounded => 0,
        Bound::Included(&i) if i <= len => i,
        Bound::Excluded(&i) if i < len => i + 1,
        Bound::Included(i) | Bound::Excluded(i) => {
            panic!("range start index {i} out of range for slice of length {len}")
        }
    };
    let end = match range.end_bound() {
        Bound::Unbounded => len,
        Bound::Excluded(&i) if i <= len => i,
        Bound::Included(&i) if i < len => i + 1,
        Bound::Included(i) | Bound::Excluded(i) => {
            panic!("range end index {i} out of range for slice of length {len}")
        }
    };
    if start > end {
        panic!(
            "range start index {:?} should be <= range end index {:?}",
            range.start_bound(),
            range.end_bound()
        );
    }
    start..end
}

pub(crate) fn try_simplify_range<R>(range: R, len: usize) -> Option<Range<usize>>
where
    R: RangeBounds<usize>,
{
    let start = match range.start_bound() {
        Bound::Unbounded => 0,
        Bound::Included(&i) if i <= len => i,
        Bound::Excluded(&i) if i < len => i + 1,
        _ => return None,
    };
    let end = match range.end_bound() {
        Bound::Unbounded => len,
        Bound::Excluded(&i) if i <= len => i,
        Bound::Included(&i) if i < len => i + 1,
        _ => return None,
    };
    if start > end {
        return None;
    }
    Some(start..end)
}

// Generic slice equality -- copied from the standard library but adding a custom comparator,
// allowing for our `Bucket` wrapper on either or both sides.
pub(crate) fn slice_eq<T, U>(left: &[T], right: &[U], eq: impl Fn(&T, &U) -> bool) -> bool {
    if left.len() != right.len() {
        return false;
    }

    // Implemented as explicit indexing rather
    // than zipped iterators for performance reasons.
    // See PR https://github.com/rust-lang/rust/pull/116846
    for i in 0..left.len() {
        // bound checks are optimized away
        if !eq(&left[i], &right[i]) {
            return false;
        }
    }

    true
}

```

---

# OUTRO - util.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\muda-0.19.3\src\util.rs
**SHA:** e46d06c6e67fb073
**Timestamp:** 2026-08-28T02:34:51.696759
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const fn new_with_start(start: u32) -> Self {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2022-2022 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::sync::atomic::{AtomicU32, Ordering};

#[derive(Clone, Copy, Debug)]
pub enum AddOp {
    Append,
    Insert(usize),
}

pub struct Counter(AtomicU32);

impl Counter {
    #[allow(unused)]
    pub const fn new() -> Self {
        Self(AtomicU32::new(1))
    }

    #[allow(unused)]
    pub const fn new_with_start(start: u32) -> Self {
        Self(AtomicU32::new(start))
    }

    pub fn next(&self) -> u32 {
        self.0.fetch_add(1, Ordering::Relaxed)
    }
}

```

---

# OUTRO - util.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tendril-0.5.1\src\util.rs
**SHA:** 38017960bdf34632
**Timestamp:** 2026-08-28T02:36:01.702838
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub unsafe fn unsafe_slice(buf: &[u8], start: usize, new_len: usize) -> &[u8] {
- pub unsafe fn unsafe_slice_mut(buf: &mut [u8], start: usize, new_len: usize) -> &mut [u8] {

### Ouro Bruto (primeiros 5000 chars)
```
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// https://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or https://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use std::mem;
use std::{ptr, slice};

#[inline(always)]
pub unsafe fn unsafe_slice(buf: &[u8], start: usize, new_len: usize) -> &[u8] {
    debug_assert!(start <= buf.len());
    debug_assert!(new_len <= (buf.len() - start));
    slice::from_raw_parts(buf.as_ptr().add(start), new_len)
}

#[inline(always)]
pub unsafe fn unsafe_slice_mut(buf: &mut [u8], start: usize, new_len: usize) -> &mut [u8] {
    debug_assert!(start <= buf.len());
    debug_assert!(new_len <= (buf.len() - start));
    slice::from_raw_parts_mut(buf.as_mut_ptr().add(start), new_len)
}

#[inline(always)]
pub unsafe fn copy_and_advance(dest: &mut *mut u8, src: &[u8]) {
    ptr::copy_nonoverlapping(src.as_ptr(), *dest, src.len());
    *dest = dest.add(src.len())
}

#[inline(always)]
pub unsafe fn copy_lifetime_mut<'a, S: ?Sized, T: ?Sized + 'a>(
    _ptr: &'a mut S,
    ptr: &mut T,
) -> &'a mut T {
    mem::transmute(ptr)
}

#[inline(always)]
pub unsafe fn copy_lifetime<'a, S: ?Sized, T: ?Sized + 'a>(_ptr: &'a S, ptr: &T) -> &'a T {
    mem::transmute(ptr)
}

```
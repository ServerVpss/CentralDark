# OUTRO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\aarch64\memchr.rs
**SHA:** 5bb70f915084e629
**Timestamp:** 2026-08-28T02:34:48.190089
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ($ty:ident, $find:ident, $start:ident, $end:ident, $($needles:ident),+) => {{
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Wrapper routines for `memchr` and friends.

These routines choose the best implementation at compile time. (This is
different from `x86_64` because it is expected that `neon` is almost always
available for `aarch64` targets.)
*/

macro_rules! defraw {
    ($ty:ident, $find:ident, $start:ident, $end:ident, $($needles:ident),+) => {{
        #[cfg(target_feature = "neon")]
        {
            use crate::arch::aarch64::neon::memchr::$ty;

            debug!("chose neon for {}", stringify!($ty));
            debug_assert!($ty::is_available());
            // SAFETY: We know that wasm memchr is always available whenever
            // code is compiled for `aarch64` with the `neon` target feature
            // enabled.
            $ty::new_unchecked($($needles),+).$find($start, $end)
        }
        #[cfg(not(target_feature = "neon"))]
        {
            use crate::arch::all::memchr::$ty;

            debug!(
                "no neon feature available, using fallback for {}",
                stringify!($ty),
            );
            $ty::new($($needles),+).$find($start, $end)
        }
    }}
}

/// memchr, but using raw pointers to represent the haystack.
///
/// # Safety
///
/// Pointers must be valid. See `One::find_raw`.
#[inline(always)]
pub(crate) unsafe fn memchr_raw(
    n1: u8,
    start: *const u8,
    end: *const u8,
) -> Option<*const u8> {
    defraw!(One, find_raw, start, end, n1)
}

/// memrchr, but using raw pointers to represent the haystack.
///
/// # Safety
///
/// Pointers must be valid. See `One::rfind_raw`.
#[inline(always)]
pub(crate) unsafe fn memrchr_raw(
    n1: u8,
    start: *const u8,
    end: *const u8,
) -> Option<*const u8> {
    defraw!(One, rfind_raw, start, end, n1)
}

/// memchr2, but using raw pointers to represent the haystack.
///
/// # Safety
///
/// Pointers must be valid. See `Two::find_raw`.
#[inline(always)]
pub(crate) unsafe fn memchr2_raw(
    n1: u8,
    n2: u8,
    start: *const u8,
    end: *const u8,
) -> Option<*const u8> {
    defraw!(Two, find_raw, start, end, n1, n2)
}

/// memrchr2, but using raw pointers to represent the haystack.
///
/// # Safety
///
/// Pointers must be valid. See `Two::rfind_raw`.
#[inline(always)]
pub(crate) unsafe fn memrchr2_raw(
    n1: u8,
    n2: u8,
    start: *const u8,
    end: *const u8,
) -> Option<*const u8> {
    defraw!(Two, rfind_raw, start, end, n1, n2)
}

/// memchr3, but using raw pointers to represent the haystack.
///
/// # Safety
///
/// Pointers must be valid. See `Three::find_raw`.
#[inline(always)]
pub(crate) unsafe fn memchr3_raw(
    n1: u8,
    n2: u8,
    n3: u8,
    start: *const u8,
    end: *const u8,
) -> Option<*const u8> {
    defraw!(Three, find_raw, start, end, n1, n2, n3)
}

/// memrchr3, but using raw pointers to represent the haystack.
///
/// # Safety
///
/// Pointers must be valid. See `Three::rfind_raw`.
#[inline(always)]
pub(crate) unsafe fn memrchr3_raw(
    n1: u8,
    n2: u8,
    n3: u8,
    start: *const u8,
    end: *const u8,
) -> Option<*const u8> {
    defraw!(Three, rfind_raw, start, end, n1, n2, n3)
}

/// Count all matching bytes, but using raw pointers to represent the haystack.
///
/// # Safety
///
/// Pointers must be valid. See `One::count_raw`.
#[inline(always)]
pub(crate) unsafe fn count_raw(
    n1: u8,
    start: *const u8,
    end: *const u8,
) -> usize {
    defraw!(One, count_raw, start, end, n1)
}

```

---

# OUTRO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\aarch64\neon\memchr.rs
**SHA:** e8c00b8fb2c7e271
**Timestamp:** 2026-08-28T02:34:48.253864
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = haystack.as_ptr();
- start: *const u8,
- start: *const u8,
- pub unsafe fn count_raw(&self, start: *const u8, end: *const u8) -> usize {
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
This module defines 128-bit vector implementations of `memchr` and friends.

The main types in this module are [`One`], [`Two`] and [`Three`]. They are for
searching for one, two or three distinct bytes, respectively, in a haystack.
Each type also has corresponding double ended iterators. These searchers are
typically much faster than scalar routines accomplishing the same task.

The `One` searcher also provides a [`One::count`] routine for efficiently
counting the number of times a single byte occurs in a haystack. This is
useful, for example, for counting the number of lines in a haystack. This
routine exists because it is usually faster, especially with a high match
count, then using [`One::find`] repeatedly. ([`OneIter`] specializes its
`Iterator::count` implementation to use this routine.)

Only one, two and three bytes are supported because three bytes is about
the point where one sees diminishing returns. Beyond this point and it's
probably (but not necessarily) better to just use a simple `[bool; 256]` array
or similar. However, it depends mightily on the specific work-load and the
expected match frequency.
*/

use core::arch::aarch64::uint8x16_t;

use crate::{arch::generic::memchr as generic, ext::Pointer, vector::Vector};

/// Finds all occurrences of a single byte in a haystack.
#[derive(Clone, Copy, Debug)]
pub struct One(generic::One<uint8x16_t>);

impl One {
    /// Create a new searcher that finds occurrences of the needle byte given.
    ///
    /// This particular searcher is specialized to use neon vector instructions
    /// that typically make it quite fast.
    ///
    /// If neon is unavailable in the current environment, then `None` is
    /// returned.
    #[inline]
    pub fn new(needle: u8) -> Option<One> {
        if One::is_available() {
            // SAFETY: we check that neon is available above.
            unsafe { Some(One::new_unchecked(needle)) }
        } else {
            None
        }
    }

    /// Create a new finder specific to neon vectors and routines without
    /// checking that neon is available.
    ///
    /// # Safety
    ///
    /// Callers must guarantee that it is safe to execute `neon` instructions
    /// in the current environment.
    ///
    /// Note that it is a common misconception that if one compiles for an
    /// `x86_64` target, then they therefore automatically have access to neon
    /// instructions. While this is almost always the case, it isn't true in
    /// 100% of cases.
    #[target_feature(enable = "neon")]
    #[inline]
    pub unsafe fn new_unchecked(needle: u8) -> One {
        One(generic::One::new(needle))
    }

    /// Returns true when this implementation is available in the current
    /// environment.
    ///
    /// When this is true, it is guaranteed that [`One::new`] will return
    /// a `Some` value. Similarly, when it is false, it is guaranteed that
    /// `One::new` will return a `None` value.
    ///
    /// Note also that for the lifetime of a single program, if this returns
    /// true then it will always return true.
    #[inline]
    pub fn is_available() -> bool {
        #[cfg(target_feature = "neon")]
        {
            true
        }
        #[cfg(not(target_feature = "neon"))]
        {
            false
        }
    }

    /// Return the first occurrence of one of the needle bytes in the given
    /// haystack. If no such occurrence exists, then `None` is returned.
    ///
    /// The occurrence is reported as an offset into `haystack`. Its maximum
    /// value is `haystack.len() - 1`.
    #[inline]
    pub fn find(&self, haystack: &[u8]) -> Option<usize> {
        // SAFETY: `find_raw` guarantees that if a pointer is returned, it
        // falls within the bounds of the start and end pointers.
        unsafe {
            generic::search_slice_with_raw(haystack, |s, e| {
                self.find_raw(s, e)
            })
        }
    }

    /// Return the last occurrence of one of the needle bytes in the given
    /// haystack. If no such occurrence exists, then `None` is returned.
    ///
    /// The occurrence is reported as an offset into `haystack`. Its maximum
    /// value is `haystack.len() - 1`.
    #[inline]
    pub fn rfind(&self, haystack: &[u8]) -> Option<usize> {
        // SAFETY: `rfind_raw` guarantees that if a pointer is returned, it
        // falls within the bounds of the start and end pointers.
        unsafe {
            generic::search_slice_with_raw(haystack, |s, e| {
                self.rfind_raw(s, e)
            })
        }
    }

    /// Counts all occurrences of this byte in the given haystack.
    #[inline]
    pub fn count(&self, haystack: &[u8]) -> usize {
        // SAFETY: All of our pointers are derived directly from a borrowed
        // slice, which is guaranteed to be valid.
        unsafe {
            let start = haystack.as_ptr();
            let end = start.add(haystack.len());
            self.count_raw(start, end)
        }
    }

    /// Like 
```

---

# OUTRO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\wasm32\simd128\memchr.rs
**SHA:** bac2c4c43fe710c8
**Timestamp:** 2026-08-28T02:34:48.557658
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = haystack.as_ptr();
- start: *const u8,
- start: *const u8,
- pub unsafe fn count_raw(&self, start: *const u8, end: *const u8) -> usize {
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
This module defines 128-bit vector implementations of `memchr` and friends.

The main types in this module are [`One`], [`Two`] and [`Three`]. They are for
searching for one, two or three distinct bytes, respectively, in a haystack.
Each type also has corresponding double ended iterators. These searchers are
typically much faster than scalar routines accomplishing the same task.

The `One` searcher also provides a [`One::count`] routine for efficiently
counting the number of times a single byte occurs in a haystack. This is
useful, for example, for counting the number of lines in a haystack. This
routine exists because it is usually faster, especially with a high match
count, then using [`One::find`] repeatedly. ([`OneIter`] specializes its
`Iterator::count` implementation to use this routine.)

Only one, two and three bytes are supported because three bytes is about
the point where one sees diminishing returns. Beyond this point and it's
probably (but not necessarily) better to just use a simple `[bool; 256]` array
or similar. However, it depends mightily on the specific work-load and the
expected match frequency.
*/

use core::arch::wasm32::v128;

use crate::{arch::generic::memchr as generic, ext::Pointer, vector::Vector};

/// Finds all occurrences of a single byte in a haystack.
#[derive(Clone, Copy, Debug)]
pub struct One(generic::One<v128>);

impl One {
    /// Create a new searcher that finds occurrences of the needle byte given.
    ///
    /// This particular searcher is specialized to use simd128 vector
    /// instructions that typically make it quite fast.
    ///
    /// If simd128 is unavailable in the current environment, then `None` is
    /// returned.
    #[inline]
    pub fn new(needle: u8) -> Option<One> {
        if One::is_available() {
            // SAFETY: we check that simd128 is available above.
            unsafe { Some(One::new_unchecked(needle)) }
        } else {
            None
        }
    }

    /// Create a new finder specific to simd128 vectors and routines without
    /// checking that simd128 is available.
    ///
    /// # Safety
    ///
    /// Callers must guarantee that it is safe to execute `simd128`
    /// instructions in the current environment.
    #[target_feature(enable = "simd128")]
    #[inline]
    pub unsafe fn new_unchecked(needle: u8) -> One {
        One(generic::One::new(needle))
    }

    /// Returns true when this implementation is available in the current
    /// environment.
    ///
    /// When this is true, it is guaranteed that [`One::new`] will return
    /// a `Some` value. Similarly, when it is false, it is guaranteed that
    /// `One::new` will return a `None` value.
    ///
    /// Note also that for the lifetime of a single program, if this returns
    /// true then it will always return true.
    #[inline]
    pub fn is_available() -> bool {
        #[cfg(target_feature = "simd128")]
        {
            true
        }
        #[cfg(not(target_feature = "simd128"))]
        {
            false
        }
    }

    /// Return the first occurrence of one of the needle bytes in the given
    /// haystack. If no such occurrence exists, then `None` is returned.
    ///
    /// The occurrence is reported as an offset into `haystack`. Its maximum
    /// value is `haystack.len() - 1`.
    #[inline]
    pub fn find(&self, haystack: &[u8]) -> Option<usize> {
        // SAFETY: `find_raw` guarantees that if a pointer is returned, it
        // falls within the bounds of the start and end pointers.
        unsafe {
            generic::search_slice_with_raw(haystack, |s, e| {
                self.find_raw(s, e)
            })
        }
    }

    /// Return the last occurrence of one of the needle bytes in the given
    /// haystack. If no such occurrence exists, then `None` is returned.
    ///
    /// The occurrence is reported as an offset into `haystack`. Its maximum
    /// value is `haystack.len() - 1`.
    #[inline]
    pub fn rfind(&self, haystack: &[u8]) -> Option<usize> {
        // SAFETY: `rfind_raw` guarantees that if a pointer is returned, it
        // falls within the bounds of the start and end pointers.
        unsafe {
            generic::search_slice_with_raw(haystack, |s, e| {
                self.rfind_raw(s, e)
            })
        }
    }

    /// Counts all occurrences of this byte in the given haystack.
    #[inline]
    pub fn count(&self, haystack: &[u8]) -> usize {
        // SAFETY: All of our pointers are derived directly from a borrowed
        // slice, which is guaranteed to be valid.
        unsafe {
            let start = haystack.as_ptr();
            let end = start.add(haystack.len());
            self.count_raw(start, end)
        }
    }

    /// Like `find`, but accepts and returns raw pointers.
    ///
    /// When a match is found, the pointer returned is guaranteed to be
    /// `>= start` and `< end`.
    ///
    /// This routine is useful if you're already using raw pointers and would
    
```

---

# OUTRO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\util\prefilter\memchr.rs
**SHA:** 145e443a5ee305c7
**Timestamp:** 2026-08-28T02:35:06.850216
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = span.start + i;
- Some(Span { start: span.start, end: span.start + 1 })
- let start = span.start + i;
- Some(Span { start: span.start, end: span.start + 1 })
- let start = span.start + i;
- Some(Span { start: span.start, end: span.start + 1 })

### Ouro Bruto (primeiros 5000 chars)
```
use crate::util::{
    prefilter::PrefilterI,
    search::{MatchKind, Span},
};

#[derive(Clone, Debug)]
pub(crate) struct Memchr(u8);

impl Memchr {
    pub(crate) fn new<B: AsRef<[u8]>>(
        _kind: MatchKind,
        needles: &[B],
    ) -> Option<Memchr> {
        #[cfg(not(feature = "perf-literal-substring"))]
        {
            None
        }
        #[cfg(feature = "perf-literal-substring")]
        {
            if needles.len() != 1 {
                return None;
            }
            if needles[0].as_ref().len() != 1 {
                return None;
            }
            Some(Memchr(needles[0].as_ref()[0]))
        }
    }
}

impl PrefilterI for Memchr {
    fn name(&self) -> &'static str {
        "memchr"
    }

    fn find(&self, haystack: &[u8], span: Span) -> Option<Span> {
        #[cfg(not(feature = "perf-literal-substring"))]
        {
            unreachable!()
        }
        #[cfg(feature = "perf-literal-substring")]
        {
            memchr::memchr(self.0, &haystack[span]).map(|i| {
                let start = span.start + i;
                let end = start + 1;
                Span { start, end }
            })
        }
    }

    fn prefix(&self, haystack: &[u8], span: Span) -> Option<Span> {
        let b = *haystack.get(span.start)?;
        if self.0 == b {
            Some(Span { start: span.start, end: span.start + 1 })
        } else {
            None
        }
    }

    fn memory_usage(&self) -> usize {
        0
    }

    fn is_fast(&self) -> bool {
        true
    }
}

#[derive(Clone, Debug)]
pub(crate) struct Memchr2(u8, u8);

impl Memchr2 {
    pub(crate) fn new<B: AsRef<[u8]>>(
        _kind: MatchKind,
        needles: &[B],
    ) -> Option<Memchr2> {
        #[cfg(not(feature = "perf-literal-substring"))]
        {
            None
        }
        #[cfg(feature = "perf-literal-substring")]
        {
            if needles.len() != 2 {
                return None;
            }
            if !needles.iter().all(|n| n.as_ref().len() == 1) {
                return None;
            }
            let b1 = needles[0].as_ref()[0];
            let b2 = needles[1].as_ref()[0];
            Some(Memchr2(b1, b2))
        }
    }
}

impl PrefilterI for Memchr2 {
    fn name(&self) -> &'static str {
        "memchr2"
    }

    fn find(&self, haystack: &[u8], span: Span) -> Option<Span> {
        #[cfg(not(feature = "perf-literal-substring"))]
        {
            unreachable!()
        }
        #[cfg(feature = "perf-literal-substring")]
        {
            memchr::memchr2(self.0, self.1, &haystack[span]).map(|i| {
                let start = span.start + i;
                let end = start + 1;
                Span { start, end }
            })
        }
    }

    fn prefix(&self, haystack: &[u8], span: Span) -> Option<Span> {
        let b = *haystack.get(span.start)?;
        if self.0 == b || self.1 == b {
            Some(Span { start: span.start, end: span.start + 1 })
        } else {
            None
        }
    }

    fn memory_usage(&self) -> usize {
        0
    }

    fn is_fast(&self) -> bool {
        true
    }
}

#[derive(Clone, Debug)]
pub(crate) struct Memchr3(u8, u8, u8);

impl Memchr3 {
    pub(crate) fn new<B: AsRef<[u8]>>(
        _kind: MatchKind,
        needles: &[B],
    ) -> Option<Memchr3> {
        #[cfg(not(feature = "perf-literal-substring"))]
        {
            None
        }
        #[cfg(feature = "perf-literal-substring")]
        {
            if needles.len() != 3 {
                return None;
            }
            if !needles.iter().all(|n| n.as_ref().len() == 1) {
                return None;
            }
            let b1 = needles[0].as_ref()[0];
            let b2 = needles[1].as_ref()[0];
            let b3 = needles[2].as_ref()[0];
            Some(Memchr3(b1, b2, b3))
        }
    }
}

impl PrefilterI for Memchr3 {
    fn name(&self) -> &'static str {
        "memchr3"
    }

    fn find(&self, haystack: &[u8], span: Span) -> Option<Span> {
        #[cfg(not(feature = "perf-literal-substring"))]
        {
            unreachable!()
        }
        #[cfg(feature = "perf-literal-substring")]
        {
            memchr::memchr3(self.0, self.1, self.2, &haystack[span]).map(|i| {
                let start = span.start + i;
                let end = start + 1;
                Span { start, end }
            })
        }
    }

    fn prefix(&self, haystack: &[u8], span: Span) -> Option<Span> {
        let b = *haystack.get(span.start)?;
        if self.0 == b || self.1 == b || self.2 == b {
            Some(Span { start: span.start, end: span.start + 1 })
        } else {
            None
        }
    }

    fn memory_usage(&self) -> usize {
        0
    }

    fn is_fast(&self) -> bool {
        true
    }
}

```

---

# OUTRO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\util\memchr.rs
**SHA:** c9d7b9f5b9d03845
**Timestamp:** 2026-08-28T02:36:21.043198
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = haystack.as_ptr();

### Ouro Bruto (primeiros 5000 chars)
```
//! Search for a byte in a byte array using libc.
//!
//! When nothing pulls in libc, then just use a trivial implementation. Note
//! that we only depend on libc on unix.

#[cfg(not(all(unix, feature = "libc")))]
fn memchr_inner(needle: u8, haystack: &[u8]) -> Option<usize> {
    haystack.iter().position(|val| needle == *val)
}

#[cfg(all(unix, feature = "libc"))]
fn memchr_inner(needle: u8, haystack: &[u8]) -> Option<usize> {
    let start = haystack.as_ptr();

    // SAFETY: `start` is valid for `haystack.len()` bytes.
    let ptr = (unsafe { libc::memchr(start.cast(), needle as _, haystack.len()) })
        .cast::<u8>()
        .cast_const();

    if ptr.is_null() {
        None
    } else {
        // SAFETY: `ptr` will always be in bounds, since libc guarantees that the ptr will either
        //          be to an element inside the array or the ptr will be null
        //          since the ptr is in bounds the offset must also always be non null
        //          and there can't be more than isize::MAX elements inside an array
        //          as rust guarantees that the maximum number of bytes a allocation
        //          may occupy is isize::MAX
        unsafe {
            // TODO(MSRV 1.87): When bumping MSRV, switch to `ptr.byte_offset_from_unsigned(start)`.
            Some(usize::try_from(ptr.offset_from(start)).unwrap_unchecked())
        }
    }
}

pub(crate) fn memchr(needle: u8, haystack: &[u8]) -> Option<usize> {
    let index = memchr_inner(needle, haystack)?;

    // SAFETY: `memchr_inner` returns Some(index) and in that case index must point to an element in haystack
    //         or `memchr_inner` None which is guarded by the `?` operator above
    //         therefore the index must **always** point to an element in the array
    //         and so this indexing operation is safe
    // TODO(MSRV 1.81): When bumping MSRV, switch to `std::hint::assert_unchecked(haystack.get(..=index).is_some());`
    unsafe {
        if haystack.get(..=index).is_none() {
            std::hint::unreachable_unchecked()
        }
    }

    Some(index)
}

#[cfg(test)]
mod tests {
    use super::memchr;

    #[test]
    fn memchr_test() {
        let haystack = b"123abc456\0\xffabc\n";

        assert_eq!(memchr(b'1', haystack), Some(0));
        assert_eq!(memchr(b'2', haystack), Some(1));
        assert_eq!(memchr(b'3', haystack), Some(2));
        assert_eq!(memchr(b'4', haystack), Some(6));
        assert_eq!(memchr(b'5', haystack), Some(7));
        assert_eq!(memchr(b'6', haystack), Some(8));
        assert_eq!(memchr(b'7', haystack), None);
        assert_eq!(memchr(b'a', haystack), Some(3));
        assert_eq!(memchr(b'b', haystack), Some(4));
        assert_eq!(memchr(b'c', haystack), Some(5));
        assert_eq!(memchr(b'd', haystack), None);
        assert_eq!(memchr(b'A', haystack), None);
        assert_eq!(memchr(0, haystack), Some(9));
        assert_eq!(memchr(0xff, haystack), Some(10));
        assert_eq!(memchr(0xfe, haystack), None);
        assert_eq!(memchr(1, haystack), None);
        assert_eq!(memchr(b'\n', haystack), Some(14));
        assert_eq!(memchr(b'\r', haystack), None);
    }

    #[test]
    fn memchr_all() {
        let mut arr = Vec::new();
        for b in 0..=255 {
            arr.push(b);
        }
        for b in 0..=255 {
            assert_eq!(memchr(b, &arr), Some(b as usize));
        }
        arr.reverse();
        for b in 0..=255 {
            assert_eq!(memchr(b, &arr), Some(255 - b as usize));
        }
    }

    #[test]
    fn memchr_empty() {
        for b in 0..=255 {
            assert_eq!(memchr(b, b""), None);
        }
    }
}

```
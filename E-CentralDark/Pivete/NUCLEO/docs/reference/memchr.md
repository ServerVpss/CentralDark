# REFERENCIA - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\x86_64\avx2\memchr.rs
**SHA:** 576ec0c30f49874f
**Timestamp:** 2026-08-28T02:34:48.696109
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
This module defines 256-bit vector implementations of `memchr` and friends.

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

use core::arch::x86_64::{__m128i, __m256i};

use crate::{arch::generic::memchr as generic, ext::Pointer, vector::Vector};

/// Finds all occurrences of a single byte in a haystack.
#[derive(Clone, Copy, Debug)]
pub struct One {
    /// Used for haystacks less than 32 bytes.
    sse2: generic::One<__m128i>,
    /// Used for haystacks bigger than 32 bytes.
    avx2: generic::One<__m256i>,
}

impl One {
    /// Create a new searcher that finds occurrences of the needle byte given.
    ///
    /// This particular searcher is specialized to use AVX2 vector instructions
    /// that typically make it quite fast. (SSE2 is used for haystacks that
    /// are too short to accommodate an AVX2 vector.)
    ///
    /// If either SSE2 or AVX2 is unavailable in the current environment, then
    /// `None` is returned.
    #[inline]
    pub fn new(needle: u8) -> Option<One> {
        if One::is_available() {
            // SAFETY: we check that sse2 and avx2 are available above.
            unsafe { Some(One::new_unchecked(needle)) }
        } else {
            None
        }
    }

    /// Create a new finder specific to AVX2 vectors and routines without
    /// checking that either SSE2 or AVX2 is available.
    ///
    /// # Safety
    ///
    /// Callers must guarantee that it is safe to execute both `sse2` and
    /// `avx2` instructions in the current environment.
    ///
    /// Note that it is a common misconception that if one compiles for an
    /// `x86_64` target, then they therefore automatically have access to SSE2
    /// instructions. While this is almost always the case, it isn't true in
    /// 100% of cases.
    #[target_feature(enable = "sse2", enable = "avx2")]
    #[inline]
    pub unsafe fn new_unchecked(needle: u8) -> One {
        One {
            sse2: generic::One::new(needle),
            avx2: generic::One::new(needle),
        }
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
        #[cfg(not(target_feature = "sse2"))]
        {
            false
        }
        #[cfg(target_feature = "sse2")]
        {
            #[cfg(target_feature = "avx2")]
            {
                true
            }
            #[cfg(not(target_feature = "avx2"))]
            {
                #[cfg(feature = "std")]
                {
                    std::is_x86_feature_detected!("avx2")
                }
                #[cfg(not(feature = "std"))]
                {
                    false
                }
            }
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
    pub fn rf
```

---

# REFERENCIA - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\x86_64\sse2\memchr.rs
**SHA:** 0de0444e26d885ea
**Timestamp:** 2026-08-28T02:34:48.736600
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
count, than using [`One::find`] repeatedly. ([`OneIter`] specializes its
`Iterator::count` implementation to use this routine.)

Only one, two and three bytes are supported because three bytes is about
the point where one sees diminishing returns. Beyond this point and it's
probably (but not necessarily) better to just use a simple `[bool; 256]` array
or similar. However, it depends mightily on the specific work-load and the
expected match frequency.
*/

use core::arch::x86_64::__m128i;

use crate::{arch::generic::memchr as generic, ext::Pointer, vector::Vector};

/// Finds all occurrences of a single byte in a haystack.
#[derive(Clone, Copy, Debug)]
pub struct One(generic::One<__m128i>);

impl One {
    /// Create a new searcher that finds occurrences of the needle byte given.
    ///
    /// This particular searcher is specialized to use SSE2 vector instructions
    /// that typically make it quite fast.
    ///
    /// If SSE2 is unavailable in the current environment, then `None` is
    /// returned.
    #[inline]
    pub fn new(needle: u8) -> Option<One> {
        if One::is_available() {
            // SAFETY: we check that sse2 is available above.
            unsafe { Some(One::new_unchecked(needle)) }
        } else {
            None
        }
    }

    /// Create a new finder specific to SSE2 vectors and routines without
    /// checking that SSE2 is available.
    ///
    /// # Safety
    ///
    /// Callers must guarantee that it is safe to execute `sse2` instructions
    /// in the current environment.
    ///
    /// Note that it is a common misconception that if one compiles for an
    /// `x86_64` target, then they therefore automatically have access to SSE2
    /// instructions. While this is almost always the case, it isn't true in
    /// 100% of cases.
    #[target_feature(enable = "sse2")]
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
        #[cfg(target_feature = "sse2")]
        {
            true
        }
        #[cfg(not(target_feature = "sse2"))]
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

    /// Like `find`,
```
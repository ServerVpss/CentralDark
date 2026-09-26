# COMANDO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\all\memchr.rs
**SHA:** b0b1214aa573ed5d
**Timestamp:** 2026-08-28T02:34:48.325592
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

### Gaps
- // TODO: use `usize::from` once it can be used in const context.

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Provides architecture independent implementations of `memchr` and friends.

The main types in this module are [`One`], [`Two`] and [`Three`]. They are for
searching for one, two or three distinct bytes, respectively, in a haystack.
Each type also has corresponding double ended iterators. These searchers
are typically slower than hand-coded vector routines accomplishing the same
task, but are also typically faster than naive scalar code. These routines
effectively work by treating a `usize` as a vector of 8-bit lanes, and thus
achieves some level of data parallelism even without explicit vector support.

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

use crate::{arch::generic::memchr as generic, ext::Pointer};

/// The number of bytes in a single `usize` value.
const USIZE_BYTES: usize = (usize::BITS / 8) as usize;
/// The bits that must be zero for a `*const usize` to be properly aligned.
const USIZE_ALIGN: usize = USIZE_BYTES - 1;

/// Finds all occurrences of a single byte in a haystack.
#[derive(Clone, Copy, Debug)]
pub struct One {
    s1: u8,
    v1: usize,
}

impl One {
    /// The number of bytes we examine per each iteration of our search loop.
    const LOOP_BYTES: usize = 2 * USIZE_BYTES;

    /// Create a new searcher that finds occurrences of the byte given.
    #[inline]
    pub fn new(needle: u8) -> One {
        One { s1: needle, v1: splat(needle) }
    }

    /// A test-only routine so that we can bundle a bunch of quickcheck
    /// properties into a single macro. Basically, this provides a constructor
    /// that makes it identical to most other memchr implementations, which
    /// have fallible constructors.
    #[cfg(test)]
    pub(crate) fn try_new(needle: u8) -> Option<One> {
        Some(One::new(needle))
    }

    /// Return the first occurrence of the needle in the given haystack. If no
    /// such occurrence exists, then `None` is returned.
    ///
    /// The occurrence is reported as an offset into `haystack`. Its maximum
    /// value for a non-empty haystack is `haystack.len() - 1`.
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

    /// Return the last occurrence of the needle in the given haystack. If no
    /// such occurrence exists, then `None` is returned.
    ///
    /// The occurrence is reported as an offset into `haystack`. Its maximum
    /// value for a non-empty haystack is `haystack.len() - 1`.
    #[inline]
    pub fn rfind(&self, haystack: &[u8]) -> Option<usize> {
        // SAFETY: `find_raw` guarantees that if a pointer is returned, it
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
    /// like to avoid converting back to a slice before executing a search.
    ///
    /// # Safety
    ///
    /// * Both `start` and `end` must be valid for reads.
    /// * Both `start` and `end` must point to an initialized value.
    /// * Both `start` and `end` must point to the same allocated object and
    /// must either be in bounds or at most one byte past the end of the
    /// allocated object.
    /// * Both `start` and `end` must be _derived from_ a pointer to the same
    /// object.
    /// * The distance between `start` an
```
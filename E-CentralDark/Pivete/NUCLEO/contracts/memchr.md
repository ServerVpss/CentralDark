# CONTRATO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\memchr.rs
**SHA:** 6ae779ec5d00f443
**Timestamp:** 2026-08-28T02:34:48.129754
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- unsafe fn count_raw(needle: u8, start: *const u8, end: *const u8) -> usize {

### Ouro Bruto (primeiros 5000 chars)
```
use core::iter::Rev;

use crate::arch::generic::memchr as generic;

/// Search for the first occurrence of a byte in a slice.
///
/// This returns the index corresponding to the first occurrence of `needle` in
/// `haystack`, or `None` if one is not found. If an index is returned, it is
/// guaranteed to be less than `haystack.len()`.
///
/// While this is semantically the same as something like
/// `haystack.iter().position(|&b| b == needle)`, this routine will attempt to
/// use highly optimized vector operations that can be an order of magnitude
/// faster (or more).
///
/// # Example
///
/// This shows how to find the first position of a byte in a byte string.
///
/// ```
/// use memchr::memchr;
///
/// let haystack = b"the quick brown fox";
/// assert_eq!(memchr(b'k', haystack), Some(8));
/// ```
#[inline]
pub fn memchr(needle: u8, haystack: &[u8]) -> Option<usize> {
    // SAFETY: memchr_raw, when a match is found, always returns a valid
    // pointer between start and end.
    unsafe {
        generic::search_slice_with_raw(haystack, |start, end| {
            memchr_raw(needle, start, end)
        })
    }
}

/// Search for the last occurrence of a byte in a slice.
///
/// This returns the index corresponding to the last occurrence of `needle` in
/// `haystack`, or `None` if one is not found. If an index is returned, it is
/// guaranteed to be less than `haystack.len()`.
///
/// While this is semantically the same as something like
/// `haystack.iter().rposition(|&b| b == needle)`, this routine will attempt to
/// use highly optimized vector operations that can be an order of magnitude
/// faster (or more).
///
/// # Example
///
/// This shows how to find the last position of a byte in a byte string.
///
/// ```
/// use memchr::memrchr;
///
/// let haystack = b"the quick brown fox";
/// assert_eq!(memrchr(b'o', haystack), Some(17));
/// ```
#[inline]
pub fn memrchr(needle: u8, haystack: &[u8]) -> Option<usize> {
    // SAFETY: memrchr_raw, when a match is found, always returns a valid
    // pointer between start and end.
    unsafe {
        generic::search_slice_with_raw(haystack, |start, end| {
            memrchr_raw(needle, start, end)
        })
    }
}

/// Search for the first occurrence of two possible bytes in a haystack.
///
/// This returns the index corresponding to the first occurrence of one of the
/// needle bytes in `haystack`, or `None` if one is not found. If an index is
/// returned, it is guaranteed to be less than `haystack.len()`.
///
/// While this is semantically the same as something like
/// `haystack.iter().position(|&b| b == needle1 || b == needle2)`, this routine
/// will attempt to use highly optimized vector operations that can be an order
/// of magnitude faster (or more).
///
/// # Example
///
/// This shows how to find the first position of one of two possible bytes in a
/// haystack.
///
/// ```
/// use memchr::memchr2;
///
/// let haystack = b"the quick brown fox";
/// assert_eq!(memchr2(b'k', b'q', haystack), Some(4));
/// ```
#[inline]
pub fn memchr2(needle1: u8, needle2: u8, haystack: &[u8]) -> Option<usize> {
    // SAFETY: memchr2_raw, when a match is found, always returns a valid
    // pointer between start and end.
    unsafe {
        generic::search_slice_with_raw(haystack, |start, end| {
            memchr2_raw(needle1, needle2, start, end)
        })
    }
}

/// Search for the last occurrence of two possible bytes in a haystack.
///
/// This returns the index corresponding to the last occurrence of one of the
/// needle bytes in `haystack`, or `None` if one is not found. If an index is
/// returned, it is guaranteed to be less than `haystack.len()`.
///
/// While this is semantically the same as something like
/// `haystack.iter().rposition(|&b| b == needle1 || b == needle2)`, this
/// routine will attempt to use highly optimized vector operations that can be
/// an order of magnitude faster (or more).
///
/// # Example
///
/// This shows how to find the last position of one of two possible bytes in a
/// haystack.
///
/// ```
/// use memchr::memrchr2;
///
/// let haystack = b"the quick brown fox";
/// assert_eq!(memrchr2(b'k', b'o', haystack), Some(17));
/// ```
#[inline]
pub fn memrchr2(needle1: u8, needle2: u8, haystack: &[u8]) -> Option<usize> {
    // SAFETY: memrchr2_raw, when a match is found, always returns a valid
    // pointer between start and end.
    unsafe {
        generic::search_slice_with_raw(haystack, |start, end| {
            memrchr2_raw(needle1, needle2, start, end)
        })
    }
}

/// Search for the first occurrence of three possible bytes in a haystack.
///
/// This returns the index corresponding to the first occurrence of one of the
/// needle bytes in `haystack`, or `None` if one is not found. If an index is
/// returned, it is guaranteed to be less than `haystack.len()`.
///
/// While this is semantically the same as something like
/// `haystack.iter().position(|&b| b == needle1 || b == needle2 || b == needle3)`,
//
```

---

# CONTRATO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\generic\memchr.rs
**SHA:** ee2a77afcbf50665
**Timestamp:** 2026-08-28T02:34:48.469426
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- original_start: *const u8,
- start: *const u8,
- original_start: haystack.as_ptr(),

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Generic crate-internal routines for the `memchr` family of functions.
*/

// What follows is a vector algorithm generic over the specific vector
// type to detect the position of one, two or three needles in a haystack.
// From what I know, this is a "classic" algorithm, although I don't
// believe it has been published in any peer reviewed journal. I believe
// it can be found in places like glibc and Go's standard library. It
// appears to be well known and is elaborated on in more detail here:
// https://gms.tf/stdfind-and-memchr-optimizations.html
//
// While the routine below is fairly long and perhaps intimidating, the basic
// idea is actually very simple and can be expressed straight-forwardly in
// pseudo code. The pseudo code below is written for 128 bit vectors, but the
// actual code below works for anything that implements the Vector trait.
//
//     needle = (n1 << 15) | (n1 << 14) | ... | (n1 << 1) | n1
//     // Note: shift amount is in bytes
//
//     while i <= haystack.len() - 16:
//       // A 16 byte vector. Each byte in chunk corresponds to a byte in
//       // the haystack.
//       chunk = haystack[i:i+16]
//       // Compare bytes in needle with bytes in chunk. The result is a 16
//       // byte chunk where each byte is 0xFF if the corresponding bytes
//       // in needle and chunk were equal, or 0x00 otherwise.
//       eqs = cmpeq(needle, chunk)
//       // Return a 32 bit integer where the most significant 16 bits
//       // are always 0 and the lower 16 bits correspond to whether the
//       // most significant bit in the correspond byte in `eqs` is set.
//       // In other words, `mask as u16` has bit i set if and only if
//       // needle[i] == chunk[i].
//       mask = movemask(eqs)
//
//       // Mask is 0 if there is no match, and non-zero otherwise.
//       if mask != 0:
//         // trailing_zeros tells us the position of the least significant
//         // bit that is set.
//         return i + trailing_zeros(mask)
//
//     // haystack length may not be a multiple of 16, so search the rest.
//     while i < haystack.len():
//       if haystack[i] == n1:
//         return i
//
//     // No match found.
//     return NULL
//
// In fact, we could loosely translate the above code to Rust line-for-line
// and it would be a pretty fast algorithm. But, we pull out all the stops
// to go as fast as possible:
//
// 1. We use aligned loads. That is, we do some finagling to make sure our
//    primary loop not only proceeds in increments of 16 bytes, but that
//    the address of haystack's pointer that we dereference is aligned to
//    16 bytes. 16 is a magic number here because it is the size of SSE2
//    128-bit vector. (For the AVX2 algorithm, 32 is the magic number.)
//    Therefore, to get aligned loads, our pointer's address must be evenly
//    divisible by 16.
// 2. Our primary loop proceeds 64 bytes at a time instead of 16. It's
//    kind of like loop unrolling, but we combine the equality comparisons
//    using a vector OR such that we only need to extract a single mask to
//    determine whether a match exists or not. If so, then we do some
//    book-keeping to determine the precise location but otherwise mush on.
// 3. We use our "chunk" comparison routine in as many places as possible,
//    even if it means using unaligned loads. In particular, if haystack
//    starts with an unaligned address, then we do an unaligned load to
//    search the first 16 bytes. We then start our primary loop at the
//    smallest subsequent aligned address, which will actually overlap with
//    previously searched bytes. But we're OK with that. We do a similar
//    dance at the end of our primary loop. Finally, to avoid a
//    byte-at-a-time loop at the end, we do a final 16 byte unaligned load
//    that may overlap with a previous load. This is OK because it converts
//    a loop into a small number of very fast vector instructions. The overlap
//    is OK because we know the place where the overlap occurs does not
//    contain a match.
//
// And that's pretty all there is to it. Note that since the below is
// generic and since it's meant to be inlined into routines with a
// `#[target_feature(enable = "...")]` annotation, we must mark all routines as
// both unsafe and `#[inline(always)]`.
//
// The fact that the code below is generic does somewhat inhibit us. For
// example, I've noticed that introducing an unlineable `#[cold]` function to
// handle the match case in the loop generates tighter assembly, but there is
// no way to do this in the generic code below because the generic code doesn't
// know what `target_feature` annotation to apply to the unlineable function.
// We could make such functions part of the `Vector` trait, but we instead live
// with the slightly sub-optimal codegen for now since it doesn't seem to have
// a noticeable perf difference.

use crate::{
    ext::Pointer,
    vector::{MoveMask, Vector},
};

/// Finds all occurrences of a s
```

---

# CONTRATO - memchr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\x86_64\memchr.rs
**SHA:** 4cf0611c926c3016
**Timestamp:** 2026-08-28T02:34:48.599936
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// fn memchr(needle1: u8, start: *const u8, end: *const u8) -> Option<usize>;
- $hay_start:ident,
- $hay_start: *const u8,
- $hay_start: *const u8,
- $hay_start: *const u8,
- $hay_start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,
- start: *const u8,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Wrapper routines for `memchr` and friends.

These routines efficiently dispatch to the best implementation based on what
the CPU supports.
*/

/// Provides a way to run a memchr-like function while amortizing the cost of
/// runtime CPU feature detection.
///
/// This works by loading a function pointer from an atomic global. Initially,
/// this global is set to a function that does CPU feature detection. For
/// example, if AVX2 is enabled, then the AVX2 implementation is used.
/// Otherwise, at least on x86_64, the SSE2 implementation is used. (And
/// in some niche cases, if SSE2 isn't available, then the architecture
/// independent fallback implementation is used.)
///
/// After the first call to this function, the atomic global is replaced with
/// the specific AVX2, SSE2 or fallback routine chosen. Subsequent calls then
/// will directly call the chosen routine instead of needing to go through the
/// CPU feature detection branching again.
///
/// This particular macro is specifically written to provide the implementation
/// of functions with the following signature:
///
/// ```ignore
/// fn memchr(needle1: u8, start: *const u8, end: *const u8) -> Option<usize>;
/// ```
///
/// Where you can also have `memchr2` and `memchr3`, but with `needle2` and
/// `needle3`, respectively. The `start` and `end` parameters correspond to the
/// start and end of the haystack, respectively.
///
/// We use raw pointers here instead of the more obvious `haystack: &[u8]` so
/// that the function is compatible with our lower level iterator logic that
/// operates on raw pointers. We use this macro to implement "raw" memchr
/// routines with the signature above, and then define memchr routines using
/// regular slices on top of them.
///
/// Note that we use `#[cfg(target_feature = "sse2")]` below even though
/// it shouldn't be strictly necessary because without it, it seems to
/// cause the compiler to blow up. I guess it can't handle a function
/// pointer being created with a sse target feature? Dunno. See the
/// `build-for-x86-64-but-non-sse-target` CI job if you want to experiment with
/// this.
///
/// # Safety
///
/// Primarily callers must ensure that `$fnty` is a correct function pointer
/// type and not something else.
///
/// Callers must also ensure that `$memchrty::$memchrfind` corresponds to a
/// routine that returns a valid function pointer when a match is found. That
/// is, a pointer that is `>= start` and `< end`.
///
/// Callers must also ensure that the `$hay_start` and `$hay_end` identifiers
/// correspond to valid pointers.
macro_rules! unsafe_ifunc {
    (
        $memchrty:ident,
        $memchrfind:ident,
        $fnty:ty,
        $retty:ty,
        $hay_start:ident,
        $hay_end:ident,
        $($needle:ident),+
    ) => {{
        #![allow(unused_unsafe)]

        use core::sync::atomic::{AtomicPtr, Ordering};

        type Fn = *mut ();
        type RealFn = $fnty;
        static FN: AtomicPtr<()> = AtomicPtr::new(detect as Fn);

        #[cfg(target_feature = "sse2")]
        #[target_feature(enable = "sse2", enable = "avx2")]
        unsafe fn find_avx2(
            $($needle: u8),+,
            $hay_start: *const u8,
            $hay_end: *const u8,
        ) -> $retty {
            use crate::arch::x86_64::avx2::memchr::$memchrty;
            $memchrty::new_unchecked($($needle),+)
                .$memchrfind($hay_start, $hay_end)
        }

        #[cfg(target_feature = "sse2")]
        #[target_feature(enable = "sse2")]
        unsafe fn find_sse2(
            $($needle: u8),+,
            $hay_start: *const u8,
            $hay_end: *const u8,
        ) -> $retty {
            use crate::arch::x86_64::sse2::memchr::$memchrty;
            $memchrty::new_unchecked($($needle),+)
                .$memchrfind($hay_start, $hay_end)
        }

        unsafe fn find_fallback(
            $($needle: u8),+,
            $hay_start: *const u8,
            $hay_end: *const u8,
        ) -> $retty {
            use crate::arch::all::memchr::$memchrty;
            $memchrty::new($($needle),+).$memchrfind($hay_start, $hay_end)
        }

        unsafe fn detect(
            $($needle: u8),+,
            $hay_start: *const u8,
            $hay_end: *const u8,
        ) -> $retty {
            let fun = {
                #[cfg(not(target_feature = "sse2"))]
                {
                    debug!(
                        "no sse2 feature available, using fallback for {}",
                        stringify!($memchrty),
                    );
                    find_fallback as RealFn
                }
                #[cfg(target_feature = "sse2")]
                {
                    use crate::arch::x86_64::{sse2, avx2};
                    if avx2::memchr::$memchrty::is_available() {
                        debug!("chose AVX2 for {}", stringify!($memchrty));
                        find_avx2 as RealFn
                    } else if sse2::memchr::$memchrty::is_available() {
        
```
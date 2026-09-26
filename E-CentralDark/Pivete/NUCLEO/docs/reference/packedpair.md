# REFERENCIA - packedpair.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\generic\packedpair.rs
**SHA:** 892d6ee28f0f5007
**Timestamp:** 2026-08-28T02:34:48.483855
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = haystack.as_ptr();
- let start = haystack.as_ptr();
- unsafe fn matched(start: *const u8, cur: *const u8, chunki: usize) -> usize {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Generic crate-internal routines for the "packed pair" SIMD algorithm.

The "packed pair" algorithm is based on the [generic SIMD] algorithm. The main
difference is that it (by default) uses a background distribution of byte
frequencies to heuristically select the pair of bytes to search for.

[generic SIMD]: http://0x80.pl/articles/simd-strfind.html#first-and-last
*/

use crate::{
    arch::all::{is_equal_raw, packedpair::Pair},
    ext::Pointer,
    vector::{MoveMask, Vector},
};

/// A generic architecture dependent "packed pair" finder.
///
/// This finder picks two bytes that it believes have high predictive power
/// for indicating an overall match of a needle. Depending on whether
/// `Finder::find` or `Finder::find_prefilter` is used, it reports offsets
/// where the needle matches or could match. In the prefilter case, candidates
/// are reported whenever the [`Pair`] of bytes given matches.
///
/// This is architecture dependent because it uses specific vector operations
/// to look for occurrences of the pair of bytes.
///
/// This type is not meant to be exported and is instead meant to be used as
/// the implementation for architecture specific facades. Why? Because it's a
/// bit of a quirky API that requires `inline(always)` annotations. And pretty
/// much everything has safety obligations due (at least) to the caller needing
/// to inline calls into routines marked with
/// `#[target_feature(enable = "...")]`.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Finder<V> {
    pair: Pair,
    v1: V,
    v2: V,
    min_haystack_len: usize,
}

impl<V: Vector> Finder<V> {
    /// Create a new pair searcher. The searcher returned can either report
    /// exact matches of `needle` or act as a prefilter and report candidate
    /// positions of `needle`.
    ///
    /// # Safety
    ///
    /// Callers must ensure that whatever vector type this routine is called
    /// with is supported by the current environment.
    ///
    /// Callers must also ensure that `needle.len() >= 2`.
    #[inline(always)]
    pub(crate) unsafe fn new(needle: &[u8], pair: Pair) -> Finder<V> {
        let max_index = pair.index1().max(pair.index2());
        let min_haystack_len =
            core::cmp::max(needle.len(), usize::from(max_index) + V::BYTES);
        let v1 = V::splat(needle[usize::from(pair.index1())]);
        let v2 = V::splat(needle[usize::from(pair.index2())]);
        Finder { pair, v1, v2, min_haystack_len }
    }

    /// Searches the given haystack for the given needle. The needle given
    /// should be the same as the needle that this finder was initialized
    /// with.
    ///
    /// # Panics
    ///
    /// When `haystack.len()` is less than [`Finder::min_haystack_len`].
    ///
    /// # Safety
    ///
    /// Since this is meant to be used with vector functions, callers need to
    /// specialize this inside of a function with a `target_feature` attribute.
    /// Therefore, callers must ensure that whatever target feature is being
    /// used supports the vector functions that this function is specialized
    /// for. (For the specific vector functions used, see the Vector trait
    /// implementations.)
    #[inline(always)]
    pub(crate) unsafe fn find(
        &self,
        haystack: &[u8],
        needle: &[u8],
    ) -> Option<usize> {
        assert!(
            haystack.len() >= self.min_haystack_len,
            "haystack too small, should be at least {} but got {}",
            self.min_haystack_len,
            haystack.len(),
        );

        let all = V::Mask::all_zeros_except_least_significant(0);
        let start = haystack.as_ptr();
        let end = start.add(haystack.len());
        let max = end.sub(self.min_haystack_len);
        let mut cur = start;

        // N.B. I did experiment with unrolling the loop to deal with size(V)
        // bytes at a time and 2*size(V) bytes at a time. The double unroll
        // was marginally faster while the quadruple unroll was unambiguously
        // slower. In the end, I decided the complexity from unrolling wasn't
        // worth it. I used the memmem/krate/prebuilt/huge-en/ benchmarks to
        // compare.
        while cur <= max {
            if let Some(chunki) = self.find_in_chunk(needle, cur, end, all) {
                return Some(matched(start, cur, chunki));
            }
            cur = cur.add(V::BYTES);
        }
        if cur < end {
            let remaining = end.distance(cur);
            debug_assert!(
                remaining < self.min_haystack_len,
                "remaining bytes should be smaller than the minimum haystack \
                 length of {}, but there are {} bytes remaining",
                self.min_haystack_len,
                remaining,
            );
            if remaining < needle.len() {
                return None;
            }
            debug_assert!(
                max < cur,
                "after main loop, cur should have exceeded max",
            );
        
```
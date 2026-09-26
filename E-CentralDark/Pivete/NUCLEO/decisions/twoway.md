# DECISAO - twoway.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\all\twoway.rs
**SHA:** 0b27eb1cd7402c13
**Timestamp:** 2026-08-28T02:34:48.409197
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut candidate_start = 1;
- let mut candidate_start = match needle.len().checked_sub(1) {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
An implementation of the [Two-Way substring search algorithm][two-way].

[`Finder`] can be built for forward searches, while [`FinderRev`] can be built
for reverse searches.

Two-Way makes for a nice general purpose substring search algorithm because of
its time and space complexity properties. It also performs well in practice.
Namely, with `m = len(needle)` and `n = len(haystack)`, Two-Way takes `O(m)`
time to create a finder, `O(1)` space and `O(n)` search time. In other words,
the preprocessing step is quick, doesn't require any heap memory and the worst
case search time is guaranteed to be linear in the haystack regardless of the
size of the needle.

While vector algorithms will usually beat Two-Way handedly, vector algorithms
also usually have pathological or edge cases that are better handled by Two-Way.
Moreover, not all targets support vector algorithms or implementations for them
simply may not exist yet.

Two-Way can be found in the `memmem` implementations in at least [GNU libc] and
[musl].

[two-way]: https://en.wikipedia.org/wiki/Two-way_string-matching_algorithm
[GNU libc]: https://www.gnu.org/software/libc/
[musl]: https://www.musl-libc.org/
*/

use core::cmp;

use crate::{
    arch::all::{is_prefix, is_suffix},
    memmem::Pre,
};

/// A forward substring searcher that uses the Two-Way algorithm.
#[derive(Clone, Copy, Debug)]
pub struct Finder(TwoWay);

/// A reverse substring searcher that uses the Two-Way algorithm.
#[derive(Clone, Copy, Debug)]
pub struct FinderRev(TwoWay);

/// An implementation of the TwoWay substring search algorithm.
///
/// This searcher supports forward and reverse search, although not
/// simultaneously. It runs in `O(n + m)` time and `O(1)` space, where
/// `n ~ len(needle)` and `m ~ len(haystack)`.
///
/// The implementation here roughly matches that which was developed by
/// Crochemore and Perrin in their 1991 paper "Two-way string-matching." The
/// changes in this implementation are 1) the use of zero-based indices, 2) a
/// heuristic skip table based on the last byte (borrowed from Rust's standard
/// library) and 3) the addition of heuristics for a fast skip loop. For (3),
/// callers can pass any kind of prefilter they want, but usually it's one
/// based on a heuristic that uses an approximate background frequency of bytes
/// to choose rare bytes to quickly look for candidate match positions. Note
/// though that currently, this prefilter functionality is not exposed directly
/// in the public API. (File an issue if you want it and provide a use case
/// please.)
///
/// The heuristic for fast skipping is automatically shut off if it's
/// detected to be ineffective at search time. Generally, this only occurs in
/// pathological cases. But this is generally necessary in order to preserve
/// a `O(n + m)` time bound.
///
/// The code below is fairly complex and not obviously correct at all. It's
/// likely necessary to read the Two-Way paper cited above in order to fully
/// grok this code. The essence of it is:
///
/// 1. Do something to detect a "critical" position in the needle.
/// 2. For the current position in the haystack, look if `needle[critical..]`
/// matches at that position.
/// 3. If so, look if `needle[..critical]` matches.
/// 4. If a mismatch occurs, shift the search by some amount based on the
/// critical position and a pre-computed shift.
///
/// This type is wrapped in the forward and reverse finders that expose
/// consistent forward or reverse APIs.
#[derive(Clone, Copy, Debug)]
struct TwoWay {
    /// A small bitset used as a quick prefilter (in addition to any prefilter
    /// given by the caller). Namely, a bit `i` is set if and only if `b%64==i`
    /// for any `b == needle[i]`.
    ///
    /// When used as a prefilter, if the last byte at the current candidate
    /// position is NOT in this set, then we can skip that entire candidate
    /// position (the length of the needle). This is essentially the shift
    /// trick found in Boyer-Moore, but only applied to bytes that don't appear
    /// in the needle.
    ///
    /// N.B. This trick was inspired by something similar in std's
    /// implementation of Two-Way.
    byteset: ApproximateByteSet,
    /// A critical position in needle. Specifically, this position corresponds
    /// to beginning of either the minimal or maximal suffix in needle. (N.B.
    /// See SuffixType below for why "minimal" isn't quite the correct word
    /// here.)
    ///
    /// This is the position at which every search begins. Namely, search
    /// starts by scanning text to the right of this position, and only if
    /// there's a match does the text to the left of this position get scanned.
    critical_pos: usize,
    /// The amount we shift by in the Two-Way search algorithm. This
    /// corresponds to the "small period" and "large period" cases.
    shift: Shift,
}

impl Finder {
    /// Create a searcher that finds occurrences of the given `needle`.
    ///
    /// An empty `needle`
```
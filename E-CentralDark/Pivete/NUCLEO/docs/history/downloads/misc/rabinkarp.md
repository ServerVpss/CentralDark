# OUTRO - rabinkarp.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\packed\rabinkarp.rs
**SHA:** 403146eb1d838a84
**Timestamp:** 2026-08-28T02:32:19.536357
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- use crate::{packed::pattern::Patterns, util::search::Match, PatternID};

### Ouro Bruto (primeiros 5000 chars)
```
use alloc::{sync::Arc, vec, vec::Vec};

use crate::{packed::pattern::Patterns, util::search::Match, PatternID};

/// The type of the rolling hash used in the Rabin-Karp algorithm.
type Hash = usize;

/// The number of buckets to store our patterns in. We don't want this to be
/// too big in order to avoid wasting memory, but we don't want it to be too
/// small either to avoid spending too much time confirming literals.
///
/// The number of buckets MUST be a power of two. Otherwise, determining the
/// bucket from a hash will slow down the code considerably. Using a power
/// of two means `hash % NUM_BUCKETS` can compile down to a simple `and`
/// instruction.
const NUM_BUCKETS: usize = 64;

/// An implementation of the Rabin-Karp algorithm. The main idea of this
/// algorithm is to maintain a rolling hash as it moves through the input, and
/// then check whether that hash corresponds to the same hash for any of the
/// patterns we're looking for.
///
/// A draw back of naively scaling Rabin-Karp to multiple patterns is that
/// it requires all of the patterns to be the same length, which in turn
/// corresponds to the number of bytes to hash. We adapt this to work for
/// multiple patterns of varying size by fixing the number of bytes to hash
/// to be the length of the smallest pattern. We also split the patterns into
/// several buckets to hopefully make the confirmation step faster.
///
/// Wikipedia has a decent explanation, if a bit heavy on the theory:
/// https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm
///
/// But ESMAJ provides something a bit more concrete:
/// https://www-igm.univ-mlv.fr/~lecroq/string/node5.html
#[derive(Clone, Debug)]
pub(crate) struct RabinKarp {
    /// The patterns we're searching for.
    patterns: Arc<Patterns>,
    /// The order of patterns in each bucket is significant. Namely, they are
    /// arranged such that the first one to match is the correct match. This
    /// may not necessarily correspond to the order provided by the caller.
    /// For example, if leftmost-longest semantics are used, then the patterns
    /// are sorted by their length in descending order. If leftmost-first
    /// semantics are used, then the patterns are sorted by their pattern ID
    /// in ascending order (which corresponds to the caller's order).
    buckets: Vec<Vec<(Hash, PatternID)>>,
    /// The length of the hashing window. Generally, this corresponds to the
    /// length of the smallest pattern.
    hash_len: usize,
    /// The factor to subtract out of a hash before updating it with a new
    /// byte.
    hash_2pow: usize,
}

impl RabinKarp {
    /// Compile a new Rabin-Karp matcher from the patterns given.
    ///
    /// This panics if any of the patterns in the collection are empty, or if
    /// the collection is itself empty.
    pub(crate) fn new(patterns: &Arc<Patterns>) -> RabinKarp {
        assert!(patterns.len() >= 1);
        let hash_len = patterns.minimum_len();
        assert!(hash_len >= 1);

        let mut hash_2pow = 1usize;
        for _ in 1..hash_len {
            hash_2pow = hash_2pow.wrapping_shl(1);
        }

        let mut rk = RabinKarp {
            patterns: Arc::clone(patterns),
            buckets: vec![vec![]; NUM_BUCKETS],
            hash_len,
            hash_2pow,
        };
        for (id, pat) in patterns.iter() {
            let hash = rk.hash(&pat.bytes()[..rk.hash_len]);
            let bucket = hash % NUM_BUCKETS;
            rk.buckets[bucket].push((hash, id));
        }
        rk
    }

    /// Return the first matching pattern in the given haystack, begining the
    /// search at `at`.
    pub(crate) fn find_at(
        &self,
        haystack: &[u8],
        mut at: usize,
    ) -> Option<Match> {
        assert_eq!(NUM_BUCKETS, self.buckets.len());

        if at + self.hash_len > haystack.len() {
            return None;
        }
        let mut hash = self.hash(&haystack[at..at + self.hash_len]);
        loop {
            let bucket = &self.buckets[hash % NUM_BUCKETS];
            for &(phash, pid) in bucket {
                if phash == hash {
                    if let Some(c) = self.verify(pid, haystack, at) {
                        return Some(c);
                    }
                }
            }
            if at + self.hash_len >= haystack.len() {
                return None;
            }
            hash = self.update_hash(
                hash,
                haystack[at],
                haystack[at + self.hash_len],
            );
            at += 1;
        }
    }

    /// Returns the approximate total amount of heap used by this searcher, in
    /// units of bytes.
    pub(crate) fn memory_usage(&self) -> usize {
        self.buckets.len() * core::mem::size_of::<Vec<(Hash, PatternID)>>()
            + self.patterns.len() * core::mem::size_of::<(Hash, PatternID)>()
    }

    /// Verify whether the pattern with the given id matches at
    /// `haystack[at..]`.
    ///
    /// We tag this func
```

---

# OUTRO - rabinkarp.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\memchr-2.8.3\src\arch\all\rabinkarp.rs
**SHA:** 06038cce1cbead7b
**Timestamp:** 2026-08-28T02:34:48.426477
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let hstart = haystack.as_ptr();
- let nstart = needle.as_ptr();
- hstart: *const u8,
- nstart: *const u8,
- let hstart = haystack.as_ptr();
- let nstart = needle.as_ptr();
- hstart: *const u8,
- nstart: *const u8,
- let start = hstart;
- unsafe fn forward(mut start: *const u8, end: *const u8) -> Hash {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
An implementation of the [Rabin-Karp substring search algorithm][rabinkarp].

Rabin-Karp works by creating a hash of the needle provided and then computing
a rolling hash for each needle sized window in the haystack. When the rolling
hash matches the hash of the needle, a byte-wise comparison is done to check
if a match exists. The worst case time complexity of Rabin-Karp is `O(m *
n)` where `m ~ len(needle)` and `n ~ len(haystack)`. Its worst case space
complexity is constant.

The main utility of Rabin-Karp is that the searcher can be constructed very
quickly with very little memory. This makes it especially useful when searching
for small needles in small haystacks, as it might finish its search before a
beefier algorithm (like Two-Way) even starts.

[rabinkarp]: https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm
*/

/*
(This was the comment I wrote for this module originally when it was not
exposed. The comment still looks useful, but it's a bit in the weeds, so it's
not public itself.)

This module implements the classical Rabin-Karp substring search algorithm,
with no extra frills. While its use would seem to break our time complexity
guarantee of O(m+n) (RK's time complexity is O(mn)), we are careful to only
ever use RK on a constant subset of haystacks. The main point here is that
RK has good latency properties for small needles/haystacks. It's very quick
to compute a needle hash and zip through the haystack when compared to
initializing Two-Way, for example. And this is especially useful for cases
where the haystack is just too short for vector instructions to do much good.

The hashing function used here is the same one recommended by ESMAJ.

Another choice instead of Rabin-Karp would be Shift-Or. But its latency
isn't quite as good since its preprocessing time is a bit more expensive
(both in practice and in theory). However, perhaps Shift-Or has a place
somewhere else for short patterns. I think the main problem is that it
requires space proportional to the alphabet and the needle. If we, for
example, supported needles up to length 16, then the total table size would be
len(alphabet)*size_of::<u16>()==512 bytes. Which isn't exactly small, and it's
probably bad to put that on the stack. So ideally, we'd throw it on the heap,
but we'd really like to write as much code without using alloc/std as possible.
But maybe it's worth the special casing. It's a TODO to benchmark.

Wikipedia has a decent explanation, if a bit heavy on the theory:
https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm

But ESMAJ provides something a bit more concrete:
http://www-igm.univ-mlv.fr/~lecroq/string/node5.html

Finally, aho-corasick uses Rabin-Karp for multiple pattern match in some cases:
https://github.com/BurntSushi/aho-corasick/blob/3852632f10587db0ff72ef29e88d58bf305a0946/src/packed/rabinkarp.rs
*/

use crate::ext::Pointer;

/// A forward substring searcher using the Rabin-Karp algorithm.
///
/// Note that, as a lower level API, a `Finder` does not have access to the
/// needle it was constructed with. For this reason, executing a search
/// with a `Finder` requires passing both the needle and the haystack,
/// where the needle is exactly equivalent to the one given to the `Finder`
/// at construction time. This design was chosen so that callers can have
/// more precise control over where and how many times a needle is stored.
/// For example, in cases where Rabin-Karp is just one of several possible
/// substring search algorithms.
#[derive(Clone, Debug)]
pub struct Finder {
    /// The actual hash.
    hash: Hash,
    /// The factor needed to multiply a byte by in order to subtract it from
    /// the hash. It is defined to be 2^(n-1) (using wrapping exponentiation),
    /// where n is the length of the needle. This is how we "remove" a byte
    /// from the hash once the hash window rolls past it.
    hash_2pow: u32,
}

impl Finder {
    /// Create a new Rabin-Karp forward searcher for the given `needle`.
    ///
    /// The needle may be empty. The empty needle matches at every byte offset.
    ///
    /// Note that callers must pass the same needle to all search calls using
    /// this `Finder`.
    #[inline]
    pub fn new(needle: &[u8]) -> Finder {
        let mut s = Finder { hash: Hash::new(), hash_2pow: 1 };
        let first_byte = match needle.first() {
            None => return s,
            Some(&first_byte) => first_byte,
        };
        s.hash.add(first_byte);
        for b in needle.iter().copied().skip(1) {
            s.hash.add(b);
            s.hash_2pow = s.hash_2pow.wrapping_shl(1);
        }
        s
    }

    /// Return the first occurrence of the `needle` in the `haystack`
    /// given. If no such occurrence exists, then `None` is returned.
    ///
    /// The `needle` provided must match the needle given to this finder at
    /// construction time.
    ///
    /// The maximum value this can return is `haystack.len()`, which can only
    /// occur when the nee
```
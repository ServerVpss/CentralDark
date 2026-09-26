# OUTRO - generic.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\packed\teddy\generic.rs
**SHA:** ea252ab05b32cea7
**Timestamp:** 2026-08-28T02:32:19.890772
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
- start: *const u8,
- start: *const u8,
- let start = cur;

### Padroes
- pattern::Patterns,

### Ouro Bruto (primeiros 5000 chars)
```
use core::fmt::Debug;

use alloc::{
    boxed::Box, collections::BTreeMap, format, sync::Arc, vec, vec::Vec,
};

use crate::{
    packed::{
        ext::Pointer,
        pattern::Patterns,
        vector::{FatVector, Vector},
    },
    util::int::U32,
    PatternID,
};

/// A match type specialized to the Teddy implementations below.
///
/// Essentially, instead of representing a match at byte offsets, we use
/// raw pointers. This is because the implementations below operate on raw
/// pointers, and so this is a more natural return type based on how the
/// implementation works.
///
/// Also, the `PatternID` used here is a `u16`.
#[derive(Clone, Copy, Debug)]
pub(crate) struct Match {
    pid: PatternID,
    start: *const u8,
    end: *const u8,
}

impl Match {
    /// Returns the ID of the pattern that matched.
    pub(crate) fn pattern(&self) -> PatternID {
        self.pid
    }

    /// Returns a pointer into the haystack at which the match starts.
    pub(crate) fn start(&self) -> *const u8 {
        self.start
    }

    /// Returns a pointer into the haystack at which the match ends.
    pub(crate) fn end(&self) -> *const u8 {
        self.end
    }
}

/// A "slim" Teddy implementation that is generic over both the vector type
/// and the minimum length of the patterns being searched for.
///
/// Only 1, 2, 3 and 4 bytes are supported as minimum lengths.
#[derive(Clone, Debug)]
pub(crate) struct Slim<V, const BYTES: usize> {
    /// A generic data structure for doing "slim" Teddy verification.
    teddy: Teddy<8>,
    /// The masks used as inputs to the shuffle operation to generate
    /// candidates (which are fed into the verification routines).
    masks: [Mask<V>; BYTES],
}

impl<V: Vector, const BYTES: usize> Slim<V, BYTES> {
    /// Create a new "slim" Teddy searcher for the given patterns.
    ///
    /// # Panics
    ///
    /// This panics when `BYTES` is any value other than 1, 2, 3 or 4.
    ///
    /// # Safety
    ///
    /// Callers must ensure that this is okay to call in the current target for
    /// the current CPU.
    #[inline(always)]
    pub(crate) unsafe fn new(patterns: Arc<Patterns>) -> Slim<V, BYTES> {
        assert!(
            1 <= BYTES && BYTES <= 4,
            "only 1, 2, 3 or 4 bytes are supported"
        );
        let teddy = Teddy::new(patterns);
        let masks = SlimMaskBuilder::from_teddy(&teddy);
        Slim { teddy, masks }
    }

    /// Returns the approximate total amount of heap used by this type, in
    /// units of bytes.
    #[inline(always)]
    pub(crate) fn memory_usage(&self) -> usize {
        self.teddy.memory_usage()
    }

    /// Returns the minimum length, in bytes, that a haystack must be in order
    /// to use it with this searcher.
    #[inline(always)]
    pub(crate) fn minimum_len(&self) -> usize {
        V::BYTES + (BYTES - 1)
    }
}

impl<V: Vector> Slim<V, 1> {
    /// Look for an occurrences of the patterns in this finder in the haystack
    /// given by the `start` and `end` pointers.
    ///
    /// If no match could be found, then `None` is returned.
    ///
    /// # Safety
    ///
    /// The given pointers representing the haystack must be valid to read
    /// from. They must also point to a region of memory that is at least the
    /// minimum length required by this searcher.
    ///
    /// Callers must ensure that this is okay to call in the current target for
    /// the current CPU.
    #[inline(always)]
    pub(crate) unsafe fn find(
        &self,
        start: *const u8,
        end: *const u8,
    ) -> Option<Match> {
        let len = end.distance(start);
        debug_assert!(len >= self.minimum_len());
        let mut cur = start;
        while cur <= end.sub(V::BYTES) {
            if let Some(m) = self.find_one(cur, end) {
                return Some(m);
            }
            cur = cur.add(V::BYTES);
        }
        if cur < end {
            cur = end.sub(V::BYTES);
            if let Some(m) = self.find_one(cur, end) {
                return Some(m);
            }
        }
        None
    }

    /// Look for a match starting at the `V::BYTES` at and after `cur`. If
    /// there isn't one, then `None` is returned.
    ///
    /// # Safety
    ///
    /// The given pointers representing the haystack must be valid to read
    /// from. They must also point to a region of memory that is at least the
    /// minimum length required by this searcher.
    ///
    /// Callers must ensure that this is okay to call in the current target for
    /// the current CPU.
    #[inline(always)]
    unsafe fn find_one(
        &self,
        cur: *const u8,
        end: *const u8,
    ) -> Option<Match> {
        let c = self.candidate(cur);
        if !c.is_zero() {
            if let Some(m) = self.teddy.verify(cur, end, c) {
                return Some(m);
            }
        }
        None
    }

    /// Look for a candidate match (represented as a vector) starting at the
    /// `V::BYTES` at and afte
```
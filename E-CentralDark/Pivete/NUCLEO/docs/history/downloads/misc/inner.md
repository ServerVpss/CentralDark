# OUTRO - inner.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\indexmap-2.14.0\src\inner.rs
**SHA:** 25aae06c59c18867
**Timestamp:** 2026-08-28T02:34:30.238218
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn erase_indices(&mut self, start: usize, end: usize) {
- fn decrement_indices(&mut self, start: usize, end: usize) {
- fn increment_indices(&mut self, start: usize, end: usize) {

### Ouro Bruto (primeiros 5000 chars)
```
//! This is the core implementation that doesn't depend on the hasher at all.
//!
//! The methods of `Core` don't use any Hash properties of K.
//!
//! It's cleaner to separate them out, then the compiler checks that we are not
//! using Hash at all in these methods.
//!
//! However, we should probably not let this show in the public API or docs.

mod entry;
mod extract;

use alloc::vec::{self, Vec};
use core::mem;
use core::ops::RangeBounds;
use hashbrown::hash_table;

use crate::util::simplify_range;
use crate::{Bucket, Equivalent, HashValue, TryReserveError};

type Indices = hash_table::HashTable<usize>;
type Entries<K, V> = Vec<Bucket<K, V>>;

pub use entry::{OccupiedEntry, VacantEntry};
pub(crate) use extract::ExtractCore;

/// Core of the map that does not depend on S
#[cfg_attr(feature = "test_debug", derive(Debug))]
pub(crate) struct Core<K, V> {
    /// indices mapping from the entry hash to its index.
    indices: Indices,
    /// entries is a dense vec maintaining entry order.
    entries: Entries<K, V>,
}

#[inline(always)]
fn get_hash<K, V>(entries: &[Bucket<K, V>]) -> impl Fn(&usize) -> u64 + use<'_, K, V> {
    move |&i| entries[i].hash.get()
}

#[inline]
fn equivalent<'a, K, V, Q: ?Sized + Equivalent<K>>(
    key: &'a Q,
    entries: &'a [Bucket<K, V>],
) -> impl Fn(&usize) -> bool + use<'a, K, V, Q> {
    move |&i| Q::equivalent(key, &entries[i].key)
}

#[inline]
fn erase_index(table: &mut Indices, hash: HashValue, index: usize) {
    if let Ok(entry) = table.find_entry(hash.get(), move |&i| i == index) {
        entry.remove();
    } else if cfg!(debug_assertions) {
        panic!("index not found");
    }
}

#[inline]
fn update_index(table: &mut Indices, hash: HashValue, old: usize, new: usize) {
    let index = table
        .find_mut(hash.get(), move |&i| i == old)
        .expect("index not found");
    *index = new;
}

/// Inserts many entries into the indices table without reallocating,
/// and without regard for duplication.
///
/// ***Panics*** if there is not sufficient capacity already.
fn insert_bulk_no_grow<K, V>(indices: &mut Indices, entries: &[Bucket<K, V>]) {
    assert!(indices.capacity() - indices.len() >= entries.len());
    for entry in entries {
        indices.insert_unique(entry.hash.get(), indices.len(), |_| unreachable!());
    }
}

impl<K, V> Clone for Core<K, V>
where
    K: Clone,
    V: Clone,
{
    fn clone(&self) -> Self {
        let mut new = Self::new();
        new.clone_from(self);
        new
    }

    fn clone_from(&mut self, other: &Self) {
        self.indices.clone_from(&other.indices);
        if self.entries.capacity() < other.entries.len() {
            // If we must resize, match the indices capacity.
            let additional = other.entries.len() - self.entries.len();
            self.reserve_entries(additional);
        }
        self.entries.clone_from(&other.entries);
    }
}

impl<K, V> Core<K, V> {
    /// The maximum capacity before the `entries` allocation would exceed `isize::MAX`.
    const MAX_ENTRIES_CAPACITY: usize = (isize::MAX as usize) / size_of::<Bucket<K, V>>();

    #[inline]
    pub(crate) const fn new() -> Self {
        Core {
            indices: Indices::new(),
            entries: Vec::new(),
        }
    }

    #[inline]
    pub(crate) fn with_capacity(n: usize) -> Self {
        Core {
            indices: Indices::with_capacity(n),
            entries: Vec::with_capacity(n),
        }
    }

    #[inline]
    pub(crate) fn into_entries(self) -> Entries<K, V> {
        self.entries
    }

    #[inline]
    pub(crate) fn as_entries(&self) -> &[Bucket<K, V>] {
        &self.entries
    }

    #[inline]
    pub(crate) fn as_entries_mut(&mut self) -> &mut [Bucket<K, V>] {
        &mut self.entries
    }

    pub(crate) fn with_entries<F>(&mut self, f: F)
    where
        F: FnOnce(&mut [Bucket<K, V>]),
    {
        f(&mut self.entries);
        self.rebuild_hash_table();
    }

    #[inline]
    pub(crate) fn len(&self) -> usize {
        debug_assert_eq!(self.entries.len(), self.indices.len());
        self.indices.len()
    }

    #[inline]
    pub(crate) fn capacity(&self) -> usize {
        Ord::min(self.indices.capacity(), self.entries.capacity())
    }

    pub(crate) fn clear(&mut self) {
        self.indices.clear();
        self.entries.clear();
    }

    pub(crate) fn truncate(&mut self, len: usize) {
        if len < self.len() {
            self.erase_indices(len, self.entries.len());
            self.entries.truncate(len);
        }
    }

    #[track_caller]
    pub(crate) fn drain<R>(&mut self, range: R) -> vec::Drain<'_, Bucket<K, V>>
    where
        R: RangeBounds<usize>,
    {
        let range = simplify_range(range, self.entries.len());
        self.erase_indices(range.start, range.end);
        self.entries.drain(range)
    }

    #[cfg(feature = "rayon")]
    pub(crate) fn par_drain<R>(&mut self, range: R) -> rayon::vec::Drain<'_, Bucket<K, V>>
    where
        K: Send,
        V: Send,
    
```
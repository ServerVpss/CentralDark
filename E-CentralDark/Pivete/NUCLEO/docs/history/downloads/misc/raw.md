# OUTRO - raw.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\indexmap-1.9.3\src\map\core\raw.rs
**SHA:** 4e5fac4fecccc352
**Timestamp:** 2026-08-28T02:34:30.079377
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub(super) fn erase_indices_sweep(&mut self, start: usize, end: usize) {

### Ouro Bruto (primeiros 5000 chars)
```
#![allow(unsafe_code)]
//! This module encapsulates the `unsafe` access to `hashbrown::raw::RawTable`,
//! mostly in dealing with its bucket "pointers".

use super::{equivalent, Bucket, Entry, HashValue, IndexMapCore, VacantEntry};
use core::fmt;
use core::mem::replace;
use hashbrown::raw::RawTable;

type RawBucket = hashbrown::raw::Bucket<usize>;

/// Inserts many entries into a raw table without reallocating.
///
/// ***Panics*** if there is not sufficient capacity already.
pub(super) fn insert_bulk_no_grow<K, V>(indices: &mut RawTable<usize>, entries: &[Bucket<K, V>]) {
    assert!(indices.capacity() - indices.len() >= entries.len());
    for entry in entries {
        // SAFETY: we asserted that sufficient capacity exists for all entries.
        unsafe {
            indices.insert_no_grow(entry.hash.get(), indices.len());
        }
    }
}

pub(super) struct DebugIndices<'a>(pub &'a RawTable<usize>);
impl fmt::Debug for DebugIndices<'_> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // SAFETY: we're not letting any of the buckets escape this function
        let indices = unsafe { self.0.iter().map(|raw_bucket| raw_bucket.read()) };
        f.debug_list().entries(indices).finish()
    }
}

impl<K, V> IndexMapCore<K, V> {
    /// Sweep the whole table to erase indices start..end
    pub(super) fn erase_indices_sweep(&mut self, start: usize, end: usize) {
        // SAFETY: we're not letting any of the buckets escape this function
        unsafe {
            let offset = end - start;
            for bucket in self.indices.iter() {
                let i = bucket.read();
                if i >= end {
                    bucket.write(i - offset);
                } else if i >= start {
                    self.indices.erase(bucket);
                }
            }
        }
    }

    pub(crate) fn entry(&mut self, hash: HashValue, key: K) -> Entry<'_, K, V>
    where
        K: Eq,
    {
        let eq = equivalent(&key, &self.entries);
        match self.indices.find(hash.get(), eq) {
            // SAFETY: The entry is created with a live raw bucket, at the same time
            // we have a &mut reference to the map, so it can not be modified further.
            Some(raw_bucket) => Entry::Occupied(OccupiedEntry {
                map: self,
                raw_bucket,
                key,
            }),
            None => Entry::Vacant(VacantEntry {
                map: self,
                hash,
                key,
            }),
        }
    }

    pub(super) fn indices_mut(&mut self) -> impl Iterator<Item = &mut usize> {
        // SAFETY: we're not letting any of the buckets escape this function,
        // only the item references that are appropriately bound to `&mut self`.
        unsafe { self.indices.iter().map(|bucket| bucket.as_mut()) }
    }

    /// Return the raw bucket for the given index
    fn find_index(&self, index: usize) -> RawBucket {
        // We'll get a "nice" bounds-check from indexing `self.entries`,
        // and then we expect to find it in the table as well.
        let hash = self.entries[index].hash.get();
        self.indices
            .find(hash, move |&i| i == index)
            .expect("index not found")
    }

    pub(crate) fn swap_indices(&mut self, a: usize, b: usize) {
        // SAFETY: Can't take two `get_mut` references from one table, so we
        // must use raw buckets to do the swap. This is still safe because we
        // are locally sure they won't dangle, and we write them individually.
        unsafe {
            let raw_bucket_a = self.find_index(a);
            let raw_bucket_b = self.find_index(b);
            raw_bucket_a.write(b);
            raw_bucket_b.write(a);
        }
        self.entries.swap(a, b);
    }
}

/// A view into an occupied entry in a `IndexMap`.
/// It is part of the [`Entry`] enum.
///
/// [`Entry`]: enum.Entry.html
// SAFETY: The lifetime of the map reference also constrains the raw bucket,
// which is essentially a raw pointer into the map indices.
pub struct OccupiedEntry<'a, K, V> {
    map: &'a mut IndexMapCore<K, V>,
    raw_bucket: RawBucket,
    key: K,
}

// `hashbrown::raw::Bucket` is only `Send`, not `Sync`.
// SAFETY: `&self` only accesses the bucket to read it.
unsafe impl<K: Sync, V: Sync> Sync for OccupiedEntry<'_, K, V> {}

// The parent module also adds methods that don't threaten the unsafe encapsulation.
impl<'a, K, V> OccupiedEntry<'a, K, V> {
    /// Gets a reference to the entry's key in the map.
    ///
    /// Note that this is not the key that was used to find the entry. There may be an observable
    /// difference if the key type has any distinguishing features outside of `Hash` and `Eq`, like
    /// extra fields or the memory address of an allocation.
    pub fn key(&self) -> &K {
        &self.map.entries[self.index()].key
    }

    /// Gets a reference to the entry's value in the map.
    pub fn get(&self) -> &V {
        &self.map.entries[self.index()].va
```

---

# OUTRO - raw.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\task\raw.rs
**SHA:** 0e20384326d63f00
**Timestamp:** 2026-08-28T02:36:18.835410
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: replace with `#[expect(unsafe_op_in_unsafe_fn)]` after bumpping

### Ouro Bruto (primeiros 5000 chars)
```
// It doesn't make sense to enforce `unsafe_op_in_unsafe_fn` for this module because
//
// * This module is doing the low-level task management that requires tons of unsafe
//   operations.
// * Excessive `unsafe {}` blocks hurt readability significantly.
// TODO: replace with `#[expect(unsafe_op_in_unsafe_fn)]` after bumpping
// the MSRV to 1.81.0.
#![allow(unsafe_op_in_unsafe_fn)]

use crate::future::Future;
use crate::runtime::task::core::{Core, Trailer};
use crate::runtime::task::{Cell, Harness, Header, Id, Schedule, State};
#[cfg(tokio_unstable)]
use std::panic::Location;
use std::ptr::NonNull;
use std::task::{Poll, Waker};

/// Raw task handle
#[derive(Clone)]
pub(crate) struct RawTask {
    ptr: NonNull<Header>,
}

pub(super) struct Vtable {
    /// Polls the future.
    pub(super) poll: unsafe fn(NonNull<Header>),

    /// Schedules the task for execution on the runtime.
    pub(super) schedule: unsafe fn(NonNull<Header>),

    /// Deallocates the memory.
    pub(super) dealloc: unsafe fn(NonNull<Header>),

    /// Reads the task output, if complete.
    pub(super) try_read_output: unsafe fn(NonNull<Header>, *mut (), &Waker),

    /// The join handle has been dropped.
    pub(super) drop_join_handle_slow: unsafe fn(NonNull<Header>),

    /// An abort handle has been dropped.
    pub(super) drop_abort_handle: unsafe fn(NonNull<Header>),

    /// Scheduler is being shutdown.
    pub(super) shutdown: unsafe fn(NonNull<Header>),

    /// The number of bytes that the `trailer` field is offset from the header.
    pub(super) trailer_offset: usize,

    /// The number of bytes that the `scheduler` field is offset from the header.
    pub(super) scheduler_offset: usize,

    /// The number of bytes that the `id` field is offset from the header.
    pub(super) id_offset: usize,

    /// The number of bytes that the `spawned_at` field is offset from the header.
    #[cfg(tokio_unstable)]
    pub(super) spawn_location_offset: usize,
}

/// Get the vtable for the requested `T` and `S` generics.
pub(super) fn vtable<T: Future, S: Schedule>() -> &'static Vtable {
    &Vtable {
        poll: poll::<T, S>,
        schedule: schedule::<S>,
        dealloc: dealloc::<T, S>,
        try_read_output: try_read_output::<T, S>,
        drop_join_handle_slow: drop_join_handle_slow::<T, S>,
        drop_abort_handle: drop_abort_handle::<T, S>,
        shutdown: shutdown::<T, S>,
        trailer_offset: OffsetHelper::<T, S>::TRAILER_OFFSET,
        scheduler_offset: OffsetHelper::<T, S>::SCHEDULER_OFFSET,
        id_offset: OffsetHelper::<T, S>::ID_OFFSET,
        #[cfg(tokio_unstable)]
        spawn_location_offset: OffsetHelper::<T, S>::SPAWN_LOCATION_OFFSET,
    }
}

/// Calling `get_trailer_offset` directly in vtable doesn't work because it
/// prevents the vtable from being promoted to a static reference.
///
/// See this thread for more info:
/// <https://users.rust-lang.org/t/custom-vtables-with-integers/78508>
struct OffsetHelper<T, S>(T, S);
impl<T: Future, S: Schedule> OffsetHelper<T, S> {
    // Pass `size_of`/`align_of` as arguments rather than calling them directly
    // inside `get_trailer_offset` because trait bounds on generic parameters
    // of const fn are unstable on our MSRV.
    const TRAILER_OFFSET: usize = get_trailer_offset(
        std::mem::size_of::<Header>(),
        std::mem::size_of::<Core<T, S>>(),
        std::mem::align_of::<Core<T, S>>(),
        std::mem::align_of::<Trailer>(),
    );

    // The `scheduler` is the first field of `Core`, so it has the same
    // offset as `Core`.
    const SCHEDULER_OFFSET: usize = get_core_offset(
        std::mem::size_of::<Header>(),
        std::mem::align_of::<Core<T, S>>(),
    );

    const ID_OFFSET: usize = get_id_offset(
        std::mem::size_of::<Header>(),
        std::mem::align_of::<Core<T, S>>(),
        std::mem::size_of::<S>(),
        std::mem::align_of::<Id>(),
    );

    #[cfg(tokio_unstable)]
    const SPAWN_LOCATION_OFFSET: usize = get_spawn_location_offset(
        std::mem::size_of::<Header>(),
        std::mem::align_of::<Core<T, S>>(),
        std::mem::size_of::<S>(),
        std::mem::align_of::<Id>(),
        std::mem::size_of::<Id>(),
        std::mem::align_of::<&'static Location<'static>>(),
    );
}

/// Compute the offset of the `Trailer` field in `Cell<T, S>` using the
/// `#[repr(C)]` algorithm.
///
/// Pseudo-code for the `#[repr(C)]` algorithm can be found here:
/// <https://doc.rust-lang.org/reference/type-layout.html#reprc-structs>
const fn get_trailer_offset(
    header_size: usize,
    core_size: usize,
    core_align: usize,
    trailer_align: usize,
) -> usize {
    let mut offset = header_size;

    let core_misalign = offset % core_align;
    if core_misalign > 0 {
        offset += core_align - core_misalign;
    }
    offset += core_size;

    let trailer_misalign = offset % trailer_align;
    if trailer_misalign > 0 {
        offset += trailer_align - trailer_misalign;
    }

    offset
}

/// Compute t
```
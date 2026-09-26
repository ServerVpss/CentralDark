# OUTRO - block.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\sync\mpsc\block.rs
**SHA:** 527b3d9e8b762898
**Timestamp:** 2026-08-28T02:36:20.213926
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Should this iteration be capped?

### Ouro Bruto (primeiros 5000 chars)
```
use crate::loom::cell::UnsafeCell;
use crate::loom::sync::atomic::{AtomicPtr, AtomicUsize};

use std::alloc::Layout;
use std::mem::MaybeUninit;
use std::ops;
use std::ptr::{self, NonNull};
use std::sync::atomic::Ordering::{self, AcqRel, Acquire, Release};

/// A block in a linked list.
///
/// Each block in the list can hold up to `BLOCK_CAP` messages.
pub(crate) struct Block<T> {
    /// The header fields.
    header: BlockHeader<T>,

    /// Array containing values pushed into the block. Values are stored in a
    /// continuous array in order to improve cache line behavior when reading.
    /// The values must be manually dropped.
    values: Values<T>,
}

/// Extra fields for a `Block<T>`.
struct BlockHeader<T> {
    /// The start index of this block.
    ///
    /// Slots in this block have indices in `start_index .. start_index + BLOCK_CAP`.
    start_index: usize,

    /// The next block in the linked list.
    next: AtomicPtr<Block<T>>,

    /// Bitfield tracking slots that are ready to have their values consumed.
    ready_slots: AtomicUsize,

    /// The observed `tail_position` value *after* the block has been passed by
    /// `block_tail`.
    observed_tail_position: UnsafeCell<usize>,
}

pub(crate) enum Read<T> {
    Value(T),
    Closed,
}

#[repr(transparent)]
struct Values<T>([UnsafeCell<MaybeUninit<T>>; BLOCK_CAP]);

use super::BLOCK_CAP;

/// Masks an index to get the block identifier.
const BLOCK_MASK: usize = !(BLOCK_CAP - 1);

/// Masks an index to get the value offset in a block.
const SLOT_MASK: usize = BLOCK_CAP - 1;

/// Flag tracking that a block has gone through the sender's release routine.
///
/// When this is set, the receiver may consider freeing the block.
const RELEASED: usize = 1 << BLOCK_CAP;

/// Flag tracking all senders dropped.
///
/// When this flag is set, the send half of the channel has closed.
const TX_CLOSED: usize = RELEASED << 1;

/// Mask covering all bits used to track slot readiness.
const READY_MASK: usize = RELEASED - 1;

/// Returns the index of the first slot in the block referenced by `slot_index`.
#[inline(always)]
pub(crate) fn start_index(slot_index: usize) -> usize {
    BLOCK_MASK & slot_index
}

/// Returns the offset into the block referenced by `slot_index`.
#[inline(always)]
pub(crate) fn offset(slot_index: usize) -> usize {
    SLOT_MASK & slot_index
}

generate_addr_of_methods! {
    impl<T> Block<T> {
        unsafe fn addr_of_header(self: NonNull<Self>) -> NonNull<BlockHeader<T>> {
            &self.header
        }

        unsafe fn addr_of_values(self: NonNull<Self>) -> NonNull<Values<T>> {
            &self.values
        }
    }
}

impl<T> Block<T> {
    pub(crate) fn new(start_index: usize) -> Box<Block<T>> {
        unsafe {
            // Allocate the block on the heap.
            // SAFETY: The size of the Block<T> is non-zero, since it is at least the size of the header.
            let block = std::alloc::alloc(Layout::new::<Block<T>>()) as *mut Block<T>;
            let block = match NonNull::new(block) {
                Some(block) => block,
                None => std::alloc::handle_alloc_error(Layout::new::<Block<T>>()),
            };

            // Write the header to the block.
            Block::addr_of_header(block).as_ptr().write(BlockHeader {
                // The absolute index in the channel of the first slot in the block.
                start_index,

                // Pointer to the next block in the linked list.
                next: AtomicPtr::new(ptr::null_mut()),

                ready_slots: AtomicUsize::new(0),

                observed_tail_position: UnsafeCell::new(0),
            });

            // Initialize the values array.
            Values::initialize(Block::addr_of_values(block));

            // Convert the pointer to a `Box`.
            // Safety: The raw pointer was allocated using the global allocator, and with
            // the layout for a `Block<T>`, so it's valid to convert it to box.
            Box::from_raw(block.as_ptr())
        }
    }

    /// Returns `true` if the block matches the given index.
    pub(crate) fn is_at_index(&self, index: usize) -> bool {
        debug_assert!(offset(index) == 0);
        self.header.start_index == index
    }

    /// Returns the number of blocks between `self` and the block at the
    /// specified index.
    ///
    /// `start_index` must represent a block *after* `self`.
    pub(crate) fn distance(&self, other_index: usize) -> usize {
        debug_assert!(offset(other_index) == 0);
        other_index.wrapping_sub(self.header.start_index) / BLOCK_CAP
    }

    /// Reads the value at the given offset.
    ///
    /// Returns `None` if the slot is empty.
    ///
    /// # Safety
    ///
    /// To maintain safety, the caller must ensure:
    ///
    /// * No concurrent access to the slot.
    pub(crate) unsafe fn read(&self, slot_index: usize) -> Option<Read<T>> {
        let offset = offset(slot_index);

        let ready_bits = self.head
```
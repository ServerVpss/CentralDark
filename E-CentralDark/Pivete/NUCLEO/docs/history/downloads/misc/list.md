# List and Section

## Intent

Use `List` for feed-style content and settings-style rows where built-in row reuse, selection, and accessibility matter.

## Core patterns

- Prefer `List` for long, vertically scrolling content with repeated rows.
- Use `Section` headers to group related rows.
- Pair with `ScrollViewReader` when you need scroll-to-top or jump-to-id.
- Use `.listStyle(.plain)` for modern feed layouts.
- Use `.listStyle(.grouped)` for multi-section discovery/search pages where section grouping helps.
- Apply `.scrollContentBackground(.hidden)` + a custom background when you need a themed surface.
- Use `.listRowInsets(...)` and `.listRowSeparator(.hidden)` to tune row spacing and separators.
- Use `.environment(\\.defaultMinListRowHeight, ...)` to control dense list layouts.

## Example: feed list with scroll-to-top

```swift
@MainActor
struct TimelineListView: View {
  @Environment(\.selectedTabScrollToTop) private var selectedTabScrollToTop
  @State private var scrollToId: String?

  var body: some View {
    ScrollViewReader { proxy in
      List {
        ForEach(items) { item in
          TimelineRow(item: item)
            .id(item.id)
            .listRowInsets(.init(top: 12, leading: 16, bottom: 6, trailing: 16))
            .listRowSeparator(.hidden)
        }
      }
      .listStyle(.plain)
      .environment(\\.defaultMinListRowHeight, 1)
      .onChange(of: scrollToId) { _, newValue in
        if let newValue {
          proxy.scrollTo(newValue, anchor: .top)
          scrollToId = nil
        }
      }
      .onChange(of: selectedTabScrollToTop) { _, newValue in
        if newValue == 0 {
          withAnimation {
            proxy.scrollTo(ScrollToView.Constants.scrollToTop, anchor: .top)
          }
        }
      }
    }
  }
}
```

## Example: settings-style list

```swift
@MainActor
struct SettingsView: View {
  var body: some View {
    List {
      Section("General") {
        NavigationLink("Display") { DisplaySettingsView() }
        NavigationLink("Haptics") { HapticsSettingsView() }
      }
      Section("Account") {
        Button("Sign Out", role: .destructive) {}
      }
    }
    .listStyle(.insetGrouped)
  }
}
```

## Design choices to keep

- Use `List` for dynamic feeds, settings, and any UI where row semantics help.
- Use stable IDs for rows to keep animations and scroll positioning reliable.
- Prefer `.contentShape(Rectangle())` on rows that should be tappable end-to-end.
- Use `.refreshable` for pull-to-refresh feeds when the data source supports it.

## Pitfalls

- Avoid heavy custom layouts inside a `List` row; use `ScrollView` + `LazyVStack` instead.
- Be careful mixing `List` and nested `ScrollView`; it can cause gesture conflicts.


---

# OUTRO - list.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-channel-0.5.16\src\flavors\list.rs
**SHA:** 03eda8e9e36022eb
**Timestamp:** 2026-08-28T02:33:32.983851
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- unsafe fn destroy(this: *mut Block<T>, start: usize) {

### Gaps
- // TODO: unsafe { Box::new_zeroed().assume_init() }

### Ouro Bruto (primeiros 5000 chars)
```
//! Unbounded channel implemented as a linked list.

use std::alloc::{alloc_zeroed, handle_alloc_error, Layout};
use std::boxed::Box;
use std::cell::UnsafeCell;
use std::marker::PhantomData;
use std::mem::MaybeUninit;
use std::ptr;
use std::sync::atomic::{self, AtomicPtr, AtomicUsize, Ordering};
use std::time::Instant;

use crossbeam_utils::{Backoff, CachePadded};

use crate::context::Context;
use crate::err::{RecvTimeoutError, SendTimeoutError, TryRecvError, TrySendError};
use crate::select::{Operation, SelectHandle, Selected, Token};
use crate::waker::SyncWaker;

// TODO(stjepang): Once we bump the minimum required Rust version to 1.28 or newer, re-apply the
// following changes by @kleimkuhler:
//
// 1. https://github.com/crossbeam-rs/crossbeam-channel/pull/100
// 2. https://github.com/crossbeam-rs/crossbeam-channel/pull/101

// Bits indicating the state of a slot:
// * If a message has been written into the slot, `WRITE` is set.
// * If a message has been read from the slot, `READ` is set.
// * If the block is being destroyed, `DESTROY` is set.
const WRITE: usize = 1;
const READ: usize = 2;
const DESTROY: usize = 4;

// Each block covers one "lap" of indices.
const LAP: usize = 32;
// The maximum number of messages a block can hold.
const BLOCK_CAP: usize = LAP - 1;
// How many lower bits are reserved for metadata.
const SHIFT: usize = 1;
// Has two different purposes:
// * If set in head, indicates that the block is not the last one.
// * If set in tail, indicates that the channel is disconnected.
const MARK_BIT: usize = 1;

/// A slot in a block.
struct Slot<T> {
    /// The message.
    msg: UnsafeCell<MaybeUninit<T>>,

    /// The state of the slot.
    state: AtomicUsize,
}

impl<T> Slot<T> {
    /// Waits until a message is written into the slot.
    fn wait_write(&self) {
        let backoff = Backoff::new();
        while self.state.load(Ordering::Acquire) & WRITE == 0 {
            backoff.snooze();
        }
    }
}

/// A block in a linked list.
///
/// Each block in the list can hold up to `BLOCK_CAP` messages.
struct Block<T> {
    /// The next block in the linked list.
    next: AtomicPtr<Block<T>>,

    /// Slots for messages.
    slots: [Slot<T>; BLOCK_CAP],
}

impl<T> Block<T> {
    const LAYOUT: Layout = {
        let layout = Layout::new::<Self>();
        assert!(
            layout.size() != 0,
            "Block should never be zero-sized, as it has an AtomicPtr field"
        );
        layout
    };

    /// Creates an empty block.
    fn new() -> Box<Self> {
        // SAFETY: layout is not zero-sized
        let ptr = unsafe { alloc_zeroed(Self::LAYOUT) };
        // Handle allocation failure
        if ptr.is_null() {
            handle_alloc_error(Self::LAYOUT)
        }
        // SAFETY: This is safe because:
        //  [1] `Block::next` (AtomicPtr) may be safely zero initialized.
        //  [2] `Block::slots` (Array) may be safely zero initialized because of [3, 4].
        //  [3] `Slot::msg` (UnsafeCell) may be safely zero initialized because it
        //       holds a MaybeUninit.
        //  [4] `Slot::state` (AtomicUsize) may be safely zero initialized.
        // TODO: unsafe { Box::new_zeroed().assume_init() }
        unsafe { Box::from_raw(ptr.cast()) }
    }

    /// Waits until the next pointer is set.
    fn wait_next(&self) -> *mut Block<T> {
        let backoff = Backoff::new();
        loop {
            let next = self.next.load(Ordering::Acquire);
            if !next.is_null() {
                return next;
            }
            backoff.snooze();
        }
    }

    /// Sets the `DESTROY` bit in slots starting from `start` and destroys the block.
    unsafe fn destroy(this: *mut Block<T>, start: usize) {
        // It is not necessary to set the `DESTROY` bit in the last slot because that slot has
        // begun destruction of the block.
        for i in start..BLOCK_CAP - 1 {
            let slot = (*this).slots.get_unchecked(i);

            // Mark the `DESTROY` bit if a thread is still using the slot.
            if slot.state.load(Ordering::Acquire) & READ == 0
                && slot.state.fetch_or(DESTROY, Ordering::AcqRel) & READ == 0
            {
                // If a thread is still using the slot, it will continue destruction of the block.
                return;
            }
        }

        // No thread is using the block, now it is safe to destroy it.
        drop(Box::from_raw(this));
    }
}

/// A position in a channel.
#[derive(Debug)]
struct Position<T> {
    /// The index in the channel.
    index: AtomicUsize,

    /// The block in the linked list.
    block: AtomicPtr<Block<T>>,
}

/// The token type for the list flavor.
#[derive(Debug)]
pub(crate) struct ListToken {
    /// The block of slots.
    block: *const u8,

    /// The offset into the block.
    offset: usize,
}

impl Default for ListToken {
    #[inline]
    fn default() -> Self {
        ListToken {
            block: ptr::null(),
            offset: 0,
   
```

---

# OUTRO - list.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\sync\mpsc\list.rs
**SHA:** 3b587ddaf224eb68
**Timestamp:** 2026-08-28T02:36:20.199352
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Unify this logic with Block::grow

### Ouro Bruto (primeiros 5000 chars)
```
//! A concurrent, lock-free, FIFO list.

use crate::loom::sync::atomic::{AtomicPtr, AtomicUsize};
use crate::loom::thread;
use crate::sync::mpsc::block::{self, Block};

use std::fmt;
use std::ptr::NonNull;
use std::sync::atomic::Ordering::{AcqRel, Acquire, Relaxed, Release};

/// List queue transmit handle.
pub(crate) struct Tx<T> {
    /// Tail in the `Block` mpmc list.
    block_tail: AtomicPtr<Block<T>>,

    /// Position to push the next message. This references a block and offset
    /// into the block.
    tail_position: AtomicUsize,
}

/// List queue receive handle
pub(crate) struct Rx<T> {
    /// Pointer to the block being processed.
    head: NonNull<Block<T>>,

    /// Next slot index to process.
    index: usize,

    /// Pointer to the next block pending release.
    free_head: NonNull<Block<T>>,
}

/// Return value of `Rx::try_pop`.
pub(crate) enum TryPopResult<T> {
    /// Successfully popped a value.
    Ok(T),
    /// The channel is empty.
    ///
    /// Note that `list.rs` only tracks the close state set by senders. If the
    /// channel is closed by `Rx::close()`, then `TryPopResult::Empty` is still
    /// returned, and the close state needs to be handled by `chan.rs`.
    Empty,
    /// The channel is empty and closed.
    ///
    /// Returned when the send half is closed (all senders dropped).
    Closed,
    /// The channel is not empty, but the first value is being written.
    Busy,
}

pub(crate) fn channel<T>() -> (Tx<T>, Rx<T>) {
    // Create the initial block shared between the tx and rx halves.
    let initial_block = Block::new(0);
    let initial_block_ptr = Box::into_raw(initial_block);

    let tx = Tx {
        block_tail: AtomicPtr::new(initial_block_ptr),
        tail_position: AtomicUsize::new(0),
    };

    let head = NonNull::new(initial_block_ptr).unwrap();

    let rx = Rx {
        head,
        index: 0,
        free_head: head,
    };

    (tx, rx)
}

impl<T> Tx<T> {
    /// Pushes a value into the list.
    pub(crate) fn push(&self, value: T) {
        // First, claim a slot for the value. `Acquire` is used here to
        // synchronize with the `fetch_add` in `reclaim_blocks`.
        let slot_index = self.tail_position.fetch_add(1, Acquire);

        // Load the current block and write the value
        let block = self.find_block(slot_index);

        unsafe {
            // Write the value to the block
            block.as_ref().write(slot_index, value);
        }
    }

    /// Closes the send half of the list.
    ///
    /// Similar process as pushing a value, but instead of writing the value &
    /// setting the ready flag, the `TX_CLOSED` flag is set on the block.
    pub(crate) fn close(&self) {
        // First, claim a slot for the value. This is the last slot that will be
        // claimed.
        let slot_index = self.tail_position.fetch_add(1, Acquire);

        let block = self.find_block(slot_index);

        unsafe { block.as_ref().tx_close() }
    }

    fn find_block(&self, slot_index: usize) -> NonNull<Block<T>> {
        // The start index of the block that contains `index`.
        let start_index = block::start_index(slot_index);

        // The index offset into the block
        let offset = block::offset(slot_index);

        // Load the current head of the block
        let mut block_ptr = self.block_tail.load(Acquire);

        let block = unsafe { &*block_ptr };

        // Calculate the distance between the tail ptr and the target block
        let distance = block.distance(start_index);

        // Decide if this call to `find_block` should attempt to update the
        // `block_tail` pointer.
        //
        // Updating `block_tail` is not always performed in order to reduce
        // contention.
        //
        // When set, as the routine walks the linked list, it attempts to update
        // `block_tail`. If the update cannot be performed, `try_updating_tail`
        // is unset.
        let mut try_updating_tail = distance > offset;

        // Walk the linked list of blocks until the block with `start_index` is
        // found.
        loop {
            let block = unsafe { &(*block_ptr) };

            if block.is_at_index(start_index) {
                return unsafe { NonNull::new_unchecked(block_ptr) };
            }

            let next_block = block
                .load_next(Acquire)
                // There is no allocated next block, grow the linked list.
                .unwrap_or_else(|| block.grow());

            // If the block is **not** final, then the tail pointer cannot be
            // advanced any more.
            try_updating_tail &= block.is_final();

            if try_updating_tail {
                // Advancing `block_tail` must happen when walking the linked
                // list. `block_tail` may not advance passed any blocks that are
                // not "final". At the point a block is finalized, it is unknown
                // if there are any prior blocks that are unfina
```
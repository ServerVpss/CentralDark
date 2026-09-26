# OUTRO - linked_list.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\util\linked_list.rs
**SHA:** 000a612d74243ccf
**Timestamp:** 2026-08-28T02:36:21.035401
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: replace with `#[expect(unsafe_op_in_unsafe_fn)]` after bumpping

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg_attr(not(feature = "full"), allow(dead_code))]
// It doesn't make sense to enforce `unsafe_op_in_unsafe_fn` for this module because
//
// * The intrusive linked list naturally relies on unsafe operations.
// * Excessive `unsafe {}` blocks hurt readability significantly.
// TODO: replace with `#[expect(unsafe_op_in_unsafe_fn)]` after bumpping
// the MSRV to 1.81.0.
#![allow(unsafe_op_in_unsafe_fn)]

//! An intrusive double linked list of data.
//!
//! The data structure supports tracking pinned nodes. Most of the data
//! structure's APIs are `unsafe` as they require the caller to ensure the
//! specified node is actually contained by the list.

use core::cell::UnsafeCell;
use core::fmt;
use core::marker::PhantomPinned;
use core::mem::ManuallyDrop;
use core::ptr::{self, NonNull};

/// An intrusive linked list.
///
/// Currently, the list is not emptied on drop. It is the caller's
/// responsibility to ensure the list is empty before dropping it.
pub(crate) struct LinkedList<L: Link> {
    /// Linked list head
    head: Option<NonNull<L::Target>>,

    /// Linked list tail
    tail: Option<NonNull<L::Target>>,
}

unsafe impl<L: Link> Send for LinkedList<L> where L::Target: Send {}
unsafe impl<L: Link> Sync for LinkedList<L> where L::Target: Sync {}

/// Defines how a type is tracked within a linked list.
///
/// In order to support storing a single type within multiple lists, accessing
/// the list pointers is decoupled from the entry type.
///
/// # Safety
///
/// Implementations must guarantee that `Target` types are pinned in memory. In
/// other words, when a node is inserted, the value will not be moved as long as
/// it is stored in the list.
pub(crate) unsafe trait Link {
    /// Handle to the list entry.
    ///
    /// This is usually a pointer-ish type.
    type Handle;

    /// Node type.
    type Target;

    /// Convert the handle to a raw pointer without consuming the handle.
    fn as_raw(handle: &Self::Handle) -> NonNull<Self::Target>;

    /// Convert the raw pointer to a handle
    unsafe fn from_raw(ptr: NonNull<Self::Target>) -> Self::Handle;

    /// Return the pointers for a node
    ///
    /// # Safety
    ///
    /// The resulting pointer should have the same tag in the stacked-borrows
    /// stack as the argument. In particular, the method may not create an
    /// intermediate reference in the process of creating the resulting raw
    /// pointer.
    ///
    /// The `target` pointer must be valid.
    unsafe fn pointers(target: NonNull<Self::Target>) -> NonNull<Pointers<Self::Target>>;
}

/// Previous / next pointers.
pub(crate) struct Pointers<T> {
    inner: UnsafeCell<PointersInner<T>>,
}
/// We do not want the compiler to put the `noalias` attribute on mutable
/// references to this type, so the type has been made `!Unpin` with a
/// `PhantomPinned` field.
///
/// Additionally, we never access the `prev` or `next` fields directly, as any
/// such access would implicitly involve the creation of a reference to the
/// field, which we want to avoid since the fields are not `!Unpin`, and would
/// hence be given the `noalias` attribute if we were to do such an access. As
/// an alternative to accessing the fields directly, the `Pointers` type
/// provides getters and setters for the two fields, and those are implemented
/// using `ptr`-specific methods which avoids the creation of intermediate
/// references.
///
/// See this link for more information:
/// <https://github.com/rust-lang/rust/pull/82834>
struct PointersInner<T> {
    /// The previous node in the list. null if there is no previous node.
    prev: Option<NonNull<T>>,

    /// The next node in the list. null if there is no previous node.
    next: Option<NonNull<T>>,

    /// This type is !Unpin due to the heuristic from:
    /// <https://github.com/rust-lang/rust/pull/82834>
    _pin: PhantomPinned,
}

unsafe impl<T: Send> Send for Pointers<T> {}
unsafe impl<T: Sync> Sync for Pointers<T> {}

// ===== impl LinkedList =====

impl<L: Link> LinkedList<L> {
    /// Creates an empty linked list.
    pub(crate) const fn new() -> LinkedList<L> {
        LinkedList {
            head: None,
            tail: None,
        }
    }

    /// Adds an element first in the list.
    pub(crate) fn push_front(&mut self, val: L::Handle) {
        // The value should not be dropped, it is being inserted into the list
        let val = ManuallyDrop::new(val);
        let ptr = L::as_raw(&val);
        assert_ne!(self.head, Some(ptr));
        unsafe {
            L::pointers(ptr).as_mut().set_next(self.head);
            L::pointers(ptr).as_mut().set_prev(None);

            if let Some(head) = self.head {
                L::pointers(head).as_mut().set_prev(Some(ptr));
            }

            self.head = Some(ptr);

            if self.tail.is_none() {
                self.tail = Some(ptr);
            }
        }
    }

    /// Removes the first element from a list and returns it, or None if it is
    /// empty.
    pub(crate)
```
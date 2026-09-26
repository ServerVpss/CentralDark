# OUTRO - imp_std.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\once_cell-1.21.4\src\imp_std.rs
**SHA:** 1c130f83be5c1360
**Timestamp:** 2026-08-28T02:34:53.661422
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- static mut RUN: bool = false;
- RUN = true;
- RUN = true;

### Ouro Bruto (primeiros 5000 chars)
```
// There's a lot of scary concurrent code in this module, but it is copied from
// `std::sync::Once` with two changes:
//   * no poisoning
//   * init function can fail

use std::{
    cell::{Cell, UnsafeCell},
    panic::{RefUnwindSafe, UnwindSafe},
    sync::atomic::{AtomicBool, AtomicPtr, Ordering},
    thread::{self, Thread},
};

#[derive(Debug)]
pub(crate) struct OnceCell<T> {
    // This `queue` field is the core of the implementation. It encodes two
    // pieces of information:
    //
    // * The current state of the cell (`INCOMPLETE`, `RUNNING`, `COMPLETE`)
    // * Linked list of threads waiting for the current cell.
    //
    // State is encoded in two low bits. Only `INCOMPLETE` and `RUNNING` states
    // allow waiters.
    queue: AtomicPtr<Waiter>,
    value: UnsafeCell<Option<T>>,
}

// Why do we need `T: Send`?
// Thread A creates a `OnceCell` and shares it with
// scoped thread B, which fills the cell, which is
// then destroyed by A. That is, destructor observes
// a sent value.
unsafe impl<T: Sync + Send> Sync for OnceCell<T> {}
unsafe impl<T: Send> Send for OnceCell<T> {}

impl<T: RefUnwindSafe + UnwindSafe> RefUnwindSafe for OnceCell<T> {}
impl<T: UnwindSafe> UnwindSafe for OnceCell<T> {}

impl<T> OnceCell<T> {
    pub(crate) const fn new() -> OnceCell<T> {
        OnceCell { queue: AtomicPtr::new(INCOMPLETE_PTR), value: UnsafeCell::new(None) }
    }

    pub(crate) const fn with_value(value: T) -> OnceCell<T> {
        OnceCell { queue: AtomicPtr::new(COMPLETE_PTR), value: UnsafeCell::new(Some(value)) }
    }

    /// Safety: synchronizes with store to value via Release/(Acquire|SeqCst).
    #[inline]
    pub(crate) fn is_initialized(&self) -> bool {
        // An `Acquire` load is enough because that makes all the initialization
        // operations visible to us, and, this being a fast path, weaker
        // ordering helps with performance. This `Acquire` synchronizes with
        // `SeqCst` operations on the slow path.
        self.queue.load(Ordering::Acquire) == COMPLETE_PTR
    }

    /// Safety: synchronizes with store to value via SeqCst read from state,
    /// writes value only once because we never get to INCOMPLETE state after a
    /// successful write.
    #[cold]
    pub(crate) fn initialize<F, E>(&self, f: F) -> Result<(), E>
    where
        F: FnOnce() -> Result<T, E>,
    {
        let mut f = Some(f);
        let mut res: Result<(), E> = Ok(());
        let slot: *mut Option<T> = self.value.get();
        initialize_or_wait(
            &self.queue,
            Some(&mut || {
                let f = unsafe { f.take().unwrap_unchecked() };
                match f() {
                    Ok(value) => {
                        unsafe { *slot = Some(value) };
                        true
                    }
                    Err(err) => {
                        res = Err(err);
                        false
                    }
                }
            }),
        );
        res
    }

    #[cold]
    pub(crate) fn wait(&self) {
        initialize_or_wait(&self.queue, None);
    }

    /// Get the reference to the underlying value, without checking if the cell
    /// is initialized.
    ///
    /// # Safety
    ///
    /// Caller must ensure that the cell is in initialized state, and that
    /// the contents are acquired by (synchronized to) this thread.
    pub(crate) unsafe fn get_unchecked(&self) -> &T {
        debug_assert!(self.is_initialized());
        let slot = &*self.value.get();
        slot.as_ref().unwrap_unchecked()
    }

    /// Gets the mutable reference to the underlying value.
    /// Returns `None` if the cell is empty.
    pub(crate) fn get_mut(&mut self) -> Option<&mut T> {
        // Safe b/c we have a unique access.
        unsafe { &mut *self.value.get() }.as_mut()
    }

    /// Consumes this `OnceCell`, returning the wrapped value.
    /// Returns `None` if the cell was empty.
    #[inline]
    pub(crate) fn into_inner(self) -> Option<T> {
        // Because `into_inner` takes `self` by value, the compiler statically
        // verifies that it is not currently borrowed.
        // So, it is safe to move out `Option<T>`.
        self.value.into_inner()
    }
}

// Three states that a OnceCell can be in, encoded into the lower bits of `queue` in
// the OnceCell structure.
const INCOMPLETE: usize = 0x0;
const RUNNING: usize = 0x1;
const COMPLETE: usize = 0x2;
const INCOMPLETE_PTR: *mut Waiter = INCOMPLETE as *mut Waiter;
const COMPLETE_PTR: *mut Waiter = COMPLETE as *mut Waiter;

// Mask to learn about the state. All other bits are the queue of waiters if
// this is in the RUNNING state.
const STATE_MASK: usize = 0x3;

/// Representation of a node in the linked list of waiters in the RUNNING state.
/// A waiters is stored on the stack of the waiting threads.
#[repr(align(4))] // Ensure the two lower bits are free to use as state bits.
struct Waiter {
    thread: Cell<Option<Thread>>,
    signaled: AtomicBool,
    next: *mut W
```
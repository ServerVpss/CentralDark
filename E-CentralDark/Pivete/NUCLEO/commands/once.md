# COMANDO - once.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\parking_lot-0.12.5\src\once.rs
**SHA:** 58c78dba952e217c
**Timestamp:** 2026-08-28T02:34:54.381930
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// static START: Once = Once::new();
- static mut RUN: bool = false;
- RUN = true;
- RUN = true;

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2016 Amanieu d'Antras
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.

use crate::util::UncheckedOptionExt;
use core::{
    fmt, mem,
    sync::atomic::{fence, AtomicU8, Ordering},
};
use parking_lot_core::{self, SpinWait, DEFAULT_PARK_TOKEN, DEFAULT_UNPARK_TOKEN};

const DONE_BIT: u8 = 1;
const POISON_BIT: u8 = 2;
const LOCKED_BIT: u8 = 4;
const PARKED_BIT: u8 = 8;

/// Current state of a `Once`.
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum OnceState {
    /// A closure has not been executed yet
    New,

    /// A closure was executed but panicked.
    Poisoned,

    /// A thread is currently executing a closure.
    InProgress,

    /// A closure has completed successfully.
    Done,
}

impl OnceState {
    /// Returns whether the associated `Once` has been poisoned.
    ///
    /// Once an initialization routine for a `Once` has panicked it will forever
    /// indicate to future forced initialization routines that it is poisoned.
    #[inline]
    pub fn poisoned(self) -> bool {
        matches!(self, OnceState::Poisoned)
    }

    /// Returns whether the associated `Once` has successfully executed a
    /// closure.
    #[inline]
    pub fn done(self) -> bool {
        matches!(self, OnceState::Done)
    }
}

/// A synchronization primitive which can be used to run a one-time
/// initialization. Useful for one-time initialization for globals, FFI or
/// related functionality.
///
/// # Differences from the standard library `Once`
///
/// - Only requires 1 byte of space, instead of 1 word.
/// - Not required to be `'static`.
/// - Relaxed memory barriers in the fast path, which can significantly improve
///   performance on some architectures.
/// - Efficient handling of micro-contention using adaptive spinning.
///
/// # Examples
///
/// ```
/// use parking_lot::Once;
///
/// static START: Once = Once::new();
///
/// START.call_once(|| {
///     // run initialization here
/// });
/// ```
pub struct Once(AtomicU8);

impl Once {
    /// Creates a new `Once` value.
    #[inline]
    pub const fn new() -> Once {
        Once(AtomicU8::new(0))
    }

    /// Returns the current state of this `Once`.
    #[inline]
    pub fn state(&self) -> OnceState {
        let state = self.0.load(Ordering::Acquire);
        if state & DONE_BIT != 0 {
            OnceState::Done
        } else if state & LOCKED_BIT != 0 {
            OnceState::InProgress
        } else if state & POISON_BIT != 0 {
            OnceState::Poisoned
        } else {
            OnceState::New
        }
    }

    /// Performs an initialization routine once and only once. The given closure
    /// will be executed if this is the first time `call_once` has been called,
    /// and otherwise the routine will *not* be invoked.
    ///
    /// This method will block the calling thread if another initialization
    /// routine is currently running.
    ///
    /// When this function returns, it is guaranteed that some initialization
    /// has run and completed (it may not be the closure specified). It is also
    /// guaranteed that any memory writes performed by the executed closure can
    /// be reliably observed by other threads at this point (there is a
    /// happens-before relation between the closure and code executing after the
    /// return).
    ///
    /// # Examples
    ///
    /// ```
    /// use parking_lot::Once;
    ///
    /// static mut VAL: usize = 0;
    /// static INIT: Once = Once::new();
    ///
    /// // Accessing a `static mut` is unsafe much of the time, but if we do so
    /// // in a synchronized fashion (e.g. write once or read all) then we're
    /// // good to go!
    /// //
    /// // This function will only call `expensive_computation` once, and will
    /// // otherwise always return the value returned from the first invocation.
    /// fn get_cached_val() -> usize {
    ///     unsafe {
    ///         INIT.call_once(|| {
    ///             VAL = expensive_computation();
    ///         });
    ///         VAL
    ///     }
    /// }
    ///
    /// fn expensive_computation() -> usize {
    ///     // ...
    /// # 2
    /// }
    /// ```
    ///
    /// # Panics
    ///
    /// The closure `f` will only be executed once if this is called
    /// concurrently amongst many threads. If that closure panics, however, then
    /// it will *poison* this `Once` instance, causing all future invocations of
    /// `call_once` to also panic.
    #[inline]
    pub fn call_once<F>(&self, f: F)
    where
        F: FnOnce(),
    {
        if self.0.load(Ordering::Acquire) == DONE_BIT {
            return;
        }

        let mut f = Some(f);
        self.call_once_slow(false, &mut |_| unsafe { f.take().unchecked_unwrap()() });
    }

    /// Perfor
```
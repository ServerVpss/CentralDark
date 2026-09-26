# OUTRO - set_once.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\sync\set_once.rs
**SHA:** 76306f779d76f629
**Timestamp:** 2026-08-28T02:36:20.084102
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Use get_mut()
- // TODO: Use get_mut()

### Ouro Bruto (primeiros 5000 chars)
```
use super::Notify;

use crate::loom::cell::UnsafeCell;
use crate::loom::sync::atomic::AtomicBool;

use std::error::Error;
use std::fmt;
use std::future::{poll_fn, Future};
use std::mem::MaybeUninit;
use std::ops::Drop;
use std::ptr;
use std::sync::atomic::Ordering;
use std::task::Poll;

// This file contains an implementation of an SetOnce. The value of SetOnce
// can only be modified once during initialization.
//
//  1. When `value_set` is false, the `value` is not initialized and wait()
//      future will keep on waiting.
//  2. When `value_set` is true, the wait() future completes, get() will return
//      Some(&T)
//
// The value cannot be changed after set() is called. Subsequent calls to set()
// will return a `SetOnceError`.

/// A thread-safe cell that can be written to only once.
///
/// A `SetOnce` is inspired from python's [`asyncio.Event`] type. It can be
/// used to wait until the value of the `SetOnce` is set like a "Event" mechanism.
///
/// # Example
///
/// ```
/// use tokio::sync::{SetOnce, SetOnceError};
///
/// static ONCE: SetOnce<u32> = SetOnce::const_new();
///
/// # #[tokio::main(flavor = "current_thread")]
/// # async fn main() -> Result<(), SetOnceError<u32>> {
///
/// // set the value inside a task somewhere...
/// tokio::spawn(async move { ONCE.set(20) });
///
/// // checking with .get doesn't block main thread
/// println!("{:?}", ONCE.get());
///
/// // wait until the value is set, blocks the thread
/// println!("{:?}", ONCE.wait().await);
///
/// Ok(())
/// # }
/// ```
///
/// A `SetOnce` is typically used for global variables that need to be
/// initialized once on first use, but need no further changes. The `SetOnce`
/// in Tokio allows the initialization procedure to be asynchronous.
///
/// # Example
///
/// ```
/// use tokio::sync::{SetOnce, SetOnceError};
/// use std::sync::Arc;
///
/// # #[tokio::main(flavor = "current_thread")]
/// # async fn main() -> Result<(), SetOnceError<u32>> {
/// let once = SetOnce::new();
///
/// let arc = Arc::new(once);
/// let first_cl = Arc::clone(&arc);
/// let second_cl = Arc::clone(&arc);
///
/// // set the value inside a task
/// tokio::spawn(async move { first_cl.set(20) }).await.unwrap()?;
///
/// // wait inside task to not block the main thread
/// tokio::spawn(async move {
///     // wait inside async context for the value to be set
///     assert_eq!(*second_cl.wait().await, 20);
/// }).await.unwrap();
///
/// // subsequent set calls will fail
/// assert!(arc.set(30).is_err());
///
/// println!("{:?}", arc.get());
///
/// Ok(())
/// # }
/// ```
///
/// [`asyncio.Event`]: https://docs.python.org/3/library/asyncio-sync.html#asyncio.Event
pub struct SetOnce<T> {
    value_set: AtomicBool,
    value: UnsafeCell<MaybeUninit<T>>,
    notify: Notify,
}

impl<T> Default for SetOnce<T> {
    fn default() -> SetOnce<T> {
        SetOnce::new()
    }
}

impl<T: fmt::Debug> fmt::Debug for SetOnce<T> {
    fn fmt(&self, fmt: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt.debug_struct("SetOnce")
            .field("value", &self.get())
            .finish()
    }
}

impl<T: Clone> Clone for SetOnce<T> {
    fn clone(&self) -> SetOnce<T> {
        SetOnce::new_with(self.get().cloned())
    }
}

impl<T: PartialEq> PartialEq for SetOnce<T> {
    fn eq(&self, other: &SetOnce<T>) -> bool {
        self.get() == other.get()
    }
}

impl<T: Eq> Eq for SetOnce<T> {}

impl<T> Drop for SetOnce<T> {
    fn drop(&mut self) {
        // TODO: Use get_mut()
        if self.value_set.load(Ordering::Relaxed) {
            // SAFETY: If the value_set is true, then the value is initialized
            // then there is a value to be dropped and this is safe
            unsafe { self.value.with_mut(|ptr| ptr::drop_in_place(ptr as *mut T)) }
        }
    }
}

impl<T> From<T> for SetOnce<T> {
    fn from(value: T) -> Self {
        SetOnce {
            value_set: AtomicBool::new(true),
            value: UnsafeCell::new(MaybeUninit::new(value)),
            notify: Notify::new(),
        }
    }
}

impl<T> SetOnce<T> {
    /// Creates a new empty `SetOnce` instance.
    pub fn new() -> Self {
        Self {
            value_set: AtomicBool::new(false),
            value: UnsafeCell::new(MaybeUninit::uninit()),
            notify: Notify::new(),
        }
    }

    /// Creates a new empty `SetOnce` instance.
    ///
    /// Equivalent to `SetOnce::new`, except that it can be used in static
    /// variables.
    ///
    /// When using the `tracing` [unstable feature], a `SetOnce` created with
    /// `const_new` will not be instrumented. As such, it will not be visible
    /// in [`tokio-console`]. Instead, [`SetOnce::new`] should be used to
    /// create an instrumented object if that is needed.
    ///
    /// # Example
    ///
    /// ```
    /// use tokio::sync::{SetOnce, SetOnceError};
    ///
    /// static ONCE: SetOnce<u32> = SetOnce::const_new();
    ///
    /// fn get_global_integer() -> Result<Option<&'static u32>, SetOnceError<u32>> {
    
```
# OUTRO - clock.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\time\clock.rs
**SHA:** a4769f71bbf20a0d
**Timestamp:** 2026-08-28T02:36:20.856066
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ///     let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg_attr(not(feature = "rt"), allow(dead_code))]

//! Source of time abstraction.
//!
//! By default, `std::time::Instant::now()` is used. However, when the
//! `test-util` feature flag is enabled, the values returned for `now()` are
//! configurable.

cfg_not_test_util! {
    use crate::time::{Instant};

    #[derive(Debug, Clone)]
    pub(crate) struct Clock {}

    pub(crate) fn now() -> Instant {
        Instant::from_std(std::time::Instant::now())
    }

    impl Clock {
        pub(crate) fn new(_enable_pausing: bool, _start_paused: bool) -> Clock {
            Clock {}
        }

        pub(crate) fn now(&self) -> Instant {
            now()
        }
    }
}

cfg_test_util! {
    use crate::time::{Duration, Instant};
    use crate::loom::sync::Mutex;
    use crate::loom::sync::atomic::Ordering;
    use std::sync::atomic::AtomicBool as StdAtomicBool;

    cfg_rt! {
        #[track_caller]
        fn with_clock<R>(f: impl FnOnce(Option<&Clock>) -> Result<R, &'static str>) -> R {
            use crate::runtime::Handle;

            let res = match Handle::try_current() {
                Ok(handle) => f(Some(handle.inner.driver().clock())),
                Err(ref e) if e.is_missing_context() => f(None),
                Err(_) => panic!("{}", crate::util::error::THREAD_LOCAL_DESTROYED_ERROR),
            };

            match res {
                Ok(ret) => ret,
                Err(msg) => panic!("{}", msg),
            }
        }
    }

    cfg_not_rt! {
        #[track_caller]
        fn with_clock<R>(f: impl FnOnce(Option<&Clock>) -> Result<R, &'static str>) -> R {
            match f(None) {
                Ok(ret) => ret,
                Err(msg) => panic!("{}", msg),
            }
        }
    }

    /// A handle to a source of time.
    #[derive(Debug)]
    pub(crate) struct Clock {
        inner: Mutex<Inner>,
    }

    // Used to track if the clock was ever paused. This is an optimization to
    // avoid touching the mutex if `test-util` was accidentally enabled in
    // release mode.
    //
    // A static is used so we can avoid accessing the thread-local as well. The
    // `std` AtomicBool is used directly because loom does not support static
    // atomics.
    static DID_PAUSE_CLOCK: StdAtomicBool = StdAtomicBool::new(false);

    #[derive(Debug)]
    struct Inner {
        /// True if the ability to pause time is enabled.
        enable_pausing: bool,

        /// Instant to use as the clock's base instant.
        base: std::time::Instant,

        /// Instant at which the clock was last unfrozen.
        unfrozen: Option<std::time::Instant>,

        /// Number of `inhibit_auto_advance` calls still in effect.
        auto_advance_inhibit_count: usize,
    }

    /// Pauses time.
    ///
    /// The current value of `Instant::now()` is saved and all subsequent calls
    /// to `Instant::now()` will return the saved value. The saved value can be
    /// changed by [`advance`] or by the time auto-advancing once the runtime
    /// has no work to do. This only affects the `Instant` type in Tokio, and
    /// the `Instant` in std continues to work as normal.
    ///
    /// Pausing time requires the `current_thread` Tokio runtime. This is the
    /// default runtime used by `#[tokio::test]`. The runtime can be initialized
    /// with time in a paused state using the `Builder::start_paused` method.
    ///
    /// For cases where time is immediately paused, it is better to pause
    /// the time using the `main` or `test` macro:
    /// ```
    /// #[tokio::main(flavor = "current_thread", start_paused = true)]
    /// async fn main() {
    ///    println!("Hello world");
    /// }
    /// ```
    ///
    /// # Panics
    ///
    /// Panics if time is already frozen or if called from outside of a
    /// `current_thread` Tokio runtime.
    ///
    /// # Auto-advance
    ///
    /// If time is paused and the runtime has no work to do, the clock is
    /// auto-advanced to the next pending timer. This means that [`Sleep`] or
    /// other timer-backed primitives can cause the runtime to advance the
    /// current time when awaited.
    ///
    /// # Preventing auto-advance
    ///
    /// In some testing scenarios, you may want to keep the clock paused without
    /// auto-advancing, even while waiting for I/O or other asynchronous operations.
    /// This can be achieved by using [`spawn_blocking`] to wrap your I/O operations.
    ///
    /// When a blocking task is running, the clock's auto-advance is temporarily
    /// inhibited. This allows you to wait for I/O to complete while keeping the
    /// paused clock stationary:
    ///
    /// ```ignore
    /// use tokio::time::{Duration, Instant};
    /// use tokio::task;
    ///
    /// #[tokio::test(start_paused = true)]
    /// async fn test_with_io() {
    ///     let start = Instant::now();
    ///
    ///     // The clock will NOT auto-advance while this blocking task runs
    ///     let result = task::spawn_blocking(|| {
    
```
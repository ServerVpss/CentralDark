# OUTRO - park.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\park.rs
**SHA:** e5fbfcea0a773242
**Timestamp:** 2026-08-28T02:36:15.599335
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Is this really an unsafe function?

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg_attr(not(feature = "full"), allow(dead_code))]

use crate::loom::sync::atomic::AtomicUsize;
use crate::loom::sync::{Arc, Condvar, Mutex};

use std::sync::atomic::Ordering::SeqCst;
use std::time::Duration;

#[derive(Debug)]
pub(crate) struct ParkThread {
    inner: Arc<Inner>,
}

/// Unblocks a thread that was blocked by `ParkThread`.
#[derive(Clone, Debug)]
pub(crate) struct UnparkThread {
    inner: Arc<Inner>,
}

#[derive(Debug)]
struct Inner {
    state: AtomicUsize,
    mutex: Mutex<()>,
    condvar: Condvar,
}

const EMPTY: usize = 0;
const PARKED: usize = 1;
const NOTIFIED: usize = 2;

tokio_thread_local! {
    static CURRENT_PARKER: ParkThread = ParkThread::new();
}

// Bit of a hack, but it is only for loom
#[cfg(loom)]
tokio_thread_local! {
    pub(crate) static CURRENT_THREAD_PARK_COUNT: AtomicUsize = AtomicUsize::new(0);
}

// ==== impl ParkThread ====

impl ParkThread {
    pub(crate) fn new() -> Self {
        Self {
            inner: Arc::new(Inner {
                state: AtomicUsize::new(EMPTY),
                mutex: Mutex::new(()),
                condvar: Condvar::new(),
            }),
        }
    }

    pub(crate) fn unpark(&self) -> UnparkThread {
        let inner = self.inner.clone();
        UnparkThread { inner }
    }

    pub(crate) fn park(&mut self) {
        #[cfg(loom)]
        CURRENT_THREAD_PARK_COUNT.with(|count| count.fetch_add(1, SeqCst));
        self.inner.park();
    }

    pub(crate) fn park_timeout(&mut self, duration: Duration) {
        #[cfg(loom)]
        CURRENT_THREAD_PARK_COUNT.with(|count| count.fetch_add(1, SeqCst));
        self.inner.park_timeout(duration);
    }

    pub(crate) fn shutdown(&mut self) {
        self.inner.shutdown();
    }
}

// ==== impl Inner ====

impl Inner {
    fn park(&self) {
        // If we were previously notified then we consume this notification and
        // return quickly.
        if self
            .state
            .compare_exchange(NOTIFIED, EMPTY, SeqCst, SeqCst)
            .is_ok()
        {
            return;
        }

        // Otherwise we need to coordinate going to sleep
        let mut m = self.mutex.lock();

        match self.state.compare_exchange(EMPTY, PARKED, SeqCst, SeqCst) {
            Ok(_) => {}
            Err(NOTIFIED) => {
                // We must read here, even though we know it will be `NOTIFIED`.
                // This is because `unpark` may have been called again since we read
                // `NOTIFIED` in the `compare_exchange` above. We must perform an
                // acquire operation that synchronizes with that `unpark` to observe
                // any writes it made before the call to unpark. To do that we must
                // read from the write it made to `state`.
                let old = self.state.swap(EMPTY, SeqCst);
                debug_assert_eq!(old, NOTIFIED, "park state changed unexpectedly");

                return;
            }
            Err(actual) => panic!("inconsistent park state; actual = {actual}"),
        }

        loop {
            m = self.condvar.wait(m).unwrap();

            if self
                .state
                .compare_exchange(NOTIFIED, EMPTY, SeqCst, SeqCst)
                .is_ok()
            {
                // got a notification
                return;
            }

            // spurious wakeup, go back to sleep
        }
    }

    /// Parks the current thread for at most `dur`.
    fn park_timeout(&self, dur: Duration) {
        // Like `park` above we have a fast path for an already-notified thread,
        // and afterwards we start coordinating for a sleep. Return quickly.
        if self
            .state
            .compare_exchange(NOTIFIED, EMPTY, SeqCst, SeqCst)
            .is_ok()
        {
            return;
        }

        if dur == Duration::from_millis(0) {
            return;
        }

        let m = self.mutex.lock();

        match self.state.compare_exchange(EMPTY, PARKED, SeqCst, SeqCst) {
            Ok(_) => {}
            Err(NOTIFIED) => {
                // We must read again here, see `park`.
                let old = self.state.swap(EMPTY, SeqCst);
                debug_assert_eq!(old, NOTIFIED, "park state changed unexpectedly");

                return;
            }
            Err(actual) => panic!("inconsistent park_timeout state; actual = {actual}"),
        }

        #[cfg(not(all(target_family = "wasm", not(target_feature = "atomics"))))]
        // Wait with a timeout, and if we spuriously wake up or otherwise wake up
        // from a notification, we just want to unconditionally set the state back to
        // empty, either consuming a notification or un-flagging ourselves as
        // parked.
        let (_m, _result) = self.condvar.wait_timeout(m, dur).unwrap();

        #[cfg(all(target_family = "wasm", not(target_feature = "atomics")))]
        // Wasm without atomics doesn't have threads, so just sleep.
        {
            let _m = m;
            std
```
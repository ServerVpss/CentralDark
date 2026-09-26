# MISSAO - driver.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\io\driver.rs
**SHA:** d065144603e9d543
**Timestamp:** 2026-08-28T02:36:16.857754
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: move this logic to `RegistrationSet` and use a `CountedLinkedList`

### Ouro Bruto (primeiros 5000 chars)
```
// Signal handling
cfg_signal_internal_and_unix! {
    mod signal;
}
cfg_io_uring! {
    mod uring;
    use uring::UringContext;
    use crate::sync::OnceCell;
}

use crate::io::interest::Interest;
use crate::io::ready::Ready;
use crate::loom::sync::Mutex;
use crate::runtime::driver;
use crate::runtime::io::registration_set;
use crate::runtime::io::{IoDriverMetrics, RegistrationSet, ScheduledIo};

use mio::event::Source;
use std::fmt;
use std::io;
use std::sync::Arc;
use std::time::Duration;

/// I/O driver, backed by Mio.
pub(crate) struct Driver {
    /// True when an event with the signal token is received
    signal_ready: bool,

    /// Reuse the `mio::Events` value across calls to poll.
    events: mio::Events,

    /// The system event queue.
    poll: mio::Poll,
}

/// A reference to an I/O driver.
pub(crate) struct Handle {
    /// Registers I/O resources.
    registry: mio::Registry,

    /// Tracks all registrations
    registrations: RegistrationSet,

    /// State that should be synchronized
    synced: Mutex<registration_set::Synced>,

    /// Used to wake up the reactor from a call to `turn`.
    /// Not supported on `Wasi` due to lack of threading support.
    #[cfg(not(target_os = "wasi"))]
    waker: mio::Waker,

    pub(crate) metrics: IoDriverMetrics,

    #[cfg(all(
        tokio_unstable,
        feature = "io-uring",
        feature = "rt",
        feature = "fs",
        target_os = "linux",
    ))]
    pub(crate) uring_context: Mutex<UringContext>,

    #[cfg(all(
        tokio_unstable,
        feature = "io-uring",
        feature = "rt",
        feature = "fs",
        target_os = "linux",
    ))]
    pub(crate) uring_probe: OnceCell<Option<io_uring::Probe>>,
}

#[derive(Debug)]
pub(crate) struct ReadyEvent {
    pub(super) tick: u8,
    pub(crate) ready: Ready,
    pub(super) is_shutdown: bool,
}

cfg_net_unix!(
    impl ReadyEvent {
        pub(crate) fn with_ready(&self, ready: Ready) -> Self {
            Self {
                ready,
                tick: self.tick,
                is_shutdown: self.is_shutdown,
            }
        }
    }
);

#[derive(Debug, Eq, PartialEq, Clone, Copy)]
pub(super) enum Direction {
    Read,
    Write,
}

pub(super) enum Tick {
    Set,
    Clear(u8),
}

const TOKEN_WAKEUP: mio::Token = mio::Token(0);
const TOKEN_SIGNAL: mio::Token = mio::Token(1);

fn _assert_kinds() {
    fn _assert<T: Send + Sync>() {}

    _assert::<Handle>();
}

// ===== impl Driver =====

impl Driver {
    /// Creates a new event loop, returning any error that happened during the
    /// creation.
    pub(crate) fn new(nevents: usize) -> io::Result<(Driver, Handle)> {
        let poll = mio::Poll::new()?;
        #[cfg(not(target_os = "wasi"))]
        let waker = mio::Waker::new(poll.registry(), TOKEN_WAKEUP)?;
        let registry = poll.registry().try_clone()?;

        let driver = Driver {
            signal_ready: false,
            events: mio::Events::with_capacity(nevents),
            poll,
        };

        let (registrations, synced) = RegistrationSet::new();

        let handle = Handle {
            registry,
            registrations,
            synced: Mutex::new(synced),
            #[cfg(not(target_os = "wasi"))]
            waker,
            metrics: IoDriverMetrics::default(),
            #[cfg(all(
                tokio_unstable,
                feature = "io-uring",
                feature = "rt",
                feature = "fs",
                target_os = "linux",
            ))]
            uring_context: Mutex::new(UringContext::new()),
            #[cfg(all(
                tokio_unstable,
                feature = "io-uring",
                feature = "rt",
                feature = "fs",
                target_os = "linux",
            ))]
            uring_probe: OnceCell::new(),
        };

        Ok((driver, handle))
    }

    pub(crate) fn park(&mut self, rt_handle: &driver::Handle) {
        let handle = rt_handle.io();
        self.turn(handle, None);
    }

    pub(crate) fn park_timeout(&mut self, rt_handle: &driver::Handle, duration: Duration) {
        let handle = rt_handle.io();
        self.turn(handle, Some(duration));
    }

    pub(crate) fn shutdown(&mut self, rt_handle: &driver::Handle) {
        let handle = rt_handle.io();
        let ios = handle.registrations.shutdown(&mut handle.synced.lock());

        // `shutdown()` must be called without holding the lock.
        for io in ios {
            io.shutdown();
        }
    }

    fn turn(&mut self, handle: &Handle, max_wait: Option<Duration>) {
        debug_assert!(!handle.registrations.is_shutdown(&handle.synced.lock()));

        handle.release_pending_registrations();

        let events = &mut self.events;

        // Block waiting for an event to happen, peeling out how many events
        // happened.
        match self.poll.poll(events, max_wait) {
            Ok(()) => {}
            Err(ref e) if e.kind() == io::ErrorKind::Interrupted => {}
          
```
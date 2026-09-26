# MISSAO - poll.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\mio-1.2.2\src\sys\unix\selector\poll.rs
**SHA:** 6ecf10be74e13033
**Timestamp:** 2026-08-28T02:34:50.913962
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this

### Ouro Bruto (primeiros 5000 chars)
```
// This implementation is based on the one in the `polling` crate.
// Thanks to https://github.com/Kestrer for the original implementation!
// Permission to use this code has been granted by original author:
// https://github.com/tokio-rs/mio/pull/1602#issuecomment-1218441031

use std::collections::HashMap;
use std::fmt::{Debug, Formatter};
#[cfg(not(target_os = "hermit"))]
use std::os::fd::RawFd;
// TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this
// can use `std::os::fd` and be merged with the above.
#[cfg(target_os = "hermit")]
use std::os::hermit::io::RawFd;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::{Arc, Condvar, Mutex};
use std::time::Duration;
use std::{cmp, fmt, io};

use crate::sys::unix::waker::Waker as WakerInternal;
use crate::{Interest, Token};

/// Unique id for use as `SelectorId`.
#[cfg(debug_assertions)]
static NEXT_ID: AtomicUsize = AtomicUsize::new(1);

#[derive(Debug)]
pub struct Selector {
    state: Arc<SelectorState>,
}

impl Selector {
    pub fn new() -> io::Result<Selector> {
        let state = SelectorState::new()?;

        Ok(Selector {
            state: Arc::new(state),
        })
    }

    pub fn try_clone(&self) -> io::Result<Selector> {
        let state = self.state.clone();

        Ok(Selector { state })
    }

    pub fn select(&self, events: &mut Events, timeout: Option<Duration>) -> io::Result<()> {
        self.state.select(events, timeout)
    }

    #[cfg_attr(target_os = "horizon", allow(dead_code))]
    pub fn register(&self, fd: RawFd, token: Token, interests: Interest) -> io::Result<()> {
        self.state.register(fd, token, interests)
    }

    #[allow(dead_code)]
    pub(crate) fn register_internal(
        &self,
        fd: RawFd,
        token: Token,
        interests: Interest,
    ) -> io::Result<Arc<RegistrationRecord>> {
        self.state.register_internal(fd, token, interests)
    }

    cfg_any_os_ext! {
    pub fn reregister(&self, fd: RawFd, token: Token, interests: Interest) -> io::Result<()> {
        self.state.reregister(fd, token, interests)
    }

    pub fn deregister(&self, fd: RawFd) -> io::Result<()> {
        self.state.deregister(fd)
    }
    }

    #[cfg(not(any(target_os = "horizon", target_os = "wasi")))]
    pub fn wake(&self, token: Token) -> io::Result<()> {
        self.state.wake(token)
    }

    cfg_io_source! {
        #[cfg(debug_assertions)]
        pub fn id(&self) -> usize {
            self.state.id
        }
    }
}

/// Interface to poll.
#[derive(Debug)]
struct SelectorState {
    /// File descriptors to poll.
    fds: Mutex<Fds>,

    /// File descriptors which will be removed before the next poll call.
    ///
    /// When a file descriptor is deregistered while a poll is running, we need to filter
    /// out all removed descriptors after that poll is finished running.
    pending_removal: Mutex<Vec<RawFd>>,

    /// Token associated with Waker that have recently asked to wake.  This will
    /// cause a synthetic behaviour where on any wakeup we add all pending tokens
    /// to the list of emitted events.
    pending_wake_token: Mutex<Option<Token>>,

    /// Data is written to this to wake up the current instance of `wait`, which can occur when the
    /// user notifies it (in which case `notified` would have been set) or when an operation needs
    /// to occur (in which case `waiting_operations` would have been incremented).
    notify_waker: WakerInternal,

    /// The number of operations (`add`, `modify` or `delete`) that are currently waiting on the
    /// mutex to become free. When this is nonzero, `wait` must be suspended until it reaches zero
    /// again.
    waiting_operations: AtomicUsize,
    /// The condition variable that gets notified when `waiting_operations` reaches zero or
    /// `notified` becomes true.
    ///
    /// This is used with the `fds` mutex.
    operations_complete: Condvar,

    /// This selectors id.
    #[cfg(debug_assertions)]
    #[allow(dead_code)]
    id: usize,
}

/// The file descriptors to poll in a `Poller`.
#[derive(Debug, Clone)]
struct Fds {
    /// The list of `pollfds` taken by poll.
    ///
    /// The first file descriptor is always present and is used to notify the poller.
    poll_fds: Vec<PollFd>,
    /// The map of each file descriptor to data associated with it. This does not include the file
    /// descriptors created by the internal notify waker.
    fd_data: HashMap<RawFd, FdData>,
}

/// Transparent wrapper around `libc::pollfd`, used to support `Debug` derives without adding the
/// `extra_traits` feature of `libc`.
#[repr(transparent)]
#[derive(Clone)]
struct PollFd(libc::pollfd);

impl Debug for PollFd {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        f.debug_struct("pollfd")
            .field("fd", &self.0.fd)
            .field("events", &self.0.events)
            .field("revents", &self.0.revents)
            .finish()
    }
}

/// Data associated with a file
```
# OUTRO - event_ports.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\mio-1.2.2\src\sys\unix\selector\event_ports.rs
**SHA:** cbc5d9a64a4e24ad
**Timestamp:** 2026-08-28T02:34:50.738931
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use std::collections::HashMap;
use std::ops::{Deref, DerefMut};
use std::os::fd::{AsFd, AsRawFd, BorrowedFd, FromRawFd, OwnedFd, RawFd};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::{cmp, io};

use crate::{Interest, Token};

/// Unique id for use as `SelectorId`.
#[cfg(debug_assertions)]
static NEXT_ID: AtomicUsize = AtomicUsize::new(1);

type EventMask = libc::c_int;

const READ_EVENTS: EventMask = libc::POLLIN as EventMask;
const WRITE_EVENTS: EventMask = libc::POLLOUT as EventMask;
const ERROR_EVENTS: EventMask = libc::POLLERR as EventMask | libc::POLLHUP as EventMask;

#[derive(Debug)]
pub struct Selector {
    #[cfg(debug_assertions)]
    id: usize,
    port: OwnedFd,
    state: Arc<SelectorState>,
    events: EventBuffer,
}

#[derive(Debug)]
struct EventBuffer {
    port_events: Vec<libc::port_event>,
    poll_fds: Vec<libc::pollfd>,
}

impl EventBuffer {
    fn new() -> EventBuffer {
        EventBuffer {
            port_events: Vec::new(),
            poll_fds: Vec::new(),
        }
    }
}

// SAFETY: `EventBuffer` is only scratch storage for `port_getn` and `poll`
// results and is only accessed through `Selector::select`, which requires
// `&mut self`.
unsafe impl Send for EventBuffer {}
unsafe impl Sync for EventBuffer {}

#[derive(Debug)]
struct SelectorState {
    fds: Mutex<HashMap<RawFd, FdData>>,
}

#[derive(Debug)]
struct FdData {
    token: Token,
    interests: Interest,
    generation: usize,
    associated: bool,
    needs_fallback: bool,
    fallback_writable: bool,
}

impl Selector {
    pub fn new() -> io::Result<Selector> {
        // SAFETY: `port_create(3C)` returns a valid fd on success.
        let port = unsafe { OwnedFd::from_raw_fd(syscall!(port_create())?) };
        syscall!(fcntl(port.as_raw_fd(), libc::F_SETFD, libc::FD_CLOEXEC))?;

        Ok(Selector {
            #[cfg(debug_assertions)]
            id: NEXT_ID.fetch_add(1, Ordering::Relaxed),
            port,
            events: EventBuffer::new(),
            state: Arc::new(SelectorState {
                fds: Mutex::new(HashMap::new()),
            }),
        })
    }

    pub fn try_clone(&self) -> io::Result<Selector> {
        self.port.try_clone().map(|port| Selector {
            // It's the same selector, so we use the same id.
            #[cfg(debug_assertions)]
            id: self.id,
            port,
            events: EventBuffer::new(),
            state: Arc::clone(&self.state),
        })
    }

    pub fn select(&mut self, events: &mut Events, timeout: Option<Duration>) -> io::Result<()> {
        self.state
            .select(self.port.as_raw_fd(), events, timeout, &mut self.events)
    }

    cfg_io_source! {
    #[allow(dead_code)]
    pub fn register(&self, fd: RawFd, token: Token, interests: Interest) -> io::Result<()> {
        self.register_internal(fd, token, interests).map(|_| ())
    }

    pub(crate) fn register_internal(
        &self,
        fd: RawFd,
        token: Token,
        interests: Interest,
    ) -> io::Result<Arc<RegistrationRecord>> {
        self.state
            .register(self.port.as_raw_fd(), fd, token, interests)
    }
    }

    cfg_any_os_ext! {
    pub fn reregister(&self, fd: RawFd, token: Token, interests: Interest) -> io::Result<()> {
        self.state.reregister(self.port.as_raw_fd(), fd, token, interests)
    }

    pub fn deregister(&self, fd: RawFd) -> io::Result<()> {
        self.state.deregister(self.port.as_raw_fd(), fd)
    }
    }

    pub fn wake(&self, token: Token) -> io::Result<()> {
        self.state.wake(self.port.as_raw_fd(), token)
    }
}

cfg_io_source! {
    impl Selector {
        #[cfg(debug_assertions)]
        pub fn id(&self) -> usize {
            self.id
        }
    }
}

impl SelectorState {
    fn select(
        &self,
        port: RawFd,
        events: &mut Events,
        timeout: Option<Duration>,
        event_buffer: &mut EventBuffer,
    ) -> io::Result<()> {
        events.clear();

        if events.capacity() == 0 {
            return Ok(());
        }

        event_buffer.port_events.clear();
        if event_buffer.port_events.capacity() < events.capacity() {
            event_buffer
                .port_events
                .reserve(events.capacity() - event_buffer.port_events.capacity());
        }

        let start = Instant::now();
        let mut attempted = false;

        loop {
            let current_timeout = if attempted {
                match timeout {
                    Some(timeout) => match timeout.checked_sub(start.elapsed()) {
                        Some(timeout) => Some(timeout),
                        None => return Ok(()),
                    },
                    None => None,
                }
            } else {
                timeout
            };
            let poll_fallback_on_timeout = current_timeout.is_none() && self.has_fallback_fds();
            let current_timeout = current_timeout.or_
```
# MISSAO - uring.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\io\driver\uring.rs
**SHA:** 9d178edd63d9575d
**Timestamp:** 2026-08-28T02:36:17.128938
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- /// TODO: This would like to be a synchronous function,

### Ouro Bruto (primeiros 5000 chars)
```
use io_uring::{squeue::Entry, IoUring, Probe};
use mio::unix::SourceFd;
use slab::Slab;

use crate::runtime::driver::op::CancelData;
use crate::runtime::driver::op::CqeResult;
use crate::runtime::driver::op::{Cancellable, Lifecycle};
use crate::{io::Interest, loom::sync::Mutex};

use super::{Handle, TOKEN_WAKEUP};

use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::{io, mem, task::Waker};

const DEFAULT_RING_SIZE: u32 = 256;

pub(crate) struct UringContext {
    pub(crate) uring: Option<io_uring::IoUring>,
    pub(crate) ops: slab::Slab<Lifecycle>,
}

impl UringContext {
    pub(crate) fn new() -> Self {
        Self {
            ops: Slab::new(),
            uring: None,
        }
    }

    pub(crate) fn ring(&self) -> &io_uring::IoUring {
        self.uring.as_ref().expect("io_uring not initialized")
    }

    pub(crate) fn ring_mut(&mut self) -> &mut io_uring::IoUring {
        self.uring.as_mut().expect("io_uring not initialized")
    }

    /// Perform `io_uring_setup` system call, and Returns true if this
    /// actually initialized the io_uring.
    ///
    /// If the machine doesn't support io_uring, then this will return an
    /// `ENOSYS` error.
    pub(crate) fn try_init(&mut self, probe: &mut Probe) -> io::Result<bool> {
        if self.uring.is_some() {
            // Already initialized.
            return Ok(false);
        }

        let uring = IoUring::new(DEFAULT_RING_SIZE)?;

        match uring.submitter().register_probe(probe) {
            Ok(_) => {}
            Err(e) if e.raw_os_error() == Some(libc::EINVAL) => {
                // The kernel does not support IORING_REGISTER_PROBE.
                return Err(io::Error::from_raw_os_error(libc::ENOSYS));
            }
            Err(e) => return Err(e),
        }

        self.uring.replace(uring);

        Ok(true)
    }

    pub(crate) fn dispatch_completions(&mut self) {
        let ops = &mut self.ops;
        let Some(mut uring) = self.uring.take() else {
            // Uring is not initialized yet.
            return;
        };

        let cq = uring.completion();

        for cqe in cq {
            let idx = cqe.user_data() as usize;

            match ops.get_mut(idx) {
                Some(Lifecycle::Waiting(waker)) => {
                    waker.wake_by_ref();
                    *ops.get_mut(idx).unwrap() = Lifecycle::Completed(cqe);
                }
                Some(Lifecycle::Cancelled(cancel_data)) => {
                    if let CancelData::Open(_) = cancel_data {
                        if let Ok(fd) = CqeResult::from(cqe).result {
                            // SAFETY: the successful CQE result provides
                            // a non-negative integer, and the event is
                            // related to an open operation.
                            unsafe { OwnedFd::from_raw_fd(fd as i32) };
                        }
                    }
                    // Op future was cancelled, so we discard the result.
                    ops.remove(idx);
                }
                Some(other) => {
                    panic!("unexpected lifecycle for slot {idx}: {other:?}");
                }
                None => {
                    panic!("no op at index {idx}");
                }
            }
        }

        self.uring.replace(uring);

        // `cq`'s drop gets called here, updating the latest head pointer
    }

    pub(crate) fn submit(&mut self) -> io::Result<()> {
        loop {
            // Errors from io_uring_enter: https://man7.org/linux/man-pages/man2/io_uring_enter.2.html#ERRORS
            match self.ring().submit() {
                Ok(_) => {
                    return Ok(());
                }

                // If the submission queue is full, we dispatch completions and try again.
                Err(ref e) if e.raw_os_error() == Some(libc::EBUSY) => {
                    self.dispatch_completions();
                }
                // For other errors, we currently return the error as is.
                Err(e) => {
                    return Err(e);
                }
            }
        }
    }

    pub(crate) fn remove_op(&mut self, index: usize) -> Lifecycle {
        self.ops.remove(index)
    }
}

/// Drop the driver, cancelling any in-progress ops and waiting for them to terminate.
impl Drop for UringContext {
    fn drop(&mut self) {
        if self.uring.is_none() {
            // Uring is not initialized or not supported.
            return;
        }

        // Make sure we flush the submission queue before dropping the driver.
        while !self.ring_mut().submission().is_empty() {
            self.submit().expect("Internal error when dropping driver");
        }

        let mut ops = std::mem::take(&mut self.ops);

        // Remove all completed ops since we don't need to wait for them.
        ops.retain(|_, lifecycle| !matches!(lifecycle, Lifecycle::Completed(_)));

        while !ops.is_empty() {
            // Wait until at
```
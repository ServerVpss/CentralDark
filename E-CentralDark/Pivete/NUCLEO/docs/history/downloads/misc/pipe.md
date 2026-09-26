---
schedule: every day at 9am
enabled: false
history: false
template: true
title: Accounting follow-through
description: Finds source-backed document and payment gaps without changing the books
featured: false
---

Maintain a reviewable accounting follow-through queue. This is exception detection, not bookkeeping automation.

Read the screenpipe skill first. Call `structured_output` with `get_targets` before searching. The targets include exact schemas, prior output, feedback, and authoritative per-item user state.

First inspect connected sources through the local connections API. Use only connected, explicitly authorized sources and Screenpipe's indexed context. Never read protected folders directly. Never send a request, post a transaction, attach a document, issue a refund, pay an invoice, or alter accounting records.

## Evidence boundary

Only call something `missing` when an authoritative baseline says the record or document should exist and no credible match is present. Useful baselines include an accounting transaction, an issued invoice, an explicit recurring vendor expectation, or a user-provided list. Screen text mentioning an amount or warning is observed context, not financial truth.

If no authoritative baseline is connected or visible, return no missing-item claim. Explain which source is needed in the data-boundary target.

Match cautiously across counterparty, date, amount, currency, invoice/receipt number, and source. Label uncertain matches `needs review`. Never invent an amount or vendor.

## Interactive list items

For the main `list.v1` exception target:

- use a stable `id` derived from the baseline record and exception type;
- make `title` the next human action, such as “find June invoice from Acme”;
- use `subtitle` for the precise gap and matching uncertainty;
- use `status` as `missing`, `possible match`, `waiting`, or `overdue`;
- use `dueAt` only when the source provides it;
- use `source` for the authoritative baseline and evidence source;
- use `resolveLabel`: `matched`;
- use actions `resolve`, `snooze`, `correct`, `dismiss`, and `handoff`.

Honor user corrections and item state exactly. Do not resurface dismissed, resolved, or currently snoozed exceptions as active. Keep the queue to at most 12 items, ranked by financial timing and evidence strength.

Fill all supported assigned targets. Coverage metrics require a real denominator. The matched table must contain only source-backed matches. The timeline is a receipt of material changes, not a list of every scan.


---

# OUTRO - pipe.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\mio-1.2.2\src\sys\unix\waker\pipe.rs
**SHA:** 06032c3dd49a77eb
**Timestamp:** 2026-08-28T02:34:51.063225
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this

### Ouro Bruto (primeiros 5000 chars)
```
use std::fs::File;
use std::io::{self, Read, Write};
#[cfg(not(target_os = "hermit"))]
use std::os::fd::{AsRawFd, FromRawFd, RawFd};
// TODO: once <https://github.com/rust-lang/rust/issues/126198> is fixed this
// can use `std::os::fd` and be merged with the above.
#[cfg(target_os = "hermit")]
use std::os::hermit::io::{AsRawFd, FromRawFd, RawFd};

use crate::sys::unix::pipe;
use crate::sys::Selector;
use crate::{Interest, Token};

/// Waker backed by a unix pipe.
///
/// Waker controls both the sending and receiving ends and empties the pipe
/// if writing to it (waking) fails.
#[derive(Debug)]
pub(crate) struct Waker {
    sender: File,
    receiver: File,
}

impl Waker {
    #[allow(dead_code)] // Not used by the `poll(2)` implementation.
    pub(crate) fn new(selector: &Selector, token: Token) -> io::Result<Waker> {
        let waker = Waker::new_unregistered()?;
        selector.register(waker.receiver.as_raw_fd(), token, Interest::READABLE)?;
        Ok(waker)
    }

    pub(crate) fn new_unregistered() -> io::Result<Waker> {
        let [receiver, sender] = pipe::new_raw()?;
        let sender = unsafe { File::from_raw_fd(sender) };
        let receiver = unsafe { File::from_raw_fd(receiver) };
        Ok(Waker { sender, receiver })
    }

    pub(crate) fn wake(&self) -> io::Result<()> {
        // The epoll emulation on some illumos systems currently requires
        // the pipe buffer to be completely empty for an edge-triggered
        // wakeup on the pipe read side.
        // See https://www.illumos.org/issues/13436.
        #[cfg(target_os = "illumos")]
        self.empty();

        match (&self.sender).write(&[1]) {
            Ok(_) => Ok(()),
            Err(ref err) if err.kind() == io::ErrorKind::WouldBlock => {
                // The reading end is full so we'll empty the buffer and try
                // again.
                self.empty();
                self.wake()
            }
            Err(ref err) if err.kind() == io::ErrorKind::Interrupted => self.wake(),
            Err(err) => Err(err),
        }
    }

    #[allow(dead_code)] // Only used by the `poll(2)` implementation.
    pub(crate) fn ack_and_reset(&self) {
        self.empty();
    }

    #[allow(dead_code)] // Only used by the `poll(2)` implementation.
    pub(crate) fn fd(&self) -> Option<RawFd> {
        Some(self.as_raw_fd())
    }

    /// Only ever `true` for the `single_threaded.rs` implementation.
    #[allow(dead_code)] // Only used by the `poll(2)` implementation.
    pub(crate) fn woken(&self) -> bool {
        false
    }

    /// Empty the pipe's buffer, only need to call this if `wake` fails.
    /// This ignores any errors.
    fn empty(&self) {
        let mut buf = [0; 4096];
        loop {
            match (&self.receiver).read(&mut buf) {
                Ok(n) if n > 0 => continue,
                _ => return,
            }
        }
    }
}

impl AsRawFd for Waker {
    fn as_raw_fd(&self) -> RawFd {
        self.receiver.as_raw_fd()
    }
}

```
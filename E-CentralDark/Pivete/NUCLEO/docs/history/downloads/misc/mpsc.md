# OUTRO - mpsc.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-channel-0.5.16\tests\mpsc.rs
**SHA:** a88f2c756536328a
**Timestamp:** 2026-08-28T02:33:33.483335
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
//! Tests copied from `std::sync::mpsc`.
//!
//! This is a copy of tests for the `std::sync::mpsc` channels from the standard library, but
//! modified to work with `crossbeam-channel` instead.
//!
//! Minor tweaks were needed to make the tests compile:
//!
//! - Replace `box` syntax with `Box::new`.
//! - Replace all uses of `Select` with `select!`.
//! - Change the imports.
//! - Join all spawned threads.
//! - Removed assertion from oneshot_multi_thread_send_close_stress tests.
//!
//! Source:
//!   - https://github.com/rust-lang/rust/tree/master/src/libstd/sync/mpsc
//!
//! Copyright & License:
//!   - Copyright 2013-2014 The Rust Project Developers
//!   - Apache License, Version 2.0 or MIT license, at your option
//!   - https://github.com/rust-lang/rust/blob/master/COPYRIGHT
//!   - https://www.rust-lang.org/en-US/legal.html

#![allow(clippy::match_single_binding, clippy::redundant_clone)]

use std::sync::mpsc::{RecvError, RecvTimeoutError, TryRecvError};
use std::sync::mpsc::{SendError, TrySendError};
use std::thread::JoinHandle;
use std::time::Duration;

use crossbeam_channel as cc;

pub struct Sender<T> {
    pub inner: cc::Sender<T>,
}

impl<T> Sender<T> {
    pub fn send(&self, t: T) -> Result<(), SendError<T>> {
        self.inner.send(t).map_err(|cc::SendError(m)| SendError(m))
    }
}

impl<T> Clone for Sender<T> {
    fn clone(&self) -> Sender<T> {
        Sender {
            inner: self.inner.clone(),
        }
    }
}

pub struct SyncSender<T> {
    pub inner: cc::Sender<T>,
}

impl<T> SyncSender<T> {
    pub fn send(&self, t: T) -> Result<(), SendError<T>> {
        self.inner.send(t).map_err(|cc::SendError(m)| SendError(m))
    }

    pub fn try_send(&self, t: T) -> Result<(), TrySendError<T>> {
        self.inner.try_send(t).map_err(|err| match err {
            cc::TrySendError::Full(m) => TrySendError::Full(m),
            cc::TrySendError::Disconnected(m) => TrySendError::Disconnected(m),
        })
    }
}

impl<T> Clone for SyncSender<T> {
    fn clone(&self) -> SyncSender<T> {
        SyncSender {
            inner: self.inner.clone(),
        }
    }
}

pub struct Receiver<T> {
    pub inner: cc::Receiver<T>,
}

impl<T> Receiver<T> {
    pub fn try_recv(&self) -> Result<T, TryRecvError> {
        self.inner.try_recv().map_err(|err| match err {
            cc::TryRecvError::Empty => TryRecvError::Empty,
            cc::TryRecvError::Disconnected => TryRecvError::Disconnected,
        })
    }

    pub fn recv(&self) -> Result<T, RecvError> {
        self.inner.recv().map_err(|_| RecvError)
    }

    pub fn recv_timeout(&self, timeout: Duration) -> Result<T, RecvTimeoutError> {
        self.inner.recv_timeout(timeout).map_err(|err| match err {
            cc::RecvTimeoutError::Timeout => RecvTimeoutError::Timeout,
            cc::RecvTimeoutError::Disconnected => RecvTimeoutError::Disconnected,
        })
    }

    pub fn iter(&self) -> Iter<'_, T> {
        Iter { inner: self }
    }

    pub fn try_iter(&self) -> TryIter<'_, T> {
        TryIter { inner: self }
    }
}

impl<'a, T> IntoIterator for &'a Receiver<T> {
    type Item = T;
    type IntoIter = Iter<'a, T>;

    fn into_iter(self) -> Iter<'a, T> {
        self.iter()
    }
}

impl<T> IntoIterator for Receiver<T> {
    type Item = T;
    type IntoIter = IntoIter<T>;

    fn into_iter(self) -> IntoIter<T> {
        IntoIter { inner: self }
    }
}

pub struct TryIter<'a, T: 'a> {
    inner: &'a Receiver<T>,
}

impl<'a, T> Iterator for TryIter<'a, T> {
    type Item = T;

    fn next(&mut self) -> Option<T> {
        self.inner.try_recv().ok()
    }
}

pub struct Iter<'a, T: 'a> {
    inner: &'a Receiver<T>,
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = T;

    fn next(&mut self) -> Option<T> {
        self.inner.recv().ok()
    }
}

pub struct IntoIter<T> {
    inner: Receiver<T>,
}

impl<T> Iterator for IntoIter<T> {
    type Item = T;

    fn next(&mut self) -> Option<T> {
        self.inner.recv().ok()
    }
}

pub fn channel<T>() -> (Sender<T>, Receiver<T>) {
    let (s, r) = cc::unbounded();
    let s = Sender { inner: s };
    let r = Receiver { inner: r };
    (s, r)
}

pub fn sync_channel<T>(bound: usize) -> (SyncSender<T>, Receiver<T>) {
    let (s, r) = cc::bounded(bound);
    let s = SyncSender { inner: s };
    let r = Receiver { inner: r };
    (s, r)
}

macro_rules! select {
    (
        $($name:pat = $rx:ident.$meth:ident() => $code:expr),+
    ) => ({
        const _IS_BIASED: bool = false;

        cc::crossbeam_channel_internal! {
            $(
                $meth(($rx).inner) -> res => {
                    let $name = res.map_err(|_| ::std::sync::mpsc::RecvError);
                    $code
                }
            )+
        }
    })
}

// Source: https://github.com/rust-lang/rust/blob/master/src/libstd/sync/mpsc/mod.rs
mod channel_tests {
    use super::*;

    use std::env;
    use std::thread;
    use std::time::Instant;

    pub fn stress_factor() -> usize {
        match en
```
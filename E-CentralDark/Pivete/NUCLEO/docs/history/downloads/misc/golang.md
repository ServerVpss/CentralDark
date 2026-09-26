# OUTRO - golang.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-channel-0.5.16\tests\golang.rs
**SHA:** 7b2ef219ba8a2184
**Timestamp:** 2026-08-28T02:33:33.453199
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = inp.clone();

### Ouro Bruto (primeiros 5000 chars)
```
//! Tests copied from Go and manually rewritten in Rust.
//!
//! Source:
//!   - https://github.com/golang/go
//!
//! Copyright & License:
//!   - Copyright (c) 2009 The Go Authors
//!   - https://golang.org/AUTHORS
//!   - https://golang.org/LICENSE
//!   - https://golang.org/PATENTS

#![allow(clippy::redundant_clone)]

use std::alloc::{GlobalAlloc, Layout, System};
use std::any::Any;
use std::cell::Cell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicI32, AtomicUsize, Ordering::SeqCst};
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::Duration;

use crossbeam_channel::{bounded, never, select, tick, unbounded, Receiver, Select, Sender};

fn ms(ms: u64) -> Duration {
    Duration::from_millis(ms)
}

struct Chan<T> {
    inner: Arc<Mutex<ChanInner<T>>>,
}

struct ChanInner<T> {
    s: Option<Sender<T>>,
    r: Option<Receiver<T>>,
    // Receiver to use when r is None (Go blocks on receiving from nil)
    nil_r: Receiver<T>,
    // Sender to use when s is None (Go blocks on sending to nil)
    nil_s: Sender<T>,
    // Hold this receiver to prevent nil sender channel from disconnection
    _nil_sr: Receiver<T>,
}

impl<T> Clone for Chan<T> {
    fn clone(&self) -> Chan<T> {
        Chan {
            inner: self.inner.clone(),
        }
    }
}

impl<T> Chan<T> {
    fn send(&self, msg: T) {
        let s = self
            .inner
            .lock()
            .unwrap()
            .s
            .as_ref()
            .expect("sending into closed channel")
            .clone();
        let _ = s.send(msg);
    }

    fn try_recv(&self) -> Option<T> {
        let r = self.inner.lock().unwrap().r.as_ref().unwrap().clone();
        r.try_recv().ok()
    }

    fn recv(&self) -> Option<T> {
        let r = self.inner.lock().unwrap().r.as_ref().unwrap().clone();
        r.recv().ok()
    }

    fn close_s(&self) {
        self.inner
            .lock()
            .unwrap()
            .s
            .take()
            .expect("channel sender already closed");
    }

    fn close_r(&self) {
        self.inner
            .lock()
            .unwrap()
            .r
            .take()
            .expect("channel receiver already closed");
    }

    fn has_rx(&self) -> bool {
        self.inner.lock().unwrap().r.is_some()
    }

    fn has_tx(&self) -> bool {
        self.inner.lock().unwrap().s.is_some()
    }

    fn rx(&self) -> Receiver<T> {
        let inner = self.inner.lock().unwrap();
        match inner.r.as_ref() {
            None => inner.nil_r.clone(),
            Some(r) => r.clone(),
        }
    }

    fn tx(&self) -> Sender<T> {
        let inner = self.inner.lock().unwrap();
        match inner.s.as_ref() {
            None => inner.nil_s.clone(),
            Some(s) => s.clone(),
        }
    }
}

impl<T> Iterator for Chan<T> {
    type Item = T;

    fn next(&mut self) -> Option<Self::Item> {
        self.recv()
    }
}

impl<'a, T> IntoIterator for &'a Chan<T> {
    type Item = T;
    type IntoIter = Chan<T>;

    fn into_iter(self) -> Self::IntoIter {
        self.clone()
    }
}

fn make<T>(cap: usize) -> Chan<T> {
    let (s, r) = bounded(cap);
    let (nil_s, _nil_sr) = bounded(0);
    Chan {
        inner: Arc::new(Mutex::new(ChanInner {
            s: Some(s),
            r: Some(r),
            nil_r: never(),
            nil_s,
            _nil_sr,
        })),
    }
}

fn make_unbounded<T>() -> Chan<T> {
    let (s, r) = unbounded();
    let (nil_s, _nil_sr) = bounded(0);
    Chan {
        inner: Arc::new(Mutex::new(ChanInner {
            s: Some(s),
            r: Some(r),
            nil_r: never(),
            nil_s,
            _nil_sr,
        })),
    }
}

#[derive(Clone)]
struct WaitGroup(Arc<WaitGroupInner>);

struct WaitGroupInner {
    cond: Condvar,
    count: Mutex<i32>,
}

impl WaitGroup {
    fn new() -> WaitGroup {
        WaitGroup(Arc::new(WaitGroupInner {
            cond: Condvar::new(),
            count: Mutex::new(0),
        }))
    }

    fn add(&self, delta: i32) {
        let mut count = self.0.count.lock().unwrap();
        *count += delta;
        assert!(*count >= 0);
        self.0.cond.notify_all();
    }

    fn done(&self) {
        self.add(-1);
    }

    fn wait(&self) {
        let mut count = self.0.count.lock().unwrap();
        while *count > 0 {
            count = self.0.cond.wait(count).unwrap();
        }
    }
}

struct Defer<F: FnOnce()> {
    f: Option<Box<F>>,
}

impl<F: FnOnce()> Drop for Defer<F> {
    fn drop(&mut self) {
        let f = self.f.take().unwrap();
        let mut f = Some(f);
        let mut f = move || f.take().unwrap()();
        f();
    }
}

struct Counter;

static ALLOCATED: AtomicUsize = AtomicUsize::new(0);
unsafe impl GlobalAlloc for Counter {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let ret = System.alloc(layout);
        if !ret.is_null() {
            ALLOCATED.fetch_add(layout.size(), SeqCst);
        }
        ret
    }

    unsafe fn dealloc(
```
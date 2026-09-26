# OUTRO - select_macro.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-channel-0.5.16\tests\select_macro.rs
**SHA:** e83bd33b34c47d70
**Timestamp:** 2026-08-28T02:33:33.507900
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = Instant::now();

### Gaps
- #[cfg_attr(crossbeam_sanitize, ignore)] // TODO: flaky: https://github.com/crossbeam-rs/crossbeam/issues/1094

### Ouro Bruto (primeiros 5000 chars)
```
//! Tests for the `select!` macro.

#![forbid(unsafe_code)] // select! is safe.
#![allow(clippy::match_single_binding)]

use std::any::Any;
use std::cell::Cell;
use std::ops::Deref;
use std::thread;
use std::time::{Duration, Instant};

use crossbeam_channel::{after, bounded, never, select, select_biased, tick, unbounded};
use crossbeam_channel::{Receiver, RecvError, SendError, Sender, TryRecvError};
use crossbeam_utils::thread::scope;

fn ms(ms: u64) -> Duration {
    Duration::from_millis(ms)
}

#[test]
fn smoke1() {
    let (s1, r1) = unbounded::<usize>();
    let (s2, r2) = unbounded::<usize>();

    s1.send(1).unwrap();

    select! {
        recv(r1) -> v => assert_eq!(v, Ok(1)),
        recv(r2) -> _ => panic!(),
    }

    s2.send(2).unwrap();

    select! {
        recv(r1) -> _ => panic!(),
        recv(r2) -> v => assert_eq!(v, Ok(2)),
    }
}

#[test]
fn smoke2() {
    let (_s1, r1) = unbounded::<i32>();
    let (_s2, r2) = unbounded::<i32>();
    let (_s3, r3) = unbounded::<i32>();
    let (_s4, r4) = unbounded::<i32>();
    let (s5, r5) = unbounded::<i32>();

    s5.send(5).unwrap();

    select! {
        recv(r1) -> _ => panic!(),
        recv(r2) -> _ => panic!(),
        recv(r3) -> _ => panic!(),
        recv(r4) -> _ => panic!(),
        recv(r5) -> v => assert_eq!(v, Ok(5)),
    }
}

#[test]
fn disconnected() {
    let (s1, r1) = unbounded::<i32>();
    let (s2, r2) = unbounded::<i32>();

    scope(|scope| {
        scope.spawn(|_| {
            drop(s1);
            thread::sleep(ms(500));
            s2.send(5).unwrap();
        });

        select! {
            recv(r1) -> v => assert!(v.is_err()),
            recv(r2) -> _ => panic!(),
            default(ms(1000)) => panic!(),
        }

        r2.recv().unwrap();
    })
    .unwrap();

    select! {
        recv(r1) -> v => assert!(v.is_err()),
        recv(r2) -> _ => panic!(),
        default(ms(1000)) => panic!(),
    }

    scope(|scope| {
        scope.spawn(|_| {
            thread::sleep(ms(500));
            drop(s2);
        });

        select! {
            recv(r2) -> v => assert!(v.is_err()),
            default(ms(1000)) => panic!(),
        }
    })
    .unwrap();
}

#[test]
fn default() {
    let (s1, r1) = unbounded::<i32>();
    let (s2, r2) = unbounded::<i32>();

    select! {
        recv(r1) -> _ => panic!(),
        recv(r2) -> _ => panic!(),
        default => {}
    }

    drop(s1);

    select! {
        recv(r1) -> v => assert!(v.is_err()),
        recv(r2) -> _ => panic!(),
        default => panic!(),
    }

    s2.send(2).unwrap();

    select! {
        recv(r2) -> v => assert_eq!(v, Ok(2)),
        default => panic!(),
    }

    select! {
        recv(r2) -> _ => panic!(),
        default => {},
    }

    select! {
        default => {},
    }
}

#[test]
fn timeout() {
    let (_s1, r1) = unbounded::<i32>();
    let (s2, r2) = unbounded::<i32>();

    scope(|scope| {
        scope.spawn(|_| {
            thread::sleep(ms(1500));
            s2.send(2).unwrap();
        });

        select! {
            recv(r1) -> _ => panic!(),
            recv(r2) -> _ => panic!(),
            default(ms(1000)) => {},
        }

        select! {
            recv(r1) -> _ => panic!(),
            recv(r2) -> v => assert_eq!(v, Ok(2)),
            default(ms(1000)) => panic!(),
        }
    })
    .unwrap();

    scope(|scope| {
        let (s, r) = unbounded::<i32>();

        scope.spawn(move |_| {
            thread::sleep(ms(500));
            drop(s);
        });

        select! {
            default(ms(1000)) => {
                select! {
                    recv(r) -> v => assert!(v.is_err()),
                    default => panic!(),
                }
            }
        }
    })
    .unwrap();
}

#[test]
fn default_when_disconnected() {
    let (_, r) = unbounded::<i32>();

    select! {
        recv(r) -> res => assert!(res.is_err()),
        default => panic!(),
    }

    let (_, r) = unbounded::<i32>();

    select! {
        recv(r) -> res => assert!(res.is_err()),
        default(ms(1000)) => panic!(),
    }

    let (s, _) = bounded::<i32>(0);

    select! {
        send(s, 0) -> res => assert!(res.is_err()),
        default => panic!(),
    }

    let (s, _) = bounded::<i32>(0);

    select! {
        send(s, 0) -> res => assert!(res.is_err()),
        default(ms(1000)) => panic!(),
    }
}

#[test]
fn default_only() {
    let start = Instant::now();
    select! {
        default => {}
    }
    let now = Instant::now();
    assert!(now - start <= ms(50));

    let start = Instant::now();
    select! {
        default(ms(500)) => {}
    }
    let now = Instant::now();
    assert!(now - start >= ms(450));
    assert!(now - start <= ms(550));
}

#[test]
fn unblocks() {
    let (s1, r1) = bounded::<i32>(0);
    let (s2, r2) = bounded::<i32>(0);

    scope(|scope| {
        scope.spawn(|_| {
            thread::sleep(ms(500));
            s2.send(2).unwrap();
        });

        select! {
     
```
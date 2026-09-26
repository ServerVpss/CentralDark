# OUTRO - ready.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-channel-0.5.16\tests\ready.rs
**SHA:** 4361352fa9425404
**Timestamp:** 2026-08-28T02:33:33.492369
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
//! Tests for channel readiness using the `Select` struct.

use std::any::Any;
use std::cell::Cell;
use std::thread;
use std::time::{Duration, Instant};

use crossbeam_channel::{after, bounded, tick, unbounded};
use crossbeam_channel::{Receiver, Select, TryRecvError, TrySendError};
use crossbeam_utils::thread::scope;

fn ms(ms: u64) -> Duration {
    Duration::from_millis(ms)
}

#[test]
fn smoke1() {
    let (s1, r1) = unbounded::<usize>();
    let (s2, r2) = unbounded::<usize>();

    s1.send(1).unwrap();

    let mut sel = Select::new();
    sel.recv(&r1);
    sel.recv(&r2);
    assert_eq!(sel.ready(), 0);
    assert_eq!(r1.try_recv(), Ok(1));

    s2.send(2).unwrap();

    let mut sel = Select::new();
    sel.recv(&r1);
    sel.recv(&r2);
    assert_eq!(sel.ready(), 1);
    assert_eq!(r2.try_recv(), Ok(2));
}

#[test]
fn smoke2() {
    let (_s1, r1) = unbounded::<i32>();
    let (_s2, r2) = unbounded::<i32>();
    let (_s3, r3) = unbounded::<i32>();
    let (_s4, r4) = unbounded::<i32>();
    let (s5, r5) = unbounded::<i32>();

    s5.send(5).unwrap();

    let mut sel = Select::new();
    sel.recv(&r1);
    sel.recv(&r2);
    sel.recv(&r3);
    sel.recv(&r4);
    sel.recv(&r5);
    assert_eq!(sel.ready(), 4);
    assert_eq!(r5.try_recv(), Ok(5));
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

        let mut sel = Select::new();
        sel.recv(&r1);
        sel.recv(&r2);
        match sel.ready_timeout(ms(1000)) {
            Ok(0) => assert_eq!(r1.try_recv(), Err(TryRecvError::Disconnected)),
            _ => panic!(),
        }

        r2.recv().unwrap();
    })
    .unwrap();

    let mut sel = Select::new();
    sel.recv(&r1);
    sel.recv(&r2);
    match sel.ready_timeout(ms(1000)) {
        Ok(0) => assert_eq!(r1.try_recv(), Err(TryRecvError::Disconnected)),
        _ => panic!(),
    }

    scope(|scope| {
        scope.spawn(|_| {
            thread::sleep(ms(500));
            drop(s2);
        });

        let mut sel = Select::new();
        sel.recv(&r2);
        match sel.ready_timeout(ms(1000)) {
            Ok(0) => assert_eq!(r2.try_recv(), Err(TryRecvError::Disconnected)),
            _ => panic!(),
        }
    })
    .unwrap();
}

#[test]
fn default() {
    let (s1, r1) = unbounded::<i32>();
    let (s2, r2) = unbounded::<i32>();

    let mut sel = Select::new();
    sel.recv(&r1);
    sel.recv(&r2);
    assert!(sel.try_ready().is_err());

    drop(s1);

    let mut sel = Select::new();
    sel.recv(&r1);
    sel.recv(&r2);
    match sel.try_ready() {
        Ok(0) => assert!(r1.try_recv().is_err()),
        _ => panic!(),
    }

    s2.send(2).unwrap();

    let mut sel = Select::new();
    sel.recv(&r2);
    match sel.try_ready() {
        Ok(0) => assert_eq!(r2.try_recv(), Ok(2)),
        _ => panic!(),
    }

    let mut sel = Select::new();
    sel.recv(&r2);
    assert!(sel.try_ready().is_err());

    let mut sel = Select::new();
    assert!(sel.try_ready().is_err());
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

        let mut sel = Select::new();
        sel.recv(&r1);
        sel.recv(&r2);
        assert!(sel.ready_timeout(ms(1000)).is_err());

        let mut sel = Select::new();
        sel.recv(&r1);
        sel.recv(&r2);
        match sel.ready_timeout(ms(1000)) {
            Ok(1) => assert_eq!(r2.try_recv(), Ok(2)),
            _ => panic!(),
        }
    })
    .unwrap();

    scope(|scope| {
        let (s, r) = unbounded::<i32>();

        scope.spawn(move |_| {
            thread::sleep(ms(500));
            drop(s);
        });

        let mut sel = Select::new();
        assert!(sel.ready_timeout(ms(1000)).is_err());

        let mut sel = Select::new();
        sel.recv(&r);
        match sel.try_ready() {
            Ok(0) => assert_eq!(r.try_recv(), Err(TryRecvError::Disconnected)),
            _ => panic!(),
        }
    })
    .unwrap();
}

#[test]
fn default_when_disconnected() {
    let (_, r) = unbounded::<i32>();

    let mut sel = Select::new();
    sel.recv(&r);
    match sel.try_ready() {
        Ok(0) => assert_eq!(r.try_recv(), Err(TryRecvError::Disconnected)),
        _ => panic!(),
    }

    let (_, r) = unbounded::<i32>();

    let mut sel = Select::new();
    sel.recv(&r);
    match sel.ready_timeout(ms(1000)) {
        Ok(0) => assert_eq!(r.try_recv(), Err(TryRecvError::Disconnected)),
        _ => panic!(),
    }

    let (s, _) = bounded::<i32>(0);

    let mut sel = Select::new();
    sel.send(&s);
    match sel.try_ready() {
        Ok(0) => assert_eq!(s.try_send(0), Err(TrySendError::Disconnected(0))),
        _ => panic!(),
    }

  
```
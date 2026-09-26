# OUTRO - atomic_cell.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-utils-0.8.22\benches\atomic_cell.rs
**SHA:** c927eb3cd1e5ecc4
**Timestamp:** 2026-08-28T02:33:34.010379
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Barrier::new(THREADS + 1);
- let start = Barrier::new(THREADS + 1);

### Ouro Bruto (primeiros 5000 chars)
```
#![feature(test)]

extern crate test;

use std::sync::Barrier;

use crossbeam_utils::atomic::AtomicCell;
use crossbeam_utils::thread;

#[bench]
fn load_u8(b: &mut test::Bencher) {
    let a = AtomicCell::new(0u8);
    let mut sum = 0;
    b.iter(|| sum += a.load());
    test::black_box(sum);
}

#[bench]
fn store_u8(b: &mut test::Bencher) {
    let a = AtomicCell::new(0u8);
    b.iter(|| a.store(1));
}

#[bench]
fn fetch_add_u8(b: &mut test::Bencher) {
    let a = AtomicCell::new(0u8);
    b.iter(|| a.fetch_add(1));
}

#[bench]
fn compare_exchange_u8(b: &mut test::Bencher) {
    let a = AtomicCell::new(0u8);
    let mut i = 0;
    b.iter(|| {
        let _ = a.compare_exchange(i, i.wrapping_add(1));
        i = i.wrapping_add(1);
    });
}

#[bench]
fn concurrent_load_u8(b: &mut test::Bencher) {
    const THREADS: usize = 2;
    const STEPS: usize = 1_000_000;

    let start = Barrier::new(THREADS + 1);
    let end = Barrier::new(THREADS + 1);
    let exit = AtomicCell::new(false);

    let a = AtomicCell::new(0u8);

    thread::scope(|scope| {
        for _ in 0..THREADS {
            scope.spawn(|_| loop {
                start.wait();

                let mut sum = 0;
                for _ in 0..STEPS {
                    sum += a.load();
                }
                test::black_box(sum);

                end.wait();
                if exit.load() {
                    break;
                }
            });
        }

        start.wait();
        end.wait();

        b.iter(|| {
            start.wait();
            end.wait();
        });

        start.wait();
        exit.store(true);
        end.wait();
    })
    .unwrap();
}

#[bench]
fn load_usize(b: &mut test::Bencher) {
    let a = AtomicCell::new(0usize);
    let mut sum = 0;
    b.iter(|| sum += a.load());
    test::black_box(sum);
}

#[bench]
fn store_usize(b: &mut test::Bencher) {
    let a = AtomicCell::new(0usize);
    b.iter(|| a.store(1));
}

#[bench]
fn fetch_add_usize(b: &mut test::Bencher) {
    let a = AtomicCell::new(0usize);
    b.iter(|| a.fetch_add(1));
}

#[bench]
fn compare_exchange_usize(b: &mut test::Bencher) {
    let a = AtomicCell::new(0usize);
    let mut i = 0;
    b.iter(|| {
        let _ = a.compare_exchange(i, i.wrapping_add(1));
        i = i.wrapping_add(1);
    });
}

#[bench]
fn concurrent_load_usize(b: &mut test::Bencher) {
    const THREADS: usize = 2;
    const STEPS: usize = 1_000_000;

    let start = Barrier::new(THREADS + 1);
    let end = Barrier::new(THREADS + 1);
    let exit = AtomicCell::new(false);

    let a = AtomicCell::new(0usize);

    thread::scope(|scope| {
        for _ in 0..THREADS {
            scope.spawn(|_| loop {
                start.wait();

                let mut sum = 0;
                for _ in 0..STEPS {
                    sum += a.load();
                }
                test::black_box(sum);

                end.wait();
                if exit.load() {
                    break;
                }
            });
        }

        start.wait();
        end.wait();

        b.iter(|| {
            start.wait();
            end.wait();
        });

        start.wait();
        exit.store(true);
        end.wait();
    })
    .unwrap();
}

```
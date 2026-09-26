# OUTRO - instant.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\benchmarks\instant.rs
**SHA:** e8e2f6f7adfe9ee0
**Timestamp:** 2026-08-28T02:36:05.681148
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start: Instant = Instant::now();
- let start = Instant::now();
- let start = StdInstant::now();

### Ouro Bruto (primeiros 5000 chars)
```
#![expect(deprecated)]

use std::time::Instant as StdInstant;

use criterion::Bencher;
use time::ext::NumericalDuration;
use time::{Instant, SignedDuration};

setup_benchmark! {
    "Instant",

    fn checked_add(ben: &mut Bencher<'_>) {
        let instant = Instant::now();
        let dt = 5.seconds();
        ben.iter(|| instant.checked_add(dt));
    }

    fn checked_sub(ben: &mut Bencher<'_>) {
        let instant = Instant::now();
        let dt = 5.seconds();
        ben.iter(|| instant.checked_sub(dt));
    }

    fn sub(ben: &mut Bencher<'_>) {
        let start: Instant = Instant::now();
        let end: Instant = start + 1.milliseconds();
        ben.iter(|| end - start);
    }

    fn add_duration(ben: &mut Bencher<'_>) {
        let start = Instant::now();
        let dt: SignedDuration = 1.seconds();
        ben.iter(|| start + dt);
    }

    fn std_add_duration(ben: &mut Bencher<'_>) {
        let start = StdInstant::now();
        let dt: SignedDuration = 1.milliseconds();
        ben.iter(|| start + dt);
    }

    fn add_assign_duration(ben: &mut Bencher<'_>) {
        let dt: SignedDuration = 1.milliseconds();
        iter_batched_ref!(
            ben,
            Instant::now,
            [|start| *start += dt]
        );
    }

    fn std_add_assign_duration(ben: &mut Bencher<'_>) {
        let dt: SignedDuration = 1.milliseconds();
        iter_batched_ref!(
            ben,
            StdInstant::now,
            [|start| *start += dt]
        );
    }

    fn sub_duration(ben: &mut Bencher<'_>) {
        let instant = Instant::now();
        let dt: SignedDuration = 100.milliseconds();
        ben.iter(|| instant - dt);
    }

    fn std_sub_duration(ben: &mut Bencher<'_>) {
        let instant = StdInstant::now();
        let dt: SignedDuration = 100.milliseconds();
        ben.iter(|| instant - dt);
    }

    fn sub_assign_duration(ben: &mut Bencher<'_>) {
        let dt: SignedDuration = 100.milliseconds();
        iter_batched_ref!(
            ben,
            Instant::now,
            [|instant| *instant -= dt]
        );
    }

    fn std_sub_assign_duration(ben: &mut Bencher<'_>) {
        let dt: SignedDuration = 100.milliseconds();
        iter_batched_ref!(
            ben,
            StdInstant::now,
            [|instant| *instant -= dt]
        );
    }
}

```

---

# OUTRO - instant.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\tests\integration\instant.rs
**SHA:** bf7e1bcfd44bb227
**Timestamp:** 2026-08-28T02:36:07.863443
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = StdInstant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = StdInstant::now();
- let start = Instant::now();
- let mut start = Instant::now();
- let mut start = StdInstant::now();
- let mut start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
#![expect(deprecated)]

use std::cmp::Ordering;
use std::thread;
use std::time::Instant as StdInstant;

use rstest::rstest;
use time::ext::{NumericalDuration, NumericalStdDuration};
use time::{Instant, SignedDuration};

#[rstest]
fn elapsed() {
    let instant = Instant::now();
    thread::sleep(1.std_milliseconds());
    assert!(instant.elapsed() >= 1.milliseconds());
}

#[rstest]
#[case(0.seconds())]
#[case(5.seconds())]
#[case((-5).seconds())]
fn checked_add(#[case] duration: SignedDuration) {
    let now = Instant::now();
    assert_eq!(now.checked_add(duration), Some(now + duration));
}

#[rstest]
#[case(0.seconds())]
#[case(5.seconds())]
#[case((-5).seconds())]
fn checked_sub(#[case] duration: SignedDuration) {
    let now = Instant::now();
    assert_eq!(now.checked_sub(duration), Some(now - duration));
}

#[rstest]
fn into_inner() {
    let now = Instant::now();
    assert_eq!(now.into_inner(), now.0);
}

#[rstest]
fn std_from() {
    let now_time = Instant::now();
    let now_std = StdInstant::from(now_time);
    assert_eq!(now_time, now_std);
}

#[rstest]
fn from_std() {
    let now_std = StdInstant::now();
    let now_time = Instant::from(now_std);
    assert_eq!(now_time, now_std);
}

#[rstest]
#[case(0)]
#[case(1)]
fn sub(#[case] ms: u64) {
    let start = Instant::now();
    thread::sleep(ms.std_milliseconds());
    assert!(Instant::now() - start >= ms.cast_signed().milliseconds());
}

#[rstest]
#[case(0)]
#[case(1)]
fn sub_std(#[case] ms: u64) {
    let start = StdInstant::now();
    thread::sleep(ms.std_milliseconds());
    assert!(Instant::now() - start >= ms.cast_signed().milliseconds());
}

#[rstest]
#[case(0)]
#[case(1)]
fn std_sub(#[case] ms: u64) {
    let start = Instant::now();
    thread::sleep(ms.std_milliseconds());
    assert!(StdInstant::now() - start >= ms.cast_signed().milliseconds());
}

#[rstest]
#[case(0)]
#[case(1)]
fn add_duration(#[case] ms: u64) {
    let start = Instant::now();
    thread::sleep(ms.std_milliseconds());
    assert!(start + ms.cast_signed().milliseconds() <= Instant::now());
}

#[rstest]
#[case(0)]
#[case(1)]
fn std_add_duration(#[case] ms: u64) {
    let start = StdInstant::now();
    thread::sleep(ms.std_milliseconds());
    assert!(start + ms.cast_signed().milliseconds() <= StdInstant::now());
}

#[rstest]
#[case(0)]
#[case(1)]
fn add_std_duration(#[case] ms: u64) {
    let start = Instant::now();
    thread::sleep(ms.std_milliseconds());
    assert!(start + ms.std_milliseconds() <= Instant::now());
}

#[rstest]
#[case(0)]
#[case(1)]
fn add_assign_duration(#[case] ms: u64) {
    let mut start = Instant::now();
    thread::sleep(ms.std_milliseconds());
    start += ms.cast_signed().milliseconds();
    assert!(start <= Instant::now());
}

#[rstest]
#[case(0)]
#[case(1)]
fn std_add_assign_duration(#[case] ms: u64) {
    let mut start = StdInstant::now();
    thread::sleep(ms.std_milliseconds());
    start += ms.cast_signed().milliseconds();
    assert!(start <= StdInstant::now());
}

#[rstest]
#[case(0)]
#[case(1)]
fn add_assign_std_duration(#[case] ms: u64) {
    let mut start = Instant::now();
    thread::sleep(ms.std_milliseconds());
    start += ms.std_milliseconds();
    assert!(start <= Instant::now());
}

#[rstest]
#[case(0)]
#[case(100)]
fn sub_duration(#[case] ms: i64) {
    let instant = Instant::now();
    assert!(instant - ms.milliseconds() <= Instant::now());
    assert_eq!(instant - SignedDuration::ZERO, instant);
}

#[rstest]
#[case(0)]
#[case(100)]
fn std_sub_duration(#[case] ms: i64) {
    let instant = StdInstant::now();
    assert!(instant - ms.milliseconds() <= StdInstant::now());
}

#[rstest]
#[case(0)]
#[case(100)]
fn sub_std_duration(#[case] ms: u64) {
    let instant = Instant::now();
    assert!(instant - ms.std_milliseconds() <= Instant::now());
}

#[rstest]
#[case(0)]
#[case(100)]
fn sub_assign_duration(#[case] ms: i64) {
    let mut instant = Instant::now();
    instant -= ms.milliseconds();
    assert!(instant <= Instant::now());
}

#[rstest]
#[case(0)]
#[case(100)]
fn std_sub_assign_duration(#[case] ms: i64) {
    let mut instant = StdInstant::now();
    instant -= ms.milliseconds();
    assert!(instant <= StdInstant::now());
}

#[rstest]
#[case(0)]
#[case(100)]
fn sub_assign_std_duration(#[case] ms: u64) {
    let mut instant = Instant::now();
    instant -= ms.std_milliseconds();
    assert!(instant <= Instant::now());
}

#[rstest]
fn eq_std() {
    let now_time = Instant::now();
    let now_std = StdInstant::from(now_time);
    assert_eq!(now_time, now_std);
}

#[rstest]
fn std_eq() {
    let now_time = Instant::now();
    let now_std = StdInstant::from(now_time);
    assert_eq!(now_std, now_time);
}

#[rstest]
#[case(1.seconds(), Ordering::Less)]
#[case((-1).seconds(), Ordering::Greater)]
fn ord(#[case] duration: SignedDuration, #[case] expected: Ordering) {
    let now_time = Instant::now();
    let now_std = now_time + duration;
    assert_eq!(now_time.cmp(&now_std), expected);
}

#[rstest]
#[case(1.seconds(), Ordering
```
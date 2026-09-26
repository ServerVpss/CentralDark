# OUTRO - weekday_iter.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\src\iter\weekday_iter.rs
**SHA:** 6d7275de078d0165
**Timestamp:** 2026-08-28T02:36:07.164674
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const fn new(start: Weekday) -> Self {

### Ouro Bruto (primeiros 5000 chars)
```
//! An infinite iterator over [`Weekday`]s.

use core::iter::FusedIterator;

use super::Rev;
use crate::Weekday::{self, *};

const ALL_WEEKDAYS: [Weekday; 7] = [
    Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday,
];

/// An infinite iterator over [`Weekday`]s.
///
/// This struct is created by [`Weekday::iter_from`] or [`WeekdayIter::new`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WeekdayIter {
    current: Weekday,
}

impl WeekdayIter {
    /// Create a new `WeekdayIter` starting at `start`.
    ///
    /// ```rust
    /// # use time::{Weekday, iter::WeekdayIter};
    /// let mut iter = WeekdayIter::new(Weekday::Monday);
    /// assert_eq!(iter.next(), Some(Weekday::Monday));
    /// assert_eq!(iter.next(), Some(Weekday::Tuesday));
    /// assert_eq!(iter.next(), Some(Weekday::Wednesday));
    /// ```
    #[inline]
    pub const fn new(start: Weekday) -> Self {
        Self { current: start }
    }

    /// Make the iterator go in reverse order.
    ///
    /// ```rust
    /// # use time::{Weekday, iter::WeekdayIter};
    /// let mut iter = WeekdayIter::new(Weekday::Monday).rev();
    /// assert_eq!(iter.next(), Some(Weekday::Monday));
    /// assert_eq!(iter.next(), Some(Weekday::Sunday));
    /// assert_eq!(iter.next(), Some(Weekday::Saturday));
    /// ```
    #[inline]
    pub const fn rev(self) -> Rev<Self> {
        Rev { iter: self }
    }
}

impl Iterator for WeekdayIter {
    type Item = Weekday;

    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        let current = self.current;
        self.current = current.next();
        Some(current)
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        (usize::MAX, None)
    }

    #[inline]
    fn nth(&mut self, n: usize) -> Option<Self::Item> {
        let result = self.current.nth_next((n % 7) as u8);
        self.current = result.next();
        Some(result)
    }

    fn count(self) -> usize {
        panic!("`WeekdayIter` is infinite and cannot be counted")
    }

    fn last(self) -> Option<Self::Item> {
        panic!("`WeekdayIter` is infinite and has no last element")
    }

    #[inline]
    fn all<F>(&mut self, f: F) -> bool
    where
        F: FnMut(Self::Item) -> bool,
    {
        ALL_WEEKDAYS.into_iter().all(f)
    }

    #[inline]
    fn any<F>(&mut self, f: F) -> bool
    where
        F: FnMut(Self::Item) -> bool,
    {
        ALL_WEEKDAYS.into_iter().any(f)
    }
}

impl Iterator for Rev<WeekdayIter> {
    type Item = Weekday;

    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        let current = self.iter.current;
        self.iter.current = current.previous();
        Some(current)
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        (usize::MAX, None)
    }

    #[inline]
    fn nth(&mut self, n: usize) -> Option<Self::Item> {
        let result = self.iter.current.nth_prev((n % 7) as u8);
        self.iter.current = result.previous();
        Some(result)
    }

    fn count(self) -> usize {
        panic!("`Rev<WeekdayIter>` is infinite and cannot be counted")
    }

    fn last(self) -> Option<Self::Item> {
        panic!("`Rev<WeekdayIter>` is infinite and has no last element")
    }

    #[inline]
    fn all<F>(&mut self, f: F) -> bool
    where
        F: FnMut(Self::Item) -> bool,
    {
        ALL_WEEKDAYS.into_iter().all(f)
    }

    #[inline]
    fn any<F>(&mut self, f: F) -> bool
    where
        F: FnMut(Self::Item) -> bool,
    {
        ALL_WEEKDAYS.into_iter().any(f)
    }
}

impl FusedIterator for WeekdayIter {}
impl FusedIterator for Rev<WeekdayIter> {}

```

---

# OUTRO - weekday_iter.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\tests\integration\weekday_iter.rs
**SHA:** cfa5d0beafd6c182
**Timestamp:** 2026-08-28T02:36:08.254355
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- #[values(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)] start: Weekday,
- fn new(start: Weekday) {
- fn iter_from(start: Weekday) {
- fn size_hint(start: Weekday) {
- fn nth(start: Weekday, #[values(1, 2, 3, 4, 5, 6, 7)] n: u8) {
- start: Weekday,
- fn any_terminates(start: Weekday) {
- start: Weekday,
- fn all_terminates(start: Weekday) {
- fn count_panics(start: Weekday) {

### Ouro Bruto (primeiros 5000 chars)
```
use rstest::rstest;
use rstest_reuse::{apply, template};
use time::Weekday::{self, *};
use time::iter::WeekdayIter;

#[template]
#[rstest]
fn all_weekdays(
    #[values(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)] start: Weekday,
) {
}

#[apply(all_weekdays)]
fn new(start: Weekday) {
    let mut iter = WeekdayIter::new(start);
    assert_eq!(iter.next(), Some(start));
    assert_eq!(iter.next(), Some(start.next()));
}

#[apply(all_weekdays)]
fn iter_from(start: Weekday) {
    let mut iter = Weekday::iter_from(start);
    assert_eq!(iter.next(), Some(start));
    assert_eq!(iter.next(), Some(start.next()));
}

#[apply(all_weekdays)]
fn size_hint(start: Weekday) {
    assert_eq!(WeekdayIter::new(start).size_hint(), (usize::MAX, None));
}

#[apply(all_weekdays)]
fn nth(start: Weekday, #[values(1, 2, 3, 4, 5, 6, 7)] n: u8) {
    let expected = start.nth_next(n);
    assert_eq!(WeekdayIter::new(start).nth(n as usize), Some(expected));
}

#[apply(all_weekdays)]
fn any_checks_all_weekdays(
    start: Weekday,
    #[values(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)] target: Weekday,
) {
    assert!(WeekdayIter::new(start).any(|d| d == target));
}

#[apply(all_weekdays)]
fn any_terminates(start: Weekday) {
    assert!(!WeekdayIter::new(start).any(|_| false));
}

#[apply(all_weekdays)]
fn all_checks_all_weekdays(
    start: Weekday,
    #[values(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)] excludes: Weekday,
) {
    assert!(!WeekdayIter::new(start).all(|d| d != excludes));
}

#[apply(all_weekdays)]
fn all_terminates(start: Weekday) {
    assert!(WeekdayIter::new(start).all(|_| true));
}

#[apply(all_weekdays)]
#[should_panic(expected = "infinite")]
fn count_panics(start: Weekday) {
    WeekdayIter::new(start).count();
}

#[apply(all_weekdays)]
#[should_panic(expected = "infinite")]
fn last_panics(start: Weekday) {
    WeekdayIter::new(start).last();
}

#[apply(all_weekdays)]
fn rev_next(start: Weekday) {
    let mut iter = WeekdayIter::new(start).rev();
    assert_eq!(iter.next(), Some(start));
    assert_eq!(iter.next(), Some(start.previous()));
}

#[apply(all_weekdays)]
fn rev_nth(start: Weekday, #[values(1, 2, 3, 4, 5, 6, 7)] n: u8) {
    let expected = start.nth_prev(n);
    assert_eq!(
        WeekdayIter::new(start).rev().nth(n as usize),
        Some(expected)
    );
}

#[apply(all_weekdays)]
fn rev_size_hint(start: Weekday) {
    assert_eq!(
        WeekdayIter::new(start).rev().size_hint(),
        (usize::MAX, None)
    );
}

#[apply(all_weekdays)]
#[should_panic(expected = "infinite")]
fn rev_count_panics(start: Weekday) {
    WeekdayIter::new(start).rev().count();
}

#[apply(all_weekdays)]
#[should_panic(expected = "infinite")]
fn rev_last_panics(start: Weekday) {
    WeekdayIter::new(start).rev().last();
}

#[apply(all_weekdays)]
fn rev_any_checks_all_weekdays(
    start: Weekday,
    #[values(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)] target: Weekday,
) {
    assert!(WeekdayIter::new(start).rev().any(|d| d == target));
}

#[apply(all_weekdays)]
fn rev_any_terminates(start: Weekday) {
    assert!(!WeekdayIter::new(start).rev().any(|_| false));
}

#[apply(all_weekdays)]
fn rev_all_checks_all_weekdays(
    start: Weekday,
    #[values(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)] excludes: Weekday,
) {
    assert!(!WeekdayIter::new(start).rev().all(|d| d != excludes));
}

#[apply(all_weekdays)]
fn rev_all_terminates(start: Weekday) {
    assert!(WeekdayIter::new(start).rev().all(|_| true));
}

```
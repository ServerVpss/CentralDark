# OUTRO - month_iter.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\src\iter\month_iter.rs
**SHA:** 52427775930ee967
**Timestamp:** 2026-08-28T02:36:07.161669
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const fn new(start: Month) -> Self {

### Ouro Bruto (primeiros 5000 chars)
```
//! An infinite iterator over [`Month`]s.

use core::iter::FusedIterator;

use super::Rev;
use crate::Month::{self, *};

pub(super) const ALL_MONTHS: [Month; 12] = [
    January, February, March, April, May, June, July, August, September, October, November,
    December,
];

/// An infinite iterator over [`Month`]s.
///
/// This struct is created by [`Month::iter_from`] or [`MonthIter::new`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MonthIter {
    current: Month,
}

impl MonthIter {
    /// Create a new `MonthIter` starting at `start`.
    ///
    /// ```rust
    /// # use time::{Month, iter::MonthIter};
    /// let mut iter = MonthIter::new(Month::January);
    /// assert_eq!(iter.next(), Some(Month::January));
    /// assert_eq!(iter.next(), Some(Month::February));
    /// assert_eq!(iter.next(), Some(Month::March));
    /// ```
    #[inline]
    pub const fn new(start: Month) -> Self {
        Self { current: start }
    }

    /// Make the iterator go in reverse order.
    ///
    /// ```rust
    /// # use time::{Month, iter::MonthIter};
    /// let mut iter = MonthIter::new(Month::January).rev();
    /// assert_eq!(iter.next(), Some(Month::January));
    /// assert_eq!(iter.next(), Some(Month::December));
    /// assert_eq!(iter.next(), Some(Month::November));
    /// ```
    #[inline]
    pub const fn rev(self) -> Rev<Self> {
        Rev { iter: self }
    }
}

impl Iterator for MonthIter {
    type Item = Month;

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
        let result = self.current.nth_next((n % 12) as u8);
        self.current = result.next();
        Some(result)
    }

    fn count(self) -> usize {
        panic!("`MonthIter` is infinite and cannot be counted")
    }

    fn last(self) -> Option<Self::Item> {
        panic!("`MonthIter` is infinite and has no last element")
    }

    #[inline]
    fn all<F>(&mut self, f: F) -> bool
    where
        F: FnMut(Self::Item) -> bool,
    {
        ALL_MONTHS.into_iter().all(f)
    }

    #[inline]
    fn any<F>(&mut self, f: F) -> bool
    where
        F: FnMut(Self::Item) -> bool,
    {
        ALL_MONTHS.into_iter().any(f)
    }

    #[inline]
    fn max(self) -> Option<Self::Item> {
        Some(December)
    }

    #[inline]
    fn min(self) -> Option<Self::Item> {
        Some(January)
    }

    #[inline]
    fn is_sorted(self) -> bool {
        // The iterator will always have December followed by January, so it is not sorted.
        false
    }
}

impl Iterator for Rev<MonthIter> {
    type Item = Month;

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
        let result = self.iter.current.nth_prev((n % 12) as u8);
        self.iter.current = result.previous();
        Some(result)
    }

    fn count(self) -> usize {
        panic!("`Rev<MonthIter>` is infinite and cannot be counted")
    }

    fn last(self) -> Option<Self::Item> {
        panic!("`Rev<MonthIter>` is infinite and has no last element")
    }

    #[inline]
    fn all<F>(&mut self, f: F) -> bool
    where
        F: FnMut(Self::Item) -> bool,
    {
        ALL_MONTHS.into_iter().all(f)
    }

    #[inline]
    fn any<F>(&mut self, f: F) -> bool
    where
        F: FnMut(Self::Item) -> bool,
    {
        ALL_MONTHS.into_iter().any(f)
    }

    #[inline]
    fn max(self) -> Option<Self::Item> {
        Some(December)
    }

    #[inline]
    fn min(self) -> Option<Self::Item> {
        Some(January)
    }

    #[inline]
    fn is_sorted(self) -> bool {
        false
    }
}

impl FusedIterator for MonthIter {}
impl FusedIterator for Rev<MonthIter> {}

```

---

# OUTRO - month_iter.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\tests\integration\month_iter.rs
**SHA:** ab75547211ad5b23
**Timestamp:** 2026-08-28T02:36:08.039848
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Month,
- fn new(start: Month) {
- fn iter_from(start: Month) {
- fn size_hint(start: Month) {
- fn max(start: Month) {
- fn min(start: Month) {
- fn is_sorted(start: Month) {
- fn nth(start: Month, #[values(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)] n: u8) {
- start: Month,
- fn any_terminates(start: Month) {

### Ouro Bruto (primeiros 5000 chars)
```
use rstest::rstest;
use rstest_reuse::{apply, template};
use time::Month::{self, *};
use time::iter::MonthIter;

#[template]
#[rstest]
fn all_months(
    #[values(
        January, February, March, April, May, June, July, August, September, October, November,
        December
    )]
    start: Month,
) {
}

#[apply(all_months)]
fn new(start: Month) {
    let mut iter = MonthIter::new(start);
    assert_eq!(iter.next(), Some(start));
    assert_eq!(iter.next(), Some(start.next()));
}

#[apply(all_months)]
fn iter_from(start: Month) {
    let mut iter = Month::iter_from(start);
    assert_eq!(iter.next(), Some(start));
    assert_eq!(iter.next(), Some(start.next()));
}

#[apply(all_months)]
fn size_hint(start: Month) {
    assert_eq!(MonthIter::new(start).size_hint(), (usize::MAX, None));
}

#[apply(all_months)]
fn max(start: Month) {
    assert_eq!(MonthIter::new(start).max(), Some(December));
}

#[apply(all_months)]
fn min(start: Month) {
    assert_eq!(MonthIter::new(start).min(), Some(January));
}

#[apply(all_months)]
fn is_sorted(start: Month) {
    assert!(!MonthIter::new(start).is_sorted());
}

#[apply(all_months)]
fn nth(start: Month, #[values(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)] n: u8) {
    let expected = start.nth_next(n);
    assert_eq!(MonthIter::new(start).nth(n as usize), Some(expected));
}

#[apply(all_months)]
fn any_checks_all_months(
    start: Month,
    #[values(
        January, February, March, April, May, June, July, August, September, October, November,
        December
    )]
    target: Month,
) {
    assert!(MonthIter::new(start).any(|m| m == target));
}

#[apply(all_months)]
fn any_terminates(start: Month) {
    assert!(!MonthIter::new(start).any(|_| false));
}

#[apply(all_months)]
fn all_checks_all_months(
    start: Month,
    #[values(
        January, February, March, April, May, June, July, August, September, October, November,
        December
    )]
    excludes: Month,
) {
    assert!(!MonthIter::new(start).all(|m| m != excludes));
}

#[apply(all_months)]
fn all_terminates(start: Month) {
    assert!(MonthIter::new(start).all(|_| true));
}

#[apply(all_months)]
fn rev_next(start: Month) {
    let mut iter = MonthIter::new(start).rev();
    assert_eq!(iter.next(), Some(start));
    assert_eq!(iter.next(), Some(start.previous()));
}

#[apply(all_months)]
fn rev_nth(start: Month, #[values(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11)] n: u8) {
    let expected = start.nth_prev(n);
    assert_eq!(MonthIter::new(start).rev().nth(n as usize), Some(expected));
}

#[apply(all_months)]
fn rev_size_hint(start: Month) {
    assert_eq!(MonthIter::new(start).rev().size_hint(), (usize::MAX, None));
}

#[apply(all_months)]
fn rev_max(start: Month) {
    assert_eq!(MonthIter::new(start).rev().max(), Some(December));
}

#[apply(all_months)]
fn rev_min(start: Month) {
    assert_eq!(MonthIter::new(start).rev().min(), Some(January));
}

#[apply(all_months)]
fn rev_is_sorted(start: Month) {
    assert!(!MonthIter::new(start).rev().is_sorted());
}

#[apply(all_months)]
#[should_panic(expected = "infinite")]
fn count_panics(start: Month) {
    MonthIter::new(start).count();
}

#[apply(all_months)]
#[should_panic(expected = "infinite")]
fn last_panics(start: Month) {
    MonthIter::new(start).last();
}

#[apply(all_months)]
#[should_panic(expected = "infinite")]
fn rev_count_panics(start: Month) {
    MonthIter::new(start).rev().count();
}

#[apply(all_months)]
#[should_panic(expected = "infinite")]
fn rev_last_panics(start: Month) {
    MonthIter::new(start).rev().last();
}

#[apply(all_months)]
fn rev_any_checks_all_months(
    start: Month,
    #[values(
        January, February, March, April, May, June, July, August, September, October, November,
        December
    )]
    target: Month,
) {
    assert!(MonthIter::new(start).rev().any(|m| m == target));
}

#[apply(all_months)]
fn rev_any_terminates(start: Month) {
    assert!(!MonthIter::new(start).rev().any(|_| false));
}

#[apply(all_months)]
fn rev_all_checks_all_months(
    start: Month,
    #[values(
        January, February, March, April, May, June, July, August, September, October, November,
        December
    )]
    excludes: Month,
) {
    assert!(!MonthIter::new(start).rev().all(|m| m != excludes));
}

#[apply(all_months)]
fn rev_all_terminates(start: Month) {
    assert!(MonthIter::new(start).rev().all(|_| true));
}

```
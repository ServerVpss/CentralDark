# OUTRO - date_iter.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\src\iter\date_iter.rs
**SHA:** 5699a02371b73f23
**Timestamp:** 2026-08-28T02:36:07.118661
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const fn new(start: Date, end: Date) -> Self {

### Ouro Bruto (primeiros 5000 chars)
```
//! An iterator over a range of [`Date`]s, yielding each day from start to end inclusive.

use core::iter::FusedIterator;

use crate::Date;

/// An iterator over a range of [`Date`]s, yielding each day from start to end inclusive.
///
/// This struct is created by [`Date::iter_to`] or [`DateIter::new`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DateIter {
    front: Date,
    back: Option<Date>,
}

impl DateIter {
    /// Create a new `DateIter` from `start` to `end` inclusive.
    ///
    /// If `start > end`, the iterator will be empty.
    ///
    /// ```rust
    /// # use time::iter::DateIter;
    /// # use time_macros::date;
    /// let mut iter = DateIter::new(date!(2019-01-01), date!(2019-01-03));
    /// assert_eq!(iter.next(), Some(date!(2019-01-01)));
    /// assert_eq!(iter.next(), Some(date!(2019-01-02)));
    /// assert_eq!(iter.next(), Some(date!(2019-01-03)));
    /// assert_eq!(iter.next(), None);
    /// ```
    #[inline]
    pub const fn new(start: Date, end: Date) -> Self {
        Self {
            front: start,
            back: if start.as_i32() <= end.as_i32() {
                Some(end)
            } else {
                None
            },
        }
    }

    /// Returns `true` if the iterator is empty, `false` otherwise.
    #[inline]
    const fn is_exhausted(&self) -> bool {
        self.back.is_none()
    }

    /// Make the iterator exhausted.
    #[inline]
    const fn make_exhausted(&mut self) {
        self.back = None;
    }

    /// Return the number of days from `front` to `back`. Uses ordinal arithmetic as a fast path
    /// when both dates fall in the same year, avoiding the more expensive Julian day computation.
    #[inline]
    const fn days_between(front: Date, back: Date) -> i32 {
        if front.year() == back.year() {
            back.ordinal() as i32 - front.ordinal() as i32
        } else {
            back.to_julian_day() - front.to_julian_day()
        }
    }
}

impl Iterator for DateIter {
    type Item = Date;

    #[inline]
    fn next(&mut self) -> Option<Self::Item> {
        let current = self.front;
        let back = self.back?;

        if current < back {
            // Safety: `current < back`, so `current` has a successor.
            self.front = unsafe { current.next_day().unwrap_unchecked() };
        } else {
            self.make_exhausted();
        }

        Some(current)
    }

    #[inline]
    fn size_hint(&self) -> (usize, Option<usize>) {
        let len = self.len();
        (len, Some(len))
    }

    #[inline]
    fn count(self) -> usize {
        self.len()
    }

    #[inline]
    fn last(self) -> Option<Self::Item> {
        self.back
    }

    #[inline]
    fn nth(&mut self, n: usize) -> Option<Self::Item> {
        let back = self.back?;
        let front = self.front;

        let same_year = front.year() == back.year();
        let remaining = if same_year {
            (back.ordinal() - front.ordinal()) as usize
        } else {
            (back.to_julian_day() - front.to_julian_day()) as usize
        };

        if n > remaining {
            self.make_exhausted();
            return None;
        }

        // Fast path for when the result is in the same year, avoiding the more expensive Julian day
        // computation.
        let result = if same_year
            || front.ordinal() as usize + n <= if front.is_in_leap_year() { 366 } else { 365 }
        {
            // Safety: We know that we're staying in the same year and that the resulting ordinal is
            // valid.
            unsafe { front.add_days_unchecked(n as i32) }
        } else {
            // Safety: `n <= remaining = back_jd - front_jd`, so `front_jd + n <= back_jd`.
            unsafe { Date::from_julian_day_unchecked(front.to_julian_day() + n as i32) }
        };

        if n == remaining {
            self.make_exhausted();
        } else {
            // Safety: `result < back`, so `result` has a successor.
            self.front = unsafe { result.next_day().unwrap_unchecked() };
        }

        Some(result)
    }

    #[inline]
    fn max(self) -> Option<Self::Item> {
        self.back
    }

    #[inline]
    fn min(self) -> Option<Self::Item> {
        (!self.is_exhausted()).then_some(self.front)
    }

    #[inline]
    fn is_sorted(self) -> bool {
        true
    }
}

impl DoubleEndedIterator for DateIter {
    #[inline]
    fn next_back(&mut self) -> Option<Self::Item> {
        let back = self.back?;

        if self.front < back {
            // Safety: `front < back`, so `back` has a predecessor.
            self.back = Some(unsafe { back.previous_day().unwrap_unchecked() });
        } else {
            self.make_exhausted();
        }

        Some(back)
    }

    #[inline]
    fn nth_back(&mut self, n: usize) -> Option<Self::Item> {
        let back = self.back?;
        let front = self.front;

        let same_year = front.year() == back.year();
        let remaining = if same_year {
            (back.ord
```

---

# OUTRO - date_iter.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\tests\integration\date_iter.rs
**SHA:** 80887e3445d1d8a9
**Timestamp:** 2026-08-28T02:36:07.798632
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn forward(#[case] start: Date, #[case] end: Date, #[case] expected: Vec<Date>) {
- fn size_hint(#[case] start: Date, #[case] end: Date, #[case] expected: (usize, Option<usize>)) {
- fn count(#[case] start: Date, #[case] end: Date, #[case] expected: usize) {
- fn last(#[case] start: Date, #[case] end: Date, #[case] expected: Option<Date>) {
- fn max(#[case] start: Date, #[case] end: Date, #[case] expected: Option<Date>) {
- fn min(#[case] start: Date, #[case] end: Date, #[case] expected: Option<Date>) {
- fn nth(#[case] start: Date, #[case] end: Date, #[case] n: usize, #[case] expected: Option<Date>) {
- #[case] start: Date,
- fn len(#[case] start: Date, #[case] end: Date, #[case] expected: usize) {
- fn is_sorted(#[case] start: Date, #[case] end: Date) {

### Ouro Bruto (primeiros 5000 chars)
```
use std::vec::Vec;

use rstest::rstest;
use time::Date;
use time::iter::DateIter;
use time::macros::date;

const AFTER_MIN: Date = Date::MIN.next_day().unwrap();
const BEFORE_MAX: Date = Date::MAX.previous_day().unwrap();

#[rstest]
#[case(
    date!(2019-01-01),
    date!(2019-01-03),
    vec![date!(2019-01-01), date!(2019-01-02), date!(2019-01-03)]
)]
#[case(date!(2019-01-01), date!(2019-01-01), vec![date!(2019-01-01)])]
#[case(date!(2019-01-03), date!(2019-01-01), vec![])]
#[case(
    date!(2019-12-30),
    date!(2020-01-02),
    vec![date!(2019-12-30), date!(2019-12-31), date!(2020-01-01), date!(2020-01-02)]
)]
#[case(Date::MIN, AFTER_MIN, vec![Date::MIN, AFTER_MIN])]
#[case(BEFORE_MAX, Date::MAX, vec![BEFORE_MAX, Date::MAX])]
fn forward(#[case] start: Date, #[case] end: Date, #[case] expected: Vec<Date>) {
    let results: Vec<_> = start.iter_to(end).collect();
    assert_eq!(results, expected);
}

#[rstest]
fn double_ended() {
    let mut iter = date!(2019-01-01).iter_to(date!(2019-01-05));
    assert_eq!(iter.next(), Some(date!(2019-01-01)));
    assert_eq!(iter.next_back(), Some(date!(2019-01-05)));
    assert_eq!(iter.next_back(), Some(date!(2019-01-04)));
    assert_eq!(iter.next(), Some(date!(2019-01-02)));
    assert_eq!(iter.next(), Some(date!(2019-01-03)));
    assert_eq!(iter.next(), None);
}

#[rstest]
fn double_ended_to_self() {
    let d = date!(2019-06-15);
    let mut iter = d.iter_to(d);
    assert_eq!(iter.next_back(), Some(d));
    assert_eq!(iter.next_back(), None);
    assert_eq!(iter.next(), None);
}

#[rstest]
fn new() {
    let mut iter = DateIter::new(date!(2020-01-01), date!(2020-01-03));
    assert_eq!(iter.next(), Some(date!(2020-01-01)));
    assert_eq!(iter.next(), Some(date!(2020-01-02)));
    assert_eq!(iter.next(), Some(date!(2020-01-03)));
    assert_eq!(iter.next(), None);
}

#[rstest]
#[case(date!(2019-01-01), date!(2019-01-05), (5, Some(5)))]
#[case(date!(2019-01-05), date!(2019-01-01), (0, Some(0)))]
#[case(date!(2019-01-01), date!(2019-01-01), (1, Some(1)))]
fn size_hint(#[case] start: Date, #[case] end: Date, #[case] expected: (usize, Option<usize>)) {
    assert_eq!(start.iter_to(end).size_hint(), expected);
}

#[rstest]
#[case(date!(2019-01-01), date!(2019-01-05), 5)]
#[case(date!(2019-01-01), date!(2019-01-01), 1)]
#[case(date!(2019-01-05), date!(2019-01-01), 0)]
#[case(date!(-9999-01-01), date!(-9999-12-31), 365)]
fn count(#[case] start: Date, #[case] end: Date, #[case] expected: usize) {
    assert_eq!(start.iter_to(end).count(), expected);
}

#[rstest]
#[case(date!(2019-01-01), date!(2019-01-05), Some(date!(2019-01-05)))]
#[case(date!(2019-01-01), date!(2019-01-01), Some(date!(2019-01-01)))]
#[case(date!(2019-01-05), date!(2019-01-01), None)]
fn last(#[case] start: Date, #[case] end: Date, #[case] expected: Option<Date>) {
    assert_eq!(start.iter_to(end).last(), expected);
}

#[rstest]
#[case(date!(2019-01-01), date!(2019-01-05), Some(date!(2019-01-05)))]
#[case(date!(2019-01-01), date!(2019-01-01), Some(date!(2019-01-01)))]
#[case(date!(2019-01-05), date!(2019-01-01), None)]
fn max(#[case] start: Date, #[case] end: Date, #[case] expected: Option<Date>) {
    assert_eq!(start.iter_to(end).max(), expected);
}

#[rstest]
#[case(date!(2019-01-01), date!(2019-01-05), Some(date!(2019-01-01)))]
#[case(date!(2019-01-01), date!(2019-01-01), Some(date!(2019-01-01)))]
#[case(date!(2019-01-05), date!(2019-01-01), None)]
fn min(#[case] start: Date, #[case] end: Date, #[case] expected: Option<Date>) {
    assert_eq!(start.iter_to(end).min(), expected);
}

#[rstest]
#[case(date!(2019-01-01), date!(2019-01-05), 0, Some(date!(2019-01-01)))]
#[case(date!(2019-01-01), date!(2019-01-05), 2, Some(date!(2019-01-03)))]
#[case(date!(2019-01-01), date!(2019-01-05), 4, Some(date!(2019-01-05)))]
#[case(date!(2019-01-01), date!(2019-01-05), 5, None)]
#[case(date!(2019-01-05), date!(2019-01-01), 0, None)]
#[case(Date::MAX, Date::MAX, 0, Some(Date::MAX))]
#[case(Date::MAX, Date::MAX, 1, None)]
#[case(BEFORE_MAX, Date::MAX, 1, Some(Date::MAX))]
#[case(BEFORE_MAX, Date::MAX, 2, None)]
#[case(date!(2019-12-30), date!(2020-01-01), 2, Some(date!(2020-01-01)))]
#[case(date!(2019-01-01), date!(2019-12-31), 364, Some(date!(2019-12-31)))]
#[case(date!(2020-01-01), date!(2020-12-31), 365, Some(date!(2020-12-31)))]
fn nth(#[case] start: Date, #[case] end: Date, #[case] n: usize, #[case] expected: Option<Date>) {
    let mut iter = start.iter_to(end);
    assert_eq!(iter.nth(n), expected);
    if (expected.is_none() || expected == Some(end)) && start <= end {
        assert_eq!(iter.next(), None);
    }
}

#[rstest]
#[case(date!(2019-01-01), date!(2019-01-05), 0, Some(date!(2019-01-05)))]
#[case(date!(2019-01-01), date!(2019-01-05), 2, Some(date!(2019-01-03)))]
#[case(date!(2019-01-01), date!(2019-01-05), 4, Some(date!(2019-01-01)))]
#[case(date!(2019-01-01), date!(2019-01-05), 5, None)]
#[case(date!(2019-01-05), date!(2019-01-01), 0, None)]
#[case(Date::MIN, Date::MIN, 0, Some(Date::MIN))]
#[cas
```
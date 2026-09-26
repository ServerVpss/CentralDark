# OUTRO - weekday_set.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\chrono-0.4.45\src\weekday_set.rs
**SHA:** be1827f17ca4d594
**Timestamp:** 2026-08-28T02:33:24.456548
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const fn iter(self, start: Weekday) -> WeekdaySetIter {
- start: Weekday,

### Contratos
- pub struct WeekdaySet(u8); // Invariant: the 8-th bit is always 0.

### Principios
- pub struct WeekdaySet(u8); // Invariant: the 8-th bit is always 0.

### Ouro Bruto (primeiros 5000 chars)
```
use core::{
    fmt::{self, Debug},
    iter::FusedIterator,
};

use crate::Weekday;

/// A collection of [`Weekday`]s stored as a single byte.
///
/// This type is `Copy` and provides efficient set-like and slice-like operations.
/// Many operations are `const` as well.
///
/// Implemented as a bitmask where bits 1-7 correspond to Monday-Sunday.
#[derive(Clone, Copy, Default, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub struct WeekdaySet(u8); // Invariant: the 8-th bit is always 0.

impl WeekdaySet {
    /// Create a `WeekdaySet` from an array of [`Weekday`]s.
    ///
    /// # Example
    /// ```
    /// # use chrono::WeekdaySet;
    /// use chrono::Weekday::*;
    /// assert_eq!(WeekdaySet::EMPTY, WeekdaySet::from_array([]));
    /// assert_eq!(WeekdaySet::single(Mon), WeekdaySet::from_array([Mon]));
    /// assert_eq!(WeekdaySet::ALL, WeekdaySet::from_array([Mon, Tue, Wed, Thu, Fri, Sat, Sun]));
    /// ```
    pub const fn from_array<const C: usize>(days: [Weekday; C]) -> Self {
        let mut acc = Self::EMPTY;
        let mut idx = 0;
        while idx < days.len() {
            acc.0 |= Self::single(days[idx]).0;
            idx += 1;
        }
        acc
    }

    /// Create a `WeekdaySet` from a single [`Weekday`].
    pub const fn single(weekday: Weekday) -> Self {
        match weekday {
            Weekday::Mon => Self(0b000_0001),
            Weekday::Tue => Self(0b000_0010),
            Weekday::Wed => Self(0b000_0100),
            Weekday::Thu => Self(0b000_1000),
            Weekday::Fri => Self(0b001_0000),
            Weekday::Sat => Self(0b010_0000),
            Weekday::Sun => Self(0b100_0000),
        }
    }

    /// Returns `Some(day)` if this collection contains exactly one day.
    ///
    /// Returns `None` otherwise.
    ///
    /// # Example
    /// ```
    /// # use chrono::WeekdaySet;
    /// use chrono::Weekday::*;
    /// assert_eq!(WeekdaySet::single(Mon).single_day(), Some(Mon));
    /// assert_eq!(WeekdaySet::from_array([Mon, Tue]).single_day(), None);
    /// assert_eq!(WeekdaySet::EMPTY.single_day(), None);
    /// assert_eq!(WeekdaySet::ALL.single_day(), None);
    /// ```
    pub const fn single_day(self) -> Option<Weekday> {
        match self {
            Self(0b000_0001) => Some(Weekday::Mon),
            Self(0b000_0010) => Some(Weekday::Tue),
            Self(0b000_0100) => Some(Weekday::Wed),
            Self(0b000_1000) => Some(Weekday::Thu),
            Self(0b001_0000) => Some(Weekday::Fri),
            Self(0b010_0000) => Some(Weekday::Sat),
            Self(0b100_0000) => Some(Weekday::Sun),
            _ => None,
        }
    }

    /// Adds a day to the collection.
    ///
    /// Returns `true` if the day was new to the collection.
    ///
    /// # Example
    /// ```
    /// # use chrono::WeekdaySet;
    /// use chrono::Weekday::*;
    /// let mut weekdays = WeekdaySet::single(Mon);
    /// assert!(weekdays.insert(Tue));
    /// assert!(!weekdays.insert(Tue));
    /// ```
    pub fn insert(&mut self, day: Weekday) -> bool {
        if self.contains(day) {
            return false;
        }

        self.0 |= Self::single(day).0;
        true
    }

    /// Removes a day from the collection.
    ///
    /// Returns `true` if the collection did contain the day.
    ///
    /// # Example
    /// ```
    /// # use chrono::WeekdaySet;
    /// use chrono::Weekday::*;
    /// let mut weekdays = WeekdaySet::single(Mon);
    /// assert!(weekdays.remove(Mon));
    /// assert!(!weekdays.remove(Mon));
    /// ```
    pub fn remove(&mut self, day: Weekday) -> bool {
        if self.contains(day) {
            self.0 &= !Self::single(day).0;
            return true;
        }

        false
    }

    /// Returns `true` if `other` contains all days in `self`.
    ///
    /// # Example
    /// ```
    /// # use chrono::WeekdaySet;
    /// use chrono::Weekday::*;
    /// assert!(WeekdaySet::single(Mon).is_subset(WeekdaySet::ALL));
    /// assert!(!WeekdaySet::single(Mon).is_subset(WeekdaySet::EMPTY));
    /// assert!(WeekdaySet::EMPTY.is_subset(WeekdaySet::single(Mon)));
    /// ```
    pub const fn is_subset(self, other: Self) -> bool {
        self.intersection(other).0 == self.0
    }

    /// Returns days that are in both `self` and `other`.
    ///
    /// # Example
    /// ```
    /// # use chrono::WeekdaySet;
    /// use chrono::Weekday::*;
    /// assert_eq!(WeekdaySet::single(Mon).intersection(WeekdaySet::single(Mon)), WeekdaySet::single(Mon));
    /// assert_eq!(WeekdaySet::single(Mon).intersection(WeekdaySet::single(Tue)), WeekdaySet::EMPTY);
    /// assert_eq!(WeekdaySet::ALL.intersection(WeekdaySet::single(Mon)), WeekdaySet::single(Mon));
    /// assert_eq!(WeekdaySet::ALL.intersection(WeekdaySet::EMPTY), WeekdaySet::EMPTY);
    /// ```
    pub const fn intersection(self, other: Self) -> Self {
        Self(self.0 & other.0)
    }

    /// Returns days that are in either `self` or `other`.
    ///
    /// # Example
    /// ```
    /// # use chrono::We
```
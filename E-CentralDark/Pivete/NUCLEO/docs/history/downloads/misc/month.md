# OUTRO - month.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\src\month.rs
**SHA:** 39355a037cb95912
**Timestamp:** 2026-08-28T02:36:05.965938
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const fn iter_from(start: Self) -> MonthIter {

### Ouro Bruto (primeiros 5000 chars)
```
//! The `Month` enum and its associated `impl`s.

use core::fmt;
use core::num::NonZero;
use core::str::FromStr;

use powerfmt::smart_display::{FormatterOptions, Metadata, SmartDisplay};

use self::Month::*;
use crate::iter::MonthIter;
use crate::{error, util};

/// Months of the year.
#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Month {
    #[expect(missing_docs)]
    January = 1,
    #[expect(missing_docs)]
    February = 2,
    #[expect(missing_docs)]
    March = 3,
    #[expect(missing_docs)]
    April = 4,
    #[expect(missing_docs)]
    May = 5,
    #[expect(missing_docs)]
    June = 6,
    #[expect(missing_docs)]
    July = 7,
    #[expect(missing_docs)]
    August = 8,
    #[expect(missing_docs)]
    September = 9,
    #[expect(missing_docs)]
    October = 10,
    #[expect(missing_docs)]
    November = 11,
    #[expect(missing_docs)]
    December = 12,
}

impl Month {
    /// Create a `Month` from its numerical value.
    #[inline]
    pub(crate) const fn from_number(n: NonZero<u8>) -> Result<Self, error::ComponentRange> {
        match n.get() {
            1 => Ok(January),
            2 => Ok(February),
            3 => Ok(March),
            4 => Ok(April),
            5 => Ok(May),
            6 => Ok(June),
            7 => Ok(July),
            8 => Ok(August),
            9 => Ok(September),
            10 => Ok(October),
            11 => Ok(November),
            12 => Ok(December),
            _ => Err(error::ComponentRange::unconditional("month")),
        }
    }

    /// Get the number of days in the month of a given year.
    ///
    /// ```rust
    /// # use time::Month;
    /// assert_eq!(Month::February.length(2020), 29);
    /// ```
    #[inline]
    pub const fn length(self, year: i32) -> u8 {
        util::days_in_month(self, year)
    }

    /// Get the previous month.
    ///
    /// ```rust
    /// # use time::Month;
    /// assert_eq!(Month::January.previous(), Month::December);
    /// ```
    #[inline]
    pub const fn previous(self) -> Self {
        match self {
            January => December,
            February => January,
            March => February,
            April => March,
            May => April,
            June => May,
            July => June,
            August => July,
            September => August,
            October => September,
            November => October,
            December => November,
        }
    }

    /// Get the next month.
    ///
    /// ```rust
    /// # use time::Month;
    /// assert_eq!(Month::January.next(), Month::February);
    /// ```
    #[inline]
    pub const fn next(self) -> Self {
        match self {
            January => February,
            February => March,
            March => April,
            April => May,
            May => June,
            June => July,
            July => August,
            August => September,
            September => October,
            October => November,
            November => December,
            December => January,
        }
    }

    /// Get n-th next month.
    ///
    /// ```rust
    /// # use time::Month;
    /// assert_eq!(Month::January.nth_next(4), Month::May);
    /// assert_eq!(Month::July.nth_next(9), Month::April);
    /// ```
    #[inline]
    pub const fn nth_next(self, n: u8) -> Self {
        match (self as u8 - 1 + n % 12) % 12 {
            0 => January,
            1 => February,
            2 => March,
            3 => April,
            4 => May,
            5 => June,
            6 => July,
            7 => August,
            8 => September,
            9 => October,
            10 => November,
            val => {
                debug_assert!(val == 11);
                December
            }
        }
    }

    /// Get n-th previous month.
    ///
    /// ```rust
    /// # use time::Month;
    /// assert_eq!(Month::January.nth_prev(4), Month::September);
    /// assert_eq!(Month::July.nth_prev(9), Month::October);
    /// ```
    #[inline]
    pub const fn nth_prev(self, n: u8) -> Self {
        match self as i8 - 1 - (n % 12).cast_signed() {
            1 | -11 => February,
            2 | -10 => March,
            3 | -9 => April,
            4 | -8 => May,
            5 | -7 => June,
            6 | -6 => July,
            7 | -5 => August,
            8 | -4 => September,
            9 | -3 => October,
            10 | -2 => November,
            11 | -1 => December,
            val => {
                debug_assert!(val == 0);
                January
            }
        }
    }

    /// Create an infinite iterator starting at this month.
    ///
    /// ```rust
    /// # use time::Month;
    /// let mut iter = Month::iter_from(Month::January);
    /// assert_eq!(iter.next(), Some(Month::January));
    /// assert_eq!(iter.next(), Some(Month::February));
    /// assert_eq!(iter.next(), Some(Month::March));
    /// assert_eq!(iter.next(), Some(Month::April));
    /// assert_eq!(iter.next(), Some(Mont
```
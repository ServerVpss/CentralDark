# OUTRO - traits.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\chrono-0.4.45\src\traits.rs
**SHA:** 40386bdfe14fdcc0
**Timestamp:** 2026-08-28T02:33:24.420329
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn in_between(start: i32, end: i32, div: i32) -> i32 {
- let start = (start.div_euclid(div), start.rem_euclid(div));
- let start = start.0 + (start.1 != 0) as i32;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::{IsoWeek, Month, Weekday};

/// The common set of methods for date component.
///
/// Methods such as [`year`], [`month`], [`day`] and [`weekday`] can be used to get basic
/// information about the date.
///
/// The `with_*` methods can change the date.
///
/// # Warning
///
/// The `with_*` methods can be convenient to change a single component of a date, but they must be
/// used with some care. Examples to watch out for:
///
/// - [`with_year`] changes the year component of a year-month-day value. Don't use this method if
///   you want the ordinal to stay the same after changing the year, of if you want the week and
///   weekday values to stay the same.
/// - Don't combine two `with_*` methods to change two components of the date. For example to
///   change both the year and month components of a date. This could fail because an intermediate
///   value does not exist, while the final date would be valid.
///
/// For more complex changes to a date, it is best to use the methods on [`NaiveDate`] to create a
/// new value instead of altering an existing date.
///
/// [`year`]: Datelike::year
/// [`month`]: Datelike::month
/// [`day`]: Datelike::day
/// [`weekday`]: Datelike::weekday
/// [`with_year`]: Datelike::with_year
/// [`NaiveDate`]: crate::NaiveDate
pub trait Datelike: Sized {
    /// Returns the year number in the [calendar date](./naive/struct.NaiveDate.html#calendar-date).
    fn year(&self) -> i32;

    /// Returns the absolute year number starting from 1 with a boolean flag,
    /// which is false when the year predates the epoch (BCE/BC) and true otherwise (CE/AD).
    #[inline]
    fn year_ce(&self) -> (bool, u32) {
        let year = self.year();
        if year < 1 { (false, (1 - year) as u32) } else { (true, year as u32) }
    }

    /// Returns the quarter number starting from 1.
    ///
    /// The return value ranges from 1 to 4.
    #[inline]
    fn quarter(&self) -> u32 {
        (self.month() - 1).div_euclid(3) + 1
    }

    /// Returns the month number starting from 1.
    ///
    /// The return value ranges from 1 to 12.
    fn month(&self) -> u32;

    /// Returns the month number starting from 0.
    ///
    /// The return value ranges from 0 to 11.
    fn month0(&self) -> u32;

    /// Returns the day of month starting from 1.
    ///
    /// The return value ranges from 1 to 31. (The last day of month differs by months.)
    fn day(&self) -> u32;

    /// Returns the day of month starting from 0.
    ///
    /// The return value ranges from 0 to 30. (The last day of month differs by months.)
    fn day0(&self) -> u32;

    /// Returns the day of year starting from 1.
    ///
    /// The return value ranges from 1 to 366. (The last day of year differs by years.)
    fn ordinal(&self) -> u32;

    /// Returns the day of year starting from 0.
    ///
    /// The return value ranges from 0 to 365. (The last day of year differs by years.)
    fn ordinal0(&self) -> u32;

    /// Returns the day of week.
    fn weekday(&self) -> Weekday;

    /// Returns the ISO week.
    fn iso_week(&self) -> IsoWeek;

    /// Makes a new value with the year number changed, while keeping the same month and day.
    ///
    /// This method assumes you want to work on the date as a year-month-day value. Don't use it if
    /// you want the ordinal to stay the same after changing the year, of if you want the week and
    /// weekday values to stay the same.
    ///
    /// # Errors
    ///
    /// Returns `None` when:
    ///
    /// - The resulting date does not exist (February 29 in a non-leap year).
    /// - The year is out of range for [`NaiveDate`].
    /// - In case of [`DateTime<Tz>`] if the resulting date and time fall within a timezone
    ///   transition such as from DST to standard time.
    ///
    /// [`NaiveDate`]: crate::NaiveDate
    /// [`DateTime<Tz>`]: crate::DateTime
    ///
    /// # Examples
    ///
    /// ```
    /// use chrono::{Datelike, NaiveDate};
    ///
    /// assert_eq!(
    ///     NaiveDate::from_ymd_opt(2020, 5, 13).unwrap().with_year(2023).unwrap(),
    ///     NaiveDate::from_ymd_opt(2023, 5, 13).unwrap()
    /// );
    /// // Resulting date 2023-02-29 does not exist:
    /// assert!(NaiveDate::from_ymd_opt(2020, 2, 29).unwrap().with_year(2023).is_none());
    ///
    /// // Don't use `with_year` if you want the ordinal date to stay the same:
    /// assert_ne!(
    ///     NaiveDate::from_yo_opt(2020, 100).unwrap().with_year(2023).unwrap(),
    ///     NaiveDate::from_yo_opt(2023, 100).unwrap() // result is 2023-101
    /// );
    /// ```
    fn with_year(&self, year: i32) -> Option<Self>;

    /// Makes a new value with the month number (starting from 1) changed.
    ///
    /// # Errors
    ///
    /// Returns `None` when:
    ///
    /// - The resulting date does not exist (for example `month(4)` when day of the month is 31).
    /// - In case of [`DateTime<Tz>`] if the resulting date and time fall within a timezone
    ///   transition such as f
```
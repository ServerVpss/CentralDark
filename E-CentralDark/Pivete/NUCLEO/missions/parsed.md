# MISSAO - parsed.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\chrono-0.4.45\src\format\parsed.rs
**SHA:** 369844ce5079271e
**Timestamp:** 2026-08-28T02:33:24.596269
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let first_week_start = 1 + week_start_day.days_since(first_day_of_year.weekday()) as i32;

### Ouro Bruto (primeiros 5000 chars)
```
// This is a part of Chrono.
// See README.md and LICENSE.txt for details.

//! A collection of parsed date and time items.
//! They can be constructed incrementally while being checked for consistency.

use super::{IMPOSSIBLE, NOT_ENOUGH, OUT_OF_RANGE, ParseResult};
use crate::naive::{NaiveDate, NaiveDateTime, NaiveTime};
use crate::offset::{FixedOffset, MappedLocalTime, Offset, TimeZone};
use crate::{DateTime, Datelike, TimeDelta, Timelike, Weekday};

/// A type to hold parsed fields of date and time that can check all fields are consistent.
///
/// There are three classes of methods:
///
/// - `set_*` methods to set fields you have available. They do a basic range check, and if the
///   same field is set more than once it is checked for consistency.
///
/// - `to_*` methods try to make a concrete date and time value out of set fields.
///   They fully check that all fields are consistent and whether the date/datetime exists.
///
/// - Methods to inspect the parsed fields.
///
/// `Parsed` is used internally by all parsing functions in chrono. It is a public type so that it
/// can be used to write custom parsers that reuse the resolving algorithm, or to inspect the
/// results of a string parsed with chrono without converting it to concrete types.
///
/// # Resolving algorithm
///
/// Resolving date/time parts is littered with lots of corner cases, which is why common date/time
/// parsers do not implement it correctly.
///
/// Chrono provides a complete resolution algorithm that checks all fields for consistency via the
/// `Parsed` type.
///
/// As an easy example, consider RFC 2822. The [RFC 2822 date and time format] has a day of the week
/// part, which should be consistent with the other date parts. But a `strptime`-based parse would
/// happily accept inconsistent input:
///
/// ```python
/// >>> import time
/// >>> time.strptime('Wed, 31 Dec 2014 04:26:40 +0000',
///                   '%a, %d %b %Y %H:%M:%S +0000')
/// time.struct_time(tm_year=2014, tm_mon=12, tm_mday=31,
///                  tm_hour=4, tm_min=26, tm_sec=40,
///                  tm_wday=2, tm_yday=365, tm_isdst=-1)
/// >>> time.strptime('Thu, 31 Dec 2014 04:26:40 +0000',
///                   '%a, %d %b %Y %H:%M:%S +0000')
/// time.struct_time(tm_year=2014, tm_mon=12, tm_mday=31,
///                  tm_hour=4, tm_min=26, tm_sec=40,
///                  tm_wday=3, tm_yday=365, tm_isdst=-1)
/// ```
///
/// [RFC 2822 date and time format]: https://tools.ietf.org/html/rfc2822#section-3.3
///
/// # Example
///
/// Let's see how `Parsed` correctly detects the second RFC 2822 string from before is inconsistent.
///
/// ```
/// # #[cfg(feature = "alloc")] {
/// use chrono::format::{ParseErrorKind, Parsed};
/// use chrono::Weekday;
///
/// let mut parsed = Parsed::new();
/// parsed.set_weekday(Weekday::Wed)?;
/// parsed.set_day(31)?;
/// parsed.set_month(12)?;
/// parsed.set_year(2014)?;
/// parsed.set_hour(4)?;
/// parsed.set_minute(26)?;
/// parsed.set_second(40)?;
/// parsed.set_offset(0)?;
/// let dt = parsed.to_datetime()?;
/// assert_eq!(dt.to_rfc2822(), "Wed, 31 Dec 2014 04:26:40 +0000");
///
/// let mut parsed = Parsed::new();
/// parsed.set_weekday(Weekday::Thu)?; // changed to the wrong day
/// parsed.set_day(31)?;
/// parsed.set_month(12)?;
/// parsed.set_year(2014)?;
/// parsed.set_hour(4)?;
/// parsed.set_minute(26)?;
/// parsed.set_second(40)?;
/// parsed.set_offset(0)?;
/// let result = parsed.to_datetime();
///
/// assert!(result.is_err());
/// if let Err(error) = result {
///     assert_eq!(error.kind(), ParseErrorKind::Impossible);
/// }
/// # }
/// # Ok::<(), chrono::ParseError>(())
/// ```
///
/// The same using chrono's built-in parser for RFC 2822 (the [RFC2822 formatting item]) and
/// [`format::parse()`] showing how to inspect a field on failure.
///
/// [RFC2822 formatting item]: crate::format::Fixed::RFC2822
/// [`format::parse()`]: crate::format::parse()
///
/// ```
/// # #[cfg(feature = "alloc")] {
/// use chrono::format::{parse, Fixed, Item, Parsed};
/// use chrono::Weekday;
///
/// let rfc_2822 = [Item::Fixed(Fixed::RFC2822)];
///
/// let mut parsed = Parsed::new();
/// parse(&mut parsed, "Wed, 31 Dec 2014 04:26:40 +0000", rfc_2822.iter())?;
/// let dt = parsed.to_datetime()?;
///
/// assert_eq!(dt.to_rfc2822(), "Wed, 31 Dec 2014 04:26:40 +0000");
///
/// let mut parsed = Parsed::new();
/// parse(&mut parsed, "Thu, 31 Dec 2014 04:26:40 +0000", rfc_2822.iter())?;
/// let result = parsed.to_datetime();
///
/// assert!(result.is_err());
/// if result.is_err() {
///     // What is the weekday?
///     assert_eq!(parsed.weekday(), Some(Weekday::Thu));
/// }
/// # }
/// # Ok::<(), chrono::ParseError>(())
/// ```
#[allow(clippy::manual_non_exhaustive)]
#[derive(Clone, PartialEq, Eq, Debug, Default, Hash)]
#[cfg_attr(feature = "defmt", derive(defmt::Format))]
pub struct Parsed {
    #[doc(hidden)]
    pub year: Option<i32>,
    #[doc(hidden)]
    pub year_div_100: Option<i32>,
    #[doc(hidden)]
    pub year_mod_10
```
# OUTRO - rule.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\chrono-0.4.45\src\offset\local\tz_info\rule.rs
**SHA:** 35cb7819e42240b6
**Timestamp:** 2026-08-28T02:33:27.204237
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dst_start: RuleDay,
- dst_start: RuleDay,
- let dst_start_transition_start =
- let dst_end_transition_start =

### Ouro Bruto (primeiros 5000 chars)
```
use super::parser::Cursor;
use super::timezone::{LocalTimeType, SECONDS_PER_WEEK};
use super::{
    CUMUL_DAY_IN_MONTHS_NORMAL_YEAR, DAY_IN_MONTHS_NORMAL_YEAR, DAYS_PER_WEEK, Error,
    SECONDS_PER_DAY,
};
use crate::{Datelike, NaiveDateTime};
use std::cmp::Ordering;

/// Transition rule
#[derive(Debug, Copy, Clone, Eq, PartialEq)]
pub(super) enum TransitionRule {
    /// Fixed local time type
    Fixed(LocalTimeType),
    /// Alternate local time types
    Alternate(AlternateTime),
}

impl TransitionRule {
    /// Parse a POSIX TZ string containing a time zone description, as described in [the POSIX documentation of the `TZ` environment variable](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap08.html).
    ///
    /// TZ string extensions from [RFC 8536](https://datatracker.ietf.org/doc/html/rfc8536#section-3.3.1) may be used.
    pub(super) fn from_tz_string(
        tz_string: &[u8],
        use_string_extensions: bool,
    ) -> Result<Self, Error> {
        let mut cursor = Cursor::new(tz_string);

        let std_time_zone = Some(parse_name(&mut cursor)?);
        let std_offset = parse_offset(&mut cursor)?;

        if cursor.is_empty() {
            return Ok(LocalTimeType::new(-std_offset, false, std_time_zone)?.into());
        }

        let dst_time_zone = Some(parse_name(&mut cursor)?);

        let dst_offset = match cursor.peek() {
            Some(&b',') => std_offset - 3600,
            Some(_) => parse_offset(&mut cursor)?,
            None => {
                return Err(Error::UnsupportedTzString("DST start and end rules must be provided"));
            }
        };

        if cursor.is_empty() {
            return Err(Error::UnsupportedTzString("DST start and end rules must be provided"));
        }

        cursor.read_tag(b",")?;
        let (dst_start, dst_start_time) = RuleDay::parse(&mut cursor, use_string_extensions)?;

        cursor.read_tag(b",")?;
        let (dst_end, dst_end_time) = RuleDay::parse(&mut cursor, use_string_extensions)?;

        if !cursor.is_empty() {
            return Err(Error::InvalidTzString("remaining data after parsing TZ string"));
        }

        Ok(AlternateTime::new(
            LocalTimeType::new(-std_offset, false, std_time_zone)?,
            LocalTimeType::new(-dst_offset, true, dst_time_zone)?,
            dst_start,
            dst_start_time,
            dst_end,
            dst_end_time,
        )?
        .into())
    }

    /// Find the local time type associated to the transition rule at the specified Unix time in seconds
    pub(super) fn find_local_time_type(&self, unix_time: i64) -> Result<&LocalTimeType, Error> {
        match self {
            TransitionRule::Fixed(local_time_type) => Ok(local_time_type),
            TransitionRule::Alternate(alternate_time) => {
                alternate_time.find_local_time_type(unix_time)
            }
        }
    }

    /// Find the local time type associated to the transition rule at the specified Unix time in seconds
    pub(super) fn find_local_time_type_from_local(
        &self,
        local_time: NaiveDateTime,
    ) -> Result<crate::MappedLocalTime<LocalTimeType>, Error> {
        match self {
            TransitionRule::Fixed(local_time_type) => {
                Ok(crate::MappedLocalTime::Single(*local_time_type))
            }
            TransitionRule::Alternate(alternate_time) => {
                alternate_time.find_local_time_type_from_local(local_time)
            }
        }
    }
}

impl From<LocalTimeType> for TransitionRule {
    fn from(inner: LocalTimeType) -> Self {
        TransitionRule::Fixed(inner)
    }
}

impl From<AlternateTime> for TransitionRule {
    fn from(inner: AlternateTime) -> Self {
        TransitionRule::Alternate(inner)
    }
}

/// Transition rule representing alternate local time types
#[derive(Debug, Copy, Clone, Eq, PartialEq)]
pub(super) struct AlternateTime {
    /// Local time type for standard time
    pub(super) std: LocalTimeType,
    /// Local time type for Daylight Saving Time
    pub(super) dst: LocalTimeType,
    /// Start day of Daylight Saving Time
    dst_start: RuleDay,
    /// Local start day time of Daylight Saving Time, in seconds
    dst_start_time: i32,
    /// End day of Daylight Saving Time
    dst_end: RuleDay,
    /// Local end day time of Daylight Saving Time, in seconds
    dst_end_time: i32,
}

impl AlternateTime {
    /// Construct a transition rule representing alternate local time types
    const fn new(
        std: LocalTimeType,
        dst: LocalTimeType,
        dst_start: RuleDay,
        dst_start_time: i32,
        dst_end: RuleDay,
        dst_end_time: i32,
    ) -> Result<Self, Error> {
        // Overflow is not possible
        if !((dst_start_time as i64).abs() < SECONDS_PER_WEEK
            && (dst_end_time as i64).abs() < SECONDS_PER_WEEK)
        {
            return Err(Error::TransitionRule("invalid DST start or end time"));
        }

        Ok(Self { std, dst, dst_start, dst
```
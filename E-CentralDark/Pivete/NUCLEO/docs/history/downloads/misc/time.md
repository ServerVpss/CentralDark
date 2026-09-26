# OUTRO - time.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\cjs\utils\time.js
**SHA:** 39fd1ae910ff51a4
**Timestamp:** 2026-08-28T02:21:54.655345
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const navigationStart = performance.timing?.navigationStart;
- if (typeof navigationStart === "number") {

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const randomSafeContext = require('./randomSafeContext.js');
const worldwide = require('./worldwide.js');

const ONE_SECOND_IN_MS = 1e3;
function dateTimestampInSeconds() {
  return randomSafeContext.safeDateNow() / ONE_SECOND_IN_MS;
}
function createUnixTimestampInSecondsFunc() {
  const { performance } = worldwide.GLOBAL_OBJ;
  if (!performance?.now || !performance.timeOrigin) {
    return dateTimestampInSeconds;
  }
  const timeOrigin = performance.timeOrigin;
  return () => {
    return (timeOrigin + randomSafeContext.withRandomSafeContext(() => performance.now())) / ONE_SECOND_IN_MS;
  };
}
let _cachedTimestampInSeconds;
function timestampInSeconds() {
  const func = _cachedTimestampInSeconds ?? (_cachedTimestampInSeconds = createUnixTimestampInSecondsFunc());
  return func();
}
let cachedTimeOrigin = null;
function getBrowserTimeOrigin() {
  const { performance } = worldwide.GLOBAL_OBJ;
  if (!performance?.now) {
    return void 0;
  }
  const threshold = 3e5;
  const performanceNow = randomSafeContext.withRandomSafeContext(() => performance.now());
  const dateNow = randomSafeContext.safeDateNow();
  const timeOrigin = performance.timeOrigin;
  if (typeof timeOrigin === "number") {
    const timeOriginDelta = Math.abs(timeOrigin + performanceNow - dateNow);
    if (timeOriginDelta < threshold) {
      return timeOrigin;
    }
  }
  const navigationStart = performance.timing?.navigationStart;
  if (typeof navigationStart === "number") {
    const navigationStartDelta = Math.abs(navigationStart + performanceNow - dateNow);
    if (navigationStartDelta < threshold) {
      return navigationStart;
    }
  }
  return dateNow - performanceNow;
}
function browserPerformanceTimeOrigin() {
  if (cachedTimeOrigin === null) {
    cachedTimeOrigin = getBrowserTimeOrigin();
  }
  return cachedTimeOrigin;
}

exports.browserPerformanceTimeOrigin = browserPerformanceTimeOrigin;
exports.dateTimestampInSeconds = dateTimestampInSeconds;
exports.timestampInSeconds = timestampInSeconds;
//# sourceMappingURL=time.js.map

```

---

# OUTRO - time.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\esm\utils\time.js
**SHA:** 718f0fb7c98a6693
**Timestamp:** 2026-08-28T02:22:09.867996
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const navigationStart = performance.timing?.navigationStart;
- if (typeof navigationStart === "number") {

### Ouro Bruto (primeiros 5000 chars)
```
import { safeDateNow, withRandomSafeContext } from './randomSafeContext.js';
import { GLOBAL_OBJ } from './worldwide.js';

const ONE_SECOND_IN_MS = 1e3;
function dateTimestampInSeconds() {
  return safeDateNow() / ONE_SECOND_IN_MS;
}
function createUnixTimestampInSecondsFunc() {
  const { performance } = GLOBAL_OBJ;
  if (!performance?.now || !performance.timeOrigin) {
    return dateTimestampInSeconds;
  }
  const timeOrigin = performance.timeOrigin;
  return () => {
    return (timeOrigin + withRandomSafeContext(() => performance.now())) / ONE_SECOND_IN_MS;
  };
}
let _cachedTimestampInSeconds;
function timestampInSeconds() {
  const func = _cachedTimestampInSeconds ?? (_cachedTimestampInSeconds = createUnixTimestampInSecondsFunc());
  return func();
}
let cachedTimeOrigin = null;
function getBrowserTimeOrigin() {
  const { performance } = GLOBAL_OBJ;
  if (!performance?.now) {
    return void 0;
  }
  const threshold = 3e5;
  const performanceNow = withRandomSafeContext(() => performance.now());
  const dateNow = safeDateNow();
  const timeOrigin = performance.timeOrigin;
  if (typeof timeOrigin === "number") {
    const timeOriginDelta = Math.abs(timeOrigin + performanceNow - dateNow);
    if (timeOriginDelta < threshold) {
      return timeOrigin;
    }
  }
  const navigationStart = performance.timing?.navigationStart;
  if (typeof navigationStart === "number") {
    const navigationStartDelta = Math.abs(navigationStart + performanceNow - dateNow);
    if (navigationStartDelta < threshold) {
      return navigationStart;
    }
  }
  return dateNow - performanceNow;
}
function browserPerformanceTimeOrigin() {
  if (cachedTimeOrigin === null) {
    cachedTimeOrigin = getBrowserTimeOrigin();
  }
  return cachedTimeOrigin;
}

export { browserPerformanceTimeOrigin, dateTimestampInSeconds, timestampInSeconds };
//# sourceMappingURL=time.js.map

```

---

# OUTRO - time.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfb-0.7.3\src\internal\time.rs
**SHA:** 301ed187a55d5e1d
**Timestamp:** 2026-08-28T02:33:22.981726
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: If SystemTime ever gains saturating_add and saturing_sub (see

### Ouro Bruto (primeiros 5000 chars)
```
use std::time::{Duration, SystemTime, UNIX_EPOCH};

//===========================================================================//

/// The CFB timestamp value for the Unix epoch (Jan 1, 1970 UTC).
const UNIX_EPOCH_TIMESTAMP: u64 = 116444736000000000;

/// Returns the current time as a CFB file timestamp (the number of
/// 100-nanosecond intervals since January 1, 1601 UTC).
pub fn current_timestamp() -> u64 {
    timestamp_from_system_time(SystemTime::now())
}

/// Converts a local `SystemTime` to a CFB file timestamp.
fn timestamp_from_system_time(system_time: SystemTime) -> u64 {
    match system_time.duration_since(UNIX_EPOCH) {
        Ok(duration) => {
            let delta = duration_to_timestamp_delta(duration);
            UNIX_EPOCH_TIMESTAMP.saturating_add(delta)
        }
        Err(err) => {
            let delta = duration_to_timestamp_delta(err.duration());
            UNIX_EPOCH_TIMESTAMP.saturating_sub(delta)
        }
    }
}

/// Converts a CFB file timestamp to a local `SystemTime`.
pub fn system_time_from_timestamp(timestamp: u64) -> SystemTime {
    // The maximum range of SystemTime varies by system, and some systems
    // (e.g. 32-bit Linux) can't represent, say, a zero CFB timestamp.  So we
    // center our calculations around UNIX_EPOCH (the one value we can be sure
    // that SystemTime can represent), and use checked_add and checked_sub to
    // avoid panicking on overflow.
    //
    // TODO: If SystemTime ever gains saturating_add and saturing_sub (see
    // https://github.com/rust-lang/rust/issues/71224) we should use those
    // instead.
    let system_time = if timestamp >= UNIX_EPOCH_TIMESTAMP {
        UNIX_EPOCH.checked_add(timestamp_delta_to_duration(
            timestamp - UNIX_EPOCH_TIMESTAMP,
        ))
    } else {
        UNIX_EPOCH.checked_sub(timestamp_delta_to_duration(
            UNIX_EPOCH_TIMESTAMP - timestamp,
        ))
    };
    // If overflow does occur, just return UNIX_EPOCH; this will be totally
    // wrong, but at least it will allow us to continue reading the CFB file
    // without panicking.
    system_time.unwrap_or(UNIX_EPOCH)
}

fn duration_to_timestamp_delta(duration: Duration) -> u64 {
    duration
        .as_secs()
        .saturating_mul(10_000_000)
        .saturating_add((duration.subsec_nanos() / 100) as u64)
}

fn timestamp_delta_to_duration(delta: u64) -> Duration {
    Duration::new(delta / 10_000_000, (delta % 10_000_000) as u32 * 100)
}

//===========================================================================//

#[cfg(test)]
mod tests {
    use super::{
        duration_to_timestamp_delta, system_time_from_timestamp,
        timestamp_delta_to_duration, timestamp_from_system_time,
        UNIX_EPOCH_TIMESTAMP,
    };
    use std::time::{Duration, UNIX_EPOCH};

    #[test]
    fn extreme_timestamp_delta() {
        // The maximum representable CFB timestamp:
        let timestamp = u64::MAX;
        let duration = timestamp_delta_to_duration(timestamp);
        assert_eq!(duration.as_secs(), 1844674407370);
        assert_eq!(duration.subsec_nanos(), 955161500);
        assert_eq!(duration_to_timestamp_delta(duration), timestamp);
    }

    #[test]
    fn extreme_duration() {
        // The maximum representable duration:
        let duration = Duration::new(u64::MAX, 999_999_999);
        // This duration will not fit in a 64-bit CFB timestamp delta.  Rather
        // than overflow, we should return a saturated result.
        assert_eq!(duration_to_timestamp_delta(duration), u64::MAX);
    }

    #[test]
    fn unix_epoch() {
        assert_eq!(
            UNIX_EPOCH_TIMESTAMP,
            timestamp_from_system_time(UNIX_EPOCH)
        );
        assert_eq!(
            system_time_from_timestamp(UNIX_EPOCH_TIMESTAMP),
            UNIX_EPOCH
        );
    }

    #[test]
    fn after_unix_epoch() {
        let sat_18_mar_2017_at_18_46_36_utc =
            UNIX_EPOCH + Duration::from_secs(1489862796);
        assert_eq!(
            timestamp_from_system_time(sat_18_mar_2017_at_18_46_36_utc),
            131343363960000000,
        );
        assert_eq!(
            system_time_from_timestamp(131343363960000000),
            sat_18_mar_2017_at_18_46_36_utc
        );
    }

    #[test]
    fn before_unix_epoch() {
        let sun_20_jul_1969_at_20_17_00_utc =
            UNIX_EPOCH - Duration::from_secs(14182980);
        assert_eq!(
            timestamp_from_system_time(sun_20_jul_1969_at_20_17_00_utc),
            116302906200000000,
        );
        assert_eq!(
            system_time_from_timestamp(116302906200000000),
            sun_20_jul_1969_at_20_17_00_utc
        );
    }

    #[test]
    fn extreme_timestamps() {
        // If the system we're on can't represent these timestamps in a
        // SystemTime, then we'll get incorrect values, but we shouldn't panic.
        let min_time = system_time_from_timestamp(u64::MIN);
        let max_time = system_time_from_timestamp(u64::MAX);
        assert!(m
```

---

# OUTRO - time.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-0.3.55\tests\integration\time.rs
**SHA:** 4c1b8ffec0a0de06
**Timestamp:** 2026-08-28T02:36:08.180923
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn duration_until(#[case] start: Time, #[case] end: Time, #[case] expected: SignedDuration) {
- fn duration_since(#[case] end: Time, #[case] start: Time, #[case] expected: SignedDuration) {

### Ouro Bruto (primeiros 5000 chars)
```
use std::cmp::Ordering;

use rstest::rstest;
use time::ext::{NumericalDuration, NumericalStdDuration};
use time::macros::time;
use time::{Result, SignedDuration, Time};

#[rstest]
#[case(1, 2, 3, time!(1:02:03))]
#[case(24, 0, 0, None)]
#[case(0, 60, 0, None)]
#[case(0, 0, 60, None)]
fn from_hms(
    #[case] hour: u8,
    #[case] minute: u8,
    #[case] second: u8,
    #[case] expected: impl Into<Option<Time>>,
) {
    assert_eq!(Time::from_hms(hour, minute, second).ok(), expected.into());
}

#[rstest]
#[case(1, 2, 3, 4, time!(1:02:03.004))]
#[case(24, 0, 0, 0, None)]
#[case(0, 60, 0, 0, None)]
#[case(0, 0, 60, 0, None)]
#[case(0, 0, 0, 1_000, None)]
fn from_hms_milli(
    #[case] hour: u8,
    #[case] minute: u8,
    #[case] second: u8,
    #[case] milli: u16,
    #[case] expected: impl Into<Option<Time>>,
) {
    assert_eq!(
        Time::from_hms_milli(hour, minute, second, milli).ok(),
        expected.into()
    );
}

#[rstest]
#[case(1, 2, 3, 4, time!(1:02:03.000_004))]
#[case(24, 0, 0, 0, None)]
#[case(0, 60, 0, 0, None)]
#[case(0, 0, 60, 0, None)]
#[case(0, 0, 0, 1_000_000, None)]
fn from_hms_micro(
    #[case] hour: u8,
    #[case] minute: u8,
    #[case] second: u8,
    #[case] micro: u32,
    #[case] expected: impl Into<Option<Time>>,
) {
    assert_eq!(
        Time::from_hms_micro(hour, minute, second, micro).ok(),
        expected.into()
    );
}

#[rstest]
#[case(1, 2, 3, 4, time!(1:02:03.000_000_004))]
#[case(24, 0, 0, 0, None)]
#[case(0, 60, 0, 0, None)]
#[case(0, 0, 60, 0, None)]
#[case(0, 0, 0, 1_000_000_000, None)]
fn from_hms_nano(
    #[case] hour: u8,
    #[case] minute: u8,
    #[case] second: u8,
    #[case] nano: u32,
    #[case] expected: impl Into<Option<Time>>,
) {
    assert_eq!(
        Time::from_hms_nano(hour, minute, second, nano).ok(),
        expected.into()
    );
}

#[rstest]
#[case(time!(1:02:03), (1, 2, 3))]
fn as_hms(#[case] datetime: Time, #[case] expected: (u8, u8, u8)) {
    assert_eq!(datetime.as_hms(), expected);
}

#[rstest]
#[case(time!(1:02:03.004), (1, 2, 3, 4))]
fn as_hms_milli(#[case] datetime: Time, #[case] expected: (u8, u8, u8, u16)) {
    assert_eq!(datetime.as_hms_milli(), expected);
}

#[rstest]
#[case(time!(1:02:03.004_005), (1, 2, 3, 4_005))]
fn as_hms_micro(#[case] datetime: Time, #[case] expected: (u8, u8, u8, u32)) {
    assert_eq!(datetime.as_hms_micro(), expected);
}

#[rstest]
#[case(time!(1:02:03.004_005_006), (1, 2, 3, 4_005_006))]
fn as_hms_nano(#[case] datetime: Time, #[case] expected: (u8, u8, u8, u32)) {
    assert_eq!(datetime.as_hms_nano(), expected);
}

#[rstest]
#[case(0)]
#[case(12)]
#[case(23)]
fn hour(#[case] hour_: u8) -> Result<()> {
    assert_eq!(Time::from_hms(hour_, 0, 0)?.hour(), hour_);
    assert_eq!(Time::from_hms(hour_, 59, 59)?.hour(), hour_);
    Ok(())
}

#[rstest]
#[case(0)]
#[case(30)]
#[case(59)]
fn minute(#[case] minute_: u8) -> Result<()> {
    assert_eq!(Time::from_hms(0, minute_, 0)?.minute(), minute_);
    assert_eq!(Time::from_hms(23, minute_, 59)?.minute(), minute_);
    Ok(())
}

#[rstest]
#[case(0)]
#[case(30)]
#[case(59)]
fn second(#[case] second_: u8) -> Result<()> {
    assert_eq!(Time::from_hms(0, 0, second_)?.second(), second_);
    assert_eq!(Time::from_hms(23, 59, second_)?.second(), second_);
    Ok(())
}

#[rstest]
#[case(0)]
#[case(500)]
#[case(999)]
fn millisecond(#[case] milli: u16) -> Result<()> {
    assert_eq!(Time::from_hms_milli(0, 0, 0, milli)?.millisecond(), milli);
    assert_eq!(
        Time::from_hms_milli(23, 59, 59, milli)?.millisecond(),
        milli
    );
    Ok(())
}

#[rstest]
#[case(0)]
#[case(4_005)]
#[case(999_000)]
fn microsecond(#[case] micro: u32) -> Result<()> {
    assert_eq!(Time::from_hms_micro(0, 0, 0, micro)?.microsecond(), micro);
    assert_eq!(
        Time::from_hms_micro(23, 59, 59, micro)?.microsecond(),
        micro
    );
    Ok(())
}

#[rstest]
#[case(0)]
#[case(4_005_006)]
#[case(999_000_000)]
fn nanosecond(#[case] nano: u32) -> Result<()> {
    assert_eq!(Time::from_hms_nano(0, 0, 0, nano)?.nanosecond(), nano);
    assert_eq!(Time::from_hms_nano(23, 59, 59, nano)?.nanosecond(), nano);
    Ok(())
}

#[rstest]
#[case(time!(18:00), Time::MIDNIGHT, 6.hours())]
#[case(time!(23:00), time!(1:00), 2.hours())]
#[case(time!(12:30), time!(14:00), 90.minutes())]
fn duration_until(#[case] start: Time, #[case] end: Time, #[case] expected: SignedDuration) {
    assert_eq!(start.duration_until(end), expected);
}

#[rstest]
#[case(Time::MIDNIGHT, time!(18:00), 6.hours())]
#[case(time!(1:00), time!(23:00), 2.hours())]
#[case(time!(14:00), time!(12:30), 90.minutes())]
fn duration_since(#[case] end: Time, #[case] start: Time, #[case] expected: SignedDuration) {
    assert_eq!(end.duration_since(start), expected);
}

#[rstest]
#[case(time!(1:02:03.004_005_006), 7, time!(7:02:03.004_005_006))]
#[case(time!(1:02:03.004_005_006), 24, None)]
fn replace_hour(
    #[case] time_val: Time,
    #[case] value: u8,
    #[case] expected: impl Into<Option<Time>>,
) {
    assert_eq!(t
```

---

# OUTRO - time.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\time-macros-0.2.32\src\time.rs
**SHA:** b61d710c374a9435
**Timestamp:** 2026-08-28T02:36:09.098479
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- span_start: Some(span.start()),
- span_start: Some(span.start()),
- span_start: Some(span.start()),
- span_start: Some(hour_span.start()),
- span_start: Some(hour_span.start()),
- span_start: Some(minute_span.start()),
- span_start: Some(second_span.start()),

### Ouro Bruto (primeiros 5000 chars)
```
use std::iter::{self, Peekable};

use proc_macro::{Span, TokenStream, TokenTree, token_stream};
use time_core::unit::*;

use crate::Error;
use crate::helpers::{consume_any_ident, consume_number, consume_punct};
use crate::to_tokens::ToTokenStream;

enum Period {
    Am,
    Pm,
    _24,
}

pub(crate) struct Time {
    pub(crate) hour: u8,
    pub(crate) minute: u8,
    pub(crate) second: u8,
    pub(crate) nanosecond: u32,
}

fn parse_second_and_nanosecond(
    chars: &mut Peekable<token_stream::IntoIter>,
) -> Result<(Span, u8, u32), Error> {
    match chars.next() {
        Some(TokenTree::Literal(literal)) => {
            let span = literal.span();
            let raw = literal.to_string().replace('_', "");

            if let Some((second, subsecond)) = raw.split_once('.') {
                let Ok(second) = second.parse() else {
                    return Err(Error::InvalidComponent {
                        name: "second",
                        value: raw,
                        span_start: Some(span.start()),
                        span_end: Some(span.end()),
                    });
                };

                let subsecond = subsecond
                    .chars()
                    .chain(iter::repeat('0'))
                    .take(9)
                    .collect::<String>();
                let Ok(nanosecond) = subsecond.parse() else {
                    return Err(Error::InvalidComponent {
                        name: "second",
                        value: raw,
                        span_start: Some(span.start()),
                        span_end: Some(span.end()),
                    });
                };

                Ok((span, second, nanosecond))
            } else {
                let Ok(second) = raw.parse() else {
                    return Err(Error::InvalidComponent {
                        name: "second",
                        value: raw,
                        span_start: Some(span.start()),
                        span_end: Some(span.end()),
                    });
                };
                Ok((span, second, 0))
            }
        }
        Some(tree) => Err(Error::UnexpectedToken { tree }),
        None => Err(Error::UnexpectedEndOfInput),
    }
}

pub(crate) fn parse(chars: &mut Peekable<token_stream::IntoIter>) -> Result<Time, Error> {
    fn consume_period(chars: &mut Peekable<token_stream::IntoIter>) -> (Option<Span>, Period) {
        if let Ok(span) = consume_any_ident(&["am", "AM"], chars) {
            (Some(span), Period::Am)
        } else if let Ok(span) = consume_any_ident(&["pm", "PM"], chars) {
            (Some(span), Period::Pm)
        } else {
            (None, Period::_24)
        }
    }

    let (hour_span, hour) = consume_number("hour", chars)?;

    let ((minute_span, minute), (second_span, second, nanosecond), (period_span, period)) =
        match consume_period(chars) {
            // Nothing but the 12-hour clock hour and AM/PM
            (period_span @ Some(_), period) => (
                (Span::mixed_site(), 0),
                (Span::mixed_site(), 0, 0),
                (period_span, period),
            ),
            (None, _) => {
                consume_punct(':', chars)?;
                let (minute_span, minute) = consume_number::<u8>("minute", chars)?;
                let (second_span, second, nanosecond) = if consume_punct(':', chars).is_ok() {
                    parse_second_and_nanosecond(chars)?
                } else {
                    (Span::mixed_site(), 0, 0)
                };
                let (period_span, period) = consume_period(chars);
                (
                    (minute_span, minute),
                    (second_span, second, nanosecond),
                    (period_span, period),
                )
            }
        };

    let hour = match (hour, period) {
        (0, Period::Am | Period::Pm) => {
            return Err(Error::InvalidComponent {
                name: "hour",
                value: hour.to_string(),
                span_start: Some(hour_span.start()),
                span_end: Some(period_span.unwrap_or_else(|| hour_span.end())),
            });
        }
        (12, Period::Am) => 0,
        (12, Period::Pm) => 12,
        (hour, Period::Am | Period::_24) => hour,
        (hour, Period::Pm) => hour + 12,
    };

    if hour >= Hour::per_t(Day) {
        Err(Error::InvalidComponent {
            name: "hour",
            value: hour.to_string(),
            span_start: Some(hour_span.start()),
            span_end: Some(period_span.unwrap_or_else(|| hour_span.end())),
        })
    } else if minute >= Minute::per_t(Hour) {
        Err(Error::InvalidComponent {
            name: "minute",
            value: minute.to_string(),
            span_start: Some(minute_span.start()),
            span_end: Some(minute_span.end()),
        })
    } else if second >= Second::per_t(Minute) {
        Err(Error::InvalidComponent {
            name: "second",
       
```
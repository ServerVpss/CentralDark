# OUTRO - interval.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\time\interval.rs
**SHA:** 2a3dbc885ebe02cf
**Timestamp:** 2026-08-28T02:36:20.885644
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// let start = Instant::now() + Duration::from_millis(50);
- pub fn interval_at(start: Instant, period: Duration) -> Interval {
- start: Instant,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::time::{sleep_until, Duration, Instant, Sleep};
use crate::util::trace;

use std::future::{poll_fn, Future};
use std::panic::Location;
use std::pin::Pin;
use std::task::{ready, Context, Poll};

/// Creates new [`Interval`] that yields with interval of `period`. The first
/// tick completes immediately. The default [`MissedTickBehavior`] is
/// [`Burst`](MissedTickBehavior::Burst), but this can be configured
/// by calling [`set_missed_tick_behavior`](Interval::set_missed_tick_behavior).
///
/// An interval will tick indefinitely. At any time, the [`Interval`] value can
/// be dropped. This cancels the interval.
///
/// This function is equivalent to
/// [`interval_at(Instant::now(), period)`](interval_at).
///
/// # Panics
///
/// This function panics if `period` is zero.
///
/// # Examples
///
/// ```
/// use tokio::time::{self, Duration};
///
/// # #[tokio::main(flavor = "current_thread")]
/// # async fn main() {
/// let mut interval = time::interval(Duration::from_millis(10));
///
/// interval.tick().await; // ticks immediately
/// interval.tick().await; // ticks after 10ms
/// interval.tick().await; // ticks after 10ms
///
/// // approximately 20ms have elapsed.
/// # }
/// ```
///
/// A simple example using `interval` to execute a task every two seconds.
///
/// The difference between `interval` and [`sleep`] is that an [`Interval`]
/// measures the time since the last tick, which means that [`.tick().await`]
/// may wait for a shorter time than the duration specified for the interval
/// if some time has passed between calls to [`.tick().await`].
///
/// If the tick in the example below was replaced with [`sleep`], the task
/// would only be executed once every three seconds, and not every two
/// seconds.
///
/// ```
/// use tokio::time;
///
/// async fn task_that_takes_a_second() {
///     println!("hello");
///     time::sleep(time::Duration::from_secs(1)).await
/// }
///
/// # #[tokio::main(flavor = "current_thread")]
/// # async fn main() {
/// let mut interval = time::interval(time::Duration::from_secs(2));
/// for _i in 0..5 {
///     interval.tick().await;
///     task_that_takes_a_second().await;
/// }
/// # }
/// ```
///
/// [`sleep`]: crate::time::sleep()
/// [`.tick().await`]: Interval::tick
#[track_caller]
pub fn interval(period: Duration) -> Interval {
    assert!(period > Duration::new(0, 0), "`period` must be non-zero.");
    internal_interval_at(Instant::now(), period, trace::caller_location())
}

/// Creates new [`Interval`] that yields with interval of `period` with the
/// first tick completing at `start`. The default [`MissedTickBehavior`] is
/// [`Burst`](MissedTickBehavior::Burst), but this can be configured
/// by calling [`set_missed_tick_behavior`](Interval::set_missed_tick_behavior).
///
/// An interval will tick indefinitely. At any time, the [`Interval`] value can
/// be dropped. This cancels the interval.
///
/// # Panics
///
/// This function panics if `period` is zero.
///
/// # Examples
///
/// ```
/// use tokio::time::{interval_at, Duration, Instant};
///
/// # #[tokio::main(flavor = "current_thread")]
/// # async fn main() {
/// let start = Instant::now() + Duration::from_millis(50);
/// let mut interval = interval_at(start, Duration::from_millis(10));
///
/// interval.tick().await; // ticks after 50ms
/// interval.tick().await; // ticks after 10ms
/// interval.tick().await; // ticks after 10ms
///
/// // approximately 70ms have elapsed.
/// # }
/// ```
#[track_caller]
pub fn interval_at(start: Instant, period: Duration) -> Interval {
    assert!(period > Duration::new(0, 0), "`period` must be non-zero.");
    internal_interval_at(start, period, trace::caller_location())
}

#[cfg_attr(not(all(tokio_unstable, feature = "tracing")), allow(unused_variables))]
fn internal_interval_at(
    start: Instant,
    period: Duration,
    location: Option<&'static Location<'static>>,
) -> Interval {
    #[cfg(all(tokio_unstable, feature = "tracing"))]
    let resource_span = {
        let location = location.expect("should have location if tracing");

        tracing::trace_span!(
            parent: None,
            "runtime.resource",
            concrete_type = "Interval",
            kind = "timer",
            loc.file = location.file(),
            loc.line = location.line(),
            loc.col = location.column(),
        )
    };

    Interval {
        delay: Box::pin(sleep_until(start)),
        period,
        missed_tick_behavior: MissedTickBehavior::default(),
        #[cfg(all(tokio_unstable, feature = "tracing"))]
        resource_span,
    }
}

/// Defines the behavior of an [`Interval`] when it misses a tick.
///
/// Sometimes, an [`Interval`]'s tick is missed. For example, consider the
/// following:
///
/// ```
/// use tokio::time::{self, Duration};
/// # async fn task_that_takes_one_to_three_millis() {}
///
/// # #[tokio::main(flavor = "current_thread")]
/// # async fn main() {
/// // ticks every 2 milliseconds
/// let mut interval = time::interval
```
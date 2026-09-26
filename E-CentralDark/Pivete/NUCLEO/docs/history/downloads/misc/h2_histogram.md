# OUTRO - h2_histogram.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\metrics\histogram\h2_histogram.rs
**SHA:** 3f8b25ab9805f9c2
**Timestamp:** 2026-08-28T02:36:17.943004
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = s + (offset << w);
- let last_bucket_start = Duration::from_nanos(histogram.bucket_range(histogram.num_buckets - 1).start);
- let second_last_bucket_start = Duration::from_nanos(histogram.bucket_range(histogram.num_buckets - 2).start);
- "last bucket start ({last_bucket_start:?} must be at least as big as `max_value` ({max_value:?})"
- "second last bucket end ({second_last_bucket_start:?} must be at least as big as `max_value` ({max_value:?})"

### Ouro Bruto (primeiros 5000 chars)
```
use crate::runtime::metrics::batch::duration_as_u64;
use std::cmp;
use std::error::Error;
use std::fmt::{Display, Formatter};
use std::time::Duration;

const DEFAULT_MIN_VALUE: Duration = Duration::from_nanos(100);
const DEFAULT_MAX_VALUE: Duration = Duration::from_secs(60);

/// Default precision is 2^-2 = 25% max error
const DEFAULT_PRECISION: u32 = 2;
const MAX_PRECISION: u32 = 10;

/// Log Histogram
///
/// This implements an [H2 Histogram](https://iop.systems/blog/h2-histogram/), a histogram similar
/// to HdrHistogram, but with better performance. It guarantees an error bound of `2^-p`.
///
/// Unlike a traditional H2 histogram this has two small changes:
/// 1. The 0th bucket runs for `0..min_value`. This allows truncating a large number of buckets that
///    would cover extremely short timescales that customers usually don't care about.
/// 2. The final bucket runs all the way to `u64::MAX` — traditional H2 histograms would truncate
///    or reject these values.
///
/// For information about the default configuration, see [`LogHistogramBuilder`].
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct LogHistogram {
    /// Number of buckets in the histogram
    pub(crate) num_buckets: usize,

    /// Precision of histogram. Error is bounded to 2^-p.
    pub(crate) p: u32,

    /// All buckets `idx < bucket_offset` are grouped into bucket 0.
    ///
    /// This increases the smallest measurable value of the histogram.
    pub(crate) bucket_offset: usize,
}

impl Default for LogHistogram {
    fn default() -> Self {
        LogHistogramBuilder::default().build()
    }
}

impl LogHistogram {
    /// Create a Histogram configuration directly from values for `n` and `p`.
    ///
    /// # Panics
    /// - If `bucket_offset` is greater than the specified number of buckets, `(n - p + 1) * 2^p`
    fn from_n_p(n: u32, p: u32, bucket_offset: usize) -> Self {
        assert!(n >= p, "{n} (n) must be at least as large as {p} (p)");
        let num_buckets = ((n - p + 1) << p) as usize - bucket_offset;
        Self {
            num_buckets,
            p,
            bucket_offset,
        }
    }

    fn truncate_to_max_value(&self, max_value: u64) -> LogHistogram {
        let mut hist = *self;
        while hist.max_value() >= max_value {
            hist.num_buckets -= 1;
        }
        hist.num_buckets += 1;
        hist
    }

    /// Creates a builder for [`LogHistogram`]
    pub fn builder() -> LogHistogramBuilder {
        LogHistogramBuilder::default()
    }

    /// The maximum value that can be stored before truncation in this histogram
    pub fn max_value(&self) -> u64 {
        self.bucket_range(self.num_buckets - 2).end
    }

    pub(crate) fn value_to_bucket(&self, value: u64) -> usize {
        let index = bucket_index(value, self.p);
        let offset_bucket = index.saturating_sub(self.bucket_offset as u64);
        let max = self.num_buckets - 1;
        offset_bucket.min(max as u64) as usize
    }

    pub(crate) fn bucket_range(&self, bucket: usize) -> std::ops::Range<u64> {
        let LogHistogram {
            p,
            bucket_offset,
            num_buckets,
        } = self;
        let input_bucket = bucket;
        let bucket = bucket + bucket_offset;
        let range_start_0th_bucket = match input_bucket {
            0 => Some(0_u64),
            _ => None,
        };
        let range_end_last_bucket = match input_bucket {
            n if n == num_buckets - 1 => Some(u64::MAX),
            _ => None,
        };
        if bucket < 1 << p {
            // The first set of buckets are all size 1
            let bucket = bucket as u64;
            range_start_0th_bucket.unwrap_or(bucket)..range_end_last_bucket.unwrap_or(bucket + 1)
        } else {
            // Determine which range of buckets we're in, then determine which bucket in the range it is
            let bucket = bucket as u64;
            let p = *p as u64;
            let w = (bucket >> p) - 1;
            let base_bucket = (w + 1) * (1_u64 << p);
            let offset = bucket - base_bucket;
            let s = 1_u64 << (w + p);
            let start = s + (offset << w);
            let end = s + ((offset + 1) << w);

            range_start_0th_bucket.unwrap_or(start)..range_end_last_bucket.unwrap_or(end)
        }
    }
}

/// Configuration for a [`LogHistogram`]
///
/// The log-scaled histogram implements an H2 histogram where the first bucket covers
/// the range from 0 to [`LogHistogramBuilder::min_value`] and the final bucket covers
/// [`LogHistogramBuilder::max_value`] to infinity. The precision is bounded to the specified
/// [`LogHistogramBuilder::max_error`]. Specifically, the precision is the next smallest value
/// of `2^-p` such that it is smaller than the requested max error. You can also select `p` directly
/// with [`LogHistogramBuilder::precision_exact`].
///
/// Depending on the selected parameters, the number of buckets required is variable. To ensure
/// that the histogram size 
```
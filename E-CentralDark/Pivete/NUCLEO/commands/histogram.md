# COMANDO - histogram.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\metrics\histogram.rs
**SHA:** ad85c830f2a3b9b5
**Timestamp:** 2026-08-28T02:36:17.624733
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: bucket_width * bucket as u64,
- start: if bucket == 0 {

### Ouro Bruto (primeiros 5000 chars)
```
mod h2_histogram;

pub use h2_histogram::{InvalidHistogramConfiguration, LogHistogram, LogHistogramBuilder};

use crate::util::metric_atomics::MetricAtomicU64;
use std::sync::atomic::Ordering::Relaxed;

use crate::runtime::metrics::batch::duration_as_u64;
use std::cmp;
use std::ops::Range;
use std::time::Duration;

#[derive(Debug)]
pub(crate) struct Histogram {
    /// The histogram buckets
    buckets: Box<[MetricAtomicU64]>,

    /// The type of the histogram
    ///
    /// This handles `fn(bucket) -> Range` and `fn(value) -> bucket`
    histogram_type: HistogramType,
}

#[derive(Debug, Clone)]
pub(crate) struct HistogramBuilder {
    pub(crate) histogram_type: HistogramType,
    pub(crate) legacy: Option<LegacyBuilder>,
}

#[derive(Debug, Clone)]
pub(crate) struct LegacyBuilder {
    pub(crate) resolution: u64,
    pub(crate) scale: HistogramScale,
    pub(crate) num_buckets: usize,
}

impl Default for LegacyBuilder {
    fn default() -> Self {
        Self {
            resolution: 100_000,
            num_buckets: 10,
            scale: HistogramScale::Linear,
        }
    }
}

#[derive(Debug)]
pub(crate) struct HistogramBatch {
    buckets: Box<[u64]>,
    configuration: HistogramType,
}

cfg_unstable! {
    /// Whether the histogram used to aggregate a metric uses a linear or
    /// logarithmic scale.
    #[derive(Debug, Copy, Clone, Eq, PartialEq)]
    #[non_exhaustive]
    pub enum HistogramScale {
        /// Linear bucket scale
        Linear,

        /// Logarithmic bucket scale
        Log,
    }

    /// Configuration for the poll count histogram
    #[derive(Debug, Clone)]
    pub struct HistogramConfiguration {
        pub(crate) inner: HistogramType
    }

    impl HistogramConfiguration {
        /// Create a linear bucketed histogram
        ///
        /// # Arguments
        ///
        /// * `bucket_width`: The width of each bucket
        /// * `num_buckets`: The number of buckets
        pub fn linear(bucket_width: Duration, num_buckets: usize) -> Self {
            Self {
                inner: HistogramType::Linear(LinearHistogram {
                    num_buckets,
                    bucket_width: duration_as_u64(bucket_width),
                }),
            }
        }

        /// Creates a log-scaled bucketed histogram
        ///
        /// See [`LogHistogramBuilder`] for information about configuration & defaults
        pub fn log(configuration: impl Into<LogHistogram>) -> Self {
            Self {
                inner: HistogramType::H2(configuration.into()),
            }
        }
    }
}

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub(crate) enum HistogramType {
    /// Linear histogram with fixed width buckets
    Linear(LinearHistogram),

    /// Old log histogram where each bucket doubles in size
    LogLegacy(LegacyLogHistogram),

    /// Log histogram implementation based on H2 Histograms
    H2(LogHistogram),
}

impl HistogramType {
    pub(crate) fn num_buckets(&self) -> usize {
        match self {
            HistogramType::Linear(linear) => linear.num_buckets,
            HistogramType::LogLegacy(log) => log.num_buckets,
            HistogramType::H2(h2) => h2.num_buckets,
        }
    }
    fn value_to_bucket(&self, value: u64) -> usize {
        match self {
            HistogramType::Linear(LinearHistogram {
                num_buckets,
                bucket_width,
            }) => {
                let max = num_buckets - 1;
                cmp::min(value / *bucket_width, max as u64) as usize
            }
            HistogramType::LogLegacy(LegacyLogHistogram {
                num_buckets,
                first_bucket_width,
            }) => {
                let max = num_buckets - 1;
                if value < *first_bucket_width {
                    0
                } else {
                    let significant_digits = 64 - value.leading_zeros();
                    let bucket_digits = 64 - (first_bucket_width - 1).leading_zeros();
                    cmp::min(significant_digits as usize - bucket_digits as usize, max)
                }
            }
            HistogramType::H2(log_histogram) => log_histogram.value_to_bucket(value),
        }
    }

    fn bucket_range(&self, bucket: usize) -> Range<u64> {
        match self {
            HistogramType::Linear(LinearHistogram {
                num_buckets,
                bucket_width,
            }) => Range {
                start: bucket_width * bucket as u64,
                end: if bucket == num_buckets - 1 {
                    u64::MAX
                } else {
                    bucket_width * (bucket as u64 + 1)
                },
            },
            HistogramType::LogLegacy(LegacyLogHistogram {
                num_buckets,
                first_bucket_width,
            }) => Range {
                start: if bucket == 0 {
                    0
                } else {
                    first_bucket_width << (bucket - 1)
                },
                end: if buck
```
# OUTRO - schedule_latency_mock.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\metrics\schedule_latency_mock.rs
**SHA:** 77fc08f4853ef168
**Timestamp:** 2026-08-28T02:36:17.758732
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub(crate) fn new(_runtime_start: Option<Instant>) -> Self {
- pub(crate) fn prepare(self, _runtime_start: Option<Instant>) -> Option<ScheduleLatencyContext> {

### Ouro Bruto (primeiros 5000 chars)
```
//! A mock implementation of the types in `schedule_latency`. These types
//! are zero-sized so that the size of types using them are not increased
//! unless schedule latency tracking is explicitly enabled.

use std::time::Instant;

#[derive(Copy, Clone)]
pub(crate) struct ScheduleLatencyInstant();

impl ScheduleLatencyInstant {
    pub(crate) fn new(_runtime_start: Option<Instant>) -> Self {
        Self()
    }

    pub(crate) fn prepare(self, _runtime_start: Option<Instant>) -> Option<ScheduleLatencyContext> {
        None
    }
}

pub(crate) struct ScheduleLatencyContext {
    _private: (),
}

impl ScheduleLatencyContext {
    // This method is referenced (but never called) when the `schedule-latency`
    // feature is disabled and `tokio_unstable` is enabled.
    #[allow(dead_code)]
    pub(crate) fn elapsed_nanos(&self, _now: Instant) -> u64 {
        unimplemented!("This should never be called because prepare() always returns None")
    }
}

```
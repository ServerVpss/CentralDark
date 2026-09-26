# COMANDO - worker.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\scheduler\multi_thread\worker.rs
**SHA:** b7860cfa69f197eb
**Timestamp:** 2026-08-28T02:36:18.415171
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.rand.fastrand_n(num as u32) as usize;
- let start = self

### Ouro Bruto (primeiros 5000 chars)
```
//! A scheduler is initialized with a fixed number of workers. Each worker is
//! driven by a thread. Each worker has a "core" which contains data such as the
//! run queue and other state. When `block_in_place` is called, the worker's
//! "core" is handed off to a new thread allowing the scheduler to continue to
//! make progress while the originating thread blocks.
//!
//! # Shutdown
//!
//! Shutting down the runtime involves the following steps:
//!
//!  1. The Shared::close method is called. This closes the inject queue and
//!     `OwnedTasks` instance and wakes up all worker threads.
//!
//!  2. Each worker thread observes the close signal next time it runs
//!     Core::maintenance by checking whether the inject queue is closed.
//!     The `Core::is_shutdown` flag is set to true.
//!
//!  3. The worker thread calls `pre_shutdown` in parallel. Here, the worker
//!     will keep removing tasks from `OwnedTasks` until it is empty. No new
//!     tasks can be pushed to the `OwnedTasks` during or after this step as it
//!     was closed in step 1.
//!
//!  5. The workers call Shared::shutdown to enter the single-threaded phase of
//!     shutdown. These calls will push their core to `Shared::shutdown_cores`,
//!     and the last thread to push its core will finish the shutdown procedure.
//!
//!  6. The local run queue of each core is emptied, then the inject queue is
//!     emptied.
//!
//! At this point, shutdown has completed. It is not possible for any of the
//! collections to contain any tasks at this point, as each collection was
//! closed first, then emptied afterwards.
//!
//! ## Spawns during shutdown
//!
//! When spawning tasks during shutdown, there are two cases:
//!
//!  * The spawner observes the `OwnedTasks` being open, and the inject queue is
//!    closed.
//!  * The spawner observes the `OwnedTasks` being closed and doesn't check the
//!    inject queue.
//!
//! The first case can only happen if the `OwnedTasks::bind` call happens before
//! or during step 1 of shutdown. In this case, the runtime will clean up the
//! task in step 3 of shutdown.
//!
//! In the latter case, the task was not spawned and the task is immediately
//! cancelled by the spawner.
//!
//! The correctness of shutdown requires both the inject queue and `OwnedTasks`
//! collection to have a closed bit. With a close bit on only the inject queue,
//! spawning could run in to a situation where a task is successfully bound long
//! after the runtime has shut down. With a close bit on only the `OwnedTasks`,
//! the first spawning situation could result in the notification being pushed
//! to the inject queue after step 6 of shutdown, which would leave a task in
//! the inject queue indefinitely. This would be a ref-count cycle and a memory
//! leak.

use crate::loom::sync::{Arc, Mutex};
use crate::runtime;
use crate::runtime::scheduler::multi_thread::{
    idle, park, queue, Counters, Handle, Idle, Overflow, Parker, Stats, TraceStatus, Unparker,
};
use crate::runtime::scheduler::{inject, Defer, Lock};
use crate::runtime::task::OwnedTasks;
use crate::runtime::{
    blocking, driver, scheduler, task, Config, SchedulerMetrics, TimerFlavor, WorkerMetrics,
};
use crate::runtime::{context, TaskHooks};
use crate::task::coop;
use crate::util::atomic_cell::AtomicCell;
use crate::util::rand::{FastRand, RngSeedGenerator};

use std::cell::RefCell;
use std::task::Waker;
use std::thread;
use std::time::{Duration, Instant};

mod metrics;

cfg_taskdump! {
    mod taskdump;
}

cfg_not_taskdump! {
    mod taskdump_mock;
}

#[cfg(all(tokio_unstable, feature = "time"))]
use crate::loom::sync::atomic::AtomicBool;

#[cfg(all(tokio_unstable, feature = "time"))]
use crate::runtime::time_alt;

use crate::runtime::metrics::ScheduleLatencyInstant;
#[cfg(all(tokio_unstable, feature = "time"))]
use crate::runtime::scheduler::util;

/// A scheduler worker
pub(super) struct Worker {
    /// Reference to scheduler's handle
    handle: Arc<Handle>,

    /// Index holding this worker's remote state
    index: usize,

    /// Used to hand-off a worker's core to another thread.
    core: AtomicCell<Core>,
}

/// Core data
struct Core {
    /// Used to schedule bookkeeping tasks every so often.
    tick: u32,

    /// When a task is scheduled from a worker, it is stored in this slot. The
    /// worker will check this slot for a task **before** checking the run
    /// queue. This effectively results in the **last** scheduled task to be run
    /// next (LIFO). This is an optimization for improving locality which
    /// benefits message passing patterns and helps to reduce latency.
    lifo_slot: Option<Notified>,

    /// When `true`, locally scheduled tasks go to the LIFO slot. When `false`,
    /// they go to the back of the `run_queue`.
    lifo_enabled: bool,

    /// The worker-local run queue.
    run_queue: queue::Local<Arc<Handle>>,

    #[cfg(all(tokio_unstable, feature = "time"))]
    time_context: time_alt::LocalContext,

    /// True if the
```
# COMANDO - loom_multi_thread.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\tests\loom_multi_thread.rs
**SHA:** 28bde6e90c40467c
**Timestamp:** 2026-08-28T02:36:19.031709
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- let gate = Arc::new(AtomicBool::new(false));
- let gate = gate.clone();
- let gate = Arc::new(Gate {
- let gate = gate.clone();

### Ouro Bruto (primeiros 5000 chars)
```
mod queue;
mod shutdown;
mod yield_now;

/// Full runtime loom tests. These are heavy tests and take significant time to
/// run on CI.
///
/// Use `LOOM_MAX_PREEMPTIONS=1` to do a "quick" run as a smoke test.
///
/// In order to speed up the C
use crate::runtime::tests::loom_oneshot as oneshot;
use crate::runtime::{self, Runtime};
use crate::{spawn, task};
use tokio_test::assert_ok;

use loom::sync::atomic::{AtomicBool, AtomicUsize};
use loom::sync::Arc;

use pin_project_lite::pin_project;
use std::future::{poll_fn, Future};
use std::pin::Pin;
use std::sync::atomic::Ordering::{Relaxed, SeqCst};
use std::task::{ready, Context, Poll};

mod atomic_take {
    use loom::sync::atomic::AtomicBool;
    use std::mem::MaybeUninit;
    use std::sync::atomic::Ordering::SeqCst;

    pub(super) struct AtomicTake<T> {
        inner: MaybeUninit<T>,
        taken: AtomicBool,
    }

    impl<T> AtomicTake<T> {
        pub(super) fn new(value: T) -> Self {
            Self {
                inner: MaybeUninit::new(value),
                taken: AtomicBool::new(false),
            }
        }

        pub(super) fn take(&self) -> Option<T> {
            // safety: Only one thread will see the boolean change from false
            // to true, so that thread is able to take the value.
            match self.taken.fetch_or(true, SeqCst) {
                false => unsafe { Some(std::ptr::read(self.inner.as_ptr())) },
                true => None,
            }
        }
    }

    impl<T> Drop for AtomicTake<T> {
        fn drop(&mut self) {
            drop(self.take());
        }
    }
}

#[derive(Clone)]
struct AtomicOneshot<T> {
    value: std::sync::Arc<atomic_take::AtomicTake<oneshot::Sender<T>>>,
}
impl<T> AtomicOneshot<T> {
    fn new(sender: oneshot::Sender<T>) -> Self {
        Self {
            value: std::sync::Arc::new(atomic_take::AtomicTake::new(sender)),
        }
    }

    fn assert_send(&self, value: T) {
        self.value.take().unwrap().send(value);
    }
}

/// Tests are divided into groups to make the runs faster on CI.
mod group_a {
    use super::*;

    #[test]
    fn racy_shutdown() {
        loom::model(|| {
            let pool = mk_pool(1);

            // here's the case we want to exercise:
            //
            // a worker that still has tasks in its local queue gets sent to the blocking pool (due to
            // block_in_place). the blocking pool is shut down, so drops the worker. the worker's
            // shutdown method never gets run.
            //
            // we do this by spawning two tasks on one worker, the first of which does block_in_place,
            // and then immediately drop the pool.

            pool.spawn(track(async {
                crate::task::block_in_place(|| {});
            }));
            pool.spawn(track(async {}));
            drop(pool);
        });
    }

    #[test]
    fn pool_multi_spawn() {
        loom::model(|| {
            let pool = mk_pool(2);
            let c1 = Arc::new(AtomicUsize::new(0));

            let (tx, rx) = oneshot::channel();
            let tx1 = AtomicOneshot::new(tx);

            // Spawn a task
            let c2 = c1.clone();
            let tx2 = tx1.clone();
            pool.spawn(track(async move {
                spawn(track(async move {
                    if 1 == c1.fetch_add(1, Relaxed) {
                        tx1.assert_send(());
                    }
                }));
            }));

            // Spawn a second task
            pool.spawn(track(async move {
                spawn(track(async move {
                    if 1 == c2.fetch_add(1, Relaxed) {
                        tx2.assert_send(());
                    }
                }));
            }));

            rx.recv();
        });
    }

    fn only_blocking_inner(first_pending: bool) {
        loom::model(move || {
            let pool = mk_pool(1);
            let (block_tx, block_rx) = oneshot::channel();

            pool.spawn(track(async move {
                crate::task::block_in_place(move || {
                    block_tx.send(());
                });
                if first_pending {
                    task::yield_now().await
                }
            }));

            block_rx.recv();
            drop(pool);
        });
    }

    #[test]
    fn only_blocking_without_pending() {
        only_blocking_inner(false)
    }

    #[test]
    fn only_blocking_with_pending() {
        only_blocking_inner(true)
    }
}

mod group_b {
    use super::*;

    fn blocking_and_regular_inner(first_pending: bool) {
        const NUM: usize = 3;
        loom::model(move || {
            let pool = mk_pool(1);
            let cnt = Arc::new(AtomicUsize::new(0));

            let (block_tx, block_rx) = oneshot::channel();
            let (done_tx, done_rx) = oneshot::channel();
            let done_tx = AtomicOneshot::new(done_tx);

            pool.spawn(track(async move {
                crate::task::block_in_place(move || {
              
```
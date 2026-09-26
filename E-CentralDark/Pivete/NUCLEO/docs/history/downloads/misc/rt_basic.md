# OUTRO - rt_basic.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\tests\rt_basic.rs
**SHA:** b55ec1fd874e39e0
**Timestamp:** 2026-08-28T02:36:22.599215
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: could probably avoid this, but why not.

### Ouro Bruto (primeiros 5000 chars)
```
#![warn(rust_2018_idioms)]
#![cfg(feature = "full")]

use tokio::runtime::{self, Runtime};
use tokio::sync::oneshot;
use tokio::time::{timeout, Duration};
use tokio_test::{assert_err, assert_ok};

use std::future::Future;
use std::pin::Pin;
use std::sync::atomic::{AtomicBool, Ordering};
use std::task::{Context, Poll};
use std::thread;

mod support {
    pub(crate) mod mpsc_stream;
}

macro_rules! cfg_metrics {
    ($($t:tt)*) => {
        #[cfg(all(tokio_unstable, target_has_atomic = "64"))]
        {
            $( $t )*
        }
    }
}

#[test]
fn spawned_task_does_not_progress_without_block_on() {
    let (tx, mut rx) = oneshot::channel();

    let rt = rt();

    rt.spawn(async move {
        assert_ok!(tx.send("hello"));
    });

    thread::sleep(Duration::from_millis(50));

    assert_err!(rx.try_recv());

    let out = rt.block_on(async { assert_ok!(rx.await) });

    assert_eq!(out, "hello");
}

#[test]
fn no_extra_poll() {
    use pin_project_lite::pin_project;
    use std::pin::Pin;
    use std::sync::{
        atomic::{AtomicUsize, Ordering::SeqCst},
        Arc,
    };
    use std::task::{Context, Poll};
    use tokio_stream::{Stream, StreamExt};

    pin_project! {
        struct TrackPolls<S> {
            npolls: Arc<AtomicUsize>,
            #[pin]
            s: S,
        }
    }

    impl<S> Stream for TrackPolls<S>
    where
        S: Stream,
    {
        type Item = S::Item;
        fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
            let this = self.project();
            this.npolls.fetch_add(1, SeqCst);
            this.s.poll_next(cx)
        }
    }

    let (tx, rx) = support::mpsc_stream::unbounded_channel_stream::<()>();
    let rx = TrackPolls {
        npolls: Arc::new(AtomicUsize::new(0)),
        s: rx,
    };
    let npolls = Arc::clone(&rx.npolls);

    let rt = rt();

    // TODO: could probably avoid this, but why not.
    let mut rx = Box::pin(rx);

    rt.spawn(async move { while rx.next().await.is_some() {} });
    rt.block_on(async {
        tokio::task::yield_now().await;
    });

    // should have been polled exactly once: the initial poll
    assert_eq!(npolls.load(SeqCst), 1);

    tx.send(()).unwrap();
    rt.block_on(async {
        tokio::task::yield_now().await;
    });

    // should have been polled twice more: once to yield Some(), then once to yield Pending
    assert_eq!(npolls.load(SeqCst), 1 + 2);

    drop(tx);
    rt.block_on(async {
        tokio::task::yield_now().await;
    });

    // should have been polled once more: to yield None
    assert_eq!(npolls.load(SeqCst), 1 + 2 + 1);
}

#[test]
fn acquire_mutex_in_drop() {
    use futures::future::pending;
    use tokio::task;

    let (tx1, rx1) = oneshot::channel();
    let (tx2, rx2) = oneshot::channel();

    let rt = rt();

    rt.spawn(async move {
        let _ = rx2.await;
        unreachable!();
    });

    rt.spawn(async move {
        let _ = rx1.await;
        tx2.send(()).unwrap();
        unreachable!();
    });

    // Spawn a task that will never notify
    rt.spawn(async move {
        pending::<()>().await;
        tx1.send(()).unwrap();
    });

    // Tick the loop
    rt.block_on(async {
        task::yield_now().await;
    });

    // Drop the rt
    drop(rt);
}

#[test]
fn drop_tasks_in_context() {
    static SUCCESS: AtomicBool = AtomicBool::new(false);

    struct ContextOnDrop;

    impl Future for ContextOnDrop {
        type Output = ();

        fn poll(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<()> {
            Poll::Pending
        }
    }

    impl Drop for ContextOnDrop {
        fn drop(&mut self) {
            if tokio::runtime::Handle::try_current().is_ok() {
                SUCCESS.store(true, Ordering::SeqCst);
            }
        }
    }

    let rt = rt();
    rt.spawn(ContextOnDrop);
    drop(rt);

    assert!(SUCCESS.load(Ordering::SeqCst));
}

#[test]
#[cfg_attr(target_os = "wasi", ignore = "Wasi does not support panic recovery")]
#[should_panic(expected = "boom")]
fn wake_in_drop_after_panic() {
    struct WakeOnDrop(Option<oneshot::Sender<()>>);

    impl Drop for WakeOnDrop {
        fn drop(&mut self) {
            let _ = self.0.take().unwrap().send(());
        }
    }

    let rt = rt();

    let (tx1, rx1) = oneshot::channel::<()>();
    let (tx2, rx2) = oneshot::channel::<()>();

    // Spawn two tasks. We don't know the order in which they are dropped, so we
    // make both tasks identical. When the first task is dropped, we wake up the
    // second task. This ensures that we trigger a wakeup on a live task while
    // handling the "boom" panic, no matter the order in which the tasks are
    // dropped.
    rt.spawn(async move {
        let _wake_on_drop = WakeOnDrop(Some(tx2));
        let _ = rx1.await;
        unreachable!()
    });

    rt.spawn(async move {
        let _wake_on_drop = WakeOnDrop(Some(tx1));
        let _ = rx2.await;
        unreachable!()
    });

    rt.blo
```
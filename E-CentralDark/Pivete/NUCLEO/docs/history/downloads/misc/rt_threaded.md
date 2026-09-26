# OUTRO - rt_threaded.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\tests\rt_threaded.rs
**SHA:** 81242680e4f8cfbd
**Timestamp:** 2026-08-28T02:36:22.802232
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let after_start = Arc::new(AtomicUsize::new(0));

### Ouro Bruto (primeiros 5000 chars)
```
#![warn(rust_2018_idioms)]
#![cfg(all(feature = "full", not(target_os = "wasi")))]

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::runtime;
use tokio::sync::oneshot;
use tokio_test::{assert_err, assert_ok, assert_pending};

use std::future::{poll_fn, Future};
use std::pin::Pin;
use std::sync::atomic::Ordering::Relaxed;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{mpsc, Arc, Mutex};
use std::task::{Context, Poll, Waker};

macro_rules! cfg_metrics {
    ($($t:tt)*) => {
        #[cfg(all(tokio_unstable, target_has_atomic = "64"))]
        {
            $( $t )*
        }
    }
}

#[test]
fn single_thread() {
    // No panic when starting a runtime w/ a single thread
    let _ = runtime::Builder::new_multi_thread()
        .enable_all()
        .worker_threads(1)
        .build()
        .unwrap();
}

#[test]
#[cfg_attr(miri, ignore)] // Too slow on miri.
fn many_oneshot_futures() {
    // used for notifying the main thread
    const NUM: usize = 1_000;

    for _ in 0..5 {
        let (tx, rx) = mpsc::channel();

        let rt = rt();
        let cnt = Arc::new(AtomicUsize::new(0));

        for _ in 0..NUM {
            let cnt = cnt.clone();
            let tx = tx.clone();

            rt.spawn(async move {
                let num = cnt.fetch_add(1, Relaxed) + 1;

                if num == NUM {
                    tx.send(()).unwrap();
                }
            });
        }

        rx.recv().unwrap();

        // Wait for the pool to shutdown
        drop(rt);
    }
}

#[test]
fn spawn_two() {
    let rt = rt();

    let out = rt.block_on(async {
        let (tx, rx) = oneshot::channel();

        tokio::spawn(async move {
            tokio::spawn(async move {
                tx.send("ZOMG").unwrap();
            });
        });

        assert_ok!(rx.await)
    });

    assert_eq!(out, "ZOMG");

    cfg_metrics! {
        let metrics = rt.metrics();
        drop(rt);
        assert_eq!(1, metrics.remote_schedule_count());

        let mut local = 0;
        for i in 0..metrics.num_workers() {
            local += metrics.worker_local_schedule_count(i);
        }

        assert_eq!(1, local);
    }
}

#[test]
#[cfg_attr(miri, ignore)] // Too slow on miri
fn many_multishot_futures() {
    const CHAIN: usize = 200;
    const CYCLES: usize = 5;
    const TRACKS: usize = 50;

    for _ in 0..50 {
        let rt = rt();
        let mut start_txs = Vec::with_capacity(TRACKS);
        let mut final_rxs = Vec::with_capacity(TRACKS);

        for _ in 0..TRACKS {
            let (start_tx, mut chain_rx) = tokio::sync::mpsc::channel(10);

            for _ in 0..CHAIN {
                let (next_tx, next_rx) = tokio::sync::mpsc::channel(10);

                // Forward all the messages
                rt.spawn(async move {
                    while let Some(v) = chain_rx.recv().await {
                        next_tx.send(v).await.unwrap();
                    }
                });

                chain_rx = next_rx;
            }

            // This final task cycles if needed
            let (final_tx, final_rx) = tokio::sync::mpsc::channel(10);
            let cycle_tx = start_tx.clone();
            let mut rem = CYCLES;

            rt.spawn(async move {
                for _ in 0..CYCLES {
                    let msg = chain_rx.recv().await.unwrap();

                    rem -= 1;

                    if rem == 0 {
                        final_tx.send(msg).await.unwrap();
                    } else {
                        cycle_tx.send(msg).await.unwrap();
                    }
                }
            });

            start_txs.push(start_tx);
            final_rxs.push(final_rx);
        }

        {
            rt.block_on(async move {
                for start_tx in start_txs {
                    start_tx.send("ping").await.unwrap();
                }

                for mut final_rx in final_rxs {
                    final_rx.recv().await.unwrap();
                }
            });
        }
    }
}

#[test]
fn lifo_slot_budget() {
    async fn my_fn() {
        spawn_another();
    }

    fn spawn_another() {
        tokio::spawn(my_fn());
    }

    let rt = runtime::Builder::new_multi_thread()
        .enable_all()
        .worker_threads(1)
        .build()
        .unwrap();

    let (send, recv) = oneshot::channel();

    rt.spawn(async move {
        tokio::spawn(my_fn());
        let _ = send.send(());
    });

    let _ = rt.block_on(recv);
}

#[test]
fn spawn_shutdown() {
    let rt = rt();
    let (tx, rx) = mpsc::channel();

    rt.block_on(async {
        tokio::spawn(client_server(tx.clone()));
    });

    // Use spawner
    rt.spawn(client_server(tx));

    assert_ok!(rx.recv());
    assert_ok!(rx.recv());

    drop(rt);
    assert_err!(rx.try_recv());
}

async fn client_server(tx: mpsc::Sender<()>) {
    let server = assert_ok!(TcpListener::bind("127.0.0.1:0").await);

    // Get the assigned addre
```
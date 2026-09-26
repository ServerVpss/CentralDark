# OUTRO - rt_poll_callbacks.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\tests\rt_poll_callbacks.rs
**SHA:** f3031ee5b56ea6af
**Timestamp:** 2026-08-28T02:36:22.752230
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let poll_start = poll_start_counter.clone();
- let poll_start = poll_start_counter.clone();

### Ouro Bruto (primeiros 5000 chars)
```
#![allow(unknown_lints, unexpected_cfgs)]
#![cfg(tokio_unstable)]

use std::sync::{atomic::AtomicUsize, Arc, Mutex};

use tokio::task::yield_now;

#[cfg(not(target_os = "wasi"))]
#[test]
fn callbacks_fire_multi_thread() {
    let poll_start_counter = Arc::new(AtomicUsize::new(0));
    let poll_stop_counter = Arc::new(AtomicUsize::new(0));
    let poll_start = poll_start_counter.clone();
    let poll_stop = poll_stop_counter.clone();

    let before_task_poll_callback_task_id: Arc<Mutex<Option<tokio::task::Id>>> =
        Arc::new(Mutex::new(None));
    let after_task_poll_callback_task_id: Arc<Mutex<Option<tokio::task::Id>>> =
        Arc::new(Mutex::new(None));

    let before_task_poll_callback_task_id_ref = Arc::clone(&before_task_poll_callback_task_id);
    let after_task_poll_callback_task_id_ref = Arc::clone(&after_task_poll_callback_task_id);
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .on_before_task_poll(move |task_meta| {
            before_task_poll_callback_task_id_ref
                .lock()
                .unwrap()
                .replace(task_meta.id());
            poll_start_counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        })
        .on_after_task_poll(move |task_meta| {
            after_task_poll_callback_task_id_ref
                .lock()
                .unwrap()
                .replace(task_meta.id());
            poll_stop_counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        })
        .build()
        .unwrap();
    let task = rt.spawn(async {
        yield_now().await;
        yield_now().await;
        yield_now().await;
    });

    let spawned_task_id = task.id();

    rt.block_on(task).expect("task should succeed");
    // We need to drop the runtime to guarantee the workers have exited (and thus called the callback)
    drop(rt);

    assert_eq!(
        before_task_poll_callback_task_id.lock().unwrap().unwrap(),
        spawned_task_id
    );
    assert_eq!(
        after_task_poll_callback_task_id.lock().unwrap().unwrap(),
        spawned_task_id
    );
    let actual_count = 4;
    assert_eq!(
        poll_start.load(std::sync::atomic::Ordering::Relaxed),
        actual_count,
        "unexpected number of poll starts"
    );
    assert_eq!(
        poll_stop.load(std::sync::atomic::Ordering::Relaxed),
        actual_count,
        "unexpected number of poll stops"
    );
}

#[test]
fn callbacks_fire_current_thread() {
    let poll_start_counter = Arc::new(AtomicUsize::new(0));
    let poll_stop_counter = Arc::new(AtomicUsize::new(0));
    let poll_start = poll_start_counter.clone();
    let poll_stop = poll_stop_counter.clone();

    let before_task_poll_callback_task_id: Arc<Mutex<Option<tokio::task::Id>>> =
        Arc::new(Mutex::new(None));
    let after_task_poll_callback_task_id: Arc<Mutex<Option<tokio::task::Id>>> =
        Arc::new(Mutex::new(None));

    let before_task_poll_callback_task_id_ref = Arc::clone(&before_task_poll_callback_task_id);
    let after_task_poll_callback_task_id_ref = Arc::clone(&after_task_poll_callback_task_id);
    let rt = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .on_before_task_poll(move |task_meta| {
            before_task_poll_callback_task_id_ref
                .lock()
                .unwrap()
                .replace(task_meta.id());
            poll_start_counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        })
        .on_after_task_poll(move |task_meta| {
            after_task_poll_callback_task_id_ref
                .lock()
                .unwrap()
                .replace(task_meta.id());
            poll_stop_counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        })
        .build()
        .unwrap();

    let task = rt.spawn(async {
        yield_now().await;
        yield_now().await;
        yield_now().await;
    });

    let spawned_task_id = task.id();

    let _ = rt.block_on(task);
    drop(rt);

    assert_eq!(
        before_task_poll_callback_task_id.lock().unwrap().unwrap(),
        spawned_task_id
    );
    assert_eq!(
        after_task_poll_callback_task_id.lock().unwrap().unwrap(),
        spawned_task_id
    );
    assert_eq!(poll_start.load(std::sync::atomic::Ordering::Relaxed), 4);
    assert_eq!(poll_stop.load(std::sync::atomic::Ordering::Relaxed), 4);
}

```
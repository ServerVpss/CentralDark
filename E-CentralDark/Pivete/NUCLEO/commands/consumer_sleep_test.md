# COMANDO - consumer_sleep_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\consumer_sleep_test.rs
**SHA:** 4735096ba0a46abe
**Timestamp:** 2026-08-23T14:16:51.255427
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
/// Test that the record_video consumer loop drains the OCR frame queue promptly.
///
/// The bug: the consumer loop slept for 1/fps (2 seconds at 0.5 FPS) on EVERY
/// iteration, even after successfully processing a frame. During adaptive FPS
/// bursts (up to 10 FPS), the queue backed up and frames were dropped.
///
/// The fix: only sleep (50ms) when the queue is empty. Process frames immediately
/// when available.
///
/// This test simulates the producer/consumer pattern with an ArrayQueue and verifies
/// that all frames are consumed without drops under burst conditions.
use crossbeam::queue::ArrayQueue;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

const MAX_QUEUE_SIZE: usize = 30;

/// Simulates the OLD consumer behavior: sleep(1/fps) every iteration
async fn old_consumer_loop(
    queue: Arc<ArrayQueue<u64>>,
    processed: Arc<AtomicU64>,
    fps: f64,
    stop_after: Duration,
) {
    let start = Instant::now();
    loop {
        if start.elapsed() > stop_after {
            break;
        }
        if let Some(_frame) = queue.pop() {
            processed.fetch_add(1, Ordering::SeqCst);
        }
        // OLD: always sleep 1/fps, even after processing a frame
        tokio::time::sleep(Duration::from_secs_f64(1.0 / fps)).await;
    }
}

/// Simulates the NEW consumer behavior: only sleep when queue is empty
async fn new_consumer_loop(
    queue: Arc<ArrayQueue<u64>>,
    processed: Arc<AtomicU64>,
    stop_after: Duration,
) {
    let start = Instant::now();
    loop {
        if start.elapsed() > stop_after {
            break;
        }
        if let Some(_frame) = queue.pop() {
            processed.fetch_add(1, Ordering::SeqCst);
            // No sleep — immediately try next frame
        } else {
            // Queue empty — short poll interval
            tokio::time::sleep(Duration::from_millis(50)).await;
        }
    }
}

/// Simulate adaptive FPS burst: push frames at 10 FPS for burst_duration
async fn produce_burst(
    queue: Arc<ArrayQueue<u64>>,
    dropped: Arc<AtomicU64>,
    burst_fps: f64,
    burst_duration: Duration,
) -> u64 {
    let interval = Duration::from_secs_f64(1.0 / burst_fps);
    let start = Instant::now();
    let mut frame_num: u64 = 0;
    while start.elapsed() < burst_duration {
        if queue.push(frame_num).is_err() {
            // Queue full — drop oldest and push (matches real behavior)
            queue.pop();
            if queue.push(frame_num).is_err() {
                dropped.fetch_add(1, Ordering::SeqCst);
            } else {
                dropped.fetch_add(1, Ordering::SeqCst); // the popped frame was dropped
            }
        }
        frame_num += 1;
        tokio::time::sleep(interval).await;
    }
    frame_num
}

#[tokio::test]
async fn test_old_consumer_cannot_keep_up_with_burst() {
    // Simulate: 0.5 FPS base setting, 10 FPS burst for 5 seconds
    // Old consumer sleeps 2s per iteration → can only process ~2-3 frames in 5s
    // Producer pushes ~50 frames → queue (30 slots) overflows → drops
    let queue = Arc::new(ArrayQueue::new(MAX_QUEUE_SIZE));
    let processed = Arc::new(AtomicU64::new(0));
    let dropped = Arc::new(AtomicU64::new(0));
    let burst_duration = Duration::from_secs(5);
    let fps = 0.5;

    let q1 = queue.clone();
    let p1 = processed.clone();
    let consumer = tokio::spawn(async move {
        old_consumer_loop(q1, p1, fps, burst_duration + Duration::from_secs(3)).await;
    });

    let q2 = queue.clone();
    let d1 = dropped.clone();
    let total_produced = produce_burst(q2, d1, 10.0, burst_duration).await;

    // Give consumer extra time to drain what's left in queue
    tokio::time::sleep(Duration::from_secs(3)).await;
    consumer.abort();
    let _ = consumer.await;

    let total_processed = processed.load(Ordering::SeqCst);
    let total_dropped = dropped.load(Ordering::SeqCst);
    let remaining = queue.len() as u64;

    println!(
        "OLD consumer: produced={}, processed={}, dropped={}, still_in_queue={}",
        total_produced, total_processed, total_dropped, remaining
    );

    // The old consumer processes at most 1 frame per 2 seconds.
    // In 8 seconds total (5s burst + 3s drain), it processes ~4 frames.
    // With 50 frames produced and queue size 30, at least 20 are dropped.
    // The key assertion: many frames are LOST (not processed AND not in queue).
    let total_accounted = total_processed + remaining;
    let total_lost = total_produced.saturating_sub(total_accounted);
    println!(
        "OLD consumer: total_lost={} (produced {} - accounted {})",
        total_lost, total_produced, total_accounted
    );
    assert!(
        total_lost > 0 || total_dropped > 0,
        "Old consumer SHOULD lose frames: lost={}, dropped={}",
        total_lost,
        total_dropped
    );
    assert!(
        total_processed < total_produced / 2,
        "Old consumer should process far fewer than produced: proces
```

---

# COMANDO - consumer_sleep_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\consumer_sleep_test.rs
**SHA:** 4735096ba0a46abe96470dd2db65405932800d4d8da032d6944511cf494b55eb
**Timestamp:** 2026-08-23T23:43:21.949300
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
/// Test that the record_video consumer loop drains the OCR frame queue promptly.
///
/// The bug: the consumer loop slept for 1/fps (2 seconds at 0.5 FPS) on EVERY
/// iteration, even after successfully processing a frame. During adaptive FPS
/// bursts (up to 10 FPS), the queue backed up and frames were dropped.
///
/// The fix: only sleep (50ms) when the queue is empty. Process frames immediately
/// when available.
///
/// This test simulates the producer/consumer pattern with an ArrayQueue and verifies
/// that all frames are consumed without drops under burst conditions.
use crossbeam::queue::ArrayQueue;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

const MAX_QUEUE_SIZE: usize = 30;

/// Simulates the OLD consumer behavior: sleep(1/fps) every iteration
async fn old_consumer_loop(
    queue: Arc<ArrayQueue<u64>>,
    processed: Arc<AtomicU64>,
    fps: f64,
    stop_after: Duration,
) {
    let start = Instant::now();
    loop {
        if start.elapsed() > stop_after {
            break;
        }
        if let Some(_frame) = queue.pop() {
            processed.fetch_add(1, Ordering::SeqCst);
        }
        // OLD: always sleep 1/fps, even after processing a frame
        tokio::time::sleep(Duration::from_secs_f64(1.0 / fps)).await;
    }
}

/// Simulates the NEW consumer behavior: only sleep when queue is empty
async fn new_consumer_loop(
    queue: Arc<ArrayQueue<u64>>,
    processed: Arc<AtomicU64>,
    stop_after: Duration,
) {
    let start = Instant::now();
    loop {
        if start.elapsed() > stop_after {
            break;
        }
        if let Some(_frame) = queue.pop() {
            processed.fetch_add(1, Ordering::SeqCst);
            // No sleep — immediately try next frame
        } else {
            // Queue empty — short poll interval
            tokio::time::sleep(Duration::from_millis(50)).await;
        }
    }
}

/// Simulate adaptive FPS burst: push frames at 10 FPS for burst_duration
async fn produce_burst(
    queue: Arc<ArrayQueue<u64>>,
    dropped: Arc<AtomicU64>,
    burst_fps: f64,
    burst_duration: Duration,
) -> u64 {
    let interval = Duration::from_secs_f64(1.0 / burst_fps);
    let start = Instant::now();
    let mut frame_num: u64 = 0;
    while start.elapsed() < burst_duration {
        if queue.push(frame_num).is_err() {
            // Queue full — drop oldest and push (matches real behavior)
            queue.pop();
            if queue.push(frame_num).is_err() {
                dropped.fetch_add(1, Ordering::SeqCst);
            } else {
                dropped.fetch_add(1, Ordering::SeqCst); // the popped frame was dropped
            }
        }
        frame_num += 1;
        tokio::time::sleep(interval).await;
    }
    frame_num
}

#[tokio::test]
async fn test_old_consumer_cannot_keep_up_with_burst() {
    // Simulate: 0.5 FPS base setting, 10 FPS burst for 5 seconds
    // Old consumer sleeps 2s per iteration → can only process ~2-3 frames in 5s
    // Producer pushes ~50 frames → queue (30 slots) overflows → drops
    let queue = Arc::new(ArrayQueue::new(MAX_QUEUE_SIZE));
    let processed = Arc::new(AtomicU64::new(0));
    let dropped = Arc::new(AtomicU64::new(0));
    let burst_duration = Duration::from_secs(5);
    let fps = 0.5;

    let q1 = queue.clone();
    let p1 = processed.clone();
    let consumer = tokio::spawn(async move {
        old_consumer_loop(q1, p1, fps, burst_duration + Duration::from_secs(3)).await;
    });

    let q2 = queue.clone();
    let d1 = dropped.clone();
    let total_produced = produce_burst(q2, d1, 10.0, burst_duration).await;

    // Give consumer extra time to drain what's left in queue
    tokio::time::sleep(Duration::from_secs(3)).await;
    consumer.abort();
    let _ = consumer.await;

    let total_processed = processed.load(Ordering::SeqCst);
    let total_dropped = dropped.load(Ordering::SeqCst);
    let remaining = queue.len() as u64;

    println!(
        "OLD consumer: produced={}, processed={}, dropped={}, still_in_queue={}",
        total_produced, total_processed, total_dropped, remaining
    );

    // The old consumer processes at most 1 frame per 2 seconds.
    // In 8 seconds total (5s burst + 3s drain), it processes ~4 frames.
    // With 50 frames produced and queue size 30, at least 20 are dropped.
    // The key assertion: many frames are LOST (not processed AND not in queue).
    let total_accounted = total_processed + remaining;
    let total_lost = total_produced.saturating_sub(total_accounted);
    println!(
        "OLD consumer: total_lost={} (produced {} - accounted {})",
        total_lost, total_produced, total_accounted
    );
    assert!(
        total_lost > 0 || total_dropped > 0,
        "Old consumer SHOULD lose frames: lost={}, dropped={}",
        total_lost,
        total_dropped
    );
    assert!(
        total_processed < total_produced / 2,
        "Old consumer should process far fewer than produced: proces
```
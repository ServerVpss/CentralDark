# OUTRO - ocr_benchmark.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-screen\benches\ocr_benchmark.rs
**SHA:** b194b4e4bfa75e3c
**Timestamp:** 2026-08-23T14:16:58.990702
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();
- let start = std::time::Instant::now();
- let start = std::time::Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use std::path::PathBuf;
use std::time::Duration;
use strsim::jaro_winkler;

#[cfg(target_os = "macos")]
use screenpipe_screen::perform_ocr_apple;

#[cfg(target_os = "linux")]
use screenpipe_screen::perform_ocr_tesseract;

#[cfg(target_os = "windows")]
use screenpipe_screen::perform_ocr_windows;

// ! keep in mind we're optimising for OCR that is good to swallow for LLM
// ! e.g. it's ok to have typo in words or wrong casing, etc.

fn calculate_accuracy(ocr_result: &str, expected_keywords: &[&str]) -> f32 {
    let ocr_result = ocr_result.to_lowercase();
    let matched_keywords = expected_keywords
        .iter()
        .filter(|&&keyword| {
            let keyword_lower = keyword.to_lowercase();
            ocr_result.contains(&keyword_lower)
                || ocr_result
                    .split_whitespace()
                    .any(|word| jaro_winkler(word, &keyword_lower) > 0.9)
        })
        .count();
    matched_keywords as f32 / expected_keywords.len() as f32
}

const EXPECTED_KEYWORDS: &[&str] = &[
    "ocr_handles",
    "Vec",
    "pool_size",
    "task::spawn",
    "async move",
    "should_stop.lock().await",
    "RecvError::Lagged",
    "debug!",
    "error!",
    "frame_counter",
    "start_time",
    "last_processed_frame",
    "control_rx.try_recv()",
    "ControlMessage::Pause",
    "ControlMessage::Resume",
    "ControlMessage::Stop",
    "is_paused.lock().await",
    "tokio::time::sleep",
    "capture_start",
    "monitor.capture_image()",
    "DynamicImage::ImageRgba8",
    "capture_duration",
    "image_hash",
    "calculate_hash",
    "result_tx_clone",
    "image_arc",
    "Arc::new",
    "queue_size",
    "ocr_tx.receiver_count()",
    "MAX_QUEUE_SIZE",
    "frames_to_skip",
];

// Helper function to load test image
fn load_test_image() -> image::DynamicImage {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("tests");
    path.push("testing_OCR.png");
    image::open(&path).expect("Failed to open image")
}

// Apple Vision OCR benchmark (macOS only)
#[cfg(target_os = "macos")]
fn bench_apple_vision_ocr(c: &mut Criterion) {
    let image = load_test_image();
    let mut group = c.benchmark_group("Apple Vision OCR");
    group.sample_size(10);
    group.measurement_time(Duration::from_secs(10));

    group.bench_function(BenchmarkId::new("Performance", ""), |b| {
        b.iter(|| {
            let result = perform_ocr_apple(black_box(&image), &[]);
            assert!(!result.0.is_empty(), "OCR failed");
        })
    });

    group.finish();
}

#[cfg(target_os = "macos")]
fn bench_apple_vision_ocr_with_accuracy(c: &mut Criterion) {
    let image = load_test_image();
    let mut group = c.benchmark_group("Apple Vision OCR with Accuracy");
    group.sample_size(10);
    group.measurement_time(Duration::from_secs(10));

    group.bench_function(BenchmarkId::new("Performance and Accuracy", ""), |b| {
        b.iter_custom(|iters| {
            let mut total_duration = Duration::new(0, 0);
            let mut total_accuracy = 0.0;

            for _ in 0..iters {
                let start = std::time::Instant::now();
                let result = perform_ocr_apple(black_box(&image), &[]);
                total_duration += start.elapsed();

                let accuracy = calculate_accuracy(&result.0, EXPECTED_KEYWORDS);
                total_accuracy += accuracy;
            }

            println!("Average Accuracy: {:.2}", total_accuracy / iters as f32);
            total_duration
        })
    });

    group.finish();
}

// Tesseract OCR benchmark (Linux only)
#[cfg(target_os = "linux")]
fn bench_tesseract_ocr(c: &mut Criterion) {
    let image = load_test_image();
    let mut group = c.benchmark_group("Tesseract OCR");
    group.sample_size(10);
    group.measurement_time(Duration::from_secs(10));

    group.bench_function(BenchmarkId::new("Performance and Accuracy", ""), |b| {
        b.iter_custom(|iters| {
            let mut total_duration = Duration::new(0, 0);
            let mut total_accuracy = 0.0;

            for _ in 0..iters {
                let start = std::time::Instant::now();
                let (result, _, _) = perform_ocr_tesseract(black_box(&image), vec![]);
                total_duration += start.elapsed();

                let accuracy = calculate_accuracy(&result, EXPECTED_KEYWORDS);
                total_accuracy += accuracy;
            }

            println!("Average Accuracy: {:.2}", total_accuracy / iters as f32);
            total_duration
        })
    });

    group.finish();
}

// TODO fix windows
// Windows OCR benchmark (Windows only)
#[cfg(target_os = "windows")]
fn bench_windows_ocr(c: &mut Criterion) {
    let image = load_test_image(); // Load the image once
    let mut group = c.benchmark_group("Windows OCR");
    group.sample_size(10);
    group.measurement_time(Duration::from_secs(10));

    group.bench_function(BenchmarkId
```

---

# OUTRO - ocr_benchmark.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-screen\benches\ocr_benchmark.rs
**SHA:** b194b4e4bfa75e3c0b7dad584af6db2f609960823fea31cdc347f8503daa3513
**Timestamp:** 2026-08-23T23:43:55.725125
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();
- let start = std::time::Instant::now();
- let start = std::time::Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use std::path::PathBuf;
use std::time::Duration;
use strsim::jaro_winkler;

#[cfg(target_os = "macos")]
use screenpipe_screen::perform_ocr_apple;

#[cfg(target_os = "linux")]
use screenpipe_screen::perform_ocr_tesseract;

#[cfg(target_os = "windows")]
use screenpipe_screen::perform_ocr_windows;

// ! keep in mind we're optimising for OCR that is good to swallow for LLM
// ! e.g. it's ok to have typo in words or wrong casing, etc.

fn calculate_accuracy(ocr_result: &str, expected_keywords: &[&str]) -> f32 {
    let ocr_result = ocr_result.to_lowercase();
    let matched_keywords = expected_keywords
        .iter()
        .filter(|&&keyword| {
            let keyword_lower = keyword.to_lowercase();
            ocr_result.contains(&keyword_lower)
                || ocr_result
                    .split_whitespace()
                    .any(|word| jaro_winkler(word, &keyword_lower) > 0.9)
        })
        .count();
    matched_keywords as f32 / expected_keywords.len() as f32
}

const EXPECTED_KEYWORDS: &[&str] = &[
    "ocr_handles",
    "Vec",
    "pool_size",
    "task::spawn",
    "async move",
    "should_stop.lock().await",
    "RecvError::Lagged",
    "debug!",
    "error!",
    "frame_counter",
    "start_time",
    "last_processed_frame",
    "control_rx.try_recv()",
    "ControlMessage::Pause",
    "ControlMessage::Resume",
    "ControlMessage::Stop",
    "is_paused.lock().await",
    "tokio::time::sleep",
    "capture_start",
    "monitor.capture_image()",
    "DynamicImage::ImageRgba8",
    "capture_duration",
    "image_hash",
    "calculate_hash",
    "result_tx_clone",
    "image_arc",
    "Arc::new",
    "queue_size",
    "ocr_tx.receiver_count()",
    "MAX_QUEUE_SIZE",
    "frames_to_skip",
];

// Helper function to load test image
fn load_test_image() -> image::DynamicImage {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("tests");
    path.push("testing_OCR.png");
    image::open(&path).expect("Failed to open image")
}

// Apple Vision OCR benchmark (macOS only)
#[cfg(target_os = "macos")]
fn bench_apple_vision_ocr(c: &mut Criterion) {
    let image = load_test_image();
    let mut group = c.benchmark_group("Apple Vision OCR");
    group.sample_size(10);
    group.measurement_time(Duration::from_secs(10));

    group.bench_function(BenchmarkId::new("Performance", ""), |b| {
        b.iter(|| {
            let result = perform_ocr_apple(black_box(&image), &[]);
            assert!(!result.0.is_empty(), "OCR failed");
        })
    });

    group.finish();
}

#[cfg(target_os = "macos")]
fn bench_apple_vision_ocr_with_accuracy(c: &mut Criterion) {
    let image = load_test_image();
    let mut group = c.benchmark_group("Apple Vision OCR with Accuracy");
    group.sample_size(10);
    group.measurement_time(Duration::from_secs(10));

    group.bench_function(BenchmarkId::new("Performance and Accuracy", ""), |b| {
        b.iter_custom(|iters| {
            let mut total_duration = Duration::new(0, 0);
            let mut total_accuracy = 0.0;

            for _ in 0..iters {
                let start = std::time::Instant::now();
                let result = perform_ocr_apple(black_box(&image), &[]);
                total_duration += start.elapsed();

                let accuracy = calculate_accuracy(&result.0, EXPECTED_KEYWORDS);
                total_accuracy += accuracy;
            }

            println!("Average Accuracy: {:.2}", total_accuracy / iters as f32);
            total_duration
        })
    });

    group.finish();
}

// Tesseract OCR benchmark (Linux only)
#[cfg(target_os = "linux")]
fn bench_tesseract_ocr(c: &mut Criterion) {
    let image = load_test_image();
    let mut group = c.benchmark_group("Tesseract OCR");
    group.sample_size(10);
    group.measurement_time(Duration::from_secs(10));

    group.bench_function(BenchmarkId::new("Performance and Accuracy", ""), |b| {
        b.iter_custom(|iters| {
            let mut total_duration = Duration::new(0, 0);
            let mut total_accuracy = 0.0;

            for _ in 0..iters {
                let start = std::time::Instant::now();
                let (result, _, _) = perform_ocr_tesseract(black_box(&image), vec![]);
                total_duration += start.elapsed();

                let accuracy = calculate_accuracy(&result, EXPECTED_KEYWORDS);
                total_accuracy += accuracy;
            }

            println!("Average Accuracy: {:.2}", total_accuracy / iters as f32);
            total_duration
        })
    });

    group.finish();
}

// TODO fix windows
// Windows OCR benchmark (Windows only)
#[cfg(target_os = "windows")]
fn bench_windows_ocr(c: &mut Criterion) {
    let image = load_test_image(); // Load the image once
    let mut group = c.benchmark_group("Windows OCR");
    group.sample_size(10);
    group.measurement_time(Duration::from_secs(10));

    group.bench_function(BenchmarkId
```
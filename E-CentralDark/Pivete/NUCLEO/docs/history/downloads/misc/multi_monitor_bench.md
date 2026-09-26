# OUTRO - multi_monitor_bench.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-screen\benches\multi_monitor_bench.rs
**SHA:** 76889adf19a01f20
**Timestamp:** 2026-08-23T14:16:58.947931
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let pattern = (char_idx.wrapping_add(seed as u32).wrapping_mul(31)) % 5;
- // Pattern: frame0 (new), frame1 (same), frame2 (same), frame3 (changed), frame4 (same)

### Ouro Bruto (primeiros 5000 chars)
```
//! Multi-monitor performance benchmarks for vision pipeline optimization.
//!
//! Run with: cargo bench -p screenpipe-screen --bench multi_monitor_bench
//!
//! Simulates realistic multi-monitor setups (including ultrawides) to measure:
//! 1. Hash computation: full-res vs downscaled
//! 2. Frame comparison: fixed 640x360 vs proportional downscale
//! 3. Full pipeline cost per capture cycle across N monitors
//! 4. Memory allocation patterns
//!
//! No physical monitors needed — uses synthetic images at real resolutions.

use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use image::imageops::FilterType;
use image::{DynamicImage, Rgb, RgbImage};
use screenpipe_screen::frame_comparison::{
    compare_histogram, FrameComparer, FrameComparisonConfig,
};
use std::hash::{DefaultHasher, Hash, Hasher};

// ============================================================
// Realistic monitor configurations
// ============================================================

struct MonitorConfig {
    name: &'static str,
    width: u32,
    height: u32,
}

const MONITORS: &[MonitorConfig] = &[
    MonitorConfig {
        name: "1080p",
        width: 1920,
        height: 1080,
    },
    MonitorConfig {
        name: "1440p",
        width: 2560,
        height: 1440,
    },
    MonitorConfig {
        name: "4K",
        width: 3840,
        height: 2160,
    },
    MonitorConfig {
        name: "ultrawide_49",
        width: 5120,
        height: 1440,
    },
    MonitorConfig {
        name: "superwide_38",
        width: 3840,
        height: 1440,
    },
];

// Realistic multi-monitor setups
const SETUP_STANDARD: &[usize] = &[0, 0]; // 2x 1080p
const SETUP_POWER: &[usize] = &[3, 4, 1]; // 49" ultrawide + 38" superwide + 1440p
const SETUP_TRADER: &[usize] = &[3, 3, 1]; // 2x 49" ultrawide + 1440p

// ============================================================
// Image generators (realistic screen content)
// ============================================================

/// Screen with code/text — high detail, small changes matter
fn create_code_screen(width: u32, height: u32, seed: u8) -> DynamicImage {
    let img = RgbImage::from_fn(width, height, |x, y| {
        let line_h = 18;
        let line_idx = y / line_h;
        let is_text_line = line_idx % 2 == 0;
        let indent = ((line_idx.wrapping_mul(7)) % 8) * 20;

        if is_text_line && x > indent {
            let char_w = 9;
            let char_idx = (x - indent) / char_w;
            // Vary character pattern with seed
            let pattern = (char_idx.wrapping_add(seed as u32).wrapping_mul(31)) % 5;
            match pattern {
                0 => Rgb([50, 150, 50]),   // green (string)
                1 => Rgb([150, 100, 50]),  // orange (keyword)
                2 => Rgb([200, 200, 200]), // light gray (text)
                3 => Rgb([30, 30, 30]),    // dark (punctuation)
                _ => Rgb([40, 40, 46]),    // background
            }
        } else {
            Rgb([40, 40, 46]) // Dark editor background
        }
    });
    DynamicImage::ImageRgb8(img)
}

/// Screen with a chart — mostly static, occasional tick changes
fn create_chart_screen(width: u32, height: u32, seed: u8) -> DynamicImage {
    let img = RgbImage::from_fn(width, height, |x, y| {
        let h = height as f32;
        let w = width as f32;
        let xf = x as f32 / w;
        let yf = y as f32 / h;

        // Chart line (sine wave with seed offset)
        let chart_y = 0.5 + 0.3 * ((xf * 20.0 + seed as f32 * 0.1).sin());
        let dist = (yf - chart_y).abs();

        if dist < 0.005 {
            Rgb([0, 200, 100]) // Green line
        } else if yf > 0.85 {
            // Bottom axis area
            Rgb([60, 60, 70])
        } else {
            Rgb([20, 20, 30]) // Dark chart background
        }
    });
    DynamicImage::ImageRgb8(img)
}

/// Mostly static screen (spotify, chat idle)
#[allow(dead_code)]
fn create_static_screen(width: u32, height: u32, _seed: u8) -> DynamicImage {
    let img = RgbImage::from_fn(width, height, |_x, y| {
        if y < 60 {
            Rgb([30, 30, 30]) // Title bar
        } else if y > height - 80 {
            Rgb([40, 40, 40]) // Bottom bar
        } else {
            Rgb([25, 25, 25]) // Main content area (dark theme)
        }
    });
    DynamicImage::ImageRgb8(img)
}

// ============================================================
// Benchmark: Hash computation at different resolutions
// ============================================================

fn bench_hash_full_vs_downscaled(c: &mut Criterion) {
    let mut group = c.benchmark_group("hash_computation");
    group.sample_size(50);

    for mon in MONITORS {
        let image = create_code_screen(mon.width, mon.height, 0);
        let bytes = (mon.width * mon.height * 3) as u64;
        group.throughput(Throughput::Bytes(bytes));

        // Current: hash full resolution
        group.bench_with_input(BenchmarkId::
```

---

# OUTRO - multi_monitor_bench.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-screen\benches\multi_monitor_bench.rs
**SHA:** 76889adf19a01f20a37d5b414e9a8056da1587ce1d556c0615f6a0bc6a5e7d07
**Timestamp:** 2026-08-23T23:43:55.723125
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let pattern = (char_idx.wrapping_add(seed as u32).wrapping_mul(31)) % 5;
- // Pattern: frame0 (new), frame1 (same), frame2 (same), frame3 (changed), frame4 (same)

### Ouro Bruto (primeiros 5000 chars)
```
//! Multi-monitor performance benchmarks for vision pipeline optimization.
//!
//! Run with: cargo bench -p screenpipe-screen --bench multi_monitor_bench
//!
//! Simulates realistic multi-monitor setups (including ultrawides) to measure:
//! 1. Hash computation: full-res vs downscaled
//! 2. Frame comparison: fixed 640x360 vs proportional downscale
//! 3. Full pipeline cost per capture cycle across N monitors
//! 4. Memory allocation patterns
//!
//! No physical monitors needed — uses synthetic images at real resolutions.

use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion, Throughput};
use image::imageops::FilterType;
use image::{DynamicImage, Rgb, RgbImage};
use screenpipe_screen::frame_comparison::{
    compare_histogram, FrameComparer, FrameComparisonConfig,
};
use std::hash::{DefaultHasher, Hash, Hasher};

// ============================================================
// Realistic monitor configurations
// ============================================================

struct MonitorConfig {
    name: &'static str,
    width: u32,
    height: u32,
}

const MONITORS: &[MonitorConfig] = &[
    MonitorConfig {
        name: "1080p",
        width: 1920,
        height: 1080,
    },
    MonitorConfig {
        name: "1440p",
        width: 2560,
        height: 1440,
    },
    MonitorConfig {
        name: "4K",
        width: 3840,
        height: 2160,
    },
    MonitorConfig {
        name: "ultrawide_49",
        width: 5120,
        height: 1440,
    },
    MonitorConfig {
        name: "superwide_38",
        width: 3840,
        height: 1440,
    },
];

// Realistic multi-monitor setups
const SETUP_STANDARD: &[usize] = &[0, 0]; // 2x 1080p
const SETUP_POWER: &[usize] = &[3, 4, 1]; // 49" ultrawide + 38" superwide + 1440p
const SETUP_TRADER: &[usize] = &[3, 3, 1]; // 2x 49" ultrawide + 1440p

// ============================================================
// Image generators (realistic screen content)
// ============================================================

/// Screen with code/text — high detail, small changes matter
fn create_code_screen(width: u32, height: u32, seed: u8) -> DynamicImage {
    let img = RgbImage::from_fn(width, height, |x, y| {
        let line_h = 18;
        let line_idx = y / line_h;
        let is_text_line = line_idx % 2 == 0;
        let indent = ((line_idx.wrapping_mul(7)) % 8) * 20;

        if is_text_line && x > indent {
            let char_w = 9;
            let char_idx = (x - indent) / char_w;
            // Vary character pattern with seed
            let pattern = (char_idx.wrapping_add(seed as u32).wrapping_mul(31)) % 5;
            match pattern {
                0 => Rgb([50, 150, 50]),   // green (string)
                1 => Rgb([150, 100, 50]),  // orange (keyword)
                2 => Rgb([200, 200, 200]), // light gray (text)
                3 => Rgb([30, 30, 30]),    // dark (punctuation)
                _ => Rgb([40, 40, 46]),    // background
            }
        } else {
            Rgb([40, 40, 46]) // Dark editor background
        }
    });
    DynamicImage::ImageRgb8(img)
}

/// Screen with a chart — mostly static, occasional tick changes
fn create_chart_screen(width: u32, height: u32, seed: u8) -> DynamicImage {
    let img = RgbImage::from_fn(width, height, |x, y| {
        let h = height as f32;
        let w = width as f32;
        let xf = x as f32 / w;
        let yf = y as f32 / h;

        // Chart line (sine wave with seed offset)
        let chart_y = 0.5 + 0.3 * ((xf * 20.0 + seed as f32 * 0.1).sin());
        let dist = (yf - chart_y).abs();

        if dist < 0.005 {
            Rgb([0, 200, 100]) // Green line
        } else if yf > 0.85 {
            // Bottom axis area
            Rgb([60, 60, 70])
        } else {
            Rgb([20, 20, 30]) // Dark chart background
        }
    });
    DynamicImage::ImageRgb8(img)
}

/// Mostly static screen (spotify, chat idle)
#[allow(dead_code)]
fn create_static_screen(width: u32, height: u32, _seed: u8) -> DynamicImage {
    let img = RgbImage::from_fn(width, height, |_x, y| {
        if y < 60 {
            Rgb([30, 30, 30]) // Title bar
        } else if y > height - 80 {
            Rgb([40, 40, 40]) // Bottom bar
        } else {
            Rgb([25, 25, 25]) // Main content area (dark theme)
        }
    });
    DynamicImage::ImageRgb8(img)
}

// ============================================================
// Benchmark: Hash computation at different resolutions
// ============================================================

fn bench_hash_full_vs_downscaled(c: &mut Criterion) {
    let mut group = c.benchmark_group("hash_computation");
    group.sample_size(50);

    for mon in MONITORS {
        let image = create_code_screen(mon.width, mon.height, 0);
        let bytes = (mon.width * mon.height * 3) as u64;
        group.throughput(Throughput::Bytes(bytes));

        // Current: hash full resolution
        group.bench_with_input(BenchmarkId::
```
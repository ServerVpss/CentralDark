# OUTRO - video_cache_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\video_cache_test.rs
**SHA:** c3914a9d4a08bc5f
**Timestamp:** 2026-08-23T14:16:51.657139
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();
- let start = std::time::Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use anyhow::Result;
use chrono::{Duration, Utc};
use screenpipe_core::paths;
use std::sync::Arc;
use tracing::{debug, error};

use screenpipe_db::DatabaseManager;
use screenpipe_engine::video_cache::FrameCache;

async fn setup_test_env() -> Result<(FrameCache, Arc<DatabaseManager>)> {
    // enabled tracing logging
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let screenpipe_dir = paths::default_screenpipe_data_dir().join("data");

    debug!("using real screenpipe data dir: {:?}", screenpipe_dir);

    let db = Arc::new(
        DatabaseManager::new(
            paths::default_screenpipe_data_dir()
                .join("db.sqlite")
                .to_str()
                .unwrap(),
            Default::default(),
        )
        .await
        .unwrap(),
    );

    let cache = FrameCache::new(screenpipe_dir, db.clone()).await?;
    Ok((cache, db))
}

#[tokio::test]
#[ignore]
async fn test_frame_jpeg_integrity() -> Result<()> {
    let (cache, _db) = setup_test_env().await?;

    // Get a frame from 5 minutes ago
    let target_time = Utc::now() - Duration::minutes(5);
    debug!("hi");

    let (tx, mut rx) = tokio::sync::mpsc::channel(100);
    cache.get_frames(target_time, 1, tx, true).await?;
    debug!("bye");

    let frame = rx.recv().await;

    if let Some(frame_data) = frame {
        // Read the frame data from the file
        debug!(
            "checking frame at {}, size: {} bytes",
            target_time,
            frame_data.frame_data[0].image_data.len()
        );

        // Check JPEG header (SOI marker)
        let has_jpeg_header = frame_data.frame_data[0]
            .image_data
            .starts_with(&[0xFF, 0xD8]);

        // Check JPEG footer (EOI marker)
        let has_jpeg_footer = frame_data.frame_data[0].image_data.ends_with(&[0xFF, 0xD9]);

        // Basic size sanity check (typical JPEG frame should be between 10KB and 1MB)
        let has_valid_size = frame_data.frame_data[0].image_data.len() > 10_000
            && frame_data.frame_data[0].image_data.len() < 1_000_000;

        if has_jpeg_header && has_jpeg_footer && has_valid_size {
            debug!("frame passed JPEG validation");
        } else {
            error!(
                "invalid JPEG frame: header={}, footer={}, size={}",
                has_jpeg_header,
                has_jpeg_footer,
                frame_data.frame_data[0].image_data.len()
            );

            // Log first and last few bytes for debugging
            if frame_data.frame_data[0].image_data.len() >= 4 {
                debug!(
                    "first 4 bytes: {:02X} {:02X} {:02X} {:02X}",
                    frame_data.frame_data[0].image_data[0],
                    frame_data.frame_data[0].image_data[1],
                    frame_data.frame_data[0].image_data[2],
                    frame_data.frame_data[0].image_data[3]
                );
            }
            if frame_data.frame_data[0].image_data.len() >= 4 {
                let len = frame_data.frame_data[0].image_data.len();
                debug!(
                    "last 4 bytes: {:02X} {:02X} {:02X} {:02X}",
                    frame_data.frame_data[0].image_data[len - 4],
                    frame_data.frame_data[0].image_data[len - 3],
                    frame_data.frame_data[0].image_data[len - 2],
                    frame_data.frame_data[0].image_data[len - 1]
                );
            }
        }

        // Assert frame validity
        assert!(has_jpeg_header, "Frame should have valid JPEG header");
        assert!(has_jpeg_footer, "Frame should have valid JPEG footer");
        assert!(
            has_valid_size,
            "Frame size should be within reasonable bounds"
        );
    } else {
        debug!("no frame found for timestamp {}", target_time);
    }

    Ok(())
}

async fn measure_frame_retrieval(
    cache: &FrameCache,
    time_ago: Duration,
    duration_minutes: i64,
) -> Result<(usize, f64)> {
    let start_time = Utc::now() - time_ago;
    let mut frames = Vec::new();

    let (tx, mut rx) = tokio::sync::mpsc::channel(100);

    let timer = std::time::Instant::now();
    cache
        .get_frames(start_time, duration_minutes, tx, true)
        .await?;

    // Collect frames with timeout
    let timeout = tokio::time::sleep(std::time::Duration::from_secs(30));
    tokio::pin!(timeout);

    loop {
        tokio::select! {
            frame = rx.recv() => {
                match frame {
                    Some(frame) => {
                        frames.push(frame);
                    },
                    None => break,
                }
            }
            _ = &mut timeout => {
                debug!("timeout reached after 30s");
                break;
            }
        }
    }

    let elapsed = timer.elapsed().as_secs_f64();
    Ok((frames.len(), elapsed))
}

#[tokio::test]
#[ignore]
async fn test_frame_retrieval_at_different_times() -> Result<(
```

---

# OUTRO - video_cache_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\video_cache_test.rs
**SHA:** c3914a9d4a08bc5f01135ecf342a0f36c7d9a901c727be443e9037e2a0c63afe
**Timestamp:** 2026-08-23T23:43:36.533090
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();
- let start = std::time::Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use anyhow::Result;
use chrono::{Duration, Utc};
use screenpipe_core::paths;
use std::sync::Arc;
use tracing::{debug, error};

use screenpipe_db::DatabaseManager;
use screenpipe_engine::video_cache::FrameCache;

async fn setup_test_env() -> Result<(FrameCache, Arc<DatabaseManager>)> {
    // enabled tracing logging
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let screenpipe_dir = paths::default_screenpipe_data_dir().join("data");

    debug!("using real screenpipe data dir: {:?}", screenpipe_dir);

    let db = Arc::new(
        DatabaseManager::new(
            paths::default_screenpipe_data_dir()
                .join("db.sqlite")
                .to_str()
                .unwrap(),
            Default::default(),
        )
        .await
        .unwrap(),
    );

    let cache = FrameCache::new(screenpipe_dir, db.clone()).await?;
    Ok((cache, db))
}

#[tokio::test]
#[ignore]
async fn test_frame_jpeg_integrity() -> Result<()> {
    let (cache, _db) = setup_test_env().await?;

    // Get a frame from 5 minutes ago
    let target_time = Utc::now() - Duration::minutes(5);
    debug!("hi");

    let (tx, mut rx) = tokio::sync::mpsc::channel(100);
    cache.get_frames(target_time, 1, tx, true).await?;
    debug!("bye");

    let frame = rx.recv().await;

    if let Some(frame_data) = frame {
        // Read the frame data from the file
        debug!(
            "checking frame at {}, size: {} bytes",
            target_time,
            frame_data.frame_data[0].image_data.len()
        );

        // Check JPEG header (SOI marker)
        let has_jpeg_header = frame_data.frame_data[0]
            .image_data
            .starts_with(&[0xFF, 0xD8]);

        // Check JPEG footer (EOI marker)
        let has_jpeg_footer = frame_data.frame_data[0].image_data.ends_with(&[0xFF, 0xD9]);

        // Basic size sanity check (typical JPEG frame should be between 10KB and 1MB)
        let has_valid_size = frame_data.frame_data[0].image_data.len() > 10_000
            && frame_data.frame_data[0].image_data.len() < 1_000_000;

        if has_jpeg_header && has_jpeg_footer && has_valid_size {
            debug!("frame passed JPEG validation");
        } else {
            error!(
                "invalid JPEG frame: header={}, footer={}, size={}",
                has_jpeg_header,
                has_jpeg_footer,
                frame_data.frame_data[0].image_data.len()
            );

            // Log first and last few bytes for debugging
            if frame_data.frame_data[0].image_data.len() >= 4 {
                debug!(
                    "first 4 bytes: {:02X} {:02X} {:02X} {:02X}",
                    frame_data.frame_data[0].image_data[0],
                    frame_data.frame_data[0].image_data[1],
                    frame_data.frame_data[0].image_data[2],
                    frame_data.frame_data[0].image_data[3]
                );
            }
            if frame_data.frame_data[0].image_data.len() >= 4 {
                let len = frame_data.frame_data[0].image_data.len();
                debug!(
                    "last 4 bytes: {:02X} {:02X} {:02X} {:02X}",
                    frame_data.frame_data[0].image_data[len - 4],
                    frame_data.frame_data[0].image_data[len - 3],
                    frame_data.frame_data[0].image_data[len - 2],
                    frame_data.frame_data[0].image_data[len - 1]
                );
            }
        }

        // Assert frame validity
        assert!(has_jpeg_header, "Frame should have valid JPEG header");
        assert!(has_jpeg_footer, "Frame should have valid JPEG footer");
        assert!(
            has_valid_size,
            "Frame size should be within reasonable bounds"
        );
    } else {
        debug!("no frame found for timestamp {}", target_time);
    }

    Ok(())
}

async fn measure_frame_retrieval(
    cache: &FrameCache,
    time_ago: Duration,
    duration_minutes: i64,
) -> Result<(usize, f64)> {
    let start_time = Utc::now() - time_ago;
    let mut frames = Vec::new();

    let (tx, mut rx) = tokio::sync::mpsc::channel(100);

    let timer = std::time::Instant::now();
    cache
        .get_frames(start_time, duration_minutes, tx, true)
        .await?;

    // Collect frames with timeout
    let timeout = tokio::time::sleep(std::time::Duration::from_secs(30));
    tokio::pin!(timeout);

    loop {
        tokio::select! {
            frame = rx.recv() => {
                match frame {
                    Some(frame) => {
                        frames.push(frame);
                    },
                    None => break,
                }
            }
            _ = &mut timeout => {
                debug!("timeout reached after 30s");
                break;
            }
        }
    }

    let elapsed = timer.elapsed().as_secs_f64();
    Ok((frames.len(), elapsed))
}

#[tokio::test]
#[ignore]
async fn test_frame_retrieval_at_different_times() -> Result<(
```
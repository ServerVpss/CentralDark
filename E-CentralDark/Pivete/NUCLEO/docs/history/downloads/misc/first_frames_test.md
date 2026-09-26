# OUTRO - first_frames_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\first_frames_test.rs
**SHA:** d332138eaf063e9b
**Timestamp:** 2026-08-23T14:16:51.399224
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use anyhow::Result;
use chrono::{Duration, Utc};
use screenpipe_core::paths;
use std::sync::Arc;
use std::time::Instant;
use tracing::{error, warn};

use screenpipe_db::DatabaseManager;
use screenpipe_engine::video_utils::extract_frame_from_video;

/// Setup test environment with real screenpipe database
async fn setup_test_env() -> Result<Arc<DatabaseManager>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .try_init()
        .ok();

    let db = Arc::new(
        DatabaseManager::new(
            paths::default_screenpipe_data_dir()
                .join("db.sqlite")
                .to_str()
                .unwrap(),
            Default::default(),
        )
        .await?,
    );

    Ok(db)
}

/// Test to diagnose "first frames not loading" issue
/// This test fetches the most recent frames and attempts to load them,
/// reporting detailed diagnostics about failures
#[tokio::test]
#[ignore = "requires real screenpipe data, run with --ignored"]
async fn test_first_frames_loading() -> Result<()> {
    let db = setup_test_env().await?;

    println!("\n=== First Frames Loading Test ===\n");

    // Get the 10 most recent frames
    let recent_frames = sqlx::query_as::<_, (i64, String, i64, String)>(
        r#"
        SELECT
            f.id as frame_id,
            vc.file_path,
            f.offset_index,
            f.timestamp
        FROM frames f
        JOIN video_chunks vc ON f.video_chunk_id = vc.id
        ORDER BY f.timestamp DESC
        LIMIT 10
        "#,
    )
    .fetch_all(&db.pool)
    .await?;

    println!("Found {} recent frames to test\n", recent_frames.len());
    println!(
        "{:<12} {:<60} {:<12} {:<20} {:<10}",
        "Frame ID", "Video Path", "Offset", "Timestamp", "Status"
    );
    println!("{}", "-".repeat(120));

    let mut success_count = 0;
    let mut failure_count = 0;
    let mut failures: Vec<(i64, String, String)> = Vec::new();

    for (frame_id, file_path, offset_index, timestamp) in &recent_frames {
        let start = Instant::now();

        // Check if video file exists
        let file_exists = tokio::fs::try_exists(&file_path).await.unwrap_or(false);

        if !file_exists {
            println!(
                "{:<12} {:<60} {:<12} {:<20} FILE_MISSING",
                frame_id,
                truncate_path(file_path, 58),
                offset_index,
                truncate_str(timestamp, 18)
            );
            failure_count += 1;
            failures.push((
                *frame_id,
                file_path.clone(),
                "File does not exist".to_string(),
            ));
            continue;
        }

        // Try to extract the frame
        match tokio::time::timeout(
            std::time::Duration::from_secs(10),
            extract_frame_from_video(file_path, *offset_index, "2"),
        )
        .await
        {
            Ok(Ok(frame_path)) => {
                let elapsed = start.elapsed();
                // Verify the extracted frame exists and has content
                match tokio::fs::metadata(&frame_path).await {
                    Ok(meta) if meta.len() > 0 => {
                        println!(
                            "{:<12} {:<60} {:<12} {:<20} OK ({:.1}ms, {} bytes)",
                            frame_id,
                            truncate_path(file_path, 58),
                            offset_index,
                            truncate_str(timestamp, 18),
                            elapsed.as_millis(),
                            meta.len()
                        );
                        success_count += 1;
                    }
                    Ok(meta) => {
                        println!(
                            "{:<12} {:<60} {:<12} {:<20} EMPTY_FILE",
                            frame_id,
                            truncate_path(file_path, 58),
                            offset_index,
                            truncate_str(timestamp, 18)
                        );
                        failure_count += 1;
                        failures.push((
                            *frame_id,
                            file_path.clone(),
                            format!("Empty file: {} bytes", meta.len()),
                        ));
                    }
                    Err(e) => {
                        println!(
                            "{:<12} {:<60} {:<12} {:<20} OUTPUT_ERR",
                            frame_id,
                            truncate_path(file_path, 58),
                            offset_index,
                            truncate_str(timestamp, 18)
                        );
                        failure_count += 1;
                        failures.push((
                            *frame_id,
                            file_path.clone(),
                            format!("Output file error: {}", e),
                        ));
                    }
                }
            }
            
```

---

# OUTRO - first_frames_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\first_frames_test.rs
**SHA:** d332138eaf063e9b8cd0aebfff808dd2b1347a42e62a3effc5778b79c8a42f3a
**Timestamp:** 2026-08-23T23:43:37.205747
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use anyhow::Result;
use chrono::{Duration, Utc};
use screenpipe_core::paths;
use std::sync::Arc;
use std::time::Instant;
use tracing::{error, warn};

use screenpipe_db::DatabaseManager;
use screenpipe_engine::video_utils::extract_frame_from_video;

/// Setup test environment with real screenpipe database
async fn setup_test_env() -> Result<Arc<DatabaseManager>> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .try_init()
        .ok();

    let db = Arc::new(
        DatabaseManager::new(
            paths::default_screenpipe_data_dir()
                .join("db.sqlite")
                .to_str()
                .unwrap(),
            Default::default(),
        )
        .await?,
    );

    Ok(db)
}

/// Test to diagnose "first frames not loading" issue
/// This test fetches the most recent frames and attempts to load them,
/// reporting detailed diagnostics about failures
#[tokio::test]
#[ignore = "requires real screenpipe data, run with --ignored"]
async fn test_first_frames_loading() -> Result<()> {
    let db = setup_test_env().await?;

    println!("\n=== First Frames Loading Test ===\n");

    // Get the 10 most recent frames
    let recent_frames = sqlx::query_as::<_, (i64, String, i64, String)>(
        r#"
        SELECT
            f.id as frame_id,
            vc.file_path,
            f.offset_index,
            f.timestamp
        FROM frames f
        JOIN video_chunks vc ON f.video_chunk_id = vc.id
        ORDER BY f.timestamp DESC
        LIMIT 10
        "#,
    )
    .fetch_all(&db.pool)
    .await?;

    println!("Found {} recent frames to test\n", recent_frames.len());
    println!(
        "{:<12} {:<60} {:<12} {:<20} {:<10}",
        "Frame ID", "Video Path", "Offset", "Timestamp", "Status"
    );
    println!("{}", "-".repeat(120));

    let mut success_count = 0;
    let mut failure_count = 0;
    let mut failures: Vec<(i64, String, String)> = Vec::new();

    for (frame_id, file_path, offset_index, timestamp) in &recent_frames {
        let start = Instant::now();

        // Check if video file exists
        let file_exists = tokio::fs::try_exists(&file_path).await.unwrap_or(false);

        if !file_exists {
            println!(
                "{:<12} {:<60} {:<12} {:<20} FILE_MISSING",
                frame_id,
                truncate_path(file_path, 58),
                offset_index,
                truncate_str(timestamp, 18)
            );
            failure_count += 1;
            failures.push((
                *frame_id,
                file_path.clone(),
                "File does not exist".to_string(),
            ));
            continue;
        }

        // Try to extract the frame
        match tokio::time::timeout(
            std::time::Duration::from_secs(10),
            extract_frame_from_video(file_path, *offset_index, "2"),
        )
        .await
        {
            Ok(Ok(frame_path)) => {
                let elapsed = start.elapsed();
                // Verify the extracted frame exists and has content
                match tokio::fs::metadata(&frame_path).await {
                    Ok(meta) if meta.len() > 0 => {
                        println!(
                            "{:<12} {:<60} {:<12} {:<20} OK ({:.1}ms, {} bytes)",
                            frame_id,
                            truncate_path(file_path, 58),
                            offset_index,
                            truncate_str(timestamp, 18),
                            elapsed.as_millis(),
                            meta.len()
                        );
                        success_count += 1;
                    }
                    Ok(meta) => {
                        println!(
                            "{:<12} {:<60} {:<12} {:<20} EMPTY_FILE",
                            frame_id,
                            truncate_path(file_path, 58),
                            offset_index,
                            truncate_str(timestamp, 18)
                        );
                        failure_count += 1;
                        failures.push((
                            *frame_id,
                            file_path.clone(),
                            format!("Empty file: {} bytes", meta.len()),
                        ));
                    }
                    Err(e) => {
                        println!(
                            "{:<12} {:<60} {:<12} {:<20} OUTPUT_ERR",
                            frame_id,
                            truncate_path(file_path, 58),
                            offset_index,
                            truncate_str(timestamp, 18)
                        );
                        failure_count += 1;
                        failures.push((
                            *frame_id,
                            file_path.clone(),
                            format!("Output file error: {}", e),
                        ));
                    }
                }
            }
            
```
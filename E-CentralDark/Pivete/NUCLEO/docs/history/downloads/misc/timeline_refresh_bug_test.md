# OUTRO - timeline_refresh_bug_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\timeline_refresh_bug_test.rs
**SHA:** d16fc045c4fe6266
**Timestamp:** 2026-08-23T14:16:51.648447
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let poll_start = twenty_min_ago;
- let poll_start = last_polled;
- "Poll range should be valid: poll_start={}, poll_end={}",

### Gaps
- /// - Gap: 14 minutes

### Ouro Bruto (primeiros 5000 chars)
```
/// Tests to reproduce the timeline refresh bug where new frames are not pushed to clients.
///
/// The bug: Timeline shows 7:41 PM but current time is 7:55 PM - a 14 minute gap.
/// New frames exist in the database but are not being pushed to the WebSocket client.
use chrono::{Duration, TimeZone, Utc};
use screenpipe_db::DatabaseManager;
use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

/// Simulates the `fetch_new_frames_since` function logic for testing
async fn simulate_fetch_new_frames(
    db: Arc<DatabaseManager>,
    since: chrono::DateTime<Utc>,
    until: chrono::DateTime<Utc>,
    sent_frame_ids: Arc<Mutex<HashSet<i64>>>,
) -> Result<(Vec<i64>, Option<chrono::DateTime<Utc>>), anyhow::Error> {
    let chunks = db.find_video_chunks(since, until).await?;
    let mut new_frame_ids = Vec::new();
    let mut latest_timestamp: Option<chrono::DateTime<Utc>> = None;

    let sent = sent_frame_ids.lock().await;

    for chunk in chunks.frames {
        // Skip frames we've already sent
        if sent.contains(&chunk.frame_id) {
            continue;
        }

        // Track latest timestamp
        if latest_timestamp.is_none() || chunk.timestamp > latest_timestamp.unwrap() {
            latest_timestamp = Some(chunk.timestamp);
        }

        new_frame_ids.push(chunk.frame_id);
    }

    drop(sent);

    // Mark new frames as sent
    if !new_frame_ids.is_empty() {
        let mut sent = sent_frame_ids.lock().await;
        for frame_id in &new_frame_ids {
            sent.insert(*frame_id);
        }
    }

    Ok((new_frame_ids, latest_timestamp))
}

/// Helper to create a test database with frames at specific times
async fn create_test_db() -> Arc<DatabaseManager> {
    Arc::new(
        DatabaseManager::new("sqlite::memory:", Default::default())
            .await
            .expect("Failed to create test database"),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    /// TEST 1: Reproduce the core bug - new frames inserted AFTER initial fetch are not detected
    ///
    /// Scenario:
    /// 1. Initial frames exist in DB at 7:30 PM and 7:41 PM
    /// 2. Client requests today's frames
    /// 3. Initial fetch returns frames up to 7:41 PM
    /// 4. NEW frame is inserted at 7:45 PM
    /// 5. Poll runs with since=7:41 PM, until=7:55 PM
    /// 6. Bug: Does the poll find the new frame?
    #[tokio::test]
    async fn test_new_frames_after_initial_fetch_are_detected() {
        let db = create_test_db().await;

        // Create a video chunk first
        let _video_chunk_id = db
            .insert_video_chunk("test_video.mp4", "test_device")
            .await
            .expect("Failed to insert video chunk");

        let now = Utc::now();
        let thirty_min_ago = now - Duration::minutes(30);
        let twenty_min_ago = now - Duration::minutes(20);
        let five_min_ago = now - Duration::minutes(5);

        // Insert initial frames (simulating what existed before client connected)
        let frame1_id = db
            .insert_frame(
                "test_device",
                Some(thirty_min_ago),
                None,
                Some("test_app"),
                Some("test_window"),
                false,
                Some(1),
            )
            .await
            .expect("Failed to insert frame 1");

        let frame2_id = db
            .insert_frame(
                "test_device",
                Some(twenty_min_ago),
                None,
                Some("test_app"),
                Some("test_window"),
                false,
                Some(2),
            )
            .await
            .expect("Failed to insert frame 2");

        // Simulate: initial fetch has already processed frames 1 and 2
        let sent_frame_ids: Arc<Mutex<HashSet<i64>>> = Arc::new(Mutex::new(HashSet::new()));
        {
            let mut sent = sent_frame_ids.lock().await;
            sent.insert(frame1_id);
            sent.insert(frame2_id);
        }

        // Now insert a NEW frame (simulating a frame captured AFTER client connected)
        let frame3_id = db
            .insert_frame(
                "test_device",
                Some(five_min_ago),
                None,
                Some("test_app"),
                Some("test_window"),
                false,
                Some(3),
            )
            .await
            .expect("Failed to insert frame 3");

        // Simulate polling for new frames since the last frame time
        let poll_start = twenty_min_ago;
        let poll_end = now;

        let (new_frames, latest_ts) =
            simulate_fetch_new_frames(db.clone(), poll_start, poll_end, sent_frame_ids.clone())
                .await
                .expect("Poll should succeed");

        // BUG CHECK: The new frame should be detected
        assert!(
            new_frames.contains(&frame3_id),
            "BUG CONFIRMED: New frame (id={}) was NOT detected by polling! This reproduces the 
```

---

# OUTRO - timeline_refresh_bug_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\timeline_refresh_bug_test.rs
**SHA:** d16fc045c4fe62669529b401bbd0022925ca2a7e95118650cd06ce91f13b753e
**Timestamp:** 2026-08-23T23:43:36.543589
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let poll_start = twenty_min_ago;
- let poll_start = last_polled;
- "Poll range should be valid: poll_start={}, poll_end={}",

### Gaps
- /// - Gap: 14 minutes

### Ouro Bruto (primeiros 5000 chars)
```
/// Tests to reproduce the timeline refresh bug where new frames are not pushed to clients.
///
/// The bug: Timeline shows 7:41 PM but current time is 7:55 PM - a 14 minute gap.
/// New frames exist in the database but are not being pushed to the WebSocket client.
use chrono::{Duration, TimeZone, Utc};
use screenpipe_db::DatabaseManager;
use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

/// Simulates the `fetch_new_frames_since` function logic for testing
async fn simulate_fetch_new_frames(
    db: Arc<DatabaseManager>,
    since: chrono::DateTime<Utc>,
    until: chrono::DateTime<Utc>,
    sent_frame_ids: Arc<Mutex<HashSet<i64>>>,
) -> Result<(Vec<i64>, Option<chrono::DateTime<Utc>>), anyhow::Error> {
    let chunks = db.find_video_chunks(since, until).await?;
    let mut new_frame_ids = Vec::new();
    let mut latest_timestamp: Option<chrono::DateTime<Utc>> = None;

    let sent = sent_frame_ids.lock().await;

    for chunk in chunks.frames {
        // Skip frames we've already sent
        if sent.contains(&chunk.frame_id) {
            continue;
        }

        // Track latest timestamp
        if latest_timestamp.is_none() || chunk.timestamp > latest_timestamp.unwrap() {
            latest_timestamp = Some(chunk.timestamp);
        }

        new_frame_ids.push(chunk.frame_id);
    }

    drop(sent);

    // Mark new frames as sent
    if !new_frame_ids.is_empty() {
        let mut sent = sent_frame_ids.lock().await;
        for frame_id in &new_frame_ids {
            sent.insert(*frame_id);
        }
    }

    Ok((new_frame_ids, latest_timestamp))
}

/// Helper to create a test database with frames at specific times
async fn create_test_db() -> Arc<DatabaseManager> {
    Arc::new(
        DatabaseManager::new("sqlite::memory:", Default::default())
            .await
            .expect("Failed to create test database"),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    /// TEST 1: Reproduce the core bug - new frames inserted AFTER initial fetch are not detected
    ///
    /// Scenario:
    /// 1. Initial frames exist in DB at 7:30 PM and 7:41 PM
    /// 2. Client requests today's frames
    /// 3. Initial fetch returns frames up to 7:41 PM
    /// 4. NEW frame is inserted at 7:45 PM
    /// 5. Poll runs with since=7:41 PM, until=7:55 PM
    /// 6. Bug: Does the poll find the new frame?
    #[tokio::test]
    async fn test_new_frames_after_initial_fetch_are_detected() {
        let db = create_test_db().await;

        // Create a video chunk first
        let _video_chunk_id = db
            .insert_video_chunk("test_video.mp4", "test_device")
            .await
            .expect("Failed to insert video chunk");

        let now = Utc::now();
        let thirty_min_ago = now - Duration::minutes(30);
        let twenty_min_ago = now - Duration::minutes(20);
        let five_min_ago = now - Duration::minutes(5);

        // Insert initial frames (simulating what existed before client connected)
        let frame1_id = db
            .insert_frame(
                "test_device",
                Some(thirty_min_ago),
                None,
                Some("test_app"),
                Some("test_window"),
                false,
                Some(1),
            )
            .await
            .expect("Failed to insert frame 1");

        let frame2_id = db
            .insert_frame(
                "test_device",
                Some(twenty_min_ago),
                None,
                Some("test_app"),
                Some("test_window"),
                false,
                Some(2),
            )
            .await
            .expect("Failed to insert frame 2");

        // Simulate: initial fetch has already processed frames 1 and 2
        let sent_frame_ids: Arc<Mutex<HashSet<i64>>> = Arc::new(Mutex::new(HashSet::new()));
        {
            let mut sent = sent_frame_ids.lock().await;
            sent.insert(frame1_id);
            sent.insert(frame2_id);
        }

        // Now insert a NEW frame (simulating a frame captured AFTER client connected)
        let frame3_id = db
            .insert_frame(
                "test_device",
                Some(five_min_ago),
                None,
                Some("test_app"),
                Some("test_window"),
                false,
                Some(3),
            )
            .await
            .expect("Failed to insert frame 3");

        // Simulate polling for new frames since the last frame time
        let poll_start = twenty_min_ago;
        let poll_end = now;

        let (new_frames, latest_ts) =
            simulate_fetch_new_frames(db.clone(), poll_start, poll_end, sent_frame_ids.clone())
                .await
                .expect("Poll should succeed");

        // BUG CHECK: The new frame should be detected
        assert!(
            new_frames.contains(&frame3_id),
            "BUG CONFIRMED: New frame (id={}) was NOT detected by polling! This reproduces the 
```
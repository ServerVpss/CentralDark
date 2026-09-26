# OUTRO - stream_frames_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\stream_frames_test.rs
**SHA:** a67b96c4b3cf5a74
**Timestamp:** 2026-08-23T14:16:51.625234
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = DateTime::parse_from_rfc3339("2026-06-28T00:00:00Z")
- let start = DateTime::parse_from_rfc3339("2026-06-29T00:00:00Z")

### Ouro Bruto (primeiros 5000 chars)
```
use chrono::{DateTime, Duration, Utc};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::time::timeout;
use tokio_tungstenite::tungstenite::Message;

/// Request format for stream frames WebSocket
#[derive(Debug, Serialize)]
struct StreamFramesRequest {
    start_time: String,
    end_time: String,
    order: String,
}

/// Response format from stream frames WebSocket
#[derive(Debug, Deserialize)]
struct StreamTimeSeriesResponse {
    timestamp: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use screenpipe_audio::audio_manager::AudioManagerBuilder;
    use screenpipe_db::{AudioDevice, DatabaseManager, DeviceType, FrameWindowData, OcrEngine};
    use screenpipe_engine::SCServer;
    use std::{net::SocketAddr, sync::Arc};

    #[derive(Debug, Serialize)]
    struct StreamFramesLimitedRequest {
        start_time: String,
        end_time: String,
        order: String,
        limit: usize,
    }

    async fn setup_stream_test_server() -> (
        String,
        Arc<DatabaseManager>,
        tokio::task::JoinHandle<Result<(), std::io::Error>>,
    ) {
        let unique_suffix = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or_default();
        let screenpipe_dir = std::env::temp_dir().join(format!(
            "screenpipe-stream-test-{}-{unique_suffix}",
            std::process::id()
        ));

        let db = Arc::new(
            DatabaseManager::new("sqlite::memory:", Default::default())
                .await
                .unwrap(),
        );
        let audio_manager = Arc::new(
            AudioManagerBuilder::new()
                .is_disabled(true)
                .output_path(screenpipe_dir.join("audio"))
                .build(db.clone())
                .await
                .unwrap(),
        );

        let server = SCServer::new(
            db.clone(),
            SocketAddr::from(([127, 0, 0, 1], 0)),
            screenpipe_dir,
            false,
            false,
            audio_manager,
            false,
            "balanced".to_string(),
        );
        let app = server.create_router().await;
        let listener = tokio::net::TcpListener::bind(SocketAddr::from(([127, 0, 0, 1], 0)))
            .await
            .unwrap();
        let addr = listener.local_addr().unwrap();
        let handle = tokio::spawn(async move { axum::serve(listener, app).await });

        (format!("ws://{addr}/stream/frames"), db, handle)
    }

    #[tokio::test]
    async fn test_dense_range_stream_spans_full_requested_window() {
        let (url, db, server_handle) = setup_stream_test_server().await;
        let device_name = "stream-regression-monitor";
        db.insert_video_chunk("stream-regression.mp4", device_name)
            .await
            .unwrap();

        let start = DateTime::parse_from_rfc3339("2026-06-28T00:00:00Z")
            .unwrap()
            .with_timezone(&Utc);
        let total_frames = 3_000usize;
        let display_limit = 2_500usize;
        let seeded_frames: Vec<_> = (0..total_frames)
            .map(|idx| {
                (
                    start + Duration::seconds(idx as i64),
                    idx as i64,
                    Vec::new(),
                )
            })
            .collect();
        db.insert_multi_frames_with_ocr_batch(
            device_name,
            &seeded_frames,
            Arc::new(OcrEngine::Tesseract),
        )
        .await
        .unwrap();

        let end = start + Duration::seconds(total_frames as i64 - 1);
        let (ws_stream, _) = tokio_tungstenite::connect_async(&url)
            .await
            .expect("websocket should connect");
        let (mut write, mut read) = ws_stream.split();
        let request = StreamFramesLimitedRequest {
            start_time: start.to_rfc3339(),
            end_time: end.to_rfc3339(),
            order: "descending".to_string(),
            limit: display_limit,
        };

        write
            .send(Message::Text(serde_json::to_string(&request).unwrap()))
            .await
            .expect("request should send");

        let received_frames = timeout(std::time::Duration::from_secs(10), async {
            let mut received = Vec::with_capacity(display_limit);
            while received.len() < display_limit {
                let msg = read
                    .next()
                    .await
                    .expect("websocket should stay open")
                    .expect("message should read");
                let Message::Text(text) = msg else {
                    continue;
                };
                if text == "\"keep-alive-text\"" {
                    continue;
                }
                let mut batch: Vec<StreamTimeSeriesResponse> =
                    serde_json::from_str(&text).expect("response batch should parse");
                received.append(&mut batch);
            }
   
```

---

# OUTRO - stream_frames_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\stream_frames_test.rs
**SHA:** a67b96c4b3cf5a748323374dfc7b4b55b8e584a3f097c5e27f46a51084a77bd5
**Timestamp:** 2026-08-23T23:43:37.225264
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = DateTime::parse_from_rfc3339("2026-06-28T00:00:00Z")
- let start = DateTime::parse_from_rfc3339("2026-06-29T00:00:00Z")

### Ouro Bruto (primeiros 5000 chars)
```
use chrono::{DateTime, Duration, Utc};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::time::timeout;
use tokio_tungstenite::tungstenite::Message;

/// Request format for stream frames WebSocket
#[derive(Debug, Serialize)]
struct StreamFramesRequest {
    start_time: String,
    end_time: String,
    order: String,
}

/// Response format from stream frames WebSocket
#[derive(Debug, Deserialize)]
struct StreamTimeSeriesResponse {
    timestamp: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    use screenpipe_audio::audio_manager::AudioManagerBuilder;
    use screenpipe_db::{AudioDevice, DatabaseManager, DeviceType, FrameWindowData, OcrEngine};
    use screenpipe_engine::SCServer;
    use std::{net::SocketAddr, sync::Arc};

    #[derive(Debug, Serialize)]
    struct StreamFramesLimitedRequest {
        start_time: String,
        end_time: String,
        order: String,
        limit: usize,
    }

    async fn setup_stream_test_server() -> (
        String,
        Arc<DatabaseManager>,
        tokio::task::JoinHandle<Result<(), std::io::Error>>,
    ) {
        let unique_suffix = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or_default();
        let screenpipe_dir = std::env::temp_dir().join(format!(
            "screenpipe-stream-test-{}-{unique_suffix}",
            std::process::id()
        ));

        let db = Arc::new(
            DatabaseManager::new("sqlite::memory:", Default::default())
                .await
                .unwrap(),
        );
        let audio_manager = Arc::new(
            AudioManagerBuilder::new()
                .is_disabled(true)
                .output_path(screenpipe_dir.join("audio"))
                .build(db.clone())
                .await
                .unwrap(),
        );

        let server = SCServer::new(
            db.clone(),
            SocketAddr::from(([127, 0, 0, 1], 0)),
            screenpipe_dir,
            false,
            false,
            audio_manager,
            false,
            "balanced".to_string(),
        );
        let app = server.create_router().await;
        let listener = tokio::net::TcpListener::bind(SocketAddr::from(([127, 0, 0, 1], 0)))
            .await
            .unwrap();
        let addr = listener.local_addr().unwrap();
        let handle = tokio::spawn(async move { axum::serve(listener, app).await });

        (format!("ws://{addr}/stream/frames"), db, handle)
    }

    #[tokio::test]
    async fn test_dense_range_stream_spans_full_requested_window() {
        let (url, db, server_handle) = setup_stream_test_server().await;
        let device_name = "stream-regression-monitor";
        db.insert_video_chunk("stream-regression.mp4", device_name)
            .await
            .unwrap();

        let start = DateTime::parse_from_rfc3339("2026-06-28T00:00:00Z")
            .unwrap()
            .with_timezone(&Utc);
        let total_frames = 3_000usize;
        let display_limit = 2_500usize;
        let seeded_frames: Vec<_> = (0..total_frames)
            .map(|idx| {
                (
                    start + Duration::seconds(idx as i64),
                    idx as i64,
                    Vec::new(),
                )
            })
            .collect();
        db.insert_multi_frames_with_ocr_batch(
            device_name,
            &seeded_frames,
            Arc::new(OcrEngine::Tesseract),
        )
        .await
        .unwrap();

        let end = start + Duration::seconds(total_frames as i64 - 1);
        let (ws_stream, _) = tokio_tungstenite::connect_async(&url)
            .await
            .expect("websocket should connect");
        let (mut write, mut read) = ws_stream.split();
        let request = StreamFramesLimitedRequest {
            start_time: start.to_rfc3339(),
            end_time: end.to_rfc3339(),
            order: "descending".to_string(),
            limit: display_limit,
        };

        write
            .send(Message::Text(serde_json::to_string(&request).unwrap()))
            .await
            .expect("request should send");

        let received_frames = timeout(std::time::Duration::from_secs(10), async {
            let mut received = Vec::with_capacity(display_limit);
            while received.len() < display_limit {
                let msg = read
                    .next()
                    .await
                    .expect("websocket should stay open")
                    .expect("message should read");
                let Message::Text(text) = msg else {
                    continue;
                };
                if text == "\"keep-alive-text\"" {
                    continue;
                }
                let mut batch: Vec<StreamTimeSeriesResponse> =
                    serde_json::from_str(&text).expect("response batch should parse");
                received.append(&mut batch);
            }
   
```
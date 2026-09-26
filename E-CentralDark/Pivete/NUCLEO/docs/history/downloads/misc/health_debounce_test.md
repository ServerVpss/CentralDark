# OUTRO - health_debounce_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\health_debounce_test.rs
**SHA:** 48b840cc8d681cdf
**Timestamp:** 2026-08-23T14:16:51.558564
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- elapsed_since_start: Duration,

### Ouro Bruto (primeiros 5000 chars)
```
/// Standalone test for health check debouncing logic.
/// This mirrors the core logic from apps/screenpipe-app-tauri/src-tauri/src/health.rs
/// so we can test it without the full Tauri build.
use std::time::Duration;

const STARTUP_GRACE_PERIOD: Duration = Duration::from_secs(30);
const CONSECUTIVE_FAILURES_THRESHOLD: u32 = 3;

#[derive(Clone, Copy, PartialEq, Debug)]
enum RecordingStatus {
    Starting,
    Recording,
    Stopped,
    Error,
}

#[derive(Debug)]
struct HealthCheckResponse {
    status: String,
}

fn decide_status(
    health_result: &Result<HealthCheckResponse, anyhow::Error>,
    elapsed_since_start: Duration,
    grace_period: Duration,
    ever_connected: bool,
    consecutive_failures: u32,
    failure_threshold: u32,
    current_status: RecordingStatus,
) -> RecordingStatus {
    match health_result {
        Ok(health) if health.status == "unhealthy" || health.status == "error" => {
            RecordingStatus::Error
        }
        Ok(_) => RecordingStatus::Recording,
        Err(_) => {
            if !ever_connected && elapsed_since_start < grace_period {
                RecordingStatus::Starting
            } else if current_status == RecordingStatus::Recording
                && consecutive_failures < failure_threshold
            {
                RecordingStatus::Recording
            } else {
                RecordingStatus::Stopped
            }
        }
    }
}

fn status_to_icon_key(status: RecordingStatus) -> &'static str {
    match status {
        RecordingStatus::Starting => "starting",
        RecordingStatus::Recording => "healthy",
        RecordingStatus::Stopped => "error",
        RecordingStatus::Error => "unhealthy",
    }
}

fn is_unhealthy_icon(icon_key: &str) -> bool {
    icon_key == "unhealthy" || icon_key == "error"
}

// ============ helpers ============

fn make_healthy_response() -> Result<HealthCheckResponse, anyhow::Error> {
    Ok(HealthCheckResponse {
        status: "healthy".to_string(),
    })
}

fn make_unhealthy_response() -> Result<HealthCheckResponse, anyhow::Error> {
    Ok(HealthCheckResponse {
        status: "unhealthy".to_string(),
    })
}

fn make_connection_error() -> Result<HealthCheckResponse, anyhow::Error> {
    Err(anyhow::anyhow!("connection refused"))
}

fn decide_no_debounce(
    health_result: &Result<HealthCheckResponse, anyhow::Error>,
    elapsed: Duration,
    grace: Duration,
    ever_connected: bool,
) -> RecordingStatus {
    decide_status(
        health_result,
        elapsed,
        grace,
        ever_connected,
        CONSECUTIVE_FAILURES_THRESHOLD,
        CONSECUTIVE_FAILURES_THRESHOLD,
        RecordingStatus::Stopped,
    )
}

// ============ tests ============

#[test]
fn test_healthy_response_always_recording() {
    let result = make_healthy_response();
    let status = decide_no_debounce(&result, Duration::from_secs(0), STARTUP_GRACE_PERIOD, false);
    assert_eq!(status, RecordingStatus::Recording);
}

#[test]
fn test_unhealthy_response_always_error() {
    let result = make_unhealthy_response();
    let status = decide_no_debounce(&result, Duration::from_secs(0), STARTUP_GRACE_PERIOD, false);
    assert_eq!(status, RecordingStatus::Error);
}

#[test]
fn test_connection_error_during_grace_period_is_starting() {
    for secs in [0, 15, 29] {
        let result = make_connection_error();
        let status = decide_no_debounce(
            &result,
            Duration::from_secs(secs),
            STARTUP_GRACE_PERIOD,
            false,
        );
        assert_eq!(status, RecordingStatus::Starting, "at {}s", secs);
    }
}

#[test]
fn test_connection_error_after_grace_period_is_stopped() {
    for secs in [31, 120] {
        let result = make_connection_error();
        let status = decide_no_debounce(
            &result,
            Duration::from_secs(secs),
            STARTUP_GRACE_PERIOD,
            false,
        );
        assert_eq!(status, RecordingStatus::Stopped, "at {}s", secs);
    }
}

#[test]
fn test_connection_error_after_previous_connection_is_stopped() {
    let result = make_connection_error();
    let status = decide_status(
        &result,
        Duration::from_secs(5),
        STARTUP_GRACE_PERIOD,
        true,
        CONSECUTIVE_FAILURES_THRESHOLD,
        CONSECUTIVE_FAILURES_THRESHOLD,
        RecordingStatus::Recording,
    );
    assert_eq!(status, RecordingStatus::Stopped);
}

#[test]
fn test_grace_period_boundary() {
    let grace = Duration::from_secs(30);
    let status = decide_no_debounce(
        &make_connection_error(),
        Duration::from_secs(29),
        grace,
        false,
    );
    assert_eq!(status, RecordingStatus::Starting);

    let status = decide_no_debounce(
        &make_connection_error(),
        Duration::from_secs(30),
        grace,
        false,
    );
    assert_eq!(status, RecordingStatus::Stopped);
}

// ============ debouncing / anti-flicker tests ============

#[test]
fn test_single_failure_while_recording_holds_recording(
```

---

# OUTRO - health_debounce_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\tests\health_debounce_test.rs
**SHA:** 48b840cc8d681cdfc1b733e243e83b5b62a67d336ab2dec0ab51927f2bdc446e
**Timestamp:** 2026-08-23T23:43:37.503107
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- elapsed_since_start: Duration,

### Ouro Bruto (primeiros 5000 chars)
```
/// Standalone test for health check debouncing logic.
/// This mirrors the core logic from apps/screenpipe-app-tauri/src-tauri/src/health.rs
/// so we can test it without the full Tauri build.
use std::time::Duration;

const STARTUP_GRACE_PERIOD: Duration = Duration::from_secs(30);
const CONSECUTIVE_FAILURES_THRESHOLD: u32 = 3;

#[derive(Clone, Copy, PartialEq, Debug)]
enum RecordingStatus {
    Starting,
    Recording,
    Stopped,
    Error,
}

#[derive(Debug)]
struct HealthCheckResponse {
    status: String,
}

fn decide_status(
    health_result: &Result<HealthCheckResponse, anyhow::Error>,
    elapsed_since_start: Duration,
    grace_period: Duration,
    ever_connected: bool,
    consecutive_failures: u32,
    failure_threshold: u32,
    current_status: RecordingStatus,
) -> RecordingStatus {
    match health_result {
        Ok(health) if health.status == "unhealthy" || health.status == "error" => {
            RecordingStatus::Error
        }
        Ok(_) => RecordingStatus::Recording,
        Err(_) => {
            if !ever_connected && elapsed_since_start < grace_period {
                RecordingStatus::Starting
            } else if current_status == RecordingStatus::Recording
                && consecutive_failures < failure_threshold
            {
                RecordingStatus::Recording
            } else {
                RecordingStatus::Stopped
            }
        }
    }
}

fn status_to_icon_key(status: RecordingStatus) -> &'static str {
    match status {
        RecordingStatus::Starting => "starting",
        RecordingStatus::Recording => "healthy",
        RecordingStatus::Stopped => "error",
        RecordingStatus::Error => "unhealthy",
    }
}

fn is_unhealthy_icon(icon_key: &str) -> bool {
    icon_key == "unhealthy" || icon_key == "error"
}

// ============ helpers ============

fn make_healthy_response() -> Result<HealthCheckResponse, anyhow::Error> {
    Ok(HealthCheckResponse {
        status: "healthy".to_string(),
    })
}

fn make_unhealthy_response() -> Result<HealthCheckResponse, anyhow::Error> {
    Ok(HealthCheckResponse {
        status: "unhealthy".to_string(),
    })
}

fn make_connection_error() -> Result<HealthCheckResponse, anyhow::Error> {
    Err(anyhow::anyhow!("connection refused"))
}

fn decide_no_debounce(
    health_result: &Result<HealthCheckResponse, anyhow::Error>,
    elapsed: Duration,
    grace: Duration,
    ever_connected: bool,
) -> RecordingStatus {
    decide_status(
        health_result,
        elapsed,
        grace,
        ever_connected,
        CONSECUTIVE_FAILURES_THRESHOLD,
        CONSECUTIVE_FAILURES_THRESHOLD,
        RecordingStatus::Stopped,
    )
}

// ============ tests ============

#[test]
fn test_healthy_response_always_recording() {
    let result = make_healthy_response();
    let status = decide_no_debounce(&result, Duration::from_secs(0), STARTUP_GRACE_PERIOD, false);
    assert_eq!(status, RecordingStatus::Recording);
}

#[test]
fn test_unhealthy_response_always_error() {
    let result = make_unhealthy_response();
    let status = decide_no_debounce(&result, Duration::from_secs(0), STARTUP_GRACE_PERIOD, false);
    assert_eq!(status, RecordingStatus::Error);
}

#[test]
fn test_connection_error_during_grace_period_is_starting() {
    for secs in [0, 15, 29] {
        let result = make_connection_error();
        let status = decide_no_debounce(
            &result,
            Duration::from_secs(secs),
            STARTUP_GRACE_PERIOD,
            false,
        );
        assert_eq!(status, RecordingStatus::Starting, "at {}s", secs);
    }
}

#[test]
fn test_connection_error_after_grace_period_is_stopped() {
    for secs in [31, 120] {
        let result = make_connection_error();
        let status = decide_no_debounce(
            &result,
            Duration::from_secs(secs),
            STARTUP_GRACE_PERIOD,
            false,
        );
        assert_eq!(status, RecordingStatus::Stopped, "at {}s", secs);
    }
}

#[test]
fn test_connection_error_after_previous_connection_is_stopped() {
    let result = make_connection_error();
    let status = decide_status(
        &result,
        Duration::from_secs(5),
        STARTUP_GRACE_PERIOD,
        true,
        CONSECUTIVE_FAILURES_THRESHOLD,
        CONSECUTIVE_FAILURES_THRESHOLD,
        RecordingStatus::Recording,
    );
    assert_eq!(status, RecordingStatus::Stopped);
}

#[test]
fn test_grace_period_boundary() {
    let grace = Duration::from_secs(30);
    let status = decide_no_debounce(
        &make_connection_error(),
        Duration::from_secs(29),
        grace,
        false,
    );
    assert_eq!(status, RecordingStatus::Starting);

    let status = decide_no_debounce(
        &make_connection_error(),
        Duration::from_secs(30),
        grace,
        false,
    );
    assert_eq!(status, RecordingStatus::Stopped);
}

// ============ debouncing / anti-flicker tests ============

#[test]
fn test_single_failure_while_recording_holds_recording(
```
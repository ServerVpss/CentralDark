# OUTRO - cloud_search.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\src\cloud_search.rs
**SHA:** 6cc600eb8ad1dd17
**Timestamp:** 2026-08-23T14:16:48.280833
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();
- pub start: DateTime<Utc>,
- pub time_start: String,

### Gaps
- // TODO: Implement actual cloud search when sync manager is connected

### Ouro Bruto (primeiros 5000 chars)
```
//! Cloud search integration for hybrid local + cloud queries.
//!
//! This module provides the interface for querying cloud-synced data
//! alongside local data in search operations.

use chrono::{DateTime, Utc};
use oasgen::OaSchema;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Cloud search client for querying encrypted cloud data.
pub struct CloudSearchClient {
    /// Whether cloud search is enabled
    enabled: Arc<RwLock<bool>>,
    /// The sync manager (if initialized)
    #[allow(dead_code)]
    manager: Option<Arc<screenpipe_core::sync::SyncManager>>,
}

impl CloudSearchClient {
    /// Create a new cloud search client (disabled by default).
    pub fn new() -> Self {
        Self {
            enabled: Arc::new(RwLock::new(false)),
            manager: None,
        }
    }

    /// Create a cloud search client with an initialized sync manager.
    #[allow(dead_code)]
    pub fn with_manager(manager: Arc<screenpipe_core::sync::SyncManager>) -> Self {
        Self {
            enabled: Arc::new(RwLock::new(true)),
            manager: Some(manager),
        }
    }

    /// Check if cloud search is enabled.
    pub async fn is_enabled(&self) -> bool {
        *self.enabled.read().await
    }

    /// Enable or disable cloud search.
    #[allow(dead_code)]
    pub async fn set_enabled(&self, enabled: bool) {
        *self.enabled.write().await = enabled;
    }

    /// Search cloud data.
    ///
    /// This performs an encrypted search on cloud-synced data.
    pub async fn search(&self, params: CloudSearchParams) -> Result<CloudSearchResult, String> {
        if !self.is_enabled().await {
            return Ok(CloudSearchResult {
                items: vec![],
                has_more: false,
                cloud_status: CloudStatus::Disabled,
                latency_ms: 0,
            });
        }

        // Check if manager is available
        let _manager = match &self.manager {
            Some(m) if m.is_initialized().await => m,
            _ => {
                return Ok(CloudSearchResult {
                    items: vec![],
                    has_more: false,
                    cloud_status: CloudStatus::NotInitialized,
                    latency_ms: 0,
                });
            }
        };

        let start = std::time::Instant::now();

        // TODO: Implement actual cloud search when sync manager is connected
        // For now, return empty results with status
        //
        // The real implementation would:
        // 1. Generate search tokens from the query using the search key
        // 2. Send tokens to cloud API
        // 3. Receive encrypted blob IDs that match
        // 4. Download and decrypt matching blobs
        // 5. Return decrypted content

        let latency_ms = start.elapsed().as_millis() as u64;

        Ok(CloudSearchResult {
            items: vec![],
            has_more: params.time_range.is_some(), // Indicate more data exists if time range was specified
            cloud_status: CloudStatus::Available,
            latency_ms,
        })
    }

    /// Get cloud search metadata (for including in search responses).
    pub async fn get_metadata(
        &self,
        query: &str,
        time_range: Option<TimeRange>,
    ) -> CloudSearchMetadata {
        let enabled = self.is_enabled().await;

        let status = if !enabled {
            CloudStatus::Disabled
        } else {
            match &self.manager {
                Some(m) if m.is_initialized().await => CloudStatus::Available,
                _ => CloudStatus::NotInitialized,
            }
        };

        CloudSearchMetadata {
            cloud_search_available: enabled && matches!(status, CloudStatus::Available),
            cloud_has_relevant_data: time_range.is_some(), // Assume cloud has data if time range specified
            cloud_query_hint: if enabled && !query.is_empty() {
                Some(format!(
                    "Add include_cloud=true to include cloud results for '{}'",
                    query
                ))
            } else {
                None
            },
            status,
        }
    }
}

impl Default for CloudSearchClient {
    fn default() -> Self {
        Self::new()
    }
}

/// Parameters for cloud search.
#[derive(Debug, Clone)]
pub struct CloudSearchParams {
    /// Search query text
    pub query: String,
    /// Content type filter
    pub content_type: CloudContentType,
    /// Time range filter
    pub time_range: Option<TimeRange>,
    /// Maximum results to return
    pub limit: u32,
    /// Result offset for pagination
    pub offset: u32,
}

/// Time range for filtering.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

/// Content types for cloud search.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CloudContentType {
    Ocr,
    Transcripts,
    All,
}

/// Result of a cloud searc
```

---

# OUTRO - cloud_search.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-engine\src\cloud_search.rs
**SHA:** 6cc600eb8ad1dd17f7f513b313d76d0584f8fac72e1db830fd33adbcf0370bea
**Timestamp:** 2026-08-23T23:43:37.040666
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();
- pub start: DateTime<Utc>,
- pub time_start: String,

### Gaps
- // TODO: Implement actual cloud search when sync manager is connected

### Ouro Bruto (primeiros 5000 chars)
```
//! Cloud search integration for hybrid local + cloud queries.
//!
//! This module provides the interface for querying cloud-synced data
//! alongside local data in search operations.

use chrono::{DateTime, Utc};
use oasgen::OaSchema;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Cloud search client for querying encrypted cloud data.
pub struct CloudSearchClient {
    /// Whether cloud search is enabled
    enabled: Arc<RwLock<bool>>,
    /// The sync manager (if initialized)
    #[allow(dead_code)]
    manager: Option<Arc<screenpipe_core::sync::SyncManager>>,
}

impl CloudSearchClient {
    /// Create a new cloud search client (disabled by default).
    pub fn new() -> Self {
        Self {
            enabled: Arc::new(RwLock::new(false)),
            manager: None,
        }
    }

    /// Create a cloud search client with an initialized sync manager.
    #[allow(dead_code)]
    pub fn with_manager(manager: Arc<screenpipe_core::sync::SyncManager>) -> Self {
        Self {
            enabled: Arc::new(RwLock::new(true)),
            manager: Some(manager),
        }
    }

    /// Check if cloud search is enabled.
    pub async fn is_enabled(&self) -> bool {
        *self.enabled.read().await
    }

    /// Enable or disable cloud search.
    #[allow(dead_code)]
    pub async fn set_enabled(&self, enabled: bool) {
        *self.enabled.write().await = enabled;
    }

    /// Search cloud data.
    ///
    /// This performs an encrypted search on cloud-synced data.
    pub async fn search(&self, params: CloudSearchParams) -> Result<CloudSearchResult, String> {
        if !self.is_enabled().await {
            return Ok(CloudSearchResult {
                items: vec![],
                has_more: false,
                cloud_status: CloudStatus::Disabled,
                latency_ms: 0,
            });
        }

        // Check if manager is available
        let _manager = match &self.manager {
            Some(m) if m.is_initialized().await => m,
            _ => {
                return Ok(CloudSearchResult {
                    items: vec![],
                    has_more: false,
                    cloud_status: CloudStatus::NotInitialized,
                    latency_ms: 0,
                });
            }
        };

        let start = std::time::Instant::now();

        // TODO: Implement actual cloud search when sync manager is connected
        // For now, return empty results with status
        //
        // The real implementation would:
        // 1. Generate search tokens from the query using the search key
        // 2. Send tokens to cloud API
        // 3. Receive encrypted blob IDs that match
        // 4. Download and decrypt matching blobs
        // 5. Return decrypted content

        let latency_ms = start.elapsed().as_millis() as u64;

        Ok(CloudSearchResult {
            items: vec![],
            has_more: params.time_range.is_some(), // Indicate more data exists if time range was specified
            cloud_status: CloudStatus::Available,
            latency_ms,
        })
    }

    /// Get cloud search metadata (for including in search responses).
    pub async fn get_metadata(
        &self,
        query: &str,
        time_range: Option<TimeRange>,
    ) -> CloudSearchMetadata {
        let enabled = self.is_enabled().await;

        let status = if !enabled {
            CloudStatus::Disabled
        } else {
            match &self.manager {
                Some(m) if m.is_initialized().await => CloudStatus::Available,
                _ => CloudStatus::NotInitialized,
            }
        };

        CloudSearchMetadata {
            cloud_search_available: enabled && matches!(status, CloudStatus::Available),
            cloud_has_relevant_data: time_range.is_some(), // Assume cloud has data if time range specified
            cloud_query_hint: if enabled && !query.is_empty() {
                Some(format!(
                    "Add include_cloud=true to include cloud results for '{}'",
                    query
                ))
            } else {
                None
            },
            status,
        }
    }
}

impl Default for CloudSearchClient {
    fn default() -> Self {
        Self::new()
    }
}

/// Parameters for cloud search.
#[derive(Debug, Clone)]
pub struct CloudSearchParams {
    /// Search query text
    pub query: String,
    /// Content type filter
    pub content_type: CloudContentType,
    /// Time range filter
    pub time_range: Option<TimeRange>,
    /// Maximum results to return
    pub limit: u32,
    /// Result offset for pagination
    pub offset: u32,
}

/// Time range for filtering.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

/// Content types for cloud search.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CloudContentType {
    Ocr,
    Transcripts,
    All,
}

/// Result of a cloud searc
```
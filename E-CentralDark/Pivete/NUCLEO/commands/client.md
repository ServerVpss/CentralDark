# COMANDO - client.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-core\src\sync\client.rs
**SHA:** ea3118a52349cb95
**Timestamp:** 2026-08-23T14:16:36.500641
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- time_start: metadata.time_start.clone(),
- time_start: String,
- pub start: Option<String>,
- pub time_start: String,
- pub time_start: String,
- start: Some("2024-01-01T00:00:00Z".to_string()),

### Ouro Bruto (primeiros 5000 chars)
```
//! Sync API client for cloud sync operations.
//!
//! This module provides the HTTP client for communicating with the
//! Screenpipe cloud sync API.

use std::collections::BTreeMap;
use std::time::Duration;

use reqwest::{Client, StatusCode};
use screenpipe_sync::destination::HttpPutDirect;
use screenpipe_sync::{BlobDestination, PutRequest, SyncError as TransportError};
use serde::{Deserialize, Serialize};
use tracing::warn;

use super::blob::{BlobMetadata, BlobType};
use super::error::{SyncError, SyncResult};
use super::keys::{ExistingUserKeyData, NewUserKeyData, SyncKeys};

/// Default API base URL
const DEFAULT_API_URL: &str = "https://screenpi.pe/api/sync";

/// Configuration for the sync client.
#[derive(Debug, Clone)]
pub struct SyncClientConfig {
    /// Base URL for the sync API
    pub api_url: String,
    /// Authentication token (Clerk JWT)
    pub auth_token: String,
    /// Device ID (unique identifier for this device)
    pub device_id: String,
    /// Device name (user-friendly name)
    pub device_name: String,
    /// Device OS
    pub device_os: String,
    /// App version
    pub app_version: Option<String>,
}

impl SyncClientConfig {
    /// Create a new config with default API URL.
    pub fn new(
        auth_token: String,
        device_id: String,
        device_name: String,
        device_os: String,
    ) -> Self {
        Self {
            api_url: DEFAULT_API_URL.to_string(),
            auth_token,
            device_id,
            device_name,
            device_os,
            app_version: None,
        }
    }

    /// Set the API URL.
    pub fn with_api_url(mut self, url: String) -> Self {
        self.api_url = url;
        self
    }

    /// Set the app version.
    pub fn with_app_version(mut self, version: String) -> Self {
        self.app_version = Some(version);
        self
    }
}

/// Client for sync API operations.
pub struct SyncClient {
    config: SyncClientConfig,
    /// Short-timeout client for metadata/API calls
    http: Client,
    /// Long-timeout client for blob uploads/downloads
    http_transfer: Client,
}

/// Maximum retries for transient network errors.
const MAX_RETRIES: u32 = 3;
/// Initial backoff delay between retries.
const INITIAL_BACKOFF: Duration = Duration::from_secs(2);

impl SyncClient {
    /// Create a new sync client.
    pub fn new(config: SyncClientConfig) -> SyncResult<Self> {
        let http = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .map_err(|e| SyncError::Network(format!("failed to create HTTP client: {}", e)))?;

        let http_transfer = Client::builder()
            .timeout(Duration::from_secs(120))
            .build()
            .map_err(|e| SyncError::Network(format!("failed to create transfer client: {}", e)))?;

        Ok(Self {
            config,
            http,
            http_transfer,
        })
    }

    /// Get the device ID.
    pub fn device_id(&self) -> &str {
        &self.config.device_id
    }

    // =========================================================================
    // Init / Key Management
    // =========================================================================

    /// Initialize sync for a new user.
    ///
    /// This generates new encryption keys and registers them with the server.
    pub async fn init_new_user(&self, password: &str) -> SyncResult<SyncKeys> {
        let (key_data, keys) = NewUserKeyData::generate(password)?;

        let request = InitRequest {
            device_id: self.config.device_id.clone(),
            device_name: self.config.device_name.clone(),
            device_os: self.config.device_os.clone(),
            device_os_version: None,
            app_version: self.config.app_version.clone(),
            encrypted_master_key: Some(key_data.encrypted_master_key),
            master_key_nonce: Some(key_data.master_key_nonce),
            salt: Some(key_data.salt),
        };

        let response: InitResponse = self.post("/init", &request).await?;

        if !response.success {
            return Err(SyncError::Server(
                response.error.unwrap_or_else(|| "init failed".to_string()),
            ));
        }

        Ok(keys)
    }

    /// Initialize sync for an existing user.
    ///
    /// This fetches the encrypted master key and derives the sync keys.
    pub async fn init_existing_user(&self, password: &str) -> SyncResult<SyncKeys> {
        let request = InitRequest {
            device_id: self.config.device_id.clone(),
            device_name: self.config.device_name.clone(),
            device_os: self.config.device_os.clone(),
            device_os_version: None,
            app_version: self.config.app_version.clone(),
            encrypted_master_key: None,
            master_key_nonce: None,
            salt: None,
        };

        let response: InitResponse = self.post("/init", &request).await?;

        if !response.success {
            return Err(Sync
```

---

# COMANDO - client.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-core\src\sync\client.rs
**SHA:** ea3118a52349cb958e15cda5e202947a91e6b6a801e4efcd7724e1f061df3f54
**Timestamp:** 2026-08-23T23:43:14.519053
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- time_start: metadata.time_start.clone(),
- time_start: String,
- pub start: Option<String>,
- pub time_start: String,
- pub time_start: String,
- start: Some("2024-01-01T00:00:00Z".to_string()),

### Ouro Bruto (primeiros 5000 chars)
```
//! Sync API client for cloud sync operations.
//!
//! This module provides the HTTP client for communicating with the
//! Screenpipe cloud sync API.

use std::collections::BTreeMap;
use std::time::Duration;

use reqwest::{Client, StatusCode};
use screenpipe_sync::destination::HttpPutDirect;
use screenpipe_sync::{BlobDestination, PutRequest, SyncError as TransportError};
use serde::{Deserialize, Serialize};
use tracing::warn;

use super::blob::{BlobMetadata, BlobType};
use super::error::{SyncError, SyncResult};
use super::keys::{ExistingUserKeyData, NewUserKeyData, SyncKeys};

/// Default API base URL
const DEFAULT_API_URL: &str = "https://screenpi.pe/api/sync";

/// Configuration for the sync client.
#[derive(Debug, Clone)]
pub struct SyncClientConfig {
    /// Base URL for the sync API
    pub api_url: String,
    /// Authentication token (Clerk JWT)
    pub auth_token: String,
    /// Device ID (unique identifier for this device)
    pub device_id: String,
    /// Device name (user-friendly name)
    pub device_name: String,
    /// Device OS
    pub device_os: String,
    /// App version
    pub app_version: Option<String>,
}

impl SyncClientConfig {
    /// Create a new config with default API URL.
    pub fn new(
        auth_token: String,
        device_id: String,
        device_name: String,
        device_os: String,
    ) -> Self {
        Self {
            api_url: DEFAULT_API_URL.to_string(),
            auth_token,
            device_id,
            device_name,
            device_os,
            app_version: None,
        }
    }

    /// Set the API URL.
    pub fn with_api_url(mut self, url: String) -> Self {
        self.api_url = url;
        self
    }

    /// Set the app version.
    pub fn with_app_version(mut self, version: String) -> Self {
        self.app_version = Some(version);
        self
    }
}

/// Client for sync API operations.
pub struct SyncClient {
    config: SyncClientConfig,
    /// Short-timeout client for metadata/API calls
    http: Client,
    /// Long-timeout client for blob uploads/downloads
    http_transfer: Client,
}

/// Maximum retries for transient network errors.
const MAX_RETRIES: u32 = 3;
/// Initial backoff delay between retries.
const INITIAL_BACKOFF: Duration = Duration::from_secs(2);

impl SyncClient {
    /// Create a new sync client.
    pub fn new(config: SyncClientConfig) -> SyncResult<Self> {
        let http = Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .map_err(|e| SyncError::Network(format!("failed to create HTTP client: {}", e)))?;

        let http_transfer = Client::builder()
            .timeout(Duration::from_secs(120))
            .build()
            .map_err(|e| SyncError::Network(format!("failed to create transfer client: {}", e)))?;

        Ok(Self {
            config,
            http,
            http_transfer,
        })
    }

    /// Get the device ID.
    pub fn device_id(&self) -> &str {
        &self.config.device_id
    }

    // =========================================================================
    // Init / Key Management
    // =========================================================================

    /// Initialize sync for a new user.
    ///
    /// This generates new encryption keys and registers them with the server.
    pub async fn init_new_user(&self, password: &str) -> SyncResult<SyncKeys> {
        let (key_data, keys) = NewUserKeyData::generate(password)?;

        let request = InitRequest {
            device_id: self.config.device_id.clone(),
            device_name: self.config.device_name.clone(),
            device_os: self.config.device_os.clone(),
            device_os_version: None,
            app_version: self.config.app_version.clone(),
            encrypted_master_key: Some(key_data.encrypted_master_key),
            master_key_nonce: Some(key_data.master_key_nonce),
            salt: Some(key_data.salt),
        };

        let response: InitResponse = self.post("/init", &request).await?;

        if !response.success {
            return Err(SyncError::Server(
                response.error.unwrap_or_else(|| "init failed".to_string()),
            ));
        }

        Ok(keys)
    }

    /// Initialize sync for an existing user.
    ///
    /// This fetches the encrypted master key and derives the sync keys.
    pub async fn init_existing_user(&self, password: &str) -> SyncResult<SyncKeys> {
        let request = InitRequest {
            device_id: self.config.device_id.clone(),
            device_name: self.config.device_name.clone(),
            device_os: self.config.device_os.clone(),
            device_os_version: None,
            app_version: self.config.app_version.clone(),
            encrypted_master_key: None,
            master_key_nonce: None,
            salt: None,
        };

        let response: InitResponse = self.post("/init", &request).await?;

        if !response.success {
            return Err(Sync
```
# OUTRO - blob.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-core\src\sync\blob.rs
**SHA:** dace3c554aacfdd3
**Timestamp:** 2026-08-23T14:16:36.418576
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub time_start: String, // ISO 8601
- time_start: &str,
- time_start: time_start.to_string(),

### Padroes
- /// PipeConfig pattern: a single JSON manifest blob containing every

### Ouro Bruto (primeiros 5000 chars)
```
//! Encrypted blob handling for cloud sync.
//!
//! This module handles packaging, encrypting, and decrypting data blobs
//! that are stored in the cloud.

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use serde::{Deserialize, Serialize};

use super::crypto::{
    compute_checksum, decrypt, encrypt, generate_nonce, generate_search_tokens_from_text,
    HMAC_SIZE, NONCE_SIZE,
};
use super::error::{SyncError, SyncResult};
use super::keys::SyncKeys;

/// Types of data blobs that can be synced.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum BlobType {
    /// Screen capture frames (images)
    Frames,
    /// Audio recordings
    Audio,
    /// Transcriptions of audio
    Transcripts,
    /// OCR text from screen captures
    Ocr,
    /// Accessibility text from screen (UI element traversal)
    Accessibility,
    /// User input events (clicks, keystrokes, clipboard)
    Input,
    /// Pipe configuration manifest (for cross-device pipe sync)
    #[serde(rename = "pipe_config")]
    PipeConfig,
    /// Connection configuration manifest (cross-device credential sync).
    #[serde(rename = "connection_config")]
    ConnectionConfig,
    /// Memories manifest (for cross-device memories sync). Mirrors the
    /// PipeConfig pattern: a single JSON manifest blob containing every
    /// memory the user has, last-write-wins merged across machines.
    Memories,
}

impl BlobType {
    pub fn as_str(&self) -> &'static str {
        match self {
            BlobType::Frames => "frames",
            BlobType::Audio => "audio",
            BlobType::Transcripts => "transcripts",
            BlobType::Ocr => "ocr",
            BlobType::Accessibility => "accessibility",
            BlobType::Input => "input",
            BlobType::PipeConfig => "pipe_config",
            BlobType::ConnectionConfig => "connection_config",
            BlobType::Memories => "memories",
        }
    }
}

impl std::fmt::Display for BlobType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// An encrypted blob ready for upload.
#[derive(Debug)]
pub struct EncryptedBlob {
    /// The encrypted data (ciphertext + auth tag)
    pub ciphertext: Vec<u8>,
    /// The nonce used for encryption (must be stored for decryption)
    pub nonce: [u8; NONCE_SIZE],
    /// SHA-256 checksum of the plaintext (for integrity verification)
    pub checksum: String,
    /// The type of data in this blob
    pub blob_type: BlobType,
    /// Size of the original plaintext in bytes
    pub plaintext_size: usize,
    /// Search tokens extracted from the content (for text-based blobs)
    pub search_tokens: Vec<[u8; HMAC_SIZE]>,
}

impl EncryptedBlob {
    /// Get the nonce as base64.
    pub fn nonce_base64(&self) -> String {
        BASE64.encode(self.nonce)
    }

    /// Get search tokens as base64 strings.
    pub fn search_tokens_base64(&self) -> Vec<String> {
        self.search_tokens
            .iter()
            .map(|t| BASE64.encode(t))
            .collect()
    }
}

/// A decrypted blob.
#[derive(Debug)]
pub struct DecryptedBlob {
    /// The decrypted plaintext data
    pub data: Vec<u8>,
    /// The type of data
    pub blob_type: BlobType,
}

/// Encrypt data into a blob for upload.
///
/// # Arguments
/// * `data` - The plaintext data to encrypt
/// * `blob_type` - The type of data
/// * `keys` - The sync keys for encryption
/// * `text_content` - Optional text content for search token generation
///
/// # Returns
/// An encrypted blob ready for upload
pub fn encrypt_blob(
    data: &[u8],
    blob_type: BlobType,
    keys: &SyncKeys,
    text_content: Option<&str>,
) -> SyncResult<EncryptedBlob> {
    // Generate unique nonce
    let nonce = generate_nonce();

    // Compute checksum of plaintext
    let checksum = compute_checksum(data);

    // Encrypt the data
    let ciphertext = encrypt(data, keys.data_key(), &nonce)?;

    // Generate search tokens if text content is provided
    let search_tokens = if let Some(text) = text_content {
        generate_search_tokens_from_text(text, keys.search_key())?
    } else {
        Vec::new()
    };

    Ok(EncryptedBlob {
        ciphertext,
        nonce,
        checksum,
        blob_type,
        plaintext_size: data.len(),
        search_tokens,
    })
}

/// Decrypt a blob downloaded from the cloud.
///
/// # Arguments
/// * `ciphertext` - The encrypted data
/// * `nonce` - The nonce used during encryption (base64)
/// * `expected_checksum` - The expected SHA-256 checksum (optional, for verification)
/// * `blob_type` - The type of data
/// * `keys` - The sync keys for decryption
///
/// # Returns
/// The decrypted blob data
pub fn decrypt_blob(
    ciphertext: &[u8],
    nonce: &str,
    expected_checksum: Option<&str>,
    blob_type: BlobType,
    keys: &SyncKeys,
) -> SyncResult<DecryptedBlob> {
    // Decode nonce
    let nonce_bytes = B
```

---

# OUTRO - blob.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-core\src\sync\blob.rs
**SHA:** dace3c554aacfdd3a250636c8bec4f2f25595f380a25572854bba92ada62697b
**Timestamp:** 2026-08-23T23:43:27.251462
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub time_start: String, // ISO 8601
- time_start: &str,
- time_start: time_start.to_string(),

### Padroes
- /// PipeConfig pattern: a single JSON manifest blob containing every

### Ouro Bruto (primeiros 5000 chars)
```
//! Encrypted blob handling for cloud sync.
//!
//! This module handles packaging, encrypting, and decrypting data blobs
//! that are stored in the cloud.

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use serde::{Deserialize, Serialize};

use super::crypto::{
    compute_checksum, decrypt, encrypt, generate_nonce, generate_search_tokens_from_text,
    HMAC_SIZE, NONCE_SIZE,
};
use super::error::{SyncError, SyncResult};
use super::keys::SyncKeys;

/// Types of data blobs that can be synced.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum BlobType {
    /// Screen capture frames (images)
    Frames,
    /// Audio recordings
    Audio,
    /// Transcriptions of audio
    Transcripts,
    /// OCR text from screen captures
    Ocr,
    /// Accessibility text from screen (UI element traversal)
    Accessibility,
    /// User input events (clicks, keystrokes, clipboard)
    Input,
    /// Pipe configuration manifest (for cross-device pipe sync)
    #[serde(rename = "pipe_config")]
    PipeConfig,
    /// Connection configuration manifest (cross-device credential sync).
    #[serde(rename = "connection_config")]
    ConnectionConfig,
    /// Memories manifest (for cross-device memories sync). Mirrors the
    /// PipeConfig pattern: a single JSON manifest blob containing every
    /// memory the user has, last-write-wins merged across machines.
    Memories,
}

impl BlobType {
    pub fn as_str(&self) -> &'static str {
        match self {
            BlobType::Frames => "frames",
            BlobType::Audio => "audio",
            BlobType::Transcripts => "transcripts",
            BlobType::Ocr => "ocr",
            BlobType::Accessibility => "accessibility",
            BlobType::Input => "input",
            BlobType::PipeConfig => "pipe_config",
            BlobType::ConnectionConfig => "connection_config",
            BlobType::Memories => "memories",
        }
    }
}

impl std::fmt::Display for BlobType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// An encrypted blob ready for upload.
#[derive(Debug)]
pub struct EncryptedBlob {
    /// The encrypted data (ciphertext + auth tag)
    pub ciphertext: Vec<u8>,
    /// The nonce used for encryption (must be stored for decryption)
    pub nonce: [u8; NONCE_SIZE],
    /// SHA-256 checksum of the plaintext (for integrity verification)
    pub checksum: String,
    /// The type of data in this blob
    pub blob_type: BlobType,
    /// Size of the original plaintext in bytes
    pub plaintext_size: usize,
    /// Search tokens extracted from the content (for text-based blobs)
    pub search_tokens: Vec<[u8; HMAC_SIZE]>,
}

impl EncryptedBlob {
    /// Get the nonce as base64.
    pub fn nonce_base64(&self) -> String {
        BASE64.encode(self.nonce)
    }

    /// Get search tokens as base64 strings.
    pub fn search_tokens_base64(&self) -> Vec<String> {
        self.search_tokens
            .iter()
            .map(|t| BASE64.encode(t))
            .collect()
    }
}

/// A decrypted blob.
#[derive(Debug)]
pub struct DecryptedBlob {
    /// The decrypted plaintext data
    pub data: Vec<u8>,
    /// The type of data
    pub blob_type: BlobType,
}

/// Encrypt data into a blob for upload.
///
/// # Arguments
/// * `data` - The plaintext data to encrypt
/// * `blob_type` - The type of data
/// * `keys` - The sync keys for encryption
/// * `text_content` - Optional text content for search token generation
///
/// # Returns
/// An encrypted blob ready for upload
pub fn encrypt_blob(
    data: &[u8],
    blob_type: BlobType,
    keys: &SyncKeys,
    text_content: Option<&str>,
) -> SyncResult<EncryptedBlob> {
    // Generate unique nonce
    let nonce = generate_nonce();

    // Compute checksum of plaintext
    let checksum = compute_checksum(data);

    // Encrypt the data
    let ciphertext = encrypt(data, keys.data_key(), &nonce)?;

    // Generate search tokens if text content is provided
    let search_tokens = if let Some(text) = text_content {
        generate_search_tokens_from_text(text, keys.search_key())?
    } else {
        Vec::new()
    };

    Ok(EncryptedBlob {
        ciphertext,
        nonce,
        checksum,
        blob_type,
        plaintext_size: data.len(),
        search_tokens,
    })
}

/// Decrypt a blob downloaded from the cloud.
///
/// # Arguments
/// * `ciphertext` - The encrypted data
/// * `nonce` - The nonce used during encryption (base64)
/// * `expected_checksum` - The expected SHA-256 checksum (optional, for verification)
/// * `blob_type` - The type of data
/// * `keys` - The sync keys for decryption
///
/// # Returns
/// The decrypted blob data
pub fn decrypt_blob(
    ciphertext: &[u8],
    nonce: &str,
    expected_checksum: Option<&str>,
    blob_type: BlobType,
    keys: &SyncKeys,
) -> SyncResult<DecryptedBlob> {
    // Decode nonce
    let nonce_bytes = B
```
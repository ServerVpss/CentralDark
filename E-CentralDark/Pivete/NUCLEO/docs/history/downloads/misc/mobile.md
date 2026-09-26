# OUTRO - mobile.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\plugin\mobile.rs
**SHA:** b49a4dc644e8e8a2
**Timestamp:** 2026-08-28T02:35:54.764749
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if let Err(e) = run::<R>(id, &plugin_name, command, &payload, env, activity) {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use super::{PluginApi, PluginHandle};

use crate::{ipc::Channel, AppHandle, Runtime};
#[cfg(target_os = "android")]
use crate::{
  runtime::RuntimeHandle,
  sealed::{ManagerBase, RuntimeOrDispatch},
};

#[cfg(mobile)]
use std::sync::atomic::{AtomicI32, Ordering};
#[cfg(mobile)]
use tokio::sync::oneshot;

use serde::{de::DeserializeOwned, Serialize};

use std::{
  collections::HashMap,
  fmt,
  sync::{mpsc::channel, Mutex, OnceLock},
};

type PluginResponse = Result<serde_json::Value, serde_json::Value>;

type PendingPluginCallHandler = Box<dyn FnOnce(PluginResponse) + Send + 'static>;

#[cfg(mobile)]
static PENDING_PLUGIN_CALLS_ID: AtomicI32 = AtomicI32::new(0);
static PENDING_PLUGIN_CALLS: OnceLock<Mutex<HashMap<i32, PendingPluginCallHandler>>> =
  OnceLock::new();
static CHANNELS: OnceLock<Mutex<HashMap<u32, Channel<serde_json::Value>>>> = OnceLock::new();

/// Possible errors when invoking a plugin.
#[derive(Debug, thiserror::Error)]
pub enum PluginInvokeError {
  /// Failed to reach platform webview handle.
  #[error("the webview is unreachable")]
  UnreachableWebview,
  /// JNI error.
  #[cfg(target_os = "android")]
  #[error("jni error: {0}")]
  Jni(#[from] jni::errors::Error),
  /// Error returned from direct mobile plugin invoke.
  #[error(transparent)]
  InvokeRejected(#[from] ErrorResponse),
  /// Failed to deserialize response.
  #[error("failed to deserialize response: {0}")]
  CannotDeserializeResponse(serde_json::Error),
  /// Failed to serialize request payload.
  #[error("failed to serialize payload: {0}")]
  CannotSerializePayload(serde_json::Error),
}

pub(crate) fn register_channel(channel: Channel<serde_json::Value>) {
  CHANNELS
    .get_or_init(Default::default)
    .lock()
    .unwrap()
    .insert(channel.id(), channel);
}

/// Glue between Rust and the Kotlin code that sends the plugin response back.
#[cfg(target_os = "android")]
pub fn handle_android_plugin_response(
  env: &mut jni::JNIEnv<'_>,
  id: i32,
  success: jni::objects::JString<'_>,
  error: jni::objects::JString<'_>,
) {
  let (payload, is_ok): (serde_json::Value, bool) = match (
    env
      .is_same_object(&success, jni::objects::JObject::default())
      .unwrap_or_default(),
    env
      .is_same_object(&error, jni::objects::JObject::default())
      .unwrap_or_default(),
  ) {
    // both null
    (true, true) => (serde_json::Value::Null, true),
    // error null
    (false, true) => (
      serde_json::from_str(env.get_string(&success).unwrap().to_str().unwrap()).unwrap(),
      true,
    ),
    // success null
    (true, false) => (
      serde_json::from_str(env.get_string(&error).unwrap().to_str().unwrap()).unwrap(),
      false,
    ),
    // both are set - impossible in the Kotlin code
    (false, false) => unreachable!(),
  };

  // Drop the lock before invoking the handler: it delivers the command response
  // to the webview (which can block on the UI thread), and holding
  // PENDING_PLUGIN_CALLS across that call deadlocks a concurrent `run_command`.
  let handler = PENDING_PLUGIN_CALLS
    .get_or_init(Default::default)
    .lock()
    .unwrap()
    .remove(&id);
  if let Some(handler) = handler {
    handler(if is_ok { Ok(payload) } else { Err(payload) });
  }
}

/// Glue between Rust and the Kotlin code that sends the channel data.
#[cfg(target_os = "android")]
pub fn send_channel_data(
  env: &mut jni::JNIEnv<'_>,
  channel_id: i64,
  data_str: jni::objects::JString<'_>,
) {
  let data: serde_json::Value =
    serde_json::from_str(env.get_string(&data_str).unwrap().to_str().unwrap()).unwrap();

  // Clone the channel out and drop the lock before send(): send() can block
  // delivering to the webview, and holding CHANNELS across it deadlocks a
  // concurrent channel registration/send.
  let channel = CHANNELS
    .get_or_init(Default::default)
    .lock()
    .unwrap()
    .get(&(channel_id as u32))
    .cloned();
  if let Some(channel) = channel {
    let _ = channel.send(data);
  }
}

/// Error response from the Kotlin and Swift backends.
#[derive(Debug, thiserror::Error, Clone, serde::Deserialize)]
pub struct ErrorResponse<T = ()> {
  /// Error code.
  pub code: Option<String>,
  /// Error message.
  pub message: Option<String>,
  /// Optional error data.
  #[serde(flatten)]
  pub data: T,
}

impl<T> fmt::Display for ErrorResponse<T> {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    if let Some(code) = &self.code {
      write!(f, "[{code}]")?;
      if self.message.is_some() {
        write!(f, " - ")?;
      }
    }
    if let Some(message) = &self.message {
      write!(f, "{message}")?;
    }
    Ok(())
  }
}

impl<R: Runtime, C: DeserializeOwned> PluginApi<R, C> {
  /// Registers an iOS plugin.
  #[cfg(all(target_os = "ios", feature = "wry"))]
  pub fn register_ios_plugin(
    &self,
    init_fn: unsafe fn() -> *const std::ffi::c_void
```

---

# OUTRO - mobile.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-build-2.6.3\src\mobile.rs
**SHA:** 2145251b57ed2ead
**Timestamp:** 2026-08-28T02:35:55.369491
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- "    <data android:pathPattern=\"{}\" />\n",
- "    <data android:pathPattern=\".*\\\\.{}\" />\n",

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::{collections::HashSet, path::PathBuf};

use anyhow::{Context, Result};
use tauri_utils::{config::AndroidIntentAction, write_if_changed};

/// Updates the Android manifest to add file association intent filters
pub fn update_android_manifest_file_associations(
  associations: &[tauri_utils::config::FileAssociation],
) -> Result<()> {
  if associations.is_empty() {
    return Ok(());
  }

  let intent_filters = generate_file_association_intent_filters(associations);
  tauri_utils::build::update_android_manifest("tauri-file-associations", "activity", intent_filters)
}

fn generate_file_association_intent_filters(
  associations: &[tauri_utils::config::FileAssociation],
) -> String {
  let mut filters = String::new();

  for association in associations {
    // Get mime types - use explicit mime_type, or infer from extensions
    let mut mime_types = HashSet::new();

    if let Some(mime_type) = &association.mime_type {
      mime_types.insert((
        mime_type.clone(),
        association.android_intent_action_filters.clone(),
      ));
    } else {
      // Infer mime types from extensions
      for ext in &association.ext {
        if let Some(mime) = extension_to_mime_type(&ext.0) {
          mime_types.insert((mime, association.android_intent_action_filters.clone()));
        }
      }
    }

    // If we have mime types, create intent filters
    if !mime_types.is_empty() {
      for (mime_type, actions) in &mime_types {
        filters.push_str("<intent-filter>\n");
        if let Some(actions) = actions {
          for action in actions {
            let action = match action {
              AndroidIntentAction::Send => "SEND",
              AndroidIntentAction::SendMultiple => "SEND_MULTIPLE",
              AndroidIntentAction::View => "VIEW",
              _ => unimplemented!(),
            };
            filters.push_str(&format!(
              "    <action android:name=\"android.intent.action.{action}\" />\n"
            ));
          }
        } else {
          filters.push_str("    <action android:name=\"android.intent.action.SEND\" />\n");
          filters.push_str("    <action android:name=\"android.intent.action.SEND_MULTIPLE\" />\n");
          filters.push_str("    <action android:name=\"android.intent.action.VIEW\" />\n");
        }
        filters.push_str("    <category android:name=\"android.intent.category.DEFAULT\" />\n");
        filters.push_str("    <category android:name=\"android.intent.category.BROWSABLE\" />\n");
        filters.push_str(&format!(
          "    <data android:mimeType=\"{}\" />\n",
          mime_type
        ));

        // Add file scheme and path patterns for extensions
        if !association.ext.is_empty() {
          // Create path patterns for each extension
          // Android's pathPattern needs \\. (double backslash-dot) in XML to match a literal dot
          let path_patterns: Vec<String> = association
            .ext
            .iter()
            .map(|ext| format!(".*\\\\.{}", ext.0))
            .collect();

          for pattern in &path_patterns {
            filters.push_str(&format!(
              "    <data android:pathPattern=\"{}\" />\n",
              pattern
            ));
          }
        }

        filters.push_str("</intent-filter>\n");
      }
    } else if !association.ext.is_empty() {
      // If no mime type but we have extensions, use a generic approach
      filters.push_str("<intent-filter>\n");
      filters.push_str("    <action android:name=\"android.intent.action.VIEW\" />\n");
      filters.push_str("    <category android:name=\"android.intent.category.DEFAULT\" />\n");
      filters.push_str("    <category android:name=\"android.intent.category.BROWSABLE\" />\n");

      for ext in &association.ext {
        // Android's pathPattern needs \\. (double backslash-dot) in XML to match a literal dot
        filters.push_str(&format!(
          "    <data android:pathPattern=\".*\\\\.{}\" />\n",
          ext.0
        ));
      }

      filters.push_str("</intent-filter>\n");
    }
  }

  filters
}

fn extension_to_mime_type(ext: &str) -> Option<String> {
  Some(
    match ext.to_lowercase().as_str() {
      "png" => "image/png",
      "jpg" | "jpeg" => "image/jpeg",
      "gif" => "image/gif",
      "bmp" => "image/bmp",
      "webp" => "image/webp",
      "svg" => "image/svg+xml",
      "ico" => "image/x-icon",
      "tiff" | "tif" => "image/tiff",
      "heic" | "heif" => "image/heic",
      "mp4" => "video/mp4",
      "mov" => "video/quicktime",
      "avi" => "video/x-msvideo",
      "mkv" => "video/x-matroska",
      "mp3" => "audio/mpeg",
      "wav" => "audio/wav",
      "aac" => "audio/aac",
      "m4a" => "audio/mp4",
      "pdf" => "application/pdf",
      "txt" => "text/plain",
      "html" | "htm" => "text/html",
      "json" => "application/json",
      "
```
# COMANDO - plugin.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\plugin.rs
**SHA:** 0a91231b87ba13ed
**Timestamp:** 2026-08-28T02:35:54.010052
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Self::Prompt => write!(f, "prompt"),

### Gaps
- // TODO: Change `initialization_script` to this in v3
- // TODO: Rename to `initialization_script` in v3

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! The Tauri plugin extension to expand Tauri functionality.

use crate::{
  app::UriSchemeResponder,
  ipc::{Invoke, InvokeHandler, ScopeObject, ScopeValue},
  manager::webview::UriSchemeProtocol,
  utils::config::PluginConfig,
  webview::PageLoadPayload,
  AppHandle, Error, RunEvent, Runtime, UriSchemeContext, Webview, Window,
};
use serde::{
  de::{Deserialize, DeserializeOwned, Deserializer, Error as DeError},
  Serialize, Serializer,
};
use serde_json::Value as JsonValue;
use tauri_macros::default_runtime;
use tauri_runtime::webview::InitializationScript;
use thiserror::Error;
use url::Url;

use std::{
  borrow::Cow,
  collections::HashMap,
  fmt::{self, Debug},
  sync::Arc,
};

/// Mobile APIs.
#[cfg(mobile)]
pub mod mobile;

/// The plugin interface.
pub trait Plugin<R: Runtime>: Send {
  /// The plugin name. Used as key on the plugin config object.
  fn name(&self) -> &'static str;

  /// Initializes the plugin.
  #[allow(unused_variables)]
  fn initialize(
    &mut self,
    app: &AppHandle<R>,
    config: JsonValue,
  ) -> Result<(), Box<dyn std::error::Error>> {
    Ok(())
  }

  /// Add the provided JavaScript to a list of scripts that should be run after the global object has been created,
  /// but before the HTML document has been parsed and before any other script included by the HTML document is run.
  ///
  /// The script is wrapped into its own context with `(function () { /* your script here */ })();`,
  /// so global variables must be assigned to `window` instead of implicitly declared.
  ///
  /// This is executed only on the main frame.
  /// If you only want to run it in all frames, use [`Plugin::initialization_script_2`] to set that to false.
  ///
  /// ## Platform-specific
  ///
  /// - **Windows:** scripts are always added to subframes.
  /// - **Android:** When [addDocumentStartJavaScript] is not supported,
  ///   we prepend initialization scripts to each HTML head (implementation only supported on custom protocol URLs).
  ///   For remote URLs, we use [onPageStarted] which is not guaranteed to run before other scripts.
  ///
  /// [addDocumentStartJavaScript]: https://developer.android.com/reference/androidx/webkit/WebViewCompat#addDocumentStartJavaScript(android.webkit.WebView,java.lang.String,java.util.Set%3Cjava.lang.String%3E)
  /// [onPageStarted]: https://developer.android.com/reference/android/webkit/WebViewClient#onPageStarted(android.webkit.WebView,%20java.lang.String,%20android.graphics.Bitmap)
  fn initialization_script(&self) -> Option<String> {
    None
  }

  // TODO: Change `initialization_script` to this in v3
  /// Same as [`Plugin::initialization_script`] but returns an [`InitializationScript`] instead
  /// We plan to replace [`Plugin::initialization_script`] with this signature in v3
  fn initialization_script_2(&self) -> Option<InitializationScript> {
    self
      .initialization_script()
      .map(|script| InitializationScript {
        script,
        for_main_frame_only: true,
      })
  }

  /// Callback invoked when the window is created.
  #[allow(unused_variables)]
  fn window_created(&mut self, window: Window<R>) {}

  /// Callback invoked when the webview is created.
  #[allow(unused_variables)]
  fn webview_created(&mut self, webview: Webview<R>) {}

  /// Callback invoked when webview tries to navigate to the given Url. Returning false cancels navigation.
  #[allow(unused_variables)]
  fn on_navigation(&mut self, webview: &Webview<R>, url: &Url) -> bool {
    true
  }

  /// Callback invoked when the webview performs a navigation to a page.
  #[allow(unused_variables)]
  fn on_page_load(&mut self, webview: &Webview<R>, payload: &PageLoadPayload<'_>) {}

  /// Callback invoked when the event loop receives a new event.
  #[allow(unused_variables)]
  fn on_event(&mut self, app: &AppHandle<R>, event: &RunEvent) {}

  /// Extend commands to [`crate::Builder::invoke_handler`].
  #[allow(unused_variables)]
  fn extend_api(&mut self, invoke: Invoke<R>) -> bool {
    false
  }
}

type SetupHook<R, C> =
  dyn FnOnce(&AppHandle<R>, PluginApi<R, C>) -> Result<(), Box<dyn std::error::Error>> + Send;
type OnWindowReady<R> = dyn FnMut(Window<R>) + Send;
type OnWebviewReady<R> = dyn FnMut(Webview<R>) + Send;
type OnEvent<R> = dyn FnMut(&AppHandle<R>, &RunEvent) + Send;
type OnNavigation<R> = dyn Fn(&Webview<R>, &Url) -> bool + Send;
type OnPageLoad<R> = dyn FnMut(&Webview<R>, &PageLoadPayload<'_>) + Send;
type OnDrop<R> = dyn FnOnce(AppHandle<R>) + Send;

/// A handle to a plugin.
#[derive(Debug)]
#[allow(dead_code)]
pub struct PluginHandle<R: Runtime> {
  name: &'static str,
  handle: AppHandle<R>,
}

impl<R: Runtime> Clone for PluginHandle<R> {
  fn clone(&self) -> Self {
    Self {
      name: self.name,
      handle: self.handle.clone(),
    }
  }
}

impl<R: Runtime> PluginHandle<R> {
  /// Returns the application
```
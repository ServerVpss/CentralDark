# COMANDO - webview.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\manager\webview.rs
**SHA:** 24d3d51920ccd56d
**Timestamp:** 2026-08-28T02:35:54.497918
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern::PatternJavascript,
- pattern: (&*app_manager.pattern).into(),
- crate::Pattern::Isolation { schema, .. } => {
- crate::pattern::format_real_schema(schema, use_https_scheme)
- if let crate::Pattern::Isolation { schema, .. } = &*app_manager.pattern {
- isolation_src: &crate::pattern::format_real_schema(schema, use_https_scheme),
- style: tauri_utils::pattern::isolation::IFRAME_STYLE,
- if let crate::Pattern::Isolation {
- let pattern = app_manager.pattern.clone();
- if let crate::Pattern::Isolation { schema, .. } = &*pattern {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::{
  borrow::Cow,
  collections::{HashMap, HashSet},
  fmt,
  fs::create_dir_all,
  sync::{Arc, Mutex, MutexGuard},
};

use serde::Serialize;
use serialize_to_javascript::{default_template, DefaultTemplate, Template};
use tauri_runtime::{
  webview::{DetachedWebview, InitializationScript, PendingWebview},
  window::DragDropEvent,
};
use tauri_utils::config::WebviewUrl;
use url::Url;

use crate::{
  app::{GlobalWebviewEventListener, OnPageLoad, UriSchemeResponder, WebviewEvent},
  ipc::InvokeHandler,
  pattern::PatternJavascript,
  sealed::ManagerBase,
  webview::PageLoadPayload,
  EventLoopMessage, EventTarget, Manager, Runtime, Scopes, UriSchemeContext, Webview, Window,
};

#[cfg(any(target_os = "macos", target_os = "ios"))]
use crate::app::OnWebContentProcessTerminate;

use super::{
  window::{DragDropPayload, DRAG_DROP_EVENT, DRAG_ENTER_EVENT, DRAG_LEAVE_EVENT, DRAG_OVER_EVENT},
  {AppManager, EmitPayload},
};

// we need to proxy the dev server on mobile because we can't use `localhost`, so we use the local IP address
// and we do not get a secure context without the custom protocol that proxies to the dev server
// additionally, we need the custom protocol to inject the initialization scripts on Android
// must also keep in sync with the `let mut response` assignment in prepare_uri_scheme_protocol
pub(crate) const PROXY_DEV_SERVER: bool = cfg!(all(dev, mobile));

pub(crate) const PROCESS_IPC_MESSAGE_FN: &str =
  include_str!("../../scripts/process-ipc-message-fn.js");

#[cfg(feature = "isolation")]
#[derive(Template)]
#[default_template("../../scripts/isolation.js")]
pub(crate) struct IsolationJavascript<'a> {
  pub(crate) isolation_src: &'a str,
  pub(crate) style: &'a str,
}

#[derive(Template)]
#[default_template("../../scripts/ipc.js")]
pub(crate) struct IpcJavascript<'a> {
  pub(crate) isolation_origin: &'a str,
}

/// Uses a custom URI scheme handler to resolve file requests
pub struct UriSchemeProtocol<R: Runtime> {
  /// Handler for protocol
  #[allow(clippy::type_complexity)]
  pub handler:
    Box<dyn Fn(UriSchemeContext<'_, R>, http::Request<Vec<u8>>, UriSchemeResponder) + Send + Sync>,
}

pub struct WebviewManager<R: Runtime> {
  pub webviews: Mutex<HashMap<String, Webview<R>>>,
  /// The JS message handler.
  pub invoke_handler: Box<InvokeHandler<R>>,
  /// The page load hook, invoked when the webview performs a navigation.
  pub on_page_load: Option<Arc<OnPageLoad<R>>>,
  /// The web content process termination hook.
  #[cfg(any(target_os = "macos", target_os = "ios"))]
  pub on_web_content_process_terminate: Option<Arc<OnWebContentProcessTerminate<R>>>,
  /// The webview protocols available to all webviews.
  pub uri_scheme_protocols: Mutex<HashMap<String, Arc<UriSchemeProtocol<R>>>>,
  /// Webview event listeners to all webviews.
  pub event_listeners: Arc<Vec<GlobalWebviewEventListener<R>>>,

  /// The script that initializes the invoke system.
  pub invoke_initialization_script: String,

  /// A runtime generated invoke key.
  pub(crate) invoke_key: String,
}

impl<R: Runtime> fmt::Debug for WebviewManager<R> {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    f.debug_struct("WebviewManager")
      .field(
        "invoke_initialization_script",
        &self.invoke_initialization_script,
      )
      .field("invoke_key", &self.invoke_key)
      .finish()
  }
}

impl<R: Runtime> WebviewManager<R> {
  pub(crate) fn register_uri_scheme_protocol<N: Into<String>>(
    &self,
    uri_scheme: N,
    protocol: Arc<UriSchemeProtocol<R>>,
  ) {
    let uri_scheme = uri_scheme.into();
    self
      .uri_scheme_protocols
      .lock()
      .unwrap()
      .insert(uri_scheme, protocol);
  }

  /// Get a locked handle to the webviews.
  pub(crate) fn webviews_lock(&self) -> MutexGuard<'_, HashMap<String, Webview<R>>> {
    self.webviews.lock().expect("poisoned webview manager")
  }

  fn prepare_pending_webview<M: Manager<R>>(
    &self,
    mut pending: PendingWebview<EventLoopMessage, R>,
    label: &str,
    window_label: &str,
    manager: &M,
  ) -> crate::Result<PendingWebview<EventLoopMessage, R>> {
    let app_manager = manager.manager();

    let plugin_init_scripts = app_manager
      .plugins
      .lock()
      .expect("poisoned plugin store")
      .initialization_script();

    let pattern_init = PatternJavascript {
      pattern: (&*app_manager.pattern).into(),
    }
    .render_default(&Default::default())?;

    let mut webview_attributes = pending.webview_attributes;

    let use_https_scheme = webview_attributes.use_https_scheme;

    let ipc_init = IpcJavascript {
      isolation_origin: &match &*app_manager.pattern {
        #[cfg(feature = "isolation")]
        crate::Pattern::Isolation { schema, .. } => {
          crate::pattern::format_real_schema(schema, use_https_scheme)
        }
        _ => "".to_owned(
```
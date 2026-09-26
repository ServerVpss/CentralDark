# COMANDO - web_context.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\wry-0.55.1\src\webkitgtk\web_context.rs
**SHA:** ef43edb59e19e607
**Timestamp:** 2026-08-28T02:37:43.259368
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Consider taking a cache_directory so this can be in XDG_CACHE_HOME.
- // TODO: If this keeps causing problems, just remove it and use whatever file name webkitgtk suggests.
- // TODO: check if we may also need `false`

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2020-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! Unix platform extensions for [`WebContext`](super::WebContext).

use crate::{Error, RequestAsyncResponder};
use gtk::glib::{self, MainContext, ObjectExt};
use http::{header::CONTENT_TYPE, HeaderName, HeaderValue, Request, Response as HttpResponse};
use soup::{MessageHeaders, MessageHeadersType};
use std::{
  borrow::Cow,
  cell::RefCell,
  env::current_dir,
  path::{Path, PathBuf},
  rc::Rc,
};
use webkit2gtk::{
  ApplicationInfo, AutomationSessionExt, CookiePersistentStorage, DownloadExt, SecurityManagerExt,
  URIRequest, URIRequestExt, URISchemeRequest, URISchemeRequestExt, URISchemeResponse,
  URISchemeResponseExt, WebContext, WebContextExt as Webkit2gtkContextExt, WebView, WebViewExt,
};

#[derive(Debug)]
pub struct WebContextImpl {
  context: WebContext,
  automation: bool,
  app_info: Option<ApplicationInfo>,
}

impl WebContextImpl {
  pub fn new(data_directory: Option<&Path>) -> Self {
    use webkit2gtk::{CookieManagerExt, WebsiteDataManager, WebsiteDataManagerExt};
    let mut context_builder = WebContext::builder();
    if let Some(data_directory) = data_directory {
      let data_manager = WebsiteDataManager::builder()
        // TODO: Consider taking a cache_directory so this can be in XDG_CACHE_HOME.
        .base_cache_directory(data_directory.to_string_lossy())
        .base_data_directory(data_directory.to_string_lossy())
        .build();
      if let Some(cookie_manager) = data_manager.cookie_manager() {
        cookie_manager.set_persistent_storage(
          &data_directory.join("cookies").to_string_lossy(),
          CookiePersistentStorage::Text,
        );
      }
      context_builder = context_builder.website_data_manager(&data_manager);
    }
    let context = context_builder.build();

    Self::create_context(context)
  }

  pub fn new_ephemeral() -> Self {
    let context = WebContext::new_ephemeral();

    Self::create_context(context)
  }

  pub fn create_context(context: WebContext) -> Self {
    let automation = false;
    context.set_automation_allowed(automation);

    // e.g. wry 0.9.4
    let app_info = ApplicationInfo::new();
    app_info.set_name(env!("CARGO_PKG_NAME"));
    app_info.set_version(
      env!("CARGO_PKG_VERSION_MAJOR")
        .parse()
        .expect("invalid wry version major"),
      env!("CARGO_PKG_VERSION_MINOR")
        .parse()
        .expect("invalid wry version minor"),
      env!("CARGO_PKG_VERSION_PATCH")
        .parse()
        .expect("invalid wry version patch"),
    );

    Self {
      context,
      automation,
      app_info: Some(app_info),
    }
  }

  pub fn set_allows_automation(&mut self, flag: bool) {
    self.automation = flag;
    self.context.set_automation_allowed(flag);
  }

  pub fn set_web_extensions_directory(&mut self, path: &Path) {
    self
      .context
      .set_web_extensions_directory(&path.to_string_lossy());
  }
}

/// [`WebContext`](super::WebContext) items that only matter on unix.
pub trait WebContextExt {
  /// The GTK [`WebContext`] of all webviews in the context.
  fn context(&self) -> &WebContext;

  /// Register a custom protocol to the web context.
  fn register_uri_scheme<F>(&mut self, name: &str, handler: F) -> crate::Result<()>
  where
    F: Fn(crate::WebViewId, Request<Vec<u8>>, RequestAsyncResponder) + 'static;

  /// Loads a URI for a [`WebView`].
  fn load_uri(&self, webview: WebView, url: String, headers: Option<http::HeaderMap>);

  /// If the context allows automation.
  ///
  /// **Note:** `libwebkit2gtk` only allows 1 automation context at a time.
  fn allows_automation(&self) -> bool;

  fn register_automation(&mut self, webview: WebView);

  fn register_download_handler(
    &mut self,
    download_started_callback: Option<Box<dyn FnMut(String, &mut PathBuf) -> bool>>,
    download_completed_callback: Option<Rc<dyn Fn(String, Option<PathBuf>, bool) + 'static>>,
  );
}

impl WebContextExt for super::WebContext {
  fn context(&self) -> &WebContext {
    &self.os.context
  }

  fn register_uri_scheme<F>(&mut self, name: &str, handler: F) -> crate::Result<()>
  where
    F: Fn(crate::WebViewId, Request<Vec<u8>>, RequestAsyncResponder) + 'static,
  {
    self.register_custom_protocol(name.to_owned())?;

    // Enable secure context
    self
      .os
      .context
      .security_manager()
      .ok_or(Error::MissingManager)?
      .register_uri_scheme_as_secure(name);

    self.os.context.register_uri_scheme(name, move |request| {
      #[cfg(feature = "tracing")]
      let span = tracing::info_span!(parent: None, "wry::custom_protocol::handle", uri = tracing::field::Empty).entered();

      if let Some(uri) = request.uri() {
        let uri = uri.as_str();

        #[cfg(feature = "tracing")]
        span.record("uri", uri);

        #[allow(unused_mut)]
        let mut http_request = Request::builder().uri(uri).method("GET");

        // Set req
```
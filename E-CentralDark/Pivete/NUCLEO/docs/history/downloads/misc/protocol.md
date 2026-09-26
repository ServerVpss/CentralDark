# OUTRO - protocol.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\ipc\protocol.rs
**SHA:** f9748a000d294686
**Timestamp:** 2026-08-28T02:35:54.417260
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- payload: crate::utils::pattern::isolation::RawIsolationPayload<'a>,
- if let crate::Pattern::Isolation { crypto_keys, .. } = &*manager.pattern {
- if let crate::Pattern::Isolation { crypto_keys, .. } = &*manager.pattern {
- (body, content_type) = crate::utils::pattern::isolation::RawIsolationPayload::try_from(&body)
- let crate::pattern::Pattern::Isolation { crypto_keys, .. } = &context.pattern else {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::{borrow::Cow, sync::Arc};

use crate::{
  ipc::InvokeResponseBody,
  manager::AppManager,
  webview::{InvokeRequest, UriSchemeProtocolHandler},
  Runtime,
};
use http::{
  header::{
    ACCESS_CONTROL_ALLOW_HEADERS, ACCESS_CONTROL_ALLOW_ORIGIN, ACCESS_CONTROL_EXPOSE_HEADERS,
    CONTENT_TYPE,
  },
  HeaderValue, Method, Request, StatusCode,
};
use url::Url;

use super::{CallbackFn, InvokeResponse};

const TAURI_CALLBACK_HEADER_NAME: &str = "Tauri-Callback";
const TAURI_ERROR_HEADER_NAME: &str = "Tauri-Error";
const TAURI_INVOKE_KEY_HEADER_NAME: &str = "Tauri-Invoke-Key";

const TAURI_RESPONSE_HEADER_NAME: &str = "Tauri-Response";
const TAURI_RESPONSE_HEADER_ERROR: &str = "error";
const TAURI_RESPONSE_HEADER_OK: &str = "ok";

pub fn message_handler<R: Runtime>(
  manager: Arc<AppManager<R>>,
) -> crate::runtime::webview::WebviewIpcHandler<crate::EventLoopMessage, R> {
  Box::new(move |webview, request| handle_ipc_message(request, &manager, &webview.label))
}

pub fn get<R: Runtime>(manager: Arc<AppManager<R>>) -> UriSchemeProtocolHandler {
  Box::new(move |label, request, responder| {
    #[cfg(feature = "tracing")]
    let span = tracing::trace_span!(
      "ipc::request",
      kind = "custom-protocol",
      request = tracing::field::Empty
    )
    .entered();

    let respond = move |mut response: http::Response<Cow<'static, [u8]>>| {
      response
        .headers_mut()
        .insert(ACCESS_CONTROL_ALLOW_ORIGIN, HeaderValue::from_static("*"));
      response.headers_mut().insert(
        ACCESS_CONTROL_EXPOSE_HEADERS,
        HeaderValue::from_static(TAURI_RESPONSE_HEADER_NAME),
      );
      responder.respond(response);
    };

    match *request.method() {
      Method::POST => {
        if let Some(webview) = manager.get_webview(label) {
          match parse_invoke_request(&manager, request) {
            Ok(request) => {
              #[cfg(feature = "tracing")]
              span.record(
                "request",
                match &request.body {
                  super::InvokeBody::Json(j) => serde_json::to_string(j).unwrap(),
                  super::InvokeBody::Raw(b) => serde_json::to_string(b).unwrap(),
                },
              );
              #[cfg(feature = "tracing")]
              let request_span = tracing::trace_span!("ipc::request::handle", cmd = request.cmd);

              webview.on_message(
                request,
                Box::new(move |_webview, _cmd, response, _callback, _error| {
                  #[cfg(feature = "tracing")]
                  let _respond_span = tracing::trace_span!(
                    parent: &request_span,
                    "ipc::request::respond"
                  )
                  .entered();

                  #[cfg(feature = "tracing")]
                  let response_span = match &response {
                    InvokeResponse::Ok(InvokeResponseBody::Json(v)) => tracing::trace_span!(
                      "ipc::request::response",
                      response = v,
                      mime_type = tracing::field::Empty
                    )
                    .entered(),
                    InvokeResponse::Ok(InvokeResponseBody::Raw(v)) => tracing::trace_span!(
                      "ipc::request::response",
                      response = format!("{v:?}"),
                      mime_type = tracing::field::Empty
                    )
                    .entered(),
                    InvokeResponse::Err(e) => tracing::trace_span!(
                      "ipc::request::response",
                      error = format!("{e:?}"),
                      mime_type = tracing::field::Empty
                    )
                    .entered(),
                  };

                  let response_header = match &response {
                    InvokeResponse::Ok(_) => TAURI_RESPONSE_HEADER_OK,
                    InvokeResponse::Err(_) => TAURI_RESPONSE_HEADER_ERROR,
                  };

                  let (mut response, mime_type) = match response {
                    InvokeResponse::Ok(InvokeResponseBody::Json(v)) => (
                      http::Response::new(v.into_bytes().into()),
                      mime::APPLICATION_JSON,
                    ),
                    InvokeResponse::Ok(InvokeResponseBody::Raw(v)) => (
                      http::Response::new(v.into()),
                      mime::APPLICATION_OCTET_STREAM,
                    ),
                    InvokeResponse::Err(e) => (
                      http::Response::new(serde_json::to_vec(&e.0).unwrap().into()),
                      mime::APPLICATION_JSON,
                    ),
                  };

                  response
                    .headers_mut()
                    .insert(TAURI_RESPONSE_HEADER_NAME, response_header.parse().unwrap());

                  #[cfg(feature = "tracing")]
            
```
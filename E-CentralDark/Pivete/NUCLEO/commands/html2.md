# COMANDO - html2.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-utils-2.9.3\src\html2.rs
**SHA:** 04beee12c794585d
**Timestamp:** 2026-08-28T02:36:00.682487
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- use crate::pattern::isolation::IsolationJavascriptCodegen;

### Gaps
- // TODO: Verify this, this is not found in the HTML spec, see https://github.com/tauri-apps/tauri/pull/14265#discussion_r2415396842

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! The module to process HTML in Tauri.
//!
//! # Stability
//!
//! This is utility used in Tauri internally and not considered part of the stable API.
//! If you use it, note that it may include breaking changes in the future.

use dom_query::NodeRef;

use crate::{
  assets::{SCRIPT_NONCE_TOKEN, STYLE_NONCE_TOKEN},
  config::DisabledCspModificationKind,
};

/// # Stability
///
/// This dependency might receive updates in minor releases.
pub use dom_query::Document;

/// Serializes the document to HTML.
///
/// # Stability
///
/// This dependency [`dom_query`] for [`Document`] might receive updates in minor releases.
pub fn serialize_doc(document: &Document) -> Vec<u8> {
  document.html().as_bytes().to_vec()
}

/// Parses the given HTML string.
///
/// # Stability
///
/// This dependency [`dom_query`] for [`Document`] might receive updates in minor releases.
pub fn parse_doc(html: String) -> Document {
  Document::from(html)
}

fn ensure_head(document: &Document) -> NodeRef<'_> {
  document.head().unwrap_or_else(|| {
    let html = document.html_root();
    let head = document.tree.new_element("head");
    html.prepend_child(&head);
    head
  })
}

fn inject_nonce(document: &Document, selector: &str, token: &str) {
  let elements = document.select(selector);
  for elem in elements.nodes() {
    // if the node already has the `nonce` attribute, skip it
    if elem.attr("nonce").is_some() {
      continue;
    }
    elem.set_attr("nonce", token);
  }
}

/// Inject nonce tokens to all scripts and styles.
///
/// # Stability
///
/// This dependency [`dom_query`] for [`Document`] might receive updates in minor releases.
pub fn inject_nonce_token(
  document: &Document,
  dangerous_disable_asset_csp_modification: &DisabledCspModificationKind,
) {
  if dangerous_disable_asset_csp_modification.can_modify("script-src") {
    inject_nonce(document, "script[src^='http']", SCRIPT_NONCE_TOKEN);
  }
  if dangerous_disable_asset_csp_modification.can_modify("style-src") {
    inject_nonce(document, "style", STYLE_NONCE_TOKEN);
  }
}

/// Injects a content security policy to the HTML.
///
/// # Stability
///
/// This dependency [`dom_query`] for [`Document`] might receive updates in minor releases.
pub fn inject_csp(document: &Document, csp: &str) {
  let head = ensure_head(document);
  let meta_tag = document.tree.new_element("meta");
  meta_tag.set_attr("http-equiv", "Content-Security-Policy");
  meta_tag.set_attr("content", csp);
  head.append_child(&meta_tag);
}

/// Injects a content security policy to the HTML.
///
/// # Stability
///
/// This dependency [`dom_query`] for [`Document`] might receive updates in minor releases.
pub fn append_script_to_head(document: &Document, script: &str) {
  let head = ensure_head(document);
  let script_tag = document.tree.new_element("script");
  script_tag.set_text(script);
  head.prepend_child(&script_tag);
}

/// Injects the Isolation JavaScript to a codegen time document.
///
/// Note: This function is not considered part of the stable API.
///
/// # Stability
///
/// This dependency [`dom_query`] for [`Document`] might receive updates in minor releases.
#[cfg(feature = "isolation")]
pub fn inject_codegen_isolation_script(document: &Document) {
  use crate::pattern::isolation::IsolationJavascriptCodegen;
  use serialize_to_javascript::DefaultTemplate;

  let head = ensure_head(document);

  let script_content = IsolationJavascriptCodegen {}
    .render_default(&Default::default())
    .expect("unable to render codegen isolation script template")
    .into_string();

  let script_tag = document.tree.new_element("script");
  script_tag.set_attr("nonce", SCRIPT_NONCE_TOKEN);
  script_tag.set_text(script_content);

  head.prepend_child(&script_tag);
}

/// Temporary workaround for Windows not allowing requests
///
/// Note: this does not prevent path traversal due to the isolation application expectation that it
/// is secure.
///
/// # Stability
///
/// This dependency [`dom_query`] for [`Document`] might receive updates in minor releases.
#[cfg(feature = "isolation")]
pub fn inline_isolation(document: &Document, dir: &std::path::Path) {
  let scripts = document.select("script[src]");

  for script in scripts.nodes() {
    let src = match script.attr("src") {
      Some(s) => s.to_string(),
      None => continue,
    };

    let mut path = std::path::PathBuf::from(src);
    if path.has_root() {
      path = path
        .strip_prefix("/")
        .expect("Tauri \"Isolation\" Pattern only supports relative or absolute (`/`) paths.")
        .into();
    }

    let file = std::fs::read_to_string(dir.join(path)).expect("unable to find isolation file");

    script.set_text(file);
    script.remove_attr("src");
  }
}

// TODO: Verify this, this is not found in the HTML spec, see https://github.com/tauri-apps/tauri/pull/14265#discussion_r241539
```
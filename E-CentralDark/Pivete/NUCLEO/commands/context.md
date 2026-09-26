# COMANDO - context.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-codegen-2.6.3\src\context.rs
**SHA:** ea13b70394f01668
**Timestamp:** 2026-08-28T02:35:55.562253
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- hasher.update(tauri_utils::pattern::isolation::IFRAME_STYLE);
- let pattern = match &options.pattern {
- PatternKind::Brownfield => quote!(#root::Pattern::Brownfield),
- quote!(#root::Pattern::Brownfield)
- quote!(#root::Pattern::Isolation {
- crypto_keys: std::boxed::Box::new(::tauri::utils::pattern::isolation::Keys::new().expect("unable to generate cryptographically secure keys for Tauri \"Isolation\" Pattern")),

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::collections::BTreeMap;
use std::convert::identity;
use std::path::{Path, PathBuf};
use std::{ffi::OsStr, str::FromStr};

use crate::{
  embedded_assets::{
    ensure_out_dir, AssetOptions, CspHashes, EmbeddedAssets, EmbeddedAssetsResult,
  },
  image::CachedIcon,
};
use base64::Engine;
use proc_macro2::TokenStream;
use quote::quote;
use sha2::{Digest, Sha256};
use syn::Expr;
use tauri_utils::{
  acl::{
    get_capabilities, manifest::Manifest, resolved::Resolved, ACL_MANIFESTS_FILE_NAME,
    CAPABILITIES_FILE_NAME,
  },
  assets::AssetKey,
  config::{Config, FrontendDist, PatternKind},
  html2::{inject_nonce_token, parse_doc, serialize_doc, Document},
  platform::Target,
  tokens::{map_lit, str_lit},
};

/// Necessary data needed by [`context_codegen`] to generate code for a Tauri application context.
pub struct ContextData {
  pub dev: bool,
  pub config: Config,
  pub config_parent: PathBuf,
  pub root: TokenStream,
  /// Additional capabilities to include.
  pub capabilities: Option<Vec<PathBuf>>,
  /// The custom assets implementation
  pub assets: Option<Expr>,
  /// Skip runtime-only types generation for tests (e.g. embed-plist usage).
  pub test: bool,
}

fn inject_script_hashes(document: &Document, key: &AssetKey, csp_hashes: &mut CspHashes) {
  let script_elements = document.select("script:not(:empty)");

  let scripts = script_elements
    .iter()
    .map(|element| {
      let script = tauri_utils::html2::normalize_script_for_csp(element.text().as_bytes());
      let script_hash = Sha256::digest(script);
      let hash_base64 = base64::engine::general_purpose::STANDARD.encode(script_hash);

      format!("'sha256-{hash_base64}'")
    })
    .collect::<Vec<_>>();

  csp_hashes
    .inline_scripts
    .entry(key.clone().into())
    .or_default()
    .extend(scripts);
}

fn map_core_assets(
  options: &AssetOptions,
) -> impl Fn(&AssetKey, &Path, &mut Vec<u8>, &mut CspHashes) -> EmbeddedAssetsResult<()> {
  let csp = options.csp;
  let dangerous_disable_asset_csp_modification =
    options.dangerous_disable_asset_csp_modification.clone();
  move |key, path, input, csp_hashes| {
    if path.extension() == Some(OsStr::new("html")) {
      #[allow(clippy::collapsible_if)]
      if csp {
        let document = parse_doc(String::from_utf8_lossy(input).into_owned());

        inject_nonce_token(&document, &dangerous_disable_asset_csp_modification);

        if dangerous_disable_asset_csp_modification.can_modify("script-src") {
          inject_script_hashes(&document, key, csp_hashes);
        }

        *input = serialize_doc(&document);
      }
    }
    Ok(())
  }
}

#[cfg(feature = "isolation")]
fn map_isolation(
  _options: &AssetOptions,
  dir: PathBuf,
) -> impl Fn(&AssetKey, &Path, &mut Vec<u8>, &mut CspHashes) -> EmbeddedAssetsResult<()> {
  // create the csp for the isolation iframe styling now, to make the runtime less complex
  let mut hasher = Sha256::new();
  hasher.update(tauri_utils::pattern::isolation::IFRAME_STYLE);
  let hash = hasher.finalize();
  let iframe_style_csp_hash = format!(
    "'sha256-{}'",
    base64::engine::general_purpose::STANDARD.encode(hash)
  );

  move |key, path, input, csp_hashes| {
    if path.extension() == Some(OsStr::new("html")) {
      let isolation_html = parse_doc(String::from_utf8_lossy(input).into_owned());

      // this is appended, so no need to reverse order it
      tauri_utils::html2::inject_codegen_isolation_script(&isolation_html);

      // temporary workaround for windows not loading assets
      tauri_utils::html2::inline_isolation(&isolation_html, &dir);

      inject_nonce_token(
        &isolation_html,
        &tauri_utils::config::DisabledCspModificationKind::Flag(false),
      );

      inject_script_hashes(&isolation_html, key, csp_hashes);

      csp_hashes.styles.push(iframe_style_csp_hash.clone());

      *input = serialize_doc(&isolation_html)
    }

    Ok(())
  }
}

/// Build a `tauri::Context` for including in application code.
pub fn context_codegen(data: ContextData) -> EmbeddedAssetsResult<TokenStream> {
  let ContextData {
    dev,
    config,
    config_parent,
    root,
    capabilities: additional_capabilities,
    assets,
    test,
  } = data;

  #[allow(unused_variables)]
  let running_tests = test;

  let target = std::env::var("TAURI_ENV_TARGET_TRIPLE")
    .as_deref()
    .map(Target::from_triple)
    .unwrap_or_else(|_| Target::current());

  let mut options = AssetOptions::new(config.app.security.pattern.clone())
    .freeze_prototype(config.app.security.freeze_prototype)
    .dangerous_disable_asset_csp_modification(
      config
        .app
        .security
        .dangerous_disable_asset_csp_modification
        .clone(),
    );
  let csp = if dev {
    config
      .app
      .security
      .dev_csp
      .as_ref()
      .or(config.app.security.csp.as_ref())

```
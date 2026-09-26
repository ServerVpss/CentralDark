# OUTRO - embedded_assets.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-codegen-2.6.3\src\embedded_assets.rs
**SHA:** 95d96bdf8295ee6e
**Timestamp:** 2026-08-28T02:35:55.757127
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pub(crate) pattern: PatternKind,
- pub fn new(pattern: PatternKind) -> Self {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use base64::Engine;
use proc_macro2::TokenStream;
use quote::{quote, ToTokens, TokenStreamExt};
use sha2::{Digest, Sha256};
use std::{
  collections::HashMap,
  fs::File,
  path::{Path, PathBuf},
};
use tauri_utils::config::PatternKind;
use tauri_utils::{assets::AssetKey, config::DisabledCspModificationKind};
use thiserror::Error;
use walkdir::{DirEntry, WalkDir};

#[cfg(feature = "compression")]
use brotli::enc::backward_references::BrotliEncoderParams;

/// The subdirectory inside the target directory we want to place assets.
const TARGET_PATH: &str = "tauri-codegen-assets";

/// (key, (original filepath, compressed bytes))
type Asset = (AssetKey, (PathBuf, PathBuf));

/// All possible errors while reading and compressing an [`EmbeddedAssets`] directory
#[derive(Debug, Error)]
#[non_exhaustive]
pub enum EmbeddedAssetsError {
  #[error("failed to read asset at {path} because {error}")]
  AssetRead {
    path: PathBuf,
    error: std::io::Error,
  },

  #[error("failed to write asset from {path} to Vec<u8> because {error}")]
  AssetWrite {
    path: PathBuf,
    error: std::io::Error,
  },

  #[error("failed to create hex from bytes because {0}")]
  Hex(std::fmt::Error),

  #[error("invalid prefix {prefix} used while including path {path}")]
  PrefixInvalid { prefix: PathBuf, path: PathBuf },

  #[error("invalid extension `{extension}` used for image {path}, must be `ico` or `png`")]
  InvalidImageExtension { extension: PathBuf, path: PathBuf },

  #[error("failed to walk directory {path} because {error}")]
  Walkdir {
    path: PathBuf,
    error: walkdir::Error,
  },

  #[error("OUT_DIR env var is not set, do you have a build script?")]
  OutDir,

  #[error("version error: {0}")]
  Version(#[from] semver::Error),
}

pub type EmbeddedAssetsResult<T> = Result<T, EmbeddedAssetsError>;

/// Represent a directory of assets that are compressed and embedded.
///
/// This is the compile time generation of [`tauri_utils::assets::Assets`] from a directory. Assets
/// from the directory are added as compiler dependencies by dummy including the original,
/// uncompressed assets.
///
/// The assets are compressed during this runtime, and can only be represented as a [`TokenStream`]
/// through [`ToTokens`]. The generated code is meant to be injected into an application to include
/// the compressed assets in that application's binary.
#[derive(Default)]
pub struct EmbeddedAssets {
  assets: HashMap<AssetKey, (PathBuf, PathBuf)>,
  csp_hashes: CspHashes,
}

pub struct EmbeddedAssetsInput(Vec<PathBuf>);

impl From<PathBuf> for EmbeddedAssetsInput {
  fn from(path: PathBuf) -> Self {
    Self(vec![path])
  }
}

impl From<Vec<PathBuf>> for EmbeddedAssetsInput {
  fn from(paths: Vec<PathBuf>) -> Self {
    Self(paths)
  }
}

/// Holds a list of (prefix, entry)
struct RawEmbeddedAssets {
  paths: Vec<(PathBuf, DirEntry)>,
  csp_hashes: CspHashes,
}

impl RawEmbeddedAssets {
  /// Creates a new list of (prefix, entry) from a collection of inputs.
  fn new(input: EmbeddedAssetsInput, options: &AssetOptions) -> Result<Self, EmbeddedAssetsError> {
    let mut csp_hashes = CspHashes::default();

    input
      .0
      .into_iter()
      .flat_map(|path| {
        let prefix = if path.is_dir() {
          path.clone()
        } else {
          path
            .parent()
            .expect("embedded file asset has no parent")
            .to_path_buf()
        };

        WalkDir::new(&path)
          .follow_links(true)
          .contents_first(true)
          .into_iter()
          .map(move |entry| (prefix.clone(), entry))
      })
      .filter_map(|(prefix, entry)| {
        match entry {
          // we only serve files, not directory listings
          Ok(entry) if entry.file_type().is_dir() => None,

          // compress all files encountered
          Ok(entry) => {
            if let Err(error) = csp_hashes
              .add_if_applicable(&entry, &options.dangerous_disable_asset_csp_modification)
            {
              Some(Err(error))
            } else {
              Some(Ok((prefix, entry)))
            }
          }

          // pass down error through filter to fail when encountering any error
          Err(error) => Some(Err(EmbeddedAssetsError::Walkdir {
            path: prefix,
            error,
          })),
        }
      })
      .collect::<Result<Vec<(PathBuf, DirEntry)>, _>>()
      .map(|paths| Self { paths, csp_hashes })
  }
}

/// Holds all hashes that we will apply on the CSP tag/header.
#[derive(Debug, Default)]
pub struct CspHashes {
  /// Scripts that are part of the asset collection (JS or MJS files).
  pub(crate) scripts: Vec<String>,
  /// Inline scripts (`<script>code</script>`). Maps a HTML path to a list of hashes.
  pub(crate) inline_scripts: HashMap<String, Vec<String>>,
  /// A list of hashes of the contents of all `style` elements.
  
```
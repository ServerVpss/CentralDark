# OUTRO - cargo_toml.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cargo_toml-0.22.3\src\cargo_toml.rs
**SHA:** 47f339eba6841482
**Timestamp:** 2026-08-28T02:33:19.853246
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub default_run: Option<String>,
- default_run: None,

### Gaps
- // TODO: allow registry to be set to crates.io explicitly?

### Ouro Bruto (primeiros 5000 chars)
```
#![forbid(unsafe_code)]
#![allow(clippy::inline_always)]
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::needless_for_each)]
#![allow(clippy::new_without_default)]
#![allow(clippy::redundant_closure_for_method_calls)]
#![allow(clippy::trivially_copy_pass_by_ref)]
#![cfg_attr(docsrs, feature(doc_cfg))]

//! This crate defines `struct`s that can be deserialized with Serde
//! to load and inspect `Cargo.toml` metadata.
//!
//! See [`Manifest::from_path`]. Note that `Cargo.toml` files are not self-contained. Correct interpretation of the manifest requires other files on disk:
//!
//! * List of files in order to auto-discover binaries, examples, benchmarks, and tests.
//! * Potentially a `Manifest` from one of parent directories, that acts as a workspace root for inheritance of shared workspace information.
//!
//! Because of this filesystem-dependence, loading `Cargo.toml` [from a string](`Manifest::from_str`) is [an advanced operation](`Manifest::complete_from_abstract_filesystem`).
//! The crate has methods for processing this information, but if you don't already have a full crate on disk, you will need to write some glue code to obtain it. See [`Manifest::complete_from_path_and_workspace`].

use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::collections::{BTreeMap, BTreeSet};
use std::fmt::Display;
use std::mem::take;
use std::path::{Path, PathBuf};
use std::{fs, io};
pub use toml::Value;

/// Dependencies. The keys in this map are not always crate names, this can be overriden by the `package` field, and there may be multiple copies of the same crate.
///
/// Optional dependencies may create implicit features, see the [`features`] module for dealing with this.
pub type DepsSet = BTreeMap<String, Dependency>;
/// Config target (see [`parse_cfg`](https://lib.rs/parse_cfg) crate) + deps for the target.
pub type TargetDepsSet = BTreeMap<String, Target>;
/// The `[features]` section. This set may be incomplete!
///
/// The `default` is special, and there may be more features
/// implied by optional dependencies.
/// See the [`features`] module for more info.
pub type FeatureSet = BTreeMap<String, Vec<String>>;
/// Locally replace dependencies
pub type PatchSet = BTreeMap<String, DepsSet>;
/// A set of lints.
pub type LintSet = BTreeMap<String, Lint>;
/// Lint groups such as [lints.rust].
pub type LintGroups = BTreeMap<String, LintSet>;

mod afs;
mod error;
mod inheritable;
pub use crate::afs::*;
pub use crate::error::Error;
pub use crate::inheritable::Inheritable;

#[cfg(feature = "features")]
#[cfg_attr(docsrs, doc(cfg(feature = "features")))]
pub mod features;

/// The top-level `Cargo.toml` structure. **This is the main type in this library.**
///
/// The `Metadata` is a generic type for `[package.metadata]` table. You can replace it with
/// your own struct type if you use the metadata and don't want to use the catch-all `Value` type.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct Manifest<Metadata = Value> {
    /// Package definition (a cargo crate)
    pub package: Option<Package<Metadata>>,

    /// Workspace-wide settings
    pub workspace: Option<Workspace<Metadata>>,

    /// Normal dependencies
    #[serde(default, skip_serializing_if = "DepsSet::is_empty")]
    pub dependencies: DepsSet,

    /// Dev/test-only deps
    #[serde(default, skip_serializing_if = "DepsSet::is_empty")]
    pub dev_dependencies: DepsSet,

    /// Build-time deps
    #[serde(default, skip_serializing_if = "DepsSet::is_empty")]
    pub build_dependencies: DepsSet,

    /// `[target.cfg.dependencies]`
    #[serde(default, skip_serializing_if = "TargetDepsSet::is_empty")]
    pub target: TargetDepsSet,

    /// The `[features]` section. This set may be incomplete!
    ///
    /// Optional dependencies may create implied Cargo features.
    /// This features section also supports microsyntax with `dep:`, `/`, and `?`
    /// for managing dependencies and their features.io
    ///
    /// This crate has an optional [`features`] module for dealing with this
    /// complexity and getting the real list of features.
    #[serde(default, skip_serializing_if = "FeatureSet::is_empty", deserialize_with = "feature_set")]
    pub features: FeatureSet,

    /// Obsolete
    #[serde(default, skip_serializing_if = "DepsSet::is_empty")]
    #[deprecated(note = "Cargo recommends patch instead")]
    pub replace: DepsSet,

    /// `[patch.crates-io]` section
    #[serde(default, skip_serializing_if = "PatchSet::is_empty")]
    pub patch: PatchSet,

    /// Note that due to autolibs feature this is not the complete list
    /// unless you run [`Manifest::complete_from_path`]
    pub lib: Option<Product>,

    /// Compilation/optimization settings
    #[serde(default, skip_serializing_if = "Profiles::should_skip_serializing")]
    pub profile: Profiles,

    /// `[badges]` section
    #[serde(default, skip_serializing_if = "Badges::should_skip_serializing")]
  
```
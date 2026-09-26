# OUTRO - resources.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-utils-2.9.3\src\resources.rs
**SHA:** 66111e061092d9c3
**Timestamp:** 2026-08-28T02:36:00.622202
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- current_pattern: Option<PathBuf>,
- let pattern = match &mut self.pattern_iter {
- current_pattern: if matches!(self.pattern_iter, PatternIter::Map(_)) {

### Gaps
- // TODO: This behavior is a confusing special case,

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::{
  collections::HashMap,
  path::{Component, Path, PathBuf},
};

use walkdir::WalkDir;

use crate::platform::Target as TargetPlatform;

/// Given a path (absolute or relative) to a resource file, returns the
/// relative path from the bundle resources directory where that resource
/// should be stored.
pub fn resource_relpath(path: &Path) -> PathBuf {
  let mut dest = PathBuf::new();
  for component in path.components() {
    match component {
      Component::Prefix(_) => {}
      Component::RootDir => dest.push("_root_"),
      Component::CurDir => {}
      Component::ParentDir => dest.push("_up_"),
      Component::Normal(string) => dest.push(string),
    }
  }
  dest
}

fn normalize(path: &Path) -> PathBuf {
  let mut dest = PathBuf::new();
  for component in path.components() {
    match component {
      Component::Prefix(_) => {}
      Component::RootDir => dest.push("/"),
      Component::CurDir => {}
      Component::ParentDir => dest.push(".."),
      Component::Normal(string) => dest.push(string),
    }
  }
  dest
}

/// Parses the external binaries to bundle, adding the target triple suffix to each of them.
pub fn external_binaries(
  external_binaries: &[String],
  target_triple: &str,
  target_platform: &TargetPlatform,
) -> Vec<String> {
  let mut paths = Vec::new();
  for curr_path in external_binaries {
    let extension = if matches!(target_platform, TargetPlatform::Windows) {
      ".exe"
    } else {
      ""
    };
    paths.push(format!("{curr_path}-{target_triple}{extension}"));
  }
  paths
}

/// Information for a resource.
#[derive(Debug)]
pub struct Resource {
  path: PathBuf,
  target: PathBuf,
}

impl Resource {
  /// The path of the resource.
  pub fn path(&self) -> &Path {
    &self.path
  }

  /// The target location of the resource.
  pub fn target(&self) -> &Path {
    &self.target
  }
}

#[derive(Debug)]
enum PatternIter<'a> {
  Slice(std::slice::Iter<'a, String>),
  Map(std::collections::hash_map::Iter<'a, String, String>),
}

/// A helper to iterate through resources.
pub struct ResourcePaths<'a> {
  iter: ResourcePathsIter<'a>,
}

impl<'a> ResourcePaths<'a> {
  /// Creates a new ResourcePaths from a slice of patterns to iterate
  pub fn new(patterns: &'a [String], allow_walk: bool) -> ResourcePaths<'a> {
    ResourcePaths {
      iter: ResourcePathsIter {
        pattern_iter: PatternIter::Slice(patterns.iter()),
        allow_walk,
        current_dest: None,
        current_iter: None,
      },
    }
  }

  /// Creates a new ResourcePaths from a slice of patterns to iterate
  pub fn from_map(patterns: &'a HashMap<String, String>, allow_walk: bool) -> ResourcePaths<'a> {
    ResourcePaths {
      iter: ResourcePathsIter {
        pattern_iter: PatternIter::Map(patterns.iter()),
        allow_walk,
        current_dest: None,
        current_iter: None,
      },
    }
  }

  /// Returns the resource iterator that yields the source and target paths.
  /// Needed when using [`Self::from_map`].
  pub fn iter(self) -> ResourcePathsIter<'a> {
    self.iter
  }
}

/// Iterator of a [`ResourcePaths`].
#[derive(Debug)]
pub struct ResourcePathsIter<'a> {
  /// the patterns to iterate.
  pattern_iter: PatternIter<'a>,
  /// whether the resource paths allows directories or not.
  allow_walk: bool,

  /// The value of map when [`Self::pattern_iter`] is a [`PatternIter::Map`],
  /// used for determining [`Resource::target`]
  current_dest: Option<PathBuf>,
  /// The iter for the current pattern. The cycle goes like this:
  /// [`ResourcePaths::next`] -> [`Self::next`] -> [`Self::pattern_iter::next`] -> [`Self::current_iter::next`]
  current_iter: Option<ResourcePathsInnerIter>,
}

#[derive(Debug)]
enum ResourcePathsInnerIter {
  Walk {
    iter: walkdir::IntoIter,
    /// The key of map when [`ResourcePathsIter::pattern_iter`] is a [`PatternIter::Map`],
    /// used for determining [`Resource::target`]
    current_pattern: Option<PathBuf>,
  },
  Glob {
    iter: glob::Paths,
  },
}

impl Iterator for ResourcePathsInnerIter {
  type Item = crate::Result<PathBuf>;

  fn next(&mut self) -> Option<crate::Result<PathBuf>> {
    match self {
      ResourcePathsInnerIter::Walk { iter, .. } => Some(
        iter
          .next()?
          .map(|entry| entry.into_path())
          .map_err(Into::into),
      ),
      ResourcePathsInnerIter::Glob { iter } => Some(iter.next()?.map_err(Into::into)),
    }
  }
}

impl ResourcePathsIter<'_> {
  fn next_current_iter(&mut self) -> Option<crate::Result<Resource>> {
    let current_iter = self.current_iter.as_mut().unwrap();
    let entry = current_iter.next()?;

    Some(match entry {
      Ok(entry) => {
        // Skip directories
        if entry.is_dir() {
          self.next_current_iter()?
        } else {
          self.resource_from_path(normalize(&entry))
        }
      }
      Err(error)
```
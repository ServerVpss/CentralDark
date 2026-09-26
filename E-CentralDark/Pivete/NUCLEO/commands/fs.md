# COMANDO - fs.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\scope\fs.rs
**SHA:** 52246bc0ac38cd14
**Timestamp:** 2026-08-28T02:35:54.899048
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: P,
- push_pattern(&mut allowed_patterns, path, Pattern::new)?;
- push_pattern(&mut forbidden_patterns, path, Pattern::new)?;
- Pattern::new(&glob::Pattern::escape(p))
- Pattern::new(&format!("{}{append}", glob::Pattern::escape(p)))
- Pattern::new(&format!(
- glob::Pattern::escape(p),
- ($patterns:ident, $pattern:literal) => {
- assert!($patterns.contains(&Pattern::new($pattern).unwrap()))
- push_pattern(&mut patterns, "/path/to/dir/", Pattern::new).expect("failed to push pattern");

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::{
  collections::{HashMap, HashSet},
  fmt,
  path::{Path, PathBuf, MAIN_SEPARATOR},
  sync::{
    atomic::{AtomicBool, AtomicU32, Ordering},
    Arc, Mutex,
  },
};

use tauri_utils::config::FsScope;

use crate::ScopeEventId;

pub use glob::Pattern;

/// Scope change event.
#[derive(Debug, Clone)]
pub enum Event {
  /// A path has been allowed.
  PathAllowed(PathBuf),
  /// A path has been forbidden.
  PathForbidden(PathBuf),
}

type EventListener = Box<dyn Fn(&Event) + Send>;

enum Pending {
  Unlisten(ScopeEventId),
  Listen {
    id: ScopeEventId,
    handler: EventListener,
  },
  Emit(Event),
}

struct ScopeInner {
  allowed_patterns: Mutex<HashSet<Pattern>>,
  forbidden_patterns: Mutex<HashSet<Pattern>>,
  match_options: glob::MatchOptions,
  event_listeners: Mutex<HashMap<ScopeEventId, EventListener>>,
  pending: Mutex<Vec<Pending>>,
  emitting: AtomicBool,
  next_event_id: AtomicU32,
}

/// Scope for filesystem access.
#[derive(Clone)]
pub struct Scope {
  inner: Arc<ScopeInner>,
}

impl Scope {
  fn next_event_id(&self) -> u32 {
    self.inner.next_event_id.fetch_add(1, Ordering::Relaxed)
  }
}

impl fmt::Debug for Scope {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    f.debug_struct("Scope")
      .field(
        "allowed_patterns",
        &self
          .inner
          .allowed_patterns
          .lock()
          .unwrap()
          .iter()
          .map(|p| p.as_str())
          .collect::<Vec<&str>>(),
      )
      .field(
        "forbidden_patterns",
        &self
          .inner
          .forbidden_patterns
          .lock()
          .unwrap()
          .iter()
          .map(|p| p.as_str())
          .collect::<Vec<&str>>(),
      )
      .finish()
  }
}

fn push_pattern<P: AsRef<Path>, F: Fn(&str) -> Result<Pattern, glob::PatternError>>(
  list: &mut HashSet<Pattern>,
  pattern: P,
  f: F,
) -> crate::Result<()> {
  // Reconstruct pattern path components with appropriate separator
  // so `some\path/to/dir/**\*` would be `some/path/to/dir/**/*` on Unix
  // and  `some\path\to\dir\**\*` on Windows.
  let path: PathBuf = pattern.as_ref().components().collect();

  // Add pattern as is to be matched with paths as is
  let path_str = path.to_string_lossy();
  list.insert(f(&path_str)?);

  // On Windows, if path starts with a Prefix, try to strip it if possible
  // so `\\?\C:\\SomeDir` would result in a scope of:
  //   - `\\?\C:\\SomeDir`
  //   - `C:\\SomeDir`
  #[cfg(windows)]
  {
    use std::path::{Component, Prefix};

    let mut components = path.components();

    let is_unc = match components.next() {
      Some(Component::Prefix(p)) => match p.kind() {
        Prefix::VerbatimDisk(..) => true,
        _ => false, // Other kinds of UNC paths
      },
      _ => false, // relative or empty
    };

    if is_unc {
      // we remove UNC manually, instead of `dunce::simplified` because
      // `path` could have `*` in it and that's not allowed on Windows and
      // `dunce::simplified` will check that and return `path` as is without simplification
      let simplified = path
        .to_str()
        .and_then(|s| s.get(4..))
        .map_or(path.as_path(), Path::new);

      let simplified_str = simplified.to_string_lossy();
      if simplified_str != path_str {
        list.insert(f(&simplified_str)?);
      }
    }
  }

  // Add canonicalized version of the pattern or canonicalized version of its parents
  // so `/data/user/0/appid/assets/*` would be canonicalized to `/data/data/appid/assets/*`
  // and can then be matched against any of them.
  if let Some(p) = canonicalize_parent(path) {
    list.insert(f(&p.to_string_lossy())?);
  }

  Ok(())
}

/// Attempt to canonicalize path or its parents in case we have a path like `/data/user/0/appid/**`
/// where `**` obviously does not exist but we need to canonicalize the parent.
///
/// example: given the `/data/user/0/appid/assets/*` path,
/// it's a glob pattern so it won't exist (std::fs::canonicalize() fails);
///
/// the second iteration needs to check `/data/user/0/appid/assets` and save the `*` component to append later.
///
/// if it also does not exist, a third iteration is required to check `/data/user/0/appid`
/// with `assets/*` as the cached value (`checked_path` variable)
/// on Android that gets canonicalized to `/data/data/appid` so the final value will be `/data/data/appid/assets/*`
/// which is the value we want to check when we execute the `Scope::is_allowed` function
fn canonicalize_parent(mut path: PathBuf) -> Option<PathBuf> {
  let mut failed_components = None;

  loop {
    if let Ok(path) = path.canonicalize() {
      break Some(if let Some(p) = failed_components {
        path.join(p)
      } else {
        path
      });
    }

    // grap the last component of the path
    if let Some(mut last) = path.iter().next_back().map(PathBuf:
```
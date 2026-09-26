# MISSAO - authority.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\ipc\authority.rs
**SHA:** 6da0f6200de5d8a4
**Timestamp:** 2026-08-28T02:35:54.245698
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- windows: vec![Pattern::new(window).unwrap()],
- windows: vec![Pattern::new(window).unwrap()],
- webviews: vec![Pattern::new(webview).unwrap()],
- windows: vec![Pattern::new(window).unwrap()],
- windows: vec![Pattern::new(window).unwrap()],
- windows: vec![Pattern::new(window).unwrap()],
- let windows = vec![Pattern::new(window).unwrap()];
- windows: vec![Pattern::new(window).unwrap()],
- windows: vec![Pattern::new(window).unwrap()],
- webviews: vec![Pattern::new(webview).unwrap()],

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::collections::BTreeMap;
use std::fmt::{Debug, Display};
use std::sync::Arc;

use serde::de::DeserializeOwned;

#[cfg(feature = "dynamic-acl")]
use tauri_utils::acl::capability::CapabilityFile;
#[cfg(any(feature = "dynamic-acl", debug_assertions))]
use tauri_utils::acl::manifest::Manifest;
use tauri_utils::acl::{
  resolved::{Resolved, ResolvedCommand, ResolvedScope, ScopeKey},
  ExecutionContext, Value, APP_ACL_KEY,
};

use url::Url;

use crate::{ipc::InvokeError, sealed::ManagerBase, Runtime};
use crate::{AppHandle, Manager, StateManager, Webview};

use super::{CommandArg, CommandItem};

/// The runtime authority used to authorize IPC execution based on the Access Control List.
pub struct RuntimeAuthority {
  #[cfg(any(feature = "dynamic-acl", debug_assertions))]
  acl: BTreeMap<String, Manifest>,
  has_app_acl: bool,
  allowed_commands: BTreeMap<String, Vec<ResolvedCommand>>,
  denied_commands: BTreeMap<String, Vec<ResolvedCommand>>,
  pub(crate) scope_manager: ScopeManager,
}

/// The origin trying to access the IPC.
pub enum Origin {
  /// Local app origin.
  Local,
  /// Remote origin.
  Remote {
    /// Remote URL.
    url: Url,
  },
}

impl Display for Origin {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Local => write!(f, "local"),
      Self::Remote { url } => write!(f, "remote: {url}"),
    }
  }
}

impl Origin {
  fn matches(&self, context: &ExecutionContext) -> bool {
    match (self, context) {
      (Self::Local, ExecutionContext::Local) => true,
      (Self::Remote { url }, ExecutionContext::Remote { url: url_pattern }) => {
        url_pattern.test(url)
      }
      _ => false,
    }
  }
}

/// This is used internally by [`crate::generate_handler!`] for constructing [`RuntimeAuthority`]
/// to only include the raw ACL when it's needed
///
/// ## Stability
///
/// The output of this macro is managed internally by Tauri,
/// and should not be accessed directly on normal applications.
/// It may have breaking changes in the future.
#[cfg(any(feature = "dynamic-acl", debug_assertions))]
#[doc(hidden)]
#[macro_export]
macro_rules! runtime_authority {
  ($acl:expr, $resolved_acl:expr) => {
    $crate::ipc::RuntimeAuthority::new($acl, $resolved_acl)
  };
}

/// This is used internally by [`crate::generate_handler!`] for constructing [`RuntimeAuthority`]
/// to only include the raw ACL when it's needed
///
/// ## Stability
///
/// The output of this macro is managed internally by Tauri,
/// and should not be accessed directly on normal applications.
/// It may have breaking changes in the future.
#[cfg(not(any(feature = "dynamic-acl", debug_assertions)))]
#[doc(hidden)]
#[macro_export]
macro_rules! runtime_authority {
  ($_acl:expr, $resolved_acl:expr) => {
    $crate::ipc::RuntimeAuthority::new($resolved_acl)
  };
}

impl RuntimeAuthority {
  /// Contruct a new [`RuntimeAuthority`] from the ACL
  ///
  /// **Please prefer using the [`runtime_authority`] macro instead of calling this directly**
  #[doc(hidden)]
  pub fn new(
    #[cfg(any(feature = "dynamic-acl", debug_assertions))] acl: BTreeMap<String, Manifest>,
    resolved_acl: Resolved,
  ) -> Self {
    let command_cache = resolved_acl
      .command_scope
      .keys()
      .map(|key| (*key, StateManager::new()))
      .collect();
    Self {
      #[cfg(any(feature = "dynamic-acl", debug_assertions))]
      acl,
      has_app_acl: resolved_acl.has_app_acl,
      allowed_commands: resolved_acl.allowed_commands,
      denied_commands: resolved_acl.denied_commands,
      scope_manager: ScopeManager {
        command_scope: resolved_acl.command_scope,
        global_scope: resolved_acl.global_scope,
        command_cache,
        global_scope_cache: StateManager::new(),
      },
    }
  }

  pub(crate) fn has_app_manifest(&self) -> bool {
    self.has_app_acl
  }

  #[doc(hidden)]
  pub fn __allow_command(&mut self, command: String, context: ExecutionContext) {
    self.allowed_commands.insert(
      command,
      vec![ResolvedCommand {
        context,
        windows: vec!["*".parse().unwrap()],
        ..Default::default()
      }],
    );
  }

  /// Adds the given capability to the runtime authority.
  #[cfg(feature = "dynamic-acl")]
  pub fn add_capability(&mut self, capability: impl super::RuntimeCapability) -> crate::Result<()> {
    self.add_capability_inner(capability.build())
  }

  #[cfg(feature = "dynamic-acl")]
  fn add_capability_inner(&mut self, capability: CapabilityFile) -> crate::Result<()> {
    let mut capabilities = BTreeMap::new();
    match capability {
      CapabilityFile::Capability(c) => {
        capabilities.insert(c.identifier.clone(), c);
      }

      CapabilityFile::List(capabilities_list)
      | CapabilityFile::NamedList {
        capabilities: capabilities_list,
      } => {
        capabilities.extend(

```
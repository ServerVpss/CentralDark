# MISSAO - resolved.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-utils-2.9.3\src\acl\resolved.rs
**SHA:** f90702a2afa50b69
**Timestamp:** 2026-08-28T02:36:00.699660
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- patterns.push(glob::Pattern::new(&pattern)?);

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! Resolved ACL for runtime usage.

use std::{collections::BTreeMap, fmt};

use crate::platform::Target;

use super::{
  capability::{Capability, PermissionEntry},
  has_app_manifest,
  manifest::Manifest,
  Commands, Error, ExecutionContext, Identifier, Permission, PermissionSet, Scopes, Value,
  APP_ACL_KEY,
};

/// A key for a scope, used to link a [`ResolvedCommand#structfield.scope`] to the store [`Resolved#structfield.scopes`].
pub type ScopeKey = u64;

/// Metadata for what referenced a [`ResolvedCommand`].
#[cfg(debug_assertions)]
#[derive(Default, Clone, PartialEq, Eq)]
pub struct ResolvedCommandReference {
  /// Identifier of the capability.
  pub capability: String,
  /// Identifier of the permission.
  pub permission: String,
}

/// A resolved command permission.
#[derive(Default, Clone, PartialEq, Eq)]
pub struct ResolvedCommand {
  /// The execution context of this command.
  pub context: ExecutionContext,
  /// The capability/permission that referenced this command.
  #[cfg(debug_assertions)]
  pub referenced_by: ResolvedCommandReference,
  /// The list of window label patterns that was resolved for this command.
  pub windows: Vec<glob::Pattern>,
  /// The list of webview label patterns that was resolved for this command.
  pub webviews: Vec<glob::Pattern>,
  /// The reference of the scope that is associated with this command. See [`Resolved#structfield.command_scopes`].
  pub scope_id: Option<ScopeKey>,
}

impl fmt::Debug for ResolvedCommand {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    f.debug_struct("ResolvedCommand")
      .field("context", &self.context)
      .field("windows", &self.windows)
      .field("webviews", &self.webviews)
      .field("scope_id", &self.scope_id)
      .finish()
  }
}

/// A resolved scope. Merges all scopes defined for a single command.
#[derive(Debug, Default, Clone)]
pub struct ResolvedScope {
  /// Allows something on the command.
  pub allow: Vec<Value>,
  /// Denies something on the command.
  pub deny: Vec<Value>,
}

/// Resolved access control list.
#[derive(Debug, Default)]
pub struct Resolved {
  /// If we should check the ACL for the app commands
  pub has_app_acl: bool,
  /// The commands that are allowed. Map each command with its context to a [`ResolvedCommand`].
  pub allowed_commands: BTreeMap<String, Vec<ResolvedCommand>>,
  /// The commands that are denied. Map each command with its context to a [`ResolvedCommand`].
  pub denied_commands: BTreeMap<String, Vec<ResolvedCommand>>,
  /// The store of scopes referenced by a [`ResolvedCommand`].
  pub command_scope: BTreeMap<ScopeKey, ResolvedScope>,
  /// The global scope.
  pub global_scope: BTreeMap<String, ResolvedScope>,
}

impl Resolved {
  /// Resolves the ACL for the given plugin permissions and app capabilities.
  pub fn resolve(
    acl: &BTreeMap<String, Manifest>,
    mut capabilities: BTreeMap<String, Capability>,
    target: Target,
  ) -> Result<Self, Error> {
    let mut allowed_commands = BTreeMap::new();
    let mut denied_commands = BTreeMap::new();

    let mut current_scope_id = 0;
    let mut command_scope = BTreeMap::new();
    let mut global_scope: BTreeMap<String, Vec<Scopes>> = BTreeMap::new();

    // resolve commands
    for capability in capabilities.values_mut().filter(|c| c.is_active(&target)) {
      with_resolved_permissions(
        capability,
        acl,
        target,
        |ResolvedPermission {
           key,
           commands,
           scope,
           #[cfg_attr(not(debug_assertions), allow(unused))]
           permission_name,
         }| {
          if commands.allow.is_empty() && commands.deny.is_empty() {
            // global scope
            global_scope.entry(key.to_string()).or_default().push(scope);
          } else {
            let scope_id = if scope.allow.is_some() || scope.deny.is_some() {
              current_scope_id += 1;
              command_scope.insert(
                current_scope_id,
                ResolvedScope {
                  allow: scope.allow.unwrap_or_default(),
                  deny: scope.deny.unwrap_or_default(),
                },
              );
              Some(current_scope_id)
            } else {
              None
            };

            for allowed_command in &commands.allow {
              resolve_command(
                &mut allowed_commands,
                if key == APP_ACL_KEY {
                  allowed_command.to_string()
                } else if let Some(core_plugin_name) = key.strip_prefix("core:") {
                  format!("plugin:{core_plugin_name}|{allowed_command}")
                } else {
                  format!("plugin:{key}|{allowed_command}")
                },
                capability,
                scope_id,
                #[cfg(debug_assertions)]
                permission_name.to_string(),
            
```
# MISSAO - schema.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-utils-2.9.3\src\acl\schema.rs
**SHA:** 4b866969533084b2
**Timestamp:** 2026-08-28T02:36:00.709694
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: once MSRV is high enough, remove generic and use impl <trait>

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! Schema generation for ACL items.

use std::{
  collections::{btree_map::Values, BTreeMap},
  fs,
  path::{Path, PathBuf},
  slice::Iter,
};

use schemars::schema::*;

use super::{Error, PERMISSION_SCHEMAS_FOLDER_NAME};
use crate::{platform::Target, write_if_changed};

use super::{
  capability::CapabilityFile,
  manifest::{Manifest, PermissionFile},
  Permission, PermissionSet, PERMISSION_SCHEMA_FILE_NAME,
};

/// Capability schema file name.
pub const CAPABILITIES_SCHEMA_FILE_NAME: &str = "schema.json";
/// Path of the folder where schemas are saved.
pub const CAPABILITIES_SCHEMA_FOLDER_PATH: &str = "gen/schemas";

// TODO: once MSRV is high enough, remove generic and use impl <trait>
// see https://github.com/tauri-apps/tauri/commit/b5561d74aee431f93c0c5b0fa6784fc0a956effe#diff-7c31d393f83cae149122e74ad44ac98e7d70ffb45c9e5b0a94ec52881b6f1cebR30-R42
/// Permission schema generator trait
pub trait PermissionSchemaGenerator<
  'a,
  Ps: Iterator<Item = &'a PermissionSet>,
  P: Iterator<Item = &'a Permission>,
>
{
  /// Whether has a default permission set or not.
  fn has_default_permission_set(&self) -> bool;

  /// Default permission set description if any.
  fn default_set_description(&self) -> Option<&str>;

  /// Default permission set's permissions if any.
  fn default_set_permissions(&self) -> Option<&Vec<String>>;

  /// Permissions sets to generate schema for.
  fn permission_sets(&'a self) -> Ps;

  /// Permissions to generate schema for.
  fn permissions(&'a self) -> P;

  /// A utility function to generate a schema for a permission identifier
  fn perm_id_schema(name: Option<&str>, id: &str, description: Option<&str>) -> Schema {
    let command_name = match name {
      Some(name) if name == super::APP_ACL_KEY => id.to_string(),
      Some(name) => format!("{name}:{id}"),
      _ => id.to_string(),
    };

    let extensions = if let Some(description) = description {
      [(
        // This is non-standard, and only used by vscode right now,
        // but it does work really well
        "markdownDescription".to_string(),
        serde_json::Value::String(description.to_string()),
      )]
      .into()
    } else {
      Default::default()
    };

    Schema::Object(SchemaObject {
      metadata: Some(Box::new(Metadata {
        description: description.map(ToString::to_string),
        ..Default::default()
      })),
      instance_type: Some(InstanceType::String.into()),
      const_value: Some(serde_json::Value::String(command_name)),
      extensions,
      ..Default::default()
    })
  }

  /// Generate schemas for all possible permissions.
  fn gen_possible_permission_schemas(&'a self, name: Option<&str>) -> Vec<Schema> {
    let mut permission_schemas = Vec::new();

    // schema for default set
    if self.has_default_permission_set() {
      let description = self.default_set_description().unwrap_or_default();
      let description = if let Some(permissions) = self.default_set_permissions() {
        add_permissions_to_description(description, permissions, true)
      } else {
        description.to_string()
      };
      if !description.is_empty() {
        let default = Self::perm_id_schema(name, "default", Some(&description));
        permission_schemas.push(default);
      }
    }

    // schema for each permission set
    for set in self.permission_sets() {
      let description = add_permissions_to_description(&set.description, &set.permissions, false);
      let schema = Self::perm_id_schema(name, &set.identifier, Some(&description));
      permission_schemas.push(schema);
    }

    // schema for each permission
    for perm in self.permissions() {
      let schema = Self::perm_id_schema(name, &perm.identifier, perm.description.as_deref());
      permission_schemas.push(schema);
    }

    permission_schemas
  }
}

fn add_permissions_to_description(
  description: &str,
  permissions: &[String],
  is_default: bool,
) -> String {
  if permissions.is_empty() {
    return description.to_string();
  }
  let permissions_list = permissions
    .iter()
    .map(|permission| format!("- `{permission}`"))
    .collect::<Vec<_>>()
    .join("\n");
  let default_permission_set = if is_default {
    "default permission set"
  } else {
    "permission set"
  };
  format!("{description}\n#### This {default_permission_set} includes:\n\n{permissions_list}")
}

impl<'a>
  PermissionSchemaGenerator<
    'a,
    Values<'a, std::string::String, PermissionSet>,
    Values<'a, std::string::String, Permission>,
  > for Manifest
{
  fn has_default_permission_set(&self) -> bool {
    self.default_permission.is_some()
  }

  fn default_set_description(&self) -> Option<&str> {
    self
      .default_permission
      .as_ref()
      .map(|d| d.description.as_str())
  }

  fn default_set_permissions(&self) -> Option<&Vec<String>> {
    self.default_permission.
```
# MISSAO - build.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\build.rs
**SHA:** 62d1a1e16affe3c9
**Timestamp:** 2026-08-28T02:35:52.191567
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- &PathBuf::from(glob::Pattern::escape(
- &PathBuf::from(glob::Pattern::escape(

### Gaps
- // TODO: Enable this in v3

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use heck::AsShoutySnakeCase;
use tauri_utils::write_if_changed;

use std::{
  collections::BTreeMap,
  env, fs,
  path::{Path, PathBuf},
  sync::{Mutex, OnceLock},
};

static CHECKED_FEATURES: OnceLock<Mutex<Vec<String>>> = OnceLock::new();
const PLUGINS: &[(&str, &[(&str, bool)])] = &[
  // (plugin_name, &[(command, enabled-by_default)])
  // TODO: Enable this in v3
  // ("core:channel", &[("fetch", true)]),
  (
    "core:path",
    &[
      ("resolve_directory", true),
      ("resolve", true),
      ("normalize", true),
      ("join", true),
      ("dirname", true),
      ("extname", true),
      ("basename", true),
      ("is_absolute", true),
    ],
  ),
  (
    "core:event",
    &[
      ("listen", true),
      ("unlisten", true),
      ("emit", true),
      ("emit_to", true),
    ],
  ),
  (
    "core:window",
    &[
      ("create", false),
      // getters
      ("get_all_windows", true),
      ("scale_factor", true),
      ("inner_position", true),
      ("outer_position", true),
      ("inner_size", true),
      ("outer_size", true),
      ("is_fullscreen", true),
      ("is_minimized", true),
      ("is_maximized", true),
      ("is_focused", true),
      ("is_decorated", true),
      ("is_resizable", true),
      ("is_maximizable", true),
      ("is_minimizable", true),
      ("is_closable", true),
      ("is_visible", true),
      ("is_enabled", true),
      ("title", true),
      ("current_monitor", true),
      ("primary_monitor", true),
      ("monitor_from_point", true),
      ("available_monitors", true),
      ("cursor_position", true),
      ("theme", true),
      ("is_always_on_top", true),
      ("activity_name", true),
      ("scene_identifier", true),
      // setters
      ("center", false),
      ("request_user_attention", false),
      ("set_enabled", false),
      ("set_resizable", false),
      ("set_maximizable", false),
      ("set_minimizable", false),
      ("set_closable", false),
      ("set_title", false),
      ("maximize", false),
      ("unmaximize", false),
      ("minimize", false),
      ("unminimize", false),
      ("show", false),
      ("hide", false),
      ("close", false),
      ("destroy", false),
      ("set_decorations", false),
      ("set_shadow", false),
      ("set_effects", false),
      ("set_always_on_top", false),
      ("set_always_on_bottom", false),
      ("set_visible_on_all_workspaces", false),
      ("set_content_protected", false),
      ("set_size", false),
      ("set_min_size", false),
      ("set_size_constraints", false),
      ("set_max_size", false),
      ("set_position", false),
      ("set_fullscreen", false),
      ("set_simple_fullscreen", false),
      ("set_focus", false),
      ("set_focusable", false),
      ("set_skip_taskbar", false),
      ("set_cursor_grab", false),
      ("set_cursor_visible", false),
      ("set_cursor_icon", false),
      ("set_cursor_position", false),
      ("set_ignore_cursor_events", false),
      ("start_dragging", false),
      ("start_resize_dragging", false),
      ("set_progress_bar", false),
      ("set_badge_count", false),
      ("set_overlay_icon", false),
      ("set_badge_label", false),
      ("set_icon", false),
      ("set_title_bar_style", false),
      ("set_theme", false),
      ("toggle_maximize", false),
      ("set_background_color", false),
      // internal
      ("internal_toggle_maximize", true),
    ],
  ),
  (
    "core:webview",
    &[
      ("create_webview", false),
      ("create_webview_window", false),
      // getters
      ("get_all_webviews", true),
      ("webview_position", true),
      ("webview_size", true),
      // setters
      ("webview_close", false),
      ("set_webview_size", false),
      ("set_webview_position", false),
      ("set_webview_focus", false),
      ("set_webview_auto_resize", false),
      ("set_webview_zoom", false),
      ("webview_hide", false),
      ("webview_show", false),
      ("print", false),
      ("reparent", false),
      ("clear_all_browsing_data", false),
      ("set_webview_background_color", false),
      // internal
      ("internal_toggle_devtools", true),
    ],
  ),
  (
    "core:app",
    &[
      ("version", true),
      ("name", true),
      ("tauri_version", true),
      ("identifier", true),
      ("app_show", false),
      ("app_hide", false),
      ("fetch_data_store_identifiers", false),
      ("remove_data_store", false),
      ("default_window_icon", false),
      ("set_app_theme", false),
      ("set_dock_visibility", false),
      ("bundle_type", true),
      ("register_listener", true),
      ("remove_listener", true),
      ("supports_multiple_windows", true),
    ],
  ),
  (
    "core:image",
    &[
      ("new", true),
      ("from_bytes", true),
      ("from_path", true),
      ("rgba", true),
      ("size", true),
    ],
  ),
  ("core:resources", &[("close", tru
```

---

# MISSAO - build.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-utils-2.9.3\src\acl\build.rs
**SHA:** 99f6d911e46129c5
**Timestamp:** 2026-08-28T02:36:00.632816
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: &str,
- pub fn parse_capabilities(pattern: &str) -> Result<BTreeMap<String, Capability>, Error> {
- glob::Pattern::escape(&capabilities_path.to_string_lossy())

### Gaps
- // TODO: remove this before stable
- // TODO: We have way too many duplicated code around getting the config files, e.g.

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

//! ACL items that are only useful inside of build script/codegen context.

use std::{
  collections::{BTreeMap, HashMap},
  env, fs,
  path::{Path, PathBuf},
};

use crate::{
  acl::{has_app_manifest, AllowedCommands, Error},
  config::Config,
  write_if_changed,
};

use super::{
  capability::{Capability, CapabilityFile},
  manifest::PermissionFile,
  ALLOWED_COMMANDS_FILE_NAME, PERMISSION_SCHEMAS_FOLDER_NAME, PERMISSION_SCHEMA_FILE_NAME,
  REMOVE_UNUSED_COMMANDS_ENV_VAR,
};

/// Known name of the folder containing autogenerated permissions.
pub const AUTOGENERATED_FOLDER_NAME: &str = "autogenerated";

/// Cargo cfg key for permissions file paths
pub const PERMISSION_FILES_PATH_KEY: &str = "PERMISSION_FILES_PATH";

/// Cargo cfg key for global scope schemas
pub const GLOBAL_SCOPE_SCHEMA_PATH_KEY: &str = "GLOBAL_SCOPE_SCHEMA_PATH";

/// Allowed permission file extensions
pub const PERMISSION_FILE_EXTENSIONS: &[&str] = &["json", "toml"];

/// Known filename of the permission documentation file
pub const PERMISSION_DOCS_FILE_NAME: &str = "reference.md";

/// Allowed capability file extensions
const CAPABILITY_FILE_EXTENSIONS: &[&str] = &[
  "json",
  #[cfg(feature = "config-json5")]
  "json5",
  "toml",
];

/// Known folder name of the capability schemas
const CAPABILITIES_SCHEMA_FOLDER_NAME: &str = "schemas";

const CORE_PLUGIN_PERMISSIONS_TOKEN: &str = "__CORE_PLUGIN__";

fn parse_permissions(paths: Vec<PathBuf>) -> Result<Vec<PermissionFile>, Error> {
  let mut permissions = Vec::new();
  for path in paths {
    let ext = path.extension().unwrap().to_string_lossy().to_string();
    let permission_file = fs::read_to_string(&path).map_err(|e| Error::ReadFile(e, path))?;
    let permission: PermissionFile = match ext.as_str() {
      "toml" => toml::from_str(&permission_file)?,
      "json" => serde_json::from_str(&permission_file)?,
      _ => return Err(Error::UnknownPermissionFormat(ext)),
    };
    permissions.push(permission);
  }
  Ok(permissions)
}

/// Write the permissions to a temporary directory and pass it to the immediate consuming crate.
pub fn define_permissions<F: Fn(&Path) -> bool>(
  pattern: &str,
  pkg_name: &str,
  out_dir: &Path,
  filter_fn: F,
) -> Result<Vec<PermissionFile>, Error> {
  let permission_files = glob::glob(pattern)?
    .flatten()
    .flat_map(|p| p.canonicalize())
    // filter extension
    .filter(|p| {
      p.extension()
        .and_then(|e| e.to_str())
        .map(|e| PERMISSION_FILE_EXTENSIONS.contains(&e))
        .unwrap_or_default()
    })
    .filter(|p| filter_fn(p))
    // filter schemas
    .filter(|p| p.parent().unwrap().file_name().unwrap() != PERMISSION_SCHEMAS_FOLDER_NAME)
    .collect::<Vec<PathBuf>>();

  let pkg_name_valid_path = pkg_name.replace(':', "-");
  let permission_files_path = out_dir.join(format!("{pkg_name_valid_path}-permission-files"));
  let permission_files_json = serde_json::to_string(&permission_files)?;

  write_if_changed(&permission_files_path, permission_files_json)
    .map_err(|e| Error::WriteFile(e, permission_files_path.clone()))?;

  if let Some(plugin_name) = pkg_name.strip_prefix("tauri:") {
    println!(
      "cargo:{plugin_name}{CORE_PLUGIN_PERMISSIONS_TOKEN}_{PERMISSION_FILES_PATH_KEY}={}",
      permission_files_path.display()
    );
  } else {
    println!(
      "cargo:{PERMISSION_FILES_PATH_KEY}={}",
      permission_files_path.display()
    );
  }

  parse_permissions(permission_files)
}

/// Read all permissions listed from the defined cargo cfg key value.
pub fn read_permissions() -> Result<HashMap<String, Vec<PermissionFile>>, Error> {
  let mut permissions_map = HashMap::new();

  for (key, value) in env::vars_os() {
    let key = key.to_string_lossy();

    if let Some(plugin_crate_name_var) = key
      .strip_prefix("DEP_")
      .and_then(|v| v.strip_suffix(&format!("_{PERMISSION_FILES_PATH_KEY}")))
      .map(|v| {
        v.strip_suffix(CORE_PLUGIN_PERMISSIONS_TOKEN)
          .and_then(|v| v.strip_prefix("TAURI_"))
          .unwrap_or(v)
      })
    {
      let permissions_path = PathBuf::from(value);
      let permissions_str =
        fs::read_to_string(&permissions_path).map_err(|e| Error::ReadFile(e, permissions_path))?;
      let permissions: Vec<PathBuf> = serde_json::from_str(&permissions_str)?;
      let permissions = parse_permissions(permissions)?;

      let plugin_crate_name = plugin_crate_name_var.to_lowercase().replace('_', "-");
      let plugin_crate_name = plugin_crate_name
        .strip_prefix("tauri-plugin-")
        .map(ToString::to_string)
        .unwrap_or(plugin_crate_name);

      permissions_map.insert(plugin_crate_name, permissions);
    }
  }

  Ok(permissions_map)
}

/// Define the global scope schema JSON file path if it exists and pass it to the immediate consuming crate.
pub fn define_global_scope_schema(
  schema: schemars:
```
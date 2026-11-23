// Hermes Setup — process entrypoint. All logic lives in lib.rs so it can
// be unit-tested as a library; this file just calls into it.
//
// The windows_subsystem attribute MUST live here on the binary crate
// (not lib.rs) — placing it on the lib was the bug that left a stray
// cmd window behind Hermes-Setup.exe on release builds.
//
// `windows_subsystem = "windows"` strips the console allocation that
// the default `windows_subsystem = "console"` would do, so double-clicking
// the .exe gives you ONLY the Tauri window.
//
// On Windows, both Debug and Release must be GUI-only: no extra console
// window when the CentralDark-OS installer opens. Logging remains on disk.

#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]

fn main() {
    hermes_bootstrap_lib::run()
}

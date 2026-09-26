# COMANDO - find_tools.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\find-msvc-tools-0.1.10\src\find_tools.rs
**SHA:** b06efb1eed063c43
**Timestamp:** 2026-08-28T02:34:07.732479
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Replace with a OnceLock once MSRV is 1.70.

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2015 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// https://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or https://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

//! An internal use crate to looking for windows-specific tools:
//! 1. On Windows host, probe the Windows Registry if needed;
//! 2. On non-Windows host, check specified environment variables.

#![allow(clippy::upper_case_acronyms)]

use std::{
    env,
    ffi::{OsStr, OsString},
    ops::Deref,
    path::{Path, PathBuf},
    process::Command,
    sync::Arc,
};

use crate::Tool;

/// The target provided by the user.
#[derive(Copy, Clone, PartialEq, Eq)]
enum TargetArch {
    X86,
    X64,
    Arm,
    Arm64,
    Arm64ec,
}
impl TargetArch {
    /// Parse the `TargetArch` from a str. Returns `None` if the arch is unrecognized.
    fn new(arch: &str) -> Option<Self> {
        // NOTE: Keep up to date with docs in [`find`].
        match arch {
            "x64" | "x86_64" => Some(Self::X64),
            "arm64" | "aarch64" => Some(Self::Arm64),
            "arm64ec" => Some(Self::Arm64ec),
            "x86" | "i686" | "i586" => Some(Self::X86),
            "arm" | "thumbv7a" => Some(Self::Arm),
            _ => None,
        }
    }

    #[cfg(windows)]
    /// Gets the Visual Studio name for the architecture.
    fn as_vs_arch(&self) -> &'static str {
        match self {
            Self::X64 => "x64",
            Self::Arm64 | Self::Arm64ec => "arm64",
            Self::X86 => "x86",
            Self::Arm => "arm",
        }
    }
}

#[derive(Debug, Clone)]
#[non_exhaustive]
pub enum Env {
    Owned(OsString),
    Arced(Arc<OsStr>),
}

impl AsRef<OsStr> for Env {
    fn as_ref(&self) -> &OsStr {
        self.deref()
    }
}

impl Deref for Env {
    type Target = OsStr;

    fn deref(&self) -> &Self::Target {
        match self {
            Env::Owned(os_str) => os_str,
            Env::Arced(os_str) => os_str,
        }
    }
}

impl From<Env> for PathBuf {
    fn from(env: Env) -> Self {
        match env {
            Env::Owned(os_str) => PathBuf::from(os_str),
            Env::Arced(os_str) => PathBuf::from(os_str.deref()),
        }
    }
}

pub trait EnvGetter {
    fn get_env(&self, name: &'static str) -> Option<Env>;
}

struct StdEnvGetter;

impl EnvGetter for StdEnvGetter {
    #[allow(clippy::disallowed_methods)]
    fn get_env(&self, name: &'static str) -> Option<Env> {
        env::var_os(name).map(Env::Owned)
    }
}

/// Attempts to find a tool within an MSVC installation using the Windows
/// registry as a point to search from.
///
/// The `arch_or_target` argument is the architecture or the Rust target name
/// that the tool should work for (e.g. compile or link for). The supported
/// architecture names are:
/// - `"x64"` or `"x86_64"`
/// - `"arm64"` or `"aarch64"`
/// - `"arm64ec"`
/// - `"x86"`, `"i586"` or `"i686"`
/// - `"arm"` or `"thumbv7a"`
///
/// The `tool` argument is the tool to find. Supported tools include:
/// - MSVC tools: `cl.exe`, `link.exe`, `lib.exe`, etc.
/// - `MSBuild`: `msbuild.exe`
/// - Visual Studio IDE: `devenv.exe`
/// - Clang/LLVM tools: `clang.exe`, `clang++.exe`, `clang-*.exe`, `llvm-*.exe`, `lld.exe`, etc.
///
/// This function will return `None` if the tool could not be found, or it will
/// return `Some(cmd)` which represents a command that's ready to execute the
/// tool with the appropriate environment variables set.
///
/// To find MSVC tools, this function will first attempt to detect if we are
/// running in the context of a developer command prompt, and then use the tools
/// as found in the current `PATH`. If that fails, it will attempt to locate
/// the newest MSVC toolset in the newest installed version of Visual Studio.
/// To limit the search to a specific version of the MSVC toolset, set the
/// VCToolsVersion environment variable to the desired version (e.g. "14.44.35207").
///
/// Note that this function always returns `None` for non-MSVC targets (if a
/// full target name was specified).
pub fn find(arch_or_target: &str, tool: &str) -> Option<Command> {
    find_tool(arch_or_target, tool).map(|c| c.to_command())
}

/// Similar to the `find` function above, this function will attempt the same
/// operation (finding a MSVC tool in a local install) but instead returns a
/// `Tool` which may be introspected.
pub fn find_tool(arch_or_target: &str, tool: &str) -> Option<Tool> {
    let full_arch = if let Some((full_arch, rest)) = arch_or_target.split_once("-") {
        // The logic is all tailored for MSVC, if the target is not that then
        // bail out early.
        if !rest.contains("msvc") {
            return None;
        }
        full_arch
    } else {
        arch_or_t
```
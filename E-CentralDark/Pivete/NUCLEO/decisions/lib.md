# DECISAO - lib.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\camino-1.2.5\src\lib.rs
**SHA:** 03610e64acb0c25d
**Timestamp:** 2026-08-28T02:33:12.124419
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // invariant: Path must be guaranteed to be utf-8 data
- // invariant: OsStr must be guaranteed to be utf8 data

### Principios
- // invariant: Path must be guaranteed to be utf-8 data
- // invariant: OsStr must be guaranteed to be utf8 data

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright (c) The camino Contributors
// SPDX-License-Identifier: MIT OR Apache-2.0

#![warn(missing_docs)]
#![cfg_attr(doc_cfg, feature(doc_cfg))]

//! UTF-8 encoded paths.
//!
//! `camino` is an extension of the [`std::path`] module that adds new [`Utf8PathBuf`] and [`Utf8Path`]
//! types. These are like the standard library's [`PathBuf`] and [`Path`] types, except they are
//! guaranteed to only contain UTF-8 encoded data. Therefore, they expose the ability to get their
//! contents as strings, they implement [`Display`], etc.
//!
//! The [`std::path`] types are not guaranteed to be valid UTF-8. This is the right decision for the standard library,
//! since it must be as general as possible. However, on all platforms, non-Unicode paths are vanishingly uncommon for a
//! number of reasons:
//! * Unicode won. There are still some legacy codebases that store paths in encodings like Shift-JIS, but most
//!   have been converted to Unicode at this point.
//! * Unicode is the common subset of supported paths across Windows and Unix platforms. (On Windows, Rust stores paths
//!   as [an extension to UTF-8](https://simonsapin.github.io/wtf-8/), and converts them to UTF-16 at Win32
//!   API boundaries.)
//! * There are already many systems, such as Cargo, that only support UTF-8 paths. If your own tool interacts with any such
//!   system, you can assume that paths are valid UTF-8 without creating any additional burdens on consumers.
//! * The ["makefile problem"](https://www.mercurial-scm.org/wiki/EncodingStrategy#The_.22makefile_problem.22)
//!   (which also applies to `Cargo.toml`, and any other metadata file that lists the names of other files) has *no general,
//!   cross-platform solution* in systems that support non-UTF-8 paths. However, restricting paths to UTF-8 eliminates
//!   this problem.
//!
//! Therefore, many programs that want to manipulate paths *do* assume they contain UTF-8 data, and convert them to [`str`]s
//! as  necessary. However, because this invariant is not encoded in the [`Path`] type, conversions such as
//! `path.to_str().unwrap()` need to be repeated again and again, creating a frustrating experience.
//!
//! Instead, `camino` allows you to check that your paths are UTF-8 *once*, and then manipulate them
//! as valid UTF-8 from there on, avoiding repeated lossy and confusing conversions.

// General note: we use #[allow(clippy::incompatible_msrv)] for code that's already guarded by a
// version-specific cfg conditional.

use std::{
    borrow::{Borrow, Cow},
    cmp::Ordering,
    convert::{Infallible, TryFrom, TryInto},
    error,
    ffi::{OsStr, OsString},
    fmt,
    fs::{self, Metadata},
    hash::{Hash, Hasher},
    io,
    iter::FusedIterator,
    ops::Deref,
    path::*,
    rc::Rc,
    str::FromStr,
    sync::Arc,
};

#[cfg(feature = "proptest1")]
mod proptest_impls;
#[cfg(feature = "serde1")]
mod serde_impls;
#[cfg(test)]
mod tests;

/// An owned, mutable UTF-8 path (akin to [`String`]).
///
/// This type provides methods like [`push`] and [`set_extension`] that mutate
/// the path in place. It also implements [`Deref`] to [`Utf8Path`], meaning that
/// all methods on [`Utf8Path`] slices are available on [`Utf8PathBuf`] values as well.
///
/// [`push`]: Utf8PathBuf::push
/// [`set_extension`]: Utf8PathBuf::set_extension
///
/// # Examples
///
/// You can use [`push`] to build up a [`Utf8PathBuf`] from
/// components:
///
/// ```
/// use camino::Utf8PathBuf;
///
/// let mut path = Utf8PathBuf::new();
///
/// path.push(r"C:\");
/// path.push("windows");
/// path.push("system32");
///
/// path.set_extension("dll");
/// ```
///
/// However, [`push`] is best used for dynamic situations. This is a better way
/// to do this when you know all of the components ahead of time:
///
/// ```
/// use camino::Utf8PathBuf;
///
/// let path: Utf8PathBuf = [r"C:\", "windows", "system32.dll"].iter().collect();
/// ```
///
/// We can still do better than this! Since these are all strings, we can use
/// [`From::from`]:
///
/// ```
/// use camino::Utf8PathBuf;
///
/// let path = Utf8PathBuf::from(r"C:\windows\system32.dll");
/// ```
///
/// Which method works best depends on what kind of situation you're in.
// NB: Internal PathBuf must only contain utf8 data
#[derive(Clone, Default)]
#[repr(transparent)]
pub struct Utf8PathBuf(PathBuf);

impl Utf8PathBuf {
    /// Allocates an empty [`Utf8PathBuf`].
    ///
    /// *On Rust 1.91 or newer, this is a `const fn`.*
    ///
    /// # Examples
    ///
    /// ```
    /// use camino::Utf8PathBuf;
    ///
    /// let path = Utf8PathBuf::new();
    /// ```
    #[must_use]
    #[cfg(pathbuf_const_new)]
    #[expect(clippy::incompatible_msrv)]
    pub const fn new() -> Utf8PathBuf {
        Utf8PathBuf(PathBuf::new())
    }

    /// Allocates an empty [`Utf8PathBuf`].
    ///
    /// # Examples
    ///
    /// ```
    /// use camino::Utf8PathBuf;
    ///
    /// let path = Utf8PathBuf::new();
    /// ```
    #[must_use]
    #[cfg(not(pathbuf_const
```

---

# DECISAO - lib.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\rustc_version-0.4.1\src\lib.rs
**SHA:** 6d0dbf7bd12ba712
**Timestamp:** 2026-08-28T02:35:09.191526
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: expose micro version here

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2016 rustc-version-rs developers
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#![warn(missing_docs)]

//! Simple library for getting the version information of a `rustc`
//! compiler.
//!
//! This can be used by build scripts or other tools dealing with Rust sources
//! to make decisions based on the version of the compiler.
//!
//! It calls `$RUSTC --version -v` and parses the output, falling
//! back to `rustc` if `$RUSTC` is not set.
//!
//! # Example
//!
//! ```rust
//! // This could be a cargo build script
//!
//! use rustc_version::{version, version_meta, Channel, Version};
//!
//! // Assert we haven't travelled back in time
//! assert!(version().unwrap().major >= 1);
//!
//! // Set cfg flags depending on release channel
//! match version_meta().unwrap().channel {
//!     Channel::Stable => {
//!         println!("cargo:rustc-cfg=RUSTC_IS_STABLE");
//!     }
//!     Channel::Beta => {
//!         println!("cargo:rustc-cfg=RUSTC_IS_BETA");
//!     }
//!     Channel::Nightly => {
//!         println!("cargo:rustc-cfg=RUSTC_IS_NIGHTLY");
//!     }
//!     Channel::Dev => {
//!         println!("cargo:rustc-cfg=RUSTC_IS_DEV");
//!     }
//! }
//!
//! // Check for a minimum version
//! if version().unwrap() >= Version::parse("1.4.0").unwrap() {
//!     println!("cargo:rustc-cfg=compiler_has_important_bugfix");
//! }
//! ```

#[cfg(test)]
#[macro_use]
extern crate doc_comment;

#[cfg(test)]
doctest!("../README.md");

use std::collections::HashMap;
use std::process::Command;
use std::{env, error, fmt, io, num, str};
use std::{ffi::OsString, str::FromStr};

// Convenience re-export to allow version comparison without needing to add
// semver crate.
pub use semver::Version;

use Error::*;

/// Release channel of the compiler.
#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash, Debug)]
pub enum Channel {
    /// Development release channel
    Dev,
    /// Nightly release channel
    Nightly,
    /// Beta release channel
    Beta,
    /// Stable release channel
    Stable,
}

/// LLVM version
///
/// LLVM's version numbering scheme is not semver compatible until version 4.0
///
/// rustc [just prints the major and minor versions], so other parts of the version are not included.
///
/// [just prints the major and minor versions]: https://github.com/rust-lang/rust/blob/b5c9e2448c9ace53ad5c11585803894651b18b0a/compiler/rustc_codegen_llvm/src/llvm_util.rs#L173-L178
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct LlvmVersion {
    // fields must be ordered major, minor for comparison to be correct
    /// Major version
    pub major: u64,
    /// Minor version
    pub minor: u64,
    // TODO: expose micro version here
}

impl fmt::Display for LlvmVersion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}.{}", self.major, self.minor)
    }
}

impl FromStr for LlvmVersion {
    type Err = LlvmVersionParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let mut parts = s
            .split('.')
            .map(|part| -> Result<u64, LlvmVersionParseError> {
                if part == "0" {
                    Ok(0)
                } else if part.starts_with('0') {
                    Err(LlvmVersionParseError::ComponentMustNotHaveLeadingZeros)
                } else if part.starts_with('-') || part.starts_with('+') {
                    Err(LlvmVersionParseError::ComponentMustNotHaveSign)
                } else {
                    Ok(part.parse()?)
                }
            });

        let major = parts.next().unwrap()?;
        let mut minor = 0;

        if let Some(part) = parts.next() {
            minor = part?;
        } else if major < 4 {
            // LLVM versions earlier than 4.0 have significant minor versions, so require the minor version in this case.
            return Err(LlvmVersionParseError::MinorVersionRequiredBefore4);
        }

        if let Some(Err(e)) = parts.next() {
            return Err(e);
        }

        if parts.next().is_some() {
            return Err(LlvmVersionParseError::TooManyComponents);
        }

        Ok(Self { major, minor })
    }
}

/// Rustc version plus metadata like git short hash and build date.
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct VersionMeta {
    /// Version of the compiler
    pub semver: Version,

    /// Git short hash of the build of the compiler
    pub commit_hash: Option<String>,

    /// Commit date of the compiler
    pub commit_date: Option<String>,

    /// Build date of the compiler; this was removed between Rust 1.0.0 and 1.1.0.
    pub build_date: Option<String>,

    /// Release channel of the compiler
    pub channel: Channel,

    /// Host targe
```
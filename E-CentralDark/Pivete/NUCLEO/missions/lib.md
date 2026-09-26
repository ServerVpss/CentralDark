# MISSAO - lib.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\glob-0.3.4\src\lib.rs
**SHA:** b51782b436dc3f69
**Timestamp:** 2026-08-28T02:34:11.994982
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = start.to_ascii_lowercase();

### Padroes
- pub fn glob(pattern: &str) -> Result<Paths, PatternError> {
- /// `Pattern::new(..)`.  The options given are passed through unchanged to
- /// `Pattern::matches_with(..)` with the exception that
- pub fn glob_with(pattern: &str, options: MatchOptions) -> Result<Paths, PatternError> {
- let _ = Pattern::new(pattern)?;
- let normalized_pattern = Path::new(pattern).iter().collect::<PathBuf>();
- dir_patterns.push(Pattern::new(component)?);
- pub fn new(pattern: &str) -> Result<Self, PatternError> {
- /// assert!(Pattern::new("c?t").unwrap().matches("cat"));
- /// assert!(Pattern::new("k[!e]tteh").unwrap().matches("kitteh"));

### Contratos
- "broken invariant: pattern has metachars but shouldn't"

### Principios
- "broken invariant: pattern has metachars but shouldn't"

### Gaps
- todo: Vec<Result<(PathWrapper, usize), GlobError>>,
- todo: Vec::new(),
- let todo = Vec::new();
- todo: &mut Vec<Result<(PathWrapper, usize), GlobError>>,
- let add = |todo: &mut Vec<_>, next_path: PathWrapper| {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

//! Support for matching file paths against Unix shell style patterns.
//!
//! The `glob` and `glob_with` functions allow querying the filesystem for all
//! files that match a particular pattern (similar to the libc `glob` function).
//! The methods on the `Pattern` type provide functionality for checking if
//! individual paths match a particular pattern (similar to the libc `fnmatch`
//! function).
//!
//! For consistency across platforms, and for Windows support, this module
//! is implemented entirely in Rust rather than deferring to the libc
//! `glob`/`fnmatch` functions.
//!
//! # Examples
//!
//! To print all jpg files in `/media/` and all of its subdirectories.
//!
//! ```rust,no_run
//! use glob::glob;
//!
//! for entry in glob("/media/**/*.jpg").expect("Failed to read glob pattern") {
//!     match entry {
//!         Ok(path) => println!("{:?}", path.display()),
//!         Err(e) => println!("{:?}", e),
//!     }
//! }
//! ```
//!
//! To print all files containing the letter "a", case insensitive, in a `local`
//! directory relative to the current working directory. This ignores errors
//! instead of printing them.
//!
//! ```rust,no_run
//! use glob::glob_with;
//! use glob::MatchOptions;
//!
//! let options = MatchOptions {
//!     case_sensitive: false,
//!     require_literal_separator: false,
//!     require_literal_leading_dot: false,
//! };
//! for entry in glob_with("local/*a*", options).unwrap() {
//!     if let Ok(path) = entry {
//!         println!("{:?}", path.display())
//!     }
//! }
//! ```

#![doc(
    html_logo_url = "https://www.rust-lang.org/logos/rust-logo-128x128-blk-v2.png",
    html_favicon_url = "https://www.rust-lang.org/favicon.ico",
    html_root_url = "https://docs.rs/glob/0.3.1"
)]
#![deny(missing_docs)]
#![allow(clippy::while_let_loop)]

#[cfg(test)]
doc_comment::doctest!("../README.md");

use std::cmp;
use std::cmp::Ordering;
use std::error::Error;
use std::ffi::OsString;
use std::fmt;
use std::fs;
use std::fs::DirEntry;
use std::io;
use std::ops::Deref;
use std::path::{self, Component, Path, PathBuf};
use std::str::FromStr;

use CharSpecifier::{CharRange, SingleChar};
use MatchResult::{EntirePatternDoesntMatch, Match, SubPatternDoesntMatch};
use PatternToken::AnyExcept;
use PatternToken::{AnyChar, AnyRecursiveSequence, AnySequence, AnyWithin, Char};

/// An iterator that yields `Path`s from the filesystem that match a particular
/// pattern.
///
/// Note that it yields `GlobResult` in order to report any `IoErrors` that may
/// arise during iteration. If a directory matches but is unreadable,
/// thereby preventing its contents from being checked for matches, a
/// `GlobError` is returned to express this.
///
/// See the `glob` function for more details.
#[derive(Debug)]
pub struct Paths {
    dir_patterns: Vec<Pattern>,
    require_dir: bool,
    options: MatchOptions,
    todo: Vec<Result<(PathWrapper, usize), GlobError>>,
    scope: Option<PathWrapper>,
}

/// Return an iterator that produces all the `Path`s that match the given
/// pattern using default match options, which may be absolute or relative to
/// the current working directory.
///
/// This may return an error if the pattern is invalid.
///
/// This method uses the default match options and is equivalent to calling
/// `glob_with(pattern, MatchOptions::new())`. Use `glob_with` directly if you
/// want to use non-default match options.
///
/// When iterating, each result is a `GlobResult` which expresses the
/// possibility that there was an `IoError` when attempting to read the contents
/// of the matched path.  In other words, each item returned by the iterator
/// will either be an `Ok(Path)` if the path matched, or an `Err(GlobError)` if
/// the path (partially) matched _but_ its contents could not be read in order
/// to determine if its contents matched.
///
/// See the `Paths` documentation for more information.
///
/// # Examples
///
/// Consider a directory `/media/pictures` containing only the files
/// `kittens.jpg`, `puppies.jpg` and `hamsters.gif`:
///
/// ```rust,no_run
/// use glob::glob;
///
/// for entry in glob("/media/pictures/*.jpg").unwrap() {
///     match entry {
///         Ok(path) => println!("{:?}", path.display()),
///
///         // if the path matched but was unreadable,
///         // thereby preventing its contents from matching
///         Err(e) => println!("{:?}", e),
///     }
/// }
/// ```
///
/// The above code will print:
///
/// ```ignore
/// /media/pictures/kittens.jpg
/// /media/pictures/puppies.j
```

---

# MISSAO - lib.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\utf8_iter-1.0.4\src\lib.rs
**SHA:** 5ac63cc86ea5ff25
**Timestamp:** 2026-08-28T02:36:34.272660
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn in_inclusive_range8(i: u8, start: u8, end: u8) -> bool {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright Mozilla Foundation
//
// Licensed under the Apache License (Version 2.0), or the MIT license,
// (the "Licenses") at your option. You may not use this file except in
// compliance with one of the Licenses. You may obtain copies of the
// Licenses at:
//
//    https://www.apache.org/licenses/LICENSE-2.0
//    https://opensource.org/licenses/MIT
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the Licenses is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the Licenses for the specific language governing permissions and
// limitations under the Licenses.

#![no_std]

//! Provides iteration by `char` over `&[u8]` containing potentially-invalid
//! UTF-8 such that errors are handled according to the [WHATWG Encoding
//! Standard](https://encoding.spec.whatwg.org/#utf-8-decoder) (i.e. the same
//! way as in `String::from_utf8_lossy`).
//!
//! The trait `Utf8CharsEx` provides the convenience method `chars()` on
//! byte slices themselves instead of having to use the more verbose
//! `Utf8Chars::new(slice)`.
//!
//! ```rust
//! use utf8_iter::Utf8CharsEx;
//! let data = b"\xFF\xC2\xE2\xE2\x98\xF0\xF0\x9F\xF0\x9F\x92\xE2\x98\x83";
//! let from_iter: String = data.chars().collect();
//! let from_std = String::from_utf8_lossy(data);
//! assert_eq!(from_iter, from_std);
//! ```

mod indices;
mod report;

pub use crate::indices::Utf8CharIndices;
pub use crate::report::ErrorReportingUtf8Chars;
pub use crate::report::Utf8CharsError;
use core::iter::FusedIterator;

#[repr(align(64))] // Align to cache lines
struct Utf8Data {
    pub table: [u8; 384],
}

// This is generated code copied and pasted from utf_8.rs of encoding_rs.
// Please don't edit by hand but instead regenerate as instructed in that
// file.

static UTF8_DATA: Utf8Data = Utf8Data {
    table: [
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 148, 148, 148,
        148, 148, 148, 148, 148, 148, 148, 148, 148, 148, 148, 148, 148, 164, 164, 164, 164, 164,
        164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164, 164,
        164, 164, 164, 164, 164, 164, 164, 164, 164, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252, 252,
        252, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        4, 4, 4, 4, 4, 4, 4, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
        8, 8, 8, 8, 8, 8, 8, 16, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 32, 8, 8, 64, 8, 8, 8, 128, 4,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    ],
};

// End manually copypasted generated code.

#[inline(always)]
fn in_inclusive_range8(i: u8, start: u8, end: u8) -> bool {
    i.wrapping_sub(start) <= (end - start)
}

/// Iterator by `char` over `&[u8]` that contains
/// potentially-invalid UTF-8. See the crate documentation.
#[derive(Debug, Clone)]
pub struct Utf8Chars<'a> {
    remaining: &'a [u8],
}

impl<'a> Utf8Chars<'a> {
    #[inline(always)]
    /// Creates the iterator from a byte slice.
    pub fn new(bytes: &'a [u8]) -> Self {
        Utf8Chars::<'a> { remaining: bytes }
    }

    /// Views the current remaining data in the iterator as a subslice
    /// of the original slice.
    #[inline(always)]
    pub fn as_slice(&self) -> &'a [u8] {
        self.remaining
    }

    #[inline(never)]
    fn next_fallback(&mut self) -> Option<char> {
        if self.remaining.is_empty() {
            return None;
        }
        let first = self.remaining[0];
        if first < 0x80 {
            self.remaining = &self.remaining[1..];
            return Some(char::from(first));
        }
        if !in_inclusive_range8(first, 0xC2, 0xF4) || self.remaining.len() == 1 {
            self.remaining = &self.remaining[1..];
            return Some('\u{FFFD}');
        }
        let second = self.remaining[1];
     
```

---

# MISSAO - lib.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\walkdir-2.5.0\src\lib.rs
**SHA:** 3f7d673f9e278a71
**Timestamp:** 2026-08-28T02:36:39.604612
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Some(self.root),
- start: Option<PathBuf>,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Crate `walkdir` provides an efficient and cross platform implementation
of recursive directory traversal. Several options are exposed to control
iteration, such as whether to follow symbolic links (default off), limit the
maximum number of simultaneous open file descriptors and the ability to
efficiently skip descending into directories.

To use this crate, add `walkdir` as a dependency to your project's
`Cargo.toml`:

```toml
[dependencies]
walkdir = "2"
```

# From the top

The [`WalkDir`] type builds iterators. The [`DirEntry`] type describes values
yielded by the iterator. Finally, the [`Error`] type is a small wrapper around
[`std::io::Error`] with additional information, such as if a loop was detected
while following symbolic links (not enabled by default).

[`WalkDir`]: struct.WalkDir.html
[`DirEntry`]: struct.DirEntry.html
[`Error`]: struct.Error.html
[`std::io::Error`]: https://doc.rust-lang.org/stable/std/io/struct.Error.html

# Example

The following code recursively iterates over the directory given and prints
the path for each entry:

```no_run
use walkdir::WalkDir;
# use walkdir::Error;

# fn try_main() -> Result<(), Error> {
for entry in WalkDir::new("foo") {
    println!("{}", entry?.path().display());
}
# Ok(())
# }
```

Or, if you'd like to iterate over all entries and ignore any errors that
may arise, use [`filter_map`]. (e.g., This code below will silently skip
directories that the owner of the running process does not have permission to
access.)

```no_run
use walkdir::WalkDir;

for entry in WalkDir::new("foo").into_iter().filter_map(|e| e.ok()) {
    println!("{}", entry.path().display());
}
```

[`filter_map`]: https://doc.rust-lang.org/stable/std/iter/trait.Iterator.html#method.filter_map

# Example: follow symbolic links

The same code as above, except [`follow_links`] is enabled:

```no_run
use walkdir::WalkDir;
# use walkdir::Error;

# fn try_main() -> Result<(), Error> {
for entry in WalkDir::new("foo").follow_links(true) {
    println!("{}", entry?.path().display());
}
# Ok(())
# }
```

[`follow_links`]: struct.WalkDir.html#method.follow_links

# Example: skip hidden files and directories on unix

This uses the [`filter_entry`] iterator adapter to avoid yielding hidden files
and directories efficiently (i.e. without recursing into hidden directories):

```no_run
use walkdir::{DirEntry, WalkDir};
# use walkdir::Error;

fn is_hidden(entry: &DirEntry) -> bool {
    entry.file_name()
         .to_str()
         .map(|s| s.starts_with("."))
         .unwrap_or(false)
}

# fn try_main() -> Result<(), Error> {
let walker = WalkDir::new("foo").into_iter();
for entry in walker.filter_entry(|e| !is_hidden(e)) {
    println!("{}", entry?.path().display());
}
# Ok(())
# }
```

[`filter_entry`]: struct.IntoIter.html#method.filter_entry
*/

#![deny(missing_docs)]
#![allow(unknown_lints)]

#[cfg(doctest)]
doc_comment::doctest!("../README.md");

use std::cmp::{min, Ordering};
use std::fmt;
use std::fs::{self, ReadDir};
use std::io;
use std::iter;
use std::path::{Path, PathBuf};
use std::result;
use std::vec;

use same_file::Handle;

pub use crate::dent::DirEntry;
#[cfg(unix)]
pub use crate::dent::DirEntryExt;
pub use crate::error::Error;

mod dent;
mod error;
#[cfg(test)]
mod tests;
mod util;

/// Like try, but for iterators that return [`Option<Result<_, _>>`].
///
/// [`Option<Result<_, _>>`]: https://doc.rust-lang.org/stable/std/option/enum.Option.html
macro_rules! itry {
    ($e:expr) => {
        match $e {
            Ok(v) => v,
            Err(err) => return Some(Err(From::from(err))),
        }
    };
}

/// A result type for walkdir operations.
///
/// Note that this result type embeds the error type in this crate. This
/// is only useful if you care about the additional information provided by
/// the error (such as the path associated with the error or whether a loop
/// was dectected). If you want things to Just Work, then you can use
/// [`io::Result`] instead since the error type in this package will
/// automatically convert to an [`io::Result`] when using the [`try!`] macro.
///
/// [`io::Result`]: https://doc.rust-lang.org/stable/std/io/type.Result.html
/// [`try!`]: https://doc.rust-lang.org/stable/std/macro.try.html
pub type Result<T> = ::std::result::Result<T, Error>;

/// A builder to create an iterator for recursively walking a directory.
///
/// Results are returned in depth first fashion, with directories yielded
/// before their contents. If [`contents_first`] is true, contents are yielded
/// before their directories. The order is unspecified but if [`sort_by`] is
/// given, directory entries are sorted according to this function. Directory
/// entries `.` and `..` are always omitted.
///
/// If an error occurs at any point during iteration, then it is returned in
/// place of its corresponding directory entry and iteration continues as
/// normal. If an error occurs while opening a directory for reading, then it
/// is not descended into (but the error is still y
```
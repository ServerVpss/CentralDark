# OUTRO - path_segments.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\url-2.5.8\src\path_segments.rs
**SHA:** 28c8b6ffa880c7da
**Timestamp:** 2026-08-28T02:36:33.293197
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let path_start = self.url.path_start as usize;

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2016 The rust-url developers.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use crate::parser::{self, to_u32, SchemeType};
use crate::Url;
use alloc::string::String;
use core::str;

/// Exposes methods to manipulate the path of an URL that is not cannot-be-base.
///
/// The path always starts with a `/` slash, and is made of slash-separated segments.
/// There is always at least one segment (which may be the empty string).
///
/// Examples:
///
/// ```rust
/// use url::Url;
///
/// # #[cfg(feature = "std")]
/// # use std::error::Error;
/// # #[cfg(not(feature = "std"))]
/// # use core::error::Error;
///
/// # fn run() -> Result<(), Box<dyn Error>> {
/// let mut url = Url::parse("mailto:me@example.com")?;
/// assert!(url.path_segments_mut().is_err());
///
/// let mut url = Url::parse("http://example.net/foo/index.html")?;
/// url.path_segments_mut().map_err(|_| "cannot be base")?
///     .pop().push("img").push("2/100%.png");
/// assert_eq!(url.as_str(), "http://example.net/foo/img/2%2F100%25.png");
/// # Ok(())
/// # }
/// # run().unwrap();
/// ```
#[derive(Debug)]
pub struct PathSegmentsMut<'a> {
    url: &'a mut Url,
    after_first_slash: usize,
    after_path: String,
    old_after_path_position: u32,
}

// Not re-exported outside the crate
pub fn new(url: &mut Url) -> PathSegmentsMut<'_> {
    let after_path = url.take_after_path();
    let old_after_path_position = to_u32(url.serialization.len()).unwrap();
    // Special urls always have a non empty path
    if SchemeType::from(url.scheme()).is_special() {
        debug_assert!(url.byte_at(url.path_start) == b'/');
    } else {
        debug_assert!(
            url.serialization.len() == url.path_start as usize
                || url.byte_at(url.path_start) == b'/'
        );
    }
    PathSegmentsMut {
        after_first_slash: url.path_start as usize + "/".len(),
        url,
        old_after_path_position,
        after_path,
    }
}

impl Drop for PathSegmentsMut<'_> {
    fn drop(&mut self) {
        self.url
            .restore_after_path(self.old_after_path_position, &self.after_path)
    }
}

impl PathSegmentsMut<'_> {
    /// Remove all segments in the path, leaving the minimal `url.path() == "/"`.
    ///
    /// Returns `&mut Self` so that method calls can be chained.
    ///
    /// Example:
    ///
    /// ```rust
    /// use url::Url;
    ///
    /// # #[cfg(feature = "std")]
    /// # use std::error::Error;
    /// # #[cfg(not(feature = "std"))]
    /// # use core::error::Error;
    ///
    /// # fn run() -> Result<(), Box<dyn Error>> {
    /// let mut url = Url::parse("https://github.com/servo/rust-url/")?;
    /// url.path_segments_mut().map_err(|_| "cannot be base")?
    ///     .clear().push("logout");
    /// assert_eq!(url.as_str(), "https://github.com/logout");
    /// # Ok(())
    /// # }
    /// # run().unwrap();
    /// ```
    pub fn clear(&mut self) -> &mut Self {
        self.url.serialization.truncate(self.after_first_slash);
        self
    }

    /// Remove the last segment of this URL’s path if it is empty,
    /// except if these was only one segment to begin with.
    ///
    /// In other words, remove one path trailing slash, if any,
    /// unless it is also the initial slash (so this does nothing if `url.path() == "/")`.
    ///
    /// Returns `&mut Self` so that method calls can be chained.
    ///
    /// Example:
    ///
    /// ```rust
    /// use url::Url;
    ///
    /// # #[cfg(feature = "std")]
    /// # use std::error::Error;
    /// # #[cfg(not(feature = "std"))]
    /// # use core::error::Error;
    ///
    /// # fn run() -> Result<(), Box<dyn Error>> {
    /// let mut url = Url::parse("https://github.com/servo/rust-url/")?;
    /// url.path_segments_mut().map_err(|_| "cannot be base")?
    ///     .push("pulls");
    /// assert_eq!(url.as_str(), "https://github.com/servo/rust-url//pulls");
    ///
    /// let mut url = Url::parse("https://github.com/servo/rust-url/")?;
    /// url.path_segments_mut().map_err(|_| "cannot be base")?
    ///     .pop_if_empty().push("pulls");
    /// assert_eq!(url.as_str(), "https://github.com/servo/rust-url/pulls");
    /// # Ok(())
    /// # }
    /// # run().unwrap();
    /// ```
    pub fn pop_if_empty(&mut self) -> &mut Self {
        if self.after_first_slash >= self.url.serialization.len() {
            return self;
        }
        if self.url.serialization[self.after_first_slash..].ends_with('/') {
            self.url.serialization.pop();
        }
        self
    }

    /// Remove the last segment of this URL’s path.
    ///
    /// If the path only has one segment, make it empty such that `url.path() == "/"`.
    ///
    /// Returns `&mut Self` so that method calls can be chained.
    p
```
# OUTRO - method.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\http-1.5.0\src\method.rs
**SHA:** 15d9b60484ab412c
**Timestamp:** 2026-08-28T02:34:16.859238
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Invariant: the first self.1 bytes of self.0 are valid UTF-8.
- // Invariant: self.0 contains valid UTF-8.
- // Invariant: write_checked ensures that the first src.len() bytes
- // Invariant: data is exactly src.len() long and write_checked

### Principios
- // Invariant: the first self.1 bytes of self.0 are valid UTF-8.
- // Invariant: self.0 contains valid UTF-8.
- // Invariant: write_checked ensures that the first src.len() bytes
- // Invariant: data is exactly src.len() long and write_checked

### Ouro Bruto (primeiros 5000 chars)
```
//! The HTTP request method
//!
//! This module contains HTTP-method related structs and errors and such. The
//! main type of this module, `Method`, is also reexported at the root of the
//! crate as `http::Method` and is intended for import through that location
//! primarily.
//!
//! # Examples
//!
//! ```
//! use http::Method;
//!
//! assert_eq!(Method::GET, Method::from_bytes(b"GET").unwrap());
//! assert!(Method::GET.is_idempotent());
//! assert_eq!(Method::POST.as_str(), "POST");
//! ```

use self::extension::{AllocatedExtension, InlineExtension};
use self::Inner::*;

use std::convert::TryFrom;
use std::error::Error;
use std::str::FromStr;
use std::{fmt, str};

/// The Request Method (VERB)
///
/// This type also contains constants for a number of common HTTP methods such
/// as GET, POST, etc.
///
/// Currently includes 8 variants representing the 8 methods defined in
/// [RFC 7230](https://tools.ietf.org/html/rfc7231#section-4.1), plus PATCH,
/// and an Extension variant for all extensions.
///
/// # Examples
///
/// ```
/// use http::Method;
///
/// assert_eq!(Method::GET, Method::from_bytes(b"GET").unwrap());
/// assert!(Method::GET.is_idempotent());
/// assert_eq!(Method::POST.as_str(), "POST");
/// ```
#[derive(Clone, PartialEq, Eq, Hash)]
pub struct Method(Inner);

/// A possible error value when converting `Method` from bytes.
pub struct InvalidMethod {
    _priv: (),
}

#[derive(Clone, PartialEq, Eq, Hash)]
enum Inner {
    Options,
    Get,
    Post,
    Put,
    Delete,
    Head,
    Trace,
    Connect,
    Patch,
    Query,
    // If the extension is short enough, store it inline
    ExtensionInline(InlineExtension),
    // Otherwise, allocate it
    ExtensionAllocated(AllocatedExtension),
}

impl Method {
    /// GET
    pub const GET: Method = Method(Get);

    /// POST
    pub const POST: Method = Method(Post);

    /// PUT
    pub const PUT: Method = Method(Put);

    /// DELETE
    pub const DELETE: Method = Method(Delete);

    /// HEAD
    pub const HEAD: Method = Method(Head);

    /// OPTIONS
    pub const OPTIONS: Method = Method(Options);

    /// CONNECT
    pub const CONNECT: Method = Method(Connect);

    /// PATCH
    pub const PATCH: Method = Method(Patch);

    /// TRACE
    pub const TRACE: Method = Method(Trace);

    /// QUERY
    pub const QUERY: Method = Method(Query);

    /// Converts a slice of bytes to an HTTP method.
    pub fn from_bytes(src: &[u8]) -> Result<Method, InvalidMethod> {
        match src.len() {
            0 => Err(InvalidMethod::new()),
            3 => match src {
                b"GET" => Ok(Method(Get)),
                b"PUT" => Ok(Method(Put)),
                _ => Method::extension_inline(src),
            },
            4 => match src {
                b"POST" => Ok(Method(Post)),
                b"HEAD" => Ok(Method(Head)),
                _ => Method::extension_inline(src),
            },
            5 => match src {
                b"PATCH" => Ok(Method(Patch)),
                b"TRACE" => Ok(Method(Trace)),
                b"QUERY" => Ok(Method(Query)),
                _ => Method::extension_inline(src),
            },
            6 => match src {
                b"DELETE" => Ok(Method(Delete)),
                _ => Method::extension_inline(src),
            },
            7 => match src {
                b"OPTIONS" => Ok(Method(Options)),
                b"CONNECT" => Ok(Method(Connect)),
                _ => Method::extension_inline(src),
            },
            _ => {
                if src.len() <= InlineExtension::MAX {
                    Method::extension_inline(src)
                } else {
                    let allocated = AllocatedExtension::new(src)?;

                    Ok(Method(ExtensionAllocated(allocated)))
                }
            }
        }
    }

    fn extension_inline(src: &[u8]) -> Result<Method, InvalidMethod> {
        let inline = InlineExtension::new(src)?;

        Ok(Method(ExtensionInline(inline)))
    }

    /// Whether a method is considered "safe", meaning the request is
    /// essentially read-only.
    ///
    /// See [the spec](https://tools.ietf.org/html/rfc7231#section-4.2.1)
    /// for more words.
    pub fn is_safe(&self) -> bool {
        matches!(self.0, Get | Head | Options | Trace | Query)
    }

    /// Whether a method is considered "idempotent", meaning the request has
    /// the same result if executed multiple times.
    ///
    /// See [the spec](https://tools.ietf.org/html/rfc7231#section-4.2.2) for
    /// more words.
    pub fn is_idempotent(&self) -> bool {
        match self.0 {
            Put | Delete => true,
            _ => self.is_safe(),
        }
    }

    /// Return a &str representation of the HTTP method
    #[inline]
    pub fn as_str(&self) -> &str {
        match self.0 {
            Options => "OPTIONS",
            Get => "GET",
            Post => "POST",
            Put => "PUT",
            Delete => "DELETE",
            Head => "HEAD",
         
```
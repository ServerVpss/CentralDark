# OUTRO - name.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\name.rs
**SHA:** 9942600448a79ded
**Timestamp:** 2026-08-28T02:35:00.865102
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: usize,
- start: buffer.len(),
- let start = self.buffer.len();
- let start = self.buffer.len();
- pub fn push(&mut self, start: &BytesStart) -> Result<(), NamespaceError> {
- /// resolver.push(&BytesStart::new("tag"));
- /// resolver.push(&BytesStart::new("tag"));
- resolver.push(&BytesStart::from_content(&tag, 1)),
- assert_eq!(resolver.push(&BytesStart::from_content(&tag, 1)), Ok(()));
- resolver.push(&BytesStart::from_content(

### Gaps
- //TODO: implement value normalization and use it when comparing namespaces

### Ouro Bruto (primeiros 5000 chars)
```
//! Module for handling names according to the W3C [Namespaces in XML 1.1 (Second Edition)][spec]
//! specification
//!
//! [spec]: https://www.w3.org/TR/xml-names11

use crate::events::attributes::Attribute;
use crate::events::{BytesStart, Event};
use crate::utils::{write_byte_string, Bytes};
use memchr::memchr;
use std::fmt::{self, Debug, Formatter};
use std::iter::FusedIterator;

/// Some namespace was invalid
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NamespaceError {
    /// Specified namespace prefix is unknown, cannot resolve namespace for it
    UnknownPrefix(Vec<u8>),
    /// Attempts to bind the `xml` prefix to something other than `http://www.w3.org/XML/1998/namespace`.
    ///
    /// `xml` prefix can be bound only to `http://www.w3.org/XML/1998/namespace`.
    ///
    /// Contains the namespace to which `xml` tried to be bound.
    InvalidXmlPrefixBind(Vec<u8>),
    /// Attempts to bind the `xmlns` prefix.
    ///
    /// `xmlns` prefix is always bound to `http://www.w3.org/2000/xmlns/` and cannot be bound
    /// to any other namespace or even to `http://www.w3.org/2000/xmlns/`.
    ///
    /// Contains the namespace to which `xmlns` tried to be bound.
    InvalidXmlnsPrefixBind(Vec<u8>),
    /// Attempts to bind some prefix (except `xml`) to `http://www.w3.org/XML/1998/namespace`.
    ///
    /// Only `xml` prefix can be bound to `http://www.w3.org/XML/1998/namespace`.
    ///
    /// Contains the prefix that is tried to be bound.
    InvalidPrefixForXml(Vec<u8>),
    /// Attempts to bind some prefix to `http://www.w3.org/2000/xmlns/`.
    ///
    /// `http://www.w3.org/2000/xmlns/` cannot be bound to any prefix, even to `xmlns`.
    ///
    /// Contains the prefix that is tried to be bound.
    InvalidPrefixForXmlns(Vec<u8>),
    /// A single start tag declared more `xmlns` / `xmlns:*` namespace bindings
    /// than the configured [`NamespaceResolver::max_declarations_per_element`]
    /// limit. Contains the configured limit.
    ///
    /// This bounds the heap allocated by [`NamespaceResolver::push`] (and hence
    /// by [`NsReader`](crate::reader::NsReader)) on untrusted input.
    TooManyDeclarations(usize),
}

impl fmt::Display for NamespaceError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Self::UnknownPrefix(prefix) => {
                f.write_str("unknown namespace prefix '")?;
                write_byte_string(f, prefix)?;
                f.write_str("'")
            }
            Self::InvalidXmlPrefixBind(namespace) => {
                f.write_str("the namespace prefix 'xml' cannot be bound to '")?;
                write_byte_string(f, namespace)?;
                f.write_str("'")
            }
            Self::InvalidXmlnsPrefixBind(namespace) => {
                f.write_str("the namespace prefix 'xmlns' cannot be bound to '")?;
                write_byte_string(f, namespace)?;
                f.write_str("'")
            }
            Self::InvalidPrefixForXml(prefix) => {
                f.write_str("the namespace prefix '")?;
                write_byte_string(f, prefix)?;
                f.write_str("' cannot be bound to 'http://www.w3.org/XML/1998/namespace'")
            }
            Self::InvalidPrefixForXmlns(prefix) => {
                f.write_str("the namespace prefix '")?;
                write_byte_string(f, prefix)?;
                f.write_str("' cannot be bound to 'http://www.w3.org/2000/xmlns/'")
            }
            Self::TooManyDeclarations(limit) => {
                write!(
                    f,
                    "start tag declares more than {} namespace bindings; \
                     raise the limit with NamespaceResolver::set_max_declarations_per_element",
                    limit,
                )
            }
        }
    }
}

impl std::error::Error for NamespaceError {}

////////////////////////////////////////////////////////////////////////////////////////////////////

/// A [qualified name] of an element or an attribute, including an optional
/// namespace [prefix](Prefix) and a [local name](LocalName).
///
/// [qualified name]: https://www.w3.org/TR/xml-names11/#dt-qualname
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[cfg_attr(feature = "serde-types", derive(serde::Deserialize, serde::Serialize))]
pub struct QName<'a>(pub &'a [u8]);
impl<'a> QName<'a> {
    /// Converts this name to an internal slice representation.
    #[inline(always)]
    pub const fn into_inner(self) -> &'a [u8] {
        self.0
    }

    /// Returns local part of this qualified name.
    ///
    /// All content up to and including the first `:` character is removed from
    /// the tag name.
    ///
    /// # Examples
    ///
    /// ```
    /// # use quick_xml::name::QName;
    /// let simple = QName(b"simple-name");
    /// assert_eq!(simple.local_name().as_ref(), b"simple-name");
    ///
    /// let qname = QName(b"namespace:simple-name");
    /// assert_eq!(qname.local_name().as_re
```
# COMANDO - escape.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\escape.rs
**SHA:** 4978c24fc50ade9a
**Timestamp:** 2026-08-28T02:35:00.830318
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = index + 1; // +1 - skip `&`

### Gaps
- // TODO: It would be better to reuse buffer after decoding if possible
- // TODO: It would be better to reuse buffer after decoding if possible
- //TODO: automate up-to-dating using https://html.spec.whatwg.org/entities.json
- //TODO: building this function increases compilation time by 10+ seconds (or 5x times)

### Ouro Bruto (primeiros 5000 chars)
```
//! Manage xml character escapes

use memchr::{memchr, memchr2_iter, memchr3};
use std::borrow::Cow;
use std::fmt::{self, Write};
use std::num::ParseIntError;
use std::ops::Range;
use std::slice::Iter;

/// Error of parsing character reference (`&#<dec-number>;` or `&#x<hex-number>;`).
#[derive(Clone, Debug, PartialEq)]
pub enum ParseCharRefError {
    /// Number contains sign character (`+` or `-`) which is not allowed.
    UnexpectedSign,
    /// Number cannot be parsed due to non-number characters or a numeric overflow.
    InvalidNumber(ParseIntError),
    /// Character reference represents not a valid unicode codepoint.
    InvalidCodepoint(u32),
    /// Character reference expanded to a not permitted character for an XML.
    ///
    /// Currently, only `0x0` character produces this error.
    IllegalCharacter(u32),
}

impl std::fmt::Display for ParseCharRefError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Self::UnexpectedSign => f.write_str("unexpected number sign"),
            Self::InvalidNumber(e) => e.fmt(f),
            Self::InvalidCodepoint(n) => write!(f, "`{}` is not a valid codepoint", n),
            Self::IllegalCharacter(n) => write!(f, "0x{:x} character is not permitted in XML", n),
        }
    }
}

impl std::error::Error for ParseCharRefError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::InvalidNumber(e) => Some(e),
            _ => None,
        }
    }
}

/// Error for XML escape / unescape.
#[derive(Clone, Debug, PartialEq)]
pub enum EscapeError {
    /// Referenced entity in unknown to the parser.
    UnrecognizedEntity(Range<usize>, String),
    /// Cannot find `;` after `&`
    UnterminatedEntity(Range<usize>),
    /// Attempt to parse character reference (`&#<dec-number>;` or `&#x<hex-number>;`)
    /// was unsuccessful, not all characters are decimal or hexadecimal numbers.
    InvalidCharRef(ParseCharRefError),
    /// Expanded more than maximum possible entities during attribute normalization.
    ///
    /// Attribute normalization includes expanding of general entities (`&entity;`)
    /// which replacement text also could contain entities, which is also must be expanded.
    /// If more than 128 entities would be expanded, this error is returned.
    TooManyNestedEntities,
}

impl std::fmt::Display for EscapeError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Self::UnrecognizedEntity(rge, res) => {
                write!(f, "at {:?}: unrecognized entity `{}`", rge, res)
            }
            Self::UnterminatedEntity(e) => write!(
                f,
                "Error while escaping character at range {:?}: Cannot find ';' after '&'",
                e
            ),
            Self::InvalidCharRef(e) => {
                write!(f, "invalid character reference: {}", e)
            }
            Self::TooManyNestedEntities => {
                f.write_str("too many nested entities in an attribute value")
            }
        }
    }
}

impl std::error::Error for EscapeError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::InvalidCharRef(e) => Some(e),
            _ => None,
        }
    }
}

/// Escapes an `&str` and replaces all xml special characters (`<`, `>`, `&`, `'`, `"`)
/// with their corresponding xml escaped value.
///
/// This function performs following replacements:
///
/// | Character | Replacement
/// |-----------|------------
/// | `<`       | `&lt;`
/// | `>`       | `&gt;`
/// | `&`       | `&amp;`
/// | `'`       | `&apos;`
/// | `"`       | `&quot;`
///
/// This function performs following replacements:
///
/// | Character | Replacement
/// |-----------|------------
/// | `<`       | `&lt;`
/// | `>`       | `&gt;`
/// | `&`       | `&amp;`
/// | `'`       | `&apos;`
/// | `"`       | `&quot;`
pub fn escape<'a>(raw: impl Into<Cow<'a, str>>) -> Cow<'a, str> {
    _escape(raw, |ch| matches!(ch, b'<' | b'>' | b'&' | b'\'' | b'\"'))
}

/// Escapes an `&str` and replaces xml special characters (`<`, `>`, `&`)
/// with their corresponding xml escaped value.
///
/// Should only be used for escaping text content. In XML text content, it is allowed
/// (though not recommended) to leave the quote special characters `"` and `'` unescaped.
///
/// This function performs following replacements:
///
/// | Character | Replacement
/// |-----------|------------
/// | `<`       | `&lt;`
/// | `>`       | `&gt;`
/// | `&`       | `&amp;`
///
/// This function performs following replacements:
///
/// | Character | Replacement
/// |-----------|------------
/// | `<`       | `&lt;`
/// | `>`       | `&gt;`
/// | `&`       | `&amp;`
pub fn partial_escape<'a>(raw: impl Into<Cow<'a, str>>) -> Cow<'a, str> {
    _escape(raw, |ch| matches!(ch, b'<' | b'>' | b'&'))
}

/// XML standard [requires] that only `<` and `&` was escaped i
```
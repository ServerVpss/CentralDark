# COMANDO - encoding.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\encoding.rs
**SHA:** 40372cfc4550fa50
**Timestamp:** 2026-08-28T02:35:00.774433
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: These tests emulate the updating of the internal decoder after reading the XML decl.

### Ouro Bruto (primeiros 5000 chars)
```
//! A module for wrappers that encode / decode data.

use std::borrow::Cow;
use std::str::Utf8Error;

#[cfg(feature = "encoding")]
use encoding_rs;
#[cfg(feature = "encoding")]
use std::io::{self, BufRead, Read};

/// Unicode "byte order mark" (\u{FEFF}) encoded as UTF-8.
/// See <https://unicode.org/faq/utf_bom.html#bom1>
pub(crate) const UTF8_BOM: &[u8] = &[0xEF, 0xBB, 0xBF];
/// Unicode "byte order mark" (\u{FEFF}) encoded as UTF-16 with little-endian byte order.
/// See <https://unicode.org/faq/utf_bom.html#bom1>
pub(crate) const UTF16_LE_BOM: &[u8] = &[0xFF, 0xFE];
/// Unicode "byte order mark" (\u{FEFF}) encoded as UTF-16 with big-endian byte order.
/// See <https://unicode.org/faq/utf_bom.html#bom1>
pub(crate) const UTF16_BE_BOM: &[u8] = &[0xFE, 0xFF];

/// An error when decoding or encoding
///
/// If feature [`encoding`] is disabled, the [`EncodingError`] is always [`EncodingError::Utf8`]
///
/// [`encoding`]: ../index.html#encoding
#[derive(Clone, Debug, PartialEq, Eq)]
#[non_exhaustive]
pub enum EncodingError {
    /// Input was not valid UTF-8
    Utf8(Utf8Error),
    /// Input did not adhere to the given encoding
    #[cfg(feature = "encoding")]
    Other(&'static encoding_rs::Encoding),
}

impl From<Utf8Error> for EncodingError {
    #[inline]
    fn from(e: Utf8Error) -> Self {
        Self::Utf8(e)
    }
}

impl std::error::Error for EncodingError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Utf8(e) => Some(e),
            #[cfg(feature = "encoding")]
            Self::Other(_) => None,
        }
    }
}

impl std::fmt::Display for EncodingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Utf8(e) => write!(f, "cannot decode input using UTF-8: {}", e),
            #[cfg(feature = "encoding")]
            Self::Other(encoding) => write!(f, "cannot decode input using {}", encoding.name()),
        }
    }
}

/// Decoder of byte slices into strings.
///
/// If feature [`encoding`] is enabled, this encoding taken from the `"encoding"`
/// XML declaration or assumes UTF-8, if XML has no <?xml ?> declaration, encoding
/// key is not defined or contains unknown encoding.
///
/// The library supports any UTF-8 compatible encodings that crate `encoding_rs`
/// is supported. [*UTF-16 and ISO-2022-JP are not supported at the present*][utf16].
///
/// If feature [`encoding`] is disabled, the decoder is always UTF-8 decoder:
/// any XML declarations are ignored.
///
/// [utf16]: https://github.com/tafia/quick-xml/issues/158
/// [`encoding`]: ../index.html#encoding
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct Decoder {
    #[cfg(feature = "encoding")]
    pub(crate) encoding: &'static encoding_rs::Encoding,
}

impl Decoder {
    pub(crate) const fn utf8() -> Self {
        Decoder {
            #[cfg(feature = "encoding")]
            encoding: encoding_rs::UTF_8,
        }
    }

    #[cfg(all(test, feature = "encoding", feature = "serialize"))]
    pub(crate) const fn utf16() -> Self {
        Decoder {
            encoding: encoding_rs::UTF_16LE,
        }
    }
}

impl Decoder {
    /// Returns the `Reader`s encoding.
    ///
    /// This encoding will be used by [`decode`].
    ///
    /// [`decode`]: Self::decode
    #[cfg(feature = "encoding")]
    pub const fn encoding(&self) -> &'static encoding_rs::Encoding {
        self.encoding
    }

    /// ## Without `encoding` feature
    ///
    /// Decodes an UTF-8 slice regardless of XML declaration and ignoring BOM
    /// if it is present in the `bytes`.
    ///
    /// ## With `encoding` feature
    ///
    /// Decodes specified bytes using encoding, declared in the XML, if it was
    /// declared there, or UTF-8 otherwise, and ignoring BOM if it is present
    /// in the `bytes`.
    ///
    /// ----
    /// Returns an error in case of malformed sequences in the `bytes`.
    pub fn decode<'b>(&self, bytes: &'b [u8]) -> Result<Cow<'b, str>, EncodingError> {
        #[cfg(not(feature = "encoding"))]
        let decoded = Ok(Cow::Borrowed(std::str::from_utf8(bytes)?));

        #[cfg(feature = "encoding")]
        let decoded = decode(bytes, self.encoding);

        decoded
    }

    /// Like [`decode`][Self::decode] but using a pre-allocated buffer.
    pub fn decode_into(&self, bytes: &[u8], buf: &mut String) -> Result<(), EncodingError> {
        #[cfg(not(feature = "encoding"))]
        buf.push_str(std::str::from_utf8(bytes)?);

        #[cfg(feature = "encoding")]
        decode_into(bytes, self.encoding, buf)?;

        Ok(())
    }

    /// Decodes the `Cow` buffer, preserves the lifetime
    pub(crate) fn decode_cow<'b>(
        &self,
        bytes: &Cow<'b, [u8]>,
    ) -> Result<Cow<'b, str>, EncodingError> {
        match bytes {
            Cow::Borrowed(bytes) => self.decode(bytes),
            // Convert to owned, because otherwise Cow will be bound with wrong lifetime
            Cow::Owned(
```
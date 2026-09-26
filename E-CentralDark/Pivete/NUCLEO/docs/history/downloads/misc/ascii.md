# OUTRO - ascii.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tinystr-0.8.3\src\ascii.rs
**SHA:** 15ca12e3c853e22b
**Timestamp:** 2026-08-28T02:36:09.878259
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: usize,

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use crate::asciibyte::AsciiByte;
use crate::int_ops::{Aligned4, Aligned8};
use crate::ParseError;
#[cfg(feature = "alloc")]
use alloc::string::String;
use core::borrow::Borrow;
use core::fmt;
use core::ops::Deref;
use core::str::{self, FromStr};

#[repr(transparent)]
#[derive(PartialEq, Eq, Ord, PartialOrd, Copy, Clone, Hash)]
pub struct TinyAsciiStr<const N: usize> {
    bytes: [AsciiByte; N],
}

impl<const N: usize> TinyAsciiStr<N> {
    /// The empty string.
    pub const EMPTY: Self = Self {
        bytes: [AsciiByte::B0; N],
    };

    #[inline]
    pub const fn try_from_str(s: &str) -> Result<Self, ParseError> {
        Self::try_from_utf8(s.as_bytes())
    }

    /// Creates a `TinyAsciiStr<N>` from the given UTF-8 slice.
    /// `code_units` may contain at most `N` non-null ASCII code points.
    #[inline]
    pub const fn try_from_utf8(code_units: &[u8]) -> Result<Self, ParseError> {
        Self::try_from_utf8_inner(code_units, false)
    }

    /// Creates a `TinyAsciiStr<N>` from the given UTF-16 slice.
    /// `code_units` may contain at most `N` non-null ASCII code points.
    #[inline]
    pub const fn try_from_utf16(code_units: &[u16]) -> Result<Self, ParseError> {
        Self::try_from_utf16_inner(code_units, 0, code_units.len(), false)
    }

    /// Creates a `TinyAsciiStr<N>` from a UTF-8 slice, replacing invalid code units.
    ///
    /// Invalid code units, as well as null or non-ASCII code points
    /// (i.e. those outside the range `U+0001..=U+007F`)
    /// will be replaced with the replacement byte.
    ///
    /// The input slice will be truncated if its length exceeds `N`.
    ///
    /// # Panics
    ///
    /// Panics if `replacement` is not a non-null ASCII byte (i.e. not in `1..=127`).
    pub const fn from_utf8_lossy(code_units: &[u8], replacement: u8) -> Self {
        assert!(
            replacement > 0 && replacement < 0x80,
            "replacement must be a non-null ASCII byte (1..=127)"
        );
        let mut out = [0; N];
        let mut i = 0;
        // Ord is not available in const, so no `.min(N)`
        let len = if code_units.len() > N {
            N
        } else {
            code_units.len()
        };

        // Indexing is protected by the len check above
        #[expect(clippy::indexing_slicing)]
        while i < len {
            let b = code_units[i];
            if b > 0 && b < 0x80 {
                out[i] = b;
            } else {
                out[i] = replacement;
            }
            i += 1;
        }

        Self {
            // SAFETY: `out` only contains ASCII bytes and has same size as `self.bytes`
            bytes: unsafe { AsciiByte::to_ascii_byte_array(&out) },
        }
    }

    /// Creates a `TinyAsciiStr<N>` from a UTF-16 slice, replacing invalid code units.
    ///
    /// Invalid code units, as well as null or non-ASCII code points
    /// (i.e. those outside the range `U+0001..=U+007F`)
    /// will be replaced with the replacement byte.
    ///
    /// The input slice will be truncated if its length exceeds `N`.
    ///
    /// # Panics
    ///
    /// Panics if `replacement` is not a non-null ASCII byte (i.e. not in `1..=127`).
    pub const fn from_utf16_lossy(code_units: &[u16], replacement: u8) -> Self {
        assert!(
            replacement > 0 && replacement < 0x80,
            "replacement must be a non-null ASCII byte (1..=127)"
        );
        let mut out = [0; N];
        let mut i = 0;
        // Ord is not available in const, so no `.min(N)`
        let len = if code_units.len() > N {
            N
        } else {
            code_units.len()
        };

        // Indexing is protected by the len check above
        #[expect(clippy::indexing_slicing)]
        while i < len {
            let b = code_units[i];
            if b > 0 && b < 0x80 {
                out[i] = b as u8;
            } else {
                out[i] = replacement;
            }
            i += 1;
        }

        Self {
            // SAFETY: `out` only contains ASCII bytes and has same size as `self.bytes`
            bytes: unsafe { AsciiByte::to_ascii_byte_array(&out) },
        }
    }

    /// Attempts to parse a fixed-length byte array to a `TinyAsciiStr`.
    ///
    /// The byte array may contain trailing NUL bytes.
    ///
    /// # Example
    ///
    /// ```
    /// use tinystr::tinystr;
    /// use tinystr::TinyAsciiStr;
    ///
    /// assert_eq!(
    ///     TinyAsciiStr::<3>::try_from_raw(*b"GB\0"),
    ///     Ok(tinystr!(3, "GB"))
    /// );
    /// assert_eq!(
    ///     TinyAsciiStr::<3>::try_from_raw(*b"USD"),
    ///     Ok(tinystr!(3, "USD"))
    /// );
    /// assert!(TinyAsciiStr::<3>::try_from_raw(*b"\0A\0").is_err());
    /// ```
    pub const fn try_from_raw(raw: [u8; N]) -> Result<Self, 
```
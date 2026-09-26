# OUTRO - byte_str.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\http-1.5.0\src\byte_str.rs
**SHA:** 267b2525d4ce4c6c
**Timestamp:** 2026-08-28T02:34:16.748168
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Invariant: bytes contains valid UTF-8
- // Invariant: the empty slice is trivially valid UTF-8.
- // Invariant: val is a str so contains valid UTF-8.
- // Invariant: assumed by the safety requirements of this function.
- // Invariant: just checked is utf8
- // Invariant: src is a String so contains valid UTF-8.
- // Invariant: src is a str so contains valid UTF-8.

### Principios
- // Invariant: bytes contains valid UTF-8
- // Invariant: the empty slice is trivially valid UTF-8.
- // Invariant: val is a str so contains valid UTF-8.
- // Invariant: assumed by the safety requirements of this function.
- // Invariant: just checked is utf8
- // Invariant: src is a String so contains valid UTF-8.
- // Invariant: src is a str so contains valid UTF-8.

### Ouro Bruto (primeiros 5000 chars)
```
use bytes::Bytes;

use std::{ops, str};

#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub(crate) struct ByteStr {
    // Invariant: bytes contains valid UTF-8
    bytes: Bytes,
}

impl ByteStr {
    #[inline]
    pub fn new() -> ByteStr {
        ByteStr {
            // Invariant: the empty slice is trivially valid UTF-8.
            bytes: Bytes::new(),
        }
    }

    #[inline]
    pub const fn from_static(val: &'static str) -> ByteStr {
        ByteStr {
            // Invariant: val is a str so contains valid UTF-8.
            bytes: Bytes::from_static(val.as_bytes()),
        }
    }

    #[inline]
    /// ## Panics
    /// In a debug build this will panic if `bytes` is not valid UTF-8.
    ///
    /// ## Safety
    /// `bytes` must contain valid UTF-8. In a release build it is undefined
    /// behavior to call this with `bytes` that is not valid UTF-8.
    pub unsafe fn from_utf8_unchecked(bytes: Bytes) -> ByteStr {
        if cfg!(debug_assertions) {
            match str::from_utf8(&bytes) {
                Ok(_) => (),
                Err(err) => panic!(
                    "ByteStr::from_utf8_unchecked() with invalid bytes; error = {}, bytes = {:?}",
                    err, bytes
                ),
            }
        }
        // Invariant: assumed by the safety requirements of this function.
        ByteStr { bytes }
    }

    pub(crate) fn from_utf8(bytes: Bytes) -> Result<ByteStr, std::str::Utf8Error> {
        str::from_utf8(&bytes)?;
        // Invariant: just checked is utf8
        Ok(ByteStr { bytes })
    }
}

impl ops::Deref for ByteStr {
    type Target = str;

    #[inline]
    fn deref(&self) -> &str {
        let b: &[u8] = self.bytes.as_ref();
        // Safety: the invariant of `bytes` is that it contains valid UTF-8.
        unsafe { str::from_utf8_unchecked(b) }
    }
}

impl From<String> for ByteStr {
    #[inline]
    fn from(src: String) -> ByteStr {
        ByteStr {
            // Invariant: src is a String so contains valid UTF-8.
            bytes: Bytes::from(src),
        }
    }
}

impl From<&str> for ByteStr {
    #[inline]
    fn from(src: &str) -> ByteStr {
        ByteStr {
            // Invariant: src is a str so contains valid UTF-8.
            bytes: Bytes::copy_from_slice(src.as_bytes()),
        }
    }
}

impl From<ByteStr> for Bytes {
    fn from(src: ByteStr) -> Self {
        src.bytes
    }
}

```
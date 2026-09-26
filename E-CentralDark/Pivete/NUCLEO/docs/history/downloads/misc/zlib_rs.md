# OUTRO - zlib_rs.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\flate2-1.1.9\src\ffi\zlib_rs.rs
**SHA:** 17df19e5cd95403a
**Timestamp:** 2026-08-28T02:34:08.604781
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let total_in_start = self.inner.total_in();
- let total_out_start = self.inner.total_out();
- let total_in_start = self.inner.total_in();
- let total_out_start = self.inner.total_out();

### Ouro Bruto (primeiros 5000 chars)
```
//! Implementation for `zlib_rs` rust backend.
//!
//! Every backend must provide two types:
//!
//! - `Deflate` for compression, implements the `Backend` and `DeflateBackend` trait
//! - `Inflate` for decompression, implements the `Backend` and `InflateBackend` trait
//!
//! Additionally the backend provides a number of constants, and a `ErrorMessage` type.
//!
//! ## Allocation
//!
//! The (de)compression state is not boxed. The C implementations require that the z_stream is
//! pinned in memory (has a fixed address), because their z_stream is self-referential. The most
//! convenient way in rust to guarantee a stable address is to `Box` the data, but it does add an
//! additional allocation.
//!
//! With zlib_rs the state is not self-referential and hence no boxing is needed. The `new` methods
//! internally do allocate space for the (de)compression state.

use std::fmt;

use ::zlib_rs::{DeflateFlush, InflateError, InflateFlush};

pub const MZ_NO_FLUSH: isize = DeflateFlush::NoFlush as isize;
pub const MZ_PARTIAL_FLUSH: isize = DeflateFlush::PartialFlush as isize;
pub const MZ_SYNC_FLUSH: isize = DeflateFlush::SyncFlush as isize;
pub const MZ_FULL_FLUSH: isize = DeflateFlush::FullFlush as isize;
pub const MZ_FINISH: isize = DeflateFlush::Finish as isize;

pub const MZ_DEFAULT_WINDOW_BITS: core::ffi::c_int = 15;

use super::*;
use crate::mem::{compress_failed, decompress_failed};

impl From<::zlib_rs::Status> for crate::mem::Status {
    fn from(value: ::zlib_rs::Status) -> Self {
        match value {
            ::zlib_rs::Status::Ok => crate::mem::Status::Ok,
            ::zlib_rs::Status::BufError => crate::mem::Status::BufError,
            ::zlib_rs::Status::StreamEnd => crate::mem::Status::StreamEnd,
        }
    }
}

#[derive(Clone, Default)]
pub struct ErrorMessage(Option<&'static str>);

impl ErrorMessage {
    pub fn get(&self) -> Option<&str> {
        self.0
    }
}

pub struct Inflate {
    pub(crate) inner: ::zlib_rs::Inflate,
    // NOTE: these counts do not count the dictionary.
    total_in: u64,
    total_out: u64,
}

impl fmt::Debug for Inflate {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        write!(
            f,
            "zlib_rs inflate internal state. total_in: {}, total_out: {}",
            self.total_in(),
            self.total_out(),
        )
    }
}

impl From<FlushDecompress> for DeflateFlush {
    fn from(value: FlushDecompress) -> Self {
        match value {
            FlushDecompress::None => Self::NoFlush,
            FlushDecompress::Sync => Self::SyncFlush,
            FlushDecompress::Finish => Self::Finish,
        }
    }
}

impl InflateBackend for Inflate {
    fn make(zlib_header: bool, window_bits: u8) -> Self {
        Inflate {
            inner: ::zlib_rs::Inflate::new(zlib_header, window_bits),
            total_in: 0,
            total_out: 0,
        }
    }

    fn decompress(
        &mut self,
        input: &[u8],
        output: &mut [u8],
        flush: FlushDecompress,
    ) -> Result<Status, DecompressError> {
        let flush = match flush {
            FlushDecompress::None => InflateFlush::NoFlush,
            FlushDecompress::Sync => InflateFlush::SyncFlush,
            FlushDecompress::Finish => InflateFlush::Finish,
        };

        let total_in_start = self.inner.total_in();
        let total_out_start = self.inner.total_out();

        let result = self.inner.decompress(input, output, flush);

        self.total_in += self.inner.total_in() - total_in_start;
        self.total_out += self.inner.total_out() - total_out_start;

        match result {
            Ok(status) => Ok(status.into()),
            Err(InflateError::NeedDict { dict_id }) => crate::mem::decompress_need_dict(dict_id),
            Err(_) => self.decompress_error(),
        }
    }

    fn reset(&mut self, zlib_header: bool) {
        self.total_in = 0;
        self.total_out = 0;
        self.inner.reset(zlib_header);
    }
}

impl Backend for Inflate {
    #[inline]
    fn total_in(&self) -> u64 {
        self.total_in
    }

    #[inline]
    fn total_out(&self) -> u64 {
        self.total_out
    }
}

impl Inflate {
    fn decompress_error<T>(&self) -> Result<T, DecompressError> {
        decompress_failed(ErrorMessage(self.inner.error_message()))
    }

    pub fn set_dictionary(&mut self, dictionary: &[u8]) -> Result<u32, DecompressError> {
        match self.inner.set_dictionary(dictionary) {
            Ok(v) => Ok(v),
            Err(_) => self.decompress_error(),
        }
    }
}

pub struct Deflate {
    pub(crate) inner: ::zlib_rs::Deflate,
    // NOTE: these counts do not count the dictionary.
    total_in: u64,
    total_out: u64,
}

impl fmt::Debug for Deflate {
    fn fmt(&self, f: &mut fmt::Formatter) -> Result<(), fmt::Error> {
        write!(
            f,
            "zlib_rs deflate internal state. total_in: {}, total_out: {}",
            self.total_in(),
            self.total_out(),
        )
    }
}

impl
```
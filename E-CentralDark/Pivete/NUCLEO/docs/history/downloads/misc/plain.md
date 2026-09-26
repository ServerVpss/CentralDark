# OUTRO - plain.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-0.11.6\src\ule\plain.rs
**SHA:** 8b3d219ac1d4e97f
**Timestamp:** 2026-08-28T02:37:46.141963
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const NICHE_BIT_PATTERN: [u8; 1] = [0x00];

### Gaps
- // TODO: use cast_signed at 1.87 MSRV
- // TODO: use cast_unsigned at 1.87 MSRV

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

#![allow(clippy::upper_case_acronyms)]
//! ULE implementation for Plain Old Data types, including all sized integers.

use super::*;
use crate::impl_ule_from_array;
use crate::ZeroSlice;
use core::num::{NonZeroI8, NonZeroU8};

/// A u8 array of little-endian data with infallible conversions to and from &[u8].
#[repr(transparent)]
#[derive(Debug, PartialEq, Eq, Clone, Copy, PartialOrd, Ord, Hash)]
#[allow(clippy::exhaustive_structs)] // newtype
pub struct RawBytesULE<const N: usize>(pub [u8; N]);

impl<const N: usize> RawBytesULE<N> {
    #[inline]
    pub fn as_bytes(&self) -> &[u8] {
        &self.0
    }

    #[inline]
    pub fn from_bytes_unchecked_mut(bytes: &mut [u8]) -> &mut [Self] {
        let data = bytes.as_mut_ptr();
        let len = bytes.len() / N;
        // Safe because Self is transparent over [u8; N]
        unsafe { slice::from_raw_parts_mut(data as *mut Self, len) }
    }
}

// Safety (based on the safety checklist on the ULE trait):
//  1. RawBytesULE does not include any uninitialized or padding bytes.
//     (achieved by `#[repr(transparent)]` on a type that satisfies this invariant)
//  2. RawBytesULE is aligned to 1 byte.
//     (achieved by `#[repr(transparent)]` on a type that satisfies this invariant)
//  3. The impl of validate_bytes() returns an error if any byte is not valid (never).
//  4. The impl of validate_bytes() returns an error if there are leftover bytes.
//  5. The other ULE methods use the default impl.
//  6. RawBytesULE byte equality is semantic equality
unsafe impl<const N: usize> ULE for RawBytesULE<N> {
    #[inline]
    fn validate_bytes(bytes: &[u8]) -> Result<(), UleError> {
        if bytes.len() % N == 0 {
            // Safe because Self is transparent over [u8; N]
            Ok(())
        } else {
            Err(UleError::length::<Self>(bytes.len()))
        }
    }
}

impl<const N: usize> From<[u8; N]> for RawBytesULE<N> {
    #[inline]
    fn from(le_bytes: [u8; N]) -> Self {
        Self(le_bytes)
    }
}

macro_rules! impl_numbers_with_raw_bytes_ule {
    ($unsigned:ty, $signed:ty $(, $float:ty)?) => {
        const _: () = assert!(size_of::<$unsigned>() == size_of::<$signed>() $(&& size_of::<$unsigned>() == size_of::<$float>())?);

        impl RawBytesULE<{ size_of::<$unsigned>() }> {
            #[doc = concat!("Gets this `RawBytesULE` as a `", stringify!($unsigned), "`. This is equivalent to calling [`AsULE::from_unaligned()`] on [`", stringify!($unsigned), "`].")]
            #[inline]
            pub const fn as_unsigned_int(&self) -> $unsigned {
                <$unsigned>::from_le_bytes(self.0)
            }

            #[doc = concat!("Gets this `RawBytesULE` as a `", stringify!($unsigned), "`. This is equivalent to calling [`AsULE::from_unaligned()`] on [`", stringify!($signed), "`].")]
            #[inline]
            pub const fn as_signed_int(&self) -> $signed {
                <$signed>::from_le_bytes(self.0)
            }

            $(
                #[doc = concat!("Gets this `RawBytesULE` as a `", stringify!($float), "`. This is equivalent to calling [`AsULE::from_unaligned()`] on [`", stringify!($float), "`].")]
                #[inline]
                pub const fn as_float(&self) -> $float {
                    <$float>::from_le_bytes(self.0)
                }
            )?

            #[doc = concat!("Converts a `", stringify!($unsigned), "` to a `RawBytesULE`. This is equivalent to calling [`AsULE::to_unaligned()`] on [`", stringify!($unsigned), "`].")]
            #[inline]
            pub const fn from_aligned(value: $unsigned) -> Self {
                Self(value.to_le_bytes())
            }

            impl_ule_from_array!(
                $unsigned,
                RawBytesULE<{ size_of::<$unsigned>() }>,
                RawBytesULE([0; { size_of::<$unsigned>() }])
            );
        }

        impl_byte_slice_type!(from_unsigned, $unsigned);
        impl_const_constructors!($unsigned);

        impl_byte_slice_type!(from_signed, $signed);
        impl_const_constructors!($signed);

        $(
            // These impls are actually safe and portable due to Rust always using IEEE 754, see the documentation
            // on f32::from_le_bytes: https://doc.rust-lang.org/stable/std/primitive.f32.html#method.from_le_bytes
            //
            // The only potential problem is that some older platforms treat signaling NaNs differently. This is
            // still quite portable, signalingness is not typically super important.

            // The from_bits documentation mentions that they have identical byte representations to integers
            // and EqULE only cares about LE systems
            impl_byte_slice_type!(from_float, $float);
            impl_const_constructors!($float);
        )?
};
}

macr
```
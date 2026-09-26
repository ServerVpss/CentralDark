# OUTRO - cow.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-0.11.6\src\cow.rs
**SHA:** b82d3e6bd7a3f9e3
**Timestamp:** 2026-08-28T02:37:45.561349
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- /// Safety invariant: Contained slice must be a valid V
- /// Invariant: `raw` must wrap a valid V, either owned or borrowed for 'a

### Principios
- /// Safety invariant: Contained slice must be a valid V
- /// Invariant: `raw` must wrap a valid V, either owned or borrowed for 'a

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use crate::ule::{EncodeAsVarULE, UleError, VarULE};
#[cfg(feature = "alloc")]
use alloc::boxed::Box;
use core::fmt;
use core::marker::PhantomData;
#[cfg(feature = "alloc")]
use core::mem::ManuallyDrop;
use core::ops::Deref;
use core::ptr::NonNull;
use zerofrom::ZeroFrom;

/// Copy-on-write type that efficiently represents [`VarULE`] types as their bitstream representation.
///
/// The primary use case for [`VarULE`] types is the ability to store complex variable-length datastructures
/// inside variable-length collections like [`crate::VarZeroVec`].
///
/// Underlying this ability is the fact that [`VarULE`] types can be efficiently represented as a flat
/// bytestream.
///
/// In zero-copy cases, sometimes one wishes to unconditionally use this bytestream representation, for example
/// to save stack size. A struct with five `Cow<'a, str>`s is not as stack-efficient as a single `Cow` containing
/// the bytestream representation of, say, `Tuple5VarULE<str, str, str, str, str>`.
///
/// This type helps in this case: It is logically a `Cow<'a, V>`, with some optimizations, that is guaranteed
/// to serialize as a byte stream in machine-readable scenarios.
///
/// During human-readable serialization, it will fall back to the serde impls on `V`, which ought to have
/// a human-readable variant.
pub struct VarZeroCow<'a, V: ?Sized> {
    /// Safety invariant: Contained slice must be a valid V
    /// It may or may not have a lifetime valid for 'a, it must be valid for as long as this type is around.
    raw: RawVarZeroCow,
    marker1: PhantomData<&'a V>,
    #[cfg(feature = "alloc")]
    marker2: PhantomData<Box<V>>,
}

/// [`VarZeroCow`] without the `V` to simulate a dropck eyepatch
/// (i.e., prove to rustc that the dtor is not able to observe V or 'a)
///
/// This is effectively `Cow<'a, [u8]>`, with the lifetime managed externally
struct RawVarZeroCow {
    /// Pointer to data
    ///
    /// # Safety Invariants
    ///
    /// 1. This slice must always be valid as a byte slice
    /// 2. If `owned` is true, this slice can be freed.
    /// 3. [`VarZeroCow`], the only user of this type, will impose an additional invariant that the buffer is a valid V
    buf: NonNull<[u8]>,
    /// The buffer is `Box<[u8]>` if true
    #[cfg(feature = "alloc")]
    owned: bool,
    // Safety: We do not need any PhantomDatas here, since the Drop impl does not observe borrowed data
    // if there is any.
}

#[cfg(feature = "alloc")]
impl Drop for RawVarZeroCow {
    fn drop(&mut self) {
        // Note: this drop impl NEVER observes borrowed data (which may have already been cleaned up by the time the impl is called)
        if self.owned {
            unsafe {
                // Safety: (Invariant 2 on buf)
                // since owned is true, this is a valid Box<[u8]> and can be cleaned up
                let _ = Box::<[u8]>::from_raw(self.buf.as_ptr());
            }
        }
    }
}

// This is mostly just a `Cow<[u8]>`, safe to implement Send and Sync on
unsafe impl Send for RawVarZeroCow {}
unsafe impl Sync for RawVarZeroCow {}

impl Clone for RawVarZeroCow {
    fn clone(&self) -> Self {
        #[cfg(feature = "alloc")]
        if self.is_owned() {
            // This clones the box
            let b: Box<[u8]> = self.as_bytes().into();
            let b = ManuallyDrop::new(b);
            let buf: NonNull<[u8]> = (&**b).into();
            return Self {
                // Invariants upheld:
                // 1 & 3: The bytes came from `self` so they're a valid value and byte slice
                // 2: This is owned (we cloned it), so we set owned to true.
                buf,
                owned: true,
            };
        }
        // Unfortunately we can't just use `new_borrowed(self.deref())` since the lifetime is shorter
        Self {
            // Invariants upheld:
            // 1 & 3: The bytes came from `self` so they're a valid value and byte slice
            // 2: This is borrowed (we're sharing a borrow), so we set owned to false.
            buf: self.buf,
            #[cfg(feature = "alloc")]
            owned: false,
        }
    }
}

impl<'a, V: ?Sized> Clone for VarZeroCow<'a, V> {
    fn clone(&self) -> Self {
        let raw = self.raw.clone();
        // Invariant upheld: raw came from a valid VarZeroCow, so it
        // is a valid V
        unsafe { Self::from_raw(raw) }
    }
}

impl<'a, V: VarULE + ?Sized> VarZeroCow<'a, V> {
    /// Construct from a slice. Errors if the slice doesn't represent a valid `V`
    pub fn parse_bytes(bytes: &'a [u8]) -> Result<Self, UleError> {
        let val = V::parse_bytes(bytes)?;
        Ok(Self::new_borrowed(val))
    }

    /// Construct from an owned slice. Errors if the slice doesn't represent a valid `V`
    ///
    /// ✨ *Enabled with the 
```
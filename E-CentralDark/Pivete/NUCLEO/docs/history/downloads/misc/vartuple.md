# OUTRO - vartuple.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-0.11.6\src\ule\vartuple.rs
**SHA:** 781b0efdc1182706
**Timestamp:** 2026-08-28T02:37:46.197898
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: use split_first_chunk_mut in 1.77

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

//! Types to help compose fixed-size [`ULE`] and variable-size [`VarULE`] primitives.
//!
//! This module exports [`VarTuple`] and [`VarTupleULE`], which allow a single sized type and
//! a single unsized type to be stored together as a [`VarULE`].
//!
//! # Examples
//!
//! ```
//! use zerovec::ule::vartuple::{VarTuple, VarTupleULE};
//! use zerovec::VarZeroVec;
//!
//! struct Employee<'a> {
//!     id: u32,
//!     name: &'a str,
//! };
//!
//! let employees = [
//!     Employee {
//!         id: 12345,
//!         name: "Jane Doe",
//!     },
//!     Employee {
//!         id: 67890,
//!         name: "John Doe",
//!     },
//! ];
//!
//! let employees_as_var_tuples = employees
//!     .into_iter()
//!     .map(|x| VarTuple {
//!         sized: x.id,
//!         variable: x.name,
//!     })
//!     .collect::<Vec<_>>();
//!
//! let employees_vzv: VarZeroVec<VarTupleULE<u32, str>> =
//!     employees_as_var_tuples.as_slice().into();
//!
//! assert_eq!(employees_vzv.len(), 2);
//!
//! assert_eq!(employees_vzv.get(0).unwrap().sized.as_unsigned_int(), 12345);
//! assert_eq!(&employees_vzv.get(0).unwrap().variable, "Jane Doe");
//!
//! assert_eq!(employees_vzv.get(1).unwrap().sized.as_unsigned_int(), 67890);
//! assert_eq!(&employees_vzv.get(1).unwrap().variable, "John Doe");
//! ```

use core::mem::{size_of, transmute_copy};
use zerofrom::ZeroFrom;

#[cfg(feature = "alloc")]
use alloc::{borrow::ToOwned, boxed::Box};

use super::{AsULE, EncodeAsVarULE, UleError, VarULE, ULE};

/// A sized type that can be converted to a [`VarTupleULE`].
///
/// See the module for examples.
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Clone)]
#[allow(clippy::exhaustive_structs)] // well-defined type
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct VarTuple<A, B> {
    pub sized: A,
    pub variable: B,
}

/// A dynamically-sized type combining a sized and an unsized type.
///
/// See the module for examples.
#[derive(Debug, PartialEq, Eq, PartialOrd, Ord)]
#[allow(clippy::exhaustive_structs)] // well-defined type
#[repr(C)]
pub struct VarTupleULE<A: AsULE, V: VarULE + ?Sized> {
    pub sized: A::ULE,
    pub variable: V,
}

// # Safety
//
// ## Representation
//
// The type `VarTupleULE` is align(1) because it is repr(C) and its fields
// are all align(1), since they are themselves ULE and VarULE, which have
// this same safety constraint. Further, there is no padding, because repr(C)
// does not add padding when all fields are align(1).
//
// <https://doc.rust-lang.org/reference/type-layout.html#the-c-representation>
//
// Pointers to `VarTupleULE` are fat pointers with metadata equal to the
// metadata of the inner DST field V.
//
// <https://doc.rust-lang.org/stable/std/ptr/trait.Pointee.html>
//
// ## Checklist
//
// Safety checklist for `VarULE`:
//
// 1. align(1): see "Representation" above.
// 2. No padding: see "Representation" above.
// 3. `validate_bytes` checks length and defers to the inner ULEs.
// 4. `validate_bytes` checks length and defers to the inner ULEs.
// 5. `from_bytes_unchecked` returns a fat pointer to the bytes.
// 6. All other methods are left at their default impl.
// 7. The two ULEs have byte equality, so this composition has byte equality.
unsafe impl<A, V> VarULE for VarTupleULE<A, V>
where
    A: AsULE + 'static,
    V: VarULE + ?Sized,
{
    fn validate_bytes(bytes: &[u8]) -> Result<(), UleError> {
        let (sized_chunk, variable_chunk) = bytes
            .split_at_checked(size_of::<A::ULE>())
            .ok_or_else(|| UleError::length::<Self>(bytes.len()))?;
        A::ULE::validate_bytes(sized_chunk)?;
        V::validate_bytes(variable_chunk)?;
        Ok(())
    }

    unsafe fn from_bytes_unchecked(bytes: &[u8]) -> &Self {
        let (_sized_chunk, variable_chunk) = bytes.split_at_unchecked(size_of::<A::ULE>());
        // Safety: variable_chunk is a valid V because of this function's precondition: bytes is a valid Self,
        // and a valid Self contains a valid V after the space needed for A::ULE.
        let variable_ref = V::from_bytes_unchecked(variable_chunk);
        let variable_ptr: *const V = variable_ref;

        // Safety: The DST of VarTupleULE is a pointer to the `sized` element and has a metadata
        // equal to the metadata of the `variable` field (see "Representation" comments on the impl).

        // We should use the pointer metadata APIs here when they are stable: https://github.com/rust-lang/rust/issues/81513
        // For now we rely on all DST metadata being a usize.

        // Extract metadata from V's DST
        // Rust doesn't know that `&V` is a fat pointer so we have to use transmute_copy
        assert_eq!(size_of::<*const V>(), size_of::<(*const u8, usize)>());
        // Safety: We have asserted that t
```
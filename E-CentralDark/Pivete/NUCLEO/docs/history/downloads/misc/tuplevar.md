# OUTRO - tuplevar.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-0.11.6\src\ule\tuplevar.rs
**SHA:** f40b123cfa2511a3
**Timestamp:** 2026-08-28T02:37:46.184597
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Safety invariant: Each "field" $i of the MultiFieldsULE is a valid instance of $t
- // Safety invariant: $i < $len, from the macro invocation

### Principios
- // Safety invariant: Each "field" $i of the MultiFieldsULE is a valid instance of $t
- // Safety invariant: $i < $len, from the macro invocation

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

//! [`VarULE`] impls for tuples.
//!
//! This module exports [`Tuple2VarULE`], [`Tuple3VarULE`], ..., the corresponding [`VarULE`] types
//! of tuples containing purely [`VarULE`] types.
//!
//! This can be paired with [`VarTupleULE`] to make arbitrary combinations of [`ULE`] and [`VarULE`] types.
//!
//! [`VarTupleULE`]: crate::ule::vartuple::VarTupleULE

use super::*;
use crate::varzerovec::{Index16, VarZeroVecFormat};
use core::fmt;
use core::marker::PhantomData;
use zerofrom::ZeroFrom;

macro_rules! tuple_varule {
    // Invocation: Should be called like `tuple_ule!(Tuple2VarULE, 2, [ A a AX 0, B b BX 1 ])`
    //
    // $T is a generic name, $t is a lowercase version of it, $T_alt is an "alternate" name to use when we need two types referring
    // to the same input field, $i is an index.
    //
    // $name is the name of the type, $len MUST be the total number of fields, and then $i must be an integer going from 0 to (n - 1) in sequence
    // (This macro code can rely on $i < $len)
    ($name:ident, $len:literal, [ $($T:ident $t:ident $T_alt: ident $i:tt),+ ]) => {
        #[doc = concat!("VarULE type for tuples with ", $len, " elements. See module docs for more information")]
        #[repr(transparent)]
        #[allow(clippy::exhaustive_structs)] // stable
        pub struct $name<$($T: ?Sized,)+ Format: VarZeroVecFormat = Index16> {
            $($t: PhantomData<$T>,)+
            // Safety invariant: Each "field" $i of the MultiFieldsULE is a valid instance of $t
            //
            // In other words, calling `.get_field::<$T>($i)` is always safe.
            //
            // This invariant is upheld when this type is constructed during VarULE parsing/validation
            multi: MultiFieldsULE<$len, Format>
        }

        impl<$($T: VarULE + ?Sized,)+ Format: VarZeroVecFormat> $name<$($T,)+ Format> {
            $(
                #[doc = concat!("Get field ", $i, "of this tuple")]
                pub fn $t(&self) -> &$T {
                     // Safety: See invariant of `multi`.
                    unsafe {
                        self.multi.get_field::<$T>($i)
                    }
                }


            )+
        }

        // # Safety
        //
        // ## Checklist
        //
        // Safety checklist for `VarULE`:
        //
        // 1. align(1): repr(transparent) around an align(1) VarULE type: MultiFieldsULE
        // 2. No padding: see previous point
        // 3. `validate_bytes` validates that this type is a valid MultiFieldsULE, and that each field is the correct type from the tuple.
        // 4. `validate_bytes` checks length by deferring to the inner ULEs
        // 5. `from_bytes_unchecked` returns a fat pointer to the bytes.
        // 6. All other methods are left at their default impl.
        // 7. The inner ULEs have byte equality, so this composition has byte equality.
        unsafe impl<$($T: VarULE + ?Sized,)+ Format: VarZeroVecFormat> VarULE for $name<$($T,)+ Format>
        {
            fn validate_bytes(bytes: &[u8]) -> Result<(), UleError> {
                // Safety: We validate that this type is the same kind of MultiFieldsULE (with $len, Format)
                // as in the type def
                let multi = <MultiFieldsULE<$len, Format> as VarULE>::parse_bytes(bytes)?;
                $(
                    // Safety invariant: $i < $len, from the macro invocation
                    unsafe {
                        multi.validate_field::<$T>($i)?;
                    }
                )+
                Ok(())
            }

            unsafe fn from_bytes_unchecked(bytes: &[u8]) -> &Self {
                 // Safety: We validate that this type is the same kind of MultiFieldsULE (with $len, Format)
                // as in the type def
                let multi = <MultiFieldsULE<$len, Format> as VarULE>::from_bytes_unchecked(bytes);

                // This type is repr(transparent) over MultiFieldsULE<$len>, so its slices can be transmuted
                // Field invariant upheld here: validate_bytes above validates every field for being the right type
                &*(multi as *const MultiFieldsULE<$len, Format> as *const $name<$($T,)+ Format>)
            }
        }

        impl<$($T: fmt::Debug + VarULE + ?Sized,)+ Format: VarZeroVecFormat> fmt::Debug for $name<$($T,)+ Format> {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
                ($(self.$t(),)+).fmt(f)
            }
        }

        // We need manual impls since `#[derive()]` is disallowed on packed types
        impl<$($T: PartialEq + VarULE + ?Sized,)+ Format: VarZeroVecFormat> PartialEq for $name<$($T,)+ Format> {
            fn eq(&self, other: &Self) -> bool {

                ($(self.$t(),)+).eq(&($(other.$t(),)+
```
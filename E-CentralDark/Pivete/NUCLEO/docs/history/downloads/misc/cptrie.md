# OUTRO - cptrie.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_collections-2.2.0\src\codepointtrie\cptrie.rs
**SHA:** 3d1c54488035c9e0
**Timestamp:** 2026-08-28T02:34:18.639659
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub high_start: u32,
- pub shifted12_high_start: u16,
- /// let start = 0x1_0000;
- /// let submaximal_1_start = start + 0x1234;
- /// let submaximal_2_start = start + 0xffff;
- pub fn get_range(&self, start: u32) -> Option<CodePointMapRange<T>> {
- ///     let exp_start = plane * 0x1_0000;
- /// let start = plane_val * 0x1_0000;
- /// let start = plane_val * 0x1_0000;
- // Initialize `range` to Some(CodePointMapRange{ start: u32::MAX, end: u32::MAX, value: 0}).

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use crate::codepointtrie::error::Error;
use crate::codepointtrie::impl_const::*;

#[cfg(feature = "alloc")]
use crate::codepointinvlist::CodePointInversionList;
use core::char::CharTryFromError;
use core::convert::Infallible;
use core::convert::TryFrom;
use core::fmt::Display;
#[cfg(feature = "alloc")]
use core::iter::FromIterator;
use core::num::TryFromIntError;
use core::ops::RangeInclusive;
use yoke::Yokeable;
use zerofrom::ZeroFrom;
use zerovec::ule::AsULE;
#[cfg(feature = "alloc")]
use zerovec::ule::UleError;
use zerovec::ZeroSlice;
use zerovec::ZeroVec;

/// The type of trie represents whether the trie has an optimization that
/// would make it smaller or faster.
///
/// Regarding performance, a trie being a small or fast type affects the number of array lookups
/// needed for code points in the range `[0x1000, 0x10000)`. In this range, `Small` tries use 4 array lookups,
/// while `Fast` tries use 2 array lookups.
/// Code points before the interval (in `[0, 0x1000)`) will always use 2 array lookups.
/// Code points after the interval (in `[0x10000, 0x10FFFF]`) will always use 4 array lookups.
///
/// Regarding size, `Fast` type tries are larger than `Small` type tries because the minimum size of
/// the index array is larger. The minimum size is the "fast max" limit, which is the limit of the range
/// of code points with 2 array lookups.
///
/// See the document [Unicode Properties and Code Point Tries in ICU4X](https://github.com/unicode-org/icu4x/blob/main/documents/design/properties_code_point_trie.md).
///
/// Also see [`UCPTrieType`](https://unicode-org.github.io/icu-docs/apidoc/dev/icu4c/ucptrie_8h.html) in ICU4C.
#[derive(Clone, Copy, PartialEq, Debug, Eq)]
#[cfg_attr(feature = "serde", derive(serde::Deserialize, serde::Serialize))]
#[cfg_attr(feature = "databake", derive(databake::Bake))]
#[cfg_attr(feature = "databake", databake(path = icu_collections::codepointtrie))]
#[allow(clippy::exhaustive_enums)] // based on a stable serialized form
pub enum TrieType {
    /// Represents the "fast" type code point tries for the
    /// [`TrieType`] trait. The "fast max" limit is set to `0xffff`.
    Fast = 0,
    /// Represents the "small" type code point tries for the
    /// [`TrieType`] trait. The "fast max" limit is set to `0x0fff`.
    Small = 1,
}

// TrieValue trait

// AsULE is AsUnalignedLittleEndian, i.e. "allowed in a zerovec"

/// A trait representing the values stored in the data array of a [`CodePointTrie`].
/// This trait is used as a type parameter in constructing a `CodePointTrie`.
///
/// This trait can be implemented on anything that can be represented as a u32s worth of data.
pub trait TrieValue: Copy + Eq + PartialEq + AsULE + 'static {
    /// Last-resort fallback value to return if we cannot read data from the trie.
    ///
    /// In most cases, the error value is read from the last element of the `data` array,
    /// this value is used for empty codepointtrie arrays
    /// Error type when converting from a u32 to this `TrieValue`.
    type TryFromU32Error: Display;
    /// A parsing function that is primarily motivated by deserialization contexts.
    /// When the serialization type width is smaller than 32 bits, then it is expected
    /// that the call site will widen the value to a `u32` first.
    fn try_from_u32(i: u32) -> Result<Self, Self::TryFromU32Error>;

    /// A method for converting back to a `u32` that can roundtrip through
    /// [`Self::try_from_u32()`]. The default implementation of this trait
    /// method panics in debug mode and returns 0 in release mode.
    ///
    /// This method is allowed to have GIGO behavior when fed a value that has
    /// no corresponding `u32` (since such values cannot be stored in the trie)
    fn to_u32(self) -> u32;
}

macro_rules! impl_primitive_trie_value {
    ($primitive:ty, $error:ty) => {
        impl TrieValue for $primitive {
            type TryFromU32Error = $error;
            fn try_from_u32(i: u32) -> Result<Self, Self::TryFromU32Error> {
                Self::try_from(i)
            }

            #[allow(trivial_numeric_casts)]
            fn to_u32(self) -> u32 {
                // bitcast when the same size, zero-extend/sign-extend
                // when not the same size
                self as u32
            }
        }
    };
}

impl_primitive_trie_value!(u8, TryFromIntError);
impl_primitive_trie_value!(u16, TryFromIntError);
impl_primitive_trie_value!(u32, Infallible);
impl_primitive_trie_value!(i8, TryFromIntError);
impl_primitive_trie_value!(i16, TryFromIntError);
impl_primitive_trie_value!(i32, TryFromIntError);
impl_primitive_trie_value!(char, CharTryFromError);

/// Helper function used by [`get_range`]. Converts occurrences of trie's null
/// value into the provided `null_value`.
///
/// Note:
```
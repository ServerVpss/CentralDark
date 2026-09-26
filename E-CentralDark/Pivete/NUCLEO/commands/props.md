# COMANDO - props.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties-2.2.0\src\props.rs
**SHA:** 69c760a1a9a680d3
**Timestamp:** 2026-08-28T02:34:23.478801
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const AksaraStart: LineBreak = LineBreak(45); // name="AS"
- /// let id_start = CodePointSetData::new::<IdStart>();
- /// let xid_start = CodePointSetData::new::<XidStart>();

### Contratos
- Surrogate = 18,
- pub const Surrogate: GeneralCategoryGroup = GCG(1 << (GC::Surrogate as u32));
- pub const Surrogate: LineBreak = LineBreak(25); // name="SG"

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

//! This module defines all available properties.
//!
//! Properties may be empty marker types and implement [`BinaryProperty`], or enumerations[^1]
//! and implement [`EnumeratedProperty`].
//!
//! [`BinaryProperty`]s are queried through a [`CodePointSetData`](crate::CodePointSetData),
//! while [`EnumeratedProperty`]s are queried through [`CodePointMapData`](crate::CodePointMapData).
//!
//! In addition, some [`EnumeratedProperty`]s also implement [`ParseableEnumeratedProperty`] or
//! [`NamedEnumeratedProperty`]. For these properties, [`PropertyParser`](crate::PropertyParser),
//! [`PropertyNamesLong`](crate::PropertyNamesLong), and [`PropertyNamesShort`](crate::PropertyNamesShort)
//! can be constructed.
//!
//! [^1]: either Rust `enum`s, or Rust `struct`s with associated constants (open enums)

pub use crate::names::{NamedEnumeratedProperty, ParseableEnumeratedProperty};

pub use crate::bidi::{BidiMirroringGlyph, BidiPairedBracketType};

/// See [`test_enumerated_property_completeness`] for usage.
/// Example input:
/// ```ignore
/// impl EastAsianWidth {
///     pub const Neutral: EastAsianWidth = EastAsianWidth(0);
///     pub const Ambiguous: EastAsianWidth = EastAsianWidth(1);
///     ...
/// }
/// ```
/// Produces `const ALL_VALUES = &[("Neutral", 0u16), ...];` by
/// explicitly casting first field of the struct to u16.
macro_rules! create_const_array {
    (
        $ ( #[$meta:meta] )*
        impl $enum_ty:ident {
            $( $(#[$const_meta:meta])* $v:vis const $i:ident: $t:ty = $e:expr; )*
        }
        #[test]
        fn $consts_test:ident();
    ) => {
        $( #[$meta] )*
        impl $enum_ty {
            $(
                $(#[$const_meta])*
                $v const $i: $t = $e;
            )*

            /// All possible values of this enum in the Unicode version
            /// from this ICU4X release.
            pub const ALL_VALUES: &'static [$enum_ty] = &[
                $($enum_ty::$i),*
            ];
        }

        #[cfg(feature = "datagen")]
        impl databake::Bake for $enum_ty {
            fn bake(&self, env: &databake::CrateEnv) -> databake::TokenStream {
                env.insert("icu_properties");
                match *self {
                    $(
                        Self::$i => databake::quote!(icu_properties::props::$enum_ty::$i),
                    )*
                    Self(v) => databake::quote!(icu_properties::props::$enum_ty::from_icu4c_value(#v)),
                }
            }
        }


        impl From<$enum_ty> for u16  {
            #[allow(trivial_numeric_casts)]
            fn from(other: $enum_ty) -> Self {
                other.0 as u16
            }
        }

        #[test]
        fn $consts_test() {
            $(
                assert_eq!(
                    crate::names::PropertyNamesLong::<$enum_ty>::new().get($enum_ty::$i).unwrap()
                        // Rust identifiers use camel case
                        .replace('_', "")
                        // We use Ethiopian
                        .replace("Ethiopic", "Ethiopian")
                        // Nastaliq is missing a long name?
                        .replace("Aran", "Nastaliq")
                        // We spell these out
                        .replace("LVSyllable", "LeadingVowelSyllable")
                        .replace("LVTSyllable", "LeadingVowelTrailingSyllable"),
                    stringify!($i)
                );
            )*
        }
    }
}

pub use crate::code_point_map::EnumeratedProperty;

macro_rules! make_enumerated_property {
    (
        name: $name:literal;
        short_name: $short_name:literal;
        ident: $value_ty:path;
        data_marker: $data_marker:ty;
        singleton: $singleton:ident;
        $(ule_ty: $ule_ty:ty;)?
    ) => {
        impl crate::private::Sealed for $value_ty {}

        impl EnumeratedProperty for $value_ty {
            type DataMarker = $data_marker;
            #[cfg(feature = "compiled_data")]
            const SINGLETON: &'static crate::provider::PropertyCodePointMap<'static, Self> =
                crate::provider::Baked::$singleton;
            const NAME: &'static [u8] = $name.as_bytes();
            const SHORT_NAME: &'static [u8] = $short_name.as_bytes();
        }

        $(
            impl zerovec::ule::AsULE for $value_ty {
                type ULE = $ule_ty;

                fn to_unaligned(self) -> Self::ULE {
                    self.0.to_unaligned()
                }
                fn from_unaligned(unaligned: Self::ULE) -> Self {
                    Self(zerovec::ule::AsULE::from_unaligned(unaligned))
                }
            }
        )?
    };
}

/// Enumerated property `Bidi_Class`
///
/// These are the categories required by the Unicode Bidirectional Algorithm.

```
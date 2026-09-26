# COMANDO - macros.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cssparser-0.36.0\src\macros.rs
**SHA:** 64ad9e506e5cea52
**Timestamp:** 2026-08-28T02:33:38.691596
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- $( $pattern: pat )|+ $( if $guard: expr )? => $then: expr

### Ouro Bruto (primeiros 5000 chars)
```
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

use std::mem::MaybeUninit;

/// Expands to a `match` expression with string patterns,
/// matching case-insensitively in the ASCII range.
///
/// The patterns must not contain ASCII upper case letters. (They must be already be lower-cased.)
///
/// # Example
///
/// ```rust
/// # fn main() {}  // Make doctest not wrap everything in its own main
/// # fn dummy(function_name: &String) { let _ =
/// cssparser::match_ignore_ascii_case! { &function_name,
///     "rgb" => parse_rgb(..),
/// #   #[cfg(not(something))]
///     "rgba" => parse_rgba(..),
///     "hsl" => parse_hsl(..),
///     "hsla" => parse_hsla(..),
///     _ => Err(format!("unknown function: {}", function_name))
/// }
/// # ;}
/// # use std::ops::RangeFull;
/// # fn parse_rgb(_: RangeFull) -> Result<(), String> { Ok(()) }
/// # fn parse_rgba(_: RangeFull) -> Result<(), String> { Ok(()) }
/// # fn parse_hsl(_: RangeFull) -> Result<(), String> { Ok(()) }
/// # fn parse_hsla(_: RangeFull) -> Result<(), String> { Ok(()) }
/// ```
#[macro_export]
macro_rules! match_ignore_ascii_case {
    ( $input:expr,
        $(
            $( #[$meta: meta] )*
            $( $pattern: pat )|+ $( if $guard: expr )? => $then: expr
        ),+
        $(,)?
    ) => {
        {
            // This dummy module works around the feature gate
            // `error[E0658]: procedural macros cannot be expanded to statements`
            // by forcing the macro to be in an item context
            // rather than expression/statement context,
            // even though the macro only expands to items.
            mod cssparser_internal {
                $crate::_cssparser_internal_max_len! {
                    $( $( $pattern )+ )+
                }
            }
            $crate::_cssparser_internal_to_lowercase!($input, cssparser_internal::MAX_LENGTH => lowercase);
            // "A" is a short string that we know is different for every string pattern,
            // since we’ve verified that none of them include ASCII upper case letters.
            match lowercase.unwrap_or("A") {
                $(
                    $( #[$meta] )*
                    $( $pattern )|+ $( if $guard )? => $then,
                )+
            }
        }
    };
}

/// Define a function `$name(&str) -> Option<&'static $ValueType>`
///
/// The function finds a match for the input string
/// in a [`phf` map](https://github.com/sfackler/rust-phf)
/// and returns a reference to the corresponding value.
/// Matching is case-insensitive in the ASCII range.
///
/// ## Example:
///
/// ```rust
/// # fn main() {}  // Make doctest not wrap everything in its own main
///
/// fn color_rgb(input: &str) -> Option<(u8, u8, u8)> {
///     cssparser::ascii_case_insensitive_phf_map! {
///         keywords -> (u8, u8, u8) = {
///             "red" => (255, 0, 0),
///             "green" => (0, 255, 0),
///             "blue" => (0, 0, 255),
///         }
///     }
///     keywords::get(input).cloned()
/// }
/// ```
///
/// You can also iterate over the map entries by using `keywords::entries()`.
#[macro_export]
macro_rules! ascii_case_insensitive_phf_map {
    ($name: ident -> $ValueType: ty = { $( $key: tt => $value: expr ),+ }) => {
        ascii_case_insensitive_phf_map!($name -> $ValueType = { $( $key => $value, )+ })
    };
    ($name: ident -> $ValueType: ty = { $( $key: tt => $value: expr, )+ }) => {
        use $crate::_cssparser_internal_phf as phf;

        // See macro above for context.
        mod cssparser_internal {
            $crate::_cssparser_internal_max_len! {
                $( $key )+
            }
        }

        static MAP: phf::Map<&'static str, $ValueType> = phf::phf_map! {
            $(
                $key => $value,
            )*
        };

        // While the obvious choice for this would be an inner module, it's not possible to
        // reference from types from there, see:
        // <https://github.com/rust-lang/rust/issues/114369>
        //
        // So we abuse a struct with static associated functions instead.
        #[allow(non_camel_case_types)]
        struct $name;
        impl $name {
            #[allow(dead_code)]
            fn entries() -> impl Iterator<Item = (&'static &'static str, &'static $ValueType)> {
                MAP.entries()
            }

            fn get(input: &str) -> Option<&'static $ValueType> {
                $crate::_cssparser_internal_to_lowercase!(input, cssparser_internal::MAX_LENGTH => lowercase);
                MAP.get(lowercase?)
            }
        }
    }
}

/// Create a new array of MaybeUninit<T> items, in an uninitialized state.
#[inline(always)]
pub fn _cssparser_internal_create_uninit_array<const N: usize>() -> [MaybeUninit<u8>; N] {
    unsafe {
        // SAFETY: An uninitialized `[MaybeUninit<_>; LEN]` is 
```
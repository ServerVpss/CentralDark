# OUTRO - macros.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml-0.9.12+spec-1.1.0\src\macros.rs
**SHA:** 91a1469399c44685
**Timestamp:** 2026-08-28T02:36:24.360359
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Implement this with something like serde_json::to_value instead.

### Ouro Bruto (primeiros 5000 chars)
```
pub use serde_core::de::{Deserialize, IntoDeserializer};

use crate::alloc_prelude::*;
use crate::value::{Array, Table, Value};

/// Construct a [`Table`] from TOML syntax.
///
/// ```rust
/// let cargo_toml = toml::toml! {
///     [package]
///     name = "toml"
///
///     [dependencies]
///     serde = "1.0"
///
///     [dev-dependencies]
///     serde_derive = "1.0"
///     serde_json = "1.0"
/// };
///
/// println!("{:#?}", cargo_toml);
/// ```
#[macro_export]
macro_rules! toml {
    ($($toml:tt)+) => {{
        let table = $crate::value::Table::new();
        let mut root = $crate::Value::Table(table);
        $crate::toml_internal!(@toplevel root [] $($toml)+);
        match root {
            $crate::Value::Table(table) => table,
            _ => unreachable!(),
        }
    }};
}

// TT-muncher to parse TOML syntax into a toml::Value.
//
//    @toplevel -- Parse tokens outside of an inline table or inline array. In
//                 this state, `[table headers]` and `[[array headers]]` are
//                 allowed and `key = value` pairs are not separated by commas.
//
//    @topleveldatetime -- Helper to parse a Datetime from string and insert it
//                 into a table, continuing in the @toplevel state.
//
//    @path -- Turn a path segment into a string. Segments that look like idents
//                 are stringified, while quoted segments like `"cfg(windows)"`
//                 are not.
//
//    @value -- Parse the value part of a `key = value` pair, which may be a
//                 primitive or inline table or inline array.
//
//    @table -- Parse the contents of an inline table, returning them as a
//                 toml::Value::Table.
//
//    @tabledatetime -- Helper to parse a Datetime from string and insert it
//                 into a table, continuing in the @table state.
//
//    @array -- Parse the contents of an inline array, returning them as a
//                 toml::Value::Array.
//
//    @arraydatetime -- Helper to parse a Datetime from string and push it into
//                 an array, continuing in the @array state.
//
//    @trailingcomma -- Helper to append a comma to a sequence of tokens if the
//                 sequence is non-empty and does not already end in a trailing
//                 comma.
//
#[macro_export]
#[doc(hidden)]
macro_rules! toml_internal {
    // Base case, no elements remaining.
    (@toplevel $root:ident [$($path:tt)*]) => {};

    // Parse negative number `key = -value`.
    (@toplevel $root:ident [$($path:tt)*] $($($k:tt)-+).+ = - $v:tt $($rest:tt)*) => {
        $crate::toml_internal!(@toplevel $root [$($path)*] $($($k)-+).+ = (-$v) $($rest)*);
    };

    // Parse positive number `key = +value`.
    (@toplevel $root:ident [$($path:tt)*] $($($k:tt)-+).+ = + $v:tt $($rest:tt)*) => {
        $crate::toml_internal!(@toplevel $root [$($path)*] $($($k)-+).+ = ($v) $($rest)*);
    };

    // Parse offset datetime `key = 1979-05-27T00:32:00.999999-07:00`.
    (@toplevel $root:ident [$($path:tt)*] $($($k:tt)-+).+ = $yr:tt - $mo:tt - $dhr:tt : $min:tt : $sec:tt . $frac:tt - $tzh:tt : $tzm:tt $($rest:tt)*) => {
        $crate::toml_internal!(@topleveldatetime $root [$($path)*] $($($k)-+).+ = ($yr - $mo - $dhr : $min : $sec . $frac - $tzh : $tzm) $($rest)*);
    };
    // Space instead of T.
    (@toplevel $root:ident [$($path:tt)*] $($($k:tt)-+).+ = $yr:tt - $mo:tt - $day:tt $hr:tt : $min:tt : $sec:tt . $frac:tt - $tzh:tt : $tzm:tt $($rest:tt)*) => {
        $crate::toml_internal!(@topleveldatetime $root [$($path)*] $($($k)-+).+ = ($yr - $mo - $day T $hr : $min : $sec . $frac - $tzh : $tzm) $($rest)*);
    };

    // Parse offset datetime `key = 1979-05-27T00:32:00-07:00`.
    (@toplevel $root:ident [$($path:tt)*] $($($k:tt)-+).+ = $yr:tt - $mo:tt - $dhr:tt : $min:tt : $sec:tt - $tzh:tt : $tzm:tt $($rest:tt)*) => {
        $crate::toml_internal!(@topleveldatetime $root [$($path)*] $($($k)-+).+ = ($yr - $mo - $dhr : $min : $sec - $tzh : $tzm) $($rest)*);
    };
    // Space instead of T.
    (@toplevel $root:ident [$($path:tt)*] $($($k:tt)-+).+ = $yr:tt - $mo:tt - $day:tt $hr:tt : $min:tt : $sec:tt - $tzh:tt : $tzm:tt $($rest:tt)*) => {
        $crate::toml_internal!(@topleveldatetime $root [$($path)*] $($($k)-+).+ = ($yr - $mo - $day T $hr : $min : $sec - $tzh : $tzm) $($rest)*);
    };

    // Parse local datetime `key = 1979-05-27T00:32:00.999999`.
    (@toplevel $root:ident [$($path:tt)*] $($($k:tt)-+).+ = $yr:tt - $mo:tt - $dhr:tt : $min:tt : $sec:tt . $frac:tt $($rest:tt)*) => {
        $crate::toml_internal!(@topleveldatetime $root [$($path)*] $($($k)-+).+ = ($yr - $mo - $dhr : $min : $sec . $frac) $($rest)*);
    };
    // Space instead of T.
    (@toplevel $root:ident [$($path:tt)*] $($($k:tt)-+).+ = $yr:tt - $mo:tt - $day:tt $hr:tt : $min:tt : $sec:tt . $frac:tt $($rest:tt)*) => {
        $crate::toml_internal!(@topleveldatetime $root [$($path)*] $($($k)-+).+ = ($yr - $mo - $day T $hr : $min : $sec . $frac) $($rest)*);
    };

 
```
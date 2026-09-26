# COMANDO - with_suffix.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_with-3.21.0\src\with_suffix.rs
**SHA:** e03c01033e846a57
**Timestamp:** 2026-08-28T02:35:34.355011
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- delegate: serializer,
- delegate: deserializer,
- pub delegate: T,
- delegate: serializer,
- delegate: value,
- delegate: self.delegate.serialize_map(len)?,
- delegate: key,
- delegate: key,
- delegate: deserializer,
- delegate: visitor,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::prelude::*;

/// Serialize with an added suffix on every field name and deserialize by
/// trimming away the suffix.
///
/// You can set the visibility of the generated module by suffixing the module name with a module visibility.
/// `with_suffix!(pub(crate) suffix_foo "_foo");` creates a module with `pub(crate)` visibility.
/// The visibility is optional and by default `pub(self)`, i.e., private visibility is assumed.
///
/// **Note:** Use of this macro is incompatible with applying the [`deny_unknown_fields`] attribute
/// on the container.
/// While deserializing, it will always warn about unknown fields, even though they are processed
/// by the `with_suffix` wrapper.
/// More details can be found in [this issue][issue-with_suffix-deny_unknown_fields].
///
/// # Example
///
/// [Factorio Prototype tables] like to use suffixes to group related fields. In
/// simplified form, their JSON representation may resemble the following:
///
/// [Factorio Prototype tables]: https://lua-api.factorio.com/2.0.13/types/PipePictures.html
///
/// ```json
/// {
///   "frames": 4,
///   "spritesheet": "normal",
///   "frames_frozen": 1,
///   "spritesheet_frozen": "frozen",
///   "frames_visualization": 2,
///   "spritesheet_visualization": "vis",
/// }
/// ```
///
/// In Rust, we would ideally like to model this data as a couple of `SpriteData`
/// structs, rather than repeating the fields of `SpriteData` for each suffix.
///
/// ```rust
/// # #[allow(dead_code)]
/// struct Graphics {
///     normal: SpriteData,
///     frozen: SpriteData,
///     visualization: SpriteData,
/// }
///
/// # #[allow(dead_code)]
/// struct SpriteData {
///     frames: u64,
///     spritesheet: String,
/// }
/// ```
///
/// This `with_suffix!` macro produces an adapter that adds a suffix onto field
/// names during serialization and trims away the suffix during deserialization.
/// An implementation for the mentioned situation would use `with_suffix!` like this:
///
/// ```rust
/// use serde::{Deserialize, Serialize};
/// use serde_with::with_suffix;
///
/// #[derive(Serialize, Deserialize)]
/// struct Graphics {
///     #[serde(flatten)]
///     normal: SpriteData,
///     #[serde(flatten, with = "suffix_frozen")]
///     frozen: SpriteData,
///     #[serde(flatten, with = "suffix_visualization")]
///     visualization: SpriteData,
/// }
///
/// #[derive(Serialize, Deserialize)]
/// struct SpriteData {
///     frames: u64,
///     spritesheet: String,
/// }
///
/// with_suffix!(suffix_frozen "_frozen");
/// // You can also set the visibility of the generated suffix module, the default is private.
/// with_suffix!(pub suffix_visualization "_visualization");
/// #
/// # const EXPECTED: &str = r#"{
/// #   "frames": 4,
/// #   "spritesheet": "normal",
/// #   "frames_frozen": 1,
/// #   "spritesheet_frozen": "frozen",
/// #   "frames_visualization": 2,
/// #   "spritesheet_visualization": "vis"
/// # }"#;
///
/// fn main() {
///     let g = Graphics {
///         normal: SpriteData {
///             frames: 4,
///             spritesheet: "normal".to_owned(),
///         },
///         frozen: SpriteData {
///             frames: 1,
///             spritesheet: "frozen".to_owned(),
///         },
///         visualization: SpriteData {
///             frames: 2,
///             spritesheet: "vis".to_owned(),
///         },
///     };
///
///     let j = serde_json::to_string_pretty(&g).unwrap();
///     println!("{}", j);
/// #
/// #     assert_eq!(j, EXPECTED);
/// }
/// ```
///
/// [`deny_unknown_fields`]: https://serde.rs/container-attrs.html#deny_unknown_fields
/// [issue-with_suffix-deny_unknown_fields]: https://github.com/jonasbb/serde_with/issues/57
#[macro_export]
macro_rules! with_suffix {
    ($module:ident $suffix:expr) => {$crate::with_suffix!(pub(self) $module $suffix);};
    ($vis:vis $module:ident $suffix:expr) => {
        $vis mod $module {
            use $crate::__private__::{Deserialize, Deserializer, Serialize, Serializer};
            use $crate::with_suffix::WithSuffix;

            #[allow(dead_code)]
            pub fn serialize<T, S>(object: &T, serializer: S) -> $crate::__private__::Result<S::Ok, S::Error>
            where
                T: Serialize,
                S: Serializer,
            {
                object.serialize(WithSuffix {
                    delegate: serializer,
                    suffix: $suffix,
                })
            }

            #[allow(dead_code)]
            pub fn deserialize<'de, T, D>(deserializer: D) -> $crate::__private__::Result<T, D::Error>
            where
                T: Deserialize<'de>,
                D: Deserializer<'de>,
            {
                T::deserialize(WithSuffix {
                    delegate: deserializer,
                    suffix: $suffix,
                })
            }
        }
    };
}

pub struct WithSuffix<'a, T> {
    pub delegate: T,
    pub suffix: &'a str,
}

impl<T> Serialize for WithSuffix<'_, T>
where
    T: Serialize
```
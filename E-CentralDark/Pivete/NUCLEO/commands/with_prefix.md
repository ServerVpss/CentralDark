# COMANDO - with_prefix.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_with-3.21.0\src\with_prefix.rs
**SHA:** 57e2ab9e89070e57
**Timestamp:** 2026-08-28T02:35:34.327548
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

/// Serialize with an added prefix on every field name and deserialize by
/// trimming away the prefix.
///
/// You can set the visibility of the generated module by prefixing the module name with a module visibility.
/// `with_prefix!(pub(crate) prefix_foo "foo_");` creates a module with `pub(crate)` visibility.
/// The visibility is optional and by default `pub(self)`, i.e., private visibility is assumed.
///
/// **Note:** Use of this macro is incompatible with applying the [`deny_unknown_fields`] attribute
/// on the container.
/// While deserializing, it will always warn about unknown fields, even though they are processed
/// by the `with_prefix` wrapper.
/// More details can be found in [this issue][issue-with_prefix-deny_unknown_fields].
///
/// # Example
///
/// The [Challonge REST API] likes to use prefixes to group related fields. In
/// simplified form, their JSON may resemble the following:
///
/// [Challonge REST API]: https://api.challonge.com/v1/documents/matches/show
///
/// ```json
/// {
///   "player1_name": "name1",
///   "player1_votes": 1,
///   "player2_name": "name2",
///   "player2_votes": 2
/// }
/// ```
///
/// In Rust, we would ideally like to model this data as a pair of `Player`
/// structs, rather than repeating the fields of `Player` for each prefix.
///
/// ```rust
/// # #[allow(dead_code)]
/// struct Match {
///     player1: Player,
///     player2: Player,
/// }
///
/// # #[allow(dead_code)]
/// struct Player {
///     name: String,
///     votes: u64,
/// }
/// ```
///
/// This `with_prefix!` macro produces an adapter that adds a prefix onto field
/// names during serialization and trims away the prefix during deserialization.
/// An implementation of the Challonge API would use `with_prefix!` like this:
///
/// ```rust
/// use serde::{Deserialize, Serialize};
/// use serde_with::with_prefix;
///
/// #[derive(Serialize, Deserialize)]
/// struct Match {
///     #[serde(flatten, with = "prefix_player1")]
///     player1: Player,
///     #[serde(flatten, with = "prefix_player2")]
///     player2: Player,
/// }
///
/// #[derive(Serialize, Deserialize)]
/// struct Player {
///     name: String,
///     votes: u64,
/// }
///
/// with_prefix!(prefix_player1 "player1_");
/// // You can also set the visibility of the generated prefix module, the default is private.
/// with_prefix!(pub prefix_player2 "player2_");
/// #
/// # const EXPECTED: &str = r#"{
/// #   "player1_name": "name1",
/// #   "player1_votes": 1,
/// #   "player2_name": "name2",
/// #   "player2_votes": 2
/// # }"#;
///
/// fn main() {
///     let m = Match {
///         player1: Player {
///             name: "name1".to_owned(),
///             votes: 1,
///         },
///         player2: Player {
///             name: "name2".to_owned(),
///             votes: 2,
///         },
///     };
///
///     let j = serde_json::to_string_pretty(&m).unwrap();
///     println!("{}", j);
/// #
/// #     assert_eq!(j, EXPECTED);
/// }
/// ```
///
/// [`deny_unknown_fields`]: https://serde.rs/container-attrs.html#deny_unknown_fields
/// [issue-with_prefix-deny_unknown_fields]: https://github.com/jonasbb/serde_with/issues/57
#[macro_export]
macro_rules! with_prefix {
    ($module:ident $prefix:expr) => {$crate::with_prefix!(pub(self) $module $prefix);};
    ($vis:vis $module:ident $prefix:expr) => {
        $vis mod $module {
            use $crate::__private__::{Deserialize, Deserializer, Serialize, Serializer};
            use $crate::with_prefix::WithPrefix;

            #[allow(dead_code)]
            pub fn serialize<T, S>(object: &T, serializer: S) -> $crate::__private__::Result<S::Ok, S::Error>
            where
                T: Serialize,
                S: Serializer,
            {
                object.serialize(WithPrefix {
                    delegate: serializer,
                    prefix: $prefix,
                })
            }

            #[allow(dead_code)]
            pub fn deserialize<'de, T, D>(deserializer: D) -> $crate::__private__::Result<T, D::Error>
            where
                T: Deserialize<'de>,
                D: Deserializer<'de>,
            {
                T::deserialize(WithPrefix {
                    delegate: deserializer,
                    prefix: $prefix,
                })
            }
        }
    };
}

pub struct WithPrefix<'a, T> {
    pub delegate: T,
    pub prefix: &'a str,
}

impl<T> Serialize for WithPrefix<'_, T>
where
    T: Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.delegate.serialize(WithPrefix {
            delegate: serializer,
            prefix: self.prefix,
        })
    }
}

impl<'a, S> Serializer for WithPrefix<'a, S>
where
    S: Serializer,
{
    type Ok = S::Ok;
    type Error = S::Error;
    type SerializeSeq = Impossible<Self::Ok, Self::Error>;
    type SerializeTuple = Impossible<Self::Ok, Self::Error>;
    type SerializeTupleStruct
```
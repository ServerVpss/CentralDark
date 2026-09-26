# COMANDO - enum_map.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_with-3.21.0\src\enum_map.rs
**SHA:** d35ae2a3eb1a23e4
**Timestamp:** 2026-08-28T02:35:34.104770
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- delegate: map,
- delegate: M,
- delegate: &mut self.delegate,
- delegate: &'a mut M,
- delegate: self.delegate,
- delegate: self.delegate,
- delegate: &'a mut M,
- delegate: M,
- delegate: &mut self.delegate,
- delegate: M,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::{
    content::ser::{Content, ContentSerializer},
    prelude::*,
};

/// Represent a list of enum values as a map.
///
/// This **only works** if the enum uses the default *externally tagged* representation.
/// Other enum representations are not supported.
///
/// serde data formats often represent *externally tagged* enums as maps with a single key.
/// The key is the enum variant name, and the value is the variant value.
/// Sometimes a map with multiple keys should be treated like a list of enum values.
///
/// # Examples
///
/// ## JSON Map with multiple keys
///
/// ```rust
/// # #[cfg(feature = "macros")] {
/// # use serde::{Deserialize, Serialize};
/// use serde_with::{serde_as, EnumMap};
///
/// # #[derive(Debug, Clone, PartialEq, Eq)]
/// #[derive(Serialize, Deserialize)]
/// enum EnumValue {
///     Int(i32),
///     String(String),
///     Unit,
///     Tuple(i32, String, bool),
///     Struct {
///         a: i32,
///         b: String,
///         c: bool,
///     },
/// }
///
/// #[serde_as]
/// # #[derive(Debug, Clone, PartialEq, Eq)]
/// #[derive(Serialize, Deserialize)]
/// struct VecEnumValues (
///     #[serde_as(as = "EnumMap")]
///     Vec<EnumValue>,
/// );
///
/// // ---
///
/// // This will serialize this list of values
/// let values = VecEnumValues(vec![
///     EnumValue::Int(123),
///     EnumValue::String("FooBar".to_string()),
///     EnumValue::Int(456),
///     EnumValue::String("XXX".to_string()),
///     EnumValue::Unit,
///     EnumValue::Tuple(1, "Middle".to_string(), false),
///     EnumValue::Struct {
///         a: 666,
///         b: "BBB".to_string(),
///         c: true,
///     },
/// ]);
///
/// // into this JSON map
/// // Duplicate keys are emitted for identical enum variants.
/// let expected =
/// r#"{
///   "Int": 123,
///   "String": "FooBar",
///   "Int": 456,
///   "String": "XXX",
///   "Unit": null,
///   "Tuple": [
///     1,
///     "Middle",
///     false
///   ],
///   "Struct": {
///     "a": 666,
///     "b": "BBB",
///     "c": true
///   }
/// }"#;
///
/// // Both serialization and deserialization work flawlessly.
/// let serialized = serde_json::to_string_pretty(&values).unwrap();
/// assert_eq!(expected, serialized);
/// let deserialized: VecEnumValues = serde_json::from_str(&serialized).unwrap();
/// assert_eq!(values, deserialized);
/// # }
/// ```
///
/// ## XML structure with varying keys
///
/// With `serde_xml_rs` tuple and struct variants are not supported since they fail to roundtrip.
/// The enum may have such variants as long as they are not serialized or deserialized.
///
/// ```
/// # #[cfg(feature = "macros")] {
/// # use serde::{Deserialize, Serialize};
/// use serde_with::{serde_as, EnumMap};
///
/// # #[derive(Debug, Clone, PartialEq, Eq)]
/// #[derive(Serialize, Deserialize)]
/// enum EnumValue {
///     Int(i32),
///     String(String),
///     Unit,
/// }
///
/// #[serde_as]
/// # #[derive(Debug, Clone, PartialEq, Eq)]
/// #[derive(Serialize, Deserialize)]
/// struct VecEnumValues {
///     #[serde_as(as = "EnumMap")]
///     vec: Vec<EnumValue>,
/// }
///
/// // ---
///
/// // This will serialize this list of values
/// let values = VecEnumValues {
///     vec: vec![
///         EnumValue::Int(123),
///         EnumValue::String("FooBar".to_string()),
///         EnumValue::Int(456),
///         EnumValue::String("XXX".to_string()),
///         EnumValue::Unit,
///     ],
/// };
///
/// // into this XML document
/// // Duplicate keys are emitted for identical enum variants.
/// let expected = r#"
/// <?xml version="1.0" encoding="utf-8"?>
/// <VecEnumValues>
///     <vec>
///         <Int>123</Int>
///         <String>FooBar</String>
///         <Int>456</Int>
///         <String>XXX</String>
///         <Unit />
///     </vec>
/// </VecEnumValues>"#
/// // Remove whitespace
/// .replace("    ", "")
/// .replace('\n', "");
///
/// // Both serialization and deserialization work flawlessly.
/// let serialized = serde_xml_rs::to_string(&values).unwrap();
/// assert_eq!(expected, serialized);
/// let deserialized: VecEnumValues = serde_xml_rs::from_str(&serialized).unwrap();
/// assert_eq!(values, deserialized);
/// # }
/// ```
pub struct EnumMap;

impl<T> SerializeAs<Vec<T>> for EnumMap
where
    T: Serialize,
{
    fn serialize_as<S>(source: &Vec<T>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        source.serialize(SeqAsMapSerializer(serializer))
    }
}

impl<'de, T> DeserializeAs<'de, Vec<T>> for EnumMap
where
    T: Deserialize<'de>,
{
    fn deserialize_as<D>(deserializer: D) -> Result<Vec<T>, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct EnumMapVisitor<T> {
            is_human_readable: bool,
            phantom: PhantomData<T>,
        }

        impl<'de, T> Visitor<'de> for EnumMapVisitor<T>
        where
            T: Deserialize<'de>,
        {
            type Value = Vec<T>;

            fn expecting(&self, formatter: &mut fmt::Formatte
```
# COMANDO - simple_type.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\de\simple_type.rs
**SHA:** c2c993ea10f41499
**Timestamp:** 2026-08-28T02:35:01.060548
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = string.as_bytes().iter().position(|ch| *ch != DELIMITER);

### Ouro Bruto (primeiros 5000 chars)
```
//! Contains Serde `Deserializer` for XML [simple types] [as defined] in the XML Schema.
//!
//! [simple types]: https://www.w3schools.com/xml/el_simpletype.asp
//! [as defined]: https://www.w3.org/TR/xmlschema11-1/#Simple_Type_Definition

use crate::de::Text;
use crate::encoding::Decoder;
use crate::errors::serialize::DeError;
use crate::escape::resolve_predefined_entity;
use crate::utils::{trim_xml_spaces, CowRef};
use crate::XmlVersion;
use memchr::memchr;
use serde::de::value::UnitDeserializer;
use serde::de::{
    DeserializeSeed, Deserializer, EnumAccess, IntoDeserializer, SeqAccess, VariantAccess, Visitor,
};
use std::borrow::Cow;
use std::ops::Range;

macro_rules! deserialize_num {
    ($method:ident => $visit:ident) => {
        #[inline]
        fn $method<V>(self, visitor: V) -> Result<V::Value, Self::Error>
        where
            V: Visitor<'de>,
        {
            let text: &str = self.content.as_ref();
            match trim_xml_spaces(text).parse() {
                Ok(number) => visitor.$visit(number),
                Err(_) => self.deserialize_str(visitor),
            }
        }
    };
}

macro_rules! deserialize_primitive {
    ($method:ident) => {
        fn $method<V>(self, visitor: V) -> Result<V::Value, Self::Error>
        where
            V: Visitor<'de>,
        {
            let de = AtomicDeserializer {
                content: self.content()?,
            };
            de.$method(visitor)
        }
    };
}

macro_rules! unsupported {
    (
        $deserialize:ident
        $(
            ($($type:ty),*)
        )?
    ) => {
        #[inline]
        fn $deserialize<V: Visitor<'de>>(
            self,
            $($(_: $type,)*)?
            visitor: V
        ) -> Result<V::Value, Self::Error> {
            // Deserializer methods are only hints, if deserializer could not satisfy
            // request, it should return the data that it has. It is responsibility
            // of a Visitor to return an error if it does not understand the data
            self.deserialize_str(visitor)
        }
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/// A version of [`Cow`] that can borrow from two different buffers, one of them
/// is a deserializer input, and conceptually contains only part of owned data.
///
/// # Lifetimes
/// - `'de` -- lifetime of the data that deserializer borrow from the parsed input
/// - `'a` -- lifetime of the data that owned by a deserializer
enum Content<'de, 'a> {
    /// An input borrowed from the parsed data
    Input(&'de str),
    /// An input borrowed from the buffer owned by another deserializer
    Slice(&'a str),
    /// An input taken from an external deserializer, owned by that deserializer.
    /// Only part of this data, located after offset represented by `usize`, used
    /// to deserialize data, the other is a garbage that can't be dropped because
    /// we do not want to make reallocations if they will not required.
    Owned(String, usize),
}
impl<'de, 'a> Content<'de, 'a> {
    /// Returns string representation of the content
    fn as_str(&self) -> &str {
        match self {
            Content::Input(s) => s,
            Content::Slice(s) => s,
            Content::Owned(s, offset) => s.split_at(*offset).1,
        }
    }
}

/// A deserializer that handles ordinary [simple type definition][item] with
/// `{variety} = atomic`, or an ordinary [simple type] definition with
/// `{variety} = union` whose basic members are all atomic.
///
/// This deserializer can deserialize only primitive types:
/// - numbers
/// - booleans
/// - strings
/// - units
/// - options
/// - unit variants of enums
///
/// Identifiers represented as strings and deserialized accordingly.
///
/// Deserialization of all other types will provide a string and in most cases
/// the deserialization will fail because visitor does not expect that.
///
/// The `Owned` variant of the content acts as a storage for data, allocated by
/// an external deserializer that pass it via [`ListIter`].
///
/// [item]: https://www.w3.org/TR/xmlschema11-1/#std-item_type_definition
/// [simple type]: https://www.w3.org/TR/xmlschema11-1/#Simple_Type_Definition
struct AtomicDeserializer<'de, 'a> {
    /// Content of the attribute value, text content or CDATA content
    content: CowRef<'de, 'a, str>,
}

impl<'de, 'a> Deserializer<'de> for AtomicDeserializer<'de, 'a> {
    type Error = DeError;

    /// Forwards deserialization to the [`Self::deserialize_str`]
    fn deserialize_any<V>(self, visitor: V) -> Result<V::Value, Self::Error>
    where
        V: Visitor<'de>,
    {
        self.deserialize_str(visitor)
    }

    /// According to the <https://www.w3.org/TR/xmlschema11-2/#boolean>,
    /// valid boolean representations are only `"true"`, `"false"`, `"1"`,
    /// and `"0"`.
    fn deserialize_bool<V>(self, visitor: V) -> Result<V::Value, Self::Error>
    where
        V: Visitor<'de>,
    {
        let te
```
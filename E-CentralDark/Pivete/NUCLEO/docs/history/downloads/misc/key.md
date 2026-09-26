# OUTRO - key.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\de\key.rs
**SHA:** 735b16a07122cf55
**Timestamp:** 2026-08-28T02:35:00.923938
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub fn from_elem(start: &'d BytesStart<'i>) -> Result<Self, DeError> {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::de::simple_type::UnitOnly;
use crate::encoding::Decoder;
use crate::errors::serialize::DeError;
use crate::events::BytesStart;
use crate::name::QName;
use crate::utils::CowRef;
use serde::de::{DeserializeSeed, Deserializer, EnumAccess, Visitor};
use serde::forward_to_deserialize_any;
use std::borrow::Cow;

macro_rules! deserialize_num {
    ($method:ident, $visit:ident) => {
        fn $method<V>(self, visitor: V) -> Result<V::Value, Self::Error>
        where
            V: Visitor<'de>,
        {
            match self.name.parse() {
                Ok(number) => visitor.$visit(number),
                Err(_) => self.name.deserialize_str(visitor),
            }
        }
    };
}

/// Decodes raw bytes using the deserializer encoding.
/// The method will borrow if encoding is UTF-8 compatible and `name` contains
/// only UTF-8 compatible characters (usually only ASCII characters).
#[inline]
fn decode_name<'n>(name: QName<'n>, decoder: Decoder) -> Result<Cow<'n, str>, DeError> {
    let local = name.local_name();
    Ok(decoder.decode(local.into_inner())?)
}

/// A deserializer for xml names of elements and attributes.
///
/// Used for deserializing values from:
/// - attribute names (`<... name="..." ...>`)
/// - element names (`<name>...</name>`)
///
/// Converts a name to an identifier string using the following rules:
///
/// - if it is an [`attribute`] name, put `@` in front of the identifier
/// - if it is a namespace binding (`xmlns` or `xmlns:xxx`) put the decoded name
///   to the identifier
/// - if it is an attribute in the `xml` namespace, put the decoded name
///   to the identifier
/// - put the decoded [`local_name()`] of a name to the identifier
///
/// The final identifier looks like `[@]local_name`, or `@xmlns`, or `@xmlns:binding` or
/// `xml:attribute` (where `[]` means optional element).
///
/// The deserializer also supports deserializing names as other primitive types:
/// - numbers
/// - booleans
/// - unit (`()`) and unit structs
/// - unit variants of the enumerations
///
/// Because `serde` does not define on which side type conversion should be
/// performed, and because [`Deserialize`] implementation for that primitives
/// in serde does not accept strings, the deserializer will perform conversion
/// by itself.
///
/// The deserializer is able to deserialize unit and unit structs, but any name
/// will be converted to the same unit instance. This is asymmetry with a serializer,
/// which not able to serialize those types, because empty names are impossible
/// in XML.
///
/// `deserialize_any()` returns the same result as `deserialize_identifier()`.
///
/// # Lifetimes
///
/// - `'i`: lifetime of the data that the deserializer borrows from the parsed input
/// - `'d`: lifetime of a deserializer that holds a buffer with content of events
///
/// [`attribute`]: Self::from_attr
/// [`local_name()`]: QName::local_name
/// [`Deserialize`]: serde::Deserialize
pub struct QNameDeserializer<'i, 'd> {
    name: CowRef<'i, 'd, str>,
}

impl<'i, 'd> QNameDeserializer<'i, 'd> {
    /// Creates deserializer from name of an attribute
    pub fn from_attr(
        name: QName<'d>,
        decoder: Decoder,
        key_buf: &'d mut String,
    ) -> Result<Self, DeError> {
        // https://github.com/tafia/quick-xml/issues/537
        // Namespace bindings (xmlns:xxx) map to `@xmlns:xxx` instead of `@xxx`
        if name.as_namespace_binding().is_some() {
            decoder.decode_into(name.into_inner(), key_buf)?;
        } else {
            // https://github.com/tafia/quick-xml/issues/841
            // we also want to map to the full name for `xml:xxx`, because `xml:xxx` attributes
            // can apper only in this literal form, as `xml` prefix cannot be redeclared or unbound
            let (local, prefix_opt) = name.decompose();
            if prefix_opt.map_or(false, |prefix| prefix.is_xml()) {
                decoder.decode_into(name.into_inner(), key_buf)?;
            } else {
                decoder.decode_into(local.into_inner(), key_buf)?;
            }
        };

        Ok(Self {
            name: CowRef::Slice(key_buf),
        })
    }

    /// Creates deserializer from name of an element
    pub fn from_elem(start: &'d BytesStart<'i>) -> Result<Self, DeError> {
        let local = match start.buf {
            Cow::Borrowed(b) => match decode_name(QName(&b[..start.name_len]), start.decoder())? {
                Cow::Borrowed(borrowed) => CowRef::Input(borrowed),
                Cow::Owned(owned) => CowRef::Owned(owned),
            },
            Cow::Owned(ref o) => match decode_name(QName(&o[..start.name_len]), start.decoder())? {
                Cow::Borrowed(borrowed) => CowRef::Slice(borrowed),
                Cow::Owned(owned) => CowRef::Owned(owned),
            },
        };

        Ok(Self { name: local })
    }
}

impl<'de, 'd> Deserializer<'de> for QNameDeserializer<'de, 'd> {
    type Error = DeError;

    forward_to_deserialize_any! {
        c
```
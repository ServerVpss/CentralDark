# CONTRATO - element.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\se\element.rs
**SHA:** 674af59d8f2bf27e
**Timestamp:** 2026-08-28T02:35:01.515260
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Customization point: allow direct writing of elements, but all
- //TODO: Customization point: allow user to determine if field is attribute or not
- //TODO: Customization point: each attribute on new line
- //TODO: Customization point: preferred quote style

### Ouro Bruto (primeiros 5000 chars)
```
//! Contains serializer for an XML element

use crate::de::{TEXT_KEY, VALUE_KEY};
use crate::se::content::ContentSerializer;
use crate::se::key::QNameSerializer;
use crate::se::simple_type::{QuoteTarget, SimpleSeq, SimpleTypeSerializer};
use crate::se::text::TextSerializer;
use crate::se::{EmptyElementHandling, SeError, WriteResult, XmlName};
use serde::ser::{
    Impossible, Serialize, SerializeMap, SerializeSeq, SerializeStruct, SerializeStructVariant,
    SerializeTuple, SerializeTupleStruct, SerializeTupleVariant, Serializer,
};
use std::fmt::Write;

/// Writes simple type content between [`ElementSerializer::key`] tags.
macro_rules! write_primitive {
    ($method:ident ( $ty:ty )) => {
        fn $method(self, value: $ty) -> Result<Self::Ok, Self::Error> {
            self.ser.write_wrapped(self.key, |ser| ser.$method(value))
        }
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/// A serializer used to serialize element with specified name. Unlike the [`ContentSerializer`],
/// this serializer never uses variant names of enum variants, and because of that
/// it is unable to serialize any enum values, except unit variants.
///
/// Returns the classification of the last written type.
///
/// This serializer is used for an ordinary fields in structs, which are not special
/// fields named `$text` ([`TEXT_KEY`]) or `$value` ([`VALUE_KEY`]). `$text` field
/// should be serialized using [`SimpleTypeSerializer`] and `$value` field should be
/// serialized using [`ContentSerializer`].
///
/// This serializer does the following:
/// - numbers converted to a decimal representation and serialized as `<key>value</key>`;
/// - booleans serialized ether as `<key>true</key>` or `<key>false</key>`;
/// - strings and characters are serialized as `<key>value</key>`. In particular,
///   an empty string is serialized as `<key/>`;
/// - `None` is serialized as `<key/>`;
/// - `Some` and newtypes are serialized as an inner type using the same serializer;
/// - units (`()`) and unit structs are serialized as `<key/>`;
/// - sequences, tuples and tuple structs are serialized as repeated `<key>` tag.
///   In particular, empty sequence is serialized to nothing;
/// - structs are serialized as a sequence of fields wrapped in a `<key>` tag. Each
///   field is serialized recursively using either `ElementSerializer`, [`ContentSerializer`]
///   (`$value` fields), or [`SimpleTypeSerializer`] (`$text` fields).
///   In particular, the empty struct is serialized as `<key/>`;
/// - maps are serialized as a sequence of entries wrapped in a `<key>` tag. If key is
///   serialized to a special name, the same rules as for struct fields are applied.
///   In particular, the empty map is serialized as `<key/>`;
/// - enums:
///   - unit variants are serialized as `<key>variant</key>`;
///   - other variants are not supported ([`SeError::Unsupported`] is returned);
///
/// Usage of empty tags depends on the [`ContentSerializer::empty_element_handling`] setting.
pub struct ElementSerializer<'w, 'k, W: Write> {
    /// The inner serializer that contains the settings and mostly do the actual work
    pub ser: ContentSerializer<'w, 'k, W>,
    /// Tag name used to wrap serialized types except enum variants which uses the variant name
    pub(super) key: XmlName<'k>,
}

impl<'w, 'k, W: Write> Serializer for ElementSerializer<'w, 'k, W> {
    type Ok = WriteResult;
    type Error = SeError;

    type SerializeSeq = Self;
    type SerializeTuple = Self;
    type SerializeTupleStruct = Self;
    type SerializeTupleVariant = Impossible<Self::Ok, Self::Error>;
    type SerializeMap = Map<'w, 'k, W>;
    type SerializeStruct = Struct<'w, 'k, W>;
    type SerializeStructVariant = Struct<'w, 'k, W>;

    write_primitive!(serialize_bool(bool));

    write_primitive!(serialize_i8(i8));
    write_primitive!(serialize_i16(i16));
    write_primitive!(serialize_i32(i32));
    write_primitive!(serialize_i64(i64));

    write_primitive!(serialize_u8(u8));
    write_primitive!(serialize_u16(u16));
    write_primitive!(serialize_u32(u32));
    write_primitive!(serialize_u64(u64));

    write_primitive!(serialize_i128(i128));
    write_primitive!(serialize_u128(u128));

    write_primitive!(serialize_f32(f32));
    write_primitive!(serialize_f64(f64));

    write_primitive!(serialize_char(char));
    write_primitive!(serialize_bytes(&[u8]));

    fn serialize_str(self, value: &str) -> Result<Self::Ok, Self::Error> {
        if value.is_empty() {
            self.ser.write_empty(self.key)
        } else {
            self.ser
                .write_wrapped(self.key, |ser| ser.serialize_str(value))
        }
    }

    /// By serde contract we should serialize key of [`None`] values. If someone
    /// wants to skip the field entirely, he should use
    /// `#[serde(skip_serializing_if = "Option::is_none")]`.
    ///
    /// In XML when we serialize field, we write field name as:
    /// - elemen
```
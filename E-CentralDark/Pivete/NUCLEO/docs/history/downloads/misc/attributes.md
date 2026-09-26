# OUTRO - attributes.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\de\attributes.rs
**SHA:** ca2486a81271ad5b
**Timestamp:** 2026-08-28T02:35:00.911298
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// let tag = BytesStart::from_content(

### Ouro Bruto (primeiros 5000 chars)
```
//! Implementation of the deserializer from attributes

use std::borrow::Cow;

use serde::de::{DeserializeSeed, Deserializer, Error, MapAccess, Visitor};
use serde::forward_to_deserialize_any;

use crate::de::key::QNameDeserializer;
use crate::de::SimpleTypeDeserializer;
use crate::errors::serialize::DeError;
use crate::events::attributes::Attributes;
use crate::XmlVersion;

impl<'i> Attributes<'i> {
    /// Converts this iterator into a serde's [`MapAccess`] trait to use with serde.
    /// The returned object also implements the [`Deserializer`] trait.
    ///
    /// # Parameters
    /// - `prefix`: a prefix of the field names in structs that should be stripped
    ///   to get the local attribute name. The [`crate::de::Deserializer`] uses `"@"`
    ///   as a prefix.
    ///
    /// # Example
    /// ```
    /// # use pretty_assertions::assert_eq;
    /// use quick_xml::events::BytesStart;
    /// use quick_xml::XmlVersion;
    /// use serde::Deserialize;
    ///
    /// #[derive(Debug, PartialEq, Deserialize)]
    /// struct MyData<'i> {
    ///     question: &'i str,
    ///     answer: u32,
    /// }
    ///
    /// #[derive(Debug, PartialEq, Deserialize)]
    /// struct MyDataPrefixed<'i> {
    ///     #[serde(rename = "@question")] question: &'i str,
    ///     #[serde(rename = "@answer")]   answer: u32,
    /// }
    ///
    /// let tag = BytesStart::from_content(
    ///     "tag
    ///         question = 'The Ultimate Question of Life, the Universe, and Everything'
    ///         answer = '42'",
    ///     3
    /// );
    /// // Strip nothing from the field names
    /// let de = tag.attributes().clone().into_map_access(XmlVersion::Implicit1_0, "");
    /// assert_eq!(
    ///     MyData::deserialize(de).unwrap(),
    ///     MyData {
    ///         question: "The Ultimate Question of Life, the Universe, and Everything",
    ///         answer: 42,
    ///     }
    /// );
    ///
    /// // Strip "@" from the field name
    /// let de = tag.attributes().into_map_access(XmlVersion::Implicit1_0, "@");
    /// assert_eq!(
    ///     MyDataPrefixed::deserialize(de).unwrap(),
    ///     MyDataPrefixed {
    ///         question: "The Ultimate Question of Life, the Universe, and Everything",
    ///         answer: 42,
    ///     }
    /// );
    /// ```
    #[inline]
    pub const fn into_map_access(
        self,
        version: XmlVersion,
        prefix: &'static str,
    ) -> AttributesDeserializer<'i> {
        AttributesDeserializer {
            iter: self,
            value: None,
            prefix,
            key_buf: String::new(),
            version,
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/// A deserializer used to make possible to pack all attributes into a struct.
/// It is created by [`Attributes::into_map_access`] method.
///
/// This deserializer always call [`Visitor::visit_map`] with self as [`MapAccess`].
///
/// # Lifetime
///
/// `'i` is a lifetime of the original buffer from which attributes were parsed.
/// In particular, when reader was created from a string, this is lifetime of the
/// string.
#[derive(Debug, Clone)]
pub struct AttributesDeserializer<'i> {
    iter: Attributes<'i>,
    /// The value of the attribute, read in last call to `next_key_seed`.
    value: Option<Cow<'i, [u8]>>,
    /// This prefix will be stripped from struct fields before match against attribute name.
    prefix: &'static str,
    /// Buffer to store attribute name as a field name exposed to serde consumers.
    /// Kept in the deserializer to avoid many small allocations
    key_buf: String,
    version: XmlVersion,
}

impl<'de> Deserializer<'de> for AttributesDeserializer<'de> {
    type Error = DeError;

    #[inline]
    fn deserialize_any<V>(self, visitor: V) -> Result<V::Value, Self::Error>
    where
        V: Visitor<'de>,
    {
        visitor.visit_map(self)
    }

    forward_to_deserialize_any! {
        bool i8 i16 i32 i64 i128 u8 u16 u32 u64 u128 f32 f64 char str string
        bytes byte_buf option unit unit_struct newtype_struct seq tuple
        tuple_struct map struct enum identifier ignored_any
    }
}

impl<'de> MapAccess<'de> for AttributesDeserializer<'de> {
    type Error = DeError;

    fn next_key_seed<K>(&mut self, seed: K) -> Result<Option<K::Value>, Self::Error>
    where
        K: DeserializeSeed<'de>,
    {
        debug_assert_eq!(self.value, None);

        match self.iter.next() {
            None => Ok(None),
            Some(Ok(attr)) => {
                self.value = Some(attr.value);
                self.key_buf.clear();
                self.key_buf.push_str(self.prefix);
                let de =
                    QNameDeserializer::from_attr(attr.key, self.iter.decoder(), &mut self.key_buf)?;
                seed.deserialize(de).map(Some)
            }
            Some(Err(err)) => Err(Error::custom(err)),
        }
    }

    fn next_value_seed<V>(&mut self, seed
```

---

# OUTRO - attributes.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\events\attributes.rs
**SHA:** 438e5a8dccec351b
**Timestamp:** 2026-08-28T02:35:01.113499
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: is this divergence between range behavior of UnterminatedEntity
- // TODO: is this divergence between range behavior of UnterminatedEntity
- // TODO: is this divergence between range behavior of UnterminatedEntity

### Ouro Bruto (primeiros 5000 chars)
```
//! Xml Attributes module
//!
//! Provides an iterator over attributes key/value pairs

use crate::encoding::Decoder;
use crate::errors::Result as XmlResult;
use crate::escape::{escape, resolve_predefined_entity};
use crate::name::{LocalName, Namespace, NamespaceResolver, QName};
use crate::utils::{is_whitespace, Bytes};
use crate::XmlVersion;

use std::collections::HashSet;
use std::fmt::{self, Debug, Display, Formatter};
use std::hash::{BuildHasherDefault, DefaultHasher, Hasher};
use std::iter::FusedIterator;
use std::{borrow::Cow, ops::Range};

/// A struct representing a key/value XML attribute.
///
/// Field `value` stores raw bytes, possibly containing escape-sequences. Most users will likely
/// want to access the value using one of the [`normalized_value`] and [`decoded_and_normalized_value`]
/// functions.
///
/// [`normalized_value`]: Self::normalized_value
/// [`decoded_and_normalized_value`]: Self::decoded_and_normalized_value
#[derive(Clone, Eq, PartialEq)]
pub struct Attribute<'a> {
    /// The key to uniquely define the attribute.
    ///
    /// If [`Attributes::with_checks`] is turned off, the key might not be unique.
    pub key: QName<'a>,
    /// The raw value of the attribute.
    pub value: Cow<'a, [u8]>,
}

impl<'a> Attribute<'a> {
    /// Returns the attribute value normalized as per [the XML specification] (or [for 1.0]).
    ///
    /// The document **must** be UTF-8 encoded, or pre-processed using [`DecodingReader`].
    ///
    /// The characters `\t`, `\r`, `\n` are replaced with whitespace characters (`0x20`).
    ///
    /// The following escape sequences are replaced with their unescaped equivalents:
    ///
    /// | Escape Sequence | Replacement
    /// |-----------------|------------
    /// | `&lt;`          | `<`
    /// | `&gt;`          | `>`
    /// | `&amp;`         | `&`
    /// | `&apos;`        | `'`
    /// | `&quot;`        | `"`
    ///
    /// This will allocate unless the raw attribute value does not require normalization.
    ///
    /// Note, although you may use this library to parse HTML, you cannot use this
    /// method to get HTML content, because its returns normalized value: the following
    /// sequences are translated into a single space (U+0020) character:
    ///
    /// - `\r\n`
    /// - `\r\x85` (only XML 1.1)
    /// - `\r`
    /// - `\n`
    /// - `\t`
    /// - `\x85` (only XML 1.1)
    /// - `\x2028` (only XML 1.1)
    ///
    /// The text in HTML normally is not normalized in any way; normalization is
    /// performed only in limited contexts and [only for] `\r\n` and `\r`.
    ///
    /// See also [`normalized_value_with()`](Self::normalized_value_with).
    ///
    /// <div style="background:rgba(120,145,255,0.45);padding:0.75em;">
    ///
    /// NOTE: If you are using this in a context where the input is not controlled,
    /// it is preferred to wrap the input stream in [`DecodingReader`] or to use
    /// [`decoded_and_normalized_value()`](Self::decoded_and_normalized_value) instead.
    ///
    /// </div>
    ///
    /// [the XML specification]: https://www.w3.org/TR/xml11/#AVNormalize
    /// [`DecodingReader`]: ../../encoding/struct.DecodingReader.html
    /// [for 1.0]: https://www.w3.org/TR/xml/#AVNormalize
    /// [only for]: https://html.spec.whatwg.org/#normalize-newlines
    pub fn normalized_value(&self, version: XmlVersion) -> XmlResult<Cow<'a, str>> {
        // resolve_predefined_entity returns only non-recursive replacements, so depth=1 is enough
        self.normalized_value_with(version, 1, resolve_predefined_entity)
    }

    /// Returns the attribute value normalized as per [the XML specification] (or [for 1.0]),
    /// using a custom entity resolver.
    ///
    /// The document **must** be UTF-8 encoded, or pre-processed using [`DecodingReader`].
    ///
    /// Do not use this method with HTML attributes.
    ///
    /// The characters `\t`, `\r`, `\n` are replaced with whitespace characters (`0x20`).
    ///
    /// A function for resolving entities can be provided as `resolve_entity`.
    /// This method does not resolve any predefined entities, but you can use
    /// [`resolve_predefined_entity`] in your function.
    ///
    /// This will allocate unless the raw attribute value does not require normalization.
    ///
    /// Note, although you may use this library to parse HTML, you cannot use this
    /// method to get HTML content, because its returns normalized value: the following
    /// sequences are translated into a single space (U+0020) character:
    ///
    /// - `\r\n`
    /// - `\r\x85` (only XML 1.1)
    /// - `\r`
    /// - `\n`
    /// - `\t`
    /// - `\x85` (only XML 1.1)
    /// - `\x2028` (only XML 1.1)
    ///
    /// The text in HTML normally is not normalized in any way; normalization is
    /// performed only in limited contexts and [only for] `\r\n` and `\r`.
    ///
    /// See also [`normalized_value()`](Self::normalized_value).
    ///
    /// <div style="background:rgba(120
```
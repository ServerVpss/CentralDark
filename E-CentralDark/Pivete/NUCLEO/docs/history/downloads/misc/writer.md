# OUTRO - writer.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\writer.rs
**SHA:** b9d4d9811d09357e
**Timestamp:** 2026-08-28T02:35:00.906684
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- ///             let mut elem = BytesStart::new("my_elem");
- start_tag: BytesStart::new(name),
- /// let start = BytesStart::new("root");

### Gaps
- /// todo: this is an awkward fit as it has no impact on indentation logic, but it is

### Ouro Bruto (primeiros 5000 chars)
```
//! Contains high-level interface for an events-based XML emitter.

use std::borrow::Cow;
use std::io::{self, Write};

use crate::encoding::UTF8_BOM;
use crate::events::{attributes::Attribute, BytesCData, BytesPI, BytesStart, BytesText, Event};

#[cfg(feature = "async-tokio")]
mod async_tokio;

/// XML writer. Writes XML [`Event`]s to a [`std::io::Write`] or [`tokio::io::AsyncWrite`] implementor.
#[cfg(feature = "serialize")]
use {crate::se::SeError, serde::Serialize};

/// A struct that holds a writer configuration.
///
/// Current writer configuration can be retrieved by calling [`Writer::config()`]
/// and changed by changing properties of the object returned by a call to
/// [`Writer::config_mut()`].
///
/// [`Writer::config()`]: crate::writer::Writer::config
/// [`Writer::config_mut()`]: crate::writer::Writer::config_mut
#[derive(Debug, Default, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "arbitrary", derive(arbitrary::Arbitrary))]
#[cfg_attr(feature = "serde-types", derive(serde::Deserialize, serde::Serialize))]
#[non_exhaustive]
pub struct Config {
    /// Whether to add a space before the closing slash in empty elements.
    /// According to the [W3C guidelines], this is recommended as for maximum compatibility.
    ///
    /// When set to `true`, empty elements will be terminated with "` />`".
    /// When set to `false`, empty elements will be terminated with "`/>`".
    ///
    /// Default: `false`
    ///
    /// # Example
    ///
    /// ```
    /// # use pretty_assertions::assert_eq;
    /// use quick_xml::reader::Reader;
    /// use quick_xml::writer::Writer;
    /// use std::io::Cursor;
    ///
    /// let mut writer = Writer::new(Cursor::new(Vec::new()));
    /// writer.config_mut().add_space_before_slash_in_empty_elements = true;
    ///
    /// writer.create_element("tag")
    ///     .with_attribute(("attr1", "value1"))
    ///     .write_empty()
    ///     .unwrap();
    ///
    /// let result = writer.into_inner().into_inner();
    /// let expected = r#"<tag attr1="value1" />"#;
    /// assert_eq!(result, expected.as_bytes());
    /// ```
    ///
    /// [W3C guidelines]: https://www.w3.org/TR/xhtml1/#guidelines
    pub add_space_before_slash_in_empty_elements: bool,
}

/// XML writer. Writes XML [`Event`]s to a [`std::io::Write`] implementor.
///
/// # Examples
///
/// ```
/// # use pretty_assertions::assert_eq;
/// use quick_xml::events::{Event, BytesEnd, BytesStart};
/// use quick_xml::reader::Reader;
/// use quick_xml::writer::Writer;
/// use std::io::Cursor;
///
/// let xml = r#"<this_tag k1="v1" k2="v2"><child>text</child></this_tag>"#;
/// let mut reader = Reader::from_str(xml);
/// let mut writer = Writer::new(Cursor::new(Vec::new()));
/// loop {
///     match reader.read_event() {
///         Ok(Event::Start(e)) if e.name().as_ref() == b"this_tag" => {
///
///             // creates a new element ... alternatively we could reuse `e` by calling
///             // `e.into_owned()`
///             let mut elem = BytesStart::new("my_elem");
///
///             // collect existing attributes
///             elem.extend_attributes(e.attributes().map(|attr| attr.unwrap()));
///
///             // copy existing attributes, adds a new my-key="some value" attribute
///             elem.push_attribute(("my-key", "some value"));
///
///             // writes the event to the writer
///             assert!(writer.write_event(Event::Start(elem)).is_ok());
///         },
///         Ok(Event::End(e)) if e.name().as_ref() == b"this_tag" => {
///             assert!(writer.write_event(Event::End(BytesEnd::new("my_elem"))).is_ok());
///         },
///         Ok(Event::Eof) => break,
///         // we can either move or borrow the event to write, depending on your use-case
///         Ok(e) => assert!(writer.write_event(e.borrow()).is_ok()),
///         Err(e) => panic!("Error at position {}: {:?}", reader.error_position(), e),
///     }
/// }
///
/// let result = writer.into_inner().into_inner();
/// let expected = r#"<my_elem k1="v1" k2="v2" my-key="some value"><child>text</child></my_elem>"#;
/// assert_eq!(result, expected.as_bytes());
/// ```
#[derive(Clone)]
pub struct Writer<W> {
    /// underlying writer
    writer: W,

    /// writer configuration
    config: Config,

    /// indentation configuration and state; stored separately from
    /// other configuration since it also tracks writer state
    indent: Option<Indentation>,
}

impl<W> Writer<W> {
    /// Creates a `Writer` from a generic writer.
    pub const fn new(inner: W) -> Writer<W> {
        Writer {
            writer: inner,
            config: Config {
                add_space_before_slash_in_empty_elements: false,
            },
            indent: None,
        }
    }

    /// Creates a `Writer` with configured indents from a generic writer.
    pub fn new_with_indent(inner: W, indent_char: u8, indent_size: usize) -> Writer<W> {
        Writer {
            writer: inner,
            config: Config {
                
```
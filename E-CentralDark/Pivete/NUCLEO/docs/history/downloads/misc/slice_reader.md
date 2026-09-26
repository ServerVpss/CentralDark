# OUTRO - slice_reader.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\reader\slice_reader.rs
**SHA:** f71f96d4f1bd1b43
**Timestamp:** 2026-08-28T02:35:01.447300
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// [`BytesStart::to_end()`] method.
- /// let start = BytesStart::new("outer");
- /// [`BytesStart::to_end()`]: crate::events::BytesStart::to_end
- /// let start = BytesStart::new("html");

### Ouro Bruto (primeiros 5000 chars)
```
//! This is an implementation of [`Reader`] for reading from a `&[u8]` as
//! underlying byte stream. This implementation supports not using an
//! intermediate buffer as the byte slice itself can be used to borrow from.

use std::io;

#[cfg(feature = "encoding")]
use crate::encoding::DetectedEncoding;
#[cfg(feature = "encoding")]
use crate::reader::EncodingRef;
#[cfg(feature = "encoding")]
use encoding_rs;

use crate::errors::{Error, Result};
use crate::events::{BytesText, Event};
use crate::name::QName;
use crate::parser::Parser;
use crate::reader::{BangType, ReadRefResult, ReadTextResult, Reader, Span, XmlSource};
use crate::utils::is_whitespace;

/// This is an implementation for reading from a `&[u8]` as underlying byte stream.
/// This implementation supports not using an intermediate buffer as the byte slice
/// itself can be used to borrow from.
impl<'a> Reader<&'a [u8]> {
    /// Creates an XML reader from a string slice.
    #[allow(clippy::should_implement_trait)]
    pub fn from_str(s: &'a str) -> Self {
        // Rust strings are guaranteed to be UTF-8, so lock the encoding
        #[cfg(feature = "encoding")]
        {
            let mut reader = Self::from_reader(s.as_bytes());
            reader.state.encoding = EncodingRef::Explicit(encoding_rs::UTF_8);
            reader
        }

        #[cfg(not(feature = "encoding"))]
        Self::from_reader(s.as_bytes())
    }

    /// Read an event that borrows from the input rather than a buffer.
    ///
    /// There is no asynchronous `read_event_async()` version of this function,
    /// because it is not necessary -- the contents are already in memory and no IO
    /// is needed, therefore there is no potential for blocking.
    ///
    /// # Examples
    ///
    /// ```
    /// # use pretty_assertions::assert_eq;
    /// use quick_xml::events::Event;
    /// use quick_xml::reader::Reader;
    ///
    /// let mut reader = Reader::from_str(r#"
    ///     <tag1 att1 = "test">
    ///        <tag2><!--Test comment-->Test</tag2>
    ///        <tag2>Test 2</tag2>
    ///     </tag1>
    /// "#);
    /// reader.config_mut().trim_text(true);
    ///
    /// let mut count = 0;
    /// let mut txt = Vec::new();
    /// loop {
    ///     match reader.read_event().unwrap() {
    ///         Event::Start(e) => count += 1,
    ///         Event::Text(e) => txt.push(e.decode().unwrap().into_owned()),
    ///         Event::Eof => break,
    ///         _ => (),
    ///     }
    /// }
    /// assert_eq!(count, 3);
    /// assert_eq!(txt, vec!["Test".to_string(), "Test 2".to_string()]);
    /// ```
    #[inline]
    pub fn read_event(&mut self) -> Result<Event<'a>> {
        self.read_event_impl(())
    }

    /// Reads until end element is found. This function is supposed to be called
    /// after you already read a [`Start`] event.
    ///
    /// Returns a span that cover content between `>` of an opening tag and `<` of
    /// a closing tag or an empty slice, if [`expand_empty_elements`] is set and
    /// this method was called after reading expanded [`Start`] event.
    ///
    /// Manages nested cases where parent and child elements have the _literally_
    /// same name.
    ///
    /// If a corresponding [`End`] event is not found, an error of type [`Error::IllFormed`]
    /// will be returned. In particularly, that error will be returned if you call
    /// this method without consuming the corresponding [`Start`] event first.
    ///
    /// The `end` parameter should contain name of the end element _in the reader
    /// encoding_. It is good practice to always get that parameter using
    /// [`BytesStart::to_end()`] method.
    ///
    /// The correctness of the skipped events does not checked, if you disabled
    /// the [`check_end_names`] option.
    ///
    /// There is no asynchronous `read_to_end_async()` version of this function,
    /// because it is not necessary -- the contents are already in memory and no IO
    /// is needed, therefore there is no potential for blocking.
    ///
    /// # Namespaces
    ///
    /// While the `Reader` does not support namespace resolution, namespaces
    /// does not change the algorithm for comparing names. Although the names
    /// `a:name` and `b:name` where both prefixes `a` and `b` resolves to the
    /// same namespace, are semantically equivalent, `</b:name>` cannot close
    /// `<a:name>`, because according to [the specification]
    ///
    /// > The end of every element that begins with a **start-tag** MUST be marked
    /// > by an **end-tag** containing a name that echoes the element's type as
    /// > given in the **start-tag**
    ///
    /// # Examples
    ///
    /// This example shows, how you can skip XML content after you read the
    /// start event.
    ///
    /// ```
    /// # use pretty_assertions::assert_eq;
    /// use quick_xml::events::{BytesStart, Event};
    /// use quick_xml::reader::Reader;
    ///
    /// let mut reader = Reader::from_str(r#"
    ///     <ou
```
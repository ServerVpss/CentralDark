# OUTRO - simple_type.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\se\simple_type.rs
**SHA:** 013243314b19e1b4
**Timestamp:** 2026-08-28T02:35:01.574670
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Customization point -- possible non-XML compatible extension to specify delimiter char
- //TODO: Customization point - allow user to decide how to encode bytes

### Ouro Bruto (primeiros 5000 chars)
```
//! Contains Serde `Serializer` for XML [simple types] [as defined] in the XML Schema.
//!
//! [simple types]: https://www.w3schools.com/xml/el_simpletype.asp
//! [as defined]: https://www.w3.org/TR/xmlschema11-1/#Simple_Type_Definition

use crate::escape::escape_char;
use crate::se::{QuoteLevel, SeError};
use crate::utils::CDataIterator;
use serde::ser::{
    Impossible, Serialize, SerializeSeq, SerializeTuple, SerializeTupleStruct,
    SerializeTupleVariant, Serializer,
};
use std::fmt::{self, Write};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum QuoteTarget {
    /// Escape data for a text content. No additional escape symbols
    Text,
    /// Escape data for a double-quoted attribute. `"` always escaped
    DoubleQAttr,
    /// Escape data for a single-quoted attribute. `'` always escaped
    SingleQAttr,
    /// Escape data for a CDATA content. No escaping for `&` and `>`, but split
    /// content on `]]>` and make several CDATA sections
    CData,
}

fn escape_into<W, F>(mut writer: W, value: &str, escape_chars: F) -> fmt::Result
where
    W: Write,
    F: Fn(u8) -> bool,
{
    let bytes = value.as_bytes();
    let mut iter = bytes.iter();
    let mut pos = 0;
    while let Some(i) = iter.position(|&b| escape_chars(b)) {
        let new_pos = pos + i;
        escape_char(&mut writer, value, pos, new_pos)?;
        pos = new_pos + 1;
    }

    if let Some(raw) = value.get(pos..) {
        writer.write_str(raw)?;
    }
    Ok(())
}

/// Escapes atomic value that could be part of a `xs:list`. All whitespace characters
/// additionally escaped
fn escape_item<W>(mut writer: W, value: &str, target: QuoteTarget, level: QuoteLevel) -> fmt::Result
where
    W: Write,
{
    use QuoteLevel::*;
    use QuoteTarget::*;

    match (target, level) {
        (CData, _) => {
            let mut it = CDataIterator::new(value);
            if let Some(part) = it.next() {
                writer.write_str(part)?;
            }
            for part in it {
                writer.write_str("]]><![CDATA[")?;
                writer.write_str(part)?;
            }
            Ok(())
        }
        (_, Full) => escape_into(writer, value, |ch| match ch {
            // Spaces used as delimiters of list items, cannot be used in the item
            b' ' | b'\r' | b'\n' | b'\t' => true,
            // Required characters to escape
            b'&' | b'<' | b'>' | b'\'' | b'\"' => true,
            _ => false,
        }),
        //----------------------------------------------------------------------
        (Text, Partial) => escape_into(writer, value, |ch| match ch {
            // Spaces used as delimiters of list items, cannot be used in the item
            b' ' | b'\r' | b'\n' | b'\t' => true,
            // Required characters to escape
            b'&' | b'<' | b'>' => true,
            _ => false,
        }),
        (Text, Minimal) => escape_into(writer, value, |ch| match ch {
            // Spaces used as delimiters of list items, cannot be used in the item
            b' ' | b'\r' | b'\n' | b'\t' => true,
            // Required characters to escape
            b'&' | b'<' => true,
            _ => false,
        }),
        //----------------------------------------------------------------------
        (DoubleQAttr, Partial) => escape_into(writer, value, |ch| match ch {
            // Spaces used as delimiters of list items, cannot be used in the item
            b' ' | b'\r' | b'\n' | b'\t' => true,
            // Required characters to escape
            b'&' | b'<' | b'>' => true,
            // Double quoted attribute should escape quote
            b'"' => true,
            _ => false,
        }),
        (DoubleQAttr, Minimal) => escape_into(writer, value, |ch| match ch {
            // Spaces used as delimiters of list items, cannot be used in the item
            b' ' | b'\r' | b'\n' | b'\t' => true,
            // Required characters to escape
            b'&' | b'<' => true,
            // Double quoted attribute should escape quote
            b'"' => true,
            _ => false,
        }),
        //----------------------------------------------------------------------
        (SingleQAttr, Partial) => escape_into(writer, value, |ch| match ch {
            // Spaces used as delimiters of list items
            b' ' | b'\r' | b'\n' | b'\t' => true,
            // Required characters to escape
            b'&' | b'<' | b'>' => true,
            // Single quoted attribute should escape quote
            b'\'' => true,
            _ => false,
        }),
        (SingleQAttr, Minimal) => escape_into(writer, value, |ch| match ch {
            // Spaces used as delimiters of list items
            b' ' | b'\r' | b'\n' | b'\t' => true,
            // Required characters to escape
            b'&' | b'<' => true,
            // Single quoted attribute should escape quote
            b'\'' => true,
            _ => false,
        }),
    }
}

/// Escapes XSD simple type value
fn escape_list<W>(mut
```
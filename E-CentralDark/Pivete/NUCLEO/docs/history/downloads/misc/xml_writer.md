# OUTRO - xml_writer.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\plist-1.10.0\src\stream\xml_writer.rs
**SHA:** 09df3360f1366d7c
**Timestamp:** 2026-08-28T02:34:58.136074
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- .write_event(XmlEvent::Start(BytesStart::new(name)))
- .write_event(XmlEvent::Empty(BytesStart::new("array")))
- .write_event(XmlEvent::Empty(BytesStart::new("dict")))
- .write_event(XmlEvent::Empty(BytesStart::new(value)))

### Ouro Bruto (primeiros 5000 chars)
```
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine};
use quick_xml::{
    events::{BytesEnd, BytesStart, BytesText, Event as XmlEvent},
    Error as XmlWriterError, Writer as EventWriter,
};
use std::{
    borrow::Cow,
    io::{self, Write},
};

use crate::{
    error::{self, from_io_without_position, Error, ErrorKind, EventKind},
    stream::{Writer, XmlWriteOptions},
    Date, Integer, Uid,
};

const DATA_MAX_LINE_CHARS: usize = 68;
const DATA_MAX_LINE_BYTES: usize = 51;

static XML_PROLOGUE: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
"#;

#[derive(PartialEq)]
enum Element {
    Dictionary,
    Array,
}

pub struct XmlWriter<W: Write> {
    xml_writer: EventWriter<W>,
    write_root_element: bool,
    indent_char: u8,
    indent_count: usize,
    started_plist: bool,
    stack: Vec<Element>,
    expecting_key: bool,
    pending_collection: Option<PendingCollection>,
}

enum PendingCollection {
    Array,
    Dictionary,
}

impl<W: Write> XmlWriter<W> {
    #[cfg(feature = "enable_unstable_features_that_may_break_with_minor_version_bumps")]
    pub fn new(writer: W) -> XmlWriter<W> {
        let opts = XmlWriteOptions::default();
        XmlWriter::new_with_options(writer, &opts)
    }

    pub fn new_with_options(writer: W, opts: &XmlWriteOptions) -> XmlWriter<W> {
        let xml_writer = if opts.indent_count == 0 {
            EventWriter::new(writer)
        } else {
            EventWriter::new_with_indent(writer, opts.indent_char, opts.indent_count)
        };

        XmlWriter {
            xml_writer,
            write_root_element: opts.root_element,
            indent_char: opts.indent_char,
            indent_count: opts.indent_count,
            started_plist: false,
            stack: Vec::new(),
            expecting_key: false,
            pending_collection: None,
        }
    }

    #[cfg(feature = "enable_unstable_features_that_may_break_with_minor_version_bumps")]
    pub fn into_inner(self) -> W {
        self.xml_writer.into_inner()
    }

    fn write_element_and_value(&mut self, name: &str, value: &str) -> Result<(), Error> {
        self.xml_writer
            .create_element(name)
            .write_text_content(BytesText::new(value))
            .map_err(from_io_without_position)?;
        Ok(())
    }

    fn start_element(&mut self, name: &str) -> Result<(), Error> {
        self.xml_writer
            .write_event(XmlEvent::Start(BytesStart::new(name)))
            .map_err(from_io_without_position)?;
        Ok(())
    }

    fn end_element(&mut self, name: &str) -> Result<(), Error> {
        self.xml_writer
            .write_event(XmlEvent::End(BytesEnd::new(name)))
            .map_err(from_io_without_position)?;
        Ok(())
    }

    fn write_event<F: FnOnce(&mut Self) -> Result<(), Error>>(
        &mut self,
        f: F,
    ) -> Result<(), Error> {
        if !self.started_plist {
            if self.write_root_element {
                self.xml_writer
                    .get_mut()
                    .write_all(XML_PROLOGUE)
                    .map_err(error::from_io_without_position)?;
            }

            self.started_plist = true;
        }

        f(self)?;

        // If there are no more open tags then write the </plist> element
        if self.stack.is_empty() {
            if self.write_root_element {
                // We didn't tell the xml_writer about the <plist> tag so we'll skip telling it
                // about the </plist> tag as well.
                self.xml_writer
                    .get_mut()
                    .write_all(b"\n</plist>")
                    .map_err(error::from_io_without_position)?;
            }

            self.xml_writer
                .get_mut()
                .flush()
                .map_err(error::from_io_without_position)?;
        }

        Ok(())
    }

    fn write_value_event<F: FnOnce(&mut Self) -> Result<(), Error>>(
        &mut self,
        event_kind: EventKind,
        f: F,
    ) -> Result<(), Error> {
        self.handle_pending_collection()?;
        self.write_event(|this| {
            if this.expecting_key {
                return Err(ErrorKind::UnexpectedEventType {
                    expected: EventKind::DictionaryKeyOrEndCollection,
                    found: event_kind,
                }
                .without_position());
            }
            f(this)?;
            this.expecting_key = this.stack.last() == Some(&Element::Dictionary);
            Ok(())
        })
    }

    fn handle_pending_collection(&mut self) -> Result<(), Error> {
        if let Some(PendingCollection::Array) = self.pending_collection {
            self.pending_collection = None;

            self.write_value_event(EventKind::StartArray, |this| {
                this.start_element("array")?;
                this.stack.push(Element::Array);
       
```
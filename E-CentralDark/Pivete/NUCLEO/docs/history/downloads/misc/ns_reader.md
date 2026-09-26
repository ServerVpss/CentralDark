# OUTRO - ns_reader.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\reader\ns_reader.rs
**SHA:** 388634b713690860
**Timestamp:** 2026-08-28T02:35:01.437785
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// [`BytesStart::to_end()`] method.
- /// let start = BytesStart::from_content(r#"outer xmlns="namespace 1""#, 5);
- /// [`BytesStart::to_end()`]: crate::events::BytesStart::to_end
- /// let start = BytesStart::new("html");
- /// [`BytesStart::to_end()`] method.
- /// let start = BytesStart::from_content(r#"outer xmlns="namespace 1""#, 5);
- /// [`BytesStart::to_end()`]: crate::events::BytesStart::to_end
- /// let start = BytesStart::new("html");

### Ouro Bruto (primeiros 5000 chars)
```
//! A reader that manages namespace declarations found in the input and able
//! to resolve [qualified names] to [expanded names].
//!
//! [qualified names]: https://www.w3.org/TR/xml-names11/#dt-qualname
//! [expanded names]: https://www.w3.org/TR/xml-names11/#dt-expname

use std::fs::File;
use std::io::{BufRead, BufReader};
use std::ops::Deref;
use std::path::Path;

use crate::errors::Result;
use crate::events::{BytesText, Event};
use crate::name::{NamespaceResolver, QName, ResolveResult};
use crate::reader::{Config, Reader, Span, XmlSource};

/// A low level encoding-agnostic XML event reader that performs namespace resolution.
///
/// Consumes a [`BufRead`] and streams XML `Event`s.
#[derive(Debug, Clone)]
pub struct NsReader<R> {
    /// An XML reader
    pub(super) reader: Reader<R>,
    /// A buffer to manage namespaces
    pub(super) ns_resolver: NamespaceResolver,
    /// We cannot pop data from the namespace stack until returned `Empty` or `End`
    /// event will be processed by the user, so we only mark that we should that
    /// in the next [`Self::read_event_impl()`] call.
    pending_pop: bool,
}

/// Builder methods
impl<R> NsReader<R> {
    /// Creates a `NsReader` that reads from a reader.
    #[inline]
    pub fn from_reader(reader: R) -> Self {
        Self::new(Reader::from_reader(reader))
    }

    /// Returns reference to the parser configuration
    #[inline]
    pub const fn config(&self) -> &Config {
        self.reader.config()
    }

    /// Returns mutable reference to the parser configuration
    #[inline]
    pub fn config_mut(&mut self) -> &mut Config {
        self.reader.config_mut()
    }
}

/// Private methods
impl<R> NsReader<R> {
    #[inline]
    fn new(reader: Reader<R>) -> Self {
        Self {
            reader,
            ns_resolver: NamespaceResolver::default(),
            pending_pop: false,
        }
    }

    fn read_event_impl<'i, B>(&mut self, buf: B) -> Result<Event<'i>>
    where
        R: XmlSource<'i, B>,
    {
        self.pop();
        let event = self.reader.read_event_impl(buf);
        self.process_event(event)
    }

    pub(super) fn pop(&mut self) {
        if self.pending_pop {
            self.ns_resolver.pop();
            self.pending_pop = false;
        }
    }

    pub(super) fn process_event<'i>(&mut self, event: Result<Event<'i>>) -> Result<Event<'i>> {
        match event {
            Ok(Event::Start(e)) => {
                self.ns_resolver.push(&e)?;
                Ok(Event::Start(e))
            }
            Ok(Event::Empty(e)) => {
                self.ns_resolver.push(&e)?;
                // notify next `read_event_impl()` invocation that it needs to pop this
                // namespace scope
                self.pending_pop = true;
                Ok(Event::Empty(e))
            }
            Ok(Event::End(e)) => {
                // notify next `read_event_impl()` invocation that it needs to pop this
                // namespace scope
                self.pending_pop = true;
                Ok(Event::End(e))
            }
            e => e,
        }
    }
}

/// Getters
impl<R> NsReader<R> {
    /// Consumes `NsReader` returning the underlying reader
    ///
    /// See the [`Reader::into_inner`] for examples
    #[inline]
    pub fn into_inner(self) -> R {
        self.reader.into_inner()
    }

    /// Gets a mutable reference to the underlying reader.
    pub fn get_mut(&mut self) -> &mut R {
        self.reader.get_mut()
    }

    /// Returns a storage of namespace bindings associated with this reader.
    #[inline]
    pub const fn resolver(&self) -> &NamespaceResolver {
        &self.ns_resolver
    }

    /// Returns a mutable reference to the storage of namespace bindings
    /// associated with this reader.
    ///
    /// Useful for configuring the resolver, e.g. to change the
    /// [per-element namespace-declaration limit](NamespaceResolver::set_max_declarations_per_element).
    #[inline]
    pub fn resolver_mut(&mut self) -> &mut NamespaceResolver {
        &mut self.ns_resolver
    }
}

impl<R: BufRead> NsReader<R> {
    /// Reads the next event into given buffer.
    ///
    /// This method manages namespaces but doesn't resolve them automatically.
    /// You should call [`resolver().resolve_element()`] if you want to get a namespace.
    ///
    /// You also can use [`read_resolved_event_into()`] instead if you want to resolve
    /// namespace as soon as you get an event.
    ///
    /// # Examples
    ///
    /// ```
    /// # use pretty_assertions::assert_eq;
    /// use quick_xml::events::Event;
    /// use quick_xml::name::{Namespace, ResolveResult::*};
    /// use quick_xml::reader::NsReader;
    ///
    /// let mut reader = NsReader::from_str(r#"
    ///     <x:tag1 xmlns:x="www.xxxx" xmlns:y="www.yyyy" att1 = "test">
    ///        <y:tag2><!--Test comment-->Test</y:tag2>
    ///        <y:tag2>Test 2</y:tag2>
    ///     </x:tag1>
    /// "#);
    /// reader.config_mut().trim_text(true)
```
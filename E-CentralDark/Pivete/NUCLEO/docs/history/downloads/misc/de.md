# OUTRO - de.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\plist-1.10.0\src\de.rs
**SHA:** bc87155c4e83ca38
**Timestamp:** 2026-08-28T02:34:57.941335
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Ideally this check would be inside the `Deserializer` implementation.

### Ouro Bruto (primeiros 5000 chars)
```
use serde::de::{
    self,
    value::{MapAccessDeserializer, MapDeserializer},
    IntoDeserializer,
};
use std::{
    borrow::Cow,
    fmt::Display,
    fs::File,
    io::{BufReader, Cursor, Read, Seek},
    iter::Peekable,
    mem,
    path::Path,
};

use crate::{
    date::serde_impls::DATE_NEWTYPE_STRUCT_NAME,
    error::{self, Error, ErrorKind, EventKind},
    stream::{self, Event},
    u64_to_usize,
    uid::serde_impls::UID_NEWTYPE_STRUCT_NAME,
    value::serde_impls::VALUE_NEWTYPE_STRUCT_NAME,
    Value,
};

macro_rules! expect {
    ($next:expr, $kind:expr) => {
        match $next {
            Some(Ok(ref event)) if EventKind::of_event(event) != $kind => {
                return Err(error::unexpected_event_type($kind, event))?;
            }
            Some(Ok(event)) => event,
            Some(Err(err)) => return Err(err),
            None => return Err(ErrorKind::UnexpectedEndOfEventStream.without_position()),
        }
    };
}

macro_rules! try_next {
    ($next:expr) => {
        match $next {
            Some(Ok(event)) => event,
            Some(Err(err)) => return Err(err)?,
            None => return Err(ErrorKind::UnexpectedEndOfEventStream.without_position())?,
        }
    };
}

#[doc(hidden)]
impl de::Error for Error {
    fn custom<T: Display>(msg: T) -> Self {
        ErrorKind::Serde(msg.to_string()).without_position()
    }
}

enum OptionMode {
    Root,
    StructField,
    Explicit,
}

/// A structure that deserializes plist event streams into Rust values.
pub struct Deserializer<'event, I>
where
    I: IntoIterator<Item = Result<Event<'event>, Error>>,
{
    events: Peekable<<I as IntoIterator>::IntoIter>,
    option_mode: OptionMode,
    in_plist_value: bool,
}

impl<'event, I> Deserializer<'event, I>
where
    I: IntoIterator<Item = Result<Event<'event>, Error>>,
{
    pub fn new(iter: I) -> Deserializer<'event, I> {
        Deserializer {
            events: iter.into_iter().peekable(),
            option_mode: OptionMode::Root,
            in_plist_value: false,
        }
    }

    fn with_option_mode<T, F: FnOnce(&mut Deserializer<'event, I>) -> Result<T, Error>>(
        &mut self,
        option_mode: OptionMode,
        f: F,
    ) -> Result<T, Error> {
        let prev_option_mode = mem::replace(&mut self.option_mode, option_mode);
        let ret = f(&mut *self);
        self.option_mode = prev_option_mode;
        ret
    }

    fn enter_plist_value<T, F: FnOnce(&mut Deserializer<'event, I>) -> Result<T, Error>>(
        &mut self,
        f: F,
    ) -> Result<T, Error> {
        let prev = mem::replace(&mut self.in_plist_value, true);
        let ret = f(&mut *self);
        self.in_plist_value = prev;
        ret
    }
}

impl<'de, 'event, I> de::Deserializer<'de> for &mut Deserializer<'event, I>
where
    I: IntoIterator<Item = Result<Event<'event>, Error>>,
{
    type Error = Error;

    fn deserialize_any<V>(self, visitor: V) -> Result<V::Value, Error>
    where
        V: de::Visitor<'de>,
    {
        match try_next!(self.events.next()) {
            Event::StartArray(len) => {
                let len = len.and_then(u64_to_usize);
                let ret = visitor.visit_seq(MapAndSeqAccess::new(self, false, len))?;
                expect!(self.events.next(), EventKind::EndCollection);
                Ok(ret)
            }
            Event::StartDictionary(len) => {
                let len = len.and_then(u64_to_usize);
                let ret = visitor.visit_map(MapAndSeqAccess::new(self, false, len))?;
                expect!(self.events.next(), EventKind::EndCollection);
                Ok(ret)
            }
            event @ Event::EndCollection => Err(error::unexpected_event_type(
                EventKind::ValueOrStartCollection,
                &event,
            )),

            Event::Boolean(v) => visitor.visit_bool(v),
            Event::Data(Cow::Borrowed(v)) => visitor.visit_bytes(v),
            Event::Data(Cow::Owned(v)) => visitor.visit_byte_buf(v),
            Event::Date(v) if self.in_plist_value => {
                visitor.visit_enum(MapAccessDeserializer::new(MapDeserializer::new(
                    [(DATE_NEWTYPE_STRUCT_NAME, v.to_xml_format())].into_iter(),
                )))
            }
            Event::Date(v) => visitor.visit_string(v.to_xml_format()),
            Event::Integer(v) => {
                if let Some(v) = v.as_unsigned() {
                    visitor.visit_u64(v)
                } else if let Some(v) = v.as_signed() {
                    visitor.visit_i64(v)
                } else {
                    unreachable!()
                }
            }
            Event::Real(v) => visitor.visit_f64(v),
            Event::String(Cow::Borrowed(v)) => visitor.visit_str(v),
            Event::String(Cow::Owned(v)) => visitor.visit_string(v),
            Event::Uid(v) if self.in_plist_value => visitor.visit_enum(MapAccessDeserializer::new(
                MapDeserializer::new([(UID_NEWTYPE_STRUCT_NAME, v.get())].i
```

---

# OUTRO - de.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_spanned-1.1.1\src\de.rs
**SHA:** 35820ad44a703f87
**Timestamp:** 2026-08-28T02:35:33.840898
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Option<usize>,
- start: Some(span.start),

### Ouro Bruto (primeiros 5000 chars)
```
//! Deserialization support for [`Spanned`]

use serde_core::de::IntoDeserializer as _;
use serde_core::de::value::BorrowedStrDeserializer;

use crate::Spanned;

/// Check if deserializing a [`Spanned`]
pub fn is_spanned(name: &'static str) -> bool {
    crate::spanned::is_spanned(name)
}

/// Deserializer / format support for emitting [`Spanned`]
pub struct SpannedDeserializer<'de, T, E>
where
    T: serde_core::de::IntoDeserializer<'de, E>,
    E: serde_core::de::Error,
{
    start: Option<usize>,
    end: Option<usize>,
    value: Option<T>,
    _lifetime: core::marker::PhantomData<&'de ()>,
    _error: core::marker::PhantomData<E>,
}

impl<'de, T, E> SpannedDeserializer<'de, T, E>
where
    T: serde_core::de::IntoDeserializer<'de, E>,
    E: serde_core::de::Error,
{
    /// Create a deserializer to emit [`Spanned`]
    pub fn new(value: T, span: core::ops::Range<usize>) -> Self {
        Self {
            start: Some(span.start),
            end: Some(span.end),
            value: Some(value),
            _lifetime: Default::default(),
            _error: Default::default(),
        }
    }
}

impl<'de, T, E> serde_core::de::MapAccess<'de> for SpannedDeserializer<'de, T, E>
where
    T: serde_core::de::IntoDeserializer<'de, E>,
    E: serde_core::de::Error,
{
    type Error = E;
    fn next_key_seed<K>(&mut self, seed: K) -> Result<Option<K::Value>, Self::Error>
    where
        K: serde_core::de::DeserializeSeed<'de>,
    {
        if self.start.is_some() {
            seed.deserialize(BorrowedStrDeserializer::new(Spanned::<T>::START_FIELD))
                .map(Some)
        } else if self.end.is_some() {
            seed.deserialize(BorrowedStrDeserializer::new(Spanned::<T>::END_FIELD))
                .map(Some)
        } else if self.value.is_some() {
            seed.deserialize(BorrowedStrDeserializer::new(Spanned::<T>::VALUE_FIELD))
                .map(Some)
        } else {
            Ok(None)
        }
    }

    fn next_value_seed<V>(&mut self, seed: V) -> Result<V::Value, Self::Error>
    where
        V: serde_core::de::DeserializeSeed<'de>,
    {
        if let Some(start) = self.start.take() {
            seed.deserialize(start.into_deserializer())
        } else if let Some(end) = self.end.take() {
            seed.deserialize(end.into_deserializer())
        } else if let Some(value) = self.value.take() {
            seed.deserialize(value.into_deserializer())
        } else {
            panic!("next_value_seed called before next_key_seed")
        }
    }
}

```
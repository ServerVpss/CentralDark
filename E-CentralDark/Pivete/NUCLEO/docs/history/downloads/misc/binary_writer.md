# OUTRO - binary_writer.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\plist-1.10.0\src\stream\binary_writer.rs
**SHA:** 80f579687a0bcb83
**Timestamp:** 2026-08-28T02:34:58.063778
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Revisit the design of `Event` once the `HashMap` raw interface is stabilised.

### Ouro Bruto (primeiros 5000 chars)
```
// TODO: Revisit the design of `Event` once the `HashMap` raw interface is stabilised.
// Ideally `Value`s would be stored inline in `Event`.

use indexmap::IndexMap;
use std::{
    borrow::Cow,
    io::{self, Write},
    num::NonZeroUsize,
};

use crate::{
    error::{self, Error, ErrorKind, EventKind},
    stream::Writer,
    Date, Integer, Uid,
};

pub struct BinaryWriter<W: Write> {
    writer: PosWriter<W>,
    events: Vec<Event>,
    dictionary_key_events: Vec<usize>,
    values: IndexMap<Value<'static>, ValueState>,
    /// Pointers into `events` for each of the currently unclosed `Collection` events.
    collection_stack: Vec<usize>,
    /// The number of `Collection` and unique `Value` events in `events`.
    num_objects: usize,
}

struct PosWriter<W: Write> {
    writer: W,
    pos: usize,
}

#[derive(Clone)]
struct ObjectRef(NonZeroUsize);

/// An array of `len` elements is stored as a `Collection` event followed by `skip_len` events
/// containing the contents of the array. e.g.
///
/// Collection(ty: Array, len: 2, skip_len: 2)
/// Value
/// Value
///
/// If the array contains another array or dictionary `len` and `skip_len` will differ. e.g.
///
/// Collection(ty: Array, len: 2, skip_len: 3)
/// Value
/// Collection(ty: Array, len: 1, skip_len: 1)
/// Value
///
/// A dictionary of `len` (key, value) pairs is stored as a `Collection` event followed by
/// `skip_len` events containing the contents of the dictionary. The dictionary values are stored
/// first. These are followed by a `DictionaryKeys` event and then the keys themselves. e.g.
///
/// Collection(ty: Dictionary, len: 2, skip_len: 6)
/// Value
/// Collection(ty: Array, len: 1, skip_len: 1)
/// Value
/// DictionaryKeys(2)
/// Value (Key)
/// Value (Key)
///
/// This arrangement simplifies writing dictionaries as they must be written in the order
/// (key, key, value, value) instead of (key, value, key, value) as they are passed to the writer.
/// Unclosed dictionaries have their keys stored in `dictionary_key_events` and these are only
/// moved to the end of the `BinaryWriter::events` array once the dictionary is closed in
/// `write_end_collection`.
enum Event {
    Collection(Collection),
    /// Index of the value in the `values` map.
    Value(usize),
    /// The number of dictionary keys following this event.
    DictionaryKeys(usize),
}

struct Collection {
    ty: CollectionType,
    /// The number of elements in an array or (key, value) pairs in a dictionary.
    /// Unclosed dictionaries have a `len` equal to the number of keys plus the number of values
    /// written so far. This is fixed up in `write_end_collection`.
    len: usize,
    /// The number of events to skip to get to the next element after the collection.
    skip: usize,
    object_ref: Option<ObjectRef>,
}

#[derive(Eq, PartialEq)]
enum CollectionType {
    Array,
    Dictionary,
}

#[derive(Eq, Hash, PartialEq)]
enum Value<'a> {
    Boolean(bool),
    Data(Cow<'a, [u8]>),
    Date(Date),
    Integer(Integer),
    /// Floats are deduplicated based on their bitwise value.
    Real(u64),
    String(Cow<'a, str>),
    Uid(Uid),
}

enum ValueState {
    /// The value has not been assigned an object reference.
    Unassigned,
    /// The value has been assigned an object reference but has not yet been written.
    Unwritten(ObjectRef),
    /// The value has been written with the given object reference.
    Written(ObjectRef),
}

impl<W: Write> BinaryWriter<W> {
    pub fn new(writer: W) -> BinaryWriter<W> {
        BinaryWriter {
            writer: PosWriter { writer, pos: 0 },
            events: Vec::new(),
            dictionary_key_events: Vec::new(),
            values: IndexMap::new(),
            collection_stack: Vec::new(),
            num_objects: 0,
        }
    }

    fn write_start_collection(&mut self, ty: CollectionType) -> Result<(), Error> {
        if self.expecting_dictionary_key() {
            let ty_event_kind = match ty {
                CollectionType::Array => EventKind::StartArray,
                CollectionType::Dictionary => EventKind::StartDictionary,
            };
            return Err(ErrorKind::UnexpectedEventType {
                expected: EventKind::DictionaryKeyOrEndCollection,
                found: ty_event_kind,
            }
            .without_position());
        }
        self.increment_current_collection_len();
        self.collection_stack.push(self.events.len());
        self.events.push(Event::Collection(Collection {
            ty,
            len: 0,
            skip: 0,
            object_ref: None,
        }));
        self.num_objects += 1;
        Ok(())
    }

    fn write_end_collection(&mut self) -> Result<(), Error> {
        let collection_event_index = self.collection_stack.pop().ok_or_else(|| {
            ErrorKind::UnexpectedEventType {
                expected: EventKind::ValueOrStartCollection,
                found: EventKind::EndCollection,
            }
            .without_position()
        
```
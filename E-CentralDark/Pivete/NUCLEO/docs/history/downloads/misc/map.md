# OUTRO - map.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\http-1.5.0\src\header\map.rs
**SHA:** fff2c8490382c7e7
**Timestamp:** 2026-08-28T02:34:17.033836
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: This can't overflow if done properly... since the max # of

### Ouro Bruto (primeiros 5000 chars)
```
use std::collections::hash_map::RandomState;
use std::collections::HashMap;
use std::convert::TryFrom;
use std::hash::{BuildHasher, Hash, Hasher};
use std::iter::{FromIterator, FusedIterator};
use std::marker::PhantomData;
use std::{fmt, mem, ops, ptr, vec};

use crate::Error;

use super::name::{HdrName, HeaderName, InvalidHeaderName};
use super::HeaderValue;

pub use self::as_header_name::AsHeaderName;
pub use self::into_header_name::IntoHeaderName;

/// A specialized [multimap](<https://en.wikipedia.org/wiki/Multimap>) for
/// header names and values.
///
/// # Overview
///
/// `HeaderMap` is designed specifically for efficient manipulation of HTTP
/// headers. It supports multiple values per header name and provides
/// specialized APIs for insertion, retrieval, and iteration.
///
/// The internal implementation is optimized for common usage patterns in HTTP,
/// and may change across versions. For example, the current implementation uses
/// [Robin Hood
/// hashing](<https://en.wikipedia.org/wiki/Hash_table#Robin_Hood_hashing>) to
/// store entries compactly and enable high load factors with good performance.
/// However, the collision resolution strategy and storage mechanism are not
/// part of the public API and may be altered in future releases.
///
/// # Iteration order
///
/// Unless otherwise specified, the order in which items are returned by
/// iterators from `HeaderMap` methods is arbitrary; there is no guaranteed
/// ordering among the elements yielded by such an iterator. Changes to the
/// iteration order are not considered breaking changes, so users must not rely
/// on any incidental order produced by such an iterator. However, for a given
/// crate version, the iteration order will be consistent across all platforms.
///
/// # Adaptive hashing
///
/// `HeaderMap` uses an adaptive strategy for hashing to maintain fast lookups
/// while resisting hash collision attacks. The default hash function
/// prioritizes performance. In scenarios where high collision rates are
/// detected—typically indicative of denial-of-service attacks—the
/// implementation switches to a more secure, collision-resistant hash function.
///
/// # Limitations
///
/// A `HeaderMap` can store at most 32,768 entries \(header name/value pairs\).
/// Attempting to exceed this limit will result in a panic.
///
/// [`HeaderName`]: struct.HeaderName.html
/// [`HeaderMap`]: struct.HeaderMap.html
///
/// # Examples
///
/// Basic usage
///
/// ```
/// # use http::HeaderMap;
/// # use http::header::{CONTENT_LENGTH, HOST, LOCATION};
/// let mut headers = HeaderMap::new();
///
/// headers.insert(HOST, "example.com".parse().unwrap());
/// headers.insert(CONTENT_LENGTH, "123".parse().unwrap());
///
/// assert!(headers.contains_key(HOST));
/// assert!(!headers.contains_key(LOCATION));
///
/// assert_eq!(headers[HOST], "example.com");
///
/// headers.remove(HOST);
///
/// assert!(!headers.contains_key(HOST));
/// ```
#[derive(Clone)]
pub struct HeaderMap<T = HeaderValue> {
    // Used to mask values to get an index
    mask: Size,
    indices: Box<[Pos]>,
    entries: Vec<Bucket<T>>,
    extra_values: Vec<ExtraValue<T>>,
    danger: Danger,
}

// # Implementation notes
//
// Below, you will find a fairly large amount of code. Most of this is to
// provide the necessary functions to efficiently manipulate the header
// multimap. The core hashing table is based on robin hood hashing [1]. While
// this is the same hashing algorithm used as part of Rust's `HashMap` in
// stdlib, many implementation details are different. The two primary reasons
// for this divergence are that `HeaderMap` is a multimap and the structure has
// been optimized to take advantage of the characteristics of HTTP headers.
//
// ## Structure Layout
//
// Most of the data contained by `HeaderMap` is *not* stored in the hash table.
// Instead, pairs of header name and *first* associated header value are stored
// in the `entries` vector. If the header name has more than one associated
// header value, then additional values are stored in `extra_values`. The actual
// hash table (`indices`) only maps hash codes to indices in `entries`. This
// means that, when an eviction happens, the actual header name and value stay
// put and only a tiny amount of memory has to be copied.
//
// Extra values associated with a header name are tracked using a linked list.
// Links are formed with offsets into `extra_values` and not pointers.
//
// [1]: https://en.wikipedia.org/wiki/Hash_table#Robin_Hood_hashing

/// `HeaderMap` entry iterator.
///
/// Yields `(&HeaderName, &value)` tuples. The same header name may be yielded
/// more than once if it has more than one associated value.
#[derive(Debug)]
pub struct Iter<'a, T> {
    map: &'a HeaderMap<T>,
    entry: usize,
    cursor: Option<Cursor>,
}

/// `HeaderMap` mutable entry iterator
///
/// Yields `(&HeaderName, &mut value)` tuples. The same header name may be
/// yielded more than once if it has more than one associated val
```

---

# OUTRO - map.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\de\map.rs
**SHA:** 8ac643f71eb47eb7
**Timestamp:** 2026-08-28T02:35:00.947556
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// [`name()`]: BytesStart::name()
- /// [`name()`]: BytesStart::name()
- start: BytesStart<'de>,
- start: BytesStart<'de>,
- fn should_skip_subtree(&self, start: &BytesStart) -> bool {
- /// This deserializer can see two kind of events at the start:
- fn not_in(fields: &'static [&'static str], start: &BytesStart) -> Result<bool, DeError> {
- fn is_suitable(&self, start: &BytesStart) -> Result<bool, DeError> {
- start: BytesStart<'de>,
- let tag = BytesStart::new("tag");

### Gaps
- // TODO: respect the `xml:space` attribute and probably some deserialized type sign
- // TODO: Customization point - may customize prefix
- // TODO: This should be handled by #[serde(flatten)]
- // TODO: Read the whole content to fix https://github.com/tafia/quick-xml/issues/483
- Include(BytesStart<'de>), //TODO: Need to store only name instead of a whole tag

### Ouro Bruto (primeiros 5000 chars)
```
//! Serde `Deserializer` module

use crate::{
    de::key::QNameDeserializer,
    de::resolver::EntityResolver,
    de::simple_type::SimpleTypeDeserializer,
    de::text::TextDeserializer,
    de::{DeEvent, Deserializer, XmlRead, TEXT_KEY, VALUE_KEY},
    errors::serialize::DeError,
    errors::Error,
    events::attributes::IterState,
    events::BytesStart,
    name::QName,
};
use serde::de::value::BorrowedStrDeserializer;
use serde::de::{self, DeserializeSeed, Deserializer as _, MapAccess, SeqAccess, Visitor};
use std::borrow::Cow;
use std::ops::Range;

/// Defines a source that should be used to deserialize a value in the next call
/// to [`next_value_seed()`](MapAccess::next_value_seed)
#[derive(Debug, PartialEq)]
enum ValueSource {
    /// Source are not specified, because [`next_key_seed()`] not yet called.
    /// This is an initial state and state after deserializing value
    /// (after call of [`next_value_seed()`]).
    ///
    /// Attempt to call [`next_value_seed()`] while accessor in this state would
    /// return a [`DeError::KeyNotRead`] error.
    ///
    /// [`next_key_seed()`]: MapAccess::next_key_seed
    /// [`next_value_seed()`]: MapAccess::next_value_seed
    Unknown,
    /// Next value should be deserialized from an attribute value; value is located
    /// at specified span.
    Attribute(Range<usize>),
    /// Value should be deserialized from the text content of the XML node, which
    /// represented or by an ordinary text node, or by a CDATA node:
    ///
    /// ```xml
    /// <any-tag>
    ///     <key>text content</key>
    /// <!--     ^^^^^^^^^^^^ - this will be used to deserialize map value -->
    /// </any-tag>
    /// ```
    /// ```xml
    /// <any-tag>
    ///     <key><![CDATA[cdata content]]></key>
    /// <!--              ^^^^^^^^^^^^^ - this will be used to deserialize a map value -->
    /// </any-tag>
    /// ```
    Text,
    /// Next value should be deserialized from an element with an any name, except
    /// elements with a name matching one of the struct fields. Corresponding tag
    /// name will always be associated with a field with name [`VALUE_KEY`].
    ///
    /// That state is set when call to [`peek()`] returns a [`Start`] event, which
    /// [`name()`] is not listed in the [list of known fields] (which for a struct
    /// is a list of field names, and for a map that is an empty list), _and_
    /// struct has a field with a special name [`VALUE_KEY`].
    ///
    /// When in this state, next event, returned by [`next()`], will be a [`Start`],
    /// which represents both a key, and a value. Value would be deserialized from
    /// the whole element and how is will be done determined by the value deserializer.
    /// The [`ElementMapAccess`] do not consume any events in that state.
    ///
    /// Because in that state any encountered `<tag>` is mapped to the [`VALUE_KEY`]
    /// field, it is possible to use tag name as an enum discriminator, so `enum`s
    /// can be deserialized from that XMLs:
    ///
    /// ```xml
    /// <any-tag>
    ///     <variant1>...</variant1>
    /// <!-- ~~~~~~~~               - this data will determine that this is Enum::variant1 -->
    /// <!--^^^^^^^^^^^^^^^^^^^^^^^ - this data will be used to deserialize a map value -->
    /// </any-tag>
    /// ```
    /// ```xml
    /// <any-tag>
    ///     <variant2>...</variant2>
    /// <!-- ~~~~~~~~               - this data will determine that this is Enum::variant2 -->
    /// <!--^^^^^^^^^^^^^^^^^^^^^^^ - this data will be used to deserialize a map value -->
    /// </any-tag>
    /// ```
    ///
    /// both can be deserialized into
    ///
    /// ```ignore
    /// enum Enum {
    ///   variant1,
    ///   variant2,
    /// }
    /// struct AnyName {
    ///   #[serde(rename = "$value")]
    ///   field: Enum,
    /// }
    /// ```
    ///
    /// That is possible, because value deserializer have access to the full content
    /// of a `<variant1>...</variant1>` or `<variant2>...</variant2>` node, including
    /// the tag name.
    ///
    /// [`Start`]: DeEvent::Start
    /// [`peek()`]: Deserializer::peek()
    /// [`next()`]: Deserializer::next()
    /// [`name()`]: BytesStart::name()
    /// [`Text`]: Self::Text
    /// [list of known fields]: ElementMapAccess::fields
    Content,
    /// Next value should be deserialized from an element with a dedicated name.
    /// If deserialized type is a sequence, then that sequence will collect all
    /// elements with the same name until it will be filled. If not all elements
    /// would be consumed, the rest will be ignored.
    ///
    /// That state is set when call to [`peek()`] returns a [`Start`] event, which
    /// [`name()`] represents a field name. That name will be deserialized as a key.
    ///
    /// When in this state, next event, returned by [`next()`], will be a [`Start`],
    /// which represents both a key, and a value. Value would be deserialized from
    /// the whole element and how is w
```

---

# OUTRO - map.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\nfa\thompson\map.rs
**SHA:** fcd17ce7359b5179
**Timestamp:** 2026-08-28T02:35:06.330833
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub start: u8,

### Ouro Bruto (primeiros 5000 chars)
```
// This module contains a couple simple and purpose built hash maps. The key
// trade off they make is that they serve as caches rather than true maps. That
// is, inserting a new entry may cause eviction of another entry. This gives
// us two things. First, there's less overhead associated with inserts and
// lookups. Secondly, it lets us control our memory usage.
//
// These maps are used in some fairly hot code when generating NFA states for
// large Unicode character classes.
//
// Instead of exposing a rich hashmap entry API, we just permit the caller to
// produce a hash of the key directly. The hash can then be reused for both
// lookups and insertions at the cost of leaking abstraction a bit. But these
// are for internal use only, so it's fine.
//
// The Utf8BoundedMap is used for Daciuk's algorithm for constructing a
// (almost) minimal DFA for large Unicode character classes in linear time.
// (Daciuk's algorithm is always used when compiling forward NFAs. For reverse
// NFAs, it's only used when the compiler is configured to 'shrink' the NFA,
// since there's a bit more expense in the reverse direction.)
//
// The Utf8SuffixMap is used when compiling large Unicode character classes for
// reverse NFAs when 'shrink' is disabled. Specifically, it augments the naive
// construction of UTF-8 automata by caching common suffixes. This doesn't
// get the same space savings as Daciuk's algorithm, but it's basically as
// fast as the naive approach and typically winds up using less memory (since
// it generates smaller NFAs) despite the presence of the cache.
//
// These maps effectively represent caching mechanisms for sparse and
// byte-range NFA states, respectively. The former represents a single NFA
// state with many transitions of equivalent priority while the latter
// represents a single NFA state with a single transition. (Neither state ever
// has or is an epsilon transition.) Thus, they have different key types. It's
// likely we could make one generic map, but the machinery didn't seem worth
// it. They are simple enough.

use alloc::{vec, vec::Vec};

use crate::{
    nfa::thompson::Transition,
    util::{
        int::{Usize, U64},
        primitives::StateID,
    },
};

// Basic FNV-1a hash constants as described in:
// https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
const PRIME: u64 = 1099511628211;
const INIT: u64 = 14695981039346656037;

/// A bounded hash map where the key is a sequence of NFA transitions and the
/// value is a pre-existing NFA state ID.
///
/// std's hashmap can be used for this, however, this map has two important
/// advantages. Firstly, it has lower overhead. Secondly, it permits us to
/// control our memory usage by limited the number of slots. In general, the
/// cost here is that this map acts as a cache. That is, inserting a new entry
/// may remove an old entry. We are okay with this, since it does not impact
/// correctness in the cases where it is used. The only effect that dropping
/// states from the cache has is that the resulting NFA generated may be bigger
/// than it otherwise would be.
///
/// This improves benchmarks that compile large Unicode character classes,
/// since it makes the generation of (almost) minimal UTF-8 automaton faster.
/// Specifically, one could observe the difference with std's hashmap via
/// something like the following benchmark:
///
///   hyperfine "regex-cli debug thompson -qr --captures none '\w{90} ecurB'"
///
/// But to observe that difference, you'd have to modify the code to use
/// std's hashmap.
///
/// It is quite possible that there is a better way to approach this problem.
/// For example, if there happens to be a very common state that collides with
/// a lot of less frequent states, then we could wind up with very poor caching
/// behavior. Alas, the effectiveness of this cache has not been measured.
/// Instead, ad hoc experiments suggest that it is "good enough." Additional
/// smarts (such as an LRU eviction policy) have to be weighed against the
/// amount of extra time they cost.
#[derive(Clone, Debug)]
pub struct Utf8BoundedMap {
    /// The current version of this map. Only entries with matching versions
    /// are considered during lookups. If an entry is found with a mismatched
    /// version, then the map behaves as if the entry does not exist.
    ///
    /// This makes it possible to clear the map by simply incrementing the
    /// version number instead of actually deallocating any storage.
    version: u16,
    /// The total number of entries this map can store.
    capacity: usize,
    /// The actual entries, keyed by hash. Collisions between different states
    /// result in the old state being dropped.
    map: Vec<Utf8BoundedEntry>,
}

/// An entry in this map.
#[derive(Clone, Debug, Default)]
struct Utf8BoundedEntry {
    /// The version of the map used to produce this entry. If this entry's
    /// version does not match the current version of the map, then the m
```

---

# OUTRO - map.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-0.11.6\src\map\map.rs
**SHA:** 9d9bfe4085af6742
**Timestamp:** 2026-08-28T02:37:45.723761
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // ZeroMap has only one invariant: keys.len() == values.len()

### Principios
- // ZeroMap has only one invariant: keys.len() == values.len()

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use super::*;
use crate::ule::{AsULE, EncodeAsVarULE, UleError, VarULE};
use crate::{VarZeroVec, ZeroSlice, ZeroVec};
use alloc::boxed::Box;
use core::borrow::Borrow;
use core::cmp::Ordering;
use core::fmt;
use core::iter::FromIterator;

/// A zero-copy map datastructure, built on sorted binary-searchable [`ZeroVec`]
/// and [`VarZeroVec`].
///
/// This type, like [`ZeroVec`] and [`VarZeroVec`], is able to zero-copy
/// deserialize from appropriately formatted byte buffers. It is internally copy-on-write, so it can be mutated
/// afterwards as necessary.
///
/// Internally, a `ZeroMap` is a zero-copy vector for keys paired with a zero-copy vector for
/// values, sorted by the keys. Therefore, all types used in `ZeroMap` need to work with either
/// [`ZeroVec`] or [`VarZeroVec`].
///
/// This does mean that for fixed-size data, one must use the regular type (`u32`, `u8`, `char`, etc),
/// whereas for variable-size data, `ZeroMap` will use the dynamically sized version (`str` not `String`,
/// `ZeroSlice` not `ZeroVec`, `FooULE` not `Foo` for custom types)
///
/// # Examples
///
/// ```
/// use zerovec::ZeroMap;
///
/// #[derive(serde::Serialize, serde::Deserialize)]
/// struct Data<'a> {
///     #[serde(borrow)]
///     map: ZeroMap<'a, u32, str>,
/// }
///
/// let mut map = ZeroMap::new();
/// map.insert(&1, "one");
/// map.insert(&2, "two");
/// map.insert(&4, "four");
///
/// let data = Data { map };
///
/// let bincode_bytes =
///     bincode::serialize(&data).expect("Serialization should be successful");
///
/// // Will deserialize without any allocations
/// let deserialized: Data = bincode::deserialize(&bincode_bytes)
///     .expect("Deserialization should be successful");
///
/// assert_eq!(data.map.get(&1), Some("one"));
/// assert_eq!(data.map.get(&2), Some("two"));
/// ```
///
/// [`VarZeroVec`]: crate::VarZeroVec
// ZeroMap has only one invariant: keys.len() == values.len()
// It is also expected that the keys are sorted, but this is not an invariant. See #1433
pub struct ZeroMap<'a, K, V>
where
    K: ZeroMapKV<'a> + ?Sized,
    V: ZeroMapKV<'a> + ?Sized,
{
    pub(crate) keys: K::Container,
    pub(crate) values: V::Container,
}

impl<'a, K, V> Default for ZeroMap<'a, K, V>
where
    K: ZeroMapKV<'a> + ?Sized,
    V: ZeroMapKV<'a> + ?Sized,
{
    fn default() -> Self {
        Self::new()
    }
}

impl<'a, K, V> ZeroMap<'a, K, V>
where
    K: ZeroMapKV<'a> + ?Sized,
    V: ZeroMapKV<'a> + ?Sized,
{
    /// Creates a new, empty `ZeroMap<K, V>`.
    ///
    /// # Examples
    ///
    /// ```
    /// use zerovec::ZeroMap;
    ///
    /// let zm: ZeroMap<u16, str> = ZeroMap::new();
    /// assert!(zm.is_empty());
    /// ```
    pub fn new() -> Self {
        Self {
            keys: K::Container::zvl_with_capacity(0),
            values: V::Container::zvl_with_capacity(0),
        }
    }

    #[doc(hidden)] // databake internal
    pub const unsafe fn from_parts_unchecked(keys: K::Container, values: V::Container) -> Self {
        Self { keys, values }
    }

    /// Construct a new [`ZeroMap`] with a given capacity
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            keys: K::Container::zvl_with_capacity(capacity),
            values: V::Container::zvl_with_capacity(capacity),
        }
    }

    /// Obtain a borrowed version of this map
    pub fn as_borrowed(&'a self) -> ZeroMapBorrowed<'a, K, V> {
        ZeroMapBorrowed {
            keys: self.keys.zvl_as_borrowed(),
            values: self.values.zvl_as_borrowed(),
        }
    }

    /// The number of elements in the [`ZeroMap`]
    pub fn len(&self) -> usize {
        self.values.zvl_len()
    }

    /// Whether the [`ZeroMap`] is empty
    pub fn is_empty(&self) -> bool {
        self.values.zvl_len() == 0
    }

    /// Remove all elements from the [`ZeroMap`]
    pub fn clear(&mut self) {
        self.keys.zvl_clear();
        self.values.zvl_clear();
    }

    /// Reserve capacity for `additional` more elements to be inserted into
    /// the [`ZeroMap`] to avoid frequent reallocations.
    ///
    /// See [`Vec::reserve()`](alloc::vec::Vec::reserve) for more information.
    pub fn reserve(&mut self, additional: usize) {
        self.keys.zvl_reserve(additional);
        self.values.zvl_reserve(additional);
    }
}
impl<'a, K, V> ZeroMap<'a, K, V>
where
    K: ZeroMapKV<'a> + ?Sized + Ord,
    V: ZeroMapKV<'a> + ?Sized,
{
    /// Get the value associated with `key`, if it exists.
    ///
    /// For fixed-size ([`AsULE`]) `V` types, this _will_ return
    /// their corresponding [`AsULE::ULE`] type. If you wish to work with the `V`
    /// type directly, [`Self::get_copied()`] exists for convenience.
    ///
    /// ```rust
    /// use zerovec::ZeroMap;
    ///
    /// let mut map = ZeroMap::new();
    
```

---

# OUTRO - map.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\zerovec-0.11.6\src\map2d\map.rs
**SHA:** b54ef8675f31eca8
**Timestamp:** 2026-08-28T02:37:45.883973
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let range_start = range.start;

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use crate::ule::AsULE;
use crate::ZeroVec;
use core::borrow::Borrow;
use core::cmp::Ordering;
use core::convert::TryFrom;
use core::fmt;
use core::iter::FromIterator;
use core::ops::Range;

use super::*;
use crate::map::ZeroMapKV;
use crate::map::{MutableZeroVecLike, ZeroVecLike};

/// A zero-copy, two-dimensional map datastructure .
///
/// This is an extension of [`ZeroMap`] that supports two layers of keys. For example,
/// to map a pair of an integer and a string to a buffer, you can write:
///
/// ```no_run
/// # use zerovec::ZeroMap2d;
/// let _: ZeroMap2d<u32, str, [u8]> = unimplemented!();
/// ```
///
/// Internally, `ZeroMap2d` stores four zero-copy vectors, one for each type argument plus
/// one more to match between the two vectors of keys.
///
/// # Examples
///
/// ```
/// use zerovec::ZeroMap2d;
///
/// // Example byte buffer representing the map { 1: {2: "three" } }
/// let BINCODE_BYTES: &[u8; 47] = &[
///     2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0,
///     0, 0, 0, 0, 0, 0, 2, 0, 7, 0, 0, 0, 0, 0, 0, 0, 1, 0, 116, 104, 114,
///     101, 101,
/// ];
///
/// // Deserializing to ZeroMap requires no heap allocations.
/// let zero_map: ZeroMap2d<u16, u16, str> =
///     bincode::deserialize(BINCODE_BYTES)
///         .expect("Should deserialize successfully");
/// assert_eq!(zero_map.get_2d(&1, &2), Some("three"));
/// ```
///
/// [`VarZeroVec`]: crate::VarZeroVec
/// [`ZeroMap`]: crate::ZeroMap
// ZeroMap2d contains 4 fields:
//
// - keys0 = sorted list of all K0 in the map
// - joiner = helper vec that maps from a K0 to a range of keys1
// - keys1 = list of all K1 in the map, sorted in ranges for each K0
// - values = list of all values in the map, sorted by (K0, K1)
//
// For a particular K0 at index i, the range of keys1 corresponding to K0 is
// (joiner[i-1]..joiner[i]), where the first range starts at 0.
//
// Required Invariants:
//
// 1. len(keys0) == len(joiner)
// 2. len(keys1) == len(values)
// 3. joiner is sorted
// 4. the last element of joiner is the length of keys1
//
// Optional Invariants:
//
// 5. keys0 is sorted (for binary_search)
// 6. ranges within keys1 are sorted (for binary_search)
// 7. every K0 is associated with at least one K1 (no empty ranges)
//
// During deserialization, these three invariants are not checked, because they put the
// ZeroMap2d in a deterministic state, even though it may have unexpected behavior.
pub struct ZeroMap2d<'a, K0, K1, V>
where
    K0: ZeroMapKV<'a>,
    K1: ZeroMapKV<'a>,
    V: ZeroMapKV<'a>,
    K0: ?Sized,
    K1: ?Sized,
    V: ?Sized,
{
    pub(crate) keys0: K0::Container,
    pub(crate) joiner: ZeroVec<'a, u32>,
    pub(crate) keys1: K1::Container,
    pub(crate) values: V::Container,
}

impl<'a, K0, K1, V> Default for ZeroMap2d<'a, K0, K1, V>
where
    K0: ZeroMapKV<'a>,
    K1: ZeroMapKV<'a>,
    V: ZeroMapKV<'a>,
    K0: ?Sized,
    K1: ?Sized,
    V: ?Sized,
{
    fn default() -> Self {
        Self::new()
    }
}

impl<'a, K0, K1, V> ZeroMap2d<'a, K0, K1, V>
where
    K0: ZeroMapKV<'a>,
    K1: ZeroMapKV<'a>,
    V: ZeroMapKV<'a>,
    K0: ?Sized,
    K1: ?Sized,
    V: ?Sized,
{
    /// Creates a new, empty `ZeroMap2d`.
    ///
    /// # Examples
    ///
    /// ```
    /// use zerovec::ZeroMap2d;
    ///
    /// let zm: ZeroMap2d<u16, str, str> = ZeroMap2d::new();
    /// assert!(zm.is_empty());
    /// ```
    pub fn new() -> Self {
        Self {
            keys0: K0::Container::zvl_with_capacity(0),
            joiner: ZeroVec::new(),
            keys1: K1::Container::zvl_with_capacity(0),
            values: V::Container::zvl_with_capacity(0),
        }
    }

    #[doc(hidden)] // databake internal
    pub const unsafe fn from_parts_unchecked(
        keys0: K0::Container,
        joiner: ZeroVec<'a, u32>,
        keys1: K1::Container,
        values: V::Container,
    ) -> Self {
        Self {
            keys0,
            joiner,
            keys1,
            values,
        }
    }

    /// Construct a new [`ZeroMap2d`] with a given capacity
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            keys0: K0::Container::zvl_with_capacity(capacity),
            joiner: ZeroVec::with_capacity(capacity),
            keys1: K1::Container::zvl_with_capacity(capacity),
            values: V::Container::zvl_with_capacity(capacity),
        }
    }

    /// Obtain a borrowed version of this map
    pub fn as_borrowed(&'a self) -> ZeroMap2dBorrowed<'a, K0, K1, V> {
        ZeroMap2dBorrowed {
            keys0: self.keys0.zvl_as_borrowed(),
            joiner: &self.joiner,
            keys1: self.keys1.zvl_as_borrowed(),
            values: self.values.zvl_as_borrowed(),
        }
    }

    /// The number of values in the [`ZeroMap2d`]
    pub fn len(&self) -> usize {
```
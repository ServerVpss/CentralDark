# OUTRO - alphabet.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\util\alphabet.rs
**SHA:** 6dc22658a38deddc
**Timestamp:** 2026-08-28T02:32:20.045505
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if start == end {
- pub(crate) fn set_range(&mut self, start: u8, end: u8) {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::util::int::Usize;

/// A representation of byte oriented equivalence classes.
///
/// This is used in finite state machines to reduce the size of the transition
/// table. This can have a particularly large impact not only on the total size
/// of an FSM, but also on FSM build times because it reduces the number of
/// transitions that need to be visited/set.
#[derive(Clone, Copy)]
pub(crate) struct ByteClasses([u8; 256]);

impl ByteClasses {
    /// Creates a new set of equivalence classes where all bytes are mapped to
    /// the same class.
    pub(crate) fn empty() -> ByteClasses {
        ByteClasses([0; 256])
    }

    /// Creates a new set of equivalence classes where each byte belongs to
    /// its own equivalence class.
    pub(crate) fn singletons() -> ByteClasses {
        let mut classes = ByteClasses::empty();
        for b in 0..=255 {
            classes.set(b, b);
        }
        classes
    }

    /// Set the equivalence class for the given byte.
    #[inline]
    pub(crate) fn set(&mut self, byte: u8, class: u8) {
        self.0[usize::from(byte)] = class;
    }

    /// Get the equivalence class for the given byte.
    #[inline]
    pub(crate) fn get(&self, byte: u8) -> u8 {
        self.0[usize::from(byte)]
    }

    /// Return the total number of elements in the alphabet represented by
    /// these equivalence classes. Equivalently, this returns the total number
    /// of equivalence classes.
    #[inline]
    pub(crate) fn alphabet_len(&self) -> usize {
        // Add one since the number of equivalence classes is one bigger than
        // the last one.
        usize::from(self.0[255]) + 1
    }

    /// Returns the stride, as a base-2 exponent, required for these
    /// equivalence classes.
    ///
    /// The stride is always the smallest power of 2 that is greater than or
    /// equal to the alphabet length. This is done so that converting between
    /// state IDs and indices can be done with shifts alone, which is much
    /// faster than integer division. The "stride2" is the exponent. i.e.,
    /// `2^stride2 = stride`.
    pub(crate) fn stride2(&self) -> usize {
        let zeros = self.alphabet_len().next_power_of_two().trailing_zeros();
        usize::try_from(zeros).unwrap()
    }

    /// Returns the stride for these equivalence classes, which corresponds
    /// to the smallest power of 2 greater than or equal to the number of
    /// equivalence classes.
    pub(crate) fn stride(&self) -> usize {
        1 << self.stride2()
    }

    /// Returns true if and only if every byte in this class maps to its own
    /// equivalence class. Equivalently, there are 257 equivalence classes
    /// and each class contains exactly one byte (plus the special EOI class).
    #[inline]
    pub(crate) fn is_singleton(&self) -> bool {
        self.alphabet_len() == 256
    }

    /// Returns an iterator over all equivalence classes in this set.
    pub(crate) fn iter(&self) -> ByteClassIter {
        ByteClassIter { it: 0..self.alphabet_len() }
    }

    /// Returns an iterator of the bytes in the given equivalence class.
    pub(crate) fn elements(&self, class: u8) -> ByteClassElements {
        ByteClassElements { classes: self, class, bytes: 0..=255 }
    }

    /// Returns an iterator of byte ranges in the given equivalence class.
    ///
    /// That is, a sequence of contiguous ranges are returned. Typically, every
    /// class maps to a single contiguous range.
    fn element_ranges(&self, class: u8) -> ByteClassElementRanges {
        ByteClassElementRanges { elements: self.elements(class), range: None }
    }
}

impl core::fmt::Debug for ByteClasses {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        if self.is_singleton() {
            write!(f, "ByteClasses(<one-class-per-byte>)")
        } else {
            write!(f, "ByteClasses(")?;
            for (i, class) in self.iter().enumerate() {
                if i > 0 {
                    write!(f, ", ")?;
                }
                write!(f, "{:?} => [", class)?;
                for (start, end) in self.element_ranges(class) {
                    if start == end {
                        write!(f, "{:?}", start)?;
                    } else {
                        write!(f, "{:?}-{:?}", start, end)?;
                    }
                }
                write!(f, "]")?;
            }
            write!(f, ")")
        }
    }
}

/// An iterator over each equivalence class.
#[derive(Debug)]
pub(crate) struct ByteClassIter {
    it: core::ops::Range<usize>,
}

impl Iterator for ByteClassIter {
    type Item = u8;

    fn next(&mut self) -> Option<u8> {
        self.it.next().map(|class| class.as_u8())
    }
}

/// An iterator over all elements in a specific equivalence class.
#[derive(Debug)]
pub(crate) struct ByteClassElements<'a> {
    classes: &'a ByteClasses,
    class: u8,
    bytes: core::ops::RangeInclusive<u8>,
}

impl<'a> Iterator for ByteClassElements<'a
```

---

# OUTRO - alphabet.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\util\alphabet.rs
**SHA:** 4f94d317459b43c7
**Timestamp:** 2026-08-28T02:35:06.484880
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if start == end {
- write!(f, "{start:?}")?;
- write!(f, "{start:?}-{end:?}")?;
- pub(crate) fn set_range(&mut self, start: u8, end: u8) {
- pub(crate) fn contains_range(&self, start: u8, end: u8) -> bool {
- let start = asu8(self.b);

### Ouro Bruto (primeiros 5000 chars)
```
/*!
This module provides APIs for dealing with the alphabets of finite state
machines.

There are two principal types in this module, [`ByteClasses`] and [`Unit`].
The former defines the alphabet of a finite state machine while the latter
represents an element of that alphabet.

To a first approximation, the alphabet of all automata in this crate is just
a `u8`. Namely, every distinct byte value. All 256 of them. In practice, this
can be quite wasteful when building a transition table for a DFA, since it
requires storing a state identifier for each element in the alphabet. Instead,
we collapse the alphabet of an automaton down into equivalence classes, where
every byte in the same equivalence class never discriminates between a match or
a non-match from any other byte in the same class. For example, in the regex
`[a-z]+`, then you could consider it having an alphabet consisting of two
equivalence classes: `a-z` and everything else. In terms of the transitions on
an automaton, it doesn't actually require representing every distinct byte.
Just the equivalence classes.

The downside of equivalence classes is that, of course, searching a haystack
deals with individual byte values. Those byte values need to be mapped to
their corresponding equivalence class. This is what `ByteClasses` does. In
practice, doing this for every state transition has negligible impact on modern
CPUs. Moreover, it helps make more efficient use of the CPU cache by (possibly
considerably) shrinking the size of the transition table.

One last hiccup concerns `Unit`. Namely, because of look-around and how the
DFAs in this crate work, we need to add a sentinel value to our alphabet
of equivalence classes that represents the "end" of a search. We call that
sentinel [`Unit::eoi`] or "end of input." Thus, a `Unit` is either an
equivalence class corresponding to a set of bytes, or it is a special "end of
input" sentinel.

In general, you should not expect to need either of these types unless you're
doing lower level shenanigans with DFAs, or even building your own DFAs.
(Although, you don't have to use these types to build your own DFAs of course.)
For example, if you're walking a DFA's state graph, it's probably useful to
make use of [`ByteClasses`] to visit each element in the DFA's alphabet instead
of just visiting every distinct `u8` value. The latter isn't necessarily wrong,
but it could be potentially very wasteful.
*/
use crate::util::{
    escape::DebugByte,
    wire::{self, DeserializeError, SerializeError},
};

/// Unit represents a single unit of haystack for DFA based regex engines.
///
/// It is not expected for consumers of this crate to need to use this type
/// unless they are implementing their own DFA. And even then, it's not
/// required: implementors may use other techniques to handle haystack units.
///
/// Typically, a single unit of haystack for a DFA would be a single byte.
/// However, for the DFAs in this crate, matches are delayed by a single byte
/// in order to handle look-ahead assertions (`\b`, `$` and `\z`). Thus, once
/// we have consumed the haystack, we must run the DFA through one additional
/// transition using a unit that indicates the haystack has ended.
///
/// There is no way to represent a sentinel with a `u8` since all possible
/// values *may* be valid haystack units to a DFA, therefore this type
/// explicitly adds room for a sentinel value.
///
/// The sentinel EOI value is always its own equivalence class and is
/// ultimately represented by adding 1 to the maximum equivalence class value.
/// So for example, the regex `^[a-z]+$` might be split into the following
/// equivalence classes:
///
/// ```text
/// 0 => [\x00-`]
/// 1 => [a-z]
/// 2 => [{-\xFF]
/// 3 => [EOI]
/// ```
///
/// Where EOI is the special sentinel value that is always in its own
/// singleton equivalence class.
#[derive(Clone, Copy, Eq, PartialEq, PartialOrd, Ord)]
pub struct Unit(UnitKind);

#[derive(Clone, Copy, Eq, PartialEq, PartialOrd, Ord)]
enum UnitKind {
    /// Represents a byte value, or more typically, an equivalence class
    /// represented as a byte value.
    U8(u8),
    /// Represents the "end of input" sentinel. We regrettably use a `u16`
    /// here since the maximum sentinel value is `256`. Thankfully, we don't
    /// actually store a `Unit` anywhere, so this extra space shouldn't be too
    /// bad.
    EOI(u16),
}

impl Unit {
    /// Create a new haystack unit from a byte value.
    ///
    /// All possible byte values are legal. However, when creating a haystack
    /// unit for a specific DFA, one should be careful to only construct units
    /// that are in that DFA's alphabet. Namely, one way to compact a DFA's
    /// in-memory representation is to collapse its transitions to a set of
    /// equivalence classes into a set of all possible byte values. If a DFA
    /// uses equivalence classes instead of byte values, then the byte given
    /// here should be the equivalence class.
    pub fn u8(byte:
```
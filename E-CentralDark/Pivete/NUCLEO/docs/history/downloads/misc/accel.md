# OUTRO - accel.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\dfa\accel.rs
**SHA:** 73f8e0c492a6c669
**Timestamp:** 2026-08-28T02:35:05.429646
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let slice_start = slice.as_ptr().as_usize();

### Ouro Bruto (primeiros 5000 chars)
```
// This module defines some core types for dealing with accelerated DFA states.
// Briefly, a DFA state can be "accelerated" if all of its transitions except
// for a few loop back to itself. This directly implies that the only way out
// of such a state is if a byte corresponding to one of those non-loopback
// transitions is found. Such states are often found in simple repetitions in
// non-Unicode regexes. For example, consider '(?-u)[^a]+a'. We can look at its
// DFA with regex-cli:
//
//     $ regex-cli debug dense dfa -p '(?-u)[^a]+a' -BbC --no-table
//     D 000000:
//     Q 000001:
//      *000002:
//     A 000003: \x00-` => 3, a => 8, b-\xFF => 3
//     A 000004: \x00-` => 4, a => 7, b-\xFF => 4
//       000005: \x00-` => 4, b-\xFF => 4
//       000006: \x00-` => 3, a => 6, b-\xFF => 3
//       000007: \x00-\xFF => 2, EOI => 2
//       000008: \x00-\xFF => 2, EOI => 2
//
// In particular, state 3 is accelerated (shown via the 'A' indicator) since
// the only way to leave that state once entered is to see an 'a' byte. If
// there is a long run of non-'a' bytes, then using something like 'memchr'
// to find the next 'a' byte can be significantly faster than just using the
// standard byte-at-a-time state machine.
//
// Unfortunately, this optimization rarely applies when Unicode is enabled.
// For example, patterns like '[^a]' don't actually match any byte that isn't
// 'a', but rather, any UTF-8 encoding of a Unicode scalar value that isn't
// 'a'. This makes the state machine much more complex---far beyond a single
// state---and removes the ability to easily accelerate it. (Because if the
// machine sees a non-UTF-8 sequence, then the machine won't match through it.)
//
// In practice, we only consider accelerating states that have 3 or fewer
// non-loop transitions. At a certain point, you get diminishing returns, but
// also because that's what the memchr crate supports. The structures below
// hard-code this assumption and provide (de)serialization APIs for use inside
// a DFA.
//
// And finally, note that there is some trickery involved in making it very
// fast to not only check whether a state is accelerated at search time, but
// also to access the bytes to search for to implement the acceleration itself.
// dfa/special.rs provides more detail, but the short story is that all
// accelerated states appear contiguously in a DFA. This means we can represent
// the ID space of all accelerated DFA states with a single range. So given
// a state ID, we can determine whether it's accelerated via
//
//     min_accel_id <= id <= max_accel_id
//
// And find its corresponding accelerator with:
//
//     accels.get((id - min_accel_id) / dfa_stride)

#[cfg(feature = "dfa-build")]
use alloc::{vec, vec::Vec};

use crate::util::{
    int::Pointer,
    memchr,
    wire::{self, DeserializeError, Endian, SerializeError},
};

/// The base type used to represent a collection of accelerators.
///
/// While an `Accel` is represented as a fixed size array of bytes, a
/// *collection* of `Accel`s (called `Accels`) is represented internally as a
/// slice of u32. While it's a bit unnatural to do this and costs us a bit of
/// fairly low-risk not-safe code, it lets us remove the need for a second type
/// parameter in the definition of dense::DFA. (Which really wants everything
/// to be a slice of u32.)
type AccelTy = u32;

/// The size of the unit of representation for accelerators.
///
/// ACCEL_CAP *must* be a multiple of this size.
const ACCEL_TY_SIZE: usize = core::mem::size_of::<AccelTy>();

/// The maximum length in bytes that a single Accel can be. This is distinct
/// from the capacity of an accelerator in that the length represents only the
/// bytes that should be read.
const ACCEL_LEN: usize = 4;

/// The capacity of each accelerator, in bytes. We set this to 8 since it's a
/// multiple of 4 (our ID size) and because it gives us a little wiggle room
/// if we want to support more accel bytes in the future without a breaking
/// change.
///
/// This MUST be a multiple of ACCEL_TY_SIZE.
const ACCEL_CAP: usize = 8;

/// Search for between 1 and 3 needle bytes in the given haystack, starting the
/// search at the given position. If `needles` has a length other than 1-3,
/// then this panics.
#[cfg_attr(feature = "perf-inline", inline(always))]
pub(crate) fn find_fwd(
    needles: &[u8],
    haystack: &[u8],
    at: usize,
) -> Option<usize> {
    let bs = needles;
    let i = match needles.len() {
        1 => memchr::memchr(bs[0], &haystack[at..])?,
        2 => memchr::memchr2(bs[0], bs[1], &haystack[at..])?,
        3 => memchr::memchr3(bs[0], bs[1], bs[2], &haystack[at..])?,
        0 => panic!("cannot find with empty needles"),
        n => panic!("invalid needles length: {n}"),
    };
    Some(at + i)
}

/// Search for between 1 and 3 needle bytes in the given haystack in reverse,
/// starting the search at the given position. If `needles` has a length other
/// than 1-3, then this panics.
#[cfg_attr(f
```
# OUTRO - contiguous.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\nfa\contiguous.rs
**SHA:** f435c131ce84927e
**Timestamp:** 2026-08-28T02:32:19.352866
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = 2 + alphabet_len;
- let start = 2 + classes_len + trans_len;
- let start = if State::kind(state) == State::KIND_DENSE {
- let start = dst.len();
- if start == end {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Provides a contiguous NFA implementation of Aho-Corasick.

This is a low-level API that generally only needs to be used in niche
circumstances. When possible, prefer using [`AhoCorasick`](crate::AhoCorasick)
instead of a contiguous NFA directly. Using an `NFA` directly is typically only
necessary when one needs access to the [`Automaton`] trait implementation.
*/

use alloc::{vec, vec::Vec};

use crate::{
    automaton::Automaton,
    nfa::noncontiguous,
    util::{
        alphabet::ByteClasses,
        error::{BuildError, MatchError},
        int::{Usize, U16, U32},
        prefilter::Prefilter,
        primitives::{IteratorIndexExt, PatternID, SmallIndex, StateID},
        search::{Anchored, MatchKind},
        special::Special,
    },
};

/// A contiguous NFA implementation of Aho-Corasick.
///
/// When possible, prefer using [`AhoCorasick`](crate::AhoCorasick) instead of
/// this type directly. Using an `NFA` directly is typically only necessary
/// when one needs access to the [`Automaton`] trait implementation.
///
/// This NFA can only be built by first constructing a [`noncontiguous::NFA`].
/// Both [`NFA::new`] and [`Builder::build`] do this for you automatically, but
/// [`Builder::build_from_noncontiguous`] permits doing it explicitly.
///
/// The main difference between a noncontiguous NFA and a contiguous NFA is
/// that the latter represents all of its states and transitions in a single
/// allocation, where as the former uses a separate allocation for each state.
/// Doing this at construction time while keeping a low memory footprint isn't
/// feasible, which is primarily why there are two different NFA types: one
/// that does the least amount of work possible to build itself, and another
/// that does a little extra work to compact itself and make state transitions
/// faster by making some states use a dense representation.
///
/// Because a contiguous NFA uses a single allocation, there is a lot more
/// opportunity for compression tricks to reduce the heap memory used. Indeed,
/// it is not uncommon for a contiguous NFA to use an order of magnitude less
/// heap memory than a noncontiguous NFA. Since building a contiguous NFA
/// usually only takes a fraction of the time it takes to build a noncontiguous
/// NFA, the overall build time is not much slower. Thus, in most cases, a
/// contiguous NFA is the best choice.
///
/// Since a contiguous NFA uses various tricks for compression and to achieve
/// faster state transitions, currently, its limit on the number of states
/// is somewhat smaller than what a noncontiguous NFA can achieve. Generally
/// speaking, you shouldn't expect to run into this limit if the number of
/// patterns is under 1 million. It is plausible that this limit will be
/// increased in the future. If the limit is reached, building a contiguous NFA
/// will return an error. Often, since building a contiguous NFA is relatively
/// cheap, it can make sense to always try it even if you aren't sure if it
/// will fail or not. If it does, you can always fall back to a noncontiguous
/// NFA. (Indeed, the main [`AhoCorasick`](crate::AhoCorasick) type employs a
/// strategy similar to this at construction time.)
///
/// # Example
///
/// This example shows how to build an `NFA` directly and use it to execute
/// [`Automaton::try_find`]:
///
/// ```
/// use aho_corasick::{
///     automaton::Automaton,
///     nfa::contiguous::NFA,
///     Input, Match,
/// };
///
/// let patterns = &["b", "abc", "abcd"];
/// let haystack = "abcd";
///
/// let nfa = NFA::new(patterns).unwrap();
/// assert_eq!(
///     Some(Match::must(0, 1..2)),
///     nfa.try_find(&Input::new(haystack))?,
/// );
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
///
/// It is also possible to implement your own version of `try_find`. See the
/// [`Automaton`] documentation for an example.
#[derive(Clone)]
pub struct NFA {
    /// The raw NFA representation. Each state is packed with a header
    /// (containing the format of the state, the failure transition and, for
    /// a sparse state, the number of transitions), its transitions and any
    /// matching pattern IDs for match states.
    repr: Vec<u32>,
    /// The length of each pattern. This is used to compute the start offset
    /// of a match.
    pattern_lens: Vec<SmallIndex>,
    /// The total number of states in this NFA.
    state_len: usize,
    /// A prefilter for accelerating searches, if one exists.
    prefilter: Option<Prefilter>,
    /// The match semantics built into this NFA.
    match_kind: MatchKind,
    /// The alphabet size, or total number of equivalence classes, for this
    /// NFA. Dense states always have this many transitions.
    alphabet_len: usize,
    /// The equivalence classes for this NFA. All transitions, dense and
    /// sparse, are defined on equivalence classes and not on the 256 distinct
    /// byte values.
    byte_classes: ByteClasses,
    /// The length of the shortest pattern in this automaton.
   
```
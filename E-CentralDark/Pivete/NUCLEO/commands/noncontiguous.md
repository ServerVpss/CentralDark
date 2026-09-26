# COMANDO - noncontiguous.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\nfa\noncontiguous.rs
**SHA:** de94f02b04efd874
**Timestamp:** 2026-08-28T02:32:19.460338
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = state.dense.as_usize();
- let start = &mut self.nfa.states[start_uid];
- if start == end {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Provides a noncontiguous NFA implementation of Aho-Corasick.

This is a low-level API that generally only needs to be used in niche
circumstances. When possible, prefer using [`AhoCorasick`](crate::AhoCorasick)
instead of a noncontiguous NFA directly. Using an `NFA` directly is typically
only necessary when one needs access to the [`Automaton`] trait implementation.
*/

use alloc::{
    collections::{BTreeSet, VecDeque},
    vec,
    vec::Vec,
};

use crate::{
    automaton::Automaton,
    util::{
        alphabet::{ByteClassSet, ByteClasses},
        error::{BuildError, MatchError},
        prefilter::{self, opposite_ascii_case, Prefilter},
        primitives::{IteratorIndexExt, PatternID, SmallIndex, StateID},
        remapper::Remapper,
        search::{Anchored, MatchKind},
        special::Special,
    },
};

/// A noncontiguous NFA implementation of Aho-Corasick.
///
/// When possible, prefer using [`AhoCorasick`](crate::AhoCorasick) instead of
/// this type directly. Using an `NFA` directly is typically only necessary
/// when one needs access to the [`Automaton`] trait implementation.
///
/// This NFA represents the "core" implementation of Aho-Corasick in this
/// crate. Namely, constructing this NFA involving building a trie and then
/// filling in the failure transitions between states, similar to what is
/// described in any standard textbook description of Aho-Corasick.
///
/// In order to minimize heap usage and to avoid additional construction costs,
/// this implementation represents the transitions of all states as distinct
/// sparse memory allocations. This is where it gets its name from. That is,
/// this NFA has no contiguous memory allocation for its transition table. Each
/// state gets its own allocation.
///
/// While the sparse representation keeps memory usage to somewhat reasonable
/// levels, it is still quite large and also results in somewhat mediocre
/// search performance. For this reason, it is almost always a good idea to
/// use a [`contiguous::NFA`](crate::nfa::contiguous::NFA) instead. It is
/// marginally slower to build, but has higher throughput and can sometimes use
/// an order of magnitude less memory. The main reason to use a noncontiguous
/// NFA is when you need the fastest possible construction time, or when a
/// contiguous NFA does not have the desired capacity. (The total number of NFA
/// states it can have is fewer than a noncontiguous NFA.)
///
/// # Example
///
/// This example shows how to build an `NFA` directly and use it to execute
/// [`Automaton::try_find`]:
///
/// ```
/// use aho_corasick::{
///     automaton::Automaton,
///     nfa::noncontiguous::NFA,
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
    /// The match semantics built into this NFA.
    match_kind: MatchKind,
    /// A set of states. Each state defines its own transitions, a fail
    /// transition and a set of indices corresponding to matches.
    ///
    /// The first state is always the fail state, which is used only as a
    /// sentinel. Namely, in the final NFA, no transition into the fail state
    /// exists. (Well, they do, but they aren't followed. Instead, the state's
    /// failure transition is followed.)
    ///
    /// The second state (index 1) is always the dead state. Dead states are
    /// in every automaton, but only used when leftmost-{first,longest} match
    /// semantics are enabled. Specifically, they instruct search to stop
    /// at specific points in order to report the correct match location. In
    /// the standard Aho-Corasick construction, there are no transitions to
    /// the dead state.
    ///
    /// The third state (index 2) is generally intended to be the starting or
    /// "root" state.
    states: Vec<State>,
    /// Transitions stored in a sparse representation via a linked list.
    ///
    /// Each transition contains three pieces of information: the byte it
    /// is defined for, the state it transitions to and a link to the next
    /// transition in the same state (or `StateID::ZERO` if it is the last
    /// transition).
    ///
    /// The first transition for each state is determined by `State::sparse`.
    ///
    /// Note that this contains a complete set of all transitions in this NFA,
    /// including states that have a dense representation for transitions.
    /// (Adding dense transitions for a state doesn't remove its sparse
    /// transitions, since deleting transitions from this particular sparse
    /// representation would be fairly expensive.)
    sparse: Vec<Transition>,
    /// Transitions
```
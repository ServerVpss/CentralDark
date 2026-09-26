# COMANDO - automaton.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\automaton.rs
**SHA:** 22258a3e11867241
**Timestamp:** 2026-08-28T02:32:18.730754
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: StateID,
- let start = aut.start_state(Anchored::No)?;
- let start = self.absolute_pos;
- let start = self.buffer_pos - mat.len();
- let buffer_mat_start = self.buffer_pos - mat.len();
- let start = self.buffer_reported_pos;

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Provides [`Automaton`] trait for abstracting over Aho-Corasick automata.

The `Automaton` trait provides a way to write generic code over any
Aho-Corasick automaton. It also provides access to lower level APIs that
permit walking the state transitions of an Aho-Corasick automaton manually.
*/

use alloc::{string::String, vec::Vec};

use crate::util::{
    error::MatchError,
    primitives::PatternID,
    search::{Anchored, Input, Match, MatchKind, Span},
};

pub use crate::util::{
    prefilter::{Candidate, Prefilter},
    primitives::{StateID, StateIDError},
};

/// We seal the `Automaton` trait for now. It's a big trait, and it's
/// conceivable that I might want to add new required methods, and sealing the
/// trait permits doing that in a backwards compatible fashion. On other the
/// hand, if you have a solid use case for implementing the trait yourself,
/// please file an issue and we can discuss it. This was *mostly* done as a
/// conservative step.
pub(crate) mod private {
    pub trait Sealed {}
}
impl private::Sealed for crate::nfa::noncontiguous::NFA {}
impl private::Sealed for crate::nfa::contiguous::NFA {}
impl private::Sealed for crate::dfa::DFA {}

impl<'a, T: private::Sealed + ?Sized> private::Sealed for &'a T {}

/// A trait that abstracts over Aho-Corasick automata.
///
/// This trait primarily exists for niche use cases such as:
///
/// * Using an NFA or DFA directly, bypassing the top-level
/// [`AhoCorasick`](crate::AhoCorasick) searcher. Currently, these include
/// [`noncontiguous::NFA`](crate::nfa::noncontiguous::NFA),
/// [`contiguous::NFA`](crate::nfa::contiguous::NFA) and
/// [`dfa::DFA`](crate::dfa::DFA).
/// * Implementing your own custom search routine by walking the automaton
/// yourself. This might be useful for implementing search on non-contiguous
/// strings or streams.
///
/// For most use cases, it is not expected that users will need
/// to use or even know about this trait. Indeed, the top level
/// [`AhoCorasick`](crate::AhoCorasick) searcher does not expose any details
/// about this trait, nor does it implement it itself.
///
/// Note that this trait defines a number of default methods, such as
/// [`Automaton::try_find`] and [`Automaton::try_find_iter`], which implement
/// higher level search routines in terms of the lower level automata API.
///
/// # Sealed
///
/// Currently, this trait is sealed. That means users of this crate can write
/// generic routines over this trait but cannot implement it themselves. This
/// restriction may be lifted in the future, but sealing the trait permits
/// adding new required methods in a backwards compatible fashion.
///
/// # Special states
///
/// This trait encodes a notion of "special" states in an automaton. Namely,
/// a state is treated as special if it is a dead, match or start state:
///
/// * A dead state is a state that cannot be left once entered. All transitions
/// on a dead state lead back to itself. The dead state is meant to be treated
/// as a sentinel indicating that the search should stop and return a match if
/// one has been found, and nothing otherwise.
/// * A match state is a state that indicates one or more patterns have
/// matched. Depending on the [`MatchKind`] of the automaton, a search may
/// stop once a match is seen, or it may continue looking for matches until
/// it enters a dead state or sees the end of the haystack.
/// * A start state is a state that a search begins in. It is useful to know
/// when a search enters a start state because it may mean that a prefilter can
/// be used to skip ahead and quickly look for candidate matches. Unlike dead
/// and match states, it is never necessary to explicitly handle start states
/// for correctness. Indeed, in this crate, implementations of `Automaton`
/// will only treat start states as "special" when a prefilter is enabled and
/// active. Otherwise, treating it as special has no purpose and winds up
/// slowing down the overall search because it results in ping-ponging between
/// the main state transition and the "special" state logic.
///
/// Since checking whether a state is special by doing three different
/// checks would be too expensive inside a fast search loop, the
/// [`Automaton::is_special`] method is provided for quickly checking whether
/// the state is special. The `Automaton::is_dead`, `Automaton::is_match` and
/// `Automaton::is_start` predicates can then be used to determine which kind
/// of special state it is.
///
/// # Panics
///
/// Most of the APIs on this trait should panic or give incorrect results
/// if invalid inputs are given to it. For example, `Automaton::next_state`
/// has unspecified behavior if the state ID given to it is not a valid
/// state ID for the underlying automaton. Valid state IDs can only be
/// retrieved in one of two ways: calling `Automaton::start_state` or calling
/// `Automaton::next_state` with a valid state ID.
///
/// # Safety
///
/// This trait is not safe to implement so that code
```
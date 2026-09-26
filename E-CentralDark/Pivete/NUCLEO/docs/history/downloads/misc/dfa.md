# OUTRO - dfa.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\dfa.rs
**SHA:** 197075923eb9d760
**Timestamp:** 2026-08-28T02:32:18.745289
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.special.start_unanchored_id;
- if start == DFA::DEAD {
- let start = self.special.start_anchored_id;
- if start == DFA::DEAD {
- if start == end {

### Gaps
- // TODO: We might also want to shrink each Vec inside of `dfa.matches`,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Provides direct access to a DFA implementation of Aho-Corasick.

This is a low-level API that generally only needs to be used in niche
circumstances. When possible, prefer using [`AhoCorasick`](crate::AhoCorasick)
instead of a DFA directly. Using an `DFA` directly is typically only necessary
when one needs access to the [`Automaton`] trait implementation.
*/

use alloc::{vec, vec::Vec};

use crate::{
    automaton::Automaton,
    nfa::noncontiguous,
    util::{
        alphabet::ByteClasses,
        error::{BuildError, MatchError},
        int::{Usize, U32},
        prefilter::Prefilter,
        primitives::{IteratorIndexExt, PatternID, SmallIndex, StateID},
        search::{Anchored, MatchKind, StartKind},
        special::Special,
    },
};

/// A DFA implementation of Aho-Corasick.
///
/// When possible, prefer using [`AhoCorasick`](crate::AhoCorasick) instead of
/// this type directly. Using a `DFA` directly is typically only necessary when
/// one needs access to the [`Automaton`] trait implementation.
///
/// This DFA can only be built by first constructing a [`noncontiguous::NFA`].
/// Both [`DFA::new`] and [`Builder::build`] do this for you automatically, but
/// [`Builder::build_from_noncontiguous`] permits doing it explicitly.
///
/// A DFA provides the best possible search performance (in this crate) via two
/// mechanisms:
///
/// * All states use a dense representation for their transitions.
/// * All failure transitions are pre-computed such that they are never
/// explicitly handled at search time.
///
/// These two facts combined mean that every state transition is performed
/// using a constant number of instructions. However, this comes at
/// great cost. The memory usage of a DFA can be quite exorbitant.
/// It is potentially multiple orders of magnitude greater than a
/// [`contiguous::NFA`](crate::nfa::contiguous::NFA) for example. In exchange,
/// a DFA will typically have better search speed than a `contiguous::NFA`, but
/// not by orders of magnitude.
///
/// Unless you have a small number of patterns or memory usage is not a concern
/// and search performance is critical, a DFA is usually not the best choice.
///
/// Moreover, unlike the NFAs in this crate, it is costly for a DFA to
/// support for anchored and unanchored search configurations. Namely,
/// since failure transitions are pre-computed, supporting both anchored
/// and unanchored searches requires a duplication of the transition table,
/// making the memory usage of such a DFA ever bigger. (The NFAs in this crate
/// unconditionally support both anchored and unanchored searches because there
/// is essentially no added cost for doing so.) It is for this reason that
/// a DFA's support for anchored and unanchored searches can be configured
/// via [`Builder::start_kind`]. By default, a DFA only supports unanchored
/// searches.
///
/// # Example
///
/// This example shows how to build an `DFA` directly and use it to execute
/// [`Automaton::try_find`]:
///
/// ```
/// use aho_corasick::{
///     automaton::Automaton,
///     dfa::DFA,
///     Input, Match,
/// };
///
/// let patterns = &["b", "abc", "abcd"];
/// let haystack = "abcd";
///
/// let nfa = DFA::new(patterns).unwrap();
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
pub struct DFA {
    /// The DFA transition table. IDs in this table are pre-multiplied. So
    /// instead of the IDs being 0, 1, 2, 3, ..., they are 0*stride, 1*stride,
    /// 2*stride, 3*stride, ...
    trans: Vec<StateID>,
    /// The matches for every match state in this DFA. This is first indexed by
    /// state index (so that's `sid >> stride2`) and then by order in which the
    /// matches are meant to occur.
    matches: Vec<Vec<PatternID>>,
    /// The amount of heap memory used, in bytes, by the inner Vecs of
    /// 'matches'.
    matches_memory_usage: usize,
    /// The length of each pattern. This is used to compute the start offset
    /// of a match.
    pattern_lens: Vec<SmallIndex>,
    /// A prefilter for accelerating searches, if one exists.
    prefilter: Option<Prefilter>,
    /// The match semantics built into this DFA.
    match_kind: MatchKind,
    /// The total number of states in this DFA.
    state_len: usize,
    /// The alphabet size, or total number of equivalence classes, for this
    /// DFA. Note that the actual number of transitions in each state is
    /// stride=2^stride2, where stride is the smallest power of 2 greater than
    /// or equal to alphabet_len. We do things this way so that we can use
    /// bitshifting to go from a state ID to an index into 'matches'.
    alphabet_len: usize,
    /// The exponent with a base 2, such that stride=2^stride2. Given a state
    /// index 'i', its state iden
```
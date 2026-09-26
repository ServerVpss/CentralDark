# OUTRO - determinize.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\dfa\determinize.rs
**SHA:** d72dc41a7e93b928
**Timestamp:** 2026-08-28T02:35:05.484305
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start::Start,
- let nfa_start = match anchored {
- self.add_one_start(nfa_start, Start::NonWordByte)?;
- self.dfa.set_start_state(anchored, Start::NonWordByte, id);
- self.dfa.set_start_state(anchored, Start::WordByte, id);
- self.add_one_start(nfa_start, Start::WordByte)?;
- self.dfa.set_start_state(anchored, Start::WordByte, id);
- self.dfa.set_start_state(anchored, Start::Text, id);
- self.dfa.set_start_state(anchored, Start::LineLF, id);
- self.dfa.set_start_state(anchored, Start::LineCR, id);

### Ouro Bruto (primeiros 5000 chars)
```
use alloc::{collections::BTreeMap, vec::Vec};

use crate::{
    dfa::{
        dense::{self, BuildError},
        DEAD,
    },
    nfa::thompson,
    util::{
        self,
        alphabet::{self, ByteSet},
        determinize::{State, StateBuilderEmpty, StateBuilderNFA},
        primitives::{PatternID, StateID},
        search::{Anchored, MatchKind},
        sparse_set::SparseSets,
        start::Start,
    },
};

/// A builder for configuring and running a DFA determinizer.
#[derive(Clone, Debug)]
pub(crate) struct Config {
    match_kind: MatchKind,
    quit: ByteSet,
    dfa_size_limit: Option<usize>,
    determinize_size_limit: Option<usize>,
}

impl Config {
    /// Create a new default config for a determinizer. The determinizer may be
    /// configured before calling `run`.
    pub fn new() -> Config {
        Config {
            match_kind: MatchKind::LeftmostFirst,
            quit: ByteSet::empty(),
            dfa_size_limit: None,
            determinize_size_limit: None,
        }
    }

    /// Run determinization on the given NFA and write the resulting DFA into
    /// the one given. The DFA given should be initialized but otherwise empty.
    /// "Initialized" means that it is setup to handle the NFA's byte classes,
    /// number of patterns and whether to build start states for each pattern.
    pub fn run(
        &self,
        nfa: &thompson::NFA,
        dfa: &mut dense::OwnedDFA,
    ) -> Result<(), BuildError> {
        let dead = State::dead();
        let quit = State::dead();
        let mut cache = StateMap::default();
        // We only insert the dead state here since its representation is
        // identical to the quit state. And we never want anything pointing
        // to the quit state other than specific transitions derived from the
        // determinizer's configured "quit" bytes.
        //
        // We do put the quit state into 'builder_states' below. This ensures
        // that a proper DFA state ID is allocated for it, and that no other
        // DFA state uses the "location after the DEAD state." That is, it
        // is assumed that the quit state is always the state immediately
        // following the DEAD state.
        cache.insert(dead.clone(), DEAD);

        let runner = Runner {
            config: self.clone(),
            nfa,
            dfa,
            builder_states: alloc::vec![dead, quit],
            cache,
            memory_usage_state: 0,
            sparses: SparseSets::new(nfa.states().len()),
            stack: alloc::vec![],
            scratch_state_builder: StateBuilderEmpty::new(),
        };
        runner.run()
    }

    /// The match semantics to use for determinization.
    ///
    /// MatchKind::All corresponds to the standard textbook construction.
    /// All possible match states are represented in the DFA.
    /// MatchKind::LeftmostFirst permits greediness and otherwise tries to
    /// simulate the match semantics of backtracking regex engines. Namely,
    /// only a subset of match states are built, and dead states are used to
    /// stop searches with an unanchored prefix.
    ///
    /// The default is MatchKind::LeftmostFirst.
    pub fn match_kind(&mut self, kind: MatchKind) -> &mut Config {
        self.match_kind = kind;
        self
    }

    /// The set of bytes to use that will cause the DFA to enter a quit state,
    /// stop searching and return an error. By default, this is empty.
    pub fn quit(&mut self, set: ByteSet) -> &mut Config {
        self.quit = set;
        self
    }

    /// The limit, in bytes of the heap, that the DFA is permitted to use. This
    /// does not include the auxiliary heap storage used by determinization.
    pub fn dfa_size_limit(&mut self, bytes: Option<usize>) -> &mut Config {
        self.dfa_size_limit = bytes;
        self
    }

    /// The limit, in bytes of the heap, that determinization itself is allowed
    /// to use. This does not include the size of the DFA being built.
    pub fn determinize_size_limit(
        &mut self,
        bytes: Option<usize>,
    ) -> &mut Config {
        self.determinize_size_limit = bytes;
        self
    }
}

/// The actual implementation of determinization that converts an NFA to a DFA
/// through powerset construction.
///
/// This determinizer roughly follows the typical powerset construction, where
/// each DFA state is comprised of one or more NFA states. In the worst case,
/// there is one DFA state for every possible combination of NFA states. In
/// practice, this only happens in certain conditions, typically when there are
/// bounded repetitions.
///
/// The main differences between this implementation and typical deteminization
/// are that this implementation delays matches by one state and hackily makes
/// look-around work. Comments below attempt to explain this.
///
/// The lifetime variable `'a` refers to the lifetime of the NFA or DFA,
/// whichever is shorter.
#[derive(Debug)]
struct Runner<'a> {
    /// Th
```
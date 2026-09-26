# OUTRO - minimize.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\dfa\minimize.rs
**SHA:** b5cadb462b9f24cd
**Timestamp:** 2026-08-28T02:35:05.585490
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- new.min_start = StateID::MAX;
- new.max_start = StateID::ZERO;
- new.min_start = new_id;
- new.max_start = new_id;
- if new.max_start == DEAD {
- new.min_start = DEAD;

### Ouro Bruto (primeiros 5000 chars)
```
use core::{cell::RefCell, fmt, mem};

use alloc::{collections::BTreeMap, rc::Rc, vec, vec::Vec};

use crate::{
    dfa::{automaton::Automaton, dense, DEAD},
    util::{
        alphabet,
        primitives::{PatternID, StateID},
    },
};

/// An implementation of Hopcroft's algorithm for minimizing DFAs.
///
/// The algorithm implemented here is mostly taken from Wikipedia:
/// https://en.wikipedia.org/wiki/DFA_minimization#Hopcroft's_algorithm
///
/// This code has had some light optimization attention paid to it,
/// particularly in the form of reducing allocation as much as possible.
/// However, it is still generally slow. Future optimization work should
/// probably focus on the bigger picture rather than micro-optimizations. For
/// example:
///
/// 1. Figure out how to more intelligently create initial partitions. That is,
///    Hopcroft's algorithm starts by creating two partitions of DFA states
///    that are known to NOT be equivalent: match states and non-match states.
///    The algorithm proceeds by progressively refining these partitions into
///    smaller partitions. If we could start with more partitions, then we
///    could reduce the amount of work that Hopcroft's algorithm needs to do.
/// 2. For every partition that we visit, we find all incoming transitions to
///    every state in the partition for *every* element in the alphabet. (This
///    is why using byte classes can significantly decrease minimization times,
///    since byte classes shrink the alphabet.) This is quite costly and there
///    is perhaps some redundant work being performed depending on the specific
///    states in the set. For example, we might be able to only visit some
///    elements of the alphabet based on the transitions.
/// 3. Move parts of minimization into determinization. If minimization has
///    fewer states to deal with, then it should run faster. A prime example
///    of this might be large Unicode classes, which are generated in way that
///    can create a lot of redundant states. (Some work has been done on this
///    point during NFA compilation via the algorithm described in the
///    "Incremental Construction of MinimalAcyclic Finite-State Automata"
///    paper.)
pub(crate) struct Minimizer<'a> {
    dfa: &'a mut dense::OwnedDFA,
    in_transitions: Vec<Vec<Vec<StateID>>>,
    partitions: Vec<StateSet>,
    waiting: Vec<StateSet>,
}

impl<'a> fmt::Debug for Minimizer<'a> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Minimizer")
            .field("dfa", &self.dfa)
            .field("in_transitions", &self.in_transitions)
            .field("partitions", &self.partitions)
            .field("waiting", &self.waiting)
            .finish()
    }
}

/// A set of states. A state set makes up a single partition in Hopcroft's
/// algorithm.
///
/// It is represented by an ordered set of state identifiers. We use shared
/// ownership so that a single state set can be in both the set of partitions
/// and in the set of waiting sets simultaneously without an additional
/// allocation. Generally, once a state set is built, it becomes immutable.
///
/// We use this representation because it avoids the overhead of more
/// traditional set data structures (HashSet/BTreeSet), and also because
/// computing intersection/subtraction on this representation is especially
/// fast.
#[derive(Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
struct StateSet {
    ids: Rc<RefCell<Vec<StateID>>>,
}

impl<'a> Minimizer<'a> {
    pub fn new(dfa: &'a mut dense::OwnedDFA) -> Minimizer<'a> {
        let in_transitions = Minimizer::incoming_transitions(dfa);
        let partitions = Minimizer::initial_partitions(dfa);
        let waiting = partitions.clone();
        Minimizer { dfa, in_transitions, partitions, waiting }
    }

    pub fn run(mut self) {
        let stride2 = self.dfa.stride2();
        let as_state_id = |index: usize| -> StateID {
            StateID::new(index << stride2).unwrap()
        };
        let as_index = |id: StateID| -> usize { id.as_usize() >> stride2 };

        let mut incoming = StateSet::empty();
        let mut scratch1 = StateSet::empty();
        let mut scratch2 = StateSet::empty();
        let mut newparts = vec![];

        // This loop is basically Hopcroft's algorithm. Everything else is just
        // shuffling data around to fit our representation.
        while let Some(set) = self.waiting.pop() {
            for b in self.dfa.byte_classes().iter() {
                self.find_incoming_to(b, &set, &mut incoming);
                // If incoming is empty, then the intersection with any other
                // set must also be empty. So 'newparts' just ends up being
                // 'self.partitions'. So there's no need to go through the loop
                // below.
                //
                // This actually turns out to be rather large optimization. On
                // the order of making minimization 4-5x faste
```
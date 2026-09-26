# OUTRO - backtrack.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\nfa\thompson\backtrack.rs
**SHA:** 041015ea153c1e48
**Timestamp:** 2026-08-28T02:35:06.180206
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = match slots[0] {
- let start = match slots[pid.as_usize() * 2] {
- /// let slot_start = pid.unwrap().as_usize() * 2;

### Padroes
- pattern: &str,
- pub fn new(pattern: &str) -> Result<BoundedBacktracker, BuildError> {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
An NFA backed bounded backtracker for executing regex searches with capturing
groups.

This module provides a [`BoundedBacktracker`] that works by simulating an NFA
using the classical backtracking algorithm with a twist: it avoids redoing
work that it has done before and thereby avoids worst case exponential time.
In exchange, it can only be used on "short" haystacks. Its advantage is that
is can be faster than the [`PikeVM`](thompson::pikevm::PikeVM) in many cases
because it does less book-keeping.
*/

use alloc::{vec, vec::Vec};

use crate::{
    nfa::thompson::{self, BuildError, State, NFA},
    util::{
        captures::Captures,
        empty, iter,
        prefilter::Prefilter,
        primitives::{NonMaxUsize, PatternID, SmallIndex, StateID},
        search::{Anchored, HalfMatch, Input, Match, MatchError, Span},
    },
};

/// Returns the minimum visited capacity for the given haystack.
///
/// This function can be used as the argument to [`Config::visited_capacity`]
/// in order to guarantee that a backtracking search for the given `input`
/// won't return an error when using a [`BoundedBacktracker`] built from the
/// given `NFA`.
///
/// This routine exists primarily as a way to test that the bounded backtracker
/// works correctly when its capacity is set to the smallest possible amount.
/// Still, it may be useful in cases where you know you want to use the bounded
/// backtracker for a specific input, and just need to know what visited
/// capacity to provide to make it work.
///
/// Be warned that this number could be quite large as it is multiplicative in
/// the size the given NFA and haystack.
pub fn min_visited_capacity(nfa: &NFA, input: &Input<'_>) -> usize {
    div_ceil(nfa.states().len() * (input.get_span().len() + 1), 8)
}

/// The configuration used for building a bounded backtracker.
///
/// A bounded backtracker configuration is a simple data object that is
/// typically used with [`Builder::configure`].
#[derive(Clone, Debug, Default)]
pub struct Config {
    pre: Option<Option<Prefilter>>,
    visited_capacity: Option<usize>,
}

impl Config {
    /// Return a new default regex configuration.
    pub fn new() -> Config {
        Config::default()
    }

    /// Set a prefilter to be used whenever a start state is entered.
    ///
    /// A [`Prefilter`] in this context is meant to accelerate searches by
    /// looking for literal prefixes that every match for the corresponding
    /// pattern (or patterns) must start with. Once a prefilter produces a
    /// match, the underlying search routine continues on to try and confirm
    /// the match.
    ///
    /// Be warned that setting a prefilter does not guarantee that the search
    /// will be faster. While it's usually a good bet, if the prefilter
    /// produces a lot of false positive candidates (i.e., positions matched
    /// by the prefilter but not by the regex), then the overall result can
    /// be slower than if you had just executed the regex engine without any
    /// prefilters.
    ///
    /// By default no prefilter is set.
    ///
    /// # Example
    ///
    /// ```
    /// use regex_automata::{
    ///     nfa::thompson::backtrack::BoundedBacktracker,
    ///     util::prefilter::Prefilter,
    ///     Input, Match, MatchKind,
    /// };
    ///
    /// let pre = Prefilter::new(MatchKind::LeftmostFirst, &["foo", "bar"]);
    /// let re = BoundedBacktracker::builder()
    ///     .configure(BoundedBacktracker::config().prefilter(pre))
    ///     .build(r"(foo|bar)[a-z]+")?;
    /// let mut cache = re.create_cache();
    /// let input = Input::new("foo1 barfox bar");
    /// assert_eq!(
    ///     Some(Match::must(0, 5..11)),
    ///     re.try_find(&mut cache, input)?,
    /// );
    ///
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    ///
    /// Be warned though that an incorrect prefilter can lead to incorrect
    /// results!
    ///
    /// ```
    /// use regex_automata::{
    ///     nfa::thompson::backtrack::BoundedBacktracker,
    ///     util::prefilter::Prefilter,
    ///     Input, HalfMatch, MatchKind,
    /// };
    ///
    /// let pre = Prefilter::new(MatchKind::LeftmostFirst, &["foo", "car"]);
    /// let re = BoundedBacktracker::builder()
    ///     .configure(BoundedBacktracker::config().prefilter(pre))
    ///     .build(r"(foo|bar)[a-z]+")?;
    /// let mut cache = re.create_cache();
    /// let input = Input::new("foo1 barfox bar");
    /// // No match reported even though there clearly is one!
    /// assert_eq!(None, re.try_find(&mut cache, input)?);
    ///
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    pub fn prefilter(mut self, pre: Option<Prefilter>) -> Config {
        self.pre = Some(pre);
        self
    }

    /// Set the visited capacity used to bound backtracking.
    ///
    /// The visited capacity represents the amount of heap memory (in bytes) to
    /// allocate toward tracking which parts of the backtracking search have
    
```
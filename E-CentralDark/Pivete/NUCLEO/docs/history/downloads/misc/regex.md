# OUTRO - regex.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\dfa\regex.rs
**SHA:** 567c7a59ca194117
**Timestamp:** 2026-08-28T02:35:05.663285
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = rev

### Padroes
- pub fn new(pattern: &str) -> Result<Regex, BuildError> {
- pattern: &str,
- pub fn build(&self, pattern: &str) -> Result<Regex, BuildError> {
- pattern: &str,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
A DFA-backed `Regex`.

This module provides [`Regex`], which is defined generically over the
[`Automaton`] trait. A `Regex` implements convenience routines you might have
come to expect, such as finding the start/end of a match and iterating over
all non-overlapping matches. This `Regex` type is limited in its capabilities
to what a DFA can provide. Therefore, APIs involving capturing groups, for
example, are not provided.

Internally, a `Regex` is composed of two DFAs. One is a "forward" DFA that
finds the end offset of a match, where as the other is a "reverse" DFA that
find the start offset of a match.

See the [parent module](crate::dfa) for examples.
*/

#[cfg(feature = "alloc")]
use alloc::vec::Vec;

#[cfg(feature = "dfa-build")]
use crate::dfa::dense::BuildError;
use crate::{
    dfa::{automaton::Automaton, dense},
    util::{iter, search::Input},
    Anchored, Match, MatchError,
};
#[cfg(feature = "alloc")]
use crate::{
    dfa::{sparse, StartKind},
    util::search::MatchKind,
};

// When the alloc feature is enabled, the regex type sets its A type parameter
// to default to an owned dense DFA. But without alloc, we set no default. This
// makes things a lot more convenient in the common case, since writing out the
// DFA types is pretty annoying.
//
// Since we have two different definitions but only want to write one doc
// string, we use a macro to capture the doc and other attributes once and then
// repeat them for each definition.
macro_rules! define_regex_type {
    ($(#[$doc:meta])*) => {
        #[cfg(feature = "alloc")]
        $(#[$doc])*
        pub struct Regex<A = dense::OwnedDFA> {
            forward: A,
            reverse: A,
        }

        #[cfg(not(feature = "alloc"))]
        $(#[$doc])*
        pub struct Regex<A> {
            forward: A,
            reverse: A,
        }
    };
}

define_regex_type!(
    /// A regular expression that uses deterministic finite automata for fast
    /// searching.
    ///
    /// A regular expression is comprised of two DFAs, a "forward" DFA and a
    /// "reverse" DFA. The forward DFA is responsible for detecting the end of
    /// a match while the reverse DFA is responsible for detecting the start
    /// of a match. Thus, in order to find the bounds of any given match, a
    /// forward search must first be run followed by a reverse search. A match
    /// found by the forward DFA guarantees that the reverse DFA will also find
    /// a match.
    ///
    /// The type of the DFA used by a `Regex` corresponds to the `A` type
    /// parameter, which must satisfy the [`Automaton`] trait. Typically, `A`
    /// is either a [`dense::DFA`] or a [`sparse::DFA`], where dense DFAs use
    /// more memory but search faster, while sparse DFAs use less memory but
    /// search more slowly.
    ///
    /// # Crate features
    ///
    /// Note that despite what the documentation auto-generates, the _only_
    /// crate feature needed to use this type is `dfa-search`. You do _not_
    /// need to enable the `alloc` feature.
    ///
    /// By default, a regex's automaton type parameter is set to
    /// `dense::DFA<Vec<u32>>` when the `alloc` feature is enabled. For most
    /// in-memory work loads, this is the most convenient type that gives the
    /// best search performance. When the `alloc` feature is disabled, no
    /// default type is used.
    ///
    /// # When should I use this?
    ///
    /// Generally speaking, if you can afford the overhead of building a full
    /// DFA for your regex, and you don't need things like capturing groups,
    /// then this is a good choice if you're looking to optimize for matching
    /// speed. Note however that its speed may be worse than a general purpose
    /// regex engine if you don't provide a [`dense::Config::prefilter`] to the
    /// underlying DFA.
    ///
    /// # Sparse DFAs
    ///
    /// Since a `Regex` is generic over the [`Automaton`] trait, it can be
    /// used with any kind of DFA. While this crate constructs dense DFAs by
    /// default, it is easy enough to build corresponding sparse DFAs, and then
    /// build a regex from them:
    ///
    /// ```
    /// use regex_automata::dfa::regex::Regex;
    ///
    /// // First, build a regex that uses dense DFAs.
    /// let dense_re = Regex::new("foo[0-9]+")?;
    ///
    /// // Second, build sparse DFAs from the forward and reverse dense DFAs.
    /// let fwd = dense_re.forward().to_sparse()?;
    /// let rev = dense_re.reverse().to_sparse()?;
    ///
    /// // Third, build a new regex from the constituent sparse DFAs.
    /// let sparse_re = Regex::builder().build_from_dfas(fwd, rev);
    ///
    /// // A regex that uses sparse DFAs can be used just like with dense DFAs.
    /// assert_eq!(true, sparse_re.is_match(b"foo123"));
    ///
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    ///
    /// Alternatively, one can use a [`Builder`] to construct a sparse DFA
    /// more succinctly. (Note though that de
```

---

# OUTRO - regex.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\hybrid\regex.rs
**SHA:** 47815d0255263302
**Timestamp:** 2026-08-28T02:35:05.945111
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self

### Padroes
- pub fn new(pattern: &str) -> Result<Regex, BuildError> {
- pub fn build(&self, pattern: &str) -> Result<Regex, BuildError> {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
A lazy DFA backed `Regex`.

This module provides a [`Regex`] backed by a lazy DFA. A `Regex` implements
convenience routines you might have come to expect, such as finding a match
and iterating over all non-overlapping matches. This `Regex` type is limited
in its capabilities to what a lazy DFA can provide. Therefore, APIs involving
capturing groups, for example, are not provided.

Internally, a `Regex` is composed of two DFAs. One is a "forward" DFA that
finds the end offset of a match, where as the other is a "reverse" DFA that
find the start offset of a match.

See the [parent module](crate::hybrid) for examples.
*/

use crate::{
    hybrid::{
        dfa::{self, DFA},
        error::BuildError,
    },
    nfa::thompson,
    util::{
        iter,
        search::{Anchored, Input, Match, MatchError, MatchKind},
    },
};

/// A regular expression that uses hybrid NFA/DFAs (also called "lazy DFAs")
/// for searching.
///
/// A regular expression is comprised of two lazy DFAs, a "forward" DFA and a
/// "reverse" DFA. The forward DFA is responsible for detecting the end of
/// a match while the reverse DFA is responsible for detecting the start
/// of a match. Thus, in order to find the bounds of any given match, a
/// forward search must first be run followed by a reverse search. A match
/// found by the forward DFA guarantees that the reverse DFA will also find
/// a match.
///
/// # Fallibility
///
/// Most of the search routines defined on this type will _panic_ when the
/// underlying search fails. This might be because the DFA gave up because it
/// saw a quit byte, whether configured explicitly or via heuristic Unicode
/// word boundary support, although neither are enabled by default. It might
/// also fail if the underlying DFA determines it isn't making effective use of
/// the cache (which also never happens by default). Or it might fail because
/// an invalid `Input` configuration is given, for example, with an unsupported
/// [`Anchored`] mode.
///
/// If you need to handle these error cases instead of allowing them to trigger
/// a panic, then the lower level [`Regex::try_search`] provides a fallible API
/// that never panics.
///
/// # Example
///
/// This example shows how to cause a search to terminate if it sees a
/// `\n` byte, and handle the error returned. This could be useful if, for
/// example, you wanted to prevent a user supplied pattern from matching
/// across a line boundary.
///
/// ```
/// # if cfg!(miri) { return Ok(()); } // miri takes too long
/// use regex_automata::{hybrid::{dfa, regex::Regex}, Input, MatchError};
///
/// let re = Regex::builder()
///     .dfa(dfa::Config::new().quit(b'\n', true))
///     .build(r"foo\p{any}+bar")?;
/// let mut cache = re.create_cache();
///
/// let input = Input::new("foo\nbar");
/// // Normally this would produce a match, since \p{any} contains '\n'.
/// // But since we instructed the automaton to enter a quit state if a
/// // '\n' is observed, this produces a match error instead.
/// let expected = MatchError::quit(b'\n', 3);
/// let got = re.try_search(&mut cache, &input).unwrap_err();
/// assert_eq!(expected, got);
///
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
#[derive(Debug)]
pub struct Regex {
    /// The forward lazy DFA. This can only find the end of a match.
    forward: DFA,
    /// The reverse lazy DFA. This can only find the start of a match.
    ///
    /// This is built with 'all' match semantics (instead of leftmost-first)
    /// so that it always finds the longest possible match (which corresponds
    /// to the leftmost starting position). It is also compiled as an anchored
    /// matcher and has 'starts_for_each_pattern' enabled. Including starting
    /// states for each pattern is necessary to ensure that we only look for
    /// matches of a pattern that matched in the forward direction. Otherwise,
    /// we might wind up finding the "leftmost" starting position of a totally
    /// different pattern!
    reverse: DFA,
}

/// Convenience routines for regex and cache construction.
impl Regex {
    /// Parse the given regular expression using the default configuration and
    /// return the corresponding regex.
    ///
    /// If you want a non-default configuration, then use the [`Builder`] to
    /// set your own configuration.
    ///
    /// # Example
    ///
    /// ```
    /// use regex_automata::{hybrid::regex::Regex, Match};
    ///
    /// let re = Regex::new("foo[0-9]+bar")?;
    /// let mut cache = re.create_cache();
    /// assert_eq!(
    ///     Some(Match::must(0, 3..14)),
    ///     re.find(&mut cache, "zzzfoo12345barzzz"),
    /// );
    /// # Ok::<(), Box<dyn std::error::Error>>(())
    /// ```
    #[cfg(feature = "syntax")]
    pub fn new(pattern: &str) -> Result<Regex, BuildError> {
        Regex::builder().build(pattern)
    }

    /// Like `new`, but parses multiple patterns into a single "multi regex."
    /// This similarly uses the default regex configuration.
    ///
    /
```
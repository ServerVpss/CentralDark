# OUTRO - captures.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\util\captures.rs
**SHA:** 81e48d060fc9bea4
**Timestamp:** 2026-08-28T02:35:06.544888
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.slots.get(slot_start).copied()??;
- Some(Span { start: start.get(), end: end.get() })
- let slot_start = self.small_slot_len();
- *start = SmallIndex::new(start.as_usize() + offset).unwrap();

### Padroes
- /// each pattern:
- pattern: PatternID,
- pattern: PatternID,
- pattern: PatternID,
- pattern: PatternID,
- fn too_many_groups(pattern: PatternID, minimum: usize) -> GroupInfoError {
- fn missing_groups(pattern: PatternID) -> GroupInfoError {
- fn first_must_be_unnamed(pattern: PatternID) -> GroupInfoError {
- fn duplicate(pattern: PatternID, name: &str) -> GroupInfoError {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Provides types for dealing with capturing groups.

Capturing groups refer to sub-patterns of regexes that some regex engines can
report matching offsets for. For example, matching `[a-z]([0-9]+)` against
`a789` would give `a789` as the overall match (for the implicit capturing group
at index `0`) and `789` as the match for the capturing group `([0-9]+)` (an
explicit capturing group at index `1`).

Not all regex engines can report match offsets for capturing groups. Indeed,
to a first approximation, regex engines that can report capturing group offsets
tend to be quite a bit slower than regex engines that can't. This is because
tracking capturing groups at search time usually requires more "power" that
in turn adds overhead.

Other regex implementations might call capturing groups "submatches."

# Overview

The main types in this module are:

* [`Captures`] records the capturing group offsets found during a search. It
provides convenience routines for looking up capturing group offsets by either
index or name.
* [`GroupInfo`] records the mapping between capturing groups and "slots,"
where the latter are how capturing groups are recorded during a regex search.
This also keeps a mapping from capturing group name to index, and capture
group index to name. A `GroupInfo` is used by `Captures` internally to
provide a convenient API. It is unlikely that you'll use a `GroupInfo`
directly, but for example, if you've compiled an Thompson NFA, then you can use
[`thompson::NFA::group_info`](crate::nfa::thompson::NFA::group_info) to get its
underlying `GroupInfo`.
*/

use alloc::{string::String, sync::Arc, vec, vec::Vec};

use crate::util::{
    interpolate,
    primitives::{
        NonMaxUsize, PatternID, PatternIDError, PatternIDIter, SmallIndex,
    },
    search::{Match, Span},
};

/// The span offsets of capturing groups after a match has been found.
///
/// This type represents the output of regex engines that can report the
/// offsets at which capturing groups matches or "submatches" occur. For
/// example, the [`PikeVM`](crate::nfa::thompson::pikevm::PikeVM). When a match
/// occurs, it will at minimum contain the [`PatternID`] of the pattern that
/// matched. Depending upon how it was constructed, it may also contain the
/// start/end offsets of the entire match of the pattern and the start/end
/// offsets of each capturing group that participated in the match.
///
/// Values of this type are always created for a specific [`GroupInfo`]. It is
/// unspecified behavior to use a `Captures` value in a search with any regex
/// engine that has a different `GroupInfo` than the one the `Captures` were
/// created with.
///
/// # Constructors
///
/// There are three constructors for this type that control what kind of
/// information is available upon a match:
///
/// * [`Captures::all`]: Will store overall pattern match offsets in addition
/// to the offsets of capturing groups that participated in the match.
/// * [`Captures::matches`]: Will store only the overall pattern
/// match offsets. The offsets of capturing groups (even ones that participated
/// in the match) are not available.
/// * [`Captures::empty`]: Will only store the pattern ID that matched. No
/// match offsets are available at all.
///
/// If you aren't sure which to choose, then pick the first one. The first one
/// is what convenience routines like,
/// [`PikeVM::create_captures`](crate::nfa::thompson::pikevm::PikeVM::create_captures),
/// will use automatically.
///
/// The main difference between these choices is performance. Namely, if you
/// ask for _less_ information, then the execution of regex search may be able
/// to run more quickly.
///
/// # Notes
///
/// It is worth pointing out that this type is not coupled to any one specific
/// regex engine. Instead, its coupling is with [`GroupInfo`], which is the
/// thing that is responsible for mapping capturing groups to "slot" offsets.
/// Slot offsets are indices into a single sequence of memory at which matching
/// haystack offsets for the corresponding group are written by regex engines.
///
/// # Example
///
/// This example shows how to parse a simple date and extract the components of
/// the date via capturing groups:
///
/// ```
/// use regex_automata::{nfa::thompson::pikevm::PikeVM, Span};
///
/// let re = PikeVM::new(r"^([0-9]{4})-([0-9]{2})-([0-9]{2})$")?;
/// let (mut cache, mut caps) = (re.create_cache(), re.create_captures());
///
/// re.captures(&mut cache, "2010-03-14", &mut caps);
/// assert!(caps.is_match());
/// assert_eq!(Some(Span::from(0..4)), caps.get_group(1));
/// assert_eq!(Some(Span::from(5..7)), caps.get_group(2));
/// assert_eq!(Some(Span::from(8..10)), caps.get_group(3));
///
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
///
/// # Example: named capturing groups
///
/// This example is like the one above, but leverages the ability to name
/// capturing groups in order to make the code a bit clearer:
///
/// ```
/// use regex_automata::{nfa::thomp
```
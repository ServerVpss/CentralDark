# OUTRO - prefilter.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\aho-corasick-1.1.5\src\util\prefilter.rs
**SHA:** 183e32aa9951d995
**Timestamp:** 2026-08-28T02:32:20.769816
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = span.start + i;

### Padroes
- let pattern = builder.one.as_ref()?;

### Ouro Bruto (primeiros 5000 chars)
```
use core::{
    cmp,
    fmt::Debug,
    panic::{RefUnwindSafe, UnwindSafe},
    u8,
};

use alloc::{sync::Arc, vec, vec::Vec};

use crate::{
    packed,
    util::{
        alphabet::ByteSet,
        search::{Match, MatchKind, Span},
    },
};

/// A prefilter for accelerating a search.
///
/// This crate uses prefilters in the core search implementations to accelerate
/// common cases. They typically only apply to cases where there are a small
/// number of patterns (less than 100 or so), but when they do, thoughput can
/// be boosted considerably, perhaps by an order of magnitude. When a prefilter
/// is active, it is used whenever a search enters an automaton's start state.
///
/// Currently, prefilters cannot be constructed by
/// callers. A `Prefilter` can only be accessed via the
/// [`Automaton::prefilter`](crate::automaton::Automaton::prefilter)
/// method and used to execute a search. In other words, a prefilter can be
/// used to optimize your own search implementation if necessary, but cannot do
/// much else. If you have a use case for more APIs, please submit an issue.
#[derive(Clone, Debug)]
pub struct Prefilter {
    finder: Arc<dyn PrefilterI>,
    memory_usage: usize,
}

impl Prefilter {
    /// Execute a search in the haystack within the span given. If a match or
    /// a possible match is returned, then it is guaranteed to occur within
    /// the bounds of the span.
    ///
    /// If the span provided is invalid for the given haystack, then behavior
    /// is unspecified.
    #[inline]
    pub fn find_in(&self, haystack: &[u8], span: Span) -> Candidate {
        self.finder.find_in(haystack, span)
    }

    #[inline]
    pub(crate) fn memory_usage(&self) -> usize {
        self.memory_usage
    }
}

/// A candidate is the result of running a prefilter on a haystack at a
/// particular position.
///
/// The result is either no match, a confirmed match or a possible match.
///
/// When no match is returned, the prefilter is guaranteeing that no possible
/// match can be found in the haystack, and the caller may trust this. That is,
/// all correct prefilters must never report false negatives.
///
/// In some cases, a prefilter can confirm a match very quickly, in which case,
/// the caller may use this to stop what it's doing and report the match. In
/// this case, prefilter implementations must never report a false positive.
/// In other cases, the prefilter can only report a potential match, in which
/// case the callers must attempt to confirm the match. In this case, prefilter
/// implementations are permitted to return false positives.
#[derive(Clone, Debug)]
pub enum Candidate {
    /// No match was found. Since false negatives are not possible, this means
    /// the search can quit as it is guaranteed not to find another match.
    None,
    /// A confirmed match was found. Callers do not need to confirm it.
    Match(Match),
    /// The start of a possible match was found. Callers must confirm it before
    /// reporting it as a match.
    PossibleStartOfMatch(usize),
}

impl Candidate {
    /// Convert this candidate into an option. This is useful when callers
    /// do not distinguish between true positives and false positives (i.e.,
    /// the caller must always confirm the match).
    pub fn into_option(self) -> Option<usize> {
        match self {
            Candidate::None => None,
            Candidate::Match(ref m) => Some(m.start()),
            Candidate::PossibleStartOfMatch(start) => Some(start),
        }
    }
}

/// A prefilter describes the behavior of fast literal scanners for quickly
/// skipping past bytes in the haystack that we know cannot possibly
/// participate in a match.
trait PrefilterI:
    Send + Sync + RefUnwindSafe + UnwindSafe + Debug + 'static
{
    /// Returns the next possible match candidate. This may yield false
    /// positives, so callers must confirm a match starting at the position
    /// returned. This, however, must never produce false negatives. That is,
    /// this must, at minimum, return the starting position of the next match
    /// in the given haystack after or at the given position.
    fn find_in(&self, haystack: &[u8], span: Span) -> Candidate;
}

impl<P: PrefilterI + ?Sized> PrefilterI for Arc<P> {
    #[inline(always)]
    fn find_in(&self, haystack: &[u8], span: Span) -> Candidate {
        (**self).find_in(haystack, span)
    }
}

/// A builder for constructing the best possible prefilter. When constructed,
/// this builder will heuristically select the best prefilter it can build,
/// if any, and discard the rest.
#[derive(Debug)]
pub(crate) struct Builder {
    count: usize,
    ascii_case_insensitive: bool,
    start_bytes: StartBytesBuilder,
    rare_bytes: RareBytesBuilder,
    memmem: MemmemBuilder,
    packed: Option<packed::Builder>,
    // If we run across a condition that suggests we shouldn't use a prefilter
    // at all (like an empty pattern), then disable prefilters entirely.
    enabled: bool,
}


```
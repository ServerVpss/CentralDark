# OUTRO - strategy.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\meta\strategy.rs
**SHA:** ae5f22a6435c0e0d
**Timestamp:** 2026-08-28T02:35:06.053990
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = hm.offset();
- let mut min_start = 0;
- span.start = litmatch.start.checked_add(1).unwrap();
- min_start = litmatch.end;
- min_start: usize,
- let hm_start = match self.try_search_half_start(cache, input) {
- let start = hm_start.offset();
- let mut min_match_start = 0;
- let mut min_pre_start = 0;
- min_pre_start = stopat;

### Padroes
- let mut pattern = String::new();
- let pattern = literal_alternation(3_000);
- let pattern = literal_alternation(2_999);
- let pattern = format!("({})", literal_alternation(3_000));
- let pattern = format!(r"(?:{})\b", literal_alternation(3_000));
- let pattern = literal_alternation(3_000);

### Ouro Bruto (primeiros 5000 chars)
```
use core::{
    fmt::Debug,
    panic::{RefUnwindSafe, UnwindSafe},
};

use alloc::{borrow::Cow, format, sync::Arc};

use regex_syntax::hir::{literal, Hir};

use crate::{
    meta::{
        error::{BuildError, RetryError, RetryFailError, RetryQuadraticError},
        regex::{Cache, RegexInfo},
        reverse_inner, reverse_suffix, wrappers,
    },
    nfa::thompson::{self, WhichCaptures, NFA},
    util::{
        captures::{Captures, GroupInfo},
        look::LookMatcher,
        prefilter::{self, Prefilter, PrefilterI},
        primitives::{NonMaxUsize, PatternID},
        search::{Anchored, HalfMatch, Input, Match, MatchKind, PatternSet},
    },
};

/// A trait that represents a single meta strategy. Its main utility is in
/// providing a way to do dynamic dispatch over a few choices.
///
/// Why dynamic dispatch? I actually don't have a super compelling reason, and
/// importantly, I have not benchmarked it with the main alternative: an enum.
/// I went with dynamic dispatch initially because the regex engine search code
/// really can't be inlined into caller code in most cases because it's just
/// too big. In other words, it is already expected that every regex search
/// will entail at least the cost of a function call.
///
/// I do wonder whether using enums would result in better codegen overall
/// though. It's a worthwhile experiment to try. Probably the most interesting
/// benchmark to run in such a case would be one with a high match count. That
/// is, a benchmark to test the overall latency of a search call.
pub(super) trait Strategy:
    Debug + Send + Sync + RefUnwindSafe + UnwindSafe + 'static
{
    #[allow(dead_code)]
    fn name(&self) -> Cow<'static, str>;

    fn group_info(&self) -> &GroupInfo;

    fn create_cache(&self) -> Cache;

    fn reset_cache(&self, cache: &mut Cache);

    fn is_accelerated(&self) -> bool;

    fn memory_usage(&self) -> usize;

    fn search(&self, cache: &mut Cache, input: &Input<'_>) -> Option<Match>;

    fn search_half(
        &self,
        cache: &mut Cache,
        input: &Input<'_>,
    ) -> Option<HalfMatch>;

    fn is_match(&self, cache: &mut Cache, input: &Input<'_>) -> bool;

    fn search_slots(
        &self,
        cache: &mut Cache,
        input: &Input<'_>,
        slots: &mut [Option<NonMaxUsize>],
    ) -> Option<PatternID>;

    fn which_overlapping_matches(
        &self,
        cache: &mut Cache,
        input: &Input<'_>,
        patset: &mut PatternSet,
    );
}

pub(super) fn new(
    info: &RegexInfo,
    hirs: &[&Hir],
) -> Result<Arc<dyn Strategy>, BuildError> {
    // At this point, we're committed to a regex engine of some kind. So pull
    // out a prefilter if we can, which will feed to each of the constituent
    // regex engines.
    let pre = if info.is_always_anchored_start() {
        // PERF: I'm not sure we necessarily want to do this... We may want to
        // run a prefilter for quickly rejecting in some cases. The problem
        // is that anchored searches overlap quite a bit with the use case
        // of "run a regex on every line to extract data." In that case, the
        // regex always matches, so running a prefilter doesn't really help us
        // there. The main place where a prefilter helps in an anchored search
        // is if the anchored search is not expected to match frequently. That
        // is, the prefilter gives us a way to possibly reject a haystack very
        // quickly.
        //
        // Maybe we should do use a prefilter, but only for longer haystacks?
        // Or maybe we should only use a prefilter when we think it's "fast"?
        //
        // Interestingly, I think we currently lack the infrastructure for
        // disabling a prefilter based on haystack length. That would probably
        // need to be a new 'Input' option. (Interestingly, an 'Input' used to
        // carry a 'Prefilter' with it, but I moved away from that.)
        debug!("skipping literal extraction since regex is anchored");
        None
    } else if let Some(pre) = info.config().get_prefilter() {
        debug!(
            "skipping literal extraction since the caller provided a prefilter"
        );
        Some(pre.clone())
    } else if info.config().get_auto_prefilter() {
        let kind = info.config().get_match_kind();
        let prefixes = crate::util::prefilter::prefixes(kind, hirs);
        // If we can build a full `Strategy` from just the extracted prefixes,
        // then we can short-circuit and avoid building a regex engine at all.
        if let Some(pre) = Pre::from_prefixes(info, &prefixes) {
            debug!(
                "found that the regex can be broken down to a literal \
                 search, avoiding the regex engine entirely",
            );
            debug!("using {} strategy", pre.name());
            return Ok(pre);
        }
        // This now attempts another short-circuit of the regex engine: if we
        // have a huge alternation of just pl
```
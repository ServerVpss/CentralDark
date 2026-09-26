# COMANDO - wrappers.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\meta\wrappers.rs
**SHA:** 79b1d63d40e4e4a1
**Timestamp:** 2026-08-28T02:35:06.016247
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- min_start: usize,
- min_start: usize,
- min_start: usize,
- min_start: usize,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
This module contains a boat load of wrappers around each of our internal regex
engines. They encapsulate a few things:

1. The wrappers manage the conditional existence of the regex engine. Namely,
the PikeVM is the only required regex engine. The rest are optional. These
wrappers present a uniform API regardless of which engines are available. And
availability might be determined by compile time features or by dynamic
configuration via `meta::Config`. Encapsulating the conditional compilation
features is in particular a huge simplification for the higher level code that
composes these engines.
2. The wrappers manage construction of each engine, including skipping it if
the engine is unavailable or configured to not be used.
3. The wrappers manage whether an engine *can* be used for a particular
search configuration. For example, `BoundedBacktracker::get` only returns a
backtracking engine when the haystack is bigger than the maximum supported
length. The wrappers also sometimes take a position on when an engine *ought*
to be used, but only in cases where the logic is extremely local to the engine
itself. Otherwise, things like "choose between the backtracker and the one-pass
DFA" are managed by the higher level meta strategy code.

There are also corresponding wrappers for the various `Cache` types for each
regex engine that needs them. If an engine is unavailable or not used, then a
cache for it will *not* actually be allocated.
*/

use alloc::vec::Vec;

use crate::{
    meta::{
        error::{BuildError, RetryError, RetryFailError},
        regex::RegexInfo,
    },
    nfa::thompson::{pikevm, NFA},
    util::{prefilter::Prefilter, primitives::NonMaxUsize},
    HalfMatch, Input, Match, MatchKind, PatternID, PatternSet,
};

#[cfg(feature = "dfa-build")]
use crate::dfa;
#[cfg(feature = "dfa-onepass")]
use crate::dfa::onepass;
#[cfg(feature = "hybrid")]
use crate::hybrid;
#[cfg(feature = "nfa-backtrack")]
use crate::nfa::thompson::backtrack;

#[derive(Debug)]
pub(crate) struct PikeVM(PikeVMEngine);

impl PikeVM {
    pub(crate) fn new(
        info: &RegexInfo,
        pre: Option<Prefilter>,
        nfa: &NFA,
    ) -> Result<PikeVM, BuildError> {
        PikeVMEngine::new(info, pre, nfa).map(PikeVM)
    }

    pub(crate) fn create_cache(&self) -> PikeVMCache {
        PikeVMCache::none()
    }

    #[cfg_attr(feature = "perf-inline", inline(always))]
    pub(crate) fn get(&self) -> &PikeVMEngine {
        &self.0
    }
}

#[derive(Debug)]
pub(crate) struct PikeVMEngine(pikevm::PikeVM);

impl PikeVMEngine {
    pub(crate) fn new(
        info: &RegexInfo,
        pre: Option<Prefilter>,
        nfa: &NFA,
    ) -> Result<PikeVMEngine, BuildError> {
        let pikevm_config = pikevm::Config::new()
            .match_kind(info.config().get_match_kind())
            .prefilter(pre);
        let engine = pikevm::Builder::new()
            .configure(pikevm_config)
            .build_from_nfa(nfa.clone())
            .map_err(BuildError::nfa)?;
        debug!("PikeVM built");
        Ok(PikeVMEngine(engine))
    }

    #[cfg_attr(feature = "perf-inline", inline(always))]
    pub(crate) fn is_match(
        &self,
        cache: &mut PikeVMCache,
        input: &Input<'_>,
    ) -> bool {
        self.0.is_match(cache.get(&self.0), input.clone())
    }

    #[cfg_attr(feature = "perf-inline", inline(always))]
    pub(crate) fn search_slots(
        &self,
        cache: &mut PikeVMCache,
        input: &Input<'_>,
        slots: &mut [Option<NonMaxUsize>],
    ) -> Option<PatternID> {
        self.0.search_slots(cache.get(&self.0), input, slots)
    }

    #[cfg_attr(feature = "perf-inline", inline(always))]
    pub(crate) fn which_overlapping_matches(
        &self,
        cache: &mut PikeVMCache,
        input: &Input<'_>,
        patset: &mut PatternSet,
    ) {
        self.0.which_overlapping_matches(cache.get(&self.0), input, patset)
    }
}

#[derive(Clone, Debug)]
pub(crate) struct PikeVMCache(Option<pikevm::Cache>);

impl PikeVMCache {
    pub(crate) fn none() -> PikeVMCache {
        PikeVMCache(None)
    }

    pub(crate) fn reset(&mut self, builder: &PikeVM) {
        self.get(&builder.get().0).reset(&builder.get().0);
    }

    pub(crate) fn memory_usage(&self) -> usize {
        self.0.as_ref().map_or(0, |c| c.memory_usage())
    }

    fn get(&mut self, vm: &pikevm::PikeVM) -> &mut pikevm::Cache {
        self.0.get_or_insert_with(|| vm.create_cache())
    }
}

#[derive(Debug)]
pub(crate) struct BoundedBacktracker(Option<BoundedBacktrackerEngine>);

impl BoundedBacktracker {
    pub(crate) fn new(
        info: &RegexInfo,
        pre: Option<Prefilter>,
        nfa: &NFA,
    ) -> Result<BoundedBacktracker, BuildError> {
        BoundedBacktrackerEngine::new(info, pre, nfa).map(BoundedBacktracker)
    }

    pub(crate) fn create_cache(&self) -> BoundedBacktrackerCache {
        BoundedBacktrackerCache::none()
    }

    #[cfg_attr(feature = "perf-inline", inline(always))]
    pub(crate) fn
```
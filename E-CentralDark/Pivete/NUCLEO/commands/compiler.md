# COMANDO - compiler.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\nfa\thompson\compiler.rs
**SHA:** cc1fbc44f0106049
**Timestamp:** 2026-08-28T02:35:06.245553
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Ok(ThompsonRef { start: one.start, end: match_state_id })
- Ok(ThompsonRef { start: union, end })
- let start = self.add_capture_start(index, name)?;
- Ok(ThompsonRef { start: prefix.start, end: empty })
- return Ok(ThompsonRef { start: union, end: union });
- Ok(ThompsonRef { start: question, end: empty })
- Ok(ThompsonRef { start: compiled.start, end: union })
- Ok(ThompsonRef { start: prefix.start, end: union })
- Ok(ThompsonRef { start: union, end: empty })
- start: r.start(),

### Padroes
- pub fn build(&self, pattern: &str) -> Result<NFA, BuildError> {
- fn build(pattern: &str) -> NFA {
- fn s_cap(next: usize, pattern: usize, index: usize, slot: usize) -> State {

### Contratos
- hir::Look::WordAsciiNegate => Look::WordAsciiNegate,
- hir::Look::WordUnicodeNegate => Look::WordUnicodeNegate,

### Ouro Bruto (primeiros 5000 chars)
```
use core::{borrow::Borrow, cell::RefCell};

use alloc::{sync::Arc, vec, vec::Vec};

use regex_syntax::{
    hir::{self, Hir},
    utf8::{Utf8Range, Utf8Sequences},
    ParserBuilder,
};

use crate::{
    nfa::thompson::{
        builder::Builder,
        error::BuildError,
        literal_trie::LiteralTrie,
        map::{Utf8BoundedMap, Utf8SuffixKey, Utf8SuffixMap},
        nfa::{Transition, NFA},
        range_trie::RangeTrie,
    },
    util::{
        look::{Look, LookMatcher},
        primitives::{PatternID, StateID},
    },
};

/// The configuration used for a Thompson NFA compiler.
#[derive(Clone, Debug, Default)]
pub struct Config {
    utf8: Option<bool>,
    reverse: Option<bool>,
    nfa_size_limit: Option<Option<usize>>,
    shrink: Option<bool>,
    which_captures: Option<WhichCaptures>,
    look_matcher: Option<LookMatcher>,
    #[cfg(test)]
    unanchored_prefix: Option<bool>,
}

impl Config {
    /// Return a new default Thompson NFA compiler configuration.
    pub fn new() -> Config {
        Config::default()
    }

    /// Whether to enable UTF-8 mode during search or not.
    ///
    /// A regex engine is said to be in UTF-8 mode when it guarantees that
    /// all matches returned by it have spans consisting of only valid UTF-8.
    /// That is, it is impossible for a match span to be returned that
    /// contains any invalid UTF-8.
    ///
    /// UTF-8 mode generally consists of two things:
    ///
    /// 1. Whether the NFA's states are constructed such that all paths to a
    /// match state that consume at least one byte always correspond to valid
    /// UTF-8.
    /// 2. Whether all paths to a match state that do _not_ consume any bytes
    /// should always correspond to valid UTF-8 boundaries.
    ///
    /// (1) is a guarantee made by whoever constructs the NFA.
    /// If you're parsing a regex from its concrete syntax, then
    /// [`syntax::Config::utf8`](crate::util::syntax::Config::utf8) can make
    /// this guarantee for you. It does it by returning an error if the regex
    /// pattern could every report a non-empty match span that contains invalid
    /// UTF-8. So long as `syntax::Config::utf8` mode is enabled and your regex
    /// successfully parses, then you're guaranteed that the corresponding NFA
    /// will only ever report non-empty match spans containing valid UTF-8.
    ///
    /// (2) is a trickier guarantee because it cannot be enforced by the NFA
    /// state graph itself. Consider, for example, the regex `a*`. It matches
    /// the empty strings in `☃` at positions `0`, `1`, `2` and `3`, where
    /// positions `1` and `2` occur within the UTF-8 encoding of a codepoint,
    /// and thus correspond to invalid UTF-8 boundaries. Therefore, this
    /// guarantee must be made at a higher level than the NFA state graph
    /// itself. This crate deals with this case in each regex engine. Namely,
    /// when a zero-width match that splits a codepoint is found and UTF-8
    /// mode enabled, then it is ignored and the engine moves on looking for
    /// the next match.
    ///
    /// Thus, UTF-8 mode is both a promise that the NFA built only reports
    /// non-empty matches that are valid UTF-8, and an *instruction* to regex
    /// engines that empty matches that split codepoints should be banned.
    ///
    /// Because UTF-8 mode is fundamentally about avoiding invalid UTF-8 spans,
    /// it only makes sense to enable this option when you *know* your haystack
    /// is valid UTF-8. (For example, a `&str`.) Enabling UTF-8 mode and
    /// searching a haystack that contains invalid UTF-8 leads to **unspecified
    /// behavior**.
    ///
    /// Therefore, it may make sense to enable `syntax::Config::utf8` while
    /// simultaneously *disabling* this option. That would ensure all non-empty
    /// match spans are valid UTF-8, but that empty match spans may still split
    /// a codepoint or match at other places that aren't valid UTF-8.
    ///
    /// In general, this mode is only relevant if your regex can match the
    /// empty string. Most regexes don't.
    ///
    /// This is enabled by default.
    ///
    /// # Example
    ///
    /// This example shows how UTF-8 mode can impact the match spans that may
    /// be reported in certain cases.
    ///
    /// ```
    /// use regex_automata::{
    ///     nfa::thompson::{self, pikevm::PikeVM},
    ///     Match, Input,
    /// };
    ///
    /// let re = PikeVM::new("")?;
    /// let (mut cache, mut caps) = (re.create_cache(), re.create_captures());
    ///
    /// // UTF-8 mode is enabled by default.
    /// let mut input = Input::new("☃");
    /// re.search(&mut cache, &input, &mut caps);
    /// assert_eq!(Some(Match::must(0, 0..0)), caps.get_match());
    ///
    /// // Even though an empty regex matches at 1..1, our next match is
    /// // 3..3 because 1..1 and 2..2 split the snowman codepoint (which is
    /// // three bytes long).
    /// input.set_start(1);
    /// re.search(&mut cache
```
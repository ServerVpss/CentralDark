# OUTRO - suite.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\tests\dfa\suite.rs
**SHA:** 26cfc5a89a2ceda3
**Timestamp:** 2026-08-28T02:35:06.987258
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- span: Span { start: m.start(), end: m.end() },
- let span = Span { start: start.offset(), end: end.offset() };

### Ouro Bruto (primeiros 5000 chars)
```
use {
    anyhow::Result,
    regex_automata::{
        dfa::{
            self, dense, regex::Regex, sparse, Automaton, OverlappingState,
            StartKind,
        },
        nfa::thompson,
        util::{prefilter::Prefilter, syntax},
        Anchored, Input, PatternSet,
    },
    regex_test::{
        CompiledRegex, Match, RegexTest, SearchKind, Span, TestResult,
        TestRunner,
    },
};

use crate::{create_input, suite, untestify_kind};

const EXPANSIONS: &[&str] = &["is_match", "find", "which"];

/// Runs the test suite with the default configuration.
#[test]
fn unminimized_default() -> Result<()> {
    let builder = Regex::builder();
    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .blacklist("expensive")
        .test_iter(suite()?.iter(), dense_compiler(builder))
        .assert();
    Ok(())
}

/// Runs the test suite with the default configuration and a prefilter enabled,
/// if one can be built.
#[test]
fn unminimized_prefilter() -> Result<()> {
    let my_compiler = |test: &RegexTest, regexes: &[String]| {
        // Parse regexes as HIRs so we can get literals to build a prefilter.
        let mut hirs = vec![];
        for pattern in regexes.iter() {
            hirs.push(syntax::parse_with(pattern, &config_syntax(test))?);
        }
        let kind = match untestify_kind(test.match_kind()) {
            None => return Ok(CompiledRegex::skip()),
            Some(kind) => kind,
        };
        let pre = Prefilter::from_hirs_prefix(kind, &hirs);
        let mut builder = Regex::builder();
        builder.dense(dense::DFA::config().prefilter(pre));
        compiler(builder, |_, _, re| {
            Ok(CompiledRegex::compiled(move |test| -> TestResult {
                run_test(&re, test)
            }))
        })(test, regexes)
    };
    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .blacklist("expensive")
        .test_iter(suite()?.iter(), my_compiler)
        .assert();
    Ok(())
}

/// Runs the test suite with start states specialized.
#[test]
fn unminimized_specialized_start_states() -> Result<()> {
    let mut builder = Regex::builder();
    builder.dense(dense::Config::new().specialize_start_states(true));

    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .blacklist("expensive")
        .test_iter(suite()?.iter(), dense_compiler(builder))
        .assert();
    Ok(())
}

/// Runs the test suite with byte classes disabled.
#[test]
fn unminimized_no_byte_class() -> Result<()> {
    let mut builder = Regex::builder();
    builder.dense(dense::Config::new().byte_classes(false));

    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .blacklist("expensive")
        .test_iter(suite()?.iter(), dense_compiler(builder))
        .assert();
    Ok(())
}

/// Runs the test suite with NFA shrinking enabled.
#[test]
fn unminimized_nfa_shrink() -> Result<()> {
    let mut builder = Regex::builder();
    builder.thompson(thompson::Config::new().shrink(true));

    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .blacklist("expensive")
        .test_iter(suite()?.iter(), dense_compiler(builder))
        .assert();
    Ok(())
}

/// Runs the test suite on a minimized DFA with an otherwise default
/// configuration.
#[test]
fn minimized_default() -> Result<()> {
    let mut builder = Regex::builder();
    builder.dense(dense::Config::new().minimize(true));
    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .blacklist("expensive")
        .test_iter(suite()?.iter(), dense_compiler(builder))
        .assert();
    Ok(())
}

/// Runs the test suite on a minimized DFA with byte classes disabled.
#[test]
fn minimized_no_byte_class() -> Result<()> {
    let mut builder = Regex::builder();
    builder.dense(dense::Config::new().minimize(true).byte_classes(false));

    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .blacklist("expensive")
        .test_iter(suite()?.iter(), dense_compiler(builder))
        .assert();
    Ok(())
}

/// Runs the test suite on a sparse unminimized DFA.
#[test]
fn sparse_unminimized_default() -> Result<()> {
    let builder = Regex::builder();
    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .blacklist("expensive")
        .test_iter(suite()?.iter(), sparse_compiler(builder))
        .assert();
    Ok(())
}

/// Runs the test suite on a sparse unminimized DFA with prefilters enabled.
#[test]
fn sparse_unminimized_prefilter() -> Result<()> {
    let my_compiler = |test: &RegexTest, regexes: &[String]| {
        // Parse regexes as HIRs so we can get literals to build a prefilter.
        let mut hirs = vec![];
        for pattern in regexes.iter() {
            hirs.push(syntax::parse_with(pattern, &config_syntax(test))?);
        }
        let kind = match untestify_kind(test.match_kind()) {
            None => return Ok(CompiledRegex::skip()),
            Som
```

---

# OUTRO - suite.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\tests\dfa\onepass\suite.rs
**SHA:** f6a9cba40773db81
**Timestamp:** 2026-08-28T02:35:06.994812
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- span: Span { start: m.start(), end: m.end() },

### Ouro Bruto (primeiros 5000 chars)
```
use {
    anyhow::Result,
    regex_automata::{
        dfa::onepass::{self, DFA},
        nfa::thompson,
        util::{iter, syntax},
    },
    regex_test::{
        CompiledRegex, Match, RegexTest, SearchKind, Span, TestResult,
        TestRunner,
    },
};

use crate::{create_input, suite, testify_captures, untestify_kind};

const EXPANSIONS: &[&str] = &["is_match", "find", "captures"];

/// Tests the default configuration of the hybrid NFA/DFA.
#[test]
fn default() -> Result<()> {
    let builder = DFA::builder();
    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .test_iter(suite()?.iter(), compiler(builder))
        .assert();
    Ok(())
}

/// Tests the hybrid NFA/DFA when 'starts_for_each_pattern' is enabled for all
/// tests.
#[test]
fn starts_for_each_pattern() -> Result<()> {
    let mut builder = DFA::builder();
    builder.configure(DFA::config().starts_for_each_pattern(true));
    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .test_iter(suite()?.iter(), compiler(builder))
        .assert();
    Ok(())
}

/// Tests the hybrid NFA/DFA when byte classes are disabled.
///
/// N.B. Disabling byte classes doesn't avoid any indirection at search time.
/// All it does is cause every byte value to be its own distinct equivalence
/// class.
#[test]
fn no_byte_classes() -> Result<()> {
    let mut builder = DFA::builder();
    builder.configure(DFA::config().byte_classes(false));
    TestRunner::new()?
        .expand(EXPANSIONS, |t| t.compiles())
        .test_iter(suite()?.iter(), compiler(builder))
        .assert();
    Ok(())
}

fn compiler(
    mut builder: onepass::Builder,
) -> impl FnMut(&RegexTest, &[String]) -> Result<CompiledRegex> {
    move |test, regexes| {
        // Check if our regex contains things that aren't supported by DFAs.
        // That is, Unicode word boundaries when searching non-ASCII text.
        if !configure_onepass_builder(test, &mut builder) {
            return Ok(CompiledRegex::skip());
        }
        let re = match builder.build_many(&regexes) {
            Ok(re) => re,
            Err(err) => {
                let msg = err.to_string();
                // This is pretty gross, but when a regex fails to compile as
                // a one-pass regex, then we want to be OK with that and just
                // skip the test. But we have to be careful to only skip it
                // when the expected result is that the regex compiles. If
                // the test is specifically checking that the regex does not
                // compile, then we should bubble up that error and allow the
                // test to pass.
                //
                // Since our error types are all generally opaque, we just
                // look for an error string. Not great, but not the end of the
                // world.
                if test.compiles() && msg.contains("not one-pass") {
                    return Ok(CompiledRegex::skip());
                }
                return Err(err.into());
            }
        };
        let mut cache = re.create_cache();
        Ok(CompiledRegex::compiled(move |test| -> TestResult {
            run_test(&re, &mut cache, test)
        }))
    }
}

fn run_test(
    re: &DFA,
    cache: &mut onepass::Cache,
    test: &RegexTest,
) -> TestResult {
    let input = create_input(test);
    match test.additional_name() {
        "is_match" => {
            TestResult::matched(re.is_match(cache, input.earliest(true)))
        }
        "find" => match test.search_kind() {
            SearchKind::Earliest | SearchKind::Leftmost => {
                let input =
                    input.earliest(test.search_kind() == SearchKind::Earliest);
                let mut caps = re.create_captures();
                let it = iter::Searcher::new(input)
                    .into_matches_iter(|input| {
                        re.try_search(cache, input, &mut caps)?;
                        Ok(caps.get_match())
                    })
                    .infallible()
                    .take(test.match_limit().unwrap_or(std::usize::MAX))
                    .map(|m| Match {
                        id: m.pattern().as_usize(),
                        span: Span { start: m.start(), end: m.end() },
                    });
                TestResult::matches(it)
            }
            SearchKind::Overlapping => {
                // The one-pass DFA does not support any kind of overlapping
                // search. This is not just a matter of not having the API.
                // It's fundamentally incompatible with the one-pass concept.
                // If overlapping matches were possible, then the one-pass DFA
                // would fail to build.
                TestResult::skip()
            }
        },
        "captures" => match test.search_kind() {
            SearchKind::Earliest | SearchKind::Leftmost => {
                let input =
                    input.earliest(test.
```

---

# OUTRO - suite.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\tests\meta\suite.rs
**SHA:** 7cafd709c61481f2
**Timestamp:** 2026-08-28T02:35:07.391008
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- span: Span { start: m.start(), end: m.end() },
- span: Span { start: m.start(), end: m.end() },

### Ouro Bruto (primeiros 5000 chars)
```
use {
    anyhow::Result,
    regex_automata::{
        meta::{self, Regex},
        util::syntax,
        MatchKind, PatternSet,
    },
    regex_test::{
        CompiledRegex, Match, RegexTest, SearchKind, Span, TestResult,
        TestRunner,
    },
};

use crate::{create_input, suite, testify_captures};

const BLACKLIST: &[&str] = &[
    // These 'earliest' tests are blacklisted because the meta searcher doesn't
    // give the same offsets that the test expects. This is legal because the
    // 'earliest' routines don't guarantee a particular match offset other
    // than "the earliest the regex engine can report a match." Some regex
    // engines will quit earlier than others. The backtracker, for example,
    // can't really quit before finding the full leftmost-first match. Many of
    // the literal searchers also don't have the ability to quit fully or it's
    // otherwise not worth doing. (A literal searcher not quitting as early as
    // possible usually means looking at a few more bytes. That's no biggie.)
    "earliest/",
];

/// Tests the default configuration of the meta regex engine.
#[test]
fn default() -> Result<()> {
    let builder = Regex::builder();
    let mut runner = TestRunner::new()?;
    runner
        .expand(&["is_match", "find", "captures"], |test| test.compiles())
        .blacklist_iter(BLACKLIST)
        .test_iter(suite()?.iter(), compiler(builder))
        .assert();
    Ok(())
}

/// Tests the default configuration minus the full DFA.
#[test]
fn no_dfa() -> Result<()> {
    let mut builder = Regex::builder();
    builder.configure(Regex::config().dfa(false));
    let mut runner = TestRunner::new()?;
    runner
        .expand(&["is_match", "find", "captures"], |test| test.compiles())
        .blacklist_iter(BLACKLIST)
        .test_iter(suite()?.iter(), compiler(builder))
        .assert();
    Ok(())
}

/// Tests the default configuration minus the full DFA and lazy DFA.
#[test]
fn no_dfa_hybrid() -> Result<()> {
    let mut builder = Regex::builder();
    builder.configure(Regex::config().dfa(false).hybrid(false));
    let mut runner = TestRunner::new()?;
    runner
        .expand(&["is_match", "find", "captures"], |test| test.compiles())
        .blacklist_iter(BLACKLIST)
        .test_iter(suite()?.iter(), compiler(builder))
        .assert();
    Ok(())
}

/// Tests the default configuration minus the full DFA, lazy DFA and one-pass
/// DFA.
#[test]
fn no_dfa_hybrid_onepass() -> Result<()> {
    let mut builder = Regex::builder();
    builder.configure(Regex::config().dfa(false).hybrid(false).onepass(false));
    let mut runner = TestRunner::new()?;
    runner
        .expand(&["is_match", "find", "captures"], |test| test.compiles())
        .blacklist_iter(BLACKLIST)
        .test_iter(suite()?.iter(), compiler(builder))
        .assert();
    Ok(())
}

/// Tests the default configuration minus the full DFA, lazy DFA, one-pass
/// DFA and backtracker.
#[test]
fn no_dfa_hybrid_onepass_backtrack() -> Result<()> {
    let mut builder = Regex::builder();
    builder.configure(
        Regex::config()
            .dfa(false)
            .hybrid(false)
            .onepass(false)
            .backtrack(false),
    );
    let mut runner = TestRunner::new()?;
    runner
        .expand(&["is_match", "find", "captures"], |test| test.compiles())
        .blacklist_iter(BLACKLIST)
        .test_iter(suite()?.iter(), compiler(builder))
        .assert();
    Ok(())
}

fn compiler(
    mut builder: meta::Builder,
) -> impl FnMut(&RegexTest, &[String]) -> Result<CompiledRegex> {
    move |test, regexes| {
        if !configure_meta_builder(test, &mut builder) {
            return Ok(CompiledRegex::skip());
        }
        let re = builder.build_many(&regexes)?;
        Ok(CompiledRegex::compiled(move |test| -> TestResult {
            run_test(&re, test)
        }))
    }
}

fn run_test(re: &Regex, test: &RegexTest) -> TestResult {
    let input = create_input(test);
    match test.additional_name() {
        "is_match" => TestResult::matched(re.is_match(input)),
        "find" => match test.search_kind() {
            SearchKind::Earliest => TestResult::matches(
                re.find_iter(input.earliest(true))
                    .take(test.match_limit().unwrap_or(std::usize::MAX))
                    .map(|m| Match {
                        id: m.pattern().as_usize(),
                        span: Span { start: m.start(), end: m.end() },
                    }),
            ),
            SearchKind::Leftmost => TestResult::matches(
                re.find_iter(input)
                    .take(test.match_limit().unwrap_or(std::usize::MAX))
                    .map(|m| Match {
                        id: m.pattern().as_usize(),
                        span: Span { start: m.start(), end: m.end() },
                    }),
            ),
            SearchKind::Overlapping => {
                let mut patset = PatternSet::new(re.pattern_len());
                re.which_o
```

---

# OUTRO - suite.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\tests\nfa\thompson\pikevm\suite.rs
**SHA:** cf21a58532f3dc8f
**Timestamp:** 2026-08-28T02:35:07.600544
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- span: Span { start: m.start(), end: m.end() },
- span: Span { start: m.start(), end: m.end() },

### Ouro Bruto (primeiros 5000 chars)
```
use {
    anyhow::Result,
    regex_automata::{
        nfa::thompson::{
            self,
            pikevm::{self, PikeVM},
        },
        util::{prefilter::Prefilter, syntax},
        PatternSet,
    },
    regex_test::{
        CompiledRegex, Match, RegexTest, SearchKind, Span, TestResult,
        TestRunner,
    },
};

use crate::{create_input, suite, testify_captures, untestify_kind};

/// Tests the default configuration of the hybrid NFA/DFA.
#[test]
fn default() -> Result<()> {
    let builder = PikeVM::builder();
    let mut runner = TestRunner::new()?;
    runner.expand(&["is_match", "find", "captures"], |test| test.compiles());
    runner.test_iter(suite()?.iter(), compiler(builder)).assert();
    Ok(())
}

/// Tests the PikeVM with prefilters enabled.
#[test]
fn prefilter() -> Result<()> {
    let my_compiler = |test: &RegexTest, regexes: &[String]| {
        // Parse regexes as HIRs so we can get literals to build a prefilter.
        let mut hirs = vec![];
        for pattern in regexes.iter() {
            hirs.push(syntax::parse_with(pattern, &config_syntax(test))?);
        }
        let kind = match untestify_kind(test.match_kind()) {
            None => return Ok(CompiledRegex::skip()),
            Some(kind) => kind,
        };
        let pre = Prefilter::from_hirs_prefix(kind, &hirs);
        let mut builder = PikeVM::builder();
        builder.configure(PikeVM::config().prefilter(pre));
        compiler(builder)(test, regexes)
    };
    let mut runner = TestRunner::new()?;
    runner.expand(&["is_match", "find", "captures"], |test| test.compiles());
    runner.test_iter(suite()?.iter(), my_compiler).assert();
    Ok(())
}

fn compiler(
    mut builder: pikevm::Builder,
) -> impl FnMut(&RegexTest, &[String]) -> Result<CompiledRegex> {
    move |test, regexes| {
        if !configure_pikevm_builder(test, &mut builder) {
            return Ok(CompiledRegex::skip());
        }
        let re = builder.build_many(&regexes)?;
        let mut cache = re.create_cache();
        Ok(CompiledRegex::compiled(move |test| -> TestResult {
            run_test(&re, &mut cache, test)
        }))
    }
}

fn run_test(
    re: &PikeVM,
    cache: &mut pikevm::Cache,
    test: &RegexTest,
) -> TestResult {
    let input = create_input(test);
    match test.additional_name() {
        "is_match" => TestResult::matched(re.is_match(cache, input)),
        "find" => match test.search_kind() {
            SearchKind::Earliest => {
                let it = re
                    .find_iter(cache, input.earliest(true))
                    .take(test.match_limit().unwrap_or(std::usize::MAX))
                    .map(|m| Match {
                        id: m.pattern().as_usize(),
                        span: Span { start: m.start(), end: m.end() },
                    });
                TestResult::matches(it)
            }
            SearchKind::Leftmost => {
                let it = re
                    .find_iter(cache, input)
                    .take(test.match_limit().unwrap_or(std::usize::MAX))
                    .map(|m| Match {
                        id: m.pattern().as_usize(),
                        span: Span { start: m.start(), end: m.end() },
                    });
                TestResult::matches(it)
            }
            SearchKind::Overlapping => {
                let mut patset = PatternSet::new(re.get_nfa().pattern_len());
                re.which_overlapping_matches(cache, &input, &mut patset);
                TestResult::which(patset.iter().map(|p| p.as_usize()))
            }
        },
        "captures" => match test.search_kind() {
            SearchKind::Earliest => {
                let it = re
                    .captures_iter(cache, input.earliest(true))
                    .take(test.match_limit().unwrap_or(std::usize::MAX))
                    .map(|caps| testify_captures(&caps));
                TestResult::captures(it)
            }
            SearchKind::Leftmost => {
                let it = re
                    .captures_iter(cache, input)
                    .take(test.match_limit().unwrap_or(std::usize::MAX))
                    .map(|caps| testify_captures(&caps));
                TestResult::captures(it)
            }
            SearchKind::Overlapping => {
                // There is no overlapping PikeVM API that supports captures.
                TestResult::skip()
            }
        },
        name => TestResult::fail(&format!("unrecognized test name: {name}")),
    }
}

/// Configures the given regex builder with all relevant settings on the given
/// regex test.
///
/// If the regex test has a setting that is unsupported, then this returns
/// false (implying the test should be skipped).
fn configure_pikevm_builder(
    test: &RegexTest,
    builder: &mut pikevm::Builder,
) -> bool {
    let match_kind = match untestify_kind(test.match_kind()) {
        None => return false,
        Some(k) => k,
    };
    let pikevm_config = PikeVM::conf
```
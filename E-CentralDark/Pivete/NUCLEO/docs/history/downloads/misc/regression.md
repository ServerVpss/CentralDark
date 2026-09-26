# OUTRO - regression.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-1.13.1\tests\regression.rs
**SHA:** 3490aac99fdbf3f0
**Timestamp:** 2026-08-28T02:35:05.093198
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ($pattern:expr) => {
- let pattern = needles.join("|");

### Ouro Bruto (primeiros 5000 chars)
```
use regex::Regex;

macro_rules! regex {
    ($pattern:expr) => {
        regex::Regex::new($pattern).unwrap()
    };
}

// See: https://github.com/rust-lang/regex/issues/48
#[test]
fn invalid_regexes_no_crash() {
    assert!(Regex::new("(*)").is_err());
    assert!(Regex::new("(?:?)").is_err());
    assert!(Regex::new("(?)").is_err());
    assert!(Regex::new("*").is_err());
}

// See: https://github.com/rust-lang/regex/issues/98
#[test]
fn regression_many_repeat_stack_overflow() {
    let re = regex!("^.{1,2500}");
    assert_eq!(
        vec![0..1],
        re.find_iter("a").map(|m| m.range()).collect::<Vec<_>>()
    );
}

// See: https://github.com/rust-lang/regex/issues/555
#[test]
fn regression_invalid_repetition_expr() {
    assert!(Regex::new("(?m){1,1}").is_err());
}

// See: https://github.com/rust-lang/regex/issues/527
#[test]
fn regression_invalid_flags_expression() {
    assert!(Regex::new("(((?x)))").is_ok());
}

// See: https://github.com/rust-lang/regex/issues/129
#[test]
fn regression_captures_rep() {
    let re = regex!(r"([a-f]){2}(?P<foo>[x-z])");
    let caps = re.captures("abx").unwrap();
    assert_eq!(&caps["foo"], "x");
}

// See: https://github.com/BurntSushi/ripgrep/issues/1247
#[cfg(feature = "unicode-perl")]
#[test]
fn regression_nfa_stops1() {
    let re = regex::bytes::Regex::new(r"\bs(?:[ab])").unwrap();
    assert_eq!(0, re.find_iter(b"s\xE4").count());
}

// See: https://github.com/rust-lang/regex/issues/981
#[cfg(feature = "unicode")]
#[test]
fn regression_bad_word_boundary() {
    let re = regex!(r#"(?i:(?:\b|_)win(?:32|64|dows)?(?:\b|_))"#);
    let hay = "ubi-Darwin-x86_64.tar.gz";
    assert!(!re.is_match(hay));
    let hay = "ubi-Windows-x86_64.zip";
    assert!(re.is_match(hay));
}

// See: https://github.com/rust-lang/regex/issues/982
#[cfg(feature = "unicode-perl")]
#[test]
fn regression_unicode_perl_not_enabled() {
    let pat = r"(\d+\s?(years|year|y))?\s?(\d+\s?(months|month|m))?\s?(\d+\s?(weeks|week|w))?\s?(\d+\s?(days|day|d))?\s?(\d+\s?(hours|hour|h))?";
    assert!(Regex::new(pat).is_ok());
}

// See: https://github.com/rust-lang/regex/issues/995
#[test]
fn regression_big_regex_overflow() {
    let pat = r" {2147483516}{2147483416}{5}";
    assert!(Regex::new(pat).is_err());
}

// See: https://github.com/rust-lang/regex/issues/999
#[test]
fn regression_complete_literals_suffix_incorrect() {
    let needles = vec![
        "aA", "bA", "cA", "dA", "eA", "fA", "gA", "hA", "iA", "jA", "kA",
        "lA", "mA", "nA", "oA", "pA", "qA", "rA", "sA", "tA", "uA", "vA",
        "wA", "xA", "yA", "zA",
    ];
    let pattern = needles.join("|");
    let re = regex!(&pattern);
    let hay = "FUBAR";
    assert_eq!(0, re.find_iter(hay).count());
}

```

---

# OUTRO - regression.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\tests\dfa\regression.rs
**SHA:** 8ade68fc4c753858
**Timestamp:** 2026-08-28T02:35:06.975707
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let pattern =

### Ouro Bruto (primeiros 5000 chars)
```
// A regression test for checking that minimization correctly translates
// whether a state is a match state or not. Previously, it was possible for
// minimization to mark a non-matching state as matching.
#[test]
#[cfg(not(miri))]
fn minimize_sets_correct_match_states() {
    use regex_automata::{
        dfa::{dense::DFA, Automaton, StartKind},
        Anchored, Input,
    };

    let pattern =
        // This is a subset of the grapheme matching regex. I couldn't seem
        // to get a repro any smaller than this unfortunately.
        r"(?x)
            (?:
                \p{gcb=Prepend}*
                (?:
                    (?:
                        (?:
                            \p{gcb=L}*
                            (?:\p{gcb=V}+|\p{gcb=LV}\p{gcb=V}*|\p{gcb=LVT})
                            \p{gcb=T}*
                        )
                        |
                        \p{gcb=L}+
                        |
                        \p{gcb=T}+
                    )
                    |
                    \p{Extended_Pictographic}
                    (?:\p{gcb=Extend}*\p{gcb=ZWJ}\p{Extended_Pictographic})*
                    |
                    [^\p{gcb=Control}\p{gcb=CR}\p{gcb=LF}]
                )
                [\p{gcb=Extend}\p{gcb=ZWJ}\p{gcb=SpacingMark}]*
            )
        ";

    let dfa = DFA::builder()
        .configure(
            DFA::config().start_kind(StartKind::Anchored).minimize(true),
        )
        .build(pattern)
        .unwrap();
    let input = Input::new(b"\xE2").anchored(Anchored::Yes);
    assert_eq!(Ok(None), dfa.try_search_fwd(&input));
}

// A prefilter must not skip to a new candidate after the DFA has already
// recorded a match. The DFA is still resolving the priority of that match,
// and skipping can cause a later match to overwrite it.
#[test]
#[cfg(feature = "perf-literal-multisubstring")]
fn prefilter_does_not_skip_pending_match() {
    use regex_automata::{
        dfa::{dense::DFA, Automaton},
        util::prefilter::Prefilter,
        HalfMatch, Input, MatchKind,
    };

    let pre = Prefilter::new(MatchKind::LeftmostFirst, &["ab", "c"])
        .expect("prefilter");
    let dfa = DFA::builder()
        .configure(
            DFA::config().prefilter(Some(pre)).starts_for_each_pattern(true),
        )
        .build(r"(?:ab|c)*c")
        .unwrap();
    let expected = Ok(Some(HalfMatch::must(0, 1)));
    let input = Input::new("cabac");

    assert_eq!(expected, dfa.try_search_fwd(&input));
    assert_eq!(expected, dfa.to_sparse().unwrap().try_search_fwd(&input));
}

```
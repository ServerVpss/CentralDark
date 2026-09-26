# COMANDO - nom.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\_topic\nom.rs
**SHA:** 1f446972d1329cb4
**Timestamp:** 2026-08-28T02:37:38.363753
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- //! let start = i.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
//! # For `nom` users
//!
//! ## Migrating from `nom`
//!
//! For comparisons with `nom`, see
//! - [Why `winnow`][super::why]
//! - [parse-rosetta-rs](https://github.com/rosetta-rs/parse-rosetta-rs/)
//!
//! What approach you take depends on the size and complexity of your parser.
//! For small, simple parsers, its likely easiest to directly port from `nom`.
//! When trying to look for the equivalent of a `nom` combinator, search in the docs for the name
//! of the `nom` combinator.  It is expected that, where names diverge, a doc alias exists.
//! See also the [List of combinators][crate::combinator].
//!
//! ### Complex migrations
//!
//! For larger parsers, it is likely best to take smaller steps
//! - Easier to debug when something goes wrong
//! - Deprecation messages will help assist through the process
//!
//! The workflow goes something like:
//! 1. Run `cargo rm nom && cargo add winnow@0.3`
//! 1. Ensure everything compiles and tests pass, ignoring deprecation messages (see [migration
//!    notes](https://github.com/winnow-rs/winnow/blob/main/CHANGELOG.md#nom-migration-guide))
//! 1. Commit
//! 1. Switch any `impl FnMut(I) -> IResult<I, O, E>` to `impl Parser<I, O, E>`
//! 1. Resolve deprecation messages
//! 1. Commit
//! 1. Run `cargo add winnow@0.4`
//! 1. Ensure everything compiles and tests pass, ignoring deprecation messages (see [changelog](https://github.com/winnow-rs/winnow/blob/main/CHANGELOG.md#040---2023-03-18) for more details)
//! 1. Commit
//! 1. Resolve deprecation messages
//! 1. Commit
//! 1. Run `cargo add winnow@0.5`
//! 1. Ensure everything compiles and tests pass, ignoring deprecation messages
//!    (see [migration notes](https://github.com/winnow-rs/winnow/blob/main/CHANGELOG.md#050---2023-07-13))
//! 1. Commit
//! 1. Resolve deprecation messages
//! 1. Commit
//!
//! ### Examples
//!
//! For example migrations, see
//! - [git-config-env](https://github.com/gitext-rs/git-config-env/pull/11) (nom to winnow 0.3)
//! - [git-conventional](https://github.com/crate-ci/git-conventional/pull/37) (nom to winnow 0.3,
//!   adds explicit tracing for easier debugging)
//! - [typos](https://github.com/crate-ci/typos/pull/664) (nom to winnow 0.3)
//! - [cargo-smart-release](https://github.com/Byron/gitoxide/pull/948) (gradual migration from nom
//!   to winnow 0.5)
//! - [gix-config](https://github.com/Byron/gitoxide/pull/951) (gradual migration from nom
//!   to winnow 0.5)
//! - [gix-protocol](https://github.com/Byron/gitoxide/pull/1009) (gradual migration from nom
//!   to winnow 0.5)
//! - [gitoxide](https://github.com/Byron/gitoxide/pull/956) (gradual migration from nom
//!   to winnow 0.5)
//!
//! ## Differences
//!
//! These are key differences to help Nom users adapt to writing parsers with Winnow.
//!
//! ### Renamed APIs
//!
//! Names have changed for consistency or clarity.
//!
//! To find a parser you are looking for,
//! - Search the docs for the `nom` parser
//! - See the [List of combinators][crate::combinator]
//!
//! ### GATs
//!
//! `nom` v8 back-propagates how you will use a parser to parser functions using a language feature
//! called GATs.
//! Winnow has made the conscious choice not to use this feature, finding alternative ways of
//! getting most of the benefits.
//!
//! Benefits of GATs:
//! - Performance as the compiler is able to instantiate copies of a parser that are
//!   better tailored to how it will be used, like discarding unused allocations for output or
//!   errors.
//!
//! Benefits of not using GATs:
//! - Predictable performance:
//!   With GATs, seemingly innocuous changes like choosing to hand write a parser using idiomatic function parsers
//!   (`fn(&mut I) -> Result<O>`) can cause surprising slow downs because these functions sever the back-propagation from GATs.
//!   The causes of these slowdowns could be hard to identify by inspection or profiling.
//! - No "eek out X% perf improvement" pressure to contort a parser
//!   that is more easily written imperatively
//!   to be written declaratively
//!   so it can preserve the back-propagation from GATs.
//! - Built-in parsers serve are can serve as examples to users of idiomatic function parsers
//!   (`fn(&mut I) -> Result<O>`).
//!   With GATs, built-in parsers tend to be complex implementations of traits.
//! - Faster build times and smaller binary size as parsers only need to be generated for one mode,
//!   not upto 8
//!
//! #### Partial/streaming parsers
//!
//! `nom` v8 back-propagates whether `Parser::parse_complete` was used to select `complete`
//! parsers.
//! Previously, users had ensure consistently using a parser from the `streaming` or `complete` module.
//!
//! Instead, you tag the input type (`I`) by wrapping it in [`Partial<I>`] and parsers will adjust
//! their behavior accordingly.
//! See [partial] special topic.
//!
//! #### Eliding Output
//!
//! `nom` v8 back-propagates whether an Output will be used and skips its creation.
//! For example, `value(Null, many0(_))` will 
```
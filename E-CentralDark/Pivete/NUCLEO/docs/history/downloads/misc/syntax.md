# OUTRO - syntax.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\util\syntax.rs
**SHA:** cff4712c95fc5f94
**Timestamp:** 2026-08-28T02:35:06.783796
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pub fn parse(pattern: &str) -> Result<Hir, Error> {
- pub fn parse_with(pattern: &str, config: &Config) -> Result<Hir, Error> {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Utilities for dealing with the syntax of a regular expression.

This module currently only exposes a [`Config`] type that
itself represents a wrapper around the configuration for a
[`regex-syntax::ParserBuilder`](regex_syntax::ParserBuilder). The purpose of
this wrapper is to make configuring syntax options very similar to how other
configuration is done throughout this crate. Namely, instead of duplicating
syntax options across every builder (of which there are many), we instead
create small config objects like this one that can be passed around and
composed.
*/

use alloc::{vec, vec::Vec};

use regex_syntax::{
    ast,
    hir::{self, Hir},
    Error, ParserBuilder,
};

/// A convenience routine for parsing a pattern into an HIR value with the
/// default configuration.
///
/// # Example
///
/// This shows how to parse a pattern into an HIR value:
///
/// ```
/// use regex_automata::util::syntax;
///
/// let hir = syntax::parse(r"([a-z]+)|([0-9]+)")?;
/// assert_eq!(Some(1), hir.properties().static_explicit_captures_len());
///
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
pub fn parse(pattern: &str) -> Result<Hir, Error> {
    parse_with(pattern, &Config::default())
}

/// A convenience routine for parsing many patterns into HIR value with the
/// default configuration.
///
/// # Example
///
/// This shows how to parse many patterns into an corresponding HIR values:
///
/// ```
/// use {
///     regex_automata::util::syntax,
///     regex_syntax::hir::Properties,
/// };
///
/// let hirs = syntax::parse_many(&[
///     r"([a-z]+)|([0-9]+)",
///     r"foo(A-Z]+)bar",
/// ])?;
/// let props = Properties::union(hirs.iter().map(|h| h.properties()));
/// assert_eq!(Some(1), props.static_explicit_captures_len());
///
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
pub fn parse_many<P: AsRef<str>>(patterns: &[P]) -> Result<Vec<Hir>, Error> {
    parse_many_with(patterns, &Config::default())
}

/// A convenience routine for parsing a pattern into an HIR value using a
/// `Config`.
///
/// # Example
///
/// This shows how to parse a pattern into an HIR value with a non-default
/// configuration:
///
/// ```
/// use regex_automata::util::syntax;
///
/// let hir = syntax::parse_with(
///     r"^[a-z]+$",
///     &syntax::Config::new().multi_line(true).crlf(true),
/// )?;
/// assert!(hir.properties().look_set().contains_anchor_crlf());
///
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
pub fn parse_with(pattern: &str, config: &Config) -> Result<Hir, Error> {
    let mut builder = ParserBuilder::new();
    config.apply(&mut builder);
    builder.build().parse(pattern)
}

/// A convenience routine for parsing many patterns into HIR values using a
/// `Config`.
///
/// # Example
///
/// This shows how to parse many patterns into an corresponding HIR values
/// with a non-default configuration:
///
/// ```
/// use {
///     regex_automata::util::syntax,
///     regex_syntax::hir::Properties,
/// };
///
/// let patterns = &[
///     r"([a-z]+)|([0-9]+)",
///     r"\W",
///     r"foo(A-Z]+)bar",
/// ];
/// let config = syntax::Config::new().unicode(false).utf8(false);
/// let hirs = syntax::parse_many_with(patterns, &config)?;
/// let props = Properties::union(hirs.iter().map(|h| h.properties()));
/// assert!(!props.is_utf8());
///
/// # Ok::<(), Box<dyn std::error::Error>>(())
/// ```
pub fn parse_many_with<P: AsRef<str>>(
    patterns: &[P],
    config: &Config,
) -> Result<Vec<Hir>, Error> {
    let mut builder = ParserBuilder::new();
    config.apply(&mut builder);
    let mut hirs = vec![];
    for p in patterns.iter() {
        hirs.push(builder.build().parse(p.as_ref())?);
    }
    Ok(hirs)
}

/// A common set of configuration options that apply to the syntax of a regex.
///
/// This represents a group of configuration options that specifically apply
/// to how the concrete syntax of a regular expression is interpreted. In
/// particular, they are generally forwarded to the
/// [`ParserBuilder`](https://docs.rs/regex-syntax/*/regex_syntax/struct.ParserBuilder.html)
/// in the
/// [`regex-syntax`](https://docs.rs/regex-syntax)
/// crate when building a regex from its concrete syntax directly.
///
/// These options are defined as a group since they apply to every regex engine
/// in this crate. Instead of re-defining them on every engine's builder, they
/// are instead provided here as one cohesive unit.
#[derive(Clone, Copy, Debug)]
pub struct Config {
    case_insensitive: bool,
    multi_line: bool,
    dot_matches_new_line: bool,
    crlf: bool,
    line_terminator: u8,
    swap_greed: bool,
    ignore_whitespace: bool,
    unicode: bool,
    utf8: bool,
    nest_limit: u32,
    octal: bool,
}

impl Config {
    /// Return a new default syntax configuration.
    pub fn new() -> Config {
        // These defaults match the ones used in regex-syntax.
        Config {
            case_insensitive: false,
            multi_line: false,
            dot_matches_new_line: false,
            c
```
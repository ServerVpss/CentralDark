# COMANDO - literal.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-syntax-0.8.11\src\hir\literal.rs
**SHA:** 61e9f54103c67169
**Timestamp:** 2026-08-28T02:35:08.150988
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- fn parse(pattern: &str) -> Hir {
- fn prefixes(pattern: &str) -> Seq {
- fn suffixes(pattern: &str) -> Seq {
- fn e(pattern: &str) -> (Seq, Seq) {
- fn prefixes(pattern: &str) -> Seq {
- fn suffixes(pattern: &str) -> Seq {
- fn e(pattern: &str) -> (Seq, Seq) {

### Gaps
- // TODO: This is a good candidate of a seq of literals that could be

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Provides literal extraction from `Hir` expressions.

An [`Extractor`] pulls literals out of [`Hir`] expressions and returns a
[`Seq`] of [`Literal`]s.

The purpose of literal extraction is generally to provide avenues for
optimizing regex searches. The main idea is that substring searches can be an
order of magnitude faster than a regex search. Therefore, if one can execute
a substring search to find candidate match locations and only run the regex
search at those locations, then it is possible for huge improvements in
performance to be realized.

With that said, literal optimizations are generally a black art because even
though substring search is generally faster, if the number of candidates
produced is high, then it can create a lot of overhead by ping-ponging between
the substring search and the regex search.

Here are some heuristics that might be used to help increase the chances of
effective literal optimizations:

* Stick to small [`Seq`]s. If you search for too many literals, it's likely
to lead to substring search that is only a little faster than a regex search,
and thus the overhead of using literal optimizations in the first place might
make things slower overall.
* The literals in your [`Seq`] shouldn't be too short. In general, longer is
better. A sequence corresponding to single bytes that occur frequently in the
haystack, for example, is probably a bad literal optimization because it's
likely to produce many false positive candidates. Longer literals are less
likely to match, and thus probably produce fewer false positives.
* If it's possible to estimate the approximate frequency of each byte according
to some pre-computed background distribution, it is possible to compute a score
of how "good" a `Seq` is. If a `Seq` isn't good enough, you might consider
skipping the literal optimization and just use the regex engine.

(It should be noted that there are always pathological cases that can make
any kind of literal optimization be a net slower result. This is why it
might be a good idea to be conservative, or to even provide a means for
literal optimizations to be dynamically disabled if they are determined to be
ineffective according to some measure.)

You're encouraged to explore the methods on [`Seq`], which permit shrinking
the size of sequences in a preference-order preserving fashion.

Finally, note that it isn't strictly necessary to use an [`Extractor`]. Namely,
an `Extractor` only uses public APIs of the [`Seq`] and [`Literal`] types,
so it is possible to implement your own extractor. For example, for n-grams
or "inner" literals (i.e., not prefix or suffix literals). The `Extractor`
is mostly responsible for the case analysis over `Hir` expressions. Much of
the "trickier" parts are how to combine literal sequences, and that is all
implemented on [`Seq`].
*/

use core::{cmp, mem, num::NonZeroUsize};

use alloc::{vec, vec::Vec};

use crate::hir::{self, Hir};

/// Extracts prefix or suffix literal sequences from [`Hir`] expressions.
///
/// Literal extraction is based on the following observations:
///
/// * Many regexes start with one or a small number of literals.
/// * Substring search for literals is often much faster (sometimes by an order
/// of magnitude) than a regex search.
///
/// Thus, in many cases, one can search for literals to find candidate starting
/// locations of a match, and then only run the full regex engine at each such
/// location instead of over the full haystack.
///
/// The main downside of literal extraction is that it can wind up causing a
/// search to be slower overall. For example, if there are many matches or if
/// there are many candidates that don't ultimately lead to a match, then a
/// lot of overhead will be spent in shuffling back-and-forth between substring
/// search and the regex engine. This is the fundamental reason why literal
/// optimizations for regex patterns is sometimes considered a "black art."
///
/// # Look-around assertions
///
/// Literal extraction treats all look-around assertions as-if they match every
/// empty string. So for example, the regex `\bquux\b` will yield a sequence
/// containing a single exact literal `quux`. However, not all occurrences
/// of `quux` correspond to a match a of the regex. For example, `\bquux\b`
/// does not match `ZquuxZ` anywhere because `quux` does not fall on a word
/// boundary.
///
/// In effect, if your regex contains look-around assertions, then a match of
/// an exact literal does not necessarily mean the regex overall matches. So
/// you may still need to run the regex engine in such cases to confirm the
/// match.
///
/// The precise guarantee you get from a literal sequence is: if every literal
/// in the sequence is exact and the original regex contains zero look-around
/// assertions, then a preference-order multi-substring search of those
/// literals will precisely match a preference-order search of the original
/// regex.
///
/// # Example
///
/// This shows how to extract pr
```
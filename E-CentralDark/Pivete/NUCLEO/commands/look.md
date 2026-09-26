# COMANDO - look.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\src\util\look.rs
**SHA:** 49026d8bcb6f9229
**Timestamp:** 2026-08-28T02:35:06.672362
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Start = 1 << 0,
- Look::Start => Look::End,
- Look::Start => 'A',
- Look::Start => self.is_start(haystack, at),

### Contratos
- WordAsciiNegate = 1 << 7,
- WordUnicodeNegate = 1 << 9,
- Look::WordAsciiNegate => Look::WordAsciiNegate,
- Look::WordUnicodeNegate => Look::WordUnicodeNegate,
- Look::WordAsciiNegate => 'B',
- Look::WordUnicodeNegate => '𝚩',
- Look::WordAsciiNegate => self.is_word_ascii_negate(haystack, at),
- Look::WordUnicodeNegate => {

### Ouro Bruto (primeiros 5000 chars)
```
/*!
Types and routines for working with look-around assertions.

This module principally defines two types:

* [`Look`] enumerates all of the assertions supported by this crate.
* [`LookSet`] provides a way to efficiently store a set of [`Look`] values.
* [`LookMatcher`] provides routines for checking whether a `Look` or a
`LookSet` matches at a particular position in a haystack.
*/

// LAMENTATION: Sadly, a lot of the API of `Look` and `LookSet` were basically
// copied verbatim from the regex-syntax crate. I would have no problems using
// the regex-syntax types and defining the matching routines (only found
// in this crate) as free functions, except the `Look` and `LookSet` types
// are used in lots of places. Including in places we expect to work when
// regex-syntax is *not* enabled, such as in the definition of the NFA itself.
//
// Thankfully the code we copy is pretty simple and there isn't much of it.
// Otherwise, the rest of this module deals with *matching* the assertions,
// which is not something that regex-syntax handles.

use crate::util::{escape::DebugByte, utf8};

/// A look-around assertion.
///
/// An assertion matches at a position between characters in a haystack.
/// Namely, it does not actually "consume" any input as most parts of a regular
/// expression do. Assertions are a way of stating that some property must be
/// true at a particular point during matching.
///
/// For example, `(?m)^[a-z]+$` is a pattern that:
///
/// * Scans the haystack for a position at which `(?m:^)` is satisfied. That
/// occurs at either the beginning of the haystack, or immediately following
/// a `\n` character.
/// * Looks for one or more occurrences of `[a-z]`.
/// * Once `[a-z]+` has matched as much as it can, an overall match is only
/// reported when `[a-z]+` stops just before a `\n`.
///
/// So in this case, `abc` and `\nabc\n` match, but `\nabc1\n` does not.
///
/// Assertions are also called "look-around," "look-behind" and "look-ahead."
/// Specifically, some assertions are look-behind (like `^`), other assertions
/// are look-ahead (like `$`) and yet other assertions are both look-ahead and
/// look-behind (like `\b`).
///
/// # Assertions in an NFA
///
/// An assertion in a [`thompson::NFA`](crate::nfa::thompson::NFA) can be
/// thought of as a conditional epsilon transition. That is, a matching engine
/// like the [`PikeVM`](crate::nfa::thompson::pikevm::PikeVM) only permits
/// moving through conditional epsilon transitions when their condition
/// is satisfied at whatever position the `PikeVM` is currently at in the
/// haystack.
///
/// How assertions are handled in a `DFA` is trickier, since a DFA does not
/// have epsilon transitions at all. In this case, they are compiled into the
/// automaton itself, at the expense of more states than what would be required
/// without an assertion.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Look {
    /// Match the beginning of text. Specifically, this matches at the starting
    /// position of the input.
    Start = 1 << 0,
    /// Match the end of text. Specifically, this matches at the ending
    /// position of the input.
    End = 1 << 1,
    /// Match the beginning of a line or the beginning of text. Specifically,
    /// this matches at the starting position of the input, or at the position
    /// immediately following a `\n` character.
    StartLF = 1 << 2,
    /// Match the end of a line or the end of text. Specifically, this matches
    /// at the end position of the input, or at the position immediately
    /// preceding a `\n` character.
    EndLF = 1 << 3,
    /// Match the beginning of a line or the beginning of text. Specifically,
    /// this matches at the starting position of the input, or at the position
    /// immediately following either a `\r` or `\n` character, but never after
    /// a `\r` when a `\n` follows.
    StartCRLF = 1 << 4,
    /// Match the end of a line or the end of text. Specifically, this matches
    /// at the end position of the input, or at the position immediately
    /// preceding a `\r` or `\n` character, but never before a `\n` when a `\r`
    /// precedes it.
    EndCRLF = 1 << 5,
    /// Match an ASCII-only word boundary. That is, this matches a position
    /// where the left adjacent character and right adjacent character
    /// correspond to a word and non-word or a non-word and word character.
    WordAscii = 1 << 6,
    /// Match an ASCII-only negation of a word boundary.
    WordAsciiNegate = 1 << 7,
    /// Match a Unicode-aware word boundary. That is, this matches a position
    /// where the left adjacent character and right adjacent character
    /// correspond to a word and non-word or a non-word and word character.
    WordUnicode = 1 << 8,
    /// Match a Unicode-aware negation of a word boundary.
    WordUnicodeNegate = 1 << 9,
    /// Match the start of an ASCII-only word boundary. That is, this matches a
    /// position at either the beginning of the haystack or wher
```
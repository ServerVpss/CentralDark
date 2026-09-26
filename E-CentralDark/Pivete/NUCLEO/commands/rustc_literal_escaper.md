# COMANDO - rustc_literal_escaper.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\proc-macro2-1.0.107\src\rustc_literal_escaper.rs
**SHA:** fb3f2f93a09b84f5
**Timestamp:** 2026-08-28T02:35:00.326325
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = src.len() - chars.as_str().len() - c.len_utf8();
- let start = src.len() - chars.as_str().len() - c.len_utf8();
- start: usize,

### Ouro Bruto (primeiros 5000 chars)
```
// Vendored from rustc-literal-escaper v0.0.5
// https://github.com/rust-lang/literal-escaper/tree/v0.0.5

//! Utilities for validating (raw) string, char, and byte literals and
//! turning escape sequences into the values they represent.

use crate::num::NonZeroChar;
use core::ffi::CStr;
use core::num::NonZeroU8;
use core::ops::Range;
use core::str::Chars;

/// Errors and warnings that can occur during string, char, and byte unescaping.
///
/// Mostly relating to malformed escape sequences, but also a few other problems.
#[derive(Debug, PartialEq, Eq)]
pub enum EscapeError {
    /// Expected 1 char, but 0 were found.
    ZeroChars,
    /// Expected 1 char, but more than 1 were found.
    MoreThanOneChar,

    /// Escaped '\' character without continuation.
    LoneSlash,
    /// Invalid escape character (e.g. '\z').
    InvalidEscape,
    /// Raw '\r' encountered.
    BareCarriageReturn,
    /// Raw '\r' encountered in raw string.
    BareCarriageReturnInRawString,
    /// Unescaped character that was expected to be escaped (e.g. raw '\t').
    EscapeOnlyChar,

    /// Numeric character escape is too short (e.g. '\x1').
    TooShortHexEscape,
    /// Invalid character in numeric escape (e.g. '\xz')
    InvalidCharInHexEscape,
    /// Character code in numeric escape is non-ascii (e.g. '\xFF').
    OutOfRangeHexEscape,

    /// '\u' not followed by '{'.
    NoBraceInUnicodeEscape,
    /// Non-hexadecimal value in '\u{..}'.
    InvalidCharInUnicodeEscape,
    /// '\u{}'
    EmptyUnicodeEscape,
    /// No closing brace in '\u{..}', e.g. '\u{12'.
    UnclosedUnicodeEscape,
    /// '\u{_12}'
    LeadingUnderscoreUnicodeEscape,
    /// More than 6 characters in '\u{..}', e.g. '\u{10FFFF_FF}'
    OverlongUnicodeEscape,
    /// Invalid in-bound unicode character code, e.g. '\u{DFFF}'.
    LoneSurrogateUnicodeEscape,
    /// Out of bounds unicode character code, e.g. '\u{FFFFFF}'.
    OutOfRangeUnicodeEscape,

    /// Unicode escape code in byte literal.
    UnicodeEscapeInByte,
    /// Non-ascii character in byte literal, byte string literal, or raw byte string literal.
    NonAsciiCharInByte,

    /// `\0` in a C string literal.
    NulInCStr,

    /// After a line ending with '\', the next line contains whitespace
    /// characters that are not skipped.
    UnskippedWhitespaceWarning,

    /// After a line ending with '\', multiple lines are skipped.
    MultipleSkippedLinesWarning,
}

impl EscapeError {
    /// Returns true for actual errors, as opposed to warnings.
    pub fn is_fatal(&self) -> bool {
        !matches!(
            self,
            EscapeError::UnskippedWhitespaceWarning | EscapeError::MultipleSkippedLinesWarning
        )
    }
}

/// Check a raw string literal for validity
///
/// Takes the contents of a raw string literal (without quotes)
/// and produces a sequence of characters or errors,
/// which are returned by invoking `callback`.
/// NOTE: Does no escaping, but produces errors for bare carriage return ('\r').
pub fn check_raw_str(src: &str, callback: impl FnMut(Range<usize>, Result<char, EscapeError>)) {
    str::check_raw(src, callback);
}

/// Check a raw byte string literal for validity
///
/// Takes the contents of a raw byte string literal (without quotes)
/// and produces a sequence of bytes or errors,
/// which are returned by invoking `callback`.
/// NOTE: Does no escaping, but produces errors for bare carriage return ('\r').
pub fn check_raw_byte_str(src: &str, callback: impl FnMut(Range<usize>, Result<u8, EscapeError>)) {
    <[u8]>::check_raw(src, callback);
}

/// Check a raw C string literal for validity
///
/// Takes the contents of a raw C string literal (without quotes)
/// and produces a sequence of characters or errors,
/// which are returned by invoking `callback`.
/// NOTE: Does no escaping, but produces errors for bare carriage return ('\r').
pub fn check_raw_c_str(
    src: &str,
    callback: impl FnMut(Range<usize>, Result<NonZeroChar, EscapeError>),
) {
    CStr::check_raw(src, callback);
}

/// Trait for checking raw string literals for validity
trait CheckRaw {
    /// Unit type of the implementing string type (`char` for string, `u8` for byte string)
    type RawUnit;

    /// Converts chars to the unit type of the literal type
    fn char2raw_unit(c: char) -> Result<Self::RawUnit, EscapeError>;

    /// Takes the contents of a raw literal (without quotes)
    /// and produces a sequence of `Result<Self::RawUnit, EscapeError>`
    /// which are returned via `callback`.
    ///
    /// NOTE: Does no escaping, but produces errors for bare carriage return ('\r').
    fn check_raw(
        src: &str,
        mut callback: impl FnMut(Range<usize>, Result<Self::RawUnit, EscapeError>),
    ) {
        let mut chars = src.chars();
        while let Some(c) = chars.next() {
            let start = src.len() - chars.as_str().len() - c.len_utf8();
            let res = match c {
                '\r' => Err(EscapeError::BareCarriageReturnInRawString),
              
```
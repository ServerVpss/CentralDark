# COMANDO - ascii_reader.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\plist-1.10.0\src\stream\ascii_reader.rs
**SHA:** 96418459b2751c81
**Timestamp:** 2026-08-28T02:34:58.039142
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: This should return `Err` after the first string

### Ouro Bruto (primeiros 5000 chars)
```
/// Ascii property lists are used in legacy settings and only support four
/// datatypes: Array, Dictionary, String and Data.
/// See [Apple
/// Documentation](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/PropertyLists/OldStylePlists/OldStylePLists.html)
/// for more info.
/// However this reader also support Integers as first class datatype.
/// This reader will accept certain ill-formed ascii plist without complaining.
/// It does not check the integrity of the plist format.
use crate::{
    error::{Error, ErrorKind},
    stream::{Event, OwnedEvent},
    Integer,
};
use std::io::Read;

pub struct AsciiReader<R: Read> {
    reader: R,
    current_pos: u64,

    /// lookahead char to avoid backtracking.
    peeked_char: Option<u8>,

    current_char: Option<u8>,
}

impl<R: Read> AsciiReader<R> {
    pub fn new(reader: R) -> Self {
        Self {
            reader,
            current_pos: 0,
            peeked_char: None,
            current_char: None,
        }
    }

    pub fn into_inner(self) -> R {
        self.reader
    }

    fn error(&self, kind: ErrorKind) -> Error {
        kind.with_byte_offset(self.current_pos)
    }

    fn read_one(&mut self) -> Result<Option<u8>, Error> {
        let mut buf: [u8; 1] = [0; 1];
        match self.reader.read_exact(&mut buf) {
            Ok(()) => Ok(Some(buf[0])),
            Err(err) if err.kind() == std::io::ErrorKind::UnexpectedEof => Ok(None),
            Err(err) => Err(self.error(ErrorKind::Io(err))),
        }
    }

    /// Consume the reader and set [`Self::current_char`] and
    /// [`Self::peeked_char`]. Returns the current character.
    fn advance(&mut self) -> Result<Option<u8>, Error> {
        self.current_char = self.peeked_char;
        self.peeked_char = self.read_one()?;

        // We need to read two chars to boot the process and fill the peeked
        // char.
        if self.current_pos == 0 {
            self.current_char = self.peeked_char;
            self.peeked_char = self.read_one()?;
        }

        if self.current_char.is_some() {
            self.current_pos += 1;
        }

        Ok(self.current_char)
    }

    /// From Apple doc:
    ///
    /// > The quotation marks can be omitted if the string is composed strictly of alphanumeric
    /// > characters and contains no white space (numbers are handled as
    /// > strings in property lists). Though the property list format uses
    /// > ASCII for strings, note that Cocoa uses Unicode. Since string
    /// > encodings vary from region to region, this representation makes the
    /// > format fragile. You may see strings containing unreadable sequences of
    /// > ASCII characters; these are used to represent Unicode characters
    ///
    /// This function will naively try to convert the string to Integer.
    fn unquoted_string_literal(&mut self, first: u8) -> Result<Option<OwnedEvent>, Error> {
        let mut acc: Vec<u8> = Vec::new();
        acc.push(first);

        while {
            match self.peeked_char {
                Some(c) => {
                    c != b' ' && c != b')' && c != b'\r' && c != b'\t' && c != b';' && c != b','
                }
                None => false,
            }
        } {
            // consuming the string itself
            self.advance()?;
            match self.current_char {
                Some(c) => acc.push(c),
                None => return Err(self.error(ErrorKind::UnclosedString)),
            }
        }

        let string_literal =
            String::from_utf8(acc).map_err(|_e| self.error(ErrorKind::InvalidUtf8AsciiStream))?;

        // Not ideal but does the trick for now
        match Integer::from_str(&string_literal) {
            Ok(i) => Ok(Some(Event::Integer(i))),
            Err(_) => Ok(Some(Event::String(string_literal.into()))),
        }
    }

    /// The process for decoding utf-16 escapes to utf-8 is:
    /// 1. Convert the 4 hex characters to utf-16 code units (u16s).
    ///    '\u006d' becomes 0x6d.
    /// 2. Based on the first code unit, determine whether another code unit is
    ///    required to form the complete code point.
    ///    "\uD83D\uDCA9" becomes `[0xd73d, 0xdca9]`
    /// 3. Convert the 1 or 2 u16 code point to utf-8.
    ///    `[0xd73d, 0xdca9]` becomes '💩'.
    ///
    /// The standard library has some useful functions behind unstable feature
    /// flags, we can simplify and optimize this a bit once they're stable.
    /// - `str_from_utf16_endian`
    /// - `is_utf16_surrogate`
    fn utf16_escape(&mut self) -> Result<String, Error> {
        let mut code_units: &mut [u16] = &mut [0u16; 2];

        let Some(code_unit) = self.utf16_code_unit()? else {
            return Err(self.error(ErrorKind::InvalidUtf16String));
        };

        code_units[0] = code_unit;

        // This is the utf-16 surrogate range, indicating another code unit is
        // necessary to form a complete code point.
        if matches!(code_unit, 0xD800..=0xDF
```
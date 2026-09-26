# OUTRO - scalar.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml_parser-1.1.3+spec-1.1.0\src\decoder\scalar.rs
**SHA:** 95ee5f7b3d809efa
**Timestamp:** 2026-08-28T02:36:26.768348
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = value.offset_from(&raw.as_str());
- let start = value.offset_from(&raw.as_str());
- let start = value.offset_from(&raw.as_str());
- let start = value.offset_from(&raw.as_str());
- let start = value.offset_from(&raw.as_str());
- let start = value.offset_from(&raw.as_str());
- let start = value.offset_from(&raw.as_str());
- let start = *value;
- let start = start.offset_from(&raw.as_str());
- let start = start.offset_from(&raw.as_str());

### Ouro Bruto (primeiros 5000 chars)
```
use winnow::stream::ContainsToken as _;
use winnow::stream::FindSlice as _;
use winnow::stream::Offset as _;
use winnow::stream::Stream as _;

use crate::ErrorSink;
use crate::Expected;
use crate::ParseError;
use crate::Raw;
use crate::Span;
use crate::decoder::StringBuilder;

const ALLOCATION_ERROR: &str = "could not allocate for string";

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub enum ScalarKind {
    String,
    Boolean(bool),
    DateTime,
    Float,
    Integer(IntegerRadix),
}

impl ScalarKind {
    pub fn description(&self) -> &'static str {
        match self {
            Self::String => "string",
            Self::Boolean(_) => "boolean",
            Self::DateTime => "date-time",
            Self::Float => "float",
            Self::Integer(radix) => radix.description(),
        }
    }

    pub fn invalid_description(&self) -> &'static str {
        match self {
            Self::String => "invalid string",
            Self::Boolean(_) => "invalid boolean",
            Self::DateTime => "invalid date-time",
            Self::Float => "invalid float",
            Self::Integer(radix) => radix.invalid_description(),
        }
    }
}

#[derive(Copy, Clone, Default, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub enum IntegerRadix {
    #[default]
    Dec,
    Hex,
    Oct,
    Bin,
}

impl IntegerRadix {
    pub fn description(&self) -> &'static str {
        match self {
            Self::Dec => "integer",
            Self::Hex => "hexadecimal",
            Self::Oct => "octal",
            Self::Bin => "binary",
        }
    }

    pub fn value(&self) -> u32 {
        match self {
            Self::Dec => 10,
            Self::Hex => 16,
            Self::Oct => 8,
            Self::Bin => 2,
        }
    }

    pub fn invalid_description(&self) -> &'static str {
        match self {
            Self::Dec => "invalid integer number",
            Self::Hex => "invalid hexadecimal number",
            Self::Oct => "invalid octal number",
            Self::Bin => "invalid binary number",
        }
    }

    fn validator(&self) -> fn(char) -> bool {
        match self {
            Self::Dec => |c| c.is_ascii_digit(),
            Self::Hex => |c| c.is_ascii_hexdigit(),
            Self::Oct => |c| matches!(c, '0'..='7'),
            Self::Bin => |c| matches!(c, '0'..='1'),
        }
    }
}

pub(crate) fn decode_unquoted_scalar<'i>(
    raw: Raw<'i>,
    output: &mut dyn StringBuilder<'i>,
    error: &mut dyn ErrorSink,
) -> ScalarKind {
    let s = raw.as_str();
    let Some(first) = s.as_bytes().first() else {
        return decode_invalid(raw, output, error);
    };
    if !first.is_ascii_digit() && s.contains(" ") {
        // Only datetimes can have a space
        return decode_invalid(raw, output, error);
    }
    match first {
        // number starts
        b'+' | b'-' => {
            let value = &raw.as_str()[1..];
            decode_sign_prefix(raw, value, output, error)
        }
        // Report as if they were numbers because its most likely a typo
        b'_' => decode_datetime_or_float_or_integer(raw.as_str(), raw, output, error),
        // Date/number starts
        b'0' => decode_zero_prefix(raw.as_str(), false, raw, output, error),
        b'1'..=b'9' => decode_datetime_or_float_or_integer(raw.as_str(), raw, output, error),
        // Report as if they were numbers because its most likely a typo
        b'.' => {
            let kind = ScalarKind::Float;
            let stream = raw.as_str();
            if ensure_float(stream, raw, error) {
                decode_float_or_integer(stream, raw, kind, output, error)
            } else {
                kind
            }
        }
        b't' | b'T' => {
            const SYMBOL: &str = "true";
            let kind = ScalarKind::Boolean(true);
            let expected = &[Expected::Literal(SYMBOL)];
            decode_symbol(raw, SYMBOL, kind, expected, output, error)
        }
        b'f' | b'F' => {
            const SYMBOL: &str = "false";
            let kind = ScalarKind::Boolean(false);
            let expected = &[Expected::Literal(SYMBOL)];
            decode_symbol(raw, SYMBOL, kind, expected, output, error)
        }
        b'i' | b'I' => {
            const SYMBOL: &str = "inf";
            let kind = ScalarKind::Float;
            let expected = &[Expected::Literal(SYMBOL)];
            decode_symbol(raw, SYMBOL, kind, expected, output, error)
        }
        b'n' | b'N' => {
            const SYMBOL: &str = "nan";
            let kind = ScalarKind::Float;
            let expected = &[Expected::Literal(SYMBOL)];
            decode_symbol(raw, SYMBOL, kind, expected, output, error)
        }
        _ => decode_invalid(raw, output, error),
    }
}

fn decode_sign_prefix<'i>(
    raw: Raw<'i>,
    value: &'i str,
    output: &mut dyn StringBuilder<'i>,
    error: &mut dyn ErrorSink,
) -> ScalarKind {
    let mut value = value;
    let first = loop {
        let Some(first) = va
```
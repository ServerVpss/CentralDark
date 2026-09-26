# OUTRO - runtime.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties-2.2.0\src\runtime.rs
**SHA:** 98270bed158c76df
**Timestamp:** 2026-08-28T02:34:23.557612
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- IdCompatMathStart = 66,
- IdStart = 16,
- XidStart = 33,
- IdStart::NAME | IdStart::SHORT_NAME => Self::new::<IdStart>(),
- XidStart::NAME | XidStart::SHORT_NAME => Self::new::<XidStart>(),
- IdStart::NAME | IdStart::SHORT_NAME => Self::try_new_unstable::<IdStart>(provider),
- XidStart::NAME | XidStart::SHORT_NAME => Self::try_new_unstable::<XidStart>(provider),

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

//! 🚧 \[Unstable\] This module is unstable and currently crate-private. Let us know if you
//! have a use case for this!
//!
//! This module contains utilities for working with properties where the specific property in use
//! is not known at compile time.
//!
//! For regex engines, [`crate::sets::load_for_ecma262_unstable()`] is a convenient API for working
//! with properties at runtime tailored for the use case of ECMA262-compatible regex engines.

use crate::provider::*;
use crate::CodePointSetData;
#[cfg(doc)]
use crate::{
    props::{GeneralCategory, GeneralCategoryGroup, Script},
    script, CodePointMapData, PropertyParser,
};
use icu_provider::prelude::*;

/// This type can represent any binary Unicode property.
///
/// This is intended to be used in situations where the exact unicode property needed is
/// only known at runtime, for example in regex engines.
///
/// The values are intended to be identical to ICU4C's `UProperty` enum
#[non_exhaustive]
#[allow(missing_docs)]
#[allow(dead_code)]
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
enum BinaryProperty {
    Alnum = 44,
    Alphabetic = 0,
    AsciiHexDigit = 1,
    BidiControl = 2,
    BidiMirrored = 3,
    Blank = 45,
    Cased = 49,
    CaseIgnorable = 50,
    CaseSensitive = 34,
    ChangesWhenCasefolded = 54,
    ChangesWhenCasemapped = 55,
    ChangesWhenLowercased = 51,
    ChangesWhenNfkcCasefolded = 56,
    ChangesWhenTitlecased = 53,
    ChangesWhenUppercased = 52,
    Dash = 4,
    DefaultIgnorableCodePoint = 5,
    Deprecated = 6,
    Diacritic = 7,
    Emoji = 57,
    EmojiComponent = 61,
    EmojiModifier = 59,
    EmojiModifierBase = 60,
    EmojiPresentation = 58,
    ExtendedPictographic = 64,
    Extender = 8,
    FullCompositionExclusion = 9,
    Graph = 46,
    GraphemeBase = 10,
    GraphemeExtend = 11,
    GraphemeLink = 12,
    HexDigit = 13,
    Hyphen = 14,
    IdCompatMathContinue = 65,
    IdCompatMathStart = 66,
    IdContinue = 15,
    Ideographic = 17,
    IdsBinaryOperator = 18,
    IdStart = 16,
    IdsTrinaryOperator = 19,
    IdsUnaryOperator = 67,
    JoinControl = 20,
    LogicalOrderException = 21,
    Lowercase = 22,
    Math = 23,
    ModifierCombiningMark = 68,
    NfcInert = 39,
    NfdInert = 37,
    NfkcInert = 40,
    NfkdInert = 38,
    NoncharacterCodePoint = 24,
    PatternSyntax = 42,
    PatternWhiteSpace = 43,
    PrependedConcatenationMark = 63,
    Print = 47,
    QuotationMark = 25,
    Radical = 26,
    RegionalIndicator = 62,
    SegmentStarter = 41,
    SentenceTerminal = 35,
    SoftDotted = 27,
    TerminalPunctuation = 28,
    UnifiedIdeograph = 29,
    Uppercase = 30,
    VariationSelector = 36,
    WhiteSpace = 31,
    Xdigit = 48,
    XidContinue = 32,
    XidStart = 33,
}

/// This type can represent any binary property over strings.
///
/// This is intended to be used in situations where the exact unicode property needed is
/// only known at runtime, for example in regex engines.
///
/// The values are intended to be identical to ICU4C's `UProperty` enum
#[non_exhaustive]
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
#[allow(dead_code)]
#[allow(missing_docs)]
enum StringBinaryProperty {
    BasicEmoji = 65,
    EmojiKeycapSequence = 66,
    RgiEmoji = 71,
    RgiEmojiFlagSequence = 68,
    RgiEmojiModifierSequence = 67,
    RgiEmojiTagSequence = 69,
    RgiEmojiZWJSequence = 70,
}

/// This type can represent any enumerated Unicode property.
///
/// This is intended to be used in situations where the exact unicode property needed is
/// only known at runtime, for example in regex engines.
///
/// The values are intended to be identical to ICU4C's `UProperty` enum
#[non_exhaustive]
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
#[allow(dead_code)]
#[allow(missing_docs)]
enum EnumeratedProperty {
    BidiClass = 0x1000,
    BidiPairedBracketType = 0x1015,
    Block = 0x1001,
    CombiningClass = 0x1002,
    DecompositionType = 0x1003,
    EastAsianWidth = 0x1004,
    GeneralCategory = 0x1005,
    GraphemeClusterBreak = 0x1012,
    HangulSyllableType = 0x100B,
    IndicConjunctBreak = 0x101A,
    IndicPositionalCategory = 0x1016,
    IndicSyllabicCategory = 0x1017,
    JoiningGroup = 0x1006,
    JoiningType = 0x1007,
    LeadCanonicalCombiningClass = 0x1010,
    LineBreak = 0x1008,
    NFCQuickCheck = 0x100E,
    NFDQuickCheck = 0x100C,
    NFKCQuickCheck = 0x100F,
    NFKDQuickCheck = 0x100D,
    NumericType = 0x1009,
    Script = 0x100A,
    SentenceBreak = 0x1013,
    TrailCanonicalCombiningClass = 0x1011,
    VerticalOrientation = 0x1018,
    WordBreak = 0x1014,
}

/// This type can represent any Unicode mask property.
///
/// This is intended to be used in situations where the exact unicode property needed is
/// o
```
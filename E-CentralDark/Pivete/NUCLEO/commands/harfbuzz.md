# COMANDO - harfbuzz.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties-2.2.0\src\harfbuzz.rs
**SHA:** 3b5fbc76b3175ca1
**Timestamp:** 2026-08-28T02:34:23.401048
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Surrogate => harfbuzz_traits::GeneralCategory::Surrogate,

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use crate::props::{BidiMirroringGlyph, GeneralCategory, Script};
use crate::provider::{PropertyEnumScriptV1, PropertyNameShortScriptV1};
use crate::{
    CodePointMapData, CodePointMapDataBorrowed, PropertyNamesShort, PropertyNamesShortBorrowed,
};
use icu_provider::prelude::*;

use harfbuzz_traits::{GeneralCategoryFunc, MirroringFunc, ScriptFunc};

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl GeneralCategoryFunc for CodePointMapDataBorrowed<'_, GeneralCategory> {
    fn general_category(&self, ch: char) -> harfbuzz_traits::GeneralCategory {
        self.get(ch).into()
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl GeneralCategoryFunc for CodePointMapData<GeneralCategory> {
    fn general_category(&self, ch: char) -> harfbuzz_traits::GeneralCategory {
        GeneralCategoryFunc::general_category(&self.as_borrowed(), ch)
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl GeneralCategoryFunc for &'_ CodePointMapData<GeneralCategory> {
    fn general_category(&self, ch: char) -> harfbuzz_traits::GeneralCategory {
        GeneralCategoryFunc::general_category(&self.as_borrowed(), ch)
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl MirroringFunc for CodePointMapDataBorrowed<'_, BidiMirroringGlyph> {
    fn mirroring(&self, ch: char) -> char {
        self.get(ch).mirroring_glyph.unwrap_or(ch)
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl MirroringFunc for CodePointMapData<BidiMirroringGlyph> {
    fn mirroring(&self, ch: char) -> char {
        MirroringFunc::mirroring(&self.as_borrowed(), ch)
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl MirroringFunc for &'_ CodePointMapData<BidiMirroringGlyph> {
    fn mirroring(&self, ch: char) -> char {
        MirroringFunc::mirroring(&self.as_borrowed(), ch)
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl ScriptFunc for HarfbuzzScriptDataBorrowed<'_> {
    fn script(&self, ch: char) -> [u8; 4] {
        let script = self.script.get(ch);
        self.script_names
            .get_locale_script(script)
            .unwrap_or(icu_locale_core::subtags::script!("Zzzz"))
            .into_raw()
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl ScriptFunc for HarfbuzzScriptData {
    fn script(&self, ch: char) -> [u8; 4] {
        ScriptFunc::script(&self.as_borrowed(), ch)
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl ScriptFunc for &'_ HarfbuzzScriptData {
    fn script(&self, ch: char) -> [u8; 4] {
        ScriptFunc::script(&self.as_borrowed(), ch)
    }
}

/// ✨ *Enabled with the `harfbuzz_traits` Cargo feature.*
impl From<GeneralCategory> for harfbuzz_traits::GeneralCategory {
    fn from(val: GeneralCategory) -> Self {
        use GeneralCategory::*;
        match val {
            Unassigned => harfbuzz_traits::GeneralCategory::Unassigned,
            UppercaseLetter => harfbuzz_traits::GeneralCategory::UppercaseLetter,
            LowercaseLetter => harfbuzz_traits::GeneralCategory::LowercaseLetter,
            TitlecaseLetter => harfbuzz_traits::GeneralCategory::TitlecaseLetter,
            ModifierLetter => harfbuzz_traits::GeneralCategory::ModifierLetter,
            OtherLetter => harfbuzz_traits::GeneralCategory::OtherLetter,
            NonspacingMark => harfbuzz_traits::GeneralCategory::NonSpacingMark,
            SpacingMark => harfbuzz_traits::GeneralCategory::SpacingMark,
            EnclosingMark => harfbuzz_traits::GeneralCategory::EnclosingMark,
            DecimalNumber => harfbuzz_traits::GeneralCategory::DecimalNumber,
            LetterNumber => harfbuzz_traits::GeneralCategory::LetterNumber,
            OtherNumber => harfbuzz_traits::GeneralCategory::OtherNumber,
            SpaceSeparator => harfbuzz_traits::GeneralCategory::SpaceSeparator,
            LineSeparator => harfbuzz_traits::GeneralCategory::LineSeparator,
            ParagraphSeparator => harfbuzz_traits::GeneralCategory::ParagraphSeparator,
            Control => harfbuzz_traits::GeneralCategory::Control,
            Format => harfbuzz_traits::GeneralCategory::Format,
            PrivateUse => harfbuzz_traits::GeneralCategory::PrivateUse,
            Surrogate => harfbuzz_traits::GeneralCategory::Surrogate,
            DashPunctuation => harfbuzz_traits::GeneralCategory::DashPunctuation,
            OpenPunctuation => harfbuzz_traits::GeneralCategory::OpenPunctuation,
            ClosePunctuation => harfbuzz_traits::GeneralCategory::ClosePunctuation,
            ConnectorPunctuation => harfbuzz_traits::GeneralCategory::ConnectPunctuation,
            InitialPunctuation => harfbuzz_traits::GeneralCategory::InitialPunctuation,
            FinalPunctuation => harfbuzz_traits::Genera
```
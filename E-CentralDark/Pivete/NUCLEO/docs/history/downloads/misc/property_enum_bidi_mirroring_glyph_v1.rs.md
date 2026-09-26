# OUTRO - property_enum_bidi_mirroring_glyph_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties_data-2.2.0\data\property_enum_bidi_mirroring_glyph_v1.rs.data
**SHA:** 983d9f44e4ff3add
**Timestamp:** 2026-08-28T02:34:27.027148
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_PROPERTY_ENUM_BIDI_MIRRORING_GLYPH_V1: &'static <icu::properties::provider::PropertyEnumBidiMirroringGlyphV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::pro

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<PropertyEnumBidiMirroringGlyphV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 4739B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_property_enum_bidi_mirroring_glyph_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_PROPERTY_ENUM_BIDI_MIRRORING_GLYPH_V1: &'static <icu::properties::provider::PropertyEnumBidiMirroringGlyphV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::provider::PropertyCodePointMap::CodePointTrie(unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 120832u32, shifted12_high_start: 30u16, index3_null_offset: 3u16, data_null_offset: 186u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Small }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0~\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xC0\0\xBA\0\xBA\0\xBA\0\xA5\x01\xBE\x01\xBE\x01\xBF\x01\xBE\x01\xBE\x01\xBE\x01\xDF\x01\0\0\x10\0 \x000\0@\0P\0`\0p\0~\0\x8E\0\x9E\0\xAE\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xC0\0\xD0\0\xE0\0\xF0\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xCA\0\xDA\0\xEA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xFE\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\x0B\x01\x16\x01\xBA\0\xBA\0\x1D\x01,\x01\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0<\x01\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0K\x01Z\x01j\x01v\x01\x84\x01\x92\x01\xA1\x01\xB1\x01\xC1\x01\xD1\x01\xDF\x01\xEF\x01\xFF\x01\x0F\x02\x1F\x02/\x02?\x02\xBA\0O\x02\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0Z\x02j\x02\xBA\0\xBA\0\xBA\0\xBA\0z\x02\x88\x02\x97\x02\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xA7\x02\xB7\x02\xC7\x02\xD7\x02\xE7\x02\xF7\x02\x06\x03\x12\x03 \x03*\x038\x03G\x03\xBA\0V\x03b\x03q\x03\x81\x03\x91\x03\xA1\x03\xB1\x03\xC1\x03\xD1\x03\xE0\x03\xEF\x03\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xFD\x03\x0C\x04\x1A\x04*\x04\xBA\0\xBA\x005\x04\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0B\x04R\x04\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0^\x04m\x04\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0u\x04\x7F\x04\xBA\0\x8E\x04\xBA\0\x9C\x04\xAC\x04\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xBA\0\xB1\x04\xBA\0\xBA\0\xBA\0\xB7\x04\xBA\0\xBA\0=\x01\xBA\0\xBA\0\xBA\0\xB3\x04\xBA\0\xBA\0\xBA\0\xB9\x04\xBA\0\xBA\0\xBA\0H\0T\0T\0T\0T\0T\0T\0d\0\x03\0\x03\0\x03\0\x84\0\x03\0\x03\0\x03\0\x03\0\xA1\0\xC1\0\x03\0\xD4\0\xF3\0\x13\x01\x03\x003\x01S\x01\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0n\x01\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x03\0\x85\x01\xEE\xFF") }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0)\0`(\0\xA0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0>\0 \0\0\0<\0 \0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\
```
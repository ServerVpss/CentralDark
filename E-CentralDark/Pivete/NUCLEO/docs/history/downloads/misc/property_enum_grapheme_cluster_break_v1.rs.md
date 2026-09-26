# OUTRO - property_enum_grapheme_cluster_break_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties_data-2.2.0\data\property_enum_grapheme_cluster_break_v1.rs.data
**SHA:** 31f29b18217ca19e
**Timestamp:** 2026-08-28T02:34:27.081525
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_PROPERTY_ENUM_GRAPHEME_CLUSTER_BREAK_V1: &'static <icu::properties::provider::PropertyEnumGraphemeClusterBreakV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties:

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<PropertyEnumGraphemeClusterBreakV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 7912B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_property_enum_grapheme_cluster_break_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_PROPERTY_ENUM_GRAPHEME_CLUSTER_BREAK_V1: &'static <icu::properties::provider::PropertyEnumGraphemeClusterBreakV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::provider::PropertyCodePointMap::CodePointTrie(unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 921600u32, shifted12_high_start: 225u16, index3_null_offset: 407u16, data_null_offset: 32u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Small }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0\x7F\0 \0 \0 \0 \0 \0 \0 \0 \0 \0\xBF\0\xCF\0 \0 \0 \0 \0\x0C\x01 \0 \0 \0;\x01y\x01\xB9\x01\xEE\x01 \0\x1F\x02P\x02\x85\x02\x9F\x02\xD0\x02\x0E\x03<\x03l\x03\xA2\x03\xDF\x03\x1E\x04]\x04\x9C\x04\xDB\x04\x1A\x05\xDB\x04Z\x05\x9A\x05\xDA\x05\x18\x06V\x06\x96\x06\xD5\x06\x14\x07S\x07\x93\x07\xD2\x07\x11\x08G\x08{\x08\xB6\x08\xC5\x08\x07\x01\x02\tB\t\x82\t\x14\x06\x8E\x06\xA7\x06\xB4\x06\xCD\x06\xED\x06\x08\x07 \x07?\x07\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06\xA7\x06_\x07\0\0\x10\0 \x000\0@\0P\0`\0p\0\x7F\0\x8F\0\x9F\0\xAF\0 \x000\0@\0P\0 \x000\0@\0P\0 \x000\0@\0P\0 \x000\0@\0P\0 \x000\0@\0P\0\xBF\0\xCF\0\xDF\0\xEF\0\xCF\0\xDF\0\xEF\0\xFF\0 \x000\0@\0P\0 \x000\0@\0P\0\x0C\x01\x1C\x01,\x01<\x01 \x000\0@\0P\0 \x000\0@\0P\0 \x000\0@\0P\0;\x01K\x01[\x01k\x01y\x01\x89\x01\x99\x01\xA9\x01\xB9\x01\xC9\x01\xD9\x01\xE9\x01\xEE\x01\xFE\x01\x0E\x02\x1E\x02 \x000\0@\0P\0\x1F\x02/\x02?\x02O\x02P\x02`\x02p\x02\x80\x02\x85\x02\x95\x02\xA5\x02\xB5\x02\x9F\x02\xAF\x02\xBF\x02\xCF\x02\xD0\x02\xE0\x02\xF0\x02\0\x03\x0E\x03\x1E\x03.\x03>\x03<\x03L\x03\\\x03l\x03l\x03|\x03\x8C\x03\x9C\x03\xA2\x03\xB2\x03\xC2\x03\xD2\x03\xDF\x03\xEF\x03\xFF\x03\x0F\x04\x1E\x04.\x04>\x04N\x04]\x04m\x04}\x04\x8D\x04\x9C\x04\xAC\x04\xBC\x04\xCC\x04\xDB\x04\xEB\x04\xFB\x04\x0B\x05\x1A\x05*\x05:\x05J\x05\xDB\x04\xEB\x04\xFB\x04\x0B\x05Z\x05j\x05z\x05\x8A\x05\x9A\x05\xAA\x05\xBA\x05\xCA\x05\xDA\x05\xEA\x05\xFA\x05\n\x06\x18\x06(\x068\x06H\x06V\x06f\x06v\x06\x86\x06\x96\x06\xA6\x06\xB6\x06\xC6\x06\xD5\x06\xE5\x06\xF5\x06\x05\x07\x14\x07$\x074\x07D\x07S\x07c\x07s\x07\x83\x07\x93\x07\xA3\x07\xB3\x07\xC3\x07\xD2\x07\xE2\x07\xF2\x07\x02\x08\x11\x08!\x081\x08A\x08G\x08W\x08g\x08w\x08{\x08\x8B\x08\x9B\x08\xAB\x08\xB6\x08\xC6\x08\xD6\x08\xE6\x08\xC5\x08\xD5\x08\xE5\x08\xF5\x08\x07\x01\x17\x01'\x017\x01\x02\t\x12\t\"\t2\tB\tR\tb\tr\t\x82\t\x92\t\xA2\t\xB2\t\x14\x06$\x064\x06D\x06 \0 \0\xB2\0\xC2\t \0\xD1\t\xFE\0H\x02\xE1\t\x11\x02 \0 \0 \0 \0 \0 \0\xF1\t\xF1\t\xF1\t\xF1\t\xF1\t\xF1\t\x01\n\x01\n\x01\n\x01\n\t\n\x11\n\x11\n\x11\n\x11\n\x11\n \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0\xB2\0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0!\n \0S\x03 \0>\x04 \0>\x04 \0 \0 \0-\n;\n\0\x03 \0 \0K\n \0 \0 \0 \0 \0 \0 \0;\x04 \0\x15\x02 \0 \0 \0 \0 \0 \0 \0Z\nj\n \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0v\n \0 \0 \0\x82\n\x90\n\x9D\n \0 \0 \0\xBF\0\xBF\0\xF1\0\xF3\0 \0\xDE\x03 \0 \0\xAD\n\xBB\n \0\xB4\0\xFB\0\xE0\x03 \0\xCA\n \0 \0 \0\xD8\n\xFB\0 \0 \0\xE8\n\xF4\n \0 \0 \0 \0 \0 \0 \0 \0 \0\x97\t\x04\x0B\r\x0B \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0\xBF\0\xBF\0\xBF\0\xBF\0\x17\x0B \0'\x0B \0 \0 \0\x0E\0 \0 \0 \0 \0 \0 \0\xBF\0\xBF\0\xFE\0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0\xB0\0\xFD\0 \0 \0 \0 \0 \0 \0 \0\xB0\0 \0 \0 \0 \0 \0 \0\xBF\0\xBF\0 \0 \0\xB5\0 \0 \0 \0 \0 \0 \x007\x04 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0\xB0\x007\x0B \0\xB1\0 \0 \0 \0 \0 \0\xFD\0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0 \0E\x0B \0R\x0B \0 \0 \0 \0 \0_\x04 \0 \0_\x0Bk\x0B \0\xBF\0o\x0B \0 \0\xB7\x08 \0\xB8\0~\x0B\xF1\t\x8E\x0B\xDF\x03 \0 \0\x9B\x0B\xFE\0 \0\x19\x02 \0 \0\xAB\x0B\xBA\x0B\xC7\x0B \0 \0\x
```
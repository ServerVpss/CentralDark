# OUTRO - property_enum_canonical_combining_class_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties_data-2.2.0\data\property_enum_canonical_combining_class_v1.rs.data
**SHA:** 5765699697c5c548
**Timestamp:** 2026-08-28T02:34:27.020070
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_PROPERTY_ENUM_CANONICAL_COMBINING_CLASS_V1: &'static <icu::properties::provider::PropertyEnumCanonicalCombiningClassV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::prope

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<PropertyEnumCanonicalCombiningClassV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 5452B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_property_enum_canonical_combining_class_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_PROPERTY_ENUM_CANONICAL_COMBINING_CLASS_V1: &'static <icu::properties::provider::PropertyEnumCanonicalCombiningClassV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::provider::PropertyCodePointMap::CodePointTrie(unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 125440u32, shifted12_high_start: 31u16, index3_null_offset: 336u16, data_null_offset: 0u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Small }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x80\0\xBD\0\0\0\0\0\0\0\0\0\xFA\0\0\0\0\0\0\0)\x01i\x01\x99\x01\xCE\x01\0\0\xFF\x01.\x02m\x02\0\0\x82\x02\xC0\x02\xEE\x02\x17\x03M\x03\x8D\x03\xCA\x03\x8D\x03\xFD\x03\x8D\x03<\x04\x8D\x03<\x04\x8D\x03<\x04\0\0<\x04\x8D\x03o\x04\x8D\x03<\x04\x86\x04<\x04\0\0\xC3\x04\xCE\x04\t\x05\x15\x05P\x05x\x05\xB2\x05\xF2\x05,\x06\xFB\x04\x14\x05!\x057\x05W\x05g\x05\x7F\x05\x9E\x05\0\0\x10\0 \x000\0@\0P\0`\0p\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\x80\0\x90\0\xA0\0\xB0\0\xBD\0\xCD\0\xDD\0\xED\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\xFA\0\n\x01\x1A\x01*\x01\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0)\x019\x01I\x01Y\x01i\x01y\x01\x89\x01\x99\x01\xA9\x01\xB9\x01\xC9\x01\xCE\x01\xDE\x01\xEE\x01\xFE\x01\0\0\x10\0 \x000\0\xFF\x01\x0F\x02\x1F\x02/\x02.\x02>\x02N\x02^\x02m\x02}\x02\x8D\x02\x9D\x02\0\0\x10\0 \x000\0\x82\x02\x92\x02\xA2\x02\xB2\x02\xC0\x02\xD0\x02\xE0\x02\xF0\x02\xEE\x02\xFE\x02\x0E\x03\x1E\x03\x17\x03'\x037\x03G\x03M\x03]\x03m\x03}\x03\x8D\x03\x9D\x03\xAD\x03\xBD\x03\xCA\x03\xDA\x03\xEA\x03\xFA\x03\x8D\x03\x9D\x03\xAD\x03\xBD\x03\xFD\x03\r\x04\x1D\x04-\x04\x8D\x03\x9D\x03\xAD\x03\xBD\x03<\x04L\x04\\\x04l\x04\x8D\x03\x9D\x03\xAD\x03\xBD\x03<\x04L\x04\\\x04l\x04\x8D\x03\x9D\x03\xAD\x03\xBD\x03<\x04L\x04\\\x04l\x04\0\0\x10\0 \x000\0<\x04L\x04\\\x04l\x04\x8D\x03\x9D\x03\xAD\x03\xBD\x03o\x04\x7F\x04\x8F\x04\x9F\x04\x8D\x03\x9D\x03\xAD\x03\xBD\x03<\x04L\x04\\\x04l\x04\x86\x04\x96\x04\xA6\x04\xB6\x04<\x04L\x04\\\x04l\x04\0\0\x10\0 \x000\0\xC3\x04\xD3\x04\xE3\x04\xF3\x04\xCE\x04\xDE\x04\xEE\x04\xFE\x04\t\x05\x19\x05)\x059\x05\x15\x05%\x055\x05E\x05P\x05`\x05p\x05\x80\x05x\x05\x88\x05\x98\x05\xA8\x05\xB2\x05\xC2\x05\xD2\x05\xE2\x05\xF2\x05\x02\x06\x12\x06\"\x06,\x06<\x06L\x06\\\x06\0\0\0\0\0\0e\x06\0\0\0\0\0\0\0\0%\x06\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0s\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xBD\x04\0\0\x06\x04\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0s\x06\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x81\x06\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x8B\x06\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x97\x06\0\0\0\0\0\0\0\0\n\x04\xA2\x06\0\0\0\0\0\0\xB2\x06\xC1\x06\xCC\x06\xDC\x06\0\0\0\0\0\0\0\0\xC5\x03\x06\x04\0\0\xE8\x06\xE9\0\0\0\0\0\xB7\x04\0\0\0\0\0\0\xC3\x03\xF8\x06\0\0\0\0\0\0\xC2\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x08\x07\x18\x07&\x07\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x006\x07F\x07\x80\0P\x07\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0`\x07o\x07\xEC\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0q\0\xEB\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xFB\x03\0\0\0\0\0\0\0\0\0\0\0\0\x80\0\x80\0\0\0\0\0\x7F\x07\0\0\0\0\0\0\0\0\0\0\0\0\x8F\x07\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0q\0\x9B\x07\0\0r\0\0\0\0\0\0\0\0\0\0\0\xEB\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x04\x04\0\0\xCB\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x06\x04\0\0\x80\0\xEB\0\0\0\0\0\xFC\x02\0\0\0\0\x07\x04\0\0\0\0\0\0\0\0\0\0\xC6\x03\n\x04\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xAB\x07\xBB\x07\0\0\0\0\x04\x04\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xCA\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xBD\x07\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xCD\x07\0\0\0\0\0\0\0\0\
```
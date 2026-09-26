# OUTRO - property_enum_numeric_type_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties_data-2.2.0\data\property_enum_numeric_type_v1.rs.data
**SHA:** a5513a89a04ff9f8
**Timestamp:** 2026-08-28T02:34:27.151454
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_PROPERTY_ENUM_NUMERIC_TYPE_V1: &'static <icu::properties::provider::PropertyEnumNumericTypeV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::provider::Property

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<PropertyEnumNumericTypeV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 5900B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_property_enum_numeric_type_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_PROPERTY_ENUM_NUMERIC_TYPE_V1: &'static <icu::properties::provider::PropertyEnumNumericTypeV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::provider::PropertyCodePointMap::CodePointTrie(unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 195072u32, shifted12_high_start: 48u16, index3_null_offset: 307u16, data_null_offset: 64u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Small }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0N\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\x10\0@\0\0\0@\0@\0@\x000\0@\0@\0@\0@\0@\0\n\0@\0\x8D\0@\0\n\0@\0\n\0@\0\xC7\0@\0\xFF\0@\x002\x01@\0\n\0@\0q\x01@\0\n\0@\0 \0@\0 \0\xAA\x01@\0@\0@\0\n\x08(\x08H\x08^\x08~\x08\x91\x08\xA9\x08\xC3\x08\xE3\x08\x01\t\xA9\x08\x13\t\0\0\x10\0 \x000\0@\0P\0`\0p\0N\0^\0n\0~\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0\x10\0 \x000\0@\0@\0P\0`\0p\0\0\0\x10\0 \x000\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\x000\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0\n\0\x1A\0*\0:\0@\0P\0`\0p\0\x8D\0\x9D\0\xAD\0\xBD\0@\0P\0`\0p\0\n\0\x1A\0*\0:\0@\0P\0`\0p\0\n\0\x1A\0*\0:\0@\0P\0`\0p\0\xC7\0\xD7\0\xE7\0\xF7\0@\0P\0`\0p\0\xFF\0\x0F\x01\x1F\x01/\x01@\0P\0`\0p\x002\x01B\x01R\x01b\x01@\0P\0`\0p\0\n\0\x1A\0*\0:\0@\0P\0`\0p\0q\x01\x81\x01\x91\x01\xA1\x01@\0P\0`\0p\0\n\0\x1A\0*\0:\0@\0P\0`\0p\0 \x000\0@\0P\0@\0P\0`\0p\0 \x000\0@\0P\0\xAA\x01\xBA\x01\xCA\x01\xDA\x01@\0P\0`\0p\0@\0P\0`\0p\0@\0P\0`\0p\0@\0@\0@\0@\x000\0@\0@\0@\0@\x000\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xE1\x01\xEF\x01@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0{\x01\x8C\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\x000\0\xD4\x01@\x000\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0*\0@\0@\0@\0@\0@\0@\0@\0@\0\xFF\x01@\0@\0@\0@\0@\0@\0@\0@\x000\x000\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\x000\0@\0@\0@\0@\0@\x000\0@\0@\0@\0@\x000\x000\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\x0F\x02\x1F\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0/\x02/\x02/\x02<\x02@\0@\0@\0@\0@\0@\0@\0L\x02X\x02e\x02t\x02@\0@\0@\0@\0\x80\x02\x8B\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0F\x02\x90\x02\x9D\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xA1\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xA7\x02@\0\xB6\x02\xC0\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xCE\x02@\0@\0@\0@\0@\0@\0\xD4\x01@\0\xAF\x02.\x02@\0@\0\xD4\x01@\0@\0.\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xD9\x02@\0@\0@\0@\0@\0@\0@\0\xDB\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xA4\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xA1\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xEB\x02@\0\xDA\x02@\0@\0\xA1\x02@\0@\0\xA2\x02\xF7\x02\xA2\x02z\x01\x8C\0z\x01\xA6\x02@\0\xA1\x02@\0@\0@\0@\0@\0@\0\x8C\0@\0@\0@\0@\0@\0@\0\xA5\x02@\0\xD8\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xDA\x02@\0@\0@\0\xD8\x02@\0\xFE\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\r\x03@\0@\0@\0@\0@\0@\0@\0\x1C\x03@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xA3\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0+\x03@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xA4\x02@\0@\0@\0@\0@\0@\0@\0{\x015\x03\x8C\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\x8C\0@\0D\x03@\0@\0@\0@\0\xA2\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0P\x03@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0D\x03@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xD8\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xD8\x02@\0@\0@\0@\0@\0@\0@\0D\x03@\0\xD9\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0\xA1\x02@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0D\x03\xDB\x02@\0@\0@\0@\0@\0@\0@\0\x8C\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0@\0D\x03@\0@\0@\0@\0@\0@\0@\0@\
```
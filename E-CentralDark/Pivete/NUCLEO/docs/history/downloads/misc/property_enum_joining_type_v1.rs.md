# OUTRO - property_enum_joining_type_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties_data-2.2.0\data\property_enum_joining_type_v1.rs.data
**SHA:** 7701f989754b91b1
**Timestamp:** 2026-08-28T02:34:27.124746
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_PROPERTY_ENUM_JOINING_TYPE_V1: &'static <icu::properties::provider::PropertyEnumJoiningTypeV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::provider::Property

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<PropertyEnumJoiningTypeV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 7136B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_property_enum_joining_type_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_PROPERTY_ENUM_JOINING_TYPE_V1: &'static <icu::properties::provider::PropertyEnumJoiningTypeV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::provider::PropertyCodePointMap::CodePointTrie(unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 918016u32, shifted12_high_start: 225u16, index3_null_offset: 385u16, data_null_offset: 0u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Small }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0S\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x93\0\xA3\0\0\0\0\0\0\0\0\0\xE0\0\0\0\0\0\0\0\x0F\x01M\x01}\x01\xBD\x01\xF5\x015\x02u\x02\xAA\x02\xEA\x02 \x03^\x03\x9E\x03\xDB\x03\x15\x04R\x04\x91\x04\xD0\x04\x0F\x05N\x05\x8D\x05N\x05\xCC\x05\x0C\x06J\x06\x88\x06\xC8\x06\x08\x07G\x07\x0C\x06\x81\x07\xA3\x07\xE2\x07!\x08W\x08n\x08\xA9\x08\xB8\x08\xDB\0\xF5\x08/\ti\t\xCB\x04\xE8\x05\x01\x06\x0E\x06$\x06D\x06_\x06w\x06\x96\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\x01\x06\xB6\x06\0\0\x10\0 \x000\0@\0P\0`\0p\0S\0c\0s\0\x83\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\x93\0\xA3\0\xB3\0\xC3\0\xA3\0\xB3\0\xC3\0\xD3\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\xE0\0\xF0\0\0\x01\x10\x01\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\x0F\x01\x1F\x01/\x01?\x01M\x01]\x01m\x01}\x01\x8D\x01\x9D\x01\xAD\x01\xBD\x01\xCD\x01\xDD\x01\xED\x01\xF5\x01\x05\x02\x15\x02%\x025\x02E\x02U\x02e\x02u\x02\x85\x02\x95\x02\xA5\x02\xAA\x02\xBA\x02\xCA\x02\xDA\x02\xEA\x02\xFA\x02\n\x03\x1A\x03 \x030\x03@\x03P\x03^\x03n\x03~\x03\x8E\x03\x9E\x03\xAE\x03\xBE\x03\xCE\x03\xDB\x03\xEB\x03\xFB\x03\x0B\x04\x15\x04%\x045\x04E\x04R\x04b\x04r\x04\x82\x04\x91\x04\xA1\x04\xB1\x04\xC1\x04\xD0\x04\xE0\x04\xF0\x04\0\x05\x0F\x05\x1F\x05/\x05?\x05N\x05^\x05n\x05~\x05\x8D\x05\x9D\x05\xAD\x05\xBD\x05N\x05^\x05n\x05~\x05\xCC\x05\xDC\x05\xEC\x05\xFC\x05\x0C\x06\x1C\x06,\x06<\x06J\x06Z\x06j\x06z\x06\x88\x06\x98\x06\xA8\x06\xB8\x06\xC8\x06\xD8\x06\xE8\x06\xF8\x06\x08\x07\x18\x07(\x078\x07G\x07W\x07g\x07w\x07\x0C\x06\x1C\x06,\x06<\x06\x81\x07\x91\x07\xA1\x07\xB1\x07\xA3\x07\xB3\x07\xC3\x07\xD3\x07\xE2\x07\xF2\x07\x02\x08\x12\x08!\x081\x08A\x08Q\x08W\x08g\x08w\x08\x87\x08n\x08~\x08\x8E\x08\x9E\x08\xA9\x08\xB9\x08\xC9\x08\xD9\x08\xB8\x08\xC8\x08\xD8\x08\xE8\x08\xDB\0\xEB\0\xFB\0\x0B\x01\xF5\x08\x05\t\x15\t%\t/\t?\tO\t_\ti\ty\t\x89\t\x99\t\xCB\x04\xDB\x04\xEB\x04\xFB\x04\0\0\0\0\x86\0\xA9\t\0\0\xB8\t\x80\0\xC5\t\xD3\ts\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x86\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xE1\t\0\0\xB1\x04\0\0\xB1\x04\0\0\xB1\x04\0\0\0\0\0\0\xED\t\x99\x08\xF7\t\0\0\0\0\x05\n\0\0\x0F\x02\x0F\x02\x0F\x02\x0F\x02\x0F\x02\x15\n \n\x0F\x02'\n\0\0\0\0\0\0\0\0\0\0\0\0\0\x007\nE\n\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0Q\n\0\0\0\0\0\0]\nk\nx\n\0\0\0\0\0\0\x93\0\x93\0\xC5\0\xC7\0\0\0\xCF\0\0\0\0\0\x88\n~\0\0\0\x88\0\xCF\0\xD1\0\0\0\x96\n\0\0\0\0\0\0\xA4\n\xD1\0\0\0\0\0\x87\0\xB3\n\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x004\x04\xC3\n\xCC\n\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x93\0\x93\0\x93\0\x93\0\xD6\n\0\0\xC3\x05\0\0\0\0\0\0\xE4\n\0\0\0\0\0\0\0\0\0\0\0\0\x93\0\x93\0\x80\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0q\0\xD1\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0q\0\0\0\0\0\0\0\0\0\0\0\0\0\x93\0\x93\0\0\0\0\0\xF4\n\0\0\0\0\0\0\0\0\0\0\0\0\xAA\x04\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0q\0\x04\x0B\0\0\x85\0\0\0\0\0\0\0\0\0\0\0\xD1\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x12\x0B\0\0\x1E\x0B\0\0\x0F\x02\x0F\x02\x0F\x02.\x0B\0\0\0\0\0\0\
```
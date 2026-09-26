# OUTRO - property_enum_indic_conjunct_break_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_properties_data-2.2.0\data\property_enum_indic_conjunct_break_v1.rs.data
**SHA:** f91f02d01919c15b
**Timestamp:** 2026-08-28T02:34:27.097346
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_PROPERTY_ENUM_INDIC_CONJUNCT_BREAK_V1: &'static <icu::properties::provider::PropertyEnumIndicConjunctBreakV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::pro

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<PropertyEnumIndicConjunctBreakV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 7228B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_property_enum_indic_conjunct_break_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_PROPERTY_ENUM_INDIC_CONJUNCT_BREAK_V1: &'static <icu::properties::provider::PropertyEnumIndicConjunctBreakV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::properties::provider::PropertyCodePointMap::CodePointTrie(unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 918016u32, shifted12_high_start: 225u16, index3_null_offset: 383u16, data_null_offset: 0u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Small }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x80\0\x90\0\0\0\0\0\0\0\0\0\xCD\0\0\0\0\0\0\0\xFC\0:\x01j\x01\x9F\x01\0\0\xD0\x01\xFF\x014\x02T\x01I\x02\x87\x02\xB5\x02\xDE\x02\x14\x03Q\x03\x90\x03\xD0\x03\x0F\x04N\x04\x8D\x04\xCC\x04\x0B\x05K\x05\x88\x05\xC6\x05\x04\x06D\x06\x83\x06\xC2\x06\x01\x07A\x07\x80\x07\xBF\x07\xF5\x07\x15\x08P\x08_\x08\xC8\0\x9C\x08\xD6\x08\x10\t\xC2\x05\xEA\x05\x03\x06\x10\x06&\x06F\x06a\x06y\x06\x98\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\xB8\x06\0\0\x10\0 \x000\0@\0P\0`\0p\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\x80\0\x90\0\xA0\0\xB0\0\x90\0\xA0\0\xB0\0\xC0\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\xCD\0\xDD\0\xED\0\xFD\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\xFC\0\x0C\x01\x1C\x01,\x01:\x01J\x01Z\x01j\x01z\x01\x8A\x01\x9A\x01\x9F\x01\xAF\x01\xBF\x01\xCF\x01\0\0\x10\0 \x000\0\xD0\x01\xE0\x01\xF0\x01\0\x02\xFF\x01\x0F\x02\x1F\x02/\x024\x02D\x02T\x02d\x02T\x01d\x01t\x01\x84\x01I\x02Y\x02i\x02y\x02\x87\x02\x97\x02\xA7\x02\xB7\x02\xB5\x02\xC5\x02\xD5\x02\xE5\x02\xDE\x02\xEE\x02\xFE\x02\x0E\x03\x14\x03$\x034\x03D\x03Q\x03a\x03q\x03\x81\x03\x90\x03\xA0\x03\xB0\x03\xC0\x03\xD0\x03\xE0\x03\xF0\x03\0\x04\x0F\x04\x1F\x04/\x04?\x04N\x04^\x04n\x04~\x04\x8D\x04\x9D\x04\xAD\x04\xBD\x04\xCC\x04\xDC\x04\xEC\x04\xFC\x04\x0B\x05\x1B\x05+\x05;\x05K\x05[\x05k\x05{\x05\x88\x05\x98\x05\xA8\x05\xB8\x05\xC6\x05\xD6\x05\xE6\x05\xF6\x05\x04\x06\x14\x06$\x064\x06D\x06T\x06d\x06t\x06\x83\x06\x93\x06\xA3\x06\xB3\x06\xC2\x06\xD2\x06\xE2\x06\xF2\x06\x01\x07\x11\x07!\x071\x07A\x07Q\x07a\x07q\x07\x80\x07\x90\x07\xA0\x07\xB0\x07\xBF\x07\xCF\x07\xDF\x07\xEF\x07\xF5\x07\x05\x08\x15\x08%\x085\x08E\x08P\x08`\x08p\x08\x80\x08_\x08o\x08\x7F\x08\x8F\x08\xC8\0\xD8\0\xE8\0\xF8\0\x9C\x08\xAC\x08\xBC\x08\xCC\x08\xD6\x08\xE6\x08\xF6\x08\x06\t\x10\t \t0\t@\t\xC2\x05\xD2\x05\xE2\x05\xF2\x05f\x03f\x03P\t_\t\0\0n\t}\t\x8C\t\x9A\t\xC2\x01\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0s\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xA9\t\0\0\xCC\x02\0\0\xB0\x03\0\0\xB0\x03f\x03f\x03f\x03\xB9\t@\x08\xC9\t\0\0\0\0\xD7\t\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xC8\x04\0\0\xC6\x01\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xE6\t\xF4\t\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\nf\x03f\x03f\x03\x10\n \n-\n\0\0\0\0\0\0\x80\0\x80\0\xB2\0\xB4\0\0\0<\nc\x03f\x03L\nZ\n\0\0u\0\xBC\0j\nf\x03y\n\x89\n\0\0\0\0\x97\n\xBC\0\0\0\0\0t\0\xA6\n\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x003\x03\xB6\n\xBF\n\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x80\0\x80\0\x80\0\x80\0\xC2\x01\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x80\0\x80\0\xBF\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0q\0\xBE\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0q\0\0\0\0\0\0\0\0\0\0\0\0\0\x80\0\x80\0\0\0\0\0v\0\0\0\0\0\0\0\0\0\0\0\0\0\xC4\x04\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0q\0\xCF\n\0\0r\0\0\0\0\0\0\0\0\0\0\0\xBE\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xDD\n\0\0\xE9\n\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xC9\x04\0\0\x80
```
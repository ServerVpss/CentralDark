# OUTRO - normalizer_nfkd_data_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_normalizer_data-2.2.0\data\normalizer_nfkd_data_v1.rs.data
**SHA:** 93166e5e5b09132c
**Timestamp:** 2026-08-28T02:34:22.441913
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_NORMALIZER_NFKD_DATA_V1: &'static <icu::normalizer::provider::NormalizerNfkdDataV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::normalizer::provider::DecompositionData {

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<NormalizerNfkdDataV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 51488B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_normalizer_nfkd_data_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_NORMALIZER_NFKD_DATA_V1: &'static <icu::normalizer::provider::NormalizerNfkdDataV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::normalizer::provider::DecompositionData { trie: unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 195584u32, shifted12_high_start: 48u16, index3_null_offset: 208u16, data_null_offset: 0u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Fast }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0`\0\xA0\0\xE0\0 \x01`\x01\x9C\x01\xDC\x01\0\0\x10\x02I\x02\x89\x02\xC9\x02\x08\x03>\x03~\x03\xB8\x03\xF5\x034\x04\0\0\0\0n\x04\xAE\x04\xDE\x04\x13\x05\0\0S\x05\x82\x05\xC1\x05\0\0\xD6\x05\x14\x06B\x06k\x06\xA1\x06\xE1\x06\x1E\x07>\x07}\x07\xBC\x07\xF9\x07\x18\x08U\x08>\x07\x8D\x08\xB9\x08\xF8\x08\x18\x080\t\x18\x08p\t\x87\t\xC6\t\0\0\xFC\t\x1C\nW\nd\n\x9F\n\xD3\n\x10\x0BP\x0B\x8A\x0B\xA4\x0B\0\0\xDF\x0B\xED\x0B\0\0*\x0C`\x0C\x9D\x0C\0\0\0\0\0\0\0\0\0\0\xC0\x0C\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xEC\x0C\0\0\0\0!\r\0\0\0\0?\r\0\0i\r\0\0\0\0\0\0\xA5\r\xC5\r\x05\x0ED\x0E~\x0E\xBE\x0E\xF2\x0E\x1E\x0F\x1D\x08\0\0\0\0R\x0F\x8C\x0F\xCC\x0F\x05\x10E\x10\x85\x10\xC5\x10\x05\x11E\x11\x85\x11\xC5\x11\x05\x12E\x12\x85\x12\xC4\x12\x04\x134\x13t\x13\xB4\x13\xF4\x13'\x14c\x14\xA2\x14\xE2\x14\x12\x15@\x15\0\0\0\0\0\0\0\0k\x15\xAB\x15\xEB\x15\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1F\x16,\x16\0\0c\x16\0\0\0\0\0\0\0\0\0\0\x80\x16\0\0\xAE\x0C\0\0\xBE\x16\0\0\xFE\x16\0\0\0\0>\x17^\x17\x9E\x17\xDE\x17\x1E\x18^\x18\x9E\x18\xD9\x18\x17\x19W\x19\x97\x19\xD7\x19\x17\x1A\0\0W\x1A\x97\x1A\xD7\x1A\x17\x1BW\x1B\x97\x1B\xD7\x1B\x17\x1C\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0W\x1C\x95\x1C\xB5\x1C\0\0\xE7\x1C\0\0\x18\x1DR\x1D\0\0\0\0z\x1D\xAC\x1D\xDA\x1D!\x08\xED\x1D\0\0\0\0\xFD\x1D=\x1E\0\0t\x1E\0\0F\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4\x1E\xB4
```
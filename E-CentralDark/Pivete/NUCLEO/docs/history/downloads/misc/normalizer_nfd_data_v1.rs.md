# OUTRO - normalizer_nfd_data_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_normalizer_data-2.2.0\data\normalizer_nfd_data_v1.rs.data
**SHA:** 2546d7b2105c6d3f
**Timestamp:** 2026-08-28T02:34:22.392952
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_NORMALIZER_NFD_DATA_V1: &'static <icu::normalizer::provider::NormalizerNfdDataV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::normalizer::provider::DecompositionData { t

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<NormalizerNfdDataV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 34912B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_normalizer_nfd_data_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_NORMALIZER_NFD_DATA_V1: &'static <icu::normalizer::provider::NormalizerNfdDataV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::normalizer::provider::DecompositionData { trie: unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 195584u32, shifted12_high_start: 48u16, index3_null_offset: 196u16, data_null_offset: 0u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Fast }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0\0\0\x80\0\xC0\0\xFF\0>\x01q\x01\xB1\x01\0\0\0\0\0\0\xF1\x011\x02p\x02\xA6\x02\xE6\x02 \x03]\x03\x9C\x03\0\0\0\0\xD6\x03\x16\x04F\x04{\x04\0\0\xBB\x04\xEA\x04)\x05\0\0>\x05|\x05\xAA\x05\xD3\x05\t\x06I\x06\x86\x06\xA6\x06\xE5\x06$\x07a\x07\x80\x07\xBD\x07\xA6\x06\xF5\x07!\x08`\x08\x80\x07\x98\x08\x80\x07\xD8\x08\xEF\x08.\t\0\0d\t\x84\t\xBF\t\xCB\t\x06\n.\nk\n\xAB\n\xE5\n\xFF\n\0\0:\x0B\0\0\0\0Y\x0B\x8F\x0B\xCC\x0B\0\0\0\0\0\0\0\0\0\0\xEF\x0B\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x1B\x0C\0\0\0\0P\x0C\0\0\0\0n\x0C\0\0\x98\x0C\0\0\0\0\0\0\xD4\x0C\xF4\x0C4\rs\r\xAD\r\xED\r!\x0EM\x0E\x85\x07\0\0\0\0\x81\x0E\0\0\0\0\0\0\xC1\x0E\x01\x0FA\x0F\x81\x0F\xC1\x0F\x01\x10A\x10\x81\x10\xC0\x10\0\x11\0\0\0\x000\x11a\x11\0\0\x8D\x11\xC0\x11\xFC\x11;\x12{\x12\xAB\x12\xD9\x12\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x04\x13\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xDD\x0B\0\0!\x13\0\0a\x13\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xA1\x13\xD5\x13\x13\x14S\x14\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x92\x14\xD0\x14\xF0\x14\0\0\0\0\0\0\0\0*\x15\0\0\0\0R\x15\x84\x15\xB2\x15\x89\x07\xC5\x15\0\0\0\0\xD5\x15\x15\x16\0\0\0\0\0\x003\x13U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x16U\x
```
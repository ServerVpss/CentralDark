# OUTRO - normalizer_nfd_supplement_v1.rs.data
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_normalizer_data-2.2.0\data\normalizer_nfd_supplement_v1.rs.data
**SHA:** 9e9cfb6e11480cd0
**Timestamp:** 2026-08-28T02:34:22.399509
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const SINGLETON_NORMALIZER_NFD_SUPPLEMENT_V1: &'static <icu::normalizer::provider::NormalizerNfdSupplementV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::normalizer::provider::NonRecurs

### Ouro Bruto (primeiros 5000 chars)
```
// @generated
/// Implement `DataProvider<NormalizerNfdSupplementV1>` on the given struct using the data
/// hardcoded in this file. This allows the struct to be used with
/// `icu`'s `_unstable` constructors.
///
/// Using this implementation will embed the following data in the binary's data segment:
/// * 4486B[^1] for the singleton data struct
///
/// [^1]: these numbers can be smaller in practice due to linker deduplication
///
/// This macro requires the following crates:
/// * `icu`
/// * `icu_provider`
/// * `zerovec`
#[doc(hidden)]
#[macro_export]
macro_rules! __impl_normalizer_nfd_supplement_v1 {
    ($ provider : ty) => {
        #[clippy::msrv = "1.86"]
        const _: () = <$provider>::MUST_USE_MAKE_PROVIDER_MACRO;
        #[clippy::msrv = "1.86"]
        impl $provider {
            #[doc(hidden)]
            pub const SINGLETON_NORMALIZER_NFD_SUPPLEMENT_V1: &'static <icu::normalizer::provider::NormalizerNfdSupplementV1 as icu_provider::DynamicDataMarker>::DataStruct = &icu::normalizer::provider::NonRecursiveDecompositionSupplement { trie: unsafe { icu::collections::codepointtrie::CodePointTrie::from_parts_unstable_unchecked_v1(icu::collections::codepointtrie::CodePointTrieHeader { high_start: 119296u32, shifted12_high_start: 30u16, index3_null_offset: 15u16, data_null_offset: 0u32, null_value: 0u32, trie_type: icu::collections::codepointtrie::TrieType::Small }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0@\0\0\0\0\0\0\0\0\0\0\0k\0\xA7\0\0\0\0\0\0\0\0\0\0\0\xD9\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x0E\x01\0\0\0\0\0\x001\x01\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x005\x01E\x01E\x01H\x01E\x01f\x01E\x01~\x01\0\0\x10\0 \x000\0@\0P\0`\0p\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0k\0{\0\x8B\0\x9B\0\xA7\0\xB7\0\xC7\0\xD7\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\xD9\0\xE9\0\xF9\0\t\x01\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\x0E\x01\x1E\x01.\x01>\x01\0\0\x10\0 \x000\0\0\0\x10\0 \x000\0\0\0\x10\0 \x000\x001\x01A\x01Q\x01a\x01i\x01u\x01\x83\x01\x93\x01\x9D\x01\xAD\x01\xBB\x01\xC5\x01\0\0\0\0\xD1\x01\xE1\x01\xF1\x01\x01\x02\x11\x02!\x02/\x02?\x02M\x02]\x02m\x02{\x02\x8B\x02\x9B\x02\xAB\x02\xBB\x02\xCB\x02\xDB\x02\xEA\x02\xFA\x02\n\x03\x1A\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0&\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\x004\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0=\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0M\x03\0\0\0\0\0\0\0\0R\x03b\x03\0\0\0\0\0\0H\0h\0\x84\0\x84\0\x84\0\x84\0\x98\0\x84\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\xB8\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\xD8\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\xEB\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\xFE\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x0F\0\x15\x01\xEE\xFF") }, unsafe { zerovec::ZeroVec::from_bytes_unchecked(b"\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xDC\0\x04\x03\xFC\0\x04\x03\xDC\0\x01\x03\xFC\0\x01\x03\xDC\0\x0C\x03\xFC\0\x0C\x03\xDC\0\0\x03\xFC\0\0\x03\0\0\0\0\xC4\0\x04\x03\xE4\0\x04\x03&\x02\x04\x03'\x02\x04\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xEA\x01\x04\x03\xEB\x01\x04\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\xC5\0\x01\x03\xE5\0\x01\x03\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0
```
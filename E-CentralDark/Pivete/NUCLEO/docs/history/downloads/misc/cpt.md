# OUTRO - cpt.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\icu_collections-2.2.0\tests\cpt.rs
**SHA:** b7c197cf138efa57
**Timestamp:** 2026-08-28T02:34:18.783626
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- high_start: code_point_trie_struct.high_start,
- shifted12_high_start: code_point_trie_struct.shifted12_high_start,
- let mut range_start: u32 = 0;
- let cpmr_start = cpm_range.range.start();
- range_start = range_limit;
- high_start: u32,
- shifted12_high_start: u16,
- high_start: test_struct.high_start,
- shifted12_high_start: test_struct.shifted12_high_start,

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

#![allow(dead_code)]

use icu_collections::codepointtrie::planes::get_planes_trie;
use icu_collections::codepointtrie::*;
use zerovec::ZeroVec;

#[test]
fn planes_trie_deserialize_check_test() {
    // Get expected planes trie from crate::planes::get_planes_trie()

    let exp_planes_trie = get_planes_trie();

    // Compute actual planes trie from planes.toml

    let planes_enum_prop =
        ::toml::from_str::<UnicodeEnumeratedProperty>(include_str!("data/cpt/planes.toml"))
            .unwrap();

    let code_point_trie_struct = planes_enum_prop.code_point_trie.trie_struct;

    let trie_header = CodePointTrieHeader {
        high_start: code_point_trie_struct.high_start,
        shifted12_high_start: code_point_trie_struct.shifted12_high_start,
        index3_null_offset: code_point_trie_struct.index3_null_offset,
        data_null_offset: code_point_trie_struct.data_null_offset,
        null_value: code_point_trie_struct.null_value,
        trie_type: TrieType::try_from(code_point_trie_struct.trie_type_enum_val).unwrap_or_else(
            |_| {
                panic!(
                    "Could not parse trie_type serialized enum value in test data file: {}",
                    code_point_trie_struct.name
                )
            },
        ),
    };

    let data = ZeroVec::from_slice_or_alloc(code_point_trie_struct.data_8.as_ref().unwrap());
    let index = ZeroVec::from_slice_or_alloc(&code_point_trie_struct.index);
    let trie_result = CodePointTrie::try_new(trie_header, index, data);
    let act_planes_trie = trie_result.unwrap();

    // Get check ranges (inversion map-style sequence of range+value) and
    // apply the trie validation test fn on expected and actual tries

    let serialized_ranges: Vec<(u32, u32, u32)> = planes_enum_prop.code_point_map.data.ranges;
    let mut check_ranges: Vec<u32> = vec![];
    for range_tuple in serialized_ranges {
        let range_end = range_tuple.1 + 1;
        let value = range_tuple.2;
        check_ranges.push(range_end);
        check_ranges.push(value);
    }

    check_trie(&act_planes_trie, &check_ranges);
    check_trie(&exp_planes_trie, &check_ranges);
}

#[test]
fn free_blocks_16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/free-blocks.16.toml"));
}

#[test]
fn free_blocks_32() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/free-blocks.32.toml"));
}

#[test]
fn free_blocks_8() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/free-blocks.8.toml"));
}

#[test]
fn free_blocks_small16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/free-blocks.small16.toml"));
}

#[test]
fn grow_data_16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/grow-data.16.toml"));
}

#[test]
fn grow_data_32() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/grow-data.32.toml"));
}

#[test]
fn grow_data_8() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/grow-data.8.toml"));
}

#[test]
fn grow_data_small16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/grow-data.small16.toml"));
}

#[test]
fn set1_16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set1.16.toml"));
}

#[test]
fn set1_32() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set1.32.toml"));
}

#[test]
fn set1_8() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set1.8.toml"));
}

#[test]
fn set1_small16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set1.small16.toml"));
}

#[test]
fn set2_overlap_16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set2-overlap.16.toml"));
}

#[test]
fn set2_overlap_32() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set2-overlap.32.toml"));
}

#[test]
fn set2_overlap_small16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set2-overlap.small16.toml"));
}

#[test]
fn set3_initial_9_16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set3-initial-9.16.toml"));
}

#[test]
fn set3_initial_9_32() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set3-initial-9.32.toml"));
}

#[test]
fn set3_initial_9_8() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set3-initial-9.8.toml"));
}

#[test]
fn set3_initial_9_small16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set3-initial-9.small16.toml"));
}

#[test]
fn set_empty_16() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set-empty.16.toml"));
}

#[test]
fn set_empty_32() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set-empty.32.toml"));
}

#[test]
fn set_empty_8() {
    run_deserialize_test_from_test_data(include_str!("data/cpt/set-empty.8.toml"));
}

#[test]
```